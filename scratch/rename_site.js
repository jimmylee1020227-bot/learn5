const fs = require('fs');
const glob = require('glob');
const files = glob.sync('src/**/*.{jsx,js,html}');
files.push('index.html');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace names
  content = content.replace(/108 ?課綱國中全科複?習?學習網/g, '學習網');
  content = content.replace(/108 ?課綱全科學習網/g, '學習網');
  content = content.replace(/108 ?課綱會考學習網/g, '學習網');
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
