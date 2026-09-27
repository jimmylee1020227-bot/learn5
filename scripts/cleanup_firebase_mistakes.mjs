import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set } from 'firebase/database';

const firebaseConfig = {
  projectId: "learn-9e08c",
  appId: "1:441886374818:web:19ac00711cfba05afa90fb",
  databaseURL: "https://learn-9e08c-default-rtdb.asia-southeast1.firebasedatabase.app",
  storageBucket: "learn-9e08c.firebasestorage.app",
  apiKey: "AIzaSyD9O5Q8m1YHIBYukWbWIv_dvY_m2D57OOA",
  authDomain: "learn-9e08c.firebaseapp.com",
  messagingSenderId: "441886374818",
  measurementId: "G-PMP2WVVL0V"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const validSubjects = ['chinese', 'english', 'math', 'science', 'social'];

async function cleanupMistakes() {
  console.log('Fetching all users...');
  const usersSnap = await get(ref(db, 'studyhub/user_registry'));
  if (!usersSnap.exists()) {
    console.log('No users found in user_registry.');
    process.exit(0);
  }
  
  const users = usersSnap.val();
  const uids = Object.keys(users);
  console.log(`Found ${uids.length} users. Checking mistake notebooks...`);
  
  let totalInvalid = 0;
  let totalChecked = 0;
  
  for (const uid of uids) {
    const snap = await get(ref(db, `studyhub/mistake_notebook_${uid}`));
    if (snap.exists()) {
      const notebook = snap.val();
      const list = Array.isArray(notebook) ? notebook : Object.values(notebook);
      
      const validList = list.filter(m => m && m.questionId && m.subjectId && validSubjects.includes(m.subjectId));
      
      if (validList.length !== list.length) {
        const diff = list.length - validList.length;
        totalInvalid += diff;
        console.log(`User ${uid}: Found ${diff} invalid mistakes. Cleaning...`);
        await set(ref(db, `studyhub/mistake_notebook_${uid}`), validList);
      }
      totalChecked += list.length;
    }
  }
  
  console.log(`Cleanup complete! Checked ${totalChecked} mistakes, removed ${totalInvalid} invalid ones.`);
  process.exit(0);
}

cleanupMistakes().catch(console.error);
