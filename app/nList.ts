import { Context } from "hono";
import { Props, DB, Notice, Post, Thread } from "./data";
import { Auth, Config } from "./base";
import { eq, or, getTableColumns, and, desc, gt, lt } from 'drizzle-orm';
import { NList } from "../bare/NList";

export interface NListProps extends Props {
    page: number
    data: (typeof Notice.$inferSelect & {
        subject: string | null,
        content: string | null,
    })[]
}

export async function nList(a: Context, pivot: number, reverse: boolean = false) {
    const i = await Auth(a)
    if (!i) { return a.text('401', 401) }
    const page = parseInt(a.req.param('page') ?? '0') || 1
    const data = await DB
        .select({
            ...getTableColumns(Notice),
            thread_access: Thread.access,
            subject: Thread.subject,
            post_access: Post.access,
            content: Post.content,
        })
        .from(Notice)
        .where(and(
            eq(Notice.uid, i.uid),
            or(eq(Notice.unread, 1), eq(Notice.unread, 0)),
            pivot ? (reverse ?
                gt(Notice.last_pid, pivot) :
                lt(Notice.last_pid, pivot)
            ) : undefined,
        ))
        .leftJoin(Thread, eq(Notice.tid, Thread.tid))
        .leftJoin(Post, eq(Notice.last_pid, Post.pid))
        .orderBy(desc(Notice.uid), desc(Notice.unread), desc(Notice.last_pid))
        .limit(Config.get('page_size_n'))
    // 过滤掉已被删除的内容
    data.forEach(function (item) {
        if (item.thread_access) {
            item.subject = '...'
            item.content = '...'
        } else if (item.post_access) {
            item.content = '...'
        }
        return item
    })
    if (!data) { return a.notFound() }
    const title = '通知'
    return a.html(NList({ a, i, page, data, title }));
}

export async function nListInit(a: Context) {
    return await nList(a, 0)
}

export async function nListLessThan(a: Context) {
    return await nList(a, parseInt(a.req.param('pivot') ?? '0'))
}

export async function nListMoreThan(a: Context) {
    return await nList(a, parseInt(a.req.param('pivot') ?? '0'), true)
}