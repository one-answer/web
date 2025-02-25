import { Context } from "hono";
import { Props, DB, Thread, User } from "./data";
import { Auth, Config, Counter, Pagination } from "./base";
import { and, desc, eq, getTableColumns, or } from 'drizzle-orm';
import { alias } from "drizzle-orm/sqlite-core";
import { TList } from "../bare/TList";

export interface TListProps extends Props {
    page: number
    pagination: number[]
    data: (typeof Thread.$inferSelect & {
        name: string | null;
        credits: number | null;
        gid: number | null;
        last_name: string | null;
    })[]
}

export async function tList(a: Context) {
    const i = await Auth(a)
    const page = parseInt(a.req.param('page') ?? '0') || 1
    const uid = parseInt(a.req.query('uid') ?? '0')
    const LastUser = alias(User, 'LastUser')
    const data = await DB
        .select({
            ...getTableColumns(Thread),
            name: User.name,
            credits: User.credits,
            gid: User.gid,
            last_name: LastUser.name,
        })
        .from(Thread)
        .where(and(
            eq(Thread.access, 0),
            (uid ? eq(Thread.uid, uid) : undefined),
            or(eq(Thread.is_top, 1), eq(Thread.is_top, 0)),
        ))
        .leftJoin(User, eq(Thread.uid, User.uid))
        .leftJoin(LastUser, eq(Thread.last_uid, LastUser.uid))
        .orderBy(desc(Thread.is_top), desc(uid ? Thread.create_date : Thread.last_date))
        .offset((page - 1) * Config.get('page_size_t'))
        .limit(Config.get('page_size_t'))
    const pagination = Pagination(Config.get('page_size_t'), await Counter.get(uid, 0), page, 2)
    const title = Config.get('site_name')
    return a.html(TList({ a, i, page, pagination, data, title }));
}
