export function getHardEnglishQuestion(gradeId, unitId, index, rand, preamble, conceptTag) {
  const uNum = parseInt(String(unitId).split('-').pop().replace(/u/i, ''), 10) || 1;

  if (gradeId === 'g7') {
    const archetypes = [
      () => ({
        question: `【進階克漏字解析：詞性與時態混合】${preamble}\nChoose the CORRECT sentence that implies a future scheduled event rather than just an intention:\n"The train ________ at 8:00 AM tomorrow."`,
        options: [
          `leaves`,
          `will have left`,
          `is going to leave`,
          `leaving`
        ],
        answer: 0,
        hint: `💡 提示：表示「既定行程、時刻表」的未來事件，習慣用現在簡單式。`,
        explanation: `📖 詳解：火車、班機等有固定時刻表的未來事件，英文習慣使用「現在簡單式 (leaves)」來代替未來式。will have left 是未來完成式；is going to leave 較偏向個人打算。`
      }),
      () => ({
        question: `【高難度文法：附加問句與否定副詞】${preamble}\nIdentify the grammatically correct tag question for the following sentence:\n"She rarely goes to the library on weekends, ________?"`,
        options: [
          `does she`,
          `doesn't she`,
          `is she`,
          `isn't she`
        ],
        answer: 0,
        hint: `💡 提示：rarely (幾乎不) 是否定副詞，附加問句需用肯定。`,
        explanation: `📖 詳解：rarely 具有否定含義，因此主要子句被視為「否定句」，後面的附加問句必須用「肯定形式」。且動詞為一般動詞 goes，故用 does she。`
      })
    ];
    return archetypes[Math.abs(index + Math.floor(rand() * 11)) % archetypes.length]();
  }

  if (gradeId === 'g8') {
    const archetypes = [
      () => ({
        question: `【被動語態與使役動詞陷阱】${preamble}\nChoose the best translation or structure for:\n"The teacher made us ________ the poem, but later we were made ________ it again by the principal."`,
        options: [
          `memorize / to memorize`,
          `to memorize / memorize`,
          `memorized / memorizing`,
          `memorize / memorize`
        ],
        answer: 0,
        hint: `💡 提示：使役動詞 make 在主動語態接原形動詞；在被動語態中則必須還原 to。`,
        explanation: `📖 詳解：第一格：make + O. + V (原形)，故用 memorize。第二格：be made + to V (被動語態需加 to)，故用 to memorize。`
      })
    ];
    return archetypes[Math.abs(index + Math.floor(rand() * 11)) % archetypes.length]();
  }

  if (gradeId === 'g9') {
    const archetypes = [
      () => ({
        question: `【關係子句最高難度：省略與介系詞】${preamble}\nChoose the correct relative pronoun structure:\n"This is the very house ________ Shakespeare lived in his later years."`,
        options: [
          `in which`,
          `where`,
          `which`,
          `that in`
        ],
        answer: 0,
        hint: `💡 提示：句尾已經有介系詞 in，前面不能再用 where 或 in which。`,
        explanation: `📖 詳解：句尾已經有 lived "in"，代表關係代名詞只能是 which 或 that（不可用 where，因為 where = in which，會變成 in in which）。且先行詞前有 the very 修飾，通常偏好用 that，但選項中僅 which 符合語法結構。`
      })
    ];
    return archetypes[Math.abs(index + Math.floor(rand() * 11)) % archetypes.length]();
  }

  return {
    question: `【英文高階綜合挑戰】${preamble}\nWhich of the following sentences contains a dangling modifier?`,
    options: [
      `Walking down the street, a beautiful sunset caught my eye.`,
      `Walking down the street, I saw a beautiful sunset.`,
      `Exhausted after the marathon, she collapsed on the grass.`,
      `To bake a perfect cake, you must measure the ingredients accurately.`
    ],
    answer: 0,
    hint: `💡 提示：懸垂修飾語（Dangling Modifier）代表分詞構句的主詞與主要子句的主詞不一致。`,
    explanation: `📖 詳解：(A) 句意變成「美麗的夕陽走在街上」，這是典型的懸垂修飾語錯誤。分詞 Walking 的邏輯主詞應該是人，但主要子句主詞卻是 sunset。`
  };
}
