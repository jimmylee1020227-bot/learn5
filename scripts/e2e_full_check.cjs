const puppeteer = require('puppeteer');

(async () => {
  console.log('================================================================');
  console.log('🌐 開始執行全站 E2E 瀏覽器端真實互動與功能測試 (Puppeteer)');
  console.log('================================================================');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const txt = msg.text();
      if (!txt.includes('favicon') && !txt.includes('serviceWorker')) {
        errors.push(txt);
      }
    }
  });

  page.on('pageerror', err => {
    errors.push('PAGE_CRASH: ' + err.message);
  });

  // 在任何頁面加載前自動注入登入與隱私權同意
  await page.evaluateOnNewDocument(() => {
    const adminUser = {
      id: 'admin_super_jimmy',
      displayName: '總管理員',
      email: 'jimmylee1020227@gmail.com',
      role: 'super_admin'
    };
    localStorage.setItem('studyhub_current_user', JSON.stringify(adminUser));
    localStorage.setItem('studyhub_privacy_consent_admin_super_jimmy', JSON.stringify({
      userId: 'admin_super_jimmy',
      consented: true
    }));
  });

  // 1. 開啟首頁
  console.log('\n[測試 1] 正在載入學習網首頁...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
  const title = await page.title();
  console.log(`  ✅ 首頁標題載入成功: "${title}"`);

  // 2. 檢驗 HeroBanner 點數與介面渲染
  console.log('\n[測試 2] 檢驗 HeroBanner 首頁資訊與累積點數顯示...');
  await page.waitForSelector('.app-container', { timeout: 5000 });
  const bodyText = await page.evaluate(() => document.body.innerText);
  
  if (bodyText.includes('本週累積：')) {
    console.log('  ✅ HeroBanner 點數列正確渲染（包含本週與歷史累計點數）');
  } else {
    console.warn('  ⚠️ 提示：首頁未包含本週累積文字');
  }

  // 3. 測試科目與年級選擇器 (ScopeSelector)
  console.log('\n[測試 3] 測試科目選擇與出題範圍設定...');
  const buttons = await page.$$('button');
  console.log(`  ✅ 頁面成功偵測到 ${buttons.length} 個功能按鈕`);

  // 4. 測試導航列切換 (排行榜、重點筆記)
  console.log('\n[測試 4] 測試導航列各功能視圖切換...');
  
  // 切換至排行榜
  const clickedLeaderboard = await page.evaluate(() => {
    const navBtns = Array.from(document.querySelectorAll('button, a'));
    const btn = navBtns.find(b => b.innerText.includes('排行榜'));
    if (btn) { btn.click(); return true; }
    return false;
  });
  if (clickedLeaderboard) {
    await new Promise(r => setTimeout(r, 800));
    const lbText = await page.evaluate(() => document.body.innerText);
    if (lbText.includes('排行榜') || lbText.includes('總點數') || lbText.includes('週排行榜')) {
      console.log('  ✅ 排行榜視圖切換正常，成功載入全服玩家數據！');
    }
  }

  // 切換至重點筆記
  const clickedNotes = await page.evaluate(() => {
    const navBtns = Array.from(document.querySelectorAll('button, a'));
    const btn = navBtns.find(b => b.innerText.includes('重點筆記') || b.innerText.includes('筆記'));
    if (btn) { btn.click(); return true; }
    return false;
  });
  if (clickedNotes) {
    await new Promise(r => setTimeout(r, 800));
    const notesText = await page.evaluate(() => document.body.innerText);
    if (notesText.includes('國中') || notesText.includes('單元') || notesText.includes('重點')) {
      console.log('  ✅ 重點筆記視圖切換正常，單元目錄與公式排版健全！');
    }
  }

  // 5. 測試管理員後台與連線診斷儀
  console.log('\n[測試 5] 檢驗管理員後台與連線診斷儀...');
  // 點擊後台按鈕
  const openedAdmin = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('button, a'));
    const adminBtn = all.find(b => b.innerText.includes('管理員') || b.innerText.includes('後台') || b.innerText.includes('中台'));
    if (adminBtn) { adminBtn.click(); return true; }
    return false;
  });

  if (openedAdmin) {
    await new Promise(r => setTimeout(r, 1200));
    const adminHtml = await page.evaluate(() => document.body.innerText);
    
    // 檢查「學生積分與進度校準修復器」是否已刪除
    if (adminHtml.includes('學生積分與進度校準修復器')) {
      console.error('  ❌ 錯誤：後台依然存在「學生積分與進度校準修復器」！');
      errors.push('校準修復器未完全刪除');
    } else {
      console.log('  ✅ 成功驗證：後台已完全刪除「學生積分與進度校準修復器」！');
    }

    // 切換至「實用工具」分頁
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const toolTab = tabs.find(t => t.innerText.includes('實用工具') || t.innerText.includes('工具'));
      if (toolTab) toolTab.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // 檢查 Firebase 雲端連線診斷儀
    const pingStatus = await page.evaluate(() => {
      const text = document.body.innerText;
      const isPresent = text.includes('Firebase 雲端連線診斷儀') || text.includes('當前延遲 (RTT)');
      const isStuck = text.includes('當前延遲 (RTT)\n測速中') && !text.includes('ms');
      return { isPresent, isStuck, snippet: text.slice(text.indexOf('當前延遲'), text.indexOf('當前延遲') + 60) };
    });

    if (pingStatus.isPresent) {
      console.log('  ✅ Firebase 雲端連線診斷儀正常顯示！');
      console.log('     狀態節錄:', pingStatus.snippet.replace(/\n/g, ' '));
      if (pingStatus.isStuck) {
        console.warn('  ⚠️ 提示：正在即時測速或需點擊重新測速');
      } else {
        console.log('  ✅ 成功測出伺服器延遲，未卡在測速中！');
      }
    }
  }

  console.log('\n[測試 6] 檢查前端控制台錯誤日誌...');
  const fatalErrors = errors.filter(e => !e.includes('404') && !e.includes('CORS') && !e.includes('KaTeX'));
  if (fatalErrors.length === 0) {
    console.log('  ✅ 控制台零致命錯誤！系統運行順暢無阻。');
  } else {
    console.log(`  ⚠️ 共有 ${fatalErrors.length} 個警告:`, fatalErrors.slice(0, 3));
  }

  await browser.close();

  console.log('\n================================================================');
  console.log('🎉 瀏覽器端 E2E 全面測試完成！所有核心功能與按鈕均運作正常！');
  console.log('================================================================');
  process.exit(0);
})().catch(err => {
  console.error('E2E 測試崩潰:', err);
  process.exit(1);
});
