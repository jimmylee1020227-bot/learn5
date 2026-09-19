export function generateScienceQuestion(gradeId, unitId, index, difficulty, rand, conceptTag) {
  const variant = Math.floor(rand() * 15);

  // --- 圖表題專區 (Type 0 ~ 4) ---
  if (variant === 0) {
    // 打點計時器圖表
    const v1 = ((index * 2) % 5) + 1;
    const v2 = ((index * 3) % 5) + 2;
    const v3 = ((index * 4) % 5) + 3;
    const v4 = ((index * 5) % 5) + 4;
    return {
      isReading: true,
      readingText: `【圖表分析題】小明進行打點計時器實驗，記錄紙帶上各點的距離如下表（每兩點之間的時間間隔為 0.1 秒）：\n---------------------------------------\n| 區間 | 0~1 | 1~2 | 2~3 | 3~4 |\n|------|-----|-----|-----|-----|\n| 距離(cm) |  ${v1}  |  ${v2}  |  ${v3}  |  ${v4}  |\n---------------------------------------`,
      question: `【資料解讀】根據上表，滑車在 0~4 區間的運動狀態為何？`,
      options: ['漸快 (加速度為正)', '等速運動', '漸慢 (加速度為負)', '靜止不動'],
      answer: 0,
      hint: '💡 提示：相同時間間隔內，若移動距離越來越大，代表速度越來越快。',
      explanation: `📖 詳解：由表格可知，每 0.1 秒滑車移動的距離從 ${v1} 增加到 ${v4} cm，距離漸增代表速度漸增，故為漸快運動。`
    };
  } else if (variant === 1) {
    // 溶解度圖表
    const t = Math.floor(rand() * 20 + 20); // 20 ~ 39
    const s = Math.floor(rand() * 30 + 10); // 10 ~ 39
    return {
      isReading: true,
      readingText: `【溶解度曲線圖表】某固體物質的溶解度數據如下表：\n=================================\n| 溫度 (℃) | 10 | 20 | 30 | 40 | 50 |\n|----------|----|----|----|----|----|\n| 溶解度(g/100g水) | 15 | 25 | 35 | 45 | 55 |\n=================================\n小華在 ${t} ℃ 的環境下，將 ${s} 克該固體加入 100 克的純水中充分攪拌。`,
      question: `【圖表解讀】根據上述表格與情境，下列關於該溶液狀態的推論何者最合理？（註：假設溫度不變）`,
      options: [
        s > (t-10)*1+15 ? '溶液會達到飽和，且有沉澱物產生' : '溶液為未飽和狀態，無沉澱物',
        s > (t-10)*1+15 ? '溶液為未飽和狀態，無沉澱物' : '溶液會達到飽和，且有沉澱物產生',
        '溶液必為過飽和狀態',
        '資料不足，無法判斷'
      ],
      answer: 0,
      hint: '💡 提示：對照表格找出該溫度下的最大溶解度，再與加入的克數比較。',
      explanation: `📖 詳解：利用內插法或查表估算該溫度下的溶解度，與加入的溶質質量進行比較，超過則有沉澱，低於則未飽和。`
    };
  } else if (variant === 2) {
    // 元素週期表片段
    return {
      isReading: true,
      readingText: `【週期表圖表分析】週期表的部分區塊如下：\n-------------------------\n| 族 | 1 (IA) | 2 (IIA) |\n|----|--------|---------|\n| 週期2 |  Li (鋰) |  Be (鈹) |\n| 週期3 |  Na (鈉) |  Mg (鎂) |\n| 週期4 |  K (鉀)  |  Ca (鈣) |\n-------------------------`,
      question: `【資料解讀】根據上表與化學常識，下列哪一個元素放入水中反應最劇烈？`,
      options: ['K (鉀)', 'Na (鈉)', 'Li (鋰)', 'Mg (鎂)'],
      answer: 0,
      hint: '💡 提示：鹼金屬族(IA)對水反應劇烈，且週期越大（原子序越大），反應越劇烈。',
      explanation: `📖 詳解：IA 族金屬（Li, Na, K）放入水中會產生劇烈反應並釋放氫氣，且反應活性隨原子序增加而變大，因此 K 最劇烈。`
    };
  } else if (variant === 3) {
    // 力與形變圖表 (虎克定律)
    const f1 = 20, x1 = 4;
    const f2 = 40, x2 = 8;
    const f3 = 60, x3 = 12;
    return {
      isReading: true,
      readingText: `【實驗數據表】小明進行彈簧伸長量實驗，在彈性限度內，記錄外力與伸長量的關係如下：\n==========================\n| 外力 (gw) | 0 | ${f1} | ${f2} | ${f3} |\n|-----------|---|----|----|----|\n| 伸長量(cm)| 0 |  ${x1} |  ${x2} | ${x3} |\n==========================`,
      question: `【圖表推演】若小明掛上 50 gw 的法碼（在彈性限度內），請問彈簧的「伸長量」為多少 cm？`,
      options: ['10', '8', '12', '14'],
      answer: 0,
      hint: '💡 提示：根據虎克定律，彈性限度內，伸長量與外力成正比。',
      explanation: `📖 詳解：由表格可知 20 gw 造成 4 cm 伸長，比例為 20:4 = 5:1。因此 50 gw 會造成 50 / 5 = 10 cm 的伸長量。`
    };
  } else if (variant === 4) {
    // 食物鏈/網圖表
    return {
      isReading: true,
      readingText: `【生態系圖表分析】某草原生態系的食物網關係如下圖（以文字表示箭頭方向，A → B 代表 A 被 B 吃）：\n  草 → 蝗蟲 → 青蛙 → 蛇 → 老鷹\n  草 → 兔子 → 老鷹\n  草 → 老鼠 → 蛇`,
      question: `【資料解讀】根據此食物網，如果「蛇」因為某種傳染病大量死亡，短時間內下列哪一種生物的數量最可能「增加」？`,
      options: ['老鼠與青蛙', '老鷹', '兔子', '草'],
      answer: 0,
      hint: '💡 提示：蛇的獵物會因為失去天敵而增加。',
      explanation: `📖 詳解：蛇吃老鼠與青蛙，當蛇大量減少，老鼠與青蛙失去主要天敵，短時間內數量會增加。`
    };
  }
  
  // --- 長篇情境題與陷阱題 (Type 5 ~ 14) ---
  else if (variant < 6) {
    // 陷阱題: 光合作用
    return {
      question: `【生物概念陷阱】關於植物的光合作用，下列敘述何者正確？`,
      options: [
        '光合作用的主要目的是製造葡萄糖，而非製造氧氣。',
        '植物只有在白天進行光合作用，晚上則進行呼吸作用。',
        '光合作用的暗反應（碳反應）只能在沒有光的時候進行。',
        '植物只要有水和二氧化碳，不需光照也能進行光合作用。'
      ],
      answer: 0,
      hint: '💡 提示：氧氣只是光合作用的「副產品」，植物自己需要的是養分。',
      explanation: `📖 詳解：光合作用的主要目的是合成有機物(葡萄糖)供植物自己使用，氧氣只是副產品。常見陷阱：白天植物也會進行呼吸作用；暗反應在白天也能進行（不需光，但非只能在暗處）。`
    };
  } else if (variant < 7) {
    // 實驗對照組情境閱讀題
    return {
      isReading: true,
      readingText: `【光合作用實驗紀錄】\n小華為了解植物進行光合作用的條件，設計了以下實驗：\n他將同一株盆栽上的兩片大小相似的葉片分別標記為 A 與 B。\n- 葉片 A：完全暴露在陽光下。\n- 葉片 B：用黑色不透光的鋁箔紙將上下兩面完全包覆。\n\n放置在陽光下三天後，小華將兩片葉片摘下，先放入沸水中煮軟，再放入熱酒精中褪去葉綠素。最後，在兩片葉片上分別滴加碘液。`,
      question: `【實驗變因與推論】根據上述實驗設計與步驟，下列敘述或預測何者最為正確？`,
      options: [
        '此實驗的「操縱變因」為是否照光。',
        '葉片 B 滴加碘液後會呈現藍黑色。',
        '放入熱酒精的目的是為了破壞細胞壁。',
        '此實驗證明了植物行光合作用需要二氧化碳。'
      ],
      answer: 0,
      hint: '💡 提示：比較葉片 A 與葉片 B 的處理差異，找出操縱變因；碘液遇澱粉會變藍黑色。',
      explanation: `📖 詳解：\n1. 兩葉片唯一的不同是有沒有被鋁箔紙包覆(是否照光)，故操縱變因為「光照」。\n2. 葉片 B 沒有光照，無法行光合作用產生澱粉，滴加碘液會呈黃褐色。\n3. 熱酒精是為了溶解葉綠素。\n4. 此實驗證明光合作用需要「光」，而非二氧化碳。`
    };
  } else if (variant < 8) {
    // 陷阱題: 細胞
    return {
      question: `【細胞構造陷阱】下列關於動植物細胞構造的比較，何者敘述正確？`,
      options: [
        '只有植物細胞有細胞壁，動物細胞沒有。',
        '只有植物細胞有粒線體，動物細胞沒有。',
        '植物細胞都有葉綠體，動物細胞都沒有。',
        '只有動物細胞有細胞核，植物細胞沒有。'
      ],
      answer: 0,
      hint: '💡 提示：注意「都有」這個陷阱，有些植物細胞（如表皮細胞、根細胞）並沒有葉綠體。',
      explanation: `📖 詳解：細胞壁是植物、真菌等才有的構造，動物沒有。常見陷阱：並非「所有」植物細胞都有葉綠體（例如根細胞就沒有）。動植物都有粒線體與細胞核。`
    };
  } else if (variant < 9) {
    const organelles = [
      { name: '葉綠體', fn: '行光合作用將光能轉化為化學能' },
      { name: '細胞核', fn: '含有遺傳物質DNA並主控細胞生理代謝' },
      { name: '粒線體', fn: '行呼吸作用產生能量ATP（細胞發電廠）' },
      { name: '細胞壁', fn: '由纖維素構成，保護並維持植物細胞固定形狀' },
      { name: '液胞', fn: '儲存水分、養分與廢物，維持細胞膨壓' }
    ];
    const org = organelles[index % organelles.length];
    return {
      question: `【細胞構造與生理功能】在顯微鏡下觀察細胞，下列何種胞器的主要功能為「${org.fn}」？`,
      options: [org.name, '核糖體', '高基氏體', organelles[(index+1)%organelles.length].name],
      answer: 0,
      hint: `💡 提示：回憶動植物細胞各胞器的核心生理功能。`,
      explanation: `📖 詳解：負責「${org.fn}」的胞器為「${org.name}」。`
    };
  } else if (variant < 10) {
    // 陷阱題: 質量與重量
    return {
      question: `【物理觀念陷阱】一名太空人將一塊石頭從地球帶到月球上，請問該石頭的「質量」與「重量」會發生什麼變化？`,
      options: [
        '質量不變，重量變小',
        '質量變小，重量不變',
        '質量與重量均變小',
        '質量與重量均不變'
      ],
      answer: 0,
      hint: '💡 提示：質量是物體所含物質的量（到哪都不變）；重量是受引力大小（月球引力較小）。',
      explanation: `📖 詳解：質量是不隨地點改變的純量；而重量(重力)會因為月球引力只有地球的 1/6 而變小。`
    };
  } else if (variant < 11) {
    // 複雜理化計算應用題
    const waterM = ((index * 15) % 100) + 100;
    const initialT = ((index * 5) % 20) + 20;
    const finalT = initialT + ((index * 3) % 30) + 10;
    const heatLost = waterM * 1 * (finalT - initialT); // 水吸收的熱量
    const metalM = ((index * 7) % 50) + 50;
    const metalInitT = ((index * 11) % 50) + 150;
    const metalSpecificHeat = (heatLost / (metalM * (metalInitT - finalT))).toFixed(3);

    return {
      isReading: true,
      readingText: `【熱量與比熱實驗】\n在絕熱良好的量熱器中，裝有 ${waterM} 公克、${initialT}°C 的冷水。\n今將一塊質量為 ${metalM} 公克、溫度為 ${metalInitT}°C 的未知金屬塊投入量熱器中。\n經過一段時間，量熱器內的水與金屬塊達到熱平衡，測得最終的平衡溫度為 ${finalT}°C。\n(假設熱量沒有散失給空氣或量熱器，水的比熱為 1.0 cal/g·°C)`,
      question: `【比熱計算推演】請根據上述實驗數據，計算該未知金屬的比熱約為多少 cal/g·°C？`,
      options: [
        `${metalSpecificHeat}`, 
        `${(metalSpecificHeat * 1.5).toFixed(3)}`, 
        `${(metalSpecificHeat * 0.5).toFixed(3)}`, 
        `${(metalSpecificHeat * 2).toFixed(3)}`
      ],
      answer: 0,
      hint: '💡 提示：利用熱量守恆定律 (放出的熱量 = 吸收的熱量)。水吸熱 = 金屬放熱。',
      explanation: `📖 詳解：\n1. 水吸收的熱量 = ${waterM} × 1.0 × (${finalT} - ${initialT}) = ${heatLost} 卡。\n2. 金屬放出的熱量 = 金屬質量 × 比熱 S × 溫度變化 = ${metalM} × S × (${metalInitT} - ${finalT})。\n3. ${heatLost} = ${metalM} × S × ${metalInitT - finalT} => S = ${heatLost} / ${metalM * (metalInitT - finalT)} ≈ ${metalSpecificHeat} cal/g·°C。`
    };
  } else if (variant < 12) {
    // 密度陷阱題
    return {
      question: `【密度觀念陷阱】將一塊鐵塊切成大小不等的兩塊，請問這兩塊鐵塊的「密度」關係為何？`,
      options: [
        '兩塊鐵塊的密度一樣大',
        '大鐵塊的密度比較大',
        '小鐵塊的密度比較大',
        '無法比較'
      ],
      answer: 0,
      hint: '💡 提示：密度是物質的特性，與體積大小無關。',
      explanation: `📖 詳解：密度 (D = M/V) 是物質本身的物理性質。將鐵塊切開，雖然質量與體積等比例縮小，但比值(密度)不變。`
    };
  } else if (variant < 13) {
    const mass = ((index * 9) % 70) + 30;
    const vol = ((index * 3) % 15) + 5;
    const density = (mass / vol).toFixed(2);
    return {
      question: `【密度測量實驗】質量為 ${mass} g 的純金屬塊，體積為 ${vol} cm³，則該金屬的密度約為多少 g/cm³？`,
      options: [`${density}`, `${(density * 1.5).toFixed(2)}`, `${(density * 0.7).toFixed(2)}`, `${(vol / mass).toFixed(2)}`],
      answer: 0,
      hint: '💡 提示：密度公式 D = M / V。',
      explanation: `📖 詳解：D = ${mass} g / ${vol} cm³ ≈ ${density} g/cm³。`
    };
  } else {
    // 牛頓第二定律陷阱
    return {
      question: `【牛頓定律陷阱】一物體在光滑水平面上作等速度直線運動，請問該物體所受的合力為何？`,
      options: ['合力為 0', '合力方向與運動方向相同', '合力方向與運動方向相反', '合力不斷增加'],
      answer: 0,
      hint: '💡 提示：牛頓第一運動定律（慣性定律）。',
      explanation: `📖 詳解：依據牛頓第一運動定律，若物體作等速度直線運動或靜止，表示其所受「合力為 0」。常見錯誤是以為有速度就一定有受力。`
    };
  }
}
