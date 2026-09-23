const fs = require('fs');
let content = fs.readFileSync('src/services/cloudStorage.js', 'utf8');

// replace the import
content = content.replace("import { db, ref, set, get, onValue } from './firebase.js';", "import { db, ref, set, get, onValue, update } from './firebase.js';");
content = content.replace("import { db, ref, set, get, onValue, off, child } from './firebase.js';", "import { db, ref, set, get, onValue, off, child, update } from './firebase.js';");

if (!content.includes('export function updateServerSync')) {
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
}

fs.writeFileSync('src/services/cloudStorage.js', content);
