import re

file_path = '/Users/lijingyan/Documents/學習網/src/data/mathGenerator.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# I will replace the previously injected `sup` with a helper that just returns the string itself if we are inside LaTeX, but actually we don't need `sup` anymore, we can just use `^{p}` in LaTeX!
# Let's revert the sup stuff.
content = content.replace("const isEasy = difficulty === 'easy';\n  const sup = (n) => String(n).split('').map(c => '⁰¹²³⁴⁵⁶⁷⁸⁹'[c] || c).join('');", "const isEasy = difficulty === 'easy';")

# Revert sup usages and wrap in LaTeX
content = content.replace('`${base}${sup(p)}`', '`$${base}^{${p}}$`')
content = content.replace('`(${base}${sup(p)})${sup(q)} ÷ ${base}${sup(p * 2)}`', '`$({${base}}^{${p}})^{${q}} \\div {${base}}^{${p * 2}}$`')
content = content.replace('`${base}${sup(p * q - p * 2)}`', '`$${base}^{${p * q - p * 2}}$`')
content = content.replace('`${base}${sup(p * q + p * 2)}`', '`$${base}^{${p * q + p * 2}}$`')
content = content.replace('`${base}${sup(q - 2)}`', '`$${base}^{${q - 2}}$`')
content = content.replace('`${base}${sup(p * q)}`', '`$${base}^{${p * q}}$`')
content = content.replace('`${base}${sup(p * q)} ÷ ${base}${sup(p * 2)}`', '`$${base}^{${p * q}} \\div {${base}}^{${p * 2}}$`')

# Let's replace the hardcoded ones
replacements = {
    '2³⁰⁰': '$2^{300}$',
    '3²⁰⁰': '$3^{200}$',
    '5¹⁰⁰': '$5^{100}$',
    '(2³)¹⁰⁰': '$(2^3)^{100}$',
    '8¹⁰⁰': '$8^{100}$',
    '(3²)¹⁰⁰': '$(3^2)^{100}$',
    '9¹⁰⁰': '$9^{100}$',
    
    'x² - 5x - 24': '$x^2 - 5x - 24$',
    '2x² + 5xy + 2y²': '$2x^2 + 5xy + 2y^2$',
    'x² - 6x + 2 = 0': '$x^2 - 6x + 2 = 0$',
    'x³ + ¹/ₓ³': '$x^3 + \\frac{1}{x^3}$',
    
    'a = (2^3)^100': '$a = (2^3)^{100}$',
    'b = (3^2)^100': '$b = (3^2)^{100}$',
    
    '1/x': '$\\frac{1}{x}$',
    'x³': '$x^3$',
    'x²': '$x^2$',
    'y²': '$y^2$',
    'a²': '$a^2$',
    'b²': '$b^2$',
    'c²': '$c^2$',
    'r²': '$r^2$',
    'α²': '$\\alpha^2$',
    'β²': '$\\beta^2$',
    '2³': '$2^3$',
    '3²': '$3^2$',
    'aₙ': '$a_n$',
    'Sₙ': '$S_n$',
    'a₁': '$a_1$',

    # Roots
    '4√5': '$4\\sqrt{5}$',
    '2√13': '$2\\sqrt{13}$',
    '√119': '$\\sqrt{119}$',
    '√(5² + 12²)': '$\\sqrt{5^2 + 12^2}$',
    '√169': '$\\sqrt{169}$',
    '√(6² + 8²)': '$\\sqrt{6^2 + 8^2}$',

    # Fractions
    '(2/5)²': '$(\\frac{2}{5})^2$',
    '4/25': '$\\frac{4}{25}$',
    '10/3': '$\\frac{10}{3}$',
    '5/3': '$\\frac{5}{3}$',
    '2/3': '$\\frac{2}{3}$',
    '13/28': '$\\frac{13}{28}$',
    '15/28': '$\\frac{15}{28}$',
    '1/2': '$\\frac{1}{2}$',
    '11/28': '$\\frac{11}{28}$',
    '5/8': '$\\frac{5}{8}$',
    '4/7': '$\\frac{4}{7}$',
    '3/8': '$\\frac{3}{8}$',
    '2/7': '$\\frac{2}{7}$',
    '20/56': '$\\frac{20}{56}$',
    '6/56': '$\\frac{6}{56}$',
    '26/56': '$\\frac{26}{56}$',
    '1/6': '$\\frac{1}{6}$',
    '1/12': '$\\frac{1}{12}$',
    '7/36': '$\\frac{7}{36}$',
    '5/36': '$\\frac{5}{36}$',
    '6 / 36': '$\\frac{6}{36}$',
    '14(41 + 2)/2': '$\\frac{14(41 + 2)}{2}$',
    '58/2': '$\\frac{58}{2}$',
    '-5/2': '$-\\frac{5}{2}$',
    '5/2': '$\\frac{5}{2}$',

    # Other symbols
    'θ': '$\\theta$',
    '△ABC': '$\\triangle ABC$',
    '△ADE': '$\\triangle ADE$',
    '△OAB': '$\\triangle OAB$',
    '∠C = 90°': '$\\angle C = 90^\\circ$',
    '∠1 = 35°': '$\\angle 1 = 35^\\circ$',
    '∠2 = 80°': '$\\angle 2 = 80^\\circ$',
    '∠3 = 40°': '$\\angle 3 = 40^\\circ$',
    '180°': '$180^\\circ$',
    '135°': '$135^\\circ$',
    '900°': '$900^\\circ$',
    '128.5°': '$128.5^\\circ$',
    '1260°': '$1260^\\circ$',
    '140°': '$140^\\circ$',
    '1080°': '$1080^\\circ$',
    '120°': '$120^\\circ$',
    '40°': '$40^\\circ$',
    '80°': '$80^\\circ$',
    '20°': '$20^\\circ$',
    '160°': '$160^\\circ$',
    '90°': '$90^\\circ$',
    '≤': '$\\le$',
    '≥': '$\\ge$',
}

for old, new in replacements.items():
    content = content.replace(old, new)

# Fix multiplication and division in explanations/hints
content = content.replace(' × ', ' \\times ')
content = content.replace(' ÷ ', ' \\div ')

# Dynamic algebraic equations in equations
# e.g. `${coef}x - 7 = ${rhs}`
content = content.replace('`${coef}x - 7 = ${rhs}`', '`$${coef}x - 7 = ${rhs}$`')
content = content.replace('`(${x1}) \\times ${x2} - (${x3}) + |${x1}|`', '`$(${x1}) \\times ${x2} - (${x3}) + |${x1}|$`')
content = content.replace('`{ 2x + y = 11, x - y = 1 }`', '`\\begin{cases} 2x + y = 11 \\\\ x - y = 1 \\end{cases}`')
content = content.replace('`4x + 3y = 24`', '`$4x + 3y = 24$`')
content = content.replace('`|2x - 5| \\le 9`', '`$|2x - 5| \\le 9$`')
content = content.replace('`(x + 2) : 3 = 10 : 6`', '`$(x + 2) : 3 = 10 : 6$`')
content = content.replace('`y = -2(x - 3)^2 + 8`', '`$y = -2(x - 3)^2 + 8$`')

# Let's ensure backslashes in template literals are escaped properly or we use raw strings. 
# Wait! In javascript template literals, `\` is an escape character! 
# So `\times` will become `imes` unless it is `\\times`!
# Let's double all backslashes where LaTeX is used.
content = content.replace('\\sqrt', '\\\\sqrt')
content = content.replace('\\frac', '\\\\frac')
content = content.replace('\\times', '\\\\times')
content = content.replace('\\div', '\\\\div')
content = content.replace('\\alpha', '\\\\alpha')
content = content.replace('\\beta', '\\\\beta')
content = content.replace('\\theta', '\\\\theta')
content = content.replace('\\triangle', '\\\\triangle')
content = content.replace('\\angle', '\\\\angle')
content = content.replace('\\circ', '\\\\circ')
content = content.replace('\\le', '\\\\le')
content = content.replace('\\ge', '\\\\ge')
content = content.replace('\\begin', '\\\\begin')
content = content.replace('\\end', '\\\\end')
content = content.replace('\\\\', '\\\\\\\\')  # for cases matrix

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated mathGenerator.js for LaTeX")
