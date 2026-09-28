import fs from 'fs';
const file = '/Users/lijingyan/Documents/學習網/src/services/cloudStorage.js';
let content = fs.readFileSync(file, 'utf8');

// Replace all "Array.isArray(val) ? val : Object.values(val)"
// with "(Array.isArray(val) ? val : Object.values(val)).filter(Boolean)"
// unless they already have .filter(Boolean)

content = content.replace(/(?:let|const)\s+(\w+)\s*=\s*(?:Array\.isArray\(val\)\s*\?\s*val\s*:\s*Object\.values\(val(?:\s*\|\|\s*\{\})?\));?/g, (match, varName) => {
  return match.replace(/Array\.isArray\(val\)\s*\?\s*val\s*:\s*Object\.values\(val(?:\s*\|\|\s*\{\})?\)/, '(Array.isArray(val) ? val : Object.values(val)).filter(Boolean)');
});

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed cloudStorage.js');
