import { html } from "hono/html";
import { Props } from "../app/data";
import { Config, Status } from "../app/base";

export async function Header(z: Props) {
    return html`
        <!DOCTYPE HTML>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${z.title}</title>
            <link rel="stylesheet" type="text/css" href="/a.css" />
            <link rel="stylesheet" href="https://unpkg.com/mdui@1.0.2/dist/css/mdui.min.css">
            <script src="https://unpkg.com/mdui@1.0.2/dist/js/mdui.min.js"></script>
            ${z.external_css ?? ''}
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body class="mdui-theme-layout-light mdui-theme-primary-indigo mdui-theme-accent-pink">
        <header class="mdui-appbar">
            <div class="mdui-toolbar mdui-color-theme">
                <a href="javascript:;" class="mdui-btn mdui-btn-icon mdui-ripple">
                    <i class="mdui-icon material-icons">menu</i>
                </a>
                <a href="/" class="mdui-typo-headline">${Config.get('site_name')}</a>
                <div class="mdui-toolbar-spacer"></div>
                <div>
                    <ul class="mdui-menu mdui-hidden-md-up" id="phone-menu">
                        ${z.i ? html`
                            ${Object.hasOwn(z.a.req.param(), 'tid') ? html`
                            <li class="mdui-menu-item">
                                <a href="/e/${z.a.req.param('tid')}" class="mdui-ripple">回复</a>
                            </li>
                            ` : html`
                            <li class="mdui-menu-item">
                                <a href="/e" class="mdui-ripple">发表</a>
                            </li>
                            `}
                            <li class="mdui-menu-item">
                                <a class="mdui-ripple ${await Status(z.i.uid) ? 'mdui-text-color-theme-accent' : '' }" href="/n">通知</a>
                            </li>
                            <li class="mdui-menu-item">
                                <a class="mdui-ripple" href="/i"}>设置</a>
                            </li>
                            <li class="mdui-divider"></li>
                            <li class="mdui-menu-item">
                                <a class="mdui-ripple" href="javascript:;" onclick="logout();">退出</a>
                            </li>
                        `: html`
                            <li class="mdui-menu-item">
                                <a class="mdui-ripple" href="/auth">登录</a>
                            </li>
                        `}
                    </ul>
                    <button id="menu-toggle" class="mdui-btn mdui-hidden-md-up" mdui-menu="{target: '#phone-menu'}">
                        <i class="mdui-icon material-icons">menu</i> 菜单
                    </button>
                    <div class="mdui-hidden-sm-down">
                        ${z.i ? html`
                            ${Object.hasOwn(z.a.req.param(), 'tid') ? html`
                            <a class="mdui-btn mdui-btn-dense mdui-btn-raised mdui-ripple mdui-shadow-2" href="/e/${z.a.req.param('tid')}">回复</a>
                            ` : html`
                            <a class="mdui-btn mdui-btn-dense mdui-btn-raised mdui-ripple mdui-shadow-2" href="/e">发表</a>
                            `}
                            <a class="mdui-btn mdui-btn-dense mdui-btn-raised mdui-ripple mdui-shadow-2" href="/n" style="${await Status(z.i.uid) ? 'background:yellow' : ''}">通知</a>
                            <a class="mdui-btn mdui-btn-dense mdui-btn-raised mdui-ripple mdui-shadow-2" href="/i">设置</a>
                            <a class="mdui-btn mdui-btn-dense mdui-btn-raised mdui-ripple mdui-shadow-2" href="javascript:;" onclick="logout();">退出</a>
                        `: html`
                            <a class="mdui-btn mdui-btn-dense mdui-btn-raised mdui-ripple mdui-shadow-2" href="/auth">登录</a>
                        `}
                    </div>
                </div>
            </div>
        </header>
    `
}

export function Footer(z: Props) {
    return html`
        <script>
            async function logout() {
                if ((await fetch(new Request("/logout", {method: "POST"}))).ok) {
                    window.location.href = "/";
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
                    ${Object.values(Config.get('friend_link') as { url: string, name: string; }[] ?? {}).map(item => html`
                    <li><a href="${item.url}" target="_blank">${item.name}</a></li>
                    `)}
                </ul>
            </div>
        </footer>
        </body>
        </html>
    `
}