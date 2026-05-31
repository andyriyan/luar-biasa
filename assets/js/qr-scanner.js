/**
 * qr-scanner.js  v2
 * Scanner QR Code via kamera — dengan feedback status yang jelas.
 *
 * Perbaikan v2:
 *  - Tampilkan status izin kamera secara eksplisit (meminta / ditolak / aktif)
 *  - Tidak black screen — ada overlay teks saat kamera belum siap
 *  - Feedback animasi saat QR berhasil terbaca
 *  - Auto-load jsQR jika BarcodeDetector tidak tersedia
 */

const QRScanner = (function () {

  let _stream   = null;
  let _rafId    = null;
  let _video    = null;
  let _canvas   = null;
  let _ctx      = null;
  let _active   = false;
  let _onResult = null;
  let _detector = null;
  let _useJsQR  = false;

  // ─── Deteksi & init ────────────────────────────────────────────
  async function initDetector() {
    if (_detector || _useJsQR) return true;

    if ('BarcodeDetector' in window) {
      try {
        const supported = await BarcodeDetector.getSupportedFormats();
        if (supported.includes('qr_code')) {
          _detector = new BarcodeDetector({ formats: ['qr_code'] });
          return true;
        }
      } catch (e) {}
    }

    if (window.jsQR) { _useJsQR = true; return true; }

    return new Promise(resolve => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jsQR/1.4.0/jsQR.min.js';
      s.onload  = () => { _useJsQR = true; resolve(true); };
      s.onerror = () => resolve(false);
      document.head.appendChild(s);
    });
  }

  // ─── Kamera ────────────────────────────────────────────────────
  async function startCamera(videoEl, onStatusChange) {
    if (_stream) stopCamera();

    onStatusChange('requesting'); // << status: sedang meminta izin

    try {
      _stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      videoEl.srcObject = _stream;
      await videoEl.play();
      onStatusChange('active'); // << status: kamera aktif
      return true;
    } catch (e) {
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        onStatusChange('denied'); // << status: izin ditolak
      } else if (e.name === 'NotFoundError') {
        onStatusChange('no-camera'); // << status: tidak ada kamera
      } else {
        onStatusChange('error');
      }
      return false;
    }
  }

  function stopCamera() {
    if (_stream) { _stream.getTracks().forEach(t => t.stop()); _stream = null; }
    if (_rafId)  { cancelAnimationFrame(_rafId); _rafId = null; }
    _active = false;
  }

  // ─── Loop deteksi ──────────────────────────────────────────────
  function scanLoop() {
    if (!_active) return;
    if (!_video || _video.readyState < 2) { _rafId = requestAnimationFrame(scanLoop); return; }

    const w = _video.videoWidth, h = _video.videoHeight;
    if (!w || !h) { _rafId = requestAnimationFrame(scanLoop); return; }

    if (_canvas.width !== w || _canvas.height !== h) { _canvas.width = w; _canvas.height = h; }
    _ctx.drawImage(_video, 0, 0, w, h);

    if (_detector) {
      _detector.detect(_canvas).then(codes => {
        if (!_active) return;
        codes.length > 0 ? handleResult(codes[0].rawValue) : (_rafId = requestAnimationFrame(scanLoop));
      }).catch(() => { _rafId = requestAnimationFrame(scanLoop); });
    } else if (_useJsQR && window.jsQR) {
      const img  = _ctx.getImageData(0, 0, w, h);
      const code = jsQR(img.data, w, h, { inversionAttempts: 'dontInvert' });
      code?.data ? handleResult(code.data) : (_rafId = requestAnimationFrame(scanLoop));
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

  // ─── Status overlay text ───────────────────────────────────────
  function getStatusHTML(status) {
    const map = {
      'init':        { icon: 'hourglass_empty', text: 'Mempersiapkan scanner…',          color: '#888' },
      'requesting':  { icon: 'camera_alt',      text: 'Menunggu izin kamera…<br><small>Tap "Izinkan" saat browser meminta</small>', color: '#f59e0b' },
      'active':      { icon: '',                text: '',                                 color: '' },
      'denied':      { icon: 'no_photography',  text: 'Izin kamera ditolak.<br><small>Buka Pengaturan browser → izinkan kamera untuk situs ini, lalu refresh.</small>', color: '#ef4444' },
      'no-camera':   { icon: 'videocam_off',    text: 'Kamera tidak ditemukan.<br><small>Perangkat ini tidak punya kamera yang bisa diakses.</small>', color: '#ef4444' },
      'no-api':      { icon: 'error_outline',   text: 'Browser tidak mendukung scanner.<br><small>Coba Chrome atau browser terbaru.</small>', color: '#ef4444' },
      'error':       { icon: 'error_outline',   text: 'Terjadi kesalahan kamera.<br><small>Refresh dan coba lagi.</small>', color: '#ef4444' },
    };
    return map[status] || map['init'];
  }

  // ─── Shared setup ──────────────────────────────────────────────
  async function setupScanner(videoEl, overlayEl, onResult) {
    _onResult = onResult;
    _video    = videoEl;
    _canvas   = document.createElement('canvas');
    _ctx      = _canvas.getContext('2d');

    function setStatus(status) {
      if (!overlayEl) return;
      const s = getStatusHTML(status);
      if (status === 'active') {
        overlayEl.style.display = 'none';
        return;
      }
      overlayEl.style.display = 'flex';
      overlayEl.innerHTML = `
        <span class="material-icons" style="font-size:2.5rem;color:${s.color};margin-bottom:8px;">${s.icon}</span>
        <p style="color:${s.color};font-size:0.82rem;font-weight:600;text-align:center;line-height:1.5;">${s.text}</p>
      `;
    }

    setStatus('init');

    const detectorReady = await initDetector();
    if (!detectorReady) { setStatus('no-api'); return false; }

    const cameraOk = await startCamera(videoEl, setStatus);
    if (!cameraOk) return false;

    _active = true;
    _rafId  = requestAnimationFrame(scanLoop);
    return true;
  }

  // ─── MODE 1: Modal overlay ─────────────────────────────────────
  async function openModal(onResult, opts = {}) {
    const existing = document.getElementById('qr-scanner-modal');
    if (existing) existing.remove();

    const title = opts.title || 'Scan QR Code Ujian';
    const hint  = opts.hint  || 'Arahkan ke QR Code dari guru';

    const modal = document.createElement('div');
    modal.id = 'qr-scanner-modal';
    modal.style.cssText = `
      position:fixed;inset:0;z-index:99999;
      background:rgba(0,0,0,0.92);
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      padding:16px;
    `;

    modal.innerHTML = `
      <div style="width:100%;max-width:400px;background:var(--bg-card,#1e1e1e);border-radius:16px;overflow:hidden;box-shadow:0 24px 48px rgba(0,0,0,0.5);">

        <!-- Header -->
        <div style="padding:14px 18px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.08);">
          <div style="display:flex;align-items:center;gap:10px;">
            <span class="material-icons" style="color:#10853F;font-size:22px;">qr_code_scanner</span>
            <span style="font-weight:800;font-size:0.95rem;color:var(--text-primary,#fff)">${title}</span>
          </div>
          <button id="qr-modal-close" style="background:rgba(255,255,255,0.1);border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;color:#aaa;display:flex;align-items:center;justify-content:center;">
            <span class="material-icons" style="font-size:18px;">close</span>
          </button>
        </div>

        <!-- Viewfinder -->
        <div style="position:relative;background:#000;aspect-ratio:1;overflow:hidden;">
          <video id="qr-modal-video" autoplay playsinline muted
            style="width:100%;height:100%;object-fit:cover;display:block;"></video>

          <!-- Status overlay (tampil saat kamera belum aktif) -->
          <div id="qr-modal-overlay" style="
            position:absolute;inset:0;background:rgba(0,0,0,0.82);
            display:flex;flex-direction:column;align-items:center;justify-content:center;
            padding:24px;
          "></div>

          <!-- Bingkai scan (tampil saat kamera aktif) -->
          <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;">
            <div style="position:relative;width:200px;height:200px;">
              <div style="position:absolute;top:0;left:0;width:32px;height:32px;border-top:3px solid #10853F;border-left:3px solid #10853F;border-radius:4px 0 0 0;"></div>
              <div style="position:absolute;top:0;right:0;width:32px;height:32px;border-top:3px solid #10853F;border-right:3px solid #10853F;border-radius:0 4px 0 0;"></div>
              <div style="position:absolute;bottom:0;left:0;width:32px;height:32px;border-bottom:3px solid #10853F;border-left:3px solid #10853F;border-radius:0 0 0 4px;"></div>
              <div style="position:absolute;bottom:0;right:0;width:32px;height:32px;border-bottom:3px solid #10853F;border-right:3px solid #10853F;border-radius:0 0 4px 0;"></div>
              <div style="position:absolute;left:4px;right:4px;height:2px;background:linear-gradient(90deg,transparent,#10853F,transparent);animation:qr-scan-anim 1.8s ease-in-out infinite;top:50%;"></div>
            </div>
          </div>
        </div>

        <!-- Hint -->
        <div style="padding:14px 18px;text-align:center;">
          <p style="font-size:0.75rem;color:var(--text-tertiary,#666);">${hint}</p>
        </div>
      </div>

      <style>
        @keyframes qr-scan-anim { 0%{top:10%;opacity:1} 50%{top:85%;opacity:1} 100%{top:10%;opacity:1} }
      </style>
    `;

    document.body.appendChild(modal);

    const closeModal = () => { stopCamera(); modal.remove(); };
    document.getElementById('qr-modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

    const videoEl   = document.getElementById('qr-modal-video');
    const overlayEl = document.getElementById('qr-modal-overlay');

    await setupScanner(videoEl, overlayEl, (text) => {
      closeModal();
      onResult(text);
    });
  }

  // ─── MODE 2: Inline embed ──────────────────────────────────────
  async function mountInline(containerEl, onResult) {
    containerEl.innerHTML = `
      <div style="position:relative;background:#000;border-radius:12px;overflow:hidden;aspect-ratio:1;max-width:260px;margin:0 auto;">
        <video id="qr-inline-video" autoplay playsinline muted
          style="width:100%;height:100%;object-fit:cover;display:block;"></video>

        <!-- Status overlay -->
        <div id="qr-inline-overlay" style="
          position:absolute;inset:0;background:rgba(0,0,0,0.82);
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          padding:16px;
        "></div>

        <!-- Bingkai -->
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;">
          <div style="position:relative;width:150px;height:150px;">
            <div style="position:absolute;top:0;left:0;width:24px;height:24px;border-top:3px solid #10853F;border-left:3px solid #10853F;border-radius:3px 0 0 0;"></div>
            <div style="position:absolute;top:0;right:0;width:24px;height:24px;border-top:3px solid #10853F;border-right:3px solid #10853F;border-radius:0 3px 0 0;"></div>
            <div style="position:absolute;bottom:0;left:0;width:24px;height:24px;border-bottom:3px solid #10853F;border-left:3px solid #10853F;border-radius:0 0 0 3px;"></div>
            <div style="position:absolute;bottom:0;right:0;width:24px;height:24px;border-bottom:3px solid #10853F;border-right:3px solid #10853F;border-radius:0 0 3px 0;"></div>
            <div style="position:absolute;left:4px;right:4px;height:2px;background:linear-gradient(90deg,transparent,#10853F,transparent);animation:qr-scan-anim 1.8s ease-in-out infinite;top:50%;"></div>
          </div>
        </div>
      </div>
      <style>@keyframes qr-scan-anim{0%{top:10%}50%{top:85%}100%{top:10%}}</style>
    `;

    const videoEl   = document.getElementById('qr-inline-video');
    const overlayEl = document.getElementById('qr-inline-overlay');
    await setupScanner(videoEl, overlayEl, onResult);
  }

  function stop() { stopCamera(); }

  return { openModal, mountInline, stop };
})();

window.QRScanner = QRScanner;
