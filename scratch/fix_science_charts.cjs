const fs = require('fs');

let content = fs.readFileSync('src/data/scienceGenerator.js', 'utf8');

// Replace the injected chart code with the correct one
const badString1 = `question: \\\`【實驗圖表判讀】\\\${preamble}\\\\n請觀察下方溫度隨時間變化的折線圖，並判斷在哪一個時間點溫度最高？\\\\n<div style="margin-top: 10px; padding: 10px; background: #fff; border-radius: 8px; border: 1px solid #ddd;">`;
const badStringRegex = /question: `【實驗圖表判讀】\$\{preamble\}\\n請觀察下方溫度隨時間變化的折線圖，並判斷在哪一個時間點溫度最高？\\n<div style="margin-top: 10px; padding: 10px; background: #fff; border-radius: 8px; border: 1px solid #ddd;">[\s\S]*?<\/div>`,/;

content = content.replace(badStringRegex, (match) => {
    return match.replace(/\\n<div[\s\S]*?<\/div>`/, '`').replace('question:', 'question: `【實驗圖表判讀】${preamble}\\n請觀察下方溫度隨時間變化的折線圖，並判斷在哪一個時間點溫度最高？`,\n            html: `<div style="margin-top: 10px; padding: 10px; background: #fff; border-radius: 8px; border: 1px solid #ddd;">\n              <svg width="200" height="120" viewBox="0 0 200 120">\n                <polyline fill="none" stroke="#ef4444" stroke-width="2" points="20,${100 - temps[0]} 70,${100 - temps[1]} 120,${100 - temps[2]} 170,${100 - temps[3]}" />\n                <circle cx="20" cy="${100 - temps[0]}" r="4" fill="#ef4444"/>\n                <circle cx="70" cy="${100 - temps[1]}" r="4" fill="#ef4444"/>\n                <circle cx="120" cy="${100 - temps[2]}" r="4" fill="#ef4444"/>\n                <circle cx="170" cy="${100 - temps[3]}" r="4" fill="#ef4444"/>\n                <text x="20" y="115" font-size="10" text-anchor="middle">1分</text>\n                <text x="70" y="115" font-size="10" text-anchor="middle">2分</text>\n                <text x="120" y="115" font-size="10" text-anchor="middle">3分</text>\n                <text x="170" y="115" font-size="10" text-anchor="middle">4分</text>\n              </svg>\n            </div>`,');
});

fs.writeFileSync('src/data/scienceGenerator.js', content);
