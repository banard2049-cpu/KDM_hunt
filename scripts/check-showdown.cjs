const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),data=require('../data/showdown.json'),loot=require('../data/loot.json'),E=require('../assets/showdown-engine.js');
assert.equal(data.bosses.length,loot.bosses.length);
let count=0;
for(const b of data.bosses){assert.deepEqual(b.levels.map(l=>l.id),loot.bosses.find(x=>x.id===b.id).levels.map(l=>l.id));for(const l of b.levels){
 const s=E.create(data,b.id,l.id,'test-'+count++);E.validate(data,s);assert.equal(s.random.length,l.randomTerrain);assert.deepEqual(E.snapshot(data,JSON.parse(JSON.stringify(s))),E.snapshot(data,s));
 for(const z of l.zones)for(const [x,y]of z.cells){assert.ok(x>=1&&x<=22&&y>=1&&y<=16);}
 assert.ok(l.basicAction.file,`${b.id}/${l.id} basic action missing`);
 for(const t of [...l.fixed,...l.unfixed,...l.special])if(t.card?.file){assert.ok(/^Card/.test(t.card.source.objectType),t.name+' must be a card');assert.ok(['Terrain',''].includes(t.card.source.gmNotes),t.name+' must not be a terrain tile or innovation');assert.ok(!t.card.source.path.includes('Terrain Tiles'),t.name+' wrong archive');}
 for(const c of [l.basicAction,l.info,...l.starting])if(c.file){assert.ok(fs.existsSync(path.join(root,c.file)));assert.ok(c.col<c.w&&c.row<c.h,`${c.name}: invalid atlas crop`);}
}}
// The board art is what players read positions from; a missing or unreferenced
// image silently degrades the whole showdown view to an empty grid.
const boardAsset=path.join(root,'assets/board/showdown-board.jpg');
assert.ok(fs.existsSync(boardAsset),'showdown board art missing');
assert.ok(fs.statSync(boardAsset).size>50000,'showdown board art looks truncated');
assert.ok(fs.readFileSync(path.join(root,'assets/showdown-view.js'),'utf8').includes('assets/board/showdown-board.jpg'),'showdown view no longer draws the board art');
const pro=E.create(data,'white-lion','prologue','pro');assert.equal(pro.random.length,0);assert.equal(pro.taken.length,0);
const lion=E.create(data,'white-lion','level-2','lion',['Core'],()=>.5);assert.equal(lion.taken.length,1);assert.equal(lion.taken[0].name,'2 Tall Grass');assert.equal(lion.random.length,2);
assert.ok(E.context(data,lion).level.zones[0].cells.length>5,'Use full start area rather than TTS playerPositions');
const before=JSON.stringify(lion);assert.throws(()=>E.draw(data,{...lion,pool:[]}),/不足/);assert.equal(JSON.stringify(lion),before);
// The default deck is 基础 only, plus whatever this level's rules force on board.
assert.deepEqual(lion.expansions,['Core']);assert.ok(lion.pool.every(id=>E.ownerOf(data,id)==='Core'));
const solitaire=E.create(data,'white-lion','level-2','pool-a');assert.deepEqual(solitaire.expansions,['Core']);
// A level whose rules need terrain from elsewhere gets exactly those copies.
const charrogg=E.create(data,'charrogg','level-1','pool-b');
const poolNames=charrogg.pool.map(id=>E.cardIndex(data).get(id).name);
assert.ok(poolNames.includes('Lava Pool'),'required terrain must be added to the default pool');
assert.ok(charrogg.pool.filter(id=>E.ownerOf(data,id)!=='Core').length<3,'only the required copies come along');
assert.deepEqual(charrogg.drawWarnings,[]);
// Single cards can be added to the pool without pulling in their whole pack.
const single=E.create(data,'white-lion','level-2','pool-c');
const lily=data.expansions.find(e=>e.id==='WhiteLion').cards[0].id;
const withLily=E.draw(data,{...single,pool:[...single.pool,lily],expansions:E.groupsOf(data,[...single.pool,lily])},()=>.5);
assert.ok(withLily.pool.includes(lily));assert.ok(withLily.expansions.includes('WhiteLion'));
const duplicate=JSON.parse(before);duplicate.random=[duplicate.random[0],duplicate.random[0]];assert.throws(()=>E.validate(data,duplicate),/损坏/);
const reroll=E.draw(data,lion,()=>.1);assert.equal(reroll.id,lion.id);assert.equal(reroll.revision,lion.revision+1);
// Same-name physical copies remain distinct, and a fixed instance is removed first.
const fixture={bosses:[{id:'x',expansion:'Core',levels:[{id:'a',fixed:[{name:'Grass'}],unfixed:[],randomTerrain:2}]}],expansions:[{id:'Core',cards:[1,2,3].map(i=>({id:String(i),name:'Grass'}))}]};
const f=E.create(fixture,'x','a','x',undefined,()=>0);assert.equal(new Set([...f.taken,...f.random].map(c=>c.id)).size,3);
console.log(`Showdown: ${count} levels, atlas references, full start regions, terrain conservation and save/restore passed.`);

const candidates=data.expansions.filter(e=>lion.expansions.includes(e.id)).flatMap(e=>e.cards).filter(c=>!lion.taken.some(t=>t.id===c.id));const picked=E.choose(data,lion,candidates.slice(0,2).map(c=>c.id));assert.equal(picked.revision,lion.revision+1);assert.equal(picked.id,lion.id);
assert.throws(()=>E.choose(data,lion,[candidates[0].id,candidates[0].id]));assert.throws(()=>E.choose(data,lion,[lion.taken[0].id,candidates[0].id]));assert.throws(()=>E.choose(data,lion,[]));
assert.equal(JSON.stringify(lion),before,'manual selection must preserve original battle');
// The second screen ships with the board at 170% of its resting size and the cards
// at 150%: a battle that never touched the controls opens there, and 重置大小 comes
// back to both.
const shipped=E.defaultBoardScale,cardDefault=E.defaultCardScale;assert.equal(shipped,1.7,'the default board size is 170%');assert.equal(cardDefault,1.5,'the default card size is 150%');
assert.equal(E.snapshot(data,picked).display.boardScale,shipped,'a fresh battle must open at the default board size');
assert.equal(E.snapshot(data,picked).display.cardScale,cardDefault,'a fresh battle must open at the default card size');
assert.equal(E.snapshot(data,{...picked,display:{boardScale:1,cardScale:1}}).display.boardScale,1,'a battle that chose 100% must keep it');
assert.equal(E.snapshot(data,{...picked,display:{boardScale:1,cardScale:1}}).display.cardScale,1,'a battle that chose 100% cards must keep it');
const viewerSource=fs.readFileSync(path.join(root,'assets/showdown-view.js'),'utf8');
assert.match(viewerSource,/const DEFAULT_BOARD_SCALE=1\.7/,'the viewer must open at the same default board size');
assert.match(viewerSource,/const DEFAULT_CARD_SCALE=1\.5/,'the viewer must open at the same default card size');
const scaled=E.resize(picked,'boardScale',.1);assert.equal(E.snapshot(data,scaled).display.boardScale,1.8);assert.deepEqual(scaled.random,picked.random);
assert.equal(E.resize(scaled,'cardScale',99).display.cardScale,2);
const reset=E.resize(scaled,'reset');assert.equal(reset.display.boardScale,shipped);assert.equal(reset.display.cardScale,cardDefault);
assert.deepEqual(E.snapshot(data,JSON.parse(JSON.stringify(scaled))),E.snapshot(data,scaled),'display settings must survive history restoration');
console.log('Showdown controls: terrain selection constraints, resize and persisted display settings passed.');

// Viewers must replace legacy terrain tile references with canonical rule cards.
const viewContext={window:{}};require('node:vm').runInNewContext(fs.readFileSync(path.join(root,'assets/showdown-terrain.js'),'utf8'),viewContext);
require('node:vm').runInNewContext(fs.readFileSync(path.join(root,'assets/showdown-view.js'),'utf8'),viewContext);
const legacy=E.snapshot(data,lion);legacy.level.fixed[0].card={name:'2 Tall Grass',file:'wrong-terrain-tile.png'};legacy.random[0].card={name:legacy.random[0].name,file:'wrong-random-tile.png'};
const target={style:{setProperty(){}},querySelectorAll(){return [];}};viewContext.window.ShowdownView.render(target,legacy);
// A battle that never touched the controls renders at the shipped defaults: the
// viewer must put those numbers on the panel even when the snapshot is silent.
const painted={},recording={style:{setProperty(n,v){painted[n]=v;},getPropertyValue(n){return painted[n]||'';}},querySelectorAll(){return [];},querySelector(){return null;}};
viewContext.window.ShowdownView.render(recording,E.snapshot(data,picked));
assert.equal(painted['--sd-board-scale'],1.7,'the second screen opens with the board at 170%');
assert.equal(painted['--sd-card-width'],'330px','the second screen opens with cards at 150% of the 220px base');
assert.ok(!target.innerHTML.includes('wrong-terrain-tile'));assert.ok(!target.innerHTML.includes('wrong-random-tile'));
assert.ok(target.innerHTML.includes(viewContext.window.ShowdownTerrain.byName['2 Tall Grass'].file));
// The card column is one ungrouped sequence: a single grid, no category headings.
assert.equal((target.innerHTML.match(/class="sd-cards"/g)||[]).length,1,'viewer cards must render as one sequence');
assert.ok(!target.innerHTML.includes('<h3>'),'the second screen must not group cards under headings');
// Cards are pure art, and the terrain label list must not come back.
assert.ok(!target.innerHTML.includes('<small>'),'cards must show art only, no captions');
assert.ok(!target.innerHTML.includes('块）'),'the terrain label list belongs to the board, not the card column');
assert.ok(target.innerHTML.includes('aria-label="放大'),'the card name must survive as the accessible label');
// Terrain that shares one name is introduced once, however often it is placed.
const twice=JSON.parse(JSON.stringify(legacy));
twice.level.unfixed=[{name:'2 Tall Grass',positions:[[1,1]],size:{x:1,y:1},rotations:[0]}];
const dedup={style:{setProperty(){}},querySelectorAll(){return [];}};viewContext.window.ShowdownView.render(dedup,twice);
const cards=html=>(html.match(/class="sd-card"/g)||[]).length;
assert.equal((dedup.innerHTML.match(/aria-label="放大 2 Tall Grass"/g)||[]).length,1,'same-name terrain must be introduced once');
assert.equal(cards(dedup.innerHTML),cards(target.innerHTML),'a repeat of an existing terrain card must not add a card');
assert.equal((target.innerHTML.match(/class="sd-card"/g)||[]).length,[legacy.level.basicAction,legacy.level.info,...legacy.level.starting,...legacy.level.fixed,...legacy.level.unfixed,...legacy.level.special.filter(t=>t.card),...legacy.random,...legacy.terrainStart].filter(Boolean).length,'every card must be listed once, in order');
// The right column reads upwards from the bottom. The card run is pinned to the
// panel's bottom edge and grows upwards, and the boss line plus the stat chips
// close the column underneath the cards; the legend keeps the top. This is CSS on
// the viewer, so the markup order (reading order, and the in-app preview) is intact.
// 旋转 turns each card's art inside those cards, so it never reorders or re-wraps
// the run: the reading order below holds turned and upright alike.
const sheet=fs.readFileSync(path.join(root,'assets/showdown.css'),'utf8');
assert.match(sheet,/\.sd-viewer \.sd-card-sidebar\{display:flex;flex-direction:column\}/,'the right column must stack as a flex column');
assert.match(sheet,/\.sd-viewer \.sd-sidebar-content>\.sd-cards\{order:2;margin-top:auto\}/,'the card run must be pinned to the bottom of the column, growing upwards');
assert.match(sheet,/\.sd-viewer \.sd-sidebar-content>\.sd-heading\{order:3\}/,'the boss name/level line must close the column under the cards');
assert.match(sheet,/\.sd-viewer \.sd-sidebar-content>\.sd-stats\{order:4\}/,'the stat chips must sit at the very bottom, under the boss line');
console.log('Showdown viewer: legacy terrain references resolve to verified introduction cards.');
