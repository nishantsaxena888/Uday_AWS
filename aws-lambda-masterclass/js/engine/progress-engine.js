/**
 * ============================================================
 * AWS PRODUCTION MASTERCLASS — PROGRESS ENGINE
 * Tracks course/module/lesson/section completion in localStorage
 * ============================================================
 * 
 * 100% REUSABLE — accepts course registry data via constructor.
 * Zero hardcoded module/lesson names.
 */
class ProgressEngine {
  /**
   * @param {Object} config
   * @param {string} config.storageKey - localStorage key prefix
   * @param {Array}  config.modules    - Array of { id, title, lessons: [{ id, title, sections: [] }] }
   */
  constructor(config = {}) {
    this.storageKey = config.storageKey || 'aws-masterclass-progress';
    this.modules = config.modules || [];
    this.data = this._load();
    this._listeners = [];
    // Live lesson metadata registered at runtime by app.initModule.
    // moduleId -> { lessonId, sectionIds: [string] }
    this.live = {};
    this._saving = false;
    this._saveQueued = false;
  }

  /**
   * Registers the lesson actually rendered on this page so completion
   * math uses real section IDs instead of empty registry stubs.
   */
  registerLesson(moduleId, lessonId, sectionIds = []) {
    this.live[moduleId] = { lessonId, sectionIds };
  }

  // --- PERSISTENCE ---
  _load() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : this._createFresh();
    } catch {
      return this._createFresh();
    }
  }

  _save() {
    if (this._saving) { this._saveQueued = true; return; }
    this._saving = true;
    try {
      this._checkAchievements();
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
      this._notify();
    } catch (e) {
      console.warn('ProgressEngine: localStorage write failed', e);
    } finally {
      this._saving = false;
    }
    if (this._saveQueued) {
      this._saveQueued = false;
      this._save();
    }
  }

  _createFresh() {
    return {
      version: 1,
      startedAt: new Date().toISOString(),
      modules: {},
      quizScores: {},
      challengeScores: {},
      commandsExecuted: 0,
      labsCompleted: 0,
      achievements: [],
      masteryLevel: 'beginner'
    };
  }

  // --- MODULE PROGRESS ---
  markSectionComplete(moduleId, lessonId, sectionId) {
    this._ensureModule(moduleId);
    this._ensureLesson(moduleId, lessonId);
    const sections = this.data.modules[moduleId].lessons[lessonId].sections;
    if (!sections.includes(sectionId)) {
      sections.push(sectionId);
    }
    this._updateLessonCompletion(moduleId, lessonId);
    this._updateModuleCompletion(moduleId);
    this._checkMastery();
    this._save();
  }

  markLessonComplete(moduleId, lessonId) {
    this._ensureModule(moduleId);
    this._ensureLesson(moduleId, lessonId);
    this.data.modules[moduleId].lessons[lessonId].complete = true;
    this.data.modules[moduleId].lessons[lessonId].completedAt = new Date().toISOString();
    this._updateModuleCompletion(moduleId);
    this._checkMastery();
    this._save();
  }

  markModuleComplete(moduleId) {
    this._ensureModule(moduleId);
    this.data.modules[moduleId].complete = true;
    this.data.modules[moduleId].completedAt = new Date().toISOString();
    this._checkMastery();
    this._save();
  }

  // --- QUIZ SCORES ---
  recordQuizScore(moduleId, quizId, score, total) {
    const key = `${moduleId}:${quizId}`;
    this.data.quizScores[key] = {
      score,
      total,
      percentage: Math.round((score / total) * 100),
      timestamp: new Date().toISOString()
    };
    this._save();
  }

  getQuizScore(moduleId, quizId) {
    return this.data.quizScores[`${moduleId}:${quizId}`] || null;
  }

  // --- CHALLENGE SCORES ---
  recordChallengeScore(moduleId, challengeId, score, maxScore) {
    const key = `${moduleId}:${challengeId}`;
    this.data.challengeScores[key] = {
      score,
      maxScore,
      percentage: Math.round((score / maxScore) * 100),
      timestamp: new Date().toISOString()
    };
    this._save();
  }

  // --- COMMANDS ---
  incrementCommandsExecuted() {
    this.data.commandsExecuted++;
    this._save();
  }

  incrementLabsCompleted() {
    this.data.labsCompleted++;
    this._save();
  }

  // --- ACHIEVEMENTS ---
  grantAchievement(achievementId) {
    if (!this.data.achievements.includes(achievementId)) {
      this.data.achievements.push(achievementId);
      this._save();
      return true; // new achievement
    }
    return false;
  }

  hasAchievement(achievementId) {
    return this.data.achievements.includes(achievementId);
  }

  // --- GETTERS ---
  getModuleProgress(moduleId) {
    const mod = this.data.modules[moduleId];
    if (!mod) return 0;
    if (mod.complete) return 100;

    // Prefer live-registered lesson sections (real denominator).
    const live = this.live[moduleId];
    if (live && live.sectionIds.length) {
      const lesson = mod.lessons?.[live.lessonId];
      if (!lesson) return 0;
      const done = (lesson.sections || []).filter(s => live.sectionIds.includes(s)).length;
      return Math.round((done / live.sectionIds.length) * 100);
    }

    const moduleDef = this.modules.find(m => m.id === moduleId);
    if (!moduleDef || !moduleDef.lessons || moduleDef.lessons.length === 0) return 0;
    const completed = Object.values(mod.lessons).filter(l => l.complete).length;
    return Math.round((completed / moduleDef.lessons.length) * 100);
  }

  getOverallProgress() {
    if (this.modules.length === 0) return 0;
    const total = this.modules.reduce((sum, m) => sum + this.getModuleProgress(m.id), 0);
    return Math.round(total / this.modules.length);
  }

  isLessonComplete(moduleId, lessonId) {
    return this.data.modules[moduleId]?.lessons?.[lessonId]?.complete || false;
  }

  isModuleComplete(moduleId) {
    return this.data.modules[moduleId]?.complete || false;
  }

  isSectionComplete(moduleId, lessonId, sectionId) {
    return this.data.modules[moduleId]?.lessons?.[lessonId]?.sections?.includes(sectionId) || false;
  }

  getMasteryLevel() {
    return this.data.masteryLevel;
  }

  getStats() {
    return {
      overallProgress: this.getOverallProgress(),
      commandsExecuted: this.data.commandsExecuted,
      labsCompleted: this.data.labsCompleted,
      achievementCount: this.data.achievements.length,
      quizzesTaken: Object.keys(this.data.quizScores).length,
      challengesSolved: Object.keys(this.data.challengeScores).length,
      masteryLevel: this.data.masteryLevel
    };
  }

  // --- LISTENERS ---
  onChange(callback) {
    this._listeners.push(callback);
    return () => {
      this._listeners = this._listeners.filter(l => l !== callback);
    };
  }

  _notify() {
    const stats = this.getStats();
    this._listeners.forEach(cb => cb(stats));
  }

  // --- RESET ---
  reset() {
    this.data = this._createFresh();
    this._save();
  }

  // --- INTERNAL ---
  _ensureModule(moduleId) {
    if (!this.data.modules[moduleId]) {
      this.data.modules[moduleId] = { lessons: {}, complete: false };
    }
  }

  _ensureLesson(moduleId, lessonId) {
    if (!this.data.modules[moduleId].lessons[lessonId]) {
      this.data.modules[moduleId].lessons[lessonId] = {
        sections: [],
        complete: false
      };
    }
  }

  _updateLessonCompletion(moduleId, lessonId) {
    // Determine the declared section list: live registration first,
    // then registry lesson def. Skip auto-completion when nothing is
    // declared — an empty list would make [].every() vacuously true.
    const live = this.live[moduleId];
    let declared = null;
    if (live && live.lessonId === lessonId && live.sectionIds.length) {
      declared = live.sectionIds;
    } else {
      const moduleDef = this.modules.find(m => m.id === moduleId);
      const lessonDef = moduleDef?.lessons?.find(l => l.id === lessonId);
      if (!lessonDef || !lessonDef.sections || !lessonDef.sections.length) return;
      declared = lessonDef.sections.map(s => s.id || s);
    }

    const completed = this.data.modules[moduleId].lessons[lessonId].sections;
    if (declared.every(s => completed.includes(s))) {
      this.data.modules[moduleId].lessons[lessonId].complete = true;
      this.data.modules[moduleId].lessons[lessonId].completedAt = new Date().toISOString();
    }
  }

  _updateModuleCompletion(moduleId) {
    if (this.data.modules[moduleId].complete) return;

    // Live lesson fully done -> module done (one lesson per module page).
    const live = this.live[moduleId];
    if (live && this.data.modules[moduleId].lessons?.[live.lessonId]?.complete) {
      this.data.modules[moduleId].complete = true;
      this.data.modules[moduleId].completedAt = new Date().toISOString();
      return;
    }

    const moduleDef = this.modules.find(m => m.id === moduleId);
    if (!moduleDef || !moduleDef.lessons || !moduleDef.lessons.length) return;
    const allComplete = moduleDef.lessons.every(l =>
      this.data.modules[moduleId]?.lessons?.[l.id]?.complete
    );
    if (allComplete) {
      this.data.modules[moduleId].complete = true;
      this.data.modules[moduleId].completedAt = new Date().toISOString();
    }
  }

  // --- ACHIEVEMENT RULES ---
  _checkAchievements() {
    const d = this.data;
    const modulesCompleted = Object.values(d.modules).filter(m => m.complete).length;
    const sectionsCompleted = Object.values(d.modules).reduce(
      (n, m) => n + Object.values(m.lessons || {}).reduce(
        (x, l) => x + ((l.sections || []).length), 0
      ), 0
    );

    if (sectionsCompleted >= 1) this.grantAchievement('first-steps');
    if (modulesCompleted >= 1) this.grantAchievement('module-finisher');
    if (modulesCompleted >= 5) this.grantAchievement('five-modules');
    if (this.modules.length && modulesCompleted >= Math.ceil(this.modules.length / 2)) {
      this.grantAchievement('half-journey');
    }
    if (d.labsCompleted >= 1) this.grantAchievement('hands-on');
    if (d.commandsExecuted >= 10) this.grantAchievement('cli-warrior');
    if (Object.values(d.quizScores).some(q => q.percentage === 100)) {
      this.grantAchievement('quiz-ace');
    }
    if (this.getOverallProgress() >= 90) this.grantAchievement('production-architect');
  }

  _checkMastery() {
    const progress = this.getOverallProgress();
    if (progress >= 90) this.data.masteryLevel = 'production-ready';
    else if (progress >= 70) this.data.masteryLevel = 'advanced';
    else if (progress >= 40) this.data.masteryLevel = 'intermediate';
    else this.data.masteryLevel = 'beginner';
  }
}

// Export for module or global use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProgressEngine;
} else {
  window.ProgressEngine = ProgressEngine;
}
