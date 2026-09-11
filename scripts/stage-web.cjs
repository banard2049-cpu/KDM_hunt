const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
require('./build-showdown-terrain.cjs')(root,JSON.parse(fs.readFileSync(path.join(root,'data/showdown.json'),'utf8')));
const target = path.join(root, 'www');
// Verify the resolved staging target before removing generated copies.
if (target !== path.resolve(root, 'www')) throw Error('Invalid staging target');
fs.rmSync(target, {recursive:true, force:true});
// Always refresh the complete offline bundle, including HD rulebook pages.
for (const entry of ['index.html', 'assets', 'data']) {
  fs.cpSync(path.join(root, entry), path.join(target, entry), {
    recursive: true,
    force: true,
  });
}
console.log('Offline web bundle staged with all image and data assets.');
