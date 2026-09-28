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

async function run() {
  const usersRef = ref(db, 'studyhub/user_registry');
  const snap = await get(usersRef);
  
  if (snap.exists()) {
    const users = snap.val();
    let updated = 0;
    
    if (Array.isArray(users)) {
      for (const user of users) {
        if (!user) continue;
        if (user.displayName === 'fternoon A' || user.name === 'fternoon A') {
          user.points = 21;
        } else {
          user.points = 0;
        }
        updated++;
      }
    } else {
      for (const [uid, user] of Object.entries(users)) {
        if (user.displayName === 'fternoon A' || user.name === 'fternoon A') {
          user.points = 21;
        } else {
          user.points = 0;
        }
        updated++;
      }
    }
    
    await set(usersRef, users);
    console.log(`Successfully updated ${updated} users' points.`);
  } else {
    console.log('No user_registry found.');
  }
  
  process.exit(0);
}

run().catch(console.error);
