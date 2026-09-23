const fs = require('fs');

let content = fs.readFileSync('src/data/englishGenerator.js', 'utf8');

const ttsArchetype = `
        () => {
          const conversations = [
            { text: "Where did you go last weekend?", ans: "I went to the museum.", tts: "Where did you go last weekend?", options: ["I go to the museum.", "I am going to the museum.", "I will go to the museum."] },
            { text: "How long does it take to get to the station?", ans: "About 15 minutes by bus.", tts: "How long does it take to get to the station?", options: ["About 15 kilometers.", "It takes 15 dollars.", "At 3 o'clock."] },
            { text: "Have you ever been to Japan?", ans: "Yes, I have.", tts: "Have you ever been to Japan?", options: ["Yes, I do.", "Yes, I am.", "Yes, I will."] }
          ];
          const conv = conversations[Math.floor(rand() * conversations.length)];
          const correctAns = conv.ans;
          
          return {
            question: \`【英語聽力測驗】\${preamble}\\n請點擊上方按鈕聆聽語音，並選出最適合的回應。\`,
            tts: conv.tts,
            ttsLang: 'en-US',
            options: [correctAns, ...conv.options],
            answer: 0,
            hint: \`💡 提示：注意聽時態與問句詞 (WH-questions)。\`,
            explanation: \`📖 詳解：聽力原文為「\${conv.text}」，最適合的回應為「\${correctAns}」。\`
          };
        },
`;

content = content.replace(/const archetypes = \[\n\s*\(\) => {/g, function(match, offset) {
  if (offset < 4000) { // inject into u1/u2
     return `const archetypes = [\n${ttsArchetype}        () => {`;
  }
  return match;
});

fs.writeFileSync('src/data/englishGenerator.js', content);
