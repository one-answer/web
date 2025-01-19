import { Context } from "hono";
import { Auth } from "./core";
import iConfView from "../style/iConf";

export default async function (a: Context) {
    const i = await Auth(a)
    if (!i) { return a.text('401', 401) }
    const title = "设置"
    return a.html(iConfView({ a, i, title }));
}