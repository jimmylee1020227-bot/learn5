export function generateMathQuestion(gradeId, unitId, index, difficulty, rand, conceptTag) {
  const diffMultiplier = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : difficulty === 'hard' ? 4 : 7;
  const a = Math.floor(rand() * 10 * diffMultiplier) + 2;
  const b = Math.floor(rand() * 8 * diffMultiplier) + 3;
  const c = Math.floor(rand() * 6 * diffMultiplier) + 1;

  if (gradeId === 'g7') {
    const variant = index % 6;
    if (variant === 0) {
      // 票價表 (二元一次聯立方程式應用)
      const adultPrice = 150 + (index % 5) * 10;
      const childPrice = 100 + (index % 5) * 5;
      const total = adultPrice * 2 + childPrice * 3;
      return {
        isReading: true,
        readingText: `【票價圖表分析】某遊樂園的門票價格表如下：\n-------------------------\n| 票種   | 價格 (元/張) |\n|--------|--------------|\n| 全票   |     ${adultPrice}      |\n| 半票   |     ${childPrice}      |\n-------------------------\n小明一家人總共買了 5 張門票，結帳時付了 ${total} 元。`,
        question: `【圖表推演】請問小明家買了幾張全票、幾張半票？`,
        options: ['2張全票，3張半票', '3張全票，2張半票', '1張全票，4張半票', '4張全票，1張半票'],
        answer: 0,
        hint: '💡 提示：假設全票 x 張，半票 y 張。列出聯立方程式：x + y = 5，且全票單價*x + 半票單價*y = 總金額。',
        explanation: `📖 詳解：設全票 x 張，半票 y 張。x+y=5，${adultPrice}x + ${childPrice}y = ${total}。解聯立方程式得 x=2, y=3。`
      };
    } else if (variant === 1) {
      // 匯率表 (比例與四則運算)
      const rateUSD = 30 + (index % 5);
      const rateJPY = 0.2 + (index % 3) * 0.01;
      const ntw = 15000;
      return {
        isReading: true,
        readingText: `【銀行匯率圖表】某日台灣銀行牌告匯率表(部分)如下：\n===============================\n| 幣別 | 買入匯率 | 賣出匯率 |\n|------|----------|----------|\n| 美金 |  ${rateUSD - 0.5}  |   ${rateUSD}   |\n| 日圓 |  ${(rateJPY - 0.01).toFixed(3)} |   ${rateJPY.toFixed(3)}  |\n===============================\n(註：賣出匯率代表銀行賣給民眾的價格)`,
        question: `【圖表推演】小華想拿新台幣 ${ntw} 元去銀行兌換美金。請問他最多可以換到多少美金？`,
        options: [`${ntw / rateUSD} 元`, `${(ntw / (rateUSD - 0.5)).toFixed(2)} 元`, `${ntw * rateUSD} 元`, `${(ntw / rateJPY).toFixed(2)} 元`],
        answer: 0,
        hint: '💡 提示：銀行把美金賣給你，所以要看「賣出匯率」。',
        explanation: `📖 詳解：民眾拿台幣換外幣，適用「賣出匯率」。${ntw} ÷ ${rateUSD} = ${ntw / rateUSD} 美元。`
      };
    } else if (variant === 2) {
      // 對話情境題 (打折)
      const discount = b % 5 + 5;
      const original = a * 100;
      const finalPrice = original * (discount / 10);
      return {
        isChat: true,
        chatMessages: [
          { sender: '小明', text: `欸，我看到那雙鞋子原價 ${original} 元耶！` },
          { sender: '小華', text: `太貴了吧！不過聽說今天全館打 ${discount} 折。` },
          { sender: '小明', text: `真的假的！那我現在買只要多少錢啊？` }
        ],
        question: `【對話情境解謎】根據上述對話，小明打折後買鞋子需要花多少錢？`,
        options: [finalPrice, original - discount, original - 50, finalPrice + 100],
        answer: 0,
        hint: `💡 提示：打 ${discount} 折代表價格變成原來的 ${discount / 10} 倍。`,
        explanation: `📖 詳解：${original} × 0.${discount} = ${finalPrice} 元。`
      };
    } else if (variant === 3) {
      const val = a + 3;
      return {
        question: `【常見計算陷阱】計算式子：-(${val}) - (-${val}) 的值為何？`,
        options: [0, -val * 2, val * 2, -val],
        answer: 0,
        hint: '💡 提示：注意括號前的負號，「負負得正」。',
        explanation: `📖 詳解：-(${val}) - (-${val}) = -${val} + ${val} = 0。`
      };
    } else if (variant === 4) {
      const val1 = a + 2; const val2 = b + 1;
      return {
        question: `【絕對值陷阱】已知 |x| = ${val1}，|y| = ${val2}，且 x < 0，y > 0，求 x + y 的值為何？`,
        options: [val2 - val1, val1 + val2, -(val1 + val2), val1 - val2],
        answer: 0,
        hint: '💡 提示：絕對值拆開有正負兩解，必須根據題意判斷。',
        explanation: `📖 詳解：x = -${val1}，y = ${val2}。故 x + y = -${val1} + ${val2} = ${val2 - val1}。`
      };
    } else {
      const coeff1 = (a % 3) + 2; const coeff2 = (b % 3) + 2; const xVal = (c % 5) + 2;
      const constTerm = (a % 4) + 1;
      const rhs = (coeff1 + coeff2) * xVal - constTerm;
      return {
        question: `【帶括號的一元一次方程式】解方程式：${coeff1}x + ${coeff2}(x - ${xVal}) + ${coeff2 * xVal - constTerm} = ${rhs}，求 x？`,
        options: [xVal, xVal + 1, xVal - 1, xVal * 2],
        answer: 0,
        hint: '💡 提示：先將括號分配律展開，再合併同類項。',
        explanation: `📖 詳解：解得 x = ${xVal}。`
      };
    }
  } else if (gradeId === 'g8') {
    const variant = index % 4;
    if (variant === 0) {
      // 幾何圖形題 (直角三角形 SVG)
      const base = 3 * a;
      const height = 4 * a;
      const hyp = 5 * a;
      return {
        isSvg: true,
        svgContent: `<svg width="200" height="150" viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
          <polygon points="20,130 150,130 20,30" fill="#e0f2fe" stroke="#0284c7" stroke-width="3" />
          <rect x="20" y="115" width="15" height="15" fill="none" stroke="#0284c7" stroke-width="2" />
          <text x="75" y="145" font-size="14" fill="#0f172a" font-weight="bold">${base}</text>
          <text x="5" y="85" font-size="14" fill="#0f172a" font-weight="bold">${height}</text>
          <text x="95" y="75" font-size="14" fill="#ef4444" font-weight="bold">x</text>
        </svg>`,
        question: `【幾何圖形計算】如上圖所示，這是一個直角三角形。已知兩股長度分別為 ${base} 與 ${height}，請問斜邊長度 x 為何？`,
        options: [hyp, hyp + a, hyp - a, hyp * 2],
        answer: 0,
        hint: '💡 提示：利用畢氏定理：斜邊平方 = 兩股平方和。',
        explanation: `📖 詳解：x = √(${base}² + ${height}²) = ${hyp}。`
      };
    } else if (variant === 1) {
      // 畢氏定理情境
      const scale = (c % 3) + 2;
      return {
        question: `【畢氏定理情境】一消防雲梯底部距離樹幹 ${4 * scale} 公尺，樹上小貓離地 ${3 * scale} 公尺，雲梯至少需伸長多少公尺？`,
        options: [5 * scale, 5 * scale + 1, 7 * scale, 5 * scale - 2],
        answer: 0,
        hint: '💡 提示：利用畢氏定理。',
        explanation: `📖 詳解：√(${4 * scale}² + ${3 * scale}²) = ${5 * scale} 公尺。`
      };
    } else if (variant === 2) {
      // 折線圖
      const profit = [10, 15, 20, 25]; 
      return {
        isReading: true,
        readingText: `【圖表分析】某公司今年前四個月的營業利潤折線圖數據表如下：\n| 月份(x) | 1 | 2 | 3 | 4 |\n| 利潤(y) | ${profit[0]}萬| ${profit[1]}萬| ${profit[2]}萬| ${profit[3]}萬|`,
        question: `【圖表推演】若利潤 y 與月份 x 呈線型函數 y = ax + b，a 和 b 分別為何？`,
        options: ['a = 5, b = 5', 'a = 10, b = 0', 'a = 5, b = 10', 'a = 1, b = 9'],
        answer: 0,
        hint: '💡 提示：a 為斜率，求出後代入點(1, 10)。',
        explanation: `📖 詳解：斜率 a = (15-10)/(2-1) = 5。代入 10 = 5(1) + b => b = 5。`
      };
    } else {
      const sq = a * a;
      return {
        question: `【平方根運算】計算 √${sq} + √${sq * 4} 的值為何？`,
        options: [a * 3, a * 2, a * 5, sq * 2],
        answer: 0,
        hint: '💡 提示：先分別求出完全平方數的平方根，然後再相加。',
        explanation: `📖 詳解：√${sq} = ${a}，√${sq * 4} = ${a * 2}。相加為 ${a * 3}。`
      };
    }
  } else if (gradeId === 'g9') {
    const variant = index % 2;
    if (variant === 0) {
      // 統計表
      const scores = [60, 70, 70, 80, 90].map(s => s + (index % 5) * 2);
      const mean = (scores[0]+scores[1]+scores[2]+scores[3]+scores[4]) / 5;
      return {
        isReading: true,
        readingText: `【統計圖表】小華五次測驗分數表：\n| 測驗次數 | 第1次 | 第2次 | 第3次 | 第4次 | 第5次 |\n| 分數(分) | ${scores[0]} | ${scores[1]} | ${scores[2]} | ${scores[3]} | ${scores[4]} |`,
        question: `【資料解讀】請問小華這五次成績的「眾數」與「中位數」分別為何？`,
        options: [
          `眾數為 ${scores[1]}，中位數為 ${scores[2]}`, 
          `眾數為 ${scores[2]}，中位數為 ${scores[1]}`, 
          `眾數為 ${scores[1]}，中位數為 ${mean}`, 
          `眾數為 ${scores[4]}，中位數為 ${scores[2]}`
        ],
        answer: 0,
        hint: '💡 提示：眾數是出現最多次的數，中位數是排列後最中間的數。',
        explanation: `📖 詳解：出現最多次為 ${scores[1]}，最中間的數為 ${scores[2]}。`
      };
    } else {
      return {
        question: `【二次函數】二次函數 y = ${a}(x - ${b})² + ${c} 的頂點坐標為何？`,
        options: [`(${b}, ${c})`, `(-${b}, ${c})`, `(${a}, ${c})`, `(${b}, -${c})`],
        answer: 0,
        hint: '💡 提示：頂點式 y = a(x - h)² + k 的頂點為 (h, k)。',
        explanation: `📖 詳解：對照公式可知頂點為 (${b}, ${c})。`
      };
    }
  }

  // Fallback
  return {
    question: `【數學核心觀念題】關於單元「${conceptTag}」，若變數 x = ${a}，y = ${b}，求 2x + 3y 的值？`,
    options: [2*a + 3*b, a + b, 2*a + 3*b + 1, a * b],
    answer: 0,
    hint: '💡 提示：將 x 與 y 的數值代入。',
    explanation: `📖 詳解：2(${a}) + 3(${b}) = ${2*a + 3*b}。`
  };
}
