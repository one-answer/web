import { html, raw } from "hono/html";
import { PEditProps } from "../app/pEdit";
import { Header, Footer } from "./Common"

export function PEdit(z: PEditProps) {
    z.external = raw(`
        <link href="/quill.snow.css" rel="stylesheet" />
    `)
    return html`
${Header(z)}

<div class="container w-full mx-auto max-w-4xl bg-white shadow-md rounded-lg divide-y divide-gray-200 flex flex-col justify-center" style="height:calc(100% - 60px)">
    <div name="content">${z.content}</div>
</div>

<nav class="flex justify-center space-x-4 my-6">
    <button class="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 cursor-pointer" onclick="save()">提交</button>
    <button class="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 cursor-pointer" onclick="omit()">删除</button>
</nav>

<script src="/quill.js"></script>
<script>
    const quill = new Quill('[name="content"]', { theme: 'snow' });
    async function save() {
        const data = new FormData();
        data.set('content', quill.getSemanticHTML());
        const result = await fetch(new Request('', {method: 'POST', body: data}))
        if (result.ok) {
            window.location=document.referrer
        } else { alert('提交失败：'+ await result.text()); }
    };
    async function omit() {
        if(!confirm('真的要删除吗?')){return;}
        const result = await fetch(new Request('', {method: 'DELETE'}))
        if (result.ok) {
            window.location=document.referrer
        } else { alert('删除失败：'+ await result.text()); }
    };
</script>

${Footer(z)}
`;
}