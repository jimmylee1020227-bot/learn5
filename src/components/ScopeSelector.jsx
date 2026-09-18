import React, { useState } from 'react';
import { GRADES, SUBJECTS, DIFFICULTIES, CURRICULUM_UNITS } from '../data/curriculum108';
import { 
  CheckSquare, 
  Square, 
  Layers, 
  BookOpen, 
  Zap, 
  Play, 
  Sliders, 
  Sparkles,
  Info
} from 'lucide-react';

export default function ScopeSelector({ onStartQuiz }) {
  const [selectedGrade, setSelectedGrade] = useState('g7');
  const [selectedSubject, setSelectedSubject] = useState('math');
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(10);

  // 取得當前年級與科目的單元清單
  const availableUnits = CURRICULUM_UNITS[selectedSubject]?.[selectedGrade] || [];
  const [selectedUnitIds, setSelectedUnitIds] = useState(availableUnits.map(u => u.id));

  // 當切換年級或科目時，預設全選該科目的單元
  const handleGradeChange = (gradeId) => {
    setSelectedGrade(gradeId);
    const units = CURRICULUM_UNITS[selectedSubject]?.[gradeId] || [];
    setSelectedUnitIds(units.map(u => u.id));
  };

  const handleSubjectChange = (subjId) => {
    setSelectedSubject(subjId);
    const units = CURRICULUM_UNITS[subjId]?.[selectedGrade] || [];
    setSelectedUnitIds(units.map(u => u.id));
  };

  const toggleUnit = (unitId) => {
    if (selectedUnitIds.includes(unitId)) {
      if (selectedUnitIds.length > 1) {
        setSelectedUnitIds(selectedUnitIds.filter(id => id !== unitId));
      }
    } else {
      setSelectedUnitIds([...selectedUnitIds, unitId]);
    }
  };

  const selectAllUnits = () => {
    setSelectedUnitIds(availableUnits.map(u => u.id));
  };

  const handleLaunch = () => {
    let finalUnits = selectedUnitIds;
    if (!finalUnits || finalUnits.length === 0) {
      finalUnits = availableUnits.map(u => u.id);
      setSelectedUnitIds(finalUnits);
    }
    if (finalUnits.length === 0) return;
    onStartQuiz({
      gradeId: selectedGrade,
      subjectId: selectedSubject,
      unitIds: finalUnits,
      difficulty: selectedDifficulty,
      count: questionCount
    });
  };

  const currentSubjectObj = SUBJECTS.find(s => s.id === selectedSubject) || SUBJECTS[2];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 頂部標題簡介橫幅 (暖調紙張手帳風格) */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '28px', 
          position: 'relative', 
          overflow: 'hidden',
          background: '#fffdf9',
          border: '2.5px solid #17324d',
          borderRadius: '24px',
          boxShadow: '6px 6px 0px #17324d'
        }}
      >
        <div style={{ maxWidth: '850px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <span className="badge badge-coral">108 課綱核心素養題庫</span>
            <span className="badge badge-gold">每單元 1000+ 題充足不重複</span>
            <span className="badge badge-emerald">答對 1 題 = 1 點排行榜積分</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px', color: '#17324d' }}>
            國中全科自由選題測驗工作台
          </h1>
          <p style={{ color: '#5b6772', fontSize: '0.95rem', lineHeight: 1.7, fontWeight: 600 }}>
            挑選你想複習的年級、科目與特定課綱單元，每題皆有完整解析與解題思維提示。排行榜每週一 00:00 歸零結算！
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* 左欄：選擇年級、科目、難度、題數 */}
        <div 
          className="glass-panel" 
          style={{ 
            padding: '26px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '22px',
            background: '#fffdf9',
            border: '2.5px solid #17324d',
            borderRadius: '24px',
            boxShadow: '6px 6px 0px #17324d'
          }}
        >
          {/* 步驟 1：選擇學習年級 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Layers size={18} color="#ef8354" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#17324d' }}>步驟 1：選擇學習年級</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {GRADES.map(g => {
                const isSelected = selectedGrade === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => handleGradeChange(g.id)}
                    className="btn"
                    style={{
                      padding: '12px 8px',
                      flexDirection: 'column',
                      gap: '4px',
                      background: isSelected ? '#ef8354' : '#f8f3eb',
                      color: isSelected ? '#fff' : '#17324d',
                      border: '2px solid #17324d',
                      boxShadow: isSelected ? '0 5px 0 #d76740' : '3px 3px 0 #17324d',
                      transform: isSelected ? 'translateY(-2px)' : 'none'
                    }}
                  >
                    <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>{g.short}</span>
                    <span style={{ fontSize: '0.72rem', opacity: isSelected ? 0.95 : 0.7 }}>{g.name.split(' ')[1] || ''}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 步驟 2：選擇複習科目 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <BookOpen size={18} color="#ef8354" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#17324d' }}>步驟 2：選擇複習科目</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
              {SUBJECTS.map(s => {
                const isSelected = selectedSubject === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleSubjectChange(s.id)}
                    style={{
                      padding: '12px 14px',
                      border: isSelected ? '2px solid #17324d' : '1.5px solid #ded3c5',
                      background: isSelected ? '#fff0e9' : '#f8f3eb',
                      color: isSelected ? '#c8643d' : '#5b6772',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      borderRadius: '14px',
                      fontWeight: isSelected ? 800 : 700,
                      fontSize: '0.95rem',
                      boxShadow: isSelected ? '3px 3px 0px #ef8354' : 'none',
                      transition: 'all 0.16s ease'
                    }}
                  >
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: isSelected ? '#ef8354' : '#9aa2a8' }} />
                    <span>{s.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 步驟 3：自訂 4 段難度 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Sliders size={18} color="#ef8354" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#17324d' }}>步驟 3：設定題目難度</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {DIFFICULTIES.map(d => {
                const isSelected = selectedDifficulty === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDifficulty(d.id)}
                    style={{
                      padding: '10px 14px',
                      border: isSelected ? '2px solid #17324d' : '1.5px solid #ded3c5',
                      background: isSelected ? '#fff7d9' : '#f8f3eb',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: '2px',
                      cursor: 'pointer',
                      borderRadius: '14px',
                      textAlign: 'left',
                      boxShadow: isSelected ? '3px 3px 0px #f7cf68' : 'none',
                      transition: 'all 0.16s ease'
                    }}
                  >
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: isSelected ? '#806523' : '#17324d' }}>
                      {d.badge}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: isSelected ? '#9a741e' : '#78818a', fontWeight: 600 }}>
                      {d.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 步驟 4：測驗題數 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#5b6772' }}>本次抽取題數</span>
              <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#ef8354' }}>{questionCount} 題</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[5, 10, 15, 20, 30].map(cnt => {
                const isSelected = questionCount === cnt;
                return (
                  <button
                    key={cnt}
                    onClick={() => setQuestionCount(cnt)}
                    className="btn"
                    style={{
                      flex: 1,
                      padding: '8px 4px',
                      fontSize: '0.86rem',
                      background: isSelected ? '#17324d' : '#f8f3eb',
                      color: isSelected ? '#fff' : '#17324d',
                      border: '2px solid #17324d',
                      boxShadow: isSelected ? '2px 2px 0 #ef8354' : '2px 2px 0 #17324d'
                    }}
                  >
                    {cnt}題
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* 右欄：108 課綱單元複選列表 */}
        <div 
          className="glass-panel" 
          style={{ 
            padding: '26px', 
            display: 'flex', 
            flexDirection: 'column',
            background: '#fffdf9',
            border: '2.5px solid #17324d',
            borderRadius: '24px',
            boxShadow: '6px 6px 0px #17324d'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1.5px solid #e8ded0' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#17324d', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={18} color="#ef8354" />
                108 課綱單元範圍 (已選 {selectedUnitIds.length} 個)
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#78818a', marginTop: '3px', fontWeight: 600 }}>
                每個單元皆附有 1000+ 題充足題庫與詳解提示
              </div>
            </div>

            <button 
              onClick={selectAllUnits}
              className="btn btn-secondary"
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            >
              全選單元
            </button>
          </div>

          {/* 單元清單 */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', paddingRight: '6px' }}>
            {availableUnits.map(unit => {
              const isChecked = selectedUnitIds.includes(unit.id);
              return (
                <div
                  key={unit.id}
                  onClick={() => toggleUnit(unit.id)}
                  style={{
                    padding: '12px 14px',
                    border: isChecked ? '2px solid #ef8354' : '1.5px solid #ded3c5',
                    background: isChecked ? '#fff0e9' : '#f8f3eb',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isChecked ? '2px 2px 0px #ef8354' : 'none'
                  }}
                >
                  <div style={{ marginTop: '2px', color: isChecked ? '#ef8354' : '#9aa2a8' }}>
                    {isChecked ? <CheckSquare size={18} /> : <Square size={18} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: isChecked ? '#c8643d' : '#17324d' }}>
                      {unit.name}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#78818a', marginTop: '2px', fontWeight: 600 }}>
                      {unit.desc || '包含課綱核心觀念與素養延伸'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 底部啟動按鈕 (3D 珊瑚色大按鈕) */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1.5px solid #e8ded0' }}>
            <button
              onClick={handleLaunch}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '1.05rem',
                borderRadius: '16px'
              }}
            >
              <Play size={18} />
              <span>開始 {currentSubjectObj.name} 測驗工作台 ({questionCount} 題)</span>
            </button>
            <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#78818a', marginTop: '8px', fontWeight: 600 }}>
              💡 進入測驗後每題附解題提示、答案驗證與解析
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
