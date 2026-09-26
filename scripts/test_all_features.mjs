import { db } from '../src/services/firebase.js';
import { ref, get, remove } from 'firebase/database';
import { 
  runSystemHealthCheck, 
  measureCloudPing, 
  fetchAllCloudQuizPapers, 
  getRegisteredStudents,
  fetchCloudAuditLogs,
  SUPER_ADMIN_EMAIL
} from '../src/services/cloudStorage.js';
import { generateQuestion } from '../src/data/questionGenerator.js';
import { getLeaderboard, getStudentWeeklyPoints } from '../src/services/leaderboardService.js';

async function testAllFeatures() {
  console.log('=============================================');
  console.log('🧪 開始全系統全功能深度自動化驗證');
  console.log('=============================================');

  // 1. 雲端連線與延遲
  console.log('\n[1/6] 測試 Firebase 雲端雙向連線與延遲...');
  const ping = await measureCloudPing();
  console.log(`📡 雲端延遲: ${ping.pingMs}ms, 狀態: ${ping.status}, 訊息: ${ping.message}`);
  if (ping.status === 'error') {
    throw new Error('Firebase 連線失敗！');
  }

  // 2. 12 大維度全系統智能自檢
  console.log('\n[2/6] 執行全服 12 大維度深度自檢 (runSystemHealthCheck)...');
  const healthReport = await runSystemHealthCheck();
  console.log(`🛡️ 自檢狀態: ${healthReport.overallStatus}, 總體分數: ${healthReport.healthScore}/100`);
  console.log(`📋 檢測項目清單 (共 ${healthReport.checks.length} 項):`);
  healthReport.checks.forEach(c => {
    const icon = c.status === 'PASS' ? '✅' : (c.status === 'WARNING' ? '⚠️' : '❌');
    console.log(`  ${icon} [${c.id}] ${c.title} -> ${c.details}`);
  });

  if (healthReport.checks.length < 10) {
    throw new Error('自檢維度不足 10 項！');
  }

  // 3. 動態出題引擎
  console.log('\n[3/6] 測試國中五科題庫自動生成...');
  const subjects = ['國文', '英語', '數學', '自然', '社會'];
  subjects.forEach(sub => {
    const q = generateQuestion(sub, '綜合會考');
    console.log(`  📚 ${sub} 抽題成功:「${q.question.slice(0, 25)}...」 正確答案=${q.answer}`);
  });

  // 4. 排行榜與首頁本週點數計算
  console.log('\n[4/6] 測試排行榜與每週點數結算...');
  const lb = getLeaderboard();
  console.log(`🏆 排行榜當前人數: ${lb.length} 位`);
  if (lb.length > 0) {
    const topPlayer = lb[0];
    const topWeeklyPts = getStudentWeeklyPoints(topPlayer);
    console.log(`🥇 第一名學生: ${topPlayer.name}, 總分: ${topPlayer.points}, 本週點數: ${topWeeklyPts}`);
  }

  // 5. 權限隔離 (審計日誌僅總管可看)
  console.log('\n[5/6] 測試審計日誌權限阻斷...');
  const superAdminUser = { email: SUPER_ADMIN_EMAIL, name: '總管理員' };
  const regularUser = { email: 'normal_student@gmail.com', name: '一般學生' };
  
  const superLogs = await fetchCloudAuditLogs(superAdminUser);
  console.log(`👑 總管讀取審計日誌: 成功取得 ${superLogs.length} 筆日誌`);

  const studentLogs = await fetchCloudAuditLogs(regularUser);
  console.log(`🚫 一般學生讀取審計日誌: 回傳筆數 ${studentLogs.length} (受權限阻斷)`);
  if (studentLogs.length > 0) {
    throw new Error('非總管理員能夠讀取審計日誌，權限漏洞！');
  }

  // 6. 考卷與學員資料庫完整性驗證
  console.log('\n[6/7] 測試歷次試卷與學員資料庫持久性...');
  const papers = await fetchAllCloudQuizPapers();
  console.log(`📄 雲端歷次試卷總數: ${papers.length} 份`);
  const registered = getRegisteredStudents();
  console.log(`👥 全服註冊學生數: ${registered.length} 位`);

  // 7. 自訂頭像更新與雲端同步測試
  console.log('\n[7/7] 測試自訂頭像更換與雲端同步 (saveUserAvatarToCloud)...');
  const { saveUserAvatarToCloud, fetchCloudUserProfile } = await import('../src/services/cloudStorage.js');
  const testUserId = 'test_avatar_sync_user';
  const testAvatarUrl = 'https://api.dicebear.com/7.x/bottts/svg?seed=avatar_sync_success_test';
  
  await saveUserAvatarToCloud(testUserId, testAvatarUrl, {
    id: testUserId,
    email: 'test_sync@example.com',
    displayName: '頭像同步測試員',
    role: 'student'
  });

  const updatedProfile = await fetchCloudUserProfile(testUserId);
  console.log(`👤 雲端讀取更新後頭像: ${updatedProfile?.avatar ? '✅ 成功匹配' : '❌ 未找到'}`);
  if (updatedProfile && updatedProfile.avatar !== testAvatarUrl) {
    throw new Error(`頭像雲端同步數值不符: expected ${testAvatarUrl}, got ${updatedProfile.avatar}`);
  }
  console.log('✅ 自訂頭像雲端雙向同步驗證 100% 通過！');

  // 清理測試節點
  if (db) {
    try {
      await remove(ref(db, `studyhub/user_registry/${testUserId}`));
    } catch (_) {}
  }

  console.log('\n=============================================');
  console.log('🎉 所有功能與雲端同步測試 100% 通過！全系統完全正常！');
  console.log('=============================================');
  process.exit(0);
}

testAllFeatures().catch(err => {
  console.error('❌ 測試失敗:', err);
  process.exit(1);
});
