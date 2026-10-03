import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  BarChart3, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  TrendingUp, 
  Zap, 
  BookOpen, 
  ArrowRight, 
  Award,
  ChevronRight,
  Filter,
  Check,
  Flame,
  Target
} from 'lucide-react';
import { calculateStudentUnitMastery } from '../services/classService';
import { SUBJECTS, GRADES } from '../data/curriculum108';

export default function LearningProgressModal({ isOpen, onClose, studentUser, onStartUnitQuiz }) {
  if (!isOpen) return null;

  const targetStudent = studentUser || { id: 'guest_student', displayName: '同學' };
  const [selectedSubject, setSelectedSubject] = useState('math');
  const [selectedGrade, setSelectedGrade] = useState('g8');
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'weak' | 'mastered'

  const masteryData = useMemo(() => {
    return calculateStudentUnitMastery(targetStudent.id);
  }, [targetStudent.id, isOpen]);

  const activeUnits = useMemo(() => {
    if (!masteryData || !masteryData.subjectMastery) return [];
    const subjObj = masteryData.subjectMastery[selectedSubject];
    if (!subjObj || !subjObj.grades) return [];
    const list = subjObj.grades[selectedGrade] || [];
    if (filterStatus === 'ALL') return list;
    return list.filter(u => u.status === filterStatus);
  }, [masteryData, selectedSubject, selectedGrade, filterStatus]);

  // 計算選中科目的總結數據
  const subjectSummary = useMemo(() => {
    if (!masteryData || !masteryData.subjectMastery) return { attempted: 0, accuracy: 0, weakCount: 0 };
    const subjObj = masteryData.subjectMastery[selectedSubject];
    if (!subjObj || !subjObj.grades) return { attempted: 0, accuracy: 0, weakCount: 0 };
    let totalQ = 0;
    let correctQ = 0;
    let weakC = 0;
    Object.values(subjObj.grades).forEach(units => {
      (units || []).forEach(u => {
        totalQ += u.total;
        correctQ += u.correct;
        if (u.status === 'weak') weakC += 1;
      });
    });
    return {
      attempted: totalQ,
      accuracy: totalQ > 0 ? Math.round((correctQ / totalQ) * 100) : 0,
      weakCount: weakC
    };
  }, [masteryData, selectedSubject]);

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
          maxWidth: '920px',
          maxHeight: '92vh',
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
            justifyContent: 'space-between',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div 
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'var(--theme-accent, #ef8354)',
                border: '2px solid var(--theme-border, #17324d)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '3px 3px 0px var(--theme-border, #17324d)'
              }}
            >
              <BarChart3 size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: 'var(--theme-border, #17324d)' }}>
                  課綱單元掌握度與學習進度表
                </h2>
                <span 
                  style={{
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    background: '#e0f2fe',
                    color: '#0369a1',
                    border: '1px solid #7dd3fc'
                  }}
                >
                  {targetStudent.displayName || targetStudent.name || '同學'}
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                依據個人做題歷程與錯題本進行大數據觀念診斷，精準標記強勢與弱項單元
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#ffffff',
              border: '2px solid var(--theme-border, #17324d)',
              borderRadius: '12px',
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '2px 2px 0px var(--theme-border, #17324d)',
              transition: 'transform 0.1s ease'
            }}
          >
            <X size={20} color="var(--theme-border, #17324d)" />
          </button>
        </div>

        {/* 核心內容區 (滾動) */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* 全局指標摘要看板 */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px'
            }}
          >
            <div 
              style={{
                background: '#ffffff',
                border: '2px solid var(--theme-border, #17324d)',
                borderRadius: '16px',
                padding: '14px 16px',
                boxShadow: '3px 3px 0px var(--theme-border, #17324d)'
              }}
            >
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={15} color="#f59e0b" /> 累積實戰題數
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--theme-border, #17324d)', marginTop: '4px' }}>
                {masteryData?.totalAttemptedQuestions || 0} <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>題</span>
              </div>
            </div>

            <div 
              style={{
                background: '#f0fdf4',
                border: '2px solid #22c55e',
                borderRadius: '16px',
                padding: '14px 16px',
                boxShadow: '3px 3px 0px #16a34a'
              }}
            >
              <div style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={15} color="#16a34a" /> 🟢 精熟單元數 (≥85%)
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#15803d', marginTop: '4px' }}>
                {masteryData?.totalMasteredUnits || 0} <span style={{ fontSize: '0.85rem', color: '#86efac' }}>個</span>
              </div>
            </div>

            <div 
              style={{
                background: '#fef2f2',
                border: '2px solid #ef4444',
                borderRadius: '16px',
                padding: '14px 16px',
                boxShadow: '3px 3px 0px #dc2626'
              }}
            >
              <div style={{ fontSize: '0.8rem', color: '#dc2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={15} color="#dc2626" /> 🔴 待加強弱項單元
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#b91c1c', marginTop: '4px' }}>
                {masteryData?.totalWeakUnits || 0} <span style={{ fontSize: '0.85rem', color: '#fca5a5' }}>個</span>
              </div>
            </div>
          </div>

          {/* 科目切換標籤 */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {SUBJECTS.map(subj => {
              const isSelected = selectedSubject === subj.id;
              return (
                <button
                  key={subj.id}
                  onClick={() => setSelectedSubject(subj.id)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '14px',
                    border: '2px solid var(--theme-border, #17324d)',
                    background: isSelected ? 'var(--theme-border, #17324d)' : '#ffffff',
                    color: isSelected ? '#ffffff' : 'var(--theme-border, #17324d)',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: isSelected ? 'none' : '3px 3px 0px var(--theme-border, #17324d)',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span>{subj.name}</span>
                </button>
              );
            })}
          </div>

          {/* 年級切換 & 篩選狀態 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            {/* 年級按鈕組 */}
            <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '12px', border: '1.5px solid #cbd5e1' }}>
              {[
                { id: 'g7', name: '國一 (七年級)' },
                { id: 'g8', name: '國二 (八年級)' },
                { id: 'g9', name: '國三 (九年級)' },
                { id: 'h1', name: '高中 (必修)' }
              ].map(g => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGrade(g.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: selectedGrade === g.id ? '#ffffff' : 'transparent',
                    color: selectedGrade === g.id ? 'var(--theme-border, #17324d)' : '#64748b',
                    fontWeight: selectedGrade === g.id ? 900 : 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    boxShadow: selectedGrade === g.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  {g.name}
                </button>
              ))}
            </div>

            {/* 狀態過濾 */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>篩選：</span>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--theme-border, #17324d)',
                  background: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: 'var(--theme-border, #17324d)'
                }}
              >
                <option value="ALL">全部單元</option>
                <option value="weak">🔴 待加強弱項</option>
                <option value="mastered">🟢 已精通單元</option>
              </select>
            </div>
          </div>

          {/* 課綱單元清單卡片 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeUnits.length === 0 ? (
              <div 
                style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  background: '#ffffff',
                  border: '2px dashed #cbd5e1',
                  borderRadius: '18px',
                  color: '#94a3b8'
                }}
              >
                <BookOpen size={40} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#64748b' }}>此分類下暫無符合單元</div>
                <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>完成更多平時練習或作業後，系統將自動繪製單元觀念圖譜</div>
              </div>
            ) : (
              activeUnits.map(unit => {
                const isWeak = unit.status === 'weak';
                const isMastered = unit.status === 'mastered';
                const isUntested = unit.status === 'untested';

                return (
                  <div
                    key={unit.id}
                    style={{
                      background: '#ffffff',
                      border: `2px solid ${isWeak ? '#ef4444' : isMastered ? '#22c55e' : 'var(--theme-border, #17324d)'}`,
                      borderRadius: '16px',
                      padding: '16px 20px',
                      boxShadow: `3px 3px 0px ${isWeak ? '#ef4444' : isMastered ? '#22c55e' : 'var(--theme-border, #17324d)'}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span 
                            style={{
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              background: isWeak ? '#fee2e2' : isMastered ? '#dcfce7' : isUntested ? '#f1f5f9' : '#fef9c3',
                              color: isWeak ? '#b91c1c' : isMastered ? '#15803d' : isUntested ? '#64748b' : '#854d0e',
                              border: `1px solid ${isWeak ? '#fca5a5' : isMastered ? '#86efac' : isUntested ? '#cbd5e1' : '#fde047'}`
                            }}
                          >
                            {isWeak ? '🔴 待加強' : isMastered ? '🟢 精熟' : isUntested ? '⚪ 未測驗' : '🟡 穩定'}
                          </span>
                          <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--theme-border, #17324d)' }}>
                            {unit.name}
                          </span>
                        </div>

                        {/* 觀念標籤 */}
                        <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                          {unit.tags.map((t, idx) => (
                            <span 
                              key={idx}
                              style={{
                                fontSize: '0.75rem',
                                color: '#64748b',
                                background: '#f8fafc',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                border: '1px solid #e2e8f0'
                              }}
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* 右側：一鍵針對此單元出題強化 */}
                      {onStartUnitQuiz && (
                        <button
                          type="button"
                          onClick={() => onStartUnitQuiz({
                            subjectId: selectedSubject,
                            gradeId: selectedGrade,
                            unitId: unit.id,
                            unitTitle: unit.name
                          })}
                          style={{
                            padding: '8px 14px',
                            borderRadius: '12px',
                            border: '2px solid var(--theme-border, #17324d)',
                            background: isWeak ? 'var(--theme-accent, #ef8354)' : '#ffffff',
                            color: isWeak ? '#ffffff' : 'var(--theme-border, #17324d)',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '2px 2px 0px var(--theme-border, #17324d)',
                            whiteSpace: 'nowrap',
                            flexShrink: 0
                          }}
                        >
                          <Target size={15} />
                          <span>{isWeak ? '🔥 弱點攻克測驗' : '練習此單元'}</span>
                        </button>
                      )}
                    </div>

                    {/* 下方統計進度條 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>
                          <span>答對率：{unit.accuracy}% ({unit.correct}/{unit.total}題)</span>
                          {unit.unresolvedMistakes > 0 && (
                            <span style={{ color: '#ef4444', fontWeight: 800 }}>
                              待消滅錯題: {unit.unresolvedMistakes} 題
                            </span>
                          )}
                        </div>
                        <div 
                          style={{
                            height: '8px',
                            width: '100%',
                            background: '#f1f5f9',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            border: '1px solid #e2e8f0'
                          }}
                        >
                          <div 
                            style={{
                              height: '100%',
                              width: `${unit.accuracy}%`,
                              background: isWeak ? '#ef4444' : isMastered ? '#22c55e' : '#f59e0b',
                              borderRadius: '10px',
                              transition: 'width 0.4s ease'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* 底部功能條 */}
        <div 
          style={{
            padding: '14px 24px',
            borderTop: '2px solid var(--theme-border, #17324d)',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}
        >
          <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
            💡 系統每隔 5 題自動更新掌握度指標，紅色單元可隨時點擊攻克！
          </div>
          <button
            onClick={onClose}
            className="btn btn-primary"
            style={{ padding: '8px 24px', fontWeight: 800 }}
          >
            確認關閉
          </button>
        </div>

      </div>
    </div>
  );
}
