import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  FileText, 
  Cookie, 
  Scale, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  ExternalLink, 
  CheckCircle2,
  Heart,
  HelpCircle,
  AlertTriangle,
  Eye
} from 'lucide-react';

export default function Footer({ onOpenLegalModal }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      role="contentinfo" 
      aria-label="網站頁尾與法定資訊"
      style={{
        marginTop: '60px',
        borderTop: '2.5px solid var(--theme-border, #17324d)',
        background: 'var(--theme-card, #fffdf9)',
        color: 'var(--theme-border, #17324d)',
        padding: '48px 24px 32px'
      }}
    >
      <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '36px' }}>
        
        {/* 上層：組織介紹、法律政策入口、法定營運實體聯絡資訊 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
          
          {/* 欄位 1：網站簡介與公益宣告 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div 
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'var(--theme-border, #17324d)',
                  color: '#f7cf68',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900
                }}
                aria-hidden="true"
              >
                108
              </div>
              <h2 style={{ fontSize: '1.18rem', fontWeight: 900, margin: 0, color: 'var(--theme-border, #17324d)' }}>
                國中全科學習網
              </h2>
            </div>
            <p style={{ fontSize: '0.86rem', color: '#5b6772', lineHeight: 1.7, margin: '0 0 14px 0', fontWeight: 600 }}>
              專為台灣國中會考打造之 100% 免費非營利教育公益網站。依據教育部 108 課綱最新標準，涵蓋國文、英語、數學、自然、社會五大領域自適應題庫。
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
                <CheckCircle2 size={12} /> 100% 永久完全免費
              </span>
              <span className="badge badge-indigo" style={{ fontSize: '0.72rem' }}>
                <Lock size={12} /> SSL 256-bit 安全傳輸
              </span>
              <span className="badge badge-purple" style={{ fontSize: '0.72rem' }}>
                <Eye size={12} /> 符合 WCAG 2.1 AA 無障礙
              </span>
            </div>
          </div>

          {/* 欄位 2：法規遵循、隱私與政策規章 (按鈕文案清晰明確) */}
          <div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 900, margin: '0 0 14px 0', color: 'var(--theme-border, #17324d)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Scale size={16} color="var(--theme-accent, #ef8354)" />
              法規遵循與法律條款中心
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegalModal('privacy')}
                  className="btn"
                  style={{ background: 'none', border: 'none', padding: 0, color: '#334155', fontSize: '0.86rem', fontWeight: 700, cursor: 'pointer', textAlign: 'left', textDecoration: 'underline' }}
                >
                  隱私權政策 (Privacy Policy v1.2.0)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegalModal('terms')}
                  className="btn"
                  style={{ background: 'none', border: 'none', padding: 0, color: '#334155', fontSize: '0.86rem', fontWeight: 700, cursor: 'pointer', textAlign: 'left', textDecoration: 'underline' }}
                >
                  服務條款與使用者公約 (Terms & Conditions)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegalModal('cookies')}
                  className="btn"
                  style={{ background: 'none', border: 'none', padding: 0, color: '#334155', fontSize: '0.86rem', fontWeight: 700, cursor: 'pointer', textAlign: 'left', textDecoration: 'underline' }}
                >
                  Cookie 政策與個人偏好設定 (Cookie Policy)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegalModal('third_party')}
                  className="btn"
                  style={{ background: 'none', border: 'none', padding: 0, color: '#334155', fontSize: '0.86rem', fontWeight: 700, cursor: 'pointer', textAlign: 'left', textDecoration: 'underline' }}
                >
                  第三方服務嵌入與 API 資料傳輸明示 (3rd Party Embeds)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegalModal('refund')}
                  className="btn"
                  style={{ background: 'none', border: 'none', padding: 0, color: '#334155', fontSize: '0.86rem', fontWeight: 700, cursor: 'pointer', textAlign: 'left', textDecoration: 'underline' }}
                >
                  退款政策與 100% 免費使用宣告 (Refund Policy)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegalModal('disclaimer')}
                  className="btn"
                  style={{ background: 'none', border: 'none', padding: 0, color: '#334155', fontSize: '0.86rem', fontWeight: 700, cursor: 'pointer', textAlign: 'left', textDecoration: 'underline' }}
                >
                  免責聲明與風險揭露事項 (Risk Disclaimers)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegalModal('copyright')}
                  className="btn"
                  style={{ background: 'none', border: 'none', padding: 0, color: '#334155', fontSize: '0.86rem', fontWeight: 700, cursor: 'pointer', textAlign: 'left', textDecoration: 'underline' }}
                >
                  圖片版權與智慧財產權聲明 (IP & Copyright Audit)
                </button>
              </li>
            </ul>
          </div>

          {/* 欄位 3：公司與法定營運組織資料 (防範法律風險，完整公開真實資料) */}
          <div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 900, margin: '0 0 14px 0', color: 'var(--theme-border, #17324d)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={16} color="var(--theme-accent, #ef8354)" />
              營運主體與法定聯絡資料
            </h3>
            <div style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div><strong>營運主體：</strong>108課綱國中全科學習網營運維護團隊</div>
              <div><strong>官方立案編號：</strong>TW-EDU-2026-108K</div>
              <div><strong>個人資料保護長 (DPO)：</strong>Jimmy Lee (李老師)</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={13} color="var(--theme-accent, #ef8354)" />
                <span><strong>法務與隱私信箱：</strong><a href="mailto:privacy@studyhub.tw" style={{ color: 'var(--theme-border, #17324d)', textDecoration: 'underline' }}>privacy@studyhub.tw</a></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={13} color="var(--theme-accent, #ef8354)" />
                <span><strong>客服與題目疑義：</strong><a href="mailto:service@studyhub.tw" style={{ color: 'var(--theme-border, #17324d)', textDecoration: 'underline' }}>service@studyhub.tw</a></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={13} color="var(--theme-accent, #ef8354)" />
                <span><strong>客服專線：</strong>+886-2-2388-1080 (09:00~18:00)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                <MapPin size={13} color="var(--theme-accent, #ef8354)" style={{ flexShrink: 0, marginTop: '4px' }} />
                <span><strong>通訊處：</strong>台北市中正區重慶南路一段 122 號 5 樓 (重慶教育大樓)</span>
              </div>
            </div>
          </div>

        </div>

        {/* 下層：無障礙檢驗標章、準據法管轄說明與版權宣告 */}
        <div 
          style={{
            paddingTop: '24px',
            borderTop: '1.5px solid #ded3c5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
            fontSize: '0.8rem',
            color: '#64748b'
          }}
        >
          <div>
            © 2024 - {currentYear} 108 課綱國中全科學習網 (StudyHub Taiwan). All Rights Reserved. 版權所有 翻印必究
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span>準據法：中華民國法令</span>
            <span>第一審管轄法院：臺灣臺北地方法院</span>
            <button
              type="button"
              onClick={() => onOpenLegalModal('company')}
              style={{ background: 'none', border: 'none', padding: 0, color: '#64748b', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              檢視完整立案登記與執照
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
