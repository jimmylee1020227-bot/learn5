import { CURRICULUM_UNITS, SUBJECTS } from '../src/data/curriculum108.js';
import { generateQuestion } from '../src/data/questionGenerator.js';

let fallbackCount = 0;
const missingUnits = [];

for (const subject of SUBJECTS) {
  const grades = CURRICULUM_UNITS[subject.id];
  if (!grades) continue;
  
  for (const [gradeId, units] of Object.entries(grades)) {
    for (const unit of units) {
      try {
        const q = generateQuestion(subject.id, gradeId, unit.id, 1, 'medium'); // test index 1
        
        let isFallback = false;
        const qText = q.question;
        
        if (qText.includes('【108課綱科學素養】')) isFallback = true;
        if (qText.includes('【108 課綱社會科核心素養】')) isFallback = true;
        if (qText.includes('【108課綱核心素養】') && qText.includes('語文常識')) isFallback = true;
        if (qText.includes('【108 課綱英語核心素養】')) isFallback = true;
        if (qText.includes('核心觀念】') && qText.includes('關於本單元的核心數學定理')) isFallback = true;

        if (isFallback) {
          missingUnits.push({ subject: subject.id, gradeId, unitId: unit.id, name: unit.name });
          fallbackCount++;
        }
      } catch (e) {
        console.error(`Error generating ${subject.id} -> ${gradeId} -> ${unit.id}:`, e.message);
      }
    }
  }
}

console.log(`\nTotal missing units: ${fallbackCount}`);
console.log(JSON.stringify(missingUnits, null, 2));
