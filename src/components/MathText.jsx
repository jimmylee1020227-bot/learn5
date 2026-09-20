import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

export default function MathText({ text }) {
  if (typeof text !== 'string') return text;
  // Regex to split text by $...$
  const parts = text.split(/(\$.*?\$)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          const mathExpr = part.slice(1, -1);
          return <InlineMath key={i} math={mathExpr} />;
        }
        // Use standard span but split by \n for newlines if any
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
