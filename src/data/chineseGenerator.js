export function generateChineseQuestion(gradeId, unitId, index, difficulty, rand, conceptTag) {
  const globalVariant = index % 3;

  // 通用錯別字與字音字形 (適用全科)
  if (globalVariant === 0) {
    const typos = [
      { text: '「莘莘」學子', correct: 'ㄕㄣ', wrong: ['ㄒㄧㄣ', 'ㄒㄧㄥ', 'ㄕㄥ'] },
      { text: '「垂涎」三尺', correct: 'ㄒㄧㄢˊ', wrong: ['ㄧㄢˊ', 'ㄉㄧㄢˋ', 'ㄔㄨㄟˊ'] },
      { text: '「塑」膠', correct: 'ㄙㄨˋ', wrong: ['ㄕㄨㄛˋ', 'ㄙㄨㄛˋ', 'ㄕㄨˋ'] },
      { text: '「尷尬」', correct: 'ㄍㄢ ㄍㄚˋ', wrong: ['ㄐㄧㄢ ㄐㄧㄝˋ', 'ㄍㄢ ㄐㄧㄝˋ', 'ㄐㄧㄢ ㄍㄚˋ'] }
    ];
    const t = typos[index % typos.length];
    return {
      question: `【字音字形測驗】請選出下列詞語「」中文字的正確讀音：\n${t.text}`,
      options: [t.correct, t.wrong[0], t.wrong[1], t.wrong[2]],
      answer: 0,
      hint: '💡 提示：請注意部首與偏旁的發音差異。',
      explanation: `📖 詳解：「${t.text}」正確讀音為 ${t.correct}。`
    };
  } else if (globalVariant === 1) {
    return {
      question: `【國文陷阱題：錯別字判讀】\n下列四個選項中，何者「沒有」錯別字？`,
      options: ['走投無路', '破斧沉舟', '病入膏盲', '名烈前茅'],
      answer: 0,
      hint: '💡 提示：仔細辨認字形。',
      explanation: `📖 詳解：「破斧沉舟」應為釜；「病入膏盲」應為肓；「名烈前茅」應為列。`
    };
  }

  // 根據年級區分國學常識
  if (gradeId === 'g7') {
    const variant = index % 2;
    if (variant === 0) {
      return {
        isChat: true,
        chatMessages: [
          { sender: '小明', text: '請問「江、河、湖、海」這幾個字都是什麼造字法則啊？' },
          { sender: '小華', text: '有水部首表示意思，旁邊的字表示聲音，這很明顯是________。' }
        ],
        question: `【群組討論解謎】根據上述對話，空格中應該填入哪一種六書造字法則？`,
        options: ['形聲', '象形', '會意', '指事'],
        answer: 0,
        hint: '💡 提示：一半表形，一半表音。',
        explanation: `📖 詳解：形聲字由形符與聲符組成，如「江」由「水(形)」與「工(聲)」組成。`
      };
    } else {
      return {
        question: `【韻文常識】關於「絕句」的格律，下列敘述何者「錯誤」？`,
        options: ['必須全詩對仗', '每首四句', '分為五言與七言', '第二、四句必須押韻'],
        answer: 0,
        hint: '💡 提示：絕句對對仗沒有嚴格規定。',
        explanation: `📖 詳解：絕句「不要求對仗」，律詩才規定頷聯與頸聯必須對仗。`
      };
    }
  } else if (gradeId === 'g8') {
    const variant = index % 2;
    if (variant === 0) {
      return {
        question: `【中文四大句型判讀】文句：「蓮，花之君子者也。」在語法句型上屬於下列哪一種？`,
        options: ['判斷句', '敘事句', '有無句', '表態句'],
        answer: 0,
        hint: `💡 提示：以「也」為繫詞肯定主語屬性。`,
        explanation: `📖 詳解：這是典型的「判斷句」。`
      };
    } else {
      return {
        question: `【語文修辭技巧判讀】\n文句：「春風在樹枝上跳舞，喚醒了沉睡的大地。」主要運用了何種修辭技巧？`,
        options: ['轉化（擬人）', '排比', '誇飾', '頂真'],
        answer: 0,
        hint: `💡 提示：賦予春風與大地人類的動作。`,
        explanation: `📖 詳解：運用了「轉化（擬人）」。`
      };
    }
  } else if (gradeId === 'g9') {
    const variant = index % 2;
    if (variant === 0) {
      return {
        isReading: true,
        readingText: `【文言語譯與理解】\n子曰：「學而不思則罔，思而不學則殆。」`,
        question: `【文意推敲】孔子這段話最主要的涵義是強調什麼？`,
        options: ['學習與思考必須並重', '學習比思考更重要', '思考比學習更重要', '讀書要專心一致'],
        answer: 0,
        hint: '💡 提示：「罔」指罔然無得，「殆」指精神疲倦。',
        explanation: `📖 詳解：強調學思並重。`
      };
    } else {
      return {
        question: `【應用文題辭】小華的哥哥即將結婚，小華想送個紅包，紅包袋上寫哪一個題辭最合適？`,
        options: ['琴瑟和鳴', '弄瓦之喜', '松柏長青', '高山流水'],
        answer: 0,
        hint: '💡 提示：弄瓦是生女，松柏是壽誕。',
        explanation: `📖 詳解：琴瑟和鳴用於賀婚。`
      };
    }
  }

  // Fallback
  return {
    question: `【國文素養題】關於單元「${conceptTag}」，下列敘述何者正確？`,
    options: ['正確描述', '錯誤一', '錯誤二', '錯誤三'],
    answer: 0,
    hint: '💡 提示：回憶課本定義。',
    explanation: `📖 詳解：這是一道核心素養題。`
  };
}
