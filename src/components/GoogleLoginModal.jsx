import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getGoogleClientId, setGoogleClientId, redirectToGoogleLogin } from '../services/googleAuthService';
import { SUPER_ADMIN_EMAIL } from '../services/cloudStorage';
import { 
  LogIn, 
  Crown, 
  Settings, 
  X, 
  Check, 
  ShieldCheck, 
  ExternalLink,
  Sparkles
} from 'lucide-react';

export default function GoogleLoginModal() {
  const { 
    isGoogleConfigModalOpen, 
    setIsGoogleConfigModalOpen, 
    directLoginWithEmail 
  } = useAuth();

  const [clientIdInput, setClientIdInput] = useState(getGoogleClientId());
  const [customStudentEmail, setCustomStudentEmail] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  if (!isGoogleConfigModalOpen) return null;

  const handleSaveAndRedirect = () => {
    if (clientIdInput.trim()) {
      setGoogleClientId(clientIdInput.trim());
      setIsSaved(true);
      // 立即發起官方 Google OAuth 2.0 跳轉
      redirectToGoogleLogin(clientIdInput.trim());
    }
  };

  const handleLoginAsSuperAdmin = () => {
    directLoginWithEmail(SUPER_ADMIN_EMAIL, '總管理員 Jimmy');
    setIsGoogleConfigModalOpen(false);
  };

  const handleLoginAsStudent = (e) => {
    e.preventDefault();
    if (!customStudentEmail.trim()) return;
    directLoginWithEmail(customStudentEmail.trim());
    setIsGoogleConfigModalOpen(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '540px' }}>
        
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Google 官方帳號登入中心</h3>
          </div>
          <button onClick={() => setIsGoogleConfigModalOpen(false)} className="btn btn-ghost btn-icon">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          {/* 總管理員專屬一鍵直達入口 */}
          <div 
            onClick={handleLoginAsSuperAdmin}
            style={{ 
              padding: '16px 20px', 
              border: '2.5px solid #17324d', 
              background: '#fff7d9', 
              borderRadius: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '4px 4px 0 #f7cf68',
              transition: 'transform 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ padding: '8px', borderRadius: '50%', background: '#fff3bd', border: '1.5px solid #17324d' }}>
                <Crown size={24} color="#806523" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#806523' }}>
                  👑 總管理員登入 ({SUPER_ADMIN_EMAIL})
                </div>
                <div style={{ fontSize: '0.75rem', color: '#5b6772', marginTop: '2px', fontWeight: 600 }}>
                  立即以系統唯一總管理員身分進入，具備日誌審計與管理員任免最高權限
                </div>
              </div>
            </div>
            <button 
              type="button" 
              onClick={(e) => { e.stopPropagation(); handleLoginAsSuperAdmin(); }} 
              className="btn btn-gold" 
              style={{ fontSize: '0.82rem', padding: '6px 14px' }}
            >
              直接登入
            </button>
          </div>

          {/* 官方 OAuth 2.0 跳轉配置 */}
          <div className="glass-panel" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '0.92rem', color: '#17324d', marginBottom: '8px' }}>
              <Settings size={16} color="#ef8354" />
              官方 Google OAuth 2.0 跳轉授權設定
            </div>
            <p style={{ fontSize: '0.8rem', color: '#5b6772', marginBottom: '12px', lineHeight: 1.5, fontWeight: 600 }}>
              填入您的 Google Cloud OAuth Client ID（以 .apps.googleusercontent.com 結尾），點擊下方按鈕將<strong>直接跳轉到 accounts.google.com 官方登入頁面</strong>，授權完成後自動重定向回本學習網導入資料。
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="text"
                value={clientIdInput}
                onChange={e => setClientIdInput(e.target.value)}
                placeholder="例如: 123456789-xxxx.apps.googleusercontent.com"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#f8f3eb',
                  border: '1.5px solid #ded3c5',
                  borderRadius: 'var(--radius-sm)',
                  color: '#17324d',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}
              />

              <button
                type="button"
                onClick={handleSaveAndRedirect}
                disabled={!clientIdInput.trim()}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', fontWeight: 800 }}
              >
                <ExternalLink size={16} /> 直接跳轉至 Google 官方登入頁面
              </button>
            </div>
          </div>

          {/* 一般學生 Google 信箱快速登入 */}
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#17324d', marginBottom: '8px' }}>
              🎓 學生個人 Google 帳號快速登入：
            </div>
            <form onSubmit={handleLoginAsStudent} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="email"
                value={customStudentEmail}
                onChange={e => setCustomStudentEmail(e.target.value)}
                placeholder="輸入您的 Google 信箱 (如 student@gmail.com)"
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  background: '#f8f3eb',
                  border: '1.5px solid #ded3c5',
                  borderRadius: 'var(--radius-sm)',
                  color: '#17324d',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}
              />
              <button type="submit" className="btn btn-secondary" style={{ padding: '0 16px' }}>
                登入
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
