import { html, raw } from "hono/html";
import { PListProps } from "../route/pList";
import Header from "./header"
import Footer from "./footer"

export default function (z: PListProps) {
    return html`
        ${Header(z)}
        <main class="container">
            <div class="post-list">
                ${z.data.map(item => html`
                <div class="post-item">
                    <div class="post-info">${raw(item.message_fmt)}</div>
                    <div class="post-meta">
                        <span class="author">${item.username}</span>
                        <span class="date" time_stamp="${item.create_date}"></span>
                        ${(z.i && z.i.uid == item.uid) ? html`
                        <a class="edit" href="/e/-${item.pid}">编辑</a>
                        `: ''}
                        <a class="reply" href="/e/${item.pid}">回复</a>
                    </div>
                </div>
                `)}
            </div>
            <div class="pagination">
                ${z.pagination.map(item => html`
                <a ${item ? html`href="/t/${z.topic.tid}/${item}"` : ''} class="page-btn ${item == z.page ? 'active' : ''}">${item ? item : '...'}</a>
                `)}
            </div>
        </main>
        ${Footer(z)}
    `;
}