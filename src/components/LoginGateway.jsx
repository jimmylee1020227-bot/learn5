import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDevice } from '../context/DeviceContext';
import { GraduationCap, Sparkles, Shield, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';
import { SUPER_ADMIN_EMAIL } from '../services/cloudStorage';

export default function LoginGateway() {
  const { 
    triggerGoogleLogin, 
    directLoginWithEmail, 
    setIsGoogleConfigModalOpen 
  } = useAuth();
  const { isMobile } = useDevice();

  const [inputEmail, setInputEmail] = useState('');
  const [inputName, setInputName] = useState('');
  const [securityKey, setSecurityKey] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isTargetingAdmin = inputEmail.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() || isAdminMode;

  const handleEmailLogin = (e) => {
    e?.preventDefault();
    const email = inputEmail.trim();
    if (!email) {
      setErrorMsg('請輸入電子信箱 (Email)！');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setErrorMsg('請輸入有效的 Email 格式！');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);
    try {
      directLoginWithEmail(email, inputName.trim(), securityKey.trim());
    } catch (err) {
      setErrorMsg(err.message || '登入失敗，請重試');
      setIsSubmitting(false);
    }
  };

  const handleSuperAdminQuickFill = () => {
    setInputEmail(SUPER_ADMIN_EMAIL);
    setInputName('總管理員 (Jimmy)');
    setSecurityKey('1020227');
    setIsAdminMode(true);
  };

  return (
    <div 
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '16px 12px' : '24px 16px',
        background: '#f8f3eb',
        backgroundImage: `
          linear-gradient(to right, rgba(23, 50, 77, 0.04) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(23, 50, 77, 0.04) 1px, transparent 1px)
        `,
        backgroundSize: '24px 24px'
      }}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '480px',
          background: '#fffdf9',
          border: '3px solid #17324d',
          borderRadius: isMobile ? '20px' : '28px',
          boxShadow: isMobile ? '6px 6px 0px #17324d' : '10px 10px 0px #17324d',
          padding: isMobile ? '24px 18px' : '36px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '18px' : '24px',
          position: 'relative'
        }}
      >
        {/* 頂部品牌區塊 */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <div 
            style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '20px', 
              background: '#17324d', 
              border: '2.5px solid #17324d', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#f7cf68', 
              boxShadow: '4px 4px 0px #ef8354' 
            }}
          >
            <GraduationCap size={36} />
          </div>

          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: '#17324d', letterSpacing: '-0.02em' }}>
              會考讀書網
            </h1>
            <p style={{ margin: '6px 0 0 0', fontSize: '0.88rem', color: '#78818a', fontWeight: 600 }}>
              108 課綱專屬題庫・錯題加強模式・每週排行榜
            </p>
          </div>
        </div>

        {/* 正式環境上線提示 */}
        <div 
          style={{ 
            background: '#fff0e9', 
            border: '1.5px solid #ef8354', 
            borderRadius: '16px', 
            padding: '12px 16px', 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: '10px' 
          }}
        >
          <Shield size={18} color="#c8643d" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div style={{ fontSize: '0.82rem', color: '#c8643d', lineHeight: 1.5, fontWeight: 700 }}>
            系統已正式上線！本站採帳號實名制以確保多端做題數據、個人錯題本與點數永久安全同步，請登入後開始使用。
          </div>
        </div>

        {/* 方式 1：Google 官方授權登入 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={triggerGoogleLogin}
            className="btn"
            style={{
              width: '100%',
              padding: '14px 20px',
              background: '#ffffff',
              color: '#17324d',
              fontWeight: 900,
              fontSize: '1rem',
              borderRadius: '16px',
              border: '2.5px solid #17324d',
              boxShadow: '4px 4px 0px #17324d',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              transition: 'transform 0.1s ease'
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>使用 Google 帳號一鍵登入</span>
          </button>
          <span style={{ fontSize: '0.74rem', color: '#78818a', textAlign: 'center', fontWeight: 600 }}>
            支援手機與電腦瀏覽器，零輸入秒跳轉
          </span>
        </div>

        {/* 分隔線 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ flex: 1, height: '1.5px', background: '#e8ded0' }} />
          <span style={{ fontSize: '0.78rem', color: '#9aa2a8', fontWeight: 700 }}>或使用 Email 帳號登入</span>
          <div style={{ flex: 1, height: '1.5px', background: '#e8ded0' }} />
        </div>

        {/* 方式 2：Email 與暱稱快速登入表單 */}
        <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#17324d', display: 'block', marginBottom: '6px' }}>
              電子郵件 (Email) <span style={{ color: '#ef8354' }}>*</span>
            </label>
            <input 
              type="email"
              value={inputEmail}
              onChange={e => setInputEmail(e.target.value)}
              placeholder="例如：student@gmail.com"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '2px solid #ded3c5',
                background: '#fffdf9',
                fontSize: '0.92rem',
                color: '#17324d',
                fontWeight: 600,
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#17324d', display: 'block', marginBottom: '6px' }}>
              姓名或暱稱（選填）
            </label>
            <input 
              type="text"
              value={inputName}
              onChange={e => setInputName(e.target.value)}
              placeholder="例如：林同學、建中衝刺生"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '2px solid #ded3c5',
                background: '#fffdf9',
                fontSize: '0.92rem',
                color: '#17324d',
                fontWeight: 600,
                outline: 'none'
              }}
            />
          </div>

          {isTargetingAdmin && (
            <div style={{ background: '#fff7ed', border: '1.5px dashed #f97316', borderRadius: '12px', padding: '12px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#c2410c', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <Shield size={14} /> 管理員通關密鑰 (PIN) <span style={{ color: '#ef8354' }}>*</span>
              </label>
              <input 
                type="password"
                value={securityKey}
                onChange={e => setSecurityKey(e.target.value)}
                placeholder="請輸入管理安全密鑰 (預設: 1020227)"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1.5px solid #fdba74',
                  background: '#ffffff',
                  fontSize: '0.9rem',
                  color: '#17324d',
                  fontWeight: 700,
                  outline: 'none'
                }}
              />
              <span style={{ fontSize: '0.72rem', color: '#9a3412', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                💡 檢測到管理員帳號：需提供金鑰或以 Google 官方帳號進行一鍵登入
              </span>
            </div>
          )}

          {errorMsg && (
            <div style={{ fontSize: '0.8rem', color: '#b91c1c', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <AlertCircle size={14} /> {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{
              padding: '13px 20px',
              borderRadius: '14px',
              fontWeight: 900,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '4px'
            }}
          >
            <span>登入並進入會考讀書網</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* 總管快速填入與設定按鈕 */}
        <div style={{ borderTop: '1px solid #f1eae0', paddingTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <button
            onClick={handleSuperAdminQuickFill}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#c8643d',
              fontSize: '0.76rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px'
            }}
          >
            👑 總管理員填入 (Jimmy)
          </button>

          <button
            onClick={() => setIsGoogleConfigModalOpen(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#78818a',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px'
            }}
          >
            ⚙️ Google Client ID 設定
          </button>
        </div>

      </div>
    </div>
  );
}
