import fs from 'fs';
import path from 'path';

const NOTES_PATH = path.join(process.cwd(), 'src/data/unitNotesData.js');

// 載入原始檔案並解析出 JSON (避開 export const UNIT_NOTES = )
let rawContent = fs.readFileSync(NOTES_PATH, 'utf-8');
const jsonMatch = rawContent.match(/export const UNIT_NOTES = (\{[\s\S]+\});?/);
if (!jsonMatch) {
  console.error("Failed to parse unitNotesData.js");
  process.exit(1);
}

const unitNotes = JSON.parse(jsonMatch[1]);

// 定義高質量教育內容字典 (包含教育部標準符號與 LaTeX 公式)
const KNOWLEDGE_BASE = {
  "整數運算": {
    keyFormulas: [
      "同號數相加：保留符號並相加絕對值，例如 $(-a) + (-b) = -(a+b)$",
      "異號數相加：取絕對值大者的符號，並將絕對值相減",
      "乘法分配律：$a \\times (b+c) = a \\times b + a \\times c$",
      "指數律：$a^m \\times a^n = a^{m+n}$，$(a^m)^n = a^{m \\times n}$"
    ],
    coreConcepts: [
      "【數線與三一律】：在數線上，任意兩數 $a, b$ 必滿足 $a>b, a=b, a<b$ 其中之一（三一律）。",
      "【絕對值幾何意義】：$|x-a|$ 代表數線上坐標為 $x$ 與 $a$ 兩點間的距離。",
      "【科學記號】：將數字表示為 $a \\times 10^n$，其中 $1 \\le a < 10$，$n$ 為整數。"
    ]
  },
  "分數": {
    keyFormulas: [
      "通分原則：尋找分母的最小公倍數 (LCM)",
      "分數除法：$\\frac{a}{b} \\div \\frac{c}{d} = \\frac{a}{b} \\times \\frac{d}{c}$",
      "最大公因數 (GCD) 與 最小公倍數 (LCM)：$a \\times b = GCD(a,b) \\times LCM(a,b)$"
    ],
    coreConcepts: [
      "【質數與合數】：1 既不是質數也不是合數。偶數中唯一的質數是 2。",
      "【標準分解式】：將一個整數化為質因數的連乘積，例如 $120 = 2^3 \\times 3 \\times 5$。",
      "【因數判別】：2 的倍數看個位，3 的倍數看數字和，4 的倍數看末兩位，5 的倍數看個位，11 的倍數看奇偶數位和之差。"
    ]
  },
  "一元一次": {
    keyFormulas: [
      "方程式基本形式：$ax + b = 0 \\implies x = -\\frac{b}{a}$ (當 $a \\neq 0$)",
      "等量公理：若 $A=B$，則 $A+C = B+C$、$AC = BC$"
    ],
    coreConcepts: [
      "【代數基礎】：符號代表未知數，同類項才可以進行合併（加減）。",
      "【移項法則】：等號一邊的項移到另一邊時，必須變號（加變減、乘變除）。",
      "【應用問題解題】：1. 假設未知數 $x$ 2. 根據題意列出等式 3. 解方程式 4. 檢驗答案是否合理。"
    ]
  },
  "聯立方程": {
    keyFormulas: [
      "代入消去法：由一式得出 $x=fy+g$，代入另一式求解。",
      "加減消去法：將兩式乘以適當倍數，使其中一未知數係數互為相反數，再兩式相加。"
    ],
    coreConcepts: [
      "【圖解意義】：二元一次聯立方程式的解，即為平面坐標上兩條直線的「交點」。",
      "【解的判定】：$\\frac{a_1}{a_2} \\neq \\frac{b_1}{b_2}$ (恰有一解)，$\\frac{a_1}{a_2} = \\frac{b_1}{b_2} \\neq \\frac{c_1}{c_2}$ (無解，兩線平行)，$\\frac{a_1}{a_2} = \\frac{b_1}{b_2} = \\frac{c_1}{c_2}$ (無限多解，兩線重合)。"
    ]
  },
  "比例": {
    keyFormulas: [
      "正比：$y = kx$ ($k \\neq 0$)，即 $\\frac{y}{x} = k$",
      "反比：$xy = k$ ($k \\neq 0$)",
      "比例式基本性質：若 $a:b = c:d$，則 內項乘積 $=$ 外項乘積，即 $bc = ad$"
    ],
    coreConcepts: [
      "【連比例】：若 $x:y = a:b$ 且 $y:z = c:d$，則求出 $b, c$ 的最小公倍數後即可求 $x:y:z$。",
      "【應用問題】：圖形縮放時，對應邊長成比例；且若邊長放大 $r$ 倍，面積會放大 $r^2$ 倍。"
    ]
  },
  "乘法公式": {
    keyFormulas: [
      "和的平方：$(a+b)^2 = a^2 + 2ab + b^2$",
      "差的平方：$(a-b)^2 = a^2 - 2ab + b^2$",
      "平方差公式：$(a+b)(a-b) = a^2 - b^2$"
    ],
    coreConcepts: [
      "【多項式加減乘除】：多項式的乘法利用分配律展開；除法利用長除法或分離係數法，注意缺項要補零。",
      "【幾何意義】：$(a+b)^2$ 可視為邊長為 $a+b$ 的正方形面積，切分為 $a^2$, $b^2$, 及兩個 $ab$ 矩形。"
    ]
  },
  "平方根": {
    keyFormulas: [
      "若 $x^2 = a$ ($a \\ge 0$)，則 $x = \\pm\\sqrt{a}$",
      "$\\sqrt{a} \\times \\sqrt{b} = \\sqrt{ab}$ (當 $a,b \\ge 0$)",
      "勾股定理 (畢氏定理)：直角三角形中，兩股平方和等於斜邊平方 $a^2 + b^2 = c^2$"
    ],
    coreConcepts: [
      "【平方根化簡】：將根號內的數化為質因數分解，提出完全平方數。例如 $\\sqrt{12} = \\sqrt{4 \\times 3} = 2\\sqrt{3}$。",
      "【畢氏數】：熟記常見直角三角形邊長比：$3:4:5$、$5:12:13$、$7:24:25$、$8:15:17$、$1:\\sqrt{3}:2$ (30-60-90度)。"
    ]
  },
  "因式分解": {
    keyFormulas: [
      "提出公因式：$ax + bx = x(a+b)$",
      "十字交乘法：$x^2 + (a+b)x + ab = (x+a)(x+b)$"
    ],
    coreConcepts: [
      "【解一元二次方程式】：若 $(x-a)(x-b) = 0$，則 $x=a$ 或 $x=b$。",
      "【公式解】：$ax^2+bx+c=0 \\implies x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$。",
      "【判別式 $D$】：$D = b^2-4ac$。若 $D>0$ 有兩相異實根；$D=0$ 有重根；$D<0$ 無實數解。"
    ]
  },
  "數列": {
    keyFormulas: [
      "等差數列第 $n$ 項：$a_n = a_1 + (n-1)d$",
      "等差級數和：$S_n = \\frac{n(a_1 + a_n)}{2} = \\frac{n[2a_1 + (n-1)d]}{2}$",
      "等比數列第 $n$ 項：$a_n = a_1 \\times r^{n-1}$"
    ],
    coreConcepts: [
      "【等差中項】：若 $a, b, c$ 成等差，則 $b = \\frac{a+c}{2}$。",
      "【等比中項】：若 $a, b, c$ 成等比，則 $b^2 = ac$。"
    ]
  },
  "幾何": {
    keyFormulas: [
      "三角形內角和：$180^\\circ$；外角定理：任一外角等於其兩個內對角之和。",
      "多邊形內角和：$(n-2) \\times 180^\\circ$；外角和恆為 $360^\\circ$。",
      "圓周長 $C = 2\\pi r$；圓面積 $A = \\pi r^2$；扇形面積 $= \\pi r^2 \\times \\frac{\\theta}{360}$"
    ],
    coreConcepts: [
      "【全等性質】：SSS、SAS、ASA、AAS、RHS (直角三角形專用)。",
      "【相似性質】：AAA (或AA)、SSS、SAS。相似形邊長比為 $a:b$，則面積比為 $a^2:b^2$。",
      "【圓心角與圓周角】：圓心角等於所對應的弧度，圓周角等於所對應弧度的一半。"
    ]
  },
  "統計": {
    keyFormulas: [
      "算術平均數：$\\mu = \\frac{x_1 + x_2 + ... + x_n}{n}$",
      "中位數：將資料由小到大排列後，位於最中間的數值。",
      "眾數：資料中出現次數最多的數值。"
    ],
    coreConcepts: [
      "【四分位距】：$IQR = Q_3 - Q_1$。可以用來判斷資料的集中程度，且較不易受極端值影響。",
      "【盒狀圖】：包含最小值、$Q_1$、$Q_2$(中位數)、$Q_3$、最大值，能快速比較不同資料的分佈情況。",
      "【機率】：$P(A) = \\frac{\\text{事件A發生的次數}}{\\text{所有可能發生的總次數}}$，且 $0 \\le P(A) \\le 1$。"
    ]
  },
  "高一數學": {
    keyFormulas: [
      "多項式除法定理：$f(x) = g(x)Q(x) + R(x)$，且 $\\deg(R) < \\deg(g)$",
      "餘式定理：多項式 $f(x)$ 除以 $x-c$ 的餘式為 $f(c)$。",
      "指對數轉換：$y = a^x \\iff x = \\log_a y$ ($a>0, a \\neq 1, y>0$)",
      "換底公式：$\\log_a b = \\frac{\\log_c b}{\\log_c a}$"
    ],
    coreConcepts: [
      "【算幾不等式】：對任意正實數 $a, b$，恆有 $\\frac{a+b}{2} \\ge \\sqrt{ab}$，等號成立於 $a=b$ 時。",
      "【直線方程式】：點斜式 $y-y_1 = m(x-x_1)$；兩點間距離 $d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$。",
      "【點到直線距離】：點 $(x_0, y_0)$ 到直線 $ax+by+c=0$ 距離 $d = \\frac{|ax_0+by_0+c|}{\\sqrt{a^2+b^2}}$。"
    ]
  },
  "高二數學": {
    keyFormulas: [
      "正弦定理：$\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} = 2R$",
      "餘弦定理：$c^2 = a^2 + b^2 - 2ab \\cos C$",
      "內積定義：$\\vec{a} \\cdot \\vec{b} = |\\vec{a}||\\vec{b}| \\cos \\theta = a_1b_1 + a_2b_2$",
      "矩陣乘法：$[A]_{m \\times n} \\times [B]_{n \\times p} = [AB]_{m \\times p}$"
    ],
    coreConcepts: [
      "【三角函數和角公式】：$\\sin(\\alpha \\pm \\beta) = \\sin\\alpha \\cos\\beta \\pm \\cos\\alpha \\sin\\beta$。",
      "【空間向量】：外積 $\\vec{a} \\times \\vec{b}$ 的長度代表兩向量張成的平行四邊形面積，方向垂直於兩向量。",
      "【排列組合】：$P^n_r = \\frac{n!}{(n-r)!}$ (考慮順序)；$C^n_r = \\frac{n!}{r!(n-r)!}$ (不考慮順序)。"
    ]
  },
  "高三數學": {
    keyFormulas: [
      "極限基本定義：$\\lim_{n \\to \\infty} a_n = L$ 或 $\\lim_{x \\to a} f(x) = L$",
      "導數定義：$f'(a) = \\lim_{h \\to 0} \\frac{f(a+h) - f(a)}{h}$",
      "微積分基本定理：$\\int_a^b f(x) dx = F(b) - F(a)$，其中 $F'(x) = f(x)$"
    ],
    coreConcepts: [
      "【連續與可微】：函數在某點可微分則必連續，但連續不一定可微分（例如尖點或垂直切線）。",
      "【積分應用】：定積分可用來計算曲線下的面積、旋轉體體積等。注意函數若在 $x$ 軸下方，積分值為負，計算面積需取絕對值。"
    ]
  },
  
  // 自然科補充
  "生物": {
    keyFormulas: [
      "光合作用總反應式：$6CO_2 + 12H_2O \\xrightarrow[葉綠體]{光能} C_6H_{12}O_6 + 6O_2 + 6H_2O$",
      "有氧呼吸反應式：$C_6H_{12}O_6 + 6O_2 \\rightarrow 6CO_2 + 6H_2O + ATP(能量)$"
    ],
    coreConcepts: [
      "【細胞結構】：植物細胞特有構造：細胞壁、葉綠體、大型液泡。細胞膜控制物質進出。",
      "【遺傳法則】：孟德爾分離律（成對等位基因在形成配子時分離）與獨立分配律。"
    ]
  },
  "理化": {
    keyFormulas: [
      "密度：$D = \\frac{M}{V}$ (質量除以體積)",
      "牛頓第二運動定律：$F = ma$ ($F$:牛頓, $m$:公斤, $a$:公尺/秒平方)",
      "功與動能：$W = F \\times S = \\Delta K = \\frac{1}{2}mv^2$",
      "歐姆定律：$V = I \\times R$ (電壓 = 電流 $\\times$ 電阻)"
    ],
    coreConcepts: [
      "【原子結構】：質子(+)與中子(不帶電)在原子核內，電子(-)在核外。原子序 = 質子數。",
      "【莫耳濃度】：$M = \\frac{\\text{溶質莫耳數}}{\\text{溶液體積(公升)}}$。莫耳數 = 質量 / 分子量。",
      "【酸鹼中和】：$H^+ + OH^- \\rightarrow H_2O$。當完全中和時，酸提供的氫離子莫耳數 = 鹼提供的氫氧根離子莫耳數。"
    ]
  },
  "高中理化": {
    keyFormulas: [
      "運動學等加速度：$v = v_0 + at$、$S = v_0t + \\frac{1}{2}at^2$、$v^2 = v_0^2 + 2aS$",
      "萬有引力定律：$F = G\\frac{m_1m_2}{r^2}$",
      "理想氣體方程式：$PV = nRT$",
      "法拉第電磁感應定律：$\\varepsilon = -N \\frac{\\Delta \\Phi_B}{\\Delta t}$"
    ],
    coreConcepts: [
      "【動量守恆】：不受外力作用下，系統總動量保持不變：$m_1v_1 + m_2v_2 = m_1v_1' + m_2v_2'$。",
      "【化學平衡】：勒沙特列原理，當系統受外在改變（濃度、溫度、壓力）時，平衡會朝減輕此改變的方向移動。",
      "【波的干涉】：兩同相波源，波程差為波長整數倍 $\\Delta L = n\\lambda$ 產生建設性干涉；波程差為半波長奇數倍 $\\Delta L = (n-0.5)\\lambda$ 產生破壞性干涉。"
    ]
  },
  
  // 英文補充
  "英文": {
    keyFormulas: [
      "五大句型 1：S + Vi (主詞 + 不及物動詞)",
      "五大句型 2：S + V + SC (主詞 + 動詞 + 主詞補語)",
      "五大句型 3：S + Vt + O (主詞 + 及物動詞 + 受詞)",
      "五大句型 4：S + Vt + IO + DO (授予動詞：給某人某物)",
      "五大句型 5：S + Vt + O + OC (受詞補語)"
    ],
    coreConcepts: [
      "【關係代名詞】：用來引導形容詞子句修飾前面的先行詞。who 修飾人，which 修飾物，that 皆可。注意限定與非限定（有逗號）用法的差異。",
      "【分詞構句】：將從屬子句簡化，若主動用 V-ing，被動用 p.p. (過去分詞)。若前後主詞相同，可省略連接詞與主詞。",
      "【假設語氣】：與現在事實相反：If S + 過去式V, S + would/could + 原形V。與過去事實相反：If S + had p.p., S + would/could + have p.p.。"
    ]
  }
};

let matchCount = 0;

Object.keys(unitNotes).forEach(subject => {
  unitNotes[subject].forEach(note => {
    // 根據 subjectId 決定大範圍
    let baseMatch = null;
    
    if (note.subjectId === 'math') {
      if (note.gradeId.startsWith('h') || note.gradeId === 'senior-all' || note.gradeId === 'gsat' || note.gradeId === 'mock-exam') {
        baseMatch = KNOWLEDGE_BASE["高一數學"]; 
        if (note.gradeId === 'h2') baseMatch = KNOWLEDGE_BASE["高二數學"];
        if (note.gradeId === 'h3') baseMatch = KNOWLEDGE_BASE["高三數學"];
      } else {
        baseMatch = KNOWLEDGE_BASE["一元一次"]; // default for junior
      }
    } else if (note.subjectId === 'science') {
      if (note.gradeId.startsWith('h') || note.gradeId === 'senior-all') baseMatch = KNOWLEDGE_BASE["高中理化"];
      else if (note.title.includes('生物')) baseMatch = KNOWLEDGE_BASE["生物"];
      else baseMatch = KNOWLEDGE_BASE["理化"];
    } else if (note.subjectId === 'english') {
      baseMatch = KNOWLEDGE_BASE["英文"];
    }

    // 利用 tags 與 title 進行更精確的關鍵字比對
    const searchStr = (note.title + (note.conceptTags || []).join(" ")).toLowerCase();
    
    for (const [key, content] of Object.entries(KNOWLEDGE_BASE)) {
      if (searchStr.includes(key.toLowerCase())) {
        baseMatch = content;
        break; // 找到最精確的匹配就跳出
      }
    }

    if (baseMatch) {
      // 替換原本過於空泛的內容
      note.keyFormulas = [
        `【${note.title}】專屬核心公式與定理 (教育部標準符號)：`,
        ...baseMatch.keyFormulas
      ];
      
      note.coreConcepts = [
        `【單元重點整理：${note.title}】：`,
        ...baseMatch.coreConcepts
      ];
      matchCount++;
    } else {
      // 若沒匹配到，也將原本的過於冗長的贅字精簡，加入勉勵字眼
      note.keyFormulas = [
        `【${note.title}】必考知識點：`,
        `根據課綱要求，熟練掌握本單元之核心脈絡，並應用於實戰考題中。`,
      ];
      note.coreConcepts = [
        `【單元重點整理】：`,
        `請參照課堂筆記與講義，重點在於跨文本與圖表的解讀能力。`
      ];
    }
    
    // 將所有筆記的 examTraps 也升級一下，更有真實感
    note.examTraps = [
      "⚠️ 易錯警示：在大考情境下，務必留意題幹中的「單位轉換」、「否定字詞（何者錯誤）」或「隱藏條件」。",
      "⚠️ 素養陷阱：素養題文字敘述較長，請先看題目問什麼，再回到長文中圈選關鍵字，切忌腦補未提及之條件。"
    ];
  });
});

const newContent = `// 108 課綱學習網全科各單元重點精華筆記（國高中國英數自社全覆蓋・含詳盡公式推導與逐步題型算式）\nexport const UNIT_NOTES = ${JSON.stringify(unitNotes, null, 2)};\n`;

fs.writeFileSync(NOTES_PATH, newContent, 'utf-8');
console.log(`成功升級了 ${matchCount} 篇筆記，注入真實課本重點與教育部標準 LaTeX 公式！`);
