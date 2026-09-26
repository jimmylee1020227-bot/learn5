import React, { useState, useMemo, useEffect } from 'react';
import { UNIT_NOTES } from '../data/unitNotesData';
import { SUBJECTS, GRADES, EDUCATION_STAGES } from '../data/curriculum108';
import { submitNoteReport, getCustomNotes, fetchCloudCustomNotes } from '../services/cloudStorage';
import { 
  BookOpen, 
  Languages, 
  Binary, 
  Atom, 
  Compass, 
  Search, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  PlayCircle, 
  ChevronDown, 
  ChevronUp, 
  FileText,
  HelpCircle,
  Lightbulb,
  GraduationCap,
  Award,
  Flag,
  X,
  Send,
  Check,
  Calculator,
  Sigma,
  Shield
} from 'lucide-react';
import MathText from './MathText';

const iconMap = {
  chinese: BookOpen,
  english: Languages,
  math: Binary,
  science: Atom,
  social: Compass
};

export default function UnitNotesView({ onStartQuizForUnit }) {
  // 學制切換：'junior' (國中) 或 'senior' (高中)
  const [activeStage, setActiveStage] = useState('junior');
  const [activeSubject, setActiveSubject] = useState('math');
  const [selectedGrade, setSelectedGrade] = useState('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [expandedNotes, setExpandedNotes] = useState({});
  const [customOverrides, setCustomOverrides] = useState({});

  // 回報筆記錯誤 Modal 狀態
  const [reportingNote, setReportingNote] = useState(null);
  const [reportType, setReportType] = useState('內容有誤');
  const [reportDesc, setReportDesc] = useState('');
  const [reportSugg, setReportSugg] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  // 載入雲端自訂筆記（管理員修改後的筆記）
  useEffect(() => {
    setCustomOverrides(getCustomNotes());
    fetchCloudCustomNotes().then(res => {
      if (res) setCustomOverrides(res);
    });
  }, []);

  const toggleExpand = (id) => {
    setExpandedNotes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const expandAll = () => {
    const next = {};
    filteredNotes.forEach(n => { next[n.id] = true; });
    setExpandedNotes(next);
  };

  const collapseAll = () => {
    setExpandedNotes({});
  };

  // 當前科目與學制下的筆記列表（整合雲端覆蓋）
  const currentSubjectNotes = useMemo(() => {
    const baseList = UNIT_NOTES[activeSubject] || [];
    return baseList.map(item => {
      if (customOverrides[item.id]) {
        return { ...item, ...customOverrides[item.id], isCustomEdited: true };
      }
      return item;
    });
  }, [activeSubject, customOverrides]);

  // 篩選指定學制 (junior / senior) 與年級
  const stageGrades = useMemo(() => {
    return GRADES.filter(g => g.stage === activeStage);
  }, [activeStage]);

  const filteredNotes = useMemo(() => {
    return currentSubjectNotes.filter(note => {
      // 1. 學制篩選
      if (note.stage !== activeStage) return false;

      // 2. 年級篩選
      if (selectedGrade !== 'ALL' && note.gradeId !== selectedGrade) {
        return false;
      }

      // 3. 關鍵字檢索
      if (searchKeyword.trim()) {
        const kw = searchKeyword.trim().toLowerCase();
        const inTitle = (note.title || '').toLowerCase().includes(kw);
        const inGrade = (note.gradeName || '').toLowerCase().includes(kw);
        const inTags = (note.conceptTags || []).some(t => t.toLowerCase().includes(kw));
        const inConcepts = (note.coreConcepts || []).some(c => c.toLowerCase().includes(kw));
        const inTraps = (note.examTraps || []).some(t => t.toLowerCase().includes(kw));
        const inMnem = (note.mnemonics || '').toLowerCase().includes(kw);
        return inTitle || inGrade || inTags || inConcepts || inTraps || inMnem;
      }

      return true;
    });
  }, [currentSubjectNotes, activeStage, selectedGrade, searchKeyword]);

  // 提交筆記錯誤回報
  const handleSubmitReport = (e) => {
    e.preventDefault();
    if (!reportDesc.trim()) return;

    submitNoteReport({
      noteId: reportingNote.id,
      subjectId: reportingNote.subjectId,
      gradeId: reportingNote.gradeId,
      unitId: reportingNote.unitId,
      unitTitle: reportingNote.title,
      reportType,
      description: reportDesc,
      suggestion: reportSugg,
      reporterName: reporterName || '熱心同學'
    });

    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setReportingNote(null);
      setReportDesc('');
      setReportSugg('');
    }, 1500);
  };

  const currentSubjectMeta = SUBJECTS.find(s => s.id === activeSubject) || SUBJECTS[2];
  const SubjectIcon = iconMap[activeSubject] || BookOpen;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px', color: '#1e293b' }}>
      
      {/* 頂部標題與學制切換區 */}
      <div style={{ 
        background: 'linear-gradient(135deg, #0f172a, #1e293b)', 
        borderRadius: '20px', 
        padding: '24px 28px', 
        color: '#ffffff',
        marginBottom: '20px',
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ 
                background: '#3b82f6', 
                color: '#fff', 
                fontSize: '0.75rem', 
                fontWeight: 800, 
                padding: '4px 10px', 
                borderRadius: '999px',
                letterSpacing: '0.5px'
              }}>
                108 課綱全科精華
              </span>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                國中會考 & 高中學測·全單元重點筆記庫
              </span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>
              📖 智慧考點重點筆記專區
            </h1>
            <p style={{ margin: '8px 0 0 0', color: '#cbd5e1', fontSize: '0.92rem', maxWidth: '650px' }}>
              由名師精心歸納全單元核心公式、定義定理、易錯陷阱與大考速記口訣。支援一鍵開始該單元測驗與筆記錯誤回報修正！
            </p>
          </div>

          {/* 國中 / 高中 學制切換大按鈕 */}
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            padding: '6px', 
            borderRadius: '16px', 
            display: 'flex', 
            gap: '8px',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}>
            <button
              type="button"
              onClick={() => { setActiveStage('junior'); setSelectedGrade('ALL'); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '12px',
                border: 'none',
                background: activeStage === 'junior' ? '#3b82f6' : 'transparent',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: activeStage === 'junior' ? '0 4px 12px rgba(59, 130, 246, 0.4)' : 'none'
              }}
            >
              <GraduationCap size={18} />
              國中會考筆記
            </button>
            <button
              type="button"
              onClick={() => { setActiveStage('senior'); setSelectedGrade('ALL'); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '12px',
                border: 'none',
                background: activeStage === 'senior' ? '#8b5cf6' : 'transparent',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: activeStage === 'senior' ? '0 4px 12px rgba(139, 92, 246, 0.4)' : 'none'
              }}
            >
              <Award size={18} />
              高中學測筆記
            </button>
          </div>
        </div>
      </div>

      {/* 科目分頁標籤 */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        overflowX: 'auto', 
        paddingBottom: '10px',
        marginBottom: '16px'
      }}>
        {SUBJECTS.map(subj => {
          const Icon = iconMap[subj.id] || BookOpen;
          const isActive = activeSubject === subj.id;
          return (
            <button
              key={subj.id}
              type="button"
              onClick={() => {
                setActiveSubject(subj.id);
                setSelectedGrade('ALL');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '14px',
                border: isActive ? `2px solid ${subj.color}` : '1px solid #e2e8f0',
                background: isActive ? subj.color : '#ffffff',
                color: isActive ? '#ffffff' : '#475569',
                fontWeight: 800,
                fontSize: '0.92rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: isActive ? `0 4px 14px ${subj.color}44` : '0 1px 3px rgba(0,0,0,0.05)',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={18} />
              {subj.name}筆記
            </button>
          );
        })}
      </div>

      {/* 篩選與搜尋工具列 */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '14px 18px',
        border: '1px solid #e2e8f0',
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
      }}>
        {/* 年級快篩按鈕 */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>年級：</span>
          <button
            type="button"
            onClick={() => setSelectedGrade('ALL')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              border: selectedGrade === 'ALL' ? '1px solid #3b82f6' : '1px solid #cbd5e1',
              background: selectedGrade === 'ALL' ? '#eff6ff' : '#ffffff',
              color: selectedGrade === 'ALL' ? '#1d4ed8' : '#475569',
              cursor: 'pointer'
            }}
          >
            全部單元 ({filteredNotes.length})
          </button>
          {stageGrades.map(g => (
            <button
              key={g.id}
              type="button"
              onClick={() => setSelectedGrade(g.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: selectedGrade === g.id ? '1px solid #3b82f6' : '1px solid #cbd5e1',
                background: selectedGrade === g.id ? '#eff6ff' : '#ffffff',
                color: selectedGrade === g.id ? '#1d4ed8' : '#475569',
                cursor: 'pointer'
              }}
            >
              {g.short}
            </button>
          ))}
        </div>

        {/* 搜尋與全部展開/收合 */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="搜尋考點、公式、單元..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 12px 7px 32px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="button"
            onClick={expandAll}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 700,
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            全部展開
          </button>
          <button
            type="button"
            onClick={collapseAll}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 700,
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            全部收合
          </button>

          {/* 官方防偽浮水印標籤 */}
          <div 
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 800,
              border: '1px solid #a7f3d0',
              background: '#ecfdf5',
              color: '#065f46',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="本專區所有重點筆記與公式推導均已嵌入『學習網』專屬官方防偽防盜浮水印，在線閱讀均受版權保護"
          >
            <Shield size={14} color="#059669" />
            <span>官方防偽浮水印保護中</span>
          </div>
        </div>
      </div>

      {/* 筆記卡片清單 */}
      {filteredNotes.length === 0 ? (
        <div style={{ 
          background: '#ffffff', 
          borderRadius: '16px', 
          padding: '48px', 
          textAlign: 'center', 
          border: '1px dashed #cbd5e1' 
        }}>
          <p style={{ fontSize: '1.1rem', color: '#64748b', margin: 0, fontWeight: 700 }}>
            未找到符合「{searchKeyword}」之重點筆記
          </p>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '8px' }}>
            請嘗試切換科目、年級或清除搜尋字串
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredNotes.map((note) => {
            const isExpanded = expandedNotes[note.id] !== false; // 預設展開
            return (
              <div 
                key={note.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: note.isCustomEdited ? '2px solid #8b5cf6' : '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  overflow: 'hidden',
                  transition: 'all 0.2s'
                }}
              >
                {/* 卡片標題欄 */}
                <div 
                  onClick={() => toggleExpand(note.id)}
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    background: isExpanded ? `${currentSubjectMeta.color}08` : '#ffffff',
                    borderBottom: isExpanded ? '1px solid #f1f5f9' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: note.stage === 'senior' ? '#f3e8ff' : '#e0f2fe',
                      color: note.stage === 'senior' ? '#6b21a8' : '#0369a1',
                      fontSize: '0.78rem',
                      fontWeight: 800
                    }}>
                      {note.gradeName}
                    </span>

                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                      {note.title}
                    </h3>

                    {note.isCustomEdited && (
                      <span style={{ 
                        fontSize: '0.72rem', 
                        fontWeight: 800, 
                        background: '#dcfce7', 
                        color: '#15803d', 
                        padding: '2px 6px', 
                        borderRadius: '4px' 
                      }}>
                        ✓ 管理員在線修訂版
                      </span>
                    )}

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {(note.conceptTags || []).map((t, idx) => (
                        <span key={idx} style={{
                          background: '#f1f5f9',
                          color: '#475569',
                          fontSize: '0.72rem',
                          padding: '2px 8px',
                          borderRadius: '999px',
                          fontWeight: 600
                        }}>
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isExpanded ? <ChevronUp size={20} color="#64748b" /> : <ChevronDown size={20} color="#64748b" />}
                  </div>
                </div>

                {/* 卡片展開詳情內容 */}
                {isExpanded && (
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', overflow: 'hidden' }}>
                    
                    {/* 學習網專屬防偽防盜浮水印層 (支援在線閱覽與紙本列印防盜) */}
                    <div 
                      className="note-watermark-overlay"
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        pointerEvents: 'none',
                        zIndex: 0,
                        opacity: 0.055,
                        userSelect: 'none',
                        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='280' height='160' viewBox='0 0 280 160'><text x='20' y='90' fill='%2317324d' font-size='15' font-weight='900' font-family='sans-serif' transform='rotate(-22 140 80)'>學習網 ‧ 官方考點筆記</text><text x='35' y='115' fill='%2317324d' font-size='10' font-weight='700' font-family='sans-serif' opacity='0.7' transform='rotate(-22 140 80)'>版權所有 ‧ 嚴禁翻印盜用</text></svg>")`,
                        backgroundRepeat: 'repeat'
                      }}
                    />
                    
                    {/* 1. 核心公式與定理要點 */}
                    {note.keyFormulas && note.keyFormulas.length > 0 && (
                      <div style={{
                        background: '#f8fafc',
                        borderRadius: '12px',
                        padding: '14px 16px',
                        borderLeft: `4px solid ${currentSubjectMeta.color}`
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: currentSubjectMeta.color, fontWeight: 800, fontSize: '0.9rem' }}>
                          <CheckCircle2 size={16} />
                          <span>核心必考公式與指標規範</span>
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '20px', color: '#334155', fontSize: '0.88rem', lineHeight: '1.6' }}>
                          {note.keyFormulas.map((f, i) => (
                            <li key={i} style={{ marginBottom: '6px' }}>
                              <MathText text={f} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 2. 深入核心觀念解析 */}
                    {note.coreConcepts && note.coreConcepts.length > 0 && (
                      <div style={{
                        background: '#fffbeb',
                        borderRadius: '12px',
                        padding: '14px 16px',
                        borderLeft: '4px solid #f59e0b'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#b45309', fontWeight: 800, fontSize: '0.9rem' }}>
                          <Lightbulb size={16} />
                          <span>解題推導脈絡與素養理解</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#451a03', fontSize: '0.88rem', lineHeight: '1.6' }}>
                          {note.coreConcepts.map((c, i) => (
                            <div key={i} style={{ margin: 0 }}>
                              <MathText text={c} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 3. 會考/學測易錯陷阱與常見盲點 */}
                    {note.examTraps && note.examTraps.length > 0 && (
                      <div style={{
                        background: '#fef2f2',
                        borderRadius: '12px',
                        padding: '14px 16px',
                        borderLeft: '4px solid #ef4444'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#b91c1c', fontWeight: 800, fontSize: '0.9rem' }}>
                          <AlertTriangle size={16} />
                          <span>大考五星級常犯陷阱 (必避盲點)</span>
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '20px', color: '#7f1d1d', fontSize: '0.88rem', lineHeight: '1.6' }}>
                          {note.examTraps.map((t, i) => (
                            <li key={i} style={{ marginBottom: '6px' }}>
                              <MathText text={t} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 4. 經典題型與詳細算式推導 (Step-by-Step 解析) */}
                    {note.calculations && note.calculations.length > 0 && (
                      <div style={{
                        background: '#f0fdf4',
                        borderRadius: '14px',
                        padding: '16px 18px',
                        borderLeft: '4px solid #10b981',
                        border: '1.5px solid #a7f3d0'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#065f46', fontWeight: 900, fontSize: '0.94rem' }}>
                          <Sigma size={18} color="#059669" />
                          <span>📐 經典題型與詳細算式推導 (Step-by-Step 完整演算)</span>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          {note.calculations.map((calc, cIdx) => (
                            <div 
                              key={cIdx}
                              style={{
                                background: '#ffffff',
                                borderRadius: '12px',
                                border: '1.5px solid #cbd5e1',
                                padding: '14px 16px',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
                              }}
                            >
                              {/* 範例標題 */}
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontWeight: 900, fontSize: '0.92rem', color: '#1e293b' }}>
                                  📌 {calc.title || `經典算式範例 ${cIdx + 1}`}
                                </span>
                                <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
                                  含完整算式
                                </span>
                              </div>

                              {/* 題目描述 */}
                              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.88rem', color: '#334155', marginBottom: '10px', lineHeight: 1.6 }}>
                                <strong style={{ color: '#0f172a' }}>【題目】</strong>
                                <MathText text={calc.question} />
                              </div>

                              {/* 破題思維 */}
                              {calc.keyIdea && (
                                <div style={{ fontSize: '0.84rem', color: '#0284c7', background: '#f0f9ff', padding: '8px 12px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #bae6fd', lineHeight: 1.5 }}>
                                  💡 <strong>破題思維與公式依據：</strong>
                                  <MathText text={calc.keyIdea} />
                                </div>
                              )}

                              {/* 詳細步驟算式 */}
                              {calc.solutionSteps && calc.solutionSteps.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '8px 0' }}>
                                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#475569' }}>
                                    ✏️ <strong>逐步推導與計算算式：</strong>
                                  </div>
                                  <div style={{ paddingLeft: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {calc.solutionSteps.map((step, sIdx) => (
                                      <div key={sIdx} style={{ fontSize: '0.88rem', color: '#1e293b', lineHeight: 1.6, display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                        <span style={{ color: '#10b981', fontWeight: 900, whiteSpace: 'nowrap' }}>步驟 {sIdx + 1}：</span>
                                        <div style={{ flex: 1 }}>
                                          <MathText text={step} />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* 最終答案 */}
                              {calc.answer && (
                                <div style={{ marginTop: '10px', padding: '8px 12px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #6ee7b7', color: '#065f46', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Check size={16} />
                                  <span>本題正解：</span>
                                  <MathText text={calc.answer} />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 5. 高分速記口訣 */}
                    {note.mnemonics && (
                      <div style={{
                        background: 'linear-gradient(135deg, #fae8ff, #fdf4ff)',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        border: '1px solid #f0abfc',
                        fontSize: '0.86rem',
                        fontWeight: 700,
                        color: '#86198f',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <Sparkles size={16} color="#a855f7" />
                        <div>
                          <MathText text={note.mnemonics} />
                        </div>
                      </div>
                    )}

                    {/* 底部按鈕：單元列印、開始測驗、回報錯誤 */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      flexWrap: 'wrap', 
                      gap: '10px', 
                      paddingTop: '10px', 
                      borderTop: '1px dashed #e2e8f0' 
                    }}>
                      {/* 回報筆記問題 */}
                      <button
                        type="button"
                        onClick={() => setReportingNote(note)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          border: '1px solid #fecaca',
                          background: '#fff1f2',
                          color: '#e11d48',
                          cursor: 'pointer'
                        }}
                      >
                        <Flag size={13} />
                        回報筆記錯誤 / 建議修改
                      </button>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        {onStartQuizForUnit && (
                          <button
                            type="button"
                            onClick={() => onStartQuizForUnit(note.subjectId, note.gradeId, note.unitId)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 14px',
                              borderRadius: '8px',
                              fontSize: '0.8rem',
                              fontWeight: 800,
                              border: 'none',
                              background: currentSubjectMeta.color,
                              color: '#ffffff',
                              cursor: 'pointer',
                              boxShadow: `0 2px 8px ${currentSubjectMeta.color}44`
                            }}
                          >
                            <PlayCircle size={14} />
                            立即進行此單元 AI 測驗
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 筆記官方版權防偽標註 */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.72rem',
                      color: '#94a3b8',
                      paddingTop: '8px',
                      position: 'relative',
                      zIndex: 1,
                      borderTop: '1px dotted #e2e8f0',
                      flexWrap: 'wrap',
                      gap: '6px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Shield size={12} color="#10b981" />
                        <span>學習網官方原創版權所有 ‧ 具備數位防偽浮水印保護</span>
                      </div>
                      <span>單元代碼：{note.id}</span>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 回報筆記錯誤 Modal 彈窗 */}
      {reportingNote && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            maxWidth: '520px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ background: '#ffe4e6', color: '#e11d48', padding: '6px', borderRadius: '10px' }}>
                  <Flag size={20} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                  回報筆記內容錯誤
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReportingNote(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            {reportSuccess ? (
              <div style={{ padding: '32px 0', textAlign: 'center', color: '#16a34a' }}>
                <Check size={48} style={{ margin: '0 auto 12px' }} />
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>感謝回報！管理員已收到通知</h4>
                <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '6px' }}>後台將即時審查並在線修改筆記內容</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
                    單元名稱
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`[${reportingNote.gradeName}] ${reportingNote.title}`}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '0.85rem', color: '#334155' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
                    問題類型
                  </label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  >
                    <option value="內容有誤">內容公式/定理有誤</option>
                    <option value="錯別字或符號錯誤">錯別字或教育部符號錯誤</option>
                    <option value="漏列重要考點">漏列重大考點陷阱</option>
                    <option value="口訣優化建議">口訣或速記法優化建議</option>
                    <option value="其他">其他建議</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
                    詳細說明問題點 <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="請描述具體是哪一行、哪一個公式或概念有誤..."
                    value={reportDesc}
                    onChange={(e) => setReportDesc(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
                    建議修正內容 (選填)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="請提供您認為正確的公式或說明文字..."
                    value={reportSugg}
                    onChange={(e) => setReportSugg(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
                    回報人暱稱 (選填)
                  </label>
                  <input
                    type="text"
                    placeholder="例如：建中林同學、北一女張同學"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setReportingNote(null)}
                    style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 18px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#e11d48',
                      color: '#ffffff',
                      fontWeight: 800,
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    <Send size={14} />
                    送出回報
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
