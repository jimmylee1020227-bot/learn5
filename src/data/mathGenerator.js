export function generateMathQuestion(gradeId, unitId, index, difficulty, rand, conceptTag) {
  const diffMultiplier = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : difficulty === 'hard' ? 4 : 7;
  const a = Math.floor(rand() * 10 * diffMultiplier) + 2;
  const b = Math.floor(rand() * 8 * diffMultiplier) + 3;
  const c = Math.floor(rand() * 6 * diffMultiplier) + 1;
  const variant = Math.floor(rand() * 4); // Added more variants for reading comprehension

  if (gradeId === 'g7') {
    if (unitId.includes('u1')) {
      if (variant === 0) {
        // 長篇情境題 (Reading Comprehension Math)
        const price = a * 100;
        const discount = b % 5 + 5; // 5~9 折
        const paid = price * (discount / 10) + c * 50; 
        const change = paid - price * (discount / 10);
        return {
          question: `【生活情境閱讀測驗】某連鎖超市正在舉辦週年慶活動，規則如下：\n「全館商品單件原價若超過 100 元，該商品即可享有 ${discount} 折優惠」。\n\n小明今天去逛超市，看中了一個標價 ${price} 元的超級豪華便當。他心想：「太好了，剛好符合週年慶的優惠標準！」於是他拿著便當去結帳，並拿出了 ${paid} 元現金給店員。\n\n請問，根據上述活動規則，店員應該找給小明多少元？`,
          options: [change, change + 10, change - 10, paid - price],
          answer: 0,
          hint: `💡 提示：先計算打折後的價格（原價 × 0.${discount}），再用付出的錢減去打折後的價格。`,
          explanation: `📖 詳解：\n1. 便當原價 ${price} 元，大於 100 元，符合 ${discount} 折優惠。\n2. 折扣後價格：${price} × 0.${discount} = ${price * (discount / 10)} 元。\n3. 找零：付了 ${paid} 元 - ${price * (discount / 10)} 元 = ${change} 元。`
        };
      } else if (variant === 1) {
        const n1 = -a; const n2 = b; const n3 = -(c + 2);
        const isAdd = rand() > 0.5;
        const inside = isAdd ? n1 + n2 : n1 - n2;
        const ansVal = inside * n3;
        return {
          question: `【整數四則與負數運算】計算式子：[(${n1}) ${isAdd ? '+' : '-'} (${n2})] × (${n3}) 之值為何？`,
          options: [ansVal, ansVal + a, ansVal - b, -ansVal],
          answer: 0,
          hint: '💡 提示：先算括號內的加減，再進行乘法（負負得正）。',
          explanation: `📖 詳解：[(${n1}) ${isAdd ? '+' : '-'} (${n2})] = ${inside}。\n${inside} × (${n3}) = ${ansVal}。`
        };
      } else {
        const v1 = a * 2 - b * 3;
        const v2 = c * 4 - a * 2;
        const ansVal = Math.abs(v1) - Math.abs(v2);
        return {
          question: `【絕對值與四則混合運算】計算：|${a * 2} - ${b * 3}| - |${c * 4} - ${a * 2}| 的值為何？`,
          options: [ansVal, ansVal + a, Math.abs(v1) + Math.abs(v2), -ansVal],
          answer: 0,
          hint: '💡 提示：先分別計算絕對值內的數值，取正數後再相減。',
          explanation: `📖 詳解：|${a * 2} - ${b * 3}| = |${v1}| = ${Math.abs(v1)}。\n|${c * 4} - ${a * 2}| = |${v2}| = ${Math.abs(v2)}。\n兩者相減：${Math.abs(v1)} - ${Math.abs(v2)} = ${ansVal}。`
        };
      }
    } else {
      // 一元一次方程式情境
      if (variant === 0) {
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
    // 乘法公式與畢氏定理
    if (variant === 0) {
      // 畢氏定理情境閱讀題
      const pythTriples = [[3, 4, 5], [5, 12, 13], [7, 24, 25], [8, 15, 17]];
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
  
  // Fallback for math general
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
