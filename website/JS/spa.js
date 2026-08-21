(function() {
    'use strict';

    const appContainer = document.getElementById('app');
    const navLinks = document.querySelectorAll('#navbar .nav-links a');

    // 静态页面片段映射
    const pageMap = {
        'index': 'website/HTML/content_index.html',
        'apps': 'website/HTML/content_apps.html',
        'about': 'website/HTML/content_about.html'
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

            const targetPath = page === 'index' ? '/' : '/' + page;
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
        if (path === '/apps') page = 'apps';
        else if (path === '/about_us') page = 'about';
        loadPage(page);
    }

    window.refreshPage = function() {
        loadPage(currentPage);
    };

    init();
})();
