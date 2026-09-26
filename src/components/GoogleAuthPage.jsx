import React, { useState } from 'react';
import { SUPER_ADMIN_EMAIL } from '../services/cloudStorage';

export default function GoogleAuthPage() {
  const [customEmail, setCustomEmail] = useState('');
  const [isOtherAccount, setIsOtherAccount] = useState(false);

  const handleSelectAccount = (email) => {
    const targetEmail = (email || SUPER_ADMIN_EMAIL).trim();
    const targetUrl = `${window.location.origin}/?google_auth_success=1&email=${encodeURIComponent(targetEmail)}`;
    window.location.href = targetUrl;
  };

  const handleCancel = () => {
    window.location.href = window.location.origin + '/';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      color: '#202124',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Roboto", "Segoe UI", Arial, sans-serif',
      padding: '24px 16px',
      boxSizing: 'border-box'
    }}>
      {/* 核心卡片 */}
      <div style={{
        maxWidth: '450px',
        width: '100%',
        border: '1px solid #dadce0',
        borderRadius: '28px',
        padding: '36px 40px',
        boxSizing: 'border-box',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)'
      }}>
        {/* Google 標誌 */}
        <div style={{ marginBottom: '16px' }}>
          <svg width="48" height="48" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 500, lineHeight: 1.33, margin: '0 0 8px 0', color: '#202124' }}>
          選擇帳戶
        </h1>
        <p style={{ fontSize: '15px', color: '#5f6368', margin: '0 0 28px 0', lineHeight: 1.4 }}>
          以繼續前往「<strong>學習網</strong>」
        </p>

        {/* 帳戶選項 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
          
          {/* 1. 唯一總管理員 Jimmy */}
          <div 
            onClick={() => handleSelectAccount(SUPER_ADMIN_EMAIL)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: '12px',
              border: '1px solid #e0e2e6',
              cursor: 'pointer',
              background: '#f8fafd',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#1a73e8'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#e0e2e6'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <img 
                src="https://api.dicebear.com/7.x/bottts/svg?seed=jimmylee1020227" 
                alt="avatar" 
                style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e8f0fe' }} 
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: '15px', color: '#202124', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Jimmy Lee</span>
                  <span style={{ fontSize: '11px', background: '#e8f0fe', color: '#1967d2', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                    👑 總管理員
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#5f6368' }}>
                  {SUPER_ADMIN_EMAIL}
                </div>
              </div>
            </div>

            <div style={{ color: '#1a73e8', fontWeight: 600, fontSize: '13px' }}>
              點擊登入
            </div>
          </div>

          {/* 2. 使用其他帳戶 */}
          {!isOtherAccount ? (
            <div 
              onClick={() => setIsOtherAccount(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1px dashed #dadce0',
                cursor: 'pointer',
                color: '#5f6368',
                fontSize: '14px'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#1a73e8'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#dadce0'}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f1f3f4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5f6368' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <span style={{ fontWeight: 500 }}>使用其他 Google 帳戶...</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #dadce0' }}>
              <input 
                type="email" 
                value={customEmail} 
                onChange={e => setCustomEmail(e.target.value)}
                placeholder="輸入您的學生 Gmail 帳號"
                style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #dadce0',
                  fontSize: '14px',
                  outline: 'none'
                }}
                autoFocus
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button 
                  onClick={() => setIsOtherAccount(false)}
                  style={{ background: 'transparent', border: 'none', color: '#5f6368', padding: '6px 12px', cursor: 'pointer', fontSize: '13px' }}
                >
                  取消
                </button>
                <button 
                  onClick={() => customEmail.trim() && handleSelectAccount(customEmail.trim())}
                  style={{ background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
                >
                  以此帳戶登入
                </button>
              </div>
            </div>
          )}

        </div>

        {/* 隱私與條款說明 */}
        <p style={{ fontSize: '12px', color: '#5f6368', lineHeight: 1.6, margin: '0 0 24px 0' }}>
          若要繼續，Google 會將您的姓名、電子郵件地址與個人資料相片分享給 學習網。在登入前，請檢閱該網站的服務條款及隱私權政策。
        </p>

        {/* 取消按鈕 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={handleCancel}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#1a73e8',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '8px 16px',
              borderRadius: '6px'
            }}
          >
            返回學習網
          </button>
        </div>
      </div>

      {/* 底部 Google 資訊 */}
      <div style={{
        maxWidth: '450px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '16px',
        fontSize: '12px',
        color: '#70757a'
      }}>
        <span>中文 (台灣)</span>
        <div style={{ display: 'flex', gap: '16px' }}>
          <a href="https://support.google.com/accounts" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>說明</a>
          <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>隱私權</a>
          <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>條款</a>
        </div>
      </div>
    </div>
  );
}
