import { Context } from "hono";
import { html } from "hono/html";
import { DB, Notice, Post, Thread, User } from "./data";
import { Auth, Config, Counter, HTMLFilter, User_Notice } from "./base";
import { and, eq, gt, sql } from "drizzle-orm";
import { sign } from "hono/jwt";
import { setCookie } from "hono/cookie";

export async function pSave(a: Context) {
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
                eq(Post.uid, i.uid),
                [1].includes(i.gid) ? undefined : gt(sql`${Post.create_date} + 604800`, time),
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
                last_uid: i.uid,
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
                uid: i.uid,
                create_date: time,
                quote_pid: post.tid ? post.pid : 0, // 如果回复的是首层 则不引用
                quote_uid: post.uid,
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
        i.posts += 1;
        i.credits += 1;
        i.golds += 1;
        setCookie(a, 'JWT', await sign(i, Config.get('secret_key')))
        // 回复通知 Notice 开始
        // [通知]有回复所在的Thread 则更新自己的回帖
        await DB
            .update(Notice)
            .set({
                last_pid: reply.pid,
                read_pid: sql`CASE WHEN ${Notice.last_pid} = ${Notice.read_pid} THEN ${reply.pid} ELSE ${Notice.read_pid} END`,
            })
            .where(and(
                eq(Notice.uid, reply.uid), // 查找回帖人自己的uid
                eq(Notice.tid, reply.tid),
            ))
        // 给回复目标的[通知]增加提醒
        if (post.uid != reply.uid) {
            await DB.insert(Notice)
                .values({
                    uid: reply.quote_uid,
                    tid: reply.tid,
                    last_pid: reply.pid,
                    read_pid: reply.pid - 1,
                    unread: 1,
                })
                .onConflictDoUpdate({
                    target: [Notice.uid, Notice.tid],
                    set: {
                        last_pid: reply.pid,
                        unread: 1,
                    },
                })
            await User_Notice(post.uid, 1)
        }
        // 回复通知 Notice 结束
        return a.text('ok') //! 返回tid/pid和posts数量
    } else {
        const subject = html`${body.get('subject')?.toString() ?? ''}`.toString()
        if (!subject) { return a.text('406', 406) }
        const content = HTMLFilter(body.get('content')?.toString() ?? '')
        if (!content) { return a.text('406', 406) }
        const post = (await DB
            .insert(Post)
            .values({
                uid: i.uid,
                create_date: time,
                content: content,
            })
            .returning()
        )?.[0]
        await DB
            .insert(Thread)
            .values({
                tid: post.pid,
                uid: i.uid,
                subject: subject,
                create_date: time,
                last_date: time,
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
            .where(eq(User.uid, i.uid))
        i.threads += 1;
        i.posts += 1;
        i.credits += 2;
        i.golds += 2;
        setCookie(a, 'JWT', await sign(i, Config.get('secret_key')))
        Counter.set('T', (Counter.get('T') ?? 0) + 1)
        return a.text(String(post.pid))
    }
}
