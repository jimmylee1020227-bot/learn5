import { db } from '../src/services/firebase.js';
import { ref, get, set } from 'firebase/database';
import fs from 'fs';

async function recoverAllData() {
  console.log('🚀 開始全服資料庫深度救援與恢復...');
  const snap = await get(ref(db, 'studyhub'));
  const allData = snap.val() || {};

  const recoveredPapers = new Map();
  const recoveredUsers = new Map();
  const recoveredHistory = [];
  const currentLeaderboard = allData.leaderboard_players || {};

  // 1. 救回所有 user_quiz_papers_* 和 quiz_papers
  if (allData.quiz_papers) {
    const list = Array.isArray(allData.quiz_papers) ? allData.quiz_papers : Object.values(allData.quiz_papers);
    list.forEach(p => {
      if (p && p.id) recoveredPapers.set(p.id, p);
    });
  }

  for (const [key, val] of Object.entries(allData)) {
    if (key.startsWith('user_quiz_papers_') && val) {
      const list = Array.isArray(val) ? val : Object.values(val);
      list.forEach(p => {
        if (p && p.id) {
          recoveredPapers.set(p.id, p);
          if (p.userId && p.userName) {
            recoveredUsers.set(p.userId, {
              id: p.userId,
              name: p.userName,
              school: p.userSchool || '會考戰友',
              email: p.userEmail || '',
              totalQuestions: p.totalQuestions || 10,
              totalCorrect: p.correctCount || 0
            });
          }
        }
      });
    }

    // 2. 救回所有 practice_history_*
    if ((key.startsWith('practice_history_') || key.startsWith('studyhub_practice_history_')) && val) {
      const list = Array.isArray(val) ? val : Object.values(val);
      list.forEach(item => {
        if (item && item.id) {
          recoveredHistory.push(item);
          if (item.userId) {
            const existing = recoveredUsers.get(item.userId) || {
              id: item.userId,
              name: item.userName || '國中同學',
              school: item.userSchool || '會考戰友',
              email: item.userEmail || '',
              totalQuestions: 0,
              totalCorrect: 0
            };
            existing.totalQuestions += 1;
            if (item.isCorrect) existing.totalCorrect += 1;
            recoveredUsers.set(item.userId, existing);
          }
        }
      });
    }
  }

  // 3. 結合排行榜中登記的玩家
  const boardList = Array.isArray(currentLeaderboard) ? currentLeaderboard : Object.values(currentLeaderboard);
  boardList.forEach(p => {
    if (p && p.userId) {
      const existing = recoveredUsers.get(p.userId) || {
        id: p.userId,
        name: p.displayName || '國中同學',
        school: '會考戰友',
        email: p.email || '',
        totalQuestions: p.weeklyPoints || 0,
        totalCorrect: p.weeklyPoints || 0
      };
      recoveredUsers.set(p.userId, existing);
    }
  });

  const papersArray = Array.from(recoveredPapers.values()).sort((a, b) => 
    new Date(b.timestamp || b.completedAt || 0) - new Date(a.timestamp || a.completedAt || 0)
  );

  const usersRegistry = allData.user_registry || {};
  recoveredUsers.forEach((u, uid) => {
    if (!usersRegistry[uid]) {
      usersRegistry[uid] = u;
    }
  });

  console.log(`✅ 成功救援並聚合：${papersArray.length} 份完整試卷！`);
  console.log(`✅ 成功救援並聚合：${Object.keys(usersRegistry).length} 位學生註冊資料！`);

  // 4. 同步寫回 Firebase 雲端的核心全域節點
  await Promise.all([
    set(ref(db, 'studyhub/all_quiz_papers'), papersArray),
    set(ref(db, 'studyhub/user_registry'), usersRegistry)
  ]);

  // 同時個別儲存到 studyhub/quiz_papers/${paper.id}
  for (const paper of papersArray) {
    await set(ref(db, `studyhub/quiz_papers/${paper.id}`), paper);
  }

  console.log('🎉 雲端全服資料庫已修復並永久持久化！');
  process.exit(0);
}

recoverAllData().catch(err => {
  console.error('救援過程發生錯誤:', err);
  process.exit(1);
});
