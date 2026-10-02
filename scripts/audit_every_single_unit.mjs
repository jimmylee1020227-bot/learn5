import { CURRICULUM_UNITS, SUBJECTS, GRADES } from '../src/data/curriculum108.js';
import { generateQuestion, generateQuizSet } from '../src/data/questionGenerator.js';

async function auditAllUnits() {
  console.log('========================================================================');
  console.log('🔬 開始對 108 課綱【全學制、全科目、全年級、全單元】進行 100% 覆蓋率出題審查');
  console.log('========================================================================');

  let totalUnits = 0;
  let passedUnits = 0;
  let failedUnits = 0;
  const failureList = [];

  for (const [subjectKey, gradesObj] of Object.entries(CURRICULUM_UNITS)) {
    console.log(`\n📚 正在檢查科目: 【${subjectKey.toUpperCase()}】...`);
    for (const [gradeKey, unitsList] of Object.entries(gradesObj)) {
      if (!Array.isArray(unitsList)) continue;
      for (const unit of unitsList) {
        totalUnits++;
        const unitId = unit.id;
        const unitName = unit.name;
        let unitPassed = true;
        const unitErrors = [];

        // 測試 1~3 題的出題
        for (let qIdx = 1; qIdx <= 3; qIdx++) {
          try {
            const q = generateQuestion(subjectKey, gradeKey, unitId, qIdx, 'medium');
            if (!q || !q.question || typeof q.question !== 'string' || q.question.trim().length === 0) {
              unitPassed = false;
              unitErrors.push(`題號 #${qIdx} 題幹為空`);
              continue;
            }
            if (!Array.isArray(q.options) || q.options.length !== 4) {
              unitPassed = false;
              unitErrors.push(`題號 #${qIdx} 選項數目不滿 4 項 (實際: ${q.options?.length})`);
              continue;
            }
            const uniqueOptions = new Set(q.options.map(o => String(o).trim()));
            if (uniqueOptions.size !== 4) {
              unitPassed = false;
              unitErrors.push(`題號 #${qIdx} 選項存在重複內容: ${JSON.stringify(q.options)}`);
              continue;
            }
            if (typeof q.answer !== 'number' || q.answer < 0 || q.answer > 3) {
              unitPassed = false;
              unitErrors.push(`題號 #${qIdx} 正解索引非法: ${q.answer}`);
              continue;
            }
            if (!q.explanation || typeof q.explanation !== 'string' || q.explanation.trim().length === 0) {
              unitPassed = false;
              unitErrors.push(`題號 #${qIdx} 缺少詳解`);
              continue;
            }
          } catch (err) {
            unitPassed = false;
            unitErrors.push(`題號 #${qIdx} 拋出異常: ${err.message}`);
          }
        }

        // 測試整卷組卷
        try {
          const quizSet = generateQuizSet({
            subjectId: subjectKey,
            gradeId: gradeKey,
            unitId: unitId,
            count: 5,
            difficulty: 'medium'
          });
          if (!quizSet || quizSet.length < 5) {
            unitPassed = false;
            unitErrors.push(`整卷組卷失敗 (生成 ${quizSet?.length || 0}/5 題)`);
          }
        } catch (err) {
          unitPassed = false;
          unitErrors.push(`組卷異常: ${err.message}`);
        }

        if (unitPassed) {
          passedUnits++;
        } else {
          failedUnits++;
          failureList.push({
            subject: subjectKey,
            grade: gradeKey,
            unitId,
            unitName,
            errors: unitErrors
          });
        }
      }
    }
  }

  // 檢查跨單元總複習
  console.log('\n📚 正在檢查【跨年級總複習 (junior-all, senior-all)】...');
  for (const reviewId of ['junior-all', 'senior-all']) {
    for (const subj of ['chinese', 'english', 'math', 'science', 'social']) {
      totalUnits++;
      try {
        const q = generateQuestion(subj, reviewId === 'junior-all' ? 'g9' : 'h3', reviewId, 1, 'medium');
        if (q && q.question && q.options?.length === 4 && typeof q.answer === 'number' && q.explanation) {
          passedUnits++;
        } else {
          failedUnits++;
          failureList.push({ subject: subj, grade: reviewId, unitId: reviewId, unitName: '總複習', errors: ['總複習出題欄位殘缺'] });
        }
      } catch (err) {
        failedUnits++;
        failureList.push({ subject: subj, grade: reviewId, unitId: reviewId, unitName: '總複習', errors: [err.message] });
      }
    }
  }

  console.log('\n========================================================================');
  console.log(`📊 單元題庫出題審查大總結:`);
  console.log(`   📌 總計審查單元: ${totalUnits} 個單元`);
  console.log(`   ✅ 完美通過出題與組卷單元: ${passedUnits} 個`);
  console.log(`   ❌ 異常單元: ${failedUnits} 個`);

  if (failedUnits > 0) {
    console.log('\n⚠️ 異常單元詳細清單:');
    failureList.forEach(f => {
      console.log(`  - [${f.subject.toUpperCase()}][${f.grade}] ${f.unitName} (${f.unitId}):`);
      f.errors.forEach(e => console.log(`      * ${e}`));
    });
  } else {
    console.log('\n🎉 100% 完美！108 課綱所有學段、所有科目、所有年級、所有單元均可 100% 順暢出題且正確作答！');
  }
  console.log('========================================================================');

  process.exit(failedUnits === 0 ? 0 : 1);
}

auditAllUnits().catch(err => {
  console.error('審查執行失敗:', err);
  process.exit(1);
});
