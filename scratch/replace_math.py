import re

file_path = '/Users/lijingyan/Documents/學習網/src/data/mathGenerator.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replacements for math symbols to standard exam symbols
# Superscripts
content = content.replace('2^300', '2³⁰⁰')
content = content.replace('3^200', '3²⁰⁰')
content = content.replace('5^100', '5¹⁰⁰')
content = content.replace('(2^3)^100', '(2³)¹⁰⁰')
content = content.replace('8^100', '8¹⁰⁰')
content = content.replace('(3^2)^100', '(3²)¹⁰⁰')
content = content.replace('9^100', '9¹⁰⁰')

# Common expressions
content = content.replace('x^2 - 5x - 24', 'x² - 5x - 24')
content = content.replace('2x^2 + 5xy + 2y^2', '2x² + 5xy + 2y²')
content = content.replace('x^2 - 6x + 2 = 0', 'x² - 6x + 2 = 0')
content = content.replace('x^3 + 1/x^3', 'x³ + 1/x³')
content = content.replace('1/x', '¹/ₓ') # actually let's just use 1/x or maybe HTML? The UI renders text with pre-line.
# In Taiwan textbooks, fractions in text are often written as x/y but let's replace ^2 and ^3
content = content.replace('x^3', 'x³')
content = content.replace('x^2', 'x²')
content = content.replace('y^2', 'y²')
content = content.replace('a^2', 'a²')
content = content.replace('b^2', 'b²')
content = content.replace('c^2', 'c²')
content = content.replace('r^2', 'r²')
content = content.replace('α^2', 'α²')
content = content.replace('β^2', 'β²')
content = content.replace('2^3', '2³')
content = content.replace('3^2', '3²')

# Replace a_n, a_1 if they exist
content = content.replace('a₁ =', 'a₁ =') # already has a₁
content = content.replace('a_n', 'aₙ')
content = content.replace('S_n', 'Sₙ')

# Replace * with ×
content = content.replace(' * ', ' × ')
content = content.replace(' / ', ' ÷ ')

# Let's fix the template literal dynamically generated exponents
# Original: `(${base}^${p})^${q} ÷ ${base}^${p * 2}`
# We can't easily superscript dynamically in template literal without a helper function.
# Let's add a helper function `const sup = (n) => String(n).split('').map(c => '⁰¹²³⁴⁵⁶⁷⁸⁹'[c] || c).join('');`
# and replace the usages.

sup_helper = """
  const sup = (n) => String(n).split('').map(c => '⁰¹²³⁴⁵⁶⁷⁸⁹'[c] || c).join('');
"""

if 'const sup =' not in content:
    content = content.replace("const isEasy = difficulty === 'easy';", "const isEasy = difficulty === 'easy';\\n" + sup_helper)

# Dynamic replacements
content = content.replace('`${base}^${p}`', '`${base}${sup(p)}`')
content = content.replace('`(${base}^${p})^${q} ÷ ${base}^${p * 2}`', '`(${base}${sup(p)})${sup(q)} ÷ ${base}${sup(p * 2)}`')
content = content.replace('`${base}^${p * q - p * 2}`', '`${base}${sup(p * q - p * 2)}`')
content = content.replace('`${base}^${p * q + p * 2}`', '`${base}${sup(p * q + p * 2)}`')
content = content.replace('`${base}^${q - 2}`', '`${base}${sup(q - 2)}`')
content = content.replace('`${base}^${p * q}`', '`${base}${sup(p * q)}`')
content = content.replace('`${base}^(${p * q} - ${p * 2})`', '`${base}${sup(p * q)} ÷ ${base}${sup(p * 2)}`')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated mathGenerator.js")
