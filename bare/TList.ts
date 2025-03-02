import { html, raw } from "hono/html";
import { TListProps } from "../app/tList";
import { Header, Footer } from "./Common"
import { URLQuery } from "../app/base";

export function TList(z: TListProps) {
    return html`
${Header(z)}

<div class="space-y-2">
${z.data.map(item => html`
    <a class="container block w-full mx-auto max-w-4xl px-5 py-3 bg-white shadow-md rounded-lg  ${item.is_top && !z.uid ? 'border-l-4 border-gray-500 pl-4' : ''}" href="/t/${item.tid}">
        <div class="text-base font-normal">
            ${raw(item.subject)}
        </div>
        <div class="text-xs text-gray-400 mt-1">
            <span class="author">${item.name}</span>
            <span class="date" time_stamp="${item.time}"></span>
            ${item.last_name ? html`
            &nbsp;&#x276E;&nbsp;${item.posts - 1}&nbsp;
            <span class="author">${item.last_name}</span>
            <span class="date" time_stamp="${item.last_time}"></span>
            ` : ''}
        </div>
    </a>
`)}
</div>

${z.data.length ? html`
<nav class="flex justify-center -space-x-px mt-6">
    ${z.pagination.map(item => html`
    <a ${item ? html`href="/${item}${URLQuery(z.a)}"` : ''} class="${item == z.page ?
            'relative z-10 inline-flex items-center bg-indigo-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
            :
            'relative inline-flex items-center bg-white px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
        }">${item ? item : '...'}</a>
    `)}
</nav>
`: ''}

${Footer(z)}
    `
}