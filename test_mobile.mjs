import { chromium, devices } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const iPhone = devices['iPhone 12'];
  const context = await browser.newContext({
    ...iPhone
  });
  const page = await context.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error));

  await page.goto('http://localhost:5173');
  
  await page.evaluate(() => {
    const studentUser = {
      id: 'user_lin',
      email: 'student.lin@gmail.com',
      displayName: '林同學',
      role: 'student',
      isGoogleBound: true
    };
    localStorage.setItem('studyhub_current_user', JSON.stringify(studentUser));
    localStorage.setItem('studyhub_auth_user', JSON.stringify(studentUser));
    localStorage.setItem('privacy_consent_user_lin', JSON.stringify({
      userId: 'user_lin',
      consented: true,
      version: '1.0.0'
    }));
  });

  await page.reload();
  await page.waitForTimeout(3000); // Wait for render
  
  const html = await page.evaluate(() => document.body.innerHTML);
  if (!html || html.trim() === '' || html.includes('div id="root"></div>')) {
      console.log('WHITE SCREEN DETECTED!');
  } else {
      console.log('App rendered something, length:', html.length);
  }
  
  await browser.close();
})();
