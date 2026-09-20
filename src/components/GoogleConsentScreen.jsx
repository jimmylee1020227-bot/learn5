import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SUPER_ADMIN_EMAIL } from '../services/cloudStorage';
import { 
  User, 
  ShieldCheck, 
  Check, 
  ArrowRight, 
  X,
  ExternalLink
} from 'lucide-react';

export default function GoogleConsentScreen({ isOpen, onClose }) {
  const { directLoginWithEmail } = useAuth();
  const [selectedEmail, setSelectedEmail] = useState(SUPER_ADMIN_EMAIL);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customEmailInput, setCustomEmailInput] = useState('');
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  if (!isOpen) return null;

  const handleConfirmLogin = (emailToUse) => {
    setIsAuthorizing(true);
    setTimeout(() => {
      directLoginWithEmail(emailToUse);
      setIsAuthorizing(false);
      onClose();
    }, 600);
  };

  return (
    <div className="modal-overlay" style={{ background: 'rgba(0, 0, 0, 0.75)', zIndex: 9999 }}>
      <div 
        style={{
          background: '#ffffff',
          color: '#1f2937',
          borderRadius: '24px',
          maxWidth: '460px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          animation: 'slideUp 0.25s ease-out'
        }}
      >
        {/* Google 官方授權頁面 Header */}
        <div style={{ padding: '32px 32px 16px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
            <svg width="40" height="40" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 600, color: '#202124', marginBottom: '6px' }}>
            選擇帳戶
          </h2>
          <p style={{ fontSize: '0.92rem', color: '#5f6368' }}>
            以繼續前往「<strong>學習網</strong>」
          </p>
        </div>

        {/* 帳戶選擇列表 */}
        <div style={{ padding: '0 16px 20px' }}>
          
          {/* 1. 總管理員帳號 (jimmylee1020227@gmail.com) */}
          <div
            onClick={() => handleConfirmLogin(SUPER_ADMIN_EMAIL)}
            style={{
              padding: '16px 20px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              border: '1px solid #dadce0',
              marginBottom: '10px',
              transition: 'background 0.15s ease',
              background: '#f8fafd'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#e8f0fe'}
            onMouseLeave={e => e.currentTarget.style.background = '#f8fafd'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <img 
                src="https://api.dicebear.com/7.x/bottts/svg?seed=jimmylee1020227" 
                alt="Jimmy" 
                style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#fff', border: '1px solid #dadce0' }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.98rem', color: '#202124', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Jimmy Lee</span>
                  <span style={{ fontSize: '0.72rem', background: '#fef3c7', color: '#92400e', padding: '1px 6px', borderRadius: '8px', fontWeight: 700 }}>
                    👑 總管理員
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#5f6368' }}>
                  {SUPER_ADMIN_EMAIL}
                </div>
              </div>
            </div>
            <ArrowRight size={18} color="#1a73e8" />
          </div>

          {/* 2. 切換或使用其他 Google 帳戶 */}
          {!isCustomMode ? (
            <div
              onClick={() => setIsCustomMode(true)}
              style={{
                padding: '14px 20px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                cursor: 'pointer',
                border: '1px solid transparent',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f1f3f4'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e8eaed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={20} color="#5f6368" />
              </div>
              <div style={{ fontSize: '0.92rem', color: '#1a73e8', fontWeight: 600 }}>
                使用其他 Google 帳戶登入...
              </div>
            </div>
          ) : (
            <div style={{ padding: '14px 16px', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #dadce0' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3c4043', marginBottom: '8px' }}>
                輸入學生或其他 Google Email：
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="email"
                  value={customEmailInput}
                  onChange={e => setCustomEmailInput(e.target.value)}
                  placeholder="例如: student@gmail.com"
                  autoFocus
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #dadce0',
                    fontSize: '0.88rem',
                    outline: 'none',
                    color: '#202124',
                    background: '#fff'
                  }}
                />
                <button
                  onClick={() => {
                    if (customEmailInput.trim()) {
                      handleConfirmLogin(customEmailInput.trim());
                    }
                  }}
                  disabled={!customEmailInput.trim()}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    background: '#1a73e8',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  登入
                </button>
              </div>
            </div>
          )}

        </div>

        {/* 隱私與授權聲明 (Google 官方規範格式) */}
        <div style={{ padding: '16px 32px 28px', background: '#fafafa', borderTop: '1px solid #f1f3f4', fontSize: '0.78rem', color: '#5f6368', lineHeight: 1.5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', color: '#3c4043', fontWeight: 500 }}>
            <ShieldCheck size={15} color="#1e8e3e" />
            Google 安全驗證
          </div>
          如要繼續，Google 會將您的名稱、電子郵件地址與個人資料相片分享給「108 課綱學習網」。登入前請參閱該服務的隱私權政策。
        </div>

        {/* 底部關閉 */}
        <div style={{ padding: '12px 24px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f3f4' }}>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#5f6368',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '6px 12px'
            }}
          >
            取消
          </button>
        </div>

      </div>
    </div>
  );
}
