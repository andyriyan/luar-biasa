/**
 * exam-token.js v2 — Kode Ruangan + Tiket Tanda Tangan
 * Self-validating offline. Pure JS HMAC (HTTP/file:///semua perangkat).
 */
const ExamToken = (function () {
  const SECRET_KEY   = 'edu_app_exam_room_secret';
  const SESSIONS_KEY = 'exam_room_sessions';
  const DEFAULT_SECRET = 'MTsMaarifJumo2026';

  const SHA256_K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ]);

  function rotr(n, x) { return (x >>> n) | (x << (32 - n)); }

  function toBytes(str) {
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(String(str));
    const s = String(str);
    const out = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i) & 0xff;
    return out;
  }

  function sha256Bytes(data) {
    const bytes = data instanceof Uint8Array ? data : toBytes(data);
    const bitLen = bytes.length * 8;
    const withOne = new Uint8Array(((bytes.length + 9 + 63) & ~63));
    withOne.set(bytes);
    withOne[bytes.length] = 0x80;
    new DataView(withOne.buffer).setUint32(withOne.length - 4, bitLen, false);

    let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
    let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
    const w = new Uint32Array(64);
    const view = new DataView(withOne.buffer);

    for (let off = 0; off < withOne.length; off += 64) {
      for (let i = 0; i < 16; i++) w[i] = view.getUint32(off + i * 4, false);
      for (let i = 16; i < 64; i++) {
        const s0 = rotr(7, w[i - 15]) ^ rotr(18, w[i - 15]) ^ (w[i - 15] >>> 3);
        const s1 = rotr(17, w[i - 2]) ^ rotr(19, w[i - 2]) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
      }
      let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, hh = h7;
      for (let i = 0; i < 64; i++) {
        const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
        const ch = (e & f) ^ (~e & g);
        const t1 = (hh + S1 + ch + SHA256_K[i] + w[i]) >>> 0;
        const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const t2 = (S0 + maj) >>> 0;
        hh = g; g = f; f = e; e = (d + t1) >>> 0;
        d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
      h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + hh) >>> 0;
    }

    const out = new Uint8Array(32);
    const dv = new DataView(out.buffer);
    dv.setUint32(0, h0, false); dv.setUint32(4, h1, false);
    dv.setUint32(8, h2, false); dv.setUint32(12, h3, false);
    dv.setUint32(16, h4, false); dv.setUint32(20, h5, false);
    dv.setUint32(24, h6, false); dv.setUint32(28, h7, false);
    return out;
  }

  function hmacSha256(secret, message) {
    const keyBytes = toBytes(secret);
    const msgBytes = toBytes(message);
    const block = 64;
    let key = keyBytes;
    if (key.length > block) key = sha256Bytes(key);
    if (key.length < block) {
      const padded = new Uint8Array(block);
      padded.set(key);
      key = padded;
    }
    const ipad = new Uint8Array(block);
    const opad = new Uint8Array(block);
    for (let i = 0; i < block; i++) {
      ipad[i] = key[i] ^ 0x36;
      opad[i] = key[i] ^ 0x5c;
    }
    const inner = new Uint8Array(block + msgBytes.length);
    inner.set(ipad); inner.set(msgBytes, block);
    const innerHash = sha256Bytes(inner);
    const outer = new Uint8Array(block + 32);
    outer.set(opad); outer.set(innerHash, block);
    return sha256Bytes(outer);
  }

  function getSecret() {
    try { return localStorage.getItem(SECRET_KEY) || DEFAULT_SECRET; }
    catch (e) { return DEFAULT_SECRET; }
  }

  function setSecret(secret) {
    localStorage.setItem(SECRET_KEY, String(secret || '').trim() || DEFAULT_SECRET);
  }

  function normalizeKelas(kelas) {
    return String(kelas || '').toUpperCase().replace(/\s/g, '').slice(0, 4);
  }

  function buildPayload(slug, kelas, validDate) {
    return `${slug}|${normalizeKelas(kelas)}|${validDate}`;
  }

  function hmacDigest(message) {
    return hmacSha256(getSecret(), message);
  }

  function bytesToDigits(bytes) {
    const n = ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0;
    return String(n % 10000).padStart(4, '0');
  }

  function bytesToHex(bytes) {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function b64urlEncode(str) {
    const b64 = btoa(unescape(encodeURIComponent(str)));
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function b64urlDecode(str) {
    const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
    return decodeURIComponent(escape(atob(b64)));
  }

  function todayISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function parseRoomCode(input) {
    const trimmed = String(input || '').trim().toUpperCase().replace(/\s/g, '');
    let m = trimmed.match(/^([789][A-F])-(\d{4})$/);
    if (m) return { kelas: m[1], digits: m[2], display: `${m[1]}-${m[2]}` };
    m = trimmed.match(/^[A-Z]{2,4}-([789][A-F])-(\d{4})$/);
    if (m) return { kelas: m[1], digits: m[2], display: `${m[1]}-${m[2]}` };
    return null;
  }

  function formatDateId(iso) {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  function checkDateWindow(validDate) {
    const today = todayISO();
    if (validDate > today) return { ok: false, reason: `Kode baru berlaku pada ${formatDateId(validDate)}.` };
    if (validDate < today) return { ok: false, reason: 'Kode sudah kadaluarsa. Minta kode baru ke guru.' };
    return { ok: true, today };
  }

  function makeTokenData(session, type) {
    return {
      display: session.display,
      slug: session.slug,
      kelas: session.kelas,
      validDate: session.validDate,
      durasi: parseInt(session.durasi, 10) || 50,
      type: type || 'room'
    };
  }

  /** Tiket tanda tangan — dibawa penuh di link WA (paling andal antar-perangkat) */
  function signTicket(data) {
    const msg = `v1|${data.s}|${data.k}|${data.t}|${data.d}|${data.c}`;
    return bytesToHex(hmacDigest(msg).slice(0, 8));
  }

  function createTicket(session) {
    const data = {
      v: 1,
      s: session.slug,
      k: normalizeKelas(session.kelas),
      t: session.validDate,
      d: parseInt(session.durasi, 10) || 50,
      c: session.display
    };
    data.g = signTicket(data);
    return b64urlEncode(JSON.stringify(data));
  }

  function validateTicket(ticket, examSlug) {
    let data;
    try { data = JSON.parse(b64urlDecode(ticket)); }
    catch (e) { return { valid: false, reason: 'Link ujian tidak sah.' }; }

    if (!data || data.v !== 1) return { valid: false, reason: 'Link ujian tidak dikenali.' };
    if (signTicket(data) !== data.g) return { valid: false, reason: 'Tiket ujian tidak sah atau sudah diubah.' };
    if (data.s !== examSlug) return { valid: false, reason: 'Tiket bukan untuk ujian ini.' };

    const dateCheck = checkDateWindow(data.t);
    if (!dateCheck.ok) return { valid: false, reason: dateCheck.reason };

    return {
      valid: true,
      tokenData: makeTokenData({
        slug: data.s,
        kelas: data.k,
        validDate: data.t,
        durasi: data.d,
        display: data.c
      }, 'ticket')
    };
  }

  async function generateRoomCode(slug, kelas, validDate, durasi) {
    const k = normalizeKelas(kelas);
    const digest = hmacDigest(buildPayload(slug, k, validDate));
    const display = `${k}-${bytesToDigits(digest)}`;
    const session = { display, slug, kelas: k, validDate, durasi: durasi != null ? parseInt(durasi, 10) : null, type: 'room' };
    session.ticket = createTicket({ ...session, durasi: session.durasi || 50 });
    return session;
  }

  async function validateRoomCode(input, examSlug, options = {}) {
    const parsed = parseRoomCode(input);
    if (!parsed) return { valid: false, reason: 'Format kode salah. Contoh: 7D-7209' };

    const validDate = options.validDate || todayISO();
    const dateCheck = checkDateWindow(validDate);
    if (!dateCheck.ok) return { valid: false, reason: dateCheck.reason };

    const expected = await generateRoomCode(examSlug, parsed.kelas, validDate);
    if (expected.display !== parsed.display) {
      return { valid: false, reason: 'Kode tidak valid. Pastikan ujian, tanggal, dan kode sudah benar.' };
    }

    return {
      valid: true,
      tokenData: makeTokenData({
        display: expected.display,
        slug: examSlug,
        kelas: parsed.kelas,
        validDate,
        durasi: parseInt(options.durasi, 10) || parseInt(options.fallbackDurasi, 10) || 50
      }, 'room')
    };
  }

  /** Satu pintu validasi: tiket link → kode URL → kode ketikan */
  async function validateAccess(examSlug, options = {}) {
    let params;
    try { params = new URLSearchParams(window.location.search); }
    catch (e) { params = new URLSearchParams(); }

    const ticket = params.get('ticket');
    if (ticket) return validateTicket(ticket, examSlug);

    const urlOpts = parseUrlOptions();
    const code = (options.input || urlOpts.code || '').trim();
    if (!code) return { valid: false, reason: 'Kode ruangan tidak boleh kosong.' };

    return validateRoomCode(code, examSlug, {
      durasi: urlOpts.durasi || options.durasi,
      validDate: urlOpts.validDate || options.validDate,
      fallbackDurasi: options.fallbackDurasi
    });
  }

  function parseUrlOptions() {
    try {
      const params = new URLSearchParams(window.location.search);
      return {
        code: (params.get('k') || '').trim(),
        ticket: params.get('ticket') || '',
        durasi: params.get('d') ? parseInt(params.get('d'), 10) : null,
        validDate: params.get('t') || null
      };
    } catch (e) {
      return { code: '', ticket: '', durasi: null, validDate: null };
    }
  }

  function buildExamLink(slug, code, durasi, validDate, baseHref) {
    const session = {
      slug,
      kelas: (parseRoomCode(code) || {}).kelas || code.split('-')[0],
      display: code,
      durasi: durasi || 50,
      validDate: validDate || todayISO()
    };
    const root = baseHref || (typeof window !== 'undefined' ? window.location.href : '');
    const url = new URL(`./materi/${slug}/`, root);
    url.searchParams.set('ticket', createTicket(session));
    url.searchParams.set('k', code);
    if (durasi) url.searchParams.set('d', durasi);
    if (validDate) url.searchParams.set('t', validDate);
    return url.href;
  }

  function buildShareText(session, examTitle) {
    const title = examTitle || session.slug;
    const link = buildExamLink(session.slug, session.display, session.durasi, session.validDate);
    return (
      `📝 *Ujian: ${title}*\n\n` +
      `Kode Ruangan: *${session.display}*\n` +
      `Durasi: ${session.durasi} menit\n` +
      `Berlaku: ${formatDateId(session.validDate)}\n\n` +
      `Cara masuk:\n` +
      `1. Tap link ini (paling mudah):\n${link}\n\n` +
      `2. Atau ketik kode *${session.display}* di halaman ujian`
    );
  }

  function shareWhatsApp(text) {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  }

  function getSessions() {
    try { return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]'); }
    catch (e) { return []; }
  }

  function saveSession(session) {
    const all = getSessions();
    all.unshift({ ...session, createdAt: new Date().toISOString() });
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(all.slice(0, 50)));
  }

  function deleteSession(index) {
    const all = getSessions();
    if (index < 0 || index >= all.length) return;
    all.splice(index, 1);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(all));
  }

  function getSessionStatus(session) {
    const today = todayISO();
    if (session.validDate < today) return 'expired';
    if (session.validDate > today) return 'future';
    return 'active';
  }

  function clearExpiredSessions() {
    const today = todayISO();
    const before = getSessions();
    const cleaned = before.filter(s => s.validDate >= today);
    const removed = before.length - cleaned.length;
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(cleaned));
    return removed;
  }

  function isReady() {
    return typeof hmacSha256 === 'function';
  }

  return {
    getSecret, setSecret,
    generateRoomCode, validateRoomCode, validateAccess, validateTicket,
    createTicket, parseRoomCode, parseUrlOptions,
    buildExamLink, buildShareText, shareWhatsApp,
    getSessions, saveSession, deleteSession,
    getSessionStatus, clearExpiredSessions,
    formatDateId, todayISO, isReady
  };
})();

window.ExamToken = ExamToken;
window.validateExamToken = (input, examSlug, options) => ExamToken.validateAccess(examSlug, { ...options, input });
window.generateRoomCode = (slug, kelas, validDate, durasi) => ExamToken.generateRoomCode(slug, kelas, validDate, durasi);

/**
 * Auto-inject tombol "Scan QR" ke layar token ujian.
 * Dipanggil otomatis saat DOM siap — berlaku di SEMUA halaman ujian
 * yang memuat exam-token.js, termasuk ujian baru yang digenerate.
 *
 * Syarat: halaman harus punya elemen #btn-validasi-token dan #token-input.
 * qr-scanner.js tidak wajib ada — jika tidak ada, tombol tidak muncul.
 */
function _injectQRScanButton() {
  // Jangan inject jika sudah ada
  if (document.getElementById('btn-scan-qr-injected')) return;

  const btnToken  = document.getElementById('btn-validasi-token');
  const tokenInput = document.getElementById('token-input');
  if (!btnToken || !tokenInput) return;

  // Buat wrapper tombol scan
  const wrap = document.createElement('div');
  wrap.style.cssText = 'margin-top:10px;';

  const btn = document.createElement('button');
  btn.id    = 'btn-scan-qr-injected';
  btn.type  = 'button';
  btn.innerHTML = '<span class="material-icons" style="font-size:18px;vertical-align:middle;margin-right:6px;">qr_code_scanner</span>Scan QR Code';
  btn.style.cssText = [
    'width:100%', 'padding:12px 16px', 'border-radius:99px',
    'background:transparent', 'border:2px solid var(--accent-primary,#10853F)',
    'color:var(--accent-primary,#10853F)', 'font-weight:700', 'font-size:0.9rem',
    'cursor:pointer', 'display:flex', 'align-items:center', 'justify-content:center',
    'transition:opacity .2s', 'box-sizing:border-box'
  ].join(';');

  const scanArea = document.createElement('div');
  scanArea.id    = 'qr-scan-area-injected';
  scanArea.style.cssText = 'display:none;margin-top:10px;';

  wrap.appendChild(btn);
  wrap.appendChild(scanArea);

  // Sisipkan tepat setelah btn-validasi-token
  btnToken.insertAdjacentElement('afterend', wrap);

  let scannerOpen = false;

  btn.addEventListener('click', async () => {
    // Butuh qr-scanner.js
    if (typeof QRScanner === 'undefined') {
      // Coba load qr-scanner.js secara dinamis
      await new Promise((resolve) => {
        // Cari path relatif ke root aplikasi
        const depth = (window.location.pathname.match(/\//g) || []).length - 1;
        const prefix = depth <= 1 ? './' : '../'.repeat(depth - 1);
        const s = document.createElement('script');
        s.src = prefix + 'assets/js/qr-scanner.js';
        s.onload  = resolve;
        s.onerror = resolve; // tetap lanjut meski gagal
        document.head.appendChild(s);
      });
    }

    if (typeof QRScanner === 'undefined') {
      alert('Scanner tidak tersedia. Coba refresh halaman.');
      return;
    }

    if (scannerOpen) {
      QRScanner.stop();
      scanArea.style.display = 'none';
      scanArea.innerHTML     = '';
      btn.innerHTML = '<span class="material-icons" style="font-size:18px;vertical-align:middle;margin-right:6px;">qr_code_scanner</span>Scan QR Code';
      scannerOpen = false;
      return;
    }

    scannerOpen = true;
    scanArea.style.display = 'block';
    btn.innerHTML = '<span class="material-icons" style="font-size:18px;vertical-align:middle;margin-right:6px;">close</span>Tutup Scanner';

    await QRScanner.mountInline(scanArea, (text) => {
      scannerOpen = false;
      scanArea.style.display = 'none';
      scanArea.innerHTML     = '';
      btn.innerHTML = '<span class="material-icons" style="font-size:18px;vertical-align:middle;margin-right:6px;">qr_code_scanner</span>Scan QR Code';

      // Ekstrak ticket/kode dari URL, atau pakai sebagai kode langsung
      try {
        const url    = new URL(text);
        const ticket = url.searchParams.get('ticket');
        const kode   = url.searchParams.get('k');
        if (ticket || kode) { window.location.href = text; return; }
      } catch (e) { /* bukan URL — kemungkinan kode pendek seperti 7A-1234 */ }

      // Kode pendek langsung — masukkan ke input dan validasi
      const cleaned = text.trim().toUpperCase().replace(/\s/g, '');
      tokenInput.value = cleaned;
      tokenInput.dispatchEvent(new Event('input'));
      if (typeof doValidateToken === 'function') {
        setTimeout(doValidateToken, 100); // sedikit delay agar animasi tutup scanner selesai
      }
    });
  });
}

// Jalankan setelah DOM siap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _injectQRScanButton);
} else {
  // DOM sudah siap (script di-load defer/async setelah DOMContentLoaded)
  _injectQRScanButton();
  // Fallback: tunggu sedikit agar elemen ujian selesai dirender
  setTimeout(_injectQRScanButton, 300);
}
