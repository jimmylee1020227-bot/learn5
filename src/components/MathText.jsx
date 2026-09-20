import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

function cleanMath(raw) {
  if (typeof raw !== 'string') return '';
  let expr = raw.trim();
  // 處理內部或未加反斜線的根號符號 (例如 4√5, √119, 10√3)
  expr = expr.replace(/([0-9a-zA-Z]*)[√](\d+)/g, (_, coef, num) => (coef || '') + '\\sqrt{' + num + '}');
  // 乘除號全面標準化為教科書標準 KaTeX 符號
  expr = expr.replace(/×/g, ' \\times ');
  expr = expr.replace(/÷/g, ' \\div ');
  // 上標次方與指數
  expr = expr.replace(/²/g, '^2');
  expr = expr.replace(/³/g, '^3');
  expr = expr.replace(/⁴/g, '^4');
  expr = expr.replace(/¹\/ₓ³/g, '\\frac{1}{x^3}');
  expr = expr.replace(/¹\/ₓ/g, '\\frac{1}{x}');
  // 角度度數
  expr = expr.replace(/°/g, '^\\circ');
  // 將公式內連續出現的中文字元包裹在 \text{} 中，避免 KaTeX 報錯
  expr = expr.replace(/([\u4e00-\u9fa5]+)/g, '\\text{$1}');
  return expr;
}

export function tokenizeMathText(text) {
  if (typeof text !== 'string') return [{ type: 'text', content: text }];
  
  const regex = /(\$[^\$]+\$)|(`[^`]+`)|(\\frac\{[^{}]+\}\{[^{}]+\})|(\\sqrt\{[^{}]+\})|([0-9a-zA-Z]*√[0-9a-zA-Z]+)|(\\triangle\s*[A-Z]+)|(\\angle\s*[A-Z0-9]+)|(\\parallel|\\perp|\\pm|\\times|\\div|\\le|\\ge|\\approx|\\neq|\\cong|\\sim)/g;
  
  const tokens = [];
  let lastIndex = 0;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    
    let raw = match[0];
    if (raw.startsWith('$') && raw.endsWith('$')) {
      raw = raw.slice(1, -1);
    } else if (raw.startsWith('`') && raw.endsWith('`')) {
      raw = raw.slice(1, -1);
    }
    tokens.push({ type: 'math', content: cleanMath(raw), raw });
    lastIndex = regex.lastIndex;
  }
  
  if (lastIndex < text.length) {
    tokens.push({ type: 'text', content: text.slice(lastIndex) });
  }
  return tokens;
}

export default function MathText({ text }) {
  if (typeof text !== 'string') return text;

  const tokens = tokenizeMathText(text);

  return (
    <>
      {tokens.map((token, i) => {
        if (token.type === 'math') {
          return (
            <InlineMath 
              key={i} 
              math={token.content} 
              renderError={() => <span>{token.raw || token.content}</span>}
            />
          );
        }
        
        // 普通文字支援換行 \n
        return (
          <span key={i}>
            {token.content.split('\n').map((line, j, arr) => (
              <React.Fragment key={j}>
                {line}
                {j < arr.length - 1 && <br />}
              </React.Fragment>
            ))}
          </span>
        );
      })}
    </>
  );
}
