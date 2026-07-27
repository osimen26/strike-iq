const fs = require('fs');
const path = require('path');

const dir = 'platform/components/landing';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

for (let file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('"use client"')) {
    fs.writeFileSync(filePath, '"use client";\n' + content);
  }
}
console.log('Successfully prepended use client');
