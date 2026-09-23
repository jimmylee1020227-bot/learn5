const fs = require('fs');
let content = fs.readFileSync('src/context/GameContext.jsx', 'utf8');

content = content.replace("import { getGlobalSettings, subscribeToCloudSync, getJson, setJson, fetchCloudUserGameState, getTaiwanDateStr }", "import { getGlobalSettings, subscribeToCloudSync, getJson, setJson, updateServerSync, fetchCloudUserGameState, getTaiwanDateStr }");

// Replace `setJson(\`\${STORAGE_GAME_KEY}_\${userId}\`, merged);` with:
// `safeSetLocalStorage(STORAGE_PREFIX + \`\${STORAGE_GAME_KEY}_\${userId}\`, JSON.stringify(merged)); updateServerSync(\`\${STORAGE_GAME_KEY}_\${userId}\`, updates);`
const oldCall = "setJson(`${STORAGE_GAME_KEY}_${userId}`, merged);";
const newCall = "window.localStorage && localStorage.setItem('studyhub_' + `${STORAGE_GAME_KEY}_${userId}`, JSON.stringify(merged));\n            updateServerSync(`${STORAGE_GAME_KEY}_${userId}`, updates);";
content = content.replace(oldCall, newCall);

fs.writeFileSync('src/context/GameContext.jsx', content);
