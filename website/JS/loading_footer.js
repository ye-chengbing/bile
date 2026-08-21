(function() {
    'use strict';

    // 由于 footer 已内嵌在 index.html，无需再 fetch 加载
    // 只保留移动端标签切换逻辑

    document.addEventListener('click', function(e) {
        const btn = e.target.closest('.info-mobile-tabs .tab-buttons button');
        if (!btn) return;

        const tabsRoot = btn.closest('.info-mobile-tabs');
        if (!tabsRoot) return;

        const tabId = btn.dataset.tab;
        if (!tabId) return;

        const buttons = tabsRoot.querySelectorAll('.tab-buttons button');
        const panels = tabsRoot.querySelectorAll('.tab-panel');

        buttons.forEach(b => {
            const isActive = (b === btn);
            b.classList.toggle('active', isActive);
            b.setAttribute('aria-selected', String(isActive));
        });

        panels.forEach(p => {
            p.classList.toggle('active', p.id === tabId);
        });
    });

})();
