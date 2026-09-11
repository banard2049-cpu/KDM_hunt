/* Local, deterministic TTS import. No Lua is evaluated and no network is used. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {tableField,values}=require('./tts-literals.cjs');
const root=path.resolve(__dirname,'..'),mods=process.argv[2];
if(!mods)throw Error('Usage: node scripts/import-showdown.cjs <Mods directory>');
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const files=['(Don)KDM_GCE.json','(Don)KDM 千宰屠夫专用.json'];
const docs=files.map(file=>({file,data:JSON.parse(fs.readFileSync(path.join(mods,'Workshop',file),'utf8'))}));
const loot=JSON.parse(fs.readFileSync(path.join(root,'data/loot.json'),'utf8'));
const labelSource=fs.readFileSync(path.join(root,'assets/loot-ui.js'),'utf8').match(/const labels=\{([^\n]+)\};/)[1];
const labels=Object.fromEntries([...labelSource.matchAll(/'([^']+)':'([^']+)'/g)].map(m=>[m[1],m[2]]));
const entries=[],modules=[],cards={},terrain={},sizes={},expansions=[],warnings=[];
function walk(o,anc,doc,deck){
 if(!o||typeof o!=='object')return;
 if(o.Name)entries.push({o,anc,doc,deck});
 for(const c of o.ObjectStates||[])walk(c,anc,doc,null);
 for(const c of o.ContainedObjects||[])walk(c,[...anc,o.Nickname||''],doc,o.CustomDeck||deck);
}
docs.forEach((d,i)=>{walk(d.data,[],i,null);for(const chunk of d.data.LuaScript.split('__bundle_register(')){
 const mod=chunk.match(/^"Kdm\/Expansion\/([^"/]+)"/)?.[1];
 if(!mod||(i===1)!==(mod==='KilleniumButcher'))continue;
 modules.push({mod,doc:i,chunk,name:chunk.match(/\bname\s*=\s*"([^"]+)"/)?.[1]||mod,monsters:values(tableField(chunk,'monsters'))});
 }});
const cache=fs.readdirSync(path.join(mods,'Images')),images=new Map();
function image(url){
 if(!url)return null;if(images.has(url))return images.get(url);
 const key=url.replace(/[^a-z0-9]/gi,'').toLowerCase();
 const f=cache.find(x=>x.slice(0,x.lastIndexOf('.')).toLowerCase()===key);
 if(!f){warnings.push('Missing image: '+url);images.set(url,null);return null;}
 const dest='assets/showdown/'+crypto.createHash('sha256').update(url).digest('hex').slice(0,20)+path.extname(f).toLowerCase();
 fs.mkdirSync(path.join(root,'assets/showdown'),{recursive:true});fs.copyFileSync(path.join(mods,'Images',f),path.join(root,dest));images.set(url,dest);return dest;
}
function pick(name,mod,doc=0,deckName,kind){
 const found=entries.filter(e=>e.doc===doc&&e.o.Nickname===name&&(!kind||kind==='card'&&/^Card/.test(e.o.Name)&&e.o.CardID!=null&&e.o.GMNotes!=='Terrain Tiles'||kind==='terrain'&&/^Card/.test(e.o.Name)&&e.o.CardID!=null&&(e.o.GMNotes==='Terrain'||!e.o.GMNotes&&e.anc.some(a=>/Terrain$/.test(a)))||kind==='deck'&&/^(Card|Deck)/.test(e.o.Name)&&e.o.GMNotes!=='Terrain Tiles'));
 const norm=s=>s.replace(/[^a-z]/gi,'').toLowerCase();
 const score=e=>(deckName&&e.anc.includes(deckName)?200:0)+(e.anc.some(a=>norm(a).includes(norm(mod)))?100:0)+(e.anc.includes('Kingdom Death: Monster')?20:0)+(e.anc.some(a=>/Archive/.test(a))?5:0);
 return found.sort((a,b)=>score(b)-score(a))[0];
}
function card(entry,name){
 if(!entry)return {name,missing:true};const o=entry.o,id=entry.doc+':'+o.GUID+':'+(o.CardID||'');
 if(cards[id])return cards[id];
 const map={...entry.deck,...o.CustomDeck},cd=map[Math.floor(o.CardID/100)]||(Object.keys(o.CustomDeck||{}).length===1?Object.values(o.CustomDeck)[0]:null),index=o.CardID%100;
 const result={id,name:o.Nickname||name,source:{file:files[entry.doc],guid:o.GUID,path:entry.anc.join('/'),cardId:o.CardID,objectType:o.Name,gmNotes:o.GMNotes}};
 if(cd)Object.assign(result,{file:image(cd.FaceURL),w:cd.NumWidth,h:cd.NumHeight,col:index%cd.NumWidth,row:Math.floor(index/cd.NumWidth)});
 else Object.assign(result,{file:image(o.CustomImage?.ImageURL),w:1,h:1,col:0,row:0});
 if(!result.file)result.missing=true;cards[id]=result;return result;
}
for(const m of modules){
 Object.assign(terrain,tableField(m.chunk,'terrain'));Object.assign(sizes,tableField(m.chunk,'terrainTileSizes'));
 const component=tableField(m.chunk,'components').Terrain;if(!component)continue;
 const names=typeof component==='string'?[component]:values(component),instances=[];
 for(const name of names){const e=pick(name,m.mod,m.doc,undefined,'deck');if(!e){warnings.push('Missing terrain component: '+m.mod+'/'+name);continue;}
 const list=e.o.ContainedObjects||[e.o];list.forEach((o,i)=>{const ref=card({...e,o,deck:e.o.CustomDeck},o.Nickname);instances.push({id:m.mod+':'+e.o.GUID+':'+i,card:ref,name:ref.name});});}
 expansions.push({id:m.mod,name:m.name,cards:instances});
}
// TTS's named grid is on the showdown board, not on the movable overlay object.
const board=entries.find(e=>e.doc===0&&e.o.Nickname==='Showdown Board').o;
const grid={cols:22,rows:16,left:6.0804635,right:-5.735014,top:-2.8629885,bottom:5.5242755};
function transform(t){const r=(t.rotY||0)*Math.PI/180;return {x:t.posX||0,z:t.posZ||0,r,sx:t.scaleX??1,sz:t.scaleZ??1};}
function point(t,x,z){return {x:t.x+Math.cos(t.r)*x*t.sx+Math.sin(t.r)*z*t.sz,z:t.z-Math.sin(t.r)*x*t.sx+Math.cos(t.r)*z*t.sz};}
const bt=transform(board.Transform);
function worldCell(x,z){const dx=x-bt.x,dz=z-bt.z,lx=(Math.cos(bt.r)*dx-Math.sin(bt.r)*dz)/bt.sx,lz=(Math.sin(bt.r)*dx+Math.cos(bt.r)*dz)/bt.sz;return [(lx-grid.left)/(grid.right-grid.left)*21+1,(lz-grid.top)/(grid.bottom-grid.top)*15+1];}
function inside(p,poly){let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if(((a[1]>p[1])!==(b[1]>p[1]))&&(p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0]))yes=!yes;}return yes;}
function zone(e){
 if(!e)return null;const polygons=[],unsupported=[];
 const saved=e.o.Description?.split(',').map(Number);
 if(saved?.length!==6||!saved.every(Number.isFinite))return null;
 const rootT=transform({...e.o.Transform,posX:saved[0],posZ:saved[2],rotY:saved[4]});
 function visit(o,parent,isRoot){
  const t=isRoot?rootT:transform(o.Transform),apply=p=>{const q=point(t,p.x,p.z);return parent?parent(q):q;};
  if(o.CustomMesh?.MeshURL?.includes('C4C5261BA87C2906DAE5159D658E8C87411A7FAA'))polygons.push([[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,z])=>{const p=apply({x,z});return worldCell(p.x,p.z);}));
  else unsupported.push(o.GUID);
  for(const c of o.ChildObjects||[])visit(c,apply,false);
 }
 visit(e.o,null,true);const cells=[];
 for(let y=1;y<=16;y++)for(let x=1;x<=22;x++)if(polygons.some(p=>inside([x,y],p)))cells.push([x,y]);
 return {name:e.o.Nickname,cells,polygons,source:{file:files[e.doc],guid:e.o.GUID},status:unsupported.length?'partial':'extracted',unsupported};
}
const pos=s=>{const m=typeof s==='string'&&s.match(/^\(([-\d.]+),\s*([-\d.]+)\)$/);return m?[+m[1],+m[2]]:null;};
const bosses=loot.bosses.map(b=>{
 const mod=modules.find(m=>m.mod===b.expansion);let m=mod?.monsters.find(x=>slug(x.IsAddedToCore?x.name+' · '+mod.name:x.name)===b.id)||mod?.monsters[0];
 if(!m)return {...b,levels:b.levels.map(l=>({...l,warnings:['决战资料缺失']}))};
 if(m.IsAddedToCore){const base=modules.flatMap(x=>x.monsters).find(x=>x.name===m.name&&!x.IsAddedToCore);m={...base,...m};}
 const resolve=(name,deckName)=>card(pick(name,b.expansion,mod.doc,deckName,'card'),name);
 const terrainCard=name=>card(pick(name,b.expansion,mod.doc,undefined,'terrain'),name);
 return {id:b.id,name:b.name,displayName:labels[b.id]?labels[b.id]+' · '+b.name:b.name,aliases:[...b.aliases,labels[b.id]||''],group:b.group,expansion:b.expansion,huntMonsterId:b.huntMonsterId,levels:b.levels.map(l=>{
 const raw=values(m.levels).find(x=>slug(x.name)===l.id)||{},s=raw.showdown||{},get=k=>Object.hasOwn(s,k)?s[k]:m[k],notes=[];
 const refs=values(get('miscObject')).concat(values(get('specialTerrain')).flatMap(x=>values(x.miscObject)));
 const zones=refs.filter(x=>/Sur[v]?i[v]?or Start Zone/.test(x.name)).map(x=>zone(pick(x.name,b.expansion,mod.doc))).filter(Boolean);
 // King keeps the matching zone in its archive rather than in miscObject.
 if(!zones.length&&b.id==='king'){const z=zone(pick('Survivor Start Zone (King)',b.expansion,mod.doc));if(z)zones.push(z);}
 if(!zones.length||zones.some(z=>!z.cells.length||z.status==='partial'))notes.push('蓝色起始区域资料缺失或不完整，请核对布场规则原图。');
 const figures=values(s.figurines).flatMap(f=>(f.positions?values(f.positions):[f.position]).map(p=>({name:f.name,position:pos(p),rotation:f.rotation?.y||0,size:modules.flatMap(x=>[...x.monsters,...values(tableField(x.chunk,'minions'))]).find(x=>x.name===f.name)?.size||(/^Harvester Worm\d+$/.test(f.name)?m.size:null)})));
 if(!figures.length)figures.push({name:m.name,position:pos(get('position')),rotation:get('rotation')?.y||0,size:m.size});
 if(figures.some(f=>!f.position||!f.size))notes.push('部分怪物起始位置或占地缺失。');
 const fixed=values(get('fixedTerrain')).map(t=>({name:t.terrain,positions:values(t.positions).map(pos),rotations:values(t.rotations).map(r=>r.y||0),size:sizes[terrain[t.terrain]?.terrainTile]||null,card:terrainCard(t.terrain)}));
 const special=values(get('specialTerrain')).map(t=>({name:t.terrain||t.terrainTile,card:t.terrain?terrainCard(t.terrain):null,positions:t.position?[pos(t.position)]:[],rotations:[t.rotation?.y||0],size:sizes[t.terrainTile]||null}));
 const deckFields={basic:'basicAiDeck',advanced:'advancedAiDeck',legendary:'legendaryAiDeck',special:'specialAiDeck',basic2:'basicAiDeck2',advanced2:'advancedAiDeck2',legendary2:'legendaryAiDeck2'};
 const starting=Object.entries(s.starting||{}).flatMap(([kind,ns])=>values(ns).map(name=>({...resolve(name,m[deckFields[kind]]||(deckFields[kind]?m.name+' '+kind[0].toUpperCase()+kind.slice(1)+' AI':undefined)),kind})));
 const stats=Object.fromEntries(['movement','toughness','speed','damage','accuracy','evasion','luck'].map(k=>[k,s[k]??0]));
 return {id:l.id,name:l.name,level:l.level,rule:l.rule,figures,zones,fixed,special,unfixed:values(get('unfixedTerrain')).map(name=>({name,card:terrainCard(name)})),randomTerrain:get('randomTerrain')??0,stats,starting,basicAction:resolve(m.basicAction||m.name+' Basic Action'),info:resolve(m.info||m.name+' Info'),warnings:notes,source:{file:files[mod.doc],module:b.expansion}};
 })};
});
 for(const [name,t]of Object.entries(terrain))for(const start of values(t.starting))card(pick(start,'Core',0,undefined,'card'),start);
 const result={schemaVersion:1,dataVersion:'tts-showdown-1',grid,bosses,expansions,terrain,sizes,cards,warnings};
// The modder filed several terrain cards from other content under the Core
// deck; the printed emblems say otherwise. Re-file them before writing.
require('./refile-terrain.cjs')(result);
require('./official-content.cjs').showdown(result);
Object.assign(result,require('./official-content.cjs').assets(result));
fs.writeFileSync(path.join(root,'data/showdown.json'),JSON.stringify(result,null,2));
require('./build-showdown-terrain.cjs')(root,result);
fs.mkdirSync(path.join(root,'docs'),{recursive:true});
fs.writeFileSync(path.join(root,'docs/showdown-import-report.json'),JSON.stringify({bosses:bosses.length,levels:bosses.reduce((n,b)=>n+b.levels.length,0),warnings,review:bosses.flatMap(b=>b.levels.map(l=>({boss:b.id,level:l.id,zones:l.zones?.map(z=>({name:z.name,cells:z.cells.length,status:z.status})),warnings:l.warnings,missingCards:[l.basicAction,l.info,...l.starting||[]].filter(c=>c?.missing).map(c=>c.name)})))},null,2));
console.log(`Imported ${bosses.length} bosses, ${Object.keys(cards).length} cards, ${images.size} images, ${warnings.length} warnings.`);
