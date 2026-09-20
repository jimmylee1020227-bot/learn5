import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMistakeNotebook, getUnresolvedErrorConcepts, subscribeToCloudSync, hydrateQuestionDetails } from '../services/cloudStorage';
import { generateQuestion } from '../data/questionGenerator';
import { CURRICULUM_UNITS } from '../data/curriculum108';
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

// 尋找概念標籤所屬的科目、年級與單元
function findCurriculumLocationByConcept(conceptName) {
  if (!conceptName) return null;
  for (const [subId, grades] of Object.entries(CURRICULUM_UNITS)) {
    for (const [grdId, units] of Object.entries(grades)) {
      if (!Array.isArray(units)) continue;
      for (const u of units) {
        if (u.tags && u.tags.some(t => t.includes(conceptName) || conceptName.includes(t))) {
          return { subjectId: subId, gradeId: grdId, unitId: u.id, unitName: u.name };
        }
      }
    }
  }
  return null;
}

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
      if (!ev.key || ev.key.startsWith('mistake_notebook') || ev.key.startsWith('practice_history') || ev.key === 'question_overrides') {
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

  // 啟動錯題加強模式 / 全能弱點分析 / 專項突破
  const handleLaunchReinforce = (targetConcept = null) => {
    const quizList = [];

    if (targetConcept) {
      // 🎯 專項突破模式
      // 1. 先撈取已記錄的該概念錯題
      const relatedMistakes = activeMistakes.filter(m => m.conceptTag === targetConcept);
      relatedMistakes.slice(0, 5).forEach((m, idx) => {
        const parts = (m.questionId || '').split('-');
        const parsedIdx = parseInt(parts[parts.length - 1] || '1', 10);
        const qIndex = isNaN(parsedIdx) ? (idx + 1) : parsedIdx;
        const hq = hydrateQuestionDetails({
          ...m,
          index: qIndex,
          difficulty: m.difficulty || 'medium'
        });
        if (hq && hq.question && Array.isArray(hq.options) && hq.options.length >= 4) {
          quizList.push(hq);
        }
      });

      // 2. 若題目不足 6 題，搜尋該概念所屬的單元進行智能衍生補足
      const loc = (relatedMistakes[0] && relatedMistakes[0].unitId) 
        ? { subjectId: relatedMistakes[0].subjectId || 'math', gradeId: relatedMistakes[0].gradeId || 'g8', unitId: relatedMistakes[0].unitId }
        : (findCurriculumLocationByConcept(targetConcept) || { subjectId: 'math', gradeId: 'g8', unitId: 'ma-8-u1' });

      let seedOffset = 100;
      while (quizList.length < 6 && seedOffset < 160) {
        const diff = quizList.length >= 4 ? 'hard' : 'medium';
        const q = generateQuestion(loc.subjectId, loc.gradeId, loc.unitId, seedOffset, diff);
        if (q && q.question && Array.isArray(q.options) && q.options.length >= 4) {
          q.conceptTag = targetConcept;
          quizList.push(q);
        }
        seedOffset += 7;
      }
    } else {
      // ⚡ 全能弱點分析 (綜合診斷 / 綜合弱點加強)
      // 1. 若有既有錯題，優先加入前 4 筆錯題
      activeMistakes.slice(0, 4).forEach((m, idx) => {
        const parts = (m.questionId || '').split('-');
        const parsedIdx = parseInt(parts[parts.length - 1] || '1', 10);
        const qIndex = isNaN(parsedIdx) ? (idx + 1) : parsedIdx;
        const hq = hydrateQuestionDetails({
          ...m,
          index: qIndex,
          difficulty: m.difficulty || 'medium'
        });
        if (hq && hq.question && Array.isArray(hq.options) && hq.options.length >= 4) {
          quizList.push(hq);
        }
      });

      // 2. 依 108 課綱五大考科標準核心單元補足至 8~10 題
      const coreDiagnostics = [
        { sub: 'math', grd: 'g7', unit: 'ma-7-u2', tag: '指數律與科學記號' },
        { sub: 'math', grd: 'g8', unit: 'ma-8-u1', tag: '乘法公式與多項式運算' },
        { sub: 'math', grd: 'g8', unit: 'ma-8-u2', tag: '平方根與畢氏定理' },
        { sub: 'math', grd: 'g9', unit: 'ma-9-u1', tag: '相似形與比例線段' },
        { sub: 'english', grd: 'g8', unit: 'en-8-u3', tag: '形容詞副詞比較級與最高級' },
        { sub: 'english', grd: 'g9', unit: 'en-9-u2', tag: '被動語態' },
        { sub: 'science', grd: 'g8', unit: 'sc-8-u1', tag: '基本測量物質密度與相變化' },
        { sub: 'science', grd: 'g8', unit: 'sc-8-u5', tag: '原子分子化學反應與計量' },
        { sub: 'chinese', grd: 'g8', unit: 'zh-8-u3', tag: '四大句型與修辭技巧' },
        { sub: 'social', grd: 'g8', unit: 'so-8-u1', tag: '中國與東亞歷史變局' }
      ];

      for (let i = 0; i < coreDiagnostics.length && quizList.length < 8; i++) {
        const item = coreDiagnostics[i];
        const q = generateQuestion(item.sub, item.grd, item.unit, 200 + i * 9, 'medium');
        if (q && q.question && Array.isArray(q.options) && q.options.length >= 4) {
          q.conceptTag = item.tag;
          quizList.push(q);
        }
      }
    }

    // 終極保底防線：確保至少有 6 題
    if (quizList.length === 0) {
      const emergency = [
        generateQuestion('math', 'g7', 'ma-7-u1', 301, 'medium'),
        generateQuestion('math', 'g8', 'ma-8-u1', 302, 'medium'),
        generateQuestion('english', 'g8', 'en-8-u1', 303, 'medium'),
        generateQuestion('science', 'g8', 'sc-8-u1', 304, 'medium'),
        generateQuestion('chinese', 'g8', 'zh-8-u1', 305, 'medium'),
        generateQuestion('social', 'g8', 'so-8-u1', 306, 'medium')
      ].filter(Boolean);
      onStartReinforceQuiz(emergency);
      return;
    }

    onStartReinforceQuiz(quizList);
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
              立即啟動全能弱點分析 (綜合弱點加強)
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
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--theme-border, var(--theme-border, #17324d))' }}>恭喜！目前無待攻克弱點！</div>
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
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--theme-border, var(--theme-border, #17324d))', marginBottom: '4px' }}>
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
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--theme-border, var(--theme-border, #17324d))' }}>
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
