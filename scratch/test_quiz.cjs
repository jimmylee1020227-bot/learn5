const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(3000);
  
  // Click login
  const loginBtns = await page.$$('text="管理員 / 學生登入"');
  if (loginBtns.length > 0) {
    await loginBtns[0].click();
    await page.waitForTimeout(2000);
    // login as admin
    const adminLogin = await page.$('text="Jimmy Lee"');
    if (adminLogin) await adminLogin.click();
    await page.waitForTimeout(2000);
  }
  
  // click start test
  const startBtn = await page.$('text="開始模擬考"');
  if (startBtn) {
    await startBtn.click();
    await page.waitForTimeout(2000);
    // select subject
    const subjectBtn = await page.$('text="自然科"');
    if (subjectBtn) await subjectBtn.click();
    await page.waitForTimeout(1000);
    const startNow = await page.$('text="🚀 開始測驗"');
    if (startNow) await startNow.click();
    await page.waitForTimeout(2000);
    
    // click option A
    const optionA = await page.$('text="A"');
    if (optionA) {
      await optionA.click();
      console.log('Clicked option A');
    } else {
      console.log('Option A not found');
    }
  } else {
    console.log('Start btn not found');
  }
  
  await browser.close();
})();
