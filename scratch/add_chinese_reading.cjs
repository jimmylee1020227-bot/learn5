const fs = require('fs');
let content = fs.readFileSync('src/data/chineseGenerator.js', 'utf8');

const readingArchetype = `
        () => {
          const texts = [
            { title: "《岳陽樓記》", content: "予觀夫巴陵勝狀，在洞庭一湖。銜遠山，吞長江，浩浩湯湯，橫無際涯；朝暉夕陰，氣象萬千。", question: "文中「銜遠山，吞長江」使用了何種修辭手法？", ans: "擬人", options: ["譬喻", "誇飾", "排比"] },
            { title: "《愛蓮說》", content: "予獨愛蓮之出淤泥而不染，濯清漣而不妖，中通外直，不蔓不枝，香遠益清，亭亭淨植，可遠觀而不可褻玩焉。", question: "作者以「蓮」象徵何種人格特質？", ans: "君子", options: ["隱士", "富貴", "平民"] }
          ];
          const t = texts[Math.floor(rand() * texts.length)];
          
          return {
            question: \`【長篇閱讀測驗】\${preamble}\\n請閱讀以下短文並回答問題：\\n\\n\${t.title}\\n「\${t.content}」\\n\\n問題：\${t.question}\`,
            options: [t.ans, ...t.options],
            answer: 0,
            hint: \`💡 提示：根據文章內容與常見國學常識進行判斷。\`,
            explanation: \`📖 詳解：本題測驗國文閱讀理解，正確答案為「\${t.ans}」。\`
          };
        },
`;

content = content.replace(/const archetypes = \[\n\s*\(\) => {/g, function(match, offset) {
  if (offset < 4000) { 
     return `const archetypes = [\n${readingArchetype}        () => {`;
  }
  return match;
});

fs.writeFileSync('src/data/chineseGenerator.js', content);
