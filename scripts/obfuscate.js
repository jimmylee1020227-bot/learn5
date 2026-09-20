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
const jsFiles = files.filter(f => f.endsWith('.js'));

console.log(`🔐 開始對 GitHub 上線程式碼進行深度加密與混淆 (${jsFiles.length} 個檔案)...`);

for (const file of jsFiles) {
  const filePath = path.join(distAssetsDir, file);
  const code = fs.readFileSync(filePath, 'utf-8');

  const obfuscatedResult = JavaScriptObfuscator.obfuscate(code, {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,
    numbersToExpressions: true,
    simplify: true,
    stringArray: true,
    stringArrayEncoding: ['base64', 'rc4'],
    stringArrayThreshold: 0.8,
    splitStrings: false,
    transformObjectKeys: false,
    unicodeEscapeSequence: false,
    disableConsoleOutput: false
  });

  fs.writeFileSync(filePath, obfuscatedResult.getObfuscatedCode(), 'utf-8');
  console.log(`  ✅ 已加密混淆: ${file} (${Math.round(code.length / 1024)}KB -> ${Math.round(obfuscatedResult.getObfuscatedCode().length / 1024)}KB)`);
}

console.log('🎉 GitHub 上線加密混淆完成！程式碼具備高強度防逆向反編譯防護。');
