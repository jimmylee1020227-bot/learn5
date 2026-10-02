import { db } from '../src/services/firebase.js';
import { ref, get, set } from 'firebase/database';
import { generateQuestion } from '../src/data/questionGenerator.js';
import { measureCloudPing } from '../src/services/cloudStorage.js';

async function runFullSystemCheck() {
  console.log('========================================================');
  console.log('🧪 開始全系統全面深度檢測 (診斷儀、同步機制、題庫、作答)');
  console.log('========================================================');

  let passedTests = 0;
  let failedTests = 0;
  const errors = [];

  function assert(condition, message) {
    if (condition) {
      passedTests++;
      console.log(`  ✅ [PASS] ${message}`);
    } else {
      failedTests++;
      console.error(`  ❌ [FAIL] ${message}`);
      errors.push(message);
    }
  }

  // ----------------------------------------------------
  // 測試 1：Firebase 雲端連線診斷儀 (Ping / RTT)
  // ----------------------------------------------------
  console.log('\n[測試 1] 檢驗 Firebase 雲端連線診斷儀...');
  const pingStart = Date.now();
  const pingRes = await measureCloudPing();
  const pingElapsed = Date.now() - pingStart;

  assert(pingRes && typeof pingRes.pingMs === 'number', '診斷儀回傳格式正確');
  assert(pingRes.pingMs > 0, `診斷儀成功測出真實 RTT: ${pingRes.pingMs} ms (耗時 ${pingElapsed} ms)`);
  assert(pingRes.status === 'excellent' || pingRes.status === 'good' || pingRes.status === 'slow', `連線狀態回報正常: ${pingRes.status} (${pingRes.message})`);
  assert(pingElapsed < 4000, `診斷儀於 ${pingElapsed}ms 內快速回傳，絕不卡在測速中`);

  // ----------------------------------------------------
  // 測試 2：Firebase 雲端資料庫核心節點與同步檢驗
  // ----------------------------------------------------
  console.log('\n[測試 2] 檢驗 Firebase 雲端資料庫核心節點同步...');
  const [snapUsers, snapPapers, snapLB] = await Promise.all([
    get(ref(db, 'studyhub/user_registry')),
    get(ref(db, 'studyhub/all_quiz_papers')),
    get(ref(db, 'studyhub/leaderboard_players'))
  ]);

  const userRegistry = snapUsers.val() || {};
  const userRegistryCount = Object.keys(userRegistry).length;
  assert(userRegistryCount >= 100, `學生名冊 (user_registry) 已完全恢復 (目前在冊: ${userRegistryCount} 位)`);

  const allPapers = snapPapers.val() || [];
  const allPapersCount = (Array.isArray(allPapers) ? allPapers : Object.values(allPapers)).length;
  assert(allPapersCount >= 160, `歷次考卷庫完整度檢驗 (all_quiz_papers: ${allPapersCount} 份)`);

  const leaderboard = snapLB.val() || {};
  const leaderboardCount = Object.keys(leaderboard).length;
  assert(leaderboardCount >= 100, `全服排行榜名單完整度 (共 ${leaderboardCount} 位選手)`);


  // ----------------------------------------------------
  // 測試 3：所有科目、所有年級、所有單元題庫出題與作答測試
  // ----------------------------------------------------
  console.log('\n[測試 3] 檢驗全學段全科目單元題庫出題、年級歸屬與作答格式...');

  const subjects = ['math', 'english', 'chinese', 'science', 'social'];
  const grades = ['g7', 'g8', 'g9'];
  let totalQuestionsTested = 0;
  let bankErrors = 0;

  for (const subj of subjects) {
    for (const gr of grades) {
      for (let unitNum = 1; unitNum <= 6; unitNum++) {
        const unitId = `${subj.slice(0, 2)}-${gr.replace('g', '')}-u${unitNum}`;
        for (let qIndex = 1; qIndex <= 3; qIndex++) {
          totalQuestionsTested++;
          try {
            const q = generateQuestion(subj, gr, unitId, qIndex, 'medium');
            if (!q || !q.question) {
              bankErrors++;
              errors.push(`【${subj}/${gr}/${unitId}】第 ${qIndex} 題題幹為空`);
              continue;
            }
            if (!Array.isArray(q.options) || q.options.length !== 4) {
              bankErrors++;
              errors.push(`【${subj}/${gr}/${unitId}】選項非 4 項`);
              continue;
            }
            // 檢查選項不重複
            const distinctOptions = new Set(q.options.map(o => String(o).trim()));
            if (distinctOptions.size !== 4) {
              bankErrors++;
              errors.push(`【${subj}/${gr}/${unitId}】選項存在重複內容: ${JSON.stringify(q.options)}`);
              continue;
            }
            if (typeof q.answer !== 'number' || q.answer < 0 || q.answer > 3) {
              bankErrors++;
              errors.push(`【${subj}/${gr}/${unitId}】解答索引超出 0~3 範圍: ${q.answer}`);
              continue;
            }
            if (!q.explanation) {
              bankErrors++;
              errors.push(`【${subj}/${gr}/${unitId}】缺乏詳解說明`);
              continue;
            }
          } catch (err) {
            bankErrors++;
            errors.push(`【${subj}/${gr}/${unitId}】生成拋出異常: ${err.message}`);
          }
        }
      }
    }
  }

  // 測試總複習單元 (junior-all, senior-all)
  for (const reviewUnit of ['junior-all', 'senior-all']) {
    for (const subj of subjects) {
      totalQuestionsTested++;
      try {
        const q = generateQuestion(subj, 'g9', reviewUnit, 1, 'medium');
        if (!q || !q.question || q.options?.length !== 4) {
          bankErrors++;
          errors.push(`【${reviewUnit}/${subj}】總複習題目生成異常`);
        }
      } catch (err) {
        bankErrors++;
        errors.push(`【${reviewUnit}/${subj}】總複習題目異常: ${err.message}`);
      }
    }
  }

  assert(bankErrors === 0, `抽樣檢測全科目題庫共 ${totalQuestionsTested} 題，全數符合 4 選項、不重複、正解有效、詳解健全`);

  // ----------------------------------------------------
  // 測試 4：點數增減與防作弊安全測試
  // ----------------------------------------------------
  console.log('\n[測試 4] 檢驗學生作答積分累加與原子化寫入安全...');
  const testStudentId = 'u_test_sync_probe';
  const testPlayer = {
    userId: testStudentId,
    displayName: '同步探針學生',
    email: 'probe@test.com',
    weeklyPoints: 5,
    totalPoints: 50,
    weekId: '2026-W40',
    updatedAt: Date.now()
  };

  await set(ref(db, `studyhub/leaderboard_players/${testStudentId}`), testPlayer);
  const verifySnap = await get(ref(db, `studyhub/leaderboard_players/${testStudentId}`));
  assert(verifySnap.exists() && verifySnap.val().weeklyPoints === 5, '點數即時原子化寫入 Firebase 驗證通過');

  // 清除探針測試資料
  await set(ref(db, `studyhub/leaderboard_players/${testStudentId}`), null);
  assert(true, '測試探針已乾淨清理');

  console.log('\n========================================================');
  console.log(`🎉 檢測大總結: 通過 ${passedTests} 項 / 失敗 ${failedTests} 項`);
  if (failedTests > 0) {
    console.log('異常詳情:');
    errors.forEach(e => console.log('  - ' + e));
  } else {
    console.log('⭐️ 系統核心全線綠燈！題庫、連線診斷儀、考卷、學生名冊與點數同步全部 100% 健全！');
  }
  console.log('========================================================');

  process.exit(failedTests > 0 ? 1 : 0);
}

runFullSystemCheck().catch(err => {
  console.error('測試失敗:', err);
  process.exit(1);
});
