export function generateMathQuestion(gradeId, unitId, index, difficulty, rand, conceptTag) {
  const diffMultiplier = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : difficulty === 'hard' ? 4 : 7;
  const a = Math.floor(rand() * 10 * diffMultiplier) + 2;
  const b = Math.floor(rand() * 8 * diffMultiplier) + 3;
  const c = Math.floor(rand() * 6 * diffMultiplier) + 1;
  const variant = Math.floor(rand() * 15);

  // --- 圖表題專區 (Type 0 ~ 4) ---
  if (variant === 0) {
    // 統計表 (平均數、中位數、眾數)
    const scores = [60, 70, 70, 80, 90].map(s => s + (index % 5) * 2);
    const sum = scores.reduce((acc, curr) => acc + curr, 0);
    const mean = sum / scores.length;
    return {
      isReading: true,
      readingText: `【統計圖表分析】小華本學期五次平時測驗的分數紀錄表如下：\n=================================\n| 測驗次數 | 第1次 | 第2次 | 第3次 | 第4次 | 第5次 |\n|----------|-------|-------|-------|-------|-------|\n| 分數(分) |  ${scores[0]}  |  ${scores[1]}  |  ${scores[2]}  |  ${scores[3]}  |  ${scores[4]}  |\n=================================`,
      question: `【資料解讀】請問小華這五次測驗成績的「眾數」與「中位數」分別為何？`,
      options: [
        `眾數為 ${scores[1]}，中位數為 ${scores[2]}`, 
        `眾數為 ${scores[2]}，中位數為 ${scores[1]}`, 
        `眾數為 ${scores[1]}，中位數為 ${mean}`, 
        `眾數為 ${scores[4]}，中位數為 ${scores[2]}`
      ],
      answer: 0,
      hint: '💡 提示：眾數是出現最多次的數，中位數是將資料由小到大排列後最中間的數。',
      explanation: `📖 詳解：由小到大排列為 ${scores.join(', ')}。出現最多次的是 ${scores[1]} (2次)，故眾數為 ${scores[1]}。最中間的數(第3個)是 ${scores[2]}，故中位數為 ${scores[2]}。`
    };
  } else if (variant === 1) {
    // 票價表 (二元一次聯立方程式應用)
    const adultPrice = 150 + (index % 5) * 10;
    const childPrice = 100 + (index % 5) * 5;
    const adultCount = 2;
    const childCount = 3;
    const total = adultPrice * adultCount + childPrice * childCount;
    return {
      isReading: true,
      readingText: `【票價圖表分析】某遊樂園的門票價格表如下：\n-------------------------\n| 票種   | 價格 (元/張) |\n|--------|--------------|\n| 全票   |     ${adultPrice}      |\n| 半票   |     ${childPrice}      |\n-------------------------\n小明一家人總共買了 5 張門票，結帳時付了 ${total} 元。`,
      question: `【圖表推演】請問小明家買了幾張全票、幾張半票？`,
      options: [
        `${adultCount}張全票，${childCount}張半票`,
        `${childCount}張全票，${adultCount}張半票`,
        `1張全票，4張半票`,
        `4張全票，1張半票`
      ],
      answer: 0,
      hint: '💡 提示：假設全票 x 張，半票 y 張。列出聯立方程式：x + y = 5，且全票單價*x + 半票單價*y = 總金額。',
      explanation: `📖 詳解：設全票 x 張，半票 y 張。x+y=5，${adultPrice}x + ${childPrice}y = ${total}。解聯立方程式得 x=${adultCount}, y=${childCount}。`
    };
  } else if (variant === 2) {
    // 匯率表 (比例與四則運算)
    const rateUSD = 30 + (index % 5);
    const rateJPY = 0.2 + (index % 3) * 0.01;
    const ntw = 15000;
    const exUSD = ntw / rateUSD;
    return {
      isReading: true,
      readingText: `【銀行匯率圖表】某日台灣銀行牌告匯率表(部分)如下：\n===============================\n| 幣別 | 買入匯率 | 賣出匯率 |\n|------|----------|----------|\n| 美金 |  ${rateUSD - 0.5}  |   ${rateUSD}   |\n| 日圓 |  ${(rateJPY - 0.01).toFixed(3)} |   ${rateJPY.toFixed(3)}  |\n===============================\n(註：賣出匯率代表銀行賣給民眾的價格)`,
      question: `【圖表推演】小華準備出國，想拿新台幣 ${ntw} 元去銀行兌換美金。請問他最多可以換到多少美金？`,
      options: [`${exUSD} 元`, `${(ntw / (rateUSD - 0.5)).toFixed(2)} 元`, `${ntw * rateUSD} 元`, `${(ntw / rateJPY).toFixed(2)} 元`],
      answer: 0,
      hint: '💡 提示：銀行把美金賣給你，所以要看「賣出匯率」。用台幣除以匯率。',
      explanation: `📖 詳解：民眾拿台幣換外幣，適用銀行的「賣出匯率」。${ntw} ÷ ${rateUSD} = ${exUSD} 美元。`
    };
  } else if (variant === 3) {
    // 折線圖數據表 (線性函數/斜率)
    const month = [1, 2, 3, 4];
    const profit = [10, 15, 20, 25]; // 每月穩定增加 5
    return {
      isReading: true,
      readingText: `【營收圖表分析】某公司今年前四個月的營業利潤折線圖數據表如下：\n---------------------------------\n| 月份 (x) |  1  |  2  |  3  |  4  |\n|----------|-----|-----|-----|-----|\n| 利潤 (y) | ${profit[0]}萬| ${profit[1]}萬| ${profit[2]}萬| ${profit[3]}萬|\n---------------------------------`,
      question: `【圖表推演】觀察上表數據，若該公司的利潤 y 與月份 x 呈現「線型函數 (y = ax + b)」關係，請問 a 和 b 的值分別為何？`,
      options: ['a = 5, b = 5', 'a = 10, b = 0', 'a = 5, b = 10', 'a = 1, b = 9'],
      answer: 0,
      hint: '💡 提示：a 為斜率(每增加一個月，利潤增加多少)，將 (1, 10) 代入 y = ax + b 求 b。',
      explanation: `📖 詳解：利潤每個月穩定增加 5 萬，故斜率 a = 5。將 x = 1, y = 10 代入 10 = 5(1) + b，解得 b = 5。`
    };
  } else if (variant === 4) {
    // 體重身高表
    const vA = a * 10 + b;
    const vB = a * 10 + b + c;
    const vC = a * 10 + b - c;
    const vD = a * 10 + b + c * 2;
    return {
      isReading: true,
      readingText: `【圖表分析題】以下為某班級四位同學的身高(公分)與體重(公斤)資料表：\n------------------------\n| 學生 | 身高(cm) | 體重(kg) |\n|------|----------|----------|\n| 甲生 |   165    |    ${vA}    |\n| 乙生 |   170    |    ${vB}    |\n| 丙生 |   160    |    ${vC}    |\n| 丁生 |   175    |    ${vD}    |\n------------------------`,
      question: `【資料解讀】根據上表，哪一位同學的體重最重？`,
      options: ['丁生', '乙生', '甲生', '丙生'],
      answer: 0,
      hint: '💡 提示：比較表格中「體重(kg)」欄位的數值大小。',
      explanation: `📖 詳解：丁生的體重為 ${vD} kg，為四人中最大值。`
    };
  }
  
  // --- 長篇情境題與陷阱題 (Type 5 ~ 14) ---
  if (gradeId === 'g7') {
    if (unitId.includes('u1')) {
      if (variant < 7) {
        // 陷阱題: 負負得正陷阱
        const val = a + 3;
        return {
          question: `【常見計算陷阱】計算式子：-(${val}) - (-${val}) 的值為何？`,
          options: [0, -val * 2, val * 2, -val],
          answer: 0,
          hint: '💡 提示：注意括號前的負號，「負負得正」。',
          explanation: `📖 詳解：-(${val}) - (-${val}) = -${val} + ${val} = 0。常見錯誤是忘記負負得正而算出 -${val * 2}。`
        };
      } else if (variant < 9) {
        // 絕對值陷阱
        const val1 = a + 2;
        const val2 = b + 1;
        return {
          question: `【絕對值陷阱】已知 |x| = ${val1}，|y| = ${val2}，且 x < 0，y > 0，求 x + y 的值為何？`,
          options: [val2 - val1, val1 + val2, -(val1 + val2), val1 - val2],
          answer: 0,
          hint: '💡 提示：絕對值拆開有正負兩解，必須根據題意 x < 0 判斷 x 的實際數值。',
          explanation: `📖 詳解：由 |x| = ${val1} 且 x < 0 可知 x = -${val1}。由 |y| = ${val2} 且 y > 0 可知 y = ${val2}。故 x + y = -${val1} + ${val2} = ${val2 - val1}。`
        };
      } else if (variant < 11) {
        // 先乘除後加減陷阱
        return {
          question: `【四則運算陷阱】計算式子：${a} + ${b} × 0 - ${c} 的值為何？`,
          options: [a - c, (a + b) * 0 - c, a + b - c, 0],
          answer: 0,
          hint: '💡 提示：四則運算規則為「先乘除後加減」。',
          explanation: `📖 詳解：先算乘法 ${b} × 0 = 0，式子變成 ${a} + 0 - ${c} = ${a - c}。常見錯誤是從左算到右。`
        };
      } else if (variant < 13) {
        const price = a * 100;
        const discount = b % 5 + 5; 
        const paid = price * (discount / 10) + c * 50; 
        const change = paid - price * (discount / 10);
        return {
          question: `【生活情境閱讀測驗】某連鎖超市正在舉辦週年慶活動，規則如下：\n「全館商品單件原價若超過 100 元，該商品即可享有 ${discount} 折優惠」。\n\n小明今天去逛超市，看中了一個標價 ${price} 元的超級豪華便當。他心想：「太好了，剛好符合週年慶的優惠標準！」於是他拿著便當去結帳，並拿出了 ${paid} 元現金給店員。\n\n請問，根據上述活動規則，店員應該找給小明多少元？`,
          options: [change, change + 10, change - 10, paid - price],
          answer: 0,
          hint: `💡 提示：先計算打折後的價格（原價 × 0.${discount}），再用付出的錢減去打折後的價格。`,
          explanation: `📖 詳解：\n1. 便當原價 ${price} 元，大於 100 元，符合 ${discount} 折優惠。\n2. 折扣後價格：${price} × 0.${discount} = ${price * (discount / 10)} 元。\n3. 找零：付了 ${paid} 元 - ${price * (discount / 10)} 元 = ${change} 元。`
        };
      } else {
        const d1 = a + 3; const d2 = b + 2;
        const total = d1 + d2; const diff = Math.abs(d1 - d2);
        return {
          question: `【數線與距離】在數線上，點 A 坐標為 -${d1}，點 B 坐標為 ${d2}，求 A、B 兩點的距離為多少？`,
          options: [total, diff, -total, -diff],
          answer: 0,
          hint: '💡 提示：數線上兩點距離為大數減小數，或利用絕對值 |a - b| 計算。',
          explanation: `📖 詳解：A、B 兩點距離為 |${d2} - (-${d1})| = ${d2} + ${d1} = ${total}。`
        };
      }
    } else {
      // 方程式陷阱
      if (variant < 8) {
        const val = a + 2;
        return {
          question: `【方程式陷阱】解方程式：${val}x = 0，請問 x 的值為何？`,
          options: [0, val, -val, '無解'],
          answer: 0,
          hint: '💡 提示：任何數乘以 0 都等於 0。',
          explanation: `📖 詳解：等號兩邊同除以 ${val}，得 x = 0 / ${val} = 0。常見錯誤是以為無解或 x = ${val}。`
        };
      } else if (variant < 11) {
        const applePrice = a + 15;
        const total = applePrice * 5 + b * 10;
        return {
          question: `【方程式應用閱讀題】文具店老闆進了一批筆記本與原子筆。已知一本筆記本的價格比一枝原子筆貴 15 元。\n某天，小華走進文具店，買了 5 本筆記本和 10 枝原子筆，結帳時總共付了 ${total} 元。\n\n請問，一枝原子筆的單價應該是多少元？`,
          options: [applePrice - 15, applePrice, applePrice - 5, applePrice - 10],
          answer: 0,
          hint: '💡 提示：設原子筆為 x 元，筆記本為 (x + 15) 元，列出方程式 5(x + 15) + 10x = 總金額。',
          explanation: `📖 詳解：\n1. 設原子筆 x 元，筆記本 (x + 15) 元。\n2. 5(x + 15) + 10x = ${total}\n3. 5x + 75 + 10x = ${total} => 15x = ${total - 75} => x = ${(total - 75) / 15}。`
        };
      } else {
        const coeff1 = (a % 3) + 2; const coeff2 = (b % 3) + 2; const xVal = (c % 5) + 2;
        const constTerm = (a % 4) + 1;
        const rhs = (coeff1 + coeff2) * xVal - constTerm;
        return {
          question: `【帶括號的一元一次方程式】解方程式：${coeff1}x + ${coeff2}(x - ${xVal}) + ${coeff2 * xVal - constTerm} = ${rhs}，求 x？`,
          options: [xVal, xVal + 1, xVal - 1, xVal * 2],
          answer: 0,
          hint: '💡 提示：先將括號分配律展開，再合併同類項解 x。',
          explanation: `📖 詳解：展開得 ${coeff1}x + ${coeff2}x - ${coeff2 * xVal} + ${coeff2 * xVal - constTerm} = ${rhs}，即 ${(coeff1 + coeff2)}x - ${constTerm} = ${rhs}。移項得 x = ${xVal}。`
        };
      }
    }
  } else if (gradeId === 'g8') {
    if (variant < 7) {
      // 畢氏定理陷阱: 3, 4 不一定是斜邊
      return {
        question: `【畢氏定理陷阱】已知一直角三角形的兩邊長分別為 3 和 4，請問第三邊的長度為何？`,
        options: ['5 或 √7', '5', '7', '√7'],
        answer: 0,
        hint: '💡 提示：題目並未指明 3 和 4 是兩股，4 也有可能是斜邊。',
        explanation: `📖 詳解：\n情況一：若 3 和 4 為兩股，則斜邊為 √(3² + 4²) = 5。\n情況二：若 4 為斜邊、3 為一股，則另一股為 √(4² - 3²) = √7。故第三邊可能為 5 或 √7。`
      };
    } else if (variant < 11) {
      const pythTriples = [[3, 4, 5], [5, 12, 13], [7, 24, 25]];
      const triple = pythTriples[index % pythTriples.length];
      const scale = (c % 3) + 2;
      const height = triple[0] * scale;
      const dist = triple[1] * scale;
      const hyp = triple[2] * scale;
      return {
        question: `【畢氏定理情境閱讀】消防局接到一通求救電話，有一隻小貓受困在一棵高樹上。消防車趕到現場後，因為地形限制，消防車的雲梯底部距離樹幹的水平距離為 ${dist} 公尺。\n若小貓所在的位置距離地面高度為 ${height} 公尺（假設雲梯底部與地面同高），消防員為了剛好能夠構到小貓，必須將雲梯伸長為一直線。\n\n請問，雲梯至少需要伸長多少公尺？`,
        options: [hyp, hyp + 1, height + dist, hyp - 2],
        answer: 0,
        hint: '💡 提示：這是一個直角三角形的問題，利用畢氏定理：斜邊² = 兩股平方和。',
        explanation: `📖 詳解：雲梯長度即為直角三角形的斜邊。\nL = √(${dist}² + ${height}²) = √(${dist * dist} + ${height * height}) = ${hyp} 公尺。`
      };
    } else {
      const val = (a % 5) + 3; const sq = val * val;
      return {
        question: `【平方根運算】計算 √${sq} + √${sq * 4} 的值為何？`,
        options: [val * 3, val * 2, val * 5, sq * 2],
        answer: 0,
        hint: '💡 提示：先分別求出完全平方數的平方根，然後再相加。',
        explanation: `📖 詳解：√${sq} = ${val}，√${sq * 4} = ${val * 2}。相加 = ${val} + ${val * 2} = ${val * 3}。`
      };
    }
  }
  
  // 代數 (Fallback)
  return {
    question: `【代數運算與推論】已知兩變數 x 與 y，滿足 x = ${a} 且 y = ${b}，若定義一種新運算符號 ⊕，其規則為 p ⊕ q = 2p + 3q - ${c}。\n\n請根據此規則，計算 x ⊕ y 的值為何？`,
    options: [2*a + 3*b - c, a + b - c, 2*a + 3*b + c, a * b - c],
    answer: 0,
    hint: '💡 提示：將 x 與 y 的數值代入新定義的運算規則中。',
    explanation: `📖 詳解：x ⊕ y = 2(${a}) + 3(${b}) - ${c} = ${2*a} + ${3*b} - ${c} = ${2*a + 3*b - c}。`
  };
}
