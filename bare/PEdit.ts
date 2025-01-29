import { html } from "hono/html";
import { PEditProps } from "../app/pEdit";
import { Header, Footer } from "./Common"

export function PEdit(z: PEditProps) {
    return html`
        ${Header(z)}
        <main class="container">
            <div name="content">${z.content}</div>
            <button onclick="save()">提交</button>
            <button onclick="omit()">删除</button>
        </main>
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