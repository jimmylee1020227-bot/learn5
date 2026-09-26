import { db } from '../src/services/firebase.js';
import { ref, get, remove, set } from 'firebase/database';

async function cleanupOrphans() {
  console.log('開始清理雲端孤兒試卷...');
  const registrySnap = await get(ref(db, 'studyhub/user_registry'));
  const validUids = new Set(Object.keys(registrySnap.val() || {}));
  
  const papersSnap = await get(ref(db, 'studyhub/quiz_papers'));
  const allPapersSnap = await get(ref(db, 'studyhub/all_quiz_papers'));

  let removedCount = 0;
  
  if (papersSnap.exists()) {
    for (const [key, p] of Object.entries(papersSnap.val() || {})) {
      const ownerId = p.userId || p.ownerId;
      if (ownerId && !validUids.has(ownerId)) {
         await remove(ref(db, `studyhub/quiz_papers/${key}`));
         removedCount++;
      }
    }
  }

  const allPapersObj = allPapersSnap.val() || {};
  if (Array.isArray(allPapersObj)) {
      const newList = [];
      for(let p of allPapersObj) {
         if(!p) continue;
         const ownerId = p.userId || p.ownerId;
         if (ownerId && !validUids.has(ownerId)) {
            removedCount++;
         } else {
            newList.push(p);
         }
      }
      await set(ref(db, 'studyhub/all_quiz_papers'), newList);
  } else {
      for (const [key, p] of Object.entries(allPapersObj)) {
        const ownerId = p.userId || p.ownerId;
        if (ownerId && !validUids.has(ownerId)) {
           await remove(ref(db, `studyhub/all_quiz_papers/${key}`));
           removedCount++;
        }
      }
  }

  console.log(`清理完成！共移除了 ${removedCount} 份雲端孤兒試卷。`);
  process.exit(0);
}

cleanupOrphans().catch(err => {
  console.error('清理失敗:', err);
  process.exit(1);
});
