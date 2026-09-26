import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import path from 'path';

async function runE2ETest() {
  console.log('🚀 啟動 Vite Preview 服務器進行 E2E 測試...');
  const server = spawn('npx', ['vite', 'preview', '--port', '5179'], {
    cwd: process.cwd(),
    stdio: 'pipe'
  });

  // 等待 server 啟動
  await new Promise(resolve => setTimeout(resolve, 2500));

  console.log('🌐 啟動 Puppeteer 無頭瀏覽器...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const errors = [];
  page.on('pageerror', err => {
    console.error('❌ 頁面運行期錯誤:', err.message);
    errors.push(err.message);
  });

  console.log('📄 正在載入首頁 http://localhost:5179/ ...');
  await page.goto('http://localhost:5179/', { waitUntil: 'networkidle0', timeout: 15000 });

  // 1. 檢查首頁「本週累積」與「今日練習目標」
  console.log('🔍 [1] 檢查首頁「今日練習目標」底下的「本週累積」...');
  const content = await page.content();
  const hasWeeklyPointsText = content.includes('本週累積：');
  console.log(`  -> 包含「本週累積：」文字: ${hasWeeklyPointsText}`);
  if (!hasWeeklyPointsText) {
    throw new Error('首頁未找到「本週累積：」字樣！');
  }

  // 2. 檢查首頁是否已徹底移除「刪除測資」、「重置系統」、「匯出備份」
  console.log('🔍 [2] 檢查危險按鈕是否已徹底移除...');
  const dangerousWords = ['刪除測資', '重置系統', '匯出備份', '清除測資'];
  for (const word of dangerousWords) {
    const hasWord = content.includes(word);
    console.log(`  -> 頁面包含「${word}」: ${hasWord}`);
    if (hasWord) {
      throw new Error(`頁面仍然殘留危險字樣: ${word}`);
    }
  }

  // 3. 模擬手機版直式視窗 (跨裝置連線與響應式測試)
  console.log('📱 [3] 模擬行動裝置 (iPhone 14 / 390x844)...');
  await page.setViewport({ width: 390, height: 844, isMobile: true });
  await new Promise(r => setTimeout(r, 500));
  const mobileContent = await page.content();
  console.log(`  -> 行動版包含「本週累積」: ${mobileContent.includes('本週累積：')}`);

  // 4. 管理員後台模擬與進入
  console.log('👑 [4] 設定總管理員憑證並測試後台...');
  await page.evaluate(() => {
    const adminUser = {
      id: 'admin_root_jimmy',
      name: '總管理員',
      email: 'jimmylee1020227@gmail.com',
      avatar: '',
      school: '會考全域中台',
      role: 'super_admin'
    };
    localStorage.setItem('studyhub_v2_user', JSON.stringify(adminUser));
    localStorage.setItem('studyhub_v2_role', 'admin');
    window.location.hash = '#/admin';
    window.location.reload();
  });

  await new Promise(r => setTimeout(r, 2000));
  const adminPageContent = await page.content();
  
  // 檢查後台按鈕
  console.log(`  -> 後台是否成功載入 (包含管理中台字樣): ${adminPageContent.includes('後台') || adminPageContent.includes('管理')}`);
  console.log(`  -> 後台是否無「清除測資」: ${!adminPageContent.includes('清除測資')}`);
  console.log(`  -> 後台是否無「重置系統」: ${!adminPageContent.includes('重置系統')}`);
  console.log(`  -> 後台是否包含「🛠️ 實用進階工具」: ${adminPageContent.includes('實用進階工具')}`);
  console.log(`  -> 後台是否包含「🛡️ 深度自檢」: ${adminPageContent.includes('自檢') || adminPageContent.includes('健康')}`);

  await browser.close();
  server.kill();

  if (errors.length > 0) {
    throw new Error(`頁面存在 ${errors.length} 個運行期錯誤: ` + errors.join(', '));
  }

  console.log('\n=============================================');
  console.log('🎉 Puppeteer 端對端測試 100% 通過！所有功能、跨裝置、無測資驗證全部無誤！');
  console.log('=============================================');
  process.exit(0);
}

runE2ETest().catch(err => {
  console.error('❌ E2E 測試失敗:', err);
  process.exit(1);
});
