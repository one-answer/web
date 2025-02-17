import { Context } from "hono";
import { raw } from "hono/html";
import { Props, DB, Post } from "./data";
import { Auth } from "./base";
import { and, eq, gt, sql } from "drizzle-orm";
import { PEdit } from "../bare/PEdit";

export interface PEditProps extends Props {
    eid: number,
    content: string
}

export async function pEdit(a: Context) {
    const i = await Auth(a)
    if (!i) { return a.text('401', 401) }
    const time = Math.floor(Date.now() / 1000)
    const eid = parseInt(a.req.param('eid') ?? '0')
    let title = ""
    let content = ''
    if (eid < 0) {
        title = "编辑"
        const post = (await DB
            .select()
            .from(Post)
            .where(and(
                eq(Post.pid, -eid),
                eq(Post.access, 0),
                [1].includes(i.gid) ? undefined : eq(Post.uid, i.uid), // 只有作者可以编辑
                [1].includes(i.gid) ? undefined : gt(sql`${Post.create_date} + 604800`, time), // 7天后禁止编辑
            ))
        )?.[0]
        if (!post) { return a.text('403', 403) }
        content = raw(post.content) ?? ''
    } else if (eid > 0) {
        title = "回复"
    } else {
        title = "发表"
    }
    return a.html(PEdit({ a, i, title, eid, content }));
}