export function generateEnglishQuestion(gradeId, unitId, index, difficulty, rand, conceptTag) {
  const names = ['Tom', 'Amy', 'Peter', 'Emily', 'Jason', 'Lucy'];
  const name1 = names[index % names.length];
  const name2 = names[(index + 1) % names.length];
  const variant = Math.floor(rand() * 4); // 0: listening, 1: reading, 2: grammar, 3: vocab

  if (variant === 0) {
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
  } else if (variant === 1) {
    // 閱讀理解 (Reading)
    return {
      isReading: true,
      readingText: `Dear ${name1},\nHow have you been? I am writing to tell you about my trip to Japan last week. It was amazing! I visited many famous temples in Kyoto and ate delicious sushi in Osaka. The weather was a bit cold, but the scenery was beautiful. I took a lot of photos and I can't wait to show them to you when we meet next Monday at the cafe.\nBest,\n${name2}`,
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
    };
  } else if (variant === 2) {
    // 克漏字 / 文法
    const verbs = [
      { base: 'play', s: 'plays', ing: 'playing', past: 'played' },
      { base: 'study', s: 'studies', ing: 'studying', past: 'studied' }
    ];
    const v = verbs[index % verbs.length];
    return {
      question: `【克漏字與時態】Every weekend, ${name1} usually ________ basketball with classmates, but yesterday he ________ at home because of the rain.`,
      options: [
        `${v.s} / stayed`, 
        `${v.ing} / stays`, 
        `${v.base} / stay`, 
        `${v.s} / is staying`
      ],
      answer: 0,
      hint: `💡 提示：第一空格有「Every weekend」為現在簡單式；第二空格有「yesterday」為過去式。`,
      explanation: `📖 詳解：Every weekend 代表習慣性動作，主詞為單數故用 ${v.s}；yesterday 代表過去時間，故用過去式 stayed。`
    };
  } else {
    // 字彙
    return {
      question: `【進階字彙】The heavy rain caused a huge ________ in the city, making it impossible for cars to pass through the streets.`,
      options: ['flood', 'drought', 'earthquake', 'typhoon'],
      answer: 0,
      hint: '💡 提示：大雨 (heavy rain) 會造成什麼自然災害使得車輛無法通行？',
      explanation: `📖 詳解：heavy rain (大雨) 會造成 flood (水災/淹水)。drought 是乾旱，earthquake 是地震，typhoon 是颱風本身。`
    };
  }
}
