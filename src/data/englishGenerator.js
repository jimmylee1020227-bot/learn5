export function generateEnglishQuestion(gradeId, unitId, index, difficulty, rand, conceptTag) {
  const names = ['Tom', 'Amy', 'Peter', 'Emily', 'Jason', 'Lucy', 'John', 'Sarah'];
  const name1 = names[index % names.length];
  const name2 = names[(index + 1) % names.length];

  if (gradeId === 'g7') {
    const variant = index % 3;
    if (variant === 0) {
      // 聽力題 (Listening)
      const listenings = [
        { 
          text: `Man: Excuse me, how much is this jacket?\nWoman: It was fifty dollars yesterday, but it's on sale today for thirty dollars.\nMan: Great, I'll take it.`,
          q: `How much will the man pay for the jacket?`, opts: ['$30', '$50', '$20', '$80'], ans: 0, 
          exp: `It was fifty dollars yesterday, but it's on sale today for thirty dollars.\n詳解：外套今天特價 30 元。` 
        },
        { 
          text: `Woman: Are you going to the library, Peter?\nMan: No, I need to go to the post office first. Then I'll meet Tom at the park.`,
          q: `Where is the man going first?`, opts: ['The post office', 'The library', 'The park', 'Home'], ans: 0, 
          exp: `No, I need to go to the post office first.\n詳解：男子說他要先去郵局 (post office)。` 
        },
        { 
          text: `Man: What time does the movie start?\nWoman: It starts at 7:30, but we should get there at 7:00 to buy tickets.`,
          q: `What time does the movie start?`, opts: ['7:30', '7:00', '8:00', '6:30'], ans: 0, 
          exp: `It starts at 7:30...\n詳解：電影在 7:30 開始。` 
        }
      ];
      const l = listenings[index % listenings.length];
      return {
        isListening: true,
        audioText: l.text,
        question: `【英文聽力測驗】Listen to the conversation. ${l.q}`,
        options: l.opts,
        answer: 0,
        hint: '💡 提示：點擊「播放聽力語音」。注意聽關鍵字。',
        explanation: `📖 聽力原文：${l.exp}`
      };
    } else if (variant === 1) {
      // 英文情境對話 Chat
      const chats = [
        { msg1: `Hey, are you free this weekend?`, msg2: `I think so. What's up?`, msg3: `I was wondering if you'd like to go to the movies with me.`, msg4: `________. What time?`, opts: [`Sure, I'd love to`, `No, I don't like movies`, `I am very busy`, `You are welcome`] },
        { msg1: `I failed my math test again.`, msg2: `________. You studied so hard!`, msg3: `I know, maybe I should ask the teacher for help.`, msg4: `That's a good idea.`, opts: [`I'm sorry to hear that`, `Congratulations`, `That's wonderful`, `You're welcome`] },
        { msg1: `Excuse me, how do I get to the train station?`, msg2: `Go straight for two blocks and turn left. ________`, msg3: `Thank you so much!`, msg4: `No problem.`, opts: [`You can't miss it.`, `It's closed today.`, `I don't know either.`, `Watch out!`] }
      ];
      const c = chats[index % chats.length];
      return {
        isChat: true,
        chatMessages: [
          { sender: name1, text: c.msg1 },
          { sender: name2, text: c.msg2, isRight: true },
          { sender: name1, text: c.msg3 },
          { sender: name2, text: c.msg4, isRight: true }
        ],
        question: `【英文對話情境】Which of the following is the best response to fill in the blank?`,
        options: c.opts,
        answer: 0,
        hint: `💡 提示：根據前後文的邏輯來判斷最適合的回話。`,
        explanation: `📖 詳解：正確選項為「${c.opts[0]}」。`
      };
    } else {
      const g7Grammar = [
        { q: `If it ________ tomorrow, we will not go to the beach.`, opts: ['rains', 'will rain', 'rained', 'is raining'], exp: '條件子句 (If 帶領的子句) 中，要用「現在式代替未來式」。' },
        { q: `There ________ some milk in the fridge.`, opts: ['is', 'are', 'have', 'has'], exp: 'milk 是不可數名詞，Be動詞要用單數 is。' },
        { q: `Listen! The birds ________ in the trees.`, opts: ['are singing', 'sing', 'sings', 'sang'], exp: '有 Listen! (聽!) 代表動作正在發生，用現在進行式。' },
        { q: `My brother likes playing basketball, but I ________.`, opts: ['don\'t', 'doesn\'t', 'am not', 'didn\'t'], exp: 'like 是一般動詞，第一人稱否定用 don\'t。' }
      ];
      const g = g7Grammar[index % g7Grammar.length];
      return { 
        question: `【文法陷阱題】\n${g.q}`, 
        options: g.opts, 
        answer: 0, 
        hint: '💡 提示：注意時態與單複數。',
        explanation: `📖 詳解：${g.exp}` 
      };
    }
  } else if (gradeId === 'g8') {
    const variant = index % 2;
    if (variant === 0) {
      const readings = [
        { 
          text: `Dear ${name1},\nHow have you been? I am writing to tell you about my trip to Japan last week. It was amazing! I visited many famous temples in Kyoto and ate delicious sushi in Osaka. The weather was a bit cold, but the scenery was beautiful. I took a lot of photos and I can't wait to show them to you when we meet next Monday at the cafe.\nBest,\n${name2}`, 
          q: `What is the main purpose of this email?`, 
          opts: ['To share travel experiences in Japan.', 'To invite someone to visit Kyoto.', 'To complain about the cold weather.', 'To ask for recommendations for sushi restaurants.'],
          exp: `信件開頭明確表示寫信的目的是為了分享去日本旅行的經驗。`
        },
        { 
          text: `Cooking is not just a daily chore; it can be a fun hobby. When you cook, you can choose fresh vegetables and healthy meat. Also, cooking at home is usually cheaper than eating out at restaurants. Most importantly, sharing the food you make with family and friends brings people closer together.`, 
          q: `According to the reading, which of the following is NOT a benefit of cooking at home?`, 
          opts: ['It helps you lose weight fast.', 'It is usually cheaper than eating out.', 'You can choose healthy food.', 'It brings family and friends closer.'],
          exp: `文章提到了省錢、健康、增進感情，但並未提到「快速減肥(lose weight fast)」。`
        }
      ];
      const r = readings[index % readings.length];
      return {
        isReading: true,
        readingText: r.text,
        question: `【長篇閱讀理解】Read the passage and answer the question:\n${r.q}`,
        options: r.opts,
        answer: 0,
        hint: '💡 提示：仔細閱讀文章並找出對應段落。',
        explanation: `📖 詳解：${r.exp}`
      };
    } else {
      const g8Vocab = [
        { q: `The heavy rain caused a huge ________ in the city, making it impossible for cars to pass through the streets.`, opts: ['flood', 'drought', 'earthquake', 'typhoon'], exp: 'heavy rain (大雨) 會造成 flood (水災/淹水)。' },
        { q: `The little boy was so ________ that he drank three glasses of water.`, opts: ['thirsty', 'hungry', 'full', 'tired'], exp: '喝了三杯水，代表他很 thirsty (口渴)。' },
        { q: `We need to ________ our earth, or our children will not have a beautiful home to live in.`, opts: ['protect', 'destroy', 'pollute', 'ignore'], exp: '保護地球用 protect。' },
        { q: `The math question was so difficult that ________ students could answer it.`, opts: ['few', 'a few', 'little', 'a little'], exp: 'difficult 代表很少人會，students 是可數名詞，用 few 表示「很少(具有否定意味)」。' }
      ];
      const v = g8Vocab[index % g8Vocab.length];
      return { 
        question: `【進階字彙與文法】\n${v.q}`, 
        options: v.opts, 
        answer: 0, 
        hint: '💡 提示：根據前後文語意判斷。',
        explanation: `📖 詳解：${v.exp}` 
      };
    }
  } else if (gradeId === 'g9') {
    const variant = index % 3;
    if (variant === 0) {
      const readings9 = [
        { 
          text: `【Notice: School Library Renovation】\nThe school library will be closed for renovation starting from next Monday, October 15th, until Friday, November 2nd. During this period, students will not be able to check out new books. However, the study rooms on the second floor will remain open for students to prepare for exams. Late fees for all overdue books will be waived during the renovation.`, 
          q: `According to the notice, which of the following statements is TRUE?`, 
          opts: ['Students can still use the study rooms on the second floor.', 'Students can check out books from the study rooms.', 'Students have to pay extra money if they return books late during this period.', 'The library renovation will last for exactly one week.'],
          exp: `文章提到 "the study rooms on the second floor will remain open"，故第一個選項正確。陷阱：late fees 會被 waived (免除)。`
        },
        { 
          text: `Electric cars are becoming more popular around the world. Unlike gas-powered cars, electric cars do not produce air pollution while driving. They are also quieter. However, some people are still worried about buying them because charging stations are not as easy to find as gas stations, and it takes longer to charge a battery than to fill up a gas tank.`, 
          q: `What is one disadvantage (缺點) of electric cars mentioned in the reading?`, 
          opts: ['It takes a longer time to charge them.', 'They are too noisy.', 'They produce a lot of air pollution.', 'They are too fast to drive safely.'],
          exp: `文章結尾提到 "it takes longer to charge a battery than to fill up a gas tank"，這是缺點之一。`
        }
      ];
      const r = readings9[index % readings9.length];
      return {
        isReading: true,
        readingText: r.text,
        question: `【長篇閱讀理解】According to the reading, answer the question:\n${r.q}`,
        options: r.opts,
        answer: 0,
        hint: '💡 提示：仔細比對文章中提到的關鍵字。',
        explanation: `📖 詳解：${r.exp}`
      };
    } else if (variant === 1) {
      const g9Grammar = [
        { q: `${name1} has lived in Taipei ________ ten years ago.`, opts: ['since', 'for', 'in', 'from'], exp: '現在完成式中，搭配明確的起點時間 (ten years ago) 要用 since。陷阱：看到 ten years 就想選 for，但後面有 ago，代表時間點。' },
        { q: `I have ________ been to America, so I want to go there this summer.`, opts: ['never', 'ever', 'already', 'just'], exp: '因為想去，代表「從沒去過」，用 never。' },
        { q: `The book ________ I bought yesterday is very interesting.`, opts: ['which', 'who', 'whom', 'what'], exp: '先行詞 The book 是事物，關代用 which (或 that)。' },
        { q: `Do you know where ________?`, opts: ['he lives', 'does he live', 'is he living', 'he live'], exp: '間接問句要還原為肯定句的主謂順序：主詞 + 動詞 (where he lives)。' }
      ];
      const g = g9Grammar[index % g9Grammar.length];
      return { 
        question: `【文法陷阱題】\n${g.q}`, 
        options: g.opts, 
        answer: 0, 
        hint: '💡 提示：注意時態與連接詞用法。',
        explanation: `📖 詳解：${g.exp}` 
      };
    } else {
      const g9Passive = [
        { q: `Look! The boy ________ by a big dog. We should go help him!`, opts: ['is being chased', 'chased', 'is chasing', 'has chased'], exp: '男孩「正在被」狗追，需要用現在進行式的被動語態 (is being + Vpp)。' },
        { q: `The bridge ________ fifty years ago.`, opts: ['was built', 'built', 'has built', 'is built'], exp: '橋是「被建造」的，且時間是 fifty years ago (過去式)，故用 was built。' },
        { q: `English ________ in many countries around the world.`, opts: ['is spoken', 'speaks', 'is speaking', 'has spoken'], exp: '英文是「被說」的，客觀事實用現在式的被動語態 is spoken。' },
        { q: `The homework must ________ before tomorrow.`, opts: ['be finished', 'finish', 'is finished', 'finished'], exp: '助動詞 must 後面接被動語態時，要用 be + Vpp。' }
      ];
      const p = g9Passive[index % g9Passive.length];
      return { 
        question: `【被動語態陷阱】\n${p.q}`, 
        options: p.opts, 
        answer: 0, 
        hint: '💡 提示：注意動作是主動還是被動，並搭配正確的時態。',
        explanation: `📖 詳解：${p.exp}` 
      };
    }
  }

  // Fallback
  return {
    question: `【英文基礎語法題】Regarding "${conceptTag}", choose the correct answer:`,
    options: ['Correct Option', 'Wrong Option 1', 'Wrong Option 2', 'Wrong Option 3'],
    answer: 0,
    hint: '💡 提示：Review the grammar rules.',
    explanation: `📖 詳解：This is a basic grammar question.`
  };
}
