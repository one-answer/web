import { Context } from "hono";
import { Props, DB, Notice, Post, Thread, User } from "./data";
import { Auth, Config, Status } from "./base";
import { asc, eq, or, getTableColumns, and, sql, lte, lt, gt } from 'drizzle-orm';
import { alias } from "drizzle-orm/sqlite-core";
import { raw } from "hono/html";
import { PList } from "../bare/PList";

export interface PListProps extends Props {
    topic: typeof Thread.$inferSelect
    pid: number
    data: (typeof Post.$inferSelect & {
        name: string | null;
        credits: number | null;
        gid: number | null;
        quote_content: string | null;
        quote_name: string | null;
        count: number;
    })[]
}

export async function pList(a: Context, pivot: number, reverse: boolean = false) {
    const i = await Auth(a)
    const tid = parseInt(a.req.param('tid'))
    const topic = (await DB
        .select()
        .from(Thread)
        .where(and(
            eq(Thread.tid, tid),
            eq(Thread.access, 0),
        ))
    )?.[0]
    if (!topic) { return a.notFound() }
    const uid = parseInt(a.req.query('uid') ?? '0')
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
            count: sql<number>`COUNT() OVER()`,
        })
        .from(Post)
        .where(and(
            // access
            eq(Post.access, 0),
            // uid | quote_uid
            (uid ?
                ((uid > 0) ? eq(Post.uid, uid) : or(eq(Post.uid, -uid), eq(Post.quote_uid, -uid)))
                : undefined
            ),
            // tid - pid
            or(
                and(eq(Post.tid, 0), eq(Post.pid, tid)),
                eq(Post.tid, tid),
            ),
            pivot ? (reverse ?
                lt(Post.pid, pivot) :
                gt(Post.pid, pivot)
            ) : undefined,
        ))
        .leftJoin(User, eq(Post.uid, User.uid))
        .leftJoin(QuotePost, and(eq(Post.quote_pid, QuotePost.pid), eq(QuotePost.access, 0)))
        .leftJoin(QuoteUser, and(eq(QuotePost.uid, QuoteUser.uid), eq(QuotePost.access, 0)))
        .orderBy(asc(Post.tid), asc(Post.pid))
        .limit(Config.get('page_size_p'))
    if (i && a.req.query('pid')) {
        const page_pid = data.at(-1)?.pid ?? 0
        const notice = (await DB
            .update(Notice)
            .set({
                read_pid: page_pid,
                unread: sql`CASE WHEN ${Notice.last_pid} <= ${page_pid} THEN 0 ELSE 1 END`,
            })
            .where(
                and(
                    eq(Notice.tid, topic.tid),
                    eq(Notice.uid, i.uid),
                    lte(Notice.read_pid, page_pid),
                )
            )
            .returning()
        )?.[0]
        if (notice && !notice.unread) {
            Status(i.uid, 0)
        }
    }
    const title = raw(topic.subject)
    const pid = parseInt(a.req.query('pid') ?? 'Infinity')
    return a.html(PList({ a, i, topic, data, title, pid }));
}

export async function pListInit(a: Context) {
    return await pList(a, 0)
}

export async function pListMoreThan(a: Context) {
    return await pList(a, parseInt(a.req.param('pivot') ?? '0'))
}

export async function pListLessThan(a: Context) {
    return await pList(a, parseInt(a.req.param('pivot') ?? '0'), true)
}