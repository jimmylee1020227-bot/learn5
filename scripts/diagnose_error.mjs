import puppeteer from 'puppeteer';
import { spawn } from 'child_process';

async function diagnose() {
  const server = spawn('npx', ['vite', 'preview', '--port', '5196'], { stdio: 'pipe' });
  await new Promise(r => setTimeout(r, 2000));
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log('[BROWSER LOG]:', msg.type(), msg.text());
  });
  page.on('pageerror', err => {
    console.log('[BROWSER ERROR]:', err.stack || err.message);
  });

  await page.evaluateOnNewDocument(() => {
    const adminUser = {
      id: 'admin_root_jimmy',
      name: '總管理員',
      displayName: '總管理員',
      email: 'jimmylee1020227@gmail.com',
      school: '會考全域中台',
      role: 'super_admin'
    };
    localStorage.setItem('studyhub_current_user', JSON.stringify(adminUser));
    localStorage.setItem('studyhub_v2_user', JSON.stringify(adminUser));
  });

  await page.goto('http://localhost:5196/', { waitUntil: 'networkidle0' });

  console.log('👉 正在點擊管理員後台按鈕...');
  // 找出包含「站務管理」或「後台」的按鈕並點擊
  const clicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const adminBtn = buttons.find(b => b.innerText.includes('管理') || b.innerText.includes('後台'));
    if (adminBtn) {
      adminBtn.click();
      return true;
    }
    return false;
  });

  console.log('點擊結果:', clicked);
  await new Promise(r => setTimeout(r, 2000));

  const preText = await page.evaluate(() => {
    const pre = document.querySelector('pre');
    return pre ? pre.innerText : 'NO PRE ELEMENT';
  });

  console.log('--- PRE TEXT IN ERROR BOUNDARY ---');
  console.log(preText);
  console.log('----------------------------------');

  await browser.close();
  server.kill();
}

diagnose().catch(console.error);
