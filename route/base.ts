import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { JWTPayload } from "hono/utils/jwt/types";

export const DB = drizzle(new Database("my.db"));

export const Conf = sqliteTable("conf", {
    key: text("key").primaryKey(),
    value: text("value"),
});

export const Post = sqliteTable("post", {
    pid: integer("pid").primaryKey(),
    tid: integer("tid"),
    uid: integer("uid"),
    create_date: integer("create_date"),
    quotepid: integer("quotepid"),
    message_fmt: text("message_fmt"),
});

export const Thread = sqliteTable("thread", {
    tid: integer("tid").primaryKey(),
    uid: integer("uid"),
    subject: text("subject"),
    create_date: integer("create_date"),
    last_date: integer("last_date"),
    posts: integer("posts"),
    lastuid: integer("lastuid"),
});

export const User = sqliteTable("user", {
    uid: integer("uid").primaryKey(),
    gid: integer("gid"),
    email: text("email"),
    username: text("username"),
    password: text("password"),
    salt: text("salt"),
    threads: integer("threads"),
    posts: integer("posts"),
    credits: integer("credits"),
    golds: integer("golds"),
    create_date: integer("create_date"),
    login_date: integer("login_date"),
    notices: integer("notices"),
    signature: text("signature"),
});

export interface BaseProps {
    i: false | JWTPayload
    title: string
    friend_link: { [x: string]: any; }[]
}
