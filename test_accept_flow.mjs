import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('Content Security Policy') && !msg.text().includes('X-Frame-Options') && !msg.text().includes('frame-ancestors')) {
      errors.push(msg.text());
    }
  });
  page.on('pageerror', error => {
    errors.push('PAGE ERROR: ' + error.message);
    console.log('PAGE ERROR:', error.message);
  });

  await page.goto('http://localhost:5173');
  
  // 設定已登入的普通用戶 (沒有 privacy consent)
  await page.evaluate(() => {
    const studentUser = {
      id: 'u_abc123def',
      email: 'student.test@gmail.com',
      displayName: '測試同學',
      role: 'student',
      isGoogleBound: true,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('studyhub_current_user', JSON.stringify(studentUser));
    localStorage.setItem('studyhub_auth_user', JSON.stringify(studentUser));
  });

  await page.reload();
  await page.waitForTimeout(2000);
  
  console.log('Step 1: Privacy modal should be showing');
  const hasModal = await page.evaluate(() => document.body.innerHTML.includes('使用者條款與個人資料保護政策'));
  console.log('  Has modal:', hasModal);
  
  // 滾到底部
  await page.evaluate(() => {
    const els = document.querySelectorAll('div');
    for (const el of els) {
      if (el.scrollHeight > el.clientHeight + 50 && el.style.overflowY === 'auto') {
        el.scrollTop = el.scrollHeight;
        return;
      }
    }
  });
  await page.waitForTimeout(500);
  
  // 勾選 checkbox
  const checkbox = await page.$('input[type="checkbox"]');
  if (checkbox) {
    await checkbox.click();
    console.log('Step 2: Checkbox clicked');
  } else {
    console.log('Step 2: NO CHECKBOX FOUND');
  }
  await page.waitForTimeout(300);
  
  // 點擊同意按鈕
  const buttons = await page.$$('button');
  let clicked = false;
  for (const btn of buttons) {
    const text = await btn.textContent();
    if (text.includes('同意條款')) {
      await btn.click();
      clicked = true;
      console.log('Step 3: Accept button clicked');
      break;
    }
  }
  if (!clicked) console.log('Step 3: Accept button NOT found');
  
  await page.waitForTimeout(3000);
  
  // 檢查點擊後的狀態
  const bodyAfter = await page.evaluate(() => document.body.innerHTML);
  const isWhite = !bodyAfter || bodyAfter.trim() === '' || bodyAfter.includes('id="root"></div>');
  console.log('\nStep 4: After accepting privacy:');
  console.log('  Is white screen:', isWhite);
  console.log('  Body length:', bodyAfter.length);
  console.log('  Still has modal:', bodyAfter.includes('使用者條款與個人資料保護政策'));
  console.log('  Has navbar:', bodyAfter.includes('navbar') || bodyAfter.includes('Navbar'));
  console.log('  Has hero:', bodyAfter.includes('把努力'));
  console.log('  Has scope selector:', bodyAfter.includes('scope-selector'));
  
  // 檢查 localStorage 中 privacy consent 是否正確保存
  const consentData = await page.evaluate(() => {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.includes('privacy') || key.includes('consent')) {
        keys.push({ key, value: localStorage.getItem(key) });
      }
    }
    return keys;
  });
  console.log('\nPrivacy-related localStorage:', JSON.stringify(consentData, null, 2));

  if (errors.length > 0) {
    console.log('\n=== ERRORS ===');
    errors.forEach(e => console.log(e));
  }
  
  await page.screenshot({ path: 'screenshot_after_accept.png' });
  await browser.close();
})();
