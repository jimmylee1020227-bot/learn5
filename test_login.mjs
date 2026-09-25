import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error));

  await page.goto('http://localhost:5173');
  
  // Login as student
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
  await page.waitForTimeout(2000);
  
  // Check if there is privacy modal
  const hasPrivacyModal = await page.evaluate(() => !!document.querySelector('.glass-panel'));
  console.log('Has privacy modal:', hasPrivacyModal);

  // If there is, accept it
  if (hasPrivacyModal) {
      await page.evaluate(() => {
          document.querySelector('input[type="checkbox"]').click();
          setTimeout(() => {
              document.querySelector('button.btn-primary').click();
          }, 100);
      });
      await page.waitForTimeout(1000);
  }

  await page.screenshot({ path: 'screenshot_student_login.png' });
  await browser.close();
})();
