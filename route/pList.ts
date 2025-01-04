import { Context } from "hono";
import { BaseProps, DB, Post, Thread, User } from "./base";
import { Auth, Config, Pagination } from "./core";
import { asc, eq, or, getTableColumns } from 'drizzle-orm';
import { raw } from "hono/html";
import pListView from "../style/pList";

export interface PListProps extends BaseProps {
    topic: { [x: string]: any; }
    page: number
    pagination: number[]
    data: { [x: string]: any; }[]
}

export default async function (a: Context) {
    const i = await Auth(a)
    const tid = parseInt(a.req.param('tid'))
    const topic = (await DB
        .select()
        .from(Thread)
        .where(eq(Thread.tid, tid))
    )?.[0]
    if (!topic) { return a.notFound() }
    const page = parseInt(a.req.param('page') ?? '0') || 1
    const pagination = Pagination(20, topic?.posts ?? 0, page, 2)
    const data = await DB
        .select({
            ...getTableColumns(Post),
            username: User.username,
            credits: User.credits,
            gid: User.gid,
        })
        .from(Post)
        .where(or(eq(Post.pid, tid), eq(Post.tid, tid)))
        .leftJoin(User, eq(Post.uid, User.uid))
        .orderBy(asc(Post.pid))
        .offset((page - 1) * 20)
        .limit(20)
    const title = raw(topic.subject)
    const edit_target = tid
    const friend_link = Config.get('friend_link')
    return a.html(pListView({ i, topic, page, pagination, data, title, edit_target, friend_link }));
}