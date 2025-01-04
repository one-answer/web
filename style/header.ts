import { html } from "hono/html";
import { BaseProps } from "../route/base";

export default function (props: BaseProps) {
    return html`
        <!DOCTYPE HTML>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${props.title}</title>
            <link rel="stylesheet" type="text/css" href="/app.css" />
            ${props.external_css ?? ''}
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
        <header class="header">
            <h1><a href="/">${props.title}</a></h1>
            <div>
                <input type="checkbox" id="menu-toggle" class="menu-toggle">
                <label for="menu-toggle" class="menu-toggle-label">菜单 ☰</label>
                <div class="header-buttons">
                    ${props.i ? html`
                        <a class="login-btn" href="/edit${props.edit_target ? `/${props.edit_target}` : ''}">发帖</a>
                        <a class="login-btn" href="/conf">设置</a>
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