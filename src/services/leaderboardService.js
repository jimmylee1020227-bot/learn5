// 每週一 00:00 歸零排行榜與點數服務層 - 整合 Firebase 跨裝置即時原子化同步版
import { 
  logAuditEvent, 
  getJson, 
  setJson, 
  pushPlayerLeaderboardSync, 
  fetchCloudLeaderboardRaw,
  assertAdminPermission,
  adminPushGameStateTickets
} from './cloudStorage';
import { getRealDate, getRealTime } from './timeService';

const LEADERBOARD_KEY = 'studyhub_weekly_leaderboard';
const HALL_OF_FAME_KEY = 'studyhub_hall_of_fame';
const LAST_WEEK_KEY = 'studyhub_last_reset_week';

// 取得台北時區 (UTC+8) 的 ISO 週次識別碼 (例如: 2026-W38)
export function getTaiwanWeekId(d = getRealDate()) {
  const taipeiShifted = new Date(d.getTime() + (8 * 3600000));
  
  // 計算本週週一
  const day = taipeiShifted.getUTCDay();
  const diff = taipeiShifted.getUTCDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(taipeiShifted);
  monday.setUTCDate(diff);
  
  const year = monday.getUTCFullYear();
  const firstJan = new Date(Date.UTC(year, 0, 1));
  const numberOfDays = Math.floor((monday.getTime() - firstJan.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((numberOfDays + firstJan.getUTCDay() + 1) / 7);
  return `${year}-W${String(weekNumber).padStart(2, '0')}`;
}

// 計算距離「下週一 00:00:00 (UTC+8)」的倒數毫秒與時分秒
export function getNextMondayCountdown() {
  const now = getRealDate();
  
  // 取得台灣時間的絕對值 (將 UTC 加上 8 小時偏移量)
  const taipeiShifted = new Date(now.getTime() + (8 * 3600000));
  
  const dayOfWeek = taipeiShifted.getUTCDay(); // 0(週日) ~ 6(週六)
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  
  const nextMonday = new Date(taipeiShifted);
  // 使用 UTC 方法設定下週一的時間，確保絕對時間的精確對齊
  nextMonday.setUTCDate(taipeiShifted.getUTCDate() + daysUntilMonday);
  nextMonday.setUTCHours(0, 0, 0, 0);

  // 計算與現在的絕對毫秒差
  const diffMs = Math.max(0, nextMonday.getTime() - taipeiShifted.getTime());
  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { diffMs, days, hours, minutes, seconds };
}

// 正式環境初始乾淨榜單（無任何虛構測資）
const INITIAL_LEADERBOARD = [];
const INITIAL_HALL_OF_FAME = [];

// 檢查每週一歸零機制
export function checkAndExecuteWeeklyReset() {
  const currentWeekId = getTaiwanWeekId();
  const lastResetWeek = getJson(LAST_WEEK_KEY, null);

  if (!lastResetWeek) {
    setJson(LAST_WEEK_KEY, currentWeekId);
    return;
  }

  // 若發現進入全新的一週，自動將舊排行榜前三名封存至名人堂，並重置每週分數為 0
  if (lastResetWeek !== currentWeekId) {
    const board = getJson(LEADERBOARD_KEY, INITIAL_LEADERBOARD);
    
    // 【防誤抹除安全守衛】：若榜單中已存在當週且具備分數的玩家，代表全服本週早就已重置並進入全新週期！
    // 此時僅需將本地過期標記校正為 currentWeekId，嚴禁覆蓋抹殺其他同學本週累積的積分！
    const alreadyResetInCloud = board.some(p => p.weekId === currentWeekId && (p.weeklyPoints || 0) > 0);
    if (alreadyResetInCloud) {
      setJson(LAST_WEEK_KEY, currentWeekId);
      return;
    }

    board.sort((a, b) => (b.weeklyPoints || 0) - (a.weeklyPoints || 0));

    if (board.length > 0 && board[0].weeklyPoints > 0) {
      const fameList = getJson(HALL_OF_FAME_KEY, INITIAL_HALL_OF_FAME);
      fameList.unshift({
        weekId: lastResetWeek,
        weekTitle: `${lastResetWeek} 冠軍週結算`,
        champion: {
          displayName: board[0].displayName,
          avatar: board[0].avatar,
          finalScore: board[0].weeklyPoints
        },
        runnersUp: board.slice(1, 3).map(u => `${u.displayName} (${u.weeklyPoints}分)`)
      });
      setJson(HALL_OF_FAME_KEY, fameList);
    }

    // 每週一分數歸零！同時原子化更新雲端玩家節點
    const resetBoard = board.map(player => {
      const updated = {
        ...player,
        weeklyPoints: 0,
        weekId: currentWeekId,
        updatedAt: getRealTime()
      };
      pushPlayerLeaderboardSync(player.userId, updated);
      return updated;
    });
    setJson(LEADERBOARD_KEY, resetBoard);
    setJson(LAST_WEEK_KEY, currentWeekId);

    logAuditEvent({
      operatorId: 'system_cron',
      operatorName: '週一零點定時引擎',
      operatorRole: 'system',
      actionType: 'WEEKLY_RESET',
      details: `自動結算 ${lastResetWeek} 並歸零本週榜單，進入全新週次 ${currentWeekId}`
    });
  }
}

// 取得當週即時排行榜 (本地快取並排序)
export function getLeaderboard() {
  checkAndExecuteWeeklyReset();
  const list = getJson(LEADERBOARD_KEY, INITIAL_LEADERBOARD);
  return list.sort((a, b) => (b.weeklyPoints || 0) - (a.weeklyPoints || 0));
}

// 主動向 Firebase RTDB 拉取最新全服榜單，確保跨裝置 100% 同步
export async function fetchCloudLeaderboard() {
  try {
    const remoteBoard = await fetchCloudLeaderboardRaw();
    if (remoteBoard && Array.isArray(remoteBoard)) {
      setJson(LEADERBOARD_KEY, remoteBoard);
      return remoteBoard;
    }
  } catch (e) {
    console.warn('[Fetch Cloud Leaderboard Error]', e);
  }
  return getLeaderboard();
}

// 取得歷史名人堂
export function getHallOfFame() {
  return getJson(HALL_OF_FAME_KEY, INITIAL_HALL_OF_FAME);
}

// 防惡意腳本刷分：客戶端頻率冷卻表
const pointEarnRateTracker = new Map();

// 學生作答答對計分：答對 1 題 = +1 點數（支援 2x / 4x 暴擊）
export function addStudentPoints(user, earnedPoints) {
  if (!user || !user.id) return null;
  
  // 防洗分防作弊檢驗：必須為有效正整數，且單次不得超過合理上限 (300點)
  if (typeof earnedPoints !== 'number' || !Number.isFinite(earnedPoints) || earnedPoints <= 0) {
    console.warn('[Security Guard] 拒絕無效點數增量:', earnedPoints);
    return null;
  }

  // 頻率限制：1 秒內不可超過 8 次加分請求
  const now = getRealTime();
  const history = pointEarnRateTracker.get(user.id) || [];
  const recent = history.filter(t => now - t < 1000);
  if (recent.length >= 8) {
    console.warn('[Security Guard] 偵測到異常高頻計分請求，已觸發安全限速！');
    return null;
  }
  recent.push(now);
  pointEarnRateTracker.set(user.id, recent);

  const safeEarned = Math.min(Math.floor(earnedPoints), 300);

  const currentWeekId = getTaiwanWeekId();
  const board = getLeaderboard();
  let player = board.find(p => p.userId === user.id);

  if (!player) {
    player = {
      userId: user.id,
      email: user.email || '',
      displayName: user.displayName || user.email?.split('@')[0] || '國中同學',
      avatar: user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.id)}`,
      weeklyPoints: 0,
      totalPoints: 0,
      tickets: 1,
      weekId: currentWeekId,
      updatedAt: getRealTime()
    };
    board.push(player);
  }

  // 跨裝置安全合併：如果玩家物件中的週次已過期，重設為新週次
  if (player.weekId && player.weekId !== currentWeekId) {
    player.weeklyPoints = 0;
    player.weekId = currentWeekId;
  }

  player.displayName = user.displayName || player.displayName || '國中同學';
  player.avatar = user.avatar || player.avatar;
  player.email = user.email || player.email || '';
  player.weeklyPoints = (player.weeklyPoints || 0) + safeEarned;
  player.totalPoints = (player.totalPoints || 0) + safeEarned;
  player.weekId = currentWeekId;
  player.updatedAt = getRealTime();

  // 1. 本地儲存與廣播
  setJson(LEADERBOARD_KEY, board);

  // 2. Firebase 雲端獨立節點原子化即時推播 (保證千萬人併發互不踩踏覆蓋)
  pushPlayerLeaderboardSync(user.id, player);

  return player;
}

// 更新使用者暱稱
export function updatePlayerDisplayName(userId, newName) {
  if (!newName || typeof newName !== 'string') return;
  const sanitized = newName.trim().slice(0, 20).replace(/[<>'"/\\`]/g, '');
  if (!sanitized) return;

  const board = getLeaderboard();
  const player = board.find(p => p.userId === userId);
  if (player) {
    player.displayName = sanitized;
    player.updatedAt = getRealTime();
    setJson(LEADERBOARD_KEY, board);
    pushPlayerLeaderboardSync(userId, player);
  }
}

// 管理員權限：發放點數
export function adminGrantPoints(targetUserId, points, operatorUser) {
  assertAdminPermission(operatorUser, '發放點數');
  if (typeof points !== 'number' || !Number.isFinite(points) || points <= 0) {
    throw new Error('點數必須為大於 0 的有效數值！');
  }
  const safePoints = Math.min(Math.floor(points), 50000); // 單次管理員發放安全上限

  const currentWeekId = getTaiwanWeekId();
  const board = getLeaderboard();
  let msg = '';
  if (targetUserId === 'ALL') {
    try {
      const registry = getJson('user_registry', {});
      Object.values(registry || {}).forEach(u => {
        if (!u?.id || u.role === 'super_admin' || u.id === 'admin_super_jimmy') return;
        let p = board.find(item => item.userId === u.id);
        if (!p) {
          p = {
            userId: u.id,
            email: u.email || '',
            displayName: u.displayName || u.name || '國中同學',
            avatar: u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(u.id)}`,
            weeklyPoints: 0,
            totalPoints: 0,
            tickets: 1,
            weekId: currentWeekId,
            updatedAt: getRealTime()
          };
          board.push(p);
        }
      });
    } catch (e) {}

    board.forEach(p => {
      p.weeklyPoints = (p.weeklyPoints || 0) + safePoints;
      p.totalPoints = (p.totalPoints || 0) + safePoints;
      p.weekId = currentWeekId;
      p.updatedAt = getRealTime();
      pushPlayerLeaderboardSync(p.userId, p);
    });
    msg = `向全體玩家 (${board.length} 人) 發放 ${safePoints} 點數`;
  } else {
    const target = board.find(p => p.userId === targetUserId);
    if (target) {
      target.weeklyPoints = (target.weeklyPoints || 0) + safePoints;
      target.totalPoints = (target.totalPoints || 0) + safePoints;
      target.weekId = currentWeekId;
      target.updatedAt = getRealTime();
      pushPlayerLeaderboardSync(target.userId, target);
      msg = `向玩家【${target.displayName}】發放 ${safePoints} 點數`;
    }
  }
  setJson(LEADERBOARD_KEY, board);

  logAuditEvent({
    operatorId: operatorUser.id,
    operatorName: operatorUser.displayName,
    operatorRole: operatorUser.role,
    actionType: 'GRANT_POINTS',
    details: msg,
    targetId: targetUserId
  });
}

// 管理員權限：發放抽獎券
export function adminGrantTickets(targetUserId, ticketCount, operatorUser) {
  assertAdminPermission(operatorUser, '發放抽獎券');
  if (typeof ticketCount !== 'number' || !Number.isFinite(ticketCount) || ticketCount <= 0) {
    throw new Error('抽獎券數量必須為大於 0 的有效整數！');
  }
  const safeTickets = Math.min(Math.floor(ticketCount), 500); // 單次管理員發放安全上限

  const board = getLeaderboard();
  let msg = '';
  if (targetUserId === 'ALL') {
    // 收集所有在榜玩家與名冊玩家的唯一 ID，確保 100% 所有學生都領得到
    const allUserIds = new Set(board.map(p => p.userId));
    try {
      const registry = getJson('user_registry', {});
      Object.keys(registry || {}).forEach(id => allUserIds.add(id));
    } catch (e) {}

    board.forEach(p => {
      p.tickets = (p.tickets || 0) + safeTickets;
      p.updatedAt = getRealTime();
      pushPlayerLeaderboardSync(p.userId, p);
    });

    allUserIds.forEach(uId => {
      adminPushGameStateTickets(uId, safeTickets);
    });

    msg = `向全體玩家 (${allUserIds.size} 人) 發放 ${safeTickets} 張抽獎券`;
  } else {
    const target = board.find(p => p.userId === targetUserId);
    if (target) {
      target.tickets = (target.tickets || 0) + safeTickets;
      target.updatedAt = getRealTime();
      pushPlayerLeaderboardSync(target.userId, target);
      adminPushGameStateTickets(target.userId, safeTickets);
      msg = `向玩家【${target.displayName}】發放 ${safeTickets} 張抽獎券`;
    } else {
      adminPushGameStateTickets(targetUserId, safeTickets);
      msg = `向玩家 [${targetUserId}] 發放 ${safeTickets} 張抽獎券`;
    }
  }
  setJson(LEADERBOARD_KEY, board);

  logAuditEvent({
    operatorId: operatorUser.id,
    operatorName: operatorUser.displayName,
    operatorRole: operatorUser.role,
    actionType: 'GRANT_TICKETS',
    details: msg,
    targetId: targetUserId
  });
}
