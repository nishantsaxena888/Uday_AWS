/**
 * ============================================================
 * DETAILS POPUP — Renders the chapter Markdown (minus labs)
 * Uses MCChapters (single MD_MAP) + MCUtils modal/markdown stack.
 * ============================================================
 */
(function () {
  'use strict';

  MCUtils.injectStyles('details-popup-styles', `
    .details-trigger-btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 6px 14px; font-size: 13px; font-weight: 600;
      color: #fff; background: linear-gradient(135deg, #10b981, #059669);
      border: none; border-radius: 8px; cursor: pointer;
      transition: all 0.2s ease; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3); margin-left: 12px;
    }
    .details-trigger-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(16, 185, 129, 0.45); background: linear-gradient(135deg, #059669, #047857); }
    .details-header-icon { background: linear-gradient(135deg, #10b981, #059669); }
    @media (max-width: 640px) {
      .details-trigger-btn { padding: 5px 10px; font-size: 12px; }
    }
  `);

  function buildTriggerButton() {
    const btn = document.createElement('button');
    btn.className = 'details-trigger-btn';
    btn.id = 'details-trigger';
    btn.innerHTML = `<span class="lab-icon">📄</span> ${MCI18n.t('popup.detailedChapter')}`;

    const actions = document.querySelector('.topbar-actions');
    if (actions) {
      actions.insertBefore(btn, actions.firstChild);
    } else {
      btn.style.cssText = 'position:fixed;bottom:24px;right:140px;z-index:9998;';
      document.body.appendChild(btn);
    }
    return btn;
  }

  function init() {
    const modal = MCUtils.createModal({
      classPrefix: 'details',
      icon: '📄',
      titleId: 'details-title',
      subtitleId: 'details-subtitle',
      bodyHtml: '<div class="md-rendered" id="details-editor"></div>'
    });
    document.getElementById('details-title').textContent = MCI18n.t('popup.chapterDetails');

    const trigger = buildTriggerButton();
    const contentBox = document.getElementById('details-editor');
    const subtitle = document.getElementById('details-subtitle');

    async function open() {
      subtitle.textContent = MCChapters.currentModuleTitle();
      contentBox.innerHTML = `<em>${MCI18n.t('popup.loading')}</em>`;
      modal.open();

      try {
        await MCUtils.loadMarked();
        const mdContent = await MCChapters.fetchMarkdown(MCChapters.currentModuleId());
        if (mdContent === null) {
          contentBox.innerHTML = '<div style="color:var(--color-error-500,#ef4444)">Chapter markdown not available for this module.</div>';
          return;
        }
        const chapterOnly = MCChapters.stripPracticalLabs(mdContent);
        contentBox.innerHTML = window.marked.parse(chapterOnly);
        await MCUtils.renderMermaid(contentBox);
      } catch (e) {
        contentBox.innerHTML = '<div style="color:var(--color-error-500,#ef4444)">Failed to load or parse Markdown.</div>';
      }
    }

    trigger.addEventListener('click', open);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
