import { db } from '../src/services/firebase.js';
import { ref, get, set } from 'firebase/database';

const validSubjects = ['國文', '英文', '數學', '自然', '社會'];

async function main() {
  console.log('從 Firebase 掃描所有錯題本...');
  const snap = await get(ref(db, 'studyhub'));
  const data = snap.val() || {};
  
  let totalInvalid = 0;
  let totalValid = 0;
  
  for (const [key, val] of Object.entries(data)) {
    if (!key.startsWith('mistake_notebook_')) continue;
    const userId = key.replace('mistake_notebook_', '');
    const list = Array.isArray(val) ? val : Object.values(val || {});
    const invalid = list.filter(m => !m || !m.id || !m.subject || !validSubjects.includes(m.subject));
    const valid = list.filter(m => m && m.id && m.subject && validSubjects.includes(m.subject));
    
    if (invalid.length > 0) {
      console.log(`\n⚠️  ${key} (userId=${userId})`);
      console.log(`   全部: ${list.length} 筆, 有效: ${valid.length} 筆, 無效: ${invalid.length} 筆`);
      invalid.forEach((m, i) => {
        console.log(`   [${i}] id="${m?.id}", subject="${m?.subject}", question="${String(m?.question || '').slice(0, 40)}"`);
      });
      
      // 自動修復：過濾掉無效的並寫回
      if (valid.length !== list.length) {
        await set(ref(db, `studyhub/${key}`), valid);
        console.log(`   ✅ 已自動清除 ${invalid.length} 筆無效錯題`);
      }
      totalInvalid += invalid.length;
    }
    totalValid += valid.length;
  }
  
  if (totalInvalid === 0) {
    console.log(`\n✅ 所有錯題本完全乾淨，共 ${totalValid} 筆有效錯題`);
  } else {
    console.log(`\n✅ 完成！已清除 ${totalInvalid} 筆無效錯題，保留 ${totalValid} 筆有效錯題`);
  }
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
