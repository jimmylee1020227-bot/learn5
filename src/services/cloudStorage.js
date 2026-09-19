// 雲端資料同步與儲存服務層 (Cloud Storage & Sync Service) - 正式投入使用乾淨版本
const STORAGE_PREFIX = 'studyhub_cloud_';
const CLOUD_BUS_CHANNEL = 'studyhub_cloud_sync_bus';

// 系統唯一總管理員 Email
export const SUPER_ADMIN_EMAIL = 'jimmylee1020227@gmail.com';

// 建立跨視窗 / 跨標籤頁即時通訊總線 (BroadcastChannel)
let cloudBus = null;
try {
  if (typeof window !== 'undefined' && window.BroadcastChannel) {
    cloudBus = new BroadcastChannel(CLOUD_BUS_CHANNEL);
  }
} catch (e) {
  console.warn('BroadcastChannel not supported', e);
}

// 正式初始管理員名冊：唯一指定總管理員 jimmylee1020227@gmail.com，其餘由總管理員於後台親自任命
export const INITIAL_ADMINS = [
  {
    id: 'admin_super_jimmy',
    email: SUPER_ADMIN_EMAIL,
    displayName: '總管理員 (Jimmy)',
    role: 'super_admin',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=jimmylee1020227',
    specialties: ['最高管理全權', '審計日誌查閱', '管理員任免', '題庫主控'],
    createdAt: new Date().toISOString()
  }
];

const localSyncListeners = new Set();

function pushServerSync(key, value) {
  if (typeof window === 'undefined') return;
  try {
    fetch('/api/cloud-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value })
    }).catch(() => {});
  } catch (e) {}
}

function getJson(key, defaultValue) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

function setJson(key, value) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    const payload = { type: 'SYNC_UPDATE', key, timestamp: Date.now() };
    if (cloudBus) {
      cloudBus.postMessage(payload);
    }
    // 同步觸發當前視窗與所有掛載組件的監聽回調
    localSyncListeners.forEach(cb => {
      try { cb(payload); } catch (e) { console.error(e); }
    });
    // 即時傳送至後端共享伺服器，同步推送給所有正在連線的好友與其他設備
    pushServerSync(key, value);
  } catch (e) {
    console.error('Storage save error', e);
  }
}

// 清除所有本地歷史測資（重設為直接上線標準狀態）
export function purgeAllTestData() {
  const keysToRemove = [
    'practice_history',
    'mistake_notebook',
    'audit_logs',
    'question_reports',
    'question_overrides',
    'studyhub_weekly_leaderboard',
    'studyhub_hall_of_fame',
    'studyhub_last_reset_week'
  ];
  keysToRemove.forEach(k => {
    localStorage.removeItem(STORAGE_PREFIX + k);
    localStorage.removeItem(k);
  });
  setJson('admins_list', INITIAL_ADMINS);
}

// 監聽跨視窗與當前視窗即時同步事件
export function subscribeToCloudSync(callback) {
  localSyncListeners.add(callback);

  const busHandler = (event) => {
    if (event.data?.type === 'SYNC_UPDATE') {
      callback(event.data);
    }
  };
  if (cloudBus) {
    cloudBus.addEventListener('message', busHandler);
  }

  const storageHandler = (e) => {
    if (e.key && e.key.startsWith(STORAGE_PREFIX)) {
      const cleanKey = e.key.replace(STORAGE_PREFIX, '');
      callback({ type: 'SYNC_UPDATE', key: cleanKey, timestamp: Date.now() });
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', storageHandler);
  }

  return () => {
    localSyncListeners.delete(callback);
    if (cloudBus) cloudBus.removeEventListener('message', busHandler);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', storageHandler);
    }
  };
}

// --- 1. 管理員名冊與 RBAC 權限管理 ---
export function getAdminsList() {
  const list = getJson('admins_list', INITIAL_ADMINS);
  // 確保總管理員永遠存在於名單第一順位
  if (!list.some(a => a.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase())) {
    list.unshift(INITIAL_ADMINS[0]);
    setJson('admins_list', list);
  }
  return list;
}

export function addAdmin(newAdmin, operatorUser) {
  if (operatorUser?.role !== 'super_admin' && operatorUser?.email?.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
    throw new Error('只有總管理員有權新增一般管理員！');
  }
  const admins = getAdminsList();
  const targetEmail = newAdmin.email.trim().toLowerCase();
  if (admins.some(a => a.email.toLowerCase() === targetEmail)) {
    throw new Error('該 Email 管理員已存在！');
  }
  const createdAdmin = {
    id: 'admin_' + Date.now(),
    email: targetEmail,
    displayName: newAdmin.displayName || '駐站管理員',
    role: 'admin', // 總管理員只有一個，其餘皆為一般管理員
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(newAdmin.displayName)}`,
    specialties: newAdmin.specialties || ['課綱答疑', '題庫審核'],
    createdAt: new Date().toISOString()
  };
  admins.push(createdAdmin);
  setJson('admins_list', admins);

  // 寫入總管理員專屬日誌
  logAuditEvent({
    operatorId: operatorUser.id,
    operatorName: operatorUser.displayName,
    operatorRole: operatorUser.role,
    actionType: 'ADD_ADMIN',
    details: `總管理員任命一般管理員：${createdAdmin.displayName} (${createdAdmin.email})`
  });

  return createdAdmin;
}

export function deleteAdmin(adminId, operatorUser) {
  if (operatorUser?.role !== 'super_admin' && operatorUser?.email?.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
    throw new Error('只有總管理員有權移除管理員！');
  }
  const admins = getAdminsList();
  const target = admins.find(a => a.id === adminId);
  if (!target) throw new Error('找不到該管理員');
  if (target.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() || target.role === 'super_admin') {
    throw new Error('無法刪除唯一總管理員！');
  }

  const updated = admins.filter(a => a.id !== adminId);
  setJson('admins_list', updated);

  logAuditEvent({
    operatorId: operatorUser.id,
    operatorName: operatorUser.displayName,
    operatorRole: operatorUser.role,
    actionType: 'DELETE_ADMIN',
    details: `總管理員撤銷管理員權限：${target.displayName} (${target.email})`
  });
}

// --- 2. 總管理員專屬操作日誌 (Audit Log - 僅總管可看) ---
export function logAuditEvent({ operatorId, operatorName, operatorRole, actionType, details, targetId = null }) {
  const logs = getJson('audit_logs', []);
  const newEntry = {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    timestamp: new Date().toISOString(),
    operatorId: operatorId || 'unknown',
    operatorName: operatorName || '未知名稱',
    operatorRole: operatorRole || 'admin',
    actionType,
    details,
    targetId
  };
  logs.unshift(newEntry);
  if (logs.length > 2000) logs.length = 2000;
  setJson('audit_logs', logs);
}

export function getAuditLogs(currentUser) {
  if (currentUser?.role !== 'super_admin' && currentUser?.email?.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
    // 嚴格權限防護：非總管理員無法讀取日誌
    return [];
  }
  return getJson('audit_logs', []);
}

// --- 3. 全做題歷史紀錄 (Cross-Device Practice History) ---
const INITIAL_PRACTICE_HISTORY = [];

// 批次記錄整份測驗結果 (含做題歷程與錯題本集中更新，防止多併發衝突)
export function recordPracticeBatch({ userId, userName, userSchool, results, timeSpentSec }) {
  if (!results || results.length === 0) return [];

  const finalUserId = userId || 'guest_student';
  const finalUserName = userName || '匿名同學';
  const finalUserSchool = userSchool || '會考戰友';
  const perQTime = Math.max(1, Math.round((timeSpentSec || 15) / results.length));
  const nowIso = new Date().toISOString();

  // 1. 整理全部做題歷史記錄 (含正確與錯題)
  const existingLogs = getJson('practice_history', INITIAL_PRACTICE_HISTORY);
  const newLogEntries = results.map(item => ({
    id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    userId: finalUserId,
    userName: finalUserName,
    userSchool: finalUserSchool,
    questionId: item.id,
    subjectId: item.subjectId,
    gradeId: item.gradeId,
    unitName: item.unitName,
    conceptTag: item.conceptTag,
    difficulty: item.difficulty || 'medium',
    isCorrect: item.isCorrect,
    userChoice: item.userChoice,
    timeSpentSec: perQTime,
    timestamp: nowIso,
    question: item.question || '',
    options: item.options || [],
    answer: item.answer !== undefined ? item.answer : 0,
    explanation: item.explanation || '',
    hint: item.hint || ''
  }));

  const combinedLogs = [...newLogEntries, ...existingLogs];
  if (combinedLogs.length > 5000) combinedLogs.length = 5000;
  setJson('practice_history', combinedLogs);

  // 2. 集中處理錯題本更新 (Mistake Notebook)
  const allMistakes = getJson('mistake_notebook', {});
  const userList = allMistakes[finalUserId] || [];

  results.forEach(item => {
    const existingIdx = userList.findIndex(m => m.questionId === item.id);
    if (existingIdx >= 0) {
      const m = userList[existingIdx];
      m.lastAttemptAt = nowIso;
      if (item.isCorrect) {
        m.consecutiveCorrect = (m.consecutiveCorrect || 0) + 1;
        if (m.consecutiveCorrect >= 3) {
          m.status = 'mastered';
        }
      } else {
        m.wrongCount = (m.wrongCount || 1) + 1;
        m.consecutiveCorrect = 0;
        m.status = 'unresolved';
      }
    } else if (!item.isCorrect) {
      userList.unshift({
        questionId: item.id,
        subjectId: item.subjectId,
        gradeId: item.gradeId,
        unitName: item.unitName,
        conceptTag: item.conceptTag,
        difficulty: item.difficulty || 'medium',
        question: item.question,
        options: item.options,
        answer: item.answer,
        explanation: item.explanation,
        hint: item.hint,
        wrongCount: 1,
        consecutiveCorrect: 0,
        status: 'unresolved',
        addedAt: nowIso,
        lastAttemptAt: nowIso
      });
    }
  });

  allMistakes[finalUserId] = userList;
  setJson('mistake_notebook', allMistakes);

  return newLogEntries;
}

export function recordPracticeLog(logData) {
  const logs = getJson('practice_history', INITIAL_PRACTICE_HISTORY);
  const entry = {
    id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    userId: logData.userId || 'guest_student',
    userName: logData.userName || '匿名同學',
    userSchool: logData.userSchool || '會考戰友',
    questionId: logData.questionId,
    subjectId: logData.subjectId,
    gradeId: logData.gradeId,
    unitName: logData.unitName,
    conceptTag: logData.conceptTag,
    difficulty: logData.difficulty || 'medium',
    isCorrect: logData.isCorrect,
    userChoice: logData.userChoice,
    timeSpentSec: logData.timeSpentSec || 15,
    timestamp: new Date().toISOString(),
    question: logData.question || '',
    options: logData.options || [],
    answer: logData.answer !== undefined ? logData.answer : 0,
    explanation: logData.explanation || '',
    hint: logData.hint || ''
  };
  logs.unshift(entry);
  if (logs.length > 5000) logs.length = 5000;
  setJson('practice_history', logs);
  return entry;
}

export function getUserPracticeHistory(userId) {
  const logs = getJson('practice_history', INITIAL_PRACTICE_HISTORY);
  return userId ? logs.filter(l => l.userId === userId) : logs;
}

// --- 4. 錯題本與「錯題加強模式」掌握狀態 ---
export function getMistakeNotebook(userId) {
  const allMistakes = getJson('mistake_notebook', {});
  const userList = allMistakes[userId] || [];
  const overrides = getJson('question_overrides', {});
  // 嚴格過濾管理員已標記刪除的題目，學生錯題本與加強模式絕不出現
  return userList.filter(m => !overrides[m.questionId]?.isDeleted);
}

export function updateMistakeRecord(userId, question, isNowCorrect) {
  const allMistakes = getJson('mistake_notebook', {});
  const userList = allMistakes[userId] || [];
  const existingIdx = userList.findIndex(m => m.questionId === question.id);

  if (existingIdx >= 0) {
    const item = userList[existingIdx];
    item.lastAttemptAt = new Date().toISOString();
    if (isNowCorrect) {
      item.consecutiveCorrect = (item.consecutiveCorrect || 0) + 1;
      // 在加強練習中連續答對 3 次，標記為已掌握 (mastered)
      if (item.consecutiveCorrect >= 3) {
        item.status = 'mastered';
      }
    } else {
      item.wrongCount = (item.wrongCount || 1) + 1;
      item.consecutiveCorrect = 0;
      item.status = 'unresolved';
    }
  } else if (!isNowCorrect) {
    userList.unshift({
      questionId: question.id,
      subjectId: question.subjectId,
      gradeId: question.gradeId,
      unitName: question.unitName,
      conceptTag: question.conceptTag,
      difficulty: question.difficulty,
      question: question.question,
      options: question.options,
      answer: question.answer,
      explanation: question.explanation,
      hint: question.hint,
      wrongCount: 1,
      consecutiveCorrect: 0,
      status: 'unresolved',
      addedAt: new Date().toISOString(),
      lastAttemptAt: new Date().toISOString()
    });
  }

  allMistakes[userId] = userList;
  setJson('mistake_notebook', allMistakes);
}

export function getUnresolvedErrorConcepts(userId) {
  const mistakes = getMistakeNotebook(userId);
  const unresolved = mistakes.filter(m => m.status !== 'mastered');
  const conceptCounts = {};
  unresolved.forEach(m => {
    conceptCounts[m.conceptTag] = (conceptCounts[m.conceptTag] || 0) + m.wrongCount;
  });
  return conceptCounts;
}

// --- 5. 題目回報管理系統 (Question Reports) ---
export function submitQuestionReport({ questionId, unitName, reason, comment, reporterId, reporterName }) {
  const reports = getJson('question_reports', []);
  const reportItem = {
    id: 'rep_' + Date.now(),
    questionId,
    unitName,
    reason,
    comment: comment || '',
    reporterId,
    reporterName: reporterName || '同學',
    status: 'pending',
    timestamp: new Date().toISOString()
  };
  reports.unshift(reportItem);
  setJson('question_reports', reports);
  return reportItem;
}

export function getQuestionReports() {
  return getJson('question_reports', []);
}

export function resolveQuestionReport(reportId, operatorUser, resolutionNote) {
  const reports = getQuestionReports();
  const target = reports.find(r => r.id === reportId);
  if (target) {
    target.status = 'resolved';
    target.resolvedBy = operatorUser.displayName;
    target.resolvedAt = new Date().toISOString();
    target.resolutionNote = resolutionNote;
    setJson('question_reports', reports);

    logAuditEvent({
      operatorId: operatorUser.id,
      operatorName: operatorUser.displayName,
      operatorRole: operatorUser.role,
      actionType: 'RESOLVE_REPORT',
      details: `處理題目回報 #${reportId} (${target.questionId} - ${target.reason})：${resolutionNote || '已完成修正'}`
    });
  }
}

// 網站綜合問題回報 (Site Issue Reports)
export function submitSiteReport({ category, contact, description, userId, userName }) {
  const reports = getJson('site_issue_reports', []);
  const reportItem = {
    id: 'site_rep_' + Date.now(),
    category: category || '其他',
    contact: contact || '',
    description,
    userId: userId || 'guest',
    userName: userName || '同學',
    status: 'pending',
    timestamp: new Date().toISOString()
  };
  reports.unshift(reportItem);
  setJson('site_issue_reports', reports);
  return reportItem;
}

export function getSiteReports() {
  return getJson('site_issue_reports', []);
}

// --- 6. 題庫自訂與管理員增刪改 ---
export function getQuestionOverrides() {
  return getJson('question_overrides', {});
}

export function modifyQuestion(qId, patchData, operatorUser) {
  const overrides = getQuestionOverrides();
  overrides[qId] = {
    ...(overrides[qId] || {}),
    ...patchData,
    modifiedBy: operatorUser.displayName,
    modifiedAt: new Date().toISOString()
  };
  setJson('question_overrides', overrides);

  logAuditEvent({
    operatorId: operatorUser.id,
    operatorName: operatorUser.displayName,
    operatorRole: operatorUser.role,
    actionType: patchData.isDeleted ? 'DELETE_QUESTION' : 'MODIFY_QUESTION',
    details: patchData.isDeleted 
      ? `刪除題目 [${qId}]`
      : `修改題目 [${qId}]：${JSON.stringify(patchData)}`
  });
}

// --- 7. 管理員 1 對 1 線上即時諮詢聊天室 (支援跨裝置即時同步) ---
export function getKnownStudents() {
  const history = getJson('practice_history', []);
  const map = new Map();

  history.forEach(h => {
    if (h.userId && !map.has(h.userId) && h.userId !== 'admin_super_jimmy') {
      map.set(h.userId, {
        id: h.userId,
        name: h.userName || '會考戰友',
        school: h.userSchool || '國三衝刺組',
        lastActive: h.timestamp
      });
    }
  });

  if (map.size === 0) {
    map.set('student_lin', {
      id: 'student_lin',
      name: '建中前鋒‧林同學',
      school: '國三衝刺 5A++',
      lastActive: new Date().toISOString()
    });
    map.set('student_chen', {
      id: 'student_chen',
      name: '北一女‧陳同學',
      school: '北一女中衝刺組',
      lastActive: new Date().toISOString()
    });
  }

  return Array.from(map.values());
}

export function getAllChatThreads() {
  const allChats = getJson('support_chats', {});
  const threadKeys = Object.keys(allChats);
  
  const threadList = threadKeys.map(key => {
    const parts = key.split('__');
    const studentId = parts[0] || 'student';
    const adminId = parts[1] || 'admin_super_jimmy';
    const msgs = allChats[key] || [];
    const latestMsg = msgs[msgs.length - 1];
    const unreadCount = msgs.filter(m => !m.isRead && m.senderRole === 'student').length;

    return {
      threadKey: key,
      studentId,
      adminId,
      studentName: latestMsg?.studentName || (latestMsg?.senderRole === 'student' ? latestMsg.senderName : '學生戰友'),
      studentSchool: latestMsg?.studentSchool || '會考戰友',
      latestMsg,
      unreadCount,
      updatedAt: latestMsg?.timestamp || new Date(0).toISOString()
    };
  }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  // 若目前無諮詢紀錄，自動加入初始諮詢範例，確保隨時可測試與點選
  if (threadList.length === 0) {
    const defaultStudentId = 'student_lin';
    const defaultAdminId = 'admin_super_jimmy';
    const defaultMsgs = [
      {
        id: 'msg_init_lin',
        studentId: defaultStudentId,
        adminId: defaultAdminId,
        studentName: '建中前鋒‧林同學',
        studentSchool: '國三衝刺 5A++',
        senderId: defaultStudentId,
        senderName: '建中前鋒‧林同學',
        senderRole: 'student',
        text: '老師您好！想請問二次函數配方法如果頂點不在整數上，有哪些技巧可以快速求解？',
        timestamp: new Date().toISOString(),
        isRead: false
      }
    ];
    allChats[`${defaultStudentId}__${defaultAdminId}`] = defaultMsgs;
    setJson('support_chats', allChats);

    threadList.push({
      threadKey: `${defaultStudentId}__${defaultAdminId}`,
      studentId: defaultStudentId,
      adminId: defaultAdminId,
      studentName: '建中前鋒‧林同學',
      studentSchool: '國三衝刺 5A++',
      latestMsg: defaultMsgs[0],
      unreadCount: 1,
      updatedAt: defaultMsgs[0].timestamp
    });
  }

  return threadList;
}

export function getChatMessages(studentId, adminId = 'admin_super_jimmy') {
  if (!studentId) return [];
  const allChats = getJson('support_chats', {});
  const finalAdminId = adminId || 'admin_super_jimmy';
  const threadKey = `${studentId}__${finalAdminId}`;
  
  if (allChats[threadKey] && allChats[threadKey].length > 0) {
    return allChats[threadKey];
  }

  // 彈性匹配：尋找以 studentId 為開頭的任何對話
  const altKey = Object.keys(allChats).find(k => k.startsWith(`${studentId}__`));
  if (altKey && allChats[altKey]?.length > 0) {
    return allChats[altKey];
  }

  // 嘗試相容讀取舊格式
  const legacy = getJson(`chat_${studentId}_${finalAdminId}`, null);
  if (legacy && legacy.length > 0) return legacy;

  return [
    {
      id: 'welcome_' + threadKey,
      senderId: finalAdminId,
      senderName: '管理員',
      senderRole: 'admin',
      text: '同學你好！我是負責該學科的管理員，有任何題目疑問、詳解爭議或課綱內容都可以直接告訴我！',
      timestamp: new Date().toISOString(),
      isRead: true
    }
  ];
}

export function sendChatMessage(studentId, adminId = 'admin_super_jimmy', message = {}) {
  if (!studentId) return null;
  const finalAdminId = adminId || 'admin_super_jimmy';
  const allChats = getJson('support_chats', {});
  const threadKey = `${studentId}__${finalAdminId}`;
  const existing = allChats[threadKey] || [];

  const newMsg = {
    id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    studentId,
    adminId: finalAdminId,
    studentName: message.studentName || (message.senderRole === 'student' ? message.senderName : '學生戰友'),
    studentSchool: message.studentSchool || '會考戰友',
    senderId: message.senderId || studentId,
    senderName: message.senderName || '同學',
    senderRole: message.senderRole || 'student',
    text: (message.text || '').trim(),
    timestamp: new Date().toISOString(),
    isRead: message.senderRole !== 'student' // 管理員發言預設已讀
  };

  const updatedMsgs = [...existing, newMsg];
  allChats[threadKey] = updatedMsgs;
  setJson('support_chats', allChats);
  setJson(`chat_${studentId}_${finalAdminId}`, updatedMsgs);

  return newMsg;
}

export function markThreadAsRead(studentId, adminId = 'admin_super_jimmy') {
  if (!studentId) return;
  const allChats = getJson('support_chats', {});
  const finalAdminId = adminId || 'admin_super_jimmy';
  const threadKey = `${studentId}__${finalAdminId}`;
  
  const targetKey = allChats[threadKey] ? threadKey : Object.keys(allChats).find(k => k.startsWith(`${studentId}__`));
  if (!targetKey || !allChats[targetKey]) return;

  let changed = false;
  allChats[targetKey] = allChats[targetKey].map(m => {
    if (!m.isRead && m.senderRole === 'student') {
      changed = true;
      return { ...m, isRead: true };
    }
    return m;
  });

  if (changed) {
    setJson('support_chats', allChats);
  }
}

// --- 8. 全服廣播公告與活動設定 ---
export function getGlobalSettings() {
  return getJson('global_settings', {
    global2xActive: false,
    activeBroadcast: {
      message: '🎉 歡迎來到 108 課綱國中全科學習網！每題答對得 1 點，每週一 00:00 排行榜歸零，祝學習進步！',
      sender: '系統總部',
      timestamp: new Date().toISOString()
    }
  });
}

export function updateGlobalSettings(settingsPatch, operatorUser) {
  const current = getGlobalSettings();
  const updated = { ...current, ...settingsPatch };
  setJson('global_settings', updated);

  logAuditEvent({
    operatorId: operatorUser.id,
    operatorName: operatorUser.displayName,
    operatorRole: operatorUser.role,
    actionType: 'UPDATE_GLOBAL_SETTINGS',
    details: `更新全服設定：${JSON.stringify(settingsPatch)}`
  });
}

// --- 9. 兌換碼 (Redemption Codes) 系統 ---
const DEFAULT_REDEMPTION_CODES = [];

export function getRedemptionCodes() {
  const deletedCodes = new Set(getJson('deleted_redemption_codes', []));
  const rawCodes = getJson('redemption_codes', DEFAULT_REDEMPTION_CODES);
  return rawCodes.filter(c => !deletedCodes.has((c.code || '').trim().toUpperCase()));
}

export function addRedemptionCode(codeObj, operatorUser) {
  const code = (codeObj.code || '').trim().toUpperCase();
  if (!code) throw new Error('兌換碼不得為空！');
  
  // 若先前曾被刪除，重新加入時解除刪除狀態
  const deletedCodes = getJson('deleted_redemption_codes', []).filter(c => c !== code);
  setJson('deleted_redemption_codes', deletedCodes);

  const currentCodes = getRedemptionCodes();
  if (currentCodes.some(c => c.code.toUpperCase() === code)) {
    throw new Error(`兌換碼「${code}」已存在，請使用不同代碼！`);
  }

  const newCodeEntry = {
    code,
    type: codeObj.type || 'points', // 'points' | 'lottery_ticket' | 'multiplier'
    rewardValue: Number(codeObj.rewardValue) || 50,
    label: codeObj.label?.trim() || `${code} 官方空投特惠禮包`,
    expiresAt: codeObj.expiresAt || '2028-12-31',
    createdAt: new Date().toISOString(),
    createdBy: operatorUser?.displayName || '管理員'
  };

  const updatedCodes = [newCodeEntry, ...currentCodes];
  setJson('redemption_codes', updatedCodes);

  // 寫入總管日誌
  if (operatorUser) {
    logAuditEvent({
      operatorId: operatorUser.id,
      operatorName: operatorUser.displayName,
      operatorRole: operatorUser.role,
      actionType: 'CREATE_REDEMPTION_CODE',
      details: `建立新兌換碼【${code}】: ${newCodeEntry.label} (數值: ${newCodeEntry.rewardValue})`
    });
  }

  // 自動推播至小鈴鐺通知中心
  addAdminNotification({
    title: `🎁 管理員發放新序號【${code}】！`,
    message: `新兌換碼發布：${newCodeEntry.label}，點擊即可一鍵領取！`,
    type: 'redemption',
    relatedCode: code,
    sender: operatorUser?.displayName || '站務管理員'
  }, operatorUser);

  return newCodeEntry;
}

export function deleteRedemptionCode(codeString, operatorUser) {
  const codeTrimmed = codeString.trim().toUpperCase();
  
  // 1. 寫入永久刪除名冊，確保全站徹底過濾
  const deletedCodes = getJson('deleted_redemption_codes', []);
  if (!deletedCodes.includes(codeTrimmed)) {
    deletedCodes.push(codeTrimmed);
    setJson('deleted_redemption_codes', deletedCodes);
  }

  const currentCodes = getRedemptionCodes();
  const filtered = currentCodes.filter(c => (c.code || '').trim().toUpperCase() !== codeTrimmed);
  setJson('redemption_codes', filtered);

  if (operatorUser) {
    logAuditEvent({
      operatorId: operatorUser.id,
      operatorName: operatorUser.displayName,
      operatorRole: operatorUser.role,
      actionType: 'DELETE_REDEMPTION_CODE',
      details: `撤銷並刪除兌換碼【${codeTrimmed}】`
    });
  }

  return true;
}

export function getUserRedeemedCodes(userId) {
  return getJson('redeemed_history_' + userId, []);
}

export function redeemCode(userId, inputCode, userName = '同學') {
  const codeTrimmed = inputCode.trim().toUpperCase();
  const codes = getRedemptionCodes();
  const matched = codes.find(c => c.code.toUpperCase() === codeTrimmed);
  
  if (!matched) {
    throw new Error('兌換碼無效或已過期，請確認英文字母大小寫！');
  }

  // 檢查是否已在該帳號/裝置兌換過
  const redeemedHistory = getJson('redeemed_history_' + userId, []);
  if (redeemedHistory.includes(codeTrimmed)) {
    throw new Error('此兌換碼每位同學/每台裝置限兌換一次，你已領取過該獎勵！');
  }

  // 記錄兌換
  redeemedHistory.push(codeTrimmed);
  setJson('redeemed_history_' + userId, redeemedHistory);

  return matched;
}

// --- 9.5 管理員通知廣播與小鈴鐺通知流系統 (Admin Notifications Stream) ---
const DEFAULT_ADMIN_NOTIFICATIONS = [
  {
    id: 'notif_launch',
    title: '🎉 歡迎來到會考讀書網！',
    message: '108 課綱全科複習網正式上線！每週一 00:00 歸零結算榜單，答對一題即得 1 點排行榜積分，祝各位戰友穩穩上岸！',
    type: 'announcement',
    sender: '總管理員 Jimmy',
    timestamp: new Date().toISOString(),
    isRead: false
  }
];

export function getAdminNotifications() {
  const notifs = getJson('admin_notifications', DEFAULT_ADMIN_NOTIFICATIONS);
  const deletedSet = new Set(getJson('deleted_notifications', []));
  return notifs.filter(n => !deletedSet.has(n.id));
}

export function addAdminNotification(notifObj, operatorUser) {
  const currentNotifs = getAdminNotifications();
  const newNotif = {
    id: 'notif_' + Date.now(),
    title: notifObj.title || '管理員重要通知',
    message: notifObj.message,
    type: notifObj.type || 'announcement', // 'announcement' | 'redemption' | 'event'
    relatedCode: notifObj.relatedCode || null,
    sender: notifObj.sender || operatorUser?.displayName || '管理員',
    timestamp: new Date().toISOString()
  };

  const updated = [newNotif, ...currentNotifs];
  setJson('admin_notifications', updated);
  return newNotif;
}

export function deleteAdminNotification(notifId, operatorUser) {
  const currentNotifs = getAdminNotifications();
  const target = currentNotifs.find(n => n.id === notifId);
  const filtered = currentNotifs.filter(n => n.id !== notifId);
  setJson('admin_notifications', filtered);

  // 永久刪除名冊（Tombstone），防止預設清單或跨端回彈
  const deletedIds = getJson('deleted_notifications', []);
  if (!deletedIds.includes(notifId)) {
    deletedIds.push(notifId);
    setJson('deleted_notifications', deletedIds);
  }

  if (operatorUser) {
    logAuditEvent({
      operatorId: operatorUser.id || 'admin',
      operatorName: operatorUser.displayName || '管理員',
      operatorRole: operatorUser.role || 'admin',
      actionType: 'DELETE_NOTIFICATION',
      details: target ? `刪除系統通知公告：${target.title}` : `刪除系統通知 [${notifId}]`,
      targetId: notifId
    });
  }
  return true;
}

// --- 10. 會考讀書網｜打氣留言牆 (Community Encouragement Wall) ---
const INITIAL_COMMUNITY_POSTS = [];

export function getCommunityPosts() {
  const posts = getJson('community_posts', INITIAL_COMMUNITY_POSTS);
  const deletedSet = new Set(getJson('deleted_community_post_ids', []));
  return posts.filter(p => !deletedSet.has(p.id));
}

export function addCommunityPost({ userName, userSchool, message }) {
  if (!message || message.trim().length < 3) {
    throw new Error('請至少輸入 3 個字以上的打氣心語喔！');
  }
  const posts = getCommunityPosts();
  const newPost = {
    id: 'post_' + Date.now(),
    userName: userName || '讀書夥伴',
    userSchool: userSchool || '108課綱戰友',
    message: message.trim(),
    likes: 1,
    timestamp: new Date().toISOString()
  };
  posts.unshift(newPost);
  setJson('community_posts', posts);
  return newPost;
}

export function likeCommunityPost(postId) {
  const posts = getCommunityPosts();
  const post = posts.find(p => p.id === postId);
  if (post) {
    post.likes = (post.likes || 0) + 1;
    setJson('community_posts', posts);
  }
  return posts;
}

export function deleteCommunityPost(postId, operatorUser) {
  const posts = getCommunityPosts();
  const target = posts.find(p => p.id === postId);
  const filtered = posts.filter(p => p.id !== postId);
  setJson('community_posts', filtered);
  
  // 寫入永久刪除名冊（Tombstone），確保全服與所有視窗絕對不可再見
  const deletedIds = getJson('deleted_community_post_ids', []);
  if (!deletedIds.includes(postId)) {
    deletedIds.push(postId);
    setJson('deleted_community_post_ids', deletedIds);
  }

  if (operatorUser) {
    logAuditEvent({
      operatorId: operatorUser.id || 'admin',
      operatorName: operatorUser.displayName || operatorUser.name || '管理員',
      operatorRole: operatorUser.role || 'admin',
      actionType: 'DELETE_COMMUNITY_POST',
      details: target ? `刪除打氣牆留言：「${target.message.slice(0, 18)}...」 (${target.userName})` : `刪除打氣留言 ${postId}`,
      targetId: postId
    });
  }
  return filtered;
}

// 取得所有檢舉清單
export function getCommunityReports() {
  return getJson('community_reports', []);
}

// 學生提出留言檢舉
export function reportCommunityPost({
  postId,
  postMessage,
  authorName,
  authorSchool,
  reporterId,
  reporterName,
  reason,
  note = ''
}) {
  if (!postId) throw new Error('缺少留言 ID');
  const reports = getCommunityReports();

  // 避免同一使用者針對同一留言重複送出待審核檢舉
  const existingPending = reports.find(
    r => r.postId === postId && r.reporterId === (reporterId || 'guest') && r.status === 'pending'
  );
  if (existingPending) {
    throw new Error('您已檢舉過此留言，後台管理團隊審核中！');
  }

  const newReport = {
    id: 'report_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    postId,
    postMessage: postMessage || '',
    authorName: authorName || '同學',
    authorSchool: authorSchool || '',
    reporterId: reporterId || 'guest',
    reporterName: reporterName || '匿名同學',
    reason: reason || '不當言論或洗版',
    note: (note || '').trim(),
    status: 'pending', // 'pending' | 'deleted' | 'dismissed'
    createdAt: new Date().toISOString(),
    resolvedAt: null,
    resolvedBy: null,
    decision: null
  };

  reports.unshift(newReport);
  setJson('community_reports', reports);
  return newReport;
}

// 後台管理員審核檢舉（刪除留言或駁回保留）
export function resolveCommunityReport(reportId, decision, operatorUser, reviewNote = '') {
  const reports = getCommunityReports();
  const report = reports.find(r => r.id === reportId);
  if (!report) throw new Error('找不到該檢舉項目');

  const nowIso = new Date().toISOString();
  const operatorName = operatorUser?.displayName || operatorUser?.name || '管理員';

  if (decision === 'delete') {
    // 1. 刪除打氣留言 (包括寫入永久刪除名冊，全服與多端即刻消失)
    deleteCommunityPost(report.postId, operatorUser);

    // 2. 將同一留言所有 pending 狀態的檢舉皆更新為違規已刪除
    reports.forEach(r => {
      if (r.postId === report.postId && r.status === 'pending') {
        r.status = 'deleted';
        r.resolvedAt = nowIso;
        r.resolvedBy = operatorName;
        r.decision = 'deleted';
        r.reviewNote = reviewNote || '管理員審核判定違規屬實，已下架刪除留言';
      }
    });

    logAuditEvent({
      operatorId: operatorUser?.id || 'admin',
      operatorName,
      operatorRole: operatorUser?.role || 'admin',
      actionType: 'RESOLVE_REPORT_DELETE',
      details: `後台審核通過並下架刪除違規留言：「${report.postMessage.slice(0, 20)}...」（檢舉原因：${report.reason}）`,
      targetId: report.postId
    });
  } else if (decision === 'dismiss') {
    // 駁回檢舉，保留留言
    report.status = 'dismissed';
    report.resolvedAt = nowIso;
    report.resolvedBy = operatorName;
    report.decision = 'dismissed';
    report.reviewNote = reviewNote || '管理員審查確認未違反社群守則，保留留言';

    logAuditEvent({
      operatorId: operatorUser?.id || 'admin',
      operatorName,
      operatorRole: operatorUser?.role || 'admin',
      actionType: 'RESOLVE_REPORT_DISMISS',
      details: `後台審核駁回檢舉，保留留言：「${report.postMessage.slice(0, 20)}...」（檢舉原因：${report.reason}）`,
      targetId: report.postId
    });
  } else {
    throw new Error('未知的審核動作：' + decision);
  }

  setJson('community_reports', reports);
  return reports;
}

// --- 11. 每日刷題進度目標 (Daily Practice Goal) ---
export function getDailyPracticeStats(userId = 'guest') {
  const todayKey = 'daily_stats_' + userId + '_' + new Date().toISOString().slice(0, 10);
  return getJson(todayKey, {
    count: 0,
    target: 10,
    correctCount: 0,
    lastPracticedAt: null
  });
}

export function incrementDailyPracticeStats(userId = 'guest', countIncrement = 1, correctIncrement = 1) {
  const todayKey = 'daily_stats_' + userId + '_' + new Date().toISOString().slice(0, 10);
  const current = getDailyPracticeStats(userId);
  const updated = {
    ...current,
    count: current.count + countIncrement,
    correctCount: current.correctCount + correctIncrement,
    lastPracticedAt: new Date().toISOString()
  };
  setJson(todayKey, updated);
  return updated;
}

// --- 12. 多設備跨端雲端同步引擎 (Cross-Device Real-Time Sync Engine) ---
if (typeof window !== 'undefined') {
  const syncFromServer = () => {
    fetch('/api/cloud-sync')
      .then(res => res.json())
      .then(data => {
        if (data?.ok && data.state) {
          Object.entries(data.state).forEach(([k, v]) => {
            const currentRaw = localStorage.getItem(STORAGE_PREFIX + k);
            const newRaw = JSON.stringify(v);
            if (currentRaw !== newRaw) {
              localStorage.setItem(STORAGE_PREFIX + k, newRaw);
              const payload = { type: 'SYNC_UPDATE', key: k, timestamp: Date.now() };
              localSyncListeners.forEach(cb => {
                try { cb(payload); } catch (e) {}
              });
            }
          });
        }
      })
      .catch(() => {});
  };

  // 1. 初次載入立刻自服務端拉取最新全域狀態
  syncFromServer();

  // 2. 即時 SSE 串流 (毫秒級響應跨設備做題交卷、刪除打氣留言、刪除題目、發送兌換碼)
  let sseSource = null;
  const initSSE = () => {
    try {
      sseSource = new EventSource('/api/cloud-stream');
      sseSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'SYNC_UPDATE' && data.key) {
            localStorage.setItem(STORAGE_PREFIX + data.key, JSON.stringify(data.value));
            const payload = { type: 'SYNC_UPDATE', key: data.key, timestamp: Date.now() };
            localSyncListeners.forEach(cb => {
              try { cb(payload); } catch (err) {}
            });
          }
        } catch (err) {}
      };
      sseSource.onerror = () => {
        if (sseSource) sseSource.close();
        setTimeout(initSSE, 3000);
      };
    } catch (err) {
      setTimeout(initSSE, 3000);
    }
  };
  initSSE();

  // 3. 心跳定時拉取 (每 2 秒)，確保手機休眠換頁或斷線重連也絕對 100% 準確同步
  setInterval(syncFromServer, 2000);
}

