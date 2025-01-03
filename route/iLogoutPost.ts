import { Context } from "hono";
import { deleteCookie } from "hono/cookie";

export default async function (a: Context) {
    deleteCookie(a, 'JWT')
    return a.text('ok')
}