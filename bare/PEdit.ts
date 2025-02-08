import { html } from "hono/html";
import { PEditProps } from "../app/pEdit";
import { Header, Footer } from "./Common"

export function PEdit(z: PEditProps) {
    return html`
        ${Header(z)}
        <main class="mdui-container">
            <div class="mdui-row mdui-m-t-2">
                <div name="content">${z.content}</div>
                <div class="mdui-row mdui-m-t-2">
                    <button class="mdui-btn mdui-btn-raised mdui-ripple mdui-color-theme-accent" onclick="save()">提交</button>
                    <button class="mdui-btn mdui-btn-raised mdui-ripple" onclick="omit()">删除</button>
                </div>
            </div>
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