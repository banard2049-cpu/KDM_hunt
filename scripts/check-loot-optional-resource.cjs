const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const E=require('../assets/loot-engine.js');
const data=require('../data/loot.json');
for(const deck of Object.values(data.decks).filter(d=>d.kind==='basic')){
  const cid=deck.cards.find(id=>data.cards[id].name==='Lump of Atnas');
  assert.ok(cid);
  for(const source of ['manual','hunt']){
    const off=E.create(data,'white-lion','level-1','off',source);
    assert.equal(E.available(data,off,deck.id).length,deck.cards.length-1);
    assert.ok(!E.available(data,off,deck.id).includes(cid));
    assert.throws(()=>E.take(data,off,cid));
    const drawn=E.draw(data,off,deck.id,deck.cards.length-1,()=>0);
    assert.ok(!drawn.held.includes(cid));
    assert.ok(E.validate(data,JSON.parse(JSON.stringify(drawn))));
    assert.deepEqual(E.undo(drawn),off);
    const on=E.create(data,'white-lion','level-1','on',source,{includeLumpOfAtnas:true});
    assert.equal(E.available(data,on,deck.id).length,deck.cards.length);
    const taken=E.take(data,on,cid);
    assert.ok(taken.held.includes(cid));
    assert.ok(E.validate(data,taken));
    assert.ok(E.validate(data,E.discard(data,taken,cid)));
    const legacy=JSON.parse(JSON.stringify(taken));delete legacy.includeLumpOfAtnas;
    assert.ok(E.validate(data,legacy));
    const untouchedLegacy=JSON.parse(JSON.stringify(on));delete untouchedLegacy.includeLumpOfAtnas;
    assert.ok(E.available(data,untouchedLegacy,deck.id).includes(cid));
    const invalid=JSON.parse(JSON.stringify(taken));invalid.includeLumpOfAtnas=false;
    assert.throws(()=>E.validate(data,invalid));
  }
}
console.log('Passed: optional Lump of Atnas in both basic decks, manual/hunt battles, draw/take/discard/undo, saved and legacy battles.');
const vermin='kingdom-death-monster-archive--core-vermin';
const baseNames=['Crab Spider','Cyclops Fly','Hissing Cockroach','Lonely Ant','Nightmare Tick','Sword Beetle'];
for(const source of ['manual','hunt'])for(const promo of [false,true]){
  const s=E.create(data,'screaming-antelope','level-3','vermin',source,{includePromoVermin:promo});
  const ids=E.available(data,s,vermin);
  assert.equal(ids.length,8+(promo?1:0));
  assert.equal(ids.filter(id=>data.cards[id].name==='Crab Spider').length,3);
  if(!promo)assert.deepEqual([...new Set(ids.map(id=>data.cards[id].name))].sort(),baseNames.slice().sort());
  for(const cid of data.decks[vermin].cards.filter(id=>!ids.includes(id)))assert.throws(()=>E.take(data,s,cid));
  const drawn=E.draw(data,s,vermin,ids.length,()=>0);
  assert.equal(E.available(data,drawn,vermin).length,0);
  assert.throws(()=>E.draw(data,drawn,vermin,1));
  assert.ok(E.validate(data,JSON.parse(JSON.stringify(drawn))));
  assert.ok(E.validate(data,E.discard(data,drawn,drawn.held[0])));
  assert.deepEqual(E.undo(drawn),s);
  const reward=E.claim(data,E.prepare(data,s),()=>0);
  assert.equal(reward.held.filter(id=>data.cards[id].deck===vermin).length,2);
  assert.ok(reward.held.filter(id=>data.cards[id].deck===vermin).every(id=>ids.includes(id)));
  assert.ok(E.validate(data,reward));
}
const fresh=E.create(data,'white-lion','level-1','fresh');
assert.equal(E.available(data,fresh,vermin).length,8);
const legacy={...fresh};delete legacy.includePromoVermin;
assert.equal(E.available(data,legacy,vermin).length,9);
assert.ok(E.validate(data,E.draw(data,legacy,vermin,9,()=>0)));
for(const key of ['includePromoVermin'])assert.throws(()=>E.validate(data,{...fresh,[key]:'yes'}));
for(const [name,key] of [['Gibbering Haremite','includePromoVermin']]){
  const enabled=E.create(data,'white-lion','level-1','enabled','manual',{[key]:true});
  const cid=data.decks[vermin].cards.find(id=>data.cards[id].name===name);
  const taken=E.take(data,enabled,cid);
  assert.throws(()=>E.validate(data,{...taken,[key]:false}));
}
console.log('Passed: 8/9 vermin pools, defaults, rewards, draw limits, take/discard/undo, save validation and legacy battles.');
const html = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');
const sidebar = html.slice(html.indexOf('<aside id="lootSidebar"'), html.indexOf('</aside>', html.indexOf('<aside id="lootSidebar"')));
assert.match(sidebar, /<div class="loot-session-row">[\s\S]*<\/div>\s*<div class="loot-optional-switches">/, 'the switches block must follow the session/export row');
const switches = sidebar.slice(sidebar.indexOf('<div class="loot-optional-switches">'));
for (const id of ['lootIncludeLumpOfAtnas', 'lootIncludePromoVermin'])
  assert.ok(switches.includes('id="' + id + '"'), id + ' must be an optional switch in the sidebar block');
for (const id of ['lootIncludeLumpOfAtnas', 'lootIncludePromoVermin'])
  assert.ok(sidebar.indexOf('id="' + id + '"') > sidebar.indexOf('id="lootSessions"'), id + ' must sit below the export row');
assert.equal(sidebar.slice(0, sidebar.indexOf('<div class="loot-optional-switches">')).includes('loot-optional-resource'), false, 'no optional switch may stay above the export row');
console.log('Passed: optional switches sit together in the loot sidebar, below the export row.');
