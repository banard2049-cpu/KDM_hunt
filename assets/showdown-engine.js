(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.ShowdownEngine=api;})(typeof window==='object'?window:this,function(){
 'use strict';
 const copy=o=>JSON.parse(JSON.stringify(o));
 // The second screen opens with a board that is 170% of the resting 100% size, so
 // the board is what the display is for and the card column takes the rest. The
 // 「版图大小」 controls still move from here (50%–200%) and 「重置大小」 comes back
 // to this default. The viewer keeps the same number in showdown-view.js — a test
 // pins the two together.
 const DEFAULT_BOARD_SCALE=1.7;
 // Cards open at 150% of the base card width the viewer draws at 100%. Same deal:
 // the 「卡牌大小」 controls still move from here and 「重置大小」 comes back to it.
 const DEFAULT_CARD_SCALE=1.5;
 // The random terrain deck is an explicit list of card instances (`s.pool`), so
 // the host UI can show every terrain card and let the player tick single cards.
 // `s.expansions` is kept in sync for readability and for battles saved before
 // the pool existed; `draw` still understands it.
 //
 function context(data,s){const boss=data.bosses.find(b=>b.id===s.bossId),level=boss?.levels.find(l=>l.id===s.levelId);if(!level)throw Error('未知 Boss 或等级');return {boss,level};}
 function expansionOf(data,id){return (data.expansions||[]).find(e=>e.id===id)||null;}
 function cardsOf(data,id){return expansionOf(data,id)?.cards||[];}
 function bossExpansion(data,bossId){return (data.bosses||[]).find(b=>b.id===bossId)?.expansion;}
 function cardIndex(data){const m=new Map();for(const e of data.expansions||[])for(const c of e.cards)m.set(c.id,{...c,expansion:e.id});return m;}
 function ownerOf(data,cardId){return cardIndex(data).get(cardId)?.expansion||null;}
 // A level cannot be set up without the terrain its own rules call for.
 function requiredCounts(level){const m=new Map();for(const t of [...(level?.fixed||[]),...(level?.unfixed||[])])m.set(t.name,(m.get(t.name)||0)+1);return m;}
 function requiredTerrain(data,level){return new Set(requiredCounts(level).keys());}
 function suppliesRequired(data,expansion,level){const need=requiredTerrain(data,level);return !!expansion&&!!level&&(expansion.cards||[]).some(c=>need.has(c.name));}
 // Accepts expansion ids ("Core") and/or single card ids, so older callers and
 // tests that pass an expansion list keep working.
 function resolvePool(data,ids){
  const index=cardIndex(data),out=[];
  for(const id of ids||[]){
    const expansion=expansionOf(data,id);
    if(expansion)out.push(...expansion.cards.map(c=>c.id));
    else if(index.has(id))out.push(id);
  }
  return [...new Set(out)];
 }
 // Default deck: 基础牌库 alone, plus one physical copy of every terrain the
 // level's own rules force onto the board (those are not random draws).
 function defaultPool(data,boss,level){
  const index=cardIndex(data),core=cardsOf(data,'Core').map(c=>c.id),counts=new Map();
  for(const id of core){const n=index.get(id).name;counts.set(n,(counts.get(n)||0)+1);}
  const extra=[],sources=[cardsOf(data,boss?.expansion),...(data.expansions||[]).map(e=>e.cards)];
  for(const [name,want] of requiredCounts(level)){
    let have=counts.get(name)||0;
    for(const cards of sources){for(const c of cards){if(have>=want)break;if(c.name!==name||core.includes(c.id))continue;extra.push(c.id);have++;}if(have>=want)break;}
  }
  return [...core,...extra];
 }
 function poolIds(data,s){
  if(Array.isArray(s?.pool))return s.pool.slice();
  return (s?.expansions||[]).flatMap(id=>cardsOf(data,id).map(c=>c.id));
 }
 function poolCards(data,s){const index=cardIndex(data);return poolIds(data,s).map(id=>index.get(id)).filter(Boolean);}
 function groupsOf(data,ids){return [...new Set((ids||[]).map(id=>ownerOf(data,id)).filter(Boolean))];}
 function visibleExpansions(data){return data.expansions||[];}
 function poolExpansions(data,s){return groupsOf(data,poolIds(data,s));}
 function draw(data,s,rng=Math.random){
  const {level}=context(data,s),index=cardIndex(data),pool=poolIds(data,s).map(id=>index.get(id)).filter(Boolean).map(copy),required=[...level.fixed,...level.unfixed];
  const warnings=[],taken=[];
  for(const t of required){const i=pool.findIndex(c=>c.name===t.name);if(i>=0)taken.push(pool.splice(i,1)[0]);else warnings.push('随机地形池中缺少指定地形：'+t.name+'（已展示资料卡，请核对牌池）');}
  // Special terrain is taken directly from its archive in TTS, outside the deck.
  const count=level.randomTerrain;
  if(!Number.isInteger(count)||count<0)throw Error('随机地形数量资料不完整');
  if(pool.length<count)throw Error(`地形牌池不足：需要 ${count} 张，剩余 ${pool.length} 张。请在「随机地形池」里多勾几张。`);
  for(let i=pool.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
  return {...s,random:pool.slice(0,count),taken,drawWarnings:warnings,revision:(s.revision||0)+1};
 }
 function choose(data,s,ids){
  validate(data,s);const {level}=context(data,s);
  if(ids.length!==level.randomTerrain||new Set(ids).size!==ids.length)throw Error('请选择规定数量且不重复的地形实例');
  const reserved=new Set((s.taken||[]).map(c=>c.id)),pool=poolCards(data,s);
  const random=ids.map(id=>pool.find(c=>c.id===id&&!reserved.has(id)));
  if(random.some(c=>!c))throw Error('所选地形不在当前牌池中，或已用于固定／指定地形');
  return {...s,random:copy(random),revision:s.revision+1};
 }
 function resize(s,kind,delta){const display={boardScale:DEFAULT_BOARD_SCALE,cardScale:DEFAULT_CARD_SCALE,...s.display};
  if(kind==='reset'){display.boardScale=DEFAULT_BOARD_SCALE;display.cardScale=DEFAULT_CARD_SCALE;}
  else if(['boardScale','cardScale'].includes(kind))display[kind]=Math.round(Math.max(.5,Math.min(2,display[kind]+delta))*10)/10;
  return {...s,display,revision:s.revision+1};
 }
 function create(data,bossId,levelId,id,pool,rng){
  const {boss,level}=context(data,{bossId,levelId});
  const ids=pool&&pool.length?resolvePool(data,pool):defaultPool(data,boss,level);
  return draw(data,{schemaVersion:1,id,bossId,levelId,createdAt:new Date().toISOString(),pool:ids,expansions:groupsOf(data,ids),revision:0},rng);
 }
 function validate(data,s){
  context(data,s);
  if(s.schemaVersion!==1||typeof s.id!=='string'||!Array.isArray(s.expansions)||!Array.isArray(s.random)||!Number.isInteger(s.revision))throw Error('决战记录损坏');
  if(s.pool!==undefined&&!Array.isArray(s.pool))throw Error('决战记录损坏');
  const all=cardIndex(data),ids=[...(s.taken||[]),...s.random].map(c=>c.id);
  if(new Set(ids).size!==ids.length||ids.some(id=>!all.has(id)))throw Error('地形记录损坏');
  if((s.pool||[]).some(id=>!all.has(id)))throw Error('随机地形池记录损坏');
  return s;
 }
 function snapshot(data,s){validate(data,s);const {boss,level}=context(data,s),catalog=cardIndex(data),random=s.random.map(c=>copy(catalog.get(c.id))),terrainCards=[...level.fixed,...level.unfixed,...level.special.filter(t=>t.card),...random.map(c=>({name:c.name,card:c.card}))];
  const terrainStart=terrainCards.flatMap(c=>Object.values(data.terrain[c.name]?.starting||{})).map(name=>Object.values(data.cards).find(c=>c.name===name)||{name,missing:true});
  // The initial-position highlight (start squares, monster footprint and pinned
  // terrain) is on unless the host presses 隐藏初始位置, so the snapshot carries
  // `showStart` — defaulting to true, which is also what older battles get.
  // 「交换版图与卡牌」 and 「旋转卡牌区」 ride along with the same idea: board first
  // (swapped:false) and the card panel upright (cardRotation:0). 「对齐方式」 does
  // too, and rests on 靠下 ('bottom') — the board sits at the bottom of its panel
  // and the card run grows upwards from the bottom of the card column, which is
  // how the column has always been read. 「显示决战版图」/「显示Boss规则书」 is the
  // view switch itself: the second screen opens on the showdown board
  // (showRulebook:false) and only leaves it when the host asks for the level's
  // own rulebook pages.
  return {schemaVersion:1,dataVersion:data.dataVersion,battleId:s.id,revision:s.revision,display:{boardScale:DEFAULT_BOARD_SCALE,cardScale:DEFAULT_CARD_SCALE,showStart:true,swapped:false,cardRotation:0,align:'bottom',showRulebook:false,...s.display},boss:{id:boss.id,name:boss.displayName||boss.name},level:copy(level),random,terrainInfo:Object.fromEntries(terrainCards.map(c=>[c.name,{...data.terrain[c.name],count:data.terrain[c.name]?.count==='*'?level.level:data.terrain[c.name]?.count}])),terrainStart,drawWarnings:s.drawWarnings||[],grid:data.grid};
 }
 return {context,cardIndex,ownerOf,cardsOf,bossExpansion,requiredCounts,suppliesRequired,resolvePool,defaultPool,poolIds,poolCards,groupsOf,visibleExpansions,poolExpansions,create,draw,choose,resize,validate,snapshot,defaultBoardScale:DEFAULT_BOARD_SCALE,defaultCardScale:DEFAULT_CARD_SCALE};
});
