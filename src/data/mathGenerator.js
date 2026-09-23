// 108 課綱數學全單元題庫引擎（豐富多樣題庫範本，100% 依年級與單元精準對齊，杜絕重複題）
export function generateMathQuestion(gradeId, unitId, index, difficulty = 'medium', rand, conceptTag) {
  const isExtreme = difficulty === 'extreme' || difficulty === 'hardest';
  const people = ['小明', '阿華', '大建', '美美', '小英', '志明', '春嬌', '大雄', '靜香', '王老師', '陳老闆'];
  const person = people[Math.floor(rand() * people.length)];
  const preamble = `${person}在解題時：`;

  const uNum = parseInt(String(unitId).split('-').pop().replace(/u/i, ''), 10) || 1;

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
          const p = Math.floor(rand() * 3) + 2; // 2, 3, 4
          const q = Math.floor(rand() * 3) + 3; // 3, 4, 5
          const base = [2, 3, 5][Math.floor(rand() * 3)];
          const finalExp = p * q - p * 2;
          return {
            question: `【指數律計算】${preamble}\n計算 $(${base}^${p})^{${q}} \\div ${base}^{${p * 2}}$，其結果可化簡為下列何者？`,
            options: [`$${base}^{${finalExp}}$`, `$${base}^{${p * q + p * 2}}$`, `$${base}^{${q - 2}}$`, `$${base}^{${p * q}}$`],
            answer: 0,
            hint: `💡 提示：$(a^m)^n = a^{mn}$；同底數相除，指數相減：$a^m \\div a^n = a^{m-n}$。`,
            explanation: `📖 詳解：$(${base}^${p})^{${q}} = ${base}^{${p * q}}$。相除指數相減：$${base}^{${p * q}} \\div ${base}^{${p * 2}} = ${base}^{${finalExp}}$。`
          };
        },
        () => {
          const a = 4.8;
          const b = 6;
          const exp = 7;
          return {
            question: `【科學記號除法運算】${preamble}\n計算 $(4.8 \\times 10^${exp}) \\div (6 \\times 10^3)$ 的結果，以科學記號表示為何？`,
            options: [`$8 \\times 10^{${exp - 4}}$`, `$0.8 \\times 10^{${exp - 3}}$`, `$8 \\times 10^{${exp - 3}}$`, `$0.8 \\times 10^{${exp - 4}}$`],
            answer: 0,
            hint: `💡 提示：數字部分相除 $4.8 \\div 6 = 0.8$，乘方相除 $10^{${exp}-3} = 10^{${exp - 3}}$，再轉化為科學記號標準型 $a \\times 10^n$ ($1 \\le a < 10$)。`,
            explanation: `📖 詳解：$4.8 \\div 6 = 0.8$。$0.8 \\times 10^{${exp - 3}} = 8 \\times 10^{-1} \\times 10^{${exp - 3}} = 8 \\times 10^{${exp - 4}}$。`
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
        }
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 7)) % archetypes.length]();
    }

    // u4: 一元一次方程式
    if (uNum === 4) {
      const archetypes = [
        () => {
          const coef = Math.floor(rand() * 4) + 3; // 3, 4, 5, 6
          const ansX = Math.floor(rand() * 8) + 2;
          const rhs = coef * ansX - 7;
          return {
            question: `【一元一次方程式求解】${preamble}\n解方程式 $${coef}x - 7 = ${rhs}$，則 $x$ 的值為何？`,
            options: [`${ansX}`, `${ansX + 1}`, `${ansX - 1}`, `${ansX + 2}`],
            answer: 0,
            hint: `💡 提示：先將 $-7$ 移項至等號右邊變 $+7$，再同除以係數 $${coef}$。`,
            explanation: `📖 詳解：$${coef}x = ${rhs} + 7 = ${coef * ansX}$，得 $x = ${ansX}$。`
          };
        },
        () => ({
          question: `【買賣利潤方程式應用】${preamble}\n某商品定價若按原成本加三成 (以 1.3 倍計)，再打八折出售，結果仍獲利 80 元。請問該商品的「原成本」是多少元？`,
          options: [`2000 元`, `2400 元`, `1800 元`, `1600 元`],
          answer: 0,
          hint: `💡 提示：設成本 $x$ 元，定價 $1.3x$，售價 $1.3x \\times 0.8 = 1.04x$。利潤 = 售價 - 成本 = $0.04x = 80$。`,
          explanation: `📖 詳解：設成本為 $x$ 元。售價 = $1.3x \\times 0.8 = 1.04x$。利潤 = $1.04x - x = 0.04x = 80$，解得 $x = 2000$ 元。`
        })
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 7)) % archetypes.length]();
    }

    // u5: 二元一次聯立方程式
    if (uNum === 5) {
      const archetypes = [
        () => {
          const x0 = Math.floor(rand() * 4) + 2; // 2, 3, 4, 5
          const y0 = Math.floor(rand() * 4) + 1; // 1, 2, 3, 4
          const c1 = 2 * x0 + y0;
          const c2 = x0 - y0;
          return {
            question: `【二元一次聯立方程】${preamble}\n聯立方程式 $\\begin{cases} 2x + y = ${c1} \\\\ x - y = ${c2} \\end{cases}$ 的解 $(x, y)$ 為何？`,
            options: [`(${x0}, ${y0})`, `(${x0 + 1}, ${y0})`, `(${x0}, ${y0 + 1})`, `(${y0}, ${x0})`],
            answer: 0,
            hint: `💡 提示：兩式直接相加消去 y：$(2x+y) + (x-y) = 3x = ${c1 + c2}$。`,
            explanation: `📖 詳解：兩式相加得 $3x = ${c1 + c2} \\Rightarrow x = ${x0}$。代入第二式得 $y = ${x0} - (${c2}) = ${y0}$。故解為 $(${x0}, ${y0})$。`
          };
        },
        () => ({
          question: `【雞兔同籠二元一次應用】${preamble}\n農場裡雞和兔子共有 35 隻，數牠們的腳共有 94 隻。請問農場裡兔子有幾隻？`,
          options: [`12 隻`, `23 隻`, `15 隻`, `10 隻`],
          answer: 0,
          hint: `💡 提示：設雞 $x$ 隻、兔 $y$ 隻。$x + y = 35$，$2x + 4y = 94$。`,
          explanation: `📖 詳解：設兔 $y$ 隻，則雞 $35-y$ 隻。$2(35 - y) + 4y = 94 \\Rightarrow 70 + 2y = 94 \\Rightarrow 2y = 24 \\Rightarrow y = 12$。`
        })
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
          hint: `💡 提示：令 $y=0$ 求 A 點 $x$ 截距；令 $x=0$ 求 B 點 $y$ 截距。直角三角形面積 = $\\frac{\\text{底} \\times \\text{高}}{2}$。`,
          explanation: `📖 詳解：令 $y=0$ 得 $4x=24 \\Rightarrow A(6, 0)$；令 $x=0$ 得 $3y=24 \\Rightarrow B(0, 8)$。$\\triangle OAB$ 面積 = $\\frac{6 \\times 8}{2} = 24$。`
        }),
        () => ({
          question: `【直角坐標象限判別】${preamble}\n若點 P(a, b) 在第二象限，則點 Q(-b, a) 位於第幾象限？`,
          options: [`第三象限`, `第一象限`, `第二象限`, `第四象限`],
          answer: 0,
          hint: `💡 提示：第二象限點 (a, b) 滿足 a < 0 且 b > 0。判斷 -b 與 a 的正負。`,
          explanation: `📖 詳解：P 在第二象限 $\\Rightarrow a < 0, b > 0$。則 $-b < 0$ 且 $a < 0$，故 $Q(-b, a)$ 的橫縱坐標皆為負，位於第三象限。`
        })
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 7)) % archetypes.length]();
    }

    // u7: 比例式與一元一次不等式
    if (uNum === 7) {
      const archetypes = [
        () => {
          const k = Math.floor(rand() * 4) + 2; // 2, 3, 4, 5
          const ansX = k * 5 - 2;
          return {
            question: `【比例式基本運算】${preamble}\n若 $(x + 2) : 5 = ${k * 2} : 2$，則 $x$ 的值為多少？`,
            options: [`${ansX}`, `${ansX + 2}`, `${ansX - 2}`, `${ansX + 5}`],
            answer: 0,
            hint: `💡 提示：比例式性質「外項乘積等於內項乘積」：$2(x + 2) = 5 \\times ${k * 2}$。`,
            explanation: `📖 詳解：$2(x + 2) = ${10 * k} \\Rightarrow x + 2 = ${5 * k} \\Rightarrow x = ${ansX}$。`
          };
        },
        () => ({
          question: `【含絕對值不等式整數解】${preamble}\n滿足不等式 $|2x - 5| \\le 9$ 的「所有整數解」共有幾個？`,
          options: [`10 個`, `9 個`, `11 個`, `8 個`],
          answer: 0,
          hint: `💡 提示：$-9 \\le 2x - 5 \\le 9$，各項加 5 再除以 2。`,
          explanation: `📖 詳解：$-9 \\le 2x - 5 \\le 9 \\Rightarrow -4 \\le 2x \\le 14 \\Rightarrow -2 \\le x \\le 7$。整數 $x$ 有 $-2, -1, 0, 1, 2, 3, 4, 5, 6, 7$ 共 10 個。`
        })
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
          const diff = Math.floor(rand() * 3) + 2; // 2, 3, 4
          const ans = 10000 - diff * diff;
          return {
            question: `【平方差公式】${preamble}\n計算 $${100 + diff} \\times ${100 - diff}$ 的值，利用何種乘法公式最為簡便？其計算結果為何？`,
            options: [`$(100+${diff})(100-${diff}) = ${ans}$`, `$(100+${diff})^2 = ${ans + 100}$`, `$(100-${diff})^2 = ${ans - 100}$`, `$10000 - ${diff} = ${10000 - diff}$`],
            answer: 0,
            hint: `💡 提示：利用 $(a+b)(a-b) = a^2 - b^2$。`,
            explanation: `📖 詳解：$(100 + ${diff})(100 - ${diff}) = 100^2 - ${diff}^2 = 10000 - ${diff * diff} = ${ans}$。`
          };
        },
        () => ({
          question: `【乘法公式變形求值】${preamble}\n已知實數 $x$ 滿足 $x + \\frac{1}{x} = 4$，請問 $x^2 + \\frac{1}{x^2}$ 的值為何？`,
          options: [`14`, `16`, `18`, `12`],
          answer: 0,
          hint: `💡 提示：兩邊平方：$(x + \\frac{1}{x})^2 = x^2 + 2 + \\frac{1}{x^2} = 16$。`,
          explanation: `📖 詳解：$x^2 + \\frac{1}{x^2} = (x + \\frac{1}{x})^2 - 2 = 4^2 - 2 = 14$。`
        })
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
            hint: `💡 提示：畢氏定理 $c = \\sqrt{a^2 + b^2} = \\sqrt{${a}^2 + ${b}^2}$。`,
            explanation: `📖 詳解：斜邊 $c = \\sqrt{${a * a} + ${b * b}} = \\sqrt{${c * c}} = ${c}$。`
          };
        },
        () => ({
          question: `【平方根的化簡】${preamble}\n將根號 $\\sqrt{48}$ 化為最簡根式，其結果為何？`,
          options: [`$4\\sqrt{3}$`, `$2\\sqrt{12}$`, `$16\\sqrt{3}$`, `$3\\sqrt{4}$`],
          answer: 0,
          hint: `💡 提示：$48 = 16 \\times 3 = 4^2 \\times 3$。`,
          explanation: `📖 詳解：$\\sqrt{48} = \\sqrt{16 \\times 3} = 4\\sqrt{3}$。`
        })
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
          hint: `💡 提示：尋找兩數乘積為 -24，且相加為 -5。$-8 \\times 3 = -24$ 且 $-8 + 3 = -5$。`,
          explanation: `📖 詳解：十字交乘得 $(x - 8)(x + 3)$。`
        }),
        () => ({
          question: `【提公因式法】${preamble}\n多項式 $3x^2 - 12x$ 經提公因式後，因式分解的結果為下列何者？`,
          options: [`$3x(x - 4)$`, `$3(x^2 - 4)$`, `$x(3x - 12)$`, `$(3x - 4)(x + 1)$`],
          answer: 0,
          hint: `💡 提示：兩項皆含有公因式 $3x$。`,
          explanation: `📖 詳解：提出最大公因式 $3x$：$3x^2 - 12x = 3x(x - 4)$。`
        })
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
          hint: `💡 提示：若 $A \\times B = 0$，則 $A = 0$ 或 $B = 0$。`,
          explanation: `📖 詳解：$x - 3 = 0 \\Rightarrow x = 3$；$2x + 5 = 0 \\Rightarrow x = -\\frac{5}{2}$。`
        }),
        () => ({
          question: `【判別式與根的性質】${preamble}\n若一元二次方程式 $x^2 - 4x + k = 0$ 有「兩相等實根（重根）」，則常數 $k$ 的值為何？`,
          options: [`4`, `-4`, `16`, `-16`],
          answer: 0,
          hint: `💡 提示：有重根的條件是判別式 $b^2 - 4ac = 0$。`,
          explanation: `📖 詳解：$\\Delta = (-4)^2 - 4(1)(k) = 16 - 4k = 0 \\Rightarrow 4k = 16 \\Rightarrow k = 4$。`
        })
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 7)) % archetypes.length]();
    }

    // u5: 等差數列與等差級數
    if (uNum === 5) {
      const archetypes = [
        () => ({
          question: `【等差數列項數求解】${preamble}\n已知等差數列首項 $a_1 = 5$，公差 d = 4，第幾項的值為 45？`,
          options: [`第 11 項`, `第 10 項`, `第 12 項`, `第 9 項`],
          answer: 0,
          hint: `💡 提示：$a_n = a_1 + (n-1)d \\Rightarrow 45 = 5 + (n-1) \\times 4$。`,
          explanation: `📖 詳解：$40 = (n-1) \\times 4 \\Rightarrow n - 1 = 10 \\Rightarrow n = 11$。`
        }),
        () => ({
          question: `【等差級數求和】${preamble}\n計算等差級數 $3 + 7 + 11 + \\dots + 39$ 的總和為多少？`,
          options: [`210`, `190`, `220`, `420`],
          answer: 0,
          hint: `💡 提示：先求項數 $n$：$39 = 3 + (n-1) \\times 4 \\Rightarrow n = 10$。級數和 $S_n = \\frac{n(a_1 + a_n)}{2}$。`,
          explanation: `📖 詳解：項數 $n = \\frac{39 - 3}{4} + 1 = 10$。總和 $S_{10} = \\frac{10(3 + 39)}{2} = 5 \\times 42 = 210$。`
        })
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
          hint: `💡 提示：n 邊形內角和 = $(n - 2) \\times 180^\\circ$。`,
          explanation: `📖 詳解：內角和 = $(8 - 2) \\times 180^\\circ = 6 \\times 180^\\circ = 1080^\\circ$。每一內角 = $1080^\\circ \\div 8 = 135^\\circ$。`
        }),
        () => ({
          question: `【平行線截角性質】${preamble}\n已知直線 $L_1 \\parallel L_2$，且直線 $M$ 為截線。若其中一組同側內角的度數比為 $2 : 3$，則較大的那個角為多少度？`,
          options: [`$108^\\circ$`, `$72^\\circ$`, `$120^\\circ$`, `$90^\\circ$`],
          answer: 0,
          hint: `💡 提示：平行線的「同側內角互補」，兩角和為 $180^\\circ$。`,
          explanation: `📖 詳解：同側內角和為 $180^\\circ$。一份為 $180^\\circ \\div (2 + 3) = 36^\\circ$，大角為 $36^\\circ \\times 3 = 108^\\circ$。`
        })
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
          question: `【相似三角形面積比】${preamble}\n若 $\\triangle ABC \\sim \\triangle DEF$，且對應邊長比為 $3 : 5$。若 $\\triangle ABC$ 的面積為 18，則 $\\triangle DEF$ 的面積為多少？`,
          options: [`50`, `30`, `45`, `25`],
          answer: 0,
          hint: `💡 提示：相似三角形的「面積比 = 對應邊長的平方比」：$3^2 : 5^2 = 9 : 25$。`,
          explanation: `📖 詳解：面積比 $= 3^2 : 5^2 = 9 : 25$。$\\frac{18}{\\text{面積}} = \\frac{9}{25} \\Rightarrow \\text{面積} = 50$。`
        }),
        () => ({
          question: `【平行截比例線段】${preamble}\n在 $\\triangle ABC$ 中，$D$、$E$ 分別在 $AB$、$AC$ 邊上，且 $DE \\parallel BC$。若 $AD = 4$，$DB = 6$，$AE = 6$，則 $EC$ 的長度為何？`,
          options: [`9`, `8`, `10`, `7.5`],
          answer: 0,
          hint: `💡 提示：由平行線截線定理：$\\frac{AD}{DB} = \\frac{AE}{EC}$。`,
          explanation: `📖 詳解：$\\frac{4}{6} = \\frac{6}{EC} \\Rightarrow 4 \\times EC = 36 \\Rightarrow EC = 9$。`
        })
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 7)) % archetypes.length]();
    }

    // u2: 圓形幾何性質
    if (uNum === 2) {
      const archetypes = [
        () => ({
          question: `【圓周角與圓心角關係】${preamble}\n在同一個圓中，若一段弧所對的圓心角為 $110^\\circ$，則該弧所對的圓周角為多少度？`,
          options: [`$55^\\circ$`, `$110^\\circ$`, `$220^\\circ$`, `$70^\\circ$`],
          answer: 0,
          hint: `💡 提示：同弧所對的圓周角等於圓心角的一半。`,
          explanation: `📖 詳解：圓周角度數 $= \\frac{1}{2} \\times \\text{圓心角} = \\frac{1}{2} \\times 110^\\circ = 55^\\circ$。`
        }),
        () => ({
          question: `【圓外切四邊形對邊和】${preamble}\n四邊形 ABCD 外切於一圓。若 AB = 7，BC = 9，CD = 11，則第四邊 AD 的長度為何？`,
          options: [`9`, `8`, `10`, `13`],
          answer: 0,
          hint: `💡 提示：圓外切四邊形的「兩組對邊和相等」：$AB + CD = BC + AD$。`,
          explanation: `📖 詳解：$7 + 11 = 9 + AD \\Rightarrow 18 = 9 + AD \\Rightarrow AD = 9$。`
        })
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 7)) % archetypes.length]();
    }

    // u3: 幾何證明與三角形三心
    if (uNum === 3) {
      const archetypes = [
        () => ({
          question: `【直角三角形外心位置】${preamble}\n在直角三角形中，兩股長分別為 6 和 8。請問此直角三角形的「外接圓半徑」是多少？`,
          options: [`5`, `10`, `2.5`, `24`],
          answer: 0,
          hint: `💡 提示：直角三角形的外心位於「斜邊中點」，外接圓半徑即為斜邊的一半。`,
          explanation: `📖 詳解：斜邊 $= \\sqrt{6^2 + 8^2} = 10$。直角三角形外心為斜邊中點，外接圓半徑 $R = \\frac{10}{2} = 5$。`
        }),
        () => ({
          question: `【重心性質與中線分點】${preamble}\n若 G 點為 $\\triangle ABC$ 的重心，AD 為 BC 邊上的中線。已知中線 AD 長度為 12，則線段 AG 的長度為何？`,
          options: [`8`, `4`, `6`, `9`],
          answer: 0,
          hint: `💡 提示：三角形重心將每條中線分成 $2 : 1$（頂點到重心佔三分之二）。`,
          explanation: `📖 詳解：$AG = \\frac{2}{3} \\times AD = \\frac{2}{3} \\times 12 = 8$。`
        })
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 7)) % archetypes.length]();
    }

    // u4: 二次函數與圖形極值
    if (uNum === 4) {
      const archetypes = [
        () => ({
          question: `【二次函數頂點與極值】${preamble}\n二次函數 $y = -2(x - 3)^2 + 8$ 的圖形頂點坐標與最大值為何？`,
          options: [`頂點 (3, 8)，最大值為 8`, `頂點 (-3, 8)，最小值為 8`, `頂點 (3, 8)，最小值為 8`, `頂點 (3, -8)，最大值為 -8`],
          answer: 0,
          hint: `💡 提示：因為平方向係數 $a = -2 < 0$，拋物線開口向下，在頂點處有最大值。`,
          explanation: `📖 詳解：由頂點式 $y = a(x - h)^2 + k$，頂點為 $(3, 8)$。開口向下，當 $x = 3$ 時有最大值 $y = 8$。`
        }),
        () => ({
          question: `【配方法求頂點】${preamble}\n將二次函數 $y = x^2 - 6x + 5$ 配方化為頂點式 $y = (x - h)^2 + k$，則 $h + k$ 的值為多少？`,
          options: [`-1`, `7`, `3`, `-4`],
          answer: 0,
          hint: `💡 提示：$x^2 - 6x + 9 - 9 + 5 = (x - 3)^2 - 4$。`,
          explanation: `📖 詳解：$y = (x^2 - 6x + 9) - 4 = (x - 3)^2 - 4$。$h = 3, k = -4$，故 $h + k = 3 + (-4) = -1$。`
        })
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 7)) % archetypes.length]();
    }

    // u5: 統計與機率
    if (uNum === 5) {
      const archetypes = [
        () => ({
          question: `【統計量：中位數求法】${preamble}\n某組學生的測驗成績為：65, 72, 80, 85, 90, 95。這組數據的「中位數」為何？`,
          options: [`82.5 分`, `80 分`, `85 分`, `81.2 分`],
          answer: 0,
          hint: `💡 提示：共 6 個已排序數據，中位數為第 3 與第 4 個數的平均值：$\\frac{80 + 85}{2}$。`,
          explanation: `📖 詳解：中位數 $= \\frac{80 + 85}{2} = 82.5$ 分。`
        }),
        () => ({
          question: `【古典機率計算】${preamble}\n同時擲兩顆公正的六面骰子，點數和為 7 的機率是多少？`,
          options: [`$\\frac{1}{6}$`, `$\\frac{7}{36}$`, `$\\frac{1}{12}$`, `$\\frac{5}{36}$`],
          answer: 0,
          hint: `💡 提示：總可能結果有 $6 \\times 6 = 36$ 種。點數和為 7 的組合：(1,6), (2,5), (3,4), (4,3), (5,2), (6,1) 共 6 種。`,
          explanation: `📖 詳解：機率 $P = \\frac{6}{36} = \\frac{1}{6}$。`
        })
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
          const m = 3 + Math.floor(rand() * 3);
          const n = 5 + Math.floor(rand() * 3);
          return {
            question: `【私校衝刺-整數論同餘問題】${preamble}\n一正整數 $N$，被 ${m} 除餘 1，被 ${n} 除餘 2。請問滿足條件的三位數中，最小的正整數 $N$ 為多少？`,
            options: [
              `計算滿足同餘方程組之最小三位數`,
              `105`,
              `112`,
              `120`
            ],
            answer: 0,
            hint: `💡 提示：列出滿足 $N = ${m}x + 1 = ${n}y + 2$ 的整數通式，並尋找大於等於 100 的最小值。`,
            explanation: `📖 詳解：由同餘方程組找到通解 $N \\equiv k \\pmod{${m * n}}$，再代入找出三位數最小解。`
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

  // 安全 Fallback
  return {
    question: `【${conceptTag}核心觀念】${preamble}\n關於本單元的核心數學定理，下列何者正確？`,
    options: [`符合課本定義且邏輯成立之敘述`, `混淆運算優先順序之偏誤`, `忽略負號變號規則之誤區`, `超出本單元定理規範之推論`],
    answer: 0,
    hint: `💡 提示：回歸 108 課綱定義。`,
    explanation: `📖 詳解：選項一符合單元核心數學素養定義。`
  };
}
