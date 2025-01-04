import { html, raw } from "hono/html";
import { PListProps } from "../route/pList";
import Header from "./header"
import Footer from "./footer"

export default function (props: PListProps) {
    return html`
        ${Header(props)}
        <main class="container">
            <div class="post-list">
                ${props.data.map(item => html`
                <div class="post-item">
                    <div class="post-info">${raw(item.message_fmt)}</div>
                    <div class="post-meta">
                        <span class="author">${item.username}</span>
                        <span class="date" time_stamp="${item.create_date}"></span>
                        <span class="pid">${item.pid}</span>
                    </div>
                </div>
                `)}
            </div>
            <div class="pagination">
                ${props.pagination.map(item => html`
                <a ${item ? html`href="/t/${props.topic.tid}/${item}"` : ''} class="page-btn ${item == props.page ? 'active' : ''}">${item ? item : '...'}</a>
                `)}
            </div>
        </main>
        ${Footer(props)}
    `;
}