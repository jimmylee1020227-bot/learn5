import React, { useState } from 'react';
import { 
  ExternalLink, 
  FileText, 
  X, 
  Copy, 
  Check, 
  Download,
  FolderOpen
} from 'lucide-react';

export const MANUS_EXAM_DOWNLOAD_URL = 'https://examcommunit-mdqeyikj.manus.space/';

export default function PrintExamModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleOpenExternalDownload = () => {
    window.open(MANUS_EXAM_DOWNLOAD_URL, '_blank', 'noopener,noreferrer');
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(MANUS_EXAM_DOWNLOAD_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div 
        className="modal-card" 
        style={{ 
          maxWidth: '560px', 
          width: '92%',
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
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: 'var(--theme-border, #17324d)' }}>
                紙本考卷列印下載
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#78818a', fontWeight: 600 }}>
                國中教育會考全真紙本試卷・官方公開檔案下載中心
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
          
          {/* 官方檔案下載中心 (直連 manus.space) */}
          <div 
            style={{ 
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', 
              border: '2px solid #3b82f6', 
              borderRadius: '18px', 
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: '4px 4px 0px #3b82f6'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <span className="badge badge-indigo" style={{ background: '#2563eb', color: '#fff', fontSize: '0.75rem', fontWeight: 800 }}>
                📁 官方公開檔案中心
              </span>
              <span style={{ fontSize: '0.75rem', color: '#1e40af', fontWeight: 700 }}>
                已整理 114～117 年度紙本 PDF 試卷庫
              </span>
            </div>

            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1.15rem', fontWeight: 900, color: '#1e3a8a' }}>
                前往「紙本考卷公開檔案下載中心」
              </h4>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#1e40af', lineHeight: 1.6, fontWeight: 600 }}>
                點擊下方按鈕即可開啟專屬檔案中心，下載教育部會考與各年級各單元紙本考卷 PDF，包含試卷與答案文件。
              </p>
            </div>

            {/* 前往下載中心大按鈕 */}
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
                fontSize: '1.02rem',
                borderRadius: '14px',
                border: '2px solid #1e40af',
                boxShadow: '0 4px 0 #1e3a8a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <ExternalLink size={18} />
              <span>前往紙本考卷檔案中心下載 (新分頁開啟)</span>
            </button>

            {/* 網址複製與顯示 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1.5px solid #bfdbfe', borderRadius: '12px', padding: '8px 12px' }}>
              <span style={{ fontSize: '0.78rem', color: '#1e40af', fontFamily: 'monospace', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {MANUS_EXAM_DOWNLOAD_URL}
              </span>
              <button
                type="button"
                onClick={handleCopyUrl}
                style={{
                  background: copied ? '#22c55e' : '#f1f5f9',
                  color: copied ? '#ffffff' : '#334155',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                <span>{copied ? '已複製' : '複製網址'}</span>
              </button>
            </div>

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
    </div>
  );
}
