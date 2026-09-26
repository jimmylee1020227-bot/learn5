import { db } from '../src/services/firebase.js';
import { ref, get, set } from 'firebase/database';

const UID = 'u_knbo67cox0xp';
const POINTS = 50;

async function main() {
  // 1. 檢查 leaderboard_players 節點
  const lbSnap = await get(ref(db, `studyhub/leaderboard_players/${UID}`));
  const lbData = lbSnap.val();
  console.log('排行榜資料：', JSON.stringify(lbData, null, 2));

  // 2. 確認 user_registry 節點
  const regSnap = await get(ref(db, `studyhub/user_registry/${UID}`));
  const regData = regSnap.val();
  console.log('名冊資料：', JSON.stringify(regData, null, 2));

  // 3. 把 leaderboard weeklyPoints 也設成 50
  const newLb = {
    ...(lbData || {}),
    userId: UID,
    displayName: regData?.name || '小編',
    name: regData?.name || '小編',
    avatar: regData?.avatar || '',
    school: regData?.school || '會考戰友',
    weeklyPoints: POINTS,
    updatedAt: Date.now()
  };
  await set(ref(db, `studyhub/leaderboard_players/${UID}`), newLb);
  console.log(`✅ 小編排行榜 weeklyPoints 已設為 ${POINTS}`);

  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
