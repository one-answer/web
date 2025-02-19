import { html, raw } from "hono/html";
import { TListProps } from "../app/tList";
import { Header, Footer } from "./Common"
import { URLQuery } from "../app/base";

export function TList(z: TListProps) {
    const lastDateArr = Array.from(z.data.values().map(value => value.last_date));
    return html`
${Header(z)}

<div class="space-y-2">
${z.data.map(item => html`
    <a class="container block w-full mx-auto max-w-4xl px-5 py-3 bg-white shadow-md rounded-lg  ${item.is_top ? 'border-l-4 border-gray-500 pl-5' : ''}" href="/t/${item.tid}">
        <div class="text-base font-normal">
            ${raw(item.subject)}
        </div>
        <div class="text-xs text-gray-400 mt-1">
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
    <a href="/m/${Math.max(...lastDateArr)}${URLQuery(z.a)}" class="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600">
        上页
    </a>
    <a href="/l/${Math.min(...lastDateArr)}${URLQuery(z.a)}" class="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600">
        下页
    </a>
</nav>
`: ''}

${Footer(z)}
    `
}