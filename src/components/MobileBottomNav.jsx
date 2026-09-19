import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { checkIsAdmin, checkIsSuperAdmin } from '../services/cloudStorage';
import { 
  BookOpen, 
  Target, 
  Trophy, 
  MessageSquare, 
  Gift, 
  Shield, 
  History 
} from 'lucide-react';

export default function MobileBottomNav({ 
  activeTab, 
  setActiveTab, 
  onOpenLuckyDraw 
}) {
  const { currentUser } = useAuth();
  const { gameState } = useGame();
  const isSuperAdmin = checkIsSuperAdmin(currentUser);
  const isAdmin = checkIsAdmin(currentUser);

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '62px',
        backgroundColor: '#fffdf9',
        borderTop: '2px solid #17324d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 1000,
        padding: '4px 8px env(safe-area-inset-bottom, 6px)',
        boxShadow: '0 -4px 12px rgba(23, 50, 77, 0.08)'
      }}
    >
      {/* 1. 題庫練習 */}
      <button
        onClick={() => setActiveTab('quiz')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: activeTab === 'quiz' ? '#f5ebd9' : 'transparent',
          border: 'none',
          borderRadius: '10px',
          padding: '5px 8px',
          cursor: 'pointer',
          color: activeTab === 'quiz' ? '#ef8354' : '#5b6772',
          flex: 1,
          maxWidth: '68px',
          transition: 'all 0.15s ease'
        }}
      >
        <BookOpen size={20} strokeWidth={activeTab === 'quiz' ? 2.6 : 2} />
        <span style={{ fontSize: '0.68rem', fontWeight: activeTab === 'quiz' ? 800 : 600, marginTop: '2px' }}>
          題庫
        </span>
      </button>

      {/* 2. 錯題加強 */}
      <button
        onClick={() => setActiveTab('reinforce')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: activeTab === 'reinforce' ? '#f5ebd9' : 'transparent',
          border: 'none',
          borderRadius: '10px',
          padding: '5px 8px',
          cursor: 'pointer',
          color: activeTab === 'reinforce' ? '#ef8354' : '#5b6772',
          flex: 1,
          maxWidth: '68px',
          transition: 'all 0.15s ease'
        }}
      >
        <Target size={20} strokeWidth={activeTab === 'reinforce' ? 2.6 : 2} />
        <span style={{ fontSize: '0.68rem', fontWeight: activeTab === 'reinforce' ? 800 : 600, marginTop: '2px' }}>
          錯題本
        </span>
      </button>

      {/* 3. 每週排行榜 */}
      <button
        onClick={() => setActiveTab('leaderboard')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: activeTab === 'leaderboard' ? '#f5ebd9' : 'transparent',
          border: 'none',
          borderRadius: '10px',
          padding: '5px 8px',
          cursor: 'pointer',
          color: activeTab === 'leaderboard' ? '#ef8354' : '#5b6772',
          flex: 1,
          maxWidth: '68px',
          transition: 'all 0.15s ease'
        }}
      >
        <Trophy size={20} strokeWidth={activeTab === 'leaderboard' ? 2.6 : 2} />
        <span style={{ fontSize: '0.68rem', fontWeight: activeTab === 'leaderboard' ? 800 : 600, marginTop: '2px' }}>
          排行榜
        </span>
      </button>


      {/* 5. 抽獎 */}
      <button
        onClick={onOpenLuckyDraw}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          border: 'none',
          borderRadius: '10px',
          padding: '5px 8px',
          cursor: 'pointer',
          color: '#f59e0b',
          flex: 1,
          maxWidth: '68px',
          position: 'relative',
          transition: 'all 0.15s ease'
        }}
      >
        <Gift size={20} />
        <span style={{ fontSize: '0.68rem', fontWeight: 800, marginTop: '2px' }}>
          抽獎
        </span>
        {gameState.tickets > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '2px',
              right: '12px',
              background: '#ef8354',
              color: '#fff',
              fontSize: '0.6rem',
              fontWeight: 900,
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {gameState.tickets}
          </span>
        )}
      </button>

      {/* 6. 管理員專屬按鈕 (若是管理員) */}
      {isAdmin && (
        <button
          onClick={() => setActiveTab(isSuperAdmin ? 'super_admin' : 'admin')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: activeTab === 'admin' || activeTab === 'super_admin' ? '#fee2e2' : 'transparent',
            border: 'none',
            borderRadius: '10px',
            padding: '5px 8px',
            cursor: 'pointer',
            color: activeTab === 'admin' || activeTab === 'super_admin' ? '#b91c1c' : '#b91c1c',
            flex: 1,
            maxWidth: '68px',
            transition: 'all 0.15s ease'
          }}
        >
          <Shield size={20} strokeWidth={2.4} />
          <span style={{ fontSize: '0.68rem', fontWeight: 800, marginTop: '2px' }}>
            後台
          </span>
        </button>
      )}
    </nav>
  );
}
