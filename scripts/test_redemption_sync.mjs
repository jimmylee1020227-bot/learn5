import { db } from '../src/services/firebase.js';
import { ref, get, set, remove } from 'firebase/database';
import { 
  addRedemptionCode, 
  deleteRedemptionCode,
  fetchCloudRedemptionCodes, 
  redeemCodeAsync,
  fetchCloudUserRedeemedCodes,
  SUPER_ADMIN_EMAIL
} from '../src/services/cloudStorage.js';

async function testCrossDeviceRedemption() {
  console.log('==================================================');
  console.log('🧪 開始測試兌換碼跨裝置同步與雲端雙向防刷機制');
  console.log('==================================================');

  const adminUser = {
    id: 'admin_test_root',
    displayName: '總管理員',
    email: SUPER_ADMIN_EMAIL,
    role: 'super_admin'
  };

  const testCode = 'SYNC_VERIFY_999';

  // 1. 管理員在設備 A 新增兌換碼
  console.log('\n[1/5] 設備 A (管理員電腦): 發放新兌換碼【' + testCode + '】...');
  try {
    addRedemptionCode({
      code: testCode,
      label: '跨裝置即時同步測試禮包',
      rewardValue: 88,
      type: 'points',
      expiresAt: '2028-12-31'
    }, adminUser);
    console.log('  -> 兌換碼發放成功！已寫入本地與 Firebase 雲端');
  } catch (err) {
    console.log('  -> 提示:', err.message);
  }

  // 2. 設備 B (學生手機，全新環境無快取): 調閱雲端兌換碼
  console.log('\n[2/5] 設備 B (學生手機): 模擬初次打開兌換視窗，向雲端同步兌換碼...');
  const cloudCodes = await fetchCloudRedemptionCodes();
  const found = cloudCodes.find(c => c.code === testCode);
  console.log(`  -> 雲端兌換碼調閱結果: 找到=${Boolean(found)}, 禮包=${found?.label}, 獎勵=${found?.rewardValue}點`);
  if (!found) {
    throw new Error('設備 B 無法從雲端同步到兌換碼！');
  }

  // 3. 設備 B 兌換該序號
  console.log('\n[3/5] 設備 B (學生手機): 執行兌換 (redeemCodeAsync)...');
  const mockStudent = {
    id: 'u_student_cross_test',
    displayName: '小華',
    email: 'hua_student@gmail.com'
  };
  const reward = await redeemCodeAsync(mockStudent.id, testCode, mockStudent.displayName);
  console.log(`  -> 兌換成功！獲得 ${reward.rewardValue} ${reward.type}！`);

  // 4. 設備 C (學生平板/電腦): 嘗試再次兌換同一組序號
  console.log('\n[4/5] 設備 C (學生平板): 嘗試跨裝置重複兌換相同序號...');
  let intercepted = false;
  try {
    await redeemCodeAsync(mockStudent.id, testCode, mockStudent.displayName);
  } catch (err) {
    intercepted = true;
    console.log(`  -> 成功攔截跨裝置重複兌換！錯誤訊息:「${err.message}」`);
  }
  if (!intercepted) {
    throw new Error('跨裝置防刷機制失效！同一學生在不同設備重複領取了兌換碼！');
  }

  // 5. 測試結束，徹底清除測試序號與雲端帳本，保持零測資
  console.log('\n[5/5] 清理測試序號與雲端帳本，保證 Firebase 零測資...');
  deleteRedemptionCode(testCode, adminUser);
  await remove(ref(db, `studyhub/redeemed_ledger/${testCode}_${mockStudent.id}`));
  await remove(ref(db, `studyhub/redeemed_history_${mockStudent.id}`));
  
  // 自 deleted_redemption_codes 移除
  const snap = await get(ref(db, 'studyhub/deleted_redemption_codes'));
  let delList = snap.val() || [];
  delList = delList.filter(c => c !== testCode);
  await set(ref(db, 'studyhub/deleted_redemption_codes'), delList);

  console.log('==================================================');
  console.log('🎉 跨裝置兌換碼與全功能同步驗證 100% 通過！');
  console.log('==================================================');
  process.exit(0);
}

testCrossDeviceRedemption().catch(err => {
  console.error('❌ 測試失敗:', err);
  process.exit(1);
});
