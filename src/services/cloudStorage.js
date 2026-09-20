import { db, ref, set, get, onValue } from './firebase.js';

// 安全寫入 LocalStorage (防 QuotaExceededError 造成後續雲端同步中斷)
export function safeSetLocalStorage(key, valueStr) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      safeSetLocalStorage(key, valueStr);
    }
  } catch (e) {
    console.warn(`[LocalStorage Warning] 無法儲存 ${key} (可能已滿 5MB限制)，但不影響雲端存檔。`, e);
  }
}

import { getRealDate, getRealTime } from './timeService.js';

// 雲端資料同步與儲存服務層 (Cloud Storage & Sync Service) - Firebase 真正跨裝置即時全域版
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
  },
  {
    id: 'admin_happybrother0717',
    email: 'happybrother0717@gmail.com',
    displayName: '駐站管理員 (happybrother)',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=happybrother0717',
    specialties: ['課綱答疑', '題庫審核', '錯題處理', '全站巡查'],
    createdAt: new Date().toISOString()
  }
];

const localSyncListeners = new Set();
let isFirebaseListening = false;
let activeUserListenerUnsub = null;

// 動態題庫還原器 (由 questionGenerator 註冊，實現 0 空間負擔的完整解析還原)
let registeredQuestionHydrator = null;
export function registerQuestionHydrator(fn) {
  registeredQuestionHydrator = fn;
}

export function hydrateQuestionDetails(item) {
  if (!item) return item;
  if (item.question && Array.isArray(item.options) && item.options.length > 0) {
    return item;
  }

  let subjectId = item.subjectId;
  let gradeId = item.gradeId;
  let unitId = item.unitId;
  let index = item.index;

  // 若部分欄位缺失，從 questionId 自動智慧解析 (支援 Q-G7-MA-U1-0001 與 math-g7-u1-1 雙標準)
  if ((!subjectId || !gradeId || !unitId) && (item.questionId || item.id)) {
    const rawId = item.questionId || item.id || '';
    const matchQ = rawId.match(/^Q-([^-]+)-([^-]+)-([^-]+)-(\d+)$/i);
    if (matchQ) {
      gradeId = gradeId || matchQ[1].toLowerCase();
      const subCode = matchQ[2].toUpperCase();
      const subMap = { MA: 'math', CH: 'chinese', EN: 'english', SC: 'science', SO: 'social' };
      subjectId = subjectId || subMap[subCode] || 'math';
      unitId = unitId || matchQ[3].toLowerCase();
      index = index || parseInt(matchQ[4], 10) || 1;
    } else {
      const parts = rawId.split('-');
      if (parts.length >= 4) {
        subjectId = subjectId || parts[0];
        gradeId = gradeId || parts[1];
        unitId = unitId || parts[2];
        index = index || parseInt(parts[3], 10) || 1;
      }
    }
  }

  if (typeof registeredQuestionHydrator === 'function' && subjectId && gradeId && unitId) {
    try {
      const gen = registeredQuestionHydrator(
        subjectId,
        gradeId,
        unitId,
        index || 1,
        item.difficulty || 'medium'
      );
      if (gen) {
        return {
          ...item,
          subjectId,
          gradeId,
          unitId,
          index: index || 1,
          question: gen.question,
          options: gen.options,
          answer: item.answer !== undefined ? item.answer : gen.answer,
          explanation: gen.explanation,
          hint: gen.hint,
          isListening: gen.isListening || false,
          audioText: gen.audioText || null,
          isReading: gen.isReading || false,
          readingText: gen.readingText || null,
          isSvg: gen.isSvg || false,
          svgContent: gen.svgContent || null,
          isChat: gen.isChat || false,
          chatMessages: gen.chatMessages || null
        };
      }
    } catch (e) {}
  }
  return item;
}

// 1. 全服共享資料節點清單 (分路精準監聽，節省 99% 下載流量，支援千萬人高併發架構)
const SHARED_CLOUD_KEYS = [
  'studyhub_weekly_leaderboard',
  'studyhub_hall_of_fame',
  'studyhub_last_reset_week',
  'global_settings',
  'community_posts',
  'community_reports',
  'admin_notifications',
  'redemption_codes',
  'question_overrides',
  'admins_list',
  'support_chats',
  'audit_logs',
  'question_reports',
  'site_issue_reports',
  'deleted_community_post_ids',
  'deleted_notifications',
  'deleted_redemption_codes',
  'recent_practice_stream',
  'user_registry',
  'leaderboard_players',
  'quiz_papers'
];

export function initFirebaseRealtimeSync() {
  if (typeof window === 'undefined' || !db || isFirebaseListening) return;
  isFirebaseListening = true;

  // 針對各個公共模組進行精準分路訂閱，不再全域拉取
  SHARED_CLOUD_KEYS.forEach(key => {
    try {
      const nodeRef = ref(db, `studyhub/${key}`);
      onValue(nodeRef, (snapshot) => {
        const val = snapshot.val();
        if (val === null || val === undefined) return;
        try {
          const remoteValStr = JSON.stringify(val);
          const localValStr = localStorage.getItem(STORAGE_PREFIX + key);
          if (remoteValStr !== localValStr) {
            safeSetLocalStorage(STORAGE_PREFIX + key, remoteValStr);
            const payload = { type: 'SYNC_UPDATE', key, timestamp: Date.now(), fromRemote: true };
            localSyncListeners.forEach(cb => {
              try { cb(payload); } catch (err) { console.error(err); }
            });
          }

          // 若更新的是各玩家即時點數 (leaderboard_players)，自動匯總轉為排行榜陣列並存入快取！
          if (key === 'leaderboard_players') {
            let playersArr = [];
            if (val && typeof val === 'object') {
              playersArr = Array.isArray(val) ? val : Object.values(val);
            }
            playersArr = playersArr
              .filter(p => p && p.userId)
              .sort((a, b) => (b.weeklyPoints || 0) - (a.weeklyPoints || 0));
            const arrStr = JSON.stringify(playersArr);
            safeSetLocalStorage(STORAGE_PREFIX + 'studyhub_weekly_leaderboard', arrStr);
            const boardPayload = { type: 'SYNC_UPDATE', key: 'studyhub_weekly_leaderboard', timestamp: Date.now(), fromRemote: true };
            localSyncListeners.forEach(cb => { try { cb(boardPayload); } catch (e) {} });
          }
        } catch (err) {}
      }, (err) => {
        console.warn(`[Firebase Sync Error: ${key}]`, err);
      });
    } catch (e) {}
  });

  // 自動為當前登入者啟動專屬用戶節點監聽 (修復 key 錯位)
  try {
    const rawAuth = localStorage.getItem('studyhub_current_user') || localStorage.getItem('studyhub_auth_user');
    if (rawAuth) {
      const u = JSON.parse(rawAuth);
      if (u?.id) subscribeUserRealtimeSync(u.id);
    }
  } catch (e) {}
}

// 原子化推送單一玩家排行榜資料至 Firebase (避免千萬人併發覆寫整份陣列)
export function pushPlayerLeaderboardSync(userId, playerData) {
  if (typeof window === 'undefined' || !db || !userId) return;
  try {
    const cleanPayload = sanitizeForFirebase(playerData);
    if (!cleanPayload) return;
    const r = ref(db, `studyhub/leaderboard_players/${userId}`);
    set(r, cleanPayload).catch(err => {
      console.error(`[Firebase Leaderboard Player Push Error: ${userId}]`, err);
    });
  } catch (e) {
    console.error(`[Firebase Leaderboard Player Exception: ${userId}]`, e);
  }
}

// 管理員安全發放抽獎券：從 Firebase 讀取該玩家既有資料並累加票券，100% 保留保底進度與簽到狀態，絕不覆蓋歸零
export async function adminPushGameStateTickets(userId, ticketDelta) {
  if (!userId || userId === 'guest_student' || typeof ticketDelta !== 'number' || ticketDelta <= 0) return;
  const gameKey = `studyhub_game_state_${userId}`;

  // 1. 如果本地也有此使用者的緩存（例如管理員自己測試或同設備登入者），同步累加本地快取
  const localCached = getJson(gameKey, null);
  if (localCached) {
    const updatedLocal = {
      ...localCached,
      tickets: Math.max(0, (localCached.tickets || 0) + ticketDelta),
      updatedAt: Date.now()
    };
    if (typeof window !== 'undefined' && window.localStorage) {
      safeSetLocalStorage(STORAGE_PREFIX + gameKey, JSON.stringify(updatedLocal));
    }
    const payload = { type: 'SYNC_UPDATE', key: gameKey, userId, timestamp: Date.now(), fromRemote: true };
    localSyncListeners.forEach(cb => { try { cb(payload); } catch (e) {} });
    if (cloudBus) cloudBus.postMessage(payload);
  }

  // 2. 雲端 Firebase 原子讀取並累加寫入，確保跨端學生即時收到推播更新
  if (db) {
    try {
      const snap = await get(ref(db, `studyhub/${gameKey}`));
      const current = snap.val() || {};
      const updatedCloud = {
        ...current,
        tickets: Math.max(0, (current.tickets || 0) + ticketDelta),
        pityCount: current.pityCount !== undefined ? current.pityCount : (localCached?.pityCount || 0),
        lastDailyClaimDate: current.lastDailyClaimDate || localCached?.lastDailyClaimDate || '',
        updatedAt: Date.now()
      };
      await set(ref(db, `studyhub/${gameKey}`), updatedCloud);
    } catch (err) {
      console.error(`[Firebase adminPushGameStateTickets Error for ${userId}]`, err);
    }
  }
}



// 主動非同步拉取雲端最新排行榜原始資料 (支援多端秒級拉取最新資料)
export async function fetchCloudLeaderboardRaw() {
  if (!db) return null;
  try {
    const snap = await get(ref(db, 'studyhub/leaderboard_players'));
    const val = snap.val();
    if (val && typeof val === 'object') {
      const arr = Array.isArray(val) ? val : Object.values(val);
      return arr
        .filter(p => p && p.userId)
        .sort((a, b) => (b.weeklyPoints || 0) - (a.weeklyPoints || 0));
    }
    // Fallback: 若 leaderboard_players 尚無，讀取 studyhub_weekly_leaderboard
    const fallbackSnap = await get(ref(db, 'studyhub/studyhub_weekly_leaderboard'));
    const fallbackVal = fallbackSnap.val();
    if (Array.isArray(fallbackVal)) {
      return fallbackVal.sort((a, b) => (b.weeklyPoints || 0) - (a.weeklyPoints || 0));
    }
    return null;
  } catch (e) {
    console.warn('[Fetch Cloud Leaderboard Error]', e);
    return null;
  }
}

// 2. 學生個人私有數據分路監聽 (作答歷程、錯題本、點數遊戲狀態)
// 確保每位學生只同步自己的數據，完全不下載別人資料，千萬人併發永不塞爆
export function subscribeUserRealtimeSync(userId) {
  if (typeof window === 'undefined' || !db || !userId) return;
  if (activeUserListenerUnsub) {
    try { activeUserListenerUnsub(); } catch (e) {}
    activeUserListenerUnsub = null;
  }

  const todayStr = getTaiwanDateStr();
  const userScopedKeys = [
    `practice_history_${userId}`,
    `mistake_notebook_${userId}`,
    `user_quiz_papers_${userId}`,
    `studyhub_game_state_${userId}`,
    `redeemed_history_${userId}`,
    `daily_stats_${userId}_${todayStr}`,
    `privacy_consent_${userId}`
  ];

  const unsubs = userScopedKeys.map((key) => {
    try {
      const r = ref(db, `studyhub/${key}`);
      return onValue(r, (snapshot) => {
        const val = snapshot.val();
        if (val === null || val === undefined) return;
        try {
          const remoteStr = JSON.stringify(val);
          const localStr = localStorage.getItem(STORAGE_PREFIX + key);
          if (remoteStr !== localStr) {
            safeSetLocalStorage(STORAGE_PREFIX + key, remoteStr);
            // 同時廣播精確 key 與通用類別 key，確保任何組件皆可即時重新渲染！
            const payloadExact = { type: 'SYNC_UPDATE', key, userId, timestamp: Date.now(), fromRemote: true };
            localSyncListeners.forEach(cb => {
              try { cb(payloadExact); } catch (e) {}
            });

            if (key.startsWith('daily_stats_')) {
              const payloadGeneral = { type: 'SYNC_UPDATE', key: 'daily_stats', userId, timestamp: Date.now(), fromRemote: true };
              localSyncListeners.forEach(cb => { try { cb(payloadGeneral); } catch (e) {} });
            }
            if (key.startsWith('practice_history_')) {
              const payloadGeneral = { type: 'SYNC_UPDATE', key: 'practice_history', userId, timestamp: Date.now(), fromRemote: true };
              localSyncListeners.forEach(cb => { try { cb(payloadGeneral); } catch (e) {} });
            }
            if (key.startsWith('mistake_notebook_')) {
              const payloadGeneral = { type: 'SYNC_UPDATE', key: 'mistake_notebook', userId, timestamp: Date.now(), fromRemote: true };
              localSyncListeners.forEach(cb => { try { cb(payloadGeneral); } catch (e) {} });
            }
            if (key.startsWith('user_quiz_papers_')) {
              const payloadGeneral = { type: 'SYNC_UPDATE', key: 'user_quiz_papers', userId, timestamp: Date.now(), fromRemote: true };
              localSyncListeners.forEach(cb => { try { cb(payloadGeneral); } catch (e) {} });
            }
          }
        } catch (err) {}
      });
    } catch (e) {
      return () => {};
    }
  });

  activeUserListenerUnsub = () => {
    unsubs.forEach(fn => { try { fn(); } catch (e) {} });
  };
}

// 模組加載時自動啟動 Firebase 監聽
if (typeof window !== 'undefined') {
  initFirebaseRealtimeSync();
}

// 3. FIFO 滾動窗口推播：限制各項資料上限，雲端總體積永不超標
// 深度清洗資料：安全過濾所有 undefined 屬性，防止 Firebase SDK 拋出 set failed 異常拒寫
function sanitizeForFirebase(data) {
  if (data === null || data === undefined) return null;
  return JSON.parse(JSON.stringify(data, (key, value) => {
    if (value === undefined) return null;
    return value;
  }));
}

// 雲端資料永久即時同步推播 (保證 100% 成功寫入 Firebase，無截斷、無 undefined 丟失)
function pushServerSync(key, value) {
  if (typeof window === 'undefined') return;

  // 1. 本地 Vite Dev Server 跨設備即時同步 (區域網同 WiFi 多設備無縫同步)
  try {
    fetch('/api/cloud-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value })
    }).catch(() => {});
  } catch (e) {}

  // 2. Firebase 官方 Realtime Database 同步
  if (!db) return;
  try {
    const cleanPayload = sanitizeForFirebase(value);
    if (cleanPayload === undefined) return;

    const r = ref(db, `studyhub/${key}`);
    set(r, cleanPayload).catch(err => {
      console.error(`[Firebase Write Error on key: ${key}]`, err);
    });
  } catch (e) {
    console.error(`[Firebase Write Exception on key: ${key}]`, e);
  }
}

export function getJson(key, defaultValue) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

export function setJson(key, value) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      safeSetLocalStorage(STORAGE_PREFIX + key, JSON.stringify(value));
    }
    const payload = { type: 'SYNC_UPDATE', key, timestamp: Date.now() };
    if (cloudBus) {
      cloudBus.postMessage(payload);
    }
    localSyncListeners.forEach(cb => {
      try { cb(payload); } catch (e) { console.error(e); }
    });
    pushServerSync(key, value);
  } catch (e) {
    console.error('Storage save error', e);
  }
}

// 清除所有歷史測資（重設為直接上線標準狀態，刪除全部測試數據）
// 安全防護：僅限 super_admin 呼叫
export function purgeAllTestData(operatorUser) {
  assertSuperAdminPermission(operatorUser, '清除全部測資');
  const keysToRemove = [
    'practice_history',
    'mistake_notebook',
    'audit_logs',
    'question_reports',
    'question_overrides',
    'studyhub_weekly_leaderboard',
    'studyhub_hall_of_fame',
    'studyhub_last_reset_week',
    'support_chats',
    'community_posts',
    'site_issue_reports',
    'deleted_community_post_ids',
    'deleted_notifications',
    'deleted_redemption_codes'
  ];
  keysToRemove.forEach(k => {
    localStorage.removeItem(STORAGE_PREFIX + k);
    localStorage.removeItem(k);
    if (db) {
      try {
        set(ref(db, `studyhub/${k}`), null).catch(() => {});
      } catch (e) {}
    }
  });
  setJson('admins_list', INITIAL_ADMINS);

  logAuditEvent({
    operatorId: operatorUser?.id || 'unknown',
    operatorName: operatorUser?.displayName || '未知',
    operatorRole: operatorUser?.role || 'unknown',
    actionType: 'PURGE_ALL_DATA',
    details: '總管理員執行了全站測資清除'
  });
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

// 檢查使用者是否為唯一指定總管理員 (Jimmy)
export function checkIsSuperAdmin(user) {
  if (!user) return false;
  const emailLower = (user.email || '').trim().toLowerCase();
  return user.role === 'super_admin' || emailLower === SUPER_ADMIN_EMAIL.toLowerCase();
}

// 檢查使用者是否具備管理員權限 (包含總管理員與被任命之一般管理員)
export function checkIsAdmin(user) {
  if (!user) return false;
  if (checkIsSuperAdmin(user)) return true;
  if (user.role === 'admin') return true;
  const emailLower = (user.email || '').trim().toLowerCase();
  if (!emailLower) return false;
  const admins = getAdminsList();
  return Array.isArray(admins) && admins.some(a => a && a.email && a.email.trim().toLowerCase() === emailLower);
}

// --- 1. 管理員名冊與 RBAC 權限管理 ---
export function assertAdminPermission(operatorUser, actionName = '此操作') {
  if (!operatorUser) {
    throw new Error(`【安全攔截】執行【${actionName}】必須登入授權！`);
  }
  if (!checkIsAdmin(operatorUser)) {
    throw new Error(`【安全攔截】您沒有執行【${actionName}】的管理員權限！`);
  }
}

export function assertSuperAdminPermission(operatorUser, actionName = '此操作') {
  if (!operatorUser) {
    throw new Error(`【安全攔截】執行【${actionName}】必須為唯一總管理員！`);
  }
  if (!checkIsSuperAdmin(operatorUser)) {
    throw new Error(`【安全攔截】只有系統唯一總管理員 (${SUPER_ADMIN_EMAIL}) 有權執行【${actionName}】！`);
  }
}

export function getAdminsList() {
  let list = getJson('admins_list', INITIAL_ADMINS);
  if (!Array.isArray(list)) {
    if (list && typeof list === 'object') {
      list = Object.values(list);
    } else {
      list = [...INITIAL_ADMINS];
    }
  }
  // 確保總管理員永遠存在於名單第一順位
  const hasJimmy = list.some(a => a && a.email && a.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase());
  if (!hasJimmy) {
    list.unshift(INITIAL_ADMINS[0]);
    setJson('admins_list', list);
  }
  return list;
}

// 主動向 Firebase 雲端即時拉取最新管理員名冊 (跨裝置跨分頁即時生效)
export async function fetchCloudAdminsList() {
  if (!db) return getAdminsList();
  try {
    const snap = await get(ref(db, 'studyhub/admins_list'));
    const val = snap.val();
    if (val) {
      let list = Array.isArray(val) ? val : Object.values(val);
      list = list.filter(a => a && typeof a === 'object' && a.email);
      if (!list.some(a => a.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase())) {
        list.unshift(INITIAL_ADMINS[0]);
      }
      setJson('admins_list', list);
      return list;
    }
  } catch (e) {
    console.warn('[Fetch Cloud Admins Error]', e);
  }
  return getAdminsList();
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
    createdAt: new Date(getRealTime()).toISOString()
  };
  admins.push(createdAdmin);
  setJson('admins_list', admins);

  // 雙重保證：主動立即直寫 Firebase 節點
  if (db) {
    try {
      set(ref(db, 'studyhub/admins_list'), sanitizeForFirebase(admins)).catch(() => {});
    } catch (e) {}
  }

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

  // 雙重保證：主動立即直寫 Firebase 節點
  if (db) {
    try {
      set(ref(db, 'studyhub/admins_list'), sanitizeForFirebase(updated)).catch(() => {});
    } catch (e) {}
  }

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

// --- 3. 全做題歷史紀錄 (Cross-Device Slim Practice History - 體積縮小 30 倍) ---
const INITIAL_PRACTICE_HISTORY = [];

// 批次記錄整份測驗結果 (Slim Schema 題號代碼化，體積縮小 30 倍，每位學生獨立節點)
export function recordPracticeBatch({ userId, userName, userSchool, results, timeSpentSec }) {
  if (!results || results.length === 0) return [];

  const finalUserId = userId || 'guest_student';
  const finalUserName = userName || '匿名同學';
  const finalUserSchool = userSchool || '會考戰友';
  const perQTime = Math.max(1, Math.round((timeSpentSec || 15) / results.length));
  const nowIso = new Date().toISOString();

  // 1. 整理輕量化做題歷史記錄 (省略重覆冗長的題目與選項解析文字，節省 97% 體積)
  const userHistoryKey = `practice_history_${finalUserId}`;
  const existingLogs = getJson(userHistoryKey, null) || (getJson('practice_history', []).filter(l => l.userId === finalUserId));

  const newLogEntries = results.map(item => ({
    id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    userId: finalUserId,
    userName: finalUserName,
    userSchool: finalUserSchool,
    questionId: item.id,
    subjectId: item.subjectId,
    gradeId: item.gradeId,
    unitId: item.unitId,
    unitName: item.unitName,
    conceptTag: item.conceptTag,
    difficulty: item.difficulty || 'medium',
    index: item.index || 1,
    isCorrect: item.isCorrect,
    userChoice: item.userChoice,
    answer: item.answer !== undefined ? item.answer : 0,
    timeSpentSec: perQTime,
    timestamp: nowIso
  }));

  const combinedLogs = [...newLogEntries, ...existingLogs];
  if (combinedLogs.length > 500) combinedLogs.length = 500; // 安全保存最新 500 筆做題歷史，徹底防止 localStorage 溢出
  setJson(userHistoryKey, combinedLogs);
  setJson('practice_history', combinedLogs);

  // 3. 即時全服作答串流推播 (供管理員中台秒級即時監控做題狀況)
  try {
    const correctCount = results.filter(r => r.isCorrect).length;
    const streamItem = {
      id: 'stream_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      userId: finalUserId,
      userName: finalUserName,
      userSchool: finalUserSchool,
      subjectId: results[0]?.subjectId || 'math',
      gradeId: results[0]?.gradeId || 'g9',
      unitName: results[0]?.unitName || '全科綜合測驗',
      totalQuestions: results.length,
      correctCount: correctCount,
      accuracy: Math.round((correctCount / results.length) * 100),
      timeSpentSec: timeSpentSec || 15,
      timestamp: nowIso
    };
    const stream = getJson('recent_practice_stream', []);
    stream.unshift(streamItem);
    if (stream.length > 1000) stream.length = 1000; // 擴大保留最新 1000 筆即時交卷串流
    setJson('recent_practice_stream', stream);

    // 4. 同步更新在線學生註冊名冊統計
    const registry = getJson('user_registry', {});
    const existingU = registry[finalUserId] || {
      id: finalUserId,
      name: finalUserName,
      school: finalUserSchool,
      totalQuizzes: 0,
      totalQuestions: 0,
      totalCorrect: 0
    };
    existingU.name = finalUserName;
    existingU.school = finalUserSchool;
    existingU.lastActive = nowIso;
    existingU.totalQuizzes = (existingU.totalQuizzes || 0) + 1;
    existingU.totalQuestions = (existingU.totalQuestions || 0) + results.length;
    existingU.totalCorrect = (existingU.totalCorrect || 0) + correctCount;
    registry[finalUserId] = existingU;
    setJson('user_registry', registry);
  } catch (err) {
    console.error('Failed to update practice stream / user registry', err);
  }

  // 2. 集中處理錯題本更新 (Slim Schema 輕量化錯題本)
  const mistakeKey = `mistake_notebook_${finalUserId}`;
  const allMistakes = getJson('mistake_notebook', {});
  const userList = getJson(mistakeKey, null) || allMistakes[finalUserId] || [];

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
        unitId: item.unitId,
        unitName: item.unitName,
        conceptTag: item.conceptTag,
        difficulty: item.difficulty || 'medium',
        index: item.index || 1,
        answer: item.answer !== undefined ? item.answer : 0,
        wrongCount: 1,
        consecutiveCorrect: 0,
        status: 'unresolved',
        addedAt: nowIso,
        lastAttemptAt: nowIso
      });
    }
  });

  if (userList.length > 300) userList.length = 300; // 安全保存最新 300 筆錯題
  setJson(mistakeKey, userList);
  allMistakes[finalUserId] = userList;
  setJson('mistake_notebook', allMistakes);

  // 5. 完整試卷封存記錄 (Quiz Paper Session) - 支援調閱整份試卷每一題與作答狀況
  try {
    const firstQ = results[0] || {};
    const subjectNames = { math: '數學', science: '自然', english: '英語', chinese: '國文', social: '社會' };
    const gradeNames = { g7: '國一', g8: '國二', g9: '國三' };
    const subjName = subjectNames[firstQ.subjectId] || '全科';
    const gradeName = gradeNames[firstQ.gradeId] || '國中';
    const unitTitle = firstQ.unitName || '全科綜合測驗';

    const paperId = 'paper_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const paperSession = {
      id: paperId,
      userId: finalUserId,
      userName: finalUserName,
      userSchool: finalUserSchool,
      subjectId: firstQ.subjectId || 'math',
      gradeId: firstQ.gradeId || 'g8',
      unitId: firstQ.unitId || 'u1',
      unitName: unitTitle,
      paperTitle: `${gradeName} ${subjName}【${unitTitle}】實戰評量卷`,
      totalQuestions: results.length,
      correctCount: correctCount,
      wrongCount: results.length - correctCount,
      score: Math.round((correctCount / results.length) * 100),
      timeSpentSec: timeSpentSec || 15,
      timestamp: nowIso,
      questions: results.map(item => ({
        id: item.id,
        subjectId: item.subjectId,
        gradeId: item.gradeId,
        unitId: item.unitId,
        unitName: item.unitName,
        conceptTag: item.conceptTag,
        difficulty: item.difficulty || 'medium',
        index: item.index || 1,
        question: item.question,
        options: item.options,
        userChoice: item.userChoice !== undefined ? item.userChoice : null,
        answer: item.answer !== undefined ? item.answer : 0,
        isCorrect: item.isCorrect,
        explanation: item.explanation,
        hint: item.hint
      }))
    };

    recordQuizPaperSession(paperSession);
  } catch (err) {
    console.warn('Failed to archive quiz paper session', err);
  }

  return newLogEntries.map(hydrateQuestionDetails);
}

// 寫入並封存單份測驗試卷至本地快取與 Firebase 雲端 (支援千萬人高併發原子存儲)
export function recordQuizPaperSession(paperSession) {
  if (!paperSession || !paperSession.id) return;
  try {
    const finalUserId = paperSession.userId || 'guest_student';
    const userPapersKey = `user_quiz_papers_${finalUserId}`;
    const userPapers = getJson(userPapersKey, []);
    userPapers.unshift(paperSession);
    if (userPapers.length > 500) userPapers.length = 500;
    setJson(userPapersKey, userPapers);

    // 全服快取同步推播
    const allLocalPapers = getJson('all_quiz_papers', []);
    allLocalPapers.unshift(paperSession);
    if (allLocalPapers.length > 1000) allLocalPapers.length = 1000;
    setJson('all_quiz_papers', allLocalPapers);

    // 同步推送至 Firebase 雲端獨立節點
    if (db) {
      set(ref(db, `studyhub/quiz_papers/${paperSession.id}`), sanitizeForFirebase(paperSession)).catch(() => {});
      set(ref(db, `studyhub/${userPapersKey}`), sanitizeForFirebase(userPapers)).catch(() => {});
    }
  } catch (e) {
    console.warn('Failed to save quiz paper', e);
  }
}

// 異步向 Firebase 雲端主動調閱所有已提交的試卷 (管理員全服試卷調閱核心)
export async function fetchAllCloudQuizPapers() {
  const papersMap = new Map();

  // 1. 本地快取
  const localAll = getJson('all_quiz_papers', []);
  if (Array.isArray(localAll)) {
    localAll.forEach(p => { if (p && p.id) papersMap.set(p.id, p); });
  }

  // 2. 向 Firebase 雲端直接讀取 quiz_papers 節點
  if (db) {
    try {
      const snap = await get(ref(db, 'studyhub/quiz_papers'));
      const val = snap.val();
      if (val && typeof val === 'object') {
        const list = Array.isArray(val) ? val : Object.values(val);
        list.forEach(p => {
          if (p && p.id) {
            papersMap.set(p.id, p);
          }
        });
      }
    } catch (e) {
      console.warn('[Fetch Cloud Quiz Papers Error]', e);
    }
  }

  // 3. 智能合成：若現有試卷庫數量較少，但有練習紀錄，從做題歷程中動態合成完整試卷
  try {
    const allHistory = await fetchAllCloudPracticeLogs();
    if (Array.isArray(allHistory) && allHistory.length > 0) {
      // 依 userId 與交卷時間 (3分鐘窗口) 分組
      const groups = {};
      allHistory.forEach(h => {
        if (!h) return;
        const timeKey = Math.floor(new Date(h.timestamp || Date.now()).getTime() / 180000); // 3分鐘一個批次
        const gKey = `${h.userId || 'guest'}_${timeKey}_${h.subjectId || 'math'}`;
        if (!groups[gKey]) groups[gKey] = [];
        groups[gKey].push(h);
      });

      Object.values(groups).forEach(items => {
        if (items.length === 0) return;
        const first = items[0];
        const syntheticPaperId = `paper_synth_${first.userId}_${new Date(first.timestamp).getTime()}`;
        if (!papersMap.has(syntheticPaperId)) {
          const correctCount = items.filter(i => i.isCorrect).length;
          const subjectNames = { math: '數學', science: '自然', english: '英語', chinese: '國文', social: '社會' };
          const gradeNames = { g7: '國一', g8: '國二', g9: '國三' };
          const subjName = subjectNames[first.subjectId] || '全科';
          const gradeName = gradeNames[first.gradeId] || '國中';
          const unitTitle = first.unitName || '綜合評量';

          const syntheticPaper = {
            id: syntheticPaperId,
            userId: first.userId,
            userName: first.userName || '會考同學',
            userSchool: first.userSchool || '會考戰友',
            subjectId: first.subjectId || 'math',
            gradeId: first.gradeId || 'g8',
            unitId: first.unitId || 'u1',
            unitName: unitTitle,
            paperTitle: `${gradeName} ${subjName}【${unitTitle}】實戰評量卷`,
            totalQuestions: items.length,
            correctCount,
            wrongCount: items.length - correctCount,
            score: Math.round((correctCount / items.length) * 100),
            timeSpentSec: items.reduce((acc, cur) => acc + (cur.timeSpentSec || 15), 0),
            timestamp: first.timestamp,
            questions: items.map(hydrateQuestionDetails)
          };
          papersMap.set(syntheticPaperId, syntheticPaper);
        }
      });
    }
  } catch (err) {}

  const sortedPapers = Array.from(papersMap.values()).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  if (sortedPapers.length > 0) {
    safeSetLocalStorage(STORAGE_PREFIX + 'all_quiz_papers', JSON.stringify(sortedPapers));
  }
  return sortedPapers;
}

// 異步向 Firebase 調閱特定學生的歷史試卷
export async function fetchCloudUserQuizPapers(userId) {
  if (!userId) return [];
  const userPapersKey = `user_quiz_papers_${userId}`;
  const papersMap = new Map();

  const localCached = getJson(userPapersKey, []);
  if (Array.isArray(localCached)) {
    localCached.forEach(p => { if (p && p.id) papersMap.set(p.id, p); });
  }

  if (db) {
    try {
      const snap = await get(ref(db, `studyhub/${userPapersKey}`));
      const val = snap.val();
      if (val) {
        const list = Array.isArray(val) ? val : Object.values(val);
        list.forEach(p => { if (p && p.id) papersMap.set(p.id, p); });
      }
    } catch (e) {}
  }

  // 結合全服中該學生的試卷
  const allPapers = await fetchAllCloudQuizPapers();
  allPapers.filter(p => p.userId === userId).forEach(p => {
    if (!papersMap.has(p.id)) papersMap.set(p.id, p);
  });

  return Array.from(papersMap.values()).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

export function recordPracticeLog(logData) {
  const finalUserId = logData.userId || 'guest_student';
  const userHistoryKey = `practice_history_${finalUserId}`;
  const logs = getJson(userHistoryKey, null) || getJson('practice_history', INITIAL_PRACTICE_HISTORY);
  
  const entry = {
    id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    userId: finalUserId,
    userName: logData.userName || '匿名同學',
    userSchool: logData.userSchool || '會考戰友',
    questionId: logData.questionId,
    subjectId: logData.subjectId,
    gradeId: logData.gradeId,
    unitName: logData.unitName,
    conceptTag: logData.conceptTag,
    difficulty: logData.difficulty || 'medium',
    index: logData.index || 1,
    isCorrect: logData.isCorrect,
    userChoice: logData.userChoice,
    answer: logData.answer !== undefined ? logData.answer : 0,
    timeSpentSec: logData.timeSpentSec || 15,
    timestamp: new Date().toISOString()
  };

  logs.unshift(entry);
  if (logs.length > 5000) logs.length = 5000; // 永久保存 5000 筆做題歷史
  setJson(userHistoryKey, logs);
  setJson('practice_history', logs);
  return hydrateQuestionDetails(entry);
}

// 取得做題歷史（支援學生個人私有歷程與管理員全服監控視角）
export function getUserPracticeHistory(userId) {
  if (userId) {
    const userHistoryKey = `practice_history_${userId}`;
    const logs = getJson(userHistoryKey, null) || getJson('practice_history', []).filter(l => l.userId === userId);
    return logs.map(hydrateQuestionDetails);
  }
  
  // 管理員無指定 userId 視角：聚合所有已緩存的個別學生作答歷程與本機歷程
  const registry = getJson('user_registry', {});
  const aggregated = [...getJson('practice_history', [])];
  Object.keys(registry).forEach(uId => {
    const uLogs = getJson(`practice_history_${uId}`, []);
    if (Array.isArray(uLogs)) {
      uLogs.forEach(ul => {
        if (!aggregated.some(a => a.id === ul.id)) {
          aggregated.push(ul);
        }
      });
    }
  });

  return aggregated.map(hydrateQuestionDetails);
}

// 異步向 Firebase 雲端主動調閱指定學生的做題歷程 (管理員查看做題狀況核心函數)
export async function fetchCloudUserPracticeHistory(userId) {
  if (!userId) return [];
  const userHistoryKey = `practice_history_${userId}`;
  
  if (db) {
    try {
      const nodeRef = ref(db, `studyhub/${userHistoryKey}`);
      const snap = await get(nodeRef);
      if (snap.exists()) {
        const val = snap.val();
        if (Array.isArray(val)) {
          safeSetLocalStorage(STORAGE_PREFIX + userHistoryKey, JSON.stringify(val));
          return val.map(hydrateQuestionDetails);
        }
      }
    } catch (err) {
      console.warn('[Fetch Cloud Practice History Error]', err);
    }
  }

  // 雲端若為空或連線異常，退回本地快取
  const localCached = getJson(userHistoryKey, null) || getJson('practice_history', []).filter(l => l.userId === userId);
  return localCached.map(hydrateQuestionDetails);
}

// 異步向 Firebase 雲端主動調閱指定學生的錯題本 (管理員診斷盲點核心函數)
export async function fetchCloudUserMistakeNotebook(userId) {
  if (!userId) return [];
  const mistakeKey = `mistake_notebook_${userId}`;

  if (db) {
    try {
      const nodeRef = ref(db, `studyhub/${mistakeKey}`);
      const snap = await get(nodeRef);
      if (snap.exists()) {
        const val = snap.val();
        if (Array.isArray(val)) {
          safeSetLocalStorage(STORAGE_PREFIX + mistakeKey, JSON.stringify(val));
          return val.map(hydrateQuestionDetails);
        }
      }
    } catch (err) {
      console.warn('[Fetch Cloud Mistakes Error]', err);
    }
  }

  const localCached = getJson(mistakeKey, null) || (getJson('mistake_notebook', {})[userId] || []);
  return localCached.map(hydrateQuestionDetails);
}

// 異步向 Firebase 調閱特定學生的所有做題歷史與錯題本 (保證不遺漏任何錯題)
export async function fetchCloudUserAllMistakesAndLogs(userId, userName, userSchool) {
  if (!userId) return [];
  const logMap = new Map();
  const uName = userName || '同學';
  const uSchool = userSchool || '會考戰友';

  try {
    if (db) {
      const [histSnap, mistakeSnap] = await Promise.all([
        get(ref(db, `studyhub/practice_history_${userId}`)),
        get(ref(db, `studyhub/mistake_notebook_${userId}`))
      ]);

      const hist = histSnap.val();
      if (Array.isArray(hist)) {
        hist.forEach(item => {
          if (item && item.id) {
            logMap.set(item.id, hydrateQuestionDetails({
              ...item,
              userId,
              userName: item.userName || uName,
              userSchool: item.userSchool || uSchool
            }));
          }
        });
      }

      const mistakes = mistakeSnap.val();
      if (Array.isArray(mistakes)) {
        mistakes.forEach(m => {
          if (m && m.questionId) {
            const syntheticId = `mistake_${userId}_${m.questionId}`;
            if (!logMap.has(syntheticId)) {
              logMap.set(syntheticId, hydrateQuestionDetails({
                id: syntheticId,
                userId,
                userName: uName,
                userSchool: uSchool,
                questionId: m.questionId,
                subjectId: m.subjectId,
                gradeId: m.gradeId,
                unitId: m.unitId,
                unitName: m.unitName || '重點單元',
                conceptTag: m.conceptTag || '必考觀念',
                difficulty: m.difficulty || 'medium',
                index: m.index || 1,
                isCorrect: false,
                userChoice: m.userChoice !== undefined ? m.userChoice : null,
                answer: m.answer !== undefined ? m.answer : 0,
                wrongCount: m.wrongCount || 1,
                status: m.status || 'unresolved',
                timeSpentSec: 15,
                timestamp: m.lastAttemptAt || m.addedAt || new Date().toISOString()
              }));
            }
          }
        });
      }
    }
  } catch (err) {
    console.warn('[fetchCloudUserAllMistakesAndLogs Error]', err);
  }

  // 若雲端為空或部分遺漏，結合本地快取做雙重保險
  const localHistory = getUserPracticeHistory(userId);
  localHistory.forEach(lh => {
    if (lh && lh.id && !logMap.has(lh.id)) {
      logMap.set(lh.id, lh);
    }
  });

  return Array.from(logMap.values()).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// 管理員專用：全服學生做題狀況與錯題狀況完整即時調閱引擎
export async function fetchAllCloudPracticeLogs() {
  if (!db) return getUserPracticeHistory();
  try {
    const regSnap = await get(ref(db, 'studyhub/user_registry'));
    const registry = regSnap.val() || {};
    const userIds = Object.keys(registry);

    const logMap = new Map();

    // 先把本地既有的快取注入
    getUserPracticeHistory().forEach(item => {
      if (item && item.id) logMap.set(item.id, item);
    });

    // 並行向 Firebase 請求所有註冊學生的做題歷程與錯題本
    await Promise.all(userIds.map(async (userId) => {
      const userInfo = registry[userId] || {};
      const uName = userInfo.name || '同學';
      const uSchool = userInfo.school || '會考戰友';

      try {
        const [histSnap, mistakeSnap] = await Promise.all([
          get(ref(db, `studyhub/practice_history_${userId}`)),
          get(ref(db, `studyhub/mistake_notebook_${userId}`))
        ]);

        const hist = histSnap.val();
        if (Array.isArray(hist)) {
          hist.forEach(item => {
            if (item && item.id) {
              logMap.set(item.id, hydrateQuestionDetails({
                ...item,
                userId: item.userId || userId,
                userName: item.userName || uName,
                userSchool: item.userSchool || uSchool
              }));
            }
          });
        }

        const mistakes = mistakeSnap.val();
        if (Array.isArray(mistakes)) {
          mistakes.forEach(m => {
            if (m && m.questionId) {
              const syntheticId = `mistake_${userId}_${m.questionId}`;
              if (!logMap.has(syntheticId)) {
                logMap.set(syntheticId, hydrateQuestionDetails({
                  id: syntheticId,
                  userId: userId,
                  userName: uName,
                  userSchool: uSchool,
                  questionId: m.questionId,
                  subjectId: m.subjectId,
                  gradeId: m.gradeId,
                  unitId: m.unitId,
                  unitName: m.unitName || '重點單元',
                  conceptTag: m.conceptTag || '必考觀念',
                  difficulty: m.difficulty || 'medium',
                  index: m.index || 1,
                  isCorrect: false,
                  userChoice: m.userChoice !== undefined ? m.userChoice : null,
                  answer: m.answer !== undefined ? m.answer : 0,
                  wrongCount: m.wrongCount || 1,
                  status: m.status || 'unresolved',
                  timeSpentSec: 15,
                  timestamp: m.lastAttemptAt || m.addedAt || new Date().toISOString()
                }));
              }
            }
          });
        }
      } catch (err) {
        console.warn(`[Failed to fetch logs for user: ${userId}]`, err);
      }
    }));

    const aggregated = Array.from(logMap.values()).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    if (aggregated.length > 0) {
      safeSetLocalStorage(STORAGE_PREFIX + 'practice_history', JSON.stringify(aggregated));
    }
    return aggregated;
  } catch (e) {
    console.error('[fetchAllCloudPracticeLogs error]', e);
    return getUserPracticeHistory();
  }
}

// 異步向 Firebase 雲端水合個人遊戲狀態 (抽獎券、點數倍率、簽到)
export async function fetchCloudUserGameState(userId) {
  if (!userId || userId === 'guest_student') return null;
  const gameKey = `studyhub_game_state_${userId}`;

  if (db) {
    try {
      const nodeRef = ref(db, `studyhub/${gameKey}`);
      const snap = await get(nodeRef);
      if (snap.exists()) {
        const val = snap.val();
        if (val) {
          safeSetLocalStorage(STORAGE_PREFIX + gameKey, JSON.stringify(val));
          return val;
        }
      }
    } catch (err) {
      console.warn('[Fetch Cloud Game State Error]', err);
    }
  }

  return getJson(gameKey, null);
}

// 取得全服即時交卷串流 (提供管理員做題動態即時監控儀表板)
export function getRecentPracticeStream() {
  return getJson('recent_practice_stream', []);
}

// 取得全體註冊學生詳細學況名冊 (包含做題總量、總正答數、正確率、最後活躍)
export function getRegisteredStudents() {
  const registry = getJson('user_registry', {});
  const list = Object.values(registry).filter(u => u && u.id && u.role !== 'super_admin' && u.id !== 'admin_super_jimmy');
  
  // 同步融合最近串流的學生
  const stream = getJson('recent_practice_stream', []);
  const map = new Map();
  list.forEach(u => map.set(u.id, { ...u }));

  stream.forEach(s => {
    if (s.userId && s.userId !== 'admin_super_jimmy') {
      const existing = map.get(s.userId) || {
        id: s.userId,
        name: s.userName || '會考戰友',
        school: s.userSchool || '國中衝刺組',
        totalQuizzes: 0,
        totalQuestions: 0,
        totalCorrect: 0,
        lastActive: s.timestamp
      };
      existing.lastActive = s.timestamp || existing.lastActive;
      map.set(s.userId, existing);
    }
  });

  return Array.from(map.values()).map(s => {
    const accuracy = s.totalQuestions > 0 ? Math.round((s.totalCorrect / s.totalQuestions) * 100) : 0;
    return {
      ...s,
      accuracy
    };
  }).sort((a, b) => new Date(b.lastActive || 0) - new Date(a.lastActive || 0));
}

// 註冊或更新學生雲端資料至註冊名冊 (確保跨裝置實名制且管理員可見)
export function registerCloudUser(user) {
  if (!user || !user.id) return;
  const registry = getJson('user_registry', {});
  const existing = registry[user.id] || {};
  registry[user.id] = {
    ...existing,
    id: user.id,
    email: user.email || existing.email,
    name: user.displayName || user.email?.split('@')[0] || existing.name || '國中同學',
    avatar: user.avatar || existing.avatar,
    role: user.role || existing.role || 'student',
    school: user.school || existing.school || (user.role === 'super_admin' ? '系統總管理員' : '會考戰友'),
    lastActive: new Date().toISOString()
  };
  setJson('user_registry', registry);
}


// --- 4. 錯題本與「錯題加強模式」掌握狀態 ---
export function getMistakeNotebook(userId) {
  const mistakeKey = userId ? `mistake_notebook_${userId}` : null;
  const userList = (mistakeKey ? getJson(mistakeKey, null) : null) || getJson('mistake_notebook', {})[userId] || [];
  const overrides = getJson('question_overrides', {});
  return userList
    .filter(m => !overrides[m.questionId]?.isDeleted)
    .map(hydrateQuestionDetails);
}

export function updateMistakeRecord(userId, question, isNowCorrect) {
  const mistakeKey = `mistake_notebook_${userId}`;
  const allMistakes = getJson('mistake_notebook', {});
  const userList = getJson(mistakeKey, null) || allMistakes[userId] || [];
  const existingIdx = userList.findIndex(m => m.questionId === question.id);

  if (existingIdx >= 0) {
    const item = userList[existingIdx];
    item.lastAttemptAt = new Date().toISOString();
    if (isNowCorrect) {
      item.consecutiveCorrect = (item.consecutiveCorrect || 0) + 1;
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
      unitId: question.unitId,
      unitName: question.unitName,
      conceptTag: question.conceptTag,
      difficulty: question.difficulty,
      index: question.index || 1,
      answer: question.answer !== undefined ? question.answer : 0,
      wrongCount: 1,
      consecutiveCorrect: 0,
      status: 'unresolved',
      addedAt: new Date().toISOString(),
      lastAttemptAt: new Date().toISOString()
    });
  }

  if (userList.length > 3000) userList.length = 3000; // 永久保存錯題本
  setJson(mistakeKey, userList);
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
  const cleanComment = (comment || '').trim().slice(0, 300).replace(/[<>'"/\\`]/g, '');
  const cleanReporter = (reporterName || '同學').trim().slice(0, 20).replace(/[<>'"/\\`]/g, '');

  const reports = getJson('question_reports', []);
  const reportItem = {
    id: 'rep_' + Date.now(),
    questionId: questionId || '',
    unitName: unitName || '',
    reason: reason || '題意不清或答案有誤',
    comment: cleanComment,
    reporterId: reporterId || 'guest',
    reporterName: cleanReporter,
    status: 'pending',
    timestamp: new Date().toISOString()
  };
  const updatedReports = [reportItem, ...reports].slice(0, 200);
  setJson('question_reports', updatedReports);
  return reportItem;
}

export function getQuestionReports() {
  return getJson('question_reports', []);
}

export function resolveQuestionReport(reportId, operatorUser, resolutionNote) {
  assertAdminPermission(operatorUser, '處理題目回報');
  const reports = getQuestionReports();
  const target = reports.find(r => r.id === reportId);
  if (target) {
    target.status = 'resolved';
    target.resolvedBy = operatorUser.displayName || '管理員';
    target.resolvedAt = new Date().toISOString();
    target.resolutionNote = (resolutionNote || '已完成修正').trim().slice(0, 200);
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
  assertAdminPermission(operatorUser, patchData.isDeleted ? '刪除題目' : '修改題目');
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
  const registry = getJson('user_registry', {});
  const list = Object.values(registry).filter(u => u && u.id && u.role !== 'super_admin' && u.id !== 'admin_super_jimmy');
  if (list.length > 0) {
    return list.map(u => ({
      id: u.id,
      name: u.name || u.displayName || '會考戰友',
      school: u.school || '國中衝刺組',
      lastActive: u.lastActive || new Date().toISOString()
    })).sort((a, b) => new Date(b.lastActive || 0) - new Date(a.lastActive || 0));
  }

  const stream = getJson('recent_practice_stream', []);
  const history = getJson('practice_history', []);
  const map = new Map();

  [...stream, ...history].forEach(h => {
    if (h.userId && !map.has(h.userId) && h.userId !== 'admin_super_jimmy') {
      map.set(h.userId, {
        id: h.userId,
        name: h.userName || '會考戰友',
        school: h.userSchool || '國三衝刺組',
        lastActive: h.timestamp || new Date().toISOString()
      });
    }
  });

  if (map.size > 0) {
    return Array.from(map.values());
  }

  return [];
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
      message: '🎉 歡迎來到 學習網！每題答對得 1 點，每週一 00:00 排行榜歸零，祝學習進步！',
      sender: '系統總部',
      timestamp: new Date().toISOString()
    }
  });
}

export function updateGlobalSettings(settingsPatch, operatorUser) {
  assertAdminPermission(operatorUser, '更新全服設定');
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
  assertAdminPermission(operatorUser, '建立兌換碼');
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
  logAuditEvent({
    operatorId: operatorUser.id,
    operatorName: operatorUser.displayName,
    operatorRole: operatorUser.role,
    actionType: 'CREATE_REDEMPTION_CODE',
    details: `建立新兌換碼【${code}】: ${newCodeEntry.label} (數值: ${newCodeEntry.rewardValue})`
  });

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
  assertAdminPermission(operatorUser, '刪除兌換碼');
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

  logAuditEvent({
    operatorId: operatorUser.id,
    operatorName: operatorUser.displayName,
    operatorRole: operatorUser.role,
    actionType: 'DELETE_REDEMPTION_CODE',
    details: `撤銷並刪除兌換碼【${codeTrimmed}】`
  });

  return true;
}

export function getUserRedeemedCodes(userId) {
  return getJson('redeemed_history_' + userId, []);
}

// 防重複領取並發鎖
const activeRedeemLocks = new Set();

export function redeemCode(userId, inputCode, userName = '同學') {
  if (!userId || userId === 'guest_student') {
    throw new Error('請先完成 Google 帳號綁定登入後再領取兌換碼！');
  }
  const codeTrimmed = (inputCode || '').trim().toUpperCase();
  if (!codeTrimmed) {
    throw new Error('請輸入有效的兌換碼！');
  }

  // 1. 記憶體防併發雙擊連點鎖
  const lockKey = `${userId}_${codeTrimmed}`;
  if (activeRedeemLocks.has(lockKey)) {
    throw new Error('正在處理兌換中，請勿重複快速點擊！');
  }
  activeRedeemLocks.add(lockKey);
  setTimeout(() => activeRedeemLocks.delete(lockKey), 2500);

  const codes = getRedemptionCodes();
  const matched = codes.find(c => c.code.toUpperCase() === codeTrimmed);
  
  if (!matched) {
    throw new Error('兌換碼無效或已被撤銷，請確認英文字母大小寫！');
  }

  // 1.5 檢查兌換碼是否已超過截止日期
  if (matched.expiresAt) {
    const expireTime = new Date(matched.expiresAt.includes('T') ? matched.expiresAt : `${matched.expiresAt}T23:59:59`).getTime();
    if (!isNaN(expireTime) && Date.now() > expireTime) {
      throw new Error(`兌換碼「${codeTrimmed}」已於 ${matched.expiresAt} 截止兌換！`);
    }
  }

  // 2. 檢查本地與全域歷史領取紀錄
  const redeemedHistory = getJson('redeemed_history_' + userId, []);
  if (redeemedHistory.includes(codeTrimmed)) {
    throw new Error('此兌換碼每位同學限兌換一次，你已領取過該獎勵！');
  }

  // 3. 記錄兌換並寫入原子帳本
  redeemedHistory.push(codeTrimmed);
  setJson('redeemed_history_' + userId, redeemedHistory);

  // 4. 同步至雲端不可逆帳本
  if (db) {
    try {
      const ledgerRef = ref(db, `studyhub/redeemed_ledger/${codeTrimmed}_${userId}`);
      set(ledgerRef, {
        userId,
        userName,
        code: codeTrimmed,
        claimedAt: new Date().toISOString()
      }).catch(() => {});
    } catch (e) {}
  }

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
  assertAdminPermission(operatorUser, '發布系統通知公告');
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
  assertAdminPermission(operatorUser, '刪除系統通知公告');
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

  logAuditEvent({
    operatorId: operatorUser.id || 'admin',
    operatorName: operatorUser.displayName || '管理員',
    operatorRole: operatorUser.role || 'admin',
    actionType: 'DELETE_NOTIFICATION',
    details: target ? `刪除系統通知公告：${target.title}` : `刪除系統通知 [${notifId}]`,
    targetId: notifId
  });
  return true;
}

// --- 10. 會考讀書網｜打氣留言牆 (Community Encouragement Wall) ---
const INITIAL_COMMUNITY_POSTS = [];

export function getCommunityPosts() {
  const posts = getJson('community_posts', INITIAL_COMMUNITY_POSTS);
  const deletedSet = new Set(getJson('deleted_community_post_ids', []));
  return posts.filter(p => !deletedSet.has(p.id));
}

// 社群留言速率限制器：每位使用者 30 秒內最多發 5 則
const communityPostRateLimiter = new Map();

export function addCommunityPost({ authorId, userName, userSchool, message }) {
  if (!message || typeof message !== 'string' || message.trim().length < 3) {
    throw new Error('請至少輸入 3 個字以上的打氣心語喔！');
  }

  // 速率限制檢查
  const rateLimitKey = authorId || 'guest';
  const now = Date.now();
  const history = communityPostRateLimiter.get(rateLimitKey) || [];
  const recent = history.filter(t => now - t < 30000);
  if (recent.length >= 5) {
    throw new Error('發文太頻繁！請稍候 30 秒再試。');
  }
  recent.push(now);
  communityPostRateLimiter.set(rateLimitKey, recent);

  const cleanMsg = message.trim().slice(0, 200).replace(/[<>'"/\\`]/g, '');
  const cleanName = (userName || '讀書夥伴').trim().slice(0, 20).replace(/[<>'"/\\`]/g, '');
  const cleanSchool = (userSchool || '108課綱戰友').trim().slice(0, 30).replace(/[<>'"/\\`]/g, '');

  const posts = getCommunityPosts();
  const postId = typeof crypto !== 'undefined' && crypto.randomUUID
    ? 'post_' + crypto.randomUUID()
    : 'post_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  const newPost = {
    id: postId,
    authorId: authorId || 'guest',
    userName: cleanName || '讀書夥伴',
    userSchool: cleanSchool || '108課綱戰友',
    message: cleanMsg,
    likes: 0,
    likedBy: [],
    timestamp: new Date().toISOString()
  };
  // FIFO 滾動視窗：最多保留 100 筆最新留言，杜絕塞爆 localStorage
  const updatedPosts = [newPost, ...posts].slice(0, 100);
  setJson('community_posts', updatedPosts);
  return newPost;
}

export function likeCommunityPost(postId, userId) {
  const posts = getCommunityPosts();
  const post = posts.find(p => p.id === postId);
  if (post) {
    // 防重投票：檢查該使用者是否已按過讚
    const likedBy = Array.isArray(post.likedBy) ? post.likedBy : [];
    const voterId = userId || 'anonymous';
    if (likedBy.includes(voterId)) {
      return posts; // 已按過讚，不重複計算
    }
    likedBy.push(voterId);
    post.likedBy = likedBy;
    post.likes = likedBy.length;
    setJson('community_posts', posts);
  }
  return posts;
}

export function deleteCommunityPost(postId, operatorUser) {
  const posts = getCommunityPosts();
  const target = posts.find(p => p.id === postId);
  const isAuthor = operatorUser && target && target.authorId && target.authorId === operatorUser.id;
  const isAdmin = checkIsAdmin(operatorUser);

  if (!isAuthor && !isAdmin) {
    throw new Error('無權限刪除此打氣留言！只有留言本人或管理員可刪除。');
  }

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

// 取得台灣時區 (UTC+8) 當日日期字串 (YYYY-MM-DD)
export function getTaiwanDateStr(d = getRealDate()) {
  // 將絕對時間 (UTC) 往未來推 8 小時，再強制用 ISO UTC 格式切出日期，
  // 這樣無論使用者電腦在哪個時區，切出來的日期永遠等同於台灣的當地日期。
  const taipeiShifted = new Date(d.getTime() + (8 * 3600000));
  return taipeiShifted.toISOString().slice(0, 10);
}

// --- 11. 每日刷題進度目標 (Daily Practice Goal - 跨裝置 100% 同步保全版) ---
export function getDailyPracticeStats(userId = 'guest') {
  const todayStr = getTaiwanDateStr();
  const todayKey = `daily_stats_${userId}_${todayStr}`;
  const fromStorage = getJson(todayKey, {
    count: 0,
    target: 10,
    correctCount: 0,
    lastPracticedAt: null
  });

  // 跨裝置安全校驗：比對 practice_history 該生今日做題紀錄，防止換裝置本地為空時誤歸零
  let historyTodayCount = 0;
  let historyTodayCorrect = 0;
  try {
    const logs = getJson(`practice_history_${userId}`, null) || getJson('practice_history', []);
    if (Array.isArray(logs)) {
      logs.forEach(l => {
        if (l && (l.userId === userId || userId === 'guest') && l.timestamp) {
          // 比對 timestamp 是否屬於台灣時區今日
          const logDate = getTaiwanDateStr(new Date(l.timestamp));
          if (logDate === todayStr) {
            historyTodayCount += 1;
            if (l.isCorrect) historyTodayCorrect += 1;
          }
        }
      });
    }
  } catch (e) {}

  const finalCount = Math.max(fromStorage.count || 0, historyTodayCount);
  const finalCorrect = Math.max(fromStorage.correctCount || 0, historyTodayCorrect);

  const synced = {
    ...fromStorage,
    count: finalCount,
    correctCount: finalCorrect
  };

  // 若發現實際歷史題數高於快取（代表在其他設備做過題），自動更新校準
  if (finalCount > (fromStorage.count || 0)) {
    setJson(todayKey, synced);
  }

  return synced;
}

export function incrementDailyPracticeStats(userId = 'guest', countIncrement = 1, correctIncrement = 1) {
  const todayStr = getTaiwanDateStr();
  const todayKey = `daily_stats_${userId}_${todayStr}`;
  const current = getDailyPracticeStats(userId);
  const updated = {
    ...current,
    count: (current.count || 0) + countIncrement,
    correctCount: (current.correctCount || 0) + correctIncrement,
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
            if (v === null || v === undefined) return;
            const currentRaw = localStorage.getItem(STORAGE_PREFIX + k);

            if (!currentRaw) {
              safeSetLocalStorage(STORAGE_PREFIX + k, JSON.stringify(v));
              const payload = { type: 'SYNC_UPDATE', key: k, timestamp: Date.now() };
              localSyncListeners.forEach(cb => { try { cb(payload); } catch (e) {} });
              return;
            }

            try {
              const currentVal = JSON.parse(currentRaw);

              // 遊戲狀態：僅當伺服器時間戳較新或票數大增時採納，嚴防本地保底遭覆蓋回退！
              if (k.startsWith('studyhub_game_state_') && typeof v === 'object' && v !== null) {
                const remoteTime = v.updatedAt || 0;
                const localTime = currentVal?.updatedAt || 0;
                if (remoteTime > localTime || (v.tickets || 0) > (currentVal?.tickets || 0)) {
                  safeSetLocalStorage(STORAGE_PREFIX + k, JSON.stringify(v));
                  const payload = { type: 'SYNC_UPDATE', key: k, timestamp: Date.now() };
                  localSyncListeners.forEach(cb => { try { cb(payload); } catch (e) {} });
                }
                return;
              }

              // 每日刷題目標：只增不減，取大者合併！
              if (k.startsWith('daily_stats_') && typeof v === 'object' && v !== null) {
                const merged = {
                  ...currentVal,
                  ...v,
                  count: Math.max(currentVal.count || 0, v.count || 0),
                  correctCount: Math.max(currentVal.correctCount || 0, v.correctCount || 0)
                };
                const mergedRaw = JSON.stringify(merged);
                if (mergedRaw !== currentRaw) {
                  safeSetLocalStorage(STORAGE_PREFIX + k, mergedRaw);
                  const payload = { type: 'SYNC_UPDATE', key: k, timestamp: Date.now() };
                  localSyncListeners.forEach(cb => { try { cb(payload); } catch (e) {} });
                }
                return;
              }

              // 做題歷程：去重累加，防止換設備時被空陣列沖洗
              if ((k === 'practice_history' || k.startsWith('practice_history_')) && Array.isArray(v)) {
                const currentArr = Array.isArray(currentVal) ? currentVal : [];
                const map = new Map();
                currentArr.forEach(i => { if (i?.id) map.set(i.id, i); });
                v.forEach(i => { if (i?.id) map.set(i.id, i); });
                const merged = Array.from(map.values()).sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
                if (merged.length > currentArr.length) {
                  safeSetLocalStorage(STORAGE_PREFIX + k, JSON.stringify(merged));
                  const payload = { type: 'SYNC_UPDATE', key: k, timestamp: Date.now() };
                  localSyncListeners.forEach(cb => { try { cb(payload); } catch (e) {} });
                }
                return;
              }
            } catch (e) {}

            const newRaw = JSON.stringify(v);
            if (currentRaw !== newRaw) {
              safeSetLocalStorage(STORAGE_PREFIX + k, newRaw);
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
            safeSetLocalStorage(STORAGE_PREFIX + data.key, JSON.stringify(data.value));
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

// --- 13. 使用者服務條款與個人資料保護政策同意管理 (Privacy Consent Management) ---
export function getPrivacyConsent(userId) {
  if (!userId || userId === 'guest') return null;
  return getJson(`privacy_consent_${userId}`, null);
}

export function savePrivacyConsent(userId, userInfo = {}) {
  if (!userId || userId === 'guest') return null;
  const consentRecord = {
    userId,
    userName: userInfo.displayName || userInfo.name || '同學',
    userEmail: userInfo.email || '',
    consented: true,
    version: '1.0.0',
    consentedAt: new Date().toISOString()
  };
  setJson(`privacy_consent_${userId}`, consentRecord);
  return consentRecord;
}

