import React, { useState } from 'react';
import { 
  Printer, 
  Download, 
  ExternalLink, 
  FileText, 
  X, 
  CheckCircle, 
  BookOpen, 
  Share2, 
  Layers,
  Sparkles
} from 'lucide-react';
import MathText from './MathText';

export const MANUS_EXAM_DOWNLOAD_URL = 'https://examcommunit-mdqeyikj.manus.space/';

export default function PrintExamModal({ isOpen, onClose, currentQuestions = [] }) {
  const [includeExplanations, setIncludeExplanations] = useState(true);

  if (!isOpen) return null;

  const handleOpenExternalDownload = () => {
    window.open(MANUS_EXAM_DOWNLOAD_URL, '_blank', 'noopener,noreferrer');
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div 
        className="modal-card" 
        style={{ 
          maxWidth: '680px', 
          width: '95%',
          background: 'var(--theme-card, #fffdf9)',
          border: '2.5px solid var(--theme-border, #17324d)',
          borderRadius: '24px',
          boxShadow: '8px 8px 0px var(--theme-border, #17324d)',
          padding: '0',
          overflow: 'hidden'
        }}
      >
        {/* 頂部標題列 */}
        <div 
          style={{ 
            padding: '20px 24px', 
            borderBottom: '2px solid var(--theme-border, #17324d)',
            background: 'var(--theme-bg, #f8f3eb)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between' 
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'var(--theme-border, #17324d)', color: '#f7cf68', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--theme-border, #17324d)' }}>
                紙本考卷列印下載
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#78818a', fontWeight: 600 }}>
                支援前往官方下載中心下載現成 PDF 或即時輸出教育部標準紙本考卷
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="btn btn-ghost btn-icon"
            title="關閉"
          >
            <X size={20} />
          </button>
        </div>

        {/* 內容主體 */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* 1. 主推第一區：官方檔案下載中心 (直連 manus.space) */}
          <div 
            style={{ 
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', 
              border: '2px solid #3b82f6', 
              borderRadius: '18px', 
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '3px 3px 0px #3b82f6'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <span className="badge badge-indigo" style={{ background: '#2563eb', color: '#fff', fontSize: '0.75rem' }}>
                📁 官方公開檔案中心
              </span>
              <span style={{ fontSize: '0.75rem', color: '#1e40af', fontWeight: 700 }}>
                已整理 116~117 年度多份紙本 PDF
              </span>
            </div>

            <div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', fontWeight: 900, color: '#1e3a8a' }}>
                前往「紙本考卷公開檔案下載中心」
              </h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#3b82f6', lineHeight: 1.5, fontWeight: 600 }}>
                進入專屬檔案中心下載完整歷年、年度與各單元試卷 PDF，提供完整題庫與排版文件。
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenExternalDownload}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '14px 20px',
                background: '#2563eb',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '1rem',
                borderRadius: '14px',
                border: '2px solid #1e40af',
                boxShadow: '0 4px 0 #1e3a8a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <ExternalLink size={18} />
              <span>前往紙本考卷檔案中心下載 (新分頁開啟)</span>
            </button>
          </div>

          {/* 2. 第二區：即時將本站題庫輸出為 A4 標準紙本考卷 */}
          <div 
            style={{ 
              background: 'var(--theme-bg, #f8f3eb)', 
              border: '2px solid var(--theme-border, #17324d)', 
              borderRadius: '18px', 
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Printer size={18} color="var(--theme-accent, #ef8354)" />
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: 'var(--theme-border, #17324d)' }}>
                即時輸出教育部格式 A4 紙本試卷
              </h4>
            </div>

            <p style={{ margin: 0, fontSize: '0.84rem', color: '#5b6772', lineHeight: 1.6 }}>
              將目前選取或正在進行的題庫（共 {currentQuestions.length > 0 ? currentQuestions.length : 10} 題）自動排版為教育部會考雙欄紙本試卷，附准考證號、姓名欄位與標準答案解析，點擊即可直接列印或另存為 PDF。
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 800, color: 'var(--theme-border, #17324d)', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={includeExplanations} 
                  onChange={e => setIncludeExplanations(e.target.checked)} 
                  style={{ width: '16px', height: '16px' }}
                />
                卷末附詳細名師解析與破題思維
              </label>
            </div>

            <button
              type="button"
              onClick={handleTriggerPrint}
              className="btn btn-secondary"
              style={{
                width: '100%',
                padding: '12px 18px',
                fontSize: '0.92rem',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontWeight: 800
              }}
            >
              <Printer size={16} />
              <span>啟動 A4 紙本考卷格式列印 / 另存 PDF</span>
            </button>
          </div>

        </div>

        {/* 底部關閉列 */}
        <div 
          style={{ 
            padding: '14px 24px', 
            borderTop: '2px solid #ede3d5', 
            background: 'var(--theme-card, #fffdf9)',
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <button 
            type="button" 
            onClick={onClose} 
            className="btn btn-ghost"
            style={{ padding: '8px 18px', fontWeight: 700 }}
          >
            關閉視窗
          </button>
        </div>
      </div>

      {/* 列印專用隱藏區域 (Print Media Stylesheet & DOM) */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-exam-paper, #printable-exam-paper * {
            visibility: visible !important;
          }
          #printable-exam-paper {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 15mm 15mm !important;
            background: #ffffff !important;
            color: #000000 !important;
            font-family: "Noto Serif TC", "Songti TC", "SimSun", serif !important;
            display: block !important;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-before: always !important;
          }
        }
      `}</style>

      {/* A4 紙本列印容器 (僅列印時顯示) */}
      <div id="printable-exam-paper" style={{ display: 'none' }}>
        <div style={{ textAlign: 'center', borderBottom: '2.5px solid #000', paddingBottom: '12px', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '20pt', fontWeight: 900, margin: '0 0 6px 0' }}>
            108 課綱國中教育會考全真模擬紙本評量卷
          </h1>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11pt', fontWeight: 700, margin: '8px 0 0' }}>
            <span>班級：___________</span>
            <span>座號：_______</span>
            <span>姓名：_______________</span>
            <span>得分：___________</span>
          </div>
        </div>

        <div style={{ fontSize: '10pt', color: '#333', marginBottom: '14px', borderBottom: '1px dashed #666', paddingBottom: '8px' }}>
          ※ 作答說明：本試卷共 {currentQuestions.length} 題，均為四選一單一選擇題，請詳讀題意後將正確選項代碼填入題目空格中。
        </div>

        {/* 題目列表 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {currentQuestions.map((q, qIdx) => (
            <div key={q.id || qIdx} style={{ fontSize: '11pt', lineHeight: 1.6, pageBreakInside: 'avoid' }}>
              <div style={{ fontWeight: 800, marginBottom: '6px' }}>
                ({qIdx + 1}) 【{q.conceptTag || '素養題'}】{q.question}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', paddingLeft: '14px' }}>
                {q.options?.map((opt, oIdx) => (
                  <div key={oIdx}>
                    ({['A', 'B', 'C', 'D'][oIdx]}) {opt}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 答案卷與詳解 */}
        {includeExplanations && (
          <div className="page-break" style={{ marginTop: '30px', paddingTop: '16px', borderTop: '2px solid #000' }}>
            <h2 style={{ fontSize: '14pt', fontWeight: 900, textAlign: 'center', marginBottom: '12px' }}>
              標準答案與名師詳解分析
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px', background: '#f5f5f5', padding: '10px', border: '1px solid #ccc' }}>
              {currentQuestions.map((q, qIdx) => (
                <span key={qIdx} style={{ fontWeight: 800, fontSize: '10pt', minWidth: '45px' }}>
                  {qIdx + 1}. {['A', 'B', 'C', 'D'][q.answer]}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {currentQuestions.map((q, qIdx) => (
                <div key={qIdx} style={{ fontSize: '9.5pt', lineHeight: 1.5, pageBreakInside: 'avoid', borderBottom: '1px dotted #ccc', paddingBottom: '8px' }}>
                  <strong>第 {qIdx + 1} 題（標準答案：{['A', 'B', 'C', 'D'][q.answer]}）</strong>
                  {q.hint && <div>💡 思路：{q.hint}</div>}
                  <div>📖 詳解：{q.explanation}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
