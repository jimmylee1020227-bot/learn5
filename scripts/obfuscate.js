import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JavaScriptObfuscator from 'javascript-obfuscator';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distAssetsDir = path.resolve(__dirname, '../dist/assets');

if (!fs.existsSync(distAssetsDir)) {
  console.error('❌ dist/assets 目錄不存在，請先執行 npm run build');
  process.exit(1);
}

const files = fs.readdirSync(distAssetsDir);
// 只對我們自己的業務與題庫模組進行加密混淆，排除第三方開源庫 (vendor-*)
const jsFiles = files.filter(f => f.endsWith('.js') && !f.startsWith('vendor-'));

console.log(`🔐 開始對自研核心與題庫程式碼進行高性能加密混淆 (${jsFiles.length} 個檔案)...`);

for (const file of jsFiles) {
  const filePath = path.join(distAssetsDir, file);
  const code = fs.readFileSync(filePath, 'utf-8');

  const obfuscatedResult = JavaScriptObfuscator.obfuscate(code, {
    compact: true,
    controlFlowFlattening: false,
    numbersToExpressions: false,
    simplify: true,
    stringArray: true,
    stringArrayThreshold: 0.5,
    splitStrings: false,
    transformObjectKeys: false,
    unicodeEscapeSequence: false,
    disableConsoleOutput: false
  });

  fs.writeFileSync(filePath, obfuscatedResult.getObfuscatedCode(), 'utf-8');
  console.log(`  ✅ 已加密混淆: ${file} (${Math.round(code.length / 1024)}KB -> ${Math.round(obfuscatedResult.getObfuscatedCode().length / 1024)}KB)`);
}

console.log('🎉 核心業務與題庫已完成防護，第三方開源庫維持極速直讀！');
