import { Context } from "hono";
import { DB, Thread, User } from "./base";
import { Config, Counter, Pagination } from "./core";
import { desc, eq, getTableColumns } from 'drizzle-orm';
import { html, raw } from "hono/html";

export default async function (a: Context) {

    const page = parseInt(a.req.param('page') ?? '0') || 1
    const pagination = Pagination(20, new Counter('T').get(), page, 2)
    const data = await DB
        .select({
            ...getTableColumns(Thread),
            username: User.username,
            credits: User.credits,
            gid: User.gid,
        })
        .from(Thread)
        .leftJoin(User, eq(Thread.uid, User.uid))
        .orderBy(desc(Thread.create_date))
        .offset((page - 1) * 20)
        .limit(20);

    return a.html(html`
<!DOCTYPE HTML>
<html>
<head>
    <meta charset="UTF-8">
    <title>${Config.get('site_name')}</title>
    <link rel="stylesheet" type="text/css" href="/style.css" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <header class="header">
        <h1><a href="/">${Config.get('site_name')}</a></h1>
        <div>
            <input type="checkbox" id="menu-toggle" class="menu-toggle">
            <label for="menu-toggle" class="menu-toggle-label">菜单 ☰</label>
            <div class="header-buttons">
                <a href="#" class="login-btn">首页</a>
                <a href="#" class="login-btn">发帖</a>
                <a href="#" class="login-btn">搜索</a>
                <a href="#" class="login-btn">登录</a>
            </div>
        </div>
    </header>
    <main class="container">
        <div class="post-list">
            ${data.map(item => html`
            <a href="/t/${item.tid}" class="post-item">
                <div class="post-title">${raw(item.subject)}</div>
                <div class="post-meta">
                    <span class="author">${item.username}</span>
                    <span class="replies">&#x276F;&nbsp;${item.posts}</span>
                    <span class="date" time_stamp="${item.create_date}"></span>
                </div>
            </a>
            `)}
        </div>
        <div class="pagination">
            ${pagination.map(item => html`
            <a ${item ? html`href="/c/${item}"` : ''} class="page-btn ${item == page ? 'active' : ''}">${item ? item : '...'}</a>
            `)}
        </div>
    </main>
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
    <script>
        window.addEventListener('load', function() {
            document.querySelectorAll('.date').forEach(element => {
                element.innerHTML = new Date(parseInt(element.getAttribute('time_stamp'))*1000).toLocaleString();
            });
        });
    </script>
</body>
</html>
                `);

}