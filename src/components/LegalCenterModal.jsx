import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Lock, 
  Cookie, 
  DollarSign, 
  ExternalLink, 
  AlertTriangle, 
  X, 
  Check, 
  Info,
  Scale
} from 'lucide-react';

export default function LegalCenterModal({ isOpen, onClose, initialTab = 'privacy' }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  if (!isOpen) return null;

  const tabs = [
    { id: 'privacy', label: '隱私權政策', icon: ShieldCheck },
    { id: 'terms', label: '服務條款 (T&C)', icon: FileText },
    { id: 'cookies', label: 'Cookie 政策', icon: Cookie },
    { id: 'third_party', label: '第三方嵌入與傳輸', icon: ExternalLink },
    { id: 'refund', label: '退款與免費政策', icon: DollarSign },
    { id: 'disclaimer', label: '免責與風險聲明', icon: AlertTriangle },
    { id: 'copyright', label: '圖片與智財權', icon: Scale },

  ];

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
        zIndex: 999999,
        padding: '16px'
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: '92vh',
          background: 'var(--theme-card, #fffdf9)',
          border: '3px solid var(--theme-border, #17324d)',
          borderRadius: '24px',
          boxShadow: '10px 10px 0px var(--theme-border, #17324d)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'popIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* 頂部 Header */}
        <div 
          style={{
            padding: '18px 24px',
            borderBottom: '2.5px solid var(--theme-border, #17324d)',
            background: 'var(--theme-bg, #f8f3eb)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div 
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'var(--theme-border, #17324d)',
                color: '#f7cf68',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Scale size={22} />
            </div>
            <div>
              <h2 id="legal-modal-title" style={{ margin: 0, fontSize: '1.18rem', fontWeight: 900, color: 'var(--theme-border, #17324d)' }}>
                法律遵循、隱私權與條款規範中心
              </h2>
              <span style={{ fontSize: '0.76rem', color: '#5b6772', fontWeight: 600 }}>
                遵循中華民國《個人資料保護法》、《兒少權益保障法》與 WCAG 2.1 AA 無障礙標準 (2026 最新版)
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="關閉條款視窗"
            className="btn btn-secondary"
            style={{ padding: '6px', borderRadius: '10px', minWidth: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 頁籤選單 (支援鍵盤 Tab 與清楚按鈕) */}
        <div 
          style={{
            display: 'flex',
            gap: '6px',
            padding: '10px 18px',
            background: '#f1f5f9',
            borderBottom: '1.5px solid #cbd5e1',
            overflowX: 'auto',
            flexShrink: 0
          }}
          role="tablist"
        >
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  borderRadius: '12px',
                  border: isActive ? '2px solid var(--theme-border, #17324d)' : '1px solid #cbd5e1',
                  background: isActive ? 'var(--theme-card, #fffdf9)' : '#ffffff',
                  color: isActive ? 'var(--theme-border, #17324d)' : '#64748b',
                  boxShadow: isActive ? '2px 2px 0px var(--theme-border, #17324d)' : 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={14} color={isActive ? 'var(--theme-accent, #ef8354)' : '#64748b'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 條款內容滾動主體 */}
        <div 
          style={{
            padding: '24px 28px',
            overflowY: 'auto',
            flex: 1,
            fontSize: '0.88rem',
            lineHeight: 1.8,
            color: '#334155'
          }}
          tabIndex={0}
        >
          {/* 1. 隱私權政策 */}
          {activeTab === 'privacy' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '14px', padding: '14px 18px', color: '#166534', fontWeight: 600 }}>
                🛡️ <strong>隱私權政策宣告 (版本 1.2.0 / 2026 修訂版)</strong><br />
                本平台遵循中華民國《個人資料保護法》(PDPA) 及國際 COPPA 兒童線上隱私保護規範，承諾零商業廣告、不將資料外流販售。
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--theme-border, #17324d)', margin: '10px 0 4px' }}>一、個人資料蒐集之目的與類別</h3>
              <p>我們僅基於教育輔助、成績統計與排行榜競賽之目的，蒐集您授權 Google 登入提供之 Email 信箱、公開姓名、頭像以及作答正誤歷程與錯題標籤。絕不存取您的 Google 密碼或通訊錄。</p>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--theme-border, #17324d)', margin: '10px 0 4px' }}>二、未成年兒少保護宣告 (兒少權益法)</h3>
              <p>本站使用者多為國中與國小學生。我們保證不對未成年人進行商業肖像或性格側寫分析，家長可隨時聯繫本會要求查閱或永久刪除學生帳號紀錄。</p>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--theme-border, #17324d)', margin: '10px 0 4px' }}>三、當事人權利 (被遺忘權)</h3>
              <p>您可行使查閱、製給複製本、更正及請求刪除個人資料之權利。隨時可於本機清除 LocalStorage 快取或聯絡管理員銷毀雲端紀錄。</p>
            </div>
          )}

          {/* 2. 服務條款 T&C */}
          {activeTab === 'terms' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--theme-border, #17324d)', margin: '4px 0' }}>一、服務條款之認知與接受</h3>
              <p>歡迎使用「學習網」（以下簡稱本平台）。當您使用本平台所提供之任何服務時，即表示您已充分閱讀、理解並同意接受本服務條款之所有規範。</p>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--theme-border, #17324d)', margin: '10px 0 4px' }}>二、使用者行為規範與違約限制</h3>
              <ul style={{ margin: '0 0 0 20px', padding: 0 }}>
                <li>嚴禁以自動化腳本、爬蟲、外掛軟體進行非正常頻率之作答、洗榜或干擾伺服器運作。</li>
                <li>嚴禁意圖逆向反編譯、破解或複製本站題庫與自適應演算法架構。</li>
                <li>測驗時應遵守誠信原則，若經系統偵測持續惡意翻拍、切換分頁作弊，管理團隊得取消榮譽排行榜資格。</li>
              </ul>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--theme-border, #17324d)', margin: '10px 0 4px' }}>三、智慧財產權聲明</h3>
              <p>本平台所包含之軟體程式、介面編排、演算法題庫及講義解析，其智慧財產權均受中華民國著作權法及相關專利商標法令保護。</p>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--theme-border, #17324d)', margin: '10px 0 4px' }}>四、準據法與管轄法院</h3>
              <p>本服務條款之解釋與適用，均以中華民國法令為準據法。因本契約所生之爭議，雙方合意以臺灣臺北地方法院為第一審管轄法院。</p>
            </div>
          )}

          {/* 3. Cookie 政策 */}
          {activeTab === 'cookies' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--theme-border, #17324d)', margin: '4px 0' }}>一、什麼是 Cookie 與本地儲存 (LocalStorage)？</h3>
              <p>Cookie 與 LocalStorage 是網站暫存於您瀏覽器的小型資料檔案，用於記住您的登入身分、夜間模式主題偏好、錯題本離線快取及作答進度。</p>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--theme-border, #17324d)', margin: '10px 0 4px' }}>二、本平台使用的 Cookie 類別</h3>
              <ul style={{ margin: '0 0 0 20px', padding: 0 }}>
                <li><strong>必要型 Cookie (Strictly Necessary)</strong>：維持系統安全運作、身分驗證與防作弊偵測所必須，無法手動關閉。</li>
                <li><strong>功能與偏好儲存 (Preference & LocalStorage)</strong>：記錄個人化題庫字級大小、深色主題配色、草稿筆記內容。</li>
                <li><strong>匿名效能分析 (Anonymous Analytics)</strong>：用於統計單元做題鑑別度與系統載入速度，絕不追蹤您的個人身分。</li>
              </ul>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--theme-border, #17324d)', margin: '10px 0 4px' }}>三、如何管理您的 Cookie？</h3>
              <p>您可以隨時透過瀏覽器設定清除或阻擋 Cookie，亦可在本站頁尾隨時點選「Cookie 設定」重新調整授權意願。</p>
            </div>
          )}

          {/* 4. 第三方嵌入與傳輸 */}
          {activeTab === 'third_party' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '14px', padding: '14px 18px' }}>
                🔗 <strong>第三方服務嵌入與 API 資料傳輸明示聲明 (3rd Party Embeds)</strong><br />
                為提供高可靠性之教育科技功能，本平台整合了以下業界標準之受信任第三方技術合作夥伴：
              </div>
              <ul style={{ margin: '0 0 0 20px', padding: 0 }}>
                <li><strong>Google Cloud & Firebase</strong> (實體：Google LLC)：提供安全的使用者 OAuth 2.0 登入與 Realtime Database 實時雲端資料漫遊儲存。伺服器傳輸均受 TLS 256-bit 加密。</li>
                <li><strong>KaTeX CDN</strong> (實體：Khan Academy 開源團隊 / Cloudflare CDN)：提供教育部規格之高速 LaTeX 數學幾何符號渲染，僅載入公開字型檔案，不涉及個資傳輸。</li>
                <li><strong>EmailJS</strong> (實體：EmailJS Inc.)：當使用者主動點擊「疑義題目回報」時，透過其安全 API 背景發送通報信件予學科管理組。</li>
              </ul>
              <p style={{ marginTop: '8px', fontSize: '0.82rem', color: '#64748b' }}>
                本平台絕無嵌入任何 Meta/Facebook Pixel、TikTok 像素或未經宣告之第三方商業聯播網廣告追蹤器。
              </p>
            </div>
          )}

          {/* 5. 退款與免費政策 */}
          {activeTab === 'refund' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#ecfdf5', border: '1.5px solid #a7f3d0', borderRadius: '14px', padding: '14px 18px', color: '#065f46', fontWeight: 600 }}>
                💡 <strong>100% 免費公益教育平台與退款宣告 (Refund Policy)</strong>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--theme-border, #17324d)', margin: '4px 0' }}>一、永久免費使用宣告</h3>
              <p>本平台所有功能——包括 108 課綱國中五科全題庫刷題、自適應弱點診斷、專項突破、錯題本、排行榜競技與 A4 雙欄紙本試卷列印，<strong>皆「100% 永久完全免費」向全國學子及家長開放</strong>，絕無任何強制收費或訂閱門檻。</p>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--theme-border, #17324d)', margin: '10px 0 4px' }}>二、遊戲化虛擬道具之法律性質</h3>
              <p>站內所提供之「幸運抽獎券」、「答題積分」、「連勝雙倍 Buff」及榮譽稱號，純屬提升學習動機之遊戲化激勵機制，非真實貨幣亦非電子代幣，不可折換現金、不可轉讓，亦不開放任何法幣儲值交易。</p>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--theme-border, #17324d)', margin: '10px 0 4px' }}>三、自願性公益捐贈之退款規範</h3>
              <p>若未來開放自願性公益贊助以支持伺服器託管費用，將依中華民國《公益勸募條例》開立正式收據，若發生重複扣款或誤刷，捐助人得於 14 日內提出申請，我們將無條件全額退費。</p>
            </div>
          )}

          {/* 6. 免責與風險聲明 */}
          {activeTab === 'disclaimer' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '14px', padding: '14px 18px', color: '#991b1b', fontWeight: 600 }}>
                ⚠️ <strong>法律責任限制與風險免責揭露 (Disclaimer & Risk Disclosure)</strong>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--theme-border, #17324d)', margin: '4px 0' }}>一、會考與大考非官方附屬宣告</h3>
              <p>本平台為民間教育科技研究團隊自主維護之公益學習網站，非教育部國民及學前教育署、心測中心或任何官方升學大考機構。網站內之「會考等第推估」、「模擬分數」僅作為考生自主練習時之實力指標，不保證正式會考之落點結果。</p>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--theme-border, #17324d)', margin: '10px 0 4px' }}>二、演算法題目生成準確度提示</h3>
              <p>題庫包含自適應演算法動態衍生之素養變換題與破題解法。雖然管理組每日持續校驗，但文字描述若有少數勘誤，歡迎透過「題目疑義回報」功能指正，本會不承擔因練習答錯衍生之非本站直接相關責任。</p>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--theme-border, #17324d)', margin: '10px 0 4px' }}>三、網路與伺服器中斷風險</h3>
              <p>因電信端設備故障、天災或不可抗力之雲端伺服器短暫維護造成作答暫時中斷，本平台將盡速修復，但不對資料遺失承擔額外賠償責任。</p>
            </div>
          )}

          {/* 7. 圖片與智財權 */}
          {activeTab === 'copyright' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--theme-border, #17324d)', margin: '4px 0' }}>一、圖片版權與字型授權檢驗宣告 (Image Copyright Audit)</h3>
              <p>本站對於智慧財產權採取最高規格合規標準：</p>
              <ul style={{ margin: '0 0 0 20px', padding: 0 }}>
                <li><strong>開源授權圖標</strong>：全站圖示全面使用由 Lucide 專案所發布之 MIT License 開源圖標庫，具備完整合法商用與非商用授權。</li>
                <li><strong>100% 原生幾何引擎</strong>：數學與理化考題圖形（直角坐標系、幾何三角形、圓弧、透鏡光路）皆由 HTML5 Canvas 與 SVG 程式碼即時幾何繪製，絕非坊間講義之掃描翻拍，無任何著作權侵害風險。</li>
                <li><strong>Google 官方大頭貼</strong>：排行榜與個人資料僅呈現使用者 Google 帳號授權之公開頭像，本站無改作亦未作外部銷售。</li>
              </ul>
            </div>
          )}


        </div>

        {/* 底部按鈕區 (文案清晰，避免歧義) */}
        <div 
          style={{
            padding: '16px 24px',
            borderTop: '2.5px solid var(--theme-border, #17324d)',
            background: 'var(--theme-bg, #f8f3eb)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
            若對條款規範有任何疑問，請透過本站提供之聯繫管道與我們聯絡。
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-primary"
            style={{ padding: '10px 24px', fontSize: '0.92rem', fontWeight: 900 }}
          >
            <Check size={16} />
            <span>我已閱讀並理解所有條款規範</span>
          </button>
        </div>
      </div>
    </div>
  );
}
