import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set, remove } from "firebase/database";
import fs from 'fs';

const fbConfigStr = fs.readFileSync('src/services/firebase.js', 'utf8');
const match = fbConfigStr.match(/const firebaseConfig = ({[\s\S]*?});/);
if (match) {
  const configStr = match[1].replace(/import\.meta\.env\.VITE_.*? \|\| /g, '');
  const config = eval('(' + configStr + ')');
  const app = initializeApp(config);
  const db = getDatabase(app);

  (async () => {
    // 1. Fetch user_registry
    const regSnap = await get(ref(db, 'studyhub/user_registry'));
    const registry = regSnap.val() || {};
    
    // 2. Group by email
    const emailMap = {};
    for (const uid in registry) {
      const email = registry[uid].email?.toLowerCase() || '';
      if (!email) continue;
      if (!emailMap[email]) emailMap[email] = [];
      emailMap[email].push(uid);
    }
    
    let dbFixes = 0;
    
    for (const email in emailMap) {
      if (emailMap[email].length > 1) {
        console.log(`Duplicate found for email: ${email}`, emailMap[email]);
        
        // Find the one with higher score (tickets? points? history?)
        let bestUid = null;
        let maxTickets = -1;
        
        for (const uid of emailMap[email]) {
           const gameSnap = await get(ref(db, `studyhub/studyhub_game_state_${uid}`));
           const gameState = gameSnap.val() || {};
           const tickets = gameState.tickets || 0;
           
           if (tickets > maxTickets) {
             maxTickets = tickets;
             bestUid = uid;
           }
        }
        
        // Now delete others and merge
        for (const uid of emailMap[email]) {
          if (uid !== bestUid) {
             console.log(`Deleting duplicate UID: ${uid} (Keeping ${bestUid} with tickets: ${maxTickets})`);
             await remove(ref(db, `studyhub/studyhub_game_state_${uid}`));
             await remove(ref(db, `studyhub/practice_history_${uid}`));
             await remove(ref(db, `studyhub/mistake_notebook_${uid}`));
             await remove(ref(db, `studyhub/user_registry/${uid}`));
             dbFixes++;
          }
        }
      }
    }
    console.log(`Finished merging. Cleaned ${dbFixes} duplicates.`);
    process.exit(0);
  })();
}
