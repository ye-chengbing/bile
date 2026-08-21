(function() {
    'use strict';

    const appContainer = document.getElementById('app');
    const navLinks = document.querySelectorAll('#navbar .nav-links a');

    // ===== 关键：定义网站根目录 =====
    const BASE_PATH = '/bile';

    const pageMap = {
        'index': './website/HTML/content_index.html',
        'apps': './website/HTML/content_apps.html',
        'about': './website/HTML/content_about.html'
    };

    let currentPage = '';

    async function loadPage(page) {
        if (page === currentPage) return;

        const url = pageMap[page];
        if (!url) return;

        appContainer.innerHTML = '<div style="text-align:center;padding:60px 0;color:var(--text-muted);">加载中…</div>';

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('HTTP ' + response.status);
            const html = await response.text();

            appContainer.innerHTML = html;
            currentPage = page;

            navLinks.forEach(link => {
                link.classList.toggle('active', link.dataset.page === page);
            });

            if (page === 'apps' && typeof window.initApps === 'function') {
                setTimeout(window.initApps, 0);
            }

            // ===== 改动 1：地址栏路径加上 BASE_PATH =====
            const targetPath = page === 'index' ? BASE_PATH : BASE_PATH + '/' + page;
            if (window.location.pathname !== targetPath) {
                window.history.pushState({ page }, '', targetPath);
            }

        } catch (err) {
            console.error('加载页面失败:', err);
            appContainer.innerHTML = '<div style="text-align:center;padding:60px 0;color:var(--text-muted);">⚠️ 加载失败，请刷新重试</div>';
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            loadPage(page);
        });
    });

    window.addEventListener('popstate', function(e) {
        const page = e.state?.page || 'index';
        loadPage(page);
    });

    function init() {
        const path = window.location.pathname;
        let page = 'index';
        // ===== 改动 2：匹配路径时也要加上 BASE_PATH =====
        if (path === BASE_PATH + '/apps') page = 'apps';
        else if (path === BASE_PATH + '/about_us') page = 'about';
        // 如果直接访问 /bile/ 或 /bile，就留在 index
        loadPage(page);
    }

    window.refreshPage = function() {
        loadPage(currentPage);
    };

    init();
})();
