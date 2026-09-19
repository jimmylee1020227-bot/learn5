export function generateChineseQuestion(gradeId, unitId, index, difficulty, rand, conceptTag) {
  const variant = Math.floor(rand() * 4);

  if (variant === 0) {
    // 閱讀測驗 (文言文)
    const texts = [
      {
        text: `【文言文閱讀測驗】\n「子曰：『學而時習之，不亦說乎？有朋自遠方來，不亦樂乎？人不知而不慍，不亦君子乎？』」`,
        question: `關於這段《論語》的敘述，下列何者「最不符合」孔子的原意？`,
        options: [
          '「人不知而不慍」是指別人不了解我，我也不會生氣。',
          '「學而時習之，不亦說乎」強調學習後時常溫習是一件快樂的事。',
          '「有朋自遠方來」指的是朋友遠道而來拜訪，令人感到高興。',
          '整段話主要在強調交友的重要性，學習只是其次。'
        ],
        answer: 3,
        hint: '💡 提示：分析三句話各自的重點，第一句講學習，第二句講交友，第三句講修養。',
        explanation: `📖 詳解：孔子這段話分別論述了「學習的樂趣」、「交友的快樂」與「君子的修養」，三者並重，並非只強調交友，故第四個選項錯誤。`
      },
      {
        text: `【文言文閱讀測驗】\n「世有伯樂，然後有千里馬。千里馬常有，而伯樂不常有。故雖有名馬，祇辱於奴隸人之手，駢死於槽櫪之間，不以千里稱也。」(韓愈《馬說》)`,
        question: `根據上文，韓愈認為「千里馬」之所以「不以千里稱也」的主要原因為何？`,
        options: [
          '因為缺乏懂得賞識千里馬的伯樂。',
          '因為千里馬的數量實在太少了。',
          '因為千里馬生病死在馬槽裡。',
          '因為養馬的奴隸刻意虐待千里馬。'
        ],
        answer: 0,
        hint: '💡 提示：注意「千里馬常有，而伯樂不常有」這句話的意思。',
        explanation: `📖 詳解：韓愈藉此文抒發懷才不遇之感，強調世上不乏人才(千里馬)，但缺乏能識才、用才的長官(伯樂)，導致人才被埋沒。故選「缺乏懂得賞識的伯樂」。`
      }
    ];
    const item = texts[index % texts.length];
    return {
      isReading: true,
      readingText: item.text,
      question: item.question,
      options: item.options,
      answer: item.answer,
      hint: item.hint,
      explanation: item.explanation
    };
  } else if (variant === 1) {
    const rhetorics = [
      { r: '轉化（擬人）', s: '太陽的臉紅起來了，微風在耳邊輕聲唱歌。', exp: '賦予無生命事物人類的情感動作。' },
      { r: '排比', s: '做人要像山一樣沉穩，像水一樣包容，像風一樣自在。', exp: '三個結構相似短句連續排列加強語氣。' },
      { r: '誇飾', s: '白髮三千丈，緣愁似個長。', exp: '超越客觀事實之誇張描繪。' }
    ];
    const rh = rhetorics[index % rhetorics.length];
    return {
      question: `【語文修辭技巧判讀】文句：「${rh.s}」主要運用了何種修辭技巧？`,
      options: [rh.r, rhetorics[(index+1)%rhetorics.length].r, '譬喻', '倒反'],
      answer: 0,
      hint: `💡 提示：${rh.exp}`,
      explanation: `📖 詳解：「${rh.s}」運用了「${rh.r}」，${rh.exp}`
    };
  } else {
    const sentenceTypes = [
      { t: '判斷句', s: '知之為知之，不知為不知，是知也。', exp: '以「是、非、乃」為繫詞肯定主語屬性。' },
      { t: '敘事句', s: '孔雀東南飛，五里一徘徊。', exp: '以主詞＋述語動詞敘述動作行徑。' }
    ];
    const st = sentenceTypes[index % sentenceTypes.length];
    return {
      question: `【中文四大句型判讀】文句：「${st.s}」在語法句型上屬於下列哪一種？`,
      options: [st.t, sentenceTypes[(index+1)%sentenceTypes.length].t, '表態句', '有無句'],
      answer: 0,
      hint: `💡 提示：分析句中核心謂語（動詞、繫詞、有無、形容詞）。`,
      explanation: `📖 詳解：「${st.s}」為典型的「${st.t}」，${st.exp}`
    };
  }
}
