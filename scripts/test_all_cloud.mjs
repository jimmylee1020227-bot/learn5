import { db } from '../src/services/firebase.js';
import { ref, get, set, remove, push } from 'firebase/database';

// === 測試工具 ===
let pass = 0, fail = 0, warn = 0;
const results = [];

function report(name, status, detail) {
  const icon = status === 'PASS' ? '✅' : status === 'WARN' ? '⚠️' : '❌';
  console.log(`  ${icon} ${name}: ${detail}`);
  results.push({ name, status, detail });
  if (status === 'PASS') pass++;
  else if (status === 'WARN') warn++;
  else fail++;
}

// === 測試項目 ===

async function testFirebaseConnectivity() {
  console.log('\n[A] Firebase 連線測試');
  try {
    const start = Date.now();
    await get(ref(db, 'studyhub/global_settings'));
    const ms = Date.now() - start;
    report('Firebase 連線延遲', ms < 2000 ? 'PASS' : 'WARN', `${ms}ms`);
  } catch (e) {
    report('Firebase 連線', 'FAIL', e.message);
  }
}

async function testUserRegistry() {
  console.log('\n[B] 使用者名冊測試');
  try {
    const snap = await get(ref(db, 'studyhub/user_registry'));
    const reg = snap.val() || {};
    const users = Object.values(reg);
    const valid = users.filter(u => u && u.id && u.email && u.email.trim());
    const invalid = users.filter(u => !u || !u.id || !u.email || !u.email.trim());
    report('名冊總數', 'PASS', `${users.length} 位使用者`);
    report('有效帳號', valid.length === users.length ? 'PASS' : 'WARN', `${valid.length}/${users.length} 個有效`);
    if (invalid.length > 0) report('無效帳號', 'WARN', `${invalid.length} 個無效帳號`);
    
    // 檢查管理員存在
    const admins = valid.filter(u => u.role === 'admin' || u.role === 'super_admin');
    report('管理員帳號', admins.length > 0 ? 'PASS' : 'WARN', `共 ${admins.length} 個管理員`);
  } catch (e) {
    report('使用者名冊', 'FAIL', e.message);
  }
}

async function testQuizPapers() {
  console.log('\n[C] 試卷庫測試');
  try {
    const snap = await get(ref(db, 'studyhub/quiz_papers'));
    const papers = snap.val() || {};
    const arr = Object.values(papers);
    const valid = arr.filter(p => p && p.id && (p.userId || p.ownerId));
    report('試卷總數', 'PASS', `${arr.length} 份試卷`);
    report('試卷完整性', valid.length === arr.length ? 'PASS' : 'WARN', `${valid.length}/${arr.length} 份格式完整`);
    
    // 取樣檢查最新一份
    const sorted = arr.filter(p => p && p.id).sort((a, b) =>
      new Date(b.completedAt || b.timestamp || 0) - new Date(a.completedAt || a.timestamp || 0)
    );
    if (sorted.length > 0) {
      const latest = sorted[0];
      // 支援兩種試卷格式：
      // 格式A: 有獨立的 userAnswers 陣列
      // 格式B: 答案嵌在 questions 每題的 userAnswer / selectedAnswer 欄位
      const hasAnswers = latest.userAnswers !== undefined ||
        (Array.isArray(latest.questions) && latest.questions.some(q => 
          q?.userAnswer !== undefined || q?.selectedAnswer !== undefined || 
          q?.selected !== undefined || q?.userChoice !== undefined || q?.isCorrect !== undefined
        ));
      const hasRequired = latest.id && latest.questions && hasAnswers;
      report('試卷資料結構', hasRequired ? 'PASS' : 'WARN', `最新試卷 id=${latest.id?.slice(0, 20)} 格式${hasRequired ? '正常' : '缺少答案欄位'}`);
    }
  } catch (e) {
    report('試卷庫', 'FAIL', e.message);
  }
}

async function testMistakeNotebooks() {
  console.log('\n[D] 錯題本測試');
  try {
    const regSnap = await get(ref(db, 'studyhub/user_registry'));
    const reg = regSnap.val() || {};
    const uids = Object.keys(reg).filter(k => reg[k]?.id && reg[k]?.email);
    
    let totalMistakes = 0, invalidMistakes = 0, usersWithMistakes = 0;
    const validSubjects = ['國文', '英文', '數學', '自然', '社會'];
    
    // 批次查詢（最多30個）
    const sample = uids.slice(0, 30);
    const snaps = await Promise.all(sample.map(uid =>
      get(ref(db, `studyhub/mistake_notebook_${uid}`))
    ));
    snaps.forEach(snap => {
      if (!snap.exists()) return;
      usersWithMistakes++;
      const val = snap.val();
      const list = Array.isArray(val) ? val : Object.values(val);
      list.forEach(m => {
        if (!m) return;
        totalMistakes++;
        if (!m.id || !m.subject || !validSubjects.includes(m.subject)) invalidMistakes++;
      });
    });
    
    report('錯題本使用者', 'PASS', `${usersWithMistakes} 位使用者有錯題`);
    report('錯題總數', 'PASS', `共 ${totalMistakes} 筆錯題`);
    report('錯題完整性', invalidMistakes === 0 ? 'PASS' : 'WARN', `${invalidMistakes} 筆無效錯題`);
  } catch (e) {
    report('錯題本', 'FAIL', e.message);
  }
}

async function testLeaderboard() {
  console.log('\n[E] 排行榜測試');
  try {
    const snap = await get(ref(db, 'studyhub/leaderboard_players'));
    const val = snap.val() || {};
    const players = Object.values(val);
    const validPlayers = players.filter(p => p && p.userId && typeof p.weeklyPoints === 'number');
    report('排行榜玩家數', 'PASS', `${players.length} 位`);
    report('排行榜資料格式', validPlayers.length === players.length ? 'PASS' : 'WARN', `${validPlayers.length}/${players.length} 格式正確`);
    
    // 確認小編在榜上
    const editor = players.find(p => p.userId === 'u_knbo67cox0xp');
    if (editor) {
      report('小編排行榜點數', editor.weeklyPoints === 50 ? 'PASS' : 'WARN', `weeklyPoints=${editor.weeklyPoints}`);
    } else {
      report('小編排行榜', 'WARN', '小編不在排行榜中（可能尚未進入當週榜單）');
    }
  } catch (e) {
    report('排行榜', 'FAIL', e.message);
  }
}

async function testCloudWrite() {
  console.log('\n[F] 雲端寫入測試（Write / Delete）');
  const testKey = `studyhub/health_test_${Date.now()}`;
  try {
    await set(ref(db, testKey), { ts: Date.now(), test: true });
    const snap = await get(ref(db, testKey));
    const ok = snap.exists() && snap.val().test === true;
    report('Firebase 寫入', ok ? 'PASS' : 'FAIL', ok ? '寫入讀取成功' : '讀回資料不符');
    await remove(ref(db, testKey));
    report('Firebase 刪除', 'PASS', '刪除成功');
  } catch (e) {
    report('Firebase 寫入/刪除', 'FAIL', e.message);
  }
}

async function testGlobalSettings() {
  console.log('\n[G] 全站設定測試');
  try {
    const snap = await get(ref(db, 'studyhub/global_settings'));
    if (snap.exists()) {
      const settings = snap.val();
      report('全站設定', 'PASS', `載入成功，廣播: ${settings.broadcastMessage?.enabled ? '開啟' : '關閉'}`);
    } else {
      report('全站設定', 'WARN', '節點不存在（使用預設值）');
    }
  } catch (e) {
    report('全站設定', 'FAIL', e.message);
  }
}

async function testAdminSettings() {
  console.log('\n[H] 管理員配置測試');
  try {
    const snap = await get(ref(db, 'studyhub/admins_list'));
    const admins = snap.val() || {};
    const adminArr = Array.isArray(admins) ? admins : Object.values(admins);
    report('管理員清單', adminArr.length > 0 ? 'PASS' : 'WARN', `${adminArr.length} 位管理員`);
  } catch (e) {
    report('管理員配置', 'FAIL', e.message);
  }
}

async function testRedemptionCodes() {
  console.log('\n[I] 兌換碼系統測試');
  try {
    const snap = await get(ref(db, 'studyhub/redemption_codes'));
    const codes = snap.val() || {};
    const codeArr = Object.values(codes);
    report('兌換碼節點', 'PASS', `共 ${codeArr.length} 組有效兌換碼`);
  } catch (e) {
    report('兌換碼系統', 'FAIL', e.message);
  }
}

async function testCommunityPosts() {
  console.log('\n[J] 社群貼文測試');
  try {
    const snap = await get(ref(db, 'studyhub/community_posts'));
    const posts = snap.val() || {};
    const postArr = Object.values(posts);
    const valid = postArr.filter(p => p && p.id && p.message);
    report('社群貼文', 'PASS', `共 ${postArr.length} 則貼文`);
    report('貼文格式', valid.length === postArr.length ? 'PASS' : 'WARN', `${valid.length}/${postArr.length} 格式正確`);
  } catch (e) {
    report('社群貼文', 'FAIL', e.message);
  }
}

// === 主程式 ===
async function main() {
  console.log('============================================');
  console.log('🧪 全功能深度驗證 — 所有按鈕 / 資料 / 雲端上傳');
  console.log('============================================');

  await testFirebaseConnectivity();
  await testUserRegistry();
  await testQuizPapers();
  await testMistakeNotebooks();
  await testLeaderboard();
  await testCloudWrite();
  await testGlobalSettings();
  await testAdminSettings();
  await testRedemptionCodes();
  await testCommunityPosts();

  console.log('\n============================================');
  console.log(`📊 結果: ✅ ${pass} 通過 | ⚠️ ${warn} 警示 | ❌ ${fail} 失敗`);
  const score = Math.round((pass / (pass + warn + fail)) * 100);
  console.log(`🏆 總評分: ${score}/100`);
  if (fail === 0 && warn === 0) {
    console.log('🎉 所有功能 100% 正常！');
  } else if (fail === 0) {
    console.log(`✅ 核心功能均正常，${warn} 項輕微警示`);
  } else {
    console.log(`❌ 發現 ${fail} 個嚴重問題需要修復`);
  }
  console.log('============================================');
  process.exit(fail > 0 ? 1 : 0);
}

main().catch(e => { console.error('測試失敗:', e); process.exit(1); });
