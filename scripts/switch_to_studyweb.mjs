// scripts/switch_to_studyweb.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const filesToReplace = [
  'src/services/cloudStorage.js',
  'src/data/unitNotesData.js',
  'src/components/CommunityWallModal.jsx',
  'src/components/RedemptionModal.jsx',
  'src/components/Navbar.jsx',
  'src/components/QuizPlayer.jsx',
  'src/components/LoginGateway.jsx',
  'src/components/Footer.jsx',
  'src/components/LegalCenterModal.jsx',
  'src/components/GoogleConsentScreen.jsx',
  'src/components/CookieConsentBanner.jsx',
  'src/components/GoogleLoginModal.jsx',
  'src/components/GlobalBroadcastBanner.jsx',
  'src/components/GoogleAuthPage.jsx',
  'src/components/PrivacyPolicyModal.jsx',
  'public/404.html',
  'index.html',
  'server_data/cloud_state.json',
  'scripts/generate_deep_notes.mjs'
];

let totalChanges = 0;

for (const relPath of filesToReplace) {
  const fullPath = path.join(rootDir, relPath);
  if (!fs.existsSync(fullPath)) continue;
  let content = fs.readFileSync(fullPath, 'utf-8');
  const original = content;

  // 替換
  content = content.replaceAll('公益讀書網站', '公益學習網站');
  content = content.replaceAll('全科測驗複習讀書網', '全科測驗複習學習網');
  content = content.replaceAll('國中全科複習讀書網', '國中全科複習學習網');
  content = content.replaceAll('國中全科讀書網', '國中全科學習網');
  content = content.replaceAll('讀書網', '學習網');

  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log(`已更新: ${relPath}`);
    totalChanges++;
  }
}

console.log(`✅ 已完成 ${totalChanges} 個檔案的站名統一為「學習網」！`);
