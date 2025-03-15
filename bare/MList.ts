import { html } from "hono/html";
import { Header, Footer } from "./Common"
import { Props } from "../app/base";

export function MList(z: Props) {
    return html`
${Header(z)}

<button onclick="mClear()">【清空消息】</button>
<div id="list"></div>
<a href="javascript:;" onclick="mFetch();">【加载更多】</a>

<script>
let pid = 0;
async function mClear() {
    const response = await fetch('/_mClear');
    if (response.ok) {
        document.getElementById('list').innerHTML = '';
    }
}
async function mFetch() {
    try {
        const response = await fetch('/_mList?type=1&pid='+pid);
        const data = await response.json();
        if (data.length) {
            pid = data.at(-1).post_pid;
            console.log(pid)
        } else {
            alert('没有更多通知了');
        }
        data.forEach(function(row){
            document.getElementById('list').innerHTML += '<div class="message" pid="'+row.post_pid+'">';
            document.getElementById('list').innerHTML += '<i style="color:grey;font-size:10px;">'+row.quote_content+'</i><br />';
            document.getElementById('list').innerHTML += '<a href="/p/'+row.post_pid+'" target="_blank">';
            document.getElementById('list').innerHTML += '<b>'+row.post_name+'</b>: ';
            document.getElementById('list').innerHTML += ''+row.post_content+'<br />';
            document.getElementById('list').innerHTML += '</div><hr />'
        });
    } catch (error) {
        console.error("获取数据失败:", error);
    }
}
mFetch();
</script>

${Footer(z)}
    `;
}