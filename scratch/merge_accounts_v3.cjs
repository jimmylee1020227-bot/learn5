const { initializeApp } = require("firebase/app");
const { getDatabase, ref, get, set, remove } = require("firebase/database");
const fs = require('fs');

const fbConfigStr = fs.readFileSync('src/services/firebase.js', 'utf8');
const match = fbConfigStr.match(/const firebaseConfig = ({[\s\S]*?});/);
if (match) {
  const configStr = match[1].replace(/import\.meta\.env\.VITE_.*? \|\| /g, '');
  const config = eval('(' + configStr + ')');
  const app = initializeApp(config);
  const db = getDatabase(app);

  function generateDeterministicUserId(emailStr) {
    const clean = (emailStr || '').trim().toLowerCase();
    let h1 = 0xdeadbeef;
    let h2 = 0x41c6ce57;
    for (let i = 0; i < clean.length; i++) {
      const ch = clean.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    const p1 = Math.abs(h1).toString(36);
    const p2 = Math.abs(h2).toString(36);
    return `u_${p1}${p2}`;
  }

  function getLegacyId(emailStr) {
    return btoa(emailStr.trim().toLowerCase()).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
  }

  (async () => {
    const regSnap = await get(ref(db, 'studyhub/user_registry'));
    const registry = regSnap.val() || {};
    
    const emailMap = {};
    for (const uid in registry) {
      const email = registry[uid].email?.toLowerCase() || '';
      if (!email) continue;
      if (!emailMap[email]) emailMap[email] = new Set();
      emailMap[email].add(uid);
      emailMap[email].add(generateDeterministicUserId(email));
      emailMap[email].add(getLegacyId(email));
    }
    
    let dbFixes = 0;
    
    for (const email in emailMap) {
      const uids = Array.from(emailMap[email]);
      if (uids.length > 1) {
        console.log(`Checking email: ${email} with UIDs:`, uids);
        
        let bestUid = null;
        let maxScore = -1;
        let bestName = null;
        
        for (const uid of uids) {
           const gameSnap = await get(ref(db, `studyhub/studyhub_game_state_${uid}`));
           const gameState = gameSnap.val() || {};
           const tickets = gameState.tickets || 0;
           
           const practiceSnap = await get(ref(db, `studyhub/practice_history_${uid}`));
           const practice = practiceSnap.val() || {};
           const historyCount = Object.keys(practice).length;
           
           const score = tickets * 10 + historyCount;
           
           if (score > maxScore) {
             maxScore = score;
             bestUid = uid;
             if (registry[uid] && registry[uid].name) {
               bestName = registry[uid].name;
             }
           }
        }
        
        if (bestUid) {
          console.log(`Best UID for ${email} is ${bestUid} with score ${maxScore}`);
          
          for (const uid of uids) {
            if (uid !== bestUid) {
               console.log(`Deleting duplicate UID: ${uid}`);
               await remove(ref(db, `studyhub/studyhub_game_state_${uid}`));
               await remove(ref(db, `studyhub/practice_history_${uid}`));
               await remove(ref(db, `studyhub/mistake_notebook_${uid}`));
               await remove(ref(db, `studyhub/user_registry/${uid}`));
               dbFixes++;
            }
          }
          
          // Ensure bestUid is in registry
          if (!registry[bestUid]) {
            await set(ref(db, `studyhub/user_registry/${bestUid}`), {
              id: bestUid,
              email: email,
              name: bestName || email.split('@')[0],
              role: 'student',
              lastActive: new Date().toISOString()
            });
          }
        }
      }
    }
    console.log(`Finished merging. Cleaned ${dbFixes} duplicate records.`);
    process.exit(0);
  })();
}
