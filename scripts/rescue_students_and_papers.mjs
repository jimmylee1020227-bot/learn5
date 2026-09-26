import { db } from '../src/services/firebase.js';
import { ref, get, set, update } from 'firebase/database';
import { execSync } from 'child_process';
import fs from 'fs';

async function rescueStudentsAndPapers() {
  console.log('====================================================');
  console.log('🚨 開始執行【學生名冊與歷次試卷】全量深度救援與資料庫補全');
  console.log('====================================================');

  // 1. 從 Firebase 雲端讀取目前全部節點
  console.log('\n[步驟 1] 讀取 Firebase 雲端最新快照...');
  const snap = await get(ref(db, 'studyhub'));
  const cloud = snap.val() || {};

  // 2. 收集與聚合全部 134+ 份試卷
  console.log('\n[步驟 2] 深度聚合所有歷史與線上考卷...');
  const allPapersMap = new Map();

  // 2.1 雲端 quiz_papers 與 all_quiz_papers
  [cloud.quiz_papers, cloud.all_quiz_papers].forEach(node => {
    if (node) {
      const list = Array.isArray(node) ? node : Object.values(node);
      list.forEach(p => { if (p && p.id) allPapersMap.set(p.id, p); });
    }
  });

  // 2.2 雲端所有使用者的 user_quiz_papers_*
  for (const [k, v] of Object.entries(cloud)) {
    if (k.startsWith('user_quiz_papers_') && v) {
      const list = Array.isArray(v) ? v : Object.values(v);
      list.forEach(p => { if (p && p.id) allPapersMap.set(p.id, p); });
    }
  }

  // 2.3 Git 歷史版本的 cloud_state.json
  const commits = ['d1673c2', '909b2fe', 'e6627ca', 'a591601', '7908489'];
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
      for (const k of Object.keys(d)) {
        if (k.startsWith('user_quiz_papers_')) {
          const list = Array.isArray(d[k]) ? d[k] : Object.values(d[k]);
          list.forEach(p => { if (p && p.id) allPapersMap.set(p.id, p); });
        }
      }
    } catch (_) {}
  }

  console.log(`  📄 考卷救援完成，總計聚合到：${allPapersMap.size} 份完整考卷`);

  // 3. 收集與聚合全部 98+ 位學生名冊
  console.log('\n[步驟 3] 深度聚合全服學生註冊資料...');
  const allUsersMap = new Map();

  // 3.1 優先載入 d1673c2 中的完整 98 位學生原始資料
  try {
    const rawD = execSync('git show d1673c2:server_data/cloud_state.json', { maxBuffer: 50 * 1024 * 1024 }).toString();
    const dD = JSON.parse(rawD);
    Object.entries(dD.user_registry || {}).forEach(([uid, u]) => {
      if (u && uid) allUsersMap.set(uid, u);
    });
    console.log(`  從 Git 歷史還原基礎學生名冊：${allUsersMap.size} 位`);
  } catch (e) {
    console.warn('  Git 讀取警告:', e.message);
  }

  // 3.2 結合 Firebase 現有的 user_registry
  if (cloud.user_registry) {
    Object.entries(cloud.user_registry).forEach(([uid, u]) => {
      if (u && uid) {
        allUsersMap.set(uid, { ...(allUsersMap.get(uid) || {}), ...u });
      }
    });
  }

  // 3.3 結合排行榜玩家
  const lbPlayers = cloud.studyhub_weekly_leaderboard || cloud.leaderboard_players || {};
  Object.values(lbPlayers).forEach(p => {
    if (p && p.userId) {
      const existing = allUsersMap.get(p.userId) || {
        id: p.userId,
        name: p.displayName || '國中同學',
        email: p.email || '',
        school: '會考戰友',
        role: 'student'
      };
      if (p.displayName) existing.name = p.displayName;
      if (p.avatar) existing.avatar = p.avatar;
      allUsersMap.set(p.userId, existing);
    }
  });

  // 3.4 結合考卷中的學生資訊
  allPapersMap.forEach(paper => {
    if (paper.userId) {
      const existing = allUsersMap.get(paper.userId) || {
        id: paper.userId,
        name: paper.userName || '國中同學',
        school: paper.userSchool || '會考戰友',
        email: paper.userEmail || '',
        role: 'student'
      };
      if (paper.userName && (!existing.name || existing.name === '國中同學')) {
        existing.name = paper.userName;
      }
      allUsersMap.set(paper.userId, existing);
    }
  });

  // 3.5 結合隱私權授權的學生 UID
  for (const k of Object.keys(cloud)) {
    if (k.startsWith('privacy_consent_u_')) {
      const uid = k.replace('privacy_consent_', '');
      if (!allUsersMap.has(uid)) {
        allUsersMap.set(uid, {
          id: uid,
          name: '會考同學_' + uid.slice(-4),
          school: '會考戰友',
          role: 'student',
          registeredAt: new Date().toISOString()
        });
      }
    }
  }

  console.log(`  👥 學生救援完成，總計聚合到：${allUsersMap.size} 位註冊學生`);

  // 4. 將全部考卷按完成時間倒序排序
  const sortedPapers = Array.from(allPapersMap.values()).sort((a, b) => {
    const tA = new Date(a.completedAt || a.timestamp || 0).getTime();
    const tB = new Date(b.completedAt || b.timestamp || 0).getTime();
    return tB - tA;
  });

  // 將考卷轉為以 ID 為 key 的物件，供 Firebase 與 quiz_papers 節點使用
  const papersObject = {};
  sortedPapers.forEach(p => {
    papersObject[p.id] = p;
  });

  // 轉為學生名冊物件
  const userRegistryObject = {};
  allUsersMap.forEach((u, uid) => {
    userRegistryObject[uid] = u;
  });

  // 5. 寫回 Firebase 雲端資料庫（分批寫入防超時）
  console.log('\n[步驟 4] 同步覆寫至 Firebase 雲端資料庫核心節點...');

  // 5.1 寫入 user_registry
  await set(ref(db, 'studyhub/user_registry'), userRegistryObject);
  console.log(`  ✅ Firebase studyhub/user_registry 已注入 ${Object.keys(userRegistryObject).length} 位學生！`);

  // 5.2 寫入 quiz_papers 與 all_quiz_papers
  await set(ref(db, 'studyhub/quiz_papers'), papersObject);
  await set(ref(db, 'studyhub/all_quiz_papers'), sortedPapers);
  console.log(`  ✅ Firebase studyhub/quiz_papers 已注入 ${sortedPapers.length} 份考卷！`);
  console.log(`  ✅ Firebase studyhub/all_quiz_papers 已注入 ${sortedPapers.length} 份考卷！`);

  // 5.3 確保每位考生的個別節點 user_quiz_papers_${uid} 也補全
  const userPapersGroups = new Map();
  sortedPapers.forEach(p => {
    if (p.userId) {
      if (!userPapersGroups.has(p.userId)) {
        userPapersGroups.set(p.userId, []);
      }
      userPapersGroups.get(p.userId).push(p);
    }
  });

  for (const [uid, pList] of userPapersGroups.entries()) {
    try {
      await set(ref(db, `studyhub/user_quiz_papers_${uid}`), pList);
    } catch (_) {}
  }
  console.log(`  ✅ 補全 ${userPapersGroups.size} 位學生的獨立 user_quiz_papers_* 節點！`);

  // 6. 更新本機快照 server_data/cloud_state.json
  console.log('\n[步驟 5] 更新本地 server_data/cloud_state.json 快照備份...');
  let currentJson = {};
  try {
    currentJson = JSON.parse(fs.readFileSync('./server_data/cloud_state.json', 'utf8'));
  } catch (_) {}

  currentJson.user_registry = userRegistryObject;
  currentJson.quiz_papers = papersObject;
  currentJson.all_quiz_papers = sortedPapers;

  // 將每位學生的試卷也寫入快照
  userPapersGroups.forEach((pList, uid) => {
    currentJson[`user_quiz_papers_${uid}`] = pList;
  });

  fs.writeFileSync('./server_data/cloud_state.json', JSON.stringify(currentJson, null, 2), 'utf8');
  console.log('  ✅ 本機 server_data/cloud_state.json 備份更新完畢！');

  console.log('\n====================================================');
  console.log(`🎉 救援成功！現已全數恢復：`);
  console.log(`   👥 學生總數: ${Object.keys(userRegistryObject).length} 位`);
  console.log(`   📄 試卷總數: ${sortedPapers.length} 份`);
  console.log('====================================================');
}

rescueStudentsAndPapers().then(() => process.exit(0)).catch(err => {
  console.error('❌ 救援發生異常:', err);
  process.exit(1);
});
