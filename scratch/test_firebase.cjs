const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  await page.goto('https://jimmylee1020227-bot.github.io/learn5/');
  await page.waitForTimeout(3000);
  
  // Try to write to Firebase via the exposed cloudBus or by triggering an action
  await page.evaluate(() => {
    // We can simulate saving game state by firing a local event or changing state if exposed
    // Or we can just click a button that triggers a save.
    // e.g. clicking the GlobalBroadcastBanner's close button if it writes? No.
    // Let's just create a custom event that `subscribeToCloudSync` might listen to? No.
    console.log('Test evaluate');
  });
  
  await browser.close();
})();
