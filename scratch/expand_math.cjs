const fs = require('fs');

let content = fs.readFileSync('src/data/mathGenerator.js', 'utf8');

// I will add more archetypes to g7 u1 and u2.
const newArchetypesU1 = `
        () => {
          const a = Math.floor(rand() * 20) + 10;
          const b = Math.floor(rand() * 15) + 5;
          const c = Math.floor(rand() * 10) + 2;
          const ans = (a - b) * c;
          return {
            question: \`【盈虧問題】\${preamble}\\n某商店進貨成本為每件 \${b} 元，售價定為每件 \${a} 元，今天共賣出了 \${c} 件。請問今天的總利潤（盈餘）為多少元？\`,
            options: [\`\${ans}\`, \`\${ans + 5}\`, \`\${ans - c}\`, \`\${a * c}\`],
            answer: 0,
            hint: \`💡 提示：利潤 = (售價 - 成本) $\\times$ 數量。\`,
            explanation: \`📖 詳解：每件利潤為 \${a} - \${b} = \${a - b} 元，賣出 \${c} 件總利潤為 (\${a} - \${b}) \\times \${c} = \${ans} 元。\`
          };
        },
        () => {
          const temp1 = Math.floor(rand() * 15) + 5;
          const drop = Math.floor(rand() * 8) + 3;
          const rise = Math.floor(rand() * 10) + 4;
          const ans = temp1 - drop + rise;
          return {
            question: \`【溫度變化問題】\${preamble}\\n今日早晨氣溫為 \${temp1} 度，中午因為下雨氣溫下降了 \${drop} 度，到了下午太陽出來氣溫又回升了 \${rise} 度。請問下午的氣溫為幾度？\`,
            options: [\`\${ans}\`, \`\${ans + 2}\`, \`\${ans - 1}\`, \`\${temp1 + rise}\`],
            answer: 0,
            hint: \`💡 提示：下降用減法，回升用加法，按順序計算即可。\`,
            explanation: \`📖 詳解：\${temp1} - \${drop} + \${rise} = \${ans} 度。\`
          };
        },
        () => {
          const start = Math.floor(rand() * 10) - 5;
          const move1 = Math.floor(rand() * 8) + 2;
          const move2 = Math.floor(rand() * 12) + 3;
          const ans = start + move1 - move2;
          return {
            question: \`【數線位移問題】\${preamble}\\n一隻青蛙在數線上，起點位於坐標 \${start}。牠先向右跳了 \${move1} 單位，接著又向左跳了 \${move2} 單位。請問青蛙最後停在數線上的哪一個坐標？\`,
            options: [\`\${ans}\`, \`\${ans + 1}\`, \`\${ans - 1}\`, \`\${start + move1 + move2}\`],
            answer: 0,
            hint: \`💡 提示：向右跳代表加，向左跳代表減。\`,
            explanation: \`📖 詳解：\${start} + \${move1} - \${move2} = \${ans}。\`
          };
        },
`;

const newArchetypesU2 = `
        () => {
          const num = Math.floor(rand() * 900) + 100;
          const zeros = Math.floor(rand() * 4) + 3;
          const value = num * Math.pow(10, zeros);
          const a = num / 100;
          const n = zeros + 2;
          return {
            question: \`【科學記號轉換】\${preamble}\\n將 \${value} 寫成科學記號 $a \\times 10^n$ 的形式，其中 $a$ 與 $n$ 的值分別為何？\`,
            options: [\`$a = \${a}, n = \${n}$\`, \`$a = \${num/10}, n = \${n-1}$\`, \`$a = \${a}, n = \${n-1}$\`, \`$a = \${num}, n = \${zeros}$\`],
            answer: 0,
            hint: \`💡 提示：科學記號標準型必須滿足 $1 \\le a < 10$，小數點向左移動 $n$ 位。\`,
            explanation: \`📖 詳解：\${value} 的小數點向左移 \${n} 位，得到 \${a}，因此科學記號為 $\${a} \\times 10^{\${n}}$。\`
          };
        },
        () => {
          const a = Math.floor(rand() * 8) + 2;
          const n = -(Math.floor(rand() * 5) + 3);
          const b = Math.floor(rand() * 5) + 2;
          const m = -(Math.floor(rand() * 4) + 2);
          const ansA = a * b;
          const ansN = n + m;
          const finalA = ansA >= 10 ? ansA / 10 : ansA;
          const finalN = ansA >= 10 ? ansN + 1 : ansN;
          return {
            question: \`【科學記號乘法】\${preamble}\\n計算 $(\${a} \\times 10^{\${n}}) \\times (\${b} \\times 10^{\${m}})$，並將結果化為科學記號標準型為何？\`,
            options: [\`$\${finalA} \\times 10^{\${finalN}}$\`, \`$\${ansA} \\times 10^{\${ansN}}$\`, \`$\${finalA} \\times 10^{\${finalN - 1}}$\`, \`$\${a+b} \\times 10^{\${n+m}}$\`],
            answer: 0,
            hint: \`💡 提示：數字部分相乘，指數部分相加，最後檢查是否滿足 $1 \\le a < 10$。\`,
            explanation: \`📖 詳解：$(\${a} \\times \${b}) \\times 10^{\${n} + (\${m})} = \${ansA} \\times 10^{\${ansN}}$。化為標準型為 $\${finalA} \\times 10^{\${finalN}}$。\`
          };
        },
`;

content = content.replace(/const archetypes = \[\n\s*\(\) => {/g, function(match, offset) {
  if (offset < 2000) { // u1
     return `const archetypes = [\n${newArchetypesU1}        () => {`;
  }
  return match;
});

content = content.replace(/const archetypes = \[\n\s*\(\) => \(\{/g, function(match, offset) {
  if (offset > 2000 && offset < 4000) { // u2
     return `const archetypes = [\n${newArchetypesU2}        () => ({`;
  }
  return match;
});

fs.writeFileSync('src/data/mathGenerator.js', content);
