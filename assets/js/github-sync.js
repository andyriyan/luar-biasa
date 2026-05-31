/**
 * github-sync.js  v2
 * Sinkronisasi password & identitas madrasah — dual mode:
 *
 *   MODE A — GitHub Pages  (hostname = *.github.io atau domain publik)
 *     • Baca  : raw.githubusercontent.com/[repo]/[branch]/data/cloud-config.json
 *     • Tulis : GitHub Contents API (butuh PAT)
 *
 *   MODE B — Local Server  (hostname = localhost / 127.x / 192.168.x / 10.x / 172.x)
 *     • Baca  : GET  [origin]/api/config   (sync-server.py)
 *     • Tulis : POST [origin]/api/config   (sync-server.py)
 *     • Tidak butuh PAT, tidak butuh internet
 *
 *   FALLBACK
 *     • localStorage hash  →  default password '123456'
 */

const GitHubSync = (function () {

  // ─── Storage Keys ─────────────────────────────────────────────────
  const KEY_PAT    = 'edu_github_pat';
  const KEY_REPO   = 'edu_github_repo';
  const KEY_BRANCH = 'edu_github_branch';
  const KEY_SYNCED = 'edu_cloud_synced';
  const KEY_MODE   = 'edu_sync_mode';     // 'github' | 'local' | ''
  const CONFIG_PATH = 'data/cloud-config.json';
  const LOCAL_API   = '/api/config';

  // ─── Mode Detection ───────────────────────────────────────────────

  /**
   * Deteksi apakah halaman ini diakses via jaringan lokal.
   * localhost, 127.x.x.x, 192.168.x.x, 10.x.x.x, 172.16-31.x.x
   */
  function isLocalHost() {
    const h = window.location.hostname;
    return (
      h === 'localhost' ||
      h === '127.0.0.1' ||
      /^192\.168\./.test(h) ||
      /^10\./.test(h) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(h) ||
      h === ''
    );
  }

  /**
   * Mode aktif saat ini.
   * 'local'  — sync-server.py di LAN
   * 'github' — GitHub API
   * ''       — tidak dikonfigurasi (fallback ke localStorage)
   */
  function getMode() {
    if (isLocalHost()) return 'local';
    if (getPAT() && getRepo()) return 'github';
    return '';
  }

  // ─── Config Accessors ─────────────────────────────────────────────
  function getPAT()    { return localStorage.getItem(KEY_PAT)    || ''; }
  function getRepo()   { return localStorage.getItem(KEY_REPO)   || ''; }
  function getBranch() { return localStorage.getItem(KEY_BRANCH) || 'main'; }

  function setPAT(v)    { if (v) localStorage.setItem(KEY_PAT, v.trim());    else localStorage.removeItem(KEY_PAT); }
  function setRepo(v)   { if (v) localStorage.setItem(KEY_REPO, v.trim());   else localStorage.removeItem(KEY_REPO); }
  function setBranch(v) { localStorage.setItem(KEY_BRANCH, v.trim() || 'main'); }

  function isConfigured() {
    return isLocalHost() || !!(getPAT() && getRepo());
  }

  // ─── Crypto ───────────────────────────────────────────────────────

  async function hashPassword(password) {
    if (!password) return '';
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(password)));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // ─── MODE B: Local Server (sync-server.py) ────────────────────────

  async function localFetchConfig() {
    const res = await fetch(LOCAL_API, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Local server error ${res.status}`);
    return res.json();
  }

  async function localWriteConfig(payload) {
    const res = await fetch(LOCAL_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.msg || `Local server write error ${res.status}`);
    }
    return res.json();
  }

  // ─── MODE A: GitHub API ───────────────────────────────────────────

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

  /** Baca config via raw URL — cepat, tanpa auth, untuk validasi login */
  async function githubFetchPublic() {
    if (!getRepo()) return null;
    const url = `https://raw.githubusercontent.com/${getRepo()}/${getBranch()}/${CONFIG_PATH}?t=${Date.now()}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    return res.json().catch(() => null);
  }

  // ─── Unified Read / Write ─────────────────────────────────────────

  /**
   * Baca config dari sumber yang sesuai mode.
   * Tidak throws — return null jika gagal.
   */
  async function fetchConfig() {
    try {
      if (isLocalHost()) return await localFetchConfig();
      return await githubFetchPublic();
    } catch (e) {
      console.warn('[GitHubSync] fetchConfig gagal:', e.message);
      return null;
    }
  }

  /**
   * Tulis sebagian field ke config (merge, bukan overwrite).
   */
  async function pushConfig(fields) {
    const mode = getMode();

    if (mode === 'local') {
      const result = await localWriteConfig(fields);
      return { ok: result.ok, msg: result.msg };
    }

    if (mode === 'github') {
      const { fileSha, content } = await githubFetchMeta();
      const newContent = { ...content, ...fields, updatedBy: 'teacher-panel' };
      await githubWriteConfig(newContent, fileSha);
      return { ok: true, msg: 'Disinkronkan ke GitHub.' };
    }

    return { ok: false, msg: 'Sync belum dikonfigurasi.' };
  }

  // ─── Public API ───────────────────────────────────────────────────

  /**
   * Validasi password saat login.
   * Urutan: config (local/github) → localStorage hash → default '123456'
   */
  async function validatePassword(plainPassword) {
    const hash = await hashPassword(plainPassword);

    // 1. Coba dari sumber sync (lokal atau GitHub)
    const config = await fetchConfig();
    if (config && config.passwordHash) {
      // Sync identitas madrasah sekalian jika ada
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

    // 2. Fallback: hash tersimpan di localStorage
    const localHash = localStorage.getItem('edu_pw_hash');
    if (localHash) {
      return { valid: localHash === hash, source: 'local' };
    }

    // 3. Fallback terakhir: default password
    const defaultHash = await hashPassword('123456');
    return { valid: hash === defaultHash, source: 'default' };
  }

  /**
   * Simpan password baru — push ke config + simpan lokal sebagai backup.
   */
  async function pushPassword(plainPassword) {
    const hash = await hashPassword(plainPassword);
    // Selalu simpan lokal sebagai backup offline
    localStorage.setItem('edu_pw_hash', hash);

    try {
      const result = await pushConfig({ passwordHash: hash });
      return result;
    } catch (e) {
      return { ok: false, msg: e.message };
    }
  }

  /**
   * Simpan identitas madrasah.
   */
  async function pushIdentity(appName, tagline) {
    try {
      const result = await pushConfig({ appName, tagline });
      return result;
    } catch (e) {
      return { ok: false, msg: e.message };
    }
  }

  /** Simpan password hanya ke localStorage (offline). */
  async function savePasswordLocal(plainPassword) {
    const hash = await hashPassword(plainPassword);
    localStorage.setItem('edu_pw_hash', hash);
  }

  /**
   * Test koneksi ke sumber sync yang aktif.
   */
  async function testConnection() {
    try {
      const config = await fetchConfig();
      if (config !== null) {
        const mode = isLocalHost() ? 'Local Server' : 'GitHub';
        return { ok: true, msg: `Koneksi ke ${mode} berhasil.`, config };
      }
      return { ok: false, msg: 'Tidak dapat membaca config. Periksa pengaturan.' };
    } catch (e) {
      return { ok: false, msg: e.message };
    }
  }

  /**
   * Simpan konfigurasi GitHub (PAT, repo, branch) dan test.
   * Hanya relevan untuk mode GitHub (bukan localhost).
   */
  async function saveGitHubConfig(pat, repo, branch) {
    setPAT(pat);
    setRepo(repo);
    setBranch(branch);
    return testConnection();
  }

  /** Ambil konfigurasi tersimpan untuk ditampilkan di form. */
  function getConfig() {
    return {
      pat:       getPAT(),
      repo:      getRepo(),
      branch:    getBranch(),
      synced:    !!localStorage.getItem(KEY_SYNCED),
      mode:      getMode(),
      isLocal:   isLocalHost()
    };
  }

  /** Hapus konfigurasi GitHub dari perangkat ini. */
  function clearConfig() {
    localStorage.removeItem(KEY_PAT);
    localStorage.removeItem(KEY_REPO);
    localStorage.removeItem(KEY_BRANCH);
    localStorage.removeItem(KEY_SYNCED);
  }

  /** Kembalikan deskripsi mode aktif untuk ditampilkan di UI. */
  function getModeLabel() {
    const mode = getMode();
    if (mode === 'local')  return { icon: 'router',     text: 'Local Server aktif — sinkron via jaringan lokal',        cls: 'active' };
    if (mode === 'github') return { icon: 'cloud_done', text: 'GitHub terhubung — sinkron ke semua perangkat via internet', cls: 'active' };
    return { icon: 'cloud_off', text: 'Belum dikonfigurasi — password hanya berlaku di perangkat ini', cls: 'warning' };
  }

  return {
    isConfigured,
    isLocalHost,
    getMode,
    getModeLabel,
    hashPassword,
    saveGitHubConfig,
    testConnection,
    pushPassword,
    pushIdentity,
    validatePassword,
    savePasswordLocal,
    fetchConfig,
    getConfig,
    clearConfig
  };
})();

window.GitHubSync = GitHubSync;
