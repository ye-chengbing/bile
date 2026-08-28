window.initApps = function() {
    'use strict';

    // ---- 状态管理 ----
    const state = {
        page: 1,
        size: 6,
        total: 0,
        allApps: [],          // 从 JSON 加载的全部应用
        filteredApps: [],     // 搜索过滤后的全部应用
        displayApps: [],     // 当前页显示的应用
        searchTerm: ''
    };

    // ---- DOM 引用 ----
    const grid = document.getElementById('appGrid');
    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');
    const countNum = document.getElementById('countNum');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');

    // ---- 工具：随机图标 ----
    const icons = ['🚀', '🎮', '🌟', '💎', '🎯', '🧩', '⚡', '🌈', '🪐', '🌊'];
    function randomIcon() {
        return icons[Math.floor(Math.random() * icons.length)];
    }

    // ---- 渲染卡片 ----
    function renderApps() {
        const list = state.displayApps;
        countNum.textContent = state.total; // 显示过滤后的总数

        if (list.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <p>没有找到匹配的应用，试试其他关键词吧</p>
                </div>
            `;
            return;
        }

        let html = '';
        list.forEach((app) => {
            let optionsHtml = '';
            let firstOptionText = '下载';  // 默认显示
            if (app.download_links && app.download_links.length > 0) {
                app.download_links.forEach((link) => {
                    const platform = link.split('/').pop() || '下载';
                    optionsHtml += `<option value="${link}">${platform}</option>`;
                });
                // 取第一个选项的文字作为初始显示
                firstOptionText = app.download_links[0].split('/').pop() || '下载';
            }

            let otherBtn = '';
            if (app.other_versions_link && app.other_versions_link.trim() !== '') {
                otherBtn = `<a href="${app.other_versions_link}" class="btn-other" target="_blank">其他版本</a>`;
            }

            let extractionHtml = '';
            if (app.extraction_code && app.extraction_code !== '-1') {
                extractionHtml = `<div class="extraction-code">📦 提取码：${app.extraction_code}</div>`;
            }

            html += `
                <div class="app-card" data-id="${app.name}">
                    <div class="app-icon">${randomIcon()}</div>
                    <div class="app-name">${app.name}</div>
                    <div class="app-information">版本 ${app.version}</div>
                    <div class="app-action">
                        ${optionsHtml ? `
                            <a class="download-btn" href="#">下载</a>
                            <div class="custom-select-wrapper">
                                <div class="scroll-text">
                                    <span>${firstOptionText}</span>
                                </div>
                                <select class="platform-select">
                                    ${optionsHtml}
                                </select>
                            </div>
                        ` : ''}
                    </div>
                    ${otherBtn}
                    <div class="app-information">注意，部分下载链接来自GitHub，由于国内网络环境，速度可能会很慢甚至打不开，请耐心等待或过会再试</div>
                    ${extractionHtml}
                </div>
            `;
        });
        grid.innerHTML = html;
    }

    // ---- 更新分页按钮 ----
    function updatePagination() {
        const totalPages = Math.ceil(state.total / state.size) || 1;
        pageInfo.textContent = `第 ${state.page} / ${totalPages} 页`;
        prevBtn.disabled = state.page <= 1;
        nextBtn.disabled = state.page >= totalPages;
    }

    // ---- 加载并处理 JSON 数据 ----
    async function loadApps() {
        if (!grid) return;

        try {
            const response = await fetch('./apps.json');
            if (!response.ok) throw new Error('加载 apps.json 失败');
            const data = await response.json();

            // 转换数据格式：对象 → 数组，并规范化 download_links
            const appArray = Object.keys(data).map(key => {
                const item = data[key];
                let links = [];
                if (item.download_link) {
                    if (Array.isArray(item.download_link)) {
                        links = item.download_link;
                    } else if (typeof item.download_link === 'string' && item.download_link.trim() !== '') {
                        links = [item.download_link];
                    }
                }
                return {
                    name: key,
                    version: item.version || '0.0',
                    download_links: links,
                    other_versions_link: item.other_versions_link || '',
                    extraction_code: item.extraction_code || '-1'
                };
            });

            state.allApps = appArray;
            applySearchFilter(); // 触发初次过滤和分页
            updatePagination();

        } catch (err) {
            console.error('加载应用数据失败:', err);
            grid.innerHTML = `<div class="empty-state"><p>⚠️ 加载应用列表失败，请刷新重试</p></div>`;
        }
    }

    // ---- 搜索过滤 + 分页切片 ----
    function applySearchFilter() {
        const q = state.searchTerm.trim().toLowerCase();
        // 过滤
        state.filteredApps = state.allApps.filter(app =>
            app.name.toLowerCase().includes(q) ||
            (app.version && app.version.toLowerCase().includes(q))
        );
        state.total = state.filteredApps.length;

        // 计算总页数，修正当前页
        const totalPages = Math.ceil(state.total / state.size) || 1;
        if (state.page > totalPages) state.page = totalPages;
        if (state.page < 1) state.page = 1;

        // 切片当前页
        const start = (state.page - 1) * state.size;
        const end = start + state.size;
        state.displayApps = state.filteredApps.slice(start, end);

        renderApps();
        updatePagination();
    }

    // ---- 切换页码 ----
    function goToPage(page) {
        const totalPages = Math.ceil(state.total / state.size) || 1;
        if (page < 1 || page > totalPages) return;
        state.page = page;
        applySearchFilter(); // 重新切片
    }

    // ---- 搜索事件 ----
    function doSearch() {
        state.searchTerm = searchInput.value;
        searchClear.classList.toggle('visible', state.searchTerm.length > 0);
        state.page = 1; // 搜索后重置到第一页
        applySearchFilter();
    }

    // ---- 下载按钮点击（事件委托） ----
    function handleDownloadClick(e) {
        const btn = e.target.closest('.download-btn');
        if (!btn) return;
        e.preventDefault();

        const card = btn.closest('.app-card');
        if (!card) return;

        const select = card.querySelector('.platform-select');
        if (!select) return;

        const url = select.value;
        if (url) {
            window.open(url, '_blank');
        }
    }

    // ---- 初始化 ----
    function init() {
        if (!grid || !searchInput) return;

        // 隐藏分类筛选栏
        const filterBar = document.querySelector('.filter-bar');
        if (filterBar) {
            filterBar.style.display = 'none';
        }

        searchInput.addEventListener('input', doSearch);
        searchClear.addEventListener('click', function() {
            searchInput.value = '';
            searchClear.classList.remove('visible');
            state.searchTerm = '';
            state.page = 1;
            applySearchFilter();
            searchInput.focus();
        });
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                searchInput.value = '';
                searchClear.classList.remove('visible');
                state.searchTerm = '';
                state.page = 1;
                applySearchFilter();
                searchInput.blur();
            }
        });

        prevBtn.addEventListener('click', () => goToPage(state.page - 1));
        nextBtn.addEventListener('click', () => goToPage(state.page + 1));

        grid.addEventListener('click', handleDownloadClick);

        // 加载数据
        loadApps();
        // 监听所有动态生成的 select 的 change 事件，更新跑马灯文字
        grid.addEventListener('change', function(e) {
            const select = e.target.closest('.platform-select');
            if (!select) return;
            const wrapper = select.closest('.custom-select-wrapper');
            if (!wrapper) return;
            const scrollDiv = wrapper.querySelector('.scroll-text');
            if (!scrollDiv) return;
        
            // 获取选中的文本
            const selectedText = select.options[select.selectedIndex].text;
            // 更新文字
            scrollDiv.innerHTML = `<span>${selectedText}</span>`;
            // 重置动画，让滚动重新开始
            scrollDiv.style.animation = 'none';
            requestAnimationFrame(() => {
                scrollDiv.style.animation = 'scroll 5s linear infinite';
            });
        });
    }

    init();
};
