import { html } from "hono/html";
import { Props } from "../app/base";
import { Config, Status } from "../app/core";

export async function Header(z: Props) {
    return html`
<!DOCTYPE HTML>
<html class="h-full bg-gray-100">
<head>
  <meta charset="UTF-8">
  <title>${z.title}</title>
  <link rel="stylesheet" type="text/css" href="/a.css" />
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${z.external ?? ''}
</head>
<body class="h-full flex flex-col">
<nav class="fixed top-0 left-0 w-full bg-white shadow-md z-50">
    <div class="container mx-auto px-4 py-3 flex justify-between items-center">
        <a href="/" class="text-xl font-bold">${Config.get('site_name')}</a>
        <button onclick="document.getElementById('nav-menu').classList.toggle('hidden')" class="md:hidden text-gray-700 focus:outline-none">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
        </button>
        <ul id="nav-menu" class="hidden md:flex md:space-x-6 absolute md:relative top-full md:top-0 left-0 w-full md:w-auto bg-white shadow-md md:shadow-none py-2 md:py-0 flex-col md:flex-row items-center md:items-start">
        ${z.i ? html`
          ${Object.hasOwn(z.a.req.param(), 'tid') ? html`
            <li class="px-4 py-2 md:px-0 md:py-0 border-b md:border-none"><a href="/e/${z.a.req.param('tid')}" class="block text-gray-700 hover:text-blue-600">回复</a></li>
          ` : html`
            <li class="px-4 py-2 md:px-0 md:py-0 border-b md:border-none"><a href="/e" class="block text-gray-700 hover:text-blue-600">发表</a></li>
          `}
            <li class="px-4 py-2 md:px-0 md:py-0 border-b md:border-none"><a href="/n" class="block text-gray-700 hover:text-blue-600 ${await Status(z.i.uid) ? 'text-orange-500 drop-shadow-xs' : ''}">通知</a></li>
            <li class="px-4 py-2 md:px-0 md:py-0 border-b md:border-none"><a href="/i" class="block text-gray-700 hover:text-blue-600">设置</a></li>
            <li class="px-4 py-2 md:px-0 md:py-0 border-b md:border-none"><a href="javascript:logout();" class="block text-gray-700 hover:text-blue-600">退出</a></li>
        `: html`
            <li class="px-4 py-2 md:px-0 md:py-0 border-b md:border-none"><a href="/auth" class="block text-gray-700 hover:text-blue-600">登录</a></li>
        `}
        </ul>
    </div>
</nav>
<main class="flex-grow break-words break-all pt-20">
    `
}

export function Footer(z: Props) {
    return html`
</main>
<script>
    async function logout() {
        if ((await fetch(new Request("/logout", {method: "POST"}))).ok) {
            location.reload();
        }
    }
    window.addEventListener('load', function() {
        document.querySelectorAll('.date').forEach(element => {
            element.innerHTML = new Date(parseInt(element.getAttribute('time_stamp'))*1000)
                                    .toLocaleString(undefined,{
                                        year: 'numeric',
                                        month: 'numeric',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    });
        });
    });
</script>
<footer class="bg-gray-800 px-4 py-6 w-full text-center flex flex-wrap justify-center space-x-4 mt-6">
  ${Object.values(Config.get('friend_link') as { url: string, name: string; }[] ?? {}).map(item => html`
  <a href="${item.url}" target="_blank" class="text-gray-300 hover:text-white transition">${item.name}</a>
  `)}
</footer>
</body>
</html>
    `
}