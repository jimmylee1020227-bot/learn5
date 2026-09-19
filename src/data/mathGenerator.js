export function generateMathQuestion(gradeId, unitId, index, difficulty, rand, conceptTag) {
  // 動態樂高引擎：產生絕對不重複的情境前導詞
  const people = ['小明', '阿華', '大建', '美美', '小英', '志明', '春嬌', '大雄', '靜香', '王老師', '陳老闆'];
  const actions = ['去超市買東西', '在計算家庭開銷', '幫班上訂便當', '在規劃旅遊預算', '遇到一道數學難題', '參加數學挑戰賽', '幫忙算帳時', '整理撲滿時'];
  const feelings = ['覺得很苦惱', '想請你幫忙算算看', '發現數字有點奇怪', '需要你的協助', '想挑戰一下自己', '於是列出了算式'];
  
  const person = people[Math.floor(rand() * people.length)];
  const action = actions[Math.floor(rand() * actions.length)];
  const feeling = feelings[Math.floor(rand() * feelings.length)];
  const preamble = `${person}${action}，${feeling}。`;

  // 隨機動態數值
  const a = Math.floor(rand() * 20) + 5;
  const b = Math.floor(rand() * 15) + 3;
  const c = Math.floor(rand() * 10) + 2;
  const largeN = Math.floor(rand() * 500) + 100;

  function getRandItems(arr, count) {
    const res = [];
    const pool = [...arr];
    for(let i=0; i<count; i++) {
      if(pool.length === 0) break;
      const idx = Math.floor(rand() * pool.length);
      res.push(pool.splice(idx, 1)[0]);
    }
    return res;
  }

  const variant = Math.floor(rand() * 6);

  if (gradeId === 'g7') {
    if (variant === 0) {
      const adultPrice = 150 + Math.floor(rand() * 10) * 10;
      const childPrice = adultPrice - (30 + Math.floor(rand() * 3) * 10);
      const aCount = Math.floor(rand() * 4) + 2;
      const cCount = Math.floor(rand() * 4) + 1;
      const total = adultPrice * aCount + childPrice * cCount;
      const fake1 = adultPrice * (aCount + 1) + childPrice * cCount;
      const fake2 = adultPrice * aCount + childPrice * (cCount + 1);
      const fake3 = total + 50;

      return {
        isReading: true,
        readingText: `【票價計算情境】\n遊樂園的票價資訊如下：\n- 全票：${adultPrice} 元\n- 半票：${childPrice} 元\n\n${preamble}\n${person}一家人總共買了 ${aCount} 張全票與 ${cCount} 張半票。`,
        question: `【生活應用題】請問他們總共需要支付多少元？`,
        options: [`${total}`, `${fake1}`, `${fake2}`, `${fake3}`],
        answer: 0,
        hint: `💡 提示：全票 ${adultPrice}×${aCount} + 半票 ${childPrice}×${cCount}。`,
        explanation: `📖 詳解：總計為 ${adultPrice}×${aCount} + ${childPrice}×${cCount} = ${total} 元。`
      };
    } else if (variant === 1) {
      const v = a * 2 + 1; 
      const fake1 = a * 2 - 1;
      const fake2 = a * 2 + 3;
      const fake3 = -v;
      return {
        question: `【正負數運算】${preamble}\n請問算式 \`${v} - (-${b}) + (-${b})\` 的計算結果為何？`,
        options: [`${v}`, `${fake1}`, `${fake2}`, `${fake3}`],
        answer: 0,
        hint: '💡 提示：負負得正，加上負數等於減。觀察後面兩項是否抵消。',
        explanation: `📖 詳解：-(-${b}) 等於 +${b}，再加上 (-${b}) 剛好互相抵消，故答案為 ${v}。`
      };
    } else if (variant === 2) {
      const varName = ['x', 'y', 'a', 'b', 'm', 'n'][Math.floor(rand()*6)];
      const eqAns = b;
      const rightSide = a * eqAns + c;
      return {
        question: `【一元一次方程式】${preamble}\n若方程式 \`${a}${varName} + ${c} = ${rightSide}\`，則 \`${varName}\` 的值為多少？`,
        options: [`${eqAns}`, `${eqAns+1}`, `${eqAns-1}`, `${eqAns+2}`],
        answer: 0,
        hint: `💡 提示：先將兩邊同減去 ${c}，再除以 ${a}。`,
        explanation: `📖 詳解：${a}${varName} = ${rightSide - c}，得 ${varName} = ${eqAns}。`
      };
    } else if (variant === 3) {
      const base = Math.floor(rand() * 5) + 2; // 2~6
      const exp1 = Math.floor(rand() * 4) + 2; // 2~5
      const exp2 = Math.floor(rand() * 3) + 2; // 2~4
      const ansExp = exp1 + exp2;
      return {
        question: `【指數律計算】${preamble}\n請問 \`${base}^${exp1} \\times ${base}^${exp2}\` 的結果可以表示為下列何者？`,
        options: [`${base}^${ansExp}`, `${base}^${exp1 * exp2}`, `${base * 2}^${ansExp}`, `${base}^${Math.abs(exp1 - exp2)}`],
        answer: 0,
        hint: '💡 提示：底數相同相乘，指數相加。',
        explanation: `📖 詳解：根據指數律 a^m × a^n = a^(m+n)，因此答案為 ${base}^${ansExp}。`
      };
    } else {
      const num1 = Math.floor(rand() * 30) + 10;
      const num2 = num1 + Math.floor(rand() * 10) + 1;
      const sum = num1 + num2;
      const diff = num2 - num1;
      const w1 = sum + 2;
      const w2 = diff + 2;
      return {
        isChat: true,
        chatMessages: [
          { sender: person, text: `我心裡想了兩個神秘的數字，把它們相加是 ${sum}，相減是 ${diff}。` },
          { sender: '你', text: `這太簡單了，我用聯立方程式算一下就知道較大的那個數字是幾了！`, isRight: true }
        ],
        question: `【群組討論解謎】根據上述對話，較大的數字應該是多少？`,
        options: [`${num2}`, `${num1}`, `${w1}`, `${w2}`],
        answer: 0,
        hint: `💡 提示：設兩數為 x, y。x+y=${sum}, y-x=${diff}。兩式相加即可解出。`,
        explanation: `📖 詳解：兩式相加得 2y = ${sum + diff}，故較大的數 y = ${num2}。`
      };
    }
  } else if (gradeId === 'g8') {
    if (variant === 0) {
      const p1 = Math.floor(rand() * 5) + 1;
      const p2 = Math.floor(rand() * 5) + 1;
      const p3 = p1 * p1 + p2 * p2;
      const isRight = p1 * p1 + p2 * p2 === p3; 
      // 這裡直接出畢氏定理標準題
      const m = Math.floor(rand() * 3) + 1;
      const s1 = 3 * m;
      const s2 = 4 * m;
      const s3 = 5 * m;
      return {
        isSvg: true,
        svgContent: `<svg width="200" height="150" viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
          <polygon points="50,120 150,120 50,45" fill="none" stroke="#2563eb" stroke-width="3" />
          <polyline points="50,110 60,110 60,120" fill="none" stroke="#2563eb" stroke-width="2" />
          <text x="95" y="140" font-size="14" fill="#1e40af">a = ${s1}</text>
          <text x="15" y="85" font-size="14" fill="#1e40af">b = ${s2}</text>
          <text x="110" y="75" font-size="14" fill="#ef4444" font-weight="bold">c = ?</text>
        </svg>`,
        question: `【幾何圖形判讀】${preamble}\n如上圖，一個直角三角形的兩股長分別為 ${s1} 和 ${s2}，則斜邊長 c 為何？`,
        options: [`${s3}`, `${s1 + s2}`, `${s3 + 1}`, `${Math.abs(s1 - s2)}`],
        answer: 0,
        hint: '💡 提示：使用畢氏定理 a² + b² = c²。',
        explanation: `📖 詳解：${s1}² + ${s2}² = c²，故 c = ${s3}。`
      };
    } else if (variant === 1) {
      const t1 = a;
      const t2 = b;
      const ansExp = `x^2 + ${t1+t2}x + ${t1*t2}`;
      const w1 = `x^2 + ${t1*t2}x + ${t1+t2}`;
      const w2 = `x^2 + ${t1-t2}x - ${t1*t2}`;
      const w3 = `x^2 + ${t1+t2}x - ${t1*t2}`;
      return {
        question: `【多項式乘法】${preamble}\n請問展開式 \`(x + ${t1})(x + ${t2})\` 的結果為何？`,
        options: [`${ansExp}`, `${w1}`, `${w2}`, `${w3}`],
        answer: 0,
        hint: '💡 提示：利用分配律或十字交乘法逆向思考。',
        explanation: `📖 詳解：展開得 x² + ${t1}x + ${t2}x + ${t1*t2} = ${ansExp}。`
      };
    } else {
      const sq = a * a;
      const w1 = sq + 1;
      const w2 = a * 2;
      const w3 = a;
      return {
        question: `【平方根運算】${preamble}\n請問 \`√(${sq})\` 的值為何？`,
        options: [`${a}`, `±${a}`, `${sq}`, `${w2}`],
        answer: 0,
        hint: '💡 提示：根號代表非負平方根。',
        explanation: `📖 詳解：√${sq} 的意思是找一個正數平方等於 ${sq}，故答案為 ${a}。(注意：不是 ±${a})`
      };
    }
  } else if (gradeId === 'g9') {
    if (variant === 0) {
      const x0 = Math.floor(rand() * 5) + 1;
      const y0 = Math.floor(rand() * 10) + 5;
      const coef = (Math.floor(rand() * 2) === 0 ? 1 : -1) * (Math.floor(rand() * 2) + 1);
      
      const isMax = coef < 0;
      const extType = isMax ? '最大值' : '最小值';
      
      return {
        question: `【二次函數】${preamble}\n已知二次函數 \`y = ${coef}(x - ${x0})^2 + ${y0}\`。請問當 x = ${x0} 時，函數有最大值還是最小值？其值為多少？`,
        options: [`${extType}為 ${y0}`, `${extType}為 ${-y0}`, `${isMax ? '最小值' : '最大值'}為 ${y0}`, `最大值與最小值皆為 0`],
        answer: 0,
        hint: `💡 提示：觀察開口方向（二次項係數 ${coef} 的正負）。`,
        explanation: `📖 詳解：係數為 ${coef}，開口向${isMax ? '下' : '上'}，故在頂點 x=${x0} 處有${extType} ${y0}。`
      };
    } else {
      const radius = Math.floor(rand() * 5) + 3; // 3~7
      const angle = [60, 90, 120, 180][Math.floor(rand()*4)];
      const fraction = angle / 360;
      const area = (radius * radius * fraction).toFixed(1) + 'π';
      const w1 = (radius * 2 * fraction).toFixed(1) + 'π';
      const w2 = (radius * radius).toFixed(1) + 'π';
      const w3 = (radius * radius * fraction * 2).toFixed(1) + 'π';
      
      return {
        question: `【圓與扇形】${preamble}\n在半徑為 ${radius} 的圓中，圓心角為 ${angle}° 的扇形面積為多少？`,
        options: [area, w1, w2, w3],
        answer: 0,
        hint: `💡 提示：扇形面積 = 半徑平方 × π × (圓心角/360)。`,
        explanation: `📖 詳解：面積 = ${radius}² × π × (${angle}/360) = ${area}。`
      };
    }
  }

  // Fallback 動態融合
  const fallbacks = [
    `請問在處理「${conceptTag}」的數學問題時，下列哪一個觀念是正確的？`,
    `如果考卷上出現關於「${conceptTag}」的題型，最關鍵的解題步驟是什麼？`,
    `針對「${conceptTag}」，小華總是會搞混，下列哪句話能幫他釐清觀念？`
  ];
  const fbText = fallbacks[Math.floor(rand() * fallbacks.length)];
  return {
    question: `【觀念綜合題】${preamble}\n${fbText}`,
    options: ['符合單元核心數學定義的敘述', '常見的計算錯誤迷思', '公式背錯的結果', '完全不相干的幾何觀念'],
    answer: 0,
    hint: '💡 提示：回憶課本定義。',
    explanation: `📖 詳解：這是一道動態素養題，檢驗基本觀念。`
  };
}
