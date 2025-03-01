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
    return drizzle(db, { logger: false });
}()

export const Conf = sqliteTable("conf", {
    key: text().primaryKey(),
    value: text(),
});

export const Notice = sqliteTable("notice", {
    nid: integer().primaryKey(),
    tid: integer().notNull(),
    uid: integer().notNull(),
    last_pid: integer().notNull().default(0),
    read_pid: integer().notNull().default(0),
    unread: integer().notNull().default(0),
});

export const Post = sqliteTable("post", {
    pid: integer().primaryKey(),
    tid: integer().notNull().default(0),
    uid: integer().notNull().default(0),
    access: integer().notNull().default(0),
    create_date: integer().notNull().default(0),
    quote_pid: integer().notNull().default(0),
    quote_uid: integer().notNull().default(0),
    content: text().notNull().default(''),
});

export const Thread = sqliteTable("thread", {
    tid: integer().primaryKey(),
    uid: integer().notNull().default(0),
    access: integer().notNull().default(0),
    is_top: integer().notNull().default(0),
    create_date: integer().notNull().default(0),
    last_date: integer().notNull().default(0),
    last_uid: integer().notNull().default(0),
    posts: integer().notNull().default(0),
    subject: text().notNull().default(''),
});

export const User = sqliteTable("user", {
    uid: integer().primaryKey(),
    gid: integer().notNull().default(0),
    mail: text().notNull().default('').unique(),
    name: text().notNull().default('').unique(),
    hash: text().notNull().default(''),
    salt: text().notNull().default(''),
    threads: integer().notNull().default(0),
    posts: integer().notNull().default(0),
    credits: integer().notNull().default(0),
    golds: integer().notNull().default(0),
    create_date: integer().notNull().default(0),
});

export type I = Omit<typeof User.$inferSelect, "hash" | "salt">

export interface Props {
    a: Context
    i: I | undefined
    title: string
    external?: string
}