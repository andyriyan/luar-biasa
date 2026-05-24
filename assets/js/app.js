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

// ==========================================
// LOGIKA UTILITAS TOKEN DIGITAL GURU
// ==========================================

// Fungsi Penjanaan Kode Ruangan (delegasi ke ExamToken jika tersedia)
async function generateExamToken(examSlug, durationMinutes, classCode, validDate) {
  const date = validDate || new Date().toISOString().split('T')[0];

  if (window.ExamToken) {
    const session = await ExamToken.generateRoomCode(examSlug, classCode, date, durationMinutes);
    ExamToken.saveSession(session);
    const link = ExamToken.buildExamLink(session.slug, session.display, session.durasi, session.validDate);
    return { displayToken: session.display, payload: link, session };
  }

  const randomCode = Math.floor(1000 + Math.random() * 9000);
  const mapelCode  = examSlug.split('-')[0].toUpperCase().slice(0, 3);
  const displayToken = `${mapelCode}-${classCode}-${randomCode}`;
  return { displayToken, payload: btoa(JSON.stringify({ display: displayToken, slug: examSlug })) };
}

// Injeksi Struktur DOM Interface Tab Panel Manajemen Token Guru
function injectTokenPanelMarkup() {
  return `
  <div class="token-panel-box" style="padding:15px; background:#fff; border-radius:8px; border:1px solid #e2e8f0;">
    <h3 style="color:#059669; margin-bottom:5px;">🔑 Generator Kode Ruangan</h3>
    <p style="font-size:0.85rem; color:#64748b; margin-bottom:15px;">Buat kode akses ujian untuk seluruh kelas. Kode sama di semua perangkat — tanpa sync database.</p>
    
    <div style="margin-bottom:10px;">
      <label style="display:block; font-size:0.85rem; font-weight:600;">Pilih Paket Ujian:</label>
      <select id="token-exam-slug" style="width:100%; padding:8px; border-radius:6px; margin-top:4px;">
        <option value="ulangan-aljabar-7">Ulangan Harian: Aljabar - Kelas 7</option>
      </select>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:10px;">
      <div>
        <label style="font-size:0.85rem; font-weight:600;">Durasi (Menit):</label>
        <input type="number" id="token-duration" value="50" style="width:100%; padding:8px; border-radius:6px; margin-top:4px;">
      </div>
      <div>
        <label style="font-size:0.85rem; font-weight:600;">Kode Kelas:</label>
        <input type="text" id="token-class" value="7A" style="width:100%; padding:8px; border-radius:6px; margin-top:4px;">
      </div>
    </div>

    <div style="margin-bottom:15px;">
      <label style="display:block; font-size:0.85rem; font-weight:600;">Tanggal Berlaku Ujian:</label>
      <input type="date" id="token-date" style="width:100%; padding:8px; border-radius:6px; margin-top:4px;">
    </div>

    <button onclick="executeTokenGenerationProcess()" style="background:#059669; color:white; border:none; padding:10px; border-radius:6px; width:100%; font-weight:bold; cursor:pointer;">✨ Generate Kode Ruangan</button>
    
    <div id="token-result-display" style="margin-top:15px; display:none; background:#f1f5f9; padding:10px; border-radius:6px; border:1px solid #cbd5e1;">
      <p style="font-size:0.85rem; margin-bottom:5px;"><b>Kode Ruangan:</b> <span id="txt-display-tok" style="color:#d97706; font-weight:bold; font-size:1.2rem;"></span></p>
      <p style="font-size:0.85rem; margin-bottom:5px;"><b>Link Ujian (bagikan ke WA):</b></p>
      <textarea id="txt-payload-tok" readonly style="width:100%; height:70px; font-size:0.75rem; font-family:monospace; margin-top:5px; padding:5px;"></textarea>
    </div>
  </div>`;
}

async function executeTokenGenerationProcess() {
  const slug = document.getElementById('token-exam-slug').value;
  const dur = document.getElementById('token-duration').value;
  const cls = document.getElementById('token-class').value;
  const date = document.getElementById('token-date').value || new Date().toISOString().split('T')[0];

  const res = await generateExamToken(slug, dur, cls, date);
  
  document.getElementById('token-result-display').style.display = 'block';
  document.getElementById('txt-display-tok').innerText = res.displayToken;
  document.getElementById('txt-payload-tok').value = res.payload;
}
