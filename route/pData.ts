import { Context } from "hono";
import { html } from "hono/html";
import { and, eq, gt, sql } from "drizzle-orm";
import { DB, Notice_Post, Notice_Thread, Post, Thread, User } from "./base";
import { Auth, Counter, HTMLFilter, User_Notices } from "./core";

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
            .where(and(
                eq(Post.pid, -eid),
                eq(Post.uid, i.uid as number),
                gt(sql`${Post.create_date} + 604800`, time),
            ))
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
                last_date: time,
            })
            .where(and(
                eq(Thread.tid, post.tid ? post.tid : post.pid),
                gt(sql`${Thread.last_date} + 604800`, time),
            ))
            .returning()
        )?.[0]
        // 帖子找不到 一周没有热度 禁止回复
        if (!thread) { return a.text('403', 403) }
        const reply = (await DB
            .insert(Post)
            .values({
                tid: post.tid ? post.tid : post.pid,
                uid: i.uid as number,
                create_date: time,
                quote_pid: post.tid ? post.pid : 0,
                content: content,
            })
            .returning()
        )?.[0]
        await DB
            .update(User)
            .set({
                posts: sql`${User.posts} + 1`,
                credits: sql`${User.credits} + 1`,
                golds: sql`${User.golds} + 1`,
            })
            .where(eq(User.uid, reply.uid))
        // 回复通知 Notice
        /*
        if (post.uid != reply.uid) {
            await DB
                .insert(Notice_Post)
                .values({
                    target_uid: post.uid,
                    tid: reply.tid,
                    pid: reply.pid,
                })
            await DB.insert(Notice_Thread)
                .values({
                    target_uid: post.uid,
                    last_time: reply.create_date,
                    last_pid: reply.pid,
                    tid: reply.tid,
                })
                .onConflictDoUpdate({
                    target: [Notice_Thread.target_uid, Notice_Thread.tid],
                    set: {
                        last_time: reply.create_date,
                        last_pid: reply.pid,
                    },
                })
            await User_Notices(post.uid, await User_Notices(post.uid) + 1)
        }
        */
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
            .returning()
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
        Counter.set('T', (Counter.get('T') ?? 0) + 1)
        return a.text(String(post.pid))
    }
}
