/**
 * ============================================================
 * LAB POPUP — Rich-text lab notes for every module
 * Practical lab content extracted from chapter markdown via
 * MCChapters; modal chrome + markdown rendering via MCUtils.
 * Notes persist to /api/lab/:moduleId (FastAPI or lab-server.cjs),
 * with localStorage fallback when offline.
 * ============================================================
 */
(function () {
  'use strict';

  MCUtils.injectStyles('lab-popup-styles', `
    .lab-trigger-btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 6px 14px; font-size: 13px; font-weight: 600;
      color: #fff; background: linear-gradient(135deg, #8b5cf6, #6366f1);
      border: none; border-radius: 8px; cursor: pointer;
      transition: all 0.2s ease; box-shadow: 0 2px 8px rgba(99,102,241,0.3); margin-left: 12px;
    }
    .lab-trigger-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(99,102,241,0.45); background: linear-gradient(135deg, #7c3aed, #4f46e5); }
    .lab-trigger-btn .lab-icon { font-size: 15px; }
    .lab-toolbar { display: flex; align-items: center; gap: 4px; padding: 10px 24px; border-bottom: 1px solid var(--color-neutral-100, #f4f4f5); background: var(--color-neutral-50, #fafbfc); flex-wrap: wrap; }
    .lab-toolbar-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border: 1px solid transparent; background: transparent; border-radius: 6px; font-size: 14px; color: var(--color-neutral-600, #52525b); cursor: pointer; transition: all 0.15s; font-weight: 600; }
    .lab-toolbar-btn:hover { background: var(--color-neutral-200, #e4e4e7); color: var(--color-neutral-900, #27272a); }
    .lab-toolbar-sep { width: 1px; height: 20px; background: var(--color-neutral-200, #e4e4e7); margin: 0 4px; }
    .lab-body { padding: 24px 48px; }
    .lab-content-section { border-bottom: 2px solid var(--color-neutral-200, #e4e4e7); margin-bottom: 24px; padding-bottom: 16px; }
    .lab-content-toggle { display: flex; align-items: center; justify-content: space-between; cursor: pointer; padding: 12px 16px; background: linear-gradient(135deg, #f0fdf4, #ecfdf5); border-radius: 10px; border: 1px solid #bbf7d0; margin-bottom: 16px; user-select: none; }
    .lab-content-toggle:hover { background: linear-gradient(135deg, #dcfce7, #d1fae5); }
    .lab-content-toggle-title { font-size: 14px; font-weight: 700; color: #166534; display: flex; align-items: center; gap: 8px; }
    .lab-content-toggle-arrow { font-size: 12px; color: #166534; transition: transform 0.2s; }
    .lab-content-toggle-arrow.collapsed { transform: rotate(-90deg); }
    .lab-content-body { font-family: 'Inter', -apple-system, sans-serif; font-size: 15px; line-height: 1.7; color: var(--color-neutral-700, #3f3f46); }
    .lab-accordion-item { border: 1px solid var(--color-neutral-200, #e4e4e7); border-radius: 10px; margin-bottom: 10px; overflow: hidden; transition: box-shadow 0.2s; }
    .lab-accordion-item:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .lab-accordion-item.open { border-color: #bbf7d0; box-shadow: 0 2px 12px rgba(16,185,129,0.1); }
    .lab-accordion-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; cursor: pointer; user-select: none; background: var(--color-neutral-50, #fafafa); transition: background 0.15s; }
    .lab-accordion-header:hover { background: #f0fdf4; }
    .lab-accordion-item.open .lab-accordion-header { background: linear-gradient(135deg, #f0fdf4, #ecfdf5); border-bottom: 1px solid var(--color-neutral-200, #e4e4e7); }
    .lab-accordion-title { font-size: 15px; font-weight: 700; color: var(--color-neutral-900, #18181b); display: flex; align-items: center; gap: 8px; }
    .lab-accordion-arrow { font-size: 11px; color: var(--color-neutral-500, #71717a); transition: transform 0.25s ease; }
    .lab-accordion-item.open .lab-accordion-arrow { transform: rotate(90deg); color: #166534; }
    .lab-accordion-content { display: none; padding: 20px 24px; }
    .lab-accordion-item.open .lab-accordion-content { display: block; }
    .lab-content-body h2 { font-size: 1.3em; font-weight: 700; color: var(--color-neutral-900, #18181b); margin: 1em 0 0.4em; }
    .lab-content-body h3 { font-size: 1.1em; font-weight: 700; color: var(--color-neutral-900, #18181b); margin: 0.8em 0 0.3em; }
    .lab-content-body p { margin: 0 0 0.8em; }
    .lab-content-body ul, .lab-content-body ol { margin: 0 0 0.8em; padding-left: 2em; }
    .lab-content-body blockquote { margin: 0 0 0.8em; padding: 0.5em 1em; color: var(--color-neutral-500, #71717a); border-left: 0.25em solid var(--color-neutral-300, #d4d4d8); background: var(--color-neutral-50, #fafafa); }
    .lab-content-body code { padding: 0.2em 0.4em; font-size: 85%; background: var(--color-neutral-100, #f4f4f5); border-radius: 4px; font-family: 'Consolas', monospace; color: var(--color-error-500, #ef4444); }
    .lab-content-body pre { margin: 0 0 1em; padding: 16px; overflow: auto; font-size: 85%; line-height: 1.45; background: #27272a; border-radius: 6px; color: #e4e4e7; font-family: 'Consolas', monospace; }
    .lab-content-body pre code { background: transparent; color: inherit; padding: 0; font-size: 100%; }
    .lab-content-body table { border-spacing: 0; border-collapse: collapse; margin: 0 0 1em; width: 100%; }
    .lab-content-body table th, .lab-content-body table td { padding: 6px 13px; border: 1px solid var(--color-neutral-200, #e4e4e7); }
    .lab-content-body table tr { background: var(--color-neutral-0, #fff); border-top: 1px solid var(--color-neutral-300, #d4d4d8); }
    .lab-content-body table tr:nth-child(2n) { background: var(--color-neutral-50, #fafafa); }
    .lab-content-body .mermaid { background: var(--color-neutral-50, #fafafa); border-radius: 8px; padding: 24px 16px; margin: 1em 0; text-align: center; overflow-x: auto; }
    .lab-content-body .mermaid svg { max-width: 100%; height: auto; }
    .lab-content-empty { padding: 16px; text-align: center; color: var(--color-neutral-400, #a1a1aa); font-style: italic; font-size: 14px; }
    .lab-notes-separator { display: flex; align-items: center; gap: 12px; margin: 8px 0 16px; color: var(--color-neutral-500, #71717a); font-size: 13px; font-weight: 600; }
    .lab-notes-separator::before, .lab-notes-separator::after { content: ''; flex: 1; height: 1px; background: var(--color-neutral-200, #e4e4e7); }
    .lab-editor { min-height: 280px; outline: none; font-size: 15px; line-height: 1.7; color: var(--color-neutral-800, #27272a); font-family: 'Inter', -apple-system, sans-serif; }
    .lab-editor:empty::before { content: attr(data-placeholder); color: var(--color-neutral-400, #a1a1aa); font-style: italic; pointer-events: none; }
    .lab-editor h2 { font-size: 20px; font-weight: 700; color: var(--color-neutral-900, #18181b); margin: 16px 0 8px; }
    .lab-editor h3 { font-size: 17px; font-weight: 700; color: var(--color-neutral-900, #18181b); margin: 16px 0 8px; }
    .lab-editor p { margin: 0 0 12px; }
    .lab-editor ul, .lab-editor ol { margin: 0 0 12px; padding-left: 24px; }
    .lab-editor li { margin-bottom: 4px; }
    .lab-editor code { background: var(--color-neutral-100, #f4f4f5); padding: 2px 6px; border-radius: 4px; font-family: 'Consolas', monospace; font-size: 13px; color: var(--color-accent-600, #6366f1); }
    .lab-editor pre { background: #27272a; color: #e4e4e7; padding: 16px; border-radius: 8px; font-family: 'Consolas', monospace; font-size: 13px; line-height: 1.5; margin: 8px 0 16px; overflow-x: auto; }
    .lab-editor pre code { background: none; color: inherit; padding: 0; }
    .lab-editor blockquote { border-left: 3px solid var(--color-accent-600, #6366f1); padding-left: 16px; margin: 8px 0 16px; color: var(--color-neutral-600, #52525b); font-style: italic; }
    .lab-footer { display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; border-top: 1px solid var(--color-neutral-200, #e5e7eb); background: var(--color-neutral-50, #fafafa); }
    .lab-save-status { font-size: 12px; color: var(--color-neutral-400, #a1a1aa); display: flex; align-items: center; gap: 6px; }
    .lab-save-dot { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; }
    .lab-save-dot.unsaved { background: #f59e0b; }
    .lab-save-dot.saving { background: #3b82f6; animation: lab-pulse 0.8s infinite; }
    @keyframes lab-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
    .lab-footer-actions { display: flex; gap: 8px; }
    .lab-btn { padding: 8px 16px; font-size: 13px; font-weight: 600; border-radius: 8px; border: none; cursor: pointer; transition: all 0.15s; }
    .lab-btn-secondary { background: var(--color-neutral-100, #f4f4f5); color: var(--color-neutral-600, #52525b); }
    .lab-btn-secondary:hover { background: var(--color-neutral-200, #e4e4e7); }
    .lab-btn-primary { background: linear-gradient(135deg, #8b5cf6, #6366f1); color: #fff; box-shadow: 0 2px 8px rgba(99,102,241,0.3); }
    .lab-btn-primary:hover { box-shadow: 0 4px 16px rgba(99,102,241,0.4); transform: translateY(-1px); }
    @media (max-width: 1024px) { .lab-body { padding: 20px 32px; } }
    @media (max-width: 640px) { .lab-body { padding: 16px; } }
  `);

  // ── Wrap rendered lab HTML into single-open accordion items ──
  function wrapLabsInAccordion(container) {
    const children = Array.from(container.childNodes);
    const h1Elements = Array.from(container.querySelectorAll('h1'));
    if (h1Elements.length === 0) return;

    const groups = [];
    let currentGroup = null;
    children.forEach(node => {
      if (node.nodeType === 1 && node.tagName === 'H1') {
        currentGroup = { title: node.textContent.trim(), content: [] };
        groups.push(currentGroup);
      } else if (currentGroup) {
        currentGroup.content.push(node);
      }
    });

    container.innerHTML = '';
    groups.forEach((group, idx) => {
      const item = document.createElement('div');
      item.className = 'lab-accordion-item';
      item.dataset.index = idx;

      const header = document.createElement('div');
      header.className = 'lab-accordion-header';
      header.innerHTML = `<span class="lab-accordion-title">🔬 ${group.title.replace(/^🔬\s*/, '')}</span><span class="lab-accordion-arrow">▶</span>`;

      const content = document.createElement('div');
      content.className = 'lab-accordion-content';
      group.content.forEach(node => content.appendChild(node));

      item.appendChild(header);
      item.appendChild(content);
      container.appendChild(item);

      header.addEventListener('click', async () => {
        const isOpen = item.classList.contains('open');
        container.querySelectorAll('.lab-accordion-item.open').forEach(el => el.classList.remove('open'));
        if (!isOpen) {
          item.classList.add('open');
          if (!content.dataset.mermaidDone) {
            content.dataset.mermaidDone = '1';
            await MCUtils.renderMermaid(content);
          }
        }
      });
    });
  }

  // ── Notes persistence (server + localStorage fallback) ──
  async function loadNotes(moduleId) {
    try {
      const res = await fetch('/api/lab/' + moduleId);
      const data = await res.json();
      return data.content || '';
    } catch (e) {
      return localStorage.getItem('lab-notes-' + moduleId) || '';
    }
  }

  async function saveNotes(moduleId, content) {
    try {
      const res = await fetch('/api/lab/' + moduleId, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      return res.ok;
    } catch (e) {
      localStorage.setItem('lab-notes-' + moduleId, content);
      return false;
    }
  }

  function buildTriggerButton() {
    const btn = document.createElement('button');
    btn.className = 'lab-trigger-btn';
    btn.id = 'lab-trigger';
    btn.innerHTML = `<span class="lab-icon">🧪</span> ${MCI18n.t('popup.labNotes')}`;
    const actions = document.querySelector('.topbar-actions');
    if (actions) actions.insertBefore(btn, actions.firstChild);
    else { btn.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9998;'; document.body.appendChild(btn); }
    return btn;
  }

  // ── Init ────────────────────────────────────────────────
  function init() {
    const modal = MCUtils.createModal({
      classPrefix: 'lab',
      icon: '🧪',
      titleId: 'lab-title',
      subtitleId: 'lab-subtitle',
      bodyHtml: `
        <div class="lab-content-section" id="lab-content-section">
          <div class="lab-content-toggle" id="lab-content-toggle">
            <span class="lab-content-toggle-title">${MCI18n.t('popup.labInstructions')}</span>
            <span class="lab-content-toggle-arrow" id="lab-content-arrow">▼</span>
          </div>
          <div class="lab-content-body" id="lab-content-body"></div>
        </div>
        <div class="lab-notes-separator">${MCI18n.t('popup.personalNotes')}</div>
        <div class="lab-editor" id="lab-editor" contenteditable="true"
             data-placeholder="Write your lab notes here… (auto-saved)"></div>`,
      footerHtml: `
        <div class="lab-footer">
          <div class="lab-save-status">
            <span class="lab-save-dot" id="lab-save-dot"></span>
            <span id="lab-save-text">Saved</span>
          </div>
          <div class="lab-footer-actions">
            <button class="lab-btn lab-btn-secondary" id="lab-clear">${MCI18n.t('popup.clear')}</button>
            <button class="lab-btn lab-btn-primary" id="lab-save">${MCI18n.t('popup.saveClose')}</button>
          </div>
        </div>`
    });
    document.getElementById('lab-title').textContent = MCI18n.t('popup.labNotes');

    // Toolbar between header and body
    const toolbar = document.createElement('div');
    toolbar.className = 'lab-toolbar';
    toolbar.innerHTML = `
      <button class="lab-toolbar-btn" data-cmd="bold" title="Bold (Ctrl+B)"><b>B</b></button>
      <button class="lab-toolbar-btn" data-cmd="italic" title="Italic (Ctrl+I)"><i>I</i></button>
      <button class="lab-toolbar-btn" data-cmd="underline" title="Underline (Ctrl+U)"><u>U</u></button>
      <div class="lab-toolbar-sep"></div>
      <button class="lab-toolbar-btn" data-cmd="formatBlock" data-val="H2" title="Heading 2">H2</button>
      <button class="lab-toolbar-btn" data-cmd="formatBlock" data-val="H3" title="Heading 3">H3</button>
      <button class="lab-toolbar-btn" data-cmd="formatBlock" data-val="P" title="Paragraph">¶</button>
      <div class="lab-toolbar-sep"></div>
      <button class="lab-toolbar-btn" data-cmd="insertUnorderedList" title="Bullet List">•≡</button>
      <button class="lab-toolbar-btn" data-cmd="insertOrderedList" title="Numbered List">1.</button>
      <div class="lab-toolbar-sep"></div>
      <button class="lab-toolbar-btn" data-cmd="formatBlock" data-val="BLOCKQUOTE" title="Quote">❝</button>
      <button class="lab-toolbar-btn" id="lab-code-btn" title="Code Block">&lt;/&gt;</button>
      <button class="lab-toolbar-btn" id="lab-link-btn" title="Insert Link">🔗</button>
      <button class="lab-toolbar-btn" data-cmd="insertHorizontalRule" title="Divider">―</button>
      <button class="lab-toolbar-btn" data-cmd="removeFormat" title="Clear Format">🚫</button>`;
    modal.modal.insertBefore(toolbar, modal.body);

    const trigger = buildTriggerButton();
    const editor = document.getElementById('lab-editor');
    const saveBtn = document.getElementById('lab-save');
    const clearBtn = document.getElementById('lab-clear');
    const subtitle = document.getElementById('lab-subtitle');
    const saveDot = document.getElementById('lab-save-dot');
    const saveText = document.getElementById('lab-save-text');

    let dirty = false;
    let autoSaveTimer = null;

    const labContentBody = document.getElementById('lab-content-body');
    const labContentToggle = document.getElementById('lab-content-toggle');
    const labContentArrow = document.getElementById('lab-content-arrow');
    let labContentVisible = true;

    labContentToggle.addEventListener('click', () => {
      labContentVisible = !labContentVisible;
      labContentBody.style.display = labContentVisible ? '' : 'none';
      labContentArrow.classList.toggle('collapsed', !labContentVisible);
    });

    async function open() {
      subtitle.textContent = MCChapters.currentModuleTitle();
      saveDot.className = 'lab-save-dot saving';
      saveText.textContent = MCI18n.t('popup.loading');
      modal.open();

      const moduleId = MCChapters.currentModuleId();
      labContentBody.innerHTML = `<em>${MCI18n.t('popup.loading')}</em>`;
      try {
        await MCUtils.loadMarked();
        const mdContent = await MCChapters.fetchMarkdown(moduleId);
        const labMd = MCChapters.extractPracticalLabs(mdContent);
        if (labMd) {
          labContentBody.innerHTML = window.marked.parse(labMd);
          wrapLabsInAccordion(labContentBody);
        } else {
          labContentBody.innerHTML = '<div class="lab-content-empty">No practical lab content found for this chapter.</div>';
        }
      } catch (e) {
        labContentBody.innerHTML = '<div class="lab-content-empty">Failed to load lab content.</div>';
      }

      const content = await loadNotes(moduleId);
      editor.innerHTML = content;
      dirty = false;
      saveDot.className = 'lab-save-dot';
      saveText.textContent = 'Saved';
      setTimeout(() => editor.focus(), 200);
    }

    async function save() {
      const content = editor.innerHTML.trim();
      saveDot.className = 'lab-save-dot saving';
      saveText.textContent = 'Saving…';

      const savedToServer = await saveNotes(MCChapters.currentModuleId(), (content && content !== '<br>') ? content : '');
      dirty = false;
      saveDot.className = 'lab-save-dot';
      saveText.textContent = savedToServer ? 'Saved to server ✓' : 'Saved (localStorage)';
      updateBadge();
    }

    async function close() {
      await save();
      modal.close();
    }

    function markDirty() {
      if (!dirty) {
        dirty = true;
        saveDot.className = 'lab-save-dot unsaved';
        saveText.textContent = 'Unsaved changes';
      }
      clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => save(), 3000);
    }

    function updateBadge() {
      const has = editor.innerHTML.trim() && editor.innerHTML.trim() !== '<br>';
      trigger.innerHTML = has
        ? `<span class="lab-icon">🧪</span> ${MCI18n.t('popup.labNotes')} <span style="background:#22c55e;color:#fff;font-size:10px;padding:1px 6px;border-radius:10px;margin-left:2px;">●</span>`
        : `<span class="lab-icon">🧪</span> ${MCI18n.t('popup.labNotes')}`;
    }

    trigger.addEventListener('click', open);
    saveBtn.addEventListener('click', close);
    editor.addEventListener('input', markDirty);

    clearBtn.addEventListener('click', async () => {
      if (confirm('Clear all lab notes for this chapter?')) {
        editor.innerHTML = '';
        await saveNotes(MCChapters.currentModuleId(), '');
        dirty = false;
        saveDot.className = 'lab-save-dot';
        saveText.textContent = 'Cleared';
        updateBadge();
      }
    });

    modal.overlay.querySelectorAll('.lab-toolbar-btn[data-cmd]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        document.execCommand(btn.dataset.cmd, false, btn.dataset.val || null);
        editor.focus(); markDirty();
      });
    });
    document.getElementById('lab-code-btn').addEventListener('click', e => {
      e.preventDefault();
      document.execCommand('formatBlock', false, 'PRE');
      editor.focus(); markDirty();
    });
    document.getElementById('lab-link-btn').addEventListener('click', e => {
      e.preventDefault();
      const u = prompt('Enter URL:');
      if (u) { document.execCommand('createLink', false, u); markDirty(); }
      editor.focus();
    });

    editor.addEventListener('keydown', e => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'b': e.preventDefault(); document.execCommand('bold'); markDirty(); break;
          case 'i': e.preventDefault(); document.execCommand('italic'); markDirty(); break;
          case 'u': e.preventDefault(); document.execCommand('underline'); markDirty(); break;
          case 's': e.preventDefault(); save(); break;
        }
      }
      if (e.key === 'Tab') { e.preventDefault(); document.execCommand('insertText', false, '    '); markDirty(); }
    });

    // Badge on load if notes already exist
    loadNotes(MCChapters.currentModuleId()).then(content => {
      if (content) updateBadge();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
