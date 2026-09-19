import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useDevice } from '../context/DeviceContext';
import { GraduationCap, Shield } from 'lucide-react';

export default function LoginGateway() {
  const { triggerGoogleLogin } = useAuth();
  const { isMobile } = useDevice();

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
          maxWidth: '440px',
          background: '#fffdf9',
          border: '3px solid #17324d',
          borderRadius: isMobile ? '24px' : '32px',
          boxShadow: isMobile ? '6px 6px 0px #17324d' : '10px 10px 0px #17324d',
          padding: isMobile ? '28px 20px' : '40px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          position: 'relative'
        }}
      >
        {/* 頂部品牌區塊 */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div 
            style={{ 
              width: '72px', 
              height: '72px', 
              borderRadius: '24px', 
              background: '#17324d', 
              border: '3px solid #17324d', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#f7cf68', 
              boxShadow: '4px 4px 0px #ef8354' 
            }}
          >
            <GraduationCap size={40} />
          </div>

          <div>
            <h1 style={{ margin: 0, fontSize: '1.9rem', fontWeight: 900, color: '#17324d', letterSpacing: '-0.02em' }}>
              會考讀書網
            </h1>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.92rem', color: '#78818a', fontWeight: 600 }}>
              108 課綱專屬題庫・錯題加強模式・每週排行榜
            </p>
          </div>
        </div>

        {/* 實名制同步提示 */}
        <div 
          style={{ 
            background: '#fff0e9', 
            border: '1.5px solid #ef8354', 
            borderRadius: '16px', 
            padding: '14px 16px', 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: '10px' 
          }}
        >
          <Shield size={20} color="#c8643d" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div style={{ fontSize: '0.84rem', color: '#c8643d', lineHeight: 1.5, fontWeight: 700 }}>
            系統已正式上線！本站採 Google 帳號實名制，確保跨手機與電腦的做題歷程、個人錯題本與點數永久安全同步。
          </div>
        </div>

        {/* 唯一登入方式：Google 官方授權登入 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={triggerGoogleLogin}
            className="btn"
            style={{
              width: '100%',
              padding: '16px 20px',
              background: '#ffffff',
              color: '#17324d',
              fontWeight: 900,
              fontSize: '1.05rem',
              borderRadius: '18px',
              border: '2.5px solid #17324d',
              boxShadow: '4px 4px 0px #17324d',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              transition: 'all 0.15s ease'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>使用 Google 帳號一鍵登入</span>
          </button>
          <span style={{ fontSize: '0.78rem', color: '#78818a', textAlign: 'center', fontWeight: 600 }}>
            支援手機與電腦所有瀏覽器・免輸入密碼秒登入
          </span>
        </div>
      </div>
    </div>
  );
}
