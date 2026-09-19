export function generateSocialQuestion(gradeId, unitId, index, difficulty, rand, conceptTag) {

  if (gradeId === 'g7') {
    const variant = index % 5;
    if (variant === 0) {
      // 台灣地理氣候圖表
      const climates = [
        { tJan: '16.5', tJul: '29.2', rJan: '40', rJul: '350', type: '季風氣候', ans: '夏雨冬乾，屬於典型的副熱帶季風氣候' },
        { tJan: '20.1', tJul: '28.5', rJan: '120', rJul: '250', type: '季風氣候', ans: '全年有雨，冬雨主要來自東北季風' },
        { tJan: '-2.5', tJul: '15.2', rJan: '30', rJul: '100', type: '高山氣候', ans: '全年低溫，符合台灣高山氣候特徵' }
      ];
      const cl = climates[index % climates.length];
      return {
        isReading: true,
        readingText: `【氣候圖表分析】以下為台灣某測站的部分氣候數據：\n=======================================\n| 月份 | 一月 | 七月 | \n|------|------|------|\n| 氣溫(℃) | ${cl.tJan} | ${cl.tJul} |\n| 降水(mm) | ${cl.rJan} | ${cl.rJul} |\n=======================================`,
        question: `【圖表解讀】根據上表的氣溫與降水量，下列敘述何者最符合該測站的氣候特徵？`,
        options: [cl.ans, '屬於熱帶雨林氣候', '屬於溫帶地中海型氣候', '屬於溫帶大陸性氣候'].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4),
        answer: 0,
        hint: '💡 提示：觀察最冷月均溫與降水分布。',
        explanation: `📖 詳解：圖表顯示該地特徵為「${cl.ans}」。`
      };
    } else if (variant === 1) {
      // 台灣歷史年表圖表
      const timelines = [
        { 
          y1: '1624年', e1: '(甲)建立熱蘭遮城', 
          y2: '1895年', e2: '(乙)簽訂馬關條約割讓台灣',
          ans: '荷蘭、日本'
        },
        { 
          y1: '1683年', e1: '(甲)施琅攻台，鄭氏投降', 
          y2: '1885年', e2: '(乙)台灣建省',
          ans: '清朝、清朝'
        },
        { 
          y1: '1945年', e1: '(甲)第二次世界大戰結束', 
          y2: '1987年', e2: '(乙)宣布解除戒嚴',
          ans: '中華民國、中華民國'
        }
      ];
      const tl = timelines[index % timelines.length];
      return {
        isReading: true,
        readingText: `【歷史年表分析】台灣歷史重要事件時間軸：\n[${tl.y1}] 事件A：${tl.e1}\n...\n[${tl.y2}] 事件B：${tl.e2}`,
        question: `【圖表解讀】年表中的(甲)與(乙)事件發生時，統治或接收台灣的政權分別為何？`,
        options: [tl.ans, '西班牙、日本', '荷蘭、英國', '清朝、日本'].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4),
        answer: 0,
        hint: '💡 提示：根據年份判斷當時的歷史分期。',
        explanation: `📖 詳解：正確的政權對應為「${tl.ans}」。`
      };
    } else if (variant === 2) {
      const pyramids = [
        { shape: '倒三角形(縮減型)', prob: '高齡化與少子化', opt2: '勞動力過剩' },
        { shape: '金字塔形(增長型)', prob: '人口成長過快，扶養負擔重', opt2: '勞動力嚴重短缺' },
        { shape: '彈頭形(靜止型)', prob: '人口結構相對穩定', opt2: '嬰兒潮爆發' }
      ];
      const p = pyramids[index % pyramids.length];
      return {
        isReading: true,
        readingText: `【人口金字塔圖表分析】某國的人口金字塔圖形狀呈現「${p.shape}」結構。`,
        question: `【圖表解讀】根據該人口圖表的特徵，該國最可能面臨或呈現的社會現象為何？`,
        options: [p.prob, p.opt2, '男女比例嚴重失衡', '移工大量移出'].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4),
        answer: 0,
        hint: '💡 提示：不同的形狀代表不同的出生率與死亡率特徵。',
        explanation: `📖 詳解：該形狀反映的社會特徵為「${p.prob}」。`
      };
    } else if (variant === 3) {
      const geoTraps = [
        { q: '東部海岸線曲折，多天然良港', trueOpt: '台灣東部海岸為斷層海岸，海岸線平直且缺乏天然良港。' },
        { q: '台灣最長的河川是淡水河', trueOpt: '台灣最長的河川是濁水溪。' },
        { q: '台灣的降雨主要集中在冬季', trueOpt: '台灣降雨主要集中在夏季（梅雨與颱風）。' },
        { q: '台灣地形以平原為主，山地佔少數', trueOpt: '台灣地形以山地、丘陵為主，約佔三分之二。' }
      ];
      const gt = geoTraps[index % geoTraps.length];
      return {
        question: `【地理陷阱題】關於台灣地理的敘述，下列哪一個說法是「錯誤的迷思」？（請選出下列這句錯誤陳述的正確糾正）\n迷思：「${gt.q}」`, 
        options: [gt.trueOpt, '這句話完全正確，沒有迷思。', '實際上是因為氣候暖化導致的。', '這與板塊運動無關。'], 
        answer: 0, 
        hint: '💡 提示：仔細檢視台灣的實際地理特徵。',
        explanation: `📖 詳解：${gt.trueOpt}` 
      };
    } else {
      const historyEvents = [
        { event: '熱蘭遮城', actor: '荷蘭人', exp: '1624年荷蘭人在臺南安平建造熱蘭遮城。' },
        { event: '牡丹社事件', actor: '日本', exp: '1874年日本以琉球漂民被殺為藉口出兵台灣。' },
        { event: '林爽文事件', actor: '清朝', exp: '清代台灣規模最大的民變，後來由福康安平定。' },
        { event: '皇民化運動', actor: '日本', exp: '日治時期後期推行的同化政策，鼓勵改日本姓名等。' },
        { event: '三七五減租', actor: '中華民國', exp: '戰後初期推行的土地改革政策之一。' }
      ];
      const ev = historyEvents[index % historyEvents.length];
      return {
        question: `【台灣歷史記憶題】\n與「${ev.event}」密切相關的歷史勢力或政權為下列何者？`,
        options: [ev.actor, '西班牙人', '清朝', '英國人'].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4),
        answer: 0,
        hint: `💡 提示：回想發生該事件的歷史時期。`,
        explanation: `📖 詳解：${ev.exp}`
      };
    }
  } else if (gradeId === 'g8') {
    const variant = index % 4;
    if (variant === 0) {
      // 公民選舉圖表 (地方自治/政府)
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
    } else if (variant === 1) {
      const govChats = [
        { topic: '立法院', wrong1: '提出糾舉與彈劾！', wrong2: '解釋憲法！', correct: '審查國家預算！', exp: '糾舉彈劾是監察院；解釋憲法是司法院；立法院負責制定法律與審查預算。' },
        { topic: '監察院', wrong1: '審查國家預算！', wrong2: '統一解釋法律！', correct: '提出糾正、糾舉與彈劾！', exp: '審查預算是立法院；解釋法律是司法院；監察院負責彈劾、糾舉與審計。' },
        { topic: '司法院', wrong1: '公布法律！', wrong2: '提出糾正案！', correct: '審理政黨違憲解散案！', exp: '公布法律是總統；糾正案是監察院；司法院憲法法庭負責解釋憲法及審理政黨違憲解散案。' }
      ];
      const g = govChats[index % govChats.length];
      return {
        isChat: true,
        chatMessages: [
          { sender: '公民老師', text: `各位同學，關於我國「${g.topic}」的職權，誰能舉個例子？` },
          { sender: '小明', text: `可以${g.wrong1}` },
          { sender: '小華', text: `可以${g.correct}` },
          { sender: '小英', text: `可以${g.wrong2}` }
        ],
        question: `【群組討論解謎】根據上述對話，哪一位同學的說法是正確的？`,
        options: ['小華', '小明', '小英', '全部都錯'],
        answer: 0,
        hint: `💡 提示：釐清五院各自的專屬職權。`,
        explanation: `📖 詳解：小華正確。${g.exp}`
      };
    } else if (variant === 2) {
      const civics = [
        { q: '「行政院對於立法院決議之法律案，如認為有窒礙難行時，得經總統之核可，移請立法院覆議。」體現了何種原則？', ans: '權力分立與制衡' },
        { q: '憲法規定「中華民國之主權屬於國民全體。」體現了何種原則？', ans: '主權在民' },
        { q: '法官須超出黨派以外，依據法律獨立審判，不受任何干涉。體現了何種原則？', ans: '司法獨立' },
        { q: '國家賠償法允許人民在公務員違法侵害權利時請求賠償。體現了何種權利的保障？', ans: '受益權' }
      ];
      const c = civics[index % civics.length];
      return { 
        question: `【公民原則探討】${c.q}`, 
        options: [c.ans, '主權在民', '權力分立與制衡', '地方自治', '多數決原則'].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4), 
        answer: 0, 
        hint: '💡 提示：仔細判斷文字敘述中的核心精神。',
        explanation: `📖 詳解：正確答案為「${c.ans}」。` 
      };
    } else {
      const ageLaw = [
        { age: 18, action: '參選立法委員', canDo: false, exp: '18歲成年可簽約考駕照，但立委被選舉權需23歲。' },
        { age: 15, action: '未經父母同意自行購買昂貴機車', canDo: false, exp: '15歲為限制行為能力人，購買昂貴物品需法定代理人同意才生效。' },
        { age: 21, action: '參選總統', canDo: false, exp: '總統被選舉權需滿40歲。' },
        { age: 19, action: '自行到銀行開戶並申辦信用卡', canDo: true, exp: '民法下修18歲為成年，可獨立進行有效的法律行為。' }
      ];
      const al = ageLaw[index % ageLaw.length];
      return {
        question: `【生活法律陷阱】小華今年滿 ${al.age} 歲，根據我國現行法律，他能否合法且有效地進行「${al.action}」？`,
        options: [al.canDo ? '可以' : '不可以', al.canDo ? '不可以' : '可以', '需視其是否已結婚而定', '需法官同意'],
        answer: 0,
        hint: '💡 提示：注意民法成年年齡與選舉罷免法規定的不同。',
        explanation: `📖 詳解：${al.exp}`
      };
    }
  } else if (gradeId === 'g9') {
    const variant = index % 3;
    if (variant === 0) {
      // 經濟供需圖表
      const p1 = Math.floor(rand() * 50 + 100);
      const p2 = p1 + 50;
      const sBase = Math.floor(rand() * 200 + 200); // 200~399
      return {
        isReading: true,
        readingText: `【經濟圖表分析】某商品在市場上的供給與需求數量表：\n=================================\n| 價格(元) | 需求量(個) | 供給量(個) |\n|----------|------------|------------|\n|   ${p1}   |    ${sBase + 200}     |    ${sBase - 150}     |\n|   ${p2}   |    ${sBase}     |    ${sBase}     |\n|   ${p2+50}   |    ${sBase - 200}     |    ${sBase + 250}     |\n=================================`,
        question: `【圖表解讀】根據上表，該商品的「均衡價格」為多少元？`,
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
      const ev = econEvents[index % econEvents.length];
      return {
        isReading: true,
        readingText: `【新聞時事分析】\n近年來某國發生以下經濟情況：\n「${ev.q}」`,
        question: `【公民與經濟推論】根據上文敘述，這項情況最可能造成何種影響或結果？`,
        options: [ev.ans, '導致國內失業率過低', '促使政府稅收大幅減少', '帶動該國貨幣強勢升值'].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4),
        answer: 0,
        hint: '💡 提示：思考供需原則與貨幣政策的基本邏輯。',
        explanation: `📖 詳解：正確的經濟推論為「${ev.ans}」。`
      };
    } else {
      const historyWorld = [
        { q: '十字軍東征主要是為了從哪一個宗教勢力手中奪回聖地耶路撒冷？', ans: '伊斯蘭教' },
        { q: '引發第一次世界大戰的導火線是發生在哪個半島的暗殺事件？', ans: '巴爾幹半島' },
        { q: '法國大革命爆發的標誌是巴黎市民攻陷了哪一座監獄？', ans: '巴士底監獄' },
        { q: '提出「天賦人權」並深深影響美國獨立宣言的啟蒙運動思想家是誰？', ans: '洛克' },
        { q: '地理大發現時期，第一位完成環球航行壯舉（雖然途中身亡）的航海家是誰？', ans: '麥哲倫' }
      ];
      const hw = historyWorld[index % historyWorld.length];
      return {
        question: `【世界歷史記憶】${hw.q}`,
        options: [hw.ans, '猶太教', '佛教', '巴爾幹半島', '亞平寧半島', '凡爾賽宮', '盧梭', '孟德斯鳩', '哥倫布', '達伽馬'].filter((v, i, a) => a.indexOf(v) === i && v !== hw.ans).slice(0, 3),
        answer: 0,
        hint: '💡 提示：回想世界史的關鍵名詞與人物。',
        explanation: `📖 詳解：正確答案為「${hw.ans}」。`
      };
    }
  }

  // Fallback
  return {
    question: `【社會科核心觀念題】關於「${conceptTag}」，下列敘述何者正確？`,
    options: ['符合史實或法規之正確敘述', '常見誤解一', '常見誤解二', '不相關的史事'],
    answer: 0,
    hint: '💡 提示：回憶課本核心定義。',
    explanation: `📖 詳解：這是一道核心素養題，用來測驗基本社會科學觀念。`
  };
}
