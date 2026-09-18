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
  getRedemptionCodes,
  addRedemptionCode,
  deleteRedemptionCode,
  getCommunityPosts,
  deleteCommunityPost,
  getCommunityReports,
  resolveCommunityReport,
  getAdminNotifications,
  deleteAdminNotification,
  subscribeToCloudSync
} from '../services/cloudStorage';
import { 
  adminGrantPoints, 
  adminGrantTickets, 
  getLeaderboard 
} from '../services/leaderboardService';
import { generateQuestion } from '../data/questionGenerator';
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
  MessageSquareHeart, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw, 
  Bell, 
  Flag,
  X 
} from 'lucide-react';

export default function AdminDashboard() {
  const { currentUser } = useAuth();
  const { globalSettings } = useGame();

  const [activeSubTab, setActiveSubTab] = useState('reports'); // 'reports' | 'rewards' | 'codes' | 'broadcast' | 'students' | 'questions' | 'community'
  const [reports, setReports] = useState(getQuestionReports());
  const [players, setPlayers] = useState(getLeaderboard());
  const [allHistory, setAllHistory] = useState(getUserPracticeHistory());
  const [redemptionCodes, setRedemptionCodes] = useState(getRedemptionCodes());
  const [communityPosts, setCommunityPosts] = useState(getCommunityPosts());
  const [communityReports, setCommunityReports] = useState(getCommunityReports());
  const [communitySubView, setCommunitySubView] = useState('pending'); // 'pending' | 'all_posts' | 'resolved'
  const [adminNotifications, setAdminNotifications] = useState(getAdminNotifications());

  // 學生歷程調閱與搜尋狀態
  const [selectedStudent, setSelectedStudent] = useState('ALL');
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
      setRedemptionCodes(getRedemptionCodes());
      setCommunityPosts(getCommunityPosts());
      setCommunityReports(getCommunityReports());
      setAdminNotifications(getAdminNotifications());
    };
    refreshAll();

    const unsub = subscribeToCloudSync(() => {
      refreshAll();
    });
    return () => unsub();
  }, []);

  // 刪除打氣留言
  const handleDeleteCommunityPost = (postId) => {
    if (!window.confirm('確定要刪除這則打氣留言嗎？將同步寫入總管審計日誌。')) return;
    deleteCommunityPost(postId, currentUser);
    setCommunityPosts(getCommunityPosts());
  };

  // 審核學生檢舉之打氣留言 (下架刪除或駁回保留)
  const handleResolveCommunityReport = (reportId, decision) => {
    const isDel = decision === 'delete';
    const confirmMsg = isDel
      ? '確定判定此留言違規屬實並自全站下架刪除嗎？（將同步自打氣牆移除並記錄於審計日誌）'
      : '確定判定此留言未違規，駁回檢舉並予以保留嗎？';
    if (!window.confirm(confirmMsg)) return;

    resolveCommunityReport(reportId, decision, currentUser);
    setCommunityReports(getCommunityReports());
    setCommunityPosts(getCommunityPosts());
  };

  // 刪除系統公告與通知
  const handleDeleteNotification = (notifId) => {
    if (!window.confirm('確定要刪除這則系統公告嗎？刪除後學生端通知中心將即時同步移除。')) return;
    deleteAdminNotification(notifId, currentUser);
    setAdminNotifications(getAdminNotifications());
  };

  // 統計所有學生的對錯題類型分析
  const studentAnalytics = React.useMemo(() => {
    const studentMap = {};
    const conceptMap = {};

    allHistory.forEach(log => {
      const sName = log.userName || '匿名同學';
      if (!studentMap[sName]) {
        studentMap[sName] = {
          name: sName,
          school: log.userSchool || '會考戰友',
          total: 0,
          correct: 0,
          wrong: 0,
          userId: log.userId
        };
      }
      studentMap[sName].total += 1;
      if (log.isCorrect) {
        studentMap[sName].correct += 1;
      } else {
        studentMap[sName].wrong += 1;
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

    return {
      studentsList,
      topMistakeTypes,
      topMasteryTypes,
      totalCount: allHistory.length,
      totalCorrect: allHistory.filter(h => h.isCorrect).length,
      totalWrong: allHistory.filter(h => !h.isCorrect).length
    };
  }, [allHistory]);

  // 篩選做題紀錄列表
  const filteredPracticeLogs = React.useMemo(() => {
    return allHistory.filter(log => {
      // 學生姓名快篩按鈕
      if (selectedStudent !== 'ALL') {
        const sName = log.userName || '匿名同學';
        if (sName !== selectedStudent && log.userId !== selectedStudent) {
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
  }, [allHistory, selectedStudent, studentSearchKeyword, onlyMistakes, questionSearchKeyword]);

  // 點擊學生名字按鈕：按下去後立即顯示該學生的所有錯題
  const handleStudentChipClick = (studentName) => {
    if (selectedStudent === studentName && onlyMistakes) {
      setOnlyMistakes(false);
    } else {
      setSelectedStudent(studentName);
      setOnlyMistakes(true);
    }
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
    // 演算法生成或取得現有題
    const sample = generateQuestion('math', 'g7', 'ma-7-u1', 1, 'medium');
    sample.id = searchQId.trim();
    setInspectedQuestion(sample);
    setEditAnsIdx(sample.answer);
    setEditExpText(sample.explanation);
    setQActionMsg('');
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
          <button
            onClick={() => setActiveSubTab('community')}
            className={`btn ${activeSubTab === 'community' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <MessageSquareHeart size={15} /> 
            打氣留言與檢舉審核
            {communityReports.filter(r => r.status === 'pending').length > 0 && (
              <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.72rem', padding: '1px 6px', borderRadius: '10px', fontWeight: 800 }}>
                {communityReports.filter(r => r.status === 'pending').length} 待審
              </span>
            )}
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
                      <strong style={{ color: '#17324d', fontSize: '0.95rem' }}>題號: {rep.questionId}</strong>
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
                style={{ width: '100%', padding: '10px', background: '#f8f3eb', color: '#17324d', border: '1.5px solid #ded3c5', borderRadius: 'var(--radius-sm)', fontWeight: 700 }}
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
                  style={{ width: '100px', padding: '8px', background: '#f8f3eb', color: '#17324d', border: '1.5px solid #ded3c5', borderRadius: 'var(--radius-sm)', fontWeight: 700 }}
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
                  style={{ width: '100px', padding: '8px', background: '#f8f3eb', color: '#17324d', border: '1.5px solid #ded3c5', borderRadius: 'var(--radius-sm)', fontWeight: 700 }}
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
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#17324d', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} color="#ef8354" />
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
                    style={{ width: '100%', padding: '10px 12px', background: '#f8f3eb', color: '#17324d', border: '1.5px solid #ded3c5', borderRadius: '12px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#5b6772', marginBottom: '6px' }}>
                    獎勵類型：
                  </label>
                  <select
                    value={newCodeType}
                    onChange={e => setNewCodeType(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', background: '#f8f3eb', color: '#17324d', border: '1.5px solid #ded3c5', borderRadius: '12px', fontWeight: 700 }}
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
                    style={{ width: '100%', padding: '10px 12px', background: '#f8f3eb', color: '#17324d', border: '1.5px solid #ded3c5', borderRadius: '12px', fontWeight: 800 }}
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
                    style={{ width: '100%', padding: '10px 12px', background: '#f8f3eb', color: '#17324d', border: '1.5px solid #ded3c5', borderRadius: '12px', fontWeight: 700 }}
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
                  style={{ width: '100%', padding: '10px 12px', background: '#f8f3eb', color: '#17324d', border: '1.5px solid #ded3c5', borderRadius: '12px', fontWeight: 600 }}
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
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#17324d', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Ticket size={18} color="#ef8354" />
              目前有效兌換碼名冊 ({redemptionCodes.length} 組)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {redemptionCodes.map(codeItem => (
                <div
                  key={codeItem.code}
                  style={{
                    padding: '14px 18px',
                    borderRadius: '16px',
                    background: '#fffdf9',
                    border: '2px solid #17324d',
                    boxShadow: '3px 3px 0 #17324d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '1.05rem', color: '#17324d' }}>
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
                background: '#f8f3eb',
                color: '#17324d',
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
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#17324d', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={18} color="#f59e0b" />
                學生端小鈴鐺通知公告管理 ({adminNotifications.length})
              </div>
              <div style={{ fontSize: '0.8rem', color: '#78818a', fontWeight: 600 }}>
                刪除通知後，學生端小鈴鐺將即時同步移除
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {adminNotifications.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#78818a', background: '#f8f3eb', borderRadius: '12px' }}>
                  目前無任何推播中的系統通知
                </div>
              ) : (
                adminNotifications.map(notif => (
                  <div
                    key={notif.id}
                    style={{
                      background: '#fffdf9',
                      border: '1.5px solid #ded3c5',
                      borderRadius: '14px',
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                      boxShadow: '1px 1px 0px #17324d'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '220px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#17324d' }}>
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
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#17324d', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Users size={22} color="#15803d" />
                  所有學生雲端做題狀況與歷程調閱
                </h3>
                <p style={{ color: '#78818a', fontSize: '0.85rem', marginTop: '4px', margin: '4px 0 0' }}>
                  彙整全體學生做題表現、高頻對錯題類型分析，支援按學生名字篩選錯題、查詢特定題號代碼與展開完整題目詳解。
                </p>
              </div>

              {/* 統計四項指標 */}
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
                  👤 活躍學生：{studentAnalytics.studentsList.length} 位
                </span>
              </div>
            </div>

            {/* B. 高頻對錯題類型雙診斷卡片 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              
              {/* 高頻錯題類型 TOP 5 */}
              <div style={{ background: '#fff0e9', border: '2px solid #ef8354', borderRadius: '18px', padding: '18px', boxShadow: '3px 3px 0 #17324d' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.92rem', fontWeight: 900, color: '#c8643d', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={17} color="#ef8354" />
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
                          background: '#fffdf9',
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
                            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#17324d' }}>
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
              <div style={{ background: '#e8f6ed', border: '2px solid #347650', borderRadius: '18px', padding: '18px', boxShadow: '3px 3px 0 #17324d' }}>
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
                          background: '#fffdf9',
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
                            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#17324d' }}>
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
                <Users size={18} color="#ef8354" />
                <span style={{ fontWeight: 800, fontSize: '0.98rem', color: '#17324d' }}>
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
                    background: '#f8f3eb',
                    color: '#17324d',
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
                  setOnlyMistakes(false);
                }}
                style={{
                  background: selectedStudent === 'ALL' ? '#17324d' : '#fffdf9',
                  color: selectedStudent === 'ALL' ? '#fff' : '#17324d',
                  border: selectedStudent === 'ALL' ? '2px solid #ef8354' : '1.5px solid #ded3c5',
                  borderRadius: '12px',
                  padding: '7px 14px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: selectedStudent === 'ALL' ? '2px 2px 0 #ef8354' : 'none'
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
                      onClick={() => handleStudentChipClick(student.name)}
                      style={{
                        background: isSelected ? '#17324d' : '#fffdf9',
                        color: isSelected ? '#f7cf68' : '#17324d',
                        border: isSelected ? '2px solid #ef8354' : '1.5px solid #ded3c5',
                        borderRadius: '12px',
                        padding: '7px 14px',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: isSelected ? '3px 3px 0 #ef8354' : '1px 1px 0 #ded3c5',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      title={`點擊查看【${student.name}】的所有錯題`}
                    >
                      <span>👤 {student.name}</span>
                      <span 
                        style={{ 
                          fontSize: '0.72rem', 
                          background: isSelected ? '#ef8354' : '#fff0e9', 
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
              <div style={{ marginTop: '14px', padding: '10px 16px', background: '#fff0e9', border: '1.5px solid #ef8354', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
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
          </div>

          {/* D. 查詢特定題號與錯題過濾控制列 */}
          <div className="glass-panel" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '280px' }}>
              <Search size={18} color="#ef8354" />
              <input
                type="text"
                placeholder="查詢特定題號代碼、單元或關鍵字 (例如：Q-G8-MA-U2-0042、因式分解、浮力、時態...)"
                value={questionSearchKeyword}
                onChange={e => setQuestionSearchKeyword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  background: '#f8f3eb',
                  color: '#17324d',
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setOnlyMistakes(false)}
                style={{
                  background: !onlyMistakes ? '#17324d' : '#f8f3eb',
                  color: !onlyMistakes ? '#fff' : '#17324d',
                  border: '1.5px solid #17324d',
                  borderRadius: '10px',
                  padding: '7px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                全部作答 ({filteredPracticeLogs.length})
              </button>
              <button
                onClick={() => setOnlyMistakes(true)}
                style={{
                  background: onlyMistakes ? '#c8643d' : '#f8f3eb',
                  color: onlyMistakes ? '#fff' : '#c8643d',
                  border: '1.5px solid #c8643d',
                  borderRadius: '10px',
                  padding: '7px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                ⚠️ 僅看錯題 ({filteredPracticeLogs.filter(h => !h.isCorrect).length})
              </button>
            </div>
          </div>

          {/* E. 做題清冊：顯示題目與詳解 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredPracticeLogs.length === 0 ? (
              <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: '#78818a' }}>
                <Search size={32} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#17324d' }}>沒有符合條件的作答紀錄</div>
                <div style={{ fontSize: '0.82rem', marginTop: '4px' }}>請嘗試調整搜尋關鍵字、更換學生或切換篩選條件</div>
              </div>
            ) : (
              filteredPracticeLogs.map((log) => {
                const isExpanded = expandedLogIds[log.id] !== false; // 依需求：預設展開顯示題目和詳解

                return (
                  <div
                    key={log.id}
                    style={{
                      background: '#fffdf9',
                      border: log.isCorrect ? '2px solid #b9ddc5' : '2px solid #efb7a6',
                      borderRadius: '18px',
                      padding: '20px',
                      boxShadow: '4px 4px 0px #17324d',
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
                            <span style={{ fontWeight: 900, fontSize: '0.98rem', color: '#17324d' }}>
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
                      <span style={{ background: '#17324d', color: '#fff', fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>
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
                        <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#17324d', lineHeight: 1.8, background: '#f8f3eb', padding: '14px 16px', borderRadius: '12px', border: '1px solid #ded3c5' }}>
                          {log.question || `【題目代碼 ${log.questionId}】：某題庫標準觀念評量題。`}
                        </div>

                        {/* 四大選項呈現 */}
                        {log.options && log.options.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {log.options.map((opt, optIdx) => {
                              const letter = String.fromCharCode(65 + optIdx);
                              const isUserPick = log.userChoice === optIdx;
                              const isRightAns = (log.answer !== undefined ? log.answer : 0) === optIdx;

                              let bg = '#fffdf9';
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
                                  <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: isRightAns ? '#15803d' : isUserPick ? '#b91c1c' : '#f8f3eb', color: (isRightAns || isUserPick) ? '#fff' : '#17324d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.76rem', fontWeight: 900 }}>
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
                        <div style={{ background: '#f8f3eb', border: '1.5px solid #ded3c5', borderRadius: '12px', padding: '12px 16px', fontSize: '0.84rem', color: '#2d3748', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                          <span style={{ fontWeight: 900, color: '#17324d', display: 'block', marginBottom: '4px' }}>
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
              style={{ flex: 1, padding: '10px 14px', background: '#f8f3eb', color: '#17324d', border: '1.5px solid #ded3c5', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}
            />
            <button onClick={handleInspectQuestion} className="btn btn-secondary">
              <Search size={16} /> 調閱題目
            </button>
          </div>

          {inspectedQuestion && (() => {
            const currentOverrides = getQuestionOverrides();
            const isInspectedDeleted = !!currentOverrides[inspectedQuestion.id]?.isDeleted;

            return (
              <div className="glass-panel" style={{ padding: '20px', border: isInspectedDeleted ? '2px solid #ef4444' : '2px solid #17324d' }}>
                {isInspectedDeleted && (
                  <div style={{ marginBottom: '14px', padding: '10px 14px', borderRadius: '12px', background: '#fee2e2', border: '1.5px solid #ef4444', color: '#991b1b', fontSize: '0.86rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={18} color="#ef4444" />
                    此題目目前已被標記刪除！全站學生測驗與錯題加強模式已徹底排除，學生絕不會抽取到此題。
                  </div>
                )}

                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#17324d', marginBottom: '12px' }}>
                  {inspectedQuestion.question}
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
                        ({['A', 'B', 'C', 'D'][idx]}) {opt}
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
                    style={{ width: '100%', height: '80px', background: '#f8f3eb', color: '#17324d', border: '1.5px solid #ded3c5', borderRadius: 'var(--radius-sm)', padding: '10px', fontWeight: 600 }}
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

      {/* 7. 打氣牆留言審查、檢舉審核與刪除 */}
      {activeSubTab === 'community' && (() => {
        const pendingReports = communityReports.filter(r => r.status === 'pending');
        const resolvedReports = communityReports.filter(r => r.status !== 'pending');

        return (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#17324d', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquareHeart size={20} color="#ef8354" />
                  打氣留言審查與檢舉處理中心
                </h3>
                <p style={{ color: '#78818a', fontSize: '0.85rem', marginTop: '4px' }}>
                  管理員可即時審核同學提出的留言檢舉，判定違規屬實者可一鍵下架刪除，查無違規者可駁回保留；亦可直接管理所有公開打氣心語。
                </p>
              </div>
              
              {/* 子導航切換按鈕 */}
              <div style={{ display: 'flex', gap: '8px', background: '#f8f3eb', padding: '4px', borderRadius: '12px', border: '1.5px solid #ded3c5' }}>
                <button
                  onClick={() => setCommunitySubView('pending')}
                  className="btn"
                  style={{
                    background: communitySubView === 'pending' ? '#ef4444' : 'transparent',
                    color: communitySubView === 'pending' ? '#fff' : '#17324d',
                    padding: '6px 14px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <AlertTriangle size={14} />
                  待審核檢舉 ({pendingReports.length})
                </button>
                <button
                  onClick={() => setCommunitySubView('all_posts')}
                  className="btn"
                  style={{
                    background: communitySubView === 'all_posts' ? '#17324d' : 'transparent',
                    color: communitySubView === 'all_posts' ? '#fff' : '#17324d',
                    padding: '6px 14px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <MessageSquareHeart size={14} />
                  全部公開留言 ({communityPosts.length})
                </button>
                <button
                  onClick={() => setCommunitySubView('resolved')}
                  className="btn"
                  style={{
                    background: communitySubView === 'resolved' ? '#17324d' : 'transparent',
                    color: communitySubView === 'resolved' ? '#fff' : '#17324d',
                    padding: '6px 14px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <CheckCircle2 size={14} />
                  審核紀錄 ({resolvedReports.length})
                </button>
              </div>
            </div>

            {/* A. 待審核檢舉視圖 */}
            {communitySubView === 'pending' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {pendingReports.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: '#15803d', background: '#ecfdf5', borderRadius: '16px', border: '1.5px dashed #10b981' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>🎉</div>
                    <div style={{ fontWeight: 800, fontSize: '1rem' }}>目前沒有任何待審核的檢舉！</div>
                    <div style={{ fontSize: '0.82rem', color: '#047857', marginTop: '4px' }}>同學們的打氣留言秩序良好，感謝維護溫馨讀書環境。</div>
                  </div>
                ) : (
                  pendingReports.map(report => (
                    <div
                      key={report.id}
                      style={{
                        background: '#fffdf9',
                        border: '2px solid #ef4444',
                        borderRadius: '16px',
                        padding: '18px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        boxShadow: '3px 3px 0px #ef4444'
                      }}
                    >
                      {/* 檢舉資訊列 */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #ef4444', borderRadius: '6px', padding: '2px 8px', fontSize: '0.76rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Flag size={12} /> 檢舉原因：{report.reason}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: '#78818a', fontWeight: 600 }}>
                            由【{report.reporterName}】於 {new Date(report.createdAt).toLocaleString()} 提出
                          </span>
                        </div>
                        <span style={{ fontSize: '0.74rem', color: '#dc2626', fontWeight: 800 }}>
                          🚨 待審核中
                        </span>
                      </div>

                      {/* 被檢舉留言原貌 */}
                      <div style={{ background: '#f8f3eb', border: '1.5px solid #ded3c5', borderRadius: '12px', padding: '12px 16px' }}>
                        <div style={{ fontSize: '0.76rem', color: '#78818a', fontWeight: 700, marginBottom: '4px' }}>
                          被檢舉之留言內容（作者：{report.authorName} • {report.authorSchool}）：
                        </div>
                        <p style={{ margin: 0, fontSize: '0.94rem', color: '#17324d', fontWeight: 700, lineHeight: 1.6 }}>
                          「{report.postMessage}」
                        </p>
                        {report.note && (
                          <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed #ded3c5', fontSize: '0.78rem', color: '#806523' }}>
                            💬 檢舉者補充說明：{report.note}
                          </div>
                        )}
                      </div>

                      {/* 審核決策按鈕列 */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', paddingTop: '4px' }}>
                        <button
                          onClick={() => handleResolveCommunityReport(report.id, 'dismiss')}
                          className="btn btn-secondary"
                          style={{ padding: '8px 16px', fontSize: '0.82rem', fontWeight: 800, gap: '6px' }}
                        >
                          <CheckCircle2 size={15} color="#15803d" />
                          查無違規：駁回檢舉並保留
                        </button>
                        <button
                          onClick={() => handleResolveCommunityReport(report.id, 'delete')}
                          className="btn btn-fire"
                          style={{ padding: '8px 18px', fontSize: '0.82rem', fontWeight: 800, gap: '6px' }}
                        >
                          <Trash2 size={15} />
                          違規屬實：立即下架刪除留言
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* B. 所有公開打氣留言列表 */}
            {communitySubView === 'all_posts' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {communityPosts.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: '#78818a', background: '#f8f3eb', borderRadius: '16px', border: '1.5px dashed #ded3c5' }}>
                    目前沒有任何打氣留言
                  </div>
                ) : (
                  communityPosts.map(post => (
                    <div 
                      key={post.id}
                      style={{
                        background: '#fffdf9',
                        border: '1.5px solid #ded3c5',
                        borderRadius: '16px',
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                        flexWrap: 'wrap',
                        boxShadow: '2px 2px 0px #17324d'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '240px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#17324d' }}>
                            {post.userName}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: '#78818a', fontWeight: 600 }}>
                            • {post.userSchool}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#9aa2a8', marginLeft: 'auto' }}>
                            {new Date(post.timestamp).toLocaleString()}
                          </span>
                        </div>

                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#2d3748', lineHeight: 1.6, fontWeight: 600 }}>
                          {post.message}
                        </p>

                        <div style={{ fontSize: '0.75rem', color: '#ef8354', fontWeight: 700 }}>
                          ❤️ 已獲打氣數：{post.likes || 1} 次
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteCommunityPost(post.id)}
                        className="btn btn-fire"
                        style={{
                          borderRadius: '10px',
                          padding: '8px 14px',
                          fontSize: '0.82rem',
                          fontWeight: 800,
                          gap: '6px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <Trash2 size={14} />
                        刪除此留言
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* C. 歷史審核紀錄視圖 */}
            {communitySubView === 'resolved' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {resolvedReports.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: '#78818a', background: '#f8f3eb', borderRadius: '16px', border: '1.5px dashed #ded3c5' }}>
                    尚無任何審核歷史紀錄
                  </div>
                ) : (
                  resolvedReports.map(report => (
                    <div
                      key={report.id}
                      style={{
                        background: '#fffdf9',
                        border: '1.5px solid #ded3c5',
                        borderRadius: '16px',
                        padding: '14px 18px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '0.74rem',
                              fontWeight: 800,
                              background: report.decision === 'deleted' ? '#fee2e2' : '#ecfdf5',
                              color: report.decision === 'deleted' ? '#b91c1c' : '#047857',
                              border: report.decision === 'deleted' ? '1px solid #ef4444' : '1px solid #10b981'
                            }}
                          >
                            {report.decision === 'deleted' ? '🗑️ 違規屬實・已下架刪除' : '🛡️ 查無違規・已駁回保留'}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: '#78818a' }}>
                            檢舉原因：{report.reason}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.74rem', color: '#9aa2a8' }}>
                          審核時間：{new Date(report.resolvedAt || report.createdAt).toLocaleString()}（處理者：{report.resolvedBy || '管理員'}）
                        </span>
                      </div>

                      <div style={{ fontSize: '0.85rem', color: '#5b6772', background: '#f8f3eb', padding: '8px 12px', borderRadius: '8px', fontStyle: 'italic' }}>
                        「{report.postMessage}」
                      </div>
                      
                      {report.reviewNote && (
                        <div style={{ fontSize: '0.76rem', color: '#78818a' }}>
                          備註：{report.reviewNote}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

          </div>
        );
      })()}

    </div>
  );
}
