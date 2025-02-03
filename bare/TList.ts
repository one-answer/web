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
                        <span class="author">${item.name}</span>
                        <span class="date" time_stamp="${item.create_date}"></span>
                        ${item.last_name ? html`
                        <span class="replies">&#x276E;&nbsp;${item.posts - 1}</span>
                        <span class="author">${item.last_name}</span>
                        <span class="date" time_stamp="${item.last_date}"></span>
                        ` : ''}
                    </div>
                </a>
                `)}
            </div>
            ${z.data.length ? html`
            <div class="pagination">
                <a href="/m/${z.data.at(0)?.last_date}" class="page-btn">上页</a>
                <a href="/l/${z.data.at(-1)?.last_date}" class="page-btn">下页</a>
            </div>
            `: ''}
        </main>
        ${Footer(z)}
    `
}