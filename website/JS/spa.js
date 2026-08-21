(function() {
    'use strict';

    const appContainer = document.getElementById('app');
    const navLinks = document.querySelectorAll('#navbar .nav-links a');

    // 页面映射：页面标识 → 内容文件路径（相对路径，基于当前目录）
    const pageMap = {
        'index': './website/HTML/content_index.html',
        'apps': './website/HTML/content_apps.html',
        'about': './website/HTML/content_about.html'
    };

    let currentPage = '';

    // 核心：加载页面（不改变地址栏）
    async function loadPage(page) {
        if (page === currentPage) return;

        const url = pageMap[page];
        if (!url) {
            console.warn('未知页面:', page);
            return;
        }

        // 显示加载状态
        appContainer.innerHTML = '<div style="text-align:center;padding:60px 0;color:var(--text-muted);">加载中…</div>';

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('HTTP ' + response.status);
            const html = await response.text();

            // 注入内容
            appContainer.innerHTML = html;
            currentPage = page;

            // 更新导航高亮
            navLinks.forEach(link => {
                const isActive = link.dataset.page === page;
                link.classList.toggle('active', isActive);
            });

            // 如果切换到应用页，初始化 apps.js
            if (page === 'apps' && typeof window.initApps === 'function') {
                setTimeout(window.initApps, 50);
            }

        } catch (err) {
            console.error('加载页面失败:', err);
            appContainer.innerHTML = '<div style="text-align:center;padding:60px 0;color:var(--text-muted);">⚠️ 加载失败，请刷新重试</div>';
        }
    }

    // ---- 导航点击事件 ----
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            if (page) {
                loadPage(page);
            }
        });
    });

    // ---- 初始化：默认加载首页 ----
    function init() {
        // 默认加载首页，且不改变地址栏
        loadPage('index');
    }

    // ---- 暴露刷新方法（调试用） ----
    window.refreshPage = function() {
        loadPage(currentPage);
    };

    // ---- 启动 ----
    init();
})();
