/**
 * ==============================================================================
 * MASTERCLASS UI — UNIFIED REUSABLE COMPONENT LIBRARY
 * ==============================================================================
 * 
 * Strict 1000% Component Reusability Compliance:
 * 1. Zero Hardcoding: All data, titles, questions, code passed via options
 * 2. Decoupled Callbacks: Accepts execution callbacks and API endpoints
 * 3. Domain Neutral: Works for AWS, Python, Docker, or any technical subject
 * 4. Universal Compatibility: Standalone Vanilla JS & Web Component support
 */

(function(root) {
  'use strict';

  const MasterclassUI = {
    version: '1.0.0',

    /**
     * Helper to resolve target element (ID string or DOM element)
     */
    _resolveTarget(target) {
      if (typeof target === 'string') {
        const el = document.getElementById(target) || document.querySelector(target);
        if (!el) {
          throw new Error(`[MasterclassUI] Element '${target}' not found in document.`);
        }
        return el;
      }
      return target;
    },

    /**
     * Terminal Component
     * @param {string|HTMLElement} target
     * @param {Object} options
     *   - title {string}
     *   - prompt {string}
     *   - mode {'simulated'|'real'}
     *   - commands {Object} Map of command pattern to responses
     *   - onCommand {Function} Callback (command, terminal)
     *   - initialText {string}
     */
    Terminal(target, options = {}) {
      const container = this._resolveTarget(target);
      if (typeof TerminalEngine === 'undefined') {
        console.error('[MasterclassUI] TerminalEngine not loaded.');
        return null;
      }
      return new TerminalEngine(container, {
        title: options.title || 'Terminal Console',
        prompt: options.prompt || '$ ',
        mode: options.mode || 'simulated',
        commands: options.commands || {},
        onCommand: options.onCommand || null,
        showActions: options.showActions !== false,
        initialText: options.initialText || ''
      });
    },

    /**
     * Code Editor Component
     * @param {string|HTMLElement} target
     * @param {Object} options
     *   - title {string}
     *   - language {string} (python, javascript, bash, json)
     *   - code {string}
     *   - onRun {Function}
     *   - onReset {Function}
     */
    CodeEditor(target, options = {}) {
      const container = this._resolveTarget(target);
      if (typeof CodeEditorEngine === 'undefined') {
        console.error('[MasterclassUI] CodeEditorEngine not loaded.');
        return null;
      }
      // Normalize facade options to the engine's languages[] contract
      const languages = options.languages || [{
        id: options.language || 'python',
        label: options.languageLabel || options.language || 'Python',
        code: options.code || '',
        explanations: options.explanations || []
      }];
      return new CodeEditorEngine(container, {
        title: options.title || 'Code Workspace',
        languages,
        defaultLang: options.defaultLang || languages[0].id,
        editable: options.editable !== false && !options.readOnly,
        showLineNumbers: options.showLineNumbers !== false,
        expectedOutput: options.expectedOutput || '',
        onRun: options.onRun || null
      });
    },

    /**
     * Quiz Component
     * @param {string|HTMLElement} target
     * @param {Object} options
     *   - title {string}
     *   - questions {Array} Array of question objects:
     *       [{ id, question, options: [], correctIndex, explanation }]
     *   - onSubmit {Function} (results, score)
     *   - onQuestionAnswer {Function} (questionId, selectedIndex, isCorrect)
     */
    Quiz(target, options = {}) {
      const container = this._resolveTarget(target);
      if (typeof QuizEngine === 'undefined') {
        console.error('[MasterclassUI] QuizEngine not loaded.');
        return null;
      }
      return new QuizEngine(container, {
        title: options.title || 'Knowledge Assessment',
        type: options.type || 'knowledge-check',
        questions: options.questions || [],
        showImmediate: options.showImmediate,
        shuffleOptions: options.shuffleOptions,
        onComplete: options.onSubmit
          ? (score, total) => options.onSubmit({ score, total, percentage: Math.round((score / total) * 100) }, score)
          : (options.onComplete || null),
        onAnswer: options.onQuestionAnswer || null
      });
    },

    /**
     * Architecture Diagram Component
     * @param {string|HTMLElement} target
     * @param {Object} options
     *   - title {string}
     *   - nodes {Array}
     *   - connections {Array}
     *   - interactive {boolean}
     */
    Diagram(target, options = {}) {
      const container = this._resolveTarget(target);
      if (typeof DiagramEngine === 'undefined') {
        console.error('[MasterclassUI] DiagramEngine not loaded.');
        return null;
      }
      return new DiagramEngine(container, {
        title: options.title || 'System Architecture Flow',
        nodes: options.nodes || [],
        edges: options.edges || options.connections || [],
        width: options.width,
        height: options.height,
        onNodeClick: options.onNodeClick || null
      });
    },

    /**
     * Step-by-Step Lab Component
     * @param {string|HTMLElement} target
     * @param {Object} options
     *   - title {string}
     *   - steps {Array} Array of step objects
     *   - onStepComplete {Function} (stepIndex)
     *   - onLabComplete {Function} ()
     */
    Lab(target, options = {}) {
      const container = this._resolveTarget(target);
      if (typeof LabEngine === 'undefined') {
        console.error('[MasterclassUI] LabEngine not loaded.');
        return null;
      }
      return new LabEngine(container, {
        title: options.title || 'Hands-On Lab Scenario',
        description: options.description || '',
        difficulty: options.difficulty || 'beginner',
        duration: options.duration || '15 min',
        prerequisites: options.prerequisites || [],
        steps: options.steps || [],
        resources: options.resources || [],
        onComplete: options.onLabComplete || options.onComplete || null
      });
    },

    /**
     * Console Simulator Component
     * @param {string|HTMLElement} target
     * @param {Object} options
     *   - serviceName {string}
     *   - tabs {Array}
     *   - actions {Array}
     */
    ConsoleSimulator(target, options = {}) {
      const container = this._resolveTarget(target);
      if (typeof ConsoleSimulator === 'undefined') {
        console.error('[MasterclassUI] ConsoleSimulator not loaded.');
        return null;
      }
      return new ConsoleSimulator(container, {
        service: options.service || options.serviceName || 'Cloud Management Console',
        title: options.title,
        steps: options.steps || [],
        screens: options.screens || {},
        onComplete: options.onComplete || null
      });
    },

    /**
     * Command Block Component
     * @param {string|HTMLElement} target
     * @param {Object} options
     *   - command {string}
     *   - title {string}
     *   - description {string}
     */
    CommandBlock(target, options = {}) {
      const container = this._resolveTarget(target);
      if (typeof CommandBlock === 'undefined') {
        console.error('[MasterclassUI] CommandBlock not loaded.');
        return null;
      }
      return new CommandBlock(container, {
        command: options.command || '',
        category: options.category || 'aws-cli',
        expectedOutput: options.expectedOutput || '',
        explanation: options.explanation || options.description || '',
        commonErrors: options.commonErrors || [],
        interviewQ: options.interviewQ || '',
        onRun: options.onRun || null,
        onTryIt: options.onTryIt || null
      });
    },

    /**
     * Challenge Component
     * @param {string|HTMLElement} target
     * @param {Object} options
     */
    Challenge(target, options = {}) {
      const container = this._resolveTarget(target);
      if (typeof ChallengeEngine === 'undefined') {
        console.error('[MasterclassUI] ChallengeEngine not loaded.');
        return null;
      }
      return new ChallengeEngine(container, options);
    }
  };

  // Expose to window / global
  root.MasterclassUI = MasterclassUI;

})(typeof window !== 'undefined' ? window : this);
