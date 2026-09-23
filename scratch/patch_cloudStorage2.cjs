const fs = require('fs');
let content = fs.readFileSync('src/services/cloudStorage.js', 'utf8');

// 1. Remove the global overwrites of practice_history
content = content.replace("setJson('practice_history', combinedLogs);", "// REMOVED: global overwrite");
content = content.replace("setJson('practice_history', logs);", "// REMOVED: global overwrite");

// 2. Add updateServerSync
const updateImport = "import { db, ref, set, get, onValue, update } from './firebase.js';";
content = content.replace("import { db, ref, set, get, onValue } from './firebase.js';", updateImport);

const newFunction = `
export function updateServerSync(key, updates) {
  if (typeof window === 'undefined' || !db) return;
  try {
    const r = ref(db, \`studyhub/\${key}\`);
    update(r, updates).catch(err => {
      console.error(\`[Firebase Update Error: \${key}]\`, err);
    });
  } catch (e) {}
}
`;

content = content.replace("export function pushServerSync(key, value) {", newFunction + "\nexport function pushServerSync(key, value) {");

fs.writeFileSync('src/services/cloudStorage.js', content);
