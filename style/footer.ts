import { html } from "hono/html";
import { BaseProps } from "../route/base";

export default function (props: BaseProps) {
    return html`
        <script>
            async function logout() {
                if ((await fetch(new Request("/logout", {method: "POST"}))).ok) {
                    location.reload();
                }
            }
            window.addEventListener('load', function() {
                document.querySelectorAll('.date').forEach(element => {
                    element.innerHTML = new Date(parseInt(element.getAttribute('time_stamp'))*1000).toLocaleString();
                });
            });
        </script>
        <footer class="footer">
            <div class="footer-content">
                <ul class="footer-links">
                    ${Object.values(props.friend_link).map(item => html`
                    <li><a href="${item.url}" target="_blank">${item.name}</a></li>
                    `)}
                </ul>
                <div class="developer-info">
                    <p>© 2025 Forum</p>
                </div>
            </div>
        </footer>
        </body>
        </html>
    `
}