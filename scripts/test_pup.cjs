const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error' || text.includes('Error') || text.includes('error')) {
      errors.push(`[${msg.type()}] ${text}`);
    }
  });
  page.on('pageerror', error => {
    errors.push(`[PAGE_ERROR] ${error.message}\n${error.stack || ''}`);
  });

  // Step 1: Navigate
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2', timeout: 15000 });
  await new Promise(r => setTimeout(r, 2000));

  // Step 2: Inject super admin with valid proof
  await page.evaluate(() => {
    const user = {
      id: 'admin_super_jimmy',
      email: 'jimmylee1020227@gmail.com',
      displayName: '總管理員 (Jimmy)',
      role: 'super_admin',
      isGoogleBound: true,
      adminSessionProof: 'valid_debug_proof_' + Date.now(),
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('studyhub_current_user', JSON.stringify(user));
    localStorage.setItem('studyhub_auth_user', JSON.stringify(user));
    sessionStorage.setItem('__sh_sensitive__', JSON.stringify({ authProof: 'debug_proof' }));
  });

  // Step 3: Reload
  await page.reload({ waitUntil: 'networkidle2', timeout: 15000 });
  await new Promise(r => setTimeout(r, 3000));

  // Step 4: Click admin dashboard
  const navResult = await page.evaluate(() => {
    const allEls = document.querySelectorAll('button, a, [role="button"], span, div');
    for (const el of allEls) {
      const text = (el.textContent || '').trim();
      if ((text === '後台' || text === '管理中台' || text.includes('管理中台')) && (el.tagName === 'BUTTON' || el.tagName === 'A' || el.getAttribute('role') === 'button')) {
        el.click();
        return { clicked: true, text };
      }
    }
    return { clicked: false };
  });
  console.log('Nav result:', JSON.stringify(navResult, null, 2));

  await new Promise(r => setTimeout(r, 3000));

  // Check state
  const adminState = await page.evaluate(() => {
    const body = document.body.innerText;
    if (body.includes('管理員後台防護模式已啟動')) return 'ADMIN_ERROR_BOUNDARY';
    return body.substring(0, 500);
  });
  console.log('Admin state:', adminState);

  console.log('\n=== ALL ERRORS ===');
  errors.forEach(e => console.log(e));

  await browser.close();
})();
