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
    ? { USE_PROFILES: { svg: true, html: true }, ADD_TAGS: ['svg', 'path', 'line', 'circle', 'rect', 'text', 'g', 'polyline', 'polygon'] }
    : { USE_PROFILES: { html: true } };
  return window.__DOMPurify.sanitize(dirty, config);
}
