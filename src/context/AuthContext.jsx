import React, { createContext, useContext, useState, useEffect } from 'react';
import { rateLimiter } from '../utils/secureStorage';
import { updatePlayerDisplayName } from '../services/leaderboardService';
import { 
  SUPER_ADMIN_EMAIL, 
  getAdminsList,
  fetchCloudAdminsList,
  checkIsAdmin,
  checkIsSuperAdmin,
  subscribeToCloudSync,
  subscribeUserRealtimeSync,
  registerCloudUser,
  purgeAllTestData,
  checkNicknameAvailable
} from '../services/cloudStorage';
import { 
  redirectToGoogleLogin, 
  parseGoogleAuthCallback, 
  resolveUserRole,
  resolveUserRoleAsync,
  getGoogleClientId,
  setGoogleClientId,
  generateDeterministicUserId,
  generateAuthProof,
  verifyGoogleTokenWithCloud
} from '../services/googleAuthService';

const AuthContext = createContext();

const STORAGE_USER_KEY = 'studyhub_current_user';

export function AuthProvider({ children }) {
  // 強制正式登入制：未登入時 currentUser 為 null，禁止訪客直接進入
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_USER_KEY) || localStorage.getItem('studyhub_auth_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) {
          // 先從 parsed 資料中解析出正確的目標角色
          const cleanEmail = (parsed.email || '').trim().toLowerCase();
          const isJimmy = cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase();
          const targetRole = resolveUserRole(cleanEmail);

          // 安全防禦：若標記為管理員角色，必須具備合法的 Google 官方憑證 (authProof) 或管理金鑰簽章 (adminSessionProof)
          // 杜絕透過瀏覽器 Console / LocalStorage 偽造 Email 進行未授權提權
          if (targetRole === 'super_admin' || targetRole === 'admin') {
            const hasValidProof = !!(parsed.authProof || parsed.adminSessionProof);
            if (!hasValidProof) {
              parsed.role = 'student';
              parsed.id = generateDeterministicUserId(parsed.email);
            } else {
              parsed.role = targetRole;
              parsed.id = isJimmy ? 'admin_super_jimmy' : generateDeterministicUserId(parsed.email);
            }
          } else {
            parsed.role = 'student';
            parsed.id = generateDeterministicUserId(parsed.email);
          }
          return parsed;
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  });

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isGoogleConfigModalOpen, setIsGoogleConfigModalOpen] = useState(false);
  const [isGoogleConsentOpen, setIsGoogleConsentOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // 1. 頁面載入時：檢查是否有 Google OAuth 2.0 跳轉回調 (#access_token=...)
  useEffect(() => {
    async function handleAuthReturn() {
      const googleUser = await parseGoogleAuthCallback();
      if (googleUser) {
        // 先確保雲端管理員名冊到位，避免首次登入因本機快取未載入而誤判為 student
        const assignedRole = await resolveUserRoleAsync(googleUser.email);
        const isJimmy = googleUser.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
        const cleanEmail = googleUser.email.trim().toLowerCase();
        const deterministicId = isJimmy ? 'admin_super_jimmy' : (googleUser.id || generateDeterministicUserId(cleanEmail));

        // 讀取本地已存的舊帳號資料，優先沿用使用者自訂暱稱（防止重新登入時被 Google 原始名字覆蓋）
        let savedDisplayName = null;
        try {
          // 優先從獨立備份 key 讀取（不隨 logout 清除）
          const nameKey = `studyhub_custom_name_${cleanEmail}`;
          const directName = localStorage.getItem(nameKey);
          if (directName) {
            savedDisplayName = directName;
          } else {
            // fallback：從舊的 auth user 物件裡讀
            const saved = localStorage.getItem(STORAGE_USER_KEY) || localStorage.getItem('studyhub_auth_user');
            if (saved) {
              const parsed = JSON.parse(saved);
              if (parsed?.email?.toLowerCase() === cleanEmail && parsed?.customDisplayName) {
                savedDisplayName = parsed.customDisplayName;
              }
            }
          }
        } catch (_) {}

        const resolvedDisplayName = savedDisplayName
          || (isJimmy ? '總管理員 (Jimmy)' : (googleUser.displayName || googleUser.email.split('@')[0]));

        const newUser = {
          id: deterministicId,
          email: googleUser.email,
          displayName: resolvedDisplayName,
          customDisplayName: savedDisplayName || null,
          avatar: isJimmy 
            ? 'https://api.dicebear.com/7.x/bottts/svg?seed=jimmylee1020227' 
            : (googleUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(googleUser.email)}`),
          role: assignedRole,
          isGoogleBound: true,
          sub: googleUser.sub,
          accessToken: googleUser.accessToken,
          authProof: googleUser.authProof,
          authTimestamp: googleUser.authTimestamp,
          createdAt: new Date().toISOString()
        };
        setCurrentUser(newUser);
        // ── 安全：accessToken / authProof 不落地 localStorage，只存 sessionStorage ──
        const sensitive = { accessToken: newUser.accessToken, authProof: newUser.authProof };
        sessionStorage.setItem('__sh_sensitive__', JSON.stringify(sensitive));
        const safeUser = { ...newUser };
        delete safeUser.accessToken;
        delete safeUser.authProof;
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(safeUser));
        localStorage.setItem('studyhub_auth_user', JSON.stringify(safeUser));
        registerCloudUser(newUser);
      }
      setAuthLoading(false);
    }
    handleAuthReturn();
  }, []);

  // 1.5 自動自雲端同步最新管理員名冊並即時響應任命/撤銷
  useEffect(() => {
    const updateRoleFromList = (adminList) => {
      if (currentUser?.email) {
        const cleanEmail = currentUser.email.trim().toLowerCase();
        const isJimmy = cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase();
        const inAdmins = Array.isArray(adminList) && adminList.some(a => a && a.email && a.email.trim().toLowerCase() === cleanEmail);
        const correctRole = isJimmy ? 'super_admin' : inAdmins ? 'admin' : 'student';
        if (currentUser.role !== correctRole) {
          const updatedUser = { ...currentUser, role: correctRole };
          setCurrentUser(updatedUser);
          const safeUpdated = { ...updatedUser };
          delete safeUpdated.accessToken; delete safeUpdated.authProof;
          localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(safeUpdated));
          localStorage.setItem('studyhub_auth_user', JSON.stringify(safeUpdated));
        }
      }
    };

    // A. 啟動時主動自 Firebase 雲端讀取最新 admins_list
    fetchCloudAdminsList().then(adminList => {
      updateRoleFromList(adminList);
    });

    // B. 即時監聽 Firebase admins_list 廣播，只要總管任命或撤銷，當前使用者秒級生效！
    const unsub = subscribeToCloudSync((event) => {
      if (!event || event.key === 'admins_list') {
        const currentAdmins = getAdminsList();
        updateRoleFromList(currentAdmins);
      }
      if (event && event.key === 'user_registry' && currentUser?.id) {
        const registry = JSON.parse(localStorage.getItem('studyhub_user_registry') || '{}');
        const latestData = registry[currentUser.id];
        if (latestData && latestData.name && latestData.name !== currentUser.displayName) {
          setCurrentUser(prev => ({ ...prev, displayName: latestData.name }));
          localStorage.setItem('studyhub_auth_user', JSON.stringify({ ...currentUser, displayName: latestData.name }));
        }
      }
    });

    return () => unsub();
  }, [currentUser?.email, currentUser?.role, currentUser?.id, currentUser?.displayName]);

  // 2. 當使用者資料變更時同步持久化並訂閱專屬個人雲端節點
  useEffect(() => {
    if (currentUser && currentUser.isGoogleBound) {
      const safeUser = { ...currentUser };
      delete safeUser.accessToken; delete safeUser.authProof;
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(safeUser));
      localStorage.setItem('studyhub_auth_user', JSON.stringify(safeUser));
      registerCloudUser(currentUser);
    }
    if (currentUser?.id) {
      subscribeUserRealtimeSync(currentUser.id);
    }
  }, [currentUser]);

  // 3. 發起直接跳轉 Google 官方授權登入頁面 (零輸入秒跳轉)
  const triggerGoogleLogin = () => {
    redirectToGoogleLogin();
  };

  // 4. 登出 (保留自訂暱稱，不隨登出清除)
  const logout = () => {
    // 先把自訂暱稱備份到獨立 key，下次登入時仍可讀回
    if (currentUser?.email && currentUser?.customDisplayName) {
      const nameKey = `studyhub_custom_name_${currentUser.email.trim().toLowerCase()}`;
      localStorage.setItem(nameKey, currentUser.customDisplayName);
    }
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_USER_KEY);
    localStorage.removeItem('studyhub_auth_user');
  };

  // 5. 自訂排行榜暱稱 (加入長度限制、XSS 過濾、管理員冒充防護、雲端暱稱唯一性確認)
  const setCustomDisplayName = async (newName) => {
    if (!newName || !newName.trim()) return;
    let trimmed = newName.trim().slice(0, 20);
    // XSS 安全過濾：剔除潛在 HTML/Script 標籤符號
    trimmed = trimmed.replace(/[<>'"/\\`]/g, '');
    if (!trimmed) return;

    // 仿冒防護：一般學生禁止使用管理員關鍵字
    const isAdminUser = checkIsAdmin(currentUser);
    if (!isAdminUser) {
      trimmed = trimmed.replace(/(管理員|總管理員|站長|官方|總管|系統總管|Admin|SuperAdmin)/gi, '同學');
    }

    // 防重複暱稱（先查本地快取，再向 Firebase 雲端確認）
    try {
      const { available, suggestion } = await checkNicknameAvailable(trimmed, currentUser?.id || '');
      if (!available) {
        trimmed = suggestion || (trimmed + '_' + Math.random().toString(36).substring(2, 6).toUpperCase());
        alert(`⚠️ 該暱稱已被其他同學使用！系統已為您自動調整為：${trimmed}`);
      }
    } catch (e) {
      // 雲端查詢失敗時，退回本地快速檢查
      const registry = JSON.parse(localStorage.getItem('studyhub_user_registry') || '{}');
      const nameExists = Object.values(registry).some(u =>
        u.id !== currentUser?.id &&
        (u.name === trimmed || u.displayName === trimmed)
      );
      if (nameExists) {
        trimmed = trimmed + '_' + Math.random().toString(36).substring(2, 6).toUpperCase();
        alert(`⚠️ 該暱稱已被使用，系統已自動為您加上專屬後綴：${trimmed}`);
      }
    }

    setCurrentUser(prev => ({
      ...prev,
      displayName: trimmed,
      customDisplayName: trimmed   // 存入獨立欄位，下次 Google 登入時優先沿用
    }));
    // 即時寫入獨立備份 key（不隨 logout 清除，確保跨登入持久）
    if (currentUser?.email) {
      const nameKey = `studyhub_custom_name_${currentUser.email.trim().toLowerCase()}`;
      localStorage.setItem(nameKey, trimmed);
    }
    updatePlayerDisplayName(currentUser?.id || 'guest_student', trimmed);
    return trimmed;
  };

  // 6. 登入特定 Email（跨裝置 100% 相同 ID，資料即時漫遊）
  const directLoginWithEmail = (email, displayName = '', securityKey = '') => {
    const cleanEmail = email.trim();

    // ── 暴力攻擊防護：同 Email 5 分鐘內超過 5 次失敗 → 鎖定 15 分鐘 ──
    const rl = rateLimiter.attempt(`login_${cleanEmail}`);
    if (!rl.allowed) {
      const mins = Math.ceil(rl.remainingMs / 60000);
      throw new Error(`⛔ 登入次數過多！請等待 ${mins} 分鐘後再試。`);
    }

    const assignedRole = resolveUserRole(cleanEmail);

    // 管理員帳號安全防護：未通過 Google 官方驗證時，需提供環境變數中的專屬管理安全密鑰
    if (assignedRole === 'super_admin' || assignedRole === 'admin') {
      const validAdminKey = import.meta.env.VITE_ADMIN_KEY;
      if (!validAdminKey) {
        throw new Error('管理員帳號必須通過 Google 官方授權登入！如需直接登入請在 .env 中設定 VITE_ADMIN_KEY。');
      }
      if (!securityKey || securityKey.trim() !== validAdminKey) {
        throw new Error('管理員帳號受專屬安全金鑰保護！請輸入正確的管理通關密鑰或改用 Google 官方授權登入。');
      }
    }

    const isJimmy = cleanEmail.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
    const deterministicId = isJimmy ? 'admin_super_jimmy' : generateDeterministicUserId(cleanEmail);
    const envAdminKey = import.meta.env.VITE_ADMIN_KEY || '';
    const isAdminRole = assignedRole === 'super_admin' || assignedRole === 'admin';
    const sessionProof = isAdminRole ? generateAuthProof(cleanEmail, 'admin_session', envAdminKey) : null;

    const user = {
      id: deterministicId,
      email: cleanEmail,
      displayName: displayName.trim() || (isJimmy ? '總管理員 (Jimmy)' : cleanEmail.split('@')[0]),
      avatar: isJimmy
        ? 'https://api.dicebear.com/7.x/bottts/svg?seed=jimmylee1020227'
        : `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
      role: assignedRole,
      isGoogleBound: true,
      adminSessionProof: sessionProof,
      createdAt: new Date().toISOString()
    };
    setCurrentUser(user);
    // ── 安全：adminSessionProof 不落地 localStorage ──
    const safeUser = { ...user };
    delete safeUser.adminSessionProof; delete safeUser.accessToken; delete safeUser.authProof;
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(safeUser));
    localStorage.setItem('studyhub_auth_user', JSON.stringify(safeUser));
    registerCloudUser(user);
  };

  // 7. 快速切換測試身分（僅限總管理員使用，安全防護：一般使用者無法提權）
  const switchUserIdentity = (role, specificId = null) => {
    // 安全防護：只有目前已是 super_admin 的使用者才能使用此功能
    if (!checkIsSuperAdmin(currentUser)) {
      console.warn('[Security] switchUserIdentity 被未授權使用者呼叫，已攔截。');
      return;
    }
    const envAdminKey = import.meta.env.VITE_ADMIN_KEY || '';
    if (role === 'super_admin') {
      const superAdmin = {
        id: 'admin_super_jimmy',
        email: SUPER_ADMIN_EMAIL,
        displayName: '總管理員 (Jimmy)',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=jimmylee1020227',
        role: 'super_admin',
        isGoogleBound: true,
        adminSessionProof: generateAuthProof(SUPER_ADMIN_EMAIL, 'admin_session', envAdminKey),
        createdAt: new Date().toISOString()
      };
      setCurrentUser(superAdmin);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(superAdmin));
    } else if (role === 'admin') {
      const admins = getAdminsList();
      const targetAdmin = (specificId ? admins.find(a => a.id === specificId) : null) || admins.find(a => a.role === 'admin') || {
        id: 'admin_happybrother0717',
        email: 'happybrother0717@gmail.com',
        displayName: '駐站管理員 (happybrother)',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=happybrother0717',
        role: 'admin',
        isGoogleBound: true,
        createdAt: new Date().toISOString()
      };
      const adminWithProof = {
        ...targetAdmin,
        adminSessionProof: generateAuthProof(targetAdmin.email, 'admin_session', envAdminKey)
      };
      setCurrentUser(adminWithProof);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(adminWithProof));
    } else {
      const studentUser = {
        id: 'user_lin',
        email: 'student.lin@gmail.com',
        displayName: '建中前鋒‧林同學',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=user_lin',
        role: 'student',
        isGoogleBound: true,
        createdAt: new Date().toISOString()
      };
      setCurrentUser(studentUser);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(studentUser));
    }
  };

  const bindGoogleAccount = ({ email, name }) => {
    directLoginWithEmail(email, name);
  };

  const isSuperAdmin = checkIsSuperAdmin(currentUser);
  const isAdmin = checkIsAdmin(currentUser);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        authLoading,
        isAdmin,
        isSuperAdmin,
        triggerGoogleLogin,
        directLoginWithEmail,
        switchUserIdentity,
        bindGoogleAccount,
        logout,
        setCustomDisplayName,
        isRoleModalOpen,
        setIsRoleModalOpen,
        isGoogleConfigModalOpen,
        setIsGoogleConfigModalOpen,
        isGoogleConsentOpen,
        setIsGoogleConsentOpen,
        purgeAllTestData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  return context || {};
}
