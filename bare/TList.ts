import { html, raw } from "hono/html";
import { TListProps } from "../app/tList";
import { Header, Footer } from "./Common"
import { URLQuery } from "../app/base";

export function TList(z: TListProps) {
    return html`
        ${Header(z)}
        <main class="mdui-container">
            <div class="mdui-list mdui-m-t-2">
                ${z.data.map(item => html`
                <a class="mdui-list-item mdui-ripple" href="/t/${item.tid}">
                    <div class="mdui-list-item-content">
                        <div class="mdui-list-item-title mdui-list-item-one-line">
                            ${raw(item.subject)}
                        </div>
                        <div class="mdui-list-item-text">
                            <span class="author">${item.name}</span>
                            <span class="date" time_stamp="${item.create_date}"></span>
                            ${item.last_name ? html`
                            <span class="replies">&#x276E;&nbsp;${item.posts - 1}</span>
                            <span class="author">${item.last_name}</span>
                            <span class="date" time_stamp="${item.last_date}"></span>
                            ` : ''}
                        </div>
                    </div>
                </a>
                <div class="mdui-divider"></div>
                `)}
            </div>
            ${z.data.length ? html`
            <div class="pagination mdui-m-b-5">
                <a href="/m/${z.data.at(0)?.last_date}${URLQuery(z.a)}" class="mdui-btn mdui-btn-dense mdui-ripple">上页</a>
                <a href="/l/${z.data.at(-1)?.last_date}${URLQuery(z.a)}" class="mdui-btn mdui-btn-dense mdui-ripple">下页</a>
            </div>
            `: ''}
        </main>
        ${Footer(z)}
    `
}