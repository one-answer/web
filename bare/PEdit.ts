import { html } from "hono/html";
import { PEditProps } from "../app/pEdit";
import { Header, Footer } from "./Common"

export function PEdit(z: PEditProps) {
    return html`
        ${Header(z)}
        <main class="container">
            <div name="content">${z.content}</div>
            <button onclick="save()">提交</button>
        </main>
        <script src="/quill.js"></script>
        <script>
            const quill = new Quill('[name="content"]', { theme: 'snow' });
            async function save() {
                const data = new FormData();
                data.set('content', quill.getSemanticHTML());
                if ((await fetch(new Request("", {method: "POST", body: data}))).ok) {
                    window.location=document.referrer
                } else { alert('提交失败'); }
            };
        </script>
        ${Footer(z)}
    `;
}