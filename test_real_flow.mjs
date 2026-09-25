import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  const logs = [];
  page.on('console', msg => {
    const text = msg.text();
    logs.push(`[${msg.type()}] ${text}`);
    if (msg.type() === 'error' && !text.includes('Content Security Policy') && !text.includes('X-Frame-Options') && !text.includes('frame-ancestors')) {
      errors.push(text);
    }
  });
  page.on('pageerror', error => {
    errors.push('PAGE ERROR: ' + error.message);
    console.log('PAGE ERROR:', error.message);
  });

  await page.goto('http://localhost:5173');
  
  // 模擬真實 OAuth 回調流程：先設好 user (含 prefix)，模擬已登入的普通用戶
  await page.evaluate(() => {
    const PREFIX = 'studyhub_cloud_';
    const studentUser = {
      id: 'u_abc123def',
      email: 'student.test@gmail.com',
      displayName: '測試同學',
      role: 'student',
      isGoogleBound: true,
      createdAt: new Date().toISOString()
    };
    // 用跟 AuthContext 一樣的 key
    localStorage.setItem('studyhub_current_user', JSON.stringify(studentUser));
    localStorage.setItem('studyhub_auth_user', JSON.stringify(studentUser));
    
    // 第一次登入：不設 privacy consent，看會不會卡在 PrivacyPolicyModal
  });

  await page.reload();
  await page.waitForTimeout(3000);
  
  // 檢查是否渲染了 PrivacyPolicyModal
  const hasPrivacyModal = await page.evaluate(() => {
    const body = document.body.innerHTML;
    return body.includes('使用者條款與個人資料保護政策') || body.includes('PrivacyPolicy');
  });
  console.log('Has PrivacyPolicyModal:', hasPrivacyModal);
  
  const bodyHTML = await page.evaluate(() => document.body.innerHTML);
  const isEmpty = !bodyHTML || bodyHTML.trim() === '' || bodyHTML.trim() === '<div id="root"></div>';
  console.log('Is white screen:', isEmpty);
  console.log('Body length:', bodyHTML.length);
  
  // 檢查 root div 內容
  const rootContent = await page.evaluate(() => {
    const root = document.getElementById('root');
    return root ? root.innerHTML.substring(0, 500) : 'NO ROOT';
  });
  console.log('Root content (first 500):', rootContent);
  
  if (errors.length > 0) {
    console.log('\n=== NON-CSP ERRORS ===');
    errors.forEach(e => console.log(e));
  }
  
  // 如果有 modal，嘗試點接受
  if (hasPrivacyModal) {
    console.log('\nTrying to accept privacy policy...');
    // 先滾到底
    const scrollResult = await page.evaluate(() => {
      const scrollable = document.querySelector('[style*="overflowY"]') || document.querySelector('[style*="overflow-y"]');
      if (scrollable) {
        scrollable.scrollTop = scrollable.scrollHeight;
        return 'scrolled';
      }
      return 'no scrollable found';
    });
    console.log('Scroll result:', scrollResult);
    
    await page.waitForTimeout(500);
    
    // 找 checkbox
    const checkboxes = await page.$$('input[type="checkbox"]');
    console.log('Checkboxes found:', checkboxes.length);
    if (checkboxes.length > 0) {
      await checkboxes[0].click();
      await page.waitForTimeout(200);
    }
    
    // 找確認按鈕
    const buttons = await page.$$('button');
    const buttonTexts = await Promise.all(buttons.map(b => b.textContent()));
    console.log('Buttons:', buttonTexts.map(t => t.trim()).filter(t => t.length > 0 && t.length < 50));
    
    const confirmBtn = buttons.find(async (b) => {
      const text = await b.textContent();
      return text.includes('確認同意');
    });
  }
  
  await page.screenshot({ path: 'screenshot_real_flow.png' });
  await browser.close();
  console.log('\nDone.');
})();
