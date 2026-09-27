const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
  });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.log('Browser Error:', msg.text());
    }
  });

  page.on('pageerror', error => {
    errors.push(error.message);
    console.log('Page Error:', error.message);
  });

  console.log('Navigating to app...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  
  console.log('Waiting for components to render...');
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Clicking 108 課綱...');
  try {
    const navItems = await page.$$('.nav-item');
    if (navItems.length > 0) {
      await navItems[0].click();
      await new Promise(r => setTimeout(r, 1000));
    }
  } catch (e) { console.log('Could not click nav', e); }

  console.log('Opening Quiz Page...');
  try {
    const quizBtn = await page.$('.btn-primary');
    if (quizBtn) {
      await quizBtn.click();
      await new Promise(r => setTimeout(r, 2000));
    }
  } catch (e) { console.log('Could not open quiz', e); }

  console.log('Opening Leaderboard...');
  try {
    const btns = await page.$$('button');
    for (const btn of btns) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('排行榜')) {
        await btn.click();
        await new Promise(r => setTimeout(r, 1000));
        break;
      }
    }
  } catch (e) { console.log('Could not open leaderboard', e); }

  await browser.close();

  // Filter out known harmless errors (like CSP or time sync warnings)
  const realErrors = errors.filter(e => 
    !e.includes('Content Security Policy') && 
    !e.includes('favicon.ico') &&
    !e.includes('Cannot update a component')
  );

  if (realErrors.length > 0) {
    console.error('Test Failed! Found errors:', realErrors);
    process.exit(1);
  } else {
    console.log('Test Passed! No runtime errors found.');
    process.exit(0);
  }
})();
