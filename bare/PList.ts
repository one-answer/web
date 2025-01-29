import { html, raw } from "hono/html";
import { HTMLText, URLQuery } from "../app/base";
import { PListProps } from "../app/pList";
import { Header, Footer } from "./Common"

export function PList(z: PListProps) {
    return html`
        ${Header(z)}
        <main class="container">
            <div class="post-list">
                ${z.data.map(item => html`
                <div class="post-item" id="p${item.pid}" style="${(item.pid > z.pid) ? 'background:#FFF0F5' : ''}">
                    <div class="post-info">
                        ${item.quote_name ? html`
                        <blockquote class="blockquote">
                            ${raw(item.quote_name)}: ${raw(HTMLText(item.quote_content, 140))}
                        </blockquote>
                        ` : ''}
                        ${raw(item.content)}
                    </div>
                    <div class="post-meta">
                        <span class="author">${item.name}</span>
                        <span class="date" time_stamp="${item.create_date}"></span>
                            ${(z.i) ? html`
                            ${(z.i.uid == item.uid || z.i.gid == 1) ? html`
                            <a class="edit" href="/e/-${item.pid}">编辑</a>
                            <a class="edit" href="javascript:omit(-${item.pid});">删除</a>
                            `: ''}
                            <a class="reply" href="/e/${item.pid}">回复</a>
                            `: ''}
                    </div>
                </div>
                `)}
            </div>
            <div class="pagination">
                ${z.pagination.map(item => html`
                <a ${item ? html`href="/t/${z.topic.tid}/${item}${URLQuery(z.a)}"` : ''} class="page-btn ${item == z.page ? 'active' : ''}">${item ? item : '...'}</a>
                `)}
            </div>
        </main>
        <script>
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