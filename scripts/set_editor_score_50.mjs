import { db } from '../src/services/firebase.js';
import { ref, get, set, update, remove } from 'firebase/database';

const EDITOR_UID = 'u_knbo67cox0xp';
const TARGET_POINTS = 50;

async function main() {
  console.log(`🚀 開始全面將小編 (${EDITOR_UID}) 在全庫所有節點的分數/點數精準設為 ${TARGET_POINTS}！`);

  // 1. 更新 user_registry
  console.log('\n[1] 更新 user_registry...');
  const regRef = ref(db, `studyhub/user_registry/${EDITOR_UID}`);
  const regSnap = await get(regRef);
  const regData = regSnap.val() || {
    id: EDITOR_UID,
    name: '小編',
    displayName: '小編',
    email: 'happybrother0717@gmail.com',
    role: 'admin',
    school: '會考戰友'
  };
  regData.totalCorrect = TARGET_POINTS;
  regData.totalQuestions = TARGET_POINTS;
  regData.totalQuizzes = 1;
  regData.lastActive = new Date().toISOString();
  await set(regRef, regData);
  console.log('✅ user_registry 已設為 totalCorrect=50, totalQuestions=50');

  // 2. 更新 leaderboard_players
  console.log('\n[2] 更新 leaderboard_players...');
  const lbPlayerRef = ref(db, `studyhub/leaderboard_players/${EDITOR_UID}`);
  const lbSnap = await get(lbPlayerRef);
  const lbData = lbSnap.val() || {
    userId: EDITOR_UID,
    name: '小編',
    displayName: '小編',
    email: 'happybrother0717@gmail.com',
    avatar: regData.avatar || '',
    school: '會考戰友',
    tickets: 1,
    weekId: '2026-W39'
  };
  lbData.weeklyPoints = TARGET_POINTS;
  lbData.totalPoints = TARGET_POINTS;
  lbData.updatedAt = Date.now();
  await set(lbPlayerRef, lbData);
  console.log('✅ leaderboard_players 已設為 weeklyPoints=50, totalPoints=50');

  // 3. 更新 studyhub_weekly_leaderboard 陣列（若存在）
  console.log('\n[3] 檢查 studyhub_weekly_leaderboard...');
  const weeklyBoardRef = ref(db, 'studyhub/studyhub_weekly_leaderboard');
  const weeklySnap = await get(weeklyBoardRef);
  if (weeklySnap.exists()) {
    let board = weeklySnap.val();
    if (Array.isArray(board)) {
      let found = false;
      board = board.map(p => {
        if (p?.userId === EDITOR_UID || p?.name === '小編' || p?.displayName === '小編') {
          found = true;
          return { ...p, weeklyPoints: TARGET_POINTS, totalPoints: TARGET_POINTS, updatedAt: Date.now() };
        }
        return p;
      });
      if (!found) {
        board.push({
          userId: EDITOR_UID,
          name: '小編',
          displayName: '小編',
          email: 'happybrother0717@gmail.com',
          weeklyPoints: TARGET_POINTS,
          totalPoints: TARGET_POINTS,
          updatedAt: Date.now()
        });
      }
      await set(weeklyBoardRef, board);
      console.log('✅ studyhub_weekly_leaderboard 陣列已同步更新小編為 50 分');
    }
  }

  // 4. 重構 practice_history_u_knbo67cox0xp（恰好 50 題，100% 正確，累積 50 題 50 分）
  console.log('\n[4] 重建 practice_history_u_knbo67cox0xp 恰好 50 題正答...');
  const histRef = ref(db, `studyhub/practice_history_${EDITOR_UID}`);
  const newHistory = [];
  const baseTime = Date.now() - 50 * 60 * 1000;
  for (let i = 1; i <= TARGET_POINTS; i++) {
    newHistory.push({
      id: `hist_editor_50_${i}`,
      questionId: `Q-G7-MA-U1-${String(i).padStart(4, '0')}`,
      index: i,
      subjectId: 'math',
      gradeId: 'g7',
      unitId: 'ma-7-u1',
      unitName: '第 1 單元：負數、數線與整數運算',
      conceptTag: '正負數加減乘除',
      difficulty: 'medium',
      answer: 1,
      userChoice: 1,
      isCorrect: true,
      timeSpentSec: 8,
      timestamp: new Date(baseTime + i * 60 * 1000).toISOString()
    });
  }
  await set(histRef, newHistory);
  console.log('✅ practice_history 已重置為恰好 50 題，全數答對（累計正好 50 分）');

  // 5. 清理與重置 quiz_papers 與 all_quiz_papers 中小編的試卷
  console.log('\n[5] 更新 quiz_papers 與 all_quiz_papers...');
  const qpRef = ref(db, 'studyhub/quiz_papers');
  const qpSnap = await get(qpRef);
  if (qpSnap.exists()) {
    const qpVal = qpSnap.val();
    const updates = {};
    for (const [k, v] of Object.entries(qpVal)) {
      if (v.userId === EDITOR_UID || v.ownerId === EDITOR_UID || v.userName === '小編') {
        // 刪除舊的多餘試卷
        updates[k] = null;
      }
    }
    // 加入唯一一張 50 題 50 分的標準試卷
    const editorPaperId = `paper_editor_${EDITOR_UID}`;
    updates[editorPaperId] = {
      id: editorPaperId,
      ownerId: EDITOR_UID,
      userId: EDITOR_UID,
      userName: '小編',
      userEmail: 'happybrother0717@gmail.com',
      userSchool: '會考戰友',
      gradeId: 'g7',
      subjectId: 'math',
      paperTitle: '小編專屬【會考數學 50 題滿分挑戰評量卷】',
      correctCount: TARGET_POINTS,
      totalCount: TARGET_POINTS,
      completedAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      timeSpentSec: 400,
      questions: newHistory.map(h => ({
        ...h,
        explanation: '詳解：運算正確'
      }))
    };
    await update(qpRef, updates);
    console.log('✅ quiz_papers 已精準更新為單張 50 題 50 分試卷');
  }

  // 同步更新 all_quiz_papers（若存在為陣列）
  const allQpRef = ref(db, 'studyhub/all_quiz_papers');
  const allQpSnap = await get(allQpRef);
  if (allQpSnap.exists()) {
    let allPapers = allQpSnap.val();
    if (Array.isArray(allPapers)) {
      allPapers = allPapers.filter(p => p && p.userId !== EDITOR_UID && p.ownerId !== EDITOR_UID && p.userName !== '小編');
      allPapers.unshift({
        id: `paper_editor_${EDITOR_UID}`,
        ownerId: EDITOR_UID,
        userId: EDITOR_UID,
        userName: '小編',
        userEmail: 'happybrother0717@gmail.com',
        userSchool: '會考戰友',
        gradeId: 'g7',
        subjectId: 'math',
        paperTitle: '小編專屬【會考數學 50 題滿分挑戰評量卷】',
        correctCount: TARGET_POINTS,
        totalCount: TARGET_POINTS,
        completedAt: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        timeSpentSec: 400
      });
      await set(allQpRef, allPapers);
      console.log('✅ all_quiz_papers 已同步更新');
    }
  }

  // 6. 更新 daily_stats
  console.log('\n[6] 更新 daily_stats...');
  const todayDateStr = new Date().toISOString().slice(0, 10);
  const dailyRef = ref(db, `studyhub/daily_stats_${EDITOR_UID}_${todayDateStr}`);
  await set(dailyRef, {
    count: TARGET_POINTS,
    correctCount: TARGET_POINTS,
    target: 50,
    lastPracticedAt: new Date().toISOString()
  });
  console.log('✅ daily_stats 已設為 correctCount=50, count=50');

  console.log('\n🎉 全部完成！小編的所有分數已徹底 100% 統一為 50！');
}

main().catch(console.error);
