import { db } from '../src/services/firebase.js';
import { ref, get, set, remove } from 'firebase/database';

async function auditAndCleanupTestData() {
  console.log('🔍 正在檢驗 Firebase 雲端資料庫使用者與考卷紀錄...');
  const snap = await get(ref(db, 'studyhub'));
  const allData = snap.val() || {};

  const userRegistry = allData.user_registry || {};
  const users = Array.isArray(userRegistry) ? userRegistry : Object.values(userRegistry);
  console.log(`📋 目前註冊學生總數: ${users.length} 位`);
  
  const testUsers = [];
  users.forEach(u => {
    if (!u) return;
    const name = String(u.name || '').trim().toLowerCase();
    const id = String(u.id || '').trim().toLowerCase();
    const email = String(u.email || '').trim().toLowerCase();
    if (name.includes('test') || name.includes('測試') || id.startsWith('test_') || email.includes('test@test')) {
      testUsers.push(u);
    }
  });

  console.log(`🔎 偵測到的測試學生數: ${testUsers.length}`);
  if (testUsers.length > 0) {
    console.log('正在清理測試學生...', testUsers.map(u => u.name));
    for (const tu of testUsers) {
      // 移除該測試生的獨立節點
      if (tu.id) {
        await remove(ref(db, `studyhub/user_quiz_papers_${tu.id}`));
        await remove(ref(db, `studyhub/practice_history_${tu.id}`));
        await remove(ref(db, `studyhub/mistake_notebook_${tu.id}`));
        await remove(ref(db, `studyhub/lottery_claim_${tu.id}`));
      }
    }
    // 更新 user_registry
    const cleanUsers = users.filter(u => !testUsers.some(tu => tu.id === u.id));
    await set(ref(db, 'studyhub/user_registry'), cleanUsers);
  }

  // 檢查考卷
  const papers = Array.isArray(allData.quiz_papers) ? allData.quiz_papers : (allData.quiz_papers ? Object.values(allData.quiz_papers) : []);
  console.log(`📝 目前全域考卷總數: ${papers.length} 份`);
  const testPapers = papers.filter(p => {
    if (!p) return false;
    const name = String(p.userName || '').trim().toLowerCase();
    const id = String(p.id || '').trim().toLowerCase();
    return name.includes('test') || name.includes('測試') || id.includes('test_');
  });

  console.log(`🔎 偵測到的測試考卷數: ${testPapers.length}`);
  if (testPapers.length > 0) {
    const cleanPapers = papers.filter(p => !testPapers.some(tp => tp.id === p.id));
    await set(ref(db, 'studyhub/quiz_papers'), cleanPapers);
    await set(ref(db, 'studyhub/all_quiz_papers'), cleanPapers);
  }

  // 檢查排行榜
  const leaderboard = allData.leaderboard_players || {};
  let lbList = Array.isArray(leaderboard) ? leaderboard : Object.values(leaderboard);
  const testLb = lbList.filter(p => {
    if (!p) return false;
    const name = String(p.name || '').trim().toLowerCase();
    const id = String(p.id || '').trim().toLowerCase();
    return name.includes('test') || name.includes('測試') || id.startsWith('test_');
  });
  console.log(`🔎 偵測到排行榜測試帳號數: ${testLb.length}`);
  if (testLb.length > 0) {
    const cleanLb = lbList.filter(p => !testLb.some(tp => tp.id === p.id));
    await set(ref(db, 'studyhub/leaderboard_players'), cleanLb);
  }

  console.log('✅ 測資清理與驗證完成！全服僅保留真實學生與真實歷史！');
  process.exit(0);
}

auditAndCleanupTestData().catch(err => {
  console.error('❌ 發生錯誤:', err);
  process.exit(1);
});
