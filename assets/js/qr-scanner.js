/**
 * qr-scanner.js
 * Scanner QR Code via kamera — pure vanilla JS, tanpa library eksternal.
 * Menggunakan BarcodeDetector API (native browser) dengan fallback
 * ke jsQR (CDN) untuk browser yang belum support.
 *
 * Dua mode pakai:
 *   1. QRScanner.openModal(onResult)  — modal overlay dari mana saja
 *   2. QRScanner.mountInline(containerEl, onResult) — embed di dalam elemen
 *
 * onResult(text) dipanggil saat QR berhasil dibaca.
 * Setelah onResult dipanggil, scanner otomatis berhenti.
 */

const QRScanner = (function () {

  // ─── State ───────────────────────────────────────────────────
  let _stream     = null;
  let _rafId      = null;
  let _video      = null;
  let _canvas     = null;
  let _ctx        = null;
  let _active     = false;
  let _onResult   = null;
  let _detector   = null;   // BarcodeDetector instance
  let _useJsQR    = false;  // fallback flag

  // ─── Deteksi kemampuan browser ───────────────────────────────
  async function initDetector() {
    if (_detector) return true;

    // Coba BarcodeDetector (Chrome 83+, Edge, Android WebView)
    if ('BarcodeDetector' in window) {
      try {
        const supported = await BarcodeDetector.getSupportedFormats();
        if (supported.includes('qr_code')) {
          _detector = new BarcodeDetector({ formats: ['qr_code'] });
          return true;
        }
      } catch (e) { /* fallthrough */ }
    }

    // Fallback: coba load jsQR dari CDN
    if (window.jsQR) { _useJsQR = true; return true; }

    return new Promise((resolve) => {
      const s = document.createElement('script');
      s.src   = 'https://cdnjs.cloudflare.com/ajax/libs/jsQR/1.4.0/jsQR.min.js';
      s.onload  = () => { _useJsQR = true; resolve(true); };
      s.onerror = () => resolve(false);
      document.head.appendChild(s);
    });
  }

  // ─── Mulai stream kamera ──────────────────────────────────────
  async function startCamera(videoEl) {
    if (_stream) stopCamera();
    try {
      _stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' }, // kamera belakang
          width:  { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      videoEl.srcObject = _stream;
      await videoEl.play();
      return true;
    } catch (e) {
      console.error('[QRScanner] getUserMedia gagal:', e.message);
      return false;
    }
  }

  function stopCamera() {
    if (_stream) {
      _stream.getTracks().forEach(t => t.stop());
      _stream = null;
    }
    if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null; }
    _active = false;
  }

  // ─── Loop deteksi ─────────────────────────────────────────────
  function scanLoop() {
    if (!_active) return;
    if (!_video || _video.readyState < 2) {
      _rafId = requestAnimationFrame(scanLoop); return;
    }

    const w = _video.videoWidth;
    const h = _video.videoHeight;
    if (w === 0 || h === 0) { _rafId = requestAnimationFrame(scanLoop); return; }

    if (_canvas.width !== w || _canvas.height !== h) {
      _canvas.width  = w;
      _canvas.height = h;
    }

    _ctx.drawImage(_video, 0, 0, w, h);

    if (_detector) {
      // BarcodeDetector — async, tidak blokir frame
      _detector.detect(_canvas).then(codes => {
        if (!_active) return;
        if (codes.length > 0) {
          handleResult(codes[0].rawValue);
        } else {
          _rafId = requestAnimationFrame(scanLoop);
        }
      }).catch(() => {
        _rafId = requestAnimationFrame(scanLoop);
      });
    } else if (_useJsQR && window.jsQR) {
      // jsQR — sync
      const imgData = _ctx.getImageData(0, 0, w, h);
      const code    = jsQR(imgData.data, w, h, { inversionAttempts: 'dontInvert' });
      if (code && code.data) {
        handleResult(code.data);
      } else {
        _rafId = requestAnimationFrame(scanLoop);
      }
    } else {
      _rafId = requestAnimationFrame(scanLoop);
    }
  }

  function handleResult(text) {
    if (!text || !_active) return;
    _active = false;
    stopCamera();
    if (_onResult) _onResult(text);
  }

  // ─── Shared setup ─────────────────────────────────────────────
  async function setupScanner(videoEl, statusEl, onResult) {
    _onResult = onResult;
    _video    = videoEl;
    _canvas   = document.createElement('canvas');
    _ctx      = _canvas.getContext('2d');

    if (statusEl) statusEl.textContent = 'Memulai kamera…';

    const ready = await initDetector();
    if (!ready) {
      if (statusEl) statusEl.textContent = 'Browser tidak mendukung pemindai QR.';
      return false;
    }

    const ok = await startCamera(videoEl);
    if (!ok) {
      if (statusEl) statusEl.textContent = 'Izin kamera ditolak. Cek pengaturan browser.';
      return false;
    }

    _active = true;
    if (statusEl) statusEl.textContent = 'Arahkan kamera ke QR Code…';
    _rafId  = requestAnimationFrame(scanLoop);
    return true;
  }

  // ─── MODE 1: Modal overlay ────────────────────────────────────
  /**
   * Tampilkan modal scanner dari mana saja.
   * @param {function} onResult - dipanggil dengan string QR saat berhasil scan
   * @param {object}   opts     - { title, hint }
   */
  async function openModal(onResult, opts = {}) {
    const existing = document.getElementById('qr-scanner-modal');
    if (existing) existing.remove();

    const title = opts.title || 'Scan QR Code Ujian';
    const hint  = opts.hint  || 'Arahkan kamera ke QR Code dari guru';

    const modal = document.createElement('div');
    modal.id    = 'qr-scanner-modal';
    modal.style.cssText = `
      position:fixed;inset:0;z-index:99999;
      background:rgba(0,0,0,0.92);
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      padding:16px;
    `;

    modal.innerHTML = `
      <div style="
        width:100%;max-width:400px;
        background:var(--bg-card,#1a1a1a);
        border-radius:16px;overflow:hidden;
        box-shadow:0 24px 48px rgba(0,0,0,0.5);
      ">
        <!-- Header -->
        <div style="
          padding:16px 20px;
          display:flex;align-items:center;justify-content:space-between;
          border-bottom:1px solid rgba(255,255,255,0.08);
        ">
          <div style="display:flex;align-items:center;gap:10px;">
            <span class="material-icons" style="color:#10853F;font-size:22px;">qr_code_scanner</span>
            <span style="font-weight:800;font-size:1rem;color:var(--text-primary,#fff)">${title}</span>
          </div>
          <button id="qr-modal-close" style="
            background:rgba(255,255,255,0.1);border:none;border-radius:50%;
            width:32px;height:32px;cursor:pointer;color:var(--text-secondary,#aaa);
            display:flex;align-items:center;justify-content:center;
          ">
            <span class="material-icons" style="font-size:18px;">close</span>
          </button>
        </div>

        <!-- Viewfinder -->
        <div style="position:relative;background:#000;aspect-ratio:1;overflow:hidden;">
          <video id="qr-modal-video" autoplay playsinline muted
            style="width:100%;height:100%;object-fit:cover;display:block;"></video>

          <!-- Overlay bingkai -->
          <div style="
            position:absolute;inset:0;
            display:flex;align-items:center;justify-content:center;
            pointer-events:none;
          ">
            <!-- 4 sudut bingkai -->
            <div style="position:relative;width:200px;height:200px;">
              <div style="position:absolute;top:0;left:0;width:32px;height:32px;
                border-top:3px solid #10853F;border-left:3px solid #10853F;border-radius:4px 0 0 0;"></div>
              <div style="position:absolute;top:0;right:0;width:32px;height:32px;
                border-top:3px solid #10853F;border-right:3px solid #10853F;border-radius:0 4px 0 0;"></div>
              <div style="position:absolute;bottom:0;left:0;width:32px;height:32px;
                border-bottom:3px solid #10853F;border-left:3px solid #10853F;border-radius:0 0 0 4px;"></div>
              <div style="position:absolute;bottom:0;right:0;width:32px;height:32px;
                border-bottom:3px solid #10853F;border-right:3px solid #10853F;border-radius:0 0 4px 0;"></div>
              <!-- Garis scan animasi -->
              <div id="qr-scan-line" style="
                position:absolute;left:4px;right:4px;height:2px;
                background:linear-gradient(90deg,transparent,#10853F,transparent);
                animation:qr-scan-anim 1.8s ease-in-out infinite;top:50%;
              "></div>
            </div>
          </div>
        </div>

        <!-- Status & hint -->
        <div style="padding:16px 20px;text-align:center;">
          <p id="qr-modal-status" style="
            font-size:0.82rem;font-weight:600;
            color:var(--text-secondary,#888);margin-bottom:6px;
          ">Memulai kamera…</p>
          <p style="font-size:0.72rem;color:var(--text-tertiary,#666);">${hint}</p>
        </div>
      </div>

      <style>
        @keyframes qr-scan-anim {
          0%   { top: 10%; opacity:1; }
          50%  { top: 85%; opacity:1; }
          100% { top: 10%; opacity:1; }
        }
      </style>
    `;

    document.body.appendChild(modal);

    // Tutup modal
    const closeModal = () => {
      stopCamera();
      modal.remove();
    };
    document.getElementById('qr-modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

    // Mulai scanner
    const videoEl  = document.getElementById('qr-modal-video');
    const statusEl = document.getElementById('qr-modal-status');

    await setupScanner(videoEl, statusEl, (text) => {
      closeModal();
      onResult(text);
    });
  }

  // ─── MODE 2: Inline embed ─────────────────────────────────────
  /**
   * Embed scanner langsung di dalam containerEl.
   * @param {HTMLElement} containerEl - elemen yang akan diisi scanner
   * @param {function}    onResult
   */
  async function mountInline(containerEl, onResult) {
    containerEl.innerHTML = `
      <div style="position:relative;background:#000;border-radius:12px;overflow:hidden;aspect-ratio:1;max-width:280px;margin:0 auto;">
        <video id="qr-inline-video" autoplay playsinline muted
          style="width:100%;height:100%;object-fit:cover;display:block;"></video>

        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;">
          <div style="position:relative;width:160px;height:160px;">
            <div style="position:absolute;top:0;left:0;width:24px;height:24px;border-top:3px solid #10853F;border-left:3px solid #10853F;border-radius:3px 0 0 0;"></div>
            <div style="position:absolute;top:0;right:0;width:24px;height:24px;border-top:3px solid #10853F;border-right:3px solid #10853F;border-radius:0 3px 0 0;"></div>
            <div style="position:absolute;bottom:0;left:0;width:24px;height:24px;border-bottom:3px solid #10853F;border-left:3px solid #10853F;border-radius:0 0 0 3px;"></div>
            <div style="position:absolute;bottom:0;right:0;width:24px;height:24px;border-bottom:3px solid #10853F;border-right:3px solid #10853F;border-radius:0 0 3px 0;"></div>
            <div style="position:absolute;left:4px;right:4px;height:2px;background:linear-gradient(90deg,transparent,#10853F,transparent);animation:qr-scan-anim 1.8s ease-in-out infinite;top:50%;"></div>
          </div>
        </div>
      </div>
      <p id="qr-inline-status" style="font-size:0.78rem;font-weight:600;color:var(--text-secondary,#888);text-align:center;margin-top:8px;">Memulai kamera…</p>
      <style>
        @keyframes qr-scan-anim { 0%{top:10%}50%{top:85%}100%{top:10%} }
      </style>
    `;

    const videoEl  = document.getElementById('qr-inline-video');
    const statusEl = document.getElementById('qr-inline-status');
    await setupScanner(videoEl, statusEl, onResult);
  }

  // ─── Stop paksa ───────────────────────────────────────────────
  function stop() { stopCamera(); }

  return { openModal, mountInline, stop };
})();

window.QRScanner = QRScanner;
