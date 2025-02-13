import { html, raw } from "hono/html";
import { HTMLText } from "../app/base";
import { NListProps } from "../app/nList";

export function NList(z: NListProps) {
return html`
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${z.title}</title>
    <style>
        /* 没钱购买 Cursor Pro 套餐 以下代码由 GPT-4o-mini 生成  */
        body {
            display: flex;
            height: 100vh;
            margin: 0;
        }
        #left {
            width: 25%; /* 左侧宽度 */
            border-right: 1px solid #ccc;
            height: 100%; /* 设置高度为100% */
            overflow-y: auto; /* 允许垂直滚动 */
        }
        #right {
            width: 75%; /* 右侧宽度 */
        }
        iframe {
            width: 100%;
            height: 100%;
            border: none;
        }
    </style>
</head>
<body>
    <div id="left" style="padding:0 10px">
        <h3><a href="javascript:location.href=document.referrer">返回</a></h3>
        ${z.data.map(item => html`
        <hr />
        <div style="${item.unread ? 'background:yellow' : ''}">
            <a href="/t/${item.tid}/m/${item.read_pid - 1}?uid=-${item.uid}#p${item.read_pid}" target="contentFrame">
                ${raw(item.subject)}<br />
                <small>${raw(HTMLText(item.content, 20))}</small>
            </a>
        </div>
        `)}
    </div>
    <div id="right">
        <iframe id="contentFrame" name="contentFrame" src=""></iframe>
    </div>
</body>
</html>
`;
}