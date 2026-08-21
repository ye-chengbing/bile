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

    // 核心：加载页面
    async function loadPage(page) {
        // 如果点击的是当前页面，不重复加载
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
                // 给 DOM 一点渲染时间
                setTimeout(window.initApps, 50);
            }

            // 更新浏览器地址栏（仅用于记录，不触发跳转）
            let targetPath;
            if (page === 'index') {
                targetPath = '/bile/';
            } else {
                targetPath = '/bile/' + page;
            }
            // 如果当前地址与目标地址不同，才 pushState
            if (window.location.pathname !== targetPath && window.location.pathname !== targetPath + '/') {
                window.history.pushState({ page: page }, '', targetPath);
            }

        } catch (err) {
            console.error('加载页面失败:', err);
            appContainer.innerHTML = '<div style="text-align:center;padding:60px 0;color:var(--text-muted);">⚠️ 加载失败，请刷新重试</div>';
        }
    }

    // ---- 导航点击事件（完全由 JS 控制） ----
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // 阻止一切默认行为
            const page = this.dataset.page;
            if (page) {
                loadPage(page);
            }
        });
    });

    // ---- 浏览器前进/后退 ----
    window.addEventListener('popstate', function(e) {
        const page = e.state?.page || 'index';
        // popstate 时只切换内容，不再次 pushState
        loadPage(page, true); // 传入第二个参数表示“静默切换”
    });

    // ---- 初始化：根据当前 URL 决定显示哪个页面 ----
    function init() {
        const path = window.location.pathname;
        let page = 'index';

        // 从路径中提取页面标识
        if (path.includes('/apps')) page = 'apps';
        else if (path.includes('/about_us') || path.includes('/about')) page = 'about';

        // 加载页面（首次加载不 pushState）
        loadPage(page);
    }

    // ---- 暴露刷新方法（调试用） ----
    window.refreshPage = function() {
        loadPage(currentPage);
    };

    // ---- 启动 ----
    init();
})();(function() {
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
