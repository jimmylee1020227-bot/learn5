import { db } from '../src/services/firebase.js';
import { ref, get, set, remove, update } from 'firebase/database';

const SUPER_ADMIN_EMAIL = 'jimmylee1020227@gmail.com';
const KNBO_UID = 'u_knbo67cox0xp'; // 小編

async function main() {
  console.log('連線至 Firebase...');
  const snap = await get(ref(db, 'studyhub'));
  const data = snap.val();
  
  // --- 1. 列出無效帳號 ---
  console.log('\n[1] 掃描無效帳號...');
  const reg = data.user_registry || {};
  const validUids = new Set();
  const invalidKeys = [];
  for (const [k, u] of Object.entries(reg)) {
    if (!u || !u.id || !u.email || u.email.trim() === '') {
      console.log(`  ⚠️ 無效: ${k} | name=${u?.name} | email="${u?.email}"`);
      invalidKeys.push(k);
    } else {
      validUids.add(k);
    }
  }
  console.log(`  共 ${invalidKeys.length} 個無效帳號`);
  
  // 刪除無效帳號
  for (const k of invalidKeys) {
    await remove(ref(db, `studyhub/user_registry/${k}`));
    console.log(`  ✅ 已移除: ${k}`);
  }

  // --- 2. 掃描並清除無效錯題 ---
  console.log('\n[2] 掃描並清除所有使用者的無效錯題...');
  let totalInvalidMistakes = 0;
  for (const key of Object.keys(data)) {
    if (!key.startsWith('mistake_notebook_')) continue;
    const notebook = data[key];
    if (!notebook || typeof notebook !== 'object') continue;
    const list = Array.isArray(notebook) ? notebook : Object.values(notebook);
    const validList = list.filter(m => m && m.id && m.subject);
    const removed = list.length - validList.length;
    if (removed > 0) {
      console.log(`  ⚠️ ${key}: 移除 ${removed} 筆無效錯題 (共 ${list.length} → ${validList.length})`);
      await set(ref(db, `studyhub/${key}`), validList);
      totalInvalidMistakes += removed;
    }
  }
  console.log(`  共清除 ${totalInvalidMistakes} 筆無效錯題`);

  // --- 3. 設定小編點數為 50 ---
  console.log('\n[3] 設定小編 totalCorrect=50...');
  const editorSnap = await get(ref(db, `studyhub/user_registry/${KNBO_UID}`));
  if (editorSnap.exists()) {
    const editor = editorSnap.val();
    console.log(`  目前: totalCorrect=${editor.totalCorrect}, totalQuestions=${editor.totalQuestions}`);
    await update(ref(db, `studyhub/user_registry/${KNBO_UID}`), {
      totalCorrect: 50,
      totalQuestions: Math.max(editor.totalQuestions || 0, 50),
    });
    console.log(`  ✅ 小編點數已設定為 50`);
  } else {
    console.log(`  ❌ 找不到小編帳號 ${KNBO_UID}`);
  }

  // --- 4. 孤兒試卷清理 ---
  console.log('\n[4] 清理孤兒試卷 (quiz_papers)...');
  let orphanCount = 0;
  const papers = data.quiz_papers || {};
  for (const [k, p] of Object.entries(papers)) {
    if (!p) continue;
    const owner = p.userId || p.ownerId;
    if (owner && !validUids.has(owner)) {
      await remove(ref(db, `studyhub/quiz_papers/${k}`));
      orphanCount++;
    }
  }
  console.log(`  已移除 ${orphanCount} 份孤兒試卷`);
  
  // all_quiz_papers
  const allPapersSnap = await get(ref(db, 'studyhub/all_quiz_papers'));
  if (allPapersSnap.exists()) {
    const allPapers = allPapersSnap.val();
    const list = Array.isArray(allPapers) ? allPapers : Object.values(allPapers);
    const newList = list.filter(p => {
      if (!p) return false;
      const owner = p.userId || p.ownerId;
      return !owner || validUids.has(owner);
    });
    if (newList.length < list.length) {
      console.log(`  all_quiz_papers: 移除 ${list.length - newList.length} 份`);
      await set(ref(db, 'studyhub/all_quiz_papers'), newList);
    }
  }

  console.log('\n✅ 全部清理完成！');
  process.exit(0);
}

main().catch(err => {
  console.error('執行失敗:', err);
  process.exit(1);
});
