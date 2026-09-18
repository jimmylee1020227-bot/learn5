import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserPracticeHistory, getMistakeNotebook, subscribeToCloudSync } from '../services/cloudStorage';
import { 
  BookOpen, 
  History, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Cloud, 
  Filter,
  Layers,
  Sparkles
} from 'lucide-react';

export default function UserHistoryModal({ onLaunchRetryQuiz }) {
  const { currentUser } = useAuth();
  const [subTab, setSubTab] = useState('mistakes'); // 'mistakes' | 'history'
  const [historyList, setHistoryList] = useState([]);
  const [mistakeList, setMistakeList] = useState([]);
  const [filterSubject, setFilterSubject] = useState('all');

  useEffect(() => {
    const userId = currentUser?.id || 'guest_student';
    const refresh = () => {
      setHistoryList(getUserPracticeHistory(userId));
      setMistakeList(getMistakeNotebook(userId));
    };
    refresh();

    const unsub = subscribeToCloudSync((ev) => {
      if (!ev.key || ev.key === 'mistake_notebook' || ev.key === 'practice_history') {
        refresh();
      }
    });
    return () => unsub();
  }, [currentUser?.id]);

  const filteredHistory = historyList.filter(h => {
    if (filterSubject !== 'all' && h.subjectId !== filterSubject) return false;
    return true;
  });

  const filteredMistakes = mistakeList.filter(m => {
    if (filterSubject !== 'all' && m.subjectId !== filterSubject) return false;
    return true;
  });

  const handleStartMistakeRetry = () => {
    if (filteredMistakes.length === 0) {
      alert('目前沒有符合條件的錯題！');
      return;
    }
    const questionsToRetry = filteredMistakes.map(m => ({
      ...m,
      id: m.questionId,
      isCustom: false
    }));
    onLaunchRetryQuiz(questionsToRetry.slice(0, 15));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 頂部橫幅 */}
      <div className="glass-panel" style={{ padding: '28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-indigo">
                <Cloud size={13} /> 跨裝置雲端資料已連線
              </span>
              <span className="badge badge-emerald">已綁定 Google 帳號自動調閱</span>
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '6px' }}>
              全題型作答歷程與專屬錯題本
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              跨裝置記錄所有做過的每一道題目與詳解，支援隨時調閱與一鍵錯題重測複習。
            </p>
          </div>

          {subTab === 'mistakes' && filteredMistakes.length > 0 && (
            <button
              onClick={handleStartMistakeRetry}
              className="btn btn-fire"
              style={{ padding: '12px 20px', fontSize: '0.95rem' }}
            >
              <RotateCcw size={16} /> 啟動錯題本複習測驗 ({filteredMistakes.length}題)
            </button>
          )}
        </div>

        {/* 次分頁與科目篩選 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginTop: '24px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setSubTab('mistakes')}
              className={`btn ${subTab === 'mistakes' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 16px' }}
            >
              <BookOpen size={16} /> 個人錯題本 ({mistakeList.length})
            </button>
            <button
              onClick={() => setSubTab('history')}
              className={`btn ${subTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 16px' }}
            >
              <History size={16} /> 全部做題紀錄 ({historyList.length})
            </button>
          </div>

          {/* 科目過濾選單 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={15} color="#5b6772" />
            <select
              value={filterSubject}
              onChange={e => setFilterSubject(e.target.value)}
              style={{
                background: '#f8f3eb',
                color: '#17324d',
                border: '1.5px solid #ded3c5',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 12px',
                fontSize: '0.85rem',
                fontWeight: 700
              }}
            >
              <option value="all">全科目篩選</option>
              <option value="chinese">國文</option>
              <option value="english">英語</option>
              <option value="math">數學</option>
              <option value="science">自然</option>
              <option value="social">社會</option>
            </select>
          </div>
        </div>

      </div>

      {/* 錯題本分頁 */}
      {subTab === 'mistakes' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredMistakes.length === 0 ? (
            <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-dim)' }}>
              <CheckCircle2 size={50} color="#10b981" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#17324d' }}>錯題本目前空空如也！</div>
              <div style={{ fontSize: '0.88rem', marginTop: '4px' }}>保持這個節奏，繼續在題庫測驗中發揮實力吧！</div>
            </div>
          ) : (
            filteredMistakes.map((m, idx) => (
              <div key={m.questionId || idx} className="glass-panel" style={{ padding: '20px', borderLeft: m.status === 'mastered' ? '4px solid #10b981' : '4px solid #ef4444' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge badge-indigo">{m.unitName}</span>
                    <span className="badge badge-purple">{m.conceptTag}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>題號: {m.questionId}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#ef8354', fontWeight: 800 }}>
                      累計出錯 {m.wrongCount || 1} 次
                    </span>
                    {m.status === 'mastered' ? (
                      <span className="badge badge-emerald">已攻克掌握</span>
                    ) : (
                      <span className="badge badge-fire">連對 {m.consecutiveCorrect || 0} / 3 次</span>
                    )}
                  </div>
                </div>

                <div style={{ fontSize: '1.02rem', fontWeight: 700, color: '#17324d', marginBottom: '12px' }}>
                  {m.question}
                </div>

                {/* 正確解答與提示 */}
                <div style={{ background: '#f8f3eb', border: '1px solid #ded3c5', padding: '12px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '8px', fontSize: '0.88rem', color: '#5b6772' }}>
                  <div style={{ color: '#047857', fontWeight: 800, marginBottom: '4px' }}>
                    標準答案：{m.options ? m.options[m.answer] : `選項 (${m.answer + 1})`}
                  </div>
                  {m.explanation && <div>{m.explanation}</div>}
                </div>

                {m.hint && (
                  <div style={{ fontSize: '0.8rem', color: '#806523', background: '#fff7d9', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid #e8d69a' }}>
                    💡 提示：{m.hint}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        /* 全部做題歷史紀錄分頁 */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredHistory.length === 0 ? (
            <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-dim)' }}>
              <History size={50} color="#64748b" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#17324d' }}>尚無雲端做題紀錄</div>
              <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>前往「題庫測驗」做幾道題目，所有歷程都會記錄在此！</div>
            </div>
          ) : (
            filteredHistory.map((h, idx) => (
              <div key={h.id || idx} className="glass-panel" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {h.isCorrect ? (
                    <CheckCircle2 size={22} color="#10b981" />
                  ) : (
                    <XCircle size={22} color="#ef4444" />
                  )}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#17324d' }}>
                        {h.unitName}
                      </span>
                      <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                        {h.conceptTag}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                      題號: {h.questionId} ・ 作答花費 {h.timeSpentSec || 15} 秒
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: h.isCorrect ? '#10b981' : '#f87171' }}>
                    {h.isCorrect ? '答對 (+1 點)' : '答錯'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
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
