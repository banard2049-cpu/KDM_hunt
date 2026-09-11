const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const P=require('./official-content.cjs'),M=require('../data/monsters.json'),H=require('../data/huntdecks.json'),L=require('../data/loot.json'),S=require('../data/showdown.json');
const E=require('../assets/loot-engine.js'),SE=require('../assets/showdown-engine.js');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
new vm.Script(html.match(/<script>([\s\S]*?)<\/script>/)[1]);
assert.equal(M.length,14);assert.equal(L.bosses.length,31);
for(const b of [...M,...L.bosses,...S.bosses])assert.ok(!P.excluded.bosses.includes(b.id));
assert.equal(L.bosses.find(b=>b.id==='bone-eaters').group,'赌博');
for(const [deck,names]of Object.entries(P.excluded.huntCards))for(const c of H.decks[deck])assert.ok(!names.includes(c.name.toLowerCase()));
for(const e of S.expansions){assert.ok(!e.fan);assert.ok(!P.excluded.expansions.includes(e.id));}
for(const d of Object.values(L.decks))for(const id of d.cards){assert.ok(L.cards[id]);assert.ok(L.sheets[L.cards[id].sheet]);}
for(const b of L.bosses){
 for(const id of b.defaultDecks)assert.ok(L.decks[id],id);
 for(const l of b.levels){
  const s=E.create(L,b.id,l.id,'verify');E.validate(L,s);
  P.walk(l.reward,x=>{if(typeof x.deck==='string'&&!['basic','monster'].includes(x.deck))assert.ok(L.decks[x.deck],b.id+': '+x.deck);});
 }
}
for(const b of S.bosses)for(const l of b.levels){const s=SE.create(S,b.id,l.id,'verify');SE.validate(S,s);assert.deepEqual(s.drawWarnings,[]);}
for(const id of P.excluded.bosses){assert.throws(()=>E.create(L,id,'level-1','old'));assert.throws(()=>SE.create(S,id,'level-1','old'));}
for(const token of ['id="includeFan"','lootIncludeFanVermin','sdFanToggle',"'粉丝扩'"])assert.ok(!html.includes(token));
assert.ok(html.includes("$('#monster').onchange=renderLevels"));
assert.ok(html.includes('kdm-current-official-v1'));
assert.ok(html.includes('D.monsters.some'));
for(const level of L.bosses.find(b=>b.id==='king-s-man').levels){assert.equal(level.reward.steps[0].rows[0].max,4);assert.equal(level.reward.steps[0].rows[1].min,5);assert.ok(!JSON.stringify(level).includes('king-s-coin'));}
console.log('Passed: official catalogs, all boss levels, reward references, removed-content rejection, hunt syntax and controls.');

for(const file of fs.readdirSync(require('node:path').join(__dirname,'../assets')).filter(f=>f.endsWith('.js')))new vm.Script(fs.readFileSync(require('node:path').join(__dirname,'../assets',file),'utf8'),{filename:file});
assert.equal(L.decks['king-archive--king-resources'].cards.length,21);
assert.equal(L.decks['king-archive--king-resources'].cards.filter(id=>L.cards[id].name==="King's Coin").length,2);
const N=require('../assets/loot-card-names.js');assert.ok(N.label('Sinew').includes('Sinew'));assert.ok(N.names['Sinew']);
