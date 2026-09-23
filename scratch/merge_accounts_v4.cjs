const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get, set, remove, update } = require('firebase/database');

const firebaseConfig = {
  databaseURL: "https://learn-9e08c-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

function generateDeterministicUserId(email) {
  const cleanEmail = email.trim().toLowerCase();
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < cleanEmail.length; i++) {
    const ch = cleanEmail.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const p1 = Math.abs(h1).toString(36);
  const p2 = Math.abs(h2).toString(36);
  return `u_${p1}${p2}`;
}

async function migrateData() {
  console.log('🚀 Starting Data Migration to Unified ID...');
  const regSnap = await get(ref(db, 'studyhub/user_registry'));
  const registry = regSnap.val() || {};
  
  // Group by email
  const emailMap = {};
  for (const uid in registry) {
     const email = registry[uid].email?.toLowerCase();
     if (!email || email.includes('admin')) continue;
     if (!emailMap[email]) emailMap[email] = [];
     emailMap[email].push(uid);
  }

  let migrated = 0;
  
  for (const email in emailMap) {
     const uids = emailMap[email];
     const targetUid = generateDeterministicUserId(email);
     
     // 1. Gather all data across all UIDs for this email
     let bestGameState = {};
     let bestTickets = -1;
     let allPracticeHistory = [];
     let allMistakes = {};
     let bestName = email.split('@')[0];
     let bestActive = 0;
     
     for (const uid of uids) {
        // Read GameState
        const gSnap = await get(ref(db, `studyhub/studyhub_game_state_${uid}`));
        const gState = gSnap.val() || {};
        if ((gState.tickets || 0) > bestTickets) {
           bestTickets = gState.tickets || 0;
           bestGameState = gState;
        }
        
        // Read Practice History
        const pSnap = await get(ref(db, `studyhub/practice_history_${uid}`));
        const pHist = pSnap.val() || [];
        if (Array.isArray(pHist)) {
            allPracticeHistory.push(...pHist);
        }
        
        // Read Mistakes
        const mSnap = await get(ref(db, `studyhub/mistake_notebook_${uid}`));
        const mNote = mSnap.val() || {};
        for (const k in mNote) {
            allMistakes[k] = mNote[k];
        }
        
        if (registry[uid].name && registry[uid].name !== email.split('@')[0]) {
           bestName = registry[uid].name;
        }
     }
     
     // Remove duplicates from practice history by id
     const uniqueHist = [];
     const seenHist = new Set();
     for (const h of allPracticeHistory) {
         if (!seenHist.has(h.id)) {
            seenHist.add(h.id);
            uniqueHist.push(h);
         }
     }
     // sort history by timestamp desc
     uniqueHist.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
     if (uniqueHist.length > 500) uniqueHist.length = 500;
     
     // Rewrite everything to targetUid
     await set(ref(db, `studyhub/studyhub_game_state_${targetUid}`), bestGameState);
     await set(ref(db, `studyhub/practice_history_${targetUid}`), uniqueHist);
     await set(ref(db, `studyhub/mistake_notebook_${targetUid}`), allMistakes);
     await set(ref(db, `studyhub/user_registry/${targetUid}`), {
        id: targetUid,
        email: email,
        name: bestName,
        role: 'student',
        lastActive: new Date().toISOString()
     });
     
     // Now delete any uid that is NOT the targetUid
     for (const uid of uids) {
        if (uid !== targetUid) {
           console.log(`Deleting obsolete UID ${uid} and migrating to ${targetUid}`);
           await remove(ref(db, `studyhub/studyhub_game_state_${uid}`));
           await remove(ref(db, `studyhub/practice_history_${uid}`));
           await remove(ref(db, `studyhub/mistake_notebook_${uid}`));
           await remove(ref(db, `studyhub/user_registry/${uid}`));
           migrated++;
        }
     }
  }
  
  console.log(`✅ Migration complete. Merged and cleaned ${migrated} obsolete UID records.`);
  process.exit(0);
}

migrateData().catch(console.error);
