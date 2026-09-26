import { db } from '../src/services/firebase.js';
import { ref, get } from 'firebase/database';

async function main() {
  // 找最新試卷，看它為什麼被標記為 WARN
  const snap = await get(ref(db, 'studyhub/quiz_papers'));
  const papers = snap.val() || {};
  const arr = Object.values(papers).filter(p => p && p.id);
  const sorted = arr.sort((a, b) =>
    new Date(b.completedAt || b.timestamp || 0) - new Date(a.completedAt || a.timestamp || 0)
  );
  
  if (sorted.length === 0) {
    console.log('沒有試卷');
    process.exit(0);
  }
  
  const latest = sorted[0];
  console.log('最新試卷 id:', latest.id);
  console.log('有 questions?', !!latest.questions, '(長度:', Array.isArray(latest.questions) ? latest.questions.length : typeof latest.questions, ')');
  console.log('有 userAnswers?', latest.userAnswers !== undefined, '(型態:', typeof latest.userAnswers, ')');
  console.log('有 userId?', !!latest.userId);
  console.log('欄位列表:', Object.keys(latest).join(', '));
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
