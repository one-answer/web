import { Context } from "hono";
import { BaseProps, DB, Notice, Post, Thread } from "./base";
import { Auth, Config } from "./core";
import { eq, or, getTableColumns, and, desc } from 'drizzle-orm';
import nListView from "../style/nList";

export interface NListProps extends BaseProps {
    page: number
    data: { [x: string]: any; }[]
}

export default async function (a: Context) {
    const i = await Auth(a)
    if (!i) { return a.text('401', 401) }
    const page = parseInt(a.req.param('page') ?? '0') || 1
    const data = await DB
        .select({
            ...getTableColumns(Notice),
            subject: Thread.subject,
            content: Post.content,
        })
        .from(Notice)
        .where(and(
            eq(Notice.uid, i.uid as number),
            or(
                eq(Notice.unread, 1),
                eq(Notice.unread, 0),
            ),
        ))
        .leftJoin(Thread, eq(Notice.tid, Thread.tid))
        .leftJoin(Post, eq(Notice.last_pid, Post.pid))
        .orderBy(desc(Notice.uid), desc(Notice.unread), desc(Notice.last_pid))
        .offset((page - 1) * Config.get('page_size_n'))
        .limit(Config.get('page_size_n'))
    if (!data) { return a.notFound() }
    const title = '通知'
    return a.html(nListView({ a, i, page, data, title }));
}