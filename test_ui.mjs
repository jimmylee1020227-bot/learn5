import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(2000);
  
  console.log('Clicking to scroll down...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const startBtn = buttons.find(b => b.textContent.includes('開始自選題庫測驗'));
    if (startBtn) startBtn.click();
  });
  
  await page.waitForTimeout(1000);

  console.log('Clicking to generate quiz...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const genBtn = buttons.find(b => b.textContent.includes('線上測驗') && b.textContent.includes('開始'));
    if (genBtn) genBtn.click();
  });

  await page.waitForTimeout(2000);
  
  console.log('Trying to click first option...');
  const result = await page.evaluate(() => {
    const options = Array.from(document.querySelectorAll('div[role="button"]'));
    if (options.length > 0) {
      console.log('Found options:', options.length);
      options[0].click();
      return true;
    }
    return false;
  });
  
  console.log('Clicked?', result);
  await page.waitForTimeout(1000);
  
  const hasSelectedStyle = await page.evaluate(() => {
    const options = Array.from(document.querySelectorAll('div[role="button"]'));
    if (options.length === 0) return false;
    const style = window.getComputedStyle(options[0]);
    console.log('Option 0 border:', style.border);
    console.log('Option 0 background:', style.background);
    return style.borderColor.includes('239, 131, 84') || style.borderColor.includes('#ef8354');
  });
  
  console.log('Has selected style?', hasSelectedStyle);
  
  await browser.close();
})();
