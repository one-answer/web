import { Context } from "hono";
import { BaseProps, DB, Notice, Post, Thread, User } from "./base";
import { Auth, Config, Pagination, User_Notice } from "./core";
import { asc, eq, or, getTableColumns, and, sql, lte } from 'drizzle-orm';
import { raw } from "hono/html";
import pListView from "../style/pList";
import { alias } from "drizzle-orm/sqlite-core";

export interface PListProps extends BaseProps {
    topic: { [x: string]: any; }
    pid: number
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
        .where(
            and(
                or(
                    and(
                        eq(Post.tid, 0),
                        eq(Post.pid, tid),
                    ),
                    eq(Post.tid, tid),
                ),
                (uid ?
                    ((uid > 0) ? eq(Post.uid, uid) : or(eq(Post.uid, -uid), eq(Post.quote_uid, -uid)))
                    : undefined
                ),
            )
        )
        .leftJoin(User, eq(Post.uid, User.uid))
        .leftJoin(QuotePost, eq(Post.quote_pid, QuotePost.pid))
        .leftJoin(QuoteUser, eq(QuotePost.uid, QuoteUser.uid))
        .orderBy(asc(Post.tid), asc(Post.pid))
        .offset((page - 1) * Config.get('page_size_p'))
        .limit(Config.get('page_size_p'))
    if (i && a.req.query('pid')) {
        const page_pid = data.at(-1)?.pid ?? 0
        const notice = (await DB.update(Notice)
            .set({
                read_pid: page_pid,
                unread: sql`CASE WHEN ${Notice.last_pid} <= ${page_pid} THEN 0 ELSE 1 END`,
            })
            .where(
                and(
                    eq(Notice.uid, i.uid),
                    eq(Notice.tid, topic.tid),
                    lte(Notice.read_pid, page_pid)
                )
            )
            .returning()
        )?.[0]
        if (notice && !notice.unread) {
            User_Notice(i.uid, 0)
        }
    }
    const pagination = Pagination(Config.get('page_size_p'), data ? (data?.[0]?.count as number ?? 0) : 0, page, 2)
    const title = raw(topic.subject)
    const pid = parseInt(a.req.query('pid') ?? '0')
    return a.html(pListView({ a, i, topic, page, pagination, data, title, pid }));
}