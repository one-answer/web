// 发表帖子
async function post(eid) {
    const data = new FormData();
    data.set('content', quill.getSemanticHTML());
    const result = await fetch(new Request('/e/' + eid, { method: 'POST', body: data }))
    if (result.ok) {
        window.location = document.referrer
    } else {
        const errorMsg = await result.text();
        const toast = document.createElement('div');
        toast.className = 'toast toast-top toast-center';
        toast.style.marginTop = '4rem'; // 添加上边距，避免被导航栏遮挡
        toast.innerHTML = `
            <div class="alert alert-error">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>提交失败：${errorMsg}</span>
            </div>
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
};

// 删除帖子
async function omit(eid) {
    if (!confirm('真的要删除吗?')) { return; }
    const result = await fetch(new Request('/e/' + eid, { method: 'DELETE' }))
    if (result.ok) {
        window.location = document.referrer
    } else {
        const errorMsg = await result.text();
        const toast = document.createElement('div');
        toast.className = 'toast toast-top toast-center';
        toast.style.marginTop = '4rem'; // 添加上边距，避免被导航栏遮挡
        toast.innerHTML = `
            < div class="alert alert-error" >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>删除失败：${errorMsg}</span>
            </div >
            `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
};