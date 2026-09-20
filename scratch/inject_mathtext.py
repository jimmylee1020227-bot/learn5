import re

file_path = '/Users/lijingyan/Documents/學習網/src/components/QuizPlayer.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

math_text_component = """
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

const MathText = ({ text }) => {
  if (typeof text !== 'string') return text;
  // Regex to split text by $...$
  const parts = text.split(/(\\$.*?\\$)/g);
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
            {part.split('\\n').map((line, j, arr) => (
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
};
"""

# Insert imports and MathText before export default function QuizPlayer
if 'const MathText' not in content:
    content = content.replace('export default function QuizPlayer', math_text_component + '\nexport default function QuizPlayer')

# Replace exact occurrences
content = content.replace('{currentQ.question}', '<MathText text={currentQ.question} />')
content = content.replace('{opt}', '<MathText text={opt} />')
content = content.replace("{currentQ.hint || '本題檢驗國中課綱之核心素養與運算概念，請注意代數符號與題幹給予之限制條件！'}", "<MathText text={currentQ.hint || '本題檢驗國中課綱之核心素養與運算概念，請注意代數符號與題幹給予之限制條件！'} />")

# Wait, `currentQ.explanation` isn't in QuizPlayer? Ah, the user doesn't see explanation until they complete the quiz, which is in `QuizResult.jsx`.
# Let's fix QuizPlayer.jsx first.
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated QuizPlayer.jsx")
