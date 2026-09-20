import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { useTheme } from '../context/ThemeContext';
import { useDevice } from '../context/DeviceContext';
import { getNextMondayCountdown } from '../services/leaderboardService';
import { SUPER_ADMIN_EMAIL, checkIsAdmin, checkIsSuperAdmin, getRedemptionCodes, getUserRedeemedCodes, subscribeToCloudSync } from '../services/cloudStorage';
import NotificationBellModal from './NotificationBellModal';
import { 
  GraduationCap, 
  Sparkles, 
  Trophy, 
  BookOpen, 
  Flame, 
  Gift, 
  Clock, 
  MessageSquare, 
  Shield, 
  Crown, 
  UserCheck, 
  Edit3, 
  LogOut, 
  Ticket, 
  MessageSquareHeart, 
  Palette,
  Bell,
  Users
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab,
  onOpenRedemptionModal 
}) {
  const { 
    currentUser, 
    setCustomDisplayName, 
    logout,
    triggerGoogleLogin,
    setIsGoogleConfigModalOpen 
  } = useAuth();

  const { isMobile, isTablet, isDesktop } = useDevice();
  const { gameState, effectiveMultiplier, multiplierRemainingSec, setIsLuckyDrawOpen } = useGame();
  const { currentTheme, setCurrentTheme, THEMES } = useTheme();
  
  const [countdown, setCountdown] = useState(getNextMondayCountdown());
  const [isEditingName, setIsEditingName] = useState(false);
  const [newNameInput, setNewNameInput] = useState(currentUser?.displayName || '');
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [syncTick, setSyncTick] = useState(0);

  // 監聽跨端與本地即時雲端事件，動態重新計算序號未領取數量
  useEffect(() => {
    const unsub = subscribeToCloudSync(() => {
      setSyncTick(t => t + 1);
    });
    return () => unsub();
  }, []);

  // 計算可領取但尚未領取的序號數量
  const allCodes = getRedemptionCodes();
  const userClaimed = getUserRedeemedCodes(currentUser?.id || 'guest_student');
  const unredeemedCount = allCodes.filter(c => !userClaimed.includes(c.code.toUpperCase())).length;

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getNextMondayCountdown());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleNameSave = () => {
    if (newNameInput.trim()) {
      setCustomDisplayName(newNameInput.trim());
      setIsEditingName(false);
    }
  };

  const isSuperAdmin = checkIsSuperAdmin(currentUser);
  const isAdmin = checkIsAdmin(currentUser);

  return (
    <header className="sticky top-0 z-50 border-b border-[#e8ded0] bg-[var(--theme-bg, #f8f3eb)]/95 backdrop-blur-xl">
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        
        {/* 左側：品牌 Logo 與每週歸零倒數看板 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div 
            onClick={() => setActiveTab('quiz')} 
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            {/* 經典深海軍藍小方塊標章 + 珊瑚橙點 */}
            <div style={{ position: 'relative', width: '42px', height: '42px', borderRadius: '14px', background: 'var(--theme-border, var(--theme-border, #17324d))', border: '2px solid var(--theme-border, #17324d)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f7cf68', boxShadow: '3px 3px 0px var(--theme-accent, #ef8354)' }}>
              <GraduationCap size={24} />
              <span style={{ position: 'absolute', top: '-3px', right: '-3px', width: '9px', height: '9px', borderRadius: '50%', background: 'var(--theme-accent, var(--theme-accent, #ef8354))' }} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--theme-border, var(--theme-border, #17324d))' }}>
                  會考讀書網
                </span>
                <span className="badge badge-coral" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                  108 課綱
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#78818a', fontWeight: 600 }}>
                國一至國三全科・破千題庫・一起穩穩上岸
              </div>
            </div>
          </div>

          {/* 每週一 00:00 歸零倒數看板 (電腦與平板版自動顯示，手機版隱藏移至首頁) */}
          {!isMobile && (
            <div style={{ padding: '6px 14px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px', border: '1.5px solid #ded3c5', background: 'var(--theme-card, var(--theme-card, #fffdf9))', boxShadow: '2px 2px 0px var(--theme-border, #17324d)' }}>
              <Clock size={14} color="var(--theme-accent, var(--theme-accent, #ef8354))" />
              <div style={{ fontSize: '0.74rem', color: '#5b6772', fontWeight: 700 }}>
                週榜結算倒數：
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--theme-border, var(--theme-border, #17324d))', marginLeft: '4px', fontWeight: 900 }}>
                  {countdown.days}天 {String(countdown.hours).padStart(2, '0')}:{String(countdown.minutes).padStart(2, '0')}:{String(countdown.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 中間：功能導覽按鈕 (電腦平板自動顯示；手機版自動由底部導航列接管) */}
        {!isMobile && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <button 
              className={`btn ${activeTab === 'quiz' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('quiz')}
              style={{ fontSize: '0.86rem', padding: '7px 12px' }}
            >
              <BookOpen size={15} />
              AI題庫
            </button>

          <button 
            className={`btn ${activeTab === 'reinforce' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('reinforce')}
            style={{ fontSize: '0.86rem', padding: '7px 12px' }}
          >
            <Sparkles size={15} />
            錯題加強
          </button>

          <button 
            className={`btn ${activeTab === 'leaderboard' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('leaderboard')}
            style={{ fontSize: '0.86rem', padding: '7px 12px' }}
          >
            <Trophy size={15} />
            排行榜
          </button>

          <button 
            className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('history')}
            style={{ fontSize: '0.86rem', padding: '7px 12px' }}
          >
            <BookOpen size={15} />
            歷程錯題
          </button>


          {/* 兌換碼捷徑 */}
          <button 
            className="btn btn-ghost"
            onClick={onOpenRedemptionModal}
            style={{ fontSize: '0.86rem', padding: '7px 12px', color: '#806523' }}
            title="輸入兌換碼領獎勵"
          >
            <Ticket size={15} />
            兌換碼
          </button>

          {/* 加入群組一起討論 (LINE OpenChat) */}
          <a
            href="https://openchat.line.me/tw/cover/qOdlVtQ0IBp7wnGg00kPYDMbjLCp8VkH6WSExq042v3oIIRaPjKtYRPSK0I?utm_source=line-openchat-seo&utm_medium=search_keyword&utm_campaign=default"
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
            style={{ 
              fontSize: '0.84rem', 
              padding: '6px 12px', 
              background: '#06C755',
              color: '#ffffff',
              border: '1.5px solid var(--theme-border, #17324d)',
              borderRadius: '10px',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
              boxShadow: '2px 2px 0px var(--theme-border, #17324d)'
            }}
            title="加入 LINE 社群一起討論"
          >
            <Users size={14} />
            加入群組一起討論
          </a>

          {/* 聯絡管理員 (LINE) */}
          <a
            href="https://line.me/R/ti/p/@418yswmd"
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
            style={{ 
              fontSize: '0.84rem', 
              padding: '6px 12px', 
              background: 'var(--theme-card, var(--theme-card, #fffdf9))',
              color: '#06C755',
              border: '1.5px solid #06C755',
              borderRadius: '10px',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
              boxShadow: '2px 2px 0px #06C755'
            }}
            title="聯絡管理員"
          >
            <MessageSquareHeart size={14} />
            聯絡管理員
          </a>


          {/* 一般管理員或總管理員後台 */}
          {currentUser && isAdmin && (
            <button 
              className={`btn ${activeTab === 'admin' ? 'btn-secondary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('admin')}
              style={{ fontSize: '0.86rem', padding: '7px 12px' }}
            >
              <Shield size={15} color="#48717e" />
              管理中台
            </button>
          )}

          {/* 總管理員專屬日誌與任命 */}
          {isSuperAdmin && (
            <button 
              className={`btn ${activeTab === 'super_admin' ? 'btn-gold' : 'btn-ghost'}`}
              onClick={() => setActiveTab('super_admin')}
              style={{ fontSize: '0.86rem', padding: '7px 12px' }}
            >
              <Crown size={15} />
              總管審計
            </button>
          )}
        </nav>
        )}

        {/* 右側：通知小鈴鐺、主題切換、抽獎券、倍率與 Google 登入 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          
          {/* 通知小鈴鐺按鈕 (管理員公告與可領取序號) */}
          <button
            onClick={() => setIsNotifModalOpen(true)}
            className="btn btn-secondary"
            style={{ 
              position: 'relative', 
              padding: '7px 12px', 
              fontSize: '0.82rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              borderRadius: '12px' 
            }}
            title="查看管理員通知與可領取序號"
          >
            <Bell size={16} color="var(--theme-accent, var(--theme-accent, #ef8354))" />
            <span style={{ fontWeight: 800 }}>通知</span>
            {unredeemedCount > 0 && (
              <span 
                style={{
                  background: 'var(--theme-accent, var(--theme-accent, #ef8354))',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 900,
                  padding: '1px 6px',
                  borderRadius: '9999px',
                  border: '1px solid var(--theme-border, #17324d)'
                }}
              >
                {unredeemedCount}
              </span>
            )}
          </button>

          {/* 視覺氛圍標示與天天抽獎按鈕 (電腦平板自動顯示，手機版已整合至底部導航列) */}
          {!isMobile && (
            <>
              <div style={{ position: 'relative' }}>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                  style={{ padding: '7px 12px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  title={`視覺氛圍：${THEMES.find(t => t.id === currentTheme)?.name || '切換主題'}`}
                >
                  <Palette size={15} color="var(--theme-accent, #ef8354)" />
                  <span style={{ maxWidth: '90px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {THEMES.find(t => t.id === currentTheme)?.name || '切換主題'}
                  </span>
                </button>

                {isThemeMenuOpen && (
                  <div 
                    style={{ 
                      position: 'absolute', 
                      top: '110%', 
                      right: 0, 
                      width: '240px', 
                      zIndex: 200, 
                      padding: '10px', 
                      borderRadius: '16px',
                      background: 'var(--theme-card, #fffdf9)',
                      border: '2px solid var(--theme-border, #17324d)',
                      boxShadow: '6px 6px 0px var(--theme-border, #17324d)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      maxHeight: '400px',
                      overflowY: 'auto'
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', color: '#78818a', padding: '2px 6px', fontWeight: 800 }}>
                      選擇視覺氛圍
                    </div>
                    {THEMES.map(theme => (
                      <div
                        key={theme.id}
                        onClick={() => {
                          setCurrentTheme(theme.id);
                          setIsThemeMenuOpen(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 10px',
                          borderRadius: '10px',
                          border: currentTheme === theme.id ? `2px solid ${theme.color}` : '1.5px solid transparent',
                          background: currentTheme === theme.id ? `${theme.color}20` : 'transparent',
                          color: currentTheme === theme.id ? theme.color : 'var(--theme-border, #17324d)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (currentTheme !== theme.id) {
                            e.currentTarget.style.background = 'rgba(23, 50, 77, 0.05)';
                            e.currentTarget.style.borderColor = 'var(--theme-border, #17324d)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (currentTheme !== theme.id) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = 'transparent';
                          }
                        }}
                      >
                        <span style={{ fontSize: '1.2rem' }}>{theme.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>
                            {theme.name}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: currentTheme === theme.id ? theme.color : '#78818a', opacity: 0.8 }}>
                            {theme.desc}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 天天抽獎按鈕 */}
              <button 
                className="btn btn-gold"
                onClick={() => setIsLuckyDrawOpen(true)}
                style={{ padding: '8px 14px', position: 'relative' }}
              >
                <Gift size={16} />
                <span>天天抽獎</span>
                <span style={{ background: 'var(--theme-border, var(--theme-border, #17324d))', color: '#f7cf68', padding: '1px 7px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800 }}>
                  {gameState.tickets || 0} 張
                </span>
                {gameState.tickets > 0 && (
                  <span className="pulse-dot" style={{ position: 'absolute', top: '-4px', right: '-4px', width: '10px', height: '10px', background: 'var(--theme-accent, var(--theme-accent, #ef8354))', borderRadius: '50%', border: '2px solid var(--theme-card, #fffdf9)' }} />
                )}
              </button>
            </>
          )}

          {/* 點數倍率標籤 */}
          {effectiveMultiplier > 1 ? (
            <div 
              className="badge badge-fire fire-pulse" 
              style={{ padding: '6px 12px', fontSize: '0.82rem', fontWeight: 800 }}
            >
              <Flame size={15} />
              <span>{effectiveMultiplier} 倍積分</span>
              {multiplierRemainingSec > 0 && (
                <span style={{ fontFamily: 'var(--font-mono)', opacity: 0.9 }}>
                  ({Math.floor(multiplierRemainingSec / 60)}:{(multiplierRemainingSec % 60).toString().padStart(2, '0')})
                </span>
              )}
            </div>
          ) : (
            <div className="badge badge-coral" style={{ padding: '6px 10px', fontSize: '0.78rem' }}>
              1 題 = 1 點
            </div>
          )}

          {/* Google 登入狀態區塊 */}
          {currentUser && currentUser.isGoogleBound ? (
            <div style={{ padding: '4px 12px 4px 6px', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '30px', background: 'var(--theme-card, var(--theme-card, #fffdf9))', border: '2px solid var(--theme-border, #17324d)', boxShadow: '2px 2px 0 var(--theme-border, #17324d)' }}>
              <img 
                src={currentUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentUser.email)}`} 
                alt={currentUser.displayName}
                style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1.5px solid var(--theme-border, #17324d)' }}
              />
              
              {isEditingName ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input 
                    type="text" 
                    value={newNameInput} 
                    onChange={e => setNewNameInput(e.target.value)}
                    style={{ background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))', border: '1px solid var(--theme-accent, #ef8354)', color: 'var(--theme-border, var(--theme-border, #17324d))', borderRadius: '4px', padding: '3px 8px', fontSize: '0.8rem', width: '100px', fontWeight: 700 }}
                    maxLength={16}
                    autoFocus
                  />
                  <button onClick={handleNameSave} className="btn btn-primary" style={{ padding: '3px 8px', fontSize: '0.75rem' }}>存</button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--theme-border, var(--theme-border, #17324d))', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {currentUser.displayName}
                      </span>
                      <Edit3 size={13} style={{ cursor: 'pointer', opacity: 0.6 }} onClick={() => { setNewNameInput(currentUser.displayName); setIsEditingName(true); }} />
                    </div>
                    <div style={{ fontSize: '0.68rem', color: isSuperAdmin ? '#c8643d' : isAdmin ? '#48717e' : '#78818a', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 700 }}>
                      <UserCheck size={10} />
                      {isSuperAdmin ? '👑 唯一總管理員' : isAdmin ? '🛡️ 駐站管理員' : '🎓 Google學生'}
                    </div>
                  </div>
                </div>
              )}

              <button 
                onClick={logout}
                className="btn-icon"
                style={{ padding: '4px', color: '#78818a', cursor: 'pointer', background: 'transparent', border: 'none' }}
                title="登出目前帳號"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            /* 未綁定 Google 帳號時：真實 Google 登入按鈕 (直接跳轉 Google 授權介面) */
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button 
                onClick={triggerGoogleLogin}
                className="btn"
                style={{
                  padding: '8px 18px',
                  background: '#ffffff',
                  color: 'var(--theme-border, var(--theme-border, #17324d))',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  borderRadius: '30px',
                  boxShadow: '3px 3px 0px var(--theme-border, #17324d)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: '2px solid var(--theme-border, #17324d)',
                  cursor: 'pointer'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>Google 登入</span>
              </button>

              <button
                onClick={() => setIsGoogleConfigModalOpen(true)}
                className="btn btn-ghost btn-icon"
                style={{ color: '#78818a', padding: '6px' }}
                title="Google Client ID 設定與快速總管通道"
              >
                ⚙️
              </button>
            </div>
          )}

        </div>

      </div>

      {/* 管理員公告與可領取序號彈窗 */}
      <NotificationBellModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
      />
    </header>
  );
}
