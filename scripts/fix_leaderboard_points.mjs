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
  const lbRef = ref(db, 'studyhub/leaderboard_players');
  const snap = await get(lbRef);
  if (snap.exists()) {
    const lb = snap.val();
    let count = 0;
    for (const [uid, user] of Object.entries(lb)) {
      if (user && (user.userName === 'fternoon A' || user.displayName === 'fternoon A' || user.name === 'fternoon A')) {
        user.points = 21;
        user.weeklyPoints = 21;
        user.totalPoints = 21;
      } else if (user) {
        user.points = 0;
        user.weeklyPoints = 0;
        user.totalPoints = 0;
      }
      count++;
    }
    await set(lbRef, lb);
    console.log('Updated leaderboard_players:', count);
  }

  const weeklyRef = ref(db, 'studyhub/studyhub_weekly_leaderboard');
  const weeklySnap = await get(weeklyRef);
  if (weeklySnap.exists()) {
    const lb = weeklySnap.val();
    let count = 0;
    for (const [uid, user] of Object.entries(lb)) {
      if (user && (user.userName === 'fternoon A' || user.displayName === 'fternoon A' || user.name === 'fternoon A')) {
        user.points = 21;
        user.weeklyPoints = 21;
        user.totalPoints = 21;
      } else if (user) {
        user.points = 0;
        user.weeklyPoints = 0;
        user.totalPoints = 0;
      }
      count++;
    }
    await set(weeklyRef, lb);
    console.log('Updated weekly_leaderboard:', count);
  }
  process.exit(0);
}
run().catch(console.error);
