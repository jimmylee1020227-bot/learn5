const fs = require('fs');
const assert = require('assert');

// Simulate the import behavior using dynamic import since it's ESM
(async () => {
  try {
    const { generateQuizSet } = await import('../src/data/questionGenerator.js');
    console.log('Testing generateQuizSet...');
    const subjects = ['math', 'science', 'social', 'english', 'chinese'];
    const grades = ['g7', 'g8', 'g9'];
    let count = 0;
    
    for (const subj of subjects) {
      for (const gr of grades) {
        const qset = generateQuizSet({ subjectId: subj, gradeId: gr, count: 5 });
        assert(qset.length === 5, `Failed to generate 5 questions for ${subj} ${gr}`);
        count += 5;
      }
    }
    console.log(`✅ Successfully generated ${count} questions without error.`);
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
})();
