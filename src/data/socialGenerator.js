export function generateSocialQuestion(gradeId, unitId, index, difficulty, rand, conceptTag) {
  // 動態樂高引擎：產生絕對不重複的情境前導詞
  const people = ['阿翔', '小美', '大壯', '阿建', '班長', '老師', '歷史學家', '新聞主播', '公民老師', '小英'];
  const actions = ['在看報紙時', '準備段考時', '去圖書館查資料時', '看電視新聞時', '上課時', '在網路上看到一篇文章時'];
  const verbs = ['發現了一段有趣的記載', '提出了一個問題', '考了大家一題', '看到了以下資訊', '想請你幫忙判斷'];
  
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

  const uNum = parseInt(String(unitId).split('-').pop().replace('u', ''), 10) || 1;

  if (gradeId === 'g7') {
    let variant = -1;
    if (uNum === 1 || uNum === 2) variant = rand() > 0.5 ? 1 : 4; // 歷史
    else if (uNum === 3) variant = rand() > 0.5 ? 0 : 3; // 地理地形氣候
    else if (uNum === 4) variant = 2; // 地理人口產業

    if (variant === 0) {
      // 台灣地理氣候圖表
      const climates = [
        { tJan: '16.5', tJul: '29.2', rJan: '40', rJul: '350', ans: '季風氣候', wrongs: ['熱帶雨林氣候', '溫帶海洋性氣候', '溫帶大陸性氣候', '乾燥氣候'] },
        { tJan: '20.1', tJul: '28.5', rJan: '120', rJul: '250', ans: '季風氣候 (全年有雨)', wrongs: ['熱帶季風氣候 (乾濕分明)', '副熱帶高壓氣候', '地中海型氣候', '高山氣候'] },
        { tJan: '-2.5', tJul: '15.2', rJan: '30', rJul: '100', ans: '高山氣候', wrongs: ['副熱帶季風氣候', '熱帶季風氣候', '乾燥氣候', '海洋性氣候'] }
      ];
      const cl = climates[Math.floor(rand() * climates.length)];
      return {
        isReading: true,
        readingText: `【氣候圖表分析】以下為台灣某測站的部分氣候數據：\n=======================================\n| 月份 | 一月 | 七月 | \n|------|------|------|\n| 氣溫(℃) | ${cl.tJan} | ${cl.tJul} |\n| 降水(mm) | ${cl.rJan} | ${cl.rJul} |\n=======================================`,
        question: `【圖表解讀】${preamble}\n根據上表的氣溫與降水量，下列敘述何者最符合該測站的氣候特徵？`,
        options: [cl.ans, ...getRandItems(cl.wrongs, 3)],
        answer: 0,
        hint: '💡 提示：觀察最冷月均溫與降水分布。',
        explanation: `📖 詳解：圖表顯示該地特徵為「${cl.ans}」。`
      };
    } else if (variant === 1) {
      // 台灣歷史年表圖表
      const timelines = [
        { y1: '1624年', e1: '建立熱蘭遮城', y2: '1895年', e2: '簽訂馬關條約割讓台灣', ans: '荷蘭、日本', wrongs: ['西班牙、日本', '荷蘭、英國', '清朝、日本', '葡萄牙、法國'] },
        { y1: '1683年', e1: '施琅攻台，鄭氏投降', y2: '1885年', e2: '台灣建省', ans: '清朝、清朝', wrongs: ['明朝、清朝', '荷蘭、清朝', '清朝、日本', '鄭氏、中華民國'] },
        { y1: '1945年', e1: '第二次世界大戰結束', y2: '1987年', e2: '宣布解除戒嚴', ans: '中華民國、中華民國', wrongs: ['日本、中華民國', '日本、日本', '清朝、中華民國'] }
      ];
      const tl = timelines[Math.floor(rand() * timelines.length)];
      return {
        isReading: true,
        readingText: `【歷史年表分析】台灣歷史重要事件時間軸：\n[${tl.y1}] 事件(甲)：${tl.e1}\n...\n[${tl.y2}] 事件(乙)：${tl.e2}`,
        question: `【圖表解讀】${preamble}\n年表中的(甲)與(乙)事件發生時，統治或接收台灣的政權分別為何？`,
        options: [tl.ans, ...getRandItems(tl.wrongs, 3)],
        answer: 0,
        hint: '💡 提示：根據年份判斷當時的歷史分期。',
        explanation: `📖 詳解：正確的政權對應為「${tl.ans}」。`
      };
    } else if (variant === 2) {
      const pyramids = [
        { shape: '倒三角形(縮減型)', ans: '高齡化與少子化', wrongs: ['勞動力嚴重過剩', '學齡兒童過多導致教育資源不足', '嬰兒潮爆發', '人口紅利期'] },
        { shape: '金字塔形(增長型)', ans: '人口成長過快，幼年扶養負擔重', wrongs: ['勞動力嚴重短缺', '高齡化社會', '人口縮減危機', '勞動力過剩且老人比例高'] },
        { shape: '彈頭形(靜止型)', ans: '人口結構相對穩定', wrongs: ['嬰兒潮爆發', '男女比例嚴重失衡', '人口大量外流', '高齡化極度嚴重'] }
      ];
      const p = pyramids[Math.floor(rand() * pyramids.length)];
      const countries = ['日本', '德國', '義大利', '奈及利亞', '印度', '美國'];
      const cName = countries[Math.floor(rand() * countries.length)];
      return {
        isReading: true,
        readingText: `【人口金字塔圖表分析】${cName}的人口金字塔圖形狀呈現「${p.shape}」結構。`,
        question: `【圖表解讀】${preamble}\n根據該人口圖表的特徵，該國最可能面臨或呈現的社會現象為何？`,
        options: [p.ans, ...getRandItems(p.wrongs, 3)],
        answer: 0,
        hint: '💡 提示：不同的形狀代表不同的出生率與死亡率特徵。',
        explanation: `📖 詳解：該形狀反映的社會特徵為「${p.ans}」。`
      };
    } else if (variant === 3) {
      const geoTraps = [
        { q: '東部海岸線曲折，多天然良港', ans: '台灣東部海岸為斷層海岸，海岸線平直且缺乏天然良港。' },
        { q: '台灣最長的河川是淡水河', ans: '台灣最長的河川是濁水溪。' },
        { q: '台灣的降雨主要集中在冬季', ans: '台灣降雨主要集中在夏季（梅雨與颱風）。' },
        { q: '台灣地形以平原為主，山地佔少數', ans: '台灣地形以山地、丘陵為主，約佔三分之二。' }
      ];
      const gt = geoTraps[Math.floor(rand() * geoTraps.length)];
      const wrongs = ['這句話完全正確，沒有迷思。', '實際上是因為氣候暖化導致的。', '這與板塊運動無關。', '這是受到黑潮影響。'];
      return {
        question: `【地理陷阱題】${preamble}\n關於台灣地理的敘述，下列哪一個說法是「錯誤的迷思」？\n迷思：「${gt.q}」\n（請選出這句陳述的正確糾正）`, 
        options: [gt.ans, ...getRandItems(wrongs, 3)], 
        answer: 0, 
        hint: '💡 提示：仔細檢視台灣的實際地理特徵。',
        explanation: `📖 詳解：${gt.ans}` 
      };
    } else if (variant === 4) {
      const historyEvents = [
        { event: '熱蘭遮城', ans: '荷蘭人' },
        { event: '牡丹社事件', ans: '日本' },
        { event: '林爽文事件', ans: '清朝' },
        { event: '皇民化運動', ans: '日本' },
        { event: '三七五減租', ans: '中華民國' },
        { event: '聖多明哥城', ans: '西班牙' }
      ];
      const ev = historyEvents[Math.floor(rand() * historyEvents.length)];
      const wrongs = ['荷蘭人', '西班牙人', '清朝', '英國人', '日本', '中華民國', '葡萄牙人'].filter(x => x !== ev.ans);
      return {
        question: `【台灣歷史記憶題】${preamble}\n與「${ev.event}」密切相關的歷史勢力或政權為下列何者？`,
        options: [ev.ans, ...getRandItems(wrongs, 3)],
        answer: 0,
        hint: `💡 提示：回想發生該事件的歷史時期。`,
        explanation: `📖 詳解：正確答案為「${ev.ans}」。`
      };
    }
  } else if (gradeId === 'g8') {
    let variant = -1;
    if (uNum >= 5) variant = rand() > 0.3 ? 1 : 2; // 公民政府與法律
    else if (uNum === 3 || uNum === 4) variant = 0; // 地理 (這邊用選舉圖表代用, or fallback)
    else variant = -1; // 歷史無對應，直接fallback

    if (variant === 0) {
      // 公民選舉圖表 (地方自治/政府)
      const v1 = Math.floor(rand() * 10 + 40); // 40~50%
      const v2 = Math.floor(rand() * 10 + 30); // 30~40%
      const v3 = 100 - v1 - v2;
      const sysType = rand() > 0.5 ? '相對多數決' : '絕對多數決';
      
      let ans, exp;
      if (sysType === '相對多數決') {
        ans = '甲黨候選人將直接當選總統';
        exp = '相對多數決制下，得票最高即當選。';
      } else {
        ans = '必須舉行第二輪投票';
        exp = '絕對多數決要求過半數（>50%），甲黨未過半。';
      }
      
      const wrongs = ['乙、丙兩黨可合組聯合政府直接取代甲黨', '該國的政黨體制必定為兩黨制', '丙黨候選人可以直接宣布當選', '選舉無效需重新投票'].filter(x => x !== ans);
      
      return {
        isReading: true,
        readingText: `【選舉圖表分析】某國舉行總統大選，三位候選人的得票率圓餅圖數據如下：\n-------------------------\n| 候選人 | 得票率(%) |\n|--------|-----------|\n| 甲黨候選人 |   ${v1}%   |\n| 乙黨候選人 |   ${v2}%   |\n| 丙黨候選人 |   ${v3}%   |\n-------------------------`,
        question: `【圖表解讀】${preamble}\n若該國的選舉制度規定「${sysType}」，則下列敘述何者正確？`,
        options: [ans, ...getRandItems(wrongs, 3)],
        answer: 0,
        hint: '💡 提示：注意選舉制度的規定（是否需要過半）。',
        explanation: `📖 詳解：${exp}`
      };
    } else if (variant === 1) {
      const govChats = [
        { topic: '立法院', ans: '審查國家預算！', wrongs: ['提出糾舉與彈劾！', '解釋憲法！', '公布法律！', '統率三軍！'] },
        { topic: '監察院', ans: '提出糾正、糾舉與彈劾！', wrongs: ['審查國家預算！', '統一解釋法律！', '審理違憲政黨解散案！', '任命行政院院長！'] },
        { topic: '司法院', ans: '審理政黨違憲解散案！', wrongs: ['公布法律！', '提出糾正案！', '提出預算案！', '行使同意權！'] },
        { topic: '考試院', ans: '舉辦國家考試與公務人員銓敘！', wrongs: ['審計國家預算！', '解釋憲法！', '彈劾違法官員！', '制定法律！'] }
      ];
      const g = govChats[Math.floor(rand() * govChats.length)];
      const wItems = getRandItems(g.wrongs, 2);
      const names = getRandItems(people, 3);
      const correctName = names[0];
      
      let msgs = [];
      msgs.push({ sender: '公民老師', text: `各位同學，關於我國「${g.topic}」的職權，誰能舉個例子？` });
      
      let wIdx = 0;
      names.forEach(n => {
        if (n === correctName) {
          msgs.push({ sender: n, text: `可以${g.ans}` });
        } else {
          msgs.push({ sender: n, text: `可以${wItems[wIdx++]}` });
        }
      });
      
      return {
        isChat: true,
        chatMessages: msgs,
        question: `【群組討論解謎】根據上述對話，哪一位同學的說法是正確的？`,
        options: [correctName, ...names.filter(n => n !== correctName), '全部都錯'].slice(0, 4),
        answer: 0,
        hint: `💡 提示：釐清五院各自的專屬職權。`,
        explanation: `📖 詳解：${correctName} 說得正確，這是 ${g.topic} 的核心職權。`
      };
    } else if (variant === 2) {
      const civics = [
        { q: '「行政院對於立法院決議之法律案，如認為有窒礙難行時，得經總統之核可，移請立法院覆議。」', ans: '權力分立與制衡' },
        { q: '憲法規定「中華民國之主權屬於國民全體。」', ans: '主權在民' },
        { q: '法官須超出黨派以外，依據法律獨立審判，不受任何干涉。', ans: '司法獨立' },
        { q: '國家賠償法允許人民在公務員違法侵害權利時請求賠償。', ans: '受益權' },
        { q: '人民有信仰宗教的自由。', ans: '自由權' }
      ];
      const c = civics[Math.floor(rand() * civics.length)];
      const wrongs = ['主權在民', '權力分立與制衡', '地方自治', '多數決原則', '平等權', '參政權'].filter(x => x !== c.ans);
      return { 
        question: `【公民原則探討】${preamble}\n下列敘述體現了何種憲法原則或基本權利？\n「${c.q}」`, 
        options: [c.ans, ...getRandItems(wrongs, 3)], 
        answer: 0, 
        hint: '💡 提示：仔細判斷文字敘述中的核心精神。',
        explanation: `📖 詳解：正確答案為「${c.ans}」。` 
      };
    } else if (variant === 3) {
      const ageLaw = [
        { age: 18, action: '參選立法委員', canDo: false, exp: '18歲成年可簽約考駕照，但立委被選舉權需23歲。' },
        { age: 15, action: '未經父母同意自行購買昂貴機車', canDo: false, exp: '15歲為限制行為能力人，購買昂貴物品需法定代理人同意才生效。' },
        { age: 21, action: '參選總統', canDo: false, exp: '總統被選舉權需滿40歲。' },
        { age: 19, action: '自行到銀行開戶並申辦信用卡', canDo: true, exp: '民法下修18歲為成年，可獨立進行有效的法律行為。' },
        { age: 20, action: '參與總統大選投票', canDo: true, exp: '憲法規定選舉權年齡為20歲。' }
      ];
      const al = ageLaw[Math.floor(rand() * ageLaw.length)];
      return {
        question: `【生活法律陷阱】${preamble}\n${person}今年滿 ${al.age} 歲，根據我國現行法律，他能否合法且「單獨」有效地進行下列行為：「${al.action}」？`,
        options: [al.canDo ? '可以' : '不可以', al.canDo ? '不可以' : '可以', '需視其是否已結婚而定', '需法官同意'],
        answer: 0,
        hint: '💡 提示：注意民法成年年齡與選舉罷免法規定的不同。',
        explanation: `📖 詳解：${al.exp}`
      };
    }
  } else if (gradeId === 'g9') {
    let variant = -1;
    if (uNum === 6) variant = rand() > 0.5 ? 0 : 1; // 經濟
    else if (uNum === 1 || uNum === 2) variant = 2; // 歷史

    if (variant === 0) {
      // 經濟供需圖表
      const p1 = Math.floor(rand() * 50 + 100);
      const p2 = p1 + 50;
      const sBase = Math.floor(rand() * 200 + 200); // 200~399
      return {
        isReading: true,
        readingText: `【經濟圖表分析】某商品在市場上的供給與需求數量表：\n=================================\n| 價格(元) | 需求量(個) | 供給量(個) |\n|----------|------------|------------|\n|   ${p1}   |    ${sBase + 200}     |    ${sBase - 150}     |\n|   ${p2}   |    ${sBase}     |    ${sBase}     |\n|   ${p2+50}   |    ${sBase - 200}     |    ${sBase + 250}     |\n=================================`,
        question: `【圖表解讀】${preamble}\n根據上表，該商品的「均衡價格」為多少元？`,
        options: [`${p2}`, `${p1}`, `${p2+50}`, '無法判斷'],
        answer: 0,
        hint: '💡 提示：均衡價格發生在「需求量 = 供給量」的時候。',
        explanation: `📖 詳解：在價格為 ${p2} 元時，需求量與供給量皆為 ${sBase} 個，達到市場均衡，故均衡價格為 ${p2} 元。`
      };
    } else if (variant === 1) {
      const econEvents = [
        { q: '導致國內通貨膨脹率高達 200%。該國貨幣大幅貶值', ans: '貨幣購買力嚴重下降' },
        { q: '政府為保護國內產業，對進口外國汽車課徵高額關稅', ans: '增加外國車的進口成本，降低其競爭力' },
        { q: '中央銀行大幅調降銀行存款利率', ans: '刺激民眾將錢拿出來投資或消費' },
        { q: '市場上出現多家獨佔或寡佔企業聯合壟斷價格', ans: '損害消費者權益與破壞市場公平競爭' }
      ];
      const ev = econEvents[Math.floor(rand() * econEvents.length)];
      const wrongs = ['導致國內失業率過低', '促使政府稅收大幅減少', '帶動該國貨幣強勢升值', '降低國內物價水準', '導致出口大幅衰退'].filter(x => x !== ev.ans);
      return {
        isReading: true,
        readingText: `【新聞時事分析】\n近年來某國發生以下經濟情況：\n「${ev.q}」`,
        question: `【公民與經濟推論】${preamble}\n根據上文敘述，這項情況最可能造成何種影響或結果？`,
        options: [ev.ans, ...getRandItems(wrongs, 3)],
        answer: 0,
        hint: '💡 提示：思考供需原則與貨幣政策的基本邏輯。',
        explanation: `📖 詳解：正確的經濟推論為「${ev.ans}」。`
      };
    } else if (variant === 2) {
      const historyWorld = [
        { q: '十字軍東征主要是為了從哪一個宗教勢力手中奪回聖地耶路撒冷？', ans: '伊斯蘭教' },
        { q: '引發第一次世界大戰的導火線是發生在哪個半島的暗殺事件？', ans: '巴爾幹半島' },
        { q: '法國大革命爆發的標誌是巴黎市民攻陷了哪一座監獄？', ans: '巴士底監獄' },
        { q: '提出「天賦人權」並深深影響美國獨立宣言的啟蒙運動思想家是誰？', ans: '洛克' },
        { q: '地理大發現時期，第一位完成環球航行壯舉的航海家是誰？', ans: '麥哲倫' }
      ];
      const hw = historyWorld[Math.floor(rand() * historyWorld.length)];
      const wrongs = ['猶太教', '佛教', '亞平寧半島', '凡爾賽宮', '盧梭', '孟德斯鳩', '哥倫布', '達伽馬', '東正教'].filter(x => x !== hw.ans);
      return {
        question: `【世界歷史記憶】${preamble}\n${hw.q}`,
        options: [hw.ans, ...getRandItems(wrongs, 3)],
        answer: 0,
        hint: '💡 提示：回想世界史的關鍵名詞與人物。',
        explanation: `📖 詳解：正確答案為「${hw.ans}」。`
      };
    }
  }

  // Fallback
  const fbText = ['請問針對這個知識點，下列說法何者最正確？', '關於這方面的歷史或法規，哪一個選項是正確的？', '請選出符合此概念核心精神的敘述。'][Math.floor(rand() * 3)];
  return {
    question: `【社會科素養題】${preamble}\n關於「${conceptTag}」，${fbText}`,
    options: ['符合史實或法規之正確敘述', '常見誤解一', '常見誤解二', '不相關的史事'],
    answer: 0,
    hint: '💡 提示：回憶課本核心定義。',
    explanation: `📖 詳解：這是一道核心素養題，用來測驗基本社會科學觀念。`
  };
}
