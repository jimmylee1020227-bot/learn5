import React, { useMemo } from 'react';
import { 
  Printer, 
  ExternalLink, 
  FileText, 
  X, 
  CheckCircle, 
  Layers
} from 'lucide-react';
import MathText from './MathText';
import { generateQuizSet } from '../data/questionGenerator';

export const MANUS_EXAM_DOWNLOAD_URL = 'https://examcommunit-mdqeyikj.manus.space/';

export default function PrintExamModal({ isOpen, onClose, currentQuestions = [] }) {
  // 自動偵測或預設產生 10 題教育部標準會考題庫
  const finalQuestions = useMemo(() => {
    if (currentQuestions && currentQuestions.length > 0) {
      return currentQuestions;
    }
    return generateQuizSet({
      gradeId: 'g8',
      subjectId: 'math',
      unitIds: ['g8-m-u1', 'g8-m-u2', 'g8-m-u3', 'g8-m-u4'],
      difficulty: 'medium',
      count: 10
    });
  }, [currentQuestions]);

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
              將目前選取或正在進行的題庫（共 {finalQuestions.length} 題）自動排版為教育部會考雙欄紙本試卷，附准考證號、姓名欄位與標準答案解析，點擊即可直接列印或另存為 PDF。
            </p>

            <button
              type="button"
              onClick={handleTriggerPrint}
              className="btn btn-secondary"
              style={{
                width: '100%',
                padding: '12px 18px',
                fontSize: '0.95rem',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontWeight: 800,
                background: '#fff',
                color: 'var(--theme-border, #17324d)',
                border: '2px solid var(--theme-border, #17324d)',
                boxShadow: '3px 3px 0 var(--theme-border, #17324d)',
                cursor: 'pointer'
              }}
            >
              <Printer size={18} />
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
          @page {
            size: A4 portrait;
            margin: 12mm 12mm;
          }
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
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            font-family: "Times New Roman", "Songti TC", "Noto Serif TC", serif !important;
            display: block !important;
          }
          .exam-two-column {
            column-count: 2 !important;
            column-gap: 12mm !important;
            column-rule: 1px solid #222222 !important;
          }
          .exam-q-item {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            margin-bottom: 15px !important;
          }
        }
      `}</style>

      {/* A4 紙本列印容器 (僅列印時顯示，雙欄教育部會考規格) */}
      <div id="printable-exam-paper" style={{ display: 'none' }}>
        {/* 試卷頭部資訊 */}
        <div style={{ textAlign: 'center', borderBottom: '2.5px solid #000', paddingBottom: '10px', marginBottom: '12px' }}>
          <div style={{ fontSize: '11pt', fontWeight: 700, letterSpacing: '2px', marginBottom: '2px' }}>
            教育部 108 課綱國中教育會考模擬評量
          </div>
          <h1 style={{ fontSize: '18pt', fontWeight: 900, margin: '0 0 8px 0', letterSpacing: '1px' }}>
            學力檢測全真紙本試卷
          </h1>
          
          {/* 准考證號碼與考生個人資訊欄位 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10pt', fontWeight: 700, padding: '4px 0', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>准考證號碼：</span>
              <div style={{ display: 'flex', gap: '3px' }}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} style={{ width: '18px', height: '22px', border: '1.5px solid #000', textAlign: 'center', fontSize: '10pt', lineHeight: '20px' }}></div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <span>班級：___________</span>
              <span>座號：_______</span>
              <span>姓名：_______________</span>
              <span>得分：___________</span>
            </div>
          </div>
        </div>

        {/* 作答說明提示 */}
        <div style={{ fontSize: '9pt', color: '#111', marginBottom: '12px', border: '1px solid #333', padding: '5px 10px', background: '#fafafa', lineHeight: 1.4 }}>
          <strong>【作答說明】</strong>本試卷共 {finalQuestions.length} 題，均為四選一單一選擇題，請詳讀題意後選出一個最適當的答案。計算過程請多加利用試卷空白處，並將各題答案填入卷末標準答案卡中。
        </div>

        {/* 雙欄教育部會考題目排版 */}
        <div className="exam-two-column">
          {finalQuestions.map((q, qIdx) => (
            <div key={q.id || qIdx} className="exam-q-item" style={{ fontSize: '10.5pt', lineHeight: 1.55 }}>
              <div style={{ fontWeight: 800, marginBottom: '5px' }}>
                <span>({qIdx + 1}) </span>
                <MathText text={q.question} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px', paddingLeft: '10px' }}>
                {q.options?.map((opt, oIdx) => (
                  <div key={oIdx} style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontWeight: 700 }}>({['A', 'B', 'C', 'D'][oIdx]})</span>
                    <span><MathText text={opt} /></span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 卷末標準答案卡速查表 */}
        <div style={{ marginTop: '20px', paddingTop: '10px', borderTop: '2px solid #000', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
          <div style={{ fontSize: '10.5pt', fontWeight: 900, textAlign: 'center', marginBottom: '6px' }}>
            —— 108 課綱國中教育會考 標準答案卡速查 ——
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '10pt' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ border: '1px solid #000', padding: '4px 6px' }}>題號</th>
                {finalQuestions.map((_, i) => (
                  <th key={i} style={{ border: '1px solid #000', padding: '4px 6px' }}>{i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #000', padding: '5px 6px', fontWeight: 800, background: '#fafafa' }}>標準答案</td>
                {finalQuestions.map((q, i) => (
                  <td key={i} style={{ border: '1px solid #000', padding: '5px 6px', fontWeight: 900, fontSize: '11pt' }}>
                    {['A', 'B', 'C', 'D'][q.answer]}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
