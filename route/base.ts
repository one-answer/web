import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { JWTPayload } from "hono/utils/jwt/types";

export interface BaseProps {
    i: false | JWTPayload
    title: string
    edit_target?: number
    friend_link?: { [x: string]: any; }[]
    external_css?: string
}

export const DB = drizzle(new Database("forum.db"));

export const Conf = sqliteTable("conf", {
    key: text().primaryKey(),
    value: text(),
});

export const Post = sqliteTable("post", {
    pid: integer().primaryKey(),
    tid: integer().notNull().default(0),
    uid: integer().notNull().default(0),
    create_date: integer().notNull().default(0),
    quotepid: integer().notNull().default(0),
    message_fmt: text().notNull().default(''),
});

export const Thread = sqliteTable("thread", {
    tid: integer().primaryKey(),
    uid: integer().notNull().default(0),
    subject: text().notNull().default(''),
    create_date: integer().notNull().default(0),
    last_date: integer().notNull().default(0),
    posts: integer().notNull().default(0),
    lastuid: integer().notNull().default(0),
});

export const User = sqliteTable("user", {
    uid: integer().primaryKey(),
    gid: integer().notNull().default(0),
    email: text().notNull().default(''),
    username: text().notNull().default(''),
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
