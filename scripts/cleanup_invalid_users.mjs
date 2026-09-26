import { db } from '../src/services/firebase.js';
import { ref, get, remove } from 'firebase/database';

async function cleanup() {
  console.log('開始清理無效的雲端帳號資料...');
  const registryRef = ref(db, 'studyhub/user_registry');
  const snap = await get(registryRef);
  if (!snap.exists()) {
    console.log('找不到註冊表資料。');
    process.exit(0);
  }
  
  const data = snap.val();
  let invalidCount = 0;
  
  for (const [key, u] of Object.entries(data)) {
    if (!u || !u.id || !u.email) {
      console.log(`清理無效資料節點: ${key}`);
      await remove(ref(db, `studyhub/user_registry/${key}`));
      invalidCount++;
    }
  }
  
  console.log(`\n清理完成！共移除了 ${invalidCount} 筆無效帳號。`);
  process.exit(0);
}

cleanup().catch(err => {
  console.error('清理失敗:', err);
  process.exit(1);
});
