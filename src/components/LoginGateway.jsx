import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useDevice } from '../context/DeviceContext';
import { GraduationCap, Shield, Users } from 'lucide-react';
import PrivacyPolicyModal from './PrivacyPolicyModal';

export default function LoginGateway() {
  const { triggerGoogleLogin } = useAuth();
  const { isMobile } = useDevice();
  const [showPrivacy, setShowPrivacy] = React.useState(false);

  return (
    <div 
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '16px 12px' : '24px 16px',
        background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))',
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
          background: 'var(--theme-card, var(--theme-card, #fffdf9))',
          border: '3px solid var(--theme-border, #17324d)',
          borderRadius: isMobile ? '24px' : '32px',
          boxShadow: isMobile ? '6px 6px 0px var(--theme-border, #17324d)' : '10px 10px 0px var(--theme-border, #17324d)',
          padding: isMobile ? '28px 20px' : '40px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          position: 'relative'
        }}
      >
        {/* 頂部品牌區塊 */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div 
            style={{ 
              width: '68px', 
              height: '68px', 
              borderRadius: '22px', 
              background: 'var(--theme-border, var(--theme-border, #17324d))', 
              border: '3px solid var(--theme-border, #17324d)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#f7cf68', 
              boxShadow: '4px 4px 0px var(--theme-accent, #ef8354)' 
            }}
          >
            <GraduationCap size={38} />
          </div>

          <div>
            <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 900, color: 'var(--theme-border, var(--theme-border, #17324d))', letterSpacing: '-0.02em' }}>
              讀書網
            </h1>
            <p style={{ margin: '6px 0 0 0', fontSize: '0.9rem', color: '#78818a', fontWeight: 600 }}>
              108 課綱專屬題庫・錯題加強・每週排行榜
            </p>
          </div>
        </div>

        {/* 實名制同步提示 */}
        <div 
          style={{ 
            background: '#fff0e9', 
            border: '1.5px solid var(--theme-accent, #ef8354)', 
            borderRadius: '16px', 
            padding: '12px 14px', 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: '10px' 
          }}
        >
          <Shield size={18} color="#c8643d" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div style={{ fontSize: '0.82rem', color: '#c8643d', lineHeight: 1.5, fontWeight: 700 }}>
            跨手機與電腦資料雲端漫遊！同一信箱登入，做題歷程、個人錯題本與點數永久自動同步。
          </div>
        </div>

        {/* 登入方式區塊：唯一指定 Google 官方帳號授權登入 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <button
            type="button"
            onClick={triggerGoogleLogin}
            className="btn"
            style={{
              width: '100%',
              padding: '16px 20px',
              background: '#ffffff',
              color: 'var(--theme-border, var(--theme-border, #17324d))',
              fontWeight: 900,
              fontSize: '1.05rem',
              borderRadius: '18px',
              border: '2.5px solid var(--theme-border, #17324d)',
              boxShadow: '4px 4px 0px var(--theme-border, #17324d)',
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
            <span>使用 Google 帳號授權登入</span>
          </button>

          {/* 加入群組一起討論 (LINE社群) */}
          <a
            href="https://openchat.line.me/tw/cover/qOdlVtQ0IBp7wnGg00kPYDMbjLCp8VkH6WSExq042v3oIIRaPjKtYRPSK0I?utm_source=line-openchat-seo&utm_medium=search_keyword&utm_campaign=default"
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
            style={{
              width: '100%',
              padding: '14px 20px',
              background: '#06C755',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1rem',
              borderRadius: '18px',
              border: '2.5px solid var(--theme-border, #17324d)',
              boxShadow: '4px 4px 0px var(--theme-border, #17324d)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              textDecoration: 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Users size={20} />
            <span>加入群組一起討論</span>
          </a>

          <a
            href="https://line.me/R/ti/p/@418yswmd"
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
            style={{
              width: '100%',
              padding: '14px 20px',
              background: 'var(--theme-card, var(--theme-card, #fffdf9))',
              color: '#06C755',
              fontWeight: 800,
              fontSize: '1rem',
              borderRadius: '18px',
              border: '2.5px solid #06C755',
              boxShadow: '4px 4px 0px #06C755',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              textDecoration: 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Users size={20} />
            <span>聯絡管理員</span>
          </a>

          <div style={{ background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))', border: '1.5px solid #ded3c5', borderRadius: '12px', padding: '10px 14px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#5b6772', fontWeight: 700 }}>
              💡 系統唯一登入驗證管道：使用 Google 官方授權登入，跨手機與電腦 100% 永久雲端備份做題歷程與點數。
            </span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => setShowPrivacy(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#78818a',
                fontSize: '0.78rem',
                fontWeight: 700,
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              📜 查看《使用者服務條款與隱私權保護政策》
            </button>
          </div>
        </div>
      </div>

      {showPrivacy && (
        <PrivacyPolicyModal 
          isOpen={true}
          user={null}
          onAccept={() => setShowPrivacy(false)}
          onDecline={() => setShowPrivacy(false)}
        />
      )}
    </div>
  );
}

