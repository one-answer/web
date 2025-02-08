import { html, raw } from "hono/html";
import { HTMLText, URLQuery } from "../app/base";
import { PListProps } from "../app/pList";
import { Header, Footer } from "./Common"

export function PList(z: PListProps) {
    return html`
        ${Header(z)}
        <main class="mdui-container">
            <div class="mdui-list mdui-m-t-2">
                ${z.data.map(item => html`
                <div class="mdui-card mdui-m-b-2" id="p${item.pid}">
                    <div class="mdui-card-content">
                        ${item.quote_name ? html`
                        <blockquote class="blockquote mdui-color-theme">
                            <span class="mdui-text-color-theme">${raw(item.quote_name)}: ${raw(HTMLText(item.quote_content, 140))}</span>
                        </blockquote>
                        ` : ''}
                        ${raw(item.content)}
                    </div>
                    <div class="mdui-card-actions">
                        <div class="post-meta">
                            <a href="/?uid=${item.uid}" target="_blank" class="author">${item.name}</a>
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
                </div>
                `)}
            </div>
            ${z.data.length ? html`
            <div class="pagination mdui-m-b-5">
                <a href="javascript:history.back()" class="mdui-btn mdui-btn-dense mdui-ripple mdui-shadow-2">返回</a>
                <a href="/t/${z.thread.tid}/l/${z.data.at(0)?.pid}${URLQuery(z.a)}" class="mdui-btn mdui-btn-dense mdui-ripple mdui-shadow-2">上页</a>
                <a href="/t/${z.thread.tid}/m/${z.data.at(-1)?.pid}${URLQuery(z.a)}" class="mdui-btn mdui-btn-dense mdui-ripple mdui-shadow-2">下页</a>
            </div>
            `: ''}
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