import { Context } from "hono";
import { sign, verify } from "hono/jwt";
import { getCookie, setCookie } from "hono/cookie";
import { DB, Conf, Notice, I, User } from "./data";
import { and, eq } from 'drizzle-orm';
import { Window } from "happy-dom";
import * as DOMPurify from 'isomorphic-dompurify';

export class Config {
    private static conf: { [key: string]: any } = {};
    private constructor() { }
    public static async init() {
        (await DB.select().from(Conf).all()).forEach(item => {
            Config.conf[item.key] = JSON.parse(item.value ?? 'null');
        });
    }
    public static get(key: string) {
        return Config.conf[key];
    }
}

export class Counter {
    private static counters: Map<number, number> = new Map();
    private constructor() { }
    public static get(key: number): number | undefined {
        return Counter.counters.get(key);
    }
    public static set(key: number, val: number): number {
        Counter.counters.set(key, val);
        return val;
    }
    public static del(key: number) {
        Counter.counters.delete(key);
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
    // 无提醒:1 有提醒:2 要刷新:10
    const counter = Counter.get(uid);
    const noreset = (counter ?? 0) < 10;
    if (status == undefined) {
        return counter ?? Counter.set(uid, (await DB
            .select({ unread: Notice.unread })
            .from(Notice)
            .where(and(
                eq(Notice.uid, uid),
                eq(Notice.unread, 1),
            ))
            .limit(1)
        )?.[0]?.unread ?? 0)
    } else if (status == null) {
        Counter.del(uid)
    } else if (status == 0) {
        if (noreset) {
            Counter.set(uid, 0)
        } else {
            Counter.set(uid, 10)
        }
    } else if (status == 1) {
        if (noreset) {
            Counter.set(uid, 1)
        } else {
            Counter.set(uid, 11)
        }
    } else if (status == 10 && noreset) {
        Counter.set(uid, (counter ?? 0) + 10)
    } else if (status == 20 && !noreset) {
        Counter.set(uid, counter! - 10)
    }
    return 0;
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