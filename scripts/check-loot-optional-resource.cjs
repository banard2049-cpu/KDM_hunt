const assert=require('node:assert/strict');
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
