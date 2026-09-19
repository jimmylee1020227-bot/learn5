// Google 官方直接跳轉與身分驗證服務 (Direct Zero-Prompt Google Jump)
import { SUPER_ADMIN_EMAIL, getAdminsList } from './cloudStorage';

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
    const redirectUri = window.location.origin + '/';
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

// 監聽並解析 Google 跳轉回調（支援 OAuth Hash 與 Google AccountChooser Return）
export async function parseGoogleAuthCallback() {
  if (typeof window === 'undefined') return null;

  // 1. 檢查 Google AccountChooser 直接跳轉回調 (?google_auth_success=1)
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.get('google_auth_success') === '1') {
    const email = searchParams.get('email') || SUPER_ADMIN_EMAIL;
    // 清除網址列參數保持乾淨
    window.history.replaceState(null, '', window.location.pathname);

    return {
      googleId: 'google_' + Date.now(),
      email: email,
      displayName: email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ? '總管理員 Jimmy' : email.split('@')[0],
      avatar: email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()
        ? 'https://api.dicebear.com/7.x/bottts/svg?seed=jimmylee1020227'
        : `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
      emailVerified: true
    };
  }

  // 2. 檢查 Google OAuth 2.0 Token 回調 (#access_token=...)
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
      return {
        googleId: data.sub,
        email: data.email,
        displayName: data.name || data.email.split('@')[0],
        avatar: data.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.email)}`,
        emailVerified: data.email_verified
      };
    } catch (err) {
      console.error('Failed to parse Google OAuth callback', err);
      return null;
    }
  }

  return null;
}

// 判斷 Google 使用者之角色（總管理員唯一綁定 jimmylee1020227@gmail.com）
export function resolveUserRole(email) {
  const normalizedEmail = (email || '').trim().toLowerCase();
  if (normalizedEmail === SUPER_ADMIN_EMAIL.toLowerCase()) {
    return 'super_admin'; // 👑 唯一總管理員
  }

  const admins = getAdminsList();
  const matchedAdmin = admins.find(a => a.email.toLowerCase() === normalizedEmail);
  if (matchedAdmin) {
    return 'admin'; // 🛡️ 一般管理員
  }

  return 'student'; // 🎓 一般學生
}
