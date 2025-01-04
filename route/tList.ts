import { Context } from "hono";
import { DB, Thread, User } from "./base";
import { Auth, Config, Counter, Pagination } from "./core";
import { desc, eq, getTableColumns } from 'drizzle-orm';
import { JWTPayload } from "hono/utils/jwt/types";
import tListView from "../style/tList";

export interface tListProps {
    i: false | JWTPayload
    page: number
    pagination: number[]
    data: { [x: string]: any; }[]
    title: string
}

export async function tList(a: Context) {
    const i = await Auth(a)
    const page = parseInt(a.req.param('page') ?? '0') || 1
    const pagination = Pagination(20, new Counter('T').get(), page, 2)
    const data = await DB
        .select({
            ...getTableColumns(Thread),
            username: User.username,
            credits: User.credits,
            gid: User.gid,
        })
        .from(Thread)
        .leftJoin(User, eq(Thread.uid, User.uid))
        .orderBy(desc(Thread.last_date))
        .offset((page - 1) * 20)
        .limit(20)
    const title = Config.get('site_name')
    return a.html(tListView({ i, page, pagination, data, title }));
}