import { html } from "hono/html";
import { PEditProps } from "../route/pEdit";
import Header from "./header"
import Footer from "./footer"

export default function (props: PEditProps) {
    return html`
        ${Header(props)}
        <main class="container">
            <input name="subject" value="${props.subject}" placeholder="标题">
            <div name="content">${props.content}</div>
            <button onclick="save()">提交</button>
            <script src="/quill.js"></script>
            <script>
                const quill = new Quill('[name="content"]', { theme: 'snow' });
                async function save() {
                    const data = new FormData();
                    data.set('subject', document.querySelector('[name="subject"]').value);
                    data.set('content', quill.getSemanticHTML());
                    if ((await fetch(new Request("", {method: "POST", body: data}))).ok) {
                        window.location=document.referrer
                    } else { alert('提交失败'); }
                };
            </script>
        </main>
        ${Footer(props)}
    `;
}