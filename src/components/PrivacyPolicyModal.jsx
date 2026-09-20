import React, { useState } from 'react';
import { ShieldCheck, Lock, BookOpen, Trophy, Sparkles, MessageSquare, Database, LogOut, CheckCircle, ExternalLink, Check } from 'lucide-react';

export const PRIVACY_POLICY_VERSION = '1.1.0';

export default function PrivacyPolicyModal({ isOpen, user, onAccept, onDecline }) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // 滾動到接近底部時自動解鎖或標記
    if (scrollHeight - scrollTop - clientHeight < 40) {
      setHasScrolledToBottom(true);
    }
  };

  const handleConfirm = () => {
    if (!isChecked) return;
    setIsSubmitting(true);
    setTimeout(() => {
      onAccept();
      setIsSubmitting(false);
    }, 300);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(23, 50, 77, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '16px'
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '92vh',
          background: 'var(--theme-card, var(--theme-card, #fffdf9))',
          border: '3px solid var(--theme-border, #17324d)',
          borderRadius: '28px',
          boxShadow: '10px 10px 0px var(--theme-border, #17324d)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'popIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* 頂部標頭 */}
        <div 
          style={{
            padding: '24px 28px 18px',
            borderBottom: '2.5px solid var(--theme-border, #17324d)',
            background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div 
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '16px',
                background: 'var(--theme-border, var(--theme-border, #17324d))',
                color: '#f7cf68',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--theme-border, #17324d)',
                boxShadow: '3px 3px 0px var(--theme-accent, #ef8354)',
                flexShrink: 0
              }}
            >
              <ShieldCheck size={28} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontSize: '1.28rem', fontWeight: 900, color: 'var(--theme-border, var(--theme-border, #17324d))' }}>
                  使用者條款與個人資料保護政策
                </h2>
                <span 
                  style={{
                    fontSize: '0.72rem',
                    background: '#e0f2fe',
                    color: '#0369a1',
                    padding: '2px 8px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    border: '1px solid #bae6fd'
                  }}
                >
                  v{PRIVACY_POLICY_VERSION} 規範
                </span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#5b6772', fontWeight: 600 }}>
                初次登入確認・為了保障您的學習權益與資料安全，請詳細閱讀並同意下方規範
              </p>
            </div>
          </div>
        </div>

        {/* 登入身分核對 */}
        {user && (
          <div 
            style={{
              padding: '10px 28px',
              background: '#fff0e9',
              borderBottom: '1.5px solid #fed7aa',
              fontSize: '0.84rem',
              color: '#9a3412',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>👤 當前授權登入帳戶：<strong>{user.displayName || user.name || '同學'}</strong> ({user.email})</span>
            <span style={{ fontSize: '0.76rem', color: '#c2410c' }}>108 課綱專屬帳號</span>
          </div>
        )}

        {/* 條款內容滾動區塊 */}
        <div 
          onScroll={handleScroll}
          style={{
            padding: '24px 28px',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            fontSize: '0.9rem',
            lineHeight: 1.75,
            color: '#334155'
          }}
        >
          {/* 前言導言 */}
          <div 
            style={{
              background: '#f8fafc',
              border: '1.5px solid #cbd5e1',
              borderRadius: '16px',
              padding: '16px 18px',
              fontSize: '0.86rem'
            }}
          >
            <strong>親愛的會考戰友與家長您好：</strong><br />
            歡迎使用「<strong>108 課綱國中全科學習網</strong>」（以下簡稱本平台）。本平台為專為台灣國中會考打造之免費無廣告教育公益平台。為了讓您能在手機、平板與電腦跨設備隨時複習、無縫同步答題歷程、錯題本與每週排行競技，本平台需要存取並處理必要的學習與帳號資料。請詳細閱讀以下由本程式實際運作涉及之所有個人資料處理項目：
          </div>

          {/* 條款 1：Google 帳號資訊 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.82rem' }}>
                1
              </div>
              <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: 'var(--theme-border, var(--theme-border, #17324d))' }}>
                Google 帳戶資訊存取與身分識別
              </h3>
            </div>
            <ul style={{ margin: '0 0 0 20px', padding: 0 }}>
              <li><strong>收集項目</strong>：Google 授權之 Email 電子郵件地址、公開顯示名稱（Display Name）、Google 官方頭像網址。</li>
              <li><strong>使用目的</strong>：建立學生確定性唯一 ID、驗證總管理員／學科管理員管理身分、防止惡意洗榜、於每週榮譽榜呈現頭像與暱稱。</li>
              <li><strong>安全承諾</strong>：本平台絕無權限亦絕不存取您的 Google 登入密碼、聯絡人清單、Google Drive 檔案或任何其他個人隱私。</li>
            </ul>
          </div>

          {/* 條款 2：測驗作答數據與歷程紀錄 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.82rem' }}>
                2
              </div>
              <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: 'var(--theme-border, var(--theme-border, #17324d))' }}>
                學科做題與測驗歷程紀錄
              </h3>
            </div>
            <ul style={{ margin: '0 0 0 20px', padding: 0 }}>
              <li><strong>收集項目</strong>：練習之學科（國/英/數/自/社）、年級單元代碼、題目題號、作答選項、正誤判斷（isCorrect）、單題耗時秒數、交卷時間戳。</li>
              <li><strong>使用目的</strong>：統計「每日 10 題達標進度」、計算各科單元正確率、產生做題歷程供同學回顧複習、以及供系統總管監控各學科題庫鑑別度。</li>
              <li><strong>保存上限</strong>：本地自動保留最新 500 筆輕量化精準紀錄，杜絕佔用學生手機與電腦儲存容量。</li>
            </ul>
          </div>

          {/* 條款 3：個人化錯題本強化系統 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: '#fee2e2', color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.82rem' }}>
                3
              </div>
              <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: 'var(--theme-border, var(--theme-border, #17324d))' }}>
                智慧錯題本與弱點加強資料
              </h3>
            </div>
            <ul style={{ margin: '0 0 0 20px', padding: 0 }}>
              <li><strong>收集項目</strong>：學生答錯之題目題目內文、核心概念標籤（conceptTag）、錯誤歷史次數、加強掌握狀態。</li>
              <li><strong>使用目的</strong>：自動歸納「錯題加強模式」，提供智能抽題補強，直到完全掌握觀念後自動移出錯題本。</li>
            </ul>
          </div>

          {/* 條款 4：排行榜競技與抽獎遊戲化系統 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.82rem' }}>
                4
              </div>
              <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: 'var(--theme-border, var(--theme-border, #17324d))' }}>
                每週排行榜、積分與抽獎狀態
              </h3>
            </div>
            <ul style={{ margin: '0 0 0 20px', padding: 0 }}>
              <li><strong>收集項目</strong>：當週累積競賽積分（每答對 1 題 = 1 點）、歷史總點數、每日簽到日期、幸運抽獎券數量、50 抽必中金色大獎保底計數（pityCount）、加倍積分 Buff 倒數時限。</li>
              <li><strong>規則公約</strong>：排行榜每週一 00:00:00 (台北時區 UTC+8) 自動歸零結算，前三名榮登名人堂。系統設有反作弊頻率監控（最高 8 次/秒、單題上限），嚴禁任何外掛或腳本洗分。</li>
            </ul>
          </div>

          {/* 條款 5：多裝置雲端即時漫遊與本機快取 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: '#ffedd5', color: '#c2410c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.82rem' }}>
                5
              </div>
              <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: 'var(--theme-border, var(--theme-border, #17324d))' }}>
                跨端雲端同步與本機儲存 (LocalStorage)
              </h3>
            </div>
            <ul style={{ margin: '0 0 0 20px', padding: 0 }}>
              <li><strong>運作機制</strong>：本平台採用 Firebase Realtime Database 官方雲端資料庫與瀏覽器 LocalStorage 快取技術。</li>
              <li><strong>漫遊保障</strong>：當您更換裝置或在手機與筆電間切換時，所有作答歷史、抽獎券與目標進度將自動完成雙向安全同步，杜絕跨端遺失。</li>
            </ul>
          </div>

          {/* 條款 6：防作弊與安全監控機制 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.82rem' }}>
                6
              </div>
              <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: 'var(--theme-border, #17324d)' }}>
                考試防作弊與系統安全監控
              </h3>
            </div>
            <ul style={{ margin: '0 0 0 20px', padding: 0 }}>
              <li><strong>收集項目與行為</strong>：監控滑鼠點擊行為（禁用右鍵/反白/拖曳）、鍵盤快捷鍵使用狀況（封鎖開發人員工具與列印）、以及瀏覽器分頁切換頻率。</li>
              <li><strong>使用目的</strong>：維持平台考試公平性。當系統偵測到異常切換分頁等可能作弊之行為，將自動給予警告，屢勸不聽者系統將強制中斷考試並沒收測驗。</li>
            </ul>
          </div>

          {/* 條款 7：資安保障與零商業化承諾 */}
          <div 
            style={{
              background: '#f0fdf4',
              border: '1.5px solid #86efac',
              borderRadius: '16px',
              padding: '16px 18px',
              fontSize: '0.86rem',
              color: '#166534',
              marginTop: '10px'
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '0.94rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={16} /> 資訊安全保護與「零商業廣告」法定承諾
            </div>
            本平台為 100% 專注教育公益與會考複習之學習網站。全站通訊強制採用 SSL/TLS 傳輸層安全加密。我們鄭重承諾：<strong>絕不會將學生的任何個人資料、做題成績或聯絡信箱販售、交換或提供給任何第三方補習班、教材業務或廣告代理商</strong>。
          </div>
        </div>

        {/* 底部行動與強制勾選區 */}
        <div 
          style={{
            padding: '18px 28px',
            borderTop: '2.5px solid var(--theme-border, #17324d)',
            background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          {/* 強制勾選欄位 */}
          <label 
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              cursor: 'pointer',
              userSelect: 'none',
              fontSize: '0.88rem',
              fontWeight: 700,
              color: 'var(--theme-border, var(--theme-border, #17324d))'
            }}
          >
            <input 
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              style={{
                width: '18px',
                height: '18px',
                accentColor: 'var(--theme-accent, var(--theme-accent, #ef8354))',
                cursor: 'pointer',
                marginTop: '2px'
              }}
            />
            <span>
              我已詳細閱讀、充分理解並同意遵守上述《108 課綱會考學習網使用者服務條款與隱私權保護政策》，並同意本系統處理上述記載之必要學習作答資料。
            </span>
          </label>

          {/* 按鈕組 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={onDecline}
              className="btn btn-secondary"
              style={{ padding: '10px 20px', fontSize: '0.88rem', color: '#5b6772' }}
            >
              <LogOut size={16} />
              不同意並登出
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={!isChecked || isSubmitting}
              className="btn btn-primary"
              style={{
                padding: '12px 28px',
                fontSize: '0.98rem',
                fontWeight: 900,
                opacity: isChecked ? 1 : 0.5,
                cursor: isChecked ? 'pointer' : 'not-allowed',
                boxShadow: isChecked ? '4px 4px 0px var(--theme-border, #17324d)' : 'none'
              }}
            >
              <Check size={18} />
              {isSubmitting ? '正在啟用帳戶...' : '同意條款，進入學習網！'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
