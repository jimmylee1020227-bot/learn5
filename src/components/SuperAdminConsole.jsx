import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getAdminsList, 
  addAdmin, 
  deleteAdmin, 
  getAuditLogs, 
  SUPER_ADMIN_EMAIL,
  purgeAllTestData,
  subscribeToCloudSync 
} from '../services/cloudStorage';
import { 
  Crown, 
  ShieldCheck, 
  UserPlus, 
  Trash2, 
  FileText, 
  AlertOctagon, 
  CheckCircle2,
  Clock,
  Filter,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export default function SuperAdminConsole() {
  const { currentUser } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'admins'

  // 新增管理員表單狀態
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminSpecialty, setNewAdminSpecialty] = useState('');
  const [actionNotice, setActionNotice] = useState('');

  // 日誌過濾
  const [filterActionType, setFilterActionType] = useState('ALL');

  useEffect(() => {
    setAdmins(getAdminsList());
    setAuditLogs(getAuditLogs(currentUser));
    const unsub = subscribeToCloudSync((event) => {
      if (!event || event.key === 'admins_list' || event.key === 'audit_logs') {
        setAdmins(getAdminsList());
        setAuditLogs(getAuditLogs(currentUser));
      }
    });
    return () => unsub();
  }, [currentUser]);

  // 嚴格權限檢查（僅 jimmylee1020227@gmail.com 或 super_admin 可存取）
  const isAuthorizedSuperAdmin = currentUser?.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() || currentUser?.role === 'super_admin';

  if (!isAuthorizedSuperAdmin) {
    return (
      <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
        <AlertOctagon size={56} color="#ef4444" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f87171', marginBottom: '8px' }}>
          權限不足：拒絕存取
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          此區域為【系統唯一總管理員 ({SUPER_ADMIN_EMAIL})】專屬控制台，包含管理員審計日誌與人事權限任命。
        </p>
      </div>
    );
  }

  // 處理新增管理員
  const handleAddAdmin = (e) => {
    e.preventDefault();
    if (!newAdminEmail.trim() || !newAdminName.trim()) {
      alert('請填寫管理員 Email 與姓名！');
      return;
    }

    try {
      addAdmin({
        email: newAdminEmail.trim(),
        displayName: newAdminName.trim(),
        specialties: newAdminSpecialty ? [newAdminSpecialty.trim()] : ['課綱答疑']
      }, currentUser);

      setAdmins(getAdminsList());
      setAuditLogs(getAuditLogs(currentUser));
      setActionNotice(`🎉 成功新增管理員【${newAdminName.trim()}】！`);
      setNewAdminEmail('');
      setNewAdminName('');
      setNewAdminSpecialty('');
      setTimeout(() => setActionNotice(''), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  // 處理移除管理員
  const handleDeleteAdmin = (adminId, adminName) => {
    if (!window.confirm(`確定要撤銷管理員【${adminName}】的權限嗎？此動作將寫入審計日誌！`)) {
      return;
    }

    try {
      deleteAdmin(adminId, currentUser);
      setAdmins(getAdminsList());
      setAuditLogs(getAuditLogs(currentUser));
      setActionNotice(`已成功撤銷管理員【${adminName}】權限。`);
      setTimeout(() => setActionNotice(''), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  // 一鍵清除所有測資
  const handlePurgeData = () => {
    if (window.confirm('確定要清除所有測試作答紀錄、歷史名人堂與排行榜測試資料嗎？系統將重設為乾淨正式版狀態。')) {
      purgeAllTestData();
      setAdmins(getAdminsList());
      setAuditLogs(getAuditLogs(currentUser));
      alert('已成功清除所有測資！系統已恢復為純淨正式投入使用版本。');
      window.location.reload();
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    if (filterActionType !== 'ALL' && log.actionType !== filterActionType) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 頂部總管理員榮譽 Banner */}
      <div className="glass-panel" style={{ padding: '28px', border: '1px solid rgba(251, 191, 36, 0.4)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '280px', height: '280px', background: 'radial-gradient(circle, rgba(251, 191, 36, 0.2), transparent 70%)', pointerEvents: 'none' }}></div>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Crown size={28} color="#fbbf24" />
              <span className="badge badge-gold" style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
                👑 系統唯一總管理員 ({SUPER_ADMIN_EMAIL})
              </span>
            </div>

            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '6px' }}>
              總管理員操作審計日誌與權限指揮所
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '800px' }}>
              全平台<strong>總管理員只有一個 ({SUPER_ADMIN_EMAIL})</strong>。一般管理員的所有改題、改答案、刪題、發放獎勵與回報處理動作，<strong>全部強制實時記錄於此審計日誌中，且只有總管理員能檢視</strong>。總管理員亦獨佔新增與刪除一般管理員之權力。
            </p>
          </div>

          <button 
            onClick={handlePurgeData}
            className="btn btn-secondary"
            style={{ borderColor: '#f87171', color: '#f87171', fontSize: '0.85rem' }}
            title="清空測試紀錄"
          >
            <RefreshCw size={15} /> 清除全部測資 (正式上線重設)
          </button>
        </div>

        {/* 次分頁切換 */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
          <button
            onClick={() => setActiveTab('audit')}
            className={`btn ${activeTab === 'audit' ? 'btn-gold' : 'btn-secondary'}`}
            style={{ padding: '8px 18px' }}
          >
            <FileText size={16} /> 管理員操作審計日誌 ({auditLogs.length} 筆)
          </button>
          <button
            onClick={() => setActiveTab('admins')}
            className={`btn ${activeTab === 'admins' ? 'btn-gold' : 'btn-secondary'}`}
            style={{ padding: '8px 18px' }}
          >
            <ShieldCheck size={16} /> 駐站管理員任免管理 ({admins.length} 位)
          </button>
        </div>

      </div>

      {/* 分頁 1：總管理員專屬審計日誌 (Audit Log) */}
      {activeTab === 'audit' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} color="#fbbf24" />
                全服管理員操作全景日誌 (Audit Logs)
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                日誌為防竄改安全稽核紀錄，只有總管理員 {SUPER_ADMIN_EMAIL} 有權查閱
              </div>
            </div>

            {/* 過濾類型 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={15} color="#5b6772" />
              <select
                value={filterActionType}
                onChange={e => setFilterActionType(e.target.value)}
                style={{ background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))', color: 'var(--theme-border, var(--theme-border, #17324d))', border: '1.5px solid #ded3c5', borderRadius: 'var(--radius-sm)', padding: '6px 12px', fontSize: '0.85rem', fontWeight: 700 }}
              >
                <option value="ALL">全部動作日誌</option>
                <option value="MODIFY_QUESTION">修改題目/答案</option>
                <option value="DELETE_QUESTION">刪除題目</option>
                <option value="GRANT_POINTS">發放點數</option>
                <option value="GRANT_TICKETS">發放抽獎券</option>
                <option value="UPDATE_GLOBAL_SETTINGS">更新全服設定</option>
                <option value="ADD_ADMIN">新增管理員</option>
                <option value="DELETE_ADMIN">刪除管理員</option>
              </select>
            </div>
          </div>

          {/* 日誌條列展示 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredLogs.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>
                暫無管理員操作日誌紀錄（正式系統運作中）。
              </div>
            ) : (
              filteredLogs.map(log => {
                const isSuper = log.operatorRole === 'super_admin' || log.operatorId === 'admin_super_jimmy';
                return (
                  <div
                    key={log.id}
                    className="glass-panel"
                    style={{
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderLeft: isSuper ? '4px solid #fbbf24' : '4px solid #6366f1'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <span className={isSuper ? 'badge badge-gold' : 'badge badge-indigo'} style={{ fontSize: '0.72rem' }}>
                          {log.operatorName} ({isSuper ? '總管理員' : '一般管理員'})
                        </span>
                        <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                          {log.actionType}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.92rem', color: 'var(--theme-border, var(--theme-border, #17324d))', fontWeight: 700 }}>
                        {log.details}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                      {new Date(log.timestamp).toLocaleString([], { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 分頁 2：管理員名額與人事任免 */}
      {activeTab === 'admins' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          
          {/* 左側：現有管理員列表 */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
              現有管理員名冊 ({admins.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {admins.map(adm => {
                const isSuper = adm.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() || adm.role === 'super_admin';
                return (
                  <div
                    key={adm.id}
                    className="glass-panel"
                    style={{
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: isSuper ? '1px solid rgba(251, 191, 36, 0.4)' : '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={adm.avatar} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{adm.displayName}</span>
                          {isSuper && <Crown size={14} color="#fbbf24" />}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          {adm.email}
                        </div>
                      </div>
                    </div>

                    <div>
                      {isSuper ? (
                        <span className="badge badge-gold">唯一最高總管</span>
                      ) : (
                        <button
                          onClick={() => handleDeleteAdmin(adm.id, adm.displayName)}
                          className="btn btn-ghost"
                          style={{ color: '#f87171', padding: '6px' }}
                          title="撤銷該一般管理員權限"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 右側：總管理員專屬新增管理員表單 */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserPlus size={18} color="#fbbf24" />
              新增一般管理員帳號
            </h3>

            <form onSubmit={handleAddAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  管理員稱呼 / 姓名：
                </label>
                <input
                  type="text"
                  value={newAdminName}
                  onChange={e => setNewAdminName(e.target.value)}
                  placeholder="例如：陳老師 (自然理化)"
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))', color: 'var(--theme-border, var(--theme-border, #17324d))', border: '1.5px solid #ded3c5', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  管理員 Google Email：
                </label>
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={e => setNewAdminEmail(e.target.value)}
                  placeholder="teacher@gmail.com"
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))', color: 'var(--theme-border, var(--theme-border, #17324d))', border: '1.5px solid #ded3c5', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  專長領域標籤（選填）：
                </label>
                <input
                  type="text"
                  value={newAdminSpecialty}
                  onChange={e => setNewAdminSpecialty(e.target.value)}
                  placeholder="例如：國中理化、會考A++題型"
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))', color: 'var(--theme-border, var(--theme-border, #17324d))', border: '1.5px solid #ded3c5', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}
                />
              </div>

              <button type="submit" className="btn btn-gold" style={{ marginTop: '8px', padding: '12px' }}>
                <UserPlus size={16} /> 授權並建立一般管理員
              </button>
            </form>

            {actionNotice && (
              <div className="badge badge-emerald" style={{ marginTop: '16px', padding: '10px', width: '100%', justifyContent: 'center' }}>
                <CheckCircle2 size={16} /> {actionNotice}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
