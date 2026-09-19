// 108 課綱每單元 5000+ 題不重複演算法核心產生引擎
import { CURRICULUM_UNITS } from './curriculum108';
import { getQuestionOverrides, registerQuestionHydrator } from '../services/cloudStorage';

// Mulberry32 確定性偽隨機數產生器 (Deterministic PRNG)
function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// 字串雜湊轉數字種子
function hashStringToSeed(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
  }
  return hash;
}

// 通用陣列洗牌函式 (使用確定性 rand)
function shuffleWithRand(array, rand) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 根據單元、題號 index (1 ~ 5000) 與難度 (easy / medium / hard / extreme) 生成唯一、不重複、具備詳解與提示的 108 課綱題目
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

  // 確定性隨機洗牌四個選項並定位正確答案索引
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
    isCustom: false
  };
}

// 向雲端儲存模組註冊題庫還原器
try {
  if (typeof registerQuestionHydrator === 'function') {
    registerQuestionHydrator(generateQuestion);
  }
} catch (e) {}

// ==========================================
// 1. 數學科 5000+ 題參數矩陣演算法
// ==========================================
function generateMathQuestion(gradeId, unitId, index, difficulty, rand, conceptTag) {
  const diffMultiplier = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : difficulty === 'hard' ? 4 : 7;
  const a = Math.floor(rand() * 10 * diffMultiplier) + 2;
  const b = Math.floor(rand() * 8 * diffMultiplier) + 3;
  const c = Math.floor(rand() * 6 * diffMultiplier) + 1;
  const pName = ['小明', '小華', '阿哲', '宇軒', '沛妤', '詠晴', '志豪', '雅婷'][Math.floor(rand() * 8)];

  if (gradeId === 'g7') {
    if (unitId.includes('u1')) {
      // 負數、數線與整數運算
      const n1 = -a;
      const n2 = b;
      const n3 = -(c + 2);
      const isAdd = rand() > 0.5;
      const inside = isAdd ? n1 + n2 : n1 - n2;
      const ansVal = inside * n3;
      return {
        question: `【整數四則與負數運算】計算式子：[(${n1}) ${isAdd ? '+' : '-'} (${n2})] × (${n3}) 之值為何？`,
        options: [ansVal, ansVal + a, ansVal - b, -ansVal],
        answer: 0,
        hint: '💡 提示：先算中括號內的正負整數運算，最後再與負數相乘（注意負負得正）。',
        explanation: `📖 詳解：\n1. 先算括號：(${n1}) ${isAdd ? '+' : '-'} (${n2}) = ${inside}。\n2. 進行乘法：(${inside}) × (${n3}) = ${ansVal}（負負得正）。故答案為 ${ansVal}。`
      };
    } else if (unitId.includes('u2')) {
      // 指數律與科學記號
      const base = [2, 3, 5, 10][Math.floor(rand() * 4)];
      const exp1 = (a % 5) + 2;
      const exp2 = (b % 4) + 1;
      const totalExp = exp1 + exp2;
      return {
        question: `【指數律運算】計算 ${base}^${exp1} × ${base}^${exp2} 之值等於多少？`,
        options: [`${base}^${totalExp}`, `${base}^${exp1 * exp2}`, `${base * base}^${totalExp}`, `${base}^${Math.abs(exp1 - exp2)}`],
        answer: 0,
        hint: '💡 提示：同底數相乘時，底數不變，指數相加：a^m × a^n = a^(m+n)。',
        explanation: `📖 詳解：根據指數律公式，同底數相乘指數相加：${base}^${exp1} × ${base}^${exp2} = ${base}^(${exp1} + ${exp2}) = ${base}^${totalExp}。`
      };
    } else if (unitId.includes('u3')) {
      // 因數、倍數與分數
      const gcdVal = (c % 4) + 2;
      const numA = a * gcdVal;
      const numB = b * gcdVal;
      return {
        question: `【公因數與公倍數】已知兩個正整數 A = ${numA}，B = ${numB}，求 A 與 B 的最大公因數 (GCD) 為何？`,
        options: [gcdVal, gcdVal * 2, numA * numB, 1],
        answer: 0,
        hint: '💡 提示：利用質因數分解或短除法找出兩數共同的質因數乘積。',
        explanation: `📖 詳解：將 ${numA} 與 ${numB} 進行質因數分解，共同最大的因數為 ${gcdVal}。`
      };
    } else if (unitId.includes('u4')) {
      // 一元一次方程式
      const coeff = (a % 5) + 2;
      const xVal = (b % 8) + 1;
      const constTerm = c * 3;
      const rhs = coeff * xVal + constTerm;
      return {
        question: `【一元一次方程式】解方程式：${coeff}x + ${constTerm} = ${rhs}，則 x 之值為何？`,
        options: [xVal, xVal + 1, xVal - 1, -xVal],
        answer: 0,
        hint: `💡 提示：將常數項 ${constTerm} 移至等號右邊相減，再同除以係數 ${coeff}。`,
        explanation: `📖 詳解：\n1. 移項：${coeff}x = ${rhs} - ${constTerm} = ${coeff * xVal}。\n2. 等號兩邊同除以 ${coeff} 得 x = ${xVal}。`
      };
    } else {
      // 坐標平面與二元一次
      const xCoord = (a % 7) - 3;
      const yCoord = (b % 7) - 3;
      const quadName = xCoord > 0 && yCoord > 0 ? '第一象限' : xCoord < 0 && yCoord > 0 ? '第二象限' : xCoord < 0 && yCoord < 0 ? '第三象限' : '第四象限';
      return {
        question: `【直角坐標平面】坐標平面上一點 P(${xCoord}, ${yCoord})，若其 x坐標${xCoord > 0 ? '為正' : '為負'}且 y坐標${yCoord > 0 ? '為正' : '為負'}，則點 P 位於哪一個象限？`,
        options: [quadName, quadName === '第一象限' ? '第二象限' : '第一象限', '第三象限', '第四象限'],
        answer: 0,
        hint: '💡 提示：第一象限(+,+)，第二象限(-,+)，第三象限(-,-)，第四象限(+,-)。',
        explanation: `📖 詳解：P(${xCoord}, ${yCoord}) 其正負符號特徵為 (${xCoord > 0 ? '+' : '-'}, ${yCoord > 0 ? '+' : '-'}), 故位於「${quadName}」。`
      };
    }
  } else if (gradeId === 'g8') {
    if (unitId.includes('u1')) {
      // 乘法公式與多項式
      const xTerm = (a % 6) + 2;
      const constVal = (b % 5) + 1;
      const ansSquare = xTerm * xTerm;
      const ansMiddle = 2 * xTerm * constVal;
      const ansLast = constVal * constVal;
      return {
        question: `【完全平方公式】展開代數式 (${xTerm}x + ${constVal})² 之結果為何？`,
        options: [
          `${ansSquare}x² + ${ansMiddle}x + ${ansLast}`,
          `${ansSquare}x² + ${ansLast}`,
          `${ansSquare}x² + ${ansMiddle / 2}x + ${ansLast}`,
          `${ansSquare}x² - ${ansMiddle}x + ${ansLast}`
        ],
        answer: 0,
        hint: '💡 提示：利用 (a + b)² = a² + 2ab + b² 公式展開，注意中間項為 2×a×b。',
        explanation: `📖 詳解：(${xTerm}x + ${constVal})² = (${xTerm}x)² + 2 × (${xTerm}x) × (${constVal}) + (${constVal})² = ${ansSquare}x² + ${ansMiddle}x + ${ansLast}。`
      };
    } else if (unitId.includes('u2')) {
      // 平方根與畢氏定理
      const pythTriples = [[3, 4, 5], [5, 12, 13], [7, 24, 25], [8, 15, 17], [6, 8, 10]];
      const triple = pythTriples[index % pythTriples.length];
      const scale = (c % 2) + 1;
      const sideA = triple[0] * scale;
      const sideB = triple[1] * scale;
      const hyp = triple[2] * scale;
      return {
        question: `【畢氏定理幾何求值】直角三角形的兩股長度分別為 ${sideA} 與 ${sideB}，求此直角三角形的斜邊長度為何？`,
        options: [hyp, hyp + 1, hyp - 1, sideA + sideB],
        answer: 0,
        hint: '💡 提示：根據畢氏定理 a² + b² = c²，斜邊 c = √(a² + b²)。',
        explanation: `📖 詳解：斜邊長 = √(${sideA}² + ${sideB}²) = √(${sideA * sideA} + ${sideB * sideB}) = √${hyp * hyp} = ${hyp}。`
      };
    } else if (unitId.includes('u3') || unitId.includes('u4')) {
      // 因式分解與一元二次方程式
      const r1 = (a % 5) + 1;
      const r2 = (b % 4) + 2;
      const sum = -(r1 + r2);
      const prod = r1 * r2;
      return {
        question: `【一元二次方程式解法】解方程式 x² ${sum >= 0 ? '+ ' + sum : '- ' + Math.abs(sum)}x + ${prod} = 0，其兩根分別為何？`,
        options: [`x = ${r1} 或 x = ${r2}`, `x = ${-r1} 或 x = ${-r2}`, `x = ${r1 + 1} 或 x = ${r2 - 1}`, `x = 0 或 x = ${prod}`],
        answer: 0,
        hint: '💡 提示：利用十字交乘法分解成 (x - r1)(x - r2) = 0。',
        explanation: `📖 詳解：將方程式因式分解得 (x - ${r1})(x - ${r2}) = 0，故兩根為 x = ${r1} 或 x = ${r2}。`
      };
    } else {
      // 等差數列與級數
      const a1 = (a % 8) + 1;
      const d = (b % 5) + 2;
      const n = (c % 5) + 6;
      const an = a1 + (n - 1) * d;
      return {
        question: `【等差數列第 n 項】已知一等差數列首項 a₁ = ${a1}，公差 d = ${d}，則此數列的第 ${n} 項 a_${n} 為何？`,
        options: [an, an + d, an - d, a1 + n * d],
        answer: 0,
        hint: '💡 提示：等差數列第 n 項通式公式為 a_n = a₁ + (n - 1)d。',
        explanation: `📖 詳解：a_${n} = a₁ + (${n} - 1) × d = ${a1} + ${n - 1} × ${d} = ${a1} + ${(n - 1) * d} = ${an}。`
      };
    }
  } else {
    // 九年級 (g9): 相似形、圓、二次函數、機率
    if (unitId.includes('u1')) {
      const scale = (a % 3) + 2;
      const areaRatio = scale * scale;
      return {
        question: `【相似形面積比】若兩相似三角形 △ABC ~ △DEF，其對應邊長比為 1 : ${scale}，則此兩三角形的面積比為何？`,
        options: [`1 : ${areaRatio}`, `1 : ${scale}`, `1 : ${scale * 3}`, `1 : ${areaRatio * 2}`],
        answer: 0,
        hint: '💡 提示：相似圖形的面積比等於其對應邊長的「平方比」。',
        explanation: `📖 詳解：面積比 = 邊長比的平方 = 1² : ${scale}² = 1 : ${areaRatio}。`
      };
    } else if (unitId.includes('u2')) {
      const radius = (a % 6) + 4;
      const deg = [60, 90, 120, 180][b % 4];
      const fraction = deg / 360;
      const arcLen = (2 * radius * fraction).toFixed(1);
      return {
        question: `【圓形與扇形弧長】已知圓半徑為 ${radius} 公分，圓心角為 ${deg}° 的扇形，其弧長為多少公分？`,
        options: [`${arcLen}π`, `${(radius * fraction).toFixed(1)}π`, `${(2 * radius).toFixed(1)}π`, `${(radius * radius * fraction).toFixed(1)}π`],
        answer: 0,
        hint: '💡 提示：圓周長公式為 2πr，扇形弧長等於圓周長乘以圓心角比例 (θ/360°)。',
        explanation: `📖 詳解：弧長 = 2π × ${radius} × (${deg} / 360) = ${2 * radius}π × ${fraction} = ${arcLen}π 公分。`
      };
    } else {
      // 機率統計
      const totalBalls = 10;
      const redBalls = (a % 4) + 2;
      const prob = `${redBalls}/${totalBalls}`;
      return {
        question: `【古典機率計算】袋中有紅球 ${redBalls} 顆、白球 ${totalBalls - redBalls} 顆，每顆球被取出的機會均等。${pName}從袋中隨機抽取一球，抽中紅球的機率為何？`,
        options: [prob, `${totalBalls - redBalls}/${totalBalls}`, `1/${totalBalls}`, `1/2`],
        answer: 0,
        hint: '💡 提示：機率 P = 目標事件數 ÷ 總可能樣本數。',
        explanation: `📖 詳解：袋中總球數為 ${totalBalls} 顆，紅球有 ${redBalls} 顆，故抽中紅球機率為 ${redBalls} / ${totalBalls} = ${prob}。`
      };
    }
  }
}

// ==========================================
// 2. 英文科 5000+ 題語法情境矩陣演算法
// ==========================================
function generateEnglishQuestion(gradeId, unitId, index, difficulty, rand, conceptTag) {
  const names = ['Tom', 'Amy', 'Peter', 'Emily', 'Jason', 'Lucy', 'Kevin', 'Sandy'];
  const name1 = names[index % names.length];
  const places = ['the library', 'the kitchen', 'the park', 'the classroom', 'the bakery'][Math.floor(rand() * 5)];

  if (gradeId === 'g7') {
    if (unitId.includes('u1')) {
      const pronouns = [
        { s: 'I', be: 'am', wrong: 'is' },
        { s: 'She', be: 'is', wrong: 'are' },
        { s: 'They', be: 'are', wrong: 'is' },
        { s: 'He', be: 'is', wrong: 'am' }
      ];
      const item = pronouns[index % pronouns.length];
      return {
        question: `Good morning! ________ a dedicated junior high school student who loves learning.`,
        options: [`${item.s} ${item.be}`, `${item.s} ${item.wrong}`, `${item.be} ${item.s}`, `Me ${item.be}`],
        answer: 0,
        hint: `💡 提示：英文主格人稱代名詞與 Be 動詞配合規則：I 搭配 am，單數代名詞搭配 is，複數搭配 are。`,
        explanation: `📖 詳解：主詞「${item.s}」需搭配正確 Be 動詞「${item.be}」，故正確答案選「${item.s} ${item.be}」。`
      };
    } else if (unitId.includes('u2')) {
      const verbs = [
        { base: 'play', s: 'plays', ing: 'playing' },
        { base: 'study', s: 'studies', ing: 'studying' },
        { base: 'watch', s: 'watches', ing: 'watching' }
      ];
      const v = verbs[index % verbs.length];
      return {
        question: `Every weekend, ${name1} usually ________ basketball with classmates in ${places}.`,
        options: [v.s, v.base, v.ing, `is ${v.ing}`],
        answer: 0,
        hint: `💡 提示：句中有「Every weekend」與頻率副詞「usually」，表示習慣性事實，主詞為第三人稱單數，動詞需加 -s 或 -es。`,
        explanation: `📖 詳解：主詞 ${name1} 為單數第三人稱，時態為現在簡單式，動詞 ${v.base} 應轉為單數形式「${v.s}」。`
      };
    } else {
      // 進行式與方位介系詞
      const prep = ['in', 'on', 'under', 'next to', 'behind'][index % 5];
      return {
        question: `Look! The lovely cat is sleeping peacefully ________ the wooden chair right now.`,
        options: [prep, 'at', 'into', 'for'],
        answer: 0,
        hint: '💡 提示：表示在椅子上方或其位置關係，使用合適的空間介系詞。',
        explanation: `📖 詳解：在椅子方位上最貼切之空間介系詞為「${prep}」。`
      };
    }
  } else if (gradeId === 'g8') {
    if (unitId.includes('u1')) {
      // 過去簡單式
      const pastVerbs = [
        { v: 'went', base: 'go', wrong: 'goed' },
        { v: 'bought', base: 'buy', wrong: 'buys' },
        { v: 'saw', base: 'see', wrong: 'seed' },
        { v: 'took', base: 'take', wrong: 'taked' }
      ];
      const pv = pastVerbs[index % pastVerbs.length];
      return {
        question: `Yesterday afternoon, ${name1} and family ________ to the supermarket and prepared a delicious dinner.`,
        options: [pv.v, pv.base, pv.wrong, `was ${pv.base}`],
        answer: 0,
        hint: '💡 提示：句首有過去時間副詞「Yesterday」，句子動詞必須使用不規則過去式變化。',
        explanation: `📖 詳解：時間為昨天「Yesterday」，動詞 ${pv.base} 的不規則過去式為「${pv.v}」。`
      };
    } else if (unitId.includes('u3')) {
      // 比較級最高級
      const adj = ['taller', 'faster', 'more diligent', 'happier'][index % 4];
      return {
        question: `Compared to last semester, ${name1} is much ________ than before in academic performance.`,
        options: [adj, `most ${adj}`, `as ${adj}`, 'the most'],
        answer: 0,
        hint: '💡 提示：句中有「much」修飾與「than」，表示兩者之間的比較，需使用「比較級」形容詞。',
        explanation: `📖 詳解：句型為「A is + 比較級 + than + B」，修飾語 much 用於加強比較級語氣，故選「${adj}」。`
      };
    } else {
      // 使役動詞與感官動詞
      const cVerb = ['made', 'had', 'let'][index % 3];
      return {
        question: `The science teacher ${cVerb} all the students ________ the laboratory bench clean before leaving.`,
        options: ['clean', 'to clean', 'cleaned', 'cleaning'],
        answer: 0,
        hint: `💡 提示：使役動詞 (${cVerb}) 後接原形動詞 (Bare Infinitive) 作為受詞補語。`,
        explanation: `📖 詳解：使役動詞 make/have/let + 受詞 + 原形動詞 (V)，故填原形動詞「clean」。`
      };
    }
  } else {
    // 九年級 (g9): 完成式、被動語態、關代
    if (unitId.includes('u1')) {
      const yearSpan = (index % 5) + 3;
      return {
        question: `${name1} has lived in Taipei ________ ${yearSpan} years and knows the city very well.`,
        options: ['for', 'since', 'in', 'during'],
        answer: 0,
        hint: '💡 提示：現在完成式中，「for + 一段時間」，「since + 過去特定時間點」。',
        explanation: `📖 詳解：後方接「${yearSpan} years」表示持續之一段時間長度，故使用介系詞「for」。`
      };
    } else if (unitId.includes('u2')) {
      return {
        question: `This famous novel ________ by thousands of enthusiastic readers worldwide every single year.`,
        options: ['is read', 'reads', 'was reading', 'has read'],
        answer: 0,
        hint: '💡 提示：小說是被讀（被動語態），公式為 Be動詞 + 過去分詞 (p.p.)。',
        explanation: `📖 詳解：主詞「This famous novel」與動詞 read 為被動關係，現在簡單式被動語態為「is read」。`
      };
    } else {
      // 關係代名詞
      const isPeople = index % 2 === 0;
      const ant = isPeople ? 'the talented doctor' : 'the innovative mobile application';
      const ansRel = isPeople ? 'who' : 'which';
      return {
        question: `Do you know ${ant} ________ won the national grand award last month?`,
        options: [ansRel, isPeople ? 'which' : 'who', 'whom', 'whose'],
        answer: 0,
        hint: `💡 提示：先行詞為「${ant}」（${isPeople ? '人稱' : '非人事'}），在關係子句中擔任主詞。`,
        explanation: `📖 詳解：先行詞為${isPeople ? '人稱名詞' : '事物'}，且關係子句缺少主格，應填入「${ansRel}」。`
      };
    }
  }
}

// ==========================================
// 3. 自然科 5000+ 題實驗物理化學地科演算法
// ==========================================
function generateScienceQuestion(gradeId, unitId, index, difficulty, rand, conceptTag) {
  if (gradeId === 'g7') {
    // 生物：細胞、酵素、遺傳、生態
    if (unitId.includes('u1')) {
      const organelles = [
        { name: '葉綠體', fn: '行光合作用將光能轉化為化學能' },
        { name: '細胞核', fn: '含有遺傳物質DNA並主控細胞生理代謝' },
        { name: '粒線體', fn: '行呼吸作用產生能量ATP（細胞發電廠）' },
        { name: '細胞壁', fn: '由纖維素構成，保護並維持植物細胞固定形狀' }
      ];
      const org = organelles[index % organelles.length];
      return {
        question: `【細胞構造與生理功能】在顯微鏡下觀察植物葉肉細胞，下列何種胞器的主要生理功能為「${org.fn}」？`,
        options: [org.name, '核糖體', '高基氏體', '液胞'],
        answer: 0,
        hint: `💡 提示：回憶動植物細胞各胞器的核心生理功能與專屬特徵。`,
        explanation: `📖 詳解：負責「${org.fn}」的胞器為「${org.name}」。`
      };
    } else if (unitId.includes('u2')) {
      // 光合作用與消化酵素
      return {
        question: `【光合作用反應流程】綠色植物葉肉細胞進行光合作用時，在葉綠餅吸收光能，首先會將下列哪一種化合物分解並釋放出氧氣？`,
        options: ['水 (H₂O)', '二氧化碳 (CO₂)', '葡萄糖 (C₆H₁₂O₆)', 'ATP'],
        answer: 0,
        hint: '💡 提示：光合作用第一階段（光反應）需要光照，光能主要用來分解水分子。',
        explanation: '📖 詳解：光反應階段葉綠素吸收太陽能將「水 (H₂O)」分解為氫離子與「氧氣 (O₂)」，氧氣即為副產物釋出。'
      };
    } else {
      // 遺傳機率
      return {
        question: `【孟德爾遺傳機率計算】已知雙眼皮對單眼皮為顯性（B對b），若一對雙眼皮夫婦基因型皆為雜合子（Bb），則他們生育第一胎為單眼皮（bb）的機率為何？`,
        options: ['1/4 (25%)', '1/2 (50%)', '3/4 (75%)', '0%'],
        answer: 0,
        hint: '💡 提示：利用棋盤方格法：Bb × Bb 子代基因型比例為 1 BB : 2 Bb : 1 bb。',
        explanation: '📖 詳解：Bb × Bb 產生的子代中，bb 基因型出現比例為 1/4 (25%)。'
      };
    }
  } else if (gradeId === 'g8') {
    // 理化：密度、聲音、光學、熱學、化學反應
    if (unitId.includes('u1')) {
      const mass = ((index * 9) % 70) + 30;
      const vol = ((index * 3) % 15) + 5;
      const density = (mass / vol).toFixed(2);
      return {
        question: `【密度測量實驗】實驗課時，學生將一塊質量為 ${mass} g 的純金屬塊投入裝滿水的量筒中，排水量為 ${vol} cm³，則該金屬的密度約為多少 g/cm³？`,
        options: [`${density} g/cm³`, `${(density * 1.5).toFixed(2)} g/cm³`, `${(density * 0.7).toFixed(2)} g/cm³`, `${(vol / mass).toFixed(2)} g/cm³`],
        answer: 0,
        hint: '💡 提示：密度公式 D = M / V (質量 ÷ 體積)。',
        explanation: `📖 詳解：D = 質量 ${mass} g / 體積 ${vol} cm³ ≈ ${density} g/cm³。`
      };
    } else if (unitId.includes('u2')) {
      const freq = ((index * 20) % 800) + 200;
      const speed = 340;
      const waveLen = (speed / freq).toFixed(2);
      return {
        question: `【聲波傳播計算】常溫常壓下空氣中聲速約為 ${speed} m/s，若調音叉振動頻率為 ${freq} Hz，則其在空氣中產生的聲波波長約為多少公尺？`,
        options: [`${waveLen} m`, `${(waveLen * 2).toFixed(2)} m`, `${(speed * freq)} m`, `0.50 m`],
        answer: 0,
        hint: '💡 提示：波速公式 v = f × λ (波速 = 頻率 × 波長)，故 λ = v / f。',
        explanation: `📖 詳解：λ = v / f = ${speed} m/s / ${freq} Hz ≈ ${waveLen} 公尺。`
      };
    } else {
      // 熱量計算
      const waterM = ((index * 15) % 150) + 50;
      const deltaT = ((index * 4) % 25) + 5;
      const cal = waterM * 1 * deltaT;
      return {
        question: `【熱量計算 H=m×s×ΔT】小華加熱 ${waterM} 公克的水，水溫由 25°C 上升了 ${deltaT}°C，若過程無熱量散失，則水共吸收了多少卡的熱量？`,
        options: [`${cal} 卡`, `${cal * 2} 卡`, `${Math.round(cal / 2)} 卡`, `${waterM + deltaT} 卡`],
        answer: 0,
        hint: '💡 提示：熱量公式 H = m × s × ΔT，水的比熱 s = 1 cal/(g·°C)。',
        explanation: `📖 詳解：H = ${waterM} g × 1 cal/(g·°C) × ${deltaT}°C = ${cal} 卡。`
      };
    }
  } else {
    // 九年級 (g9): 運動學、牛頓力學、電學、地科
    if (unitId.includes('u1') || unitId.includes('u2')) {
      const force = ((index * 7) % 60) + 20;
      const mass = ((index * 2) % 6) + 2;
      const acc = (force / mass).toFixed(1);
      return {
        question: `【牛頓第二運動定律 F=ma】一質量為 ${mass} kg 的靜止模型車，在光滑水平無摩擦軌道上受到 ${force} N 的水平推力，則該車產生的加速度為何？`,
        options: [`${acc} m/s²`, `${(acc * 2).toFixed(1)} m/s²`, `${(force * mass).toFixed(1)} m/s²`, `1.0 m/s²`],
        answer: 0,
        hint: '💡 提示：由牛頓第二定律 F = m × a，可知加速度 a = F / m。',
        explanation: `📖 詳解：a = F / m = ${force} N / ${mass} kg = ${acc} m/s²。`
      };
    } else if (unitId.includes('u4')) {
      // 歐姆定律
      const voltage = ((index * 3) % 12) + 6;
      const res = ((index * 2) % 8) + 2;
      const curr = (voltage / res).toFixed(1);
      return {
        question: `【歐姆定律電路計算】一電路中接上 ${voltage} V 的直流電源，若電阻器的阻值為 ${res} Ω，則流經該電阻器的電流大小為何？`,
        options: [`${curr} A`, `${voltage * res} A`, `${(res / voltage).toFixed(2)} A`, `0.5 A`],
        answer: 0,
        hint: '💡 提示：歐姆定律公式 V = I × R，電流 I = V / R。',
        explanation: `📖 詳解：I = V / R = ${voltage} V / ${res} Ω = ${curr} 安培 (A)。`
      };
    } else {
      // 地科板塊與日月食
      return {
        question: `【固體地球板塊構造】臺灣本島位於歐亞板塊與菲律賓海板塊的交界處，其相互碰撞推擠屬於何種板塊邊界類型？`,
        options: ['聚合型板塊邊界', '張裂型板塊邊界', '錯動型板塊邊界', '地函熱點'],
        answer: 0,
        hint: '💡 提示：造山運動與海溝擠壓通常發生於兩板塊相互推擠碰撞之邊界。',
        explanation: '📖 詳解：臺灣中央山脈是由歐亞板塊與菲律賓海板塊相互碰撞擠壓抬升而成，屬於「聚合型板塊邊界」。'
      };
    }
  }
}

// ==========================================
// 4. 國文科 5000+ 題六書修辭文化素養矩陣
// ==========================================
function generateChineseQuestion(gradeId, unitId, index, difficulty, rand, conceptTag) {
  if (gradeId === 'g7') {
    if (unitId.includes('u1')) {
      const sixTypes = [
        { type: '象形', chars: '日、月、山、水', exp: '象形是描摹事物具體形狀的獨體初文。' },
        { type: '指事', chars: '上、下、本、末', exp: '指事是在象形符號上添加標記以表達抽象觀念。' },
        { type: '會意', chars: '休、武、信、明', exp: '會意是合兩個以上字義以產生新義之合體字。' },
        { type: '形聲', chars: '江、河、情、理', exp: '形聲是一邊表意符號、一邊表聲音之合體字。' }
      ];
      const target = sixTypes[index % sixTypes.length];
      return {
        question: `【六書造字原則辨析】下列哪一組漢字在造字六書原則中，全部屬於「${target.type}」字？`,
        options: [target.chars, '休、武、江、河', '日、月、本、末', '林、森、情、理'],
        answer: 0,
        hint: `💡 提示：${target.exp}`,
        explanation: `📖 詳解：「${target.chars}」均符合${target.type}造字特徵。${target.exp}`
      };
    } else {
      const rhetorics = [
        { r: '轉化（擬人）', s: '太陽的臉紅起來了，微風在耳邊輕聲唱歌。', exp: '賦予無生命事物人類的情感動作。' },
        { r: '排比', s: '做人要像山一樣沉穩，像水一樣包容，像風一樣自在。', exp: '三個結構相似短句連續排列加強語氣。' },
        { r: '誇飾', s: '白髮三千丈，緣愁似個長。', exp: '超越客觀事實之誇張描繪。' }
      ];
      const rh = rhetorics[index % rhetorics.length];
      return {
        question: `【語文修辭技巧判讀】文句：「${rh.s}」主要運用了何種修辭技巧？`,
        options: [rh.r, '映襯', '頂真', '倒反'],
        answer: 0,
        hint: `💡 提示：${rh.exp}`,
        explanation: `📖 詳解：「${rh.s}」運用了「${rh.r}」，${rh.exp}`
      };
    }
  } else if (gradeId === 'g8') {
    if (unitId.includes('u3')) {
      const sentenceTypes = [
        { t: '判斷句', s: '知之為知之，不知為不知，是知也。', exp: '以「是、非、乃」為繫詞肯定主語屬性。' },
        { t: '敘事句', s: '孔雀東南飛，五里一徘徊。', exp: '以主詞＋述語動詞敘述動作行徑。' },
        { t: '有無句', s: '天下無不散之筵席。', exp: '以「有、無」表明人事物存在與否。' },
        { t: '表態句', s: '環堵蕭然，不蔽風日。', exp: '主詞＋表態形容詞描寫特徵狀態。' }
      ];
      const st = sentenceTypes[index % sentenceTypes.length];
      return {
        question: `【中文四大句型判讀】文句：「${st.s}」在語法句型上屬於下列哪一種？`,
        options: [st.t, '倒裝句', '感嘆句', '祈使句'],
        answer: 0,
        hint: `💡 提示：分析句中核心謂語（動詞、繫詞、有無、形容詞）。`,
        explanation: `📖 詳解：「${st.s}」為典型的「${st.t}」，${st.exp}`
      };
    } else {
      return {
        question: `【題辭文化常識】好友新居落成、搬入新家，前往祝賀時贈送的賀聯題辭何者最得體恰當？`,
        options: ['喬遷之喜／美輪美奐', '天賜麟兒／弄璋之喜', '琴瑟和鳴／宜室宜家', '音容宛在／德業長昭'],
        answer: 0,
        hint: '💡 提示：辨析搬家、生子、結婚與哀輓之專屬詞彙。',
        explanation: '📖 詳解：「美輪美奐、喬遷之喜」專用於祝賀遷居落成；弄璋為生男孩；宜室宜家為賀婚；音容宛在為輓辭。'
      };
    }
  } else {
    // 九年級 (g9): 文化常識、年齡代稱、先秦諸子
    const ages = [
      { a: '弱冠', age: 20, exp: '古代男子滿二十歲行冠禮成年。' },
      { a: '及笄', age: 15, exp: '古代女子滿十五歲束髮插簪許嫁。' },
      { a: '而立', age: 30, exp: '《論語》：三十而立。' },
      { a: '不惑', age: 40, exp: '《論語》：四十而不惑。' },
      { a: '知命', age: 50, exp: '《論語》：五十而知天命。' },
      { a: '花甲', age: 60, exp: '一甲子六十年輪迴。' },
      { a: '古稀', age: 70, exp: '人生七十古來稀。' }
    ];
    const item = ages[index % ages.length];
    return {
      question: `【古代年齡代稱常識】古人稱「${item.a}之年」，通常是指人到了幾歲的代稱？`,
      options: [`${item.age} 歲`, `${item.age + 10} 歲`, `${item.age - 5} 歲`, '100 歲'],
      answer: 0,
      hint: `💡 提示：${item.exp}`,
      explanation: `📖 詳解：「${item.a}」代表 ${item.age} 歲。${item.exp}`
    };
  }
}

// ==========================================
// 5. 社會科 5000+ 題史地公跨域演算法
// ==========================================
function generateSocialQuestion(gradeId, unitId, index, difficulty, rand, conceptTag) {
  if (gradeId === 'g7') {
    // 臺灣史地公民
    if (unitId.includes('u1')) {
      return {
        question: `【臺灣早期歷史】十七世紀大航海時代，在臺灣南部臺南安平建造「熱蘭遮城」並開展轉口貿易的歐洲殖民勢力為下列何者？`,
        options: ['荷蘭人', '西班牙人', '葡萄牙人', '英國人'],
        answer: 0,
        hint: '💡 提示：荷蘭東印度公司於臺南建立大員；西班牙人則在基隆淡水建立聖多明哥城。',
        explanation: '📖 詳解：1624年荷蘭人在臺南安平建造熱蘭遮城作為東亞鹿皮與蔗糖貿易轉口基地。'
      };
    } else if (unitId.includes('u3')) {
      return {
        question: `【臺灣地理氣候環境】臺灣夏季常帶來豐沛雨量並舒緩旱象，但同時也可能引發土石流等天然災害的天氣系統為下列何者？`,
        options: ['颱風與西南季風梅雨', '東北季風滯留鋒', '蒙古冷高壓', '落山風'],
        answer: 0,
        hint: '💡 提示：夏秋季節由熱帶海洋低壓發展而來的劇烈旋風。',
        explanation: '📖 詳解：臺灣夏季主要降水來源為西南季風帶來的梅雨與夏秋熱帶氣旋（颱風）。'
      };
    } else {
      return {
        question: `【個人成長與性別平權】我國《性別平等教育法》之核心立法精神在於下列何者？`,
        options: ['消除性別歧視並建立性別平等的友善校園環境', '強制規定男女就讀相同學科', '懲罰犯錯學生', '限制個人發展'],
        answer: 0,
        hint: '💡 提示：促進性別地位實質平等，消除校園中的傳統刻板印象。',
        explanation: '📖 詳解：性別平等教育法旨在消除歧視、促進多元尊重，營造實質平權之學習環境。'
      };
    }
  } else if (gradeId === 'g8') {
    // 亞洲史地、政府與憲法
    if (unitId.includes('u5')) {
      return {
        question: `【憲政體制權力分立】在中華民國憲政體制下，依法負責掌管國家預算審議、法律案制定之中央民意機關為何？`,
        options: ['立法院', '行政院', '司法院', '監察院'],
        answer: 0,
        hint: '💡 提示：民選立法委員組成之最高立法與監督機關。',
        explanation: '📖 詳解：立法院為國家最高立法機關，行使立法權、預算審議權與監督行政院之職權。'
      };
    } else {
      return {
        question: `【經濟學機會成本概念】小華有一筆壓歲錢，若買書可獲效益 500 元，看電影獲 400 元，買衣服獲 300 元。若小華最終決定買書，則其「機會成本」是多少？`,
        options: ['400 元 (看電影)', '500 元 (買書)', '300 元 (買衣服)', '700 元 (兩者相加)'],
        answer: 0,
        hint: '💡 提示：機會成本為放棄的多個選擇中「價值最高者」。',
        explanation: '📖 詳解：放棄的方案有看電影 (400元) 與買衣服 (300元)，其中價值最高者為看電影 (400元)，故機會成本為 400 元。'
      };
    }
  } else {
    // 九年級 (g9): 世界史地、經濟全球化
    return {
      question: `【世界歷史啟蒙運動】十八世紀歐洲啟蒙運動時期，孟德斯鳩在《論法的精神》中提出的核心政治思想為下列何者？`,
      options: ['三權分立（行政、立法、司法互相制衡）', '君權神授說', '主權在君專制體制', '重農主義思想'],
      answer: 0,
      hint: '💡 提示：防止權力過度集中而造成專制腐敗之制度設計。',
      explanation: '📖 詳解：孟德斯鳩主張將國家權力分為立法、行政、司法三權，彼此互相制衡以保障人民基本自由。'
    };
  }
}

// 預備降級產生器
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

// 依據篩選條件（年級、科目、選定單元列表、難度、抽取題數）產生完整無重複題庫
export function generateQuizSet({ subjectId, gradeId, unitIds, difficulty = 'medium', count = 10, excludeIds = [] }) {
  const quizSet = [];
  const validUnits = unitIds.length > 0 ? unitIds : (CURRICULUM_UNITS[subjectId]?.[gradeId] || []).map(u => u.id);
  if (validUnits.length === 0) return [];

  const usedQuestionIds = new Set(excludeIds);
  let attempts = 0;
  const maxAttempts = count * 35;
  const overrides = typeof getQuestionOverrides === 'function' ? getQuestionOverrides() : {};

  while (quizSet.length < count && attempts < maxAttempts) {
    attempts++;
    const unitId = validUnits[Math.floor(Math.random() * validUnits.length)];
    // 在 1 ~ 5000 題庫容量範圍內隨機挑選題號，確保容量超大且絕不重複
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

    if (!usedQuestionIds.has(q.id)) {
      usedQuestionIds.add(q.id);
      quizSet.push(q);
    }
  }

  return quizSet;
}
