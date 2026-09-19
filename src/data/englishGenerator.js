export function generateEnglishQuestion(gradeId, unitId, index, difficulty, rand, conceptTag) {
  const names = ['Tom', 'Amy', 'Peter', 'Emily', 'Jason', 'Lucy', 'John', 'Sarah'];
  const name1 = names[Math.floor(rand() * names.length)];
  const name2 = names[(Math.floor(rand() * names.length) + 1) % names.length];

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

  if (gradeId === 'g7') {
    const variant = Math.floor(rand() * 3);
    if (variant === 0) {
      // 聽力題 (Listening)
      const listenings = [
        { 
          text: `Man: Excuse me, how much is this jacket?\nWoman: It was fifty dollars yesterday, but it's on sale today for thirty dollars.\nMan: Great, I'll take it.`,
          q: `How much will the man pay for the jacket?`, ans: '$30', wrongs: ['$50', '$20', '$80', '$10', '$40'], 
          exp: `It was fifty dollars yesterday, but it's on sale today for thirty dollars.\n詳解：外套今天特價 30 元。` 
        },
        { 
          text: `Woman: Are you going to the library, Peter?\nMan: No, I need to go to the post office first. Then I'll meet Tom at the park.`,
          q: `Where is the man going first?`, ans: 'The post office', wrongs: ['The library', 'The park', 'Home', 'The supermarket'], 
          exp: `No, I need to go to the post office first.\n詳解：男子說他要先去郵局 (post office)。` 
        },
        { 
          text: `Man: What time does the movie start?\nWoman: It starts at 7:30, but we should get there at 7:00 to buy tickets.`,
          q: `What time does the movie start?`, ans: '7:30', wrongs: ['7:00', '8:00', '6:30', '7:15'], 
          exp: `It starts at 7:30...\n詳解：電影在 7:30 開始。` 
        }
      ];
      const l = listenings[Math.floor(rand() * listenings.length)];
      return {
        isListening: true,
        audioText: l.text,
        question: `【英文聽力測驗】Listen to the conversation. ${l.q}`,
        options: [l.ans, ...getRandItems(l.wrongs, 3)],
        answer: 0,
        hint: '💡 提示：點擊「播放聽力語音」。注意聽關鍵字。',
        explanation: `📖 聽力原文：${l.exp}`
      };
    } else if (variant === 1) {
      // 英文情境對話 Chat
      const chats = [
        { msg1: `Hey, are you free this weekend?`, msg2: `I think so. What's up?`, msg3: `I was wondering if you'd like to go to the movies with me.`, msg4: `________. What time?`, ans: `Sure, I'd love to`, wrongs: [`No, I don't like movies`, `I am very busy`, `You are welcome`, `I have no idea`] },
        { msg1: `I failed my math test again.`, msg2: `________. You studied so hard!`, msg3: `I know, maybe I should ask the teacher for help.`, msg4: `That's a good idea.`, ans: `I'm sorry to hear that`, wrongs: [`Congratulations`, `That's wonderful`, `You're welcome`, `Good for you`] },
        { msg1: `Excuse me, how do I get to the train station?`, msg2: `Go straight for two blocks and turn left. ________`, msg3: `Thank you so much!`, msg4: `No problem.`, ans: `You can't miss it.`, wrongs: [`It's closed today.`, `I don't know either.`, `Watch out!`, `I'm going there too.`] }
      ];
      const c = chats[Math.floor(rand() * chats.length)];
      return {
        isChat: true,
        chatMessages: [
          { sender: name1, text: c.msg1 },
          { sender: name2, text: c.msg2, isRight: true },
          { sender: name1, text: c.msg3 },
          { sender: name2, text: c.msg4, isRight: true }
        ],
        question: `【英文對話情境】Which of the following is the best response to fill in the blank?`,
        options: [c.ans, ...getRandItems(c.wrongs, 3)],
        answer: 0,
        hint: `💡 提示：根據前後文的邏輯來判斷最適合的回話。`,
        explanation: `📖 詳解：正確選項為「${c.ans}」。`
      };
    } else {
      const g7Grammar = [
        { q: `If it ________ tomorrow, we will not go to the beach.`, ans: 'rains', wrongs: ['will rain', 'rained', 'is raining', 'has rained'], exp: '條件子句 (If 帶領的子句) 中，要用「現在式代替未來式」。' },
        { q: `There ________ some milk in the fridge.`, ans: 'is', wrongs: ['are', 'have', 'has', 'be'], exp: 'milk 是不可數名詞，Be動詞要用單數 is。' },
        { q: `Listen! The birds ________ in the trees.`, ans: 'are singing', wrongs: ['sing', 'sings', 'sang', 'have sung'], exp: '有 Listen! (聽!) 代表動作正在發生，用現在進行式。' },
        { q: `My brother likes playing basketball, but I ________.`, ans: 'don\'t', wrongs: ['doesn\'t', 'am not', 'didn\'t', 'haven\'t'], exp: 'like 是一般動詞，第一人稱否定用 don\'t。' }
      ];
      const g = g7Grammar[Math.floor(rand() * g7Grammar.length)];
      return { 
        question: `【文法陷阱題】\n${g.q}`, 
        options: [g.ans, ...getRandItems(g.wrongs, 3)], 
        answer: 0, 
        hint: '💡 提示：注意時態與單複數。',
        explanation: `📖 詳解：${g.exp}` 
      };
    }
  } else if (gradeId === 'g8') {
    const variant = Math.floor(rand() * 2);
    if (variant === 0) {
      const readings = [
        { 
          text: `Dear ${name1},\nHow have you been? I am writing to tell you about my trip to Japan last week. It was amazing! I visited many famous temples in Kyoto and ate delicious sushi in Osaka. The weather was a bit cold, but the scenery was beautiful. I took a lot of photos and I can't wait to show them to you when we meet next Monday at the cafe.\nBest,\n${name2}`, 
          q: `What is the main purpose of this email?`, 
          ans: 'To share travel experiences in Japan.', wrongs: ['To invite someone to visit Kyoto.', 'To complain about the cold weather.', 'To ask for recommendations for sushi restaurants.', 'To cancel a meeting at the cafe.'],
          exp: `信件開頭明確表示寫信的目的是為了分享去日本旅行的經驗。`
        },
        { 
          text: `Cooking is not just a daily chore; it can be a fun hobby. When you cook, you can choose fresh vegetables and healthy meat. Also, cooking at home is usually cheaper than eating out at restaurants. Most importantly, sharing the food you make with family and friends brings people closer together.`, 
          q: `According to the reading, which of the following is NOT a benefit of cooking at home?`, 
          ans: 'It helps you lose weight fast.', wrongs: ['It is usually cheaper than eating out.', 'You can choose healthy food.', 'It brings family and friends closer.', 'You can use fresh vegetables.'],
          exp: `文章提到了省錢、健康、增進感情，但並未提到「快速減肥(lose weight fast)」。`
        }
      ];
      const r = readings[Math.floor(rand() * readings.length)];
      return {
        isReading: true,
        readingText: r.text,
        question: `【長篇閱讀理解】Read the passage and answer the question:\n${r.q}`,
        options: [r.ans, ...getRandItems(r.wrongs, 3)],
        answer: 0,
        hint: '💡 提示：仔細閱讀文章並找出對應段落。',
        explanation: `📖 詳解：${r.exp}`
      };
    } else {
      const g8Vocab = [
        { q: `The heavy rain caused a huge ________ in the city, making it impossible for cars to pass through the streets.`, ans: 'flood', wrongs: ['drought', 'earthquake', 'typhoon', 'fire'] },
        { q: `The little boy was so ________ that he drank three glasses of water.`, ans: 'thirsty', wrongs: ['hungry', 'full', 'tired', 'bored'] },
        { q: `We need to ________ our earth, or our children will not have a beautiful home to live in.`, ans: 'protect', wrongs: ['destroy', 'pollute', 'ignore', 'waste'] },
        { q: `The math question was so difficult that ________ students could answer it.`, ans: 'few', wrongs: ['a few', 'little', 'a little', 'many'] }
      ];
      const v = g8Vocab[Math.floor(rand() * g8Vocab.length)];
      return { 
        question: `【進階字彙與文法】\n${v.q}`, 
        options: [v.ans, ...getRandItems(v.wrongs, 3)], 
        answer: 0, 
        hint: '💡 提示：根據前後文語意判斷。',
        explanation: `📖 詳解：${v.exp}` 
      };
    }
  } else if (gradeId === 'g9') {
    const variant = Math.floor(rand() * 3);
    if (variant === 0) {
      const readings9 = [
        { 
          text: `【Notice: School Library Renovation】\nThe school library will be closed for renovation starting from next Monday, October 15th, until Friday, November 2nd. During this period, students will not be able to check out new books. However, the study rooms on the second floor will remain open for students to prepare for exams. Late fees for all overdue books will be waived during the renovation.`, 
          q: `According to the notice, which of the following statements is TRUE?`, 
          ans: 'Students can still use the study rooms on the second floor.', wrongs: ['Students can check out books from the study rooms.', 'Students have to pay extra money if they return books late during this period.', 'The library renovation will last for exactly one week.', 'The library will be permanently closed.'],
          exp: `文章提到 "the study rooms on the second floor will remain open"，故第一個選項正確。陷阱：late fees 會被 waived (免除)。`
        },
        { 
          text: `Electric cars are becoming more popular around the world. Unlike gas-powered cars, electric cars do not produce air pollution while driving. They are also quieter. However, some people are still worried about buying them because charging stations are not as easy to find as gas stations, and it takes longer to charge a battery than to fill up a gas tank.`, 
          q: `What is one disadvantage (缺點) of electric cars mentioned in the reading?`, 
          ans: 'It takes a longer time to charge them.', wrongs: ['They are too noisy.', 'They produce a lot of air pollution.', 'They are too fast to drive safely.', 'They are cheaper than gas-powered cars.'],
          exp: `文章結尾提到 "it takes longer to charge a battery than to fill up a gas tank"，這是缺點之一。`
        }
      ];
      const r = readings9[Math.floor(rand() * readings9.length)];
      return {
        isReading: true,
        readingText: r.text,
        question: `【長篇閱讀理解】According to the reading, answer the question:\n${r.q}`,
        options: [r.ans, ...getRandItems(r.wrongs, 3)],
        answer: 0,
        hint: '💡 提示：仔細比對文章中提到的關鍵字。',
        explanation: `📖 詳解：${r.exp}`
      };
    } else if (variant === 1) {
      const g9Grammar = [
        { q: `${name1} has lived in Taipei ________ ten years ago.`, ans: 'since', wrongs: ['for', 'in', 'from', 'at'], exp: '現在完成式中，搭配明確的起點時間 (ten years ago) 要用 since。陷阱：看到 ten years 就想選 for，但後面有 ago，代表時間點。' },
        { q: `I have ________ been to America, so I want to go there this summer.`, ans: 'never', wrongs: ['ever', 'already', 'just', 'yet'], exp: '因為想去，代表「從沒去過」，用 never。' },
        { q: `The book ________ I bought yesterday is very interesting.`, ans: 'which', wrongs: ['who', 'whom', 'what', 'where'], exp: '先行詞 The book 是事物，關代用 which (或 that)。' },
        { q: `Do you know where ________?`, ans: 'he lives', wrongs: ['does he live', 'is he living', 'he live', 'did he live'], exp: '間接問句要還原為肯定句的主謂順序：主詞 + 動詞 (where he lives)。' }
      ];
      const g = g9Grammar[Math.floor(rand() * g9Grammar.length)];
      return { 
        question: `【文法陷阱題】\n${g.q}`, 
        options: [g.ans, ...getRandItems(g.wrongs, 3)], 
        answer: 0, 
        hint: '💡 提示：注意時態與連接詞用法。',
        explanation: `📖 詳解：${g.exp}` 
      };
    } else {
      const g9Passive = [
        { q: `Look! The boy ________ by a big dog. We should go help him!`, ans: 'is being chased', wrongs: ['chased', 'is chasing', 'has chased', 'was chasing'], exp: '男孩「正在被」狗追，需要用現在進行式的被動語態 (is being + Vpp)。' },
        { q: `The bridge ________ fifty years ago.`, ans: 'was built', wrongs: ['built', 'has built', 'is built', 'builds'], exp: '橋是「被建造」的，且時間是 fifty years ago (過去式)，故用 was built。' },
        { q: `English ________ in many countries around the world.`, ans: 'is spoken', wrongs: ['speaks', 'is speaking', 'has spoken', 'spoke'], exp: '英文是「被說」的，客觀事實用現在式的被動語態 is spoken。' },
        { q: `The homework must ________ before tomorrow.`, ans: 'be finished', wrongs: ['finish', 'is finished', 'finished', 'have finished'], exp: '助動詞 must 後面接被動語態時，要用 be + Vpp。' }
      ];
      const p = g9Passive[Math.floor(rand() * g9Passive.length)];
      return { 
        question: `【被動語態陷阱】\n${p.q}`, 
        options: [p.ans, ...getRandItems(p.wrongs, 3)], 
        answer: 0, 
        hint: '💡 提示：注意動作是主動還是被動，並搭配正確的時態。',
        explanation: `📖 詳解：${p.exp}` 
      };
    }
  }

  // Fallback
  return {
    question: `【英文基礎語法題】Regarding "${conceptTag}" (Index ${index}), choose the correct answer:`,
    options: ['Correct Option', 'Wrong Option 1', 'Wrong Option 2', 'Wrong Option 3'],
    answer: 0,
    hint: '💡 提示：Review the grammar rules.',
    explanation: `📖 詳解：This is a basic grammar question.`
  };
}
