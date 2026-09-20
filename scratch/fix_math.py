file_path = '/Users/lijingyan/Documents/學習網/src/data/mathGenerator.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the broken javascript math operators
content = content.replace('rand() ×', 'rand() *')
content = content.replace('p × 2', 'p * 2')
content = content.replace('p × q', 'p * q')
content = content.replace('coef × ansX', 'coef * ansX')

# Since it replaced all ' * ', let's just make sure we didn't break other JS syntax.
# The ` * ` replacements in logic:
# const coef = Math.floor(rand() × 4) + 3;
# ...
import re
# Find anything like `x × y` where it is outside a string? It's hard to tell without AST.
# But there are only a few spots that use `rand()` and arithmetic in mathGenerator.js.
content = re.sub(r'Math.floor\(([^)]+)\) × (\d+)', r'Math.floor(\1) * \2', content)

# Let's just fix the specific ones we know got broken by looking at the diff.
content = content.replace('p × q', 'p * q')
content = content.replace('p × 2', 'p * 2')
content = content.replace('coef × ansX', 'coef * ansX')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed js math operators")
