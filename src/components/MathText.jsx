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
  // 避免將已經在 \text{...} 內的中文字再次包裹
  expr = expr.replace(/\\text\{[^{}]*\}/g, (m) => m.replace(/[\u4e00-\u9fa5]/g, (c) => `__CJK_${c.charCodeAt(0)}__`));
  expr = expr.replace(/([\u4e00-\u9fa5]+)/g, '\\text{$1}');
  expr = expr.replace(/__CJK_(\d+)__/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
  return expr;
}

class MathErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {}
  render() {
    if (this.state.hasError) {
      return <span>{this.props.fallback}</span>;
    }
    return this.props.children;
  }
}

export function tokenizeMathText(text) {
  const str = text === null || text === undefined ? '' : String(text);
  if (!str) return [];
  
  // 優先匹配 $$...$$ 區塊公式，再匹配 $...$ 行內公式與常見數學語法
  const regex = /(\$\$[\s\S]+?\$\$)|(\$[^$\n]+?\$)|(`[^`]+`)|(\\frac\{[^{}]+\}\{[^{}]+\})|(\\sqrt\{[^{}]+\})|([0-9a-zA-Z]*√[0-9a-zA-Z]+)|(\\triangle\s*[A-Z]+)|(\\angle\s*[A-Z0-9]+)|(\\parallel|\\perp|\\pm|\\times|\\div|\\le|\\ge|\\approx|\\neq|\\cong|\\sim)/g;
  
  const tokens = [];
  let lastIndex = 0;
  let match;
  
  while ((match = regex.exec(str)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', content: str.slice(lastIndex, match.index) });
    }
    
    let raw = match[0];
    if (raw.startsWith('$$') && raw.endsWith('$$') && raw.length >= 4) {
      raw = raw.slice(2, -2);
    } else if (raw.startsWith('$') && raw.endsWith('$') && raw.length >= 2) {
      raw = raw.slice(1, -1);
    } else if (raw.startsWith('`') && raw.endsWith('`') && raw.length >= 2) {
      raw = raw.slice(1, -1);
    }
    tokens.push({ type: 'math', content: cleanMath(raw), raw: match[0] });
    lastIndex = regex.lastIndex;
  }
  
  if (lastIndex < str.length) {
    tokens.push({ type: 'text', content: str.slice(lastIndex) });
  }
  return tokens;
}

export default function MathText({ text }) {
  if (text === null || text === undefined) return null;
  const str = String(text);

  const tokens = tokenizeMathText(str);

  return (
    <>
      {tokens.map((token, i) => {
        if (token.type === 'math') {
          return (
            <MathErrorBoundary key={i} fallback={token.raw || token.content}>
              <InlineMath 
                math={token.content} 
                renderError={() => <span>{token.raw || token.content}</span>}
              />
            </MathErrorBoundary>
          );
        }
        
        // 普通文字支援換行 \n
        const contentStr = String(token.content || '');
        return (
          <span key={i}>
            {contentStr.split('\n').map((line, j, arr) => (
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
