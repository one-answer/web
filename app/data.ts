import { Context } from "hono";
import { drizzle } from "drizzle-orm/libsql";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createClient } from '@libsql/client';


export const DB = function () {
    const db = createClient({
        url: "file:app.db",
        syncUrl: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
        syncInterval: 60,
    });
    return drizzle(db);
}()

export const Conf = sqliteTable("conf", {
    key: text().primaryKey(),
    value: text(),
});

export interface BaseProps {
    a: Context
    i: typeof User.$inferSelect | null
    title: string
    external_css?: string
}

export const Notice = sqliteTable("notice", {
    uid: integer().notNull().default(0).primaryKey(),
    tid: integer().notNull().default(0).primaryKey(),
    last_pid: integer().notNull().default(0),
    read_pid: integer().notNull().default(0),
    unread: integer().notNull().default(0),
});

export const Post = sqliteTable("post", {
    pid: integer().primaryKey(),
    tid: integer().notNull().default(0),
    uid: integer().notNull().default(0),
    create_date: integer().notNull().default(0),
    quote_pid: integer().notNull().default(0),
    quote_uid: integer().notNull().default(0),
    content: text().notNull().default(''),
});

export const Thread = sqliteTable("thread", {
    tid: integer().primaryKey(),
    uid: integer().notNull().default(0),
    subject: text().notNull().default(''),
    create_date: integer().notNull().default(0),
    last_date: integer().notNull().default(0),
    last_uid: integer().notNull().default(0),
    posts: integer().notNull().default(0),
});

export const User = sqliteTable("user", {
    uid: integer().primaryKey(),
    gid: integer().notNull().default(0),
    email: text().notNull().default('').unique(),
    username: text().notNull().default('').unique(),
    password: text().notNull().default(''),
    salt: text().notNull().default(''),
    threads: integer().notNull().default(0),
    posts: integer().notNull().default(0),
    credits: integer().notNull().default(0),
    golds: integer().notNull().default(0),
    create_date: integer().notNull().default(0),
});
