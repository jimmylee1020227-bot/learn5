import React, { useState, useEffect, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { 
  Trophy, 
  RotateCcw, 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  Award,
  Filter,
  BarChart3,
  Clock,
  Target,
  ChevronRight,
  Flame,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function QuizResult({ results, timeSpentSec, onRetry, onGoReinforce, onBackHome }) {
  const { effectiveMultiplier } = useGame();
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'wrong' | 'correct'
  const [activeHighlightIdx, setActiveHighlightIdx] = useState(null);

  const totalCount = results.length;
  const correctCount = results.filter(r => r.isCorrect).length;
  const wrongCount = totalCount - correctCount;
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  const earnedPoints = correctCount * effectiveMultiplier;
  const avgSecPerQ = totalCount > 0 ? Math.round(timeSpentSec / totalCount) : 0;

  // 會考等第評估
  const capInfo = useMemo(() => {
    if (accuracy >= 90) return { grade: 'A++', title: '精熟頂尖', desc: '實力極為卓越！會考前三志願穩固落點，請持續維持手感！', color: '#15803d', bg: '#dcfce7', border: '#86efac' };
    if (accuracy >= 80) return { grade: 'A+', title: '精熟優良', desc: '表現優秀！稍微補強少數盲點觀念即可直衝 A++！', color: '#166534', bg: '#dcfce7', border: '#86efac' };
    if (accuracy >= 70) return { grade: 'A', title: '精熟等級', desc: '核心概念通透，多數典型題型皆已融會貫通！', color: '#1d4ed8', bg: '#dbeafe', border: '#93c5fd' };
    if (accuracy >= 60) return { grade: 'B++', title: '基礎良好', desc: '實力具備！將本次錯題詳解消化後，即可跨入精熟 A 等級！', color: '#c2410c', bg: '#ffedd5', border: '#fdba74' };
    if (accuracy >= 50) return { grade: 'B+', title: '基礎穩定', desc: '基礎題型多已掌握，建議多加強觀念推導題型！', color: '#b45309', bg: '#fef3c7', border: '#fcd34d' };
    if (accuracy >= 40) return { grade: 'B', title: '基礎尚可', desc: '建議重溫基礎定義與觀念，並透過錯題本加強練習！', color: '#9a3412', bg: '#ffedd5', border: '#fdba74' };
    return { grade: 'C', title: '待加強', desc: '別灰心！仔細精讀題目思路與詳解，打穩基礎最關鍵！', color: '#b91c1c', bg: '#fee2e2', border: '#fca5a5' };
  }, [accuracy]);

  // 單元學力掌握度診斷
  const unitDiagnostics = useMemo(() => {
    const map = {};
    results.forEach(r => {
      const u = r.unitName || '綜合複習單元';
      if (!map[u]) {
        map[u] = { unit: u, total: 0, correct: 0, concepts: new Set() };
      }
      map[u].total += 1;
      if (r.isCorrect) map[u].correct += 1;
      if (r.conceptTag) map[u].concepts.add(r.conceptTag);
    });
    return Object.values(map).map(item => ({
      ...item,
      accuracy: Math.round((item.correct / item.total) * 100),
      concepts: Array.from(item.concepts)
    }));
  }, [results]);

  useEffect(() => {
    if (accuracy >= 60) {
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    }
  }, [accuracy]);

  // 篩選題目
  const filteredList = useMemo(() => {
    return results.map((q, idx) => ({ ...q, originalIndex: idx })).filter(q => {
      if (filterMode === 'wrong') return !q.isCorrect;
      if (filterMode === 'correct') return q.isCorrect;
      return true;
    });
  }, [results, filterMode]);

  // 點擊答題卡跳轉至該題
  const handleJumpToQuestion = (origIdx) => {
    if (filterMode === 'wrong' && results[origIdx].isCorrect) {
      setFilterMode('all');
    } else if (filterMode === 'correct' && !results[origIdx].isCorrect) {
      setFilterMode('all');
    }

    setActiveHighlightIdx(origIdx);
    setTimeout(() => {
      const targetEl = document.getElementById(`result-question-${origIdx}`);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setTimeout(() => setActiveHighlightIdx(null), 2500);
    }, 100);
  };

  const formatDifficultyStars = (diff) => {
    if (diff === 'hard') return '★★★ 鑑別挑戰';
    if (diff === 'medium') return '★★☆ 中等標準';
    return '★☆☆ 基礎核心';
  };

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* 1. 翰林雲端學院風格：成績總結與會考落點診斷卡 */}
      <div 
        style={{
          background: 'var(--theme-card, var(--theme-card, #fffdf9))',
          border: '2.5px solid var(--theme-border, #17324d)',
          borderRadius: '24px',
          padding: '32px 28px',
          boxShadow: '8px 8px 0px var(--theme-border, #17324d)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}
      >
        {/* 卡片標頭列 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #ede3d5', paddingBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--theme-border, var(--theme-border, #17324d))', color: '#f7cf68', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '3px 3px 0px var(--theme-accent, #ef8354)' }}>
              <Trophy size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--theme-accent, var(--theme-accent, #ef8354))', letterSpacing: '0.05em' }}>
                E-HANLIN DIAGNOSTIC REPORT
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--theme-border, var(--theme-border, #17324d))', margin: 0 }}>
                翰林雲端學院｜學力診斷結算報告
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-coral" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
              108 會考課綱
            </span>
            <span style={{ fontSize: '0.78rem', color: '#78818a', fontWeight: 600 }}>
              作答已自動同步至週排行榜
            </span>
          </div>
        </div>

        {/* 成績核心面板：左側會考等級大徽章，右側核心數據指標 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'stretch' }}>
          
          {/* 左側：會考等級落點勳章 */}
          <div 
            style={{
              background: capInfo.bg,
              border: `2px solid ${capInfo.border}`,
              borderRadius: '20px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              boxShadow: '4px 4px 0px var(--theme-border, #17324d)'
            }}
          >
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: capInfo.color, letterSpacing: '0.04em' }}>
              會考實力等第評估
            </span>

            <div style={{ fontSize: '3.8rem', fontWeight: 900, color: capInfo.color, lineHeight: 1.1, margin: '8px 0', fontFamily: 'var(--font-mono)' }}>
              {capInfo.grade}
            </div>

            <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--theme-border, var(--theme-border, #17324d))' }}>
              {capInfo.title}
            </div>

            <p style={{ fontSize: '0.82rem', color: '#4b5563', margin: '8px 0 0', lineHeight: 1.5, fontWeight: 600 }}>
              {capInfo.desc}
            </p>
          </div>

          {/* 右側：精準四項數據矩陣 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            
            <div style={{ background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))', border: '1.5px solid #ded3c5', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#78818a' }}>測驗總得分</span>
              <div style={{ fontSize: '2.1rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--theme-border, var(--theme-border, #17324d))', margin: '2px 0' }}>
                {accuracy} <span style={{ fontSize: '1rem', fontWeight: 700, color: '#78818a' }}>分</span>
              </div>
              <span style={{ fontSize: '0.74rem', color: '#5b6772', fontWeight: 600 }}>
                正答率 {accuracy}%
              </span>
            </div>

            <div style={{ background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))', border: '1.5px solid #ded3c5', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#78818a' }}>答對 / 總題數</span>
              <div style={{ fontSize: '2.1rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#15803d', margin: '2px 0' }}>
                {correctCount} <span style={{ fontSize: '1rem', fontWeight: 700, color: '#78818a' }}>/ {totalCount}</span>
              </div>
              <span style={{ fontSize: '0.74rem', color: wrongCount > 0 ? '#b91c1c' : '#15803d', fontWeight: 700 }}>
                {wrongCount > 0 ? `${wrongCount} 題需強化` : '全對滿分 💯'}
              </span>
            </div>

            <div style={{ background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))', border: '1.5px solid #ded3c5', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#78818a' }}>獲得週排行榜點數</span>
              <div style={{ fontSize: '2.1rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--theme-accent, var(--theme-accent, #ef8354))', margin: '2px 0' }}>
                +{earnedPoints}
              </div>
              <span style={{ fontSize: '0.74rem', color: '#5b6772', fontWeight: 600 }}>
                {effectiveMultiplier > 1 ? `含 ${effectiveMultiplier}x 暴擊加成` : '標準 1 題 1 點'}
              </span>
            </div>

            <div style={{ background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))', border: '1.5px solid #ded3c5', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#78818a' }}>作答總耗時</span>
              <div style={{ fontSize: '2.1rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--theme-border, var(--theme-border, #17324d))', margin: '2px 0' }}>
                {Math.floor(timeSpentSec / 60)}:{(timeSpentSec % 60).toString().padStart(2, '0')}
              </div>
              <span style={{ fontSize: '0.74rem', color: '#5b6772', fontWeight: 600 }}>
                均題 {avgSecPerQ} 秒
              </span>
            </div>

          </div>

        </div>

        {/* 快捷行動按鈕列 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '12px', paddingTop: '10px' }}>
          <button 
            onClick={onRetry} 
            className="btn btn-secondary"
            style={{ borderRadius: '14px', padding: '10px 18px', fontSize: '0.86rem', fontWeight: 800, gap: '6px' }}
          >
            <RotateCcw size={15} />
            換一批全新題目
          </button>
          
          {wrongCount > 0 && (
            <button 
              onClick={onGoReinforce} 
              className="btn btn-primary"
              style={{ borderRadius: '14px', padding: '10px 22px', fontSize: '0.86rem', fontWeight: 800, gap: '6px', boxShadow: '0 5px 0 #d76740' }}
            >
              <Sparkles size={16} />
              進入「錯題加強模式」複習
            </button>
          )}

          <button 
            onClick={onBackHome} 
            className="btn btn-navy"
            style={{ borderRadius: '14px', padding: '10px 20px', fontSize: '0.86rem', fontWeight: 800, gap: '6px' }}
          >
            返回題庫工作台
            <ArrowRight size={15} />
          </button>
        </div>

      </div>

      {/* 2. 翰林雲端學院特有：單元學力掌握度診斷清單 */}
      <div 
        style={{
          background: 'var(--theme-card, var(--theme-card, #fffdf9))',
          border: '2px solid var(--theme-border, #17324d)',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '4px 4px 0px var(--theme-border, #17324d)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={20} color="var(--theme-accent, var(--theme-accent, #ef8354))" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--theme-border, var(--theme-border, #17324d))', margin: 0 }}>
              各單元概念精熟掌握度分析
            </h3>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#78818a', fontWeight: 600 }}>
            針對掌握率低於 60% 的單元建議點擊加入錯題本加強
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {unitDiagnostics.map(item => {
            const isMastered = item.accuracy >= 80;
            const isWeak = item.accuracy < 60;
            const statusColor = isMastered ? '#15803d' : isWeak ? '#c8643d' : '#d97706';
            const statusBg = isMastered ? '#e8f6ed' : isWeak ? '#fff0e9' : '#fef3c7';

            return (
              <div 
                key={item.unit}
                style={{
                  background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))',
                  border: '1.5px solid #ded3c5',
                  borderRadius: '14px',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '220px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--theme-border, var(--theme-border, #17324d))' }}>
                      {item.unit}
                    </span>
                    <span 
                      style={{ 
                        fontSize: '0.72rem', 
                        fontWeight: 800, 
                        color: statusColor, 
                        background: statusBg, 
                        padding: '2px 8px', 
                        borderRadius: '6px',
                        border: `1px solid ${statusColor}33`
                      }}
                    >
                      {isMastered ? '精熟掌握 ✓' : isWeak ? '⚠️ 弱點單元' : '基礎良好'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' }}>
                    {item.concepts.map(c => (
                      <span key={c} style={{ fontSize: '0.7rem', color: '#78818a', background: 'var(--theme-card, var(--theme-card, #fffdf9))', padding: '1px 6px', borderRadius: '4px', border: '1px solid #ded3c5' }}>
                        #{c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 掌握度進度條與數據 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '200px' }}>
                  <div style={{ flex: 1, height: '8px', background: '#ded3c5', borderRadius: '4px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        width: `${item.accuracy}%`, 
                        height: '100%', 
                        background: isMastered ? '#15803d' : isWeak ? 'var(--theme-accent, var(--theme-accent, #ef8354))' : '#f59e0b',
                        borderRadius: '4px',
                        transition: 'width 0.4s ease'
                      }} 
                    />
                  </div>
                  <div style={{ textAlign: 'right', minWidth: '68px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '0.95rem', color: statusColor }}>
                      {item.accuracy}%
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#78818a', display: 'block' }}>
                      {item.correct}/{item.total} 題
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 翰林雲端學院核心：答題卡題號總覽矩陣與快速篩選 */}
      <div 
        style={{
          background: 'var(--theme-card, var(--theme-card, #fffdf9))',
          border: '2px solid var(--theme-border, #17324d)',
          borderRadius: '20px',
          padding: '20px 24px',
          boxShadow: '4px 4px 0px var(--theme-border, #17324d)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={18} color="var(--theme-accent, var(--theme-accent, #ef8354))" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--theme-border, var(--theme-border, #17324d))', margin: 0 }}>
              作答答題卡總覽 (點擊題號立即滾動定位至詳解)
            </h3>
          </div>

          {/* 篩選標籤 */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setFilterMode('all')}
              style={{
                background: filterMode === 'all' ? 'var(--theme-border, var(--theme-border, #17324d))' : 'var(--theme-bg, var(--theme-bg, #f8f3eb))',
                color: filterMode === 'all' ? '#fff' : 'var(--theme-border, var(--theme-border, #17324d))',
                border: '1.5px solid var(--theme-border, #17324d)',
                borderRadius: '8px',
                padding: '4px 12px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              全部題目 ({totalCount})
            </button>
            <button
              onClick={() => setFilterMode('wrong')}
              style={{
                background: filterMode === 'wrong' ? '#b91c1c' : 'var(--theme-bg, var(--theme-bg, #f8f3eb))',
                color: filterMode === 'wrong' ? '#fff' : '#b91c1c',
                border: '1.5px solid #b91c1c',
                borderRadius: '8px',
                padding: '4px 12px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              ⚠️ 僅看錯題 ({wrongCount})
            </button>
            <button
              onClick={() => setFilterMode('correct')}
              style={{
                background: filterMode === 'correct' ? '#15803d' : 'var(--theme-bg, var(--theme-bg, #f8f3eb))',
                color: filterMode === 'correct' ? '#fff' : '#15803d',
                border: '1.5px solid #15803d',
                borderRadius: '8px',
                padding: '4px 12px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              ✓ 僅看答對 ({correctCount})
            </button>
          </div>
        </div>

        {/* 題號按鈕矩陣 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {results.map((q, idx) => {
            const isCorrect = q.isCorrect;
            const isUnanswered = q.userChoice === undefined;
            const isTarget = activeHighlightIdx === idx;

            return (
              <button
                key={idx}
                onClick={() => handleJumpToQuestion(idx)}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  border: isTarget ? '2.5px solid var(--theme-accent, #ef8354)' : '1.5px solid var(--theme-border, #17324d)',
                  background: isCorrect ? '#15803d' : isUnanswered ? '#9aa2a8' : '#c8643d',
                  color: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.76rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: isTarget ? '0 0 8px var(--theme-accent, #ef8354)' : '2px 2px 0px var(--theme-border, #17324d)',
                  transform: isTarget ? 'scale(1.1)' : 'none',
                  transition: 'all 0.2s ease'
                }}
                title={`第 ${idx + 1} 題：${isCorrect ? '答對' : '答錯'}，點擊查看詳解`}
              >
                <span>{idx + 1}</span>
                <span style={{ fontSize: '0.62rem', lineHeight: 1 }}>
                  {isCorrect ? '✓' : isUnanswered ? '-' : '✗'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. 逐題翰林名師詳解列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 900, color: 'var(--theme-border, var(--theme-border, #17324d))' }}>
            <BookOpen size={20} color="var(--theme-accent, var(--theme-accent, #ef8354))" />
            <span>題目詳解與翰林破題思路分析</span>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#78818a', fontWeight: 600 }}>
            目前顯示：{filterMode === 'wrong' ? '僅看錯題' : filterMode === 'correct' ? '僅看答對' : '全部題型'}（共 {filteredList.length} 題）
          </span>
        </div>

        {filteredList.map((q) => {
          const idx = q.originalIndex;
          const isCorrect = q.isCorrect;
          const isUnanswered = q.userChoice === undefined;
          const userChoiceLetter = q.userChoice !== undefined ? String.fromCharCode(65 + q.userChoice) : '無作答';
          const answerLetter = String.fromCharCode(65 + q.answer);
          const isHighlighted = activeHighlightIdx === idx;

          return (
            <div 
              id={`result-question-${idx}`}
              key={q.id || idx}
              style={{
                background: 'var(--theme-card, var(--theme-card, #fffdf9))',
                border: isHighlighted ? '2.5px solid var(--theme-accent, #ef8354)' : '2px solid var(--theme-border, #17324d)',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: isHighlighted ? '0 0 16px rgba(239, 131, 84, 0.3), 4px 4px 0px var(--theme-border, #17324d)' : '4px 4px 0px var(--theme-border, #17324d)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                transition: 'all 0.3s ease'
              }}
            >
              {/* 題卡標題列 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1.5px solid #ede3d5', pb: '12px', paddingBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ background: 'var(--theme-border, var(--theme-border, #17324d))', color: '#fff', padding: '4px 10px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 900 }}>
                    第 {idx + 1} 題
                  </span>
                  <span style={{ background: '#e8f0f2', color: '#48717e', padding: '4px 10px', borderRadius: '8px', fontSize: '0.76rem', fontWeight: 800 }}>
                    {q.unitName}
                  </span>
                  <span style={{ background: '#fff7d9', color: '#806523', border: '1px solid #ded3c5', padding: '3px 8px', borderRadius: '8px', fontSize: '0.74rem', fontWeight: 800 }}>
                    #{q.conceptTag}
                  </span>
                  <span style={{ fontSize: '0.74rem', color: '#78818a', fontWeight: 700 }}>
                    {formatDifficultyStars(q.difficulty)}
                  </span>
                </div>

                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    fontWeight: 900,
                    background: isCorrect ? '#e8f6ed' : isUnanswered ? '#f3f4f6' : '#fff0e9',
                    color: isCorrect ? '#15803d' : isUnanswered ? '#4b5563' : '#b91c1c',
                    border: `1.5px solid ${isCorrect ? '#86efac' : isUnanswered ? '#ded3c5' : '#fca5a5'}`
                  }}
                >
                  {isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                  <span>{isCorrect ? '答對 (+1 點)' : isUnanswered ? '未作答' : '答錯 (收錄至錯題本)'}</span>
                </div>
              </div>

              {/* 題幹內容 */}
              <div style={{ fontSize: '1.02rem', fontWeight: 700, color: 'var(--theme-border, var(--theme-border, #17324d))', lineHeight: 1.8 }}>
                {q.question}
              </div>

              {/* 選項列表對照排版 (A, B, C, D) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {q.options.map((opt, optIdx) => {
                  const letter = String.fromCharCode(65 + optIdx);
                  const isUserPick = q.userChoice === optIdx;
                  const isRightAns = q.answer === optIdx;

                  let border = '1.5px solid #ded3c5';
                  let bg = 'var(--theme-card, var(--theme-card, #fffdf9))';
                  let textColor = '#2d3748';
                  let badge = null;

                  if (isRightAns && isUserPick) {
                    border = '2px solid #15803d';
                    bg = '#e8f6ed';
                    textColor = '#15803d';
                    badge = <span style={{ marginLeft: 'auto', background: '#15803d', color: '#fff', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>你的作答（標準答案 ✓）</span>;
                  } else if (isUserPick && !isRightAns) {
                    border = '2px solid #b91c1c';
                    bg = '#fff0e9';
                    textColor = '#b91c1c';
                    badge = <span style={{ marginLeft: 'auto', background: '#b91c1c', color: '#fff', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>你的作答 ✗</span>;
                  } else if (isRightAns) {
                    border = '2px solid #15803d';
                    bg = '#e8f6ed';
                    textColor = '#15803d';
                    badge = <span style={{ marginLeft: 'auto', background: '#15803d', color: '#fff', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>標準答案 ✓</span>;
                  }

                  return (
                    <div 
                      key={optIdx}
                      style={{
                        background: bg,
                        border: border,
                        borderRadius: '12px',
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '0.9rem',
                        fontWeight: (isUserPick || isRightAns) ? 800 : 600,
                        color: textColor
                      }}
                    >
                      <span 
                        style={{ 
                          width: '24px', 
                          height: '24px', 
                          borderRadius: '50%', 
                          background: isRightAns ? '#15803d' : isUserPick ? '#b91c1c' : 'var(--theme-bg, var(--theme-bg, #f8f3eb))',
                          color: (isRightAns || isUserPick) ? '#fff' : 'var(--theme-border, var(--theme-border, #17324d))',
                          border: '1px solid #ded3c5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.78rem',
                          fontWeight: 900
                        }}
                      >
                        {letter}
                      </span>
                      <span>{opt}</span>
                      {badge}
                    </div>
                  );
                })}
              </div>

              {/* 翰林解題關鍵（破題思路） */}
              {q.hint && (
                <div 
                  style={{ 
                    background: '#fff9e6', 
                    border: '1.5px solid #f6d884', 
                    borderRadius: '12px', 
                    padding: '12px 16px', 
                    fontSize: '0.85rem', 
                    color: '#806523',
                    lineHeight: 1.6,
                    fontWeight: 600
                  }}
                >
                  <div style={{ fontWeight: 900, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    💡 翰林思路點撥（解題破題關鍵）：
                  </div>
                  {q.hint}
                </div>
              )}

              {/* 翰林名師精闢解析 */}
              <div 
                style={{ 
                  background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))', 
                  border: '1.5px solid #ded3c5', 
                  borderRadius: '14px', 
                  padding: '16px', 
                  fontSize: '0.88rem', 
                  color: '#2d3748',
                  lineHeight: 1.8,
                  whiteSpace: 'pre-line'
                }}
              >
                <div style={{ fontWeight: 900, color: 'var(--theme-border, var(--theme-border, #17324d))', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  📖 翰林名師詳細解析與步驟推導：
                </div>
                {q.explanation}
              </div>

            </div>
          );
        })}
      </div>

      {/* 頁尾行動按鈕 */}
      <div 
        style={{ 
          background: 'var(--theme-card, var(--theme-card, #fffdf9))', 
          border: '2px solid var(--theme-border, #17324d)', 
          borderRadius: '20px', 
          padding: '20px 24px', 
          boxShadow: '4px 4px 0px var(--theme-border, #17324d)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        <div style={{ fontSize: '0.85rem', color: '#5b6772', fontWeight: 600 }}>
          💡 複習小秘訣：針對錯題，建議進入「錯題加強模式」進行同概念反覆演練，直到融會貫通！
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {wrongCount > 0 && (
            <button 
              onClick={onGoReinforce} 
              className="btn btn-primary"
              style={{ borderRadius: '12px', padding: '8px 18px', fontSize: '0.85rem', fontWeight: 800 }}
            >
              <Sparkles size={15} />
              進行錯題加強
            </button>
          )}
          <button 
            onClick={onRetry} 
            className="btn btn-secondary"
            style={{ borderRadius: '12px', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 800 }}
          >
            換批新題測驗
          </button>
          <button 
            onClick={onBackHome} 
            className="btn btn-navy"
            style={{ borderRadius: '12px', padding: '8px 18px', fontSize: '0.85rem', fontWeight: 800 }}
          >
            返回題庫
          </button>
        </div>
      </div>

    </div>
  );
}
