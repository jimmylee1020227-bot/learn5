import { CURRICULUM_UNITS } from './curriculum108.js';
import { getQuestionOverrides, registerQuestionHydrator } from '../services/cloudStorage.js';

import { generateMathQuestion } from './mathGenerator.js';
import { generateEnglishQuestion } from './englishGenerator.js';
import { generateScienceQuestion } from './scienceGenerator.js';
import { generateChineseQuestion } from './chineseGenerator.js';
import { generateSocialQuestion } from './socialGenerator.js';

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
  const seedKey = `${subjectId}-${gradeId}-${unitId}-idx${index}`;
  const seed = hashStringToSeed(seedKey);
  const rand = mulberry32(seed);

  const unitList = CURRICULUM_UNITS[subjectId]?.[gradeId] || [];
  const currentUnit = unitList.find(u => u.id === unitId) || unitList[0] || { id: unitId, name: '綜合複習單元', tags: ['核心觀念素養'] };
  const conceptTags = currentUnit.tags || ['108課綱核心素養'];
  const tagIdx = Math.floor(rand() * conceptTags.length);
  const conceptTag = conceptTags[tagIdx];

  let qData;
  try {
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
        qData = generateMathQuestion(gradeId, unitId, index, difficulty, rand, conceptTag);
        break;
    }
  } catch (err) {
    console.error(`Generator Error for ${seedKey}:`, err);
    qData = {
      question: `【系統回報】題目生成時發生異常，請略過此題或回報管理員。\n錯誤代碼：${seedKey}`,
      options: ['略過此題', '略過', '略過...', '略過.'],
      answer: 0,
      hint: '請聯絡系統管理員。',
      explanation: `此題因演算法內部錯誤 (${err.message}) 無法正確生成。`
    };
  }

  const uniqueOptions = [];
  const seenTexts = new Set();
  let correctOptFound = false;

  qData.options.forEach((opt, idx) => {
    const text = String(opt);
    const isAns = idx === qData.answer;
    if (!seenTexts.has(text)) {
      seenTexts.add(text);
      uniqueOptions.push({ text, isCorrect: isAns });
      if (isAns) correctOptFound = true;
    }
  });

  // 安全網：如果發生重複導致選項少於 4 個，使用備用字串補齊
  const fallbacks = ['無法判斷', '以上皆非', '資料不足', '條件不足', '以上皆是'];
  let fIdx = 0;
  while (uniqueOptions.length < 4 && fIdx < fallbacks.length) {
    const fText = fallbacks[fIdx];
    if (!seenTexts.has(fText)) {
      seenTexts.add(fText);
      uniqueOptions.push({ text: fText, isCorrect: false });
    }
    fIdx++;
  }

  // 終極安全網：如果經過過濾後，竟然沒有正確答案，強制將第一個選項設為正解
  if (!correctOptFound && uniqueOptions.length > 0) {
    uniqueOptions[0].isCorrect = true;
  }

  const shuffled = shuffleWithRand(uniqueOptions, rand);
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
    isChat: qData.isChat || false,
    chatMessages: qData.chatMessages || null,
    isSvg: qData.isSvg || false,
    svgContent: qData.svgContent || null,
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
  const usedQuestionTexts = new Set();
  let attempts = 0;
  const maxAttempts = count * 40;
  const overrides = typeof getQuestionOverrides === 'function' ? getQuestionOverrides() : {};

  // 根據難度調整 index 範圍
  const indexRange = {
    easy: 3000,
    medium: 6000,
    hard: 9000,
    extreme: 15000,
    hardest: 15000
  };
  const maxIndex = indexRange[difficulty] || 6000;

  while (quizSet.length < count && attempts < maxAttempts) {
    attempts++;

    // 嚴格鎖定：100% 忠於使用者所選定的年級與單元，絕不跨年級跨單元錯置！
    const targetGradeId = gradeId;
    const unitId = validUnits[Math.floor(Math.random() * validUnits.length)];

    const questionIndex = Math.floor(Math.random() * maxIndex) + 1;
    let q = generateQuestion(subjectId, targetGradeId, unitId, questionIndex, difficulty);

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

  // 保底機制：若因題幹嚴格去重導致題數尚未達到目標，以多樣化種子迅速補齊至 count 題
  let fallbackAttempts = 0;
  while (quizSet.length < count && fallbackAttempts < count * 30) {
    fallbackAttempts++;
    const unitId = validUnits[fallbackAttempts % validUnits.length];
    const questionIndex = Math.floor(Math.random() * maxIndex) + 5000 + fallbackAttempts * 13;
    let q = generateQuestion(subjectId, gradeId, unitId, questionIndex, difficulty);
    if (!overrides[q.id]?.isDeleted && !usedQuestionIds.has(q.id)) {
      usedQuestionIds.add(q.id);
      quizSet.push(q);
    }
  }

  return quizSet;
}


// 簡易隨機數（非題目種子，僅用於選擇題庫分配）
function rand_simple() {
  return Math.random();
}
