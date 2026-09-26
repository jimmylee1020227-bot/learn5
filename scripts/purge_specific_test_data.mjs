import { db } from '../src/services/firebase.js';
import { ref, get, set, remove } from 'firebase/database';

async function purgeTestAccounts() {
  console.log('🧹 開始徹底清除指定的測試學生節點與所有關聯做題歷程...');
  
  const testUids = [
    'student_test_all_sync',
    'test_student_fix_check',
    'test_student_synctest',
    'u_btnvoclzbcu'
  ];

  const snap = await get(ref(db, 'studyhub'));
  const allData = snap.val() || {};

  // 1. 移除各測試學生的專屬節點
  for (const uid of testUids) {
    console.log(`  -> 正在清除使用者節點: ${uid}`);
    await remove(ref(db, `studyhub/practice_history_${uid}`));
    await remove(ref(db, `studyhub/mistake_notebook_${uid}`));
    await remove(ref(db, `studyhub/user_quiz_papers_${uid}`));
    await remove(ref(db, `studyhub/studyhub_game_state_${uid}`));
    await remove(ref(db, `studyhub/redeemed_history_${uid}`));
    await remove(ref(db, `studyhub/lottery_claim_${uid}`));
  }

  // 2. 清除 user_registry
  if (allData.user_registry) {
    let users = Array.isArray(allData.user_registry) ? allData.user_registry : Object.values(allData.user_registry);
    const beforeCount = users.length;
    users = users.filter(u => {
      if (!u) return false;
      const uid = String(u.id || '').trim();
      const name = String(u.name || '').trim();
      if (testUids.includes(uid)) return false;
      if (name.includes('測試') || name.includes('test') || name === '王小明') return false;
      return true;
    });
    console.log(`  -> user_registry: ${beforeCount} -> ${users.length} 位`);
    await set(ref(db, 'studyhub/user_registry'), users);
  }

  // 3. 清除 全域 practice_history
  if (allData.practice_history) {
    let logs = Array.isArray(allData.practice_history) ? allData.practice_history : Object.values(allData.practice_history);
    const beforeLogs = logs.length;
    logs = logs.filter(l => {
      if (!l) return false;
      const uid = String(l.userId || '').trim();
      const name = String(l.userName || '').trim();
      if (testUids.includes(uid)) return false;
      if (name.includes('測試') || name.includes('test') || name === '王小明') return false;
      return true;
    });
    console.log(`  -> 全域 practice_history: ${beforeLogs} -> ${logs.length} 筆`);
    await set(ref(db, 'studyhub/practice_history'), logs);
  }

  // 4. 清除 全域 quiz_papers 與 all_quiz_papers
  for (const paperKey of ['quiz_papers', 'all_quiz_papers']) {
    if (allData[paperKey]) {
      let papers = Array.isArray(allData[paperKey]) ? allData[paperKey] : Object.values(allData[paperKey]);
      const beforePapers = papers.length;
      papers = papers.filter(p => {
        if (!p) return false;
        const uid = String(p.userId || p.ownerId || '').trim();
        const name = String(p.userName || '').trim();
        if (testUids.includes(uid)) return false;
        if (name.includes('測試') || name.includes('test') || name === '王小明') return false;
        return true;
      });
      console.log(`  -> 全域 ${paperKey}: ${beforePapers} -> ${papers.length} 份`);
      await set(ref(db, `studyhub/${paperKey}`), papers);
    }
  }

  // 5. 清除 recent_practice_stream
  if (allData.recent_practice_stream) {
    let stream = Array.isArray(allData.recent_practice_stream) ? allData.recent_practice_stream : Object.values(allData.recent_practice_stream);
    stream = stream.filter(s => {
      if (!s) return false;
      const uid = String(s.userId || '').trim();
      const name = String(s.userName || '').trim();
      if (testUids.includes(uid)) return false;
      if (name.includes('測試') || name.includes('test') || name === '王小明') return false;
      return true;
    });
    await set(ref(db, 'studyhub/recent_practice_stream'), stream);
  }

  // 6. 清除 leaderboard_players
  if (allData.leaderboard_players) {
    let players = Array.isArray(allData.leaderboard_players) ? allData.leaderboard_players : Object.values(allData.leaderboard_players);
    players = players.filter(p => {
      if (!p) return false;
      const uid = String(p.id || p.userId || '').trim();
      const name = String(p.name || '').trim();
      if (testUids.includes(uid)) return false;
      if (name.includes('測試') || name.includes('test') || name === '王小明') return false;
      return true;
    });
    await set(ref(db, 'studyhub/leaderboard_players'), players);
  }

  console.log('✅ 測試學生測資全部清除完畢！');
  process.exit(0);
}

purgeTestAccounts().catch(err => {
  console.error('❌ 清除失敗:', err);
  process.exit(1);
});
