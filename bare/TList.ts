import { html, raw } from "hono/html";
import { TListProps } from "../app/tList";
import { Header, Footer } from "./Common"
import { URLQuery } from "../app/core";

export function TList(z: TListProps) {
    return html`
${Header(z)}

<div class="max-w-5xl mx-auto">
    <!-- 顶部操作栏 -->
    <div class="flex justify-between items-center mb-6 px-4 lg:px-0">
        <h1 class="text-xl lg:text-2xl font-bold">讨论区</h1>
        ${!z.edit_forbid ? html`
            <a href="/e" class="btn btn-primary btn-sm lg:btn-md gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span class="hidden sm:inline">发表</span>
                <span class="sm:hidden">发帖</span>
            </a>
        ` : ''}
    </div>

    <!-- 帖子列表 -->
    <div class="px-4 lg:px-0">
        ${z.data.map(item => html`
            <a href="/t/${item.tid}" class="block card bg-base-100 shadow-sm hover:shadow-md transition-all duration-200 mb-4">
                <div class="card-body p-4">
                    <div class="flex items-start gap-4">
                        <!-- 左侧信息 -->
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 mb-2 flex-wrap">
                                ${item.is_top && !z.uid ? html`
                                    <div class="badge badge-primary badge-sm lg:badge-md">置顶</div>
                                ` : ''}
                                <h2 class="card-title text-base lg:text-lg hover:text-primary truncate">
                                    ${raw(item.subject)}
                                </h2>
                            </div>
                            <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-base-content/70">
                                <div class="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span class="truncate max-w-[120px]">${item.name}</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span class="date whitespace-nowrap" time_stamp="${item.time}"></span>
                                </div>
                                ${item.last_name ? html`
                                    <div class="flex items-center gap-2 w-full sm:w-auto">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                        </svg>
                                        <span class="truncate">最后回复: ${item.last_name}</span>
                                        <span class="date whitespace-nowrap" time_stamp="${item.last_time}"></span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        <!-- 右侧统计 -->
                        <div class="flex items-center">
                            <div class="stat px-2 py-1 lg:px-3">
                                <div class="stat-title text-xs">回复</div>
                                <div class="stat-value text-base lg:text-lg">${item.posts - 1}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </a>
        `)}
    </div>

    <!-- 分页 -->
    ${z.data.length ? html`
        <div class="flex justify-center my-8">
            <div class="join shadow-sm">
                ${z.pagination.map(item => html`
                    ${item ? html`
                        <a href="/${item}${URLQuery(z.a)}" 
                           class="join-item btn btn-sm ${item == z.page ? 'btn-primary' : 'btn-ghost'}">${item}</a>
                    ` : html`
                        <span class="join-item btn btn-sm btn-disabled">...</span>
                    `}
                `)}
            </div>
        </div>
    `: html`
        <div class="hero min-h-[300px] bg-base-100 rounded-lg shadow-sm mx-4 lg:mx-0">
            <div class="hero-content text-center">
                <div class="max-w-md">
                    <h2 class="text-xl lg:text-2xl font-bold mb-4">暂无内容</h2>
                    <p class="text-base-content/60 mb-6">还没有任何帖子，来发表第一个帖子吧！</p>
                    ${!z.edit_forbid ? html`
                        <a href="/e" class="btn btn-primary gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                            </svg>
                            发表
                        </a>
                    ` : ''}
                </div>
            </div>
        </div>
    `}
</div>

${Footer(z)}
    `
}