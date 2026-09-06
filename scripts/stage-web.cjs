const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const target = path.join(root, 'www');
// Always refresh the complete offline bundle, including HD rulebook pages.
for (const entry of ['index.html', 'assets', 'data']) {
  fs.cpSync(path.join(root, entry), path.join(target, entry), {
    recursive: true,
    force: true,
  });
}
console.log('Offline web bundle staged with all image and data assets.');
