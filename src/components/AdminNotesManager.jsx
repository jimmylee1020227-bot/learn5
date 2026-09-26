import React, { useState, useEffect, useMemo } from 'react';
import { 
  getNoteReports, 
  fetchCloudNoteReports, 
  resolveNoteReport, 
  saveCustomNoteOverride, 
  getCustomNotes, 
  fetchCloudCustomNotes 
} from '../services/cloudStorage';
import { UNIT_NOTES } from '../data/unitNotesData';
import { SUBJECTS, GRADES } from '../data/curriculum108';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Edit3, 
  Save, 
  Sparkles, 
  GraduationCap, 
  Award, 
  Check, 
  RefreshCw,
  BookOpen,
  Send
} from 'lucide-react';

export default function AdminNotesManager({ currentUser }) {
  const [reports, setReports] = useState(() => getNoteReports());
  const [customNotes, setCustomNotes] = useState(() => getCustomNotes());
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // 編輯器選擇狀態
  const [editStage, setEditStage] = useState('junior');
  const [editSubject, setEditSubject] = useState('math');
  const [selectedNoteId, setSelectedNoteId] = useState('');

  // 編輯表單內容
  const [editTitle, setEditTitle] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editFormulas, setEditFormulas] = useState('');
  const [editConcepts, setEditConcepts] = useState('');
  const [editTraps, setEditTraps] = useState('');
  const [editMnemonics, setEditMnemonics] = useState('');

  // 重新從雲端抓取回報與自訂筆記
  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [cloudReps, cloudNotes] = await Promise.all([
        fetchCloudNoteReports(),
        fetchCloudCustomNotes()
      ]);
      if (cloudReps) setReports(cloudReps);
      if (cloudNotes) setCustomNotes(cloudNotes);
      setStatusMsg('已成功同步雲端最新筆記回報與自訂修訂資料！');
      setTimeout(() => setStatusMsg(''), 2500);
    } catch (e) {
      console.warn('雲端更新失敗:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // 當前科目與學制的所有筆記清單
  const availableNotes = useMemo(() => {
    const list = UNIT_NOTES[editSubject] || [];
    return list.filter(n => n.stage === editStage);
  }, [editSubject, editStage]);

  // 當選擇的單元改變時，填入表單
  useEffect(() => {
    if (!selectedNoteId && availableNotes.length > 0) {
      loadNoteToEditor(availableNotes[0]);
    } else if (selectedNoteId) {
      const target = availableNotes.find(n => n.id === selectedNoteId);
      if (target) loadNoteToEditor(target);
    }
  }, [selectedNoteId, availableNotes]);

  const loadNoteToEditor = (note) => {
    const activeData = customNotes[note.id] || note;
    setSelectedNoteId(note.id);
    setEditTitle(activeData.title || note.title || '');
    setEditTags((activeData.conceptTags || note.conceptTags || []).join(', '));
    setEditFormulas((activeData.keyFormulas || note.keyFormulas || []).join('\n'));
    setEditConcepts((activeData.coreConcepts || note.coreConcepts || []).join('\n'));
    setEditTraps((activeData.examTraps || note.examTraps || []).join('\n'));
    setEditMnemonics(activeData.mnemonics || note.mnemonics || '');
  };

  // 載入某則回報對應的單元
  const handleLoadReportToEditor = (rep) => {
    if (rep.subjectId) setEditSubject(rep.subjectId);
    if (rep.gradeId && (rep.gradeId.startsWith('h') || rep.gradeId === 'gsat' || rep.gradeId === 'senior-all')) {
      setEditStage('senior');
    } else {
      setEditStage('junior');
    }
    if (rep.noteId) {
      setSelectedNoteId(rep.noteId);
    }
    setStatusMsg(`已載入單元【${rep.unitTitle || rep.noteId}】至編輯器，請於下方進行修訂。`);
  };

  // 儲存筆記修改至雲端
  const handleSaveNote = () => {
    if (!selectedNoteId) return;

    const baseNote = availableNotes.find(n => n.id === selectedNoteId) || {};
    const updatedData = {
      ...baseNote,
      id: selectedNoteId,
      title: editTitle.trim(),
      conceptTags: editTags.split(',').map(t => t.trim()).filter(Boolean),
      keyFormulas: editFormulas.split('\n').map(l => l.trim()).filter(Boolean),
      coreConcepts: editConcepts.split('\n').map(l => l.trim()).filter(Boolean),
      examTraps: editTraps.split('\n').map(l => l.trim()).filter(Boolean),
      mnemonics: editMnemonics.trim()
    };

    saveCustomNoteOverride(selectedNoteId, updatedData, currentUser);
    setCustomNotes(prev => ({ ...prev, [selectedNoteId]: updatedData }));
    setStatusMsg(`✓ 單元筆記【${updatedData.title}】已成功儲存並同步至全站雲端！學生端即時生效。`);
    setTimeout(() => setStatusMsg(''), 3500);
  };

  // 結案回報
  const handleResolveReport = (repId) => {
    const res = resolveNoteReport(repId, currentUser, '已由管理員在線完成筆記審核與修訂');
    setReports(res);
    setStatusMsg('✓ 已將該筆記回報標記為【已修正】');
    setTimeout(() => setStatusMsg(''), 2500);
  };

  const pendingReports = reports.filter(r => r.status === 'pending');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 提示訊息 */}
      {statusMsg && (
        <div style={{
          background: '#dcfce7',
          color: '#15803d',
          padding: '12px 18px',
          borderRadius: '12px',
          fontWeight: 700,
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Check size={18} />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* 區塊 1：學生回報筆記問題審核清單 */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171' }}>
            <AlertTriangle size={18} />
            學生筆記錯誤與修改建議回報 ({pendingReports.length} 件待處理)
          </h3>
          <button
            type="button"
            onClick={refreshData}
            disabled={isLoading}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
            刷新雲端回報
          </button>
        </div>

        {pendingReports.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
            🎉 目前沒有待處理的筆記錯誤回報，所有國高中筆記皆處於最新校準狀態！
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pendingReports.map(rep => (
              <div 
                key={rep.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  border: '1px solid rgba(248, 113, 113, 0.3)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ flex: '1 1 350px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ background: '#fecaca', color: '#991b1b', fontSize: '0.72rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                      {rep.reportType}
                    </span>
                    <strong style={{ fontSize: '0.95rem', color: '#f1f5f9' }}>
                      {rep.unitTitle || rep.noteId}
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                      · 由「{rep.reporterName || '同學'}」回報於 {new Date(rep.timestamp).toLocaleString('zh-TW')}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.86rem', color: '#cbd5e1', marginBottom: '4px' }}>
                    <strong>問題描述：</strong>{rep.description}
                  </div>
                  {rep.suggestion && (
                    <div style={{ fontSize: '0.84rem', color: '#38bdf8' }}>
                      <strong>建議修改：</strong>{rep.suggestion}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => handleLoadReportToEditor(rep)}
                    className="btn btn-primary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Edit3 size={13} /> 載入編輯器修訂
                  </button>
                  <button
                    type="button"
                    onClick={() => handleResolveReport(rep.id)}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <CheckCircle2 size={13} /> 標記已處理
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 區塊 2：國高中單元重點筆記在線編輯器 */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8' }}>
          <Edit3 size={18} />
          國高中單元重點筆記在線編輯器（即時雲端發布）
        </h3>

        {/* 學制與科目篩選 */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setEditStage('junior')}
              className={`btn ${editStage === 'junior' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: '0.85rem' }}
            >
              <GraduationCap size={15} /> 國中階段
            </button>
            <button
              type="button"
              onClick={() => setEditStage('senior')}
              className={`btn ${editStage === 'senior' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: '0.85rem' }}
            >
              <Award size={15} /> 高中階段
            </button>
          </div>

          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
            {SUBJECTS.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => setEditSubject(s.id)}
                className={`btn ${editSubject === s.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 12px', fontSize: '0.82rem' }}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* 單元下拉選單 */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
            選擇要修訂的單元 ({availableNotes.length} 個單元)：
          </label>
          <select
            value={selectedNoteId}
            onChange={(e) => setSelectedNoteId(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '10px',
              background: '#0f172a',
              color: '#ffffff',
              border: '1px solid #334155',
              fontSize: '0.9rem',
              fontWeight: 700
            }}
          >
            {availableNotes.map(n => (
              <option key={n.id} value={n.id}>
                [{n.gradeName}] {n.title} {customNotes[n.id] ? '(✓ 已有在線修訂版)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* 筆記編輯表單 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
              單元標題
            </label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
              概念標籤（以逗號分隔）
            </label>
            <input
              type="text"
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
              核心公式與必考定理（每行一項）
            </label>
            <textarea
              rows={3}
              value={editFormulas}
              onChange={(e) => setEditFormulas(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155', fontFamily: 'monospace' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
              解題推導脈絡與核心觀念（每行一項）
            </label>
            <textarea
              rows={3}
              value={editConcepts}
              onChange={(e) => setEditConcepts(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
              大考五星級常犯陷阱（每行一項）
            </label>
            <textarea
              rows={3}
              value={editTraps}
              onChange={(e) => setEditTraps(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
              大考高分速記口訣
            </label>
            <input
              type="text"
              value={editMnemonics}
              onChange={(e) => setEditMnemonics(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={handleSaveNote}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 24px',
                fontSize: '0.95rem',
                fontWeight: 800,
                background: '#10b981',
                borderColor: '#10b981'
              }}
            >
              <Save size={16} />
              儲存並同步至全站雲端（學生即刻生效）
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
