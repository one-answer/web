import { Context } from "hono";
import { html } from "hono/html";
import { and, eq, gt, sql } from "drizzle-orm";
import { DB, Post, Thread, User } from "./base";
import { Auth, Counter, HTMLFilter } from "./core";

export async function pEditData(a: Context) {
    const i = await Auth(a)
    if (!i) { return a.text('401', 401) }
    const time = Math.floor(Date.now() / 1000)
    const body = await a.req.formData()
    const eid = parseInt(a.req.param('eid') ?? '0')
    if (eid < 0) {
        const content = HTMLFilter(body.get('content')?.toString() ?? '')
        if (!content) { return a.text('406', 406) }
        const post = (await DB
            .update(Post)
            .set({
                content: content,
            })
            .where(and(eq(Post.pid, -eid), eq(Post.uid, i.uid as number)))
            .returning()
        )?.[0]
        // 如果帖子找不到 或不是作者 则禁止编辑
        if (!post) { return a.text('403', 403) }
        if (!post.tid) {
            const subject = html`${body.get('subject')?.toString() ?? ''}`.toString()
            if (!subject) { return a.text('406', 406) }
            await DB.update(Thread)
                .set({
                    subject: subject,
                })
                .where(eq(Thread.tid, post.pid))
        }
        return a.text('ok')
    } else if (eid > 0) {
        const post = (await DB
            .select()
            .from(Post)
            .where(eq(Post.pid, eid))
        )?.[0]
        if (!post) { return a.text('401', 401) }
        const content = HTMLFilter(body.get('content')?.toString() ?? '')
        if (!content) { return a.text('406', 406) }
        const thread = (await DB
            .update(Thread)
            .set({
                posts: sql`${Thread.posts}+1`,
                last_uid: i.uid as number,
                last_date: sql`CASE WHEN ${time} - ${Thread.create_date} < 604800 THEN ${time} ELSE ${Thread.last_date} END`,
            })
            .where(and(
                eq(Thread.tid, post.tid ? post.tid : post.pid),
                gt(sql`${Thread.create_date} + 604800`, time),
            ))
            .returning({ tid: Thread.tid }))?.[0]
        // 如果帖子找不到 也禁止回复 太旧的帖子也禁止回复
        if (!thread) { return a.text('403', 403) }
        await DB
            .insert(Post)
            .values({
                tid: post.tid ? post.tid : post.pid,
                uid: i.uid as number,
                create_date: time,
                quote_pid: post.tid ? post.pid : 0,
                content: content,
            })
        await DB
            .update(User)
            .set({
                posts: sql`${User.posts} + 1`,
                credits: sql`${User.credits} + 1`,
                golds: sql`${User.golds} + 1`,
            })
            .where(eq(User.uid, i.uid as number))
        return a.text('ok') //! 返回tid/pid和posts数量
    } else {
        const subject = html`${body.get('subject')?.toString() ?? ''}`.toString()
        if (!subject) { return a.text('406', 406) }
        const content = HTMLFilter(body.get('content')?.toString() ?? '')
        if (!content) { return a.text('406', 406) }
        const post = (await DB
            .insert(Post)
            .values({
                uid: i.uid as number,
                create_date: time,
                content: content,
            })
            .returning({ pid: Post.pid })
        )?.[0]
        await DB
            .insert(Thread)
            .values({
                tid: post.pid,
                uid: i.uid as number,
                subject: subject,
                create_date: time,
                last_date: time,
                last_uid: i.uid as number,
                posts: 1,
            })
        await DB
            .update(User)
            .set({
                threads: sql`${User.threads} + 1`,
                posts: sql`${User.posts} + 1`,
                credits: sql`${User.credits} + 2`,
                golds: sql`${User.golds} + 2`,
            })
            .where(eq(User.uid, i.uid as number))
        new Counter('T').add()
        return a.text(String(post.pid))
    }
}
