import { html } from "hono/html";
import { PEditProps } from "../route/pEdit";
import Header from "./header"
import Footer from "./footer"

export default function (z: PEditProps) {
    return html`
        ${Header(z)}
        <main class="container">
            ${(z.subject || !z.eid) ? html`
            <input name="subject" value="${z.subject}" placeholder="标题">
            `: ''}
            <div name="content">${z.content}</div>
            <button onclick="save()">提交</button>
            <script src="/quill.js"></script>
            <script>
                const quill = new Quill('[name="content"]', { theme: 'snow' });
                async function save() {
                    const data = new FormData();
                    if(document.querySelector('[name="subject"]')){
                        data.set('subject', document.querySelector('[name="subject"]').value);
                    }
                    data.set('content', quill.getSemanticHTML());
                    if ((await fetch(new Request("", {method: "POST", body: data}))).ok) {
                        window.location=document.referrer
                    } else { alert('提交失败'); }
                };
            </script>
        </main>
        ${Footer(z)}
    `;
}