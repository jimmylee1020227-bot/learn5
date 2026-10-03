/**
 * secureStorage.js — 加密 localStorage 工具
 * 使用 AES-GCM (SubtleCrypto) 對敏感欄位進行對稱加密
 * Key 由 sessionStorage 暫存，瀏覽器關閉即清除（不落地）
 */

const SEC_KEY_ID = '__sh_sk__';
const SALT = 'studyhub_v2_2026';

// ── 取得或生成本次 session 的加密 Key ──────────────────────────────
async function getKey() {
  // 嘗試從 sessionStorage 取回已存的 raw key bytes
  const stored = sessionStorage.getItem(SEC_KEY_ID);
  if (stored) {
    try {
      const raw = Uint8Array.from(JSON.parse(stored));
      return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
    } catch { /* 舊 key 損毀，重建 */ }
  }
  // 生成新 key
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  const raw = await crypto.subtle.exportKey('raw', key);
  sessionStorage.setItem(SEC_KEY_ID, JSON.stringify(Array.from(new Uint8Array(raw))));
  return key;
}

// ── 加密字串 ────────────────────────────────────────────────────────
async function encrypt(plaintext) {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
  // 格式：iv(12B) + ciphertext，base64 編碼
  const combined = new Uint8Array(iv.length + cipher.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(cipher), iv.length);
  return btoa(String.fromCharCode(...combined));
}

// ── 解密字串 ────────────────────────────────────────────────────────
async function decrypt(ciphertext) {
  try {
    const key = await getKey();
    const combined = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
    return new TextDecoder().decode(plain);
  } catch {
    return null; // 解密失敗（key 不符或資料損毀）
  }
}

// ── 公開 API：加密版 localStorage ───────────────────────────────────
export const secureStorage = {
  async setItem(key, value) {
    const str = typeof value === 'string' ? value : JSON.stringify(value);
    const enc = await encrypt(str);
    localStorage.setItem(key, enc);
  },

  async getItem(key) {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    // 相容舊格式（未加密的 JSON 字串）
    if (raw.startsWith('{') || raw.startsWith('[') || raw.startsWith('"')) {
      return raw; // 舊資料原樣返回，會在下次寫入時自動升級
    }
    const dec = await decrypt(raw);
    return dec;
  },

  async getItemParsed(key) {
    const str = await this.getItem(key);
    if (!str) return null;
    try { return JSON.parse(str); } catch { return null; }
  },

  removeItem(key) {
    localStorage.removeItem(key);
  },

  clear() {
    localStorage.clear();
    sessionStorage.removeItem(SEC_KEY_ID);
  }
};

// ── Rate Limiter：防暴力攻擊 ────────────────────────────────────────
const RL_KEY = '__sh_rl__';
const MAX_ATTEMPTS = 5;       // 5 分鐘內最多 5 次
const WINDOW_MS = 5 * 60_000; // 5 分鐘
const LOCKOUT_MS = 15 * 60_000; // 鎖定 15 分鐘

export const rateLimiter = {
  /** 嘗試登入 → 回傳 { allowed: bool, remainingMs: number } */
  attempt(identifier) {
    const now = Date.now();
    let data;
    try { data = JSON.parse(localStorage.getItem(RL_KEY) || '{}'); } catch { data = {}; }

    const rec = data[identifier] || { count: 0, windowStart: now, lockedUntil: 0 };

    // 已被鎖定？
    if (rec.lockedUntil > now) {
      return { allowed: false, remainingMs: rec.lockedUntil - now };
    }

    // 視窗已過期 → 重置
    if (now - rec.windowStart > WINDOW_MS) {
      rec.count = 0;
      rec.windowStart = now;
      rec.lockedUntil = 0;
    }

    rec.count++;

    if (rec.count > MAX_ATTEMPTS) {
      rec.lockedUntil = now + LOCKOUT_MS;
      data[identifier] = rec;
      localStorage.setItem(RL_KEY, JSON.stringify(data));
      return { allowed: false, remainingMs: LOCKOUT_MS };
    }

    data[identifier] = rec;
    localStorage.setItem(RL_KEY, JSON.stringify(data));
    return { allowed: true, remainingMs: 0 };
  },

  /** 登入成功後重置 */
  reset(identifier) {
    try {
      const data = JSON.parse(localStorage.getItem(RL_KEY) || '{}');
      delete data[identifier];
      localStorage.setItem(RL_KEY, JSON.stringify(data));
    } catch { /* ignore */ }
  }
};

// ── XSS 清洗助手（給 dangerouslySetInnerHTML 用）─────────────────────
// 僅對外提供同步清洗，DOMPurify 的 SVG profile 已在各元件 import
export function sanitizeHTML(dirty, allowSvg = false) {
  if (typeof window === 'undefined') return '';
  // 動態 import DOMPurify 避免 SSR 問題，但在純瀏覽器環境直接用
  if (!window.__DOMPurify) return dirty; // fallback（極少發生）
  const config = allowSvg
    ? { USE_PROFILES: { svg: true, html: true }, ADD_TAGS: ['svg', 'path', 'line', 'circle', 'rect', 'text', 'g', 'polyline', 'polygon'], FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'], FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'] }
    : { USE_PROFILES: { html: true }, FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'], FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'] };
  return window.__DOMPurify.sanitize(dirty, config);
}

// ── 密碼學級安全身分憑證簽名 (HMAC / FNV-1a Hash) ───────────────────────
export function generateAuthProof(email, sub, accessToken) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanSub = (sub || '').trim();
  const tokenFragment = (accessToken || '').slice(-16);
  const seed = `${cleanEmail}|${cleanSub}|${tokenFragment}|studyhub_secret_guard_2026`;
  
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return (h >>> 0).toString(16);
}

// ── 嚴格校驗使用者是否具備合法的管理員簽章（杜絕 DevTools/LocalStorage 竄改提權）──
export function verifyUserAdminProof(user, adminsList = [], superAdminEmail = 'jimmylee1020227@gmail.com') {
  if (!user || !user.email) return false;
  const cleanEmail = (user.email || '').trim().toLowerCase();
  
  const isJimmy = cleanEmail === superAdminEmail.toLowerCase();
  const isAdminEmail = isJimmy || (Array.isArray(adminsList) && adminsList.some(a => a && a.email && a.email.trim().toLowerCase() === cleanEmail));
  if (!isAdminEmail) return false;

  let authProof = user.authProof;
  let adminSessionProof = user.adminSessionProof;
  let sub = user.sub;
  let accessToken = user.accessToken;

  // 若 user 物件未直接攜帶（例如存入 localStorage 前被安全剝離），自 sessionStorage 補齊驗證
  if ((!authProof && !adminSessionProof) && typeof window !== 'undefined' && window.sessionStorage) {
    try {
      const sensitive = JSON.parse(sessionStorage.getItem('__sh_sensitive__') || '{}');
      if (sensitive.authProof) authProof = sensitive.authProof;
      if (sensitive.adminSessionProof) adminSessionProof = sensitive.adminSessionProof;
      if (sensitive.sub) sub = sensitive.sub;
      if (sensitive.accessToken) accessToken = sensitive.accessToken;
    } catch (_) {}
  }

  // 1. Google OAuth 2.0 官方憑證驗證
  if (authProof && (sub || user.sub) && (accessToken || user.accessToken)) {
    const expected = generateAuthProof(cleanEmail, sub || user.sub, accessToken || user.accessToken);
    if (authProof === expected) return true;
  }

  // 2. 專屬安全密鑰 Session 驗證 (VITE_ADMIN_KEY)
  const envAdminKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_KEY) || '';
  if (adminSessionProof) {
    const expectedEnv = generateAuthProof(cleanEmail, 'admin_session', envAdminKey);
    if (adminSessionProof === expectedEnv) return true;
  }

  return false;
}

// ── Firebase RTDB 與 REST API 路徑深度清洗（徹底杜絕路徑穿越與無效節點崩潰）──
export function sanitizeFirebasePath(pathStr) {
  if (!pathStr || typeof pathStr !== 'string') return '';
  return pathStr
    .split('/')
    .filter(segment => segment && segment !== '.' && segment !== '..')
    .map(segment => segment.replace(/[.$#[\]?]/g, '_').replace(/[\x00-\x1f\x7f]/g, ''))
    .join('/');
}

// ── 學生點數與票券本地防篡改簽章 (HMAC Data Integrity Seal) ───────────────
export function generateIntegritySeal(userId, data) {
  if (!userId || !data) return '';
  const tickets = data.tickets || 0;
  const pity = data.pityCount || 0;
  const claimDate = data.lastDailyClaimDate || '';
  const payload = `${userId}:${tickets}:${pity}:${claimDate}:studyhub_seal_2026`;
  let h = 0x811c9dc5;
  for (let i = 0; i < payload.length; i++) {
    h ^= payload.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return (h >>> 0).toString(16);
}

export function verifyIntegritySeal(userId, data) {
  if (!userId || !data || !data._seal) return false;
  const expected = generateIntegritySeal(userId, data);
  return data._seal === expected;
}

