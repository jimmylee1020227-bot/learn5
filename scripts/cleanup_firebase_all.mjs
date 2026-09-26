import { db } from '../src/services/firebase.js';
import { ref, get, remove, set } from 'firebase/database';

async function cleanup() {
  console.log('連線至 Firebase 獲取最新資料進行清理...');
  const snap = await get(ref(db, 'studyhub'));
  if (!snap.exists()) {
    console.log('找不到 studyhub 節點。');
    process.exit(0);
  }
  
  const data = snap.val();
  let invalidUsers = 0;
  let invalidMistakes = 0;
  let invalidPapers = 0;
  
  const validUids = new Set();
  
  console.log('\n[1] 檢查並清理註冊表 (User Registry)...');
  if (data.user_registry) {
    for (const [k, u] of Object.entries(data.user_registry)) {
      if (!u || !u.id || !u.email) {
        console.log(`- 移除無效使用者節點: ${k}`);
        await remove(ref(db, `studyhub/user_registry/${k}`));
        invalidUsers++;
      } else {
        validUids.add(k);
      }
    }
  }
  
  console.log('\n[2] 檢查並清理錯題本 (Mistake Notebooks)...');
  for (const key of Object.keys(data)) {
    if (key.startsWith('mistake_notebook_')) {
      const notebook = data[key];
      if (notebook && typeof notebook === 'object') {
        const mistakesList = Array.isArray(notebook) ? notebook : Object.values(notebook);
        const newNotebook = [];
        let modified = false;
        
        for (const mistake of mistakesList) {
          if (!mistake || !mistake.id || !mistake.subject) {
            console.log(`- 移除無效錯題 (來自 ${key}), id: ${mistake?.id || 'undefined'}`);
            invalidMistakes++;
            modified = true;
          } else {
            newNotebook.push(mistake);
          }
        }
        
        if (modified) {
           await set(ref(db, `studyhub/${key}`), newNotebook);
        }
      }
    }
  }
  
  console.log('\n[3] 檢查並清理孤兒試卷 (Orphaned Quiz Papers)...');
  if (data.quiz_papers) {
    for (const [k, p] of Object.entries(data.quiz_papers)) {
      if (!p) continue;
      const owner = p.userId || p.ownerId;
      if (owner && !validUids.has(owner)) {
        console.log(`- 移除孤兒試卷 (quiz_papers): ${k}, owner: ${owner}`);
        await remove(ref(db, `studyhub/quiz_papers/${k}`));
        invalidPapers++;
      }
    }
  }
  
  if (data.all_quiz_papers) {
    const list = Array.isArray(data.all_quiz_papers) ? data.all_quiz_papers : Object.values(data.all_quiz_papers);
    const newList = list.filter(p => {
       if(!p) return false;
       const owner = p.userId || p.ownerId;
       return !owner || validUids.has(owner);
    });
    if (newList.length < list.length) {
       console.log(`- 移除孤兒試卷 (all_quiz_papers): 共移除 ${list.length - newList.length} 份`);
       await set(ref(db, `studyhub/all_quiz_papers`), newList);
       invalidPapers += (list.length - newList.length);
    }
  }
  
  console.log(`\n清理完成！共移除了 ${invalidUsers} 個無效帳號, ${invalidMistakes} 筆無效錯題, ${invalidPapers} 份孤兒試卷。`);
  process.exit(0);
}

cleanup().catch(err => {
  console.error('清理失敗:', err);
  process.exit(1);
});
