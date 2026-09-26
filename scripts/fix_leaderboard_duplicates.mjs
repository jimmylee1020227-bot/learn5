import { db } from '../src/services/firebase.js';
import { ref, get, set } from 'firebase/database';

async function fixLeaderboardDuplicates() {
  console.log('--- 開始修復排行榜重複問題 ---');
  const snap = await get(ref(db, 'studyhub/leaderboard_players'));
  const raw = snap.val() || {};
  
  const rawArr = Array.isArray(raw) ? raw : Object.values(raw);
  console.log(`讀取到 ${rawArr.length} 筆原始玩家節點`);

  const playerMap = new Map();
  for (const p of rawArr) {
    if (!p || !p.userId) continue;
    const existing = playerMap.get(p.userId);
    if (!existing) {
      playerMap.set(p.userId, { ...p });
    } else {
      console.log(`發現重複玩家: ${p.userId} (${p.displayName || existing.displayName})`);
      // 合併：取最新的 updatedAt 或最高積分
      const higherWeekly = Math.max(existing.weeklyPoints || 0, p.weeklyPoints || 0);
      const higherTotal = Math.max(existing.totalPoints || 0, p.totalPoints || 0);
      const latestTime = Math.max(existing.updatedAt || 0, p.updatedAt || 0);
      const bestName = (existing.updatedAt || 0) >= (p.updatedAt || 0) 
        ? (existing.displayName || p.displayName) 
        : (p.displayName || existing.displayName);

      playerMap.set(p.userId, {
        ...existing,
        ...p,
        displayName: bestName,
        weeklyPoints: higherWeekly,
        totalPoints: higherTotal,
        updatedAt: latestTime
      });
    }
  }

  console.log(`去重後共有 ${playerMap.size} 位唯一選手`);

  // 將 Firebase studyhub/leaderboard_players 重組為以 userId 為 Key 的標準字典結構！
  const sanitizedPlayersObject = {};
  playerMap.forEach((player, uid) => {
    sanitizedPlayersObject[uid] = player;
  });

  // 生成依週積分排序的排行榜陣列
  const sortedBoard = Array.from(playerMap.values())
    .sort((a, b) => (b.weeklyPoints || 0) - (a.weeklyPoints || 0));

  // 寫入 Firebase
  console.log('寫入 Firebase studyhub/leaderboard_players (以 userId 為 Key)...');
  await set(ref(db, 'studyhub/leaderboard_players'), sanitizedPlayersObject);

  console.log('寫入 Firebase studyhub/studyhub_weekly_leaderboard...');
  await set(ref(db, 'studyhub/studyhub_weekly_leaderboard'), sortedBoard);

  console.log('=== 排行榜重複數據修復完成 ===');
  console.log('前 10 名名單：');
  sortedBoard.slice(0, 10).forEach((p, idx) => {
    console.log(`#${idx + 1} ${p.displayName} (UID: ${p.userId}): ${p.weeklyPoints} 點 (總分: ${p.totalPoints})`);
  });
  
  process.exit(0);
}

fixLeaderboardDuplicates().catch(err => {
  console.error('修復失敗:', err);
  process.exit(1);
});
