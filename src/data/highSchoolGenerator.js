// 高中題庫生成器 (High School Question Generator)
// 包含高一、高二、高三、學測 (GSAT)、模擬考 (Mock Exam)、競賽 (Olympiad)
// 使用教育部規範之標準符號與標準 LaTeX 數學/化學格式

export function generateHighSchoolQuestion(subjectId, gradeId, unitId, index, difficulty, rand, conceptTag) {
  const seed = (Math.abs(index) * 9301 + 49297) % 233280;
  const rnd = () => {
    let r = Math.sin(seed + (rand ? rand() : 0.5) * 1000) * 10000;
    return r - Math.floor(r);
  };
  const rVal = rnd();

  // 根據學科分流
  switch (subjectId) {
    case 'math':
      return generateHighSchoolMath(gradeId, unitId, index, difficulty, rnd, conceptTag);
    case 'english':
      return generateHighSchoolEnglish(gradeId, unitId, index, difficulty, rnd, conceptTag);
    case 'science':
      return generateHighSchoolScience(gradeId, unitId, index, difficulty, rnd, conceptTag);
    case 'social':
      return generateHighSchoolSocial(gradeId, unitId, index, difficulty, rnd, conceptTag);
    case 'chinese':
      return generateHighSchoolChinese(gradeId, unitId, index, difficulty, rnd, conceptTag);
    default:
      return generateHighSchoolMath(gradeId, unitId, index, difficulty, rnd, conceptTag);
  }
}

// ── 高中數學 ──
function generateHighSchoolMath(gradeId, unitId, index, difficulty, rnd, conceptTag) {
  const isExam = gradeId === 'gsat' || gradeId === 'mock-exam' || gradeId === 'olympiad';
  const tag = gradeId === 'gsat' ? '【學測真題】' : gradeId === 'mock-exam' ? '【全模精選】' : gradeId === 'olympiad' ? '【能力競賽】' : '【高中數學】';

  // 1. 高一核心題型（多項式、指對數、直線與圓、數據分析）
  const h1Pool = [
    () => {
      const a = 2 + Math.floor(rnd() * 3);
      const b = 3 + Math.floor(rnd() * 3);
      const rootSum = a + b;
      const rootProd = a * b;
      return {
        question: `${tag}【多項式與餘式定理】設多項式 $f(x)$ 除以 $x-${a}$ 的餘式為 ${a * 2}，除以 $x-${b}$ 的餘式為 ${b * 3}。若 $f(x)$ 除以 $(x-${a})(x-${b})$ 的餘式為 $ax+b$，則此餘式為何？`,
        options: [
          `$${(b * 3 - a * 2) / (b - a)}x + ${a * 2 - a * ((b * 3 - a * 2) / (b - a))}$`,
          `$${a}x + ${b}$`,
          `$${rootSum}x - ${rootProd}$`,
          `$2x + 5$`
        ],
        answer: 0,
        hint: `💡 提示：設餘式為 $R(x) = px + q$。由餘式定理：$f(${a}) = ${a}p + q = ${a * 2}$，且 $f(${b}) = ${b}p + q = ${b * 3}$，解二元一次聯立方程式。`,
        explanation: `📖 詳解：設 $f(x) = (x-${a})(x-${b})Q(x) + (px + q)$。代入 $x=${a}$ 得 $f(${a}) = ${a}p+q=${a * 2}$；代入 $x=${b}$ 得 $f(${b}) = ${b}p+q=${b * 3}$。兩式相減解得斜率 $p = ${(b * 3 - a * 2) / (b - a)}$，常數項 $q = ${a * 2 - a * ((b * 3 - a * 2) / (b - a))}$。`
      };
    },
    () => {
      const base = 2;
      const exp1 = 3 + Math.floor(rnd() * 3);
      const val = Math.pow(base, exp1);
      return {
        question: `${tag}【指數與對數函數】已知 $\\log_{10} 2 \\approx 0.3010$，$\\log_{10} 3 \\approx 0.4771$。請問 $2^{${exp1 * 10}}$ 是幾位數？其最高位數字為何？`,
        options: [
          `為 ${Math.floor(exp1 * 10 * 0.3010) + 1} 位數，最高位數字為 ${Math.pow(10, (exp1 * 10 * 0.3010) % 1) < 2 ? 1 : Math.pow(10, (exp1 * 10 * 0.3010) % 1) < 3 ? 2 : 3}`,
          `為 ${Math.floor(exp1 * 10 * 0.3010)} 位數，最高位數字為 5`,
          `為 ${Math.floor(exp1 * 10 * 0.3010) + 2} 位數，最高位數字為 8`,
          `為 ${exp1 * 10} 位數，最高位數字為 2`
        ],
        answer: 0,
        hint: `💡 提示：取常用對數 $\\log_{10}(2^{${exp1 * 10}}) = ${exp1 * 10} \\times \\log_{10} 2 = ${exp1 * 10} \\times 0.3010 = ${(exp1 * 10 * 0.3010).toFixed(4)}$。整數部分加 1 即為位數，由小數部分判斷首位數字。`,
        explanation: `📖 詳解：$\\log_{10}(2^{${exp1 * 10}}) = ${(exp1 * 10 * 0.3010).toFixed(4)}$。整數首數為 ${Math.floor(exp1 * 10 * 0.3010)}，故為 ${Math.floor(exp1 * 10 * 0.3010) + 1} 位數。小數尾數為 ${(exp1 * 10 * 0.3010 % 1).toFixed(4)}$，對照對數表估計可得最高位數字。`
      };
    },
    () => {
      const r = 3 + Math.floor(rnd() * 3);
      const k = 5;
      return {
        question: `${tag}【直線與圓方程式】在平面坐標系中，直線 $L: 3x - 4y + k = 0$ 與圓 $C: x^2 + y^2 = ${r * r}$ 相切，已知 $k > 0$，則常數 $k$ 之值為何？`,
        options: [
          `$k = ${5 * r}$`,
          `$k = ${4 * r}$`,
          `$k = ${3 * r}$`,
          `$k = ${2 * r}$`
        ],
        answer: 0,
        hint: `💡 提示：圓心至切線的垂直距離等於圓半徑 $r$。圓心為原點 $(0, 0)$，點線距公式 $d = \\frac{|3(0) - 4(0) + k|}{\\sqrt{3^2 + (-4)^2}} = \\frac{|k|}{5} = ${r}$。`,
        explanation: `📖 詳解：由點到直線距離公式：$d(O, L) = \\frac{|k|}{\\sqrt{3^2 + 4^2}} = \\frac{|k|}{5}$。因直線與圓相切，故 $d = r = ${r} \\Rightarrow |k| = 5 \\times ${r} = ${5 * r}$。因已知 $k > 0$，故 $k = ${5 * r}$。`
      };
    }
  ];

  // 2. 高二核心題型（向量、空間、三角函數、機率統計、矩陣）
  const h2Pool = [
    () => {
      const ux = 1, uy = 2, uz = -1;
      const vx = 2, vy = -1, vz = 1;
      const dotProd = ux * vx + uy * vy + uz * vz;
      return {
        question: `${tag}【空間向量與內積夾角】在空間坐標中，向量 $\\vec{u} = (${ux}, ${uy}, ${uz})$，$\\vec{v} = (${vx}, ${vy}, ${vz})$。若 $\\theta$ 為兩向量之夾角，則 $\\cos\\theta$ 之值為何？`,
        options: [
          `$\\cos\\theta = \\frac{${dotProd}}{\\sqrt{6} \\cdot \\sqrt{6}} = ${dotProd / 6}$`,
          `$\\cos\\theta = \\frac{1}{2}$`,
          `$\\cos\\theta = \\frac{\\sqrt{3}}{2}$`,
          `$\\cos\\theta = 0$`
        ],
        answer: 0,
        hint: `💡 提示：向量內積公式 $\\vec{u} \\cdot \\vec{v} = |\\vec{u}| |\\vec{v}| \\cos\\theta$。先計算內積與兩向量長度。`,
        explanation: `📖 詳解：$\\vec{u} \\cdot \\vec{v} = (1)(2) + (2)(-1) + (-1)(1) = 2 - 2 - 1 = -1$。長度 $|\\vec{u}| = \\sqrt{1^2+2^2+(-1)^2} = \\sqrt{6}$，$|\\vec{v}| = \\sqrt{2^2+(-1)^2+1^2} = \\sqrt{6}$。故 $\\cos\\theta = \\frac{-1}{\\sqrt{6}\\cdot\\sqrt{6}} = -\\frac{1}{6}$。`
      };
    },
    () => {
      return {
        question: `${tag}【條件機率與貝氏定理】某罕見疾病檢驗試劑之準確率如下：患病者檢驗呈陽性反應之機率為 $99\\%$，未患病者呈陰性反應之機率為 $95\\%$。若某地區民眾該疾病之盛行率為 $1\\%$，則一名檢驗結果呈陽性之民眾，實際上「真正患病」的條件機率約為多少？`,
        options: [
          `約 $16.6\\%$ (小於 $20\\%$)`,
          `約 $99\\%$`,
          `約 $95\\%$`,
          `約 $50\\%$`
        ],
        answer: 0,
        hint: `💡 提示：貝氏定理：$P(\\text{患病}|\\text{陽性}) = \\frac{P(\\text{患病}) \\times P(\\text{陽性}|\\text{患病})}{P(\\text{患病}) \\times P(\\text{陽性}|\\text{患病}) + P(\\text{未患病}) \\times P(\\text{陽性}|\\text{未患病})}$。`,
        explanation: `📖 詳解：設患病事件為 $D$，陽性為 $+$。$P(D) = 0.01, P(D') = 0.99$。檢驗為陽性的全機率為 $P(+) = 0.01 \\times 0.99 + 0.99 \\times 0.05 = 0.0099 + 0.0495 = 0.0594$。由貝氏定理：$P(D|+) = \\frac{0.0099}{0.0594} = \\frac{1}{6} \\approx 16.67\\%$。此為著名的學測素養假陽性陷阱題！`
      };
    },
    () => {
      return {
        question: `${tag}【馬可夫鏈與轉移矩陣】某系統由狀態 A 與狀態 B 組成，轉移矩陣為 $P = \\begin{pmatrix} 0.7 & 0.2 \\\\ 0.3 & 0.8 \\end{pmatrix}$。若系統經過長期轉移達到穩定狀態 $\\begin{pmatrix} x \\\\ y \\end{pmatrix}$，則穩定狀態下的比例 $x : y$ 為何？`,
        options: [
          `$2 : 3$ (即 $x = 0.4, y = 0.6$)`,
          `$7 : 8$`,
          `$1 : 1$`,
          `$3 : 2$`
        ],
        answer: 0,
        hint: `💡 提示：穩定狀態滿足 $P \\begin{pmatrix} x \\\\ y \\end{pmatrix} = \\begin{pmatrix} x \\\\ y \\end{pmatrix}$ 且 $x + y = 1$。`,
        explanation: `📖 詳解：展開矩陣方程：$0.7x + 0.2y = x \\Rightarrow 0.2y = 0.3x \\Rightarrow \\frac{x}{y} = \\frac{0.2}{0.3} = \\frac{2}{3}$。配合 $x+y=1$，解得 $x = \\frac{2}{5} = 0.4, y = \\frac{3}{5} = 0.6$。`
      };
    }
  ];

  // 3. 高三微積分與極限
  const h3Pool = [
    () => {
      return {
        question: `${tag}【極限與導數定義】求極限值 $\\lim_{x \\to 2} \\frac{x^3 - 8}{x - 2}$ 之值為何？`,
        options: [
          `12`,
          `8`,
          `4`,
          `極限不存在`
        ],
        answer: 0,
        hint: `💡 提示：因式分解分子：$x^3 - 8 = (x - 2)(x^2 + 2x + 4)$。約分消除 $\\frac{0}{0}$ 不定型。亦可利用導函數定義或羅必達法則。`,
        explanation: `📖 詳解：$\\lim_{x \\to 2} \\frac{(x - 2)(x^2 + 2x + 4)}{x - 2} = \\lim_{x \\to 2} (x^2 + 2x + 4) = 2^2 + 2(2) + 4 = 12$。`
      };
    },
    () => {
      const a = 3;
      return {
        question: `${tag}【多項式定積分與曲邊面積】計算定積分 $\\int_0^{${a}} (3x^2 - 2x + 1)\\,dx$ 之值為何？`,
        options: [
          `$${Math.pow(a, 3) - Math.pow(a, 2) + a}$`,
          `$${Math.pow(a, 3) - Math.pow(a, 2)}$`,
          `$${Math.pow(a, 3) + a}$`,
          `$27$`
        ],
        answer: 0,
        hint: `💡 提示：微積分基本定理：反導函數為 $F(x) = x^3 - x^2 + x$。計算 $F(${a}) - F(0)$。`,
        explanation: `📖 詳解：反導函數為 $\\int (3x^2 - 2x + 1)\\,dx = [x^3 - x^2 + x]_0^{${a}} = (${a}^3 - ${a}^2 + ${a}) - 0 = ${Math.pow(a, 3) - Math.pow(a, 2) + a}$。`
      };
    }
  ];

  // 4. 學測、模考、競賽壓軸題組
  const examPool = [
    () => {
      return {
        question: `${tag}【學測多選壓軸-二次曲線與光學性質】已知橢圓 $\\Gamma: \\frac{x^2}{25} + \\frac{y^2}{9} = 1$ 的兩焦點為 $F_1$ 與 $F_2$。若 $P$ 為橢圓上一點且 $\\angle F_1 P F_2 = 90^\\circ$，則 $\\Delta F_1 P F_2$ 的面積為何？`,
        options: [
          `$9$`,
          `$16$`,
          `$12$`,
          `$25$`
        ],
        answer: 0,
        hint: `💡 提示：橢圓定義 $|PF_1| + |PF_2| = 2a = 10$。直角三角形畢氏定理 $|PF_1|^2 + |PF_2|^2 = |F_1 F_2|^2 = (2c)^2$。其中 $c = \\sqrt{25 - 9} = 4$。利用乘法公式求 $|PF_1| \\cdot |PF_2|$。`,
        explanation: `📖 詳解：$a=5, b=3 \\Rightarrow c = \\sqrt{25-9} = 4$，焦距 $2c = 8$。設 $d_1 = |PF_1|, d_2 = |PF_2|$，則 $d_1 + d_2 = 10$，且 $d_1^2 + d_2^2 = 8^2 = 64$。由 $(d_1+d_2)^2 = d_1^2+d_2^2 + 2d_1 d_2 \\Rightarrow 100 = 64 + 2d_1 d_2 \\Rightarrow d_1 d_2 = 18$。故三角形面積為 $\\frac{1}{2} d_1 d_2 = \\frac{1}{2}(18) = 9$。`
      };
    },
    () => {
      return {
        question: `${tag}【奧林匹亞競賽-柯西不等式與極值】設 $x, y, z$ 為實數且滿足 $2x + 3y + 6z = 14$。求 $x^2 + y^2 + z^2$ 的最小值為多少？此時數對 $(x, y, z)$ 為何？`,
        options: [
          `最小值為 $4$，此時 $(x, y, z) = (\\frac{4}{7}, \\frac{6}{7}, \\frac{12}{7})$`,
          `最小值為 $2$，此時 $(x, y, z) = (1, 1, 1)$`,
          `最小值為 $7$，此時 $(x, y, z) = (2, 2, 1)$`,
          `最小值為 $14$`
        ],
        answer: 0,
        hint: `💡 提示：柯西不等式：$(x^2 + y^2 + z^2)(2^2 + 3^2 + 6^2) \\ge (2x + 3y + 6z)^2$。計算 $2^2 + 3^2 + 6^2 = 4 + 9 + 36 = 49$。`,
        explanation: `📖 詳解：由柯西不等式：$(x^2 + y^2 + z^2)(49) \\ge 14^2 = 196 \\Rightarrow x^2 + y^2 + z^2 \\ge \\frac{196}{49} = 4$。等號成立於 $\\frac{x}{2} = \\frac{y}{3} = \\frac{z}{6} = t$，代入得 $2(2t) + 3(3t) + 6(6t) = 49t = 14 \\Rightarrow t = \\frac{2}{7}$，得 $(x, y, z) = (\\frac{4}{7}, \\frac{6}{7}, \\frac{12}{7})$。`
      };
    }
  ];

  let pool = h1Pool;
  if (gradeId === 'h2') pool = [...h1Pool, ...h2Pool];
  else if (gradeId === 'h3') pool = [...h2Pool, ...h3Pool];
  else if (isExam) pool = [...examPool, ...h2Pool, ...h3Pool];
  else pool = [...h1Pool, ...h2Pool, ...h3Pool, ...examPool];

  return pool[Math.abs(index) % pool.length]();
}

// ── 高中英文 ──
function generateHighSchoolEnglish(gradeId, unitId, index, difficulty, rnd, conceptTag) {
  const isExam = gradeId === 'gsat' || gradeId === 'mock-exam' || gradeId === 'olympiad';
  const tag = gradeId === 'gsat' ? '【學測英文】' : gradeId === 'mock-exam' ? '【全模英文】' : gradeId === 'olympiad' ? '【英文競賽】' : '【高中英文】';

  const archetypes = [
    () => ({
      question: `${tag}【分詞構句與主被動語態】\n_____ by the devastating earthquake, the historic cathedral required extensive structural reinforcement before it could be reopened to the public.`,
      options: [
        `Severely damaged`,
        `Severely damaging`,
        `Having severely damaged`,
        `To severely damage`
      ],
      answer: 0,
      hint: `💡 提示：主詞 the historic cathedral 與動詞 damage 之間為「被動關係」（大教堂被地震嚴重損毀），故簡化為過去分詞 (V-ed) 開頭之分詞構句。`,
      explanation: `📖 詳解：原句為 "Because it was severely damaged by the earthquake, the cathedral..."，省略連接詞與同主詞後，被動態保留過去分詞 "Severely damaged"。`
    }),
    () => ({
      question: `${tag}【虛擬語氣與反事實假設】\nIf the government _____ effective flood prevention measures decades ago, thousands of citizens wouldn't be suffering from the consequences of climate extremes today.`,
      options: [
        `had implemented`,
        `implemented`,
        `has implemented`,
        `would implement`
      ],
      answer: 0,
      hint: `💡 提示：混合假設語氣（Mixed Conditional）！條件子句指「過去事實」（decades ago，需用過去完成式 had + V-p.p.），主要子句指「現在結果」（today，使用 would + 原形動詞）。`,
      explanation: `📖 詳解：條件句屬於與過去事實相反（與幾十年前相反），應使用過去完成式 had implemented；主要句與現在事實相反（今天不必受苦），故為混合時態典型學測考點。`
    }),
    () => ({
      question: `${tag}【否定副詞置於句首之倒裝句】\nSeldom _____ such an astonishing level of resilience and solidarity in the face of unprecedented natural catastrophes.`,
      options: [
        `have we witnessed`,
        `we have witnessed`,
        `we witnessed`,
        `did we witnessed`
      ],
      answer: 0,
      hint: `💡 提示：否定副詞（Seldom, Rarely, Never, Hardly, Scarcely）置於句首時，主要子句必須倒裝（助動詞/be動詞移至主詞前方）。`,
      explanation: `📖 詳解：Seldom 置於句首引導倒裝句，現在完成式之助動詞 have 移至主詞 we 之前，形成 "have we witnessed"。`
    }),
    () => ({
      question: `${tag}【學測篇章銜接與轉折詞】\nArtificial intelligence has significantly enhanced medical diagnostics; _____, ethical concerns regarding patient privacy and algorithm transparency must not be overlooked.`,
      options: [
        `nevertheless`,
        `furthermore`,
        `consequently`,
        `similarly`
      ],
      answer: 0,
      hint: `💡 提示：前後語意為對比轉折關係（前半句肯定AI助益，後半句提醒倫理隱憂），故需選表示轉折之副詞 nevertheless（然而、儘管如此）。`,
      explanation: `📖 詳解：(A) nevertheless 然而（轉折）；(B) furthermore 此外（遞進）；(C) consequently 因此（因果）；(D) similarly 同樣地（類比）。`
    }),
    () => ({
      question: `${tag}【關係代名詞非限定用法與主格/受格】\nThe groundbreaking cancer therapy, _____ clinical trials demonstrated an astonishing 85% remission rate, has recently gained expedited approval from the FDA.`,
      options: [
        `whose`,
        `which`,
        `that`,
        `what`
      ],
      answer: 0,
      hint: `💡 提示：先行詞為 The groundbreaking cancer therapy，後面名詞 clinical trials 與其具有「所有格所有關係」（該癌症療法的臨床試驗），故選 whose。`,
      explanation: `📖 詳解：whose clinical trials = the therapy's clinical trials。that 不可用於逗號後的非限定關係子句。`
    })
  ];

  return archetypes[Math.abs(index) % archetypes.length]();
}

// ── 高中自然（物理、化學、生物、地球科學）──
function generateHighSchoolScience(gradeId, unitId, index, difficulty, rnd, conceptTag) {
  const isExam = gradeId === 'gsat' || gradeId === 'mock-exam' || gradeId === 'olympiad';
  const tag = gradeId === 'gsat' ? '【學測自然】' : gradeId === 'mock-exam' ? '【全模自然】' : gradeId === 'olympiad' ? '【科學競賽】' : '【高中自然】';

  const archetypes = [
    // 物理：動量守恆與力學能
    () => ({
      question: `${tag}【物理-一維完全彈性碰撞】在光滑水平面上，質量為 $m_1 = 2\\text{ kg}$ 的木塊以初速 $v_1 = 6\\text{ m/s}$ 向右運動，與靜止質量為 $m_2 = 1\\text{ kg}$ 的木塊發生正向一維完全彈性碰撞。碰後 $m_2$ 的運動速度為何？`,
      options: [
        `$8\\text{ m/s}$ 向右`,
        `$4\\text{ m/s}$ 向右`,
        `$6\\text{ m/s}$ 向右`,
        `$2\\text{ m/s}$ 向右`
      ],
      answer: 0,
      hint: `💡 提示：一維彈性碰撞速度公式：$v_2' = \\frac{2m_1}{m_1 + m_2} v_1 + \\frac{m_2 - m_1}{m_1 + m_2} v_2$。因 $v_2 = 0$，代入得 $v_2' = \\frac{2(2)}{2+1}(6) = \\frac{4}{3} \\times 6$。`,
      explanation: `📖 詳解：由彈性碰撞公式 $v_2' = \\frac{2m_1}{m_1 + m_2} v_1 = \\frac{2 \\times 2}{2 + 1} \\times 6 = \\frac{4}{3} \\times 6 = 8\\text{ m/s}$（向右）。`
    }),
    // 化學：化學平衡與勒沙特列原理
    () => ({
      question: `${tag}【化學-哈伯法製氨與平衡移動】密閉容器中進行放熱反應：$\\text{N}_2(g) + 3\\text{H}_2(g) \\rightleftharpoons 2\\text{NH}_3(g) + 92\\text{ kJ}$。當反應達化學平衡後，下列哪一項操作能使氨氣 ($\\text{NH}_3$) 的平衡產率「顯著提高」？`,
      options: [
        `降低反應溫度，同時縮小容器體積（增加系統總壓）`,
        `升高反應溫度，同時擴大容器體積（降低總壓）`,
        `保持恆溫恆容，加入惰性氣體氦氣 ($\\text{He}$)`,
        `加入高效率鐵系催化劑`
      ],
      answer: 0,
      hint: `💡 提示：勒沙特列原理：(1) 放熱反應降低溫度，平衡向右放熱方向移動；(2) 左側氣體莫耳數為 1+3=4，右側為 2，加壓使平衡朝氣體莫耳數變少的右方移動。催化劑僅加速達平衡，不改變平衡產率。`,
      explanation: `📖 詳解：(1)降溫有利於放熱方向（右移）；(2)縮小體積加壓使反應向氣體係數和較小方向（右移），兩者皆增加 $\\text{NH}_3$ 產率。催化劑不改變平衡狀態。`
    }),
    // 生物：分子生物學中心法則與轉譯
    () => ({
      question: `${tag}【生物-分子遺傳與密碼子轉譯】某真核生物成熟 mRNA 上有一段密碼子序列為 $5'\\text{-AUG-UUC-GCA-UAA-}3'$。當核糖體完成轉譯後，合成的多肽鏈包含幾個胺基酸？`,
      options: [
        `3 個胺基酸 (AUG為起始甲硫胺酸，UAA為不編碼之終止密碼子)`,
        `4 個胺基酸`,
        `2 個胺基酸`,
        `12 個胺基酸`
      ],
      answer: 0,
      hint: `💡 提示：$5'\\text{-AUG-}3'$ 為起始密碼子（編碼甲硫胺酸 Met），$\\text{UUC}$ 編碼苯丙胺酸，$\\text{GCA}$ 編碼丙胺酸，$5'\\text{-UAA-}3'$ 為終止密碼子（不編碼任何胺基酸，由釋放因子辨識）。`,
      explanation: `📖 詳解：三聯體密碼中，AUG 編碼 1 個胺基酸，UUC 與 GCA 各編碼 1 個，UAA 為終止訊號促使核糖體次單元解離，不轉譯出胺基酸，故共合成 3 個胺基酸。`
    }),
    // 地球科學：溫鹽環流與板塊構造
    () => ({
      question: `${tag}【地科-北大西洋深層水與溫鹽環流】驅動全球大洋「溫鹽環流 (Thermohaline Circulation)」在北大西洋格陵蘭海域下沉的主要物理機制為何？`,
      options: [
        `高緯度海水因冷卻降溫且結冰析出鹽分，導致海水密度顯著增大而下沉`,
        `強烈赤道信風吹拂產生強大湧升流`,
        `海底中洋脊熱泉噴發使底層海水受熱沸騰下沉`,
        `亞熱帶蒸發旺盛使表層水比重變輕下沉`
      ],
      answer: 0,
      hint: `💡 提示：海水密度隨溫度下降、鹽度增加而增大。北大西洋高緯海域低溫加上結冰作用，使殘留海水又冷又鹹，密度達到最大而向深海下沉。`,
      explanation: `📖 詳解：北大西洋格陵蘭島附近海水因海冰形成析出鹽分（鹽度上升），加上極地嚴寒（水溫急降），形成低溫高鹽高密度水團下沉至洋底，成為深層水並驅動全球千禧尺度溫鹽環流。`
    })
  ];

  return archetypes[Math.abs(index) % archetypes.length]();
}

// ── 高中社會（歷史、地理、公民與社會）──
function generateHighSchoolSocial(gradeId, unitId, index, difficulty, rnd, conceptTag) {
  const isExam = gradeId === 'gsat' || gradeId === 'mock-exam' || gradeId === 'olympiad';
  const tag = gradeId === 'gsat' ? '【學測社會】' : gradeId === 'mock-exam' ? '【全模社會】' : gradeId === 'olympiad' ? '【人文競賽】' : '【高中社會】';

  const archetypes = [
    // 歷史：冷戰格局與第三世界不結盟
    () => ({
      question: `${tag}【歷史-冷戰局勢與萬隆會議】西元 1955 年印尼召開「萬隆會議」，亞非多個剛脫離殖民統治之新興獨立國家齊聚，倡導和平共處五項原則。此舉在國際地緣政治格局中的劃時代意義為何？`,
      options: [
        `標誌著「第三世界」崛起，主張在美蘇兩極對抗中保持中立與不結盟`,
        `正式加入北大西洋公約組織 (NATO) 接受美國軍事保護傘`,
        `全體會員國決議加入蘇聯領導之華沙公約組織`,
        `決議聯合發動針對歐洲宗主國之全球武裝遠征`
      ],
      answer: 0,
      hint: `💡 提示：不結盟運動（Non-Aligned Movement）的核心在於拒絕美蘇霸權二分法，開拓第三世界新興國家自主外交路線。`,
      explanation: `📖 詳解：萬隆會議反對帝國主義與殖民主義，倡導和平共處與反對集團對抗，開啟了「不結盟運動」與第三世界登上國際外交舞台的嶄新篇章。`
    }),
    // 地理：GIS 空間分析與環域疊圖
    () => ({
      question: `${tag}【地理-GIS 向量網格分析】政府若要選址興建一座大型區域傳染病負壓隔離醫院，要求：「距離主要斷層線緩衝 500 公尺以上」、「位於國有公有土地範圍內」、「距離省道聯外公路 1 公里以內」。在 GIS 地理資訊系統中，最核心應使用的空間分析功能為何？`,
      options: [
        `環域分析 (Buffer) 結合圖層交集疊圖分析 (Intersection Overlay)`,
        `視域分析 (Viewshed Analysis) 結合地表坡向分析`,
        `網路最短路徑分析 (Network Analysis)`,
        `地統計內插法 (Kriging Interpolation)`
      ],
      answer: 0,
      hint: `💡 提示：建立「距離某線段 X 公尺」的空間影響範圍需使用「環域 (Buffer)」；結合多個篩選條件圖層篩出交集區域需使用「疊圖 (Overlay)」。`,
      explanation: `📖 詳解：斷層與公路之距離限制需先由環域分析 (Buffer) 劃出影響半徑，再與土地權屬圖進行疊圖 (Overlay) 之布林交集運算，篩選出完全符合條件的空間候選區塊。`
    }),
    // 公民：憲法違憲審查與比例原則
    () => ({
      question: `${tag}【公民-憲法法庭判決與比例原則】憲法法庭在審查限制人民基本權利之法律是否合憲時，常運用「比例原則」進行嚴格檢驗。下列關於比例原則四大子原則審查順序與內涵，何者「完全正確」？`,
      options: [
        `目的正當性 $\\rightarrow$ 適當性原則（手段能達成目的）$\\rightarrow$ 必要性原則（侵害最小之手段）$\\rightarrow$ 狹義比例原則（衡平性）`,
        `手段愈嚴格愈合憲，無需考量是否存在其他替代手段`,
        `只要立法機關經三讀通過，司法權即不得審查手段之比例性`,
        `狹義比例原則只需考量行政機關之執法成本，不論人民權益損失`
      ],
      answer: 0,
      hint: `💡 提示：比例原則操作四階層：目的正當 $\\rightarrow$ 具適當性（有助目的） $\\rightarrow$ 最小侵害（必要性） $\\rightarrow$ 利益衡量（法益相稱性）。`,
      explanation: `📖 詳解：憲法第 23 條之實質內涵為比例原則，審查程序嚴謹遞進：手段必須具備達成目的之有效性（適當性），且在所有有效手段中必須挑選對人民權益侵害最小者（必要性），最後兩者利益衡量必須合乎相稱衡平。`
    }),
    // 公民：經濟學外部性與公共財
    () => ({
      question: `${tag}【公民-市場失靈與外部性內部化】某鋼鐵廠在煉鋼過程中排放大量未處理之工業廢氣與懸浮微粒，對鄰近居民健康造成嚴重危害，但鋼鐵廠並未對此付出代價。此現象在經濟學中屬於何種市場失靈？政府課徵「碳稅」或「空污防制費」之經濟意涵為何？`,
      options: [
        `存在負外部性（外部成本）；政府課稅使私人邊際成本提高至社會邊際成本，達成「外部性內部化」`,
        `存在正外部性；課稅促使廠商進一步擴大產量至無窮大`,
        `屬於純公共財之搭便車現象；課稅是為收歸國營`,
        `屬於天然獨占現象；課稅是為強制拆分工廠股份`
      ],
      answer: 0,
      hint: `💡 提示：工廠污染轉嫁社會負擔 = 負外部性（私人成本 < 社會成本，導致市場產量過多）。庇古稅（Pigouvian Tax）將外部成本內部化。`,
      explanation: `📖 詳解：鋼鐵廠排放廢氣造成外部成本（負外部性），使得自由市場產量大於社會最適產量。政府對污染課徵空污費或碳費，將外部成本計入生產成本中，達到外部性內部化並修正市場失靈。`
    })
  ];

  return archetypes[Math.abs(index) % archetypes.length]();
}

// ── 高中國文 ──
function generateHighSchoolChinese(gradeId, unitId, index, difficulty, rnd, conceptTag) {
  const isExam = gradeId === 'gsat' || gradeId === 'mock-exam' || gradeId === 'olympiad';
  const tag = gradeId === 'gsat' ? '【學測國文】' : gradeId === 'mock-exam' ? '【全模國文】' : gradeId === 'olympiad' ? '【國文競賽】' : '【高中國文】';

  const archetypes = [
    // 司馬遷《史記·項羽本紀·鴻門宴》
    () => ({
      question: `${tag}【經典古文-鴻門宴人物性格與情境推論】司馬遷《鴻門宴》中記載：「項王即日因留沛公與飲。項王、項伯東向坐；亞父南向坐——亞父者，范增也；沛公北向坐；張良西向侍。」根據古代室內禮儀席次尊卑規範，此座次安排反映出何種權力關係？`,
      options: [
        `東向坐（坐西朝東）為最尊貴主位，項羽自居尊位，顯露其自負倨傲且視劉邦為臣屬之權力姿態`,
        `北向坐（坐南朝北）為帝王最尊之位，項羽故意禮讓劉邦坐於上首`,
        `四人座次完全隨機入座，毫無禮俗尊卑意涵`,
        `西向侍為主人專屬之位，顯示張良實為該宴席之東道主`
      ],
      answer: 0,
      hint: `💡 提示：古代堂上座次以「東向」（坐西面東）為最尊，「南向」（坐北朝南）次之，「北向」（坐南朝北）又次之，「西向」（坐東朝西）為最卑。`,
      explanation: `📖 詳解：古代室內席次以東向為尊，北向為卑。項羽與項伯居最尊之東向，范增居南向，劉邦處卑位北向，張良甚至僅能在西向侍坐。此座次精妙烘托出鴻門宴上項羽驕矜自尊、劉邦屈居人下的緊張政治張力。`
    }),
    // 韓愈《師說》與古文運動
    () => ({
      question: `${tag}【古文名篇-韓愈《師說》論辯結構】韓愈在《師說》中提出「古之學者必有師。師者，所以傳道受業解惑也」，並痛陳唐代士大夫「恥學於師」之風氣。下列哪一項對比論證最能展現韓愈批判士大夫階層「小學而大遺」之犀利鋒芒？`,
      options: [
        `愛其子，擇師而教之；於其身也，則恥師焉。句讀之不知，惑之不解，或師焉，或不焉`,
        `孔子師郯子、萇弘、師襄、老聃，郯子之徒，其賢不及孔子`,
        `巫醫樂師百工之人，不恥相師；士大夫之族，曰師曰弟子云者，則群聚而笑之`,
        `生乎吾前，其聞道也固先乎吾，吾從而師之`
      ],
      answer: 0,
      hint: `💡 提示：「小學而大遺」指童蒙教以句讀斷句（小學），而自身關鍵的道統與解惑卻放棄向師長請益（大遺）。`,
      explanation: `📖 詳解：韓愈以士大夫為兒子請老師教「句讀童蒙」（小學），自己身有大惑卻恥於從師（大遺），犀利揭發當時士大夫階層自相矛盾之虛偽心態。`
    }),
    // 莊子《逍遙遊》哲思
    () => ({
      question: `${tag}【先秦諸子-莊子《逍遙遊》思辨】《莊子·逍遙遊》：「野馬也，塵埃也，生物之以息相吹也。天之蒼蒼，其正色邪？其遠而無所至極邪？」莊子透過大鵬展翅需「培風九萬里」與蜩鳩「搶榆枋而止」之寓言對比，意在闡發何種哲學深意？`,
      options: [
        `無論大鵬或小雀，只要有所依託（待風、待樹），皆未能達致完全超脫束縛之「無待」絕對自由逍遙之境`,
        `大鵬之境界必定高於蜩鳩，因此人應追求成為威震八方之大人物`,
        `萬物皆無須學習，人生應及時行樂且不必有所作為`,
        `世界的真相不可知，天空並非藍色只是光線折射之幻影`
      ],
      answer: 0,
      hint: `💡 提示：莊子認為「有待」（有所憑藉依賴，如列子御風、大鵬待海運）仍未得真逍遙；唯有「無己、無功、無名」，順應自然萬物之「無待」，方為至人神人之境。`,
      explanation: `📖 詳解：莊子透過大鵬與小雀之辨，指出二者雖有「小大之辯」，但本質上皆「有所待」（大鵬待六月之息，小雀待榆枋），唯有「乘天地之正，而御六氣之辯，以遊無窮者，彼且惡乎待哉」，方為真正無待之逍遙。`
    }),
    // 現代文學意象賞析
    () => ({
      question: `${tag}【現代詩意象-瘂弦〈如歌的行板〉主題詮釋】臺灣現代詩名家瘂弦〈如歌的行板〉中反覆吟誦：「溫柔之必要／肯定之必要／一點點酒和一點點銀的必要……而既被目為一條河總得繼續流下去」。此詩核心展現何種生命情懷？`,
      options: [
        `在荒謬庸碌的凡俗現實中，以寬容、溫柔與堅毅的節奏承受命運，展現對生命本質的深刻承擔與超脫`,
        `對物質財富與精緻銀器的奢華追求`,
        `強烈抗議現代都市文明對大自然河流的環境污染`,
        `主張及時行樂，沉溺於酒精與靡靡之音`
      ],
      answer: 0,
      hint: `💡 提示：詩中鋪排無數世俗的「必要」，最終收束在「河總得繼續流下去」，呈現以溫柔對抗虛無、接納存在之荒謬與流轉。`,
      explanation: `📖 詳解：瘂弦以如歌般舒緩而深沉的旋律，羅列凡俗生活細節，看似平淡卻飽含對生存苦難的洞悉，終以「河總得繼續流下去」彰顯出承擔生命韌性之高雅格調。`
    })
  ];

  return archetypes[Math.abs(index) % archetypes.length]();
}
