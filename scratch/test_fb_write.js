import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get } from "firebase/database";
import fs from 'fs';

const fbConfigStr = fs.readFileSync('src/services/firebase.js', 'utf8');
// Extract the firebaseConfig object from the file
const match = fbConfigStr.match(/const firebaseConfig = ({[\s\S]*?});/);
if (match) {
  const configStr = match[1].replace(/import\.meta\.env\.VITE_.*? \|\| /g, '');
  // parse the config string (eval it carefully)
  const config = eval('(' + configStr + ')');
  const app = initializeApp(config);
  const db = getDatabase(app);
  
  const testRef = ref(db, 'studyhub/test_sync_node');
  set(testRef, { time: Date.now() })
    .then(() => console.log('✅ Firebase write successful on test_sync_node'))
    .catch(e => console.log('❌ Firebase write failed:', e.message))
    .finally(() => {
        const gameRef = ref(db, 'studyhub/studyhub_game_state_test_user');
        set(gameRef, { tickets: 5 })
          .then(() => console.log('✅ Firebase write successful on game_state'))
          .catch(e => console.log('❌ Firebase write failed on game_state:', e.message))
          .finally(() => process.exit(0));
    });
} else {
  console.log('Could not find firebaseConfig');
}
