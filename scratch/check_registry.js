import { initializeApp } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";
import fs from 'fs';

const fbConfigStr = fs.readFileSync('src/services/firebase.js', 'utf8');
const match = fbConfigStr.match(/const firebaseConfig = ({[\s\S]*?});/);
if (match) {
  const configStr = match[1].replace(/import\.meta\.env\.VITE_.*? \|\| /g, '');
  const config = eval('(' + configStr + ')');
  const app = initializeApp(config);
  const db = getDatabase(app);

  (async () => {
    const regSnap = await get(ref(db, 'studyhub/user_registry'));
    const registry = regSnap.val() || {};
    console.log(`Total users in registry: ${Object.keys(registry).length}`);
    for (const uid in registry) {
      console.log(`${uid}: ${registry[uid].email}`);
    }
    process.exit(0);
  })();
}
