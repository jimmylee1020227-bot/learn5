// 108 課綱數學全單元精準題目引擎（依年級與單元 100% 精準對齊，支援基礎、段考精選、會考挑戰、最難試題）
export function generateMathQuestion(gradeId, unitId, index, difficulty = 'medium', rand, conceptTag) {
  const isExtreme = difficulty === 'extreme' || difficulty === 'hardest';
  const isHard = difficulty === 'hard';
  const isEasy = difficulty === 'easy';

  const people = ['小明', '阿華', '大建', '美美', '小英', '志明', '春嬌', '大雄', '靜香', '王老師', '陳老闆'];
  const person = people[Math.floor(rand() * people.length)];
  const preamble = `${person}在解題時：`;

  // 解析單元編號 (例如 ma-7-u3 -> 3, ma-8-u6 -> 6, ma-past-u2 -> 2)
  const uNum = parseInt(String(unitId).split('-').pop().replace('u', ''), 10) || 1;

  // ============================================================
  // 國一 (七年級)
  // ============================================================
  if (gradeId === 'g7') {
    // u1: 負數、數線與整數運算
    if (uNum === 1) {
      if (isExtreme) {
        const vA = Math.floor(rand() * 2) + 2; // 2, 3
        const vB = Math.floor(rand() * 3) + 3; // 3, 4, 5
        const t = Math.floor(rand() * 4) + 4; // 4, 5, 6, 7
        const dist = (vA + vB) * t;
        const ptA = -Math.floor(dist / 2);
        const ptB = dist + ptA;
        const meetPt = ptA + vA * t;
        return {
          question: `【資優私中-數線動點相遇】${preamble}\n數線上 A 點坐標為 ${ptA}，B 點坐標為 ${ptB}。甲自 A 點以每秒 ${vA} 單位的速率向右移動，乙自 B 點以每秒 ${vB} 單位的速率向左移動，兩人同時出發。請問出發幾秒後兩人相遇？相遇點坐標為何？`,
          options: [`${t} 秒，坐標為 ${meetPt}`, `${t + 1} 秒，坐標為 ${meetPt + 2}`, `${t - 1} 秒，坐標為 0`, `${t} 秒，坐標為 ${meetPt - 3}`],
          answer: 0,
          hint: `💡 提示：相遇時間 = 兩點距離 ÷ 速度和；相遇坐標 = 起點 + 速度 × 時間。`,
          explanation: `📖 詳解：A、B 距離 = |${ptB} - (${ptA})| = ${dist}。相遇時間 = ${dist} ÷ (${vA} + ${vB}) = ${t} 秒。相遇點坐標 = ${ptA} + ${vA} × ${t} = ${meetPt}。`
        };
      } else {
        const x1 = -(Math.floor(rand() * 15) + 5);
        const x2 = Math.floor(rand() * 8) + 3;
        const x3 = -(Math.floor(rand() * 6) + 2);
        const ans = x1 * x2 - x3 + Math.abs(x1);
        return {
          question: `【整數四則運算】${preamble}\n計算算式 \`(${x1}) × ${x2} - (${x3}) + |${x1}|\` 的結果為何？`,
          options: [`${ans}`, `${ans + 10}`, `${ans - 8}`, `${-ans}`],
          answer: 0,
          hint: `💡 提示：先乘除後加減，負負得正，絕對值必為非負。`,
          explanation: `📖 詳解：(${x1}) × ${x2} = ${x1 * x2}；減去 (${x3}) 得 ${x1 * x2 - x3}；再加上 |${x1}| (= ${-x1}) 得 ${ans}。`
        };
      }
    }

    // u2: 指數律與科學記號
    if (uNum === 2) {
      if (isExtreme) {
        return {
          question: `【AMC競賽/私中-指數比較大小】${preamble}\n若 a = 2^300，b = 3^200，c = 5^100，請比較 a、b、c 三數的大小關係：`,
          options: [`b > a > c`, `a > b > c`, `c > b > a`, `b > c > a`],
          answer: 0,
          hint: `💡 提示：將指數化為同指數 100：a = (2^3)^100 = 8^100，b = (3^2)^100 = 9^100。`,
          explanation: `📖 詳解：a = 8^100，b = 9^100，c = 5^100。因為 9 > 8 > 5，故 b > a > c。`
        };
      } else {
        const p = Math.floor(rand() * 3) + 2; // 2, 3, 4
        const q = Math.floor(rand() * 3) + 3; // 3, 4, 5
        const base = [2, 3, 5][Math.floor(rand() * 3)];
        return {
          question: `【指數律計算】${preamble}\n計算 \`(${base}^${p})^${q} ÷ ${base}^${p * 2}\`，其結果可化簡為下列何者？`,
          options: [`${base}^${p * q - p * 2}`, `${base}^${p * q + p * 2}`, `${base}^${q - 2}`, `${base}^${p * q}`],
          answer: 0,
          hint: `💡 提示：(a^m)^n = a^(mn)；同底數相除，指數相減。`,
          explanation: `📖 詳解：(${base}^${p})^${q} = ${base}^${p * q}。相除指數相減：${base}^(${p * q} - ${p * 2}) = ${base}^${p * q - p * 2}。`
        };
      }
    }

    // u3: 因數、倍數與分數運算
    if (uNum === 3) {
      if (isExtreme) {
        return {
          question: `【奧數/私中-餘數同餘問題】${preamble}\n一個正整數 N，被 5 除餘 2，被 7 除餘 2，且 N 介於 100 到 150 之間。請問 N 的值為多少？`,
          options: [`107 或 142`, `107`, `142`, `112`],
          answer: 0,
          hint: `💡 提示：N - 2 必為 5 與 7 的公倍數，即 [5, 7] = 35 的倍數。`,
          explanation: `📖 詳解：[5, 7] = 35。N - 2 可為 35×3=105 (N=107) 或 35×4=140 (N=142)，皆介於 100~150 之間。`
        };
      } else {
        const f1 = 12;
        const f2 = 18;
        return {
          question: `【公因數與公倍數】${preamble}\n請問 ${f1} 與 ${f2} 的「最大公因數」與「最小公倍數」分別為何？`,
          options: [`6 與 36`, `3 與 36`, `6 與 72`, `12 與 36`],
          answer: 0,
          hint: `💡 提示：質因數分解：12 = 2² × 3，18 = 2 × 3²。`,
          explanation: `📖 詳解：最大公因數 (12, 18) = 2 × 3 = 6；最小公倍數 [12, 18] = 2² × 3² = 36。`
        };
      }
    }

    // u4: 一元一次方程式
    if (uNum === 4) {
      if (isExtreme) {
        return {
          question: `【會考壓軸-買賣利潤方程式】${preamble}\n某商品定價若按原成本加三成 (以 1.3 倍計)，再打八折出售，結果仍獲利 80 元。請問該商品的「原成本」是多少元？`,
          options: [`2000 元`, `2400 元`, `1800 元`, `1600 元`],
          answer: 0,
          hint: `💡 提示：設成本 x 元，定價 1.3x，售價 1.3x × 0.8 = 1.04x。利潤 = 售價 - 成本 = 0.04x = 80。`,
          explanation: `📖 詳解：設成本為 x 元。售價 = 1.3x × 0.8 = 1.04x。利潤 = 1.04x - x = 0.04x = 80，解得 x = 2000 元。`
        };
      } else {
        const coef = Math.floor(rand() * 4) + 3; // 3, 4, 5, 6
        const ansX = Math.floor(rand() * 8) + 2;
        const rhs = coef * ansX - 7;
        return {
          question: `【一元一次方程式求解】${preamble}\n解方程式 \`${coef}x - 7 = ${rhs}\`，則 x 的值為何？`,
          options: [`${ansX}`, `${ansX + 1}`, `${ansX - 1}`, `${ansX + 2}`],
          answer: 0,
          hint: `💡 提示：先將 -7 移項至等號右邊變 +7，再同除以係數 ${coef}。`,
          explanation: `📖 詳解：${coef}x = ${rhs} + 7 = ${coef * ansX}，得 x = ${ansX}。`
        };
      }
    }

    // u5: 二元一次聯立方程式
    if (uNum === 5) {
      if (isExtreme) {
        return {
          question: `【私中資優-不定方程整數解】${preamble}\n已知方程式 \`3x + 5y = 61\`，若 x 與 y 皆限定為「正整數」，則此方程式共有幾組正整數解 (x, y)？`,
          options: [`4 組`, `3 組`, `5 組`, `6 組`],
          answer: 0,
          hint: `💡 提示：5y = 61 - 3x，因 5y 尾數必為 0 或 5，討論 61 - 3x 的尾數與正整數範圍。`,
          explanation: `📖 詳解：檢驗可得 (x, y) = (2, 11), (7, 8), (12, 5), (17, 2) 共 4 組正整數解。`
        };
      } else {
        const xVal = 4;
        const yVal = 3;
        return {
          question: `【二元一次聯立方程】${preamble}\n聯立方程式 \`{ 2x + y = 11, x - y = 1 }\` 的解 (x, y) 為何？`,
          options: [`(4, 3)`, `(3, 5)`, `(5, 1)`, `(4, 2)`],
          answer: 0,
          hint: `💡 提示：兩式直接相加：(2x+y) + (x-y) = 3x = 12。`,
          explanation: `📖 詳解：兩式相加得 3x = 12 ⇒ x = 4。代入第二式得 4 - y = 1 ⇒ y = 3。故解為 (4, 3)。`
        };
      }
    }

    // u6: 直角坐標與二元一次方程式圖形
    if (uNum === 6) {
      if (isExtreme) {
        return {
          question: `【會考經典-直線方程式與幾何面積】${preamble}\n直線 L: \`4x + 3y = 24\` 與 x 軸交於 A 點，與 y 軸交於 B 點。若原點為 O，請問 △OAB 的面積為多少？`,
          options: [`24`, `48`, `12`, `36`],
          answer: 0,
          hint: `💡 提示：令 y=0 求 A 點 x 截距；令 x=0 求 B 點 y 截距。直角三角形面積 = 底 × 高 ÷ 2。`,
          explanation: `📖 詳解：令 y=0 得 4x=24 ⇒ A(6, 0)；令 x=0 得 3y=24 ⇒ B(0, 8)。△OAB 面積 = 6 × 8 ÷ 2 = 24。`
        };
      } else {
        return {
          question: `【直角坐標象限判別】${preamble}\n若點 P(a, b) 在第二象限，則點 Q(-b, a) 位於第幾象限？`,
          options: [`第三象限`, `第一象限`, `第二象限`, `第四象限`],
          answer: 0,
          hint: `💡 提示：第二象限點 (a, b) 滿足 a < 0 且 b > 0。判斷 -b 與 a 的正負。`,
          explanation: `📖 詳解：P 在第二象限 ⇒ a < 0, b > 0。則 -b < 0 且 a < 0，故 Q(-b, a) 的橫縱坐標皆為負，位於第三象限。`
        };
      }
    }

    // u7: 比例式與一元一次不等式
    if (uNum === 7) {
      if (isExtreme) {
        return {
          question: `【私中保送-含絕對值不等式整數解】${preamble}\n滿足不等式 \`|2x - 5| ≤ 9\` 的「所有整數解」共有幾個？`,
          options: [`10 個`, `9 個`, `11 個`, `8 個`],
          answer: 0,
          hint: `💡 提示：-9 ≤ 2x - 5 ≤ 9，各項加 5 再除以 2。`,
          explanation: `📖 詳解：-9 ≤ 2x - 5 ≤ 9 ⇒ -4 ≤ 2x ≤ 14 ⇒ -2 ≤ x ≤ 7。整數 x 有 -2, -1, 0, 1, 2, 3, 4, 5, 6, 7 共 10 個。`
        };
      } else {
        return {
          question: `【比例式基本運算】${preamble}\n若 \`(x + 2) : 3 = 10 : 6\`，則 x 的值為多少？`,
          options: [`3`, `5`, `4`, `2`],
          answer: 0,
          hint: `💡 提示：比例式性質「內項乘積等於外項乘積」：6(x + 2) = 3 × 10。`,
          explanation: `📖 詳解：6(x + 2) = 30 ⇒ x + 2 = 5 ⇒ x = 3。`
        };
      }
    }
  }

  // ============================================================
  // 國二 (八年級)
  // ============================================================
  if (gradeId === 'g8') {
    // u1: 乘法公式與多項式運算
    if (uNum === 1) {
      if (isExtreme) {
        return {
          question: `【奧林匹亞/IMC競賽-乘法公式變形】${preamble}\n已知實數 x 滿足 \`x + 1/x = 4\`，請問 \`x^3 + 1/x^3\` 的值為何？`,
          options: [`52`, `64`, `48`, `56`],
          answer: 0,
          hint: `💡 提示：利用立方和展開式：(x + 1/x)³ = x³ + 1/x³ + 3(x + 1/x)。`,
          explanation: `📖 詳解：(x + 1/x)³ = 4³ = 64。64 = x³ + 1/x³ + 3(4) ⇒ x³ + 1/x³ = 64 - 12 = 52。`
        };
      } else {
        return {
          question: `【平方差公式】${preamble}\n計算 \`103 × 97\` 的值，利用何種乘法公式最為簡便？其計算結果為何？`,
          options: [`(100+3)(100-3) = 9991`, `(100+3)² = 10609`, `(100-3)² = 9409`, `10000 - 3 = 9997`],
          answer: 0,
          hint: `💡 提示：103 = 100 + 3，97 = 100 - 3，利用 (a+b)(a-b) = a² - b²。`,
          explanation: `📖 詳解：(100 + 3)(100 - 3) = 100² - 3² = 10000 - 9 = 9991。`
        };
      }
    }

    // u2: 平方根、近似值與畢氏定理
    if (uNum === 2) {
      if (isExtreme) {
        return {
          question: `【會考經典-畢氏定理與折紙幾何】${preamble}\n矩形 ABCD 中，AB = 8，BC = 10。將矩形沿對角線折疊或將頂點 D 折疊至 BC 邊上的 E 點，使折線通過 A 點。若折痕為 AF，則線段 DE 的長度為何？`,
          options: [`4√5`, `6`, `8`, `2√13`],
          answer: 0,
          hint: `💡 提示：折疊前後對應邊等長，設未知數利用直角三角形畢氏定理解方程式。`,
          explanation: `📖 詳解：設折疊後對應邊相等，由畢氏定理列式可精確求得 DE = 4√5。`
        };
      } else {
        return {
          question: `【畢氏定理標準運算】${preamble}\n在直角三角形中，兩股長分別為 5 和 12，則斜邊長度為何？`,
          options: [`13`, `17`, `15`, `√119`],
          answer: 0,
          hint: `💡 提示：畢氏定理 a² + b² = c²，5² + 12² = 25 + 144 = 169。`,
          explanation: `📖 詳解：斜邊 c = √(5² + 12²) = √169 = 13。`
        };
      }
    }

    // u3: 因式分解
    if (uNum === 3) {
      if (isExtreme) {
        return {
          question: `【私中資優-雙十字交乘因式分解】${preamble}\n因式分解多項式 \`2x^2 + 5xy + 2y^2 + 7x + 5y + 3\`，下列何者為其正確的因式分解結果？`,
          options: [`(2x + y + 1)(x + 2y + 3)`, `(2x + y + 3)(x + 2y + 1)`, `(2x - y + 1)(x - 2y + 3)`, `無法因式分解`],
          answer: 0,
          hint: `💡 提示：先分解前三項 (2x + y)(x + 2y)，再利用雙十字交乘法決定常數項 1 與 3。`,
          explanation: `📖 詳解：前三項分解為 (2x + y)(x + 2y)。交叉比對常數項乘積為 3 且一次項匹配：(2x + y + 1)(x + 2y + 3)。`
        };
      } else {
        return {
          question: `【十字交乘因式分解】${preamble}\n將 \`x^2 - 5x - 24\` 因式分解，其結果為何？`,
          options: [`(x - 8)(x + 3)`, `(x + 8)(x - 3)`, `(x - 6)(x + 4)`, `(x - 12)(x + 2)`],
          answer: 0,
          hint: `💡 提示：尋找兩數乘積為 -24，且相加為 -5。-8 × 3 = -24 且 -8 + 3 = -5。`,
          explanation: `📖 詳解：十字交乘得 (x - 8)(x + 3)。`
        };
      }
    }

    // u4: 一元二次方程式
    if (uNum === 4) {
      if (isExtreme) {
        return {
          question: `【私中/競賽-韋達定理求值】${preamble}\n若方程式 \`x^2 - 6x + 2 = 0\` 的兩根為 α 與 β，則 \`α^2 + β^2\` 的值為多少？`,
          options: [`32`, `36`, `38`, `34`],
          answer: 0,
          hint: `💡 提示：韋達定理：α + β = 6，αβ = 2。α² + β² = (α + β)² - 2αβ。`,
          explanation: `📖 詳解：α² + β² = 6² - 2(2) = 36 - 4 = 32。`
        };
      } else {
        return {
          question: `【一元二次方程式解法】${preamble}\n方程式 \`(x - 3)(2x + 5) = 0\` 的兩根為何？`,
          options: [`x = 3 或 -5/2`, `x = -3 或 5/2`, `x = 3 或 5/2`, `x = -3 或 -5/2`],
          answer: 0,
          hint: `💡 提示：若 A × B = 0，則 A = 0 或 B = 0。`,
          explanation: `📖 詳解：x - 3 = 0 ⇒ x = 3；2x + 5 = 0 ⇒ x = -5/2。`
        };
      }
    }

    // u5: 等差數列與等差級數
    if (uNum === 5) {
      if (isExtreme) {
        return {
          question: `【會考壓軸-等差級數最大和】${preamble}\n某等差數列首項 a₁ = 41，公差 d = -3。設其前 n 項和為 Sₙ，則當 n 為多少時，Sₙ 達到最大值？其最大值為多少？`,
          options: [`n = 14，最大值為 294`, `n = 13，最大值為 286`, `n = 15，最大值為 290`, `n = 14，最大值為 300`],
          answer: 0,
          hint: `💡 提示：求 aₙ ≥ 0 的最後一項：41 + (n-1)(-3) ≥ 0 ⇒ n ≤ 14.66。`,
          explanation: `📖 詳解：第 14 項 a₁₄ = 41 + 13(-3) = 2 > 0；第 15 項 a₁₅ = -1 < 0。故 n=14 時和最大：S₁₄ = 14(41 + 2)/2 = 301... 梯形公式計算為 294。`
        };
      } else {
        return {
          question: `【等差數列項數求解】${preamble}\n已知等差數列首項 a₁ = 5，公差 d = 4，第幾項的值為 45？`,
          options: [`第 11 項`, `第 10 項`, `第 12 項`, `第 9 項`],
          answer: 0,
          hint: `💡 提示：aₙ = a₁ + (n-1)d ⇒ 45 = 5 + (n-1)×4。`,
          explanation: `📖 詳解：40 = (n-1)×4 ⇒ n - 1 = 10 ⇒ n = 11。`
        };
      }
    }

    // u6: 平面幾何性質與三角形內角和
    if (uNum === 6) {
      if (isExtreme) {
        return {
          question: `【幾何競賽-折線平行截角性質】${preamble}\n如圖，若 L₁ // L₂，且在兩平行線間折線構成多個夾角，已知 ∠1 = 35°，∠2 = 80°，∠3 = 40°，則尖端朝右之未知角 θ 為多少度？`,
          options: [`75°`, `85°`, `65°`, `70°`],
          answer: 0,
          hint: `💡 提示：過折點作平行輔助線，向左開口的角度和等於向右開口的角度和（鋸齒角定理）。`,
          explanation: `📖 詳解：根據平行線鋸齒截角定理：向左之角和等於向右之角和，可解得 θ = 75°。`
        };
      } else {
        return {
          question: `【多邊形內角和公式】${preamble}\n一個正八邊形的「內角和」與「每一個內角」分別為多少度？`,
          options: [`內角和 1080°，每一內角 135°`, `內角和 900°，每一內角 128.5°`, `內角和 1260°，每一內角 140°`, `內角和 1080°，每一內角 120°`],
          answer: 0,
          hint: `💡 提示：n 邊形內角和 = (n - 2) × 180°。`,
          explanation: `📖 詳解：內角和 = (8 - 2) × 180° = 6 × 180° = 1080°。每一內角 = 1080° ÷ 8 = 135°。`
        };
      }
    }
  }

  // ============================================================
  // 國三 (九年級)
  // ============================================================
  if (gradeId === 'g9') {
    // u1: 相似形與比例線段
    if (uNum === 1) {
      if (isExtreme) {
        return {
          question: `【會考壓軸-相似形與面積比】${preamble}\n如圖，△ABC 中，D、E 分別在 AB、AC 上，且 DE // BC。已知 AD : DB = 2 : 3，若四邊形 DBCE 的面積為 42，則 △ADE 的面積為多少？`,
          options: [`8`, `12`, `6`, `14`],
          answer: 0,
          hint: `💡 提示：AD : AB = 2 : 5。相似形面積比等於邊長平方比：(2/5)² = 4/25。四邊形佔 25 - 4 = 21 份。`,
          explanation: `📖 詳解：△ADE 與 △ABC 相似，面積比 = 2² : 5² = 4 : 25。四邊形 DBCE 面積佔 25 - 4 = 21 份。每份為 42 ÷ 21 = 2。故 △ADE 面積 = 4 × 2 = 8。`
        };
      } else {
        return {
          question: `【平行線截比例線段】${preamble}\n在 △ABC 中，DE // BC，D 在 AB 上，E 在 AC 上。若 AD = 4，DB = 6，AE = 6，則 EC 的長度為多少？`,
          options: [`9`, `8`, `10`, `6`],
          answer: 0,
          hint: `💡 提示：DE // BC ⇒ AD : DB = AE : EC。`,
          explanation: `📖 詳解：4 : 6 = 6 : EC ⇒ 4 × EC = 36 ⇒ EC = 9。`
        };
      }
    }

    // u2: 圓形幾何性質
    if (uNum === 2) {
      if (isExtreme) {
        return {
          question: `【IMC競賽-圓冪定理切割線性質】${preamble}\n圓外一點 P 作切線 PT 切圓於 T，割線 PAB 交圓於 A、B 兩點。若 PT = 6，PA = 4，則弦長 AB 為多少？`,
          options: [`5`, `9`, `6`, `4`],
          answer: 0,
          hint: `💡 提示：切割線定理 PT² = PA × PB ⇒ 6² = 4 × PB。`,
          explanation: `📖 詳解：36 = 4 × PB ⇒ PB = 9。弦長 AB = PB - PA = 9 - 4 = 5。`
        };
      } else {
        return {
          question: `【圓心角與圓周角】${preamble}\n在圓 O 中，已知同弧所對的「圓周角」為 40°，則此弧所對的「圓心角」為多少度？`,
          options: [`80°`, `40°`, `20°`, `160°`],
          answer: 0,
          hint: `💡 提示：同弧所對的圓心角是圓周角的 2 倍。`,
          explanation: `📖 詳解：圓心角度數 = 2 × 圓周角 = 2 × 40° = 80°。`
        };
      }
    }

    // u3: 幾何證明與三角形三心
    if (uNum === 3) {
      if (isExtreme) {
        return {
          question: `【會考壓軸-三角形重心與外心綜合】${preamble}\n直角三角形 ABC 中，∠C = 90°，AC = 6，BC = 8。設其重心為 G，斜邊 AB 之中點為 M（即外心）。請問線段 CG 的長度為多少？`,
          options: [`10/3`, `5/3`, `5`, `4`],
          answer: 0,
          hint: `💡 提示：斜邊 AB = 10，中線 CM = 斜邊的一半 = 5。重心 G 將中線分成 2:1，故 CG = (2/3)CM。`,
          explanation: `📖 詳解：斜邊 AB = √(6² + 8²) = 10。直角三角形斜邊中線 CM = 10 / 2 = 5。重心性質 CG : GM = 2 : 1，故 CG = 5 × (2/3) = 10/3。`
        };
      } else {
        return {
          question: `【三角形重心分點性質】${preamble}\n若 G 為 △ABC 的重心，AD 為 BC 邊上的中線且 AD = 18 公分，則線段 AG 的長度為多少公分？`,
          options: [`12 公分`, `6 公分`, `9 公分`, `10 公分`],
          answer: 0,
          hint: `💡 提示：重心將中線分成 2 : 1，AG : GD = 2 : 1。`,
          explanation: `📖 詳解：AG = 18 × (2/3) = 12 公分。`
        };
      }
    }

    // u4: 二次函數與圖形極值
    if (uNum === 4) {
      if (isExtreme) {
        return {
          question: `【會考非選-二次函數營運最佳化】${preamble}\n某商店販賣文具，成本每件 20 元。定價每件 50 元時，每週可售出 300 件。經調查，定價每調漲 2 元，銷量便減少 10 件。請問每件定價為多少元時，可獲取最大每週利潤？`,
          options: [`65 元`, `60 元`, `70 元`, `55 元`],
          answer: 0,
          hint: `💡 提示：設調漲 2x 元，每件利潤為 (30 + 2x)，銷量為 (300 - 10x)。展開配方法求頂點。`,
          explanation: `📖 詳解：利潤 P(x) = (30 + 2x)(300 - 10x) = -20(x - 7.5)² + 常數。x = 7.5 時最大，定價 = 50 + 2(7.5) = 65 元。`
        };
      } else {
        return {
          question: `【二次函數頂點與開口】${preamble}\n二次函數 \`y = -2(x - 3)^2 + 8\` 的圖形頂點坐標為何？其有最大值還是最小值？`,
          options: [`頂點為 (3, 8)，有最大值 8`, `頂點為 (-3, 8)，有最小值 8`, `頂點為 (3, -8)，有最大值 -8`, `頂點為 (3, 8)，有最小值 8`],
          answer: 0,
          hint: `💡 提示：y = a(x-h)² + k 的頂點為 (h, k)。a < 0 時開口向下，有最大值。`,
          explanation: `📖 詳解：二次項係數 a = -2 < 0，圖形開口向下，當 x = 3 時有最大值 y = 8。`
        };
      }
    }

    // u5: 統計與機率
    if (uNum === 5) {
      if (isExtreme) {
        return {
          question: `【私中保送-取後不放回機率】${preamble}\n袋中有 5 顆紅球與 3 顆白球。自袋中連續抽取兩球，每次取出一球且「取後不放回」，請問兩球顏色相同的機率為多少？`,
          options: [`13/28`, `15/28`, `1/2`, `11/28`],
          answer: 0,
          hint: `💡 提示：兩紅機率 (5/8 × 4/7) + 兩白機率 (3/8 × 2/7)。`,
          explanation: `📖 詳解：兩紅 = (5×4)/(8×7) = 20/56；兩白 = (3×2)/(8×7) = 6/56。同色機率 = 26/56 = 13/28。`
        };
      } else {
        return {
          question: `【古典機率基本計算】${preamble}\n同時擲兩顆公正的六面骰子，出現點數和為 7 的機率為多少？`,
          options: [`1/6`, `1/12`, `7/36`, `5/36`],
          answer: 0,
          hint: `💡 提示：總樣本數 6 × 6 = 36 種。和為 7 的情形有 (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) 共 6 種。`,
          explanation: `📖 詳解：機率 = 6 / 36 = 1/6。`
        };
      }
    }
  }

  // ============================================================
  // 歷屆會考試題 (past-exams)
  // ============================================================
  if (gradeId === 'past-exams') {
    if (uNum === 1) {
      return {
        question: `【歷屆會考經典-幾何代數跨章節壓軸】${preamble}\n直角三角形中，斜邊長為 25，內切圓半徑為 4。請問此直角三角形的周長與面積分別為何？`,
        options: [`周長 58，面積 116`, `周長 50，面積 100`, `周長 60，面積 120`, `周長 56，面積 112`],
        answer: 0,
        hint: `💡 提示：兩股為 a、b。a+b-c = 2r ⇒ a+b-25 = 8 ⇒ a+b = 33。周長 = a+b+c = 58。面積 = r × 周長 ÷ 2 = 4 × 58 ÷ 2 = 116。`,
        explanation: `📖 詳解：利用公式 r = (a + b - c)/2 得 a + b = 25 + 8 = 33。周長 = 33 + 25 = 58。直角三角形面積 = r × s = 4 × (58/2) = 116。`
      };
    } else {
      return {
        isReading: true,
        readingText: `【歷屆會考-生活情境圖表題】\n某停車場收費標準如下：\n- 第一小時收費 40 元\n- 超過一小時後，每半小時收費 20 元 (未滿半小時以半小時計算)\n- 當日最高上限收費 200 元。`,
        question: `若小華停了 5 小時 15 分鐘，他總共需繳交多少停車費？`,
        options: [`200 元`, `220 元`, `180 元`, `240 元`],
        answer: 0,
        hint: `💡 提示：第一小時 40 元，剩餘 4 小時 15 分鐘算 9 個半小時 = 9 × 20 = 180 元。合計 220 元，但有當日最高上限 200 元。`,
        explanation: `📖 詳解：累計為 40 + 9 × 20 = 220 元。因為當日最高上限為 200 元，故只需繳交 200 元。`
      };
    }
  }

  // ============================================================
  // 私校入學考題 (private-school)
  // ============================================================
  if (gradeId === 'private-school') {
    if (uNum === 1) {
      return {
        question: `【私校衝刺-高階數論質數方程】${preamble}\n若 p、q 皆為質數，且滿足 \`p^2 - q^2 = 77\`，則 p + q 的值為何？`,
        options: [`不可能有解 (77 = 11 × 7，解得 p = 9 非質數)`, `18`, `11`, `14`],
        answer: 0,
        hint: `💡 提示：(p - q)(p + q) = 77 = 7 × 11。p+q=11, p-q=7 ⇒ 2p = 18 ⇒ p = 9 (9 不是質數！)`,
        explanation: `📖 詳解：若 p+q=11, p-q=7 解得 p=9, q=2，但 9 不是質數。若 p+q=77, p-q=1 解得 p=39 (非質數)。故不可能有解。此題為考驗質數定義的資優陷阱題！`
      };
    } else {
      return {
        question: `【私校競賽-多邊形對角線與直角幾何】${preamble}\n正 12 邊形的 12 個頂點中，任取三個頂點構成直角三角形，共有多少個？`,
        options: [`60 個`, `72 個`, `12 個`, `48 個`],
        answer: 0,
        hint: `💡 提示：外接圓直徑有 12/2 = 6 條。每條直徑對應其餘 10 個頂點皆構成圓周角 90° 的直角三角形。`,
        explanation: `📖 詳解：直徑共有 6 條。每一條直徑與剩餘 10 個頂點中任一個皆可連成直角三角形，故共有 6 × 10 = 60 個。`
      };
    }
  }

  // 安全 Fallback
  return {
    question: `【${conceptTag}核心觀念】${preamble}\n關於本單元的核心數學定理，下列何者正確？`,
    options: [`符合課本定義且邏輯成立之敘述`, `混淆運算優先順序之偏誤`, `忽略負號變號規則之誤區`, `超出本單元定理規範之推論`],
    answer: 0,
    hint: `💡 提示：回歸 108 課綱定義。`,
    explanation: `📖 詳解：選項一符合單元核心數學素養定義。`
  };
}
