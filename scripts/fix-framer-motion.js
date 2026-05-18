const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes(`ease: 'easeOut'`)) {
    content = content.replace(/ease: 'easeOut'/g, `ease: 'easeOut' as any`);
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
});
