import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

function preprocessText(text) {
  if (typeof text !== 'string') return text;
  
  // 1. 將反引號算式 `formula` 自動轉化為 LaTeX 數學模式 $formula$
  let s = text.replace(/`([^`]+)`/g, '$$$1$$');
  
  // 2. 將未包覆在 $ 中的根號符號 (如 4√5, 10√3, √119) 自動轉為 $\sqrt{...}$
  s = s.replace(/([0-9a-zA-Z]*)√([0-9a-zA-Z]+)/g, '$$$1\\sqrt{$2}$$');
  
  // 3. 若字串本身是純 LaTeX 指令 (如 \frac{10}{3} 或 \sqrt{119}) 且未加 $，自動補齊 $...$
  if (!s.includes('$') && (/\\(frac|sqrt|pm|le|ge|cdot|times|div|alpha|beta|theta|circ|triangle|angle)/.test(s))) {
    s = `$${s.trim()}$`;
  }
  
  return s;
}

function cleanMathExpr(expr) {
  if (typeof expr !== 'string') return expr;
  
  return expr
    .replace(/×/g, ' \\times ')
    .replace(/÷/g, ' \\div ')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/¹\/ₓ³/g, '\\frac{1}{x^3}')
    .replace(/¹\/ₓ/g, '\\frac{1}{x}')
    .replace(/°/g, '^\\circ')
    // 將公式內的連續中文字符自動包裹在 \text{} 中，避免 KaTeX 警告或字型渲染異常
    .replace(/([\u4e00-\u9fa5]+)/g, '\\text{$1}');
}

export default function MathText({ text }) {
  if (typeof text !== 'string') return text;

  const preprocessed = preprocessText(text);
  // 正則切割：依據 $...$ 分割出普通文字與數學公式
  const parts = preprocessed.split(/(\$.*?\$)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          const rawExpr = part.slice(1, -1);
          const mathExpr = cleanMathExpr(rawExpr);
          return (
            <InlineMath 
              key={i} 
              math={mathExpr} 
              renderError={() => <span>{rawExpr}</span>}
            />
          );
        }
        
        // 普通文字支援換行 \n
        return (
          <span key={i}>
            {part.split('\n').map((line, j, arr) => (
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
