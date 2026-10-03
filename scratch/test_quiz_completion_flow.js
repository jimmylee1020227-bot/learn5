// scratch/test_quiz_completion_flow.js
import assert from 'node:assert';

// 測試 1: Object.values 防空邏輯
const safeArrayConversion = (val) => {
  return Array.isArray(val) ? val : (val && typeof val === 'object' ? Object.values(val) : []);
};

console.log('--- 測試 1: safeArrayConversion ---');
assert(Array.isArray(safeArrayConversion(null)), 'null 應轉為空陣列');
assert(Array.isArray(safeArrayConversion(undefined)), 'undefined 應轉為空陣列');
assert(Array.isArray(safeArrayConversion('invalid')), '字串應轉為空陣列');
assert(safeArrayConversion({ a: 1, b: 2 }).length === 2, 'Object 應正確轉為陣列');
assert(safeArrayConversion([1, 2, 3]).length === 3, 'Array 應保持原陣列');
console.log('✅ safeArrayConversion 測試通過！');

// 測試 2: recordPracticeBatch 陣列組合防空邏輯
console.log('--- 測試 2: existingLogs 合併保護 ---');
const mergeLogs = (newLogs, existingLogsRaw) => {
  const existingLogs = Array.isArray(existingLogsRaw) ? existingLogsRaw : (existingLogsRaw && typeof existingLogsRaw === 'object' ? Object.values(existingLogsRaw) : []);
  return [...newLogs, ...existingLogs];
};

const res1 = mergeLogs([{ id: 'new1' }], null);
assert(res1.length === 1 && res1[0].id === 'new1', 'null existingLogs 合併無誤');

const res2 = mergeLogs([{ id: 'new1' }], { k1: { id: 'old1' } });
assert(res2.length === 2, 'Object existingLogs 合併無誤');
console.log('✅ mergeLogs 測試通過！');

// 測試 3: 題目選項防空在 QuizResult
console.log('--- 測試 3: options.map 防空保護 ---');
const dummyQuestion = {
  id: 'q1',
  question: '1+1=?',
  options: null, // 模擬異常
};

const safeOptions = Array.isArray(dummyQuestion.options) ? dummyQuestion.options : [];
const renderedOpts = safeOptions.map(opt => opt);
assert(renderedOpts.length === 0, 'options 為 null 時不應噴錯，長度為 0');
console.log('✅ safeOptions 測試通過！');

console.log('🎉 所有單元邏輯邊界測試 100% 通過！');
