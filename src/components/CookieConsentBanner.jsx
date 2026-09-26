import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, Settings, Check, X } from 'lucide-react';

export default function CookieConsentBanner({ onOpenLegalModal }) {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [allowAnalytics, setAllowAnalytics] = useState(true);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('studyhub_cookie_consent');
      if (!consent) {
        setShowBanner(true);
      }
    } catch (e) {
      setShowBanner(false);
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem('studyhub_cookie_consent', JSON.stringify({
        necessary: true,
        preferences: true,
        analytics: true,
        timestamp: Date.now()
      }));
    } catch (e) {}
    setShowBanner(false);
  };

  const handleAcceptNecessaryOnly = () => {
    try {
      localStorage.setItem('studyhub_cookie_consent', JSON.stringify({
        necessary: true,
        preferences: true,
        analytics: false,
        timestamp: Date.now()
      }));
    } catch (e) {}
    setShowBanner(false);
  };

  const handleSaveCustom = () => {
    try {
      localStorage.setItem('studyhub_cookie_consent', JSON.stringify({
        necessary: true,
        preferences: true,
        analytics: allowAnalytics,
        timestamp: Date.now()
      }));
    } catch (e) {}
    setShowBanner(false);
    setShowSettings(false);
  };

  if (!showBanner) return null;

  return (
    <aside 
      role="region" 
      aria-label="Cookie 與隱私授權偏好設定"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        right: '24px',
        maxWidth: '840px',
        margin: '0 auto',
        zIndex: 99999,
        background: 'var(--theme-card, #fffdf9)',
        border: '3px solid var(--theme-border, #17324d)',
        borderRadius: '20px',
        boxShadow: '8px 8px 0px var(--theme-border, #17324d)',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        animation: 'popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        <div 
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'var(--theme-bg, #f8f3eb)',
            border: '2px solid var(--theme-border, #17324d)',
            color: 'var(--theme-accent, #ef8354)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
          aria-hidden="true"
        >
          <Cookie size={24} />
        </div>

        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: 900, color: 'var(--theme-border, #17324d)' }}>
            🍪 我們尊重您的個人隱私與資料自主權 (Cookie & Privacy Consent)
          </h3>
          <p style={{ margin: 0, fontSize: '0.86rem', color: '#5b6772', lineHeight: 1.6, fontWeight: 600 }}>
            本讀書網使用必要型 Cookie 與本機快取以儲存您的做題進度、錯題本與防作弊偵測狀態。我們遵循台灣《個人資料保護法》及 WCAG 2.1 AA 無障礙標準，絕無置入任何商業廣告追蹤器。您可以自由選擇是否啟用匿名學科效能統計。
          </p>
        </div>
      </div>

      {/* 自訂設定區塊 (展開時呈現) */}
      {showSettings && (
        <div style={{ background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '14px', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
            <span>🔒 系統必要型 Cookie (身分驗證、題庫渲染、考試安全)</span>
            <span style={{ color: '#059669', fontSize: '0.78rem', background: '#d1fae5', padding: '2px 8px', borderRadius: '6px' }}>強制啟用</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
            <span>📊 匿名學習體驗與單元難易度優化分析</span>
            <input 
              type="checkbox" 
              checked={allowAnalytics} 
              onChange={e => setAllowAnalytics(e.target.checked)} 
              style={{ width: '18px', height: '18px', accentColor: 'var(--theme-accent, #ef8354)', cursor: 'pointer' }}
            />
          </label>
        </div>
      )}

      {/* 按鈕群組 (文案清晰無欺騙引導) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', paddingTop: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => onOpenLegalModal('cookies')}
            className="btn"
            style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '0.82rem', textDecoration: 'underline', padding: '4px 6px', cursor: 'pointer' }}
          >
            檢視 Cookie 政策全文
          </button>
          <span style={{ color: '#cbd5e1' }}>•</span>
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="btn"
            style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 6px', cursor: 'pointer' }}
          >
            <Settings size={13} />
            <span>{showSettings ? '收合設定' : '自訂 Cookie 偏好'}</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {showSettings ? (
            <button
              type="button"
              onClick={handleSaveCustom}
              className="btn btn-primary"
              style={{ padding: '8px 18px', fontSize: '0.86rem', fontWeight: 800 }}
            >
              儲存我的偏好設定
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleAcceptNecessaryOnly}
                className="btn btn-secondary"
                style={{ padding: '8px 18px', fontSize: '0.86rem', fontWeight: 800 }}
              >
                僅接受必要 Cookie
              </button>

              <button
                type="button"
                onClick={handleAcceptAll}
                className="btn btn-primary"
                style={{ padding: '8px 20px', fontSize: '0.86rem', fontWeight: 800 }}
              >
                <Check size={16} />
                <span>接受全部 Cookie</span>
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
