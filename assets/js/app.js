/**
 * app.js
 * Core application logic and initialization
 */

const App = {
  version: '1.2.0',
  components: {},
  data: {},

  async init() {
    this.applyTheme();
    this.registerServiceWorker();
    await this.loadComponents();
    document.dispatchEvent(new Event('app:ready'));
  },

  // ─── Path Utilities ───
  /**
   * Hitung prefix path relatif dari root app.
   * Contoh: di materi/statistika-smp/index.html → '../../'
   */
  getRootPrefix() {
    const path = window.location.pathname;
    // Cari berapa kedalaman folder 'materi/'
    const parts = path.split('/').filter(p => p.length > 0 && p !== 'index.html');
    
    // Temukan index folder 'materi' di path
    const materiIdx = parts.findIndex(p => p === 'materi');
    if (materiIdx !== -1) {
      // Kedalaman = jumlah segmen setelah 'materi' + 1 (untuk 'materi' itu sendiri)
      const depth = parts.length - materiIdx;
      return '../'.repeat(depth);
    }
    
    // Jika tidak ada 'materi' di path, kita di root
    return './';
  },

  // ─── Theme System ───
  THEMES: {
    'light':         { label: 'Terang',         icon: 'light_mode' },
    'dark':          { label: 'Gelap',           icon: 'dark_mode' },
    'nu-maarif':     { label: 'NU Ma\'arif',     icon: 'mosque' },
    'nu-maarif-dark':{ label: 'NU Malam',        icon: 'nights_stay' },
    'auto':          { label: 'Ikuti Sistem',    icon: 'brightness_auto' }
  },

  applyTheme() {
    const settings = window.Storage ? Storage.getSettings() : {};
    const savedTheme = settings.theme || localStorage.getItem('theme') || 'light';

    if (savedTheme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  },

  // Alias untuk backward compatibility
  initTheme() { this.applyTheme(); },

  setTheme(themeKey) {
    if (themeKey === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', themeKey);
    }
    if (window.Storage) {
      Storage.saveSetting('theme', themeKey);
    } else {
      localStorage.setItem('theme', themeKey);
    }
    document.dispatchEvent(new CustomEvent('theme:changed', { detail: { theme: themeKey } }));
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
  },

  // ─── Service Worker ───
  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        const swPath = `${this.getRootPrefix()}service-worker.js`;
        navigator.serviceWorker.register(swPath)
          .then(r => console.log('SW registered:', r.scope))
          .catch(e => console.warn('SW registration failed:', e));
      });
    }
  },

  // ─── Component Loader ───
  async loadComponents() {
    const elements = document.querySelectorAll('[data-component]');
    const prefix = this.getRootPrefix();

    for (const el of elements) {
      const componentName = el.getAttribute('data-component');
      try {
        const response = await fetch(`${prefix}components/${componentName}.html`);
        if (response.ok) {
          el.innerHTML = await response.text();

          if (componentName === 'bottom-nav') {
            await this.mountBottomNav(el, prefix);
          }

          // Jalankan script yang ada di dalam komponen (mis. navbar toggle theme)
          el.querySelectorAll('script').forEach(oldScript => {
            const newScript = document.createElement('script');
            newScript.textContent = oldScript.textContent;
            oldScript.parentNode.replaceChild(newScript, oldScript);
          });

          el.dispatchEvent(new CustomEvent('component:loaded', {
            bubbles: true,
            detail: { name: componentName }
          }));
        }
      } catch (e) {
        console.error(`Failed to load component: ${componentName}`, e);
      }
    }
  },

  // ─── Bottom Nav Mount ───
  async mountBottomNav(rootEl, prefix) {
    try {
      const response = await fetch(`${prefix}data/navigation.json`);
      if (!response.ok) return;
      const data = await response.json();
      const container = rootEl.querySelector('#bottom-nav-container');
      if (!container) return;

      // Ambil nama file halaman saat ini untuk deteksi active
      const currentFile = window.location.pathname.split('/').pop() || 'index.html';
      // Handle kasus root (/) → anggap index.html
      const activePage = currentFile === '' ? 'index.html' : currentFile;

      container.innerHTML = data.bottomNav.map(item => {
        const href = `${prefix}${item.href}`;
        // Cek apakah item ini adalah halaman aktif
        const isActive = item.href === activePage ||
          (activePage === '' && item.href === 'index.html');

        return `
          <a href="${href}" class="nav-item ${isActive ? 'active' : ''}" id="nav-${item.id}" aria-label="${item.label}">
            <div class="nav-icon-wrapper">
              <span class="material-icons" aria-hidden="true">${item.icon}</span>
            </div>
            <span class="nav-label">${item.label}</span>
          </a>
        `;
      }).join('');
    } catch (err) {
      console.error('Failed to mount bottom nav', err);
    }
  },

  // ─── Settings / Identity ───
  getSettings() {
    return window.Storage ? Storage.getSettings() : { appName: 'MTs Ma\'arif Jumo', tagline: '' };
  },

  saveSettings(obj) {
    if (window.Storage) Storage.saveSettings(obj);
  }
};

// Inisialisasi ketika DOM siap
document.addEventListener('DOMContentLoaded', () => { App.init(); });
