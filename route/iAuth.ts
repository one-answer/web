import { Context } from "hono";
import { Auth } from "./core";
import authView from "../style/auth";

export default async function (a: Context) {
    const i = await Auth(a)
    const title = "登录"
    return a.html(authView({a, i, title }));
}