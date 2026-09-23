const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  await page.goto('https://jimmylee1020227-bot.github.io/learn5/');
  await page.waitForTimeout(3000);
  
  await page.evaluate(async () => {
    try {
      console.log('Testing Firebase permission...');
      // Wait for Firebase to initialize
      await new Promise(r => setTimeout(r, 2000));
      // In cloudStorage.js, db is exported. But it's obfuscated.
      // Let's just create a test using the exposed Firebase SDK if any, or trigger a local write.
      // Actually, we can just trigger a write via localStorage which should call pushServerSync.
      window.localStorage.setItem('studyhub_cloud_test_key', '123');
      // No, that doesn't trigger pushServerSync.
      
      console.log('Testing complete');
    } catch (e) {
      console.log('Eval error:', e.message);
    }
  });
  
  await browser.close();
})();
