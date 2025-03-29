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
            }
            .ql-editor,.ql-container {
                min-height: 350px;
            }
        </style>
    `)
    return html`
${Header(z)}

<div class="container mx-auto max-w-5xl">
    <div class="card bg-base-100 shadow-lg">
        <div class="card-body p-6">
            <h2 class="card-title mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                ${z.thread ? '回复帖子' : '发表新帖'}
            </h2>
            <div name="content">${z.content}</div>
            <div class="card-actions justify-end mt-6">
                <div class="join">
                    <button class="btn join-item btn-primary" onclick="post(${z.eid})">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        提交
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<script src="/quill.js"></script>
<script>
    const quill = new Quill('[name="content"]', {
        modules: {
            toolbar: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                ['bold', 'italic', 'underline', 'code-block', 'link'],
                ['image'],
                ['clean']
            ]
        },
        theme: 'snow',
        placeholder: '请输入内容...'
    });
    const toolbar = quill.getModule('toolbar');
    toolbar.addHandler('image', upload);
</script>

${Footer(z)}
`;
}