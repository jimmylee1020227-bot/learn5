export function generateScienceQuestion(gradeId, unitId, index, difficulty, rand, conceptTag) {
  const variant = Math.floor(rand() * 4);

  if (gradeId === 'g7') {
    if (variant === 0) {
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
  }
  
  if (variant % 2 === 0) {
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
  } else {
    return {
      question: `【自然科學推論】質量為 ${index % 5 + 2} kg 的物體受到 ${(index % 5 + 2) * 3} N 的力，加速度為多少 m/s²？`,
      options: ['3', '6', '1.5', '9'],
      answer: 0,
      hint: '💡 提示：a = F / m',
      explanation: `📖 詳解：加速度 = 力 / 質量 = 3 m/s²。`
    };
  }
}
