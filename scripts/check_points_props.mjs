import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';

const firebaseConfig = {
  projectId: "learn-9e08c",
  appId: "1:441886374818:web:19ac00711cfba05afa90fb",
  databaseURL: "https://learn-9e08c-default-rtdb.asia-southeast1.firebasedatabase.app",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function run() {
  const usersRef = ref(db, 'studyhub/user_registry');
  const snap = await get(usersRef);
  if (snap.exists()) {
    const users = snap.val();
    const arr = Array.isArray(users) ? users : Object.values(users);
    for (const user of arr) {
      if (user && (user.displayName === 'fternoon A' || user.name === 'fternoon A' || user.displayName === '胡明智')) {
        console.log(user.displayName, user.points, user.weeklyPoints, user.totalPoints);
      }
    }
  }
  process.exit(0);
}
run().catch(console.error);
