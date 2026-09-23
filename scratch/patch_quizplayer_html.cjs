const fs = require('fs');
const file = 'src/components/QuizPlayer.jsx';
let content = fs.readFileSync(file, 'utf8');

const anchor = '<MathText text={currentQ.question} />';
const htmlRender = `
            {currentQ.html && (
              <div 
                style={{ marginTop: '10px', marginBottom: '10px' }}
                dangerouslySetInnerHTML={{ __html: currentQ.html }} 
              />
            )}
`;
if (content.includes(anchor) && !content.includes('dangerouslySetInnerHTML={{ __html: currentQ.html }}')) {
   content = content.replace(anchor, anchor + htmlRender);
   fs.writeFileSync(file, content);
   console.log('Patched QuizPlayer.jsx');
}
