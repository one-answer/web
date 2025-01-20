import { html } from "hono/html";
import { BaseProps } from "../app/data";
import { Config, User_Notice } from "../app/base";

export async function Header(z: BaseProps) {
    return html`
        <!DOCTYPE HTML>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${z.title}</title>
            <link rel="stylesheet" type="text/css" href="/forum.css" />
            ${z.external_css ?? ''}
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
        <header class="header">
            <h1><a href="/">${z.title}</a></h1>
            <div>
                <input type="checkbox" id="menu-toggle" class="menu-toggle">
                <label for="menu-toggle" class="menu-toggle-label">菜单 ☰</label>
                <div class="header-buttons">
                    ${z.i ? html`
                        ${Object.hasOwn(z.a.req.param(), 'tid') ? html`
                        <a class="login-btn" href="/e/${z.a.req.param('tid')}">回复</a>
                        ` : html`
                        <a class="login-btn" href="/e">发表</a>
                        `}
                        <a class="login-btn" href="/n" style="${await User_Notice(z.i.uid) ? 'background:yellow' : ''}">通知</a>
                        <a class="login-btn" href="/i">设置</a>
                        <a class="login-btn" href="javascript:;" onclick="logout();">退出</a>
                    `: html`
                        <a class="login-btn" href="/register" >注册</a>
                        <a class="login-btn" href="/auth">登录</a>
                    `}
                </div>
            </div>
        </header>
    `
}

export function Footer(z: BaseProps) {
    return html`
        <script>
            async function logout() {
                if ((await fetch(new Request("/logout", {method: "POST"}))).ok) {
                    location.reload();
                }
            }
            window.addEventListener('load', function() {
                document.querySelectorAll('.date').forEach(element => {
                    element.innerHTML = new Date(parseInt(element.getAttribute('time_stamp'))*1000)
                                            .toLocaleString(undefined,{
                                                year: 'numeric',
                                                month: 'numeric',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            });
                });
            });
        </script>
        <footer class="footer">
            <div class="footer-content">
                <ul class="footer-links">
                    ${Object.values(Config.get('friend_link') as { url: string, name: string; }[]).map(item => html`
                    <li><a href="${item.url}" target="_blank">${item.name}</a></li>
                    `)}
                </ul>
                <div class="developer-info">
                    <a href="https://github.com/OrganizationNameIsNotAvailable/Forum" target="_blank">Git</a>
                    <a href="https://bun.sh/" target="_blank">Bun</a>
                    <a href="https://hono.dev/" target="_blank">Hono</a>
                    <a href="https://orm.drizzle.team/" target="_blank">Drizzle</a>
                    <a href="https://www.sqlite.org/" target="_blank">SQLite</a>
                    <a href="https://turso.tech/libsql" target="_blank">LibSQL</a>
                    <a href="https://github.com/cure53/DOMPurify" target="_blank">DOMPurify</a>
                    <a href="https://github.com/kkomelin/isomorphic-dompurify" target="_blank">Isomorphic</a>
                </div>
            </div>
        </footer>
        </body>
        </html>
    `
}