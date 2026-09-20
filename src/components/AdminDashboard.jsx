import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { 
  getQuestionReports, 
  resolveQuestionReport, 
  modifyQuestion, 
  getQuestionOverrides,
  updateGlobalSettings,
  getUserPracticeHistory,
  fetchCloudUserPracticeHistory,
  fetchCloudUserMistakeNotebook,
  fetchAllCloudPracticeLogs,
  fetchCloudUserAllMistakesAndLogs,
  fetchAllCloudQuizPapers,
  getRecentPracticeStream,
  getRegisteredStudents,
  getRedemptionCodes,
  addRedemptionCode,
  deleteRedemptionCode,
  getAdminNotifications,
  deleteAdminNotification,
  subscribeToCloudSync,
  SUPER_ADMIN_EMAIL,
  getAdminsList,
  checkIsAdmin
} from '../services/cloudStorage';
import { 
  adminGrantPoints, 
  adminGrantTickets, 
  getLeaderboard,
  fetchCloudLeaderboard 
} from '../services/leaderboardService';
import { generateQuestion } from '../data/questionGenerator';
import MathText from './MathText';
import { 
  Shield, 
  Gift, 
  Megaphone, 
  Flame, 
  Users, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Search, 
  BookOpen, 
  Ticket, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw, 
  Bell, 
  X,
  RefreshCw,
  Zap,
  Clock,
  FileText
} from 'lucide-react';

export default function AdminDashboard() {
  const { currentUser } = useAuth();
  const { globalSettings } = useGame();

  const isAuthorized = checkIsAdmin(currentUser);



  const [activeSubTab, setActiveSubTab] = useState('reports'); // 'reports' | 'rewards' | 'codes' | 'broadcast' | 'students' | 'questions'
  const [reports, setReports] = useState(getQuestionReports());
  const [players, setPlayers] = useState(getLeaderboard());
  const [allHistory, setAllHistory] = useState(getUserPracticeHistory());
  const [quizPapers, setQuizPapers] = useState([]);
  const [inspectionViewMode, setInspectionViewMode] = useState('papers'); // 'papers' | 'logs'
  const [expandedPaperIds, setExpandedPaperIds] = useState({});
  const [registeredStudents, setRegisteredStudents] = useState(getRegisteredStudents());
  const [recentStream, setRecentStream] = useState(getRecentPracticeStream());
  const [isLoadingStudentHistory, setIsLoadingStudentHistory] = useState(false);
  const [isRefreshingCloud, setIsRefreshingCloud] = useState(false);
  const [redemptionCodes, setRedemptionCodes] = useState(getRedemptionCodes());
  const [adminNotifications, setAdminNotifications] = useState(getAdminNotifications());

  // 學生歷程調閱與搜尋狀態
  const [selectedStudent, setSelectedStudent] = useState('ALL');
  const [selectedStudentId, setSelectedStudentId] = useState('ALL');
  const [studentSearchKeyword, setStudentSearchKeyword] = useState('');
  const [questionSearchKeyword, setQuestionSearchKeyword] = useState('');
  const [onlyMistakes, setOnlyMistakes] = useState(false);
  const [expandedLogIds, setExpandedLogIds] = useState({});

  // 兌換碼管理狀態
  const [newCodeName, setNewCodeName] = useState('');
  const [newCodeType, setNewCodeType] = useState('points');
  const [newCodeReward, setNewCodeReward] = useState(60);
  const [newCodeLabel, setNewCodeLabel] = useState('');
  const [newCodeExpires, setNewCodeExpires] = useState('2028-12-31');
  const [codeActionMsg, setCodeActionMsg] = useState('');

  // 獎勵發放狀態
  const [targetPlayerId, setTargetPlayerId] = useState('ALL');
  const [pointsToGrant, setPointsToGrant] = useState(50);
  const [ticketsToGrant, setTicketsToGrant] = useState(2);
  const [grantSuccessMsg, setGrantSuccessMsg] = useState('');

  // 廣播發送狀態
  const [broadcastInput, setBroadcastInput] = useState('');
  const [broadcastSuccessMsg, setBroadcastSuccessMsg] = useState('');

  // 題庫管理狀態
  const [searchQId, setSearchQId] = useState('Q-G7-MA-U1-0001');
  const [inspectedQuestion, setInspectedQuestion] = useState(null);
  const [editAnsIdx, setEditAnsIdx] = useState(0);
  const [editExpText, setEditExpText] = useState('');
  const [qActionMsg, setQActionMsg] = useState('');

  useEffect(() => {
    const refreshAll = () => {
      setReports(getQuestionReports());
      setPlayers(getLeaderboard());
      setAllHistory(getUserPracticeHistory());
      setRegisteredStudents(getRegisteredStudents());
      setRecentStream(getRecentPracticeStream());
      setRedemptionCodes(getRedemptionCodes());
      setAdminNotifications(getAdminNotifications());
    };
    refreshAll();

    // 初次載入主動調閱 Firebase 雲端最新排行榜、全體學生做題錯題歷史與所有完整試卷
    fetchCloudLeaderboard().then(latest => {
      if (latest) setPlayers(latest);
    });
    fetchAllCloudPracticeLogs().then(logs => {
      if (logs && logs.length > 0) setAllHistory(logs);
    });
    fetchAllCloudQuizPapers().then(papers => {
      if (papers && papers.length > 0) setQuizPapers(papers);
    });

    const unsub = subscribeToCloudSync((ev) => {
      refreshAll();
      if (!ev?.key || ev.key === 'quiz_papers' || ev.key === 'user_quiz_papers') {
        fetchAllCloudQuizPapers().then(papers => {
          if (papers && papers.length > 0) setQuizPapers(papers);
        });
      }
    });
    return () => unsub();
  }, []);

  // 手動強制自 Firebase 雲端重新整理名冊、即時做題串流、全服錯題紀錄與所有試卷
  const handleForceCloudRefresh = async () => {
    setIsRefreshingCloud(true);
    try {
      setRegisteredStudents(getRegisteredStudents());
      setRecentStream(getRecentPracticeStream());
      const [latestBoard, cloudLogs, papers] = await Promise.all([
        fetchCloudLeaderboard(),
        fetchAllCloudPracticeLogs(),
        fetchAllCloudQuizPapers()
      ]);
      if (latestBoard) setPlayers(latestBoard);
      if (cloudLogs && cloudLogs.length > 0) setAllHistory(cloudLogs);
      if (papers && papers.length > 0) setQuizPapers(papers);
    } catch (e) {
      console.warn('Cloud refresh exception', e);
    } finally {
      setTimeout(() => setIsRefreshingCloud(false), 500);
    }
  };

  // 點擊學生名字按鈕：從 Firebase 雲端即時調閱該學生的所有做題與錯題紀錄
  const handleSelectStudentForInspection = async (student) => {
    const sId = student.id || student.userId;
    const sName = student.name || student.userName;
    
    if (selectedStudent === sName && onlyMistakes) {
      setOnlyMistakes(false);
      return;
    }

    setSelectedStudent(sName);
    setSelectedStudentId(sId || 'ALL');
    setOnlyMistakes(true); // 預設聚焦顯示該生錯題
    
    // 向 Firebase 雲端發起精確調閱該生所有做題與錯題本
    if (sId) {
      setIsLoadingStudentHistory(true);
      try {
        const studentLogs = await fetchCloudUserAllMistakesAndLogs(sId, sName, student.school);
        if (studentLogs && studentLogs.length > 0) {
          setAllHistory(prev => {
            const others = prev.filter(p => p.userId !== sId && p.userName !== sName);
            return [...studentLogs, ...others];
          });
        }
      } catch (err) {
        console.warn('Error fetching cloud logs for student', err);
      } finally {
        setIsLoadingStudentHistory(false);
      }
    }
  };

  // 刪除系統公告與通知
  const handleDeleteNotification = (notifId) => {
    if (!window.confirm('確定要刪除這則系統公告嗎？刪除後學生端通知中心將即時同步移除。')) return;
    deleteAdminNotification(notifId, currentUser);
    setAdminNotifications(getAdminNotifications());
  };

  // 統計所有學生的對錯題類型分析 (支援千萬人併發與全服註冊名冊聚合)
  const studentAnalytics = React.useMemo(() => {
    const studentMap = {};
    const conceptMap = {};

    // 1. 先用 registeredStudents 初始化名冊，保證即便本地尚未載入題目細節的學生也會顯示在名冊中
    registeredStudents.forEach(st => {
      const sName = st.name || '匿名同學';
      studentMap[sName] = {
        name: sName,
        school: st.school || '會考戰友',
        total: st.totalQuestions || 0,
        correct: st.totalCorrect || 0,
        wrong: Math.max(0, (st.totalQuestions || 0) - (st.totalCorrect || 0)),
        userId: st.id,
        email: st.email || '',
        lastActive: st.lastActive || '',
        accuracy: st.accuracy !== undefined ? st.accuracy : 0
      };
    });

    // 2. 用已載入的 allHistory 補充精確細節
    allHistory.forEach(log => {
      const sName = log.userName || '匿名同學';
      if (!studentMap[sName]) {
        studentMap[sName] = {
          name: sName,
          school: log.userSchool || '會考戰友',
          total: 0,
          correct: 0,
          wrong: 0,
          userId: log.userId,
          email: '',
          lastActive: log.timestamp || '',
          accuracy: 0
        };
      }
      studentMap[sName].total = Math.max(studentMap[sName].total, (studentMap[sName].total || 0) + 1);
      if (log.isCorrect) {
        studentMap[sName].correct += 1;
      } else {
        studentMap[sName].wrong += 1;
      }
      if (studentMap[sName].total > 0) {
        studentMap[sName].accuracy = Math.round((studentMap[sName].correct / studentMap[sName].total) * 100);
      }

      const tag = log.conceptTag || log.unitName || '基礎核心綜合';
      if (!conceptMap[tag]) {
        conceptMap[tag] = {
          tag,
          unitName: log.unitName || '',
          total: 0,
          correct: 0,
          wrong: 0
        };
      }
      conceptMap[tag].total += 1;
      if (log.isCorrect) {
        conceptMap[tag].correct += 1;
      } else {
        conceptMap[tag].wrong += 1;
      }
    });

    const studentsList = Object.values(studentMap);

    // 高頻錯題類型 TOP 5 (錯誤次數與錯誤率最高)
    const topMistakeTypes = Object.values(conceptMap)
      .filter(c => c.wrong > 0)
      .map(c => ({
        ...c,
        errorRate: Math.round((c.wrong / c.total) * 100)
      }))
      .sort((a, b) => b.wrong - a.wrong || b.errorRate - a.errorRate)
      .slice(0, 5);

    // 精熟高正答題型 TOP 5 (答對次數與正答率最高)
    const topMasteryTypes = Object.values(conceptMap)
      .filter(c => c.correct > 0)
      .map(c => ({
        ...c,
        accuracy: Math.round((c.correct / c.total) * 100)
      }))
      .sort((a, b) => b.correct - a.correct || b.accuracy - a.accuracy)
      .slice(0, 5);

    const totalCount = studentsList.reduce((acc, cur) => acc + (cur.total || 0), 0) || allHistory.length;
    const totalCorrect = studentsList.reduce((acc, cur) => acc + (cur.correct || 0), 0) || allHistory.filter(h => h.isCorrect).length;
    const totalWrong = studentsList.reduce((acc, cur) => acc + (cur.wrong || 0), 0) || allHistory.filter(h => !h.isCorrect).length;

    return {
      studentsList,
      topMistakeTypes,
      topMasteryTypes,
      totalCount,
      totalCorrect,
      totalWrong
    };
  }, [allHistory, registeredStudents]);

  // 篩選做題紀錄列表
  const filteredPracticeLogs = React.useMemo(() => {
    return allHistory.filter(log => {
      // 學生姓名與 ID 快篩按鈕 (支援姓名與 userId 雙向精準匹配，杜絕任何過濾遺漏)
      if (selectedStudent !== 'ALL') {
        const sName = log.userName || '匿名同學';
        const matchName = sName === selectedStudent || sName.toLowerCase() === selectedStudent.toLowerCase();
        const matchId = log.userId && (log.userId === selectedStudent || (selectedStudentId !== 'ALL' && log.userId === selectedStudentId));
        if (!matchName && !matchId) {
          return false;
        }
      }
      // 學生名稱搜尋框
      if (studentSearchKeyword.trim()) {
        const kw = studentSearchKeyword.trim().toLowerCase();
        const sName = (log.userName || '').toLowerCase();
        const sSchool = (log.userSchool || '').toLowerCase();
        if (!sName.includes(kw) && !sSchool.includes(kw)) {
          return false;
        }
      }
      // 僅顯示錯題
      if (onlyMistakes && log.isCorrect) {
        return false;
      }
      // 查詢特定題號代碼、單元或關鍵字
      if (questionSearchKeyword.trim()) {
        const qkw = questionSearchKeyword.trim().toLowerCase();
        const qId = (log.questionId || '').toLowerCase();
        const unit = (log.unitName || '').toLowerCase();
        const tag = (log.conceptTag || '').toLowerCase();
        const qText = (log.question || '').toLowerCase();
        if (!qId.includes(qkw) && !unit.includes(qkw) && !tag.includes(qkw) && !qText.includes(qkw)) {
          return false;
        }
      }
      return true;
    });
  }, [allHistory, selectedStudent, selectedStudentId, studentSearchKeyword, onlyMistakes, questionSearchKeyword]);

  // 篩選完整試卷列表 (支援學生姓名、學校、題目關鍵字與科目快篩)
  const filteredQuizPapers = React.useMemo(() => {
    return quizPapers.filter(paper => {
      if (selectedStudent !== 'ALL') {
        const sName = paper.userName || '匿名同學';
        const matchName = sName === selectedStudent || sName.toLowerCase() === selectedStudent.toLowerCase();
        const matchId = paper.userId && (paper.userId === selectedStudent || (selectedStudentId !== 'ALL' && paper.userId === selectedStudentId));
        if (!matchName && !matchId) {
          return false;
        }
      }
      if (studentSearchKeyword.trim()) {
        const kw = studentSearchKeyword.trim().toLowerCase();
        const sName = (paper.userName || '').toLowerCase();
        const sSchool = (paper.userSchool || '').toLowerCase();
        if (!sName.includes(kw) && !sSchool.includes(kw)) {
          return false;
        }
      }
      if (questionSearchKeyword.trim()) {
        const kw = questionSearchKeyword.trim().toLowerCase();
        const title = (paper.paperTitle || '').toLowerCase();
        const unit = (paper.unitName || '').toLowerCase();
        const hasMatchingQ = paper.questions?.some(q => 
          (q.questionId || '').toLowerCase().includes(kw) ||
          (q.conceptTag || '').toLowerCase().includes(kw) ||
          (q.question || '').toLowerCase().includes(kw)
        );
        if (!title.includes(kw) && !unit.includes(kw) && !hasMatchingQ) {
          return false;
        }
      }
      return true;
    });
  }, [quizPapers, selectedStudent, selectedStudentId, studentSearchKeyword, questionSearchKeyword]);

  if (!isAuthorized) {
    return (
      <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', maxWidth: '560px', margin: '40px auto' }}>
        <Shield size={60} color="#ef4444" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444', marginBottom: '8px' }}>
          403 權限不足：禁止存取管理員控制台
        </h2>
        <p style={{ color: '#78818a', fontSize: '0.92rem', lineHeight: 1.6 }}>
          此區域受嚴格安全防護，僅限通過 Google 官方身分驗證之站務管理員與系統總管存取。
        </p>
      </div>
    );
  }

  // 點擊學生名字按鈕：按下去後立即顯示該學生的所有錯題與試卷
  const handleStudentChipClick = (student) => {
    handleSelectStudentForInspection(student);
  };

  const toggleExpandPaper = (paperId) => {
    setExpandedPaperIds(prev => ({
      ...prev,
      [paperId]: !prev[paperId]
    }));
  };

  const toggleExpandLog = (logId) => {
    setExpandedLogIds(prev => ({
      ...prev,
      [logId]: !prev[logId]
    }));
  };

  // 建立自訂兌換碼
  const handleCreateCode = (e) => {
    e?.preventDefault();
    if (!newCodeName.trim()) {
      alert('請輸入兌換碼代碼！');
      return;
    }
    try {
      addRedemptionCode({
        code: newCodeName.trim(),
        type: newCodeType,
        rewardValue: Number(newCodeReward),
        label: newCodeLabel.trim() || `${newCodeName.trim()} 官方特惠禮包`,
        expiresAt: newCodeExpires
      }, currentUser);

      setRedemptionCodes(getRedemptionCodes());
      setCodeActionMsg(`🎉 成功建立自訂兌換碼【${newCodeName.trim().toUpperCase()}】！已同步寫入日誌並推播至學生通知小鈴鐺！`);
      setNewCodeName('');
      setNewCodeLabel('');
      setTimeout(() => setCodeActionMsg(''), 4000);
    } catch (err) {
      alert(err.message);
    }
  };

  // 刪除兌換碼
  const handleDeleteCode = (code) => {
    if (window.confirm(`確定要刪除兌換碼【${code}】嗎？此動作將立即撤銷該序號並寫入總管審計日誌！`)) {
      deleteRedemptionCode(code, currentUser);
      setRedemptionCodes(getRedemptionCodes());
      setCodeActionMsg(`🗑️ 已成功刪除兌換碼【${code}】！`);
      setTimeout(() => setCodeActionMsg(''), 3000);
    }
  };

  // 1. 處理題目回報
  const handleResolveReport = (reportId) => {
    resolveQuestionReport(reportId, currentUser, '管理員已核對並確認修正完畢');
    setReports(getQuestionReports());
  };

  // 2. 發放點數
  const handleGrantPoints = () => {
    adminGrantPoints(targetPlayerId, Number(pointsToGrant), currentUser);
    setPlayers(getLeaderboard());
    setGrantSuccessMsg(`已成功發放 ${pointsToGrant} 點數！動作已記入總管日誌。`);
    setTimeout(() => setGrantSuccessMsg(''), 3000);
  };

  // 3. 發放抽獎券
  const handleGrantTickets = () => {
    adminGrantTickets(targetPlayerId, Number(ticketsToGrant), currentUser);
    setPlayers(getLeaderboard());
    setGrantSuccessMsg(`已成功發放 ${ticketsToGrant} 張抽獎券！動作已記入總管日誌。`);
    setTimeout(() => setGrantSuccessMsg(''), 3000);
  };

  // 4. 發布全服廣播
  const handleSendBroadcast = (e) => {
    e?.preventDefault();
    if (!broadcastInput.trim()) return;
    updateGlobalSettings({
      activeBroadcast: {
        message: broadcastInput.trim(),
        sender: currentUser.displayName,
        timestamp: new Date().toISOString()
      }
    }, currentUser);
    setBroadcastSuccessMsg('🎉 全服廣播已立即推播至所有在線學生畫面！');
    setBroadcastInput('');
    setTimeout(() => setBroadcastSuccessMsg(''), 3000);
  };

  // 5. 切換全服 2 倍活動 (讓抽中者疊加為 4 倍狂暴)
  const handleToggleGlobal2x = () => {
    const nextState = !globalSettings.global2xActive;
    updateGlobalSettings({
      global2xActive: nextState,
      activeBroadcast: {
        message: nextState 
          ? '🔥 管理員已開啟全服限時雙倍積分狂歡！抽中雙倍直接狂暴飆升至 4 倍！' 
          : '全服雙倍活動已結束，恢復正常積點速度。',
        sender: currentUser.displayName,
        timestamp: new Date().toISOString()
      }
    }, currentUser);
  };

  // 6. 搜尋題庫並修改
  const handleInspectQuestion = () => {
    const qId = searchQId.trim().toUpperCase();
    const parts = qId.split('-');
    if (parts.length >= 5 && parts[0] === 'Q') {
      const gradeId = parts[1].toLowerCase();
      const subjMap = { 'MA': 'math', 'EN': 'english', 'SC': 'science', 'SO': 'social', 'CH': 'chinese' };
      const subjectId = subjMap[parts[2]] || 'math';
      const unitCode = parts[3].toLowerCase();
      const gradeNum = gradeId.replace('g', '');
      const prefixMap = { 'math': 'ma', 'english': 'en', 'science': 'sc', 'social': 'so', 'chinese': 'zh' };
      const unitId = `${prefixMap[subjectId]}-${gradeNum}-${unitCode}`;
      const index = parseInt(parts[4], 10) || 1;
      
      let sample = generateQuestion(subjectId, gradeId, unitId, index, 'medium');
      sample.id = qId;
      
      const overrides = getQuestionOverrides();
      if (overrides && overrides[qId]) {
        sample = { ...sample, ...overrides[qId] };
      }
      
      setInspectedQuestion(sample);
      setEditAnsIdx(sample.answer);
      setEditExpText(sample.explanation);
      setQActionMsg('');
    } else {
      setQActionMsg('❌ 無效的題目 ID 格式！請輸入正確的格式 (例如: Q-G7-MA-U1-0015)');
    }
  };

  const handleSaveQuestionChanges = () => {
    if (!inspectedQuestion) return;
    modifyQuestion(inspectedQuestion.id, {
      answer: editAnsIdx,
      explanation: editExpText
    }, currentUser);
    setQActionMsg(`✅ 題目 [${inspectedQuestion.id}] 答案與詳解已更新！動作已實時寫入總管審計日誌。`);
  };

  const handleDeleteQuestion = () => {
    if (!inspectedQuestion) return;
    modifyQuestion(inspectedQuestion.id, {
      isDeleted: true
    }, currentUser);
    setQActionMsg(`🗑️ 題目 [${inspectedQuestion.id}] 已標記刪除！全站學生測驗與錯題練習均已即時排除此題。`);
  };

  const handleRestoreQuestion = () => {
    if (!inspectedQuestion) return;
    modifyQuestion(inspectedQuestion.id, {
      isDeleted: false
    }, currentUser);
    setQActionMsg(`✨ 題目 [${inspectedQuestion.id}] 已恢復上架！學生測驗已重新加入此題。`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 頂部管理員中台 Banner */}
      <div className="glass-panel" style={{ padding: '28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-indigo">
                <Shield size={13} /> 管理員工作後台
              </span>
              <span className="badge badge-gold">
                當前操作者：{currentUser.displayName}
              </span>
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '6px' }}>
              教學題庫運維與學生學況監控中台
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              管理員可維護題庫、審查學生題目回報、發放點數與抽獎券、推播全服廣播與調閱學生作答紀錄。<strong>所有操作將實時寫入總管理員專屬日誌。</strong>
            </p>
          </div>

          {/* 全服 2 倍活動快速開關 */}
          <div className="glass-panel" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '14px', borderRadius: 'var(--radius-md)', border: globalSettings.global2xActive ? '1px solid #ef4444' : '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>全服雙倍活動開關</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: globalSettings.global2xActive ? '#f87171' : '#cbd5e1' }}>
                {globalSettings.global2xActive ? '🔥 雙倍活動進行中' : '活動未開啟'}
              </div>
            </div>
            <button
              onClick={handleToggleGlobal2x}
              className={`btn ${globalSettings.global2xActive ? 'btn-fire' : 'btn-secondary'}`}
              style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            >
              <Flame size={16} />
              {globalSettings.global2xActive ? '關閉雙倍' : '開啟全服雙倍'}
            </button>
          </div>
        </div>

        {/* 模組分頁選單 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '24px' }}>
          <button
            onClick={() => setActiveSubTab('reports')}
            className={`btn ${activeSubTab === 'reports' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 14px' }}
          >
            <AlertTriangle size={15} /> 學生題目回報 ({reports.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveSubTab('rewards')}
            className={`btn ${activeSubTab === 'rewards' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 14px' }}
          >
            <Gift size={15} /> 發放點數與抽獎券
          </button>
          <button
            onClick={() => setActiveSubTab('codes')}
            className={`btn ${activeSubTab === 'codes' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 14px' }}
          >
            <Ticket size={15} /> 兌換碼自訂與刪除 ({redemptionCodes.length})
          </button>
          <button
            onClick={() => setActiveSubTab('broadcast')}
            className={`btn ${activeSubTab === 'broadcast' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 14px' }}
          >
            <Megaphone size={15} /> 全體即時廣播
          </button>
          <button
            onClick={() => setActiveSubTab('students')}
            className={`btn ${activeSubTab === 'students' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 14px' }}
          >
            <Users size={15} /> 學生做題狀況調閱
          </button>
          <button
            onClick={() => setActiveSubTab('questions')}
            className={`btn ${activeSubTab === 'questions' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 14px' }}
          >
            <BookOpen size={15} /> 題庫改題與刪除
          </button>
        </div>

      </div>

      {/* 1. 學生題目回報審核 */}
      {activeSubTab === 'reports' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} color="#f87171" />
            待審查的題目錯誤與超範圍回報清單
          </h3>

          {reports.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>
              目前沒有學生回報題目問題！
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reports.map(rep => (
                <div key={rep.id} className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: rep.status === 'pending' ? '4px solid #f87171' : '4px solid #10b981' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <span className="badge badge-fire">{rep.reason}</span>
                      <strong style={{ color: 'var(--theme-border, var(--theme-border, #17324d))', fontSize: '0.95rem' }}>題號: {rep.questionId}</strong>
                      <span style={{ fontSize: '0.8rem', color: '#5b6772' }}>{rep.unitName}</span>
                    </div>
                    <div style={{ fontSize: '0.88rem', color: '#5b6772', marginTop: '4px' }}>
                      同學說明：{rep.comment || '（無補充備註）'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#78818a', marginTop: '4px' }}>
                      回報者：{rep.reporterName} ・ 時間：{new Date(rep.timestamp).toLocaleString()}
                    </div>
                  </div>

                  <div>
                    {rep.status === 'pending' ? (
                      <button
                        onClick={() => handleResolveReport(rep.id)}
                        className="btn btn-primary"
                        style={{ fontSize: '0.82rem', padding: '6px 14px' }}
                      >
                        <CheckCircle2 size={15} /> 標記修復完成
                      </button>
                    ) : (
                      <span className="badge badge-emerald">已由管理員處理</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. 發放點數與抽獎券 */}
      {activeSubTab === 'rewards' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Gift size={18} color="#fbbf24" />
            獎勵發放控制台（指定單一玩家或全服空投）
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            
            {/* 選擇發放對象 */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>
                選擇發送對象：
              </label>
              <select
                value={targetPlayerId}
                onChange={e => setTargetPlayerId(e.target.value)}
                style={{ width: '100%', padding: '10px', background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))', color: 'var(--theme-border, var(--theme-border, #17324d))', border: '1.5px solid #ded3c5', borderRadius: 'var(--radius-sm)', fontWeight: 700 }}
              >
                <option value="ALL">📢 全體玩家 (所有人領取)</option>
                {players.map(p => (
                  <option key={p.userId} value={p.userId}>
                    👤 {p.displayName} (目前本週: {p.weeklyPoints} 點)
                  </option>
                ))}
              </select>
            </div>

            {/* 發放點數 */}
            <div className="glass-panel" style={{ padding: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '8px' }}>發送排行榜點數</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="number"
                  value={pointsToGrant}
                  onChange={e => setPointsToGrant(e.target.value)}
                  style={{ width: '100px', padding: '8px', background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))', color: 'var(--theme-border, var(--theme-border, #17324d))', border: '1.5px solid #ded3c5', borderRadius: 'var(--radius-sm)', fontWeight: 700 }}
                />
                <button onClick={handleGrantPoints} className="btn btn-gold" style={{ flex: 1, padding: '8px' }}>
                  確認發放點數
                </button>
              </div>
            </div>

            {/* 發放抽獎券 */}
            <div className="glass-panel" style={{ padding: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '8px' }}>發送抽獎券</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="number"
                  value={ticketsToGrant}
                  onChange={e => setTicketsToGrant(e.target.value)}
                  style={{ width: '100px', padding: '8px', background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))', color: 'var(--theme-border, var(--theme-border, #17324d))', border: '1.5px solid #ded3c5', borderRadius: 'var(--radius-sm)', fontWeight: 700 }}
                />
                <button onClick={handleGrantTickets} className="btn btn-primary" style={{ flex: 1, padding: '8px' }}>
                  確認發放抽獎券
                </button>
              </div>
            </div>

          </div>

          {grantSuccessMsg && (
            <div className="badge badge-emerald" style={{ marginTop: '16px', padding: '10px', width: '100%', justifyContent: 'center' }}>
              <CheckCircle2 size={16} /> {grantSuccessMsg}
            </div>
          )}
        </div>
      )}

      {/* 2.5 兌換碼自訂、發布與刪除管理 */}
      {activeSubTab === 'codes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* 上半部：自訂新增兌換碼表單 */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--theme-border, var(--theme-border, #17324d))', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} color="var(--theme-accent, var(--theme-accent, #ef8354))" />
              建立自訂兌換碼（支援點數、抽獎券與雙倍暴擊卡）
            </h3>

            <form onSubmit={handleCreateCode} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#5b6772', marginBottom: '6px' }}>
                    兌換碼代碼 (自動轉大寫)：
                  </label>
                  <input
                    type="text"
                    value={newCodeName}
                    onChange={e => setNewCodeName(e.target.value.toUpperCase())}
                    placeholder="例如：MATH100、AIPLUS"
                    style={{ width: '100%', padding: '10px 12px', background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))', color: 'var(--theme-border, var(--theme-border, #17324d))', border: '1.5px solid #ded3c5', borderRadius: '12px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#5b6772', marginBottom: '6px' }}>
                    獎勵類型：
                  </label>
                  <select
                    value={newCodeType}
                    onChange={e => setNewCodeType(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))', color: 'var(--theme-border, var(--theme-border, #17324d))', border: '1.5px solid #ded3c5', borderRadius: '12px', fontWeight: 700 }}
                  >
                    <option value="points">🏆 排行榜積分點數 (直接加分)</option>
                    <option value="lottery_ticket">🎫 幸運抽獎券 (轉盤保底)</option>
                    <option value="multiplier">🔥 限時雙倍/四倍狂暴暴擊 (分鐘數)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#5b6772', marginBottom: '6px' }}>
                    獎勵數值 ({newCodeType === 'points' ? '點數' : newCodeType === 'lottery_ticket' ? '張數' : '加成分鐘'})：
                  </label>
                  <input
                    type="number"
                    value={newCodeReward}
                    onChange={e => setNewCodeReward(e.target.value)}
                    min={1}
                    style={{ width: '100%', padding: '10px 12px', background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))', color: 'var(--theme-border, var(--theme-border, #17324d))', border: '1.5px solid #ded3c5', borderRadius: '12px', fontWeight: 800 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#5b6772', marginBottom: '6px' }}>
                    有效截止日期：
                  </label>
                  <input
                    type="date"
                    value={newCodeExpires}
                    onChange={e => setNewCodeExpires(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))', color: 'var(--theme-border, var(--theme-border, #17324d))', border: '1.5px solid #ded3c5', borderRadius: '12px', fontWeight: 700 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#5b6772', marginBottom: '6px' }}>
                  禮包說明標題（呈現在學生領取清冊中）：
                </label>
                <input
                  type="text"
                  value={newCodeLabel}
                  onChange={e => setNewCodeLabel(e.target.value)}
                  placeholder="例如：會考數學滿分衝刺加碼禮包 (+60分)"
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))', color: 'var(--theme-border, var(--theme-border, #17324d))', border: '1.5px solid #ded3c5', borderRadius: '12px', fontWeight: 600 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px', fontWeight: 900 }}>
                  <Plus size={16} /> 建立並發布此兌換碼
                </button>
              </div>
            </form>

            {codeActionMsg && (
              <div style={{ marginTop: '14px', padding: '12px 16px', background: '#e8f6ed', border: '2px solid #347650', borderRadius: '12px', color: '#347650', fontWeight: 800 }}>
                {codeActionMsg}
              </div>
            )}
          </div>

          {/* 下半部：目前有效兌換碼清單與刪除操作 */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--theme-border, var(--theme-border, #17324d))', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Ticket size={18} color="var(--theme-accent, var(--theme-accent, #ef8354))" />
              目前有效兌換碼名冊 ({redemptionCodes.length} 組)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {redemptionCodes.map(codeItem => (
                <div
                  key={codeItem.code}
                  style={{
                    padding: '14px 18px',
                    borderRadius: '16px',
                    background: 'var(--theme-card, var(--theme-card, #fffdf9))',
                    border: '2px solid var(--theme-border, #17324d)',
                    boxShadow: '3px 3px 0 var(--theme-border, #17324d)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '1.05rem', color: 'var(--theme-border, var(--theme-border, #17324d))' }}>
                        {codeItem.code}
                      </span>
                      <span className={`badge ${codeItem.type === 'multiplier' ? 'badge-fire' : codeItem.type === 'lottery_ticket' ? 'badge-coral' : 'badge-gold'}`}>
                        {codeItem.type === 'multiplier' ? `🔥 ${codeItem.rewardValue} 分鐘加倍` : codeItem.type === 'lottery_ticket' ? `🎫 +${codeItem.rewardValue} 張抽獎券` : `🏆 +${codeItem.rewardValue} 點`}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#5b6772', fontWeight: 700 }}>
                      {codeItem.label}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#78818a', marginTop: '3px' }}>
                      建立者：{codeItem.createdBy || '系統預設'} ・ 效期至：{codeItem.expiresAt}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteCode(codeItem.code)}
                    className="btn btn-secondary"
                    style={{ borderColor: '#ef4444', color: '#ef4444', padding: '6px 14px', fontSize: '0.82rem', fontWeight: 800 }}
                  >
                    <Trash2 size={15} />
                    <span>刪除此兌換碼</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 3. 全體廣播發送 */}
      {activeSubTab === 'broadcast' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Megaphone size={18} color="#6366f1" />
            全服即時廣播跑馬燈發送器
          </h3>

          <form onSubmit={handleSendBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <textarea
              value={broadcastInput}
              onChange={e => setBroadcastInput(e.target.value)}
              placeholder="輸入要廣播給全體學生的公告內容（例如：🎉 恭喜林同學打破本週最高題庫得分紀錄！本週六有模考直播複習！）"
              style={{
                width: '100%',
                height: '100px',
                background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))',
                color: 'var(--theme-border, var(--theme-border, #17324d))',
                border: '1.5px solid #ded3c5',
                borderRadius: 'var(--radius-sm)',
                padding: '12px',
                fontSize: '0.92rem',
                fontFamily: 'inherit',
                fontWeight: 600
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
                <Megaphone size={16} /> 即刻推播全服廣播
              </button>
            </div>
          </form>

          {broadcastSuccessMsg && (
            <div className="badge badge-emerald" style={{ marginTop: '16px', padding: '10px', width: '100%', justifyContent: 'center' }}>
              <CheckCircle2 size={16} /> {broadcastSuccessMsg}
            </div>
          )}

          {/* 系統小鈴鐺通知中心公告管理 */}
          <div style={{ marginTop: '28px', borderTop: '1.5px solid #ded3c5', paddingTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--theme-border, var(--theme-border, #17324d))', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={18} color="#f59e0b" />
                學生端小鈴鐺通知公告管理 ({adminNotifications.length})
              </div>
              <div style={{ fontSize: '0.8rem', color: '#78818a', fontWeight: 600 }}>
                刪除通知後，學生端小鈴鐺將即時同步移除
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {adminNotifications.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#78818a', background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))', borderRadius: '12px' }}>
                  目前無任何推播中的系統通知
                </div>
              ) : (
                adminNotifications.map(notif => (
                  <div
                    key={notif.id}
                    style={{
                      background: 'var(--theme-card, var(--theme-card, #fffdf9))',
                      border: '1.5px solid #ded3c5',
                      borderRadius: '14px',
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                      boxShadow: '1px 1px 0px var(--theme-border, #17324d)'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '220px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--theme-border, var(--theme-border, #17324d))' }}>
                          {notif.title}
                        </span>
                        {notif.relatedCode && (
                          <span className="badge badge-gold" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                            序號: {notif.relatedCode}
                          </span>
                        )}
                        <span style={{ fontSize: '0.74rem', color: '#78818a', marginLeft: 'auto' }}>
                          {new Date(notif.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.84rem', color: '#4a5568', fontWeight: 600 }}>
                        {notif.message}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteNotification(notif.id)}
                      className="btn btn-fire"
                      style={{ padding: '6px 12px', fontSize: '0.8rem', fontWeight: 800, gap: '6px', whiteSpace: 'nowrap' }}
                    >
                      <Trash2 size={14} />
                      刪除此通知
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. 學生做題狀況調閱 */}
      {activeSubTab === 'students' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* A. 頂部儀表板與指標統計 */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderBottom: '1.5px solid #ded3c5', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--theme-border, var(--theme-border, #17324d))', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Users size={22} color="#15803d" />
                  所有學生雲端做題狀況與歷程調閱
                </h3>
                <p style={{ color: '#78818a', fontSize: '0.85rem', marginTop: '4px', margin: '4px 0 0' }}>
                  彙整全體學生做題表現、高頻對錯題類型分析，支援按學生名字篩選錯題、查詢特定題號代碼與展開完整題目詳解。
                </p>
              </div>

              {/* 統計四項指標與雲端強制刷新按鈕 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span className="badge badge-navy" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                  📊 總作答：{studentAnalytics.totalCount} 題
                </span>
                <span className="badge badge-emerald" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                  ✓ 正答率：{studentAnalytics.totalCount > 0 ? Math.round((studentAnalytics.totalCorrect / studentAnalytics.totalCount) * 100) : 0}%
                </span>
                <span className="badge badge-coral" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                  ⚠️ 總錯題：{studentAnalytics.totalWrong} 題
                </span>
                <span className="badge badge-gold" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                  👤 註冊/活躍學生：{studentAnalytics.studentsList.length} 位
                </span>
                <button
                  onClick={handleForceCloudRefresh}
                  disabled={isRefreshingCloud}
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.8rem', fontWeight: 800, gap: '6px' }}
                  title="向 Firebase 雲端資料庫重新同步全體名冊與即時做題紀錄"
                >
                  <RefreshCw size={14} className={isRefreshingCloud ? 'animate-spin' : ''} />
                  {isRefreshingCloud ? '雲端同步中...' : '重新整理雲端'}
                </button>
              </div>
            </div>

            {/* A-2. 全服即時做題動態串流 (Live Feed) */}
            <div style={{ marginBottom: '20px', background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))', border: '1.5px solid #ded3c5', borderRadius: '16px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={18} color="#eab308" />
                  <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--theme-border, var(--theme-border, #17324d))' }}>
                    ⚡ 全服做題即時動態串流 (Live Stream) - 即時交卷脈搏
                  </span>
                  <span className="badge badge-navy" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                    最新 {recentStream.length} 筆
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#78818a' }}>
                  任何學生交卷即秒級推播
                </span>
              </div>

              {recentStream.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '14px', fontSize: '0.82rem', color: '#78818a' }}>
                  目前尚未有即時交卷串流，當學生完成任一測驗交卷時，此處將自動即時跳出交卷通知與得分詳情。
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' }}>
                  {recentStream.slice(0, 15).map((item) => (
                    <div
                      key={item.id}
                      style={{
                        minWidth: '260px',
                        background: 'var(--theme-card, var(--theme-card, #fffdf9))',
                        border: '1.5px solid #ded3c5',
                        borderRadius: '12px',
                        padding: '12px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        boxShadow: '2px 2px 0 #ded3c5',
                        flexShrink: 0
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--theme-border, var(--theme-border, #17324d))' }}>
                          👤 {item.userName || '會考同學'}
                        </span>
                        <span 
                          style={{ 
                            fontSize: '0.72rem', 
                            fontWeight: 800, 
                            padding: '2px 6px', 
                            borderRadius: '6px',
                            background: item.accuracy >= 80 ? '#e8f6ed' : item.accuracy >= 60 ? '#fff7d9' : '#fff0e9',
                            color: item.accuracy >= 80 ? '#15803d' : item.accuracy >= 60 ? '#806523' : '#c8643d'
                          }}
                        >
                          {item.correctCount} / {item.totalQuestions} 題 ({item.accuracy}%)
                        </span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#78818a' }}>
                        {item.userSchool || '會考戰友'} • 【{item.unitName}】
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                        <span style={{ fontSize: '0.7rem', color: '#9aa2a8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={11} /> {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • 耗時 {item.timeSpentSec}s
                        </span>
                        <button
                          onClick={() => handleSelectStudentForInspection(item)}
                          className="btn btn-ghost"
                          style={{ padding: '2px 6px', fontSize: '0.72rem', color: 'var(--theme-accent, var(--theme-accent, #ef8354))', fontWeight: 800 }}
                          title="調閱此學生詳細做題與錯題紀錄"
                        >
                          調閱詳解 →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* B. 高頻對錯題類型雙診斷卡片 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              
              {/* 高頻錯題類型 TOP 5 */}
              <div style={{ background: '#fff0e9', border: '2px solid var(--theme-accent, #ef8354)', borderRadius: '18px', padding: '18px', boxShadow: '3px 3px 0 var(--theme-border, #17324d)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.92rem', fontWeight: 900, color: '#c8643d', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={17} color="var(--theme-accent, var(--theme-accent, #ef8354))" />
                    全體高頻錯題類型 TOP 5 (學生盲點)
                  </span>
                  <span style={{ fontSize: '0.74rem', color: '#78818a', fontWeight: 700 }}>
                    依錯誤次數排序
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {studentAnalytics.topMistakeTypes.length === 0 ? (
                    <div style={{ fontSize: '0.82rem', color: '#78818a', textAlign: 'center', padding: '12px' }}>
                      目前尚無錯題紀錄
                    </div>
                  ) : (
                    studentAnalytics.topMistakeTypes.map((item, idx) => (
                      <div 
                        key={item.tag} 
                        onClick={() => setQuestionSearchKeyword(item.tag)}
                        style={{
                          background: 'var(--theme-card, var(--theme-card, #fffdf9))',
                          border: '1.5px solid #ded3c5',
                          borderRadius: '12px',
                          padding: '10px 12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px'
                        }}
                        title="點擊直接查詢此類題目的做題狀況"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#c8643d', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 900 }}>
                            {idx + 1}
                          </span>
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--theme-border, var(--theme-border, #17324d))' }}>
                              #{item.tag}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#78818a' }}>
                              {item.unitName}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: 900, color: '#c8643d' }}>
                            {item.wrong} 題答錯
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#9aa2a8', fontWeight: 700 }}>
                            錯誤率 {item.errorRate}%
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 高頻精熟高正答題型 TOP 5 */}
              <div style={{ background: '#e8f6ed', border: '2px solid #347650', borderRadius: '18px', padding: '18px', boxShadow: '3px 3px 0 var(--theme-border, #17324d)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.92rem', fontWeight: 900, color: '#15803d', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={17} color="#15803d" />
                    全體精熟掌握題型 TOP 5 (學生強項)
                  </span>
                  <span style={{ fontSize: '0.74rem', color: '#78818a', fontWeight: 700 }}>
                    依正答數排序
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {studentAnalytics.topMasteryTypes.length === 0 ? (
                    <div style={{ fontSize: '0.82rem', color: '#78818a', textAlign: 'center', padding: '12px' }}>
                      目前尚無作答紀錄
                    </div>
                  ) : (
                    studentAnalytics.topMasteryTypes.map((item, idx) => (
                      <div 
                        key={item.tag} 
                        onClick={() => setQuestionSearchKeyword(item.tag)}
                        style={{
                          background: 'var(--theme-card, var(--theme-card, #fffdf9))',
                          border: '1.5px solid #ded3c5',
                          borderRadius: '12px',
                          padding: '10px 12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px'
                        }}
                        title="點擊直接查詢此類題目的做題狀況"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#15803d', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 900 }}>
                            {idx + 1}
                          </span>
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--theme-border, var(--theme-border, #17324d))' }}>
                              #{item.tag}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#78818a' }}>
                              {item.unitName}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: 900, color: '#15803d' }}>
                            {item.correct} 題答對
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#9aa2a8', fontWeight: 700 }}>
                            正答率 {item.accuracy}%
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>

          {/* C. 學生名單快速篩選按鈕列 (點擊學生名字立即顯示所有錯題) */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="var(--theme-accent, var(--theme-accent, #ef8354))" />
                <span style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--theme-border, var(--theme-border, #17324d))' }}>
                  學生名稱快篩按鈕（點選名字按鈕即切換為顯示該生所有錯題）：
                </span>
              </div>

              {/* 學生姓名即時搜尋 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '260px' }}>
                <Search size={15} color="#78818a" />
                <input
                  type="text"
                  placeholder="搜尋學生名稱或學校..."
                  value={studentSearchKeyword}
                  onChange={e => setStudentSearchKeyword(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '6px 12px',
                    background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))',
                    color: 'var(--theme-border, var(--theme-border, #17324d))',
                    border: '1.5px solid #ded3c5',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    fontWeight: 600
                  }}
                />
              </div>
            </div>

            {/* 學生按鈕列表 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <button
                onClick={() => {
                  setSelectedStudent('ALL');
                  setSelectedStudentId('ALL');
                  setOnlyMistakes(false);
                }}
                style={{
                  background: selectedStudent === 'ALL' ? 'var(--theme-border, var(--theme-border, #17324d))' : 'var(--theme-card, var(--theme-card, #fffdf9))',
                  color: selectedStudent === 'ALL' ? '#fff' : 'var(--theme-border, var(--theme-border, #17324d))',
                  border: selectedStudent === 'ALL' ? '2px solid var(--theme-accent, #ef8354)' : '1.5px solid #ded3c5',
                  borderRadius: '12px',
                  padding: '7px 14px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: selectedStudent === 'ALL' ? '2px 2px 0 var(--theme-accent, #ef8354)' : 'none'
                }}
              >
                全部學生 ({studentAnalytics.totalCount} 題)
              </button>

              {studentAnalytics.studentsList
                .filter(s => {
                  if (!studentSearchKeyword.trim()) return true;
                  const kw = studentSearchKeyword.toLowerCase();
                  return s.name.toLowerCase().includes(kw) || s.school.toLowerCase().includes(kw);
                })
                .map(student => {
                  const isSelected = selectedStudent === student.name;
                  return (
                    <button
                      key={student.name}
                      onClick={() => handleStudentChipClick(student)}
                      style={{
                        background: isSelected ? 'var(--theme-border, var(--theme-border, #17324d))' : 'var(--theme-card, var(--theme-card, #fffdf9))',
                        color: isSelected ? '#f7cf68' : 'var(--theme-border, var(--theme-border, #17324d))',
                        border: isSelected ? '2px solid var(--theme-accent, #ef8354)' : '1.5px solid #ded3c5',
                        borderRadius: '12px',
                        padding: '7px 14px',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: isSelected ? '3px 3px 0 var(--theme-accent, #ef8354)' : '1px 1px 0 #ded3c5',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      title={`點擊調閱【${student.name}】的雲端做題與錯題紀錄`}
                    >
                      <span>👤 {student.name}</span>
                      <span 
                        style={{ 
                          fontSize: '0.72rem', 
                          background: isSelected ? 'var(--theme-accent, var(--theme-accent, #ef8354))' : '#fff0e9', 
                          color: isSelected ? '#fff' : '#c8643d', 
                          padding: '1px 6px', 
                          borderRadius: '6px', 
                          fontWeight: 800 
                        }}
                      >
                        錯 {student.wrong} / 共 {student.total} 題
                      </span>
                    </button>
                  );
                })}
            </div>

            {/* 篩選狀態條 */}
            {selectedStudent !== 'ALL' && (
              <div style={{ marginTop: '14px', padding: '10px 16px', background: '#fff0e9', border: '1.5px solid var(--theme-accent, #ef8354)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#c8643d' }}>
                  🎯 目前正在調閱【{selectedStudent}】的作答紀錄：{onlyMistakes ? '⚠️ 僅顯示錯題清單' : '顯示全部作答紀錄'}
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setOnlyMistakes(!onlyMistakes)}
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.76rem', fontWeight: 800 }}
                  >
                    {onlyMistakes ? '切換為顯示該生全部題目' : '切換為僅看錯題'}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedStudent('ALL');
                      setSelectedStudentId('ALL');
                      setOnlyMistakes(false);
                    }}
                    className="btn btn-ghost"
                    style={{ padding: '4px 8px', fontSize: '0.76rem', color: '#78818a', fontWeight: 700 }}
                  >
                    清除學生篩選
                  </button>
                </div>
              </div>
            )}

            {/* 雲端調閱載入提示 */}
            {isLoadingStudentHistory && (
              <div style={{ marginTop: '10px', padding: '10px 14px', background: '#eff6ff', border: '1.5px solid #3b82f6', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: '#1d4ed8', fontWeight: 700 }}>
                <RefreshCw size={15} className="animate-spin" />
                正在自 Firebase 雲端調閱【{selectedStudent}】之實名做題歷程與錯題本...
              </div>
            )}
          </div>

          {/* D. 查詢特定題號與錯題過濾控制列 */}
          <div className="glass-panel" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '280px' }}>
              <Search size={18} color="var(--theme-accent, var(--theme-accent, #ef8354))" />
              <input
                type="text"
                placeholder="查詢特定題號代碼、單元或關鍵字 (例如：Q-G8-MA-U2-0042、因式分解、浮力、時態...)"
                value={questionSearchKeyword}
                onChange={e => setQuestionSearchKeyword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))',
                  color: 'var(--theme-border, var(--theme-border, #17324d))',
                  border: '1.5px solid #ded3c5',
                  borderRadius: '12px',
                  fontSize: '0.86rem',
                  fontWeight: 600
                }}
              />
              {questionSearchKeyword && (
                <button
                  onClick={() => setQuestionSearchKeyword('')}
                  style={{ background: 'transparent', border: 'none', color: '#78818a', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {/* 視圖切換按鈕：完整試卷 vs 單題明細 */}
              <div style={{ display: 'flex', background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))', border: '1.5px solid #ded3c5', borderRadius: '12px', padding: '3px', gap: '4px' }}>
                <button
                  onClick={() => setInspectionViewMode('papers')}
                  style={{
                    background: inspectionViewMode === 'papers' ? 'var(--theme-border, var(--theme-border, #17324d))' : 'transparent',
                    color: inspectionViewMode === 'papers' ? '#fff' : 'var(--theme-border, var(--theme-border, #17324d))',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FileText size={14} /> 📄 歷次完整試卷 ({filteredQuizPapers.length} 份)
                </button>
                <button
                  onClick={() => setInspectionViewMode('logs')}
                  style={{
                    background: inspectionViewMode === 'logs' ? 'var(--theme-border, var(--theme-border, #17324d))' : 'transparent',
                    color: inspectionViewMode === 'logs' ? '#fff' : 'var(--theme-border, var(--theme-border, #17324d))',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <BookOpen size={14} /> 📝 單題題目明細 ({filteredPracticeLogs.length} 題)
                </button>
              </div>

              {inspectionViewMode === 'logs' && (
                <>
                  <button
                    onClick={() => setOnlyMistakes(false)}
                    style={{
                      background: !onlyMistakes ? 'var(--theme-border, var(--theme-border, #17324d))' : 'var(--theme-bg, var(--theme-bg, #f8f3eb))',
                      color: !onlyMistakes ? '#fff' : 'var(--theme-border, var(--theme-border, #17324d))',
                      border: '1.5px solid var(--theme-border, #17324d)',
                      borderRadius: '10px',
                      padding: '7px 12px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    全部作答 ({filteredPracticeLogs.length})
                  </button>
                  <button
                    onClick={() => setOnlyMistakes(true)}
                    style={{
                      background: onlyMistakes ? '#c8643d' : 'var(--theme-bg, var(--theme-bg, #f8f3eb))',
                      color: onlyMistakes ? '#fff' : '#c8643d',
                      border: '1.5px solid #c8643d',
                      borderRadius: '10px',
                      padding: '7px 12px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    ⚠️ 僅看錯題 ({filteredPracticeLogs.filter(h => !h.isCorrect).length})
                  </button>
                </>
              )}
            </div>
          </div>

          {/* E. 依「歷次完整試卷調閱」或「單題明細」展示 */}
          {inspectionViewMode === 'papers' ? (
            /* 完整試卷列表呈現 */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {isLoadingStudentHistory ? (
                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--theme-border, var(--theme-border, #17324d))' }}>
                  <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 12px', color: 'var(--theme-accent, var(--theme-accent, #ef8354))' }} />
                  <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>正在自雲端調閱【{selectedStudent}】之完整試卷與各題作答...</div>
                </div>
              ) : filteredQuizPapers.length === 0 ? (
                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: '#78818a' }}>
                  <FileText size={36} style={{ margin: '0 auto 10px', opacity: 0.5, color: 'var(--theme-accent, var(--theme-accent, #ef8354))' }} />
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--theme-border, var(--theme-border, #17324d))' }}>目前尚未調閱到符合條件的試卷</div>
                  <div style={{ fontSize: '0.82rem', marginTop: '4px' }}>
                    學生完成測驗並交卷後，整份考卷將自動即時封存並同步至雲端供管理員調閱。
                  </div>
                  <button
                    onClick={handleForceCloudRefresh}
                    className="btn btn-secondary"
                    style={{ marginTop: '14px', padding: '8px 16px' }}
                  >
                    <RefreshCw size={14} /> 重新整理雲端試卷庫
                  </button>
                </div>
              ) : (
                filteredQuizPapers.map((paper, paperIndex) => {
                  const isExpanded = expandedPaperIds[paper.id] !== false; // 預設展開顯示試卷內容
                  return (
                    <div
                      key={paper.id || paperIndex}
                      style={{
                        background: 'var(--theme-card, var(--theme-card, #fffdf9))',
                        border: '2.5px solid var(--theme-border, #17324d)',
                        borderRadius: '20px',
                        padding: '24px',
                        boxShadow: '5px 5px 0px var(--theme-border, #17324d)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                      }}
                    >
                      {/* 試卷卡片頂部 Header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderBottom: '2px solid #ded3c5', paddingBottom: '16px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                            <span className="badge badge-navy" style={{ fontSize: '0.76rem', padding: '3px 8px' }}>
                              試卷編號：{paper.id}
                            </span>
                            <span className="badge badge-indigo" style={{ fontSize: '0.76rem', padding: '3px 8px' }}>
                              【{paper.unitName || '單元綜合評量'}】
                            </span>
                            <span style={{ fontSize: '0.74rem', color: '#78818a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={12} /> 交卷時間：{new Date(paper.timestamp).toLocaleString()} • 作答耗時：{paper.timeSpentSec || 15} 秒
                            </span>
                          </div>

                          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--theme-border, var(--theme-border, #17324d))', margin: 0 }}>
                            📄 {paper.paperTitle || '國中實戰測驗評量卷'}
                          </h3>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                            <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--theme-border, var(--theme-border, #17324d))' }}>
                              👤 考生：{paper.userName || '匿名同學'}
                            </span>
                            <span style={{ fontSize: '0.76rem', color: '#78818a' }}>
                              ({paper.userSchool || '會考戰友'})
                            </span>
                          </div>
                        </div>

                        {/* 得分成績與操作按鈕 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                          <div style={{ textAlign: 'right', background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))', border: '1.5px solid #ded3c5', padding: '8px 16px', borderRadius: '14px' }}>
                            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: paper.score >= 80 ? '#15803d' : paper.score >= 60 ? '#d97706' : '#b91c1c' }}>
                              {paper.score} <span style={{ fontSize: '0.8rem', color: '#78818a' }}>分</span>
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#5b6772', fontWeight: 700 }}>
                              ✓ 答對 {paper.correctCount} 題 / ✗ 答錯 {paper.wrongCount} 題
                            </div>
                          </div>

                          <button
                            onClick={() => toggleExpandPaper(paper.id)}
                            className="btn btn-primary"
                            style={{ padding: '8px 16px', fontSize: '0.84rem', fontWeight: 800, gap: '6px' }}
                          >
                            <BookOpen size={16} />
                            {isExpanded ? '收合整份試卷' : '調閱整份試卷詳解'}
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* 試卷完整題目逐題展開 (全考卷原樣詳解展示) */}
                      {isExpanded && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '4px' }}>
                          <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--theme-border, var(--theme-border, #17324d))', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <CheckCircle2 size={16} color="#15803d" />
                            整卷題目批改與推導詳解清單（共 {paper.questions?.length || 0} 題）：
                          </div>

                          {(paper.questions || []).map((q, qIndex) => {
                            const isUserPick = q.userChoice;
                            const isRight = q.isCorrect;

                            return (
                              <div
                                key={q.id || qIndex}
                                style={{
                                  background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))',
                                  border: isRight ? '2px solid #86efac' : '2px solid #fca5a5',
                                  borderRadius: '14px',
                                  padding: '16px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '10px'
                                }}
                              >
                                {/* 題目抬頭 */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ 
                                      width: '24px', 
                                      height: '24px', 
                                      borderRadius: '50%', 
                                      background: isRight ? '#15803d' : '#b91c1c', 
                                      color: '#fff', 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      justifyContent: 'center', 
                                      fontSize: '0.76rem', 
                                      fontWeight: 900 
                                    }}>
                                      {qIndex + 1}
                                    </span>
                                    <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--theme-border, var(--theme-border, #17324d))' }}>
                                      題號：{q.questionId || q.id}
                                    </span>
                                    <span style={{ fontSize: '0.74rem', color: '#78818a' }}>
                                      #{q.conceptTag || '重點考點'}
                                    </span>
                                  </div>

                                  <span
                                    style={{
                                      fontSize: '0.74rem',
                                      fontWeight: 900,
                                      padding: '2px 8px',
                                      borderRadius: '12px',
                                      background: isRight ? '#e8f6ed' : '#fff0e9',
                                      color: isRight ? '#15803d' : '#b91c1c',
                                      border: `1px solid ${isRight ? '#86efac' : '#fca5a5'}`
                                    }}
                                  >
                                    {isRight ? '✓ 答對' : '✗ 答錯'}
                                  </span>
                                </div>

                                {/* 題幹文字 */}
                                <div style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--theme-border, var(--theme-border, #17324d))', lineHeight: 1.7, background: 'var(--theme-card, var(--theme-card, #fffdf9))', padding: '12px 14px', borderRadius: '10px', border: '1px solid #ded3c5' }}>
                                  <MathText text={q.question || `【題目代碼 ${q.id}】：某題庫標準觀念評量題。`} />
                                </div>

                                {/* 四大選項呈現 */}
                                {q.options && q.options.length > 0 && (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {q.options.map((opt, optIdx) => {
                                      const letter = String.fromCharCode(65 + optIdx);
                                      const isChosen = isUserPick === optIdx;
                                      const isCorrectOpt = (q.answer !== undefined ? q.answer : 0) === optIdx;

                                      let bg = 'var(--theme-card, var(--theme-card, #fffdf9))';
                                      let border = '1px solid #ded3c5';
                                      let textColor = '#2d3748';
                                      let badge = null;

                                      if (isCorrectOpt && isChosen) {
                                        bg = '#e8f6ed';
                                        border = '2px solid #15803d';
                                        textColor = '#15803d';
                                        badge = <span style={{ marginLeft: 'auto', background: '#15803d', color: '#fff', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>學生作答（正確答案 ✓）</span>;
                                      } else if (isChosen && !isCorrectOpt) {
                                        bg = '#fff0e9';
                                        border = '2px solid #b91c1c';
                                        textColor = '#b91c1c';
                                        badge = <span style={{ marginLeft: 'auto', background: '#b91c1c', color: '#fff', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>學生作答 ✗ (選此項)</span>;
                                      } else if (isCorrectOpt) {
                                        bg = '#e8f6ed';
                                        border = '2px solid #15803d';
                                        textColor = '#15803d';
                                        badge = <span style={{ marginLeft: 'auto', background: '#15803d', color: '#fff', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>標準正解 ✓</span>;
                                      }

                                      return (
                                        <div
                                          key={optIdx}
                                          style={{
                                            background: bg,
                                            border,
                                            borderRadius: '8px',
                                            padding: '8px 12px',
                                            fontSize: '0.84rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            fontWeight: (isChosen || isCorrectOpt) ? 800 : 600,
                                            color: textColor
                                          }}
                                        >
                                          <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: isCorrectOpt ? '#15803d' : isChosen ? '#b91c1c' : 'var(--theme-bg, var(--theme-bg, #f8f3eb))', color: (isCorrectOpt || isChosen) ? '#fff' : 'var(--theme-border, var(--theme-border, #17324d))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 900 }}>
                                            {letter}
                                          </span>
                                          <span><MathText text={opt} /></span>
                                          {badge}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* 名師推導詳解 */}
                                <div style={{ background: 'var(--theme-card, var(--theme-card, #fffdf9))', border: '1px solid #ded3c5', borderRadius: '10px', padding: '10px 14px', fontSize: '0.82rem', color: '#2d3748', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                                  <span style={{ fontWeight: 900, color: 'var(--theme-border, var(--theme-border, #17324d))', display: 'block', marginBottom: '2px' }}>
                                    📖 題目詳解與觀念解讀：
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
          ) : (
            /* 單題題目流水帳呈現 */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {isLoadingStudentHistory ? (
                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--theme-border, var(--theme-border, #17324d))' }}>
                  <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 12px', color: 'var(--theme-accent, var(--theme-accent, #ef8354))' }} />
                  <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>正在自雲端即時載入【{selectedStudent}】之做題詳解...</div>
                  <div style={{ fontSize: '0.82rem', color: '#78818a', marginTop: '6px' }}>透過 Mulberry32 演算法秒級還原題幹、選項、學生答案與考點分析</div>
                </div>
              ) : filteredPracticeLogs.length === 0 ? (
                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: '#78818a' }}>
                  <Search size={32} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--theme-border, var(--theme-border, #17324d))' }}>沒有符合條件的作答紀錄</div>
                  <div style={{ fontSize: '0.82rem', marginTop: '4px' }}>請嘗試調整搜尋關鍵字、更換學生或切換篩選條件</div>
                </div>
              ) : (
                filteredPracticeLogs.map((log) => {
                const isExpanded = expandedLogIds[log.id] !== false; // 依需求：預設展開顯示題目和詳解

                return (
                  <div
                    key={log.id}
                    style={{
                      background: 'var(--theme-card, var(--theme-card, #fffdf9))',
                      border: log.isCorrect ? '2px solid #b9ddc5' : '2px solid #efb7a6',
                      borderRadius: '18px',
                      padding: '20px',
                      boxShadow: '4px 4px 0px var(--theme-border, #17324d)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px'
                    }}
                  >
                    {/* 卡片抬頭資訊 */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid #f1eae0', paddingBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img 
                          src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(log.userName || 'student')}`}
                          alt="avatar" 
                          style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #ded3c5' }} 
                        />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 900, fontSize: '0.98rem', color: 'var(--theme-border, var(--theme-border, #17324d))' }}>
                              {log.userName || '匿名同學'}
                            </span>
                            <span style={{ fontSize: '0.74rem', color: '#78818a', fontWeight: 600 }}>
                              • {log.userSchool || '會考戰友'}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#9aa2a8', marginTop: '2px' }}>
                            作答時間：{new Date(log.timestamp).toLocaleString()} ・ 耗時 {log.timeSpentSec || 15} 秒
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span 
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 900,
                            padding: '4px 10px',
                            borderRadius: '20px',
                            background: log.isCorrect ? '#e8f6ed' : '#fff0e9',
                            color: log.isCorrect ? '#15803d' : '#c8643d',
                            border: `1.5px solid ${log.isCorrect ? '#86efac' : '#fca5a5'}`
                          }}
                        >
                          {log.isCorrect ? '✓ 答對' : '✗ 答錯'}
                        </span>

                        {!log.isCorrect && log.wrongCount && log.wrongCount > 1 && (
                          <span className="badge badge-coral" style={{ fontSize: '0.74rem', padding: '3px 8px' }}>
                            ⚠️ 累計答錯 {log.wrongCount} 次
                          </span>
                        )}

                        <button
                          onClick={() => toggleExpandLog(log.id)}
                          className="btn btn-secondary"
                          style={{ padding: '5px 12px', fontSize: '0.78rem', fontWeight: 800, gap: '4px' }}
                        >
                          <BookOpen size={14} />
                          {isExpanded ? '收合詳解' : '顯示題目與詳解'}
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* 標籤列 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ background: 'var(--theme-border, var(--theme-border, #17324d))', color: '#fff', fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>
                        題號：{log.questionId}
                      </span>
                      <span style={{ background: '#e8f0f2', color: '#48717e', fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>
                        【{log.unitName}】
                      </span>
                      <span style={{ background: '#fff7d9', color: '#806523', border: '1px solid #ded3c5', fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>
                        #{log.conceptTag}
                      </span>
                    </div>

                    {/* 題目本文與詳細選項/詳解 (可展開/預設顯示) */}
                    {isExpanded && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '6px' }}>
                        
                        {/* 題幹內容 */}
                        <div style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--theme-border, var(--theme-border, #17324d))', lineHeight: 1.8, background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))', padding: '14px 16px', borderRadius: '12px', border: '1px solid #ded3c5' }}>
                          {log.question || `【題目代碼 ${log.questionId}】：某題庫標準觀念評量題。`}
                        </div>

                        {/* 四大選項呈現 */}
                        {log.options && log.options.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {log.options.map((opt, optIdx) => {
                              const letter = String.fromCharCode(65 + optIdx);
                              const isUserPick = log.userChoice === optIdx;
                              const isRightAns = (log.answer !== undefined ? log.answer : 0) === optIdx;

                              let bg = 'var(--theme-card, var(--theme-card, #fffdf9))';
                              let border = '1.5px solid #ded3c5';
                              let textColor = '#2d3748';
                              let badge = null;

                              if (isRightAns && isUserPick) {
                                bg = '#e8f6ed';
                                border = '2px solid #15803d';
                                textColor = '#15803d';
                                badge = <span style={{ marginLeft: 'auto', background: '#15803d', color: '#fff', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>學生作答（標準答案 ✓）</span>;
                              } else if (isUserPick && !isRightAns) {
                                bg = '#fff0e9';
                                border = '2px solid #b91c1c';
                                textColor = '#b91c1c';
                                badge = <span style={{ marginLeft: 'auto', background: '#b91c1c', color: '#fff', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>學生作答 ✗ (選此選項)</span>;
                              } else if (isRightAns) {
                                bg = '#e8f6ed';
                                border = '2px solid #15803d';
                                textColor = '#15803d';
                                badge = <span style={{ marginLeft: 'auto', background: '#15803d', color: '#fff', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>標準正解 ✓</span>;
                              }

                              return (
                                <div
                                  key={optIdx}
                                  style={{
                                    background: bg,
                                    border: border,
                                    borderRadius: '10px',
                                    padding: '8px 12px',
                                    fontSize: '0.86rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontWeight: (isUserPick || isRightAns) ? 800 : 600,
                                    color: textColor
                                  }}
                                >
                                  <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: isRightAns ? '#15803d' : isUserPick ? '#b91c1c' : 'var(--theme-bg, var(--theme-bg, #f8f3eb))', color: (isRightAns || isUserPick) ? '#fff' : 'var(--theme-border, var(--theme-border, #17324d))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.76rem', fontWeight: 900 }}>
                                    {letter}
                                  </span>
                                  <span>{opt}</span>
                                  {badge}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* 思路點撥 */}
                        {log.hint && (
                          <div style={{ background: '#fff9e6', border: '1.5px solid #f6d884', borderRadius: '10px', padding: '10px 14px', fontSize: '0.82rem', color: '#806523', lineHeight: 1.6, fontWeight: 600 }}>
                            <span style={{ fontWeight: 900 }}>💡 破題思路提示：</span>
                            <span style={{ marginLeft: '4px' }}>{log.hint}</span>
                          </div>
                        )}

                        {/* 名師完整詳解 */}
                        <div style={{ background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))', border: '1.5px solid #ded3c5', borderRadius: '12px', padding: '12px 16px', fontSize: '0.84rem', color: '#2d3748', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                          <span style={{ fontWeight: 900, color: 'var(--theme-border, var(--theme-border, #17324d))', display: 'block', marginBottom: '4px' }}>
                            📖 題目完整詳解與推導步驟：
                          </span>
                          {log.explanation || '本題依據 108 課綱核心概念設計，觀念清晰，按基本定義運算即可推導出正確答案。'}
                        </div>

                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        </div>
      )}

      {/* 5. 題庫改題與刪除 */}
      {activeSubTab === 'questions' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} color="#ec4899" />
            題庫答案修正與題目管理
          </h3>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input
              type="text"
              value={searchQId}
              onChange={e => setSearchQId(e.target.value)}
              placeholder="輸入題號 (例如: Q-G7-MA-U1-0001)"
              style={{ flex: 1, padding: '10px 14px', background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))', color: 'var(--theme-border, var(--theme-border, #17324d))', border: '1.5px solid #ded3c5', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}
            />
            <button onClick={handleInspectQuestion} className="btn btn-secondary">
              <Search size={16} /> 調閱題目
            </button>
          </div>

          {inspectedQuestion && (() => {
            const currentOverrides = getQuestionOverrides();
            const isInspectedDeleted = !!currentOverrides[inspectedQuestion.id]?.isDeleted;

            return (
              <div className="glass-panel" style={{ padding: '20px', border: isInspectedDeleted ? '2px solid #ef4444' : '2px solid var(--theme-border, #17324d)' }}>
                {isInspectedDeleted && (
                  <div style={{ marginBottom: '14px', padding: '10px 14px', borderRadius: '12px', background: '#fee2e2', border: '1.5px solid #ef4444', color: '#991b1b', fontSize: '0.86rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={18} color="#ef4444" />
                    此題目目前已被標記刪除！全站學生測驗與錯題加強模式已徹底排除，學生絕不會抽取到此題。
                  </div>
                )}

                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--theme-border, var(--theme-border, #17324d))', marginBottom: '12px' }}>
                  <MathText text={inspectedQuestion.question} />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    設定正確答案選項：
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                    {inspectedQuestion.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => setEditAnsIdx(idx)}
                        className={`btn ${editAnsIdx === idx ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ justifyContent: 'flex-start', padding: '10px' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                          <span>({['A', 'B', 'C', 'D'][idx]})</span>
                          <MathText text={opt} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    修改題目詳解：
                  </label>
                  <textarea
                    value={editExpText}
                    onChange={e => setEditExpText(e.target.value)}
                    style={{ width: '100%', height: '80px', background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))', color: 'var(--theme-border, var(--theme-border, #17324d))', border: '1.5px solid #ded3c5', borderRadius: 'var(--radius-sm)', padding: '10px', fontWeight: 600 }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button onClick={handleSaveQuestionChanges} className="btn btn-primary">
                    <Edit3 size={15} /> 儲存修改 (寫入總管日誌)
                  </button>
                  {isInspectedDeleted ? (
                    <button onClick={handleRestoreQuestion} className="btn btn-secondary" style={{ background: '#e8f6ed', color: '#15803d', borderColor: '#15803d', fontWeight: 800 }}>
                      <RotateCcw size={15} /> 恢復上架此題目
                    </button>
                  ) : (
                    <button onClick={handleDeleteQuestion} className="btn btn-fire">
                      <Trash2 size={15} /> 刪除該題目 (學生端即刻排除)
                    </button>
                  )}
                </div>

                {qActionMsg && (
                  <div className="badge badge-emerald" style={{ marginTop: '12px', padding: '8px' }}>
                    {qActionMsg}
                  </div>
                )}
              </div>
            );
          })()}

        </div>
      )}

    </div>
  );
}
