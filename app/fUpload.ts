import { Context } from "hono";
import { fileTypeFromBlob } from 'file-type';

export async function fUpload(a: Context) {
    const time = Math.floor(Date.now() / 1000);
    const file = await a.req.blob();
    if (!(await fileTypeFromBlob(file))?.mime.startsWith('image/')) {
        return a.text('Unsupported Media Type', 415);
    }
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', file, time + '');
    const response = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: form });
    if (response.ok) {
        return a.text((await response.text()).split('/').at(-1) ?? '')
    } else {
        return a.text(await response.text(), 500)
    }
}
