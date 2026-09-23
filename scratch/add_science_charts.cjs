const fs = require('fs');

let content = fs.readFileSync('src/data/scienceGenerator.js', 'utf8');

const chartArchetype = `
        () => {
          const temps = [Math.floor(rand() * 10) + 20, Math.floor(rand() * 10) + 25, Math.floor(rand() * 10) + 30, Math.floor(rand() * 10) + 35];
          const maxTemp = Math.max(...temps);
          
          return {
            question: \`【實驗圖表判讀】\${preamble}\\n請觀察下方溫度隨時間變化的折線圖，並判斷在哪一個時間點溫度最高？\\n<div style="margin-top: 10px; padding: 10px; background: #fff; border-radius: 8px; border: 1px solid #ddd;">
              <svg width="200" height="120" viewBox="0 0 200 120">
                <polyline fill="none" stroke="#ef4444" stroke-width="2" points="20,\${100 - temps[0]} 70,\${100 - temps[1]} 120,\${100 - temps[2]} 170,\${100 - temps[3]}" />
                <circle cx="20" cy="\${100 - temps[0]}" r="4" fill="#ef4444"/>
                <circle cx="70" cy="\${100 - temps[1]}" r="4" fill="#ef4444"/>
                <circle cx="120" cy="\${100 - temps[2]}" r="4" fill="#ef4444"/>
                <circle cx="170" cy="\${100 - temps[3]}" r="4" fill="#ef4444"/>
                <text x="20" y="115" font-size="10" text-anchor="middle">1分</text>
                <text x="70" y="115" font-size="10" text-anchor="middle">2分</text>
                <text x="120" y="115" font-size="10" text-anchor="middle">3分</text>
                <text x="170" y="115" font-size="10" text-anchor="middle">4分</text>
              </svg>
            </div>\`,
            options: [\`\${temps.indexOf(maxTemp) + 1} 分鐘\`, \`\${temps.indexOf(maxTemp) === 3 ? 1 : 4} 分鐘\`, \`2 分鐘\`, \`3 分鐘\`],
            answer: 0,
            hint: \`💡 提示：折線圖中最高點代表溫度最大值。\`,
            explanation: \`📖 詳解：根據圖表，最高點發生在第 \${temps.indexOf(maxTemp) + 1} 分鐘，溫度為 \${maxTemp} 度。\`
          };
        },
`;

content = content.replace(/const archetypes = \[\n\s*\(\) => {/g, function(match, offset) {
  if (offset < 4000) { // inject into u1/u2
     return `const archetypes = [\n${chartArchetype}        () => {`;
  }
  return match;
});

fs.writeFileSync('src/data/scienceGenerator.js', content);
