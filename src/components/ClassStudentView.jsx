import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Plus, 
  FileText, 
  Award, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  LogOut, 
  Sparkles,
  BookOpen,
  Send,
  Trophy,
  Flame,
  ChevronRight
} from 'lucide-react';
import { 
  getClassesByStudent, 
  joinClassByCode, 
  leaveClass,
  getClassLeaderboard, 
  getAssignmentsByClass,
  getStudentSubmission
} from '../services/classService';

export default function ClassStudentView({ currentUser, onStartAssignmentQuiz, onGoGlobalLeaderboard, onOpenProgressModal }) {
  const [studentClasses, setStudentClasses] = useState([]);
  const [activeClassId, setActiveClassId] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinMsg, setJoinMsg] = useState('');

  const refreshStudentClasses = () => {
    if (!currentUser || !currentUser.id) return;
    const list = getClassesByStudent(currentUser.id, currentUser.email || '');
    setStudentClasses(list);
    if (list.length > 0 && (!activeClassId || !list.some(c => c.id === activeClassId))) {
      setActiveClassId(list[0].id);
    }
  };

  useEffect(() => {
    refreshStudentClasses();
  }, [currentUser]);

  const activeClass = useMemo(() => {
    return studentClasses.find(c => c.id === activeClassId) || null;
  }, [studentClasses, activeClassId]);

  // 班級作業清單
  const classAssignments = useMemo(() => {
    if (!activeClass) return [];
    return getAssignmentsByClass(activeClass.id);
  }, [activeClass]);

  // 分離為「待完成」與「已完成」作業
  const { pendingAssignments, completedAssignments } = useMemo(() => {
    if (!activeClass || !currentUser) return { pendingAssignments: [], completedAssignments: [] };
    const pending = [];
    const completed = [];

    classAssignments.forEach(asg => {
      const sub = getStudentSubmission(asg.id, currentUser.id);
      if (sub) {
        completed.push({ ...asg, submission: sub });
      } else {
        pending.push(asg);
      }
    });

    return { pendingAssignments: pending, completedAssignments: completed };
  }, [classAssignments, activeClass, currentUser]);

  // 班級排行榜
  const classLeaderboard = useMemo(() => {
    if (!activeClass) return [];
    return getClassLeaderboard(activeClass.id);
  }, [activeClass]);

  // 當前學生在班級的排名
  const myRankInfo = useMemo(() => {
    if (!activeClass || !currentUser) return null;
    const cleanEmail = (currentUser.email || '').trim().toLowerCase();
    const idx = classLeaderboard.findIndex(s => 
      s.id === currentUser.id || 
      (cleanEmail && s.email && s.email.trim().toLowerCase() === cleanEmail)
    );
    if (idx === -1) return null;
    return {
      rank: idx + 1,
      points: classLeaderboard[idx]?.classPoints || 0
    };
  }, [classLeaderboard, activeClass, currentUser]);

  // 加入班級代碼提交
  const handleJoinClass = async (e) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;

    setIsJoining(true);
    setJoinMsg('');
    try {
      const res = await joinClassByCode(joinCodeInput.trim(), currentUser);
      setJoinMsg(res.message);
      setJoinCodeInput('');
      refreshStudentClasses();
      setActiveClassId(res.classItem.id);
    } catch (err) {
      setJoinMsg(`❌ ${err.message || '加入失敗'}`);
    } finally {
      setIsJoining(false);
    }
  };

  // 退出班級
  const handleLeaveClass = async (classId, className) => {
    const confirmed = window.confirm(`確定要退出【${className}】嗎？退出後將無法接收該班作業與參與班級競賽。`);
    if (!confirmed) return;

    try {
      await leaveClass(classId, currentUser.id);
      refreshStudentClasses();
    } catch (err) {
      alert('退出失敗: ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '16px 12px 60px 12px' }}>
      
      {/* 頂部加入班級卡片 */}
      <div 
        style={{
          background: 'var(--theme-card, #fffdf9)',
          border: '3px solid var(--theme-border, #17324d)',
          borderRadius: '24px',
          boxShadow: '6px 6px 0px var(--theme-border, #17324d)',
          padding: '24px',
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px'
        }}
      >
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div 
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#4f46e5',
                border: '2px solid var(--theme-border, #17324d)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '3px 3px 0px var(--theme-border, #17324d)'
              }}
            >
              <Users size={24} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: 'var(--theme-border, #17324d)' }}>
                我的班級與學校作業
              </h1>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                輸入老師給予的 6 碼班級代碼即可加入，接收段考任務與參與班級競賽！
              </p>
            </div>
          </div>
        </div>

        {/* 6 碼加入表單 */}
        <form onSubmit={handleJoinClass} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="text"
            value={joinCodeInput}
            onChange={e => setJoinCodeInput(e.target.value.toUpperCase())}
            maxLength={6}
            placeholder="輸入6碼班級代碼"
            style={{
              padding: '12px 16px',
              borderRadius: '14px',
              border: '2.5px solid var(--theme-border, #17324d)',
              fontWeight: 900,
              fontSize: '1.1rem',
              letterSpacing: '2px',
              fontFamily: 'var(--font-mono)',
              width: '180px',
              textAlign: 'center',
              textTransform: 'uppercase',
              background: '#ffffff',
              boxShadow: '3px 3px 0px var(--theme-border, #17324d)'
            }}
          />
          <button
            type="submit"
            disabled={isJoining || joinCodeInput.length < 4}
            className="btn btn-primary"
            style={{
              padding: '12px 20px',
              fontWeight: 900,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Plus size={18} />
            <span>{isJoining ? '加入中...' : '加入班級'}</span>
          </button>
        </form>

        {joinMsg && (
          <div style={{ width: '100%', fontSize: '0.88rem', fontWeight: 800, color: joinMsg.startsWith('❌') ? '#dc2626' : '#16a34a' }}>
            {joinMsg}
          </div>
        )}
      </div>

      {studentClasses.length === 0 ? (
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
          <BookOpen size={60} color="#94a3b8" style={{ margin: '0 auto 16px auto' }} />
          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--theme-border, #17324d)' }}>
            您尚未加入任何班級
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.92rem', maxWidth: '440px', margin: '8px auto 20px auto', lineHeight: 1.6, fontWeight: 600 }}>
            請向學校導師或授課老師索取「6 碼班級代碼」（例如 MATH8A），在上方輸入即可立即加入專屬班級！
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button
              onClick={() => onOpenProgressModal && onOpenProgressModal()}
              className="btn btn-primary"
              style={{ padding: '10px 22px', fontWeight: 800 }}
            >
              📊 查看我的個人課綱強弱掌握表
            </button>
            <button
              onClick={() => onGoGlobalLeaderboard && onGoGlobalLeaderboard()}
              className="btn btn-gold"
              style={{ padding: '10px 22px', fontWeight: 800 }}
            >
              🏆 查看全服總排行榜
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* 班級選擇標籤 (若加入多個班級) */}
          {studentClasses.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '16px' }}>
              {studentClasses.map(c => (
                <button
                  key={c.id}
                  onClick={() => setActiveClassId(c.id)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '14px',
                    border: '2px solid var(--theme-border, #17324d)',
                    background: activeClassId === c.id ? 'var(--theme-border, #17324d)' : '#ffffff',
                    color: activeClassId === c.id ? '#ffffff' : 'var(--theme-border, #17324d)',
                    fontWeight: 900,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    boxShadow: activeClassId === c.id ? 'none' : '3px 3px 0px var(--theme-border, #17324d)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  🏫 {c.className}
                </button>
              ))}
            </div>
          )}

          {activeClass && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* 班級資訊與導師公告卡片 */}
              <div 
                style={{
                  background: 'linear-gradient(135deg, #ffffff, #fdfbf7)',
                  border: '3px solid var(--theme-border, #17324d)',
                  borderRadius: '20px',
                  boxShadow: '6px 6px 0px var(--theme-border, #17324d)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: 'var(--theme-border, #17324d)' }}>
                        {activeClass.className}
                      </h2>
                      <span className="badge badge-emerald" style={{ fontWeight: 800 }}>
                        {activeClass.school}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>
                      指導老師：{activeClass.teacherName} ｜ 同學人數：{activeClass.students?.length || 0} 人
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleLeaveClass(activeClass.id, activeClass.className)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#64748b',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <LogOut size={13} />
                    <span>退出班級</span>
                  </button>
                </div>

                {/* 導師公告 */}
                {activeClass.announcements && activeClass.announcements.length > 0 && (
                  <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '14px', padding: '14px 16px' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#b45309', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      📢 導師最新公告：{activeClass.announcements[0].title}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#78350f', lineHeight: 1.5 }}>
                      {activeClass.announcements[0].content}
                    </div>
                  </div>
                )}
              </div>

              {/* 雙欄主佈局：左側待繳與完成作業 / 右側班級專屬排行榜 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                
                {/* ── 左欄：班級派發作業區 ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* 待完成作業 */}
                  <div 
                    style={{
                      background: '#ffffff',
                      border: '3px solid var(--theme-border, #17324d)',
                      borderRadius: '20px',
                      boxShadow: '6px 6px 0px var(--theme-border, #17324d)',
                      padding: '20px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={20} color="#ea580c" />
                        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--theme-border, #17324d)' }}>
                          待完成作業 ({pendingAssignments.length})
                        </h3>
                      </div>
                    </div>

                    {pendingAssignments.length === 0 ? (
                      <div style={{ padding: '30px 16px', textAlign: 'center', color: '#16a34a', background: '#f0fdf4', borderRadius: '14px', border: '1.5px dashed #86efac' }}>
                        <CheckCircle2 size={36} color="#16a34a" style={{ margin: '0 auto 8px auto' }} />
                        <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>太棒了！所有作業均已完成！</div>
                        <div style={{ fontSize: '0.8rem', color: '#166534', marginTop: '4px' }}>隨時留意老師發布的新段考任務喔</div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {pendingAssignments.map(asg => {
                          const deadlineDate = asg.deadline ? new Date(asg.deadline).toLocaleDateString() : '無期限';

                          return (
                            <div
                              key={asg.id}
                              style={{
                                border: '2px solid var(--theme-border, #17324d)',
                                borderRadius: '16px',
                                padding: '16px',
                                background: '#fffaf5',
                                boxShadow: '3px 3px 0px var(--theme-border, #17324d)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                                <div>
                                  <span 
                                    style={{
                                      padding: '2px 8px',
                                      borderRadius: '6px',
                                      fontSize: '0.75rem',
                                      fontWeight: 800,
                                      background: '#fee2e2',
                                      color: '#b91c1c'
                                    }}
                                  >
                                    截止：{deadlineDate}
                                  </span>
                                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--theme-border, #17324d)', marginTop: '4px' }}>
                                    {asg.title}
                                  </div>
                                </div>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>
                                  共 {asg.questions?.length || 0} 題
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => onStartAssignmentQuiz && onStartAssignmentQuiz(asg)}
                                className="btn btn-primary"
                                style={{
                                  padding: '10px',
                                  fontWeight: 900,
                                  fontSize: '0.92rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '8px',
                                  background: 'var(--theme-accent, #ef8354)'
                                }}
                              >
                                <span>開始做作業</span>
                                <ArrowRight size={16} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 已完成作業歷史 */}
                  {completedAssignments.length > 0 && (
                    <div 
                      style={{
                        background: '#ffffff',
                        border: '3px solid var(--theme-border, #17324d)',
                        borderRadius: '20px',
                        boxShadow: '6px 6px 0px var(--theme-border, #17324d)',
                        padding: '20px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                        <CheckCircle2 size={20} color="#16a34a" />
                        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--theme-border, #17324d)' }}>
                          已繳交作業歷程 ({completedAssignments.length})
                        </h3>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {completedAssignments.map(asg => (
                          <div
                            key={asg.id}
                            style={{
                              padding: '12px 14px',
                              borderRadius: '12px',
                              border: '1.5px solid #cbd5e1',
                              background: '#f8fafc',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--theme-border, #17324d)' }}>
                                {asg.title}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                繳交時間：{new Date(asg.submission.submittedAt).toLocaleDateString()}
                              </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#16a34a' }}>
                                {asg.submission.score} <span style={{ fontSize: '0.75rem' }}>分</span>
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                對 {asg.submission.correctCount}/{asg.submission.totalQuestions} 題
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* ── 右欄：班級專屬排行榜 ── */}
                <div 
                  style={{
                    background: '#ffffff',
                    border: '3px solid var(--theme-border, #17324d)',
                    borderRadius: '20px',
                    boxShadow: '6px 6px 0px var(--theme-border, #17324d)',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Award size={22} color="#f59e0b" />
                      <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--theme-border, #17324d)' }}>
                        班級專屬競賽排行榜
                      </h3>
                    </div>

                    {myRankInfo && (
                      <span 
                        style={{
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          background: '#fef3c7',
                          color: '#92400e',
                          border: '1px solid #fde68a'
                        }}
                      >
                        我的排名：第 {myRankInfo.rank} 名 ({myRankInfo.points}點)
                      </span>
                    )}
                  </div>

                  {/* 若導師關閉了班級排行榜 (符合要求：關閉後只看得到所有人的週排行) */}
                  {activeClass.leaderboardSettings?.isEnabled === false ? (
                    <div 
                      style={{
                        padding: '32px 20px',
                        textAlign: 'center',
                        background: '#f8fafc',
                        border: '2px dashed #cbd5e1',
                        borderRadius: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <Trophy size={44} color="#94a3b8" />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--theme-border, #17324d)' }}>
                          導師已暫時關閉本班內部競賽
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px', maxWidth: '300px' }}>
                          請各位同學專注平時練習，您的答題點數仍會持續同步上傳至全服週排行榜喔！
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onGoGlobalLeaderboard && onGoGlobalLeaderboard()}
                        className="btn btn-gold"
                        style={{
                          padding: '10px 20px',
                          fontWeight: 900,
                          fontSize: '0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Trophy size={16} />
                        <span>前往查看全服週排行榜</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* 重置規則提示 */}
                      <div style={{ fontSize: '0.8rem', color: '#64748b', background: '#f8fafc', padding: '8px 12px', borderRadius: '10px' }}>
                        ⏳ 結算週期：
                        {activeClass.leaderboardSettings?.resetMode === 'specific_date'
                          ? `將於 ${activeClass.leaderboardSettings?.specificResetDate?.slice(0, 16)} 結算歸零`
                          : '每週一 00:00 自動歸零重新競賽'}
                      </div>

                      {/* 班級榜單列表 */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '440px', overflowY: 'auto' }}>
                        {classLeaderboard.map((student, idx) => {
                          const isMe = student.id === currentUser?.id;
                          const medals = ['🥇', '🥈', '🥉'];
                          const isTop3 = idx < 3;

                          return (
                            <div
                              key={student.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px 14px',
                                borderRadius: '12px',
                                border: `1.5px solid ${isMe ? 'var(--theme-accent, #ef8354)' : '#cbd5e1'}`,
                                background: isMe ? '#fffaf5' : isTop3 ? '#fffdf0' : '#ffffff'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '1.1rem', fontWeight: 900, width: '24px', textAlign: 'center' }}>
                                  {isTop3 ? medals[idx] : `#${idx + 1}`}
                                </span>
                                <div>
                                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--theme-border, #17324d)' }}>
                                    {student.name} {isMe && <span style={{ color: 'var(--theme-accent, #ef8354)', fontSize: '0.78rem' }}>(您)</span>}
                                  </div>
                                </div>
                              </div>

                              <div style={{ fontWeight: 900, fontSize: '1.05rem', color: isMe ? 'var(--theme-accent, #ef8354)' : 'var(--theme-border, #17324d)' }}>
                                {student.classPoints || 0} <span style={{ fontSize: '0.75rem' }}>點</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* 前往全服排行榜連結 */}
                      <button
                        type="button"
                        onClick={() => onGoGlobalLeaderboard && onGoGlobalLeaderboard()}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#4f46e5',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          paddingTop: '8px'
                        }}
                      >
                        <span>同步查看全服國中生大排名</span>
                        <ChevronRight size={15} />
                      </button>
                    </>
                  )}
                </div>

              </div>

            </div>
          )}
        </>
      )}

    </div>
  );
}
