import { html, raw } from "hono/html";
import { tListProps } from "../route/tList";
import Header from "./header"
import Footer from "./footer"

export default function (props: tListProps) {
    return html`
        ${Header(props)}
        <main class="container">
            <div class="post-list">
                ${props.data.map(item => html`
                <a href="/t/${item.tid}" class="post-item">
                    <div class="post-info">${raw(item.subject)}</div>
                    <div class="post-meta">
                        <span class="author">${item.username}</span>
                        <span class="replies">&#x276F;&nbsp;${item.posts}</span>
                        <span class="date" time_stamp="${item.create_date}"></span>
                    </div>
                </a>
                `)}
            </div>
            <div class="pagination">
                ${props.pagination.map(item => html`
                <a ${item ? html`href="/c/${item}"` : ''} class="page-btn ${item == props.page ? 'active' : ''}">${item ? item : '...'}</a>
                `)}
            </div>
        </main>
        ${Footer()}
    `
}