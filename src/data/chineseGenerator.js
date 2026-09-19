export function generateChineseQuestion(gradeId, unitId, index, difficulty, rand, conceptTag) {
  // 中文多樣化題庫：提供高達 10 種不同類型，每次隨機抽
  const variant = Math.floor(rand() * 10);

  // 1. 字音字形與錯別字 (Type 0, 1, 2)
  if (variant === 0) {
    const typos = [
      { text: '「莘莘」學子', correct: 'ㄕㄣ', wrong: ['ㄒㄧㄣ', 'ㄒㄧㄥ', 'ㄕㄥ'] },
      { text: '「垂涎」三尺', correct: 'ㄒㄧㄢˊ', wrong: ['ㄧㄢˊ', 'ㄉㄧㄢˋ', 'ㄔㄨㄟˊ'] },
      { text: '「塑」膠', correct: 'ㄙㄨˋ', wrong: ['ㄕㄨㄛˋ', 'ㄙㄨㄛˋ', 'ㄕㄨˋ'] },
      { text: '「緋」聞', correct: 'ㄈㄟ', wrong: ['ㄈㄟˇ', 'ㄆㄟˊ', 'ㄈㄟˋ'] },
      { text: '「尷尬」', correct: 'ㄍㄢ ㄍㄚˋ', wrong: ['ㄐㄧㄢ ㄐㄧㄝˋ', 'ㄍㄢ ㄐㄧㄝˋ', 'ㄐㄧㄢ ㄍㄚˋ'] },
      { text: '「罹」難', correct: 'ㄌㄧˊ', wrong: ['ㄌㄨㄛˊ', 'ㄌㄨㄛˋ', 'ㄌㄧˋ'] },
      { text: '「齟齬」', correct: 'ㄐㄩˇ ㄩˇ', wrong: ['ㄗㄨˇ ㄨˇ', 'ㄐㄧㄠ ㄨˇ', 'ㄐㄩˇ ㄨˇ'] }
    ];
    const t = typos[index % typos.length];
    return {
      question: `【字音字形測驗】請選出下列詞語「」中文字的正確讀音：\n${t.text}`,
      options: [t.correct, t.wrong[0], t.wrong[1], t.wrong[2]],
      answer: 0,
      hint: '💡 提示：這是常考的易錯字音，請注意部首與偏旁的發音差異。',
      explanation: `📖 詳解：「${t.text.replace('「', '').replace('」', '')}」的正確讀音為 ${t.correct}。`
    };
  } else if (variant === 1) {
    const wrongWords = [
      { q: '下列四個選項中，何者「沒有」錯別字？', options: ['破斧沉舟', '病入膏盲', '名烈前茅', '走投無路'], ans: 3, exp: '「破斧沉舟」應為破釜沉舟；「病入膏盲」應為病入膏肓；「名烈前茅」應為名列前茅。' },
      { q: '下列四個選項中，何者「有」錯別字？', options: ['鋌而走險', '趨之若鶩', '按步就班', '按圖索驥'], ans: 2, exp: '「按步就班」應為「按部就班」。' },
      { q: '下列詞語中，何者的用字完全正確？', options: ['走投無路', '防微度漸', '無精打彩', '一愁莫展'], ans: 0, exp: '「防微度漸」應為防微杜漸；「無精打彩」應為無精打采；「一愁莫展」應為一籌莫展。' },
      { q: '「他因為一時的貪念，落得身敗明裂的下場。」句中的錯別字為何？', options: ['明', '貪', '念', '落'], ans: 0, exp: '應為身敗「名」裂。' }
    ];
    const w = wrongWords[index % wrongWords.length];
    return {
      question: `【國文陷阱題：錯別字判讀】\n${w.q}`,
      options: w.options,
      answer: w.ans,
      hint: '💡 提示：請仔細辨認字形，有些字音同但字形不同（同音異字陷阱）。',
      explanation: `📖 詳解：${w.exp}`
    };
  } else if (variant === 2) {
    const idioms = [
      { q: '用來比喻「處境極為危險」的成語是？', options: ['盲人瞎馬', '老馬識途', '走馬看花', '指鹿為馬'], ans: 0, exp: '盲人瞎馬：比喻處境極其危險。' },
      { q: '「罄竹難書」一詞通常用來形容什麼？', options: ['罪狀極多', '書籍豐富', '筆墨用盡', '學問淵博'], ans: 0, exp: '罄竹難書：形容罪狀極多，寫都寫不完。' },
      { q: '下列哪一個成語帶有「貶義」？', options: ['推波助瀾', '見義勇為', '雪中送炭', '錦上添花'], ans: 0, exp: '推波助瀾：比喻從旁鼓動，使事態擴大，為貶義詞。' }
    ];
    const i = idioms[index % idioms.length];
    return {
      question: `【成語應用測驗】\n${i.q}`,
      options: i.options,
      answer: i.ans,
      hint: '💡 提示：思考成語背後的典故或通常使用的褒貶情境。',
      explanation: `📖 詳解：${i.exp}`
    };
  } 
  
  // 2. 修辭與句型 (Type 3, 4)
  else if (variant === 3) {
    const rhetorics = [
      { r: '轉化（擬人）', s: '春風在樹枝上跳舞，喚醒了沉睡的大地。', exp: '賦予春風與大地人類的動作（跳舞、沉睡、喚醒）。' },
      { r: '排比', s: '朋友是失落時的依靠，是迷惘時的燈塔，是寒冷時的爐火。', exp: '三個結構相似短句連續排列。' },
      { r: '誇飾', s: '那間教室安靜得連一根針掉在地上的聲音都聽得見。', exp: '用誇張的描述凸顯極度的安靜。' },
      { r: '層遞', s: '一日之計在於晨，一年之計在於春，一生之計在於勤。', exp: '範圍由小到大、程度由淺入深排列。' },
      { r: '頂真', s: '青青河畔草，草色入簾青。', exp: '以上一句的結尾作為下一句的開頭。' }
    ];
    const rh = rhetorics[index % rhetorics.length];
    const optArray = ['轉化', '排比', '誇飾', '層遞', '頂真', '譬喻'].sort(() => 0.5 - Math.random());
    // Ensure correct answer is in options
    if (!optArray.includes(rh.r.split('（')[0])) {
      optArray[0] = rh.r.split('（')[0];
    }
    const finalOpts = optArray.slice(0, 4);
    if (!finalOpts.includes(rh.r.split('（')[0])) finalOpts[0] = rh.r.split('（')[0];
    const ansIdx = finalOpts.indexOf(rh.r.split('（')[0]);
    
    return {
      question: `【語文修辭技巧判讀】\n文句：「${rh.s}」主要運用了何種修辭技巧？`,
      options: finalOpts,
      answer: ansIdx,
      hint: `💡 提示：${rh.exp.substring(0, 5)}...`,
      explanation: `📖 詳解：「${rh.s}」運用了「${rh.r}」，${rh.exp}`
    };
  } else if (variant === 4) {
    const sentenceTypes = [
      { t: '判斷句', s: '蓮，花之君子者也。', exp: '以「也」為繫詞（或省略）肯定主語屬性。' },
      { t: '敘事句', s: '故人西辭黃鶴樓。', exp: '主詞(故人)＋述語動詞(辭)＋賓語(黃鶴樓)。' },
      { t: '有無句', s: '宅邊有五柳樹。', exp: '以「有、無」表明事物存在。' },
      { t: '表態句', s: '牡丹之愛，宜乎眾矣。', exp: '主詞＋表態語描寫狀態。' }
    ];
    const st = sentenceTypes[index % sentenceTypes.length];
    return {
      question: `【中文四大句型判讀】文句：「${st.s}」在語法句型上屬於下列哪一種？`,
      options: [st.t, sentenceTypes[(index+1)%sentenceTypes.length].t, sentenceTypes[(index+2)%sentenceTypes.length].t, sentenceTypes[(index+3)%sentenceTypes.length].t],
      answer: 0,
      hint: `💡 提示：分析句中核心謂語（動詞、繫詞、有無、形容詞）。`,
      explanation: `📖 詳解：「${st.s}」為典型的「${st.t}」，${st.exp}`
    };
  }
  
  // 3. 國學常識與六書 (Type 5, 6)
  else if (variant === 5) {
    const books = [
      { q: '中國第一部紀傳體通史為何書？', ans: '《史記》', wrong: ['《漢書》', '《左傳》', '《戰國策》'], exp: '司馬遷所著的《史記》是中國第一部紀傳體通史。' },
      { q: '被譽為「群經之首」的儒家經典為何？', ans: '《易經》', wrong: ['《詩經》', '《論語》', '《孟子》'], exp: '《易經》被尊為群經之首、大道之源。' },
      { q: '下列何者為中國最早的詩歌總集？', ans: '《詩經》', wrong: ['《楚辭》', '《樂府詩集》', '《唐詩三百首》'], exp: '《詩經》是中國最早的一部詩歌總集。' }
    ];
    const b = books[index % books.length];
    return {
      question: `【國學常識】\n${b.q}`,
      options: [b.ans, ...b.wrong],
      answer: 0,
      hint: '💡 提示：回憶國文課本中關於經典名著的歷史地位。',
      explanation: `📖 詳解：${b.exp}`
    };
  } else if (variant === 6) {
    const chars = [
      { q: '「日」、「月」、「山」、「水」等字，在六書造字法則中屬於哪一類？', ans: '象形', wrong: ['指事', '會意', '形聲'], exp: '描繪事物形體的造字法為象形。' },
      { q: '「上」、「下」、「刃」、「本」等字，在六書造字法則中屬於哪一類？', ans: '指事', wrong: ['象形', '會意', '形聲'], exp: '用抽象符號標示位置或概念的造字法為指事。' },
      { q: '「休」、「明」、「武」、「信」等字，在六書造字法則中屬於哪一類？', ans: '會意', wrong: ['象形', '指事', '形聲'], exp: '組合兩個以上字根表達新義的造字法為會意。' }
    ];
    const c = chars[index % chars.length];
    return {
      question: `【漢字六書判斷】\n${c.q}`,
      options: [c.ans, ...c.wrong],
      answer: 0,
      hint: '💡 提示：分析這些字的結構是「畫圖」、「符號」、「組合」還是「形加音」。',
      explanation: `📖 詳解：${c.exp}`
    };
  }
  
  // 4. 文言文與白話散文閱讀 (Type 7, 8, 9)
  else {
    const readings = [
      {
        text: `【文言文閱讀測驗】\n「子曰：『學而時習之，不亦說乎？有朋自遠方來，不亦樂乎？人不知而不慍，不亦君子乎？』」`,
        question: `關於這段《論語》的敘述，下列何者「最不符合」孔子的原意？`,
        options: [
          '整段話主要在強調交友的重要性，學習只是其次。',
          '「人不知而不慍」是指別人不了解我，我也不會生氣。',
          '「學而時習之，不亦說乎」強調學習後時常溫習是一件快樂的事。',
          '「有朋自遠方來」指的是朋友遠道而來拜訪，令人感到高興。'
        ],
        answer: 0,
        hint: '💡 提示：分析三句話各自的重點，第一句講學習，第二句講交友，第三句講修養。',
        explanation: `📖 詳解：孔子這段話分別論述了「學習的樂趣」、「交友的快樂」與「君子的修養」，三者並重，並非只強調交友，故第一個選項錯誤。`
      },
      {
        text: `【文言文閱讀測驗】\n「世有伯樂，然後有千里馬。千里馬常有，而伯樂不常有。故雖有名馬，祇辱於奴隸人之手，駢死於槽櫪之間，不以千里稱也。」(韓愈《馬說》)`,
        question: `根據上文，韓愈認為「千里馬」之所以「不以千里稱也」的主要原因為何？`,
        options: [
          '因為缺乏懂得賞識千里馬的伯樂。',
          '因為千里馬的數量實在太少了。',
          '因為千里馬生病死在馬槽裡。',
          '因為養馬的奴隸刻意虐待千里馬。'
        ],
        answer: 0,
        hint: '💡 提示：注意「千里馬常有，而伯樂不常有」這句話的意思。',
        explanation: `📖 詳解：韓愈藉此文抒發懷才不遇之感，強調世上不乏人才(千里馬)，但缺乏能識才、用才的長官(伯樂)，導致人才被埋沒。故選「缺乏懂得賞識的伯樂」。`
      },
      {
        text: `【白話文閱讀測驗】\n「真正的成熟，不是變得冷漠，而是學會了溫柔。當你見識過世界的殘酷，卻依然願意對這個世界保持善意，那才是真正的強大。」`,
        question: `根據上文，作者認為「真正的強大」建立在什麼基礎上？`,
        options: [
          '在經歷殘酷後仍能保持善意與溫柔。',
          '具備對抗世界殘酷的冷漠態度。',
          '不再對任何事物抱持天真的幻想。',
          '能夠無條件地相信所有人的善良。'
        ],
        answer: 0,
        hint: '💡 提示：仔細閱讀最後一句「當你見識過...卻依然...」。',
        explanation: `📖 詳解：文中明確指出「見識過殘酷卻依然保持善意」才是強大，故選第一個選項。`
      }
    ];
    const r = readings[index % readings.length];
    return {
      isReading: true,
      readingText: r.text,
      question: `【深度閱讀理解】\n${r.question}`,
      options: r.options,
      answer: r.answer,
      hint: r.hint,
      explanation: r.explanation
    };
  }
}
