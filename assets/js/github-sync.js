/**
 * github-sync.js  v3
 *
 * Perbaikan bug v2: perangkat lain (HP siswa/guru) tidak bisa baca
 * password dari GitHub karena PAT & repo hanya tersimpan di localStorage
 * perangkat yang melakukan setup.
 *
 * Solusi: pisahkan dua kebutuhan yang berbeda:
 *
 *   BACA (login/validasi) — tidak butuh PAT, tidak butuh konfigurasi apapun.
 *     Setiap perangkat selalu coba fetch data/cloud-config.json dari URL
 *     relatif aplikasi ini sendiri. File itu ada di repo dan ikut ter-deploy
 *     ke GitHub Pages, jadi bisa diakses siapa saja.
 *
 *   TULIS (ganti password/identitas) — butuh PAT, hanya dari Panel Guru.
 *     Guru simpan PAT di localStorage-nya sendiri, tidak perlu disebarkan.
 *
 * Alur fetch untuk login:
 *   1. Fetch /data/cloud-config.json via URL relatif (sama di semua perangkat)
 *   2. Jika ada passwordHash → bandingkan → selesai
 *   3. Fallback: localStorage hash → default '123456'
 *
 * MODE LOCAL SERVER (localhost / IP LAN):
 *   Fetch ke /api/config di sync-server.py yang serve file yang sama.
 *   Tulis via POST /api/config — tidak butuh PAT.
 */

const GitHubSync = (function () {

  // ─── Storage Keys ─────────────────────────────────────────────────
  const KEY_PAT    = 'edu_github_pat';
  const KEY_REPO   = 'edu_github_repo';
  const KEY_BRANCH = 'edu_github_branch';
  const KEY_SYNCED = 'edu_cloud_synced';
  const CONFIG_PATH = 'data/cloud-config.json';
  const LOCAL_API   = '/api/config';

  // ─── Helpers ──────────────────────────────────────────────────────
  function getPAT()    { return localStorage.getItem(KEY_PAT)    || ''; }
  function getRepo()   { return localStorage.getItem(KEY_REPO)   || ''; }
  function getBranch() { return localStorage.getItem(KEY_BRANCH) || 'main'; }

  function setPAT(v)    { if (v) localStorage.setItem(KEY_PAT, v.trim());  else localStorage.removeItem(KEY_PAT); }
  function setRepo(v)   { if (v) localStorage.setItem(KEY_REPO, v.trim()); else localStorage.removeItem(KEY_REPO); }
  function setBranch(v) { localStorage.setItem(KEY_BRANCH, (v || 'main').trim()); }

  function isLocalHost() {
    const h = window.location.hostname;
    return (
      h === 'localhost' || h === '127.0.0.1' || h === '' ||
      /^192\.168\./.test(h) ||
      /^10\./.test(h) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(h)
    );
  }

  // Mode hanya dipakai untuk MENULIS — bukan untuk membaca.
  function getWriteMode() {
    if (isLocalHost()) return 'local';
    if (getPAT() && getRepo()) return 'github';
    return '';
  }

  function isConfigured() {
    // Untuk keperluan UI: apakah fitur tulis sudah siap?
    return isLocalHost() || !!(getPAT() && getRepo());
  }

  // ─── Crypto ───────────────────────────────────────────────────────
  async function hashPassword(password) {
    if (!password) return '';
    const buf = await crypto.subtle.digest(
      'SHA-256', new TextEncoder().encode(String(password))
    );
    return Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // ─── BACA: fetch cloud-config.json ────────────────────────────────
  /**
   * Ambil cloud-config.json.
   * Strategi:
   *   - Local server → GET /api/config
   *   - GitHub Pages → fetch /data/cloud-config.json relatif ke origin
   *   - Fallback     → fetch raw.githubusercontent.com jika repo diketahui
   *
   * Fungsi ini TIDAK butuh PAT. Bisa dipanggil dari perangkat manapun.
   */
  async function fetchConfig() {
    // MODE LOCAL: sync-server.py
    if (isLocalHost()) {
      try {
        const res = await fetch(LOCAL_API, { cache: 'no-store' });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('[GitHubSync] Local API gagal:', e.message);
      }
      return null;
    }

    // MODE GITHUB PAGES: fetch file dari path relatif aplikasi ini.
    // Menggunakan URL relatif agar otomatis benar di subdirektori apapun
    // (GitHub Pages: /luar-biasa/, root domain, custom domain, dll.)
    try {
      // Ambil base path dari lokasi halaman saat ini, lalu navigasi ke root app
      // Contoh: https://andyriyan.github.io/luar-biasa/settings-identitas.html
      //   → base = https://andyriyan.github.io/luar-biasa/
      //   → url  = https://andyriyan.github.io/luar-biasa/data/cloud-config.json
      const href = window.location.href.split('?')[0];
      const base = href.substring(0, href.lastIndexOf('/') + 1);
      const url  = base + CONFIG_PATH + '?t=' + Date.now();
      console.log('[GitHubSync] Fetching config:', url);
      const res  = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.passwordHash !== undefined) return data;
      }
    } catch (e) {
      console.warn('[GitHubSync] Fetch relatif gagal:', e.message);
    }

    // FALLBACK: coba raw.githubusercontent.com jika repo tersimpan
    const repo   = getRepo();
    const branch = getBranch();
    if (repo) {
      try {
        const url = `https://raw.githubusercontent.com/${repo}/${branch}/${CONFIG_PATH}?t=${Date.now()}`;
        const res = await fetch(url);
        if (res.ok) return await res.json().catch(() => null);
      } catch (e) {
        console.warn('[GitHubSync] Raw GitHub gagal:', e.message);
      }
    }

    return null;
  }

  // ─── TULIS: update cloud-config.json ──────────────────────────────
  async function localWriteConfig(payload) {
    const res = await fetch(LOCAL_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.msg || `Local server error ${res.status}`);
    }
    return res.json();
  }

  async function githubFetchMeta() {
    const url = `https://api.github.com/repos/${getRepo()}/contents/${CONFIG_PATH}?ref=${getBranch()}`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `token ${getPAT()}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `GitHub API error ${res.status}`);
    }
    const data = await res.json();
    const content = JSON.parse(atob(data.content.replace(/\n/g, '')));
    return { fileSha: data.sha, content };
  }

  async function githubWriteConfig(newContent, fileSha) {
    const body = {
      message: `chore: update cloud config [${new Date().toISOString()}]`,
      content: btoa(unescape(encodeURIComponent(JSON.stringify(newContent, null, 2)))),
      branch: getBranch()
    };
    if (fileSha) body.sha = fileSha;

    const url = `https://api.github.com/repos/${getRepo()}/contents/${CONFIG_PATH}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${getPAT()}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `GitHub write error ${res.status}`);
    }
    localStorage.setItem(KEY_SYNCED, '1');
    return res.json();
  }

  async function pushConfig(fields) {
    const mode = getWriteMode();

    if (mode === 'local') {
      const result = await localWriteConfig(fields);
      return { ok: result.ok, msg: result.msg };
    }

    if (mode === 'github') {
      const { fileSha, content } = await githubFetchMeta();
      // Simpan repoId di file agar perangkat lain bisa resolve jika butuh fallback
      const newContent = {
        ...content,
        ...fields,
        repoId: getRepo(),
        branch: getBranch(),
        updatedBy: 'teacher-panel'
      };
      await githubWriteConfig(newContent, fileSha);
      return { ok: true, msg: 'Disinkronkan ke GitHub.' };
    }

    return { ok: false, msg: 'Fitur tulis belum dikonfigurasi (butuh PAT).' };
  }

  // ─── PUBLIC API ───────────────────────────────────────────────────

  /**
   * Validasi password saat login.
   * Tidak butuh konfigurasi apapun di perangkat — fetch otomatis.
   */
  async function validatePassword(plainPassword) {
    const hash = await hashPassword(plainPassword);

    // 1. Coba ambil dari cloud-config.json (siapapun bisa akses)
    const config = await fetchConfig();
    if (config && config.passwordHash) {
      // Bonus: sync identitas madrasah ke localStorage perangkat ini
      if (config.appName && window.Storage) {
        Storage.saveSettings({
          appName: config.appName,
          tagline: config.tagline || ''
        });
      }
      return {
        valid: config.passwordHash === hash,
        source: isLocalHost() ? 'local-server' : 'github'
      };
    }

    // 2. Fallback: hash di localStorage (perangkat guru sendiri)
    const localHash = localStorage.getItem('edu_pw_hash');
    if (localHash) {
      return { valid: localHash === hash, source: 'local' };
    }

    // 3. Fallback terakhir: default
    const defaultHash = await hashPassword('123456');
    return { valid: hash === defaultHash, source: 'default' };
  }

  async function pushPassword(plainPassword) {
    const hash = await hashPassword(plainPassword);
    localStorage.setItem('edu_pw_hash', hash); // backup lokal selalu
    try {
      return await pushConfig({ passwordHash: hash });
    } catch (e) {
      return { ok: false, msg: e.message };
    }
  }

  async function pushIdentity(appName, tagline) {
    try {
      return await pushConfig({ appName, tagline });
    } catch (e) {
      return { ok: false, msg: e.message };
    }
  }

  async function savePasswordLocal(plainPassword) {
    localStorage.setItem('edu_pw_hash', await hashPassword(plainPassword));
  }

  async function saveGitHubConfig(pat, repo, branch) {
    setPAT(pat);
    setRepo(repo);
    setBranch(branch);
    return testConnection();
  }

  async function testConnection() {
    try {
      const config = await fetchConfig();
      if (config !== null) {
        const label = isLocalHost() ? 'Local Server' : 'GitHub Pages';
        return { ok: true, msg: `Koneksi ke ${label} berhasil.`, config };
      }
      return { ok: false, msg: 'Config tidak ditemukan. Periksa pengaturan.' };
    } catch (e) {
      return { ok: false, msg: e.message };
    }
  }

  function getConfig() {
    return {
      pat:     getPAT(),
      repo:    getRepo(),
      branch:  getBranch(),
      synced:  !!localStorage.getItem(KEY_SYNCED),
      mode:    getWriteMode(),
      isLocal: isLocalHost()
    };
  }

  function clearConfig() {
    [KEY_PAT, KEY_REPO, KEY_BRANCH, KEY_SYNCED].forEach(k => localStorage.removeItem(k));
  }

  function getModeLabel() {
    const mode = getWriteMode();
    if (mode === 'local')  return { icon: 'router',     text: 'Local Server aktif — sinkron via jaringan lokal', cls: 'active' };
    if (mode === 'github') return { icon: 'cloud_done', text: 'GitHub terhubung — password berlaku di semua perangkat', cls: 'active' };
    return {
      icon: 'cloud_upload',
      text: 'Baca otomatis dari GitHub — hubungkan PAT untuk bisa mengubah password',
      cls: 'warning'
    };
  }

  return {
    isConfigured, isLocalHost, getWriteMode,
    getModeLabel, hashPassword,
    saveGitHubConfig, testConnection,
    pushPassword, pushIdentity,
    validatePassword, savePasswordLocal,
    fetchConfig, getConfig, clearConfig
  };
})();

window.GitHubSync = GitHubSync;
