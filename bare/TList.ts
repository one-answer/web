import { html, raw } from "hono/html";
import { TListProps } from "../app/tList";
import { Header, Footer } from "./Common"

export function TList(z: TListProps) {
    return html`
        ${Header(z)}
        <main class="container">
            <div class="post-list">
                ${z.data.map(item => html`
                <a href="/t/${item.tid}" class="post-item">
                    <div class="post-info">${raw(item.subject)}</div>
                    <div class="post-meta">
                        <span class="author">${item.username}</span>
                        <span class="date" time_stamp="${item.create_date}"></span>
                        ${item.last_username ? html`
                        <span class="replies">&#x276E;&nbsp;${item.posts - 1}</span>
                        <span class="author">${item.last_username}</span>
                        ` : ''}
                    </div>
                </a>
                `)}
            </div>
            <div class="pagination">
                ${z.pagination.map(item => html`
                <a ${item ? html`href="/${item}"` : ''} class="page-btn ${item == z.page ? 'active' : ''}">${item ? item : '...'}</a>
                `)}
            </div>
        </main>
        ${Footer(z)}
    `
}