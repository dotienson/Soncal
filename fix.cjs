const fs = require('fs');
let text = fs.readFileSync('src/components/PresetModal.tsx', 'utf8');
const searchString = '  );\n}';
const index = text.lastIndexOf(searchString);
if (index > -1) {
  text = text.slice(0, index + searchString.length) + '\n';
  fs.writeFileSync('src/components/PresetModal.tsx', text);
}
