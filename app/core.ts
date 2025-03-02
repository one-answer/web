import { Context } from "hono";
import { sign, verify } from "hono/jwt";
import { getCookie, setCookie } from "hono/cookie";
import { DB, Conf, I, User, Thread, Post, Message } from "./base";
import { and, count, eq, or } from 'drizzle-orm';
import { Window } from "happy-dom";
import * as DOMPurify from 'isomorphic-dompurify';

export class Config {
    private static data: Map<string, any> = new Map();
    private constructor() { }
    static async init() {
        const configs = await DB.select().from(Conf);
        configs.forEach(({ key, value }) => {
            try {
                this.data.set(key, value ? JSON.parse(value) : null);
            } catch (error) {
                console.error(`Failed to parse config ${key}:`, error);
                this.data.set(key, value);
            }
        });
        console.log('Loaded configs:', Object.fromEntries(this.data));
    }
    static get(key: string): any {
        const value = this.data.get(key);
        console.log(`Getting config ${key}:`, value);
        return value;
    }
}

export class Counter {
    // uid=0,tid=0,全局帖子数
    // uid=0,tid=*,某帖回复数
    // uid=*,tid=0,用户帖子数
    // uid=*,tid=*,用户在某贴回复数
    private static data: Map<bigint, number> = new Map();
    private constructor() { }
    private static big(uid: number, tid: number): bigint {
        const view = new DataView(new ArrayBuffer(8));
        // false = 大端序 Big-Endian
        view.setUint32(0, uid, false);
        view.setUint32(4, tid, false);
        return view.getBigUint64(0, false);
    }
    public static async get(uid: number, tid: number): Promise<number> {
        const key = this.big(uid, tid);
        let val = this.data.get(key);
        if (val) { return val; };
        // 如果没有数据则执行SQL查询
        if (uid && tid) {
            val = (await DB
                .select({ count: count(Post.pid) })
                .from(Post)
                .where(and(
                    eq(Post.access, 0),
                    eq(Post.uid, uid),
                    or(
                        and(eq(Post.tid, 0), eq(Post.pid, tid)),
                        eq(Post.tid, tid),
                    )
                ))
            )[0].count
        } else if (tid) {
            val = (await DB
                .select({ count: count(Post.pid) })
                .from(Post)
                .where(and(
                    eq(Post.access, 0),
                    or(
                        and(eq(Post.tid, 0), eq(Post.pid, tid)),
                        eq(Post.tid, tid),
                    )
                ))
            )[0].count
        } else if (uid) {
            val = (await DB
                .select({ count: count(Thread.tid) })
                .from(Thread)
                .where(and(
                    eq(Thread.access, 0),
                    eq(Thread.uid, uid),
                ))
            )[0].count
        } else {
            val = (await DB
                .select({ count: count(Thread.tid) })
                .from(Thread)
                .where(eq(Thread.access, 0))
            )[0].count
        }
        this.data.set(key, val);
        return val;
    }
    public static async add(uid: number, tid: number): Promise<number> {
        const val = await this.get(uid, tid) + 1;
        this.data.set(this.big(uid, tid), val);
        return val;
    }
    public static async sub(uid: number, tid: number): Promise<number> {
        const val = await this.get(uid, tid) - 1;
        this.data.set(this.big(uid, tid), val);
        return val;
    }
    public static del(uid: number, tid: number) {
        this.data.delete(this.big(uid, tid));
    }
}

export class Cache {
    // 正数：用户状态 负数：用户上次发帖时间（防止频繁发帖）
    private static data: Map<number, number> = new Map();
    private constructor() { }
    public static get(key: number): number | undefined {
        return this.data.get(key);
    }
    public static set(key: number, val: number): number {
        this.data.set(key, val);
        return val;
    }
    public static del(key: number) {
        this.data.delete(key);
    }
}

export async function Auth(a: Context) {
    const jwt = getCookie(a, 'JWT');
    if (!jwt) { return undefined }
    try {
        let i = await verify(jwt, Config.get('secret_key')) as I
        if (await Status(i.uid) < 10) { return i }
        const data = (await DB
            .select()
            .from(User)
            .where(eq(User.uid, i.uid))
        )?.[0]
        if (!data) { return undefined }
        const { hash, salt, ...iNew } = data
        setCookie(a, 'JWT', await sign(iNew, Config.get('secret_key')), { maxAge: 2592000 })
        Status(i.uid, 20)
        return iNew
    } catch (error) {
        return undefined
    }
}

export async function Status(uid: number, status: 0 | 1 | 10 | 20 | null | undefined = undefined) {
    // 无提醒:0 有提醒:1 要刷新:10 已刷新:20 null:从用户缓存中清除要刷新状态
    const cache = Cache.get(uid);
    const noreset = (cache ?? 0) < 10;
    if (status == undefined) {
        return cache ?? Cache.set(uid, (await DB
            .select()
            .from(Message)
            .where(and(
                eq(Message.uid, uid),
                eq(Message.type, 1),
            ))
            .limit(1)
        )?.[0] ? 1 : 0)
    } else if (status == null) {
        Cache.del(uid)
    } else if (status == 0) {
        if (noreset) {
            Cache.set(uid, 0)
        } else {
            Cache.set(uid, 10)
        }
    } else if (status == 1) {
        if (noreset) {
            Cache.set(uid, 1)
        } else {
            Cache.set(uid, 11)
        }
    } else if (status == 10 && noreset) {
        Cache.set(uid, (cache ?? 0) + 10)
    } else if (status == 20 && !noreset) {
        Cache.set(uid, cache! - 10)
    }
    return 0;
}

export function IsAdmin(i: I, allow: any, disallow: any) {
    // 是否拥有管理权限 是则返回 allow 否则返回 disallow
    if ([1].includes(i.gid)) {
        return allow;
    } else {
        return disallow;
    }
}

export function Pagination(perPage: number, sum: number, page: number, near: number) {
    if (!page) { page = 1 }
    // 首页
    const navigation = [1]
    const maxPage = Math.floor((sum + perPage - 1) / perPage)
    if (page <= 1 + near) {
        // 首页邻页
        const edge = 1 + near * 2
        for (let p = 2; p <= edge && p < maxPage; p++) {
            navigation.push(p)
        }
        if (edge < maxPage - 1) {
            navigation.push(0)
        }
    } else if (page >= maxPage - near) {
        // 尾页邻页
        const edge = maxPage - near * 2
        if (edge > 2) {
            navigation.push(0)
        }
        for (let p = edge; p < maxPage; p++) {
            if (p > 1) {
                navigation.push(p)
            }
        }
    } else {
        // 非首尾页
        if (page - near > 2) {
            navigation.push(0)
        }
        for (let p = page - near; p <= page + near; p++) {
            navigation.push(p)
        }
        if (page + near < maxPage - 1) {
            navigation.push(0)
        }
    }
    // 尾页
    if (maxPage > 1) {
        navigation.push(maxPage)
    }
    return navigation
}

export function HTMLFilter(html: string) {
    DOMPurify.addHook('afterSanitizeElements', function (node) {
        if (!node.textContent?.trim() && !node.hasChildNodes() && node.parentNode) {
            node.parentNode.removeChild(node);
            return;
        }
    });
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['a', 'b', 'i', 'u', 'font', 'strong', 'em', 'strike', 'span', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot', 'caption', 'ol', 'ul', 'li', 'dl', 'dt', 'dd', 'menu', 'multicol', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'p', 'div', 'pre', 'br', 'img', 'video', 'audio', 'code', 'blockquote', 'iframe', 'section'],
        ALLOWED_ATTR: ['target', 'href', 'src', 'alt', 'rel', 'width', 'height', 'size', 'border', 'align', 'colspan', 'rowspan', 'cite'],
    })
}

export function HTMLText(html: string | null, len = 0) {
    if (!html) {
        return '...'
    }
    let text = DOMPurify.sanitize(html, { ALLOWED_TAGS: ['#text'] })
    if (len > 0) {
        const lenOld = text.length
        if (lenOld > len) {
            text = text.slice(0, len - 3) + '...'
        }
    }
    return text
}

export function HTMLSubject(html: string | null, len = 0) {
    if (!html) {
        return '...'
    }
    const document = new Window().document
    document.body.innerHTML = html
    let text = document.body.innerText.split('\n')[0]
    if (len > 0) {
        const lenOld = text.length
        if (lenOld > len) {
            text = text.slice(0, len - 3) + '...'
        }
    }
    return text
}

export function URLQuery(a: Context) {
    const allow = ['uid', 'pid'];
    const query = new URLSearchParams();
    Object.entries(a.req.query()).forEach(([key, val]) => {
        if (allow.includes(key)) {
            query.append(key, val);
        }
    });
    return query.size ? '?' + query.toString() : '';
}