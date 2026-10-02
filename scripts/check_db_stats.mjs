import { db } from '../src/services/firebase.js';
import { ref, get } from 'firebase/database';

async function checkStats() {
  const snap = await get(ref(db, 'studyhub'));
  if (!snap.exists()) {
    console.log('No data found in Firebase');
    process.exit(0);
  }
  const data = snap.val();
  const users = data.user_registry ? Object.keys(data.user_registry).length : 0;
  const papers = data.quiz_papers ? Object.keys(data.quiz_papers).length : 0;
  const allPapers = data.all_quiz_papers ? data.all_quiz_papers.length : 0;
  console.log(`Users: ${users}`);
  console.log(`Quiz Papers: ${papers}`);
  console.log(`All Quiz Papers: ${allPapers}`);
  process.exit(0);
}
checkStats().catch(console.error);
