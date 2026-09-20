import re

file_path = '/Users/lijingyan/Documents/學習網/src/components/QuizPlayer.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the inline MathText injected earlier
import_katex = "import 'katex/dist/katex.min.css';"
inline_math = "import { InlineMath } from 'react-katex';"
math_text_def_start = "const MathText = ({ text }) => {"
export_default = "export default function QuizPlayer"

if import_katex in content:
    # We remove from import_katex to export_default
    pattern = re.compile(re.escape(import_katex) + r'.*?' + re.escape(export_default), re.DOTALL)
    content = pattern.sub(f"import MathText from './MathText';\n{export_default}", content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated QuizPlayer.jsx to use external MathText")
