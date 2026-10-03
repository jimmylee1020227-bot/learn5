import React, { useState } from 'react';
import { 
  X, 
  GraduationCap, 
  ShieldCheck, 
  BookOpen, 
  Send, 
  CheckCircle2, 
  Zap, 
  Sparkles,
  School,
  Award
} from 'lucide-react';
import { submitTeacherApplication, instantEnableTeacherRole } from '../services/classService';

export default function TeacherApplyModal({ isOpen, onClose, currentUser, onTeacherStatusChanged }) {
  if (!isOpen) return null;

  const [schoolName, setSchoolName] = useState(currentUser?.school || '');
  const [subjectTaught, setSubjectTaught] = useState('國中數學科');
  const [applicantName, setApplicantName] = useState(currentUser?.displayName || currentUser?.name || '');
  const [reason, setReason] = useState('帶領班級學生利用題庫進行單元段考衝刺與自訂作業檢討');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!applicantName.trim() || !schoolName.trim()) {
      alert('請填寫完整教師姓名與任教學校！');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitTeacherApplication({
        applicantId: currentUser?.id || 'guest_student',
        applicantName: applicantName.trim(),
        applicantEmail: currentUser?.email || '',
        schoolName: schoolName.trim(),
        subjectTaught,
        reason: reason.trim()
      });
      setSuccessNotice(true);
      setTimeout(() => {
        setSuccessNotice(false);
        onClose();
      }, 2500);
    } catch (err) {
      alert(err.message || '申請失敗，請稍候再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInstantEnable = async () => {
    if (!currentUser || !currentUser.id) {
      alert('請先登入 Google 帳號！');
      return;
    }
    const confirmed = window.confirm('確定要直接啟用【教師身分】並體驗教師後台嗎？\n\n開通後您將可以使用班級管理、手動派題與成效診斷功能！');
    if (!confirmed) return;

    try {
      await instantEnableTeacherRole(currentUser);
      if (onTeacherStatusChanged) onTeacherStatusChanged();
      alert('🎉 恭喜！您已成功開通【學習網認證教師】身分，即刻可進入教師後台！');
      onClose();
    } catch (err) {
      alert('開通失敗: ' + err.message);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(23, 50, 77, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '540px',
          backgroundColor: 'var(--theme-card, #fffdf9)',
          border: '3px solid var(--theme-border, #17324d)',
          borderRadius: '24px',
          boxShadow: '10px 10px 0px var(--theme-border, #17324d)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* 頂部標頭 */}
        <div 
          style={{
            padding: '20px 24px',
            borderBottom: '2.5px solid var(--theme-border, #17324d)',
            background: 'linear-gradient(135deg, #f8f3eb, #fff8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div 
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: '#4f46e5',
                border: '2px solid var(--theme-border, #17324d)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '3px 3px 0px var(--theme-border, #17324d)'
              }}
            >
              <GraduationCap size={24} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--theme-border, #17324d)' }}>
                申請認證教師帳號
              </h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
                建立專屬班級、自訂積分競賽、手動派發作業與逐題成效診斷
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#ffffff',
              border: '2px solid var(--theme-border, #17324d)',
              borderRadius: '12px',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '2px 2px 0px var(--theme-border, #17324d)'
            }}
          >
            <X size={18} color="var(--theme-border, #17324d)" />
          </button>
        </div>

        {/* 內容表單 */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {successNotice ? (
            <div 
              style={{
                padding: '30px 20px',
                textAlign: 'center',
                background: '#f0fdf4',
                border: '2px solid #22c55e',
                borderRadius: '16px'
              }}
            >
              <CheckCircle2 size={48} color="#16a34a" style={{ margin: '0 auto 12px auto' }} />
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#15803d' }}>
                申請已成功送出！
              </div>
              <div style={{ fontSize: '0.85rem', color: '#166534', marginTop: '6px', fontWeight: 600 }}>
                系統總管理員將儘速為您完成資格審查與開通，審核通過後即可開啟教師後台！
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: 'var(--theme-border, #17324d)', marginBottom: '6px' }}>
                  教師姓名 / 稱謂：
                </label>
                <input
                  type="text"
                  value={applicantName}
                  onChange={e => setApplicantName(e.target.value)}
                  placeholder="例如：林老師、陳文華老師"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    border: '2px solid var(--theme-border, #17324d)',
                    background: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    color: 'var(--theme-border, #17324d)'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: 'var(--theme-border, #17324d)', marginBottom: '6px' }}>
                  任教學校或機構名稱：
                </label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={e => setSchoolName(e.target.value)}
                  placeholder="例如：桃園市立武陵高中、中正國中"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    border: '2px solid var(--theme-border, #17324d)',
                    background: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    color: 'var(--theme-border, #17324d)'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: 'var(--theme-border, #17324d)', marginBottom: '6px' }}>
                  主要授課科目：
                </label>
                <select
                  value={subjectTaught}
                  onChange={e => setSubjectTaught(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    border: '2px solid var(--theme-border, #17324d)',
                    background: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    color: 'var(--theme-border, #17324d)'
                  }}
                >
                  <option value="國中數學科">國中數學科</option>
                  <option value="國中自然科 (理化/生物/地科)">國中自然科 (理化/生物/地科)</option>
                  <option value="國中英語科">國中英語科</option>
                  <option value="國中國文科">國中國文科</option>
                  <option value="國中社會科 (歷史/地理/公民)">國中社會科 (歷史/地理/公民)</option>
                  <option value="國中全科班導師">國中全科班導師</option>
                  <option value="高中部各科教師">高中部各科教師</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: 'var(--theme-border, #17324d)', marginBottom: '6px' }}>
                  使用目的或備註說明：
                </label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    border: '2px solid var(--theme-border, #17324d)',
                    background: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    color: 'var(--theme-border, #17324d)',
                    resize: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{
                    flex: 1,
                    padding: '12px',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Send size={16} />
                  <span>{isSubmitting ? '送出申請中...' : '送出教師審核申請'}</span>
                </button>

                {/* 快速體驗按鈕 */}
                <button
                  type="button"
                  onClick={handleInstantEnable}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '16px',
                    border: '2px solid #6366f1',
                    background: '#eef2ff',
                    color: '#4f46e5',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '3px 3px 0px #6366f1',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Zap size={16} />
                  <span>一鍵快速開通</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 底部說明 */}
        <div 
          style={{
            padding: '12px 24px',
            background: '#f8fafc',
            borderTop: '1.5px solid #e2e8f0',
            fontSize: '0.78rem',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <span>💡 教師帳號享有專屬班級代碼、作業派發與每題選項統計診斷權限</span>
          <button 
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 700 }}
          >
            關閉
          </button>
        </div>

      </div>
    </div>
  );
}
