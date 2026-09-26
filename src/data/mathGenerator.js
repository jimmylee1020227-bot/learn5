import { getHardMathQuestion } from './mathHardArchetypes.js';
// 108 課綱數學全單元題庫引擎（豐富多樣題庫範本，100% 依年級與單元精準對齊，杜絕重複題）
export function generateMathQuestion(gradeId, unitId, index, difficulty = 'medium', rand, conceptTag) {
  const isExtreme = difficulty === 'extreme' || difficulty === 'hard' || difficulty === 'hardest';
  const people = ['小明', '阿華', '大建', '美美', '小英', '志明', '春嬌', '大雄', '靜香', '王老師', '陳老闆'];
  const person = people[Math.floor(rand() * people.length)];
  const preamble = `${person}在解題時：`;

  const uNum = parseInt(String(unitId).split('-').pop().replace(/u/i, ''), 10) || 1;

  // ── 進階挑戰難度分流 (Extreme / Hardest) ──
  if (isExtreme) {
    const hardQ = getHardMathQuestion(gradeId, unitId, index, rand, preamble, conceptTag);
    if (hardQ) return hardQ;
  }




  // ============================================================
  // 國一 (七年級)
  // ============================================================
  if (gradeId === 'g7') {
    // u1: 負數、數線與整數運算
    if (uNum === 1) {
      const archetypes = [

        () => {
          const a = Math.floor(rand() * 20) + 10;
          const b = Math.floor(rand() * 15) + 5;
          const c = Math.floor(rand() * 10) + 2;
          const ans = (a - b) * c;
          return {
            question: `【盈虧問題】${preamble}\n某商店進貨成本為每件 ${b} 元，售價定為每件 ${a} 元，今天共賣出了 ${c} 件。請問今天的總利潤（盈餘）為多少元？`,
            options: [`${ans}`, `${ans + 5}`, `${ans - c}`, `${a * c}`],
            answer: 0,
            hint: `💡 提示：利潤 = (售價 - 成本) $\times$ 數量。`,
            explanation: `📖 詳解：每件利潤為 ${a} - ${b} = ${a - b} 元，賣出 ${c} 件總利潤為 (${a} - ${b}) \times ${c} = ${ans} 元。`
          };
        },
        () => {
          const temp1 = Math.floor(rand() * 15) + 5;
          const drop = Math.floor(rand() * 8) + 3;
          const rise = Math.floor(rand() * 10) + 4;
          const ans = temp1 - drop + rise;
          return {
            question: `【溫度變化問題】${preamble}\n今日早晨氣溫為 ${temp1} 度，中午因為下雨氣溫下降了 ${drop} 度，到了下午太陽出來氣溫又回升了 ${rise} 度。請問下午的氣溫為幾度？`,
            options: [`${ans}`, `${ans + 2}`, `${ans - 1}`, `${temp1 + rise}`],
            answer: 0,
            hint: `💡 提示：下降用減法，回升用加法，按順序計算即可。`,
            explanation: `📖 詳解：${temp1} - ${drop} + ${rise} = ${ans} 度。`
          };
        },
        () => {
          const start = Math.floor(rand() * 10) - 5;
          const move1 = Math.floor(rand() * 8) + 2;
          const move2 = Math.floor(rand() * 12) + 3;
          const ans = start + move1 - move2;
          return {
            question: `【數線位移問題】${preamble}\n一隻青蛙在數線上，起點位於坐標 ${start}。牠先向右跳了 ${move1} 單位，接著又向左跳了 ${move2} 單位。請問青蛙最後停在數線上的哪一個坐標？`,
            options: [`${ans}`, `${ans + 1}`, `${ans - 1}`, `${start + move1 + move2}`],
            answer: 0,
            hint: `💡 提示：向右跳代表加，向左跳代表減。`,
            explanation: `📖 詳解：${start} + ${move1} - ${move2} = ${ans}。`
          };
        },
        () => {
          const vA = Math.floor(rand() * 2) + 2; // 2, 3
          const vB = Math.floor(rand() * 3) + 3; // 3, 4, 5
          const t = Math.floor(rand() * 4) + 4; // 4, 5, 6, 7
          const dist = (vA + vB) * t;
          const ptA = -Math.floor(dist / 2);
          const ptB = dist + ptA;
          const meetPt = ptA + vA * t;
          return {
            question: `【數線動點相遇問題】${preamble}\n數線上 A 點坐標為 ${ptA}，B 點坐標為 ${ptB}。甲自 A 點以每秒 ${vA} 單位的速率向右移動，乙自 B 點以每秒 ${vB} 單位的速率向左移動，兩人同時出發。請問出發幾秒後兩人相遇？相遇點坐標為何？`,
            options: [`${t} 秒，坐標為 ${meetPt}`, `${t + 1} 秒，坐標為 ${meetPt + 2}`, `${t - 1} 秒，坐標為 0`, `${t} 秒，坐標為 ${meetPt - 3}`],
            answer: 0,
            hint: `💡 提示：相遇時間 = 兩點距離 $\\div$ 速度和；相遇坐標 = 起點 + 速度 $\\times$ 時間。`,
            explanation: `📖 詳解：A、B 距離 = $|${ptB} - (${ptA})| = ${dist}$。相遇時間 = $${dist} \\div (${vA} + ${vB}) = ${t}$ 秒。相遇點坐標 = $${ptA} + ${vA} \\times ${t} = ${meetPt}$。`
          };
        },
        () => {
          const x1 = -(Math.floor(rand() * 12) + 4);
          const x2 = Math.floor(rand() * 6) + 3;
          const x3 = -(Math.floor(rand() * 5) + 2);
          const ans = x1 * x2 - x3 + Math.abs(x1);
          return {
            question: `【整數四則運算】${preamble}\n計算算式 $(${x1}) \\times ${x2} - (${x3}) + |${x1}|$ 的結果為何？`,
            options: [`${ans}`, `${ans + 10}`, `${ans - 8}`, `${-ans}`],
            answer: 0,
            hint: `💡 提示：先乘除後加減，負負得正，絕對值必為非負數。`,
            explanation: `📖 詳解：$(${x1}) \\times ${x2} = ${x1 * x2}$；減去 $(${x3})$ 得 $${x1 * x2 - x3}$；再加上 $|${x1}| = ${-x1}$ 得 $${ans}$。`
          };
        },
        () => {
          const p = Math.floor(rand() * 15) + 5;
          return {
            question: `【相反數與絕對值定義】${preamble}\n已知數線上兩點 $A(-${p})$ 與 $B(x)$ 的距離為 ${p * 2}，且點 $B$ 位於原點的右側。請問點 $B$ 的坐標 $x$ 為多少？`,
            options: [`${p}`, `${p * 2}`, `${p + 5}`, `${-p}`],
            answer: 0,
            hint: `💡 提示：兩點距離公式：$|x - (-${p})| = ${p * 2}$，且 $B$ 在原點右側即 $x > 0$。`,
            explanation: `📖 詳解：$x - (-${p}) = ${p * 2} \\Rightarrow x + ${p} = ${p * 2} \\Rightarrow x = ${p}$。`
          };
        }
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 7)) % archetypes.length]();
    }

    // u2: 指數律與科學記號
    if (uNum === 2) {
      const archetypes = [
        () => ({
          question: `【指數比較大小】${preamble}\n若 $a = 2^{300}$，$b = 3^{200}$，$c = 5^{100}$，請比較 a、b、c 三數的大小關係：`,
          options: [`b > a > c`, `a > b > c`, `c > b > a`, `b > c > a`],
          answer: 0,
          hint: `💡 提示：將指數化為同指數 100：$a = (2^3)^{100} = 8^{100}$，$b = (3^2)^{100} = 9^{100}$。`,
          explanation: `📖 詳解：$a = 8^{100}$，$b = 9^{100}$，$c = 5^{100}$。因為 $9 > 8 > 5$，故 $b > a > c$。`
        }),
        () => {
          const p = Math.floor(rand() * 3) + 2;
          const q = Math.floor(rand() * 3) + 3;
          const base = [2, 3, 5][Math.floor(rand() * 3)];
          const finalExp = p * q - p * 2;
          return {
            question: `【指數律計算】${preamble}\n計算 $(${base}^${p})^{${q}} \\div ${base}^{${p * 2}}$，其結果可化簡為下列何者？`,
            options: [`$${base}^{${finalExp}}$`, `$${base}^{${p * q + p * 2}}$`, `$${base}^{${q - 2}}$`, `$${base}^{${p * q}}$`],
            answer: 0,
            hint: `💡 提示：$(a^m)^n = a^{mn}$；同底數相除，指數相減。`,
            explanation: `📖 詳解：$(${base}^${p})^{${q}} = ${base}^{${p * q}}$。相除指數相減得 $${base}^{${finalExp}}$。`
          };
        },
        () => {
          const exp = 7;
          return {
            question: `【科學記號除法運算】${preamble}\n計算 $(4.8 \\times 10^${exp}) \\div (6 \\times 10^3)$ 的結果，以科學記號表示為何？`,
            options: [`$8 \\times 10^{${exp - 4}}$`, `$0.8 \\times 10^{${exp - 3}}$`, `$8 \\times 10^{${exp - 3}}$`, `$0.8 \\times 10^{${exp - 4}}$`],
            answer: 0,
            hint: `💡 提示：$4.8 \\div 6 = 0.8$，移位後轉為標準科學記號。`,
            explanation: `📖 詳解：$4.8 \\div 6 = 0.8 = 8 \\times 10^{-1}$。故結果為 $8 \\times 10^{${exp - 4}}$。`
          };
        },
        () => {
          const m = Math.floor(rand() * 4) + 2;
          const n = Math.floor(rand() * 4) + 2;
          const base = [2, 3][Math.floor(rand() * 2)];
          const ans = m + n;
          return {
            question: `【同底指數相乘】${preamble}\n化簡 $${base}^{${m}} \\times ${base}^{${n}}$，結果為何？`,
            options: [`$${base}^{${ans}}$`, `$${base}^{${m * n}}$`, `$(${base}+${base})^{${m + n}}$`, `$${base}^{${m - n}}$`],
            answer: 0,
            hint: `💡 提示：同底指數相乘，指數相加：$a^m \\times a^n = a^{m+n}$。`,
            explanation: `📖 詳解：$${base}^{${m}} \\times ${base}^{${n}} = ${base}^{${m}+${n}} = ${base}^{${ans}}$。`
          };
        },
        () => {
          const coeff = [3.6, 4.2, 5.5, 2.4][Math.floor(rand() * 4)];
          const expN = Math.floor(rand() * 6) + 4;
          return {
            question: `【科學記號乘法】${preamble}\n計算 $(${coeff} \\times 10^${expN}) \\times (2 \\times 10^3)$，以科學記號表示結果。`,
            options: [
              `$${coeff * 2} \\times 10^{${expN + 3}}$`,
              `$${coeff + 2} \\times 10^{${expN + 3}}$`,
              `$${coeff * 2} \\times 10^{${expN * 3}}$`,
              `$${coeff * 20} \\times 10^{${expN + 3}}$`
            ],
            answer: 0,
            hint: `💡 提示：數字相乘，指數相加。`,
            explanation: `📖 詳解：$${coeff} \\times 2 = ${coeff * 2}$，$10^{${expN}} \\times 10^3 = 10^{${expN + 3}}$。結果為 $${coeff * 2} \\times 10^{${expN + 3}}$。`
          };
        },
        () => {
          const n = Math.floor(rand() * 4) + 2;
          return {
            question: `【負指數換算】${preamble}\n$10^{-${n}}$ 等於以下哪個數？`,
            options: [
              `$0.${'0'.repeat(n - 1)}1$（小數點後第 ${n} 位為 1）`,
              `$-10^{${n}}$`,
              `$\\frac{1}{10^{-${n}}}$`,
              `$10^{${n}}$`
            ],
            answer: 0,
            hint: `💡 提示：負指數表示倒數：$10^{-n} = \\frac{1}{10^n}$。`,
            explanation: `📖 詳解：$10^{-${n}} = \\frac{1}{10^{${n}}} = 0.${'0'.repeat(n - 1)}1$（共 ${n} 位小數）。`
          };
        }
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 7)) % archetypes.length]();
    }

    // u3: 因數、倍數與分數運算
    if (uNum === 3) {
      const archetypes = [
        () => ({
          question: `【餘數同餘問題】${preamble}\n一個正整數 N，被 5 除餘 2，被 7 除餘 2，且 N 介於 100 到 150 之間。請問 N 的值為多少？`,
          options: [`107 或 142`, `107`, `142`, `112`],
          answer: 0,
          hint: `💡 提示：N - 2 必為 5 與 7 的公倍數，即 [5, 7] = 35 的倍數。`,
          explanation: `📖 詳解：$[5, 7] = 35$。$N - 2$ 可為 $35 \\times 3 = 105$ ($N=107$) 或 $35 \\times 4 = 140$ ($N=142$)，皆介於 $100 \\sim 150$ 之間。`
        }),
        () => {
          const pairs = [[12, 18, 6, 36], [16, 24, 8, 48], [15, 25, 5, 75], [18, 27, 9, 54]];
          const [n1, n2, gcd, lcm] = pairs[Math.abs(index) % pairs.length];
          return {
            question: `【最大公因數與最小公倍數】${preamble}\n請問 ${n1} 與 ${n2} 的「最大公因數」與「最小公倍數」分別為何？`,
            options: [`${gcd} 與 ${lcm}`, `${gcd / 2} 與 ${lcm}`, `${gcd} 與 ${lcm * 2}`, `${n1} 與 ${lcm}`],
            answer: 0,
            hint: `💡 提示：利用質因數分解或短除法求解。`,
            explanation: `📖 詳解：短除法可得 $(${n1}, ${n2}) = ${gcd}$，$[${n1}, ${n2}] = ${lcm}$。`
          };
        },
        () => {
          const a = Math.floor(rand() * 5) + 2;
          const b = Math.floor(rand() * 5) + 3;
          const sum = a + b;
          const ans = `${a}/${b * (b + 1 > 12 ? b : b + 1)}` ;
          // 分數加法
          const num1 = Math.floor(rand() * 3) + 1;
          const den1 = Math.floor(rand() * 4) + 3;
          const num2 = Math.floor(rand() * 3) + 1;
          const den2 = den1 + (Math.floor(rand() * 2) + 1);
          const gcdD = (x, y) => y === 0 ? x : gcdD(y, x % y);
          const lcmD = den1 * den2 / gcdD(den1, den2);
          const sumNum = num1 * (lcmD / den1) + num2 * (lcmD / den2);
          const g = gcdD(sumNum, lcmD);
          return {
            question: `【分數加法化簡】${preamble}\n計算 $\\frac{${num1}}{${den1}} + \\frac{${num2}}{${den2}}$，化成最簡分數結果為何？`,
            options: [
              `$\\frac{${sumNum / g}}{${lcmD / g}}$`,
              `$\\frac{${num1 + num2}}{${den1 + den2}}$`,
              `$\\frac{${sumNum + 1}}{${lcmD}}$`,
              `$\\frac{${sumNum}}{${lcmD + den1}}$`
            ],
            answer: 0,
            hint: `💡 提示：先通分（公分母為 ${lcmD}），再計算分子之和。`,
            explanation: `📖 詳解：公分母 $= ${lcmD}$。$\\frac{${num1}}{${den1}} = \\frac{${num1 * (lcmD / den1)}}{${lcmD}}$，$\\frac{${num2}}{${den2}} = \\frac{${num2 * (lcmD / den2)}}{${lcmD}}$。相加得 $\\frac{${sumNum}}{${lcmD}} = \\frac{${sumNum / g}}{${lcmD / g}}$。`
          };
        },
        () => {
          const n = Math.floor(rand() * 6) + 12;
          const factors = [];
          for (let i = 1; i <= n; i++) if (n % i === 0) factors.push(i);
          return {
            question: `【因數個數計算】${preamble}\n請問 ${n} 共有幾個正因數（含 1 及本身）？`,
            options: [`${factors.length} 個`, `${factors.length - 1} 個`, `${factors.length + 1} 個`, `${factors.length + 2} 個`],
            answer: 0,
            hint: `💡 提示：列出所有能整除 ${n} 的正整數。`,
            explanation: `📖 詳解：${n} 的正因數有：${factors.join('、')}，共 ${factors.length} 個。`
          };
        },
        () => {
          const p = [2, 3, 5, 7][Math.floor(rand() * 4)];
          const k = Math.floor(rand() * 4) + 3;
          const val = Math.pow(p, k);
          return {
            question: `【質因數分解】${preamble}\n將 ${val} 作質因數分解，正確結果為何？`,
            options: [
              `$${p}^{${k}}$`,
              `$${p}^{${k - 1}} \\times ${p}$（未完全化簡）`,
              `$${val / p} \\times ${p}$（未分解完）`,
              `${val} 為質數，無法分解`
            ],
            answer: 0,
            hint: `💡 提示：${val} = ${p} × ${val / p}，再繼續分解。`,
            explanation: `📖 詳解：${val} = $${p}^{${k}}$（質因數只有 ${p}）。`
          };
        },
        () => {
          const a = Math.floor(rand() * 4) + 2;
          const b = Math.floor(rand() * 4) + 3;
          const prod = a * b;
          const lcmAB = prod;
          const gcdAB = 1;
          return {
            question: `【公倍數應用：燈光閃爍問題】${preamble}\n甲燈每 ${a} 秒閃一次，乙燈每 ${b} 秒閃一次，兩燈同時開始閃爍。請問最少需要幾秒後，兩燈才會再次同時閃爍？`,
            options: [`${lcmAB} 秒`, `${a + b} 秒`, `${gcdAB} 秒`, `${a * b * 2} 秒`],
            answer: 0,
            hint: `💡 提示：兩燈同時閃爍的時刻，即為 ${a} 和 ${b} 的公倍數。最小公倍數 = ${a} × ${b} ÷ 最大公因數。`,
            explanation: `📖 詳解：因 ${a} 和 ${b} 互質（gcd = 1），最小公倍數 = ${a} × ${b} = ${lcmAB} 秒。`
          };
        }
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 7)) % archetypes.length]();
    }

    // u4: 一元一次方程式
    if (uNum === 4) {
      const archetypes = [
        () => {
          const coef = Math.floor(rand() * 4) + 3;
          const ansX = Math.floor(rand() * 8) + 2;
          const rhs = coef * ansX - 7;
          return {
            question: `【一元一次方程式求解】${preamble}\n解方程式 $${coef}x - 7 = ${rhs}$，則 $x$ 的值為何？`,
            options: [`${ansX}`, `${ansX + 1}`, `${ansX - 1}`, `${ansX + 2}`],
            answer: 0,
            hint: `💡 提示：先移項再同除以係數 $${coef}$。`,
            explanation: `📖 詳解：$${coef}x = ${rhs} + 7 = ${coef * ansX}$，得 $x = ${ansX}$。`
          };
        },
        () => ({
          question: `【買賣利潤方程式應用】${preamble}\n某商品定價若按原成本加三成再打八折出售，結果仍獲利 80 元。請問該商品的「原成本」是多少元？`,
          options: [`2000 元`, `2400 元`, `1800 元`, `1600 元`],
          answer: 0,
          hint: `💡 提示：設成本 $x$ 元，售價 $= 1.3x \\times 0.8 = 1.04x$。利潤 $= 0.04x = 80$。`,
          explanation: `📖 詳解：$0.04x = 80 \\Rightarrow x = 2000$ 元。`
        }),
        () => {
          const speed = Math.floor(rand() * 30) + 40;
          const dist = (Math.floor(rand() * 8) + 3) * speed;
          const time = dist / speed;
          return {
            question: `【速率問題】${preamble}\n${person}騎車以每小時 ${speed} 公里的速率前進，共騎了 ${dist} 公里。請問花了幾小時？`,
            options: [`${time} 小時`, `${time + 1} 小時`, `${time - 1} 小時`, `${speed / dist} 小時`],
            answer: 0,
            hint: `💡 提示：時間 = 距離 ÷ 速率。`,
            explanation: `📖 詳解：時間 $= ${dist} \\div ${speed} = ${time}$ 小時。`
          };
        },
        () => {
          const total = Math.floor(rand() * 20) + 30;
          const diff = Math.floor(rand() * 10) + 4;
          const larger = Math.floor((total + diff) / 2);
          const smaller = total - larger;
          return {
            question: `【和差問題】${preamble}\n兩數之和為 ${total}，較大的數比較小的數多 ${diff}，請問這兩數分別為多少？`,
            options: [`${larger} 與 ${smaller}`, `${larger + 1} 與 ${smaller - 1}`, `${total - diff} 與 ${diff}`, `${Math.floor(total / 2)} 與 ${total - Math.floor(total / 2)}`],
            answer: 0,
            hint: `💡 提示：設較小數為 $x$，則較大數為 $x + ${diff}$，兩式相加得 $2x + ${diff} = ${total}$。`,
            explanation: `📖 詳解：$x = \\frac{${total} - ${diff}}{2} = ${smaller}$，較大數 $= ${larger}$。`
          };
        },
        () => {
          const unitPrice = Math.floor(rand() * 20) + 15;
          const totalCost = (Math.floor(rand() * 10) + 5) * unitPrice;
          const qty = totalCost / unitPrice;
          return {
            question: `【購物計算】${preamble}\n每本筆記本售價 ${unitPrice} 元，${person}共花了 ${totalCost} 元。請問他買了幾本？`,
            options: [`${qty} 本`, `${qty + 1} 本`, `${qty - 1} 本`, `${qty * 2} 本`],
            answer: 0,
            hint: `💡 提示：數量 = 總金額 ÷ 單價。`,
            explanation: `📖 詳解：本數 $= ${totalCost} \\div ${unitPrice} = ${qty}$ 本。`
          };
        },
        () => {
          const a = Math.floor(rand() * 5) + 2;
          const b = Math.floor(rand() * 5) + 1;
          const c = Math.floor(rand() * 8) + 5;
          const x = (c - b) / a;
          const xR = Math.round(x * 10) / 10;
          const intX = Number.isInteger(x) ? x : null;
          const safeX = intX !== null ? intX : Math.floor(rand() * 5) + 3;
          const safeC = a * safeX + b;
          return {
            question: `【含括號一元一次方程】${preamble}\n解方程式 $${a}(x + 1) - (x - ${b}) = ${a * (safeX + 1) - (safeX - b)}$，則 $x = $？`,
            options: [`${safeX}`, `${safeX + 2}`, `${safeX - 2}`, `${safeX * 2}`],
            answer: 0,
            hint: `💡 提示：先展開括號，再移項整理。`,
            explanation: `📖 詳解：展開得 $${a}x + ${a} - x + ${b} = ${a * (safeX + 1) - (safeX - b)}$，化簡得 $${a - 1}x = ${a * (safeX + 1) - (safeX - b) - a - b}$，$x = ${safeX}$。`
          };
        }
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 7)) % archetypes.length]();
    }

    // u5: 二元一次聯立方程式
    if (uNum === 5) {
      const archetypes = [
        () => {
          const x0 = Math.floor(rand() * 4) + 2;
          const y0 = Math.floor(rand() * 4) + 1;
          const c1 = 2 * x0 + y0;
          const c2 = x0 - y0;
          return {
            question: `【二元一次聯立方程（加減消元）】${preamble}\n聯立方程式 $\\begin{cases} 2x + y = ${c1} \\\\ x - y = ${c2} \\end{cases}$ 的解 $(x, y)$ 為何？`,
            options: [`(${x0}, ${y0})`, `(${x0 + 1}, ${y0})`, `(${x0}, ${y0 + 1})`, `(${y0}, ${x0})`],
            answer: 0,
            hint: `💡 提示：兩式直接相加消去 y，得 $3x = ${c1 + c2}$。`,
            explanation: `📖 詳解：兩式相加 $3x = ${c1 + c2} \\Rightarrow x = ${x0}$，代入得 $y = ${y0}$。`
          };
        },
        () => ({
          question: `【雞兔同籠二元一次應用】${preamble}\n農場裡雞和兔子共有 35 隻，牠們的腳共有 94 隻。請問兔子有幾隻？`,
          options: [`12 隻`, `23 隻`, `15 隻`, `10 隻`],
          answer: 0,
          hint: `💡 提示：設兔 $y$ 隻，$2(35-y)+4y=94$。`,
          explanation: `📖 詳解：$70 + 2y = 94 \\Rightarrow y = 12$ 隻。`
        }),
        () => {
          const price1 = Math.floor(rand() * 10) + 15;
          const price2 = Math.floor(rand() * 10) + 20;
          const qty1 = Math.floor(rand() * 5) + 3;
          const qty2 = Math.floor(rand() * 5) + 2;
          const total = price1 * qty1 + price2 * qty2;
          const totalQty = qty1 + qty2;
          return {
            question: `【商品購買二元應用】${preamble}\n${person}買了兩種商品共 ${totalQty} 件，總花費 ${total} 元。A 商品每件 ${price1} 元，B 商品每件 ${price2} 元。請問 A 商品買了幾件？`,
            options: [`${qty1} 件`, `${qty2} 件`, `${qty1 + 1} 件`, `${totalQty - 1} 件`],
            answer: 0,
            hint: `💡 提示：設 A 買 $x$ 件，B 買 $(${totalQty}-x)$ 件，列方程 $${price1}x + ${price2}(${totalQty}-x) = ${total}$。`,
            explanation: `📖 詳解：$${price1}x + ${price2}(${totalQty}-x) = ${total} \\Rightarrow (${price1}-${price2})x = ${total - price2 * totalQty} \\Rightarrow x = ${qty1}$。`
          };
        },
        () => {
          const x0 = Math.floor(rand() * 5) + 1;
          const y0 = Math.floor(rand() * 5) + 1;
          const c1 = 3 * x0 + 2 * y0;
          const c2 = x0 + 3 * y0;
          return {
            question: `【聯立方程代入消元】${preamble}\n聯立 $\\begin{cases} 3x + 2y = ${c1} \\\\ x + 3y = ${c2} \\end{cases}$，求 $x + y$ 的值。`,
            options: [`${x0 + y0}`, `${x0}`, `${y0}`, `${x0 * y0}`],
            answer: 0,
            hint: `💡 提示：兩式相加得 $4x + 5y = ${c1 + c2}$；兩式相減可得 $2x - y = ${c1 - c2}$，再聯立求解。`,
            explanation: `📖 詳解：由方程組解得 $x = ${x0}, y = ${y0}$，故 $x + y = ${x0 + y0}$。`
          };
        },
        () => {
          const spd1 = Math.floor(rand() * 20) + 40;
          const spd2 = Math.floor(rand() * 20) + 60;
          const t = Math.floor(rand() * 3) + 2;
          const dist = (spd1 + spd2) * t;
          return {
            question: `【相向而行聯立問題】${preamble}\n兩人從相距 ${dist} 公里的兩端同時出發，相向而行。甲速每小時 ${spd1} 公里，乙速每小時 ${spd2} 公里，請問幾小時後相遇？`,
            options: [`${t} 小時`, `${t + 1} 小時`, `${t - 1} 小時`, `$\\frac{${dist}}{${spd1}} $ 小時`],
            answer: 0,
            hint: `💡 提示：相遇時兩人路程之和等於總距離，時間 = 距離 ÷ 速度和。`,
            explanation: `📖 詳解：時間 $= \\frac{${dist}}{${spd1} + ${spd2}} = \\frac{${dist}}{${spd1 + spd2}} = ${t}$ 小時。`
          };
        }
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 7)) % archetypes.length]();
    }

    // u6: 直角坐標與二元一次方程式圖形
    if (uNum === 6) {
      const archetypes = [
        () => ({
          question: `【直線方程式與三角形面積】${preamble}\n直線 $L: 4x + 3y = 24$ 與 $x$ 軸交於 $A$ 點，與 $y$ 軸交於 $B$ 點。若原點為 $O$，請問 $\\triangle OAB$ 的面積為多少？`,
          options: [`24`, `48`, `12`, `36`],
          answer: 0,
          hint: `💡 提示：令 $y=0$ 求 $x$ 截距；令 $x=0$ 求 $y$ 截距，再套三角形面積公式。`,
          explanation: `📖 詳解：$A(6, 0)$，$B(0, 8)$，$\\triangle OAB$ 面積 $= \\frac{6 \\times 8}{2} = 24$。`
        }),
        () => ({
          question: `【直角坐標象限判別】${preamble}\n若點 P(a, b) 在第二象限，則點 Q(-b, a) 位於第幾象限？`,
          options: [`第三象限`, `第一象限`, `第二象限`, `第四象限`],
          answer: 0,
          hint: `💡 提示：第二象限 $a < 0, b > 0$，則 $-b < 0, a < 0$。`,
          explanation: `📖 詳解：$Q(-b, a)$ 橫縱坐標均為負，位於第三象限。`
        }),
        () => {
          const m = [2, -1, 3, -2][Math.floor(rand() * 4)];
          const b = Math.floor(rand() * 6) - 3;
          const xInt = -b / m;
          return {
            question: `【直線斜截式與截距】${preamble}\n直線方程式 $y = ${m}x + (${b})$，請問此直線的 $x$ 截距為何？`,
            options: [
              `$${Number.isInteger(xInt) ? xInt : xInt.toFixed(1)}$`,
              `$${b}$`,
              `$${m}$`,
              `$${-b}$`
            ],
            answer: 0,
            hint: `💡 提示：$x$ 截距為令 $y = 0$ 時的 $x$ 值：$0 = ${m}x + (${b})$。`,
            explanation: `📖 詳解：$0 = ${m}x + (${b}) \\Rightarrow x = ${Number.isInteger(xInt) ? xInt : xInt.toFixed(1)}$。`
          };
        },
        () => {
          const x1 = Math.floor(rand() * 4) + 1;
          const y1 = Math.floor(rand() * 4) + 1;
          const x2 = x1 + Math.floor(rand() * 4) + 2;
          const y2 = y1 + Math.floor(rand() * 4) + 2;
          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2;
          return {
            question: `【中點坐標公式】${preamble}\n已知線段兩端點 $A(${x1}, ${y1})$ 與 $B(${x2}, ${y2})$，則 $\\overline{AB}$ 的中點坐標為何？`,
            options: [`$(${mx}, ${my})$`, `$(${x1 + x2}, ${y1 + y2})$`, `$(${x2 - x1}, ${y2 - y1})$`, `$(${x1}, ${y2})$`],
            answer: 0,
            hint: `💡 提示：中點公式 $M = \\left(\\frac{x_1 + x_2}{2}, \\frac{y_1 + y_2}{2}\\right)$。`,
            explanation: `📖 詳解：$M = \\left(\\frac{${x1}+${x2}}{2}, \\frac{${y1}+${y2}}{2}\\right) = (${mx}, ${my})$。`
          };
        },
        () => {
          const a = Math.floor(rand() * 4) + 2;
          const b = Math.floor(rand() * 4) + 1;
          return {
            question: `【兩點距離公式】${preamble}\n已知 $A(0, 0)$，$B(${a}, ${b})$，則 $\\overline{AB}$ 的長度為何？`,
            options: [
              `$\\sqrt{${a * a + b * b}}$`,
              `$${a + b}$`,
              `$${Math.abs(a - b)}$`,
              `$\\sqrt{${(a + b) * (a + b)}}$`
            ],
            answer: 0,
            hint: `💡 提示：兩點距離 $= \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$。`,
            explanation: `📖 詳解：$\\overline{AB} = \\sqrt{${a}^2 + ${b}^2} = \\sqrt{${a * a + b * b}}$。`
          };
        }
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 7)) % archetypes.length]();
    }

    // u7: 比例式與一元一次不等式
    if (uNum === 7) {
      const archetypes = [
        () => {
          const k = Math.floor(rand() * 4) + 2;
          const ansX = k * 5 - 2;
          return {
            question: `【比例式基本運算】${preamble}\n若 $(x + 2) : 5 = ${k * 2} : 2$，則 $x$ 的值為多少？`,
            options: [`${ansX}`, `${ansX + 2}`, `${ansX - 2}`, `${ansX + 5}`],
            answer: 0,
            hint: `💡 提示：外項乘積等於內項乘積：$2(x + 2) = 5 \\times ${k * 2}$。`,
            explanation: `📖 詳解：$2(x + 2) = ${10 * k} \\Rightarrow x = ${ansX}$。`
          };
        },
        () => ({
          question: `【含絕對值不等式整數解】${preamble}\n滿足不等式 $|2x - 5| \\le 9$ 的「所有整數解」共有幾個？`,
          options: [`10 個`, `9 個`, `11 個`, `8 個`],
          answer: 0,
          hint: `💡 提示：$-9 \\le 2x - 5 \\le 9$，各項加 5 再除以 2。`,
          explanation: `📖 詳解：$-2 \\le x \\le 7$，整數解共 10 個。`
        }),
        () => {
          const coef = Math.floor(rand() * 3) + 2;
          const rhs = Math.floor(rand() * 20) + 10;
          const ans = Math.ceil(rhs / coef);
          return {
            question: `【一次不等式求解】${preamble}\n解不等式 $${coef}x > ${rhs}$，則 $x$ 的範圍為何？`,
            options: [
              `$x > \\frac{${rhs}}{${coef}}$`,
              `$x < \\frac{${rhs}}{${coef}}$`,
              `$x > ${rhs}$`,
              `$x > ${rhs * coef}$`
            ],
            answer: 0,
            hint: `💡 提示：不等式兩邊同除以正數，不等號方向不變。`,
            explanation: `📖 詳解：$${coef}x > ${rhs} \\Rightarrow x > \\frac{${rhs}}{${coef}}$。`
          };
        },
        () => {
          const a = Math.floor(rand() * 5) + 2;
          const b = Math.floor(rand() * 5) + 3;
          const gcdAB = (x, y) => y === 0 ? x : gcdAB(y, x % y);
          const g = gcdAB(a, b);
          return {
            question: `【比例式應用：地圖比例尺】${preamble}\n地圖上 A、B 兩城市相距 ${a} 公分，比例尺為 $1 : ${b * 100000}$。請問實際距離為多少公里？`,
            options: [
              `${a * b} 公里`,
              `${a * b / 10} 公里`,
              `${a + b} 公里`,
              `${a * b * 10} 公里`
            ],
            answer: 0,
            hint: `💡 提示：實際距離 = 地圖距離 × 比例尺分母。注意單位換算（公分→公里）。`,
            explanation: `📖 詳解：實際距離 $= ${a} \\times ${b * 100000}$ 公分 $= ${a * b * 100000}$ 公分 $= ${a * b}$ 公里。`
          };
        },
        () => {
          const budget = Math.floor(rand() * 200) + 300;
          const price = Math.floor(rand() * 20) + 25;
          const maxQty = Math.floor(budget / price);
          return {
            question: `【不等式生活應用：預算購物】${preamble}\n${person}有 ${budget} 元預算，想購買每件 ${price} 元的商品。最多可以買幾件？`,
            options: [`${maxQty} 件`, `${maxQty + 1} 件`, `${maxQty - 1} 件`, `${Math.round(budget / price)} 件`],
            answer: 0,
            hint: `💡 提示：設買 $n$ 件，列不等式 $${price}n \\le ${budget}$，求最大整數解。`,
            explanation: `📖 詳解：$n \\le \\frac{${budget}}{${price}} \\approx ${(budget / price).toFixed(1)}$，最大整數解為 $n = ${maxQty}$ 件。`
          };
        },
        () => {
          const r1 = Math.floor(rand() * 3) + 2;
          const r2 = Math.floor(rand() * 3) + r1 + 1;
          const total = r1 + r2;
          return {
            question: `【比例式分配問題】${preamble}\n將 ${total * 10} 元按照 $${r1} : ${r2}$ 的比例分給兩人，較多的一份為多少元？`,
            options: [
              `${r2 * 10} 元`,
              `${r1 * 10} 元`,
              `${(r1 + r2) * 10} 元`,
              `${r2 * 10 + 10} 元`
            ],
            answer: 0,
            hint: `💡 提示：一份的值 = 總量 ÷ 比例總份數，再乘以各自的份數。`,
            explanation: `📖 詳解：一份 $= ${total * 10} \\div ${total} = 10$ 元。較多份 $= ${r2} \\times 10 = ${r2 * 10}$ 元。`
          };
        }
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 7)) % archetypes.length]();
    }
  }

  // ============================================================
  // 國二 (八年級)
  // ============================================================
  if (gradeId === 'g8') {
    // u1: 乘法公式與多項式運算
    if (uNum === 1) {
      const archetypes = [
        () => {
          const diff = Math.floor(rand() * 3) + 2;
          const ans = 10000 - diff * diff;
          return {
            question: `【平方差公式】${preamble}\n計算 $${100 + diff} \\times ${100 - diff}$ 的值，利用何種乘法公式最為簡便？`,
            options: [`$(100+${diff})(100-${diff}) = ${ans}$`, `$(100+${diff})^2 = ${ans + 100}$`, `$(100-${diff})^2 = ${ans - 100}$`, `$10000 - ${diff} = ${10000 - diff}$`],
            answer: 0,
            hint: `💡 提示：$(a+b)(a-b) = a^2 - b^2$。`,
            explanation: `📖 詳解：$(100+${diff})(100-${diff}) = 100^2 - ${diff}^2 = ${ans}$。`
          };
        },
        () => ({
          question: `【乘法公式變形求值】${preamble}\n已知 $x + \\frac{1}{x} = 4$，請問 $x^2 + \\frac{1}{x^2}$ 的值為何？`,
          options: [`14`, `16`, `18`, `12`],
          answer: 0,
          hint: `💡 提示：$(x + \\frac{1}{x})^2 = x^2 + 2 + \\frac{1}{x^2} = 16$。`,
          explanation: `📖 詳解：$x^2 + \\frac{1}{x^2} = 16 - 2 = 14$。`
        }),
        () => {
          const a = Math.floor(rand() * 4) + 2;
          const b = Math.floor(rand() * 4) + 1;
          const sq = a * a + 2 * a * b + b * b;
          return {
            question: `【完全平方公式展開】${preamble}\n展開 $(${a} + ${b})^2$，其結果為何？`,
            options: [`${sq}`, `${a * a + b * b}`, `${a * a - 2 * a * b + b * b}`, `${a * b * 2}`],
            answer: 0,
            hint: `💡 提示：$(a+b)^2 = a^2 + 2ab + b^2$。`,
            explanation: `📖 詳解：$(${a}+${b})^2 = ${a}^2 + 2 \\times ${a} \\times ${b} + ${b}^2 = ${a*a} + ${2*a*b} + ${b*b} = ${sq}$。`
          };
        },
        () => {
          const a = Math.floor(rand() * 5) + 2;
          const b = Math.floor(rand() * 4) + 1;
          const c = Math.floor(rand() * 4) + 1;
          // 展開 (x+a)(x+b)
          const sum = a + b;
          const prod = a * b;
          return {
            question: `【多項式乘法展開】${preamble}\n展開 $(x + ${a})(x + ${b})$，其結果為何？`,
            options: [`$x^2 + ${sum}x + ${prod}$`, `$x^2 + ${a}x + ${b}$`, `$x^2 + ${prod}x + ${sum}$`, `$x^2 - ${sum}x + ${prod}$`],
            answer: 0,
            hint: `💡 提示：$(x+a)(x+b) = x^2 + (a+b)x + ab$。`,
            explanation: `📖 詳解：$(x+${a})(x+${b}) = x^2 + (${a}+${b})x + ${a}\\times${b} = x^2 + ${sum}x + ${prod}$。`
          };
        },
        () => {
          const n = Math.floor(rand() * 5) + 10;
          return {
            question: `【乘法公式速算：${n}²計算】${preamble}\n利用乘法公式，快速計算 $${n}^2$ 的值為何？`,
            options: [
              `${n * n}`,
              `${(n - 1) * (n + 1) + 1}`,
              `${n * n + n}`,
              `${n * n - n}`
            ],
            answer: 0,
            hint: `💡 提示：$${n}^2 = (${n-1}+1)^2 = ${(n-1)*(n-1)} + 2\\times${n-1} + 1$，或直接算 $${n}\\times${n}$。`,
            explanation: `📖 詳解：$${n}^2 = ${n * n}$。`
          };
        },
        () => {
          const a = Math.floor(rand() * 5) + 3;
          const b = Math.floor(rand() * 4) + 2;
          return {
            question: `【多項式乘法：係數型】${preamble}\n展開並化簡 $(2x + ${a})(3x - ${b})$，$x$ 的係數為何？`,
            options: [
              `${3 * a - 2 * b}`,
              `${3 * a + 2 * b}`,
              `${2 * a + 3 * b}`,
              `${a - b}`
            ],
            answer: 0,
            hint: `💡 提示：$(2x)(−${b}) + ${a}(3x) = -${2*b}x + ${3*a}x$。`,
            explanation: `📖 詳解：展開得 $6x^2 + (${3*a} - ${2*b})x - ${a*b}$，$x$ 的係數為 ${3*a - 2*b}$。`
          };
        }
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 7)) % archetypes.length]();
    }

    // u2: 平方根、近似值與畢氏定理
    if (uNum === 2) {
      const archetypes = [
        () => {
          const pythTriples = [[5, 12, 13], [6, 8, 10], [7, 24, 25], [8, 15, 17], [9, 12, 15]];
          const [a, b, c] = pythTriples[Math.abs(index) % pythTriples.length];
          return {
            question: `【畢氏定理標準運算】${preamble}\n在直角三角形中，兩股長分別為 ${a} 和 ${b}，則斜邊長度為何？`,
            options: [`${c}`, `${c + 2}`, `${c - 1}`, `$\\sqrt{${a * a + b * b + 10}}$`],
            answer: 0,
            hint: `💡 提示：畢氏定理 $c = \\sqrt{a^2 + b^2}$。`,
            explanation: `📖 詳解：斜邊 $c = \\sqrt{${a * a} + ${b * b}} = ${c}$。`
          };
        },
        () => ({
          question: `【平方根的化簡】${preamble}\n將 $\\sqrt{48}$ 化為最簡根式，其結果為何？`,
          options: [`$4\\sqrt{3}$`, `$2\\sqrt{12}$`, `$16\\sqrt{3}$`, `$3\\sqrt{4}$`],
          answer: 0,
          hint: `💡 提示：$48 = 16 \\times 3 = 4^2 \\times 3$。`,
          explanation: `📖 詳解：$\\sqrt{48} = 4\\sqrt{3}$。`
        }),
        () => {
          const vals = [[72, 6, 2], [50, 5, 2], [75, 5, 3], [98, 7, 2], [12, 2, 3]];
          const [n, k, r] = vals[Math.abs(index) % vals.length];
          return {
            question: `【最簡根式化簡】${preamble}\n化簡 $\\sqrt{${n}}$，其結果為何？`,
            options: [`$${k}\\sqrt{${r}}$`, `$${k - 1}\\sqrt{${r + 1}}$`, `$\\sqrt{${n}}$（無法化簡）`, `$${k * r}$`],
            answer: 0,
            hint: `💡 提示：${n} = ${k * k} × ${r}，$\\sqrt{${n}} = \\sqrt{${k*k} \\times ${r}} = ${k}\\sqrt{${r}}$。`,
            explanation: `📖 詳解：$\\sqrt{${n}} = \\sqrt{${k*k} \\times ${r}} = ${k}\\sqrt{${r}}$。`
          };
        },
        () => {
          const x = Math.floor(rand() * 8) + 4;
          const sq = x * x;
          return {
            question: `【平方根的定義】${preamble}\n$\\sqrt{${sq}}$ 的值為何？`,
            options: [`${x}`, `${x + 1}`, `${x - 1}`, `${sq / 2}`],
            answer: 0,
            hint: `💡 提示：找一個正數 $n$，使得 $n^2 = ${sq}$。`,
            explanation: `📖 詳解：因為 $${x}^2 = ${sq}$，所以 $\\sqrt{${sq}} = ${x}$。`
          };
        },
        () => {
          const h = Math.floor(rand() * 6) + 3;
          const b = Math.floor(rand() * 6) + 4;
          const diag = Math.sqrt(h * h + b * b);
          const isDiagInt = Number.isInteger(diag);
          const displayDiag = isDiagInt ? String(diag) : `\\sqrt{${h*h + b*b}}`;
          return {
            question: `【畢氏定理應用：樓梯斜面】${preamble}\n一個樓梯，水平距離為 ${b} 公尺，高度為 ${h} 公尺。樓梯斜面（斜邊）的長度為何？`,
            options: [
              `$${displayDiag}$ 公尺`,
              `$${h + b}$ 公尺`,
              `$\\sqrt{${h*h + b*b + 5}}$ 公尺`,
              `$${Math.abs(h - b)}$ 公尺`
            ],
            answer: 0,
            hint: `💡 提示：水平距離與高度形成直角，斜面 $= \\sqrt{${h}^2 + ${b}^2}$。`,
            explanation: `📖 詳解：斜面 $= \\sqrt{${h}^2 + ${b}^2} = \\sqrt{${h*h + b*b}} = ${displayDiag}$ 公尺。`
          };
        },
        () => {
          const sqrts = [[2, '1.414'], [3, '1.732'], [5, '2.236'], [7, '2.646']];
          const [n, approx] = sqrts[Math.abs(index) % sqrts.length];
          const k = Math.floor(rand() * 3) + 2;
          const bigN = n * k * k;
          return {
            question: `【平方根近似值應用】${preamble}\n已知 $\\sqrt{${n}} \\approx ${approx}$，則 $\\sqrt{${bigN}}$ 的近似值約為多少？`,
            options: [
              `${(k * parseFloat(approx)).toFixed(3)}`,
              `${(k * parseFloat(approx) + 1).toFixed(3)}`,
              `${(parseFloat(approx) + k).toFixed(3)}`,
              `${(parseFloat(approx) * n).toFixed(3)}`
            ],
            answer: 0,
            hint: `💡 提示：$\\sqrt{${bigN}} = \\sqrt{${k*k} \\times ${n}} = ${k}\\sqrt{${n}} \\approx ${k} \\times ${approx}$。`,
            explanation: `📖 詳解：$\\sqrt{${bigN}} = ${k}\\sqrt{${n}} \\approx ${k} \\times ${approx} = ${(k * parseFloat(approx)).toFixed(3)}$。`
          };
        }
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 7)) % archetypes.length]();
    }

    // u3: 因式分解
    if (uNum === 3) {
      const archetypes = [
        () => ({
          question: `【十字交乘因式分解】${preamble}\n將 $x^2 - 5x - 24$ 因式分解，其結果為何？`,
          options: [`$(x - 8)(x + 3)$`, `$(x + 8)(x - 3)$`, `$(x - 6)(x + 4)$`, `$(x - 12)(x + 2)$`],
          answer: 0,
          hint: `💡 提示：找兩數乘積為 -24，相加為 -5：$-8 \\times 3 = -24, -8 + 3 = -5$。`,
          explanation: `📖 詳解：$(x - 8)(x + 3)$。`
        }),
        () => ({
          question: `【提公因式法】${preamble}\n多項式 $3x^2 - 12x$ 因式分解結果為何？`,
          options: [`$3x(x - 4)$`, `$3(x^2 - 4)$`, `$x(3x - 12)$`, `$(3x - 4)(x + 1)$`],
          answer: 0,
          hint: `💡 提示：兩項都有公因式 $3x$。`,
          explanation: `📖 詳解：$3x^2 - 12x = 3x(x - 4)$。`
        }),
        () => {
          const cases = [
            { expr: 'x^2 - 9', ans: '(x+3)(x-3)', wrong: ['(x-3)^2', '(x+3)^2', '(x-9)(x+1)'] },
            { expr: 'x^2 - 25', ans: '(x+5)(x-5)', wrong: ['(x-5)^2', '(x+5)^2', '(x-25)(x+1)'] },
            { expr: 'x^2 - 16', ans: '(x+4)(x-4)', wrong: ['(x-4)^2', '(x+4)^2', '(x-8)(x+2)'] },
            { expr: '4x^2 - 1', ans: '(2x+1)(2x-1)', wrong: ['(2x-1)^2', '(4x-1)(x+1)', '(2x+1)^2'] }
          ];
          const c = cases[Math.abs(index) % cases.length];
          return {
            question: `【平方差因式分解】${preamble}\n對 $${c.expr}$ 進行因式分解，結果為何？`,
            options: [`$${c.ans}$`, `$${c.wrong[0]}$`, `$${c.wrong[1]}$`, `$${c.wrong[2]}$`],
            answer: 0,
            hint: `💡 提示：利用 $a^2 - b^2 = (a+b)(a-b)$。`,
            explanation: `📖 詳解：$${c.expr} = ${c.ans}$（平方差公式）。`
          };
        },
        () => {
          const a = Math.floor(rand() * 4) + 2;
          const b = Math.floor(rand() * 4) + 1;
          const sum = a + b;
          const prod = a * b;
          return {
            question: `【十字交乘法（正係數）】${preamble}\n將 $x^2 + ${sum}x + ${prod}$ 因式分解，結果為何？`,
            options: [`$(x + ${a})(x + ${b})$`, `$(x - ${a})(x - ${b})$`, `$(x + ${sum})(x + 1)$`, `$(x + ${prod})(x + 1)$`],
            answer: 0,
            hint: `💡 提示：找兩正數乘積為 ${prod}，相加為 ${sum}。`,
            explanation: `📖 詳解：$${a} \\times ${b} = ${prod}$，$${a} + ${b} = ${sum}$，故分解為 $(x + ${a})(x + ${b})$。`
          };
        },
        () => {
          const k = Math.floor(rand() * 4) + 2;
          const n = Math.floor(rand() * 5) + 3;
          return {
            question: `【提公因式進階】${preamble}\n化簡 $${k}x^2 + ${k * n}x$，最完全的因式分解為何？`,
            options: [`$${k}x(x + ${n})$`, `$x(${k}x + ${k * n})$`, `$${k}(x^2 + ${n}x)$`, `$${k * n}x(x + 1)$`],
            answer: 0,
            hint: `💡 提示：提出最大公因式 $${k}x$。`,
            explanation: `📖 詳解：$${k}x^2 + ${k * n}x = ${k}x \\cdot x + ${k}x \\cdot ${n} = ${k}x(x + ${n})$。`
          };
        },
        () => {
          const a = Math.floor(rand() * 4) + 2;
          return {
            question: `【完全平方式因式分解】${preamble}\n$x^2 + ${2*a}x + ${a*a}$ 進行因式分解，結果為何？`,
            options: [`$(x + ${a})^2$`, `$(x - ${a})^2$`, `$(x + ${a})(x - ${a})$`, `$(x + ${a*2})(x + 1)$`],
            answer: 0,
            hint: `💡 提示：注意是否符合 $(a+b)^2 = a^2 + 2ab + b^2$ 的完全平方式型態。`,
            explanation: `📖 詳解：$x^2 + ${2*a}x + ${a*a} = (x + ${a})^2$。`
          };
        }
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 7)) % archetypes.length]();
    }

    // u4: 一元二次方程式
    if (uNum === 4) {
      const archetypes = [
        () => ({
          question: `【一元二次方程式解法】${preamble}\n方程式 $(x - 3)(2x + 5) = 0$ 的兩根為何？`,
          options: [`$x = 3$ 或 $x = -\\frac{5}{2}$`, `$x = -3$ 或 $x = \\frac{5}{2}$`, `$x = 3$ 或 $x = \\frac{5}{2}$`, `$x = -3$ 或 $x = -\\frac{5}{2}$`],
          answer: 0,
          hint: `💡 提示：$A \\times B = 0 \\Rightarrow A = 0$ 或 $B = 0$。`,
          explanation: `📖 詳解：$x = 3$ 或 $x = -\\frac{5}{2}$。`
        }),
        () => ({
          question: `【判別式與根的性質】${preamble}\n若 $x^2 - 4x + k = 0$ 有兩相等實根，則 $k$ 為何？`,
          options: [`4`, `-4`, `16`, `-16`],
          answer: 0,
          hint: `💡 提示：重根條件：$\\Delta = b^2 - 4ac = 0$。`,
          explanation: `📖 詳解：$\\Delta = 16 - 4k = 0 \\Rightarrow k = 4$。`
        }),
        () => {
          const r1 = Math.floor(rand() * 6) + 1;
          const r2 = -(Math.floor(rand() * 5) + 1);
          const sum = r1 + r2;
          const prod = r1 * r2;
          return {
            question: `【由根構造方程】${preamble}\n若一元二次方程式的兩根為 $${r1}$ 與 $${r2}$，則此方程式為下列何者？`,
            options: [`$x^2 - ${sum}x + (${prod}) = 0$`, `$x^2 + ${sum}x + ${prod} = 0$`, `$x^2 - ${prod}x + ${sum} = 0$`, `$x^2 + ${prod}x - ${sum} = 0$`],
            answer: 0,
            hint: `💡 提示：$(x - r_1)(x - r_2) = 0 \\Rightarrow x^2 - (r_1 + r_2)x + r_1 r_2 = 0$。`,
            explanation: `📖 詳解：兩根之和 $= ${sum}$，積 $= ${prod}$，方程式為 $x^2 - ${sum}x + (${prod}) = 0$。`
          };
        },
        () => {
          const a = Math.floor(rand() * 4) + 1;
          const b = -(Math.floor(rand() * 3) + 1);
          return {
            question: `【配方法求根】${preamble}\n解方程式 $x^2 - ${2*a}x + ${a*a + b} = 0$，其解為何？`,
            options: [
              `$x = ${a + Math.sqrt(-b)} $ 或 $x = ${a - Math.sqrt(-b)}$（若 ${-b} 為完全平方）`,
              `$x = ${a}$（重根）`,
              `$x = ${2*a}$ 或 $x = ${-(a*a + b)}$`,
              `無實數根`
            ],
            answer: b < 0 && Number.isInteger(Math.sqrt(-b)) ? 0 : 1,
            hint: `💡 提示：配方法：$(x - ${a})^2 = ${-b}$。`,
            explanation: `📖 詳解：$(x - ${a})^2 = ${-b}$，$x - ${a} = \\pm\\sqrt{${-b}}$。`
          };
        },
        () => {
          const w = Math.floor(rand() * 8) + 5;
          const area = w * (w + Math.floor(rand() * 6) + 3);
          const l = area / w;
          return {
            question: `【一元二次方程式應用：矩形面積】${preamble}\n一矩形面積為 ${area} 平方公分，長比寬多 ${l - w} 公分。請問矩形的寬為多少？`,
            options: [`${w} 公分`, `${l} 公分`, `${w + 2} 公分`, `${w - 1} 公分`],
            answer: 0,
            hint: `💡 提示：設寬為 $x$，長為 $x + ${l - w}$，列方程式 $x(x + ${l - w}) = ${area}$。`,
            explanation: `📖 詳解：$x^2 + ${l - w}x - ${area} = 0$，解得 $x = ${w}$（取正值），寬為 ${w} 公分。`
          };
        },
        () => {
          const v0 = Math.floor(rand() * 10) + 20;
          const t = Math.floor(rand() * 3) + 2;
          const h = v0 * t - 5 * t * t;
          return {
            question: `【拋物運動應用】${preamble}\n一球以初速 ${v0} 公尺/秒垂直上拋，高度公式為 $h = ${v0}t - 5t^2$（$t$ 為秒）。當 $t = ${t}$ 秒時，高度為幾公尺？`,
            options: [`${h} 公尺`, `${h + 10} 公尺`, `${v0 * t} 公尺`, `${5 * t * t} 公尺`],
            answer: 0,
            hint: `💡 提示：代入 $t = ${t}$：$h = ${v0} \\times ${t} - 5 \\times ${t}^2$。`,
            explanation: `📖 詳解：$h = ${v0 * t} - ${5 * t * t} = ${h}$ 公尺。`
          };
        }
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 7)) % archetypes.length]();
    }

    // u5: 等差數列與等差級數
    if (uNum === 5) {
      const archetypes = [
        () => ({
          question: `【等差數列項數求解】${preamble}\n已知等差數列首項 $a_1 = 5$，公差 $d = 4$，第幾項的值為 45？`,
          options: [`第 11 項`, `第 10 項`, `第 12 項`, `第 9 項`],
          answer: 0,
          hint: `💡 提示：$a_n = a_1 + (n-1)d \\Rightarrow 45 = 5 + (n-1) \\times 4$。`,
          explanation: `📖 詳解：$n - 1 = 10 \\Rightarrow n = 11$。`
        }),
        () => ({
          question: `【等差級數求和】${preamble}\n計算等差級數 $3 + 7 + 11 + \\dots + 39$ 的總和為多少？`,
          options: [`210`, `190`, `220`, `420`],
          answer: 0,
          hint: `💡 提示：項數 $n = \\frac{39-3}{4} + 1 = 10$，$S_{10} = \\frac{10(3+39)}{2}$。`,
          explanation: `📖 詳解：$S_{10} = \\frac{10 \\times 42}{2} = 210$。`
        }),
        () => {
          const a1 = Math.floor(rand() * 10) + 2;
          const d = Math.floor(rand() * 5) + 2;
          const n = Math.floor(rand() * 8) + 5;
          const an = a1 + (n - 1) * d;
          return {
            question: `【等差數列通項求值】${preamble}\n等差數列首項 $a_1 = ${a1}$，公差 $d = ${d}$，請問第 ${n} 項為多少？`,
            options: [`${an}`, `${an + d}`, `${an - d}`, `${a1 + d * n}`],
            answer: 0,
            hint: `💡 提示：$a_n = a_1 + (n-1)d = ${a1} + (${n}-1) \\times ${d}$。`,
            explanation: `📖 詳解：$a_{${n}} = ${a1} + ${n - 1} \\times ${d} = ${a1} + ${(n-1)*d} = ${an}$。`
          };
        },
        () => {
          const a1 = Math.floor(rand() * 5) + 1;
          const an = a1 + (Math.floor(rand() * 15) + 10);
          const n = Math.floor(rand() * 8) + 5;
          const Sn = n * (a1 + an) / 2;
          return {
            question: `【等差級數公式應用】${preamble}\n等差數列共 ${n} 項，首項為 ${a1}，末項為 ${an}，求其總和。`,
            options: [
              `${Number.isInteger(Sn) ? Sn : Sn.toFixed(1)}`,
              `${(n * an)}`,
              `${Math.round(Sn * 2)}`,
              `${a1 + an}`
            ],
            answer: 0,
            hint: `💡 提示：$S_n = \\frac{n(a_1 + a_n)}{2} = \\frac{${n}(${a1} + ${an})}{2}$。`,
            explanation: `📖 詳解：$S_{${n}} = \\frac{${n} \\times ${a1 + an}}{2} = ${Number.isInteger(Sn) ? Sn : Sn.toFixed(1)}$。`
          };
        },
        () => {
          const d = Math.floor(rand() * 4) + 2;
          const n = Math.floor(rand() * 5) + 5;
          const Sn = n * (n + 1) / 2 * d - (d - 0) * n + (Math.floor(rand() * 5) + 1) * n;
          const a1 = Math.floor(rand() * 5) + 3;
          const totalS = n * a1 + d * n * (n - 1) / 2;
          return {
            question: `【連續整數和】${preamble}\n計算 $1 + 2 + 3 + \\dots + ${n * 2}$ 的總和為多少？`,
            options: [`${n * 2 * (n * 2 + 1) / 2}`, `${n * 2 * n}`, `${n * (n + 1)}`, `${n * 2 * (n * 2 - 1) / 2}`],
            answer: 0,
            hint: `💡 提示：$1 + 2 + \\dots + m = \\frac{m(m+1)}{2}$，此處 $m = ${n * 2}$。`,
            explanation: `📖 詳解：$\\frac{${n*2} \\times ${n*2+1}}{2} = ${n * 2 * (n * 2 + 1) / 2}$。`
          };
        },
        () => {
          const a3 = Math.floor(rand() * 10) + 8;
          const a7 = a3 + (Math.floor(rand() * 4) + 2) * 4;
          const d = (a7 - a3) / 4;
          const a1 = a3 - 2 * d;
          return {
            question: `【由兩項求公差與首項】${preamble}\n等差數列中，第 3 項為 ${a3}，第 7 項為 ${a7}，請問公差 $d$ 與首項 $a_1$ 分別為何？`,
            options: [
              `公差 ${d}，首項 ${a1}`,
              `公差 ${d + 1}，首項 ${a1 - 2}`,
              `公差 ${a7 - a3}，首項 ${a3}`,
              `公差 ${d}，首項 ${a3}`
            ],
            answer: 0,
            hint: `💡 提示：$a_7 - a_3 = 4d$，解得 $d = \\frac{${a7} - ${a3}}{4} = ${d}$，再代入求 $a_1$。`,
            explanation: `📖 詳解：$d = \\frac{${a7}-${a3}}{4} = ${d}$。$a_1 = a_3 - 2d = ${a3} - ${2*d} = ${a1}$。`
          };
        }
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 7)) % archetypes.length]();
    }

    // u6: 平面幾何性質與三角形內角和
    if (uNum === 6) {
      const archetypes = [
        () => ({
          question: `【多邊形內角和公式】${preamble}\n一個正八邊形的「內角和」與「每一個內角」分別為多少度？`,
          options: [`內角和 $1080^\\circ$，每一內角 $135^\\circ$`, `內角和 $900^\\circ$，每一內角 $128.5^\\circ$`, `內角和 $1260^\\circ$，每一內角 $140^\\circ$`, `內角和 $1080^\\circ$，每一內角 $120^\\circ$`],
          answer: 0,
          hint: `💡 提示：$n$ 邊形內角和 $= (n - 2) \\times 180^\\circ$。`,
          explanation: `📖 詳解：$(8-2) \\times 180^\\circ = 1080^\\circ$，每內角 $= 1080^\\circ \\div 8 = 135^\\circ$。`
        }),
        () => ({
          question: `【平行線截角性質】${preamble}\n$L_1 \\parallel L_2$，截線 $M$ 使同側內角度數比為 $2 : 3$，較大角為幾度？`,
          options: [`$108^\\circ$`, `$72^\\circ$`, `$120^\\circ$`, `$90^\\circ$`],
          answer: 0,
          hint: `💡 提示：同側內角互補，和為 $180^\\circ$。`,
          explanation: `📖 詳解：一份 $= 36^\\circ$，大角 $= 3 \\times 36^\\circ = 108^\\circ$。`
        }),
        () => {
          const n = [5, 6, 7, 9, 10, 12][Math.floor(rand() * 6)];
          const sum = (n - 2) * 180;
          const each = n % 2 === 0 ? sum / n : null;
          return {
            question: `【多邊形內角和】${preamble}\n正 ${n} 邊形的「內角和」為多少度？`,
            options: [`$${sum}^\\circ$`, `$${sum + 180}^\\circ$`, `$${(n - 1) * 180}^\\circ$`, `$${n * 180}^\\circ$`],
            answer: 0,
            hint: `💡 提示：$(${n} - 2) \\times 180^\\circ$。`,
            explanation: `📖 詳解：$(${n} - 2) \\times 180^\\circ = ${n - 2} \\times 180^\\circ = ${sum}^\\circ$。`
          };
        },
        () => {
          const a = Math.floor(rand() * 50) + 30;
          const b = Math.floor(rand() * 50) + 30;
          const c = 180 - a - b;
          return {
            question: `【三角形內角和求未知角】${preamble}\n三角形三個內角中，已知兩角分別為 $${a}^\\circ$ 和 $${b}^\\circ$，第三個角為幾度？`,
            options: [`$${c}^\\circ$`, `$${c + 10}^\\circ$`, `$${180 - a}^\\circ$`, `$${a + b}^\\circ$`],
            answer: 0,
            hint: `💡 提示：三角形內角和 $= 180^\\circ$。`,
            explanation: `📖 詳解：第三角 $= 180^\\circ - ${a}^\\circ - ${b}^\\circ = ${c}^\\circ$。`
          };
        },
        () => {
          const ext = Math.floor(rand() * 80) + 60;
          const int1 = Math.floor(rand() * (ext - 10)) + 10;
          const int2 = ext - int1;
          return {
            question: `【三角形外角定理】${preamble}\n$\\triangle ABC$ 中，$\\angle A = ${int1}^\\circ$，$\\angle B = ${int2}^\\circ$，求邊 $BC$ 的延長線所形成的外角（$\\angle ACD$）度數。`,
            options: [`$${ext}^\\circ$`, `$${180 - ext}^\\circ$`, `$${ext + 10}^\\circ$`, `$${int1}^\\circ$`],
            answer: 0,
            hint: `💡 提示：三角形外角等於不相鄰兩內角之和。`,
            explanation: `📖 詳解：$\\angle ACD = \\angle A + \\angle B = ${int1}^\\circ + ${int2}^\\circ = ${ext}^\\circ$。`
          };
        },
        () => {
          const ratio = [2, 3, 4][Math.floor(rand() * 3)];
          const total = 180;
          const unit = total / (ratio + 1 + ratio - 1);
          const ang1 = ratio * unit;
          const ang2 = unit;
          const ang3 = (ratio - 1) * unit;
          const safeAng1 = 60 + Math.floor(rand() * 30);
          const safeAng2 = Math.floor(rand() * 30) + 20;
          const safeAng3 = 180 - safeAng1 - safeAng2;
          return {
            question: `【等腰三角形底角】${preamble}\n等腰三角形的頂角為 $${safeAng1}^\\circ$，則底角各為幾度？`,
            options: [
              `$${(180 - safeAng1) / 2}^\\circ$`,
              `$${safeAng1}^\\circ$`,
              `$${90 - safeAng1 / 2}^\\circ$`,
              `$${(180 - safeAng1)}^\\circ$`
            ],
            answer: 0,
            hint: `💡 提示：等腰三角形兩底角相等，底角 $= (180^\\circ - \\text{頂角}) \\div 2$。`,
            explanation: `📖 詳解：底角 $= \\frac{180^\\circ - ${safeAng1}^\\circ}{2} = ${(180 - safeAng1) / 2}^\\circ$。`
          };
        }
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 7)) % archetypes.length]();
    }
  }

  // ============================================================
  // 國三 (九年級)
  // ============================================================
  if (gradeId === 'g9') {
    // u1: 相似形與比例線段
    if (uNum === 1) {
      const archetypes = [
        () => ({
          question: `【相似三角形面積比】${preamble}\n若 $\\triangle ABC \\sim \\triangle DEF$，對應邊長比為 $3 : 5$。若 $\\triangle ABC$ 面積為 18，則 $\\triangle DEF$ 面積為多少？`,
          options: [`50`, `30`, `45`, `25`],
          answer: 0,
          hint: `💡 提示：面積比 = 邊長平方比：$3^2 : 5^2 = 9 : 25$。`,
          explanation: `📖 詳解：$\\frac{18}{S} = \\frac{9}{25} \\Rightarrow S = 50$。`
        }),
        () => ({
          question: `【平行截比例線段】${preamble}\n$\\triangle ABC$ 中，$DE \\parallel BC$，$AD = 4$，$DB = 6$，$AE = 6$，則 $EC = $？`,
          options: [`9`, `8`, `10`, `7.5`],
          answer: 0,
          hint: `💡 提示：$\\frac{AD}{DB} = \\frac{AE}{EC}$。`,
          explanation: `📖 詳解：$\\frac{4}{6} = \\frac{6}{EC} \\Rightarrow EC = 9$。`
        }),
        () => {
          const ratioN = Math.floor(rand() * 3) + 2;
          const ratioD = ratioN + Math.floor(rand() * 3) + 1;
          const perim1 = (Math.floor(rand() * 5) + 3) * ratioN;
          const perim2 = perim1 * ratioD / ratioN;
          return {
            question: `【相似形周長比】${preamble}\n兩相似三角形的對應邊長比為 $${ratioN} : ${ratioD}$，若較小三角形周長為 ${perim1}，則較大三角形的周長為多少？`,
            options: [`${perim2}`, `${perim2 + ratioD}`, `${perim1 * 2}`, `${perim1 + ratioD}`],
            answer: 0,
            hint: `💡 提示：相似三角形周長比 = 對應邊長比。`,
            explanation: `📖 詳解：周長比 $= ${ratioN} : ${ratioD}$，較大周長 $= ${perim1} \\times \\frac{${ratioD}}{${ratioN}} = ${perim2}$。`
          };
        },
        () => {
          const AD = Math.floor(rand() * 4) + 2;
          const DB = Math.floor(rand() * 4) + 2;
          const AB = AD + DB;
          const k = Math.floor(rand() * 5) + 4;
          const DE = k;
          const BC = k * AB / AD;
          return {
            question: `【相似三角形求邊長】${preamble}\n$\\triangle ADE \\sim \\triangle ABC$，$AD = ${AD}$，$AB = ${AB}$，$DE = ${DE}$，則 $BC = $？`,
            options: [`${BC}`, `${BC + 2}`, `${DE * 2}`, `${AB}`],
            answer: 0,
            hint: `💡 提示：$\\frac{DE}{BC} = \\frac{AD}{AB}$。`,
            explanation: `📖 詳解：$BC = DE \\times \\frac{AB}{AD} = ${DE} \\times \\frac{${AB}}{${AD}} = ${BC}$。`
          };
        },
        () => {
          const scale = Math.floor(rand() * 3) + 2;
          const area1 = (Math.floor(rand() * 5) + 3) * 4;
          const area2 = area1 * scale * scale;
          return {
            question: `【相似比與體積比】${preamble}\n兩相似立體的線性比例為 $1 : ${scale}$，若較小者體積為 ${area1}，較大者體積為多少？`,
            options: [
              `${area1 * scale * scale * scale}`,
              `${area1 * scale}`,
              `${area1 * scale * scale}`,
              `${area1 * (scale + 1)}`
            ],
            answer: 0,
            hint: `💡 提示：相似立體的體積比 = 線性比的三次方。`,
            explanation: `📖 詳解：體積比 $= 1^3 : ${scale}^3 = 1 : ${scale**3}$，較大體積 $= ${area1} \\times ${scale**3} = ${area1 * scale**3}$。`
          };
        }
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 7)) % archetypes.length]();
    }

    // u2: 圓形幾何性質
    if (uNum === 2) {
      const archetypes = [
        () => {
          const centralAngle = (Math.floor(rand() * 9) + 2) * 20;
          const inscribed = centralAngle / 2;
          return {
            question: `【圓周角與圓心角關係】${preamble}\n在同一個圓中，若一段弧所對的圓心角為 $${centralAngle}^\\circ$，則該弧所對的圓周角為多少度？`,
            options: [`$${inscribed}^\\circ$`, `$${centralAngle}^\\circ$`, `$${centralAngle * 2}^\\circ$`, `$${180 - centralAngle}^\\circ$`],
            answer: 0,
            hint: `💡 提示：同弧圓周角 = 圓心角的一半。`,
            explanation: `📖 詳解：圓周角 $= \\frac{1}{2} \\times ${centralAngle}^\\circ = ${inscribed}^\\circ$。`
          };
        },
        () => ({
          question: `【圓外切四邊形對邊和】${preamble}\n四邊形 ABCD 外切於一圓，$AB = 7, BC = 9, CD = 11$，則 $AD = $？`,
          options: [`9`, `8`, `10`, `13`],
          answer: 0,
          hint: `💡 提示：外切四邊形兩組對邊和相等：$AB + CD = BC + AD$。`,
          explanation: `📖 詳解：$7 + 11 = 9 + AD \\Rightarrow AD = 9$。`
        }),
        () => {
          const r = Math.floor(rand() * 5) + 3;
          const arcAngle = (Math.floor(rand() * 5) + 2) * 30;
          const arcLen = Math.round(2 * Math.PI * r * arcAngle / 360 * 100) / 100;
          return {
            question: `【弧長計算】${preamble}\n圓的半徑為 ${r}，某弧所對的圓心角為 $${arcAngle}^\\circ$，則該弧的弧長為何（取 $\\pi \\approx 3.14$）？`,
            options: [
              `${(2 * 3.14 * r * arcAngle / 360).toFixed(2)}`,
              `${(3.14 * r * r * arcAngle / 360).toFixed(2)}`,
              `${(2 * 3.14 * r).toFixed(2)}`,
              `${(3.14 * r * arcAngle / 360).toFixed(2)}`
            ],
            answer: 0,
            hint: `💡 提示：弧長 $= 2\\pi r \\times \\frac{\\theta}{360^\\circ}$。`,
            explanation: `📖 詳解：弧長 $= 2 \\times 3.14 \\times ${r} \\times \\frac{${arcAngle}}{360} \\approx ${(2 * 3.14 * r * arcAngle / 360).toFixed(2)}$。`
          };
        },
        () => {
          const r = Math.floor(rand() * 5) + 4;
          const area = Math.round(Math.PI * r * r * 100) / 100;
          return {
            question: `【圓面積計算】${preamble}\n一個半徑為 ${r} 的圓，其面積為何（以 $\\pi$ 表示）？`,
            options: [`$${r * r}\\pi$`, `$${2 * r}\\pi$`, `$${r}\\pi$`, `$${r * r * 2}\\pi$`],
            answer: 0,
            hint: `💡 提示：圓面積 $= \\pi r^2$。`,
            explanation: `📖 詳解：面積 $= \\pi \\times ${r}^2 = ${r * r}\\pi$。`
          };
        },
        () => {
          const r = Math.floor(rand() * 5) + 3;
          const sectorAngle = (Math.floor(rand() * 4) + 1) * 60;
          const sectorArea = r * r * Math.PI * sectorAngle / 360;
          return {
            question: `【扇形面積計算】${preamble}\n半徑為 ${r} 的扇形，圓心角為 $${sectorAngle}^\\circ$，以 $\\pi$ 表示其面積。`,
            options: [
              `$\\frac{${r * r * sectorAngle}\\pi}{360}$`,
              `$\\frac{${2 * r * sectorAngle}\\pi}{360}$`,
              `$${r * r}\\pi$`,
              `$\\frac{${r * sectorAngle}\\pi}{360}$`
            ],
            answer: 0,
            hint: `💡 提示：扇形面積 $= \\pi r^2 \\times \\frac{\\theta}{360}$。`,
            explanation: `📖 詳解：扇形面積 $= \\pi \\times ${r}^2 \\times \\frac{${sectorAngle}}{360} = \\frac{${r * r * sectorAngle}\\pi}{360}$。`
          };
        },
        () => {
          const inscribed = (Math.floor(rand() * 5) + 2) * 10;
          const arc = inscribed * 2;
          return {
            question: `【同弧對應之圓周角相等】${preamble}\n同一圓中，若圓周角 $\\angle APB = ${inscribed}^\\circ$（P 在圓上），則同弧 $\\widehat{AB}$ 所對的另一個圓周角 $\\angle AQB$ 等於多少度？`,
            options: [`$${inscribed}^\\circ$`, `$${arc}^\\circ$`, `$${180 - inscribed}^\\circ$`, `$${inscribed / 2}^\\circ$`],
            answer: 0,
            hint: `💡 提示：同弧上的所有圓周角相等。`,
            explanation: `📖 詳解：同弧上的圓周角相等，故 $\\angle AQB = ${inscribed}^\\circ$。`
          };
        }
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 7)) % archetypes.length]();
    }

    // u3: 幾何證明與三角形三心
    if (uNum === 3) {
      const archetypes = [
        () => ({
          question: `【直角三角形外心位置】${preamble}\n在直角三角形中，兩股長分別為 6 和 8。外接圓半徑是多少？`,
          options: [`5`, `10`, `2.5`, `24`],
          answer: 0,
          hint: `💡 提示：直角三角形外心在斜邊中點，外接圓半徑 $= $ 斜邊 $\\div 2$。`,
          explanation: `📖 詳解：斜邊 $= \\sqrt{36 + 64} = 10$，$R = 5$。`
        }),
        () => {
          const medianLen = Math.floor(rand() * 8) + 9;
          const ag = medianLen * 2 / 3;
          return {
            question: `【重心性質與中線分點】${preamble}\n$\\triangle ABC$ 的重心 G，中線 AD 長 ${medianLen}，則 AG 為多少？`,
            options: [`${ag}`, `${medianLen / 3}`, `${medianLen / 2}`, `${medianLen * 2}`],
            answer: 0,
            hint: `💡 提示：重心將中線分成 $2 : 1$，AG $= \\frac{2}{3}$ AD。`,
            explanation: `📖 詳解：$AG = \\frac{2}{3} \\times ${medianLen} = ${ag}$。`
          };
        },
        () => ({
          question: `【內心與角平分線性質】${preamble}\n三角形的內心（內切圓圓心）是哪三條線的交點？`,
          options: [`三條角平分線`, `三條中線`, `三條中垂線`, `三條高`],
          answer: 0,
          hint: `💡 提示：內心到三邊距離相等（即內切圓半徑），由角平分線決定。`,
          explanation: `📖 詳解：三角形內心是三條角平分線的交點，到三邊距離相等。`
        }),
        () => ({
          question: `【垂心、外心、重心位置特性】${preamble}\n關於三角形的三心，下列何者描述正確？`,
          options: [
            `直角三角形的外心位於斜邊中點`,
            `三角形的重心在三角形外部`,
            `三角形的內心是三條中線的交點`,
            `銳角三角形的垂心在三角形外部`
          ],
          answer: 0,
          hint: `💡 提示：外心是三條邊中垂線的交點；直角三角形外心在斜邊中點。`,
          explanation: `📖 詳解：直角三角形的外心（三邊中垂線交點）恰好落在斜邊中點上，這是直角三角形的重要性質。`
        }),
        () => {
          const r = Math.floor(rand() * 4) + 2;
          const a = r * 3 + Math.floor(rand() * 4);
          const b = r * 2 + Math.floor(rand() * 4);
          const c = Math.floor(rand() * 5) + r * 2;
          const s = (a + b + c) / 2;
          const area = r * s;
          return {
            question: `【內切圓半徑公式應用】${preamble}\n三角形三邊長為 ${a}、${b}、${c}，其內切圓半徑為 ${r}。請問此三角形的面積為何？`,
            options: [
              `${area}`,
              `${area * 2}`,
              `${r * (a + b + c)}`,
              `${Math.round(area / 2)}`
            ],
            answer: 0,
            hint: `💡 提示：面積 $= r \\times s$，其中 $s$ 為半周長 $= \\frac{${a}+${b}+${c}}{2} = ${s}$。`,
            explanation: `📖 詳解：半周長 $s = ${s}$，面積 $= r \\times s = ${r} \\times ${s} = ${area}$。`
          };
        }
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 7)) % archetypes.length]();
    }

    // u4: 二次函數與圖形極值
    if (uNum === 4) {
      const archetypes = [
        () => {
          const h = Math.floor(rand() * 6) - 2;
          const k = Math.floor(rand() * 10) + 2;
          const openUp = Math.random() > 0.5;
          const a = openUp ? Math.floor(rand() * 3) + 1 : -(Math.floor(rand() * 3) + 1);
          return {
            question: `【二次函數頂點與極值】${preamble}\n二次函數 $y = ${a > 0 ? a : '(' + a + ')'}(x ${h >= 0 ? '- ' + h : '+ ' + (-h)})^2 + ${k}$ 的頂點坐標與極值為何？`,
            options: [
              `頂點 $(${h}, ${k})$，${openUp ? '最小' : '最大'}值為 ${k}`,
              `頂點 $(-${h}, ${k})$，${openUp ? '最小' : '最大'}值為 ${k}`,
              `頂點 $(${h}, ${k})$，${openUp ? '最大' : '最小'}值為 ${k}`,
              `頂點 $(${h}, -${k})$，${openUp ? '最小' : '最大'}值為 -${k}`
            ],
            answer: 0,
            hint: `💡 提示：$a ${a > 0 ? '> 0' : '< 0'}$，開口${a > 0 ? '向上，有最小值' : '向下，有最大值'}；頂點 $= (h, k)$。`,
            explanation: `📖 詳解：頂點式 $y = a(x-h)^2+k$，頂點 $(${h}, ${k})$，${openUp ? '最小' : '最大'}值 $= ${k}$。`
          };
        },
        () => {
          const b = Math.floor(rand() * 6) + 2;
          const c = Math.floor(rand() * 10) - 5;
          const h = b / 2;
          const k = c - h * h;
          return {
            question: `【配方法求頂點】${preamble}\n將 $y = x^2 - ${b}x + ${c}$ 化為頂點式，則 $h + k$ 的值為多少？`,
            options: [`${h + k}`, `${b + c}`, `${h}`, `${k}`],
            answer: 0,
            hint: `💡 提示：$x^2 - ${b}x + (${b/2})^2 - (${b/2})^2 + ${c} = (x - ${b/2})^2 + ${k}$。`,
            explanation: `📖 詳解：$y = (x - ${h})^2 + ${k}$。$h = ${h}, k = ${k}$，$h + k = ${h + k}$。`
          };
        },
        () => {
          const a = Math.floor(rand() * 3) + 1;
          const b = -(Math.floor(rand() * 6) + 2);
          const c = Math.floor(rand() * 8) - 3;
          const disc = b * b - 4 * a * c;
          const hasRoot = disc >= 0;
          return {
            question: `【判別式判斷根的個數】${preamble}\n二次函數 $y = ${a}x^2 + (${b})x + ${c}$ 的拋物線與 $x$ 軸的交點個數為何？`,
            options: [
              disc > 0 ? `2 個交點` : disc === 0 ? `1 個交點（相切）` : `0 個交點`,
              disc > 0 ? `1 個交點` : `2 個交點`,
              `3 個交點`,
              disc > 0 ? `0 個交點` : `1 個交點`
            ],
            answer: 0,
            hint: `💡 提示：判別式 $\\Delta = b^2 - 4ac = ${b}^2 - 4 \\times ${a} \\times ${c} = ${disc}$。$\\Delta > 0$ 兩交點，$= 0$ 一交點，$< 0$ 不交。`,
            explanation: `📖 詳解：$\\Delta = ${disc}$ ${disc > 0 ? '> 0' : disc === 0 ? '= 0' : '< 0'}，故與 $x$ 軸有 ${disc > 0 ? 2 : disc === 0 ? 1 : 0} 個交點。`
          };
        },
        () => {
          const r1 = -(Math.floor(rand() * 4) + 1);
          const r2 = Math.floor(rand() * 4) + 1;
          return {
            question: `【拋物線與 $x$ 軸交點】${preamble}\n拋物線 $y = (x - ${r2})(x + ${-r1})$，其 $x$ 截距為何？`,
            options: [
              `$x = ${r2}$ 和 $x = ${r1}$`,
              `$x = ${-r2}$ 和 $x = ${-r1}$`,
              `$x = ${r2}$ 和 $x = ${-r1}$`,
              `$x = ${r2 - r1}$（一個交點）`
            ],
            answer: 0,
            hint: `💡 提示：令 $y = 0$，$(x - ${r2})(x + ${-r1}) = 0$，分別解各括號。`,
            explanation: `📖 詳解：$x - ${r2} = 0 \\Rightarrow x = ${r2}$；$x + ${-r1} = 0 \\Rightarrow x = ${r1}$。`
          };
        },
        () => {
          const w = Math.floor(rand() * 10) + 10;
          return {
            question: `【二次函數最大面積問題】${preamble}\n一矩形圍欄，使用 ${2 * w} 公尺的籬笆圍成，長 $x$ 寬 $(${w} - x)$ 的矩形。面積最大時，$x$ 應為多少？`,
            options: [`${w / 2}`, `${w}`, `${w / 4}`, `${w * 2}`],
            answer: 0,
            hint: `💡 提示：面積 $A = x(${w} - x) = -x^2 + ${w}x$，頂點在 $x = \\frac{${w}}{2}$ 時最大。`,
            explanation: `📖 詳解：$A = -x^2 + ${w}x$，頂點 $x = \\frac{${w}}{2} = ${w/2}$ 時面積最大 $= ${w/2 * (w - w/2)}$。`
          };
        }
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 7)) % archetypes.length]();
    }

    // u5: 統計與機率
    if (uNum === 5) {
      const archetypes = [
        () => ({
          question: `【統計量：中位數求法】${preamble}\n某組測驗成績：65, 72, 80, 85, 90, 95。這組數據的「中位數」為何？`,
          options: [`82.5 分`, `80 分`, `85 分`, `81.2 分`],
          answer: 0,
          hint: `💡 提示：6 個排序數據，中位數 = 第 3、4 個數的平均值。`,
          explanation: `📖 詳解：中位數 $= \\frac{80 + 85}{2} = 82.5$ 分。`
        }),
        () => ({
          question: `【古典機率計算】${preamble}\n同時擲兩顆公正六面骰，點數和為 7 的機率是多少？`,
          options: [`$\\frac{1}{6}$`, `$\\frac{7}{36}$`, `$\\frac{1}{12}$`, `$\\frac{5}{36}$`],
          answer: 0,
          hint: `💡 提示：總 36 種，點數和為 7 有 6 種組合。`,
          explanation: `📖 詳解：$P = \\frac{6}{36} = \\frac{1}{6}$。`
        }),
        () => {
          const data = Array.from({ length: 7 }, () => Math.floor(rand() * 30) + 60).sort((a, b) => a - b);
          const avg = Math.round(data.reduce((s, x) => s + x, 0) / data.length);
          const median = data[3];
          return {
            question: `【平均數計算】${preamble}\n七位學生成績為：${data.join(', ')}。這組數據的「平均數」為何？`,
            options: [`${avg} 分`, `${median} 分`, `${avg + 5} 分`, `${avg - 3} 分`],
            answer: 0,
            hint: `💡 提示：平均數 = 總和 ÷ 個數 = ${data.reduce((s, x) => s + x, 0)} ÷ 7。`,
            explanation: `📖 詳解：總和 $= ${data.reduce((s, x) => s + x, 0)}$，平均數 $= ${data.reduce((s, x) => s + x, 0)} \\div 7 \\approx ${avg}$ 分。`
          };
        },
        () => {
          const total = Math.floor(rand() * 5) + 8;
          const red = Math.floor(rand() * (total - 2)) + 1;
          const blue = total - red;
          const probRed = `${red}/${total}`;
          return {
            question: `【古典機率：摸球問題】${preamble}\n袋中有 ${red} 顆紅球和 ${blue} 顆藍球，隨機摸出一顆，摸到紅球的機率為何？`,
            options: [
              `$\\frac{${red}}{${total}}$`,
              `$\\frac{${blue}}{${total}}$`,
              `$\\frac{${red}}{${blue}}$`,
              `$\\frac{1}{${red}}$`
            ],
            answer: 0,
            hint: `💡 提示：機率 = 紅球數 ÷ 總球數。`,
            explanation: `📖 詳解：$P(\\text{紅}) = \\frac{${red}}{${total}}$。`
          };
        },
        () => {
          const data2 = Array.from({ length: 5 }, () => Math.floor(rand() * 20) + 70).sort((a, b) => a - b);
          const mode = data2[2]; // middle is mode in this fake set
          const maxV = data2[4];
          const minV = data2[0];
          const range = maxV - minV;
          return {
            question: `【全距計算】${preamble}\n五筆資料：${data2.join(', ')}。這組數據的「全距」為多少？`,
            options: [`${range}`, `${data2[2]}`, `${range + 5}`, `${range - 3}`],
            answer: 0,
            hint: `💡 提示：全距 = 最大值 - 最小值。`,
            explanation: `📖 詳解：全距 $= ${maxV} - ${minV} = ${range}$。`
          };
        },
        () => {
          const n = Math.floor(rand() * 4) + 4;
          const favorableA = Math.floor(rand() * (n - 2)) + 1;
          const favorableB = Math.floor(rand() * (n - 1 - favorableA)) + 1;
          const probBoth = favorableA * favorableB;
          const total2 = n * n;
          const g = (x, y) => y === 0 ? x : g(y, x % y);
          const gg = g(probBoth, total2);
          return {
            question: `【獨立事件機率】${preamble}\n甲袋有 ${n} 球，${favorableA} 顆白球；乙袋有 ${n} 球，${favorableB} 顆白球。從兩袋各取一球，兩球都是白球的機率為何？`,
            options: [
              `$\\frac{${probBoth / gg}}{${total2 / gg}}$`,
              `$\\frac{${favorableA + favorableB}}{${n * 2}}$`,
              `$\\frac{${favorableA}}{${n}} + \\frac{${favorableB}}{${n}}$`,
              `$\\frac{${favorableA * n}}{${total2}}$`
            ],
            answer: 0,
            hint: `💡 提示：獨立事件：$P(A \\cap B) = P(A) \\times P(B)$。`,
            explanation: `📖 詳解：$P = \\frac{${favorableA}}{${n}} \\times \\frac{${favorableB}}{${n}} = \\frac{${probBoth}}{${total2}} = \\frac{${probBoth / gg}}{${total2 / gg}}$。`
          };
        }
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 7)) % archetypes.length]();
    }
  }

  // ============================================================
  // 歷屆會考試題 (past-exams)
  // ============================================================
  if (gradeId === 'past-exams') {
    if (unitId === 'ma-past-u1') {
      const archetypes = [
        () => {
          const r = 2 + Math.floor(rand() * 4); // 2..5
          const c = (r * 5) + Math.floor(rand() * 5); // 斜邊
          const aPlusB = c + 2 * r;
          const perimeter = aPlusB + c;
          const area = r * (perimeter / 2);
          return {
            question: `【歷屆會考經典-幾何代數跨章節壓軸】${preamble}\n直角三角形中，斜邊長為 ${c}，其內切圓半徑為 ${r}。請問此直角三角形的周長與面積分別為何？`,
            options: [
              `周長 ${perimeter}，面積 ${area}`,
              `周長 ${perimeter - 4}，面積 ${area - 10}`,
              `周長 ${perimeter + 6}，面積 ${area + 12}`,
              `周長 ${perimeter - 2}，面積 ${area * 2}`
            ],
            answer: 0,
            hint: `💡 提示：兩股為 a、b。$a+b-c = 2r \\Rightarrow a+b = ${c} + 2(${r}) = ${aPlusB}$。周長 $= a+b+c = ${perimeter}$。面積 $= \\frac{r \\times \\text{周長}}{2} = \\frac{${r} \\times ${perimeter}}{2} = ${area}$。`,
            explanation: `📖 詳解：利用公式 $r = \\frac{a + b - c}{2}$ 得 $a + b = ${c} + ${2*r} = ${aPlusB}$。周長 $= ${aPlusB} + ${c} = ${perimeter}$。直角三角形面積 $= r \\times s = ${r} \\times \\frac{${perimeter}}{2} = ${area}$。`
          };
        },
        () => {
          const k = 2 + Math.floor(rand() * 4);
          const h = 3 * k;
          return {
            question: `【歷屆會考-二次函數與坐標拋物線】${preamble}\n一拋物線之頂點為 $(0, ${h})$，且通過點 $(3, 0)$ 與 $(-3, 0)$。若此拋物線方程式為 $y = ax^2 + c$，則 $a$ 之值為何？`,
            options: [
              `$a = -\\frac{${k}}{3}$`,
              `$a = \\frac{${k}}{3}$`,
              `$a = -${k}$`,
              `$a = -3`
            ],
            answer: 0,
            hint: `💡 提示：頂點在 $(0, ${h})$ 表示 $c = ${h}$。代入 $(3, 0) \\Rightarrow 0 = a(3)^2 + ${h} \\Rightarrow 9a = -${h}$。`,
            explanation: `📖 詳解：拋物線頂點為 $(0, ${h})$，設方程式為 $y = ax^2 + ${h}$。將點 $(3, 0)$ 代入：$0 = 9a + ${h} \\Rightarrow 9a = -${h} \\Rightarrow a = -\\frac{${h}}{9} = -\\frac{${k}}{3}$。`
          };
        },
        () => {
          const r = 3 + Math.floor(rand() * 3); // 3..5
          const L = 2 * r + 2; // 母線長
          return {
            question: `【歷屆會考-圓錐展開扇形圓心角】${preamble}\n一圓錐的底圓半徑為 ${r}，母線長為 ${L}。若將其側面展開成一扇形，則此扇形的圓心角為多少度？`,
            options: [
              `$${Math.round((r / L) * 360)}^\\circ$`,
              `$${Math.round((r / L) * 360) + 20}^\\circ$`,
              `$${Math.round((r / L) * 360) - 30}^\\circ$`,
              `$180^\\circ$`
            ],
            answer: 0,
            hint: `💡 提示：扇形圓心角公式 $\\theta = \\frac{\\text{底圓半徑}}{\\text{母線長}} \\times 360^\\circ = \\frac{${r}}{${L}} \\times 360^\\circ$。`,
            explanation: `📖 詳解：側面展開後的扇形弧長等於底圓圓周長：$2\\pi \\times ${L} \\times \\frac{\\theta}{360^\\circ} = 2\\pi \\times ${r} \\Rightarrow \\theta = \\frac{${r}}{${L}} \\times 360^\\circ = ${Math.round((r / L) * 360)}^\\circ$。`
          };
        },
        () => {
          const ratio = 2 + Math.floor(rand() * 3);
          return {
            question: `【歷屆會考-相似三角形與面積比】${preamble}\n$\\triangle ABC$ 中，$D$、$E$ 分別在 $\\overline{AB}$、$\\overline{AC}$ 上，且 $\\overline{DE} // \\overline{BC}$。若 $\\overline{AD} : \\overline{DB} = 1 : ${ratio}$，則 $\\triangle ADE$ 面積與四邊形 $DBCE$ 面積的比為何？`,
            options: [
              `$1 : ${Math.pow(1 + ratio, 2) - 1}$`,
              `$1 : ${Math.pow(ratio, 2)}$`,
              `$1 : ${ratio}$`,
              `$1 : ${Math.pow(1 + ratio, 2)}$`
            ],
            answer: 0,
            hint: `💡 提示：邊長比為 $1 : (1 + ${ratio}) = 1 : ${1 + ratio}$，面積比為邊長平方比 $1^2 : ${1 + ratio}^2 = 1 : ${Math.pow(1 + ratio, 2)}$。四邊形面積比 $= ${Math.pow(1 + ratio, 2)} - 1$。`,
            explanation: `📖 詳解：$\\triangle ADE \\sim \\triangle ABC$。邊長比 $\\overline{AD} : \\overline{AB} = 1 : (1 + ${ratio}) = 1 : ${1 + ratio}$。面積比 $\\triangle ADE : \\triangle ABC = 1^2 : (${1 + ratio})^2 = 1 : ${Math.pow(1 + ratio, 2)}$。因此四邊形 $DBCE$ 佔面積比例為 ${Math.pow(1 + ratio, 2)} - 1 = ${Math.pow(1 + ratio, 2) - 1}$，面積比為 $1 : ${Math.pow(1 + ratio, 2) - 1}$。`
          };
        }
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 11)) % archetypes.length]();
    } else {
      // ma-past-u2: 生活情境與圖表素養
      const archetypes = [
        () => {
          const baseRate = 30 + Math.floor(rand() * 3) * 10;
          const halfRate = 15 + Math.floor(rand() * 2) * 5;
          const cap = 180 + Math.floor(rand() * 3) * 20;
          const hours = 4 + Math.floor(rand() * 3);
          const mins = 15 + Math.floor(rand() * 30);
          const totalHalfHours = Math.ceil(mins / 30) + (hours - 1) * 2;
          const uncapped = baseRate + totalHalfHours * halfRate;
          const finalCost = Math.min(uncapped, cap);
          return {
            isReading: true,
            readingText: `【歷屆會考-生活情境圖表題】\n某觀光區停車場收費標準如下：\n- 第一小時收費 ${baseRate} 元\n- 超過一小時後，每半小時收費 ${halfRate} 元 (未滿半小時以半小時計算)\n- 當日最高上限收費 ${cap} 元。`,
            question: `若遊客停放了 ${hours} 小時 ${mins} 分鐘，他總共需繳交多少停車費？`,
            options: [
              `${finalCost} 元`,
              `${uncapped > cap ? uncapped : cap + 30} 元`,
              `${finalCost - 20} 元`,
              `${baseRate + hours * halfRate * 2} 元`
            ],
            answer: 0,
            hint: `💡 提示：第一小時 ${baseRate} 元，剩餘 ${hours - 1} 小時 ${mins} 分鐘算 ${totalHalfHours} 個半小時。累計費用與上限 ${cap} 元比較取較小值。`,
            explanation: `📖 詳解：基本費 ${baseRate} 元，後續共有 ${totalHalfHours} 個半小時，計算費用為 $${baseRate} + ${totalHalfHours} \\times ${halfRate} = ${uncapped}$ 元。由於當日最高上限為 ${cap} 元，故實付 ${finalCost} 元。`
          };
        },
        () => {
          const monthlyRent = 199 + Math.floor(rand() * 2) * 100;
          const perGb = 20;
          const flatRate = 499;
          const gbBreakeven = Math.ceil((flatRate - monthlyRent) / perGb);
          return {
            question: `【歷屆會考-資費方案決策】${preamble}\n小明比較兩家電信資費：\n- 甲方案：月租費 ${monthlyRent} 元，贈送 5GB，超過後每 1GB 收費 ${perGb} 元。\n- 乙方案：吃到飽月租費 ${flatRate} 元。\n若小明每月網路使用量超過 5GB，則每月至少要使用多少 GB 時，選擇乙方案才會比甲方案更划算？`,
            options: [
              `超過 ${5 + gbBreakeven} GB`,
              `超過 ${5 + gbBreakeven - 2} GB`,
              `超過 ${5 + gbBreakeven + 3} GB`,
              `超過 10 GB`
            ],
            answer: 0,
            hint: `💡 提示：列不等式 $${monthlyRent} + ${perGb}(x - 5) > ${flatRate}$。`,
            explanation: `📖 詳解：設每月用量為 $x$ GB ($x > 5$)。甲方案費用為 $${monthlyRent} + ${perGb}(x - 5)$。令甲方案費用大於乙方案：$${monthlyRent} + ${perGb}(x - 5) > ${flatRate} \\Rightarrow ${perGb}(x - 5) > ${flatRate - monthlyRent} \\Rightarrow x - 5 > ${(flatRate - monthlyRent) / perGb}$，故用量超過 ${5 + gbBreakeven} GB 時乙方案更划算。`
          };
        },
        () => {
          const originalPrice = 1000 + Math.floor(rand() * 5) * 200;
          return {
            question: `【歷屆會考-百貨折扣最優解】${preamble}\n某專櫃推出兩種優惠方案（不可併用）：\n- 方案A：消費滿 1000 元現折 200 元。\n- 方案B：全館消費一律打八折 (80%)。\n若買一件標價 ${originalPrice} 元的外套，哪一種方案比較省錢？省下多少元？`,
            options: [
              `方案B更省錢，差額為 ${Math.abs((originalPrice - 200) - (originalPrice * 0.8))} 元`,
              `方案A更省錢，差額為 50 元`,
              `兩方案花費金額完全相同`,
              `無法確定，需看付款方式`
            ],
            answer: originalPrice * 0.8 < originalPrice - 200 ? 0 : 2,
            hint: `💡 提示：計算方案A：$${originalPrice} - 200 = ${originalPrice - 200}$ 元；方案B：$${originalPrice} \\times 0.8 = ${originalPrice * 0.8}$ 元。比較兩者差額。`,
            explanation: `📖 詳解：方案A應付 $${originalPrice} - 200 = ${originalPrice - 200}$ 元；方案B應付 $${originalPrice} \\times 0.8 = ${originalPrice * 0.8}$ 元。${originalPrice * 0.8 < originalPrice - 200 ? `方案B省下 ${(originalPrice - 200) - (originalPrice * 0.8)} 元。` : `兩者金額相等或方案A更優。`}`
          };
        }
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 11)) % archetypes.length]();
    }
  }

  // ============================================================
  // 私校入學考題 (private-school)
  // ============================================================
  if (gradeId === 'private-school') {
    if (unitId === 'ma-priv-u1') {
      const archetypes = [
        () => {
          const diff = 77;
          return {
            question: `【私校衝刺-高階數論質數方程】${preamble}\n若 $p$、$q$ 皆為質數，且滿足 $p^2 - q^2 = ${diff}$，則 $p + q$ 的值為何？`,
            options: [
              `不可能有解 (${diff} 分解後計算得 $p = 9$ 非質數)`,
              `18`,
              `11`,
              `14`
            ],
            answer: 0,
            hint: `💡 提示：$(p - q)(p + q) = ${diff} = 7 \\times 11$。$p+q=11, p-q=7 \\Rightarrow 2p = 18 \\Rightarrow p = 9$ (9 不是質數！)`,
            explanation: `📖 詳解：若 $p+q=11, p-q=7$ 解得 $p=9, q=2$，但 9 不是質數。若 $p+q=77, p-q=1$ 解得 $p=39$ (非質數)。故不可能有解。此題為考驗質數定義的資優陷阱題！`
          };
        },
        () => {
          const m = 3 + Math.floor(rand() * 3); // 3, 4, 5
          const n = 5 + Math.floor(rand() * 3); // 5, 6, 7
          let N = 100;
          while (N < 1000) {
            if (N % m === 1 && N % n === 2) break;
            N++;
          }
          if (N >= 1000) N = 106;
          return {
            question: `【私校衝刺-整數論同餘問題】${preamble}\n一正整數 $N$，被 ${m} 除餘 1，被 ${n} 除餘 2。請問滿足條件的三位數中，最小的正整數 $N$ 為多少？`,
            options: [
              `${N}`,
              `${N + m * n}`,
              `${N - m}`,
              `${N + 7}`
            ],
            answer: 0,
            hint: `💡 提示：列出滿足 $N = ${m}x + 1 = ${n}y + 2$ 的整數通式，並尋找大於等於 100 的最小值。`,
            explanation: `📖 詳解：由同餘方程組找到通解 $N \\equiv ${N % (m * n)} \\pmod{${m * n}}$，代入三位數驗證，最小正整數解為 ${N}。`
          };
        },
        () => {
          const nVal = 10 + Math.floor(rand() * 5);
          return {
            question: `【私校衝刺-高階階乘末尾零個數】${preamble}\n請問 $${nVal * 10}!$ (即 $1 \\times 2 \\times 3 \\times \\dots \\times ${nVal * 10}$) 的乘積末尾連續有多少個 0？`,
            options: [
              `${Math.floor((nVal * 10) / 5) + Math.floor((nVal * 10) / 25)} 個`,
              `${Math.floor((nVal * 10) / 5)} 個`,
              `${Math.floor((nVal * 10) / 2)} 個`,
              `${nVal * 10} 個`
            ],
            answer: 0,
            hint: `💡 提示：末尾 0 的數量由質因數分解中 5 的個數決定：$\\lfloor \\frac{N}{5} \\rfloor + \\lfloor \\frac{N}{25} \\rfloor + \\dots$`,
            explanation: `📖 詳解：因數 2 的個數遠多於 5，因此只需計算因數 5 的總次方數：$\\lfloor \\frac{${nVal * 10}}{5} \\rfloor + \\lfloor \\frac{${nVal * 10}}{25} \\rfloor = ${Math.floor((nVal * 10) / 5)} + ${Math.floor((nVal * 10) / 25)} = ${Math.floor((nVal * 10) / 5) + Math.floor((nVal * 10) / 25)}$ 個。`
          };
        }
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 11)) % archetypes.length]();
    } else {
      // ma-priv-u2: 競賽級幾何挑戰
      const archetypes = [
        () => {
          const nSides = [8, 10, 12, 16][Math.floor(rand() * 4)];
          const diameters = nSides / 2;
          const rightTriangles = diameters * (nSides - 2);
          return {
            question: `【私校競賽-多邊形對角線與直角幾何】${preamble}\n正 ${nSides} 邊形的 ${nSides} 個頂點中，任取三個頂點構成直角三角形，共有多少個？`,
            options: [
              `${rightTriangles} 個`,
              `${rightTriangles + 12} 個`,
              `${nSides * 2} 個`,
              `${rightTriangles - 10} 個`
            ],
            answer: 0,
            hint: `💡 提示：正 ${nSides} 邊形外接圓直徑有 $${nSides} \\div 2 = ${diameters}$ 條。每條直徑對應其餘 ${nSides - 2} 個頂點皆構成圓周角 $90^\\circ$ 的直角三角形。`,
            explanation: `📖 詳解：正偶數邊形外接圓直徑共有 ${diameters} 條。每一條直徑與剩餘 ${nSides - 2} 個頂點中任一個皆可連成直角三角形，故共有 $${diameters} \\times ${nSides - 2} = ${rightTriangles}$ 個。`
          };
        },
        () => {
          const a = 6, b = 8, c = 10;
          const h = (a * b) / c;
          return {
            question: `【私校競賽-直角三角形射影定理與斜邊高】${preamble}\n直角三角形兩股長為 ${a}、${b}，斜邊長為 ${c}。自直角頂點向斜邊作高，將三角形分成兩小直角三角形。請問這兩個小直角三角形的內切圓半徑之和為何？`,
            options: [
              `等於原大三角形內切圓半徑 (即 ${(a + b - c) / 2})`,
              `${(a + b - c) / 2 + 1}`,
              `${h}`,
              `無法確定`
            ],
            answer: 0,
            hint: `💡 提示：著名的直角三角形性質：斜邊高分割出的兩個小直角三角形內切圓半徑之和，恰等於原三角形的內切圓半徑！`,
            explanation: `📖 詳解：設原三角形及兩小三角形內切圓半徑分別為 $r, r_1, r_2$。因三三角形皆相似，其對應邊比等於相似比，由畢氏定理可推得 $r_1 + r_2 = r = \\frac{${a} + ${b} - ${c}}{2} = ${(a + b - c) / 2}$。`
          };
        },
        () => {
          return {
            question: `【私校競賽-海龍公式與面積極值】${preamble}\n已知三角形三邊長為 13、14、15，請問此三角形的面積與內切圓半徑分別為何？`,
            options: [
              `面積 84，內切圓半徑 4`,
              `面積 80，內切圓半徑 3`,
              `面積 91，內切圓半徑 4.5`,
              `面積 84，內切圓半徑 3.5`
            ],
            answer: 0,
            hint: `💡 提示：半周長 $s = \\frac{13+14+15}{2} = 21$。海龍公式 $\\Delta = \\sqrt{21 \\times 8 \\times 7 \\times 6} = \\sqrt{7056} = 84$。$r = \\frac{\\Delta}{s} = \\frac{84}{21} = 4$。`,
            explanation: `📖 詳解：利用海龍公式 $s = 21$，$\\Delta = \\sqrt{21(21-13)(21-14)(21-15)} = \\sqrt{21 \\times 8 \\times 7 \\times 6} = 84$。內切圓半徑 $r = \\frac{\\Delta}{s} = \\frac{84}{21} = 4$。`
          };
        }
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 11)) % archetypes.length]();
    }
  }

  // ── 圖表題 Archetype（各科通用 SVG 圖表，按 index 奇偶輪流出現）──


  // 閱讀題 Archetype（每 13 題出現一次）

  // 安全 Fallback
  return {
    question: `【${conceptTag}核心觀念】${preamble}\n關於本單元的核心數學定理，下列何者正確？`,
    options: [`符合課本定義且邏輯成立之敘述`, `混淆運算優先順序之偏誤`, `忽略負號變號規則之誤區`, `超出本單元定理規範之推論`],
    answer: 0,
    hint: `💡 提示：回歸 108 課綱定義。`,
    explanation: `📖 詳解：選項一符合單元核心數學素養定義。`
  };
}
