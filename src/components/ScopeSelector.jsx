import React, { useState, useMemo } from 'react';
import { useDevice } from '../context/DeviceContext';
import { GRADES, SUBJECTS, DIFFICULTIES, CURRICULUM_UNITS, EDUCATION_STAGES } from '../data/curriculum108';
import { 
  CheckSquare, 
  Square, 
  Layers, 
  BookOpen, 
  Zap, 
  Play, 
  Sliders, 
  Sparkles,
  Info,
  FileText,
  GraduationCap,
  Award
} from 'lucide-react';

export default function ScopeSelector({ onStartQuiz }) {
  const { isMobile } = useDevice();
  // 學制選擇：'junior' (國中) 或 'senior' (高中)
  const [activeStage, setActiveStage] = useState('junior');
  const [selectedGrade, setSelectedGrade] = useState('g7');
  const [selectedSubject, setSelectedSubject] = useState('math'); // 'math' | 'english' | 'chinese' | 'science' | 'social' | 'all'
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(10);

  // 根據學制篩選年級清單
  const stageGrades = useMemo(() => {
    return GRADES.filter(g => g.stage === activeStage);
  }, [activeStage]);

  // 當學制切換時，自動設定合理的預設年級
  const handleStageChange = (newStage) => {
    setActiveStage(newStage);
    if (newStage === 'senior') {
      setSelectedGrade('h1');
      const units = CURRICULUM_UNITS[selectedSubject === 'all' ? 'math' : selectedSubject]?.['h1'] || [];
      setSelectedUnitIds(units.map(u => u.id));
    } else {
      setSelectedGrade('g7');
      const units = CURRICULUM_UNITS[selectedSubject === 'all' ? 'math' : selectedSubject]?.['g7'] || [];
      setSelectedUnitIds(units.map(u => u.id));
    }
  };

  // 取得當前年級與科目的單元清單
  const availableUnits = useMemo(() => {
    if (selectedSubject === 'all') {
      return [
        { id: 'all-u1', name: '【全科綜合卷】國文、英語、數學、自然、社會均勻抽題', tags: ['跨學科素養', '學測會考綜合模考'] }
      ];
    }
    return CURRICULUM_UNITS[selectedSubject]?.[selectedGrade] || [];
  }, [selectedSubject, selectedGrade]);

  const [selectedUnitIds, setSelectedUnitIds] = useState(availableUnits.map(u => u.id));

  // 當切換年級或科目時
  const handleGradeChange = (gradeId) => {
    setSelectedGrade(gradeId);
    if (selectedSubject === 'all') {
      setSelectedUnitIds(['all-u1']);
    } else {
      const units = CURRICULUM_UNITS[selectedSubject]?.[gradeId] || [];
      setSelectedUnitIds(units.map(u => u.id));
    }
  };

  const handleSubjectChange = (subjId) => {
    setSelectedSubject(subjId);
    if (subjId === 'all') {
      setSelectedUnitIds(['all-u1']);
    } else {
      const units = CURRICULUM_UNITS[subjId]?.[selectedGrade] || [];
      setSelectedUnitIds(units.map(u => u.id));
    }
  };

  const toggleUnit = (unitId) => {
    if (selectedSubject === 'all') return;
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
    if (selectedSubject !== 'all') {
      if (!finalUnits || finalUnits.length === 0) {
        finalUnits = availableUnits.map(u => u.id);
        setSelectedUnitIds(finalUnits);
      }
      if (finalUnits.length === 0) return;
    }

    onStartQuiz({
      gradeId: selectedGrade,
      subjectId: selectedSubject,
      unitIds: selectedSubject === 'all' ? [] : finalUnits,
      difficulty: selectedDifficulty,
      count: questionCount
    });
  };

  const currentSubjectObj = selectedSubject === 'all' 
    ? { id: 'all', name: '全科跨領域總複習', color: '#8b5cf6' }
    : (SUBJECTS.find(s => s.id === selectedSubject) || SUBJECTS[2]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 頂部標題簡介橫幅 (支援國中會考 / 高中學測快速切換) */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: isMobile ? '18px 16px' : '26px 28px', 
          position: 'relative', 
          overflow: 'hidden',
          background: 'var(--theme-card, #fffdf9)',
          border: '2.5px solid var(--theme-border, #17324d)',
          borderRadius: isMobile ? '20px' : '24px',
          boxShadow: isMobile ? '4px 4px 0px var(--theme-border, #17324d)' : '6px 6px 0px var(--theme-border, #17324d)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ maxWidth: '750px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
              <span className="badge badge-coral">108 課綱完整國高中題庫</span>
              <span className="badge badge-gold">學測·會考·全國模考·能力競賽</span>
              <span className="badge badge-emerald">答對 1 題 = 1 點積分</span>
            </div>
            <h1 style={{ fontSize: isMobile ? '1.45rem' : '1.85rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '8px', color: 'var(--theme-border, #17324d)' }}>
              {activeStage === 'senior' ? '🎓 高中三年全科·學測模擬考測驗中心' : '🎒 國中三年全科·會考自由測驗工作台'}
            </h1>
            <p style={{ color: '#5b6772', fontSize: isMobile ? '0.86rem' : '0.94rem', lineHeight: 1.6, fontWeight: 600, margin: 0 }}>
              支援【全科三年總複習】、【單科三年全冊總複習】或【特定單元自選】！所有題目皆符合教育部標準符號與詳盡解題思維。
            </p>
          </div>

          {/* 國中 / 高中 學制切換大按鈕 */}
          <div style={{ 
            background: 'var(--theme-bg, #f8f3eb)', 
            padding: '5px', 
            borderRadius: '16px', 
            border: '2px solid var(--theme-border, #17324d)',
            display: 'flex', 
            gap: '6px'
          }}>
            <button
              type="button"
              onClick={() => handleStageChange('junior')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                borderRadius: '12px',
                border: activeStage === 'junior' ? '2px solid var(--theme-border, #17324d)' : 'none',
                background: activeStage === 'junior' ? 'var(--theme-accent, #ef8354)' : 'transparent',
                color: activeStage === 'junior' ? '#ffffff' : '#5b6772',
                fontWeight: 800,
                fontSize: '0.92rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: activeStage === 'junior' ? '2px 2px 0 var(--theme-border, #17324d)' : 'none'
              }}
            >
              <GraduationCap size={17} />
              國中階段
            </button>
            <button
              type="button"
              onClick={() => handleStageChange('senior')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                borderRadius: '12px',
                border: activeStage === 'senior' ? '2px solid var(--theme-border, #17324d)' : 'none',
                background: activeStage === 'senior' ? '#8b5cf6' : 'transparent',
                color: activeStage === 'senior' ? '#ffffff' : '#5b6772',
                fontWeight: 800,
                fontSize: '0.92rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: activeStage === 'senior' ? '2px 2px 0 var(--theme-border, #17324d)' : 'none'
              }}
            >
              <Award size={17} />
              高中階段 (學測)
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* 左欄：選擇年級、科目、難度、題數 */}
        <div 
          className="glass-panel" 
          style={{ 
            padding: isMobile ? '20px 16px' : '26px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '22px',
            background: 'var(--theme-card, #fffdf9)',
            border: '2.5px solid var(--theme-border, #17324d)',
            borderRadius: isMobile ? '20px' : '24px',
            boxShadow: isMobile ? '4px 4px 0px var(--theme-border, #17324d)' : '6px 6px 0px var(--theme-border, #17324d)'
          }}
        >
          {/* 步驟 1：選擇學習年級 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Layers size={18} color="var(--theme-accent, #ef8354)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--theme-border, #17324d)', margin: 0 }}>
                步驟 1：選擇學習年級 / 總複習
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '10px' }}>
              {stageGrades.map(g => {
                const isSelected = selectedGrade === g.id;
                const isAllReview = g.id.includes('all');
                return (
                  <button
                    key={g.id}
                    onClick={() => handleGradeChange(g.id)}
                    className="btn"
                    style={{
                      padding: '12px 8px',
                      flexDirection: 'column',
                      gap: '4px',
                      background: isSelected 
                        ? (isAllReview ? '#8b5cf6' : 'var(--theme-accent, #ef8354)') 
                        : (isAllReview ? '#f5f3ff' : 'var(--theme-bg, #f8f3eb)'),
                      color: isSelected ? '#fff' : (isAllReview ? '#6d28d9' : 'var(--theme-border, #17324d)'),
                      border: isAllReview ? '2px dashed #8b5cf6' : '2px solid var(--theme-border, #17324d)',
                      boxShadow: isSelected ? '0 5px 0 rgba(0,0,0,0.2)' : '3px 3px 0 var(--theme-border, #17324d)',
                      transform: isSelected ? 'translateY(-2px)' : 'none'
                    }}
                  >
                    <span style={{ fontSize: '0.92rem', fontWeight: 800 }}>{g.short}</span>
                    <span style={{ fontSize: '0.7rem', opacity: isSelected ? 0.95 : 0.75 }}>
                      {isAllReview ? '★ 三年全冊複習' : g.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 步驟 2：選擇複習科目 (含全科總複習) */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <BookOpen size={18} color="var(--theme-accent, #ef8354)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--theme-border, #17324d)', margin: 0 }}>
                步驟 2：選擇複習科目
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '10px' }}>
              {/* 全科總複習按鈕 */}
              <button
                onClick={() => handleSubjectChange('all')}
                style={{
                  padding: '12px 14px',
                  border: selectedSubject === 'all' ? '2.5px solid #8b5cf6' : '1.5px dashed #a78bfa',
                  background: selectedSubject === 'all' ? '#ede9fe' : '#fbfaff',
                  color: selectedSubject === 'all' ? '#6d28d9' : '#7c3aed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  borderRadius: '14px',
                  fontWeight: selectedSubject === 'all' ? 900 : 700,
                  fontSize: '0.92rem',
                  boxShadow: selectedSubject === 'all' ? '3px 3px 0px #8b5cf6' : 'none',
                  transition: 'all 0.16s ease'
                }}
              >
                <Sparkles size={16} color="#7c3aed" />
                <span>全科總複習</span>
              </button>

              {SUBJECTS.map(s => {
                const isSelected = selectedSubject === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleSubjectChange(s.id)}
                    style={{
                      padding: '12px 14px',
                      border: isSelected ? '2px solid var(--theme-border, #17324d)' : '1.5px solid #ded3c5',
                      background: isSelected ? '#fff0e9' : 'var(--theme-bg, #f8f3eb)',
                      color: isSelected ? '#c8643d' : '#5b6772',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      borderRadius: '14px',
                      fontWeight: isSelected ? 800 : 700,
                      fontSize: '0.92rem',
                      boxShadow: isSelected ? '3px 3px 0px var(--theme-accent, #ef8354)' : 'none',
                      transition: 'all 0.16s ease'
                    }}
                  >
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: isSelected ? 'var(--theme-accent, #ef8354)' : '#9aa2a8' }} />
                    <span>{s.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 步驟 3：設定題目難度 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Sliders size={18} color="var(--theme-accent, #ef8354)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--theme-border, #17324d)', margin: 0 }}>
                步驟 3：設定題目難度
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {DIFFICULTIES.map(d => {
                const isSelected = selectedDifficulty === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDifficulty(d.id)}
                    style={{
                      padding: '12px 10px',
                      border: isSelected ? '2px solid var(--theme-border, #17324d)' : '1.5px solid #ded3c5',
                      background: isSelected ? 'var(--theme-bg, #f8f3eb)' : '#ffffff',
                      borderRadius: '14px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      boxShadow: isSelected ? '3px 3px 0px var(--theme-border, #17324d)' : 'none'
                    }}
                  >
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--theme-border, #17324d)' }}>
                      {d.badge}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#78818a', lineHeight: 1.4 }}>
                      {d.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 步驟 4：設定測驗題數 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Zap size={18} color="var(--theme-accent, #ef8354)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--theme-border, #17324d)', margin: 0 }}>
                步驟 4：設定測驗題數
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {[10, 15, 20, 25].map(cnt => {
                const isSelected = questionCount === cnt;
                return (
                  <button
                    key={cnt}
                    onClick={() => setQuestionCount(cnt)}
                    className="btn"
                    style={{
                      padding: '10px 0',
                      background: isSelected ? 'var(--theme-border, #17324d)' : 'var(--theme-bg, #f8f3eb)',
                      color: isSelected ? '#ffffff' : 'var(--theme-border, #17324d)',
                      border: '2px solid var(--theme-border, #17324d)',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      boxShadow: isSelected ? '0 4px 0 rgba(0,0,0,0.3)' : '2px 2px 0 var(--theme-border, #17324d)'
                    }}
                  >
                    {cnt} 題
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* 右欄：單元勾選與開始測驗按鈕 */}
        <div 
          className="glass-panel" 
          style={{ 
            padding: isMobile ? '20px 16px' : '26px', 
            display: 'flex', 
            flexDirection: 'column', 
            background: 'var(--theme-card, #fffdf9)',
            border: '2.5px solid var(--theme-border, #17324d)',
            borderRadius: isMobile ? '20px' : '24px',
            boxShadow: isMobile ? '4px 4px 0px var(--theme-border, #17324d)' : '6px 6px 0px var(--theme-border, #17324d)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--theme-border, #17324d)', margin: 0 }}>
                {selectedSubject === 'all' ? '✨ 全科跨領域綜合出題清單' : `步驟 5：選定測驗單元 (${selectedUnitIds.length}/${availableUnits.length})`}
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#78818a' }}>
                {selectedSubject === 'all' ? '自動涵蓋國、英、數、自、社各科題目' : '至少勾選 1 個單元，系統自動智慧去重分配'}
              </p>
            </div>

            {selectedSubject !== 'all' && (
              <button
                type="button"
                onClick={selectAllUnits}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '8px' }}
              >
                全選所有單元
              </button>
            )}
          </div>

          {/* 單元清單卡片列表 */}
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: '420px', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px', marginBottom: '20px' }}>
            {availableUnits.map(unit => {
              const isChecked = selectedSubject === 'all' || selectedUnitIds.includes(unit.id);
              return (
                <div
                  key={unit.id}
                  onClick={() => toggleUnit(unit.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: isChecked ? '2px solid var(--theme-border, #17324d)' : '1px solid #ded3c5',
                    background: isChecked ? '#fffcf6' : '#ffffff',
                    cursor: selectedSubject === 'all' ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {isChecked ? (
                    <CheckSquare size={18} color="var(--theme-accent, #ef8354)" />
                  ) : (
                    <Square size={18} color="#9aa2a8" />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--theme-border, #17324d)' }}>
                      {unit.name}
                    </div>
                    {unit.tags && (
                      <div style={{ fontSize: '0.74rem', color: '#78818a', marginTop: '2px' }}>
                        {unit.tags.join(' · ')}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 開始測驗大按鈕 */}
          <button
            type="button"
            onClick={handleLaunch}
            className="btn btn-primary"
            style={{
              padding: '16px',
              fontSize: '1.15rem',
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              borderRadius: '16px',
              background: 'var(--theme-accent, #ef8354)',
              boxShadow: '0 6px 0 #d76740, 0 10px 20px rgba(239, 131, 84, 0.3)',
              border: '2px solid var(--theme-border, #17324d)'
            }}
          >
            <Play size={20} fill="#ffffff" />
            <span>立即開始 AI 測驗 ({questionCount} 題)</span>
          </button>

        </div>

      </div>

    </div>
  );
}
