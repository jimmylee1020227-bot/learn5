import { chromium } from 'playwright';

async function checkAdmin() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const logs = [];
  page.on('console', msg => logs.push(`[Console ${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => logs.push(`[Page Error] ${err.message}`));

  console.log('正在導航至 http://localhost:5175 ...');
  await page.goto('http://localhost:5175', { waitUntil: 'networkidle' });

  // 檢查標題
  const title = await page.title();
  console.log('頁面標題:', title);

  // 以總管理員身分設定 localStorage 並重整
  await page.evaluate(() => {
    const adminUser = {
      id: 'admin_super_jimmy',
      name: '總管理員',
      email: 'jimmylee1020227@gmail.com',
      role: 'super_admin',
      displayName: '總管理員',
      school: '會考戰友'
    };
    localStorage.setItem('studyhub_current_user', JSON.stringify(adminUser));
    localStorage.setItem('studyhub_google_auth_token', 'mock_admin_token');
  });

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(3000); // 等待 Firebase 連線與資料拉取

  // 檢查頭像圖片是否載入失敗
  const brokenImages = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    return imgs.map(img => ({
      src: img.src,
      alt: img.alt,
      naturalWidth: img.naturalWidth,
      complete: img.complete,
      broken: img.complete && img.naturalWidth === 0
    }));
  });
  console.log('圖片載入狀態:', brokenImages);

  // 尋找管理員按鈕並點擊進入後台
  const adminBtn = await page.locator('text=管理中台').first();
  if (await adminBtn.isVisible()) {
    console.log('找到【管理中台】按鈕，點擊進入...');
    await adminBtn.click();
    await page.waitForTimeout(3000);

    // 尋找並點擊「學生名冊與學況調閱」子分頁
    const studentTabBtn = await page.locator('text=學生名冊與學況調閱').first();
    if (await studentTabBtn.isVisible()) {
      console.log('點擊【學生名冊與學況調閱】標籤...');
      await studentTabBtn.click();
      await page.waitForTimeout(3000);
    }

    // 檢查後台學生人數與試卷人數
    const pageText = await page.locator('body').innerText();
    const studentsMatch = pageText.match(/學生名冊與學況調閱\s*\((\d+)\)/);
    const papersMatch = pageText.match(/歷次完整試卷\s*\((\d+)\s*份\)/);
    const registeredMatch = pageText.match(/註冊\/活躍學生：(\d+)\s*位/);

    console.log('後台顯示 學生名冊標籤:', studentsMatch ? studentsMatch[0] : '未找到');
    console.log('後台顯示 註冊/活躍學生:', registeredMatch ? registeredMatch[0] : '未找到');
    console.log('後台顯示 歷次完整試卷:', papersMatch ? papersMatch[0] : '未找到');

    // 檢查快篩按鈕裡面有多少個學生
    const studentChips = await page.locator('button:has-text("錯")').count();
    console.log('學生快篩按鈕數量:', studentChips);

    // 檢查歷次試卷列表項目數
    const paperCards = await page.locator('text=實戰評量卷').count();
    console.log('畫面上實戰評量卷卡片數量:', paperCards);

    // 檢查是否有任何錯誤文字
    const errorText = await page.locator('text=遺失').count();
    console.log('畫面上「遺失」字樣數量:', errorText);

    // 擷取截圖
    await page.screenshot({ path: 'scripts/admin_screenshot.png', fullPage: true });
    console.log('已儲存後台截圖至 scripts/admin_screenshot.png');
  } else {
    console.log('未找到進入管理員後台按鈕！當前文字:', (await page.locator('body').innerText()).slice(0, 300));
  }

  console.log('\n瀏覽器控制台日誌:');
  logs.slice(-20).forEach(l => console.log(l));

  await browser.close();
}

checkAdmin().catch(console.error);
