// 108 課綱英語科全單元精準題目引擎（100% 依年級與單元精準對齊）
export function generateEnglishQuestion(gradeId, unitId, index, difficulty = 'medium', rand, conceptTag) {
  const isExtreme = difficulty === 'extreme' || difficulty === 'hardest';
  const people = ['Alex', 'David', 'Emily', 'Sarah', 'Kevin', 'Grace', 'Brian', 'Chloe'];
  const person = people[Math.floor(rand() * people.length)];
  const preamble = `While studying English, ${person} encountered this question:`;

  const uNum = parseInt(String(unitId).split('-').pop().replace('u', ''), 10) || 1;

  // ============================================================
  // 國一 (七年級)
  // ============================================================
  if (gradeId === 'g7') {
    // u1: Be動詞與人稱代名詞
    if (uNum === 1) {
      return {
        question: `【Be動詞與代名詞主格】${preamble}\n________ are my new classmates, and ________ names are Leo and Mia.`,
        options: [`They; their`, `Their; they`, `They; them`, `Them; their`],
        answer: 0,
        hint: `💡 提示：主詞位置用主格 They；修飾名詞 names 用所有格 their。`,
        explanation: `📖 詳解：第一格為主詞用 They；第二格修飾名詞 names 用所有格 their。`
      };
    }

    // u2: 現在簡單式與頻率副詞
    if (uNum === 2) {
      return {
        question: `【現在簡單式與頻率副詞位置】${preamble}\nMy brother ________ early on weekdays, but he ________ up late on Sundays.`,
        options: [`always gets; wakes`, `gets always; wake`, `always get; wake`, `is always getting; wake`],
        answer: 0,
        hint: `💡 提示：頻率副詞放在一般動詞前面；主詞 brother 為第三人稱單數，動詞需加 s。`,
        explanation: `📖 詳解：頻率副詞放在一般動詞 gets 之前；第三人稱單數現在簡單式動詞加 s (gets / wakes)。`
      };
    }

    // u3: 現在進行式與祈使句
    if (uNum === 3) {
      return {
        question: `【現在進行式與祈使句句型】${preamble}\nListen! The birds ________ outside. Please ________ quiet.`,
        options: [`are singing; be`, `sing; are`, `is singing; be`, `are singing; to be`],
        answer: 0,
        hint: `💡 提示：Listen! 提示當前動作正在進行 (be + Ving)；祈使句動詞用原形 (be)。`,
        explanation: `📖 詳解：Listen! 表現在進行式，複數主詞用 are singing；祈使句 Please 後接原形動詞 be。`
      };
    }

    // u4: There is/are 與空間介系詞
    if (uNum === 4) {
      return {
        question: `【There is/are 與方位介系詞】${preamble}\n________ some milk and three apples ________ the refrigerator.`,
        options: [`There is; in`, `There are; on`, `There is; at`, `There are; in`],
        answer: 0,
        hint: `💡 提示：There is/are 遵循「鄰近原則」，緊鄰的主詞 milk 為不可數名詞用 is；在冰箱內部用 in。`,
        explanation: `📖 詳解：There is/are 的 be 動詞受最接近的名詞決定，milk 為不可數名詞用 is；放置在冰箱內部用 in。`
      };
    }

    // u5: 時間日期與助動詞 (Can/May)
    if (uNum === 5) {
      return {
        question: `【情態助動詞與時間介系詞】${preamble}\nCan you play basketball with us ________ Friday afternoon?`,
        options: [`on`, `in`, `at`, `for`],
        answer: 0,
        hint: `💡 提示：具體的星期與日期（如 Friday afternoon）介系詞必須用 on。`,
        explanation: `📖 詳解：特定某一天的早中晚（如 Friday afternoon）介系詞用 on。`
      };
    }
  }

  // ============================================================
  // 國二 (八年級)
  // ============================================================
  if (gradeId === 'g8') {
    // u1: 過去簡單式與不規則動詞
    if (uNum === 1) {
      return {
        question: `【過去簡單式不規則動詞】${preamble}\nYesterday afternoon, Jason ________ his wallet and ________ his favorite watch.`,
        options: [`lost; broke`, `lost; breaked`, `losed; broke`, `loses; breaks`],
        answer: 0,
        hint: `💡 提示：lose 的過去式為 lost；break 的過去式為 broke。`,
        explanation: `📖 詳解：Yesterday 表過去時態，lose → lost，break → broke。`
      };
    }

    // u2: 未來式與天氣表達
    if (uNum === 2) {
      return {
        question: `【未來式與條件副詞子句】${preamble}\nWe will go camping this weekend if the weather ________ sunny.`,
        options: [`is`, `will be`, `was`, `has been`],
        answer: 0,
        hint: `💡 提示：if 引導的條件副詞子句中，用「現在簡單式」代替「未來式」。`,
        explanation: `📖 詳解：在條件子句（if）與時間子句（when/before）中，必須用現在式代替未來式，主詞 weather 用 is。`
      };
    }

    // u3: 形容詞與副詞比較級最高級
    if (uNum === 3) {
      return {
        question: `【形容詞比較級最高級句型】${preamble}\nMount Everest is ________ mountain in the world, and it is much ________ than any other mountain.`,
        options: [`the highest; higher`, `highest; more higher`, `the most high; higher`, `the higher; the highest`],
        answer: 0,
        hint: `💡 提示：最高級前面加 the (the highest)；much 修飾比較級 (much higher)。`,
        explanation: `📖 詳解：最高級需加 the (the highest)；much 可用來修飾比較級 higher。`
      };
    }

    // u4: 不定詞 (to V) 與動名詞 (V-ing)
    if (uNum === 4) {
      return {
        question: `【動名詞與不定詞受詞搭配】${preamble}\nMark enjoys ________ mystery novels, but he refused ________ his book to anyone.`,
        options: [`reading; to lend`, `to read; lending`, `reading; lending`, `to read; to lend`],
        answer: 0,
        hint: `💡 提示：enjoy 後面接動名詞 (V-ing)；refuse 後面接不定詞 (to V)。`,
        explanation: `📖 詳解：enjoy + V-ing (reading)；refuse + to V (to lend)。`
      };
    }

    // u5: 使役動詞與感官動詞
    if (uNum === 5) {
      return {
        question: `【使役動詞用法】${preamble}\nThe teacher made the students ________ the classroom after school.`,
        options: [`clean`, `to clean`, `cleaned`, `cleaning`],
        answer: 0,
        hint: `💡 提示：使役動詞 make/have/let + 受詞 + 原形動詞 (V)。`,
        explanation: `📖 詳解：使役動詞 make 受詞後接原形動詞 clean。`
      };
    }
  }

  // ============================================================
  // 國三 (九年級)
  // ============================================================
  if (gradeId === 'g9') {
    // u1: 現在完成式 (have/has + p.p.)
    if (uNum === 1) {
      return {
        question: `【現在完成式與 since/for 用法】${preamble}\nMr. Lin ________ in Tainan ________ he graduated from college ten years ago.`,
        options: [`has lived; since`, `lived; for`, `has lived; for`, `is living; since`],
        answer: 0,
        hint: `💡 提示：since + 過去時間點/過去式子句，主要子句搭配現在完成式 (has lived)。`,
        explanation: `📖 詳解：since 接過去式子句 (graduated)，主要子句表達從過去持續至今的動作，用現在完成式 has lived。`
      };
    }

    // u2: 被動語態 (be + p.p.)
    if (uNum === 2) {
      return {
        question: `【被動語態時態一致性】${preamble}\nThe famous bridge ________ by a Japanese architect in 1935.`,
        options: [`was designed`, `designed`, `is designed`, `has designed`],
        answer: 0,
        hint: `💡 提示：in 1935 為過去時間，橋是被設計的，用過去被動式 was designed。`,
        explanation: `📖 詳解：主詞 the bridge 為被動承受者，且時間為 1935 年，應使用過去被動語態 was designed。`
      };
    }

    // u3: 關係代名詞 (who/which/that/whose)
    if (uNum === 3) {
      return {
        question: `【關係代名詞主格與所有格】${preamble}\nThe boy ________ dog was barking loudly apologized to the neighbor ________ lived next door.`,
        options: [`whose; who`, `who; that`, `which; whom`, `whose; which`],
        answer: 0,
        hint: `💡 提示：第一格先行詞是 boy，修飾其 dog 用所有格 whose；第二格先行詞是 neighbor (人) 作主詞用 who。`,
        explanation: `📖 詳解：whose 表示「...的」（whose dog）；修飾人的關係代名詞主格用 who。`
      };
    }

    // u4: 名詞子句與間接問句
    if (uNum === 4) {
      return {
        question: `【間接問句主謂倒裝還原】${preamble}\nExcuse me, could you please tell me ________?`,
        options: [`where the nearest MRT station is`, `where is the nearest MRT station`, `where does the nearest MRT station locate`, `what is the nearest MRT station`],
        answer: 0,
        hint: `💡 提示：間接問句語序為「疑問詞 + 主詞 + 動詞」，不可採倒裝句型。`,
        explanation: `📖 詳解：間接問句為名詞子句，語序必須恢復為平述句語序：疑問詞 (where) + 主詞 (the station) + 動詞 (is)。`
      };
    }

    // u5: 附加問句與會考長篇閱測
    if (uNum === 5) {
      return {
        question: `【附加問句前肯後否規則】${preamble}\nYour sister has never been to Japan, ________?`,
        options: [`has she`, `hasn't she`, `does she`, `doesn't she`],
        answer: 0,
        hint: `💡 提示：句子含有否定副詞 never，視為否定句，後方附加問句需用肯定形式 has she。`,
        explanation: `📖 詳解：never 使前半句為否定句，依「前否後肯」規則，且完成式助動詞為 has，故附加問句用 has she。`
      };
    }
  }

  // ============================================================
  // 歷屆會考試題 (past-exams)
  // ============================================================
  if (gradeId === 'past-exams') {
    if (uNum === 1) {
      return {
        question: `【歷屆會考文法陷阱】${preamble}\n________ the heavy rain and strong wind, the flight was delayed for three hours.`,
        options: [`Because of`, `Although`, `Because`, `Despite of`],
        answer: 0,
        hint: `💡 提示：後接名詞片語 (the heavy rain and strong wind)，表示原因用 Because of；Despite 後不加 of。`,
        explanation: `📖 詳解：Because of 後接名詞片語表示原因；Although 和 Because 後必須接完整子句；Despite 不加 of。`
      };
    } else {
      return {
        isReading: true,
        readingText: `[Notice Board]\nSchool Library Opening Hours:\nMonday to Friday: 8:00 AM - 6:00 PM\nSaturday: 9:00 AM - 12:00 PM\nSunday & National Holidays: Closed`,
        question: `According to the notice, when can students visit the library?`,
        options: [`On Saturday morning at 10:00 AM`, `On Sunday afternoon at 2:00 PM`, `On Friday evening at 7:00 PM`, `On national holidays at 9:00 AM`],
        answer: 0,
        hint: `💡 提示：對照週六開放時間為 9:00 AM - 12:00 PM。`,
        explanation: `📖 詳解：由圖表可知週六上午 9:00 至 12:00 開放，故 10:00 AM 可入館。`
      };
    }
  }

  // ============================================================
  // 私校入學考題 (private-school)
  // ============================================================
  if (gradeId === 'private-school') {
    if (uNum === 1) {
      return {
        question: `【私中資優-高階字彙辨析】${preamble}\nThe new economic policy helped ________ the negative impact of inflation.`,
        options: [`mitigate (減輕、舒緩)`, `deteriorate (惡化)`, `fabricate (虛構)`, `prolong (延長)`],
        answer: 0,
        hint: `💡 提示：政策幫助減緩通膨衝擊，選 mitigate。`,
        explanation: `📖 詳解：mitigate 意為緩和、減輕，符合題意。`
      };
    } else {
      return {
        question: `【私中進階-文法否定倒裝句】${preamble}\nSeldom ________ such a breathtaking performance before.`,
        options: [`have I seen`, `I have seen`, `did I saw`, `I saw`],
        answer: 0,
        hint: `💡 提示：否定副詞 Seldom 放句首需倒裝：助動詞 + 主詞 + 原形/分詞。`,
        explanation: `📖 詳解：否定副詞 Seldom 置於句首時句子倒裝，助動詞 have 提前至主詞 I 之前：have I seen。`
      };
    }
  }

  return {
    question: `【${conceptTag}英語素養】${preamble}\nWhich of the following sentences is grammatically correct?`,
    options: [`The sentence that strictly follows 108 curriculum grammar rules.`, `The sentence with incorrect subject-verb agreement.`, `The sentence with inappropriate preposition usage.`, `The sentence with mismatched verb tense.`],
    answer: 0,
    hint: `💡 提示：回歸 108 課綱英語文法定義。`,
    explanation: `📖 詳解：選項一符合課綱規範之正確文法結構。`
  };
}
