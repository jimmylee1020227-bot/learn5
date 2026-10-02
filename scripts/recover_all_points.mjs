import { db } from '../src/services/firebase.js';
import { ref, get, set, update } from 'firebase/database';
import fs from 'fs';

export async function runPointsRecovery(dryRun = false) {
  console.log('==============================================');
  console.log(`🔍 正在執行全服點數漏失掃描與恢復程序 [${dryRun ? '試算模式 (Dry-Run)' : '正式寫入模式'}]...`);
  console.log('==============================================');

  const snap = await get(ref(db, 'studyhub'));
  const cloud = snap.val() || {};
  const cloudLB = cloud.leaderboard_players || {};

  // 1. 統計所有考卷 (144份) 中的真實答對數
  const allPapers = cloud.all_quiz_papers || Object.values(cloud.quiz_papers || {});
  const paperCorrect = {};
  const w40PaperCorrect = {};
  const w40Start = new Date('2026-09-27T16:00:00.000Z').getTime();

  allPapers.forEach(p => {
    if (!p || !p.userId) return;
    paperCorrect[p.userId] = (paperCorrect[p.userId] || 0) + (p.correctCount || 0);
    const t = new Date(p.completedAt || p.timestamp || 0).getTime();
    if (t >= w40Start) {
      w40PaperCorrect[p.userId] = (w40PaperCorrect[p.userId] || 0) + (p.correctCount || 0);
    }
  });

  // 2. 統計所有做題歷史
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

  // 3. 讀取本機 Git 快照
  let localLB = {};
  let localRegistry = {};
  try {
    const local = JSON.parse(fs.readFileSync('./server_data/cloud_state.json', 'utf8'));
    localLB = local.leaderboard_players || {};
    localRegistry = local.user_registry || {};
  } catch (_) {}

  // 4. 計算每個學生的最真實保底點數
  const allUids = new Set([
    ...Object.keys(cloudLB),
    ...Object.keys(paperCorrect),
    ...Object.keys(histCorrect),
    ...Object.keys(localLB),
    ...Object.keys(localRegistry)
  ]);

  let updatedPlayers = 0;
  const updates = {};
  const updatedDetails = [];

  for (const uid of allUids) {
    if (!uid) continue;
    const cur = cloudLB[uid] || {};
    const loc = localLB[uid] || {};
    const reg = localRegistry[uid] || {};

    const curWp = cur.weeklyPoints || 0;
    const curTp = cur.totalPoints || 0;
    const locTp = loc.totalPoints || 0;
    const pPts = paperCorrect[uid] || 0;
    const hPts = histCorrect[uid] || 0;

    // 保底答對總題數
    const verifiedAnswersTotal = Math.max(pPts, hPts);
    // 應得的累計總點數（取最大值，絕不覆蓋因抽獎/暴擊/管理員發放的額外點數）
    const targetTp = Math.max(curTp, locTp, verifiedAnswersTotal);

    // 本週應得週點數
    const w40Verified = Math.max(w40PaperCorrect[uid] || 0, w40HistCorrect[uid] || 0);
    const targetWp = Math.max(curWp, w40Verified);

    const displayName = cur.displayName || loc.displayName || reg.name || uid;

    if (targetTp > curTp || targetWp > curWp || !cloudLB[uid]) {
      updatedPlayers++;
      const updatedPlayerObj = {
        ...cur,
        userId: uid,
        displayName,
        avatar: cur.avatar || loc.avatar || reg.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(uid)}`,
        email: cur.email || loc.email || reg.email || '',
        weeklyPoints: targetWp,
        totalPoints: targetTp,
        weekId: '2026-W40',
        updatedAt: Date.now()
      };

      updates[`studyhub/leaderboard_players/${uid}`] = updatedPlayerObj;
      updatedDetails.push({
        uid,
        name: displayName,
        原週點: curWp,
        新週點: targetWp,
        原總點: curTp,
        新總點: targetTp,
        作答考卷題數: pPts,
        作答日誌題數: hPts
      });
    }
  }

  console.log(`\n📊 掃描完成！共有 ${updatedPlayers} 位學生有點數需要向上補全與恢復：`);
  console.table(updatedDetails);

  if (!dryRun && updatedPlayers > 0) {
    console.log('\n🚀 正在將補全點數寫回 Firebase 雲端資料庫...');
    await update(ref(db), updates);

    // 同步更新 studyhub_weekly_leaderboard 陣列
    const finalSnap = await get(ref(db, 'studyhub/leaderboard_players'));
    const finalPlayers = Object.values(finalSnap.val() || {}).sort((a, b) => (b.weeklyPoints || 0) - (a.weeklyPoints || 0));
    await set(ref(db, 'studyhub/studyhub_weekly_leaderboard'), finalPlayers);

    // 同步還原 user_registry (補齊被清理腳本誤刪的97位學生名冊)
    console.log('🔄 正在同步恢復 studyhub/user_registry 完整學生名冊...');
    const currentRegSnap = await get(ref(db, 'studyhub/user_registry'));
    const currentReg = currentRegSnap.val() || {};
    const mergedReg = { ...localRegistry, ...currentReg };
    await set(ref(db, 'studyhub/user_registry'), mergedReg);

    console.log('✅ 全服點數與名冊已 100% 成功恢復並持久化至 Firebase！');
  }

  return updatedDetails;
}

if (process.argv[1].endsWith('recover_all_points.mjs')) {
  const isDry = process.argv.includes('--dry-run');
  runPointsRecovery(isDry).then(() => process.exit(0)).catch(err => {
    console.error('執行失敗:', err);
    process.exit(1);
  });
}
