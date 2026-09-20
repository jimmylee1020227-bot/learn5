file_path = '/Users/lijingyan/Documents/學習網/src/data/mathGenerator.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Exact targeted replacements inside backticks or strings for powers
replacements = {
    '2^300': '2³⁰⁰',
    '3^200': '3²⁰⁰',
    '5^100': '5¹⁰⁰',
    '(2^3)^100': '(2³)¹⁰⁰',
    '8^100': '8¹⁰⁰',
    '(3^2)^100': '(3²)¹⁰⁰',
    '9^100': '9¹⁰⁰',
    'x^2 - 5x - 24': 'x² - 5x - 24',
    '2x^2 + 5xy + 2y^2': '2x² + 5xy + 2y²',
    'x^2 - 6x + 2 = 0': 'x² - 6x + 2 = 0',
    'x^3 + 1/x^3': 'x³ + ¹/ₓ³',
    '1/x': '¹/ₓ',
    'x^3': 'x³',
    'x^2': 'x²',
    'y^2': 'y²',
    'a^2': 'a²',
    'b^2': 'b²',
    'c^2': 'c²',
    'r^2': 'r²',
    'α^2': 'α²',
    'β^2': 'β²',
    '2^3': '2³',
    '3^2': '3²',
    'a_n': 'aₙ',
    'S_n': 'Sₙ'
}

for old, new in replacements.items():
    content = content.replace(old, new)

# Dynamic exponent replacements with a helper `sup` function
sup_helper = """
  const sup = (n) => String(n).split('').map(c => '⁰¹²³⁴⁵⁶⁷⁸⁹'[c] || c).join('');
"""

if 'const sup =' not in content:
    content = content.replace("const isEasy = difficulty === 'easy';", "const isEasy = difficulty === 'easy';\n" + sup_helper)

content = content.replace('`${base}^${p}`', '`${base}${sup(p)}`')
content = content.replace('`(${base}^${p})^${q} ÷ ${base}^${p * 2}`', '`(${base}${sup(p)})${sup(q)} ÷ ${base}${sup(p * 2)}`')
content = content.replace('`${base}^${p * q - p * 2}`', '`${base}${sup(p * q - p * 2)}`')
content = content.replace('`${base}^${p * q + p * 2}`', '`${base}${sup(p * q + p * 2)}`')
content = content.replace('`${base}^${q - 2}`', '`${base}${sup(q - 2)}`')
content = content.replace('`${base}^${p * q}`', '`${base}${sup(p * q)}`')
content = content.replace('`${base}^(${p * q} - ${p * 2})`', '`${base}${sup(p * q)} ÷ ${base}${sup(p * 2)}`')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated mathGenerator.js carefully")
