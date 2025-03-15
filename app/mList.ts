import { Context } from "hono";
import { Auth } from "./core";
import { MList } from "../bare/MList";

export async function mList(a: Context) {
    const i = await Auth(a)
    const title = '消息'
    return a.html(MList({ a, i, title }));
}
