import re

file_path = '/Users/lijingyan/Documents/學習網/src/components/QuizResult.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

if 'import MathText from' not in content:
    content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport MathText from './MathText';")

# Replace {q.question} with <MathText text={q.question} />
content = content.replace('{q.question}', '<MathText text={q.question} />')

# Replace {opt} with <MathText text={opt} />
# Wait, in QuizResult.jsx, it looks like:
# <span>{opt}</span>
# It's better to just do `{opt}` -> `<MathText text={opt} />` if `{opt}` is exactly used.
content = content.replace('{opt}', '<MathText text={opt} />')

# Replace {q.explanation} with <MathText text={q.explanation} />
content = content.replace('{q.explanation}', '<MathText text={q.explanation} />')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated QuizResult.jsx to use MathText")
