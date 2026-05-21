/**
 * focus-card.js
 * Logic untuk rendering dan interaksi Learning Focus Cards
 * Fix: event delegation, timing-safe, markdown+HTML rendering
 */

window.FocusCardManager = {
  data: null,
  currentIndex: 0,

  async init(jsonUrl) {
    try {
      const res = await fetch(jsonUrl);
      if (!res.ok) throw new Error('Gagal memuat materi: ' + res.statusText);

      this.data = await res.json();
      this.renderHeader();
      this.renderConceptList();
      // Event delegation — tidak perlu tunggu elemen ada di DOM
      this.setupEventListeners();
    } catch (e) {
      console.error('Failed to load materi data', e);
      const titleEl = document.getElementById('materi-title');
      const descEl  = document.getElementById('materi-desc');
      if (titleEl) titleEl.textContent = 'Gagal Memuat Materi';
      if (descEl)  descEl.textContent  = 'Silakan periksa koneksi atau local server Anda.';
    }
  },

  renderHeader() {
    const titleEl = document.getElementById('materi-title');
    const descEl  = document.getElementById('materi-desc');
    if (titleEl) titleEl.textContent = this.data.title;
    if (descEl)  descEl.textContent  = this.data.description;
  },

  renderConceptList() {
    const container = document.getElementById('concept-list');
    if (!container) return;

    container.innerHTML = this.data.concepts.map((concept, index) => `
      <div class="card card-interactive anim-fade-up delay-${(index % 5) + 1}" 
           data-index="${index}" role="button" tabindex="0"
           aria-label="Buka konsep: ${concept.title}">
        <div class="flex items-center gap-3">
          <div class="btn-icon" aria-hidden="true">
            <span class="material-icons">${concept.icon || 'menu_book'}</span>
          </div>
          <div style="flex:1; min-width:0;">
            <h3 class="text-h3" style="font-size: 1.05rem; margin-bottom:2px;">${concept.title}</h3>
            <p class="text-caption">Konsep ${index + 1} dari ${this.data.concepts.length}</p>
          </div>
          <span class="material-icons" style="color:var(--text-tertiary); font-size:20px;">chevron_right</span>
        </div>
      </div>
    `).join('');

    // Klik & keyboard navigation
    container.querySelectorAll('[data-index]').forEach(item => {
      item.addEventListener('click', () => this.openCard(Number(item.getAttribute('data-index'))));
      item.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.openCard(Number(item.getAttribute('data-index')));
        }
      });
    });
  },

  // ─── Markdown Parser ───
  parseContent(text) {
    if (!text) return '';

    // Jika konten sudah berisi HTML tag, perlakukan sebagai HTML + tambah markdown ringan
    let html = text;

    // Bold: **text** → <strong>text</strong>
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic: *text* → <em>text</em>
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Inline code: `code` → <code>code</code>
    html = html.replace(/`([^`]+)`/g, '<code style="background:var(--bg-surface-alt);padding:2px 6px;border-radius:6px;font-family:var(--font-mono);font-size:0.9em;">$1</code>');

    // Newlines → <br> jika belum pakai <br>
    if (!html.includes('<br')) {
      html = html.replace(/\n/g, '<br>');
    }

    return html;
  },

  openCard(index) {
    this.currentIndex = index;
    const concept = this.data.concepts[index];
    const overlay  = document.getElementById('focus-overlay');
    const content  = document.getElementById('focus-content');

    if (!overlay || !content) {
      console.error('Focus overlay elements not found');
      return;
    }

    // ─── Steps HTML ───
    let stepsHtml = '';
    if (concept.steps && concept.steps.length > 0) {
      const stepsItems = concept.steps.map(step =>
        `<li style="margin-bottom: 10px; padding-left: 4px;">${this.parseContent(step)}</li>`
      ).join('');
      stepsHtml = `
        <div style="margin-top:20px; padding:16px; background:var(--bg-surface-alt); border-radius:var(--radius-sm); border-left: 4px solid var(--accent-secondary);">
          <p style="font-weight:700; color:var(--accent-secondary); margin-bottom:10px; font-size:0.85rem; text-transform:uppercase; letter-spacing:0.05em;">Langkah-langkah</p>
          <ol style="padding-left:18px; color:var(--text-secondary); line-height:1.7;">${stepsItems}</ol>
        </div>
      `;
    }

    content.innerHTML = `
      <div style="margin-bottom: 20px;">
        <span class="date-badge mb-2">Konsep ${index + 1} / ${this.data.concepts.length}</span>
        <h2 class="text-h2 mt-2">${concept.title}</h2>
      </div>

      <div class="text-body" style="font-size:1.05rem; line-height:1.8; margin-bottom:16px;">
        ${this.parseContent(concept.content)}
      </div>

      ${stepsHtml}

      ${concept.summary ? `
      <div style="margin-top:24px; padding:16px; background:var(--chip-bg); border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
        <p style="color:var(--accent-primary); font-weight:700; margin-bottom:6px; font-size:0.85rem; text-transform:uppercase; letter-spacing:0.05em;">Ringkasan</p>
        <p class="text-body" style="font-weight:500;">${concept.summary}</p>
      </div>` : ''}
    `;

    // ─── Render KaTeX ───
    if (window.renderMathInElement) {
      window.renderMathInElement(content, {
        delimiters: [
          { left: '$$', right: '$$', display: true  },
          { left: '$',  right: '$',  display: false }
        ],
        throwOnError: false
      });
    }

    // ─── Tampilkan overlay ───
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Update progress per konsep (tidak hanya saat selesai)
    this._updateProgress();
    this.updateNavigation();
  },

  closeCard() {
    const overlay = document.getElementById('focus-overlay');
    if (!overlay) return;
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  },

  nextCard() {
    if (this.currentIndex < this.data.concepts.length - 1) {
      this.openCard(this.currentIndex + 1);
    } else {
      // Selesai semua konsep — save progress 100% lalu ke quiz
      this._saveProgressComplete();
      this.closeCard();

      const slug = this._getSlug();
      const prefix = window.App ? App.getRootPrefix() : '../../';
      window.location.href = `${prefix}quiz.html?materi=${slug}`;
    }
  },

  prevCard() {
    if (this.currentIndex > 0) {
      this.openCard(this.currentIndex - 1);
    }
  },

  updateNavigation() {
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    if (!btnPrev || !btnNext) return;

    btnPrev.style.visibility = this.currentIndex === 0 ? 'hidden' : 'visible';

    if (this.currentIndex === this.data.concepts.length - 1) {
      btnNext.innerHTML = 'Selesai <span class="material-icons" aria-hidden="true">check</span>';
      btnNext.classList.add('btn-primary');
      btnNext.classList.remove('btn-outline');
    } else {
      btnNext.innerHTML = 'Lanjut <span class="material-icons" aria-hidden="true">arrow_forward</span>';
      btnNext.classList.add('btn-outline');
      btnNext.classList.remove('btn-primary');
    }
  },

  // ─── Event Delegation (tidak bergantung timing DOM) ───
  setupEventListeners() {
    document.addEventListener('click', e => {
      const action = e.target.closest('[data-action]')?.getAttribute('data-action');
      if (!action) return;
      if (action === 'close-focus') this.closeCard();
      if (action === 'next-focus')  this.nextCard();
      if (action === 'prev-focus')  this.prevCard();
    });

    // Swipe support
    let touchStartY = 0;
    document.addEventListener('touchstart', e => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', e => {
      const overlay = document.getElementById('focus-overlay');
      if (!overlay || !overlay.classList.contains('active')) return;
      const delta = e.changedTouches[0].clientY - touchStartY;
      if (delta > 80) this.closeCard(); // swipe down tutup
    }, { passive: true });

    // Keyboard: Escape tutup, ArrowRight/Left navigasi
    document.addEventListener('keydown', e => {
      const overlay = document.getElementById('focus-overlay');
      if (!overlay || !overlay.classList.contains('active')) return;
      if (e.key === 'Escape')      this.closeCard();
      if (e.key === 'ArrowRight')  this.nextCard();
      if (e.key === 'ArrowLeft')   this.prevCard();
    });
  },

  // ─── Private helpers ───
  _getSlug() {
    const parts = window.location.pathname.split('/').filter(p => p && p !== 'index.html');
    // Path: .../materi/[slug]/index.html → slug adalah bagian terakhir sebelum index.html
    const materiIdx = parts.findIndex(p => p === 'materi');
    if (materiIdx !== -1 && parts[materiIdx + 1]) {
      return parts[materiIdx + 1];
    }
    // Fallback: ambil bagian terakhir
    return parts[parts.length - 1] || 'unknown';
  },

  _updateProgress() {
    if (!window.Storage) return;
    const slug    = this._getSlug();
    const percent = Math.round(((this.currentIndex + 1) / this.data.concepts.length) * 100);
    const current = Storage.getProgress(slug);
    // Hanya update jika progress baru lebih tinggi
    if (percent > current) {
      Storage.saveProgress(slug, percent);
    }
  },

  _saveProgressComplete() {
    if (!window.Storage) return;
    Storage.saveProgress(this._getSlug(), 100);
  }
};
