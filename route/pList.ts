import { Context } from "hono";
import { DB, Post, Thread, User } from "./base";
import { Auth, Pagination } from "./core";
import { asc, eq, getTableColumns } from 'drizzle-orm';
import { raw } from "hono/html";
import { JWTPayload } from "hono/utils/jwt/types";
import pListView from "../style/pList";

export interface pListProps {
    i: false | JWTPayload
    tid: number
    topic: { [x: string]: any; }
    page: number
    pagination: number[]
    data: { [x: string]: any; }[]
    title: string
}

export default async function (a: Context) {
    const i = await Auth(a)
    const tid = parseInt(a.req.param('tid'))
    const topic = (await DB
        .select()
        .from(Thread)
        .where(eq(Thread.tid, tid))
    )[0] || null
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
        .where(eq(Post.tid, tid))
        .leftJoin(User, eq(Post.uid, User.uid))
        .orderBy(asc(Post.pid))
        .offset((page - 1) * 20)
        .limit(20)
    const title = raw(topic.subject)
    return a.html(pListView({ i, tid, topic, page, pagination, data, title }));
}