import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getUserPracticeHistory, 
  getMistakeNotebook, 
  fetchCloudUserPracticeHistory,
  fetchCloudUserQuizPapers,
  subscribeToCloudSync 
} from '../services/cloudStorage';
import { 
  BookOpen, 
  History, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Cloud, 
  Filter,
  FileText,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Award,
  Clock,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import MathText from './MathText';

export default function UserHistoryModal({ onLaunchRetryQuiz }) {
  const { currentUser } = useAuth();
  const [subTab, setSubTab] = useState('papers'); // 'papers' | 'mistakes' | 'history'
  const [quizPapers, setQuizPapers] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [mistakeList, setMistakeList] = useState([]);
  const [filterSubject, setFilterSubject] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedPaperIds, setExpandedPaperIds] = useState({});

  const userId = currentUser?.id || 'guest_student';

  // 載入本地與雲端歷程
  const loadData = useCallback(async (forceCloud = false) => {
    // 1. 先即時讀取本地快取
    const localHistory = getUserPracticeHistory(userId);
    const localMistakes = getMistakeNotebook(userId);
    setHistoryList(localHistory);
    setMistakeList(localMistakes);

    // 2. 從 Firebase 雲端非同步調閱完整試卷與作答紀錄
    if (forceCloud || localHistory.length === 0 || quizPapers.length === 0) {
      setIsLoading(true);
      try {
        const [cloudPapers, cloudHistory] = await Promise.all([
          fetchCloudUserQuizPapers(userId),
          fetchCloudUserPracticeHistory(userId)
        ]);

        if (Array.isArray(cloudPapers) && cloudPapers.length > 0) {
          setQuizPapers(cloudPapers);
        }
        if (Array.isArray(cloudHistory) && cloudHistory.length > 0) {
          setHistoryList(cloudHistory);
        }
        setMistakeList(getMistakeNotebook(userId));
      } catch (err) {
        console.warn('雲端歷程拉取異常:', err);
      } finally {
        setIsLoading(false);
      }
    }
  }, [userId, quizPapers.length]);

  useEffect(() => {
    loadData(true);

    const unsub = subscribeToCloudSync((ev) => {
      if (
        !ev.key || 
        ev.key.startsWith('quiz_papers') ||
        ev.key.startsWith(`user_quiz_papers_${userId}`) ||
        ev.key.startsWith(`practice_history_${userId}`) ||
        ev.key.startsWith(`mistake_notebook_${userId}`)
      ) {
        loadData(false);
      }
    });

    return () => unsub();
  }, [userId, loadData]);

  // 切換展開收合試卷
  const togglePaperExpand = (paperId) => {
    setExpandedPaperIds(prev => ({
      ...prev,
      [paperId]: prev[paperId] === false ? true : !prev[paperId]
    }));
  };

  // 依科目過濾
  const filteredPapers = quizPapers.filter(p => {
    if (filterSubject === 'all') return true;
    return p.subjectId === filterSubject;
  });

  const filteredHistory = historyList.filter(h => {
    if (filterSubject === 'all') return true;
    return h.subjectId === filterSubject;
  });

  const filteredMistakes = mistakeList.filter(m => {
    if (filterSubject === 'all') return true;
    return m.subjectId === filterSubject;
  });

  // 錯題本快速啟動測驗
  const handleStartMistakeRetry = () => {
    if (filteredMistakes.length === 0) {
      alert('目前沒有符合條件的錯題！');
      return;
    }
    const questionsToRetry = filteredMistakes.map(m => ({
      ...m,
      id: m.questionId || m.id,
      isCustom: false
    }));
    if (typeof onLaunchRetryQuiz === 'function') {
      onLaunchRetryQuiz(questionsToRetry.slice(0, 15));
    }
  };

  // 重測整張試卷
  const handleRetryPaper = (paper) => {
    if (!paper || !paper.questions || paper.questions.length === 0) {
      alert('此試卷無可用題目');
      return;
    }
    const questionsToRetry = paper.questions.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
      answer: q.answer,
      explanation: q.explanation,
      hint: q.hint || '',
      subjectId: paper.subjectId || q.subjectId,
      unitName: paper.unitName || q.unitName,
      grade: paper.grade || q.grade,
      conceptTag: q.conceptTag || '綜合評量'
    }));
    if (typeof onLaunchRetryQuiz === 'function') {
      onLaunchRetryQuiz(questionsToRetry);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 頂部資訊看板 */}
      <div className="glass-panel" style={{ padding: '28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge-indigo">
                <Cloud size={13} /> 跨裝置雲端資料已連線
              </span>
              <span className="badge badge-emerald">已綁定 Google 帳號自動調閱</span>
              {isLoading && (
                <span className="badge badge-coral" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <RefreshCw size={12} className="animate-spin" /> 同步雲端資料中...
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--theme-border, var(--theme-border, #17324d))', marginBottom: '6px' }}>
              歷次完整試卷調閱與個人錯題本
            </h1>
            <p style={{ color: '#78818a', fontSize: '0.92rem', margin: 0 }}>
              系統永久留存每一次測驗交卷的完整考卷、題目與詳解，隨時調閱複習，支援整卷再測與錯題強化。
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => loadData(true)}
              disabled={isLoading}
              className="btn btn-secondary"
              style={{ padding: '10px 16px', fontSize: '0.86rem', gap: '6px' }}
              title="重新向 Firebase 雲端拉取最新試卷與作答記錄"
            >
              <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
              重新整理雲端
            </button>

            {subTab === 'mistakes' && filteredMistakes.length > 0 && (
              <button
                onClick={handleStartMistakeRetry}
                className="btn btn-fire"
                style={{ padding: '10px 18px', fontSize: '0.9rem', gap: '6px' }}
              >
                <RotateCcw size={16} /> 啟動錯題本測驗 ({filteredMistakes.length}題)
              </button>
            )}
          </div>
        </div>

        {/* 次分頁標籤與科目篩選 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginTop: '24px', borderTop: '1.5px solid #ded3c5', paddingTop: '16px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSubTab('papers')}
              className={`btn ${subTab === 'papers' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 16px', gap: '6px' }}
            >
              <FileText size={16} /> 📄 歷次測驗卷 ({quizPapers.length})
            </button>
            <button
              onClick={() => setSubTab('mistakes')}
              className={`btn ${subTab === 'mistakes' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 16px', gap: '6px' }}
            >
              <BookOpen size={16} /> 📕 個人錯題本 ({mistakeList.length})
            </button>
            <button
              onClick={() => setSubTab('history')}
              className={`btn ${subTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 16px', gap: '6px' }}
            >
              <History size={16} /> ⏱️ 全部作答流水帳 ({historyList.length})
            </button>
          </div>

          {/* 科目過濾選單 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={15} color="#5b6772" />
            <select
              value={filterSubject}
              onChange={e => setFilterSubject(e.target.value)}
              style={{
                background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))',
                color: 'var(--theme-border, var(--theme-border, #17324d))',
                border: '1.5px solid #ded3c5',
                borderRadius: '10px',
                padding: '7px 14px',
                fontSize: '0.85rem',
                fontWeight: 700
              }}
            >
              <option value="all">全科目總覽</option>
              <option value="chinese">國文科</option>
              <option value="english">英語科</option>
              <option value="math">數學科</option>
              <option value="science">自然科</option>
              <option value="social">社會科</option>
            </select>
          </div>
        </div>

      </div>

      {/* 分頁 1：📄 歷次完整測驗卷 */}
      {subTab === 'papers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isLoading ? (
            <div className="glass-panel" style={{ padding: '50px 20px', textAlign: 'center', color: 'var(--theme-border, var(--theme-border, #17324d))' }}>
              <RefreshCw size={36} className="animate-spin" style={{ margin: '0 auto 12px', color: 'var(--theme-accent, var(--theme-accent, #ef8354))' }} />
              <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>正在自 Firebase 雲端調閱您的歷史試卷...</div>
              <div style={{ fontSize: '0.82rem', color: '#78818a', marginTop: '6px' }}>完整還原各卷題目、所選選項與名師詳解</div>
            </div>
          ) : filteredPapers.length === 0 ? (
            <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', color: '#78818a' }}>
              <FileText size={48} style={{ margin: '0 auto 14px', opacity: 0.5, color: 'var(--theme-accent, var(--theme-accent, #ef8354))' }} />
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--theme-border, var(--theme-border, #17324d))' }}>目前尚無測驗試卷紀錄</div>
              <div style={{ fontSize: '0.88rem', marginTop: '6px' }}>
                前往「會考模擬題庫」完成任意科目或單元測驗交卷後，整張試卷與詳解將永久封存於此。
              </div>
            </div>
          ) : (
            filteredPapers.map((paper, pIdx) => {
              const isExpanded = expandedPaperIds[paper.id] !== false; // 預設展開
              const scoreColor = paper.score >= 80 ? '#15803d' : paper.score >= 60 ? '#d97706' : '#b91c1c';

              return (
                <div
                  key={paper.id || pIdx}
                  style={{
                    background: 'var(--theme-card, var(--theme-card, #fffdf9))',
                    border: '2px solid var(--theme-border, #17324d)',
                    borderRadius: '18px',
                    padding: '22px',
                    boxShadow: '4px 4px 0px var(--theme-border, #17324d)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}
                >
                  {/* 試卷卡片 Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderBottom: '1.5px solid #f1eae0', paddingBottom: '14px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <span className="badge badge-navy" style={{ fontSize: '0.76rem', padding: '3px 8px' }}>
                          試卷編號：{paper.id}
                        </span>
                        <span className="badge badge-indigo" style={{ fontSize: '0.76rem', padding: '3px 8px' }}>
                          【{paper.unitName || '單元評量'}】
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#78818a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={13} />
                          {paper.completedAt ? new Date(paper.completedAt).toLocaleString() : '歷史測驗'}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--theme-border, var(--theme-border, #17324d))', margin: 0 }}>
                        📄 {paper.paperTitle || '會考實戰模擬考卷'}
                      </h3>
                    </div>

                    {/* 得分成績與操作按鈕 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'right', background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))', border: '1.5px solid #ded3c5', padding: '8px 14px', borderRadius: '12px' }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: 900, color: scoreColor }}>
                          {paper.score} <span style={{ fontSize: '0.8rem', color: '#78818a' }}>分</span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#5b6772', fontWeight: 700 }}>
                          ✓ 對 {paper.correctCount} 題 / ✗ 錯 {paper.wrongCount} 題
                        </div>
                      </div>

                      <button
                        onClick={() => handleRetryPaper(paper)}
                        className="btn btn-secondary"
                        style={{ padding: '8px 14px', fontSize: '0.82rem', fontWeight: 800, gap: '5px' }}
                        title="重新做一遍整份試卷的題目"
                      >
                        <RotateCcw size={15} /> 重測本卷
                      </button>

                      <button
                        onClick={() => togglePaperExpand(paper.id)}
                        className="btn btn-primary"
                        style={{ padding: '8px 14px', fontSize: '0.82rem', fontWeight: 800, gap: '5px' }}
                      >
                        <BookOpen size={15} />
                        {isExpanded ? '收合試卷' : '展開完整試卷與詳解'}
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* 試卷完整逐題展開展示 */}
                  {isExpanded && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '4px' }}>
                      <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--theme-border, var(--theme-border, #17324d))', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={16} color="#15803d" />
                        整卷各題作答結果與詳解（共 {paper.questions?.length || 0} 題）：
                      </div>

                      {(paper.questions || []).map((q, qIndex) => {
                        const isUserPick = q.userChoice;
                        const isRight = q.isCorrect;

                        return (
                          <div
                            key={q.id || qIndex}
                            style={{
                              background: isRight ? '#f4fbf6' : '#fff5f3',
                              border: isRight ? '1.5px solid #b9ddc5' : '1.5px solid #efb7a6',
                              borderRadius: '14px',
                              padding: '16px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '10px'
                            }}
                          >
                            {/* 題號與正確性標籤 */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{
                                  background: isRight ? '#15803d' : '#ef4444',
                                  color: '#fff',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  fontSize: '0.78rem',
                                  fontWeight: 900
                                }}>
                                  第 {qIndex + 1} 題
                                </span>
                                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--theme-border, var(--theme-border, #17324d))' }}>
                                  題號代碼：{q.id}
                                </span>
                                {q.conceptTag && (
                                  <span className="badge badge-purple" style={{ fontSize: '0.72rem', padding: '2px 6px' }}>
                                    #{q.conceptTag}
                                  </span>
                                )}
                              </div>

                              <span style={{
                                fontSize: '0.82rem',
                                fontWeight: 900,
                                color: isRight ? '#15803d' : '#ef4444',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                {isRight ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                                {isRight ? '本次作答正確 (+1)' : '本次作答錯誤'}
                              </span>
                            </div>

                            {/* 題幹內容 */}
                            <div style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--theme-border, var(--theme-border, #17324d))', lineHeight: 1.5 }}>
                              <MathText text={q.question} />
                            </div>

                            {/* 四個選項與學生作答對比 */}
                            {Array.isArray(q.options) && q.options.length > 0 && (
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
                                {q.options.map((optText, optIdx) => {
                                  const isSelected = isUserPick === optIdx;
                                  const isCorrectOption = q.answer === optIdx;

                                  let optBg = 'var(--theme-card, var(--theme-card, #fffdf9))';
                                  let optBorder = '1px solid #ded3c5';
                                  let optColor = 'var(--theme-border, var(--theme-border, #17324d))';

                                  if (isCorrectOption) {
                                    optBg = '#e8f8ed';
                                    optBorder = '2px solid #15803d';
                                    optColor = '#15803d';
                                  } else if (isSelected && !isRight) {
                                    optBg = '#fee2e2';
                                    optBorder = '2px solid #ef4444';
                                    optColor = '#b91c1c';
                                  }

                                  return (
                                    <div
                                      key={optIdx}
                                      style={{
                                        background: optBg,
                                        border: optBorder,
                                        color: optColor,
                                        borderRadius: '8px',
                                        padding: '8px 12px',
                                        fontSize: '0.84rem',
                                        fontWeight: isSelected || isCorrectOption ? 800 : 500,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: '6px'
                                      }}
                                    >
                                      <span>
                                        {String.fromCharCode(65 + optIdx)}. <MathText text={optText} />
                                      </span>
                                      <div style={{ display: 'flex', gap: '4px', fontSize: '0.72rem', fontWeight: 900 }}>
                                        {isSelected && (
                                          <span style={{ color: isRight ? '#15803d' : '#ef4444' }}>
                                            [您所選]
                                          </span>
                                        )}
                                        {isCorrectOption && (
                                          <span style={{ color: '#15803d' }}>
                                            [標準答案]
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* 名師推導詳解 */}
                            <div style={{ background: 'var(--theme-card, var(--theme-card, #fffdf9))', border: '1px solid #ded3c5', borderRadius: '10px', padding: '10px 14px', fontSize: '0.84rem', color: '#2d3748', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                              <span style={{ fontWeight: 900, color: 'var(--theme-border, var(--theme-border, #17324d))', display: 'block', marginBottom: '2px' }}>
                                📖 題目詳解與觀念推導：
                              </span>
                              <MathText text={q.explanation || '依據 108 課綱核心考點設計，按標準公式與定義運算即可得出解答。'} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 分頁 2：📕 個人錯題本 */}
      {subTab === 'mistakes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredMistakes.length === 0 ? (
            <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', color: '#78818a' }}>
              <CheckCircle2 size={50} color="#10b981" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--theme-border, var(--theme-border, #17324d))' }}>錯題本目前空空如也！</div>
              <div style={{ fontSize: '0.88rem', marginTop: '4px' }}>保持這個節奏，繼續在題庫測驗中發揮實力吧！</div>
            </div>
          ) : (
            filteredMistakes.map((m, idx) => (
              <div 
                key={m.questionId || idx} 
                className="glass-panel" 
                style={{ 
                  padding: '20px', 
                  borderLeft: m.status === 'mastered' ? '5px solid #10b981' : '5px solid #ef4444',
                  background: 'var(--theme-card, var(--theme-card, #fffdf9))'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span className="badge badge-indigo">{m.unitName || '單元綜合'}</span>
                    <span className="badge badge-purple">{m.conceptTag || '重點考點'}</span>
                    <span style={{ fontSize: '0.75rem', color: '#78818a' }}>題號: {m.questionId}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--theme-accent, var(--theme-accent, #ef8354))', fontWeight: 800 }}>
                      累計出錯 {m.wrongCount || 1} 次
                    </span>
                    {m.status === 'mastered' ? (
                      <span className="badge badge-emerald">✓ 已攻克掌握</span>
                    ) : (
                      <span className="badge badge-fire">連對 {m.consecutiveCorrect || 0} / 3 次</span>
                    )}
                  </div>
                </div>

                <div style={{ fontSize: '1.02rem', fontWeight: 800, color: 'var(--theme-border, var(--theme-border, #17324d))', marginBottom: '12px' }}>
                  <MathText text={m.question} />
                </div>

                {/* 正確解答與推導 */}
                <div style={{ background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))', border: '1px solid #ded3c5', padding: '12px 14px', borderRadius: '10px', marginBottom: '8px', fontSize: '0.86rem', color: '#5b6772' }}>
                  <div style={{ color: '#047857', fontWeight: 800, marginBottom: '4px' }}>
                    標準答案：{m.options && m.answer !== undefined ? (
                      <span>{String.fromCharCode(65 + m.answer)}. <MathText text={m.options[m.answer]} /></span>
                    ) : `選項 (${m.answer + 1})`}
                  </div>
                  {m.explanation && <div style={{ lineHeight: 1.6 }}><MathText text={m.explanation} /></div>}
                </div>

                {m.hint && (
                  <div style={{ fontSize: '0.82rem', color: '#806523', background: '#fff7d9', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e8d69a' }}>
                    💡 提示：<MathText text={m.hint} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* 分頁 3：⏱️ 全部作答流水帳紀錄 */}
      {subTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredHistory.length === 0 ? (
            <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', color: '#78818a' }}>
              <History size={50} color="#64748b" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--theme-border, var(--theme-border, #17324d))' }}>尚無雲端作答紀錄</div>
              <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>前往「題庫測驗」做幾道題目，所有歷程都會即時記錄在此！</div>
            </div>
          ) : (
            filteredHistory.map((h, idx) => (
              <div 
                key={h.id || idx} 
                className="glass-panel" 
                style={{ 
                  padding: '14px 18px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  background: 'var(--theme-card, var(--theme-card, #fffdf9))'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {h.isCorrect ? (
                    <CheckCircle2 size={22} color="#10b981" />
                  ) : (
                    <XCircle size={22} color="#ef4444" />
                  )}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--theme-border, var(--theme-border, #17324d))' }}>
                        {h.unitName || '單元綜合'}
                      </span>
                      <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                        {h.conceptTag || '一般練習'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#78818a', marginTop: '2px' }}>
                      題號: {h.questionId} ・ 作答耗時 {h.timeSpentSec || 15} 秒
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.86rem', color: h.isCorrect ? '#10b981' : '#f87171' }}>
                    {h.isCorrect ? '答對 (+1 點)' : '答錯'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#78818a' }}>
                    {new Date(h.timestamp).toLocaleString([], { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}
