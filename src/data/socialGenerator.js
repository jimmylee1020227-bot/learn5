export function generateSocialQuestion(gradeId, unitId, index, difficulty, rand, conceptTag) {
  // 社會科大幅增加圖表與多樣性，擴充至 16 種變化
  const variant = Math.floor(rand() * 16);

  if (variant === 15) {
    // 社會科對話群組
    return {
      isChat: true,
      chatMessages: [
        { sender: '公民老師', text: `各位同學，關於我國「立法院」的職權，誰能舉個例子？` },
        { sender: '小明', text: `可以提出糾舉與彈劾！` },
        { sender: '小華', text: `可以審查國家預算！` },
        { sender: '小英', text: `可以解釋憲法！` }
      ],
      question: `【群組討論解謎】根據上述對話，哪一位同學的說法是正確的？`,
      options: ['小華', '小明', '小英', '全部都錯'],
      answer: 0,
      hint: `💡 提示：糾舉彈劾是監察院；解釋憲法是司法院。`,
      explanation: `📖 詳解：立法院的主要職權為制定法律與審查國家預算，故小華正確。小明說的糾舉彈劾是監察院職權；小英說的解釋憲法是司法院大法官職權。`
    };
  }

  // --- 圖表題專區 (Type 0 ~ 4) ---
  if (variant === 0) {
    // 地理氣候圖表
    const tJan = (rand() * 5 + 10).toFixed(1);
    const tJul = (rand() * 5 + 28).toFixed(1);
    const rJan = (rand() * 20 + 10).toFixed(0);
    const rJul = (rand() * 100 + 200).toFixed(0);
    return {
      isReading: true,
      readingText: `【氣候圖表分析】以下為某測站的部分氣候數據：\n=======================================\n| 月份 | 一月 | 七月 | 降水特徵 |\n|------|------|------|----------|\n| 氣溫(℃) | ${tJan} | ${tJul} | 夏雨冬乾 |\n| 降水(mm) | ${rJan} | ${rJul} | 集中夏季 |\n=======================================`,
      question: `【圖表解讀】根據上表的氣溫與降水量特徵，該測站最可能位於下列哪一種氣候區？`,
      options: ['季風氣候區', '熱帶雨林氣候區', '溫帶海洋性氣候區', '乾燥氣候區'],
      answer: 0,
      hint: '💡 提示：夏季高溫多雨、冬季低溫少雨，這是典型的季風氣候特徵。',
      explanation: `📖 詳解：圖表顯示該地七月高溫多雨，一月相對低溫乾燥（夏雨冬乾），且最冷月均溫大於0度，為典型副熱帶/溫帶季風氣候。`
    };
  } else if (variant === 1) {
    // 公民選舉圖表
    const v1 = Math.floor(rand() * 10 + 40); // 40~50%
    const v2 = Math.floor(rand() * 10 + 30); // 30~40%
    const v3 = 100 - v1 - v2;
    return {
      isReading: true,
      readingText: `【選舉圖表分析】某國舉行總統大選，三位候選人的得票率圓餅圖數據如下：\n-------------------------\n| 候選人 | 得票率(%) |\n|--------|-----------|\n| 甲黨候選人 |   ${v1}%   |\n| 乙黨候選人 |   ${v2}%   |\n| 丙黨候選人 |   ${v3}%   |\n-------------------------`,
      question: `【圖表解讀】若該國的選舉制度規定「得票最多者即當選（相對多數決）」，則下列敘述何者正確？`,
      options: [
        '甲黨候選人將直接當選總統',
        '必須舉行第二輪投票',
        '乙、丙兩黨可合組聯合政府取代甲黨',
        '該國的政黨體制必定為兩黨制'
      ],
      answer: 0,
      hint: '💡 提示：相對多數決代表「只要票數最高就贏了」，不需要過半。',
      explanation: `📖 詳解：相對多數決制下，得票率 ${v1}% 的甲黨候選人為最高票，將直接當選。不需要過半（絕對多數決才需要第二輪）。`
    };
  } else if (variant === 2) {
    // 歷史年表圖表
    return {
      isReading: true,
      readingText: `【歷史年表分析】台灣歷史重要事件時間軸：\n[1624年] 事件A：(甲)建立熱蘭遮城\n[1661年] 事件B：鄭成功率軍來台\n[1683年] 事件C：施琅攻台，鄭氏投降\n[1895年] 事件D：(乙)簽訂馬關條約割讓台灣`,
      question: `【圖表解讀】年表中的(甲)與(乙)分別代表哪兩個政權或國家？`,
      options: ['荷蘭、日本', '西班牙、日本', '荷蘭、英國', '西班牙、法國'],
      answer: 0,
      hint: '💡 提示：1624年佔領南台灣的是誰？1895年甲午戰爭後清朝把台灣割讓給誰？',
      explanation: `📖 詳解：1624年荷蘭人佔領大員（台南）建立熱蘭遮城；1895年清朝簽訂《馬關條約》將台灣割讓給日本。`
    };
  } else if (variant === 3) {
    // 經濟供需圖表
    const p1 = Math.floor(rand() * 50 + 100);
    const p2 = p1 + 50;
    return {
      isReading: true,
      readingText: `【經濟圖表分析】某商品在市場上的供給與需求數量表：\n=================================\n| 價格(元) | 需求量(個) | 供給量(個) |\n|----------|------------|------------|\n|   ${p1}   |    500     |    200     |\n|   ${p2}   |    350     |    350     |\n|   ${p2+50}   |    150     |    600     |\n=================================`,
      question: `【圖表解讀】根據上表，該商品的「均衡價格」為多少元？`,
      options: [`${p2}`, `${p1}`, `${p2+50}`, '無法判斷'],
      answer: 0,
      hint: '💡 提示：均衡價格發生在「需求量 = 供給量」的時候。',
      explanation: `📖 詳解：在價格為 ${p2} 元時，需求量與供給量皆為 350 個，達到市場均衡，故均衡價格為 ${p2} 元。`
    };
  } else if (variant === 4) {
    // 人口圖表
    return {
      isReading: true,
      readingText: `【人口金字塔圖表分析】某國的人口金字塔圖形狀呈現「底部極窄，中高年齡層極寬」的倒三角形(縮減型)結構。`,
      question: `【圖表解讀】根據該人口圖表的特徵，該國目前面臨的最嚴重社會問題為何？`,
      options: ['高齡化與少子化', '勞動力過剩導致失業率高', '學齡兒童過多導致教育資源不足', '糧食供應不足'],
      answer: 0,
      hint: '💡 提示：底部窄代表幼年人口少（少子化），上部寬代表老年人口多（高齡化）。',
      explanation: `📖 詳解：縮減型人口金字塔特徵為出生率低（底部窄）及預期壽命長（上部寬），這是典型的高齡少子化社會特徵。`
    };
  }
  
  // --- 長篇情境題與陷阱題 (Type 5 ~ 14) ---
  else if (variant < 8) {
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
  } else if (variant < 10) {
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
  } else if (variant < 12) {
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
