import { html, raw } from "hono/html";
import { HTMLText, URLQuery } from "../app/base";
import { PListProps } from "../app/pList";
import { Header, Footer } from "./Common"

export function PList(z: PListProps) {
    z.external = raw(`
    <style>
        .content a {
            text-decoration: underline;
        }
    </style>
    `);
    return html`
${Header(z)}

<div class="space-y-2">
${z.data.map(item => html`
    <div id="p${item.pid}" class="container block w-full mx-auto max-w-4xl px-6 py-3 bg-white shadow-md rounded-lg">
        ${item.quote_name ? html`
        <blockquote class="bg-gray-50 px-4 py-2 mb-2 text-gray-700 rounded-lg shadow-inner">
            ${raw(item.quote_name)}: ${raw(HTMLText(item.quote_content, 140))}
        </blockquote>
        ` : ''}
        <div class="text-base font-normal content">
            ${raw(item.content)}
        </div>
        <div class="text-xs text-gray-400 mt-1">
            <a href="/?uid=${item.uid}" target="_blank" class="author">${item.name}</a>
            <span class="date" time_stamp="${item.create_date}"></span>
            ${(z.i) ? html`
            ${(z.i.gid == 1 && !item.tid) ? html`
            <a class="sticky ${z.thread.is_top ? 'font-bold' : ''}" href="javascript:peak(${item.pid});">置顶</a>
            `: ''}
            ${(z.i.uid == item.uid || z.i.gid == 1) ? html`
            <a class="edit" href="/e/-${item.pid}">编辑</a>
            <a class="delete" href="javascript:omit(-${item.pid});">删除</a>
            `: ''}
            <a class="reply" href="/e/${item.pid}">回复</a>
            `: ''}
        </div>
    </div>
`)}
</div>

${z.data.length ? html`
<nav class="flex justify-center space-x-4 mt-6">
    <a href="/t/${z.thread.tid}/l/${z.data.at(0)?.pid}${URLQuery(z.a)}" class="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600">
        上页
    </a>
    <a href="/t/${z.thread.tid}/m/${z.data.at(-1)?.pid}${URLQuery(z.a)}" class="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600">
        下页
    </a>
</nav>
`: ''}

<script>
async function peak(tid){
        if(!confirm('置顶/取消置顶?')){return;}
        const result = await fetch(new Request('/t/'+tid, {method: 'PUT'}))
        if (result.ok) {
            location.reload();
        } else { alert('置顶失败：'+ await result.text()); }
    }
    async function omit(eid){
        if(!confirm('真的要删除吗?')){return;}
        const result = await fetch(new Request('/e/'+eid, {method: 'DELETE'}))
        if (result.ok) {
            location.reload();
        } else { alert('删除失败：'+ await result.text()); }
    }
</script>

${Footer(z)}
`;
}