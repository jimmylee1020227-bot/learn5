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
  const snap = await get(ref(db, 'studyhub/studyhub_hall_of_fame'));
  if (snap.exists()) {
    console.log(JSON.stringify(snap.val(), null, 2));
  } else {
    console.log("No hall of fame found.");
  }
  process.exit(0);
}
run().catch(console.error);
