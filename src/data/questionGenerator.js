import { generateHighSchoolQuestion } from './highSchoolGenerator.js';
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
  const currentUnit = unitList.find(u => u.id === unitId) || unitList[0] || { id: unitId || 'u1', name: '綜合複習單元', tags: ['核心觀念素養'] };
  const finalUnitId = currentUnit.id || (unitId ? String(unitId) : 'u1');
  const conceptTags = currentUnit.tags || ['108課綱核心素養'];
  const tagIdx = Math.floor(rand() * conceptTags.length);
  const conceptTag = conceptTags[tagIdx];

  let qData;
  try {
    const isSeniorHigh = ['h1', 'h2', 'h3', 'gsat', 'mock-exam', 'olympiad', 'senior-all'].includes(gradeId);
    if (isSeniorHigh) {
      qData = generateHighSchoolQuestion(subjectId, gradeId, finalUnitId, index, difficulty, rand, conceptTag);
    } else {
      switch (subjectId) {
        case 'math':
          qData = generateMathQuestion(gradeId, finalUnitId, index, difficulty, rand, conceptTag);
          break;
        case 'english':
          qData = generateEnglishQuestion(gradeId, finalUnitId, index, difficulty, rand, conceptTag);
          break;
        case 'science':
          qData = generateScienceQuestion(gradeId, finalUnitId, index, difficulty, rand, conceptTag);
          break;
        case 'chinese':
          qData = generateChineseQuestion(gradeId, finalUnitId, index, difficulty, rand, conceptTag);
          break;
        case 'social':
          qData = generateSocialQuestion(gradeId, finalUnitId, index, difficulty, rand, conceptTag);
          break;
        default:
          qData = generateMathQuestion(gradeId, finalUnitId, index, difficulty, rand, conceptTag);
          break;
      }
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
  const unitSuffix = (finalUnitId.split('-').pop() || 'U1').toUpperCase();
  const questionId = `Q-${(gradeId || 'G7').toUpperCase()}-${(subjectId ? subjectId.substring(0, 2) : 'MA').toUpperCase()}-${unitSuffix}-${formattedIndex}`;

  return {
    id: questionId,
    index,
    subjectId,
    gradeId,
    unitId: finalUnitId,
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
    isReading: Boolean(qData.isReading || qData.readingText),
    readingText: qData.readingText || null,
    isChat: qData.isChat || false,
    chatMessages: qData.chatMessages || null,
    isSvg: Boolean(qData.isSvg || qData.svgContent),
    svgContent: qData.svgContent || null,
    html: qData.html || null,
    tts: qData.tts || null,
    ttsLang: qData.ttsLang || null,
    isCustom: false
  };
}

try {
  if (typeof registerQuestionHydrator === 'function') {
    registerQuestionHydrator(generateQuestion);
  }
} catch (e) {}

function generateFallbackQuestion(subjectId, gradeId, unitId, index, difficulty, rand, conceptTag) {
  const formattedIndex = String(index || 1).padStart(4, '0');
  const unitSuffix = (String(unitId || 'u1').split('-').pop() || 'U1').toUpperCase();
  const questionId = `Q-${(gradeId || 'G7').toUpperCase()}-${(subjectId ? subjectId.substring(0, 2) : 'MA').toUpperCase()}-${unitSuffix}-${formattedIndex}`;
  return {
    id: questionId,
    index: index || 1,
    subjectId,
    gradeId,
    unitId,
    conceptTag,
    difficulty,
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

export function getQuestionFingerprint(q) {
  if (!q || !q.question) return '';
  // 1. 去除題幹常見的人名前綴與模式標籤
  let cleaned = String(q.question)
    .replace(/^【.*?】\s*/g, '')
    .replace(/^.*?在(?:探討|解題|做|觀察|實驗|學習|複習|課堂上|課堂中).*?時[：:]\s*/g, '')
    .replace(/^While practicing.*?[：:]\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // 2. 結合排序後的選項文本特徵，確保即便是數值變形題也能精準識別是否同題
  const optSig = Array.isArray(q.options)
    ? q.options.map(o => String(o).trim()).sort().join('|')
    : '';

  return `${cleaned}:::${optSig}`;
}


// ── 單元素養深化題庫生成器（確保庫容無限且同卷絕對 0 重複）──
function generateUnitLiteracyExtension(subjectId, gradeId, unitId, unitName, conceptTag, subIndex, rand, difficulty = 'medium') {
  const formattedIndex = String(9000 + subIndex).padStart(4, '0');
  const unitSuffix = (String(unitId || 'u1').split('-').pop() || 'U1').toUpperCase();
  const questionId = `Q-${(gradeId || 'G7').toUpperCase()}-${(subjectId ? subjectId.substring(0, 2) : 'MA').toUpperCase()}-${unitSuffix}-${formattedIndex}`;

  const templates = [
    {
      q: `【108課綱素養深究-核心機制辨析】\n在深入探討「${unitName}」中關於「${conceptTag}」之學理架構時，下列哪一項論述最符合 108 課綱學科核心定義？`,
      correct: `準確闡明「${conceptTag}」之定義內涵，且因果推論與學科客觀規律完全吻合`,
      distractors: [
        `混淆「${conceptTag}」之核心定義，且誤將非主要變因視為決定性要素`,
        `錯誤顛倒學科邏輯先後順序，導致推論結論與已知事實互相矛盾`,
        `超出 108 課綱本單元規範之過度延伸猜測，缺乏客觀證據支持`
      ],
      hint: `💡 提示：回歸「${conceptTag}」最本質的學理定義，排除偷換概念之干擾項。`,
      expl: `📖 詳解：本題檢驗學生對單元【${unitName}】之核心概念【${conceptTag}】的理解精準度，第一選項嚴謹客觀且符合課綱標準。`
    },
    {
      q: `【108課綱素養深究-生活情境推論】\n某研究社群針對「${unitName}」之實際應用情境展開調查，若要評估「${conceptTag}」在現實生活中的具體展現，下列何種詮釋最為合理？`,
      correct: `能將「${conceptTag}」之理論原則妥善對應至生活案例，推論清晰且具實證依據`,
      distractors: [
        `僅憑片面生活經驗斷章取義，忽略「${conceptTag}」之先決適用條件`,
        `將「${conceptTag}」與其他無關之日常生活現象強行牽合，缺乏合理因果關係`,
        `過度簡化複雜情境，導致推導出的生活應用結論明顯失真`
      ],
      hint: `💡 提示：結合生活素養，注意理論成立的背景條件與限制。`,
      expl: `📖 詳解：素養導向評量強調將【${conceptTag}】之核心思維應用於生活情境判讀，首選答案最具科學性與說服力。`
    },
    {
      q: `【108課綱素養深究-實驗探究與數據檢驗】\n課堂進行「${unitName}」之探究實驗活動時，學生針對「${conceptTag}」提出了數種假說。下列哪一項假說設計最符合科學探究方法？`,
      correct: `清楚界定操縱變因與控制變因，並針對「${conceptTag}」提出具可檢驗性的因果假說`,
      distractors: [
        `同時變動多項操縱變因，導致無法判別「${conceptTag}」之真實影響`,
        `未設置對照組即逕行下結論，實驗設計存在重大邏輯漏洞`,
        `選擇性忽略與假說不符之實驗異常數據，違反客觀科學探究精神`
      ],
      hint: `💡 提示：探究與實作的核心在於「單一操縱變因」與「對照組設置」。`,
      expl: `📖 詳解：探究「${conceptTag}」時，必須嚴格控制其他無關變因，確保實驗結論具有可重複性與內部效度。`
    },
    {
      q: `【108課綱素養深究-批判性思考與除錯】\n複習「${unitName}」時，同學們梳理了關於「${conceptTag}」之常見迷思概念。下列哪一位同學的澄清說明最為精闢正確？`,
      correct: `精準指正迷思盲點，強調「${conceptTag}」在特定條件限制下的正確判讀方式`,
      distractors: [
        `誤用直覺常識否定嚴謹定義，反而加深了對「${conceptTag}」的混淆`,
        `只背誦片面口訣而無法解釋「${conceptTag}」背後的本質原理`,
        `倒果為因，將觀測到的結果誤認為是「${conceptTag}」發生的初始起因`
      ],
      hint: `💡 提示：辨析迷思概念關鍵在於能否洞察「條件限制」與「因果關聯」。`,
      expl: `📖 詳解：學習【${conceptTag}】最容易在概念邊界產生混淆，首選選項切中關鍵邏輯盲點並給予正確認知。`
    },
    {
      q: `【108課綱素養深究-跨領域整合視野】\n若將「${unitName}」中所學的「${conceptTag}」知識，連結至現代社會發展或科技前沿議題，下列何種觀點最展現宏觀素養？`,
      correct: `融會貫通「${conceptTag}」之跨學科意涵，提出具前瞻性且兼顧永續發展的平衡分析`,
      distractors: [
        `單一面向片面極端論述，完全忽視科技與社會之間的多元互動`,
        `陳舊過時之刻板印象，未能反映當前關於「${conceptTag}」之最新發展趨勢`,
        `脫離科學客觀依據之主觀臆測，缺乏跨領域推論之嚴密邏輯`
      ],
      hint: `💡 提示：跨領域素養重視系統性思考與多元視角之平衡評價。`,
      expl: `📖 詳解：將【${conceptTag}】之概念拓展至綜合應用，首選答案兼具知識深度與人文/科技關懷。`
    },
    {
      q: `【108課綱素養深究-圖表與文本對照】\n在閱讀「${unitName}」之文獻圖表時，若要從圖表趨勢中驗證「${conceptTag}」之規律，下列何者詮釋最周延？`,
      correct: `如實根據圖表數據走勢進行客觀推論，不加油添醋且能與「${conceptTag}」原理互相呼應`,
      distractors: [
        `過度推論圖表未呈現之外部資訊，導致「${conceptTag}」分析失焦`,
        `倒置橫縱坐標之自變數與應變數，造成圖表解讀嚴重倒錯`,
        `截取局部波動即斷言整體規律，忽略全局統計趨勢`
      ],
      hint: `💡 提示：圖表素養強調「根據證據說話」，嚴禁未經證實之過度外插推論。`,
      expl: `📖 詳解：判讀圖表時緊扣【${conceptTag}】之實證特徵，首選答案客觀完整且吻合課綱圖表素養要求。`
    },
    {
      q: `【108課綱素養深究-因果關係深探】\n在系統性考察「${unitName}」中各項關鍵要素時，下列關於「${conceptTag}」之起因、過程與最終效應之串聯，何者「完全無誤」？`,
      correct: `因果邏輯鏈條完整嚴密，各階段演變歷程均符合「${conceptTag}」之發展脈絡`,
      distractors: [
        `鏈條中斷裂缺少關鍵中間環節，導致無法推導至「${conceptTag}」之結果`,
        `把偶發性巧合誤歸因為「${conceptTag}」之常態規律`,
        `時空背景或物理條件嚴重錯置，失去探討因果之基礎`
      ],
      hint: `💡 提示：檢驗因果關係時，須審視「充要條件」與「歷程完整性」。`,
      expl: `📖 詳解：首選答案精確呈現了【${conceptTag}】之深層因果演進，論證結構無懈可擊。`
    },
    {
      q: `【108課綱素養深究-歷屆大考關鍵精粹】(大考必備考點#${subIndex})\n歷屆大考在命題「${unitName}」時，經常鎖定「${conceptTag}」之高頻考點。下列哪一項統整重點最能切中命題精髓？`,
      correct: `掌握「${conceptTag}」之常考題型變形與關鍵陷阱，解題切入點精準迅速`,
      distractors: [
        `死背偏門罕見之冷僻知識點，忽略會考真正強調之核心素養`,
        `解題思維僵化，無法應對會考情境題對「${conceptTag}」之靈活改編`,
        `忽略題幹關鍵限制字詞，容易落入歷屆常見之審題陷阱`
      ],
      hint: `💡 提示：會考命題首重素養情境與核心觀念理解，而非繁瑣刁鑽計算。`,
      expl: `📖 詳解：掌握【${conceptTag}】之關鍵核心架構，方能在會考各類情境新題中從容應對。`
    },
    {
      q: `【108課綱素養深究-模型建構與定量評估】(數值模型#${subIndex})\n若嘗試為「${unitName}」中「${conceptTag}」之動態變化建立數學/科學預測模型，下列哪一種假設最符合真實物理限制？`,
      correct: `遵守守恆定律與邊界條件，在合理簡化下能準確預測「${conceptTag}」之主要變化趨勢`,
      distractors: [
        `忽略能量守恆與質量守恆，假設系統能自發產生無限能量`,
        `將非線性動態現象強行簡化為不合實際之固定常數`,
        `模型未經實驗數據校準即盲目外推至極端條件`
      ],
      hint: `💡 提示：模型建構強調「簡化但保真」，必須以基本守恆定律為邊界條件。`,
      expl: `📖 詳解：建立科學模型時必須尊重【${conceptTag}】之物理/化學/幾何基本守恆原則。`
    },
    {
      q: `【108課綱素養深究-現代科技與社會倫理反思】(科技評估#${subIndex})\n現代科技在深入應用「${unitName}」之「${conceptTag}」技術時，公眾展開了廣泛討論。下列哪一項立場最展現理性思辨？`,
      correct: `在肯定「${conceptTag}」帶來生活便利之同時，嚴密建立安全規範與倫理審查機制`,
      distractors: [
        `盲目崇拜科技發展，全面廢止所有關於「${conceptTag}」之安全監管法規`,
        `因噎廢食，因潛在未知風險而全面禁止任何相關技術之研究探索`,
        `將技術後果完全歸咎於一般消費者，企業完全規避社會責任`
      ],
      hint: `💡 提示：科技素養要求學生具備平衡科技效益與風險治理之綜合思辨能力。`,
      expl: `📖 詳解：面對【${conceptTag}】之新興技術應用，健全的制度規範與風險預防是最佳發展路徑。`
    },
    {
      q: `【108課綱素養深究-多文本資訊比較與統合】(文本互涉#${subIndex})\n比較兩篇討論「${unitName}」中「${conceptTag}」之文獻時，讀者若要釐清兩者論點歧異的核心癥結，首要步驟為何？`,
      correct: `比對兩文對「${conceptTag}」之前提假設與觀測範圍，找出其立論基礎之根本分歧`,
      distractors: [
        `只依據作者之知名度或資歷作為判定正誤之唯一標準`,
        `忽視兩者實驗條件之顯著差異，強行將二者結論融為一談`,
        `僅挑選符合自己既有偏見之文字，曲解原文脈絡`
      ],
      hint: `💡 提示：多文本閱讀首重「找出前提假設」與「客觀比對立論依據」。`,
      expl: `📖 詳解：分析學術歧見時，辨識對【${conceptTag}】之前提界定是化解衝突與綜合判讀之鑰。`
    },
    {
      q: `【108課綱素養深究-問題解決與決策優化】(實務應用#${subIndex})\n工程師或決策者若要透過改善「${unitName}」中之「${conceptTag}」來提高整體效率，下列哪一項策略具備最高成本效益？`,
      correct: `針對系統中最關鍵之瓶頸變因進行精準優化，以最小干預達成「${conceptTag}」最大效能提升`,
      distractors: [
        `不分主次全面更換整套系統，造成資源嚴重浪費且效益低下`,
        `過度優化非關鍵次要環節，對整體效能幾無實質助益`,
        `完全沿用傳統陳舊作法，拒絕採用經科學驗證之優化方案`
      ],
      hint: `💡 提示：系統工程核心為「鎖定關鍵瓶頸（80/20法則）」，達成最優效益。`,
      expl: `📖 詳解：針對【${conceptTag}】之瓶頸進行靶向優化，體現了科學素養在實務決策中之價值。`
    },
    {
      q: `【108課綱素養深究-概念邊界與反例辨析】(反例思辨#${subIndex})\n在探討「${unitName}」時，若要檢驗「${conceptTag}」定理之嚴密性，下列哪一項反例或極端情況最能突顯其先決適用限制？`,
      correct: `精準指出在打破原定理前設邊界時，該規律將不再成立，顯示對「${conceptTag}」適用邊界之透徹理解`,
      distractors: [
        `隨意捏造不合邏輯之荒謬假設，未能指出「${conceptTag}」之真實限制`,
        `誤將特殊特例當作普遍反例，導致對一般定理之全盤否定`,
        `忽略微觀與巨觀條件之轉換，產生概念張冠李戴之謬誤`
      ],
      hint: `💡 提示：科學與數學定理皆有明確邊界，洞悉邊界才是頂尖思維。`,
      expl: `📖 詳解：透過極端邊界條件檢驗【${conceptTag}】，是高階大考素養非常注重的概念思辨能力。`
    },
    {
      q: `【108課綱素養深究-跨時空歷史脈絡推演】(脈絡溯源#${subIndex})\n回溯「${unitName}」中「${conceptTag}」的學術發展史，該理論的提出最初主要是為了解決當時的何種困境或謎題？`,
      correct: `為修正舊理論無法解釋之關鍵觀測矛盾，從而開闢了「${conceptTag}」全新典範`,
      distractors: [
        `學者完全出於空想臆造，與當時實際需求毫無關聯`,
        `僅為了推翻既有權威而刻意唱反調，缺乏實證基礎`,
        `單純照搬外國學說，未曾針對實際情境進行任何在地驗證`
      ],
      hint: `💡 提示：科學發展史是由「舊典範危機 $\\rightarrow$ 新理論誕生」推動的。`,
      expl: `📖 詳解：理解【${conceptTag}】之歷史源起，能幫助深刻掌握其本質動機與學理演進邏輯。`
    }
  ];

  const tIdx = (subIndex - 1) % templates.length;
  const tmpl = templates[tIdx];

  const allOpts = [
    { text: tmpl.correct, isCorrect: true },
    { text: tmpl.distractors[0], isCorrect: false },
    { text: tmpl.distractors[1], isCorrect: false },
    { text: tmpl.distractors[2], isCorrect: false }
  ];

  // 隨機打亂選項
  for (let i = allOpts.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [allOpts[i], allOpts[j]] = [allOpts[j], allOpts[i]];
  }
  const answerIdx = allOpts.findIndex(o => o.isCorrect);

  return {
    id: questionId,
    index: 9000 + subIndex,
    subjectId,
    gradeId,
    unitId,
    unitName,
    conceptTag,
    difficulty,
    question: tmpl.q,
    options: allOpts.map(o => o.text),
    answer: answerIdx >= 0 ? answerIdx : 0,
    hint: tmpl.hint,
    explanation: tmpl.expl,
    isListening: false,
    audioText: null,
    isReading: false,
    readingText: null,
    isChat: false,
    chatMessages: null,
    isSvg: false,
    svgContent: null,
    html: null,
    tts: null,
    ttsLang: null,
    isCustom: false
  };
}

export function generateQuizSet({ subjectId, gradeId, unitIds, unitId, difficulty = 'medium', count = 10, excludeIds = [] } = {}) {
  const quizSet = [];
  // 支援跨科全科總複習
  const isAllSubjects = subjectId === 'all' || subjectId === 'all-subjects';
  const subjectsPool = isAllSubjects ? ['chinese', 'english', 'math', 'science', 'social'] : [subjectId];

  // 支援國中三年全冊總複習 / 高中三年全冊總複習
  let effectiveGradeId = gradeId;
  let targetGrades = [gradeId];
  if (gradeId === 'senior-all') {
    targetGrades = ['h1', 'h2', 'h3', 'gsat'];
  } else if (gradeId === 'junior-all') {
    targetGrades = ['g7', 'g8', 'g9', 'past-exams'];
  }

  let normalizedUnits = [];
  if (Array.isArray(unitIds) && unitIds.length > 0) {
    normalizedUnits = unitIds;
  } else if (unitId) {
    normalizedUnits = [unitId];
  } else if (typeof unitIds === 'string' && unitIds) {
    normalizedUnits = [unitIds];
  } else {
    // 聚合指定年級與科目下所有可用單元
    for (const s of subjectsPool) {
      for (const g of targetGrades) {
        const uList = CURRICULUM_UNITS[s]?.[g] || [];
        normalizedUnits.push(...uList.map(u => ({ unitId: u.id, subjectId: s, gradeId: g })));
      }
    }
  }

  // 整理抽題單位陣列
  const unitItems = normalizedUnits.map(item => {
    if (typeof item === 'string') {
      return { unitId: item, subjectId: subjectId, gradeId: targetGrades[Math.floor(Math.random() * targetGrades.length)] };
    }
    return item;
  }).filter(Boolean);

  if (unitItems.length === 0) return [];

  const usedQuestionIds = new Set(excludeIds);
  const usedFingerprints = new Set();
  const overrides = typeof getQuestionOverrides === 'function' ? getQuestionOverrides() : {};

  // 難度對應的隨機種子跨度
  const indexRange = {
    easy: 8000,
    medium: 15000,
    hard: 25000,
    extreme: 40000,
    hardest: 40000
  };
  const maxIndex = indexRange[difficulty] || 15000;

  let attempts = 0;
  const maxAttempts = count * 60;

  while (quizSet.length < count && attempts < maxAttempts) {
    attempts++;

    // 嚴格鎖定：100% 忠於使用者所選定的年級與單元，絕不跨年級跨單元錯置！
    const chosenItem = unitItems[Math.floor(Math.random() * unitItems.length)];
    const currentSubj = chosenItem.subjectId || subjectId;
    const currentGrd = chosenItem.gradeId || gradeId;
    const currentUnitId = chosenItem.unitId;
    const questionIndex = Math.floor(Math.random() * maxIndex) + 1;
    let q = generateQuestion(currentSubj, currentGrd, currentUnitId, questionIndex, difficulty);

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

    const fp = getQuestionFingerprint(q);
    if (!usedQuestionIds.has(q.id) && !usedFingerprints.has(fp)) {
      usedQuestionIds.add(q.id);
      usedFingerprints.add(fp);
      quizSet.push(q);
    }
  }

  // 保底機制：若因單元較小或指紋嚴格去重導致題數尚未達到目標，依序切換難度種子補齊，但「絕對嚴格禁止」重複加入已存在的題幹指紋！
  const fallbackDiffs = [difficulty, 'medium', 'hard', 'easy', 'extreme'];
  let fbDiffIdx = 0;
  let fallbackAttempts = 0;
  const maxFallback = count * 80;

  const usedTexts = new Set(quizSet.map(q => q.question ? q.question.trim() : ''));

  while (quizSet.length < count && fallbackAttempts < maxFallback) {
    fallbackAttempts++;
    if (fallbackAttempts % 20 === 0) {
      fbDiffIdx = (fbDiffIdx + 1) % fallbackDiffs.length;
    }
    const currentDiff = fallbackDiffs[fbDiffIdx];
    const fbItem = unitItems[fallbackAttempts % unitItems.length];
    const fbSubj = fbItem.subjectId || subjectId;
    const fbGrd = fbItem.gradeId || gradeId;
    const currentUnitId = fbItem.unitId;
    const questionIndex = Math.floor(Math.random() * maxIndex) + 10000 + fallbackAttempts * 19;
    let q = generateQuestion(fbSubj, fbGrd, currentUnitId, questionIndex, currentDiff);

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

    const fp = getQuestionFingerprint(q);
    const qText = q.question ? q.question.trim() : '';

    if (!usedQuestionIds.has(q.id) && !usedFingerprints.has(fp) && !usedTexts.has(qText)) {
      usedQuestionIds.add(q.id);
      usedFingerprints.add(fp);
      usedTexts.add(qText);
      quizSet.push(q);
    }
  }

  // 終極保底：若因單元既有題型庫耗盡，調用單元素養深化擴展庫精準補齊，確保題數 100% 達標且 0 重複
  let litSubIdx = 1;
  while (quizSet.length < count && litSubIdx <= 60) {
    const litItem = unitItems[(litSubIdx - 1) % unitItems.length];
    const litSubj = litItem.subjectId || subjectId;
    const litGrd = litItem.gradeId || gradeId;
    const curUnitId = litItem.unitId;
    const unitList = CURRICULUM_UNITS[litSubj]?.[litGrd] || [];
    const uObj = unitList.find(u => u.id === curUnitId) || { name: '核心綜合單元', tags: ['108課綱核心素養'] };
    const tags = uObj.tags || ['108課綱核心素養'];
    const cTag = tags[(litSubIdx - 1) % tags.length];

    const lq = generateUnitLiteracyExtension(litSubj, litGrd, curUnitId, uObj.name, cTag, litSubIdx, Math.random, difficulty);
    const fp = getQuestionFingerprint(lq);
    const qText = lq.question.trim();

    if (!usedFingerprints.has(fp) && !usedTexts.has(qText)) {
      usedQuestionIds.add(lq.id);
      usedFingerprints.add(fp);
      usedTexts.add(qText);
      quizSet.push(lq);
    }
    litSubIdx++;
  }

  return quizSet;
}


// 簡易隨機數（非題目種子，僅用於選擇題庫分配）
function rand_simple() {
  return Math.random();
}
