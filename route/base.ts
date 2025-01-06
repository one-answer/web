import { Database } from "bun:sqlite";
import { Context } from "hono";
import { JWTPayload } from "hono/utils/jwt/types";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export interface BaseProps {
    a: Context
    i: false | JWTPayload
    title: string
    external_css?: string
}

export const DB = function () {
    const db = new Database("forum.db");
    db.exec("PRAGMA journal_mode = WAL;");
    return drizzle(db);
}()

export const Conf = sqliteTable("conf", {
    key: text().primaryKey(),
    value: text(),
});

export const Post = sqliteTable("post", {
    pid: integer().primaryKey(),
    tid: integer().notNull().default(0),
    uid: integer().notNull().default(0),
    create_date: integer().notNull().default(0),
    quote_pid: integer().notNull().default(0),
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
    login_date: integer().notNull().default(0),
    notices: integer().notNull().default(0),
    signature: text().notNull().default(''),
});
