/**
 * storage.js
 * Wrapper for localStorage — progress, settings, dan identity madrasah
 */

const Storage = {
  PREFIX: 'edu_app_',

  save(key, data) {
    try {
      localStorage.setItem(this.PREFIX + key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Error saving to localStorage', e);
      return false;
    }
  },

  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(this.PREFIX + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error('Error reading from localStorage', e);
      return defaultValue;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(this.PREFIX + key);
    } catch (e) {
      console.error('Error removing from localStorage', e);
    }
  },

  // ─── Progress Helpers ───
  saveProgress(materiId, progress) {
    const allProgress = this.get('progress', {});
    allProgress[materiId] = {
      percent: progress,
      updatedAt: new Date().toISOString()
    };
    this.save('progress', allProgress);
  },

  getProgress(materiId) {
    const allProgress = this.get('progress', {});
    const entry = allProgress[materiId];
    if (!entry) return 0;
    // Support format lama (angka langsung) maupun format baru (object)
    return typeof entry === 'object' ? (entry.percent || 0) : entry;
  },

  getAllProgress() {
    return this.get('progress', {});
  },

  resetAllProgress() {
    this.remove('progress');
    this.remove('quiz_scores');
    // Hapus key lama yang mungkin masih ada
    try {
      localStorage.removeItem('esem_scores');
    } catch(e) {}
  },

  saveQuizScore(quizId, score) {
    const scores = this.get('quiz_scores', {});
    scores[quizId] = { score, savedAt: new Date().toISOString() };
    this.save('quiz_scores', scores);
  },

  getQuizScore(quizId) {
    const scores = this.get('quiz_scores', {});
    const entry = scores[quizId];
    if (!entry) return null;
    return typeof entry === 'object' ? entry.score : entry;
  },

  getAllQuizScores() {
    return this.get('quiz_scores', {});
  },

  // ─── Settings & Identity Helpers ───
  DEFAULT_SETTINGS: {
    appName: 'MTs Ma\'arif Jumo',
    tagline: 'Madrasahe keren, ora ninggal pesantren',
    theme: 'light',
    fontSize: 'normal',
    animations: true,
    activeThemeColor: 'nu-maarif'
  },

  getSettings() {
    const saved = this.get('settings', {});
    return Object.assign({}, this.DEFAULT_SETTINGS, saved);
  },

  saveSettings(settings) {
    const current = this.get('settings', {});
    const merged = Object.assign({}, current, settings);
    this.save('settings', merged);
    return merged;
  },

  getSetting(key) {
    return this.getSettings()[key];
  },

  saveSetting(key, value) {
    const settings = this.get('settings', {});
    settings[key] = value;
    this.save('settings', settings);
  }
};
