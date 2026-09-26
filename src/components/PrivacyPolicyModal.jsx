import React, { useState } from 'react';
import { ShieldCheck, Lock, BookOpen, Trophy, Sparkles, MessageSquare, Database, LogOut, CheckCircle, ExternalLink, Check } from 'lucide-react';

export const PRIVACY_POLICY_VERSION = '2.0.0';

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
            歡迎使用「<strong>讀書網</strong>」（以下簡稱本平台）。本平台為專為台灣國中會考與高中升學打造之免費無廣告教育公益平台。為了讓您能在手機、平板與電腦跨設備隨時複習、無縫同步答題歷程、錯題本與每週排行競技，本平台需要存取並處理必要的學習與帳號資料。請詳細閱讀以下由本程式實際運作涉及之所有個人資料處理項目：
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
              <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: 'var(--theme-border, var(--theme-border, #17324d))' }}>
                線上考試防作弊監控機制與公平性維護
              </h3>
            </div>
            <ul style={{ margin: '0 0 0 20px', padding: 0 }}>
              <li><strong>防作弊機制項目</strong>：作答測驗時啟用全螢幕專注監控、右鍵選單封鎖、題目複製阻擋、開發人員除錯工具與列印快捷鍵攔截、考生浮水印防翻拍、以及切換分頁／失焦頻率偵測。</li>
              <li><strong>監控使用目的</strong>：僅用於即時維護線上作答與每週排行榜之真實性與公平性。當偵測到離開作答畫面行為，系統提供即時警告（累計達 3 次自動強制收卷）。相關警告僅於本地即時比對，不作外部惡意標籤。</li>
            </ul>
          </div>

          {/* 條款 7：未成年人及兒童個人資料特別保障 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: '#f3e8ff', color: '#7e22ce', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.82rem' }}>
                7
              </div>
              <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: 'var(--theme-border, var(--theme-border, #17324d))' }}>
                未成年學子及兒童個人資料保護宣告 (COPPA & 兒少權益法)
              </h3>
            </div>
            <ul style={{ margin: '0 0 0 20px', padding: 0 }}>
              <li><strong>兒少權益最高準則</strong>：本平台使用者多為國中與國小學子，我們嚴格遵循《兒童及少年福利與權益保障法》與國際 COPPA 兒少隱私標準。</li>
              <li><strong>零商業化側寫</strong>：絕不對未成年學生進行商業消費性格分析、不投放定向廣告、亦不要求輸入電話、身分證號或家庭財務等敏感隱私。</li>
              <li><strong>法定代理人權利</strong>：家長或法定監護人可隨時透過站務管道查閱、檢驗或要求全數移除學生之作答歷程與帳戶連結。</li>
            </ul>
          </div>

          {/* 條款 8：AI 弱點診斷演算法與自適應數據安全 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: '#ecfdf5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.82rem' }}>
                8
              </div>
              <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: 'var(--theme-border, var(--theme-border, #17324d))' }}>
                AI 自適應弱點診斷與題庫數據隱私
              </h3>
            </div>
            <ul style={{ margin: '0 0 0 20px', padding: 0 }}>
              <li><strong>運算範圍限定</strong>：系統之自適應弱點診斷、專項突破派題與錯題標籤推薦，均於安全的沙盒環境運作，僅作為提升個人學習成效用途。</li>
              <li><strong>非公開模型訓練承諾</strong>：本平台鄭重聲明，絕不將學生的真實作答數據、個別錯題紀錄或對話歷程作為任何第三方公開大型語言模型（LLM）的訓練資料集。</li>
            </ul>
          </div>

          {/* 條款 9：當事人權利之行使與帳戶完全刪除 (Right to be Forgotten) */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.82rem' }}>
                9
              </div>
              <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: 'var(--theme-border, var(--theme-border, #17324d))' }}>
                當事人法律權利與帳戶完全清除權 (被遺忘權)
              </h3>
            </div>
            <ul style={{ margin: '0 0 0 20px', padding: 0 }}>
              <li><strong>查詢與下載</strong>：您可隨時於個人歷程中心檢視所有作答歷程，並支援匯出與離線紙本考卷列印。</li>
              <li><strong>即時清除快取</strong>：您可隨時透過瀏覽器或設定清除所有 LocalStorage 本機暫存數據。</li>
              <li><strong>永久銷毀帳戶</strong>：使用者或家長若欲註銷帳號，可聯繫管理團隊，我們將於 48 小時內自雲端資料庫中永久抹除您的 Email、暱稱、歷史積分與所有作答軌跡。</li>
            </ul>
          </div>

          {/* 條款 10：資安保障與零商業化法定承諾 */}
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
            本平台為 100% 專注台灣國中 108 課綱會考複習之非營利教育公益網站。全站通訊強制採用 SSL/TLS 256-bit 高規格傳輸層加密。我們鄭重承諾：<strong>絕不會將學生的任何個人資料、做題成績或聯絡信箱販售、交換或提供給任何第三方補習班、教材業務或商業廣告代理商</strong>。
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
              我已詳細閱讀、充分理解並同意遵守上述《讀書網使用者服務條款與隱私權保護政策（v2.0.0 / 2026 最新版）》，並同意本系統依法處理上述記載之必要學習作答資料。本人確認已年滿 13 歲，或已取得法定監護人之明示同意。
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
              {isSubmitting ? '正在啟用帳戶...' : '同意條款，進入讀書網！'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
