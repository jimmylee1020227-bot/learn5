import React, { createContext, useContext, useState, useEffect } from 'react';
import { updatePlayerDisplayName } from '../services/leaderboardService';
import { 
  SUPER_ADMIN_EMAIL, 
  getAdminsList, 
  subscribeToCloudSync,
  purgeAllTestData
} from '../services/cloudStorage';
import { 
  redirectToGoogleLogin, 
  parseGoogleAuthCallback, 
  resolveUserRole,
  getGoogleClientId,
  setGoogleClientId
} from '../services/googleAuthService';

const AuthContext = createContext();

const STORAGE_USER_KEY = 'studyhub_current_user';

export function AuthProvider({ children }) {
  // 強制正式登入制：未登入時 currentUser 為 null，禁止訪客直接進入
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_USER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) {
          if (parsed.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
            parsed.role = 'super_admin';
            parsed.id = 'admin_super_jimmy';
          } else {
            parsed.role = resolveUserRole(parsed.email);
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
        const assignedRole = resolveUserRole(googleUser.email);
        const isJimmy = googleUser.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
        const cleanEmail = googleUser.email.trim().toLowerCase();
        const deterministicId = 'user_' + btoa(encodeURIComponent(cleanEmail)).replace(/[^a-zA-Z0-9]/g, '').slice(0, 24);
        const newUser = {
          id: isJimmy ? 'admin_super_jimmy' : (googleUser.googleId || deterministicId),
          email: googleUser.email,
          displayName: isJimmy ? '總管理員 (Jimmy)' : (googleUser.displayName || googleUser.email.split('@')[0]),
          avatar: isJimmy 
            ? 'https://api.dicebear.com/7.x/bottts/svg?seed=jimmylee1020227' 
            : (googleUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(googleUser.email)}`),
          role: assignedRole,
          isGoogleBound: true,
          createdAt: new Date().toISOString()
        };
        setCurrentUser(newUser);
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(newUser));
      }
      setAuthLoading(false);
    }
    handleAuthReturn();
  }, []);

  // 2. 當使用者資料變更時同步持久化
  useEffect(() => {
    if (currentUser && currentUser.isGoogleBound) {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(currentUser));
    }
  }, [currentUser]);

  // 3. 發起直接跳轉 Google 官方授權登入頁面 (零輸入秒跳轉)
  const triggerGoogleLogin = () => {
    redirectToGoogleLogin();
  };

  // 4. 登出
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_USER_KEY);
  };

  // 5. 自訂排行榜暱稱
  const setCustomDisplayName = (newName) => {
    if (!newName || !newName.trim()) return;
    const trimmed = newName.trim();
    setCurrentUser(prev => ({
      ...prev,
      displayName: trimmed
    }));
    updatePlayerDisplayName(currentUser?.id || 'guest_student', trimmed);
  };

  // 6. 登入特定 Email（若是 jimmylee1020227@gmail.com 需比對安全金鑰或以 Google 官方驗證登入）
  const directLoginWithEmail = (email, displayName = '', securityKey = '') => {
    const cleanEmail = email.trim();
    const assignedRole = resolveUserRole(cleanEmail);

    // 管理員帳號安全防護：未通過 Google 官方驗證時，需提供專屬管理安全密鑰
    if (assignedRole === 'super_admin' || assignedRole === 'admin') {
      const validKeys = ['1020227', 'admin888', 'jimmy888', '2026'];
      if (!securityKey || !validKeys.includes(securityKey.trim())) {
        throw new Error('管理員帳號受安全金鑰保護！請輸入管理通關密鑰 (預設 1020227) 或改用 Google 官方一鍵登入。');
      }
    }

    const isJimmy = cleanEmail.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
    const user = {
      id: isJimmy ? 'admin_super_jimmy' : ('google_' + Math.abs(cleanEmail.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0))),
      email: cleanEmail,
      displayName: displayName.trim() || (isJimmy ? '總管理員 (Jimmy)' : cleanEmail.split('@')[0]),
      avatar: isJimmy
        ? 'https://api.dicebear.com/7.x/bottts/svg?seed=jimmylee1020227'
        : `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
      role: assignedRole,
      isGoogleBound: true,
      createdAt: new Date().toISOString()
    };
    setCurrentUser(user);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
  };

  // 7. 快速切換測試身分（學生、一般管理員、總管理員）
  const switchUserIdentity = (role, specificId = null) => {
    if (role === 'super_admin') {
      const superAdmin = {
        id: 'admin_super_jimmy',
        email: SUPER_ADMIN_EMAIL,
        displayName: '總管理員 (Jimmy)',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=jimmylee1020227',
        role: 'super_admin',
        isGoogleBound: true,
        createdAt: new Date().toISOString()
      };
      setCurrentUser(superAdmin);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(superAdmin));
    } else if (role === 'admin') {
      const admins = getAdminsList();
      const targetAdmin = (specificId ? admins.find(a => a.id === specificId) : null) || admins.find(a => a.role === 'admin') || {
        id: 'admin_chen',
        email: 'teacher.chen@studyhub.edu.tw',
        displayName: '陳老師 (理數科)',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher.chen',
        role: 'admin',
        isGoogleBound: true,
        createdAt: new Date().toISOString()
      };
      setCurrentUser(targetAdmin);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(targetAdmin));
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

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        authLoading,
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
