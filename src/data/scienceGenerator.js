// 108 課綱自然科全單元題目引擎（支援會考壓軸、科學奧林匹亞競賽、私中超難題與分級難度）
export function generateScienceQuestion(gradeId, unitId, index, difficulty = 'medium', rand, conceptTag) {
  const isExtreme = difficulty === 'extreme' || difficulty === 'hardest';
  const isHard = difficulty === 'hard';
  const uNum = parseInt(String(unitId).split('-').pop().replace('u', ''), 10) || 1;

  // 動態樂高引擎：產生情境前導詞
  const people = ['小明', '阿華', '建國', '美美', '志明', '春嬌', '大雄', '胖虎', '小夫', '靜香', '實驗室助教', '自然科探究小組'];
  const actions = ['在進行會考跨章節實驗探究時', '參加全國中小學科學展覽會與競賽時', '分析感測器所量測到的精密數據時', '探討複雜力學與電化學反應時', '研究全球氣候與天文觀測圖表時'];
  const verbs = ['發現了這項關鍵的實驗數據', '進行了深入的因果機制推論', '提出了這道極具挑戰性的題目', '提醒大家特別注意干擾變因'];
  
  const person = people[Math.floor(rand() * people.length)];
  const action = actions[Math.floor(rand() * actions.length)];
  const verb = verbs[Math.floor(rand() * verbs.length)];
  const preamble = `${person}${action}，${verb}。`;

  function getRandItems(arr, count) {
    const res = [];
    const pool = [...arr];
    for (let i = 0; i < count; i++) {
      if (pool.length === 0) break;
      const idx = Math.floor(rand() * pool.length);
      res.push(pool.splice(idx, 1)[0]);
    }
    return res;
  }

  // ==========================================
  // 1. 最難試題 (Extreme / Hardest)：會考經典壓軸、自然競賽、私中資優題
  // ==========================================
  if (isExtreme || gradeId === 'past-exams' || gradeId === 'private-school') {
    if (gradeId === 'g7' || gradeId === 'private-school') {
      // 生物跨章節與分子遺傳 (私中競賽/會考)
      return {
        isReading: true,
        readingText: `【遺傳學實驗分析】\n某植物的花色由一對等位基因控制，紫花 (R) 對白花 (r) 為顯性；種子形狀由另一對等位基因控制，圓粒 (Y) 對皺粒 (y) 為顯性，兩對基因獨立分配。\n現將一株基因型為 RrYy 的植株與一株未知基因型的植株進行雜交，子代表現型比例為「紫花圓粒 : 紫花皺粒 : 白花圓粒 : 白花皺粒 = 3 : 3 : 1 : 1」。\n${preamble}`,
        question: `【會考A++題組-雙性雜交基因型推論】請問該未知親代植株的基因型為何？`,
        options: [
          `RrYy 或 Rryy (其中 R 對 r 比例為 3:1，Y 對 y 為 1:1，故未知親代為 Rryy)`,
          `RRYy`,
          `rryy (試交)`,
          `rrYy`
        ],
        answer: 0,
        hint: `💡 提示：將兩對性狀分開討論：花色紫:白 = 6:2 = 3:1 (親代皆為 Rr)；形狀圓:皺 = 4:4 = 1:1 (親代為 Yy × yy)。`,
        explanation: `📖 詳解：\n1) 花色方面：紫:白 = (3+3):(1+1) = 6:2 = 3:1，因此兩親代的花色基因型皆必須為 Rr。\n2) 形狀方面：圓:皺 = (3+1):(3+1) = 4:4 = 1:1，此為測交比例，親代為 Yy 與 yy。\n綜合可知未知親代的基因型必為 Rryy。`
      };
    } else if (gradeId === 'g8' || gradeId === 'past-exams') {
      // 理化：浮力與密度/化學反應計量 (會考壓軸與奧賽)
      if (uNum === 5 || uNum === 6) {
        // 化學計量莫耳數
        return {
          question: `【理化競賽-化學反應限量試劑計算】${preamble}\n在密閉容器中，將 8 公克的氫氣 (H₂) 與 32 公克的氧氣 (O₂) 點火使其完全反應生成水 (H₂O)。已知原子量 H=1，O=16。\n反應完成並冷卻至室溫後，容器內剩餘的氣體種類及其質量為何？`,
          options: [
            `剩餘 4 公克的氫氣 (H₂)`,
            `剩餘 2 公克的氫氣 (H₂) 與 16 公克的氧氣`,
            `剩餘 8 公克的氧氣 (O₂)`,
            `恰好完全反應，無任何氣體剩餘`
          ],
          answer: 0,
          hint: `💡 提示：反應式為 2H₂ + O₂ → 2H₂O。莫耳數比 H₂:O₂ = 2:1。計算何者為限量試劑。`,
          explanation: `📖 詳解：\n1) 氫氣莫耳數 = 8 / 2 = 4 mol；氧氣莫耳數 = 32 / 32 = 1 mol。\n2) 根據反應式 2H₂ + O₂ → 2H₂O，1 mol O₂ 僅需消耗 2 mol H₂。\n3) 因此氧氣完全耗盡，剩餘氫氣莫耳數 = 4 - 2 = 2 mol。\n4) 剩餘氫氣質量 = 2 mol × 2 g/mol = 4 公克。（生成的水在室溫下為液體）。`
        };
      } else {
        // 浮力阿基米德原理
        return {
          question: `【會考經典-阿基米德浮力多層液體】${preamble}\n有一密度為 0.8 g/cm³、體積為 500 cm³ 的實心木塊，漂浮於水面上（水的密度為 1.0 g/cm³）。現若緩緩加入密度為 0.6 g/cm³ 的油直到完全覆蓋木塊（油水互不相溶）。\n當木塊再度達到靜止平衡時，木塊受到的「總浮力」大小為多少 gw？`,
          options: [
            `400 gw`,
            `500 gw`,
            `300 gw`,
            `480 gw`
          ],
          answer: 0,
          hint: `💡 提示：無論木塊浸在何種液體中，只要木塊處於浮體平衡狀態，其所受總浮力必等於物體總重。`,
          explanation: `📖 詳解：木塊處於浮體狀態（兩液體密度皆小於/大於木塊，達到懸浮或浮體平衡），合力為零。總浮力 B = 物體總重 W = 500 cm³ × 0.8 g/cm³ = 400 gw。`
        };
      }
    } else {
      // 國三 (g9) 牛頓力學 v-t 圖與天文四季 (會考壓軸)
      return {
        isReading: true,
        readingText: `【會考經典-運動學與牛頓第二運動定律】\n一質量為 2 kg 的物體在光滑水平面上由靜止受水平外力推動，其速度-時間關係 (v-t圖) 如下：\n- 0 到 4 秒：速度由 0 均勻增加到 12 m/s\n- 4 到 8 秒：速度維持 12 m/s 等速運動\n- 8 到 10 秒：受到反向阻力，速度在 2 秒內均勻減速至 0 停止。\n${preamble}`,
        question: `【跨觀念力學計算】請問此物體在 0 到 10 秒內的「總位移」與 8 到 10 秒所受的「合力大小」分別為何？`,
        options: [
          `總位移 84 公尺，合力大小 12 牛頓`,
          `總位移 96 公尺，合力大小 6 牛頓`,
          `總位移 72 公尺，合力大小 24 牛頓`,
          `總位移 84 公尺，合力大小 6 牛頓`
        ],
        answer: 0,
        hint: `💡 提示：v-t 圖與時間軸所夾梯形面積代表位移；合力 F = ma，a = Δv/Δt。`,
        explanation: `📖 詳解：\n1) 梯形面積 = (上底 + 下底) × 高 ÷ 2 = (4 + 10) × 12 ÷ 2 = 14 × 6 = 84 公尺。\n2) 8 到 10 秒加速度 a = (0 - 12) / 2 = -6 m/s²。合力 F = m|a| = 2 kg × 6 m/s² = 12 牛頓。`
      };
    }
  }

  // ==========================================
  // 2. 基礎與段考核心試題 (Easy & Medium)
  // ==========================================
  const concepts = [
    { q: '根據牛頓第一運動定律（慣性定律），當物體所受合力為零時：', ans: '靜者恆靜，動者恆作等速度直線運動', wrongs: ['物體必處於靜止狀態', '物體會持續作等加速度運動', '物體一定會逐漸減速直至停止'] },
    { q: '在常溫常壓下，關於純水達到中性時的特性：', ans: 'pH 值等於 7，且 [H⁺] = [OH⁻] = 10⁻⁷ M', wrongs: ['水中不含任何氫離子', '加入食鹽會使 pH 值劇烈上升', '沸騰加熱後 pH 值仍然恆等於 7.00'] },
    { q: '人體血液循環系統中，負責將充氧血由心臟打出至全身動脈的腔室為：', ans: '左心室', wrongs: ['右心室', '左心房', '右心房'] },
    { q: '光線由空氣斜射進入水中時，折射光線的路徑特徵為：', ans: '光速變慢，折射角小於入射角（偏向法線）', wrongs: ['光速變快，偏離法線', '折射角大於入射角', '完全不會發生偏折'] }
  ];
  const cItem = concepts[Math.floor(rand() * concepts.length)];

  return {
    question: `【自然科段考精選】${preamble}\n${cItem.q}`,
    options: [cItem.ans, ...getRandItems(cItem.wrongs, 3)],
    answer: 0,
    hint: `💡 提示：回顧 108 課綱自然領域核心科學概念。`,
    explanation: `📖 詳解：正確答案為「${cItem.ans}」。`
  };
}
