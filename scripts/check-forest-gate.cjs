const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(script);
const HD=JSON.parse(fs.readFileSync(path.join(root,'data/huntdecks.json')));
const monsters=JSON.parse(fs.readFileSync(path.join(root,'data/monsters.json')));
assert.ok(monsters.find(m=>m.name==='Flower Knight').huntTrack.includes('F'));
const ctx=vm.createContext({HD,rulebookVersion:'standard',faceClass:()=> 'face',faceStyle:()=>''});
vm.runInContext(script.slice(script.indexOf('function drawCardFor('),script.indexOf('function render(){')),ctx);
const card=ctx.drawCardFor('F');
assert.equal(card.source,'F');
for(const version of ['standard','hd']){
  ctx.rulebookVersion=version;
  const markup=ctx.cardMarkup(card,true);
  assert.ok(markup.includes('森林想要它想要的'));
  assert.ok(markup.includes('测试大门'));
  for(const [,asset] of markup.matchAll(/src="\/([^"]+)"/g))assert.ok(fs.existsSync(path.join(root,asset)));
  assert.ok(!ctx.cardMarkup(card).includes('forest-gate-resolve'),'History keeps its card thumbnail');
  assert.ok(!ctx.cardMarkup(ctx.drawCardFor('L'),true).includes('forest-gate-resolve'),'Labyrinth is unchanged');
}
console.log('Passed: Flower Knight F tile renders the bundled rulebook in both quality modes; history and labyrinth unchanged.');
