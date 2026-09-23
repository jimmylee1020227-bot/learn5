const fs = require('fs');

function addTTS(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Find MathText rendering question
  if (content.includes('<MathText text={currentQ.question} />')) {
      const newCode = `
            {currentQ.tts && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  const u = new SpeechSynthesisUtterance(currentQ.tts);
                  u.lang = currentQ.ttsLang || 'en-US';
                  u.rate = 0.85;
                  window.speechSynthesis.speak(u);
                }}
                style={{ marginBottom: '10px', padding: '8px 16px', background: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                🔊 播放聽力測驗
              </button>
            )}
            <MathText text={currentQ.question} />
`;
      content = content.replace('<MathText text={currentQ.question} />', newCode);
      fs.writeFileSync(file, content);
      console.log('Patched', file);
  } else {
      console.log('Not found in', file);
  }
}

addTTS('src/components/QuizPlayer.jsx');
