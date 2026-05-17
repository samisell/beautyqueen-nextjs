const fs = require('fs');
const path = require('path');

const targetDirs = [
  path.join(__dirname, '../src/pages'),
  path.join(__dirname, '../prisma')
];

const localImages = [
  '/beautiful-african-woman-monochrome-portrait.jpg',
  '/beautiful-african-woman-with-big-curly-afro-flowers-her-hair.jpg',
  '/black-woman-with-ideal-skin-short-haircut-grey.jpg',
  '/cleopas-monbest-FPfSFs5_tvM-unsplash.jpg',
  '/cleopas-monbest-LtJMm2rIopY-unsplash.jpg',
  '/cleopas-monbest-fMwDeDI_ykE-unsplash.jpg',
  '/lera-kogan-B4v-mppq4yc-unsplash.jpg',
  '/portrait-attractive-african-american-female-with-beautiful-makeup-posing-with-her-eyes-closed.jpg',
  '/portrait-medieval-queen-with-crown-her-head.jpg',
  '/portrait-medieval-queen-with-crown-her-head (1).jpg',
  '/portrait-medieval-queen-with-crown-her-head (2).jpg',
  '/portrait-medieval-queen-with-crown-her-head (3).jpg'
];

let imageIndex = 0;
function getNextLocalImage() {
  const img = localImages[imageIndex];
  imageIndex = (imageIndex + 1) % localImages.length;
  return img;
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      processFile(filePath);
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Match any Unsplash image URL starting with http/https up to the closing quote
  const unsplashRegex = /https:\/\/images\.unsplash\.com\/[^\s'"`]+/g;
  
  let match;
  let modified = false;
  
  // We use a replace function to assign unique local images for each occurrence
  content = content.replace(unsplashRegex, () => {
    modified = true;
    return getNextLocalImage();
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Successfully updated: ${path.relative(process.cwd(), filePath)}`);
  }
}

console.log('Starting Unsplash image migration to high-quality local assets...');
for (const dir of targetDirs) {
  if (fs.existsSync(dir)) {
    walkDir(dir);
  }
}
console.log('Migration completed successfully!');
