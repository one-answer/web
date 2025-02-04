import { Context } from "hono";
import { Props, DB, Thread, User } from "./data";
import { Auth, Config } from "./base";
import { and, desc, eq, getTableColumns, gt, lt } from 'drizzle-orm';
import { alias } from "drizzle-orm/sqlite-core";
import { TList } from "../bare/TList";

export interface TListProps extends Props {
    data: (typeof Thread.$inferSelect & {
        name: string | null;
        credits: number | null;
        gid: number | null;
        last_name: string | null;
    })[]
}

export async function tList(a: Context, pivot: number, reverse: boolean = false) {
    const i = await Auth(a)
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
            pivot ? (reverse ?
                gt(Thread.last_date, pivot) :
                lt(Thread.last_date, pivot)
            ) : undefined,
        ))
        .leftJoin(User, eq(Thread.uid, User.uid))
        .leftJoin(LastUser, eq(Thread.last_uid, LastUser.uid))
        .orderBy(desc(Thread.last_date))
        .limit(Config.get('page_size_t'))
    const title = Config.get('site_name')
    return a.html(TList({ a, i, data, title }));
}

export async function tListInit(a: Context) {
    return await tList(a, 0)
}

export async function tListLessThan(a: Context) {
    return await tList(a, parseInt(a.req.param('pivot') ?? '0'))
}

export async function tListMoreThan(a: Context) {
    return await tList(a, parseInt(a.req.param('pivot') ?? '0'), true)
}