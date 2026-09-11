(function(root, factory) {
  const engine = factory();
  if (typeof module === 'object' && module.exports) module.exports = engine;
  else root.LootEngine = engine;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';
  const copy = x => JSON.parse(JSON.stringify(x));
  function integer(n, min=0, max=999) {
    if (!Number.isInteger(n) || n < min || n > max) throw new Error(`数量必须为 ${min}–${max} 的整数。`);
    return n;
  }
  function shuffle(a, random=Math.random) {
    a=a.slice(); for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a;
  }
  function create(data, bossId, levelId, id, source='manual', options={}) {
    const boss=data.bosses.find(b=>b.id===bossId), level=boss?.levels.find(l=>l.id===levelId);
    if(!level) throw new Error('找不到这个 Boss 或等级。');
    return {schemaVersion:1,id,bossId,levelId,source,includeLumpOfAtnas:options.includeLumpOfAtnas===true,includePromoVermin:options.includePromoVermin===true,createdAt:Date.now(),piles:{},held:[],discarded:[],claimed:false,pending:null,rolls:[],notes:[],history:[]};
  }
  function context(data,s) {
    const boss=data.bosses.find(b=>b.id===s.bossId),level=boss?.levels.find(l=>l.id===s.levelId);
    if(!level)throw new Error('该战斗的 Boss 或等级已不存在，请导出记录后新建战斗。');
    return {boss,level};
  }
  function huntSelection(data,hunt) {
    let boss=data.bosses.find(b=>b.huntMonsterId===hunt.monster?.id);
    let level=boss?.levels.find(l=>l.name===hunt.levelName);
    // Older extracted hunt data accidentally appended other modules' scenarios.
    const legacy={king:{'Killenium Butcher 2':'killenium-butcher','Killenium Butcher 3':'killenium-butcher'},sunstalker:{'Young Lion':'white-lion-whitebox'}};
    if(!level&&legacy[hunt.monster?.id]?.[hunt.levelName]){boss=data.bosses.find(b=>b.id===legacy[hunt.monster.id][hunt.levelName]);level=boss?.levels.find(l=>l.name===hunt.levelName);}
    if(!hunt.levelName)level=boss?.levels.find(l=>l.level===hunt.level&&l.hunt);
    return level?{boss,level}:null;
  }
  function deckId(data,s,id) {
    const {boss}=context(data,s);
    const resolved=id==='basic'?boss.basicDeck:id==='monster'?boss.resourceDeck:id;
    if(!data.decks[resolved])throw new Error('该 Boss 没有对应牌库。');
    return resolved;
  }
  const coreVermin='kingdom-death-monster-archive--core-vermin';
  const baseVermin=new Set(['Crab Spider','Cyclops Fly','Hissing Cockroach','Lonely Ant','Nightmare Tick','Sword Beetle']);
  function cardEnabled(data,s,cid) {
    const card=data.cards[cid];
    if(s.includeLumpOfAtnas===false&&card.name==='Lump of Atnas')return false;
    if(card.deck!==coreVermin||baseVermin.has(card.name))return true;
    // These switches configure the core draw pool; source archives stay separate.
    return card.name!=='Gibbering Haremite'||s.includePromoVermin!==false;
  }
  function deckCards(data,s,id) {
    id=deckId(data,s,id);
    // Missing option means a legacy battle: preserve its original full deck.
    const deck=data.decks[id];
    const cards=deck.cards;
    return cards.filter(cid=>cardEnabled(data,s,cid));
  }
  function pile(data,s,id,random) {
    id=deckId(data,s,id);
    if(!s.piles[id])s.piles[id]=shuffle(deckCards(data,s,id),random);
    return s.piles[id];
  }
  function checkpoint(s) {const state=copy(s);delete state.history;return state;}
  function change(s,label,fn) {
    const next=copy(s);fn(next);next.history.push({label,state:checkpoint(s)});return next;
  }
  function drawInto(data,s,id,count,random) {
    integer(count); if(!count)return;
    const p=pile(data,s,id,random);
    if(p.length<count)throw new Error(`${data.decks[deckId(data,s,id)].name} 剩余 ${p.length} 张，需要 ${count} 张；没有发出任何卡牌。`);
    s.held.push(...p.splice(0,count));
  }
  function namedDeck(data,s,name,preferred) {
    const {boss}=context(data,s);
    const candidates=preferred?[deckId(data,s,preferred)]:[...boss.defaultDecks,'kingdom-death-monster-archive--core-strange-resources','kingdom-death-monster-archive--core-rare-gear',...Object.keys(data.decks).filter(id=>!/(primal-tactics|tracks-of-death|all-gear)/.test(id))];
    return [...new Set(candidates)].find(id=>(preferred||data.decks[id]?.kind!=='reserve')&&data.decks[id]?.cards.some(cid=>data.cards[cid].name===name));
  }
  function takeInto(data,s,name,count,preferred,random) {
    integer(count);if(!count)return;
    const id=namedDeck(data,s,name,preferred);
    if(!id)throw new Error(`模组牌库缺少「${name}」，请查看规则并手动记录。`);
    const ids=[id,...Object.values(data.decks).filter(d=>d.reserveFor===id).map(d=>d.id)];
    const matches=ids.flatMap(d=>pile(data,s,d,random).filter(cid=>data.cards[cid].name===name));
    if(matches.length<count)throw new Error(`「${name}」剩余 ${matches.length} 张，需要 ${count} 张；已获得和已弃置的卡不会重新抽取。`);
    for(const cid of matches.slice(0,count)){const p=s.piles[data.cards[cid].deck];p.splice(p.indexOf(cid),1);s.held.push(cid);}
  }
  function draw(data,s,id,count,random=Math.random) {integer(count,1);return change(s,'补抽',n=>drawInto(data,n,id,count,random));}
  function take(data,s,cid,random=Math.random) {
    const card=data.cards[cid];if(!card)throw new Error('卡牌不存在。');
    return change(s,'指定拿牌',n=>{const p=pile(data,n,card.deck,random),i=p.indexOf(cid);if(i<0)throw new Error('这张卡已经获得或弃置，不能再次拿取。');p.splice(i,1);n.held.push(cid);});
  }
  function discard(data,s,cid) {return change(s,'弃置',n=>{const i=n.held.indexOf(cid);if(i<0)throw new Error('这张卡不在已获得区域。');n.held.splice(i,1);n.discarded.push(cid);});}
  function undo(s) {
    if(!s.history.length)throw new Error('没有可撤销的操作。');
    const next=copy(s.history[s.history.length-1].state);next.history=copy(s.history.slice(0,-1));return next;
  }
  function prepare(data,s,inputs={},random=Math.random) {
    if(s.claimed)throw new Error('本场战后奖励已经领取。');
    if(s.pending)return s;
    const {level}=context(data,s),r=level.reward;
    if(!r || r.type==='manual')throw new Error(r?.note || '请按规则手动结算。');
    for(const input of r.inputs || []) {
      if(input.type==='boolean'){if(typeof inputs[input.key]!=='boolean')throw new Error('请先选择：'+input.label);}
      else if(input.type==='deck'){if(!data.decks[inputs[input.key]]||data.decks[inputs[input.key]].kind!=='monster')throw new Error('请选择怪物资源牌库。');}
      else if(input.type==='card'){
        const card=data.cards[inputs[input.key]],allowed=input.deck==='strange'?Object.values(data.decks).filter(d=>d.kind==='strange').map(d=>d.id):[deckId(data,s,input.deck)];
        if(!card||!allowed.includes(card.deck)||!available(data,s,card.deck).includes(card.id))throw new Error('请选择剩余牌库中的卡牌：'+input.label);
      }
      else integer(inputs[input.key],input.min ?? 0,input.max ?? 99);
    }
    const pending={ops:[],rolls:[],notes:[],inputs:copy(inputs)};
    function count(value) {return typeof value==='object'?integer(value.level?level.level+(value.add||0):inputs[value.input]):integer(value ?? 1);}
    function steps(items) {
      for(const step of items || []) {
        if(step.op==='note')pending.notes.push(step.text);
        else if(step.op==='if')steps(inputs[step.key]?step.yes:step.no);
        else if(step.op==='repeat'){for(let i=0;i<count(step.count);i++)steps(step.steps);}
        else if(step.op==='roll') {
          const raw=1+Math.floor(random()*(step.sides||10));const bonus=step.bonus==='level'?level.level:step.bonus||0;const total=raw+bonus;
          pending.rolls.push({label:step.label || '奖励骰',sides:step.sides||10,raw,bonus,total});
          const row=step.rows.find(r=>total>=r.min && (r.max==null || total<=r.max));
          if(!row)throw new Error('奖励骰表缺少这个结果，请查看规则原图。');
          if(row.label)pending.notes.push(row.label);
          steps(row.steps);
        } else if(step.op==='chosen') {
          pending.ops.push({op:'chosen',cid:inputs[step.key]});
        } else if(step.op==='draw'||step.op==='take') {
          const n=copy(step);n.count=count(n.count);
          if(typeof n.deck==='object')n.deck=inputs[n.deck.input];
          if(n.once&&pending.ops.some(op=>op.op==='take'&&op.name===n.name))continue;
          if(n.count)pending.ops.push(n);
        } else throw new Error('无法识别的奖励规则。');
      }
    }
    steps(r.steps);
    const next=copy(s);next.pending=pending;return next;
  }
  function claim(data,s,random=Math.random) {
    if(s.claimed)throw new Error('本场战后奖励已经领取。');
    if(!s.pending)throw new Error('请先生成奖励。');
    const n=copy(s);
      // Reserve chosen/named cards before random draws from the same pool.
      for(const op of [...n.pending.ops.filter(o=>o.op!=='draw'),...n.pending.ops.filter(o=>o.op==='draw')]) {
        if(op.op==='draw')drawInto(data,n,op.deck,op.count,random);
        else if(op.op==='chosen'){const c=data.cards[op.cid],p=pile(data,n,c.deck,random),i=p.indexOf(c.id);if(i<0)throw new Error('所选卡牌已被获得或弃置，请使用其他剩余实例。');p.splice(i,1);n.held.push(c.id);}
        else takeInto(data,n,op.name,op.count,op.deck,random);
      }
      n.rolls.push(...n.pending.rolls);n.notes.push(...n.pending.notes);n.rewardInputs=copy(n.pending.inputs);n.claimed=true;n.pending=null;
      // Claim is a boundary: undoing a later discard can never unclaim rewards.
      n.history=[];return n;
  }
  function available(data,s,id) {id=deckId(data,s,id);return (s.piles[id] || deckCards(data,s,id)).slice();}
  function validate(data,s) {
    context(data,s);
    for(const key of ['includeLumpOfAtnas','includePromoVermin'])if(s[key]!==undefined&&typeof s[key]!=='boolean')throw new Error('战斗的可选资源设置无效。');
    const seen=new Set();
    for(const [id,remaining] of Object.entries(s.piles)){
      if(!data.decks[id])throw new Error('存档包含未知牌库。');
      for(const cid of remaining){if(data.cards[cid]?.deck!==id||!deckCards(data,s,id).includes(cid)||seen.has(cid))throw new Error('存档牌库无效。');seen.add(cid);}
    }
    for(const cid of [...s.held,...s.discarded]){if(!data.cards[cid]||seen.has(cid)||!s.piles[data.cards[cid].deck])throw new Error('存档卡牌重复或不存在。');seen.add(cid);}
    for(const cid of seen)if(!deckCards(data,s,data.cards[cid].deck).includes(cid))throw new Error('存档包含未启用的可选资源。');
    for(const id of Object.keys(s.piles))for(const cid of deckCards(data,s,id))if(!seen.has(cid))throw new Error('存档丢失卡牌。');
    return true;
  }
  return {create,context,huntSelection,draw,take,discard,undo,prepare,claim,available,deckCards,validate,namedDeck,shuffle};
});
