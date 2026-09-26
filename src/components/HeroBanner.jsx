import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { useDevice } from '../context/DeviceContext';
import { getDailyPracticeStats, subscribeToCloudSync } from '../services/cloudStorage';
import { getStudentWeeklyPoints } from '../services/leaderboardService';
import { getRealTime } from '../services/timeService';
import { 
  Flame, 
  Sparkles, 
  Calendar, 
  Target, 
  ChevronRight, 
  Gift, 
  Ticket, 
  BookOpen,
  Trophy,
  Users,
  MessageCircle,
  FileText
} from 'lucide-react';

const EXAM_TARGETS = [
  { year: '117', label: '117 會考 (國一新生 / 目前國二衝刺)', date: '2028-05-20T08:30:00+08:00' },
  { year: '116', label: '116 會考 (國二學生 / 目前國三準考生)', date: '2027-05-15T08:30:00+08:00' },
  { year: '115', label: '115 會考 (目前國三應屆考生)', date: '2026-05-16T08:30:00+08:00' },
  { year: '114', label: '114 會考 (歷史)', date: '2025-05-17T08:30:00+08:00' }
];

export default function HeroBanner({ 
  onStartQuizTab, 
  onStartReinforceTab, 
  onStartLeaderboardTab,
  onOpenRedemptionModal,
  onOpenPrintExamModal,
  onGoNotesTab
}) {
  const { currentUser } = useAuth();
  const { isMobile } = useDevice();
  const { gameState, effectiveMultiplier, setIsLuckyDrawOpen } = useGame();

  const [selectedExamYear, setSelectedExamYear] = useState('117');
  const [examCountdown, setExamCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [dailyStats, setDailyStats] = useState({ count: 0, target: 10, correctCount: 0 });
  const [userWeeklyPoints, setUserWeeklyPoints] = useState(() => getStudentWeeklyPoints(currentUser));

  useEffect(() => {
    setUserWeeklyPoints(getStudentWeeklyPoints(currentUser));
  }, [currentUser]);

  useEffect(() => {
    const target = EXAM_TARGETS.find(e => e.year === selectedExamYear) || EXAM_TARGETS[0];
    const targetTime = new Date(target.date).getTime();

    const updateCountdown = () => {
      const now = getRealTime();
      const diff = Math.max(0, targetTime - now);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setExamCountdown({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [selectedExamYear]);

  useEffect(() => {
    const uId = currentUser?.id || 'guest';
    setDailyStats(getDailyPracticeStats(uId));
    setUserWeeklyPoints(getStudentWeeklyPoints(currentUser));

    // 監聽跨裝置雲端同步（手機做題後，電腦端即時接收推播更新今日目標與週排行榜累積點數）
    const unsub = subscribeToCloudSync((event) => {
      if (
        !event || 
        event.key === 'daily_stats' || 
        event.key === 'practice_history' || 
        event.key === 'leaderboard_players' ||
        event.key?.includes('leaderboard') ||
        (event.key && (event.key.startsWith('daily_stats_') || event.key.startsWith('practice_history_')))
      ) {
        setDailyStats(getDailyPracticeStats(uId));
        setUserWeeklyPoints(getStudentWeeklyPoints(currentUser));
      }
    });
    return unsub;
  }, [currentUser]);

  const progressPercent = Math.min(100, Math.round((dailyStats.count / dailyStats.target) * 100));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', marginBottom: '28px' }}>
      
      {/* 主標語與會考倒數英雄區 (Manus Paper Neo-brutalism) */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: isMobile ? '20px 16px' : '38px 34px', 
          position: 'relative', 
          overflow: 'hidden',
          background: 'var(--theme-card, var(--theme-card, #fffdf9))',
          border: '2.5px solid var(--theme-border, #17324d)',
          borderRadius: isMobile ? '20px' : '28px',
          boxShadow: isMobile ? '4px 4px 0px var(--theme-border, #17324d)' : '8px 8px 0px var(--theme-border, #17324d)'
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))', gap: isMobile ? '20px' : '32px', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          
          {/* 左側文案 */}
          <div>
            {/* 標籤小列 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', flexWrap: 'wrap' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.12em', color: 'var(--theme-accent, var(--theme-accent, #ef8354))', textTransform: 'uppercase' }}>
                <span className="pulse-dot" style={{ width: '9px', height: '9px', borderRadius: '50%', background: 'var(--theme-accent, var(--theme-accent, #ef8354))', display: 'inline-block' }} />
                117 會考準備中・每天前進一點點
              </div>

              {effectiveMultiplier > 1 && (
                <span className="badge badge-fire fire-pulse" style={{ padding: '4px 12px', fontSize: '0.78rem' }}>
                  <Flame size={14} /> 狂暴加倍中：{effectiveMultiplier}x 積分！
                </span>
              )}
            </div>

            {/* 大主標題 (把努力，變成分數) */}
            <h1 style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4.4rem)', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.04em', color: 'var(--theme-border, #17324d)', margin: '0 0 18px 0' }}>
              把努力，<br />
              <span style={{ position: 'relative', display: 'inline-block', color: 'var(--theme-accent, #ef8354)' }}>
                變成分數
                <span style={{ position: 'absolute', bottom: '4px', left: 0, width: '100%', height: '12px', background: 'var(--theme-accent-shadow, #f7cf68)', borderRadius: '9999px', zIndex: -1 }} />
              </span>。
            </h1>

            <p style={{ color: 'var(--theme-border, #5b6772)', opacity: 0.85, fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '28px', maxWidth: '520px', fontWeight: 600 }}>
              一個陪你準備會考的讀書基地。符合 108 課綱專屬題庫、每題詳解與思路提示、每週一排行榜歸零結算，和正在努力的同學一起穩穩上岸！
            </p>

            {/* 核心行動按鈕 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <button 
                type="button"
                onClick={onGoNotesTab} 
                className="btn"
                style={{ 
                  padding: '14px 26px', 
                  fontSize: '1.02rem',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                  color: '#ffffff',
                  border: '2.5px solid #312e81',
                  borderRadius: '16px',
                  boxShadow: '4px 4px 0px #312e81',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translate(-2px, -2px)';
                  e.currentTarget.style.boxShadow = '6px 6px 0px #312e81';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '4px 4px 0px #312e81';
                }}
                title="國中、高中各單元重點筆記、數學公式推導、題型範例與線上回報"
              >
                <BookOpen size={18} />
                📖 國高中重點筆記專區
              </button>

              <button 
                onClick={onStartQuizTab} 
                className="btn btn-primary"
                style={{ padding: '14px 28px', fontSize: '1.02rem' }}
              >
                <FileText size={18} />
                開始 AI 出題
              </button>

              <button 
                onClick={onStartReinforceTab} 
                className="btn btn-secondary"
                style={{ padding: '14px 22px', fontSize: '0.98rem' }}
              >
                <Sparkles size={18} color="var(--theme-accent, var(--theme-accent, #ef8354))" />
                錯題加強模式
              </button>

              <button 
                onClick={() => setIsLuckyDrawOpen(true)} 
                className="btn btn-gold"
                style={{ padding: '14px 20px', fontSize: '0.95rem' }}
              >
                <Gift size={18} />
                天天抽獎 ({gameState?.tickets ?? 1}張)
              </button>

              <button 
                type="button"
                onClick={onOpenPrintExamModal} 
                className="btn"
                style={{ 
                  padding: '14px 22px', 
                  fontSize: '0.98rem',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                  color: '#1e40af',
                  border: '2.5px solid #3b82f6',
                  borderRadius: '16px',
                  boxShadow: '4px 4px 0px #3b82f6',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
                title="紙本考卷列印下載 (直通官方下載中心 https://examcommunit-mdqeyikj.manus.space/ 與 A4 考卷輸出)"
              >
                <FileText size={18} color="#2563eb" />
                紙本考卷列印下載
              </button>

              <a 
                href="https://openchat.line.me/tw/cover/qOdlVtQ0IBp7wnGg00kPYDMbjLCp8VkH6WSExq042v3oIIRaPjKtYRPSK0I?utm_source=line-openchat-seo&utm_medium=search_keyword&utm_campaign=default"
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
                style={{ 
                  padding: '14px 22px', 
                  fontSize: '0.98rem',
                  fontWeight: 800,
                  background: '#06C755',
                  color: '#ffffff',
                  border: '2.5px solid var(--theme-border, #17324d)',
                  borderRadius: '16px',
                  boxShadow: '4px 4px 0px var(--theme-border, #17324d)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
              >
                <Users size={18} />
                加入群組一起討論
              </a>

              <a 
                href="https://line.me/R/ti/p/@418yswmd"
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
                style={{ 
                  padding: '14px 22px', 
                  fontSize: '0.98rem',
                  fontWeight: 800,
                  background: 'var(--theme-card, var(--theme-card, #fffdf9))',
                  color: '#06C755',
                  border: '2.5px solid #06C755',
                  borderRadius: '16px',
                  boxShadow: '4px 4px 0px #06C755',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translate(-2px, -2px)';
                  e.currentTarget.style.boxShadow = '6px 6px 0px #06C755';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '4px 4px 0px #06C755';
                }}
              >
                <MessageCircle size={18} />
                聯絡管理員
              </a>
            </div>
          </div>

          {/* 右側：會考倒數看板與今日練習卡 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* 會考倒數板 (溫暖紙張手帳風格) */}
            <div 
              style={{ 
                background: 'var(--theme-card, var(--theme-card, #fffdf9))', 
                border: '2.5px solid var(--theme-border, #17324d)', 
                borderRadius: '24px', 
                padding: '22px',
                boxShadow: '6px 6px 0px #f7cf68'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={20} color="var(--theme-border, var(--theme-border, #17324d))" />
                  <span style={{ fontWeight: 800, fontSize: '1.02rem', color: 'var(--theme-border, var(--theme-border, #17324d))' }}>
                    距離 {selectedExamYear} 會考倒數
                  </span>
                </div>
                <select 
                  value={selectedExamYear} 
                  onChange={(e) => setSelectedExamYear(e.target.value)}
                  style={{
                    background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))',
                    color: 'var(--theme-border, var(--theme-border, #17324d))',
                    border: '2px solid var(--theme-border, #17324d)',
                    borderRadius: '10px',
                    padding: '5px 12px',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  <option value="117">117 會考</option>
                  <option value="116">116 會考</option>
                </select>
              </div>

              {/* 倒數時鐘大數字 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', textAlign: 'center' }}>
                <div style={{ background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))', borderRadius: '16px', padding: '12px 6px', border: '2px solid var(--theme-border, #17324d)', boxShadow: '2px 2px 0px var(--theme-border, #17324d)' }}>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--theme-accent, var(--theme-accent, #ef8354))' }}>
                    {examCountdown.days}
                  </div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#5b6772' }}>天</div>
                </div>
                <div style={{ background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))', borderRadius: '16px', padding: '12px 6px', border: '2px solid var(--theme-border, #17324d)', boxShadow: '2px 2px 0px var(--theme-border, #17324d)' }}>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--theme-border, #17324d)' }}>
                    {String(examCountdown.hours).padStart(2, '0')}
                  </div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#5b6772' }}>時</div>
                </div>
                <div style={{ background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))', borderRadius: '16px', padding: '12px 6px', border: '2px solid var(--theme-border, #17324d)', boxShadow: '2px 2px 0px var(--theme-border, #17324d)' }}>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--theme-border, #17324d)' }}>
                    {String(examCountdown.minutes).padStart(2, '0')}
                  </div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#5b6772' }}>分</div>
                </div>
                <div style={{ background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))', borderRadius: '16px', padding: '12px 6px', border: '2px solid var(--theme-border, #17324d)', boxShadow: '2px 2px 0px var(--theme-border, #17324d)' }}>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--theme-accent, var(--theme-accent, #ef8354))' }}>
                    {String(examCountdown.seconds).padStart(2, '0')}
                  </div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#5b6772' }}>秒</div>
                </div>
              </div>
            </div>

            {/* 今日練習卡片 */}
            <div 
              style={{ 
                background: 'var(--theme-card, var(--theme-card, #fffdf9))', 
                border: '2.5px solid var(--theme-border, #17324d)', 
                borderRadius: '24px', 
                padding: '20px 22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: '6px 6px 0px var(--theme-border, #17324d)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Target size={20} color="#347650" />
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--theme-border, var(--theme-border, #17324d))' }}>今日練習目標</span>
                </div>
                <span style={{ fontSize: '0.9rem', color: '#347650', fontWeight: 900 }}>
                  {dailyStats.count} / {dailyStats.target} 題 ({progressPercent}%)
                </span>
              </div>

              {/* 實體邊框進度條 */}
              <div style={{ height: '12px', background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))', border: '2px solid var(--theme-border, #17324d)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    width: `${progressPercent}%`, 
                    background: 'linear-gradient(90deg, var(--theme-accent, #ef8354), #f7cf68)', 
                    borderRadius: '9999px',
                    transition: 'width 0.4s ease'
                  }} 
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: '#5b6772' }}>
                <span>答對一題即得 1 點週排行榜點數</span>
                <span style={{ color: 'var(--theme-accent, var(--theme-accent, #ef8354))' }}>本週累積：{userWeeklyPoints} 點</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* 快捷功能卡片列 (序號兌換、社群打氣牆、每週排行榜) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        
        <div 
          onClick={onOpenRedemptionModal}
          className="glass-panel" 
          style={{ 
            padding: '18px 22px', 
            borderRadius: '20px', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'var(--theme-accent-shadow-light, #fff7d9)', border: '2px solid var(--theme-border, #17324d)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--theme-accent, #806523)' }}>
              <Ticket size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--theme-border, #17324d)' }}>輸入兌換碼</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--theme-border, #5b6772)', opacity: 0.8, fontWeight: 700 }}>領取點數與限時暴擊卡</div>
            </div>
          </div>
          <ChevronRight size={20} color="var(--theme-border, #17324d)" />
        </div>


        <div 
          onClick={onStartLeaderboardTab}
          className="glass-panel" 
          style={{ 
            padding: '18px 22px', 
            borderRadius: '20px', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'var(--theme-shadow-light, #e8f0f2)', border: '2px solid var(--theme-border, #17324d)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--theme-border, #48717e)' }}>
              <Trophy size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--theme-border, #17324d)' }}>每週一歸零競技榜</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--theme-border, #5b6772)', opacity: 0.8, fontWeight: 700 }}>歷史名人堂榮譽典藏</div>
            </div>
          </div>
          <ChevronRight size={20} color="var(--theme-border, #17324d)" />
        </div>

      </div>

    </div>
  );
}
