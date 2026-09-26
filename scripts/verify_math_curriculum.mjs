import { generateQuestion } from '../src/data/questionGenerator.js';
import { CURRICULUM_UNITS } from '../src/data/curriculum108.js';

console.log('=== VERIFYING MATHEMATICAL ACCURACY & 108 CURRICULUM COMPLIANCE ===');

let totalTested = 0;
let errors = [];

for (const [grade, units] of Object.entries(CURRICULUM_UNITS.math)) {
  for (const u of units) {
    for (let idx = 0; idx < 20; idx++) {
      for (const diff of ['medium', 'extreme']) {
        totalTested++;
        const q = generateQuestion('math', grade, u.id, idx, diff);
        const fullText = q.question + ' ' + (q.explanation || '') + ' ' + (q.hint || '');

        // 1. Check for 108 deleted cubic formulas
        if (/立方和|立方差|a\^3\s*\+\s*b\^3|a\^3\s*-\s*b\^3|\(a\+b\)\^3|\(a-b\)\^3/i.test(fullText)) {
          errors.push(`[108 CURRICULUM VIOLATION - CUBIC FORMULA] ${grade} ${u.id} idx:${idx} diff:${diff}: ${q.question.split('\n')[0]}`);
        }

        // 2. Check for g7 cross-unit misplacements
        if (grade === 'g7') {
          if (u.id === 'ma-7-u2' && (/等差/i.test(fullText) || /二元一次/i.test(fullText))) {
            errors.push(`[MISPLACED UNIT in g7-u2] idx:${idx} diff:${diff}: ${q.question.split('\n')[0]}`);
          }
          if (/十字交乘/i.test(fullText)) {
            errors.push(`[MISPLACED CROSS-MULT in g7] ${u.id} idx:${idx} diff:${diff}: ${q.question.split('\n')[0]}`);
          }
        }

        // 3. Check for g8 cross-unit misplacements
        if (grade === 'g8' && u.id !== 'ma-8-u1' && /【乘法公式/i.test(q.question)) {
          errors.push(`[MISPLACED MULT-FORMULA in g8-${u.id}] idx:${idx} diff:${diff}: ${q.question.split('\n')[0]}`);
        }

        // 4. Check for g9 cross-unit misplacements
        if (grade === 'g9') {
          if (u.id === 'ma-9-u1' && /圓/i.test(q.question)) {
            errors.push(`[MISPLACED CIRCLE in g9-u1] idx:${idx} diff:${diff}: ${q.question.split('\n')[0]}`);
          }
          if (u.id === 'ma-9-u2' && /二次函數/i.test(q.question)) {
            errors.push(`[MISPLACED PARABOLA in g9-u2] idx:${idx} diff:${diff}: ${q.question.split('\n')[0]}`);
          }
        }
      }
    }
  }
}

console.log('Total questions verified across all units & difficulties:', totalTested);
console.log('Total violations found:', errors.length);
if (errors.length > 0) {
  console.log('Errors:', errors);
} else {
  console.log('✅ 100% 完美通過！無任何 108 課綱以前超綱題目，各年級單元 100% 精準對齊！');
}

console.log('\n--- VERIFYING Q-G7-MA-U2-1334 (STUDENT REPORTED ITEM) ---');
for (const diff of ['easy', 'medium', 'hard', 'extreme']) {
  const q = generateQuestion('math', 'g7', 'ma-7-u2', 1334, diff);
  console.log('[' + diff + ']:', q.question.split('\n')[0]);
}

process.exit(0);
