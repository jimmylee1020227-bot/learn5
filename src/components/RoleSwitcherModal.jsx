import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAdminsList } from '../services/cloudStorage';
import { 
  Users, 
  Shield, 
  Crown, 
  GraduationCap, 
  X, 
  Check, 
  Key,
  Mail,
  Edit2
} from 'lucide-react';

export default function RoleSwitcherModal() {
  const { 
    currentUser, 
    switchUserIdentity, 
    bindGoogleAccount, 
    isRoleModalOpen, 
    setIsRoleModalOpen 
  } = useAuth();

  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');

  if (!isRoleModalOpen) return null;

  const admins = getAdminsList();

  const handleCustomGoogleBind = (e) => {
    e.preventDefault();
    if (!customGoogleEmail.trim()) return;
    bindGoogleAccount({
      email: customGoogleEmail.trim(),
      name: customGoogleName.trim() || customGoogleEmail.split('@')[0],
      picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customGoogleEmail)}`
    });
    setIsRoleModalOpen(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '580px' }}>
        
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} color="#6366f1" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>角色權限與 Google 帳號綁定面板</h3>
          </div>
          <button onClick={() => setIsRoleModalOpen(false)} className="btn btn-ghost btn-icon">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ fontSize: '0.85rem', color: '#5b6772', fontWeight: 600 }}>
            目前登入身分：<strong style={{ color: '#17324d' }}>{currentUser.displayName}</strong> ({currentUser.email})
            <span className={`badge ${currentUser.role === 'super_admin' ? 'badge-gold' : currentUser.role === 'admin' ? 'badge-indigo' : 'badge-emerald'}`} style={{ marginLeft: '8px' }}>
              {currentUser.role === 'super_admin' ? '👑 唯一總管理員' : currentUser.role === 'admin' ? '🛡️ 一般管理員' : '🎓 學生'}
            </span>
          </div>

          {/* 快速身分切換卡片 */}
          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 800, color: '#17324d', marginBottom: '10px' }}>
              一鍵切換預設角色進行功能驗證：
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              {/* 1. 學生身分 */}
              <div
                onClick={() => { switchUserIdentity('student'); setIsRoleModalOpen(false); }}
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  borderRadius: '14px',
                  background: currentUser.role === 'student' ? '#e8f6ed' : '#f8f3eb',
                  border: currentUser.role === 'student' ? '2px solid #17324d' : '1.5px solid #ded3c5',
                  boxShadow: currentUser.role === 'student' ? '3px 3px 0 #17324d' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <GraduationCap size={24} color="#347650" />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#17324d' }}>🎓 學生帳號 (建中前鋒‧林同學)</div>
                    <div style={{ fontSize: '0.74rem', color: '#5b6772', fontWeight: 600 }}>可自選題庫測驗、提示、抽獎、錯題加強模式、查看排行榜與諮詢管理員</div>
                  </div>
                </div>
                {currentUser.role === 'student' && <Check size={18} color="#347650" />}
              </div>

              {/* 2. 一般管理員 (陳老師) */}
              <div
                onClick={() => { switchUserIdentity('admin', admins[1]?.id); setIsRoleModalOpen(false); }}
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  borderRadius: '14px',
                  background: currentUser.role === 'admin' && currentUser.id === admins[1]?.id ? '#e8f0f2' : '#f8f3eb',
                  border: currentUser.role === 'admin' && currentUser.id === admins[1]?.id ? '2px solid #17324d' : '1.5px solid #ded3c5',
                  boxShadow: currentUser.role === 'admin' && currentUser.id === admins[1]?.id ? '3px 3px 0 #17324d' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Shield size={24} color="#48717e" />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#17324d' }}>🛡️ 一般管理員 (陳老師 - 理數專業)</div>
                    <div style={{ fontSize: '0.74rem', color: '#5b6772', fontWeight: 600 }}>可改題、刪題、發送點數抽獎券、推播廣播、開雙倍活動。無權看日誌與新增管理員</div>
                  </div>
                </div>
                {currentUser.role === 'admin' && currentUser.id === admins[1]?.id && <Check size={18} color="#48717e" />}
              </div>

              {/* 3. 總管理員 (Super Admin - 唯一) */}
              <div
                onClick={() => { switchUserIdentity('super_admin'); setIsRoleModalOpen(false); }}
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  borderRadius: '14px',
                  background: currentUser.role === 'super_admin' ? '#fff7d9' : '#f8f3eb',
                  border: currentUser.role === 'super_admin' ? '2px solid #17324d' : '1.5px solid #ded3c5',
                  boxShadow: currentUser.role === 'super_admin' ? '3px 3px 0 #f7cf68' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Crown size={24} color="#806523" />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#806523' }}>👑 系統唯一總管理員 (Super Admin)</div>
                    <div style={{ fontSize: '0.74rem', color: '#5b6772', fontWeight: 600 }}>最高權限！獨佔查閱【所有管理員操作日誌】，且獨佔新增與刪除管理員名額</div>
                  </div>
                </div>
                {currentUser.role === 'super_admin' && <Check size={18} color="#806523" />}
              </div>

            </div>
          </div>

          {/* 綁定自訂 Google 帳號 */}
          <div style={{ paddingTop: '16px', borderTop: '1.5px solid #ded3c5' }}>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 800, color: '#17324d', marginBottom: '8px' }}>
              綁定你的個人 Google 帳號：
            </label>
            <form onSubmit={handleCustomGoogleBind} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="email"
                value={customGoogleEmail}
                onChange={e => setCustomGoogleEmail(e.target.value)}
                placeholder="輸入你的 Google 信箱 (如: student@gmail.com)"
                style={{ flex: 1, padding: '10px 12px', background: '#f8f3eb', color: '#17324d', border: '1.5px solid #ded3c5', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 600 }}
              />
              <button type="submit" className="btn btn-secondary">
                綁定 Google
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
