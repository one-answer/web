import { getCookie } from "hono/cookie";
import { DB, Conf, User } from "./base";
import { JWTSecretKey } from "../config";
import { Context } from "hono";
import { verify } from "hono/jwt";
import { eq } from 'drizzle-orm';
import * as DOMPurify from 'isomorphic-dompurify';

export class Config {
    private static conf: { [key: string]: any } = {};
    private constructor() { }
    public static init() {
        DB.select().from(Conf).all().forEach(item => {
            Config.conf[item.key] = JSON.parse(item.value ?? 'null');
        });
    }
    public static get(key: string) {
        return Config.conf[key];
    }
}

export class Counter {
    private static counters: Map<string, number> = new Map();
    private constructor() { }
    public static get(name: string): number | null {
        return Counter.counters.get(name) ?? null;
    }
    // 设置计数器值
    public static set(name: string, value: number): number {
        Counter.counters.set(name, value);
        return value
    }
}

/*
export async function User_Notices(uid: number, set: number | null = null) {
    const key = 'User_Notices_' + uid
    if (set !== null) {
        return Counter.set(key, (await DB
            .update(User)
            .set({ notices: set })
            .where(eq(User.uid, uid))
            .returning({ notices: User.notices })
        )?.[0].notices)
    }
    if (Counter.get(key) === null) {
        return Counter.set(key, (await DB
            .select({ notices: User.notices })
            .from(User)
            .where(eq(User.uid, uid))
        )?.[0].notices)
    }
    return Counter.get(key) ?? 0
}
*/

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

export async function Auth(a: Context) {
    const jwt = getCookie(a, 'JWT');
    if (!jwt) { return false }
    try {
        return await verify(jwt, JWTSecretKey)
    } catch (error) {
        return false
    }
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

export function HTMLText(html: string, len = 0) {
    let text = DOMPurify.sanitize(html, { ALLOWED_TAGS: ['#text'] })
    if (len > 0) {
        const lenOld = text.length
        if (lenOld > len) {
            text = text.slice(0, len - 3) + '...'
        }
    }
    return text
}
