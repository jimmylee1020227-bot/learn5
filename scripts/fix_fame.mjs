import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set } from 'firebase/database';

const firebaseConfig = {
  projectId: "learn-9e08c",
  appId: "1:441886374818:web:19ac00711cfba05afa90fb",
  databaseURL: "https://learn-9e08c-default-rtdb.asia-southeast1.firebasedatabase.app",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function run() {
  const fameRef = ref(db, 'studyhub/studyhub_hall_of_fame');
  const snap = await get(fameRef);
  if (snap.exists()) {
    const list = snap.val();
    
    // Find W39 entry
    const w39Entry = list.find(entry => entry.weekId === '2026-W39');
    if (w39Entry) {
      w39Entry.champion = {
        displayName: "fternoon A",
        avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=fternoon A&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&radius=50",
        finalScore: 98
      };
      w39Entry.runnersUp = [
        "胡明智 (84分)",
        "chen奇異果 (60分)"
      ];
      await set(fameRef, list);
      console.log('Fixed W39 Hall of Fame entry!');
    }
  }
  process.exit(0);
}
run().catch(console.error);
