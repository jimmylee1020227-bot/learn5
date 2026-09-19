export function generateMathQuestion(gradeId, unitId, index, difficulty, rand, conceptTag) {
  const diffMultiplier = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : difficulty === 'hard' ? 4 : 7;
  const a = Math.floor(rand() * 10 * diffMultiplier) + 2;
  const b = Math.floor(rand() * 8 * diffMultiplier) + 3;
  const c = Math.floor(rand() * 6 * diffMultiplier) + 1;
  const variant = Math.floor(rand() * 10);

  if (gradeId === 'g7') {
    if (unitId.includes('u1')) {
      if (variant === 0) {
        // 陷阱題: 負負得正陷阱
        const val = a + 3;
        return {
          question: `【常見計算陷阱】計算式子：-(${val}) - (-${val}) 的值為何？`,
          options: [0, -val * 2, val * 2, -val],
          answer: 0,
          hint: '💡 提示：注意括號前的負號，「負負得正」。',
          explanation: `📖 詳解：-(${val}) - (-${val}) = -${val} + ${val} = 0。常見錯誤是忘記負負得正而算出 -${val * 2}。`
        };
      } else if (variant === 1) {
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
      } else if (variant === 2) {
        // 先乘除後加減陷阱
        return {
          question: `【四則運算陷阱】計算式子：${a} + ${b} × 0 - ${c} 的值為何？`,
          options: [a - c, (a + b) * 0 - c, a + b - c, 0],
          answer: 0,
          hint: '💡 提示：四則運算規則為「先乘除後加減」。',
          explanation: `📖 詳解：先算乘法 ${b} × 0 = 0，式子變成 ${a} + 0 - ${c} = ${a - c}。常見錯誤是從左算到右。`
        };
      } else if (variant === 3) {
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
      if (variant === 0) {
        const val = a + 2;
        return {
          question: `【方程式陷阱】解方程式：${val}x = 0，請問 x 的值為何？`,
          options: [0, val, -val, '無解'],
          answer: 0,
          hint: '💡 提示：任何數乘以 0 都等於 0。',
          explanation: `📖 詳解：等號兩邊同除以 ${val}，得 x = 0 / ${val} = 0。常見錯誤是以為無解或 x = ${val}。`
        };
      } else if (variant === 1) {
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
    if (variant === 0) {
      // 畢氏定理陷阱: 3, 4 不一定是斜邊
      return {
        question: `【畢氏定理陷阱】已知一直角三角形的兩邊長分別為 3 和 4，請問第三邊的長度為何？`,
        options: ['5 或 √7', '5', '7', '√7'],
        answer: 0,
        hint: '💡 提示：題目並未指明 3 和 4 是兩股，4 也有可能是斜邊。',
        explanation: `📖 詳解：\n情況一：若 3 和 4 為兩股，則斜邊為 √(3² + 4²) = 5。\n情況二：若 4 為斜邊、3 為一股，則另一股為 √(4² - 3²) = √7。故第三邊可能為 5 或 √7。`
      };
    } else if (variant === 1) {
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
  
  // 圖表題與代數 (Fallback)
  if (variant % 2 === 0) {
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
  } else {
    return {
      question: `【代數運算與推論】已知兩變數 x 與 y，滿足 x = ${a} 且 y = ${b}，若定義一種新運算符號 ⊕，其規則為 p ⊕ q = 2p + 3q - ${c}。\n\n請根據此規則，計算 x ⊕ y 的值為何？`,
      options: [2*a + 3*b - c, a + b - c, 2*a + 3*b + c, a * b - c],
      answer: 0,
      hint: '💡 提示：將 x 與 y 的數值代入新定義的運算規則中。',
      explanation: `📖 詳解：x ⊕ y = 2(${a}) + 3(${b}) - ${c} = ${2*a} + ${3*b} - ${c} = ${2*a + 3*b - c}。`
    };
  }
}
