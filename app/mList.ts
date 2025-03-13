import { Context } from "hono";
import { DB, Message, Post, User, Thread } from "./base";
import { Auth } from "./core";
import { and, asc, eq, gt, inArray } from 'drizzle-orm';
import { alias } from "drizzle-orm/sqlite-core";
import { mRead } from "./mCore";

export async function _mList(a: Context) {
    const i = await Auth(a)
    if (!i) { return a.text('401', 401) }
    const type = a.req.queries('type')?.map(Number).filter(n => !isNaN(n)) ?? [];
    const time = parseInt(a.req.query('time') ?? '0');
    const QuotePost = alias(Post, 'QuotePost')
    const data = await DB
        .select({
            type: Message.type,
            time: Message.time,
            pid: Message.pid,
            content: Post.content,
            uid: Post.uid,
            name: User.name,
            tid: Post.tid,
            subject: Thread.subject,
            quote_pid: QuotePost.pid,
            quote_content: QuotePost.content,
        })
        .from(Message)
        .where(and(
            eq(Message.uid, i.uid),
            inArray(Message.type, type),
            time ? gt(Message.time, time) : undefined,
        ))
        .leftJoin(Post, eq(Post.pid, Message.pid))
        .leftJoin(QuotePost, eq(QuotePost.pid, Post.quote_pid))
        .leftJoin(User, eq(User.uid, Post.uid))
        .leftJoin(Thread, eq(Thread.tid, Post.tid))
        .orderBy(asc(Message.time))
        .limit(10)
    // 将已加载消息标记为已读
    data.forEach(function (row) {
        if (row.type > 0) {
            mRead(i.uid, row.type, row.time, row.pid)
        }
    })
    return a.json(data)
}
