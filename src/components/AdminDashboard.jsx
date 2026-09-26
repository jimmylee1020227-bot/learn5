import DOMPurify from 'dompurify';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { 
  getQuestionReports, 
  fetchCloudQuestionReports, 
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
  fetchCloudUserRegistry,
  getRedemptionCodes,
  addRedemptionCode,
  deleteRedemptionCode,
  getAdminNotifications,
  deleteAdminNotification,
  subscribeToCloudSync,
  SUPER_ADMIN_EMAIL,
  getAdminsList,
  checkIsAdmin,
  getJson,
  setJson,
  deleteStudentAccount,
  runSystemHealthCheck,
  getHealthCheckReports,
  measureCloudPing,
  getAuditLogs,
  fetchCloudAuditLogs,
  pushPlayerLeaderboardSync,
  getNoteReports
} from '../services/cloudStorage';
import AdminNotesManager from './AdminNotesManager';
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
  FileText,
  Activity,
  Server,
  UserX
} from 'lucide-react';

function AdminDashboard() {
  const { currentUser } = useAuth();
  const { globalSettings } = useGame();

  const isAuthorized = checkIsAdmin(currentUser);
  const isAuthorizedSuperAdmin = currentUser?.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() || currentUser?.role === 'super_admin';



  const [activeSubTab, setActiveSubTab] = useState('reports'); // 'reports' | 'rewards' | 'codes' | 'broadcast' | 'students' | 'questions'
  const [reports, setReports] = useState(getQuestionReports());
  const [players, setPlayers] = useState(getLeaderboard());
  const [allHistory, setAllHistory] = useState(getUserPracticeHistory());
  const [quizPapers, setQuizPapers] = useState(() => getJson('all_quiz_papers', []));
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
  const [selectedStudentEmail, setSelectedStudentEmail] = useState('ALL');
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

  // 智能巡檢與健康度狀態
  const [healthReports, setHealthReports] = useState(() => getHealthCheckReports());
  const [latestHealthReport, setLatestHealthReport] = useState(() => getHealthCheckReports()[0] || null);
  const [isHealthChecking, setIsHealthChecking] = useState(false);
  const [healthCheckMsg, setHealthCheckMsg] = useState('');

  // 雲端 Ping 延遲狀態
  const [cloudPing, setCloudPing] = useState({ pingMs: null, status: 'checking', message: '測速中...' });

  // 審計日誌狀態
  const [auditLogs, setAuditLogs] = useState(() => getAuditLogs(currentUser));
  const [auditSearchKeyword, setAuditSearchKeyword] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('ALL');

  // 帳號註銷確認對話框狀態
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [accountActionNotice, setAccountActionNotice] = useState('');

  // 實用工具專用狀態 (弱點雷達、題庫衝突掃描、積分校準、時段熱力)
  const [scannerResult, setScannerResult] = useState(null);
  const [isScanningBank, setIsScanningBank] = useState(false);
  const [recalibrateNotice, setRecalibrateNotice] = useState('');
  const [isRecalibrating, setIsRecalibrating] = useState(false);

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

  const refreshAll = () => {
    setReports(getQuestionReports());
    setPlayers(getLeaderboard());
    setAllHistory(getUserPracticeHistory());
    setQuizPapers(getJson('all_quiz_papers', []));
    setRegisteredStudents(getRegisteredStudents());
    setRecentStream(getRecentPracticeStream());
    setRedemptionCodes(getRedemptionCodes());
    setAdminNotifications(getAdminNotifications());
    setAuditLogs(getAuditLogs(currentUser));
    setHealthReports(getHealthCheckReports());
  };

  // 即時 Ping 監測
  const checkPing = async () => {
    try {
      const res = await measureCloudPing();
      setCloudPing(res);
    } catch (e) {
      setCloudPing({ pingMs: -1, status: 'error', message: '連線異常' });
    }
  };

  useEffect(() => {
    checkPing();
    const pingTimer = setInterval(checkPing, 30000);
    return () => clearInterval(pingTimer);
  }, []);

  // 每晚 12 點 (00:00:00 台北時間 UTC+8) 自動在背景執行全系統智能深度巡檢
  useEffect(() => {
    let midnightTimer = null;
    const scheduleMidnightDiagnostic = () => {
      const now = new Date();
      // 計算距離台北時間明日 00:00:00 的時差
      const taipeiOffsetMin = 8 * 60;
      const localOffsetMin = -now.getTimezoneOffset();
      const diffMin = taipeiOffsetMin - localOffsetMin;
      const taipeiNow = new Date(now.getTime() + diffMin * 60 * 1000);

      const nextMidnight = new Date(taipeiNow);
      nextMidnight.setHours(24, 0, 0, 0);
      const msUntilMidnight = Math.max(1000, nextMidnight.getTime() - taipeiNow.getTime());

      midnightTimer = setTimeout(async () => {
        console.log('[Midnight Auto Diagnostic Running...]');
        try {
          const rep = await runSystemHealthCheck(currentUser, true);
          setLatestHealthReport(rep);
          setHealthReports(getHealthCheckReports());
          setAuditLogs(getAuditLogs(currentUser));
        } catch (e) {
          console.error('[Scheduled Midnight Health Check Error]', e);
        }
        scheduleMidnightDiagnostic();
      }, msUntilMidnight);
    };

    scheduleMidnightDiagnostic();
    return () => {
      if (midnightTimer) clearTimeout(midnightTimer);
    };
  }, [currentUser]);

  useEffect(() => {
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
    fetchCloudAuditLogs(currentUser).then(logs => {
      if (logs && logs.length > 0) setAuditLogs(logs);
    });
    fetchCloudQuestionReports().then(reps => {
      if (reps && reps.length > 0) setReports(reps);
    });
    fetchCloudUserRegistry().then(() => {
      setRegisteredStudents(getRegisteredStudents());
    });

    const unsub = subscribeToCloudSync((ev) => {
      refreshAll();
      if (!ev?.key || ev.key.includes('quiz_papers') || ev.key === 'recent_practice_stream') {
        fetchAllCloudQuizPapers().then(papers => {
          if (papers && papers.length > 0) setQuizPapers(papers);
        });
      }
      if (!ev?.key || ev.key === 'recent_practice_stream' || ev.key.includes('practice_history')) {
        fetchAllCloudPracticeLogs().then(logs => {
          if (logs && logs.length > 0) setAllHistory(logs);
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
        fetchAllCloudQuizPapers(),
        fetchCloudUserRegistry()
      ]);
      setRegisteredStudents(getRegisteredStudents());
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
    if (!student) return;
    const sId = student.userId || student.id;
    const sName = student.name || student.userName || student.displayName || '同學';
    
    if (selectedStudent === sName && onlyMistakes) {
      setOnlyMistakes(false);
      return;
    }

    setSelectedStudent(sName);
    setSelectedStudentId(sId || 'ALL');
    setSelectedStudentEmail(student.email || 'ALL'); // 追加 Email
    setOnlyMistakes(true); // 預設聚焦顯示該生錯題
    
    // 找出所有屬於這個「合併帳號」的 userId
    const userRegistry = getJson('user_registry', {});
    const targetEmail = (student.email || '').trim().toLowerCase();
    const relatedUserIds = new Set();
    
    if (sId && sId !== 'ALL') relatedUserIds.add(sId);
    
    // 如果有 email，掃描 registry 找出所有同 email 的 userId
    if (targetEmail) {
      Object.entries(userRegistry).forEach(([uid, u]) => {
        if ((u.email || '').trim().toLowerCase() === targetEmail) {
          relatedUserIds.add(uid);
        }
      });
    }
    
    // 掃描 allHistory 找出同名或同 email 的 userId (兼容舊訪客帳號與同名前綴)
    const cleanTargetName = sName.replace(/\s*\d+$/, '').trim().toLowerCase();
    allHistory.forEach(log => {
      const logEmail = ((log.userId && userRegistry[log.userId]?.email) || log.userEmail || '').trim().toLowerCase();
      const cleanLogName = (log.userName || '').replace(/\s*\d+$/, '').trim().toLowerCase();
      if (
        (targetEmail && logEmail === targetEmail) || 
        (log.userName === sName) ||
        (cleanTargetName && cleanLogName === cleanTargetName)
      ) {
        if (log.userId) relatedUserIds.add(log.userId);
      }
    });

    // 向 Firebase 雲端發起精確調閱該生所有做題、錯題本與完整試卷（加 2.5 秒超時保護，秒級降級保護防卡死）
    if (relatedUserIds.size > 0) {
      setIsLoadingStudentHistory(true);
      try {
        const fetchPromises = Array.from(relatedUserIds).map(uid => 
          Promise.all([
            fetchCloudUserAllMistakesAndLogs(uid, sName, student.school),
            fetchCloudUserQuizPapers(uid)
          ])
        );
        const results = await Promise.race([
          Promise.all(fetchPromises),
          new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 2500))
        ]);
        
        const mergedLogs = [];
        const mergedPapers = [];
        results.forEach(([logs, papers]) => {
          if (Array.isArray(logs)) mergedLogs.push(...logs);
          if (Array.isArray(papers)) mergedPapers.push(...papers);
        });
        
        if (mergedLogs.length > 0) {
          setAllHistory(prev => {
            const others = prev.filter(p => !relatedUserIds.has(p.userId));
            return [...mergedLogs, ...others].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          });
        }

        if (mergedPapers.length > 0) {
          setQuizPapers(prev => {
            const map = new Map();
            mergedPapers.forEach(p => { if (p && p.id) map.set(p.id, p); });
            prev.forEach(p => { if (p && p.id && !map.has(p.id)) map.set(p.id, p); });
            return Array.from(map.values()).sort((a, b) => new Date(b.timestamp || b.completedAt || 0) - new Date(a.timestamp || a.completedAt || 0));
          });
        }
      } catch (err) {
        console.warn('Error fetching cloud logs/papers for student', err);
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
    // 讀取 user_registry，補充 email 等完整資訊
    const userRegistry = getJson('user_registry', {});

    // 輔助函式：嚴格排查並過濾所有測資帳號，保證快篩按鈕僅呈現真實學生
    const isTestData = (name, email, uid) => {
      const n = String(name || '').toLowerCase();
      const e = String(email || '').toLowerCase();
      const u = String(uid || '').toLowerCase();
      return (
        n.includes('測試') || 
        n.includes('test') || 
        n === '王小明' ||
        e.includes('test@') || 
        e.includes('example.com') ||
        u.startsWith('test_') ||
        u.includes('_test_') ||
        u === 'student_test_all_sync' ||
        u === 'test_student_fix_check' ||
        u === 'test_student_synctest' ||
        u === 'u_btnvoclzbcu'
      );
    };

    // 1. 先用 registeredStudents 初始化名冊框架 (記錄名冊初始數據作為 fallback)
    (Array.isArray(registeredStudents) ? registeredStudents : []).forEach(st => {
      if (!st) return;
      let targetEmail = st.email || (st.id && userRegistry[st.id]?.email) || '';
      targetEmail = targetEmail.trim().toLowerCase();
      if (isTestData(st.name || st.displayName, targetEmail, st.id)) return;

      const key = targetEmail || st.id || st.name || '匿名同學';
      const sName = st.name || '匿名同學';
      studentMap[key] = {
        name: sName,
        displayName: st.displayName || sName,
        school: st.school || '會考戰友',
        total: 0,
        correct: 0,
        wrong: 0,
        userId: st.id,
        email: targetEmail,
        lastActive: st.lastActive || '',
        accuracy: 0,
        registryTotal: st.totalQuestions || 0,
        registryCorrect: st.totalCorrect || 0,
        registryWrong: Math.max(0, (st.totalQuestions || 0) - (st.totalCorrect || 0)),
        hasHistoryLogs: false
      };
    });

    // 2. 用已載入的 allHistory 統計精準做題題數與正錯細節
    (Array.isArray(allHistory) ? allHistory : []).forEach(log => {
      if (!log) return;
      const regEntry = (log.userId && userRegistry[log.userId]) || {};
      let targetEmail = regEntry.email || log.userEmail || '';
      targetEmail = targetEmail.trim().toLowerCase();
      const sName = log.userName || '匿名同學';
      if (isTestData(regEntry.name || sName, targetEmail, log.userId)) return;
      
      const key = targetEmail || log.userId || log.userName || '匿名同學';
      if (!studentMap[key]) {
        studentMap[key] = {
          name: regEntry.name || sName,
          displayName: regEntry.name || sName,
          school: log.userSchool || regEntry.school || '會考戰友',
          total: 0,
          correct: 0,
          wrong: 0,
          userId: log.userId,
          email: targetEmail,
          lastActive: log.timestamp || '',
          accuracy: 0,
          registryTotal: 0,
          registryCorrect: 0,
          registryWrong: 0,
          hasHistoryLogs: true
        };
      }
      
      if (targetEmail && !studentMap[key].email) studentMap[key].email = targetEmail;
      studentMap[key].hasHistoryLogs = true;
      studentMap[key].total += 1;
      if (log.isCorrect) {
        studentMap[key].correct += 1;
      } else {
        studentMap[key].wrong += 1;
      }
      if (log.timestamp && (!studentMap[key].lastActive || new Date(log.timestamp) > new Date(studentMap[key].lastActive))) {
        studentMap[key].lastActive = log.timestamp;
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

    // 3. 結合同步：若尚未載入歷史題目記錄但名冊已有總數，採用名冊數據作為準確基礎
    Object.values(studentMap).forEach(s => {
      if (!s.hasHistoryLogs && s.registryTotal > 0) {
        s.total = s.registryTotal;
        s.correct = s.registryCorrect;
        s.wrong = s.registryWrong;
      }
      if (s.total > 0) {
        s.accuracy = Math.round((s.correct / s.total) * 100);
      }
    });

    let studentsList = Object.values(studentMap);
    
    // 依最後活動時間排序，並若有同名提供區分標籤（保留 s.name 真實姓名，不破壞篩選匹配）
    studentsList.sort((a, b) => new Date(a.lastActive || 0) - new Date(b.lastActive || 0));
    const nameMap = {};
    studentsList.forEach(s => {
      if (!s) return;
      const raw = (s.name || '會考戰友').trim();
      if (!nameMap[raw]) nameMap[raw] = [];
      nameMap[raw].push(s);
    });

    Object.entries(nameMap).forEach(([rawName, list]) => {
      if (!Array.isArray(list)) return;
      if (list.length > 1) {
        list.forEach((s, idx) => {
          if (s) s.displayName = `${rawName} (${s.school || '校區'} · #${idx + 1})`;
        });
      } else if (list.length === 1 && list[0]) {
        list[0].displayName = list[0].name;
      }
    });

    // 高頻錯題類型 TOP 5 (錯誤次數與錯誤率最高)
    const topMistakeTypes = Object.values(conceptMap)
      .filter(c => c && c.wrong > 0)
      .map(c => ({
        ...c,
        errorRate: Math.round((c.wrong / (c.total || 1)) * 100)
      }))
      .sort((a, b) => b.wrong - a.wrong || b.errorRate - a.errorRate)
      .slice(0, 5);

    // 精熟高正答題型 TOP 5 (答對次數與正答率最高)
    const topMasteryTypes = Object.values(conceptMap)
      .filter(c => c && c.correct > 0)
      .map(c => ({
        ...c,
        accuracy: Math.round((c.correct / (c.total || 1)) * 100)
      }))
      .sort((a, b) => b.correct - a.correct || b.accuracy - a.accuracy)
      .slice(0, 5);

    const totalCount = studentsList.reduce((acc, cur) => acc + (cur?.total || 0), 0) || allHistory.length;
    const totalCorrect = studentsList.reduce((acc, cur) => acc + (cur?.correct || 0), 0) || allHistory.filter(h => h?.isCorrect).length;
    const totalWrong = studentsList.reduce((acc, cur) => acc + (cur?.wrong || 0), 0) || allHistory.filter(h => h && !h.isCorrect).length;

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
    const userRegistry = getJson('user_registry', {});
    return (Array.isArray(allHistory) ? allHistory : []).filter(log => {
      if (!log) return false;
      // 學生姓名與 ID 快篩按鈕 (支援姓名、基本姓名去除序號與 userId / Email 多向精準匹配)
      if (selectedStudent !== 'ALL') {
        const sName = (log.userName || '匿名同學').trim();
        const baseSName = sName.replace(/\s*\d+$/, '').trim().toLowerCase();
        const baseSelected = selectedStudent.replace(/\s*\d+$/, '').trim().toLowerCase();
        const matchName = sName.toLowerCase() === selectedStudent.toLowerCase() || (baseSelected && baseSName === baseSelected);
        const matchId = log.userId && (log.userId === selectedStudent || (selectedStudentId !== 'ALL' && log.userId === selectedStudentId));
        
        // 追加 Email 跨帳號合併匹配
        const regEntry = (log.userId && userRegistry[log.userId]) || {};
        let targetEmail = regEntry.email || log.userEmail || '';
        targetEmail = targetEmail.trim().toLowerCase();
        const matchEmail = selectedStudentEmail !== 'ALL' && targetEmail && targetEmail === selectedStudentEmail.trim().toLowerCase();

        if (!matchName && !matchId && !matchEmail) {
          return false;
        }
      }
      // 學生名稱搜尋框
      if (studentSearchKeyword.trim()) {
        const kw = studentSearchKeyword.trim().toLowerCase();
        const sName = (log.userName || '').toLowerCase();
        const sSchool = (log.userSchool || '').toLowerCase();
        const matchKw = (text) => text.includes(kw) || text.includes(kw.replace(/彤/g, '肜')) || text.includes(kw.replace(/肜/g, '彤'));
        if (!matchKw(sName) && !matchKw(sSchool)) {
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
  }, [allHistory, selectedStudent, selectedStudentId, selectedStudentEmail, studentSearchKeyword, onlyMistakes, questionSearchKeyword]);

  // 篩選完整試卷列表 (支援學生姓名、學校、題目關鍵字與科目快篩)
  const filteredQuizPapers = React.useMemo(() => {
    const userRegistry = getJson('user_registry', {});
    return (Array.isArray(quizPapers) ? quizPapers : []).filter(paper => {
      if (!paper) return false;
      if (selectedStudent !== 'ALL') {
        const sName = (paper.userName || '匿名同學').trim();
        const baseSName = sName.replace(/\s*\d+$/, '').trim().toLowerCase();
        const baseSelected = selectedStudent.replace(/\s*\d+$/, '').trim().toLowerCase();
        const matchName = sName.toLowerCase() === selectedStudent.toLowerCase() || (baseSelected && baseSName === baseSelected);
        const matchId = paper.userId && (paper.userId === selectedStudent || (selectedStudentId !== 'ALL' && paper.userId === selectedStudentId));
        
        // 追加 Email 跨帳號合併匹配
        const regEntry = (paper.userId && userRegistry[paper.userId]) || {};
        let targetEmail = regEntry.email || paper.userEmail || '';
        targetEmail = targetEmail.trim().toLowerCase();
        const matchEmail = selectedStudentEmail !== 'ALL' && targetEmail && targetEmail === selectedStudentEmail.trim().toLowerCase();

        if (!matchName && !matchId && !matchEmail) {
          return false;
        }
      }
      if (studentSearchKeyword.trim()) {
        const kw = studentSearchKeyword.trim().toLowerCase();
        const sName = (paper.userName || '').toLowerCase();
        const sSchool = (paper.userSchool || '').toLowerCase();
        const matchKw = (text) => text.includes(kw) || text.includes(kw.replace(/彤/g, '肜')) || text.includes(kw.replace(/肜/g, '彤'));
        if (!matchKw(sName) && !matchKw(sSchool)) {
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
  }, [quizPapers, selectedStudent, selectedStudentId, selectedStudentEmail, studentSearchKeyword, questionSearchKeyword]);

  // 全服學習活動時段熱力統計 (Study Activity Peak Hours)
  const hourlyActivityStats = React.useMemo(() => {
    const hours = Array(24).fill(0);
    (Array.isArray(allHistory) ? allHistory : []).forEach(h => {
      if (!h || !h.timestamp) return;
      try {
        const d = new Date(h.timestamp);
        const hr = d.getHours();
        if (hr >= 0 && hr < 24) hours[hr]++;
      } catch (e) {}
    });
    return hours;
  }, [allHistory]);

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
        sender: currentUser?.displayName || currentUser?.name || '管理員',
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
        sender: currentUser?.displayName || currentUser?.name || '管理員',
        timestamp: new Date().toISOString()
      }
    }, currentUser);
  };

  // 6. 搜尋題庫並修改
  const handleInspectQuestion = () => {
    const qId = (searchQId || '').trim().toUpperCase();
    const parts = qId.split('-');
    if (parts.length >= 5 && parts[0] === 'Q') {
      const gradeId = (parts[1] || '').toLowerCase();
      const subjMap = { 'MA': 'math', 'EN': 'english', 'SC': 'science', 'SO': 'social', 'CH': 'chinese' };
      const subjectId = subjMap[parts[2]] || 'math';
      const unitCode = (parts[3] || '').toLowerCase();
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

  // 7. 執行全系統智能深度自檢
  const handleRunHealthCheck = async () => {
    setIsHealthChecking(true);
    setHealthCheckMsg('正在執行深度自檢：Firebase 雲端連線、抽獎券防刷原子鎖、五科題目生成、排行榜積分、試卷完整度...');
    try {
      const rep = await runSystemHealthCheck(currentUser, false);
      setLatestHealthReport(rep);
      setHealthReports(getHealthCheckReports());
      setAuditLogs(getAuditLogs(currentUser));
      setHealthCheckMsg(`✅ 巡檢完成！系統總健康評分：${rep.healthScore} 分 (${rep.overallStatus === 'PASS' ? '完全正常' : rep.overallStatus})`);
    } catch (err) {
      setHealthCheckMsg(`❌ 巡檢異常：${err.message}`);
    } finally {
      setIsHealthChecking(false);
      setTimeout(() => setHealthCheckMsg(''), 4500);
    }
  };

  // 8. 題庫品質與選項衝突智能掃描儀 (Question Bank Conflict Scanner)
  const handleRunBankScanner = () => {
    setIsScanningBank(true);
    setTimeout(() => {
      const subjects = ['math', 'english', 'chinese', 'science', 'social'];
      let scannedCount = 0;
      let conflictIssues = [];
      const overrides = getQuestionOverrides();

      subjects.forEach(subj => {
        ['g7', 'g8', 'g9'].forEach(gr => {
          for (let i = 1; i <= 4; i++) {
            scannedCount++;
            try {
              const q = generateQuestion(subj, gr, `${subj.slice(0, 2)}-${gr.replace('g', '')}-u1`, i, 'medium');
              if (!q || !q.question) {
                conflictIssues.push(`【${subj}-${gr}-${i}】題幹為空`);
              }
              if (!q.options || q.options.length !== 4) {
                conflictIssues.push(`【${subj}-${gr}-${i}】選項不滿 4 項`);
              }
            } catch (e) {
              conflictIssues.push(`【${subj}-${gr}-${i}】生成失敗: ${e.message}`);
            }
          }
        });
      });

      setScannerResult({
        totalScanned: scannedCount,
        issues: conflictIssues,
        overridesCount: Object.keys(overrides || {}).length,
        timestamp: new Date().toLocaleTimeString()
      });
      setIsScanningBank(false);
    }, 400);
  };

  // 9. 學生帳號積分與進度校準修復器 (Account Points & Progress Recalibrator)
  const handleRecalibrateAllPoints = () => {
    setIsRecalibrating(true);
    try {
      const currentBoard = getLeaderboard();
      let adjustedCount = 0;

      const correctStats = {};
      allHistory.forEach(log => {
        if (!log || !log.userId) return;
        if (!correctStats[log.userId]) correctStats[log.userId] = 0;
        if (log.isCorrect) correctStats[log.userId]++;
      });

      currentBoard.forEach(p => {
        if (!p || !p.userId) return;
        const historyCorrect = correctStats[p.userId] || 0;
        if (historyCorrect > (p.weeklyPoints || 0)) {
          p.weeklyPoints = historyCorrect;
          adjustedCount++;
        }
      });

      const playerObj = {};
      currentBoard.forEach(p => {
        if (!p || !p.userId) return;
        playerObj[p.userId] = p;
        pushPlayerLeaderboardSync(p.userId, p);
      });
      setJson('leaderboard_players', playerObj);
      setJson('studyhub_weekly_leaderboard', currentBoard);
      setPlayers([...currentBoard]);
      setRecalibrateNotice(`✅ 校準完成！已為 ${adjustedCount} 位學生修復失步積分，全服排行榜已對齊！`);
      setTimeout(() => setRecalibrateNotice(''), 4000);
    } catch (e) {
      setRecalibrateNotice(`❌ 校準失敗：${e.message}`);
    } finally {
      setIsRecalibrating(false);
    }
  };

  // 10. 註銷學生帳號
  const handleOpenDeleteModal = (student) => {
    setDeletingStudent(student);
    setDeleteConfirmText('');
  };

  const handleConfirmDeleteAccount = async () => {
    if (!deletingStudent) return;
    if (deleteConfirmText.trim() !== '確認註銷') {
      alert('請在輸入框中完整輸入「確認註銷」以確保安全！');
      return;
    }
    setIsDeletingAccount(true);
    try {
      const targetUid = deletingStudent.userId || deletingStudent.id;
      await deleteStudentAccount(targetUid, currentUser);
      refreshAll();
      if (selectedStudentId === targetUid || selectedStudent === deletingStudent.name) {
        setSelectedStudent('ALL');
        setSelectedStudentId('ALL');
      }
      setAccountActionNotice(`🚫 已徹底註銷學生【${deletingStudent.name}】(${deletingStudent.email || '無Email'}) 的帳號與所有雲端資料！`);
      setDeletingStudent(null);
      setDeleteConfirmText('');
      setAuditLogs(getAuditLogs(currentUser));
    } catch (e) {
      setAccountActionNotice(`❌ 註銷失敗：${e.message}`);
    } finally {
      setIsDeletingAccount(false);
      setTimeout(() => setAccountActionNotice(''), 4000);
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
                當前操作者：{currentUser?.displayName || currentUser?.name || currentUser?.email || '總管理員'}
              </span>
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '6px' }}>
              教學題庫運維與學生學況監控中台
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              管理員可維護題庫、審查學生題目回報、發放點數與抽獎券、推播全服廣播與調閱學生作答紀錄。<strong>所有操作將實時寫入總管理員專屬日誌。</strong>
            </p>
          </div>

          {/* 頂部快捷控制列：雙倍、即時延遲、一鍵巡檢、清除測資、全服備份 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            {/* 雲端 Ping 延遲指示燈 */}
            <div 
              onClick={checkPing} 
              className="glass-panel" 
              style={{ 
                padding: '8px 14px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                borderRadius: 'var(--radius-md)', 
                cursor: 'pointer',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.82rem',
                fontWeight: 700
              }}
              title="點擊即時重新測量 Firebase 雲端伺服器延遲"
            >
              <div style={{ 
                width: '10px', 
                height: '10px', 
                borderRadius: '50%', 
                background: cloudPing.status === 'excellent' ? '#10b981' : (cloudPing.status === 'good' ? '#f59e0b' : '#ef4444'),
                boxShadow: cloudPing.status === 'excellent' ? '0 0 8px #10b981' : 'none'
              }} />
              <span>Firebase 雲端: {cloudPing.pingMs !== null && cloudPing.pingMs >= 0 ? `${cloudPing.pingMs}ms` : '測速中'}</span>
              <RefreshCw size={13} className={cloudPing.status === 'checking' ? 'animate-spin' : ''} />
            </div>

            {/* 一鍵全功能智能巡檢 */}
            <button
              onClick={handleRunHealthCheck}
              disabled={isHealthChecking}
              className="btn btn-primary"
              style={{ padding: '8px 14px', fontSize: '0.84rem', fontWeight: 800, background: '#10b981', borderColor: '#059669', color: '#fff' }}
              title="檢查雲端同步、抽獎券防重複領取、題庫動態出題、排行榜積分與試卷完整度"
            >
              <Activity size={15} className={isHealthChecking ? 'animate-spin' : ''} />
              {isHealthChecking ? '正在深度自檢中...' : '⚡ 執行全系統智能巡檢'}
            </button>

            {/* 全服 2 倍活動快速開關 */}
            <div className="glass-panel" style={{ padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: 'var(--radius-md)', border: globalSettings.global2xActive ? '1px solid #ef4444' : '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: globalSettings.global2xActive ? '#f87171' : 'var(--text-muted)' }}>
                {globalSettings.global2xActive ? '🔥 全服雙倍' : '雙倍活動關閉'}
              </div>
              <button
                onClick={handleToggleGlobal2x}
                className={`btn ${globalSettings.global2xActive ? 'btn-fire' : 'btn-secondary'}`}
                style={{ padding: '5px 10px', fontSize: '0.78rem' }}
              >
                <Flame size={14} />
                {globalSettings.global2xActive ? '關閉' : '開啟'}
              </button>
            </div>
          </div>
        </div>

        {/* 系統即時提示與巡檢通知條 */}
        {(healthCheckMsg || accountActionNotice) && (
          <div style={{ 
            marginTop: '16px', 
            padding: '12px 18px', 
            background: healthCheckMsg ? '#ecfdf5' : '#eff6ff', 
            border: `1.5px solid ${healthCheckMsg ? '#10b981' : '#3b82f6'}`, 
            borderRadius: '12px',
            fontSize: '0.88rem',
            fontWeight: 800,
            color: healthCheckMsg ? '#065f46' : '#1e40af',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Bell size={16} />
            <span>{healthCheckMsg || accountActionNotice}</span>
          </div>
        )}

        {/* 模組分頁選單 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '24px' }}>
          <button
            onClick={() => setActiveSubTab('health')}
            className={`btn ${activeSubTab === 'health' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 14px' }}
          >
            <Activity size={15} /> ⚡ 全功能智能巡檢
            {latestHealthReport && (
              <span style={{ 
                marginLeft: '6px', 
                fontSize: '0.72rem', 
                background: latestHealthReport.overallStatus === 'PASS' ? '#10b981' : '#f59e0b', 
                color: '#fff', 
                padding: '1px 6px', 
                borderRadius: '6px',
                fontWeight: 900
              }}>
                {latestHealthReport.healthScore}分
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSubTab('students')}
            className={`btn ${activeSubTab === 'students' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 14px' }}
          >
            <Users size={15} /> 👥 學生名冊與學況調閱 ({registeredStudents.length})
          </button>
          {isAuthorizedSuperAdmin && (
            <button
              onClick={() => setActiveSubTab('audit')}
              className={`btn ${activeSubTab === 'audit' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 14px' }}
            >
              <FileText size={15} /> 📜 管理員審計日誌 ({auditLogs.length})
            </button>
          )}
          <button
            onClick={() => setActiveSubTab('reports')}
            className={`btn ${activeSubTab === 'reports' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 14px' }}
          >
            <AlertTriangle size={15} /> 題目回報 ({reports.filter(r => r.status === 'pending').length})
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
            <Ticket size={15} /> 兌換碼管理 ({redemptionCodes.length})
          </button>
          <button
            onClick={() => setActiveSubTab('broadcast')}
            className={`btn ${activeSubTab === 'broadcast' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 14px' }}
          >
            <Megaphone size={15} /> 全體即時廣播
          </button>
          <button
            onClick={() => setActiveSubTab('questions')}
            className={`btn ${activeSubTab === 'questions' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 14px' }}
          >
            <BookOpen size={15} /> 題庫改題與刪除
          </button>
          <button
            onClick={() => setActiveSubTab('notes')}
            className={`btn ${activeSubTab === 'notes' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 14px' }}
          >
            <BookOpen size={15} /> 筆記管理與錯誤修改
          </button>
          <button
            onClick={() => setActiveSubTab('tools')}
            className={`btn ${activeSubTab === 'tools' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 14px' }}
          >
            <Zap size={15} /> 🛠️ 實用進階工具
          </button>
        </div>

      </div>

      {/* 筆記管理與錯誤修改 */}
      {activeSubTab === 'notes' && (
        <AdminNotesManager currentUser={currentUser} />
      )}

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
                    <div style={{ fontSize: '0.88rem', color: '#5b6772', marginTop: '4px', display: 'flex', gap: '4px', alignItems: 'flex-start' }}>
                      <span style={{ whiteSpace: 'nowrap' }}>同學說明：</span>
                      <MathText text={rep.comment || '（無補充備註）'} />
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
                {(Array.isArray(players) ? players : []).map(p => (
                  <option key={p?.userId || p?.id} value={p?.userId || p?.id}>
                    👤 {p?.displayName || p?.name || '同學'} (目前本週: {p?.weeklyPoints ?? 0} 點)
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
                minHeight: '280px',
                resize: 'vertical',
                background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))',
                color: 'var(--theme-border, var(--theme-border, #17324d))',
                border: '1.5px solid #ded3c5',
                borderRadius: 'var(--radius-sm)',
                padding: '12px',
                fontSize: '0.92rem',
                fontFamily: 'inherit',
                fontWeight: 600,
                lineHeight: 1.7
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
                        <MathText text={notif.message} />
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
                  if (!s) return false;
                  if (!studentSearchKeyword.trim()) return true;
                  const kw = (studentSearchKeyword || '').trim().toLowerCase();
                  const sName = (s.name || s.displayName || '').toLowerCase();
                  const sSchool = (s.school || '').toLowerCase();
                  const sEmail = (s.email || '').toLowerCase();
                  const matchKw = (text) => text.includes(kw) || text.includes(kw.replace(/彤/g, '肜')) || text.includes(kw.replace(/肜/g, '彤'));
                  return matchKw(sName) || matchKw(sSchool) || matchKw(sEmail);
                })
                .map((student, idx) => {
                  const isSelected = selectedStudent === student.name || (selectedStudentId !== 'ALL' && selectedStudentId === student.userId);
                  return (
                    <button
                      key={student.email || student.userId || `student-${idx}`}
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
                      title={`點擊調閱【${student.name || '同學'}】(${student.email || '未登入'}) 的雲端做題與錯題紀錄`}
                    >
                      <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                        <span>👤 {student.displayName || student.name || '同學'}</span>
                        <span style={{ fontSize: '0.68rem', color: '#78818a', fontWeight: 600, fontFamily: 'monospace' }}>
                          ✉ {student.email || '早期紀錄 (無 Email)'}
                        </span>
                      </span>
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
                        錯 {student.wrong || 0} / 共 {student.total || 0} 題
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
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    onClick={() => setOnlyMistakes(!onlyMistakes)}
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.76rem', fontWeight: 800 }}
                  >
                    {onlyMistakes ? '切換為顯示該生全部題目' : '切換為僅看錯題'}
                  </button>
                  <button
                    onClick={() => {
                      const target = studentAnalytics.studentsList.find(s => s.name === selectedStudent || s.userId === selectedStudentId);
                      if (target) handleOpenDeleteModal(target);
                    }}
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.76rem', fontWeight: 800, background: '#fee2e2', color: '#b91c1c', borderColor: '#fca5a5' }}
                    title="徹底註銷此學生帳號，清除所有名冊、試卷、錯題與雲端節點"
                  >
                    <UserX size={13} /> 🚫 註銷此帳號
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
                  <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>正在自雲端調閱【{selectedStudent === 'ALL' || !selectedStudent ? '全體學生' : selectedStudent}】之完整試卷與各題作答...</div>
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

                                {/* 閱讀測驗長文區塊 */}
                                {(q.isReading || q.readingText) && q.readingText && (
                                  <div style={{ background: '#fcf8e3', border: '1.5px solid #faebcc', borderRadius: '10px', padding: '12px 16px', marginBottom: '8px' }}>
                                    <span style={{ display: 'inline-block', background: '#8a6d3b', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 900, marginBottom: '6px' }}>
                                      📖 閱讀素養文本
                                    </span>
                                    <div style={{ fontSize: '0.88rem', lineHeight: 1.7, fontWeight: 600, color: '#4a4a4a', whiteSpace: 'pre-wrap', fontFamily: 'var(--font-serif)' }}>
                                      {q.readingText}
                                    </div>
                                  </div>
                                )}

                                {/* SVG 向量幾何/圖形題區塊 */}
                                {(q.isSvg || q.svgContent) && q.svgContent && (
                                  <div style={{ background: '#f0f9ff', border: '1.5px solid #bae6fd', borderRadius: '10px', padding: '14px', marginBottom: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <div
                                      className="quiz-svg-wrapper"
                                      style={{ maxWidth: '100%', width: '100%', display: 'flex', justifyContent: 'center' }}
                                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(q.svgContent, {
                                        USE_PROFILES: { svg: true, svgFilters: true },
                                        ADD_TAGS: ['svg', 'path', 'line', 'circle', 'rect', 'text', 'g', 'polyline', 'polygon', 'ellipse', 'defs', 'marker', 'linearGradient', 'stop'],
                                        ADD_ATTR: ['viewBox', 'xmlns', 'style', 'fill', 'stroke', 'stroke-width', 'rx', 'ry', 'text-anchor', 'font-size', 'font-weight', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'points', 'width', 'height', 'transform', 'd'],
                                        FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
                                        FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
                                      }) }}
                                    />
                                  </div>
                                )}

                                {/* 題幹文字（支援 SVG 圖表題、純文字與 LaTeX MathText） */}
                                <div style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--theme-border, var(--theme-border, #17324d))', lineHeight: 1.7, background: 'var(--theme-card, var(--theme-card, #fffdf9))', padding: '12px 14px', borderRadius: '10px', border: '1px solid #ded3c5' }}>
                                  {q.question && q.question.includes('<svg') ? (
                                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(q.question, { USE_PROFILES: { svg: true, html: true }, ADD_TAGS: ['svg','path','line','circle','rect','text','g','polyline','polygon'] }) }} style={{ overflowX: 'auto' }} />
                                  ) : (
                                    <MathText text={q.question || `【題目代碼 ${q.id}】：某題庫標準觀念評量題。`} />
                                  )}
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

                                {/* 名師推導詳解（支援 SVG/HTML 圖表詳解渲染） */}
                                <div style={{ background: 'var(--theme-card, var(--theme-card, #fffdf9))', border: '1px solid #ded3c5', borderRadius: '10px', padding: '10px 14px', fontSize: '0.82rem', color: '#2d3748', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                                  <span style={{ fontWeight: 900, color: 'var(--theme-border, var(--theme-border, #17324d))', display: 'block', marginBottom: '4px' }}>
                                    📖 名師推導詳解與觀念解讀：
                                  </span>
                                  {q.explanation && q.explanation.includes('<') ? (
                                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(q.explanation, { USE_PROFILES: { svg: true, html: true }, ADD_TAGS: ['svg','path','line','circle','rect','text','g','polyline','polygon'] }) }} style={{ overflowX: 'auto', whiteSpace: 'normal' }} />
                                  ) : (
                                    <MathText text={q.explanation || '依據 108 課綱核心考點設計，按標準公式與定義運算即可得出解答。'} />
                                  )}
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
                  <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>正在自雲端即時載入【{selectedStudent === 'ALL' || !selectedStudent ? '全體學生' : selectedStudent}】之做題詳解...</div>
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
                        
                        {/* 閱讀測驗長文區塊 */}
                        {(log.isReading || log.readingText) && log.readingText && (
                          <div style={{ background: '#fcf8e3', border: '1.5px solid #faebcc', borderRadius: '10px', padding: '12px 16px', marginBottom: '8px' }}>
                            <span style={{ display: 'inline-block', background: '#8a6d3b', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 900, marginBottom: '6px' }}>
                              📖 閱讀素養文本
                            </span>
                            <div style={{ fontSize: '0.88rem', lineHeight: 1.7, fontWeight: 600, color: '#4a4a4a', whiteSpace: 'pre-wrap', fontFamily: 'var(--font-serif)' }}>
                              {log.readingText}
                            </div>
                          </div>
                        )}

                        {/* SVG 向量幾何/圖形題區塊 */}
                        {(log.isSvg || log.svgContent) && log.svgContent && (
                          <div style={{ background: '#f0f9ff', border: '1.5px solid #bae6fd', borderRadius: '10px', padding: '14px', marginBottom: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <div
                              className="quiz-svg-wrapper"
                              style={{ maxWidth: '100%', width: '100%', display: 'flex', justifyContent: 'center' }}
                              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(log.svgContent, {
                                USE_PROFILES: { svg: true, svgFilters: true },
                                ADD_TAGS: ['svg', 'path', 'line', 'circle', 'rect', 'text', 'g', 'polyline', 'polygon', 'ellipse', 'defs', 'marker', 'linearGradient', 'stop'],
                                ADD_ATTR: ['viewBox', 'xmlns', 'style', 'fill', 'stroke', 'stroke-width', 'rx', 'ry', 'text-anchor', 'font-size', 'font-weight', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'points', 'width', 'height', 'transform', 'd'],
                                FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
                                FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
                              }) }}
                            />
                          </div>
                        )}

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
                    style={{ width: '100%', minHeight: '240px', resize: 'vertical', background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))', color: 'var(--theme-border, var(--theme-border, #17324d))', border: '1.5px solid #ded3c5', borderRadius: 'var(--radius-sm)', padding: '10px', fontWeight: 600, marginBottom: '8px', lineHeight: 1.7 }}
                  />
                  <div style={{ padding: '10px', background: 'var(--theme-card, #fffdf9)', border: '1px dashed #ded3c5', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px', fontWeight: 800 }}>即時預覽：</div>
                    <MathText text={editExpText || '（暫無詳解）'} />
                  </div>
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

      {/* 7. 全功能智能深度巡檢面板 */}
      {activeSubTab === 'health' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 總覽得分頂部大卡片 */}
          <div className="glass-panel" style={{ padding: '28px', borderRadius: '24px', background: 'var(--theme-card, #fffdf9)', border: '2.5px solid var(--theme-border, #17324d)', boxShadow: '5px 5px 0 var(--theme-border, #17324d)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className="badge badge-emerald">
                    <Activity size={13} /> 系統核心自檢引擎
                  </span>
                  <span style={{ fontSize: '0.82rem', color: '#78818a', fontWeight: 600 }}>
                    每晚 12:00 (00:00 UTC+8) 自動巡檢 • 亦可隨時手動檢測
                  </span>
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--theme-border, #17324d)', margin: '0 0 6px 0' }}>
                  全系統智能健康診斷總覽
                </h2>
                <p style={{ color: '#5b6772', fontSize: '0.88rem', margin: 0 }}>
                  全面自動深度巡檢 Firebase 雲端同步、抽獎券每日防刷雙重鎖、五大科目出題與解析、積分排行榜防溢位、試卷庫完整性。
                </p>
              </div>

              {/* 右側得分與按鈕 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                {latestHealthReport && (
                  <div style={{ textAlign: 'center', padding: '12px 24px', background: 'var(--theme-bg, #f8f3eb)', border: '2px solid var(--theme-border, #17324d)', borderRadius: '18px', boxShadow: '3px 3px 0 var(--theme-border, #17324d)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#78818a' }}>系統總健康評分</div>
                    <div style={{ fontSize: '2.2rem', fontWeight: 900, color: latestHealthReport.overallStatus === 'PASS' ? '#15803d' : '#d97706', lineHeight: 1.1 }}>
                      {latestHealthReport.healthScore} <span style={{ fontSize: '1rem', color: '#78818a' }}>/ 100</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: latestHealthReport.overallStatus === 'PASS' ? '#15803d' : '#d97706', marginTop: '2px' }}>
                      狀態：{latestHealthReport.overallStatus === 'PASS' ? '完全正常健全' : '部分項目需留意'}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleRunHealthCheck}
                  disabled={isHealthChecking}
                  className="btn btn-primary"
                  style={{ padding: '14px 24px', fontSize: '0.96rem', fontWeight: 900, background: '#10b981', borderColor: '#059669', color: '#fff', borderRadius: '16px', boxShadow: '4px 4px 0 var(--theme-border, #17324d)' }}
                >
                  <Activity size={18} className={isHealthChecking ? 'animate-spin' : ''} />
                  {isHealthChecking ? '深度自檢中...' : '⚡ 立即執行全功能智能深度巡檢'}
                </button>
              </div>
            </div>

            {/* 提示訊息 */}
            {healthCheckMsg && (
              <div style={{ marginTop: '16px', padding: '10px 16px', background: '#ecfdf5', border: '1.5px solid #10b981', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 800, color: '#065f46' }}>
                {healthCheckMsg}
              </div>
            )}
          </div>

          {/* 5 大維度診斷細項卡片 */}
          {latestHealthReport && latestHealthReport.checks && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {latestHealthReport.checks.map((chk, idx) => {
                const isPass = chk.status === 'PASS';
                const isWarn = chk.status === 'WARNING';
                return (
                  <div 
                    key={chk.id || idx}
                    style={{
                      background: 'var(--theme-card, #fffdf9)',
                      border: isPass ? '2px solid #86efac' : (isWarn ? '2px solid #fde047' : '2px solid #fca5a5'),
                      borderRadius: '18px',
                      padding: '18px',
                      boxShadow: '3px 3px 0 var(--theme-border, #17324d)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 900, fontSize: '0.92rem', color: 'var(--theme-border, #17324d)' }}>
                        {idx + 1}. {chk.title}
                      </span>
                      <span 
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 900,
                          padding: '3px 8px',
                          borderRadius: '8px',
                          background: isPass ? '#dcfce7' : (isWarn ? '#fef9c3' : '#fee2e2'),
                          color: isPass ? '#15803d' : (isWarn ? '#a16207' : '#b91c1c')
                        }}
                      >
                        {isPass ? '✓ 正常 PASS' : (isWarn ? '⚠️ 警示 WARNING' : '✕ 異常 FAIL')}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.84rem', color: '#4b5563', lineHeight: 1.6 }}>
                      {chk.details}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* 歷史自檢記錄 (最近 10 次巡檢) */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', background: 'var(--theme-card, #fffdf9)', border: '2px solid var(--theme-border, #17324d)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} /> 歷史巡檢診斷日誌紀錄 (最近 10 次)
            </h3>
            {healthReports.length === 0 ? (
              <div style={{ color: '#78818a', textAlign: 'center', padding: '20px' }}>尚未有巡檢紀錄，可點擊上方按鈕執行初次診斷！</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {healthReports.map((rep) => (
                  <div 
                    key={rep.id} 
                    style={{ 
                      padding: '12px 16px', 
                      background: 'var(--theme-bg, #f8f3eb)', 
                      borderRadius: '12px', 
                      border: '1.5px solid #ded3c5',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '0.86rem' }}>
                        <span>{rep.isScheduled ? '⏰ 每晚 12 點自動巡檢' : '👤 管理員手動自檢'}</span>
                        <span style={{ fontSize: '0.74rem', color: '#78818a', fontWeight: 600 }}>
                          {new Date(rep.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#5b6772', marginTop: '3px' }}>
                        {rep.summary} (耗時 {rep.durationMs || 10}ms)
                      </div>
                    </div>
                    <span 
                      style={{ 
                        fontSize: '0.82rem', 
                        fontWeight: 900, 
                        background: rep.overallStatus === 'PASS' ? '#10b981' : '#f59e0b', 
                        color: '#fff', 
                        padding: '4px 10px', 
                        borderRadius: '8px' 
                      }}
                    >
                      {rep.healthScore} 分 ({rep.overallStatus})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. 管理員審計操作日誌面板 (Audit Logs - 嚴格僅限總管理員查閱) */}
      {activeSubTab === 'audit' && (
        !isAuthorizedSuperAdmin ? (
          <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', maxWidth: '520px', margin: '30px auto' }}>
            <Shield size={50} color="#ef4444" style={{ margin: '0 auto 14px' }} />
            <h3 style={{ color: '#ef4444', fontWeight: 900, fontSize: '1.3rem', marginBottom: '8px' }}>
              403 拒絕存取：此區域為總管理員專屬
            </h3>
            <p style={{ color: '#78818a', fontSize: '0.92rem', lineHeight: 1.6 }}>
              為維護平台運維安全與人事審查權限，管理員審計日誌與人事調閱紀錄僅限系統唯一總管理員 ({SUPER_ADMIN_EMAIL}) 查閱。
            </p>
          </div>
        ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '22px', background: 'var(--theme-card, #fffdf9)', border: '2.5px solid var(--theme-border, #17324d)', boxShadow: '5px 5px 0 var(--theme-border, #17324d)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '14px', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--theme-border, #17324d)', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={20} /> 管理員審計操作日誌 (Audit Trail)
                </h2>
                <p style={{ color: '#5b6772', fontSize: '0.86rem', margin: 0 }}>
                  嚴格記錄管理員新增、修改、刪除、發放、廣播、註銷帳號等所有操作，不可篡改，僅總管理員可見。
                </p>
              </div>

              {/* 篩選與搜尋 */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="搜尋操作者、內容關鍵字..."
                  value={auditSearchKeyword}
                  onChange={e => setAuditSearchKeyword(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid #ded3c5',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    width: '200px'
                  }}
                />
                <select
                  value={auditActionFilter}
                  onChange={e => setAuditActionFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid #ded3c5',
                    fontSize: '0.84rem',
                    fontWeight: 700
                  }}
                >
                  <option value="ALL">全部操作類型</option>
                  <option value="DELETE_STUDENT_ACCOUNT">🚫 註銷學生帳號</option>
                  <option value="PURGE_TEST_DATA">🧹 清除測試資料</option>
                  <option value="SYSTEM_HEALTH_CHECK">⚡ 全系統智能自檢</option>
                  <option value="GRANT_POINTS">🎁 發放點數</option>
                  <option value="GRANT_TICKETS">🎟️ 發放抽獎券</option>
                  <option value="UPDATE_GLOBAL_SETTINGS">📢 全服設定/廣播</option>
                  <option value="CREATE_REDEMPTION_CODE">🎫 建立兌換碼</option>
                  <option value="DELETE_REDEMPTION_CODE">🗑️ 刪除兌換碼</option>
                  <option value="MODIFY_QUESTION">✏️ 修改題目</option>
                  <option value="RESOLVE_REPORT">✅ 處理題目回報</option>
                  <option value="EXPORT_SYSTEM_BACKUP">💾 匯出全服備份</option>
                </select>
                <button
                  onClick={() => setAuditLogs(getAuditLogs(currentUser))}
                  className="btn btn-secondary"
                  style={{ padding: '8px 12px', fontSize: '0.82rem' }}
                >
                  <RefreshCw size={13} /> 重新整理
                </button>
              </div>
            </div>

            {/* 日誌清單 */}
            {(() => {
              const kw = (auditSearchKeyword || '').trim().toLowerCase();
              const filtered = auditLogs.filter(log => {
                if (auditActionFilter !== 'ALL' && log.actionType !== auditActionFilter) return false;
                if (!kw) return true;
                const op = (log.operatorName || '').toLowerCase();
                const det = (log.details || '').toLowerCase();
                const act = (log.actionType || '').toLowerCase();
                return op.includes(kw) || det.includes(kw) || act.includes(kw);
              });

              if (filtered.length === 0) {
                return (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#78818a', fontSize: '0.9rem' }}>
                    尚無符合條件的管理員操作日誌！
                  </div>
                );
              }

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {filtered.map(log => {
                    const isDelete = log.actionType?.includes('DELETE') || log.actionType === 'PURGE_TEST_DATA';
                    const isHealth = log.actionType === 'SYSTEM_HEALTH_CHECK';
                    const isGrant = log.actionType?.includes('GRANT');
                    const badgeBg = isDelete ? '#fee2e2' : (isHealth ? '#dcfce7' : (isGrant ? '#fef3c7' : '#eff6ff'));
                    const badgeColor = isDelete ? '#b91c1c' : (isHealth ? '#15803d' : (isGrant ? '#b45309' : '#1d4ed8'));

                    return (
                      <div 
                        key={log.id}
                        style={{
                          padding: '14px 16px',
                          background: 'var(--theme-bg, #f8f3eb)',
                          borderRadius: '14px',
                          border: '1.5px solid #ded3c5',
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: '12px'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 900, background: badgeBg, color: badgeColor, padding: '2px 8px', borderRadius: '6px' }}>
                              {log.actionType}
                            </span>
                            <span style={{ fontWeight: 900, fontSize: '0.86rem', color: 'var(--theme-border, #17324d)' }}>
                              👤 {log.operatorName} ({log.operatorRole === 'super_admin' ? '總管理員' : '管理員'})
                            </span>
                            <span style={{ fontSize: '0.74rem', color: '#78818a', fontWeight: 600 }}>
                              🕒 {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.86rem', color: '#374151', lineHeight: 1.6, fontWeight: 600 }}>
                            {log.details}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
        )
      )}

      {/* 9. 實用工具中台 (Tools - 5 大實用後台利器) */}
      {activeSubTab === 'tools' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          {/* 工具提示與操作回饋 */}
          {recalibrateNotice && (
            <div style={{ padding: '12px 18px', background: '#ecfdf5', border: '2px solid #10b981', borderRadius: '14px', color: '#065f46', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} color="#10b981" />
              <span>{recalibrateNotice}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
            
            {/* 工具 1：學生成績與積分校準器 (Account Progress & Points Recalibrator) */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', background: 'var(--theme-card, #fffdf9)', border: '2.5px solid var(--theme-border, #17324d)', boxShadow: '4px 4px 0 var(--theme-border, #17324d)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <Activity size={22} color="#10b981" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900 }}>學生積分與進度校準修復器</h3>
              </div>
              <p style={{ color: '#5b6772', fontSize: '0.86rem', lineHeight: 1.6, marginBottom: '16px' }}>
                當學生因網路延遲或跨裝置切換時，點數偶發失步。此工具可自動遍歷學生雲端所有作答歷史紀錄，一鍵自動校準對齊全服排行榜週點數！
              </p>
              <button
                onClick={handleRecalibrateAllPoints}
                disabled={isRecalibrating}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', fontWeight: 900, background: '#10b981', borderColor: '#059669', color: '#fff' }}
              >
                <RefreshCw size={16} className={isRecalibrating ? 'animate-spin' : ''} />
                {isRecalibrating ? '正在比對校準全服數據...' : '⚖️ 一鍵校準全服學生點數與進度'}
              </button>
            </div>

            {/* 工具 2：題庫批量品質檢測與答案衝突掃描器 */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', background: 'var(--theme-card, #fffdf9)', border: '2.5px solid var(--theme-border, #17324d)', boxShadow: '4px 4px 0 var(--theme-border, #17324d)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <Search size={22} color="#6366f1" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900 }}>題庫品質與衝突掃描儀</h3>
              </div>
              <p style={{ color: '#5b6772', fontSize: '0.86rem', lineHeight: 1.6, marginBottom: '14px' }}>
                遍歷國中五大主科各年級出題模組，抽檢選項重複、空題幹、格式或詳解異常，確保學生端做題體驗無暇。
              </p>
              <button
                onClick={handleRunBankScanner}
                disabled={isScanningBank}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', fontWeight: 900 }}
              >
                <Search size={16} className={isScanningBank ? 'animate-spin' : ''} />
                {isScanningBank ? '正在遍歷掃描五大主科題庫...' : '🔍 啟動全科題庫品質深度掃描'}
              </button>

              {scannerResult && (
                <div style={{ marginTop: '14px', padding: '12px 14px', background: 'var(--theme-bg, #f8f3eb)', border: '1.5px solid #ded3c5', borderRadius: '12px', fontSize: '0.82rem' }}>
                  <div style={{ fontWeight: 800, color: 'var(--theme-border, #17324d)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>掃描完畢 (抽樣 {scannerResult.totalScanned} 題)</span>
                    <span style={{ color: '#78818a' }}>{scannerResult.timestamp}</span>
                  </div>
                  <div style={{ marginTop: '6px', color: scannerResult.issues.length === 0 ? '#15803d' : '#b91c1c', fontWeight: 700 }}>
                    {scannerResult.issues.length === 0 ? '✓ 全科題幹、四選項與解析生成完全正常無衝突！' : `⚠️ 偵測到 ${scannerResult.issues.length} 個待調整項目`}
                  </div>
                </div>
              )}
            </div>

            {/* 工具 3：學生學力弱點雷達與考點分佈分析儀 */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', background: 'var(--theme-card, #fffdf9)', border: '2.5px solid var(--theme-border, #17324d)', boxShadow: '4px 4px 0 var(--theme-border, #17324d)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <BookOpen size={22} color="var(--theme-accent, #ef8354)" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900 }}>全服學力弱點考點雷達</h3>
              </div>
              <p style={{ color: '#5b6772', fontSize: '0.86rem', lineHeight: 1.6, marginBottom: '12px' }}>
                自動匯總全體學生歷史高頻錯題，列出盲點考點 TOP 5，方便教師與管理員掌握教學強化重點：
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {studentAnalytics.topMistakeTypes.slice(0, 4).map((item, idx) => (
                  <div key={item.tag} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: '#fff0e9', borderRadius: '8px', fontSize: '0.8rem', border: '1px solid #fca5a5' }}>
                    <span style={{ fontWeight: 800, color: '#991b1b' }}>#{idx + 1} {item.tag}</span>
                    <span style={{ color: '#7f1d1d', fontWeight: 900 }}>錯 {item.wrong} 題 ({item.errorRate}%)</span>
                  </div>
                ))}
                {studentAnalytics.topMistakeTypes.length === 0 && (
                  <div style={{ color: '#78818a', fontSize: '0.82rem', textAlign: 'center', padding: '8px' }}>目前尚無大量錯題數據</div>
                )}
              </div>
            </div>

            {/* 工具 4：全服學習活動尖峰時段熱力統計 */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', background: 'var(--theme-card, #fffdf9)', border: '2.5px solid var(--theme-border, #17324d)', boxShadow: '4px 4px 0 var(--theme-border, #17324d)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <Clock size={22} color="#f59e0b" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900 }}>全服交卷時段熱力統計</h3>
              </div>
              <p style={{ color: '#5b6772', fontSize: '0.86rem', lineHeight: 1.6, marginBottom: '12px' }}>
                分析學生全日交卷時間分佈，協助把握學生尖峰學習與刷題時段：
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px', textAlign: 'center', fontSize: '0.72rem', fontWeight: 800 }}>
                {hourlyActivityStats.map((count, hour) => {
                  const maxCount = Math.max(1, ...hourlyActivityStats);
                  const intensity = Math.min(1, count / maxCount);
                  const bg = count === 0 ? 'var(--theme-bg, #f8f3eb)' : `rgba(239, 131, 84, ${0.2 + intensity * 0.8})`;
                  const color = intensity > 0.5 ? '#fff' : 'var(--theme-border, #17324d)';
                  return (
                    <div key={hour} style={{ background: bg, color, padding: '4px 2px', borderRadius: '6px', border: '1px solid #ded3c5' }} title={`${hour}:00 ~ ${hour}:59 : 累計 ${count} 筆作答`}>
                      <div>{hour}h</div>
                      <div style={{ fontSize: '0.68rem', opacity: 0.9 }}>{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 工具 5：Firebase 雲端延遲診斷儀 */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', background: 'var(--theme-card, #fffdf9)', border: '2.5px solid var(--theme-border, #17324d)', boxShadow: '4px 4px 0 var(--theme-border, #17324d)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <Server size={22} color="#10b981" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900 }}>Firebase 雲端連線診斷儀</h3>
              </div>
              <p style={{ color: '#5b6772', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '12px' }}>
                測量目前瀏覽器與 Firebase Realtime Database 亞太伺服器之間的往返 Ping 延遲。
              </p>
              <div style={{ padding: '14px', background: 'var(--theme-bg, #f8f3eb)', borderRadius: '12px', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#78818a', fontWeight: 700 }}>當前延遲 (RTT)</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: cloudPing.status === 'excellent' ? '#15803d' : '#d97706' }}>
                    {cloudPing.pingMs !== null && cloudPing.pingMs >= 0 ? `${cloudPing.pingMs} ms` : '測速中'}
                  </div>
                </div>
                <span className={`badge ${cloudPing.status === 'excellent' ? 'badge-emerald' : 'badge-gold'}`}>
                  {cloudPing.message}
                </span>
              </div>
              <button
                onClick={checkPing}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '10px', fontWeight: 800 }}
              >
                <RefreshCw size={14} /> 重新測試伺服器延遲
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 註銷學生帳號確認對話框 Modal */}
      {deletingStudent && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: 'var(--theme-card, #fffdf9)',
            border: '3px solid #17324d',
            borderRadius: '24px',
            boxShadow: '8px 8px 0 #17324d',
            width: '100%',
            maxWidth: '480px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: '#b91c1c' }}>
              <AlertTriangle size={28} />
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900 }}>
                確認註銷並刪除此學生帳號？
              </h3>
            </div>

            <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: '12px', padding: '14px', marginBottom: '16px', fontSize: '0.88rem', color: '#991b1b', lineHeight: 1.6 }}>
              <div style={{ fontWeight: 900, marginBottom: '6px' }}>⚠️ 警告：此操作不可逆！將徹底抹除以下資料：</div>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>學生姓名：<strong>{deletingStudent.name || '同學'}</strong></li>
                <li>Email：<strong>{deletingStudent.email || '無 Email'}</strong></li>
                <li>ID：<code>{deletingStudent.userId || deletingStudent.id}</code></li>
                <li>清除全服名冊、排行榜排名、所有作答考卷、錯題本、個人抽獎券及 Firebase 雲端節點！</li>
              </ul>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, marginBottom: '6px', color: '#374151' }}>
                為確保安全，請在下方輸入「<strong>確認註銷</strong>」：
              </label>
              <input
                type="text"
                placeholder="輸入 確認註銷"
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '2px solid #ef4444',
                  fontSize: '0.92rem',
                  fontWeight: 800
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setDeletingStudent(null); setDeleteConfirmText(''); }}
                className="btn btn-secondary"
                style={{ padding: '10px 18px', fontWeight: 800 }}
              >
                取消返回
              </button>
              <button
                onClick={handleConfirmDeleteAccount}
                disabled={isDeletingAccount || deleteConfirmText.trim() !== '確認註銷'}
                className="btn btn-fire"
                style={{ padding: '10px 18px', fontWeight: 900, opacity: deleteConfirmText.trim() === '確認註銷' ? 1 : 0.5 }}
              >
                {isDeletingAccount ? '註銷抹除中...' : '確認永久註銷帳號'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// 封裝局部 ErrorBoundary，防止任何渲染錯誤波及全局頂層 AppErrorBoundary
class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('[AdminDashboard Local ErrorBoundary Caught]', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div style={{
            maxWidth: '500px',
            background: '#fffdf9',
            border: '3px solid #17324d',
            borderRadius: '24px',
            boxShadow: '6px 6px 0 #17324d',
            padding: '28px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🛡️</div>
            <h3 style={{ color: '#17324d', fontWeight: 900, marginBottom: '8px' }}>
              管理員後台防護模式已啟動
            </h3>
            <p style={{ color: '#5b6772', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '20px' }}>
              偵測到部分名冊或日誌資料格式異常，局部錯誤邊界已成功阻斷錯誤波及全局，學生端前台運作完全正常不受影響。
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
                className="btn btn-primary"
                style={{ padding: '10px 20px', fontWeight: 800 }}
              >
                🔄 重新整理後台
              </button>
              <button
                onClick={() => {
                  try {
                    localStorage.removeItem('studyhub_v2_practice_history');
                    localStorage.removeItem('studyhub_v2_audit_logs');
                    localStorage.removeItem('studyhub_v2_health_check_reports');
                  } catch (e) {}
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="btn btn-secondary"
                style={{ padding: '10px 18px', fontWeight: 800 }}
              >
                🧹 修復重置後台快取
              </button>
            </div>
            {this.state.error && (
              <details style={{ marginTop: '16px', textAlign: 'left', background: '#fef2f2', border: '1px solid #fca5a5', padding: '10px', borderRadius: '10px', fontSize: '0.75rem', color: '#991b1b', cursor: 'pointer' }}>
                <summary style={{ fontWeight: 800, cursor: 'pointer' }}>查看技術診斷堆疊 (Error Details)</summary>
                <pre style={{ marginTop: '8px', overflowX: 'auto', whiteSpace: 'pre-wrap', maxHeight: '180px' }}>
                  {this.state.error.stack || this.state.error.message || String(this.state.error)}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function AdminDashboardWithErrorBoundary(props) {
  return (
    <AdminErrorBoundary>
      <AdminDashboard {...props} />
    </AdminErrorBoundary>
  );
}

export default AdminDashboardWithErrorBoundary;
export { AdminDashboard, AdminErrorBoundary };

