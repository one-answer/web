import { Context } from "hono";
import { BaseProps, DB, Post, Thread, User } from "./base";
import { Auth, Pagination } from "./core";
import { asc, eq, or, getTableColumns, and, sql } from 'drizzle-orm';
import { raw } from "hono/html";
import pListView from "../style/pList";
import { alias } from "drizzle-orm/sqlite-core";

export interface PListProps extends BaseProps {
    topic: { [x: string]: any; }
    page: number
    pagination: number[]
    data: { [x: string]: any; }[]
}

export default async function (a: Context) {
    const i = await Auth(a)
    const tid = parseInt(a.req.param('tid'))
    const topic = (await DB
        .select()
        .from(Thread)
        .where(eq(Thread.tid, tid))
    )?.[0]
    if (!topic) { return a.notFound() }
    const page = parseInt(a.req.param('page') ?? '0') || 1
    const uid = parseInt(a.req.query('uid') ?? '0')
    const QuotePost = alias(Post, 'QuotePost')
    const QuoteUser = alias(User, 'QuoteUser')
    const data = await DB
        .select({
            ...getTableColumns(Post),
            username: User.username,
            credits: User.credits,
            gid: User.gid,
            quote_content: QuotePost.content,
            quote_username: QuoteUser.username,
            count: sql`COUNT() OVER()`,
        })
        .from(Post)
        .where(and(
            or(and(eq(Post.tid, 0), eq(Post.pid, tid)), eq(Post.tid, tid)),
            (uid ? ((uid > 0) ? eq(Post.uid, uid) : or(eq(Post.uid, -uid), eq(Post.quote_uid, -uid))) : undefined),
        ))
        .leftJoin(User, eq(Post.uid, User.uid))
        .leftJoin(QuotePost, eq(Post.quote_pid, QuotePost.pid))
        .leftJoin(QuoteUser, eq(QuotePost.uid, QuoteUser.uid))
        .orderBy(asc(Post.tid), asc(Post.pid))
        .offset((page - 1) * 20)
        .limit(20)
    const pagination = Pagination(20, data ? (data?.[0]?.count as number ?? 0) : 0, page, 2)
    const title = raw(topic.subject)
    return a.html(pListView({ a, i, topic, page, pagination, data, title }));
}