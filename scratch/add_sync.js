const fs = require('fs');
let code = fs.readFileSync('src/services/cloudStorage.js', 'utf8');

const regex = /setJson\(([^,]+),\s*([^)]+)\);/g;
let match;
let edits = [];

while ((match = regex.exec(code)) !== null) {
  const [fullMatch, arg1, arg2] = match;
  const index = match.index;
  
  // Check next lines to see if updateServerSync is already there
  const nextLines = code.substring(index, index + 150);
  if (!nextLines.includes(`updateServerSync(${arg1}`)) {
    
    // Check if it's one of the safe keys to sync (exclude all_quiz_papers which is local cache)
    if (arg1.includes('all_quiz_papers') || arg1.includes('audit_logs')) {
      // Actually audit_logs is already synced in my previous commit, but wait, maybe it was?
      // Let's just add it manually where needed.
    }
    
    // If it's a known missing sync:
    if (['support_chats', 'global_settings', 'admin_notifications', 'community_posts', 'community_reports', 'todayKey'].some(k => arg1.includes(k) || arg1.includes('chat_'))) {
       edits.push({
         index: index + fullMatch.length,
         text: `\n  updateServerSync(${arg1}, ${arg2});`
       });
    }
  }
}

// apply backwards
for (let i = edits.length - 1; i >= 0; i--) {
  const e = edits[i];
  code = code.substring(0, e.index) + e.text + code.substring(e.index);
}

fs.writeFileSync('src/services/cloudStorage.js', code);
console.log('Added ' + edits.length + ' syncs');
