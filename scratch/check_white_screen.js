import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Check for any errors BEFORE goto
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));
  
  // Navigate to deployed site
  await page.goto('https://jimmylee1020227-bot.github.io/learn5/', {waitUntil: 'networkidle0'});
  
  // Wait a bit
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
  process.exit(0);
})();
