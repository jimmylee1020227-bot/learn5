import fs from 'fs';
let code = fs.readFileSync('src/services/cloudStorage.js', 'utf8');

const regex = /setJson\(([^,]+),\s*([^)]+)\);/g;
let match;
let edits = [];

while ((match = regex.exec(code)) !== null) {
  const [fullMatch, arg1, arg2] = match;
  const index = match.index;
  
  const nextLines = code.substring(index, index + 150);
  if (!nextLines.includes(`updateServerSync(${arg1}`)) {
    
    const targets = [
      'support_chats', 'global_settings', 'admin_notifications',
      'community_posts', 'community_reports', 'todayKey',
      'chat_', 'deleted_notifications', 'deleted_community_post_ids',
      'privacy_consent'
    ];
    
    if (targets.some(k => arg1.includes(k))) {
       edits.push({
         index: index + fullMatch.length,
         text: `\n    updateServerSync(${arg1}, ${arg2});`
       });
    }
  }
}

for (let i = edits.length - 1; i >= 0; i--) {
  const e = edits[i];
  code = code.substring(0, e.index) + e.text + code.substring(e.index);
}

fs.writeFileSync('src/services/cloudStorage.js', code);
console.log('Added ' + edits.length + ' syncs');
