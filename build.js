const fs = require('fs');
const path = require('path');

const srcDir = __dirname;
const distDir = path.join(srcDir, 'dist');

if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

const IGNORE_PATTERNS = [
  '.git',
  '.assetsignore',
  'node_modules',
  'PulseClient',
  '.freebuff',
  'build.js',
  'dist',
  'worker.js',
  'wrangler.jsonc'
];

function shouldCopy(filename) {
  if (filename.endsWith('.jar')) return false;
  if (filename.endsWith('.bak') || filename.endsWith('.tmp')) return false;
  for (const ign of IGNORE_PATTERNS) {
    if (filename === ign || filename.startsWith(ign + '/')) return false;
  }
  return true;
}

function copyRecursive(src, dest) {
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      if (shouldCopy(child)) {
        copyRecursive(path.join(src, child), path.join(dest, child));
      }
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

for (const item of fs.readdirSync(srcDir)) {
  if (shouldCopy(item)) {
    copyRecursive(path.join(srcDir, item), path.join(distDir, item));
  }
}

console.log('Build completed! Dist folder populated successfully.');
