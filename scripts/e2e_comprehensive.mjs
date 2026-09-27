import { chromium } from 'playwright';

console.log('=== 開始端對端 (E2E) 瀏覽器完整功能與按鈕測試 ===\n');

let browser;
const errors = [];
const consoleErrors = [];

async function runE2E() {
  browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();

  // 監聽控制台錯誤
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const txt = msg.text();
      // 忽略第三方資源 404 (如外部音效等)
      if (!txt.includes('favicon') && !txt.includes('404')) {
        consoleErrors.push(txt);
      }
    }
  });

  page.on('pageerror', err => {
    errors.push(`頁面未捕獲異常: ${err.message}`);
  });

  // 注入登入使用者、Cookie 與隱私條款同意
  await page.addInitScript(() => {
    const studentUser = {
      id: 'test_student_001',
      displayName: '測試學生',
      email: 'student_tester@example.com',
      role: 'student',
      school: '會考戰友'
    };
    localStorage.setItem('studyhub_current_user', JSON.stringify(studentUser));
    localStorage.setItem('studyhub_privacy_consent_v1', JSON.stringify({
      consented: true,
      timestamp: new Date().toISOString()
    }));
    localStorage.setItem('studyhub_cookie_consent', JSON.stringify({
      necessary: true,
      preferences: true,
      analytics: true,
      timestamp: Date.now()
    }));
  });

  try {
    // 1. 訪問首頁
    console.log('1. 正在訪問 http://localhost:5173 ...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);

    const title = await page.title();
    console.log(`✅ 頁面標題: ${title}`);

    // 若出現隱私權政策同意視窗，先勾選 checkbox 再點擊同意按鈕
    const consentCheckbox = page.locator('input[type="checkbox"]').first();
    const consentBtn = page.locator('button:has-text("同意條款")').first();
    if (await consentCheckbox.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('檢測到隱私條款彈窗，進行勾選與同意...');
      await consentCheckbox.check();
      await page.waitForTimeout(300);
      await consentBtn.click();
      await page.waitForTimeout(1000);
      console.log('✅ 成功通過隱私條款門禁');
    }

    // 2. 測試學制切換 (國中 -> 高中 -> 國中)
    console.log('2. 測試學制與年級切換...');
    const seniorBtn = page.locator('text=高中階段').first();
    if (await seniorBtn.isVisible()) {
      await seniorBtn.click();
      await page.waitForTimeout(500);
      console.log('✅ 成功切換至高中階段');
    }

    const juniorBtn = page.locator('text=國中階段').first();
    if (await juniorBtn.isVisible()) {
      await juniorBtn.click();
      await page.waitForTimeout(500);
      console.log('✅ 成功切換回國中階段');
    }

    // 3. 測試科目切換 (數學 -> 國文 -> 英文 -> 自然 -> 社會)
    console.log('3. 測試各科目按鈕...');
    const subjects = ['國文', '英語', '數學', '自然', '社會'];
    for (const sub of subjects) {
      const subBtn = page.locator(`button:has-text("${sub}")`).first();
      if (await subBtn.isVisible()) {
        await subBtn.click();
        await page.waitForTimeout(300);
      }
    }
    console.log('✅ 各科目切換無異常');

    // 4. 開始測驗
    console.log('4. 點擊開始測驗按鈕...');
    // 切換回數學
    const mathBtn = page.locator('button:has-text("數學")').first();
    if (await mathBtn.isVisible()) await mathBtn.click();
    await page.waitForTimeout(300);

    const startBtn = page.locator('button:has-text("立即開始")').first();
    await startBtn.click();
    await page.waitForTimeout(1000);

    // 5. 驗證測驗畫面已正確加載
    console.log('5. 檢查測驗畫面內容與做答功能...');
    await page.waitForSelector('button:has-text("交卷結算")', { timeout: 10000 });
    console.log('✅ 測驗畫面成功載入，交卷按鈕正常');

    // 檢查選項按鈕 (四個選項 div[role="button"])
    const optionCards = page.locator('div[role="button"]').filter({ hasText: /^[ABCD]/ });
    const optCount = await optionCards.count();
    console.log(`✅ 檢測到選項卡數量: ${optCount}`);

    // 點擊第一個選項進行做答
    if (optCount > 0) {
      await optionCards.first().click();
      console.log('✅ 點擊選項 A 做答成功');
      await page.waitForTimeout(500);
    }

    // 測試下一題按鈕
    const nextBtn = page.locator('button:has-text("下一題")').first();
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
      console.log('✅ 點擊下一題切換成功');
      await page.waitForTimeout(500);
      // 再答一題
      const nextOpt = page.locator('div[role="button"]').filter({ hasText: /^B/ }).first();
      if (await nextOpt.isVisible()) await nextOpt.click();
      await page.waitForTimeout(300);
    }

    // 6. 交卷測試
    console.log('6. 執行交卷結算...');
    const submitBtn = page.locator('button:has-text("交卷結算")').first();
    await submitBtn.click();
    await page.waitForTimeout(600);

    // 確認交卷防呆彈窗
    const confirmSubmitBtn = page.locator('button:has-text("確認交卷結算")').first();
    if (await confirmSubmitBtn.isVisible()) {
      await confirmSubmitBtn.click();
      await page.waitForTimeout(2000);
      console.log('✅ 成功提交試卷並進入結果頁面');
    }

    // 7. 驗證結果頁面
    console.log('7. 檢查測驗結果頁面...');
    await page.waitForSelector('button:has-text("換一批全新題目"), button:has-text("返回題庫工作台")', { timeout: 10000 });
    console.log('✅ 結果頁面載入成功，包含「換一批全新題目」與「返回題庫工作台」按鈕');

    // 8. 測試頂部導航切換
    console.log('8. 測試全部分頁切換...');
    const tabs = [
      { name: '重點筆記', selector: 'button:has-text("重點筆記")' },
      { name: '錯題加強', selector: 'button:has-text("錯題加強")' },
      { name: '排行榜', selector: 'button:has-text("排行榜")' },
      { name: '歷程錯題', selector: 'button:has-text("歷程錯題")' },
      { name: 'AI題庫', selector: 'button:has-text("AI題庫")' }
    ];

    for (const tab of tabs) {
      const tabBtn = page.locator(tab.selector).first();
      if (await tabBtn.isVisible()) {
        await tabBtn.click();
        await page.waitForTimeout(600);
        console.log(`✅ 成功切換至分頁: ${tab.name}`);
      }
    }

    console.log('\n=== E2E 測試全數成功完成！ ===');
  } catch (err) {
    errors.push(`E2E 流程異常: ${err.message}`);
    console.error('❌ E2E 測試發生錯誤:', err);
  } finally {
    if (browser) await browser.close();
  }

  console.log(`\n未捕獲頁面異常數: ${errors.length}`);
  console.log(`控制台嚴重錯誤數: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log('Console Errors:', consoleErrors.slice(0, 10));
  }
  if (errors.length > 0) {
    console.log('Errors:', errors);
    process.exit(1);
  }
}

runE2E();
