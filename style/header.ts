import { html } from "hono/html";
import { BaseProps } from "../route/base";

export default function (z: BaseProps) {
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