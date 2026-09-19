export function generateSocialQuestion(gradeId, unitId, index, difficulty, rand, conceptTag) {
  const variant = Math.floor(rand() * 10);

  if (variant < 3) {
    // 社會科長篇情境題
    const readings = [
      {
        text: `【新聞時事分析】\n近年來，某個擁有豐富石油資源的國家，因為連年內戰與國際經濟制裁，導致國內通貨膨脹率高達 200%。該國貨幣大幅貶值，民眾為保值爭相購買黃金或美元，甚至在黑市進行以物易物。\n為解決危機，該國中央銀行決定發行新貨幣，並規定舊幣 100 萬單位只能兌換新幣 1 單位。`,
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
      },
      {
        text: `【歷史文獻閱讀】\n「自從某項條約簽訂後，台灣正式開港通商。外國洋行紛紛在安平、打狗、淡水等地設立據點，大量輸出台灣的茶葉、樟腦與蔗糖，使台灣的經濟重心逐漸由南向北轉移。」`,
        question: `【台灣歷史推演】上文所指的「某項條約」最可能是下列何者？`,
        options: [
          '天津條約',
          '馬關條約',
          '南京條約',
          '辛丑和約'
        ],
        answer: 0,
        hint: '💡 提示：台灣開港通商（安平、打狗、淡水、雞籠）是受到哪一場戰爭與條約的影響？',
        explanation: `📖 詳解：英法聯軍之役後簽訂的《天津條約》，迫使清廷開放台灣的安平、打狗、淡水、雞籠為通商口岸。`
      }
    ];
    const r = readings[index % readings.length];
    return {
      isReading: true,
      readingText: r.text,
      question: r.question,
      options: r.options,
      answer: r.answer,
      hint: r.hint,
      explanation: r.explanation
    };
  } else if (variant < 5) {
    // 陷阱題: 地理與氣候
    const geoTraps = [
      { q: '台灣每逢夏季經常受到颱風侵襲。請問颱風在北半球的氣流旋轉方向為何？', options: ['逆時針方向向內輻合', '順時針方向向內輻合', '逆時針方向向外輻散', '順時針方向向外輻散'], ans: 0, exp: '颱風是低氣壓，在北半球受科氏力影響，氣流會「逆時針向內輻合」。陷阱：高氣壓才是順時針向外輻散。' },
      { q: '關於台灣地形的敘述，下列何者「錯誤」？', options: ['東部海岸線曲折，多天然良港', '西部多為平原與盆地', '中央山脈縱貫南北，為台灣屋脊', '河川多短小流急'], ans: 0, exp: '台灣東部海岸為「斷層海岸」，海岸線平直且缺乏天然良港（除了蘇澳港等少數）。陷阱：西部（如北部岬灣）才比較多曲折海岸。' }
    ];
    const g = geoTraps[index % geoTraps.length];
    return {
      question: `【地理環境陷阱題】\n${g.q}`,
      options: g.options,
      answer: g.ans,
      hint: '💡 提示：仔細回想北半球氣旋特性以及台灣東西岸的地形差異。',
      explanation: `📖 詳解：${g.exp}`
    };
  } else if (variant < 7) {
    // 陷阱題: 公民與法律
    const civicTraps = [
      { q: '小華今年滿 18 歲，根據我國現行法律，他「無法」合法進行下列哪一項行為？', options: ['參選立法委員', '自行申辦信用卡', '報考汽機車駕照', '與他人簽訂有效的買賣契約'], ans: 0, exp: '我國《民法》已將成年年齡下修至 18 歲，因此可以自己辦卡、簽約、考駕照。但《憲法》規定，選舉權為 20 歲，被選舉權（參選立委）為 23 歲。這是一個常見的年齡陷阱。' },
      { q: '「行政院對於立法院決議之法律案、預算案、條約案，如認為有窒礙難行時，得經總統之核可，移請立法院覆議。」這段敘述體現了民主政治中的何種原則？', options: ['權力分立與制衡', '主權在民', '地方自治', '多數決原則'], ans: 0, exp: '覆議制度是行政機關制衡立法機關的手段，體現了「權力分立與制衡」的精神。' }
    ];
    const c = civicTraps[index % civicTraps.length];
    return {
      question: `【公民與法律陷阱題】\n${c.q}`,
      options: c.options,
      answer: c.ans,
      hint: '💡 提示：注意 18 歲成年（民法）與選舉罷免權（憲法）的年齡門檻差異。',
      explanation: `📖 詳解：${c.exp}`
    };
  } else {
    // 歷史人物與事件
    const historyEvents = [
      { event: '熱蘭遮城', actor: '荷蘭人', exp: '1624年荷蘭人在臺南安平建造熱蘭遮城作為貿易轉口基地。' },
      { event: '聖多明哥城', actor: '西班牙人', exp: '西班牙人曾在基隆淡水建立聖多明哥城。' },
      { event: '牡丹社事件', actor: '日本', exp: '1874年日本以琉球漂民被殺為藉口出兵台灣。' },
      { event: '林爽文事件', actor: '清朝', exp: '清代台灣規模最大、歷時最久的農民起義。' }
    ];
    const ev = historyEvents[index % historyEvents.length];
    const optArray = ['荷蘭人', '西班牙人', '日本', '清朝', '英國人', '法國人'].sort(() => 0.5 - Math.random());
    if (!optArray.includes(ev.actor)) optArray[0] = ev.actor;
    const finalOpts = optArray.slice(0, 4);
    if (!finalOpts.includes(ev.actor)) finalOpts[0] = ev.actor;
    const ansIdx = finalOpts.indexOf(ev.actor);

    return {
      question: `【台灣歷史記憶題】\n與「${ev.event}」密切相關的歷史勢力或政權為下列何者？`,
      options: finalOpts,
      answer: ansIdx,
      hint: `💡 提示：回想發生該事件的歷史背景與主導者。`,
      explanation: `📖 詳解：${ev.exp}`
    };
  }
}
