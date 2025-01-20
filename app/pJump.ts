import { Context } from "hono";
import { DB, Post } from "./data";
import { asc, count, eq, or, and, lte } from 'drizzle-orm';
import { Config } from "./base";

export async function pJump(a: Context) {
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
    const page = Math.ceil(data / Config.get('page_size_p')) || 1
    return a.redirect('/t/' + tid + '/' + page + '?uid=' + uid + '&pid=' + pid + '#p' + pid)
}