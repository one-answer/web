import { html, raw } from "hono/html";
import { HTMLText } from "../route/core";
import { NListProps } from "../route/nList";

export default function (z: NListProps) {
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
    <div id="left">
        <ul>
            ${z.data.map(item => html`
            <li><a href="/t/${item.tid}?uid=-${item.uid}&pid=${item.last_pid}" target="contentFrame">
                ${raw(item.subject)}<br />
                <small>${raw(HTMLText(item.content, 20))}</small>
            </a></li>
            `)}
        </ul>
    </div>
    <div id="right">
        <iframe id="contentFrame" name="contentFrame" src=""></iframe>
    </div>
</body>
</html>
    `;
}