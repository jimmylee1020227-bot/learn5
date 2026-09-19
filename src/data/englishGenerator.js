export function generateEnglishQuestion(gradeId, unitId, index, difficulty, rand, conceptTag) {
  const names = ['Tom', 'Amy', 'Peter', 'Emily', 'Jason', 'Lucy', 'John', 'Sarah'];
  const name1 = names[index % names.length];
  const name2 = names[(index + 1) % names.length];
  const variant = Math.floor(rand() * 10); 

  if (gradeId === 'g7') {
    if (variant < 3) {
      // 聽力題 (Listening)
      return {
        isListening: true,
        audioText: `Man: Excuse me, how much is this jacket?\nWoman: It was fifty dollars yesterday, but it's on sale today for thirty dollars.\nMan: Great, I'll take it.`,
        question: `【英文聽力測驗】Listen to the conversation. How much will the man pay for the jacket?`,
        options: ['$30', '$50', '$20', '$80'],
        answer: 0,
        hint: '💡 提示：點擊「播放聽力語音」。注意聽 "today" (今天) 的價格。',
        explanation: `📖 聽力原文：It was fifty dollars yesterday, but it's on sale today for thirty dollars.\n詳解：外套今天特價 30 元。`
      };
    } else if (variant < 6) {
      // 英文情境對話 Chat
      return {
        isChat: true,
        chatMessages: [
          { sender: name1, text: `Hey ${name2}, are you free this weekend?` },
          { sender: name2, text: `I think so. What's up?`, isRight: true },
          { sender: name1, text: `I was wondering if you'd like to go to the movies with me.` },
          { sender: name2, text: `________. What time?`, isRight: true }
        ],
        question: `【英文對話情境】Which of the following is the best response to fill in the blank?`,
        options: [`Sure, I'd love to`, `No, I don't like movies`, `I am very busy`, `You are welcome`],
        answer: 0,
        hint: `💡 提示：根據 "${name2}" 後面接著問 "What time?"，代表他答應了邀約。`,
        explanation: `📖 詳解：既然對方接著問時間 (What time?)，表示同意邀約，因此 "Sure, I'd love to" (當然，我很樂意) 是最合適的回答。`
      };
    } else {
      return { 
        question: `【文法陷阱題】\nIf it ________ tomorrow, we will not go to the beach.`, 
        options: ['rains', 'will rain', 'rained', 'is raining'], 
        answer: 0, 
        hint: '💡 提示：條件子句 (If 帶領的子句) 中，要用「現在式代替未來式」。',
        explanation: '📖 詳解：條件子句 (If 帶領的子句) 中，要用「現在式代替未來式」。故填 rains。' 
      };
    }
  } else if (gradeId === 'g8') {
    if (variant < 4) {
      return {
        isReading: true,
        readingText: `Dear ${name1},\nHow have you been? I am writing to tell you about my trip to Japan last week. It was amazing! I visited many famous temples in Kyoto and ate delicious sushi in Osaka. The weather was a bit cold, but the scenery was beautiful. I took a lot of photos and I can't wait to show them to you when we meet next Monday at the cafe.\nBest,\n${name2}`,
        question: `【長篇閱讀理解】Read the email and answer the question:\nWhat is the main purpose of this email?`,
        options: ['To share travel experiences in Japan.', 'To invite someone to visit Kyoto.', 'To complain about the cold weather.', 'To ask for recommendations for sushi restaurants.'],
        answer: 0,
        hint: '💡 提示：根據第一段 "I am writing to tell you about my trip to Japan..." 判斷主旨。',
        explanation: `📖 詳解：信件開頭明確表示寫信的目的是為了分享去日本旅行的經驗 (tell you about my trip to Japan)。`
      };
    } else {
      return { 
        question: `【進階字彙與片語】\nThe heavy rain caused a huge ________ in the city, making it impossible for cars to pass through the streets.`, 
        options: ['flood', 'drought', 'earthquake', 'typhoon'], 
        answer: 0, 
        hint: '💡 提示：大雨會造成什麼災害？',
        explanation: '📖 詳解：heavy rain (大雨) 會造成 flood (水災/淹水)。' 
      };
    }
  } else if (gradeId === 'g9') {
    if (variant < 4) {
      return {
        isReading: true,
        readingText: `【Notice: School Library Renovation】\nThe school library will be closed for renovation starting from next Monday, October 15th, until Friday, November 2nd. During this period, students will not be able to check out new books. However, the study rooms on the second floor will remain open for students to prepare for exams. Late fees for all overdue books will be waived during the renovation.`,
        question: `【長篇閱讀理解】According to the notice, which of the following statements is TRUE?`,
        options: ['Students can still use the study rooms on the second floor.', 'Students can check out books from the study rooms.', 'Students have to pay extra money if they return books late during this period.', 'The library renovation will last for exactly one week.'],
        answer: 0,
        hint: '💡 提示：仔細比對文章中提到 study rooms 以及 late fees 的段落。',
        explanation: `📖 詳解：文章提到 "the study rooms on the second floor will remain open"，故第一個選項正確。陷阱：late fees 會被 waived (免除)。`
      };
    } else if (variant < 7) {
      return { 
        question: `【文法陷阱題】\n${name1} has lived in Taipei ________ ten years ago.`, 
        options: ['since', 'for', 'in', 'from'], 
        answer: 0, 
        hint: '💡 提示：搭配明確的起點時間 (ten years ago) 要用 since。',
        explanation: '📖 詳解：現在完成式中，搭配明確的起點時間 (ten years ago) 要用 since。陷阱：看到 ten years 就想選 for，但後面有 ago，代表時間點。' 
      };
    } else {
      return { 
        question: `【文法陷阱題】\nLook! The boy ________ by a big dog. We should go help him!`, 
        options: ['is being chased', 'chased', 'is chasing', 'has chased'], 
        answer: 0, 
        hint: '💡 提示：男孩「正在被」狗追，需要用現在進行式的被動語態。',
        explanation: '📖 詳解：男孩「正在被」狗追，需要用現在進行式的被動語態 (is being + Vpp)。' 
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
