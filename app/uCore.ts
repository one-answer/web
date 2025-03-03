import { and, eq, count } from "drizzle-orm";
import { DB, Message } from "./base";
import { Maps } from "./core";

// 用户上次发帖时间（防止频繁发帖）
export function lastPostTime(uid: number, time: number = 0) {
    const map = Maps.get<number, number>('UserLastPostTime');
    if (time) {
        map.set(uid, time);
        return time;
    } else {
        return (map.get(uid) || 0);
    }
}

// 用户未读回复计数
export async function unreadReply(uid: number, change: number = 0) {
    const map = Maps.get<number, number>('unreadReply');
    let sum = map.get(uid);
    if (sum === undefined) {
        sum = (await DB
            .select({ count: count(Message.pid) })
            .from(Message)
            .where(and(
                eq(Message.uid, uid),
                eq(Message.type, 1),
            ))
            .limit(1)
        )?.[0].count || 0;
    }
    if (change) {
        sum += change;
    }
    return sum;
}
