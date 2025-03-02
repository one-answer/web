import { Context } from "hono";
import { Props, DB, Post, Thread, User } from "./base";
import { Auth, Config, Counter, Pagination } from "./core";
import { asc, eq, or, getTableColumns, and, ne } from 'drizzle-orm';
import { alias } from "drizzle-orm/sqlite-core";
import { raw } from "hono/html";
import { PList } from "../bare/PList";

export interface PListProps extends Props {
    thread: typeof Thread.$inferSelect
    uid: number
    page: number
    pagination: number[]
    data: (typeof Post.$inferSelect & {
        name: string | null;
        credits: number | null;
        gid: number | null;
        quote_content: string | null;
        quote_name: string | null;
    })[]
}

export async function pList(a: Context) {
    const i = await Auth(a)
    const tid = parseInt(a.req.param('tid'))
    const thread = (await DB
        .select()
        .from(Thread)
        .where(and(
            eq(Thread.tid, tid),
            eq(Thread.access, 0),
        ))
    )?.[0]
    if (!thread) { return a.notFound() }
    const page = parseInt(a.req.param('page') ?? '0') || 1
    const uid = parseInt(a.req.query('uid') ?? '0')
    const page_size_p = Config.get('page_size_p')
    const QuotePost = alias(Post, 'QuotePost')
    const QuoteUser = alias(User, 'QuoteUser')
    const data = await DB
        .select({
            ...getTableColumns(Post),
            name: User.name,
            credits: User.credits,
            gid: User.gid,
            quote_content: QuotePost.content,
            quote_name: QuoteUser.name,
        })
        .from(Post)
        .where(and(
            // access
            eq(Post.access, 0),
            // uid
            (uid ? eq(Post.uid, uid) : undefined),
            // tid - pid
            or(
                and(eq(Post.tid, 0), eq(Post.pid, tid)),
                eq(Post.tid, tid),
            ),
        ))
        .leftJoin(User, eq(Post.uid, User.uid))
        .leftJoin(QuotePost, and(ne(Post.quote_pid, Post.tid), eq(QuotePost.pid, Post.quote_pid), eq(QuotePost.access, 0)))
        .leftJoin(QuoteUser, eq(QuoteUser.uid, QuotePost.uid))
        .orderBy(asc(Post.pid))
        .offset((page - 1) * page_size_p)
        .limit(page_size_p)
    const pagination = Pagination(page_size_p, await Counter.get(uid, tid), page, 2)
    const title = raw(thread.subject)
    return a.html(PList({ a, i, thread, uid, page, pagination, data, title }));
}
