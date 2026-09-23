const fs = require('fs');
let content = fs.readFileSync('src/services/cloudStorage.js', 'utf8');

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

content += newFunction;
fs.writeFileSync('src/services/cloudStorage.js', content);
