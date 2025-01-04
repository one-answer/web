import { Context } from "hono";
import authView from "../style/auth";
import { Config } from "./core";

export default async function (a: Context) {
    const i = {}
    const title = "登录"
    const friend_link = Config.get('friend_link')
    return a.html(authView({ i, title, friend_link }));
}