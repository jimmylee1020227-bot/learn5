export function generateScienceQuestion(gradeId, unitId, index, difficulty, rand, conceptTag) {
  const variant = Math.floor(rand() * 10);

  if (gradeId === 'g7') {
    if (variant === 0) {
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
        explanation: `📖 詳解：光合作用的主要目的是合成有機物(葡萄糖)供植物自己使用，氧氣只是副產品。`
      };
    } else if (variant === 1) {
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
    } else if (variant === 2) {
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
        explanation: `📖 詳解：細胞壁是植物、真菌等才有的構造，動物沒有。`
      };
    } else {
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
    }
  } else if (gradeId === 'g8') {
    if (variant === 0) {
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
        explanation: `📖 詳解：利用內插法或查表估算該溫度下的溶解度，與加入的溶質質量進行比較。`
      };
    } else if (variant === 1) {
      // 實驗討論 Chat (鎂帶燃燒)
      return {
        isChat: true,
        chatMessages: [
          { sender: '小明', text: `今天的理化實驗好神奇！把鎂帶折斷，然後點火燃燒，發出超刺眼的白光！` },
          { sender: '小華', text: `對啊，老師說鎂帶折斷是物理變化，但燃燒是化學變化。` },
          { sender: '小明', text: `那燃燒後剩下的白色粉末，加水會變成什麼酸性還鹼性啊？` }
        ],
        question: `【對話情境解謎】根據上述對話，鎂帶燃燒後的產物溶於水，水溶液的酸鹼性為何？`,
        options: ['鹼性', '酸性', '中性', '不溶於水，無法測量'],
        answer: 0,
        hint: `💡 提示：金屬氧化物（氧化鎂）溶於水，會形成氫氧化物。`,
        explanation: `📖 詳解：金屬氧化物（氧化鎂 MgO）溶於水會生成氫氧化鎂 Mg(OH)2，水溶液呈鹼性。`
      };
    } else if (variant === 2) {
      return {
        question: `【物理觀念陷阱】一名太空人將一塊石頭從地球帶到月球上，請問該石頭的「質量」與「重量」會發生什麼變化？`,
        options: ['質量不變，重量變小', '質量變小，重量不變', '質量與重量均變小', '質量與重量均不變'],
        answer: 0,
        hint: '💡 提示：質量是不變的，重量受引力影響。',
        explanation: `📖 詳解：質量是不隨地點改變的純量；而重量(重力)會因為月球引力只有地球的 1/6 而變小。`
      };
    } else {
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
    }
  } else if (gradeId === 'g9') {
    if (variant === 0) {
      // 電路 SVG 圖
      return {
        isSvg: true,
        svgContent: `<svg width="250" height="150" viewBox="0 0 250 150" xmlns="http://www.w3.org/2000/svg">
          <path d="M 50 100 L 50 50 L 200 50 L 200 100" fill="none" stroke="#64748b" stroke-width="3" />
          <path d="M 50 100 L 100 100" fill="none" stroke="#64748b" stroke-width="3" />
          <path d="M 150 100 L 200 100" fill="none" stroke="#64748b" stroke-width="3" />
          <line x1="100" y1="85" x2="100" y2="115" stroke="#0f172a" stroke-width="4" />
          <line x1="110" y1="90" x2="110" y2="110" stroke="#0f172a" stroke-width="8" />
          <line x1="120" y1="85" x2="120" y2="115" stroke="#0f172a" stroke-width="4" />
          <line x1="130" y1="90" x2="130" y2="110" stroke="#0f172a" stroke-width="8" />
          <text x="110" y="135" font-size="12" fill="#0f172a" font-weight="bold">3V</text>
          <circle cx="125" cy="50" r="15" fill="#fef08a" stroke="#ca8a04" stroke-width="3" />
          <path d="M 115 50 L 135 50" fill="none" stroke="#ca8a04" stroke-width="2" />
          <path d="M 125 40 L 125 60" fill="none" stroke="#ca8a04" stroke-width="2" />
        </svg>`,
        question: `【電路圖形判讀】如上圖所示，若每個電池的電壓為 1.5V，請問此電路中的燈泡兩端電壓為多少？`,
        options: ['3.0V', '1.5V', '0V', '4.5V'],
        answer: 0,
        hint: '💡 提示：電池串聯時，總電壓為各個電池電壓的總和。',
        explanation: `📖 詳解：圖中顯示兩個電池串聯，因此總電壓為 1.5V + 1.5V = 3.0V。燈泡與電池並聯，兩端電壓等於 3.0V。`
      };
    } else if (variant === 1) {
      const v1 = ((index * 2) % 5) + 1;
      const v2 = ((index * 3) % 5) + 2;
      const v3 = ((index * 4) % 5) + 3;
      const v4 = ((index * 5) % 5) + 4;
      return {
        isReading: true,
        readingText: `【圖表分析題】小明進行打點計時器實驗，記錄紙帶上各點的距離如下表（時間間隔 0.1s）：\n| 區間 | 0~1 | 1~2 | 2~3 | 3~4 |\n|------|-----|-----|-----|-----|\n| 距離(cm) |  ${v1}  |  ${v2}  |  ${v3}  |  ${v4}  |`,
        question: `【資料解讀】根據上表，滑車的運動狀態為何？`,
        options: ['漸快 (加速度為正)', '等速運動', '漸慢 (加速度為負)', '靜止不動'],
        answer: 0,
        hint: '💡 提示：相同時間間隔內，若移動距離越來越大，代表速度越來越快。',
        explanation: `📖 詳解：距離漸增代表速度漸增，故為漸快運動。`
      };
    } else {
      return {
        question: `【牛頓定律陷阱】一物體在光滑水平面上作等速度直線運動，請問該物體所受的合力為何？`,
        options: ['合力為 0', '合力方向與運動方向相同', '合力方向與運動方向相反', '合力不斷增加'],
        answer: 0,
        hint: '💡 提示：牛頓第一運動定律（慣性定律）。',
        explanation: `📖 詳解：依據牛頓第一運動定律，若物體作等速度直線運動或靜止，表示其所受「合力為 0」。`
      };
    }
  }

  // Fallback
  return {
    question: `【自然科學核心觀念題】關於「${conceptTag}」，下列敘述何者正確？`,
    options: ['符合科學原理之正確敘述', '常見誤解一', '常見誤解二', '不相關的變數'],
    answer: 0,
    hint: '💡 提示：回憶課本核心定義。',
    explanation: `📖 詳解：這是一道核心素養題，用來測驗基本科學觀念。`
  };
}
