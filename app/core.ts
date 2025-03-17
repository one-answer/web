import { Context } from "hono";
import { sign, verify } from "hono/jwt";
import { getCookie, setCookie } from "hono/cookie";
import { DB, Conf, I, User } from "./base";
import { cookieReset } from "./uCore";
import { eq } from 'drizzle-orm';
import { Window } from "happy-dom";
import * as DOMPurify from 'isomorphic-dompurify';

export class DOM {
    public static window = new Window();
    public static document = this.window.document;
}

export class Maps {
    // 存储 map 的内存容器
    private static maps: Map<string, Map<any, any>> = new Map();
    // 创建一个新的 map，并保存到静态存储中
    static set<K, V>(name: string, entries?: [K, V][]): Map<K, V> {
        const map = new Map<K, V>(entries);
        this.maps.set(name, map);
        return map;
    }
    // 取出指定名称的 map 如果不存在则自动创建一个新的 map
    static get<K, V>(name: string): Map<K, V> {
        if (!this.maps.has(name)) {
            this.set<K, V>(name);
        }
        return this.maps.get(name) as Map<K, V>;
    }
    // 删除一个 map
    static del(name: string): boolean {
        return this.maps.delete(name);
    }
    // 列出所有 map 的名字
    static all(): string[] {
        return Array.from(this.maps.keys());
    }
}

export class Config {
    private static data = Maps.get<string, any>('Config');
    private static void = true;
    private constructor() { }
    static async init() {
        const configs = await DB.select().from(Conf);
        configs.forEach(({ key, value }) => {
            try {
                this.data.set(key, value ? JSON.parse(value) : null);
                this.void = false;
            } catch (error) {
                console.error(`Failed to parse config ${key}:`, error);
            }
        });
    }
    static async get<T>(key: string): Promise<T> {
        if (this.void) { await this.init(); }
        return this.data.get(key) as T;
    }
    static async set(key: string, value: any) {
        if (this.void) { await this.init(); }
        try {
            await DB
                .insert(Conf)
                .values({ key, value })
                .onConflictDoUpdate({
                    target: Conf.key,
                    set: { value }
                });
            this.data.set(key, value);
        } catch (error) {
            console.error(`Failed to set config ${key}:`, error);
        }
    }
}

export async function Auth(a: Context) {
    const jwt = getCookie(a, 'JWT');
    if (!jwt) { return undefined }
    try {
        const secret_key = await Config.get<string>('secret_key')
        let i = await verify(jwt, secret_key) as I
        if (!cookieReset(i.uid)) { return i } // 不要刷新时 直接返回用户
        const data = (await DB
            .select()
            .from(User)
            .where(eq(User.uid, i.uid))
        )?.[0]
        if (!data) { return undefined }
        const { hash, salt, ...iNew } = data
        setCookie(a, 'JWT', await sign(iNew, secret_key), { maxAge: 2592000 })
        cookieReset(i.uid, false) // 清除要刷新状态
        return iNew
    } catch (error) {
        return undefined
    }
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
    DOM.document.body.innerHTML = html
    let text = DOM.document.body.innerText
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
    DOM.document.body.innerHTML = html
    let text = DOM.document.body.innerText.split('\n')[0]
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
