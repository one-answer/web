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
            <script src="/quill/quill.js"></script>
            <script>
                function save() {
                    alert("save")
                };
                window.addEventListener('load', function() {
                    const quill = new Quill('div[name="content"]', { theme: 'snow' });
                });
            </script>
        </main>
        ${Footer(props)}
    `;
}