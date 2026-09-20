// 108 課綱英語科全單元題目引擎（支援會考雙文本閱讀、全國英語競賽、私中進階字彙與分級難度）
export function generateEnglishQuestion(gradeId, unitId, index, difficulty = 'medium', rand, conceptTag) {
  const isExtreme = difficulty === 'extreme' || difficulty === 'hardest';
  const isHard = difficulty === 'hard';
  const uNum = parseInt(String(unitId).split('-').pop().replace('u', ''), 10) || 1;

  // 動態樂高引擎：產生情境前導詞
  const people = ['Alex', 'David', 'Emily', 'Sarah', 'Kevin', 'Grace', 'Brian', 'Chloe', 'Mr. White', 'English Club Leader'];
  const actions = ['reading an article from an international news magazine', 'preparing for the junior high English competition', 'analyzing a challenging passage from the comprehensive exam', 'participating in a Model United Nations conference'];
  const verbs = ['noticed this critical grammar point', 'encountered a sophisticated vocabulary usage', 'wanted to test your reading comprehension ability', 'found this interesting reading passage'];
  
  const person = people[Math.floor(rand() * people.length)];
  const action = actions[Math.floor(rand() * actions.length)];
  const verb = verbs[Math.floor(rand() * verbs.length)];
  const preamble = `While ${action}, ${person} ${verb}.`;

  function getRandItems(arr, count) {
    const res = [];
    const pool = [...arr];
    for (let i = 0; i < count; i++) {
      if (pool.length === 0) break;
      const idx = Math.floor(rand() * pool.length);
      res.push(pool.splice(idx, 1)[0]);
    }
    return res;
  }

  // ==========================================
  // 1. 最難試題 (Extreme / Hardest)：會考跨領域長文、全國英語競賽、私中題
  // ==========================================
  if (isExtreme || gradeId === 'past-exams' || gradeId === 'private-school') {
    if (gradeId === 'g7' || gradeId === 'private-school') {
      // 私中進階單字與邏輯推論
      return {
        question: `【私中保送/英語競賽-進階字彙與語境】${preamble}\nThe government took immediate measures to ________ the crisis, preventing further economic instability throughout the nation.`,
        options: [
          `mitigate (減輕、緩和)`,
          `deteriorate (惡化)`,
          `fabricate (捏造)`,
          `neglect (忽視)`
        ],
        answer: 0,
        hint: `💡 提示：從後方 preventing further economic instability (防止進一步不穩定) 推知應選正向減緩危機之字詞。`,
        explanation: `📖 詳解：mitigate 意為「緩和、減輕」，符合句意「政府立即採取措施以緩和危機」。deteriorate 為惡化，fabricate 為偽造。私中與競賽常考核高中程度高階動詞。`
      };
    } else if (gradeId === 'g8' || gradeId === 'past-exams') {
      // 會考長篇雙文本跨領域閱讀 (A++壓軸)
      return {
        isReading: true,
        readingText: `【會考精選-跨領域閱讀】\n[Text A - News Report]\nThe city council recently passed a "Plastic-Free Wednesday" law. On Wednesdays, all restaurants and convenience stores are prohibited from providing single-use plastic containers or utensils. Violators will face a fine of up to $10,000 NTD.\n\n[Text B - Public Reaction Forum]\nUser "EcoWarrior": "Finally! Our oceans are suffering, and this is a great step forward!"\nUser "BusyParent": "While I support protecting the environment, it is extremely inconvenient for parents who need to buy takeout dinners after working overtime."`,
        question: `【會考A++題組-多文本觀點對比】Based on both texts, which statement best summarizes the reaction of the public?`,
        options: [
          `While people generally agree with environmental protection, some express practical concerns about daily convenience.`,
          `All citizens strongly oppose the new regulation because the fine is unreasonably low.`,
          `Restaurants are glad to save money, but the city council refuses to enforce the law.`,
          `No one cares about ocean pollution because takeout food is too cheap.`
        ],
        answer: 0,
        hint: `💡 提示：對比 EcoWarrior (支持環境) 與 BusyParent (支持環保但擔憂加班外帶不便) 的論點。`,
        explanation: `📖 詳解：Text B 中兩位受訪者代表社會多元聲音：大家認同保護環境的大方向，但對於外食族家長而言確實存在生活上的不便，故選項 (A) 最為中肯全面。`
      };
    } else {
      // 國三 (g9) 文法倒裝句與虛擬語氣 (競賽/私中超難題)
      return {
        question: `【全國英語競賽-高級文法倒裝與假設語氣】${preamble}\n________ she arrived at the airport, she realized that she had left her passport on the kitchen table.`,
        options: [
          `Hardly had (剛...就...)`,
          `No sooner did`,
          `Seldom has`,
          `Scarcely did`
        ],
        answer: 0,
        hint: `💡 提示：Hardly had + S + p.p. ... when/before... 表「一...就...」之否定倒裝句型。`,
        explanation: `📖 詳解：否定副詞 Hardly 置於句首時，句子必須採倒裝結構，且時態用過去完成式：Hardly had + S + p.p.。因此 Hardly had 為唯一完全符合文法規範之正確選項。`
      };
    }
  }

  // ==========================================
  // 2. 基礎與段考精選試題 (Easy & Medium)
  // ==========================================
  const grammarItems = [
    { q: 'Neither Jack nor his sisters ________ planning to attend the party tonight.', ans: 'are', wrongs: ['is', 'be', 'was'] },
    { q: 'If it ________ tomorrow, the outdoor soccer match will be rescheduled.', ans: 'rains', wrongs: ['will rain', 'rained', 'is raining'] },
    { q: 'The novel was so fascinating that she couldn\'t help ________ it all night long.', ans: 'reading', wrongs: ['to read', 'read', 'reads'] }
  ];
  const gItem = grammarItems[Math.floor(rand() * grammarItems.length)];

  return {
    question: `【英語科段考精選文法】${preamble}\n${gItem.q}`,
    options: [gItem.ans, ...getRandItems(gItem.wrongs, 3)],
    answer: 0,
    hint: `💡 提示：注意主詞與動詞的一致性 (Subject-Verb Agreement) 或假設語氣副詞子句時態。`,
    explanation: `📖 詳解：正確選項為「${gItem.ans}」。`
  };
}
