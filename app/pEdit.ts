import { Context } from "hono";
import { raw } from "hono/html";
import { BaseProps, DB, Post, Thread } from "./data";
import { Auth } from "./base";
import { eq } from "drizzle-orm";
import { PEdit } from "../bare/PEdit";

export interface PEditProps extends BaseProps {
    eid: number,
    subject: string
    content: string
}

export async function pEdit(a: Context) {
    const i = await Auth(a)
    if (!i) { return a.text('401', 401) }
    const eid = parseInt(a.req.param('eid') ?? '0')
    const external_css = raw(`
        <link href="/quill.snow.css" rel="stylesheet" />
    `)
    let title = ""
    let subject = ''
    let content = ''
    if (eid < 0) {
        title = "编辑"
        const post = (await DB
            .select()
            .from(Post)
            .where(eq(Post.pid, -eid))
        )?.[0]
        if (!post || post.uid != i.uid) { return a.text('401', 401) }
        content = raw(post.content) ?? ''
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
    } else if (eid > 0) {
        title = "回复"
    } else {
        title = "发表"
    }
    return a.html(PEdit({ a, i, title, external_css, eid, subject, content }));
}