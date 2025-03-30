import { Context } from "hono";

export async function fCatBoxImage(a: Context) {
    const fid = a.req.param('fid');
    return a.redirect('https://i0.wp.com/files.catbox.moe/' + fid + '?w=1920', 301);
}
