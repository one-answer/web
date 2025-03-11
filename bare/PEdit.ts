import { html, raw } from "hono/html";
import { PEditProps } from "../app/pEdit";
import { Header, Footer } from "./Common"

export function PEdit(z: PEditProps) {
    z.head_external = raw(`
        <link href="/quill.snow.css" rel="stylesheet" />
        <style>
            .ql-toolbar.ql-snow {
                border-top-left-radius: 0.5rem;
                border-top-right-radius: 0.5rem;
                background: #f8f9fa;
                border-color: #e2e8f0;
            }
            .ql-container.ql-snow {
                border-bottom-left-radius: 0.5rem;
                border-bottom-right-radius: 0.5rem;
                border-color: #e2e8f0;
                min-height: 200px;
            }
        </style>
    `)
    return html`
${Header(z)}

<div class="container mx-auto max-w-4xl px-4 py-6">
    <div class="card bg-base-100 shadow-lg">
        <div class="card-body p-6">
            <h2 class="card-title mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                ${z.thread ? '回复帖子' : '发表新帖'}
            </h2>
            <div name="content" class="min-h-[300px]">${z.content}</div>
            <div class="card-actions justify-end mt-6">
                <div class="join">
                    <button class="btn join-item btn-primary" onclick="save()">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        提交
                    </button>
                    <button class="btn join-item btn-error" onclick="omit()">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        删除
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<script src="/quill.js"></script>
<script>
    const quill = new Quill('[name="content"]', { 
        theme: 'snow',
        placeholder: '请输入内容...'
    });
    
    async function save() {
        const data = new FormData();
        data.set('content', quill.getSemanticHTML());
        const result = await fetch(new Request('', {method: 'POST', body: data}))
        if (result.ok) {
            window.location=document.referrer
        } else { 
            const errorMsg = await result.text();
            const toast = document.createElement('div');
            toast.className = 'toast toast-top toast-center';
            toast.style.marginTop = '4rem'; // 添加上边距，避免被导航栏遮挡
            toast.innerHTML = \`
                <div class="alert alert-error">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>提交失败：\${errorMsg}</span>
                </div>
            \`;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }
    };
    
    async function omit() {
        if(!confirm('真的要删除吗?')){return;}
        const result = await fetch(new Request('', {method: 'DELETE'}))
        if (result.ok) {
            window.location=document.referrer
        } else { 
            const errorMsg = await result.text();
            const toast = document.createElement('div');
            toast.className = 'toast toast-top toast-center';
            toast.style.marginTop = '4rem'; // 添加上边距，避免被导航栏遮挡
            toast.innerHTML = \`
                <div class="alert alert-error">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>删除失败：\${errorMsg}</span>
                </div>
            \`;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }
    };
</script>

${Footer(z)}
`;
}