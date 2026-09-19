import { CURRICULUM_UNITS } from './curriculum108';
import { getQuestionOverrides, registerQuestionHydrator } from '../services/cloudStorage';

import { generateMathQuestion } from './mathGenerator';
import { generateEnglishQuestion } from './englishGenerator';
import { generateScienceQuestion } from './scienceGenerator';
import { generateChineseQuestion } from './chineseGenerator';
import { generateSocialQuestion } from './socialGenerator';

function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function hashStringToSeed(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
  }
  return hash;
}

function shuffleWithRand(array, rand) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateQuestion(subjectId, gradeId, unitId, index, difficulty = 'medium') {
  const seedKey = `${subjectId}-${gradeId}-${unitId}-idx${index}-${difficulty}`;
  const seed = hashStringToSeed(seedKey);
  const rand = mulberry32(seed);

  const unitList = CURRICULUM_UNITS[subjectId]?.[gradeId] || [];
  const currentUnit = unitList.find(u => u.id === unitId) || unitList[0] || { id: unitId, name: '綜合複習單元', tags: ['核心觀念素養'] };
  const conceptTags = currentUnit.tags || ['108課綱核心素養'];
  const tagIdx = Math.floor(rand() * conceptTags.length);
  const conceptTag = conceptTags[tagIdx];

  let qData;
  switch (subjectId) {
    case 'math':
      qData = generateMathQuestion(gradeId, unitId, index, difficulty, rand, conceptTag);
      break;
    case 'english':
      qData = generateEnglishQuestion(gradeId, unitId, index, difficulty, rand, conceptTag);
      break;
    case 'science':
      qData = generateScienceQuestion(gradeId, unitId, index, difficulty, rand, conceptTag);
      break;
    case 'chinese':
      qData = generateChineseQuestion(gradeId, unitId, index, difficulty, rand, conceptTag);
      break;
    case 'social':
      qData = generateSocialQuestion(gradeId, unitId, index, difficulty, rand, conceptTag);
      break;
    default:
      qData = generateFallbackQuestion(subjectId, gradeId, unitId, index, difficulty, rand, conceptTag);
  }

  const optionsWithMeta = qData.options.map((opt, idx) => ({
    text: String(opt),
    isCorrect: idx === qData.answer
  }));
  const shuffled = shuffleWithRand(optionsWithMeta, rand);
  const correctIdx = shuffled.findIndex(item => item.isCorrect);

  const formattedIndex = String(index).padStart(4, '0');
  const questionId = `Q-${gradeId.toUpperCase()}-${subjectId.substring(0, 2).toUpperCase()}-${unitId.split('-').pop().toUpperCase()}-${formattedIndex}`;

  return {
    id: questionId,
    index,
    subjectId,
    gradeId,
    unitId,
    unitName: currentUnit.name,
    conceptTag,
    difficulty,
    question: qData.question,
    options: shuffled.map(item => item.text),
    answer: correctIdx >= 0 ? correctIdx : 0,
    hint: qData.hint,
    explanation: qData.explanation,
    isListening: qData.isListening || false,
    audioText: qData.audioText || null,
    isReading: qData.isReading || false,
    readingText: qData.readingText || null,
    isCustom: false
  };
}

try {
  if (typeof registerQuestionHydrator === 'function') {
    registerQuestionHydrator(generateQuestion);
  }
} catch (e) {}

function generateFallbackQuestion(subjectId, gradeId, unitId, index, difficulty, rand, conceptTag) {
  return {
    question: `【108課綱核心素養第 ${index} 題】關於「${conceptTag}」之學科知識理解，下列敘述何者正確？`,
    options: [
      '核心概念詮釋精確且符合108課綱學科素養標準',
      '錯誤概念敘述一：混淆因果關聯性',
      '錯誤概念敘述二：違反科學邏輯定理',
      '錯誤概念敘述三：超出課程規範之偏誤推論'
    ],
    answer: 0,
    hint: '💡 提示：回歸 108 課綱課本核心概念定義，注意選項間的邏輯互斥關係。',
    explanation: `📖 詳解：本題檢驗該單元【${conceptTag}】之核心素養，選項第一項正確無誤。`
  };
}

export function generateQuizSet({ subjectId, gradeId, unitIds, difficulty = 'medium', count = 10, excludeIds = [] }) {
  const quizSet = [];
  const validUnits = unitIds.length > 0 ? unitIds : (CURRICULUM_UNITS[subjectId]?.[gradeId] || []).map(u => u.id);
  if (validUnits.length === 0) return [];

  const usedQuestionIds = new Set(excludeIds);
  const usedQuestionTexts = new Set(); // 確保不會出現文字完全一樣但 ID 不同的重複題
  let attempts = 0;
  const maxAttempts = count * 35;
  const overrides = typeof getQuestionOverrides === 'function' ? getQuestionOverrides() : {};

  while (quizSet.length < count && attempts < maxAttempts) {
    attempts++;
    const unitId = validUnits[Math.floor(Math.random() * validUnits.length)];
    const questionIndex = Math.floor(Math.random() * 5000) + 1;
    let q = generateQuestion(subjectId, gradeId, unitId, questionIndex, difficulty);

    if (overrides[q.id]?.isDeleted) {
      continue;
    }

    if (overrides[q.id]) {
      q = {
        ...q,
        ...overrides[q.id],
        id: q.id,
        subjectId: q.subjectId,
        gradeId: q.gradeId,
        unitId: q.unitId
      };
    }

    if (!usedQuestionIds.has(q.id) && !usedQuestionTexts.has(q.question)) {
      usedQuestionIds.add(q.id);
      usedQuestionTexts.add(q.question);
      quizSet.push(q);
    }
  }

  return quizSet;
}
