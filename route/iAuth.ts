import { Context } from "hono";
import { Auth, Config } from "./core";
import authView from "../style/auth";

export default async function (a: Context) {
    const i = await Auth(a)
    const title = "登录"
    const friend_link = Config.get('friend_link')
    return a.html(authView({ i, title, friend_link }));
}