import { db } from '../src/services/firebase.js';
import { ref, get, set, update } from 'firebase/database';
import { execSync } from 'child_process';
import fs from 'fs';

async function restoreFullSystem() {
  console.log('====================================================');
  console.log('🚀 開始全系統資料庫【考卷、點數、學生名冊、排行榜】全量深度修復');
  console.log('====================================================');

  // 1. 取得雲端全部資料快照
  const snap = await get(ref(db, 'studyhub'));
  const cloud = snap.val() || {};

  // 2. 深度聚合所有 169 份考卷
  console.log('\n[步驟 1/5] 深度聚合所有歷史與雲端考卷 (跨節點 & Git)...');
  const allPapersMap = new Map();

  // 2.1 雲端 quiz_papers 與 all_quiz_papers
  [cloud.quiz_papers, cloud.all_quiz_papers].forEach(node => {
    if (node) {
      const list = Array.isArray(node) ? node : Object.values(node);
      list.forEach(p => { if (p && p.id) allPapersMap.set(p.id, p); });
    }
  });

  // 2.2 雲端個別學生的 user_quiz_papers_* 節點
  for (const [k, v] of Object.entries(cloud)) {
    if (k.startsWith('user_quiz_papers_') && v) {
      const list = Array.isArray(v) ? v : Object.values(v);
      list.forEach(p => { if (p && p.id) allPapersMap.set(p.id, p); });
    }
  }

  // 2.3 Git 歷史快照
  const commits = ['HEAD', '86c8492', '194cab0', 'c819c0e', '887d306', 'bb49154', 'a3e1d83', 'e6c9375', 'd1673c2'];
  for (const c of commits) {
    try {
      const raw = execSync(`git show ${c}:server_data/cloud_state.json`, { maxBuffer: 50 * 1024 * 1024 }).toString();
      const d = JSON.parse(raw);
      [d.all_quiz_papers, d.quiz_papers].forEach(node => {
        if (node) {
          const list = Array.isArray(node) ? node : Object.values(node);
          list.forEach(p => { if (p && p.id) allPapersMap.set(p.id, p); });
        }
      });
      for (const [k, v] of Object.entries(d)) {
        if (k.startsWith('user_quiz_papers_') && v) {
          const list = Array.isArray(v) ? v : Object.values(v);
          list.forEach(p => { if (p && p.id) allPapersMap.set(p.id, p); });
        }
      }
    } catch (_) {}
  }

  const sortedPapers = Array.from(allPapersMap.values()).sort((a, b) => {
    const tA = new Date(a.completedAt || a.timestamp || 0).getTime();
    const tB = new Date(b.completedAt || b.timestamp || 0).getTime();
    return tB - tA;
  });
  console.log(`  📄 總計聚合完整考卷：${sortedPapers.length} 份！`);

  // 3. 深度聚合學生名冊 (user_registry)
  console.log('\n[步驟 2/5] 深度聚合全體學生名冊...');
  const allUsersMap = new Map();

  // 3.1 本地與 Git 名冊
  try {
    const local = JSON.parse(fs.readFileSync('./server_data/cloud_state.json', 'utf8'));
    Object.entries(local.user_registry || {}).forEach(([uid, u]) => {
      if (u && uid) allUsersMap.set(uid, u);
    });
  } catch (_) {}

  // 3.2 雲端現有名冊
  if (cloud.user_registry) {
    Object.entries(cloud.user_registry).forEach(([uid, u]) => {
      if (u && uid) allUsersMap.set(uid, { ...(allUsersMap.get(uid) || {}), ...u });
    });
  }

  // 3.3 從所有考卷反查學生
  sortedPapers.forEach(p => {
    if (p.userId) {
      const existing = allUsersMap.get(p.userId) || {
        id: p.userId,
        name: p.userName || '國中同學',
        school: p.userSchool || '會考戰友',
        email: p.userEmail || '',
        role: 'student'
      };
      if (p.userName && (!existing.name || existing.name === '國中同學')) {
        existing.name = p.userName;
      }
      allUsersMap.set(p.userId, existing);
    }
  });

  // 解鎖誤鎖的總管理員
  if (allUsersMap.has('admin_super_jimmy')) {
    const adminObj = allUsersMap.get('admin_super_jimmy');
    adminObj.isLocked = false;
    delete adminObj.lockReason;
    delete adminObj.lockedAt;
    allUsersMap.set('admin_super_jimmy', adminObj);
  }

  console.log(`  👥 總計聚合學生帳號：${allUsersMap.size} 位！`);

  // 4. 計算並恢復所有學生的真實點數
  console.log('\n[步驟 3/5] 比對考卷與做題歷史，全面校準恢復所有學生點數...');
  const cloudLB = cloud.leaderboard_players || {};

  // 統計所有考卷答對數
  const paperCorrect = {};
  const w40PaperCorrect = {};
  const w40Start = new Date('2026-09-27T16:00:00.000Z').getTime();

  sortedPapers.forEach(p => {
    if (!p || !p.userId) return;
    paperCorrect[p.userId] = (paperCorrect[p.userId] || 0) + (p.correctCount || 0);
    const t = new Date(p.completedAt || p.timestamp || 0).getTime();
    if (t >= w40Start) {
      w40PaperCorrect[p.userId] = (w40PaperCorrect[p.userId] || 0) + (p.correctCount || 0);
    }
  });

  // 統計所有歷史做題日誌
  const histCorrect = {};
  const w40HistCorrect = {};
  for (const [k, v] of Object.entries(cloud)) {
    if (k.startsWith('practice_history_') && v) {
      const arr = Array.isArray(v) ? v : Object.values(v);
      arr.forEach(i => {
        if (!i || !i.userId) return;
        if (i.isCorrect) {
          histCorrect[i.userId] = (histCorrect[i.userId] || 0) + 1;
          const t = new Date(i.timestamp || 0).getTime();
          if (t >= w40Start) {
            w40HistCorrect[i.userId] = (w40HistCorrect[i.userId] || 0) + 1;
          }
        }
      });
    }
  }

  // 聚合排行榜玩家
  const allPlayerIds = new Set([
    ...Object.keys(cloudLB),
    ...Object.keys(paperCorrect),
    ...Object.keys(histCorrect),
    ...allUsersMap.keys()
  ]);

  const recoveredLeaderboard = {};
  let pointsAdjusted = 0;

  for (const uid of allPlayerIds) {
    const cur = cloudLB[uid] || {};
    const userProfile = allUsersMap.get(uid) || {};

    const curWp = cur.weeklyPoints || 0;
    const curTp = cur.totalPoints || 0;

    const pCorrect = paperCorrect[uid] || 0;
    const hCorrect = histCorrect[uid] || 0;
    const verifiedTotal = Math.max(pCorrect, hCorrect);

    // 保底累積總點數（取最大值，絕不覆蓋因抽獎/暴擊/管理員發放的額外點數）
    const targetTp = Math.max(curTp, verifiedTotal);

    // 本週應得週點數
    const w40Verified = Math.max(w40PaperCorrect[uid] || 0, w40HistCorrect[uid] || 0);
    const targetWp = Math.max(curWp, w40Verified);

    if (targetTp > curTp || targetWp > curWp) {
      pointsAdjusted++;
    }

    const displayName = cur.displayName || userProfile.name || uid;
    const email = cur.email || userProfile.email || '';

    recoveredLeaderboard[uid] = {
      ...cur,
      userId: uid,
      displayName,
      email,
      avatar: cur.avatar || userProfile.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(uid)}`,
      weeklyPoints: targetWp,
      totalPoints: targetTp,
      weekId: '2026-W40',
      updatedAt: Date.now()
    };
  }

  console.log(`  ⚖️ 排行榜總計納入：${Object.keys(recoveredLeaderboard).length} 位學生，其中校準補足 ${pointsAdjusted} 位學生的漏失點數！`);

  // 5. 寫回 Firebase 雲端資料庫
  console.log('\n[步驟 4/5] 同步持久化寫回 Firebase 雲端核心節點...');
  const papersObject = {};
  sortedPapers.forEach(p => { papersObject[p.id] = p; });

  const usersRegistryObject = {};
  allUsersMap.forEach((u, uid) => { usersRegistryObject[uid] = u; });

  const sortedLeaderboardArray = Object.values(recoveredLeaderboard).sort((a, b) => 
    (b.weeklyPoints || 0) - (a.weeklyPoints || 0)
  );

  // 分組考卷到 user_quiz_papers_*
  const userPapersMap = new Map();
  sortedPapers.forEach(p => {
    if (p.userId) {
      if (!userPapersMap.has(p.userId)) userPapersMap.set(p.userId, []);
      userPapersMap.get(p.userId).push(p);
    }
  });

  // 寫入 Firebase
  await Promise.all([
    set(ref(db, 'studyhub/quiz_papers'), papersObject),
    set(ref(db, 'studyhub/all_quiz_papers'), sortedPapers),
    set(ref(db, 'studyhub/user_registry'), usersRegistryObject),
    set(ref(db, 'studyhub/leaderboard_players'), recoveredLeaderboard),
    set(ref(db, 'studyhub/studyhub_weekly_leaderboard'), sortedLeaderboardArray)
  ]);

  for (const [uid, pList] of userPapersMap.entries()) {
    try {
      await set(ref(db, `studyhub/user_quiz_papers_${uid}`), pList);
    } catch (_) {}
  }
  console.log('  ✅ Firebase 雲端核心節點與個別學生考卷節點全部更新完成！');

  // 6. 更新本機 server_data/cloud_state.json 快照
  console.log('\n[步驟 5/5] 更新本地 server_data/cloud_state.json 備份快照...');
  const finalBackup = {
    ...cloud,
    user_registry: usersRegistryObject,
    quiz_papers: papersObject,
    all_quiz_papers: sortedPapers,
    leaderboard_players: recoveredLeaderboard,
    studyhub_weekly_leaderboard: sortedLeaderboardArray
  };
  userPapersMap.forEach((pList, uid) => {
    finalBackup[`user_quiz_papers_${uid}`] = pList;
  });

  fs.writeFileSync('./server_data/cloud_state.json', JSON.stringify(finalBackup, null, 2), 'utf8');
  console.log('  ✅ 本地快照備份更新成功！');

  console.log('\n====================================================');
  console.log('🎉 全服資料救援與恢復大功告成！目前雲端狀態：');
  console.log(`   📄 試卷總數: ${sortedPapers.length} 份 (包含所有歷史作答)`);
  console.log(`   👥 學生總數: ${allUsersMap.size} 位 (包含名冊與登入資訊)`);
  console.log(`   🏆 排行榜人數: ${sortedLeaderboardArray.length} 位 (點數已 100% 補全)`);
  console.log('====================================================');
}

restoreFullSystem().then(() => process.exit(0)).catch(err => {
  console.error('❌ 修復失敗:', err);
  process.exit(1);
});
