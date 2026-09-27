// 測試 cloudStorage.js 所有關鍵功能與資料同步
import {
  getJson,
  setJson,
  recordPracticeBatch,
  getUserPracticeHistory,
  getMistakeNotebook,
  updateMistakeRecord,
  getUnresolvedErrorConcepts,
  submitQuestionReport,
  submitSiteReport,
  getQuestionOverrides,
  modifyQuestion,
  checkNicknameAvailable,
  getRegisteredStudents
} from '../src/services/cloudStorage.js';

console.log('=== 開始雲端儲存與資料同步功能測試 ===\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`✅ [PASS] ${message}`);
  } else {
    failed++;
    console.error(`❌ [FAIL] ${message}`);
  }
}

async function runTests() {
  try {
    // 1. 測試基本 getJson / setJson
    setJson('test_key', { foo: 'bar' });
    const val = getJson('test_key', null);
    assert(val && val.foo === 'bar', 'getJson / setJson 基本讀寫正常');

    // 2. 測試動態 key 陣列保護 (practice_history_*, mistake_notebook_*)
    setJson('practice_history_test_user', { '0': { id: 'p1' }, '1': { id: 'p2' } });
    const pHistory = getJson('practice_history_test_user', []);
    assert(Array.isArray(pHistory) && pHistory.length === 2, '動態 key 物件自動轉換為陣列');

    // 3. 測試 錯題本讀取安全
    setJson('mistake_notebook_test_user', { '0': { questionId: 'q1', mistakeCount: 1 } });
    const notebook = getMistakeNotebook('test_user');
    assert(Array.isArray(notebook) && notebook.length === 1, 'getMistakeNotebook 防呆轉換正常');

    // 4. 測試 題目覆寫功能
    const dummyAdmin = { id: 'admin1', displayName: '管理員', role: 'super_admin' };
    modifyQuestion('q_test_1', { isDeleted: true, reason: 'test delete' }, dummyAdmin);
    const overrides = getQuestionOverrides();
    assert(overrides['q_test_1']?.isDeleted === true, 'modifyQuestion / getQuestionOverrides 正常');

    // 5. 測試 題目作答批次儲存 (recordPracticeBatch)
    const testResults = [
      { id: 'q_batch_1', question: '測試題1', answer: 0, userChoice: 0, isCorrect: true, subjectId: 'math', gradeId: 'g7' },
      { id: 'q_batch_2', question: '測試題2', answer: 1, userChoice: 2, isCorrect: false, subjectId: 'math', gradeId: 'g7' }
    ];
    recordPracticeBatch({
      userId: 'test_user_batch',
      userName: '測試學生',
      userSchool: '測試學校',
      userEmail: 'test@example.com',
      results: testResults,
      timeSpentSec: 45
    });

    const userHist = getUserPracticeHistory('test_user_batch');
    assert(Array.isArray(userHist) && userHist.length >= 1, 'recordPracticeBatch 儲存做題歷史成功');

    const userMistakes = getMistakeNotebook('test_user_batch');
    assert(Array.isArray(userMistakes) && userMistakes.length >= 1, 'recordPracticeBatch 正確錄入錯題本');

    // 6. 測試 疑義回報
    const repRes = submitQuestionReport({
      questionId: 'q_report_1',
      questionText: '題目有錯',
      issueType: 'typo',
      comment: '錯字'
    });
    assert(Boolean(repRes?.id), 'submitQuestionReport 回報成功');

    // 7. 測試 網站回報
    const siteRepRes = submitSiteReport({
      category: 'bug',
      title: '網站排版異常',
      content: '測試內容'
    });
    assert(Boolean(siteRepRes?.id), 'submitSiteReport 成功');

    console.log(`\n=== 測試結算 ===`);
    console.log(`通過: ${passed}, 失敗: ${failed}`);
    if (failed === 0) {
      console.log('🎉 所有雲端同步與存儲 API 測試全數通過！');
    }
  } catch (err) {
    console.error('測試過程中發生未捕獲異常:', err);
    process.exit(1);
  }
}

runTests();
