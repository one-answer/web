import { html } from "hono/html";
import { Config } from "../route/core";

export default function () {
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
                    ${Object.values(Config.get('friend_link')).map(item => html`
                    <li><a href="${item.url}" target="_blank">${item.name}</a></li>
                    `)}
                </ul>
                <div class="developer-info">
                    <p>© 2025 A.js </p>
                </div>
            </div>
        </footer>
        </body>
        </html>
    `
}