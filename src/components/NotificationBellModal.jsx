import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { 
  getAdminNotifications, 
  fetchCloudAdminNotifications,
  getRedemptionCodes, 
  fetchCloudRedemptionCodes,
  getUserRedeemedCodes, 
  fetchCloudUserRedeemedCodes,
  redeemCodeAsync,
  subscribeToCloudSync
} from '../services/cloudStorage';
import { 
  Bell, 
  Gift, 
  Megaphone, 
  Sparkles, 
  Copy, 
  Check, 
  Clock, 
  X, 
  Flame, 
  Ticket, 
  Award,
  ChevronRight,
  Loader2
} from 'lucide-react';

export default function NotificationBellModal({ isOpen, onClose }) {
  const { currentUser } = useAuth();
  const { grantDirectPoints, setGameState, activateUserMultiplier } = useGame();

  const [activeTab, setActiveTab] = useState('codes'); // 'codes' | 'notices'
  const [notifications, setNotifications] = useState([]);
  const [codes, setCodes] = useState([]);
  const [redeemedCodes, setRedeemedCodes] = useState([]);
  const [copiedCode, setCopiedCode] = useState(null);
  const [claimSuccessMsg, setClaimSuccessMsg] = useState('');
  const [claimingCode, setClaimingCode] = useState(null);

  const userId = currentUser?.id || 'guest_student';

  useEffect(() => {
    if (isOpen) {
      // 1. 本地秒級顯示
      setNotifications(getAdminNotifications());
      setCodes(getRedemptionCodes());
      setRedeemedCodes(getUserRedeemedCodes(userId));
      setClaimSuccessMsg('');

      // 2. 跨裝置主動非同步向 Firebase 雲端調閱最新公告、兌換碼與使用者兌換歷史
      Promise.all([
        fetchCloudAdminNotifications(),
        fetchCloudRedemptionCodes(),
        fetchCloudUserRedeemedCodes(userId)
      ]).then(([latestNotifs, latestCodes, latestRedeemed]) => {
        if (latestNotifs) setNotifications(latestNotifs);
        if (latestCodes) setCodes(latestCodes);
        if (latestRedeemed) setRedeemedCodes(latestRedeemed);
      }).catch(() => {});

      const unsubscribe = subscribeToCloudSync((event) => {
        if (
          !event?.key ||
          event.key === 'admin_notifications' ||
          event.key === 'deleted_notifications' ||
          event.key === 'redemption_codes' ||
          event.key === 'deleted_redemption_codes' ||
          event.key?.startsWith('redeemed_history_')
        ) {
          setNotifications(getAdminNotifications());
          setCodes(getRedemptionCodes());
          setRedeemedCodes(getUserRedeemedCodes(userId));
        }
      });
      return () => unsubscribe();
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleClaimCode = async (codeItem) => {
    if (claimingCode) return;
    setClaimingCode(codeItem.code);
    try {
      const res = await redeemCodeAsync(userId, codeItem.code, currentUser?.displayName);

      // 發放獎勵
      if (res.type === 'points') {
        grantDirectPoints(res.rewardValue);
        setClaimSuccessMsg(`🎉 成功兌換【${res.code}】！獲得 ${res.rewardValue} 點排行榜積分！`);
      } else if (res.type === 'lottery_ticket') {
        setGameState(prev => ({
          ...prev,
          tickets: (prev.tickets || 0) + res.rewardValue
        }));
        setClaimSuccessMsg(`🎉 成功兌換【${res.code}】！獲得 ${res.rewardValue} 張幸運抽獎券！`);
      } else if (res.type === 'multiplier') {
        activateUserMultiplier(res.rewardValue * 60);
        setClaimSuccessMsg(`🔥 成功兌換【${res.code}】！獲得 ${res.rewardValue} 分鐘 2x/4x 雙倍暴擊！`);
      }

      // 重新讀取已兌換清單
      setRedeemedCodes(getUserRedeemedCodes(userId));
    } catch (err) {
      alert(err.message);
    } finally {
      setClaimingCode(null);
    }
  };

  const unredeemedCount = codes.filter(c => !redeemedCodes.includes(c.code.toUpperCase())).length;

  return (
    <div className="modal-overlay">
      <div 
        className="modal-card" 
        style={{ 
          maxWidth: '580px',
          background: 'var(--theme-card, var(--theme-card, #fffdf9))',
          border: '2.5px solid var(--theme-border, #17324d)',
          boxShadow: '10px 10px 0px var(--theme-border, #17324d)',
          borderRadius: '24px'
        }}
      >
        
        {/* Header */}
        <div className="modal-header" style={{ background: 'var(--theme-card, var(--theme-card, #fffdf9))', borderBottom: '2px solid var(--theme-border, #17324d)', padding: '18px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#fff7d9', border: '2px solid var(--theme-border, #17324d)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#806523' }}>
              <Bell size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--theme-border, var(--theme-border, #17324d))' }}>
                站務廣播與序號空投中心
              </h3>
              <div style={{ fontSize: '0.74rem', color: '#5b6772', fontWeight: 600 }}>
                所有管理員推播訊息・官方免費禮包序號一鍵領取
              </div>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={20} color="var(--theme-border, var(--theme-border, #17324d))" />
          </button>
        </div>

        {/* 提示訊息 */}
        {claimSuccessMsg && (
          <div style={{ margin: '14px 22px 0', padding: '12px 16px', background: '#e8f6ed', border: '2px solid #347650', borderRadius: '12px', color: '#347650', fontWeight: 800, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} /> {claimSuccessMsg}
          </div>
        )}

        {/* 分頁按鈕 */}
        <div style={{ display: 'flex', borderBottom: '2px solid var(--theme-border, #17324d)', background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))', padding: '10px 20px 0', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('codes')}
            style={{
              padding: '10px 18px',
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px',
              border: activeTab === 'codes' ? '2px solid var(--theme-border, #17324d)' : '1.5px solid transparent',
              borderBottom: activeTab === 'codes' ? '2px solid var(--theme-card, #fffdf9)' : 'none',
              background: activeTab === 'codes' ? 'var(--theme-card, var(--theme-card, #fffdf9))' : 'transparent',
              fontWeight: 800,
              fontSize: '0.9rem',
              color: activeTab === 'codes' ? 'var(--theme-accent, var(--theme-accent, #ef8354))' : '#5b6772',
              cursor: 'pointer',
              marginBottom: '-2px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Gift size={16} />
            可領取序號 ({codes.length})
            {unredeemedCount > 0 && (
              <span className="badge badge-fire" style={{ padding: '1px 6px', fontSize: '0.68rem' }}>
                {unredeemedCount} 可領
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('notices')}
            style={{
              padding: '10px 18px',
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px',
              border: activeTab === 'notices' ? '2px solid var(--theme-border, #17324d)' : '1.5px solid transparent',
              borderBottom: activeTab === 'notices' ? '2px solid var(--theme-card, #fffdf9)' : 'none',
              background: activeTab === 'notices' ? 'var(--theme-card, var(--theme-card, #fffdf9))' : 'transparent',
              fontWeight: 800,
              fontSize: '0.9rem',
              color: activeTab === 'notices' ? 'var(--theme-border, var(--theme-border, #17324d))' : '#5b6772',
              cursor: 'pointer',
              marginBottom: '-2px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Megaphone size={16} />
            管理員公告 ({notifications.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '20px', maxHeight: '460px', overflowY: 'auto' }}>
          
          {/* 分頁 1: 可領取序號 */}
          {activeTab === 'codes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {codes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#78818a', fontWeight: 600 }}>
                  目前沒有可領取的官方序號，請隨時留意管理員空投！
                </div>
              ) : (
                codes.map(c => {
                  const isClaimed = redeemedCodes.includes(c.code.toUpperCase());
                  return (
                    <div 
                      key={c.code}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '16px',
                        background: isClaimed ? 'var(--theme-bg, var(--theme-bg, #f8f3eb))' : 'var(--theme-card, var(--theme-card, #fffdf9))',
                        border: '2px solid var(--theme-border, #17324d)',
                        boxShadow: isClaimed ? 'none' : '3px 3px 0 var(--theme-border, #17324d)',
                        opacity: isClaimed ? 0.75 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '0.98rem', color: 'var(--theme-border, var(--theme-border, #17324d))', letterSpacing: '0.5px' }}>
                            {c.code}
                          </span>
                          <span className={`badge ${c.type === 'multiplier' ? 'badge-fire' : c.type === 'lottery_ticket' ? 'badge-coral' : 'badge-gold'}`} style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                            {c.type === 'multiplier' ? '🔥 雙倍狂暴' : c.type === 'lottery_ticket' ? '🎫 抽獎券' : '🏆 榜單積分'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#5b6772', fontWeight: 700 }}>
                          {c.label}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#8a96a3', marginTop: '2px' }}>
                          效期至 {c.expiresAt}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => handleCopy(c.code)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '0.75rem', borderRadius: '10px' }}
                          title="複製序號代碼"
                        >
                          {copiedCode === c.code ? <Check size={14} color="#347650" /> : <Copy size={14} />}
                        </button>

                        {isClaimed ? (
                          <span className="badge badge-emerald" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                            已領取 ✓
                          </span>
                        ) : (
                          <button
                            onClick={() => handleClaimCode(c)}
                            className="btn btn-primary"
                            style={{ padding: '7px 14px', fontSize: '0.82rem', borderRadius: '10px', fontWeight: 800 }}
                          >
                            一鍵領取
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* 分頁 2: 管理員公告 */}
          {activeTab === 'notices' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#78818a', fontWeight: 600 }}>
                  目前沒有站務通知！
                </div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '16px',
                      background: 'var(--theme-card, var(--theme-card, #fffdf9))',
                      border: '2px solid var(--theme-border, #17324d)',
                      boxShadow: '3px 3px 0 var(--theme-border, #17324d)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--theme-border, var(--theme-border, #17324d))' }}>
                        {n.title}
                      </span>
                      <span className="badge badge-indigo" style={{ fontSize: '0.68rem' }}>
                        {n.sender}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.82rem', color: '#5b6772', lineHeight: 1.5, fontWeight: 600 }}>
                      {n.message}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed #ded3c5' }}>
                      <div style={{ fontSize: '0.7rem', color: '#8a96a3', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} />
                        {new Date(n.timestamp).toLocaleString([], { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </div>

                      {n.relatedCode && (
                        <button
                          onClick={() => {
                            setActiveTab('codes');
                          }}
                          style={{ background: 'transparent', border: 'none', color: 'var(--theme-accent, var(--theme-accent, #ef8354))', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                        >
                          前往領取序號 <ChevronRight size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))', borderTop: '2px solid var(--theme-border, #17324d)', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: '#78818a', fontWeight: 600 }}>
            💡 每日 00:00 留意管理員最新公告與好康序號
          </span>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '6px 16px', fontSize: '0.85rem' }}>
            關閉
          </button>
        </div>

      </div>
    </div>
  );
}
