import { db } from '../src/services/firebase.js';
import { ref, get, set, update, remove } from 'firebase/database';

const EDITOR_UID = 'u_knbo67cox0xp';
const TARGET_POINTS = 50;

async function main() {
  console.log(`🚀 開始徹底清理小編 (${EDITOR_UID}) 舊卷並全面校準為 ${TARGET_POINTS} 分！`);

  // 1. user_registry
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
  console.log('✅ 1. user_registry: totalCorrect=50, totalQuestions=50');

  // 2. leaderboard_players
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
  console.log('✅ 2. leaderboard_players: weeklyPoints=50, totalPoints=50');

  // 3. studyhub_weekly_leaderboard
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
      console.log('✅ 3. studyhub_weekly_leaderboard: 已同步為 50 分');
    }
  }

  // 4. 重構 practice_history_u_knbo67cox0xp（50 題，全對）
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
  console.log('✅ 4. practice_history_u_knbo67cox0xp: 50 題全對');

  // 5. 徹底清理 user_quiz_papers_u_knbo67cox0xp（只留 1 份 50 題 50 分試卷）
  const userPapersRef = ref(db, `studyhub/user_quiz_papers_${EDITOR_UID}`);
  const singlePaper = {
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
    timeSpentSec: 400,
    questions: newHistory.map(h => ({
      ...h,
      explanation: '詳解：運算正確'
    }))
  };
  await set(userPapersRef, [singlePaper]);
  console.log('✅ 5. user_quiz_papers_u_knbo67cox0xp: 重設為單張 50 題 50 分試卷');

  // 6. 清理 quiz_papers
  const qpRef = ref(db, 'studyhub/quiz_papers');
  const qpSnap = await get(qpRef);
  if (qpSnap.exists()) {
    const qpVal = qpSnap.val();
    const updates = {};
    for (const [k, v] of Object.entries(qpVal)) {
      if (v.userId === EDITOR_UID || v.ownerId === EDITOR_UID || v.userName === '小編') {
        updates[k] = null;
      }
    }
    updates[`paper_editor_${EDITOR_UID}`] = singlePaper;
    await update(qpRef, updates);
    console.log('✅ 6. quiz_papers: 清理舊卷，更新為單張 50 題 50 分試卷');
  }

  // 7. all_quiz_papers
  const allQpRef = ref(db, 'studyhub/all_quiz_papers');
  const allQpSnap = await get(allQpRef);
  if (allQpSnap.exists()) {
    let allPapers = allQpSnap.val();
    if (Array.isArray(allPapers)) {
      allPapers = allPapers.filter(p => p && p.userId !== EDITOR_UID && p.ownerId !== EDITOR_UID && p.userName !== '小編');
      allPapers.unshift(singlePaper);
      await set(allQpRef, allPapers);
      console.log('✅ 7. all_quiz_papers: 同步更新完畢');
    }
  }

  console.log('\n🎉 Firebase 雲端所有節點已全數校正，小編所有數據皆為 50！');
}

main().catch(console.error);
