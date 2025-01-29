import { Context } from "hono";
import { DB, Post } from "./data";
import { count, eq, or, and, lte, desc } from 'drizzle-orm';
import { Config } from "./base";

export async function pJump(a: Context) {
    const uid = parseInt(a.req.query('uid') ?? '0')
    const tid = parseInt(a.req.query('tid') ?? '0')
    const pid = parseInt(a.req.query('pid') ?? '0')
    const unread = parseInt(a.req.query('unread') ?? '0')
    const skip = (await DB
        .select({
            count: count(),
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
                and(eq(Post.tid, tid), lte(Post.pid, pid))
            ),
        ))
        .orderBy(desc(Post.tid), desc(Post.pid))
    )?.[0]?.count ?? 0
    const page = Math.ceil((unread ? skip + 1 : skip) / Config.get('page_size_p')) || 1
    return a.redirect('/t/' + tid + '/' + page + '?uid=' + uid + '&pid=' + pid + '#p' + pid)
}