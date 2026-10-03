import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Plus, 
  Send, 
  FileText, 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Trash2, 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle, 
  Award, 
  Eye, 
  Flame, 
  Calendar, 
  Settings, 
  ChevronRight, 
  ChevronDown, 
  HelpCircle,
  TrendingUp,
  Sliders,
  Check,
  BellRing
} from 'lucide-react';
import { 
  getClassesByTeacher, 
  createClass, 
  updateClassSettings, 
  resetClassLeaderboard, 
  getClassLeaderboard,
  getAssignmentsByClass,
  createClassAssignment,
  fetchAssignmentDiagnosticReport,
  calculateStudentUnitMastery
} from '../services/classService';
import { SUBJECTS, GRADES, CURRICULUM_UNITS } from '../data/curriculum108';
import MathText from './MathText';

export default function TeacherDashboard({ currentUser, onOpenProgressModal }) {
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [activeTab, setActiveTab] = useState('classes'); // 'classes' | 'assignments' | 'students'
  
  // 建立班級 Modal 狀態
  const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassSchool, setNewClassSchool] = useState(currentUser?.school || '');
  const [newClassGrade, setNewClassGrade] = useState('g8');
  const [newClassSubject, setNewClassSubject] = useState('math');
  const [copiedCode, setCopiedCode] = useState('');

  // 派發作業 Modal 狀態
  const [isCreateAssignmentOpen, setIsCreateAssignmentOpen] = useState(false);
  const [asgTitle, setAsgTitle] = useState('');
  const [asgSubject, setAsgSubject] = useState('math');
  const [asgGrade, setAsgGrade] = useState('g8');
  const [asgUnit, setAsgUnit] = useState('');
  const [asgQuestionCount, setAsgQuestionCount] = useState(10);
  const [asgDifficulty, setAsgDifficulty] = useState('medium');
  const [asgDeadlineDays, setAsgDeadlineDays] = useState(7);

  // 作業清單與診斷狀態
  const [classAssignments, setClassAssignments] = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [diagnosticReport, setDiagnosticReport] = useState(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [expandedQuestionIdx, setExpandedQuestionIdx] = useState(null);

  // 排行榜設定狀態
  const [isResetSettingsOpen, setIsResetSettingsOpen] = useState(false);
  const [resetMode, setResetMode] = useState('interval');
  const [intervalType, setIntervalType] = useState('weekly');
  const [specificResetDate, setSpecificResetDate] = useState('');
  const [isLeaderboardEnabled, setIsLeaderboardEnabled] = useState(true);

  // 學生個別學況調閱狀態
  const [selectedStudentForMastery, setSelectedStudentForMastery] = useState(null);
  const [studentMasteryReport, setStudentMasteryReport] = useState(null);

  // 載入該老師的班級清單
  const refreshClasses = () => {
    const list = getClassesByTeacher(currentUser?.id || '');
    setTeacherClasses(list);
    if (list.length > 0 && (!selectedClassId || !list.some(c => c.id === selectedClassId))) {
      setSelectedClassId(list[0].id);
    }
  };

  useEffect(() => {
    refreshClasses();
  }, [currentUser]);

  const activeClass = useMemo(() => {
    return teacherClasses.find(c => c.id === selectedClassId) || null;
  }, [teacherClasses, selectedClassId]);

  // 當選中班級改變時，載入該班作業與排行榜設定
  useEffect(() => {
    if (activeClass) {
      const asgs = getAssignmentsByClass(activeClass.id);
      setClassAssignments(asgs);
      if (asgs.length > 0 && !selectedAssignmentId) {
        setSelectedAssignmentId(asgs[0].id);
      }
      setIsLeaderboardEnabled(activeClass.leaderboardSettings?.isEnabled ?? true);
      setResetMode(activeClass.leaderboardSettings?.resetMode || 'interval');
      setIntervalType(activeClass.leaderboardSettings?.intervalType || 'weekly');
      setSpecificResetDate(activeClass.leaderboardSettings?.specificResetDate || '');
    }
  }, [activeClass]);

  // 載入當前作業的診斷報表
  const loadDiagnosticReport = async (asgId, clsId) => {
    if (!asgId || !clsId) return;
    setIsLoadingReport(true);
    try {
      const report = await fetchAssignmentDiagnosticReport(asgId, clsId);
      setDiagnosticReport(report);
    } catch (err) {
      console.warn('Failed to load diagnostic report', err);
    } finally {
      setIsLoadingReport(false);
    }
  };

  useEffect(() => {
    if (selectedAssignmentId && activeClass) {
      loadDiagnosticReport(selectedAssignmentId, activeClass.id);
    }
  }, [selectedAssignmentId, activeClass]);

  // 班級即時排行榜
  const classLeaderboard = useMemo(() => {
    if (!activeClass) return [];
    return getClassLeaderboard(activeClass.id);
  }, [activeClass]);

  // 課綱單元清單 (依所選科目與年級聯動)
  const availableUnits = useMemo(() => {
    return (CURRICULUM_UNITS[asgSubject] && CURRICULUM_UNITS[asgSubject][asgGrade]) || [];
  }, [asgSubject, asgGrade]);

  useEffect(() => {
    if (availableUnits.length > 0 && !asgUnit) {
      setAsgUnit(availableUnits[0].id);
    }
  }, [availableUnits]);

  // 複製班級代碼
  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2500);
  };

  // 建立班級
  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    try {
      const created = await createClass({
        teacherUser: currentUser,
        className: newClassName.trim(),
        school: newClassSchool.trim(),
        grade: newClassGrade,
        subject: newClassSubject,
        leaderboardSettings: {
          isEnabled: true,
          resetMode: 'interval',
          intervalType: 'weekly'
        }
      });
      refreshClasses();
      setSelectedClassId(created.id);
      setIsCreateClassOpen(false);
      setNewClassName('');
      alert(`🎉 班級【${created.className}】建立成功！\n\n專屬班級代碼為：${created.classCode}\n請將此代碼分享給學生加入。`);
    } catch (err) {
      alert('建立失敗: ' + err.message);
    }
  };

  // 派發作業
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!asgTitle.trim() || !activeClass) return;

    try {
      const deadline = new Date(Date.now() + asgDeadlineDays * 86400000).toISOString();
      const newAsg = await createClassAssignment({
        teacherUser: currentUser,
        classId: activeClass.id,
        title: asgTitle.trim(),
        deadline,
        subjectId: asgSubject,
        gradeId: asgGrade,
        unitId: asgUnit || availableUnits[0]?.id || 'm-8-u1',
        questionCount: Number(asgQuestionCount),
        difficulty: asgDifficulty
      });

      const updated = getAssignmentsByClass(activeClass.id);
      setClassAssignments(updated);
      setSelectedAssignmentId(newAsg.id);
      setIsCreateAssignmentOpen(false);
      setAsgTitle('');
      setActiveTab('assignments');
      alert(`✅ 作業【${newAsg.title}】已成功派發給全班學生！`);
    } catch (err) {
      alert('派發失敗: ' + err.message);
    }
  };

  // 儲存排行榜重置設定
  const handleSaveLeaderboardSettings = async () => {
    if (!activeClass) return;
    try {
      await updateClassSettings(activeClass.id, {
        leaderboardSettings: {
          ...activeClass.leaderboardSettings,
          isEnabled: isLeaderboardEnabled,
          resetMode,
          intervalType,
          specificResetDate
        }
      });
      refreshClasses();
      setIsResetSettingsOpen(false);
      alert('✅ 班級排行榜規則已成功儲存並同步至雲端！');
    } catch (err) {
      alert('儲存失敗: ' + err.message);
    }
  };

  // 手動立即歸零重置班級排行榜
  const handleManualResetLeaderboard = async () => {
    if (!activeClass) return;
    const confirmed = window.confirm(`⚠️ 確定要立即「手動歸零」【${activeClass.className}】的班級排行榜點數嗎？\n\n所有學生在該班的目前積分將重設為 0，上一期的前三名學生將自動封存至班級歷史名人堂！`);
    if (!confirmed) return;

    try {
      await resetClassLeaderboard(activeClass.id, currentUser);
      refreshClasses();
      alert('🏆 班級排行榜已歸零重置，進入全新週期！');
    } catch (err) {
      alert('重置失敗: ' + err.message);
    }
  };

  // 調閱學生單元強弱掌握度
  const handleInspectStudentMastery = (student) => {
    setSelectedStudentForMastery(student);
    const mastery = calculateStudentUnitMastery(student.id);
    setStudentMasteryReport(mastery);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 12px 60px 12px' }}>
      
      {/* 頂部歡迎與班級選擇切換 Bar */}
      <div 
        style={{
          background: 'var(--theme-card, #fffdf9)',
          border: '3px solid var(--theme-border, #17324d)',
          borderRadius: '24px',
          boxShadow: '6px 6px 0px var(--theme-border, #17324d)',
          padding: '20px 24px',
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div 
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '16px',
              background: '#4f46e5',
              border: '2.5px solid var(--theme-border, #17324d)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '3px 3px 0px var(--theme-border, #17324d)'
            }}
          >
            <ShieldCheck size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 900, color: 'var(--theme-border, #17324d)' }}>
                教師中台・班級經營中心
              </h1>
              <span className="badge badge-emerald" style={{ fontWeight: 800 }}>認證教師</span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: '#64748b', fontWeight: 600 }}>
              授課老師：{currentUser?.displayName || currentUser?.name || '教師'} ({currentUser?.email || ''})
            </p>
          </div>
        </div>

        {/* 班級下拉選擇與建立新班級 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {teacherClasses.length > 0 && (
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: '14px',
                border: '2px solid var(--theme-border, #17324d)',
                background: '#ffffff',
                fontWeight: 800,
                fontSize: '0.95rem',
                color: 'var(--theme-border, #17324d)',
                boxShadow: '3px 3px 0px var(--theme-border, #17324d)'
              }}
            >
              {teacherClasses.map(c => (
                <option key={c.id} value={c.id}>
                  🏫 {c.className} ({c.students?.length || 0}人)
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={() => setIsCreateClassOpen(true)}
            className="btn btn-primary"
            style={{ padding: '10px 18px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={18} />
            <span>建立新班級</span>
          </button>
        </div>
      </div>

      {teacherClasses.length === 0 ? (
        <div 
          style={{
            background: 'var(--theme-card, #fffdf9)',
            border: '3px solid var(--theme-border, #17324d)',
            borderRadius: '24px',
            padding: '60px 20px',
            textAlign: 'center',
            boxShadow: '8px 8px 0px var(--theme-border, #17324d)'
          }}
        >
          <Users size={64} color="#94a3b8" style={{ margin: '0 auto 16px auto' }} />
          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--theme-border, #17324d)' }}>
            您尚未建立任何班級
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.92rem', maxWidth: '480px', margin: '8px auto 24px auto', lineHeight: 1.6, fontWeight: 600 }}>
            立即點擊「建立新班級」生成 6 碼班級專屬代碼。學生輸入代碼即可加入，您便能在此指派作業、調閱弱點單元並設定競賽排行！
          </p>
          <button
            onClick={() => setIsCreateClassOpen(true)}
            className="btn btn-primary"
            style={{ padding: '12px 28px', fontSize: '1rem', fontWeight: 900 }}
          >
            ➕ 立即建立我的第一個班級
          </button>
        </div>
      ) : (
        <>
          {/* 班級專屬資訊卡 (代碼卡片、排行榜狀態、一鍵派作業) */}
          {activeClass && (
            <div 
              style={{
                background: 'linear-gradient(135deg, #ffffff, #fffbf5)',
                border: '3px solid var(--theme-border, #17324d)',
                borderRadius: '20px',
                boxShadow: '5px 5px 0px var(--theme-border, #17324d)',
                padding: '20px',
                marginBottom: '20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '16px',
                alignItems: 'center'
              }}
            >
              {/* 班級代碼卡片 */}
              <div 
                style={{
                  background: '#f8fafc',
                  border: '2px solid var(--theme-border, #17324d)',
                  borderRadius: '16px',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 800 }}>班級邀請代碼 (學生輸入即可加入)</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#4f46e5', letterSpacing: '2px', fontFamily: 'var(--font-mono)' }}>
                    {activeClass.classCode}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyCode(activeClass.classCode)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid var(--theme-border, #17324d)',
                    background: copiedCode === activeClass.classCode ? '#dcfce7' : '#ffffff',
                    color: copiedCode === activeClass.classCode ? '#15803d' : 'var(--theme-border, #17324d)',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {copiedCode === activeClass.classCode ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copiedCode === activeClass.classCode ? '已複製！' : '複製代碼'}</span>
                </button>
              </div>

              {/* 班級競賽狀態與重置開關 */}
              <div 
                style={{
                  background: '#f8fafc',
                  border: '2px solid var(--theme-border, #17324d)',
                  borderRadius: '16px',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 800 }}>班級專屬競賽排行</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span 
                      style={{
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        background: activeClass.leaderboardSettings?.isEnabled ? '#dcfce7' : '#fee2e2',
                        color: activeClass.leaderboardSettings?.isEnabled ? '#15803d' : '#b91c1c'
                      }}
                    >
                      {activeClass.leaderboardSettings?.isEnabled ? '🟢 競賽進行中' : '🔴 已關閉 (學生顯示全服榜)'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>
                      {activeClass.leaderboardSettings?.resetMode === 'interval' ? '每週一歸零' : 
                       activeClass.leaderboardSettings?.resetMode === 'specific_date' ? `特定日: ${activeClass.leaderboardSettings?.specificResetDate?.slice(0, 10)}` : '手動重置'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsResetSettingsOpen(true)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid var(--theme-border, #17324d)',
                    background: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Settings size={15} />
                  <span>管理規則</span>
                </button>
              </div>

              {/* 派發作業按鈕 */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateAssignmentOpen(true)}
                  className="btn btn-primary"
                  style={{
                    flex: 1,
                    padding: '14px',
                    fontWeight: 900,
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: 'var(--theme-accent, #ef8354)'
                  }}
                >
                  <Send size={18} />
                  <span>手動派發新作業</span>
                </button>
              </div>
            </div>
          )}

          {/* 功能頁籤 (班級成員與排行 / 作業與逐題成效診斷 / 學生單元強弱) */}
          <div style={{ display: 'flex', gap: '10px', borderBottom: '2.5px solid var(--theme-border, #17324d)', paddingBottom: '12px', marginBottom: '20px' }}>
            <button
              onClick={() => setActiveTab('classes')}
              style={{
                padding: '10px 20px',
                borderRadius: '14px',
                border: '2px solid var(--theme-border, #17324d)',
                background: activeTab === 'classes' ? 'var(--theme-border, #17324d)' : '#ffffff',
                color: activeTab === 'classes' ? '#ffffff' : 'var(--theme-border, #17324d)',
                fontWeight: 900,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: activeTab === 'classes' ? 'none' : '3px 3px 0px var(--theme-border, #17324d)'
              }}
            >
              <Users size={18} />
              <span>班級學生與競賽排行榜 ({activeClass?.students?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('assignments')}
              style={{
                padding: '10px 20px',
                borderRadius: '14px',
                border: '2px solid var(--theme-border, #17324d)',
                background: activeTab === 'assignments' ? 'var(--theme-border, #17324d)' : '#ffffff',
                color: activeTab === 'assignments' ? '#ffffff' : 'var(--theme-border, #17324d)',
                fontWeight: 900,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: activeTab === 'assignments' ? 'none' : '3px 3px 0px var(--theme-border, #17324d)'
              }}
            >
              <FileText size={18} />
              <span>作業派發與逐題診斷分析 ({classAssignments.length})</span>
            </button>
          </div>

          {/* TAB 1: 班級學生清單與班級排行榜 */}
          {activeTab === 'classes' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              
              {/* 左側：班級競賽排行榜 */}
              <div 
                style={{
                  background: '#ffffff',
                  border: '3px solid var(--theme-border, #17324d)',
                  borderRadius: '20px',
                  boxShadow: '6px 6px 0px var(--theme-border, #17324d)',
                  padding: '20px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Award size={22} color="#f59e0b" />
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--theme-border, #17324d)' }}>
                      班級競賽即時排行榜
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={handleManualResetLeaderboard}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #ef4444',
                      background: '#fef2f2',
                      color: '#b91c1c',
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <RefreshCw size={13} />
                    <span>手動立即歸零</span>
                  </button>
                </div>

                {classLeaderboard.length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600 }}>
                    尚無學生加入或尚未累積班級點數
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {classLeaderboard.map((student, idx) => {
                      const isTop3 = idx < 3;
                      const medals = ['🥇', '🥈', '🥉'];

                      return (
                        <div
                          key={student.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 14px',
                            borderRadius: '14px',
                            border: '1.5px solid var(--theme-border, #17324d)',
                            background: isTop3 ? '#fffdf0' : '#ffffff'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '1.1rem', fontWeight: 900, width: '24px', textAlign: 'center' }}>
                              {isTop3 ? medals[idx] : `#${idx + 1}`}
                            </span>
                            <div>
                              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--theme-border, #17324d)' }}>
                                {student.name}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                {student.email || '學生帳號'}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--theme-accent, #ef8354)' }}>
                                {student.classPoints || 0} <span style={{ fontSize: '0.75rem' }}>點</span>
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>班級積分</div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleInspectStudentMastery(student)}
                              title="調閱該生單元強弱掌握度"
                              style={{
                                padding: '6px 10px',
                                borderRadius: '8px',
                                border: '1.5px solid var(--theme-border, #17324d)',
                                background: '#f1f5f9',
                                color: 'var(--theme-border, #17324d)',
                                cursor: 'pointer',
                                fontWeight: 800,
                                fontSize: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <BarChart3 size={13} />
                              <span>學況</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 右側：學生名冊與單元掌握度檢視 */}
              <div 
                style={{
                  background: '#ffffff',
                  border: '3px solid var(--theme-border, #17324d)',
                  borderRadius: '20px',
                  boxShadow: '6px 6px 0px var(--theme-border, #17324d)',
                  padding: '20px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BarChart3 size={22} color="#4f46e5" />
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--theme-border, #17324d)' }}>
                      學生單元掌握度診斷
                    </h3>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>
                    點選左側或名單查看該生弱點
                  </span>
                </div>

                {selectedStudentForMastery && studentMasteryReport ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div 
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        background: '#f8fafc',
                        border: '1.5px solid #cbd5e1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--theme-border, #17324d)' }}>
                          學生：{selectedStudentForMastery.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          精熟單元：{studentMasteryReport.totalMasteredUnits} 個 ｜ 待加強單元：{studentMasteryReport.totalWeakUnits} 個
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (onOpenProgressModal) onOpenProgressModal(selectedStudentForMastery);
                        }}
                        className="btn btn-primary"
                        style={{ padding: '6px 14px', fontSize: '0.8rem', fontWeight: 800 }}
                      >
                        開啟完整雷達圖
                      </button>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>
                      該生待加強單元摘要：
                    </div>

                    {/* 列出各科弱項單元 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '380px', overflowY: 'auto' }}>
                      {Object.entries(studentMasteryReport.subjectMastery || {}).map(([subjKey, subjData]) => {
                        const weakList = [];
                        Object.values(subjData.grades || {}).forEach(units => {
                          (units || []).forEach(u => {
                            if (u.status === 'weak') weakList.push(u);
                          });
                        });

                        if (weakList.length === 0) return null;

                        return (
                          <div key={subjKey} style={{ border: '1px solid #fed7aa', borderRadius: '10px', padding: '10px', background: '#fffaf5' }}>
                            <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#c2410c', marginBottom: '6px' }}>
                              📌 {subjData.subjectInfo?.name} 待加強單元 ({weakList.length}個)
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {weakList.map(w => (
                                <div key={w.id} style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
                                  <span>{w.name}</span>
                                  <span style={{ color: '#dc2626', fontWeight: 800 }}>答對率 {w.accuracy}% ({w.unresolvedMistakes}錯題)</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
                    <BarChart3 size={40} style={{ margin: '0 auto 10px auto', opacity: 0.4 }} />
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>請點選學生旁的「學況」按鈕</div>
                    <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>即可即時調閱該生所有單元的答對率、錯題數與精熟度！</div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: 作業派發與逐題成效診斷分析 (Question-by-Question Matrix) */}
          {activeTab === 'assignments' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* 上方：作業切換列與繳交總體概況 */}
              <div 
                style={{
                  background: '#ffffff',
                  border: '3px solid var(--theme-border, #17324d)',
                  borderRadius: '20px',
                  boxShadow: '6px 6px 0px var(--theme-border, #17324d)',
                  padding: '20px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--theme-border, #17324d)' }}>
                    選擇檢視作業：
                  </label>
                  {classAssignments.length > 0 ? (
                    <select
                      value={selectedAssignmentId}
                      onChange={e => setSelectedAssignmentId(e.target.value)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '12px',
                        border: '2px solid var(--theme-border, #17324d)',
                        background: '#ffffff',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        color: 'var(--theme-border, #17324d)'
                      }}
                    >
                      {classAssignments.map(a => (
                        <option key={a.id} value={a.id}>
                          📝 {a.title} ({a.questions?.length || 0}題)
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>目前尚無派發作業</span>
                  )}
                </div>

                {diagnosticReport && (
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>
                      全班繳交進度：<strong style={{ color: '#16a34a', fontSize: '1rem' }}>{diagnosticReport.submittedCount}</strong> / {diagnosticReport.totalClassCount} 人
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>
                      全班平均分：<strong style={{ color: 'var(--theme-accent, #ef8354)', fontSize: '1rem' }}>{diagnosticReport.avgScore}</strong> 分
                    </div>
                  </div>
                )}
              </div>

              {/* 逐題診斷分析卡片 (核心亮點：每題誰錯了、錯的人各自選了什麼) */}
              {isLoadingReport ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontWeight: 800 }}>
                  診斷數據分析中...
                </div>
              ) : !diagnosticReport ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', fontWeight: 700 }}>
                  請先派發作業或選擇作業以檢閱成效診斷矩陣
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--theme-border, #17324d)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Flame size={22} color="var(--theme-accent, #ef8354)" />
                      逐題診斷矩陣 (包含選項分佈與學生選答細節)
                    </h3>
                    <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 700 }}>
                      點擊每題卡片可展開查看「錯選詳細名冊」
                    </span>
                  </div>

                  {diagnosticReport.questionDiagnostics.map((qDiag) => {
                    const isExpanded = expandedQuestionIdx === qDiag.index;
                    const optionLabels = ['A', 'B', 'C', 'D'];
                    const isLowAccuracy = qDiag.accuracy < 60;

                    return (
                      <div
                        key={qDiag.questionId}
                        style={{
                          background: '#ffffff',
                          border: `2px solid ${isLowAccuracy ? '#ef4444' : 'var(--theme-border, #17324d)'}`,
                          borderRadius: '18px',
                          boxShadow: `4px 4px 0px ${isLowAccuracy ? '#ef4444' : 'var(--theme-border, #17324d)'}`,
                          overflow: 'hidden'
                        }}
                      >
                        {/* 題目摘要列 (點擊可展開收合) */}
                        <div 
                          onClick={() => setExpandedQuestionIdx(isExpanded ? null : qDiag.index)}
                          style={{
                            padding: '16px 20px',
                            background: isLowAccuracy ? '#fff8f8' : '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '14px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                            <span 
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                background: isLowAccuracy ? '#fee2e2' : '#f1f5f9',
                                color: isLowAccuracy ? '#dc2626' : 'var(--theme-border, #17324d)',
                                border: '1.5px solid var(--theme-border, #17324d)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 900,
                                fontSize: '1rem',
                                flexShrink: 0
                              }}
                            >
                              第 {qDiag.index} 題
                            </span>

                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span 
                                  style={{
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 800,
                                    background: isLowAccuracy ? '#fee2e2' : '#dcfce7',
                                    color: isLowAccuracy ? '#b91c1c' : '#15803d'
                                  }}
                                >
                                  全班答對率：{qDiag.accuracy}% ({qDiag.correctCount}/{qDiag.answeredCount}人)
                                </span>
                                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                  觀念考點：{qDiag.conceptTag}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--theme-border, #17324d)', marginTop: '4px' }}>
                                <MathText text={qDiag.question.slice(0, 70) + (qDiag.question.length > 70 ? '...' : '')} />
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#4f46e5' }}>
                              正解: ({optionLabels[qDiag.correctAnswer]})
                            </span>
                            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                          </div>
                        </div>

                        {/* 展開之診斷細節 (選項分佈 + 誰選了哪個錯誤選項) */}
                        {isExpanded && (
                          <div style={{ padding: '20px', borderTop: '2px solid #f1f5f9', background: '#fafaf9', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            
                            {/* 完整題目與選項呈現 */}
                            <div style={{ background: '#ffffff', padding: '16px', borderRadius: '14px', border: '1.5px solid #e2e8f0' }}>
                              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--theme-border, #17324d)', marginBottom: '12px' }}>
                                <MathText text={qDiag.question} />
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
                                {(qDiag.options || []).map((opt, oIdx) => {
                                  const isCorrectOpt = oIdx === qDiag.correctAnswer;
                                  const chosenCount = qDiag.optionDistribution[oIdx] || 0;

                                  return (
                                    <div
                                      key={oIdx}
                                      style={{
                                        padding: '10px 12px',
                                        borderRadius: '10px',
                                        border: `1.5px solid ${isCorrectOpt ? '#22c55e' : '#cbd5e1'}`,
                                        background: isCorrectOpt ? '#f0fdf4' : '#ffffff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                      }}
                                    >
                                      <div style={{ fontSize: '0.88rem', fontWeight: isCorrectOpt ? 800 : 600, color: isCorrectOpt ? '#15803d' : 'var(--theme-border, #17324d)' }}>
                                        ({optionLabels[oIdx]}) <MathText text={opt} />
                                      </div>
                                      <span 
                                        style={{
                                          padding: '2px 8px',
                                          borderRadius: '6px',
                                          fontSize: '0.75rem',
                                          fontWeight: 800,
                                          background: chosenCount > 0 ? (isCorrectOpt ? '#dcfce7' : '#fee2e2') : '#f1f5f9',
                                          color: chosenCount > 0 ? (isCorrectOpt ? '#15803d' : '#b91c1c') : '#94a3b8'
                                        }}
                                      >
                                        {chosenCount} 人選
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* 🔥 答錯學生名單與其選擇的選項 (符合要求：後台看到每題有誰錯選了哪個答案) */}
                            <div 
                              style={{
                                background: '#fef2f2',
                                border: '2px solid #ef4444',
                                borderRadius: '14px',
                                padding: '16px'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <AlertTriangle size={18} />
                                  <span>答錯學生名單與選答分析 ({qDiag.wrongStudentDetails.length} 人)</span>
                                </div>
                              </div>

                              {qDiag.wrongStudentDetails.length === 0 ? (
                                <div style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 700 }}>
                                  🎉 太棒了！全班已繳交學生全員答對本題！
                                </div>
                              ) : (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                  {qDiag.wrongStudentDetails.map((ws, wIdx) => (
                                    <div
                                      key={wIdx}
                                      style={{
                                        background: '#ffffff',
                                        border: '1.5px solid #f87171',
                                        borderRadius: '8px',
                                        padding: '6px 12px',
                                        fontSize: '0.85rem',
                                        fontWeight: 800,
                                        color: '#7f1d1d',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                      }}
                                    >
                                      <span>👤 {ws.studentName}</span>
                                      <span style={{ color: '#dc2626', background: '#fee2e2', padding: '2px 6px', borderRadius: '4px', fontSize: '0.78rem' }}>
                                        錯選了 ({optionLabels[ws.userChoice]})
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* 完整教材解析 */}
                            <div style={{ background: '#f0f9ff', border: '1.5px solid #bae6fd', borderRadius: '12px', padding: '12px 16px' }}>
                              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0369a1', marginBottom: '4px' }}>
                                📖 詳解與教學指引：
                              </div>
                              <div style={{ fontSize: '0.88rem', color: '#0c4a6e', lineHeight: 1.6 }}>
                                <MathText text={qDiag.explanation || '詳見講義解析'} />
                              </div>
                            </div>

                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── MODAL 1: 建立新班級 ── */}
      {isCreateClassOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(23, 50, 77, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setIsCreateClassOpen(false)}
        >
          <div 
            style={{
              width: '100%', maxWidth: '480px',
              background: '#ffffff',
              border: '3px solid var(--theme-border, #17324d)',
              borderRadius: '24px',
              boxShadow: '10px 10px 0px var(--theme-border, #17324d)',
              padding: '24px'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ margin: '0 0 16px 0', fontSize: '1.25rem', fontWeight: 900, color: 'var(--theme-border, #17324d)' }}>
              🏫 建立全新班級
            </h2>

            <form onSubmit={handleCreateClass} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px' }}>班級名稱：</label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={e => setNewClassName(e.target.value)}
                  placeholder="例如：八年三班 數學衝刺班"
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '2px solid var(--theme-border, #17324d)', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px' }}>所屬學校：</label>
                <input
                  type="text"
                  value={newClassSchool}
                  onChange={e => setNewClassSchool(e.target.value)}
                  placeholder="例如：桃園市立大園國中"
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '2px solid var(--theme-border, #17324d)', fontWeight: 700 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px' }}>年級：</label>
                  <select
                    value={newClassGrade}
                    onChange={e => setNewClassGrade(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '2px solid var(--theme-border, #17324d)', fontWeight: 700 }}
                  >
                    <option value="g7">國一 (七年級)</option>
                    <option value="g8">國二 (八年級)</option>
                    <option value="g9">國三 (九年級)</option>
                    <option value="h1">高一 (必修)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px' }}>學科：</label>
                  <select
                    value={newClassSubject}
                    onChange={e => setNewClassSubject(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '2px solid var(--theme-border, #17324d)', fontWeight: 700 }}
                  >
                    <option value="math">數學科</option>
                    <option value="science">自然科</option>
                    <option value="english">英語科</option>
                    <option value="chinese">國文科</option>
                    <option value="social">社會科</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '12px', fontWeight: 900 }}>
                  確定建立班級
                </button>
                <button type="button" onClick={() => setIsCreateClassOpen(false)} className="btn" style={{ padding: '12px 18px' }}>
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: 派發班級作業 ── */}
      {isCreateAssignmentOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(23, 50, 77, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setIsCreateAssignmentOpen(false)}
        >
          <div 
            style={{
              width: '100%', maxWidth: '540px',
              background: '#ffffff',
              border: '3px solid var(--theme-border, #17324d)',
              borderRadius: '24px',
              boxShadow: '10px 10px 0px var(--theme-border, #17324d)',
              padding: '24px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ margin: '0 0 16px 0', fontSize: '1.25rem', fontWeight: 900, color: 'var(--theme-border, #17324d)' }}>
              📝 派發新作業至【{activeClass?.className}】
            </h2>

            <form onSubmit={handleCreateAssignment} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px' }}>作業標題：</label>
                <input
                  type="text"
                  value={asgTitle}
                  onChange={e => setAsgTitle(e.target.value)}
                  placeholder="例如：第一次段考必考題：乘法公式 10 題精準實戰"
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '2px solid var(--theme-border, #17324d)', fontWeight: 700 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px' }}>科目：</label>
                  <select
                    value={asgSubject}
                    onChange={e => setAsgSubject(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '2px solid var(--theme-border, #17324d)', fontWeight: 700 }}
                  >
                    <option value="math">數學</option>
                    <option value="science">自然</option>
                    <option value="english">英語</option>
                    <option value="chinese">國文</option>
                    <option value="social">社會</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px' }}>年級：</label>
                  <select
                    value={asgGrade}
                    onChange={e => setAsgGrade(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '2px solid var(--theme-border, #17324d)', fontWeight: 700 }}
                  >
                    <option value="g7">國一</option>
                    <option value="g8">國二</option>
                    <option value="g9">國三</option>
                    <option value="h1">高一</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px' }}>指定 108 課綱單元：</label>
                <select
                  value={asgUnit}
                  onChange={e => setAsgUnit(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '2px solid var(--theme-border, #17324d)', fontWeight: 700 }}
                >
                  {availableUnits.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px' }}>題目數量：</label>
                  <select
                    value={asgQuestionCount}
                    onChange={e => setAsgQuestionCount(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '2px solid var(--theme-border, #17324d)', fontWeight: 700 }}
                  >
                    <option value="5">5 題 (快速隨堂抽測)</option>
                    <option value="10">10 題 (標準單元段考卷)</option>
                    <option value="15">15 題 (深度觀念加強)</option>
                    <option value="20">20 題 (全單元實戰模擬)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px' }}>難易度：</label>
                  <select
                    value={asgDifficulty}
                    onChange={e => setAsgDifficulty(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '2px solid var(--theme-border, #17324d)', fontWeight: 700 }}
                  >
                    <option value="easy">基礎 (核心定義素養題)</option>
                    <option value="medium">中等 (學校段考精選題)</option>
                    <option value="hard">挑戰 (歷屆會考跨單元難題)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px' }}>繳交期限：</label>
                <select
                  value={asgDeadlineDays}
                  onChange={e => setAsgDeadlineDays(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '2px solid var(--theme-border, #17324d)', fontWeight: 700 }}
                >
                  <option value="3">3 天後 (課堂當週抽測)</option>
                  <option value="7">7 天後 (一週常規作業)</option>
                  <option value="14">14 天後 (雙週段考複習卷)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '12px', fontWeight: 900 }}>
                  🚀 立即生成並派發至班級
                </button>
                <button type="button" onClick={() => setIsCreateAssignmentOpen(false)} className="btn" style={{ padding: '12px 18px' }}>
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: 班級排行榜規則與自訂重置設定 ── */}
      {isResetSettingsOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(23, 50, 77, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setIsResetSettingsOpen(false)}
        >
          <div 
            style={{
              width: '100%', maxWidth: '500px',
              background: '#ffffff',
              border: '3px solid var(--theme-border, #17324d)',
              borderRadius: '24px',
              boxShadow: '10px 10px 0px var(--theme-border, #17324d)',
              padding: '24px'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ margin: '0 0 16px 0', fontSize: '1.25rem', fontWeight: 900, color: 'var(--theme-border, #17324d)' }}>
              ⚙️ 班級積分競賽與排行榜設定
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* 排行榜開關 */}
              <div style={{ padding: '14px', borderRadius: '12px', background: '#f8fafc', border: '1.5px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--theme-border, #17324d)' }}>啟用班級內部競賽排行榜</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>關閉後，學生在班級內將只顯示全服週排行榜</div>
                </div>
                <input
                  type="checkbox"
                  checked={isLeaderboardEnabled}
                  onChange={e => setIsLeaderboardEnabled(e.target.checked)}
                  style={{ width: '22px', height: '22px', cursor: 'pointer' }}
                />
              </div>

              {/* 重置週期選擇 */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px' }}>
                  重置模式 (Reset Mode)：
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { id: 'interval', label: '週期定時重置' },
                    { id: 'specific_date', label: '指定年月日重置' },
                    { id: 'manual', label: '僅手動歸零' }
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setResetMode(m.id)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '10px',
                        border: `2px solid ${resetMode === m.id ? '#4f46e5' : '#cbd5e1'}`,
                        background: resetMode === m.id ? '#eef2ff' : '#ffffff',
                        color: resetMode === m.id ? '#4f46e5' : '#64748b',
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {resetMode === 'interval' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px' }}>定時間隔：</label>
                  <select
                    value={intervalType}
                    onChange={e => setIntervalType(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '2px solid var(--theme-border, #17324d)', fontWeight: 700 }}
                  >
                    <option value="weekly">每週一 00:00 自動歸零 (同步大考週榜)</option>
                    <option value="biweekly">每雙週一 00:00 自動歸零</option>
                    <option value="monthly">每月 1 號 00:00 自動歸零</option>
                  </select>
                </div>
              )}

              {resetMode === 'specific_date' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px' }}>指定重置時間 (幾月幾號幾點)：</label>
                  <input
                    type="datetime-local"
                    value={specificResetDate}
                    onChange={e => setSpecificResetDate(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '2px solid var(--theme-border, #17324d)', fontWeight: 700 }}
                  />
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    例如設定段考結束當天 (2026-10-15 17:00)，時間一到班級點數自動結算歸零！
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={handleSaveLeaderboardSettings}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '12px', fontWeight: 900 }}
                >
                  儲存並套用規則
                </button>
                <button
                  type="button"
                  onClick={() => setIsResetSettingsOpen(false)}
                  className="btn"
                  style={{ padding: '12px 18px' }}
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
