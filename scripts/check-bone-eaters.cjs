const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const loot=require('../data/loot.json'),showdown=require('../data/showdown.json');
const source=fs.readFileSync(path.join(__dirname,'import-loot.cjs'),'utf8');
const context=vm.createContext({hunt:require('../data/monsters.json')});
vm.runInContext(source.slice(source.indexOf('const groups ='),source.indexOf('const decks =')),context);
for(const id of ['BoneEater','BoneEaters'])assert.equal(context.group(id),'赌博',id);
const L=require('../assets/loot-engine.js'),S=require('../assets/showdown-engine.js');
for(const [data,engine]of [[loot,L],[showdown,S]]){
 const boss=data.bosses.find(b=>b.id==='bone-eaters');
 assert.ok(boss);assert.equal(boss.group,'赌博');assert.equal(boss.expansion,'BoneEater');
 assert.equal(boss.levels.length,4);
 for(const level of boss.levels)engine.validate(data,engine.create(data,boss.id,level.id,'classification-check'));
}
assert.deepEqual(loot.bosses.find(b=>b.id==='bone-eaters').levels.map(l=>l.id),showdown.bosses.find(b=>b.id==='bone-eaters').levels.map(l=>l.id));
console.log('Passed: Bone Eaters belongs to Gambler’s Chest in both catalogs; both importer spellings and all four levels work.');
