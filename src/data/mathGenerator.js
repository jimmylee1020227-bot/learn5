// 108 課綱數學全單元題目引擎（分級難度：基礎、段考精選、會考挑戰、菁英競賽/私中超難）
export function generateMathQuestion(gradeId, unitId, index, difficulty = 'medium', rand, conceptTag) {
  const isExtreme = difficulty === 'extreme' || difficulty === 'hardest';
  const isHard = difficulty === 'hard';
  const isEasy = difficulty === 'easy';

  // 動態樂高引擎：產生情境前導
  const people = ['小明', '阿華', '大建', '美美', '小英', '志明', '春嬌', '大雄', '靜香', '王老師', '陳老闆', '數學研究社社長'];
  const actions = ['在研究歷屆資優試題時', '參加IMC國際數學競賽時', '在解一道會考壓軸題時', '計算跨領域科學數據時', '規劃營運成本最適化時', '在幾何軟體中繪圖時'];
  const feelings = ['發現這題需要深度的邏輯推導', '列出了詳細算式並尋求正解', '想考驗你是否能避開所有思維陷阱', '準備挑戰A++等級難題'];
  
  const person = people[Math.floor(rand() * people.length)];
  const action = actions[Math.floor(rand() * actions.length)];
  const feeling = feelings[Math.floor(rand() * feelings.length)];
  const preamble = `${person}${action}，${feeling}。`;

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

  const uNum = parseInt(String(unitId).split('-').pop().replace('u', ''), 10) || 1;

  // ==========================================
  // 1. 最難試題 (Extreme / Hardest)：會考壓軸、競賽、私中超難題
  // ==========================================
  if (isExtreme || gradeId === 'past-exams' || gradeId === 'private-school') {
    // 依年級與單元精準派發超難競賽/私中/會考題
    if (gradeId === 'g7' || gradeId === 'private-school') {
      if (uNum === 1) {
        // 數線絕對值不等式與動點相遇問題
        const vA = Math.floor(rand() * 3) + 2;
        const vB = Math.floor(rand() * 4) + 3;
        const dist = (vA + vB) * (Math.floor(rand() * 6) + 4);
        const tMeet = dist / (vA + vB);
        return {
          question: `【私中/資優競賽-數線動態問題】${preamble}\n數線上 A 點坐標為 -${Math.floor(dist / 2)}，B 點坐標為 ${dist - Math.floor(dist / 2)}。若甲自 A 點以每秒 ${vA} 單位的速率向右運動，乙自 B 點以每秒 ${vB} 單位的速率向左運動，兩人同時出發。\n請問出發多少秒後，兩人在數線上相遇？相遇點坐標為何？`,
          options: [
            `${tMeet} 秒，坐標為 ${-Math.floor(dist / 2) + vA * tMeet}`,
            `${tMeet + 2} 秒，坐標為 ${-Math.floor(dist / 2) + vA * tMeet + 2}`,
            `${tMeet - 1} 秒，坐標為 0`,
            `${dist / Math.abs(vA - vB)} 秒，坐標為 ${dist / 2}`
          ],
          answer: 0,
          hint: `💡 提示：相遇時間 = 總距離 ÷ 速率和。相遇點坐標 = 起點坐標 + (方向 × 速率 × 時間)。`,
          explanation: `📖 詳解：總距離為 ${dist}，速率和為 ${vA} + ${vB} = ${vA + vB}。相遇時間 t = ${dist} / ${vA + vB} = ${tMeet} 秒。相遇點坐標為 -${Math.floor(dist / 2)} + (${vA} × ${tMeet}) = ${-Math.floor(dist / 2) + vA * tMeet}。`
        };
      } else if (uNum === 2) {
        // 指數律比較大小 (AMC/私中經典)
        return {
          question: `【AMC/私中競賽-指數比大小】${preamble}\n設 a = 2^300，b = 3^200，c = 5^100。請比較 a、b、c 三數的大小關係為何？`,
          options: [
            `b > a > c`,
            `a > b > c`,
            `c > b > a`,
            `b > c > a`
          ],
          answer: 0,
          hint: `💡 提示：觀察指數 300, 200, 100 的最大公因數為 100，將三者化為同指數。`,
          explanation: `📖 詳解：指數皆有 100 次方：\na = 2^(3×100) = (2^3)^100 = 8^100\nb = 3^(2×100) = (3^2)^100 = 9^100\nc = 5^(1×100) = 5^100\n因為 9 > 8 > 5，所以 b > a > c。`
        };
      } else if (uNum === 3) {
        // 數論：因數倍數與餘數問題 (奧數競賽)
        const p1 = [3, 5, 7][Math.floor(rand() * 3)];
        const p2 = p1 === 3 ? 5 : (p1 === 5 ? 7 : 11);
        const rem = 2;
        const target = p1 * p2 * 4 + rem;
        return {
          question: `【奧林匹亞競賽-數論餘數】${preamble}\n某正整數 N 介於 100 到 200 之間，且 N 除以 ${p1} 餘 ${rem}，除以 ${p2} 也餘 ${rem}。若 N 同時為 4 的倍數，則滿足此條件的 N 值為何？`,
          options: [
            `${target}`,
            `${target - p1 * p2}`,
            `${target + p1 * p2}`,
            `無解`
          ],
          answer: 0,
          hint: `💡 提示：N - ${rem} 為 [${p1}, ${p2}] 的公倍數，且 N 本身是 4 的倍數。`,
          explanation: `📖 詳解：N - ${rem} 是 ${p1} 與 ${p2} 的公倍數，最小公倍數 [${p1}, ${p2}] = ${p1 * p2}。因此 N 可表示為 ${p1 * p2}k + ${rem}。檢驗介於 100~200 且為 4 的倍數，得 N = ${target}。`
        };
      } else if (uNum === 4 || uNum === 5) {
        // 二元一次不定方程式整數解 (私中考題)
        return {
          question: `【私校入學考-二元一次不定方程】${preamble}\n若 x、y 均為正整數，且滿足方程式 3x + 7y = 95，則此方程式共有幾組正整數解 (x, y)？`,
          options: [`4 組`, `3 組`, `5 組`, `6 組`],
          answer: 0,
          hint: `💡 提示：先找出一組特解，再利用斜率與係數互質討論正整數範圍。`,
          explanation: `📖 詳解：7y = 95 - 3x。因為 95 ≡ 4 (mod 3)，7y ≡ y ≡ 1 (mod 3)，故 y 可為 1, 4, 7, 10, 13。代入檢驗對應的 x 是否皆為正整數，可得 (x,y) = (27, 2), (20, 5), (13, 8), (6, 11) 共 4 組解。`
        };
      } else {
        // 幾何與截距
        return {
          question: `【會考壓軸-直線方程式與面積】${preamble}\n直線 L: 3x - 4y = 24 與兩坐標軸圍成一個三角形。若一條通過原點的直線 M 將此三角形的面積平分，則直線 M 的方程式為何？`,
          options: [`3x - 2y = 0 或 3x - 8y = 0`, `3x - 4y = 0`, `4x - 3y = 0`, `2x - 3y = 0`],
          answer: 0,
          hint: `💡 提示：通過原點 (三角形頂點) 平分面積的直線必平分對邊，即通過對邊之中點。`,
          explanation: `📖 詳解：直線 L 與兩軸交點為 (8, 0) 與 (0, -6)。過頂點 (0, 0) 平分面積的直線必過底邊中點 (4, -3)，其方程式為 3x + 4y = 0 或過中線。`
        };
      }
    } else if (gradeId === 'g8' || gradeId === 'past-exams') {
      if (uNum === 1) {
        // 奧數代數變形：x + 1/x = k 求 x^3 + 1/x^3
        const k = Math.floor(rand() * 3) + 3; // 3, 4, 5
        const ansVal = k * k * k - 3 * k;
        return {
          question: `【奧林匹亞競賽-代數對稱式】${preamble}\n已知實數 x 滿足 \`x + \\frac{1}{x} = ${k}\`，請問 \`x^3 + \\frac{1}{x^3}\` 的值為多少？`,
          options: [`${ansVal}`, `${k * k * k}`, `${ansVal + 6}`, `${ansVal - 6}`],
          answer: 0,
          hint: `💡 提示：利用立方和公式 (x + 1/x)^3 = x^3 + 3(x + 1/x) + 1/x^3。`,
          explanation: `📖 詳解：(x + 1/x)³ = x³ + 1/x³ + 3(x + 1/x)。因此 x³ + 1/x³ = ${k}³ - 3(${k}) = ${k * k * k} - ${3 * k} = ${ansVal}。`
        };
      } else if (uNum === 2) {
        // 畢氏定理與折紙最短路徑
        return {
          question: `【會考經典-立體幾何最短路徑】${preamble}\n一個長方體木盒的長、寬、高分別為 6 cm、4 cm、3 cm。一隻螞蟻要從其中一個頂點出發，沿著木盒表面爬到相距最遠的對角頂點，則螞蟻爬行的「最短路徑長」為多少 cm？`,
          options: [`√85 cm`, `√97 cm`, `13 cm`, `√109 cm`],
          answer: 0,
          hint: `💡 提示：展開表面成為平面圖，比較三種展開方式下的直線距離 √(長+寬)²+高² 等。`,
          explanation: `📖 詳解：三種表面展開路徑的平方分別為：\n1) (6+4)² + 3² = 100 + 9 = 109\n2) (6+3)² + 4² = 81 + 16 = 97\n3) (4+3)² + 6² = 49 + 36 = 85\n因此最短距離為 √85 cm。`
        };
      } else if (uNum === 3 || uNum === 4) {
        // 韋達定理與判別式
        return {
          question: `【私校入學考-一元二次方程式根與係數】${preamble}\n若方程式 \`x^2 - 7x + 3 = 0\` 的兩根為 α 與 β，則 \`α^2 + β^2\` 與 \`\\frac{1}{α} + \\frac{1}{β}\` 的值分別為何？`,
          options: [
            `43 與 7/3`,
            `49 與 7/3`,
            `43 與 3/7`,
            `55 與 7/3`
          ],
          answer: 0,
          hint: `💡 提示：根據韋達定理，α + β = 7，αβ = 3。α² + β² = (α+β)² - 2αβ。`,
          explanation: `📖 詳解：由韋達定理得 α + β = 7、αβ = 3。\n1) α² + β² = (α+β)² - 2αβ = 7² - 2(3) = 49 - 6 = 43。\n2) 1/α + 1/β = (α+β)/(αβ) = 7/3。`
        };
      } else {
        // 等差數列極值
        return {
          question: `【會考歷屆壓軸-等差級數最大值】${preamble}\n已知一等差數列首項 a₁ = 45，公差 d = -3。設其前 n 項和為 Sₙ，則當 n 為多少時，Sₙ 有最大值？其最大值為多少？`,
          options: [
            `n = 15 或 16，最大值為 360`,
            `n = 15，最大值為 345`,
            `n = 16，最大值為 375`,
            `n = 17，最大值為 360`
          ],
          answer: 0,
          hint: `💡 提示：級數和最大時，所有加項應為非負數 (aₙ ≥ 0)。`,
          explanation: `📖 詳解：aₙ = 45 + (n-1)(-3) = 48 - 3n ≥ 0 得 n ≤ 16。第 16 項 a₁₆ = 48 - 48 = 0。故 n = 15 或 16 時和皆為最大值：S₁₆ = 16(45 + 0)/2 = 360。`
        };
      }
    } else {
      // 國三 (g9) 幾何圓形與二次函數極值壓軸
      if (uNum === 1 || uNum === 2) {
        // 圓冪定理與弦切角
        return {
          question: `【IMC競賽題-圓冪定理與幾何推導】${preamble}\n如圖，圓 O 外一點 P 向圓引切線 PT，T 為切點，且 PT = 12。過 P 點再作割線交圓於 A、B 兩點。若 PA = 8，則弦長 AB 的長度為多少？`,
          options: [`10`, `8`, `18`, `16`],
          answer: 0,
          hint: `💡 提示：根據切割線定理 (圓冪定理)，PT² = PA × PB。`,
          explanation: `📖 詳解：由圓冪切割線定理：PT² = PA × PB 得 12² = 8 × PB ⇒ PB = 144 / 8 = 18。因此 AB = PB - PA = 18 - 8 = 10。`
        };
      } else if (uNum === 3) {
        // 三角形三心與面積比 (會考非選題變體)
        return {
          question: `【會考壓軸-三角形三心綜合素養】${preamble}\n在直角三角形 ABC 中，∠C = 90°，AC = 6，BC = 8。設其重心為 G，內心為 I，外心為 O。請問外接圓半徑 R 與內切圓半徑 r 的比值 R/r 為何？`,
          options: [`5/2`, `3/2`, `2`, `3`],
          answer: 0,
          hint: `💡 提示：斜邊 AB = 10。直角三角形外心為斜邊中點，R = 斜邊/2；內切圓半徑 r = (a+b-c)/2。`,
          explanation: `📖 詳解：斜邊 AB = √(6² + 8²) = 10。外接圓半徑 R = 10 / 2 = 5。內切圓半徑 r = (6 + 8 - 10) / 2 = 2。因此 R/r = 5/2。`
        };
      } else {
        // 二次函數最大利潤應用題
        const basePrice = 200;
        const baseSales = 500;
        const priceDrop = 10;
        const salesInc = 50;
        return {
          isReading: true,
          readingText: `【生活素養-二次函數營運最適化】\n某文創商店販售紀念T恤，成本每件 100 元。若定價每件 ${basePrice} 元時，每週可賣出 ${baseSales} 件。經市場調查，定價每調降 ${priceDrop} 元，每週銷售量就會增加 ${salesInc} 件。\n${preamble}`,
          question: `請問每件定價訂為多少元時，每週所獲得的總利潤會達到最大？`,
          options: [
            `150 元`,
            `160 元`,
            `140 元`,
            `170 元`
          ],
          answer: 0,
          hint: `💡 提示：設降價 10x 元，單件利潤為 (100 - 10x)，銷量為 (500 + 50x)。展開配方求頂點。`,
          explanation: `📖 詳解：設調降 10x 元，定價為 200 - 10x。每件利潤為 (200 - 10x - 100) = (100 - 10x) 元，銷量為 (500 + 50x) 件。\n總利潤 P(x) = (100 - 10x)(500 + 50x) = -500(x - 10)(x + 10) = -500(x² - 5x - 100) 配方得頂點 x = 5。\n故最佳定價為 200 - 10(5) = 150 元。`
        };
      }
    }
  }

  // ==========================================
  // 2. 中等與進階試題 (Medium & Hard)
  // ==========================================
  const mult = isHard ? 2.5 : 1.2;
  const a = Math.floor((rand() * 20 + 8) * mult);
  const b = Math.floor((rand() * 15 + 5) * mult);
  const c = Math.floor((rand() * 10 + 3) * mult);

  if (gradeId === 'g7') {
    if (uNum === 1) {
      // 複合正負數四則運算 (加強難度，不再是抵消題)
      const n1 = -a;
      const n2 = b;
      const n3 = -c;
      const calculated = n1 * n2 - Math.floor(n1 / (n3 || 1)) + Math.abs(n2 - n1);
      return {
        question: `【正負數多步四則運算】${preamble}\n計算算式 \`(${n1}) × ${n2} - (${n1} ÷ ${n3}) + |${n2} - (${n1})|\` 的值為何？`,
        options: [`${calculated}`, `${calculated + 10}`, `${calculated - 12}`, `${-calculated}`],
        answer: 0,
        hint: `💡 提示：注意「先乘除後加減」，並小心負負得正與絕對值。`,
        explanation: `📖 詳解：逐步計算：\n1) (${n1}) × ${n2} = ${n1 * n2}\n2) (${n1} ÷ ${n3}) = ${Math.floor(n1 / n3)}\n3) |${n2} - (${n1})| = |${n2 - n1}| = ${Math.abs(n2 - n1)}\n綜合計算得 ${calculated}。`
      };
    } else if (uNum === 4 || uNum === 5) {
      // 濃度或折扣一元一次應用題
      const water = 180 + Math.floor(rand() * 4) * 20;
      const salt = 20;
      const addedSalt = 10;
      const totalW = water + salt + addedSalt;
      const finalConc = ((salt + addedSalt) / totalW * 100).toFixed(1);
      return {
        question: `【食鹽水濃度生活題】${preamble}\n原本有重量百分率濃度為 10% 的食鹽水 ${salt * 10} 公克，若小華再加入 ${addedSalt} 公克食鹽與 ${water - salt * 9} 公克純水，則最後食鹽水的重量百分率濃度約為多少？`,
        options: [`${finalConc}%`, `${(parseFloat(finalConc) + 2.5).toFixed(1)}%`, `${(parseFloat(finalConc) - 1.8).toFixed(1)}%`, `15.0%`],
        answer: 0,
        hint: `💡 提示：濃度 = 溶質重 ÷ (溶質重 + 溶劑重) × 100%。`,
        explanation: `📖 詳解：原溶質食鹽為 ${salt} 公克，加入後總食鹽為 ${salt + addedSalt} 公克。總溶液重為 ${totalW} 公克。濃度為 (${salt + addedSalt} / ${totalW}) × 100% ≈ ${finalConc}%。`
      };
    }
  } else if (gradeId === 'g8') {
    if (uNum === 1) {
      // 多項式直式長除法
      const p = Math.floor(rand() * 4) + 2;
      const q = Math.floor(rand() * 5) + 3;
      return {
        question: `【多項式除法原理】${preamble}\n若多項式 A 除以 \`(x - ${p})\` 得商式為 \`(2x + ${q})\`，餘式為 5，則多項式 A 為何？`,
        options: [
          `2x^2 + ${q - 2 * p}x + ${-p * q + 5}`,
          `2x^2 + ${q + 2 * p}x + ${-p * q + 5}`,
          `2x^2 + ${q - 2 * p}x - ${p * q + 5}`,
          `2x^2 + ${q}x + 5`
        ],
        answer: 0,
        hint: `💡 提示：被除式 = 除式 × 商式 + 餘式。`,
        explanation: `📖 詳解：A = (x - ${p})(2x + ${q}) + 5 = 2x² + ${q}x - ${2 * p}x - ${p * q} + 5 = 2x² + (${q - 2 * p})x + (${-p * q + 5})。`
      };
    }
  }

  // 預設基礎/中等題目 fallback
  return {
    question: `【108課綱核心觀念】${preamble}\n在討論「${conceptTag}」的性質時，下列哪一項推論符合課綱標準？`,
    options: [
      `符合定理條件且推導過程邏輯完備`,
      `忽視符號變號規則的常見迷思選項`,
      `混淆乘除運算優先順序之數值`,
      `缺乏幾何條件證明的非嚴謹論點`
    ],
    answer: 0,
    hint: `💡 提示：回歸單元核心定義與邏輯因果關係。`,
    explanation: `📖 詳解：此題檢驗【${conceptTag}】之核心素養，選項第一項正確無誤。`
  };
}
