export function generateSocialQuestion(gradeId, unitId, index, difficulty, rand, conceptTag) {
  const variant = Math.floor(rand() * 4);

  if (variant === 0) {
    // 社會科長篇情境題
    return {
      isReading: true,
      readingText: `【新聞時事分析】\n近年來，某個擁有豐富石油資源的國家，因為連年內戰與國際經濟制裁，導致國內通貨膨脹率高達 200%。該國貨幣大幅貶值，民眾為保值爭相購買黃金或美元，甚至在黑市進行以物易物。\n為解決危機，該國中央銀行決定發行新貨幣，並規定舊幣 100 萬單位只能兌換新幣 1 單位。`,
      question: `【公民與經濟推論】根據上文敘述，該國面臨的最主要經濟困境為何？`,
      options: [
        '貨幣購買力嚴重下降',
        '國內失業率過低導致缺工',
        '外匯存底過多導致通縮',
        '政府稅收過高造成民怨'
      ],
      answer: 0,
      hint: '💡 提示：通貨膨脹與貨幣大幅貶值代表錢「變薄了」。',
      explanation: `📖 詳解：通貨膨脹率高達 200% 且貨幣大幅貶值，代表同樣金額的貨幣能買到的東西變少，即「貨幣購買力嚴重下降」。`
    };
  } else if (variant === 1) {
    const historyEvents = [
      { event: '熱蘭遮城', actor: '荷蘭人', exp: '1624年荷蘭人在臺南安平建造熱蘭遮城作為貿易轉口基地。' },
      { event: '聖多明哥城', actor: '西班牙人', exp: '西班牙人曾在基隆淡水建立聖多明哥城。' },
      { event: '牡丹社事件', actor: '日本', exp: '1874年日本以琉球漂民被殺為藉口出兵台灣。' }
    ];
    const ev = historyEvents[index % historyEvents.length];
    return {
      question: `【台灣歷史】與「${ev.event}」密切相關的歷史勢力或政權為下列何者？`,
      options: [ev.actor, historyEvents[(index+1)%historyEvents.length].actor, '英國人', '法國人'],
      answer: 0,
      hint: `💡 提示：回想發生該事件的歷史背景與主導者。`,
      explanation: `📖 詳解：${ev.exp}`
    };
  } else {
    const civicEvents = [
      { event: '立法院', desc: '依法負責掌管國家預算審議、法律案制定之中央民意機關', exp: '立法院為最高立法機關。' },
      { event: '行政院', desc: '國家最高行政機關，負責執行法律與施政', exp: '行政院負責推行國家政策。' }
    ];
    const ev = civicEvents[index % civicEvents.length];
    return {
      question: `【憲政機關常識】${ev.desc}為何者？`,
      options: [ev.event, civicEvents[(index+1)%civicEvents.length].event, '司法院', '考試院'],
      answer: 0,
      hint: `💡 提示：回想五權憲法各院的職權劃分。`,
      explanation: `📖 詳解：${ev.exp}`
    };
  }
}
