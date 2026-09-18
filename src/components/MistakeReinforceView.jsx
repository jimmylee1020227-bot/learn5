import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMistakeNotebook, getUnresolvedErrorConcepts, subscribeToCloudSync } from '../services/cloudStorage';
import { generateQuestion } from '../data/questionGenerator';
import { 
  Sparkles, 
  Target, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  RotateCcw, 
  Flame, 
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

export default function MistakeReinforceView({ onStartReinforceQuiz }) {
  const { currentUser } = useAuth();
  const [mistakes, setMistakes] = useState([]);
  const [unresolvedConcepts, setUnresolvedConcepts] = useState({});

  useEffect(() => {
    const userId = currentUser?.id || 'guest_student';
    const refresh = () => {
      setMistakes(getMistakeNotebook(userId));
      setUnresolvedConcepts(getUnresolvedErrorConcepts(userId));
    };
    refresh();

    const unsub = subscribeToCloudSync((ev) => {
      if (!ev.key || ev.key === 'mistake_notebook' || ev.key === 'practice_history' || ev.key === 'question_overrides') {
        refresh();
      }
    });
    return () => unsub();
  }, [currentUser?.id]);

  // 分組：已掌握 vs 尚待攻克之錯誤類型
  const masteredMistakes = mistakes.filter(m => m.status === 'mastered');
  const activeMistakes = mistakes.filter(m => m.status !== 'mastered');

  // 取得出錯頻率最高的概念標籤（排前 6 名）
  const sortedConcepts = Object.entries(unresolvedConcepts).sort((a, b) => b[1] - a[1]);

  // 啟動錯題加強模式
  const handleLaunchReinforce = (targetConcept = null) => {
    // 找出符合目標概念或所有尚未掌握概念的題目
    const candidateMistakes = targetConcept 
      ? activeMistakes.filter(m => m.conceptTag === targetConcept)
      : activeMistakes;

    if (candidateMistakes.length === 0) {
      alert('太棒了！您目前沒有未掌握的弱點題目類型！');
      return;
    }

    // 將錯題本身與同類型變換題混編，組成 5~10 題針對性靶向測驗
    const quizList = [];
    candidateMistakes.slice(0, 10).forEach((m, idx) => {
      // 原錯題
      quizList.push({
        ...m,
        id: m.questionId,
        isCustom: false
      });
      // 自動衍生一題同單元同概念題進行交叉驗證
      const variantQ = generateQuestion(m.subjectId, m.gradeId, m.questionId.split('-')[3] || 'u1', idx + 500, m.difficulty || 'medium');
      if (variantQ) {
        variantQ.conceptTag = m.conceptTag;
        quizList.push(variantQ);
      }
    });

    onStartReinforceQuiz(quizList.slice(0, 8));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 頂部標題說明 */}
      <div className="glass-panel" style={{ padding: '28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '260px', height: '260px', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2), transparent 70%)', pointerEvents: 'none' }}></div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="badge badge-purple">自適應 AI 弱點診斷</span>
          <span className="badge badge-emerald">答對 3 次自動移出・不再重複出此類型</span>
        </div>

        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
          錯題加強模式 (專項觀念靶向突破)
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '850px' }}>
          系統會根據你過去作答錯誤的「知識點類型」專門派題。只要在加強測驗中連續答對 3 次，系統即判定該觀念已熟練掌握，並自動排除、不再出此類型題目！
        </p>

        {/* 弱點掌握現況總覽 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginTop: '24px' }}>
          <div className="glass-panel" style={{ padding: '16px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '4px' }}>尚待攻克弱點題</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f87171' }}>
              {activeMistakes.length} 題
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>含 {Object.keys(unresolvedConcepts).length} 種核心錯誤概念</div>
          </div>

          <div className="glass-panel" style={{ padding: '16px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '4px' }}>已成功掌握 (自動排除)</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>
              {masteredMistakes.length} 題
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>連對 3 次已完成熟練通關</div>
          </div>

          <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button
              onClick={() => handleLaunchReinforce(null)}
              className="btn btn-fire"
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
            >
              <Flame size={18} />
              立即啟動綜合弱點加強
            </button>
          </div>
        </div>

      </div>

      {/* 待攻克錯誤概念類型清單 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* 左欄：尚未掌握的錯誤類型 */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Target size={18} color="#ef4444" />
            亟需攻克的錯誤類型 (點擊專項強化)
          </h3>

          {sortedConcepts.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-dim)' }}>
              <ShieldCheck size={48} color="#10b981" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#17324d' }}>恭喜！目前無待攻克弱點！</div>
              <div style={{ fontSize: '0.85rem', marginTop: '6px' }}>先前往題庫測驗，系統會自動在出錯時收錄類型並為你診斷。</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sortedConcepts.map(([concept, count]) => {
                const relatedQuestions = activeMistakes.filter(m => m.conceptTag === concept);
                return (
                  <div
                    key={concept}
                    className="glass-panel"
                    style={{
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderLeft: '4px solid #ef4444'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#17324d', marginBottom: '4px' }}>
                        {concept}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                        <span>累積出錯 {count} 次</span>
                        <span>・</span>
                        <span>待鞏固 {relatedQuestions.length} 題</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleLaunchReinforce(concept)}
                      className="btn btn-primary"
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    >
                      <Play size={14} /> 專項突破
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 右欄：已成功掌握並排除的類型 (成就展示) */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <CheckCircle size={18} color="#10b981" />
            已掌握榮譽榜 (系統已自動排除此類型)
          </h3>

          {masteredMistakes.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-dim)' }}>
              <TrendingUp size={44} color="#64748b" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontSize: '0.95rem' }}>尚未有標記已掌握之概念</div>
              <div style={{ fontSize: '0.8rem', marginTop: '6px' }}>在加強測驗中連續答對 3 次即可完成掌握！</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {masteredMistakes.map(m => (
                <div
                  key={m.questionId}
                  className="glass-panel"
                  style={{
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderLeft: '4px solid #10b981',
                    background: 'rgba(16, 185, 129, 0.05)'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#17324d' }}>
                      {m.conceptTag}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                      {m.unitName} (連對 {m.consecutiveCorrect || 3} 次)
                    </div>
                  </div>
                  <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
                    已克服・不再出題
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
