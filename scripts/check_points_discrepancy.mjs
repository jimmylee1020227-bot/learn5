import fs from 'fs';
import { db } from '../src/services/firebase.js';
import { ref, get } from 'firebase/database';

async function check() {
  const local = JSON.parse(fs.readFileSync('./server_data/cloud_state.json', 'utf8'));
  const snap = await get(ref(db, 'studyhub'));
  const cloud = snap.val() || {};

  console.log('Comparing points between cloud, local, and historical records...');
  const cloudLB = cloud.leaderboard_players || {};
  const localLB = local.leaderboard_players || {};
  
  // Calculate points from papers & history for each user
  const userPaperPoints = {};
  const allPapers = cloud.all_quiz_papers || Object.values(cloud.quiz_papers || {});
  allPapers.forEach(p => {
    if (!p || !p.userId) return;
    userPaperPoints[p.userId] = (userPaperPoints[p.userId] || 0) + (p.correctCount || 0);
  });

  const userHistoryPoints = {};
  for (const [k, v] of Object.entries(cloud)) {
    if (k.startsWith('practice_history_') && v) {
      const arr = Array.isArray(v) ? v : Object.values(v);
      arr.forEach(item => {
        if (!item || !item.userId) return;
        if (item.isCorrect) {
          userHistoryPoints[item.userId] = (userHistoryPoints[item.userId] || 0) + 1;
        }
      });
    }
  }

  const allUserIds = new Set([...Object.keys(cloudLB), ...Object.keys(localLB), ...Object.keys(userPaperPoints), ...Object.keys(userHistoryPoints)]);
  
  let discrepancyCount = 0;
  for (const uid of allUserIds) {
    const cPlayer = cloudLB[uid] || {};
    const lPlayer = localLB[uid] || {};
    const paperPts = userPaperPoints[uid] || 0;
    const histPts = userHistoryPoints[uid] || 0;
    
    const name = cPlayer.displayName || lPlayer.displayName || uid;
    const cWp = cPlayer.weeklyPoints ?? 'none';
    const cTp = cPlayer.totalPoints ?? 'none';
    const lWp = lPlayer.weeklyPoints ?? 'none';
    const lTp = lPlayer.totalPoints ?? 'none';
    
    // Check if cloud points are missing or lower than papers/history/local
    if (cWp === 'none' || (typeof cWp === 'number' && cWp === 0 && (paperPts > 0 || histPts > 0 || lWp > 0))) {
      discrepancyCount++;
      if (discrepancyCount <= 20) {
        console.log(`User [${name}] (${uid}): Cloud[wp:${cWp}, tp:${cTp}], Local[wp:${lWp}, tp:${lTp}], Papers:${paperPts}, History:${histPts}`);
      }
    }
  }
  console.log(`\nTotal users with 0 or missing weekly points while having history/paper/local points: ${discrepancyCount}`);
  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
