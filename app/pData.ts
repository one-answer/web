import { Context } from "hono";
import { DB, Post, Thread, User } from "./base";
import { Auth, Cache, Counter, HTMLFilter, HTMLSubject, IsAdmin, Status } from "./core";
import { mAdd, mDel } from "./mCore";
import { and, desc, eq, gt, or, sql } from "drizzle-orm";

export async function pSave(a: Context) {
    const i = await Auth(a)
    if (!i) { return a.text('401', 401) }
    const time = Math.floor(Date.now() / 1000)
    const body = await a.req.formData()
    const eid = parseInt(a.req.param('eid') ?? '0')
    if (eid < 0) { // 编辑
        const content = HTMLFilter(body.get('content')?.toString() ?? '')
        if (!content) { return a.text('406', 406) }
        const post = (await DB
            .update(Post)
            .set({
                content: content,
            })
            .where(and(
                eq(Post.pid, -eid),
                eq(Post.access, 0),
                IsAdmin(i, undefined, eq(Post.uid, i.uid)), // 管理和作者都能编辑
                IsAdmin(i, undefined, gt(sql`${Post.time} + 604800`, time)), // 7天后禁止编辑
            ))
            .returning()
        )?.[0]
        if (!post) { return a.text('403', 403) }
        if (!post.tid) {
            await DB
                .update(Thread)
                .set({
                    subject: HTMLSubject(content, 140),
                })
                .where(eq(Thread.tid, post.pid))
        }
        return a.text('ok')
    } else if (eid > 0) { // 回复
        if (time - (Cache.get(-i.uid) ?? 0) < 60) { return a.text('too_fast', 403) } // 防止频繁发帖
        const quote = (await DB
            .select()
            .from(Post)
            .where(and(
                eq(Post.pid, eid),
                eq(Post.access, 0),
            ))
        )?.[0]
        if (!quote) { return a.text('403', 403) }
        const content = HTMLFilter(body.get('content')?.toString() ?? '')
        if (!content) { return a.text('406', 406) }
        const thread = (await DB
            .update(Thread)
            .set({
                posts: sql`${Thread.posts}+1`,
                last_uid: i.uid,
                last_time: time,
            })
            .where(and(
                eq(Thread.tid, quote.tid ? quote.tid : quote.pid),
                gt(sql`${Thread.last_time} + 604800`, time),
            ))
            .returning()
        )?.[0]
        // 帖子找不到 一周没有热度 禁止回复
        if (!thread) { return a.text('403', 403) }
        const post = (await DB
            .insert(Post)
            .values({
                tid: quote.tid ? quote.tid : quote.pid,
                uid: i.uid,
                time,
                quote_pid: quote.pid,
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
            .where(eq(User.uid, post.uid))
        Counter.add(0, thread.tid); // 帖子回复+1
        Counter.add(post.uid, thread.tid); // 用户帖子回复+1
        // 回复通知开始 如果回复的不是自己
        if (post.uid != quote.uid) {
            await mAdd(quote.uid, 1, post.time, post.quote_pid)
            Status(quote.uid, 1) // 回复目标增加消息通知
        }
        // 回复通知结束
        Cache.set(-i.uid, time) // 记录发帖时间
        Status(i.uid, 10) // 刷新自己的COOKIE
        return a.text('ok') //! 返回tid/pid和posts数量
    } else { // 发帖
        if (time - (Cache.get(-i.uid) ?? 0) < 60) { return a.text('too_fast', 403) } // 防止频繁发帖
        const content = HTMLFilter(body.get('content')?.toString() ?? '')
        if (!content) { return a.text('406', 406) }
        const post = (await DB
            .insert(Post)
            .values({
                uid: i.uid,
                time,
                content: content,
            })
            .returning()
        )?.[0]
        await DB
            .insert(Thread)
            .values({
                tid: post.pid,
                uid: i.uid,
                subject: HTMLSubject(content, 140),
                time,
                last_time: time,
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
        Counter.add(0, 0); // 全局发帖+1
        Counter.add(i.uid, 0); // 用户发帖+1
        Cache.set(-i.uid, time) // 记录发帖时间
        Status(i.uid, 10) // 刷新自己的COOKIE
        return a.text(String(post.pid))
    }
}

export async function pOmit(a: Context) {
    const i = await Auth(a)
    if (!i) { return a.text('401', 401) }
    const pid = -parseInt(a.req.param('eid') ?? '0')
    const post = (await DB
        .update(Post)
        .set({
            access: 3,
        })
        .where(and(
            eq(Post.pid, pid),
            IsAdmin(i, undefined, eq(Post.uid, i.uid)), // 管理和作者都能删除
        ))
        .returning()
    )?.[0]
    // 如果无法删除则报错
    if (!post) { return a.text('410:gone', 410) }
    if (post.tid) {
        // 如果删的是Post
        const last = (await DB
            .select()
            .from(Post)
            .where(and(
                // access
                eq(Post.access, 0),
                // tid - pid
                or(
                    and(eq(Post.tid, 0), eq(Post.pid, post.tid)),
                    eq(Post.tid, post.tid),
                ),
            ))
            .orderBy(desc(Post.pid))
            .limit(1)
        )?.[0]
        await DB
            .update(Thread)
            .set({
                posts: sql`${Thread.posts} - 1`,
                last_uid: last.tid ? last.uid : 0,
                last_time: last.time,
            })
            .where(eq(Thread.tid, post.tid))
        await DB
            .update(User)
            .set({
                posts: sql`${User.posts} - 1`,
                credits: sql`${User.credits} - 1`,
                golds: sql`${User.golds} - 1`,
            })
            .where(eq(User.uid, post.uid))
        Counter.sub(0, post.tid); // 帖子回复-1
        Counter.sub(post.uid, post.tid); // 用户帖子回复-1
        // 回复通知开始
        const quote = (await DB
            .select()
            .from(Post)
            .where(eq(Post.pid, post.quote_pid))
        )?.[0]
        // 如果存在被回复帖 且回复的不是自己
        if (quote && post.uid != quote.uid) {
            await mDel(quote.uid, 1, post.time, post.quote_pid)
            Status(quote.uid, null) // 回复目标重置消息状态
        }
        // 回复通知结束
    } else {
        // 如果删的是Thread
        await DB
            .update(Thread)
            .set({
                access: 3,
            })
            .where(and(
                eq(Thread.tid, post.pid),
                IsAdmin(i, undefined, eq(Thread.uid, i.uid)), // 管理和作者都能删除
            ))
        await DB
            .update(User)
            .set({
                threads: sql`${User.threads} - 1`,
                posts: sql`${User.posts} - 1`,
                credits: sql`${User.credits} - 2`,
                golds: sql`${User.golds} - 2`,
            })
            .where(eq(User.uid, post.uid))
        Counter.sub(0, 0); // 全局发帖-1
        Counter.sub(post.uid, 0); // 用户发帖-1
        // 回复通知开始
        /*
        待修改：轮询所有 quote_pid
        const noticeUidArr = (await DB
            .delete(Notice)
            .where(and(
                eq(Notice.tid, post.tid || post.pid),
            ))
            .returning({ uid: Notice.uid })
        )
        noticeUidArr.forEach(function (row) {
            Status(row.uid, null) // 回复目标重置消息状态
        })
        */
        // 回复通知结束
    }
    return a.text('ok')
}
