/**
 * ============================================================
 * AWS PRODUCTION MASTERCLASS — SHARED FOUNDATION
 * Single source of truth for utilities, chapter access,
 * internationalization (i18n) and theming.
 *
 * Load FIRST (before engines) on every page:
 *   <script src="../js/shared.js"></script>
 * Globals: MCUtils, MCChapters, MCI18n, MCTheme
 * ============================================================
 */
(function () {
  'use strict';

  // ============================================================================
  // MCUtils — shared helpers (single implementation, used by all engines)
  // ============================================================================
  const MCUtils = {
    escapeHtml(str) {
      const div = document.createElement('div');
      div.textContent = str == null ? '' : String(str);
      return div.innerHTML;
    },

    slugify(str) {
      return String(str).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    },

    /** Inject a <style> block once (idempotent by id). */
    injectStyles(id, cssText) {
      if (document.getElementById(id)) return;
      const style = document.createElement('style');
      style.id = id;
      style.textContent = cssText;
      document.head.appendChild(style);
    },

    /** Load an external script once (deduped by src). */
    loadScript(src) {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    },

    loadMarked() {
      if (window.marked) return Promise.resolve();
      return this.loadScript('https://cdn.jsdelivr.net/npm/marked/marked.min.js');
    },

    loadMermaid() {
      if (window.mermaid) return Promise.resolve();
      return this.loadScript('https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js')
        .then(() => window.mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' }));
    },

    /** Render all ```mermaid code blocks inside container as SVG diagrams. */
    async renderMermaid(container) {
      const codeBlocks = container.querySelectorAll('pre code.language-mermaid');
      if (codeBlocks.length === 0) return;
      try {
        await this.loadMermaid();
      } catch (e) {
        console.warn('[MCUtils] Failed to load Mermaid:', e);
        return;
      }
      codeBlocks.forEach(codeEl => {
        const div = document.createElement('div');
        div.className = 'mermaid';
        div.textContent = codeEl.textContent;
        codeEl.parentElement.replaceWith(div);
      });
      try {
        await window.mermaid.run({ nodes: container.querySelectorAll('.mermaid') });
      } catch (e) {
        console.warn('[MCUtils] Mermaid rendering error:', e);
      }
    },

    /**
     * Build a shared modal (overlay + shell). Handles open/close/Escape/backdrop.
     * @returns {{overlay: HTMLElement, modal: HTMLElement, body: HTMLElement, close: Function, open: Function}}
     */
    createModal({ classPrefix, icon, titleId, subtitleId, bodyHtml = '', footerHtml = '' }) {
      const overlay = document.createElement('div');
      overlay.className = `${classPrefix}-overlay mc-modal-overlay`;
      overlay.innerHTML = `
        <div class="${classPrefix}-modal mc-modal">
          <div class="mc-modal-header">
            <div class="mc-modal-header-left">
              <div class="mc-modal-header-icon ${classPrefix}-header-icon">${icon}</div>
              <div>
                <div class="mc-modal-header-title" id="${titleId}"></div>
                <div class="mc-modal-header-subtitle" id="${subtitleId}"></div>
              </div>
            </div>
            <button class="mc-modal-close-btn" title="Close">&times;</button>
          </div>
          <div class="${classPrefix}-body mc-modal-body">${bodyHtml}</div>
          ${footerHtml ? `<div class="${classPrefix}-footer">${footerHtml}</div>` : ''}
        </div>`;
      document.body.appendChild(overlay);

      const api = {
        overlay,
        modal: overlay.querySelector('.mc-modal'),
        body: overlay.querySelector('.mc-modal-body'),
        open() { overlay.classList.add('open'); },
        close() { overlay.classList.remove('open'); }
      };

      overlay.querySelector('.mc-modal-close-btn').addEventListener('click', api.close);
      overlay.addEventListener('click', e => { if (e.target === overlay) api.close(); });
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && overlay.classList.contains('open')) api.close();
      });
      return api;
    }
  };

  // Shared modal chrome CSS — used by details-popup, lab-popup and any future modal.
  MCUtils.injectStyles('mc-modal-styles', `
    .mc-modal-overlay {
      position: fixed; inset: 0; z-index: 9999;
      background: rgba(0,0,0,0.5); backdrop-filter: blur(6px);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; visibility: hidden;
      transition: opacity 0.25s ease, visibility 0.25s ease;
    }
    .mc-modal-overlay.open { opacity: 1; visibility: visible; }
    .mc-modal {
      width: 88vw; max-width: 1600px; max-height: 90vh;
      background: var(--color-neutral-0, #fff); color: var(--color-neutral-800, #27272a);
      border-radius: 16px; box-shadow: 0 24px 80px rgba(0,0,0,0.25);
      display: flex; flex-direction: column;
      transform: translateY(20px) scale(0.97);
      transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1); overflow: hidden;
    }
    .mc-modal-overlay.open .mc-modal { transform: translateY(0) scale(1); }
    .mc-modal-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 24px 16px; border-bottom: 1px solid var(--color-neutral-200, #e5e7eb);
      background: linear-gradient(135deg, var(--color-neutral-50, #fafafa), var(--color-neutral-100, #f4f4f5));
    }
    .mc-modal-header-left { display: flex; align-items: center; gap: 10px; }
    .mc-modal-header-icon {
      width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #8b5cf6, #6366f1); border-radius: 10px; font-size: 18px; color: #fff;
    }
    .mc-modal-header-title { font-size: 16px; font-weight: 700; color: var(--color-neutral-800, #27272a); }
    .mc-modal-header-subtitle { font-size: 12px; color: var(--color-neutral-500, #71717a); margin-top: 2px; }
    .mc-modal-close-btn {
      width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
      border: none; background: var(--color-neutral-100, #f4f4f5); border-radius: 8px;
      font-size: 18px; color: var(--color-neutral-500, #71717a); cursor: pointer; transition: all 0.15s;
    }
    .mc-modal-close-btn:hover { background: var(--color-neutral-200, #e4e4e7); color: var(--color-neutral-800, #27272a); }
    .mc-modal-body { flex: 1; overflow-y: auto; padding: 40px 64px; }
    @media (max-width: 1024px) { .mc-modal { width: 92vw; } .mc-modal-body { padding: 32px 40px; } }
    @media (max-width: 640px) {
      .mc-modal { width: 96vw; max-width: none; border-radius: 10px; }
      .mc-modal-body { padding: 24px 20px; }
      .mc-modal-header { padding: 16px 18px 12px; }
    }
    /* Rendered markdown styles (shared by chapter popups) */
    .md-rendered { font-family: 'Inter', -apple-system, sans-serif; font-size: 16px; line-height: 1.75; color: var(--color-neutral-700, #3f3f46); max-width: 100%; }
    .md-rendered h1, .md-rendered h2, .md-rendered h3, .md-rendered h4 { color: var(--color-neutral-900, #18181b); margin-top: 1.5em; margin-bottom: 0.5em; font-weight: 700; }
    .md-rendered h1 { font-size: 2em; border-bottom: 1px solid var(--color-neutral-200, #e4e4e7); padding-bottom: 0.3em; }
    .md-rendered h2 { font-size: 1.5em; border-bottom: 1px solid var(--color-neutral-200, #e4e4e7); padding-bottom: 0.3em; }
    .md-rendered h3 { font-size: 1.25em; }
    .md-rendered p { margin-top: 0; margin-bottom: 1em; }
    .md-rendered a { color: var(--color-accent-600, #2563eb); text-decoration: none; }
    .md-rendered a:hover { text-decoration: underline; }
    .md-rendered ul, .md-rendered ol { margin-top: 0; margin-bottom: 1em; padding-left: 2em; }
    .md-rendered blockquote { margin: 0 0 1em; padding: 0.5em 1em; color: var(--color-neutral-500, #71717a); border-left: 0.25em solid var(--color-neutral-300, #d4d4d8); background: var(--color-neutral-50, #fafafa); }
    .md-rendered code { padding: 0.2em 0.4em; margin: 0; font-size: 85%; background: var(--color-neutral-100, #f4f4f5); border-radius: 6px; font-family: 'Consolas', monospace; color: var(--color-error-500, #ef4444); }
    .md-rendered pre { margin-top: 0; margin-bottom: 1em; padding: 16px; overflow: auto; font-size: 85%; line-height: 1.45; background: #27272a; border-radius: 6px; color: #e4e4e7; font-family: 'Consolas', monospace; }
    .md-rendered pre code { display: inline; max-width: auto; padding: 0; margin: 0; overflow: visible; line-height: inherit; word-wrap: normal; background: transparent; border: 0; color: inherit; font-size: 100%; }
    .md-rendered table { border-spacing: 0; border-collapse: collapse; margin-top: 0; margin-bottom: 1em; width: 100%; }
    .md-rendered table th, .md-rendered table td { padding: 6px 13px; border: 1px solid var(--color-neutral-200, #e4e4e7); }
    .md-rendered table tr { background: var(--color-neutral-0, #fff); border-top: 1px solid var(--color-neutral-300, #d4d4d8); }
    .md-rendered table tr:nth-child(2n) { background: var(--color-neutral-50, #fafafa); }
    .md-rendered img { max-width: 100%; box-sizing: content-box; }
    .md-rendered .mermaid { background: var(--color-neutral-50, #fafafa); border-radius: 8px; padding: 24px 16px; margin: 1em 0; text-align: center; overflow-x: auto; }
    .md-rendered .mermaid svg { max-width: 100%; height: auto; }
  `);

  // ============================================================================
  // MCChapters — single source for module→chapter markdown access
  // (replaces the MD_MAP copies in details-popup.js and lab-popup.js)
  // ============================================================================
  const CHAPTER_MD_MAP = {
    'module-01': 'Chapter_01_AWS_IAM.md',
    'module-02': 'Chapter_02_Amazon_S3.md',
    'module-03': 'Chapter_03_Amazon_EC2.md',
    'module-04': 'Chapter_04_Amazon_VPC.md',
    'module-05': 'Chapter_05_Amazon_CloudWatch.md',
    'module-06': 'Chapter_06_Amazon_RDS.md',
    'module-07': 'Chapter_07_Amazon_Route_53.md',
    'module-08': 'Chapter_08_AWS_Lambda.md',
    'module-09': 'Chapter_09_Amazon_API_Gateway.md',
    'module-10': 'Chapter_10_Amazon_DynamoDB.md',
    'module-11': 'Chapter_11_Amazon_Cognito.md',
    'module-12': 'Chapter_12_Amazon_SQS.md',
    'module-13': 'Chapter_13_Amazon_SNS.md',
    'module-14': 'Chapter_14_Amazon_EventBridge.md',
    'module-15': 'Chapter_15_Amazon_ECR.md',
    'module-16': 'Chapter_16_Amazon_ECS.md',
    'module-17': 'Chapter_17_AWS_Fargate.md',
    'module-18': 'Chapter_18_Elastic_Load_Balancing.md',
    'module-19': 'Chapter_19_AWS_CodeBuild.md',
    'module-20': 'Chapter_20_AWS_CodePipeline.md',
    'module-21': 'Chapter_21_AWS_CloudFormation.md',
    'module-22': 'Chapter_22_AWS_KMS.md',
    'module-23': 'Chapter_23_AWS_STS.md',
    'module-24': 'Chapter_24_AWS_Secrets_Manager.md',
    'module-25': 'Chapter_25_AWS_Systems_Manager.md',
    'module-26': 'Chapter_26_AWS_CloudTrail.md',
    'module-27': 'Chapter_27_AWS_Config.md',
    'module-28': 'Chapter_28_AWS_Backup.md',
    'module-29': 'Chapter_29_Amazon_CloudFront.md',
    'module-30': 'Chapter_30_AWS_WAF_and_AWS_Shield.md',
    'module-31': 'Chapter_31_AWS_Organizations_and_Control_Tower.md',
    'module-32': 'Chapter_32_AWS_PrivateLink.md',
    'module-33': 'Chapter_33_Amazon_ElastiCache.md',
    'module-34': 'Chapter_34_Amazon_OpenSearch_Service.md',
    'module-35': 'Chapter_35_AWS_Step_Functions.md',
    'module-36': 'Chapter_36_AWS_IAM_Identity_Center.md',
    'module-37': 'Chapter_37_Amazon_Bedrock_and_GenAI.md',
    'module-38': 'Chapter_38_AWS_Certificate_Manager_ACM.md',
    'module-39': 'Chapter_39_Amazon_EC2_Auto_Scaling.md',
    'module-40': 'Chapter_40_Amazon_EFS.md',
    'module-41': 'Chapter_41_AWS_X_Ray.md',
    'module-42': 'Chapter_42_AWS_CodeDeploy.md',
    'module-43': 'Chapter_43_Amazon_GuardDuty.md',
    'module-44': 'Chapter_44_Amazon_Inspector.md',
    'module-45': 'Chapter_45_AWS_Security_Hub.md',
    'module-46': 'Chapter_46_AWS_Resource_Access_Manager.md',
    'module-47': 'Chapter_47_AWS_Cost_Explorer_and_Budgets.md'
  };

  const MCChapters = {
    MD_MAP: CHAPTER_MD_MAP,

    currentModuleId() {
      return (window.app && window.app.currentModule) || 'unknown';
    },

    currentModuleTitle() {
      const el = document.querySelector('.topbar-title');
      return el ? el.textContent.trim() : this.currentModuleId();
    },

    /** Fetch raw chapter markdown for a module, or null if unavailable. */
    async fetchMarkdown(moduleId) {
      const fileName = CHAPTER_MD_MAP[moduleId];
      if (!fileName) return null;
      try {
        const res = await fetch('../chapters/' + fileName);
        if (!res.ok) return null;
        return await res.text();
      } catch (e) {
        return null;
      }
    },

    /** Chapter markdown WITHOUT the "# 🔬 Practical Lab ..." trailing section. */
    stripPracticalLabs(md) {
      if (!md) return '';
      const lines = md.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (/^#\s+.*Practical\s+Lab\s/i.test(lines[i].trim())) {
          let cut = i;
          while (cut > 0 && /^(\s*|---+\s*)$/.test(lines[cut - 1].trim())) cut--;
          return lines.slice(0, cut).join('\n');
        }
      }
      return md;
    },

    /** Only the "# 🔬 Practical Lab ..." portion of the chapter markdown. */
    extractPracticalLabs(md) {
      if (!md) return '';
      const lines = md.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (/^#\s+.*Practical\s+Lab\s/i.test(lines[i].trim())) {
          return lines.slice(i).join('\n');
        }
      }
      return '';
    }
  };

  // ============================================================================
  // MCI18n — minimal i18n foundation (dictionary + t() + locale picker)
  // Locales persist in localStorage['mc-locale']. Content data files stay
  // single-language; this layer covers UI chrome.
  // ============================================================================
  const DICTS = {
    en: {
      'common.close': 'Close',
      'common.backToCourse': '← Back to Course',
      'sidebar.modules': 'Modules',
      'ctx.onThisPage': 'On This Page',
      'ctx.quickReference': 'Quick Reference',
      'lesson.markAsRead': '☐ Mark as Read',
      'lesson.sectionComplete': '✅ Section Complete',
      'terminal.typeCommand': 'Type a command...',
      'terminal.commandNotFound': 'command not found',
      'terminal.availableCommands': 'Available commands',
      'terminal.helpHint': "type 'help' for a list",
      'quiz.questionOf': 'Question {i} of {n}',
      'quiz.checkAnswer': 'Check Answer',
      'quiz.previous': '← Previous',
      'quiz.next': 'Next →',
      'quiz.finish': '✓ Finish Quiz',
      'quiz.results': 'Quiz Results',
      'quiz.correct': '✅ Correct!',
      'quiz.incorrect': '❌ Incorrect',
      'quiz.retry': '🔄 Retry',
      'quiz.reviewAnswers': '📋 Review Answers',
      'quiz.correctOf': '{c} of {t} correct',
      'quiz.backToResults': '← Back to Results',
      'quiz.yourAnswer': 'Your answer',
      'quiz.correctAnswer': 'Correct answer',
      'quiz.noAnswer': 'No answer',
      'lab.progress': 'Lab Progress',
      'lab.markComplete': '✓ Mark Complete',
      'lab.showHint': '💡 Show Hint',
      'lab.noMoreHints': '(No more hints)',
      'lab.cleanup': '🧹 Cleanup',
      'lab.complete': 'Lab Complete!',
      'challenge.submitTest': '🧪 Submit & Test',
      'challenge.reset': '🔄 Reset',
      'challenge.hint': '💡 Hint ({a}/{n})',
      'challenge.allPassed': 'All Tests Passed!',
      'challenge.testsPassed': '{p}/{t} Tests Passed',
      'challenge.attempt': 'Attempt #{n}',
      'cmd.copy': '📋 Copy',
      'cmd.run': '▶ Run',
      'cmd.explain': '💡 Explain',
      'cmd.tryIt': '🧪 Try It',
      'cmd.expectedOutput': '📤 Expected Output',
      'cmd.whatItDoes': '💡 What This Command Does',
      'cmd.commonErrors': '⚠️ Common Errors',
      'cmd.interviewQuestion': '🎤 Interview Question',
      'cmd.copied': '✅ Copied!',
      'console.simulated': '🧪 Simulated Console',
      'console.stepOf': 'Step {i} of {n}',
      'diagram.clickToInspect': 'Click components to inspect',
      'popup.detailedChapter': 'Detailed Chapter',
      'popup.chapterDetails': 'Chapter Details',
      'popup.labNotes': 'Lab Notes',
      'popup.personalNotes': '✏️ Your Personal Notes',
      'popup.labInstructions': '🔬 Practical Lab Instructions',
      'popup.loading': 'Loading…',
      'popup.saveClose': 'Save & Close',
      'popup.clear': 'Clear'
    },

    hi: {
      'common.close': 'बंद करें',
      'common.backToCourse': '← कोर्स पर वापस',
      'sidebar.modules': 'मॉड्यूल',
      'ctx.onThisPage': 'इस पेज पर',
      'ctx.quickReference': 'त्वरित संदर्भ',
      'lesson.markAsRead': '☐ पढ़ा हुआ चिह्नित करें',
      'lesson.sectionComplete': '✅ सेक्शन पूर्ण',
      'terminal.typeCommand': 'कमांड टाइप करें...',
      'terminal.commandNotFound': 'कमांड नहीं मिली',
      'terminal.availableCommands': 'उपलब्ध कमांड',
      'terminal.helpHint': "सूची के लिए 'help' टाइप करें",
      'quiz.questionOf': 'प्रश्न {i} / {n}',
      'quiz.checkAnswer': 'उत्तर जांचें',
      'quiz.previous': '← पिछला',
      'quiz.next': 'अगला →',
      'quiz.finish': '✓ क्विज़ समाप्त करें',
      'quiz.results': 'क्विज़ परिणाम',
      'quiz.correct': '✅ सही!',
      'quiz.incorrect': '❌ गलत',
      'quiz.retry': '🔄 फिर से',
      'quiz.reviewAnswers': '📋 उत्तर देखें',
      'quiz.correctOf': '{t} में से {c} सही',
      'quiz.backToResults': '← परिणाम पर वापस',
      'quiz.yourAnswer': 'आपका उत्तर',
      'quiz.correctAnswer': 'सही उत्तर',
      'quiz.noAnswer': 'कोई उत्तर नहीं',
      'lab.progress': 'लैब प्रगति',
      'lab.markComplete': '✓ पूर्ण चिह्नित करें',
      'lab.showHint': '💡 संकेत देखें',
      'lab.noMoreHints': '(कोई संकेत नहीं बचा)',
      'lab.cleanup': '🧹 सफ़ाई',
      'lab.complete': 'लैब पूर्ण!',
      'challenge.submitTest': '🧪 सबमिट व टेस्ट',
      'challenge.reset': '🔄 रीसेट',
      'challenge.hint': '💡 संकेत ({a}/{n})',
      'challenge.allPassed': 'सभी टेस्ट पास!',
      'challenge.testsPassed': '{p}/{t} टेस्ट पास',
      'challenge.attempt': 'प्रयास #{n}',
      'cmd.copy': '📋 कॉपी',
      'cmd.run': '▶ चलाएँ',
      'cmd.explain': '💡 समझाएँ',
      'cmd.tryIt': '🧪 आज़माएँ',
      'cmd.expectedOutput': '📤 अपेक्षित आउटपुट',
      'cmd.whatItDoes': '💡 यह कमांड क्या करती है',
      'cmd.commonErrors': '⚠️ सामान्य त्रुटियाँ',
      'cmd.interviewQuestion': '🎤 साक्षात्कार प्रश्न',
      'cmd.copied': '✅ कॉपी हो गया!',
      'console.simulated': '🧪 सिम्युलेटेड कंसोल',
      'console.stepOf': 'चरण {i} / {n}',
      'diagram.clickToInspect': 'घटकों पर क्लिक करें',
      'popup.detailedChapter': 'विस्तृत अध्याय',
      'popup.chapterDetails': 'अध्याय विवरण',
      'popup.labNotes': 'लैब नोट्स',
      'popup.personalNotes': '✏️ आपके निजी नोट्स',
      'popup.labInstructions': '🔬 प्रैक्टिकल लैब निर्देश',
      'popup.loading': 'लोड हो रहा है…',
      'popup.saveClose': 'सहेजें व बंद करें',
      'popup.clear': 'साफ़ करें'
    }
  };

  const MCI18n = {
    dicts: DICTS,
    available: Object.keys(DICTS),
    locale: localStorage.getItem('mc-locale') || 'en',

    t(key, vars) {
      let str = (this.dicts[this.locale] && this.dicts[this.locale][key])
        || this.dicts.en[key]
        || key;
      if (vars) {
        Object.keys(vars).forEach(k => { str = str.replace('{' + k + '}', vars[k]); });
      }
      return str;
    },

    setLocale(locale) {
      if (!this.dicts[locale]) return;
      this.locale = locale;
      localStorage.setItem('mc-locale', locale);
      document.documentElement.lang = locale;
      location.reload(); // engines render once; simplest correct refresh
    },

    getLocale() { return this.locale; },

    /** Translate any element carrying data-i18n="key". */
    localizeDocument(root = document) {
      root.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = this.t(key);
      });
      root.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        el.placeholder = this.t(el.getAttribute('data-i18n-placeholder'));
      });
    }
  };

  // ============================================================================
  // MCTheme — light/dark theme switching, persisted in localStorage['mc-theme']
  // ============================================================================
  const MCTheme = {
    STORAGE_KEY: 'mc-theme',

    get() {
      return document.documentElement.dataset.theme || 'light';
    },

    apply(theme) {
      document.documentElement.dataset.theme = theme;
      localStorage.setItem(this.STORAGE_KEY, theme);
      document.querySelectorAll('.mc-theme-toggle').forEach(btn => {
        btn.textContent = theme === 'dark' ? '☀️' : '🌙';
        btn.title = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
      });
    },

    toggle() {
      this.apply(this.get() === 'dark' ? 'light' : 'dark');
    },

    init() {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      const preferred = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
        ? 'dark' : 'light';
      this.apply(saved || preferred);

      MCUtils.injectStyles('mc-theme-toggle-styles', `
        .mc-theme-toggle {
          display: inline-flex; align-items: center; justify-content: center;
          width: 34px; height: 34px; font-size: 16px;
          color: var(--color-neutral-0, #fff);
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px; cursor: pointer; transition: all 0.2s ease;
        }
        .mc-theme-toggle:hover { background: rgba(255,255,255,0.22); transform: translateY(-1px); }
        .mc-theme-toggle.floating {
          position: fixed; bottom: 24px; right: 24px; z-index: 9998;
          background: var(--color-neutral-800, #27272a); border: none;
          box-shadow: 0 4px 14px rgba(0,0,0,0.25); width: 42px; height: 42px; font-size: 18px;
        }
        .mc-locale-picker {
          height: 34px; font-size: 13px; font-weight: 600; cursor: pointer;
          color: var(--color-neutral-0, #fff);
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px; padding: 0 8px; margin-left: 8px;
        }
        .mc-locale-picker option { color: #27272a; }
        .mc-locale-picker.floating {
          position: fixed; bottom: 24px; right: 76px; z-index: 9998;
          background: var(--color-neutral-800, #27272a); border: none;
          box-shadow: 0 4px 14px rgba(0,0,0,0.25); height: 42px;
        }
      `);

      const actions = document.querySelector('.topbar-actions');

      // Theme toggle button
      const themeBtn = document.createElement('button');
      themeBtn.className = 'mc-theme-toggle' + (actions ? '' : ' floating');
      themeBtn.addEventListener('click', () => this.toggle());

      // Locale picker
      const picker = document.createElement('select');
      picker.className = 'mc-locale-picker' + (actions ? '' : ' floating');
      picker.setAttribute('aria-label', 'Language');
      MCI18n.available.forEach(loc => {
        const opt = document.createElement('option');
        opt.value = loc;
        opt.textContent = loc === 'en' ? 'EN' : loc.toUpperCase();
        if (loc === MCI18n.getLocale()) opt.selected = true;
        picker.appendChild(opt);
      });
      picker.addEventListener('change', () => MCI18n.setLocale(picker.value));

      if (actions) {
        actions.appendChild(picker);
        actions.appendChild(themeBtn);
      } else {
        document.body.appendChild(picker);
        document.body.appendChild(themeBtn);
      }
      this.apply(this.get()); // sync icon
    }
  };

  // Expose globals
  window.MCUtils = MCUtils;
  window.MCChapters = MCChapters;
  window.MCI18n = MCI18n;
  window.MCTheme = MCTheme;

  document.documentElement.lang = MCI18n.getLocale();

  const boot = () => { MCTheme.init(); MCI18n.localizeDocument(); };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
