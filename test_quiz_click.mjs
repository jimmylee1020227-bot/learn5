import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err));

  await page.addInitScript(() => {
    const user = {
      id: 'test-user-123',
      displayName: '測試同學',
      email: 'test@example.com',
      avatar: '🦊',
      role: 'student'
    };
    localStorage.setItem('studyhub_auth_user', JSON.stringify(user));
    localStorage.setItem('studyhub_active_user', JSON.stringify(user));
  });

  await page.goto('http://localhost:5173');
  await page.waitForTimeout(1000);

  // Click checkbox and agree
  const chk = page.locator('input[type="checkbox"]');
  if (await chk.isVisible()) {
    await chk.check();
    await page.waitForTimeout(300);
    await page.locator('button:has-text("同意條款")').click();
    await page.waitForTimeout(1000);
  }

  const btnsAfter = await page.evaluate(() => Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim()));
  console.log('Buttons after agree:', btnsAfter);

  // Start quiz
  const started = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('線上測驗'));
    if (btn) {
      console.log('Found start quiz button:', btn.textContent);
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Started quiz?', started);

  await page.waitForTimeout(1500);

  // Check quiz options
  const quizInfo = await page.evaluate(() => {
    const options = Array.from(document.querySelectorAll('div[role="button"]'));
    return {
      optionsLength: options.length,
      optionsText: options.map(o => o.innerText)
    };
  });
  console.log('Quiz info:', quizInfo);

  // Click option 0 via evaluate
  if (quizInfo.optionsLength > 0) {
    console.log('Clicking option 0 via evaluate...');
    await page.evaluate(() => {
      const options = Array.from(document.querySelectorAll('div[role="button"]'));
      options[0].click();
    });
    await page.waitForTimeout(500);

    const afterClick0 = await page.evaluate(() => {
      const options = Array.from(document.querySelectorAll('div[role="button"]'));
      return {
        selectedBadge: options.map(o => o.innerText.includes('已選中'))
      };
    });
    console.log('After click option 0:', afterClick0);

    // Click option 1 via locator click
    console.log('Now clicking option 1 via Playwright locator...');
    const locator1 = page.locator('div[role="button"]').nth(1);
    await locator1.click();
    await page.waitForTimeout(500);

    const afterClick1 = await page.evaluate(() => {
      const options = Array.from(document.querySelectorAll('div[role="button"]'));
      return {
        selectedBadge: options.map(o => o.innerText.includes('已選中'))
      };
    });
    console.log('After locator click option 1:', afterClick1);

    // Try clicking option text or span
    console.log('Now clicking option 2 text/span...');
    const span2 = page.locator('div[role="button"]').nth(2).locator('span');
    await span2.click();
    await page.waitForTimeout(500);

    const afterClick2 = await page.evaluate(() => {
      const options = Array.from(document.querySelectorAll('div[role="button"]'));
      return {
        selectedBadge: options.map(o => o.innerText.includes('已選中'))
      };
    });
    console.log('After clicking option 2 span:', afterClick2);
  }

  await browser.close();
})();
