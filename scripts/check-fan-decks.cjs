const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(script); // Also check syntax of the complete application.
const HD = JSON.parse(fs.readFileSync(path.join(root, 'data/huntdecks.json')));
const nodes = Object.fromEntries(['fanToggleWrap','fanToggleLabel','fanToggleHint','includeFan'].map(id=>[id,{style:{},checked:false}]));
const ctx = vm.createContext({HD, S:null, $:sel=>nodes[sel.slice(1)]});
vm.runInContext(script.slice(script.indexOf('const FAN_HUNT_NAMES='),script.indexOf('function shuffled(')), ctx);
vm.runInContext(script.slice(script.indexOf('function isWhiteLion('),script.indexOf('// Only levels')), ctx);
const counts = {'White Lion':6,'Phoenix':3,'Screaming Antelope':4,'Gorm':5,'Sunstalker':4,'Dragon King':4,'Flower Knight':3,'Dung Beetle Knight':5,'Spidicules':4,'Lion God':4};
for (const [name,count] of Object.entries(counts)) {
  const monster = {name,huntEventsDeck:name+' Hunt Events'};
  const all = HD.decks[monster.huntEventsDeck];
  assert.equal(ctx.fanCardCount(monster), count, name);
  assert.equal(ctx.deckFor(monster,false).length,all.length-count,name);
  assert.deepEqual(ctx.deckFor(monster,true),all);
  assert.deepEqual(ctx.deckFor(monster,false,true),name==='White Lion'?ctx.deckFor(monster,false):all);
  ctx.selected=()=>monster;
  ctx.S=null;
  ctx.updateFanToggle();
  assert.equal(nodes.fanToggleWrap.style.display,'block');
  assert.equal(nodes.includeFan.disabled,false);
  ctx.S={monster};
  ctx.updateFanToggle();
  assert.equal(nodes.includeFan.disabled,true);
}
// No optional fan pack: keep all cards, including fan-created monsters' own decks.
for (const name of ['King','Crimson Crocodile','Black Lion','Drifter Knight']) {
  const monster={name,huntEventsDeck:name+' Hunt Events'};
  assert.equal(ctx.fanCardCount(monster),0);
  assert.deepEqual(Array.from(ctx.deckFor(monster,false)),HD.decks[monster.huntEventsDeck]);
  ctx.selected=()=>monster;
  ctx.S=null;
  ctx.updateFanToggle();
  assert.equal(nodes.fanToggleWrap.style.display,'none');
}
console.log('Passed: 10 optional decks, 4 unchanged decks, toggle locking, legacy save ordering, and app syntax.');
