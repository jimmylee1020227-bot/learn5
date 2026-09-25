import fs from 'fs';
let code = fs.readFileSync('src/services/cloudStorage.js', 'utf8');
const lines = code.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('setJson(') && !lines[i].includes('function setJson')) {
    const keyMatch = lines[i].match(/setJson\(([^,]+)/);
    if (keyMatch) {
      const key = keyMatch[1];
      // Check next 2 lines
      const nextLines = lines.slice(i, i+3).join('\n');
      if (!nextLines.includes(`updateServerSync(${key}`)) {
        console.log(`Line ${i+1}: Missing sync for ${key}`);
      }
    }
  }
}
