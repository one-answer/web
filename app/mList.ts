import { Context } from "hono";
import { Auth } from "./core";
import { MList } from "../bare/MList";

export async function mList(a: Context) {
    const i = await Auth(a)
    if (!i) { return a.text('401', 401) }
    const title = '消息'
    return a.html(MList({ a, i, title }));
}
