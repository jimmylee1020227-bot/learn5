const fs = require('fs');
let rules = fs.readFileSync('database.rules.json', 'utf8');

rules = rules.replace(/"practice_history_\$userId":\s*{\s*"\.read":\s*true,\s*"\.write":\s*"newData\.exists\(\)"\s*},/g, '');
rules = rules.replace(/"mistake_notebook_\$userId":\s*{\s*"\.read":\s*true,\s*"\.write":\s*"newData\.exists\(\)"\s*},/g, '');
rules = rules.replace(/"user_quiz_papers_\$userId":\s*{\s*"\.read":\s*true,\s*"\.write":\s*"newData\.exists\(\)"\s*},/g, '');
rules = rules.replace(/"studyhub_game_state_\$userId":\s*{\s*"\.read":\s*true,\s*"\.write":\s*"newData\.exists\(\)"\s*},/g, '');
rules = rules.replace(/"redeemed_history_\$userId":\s*{\s*"\.read":\s*true,\s*"\.write":\s*"newData\.exists\(\)"\s*},/g, '');
rules = rules.replace(/"daily_stats_\$rest":\s*{\s*"\.read":\s*true,\s*"\.write":\s*"newData\.exists\(\)"\s*},/g, '');
rules = rules.replace(/"privacy_consent_\$userId":\s*{\s*"\.read":\s*true,\s*"\.write":\s*"newData\.exists\(\)"\s*}/g, '');

const regex = /"deleted_redemption_codes":\s*{\s*"\.read":\s*true,\s*"\.write":\s*"newData\.exists\(\)"\s*}/;
const match = regex.exec(rules);
if (match) {
  const insertText = `
      "deleted_redemption_codes": {
        ".read": true,
        ".write": "newData.exists()"
      },
      
      "$dynamicKey": {
        ".read": true,
        ".write": "newData.exists() && ( $dynamicKey.matches('^practice_history_.*') || $dynamicKey.matches('^mistake_notebook_.*') || $dynamicKey.matches('^user_quiz_papers_.*') || $dynamicKey.matches('^studyhub_game_state_.*') || $dynamicKey.matches('^redeemed_history_.*') || $dynamicKey.matches('^daily_stats_.*') || $dynamicKey.matches('^privacy_consent_.*') || $dynamicKey.matches('^studyhub_custom_name_.*') )"
      }`;
  rules = rules.replace(match[0], insertText);
}

fs.writeFileSync('database.rules.json', rules);
