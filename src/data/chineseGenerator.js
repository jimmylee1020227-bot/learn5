export function generateChineseQuestion(gradeId, unitId, index, difficulty, rand, conceptTag) {
  const globalVariant = Math.floor(rand() * 4); 

  // 動態樂高引擎：產生絕對不重複的情境前導詞
  const people = ['小明', '阿華', '建國', '美美', '志明', '春嬌', '大雄', '胖虎', '小夫', '靜香', '國文老師', '班長'];
  const actions = ['在寫作文時', '閱讀課外讀物時', '幫同學檢查作業時', '參加語文競賽時', '在圖書館看書時', '準備段考時'];
  const verbs = ['發現了一個容易寫錯的字', '遇到了一個成語', '對一個國學常識產生了疑惑', '不確定以下哪個說法是對的'];
  
  const person = people[Math.floor(rand() * people.length)];
  const action = actions[Math.floor(rand() * actions.length)];
  const verb = verbs[Math.floor(rand() * verbs.length)];
  const preamble = `${person}${action}，${verb}。`;

  function getRandItems(arr, count) {
    const res = [];
    const pool = [...arr];
    for(let i=0; i<count; i++) {
      if(pool.length === 0) break;
      const idx = Math.floor(rand() * pool.length);
      res.push(pool.splice(idx, 1)[0]);
    }
    return res;
  }

  // 通用錯別字與字音字形 (適用全科)
  if (globalVariant === 0) {
    const typos = [
      { text: '「莘莘」學子', correct: 'ㄕㄣ', wrong: 'ㄒㄧㄣ' },
      { text: '「垂涎」三尺', correct: 'ㄒㄧㄢˊ', wrong: 'ㄧㄢˊ' },
      { text: '「塑」膠', correct: 'ㄙㄨˋ', wrong: 'ㄕㄨㄛˋ' },
      { text: '「尷尬」', correct: 'ㄍㄢ ㄍㄚˋ', wrong: 'ㄐㄧㄢ ㄐㄧㄝˋ' },
      { text: '「罹」難', correct: 'ㄌㄧˊ', wrong: 'ㄌㄨㄛˊ' },
      { text: '「齟齬」', correct: 'ㄐㄩˇ ㄩˇ', wrong: 'ㄗㄨˇ ㄨˇ' },
      { text: '「緋」聞', correct: 'ㄈㄟ', wrong: 'ㄈㄟˇ' },
      { text: '「痙攣」', correct: 'ㄐㄧㄥˋ ㄌㄨㄢˊ', wrong: 'ㄐㄧㄥ ㄌㄨㄢˊ' },
      { text: '「邂逅」', correct: 'ㄒㄧㄝˋ ㄏㄡˋ', wrong: 'ㄒㄧㄝˋ ㄍㄡˋ' },
      { text: '「稗」官野史', correct: 'ㄅㄞˋ', wrong: 'ㄅㄟ' },
      { text: '「潸」然淚下', correct: 'ㄕㄢ', wrong: 'ㄙㄢ' },
      { text: '「鍥」而不捨', correct: 'ㄑㄧㄝˋ', wrong: 'ㄑㄧˋ' },
      { text: '「否」極泰來', correct: 'ㄆㄧˇ', wrong: 'ㄈㄡˇ' },
      { text: '「暴虎馮」河', correct: 'ㄆㄧㄥˊ', wrong: 'ㄈㄥˊ' },
      { text: '「造詣」', correct: 'ㄧˋ', wrong: 'ㄓˇ' }
    ];
    // Pick 1 target, and 3 random wrong options from other targets to mix it up
    const target = typos[Math.floor(rand() * typos.length)];
    const otherWrongs = getRandItems(typos.filter(t => t !== target), 3).map(t => t.wrong);
    
    return {
      question: `【字音字形測驗】${preamble}\n請選出下列詞語「」中文字的正確讀音：\n${target.text}`,
      options: [target.correct, target.wrong, ...otherWrongs].slice(0, 4),
      answer: 0,
      hint: '💡 提示：請注意部首與偏旁的發音差異。',
      explanation: `📖 詳解：「${target.text}」正確讀音為 ${target.correct}。`
    };
  } else if (globalVariant === 1) {
    const correctWords = ['破釜沉舟', '名列前茅', '按部就班', '防微杜漸', '無精打采', '一籌莫展', '名副其實', '甘拜下風', '出其不意', '草菅人命', '不辨菽麥', '趨之若鶩', '鋌而走險', '按圖索驥', '發憤圖強'];
    const wrongWords = ['破斧沉舟', '名烈前茅', '按步就班', '防微度漸', '無精打彩', '一愁莫展', '名符其實', '甘敗下風', '出奇不意', '草管人命', '不辯菽麥', '趨之若騖', '挺而走險', '按圖索記', '發奮圖強'];
    
    const isAskCorrect = rand() > 0.5;
    if (isAskCorrect) {
      const ans = getRandItems(correctWords, 1)[0];
      const wrongs = getRandItems(wrongWords, 3);
      return {
        question: `【錯別字陷阱】${preamble}\n下列四個選項中，何者「沒有」錯別字？`,
        options: [ans, ...wrongs],
        answer: 0,
        hint: '💡 提示：仔細辨認字形，找出唯一正確的。',
        explanation: `📖 詳解：正確用字為「${ans}」。`
      };
    } else {
      const ans = getRandItems(wrongWords, 1)[0];
      const rights = getRandItems(correctWords, 3);
      return {
        question: `【錯別字陷阱】${preamble}\n下列四個選項中，何者「有」錯別字？`,
        options: [ans, ...rights],
        answer: 0,
        hint: '💡 提示：找出含有錯別字的選項。',
        explanation: `📖 詳解：含有錯別字的是「${ans}」。`
      };
    }
  } else if (globalVariant === 2) {
    const idiomData = [
      { q: '處境極為危險', ans: '盲人瞎馬', wrongs: ['老馬識途', '走馬看花', '指鹿為馬', '馬到成功', '千軍萬馬'] },
      { q: '罪狀極多', ans: '罄竹難書', wrongs: ['汗牛充棟', '學富五車', '浩如煙海', '博古通今'] },
      { q: '帶有「貶義」的行為', ans: '推波助瀾', wrongs: ['見義勇為', '雪中送炭', '錦上添花', '成人之美'] },
      { q: '做事沒有條理', ans: '雜亂無章', wrongs: ['井井有條', '一絲不苟', '按部就班', '有條不紊'] },
      { q: '目光短淺', ans: '井底之蛙', wrongs: ['高瞻遠矚', '真知灼見', '洞若觀火', '明察秋毫'] },
      { q: '做事有始無終', ans: '半途而廢', wrongs: ['持之以恆', '堅持不懈', '始終如一', '鍥而不捨'] },
      { q: '力量微小，無濟於事', ans: '杯水車薪', wrongs: ['九牛一毛', '微不足道', '滄海一粟', '蚍蜉撼樹'] }
    ];
    const item = idiomData[Math.floor(rand() * idiomData.length)];
    const w = getRandItems(item.wrongs, 3);
    return {
      question: `【成語應用測驗】${preamble}\n用來比喻或形容「${item.q}」的成語是下列何者？`,
      options: [item.ans, ...w],
      answer: 0,
      hint: '💡 提示：思考成語背後的典故。',
      explanation: `📖 詳解：答案是「${item.ans}」。`
    };
  } else {
    const chars = ['江', '河', '湖', '海', '松', '柏', '梅', '櫻', '桐', '楓'];
    const ch = chars[Math.floor(rand() * chars.length)];
    const names = getRandItems(people, 2);
    
    return {
      isChat: true,
      chatMessages: [
        { sender: names[0], text: `請問「${ch}」這個字是什麼造字法則啊？` },
        { sender: names[1], text: '有一半表示意思，另一半表示聲音，這很明顯是________。' }
      ],
      question: `【六書討論】根據上述對話，空格中應該填入哪一種六書造字法則？`,
      options: ['形聲', '象形', '會意', '指事'],
      answer: 0,
      hint: '💡 提示：一半表形，一半表音。',
      explanation: `📖 詳解：形聲字由形符與聲符組成。`
    };
  }

  // 根據年級區分國學常識
  if (gradeId === 'g7') {
    const variant = Math.floor(rand() * 2);
    if (variant === 0) {
      const qs = [
        { q: '絕句的格律', opts: ['不要求必須對仗', '必須對仗', '每首八句', '一韻到底不可押韻', '字數沒有限制'] },
        { q: '律詩的格律', opts: ['頷聯與頸聯必須對仗', '不要求對仗', '每首四句', '可以隨意換韻', '首聯必須對仗'] },
        { q: '古體詩的格律', opts: ['字數句數不限，不嚴格平仄', '必須嚴格平仄', '必須對仗', '每首固定四句', '一定要押平聲韻'] },
        { q: '宋詞的格律', opts: ['須依詞牌填寫，句式長短不一', '每句字數必須相同', '完全不押韻', '不需要詞牌', '只能寫國家大事'] }
      ];
      const q = qs[Math.floor(rand() * qs.length)];
      return {
        question: `【韻文常識】${preamble}\n關於「${q.q}」，下列敘述何者正確？`,
        options: [q.opts[0], ...getRandItems(q.opts.slice(1), 3)],
        answer: 0,
        hint: '💡 提示：回想唐詩宋詞的基本格律規定。',
        explanation: `📖 詳解：正確特徵為：${q.opts[0]}。`
      };
    } else {
      const writers = [
        { name: '李白', style: '浪漫主義', alias: '詩仙' },
        { name: '杜甫', style: '社會寫實', alias: '詩聖' },
        { name: '白居易', style: '平易近人', alias: '詩魔' },
        { name: '王維', style: '詩中有畫', alias: '詩佛' },
        { name: '蘇軾', style: '豪放派詞人', alias: '東坡居士' }
      ];
      const w = writers[Math.floor(rand() * writers.length)];
      const wrongs = writers.filter(x => x !== w).map(x => x.style + '，被稱為' + x.alias);
      return {
        question: `【國學常識】${preamble}\n下列關於「${w.name}」的敘述，何者正確？`,
        options: [w.style + '，被稱為' + w.alias, ...getRandItems(wrongs, 3)],
        answer: 0,
        hint: '💡 提示：回憶作者的稱號與寫作風格。',
        explanation: `📖 詳解：${w.name}的特色為${w.style}，被稱為${w.alias}。`
      };
    }
  } else if (gradeId === 'g8') {
    const variant = Math.floor(rand() * 2);
    if (variant === 0) {
      const s = [
        { t: '判斷句', ex: '蓮，花之君子者也。' },
        { t: '敘事句', ex: '故人西辭黃鶴樓。' },
        { t: '有無句', ex: '宅邊有五柳樹。' },
        { t: '表態句', ex: '牡丹之愛，宜乎眾矣。' },
        { t: '判斷句', ex: '交友是一件有益的事。' },
        { t: '敘事句', ex: '微風吹過水面。' }
      ];
      const q = s[Math.floor(rand() * s.length)];
      const otherTypes = ['判斷句', '敘事句', '有無句', '表態句'].filter(x => x !== q.t);
      return {
        question: `【中文四大句型】${preamble}\n文句：「${q.ex}」在語法上屬於下列哪一種句型？`,
        options: [q.t, ...getRandItems(otherTypes, 3)],
        answer: 0,
        hint: `💡 提示：分析句中核心謂語。`,
        explanation: `📖 詳解：這是一句典型的「${q.t}」。`
      };
    } else {
      const r = [
        { r: '轉化', ex: '春風在樹枝上跳舞。' },
        { r: '排比', ex: '朋友是依靠，是燈塔，是爐火。' },
        { r: '誇飾', ex: '安靜得連針掉在地上都聽得見。' },
        { r: '頂真', ex: '青青河畔草，草色入簾青。' },
        { r: '映襯', ex: '不在乎天長地久，只在乎曾經擁有。' },
        { r: '譬喻', ex: '時間像流水一樣逝去。' }
      ];
      const q = r[Math.floor(rand() * r.length)];
      const otherRhetorics = ['轉化', '排比', '誇飾', '頂真', '映襯', '譬喻'].filter(x => x !== q.r);
      return {
        question: `【語文修辭技巧判讀】${preamble}\n文句：「${q.ex}」主要運用了何種修辭技巧？`,
        options: [q.r, ...getRandItems(otherRhetorics, 3)],
        answer: 0,
        hint: `💡 提示：觀察句子的結構與意象。`,
        explanation: `📖 詳解：運用了「${q.r}」。`
      };
    }
  } else if (gradeId === 'g9') {
    const variant = Math.floor(rand() * 2);
    if (variant === 0) {
      const quotes = [
        { text: '學而不思則罔，思而不學則殆。', ans: '強調學習與思考必須並重。' },
        { text: '三人行，必有我師焉。', ans: '強調隨時向他人學習。' },
        { text: '己所不欲，勿施於人。', ans: '強調同理心與推己及人。' },
        { text: '任重而道遠。', ans: '形容責任重大，路途遙遠。' }
      ];
      const wrongs = ['要多讀書', '要孝順父母', '要忠心為國', '要愛護動物', '要節約用水', '要尊敬師長'];
      const q = quotes[Math.floor(rand() * quotes.length)];
      return {
        isReading: true,
        readingText: `【文言語譯與理解】\n子曰：「${q.text}」`,
        question: `【文意推敲】${preamble}\n孔子這段話最主要的涵義是強調什麼？`,
        options: [q.ans, ...getRandItems(wrongs, 3)],
        answer: 0,
        hint: '💡 提示：仔細閱讀文言文的字面意思。',
        explanation: `📖 詳解：${q.ans}`
      };
    } else {
      const cards = [
        { occ: '結婚', ans: '琴瑟和鳴', w: ['弄瓦之喜', '松柏長青', '華佗再世', '喬木鶯遷'] },
        { occ: '生女', ans: '弄瓦之喜', w: ['弄璋之喜', '琴瑟和鳴', '高山流水', '百年好合'] },
        { occ: '生男', ans: '弄璋之喜', w: ['弄瓦之喜', '琴瑟和鳴', '松柏長青', '之子于歸'] },
        { occ: '高壽', ans: '松柏長青', w: ['百年好合', '華佗再世', '弄瓦之喜', '琴瑟和鳴'] },
        { occ: '醫院開業', ans: '華佗再世', w: ['松柏長青', '喬木鶯遷', '百年好合', '弄瓦之喜'] },
        { occ: '搬家', ans: '喬木鶯遷', w: ['松柏長青', '華佗再世', '琴瑟和鳴', '弄璋之喜'] }
      ];
      const q = cards[Math.floor(rand() * cards.length)];
      const occName = ['小華', '大明', '志明', '春嬌', '阿建'][Math.floor(rand() * 5)];
      return {
        question: `【應用文題辭】${occName}的朋友遇到「${q.occ}」的喜事，想送個禮物，卡片上寫哪一個題辭最合適？`,
        options: [q.ans, ...getRandItems(q.w, 3)],
        answer: 0,
        hint: '💡 提示：針對場合選擇適合的題辭。',
        explanation: `📖 詳解：【${q.occ}】最適合使用「${q.ans}」。`
      };
    }
  }

  // Fallback
  const fbText = ['請問這句話是正確的嗎？', '下列關於這單元的說法何者無誤？', '針對這個觀念，哪個選項是對的？'][Math.floor(rand() * 3)];
  return {
    question: `【國文素養題】${preamble}\n關於單元「${conceptTag}」，${fbText}`,
    options: ['符合單元核心旨意的敘述', '常見誤解一', '常見誤解二', '常見誤解三'],
    answer: 0,
    hint: '💡 提示：回憶課本定義。',
    explanation: `📖 詳解：這是一道動態核心素養題。`
  };
}
