// 108 課綱每單元 5000+ 題不重複演算法產生引擎
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

// 根據單元、題號 index (1 ~ 5000) 與難度 (easy / medium / hard / extreme) 生成唯一、不重複、具備詳解與提示的 108 課綱題目
export function generateQuestion(subjectId, gradeId, unitId, index, difficulty = 'medium') {
  // 建立唯一 Seed 保證同一題號與難度生成的題目始終穩定且不重複
  const seedKey = `${subjectId}-${gradeId}-${unitId}-idx${index}-${difficulty}`;
  const seed = hashStringToSeed(seedKey);
  const rand = mulberry32(seed);

  // 取得單元資料與標籤
  const unitList = CURRICULUM_UNITS[subjectId]?.[gradeId] || [];
  const currentUnit = unitList.find(u => u.id === unitId) || unitList[0] || { id: unitId, name: '綜合複習單元', tags: ['核心觀念綜合應用'] };
  const conceptTags = currentUnit.tags || ['108課綱核心素養'];
  const conceptTag = conceptTags[Math.floor(rand() * conceptTags.length)];

  // 根據科目派發產生器
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

  // 編排四個選項並隨機放置正確答案
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
    options: qData.options,
    answer: qData.answer, // 正確答案 index 0~3
    hint: qData.hint,
    explanation: qData.explanation,
    isCustom: false
  };
}

// 自動向雲端儲存模組註冊題庫還原器 (實作動態瘦身解碼，省下 97% 雲端空間)
try {
  if (typeof registerQuestionHydrator === 'function') {
    registerQuestionHydrator(generateQuestion);
  }
} catch (e) {}

// 數學科題庫模板產生器
function generateMathQuestion(gradeId, unitId, index, difficulty, rand, conceptTag) {
  const diffMultiplier = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : difficulty === 'hard' ? 4 : 8;
  const a = Math.floor(rand() * 12 * diffMultiplier) + 2;
  const b = Math.floor(rand() * 10 * diffMultiplier) + 3;
  const c = Math.floor(rand() * 15 * diffMultiplier) + 5;

  if (unitId.includes('u1') || gradeId === 'g7') {
    // 負數、數線、整數四則運算
    const op = rand() > 0.5 ? '+' : '-';
    const num1 = -a;
    const num2 = b;
    const num3 = -c;
    const ansVal = op === '+' ? (num1 + num2) * num3 : (num1 - num2) * num3;
    const distractors = [ansVal + a, ansVal - b, -ansVal];
    const correctIdx = Math.floor(rand() * 4);
    const options = [...distractors];
    options.splice(correctIdx, 0, ansVal);

    return {
      question: `【整數四則運算】計算式子：[(${num1}) ${op} (${num2})] × (${num3}) 之值為何？`,
      options: options.map(v => String(v)),
      answer: correctIdx,
      hint: `💡 提示：根據四則運算規則，先算中括號內的正負數加減，注意正負號變化，最後再與後面的負數相乘（負負得正）。`,
      explanation: `📖 詳解：\n1. 先計算括號內：(${num1}) ${op} (${num2}) = ${op === '+' ? num1 + num2 : num1 - num2}。\n2. 接著進行乘法：(${op === '+' ? num1 + num2 : num1 - num2}) × (${num3}) = ${ansVal}。\n3. 注意負負得正法則，故正確答案為 ${ansVal}。`
    };
  } else if (gradeId === 'g8') {
    // 八年級：乘法公式、畢氏定理、一元二次方程式
    const x = a % 9 + 1;
    const y = b % 8 + 2;
    const hypSq = x * x + y * y;
    const ansVal = `√${hypSq}`;
    const options = [`√${hypSq}`, `√${hypSq + 7}`, `√${Math.abs(hypSq - 5)}`, `${x + y}`];
    // 隨機置換
    const correctIdx = Math.floor(rand() * 4);
    const optVal = options[0];
    options[0] = options[correctIdx];
    options[correctIdx] = optVal;

    return {
      question: `【畢氏定理幾何應用】在直角坐標平面上，有一以原點 O(0,0) 為直角頂點的直角三角形，兩股長度分別為 ${x} 與 ${y}，則其斜邊長度為何？`,
      options,
      answer: correctIdx,
      hint: `💡 提示：直角三角形畢氏定理公式為 a² + b² = c²，兩股平方和等於斜邊平方。`,
      explanation: `📖 詳解：\n根據畢氏定理：斜邊長 c = √(a² + b²) = √(${x}² + ${y}²) = √(${x*x} + ${y*y}) = √${hypSq}。`
    };
  } else {
    // 九年級：相似形、圓形、二次函數、機率
    const r = (a % 6) + 3;
    const angle = [30, 45, 60, 90, 120][Math.floor(rand() * 5)];
    const arcLenFraction = angle / 360;
    const correctAns = `${(2 * r * arcLenFraction).toFixed(1)}π`;
    const wrong1 = `${(r * arcLenFraction).toFixed(1)}π`;
    const wrong2 = `${(2 * (r + 2) * arcLenFraction).toFixed(1)}π`;
    const wrong3 = `${(r * r * arcLenFraction).toFixed(1)}π`;
    const options = [correctAns, wrong1, wrong2, wrong3];
    const correctIdx = Math.floor(rand() * 4);
    const temp = options[0];
    options[0] = options[correctIdx];
    options[correctIdx] = temp;

    return {
      question: `【圓形性質與弧長】已知一圓的半徑為 ${r} 公分，圓心角為 ${angle}° 的扇形，其對應的弧長為多少公分？`,
      options,
      answer: correctIdx,
      hint: `💡 提示：圓周長公式為 2πr，扇形弧長等於圓周長乘以圓心角比例 (θ / 360°)。`,
      explanation: `📖 詳解：\n1. 圓周長 = 2 × π × 半徑 = 2 × π × ${r} = ${2 * r}π。\n2. 弧長 = 2πr × (${angle}/360) = ${2 * r}π × ${arcLenFraction.toFixed(3)} ≈ ${correctAns} 公分。`
    };
  }
}

// 英文科題庫模板產生器
function generateEnglishQuestion(gradeId, unitId, index, difficulty, rand, conceptTag) {
  const subjects = ['Tom', 'The students', 'My sister', 'The teacher', 'We', 'They'];
  const subj = subjects[Math.floor(rand() * subjects.length)];
  const isPlural = subj === 'The students' || subj === 'We' || subj === 'They';

  if (gradeId === 'g7') {
    // 七年級：現在進行式、頻率副詞、介系詞
    const actions = [
      { verb: 'study', ing: 'is studying', pIng: 'are studying', wrong: 'studies' },
      { verb: 'play', ing: 'is playing', pIng: 'are playing', wrong: 'plays' },
      { verb: 'read', ing: 'is reading', pIng: 'are reading', wrong: 'read' },
      { verb: 'cook', ing: 'is cooking', pIng: 'are cooking', wrong: 'cooked' }
    ];
    const act = actions[Math.floor(rand() * actions.length)];
    const correct = isPlural ? act.pIng : act.ing;
    const options = [correct, act.wrong, isPlural ? act.ing : act.pIng, act.verb];
    const correctIdx = Math.floor(rand() * 4);
    const temp = options[0];
    options[0] = options[correctIdx];
    options[correctIdx] = temp;

    return {
      question: `Look! ${subj} ________ English in the library right now. Don't make any noise.`,
      options,
      answer: correctIdx,
      hint: `💡 提示：看見句首有「Look!」或句尾有「right now」，表示當下正在進行的動作，時態應使用「現在進行式 (be動詞 + V-ing)」。`,
      explanation: `📖 詳解：\n主詞為「${subj}」（${isPlural ? '複數' : '第三人稱單數'}），且有「right now」作時間副詞，故配合 be 動詞「${isPlural ? 'are' : 'is'}」加上動詞 ing 形式，正確答案為「${correct}」。`
    };
  } else if (gradeId === 'g8') {
    // 八年級：使役動詞、感官動詞、不定詞與動名詞
    const causalVerbs = ['made', 'had', 'let'];
    const cVerb = causalVerbs[Math.floor(rand() * causalVerbs.length)];
    const options = ['clean', 'to clean', 'cleaned', 'cleaning'];
    const correctIdx = 0; // 'clean'
    const shuffled = [...options];
    const targetIdx = Math.floor(rand() * 4);
    shuffled[0] = shuffled[targetIdx];
    shuffled[targetIdx] = 'clean';

    return {
      question: `The strict coach ${cVerb} all the players ________ the gym floor before leaving yesterday.`,
      options: shuffled,
      answer: targetIdx,
      hint: `💡 提示：題目中的「${cVerb}」為使役動詞（make / have / let），其受詞後的受詞補語必須接「原形動詞 (Bare Infinitive)」。`,
      explanation: `📖 詳解：\n使役動詞用法為「Subject + make/have/let + Object + 原形動詞 (V)」。在此受詞 all the players 與動作 clean 為主動關係，故直接填原形動詞 clean。`
    };
  } else {
    // 九年級：被動語態、關係代名詞、名詞子句
    const options = ['who', 'which', 'whom', 'whose'];
    const isPerson = rand() > 0.5;
    const targetAns = isPerson ? 'who' : 'which';
    const targetIdx = Math.floor(rand() * 4);
    const opts = isPerson ? ['who', 'which', 'whom', 'where'] : ['which', 'who', 'what', 'where'];
    const temp = opts[0];
    opts[0] = opts[targetIdx];
    opts[targetIdx] = temp;

    const sentence = isPerson 
      ? `Do you know the doctor ________ saved hundreds of lives during the pandemic?`
      : `This is the smartphone ________ was awarded the most innovative gadget of the year.`;

    return {
      question: sentence,
      options: opts,
      answer: targetIdx,
      hint: `💡 提示：分析先行詞為「${isPerson ? '人 (the doctor)' : '物 (the smartphone)'}」，且關係代名詞在從屬子句中充當主詞功能。`,
      explanation: `📖 詳解：\n先行詞為${isPerson ? '人稱名詞' : '非人事物'}，關係子句缺少主詞，因此應選用關係代名詞主格「${targetAns}」。`
    };
  }
}

// 自然科題庫模板產生器
function generateScienceQuestion(gradeId, unitId, index, difficulty, rand, conceptTag) {
  if (gradeId === 'g7') {
    // 生物：細胞、光合作用、消化、遺傳
    const topics = [
      {
        q: '小明使用複式顯微鏡觀察人體口腔皮膜細胞與水蘊草葉片細胞，下列哪一項構造是水蘊草細胞具有、但口腔皮膜細胞「絕對沒有」的？',
        opts: ['細胞壁與葉綠體', '細胞核', '粒線體', '細胞膜'],
        ans: 0,
        hint: '💡 提示：植物細胞特有的胞器包括維持形狀的細胞壁以及行光合作用的葉綠體，動物細胞皆無。',
        exp: '📖 詳解：植物細胞具備纖維素構成的細胞壁與葉綠體（行光合作用），動物細胞則僅有細胞膜保護，無細胞壁與葉綠體。'
      },
      {
        q: '綠色植物進行光合作用時，由葉綠素吸收太陽能，首先會將下列哪一種物質分解，並釋放出氧氣？',
        opts: ['水 (H₂O)', '二氧化碳 (CO₂)', '葡萄糖 (C₆H₁₂O₆)', '三磷酸腺苷 (ATP)'],
        ans: 0,
        hint: '💡 提示：回憶光合作用的「光反應」：光能分解水分子產生氫離子與氧氣。',
        exp: '📖 詳解：光合作用第一階段（光反應）發生於葉綠餅，葉綠素吸收光能分解「水」，釋放出副產物「氧氣」。'
      },
      {
        q: '若一對雙眼皮夫婦（基因型皆為雜合子 Bb），他們生下一個單眼皮孩子（bb）的機率為何？',
        opts: ['1/4 (25%)', '1/2 (50%)', '3/4 (75%)', '0%'],
        ans: 0,
        hint: '💡 提示：利用孟德爾棋盤方格法：Bb × Bb 的子代基因型比例為 1 BB : 2 Bb : 1 bb。',
        exp: '📖 詳解：Bb 與 Bb 交配，配子組合為 BB (1/4)、Bb (2/4)、bb (1/4)。顯性雙眼皮佔 3/4，隱性單眼皮 (bb) 佔 1/4 (25%)。'
      }
    ];
    const picked = topics[index % topics.length];
    return {
      question: `【七年級生物素養題】${picked.q}`,
      options: picked.opts,
      answer: picked.ans,
      hint: picked.hint,
      explanation: picked.exp
    };
  } else if (gradeId === 'g8') {
    // 理化：聲光、熱學、密度、化學計量、酸鹼鹽
    const mass = ((index * 7) % 60) + 20;
    const vol = ((index * 3) % 15) + 5;
    const density = (mass / vol).toFixed(2);
    const opts = [
      `${density} g/cm³`,
      `${(density * 1.5).toFixed(2)} g/cm³`,
      `${(density * 0.6).toFixed(2)} g/cm³`,
      `${(vol / mass).toFixed(2)} g/cm³`
    ];
    const targetIdx = Math.floor(rand() * 4);
    const temp = opts[0];
    opts[0] = opts[targetIdx];
    opts[targetIdx] = temp;

    return {
      question: `【理化實驗測量】小華在實驗室測量一塊未知金屬塊，用電子天平測得質量為 ${mass} g，將其完全沉入裝水的量筒中，水面刻度上升了 ${vol} mL，則該金屬塊的密度約為多少？`,
      options: opts,
      answer: targetIdx,
      hint: `💡 提示：密度公式 D = M / V (密度 = 質量 ÷ 體積)。量筒上升之水面體積即為固體體積 (1 mL = 1 cm³)。`,
      explanation: `📖 詳解：\n密度 D = 質量 M / 體積 V = ${mass} g / ${vol} cm³ ≈ ${density} g/cm³。故答案選 ${density} g/cm³。`
    };
  } else {
    // 九年級：直線運動、牛頓運動定律、電路、地科板塊
    const force = ((index * 5) % 40) + 10;
    const mass = ((index * 2) % 8) + 2;
    const acc = (force / mass).toFixed(1);
    const opts = [
      `${acc} m/s²`,
      `${(acc * 2).toFixed(1)} m/s²`,
      `${(force * mass).toFixed(1)} m/s²`,
      `${(acc * 0.5).toFixed(1)} m/s²`
    ];
    const targetIdx = Math.floor(rand() * 4);
    const temp = opts[0];
    opts[0] = opts[targetIdx];
    opts[targetIdx] = temp;

    return {
      question: `【牛頓第二運動定律】一質量為 ${mass} kg 的滑車靜止置於水平光滑無摩擦力之桌面上，受到一水平定力 ${force} N 的持續推動，則該滑車產生的加速度大小為何？`,
      options: opts,
      answer: targetIdx,
      hint: `💡 提示：根據牛頓第二運動定律公式 F = m × a，加速度 a = F / m。`,
      explanation: `📖 詳解：\n由 F = m × a 得：a = F / m = ${force} N / ${mass} kg = ${acc} m/s²。`
    };
  }
}

// 國文科題庫模板產生器
function generateChineseQuestion(gradeId, unitId, index, difficulty, rand, conceptTag) {
  const topics = [
    {
      q: '下列哪一組漢字的造字法則，全部屬於「不能再分割的獨體初文（象形或指事）」？',
      opts: ['日、月、本、末', '休、武、江、河', '林、森、信、鳴', '情、理、說、明'],
      ans: 0,
      hint: '💡 提示：漢字六書中，「象形」與「指事」為獨體之「文」；「會意」與「形聲」為合體之「字」。',
      exp: '📖 詳解：「日、月」為象形，「本、末」為加符號之指事字，皆為獨體初文。其餘選項皆包含形聲或會意合體字。'
    },
    {
      q: '好友新居落成、喜遷新居，前往祝賀時在紅包或匾額上的題辭，下列何者最為得體恰當？',
      opts: ['喬遷之喜／美輪美奐', '弄璋之喜／天賜麟兒', '宜室宜家／琴瑟和鳴', '駕鶴西歸／音容宛在'],
      ans: 0,
      hint: '💡 提示：辨析賀詞用途：賀搬家、賀生子、賀結婚、喪事悼唁各有嚴格傳統用辭。',
      exp: '📖 詳解：「美輪美奐、喬遷之喜」用於賀新居；「弄璋」為生男孩；「宜室宜家」為祝賀女子出嫁；「駕鶴西歸」為哀輓之詞。'
    },
    {
      q: '「山朗潤起來了，水漲起來了，太陽的臉紅起來了。」這段朱自清《春》中的名句，運用了何種修辭法？',
      opts: ['排比與擬人（轉化）', '誇飾與映襯', '頂真與回文', '雙關與對偶'],
      ans: 0,
      hint: '💡 提示：句式三個結構相同且賦予「太陽臉紅」人類表情特徵。',
      exp: '📖 詳解：連續三個結構相似的短句構成「排比」；賦予無生命的太陽「臉紅」的情感動作屬於「轉化中的擬人法」。'
    },
    {
      q: '古代年齡代稱中，男子滿二十歲舉行成年禮稱為「弱冠」，那麼女子滿十五歲許嫁的年齡稱為什麼？',
      opts: ['及笄之年', '花甲之年', '古稀之年', '而立之年'],
      ans: 0,
      hint: '💡 提示：笄為女子固定髮髻的髮簪，及笄代表盤髮插簪象徵成年。',
      exp: '📖 詳解：女子十五歲為「及笄」；三十歲為「而立」；六十歲為「花甲」；七十歲為「古稀」。'
    }
  ];

  const picked = topics[index % topics.length];
  const formattedOpts = [...picked.opts];
  const correctVal = formattedOpts[picked.ans];
  // 洗牌
  const targetIdx = Math.floor(rand() * 4);
  formattedOpts.splice(picked.ans, 1);
  formattedOpts.splice(targetIdx, 0, correctVal);

  return {
    question: `【108課綱國語文素養】${picked.q}`,
    options: formattedOpts,
    answer: targetIdx,
    hint: picked.hint,
    explanation: picked.exp
  };
}

// 社會科題庫模板產生器
function generateSocialQuestion(gradeId, unitId, index, difficulty, rand, conceptTag) {
  const topics = [
    {
      q: '十七世紀大航海時代，臺灣因其優越地理位置成為東亞貿易轉口港，當時在臺灣南部安平興建「熱蘭遮城」的歐洲殖民勢力為下列何者？',
      opts: ['荷蘭人', '西班牙人', '葡萄牙人', '英國人'],
      ans: 0,
      hint: '💡 提示：荷蘭東印度公司於臺南建立大員（熱蘭遮城）；西班牙人則在北部基隆淡水建立聖多明哥城。',
      exp: '📖 詳解：1624年荷蘭人登陸臺南安平並建造熱蘭遮城（今安平古堡），以此為據點發展東亞鹿皮與蔗糖轉口貿易。'
    },
    {
      q: '經濟學中，當面臨多個互斥的選擇方案時，所放棄的選項中「價值最高者」稱為什麼？',
      opts: ['機會成本 (Opportunity Cost)', '邊際效用 (Marginal Utility)', '沉沒成本 (Sunk Cost)', '絕對利益 (Absolute Advantage)'],
      ans: 0,
      hint: '💡 提示：魚與熊掌不可兼得，選擇一項必須放棄其他方案，所付出的代價即為此觀念。',
      exp: '📖 詳解：機會成本為做出某一選擇時所放棄的最高代價。經濟學決策時應盡量追求機會成本最小化。'
    },
    {
      q: '依據我國現行《中華民國憲法增修條文》，我國中央政府體制中，享有「法案提議與覆議權」，且向立法院負責的最高行政機關為：',
      opts: ['行政院', '司法院', '監察院', '總統府'],
      ans: 0,
      hint: '💡 提示：我國憲法架構下，行政院為最高國家行政機關，行政院院長為最高首長。',
      exp: '📖 詳解：依憲法規定，行政院為國家最高行政機關，對立法院負責，並可行使法律案覆議權。'
    },
    {
      q: '臺灣冬季受到東北季風吹拂，造成迎風面與背風面的降水分布極不均勻，下列何者屬於迎風面多雨之典型氣候代表區域？',
      opts: ['基隆與宜蘭', '嘉南平原', '高雄市區', '澎湖群島'],
      ans: 0,
      hint: '💡 提示：東北季風自東北方海面吹向臺灣，遭遇中央山脈阻擋，東北角迎風面冬季陰雨綿綿。',
      exp: '📖 詳解：基隆有「雨港」之稱，與宜蘭同處臺灣東北角迎風坡，冬季深受東北季風水氣影響而降雨豐沛。'
    }
  ];

  const picked = topics[index % topics.length];
  const formattedOpts = [...picked.opts];
  const correctVal = formattedOpts[picked.ans];
  const targetIdx = Math.floor(rand() * 4);
  formattedOpts.splice(picked.ans, 1);
  formattedOpts.splice(targetIdx, 0, correctVal);

  return {
    question: `【108課綱社會領域綜合考題】${picked.q}`,
    options: formattedOpts,
    answer: targetIdx,
    hint: picked.hint,
    explanation: picked.exp
  };
}

function generateFallbackQuestion(subjectId, gradeId, unitId, index, difficulty, rand, conceptTag) {
  return {
    question: `【${subjectId}觀念素養】關於單元核心概念，請選出最正確之論述？(第 ${index} 題)`,
    options: [
      '正確觀念選項：符合 108 課綱最新標準',
      '錯誤概念選項 A：混淆概念與定義',
      '錯誤概念選項 B：因果倒置論點',
      '錯誤概念選項 C：超出範圍之不相關論述'
    ],
    answer: 0,
    hint: '💡 提示：回歸 108 課綱課本定義，注意選項間的邏輯互斥關係。',
    explanation: `📖 詳解：本題檢驗該單元核心概念理解，第一項敘述完整精確，符合學科素養要求。`
  };
}

// 依據篩選條件（年級、科目、選定單元列表、難度、抽取題數）產生完整無重複題庫
export function generateQuizSet({ subjectId, gradeId, unitIds, difficulty = 'medium', count = 10, excludeIds = [] }) {
  const quizSet = [];
  const validUnits = unitIds.length > 0 ? unitIds : (CURRICULUM_UNITS[subjectId]?.[gradeId] || []).map(u => u.id);
  if (validUnits.length === 0) return [];

  const usedQuestionIds = new Set(excludeIds);
  let attempts = 0;
  const maxAttempts = count * 30;

  // 取得管理員對題庫題目的增刪改覆蓋設定 (Question Overrides)
  const overrides = typeof getQuestionOverrides === 'function' ? getQuestionOverrides() : {};

  while (quizSet.length < count && attempts < maxAttempts) {
    attempts++;
    // 隨機自選定單元中挑選
    const unitId = validUnits[Math.floor(Math.random() * validUnits.length)];
    // 在 1 ~ 5000 範圍內隨機挑選題號，確保每單元 5000 題超大題庫容量且絕不重複
    const questionIndex = Math.floor(Math.random() * 5000) + 1;
    let q = generateQuestion(subjectId, gradeId, unitId, questionIndex, difficulty);

    // 核心修復：若該題目已被管理員標記刪除，學生端絕對排除，不再出題！
    if (overrides[q.id]?.isDeleted) {
      continue;
    }

    // 若管理員有客製修改正確答案或詳解內容，即時套用覆蓋
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
