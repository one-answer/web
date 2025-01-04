import { Context } from "hono";
import { DB, Post, Thread } from "./base";
import { eq } from "drizzle-orm";
import { deleteCookie } from "hono/cookie";
import { Auth } from "./core";

export async function pEditPost(a: Context) {
    const i = await Auth(a)
    if (!i) { return a.text('Forbbiden', 401) }
    const time = Math.floor(Date.now() / 1000)
    const body = await a.req.formData()
    const id = parseInt(a.req.param('id') ?? '0')
    if (id < 0) {
        const post = (await DB
            .select()
            .from(Post)
            .where(eq(Post.pid, -id))
        )?.[0]
        //! 转换为 AllowEdit 函数
        if (!post || post.uid != i.uid) { return a.text('Forbbiden', 401) }
        const content = body.get('content')?.toString()
        if (!content) { return a.text('Forbbiden', 422) }
        await DB
            .update(Post)
            .set({ message_fmt: content })
            .where(eq(Post.pid, post.pid))
        if (post.tid == post.pid) {
            const subject = body.get('subject')?.toString()
            if (!subject) { return a.text('Forbbiden', 422) }
            await DB.update(Thread)
                .set({ subject: subject })
                .where(eq(Thread.tid, post.tid))
        }
        return a.text('ok')
        //! Trigger 增加帖子数等
    } else if (id > 0) {
        const post = (await DB
            .select()
            .from(Post)
            .where(eq(Post.pid, id))
        )?.[0]
        if (!post) { return a.text('Forbbiden', 401) }
        const content = body.get('content')?.toString()
        if (!content) { return a.text('Forbbiden', 422) }
        await DB
            .insert(Post)
            .values({
                tid: post.tid,
                uid: i.uid as number,
                create_date: time,
                quotepid: (post.tid == post.pid) ? 0 : post.pid,
                message_fmt: content,
            })
        return a.text('ok') //! 返回posts数量
        //! Trigger last_date
    } else {
        const subject = body.get('subject')?.toString()
        if (!subject) { return a.text('Forbbiden', 422) }
        const content = body.get('content')?.toString()
        if (!content) { return a.text('Forbbiden', 422) }
        const post = (await DB
            .insert(Post)
            .values({
                uid: i.uid as number,
                create_date: time,
                message_fmt: content,
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
                posts: 0,
                lastuid: i.uid as number,
            })
        return a.text(String(post.pid))
    }
}

export async function iLogoutPost(a: Context) {
    deleteCookie(a, 'JWT')
    return a.text('ok')
}
