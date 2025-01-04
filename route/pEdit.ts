import { Context } from "hono";
import { raw } from "hono/html";
import { BaseProps, DB, Post, Thread } from "./base";
import { Auth, Config } from "./core";
import { eq } from "drizzle-orm";
import editView from "../style/edit";

export interface PEditProps extends BaseProps {
    subject?: string
    content?: string
}

export default async function (a: Context) {
    const i = await Auth(a)
    if (!i) { return a.text('401', 401) }
    const id = parseInt(a.req.param('id') ?? '0')
    const title = "编辑"
    const friend_link = Config.get('friend_link')
    const external_css = raw(`
        <link href="/quill/quill.snow.css" rel="stylesheet" />
    `)
    let subject = ''
    let content = ''
    if (id < 0) {
        const post = (await DB
            .select()
            .from(Post)
            .where(eq(Post.pid, -id))
        )?.[0]
        if (!post || post.uid != i.uid) { return a.text('401', 401) }
        content = raw(post.message_fmt) ?? ''
        if (!post.tid) {
            const thread = (await DB
                .select()
                .from(Thread)
                .where(eq(Thread.tid, post.pid))
            )?.[0]
            if (thread) {
                subject = raw(thread.subject) ?? ''
            }
        }
    }
    return a.html(editView({ i, title, friend_link, external_css, subject, content }));
}