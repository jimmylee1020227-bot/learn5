export function generateChineseQuestion(gradeId, unitId, index, difficulty, rand, conceptTag) {
  const globalVariant = index % 4; // Expanded to 4

  // 通用錯別字與字音字形 (適用全科)
  if (globalVariant === 0) {
    const typos = [
      { text: '「莘莘」學子', correct: 'ㄕㄣ', wrong: ['ㄒㄧㄣ', 'ㄒㄧㄥ', 'ㄕㄥ'] },
      { text: '「垂涎」三尺', correct: 'ㄒㄧㄢˊ', wrong: ['ㄧㄢˊ', 'ㄉㄧㄢˋ', 'ㄔㄨㄟˊ'] },
      { text: '「塑」膠', correct: 'ㄙㄨˋ', wrong: ['ㄕㄨㄛˋ', 'ㄙㄨㄛˋ', 'ㄕㄨˋ'] },
      { text: '「尷尬」', correct: 'ㄍㄢ ㄍㄚˋ', wrong: ['ㄐㄧㄢ ㄐㄧㄝˋ', 'ㄍㄢ ㄐㄧㄝˋ', 'ㄐㄧㄢ ㄍㄚˋ'] },
      { text: '「罹」難', correct: 'ㄌㄧˊ', wrong: ['ㄌㄨㄛˊ', 'ㄌㄨㄛˋ', 'ㄌㄧˋ'] },
      { text: '「齟齬」', correct: 'ㄐㄩˇ ㄩˇ', wrong: ['ㄗㄨˇ ㄨˇ', 'ㄐㄧㄠ ㄨˇ', 'ㄐㄩˇ ㄨˇ'] },
      { text: '「緋」聞', correct: 'ㄈㄟ', wrong: ['ㄈㄟˇ', 'ㄆㄟˊ', 'ㄈㄟˋ'] },
      { text: '「痙攣」', correct: 'ㄐㄧㄥˋ ㄌㄨㄢˊ', wrong: ['ㄐㄧㄥ ㄌㄨㄢˊ', 'ㄐㄧㄥˋ ㄌㄨㄢ', 'ㄐㄧㄥ ㄌㄨㄢ'] },
      { text: '「邂逅」', correct: 'ㄒㄧㄝˋ ㄏㄡˋ', wrong: ['ㄒㄧㄝˋ ㄍㄡˋ', 'ㄐㄧㄝˇ ㄏㄡˋ', 'ㄒㄧㄝ ㄏㄡˋ'] },
      { text: '「稗」官野史', correct: 'ㄅㄞˋ', wrong: ['ㄅㄟ', 'ㄅㄧˋ', 'ㄅㄞ'] },
      { text: '「潸」然淚下', correct: 'ㄕㄢ', wrong: ['ㄙㄢ', 'ㄕㄢˇ', 'ㄙㄢˇ'] },
      { text: '「鍥」而不捨', correct: 'ㄑㄧㄝˋ', wrong: ['ㄑㄧˋ', 'ㄑㄧㄝ', 'ㄑㄧ'] },
      { text: '「否」極泰來', correct: 'ㄆㄧˇ', wrong: ['ㄈㄡˇ', 'ㄆㄧ', 'ㄈㄡˋ'] },
      { text: '「暴虎馮」河', correct: 'ㄆㄧㄥˊ', wrong: ['ㄈㄥˊ', 'ㄈㄥˇ', 'ㄆㄧㄥ'] },
      { text: '「造詣」', correct: 'ㄧˋ', wrong: ['ㄓˇ', 'ㄧ', 'ㄓˋ'] }
    ];
    const t = typos[index % typos.length];
    return {
      question: `【字音字形測驗】請選出下列詞語「」中文字的正確讀音：\n${t.text}`,
      options: [t.correct, t.wrong[0], t.wrong[1], t.wrong[2]],
      answer: 0,
      hint: '💡 提示：請注意部首與偏旁的發音差異。',
      explanation: `📖 詳解：「${t.text}」正確讀音為 ${t.correct}。`
    };
  } else if (globalVariant === 1) {
    const wrongWords = [
      { q: '何者「沒有」錯別字？', options: ['走投無路', '破斧沉舟', '病入膏盲', '名烈前茅'], ans: 0, exp: '破釜沉舟、病入膏肓、名列前茅' },
      { q: '何者「有」錯別字？', options: ['按步就班', '鋌而走險', '趨之若鶩', '按圖索驥'], ans: 0, exp: '按部就班' },
      { q: '用字完全正確的是？', options: ['發憤圖強', '防微度漸', '無精打彩', '一愁莫展'], ans: 0, exp: '防微杜漸、無精打采、一籌莫展' },
      { q: '何者「沒有」錯別字？', options: ['莫名其妙', '不可名狀', '名符其實', '名不虛傳'], ans: 0, exp: '名副其實' },
      { q: '何者「有」錯別字？', options: ['出奇不意', '出其不意', '心不在焉', '無微不至'], ans: 0, exp: '出其不意' },
      { q: '何者「有」錯別字？', options: ['草管人命', '草菅人命', '不遺餘力', '不可思議'], ans: 0, exp: '草菅人命' },
      { q: '何者「沒有」錯別字？', options: ['甘拜下風', '甘敗下風', '不辨菽麥', '不辯菽麥'], ans: 0, exp: '甘拜下風' }
    ];
    const w = wrongWords[index % wrongWords.length];
    return {
      question: `【錯別字陷阱】下列四個選項中，${w.q}`,
      options: w.options,
      answer: w.ans,
      hint: '💡 提示：仔細辨認字形。',
      explanation: `📖 詳解：${w.exp}`
    };
  } else if (globalVariant === 2) {
    const idioms = [
      { q: '比喻「處境極為危險」的成語是？', options: ['盲人瞎馬', '老馬識途', '走馬看花', '指鹿為馬'], exp: '盲人瞎馬' },
      { q: '形容「罪狀極多」的成語是？', options: ['罄竹難書', '汗牛充棟', '學富五車', '浩如煙海'], exp: '罄竹難書' },
      { q: '帶有「貶義」的成語是？', options: ['推波助瀾', '見義勇為', '雪中送炭', '錦上添花'], exp: '推波助瀾' },
      { q: '比喻「做事沒有條理」的成語是？', options: ['雜亂無章', '井井有條', '一絲不苟', '按部就班'], exp: '雜亂無章' },
      { q: '比喻「目光短淺」的成語是？', options: ['井底之蛙', '高瞻遠矚', '真知灼見', '洞若觀火'], exp: '井底之蛙' },
      { q: '比喻「做事有始無終」的成語是？', options: ['半途而廢', '持之以恆', '堅持不懈', '始終如一'], exp: '半途而廢' },
      { q: '比喻「力量微小，無濟於事」的成語是？', options: ['杯水車薪', '九牛一毛', '微不足道', '滄海一粟'], exp: '杯水車薪' }
    ];
    const i = idioms[index % idioms.length];
    return {
      question: `【成語應用測驗】\n${i.q}`,
      options: i.options,
      answer: 0,
      hint: '💡 提示：思考成語背後的典故。',
      explanation: `📖 詳解：答案是 ${i.exp}。`
    };
  } else {
    const chars = ['江', '河', '湖', '海', '松', '柏', '梅', '櫻'];
    const ch = chars[index % chars.length];
    return {
      isChat: true,
      chatMessages: [
        { sender: '小明', text: `請問「${ch}」這個字是什麼造字法則啊？` },
        { sender: '小華', text: '有部首表示意思，旁邊的字表示聲音，這很明顯是________。' }
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
    const variant = index % 2;
    if (variant === 0) {
      const qs = [
        { q: '絕句的格律', opts: ['不要求必須對仗', '必須對仗', '每首八句', '不押韻'] },
        { q: '律詩的格律', opts: ['頷聯與頸聯必須對仗', '不要求對仗', '每首四句', '一韻到底不可押韻'] },
        { q: '古體詩的格律', opts: ['字數句數不限，不嚴格要求平仄', '必須嚴格平仄', '必須對仗', '每首四句'] },
        { q: '宋詞的格律', opts: ['須依詞牌填寫，句式長短不一', '每句字數必須相同', '不押韻', '不需要詞牌'] }
      ];
      const q = qs[index % qs.length];
      return {
        question: `【韻文常識】關於「${q.q}」，下列敘述何者正確？`,
        options: q.opts,
        answer: 0,
        hint: '💡 提示：回想唐詩宋詞的基本格律規定。',
        explanation: `📖 詳解：正確特徵為：${q.opts[0]}。`
      };
    } else {
      const writers = [
        { name: '李白', style: '浪漫主義，號青蓮居士', alias: '詩仙' },
        { name: '杜甫', style: '社會寫實，憂國憂民', alias: '詩聖' },
        { name: '白居易', style: '老嫗能解，平易近人', alias: '詩魔' },
        { name: '王維', style: '詩中有畫，畫中有詩', alias: '詩佛' },
        { name: '蘇軾', style: '豪放派詞人，唐宋八大家', alias: '東坡居士' }
      ];
      const w = writers[index % writers.length];
      return {
        question: `【國學常識】下列關於「${w.name}」的敘述，何者正確？`,
        options: [w.style + '，被稱為' + w.alias, '婉約派代表人物', '先秦儒家代表人物', '明代小說家'],
        answer: 0,
        hint: '💡 提示：回憶作者的稱號與寫作風格。',
        explanation: `📖 詳解：${w.name}的特色為${w.style}，被稱為${w.alias}。`
      };
    }
  } else if (gradeId === 'g8') {
    const variant = index % 2;
    if (variant === 0) {
      const s = [
        { t: '判斷句', ex: '蓮，花之君子者也。' },
        { t: '敘事句', ex: '故人西辭黃鶴樓。' },
        { t: '有無句', ex: '宅邊有五柳樹。' },
        { t: '表態句', ex: '牡丹之愛，宜乎眾矣。' },
        { t: '判斷句', ex: '交友是一件有益的事。' },
        { t: '敘事句', ex: '微風吹過水面。' }
      ];
      const q = s[index % s.length];
      return {
        question: `【中文四大句型】文句：「${q.ex}」在語法上屬於下列哪一種句型？`,
        options: [q.t, '判斷句', '敘事句', '有無句', '表態句'].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4),
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
      const q = r[index % r.length];
      return {
        question: `【語文修辭技巧判讀】\n文句：「${q.ex}」主要運用了何種修辭技巧？`,
        options: [q.r, '轉化', '排比', '誇飾', '頂真', '映襯', '譬喻'].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4),
        answer: 0,
        hint: `💡 提示：觀察句子的結構與意象。`,
        explanation: `📖 詳解：運用了「${q.r}」。`
      };
    }
  } else if (gradeId === 'g9') {
    const variant = index % 2;
    if (variant === 0) {
      const quotes = [
        { text: '學而不思則罔，思而不學則殆。', ans: '強調學習與思考必須並重。' },
        { text: '三人行，必有我師焉。', ans: '強調隨時向他人學習。' },
        { text: '己所不欲，勿施於人。', ans: '強調同理心與推己及人。' },
        { text: '任重而道遠。', ans: '形容責任重大，路途遙遠。' }
      ];
      const q = quotes[index % quotes.length];
      return {
        isReading: true,
        readingText: `【文言語譯與理解】\n子曰：「${q.text}」`,
        question: `【文意推敲】孔子這段話最主要的涵義是強調什麼？`,
        options: [q.ans, '要多讀書', '要孝順父母', '要忠心為國'],
        answer: 0,
        hint: '💡 提示：仔細閱讀文言文的字面意思。',
        explanation: `📖 詳解：${q.ans}`
      };
    } else {
      const cards = [
        { occ: '結婚', ans: '琴瑟和鳴' },
        { occ: '生女', ans: '弄瓦之喜' },
        { occ: '生男', ans: '弄璋之喜' },
        { occ: '高壽', ans: '松柏長青' },
        { occ: '醫院開業', ans: '華佗再世' },
        { occ: '搬家', ans: '喬木鶯遷' }
      ];
      const q = cards[index % cards.length];
      return {
        question: `【應用文題辭】小華的朋友遇到「${q.occ}」的喜事，他想送個禮物，卡片上寫哪一個題辭最合適？`,
        options: [q.ans, '琴瑟和鳴', '弄瓦之喜', '松柏長青', '高山流水'].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4),
        answer: 0,
        hint: '💡 提示：針對場合選擇適合的題辭。',
        explanation: `📖 詳解：【${q.occ}】最適合使用「${q.ans}」。`
      };
    }
  }

  // Fallback
  return {
    question: `【國文素養題】關於單元「${conceptTag}」的第 ${index} 個核心觀念，下列敘述何者正確？`,
    options: ['符合單元核心旨意的敘述', '常見誤解一', '常見誤解二', '常見誤解三'],
    answer: 0,
    hint: '💡 提示：回憶課本定義。',
    explanation: `📖 詳解：這是一道動態核心素養題。`
  };
}
