import { html } from "hono/html";
import { Header, Footer } from "./Common"
import { Props } from "../app/base";

export function MList(z: Props) {
    return html`
${Header(z)}

<button onclick="mClear()">【全部标记已读】</button>
<div id="list"></div>
<a href="javascript:;" onclick="mLoad();"></a>

<script>
async function mClear() {
    const response = await fetch('/_mClear');
    if(response.ok){ location.reload(); }
}
async function mFetch() {
    try {
        const response = await fetch('/_mList?type=1');
        const data = await response.json();
        let html = '';
        data.forEach(function(row){
            html += '<div class="message" pid="'+row.post_pid+'">';
            html += '<i style="color:grey;font-size:10px;">'+row.quote_content+'</i><br />';
            html += '<a href="/p/'+row.post_pid+'" target="_blank">';
            html += '<b>'+row.post_name+'</b>: ';
            html += ''+row.post_content+'<br />';
            html += '</div><hr />'
        });
        document.getElementById('list').innerHTML = html;
    } catch (error) {
        console.error("获取数据失败:", error);
    }
}
let mLast = 0;
mFetch();
</script>

${Footer(z)}
    `;
}