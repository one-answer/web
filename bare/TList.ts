import { html, raw } from "hono/html";
import { TListProps } from "../app/tList";
import { Header, Footer } from "./Common"
import { URLQuery } from "../app/base";

export function TList(z: TListProps) {
    return html`
${Header(z)}

<div class="space-y-2">
${z.data.map(item => html`
    <a class="container block w-full mx-auto max-w-4xl px-6 py-3 bg-white shadow-md rounded-lg" href="/t/${item.tid}">
        <div class="text-base font-normal">
            ${raw(item.subject)}
        </div>
        <div class="text-xs text-gray-400 mt-1">
            ${item.is_top ? raw(`<span>&#9206;</span>`) : ''}
            <span class="author">${item.name}</span>
            <span class="date" time_stamp="${item.create_date}"></span>
            ${item.last_name ? html`
            &nbsp;&#x276E;&nbsp;${item.posts - 1}&nbsp;
            <span class="author">${item.last_name}</span>
            <span class="date" time_stamp="${item.last_date}"></span>
            ` : ''}
        </div>
    </a>
`)}
</div>

${z.data.length ? html`
<nav class="flex justify-center space-x-4 mt-6">
    <a href="/m/${z.data.at(0)?.last_date}${URLQuery(z.a)}" class="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600">
        上页
    </a>
    <a href="/l/${z.data.at(-1)?.last_date}${URLQuery(z.a)}" class="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600">
        下页
    </a>
</nav>
`: ''}

${Footer(z)}
    `
}