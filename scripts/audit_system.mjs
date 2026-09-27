import { CURRICULUM_UNITS, GRADES, SUBJECTS, DIFFICULTIES } from '../src/data/curriculum108.js';
import { generateQuizSet, generateQuestion } from '../src/data/questionGenerator.js';

console.log('=== 開始 108 課綱全學制、全科、全年級、全單元題庫與作答安全審查 ===\n');

let totalUnits = 0;
let totalTestedQuestions = 0;
let errors = [];
let warnings = [];

// 1. 課綱單元完整度與反查表建立
const unitToMeta = new Map(); // unitId -> { subject, grade, name }

for (const [subject, gradesObj] of Object.entries(CURRICULUM_UNITS)) {
  for (const [grade, units] of Object.entries(gradesObj)) {
    if (!Array.isArray(units)) {
      errors.push(`課綱錯誤: ${subject}.${grade} 不是陣列！`);
      continue;
    }
    units.forEach((u, idx) => {
      totalUnits++;
      if (!u.id) {
        errors.push(`單元缺失 ID: ${subject} ${grade} index ${idx}`);
      } else if (unitToMeta.has(u.id)) {
        warnings.push(`單元 ID 重複定義: ${u.id} 出現在 ${subject}.${grade} 與 ${unitToMeta.get(u.id).subject}.${unitToMeta.get(u.id).grade}`);
      } else {
        unitToMeta.set(u.id, { subject, grade, name: u.name });
      }
    });
  }
}

console.log(`[課綱統計] 總科目數: ${Object.keys(CURRICULUM_UNITS).length}，總單元數: ${totalUnits}`);

// 2. 測試各科目、各年級、各單元的題目生成與作答可行性
const testDifficulties = ['easy', 'medium', 'hard', 'extreme'];

for (const [subject, gradesObj] of Object.entries(CURRICULUM_UNITS)) {
  for (const [grade, units] of Object.entries(gradesObj)) {
    for (const unit of units) {
      for (const diff of testDifficulties) {
        try {
          const quizSet = generateQuizSet({
            subjectId: subject,
            gradeId: grade,
            unitId: unit.id,
            difficulty: diff,
            count: 3
          });

          if (!quizSet || quizSet.length === 0) {
            errors.push(`[出題失敗] ${subject} ${grade} ${unit.id} (${unit.name}) 難度 ${diff} 無法生成任何題目！`);
            continue;
          }

          quizSet.forEach((q, qIdx) => {
            totalTestedQuestions++;
            // 檢查題目屬性完整性
            if (!q.id) errors.push(`題目缺少 id: ${subject} ${grade} ${unit.id}`);
            if (!q.question || typeof q.question !== 'string' || q.question.trim().length === 0) {
              errors.push(`題目幹空或非法: ${q.id}`);
            }
            if (q.question && (q.question.includes('undefined') || q.question.includes('NaN'))) {
              warnings.push(`題目含 undefined/NaN: ${q.id} -> ${q.question.substring(0, 60)}`);
            }
            if (!Array.isArray(q.options) || q.options.length < 2) {
              errors.push(`選項數量少於2: ${q.id} (長度 ${q.options?.length})`);
            } else {
              q.options.forEach((opt, optIdx) => {
                if (opt === undefined || opt === null || opt === '' || String(opt).includes('undefined') || String(opt).includes('NaN')) {
                  warnings.push(`選項異常 (opt ${optIdx}): ${q.id} -> "${opt}"`);
                }
              });
            }
            if (typeof q.answer !== 'number' || q.answer < 0 || q.answer >= (q.options?.length || 0)) {
              errors.push(`正確解答超出範圍: ${q.id} answer=${q.answer}, options.length=${q.options?.length}`);
            }
            // 檢查年級與單元一致性
            if (q.unitId && q.unitId !== unit.id) {
              // 容許 fallback 或關聯單元，但若跨年級則嚴格報錯
              const expectedMeta = unitToMeta.get(unit.id);
              const actualMeta = unitToMeta.get(q.unitId);
              if (expectedMeta && actualMeta && expectedMeta.grade !== actualMeta.grade) {
                errors.push(`跨年級錯置: 預期 ${expectedMeta.grade} 實際 ${actualMeta.grade} (題目 ${q.id}, 單元 ${q.unitId})`);
              }
            }
          });
        } catch (err) {
          errors.push(`[拋出異常] ${subject} ${grade} ${unit.id} 難度 ${diff}: ${err.message}\n${err.stack}`);
        }
      }
    }
  }
}

// 3. 測試總複習年級 (junior-all, senior-all, past-exams 等)
const specialGrades = [
  { grade: 'junior-all', subject: 'math' },
  { grade: 'junior-all', subject: 'chinese' },
  { grade: 'junior-all', subject: 'english' },
  { grade: 'junior-all', subject: 'science' },
  { grade: 'junior-all', subject: 'social' },
  { grade: 'senior-all', subject: 'math' },
  { grade: 'senior-all', subject: 'chinese' },
  { grade: 'senior-all', subject: 'english' },
  { grade: 'senior-all', subject: 'science' },
  { grade: 'senior-all', subject: 'social' },
  { grade: 'past-exams', subject: 'math' },
  { grade: 'gsat', subject: 'math' }
];

for (const sg of specialGrades) {
  try {
    const quizSet = generateQuizSet({
      subjectId: sg.subject,
      gradeId: sg.grade,
      count: 5
    });
    if (!quizSet || quizSet.length === 0) {
      errors.push(`[特殊年級出題失敗] ${sg.grade} ${sg.subject}`);
    } else {
      totalTestedQuestions += quizSet.length;
    }
  } catch (err) {
    errors.push(`[特殊年級異常] ${sg.grade} ${sg.subject}: ${err.message}`);
  }
}

console.log(`\n=== 測試完成 ===`);
console.log(`總測試題目數: ${totalTestedQuestions}`);
console.log(`錯誤數量: ${errors.length}`);
console.log(`警告數量: ${warnings.length}`);

if (errors.length > 0) {
  console.log('\n--- 錯誤列表 (前 30 筆) ---');
  errors.slice(0, 30).forEach(e => console.log('❌', e));
}

if (warnings.length > 0) {
  console.log('\n--- 警告列表 (前 30 筆) ---');
  warnings.slice(0, 30).forEach(w => console.log('⚠️', w));
}

if (errors.length === 0) {
  console.log('\n✅ 所有單元與題庫驗證通過，沒有致命錯誤！');
}
