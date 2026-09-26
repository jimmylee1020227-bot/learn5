import { db } from '../src/services/firebase.js';
import { ref, get, update, set } from 'firebase/database';

async function main() {
  const snap = await get(ref(db, 'studyhub/user_registry'));
  const reg = snap.val() || {};
  
  // 找出所有叫「小編」的帳號
  const editors = Object.entries(reg).filter(([, u]) => u?.name === '小編');
  
  if (editors.length === 0) {
    console.log('找不到名字叫「小編」的帳號');
    console.log('所有帳號名稱：', Object.values(reg).map(u => `${u.name} (${u.id})`).join(', '));
  } else {
    console.log(`找到 ${editors.length} 個「小編」帳號：`);
    editors.forEach(([k, u]) => {
      console.log(`  id=${k}, email=${u.email}, totalCorrect=${u.totalCorrect}, totalQuestions=${u.totalQuestions}, role=${u.role}`);
    });
  }
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
