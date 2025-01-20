import { Context } from "hono";
import { BaseProps, DB, Thread, User } from "./base";
import { Auth, Config, Counter, Pagination } from "./core";
import { desc, eq, getTableColumns } from 'drizzle-orm';
import { alias } from "drizzle-orm/sqlite-core";
import tListView from "../style/tList";

export interface TListProps extends BaseProps {
    page: number
    pagination: number[]
    data: (typeof Thread.$inferSelect & {
        username: string | null;
        credits: number | null;
        gid: number | null;
        last_username: string | null;
    })[]
}

export default async function (a: Context) {
    const i = await Auth(a)
    const page = parseInt(a.req.param('page') ?? '0') || 1
    const LastUser = alias(User, 'LastUser')
    const data = await DB
        .select({
            ...getTableColumns(Thread),
            username: User.username,
            credits: User.credits,
            gid: User.gid,
            last_username: LastUser.username,
        })
        .from(Thread)
        .leftJoin(User, eq(Thread.uid, User.uid))
        .leftJoin(LastUser, eq(Thread.last_uid, LastUser.uid))
        .orderBy(desc(Thread.last_date))
        .offset((page - 1) * Config.get('page_size_t'))
        .limit(Config.get('page_size_t'))
    const pagination = Pagination(Config.get('page_size_t'), Counter.get('T') ?? 0, page, 2)
    const title = Config.get('site_name')
    return a.html(tListView({ a, i, page, pagination, data, title }));
}