import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error));

  await page.goto('http://localhost:5173');
  
  await page.evaluate(() => {
    const studentUser = {
      id: 'user_lin',
      email: 'student.lin@gmail.com',
      displayName: '建中前鋒‧林同學',
      role: 'student',
      isGoogleBound: true,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('studyhub_current_user', JSON.stringify(studentUser));
    localStorage.setItem('studyhub_auth_user', JSON.stringify(studentUser));
  });

  await page.reload();
  await page.waitForTimeout(1000);
  
  const hasPrivacyModal = await page.evaluate(() => !!document.querySelector('.glass-panel'));
  if (hasPrivacyModal) {
      await page.evaluate(() => {
          document.querySelector('input[type="checkbox"]').click();
          setTimeout(() => {
              document.querySelector('button.btn-primary').click();
          }, 100);
      });
      await page.waitForTimeout(1000);
  }

  const html = await page.evaluate(() => document.body.innerHTML);
  console.log('BODY HTML:', html.substring(0, 1000));
  
  await browser.close();
})();
