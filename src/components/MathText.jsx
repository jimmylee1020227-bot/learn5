import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

function cleanMath(raw) {
  if (typeof raw !== 'string') return '';
  let expr = raw.trim();

  // 1. 幾何符號（線段、三角形、角代號、圓、弧）
  expr = expr.replace(/線段\s*([A-Z][A-Z0-9\x27]*)/g, '\\overline{$1}');
  expr = expr.replace(/△([A-Za-z0-9\x27]+)/g, '\\triangle $1');
  expr = expr.replace(/∠([A-Za-z0-9\x27]+)/g, '\\angle $1');
  expr = expr.replace(/(?:⊙|圓\s*)([A-Z][0-9]?)/g, '\\odot $1');
  expr = expr.replace(/(?:弧|⌢)\s*([A-Z0-9]{2})/g, '\\overparen{$1}');

  // 2. 根號標準化（√119, 4√5, √x 等）
  expr = expr.replace(/([0-9a-zA-Z]*)[√](\d+|[a-zA-Z]+)/g, (_, coef, num) => (coef || '') + '\\sqrt{' + num + '}');

  // 3. 圓周率標準化
  expr = expr.replace(/π/g, ' \\pi ');

  // 4. 乘除號與幾何運算關係標準化為教科書 KaTeX 符號
  expr = expr.replace(/×/g, ' \\times ');
  expr = expr.replace(/÷/g, ' \\div ');
  expr = expr.replace(/[⊥∟⟂]/g, ' \\perp ');
  expr = expr.replace(/\/\//g, ' \\parallel ');
  expr = expr.replace(/∥/g, ' \\parallel ');
  expr = expr.replace(/≅/g, ' \\cong ');
  expr = expr.replace(/∼/g, ' \\sim ');
  expr = expr.replace(/±/g, ' \\pm ');
  expr = expr.replace(/≠/g, ' \\neq ');
  expr = expr.replace(/≤/g, ' \\le ');
  expr = expr.replace(/≥/g, ' \\ge ');
  expr = expr.replace(/≈/g, ' \\approx ');

  // 5. 上標次方與指數
  expr = expr.replace(/²/g, '^2');
  expr = expr.replace(/³/g, '^3');
  expr = expr.replace(/⁴/g, '^4');
  expr = expr.replace(/¹\/ₓ³/g, '\\frac{1}{x^3}');
  expr = expr.replace(/¹\/ₓ/g, '\\frac{1}{x}');

  // 6. 角度度數
  expr = expr.replace(/°/g, '^\\circ');

  // 7. 避免將已經在 \text{...} 內的中文字再次包裹
  expr = expr.replace(/\\text\{[^{}]*\}/g, (m) => m.replace(/[\u4e00-\u9fa5]/g, (c) => `__CJK_${c.charCodeAt(0)}__`));
  expr = expr.replace(/([\u4e00-\u9fa5]+)/g, '\\text{$1}');
  expr = expr.replace(/__CJK_(\d+)__/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
  return expr;
}

export function preprocessMathText(text) {
  if (text === null || text === undefined) return '';
  let s = String(text);

  const mathSegments = [];
  function pushMath(latex) {
    const idx = mathSegments.length;
    mathSegments.push(latex);
    return `\uE000M${idx}\uE000`;
  }

  function getMathContent(token) {
    const m = token.match(/^\uE000M(\d+)\uE000$/);
    if (m) {
      return mathSegments[parseInt(m[1], 10)];
    }
    return token;
  }

  // 0. 先保護原本已經存在的 $...$、$$...$$ 與 `...`
  s = s.replace(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$|`[^`]+`)/g, (m) => {
    let clean = m;
    if (clean.startsWith('$$') && clean.endsWith('$$')) clean = clean.slice(2, -2);
    else if (clean.startsWith('$') && clean.endsWith('$')) clean = clean.slice(1, -1);
    else if (clean.startsWith('`') && clean.endsWith('`')) clean = clean.slice(1, -1);
    return pushMath(clean);
  });

  // 1. 幾何線段：線段 AB、線段AB -> \overline{AB}
  s = s.replace(/線段\s*([A-Z][A-Z0-9\x27]*)/g, (_, seg) => pushMath(`\\overline{${seg}}`));

  // 2. 幾何三角形：△ABC、\triangle ABC -> \triangle ABC
  s = s.replace(/(?:△|\\triangle)\s*([A-Za-z0-9\x27]+)/g, (_, tri) => pushMath(`\\triangle ${tri}`));

  // 3. 幾何角：∠ABC、∠1、\angle A -> \angle A
  s = s.replace(/(?:∠|\\angle)\s*([A-Za-z0-9\x27]+)/g, (_, ang) => pushMath(`\\angle ${ang}`));

  // 4. 幾何圓：⊙O、圓 O -> \odot O
  s = s.replace(/(?:⊙|圓\s*)([A-Z][0-9]?)/g, (_, circ) => pushMath(`\\odot ${circ}`));

  // 5. 幾何弧：弧 AB、⌢AB -> \overparen{AB}
  s = s.replace(/(?:弧|⌢)\s*([A-Z0-9]{2})/g, (_, arc) => pushMath(`\\overparen{${arc}}`));

  // 6. 幾何關係（垂直、平行、全等、相似）
  const relRegex = /(\uE000M\d+\uE000|[A-Za-z0-9\x27_]+)\s*(⊥|(?:\/\/|∥)|≅|∼)\s*(\uE000M\d+\uE000|[A-Za-z0-9\x27_]+)/g;
  s = s.replace(relRegex, (_, p1, op, p2) => {
    const left = getMathContent(p1);
    const right = getMathContent(p2);
    let latexOp = '\\perp';
    if (op === '//' || op === '∥') latexOp = '\\parallel';
    else if (op === '≅') latexOp = '\\cong';
    else if (op === '∼') latexOp = '\\sim';
    return pushMath(`${left} ${latexOp} ${right}`);
  });

  // 7. 根號：√119, 4√5, √x
  s = s.replace(/([0-9a-zA-Z]*)[√](\d+|[a-zA-Z]+)/g, (_, coef, num) => pushMath(`${coef || ''}\\sqrt{${num}}`));

  // 8. 圓周率 π：如 2πr, πr², 5π -> 2\pi r, \pi r^2, 5\pi
  s = s.replace(/([0-9a-zA-Z]*)[π]([0-9a-zA-Z²³⁴]*)/g, (_, pre, post) => {
    let p = (post || '').replace(/²/g, '^2').replace(/³/g, '^3').replace(/⁴/g, '^4');
    return pushMath(`${pre || ''}\\pi ${p}`);
  });

  // 9. 單位與上標平方立方：x², y³, (x-1)², cm², m²
  s = s.replace(/(\bcm|m)\s*[²]/g, (_, unit) => pushMath(`\\text{${unit}}^2`));
  s = s.replace(/(\bcm|m)\s*[³]/g, (_, unit) => pushMath(`\\text{${unit}}^3`));
  s = s.replace(/(\([^)]+\)|[a-zA-Z0-9]+)[²]/g, (_, base) => pushMath(`${base}^2`));
  s = s.replace(/(\([^)]+\)|[a-zA-Z0-9]+)[³]/g, (_, base) => pushMath(`${base}^3`));

  // 10. 角度度數：60°、90°、180°
  s = s.replace(/([0-9]+)\s*°/g, (_, deg) => pushMath(`${deg}^\\circ`));

  // 11. 裸露的 LaTeX 命令（如果外面還沒包 $）
  s = s.replace(/(\\(?:overline|triangle|angle|frac|sqrt|odot|overparen|parallel|perp|cong|sim|times|div|pm|neq|le|ge|approx)\b(?:\{[^{}]*\}|\[[^\[\]]*\]|\s*[A-Za-z0-9]+)?)/g, (_, cmd) => pushMath(cmd));

  // 12. 還原全部公式為標準 $...$
  let iterations = 0;
  while (/\uE000M(\d+)\uE000/.test(s) && iterations < 10) {
    s = s.replace(/\uE000M(\d+)\uE000/g, (_, idx) => `$${mathSegments[parseInt(idx, 10)]}$`);
    iterations++;
  }

  return s;
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
  if (text === null || text === undefined) return [];
  // 先經由教育部標準符號預處理器將所有幾何/代數符號標準化
  const str = preprocessMathText(String(text));
  if (!str) return [];
  
  // 匹配：$$...$$、$...$、`...`、教育部分數、根號、幾何三角形、幾何角、次方、度數、運算與關係符號
  const regex = /(\$\$[\s\S]+?\$\$)|(\$[^$\n]+?\$)|(`[^`]+`)|(\\frac\{[^{}]+\}\{[^{}]+\})|(\\sqrt\{[^{}]+\})|([0-9a-zA-Z]*√[0-9a-zA-Z]+)|(\\overline\{[^{}]+\})|(\\triangle\s*[A-Z]+)|(△[A-Za-z0-9\x27]+)|(\\angle\s*[A-Z0-9]+)|(∠[A-Za-z0-9\x27]+)|([a-zA-Z0-9\)\(]+[²³⁴])|([0-9]+°)|([×÷±≠≤≥≈⊥≅∼])|(\/\/)|(\\parallel|\\perp|\\pm|\\times|\\div|\\le|\\ge|\\approx|\\neq|\\cong|\\sim)/g;
  
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
