// 108 課綱國中數學高難度/壓軸進階挑戰題庫 (Extreme & Hard Archetypes)
// 100% 嚴格遵守教育部 108 課綱國中學習內容指引：
// 1. 嚴禁超綱：嚴格杜絕高中立方公式 (a³±b³、(a±b)³)、雙十字交乘、高階三項和等 108 課綱以前之高中內容。
// 2. 單元嚴密對齊：各年級單元 (g7 u1-u7, g8 u1-u6, g9 u1-u5) 100% 精準匹配，杜絕跨單元錯置！

export function getHardMathQuestion(gradeId, unitId, index, rand, preamble) {
  const uNum = parseInt(String(unitId).split('-').pop().replace(/u/i, ''), 10) || 1;

  // =========================================================================
  // 七年級 (國一)
  // =========================================================================
  if (gradeId === 'g7') {
    // u1: 負數、數線與整數運算
    if (uNum === 1) {
      const archetypes = [
        () => {
          const a = Math.floor(rand() * 40) + 110;
          const b = Math.floor(rand() * 25) + 35;
          const c = Math.floor(rand() * 20) + 15;
          const ans = (a * b) - (b * c);
          return {
            question: `【高階整數運算與分配律】${preamble}\n利用分配律計算：$${a} \\times ${b} - ${b} \\times ${c}$ 的值為何？`,
            options: [`${ans}`, `${ans + b}`, `${ans - b}`, `${(a + c) * b}`],
            answer: 0,
            hint: `💡 提示：提取共同乘數 $${b}$：$${b} \\times (${a} - ${c})$。`,
            explanation: `📖 詳解：原式 $= ${b} \\times (${a} - ${c}) = ${b} \\times ${a - c} = ${ans}$。`
          };
        },
        () => {
          const n = Math.floor(rand() * 6) + 3; // 3..8
          const totalPoints = 2 * n + 1;
          return {
            question: `【數線與絕對值不等式】${preamble}\n數線上，滿足 $|x - 4| \\le ${n}$ 的所有整數 $x$ 共有多少個？`,
            options: [`${totalPoints} 個`, `${totalPoints - 1} 個`, `${totalPoints + 1} 個`, `${n * 2} 個`],
            answer: 0,
            hint: `💡 提示：距離 4 不超過 ${n} 的點，範圍為 $4 - ${n} \\le x \\le 4 + ${n}$。`,
            explanation: `📖 詳解：$|x - 4| \\le ${n} \\Rightarrow ${4 - n} \\le x \\le ${4 + n}$。包含端點的整數個數為 $(${4 + n}) - (${4 - n}) + 1 = 2 \\times ${n} + 1 = ${totalPoints}$ 個。`
          };
        }
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 11)) % archetypes.length]();
    }

    // u2: 指數律與科學記號 (嚴格杜絕等差數列與二元一次！)
    if (uNum === 2) {
      const archetypes = [
        () => {
          // 指數大小比較：利用同指數化簡
          return {
            question: `【指數律：高次方大小比較】${preamble}\n若 $A = 2^{60}$，$B = 3^{40}$，$C = 5^{20}$，請比較 $A, B, C$ 三數的大小關係：`,
            options: [`B > A > C`, `A > B > C`, `C > B > A`, `B > C > A`],
            answer: 0,
            hint: `💡 提示：將指數化為最大公因數 20：$A = (2^3)^{20} = 8^{20}$，$B = (3^2)^{20} = 9^{20}$，$C = 5^{20}$。`,
            explanation: `📖 詳解：因為 $60, 40, 20$ 的最大公因數為 $20$，所以：\n$A = (2^3)^{20} = 8^{20}$\n$B = (3^2)^{20} = 9^{20}$\n$C = 5^{20}$\n底數 $9 > 8 > 5$，因此 $B > A > C$。`
          };
        },
        () => {
          const p = Math.floor(rand() * 3) + 2;
          const q = Math.floor(rand() * 3) + 4;
          const base = [2, 3, 5][Math.floor(rand() * 3)];
          const finalExp = p * q - (p * 2 + 1);
          return {
            question: `【同底數指數律進階化簡】${preamble}\n化簡 $\\frac{(${base}^${p})^${q}}{${base}^{${p * 2}} \\times ${base}}$，其結果為下列何者？`,
            options: [`$${base}^{${finalExp}}$`, `$${base}^{${finalExp + 2}}$`, `$${base}^{${p * q}}$`, `1`],
            answer: 0,
            hint: `💡 提示：次方的次方相乘，同底數相乘指數相加、相除指數相減。`,
            explanation: `📖 詳解：分子為 $${base}^{${p * q}}$；分母為 $${base}^{${p * 2} + 1} = ${base}^{${p * 2 + 1}}$。相除得 $${base}^{${p * q} - (${p * 2 + 1})} = ${base}^{${finalExp}}$。`
          };
        },
        () => {
          const exp = Math.floor(rand() * 3) + 6;
          return {
            question: `【科學記號高階運算】${preamble}\n計算 $(3.2 \\times 10^${exp}) \\div (8 \\times 10^3)$，以標準科學記號表示之結果為何？`,
            options: [
              `$4 \\times 10^{${exp - 4}}$`,
              `$0.4 \\times 10^{${exp - 3}}$`,
              `$4 \\times 10^{${exp - 3}}$`,
              `$4 \\times 10^{${exp - 5}}$`
            ],
            answer: 0,
            hint: `💡 提示：$3.2 \\div 8 = 0.4 = 4 \\times 10^{-1}$。`,
            explanation: `📖 詳解：$\\frac{3.2 \\times 10^${exp}}{8 \\times 10^3} = (3.2 \\div 8) \\times 10^{${exp} - 3} = 0.4 \\times 10^{${exp - 3}} = 4 \\times 10^{${exp - 4}}$。`
          };
        }
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 11)) % archetypes.length]();
    }

    // u3: 因數、倍數與分數運算
    if (uNum === 3) {
      const archetypes = [
        () => {
          const p = 12;
          const q = 18;
          const gcd = 6;
          const lcm = 36;
          return {
            question: `【最大公因數與最小公倍數性質】${preamble}\n已知兩正整數 $A$ 與 $B$，若 $\\gcd(A, B) = ${gcd}$，$\\text{lcm}(A, B) = ${lcm}$，且 $A = ${p}$，求 $B$ 的值為何？`,
            options: [`${q}`, `${lcm}`, `${gcd}`, `${p + q}`],
            answer: 0,
            hint: `💡 提示：重要性質：兩數乘積等於其最大公因數與最小公倍數乘積，即 $A \\times B = \\gcd(A,B) \\times \\text{lcm}(A,B)$。`,
            explanation: `📖 詳解：$A \\times B = \\gcd(A, B) \\times \\text{lcm}(A, B) \\Rightarrow ${p} \\times B = ${gcd} \\times ${lcm} = ${gcd * lcm} \\Rightarrow B = ${gcd * lcm} \\div ${p} = ${q}$。`
          };
        }
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 7)) % archetypes.length]();
    }

    // u4: 一元一次方程式
    if (uNum === 4) {
      const archetypes = [
        () => {
          const discount = 8; // 8折
          const profit = 120;
          const cost = 600;
          const tagPrice = (cost + profit) / 0.8;
          return {
            question: `【一元一次方程式：利潤折扣問題】${preamble}\n某商品定價打八折出售，仍可獲利 ${profit} 元。已知該商品成本為 ${cost} 元，若設商品定價為 $x$ 元，則定價 $x$ 為多少元？`,
            options: [`${tagPrice} 元`, `${tagPrice + 50} 元`, `${tagPrice - 50} 元`, `${cost + profit} 元`],
            answer: 0,
            hint: `💡 提示：售價 - 成本 = 利潤 $\\Rightarrow 0.8x - ${cost} = ${profit}$。`,
            explanation: `📖 詳解：依題意列式：$0.8x - ${cost} = ${profit} \\Rightarrow 0.8x = ${cost + profit} \\Rightarrow x = ${tagPrice}$ 元。`
          };
        }
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 7)) % archetypes.length]();
    }

    // u5: 二元一次聯立方程式
    if (uNum === 5) {
      const archetypes = [
        () => {
          const a = 17, b = 13, sum = 60, diff = 8;
          const x = (sum + diff) / 2; // 34
          const y = (sum - diff) / 2; // 26
          return {
            question: `【二元一次聯立方程式：對稱係數巧解】${preamble}\n解聯立方程式：\n$\\begin{cases} ${a}x + ${b}y = ${a * x + b * y} \\\\ ${b}x + ${a}y = ${b * x + a * y} \\end{cases}$\n求 $x + y$ 的值為何？`,
            options: [`${x + y}`, `${x - y}`, `${x}`, `${y}`],
            answer: 0,
            hint: `💡 提示：將兩式相加，即可直接提取出 $(x+y)$ 的係數！`,
            explanation: `📖 詳解：兩式直接相加：$(${a}+${b})x + (${a}+${b})y = ${a * x + b * y + b * x + a * y} \\Rightarrow ${a + b}(x+y) = ${(a + b) * (x + y)} \\Rightarrow x+y = ${x + y}$。`
          };
        }
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 7)) % archetypes.length]();
    }

    // u6: 直角坐標與二元一次方程式圖形
    if (uNum === 6) {
      const archetypes = [
        () => {
          const a = 4, b = 3;
          const area = (a * b) / 2;
          return {
            question: `【直線方程式與坐標軸圍成面積】${preamble}\n直線方程式 $3x + 4y = 12$ 與 $x$ 軸交於點 $A$，與 $y$ 軸交於點 $B$，$O$ 為原點。請問 $\\triangle AOB$ 的面積為何？`,
            options: [`${area}`, `${area * 2}`, `${a + b}`, `12`],
            answer: 0,
            hint: `💡 提示：令 $y=0$ 求 $x$ 截距；令 $x=0$ 求 $y$ 截距。面積 $= \\frac{1}{2} \\times |x_0| \\times |y_0|$。`,
            explanation: `📖 詳解：\n令 $y = 0 \\Rightarrow 3x = 12 \\Rightarrow x = 4$，點 $A(4, 0)$，底長 $= 4$。\n令 $x = 0 \\Rightarrow 4y = 12 \\Rightarrow y = 3$，點 $B(0, 3)$，高 $= 3$。\n$\\triangle AOB$ 面積 $= \\frac{1}{2} \\times 4 \\times 3 = ${area}$。`
          };
        }
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 7)) % archetypes.length]();
    }

    // u7: 比例式與一元一次不等式
    if (uNum === 7) {
      const archetypes = [
        () => {
          return {
            question: `【一元一次不等式：負數乘除變號原則】${preamble}\n解不等式 $5 - 2x \\ge 13$，請問 $x$ 的最大整數解為何？`,
            options: [`-4`, `-3`, `-5`, `4`],
            answer: 0,
            hint: `💡 提示：移項得 $-2x \\ge 8$。兩邊同除以負數時，不等號必須轉向！`,
            explanation: `📖 詳解：$5 - 2x \\ge 13 \\Rightarrow -2x \\ge 8$。兩邊同除以 $-2$，不等號方向改變得 $x \\le -4$。因此 $x$ 的最大整數解為 $-4$。`
          };
        }
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 7)) % archetypes.length]();
    }
  }

  // =========================================================================
  // 八年級 (國二)
  // =========================================================================
  if (gradeId === 'g8') {
    // u1: 乘法公式與多項式運算 (108課綱標準：完全平方和/差、平方差、分配律、幾何面積拼圖！杜絕高中立方公式！)
    if (uNum === 1) {
      const archetypes = [
        () => {
          // 108會考超高頻：和平方與差平方連動求值 (a-b)² = (a+b)² - 4ab
          const aPlusB = 8;
          const ab = 12;
          const aMinusBSq = aPlusB * aPlusB - 4 * ab; // 64 - 48 = 16
          return {
            question: `【乘法公式連動求值】${preamble}\n已知兩數滿足 $a + b = ${aPlusB}$ 且 $a \\times b = ${ab}$。請利用乘法公式求 $(a - b)^2$ 的值為何？`,
            options: [`${aMinusBSq}`, `${aMinusBSq + 8}`, `${aPlusB * aPlusB}`, `${ab * 2}`],
            answer: 0,
            hint: `💡 提示：利用乘法公式恆等式：$(a - b)^2 = (a + b)^2 - 4ab$。`,
            explanation: `📖 詳解：\n展開 $(a+b)^2 = a^2 + 2ab + b^2 = ${aPlusB * aPlusB}$\n展開 $(a-b)^2 = a^2 - 2ab + b^2$\n兩式相減可得：$(a-b)^2 = (a+b)^2 - 4ab = ${aPlusB}^2 - 4(${ab}) = ${aPlusB * aPlusB} - ${4 * ab} = ${aMinusBSq}$。`
          };
        },
        () => {
          // 倒數對稱型平方和
          const x = Math.floor(rand() * 4) + 3; // 3..6
          const ans = x * x + 2;
          return {
            question: `【乘法公式倒數對稱求值】${preamble}\n已知實數 $x$ 滿足 $x - \\frac{1}{x} = ${x}$，則 $x^2 + \\frac{1}{x^2}$ 的值為何？`,
            options: [`${ans}`, `${ans - 4}`, `${x * x}`, `${ans + 2}`],
            answer: 0,
            hint: `💡 提示：將等式兩邊同時平方：$(x - \\frac{1}{x})^2 = x^2 - 2 + \\frac{1}{x^2}$。`,
            explanation: `📖 詳解：\n等式兩邊平方得：$(x - \\frac{1}{x})^2 = ${x}^2 = ${x * x}$\n展開左式：$x^2 - 2 \\times x \\times \\frac{1}{x} + \\frac{1}{x^2} = ${x * x} \\Rightarrow x^2 - 2 + \\frac{1}{x^2} = ${x * x}$\n移項得：$x^2 + \\frac{1}{x^2} = ${x * x} + 2 = ${ans}$。`
          };
        },
        () => {
          // 完全平方式未知常數判定 (108會考熱門題型)
          const p = [2, 3, 5][Math.floor(rand() * 3)];
          const q = [3, 4, 7][Math.floor(rand() * 3)];
          const middle = 2 * p * q;
          return {
            question: `【完全平方式條件判斷】${preamble}\n若多項式 $${p * p}x^2 + kx + ${q * q}$ 為一個完全平方式，請問常數 $k$ 的可能值為何？`,
            options: [`$\\pm ${middle}$`, `${middle}`, `$-${middle}$`, `$\\pm ${p * q}$`],
            answer: 0,
            hint: `💡 提示：$(px \\pm q)^2 = ${p*p}x^2 \\pm 2(p)(q)x + ${q*q}$，注意完全平方式中間項有正負兩種可能！`,
            explanation: `📖 詳解：\n完全平方式型式為 $(A \\pm B)^2 = A^2 \\pm 2AB + B^2$。\n此處 $A = ${p}x$，$B = ${q}$。\n中間項 $kx = \\pm 2 \\times (${p}x) \\times (${q}) = \\pm ${middle}x$，故 $k = \\pm ${middle}$。`
          };
        },
        () => {
          // 乘法公式速算與分數化簡
          const n = 2025;
          return {
            question: `【平方差公式速算巧解】${preamble}\n計算 $\\frac{${n}^2 - 1}{${n + 1}}$ 的值為何？`,
            options: [`${n - 1}`, `${n}`, `${n + 1}`, `1`],
            answer: 0,
            hint: `💡 提示：分子 $${n}^2 - 1 = ${n}^2 - 1^2$，利用平方差公式 $(a+b)(a-b)$ 展開約分！`,
            explanation: `📖 詳解：\n分子利用平方差公式：$${n}^2 - 1^2 = (${n} + 1)(${n} - 1)$。\n原式 $= \\frac{(${n} + 1)(${n} - 1)}{${n + 1}} = ${n} - 1 = ${n - 1}$。`
          };
        }
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 11)) % archetypes.length]();
    }

    // u2: 平方根、近似值與畢氏定理
    if (uNum === 2) {
      const archetypes = [
        () => {
          return {
            question: `【長方體空間畢氏定理】${preamble}\n一個長方體紙箱的長、寬、高分別為 $3$ 公分、$4$ 公分、$12$ 公分。請問此長方體內部兩頂點之間的最大直線距離（內部體對角線長）為多少公分？`,
            options: [`13 公分`, `12 公分`, `15 公分`, `19 公分`],
            answer: 0,
            hint: `💡 提示：長方體體對角線長公式為 $d = \\sqrt{a^2 + b^2 + c^2}$。`,
            explanation: `📖 詳解：底面對角線 $= \\sqrt{3^2 + 4^2} = 5$ 公分。體對角線 $= \\sqrt{5^2 + 12^2} = \\sqrt{25 + 144} = \\sqrt{169} = 13$ 公分。`
          };
        }
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 7)) % archetypes.length]();
    }

    // u3: 因式分解
    if (uNum === 3) {
      const archetypes = [
        () => {
          return {
            question: `【十字交乘進階因式分解】${preamble}\n將二次多項式 $2x^2 + 5x - 12$ 進行因式分解，其結果為何？`,
            options: [`$(2x - 3)(x + 4)$`, `$(2x + 3)(x - 4)$`, `$(2x - 4)(x + 3)$`, `$(2x + 1)(x - 12)$`],
            answer: 0,
            hint: `💡 提示：將首項拆成 $2x$ 與 $x$，常數項拆成 $-3$ 與 $4$ 進行十字交乘驗證中間項。`,
            explanation: `📖 詳解：十字交乘：$2x \\times 4 + x \\times (-3) = 8x - 3x = +5x$。故原式因式分解為 $(2x - 3)(x + 4)$。`
          };
        }
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 7)) % archetypes.length]();
    }

    // u4: 一元二次方程式
    if (uNum === 4) {
      const archetypes = [
        () => {
          return {
            question: `【判別式與根的性質】${preamble}\n若一元二次方程式 $x^2 - 6x + (k - 2) = 0$ 有「兩相等實根（重根）」，則常數 $k$ 的值為何？`,
            options: [`11`, `9`, `7`, `13`],
            answer: 0,
            hint: `💡 提示：有重根表示判別式 $b^2 - 4ac = 0$。`,
            explanation: `📖 詳解：判別式 $\\Delta = (-6)^2 - 4(1)(k - 2) = 36 - 4k + 8 = 44 - 4k$。令 $\\Delta = 0 \\Rightarrow 44 - 4k = 0 \\Rightarrow 4k = 44 \\Rightarrow k = 11$。`
          };
        }
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 7)) % archetypes.length]();
    }

    // u5: 等差數列與等差級數
    if (uNum === 5) {
      const archetypes = [
        () => {
          const a1 = 5;
          const d = 4;
          const n = 20;
          const an = a1 + (n - 1) * d; // 81
          const sum = n * (a1 + an) / 2; // 20 * 86 / 2 = 860
          return {
            question: `【等差級數求和高階運算】${preamble}\n已知等差數列首項 $a_1 = ${a1}$，公差 $d = ${d}$。請問前 ${n} 項的和 $S_{${n}}$ 為多少？`,
            options: [`${sum}`, `${sum - 20}`, `${sum + 40}`, `${an * n}`],
            answer: 0,
            hint: `💡 提示：先算第 ${n} 項 $a_{${n}} = a_1 + (${n}-1)d$，再用梯形公式 $S_n = \\frac{n(a_1+a_n)}{2}$。`,
            explanation: `📖 詳解：\n$a_{${n}} = ${a1} + (${n}-1) \\times ${d} = ${a1} + ${an - a1} = ${an}$。\n$S_{${n}} = \\frac{${n} \\times (${a1} + ${an})}{2} = \\frac{${n} \\times ${a1 + an}}{2} = ${sum}$。`
          };
        }
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 7)) % archetypes.length]();
    }

    // u6: 平面幾何性質與三角形內角和
    if (uNum === 6) {
      const archetypes = [
        () => {
          const n = 8; // 正八邊形
          const angle = (n - 2) * 180 / n; // 135
          return {
            question: `【正多邊形內角與外角計算】${preamble}\n正八邊形的一個內角度數為多少度？`,
            options: [`$135^\\circ$`, `$120^\\circ$`, `$140^\\circ$`, `$108^\\circ$`],
            answer: 0,
            hint: `💡 提示：外角和必為 $360^\\circ$，正八邊形外角 $= 360^\\circ \\div 8 = 45^\\circ$。內角 $= 180^\\circ - 45^\\circ$。`,
            explanation: `📖 詳解：正八邊形每個外角 $= \\frac{360^\\circ}{8} = 45^\\circ$。因此每個內角 $= 180^\\circ - 45^\\circ = 135^\\circ$。`
          };
        }
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 7)) % archetypes.length]();
    }
  }

  // =========================================================================
  // 九年級 (國三)
  // =========================================================================
  if (gradeId === 'g9') {
    // u1: 相似形與比例線段
    if (uNum === 1) {
      const archetypes = [
        () => {
          const ratio = 3;
          return {
            question: `【相似三角形面積比】${preamble}\n若 $\\triangle ABC \\sim \\triangle DEF$，且對應邊長比為 $2 : ${ratio}$。已知 $\\triangle ABC$ 的面積為 $16$，則 $\\triangle DEF$ 的面積為何？`,
            options: [`${16 * (ratio * ratio) / 4}`, `${16 * ratio / 2}`, `24`, `32`],
            answer: 0,
            hint: `💡 提示：兩相似圖形之面積比等於對應邊長的「平方比」！`,
            explanation: `📖 詳解：邊長比為 $2 : ${ratio}$，面積比為 $2^2 : ${ratio}^2 = 4 : ${ratio * ratio}$。\n$\\frac{16}{\\text{面積}} = \\frac{4}{${ratio * ratio}} \\Rightarrow \\text{面積} = \\frac{16 \\times ${ratio * ratio}}{4} = ${16 * (ratio * ratio) / 4}$。`
          };
        }
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 7)) % archetypes.length]();
    }

    // u2: 圓形幾何性質
    if (uNum === 2) {
      const archetypes = [
        () => {
          const central = 80;
          const inscribed = central / 2;
          return {
            question: `【圓心角與圓周角幾何關係】${preamble}\n在圓 $O$ 中，同所對一劣弧的圓心角為 $${central}^\\circ$。請問該弧所對的圓周角為多少度？`,
            options: [`$${inscribed}^\\circ$`, `$${central}^\\circ$`, `$${central * 2}^\\circ$`, `$${180 - central}^\\circ$`],
            answer: 0,
            hint: `💡 提示：同弧所對的圓周角度數等於圓心角度數的一半。`,
            explanation: `📖 詳解：同弧所對之圓周角 $= \\frac{1}{2} \\times \\text{圓心角} = \\frac{1}{2} \\times ${central}^\\circ = ${inscribed}^\\circ$。`
          };
        }
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 7)) % archetypes.length]();
    }

    // u3: 幾何證明與三角形三心 (外心、內心、重心)
    if (uNum === 3) {
      const archetypes = [
        () => {
          const a = 6, b = 8, c = 10;
          const r = (a + b - c) / 2; // 2
          return {
            question: `【直角三角形內心與內切圓半徑】${preamble}\n直角三角形兩股長為 $${a}$、$${b}$，斜邊長為 $${c}$。請問其內切圓半徑 $r$ 為多少？`,
            options: [`${r}`, `${r + 1}`, `${c / 2}`, `${(a + b) / 2}`],
            answer: 0,
            hint: `💡 提示：直角三角形內切圓半徑公式：$r = \\frac{a + b - c}{2}$。`,
            explanation: `📖 詳解：$r = \\frac{\\text{兩股和} - \\text{斜邊}}{2} = \\frac{${a} + ${b} - ${c}}{2} = \\frac{${a + b - c}}{2} = ${r}$。`
          };
        },
        () => {
          return {
            question: `【重心性質：中線分段與面積】${preamble}\n點 $G$ 為 $\\triangle ABC$ 的重心，$\\overline{AD}$ 為中線。若 $\\overline{AD} = 12$，則線段 $\\overline{AG}$ 的長度為何？`,
            options: [`8`, `6`, `4`, `9`],
            answer: 0,
            hint: `💡 提示：重心將中線分成 $2 : 1$。頂點到重心佔 $\\frac{2}{3}$。`,
            explanation: `📖 詳解：重心到頂點的距離佔中線長的 $\\frac{2}{3}$：$\\overline{AG} = \\frac{2}{3} \\times \\overline{AD} = \\frac{2}{3} \\times 12 = 8$。`
          };
        }
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 7)) % archetypes.length]();
    }

    // u4: 二次函數與圖形極值
    if (uNum === 4) {
      const archetypes = [
        () => {
          const h = 2, k = -5;
          return {
            question: `【二次函數配方與頂點坐標】${preamble}\n將二次函數 $y = x^2 - 4x - 1$ 配方化為頂點式 $y = (x - h)^2 + k$，則其頂點坐標 $(h, k)$ 為何？`,
            options: [`$(2, -5)$`, `$(2, -1)$`, `$(-2, -5)$`, `$(4, -1)$`],
            answer: 0,
            hint: `💡 提示：配方：$x^2 - 4x + 4 - 4 - 1 = (x - 2)^2 - 5$。`,
            explanation: `📖 詳解：$y = (x^2 - 4x + 4) - 4 - 1 = (x - 2)^2 - 5$。頂點坐標為 $(2, -5)$。`
          };
        }
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 7)) % archetypes.length]();
    }

    // u5: 統計與機率
    if (uNum === 5) {
      const archetypes = [
        () => {
          return {
            question: `【古典機率：擲公正骰子點數和大於9】${preamble}\n同時擲兩顆公正骰子，點數和「大於 9」的機率為何？`,
            options: [`$\\frac{1}{6}$`, `$\\frac{1}{12}$`, `$\\frac{1}{4}$`, `$\\frac{5}{36}$`],
            answer: 0,
            hint: `💡 提示：總點數和大於 9 即為 10, 11, 12。列出符合條件的點數組合共有 6 種。`,
            explanation: `📖 詳解：總樣本數為 $6 \\times 6 = 36$。\n大於 9 的點數和組合有：\n和為 10：$(4,6), (5,5), (6,4)$ (3種)\n和為 11：$(5,6), (6,5)$ (2種)\n和為 12：$(6,6)$ (1種)\n共 $3 + 2 + 1 = 6$ 種。機率為 $\\frac{6}{36} = \\frac{1}{6}$。`
          };
        }
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 7)) % archetypes.length]();
    }
  }

  // 兜底保護：若年級或單元無特定 hard archetype，回傳符合 108 課綱定義之綜合思維素養題
  return {
    question: `【108會考跨領域素養挑戰】${preamble}\n在直角坐標平面上，直線 $L: y = 2x - 4$ 與 $x$ 軸交於點 $P$、與 $y$ 軸交於點 $Q$。請問原點 $O(0,0)$ 到線段 $\\overline{PQ}$ 的最短垂直距離為何？`,
    options: [`$\\frac{4\\sqrt{5}}{5}$`, `$\\sqrt{5}$`, `2`, `$\\frac{8}{5}$`],
    answer: 0,
    hint: `💡 提示：求出 $P(2,0)$ 與 $Q(0,-4)$，利用三角形面積等於 $\\frac{1}{2} \\times \\text{兩股乘積} = \\frac{1}{2} \\times \\text{斜邊} \\times \\text{斜邊上的高}$。`,
    explanation: `📖 詳解：\n令 $y=0 \\Rightarrow x=2$，點 $P(2,0)$；令 $x=0 \\Rightarrow y=-4$，點 $Q(0,-4)$。\n兩股長為 $2$ 與 $4$。斜邊 $\\overline{PQ} = \\sqrt{2^2 + (-4)^2} = \\sqrt{20} = 2\\sqrt{5}$。\n利用直角三角形面積相等原理：$\\text{面積} = \\frac{1}{2} \\times 2 \\times 4 = \\frac{1}{2} \\times 2\\sqrt{5} \\times h \\Rightarrow 4 = \\sqrt{5}h \\Rightarrow h = \\frac{4}{\\sqrt{5}} = \\frac{4\\sqrt{5}}{5}$。`
  };
}
