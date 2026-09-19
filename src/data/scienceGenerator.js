export function generateScienceQuestion(gradeId, unitId, index, difficulty, rand, conceptTag) {

  if (gradeId === 'g7') {
    const variant = index % 4;
    if (variant === 0) {
      const traps = [
        { q: '關於植物的光合作用', opts: ['主要目的是製造葡萄糖，而非製造氧氣。', '只有在白天進行，晚上則進行呼吸作用。', '暗反應只能在沒有光的時候進行。', '只要有水和二氧化碳，不需光照也能進行。'], ans: 0 },
        { q: '關於人類的消化作用', opts: ['胃液中的鹽酸主要用來殺菌，而非直接分解蛋白質。', '大腸是吸收養分的主要器官。', '膽汁中含有大量消化酵素。', '唾液只能分解脂肪。'], ans: 0 },
        { q: '關於植物的運輸作用', opts: ['木質部負責運送水分，方向只能由下往上。', '韌皮部只在白天運送養分。', '水分運輸的動力主要來自根壓，而非蒸散作用。', '所有植物都有維管束。'], ans: 0 },
        { q: '關於神經與內分泌系統', opts: ['神經系統反應快但作用短暫，內分泌系統反應慢但作用持久。', '反射動作都由脊髓控制，與腦幹無關。', '所有激素都在血液中隨機流動，不具專一性。', '人類只有在緊張時才會分泌腎上腺素。'], ans: 0 }
      ];
      const t = traps[index % traps.length];
      return {
        question: `【生物概念陷阱】${t.q}，下列敘述何者正確？`,
        options: t.opts,
        answer: t.ans,
        hint: '💡 提示：仔細分辨常見的迷思概念。',
        explanation: `📖 詳解：正確選項為「${t.opts[t.ans]}」。`
      };
    } else if (variant === 1) {
      const ecosystems = [
        { name: '草原生態系', web: '草 → 蝗蟲 → 青蛙 → 蛇 → 老鷹\n草 → 兔子 → 老鷹\n草 → 老鼠 → 蛇', ans: '老鼠與青蛙' },
        { name: '海洋生態系', web: '浮游藻類 → 磷蝦 → 小魚 → 企鵝 → 虎鯨\n浮游藻類 → 磷蝦 → 鬚鯨', ans: '磷蝦' },
        { name: '森林生態系', web: '樹葉 → 毛毛蟲 → 小鳥 → 蛇\n樹果 → 松鼠 → 老鷹\n樹果 → 老鼠 → 蛇', ans: '毛毛蟲與老鼠' }
      ];
      const eco = ecosystems[index % ecosystems.length];
      return {
        isReading: true,
        readingText: `【生態系圖表分析】某${eco.name}的食物網關係如下圖（以文字表示箭頭方向）：\n${eco.web}`,
        question: `【資料解讀】根據此食物網，如果「蛇 (或次級消費者)」因為某種傳染病大量死亡，短時間內下列哪一種生物的數量最可能「增加」？`,
        options: [eco.ans, '頂級掠食者(老鷹)', '生產者', '無法判斷'],
        answer: 0,
        hint: '💡 提示：掠食者減少，獵物會增加。',
        explanation: `📖 詳解：當捕食者大量減少，其直接獵物失去天敵，短時間內數量會增加。`
      };
    } else if (variant === 2) {
      const cellTraps = [
        { q: '關於動植物細胞構造的比較', opts: ['只有植物細胞有細胞壁，動物細胞沒有。', '只有植物細胞有粒線體，動物細胞沒有。', '植物細胞都有葉綠體，動物細胞都沒有。', '只有動物細胞有細胞核，植物細胞沒有。'], ans: 0 },
        { q: '關於顯微鏡的使用', opts: ['將低倍物鏡換成高倍物鏡時，視野會變暗且範圍變小。', '放大倍率等於目鏡加物鏡的倍數。', '觀察洋蔥表皮細胞時，可清楚看見葉綠體。', '使用高倍物鏡時，應大範圍轉動粗調節輪。'], ans: 0 },
        { q: '關於細胞的分裂', opts: ['減數分裂後，子細胞的染色體數目為原來的一半。', '細胞分裂會產生四個子細胞。', '精子與卵子是透過細胞分裂產生的。', '人類所有的細胞都具有 46 條染色體。'], ans: 0 }
      ];
      const ct = cellTraps[index % cellTraps.length];
      return {
        question: `【細胞與顯微鏡陷阱】${ct.q}，何者敘述正確？`,
        options: ct.opts,
        answer: ct.ans,
        hint: '💡 提示：注意「都有」與「只有」的陷阱。',
        explanation: `📖 詳解：正確敘述為「${ct.opts[ct.ans]}」。`
      };
    } else {
      const organelles = [
        { name: '葉綠體', fn: '行光合作用將光能轉化為化學能' },
        { name: '細胞核', fn: '含有遺傳物質DNA並主控細胞生理代謝' },
        { name: '粒線體', fn: '行呼吸作用產生能量ATP（細胞發電廠）' },
        { name: '細胞壁', fn: '由纖維素構成，保護並維持植物細胞固定形狀' },
        { name: '液胞', fn: '儲存水分、養分與廢物，維持細胞膨壓' },
        { name: '細胞膜', fn: '控制物質進出細胞的門戶' }
      ];
      const org = organelles[index % organelles.length];
      return {
        question: `【細胞構造與生理功能】在顯微鏡下觀察細胞，下列何種胞器的主要功能為「${org.fn}」？`,
        options: [org.name, '核糖體', '高基氏體', organelles[(index+1)%organelles.length].name].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4),
        answer: 0,
        hint: `💡 提示：回憶動植物細胞各胞器的核心生理功能。`,
        explanation: `📖 詳解：負責「${org.fn}」的胞器為「${org.name}」。`
      };
    }
  } else if (gradeId === 'g8') {
    const variant = index % 4;
    if (variant === 0) {
      // 溶解度圖表
      const t = Math.floor(rand() * 20 + 20); // 20 ~ 39
      const s = Math.floor(rand() * 30 + 10); // 10 ~ 39
      const maxSolubility = (t - 10) * 1 + 15;
      return {
        isReading: true,
        readingText: `【溶解度曲線圖表】某固體物質的溶解度數據如下表：\n=================================\n| 溫度 (℃) | 10 | 20 | 30 | 40 | 50 |\n|----------|----|----|----|----|----|\n| 溶解度(g/100g水) | 15 | 25 | 35 | 45 | 55 |\n=================================\n小華在 ${t} ℃ 的環境下，將 ${s} 克該固體加入 100 克的純水中充分攪拌。`,
        question: `【圖表解讀】根據上述表格與情境，下列關於該溶液狀態的推論何者最合理？（註：假設溫度不變）`,
        options: [
          s > maxSolubility ? '溶液會達到飽和，且有沉澱物產生' : '溶液為未飽和狀態，無沉澱物',
          s > maxSolubility ? '溶液為未飽和狀態，無沉澱物' : '溶液會達到飽和，且有沉澱物產生',
          '溶液必為過飽和狀態',
          '資料不足，無法判斷'
        ],
        answer: 0,
        hint: '💡 提示：對照表格找出該溫度下的最大溶解度，再與加入的克數比較。',
        explanation: `📖 詳解：該溫度下最大溶解度為 ${maxSolubility}g/100g水。加入 ${s}g，所以是${s > maxSolubility ? '飽和且沉澱' : '未飽和'}。`
      };
    } else if (variant === 1) {
      const chats = [
        { 
          topic: '鎂帶燃燒',
          msg1: '今天的理化實驗好神奇！把鎂帶折斷，然後點火燃燒，發出超刺眼的白光！',
          msg2: '對啊，老師說鎂帶折斷是物理變化，但燃燒是化學變化。',
          msg3: '那燃燒後剩下的白色粉末，加水會變成什麼酸性還鹼性啊？',
          ans: '鹼性'
        },
        {
          topic: '銅線加熱',
          msg1: '我把紅色的銅線放到酒精燈上加熱，結果表面變黑了！',
          msg2: '這是因為銅和空氣中的氧氣反應，產生了氧化銅。',
          msg3: '那如果把這層黑黑的氧化銅丟進水裡，水會變成什麼顏色？',
          ans: '不溶於水，無色'
        },
        {
          topic: '大理石與鹽酸',
          msg1: '我們把大理石碎塊丟進稀鹽酸裡面，產生了好多泡泡！',
          msg2: '這個氣體可以讓澄清石灰水變混濁喔。',
          msg3: '沒錯，那如果把這個氣體收集起來溶於水，用石蕊試紙測量會變什麼顏色？',
          ans: '紅色 (酸性)'
        }
      ];
      const ch = chats[index % chats.length];
      return {
        isChat: true,
        chatMessages: [
          { sender: '小明', text: ch.msg1 },
          { sender: '小華', text: ch.msg2 },
          { sender: '小明', text: ch.msg3 }
        ],
        question: `【對話情境解謎】根據上述對話探討的「${ch.topic}」實驗，最後的問題答案為何？`,
        options: [ch.ans, '鹼性', '酸性 (紅色)', '中性', '不溶於水'].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4),
        answer: 0,
        hint: `💡 提示：回憶課本實驗產物的特性。`,
        explanation: `📖 詳解：正確答案為「${ch.ans}」。`
      };
    } else if (variant === 2) {
      const physicsTraps = [
        { q: '一名太空人將一塊石頭從地球帶到月球上，請問該石頭的「質量」與「重量」會發生什麼變化？', opts: ['質量不變，重量變小', '質量變小，重量不變', '質量與重量均變小', '質量與重量均不變'] },
        { q: '水在 4℃ 時的物理性質，下列何者正確？', opts: ['體積最小，密度最大', '體積最大，密度最小', '體積與密度均為最大', '體積與密度均為最小'] },
        { q: '將 100g 的水與 100g 的酒精混合，關於混合液的總體積，下列何者正確？', opts: ['小於 200 cm³', '大於 200 cm³', '等於 200 cm³', '無法預測'] },
        { q: '關於溫度的敘述，何者正確？', opts: ['溫度代表物體冷熱的程度，不等於熱量', '溫度高的物體，熱量一定比較多', '物體吸熱後，溫度一定會上升', '溫度計是利用物質比熱不同的原理製成'] }
      ];
      const pt = physicsTraps[index % physicsTraps.length];
      return {
        question: `【物理觀念陷阱】${pt.q}`,
        options: pt.opts,
        answer: 0,
        hint: '💡 提示：仔細閱讀題意，破解迷思概念。',
        explanation: `📖 詳解：正確答案為「${pt.opts[0]}」。`
      };
    } else {
      const mass = ((index * 9) % 70) + 30;
      const vol = ((index * 3) % 15) + 5;
      const density = (mass / vol).toFixed(2);
      return {
        question: `【測量實驗】質量為 ${mass} g 的物體，體積為 ${vol} cm³，則該物體的密度約為多少 g/cm³？`,
        options: [`${density}`, `${(density * 1.5).toFixed(2)}`, `${(density * 0.7).toFixed(2)}`, `${(vol / mass).toFixed(2)}`],
        answer: 0,
        hint: '💡 提示：密度公式 D = M / V。',
        explanation: `📖 詳解：D = ${mass} g / ${vol} cm³ ≈ ${density} g/cm³。`
      };
    }
  } else if (gradeId === 'g9') {
    const variant = index % 3;
    if (variant === 0) {
      // 電路 SVG 圖
      const v = 1.5 * ((index % 3) + 1);
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
          <text x="110" y="135" font-size="12" fill="#0f172a" font-weight="bold">${v * 2}V</text>
          <circle cx="125" cy="50" r="15" fill="#fef08a" stroke="#ca8a04" stroke-width="3" />
          <path d="M 115 50 L 135 50" fill="none" stroke="#ca8a04" stroke-width="2" />
          <path d="M 125 40 L 125 60" fill="none" stroke="#ca8a04" stroke-width="2" />
        </svg>`,
        question: `【電路圖形判讀】如上圖所示，若每個電池的電壓為 ${v}V，請問此電路中的燈泡兩端電壓為多少？`,
        options: [`${v * 2}V`, `${v}V`, '0V', `${v * 3}V`],
        answer: 0,
        hint: '💡 提示：電池串聯時，總電壓為各個電池電壓的總和。',
        explanation: `📖 詳解：圖中顯示兩個電池串聯，因此總電壓為 ${v}V + ${v}V = ${v*2}V。燈泡與電池並聯，兩端電壓等於 ${v*2}V。`
      };
    } else if (variant === 1) {
      const v1 = ((index * 2) % 5) + 1;
      const v2 = ((index * 3) % 5) + 2;
      const v3 = ((index * 4) % 5) + 3;
      const v4 = ((index * 5) % 5) + 4;
      const isAcc = v1 < v2 && v2 < v3;
      const isDec = v1 > v2 && v2 > v3;
      const isCon = v1 === v2 && v2 === v3;
      
      let ans = '無法判斷';
      if (isAcc) ans = '漸快 (加速度為正)';
      else if (isDec) ans = '漸慢 (加速度為負)';
      else if (isCon) ans = '等速運動';

      return {
        isReading: true,
        readingText: `【圖表分析題】小明進行打點計時器實驗，記錄紙帶上各點的距離如下表（時間間隔 0.1s）：\n| 區間 | 0~1 | 1~2 | 2~3 | 3~4 |\n|------|-----|-----|-----|-----|\n| 距離(cm) |  ${v1}  |  ${v2}  |  ${v3}  |  ${v4}  |`,
        question: `【資料解讀】根據上表，滑車的運動狀態為何？`,
        options: [ans, '漸快 (加速度為正)', '等速運動', '漸慢 (加速度為負)'].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4),
        answer: 0,
        hint: '💡 提示：相同時間間隔內，若移動距離越來越大，代表速度越來越快。',
        explanation: `📖 詳解：距離的變化趨勢決定了速度的變化趨勢。`
      };
    } else {
      const newtonTraps = [
        { q: '一物體在光滑水平面上作等速度直線運動，請問該物體所受的合力為何？', opts: ['合力為 0', '合力方向與運動方向相同', '合力方向與運動方向相反', '合力不斷增加'] },
        { q: '蘋果從樹上掉落的過程中，地球對蘋果的引力(F1)與蘋果對地球的引力(F2)大小關係為何？', opts: ['F1 = F2', 'F1 > F2', 'F1 < F2', '蘋果沒有引力'] },
        { q: '汽車煞車時，車內乘客會往前傾，這是因為何種物理原理？', opts: ['慣性定律', '運動定律(F=ma)', '作用力與反作用力', '萬有引力定律'] }
      ];
      const nt = newtonTraps[index % newtonTraps.length];
      return {
        question: `【物理定律陷阱】${nt.q}`,
        options: nt.opts,
        answer: 0,
        hint: '💡 提示：回憶牛頓三大運動定律的核心精神。',
        explanation: `📖 詳解：正確答案為「${nt.opts[0]}」。`
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
