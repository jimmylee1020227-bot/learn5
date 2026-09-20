import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getLeaderboard, 
  getHallOfFame, 
  getNextMondayCountdown, 
  checkAndExecuteWeeklyReset,
  fetchCloudLeaderboard 
} from '../services/leaderboardService';
import { subscribeToCloudSync } from '../services/cloudStorage';
import { 
  Trophy, 
  Clock, 
  Crown, 
  RotateCcw, 
  Sparkles,
  RefreshCw,
  Zap
} from 'lucide-react';

export default function LeaderboardView() {
  const { currentUser } = useAuth();
  const [board, setBoard] = useState(getLeaderboard());
  const [fameList, setFameList] = useState(getHallOfFame());
  const [activeTab, setActiveTab] = useState('weekly'); // 'weekly' | 'fame'
  const [countdown, setCountdown] = useState(getNextMondayCountdown());
  const [isSyncing, setIsSyncing] = useState(false);

  const refreshBoard = () => {
    setBoard(getLeaderboard());
    setFameList(getHallOfFame());
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const latest = await fetchCloudLeaderboard();
      if (latest) setBoard(latest);
      setFameList(getHallOfFame());
    } finally {
      setTimeout(() => setIsSyncing(false), 400);
    }
  };

  useEffect(() => {
    refreshBoard();

    // 剛載入時立刻向 Firebase RTDB 主動拉取全服最新排行榜
    setIsSyncing(true);
    fetchCloudLeaderboard().then((remoteBoard) => {
      if (remoteBoard) {
        setBoard(remoteBoard);
      }
    }).finally(() => {
      setIsSyncing(false);
    });

    const timer = setInterval(() => {
      setCountdown(getNextMondayCountdown());
    }, 1000);

    // 跨裝置、跨玩家即時事件監聽
    const unsub = subscribeToCloudSync((ev) => {
      if (!ev.key || ev.key.includes('leaderboard') || ev.key.includes('fame') || ev.key.includes('reset')) {
        refreshBoard();
      }
    });

    return () => {
      clearInterval(timer);
      unsub();
    };
  }, []);

  const handleSimulateMondayReset = () => {
    localStorage.removeItem('studyhub_last_reset_week');
    checkAndExecuteWeeklyReset();
    setBoard(getLeaderboard());
    setFameList(getHallOfFame());
    alert('已成功模擬週一 00:00 榜單歸零！上週榜首已封存進「名人堂」，本週點數已重新歸零！');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 頂部競技橫幅 */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '30px', 
          position: 'relative', 
          overflow: 'hidden',
          background: 'var(--theme-card, var(--theme-card, #fffdf9))',
          border: '2.5px solid var(--theme-border, #17324d)',
          borderRadius: '28px',
          boxShadow: '6px 6px 0px var(--theme-border, #17324d)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
              <span className="badge badge-gold">全台國中全科競技榜</span>
              <span className="badge badge-coral">每週一 00:00 自動歸零結算</span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '8px', color: 'var(--theme-border, var(--theme-border, #17324d))' }}>
              每週積分排行榜與榮譽名人堂
            </h1>
            <p style={{ color: '#5b6772', fontSize: '0.94rem', fontWeight: 600 }}>
              每答對一題即得 1 點積分；若觸發限時雙倍或管理員全服活動，可飆升至 4 倍暴擊點數！
            </p>
          </div>

          {/* 週一歸零倒數看板 */}
          <div 
            style={{ 
              padding: '16px 20px', 
              borderRadius: '20px', 
              border: '2px solid var(--theme-border, #17324d)', 
              background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))',
              boxShadow: '4px 4px 0px #f7cf68',
              textAlign: 'right' 
            }}
          >
            <div style={{ fontSize: '0.8rem', color: '#806523', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', fontWeight: 800 }}>
              <Clock size={16} /> 本週榜單結算歸零倒數
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.45rem', fontWeight: 900, color: 'var(--theme-border, var(--theme-border, #17324d))', marginTop: '4px' }}>
              {countdown.days}天 {String(countdown.hours).padStart(2, '0')}:{String(countdown.minutes).padStart(2, '0')}:{String(countdown.seconds).padStart(2, '0')}
            </div>
            <button
              onClick={handleSimulateMondayReset}
              className="btn btn-ghost"
              style={{ fontSize: '0.74rem', padding: '4px 8px', marginTop: '6px', color: '#78818a' }}
              title="測試用：模擬到達週一 00:00 觸發排行榜歸零並封存名人堂"
            >
              <RotateCcw size={12} /> 測試模擬「週一歸零結算」
            </button>
          </div>
        </div>

        {/* 分頁按鈕與同步狀態：本週即時榜 vs 歷屆名人堂 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginTop: '24px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setActiveTab('weekly')}
              className={`btn ${activeTab === 'weekly' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 18px' }}
            >
              <Trophy size={16} /> 本週即時積分榜
            </button>
            <button
              onClick={() => setActiveTab('fame')}
              className={`btn ${activeTab === 'fame' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 18px' }}
            >
              <Crown size={16} /> 歷史週冠軍名人堂
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              fontSize: '0.82rem', 
              fontWeight: 800,
              color: '#2b9348',
              background: '#e8f5e9',
              padding: '6px 12px',
              borderRadius: '20px',
              border: '1.5px solid #a3b18a'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#2b9348',
                display: 'inline-block',
                boxShadow: '0 0 6px #2b9348'
              }}></span>
              雲端即時同步中
            </span>
            <button
              onClick={handleManualSync}
              className="btn btn-secondary"
              disabled={isSyncing}
              style={{ padding: '6px 14px', fontSize: '0.82rem', fontWeight: 800 }}
              title="強制向雲端 Firebase 重新抓取最新榜單"
            >
              <RefreshCw size={14} className={isSyncing ? 'spin-icon' : ''} />
              {isSyncing ? '同步中...' : '重新整理榜單'}
            </button>
          </div>
        </div>

      </div>

      {activeTab === 'weekly' ? (
        /* 本週排行列表 */
        <div 
          className="glass-panel" 
          style={{ 
            padding: '26px',
            background: 'var(--theme-card, var(--theme-card, #fffdf9))',
            border: '2.5px solid var(--theme-border, #17324d)',
            borderRadius: '28px',
            boxShadow: '6px 6px 0px var(--theme-border, #17324d)'
          }}
        >
          {board.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px' }}>
              <Sparkles size={48} color="var(--theme-accent, var(--theme-accent, #ef8354))" style={{ margin: '0 auto 16px', display: 'block' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--theme-border, var(--theme-border, #17324d))', marginBottom: '8px' }}>
                本週全台積分榜虛位以待！
              </h3>
              <p style={{ color: '#78818a', fontSize: '0.92rem', maxWidth: '420px', margin: '0 auto 20px', lineHeight: 1.6 }}>
                答對題目即可斬獲積分並即時同步至全服榜單。快去開始今天的題庫挑戰，成為全台第一位上榜的會考霸主吧！
              </p>
              <button
                onClick={handleManualSync}
                className="btn btn-primary"
                style={{ padding: '10px 22px' }}
              >
                <RefreshCw size={16} /> 檢查雲端最新成績
              </button>
            </div>
          ) : (
            <>
              {/* 前三名領獎台 (Podium) */}
              {board.length >= 3 && (
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '16px', margin: '20px 0 40px', flexWrap: 'wrap' }}>
                  
                  {/* 第 2 名 (銀牌) */}
                  <div style={{ textAlign: 'center', order: 1 }}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img src={board[1].avatar} alt="" style={{ width: '64px', height: '64px', borderRadius: '50%', border: '3px solid var(--theme-border, #17324d)', background: '#dbe5ea' }} />
                      <span style={{ position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)', background: '#dbe5ea', color: '#58717d', border: '1.5px solid var(--theme-border, #17324d)', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 900 }}>
                        #2
                      </span>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', marginTop: '14px', color: 'var(--theme-border, var(--theme-border, #17324d))' }}>{board[1].displayName}</div>
                    <div style={{ color: '#58717d', fontWeight: 900, fontSize: '1.1rem' }}>{board[1].weeklyPoints} 點</div>
                  </div>

                  {/* 第 1 名 (置頂凸顯金牌) */}
                  <div style={{ textAlign: 'center', order: 2, transform: 'translateY(-14px)' }}>
                    <Crown size={28} color="var(--theme-accent, var(--theme-accent, #ef8354))" style={{ margin: '0 auto 4px' }} />
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img src={board[0].avatar} alt="" style={{ width: '80px', height: '80px', borderRadius: '50%', border: '3.5px solid var(--theme-border, #17324d)', background: '#fff7d9', boxShadow: '0 0 0 3px #f7cf68' }} />
                      <span style={{ position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)', background: '#f7cf68', color: 'var(--theme-border, var(--theme-border, #17324d))', border: '1.5px solid var(--theme-border, #17324d)', padding: '2px 10px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 900 }}>
                        #1 領先
                      </span>
                    </div>
                    <div style={{ fontWeight: 900, fontSize: '1.05rem', marginTop: '16px', color: 'var(--theme-border, var(--theme-border, #17324d))' }}>{board[0].displayName}</div>
                    <div style={{ color: 'var(--theme-accent, var(--theme-accent, #ef8354))', fontWeight: 900, fontSize: '1.35rem' }}>{board[0].weeklyPoints} 點</div>
                  </div>

                  {/* 第 3 名 (銅牌) */}
                  <div style={{ textAlign: 'center', order: 3 }}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img src={board[2].avatar} alt="" style={{ width: '64px', height: '64px', borderRadius: '50%', border: '3px solid var(--theme-border, #17324d)', background: '#efc4a5' }} />
                      <span style={{ position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)', background: '#efc4a5', color: '#995f3b', border: '1.5px solid var(--theme-border, #17324d)', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 900 }}>
                        #3
                      </span>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', marginTop: '14px', color: 'var(--theme-border, var(--theme-border, #17324d))' }}>{board[2].displayName}</div>
                    <div style={{ color: '#995f3b', fontWeight: 900, fontSize: '1.1rem' }}>{board[2].weeklyPoints} 點</div>
                  </div>

                </div>
              )}

              {/* 排行名單列表 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {board.map((player, index) => {
                  const isCurrentUser = player.userId === (currentUser?.id || 'guest_student');
                  return (
                    <div
                      key={player.userId || index}
                      style={{
                        padding: '14px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: isCurrentUser ? '2px solid var(--theme-accent, #ef8354)' : '1.5px solid #e8ded0',
                        background: isCurrentUser ? '#fff0e9' : 'var(--theme-bg, var(--theme-bg, #f8f3eb))',
                        borderRadius: '16px',
                        boxShadow: isCurrentUser ? '3px 3px 0px var(--theme-accent, #ef8354)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          width: '32px',
                          fontWeight: 900,
                          fontSize: '1.1rem',
                          color: index === 0 ? '#c8643d' : index === 1 ? '#58717d' : index === 2 ? '#995f3b' : '#78818a',
                          textAlign: 'center'
                        }}>
                          #{index + 1}
                        </div>

                        <img src={player.avatar} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1.5px solid var(--theme-border, #17324d)' }} />

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--theme-border, var(--theme-border, #17324d))' }}>
                              {player.displayName}
                            </span>
                            {isCurrentUser && (
                              <span className="badge badge-coral" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                                你
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#78818a', marginTop: '2px', fontWeight: 600 }}>
                            累積答對總點數：{player.totalPoints || player.weeklyPoints} 點
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--theme-accent, var(--theme-accent, #ef8354))' }}>
                          {player.weeklyPoints} <span style={{ fontSize: '0.8rem', color: '#78818a', fontWeight: 700 }}>點</span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#5b6772', fontWeight: 600 }}>
                          本週答對題目數
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

        </div>
      ) : (
        /* 歷史榮譽名人堂 (Hall of Fame) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {fameList.map((fame, idx) => (
            <div 
              key={idx} 
              className="glass-panel" 
              style={{ 
                padding: '24px',
                background: 'var(--theme-card, var(--theme-card, #fffdf9))',
                border: '2.5px solid var(--theme-border, #17324d)',
                borderRadius: '24px',
                boxShadow: '6px 6px 0px var(--theme-border, #17324d)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1.5px solid #e8ded0', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Crown size={20} color="var(--theme-accent, var(--theme-accent, #ef8354))" />
                  <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--theme-border, var(--theme-border, #17324d))' }}>
                    {fame.weekTitle}
                  </span>
                </div>
                <span className="badge badge-gold">{fame.weekId} 封存結算</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '260px' }}>
                  <img src={fame.champion.avatar} alt="" style={{ width: '56px', height: '56px', borderRadius: '50%', border: '2px solid var(--theme-border, #17324d)' }} />
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#78818a', fontWeight: 700 }}>週總冠軍霸主</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--theme-border, var(--theme-border, #17324d))' }}>
                      {fame.champion.displayName}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--theme-accent, var(--theme-accent, #ef8354))', fontWeight: 800 }}>
                      最終得分：{fame.champion.finalScore} 點
                    </div>
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: '260px', background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))', padding: '12px 16px', borderRadius: '14px', border: '1px solid #ded3c5' }}>
                  <div style={{ fontSize: '0.75rem', color: '#78818a', marginBottom: '4px', fontWeight: 700 }}>榮譽亞軍與季軍：</div>
                  {fame.runnersUp?.map((r, i) => (
                    <div key={i} style={{ fontSize: '0.85rem', color: '#5b6772', fontWeight: 600, padding: '2px 0' }}>
                      • {r}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
