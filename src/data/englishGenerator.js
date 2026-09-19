export function generateEnglishQuestion(gradeId, unitId, index, difficulty, rand, conceptTag) {
  const names = ['Tom', 'Amy', 'Peter', 'Emily', 'Jason', 'Lucy', 'John', 'Sarah'];
  const name1 = names[index % names.length];
  const name2 = names[(index + 1) % names.length];
  const variant = Math.floor(rand() * 10); 

  if (variant < 3) {
    // 聽力題 (Listening)
    const listeningTypes = [
      { 
        audioText: `Hey ${name1}, do you know what time the library closes today? I need to return some books before I go home.`,
        question: `【英文聽力測驗】Listen to the audio. What does the speaker want to do?`,
        options: ['Return books to the library.', 'Borrow books from the library.', 'Go home early.', 'Find out what time it is.'],
        ans: 0,
        hint: '💡 提示：點擊「播放聽力語音」按鈕聆聽內容。注意關鍵字 "return some books"。',
        explanation: `📖 聽力原文：Hey ${name1}, do you know what time the library closes today? I need to return some books before I go home.\n詳解：說話者提到 "return some books" (還書)，故選第一個選項。`
      },
      {
        audioText: `Attention all students. The science fair has been moved from the gymnasium to the main auditorium due to the heavy rain.`,
        question: `【英文聽力測驗】Listen to the announcement. Where will the science fair be held?`,
        options: ['In the main auditorium.', 'In the gymnasium.', 'In the classroom.', 'Outside in the rain.'],
        ans: 0,
        hint: '💡 提示：注意聽地點的改變 (moved from A to B)。',
        explanation: `📖 聽力原文：Attention all students. The science fair has been moved from the gymnasium to the main auditorium due to the heavy rain.\n詳解：活動從體育館移到了大禮堂 (main auditorium)。`
      },
      {
        audioText: `Man: Excuse me, how much is this jacket?\nWoman: It was fifty dollars yesterday, but it's on sale today for thirty dollars.\nMan: Great, I'll take it.`,
        question: `【英文聽力測驗】Listen to the conversation. How much will the man pay for the jacket?`,
        options: ['$30', '$50', '$20', '$80'],
        ans: 0,
        hint: '💡 提示：注意聽 "today" (今天) 的價格。',
        explanation: `📖 聽力原文：It was fifty dollars yesterday, but it's on sale today for thirty dollars.\n詳解：外套今天特價 30 元。陷阱是昨天的原價 50 元。`
      }
    ];
    const item = listeningTypes[index % listeningTypes.length];
    return {
      isListening: true,
      audioText: item.audioText,
      question: item.question,
      options: item.options,
      answer: item.ans,
      hint: item.hint,
      explanation: item.explanation
    };
  } else if (variant < 6) {
    // 閱讀理解 (Reading)
    const readings = [
      {
        text: `Dear ${name1},\nHow have you been? I am writing to tell you about my trip to Japan last week. It was amazing! I visited many famous temples in Kyoto and ate delicious sushi in Osaka. The weather was a bit cold, but the scenery was beautiful. I took a lot of photos and I can't wait to show them to you when we meet next Monday at the cafe.\nBest,\n${name2}`,
        question: `【長篇閱讀理解】Read the email and answer the question:\nWhat is the main purpose of this email?`,
        options: [
          'To share travel experiences in Japan.',
          'To invite someone to visit Kyoto.',
          'To complain about the cold weather.',
          'To ask for recommendations for sushi restaurants.'
        ],
        answer: 0,
        hint: '💡 提示：根據第一段 "I am writing to tell you about my trip to Japan..." 判斷主旨。',
        explanation: `📖 詳解：信件開頭明確表示寫信的目的是為了分享去日本旅行的經驗 (tell you about my trip to Japan)，故選第一個選項。`
      },
      {
        text: `【Notice: School Library Renovation】\nThe school library will be closed for renovation starting from next Monday, October 15th, until Friday, November 2nd. During this period, students will not be able to check out new books. However, the study rooms on the second floor will remain open for students to prepare for exams. Late fees for all overdue books will be waived during the renovation.`,
        question: `【長篇閱讀理解】According to the notice, which of the following statements is TRUE?`,
        options: [
          'Students can still use the study rooms on the second floor.',
          'Students can check out books from the study rooms.',
          'Students have to pay extra money if they return books late during this period.',
          'The library renovation will last for exactly one week.'
        ],
        answer: 0,
        hint: '💡 提示：仔細比對文章中提到 study rooms 以及 late fees 的段落。',
        explanation: `📖 詳解：文章提到 "the study rooms on the second floor will remain open"，故第一個選項正確。陷阱：late fees 會被 waived (免除)，不會要求多付錢。`
      }
    ];
    const r = readings[index % readings.length];
    return {
      isReading: true,
      readingText: r.text,
      question: r.question,
      options: r.options,
      answer: r.answer,
      hint: r.hint,
      explanation: r.explanation
    };
  } else if (variant < 8) {
    // 克漏字 / 文法陷阱 (時態與被動)
    const grammars = [
      { q: `Look! The boy ________ by a big dog. We should go help him!`, options: ['is being chased', 'chased', 'is chasing', 'has chased'], ans: 0, exp: '男孩「正在被」狗追，需要用現在進行式的被動語態 (is being + Vpp)。常見陷阱是選主動的 is chasing。' },
      { q: `If it ________ tomorrow, we will not go to the beach.`, options: ['rains', 'will rain', 'rained', 'is raining'], ans: 0, exp: '條件子句 (If 帶領的子句) 中，要用「現在式代替未來式」。故填 rains，不能用 will rain（陷阱）。' },
      { q: `${name1} has lived in Taipei ________ ten years ago.`, options: ['since', 'for', 'in', 'from'], ans: 0, exp: '現在完成式中，搭配明確的起點時間 (ten years ago) 要用 since。陷阱：看到 ten years 就想選 for，但後面有 ago，代表時間點。' }
    ];
    const g = grammars[index % grammars.length];
    return {
      question: `【文法陷阱題】\n${g.q}`,
      options: g.options,
      answer: g.ans,
      hint: '💡 提示：注意時態標記與主被動語態，以及特殊句型規則。',
      explanation: `📖 詳解：${g.exp}`
    };
  } else {
    // 字彙與片語
    const vocabs = [
      { q: `The heavy rain caused a huge ________ in the city, making it impossible for cars to pass through the streets.`, options: ['flood', 'drought', 'earthquake', 'typhoon'], ans: 0, exp: 'heavy rain (大雨) 會造成 flood (水災/淹水)。drought 是乾旱，earthquake 是地震，typhoon 是颱風。' },
      { q: `Please remember to ________ the lights before you leave the classroom.`, options: ['turn off', 'turn on', 'turn up', 'turn down'], ans: 0, exp: '離開教室前要「關燈」 (turn off)。' },
      { q: `I usually ________ the bus to school, but today my dad drove me.`, options: ['take', 'ride', 'catch', 'drive'], ans: 0, exp: '搭乘公車的動詞搭配為 "take the bus"。' }
    ];
    const v = vocabs[index % vocabs.length];
    return {
      question: `【進階字彙與片語】\n${v.q}`,
      options: v.options,
      answer: v.ans,
      hint: '💡 提示：根據前後文語意，選擇最合理的單字或片語組合。',
      explanation: `📖 詳解：${v.exp}`
    };
  }
}
