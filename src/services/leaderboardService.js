// 每週一 00:00 歸零排行榜與點數服務層 - 整合 Firebase 跨裝置即時同步版
import { logAuditEvent, getJson, setJson } from './cloudStorage';

const LEADERBOARD_KEY = 'studyhub_weekly_leaderboard';
const HALL_OF_FAME_KEY = 'studyhub_hall_of_fame';
const LAST_WEEK_KEY = 'studyhub_last_reset_week';

// 取得台北時區 (UTC+8) 的 ISO 週次識別碼 (例如: 2026-W38)
export function getTaiwanWeekId(d = new Date()) {
  const utcTime = d.getTime() + (d.getTimezoneOffset() * 60000);
  const taipeiTime = new Date(utcTime + (3600000 * 8));
  
  // 計算本週週一
  const day = taipeiTime.getDay();
  const diff = taipeiTime.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(taipeiTime.setDate(diff));
  
  const year = monday.getFullYear();
  const firstJan = new Date(year, 0, 1);
  const numberOfDays = Math.floor((monday - firstJan) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((numberOfDays + firstJan.getDay() + 1) / 7);
  return `${year}-W${String(weekNumber).padStart(2, '0')}`;
}

// 計算距離「下週一 00:00:00 (UTC+8)」的倒數毫秒與時分秒
export function getNextMondayCountdown() {
  const now = new Date();
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const taipeiNow = new Date(utcTime + (3600000 * 8));

  const dayOfWeek = taipeiNow.getDay(); // 0(週日) ~ 6(週六)
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;

  const nextMonday = new Date(taipeiNow);
  nextMonday.setDate(taipeiNow.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0);

  const diffMs = Math.max(0, nextMonday.getTime() - taipeiNow.getTime());
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
    board.sort((a, b) => b.weeklyPoints - a.weeklyPoints);

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

    // 每週一分數歸零！
    const resetBoard = board.map(player => ({
      ...player,
      weeklyPoints: 0
    }));
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

// 取得當週即時排行榜
export function getLeaderboard() {
  checkAndExecuteWeeklyReset();
  const list = getJson(LEADERBOARD_KEY, INITIAL_LEADERBOARD);
  return list.sort((a, b) => b.weeklyPoints - a.weeklyPoints);
}

// 取得歷史名人堂
export function getHallOfFame() {
  return getJson(HALL_OF_FAME_KEY, INITIAL_HALL_OF_FAME);
}

// 學生作答答對計分：答對 1 題 = +1 點數（支援 2x / 4x 暴擊）
export function addStudentPoints(user, earnedPoints) {
  if (!user || !user.id) return null;
  const board = getLeaderboard();
  let player = board.find(p => p.userId === user.id);

  if (!player) {
    player = {
      userId: user.id,
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0] || '國中同學',
      avatar: user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.id)}`,
      weeklyPoints: 0,
      totalPoints: 0,
      tickets: 1
    };
    board.push(player);
  }

  player.displayName = user.displayName || player.displayName;
  player.avatar = user.avatar || player.avatar;
  player.weeklyPoints += earnedPoints;
  player.totalPoints += earnedPoints;

  setJson(LEADERBOARD_KEY, board);
  return player;
}

// 更新使用者暱稱
export function updatePlayerDisplayName(userId, newName) {
  const board = getLeaderboard();
  const player = board.find(p => p.userId === userId);
  if (player) {
    player.displayName = newName;
    setJson(LEADERBOARD_KEY, board);
  }
}

// 管理員權限：發放點數
export function adminGrantPoints(targetUserId, points, operatorUser) {
  const board = getLeaderboard();
  let msg = '';
  if (targetUserId === 'ALL') {
    board.forEach(p => {
      p.weeklyPoints += points;
      p.totalPoints += points;
    });
    msg = `向全體在榜玩家發放 ${points} 點數`;
  } else {
    const target = board.find(p => p.userId === targetUserId);
    if (target) {
      target.weeklyPoints += points;
      target.totalPoints += points;
      msg = `向玩家【${target.displayName}】發放 ${points} 點數`;
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
  const board = getLeaderboard();
  let msg = '';
  if (targetUserId === 'ALL') {
    board.forEach(p => {
      p.tickets = (p.tickets || 0) + ticketCount;
    });
    msg = `向全體在榜玩家發放 ${ticketCount} 張抽獎券`;
  } else {
    const target = board.find(p => p.userId === targetUserId);
    if (target) {
      target.tickets = (target.tickets || 0) + ticketCount;
      msg = `向玩家【${target.displayName}】發放 ${ticketCount} 張抽獎券`;
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
