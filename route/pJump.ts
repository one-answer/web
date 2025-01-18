import { Context } from "hono";
import { DB, Post } from "./base";
import { asc, count, eq, or, and, lte } from 'drizzle-orm';
import { Config } from "./core";

export default async function (a: Context) {
    const uid = parseInt(a.req.query('uid') ?? '0')
    const tid = parseInt(a.req.query('tid') ?? '0')
    const pid = parseInt(a.req.query('pid') ?? '0')
    const data = (await DB
        .select({
            count: count(),
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
                lte(Post.pid, pid),
            )
        )
        .orderBy(asc(Post.tid), asc(Post.pid))
    )?.[0]?.count ?? 0
    const page = Math.ceil(data / Config.get('p_per_page')) || 1
    return a.redirect('/t/' + tid + '/' + page + '?uid=' + uid + '#p' + pid)
}