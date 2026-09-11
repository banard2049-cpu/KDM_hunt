// Shared import boundary: source archives also contain community expansions.
const excluded=require('./excluded-content.json');
const assetMap=Object.fromEntries(require('./official-assets.json').map(p=>[p.source,p.target]));
function assets(data){return JSON.parse(JSON.stringify(data).replace(/assets\/[^"\s]+/g,p=>assetMap[p]||p));}
const fanArchive=/^(ccg-homebrew|tracks-of-death|primal-tactics|forsaker-sisters|storm-knight|king-s-coin|drifter-knight|allison-the-twilight-knight|harvester-worm|charrogg|gnasher|black-lion|scourgelord|curse)-archive--/;
function walk(x,fn){if(!x||typeof x!=='object')return;fn(x);for(const v of Object.values(x))walk(v,fn);}
function bosses(data){data.bosses=data.bosses.filter(b=>!excluded.bosses.includes(b.id));for(const b of data.bosses)if(b.id==='bone-eaters')b.group='赌博';}
function hunt(data,monsters){
 const keep=new Set(['Hunt Events','Core Hunt Events','Promo Hunt Events','Core Promo Hunt Events','Secret Hunt Events',...monsters.map(m=>m.huntEventsDeck)]);
 data.decks=Object.fromEntries(Object.entries(data.decks).filter(([k])=>keep.has(k)).map(([k,v])=>[k,v.filter(c=>!excluded.huntCards[k]?.includes(c.name.toLowerCase()))]));
 data.deckBacks=Object.fromEntries(Object.entries(data.deckBacks).filter(([k])=>keep.has(k)));
 const used=new Set();walk([data.decks,data.deckBacks,data.shared],x=>{if(x.sheet)used.add(x.sheet);});
 for(const k of ['sheets','backs'])data[k]=Object.fromEntries(Object.entries(data[k]).filter(([id])=>used.has(id)));
}
function loot(data){
 bosses(data);
 const removed=Object.values(data.cards).filter(c=>fanArchive.test(c.deck));
 const fanNames=new Set(removed.map(c=>c.name));
 const officialNames=new Set(Object.values(data.cards).filter(c=>!fanArchive.test(c.deck)&&! /^(kingdom-death-monster|rare-gear|strange-resources|vermin)-archive--/.test(c.deck)).map(c=>c.name));
 const vermin=new Set(['Crab Spider','Cyclops Fly','Hissing Cockroach','Lonely Ant','Nightmare Tick','Sword Beetle','Gibbering Haremite','Carmine Cochineal','Splitting Salamander']);
 data.decks=Object.fromEntries(Object.entries(data.decks).filter(([id])=>!fanArchive.test(id)));
 for(const d of Object.values(data.decks)){d.cards=d.cards.filter(id=>{const c=data.cards[id];return (d.kind!=='vermin'||vermin.has(c.name))&&(d.kind==='vermin'||!fanNames.has(c.name)||officialNames.has(c.name));});delete d.legacyCards;}
 const ids=new Set(Object.values(data.decks).flatMap(d=>d.cards));
 data.cards=Object.fromEntries(Object.entries(data.cards).filter(([id])=>ids.has(id)));
 const sheets=new Set(Object.values(data.cards).map(c=>c.sheet));data.sheets=Object.fromEntries(Object.entries(data.sheets).filter(([id])=>sheets.has(id)));
 for(const b of data.bosses)b.defaultDecks=b.defaultDecks.filter(id=>data.decks[id]);
 // The source mod replaced the core King's Man reward page with King's Coin.
 // Restore the core table transcribed in the existing HD source annotation.
 const king=data.bosses.find(b=>b.id==='king-s-man');
 for(const l of king?.levels||[]){
  l.rule.file='assets/loot/kings-man-core.jpg';l.rule.files=[l.rule.file];delete l.rule.hdDifference;
  const take=(name,count,deck)=>({op:'take',name,count,...deck?{deck}:{}});
  l.reward={type:'automatic',inputs:[],steps:[{op:'roll',sides:10,bonus:'level',label:'奖励骰',rows:[
   {min:1,max:4,steps:[take('Broken Lantern',2,'basic'),take('Monster Organ',1,'basic')]},
   {min:5,max:8,steps:[{op:'note',text:'每名幸存者获得一个随机战斗技艺。'}]},
   {min:9,max:null,steps:[take('Steel Sword',1),{op:'draw',deck:'basic',count:1}]}
  ]},{op:'note',text:'结算王之诅咒及规则书列出的其他效果。'}]};
 }
}
function showdown(data){
 bosses(data);
 for(const b of data.bosses)if(b.id==='king-s-man')for(const l of b.levels){l.rule.file='assets/loot/kings-man-core.jpg';l.rule.files=[l.rule.file];delete l.rule.hdDifference;}
 data.expansions=data.expansions.filter(e=>!e.fan&&!excluded.expansions.includes(e.id)&&e.id!=='CharroggTerrain');
 const used=new Set();walk([data.bosses,data.expansions],x=>{if(x.id&&x.file)used.add(x.id);});
 data.cards=Object.fromEntries(Object.entries(data.cards).filter(([id])=>used.has(id)));
 const names=new Set(data.expansions.flatMap(e=>e.cards.map(c=>c.name)));
 walk(data.bosses,x=>{if(x.terrainTile&&x.name)names.add(x.name);});
 data.terrain=Object.fromEntries(Object.entries(data.terrain).filter(([name])=>names.has(name)));
 const tiles=new Set(Object.values(data.terrain).map(t=>t.terrainTile));walk(data.bosses,x=>{if(x.terrainTile)tiles.add(x.terrainTile);});
 data.sizes=Object.fromEntries(Object.entries(data.sizes).filter(([name])=>tiles.has(name)));
}
module.exports={hunt,loot,showdown,excluded,walk,assets};
