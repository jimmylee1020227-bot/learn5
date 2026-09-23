const fs = require('fs');
const file = 'src/services/cloudStorage.js';
let content = fs.readFileSync(file, 'utf8');

const helper = `
// 安全寫入 LocalStorage (防 QuotaExceededError 造成後續雲端同步中斷)
export function safeSetLocalStorage(key, valueStr) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, valueStr);
    }
  } catch (e) {
    console.warn(\`[LocalStorage Warning] 無法儲存 \${key} (可能已滿 5MB限制)，但不影響雲端存檔。\`, e);
  }
}
`;

content = content.replace("import { db, ref, set, get, onValue } from './firebase.js';", "import { db, ref, set, get, onValue } from './firebase.js';\n" + helper);
content = content.replace(/localStorage\.setItem\(([^,]+),\s*(.+?)\)/g, 'safeSetLocalStorage($1, $2)');

fs.writeFileSync(file, content);
