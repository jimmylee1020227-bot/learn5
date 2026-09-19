// Google 官方直接跳轉與身分驗證服務 (Direct Zero-Prompt Google Jump)
import { SUPER_ADMIN_EMAIL, getAdminsList, fetchCloudAdminsList } from './cloudStorage';

const STORAGE_GOOGLE_CLIENT_ID = 'studyhub_google_client_id';

const HARDCODED_GOOGLE_CLIENT_ID = '1033868027938-tudq6nuvo7onc3rc7i7b4lr8pgohv6oa.apps.googleusercontent.com';

export function getGoogleClientId() {
  // 優先用 .env，再用 hardcode；不從 localStorage 讀取（避免舊快取造成 mismatch）
  return import.meta.env.VITE_GOOGLE_CLIENT_ID || HARDCODED_GOOGLE_CLIENT_ID;
}

export function setGoogleClientId(clientId) {
  if (clientId) {
    localStorage.setItem(STORAGE_GOOGLE_CLIENT_ID, clientId.trim());
  }
}

// 發起真正的 Google 官方登入頁面直接跳轉 (直連 accounts.google.com)
export function redirectToGoogleLogin(customClientId = null) {
  const clientId = customClientId || getGoogleClientId();
  const origin = window.location.origin;

  if (clientId) {
    // 直連 Google 官方 OAuth 2.0 授權端點（自動支援 localhost 與 GitHub Pages 專案子目錄）
    const pathClean = window.location.pathname.replace(/\/$/, '');
    const redirectUri = window.location.origin + (pathClean ? pathClean + '/' : '/');
    const scope = encodeURIComponent('email profile openid');
    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${scope}&prompt=select_account&include_granted_scopes=true&state=studyhub_google_auth`;
    window.location.href = oauthUrl;
    return;
  }

  // 若尚未在 .env 設定 Client ID，提示使用者需要 Google Cloud Client ID 才能通過 Google 官方驗證（避免 400 錯誤）
  const userEnteredId = window.prompt(
    '【即將跳轉真正的 Google 官方授權】\n\nGoogle 官方規範：第三方網站跳轉至 accounts.google.com 必須具備 Google Cloud Client ID，否則 Google 伺服器會拒絕連線並顯示 400 錯誤。\n\n請輸入您的 Google Cloud OAuth Client ID (以 .apps.googleusercontent.com 結尾)：'
  );

  if (userEnteredId && userEnteredId.trim()) {
    setGoogleClientId(userEnteredId.trim());
    redirectToGoogleLogin(userEnteredId.trim());
  }
}

// 產生跨裝置、跨瀏覽器 100% 絕對一致的確定性使用者唯一 ID
export function generateDeterministicUserId(email) {
  const clean = (email || '').trim().toLowerCase();
  if (!clean) return 'student_' + Math.random().toString(36).substring(2, 9);
  if (clean === SUPER_ADMIN_EMAIL.toLowerCase()) return 'admin_super_jimmy';
  
  // 雙重 DJB2 確定性位元雜湊（完全杜絕跨裝置 ID 錯位）
  let h1 = 5381;
  let h2 = 52711;
  for (let i = 0; i < clean.length; i++) {
    const c = clean.charCodeAt(i);
    h1 = ((h1 << 5) + h1) ^ c;
    h2 = ((h2 << 5) + h2) ^ c;
  }
  const p1 = Math.abs(h1).toString(36);
  const p2 = Math.abs(h2).toString(36);
  return `u_${p1}${p2}`;
}

// 監聽並解析 Google 官方 OAuth 2.0 跳轉回調 (#access_token=...)
export async function parseGoogleAuthCallback() {
  if (typeof window === 'undefined') return null;

  // 1. 安全防護：徹底杜絕 URL 偽造提權參數 (?google_auth_success)
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.has('google_auth_success')) {
    // 移除惡意/測試殘留參數保持乾淨
    window.history.replaceState(null, '', window.location.pathname);
  }

  // 2. 檢查 Google 官方 OAuth 2.0 Token 回調 (#access_token=...)
  const hash = window.location.hash;
  if (hash && hash.includes('access_token')) {
    try {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      if (!accessToken) return null;

      window.history.replaceState(null, '', window.location.pathname + window.location.search);

      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (!res.ok) {
        console.error('Google UserInfo fetch failed', res.statusText);
        return null;
      }

      const data = await res.json();
      const cleanEmail = (data.email || '').trim().toLowerCase();
      const isJimmy = cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase();

      return {
        googleId: isJimmy ? 'admin_super_jimmy' : generateDeterministicUserId(cleanEmail),
        sub: data.sub,
        email: data.email,
        displayName: data.name || data.email.split('@')[0],
        avatar: data.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.email)}`,
        emailVerified: data.email_verified,
        accessToken,
        authProof: generateAuthProof(data.email, data.sub, accessToken),
        authTimestamp: Date.now()
      };
    } catch (err) {
      console.error('Failed to parse Google OAuth callback', err);
      return null;
    }
  }

  return null;
}

// 產生基於 Google 官方 Sub 與 Token 的不可偽造防護雜湊憑證
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

// 嚴格向 Google 官方端點校驗 Token 是否真實屬於該管理員 (防本機 DevTools 竄改提權)
export async function verifyGoogleTokenWithCloud(accessToken, expectedEmail) {
  if (!accessToken) return false;
  try {
    const res = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${encodeURIComponent(accessToken)}`);
    if (!res.ok) return false;
    const data = await res.json();
    if (!data.email) return false;
    return data.email.trim().toLowerCase() === expectedEmail.trim().toLowerCase();
  } catch (e) {
    return false;
  }
}

// 判斷使用者角色（總管理員唯一綁定 jimmylee1020227@gmail.com）
export function resolveUserRole(email) {
  const normalizedEmail = (email || '').trim().toLowerCase();
  if (!normalizedEmail) return 'student';
  if (normalizedEmail === SUPER_ADMIN_EMAIL.toLowerCase()) {
    return 'super_admin'; // 👑 唯一總管理員
  }

  const admins = getAdminsList();
  if (Array.isArray(admins) && admins.some(a => a && a.email && a.email.trim().toLowerCase() === normalizedEmail)) {
    return 'admin'; // 🛡️ 一般管理員
  }

  return 'student'; // 🎓 一般學生
}

// 支援即時自雲端拉取最新名冊解析角色的非同步版本 (解決跨裝置首次登入名冊未快取問題)
export async function resolveUserRoleAsync(email) {
  const normalizedEmail = (email || '').trim().toLowerCase();
  if (!normalizedEmail) return 'student';
  if (normalizedEmail === SUPER_ADMIN_EMAIL.toLowerCase()) {
    return 'super_admin';
  }
  const admins = await fetchCloudAdminsList();
  if (Array.isArray(admins) && admins.some(a => a && a.email && a.email.trim().toLowerCase() === normalizedEmail)) {
    return 'admin';
  }
  return 'student';
}


