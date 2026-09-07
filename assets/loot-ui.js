(function() {
  'use strict';
  const E=window.LootEngine,$=id=>document.getElementById(id),key='kdm-loot-v1';
  const esc=s=>String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const uid=()=>window.crypto?.randomUUID?.() || 'battle-'+Date.now()+'-'+Math.random().toString(36).slice(2);
  let data,store={schemaVersion:1,active:null,sessions:{}},ready,loadError='',selectedDeck='',selectedGroup='全部',selectedBoss='',selectedLevel='';
  const labels={'white-lion':'白狮','screaming-antelope':'尖叫羚羊','phoenix':'凤凰','butcher':'屠夫','king-s-man':'王之禁卫','the-hand':'掌控者','watcher':'守望者','gold-smoke-knight':'金烟骑士','crimson-crocodile':'猩红鳄鱼','smog-singers':'烟雾歌者','king':'王','atnas':'甥啖老人','gambler':'赌徒','godhand':'神之手','killenium-butcher':'千宰屠夫','gorm':'格姆','flower-knight':'花骑士','dung-beetle-knight':'蜣螂骑士','spidicules':'针突蜘蛛','sunstalker':'逐日者','dragon-king':'龙王','lion-god':'狮之神','lion-knight':'狮骑士','manhunter':'猎人者','slenderman':'瘦长人','lonely-tree':'孤独之树','white-gigalion':'白色巨狮','black-lion':'黑狮','black-knight':'黑骑士','drifter-knight':'漂流骑士','harvester-worm':'收割蠕虫','bone-eaters':'食骨者'};
  const bossName=b=>labels[b.id]?labels[b.id]+' · '+b.name:b.name;
  function levelName(l){return /^Level \d+$/.test(l.name)?l.name.replace('Level ','等级 '):l.name==='Prologue'?'序章':l.name;}
  const current=()=>store.sessions[store.active];
  function notice(text,error=false){$('lootNotice').textContent=text;$('lootNotice').classList.toggle('error',error);}
  function save(){
    try{localStorage.setItem(key,JSON.stringify(store));return true;}
    catch(e){notice('保存失败，当前结果仍在页面中。请立即导出战利品记录，避免关闭后丢失。',true);return false;}
  }
  function update(s,message){store.sessions[s.id]=s;store.active=s.id;render();if(save())notice(message);}
  function run(fn,message){try{update(fn(),message);}catch(e){render();notice(e.message,true);}}
  function show(page){
    document.body.classList.toggle('loot-mode',page==='loot');$('huntPage').hidden=page==='loot';$('lootPage').hidden=page!=='loot';
    $('goHunt').classList.toggle('primary',page==='hunt');$('goLoot').classList.toggle('primary',page==='loot');
    try{localStorage.setItem('kdm-page',page);}catch(_){}
    if(page==='loot'){if(data)render();else notice(loadError||'正在载入战利品牌库…',!!loadError);}
  }
  function selectors(){
    const query=$('lootSearch').value.trim().toLowerCase();
    const bosses=data.bosses.filter(b=>(selectedGroup==='全部'||b.group===selectedGroup)&&(!query||(bossName(b)+' '+b.aliases.join(' ')).toLowerCase().includes(query)));
    if(!bosses.some(b=>b.id===selectedBoss))selectedBoss=bosses[0]?.id||'';
    $('lootBoss').innerHTML=bosses.map(b=>`<option value="${esc(b.id)}">${esc(bossName(b))}</option>`).join('');$('lootBoss').value=selectedBoss;
    const boss=data.bosses.find(b=>b.id===selectedBoss);
    if(!boss?.levels.some(l=>l.id===selectedLevel))selectedLevel=boss?.levels[0]?.id||'';
    $('lootLevel').innerHTML=(boss?.levels||[]).map(l=>`<option value="${esc(l.id)}">${esc(levelName(l))}</option>`).join('');$('lootLevel').value=selectedLevel;
    $('lootNew').disabled=!boss;
    const l=boss?.levels.find(l=>l.id===selectedLevel);
    $('lootSelectionHint').textContent=l?`待开始：${bossName(boss)} · ${levelName(l)}。点击“开始新战斗”后载入独立牌库，已有战斗记录会保留。`:'没有匹配的 Boss。';
  }
  function imageMarkup(cid,large=false){
    const c=data.cards[cid],sh=data.sheets[c.sheet];
    if(!sh?.file)return `<div class="loot-face loot-missing">${esc(c.name)}<br>卡图缺失</div>`;
    const x=sh.w>1?c.col*100/(sh.w-1):0,y=sh.h>1?c.row*100/(sh.h-1):0;
    const ratio=sh.aspect || .714;
    return `<div class="loot-face${large?' loot-face-large':''}" role="img" aria-label="${esc(c.name)}" style="aspect-ratio:${ratio};background-image:url('${esc(sh.file)}');background-size:${sh.w*100}% ${sh.h*100}%;background-position:${x}% ${y}%"></div>`;
  }
  function cardsMarkup(ids,discarded=false){return ids.map(cid=>{
    const c=data.cards[cid];return `<article class="loot-card"><button class="loot-card-image" data-loot-zoom="${esc(cid)}" aria-label="放大 ${esc(c.name)}">${imageMarkup(cid)}</button><div class="loot-card-caption"><b>${esc(c.name)}</b><small>${esc(data.decks[c.deck].name)}</small>${discarded?'<span class="loot-discard-label">已弃置 · 本场不可再抽</span>':`<button data-loot-discard="${esc(cid)}">弃置</button>`}</div></article>`;
  }).join('');}
  function stepsText(steps){return (steps||[]).map(s=>s.op==='draw'?`${typeof s.count==='object'?'指定数量':s.count} 张${s.deck==='basic'?'基础资源':s.deck==='monster'?'怪物资源':data.decks[s.deck]?.name||s.deck}`:s.op==='take'?`${typeof s.count==='object'?'指定数量':s.count||1} 张 ${s.name}`:s.op==='roll'?`掷 d${s.sides||10}${s.bonus==='level'?' + Boss 等级':''} 查奖励表`:s.op==='if'?`按所选条件结算`:s.op==='note'?s.text:'').join('；');}
  function choiceOptions(input,s){
    const {boss}=E.context(data,s),ids=input.deck==='strange'?Object.values(data.decks).filter(d=>d.kind==='strange').map(d=>d.id):[input.deck==='monster'?boss.resourceDeck:input.deck];
    return ids.flatMap(id=>E.available(data,s,id)).map(cid=>`<option value="${esc(cid)}">${esc(data.cards[cid].name)} · ${esc(data.decks[data.cards[cid].deck].name)}</option>`).join('');
  }
  function renderInputs(rule,s){
    $('lootConditions').innerHTML=(rule.inputs||[]).map(i=>i.type==='boolean'?`<label class="loot-input">${esc(i.label)}<select data-loot-input="${esc(i.key)}"><option value="">请选择</option><option value="yes">是</option><option value="no">否</option></select></label>`:i.type==='card'?`<label class="loot-input">${esc(i.label)}<select data-loot-input="${esc(i.key)}"><option value="">请选择</option>${choiceOptions(i,s)}</select></label>`:i.type==='deck'?`<label class="loot-input">${esc(i.label)}<select data-loot-input="${esc(i.key)}"><option value="">请选择</option>${Object.values(data.decks).filter(d=>d.kind==='monster').map(d=>`<option value="${esc(d.id)}">${esc(d.name)} · ${esc(d.source.path)}</option>`).join('')}</select></label>`:`<label class="loot-input">${esc(i.label)}<input data-loot-input="${esc(i.key)}" type="number" min="${i.min??0}" max="${i.max??99}" step="1" placeholder="请输入"></label>`).join('');
    $('lootConditions').querySelectorAll('input,select').forEach(n=>{n.disabled=!!(s.pending||s.claimed);const value=(s.pending?.inputs||s.rewardInputs||s.draftInputs||{})[n.dataset.lootInput];if(value!==undefined)n.value=typeof value==='boolean'?(value?'yes':'no'):value;});
  }
  function renderDeck(){
    const s=current();if(!s)return;
    const {boss}=E.context(data,s),defaults=boss.defaultDecks;
    const list=[...new Set([...defaults,...Object.keys(s.piles),...Object.keys(data.decks)])].filter(id=>data.decks[id]);
    if(!list.includes(selectedDeck))selectedDeck=boss.resourceDeck||boss.basicDeck||list[0];
    $('lootDeck').innerHTML=list.map(id=>`<option value="${esc(id)}">${defaults.includes(id)?'★ ':''}${esc(data.decks[id].name)} · ${E.available(data,s,id).length} 张 · ${esc(data.decks[id].source.path.split('/')[0])}</option>`).join('');$('lootDeck').value=selectedDeck;
    const remaining=E.available(data,s,selectedDeck),query=$('lootCardSearch').value.trim().toLowerCase();
    const byName=new Map();for(const cid of remaining){const name=data.cards[cid].name;if(!byName.has(name))byName.set(name,[]);byName.get(name).push(cid);}
    $('lootCard').innerHTML=[...byName].filter(([name])=>!query||name.toLowerCase().includes(query)).map(([name,ids])=>`<option value="${esc(ids[0])}">${esc(name)} × ${ids.length}</option>`).join('');
    $('lootTake').disabled=!$('lootCard').value;$('lootDraw').disabled=!remaining.length;
    $('lootRemaining').textContent=`当前牌库剩余 ${remaining.length} / ${data.decks[selectedDeck].cards.length} 张。补抽和指定拿牌都消耗本场牌库。`;
  }
  function render(){
    if(!data)return;
    $('lootQuality').value=localStorage.getItem('kdm-rulebook-version')==='hd'?'hd':'standard';
    selectors();
    const sessions=Object.values(store.sessions).sort((a,b)=>b.createdAt-a.createdAt);
    $('lootSessions').innerHTML='<option value="">选择已有战斗记录</option>'+sessions.map(s=>{const {boss,level}=E.context(data,s);return `<option value="${esc(s.id)}">${s.source==='hunt'?'狩猎':'手动'} · ${esc(bossName(boss))} ${esc(levelName(level))} · ${new Date(s.createdAt).toLocaleString()} · 持有 ${s.held.length} 张</option>`;}).join('');$('lootSessions').value=store.active||'';
    const s=current();$('lootBattle').hidden=!s;$('lootEmpty').hidden=!!s;$('lootExport').disabled=!sessions.length;
    if(!s){
      const b=data.bosses.find(x=>x.id===selectedBoss),l=b?.levels.find(x=>x.id===selectedLevel);
      const hd=localStorage.getItem('kdm-rulebook-version')==='hd';
      const allRules=(hd&&l?.rule?.hdFiles)||l?.rule?.files||[l?.rule?.file].filter(Boolean);
      const isCrocPrologue=b?.id==='crimson-crocodile'&&l?.id==='prologue-crimson-crocodile';
      const sideFile=isCrocPrologue&&allRules.length>1?allRules[1]:allRules[0];
      const files=[sideFile].filter(Boolean);
      const d=$('lootRules')?.closest('details'); if(d)d.open=true;
      if($('lootRules'))$('lootRules').innerHTML=files.map(f=>`<button class="loot-rule-preview" data-loot-rule="${esc(f)}"><img src="${esc(f)}" alt="奖励规则" onload="this.classList.toggle('wide-img',this.naturalWidth/this.naturalHeight>1.8)"></button>`).join('');
      const preview=$('lootPreStartRules');
      if(preview){
        preview.hidden=!files.length;
        const grid=preview.querySelector('.loot-rule-grid');
        if(grid)grid.innerHTML=files.map((f,i)=>`<button class="loot-rule-preview" data-loot-rule="${esc(f)}"><img loading="lazy" src="${esc(f)}" alt="${esc(l?.rule?.title||'奖励规则')} · 规则页 ${i+1}" onload="this.classList.toggle('wide-img',this.naturalWidth/this.naturalHeight>1.8)"><span>点击放大规则原图</span></button>`).join('');
      }
      return;
    }
    const preview=$('lootPreStartRules');if(preview)preview.hidden=true;
    const {boss,level}=E.context(data,s),r=level.reward;
    $('lootTitle').textContent=bossName(boss)+' · '+levelName(level);
    $('lootSource').textContent=s.source==='hunt'?'来自狩猎 · 战斗结果由你判断':'手动战斗';
    $('lootRewardDescription').textContent=r.description||r.note||stepsText(r.steps);
    $('lootClaim').disabled=s.claimed||r.type==='manual';$('lootClaim').textContent=s.claimed?'战后奖励已领取':s.pending?'继续领取已生成的奖励':'抽取战后奖励';
    $('lootUndo').disabled=!s.history.length;$('lootUndo').textContent=s.history.length?'撤销：'+s.history.at(-1).label:'撤销上次操作';
    renderInputs(r,s);
    const rolls=[...s.rolls,...(s.pending?.rolls||[])];
    $('lootRolls').innerHTML=rolls.map(x=>`<span class="loot-roll">${esc(x.label)}：d${x.sides} = <b>${x.raw}</b>${x.bonus?` + ${x.bonus} = <b>${x.total}</b>`:''}</span>`).join('');
    $('lootNotes').textContent=[...s.notes,...(s.pending?.notes||[])].join('\n');
    const hd=localStorage.getItem('kdm-rulebook-version')==='hd';$('lootQuality').value=hd?'hd':'standard';
    const rules=(hd&&level.rule?.hdFiles)||level.rule?.files||[level.rule?.file].filter(Boolean);
    const isCrocPrologue=boss.id==='crimson-crocodile'&&level.id==='prologue-crimson-crocodile';
    const sideRule=isCrocPrologue&&rules.length>1?[rules[1]]:rules.length?[rules[0]]:[level.rule?.file].filter(Boolean);
    $('lootRuleSource').textContent='自动奖励：TTS 模组规则。清晰度只影响规则图片。'+(hd&&level.rule?.hdDifference?'\n版本差异：'+level.rule.hdDifference:'');
    const rulesDetails=$('lootRules')?.closest('details');if(rulesDetails)rulesDetails.open=true;
    $('lootRules').innerHTML=sideRule.map((file,i)=>`<button class="loot-rule-preview" data-loot-rule="${esc(file)}"><img loading="lazy" src="${esc(file)}" alt="${esc(level.rule?.title||'奖励规则')}" onload="this.classList.toggle('wide-img',this.naturalWidth/this.naturalHeight>1.8)"><span>点击放大查看完整规则</span></button>`).join('')||'<p class="muted">模组未提供此条目的可用规则页，请按实体规则结算。</p>';
    $('lootHeldCount').textContent=s.held.length;$('lootDiscardedCount').textContent=s.discarded.length;
    const monsterCards=s.held.filter(cid=>{const deck=data.decks[data.cards[cid].deck];return deck.kind==='monster'||deck.kind==='strange';});
    const basicCards=s.held.filter(cid=>{const deck=data.decks[data.cards[cid].deck];return deck.kind!=='monster'&&deck.kind!=='strange';});
    $('lootHeldMonsterCount').textContent=monsterCards.length;
    $('lootHeldBasicCount').textContent=basicCards.length;
    $('lootHeldMonster').innerHTML=cardsMarkup(monsterCards)||'<p class="muted">尚未获得怪物资源。</p>';
    $('lootHeldBasic').innerHTML=cardsMarkup(basicCards)||'<p class="muted">尚未获得通用资源。</p>';
    if(!s.held.length){$('lootHeldMonster').innerHTML='<div class="loot-empty">尚未获得卡牌。获胜后领取奖励，也可以在下方补抽或指定拿牌。</div>';$('lootHeldBasic').innerHTML='';}
    $('lootDiscarded').innerHTML=cardsMarkup(s.discarded,true)||'<p class="muted">本场还没有弃牌。</p>';
    renderDeck();
  }
  function startManual(){
    if(!selectedBoss)return;
    const s=E.create(data,selectedBoss,selectedLevel,uid());selectedDeck='';update(s,'已开始新战斗，牌库已准备好。');
  }
  function claim(){
    const s=current();if(!s)return;
    try{
      const {level}=E.context(data,s),inputs={};
      for(const input of level.reward.inputs||[]){const el=$('lootConditions').querySelector(`[data-loot-input="${input.key}"]`);if(!el.value&&!s.pending)throw new Error('请先填写：'+input.label);inputs[input.key]=input.type==='boolean'?el.value==='yes':['deck','card'].includes(input.type)?el.value:Number(el.value);}
      // Persist dice before trying to deal, so insufficient cards and reloads
      // cannot silently reroll an already generated reward.
      const prepared=E.prepare(data,s,inputs);store.sessions[s.id]=prepared;if(!save())return;
      const claimed=E.claim(data,prepared);update(claimed,'战后奖励已领取。卡牌可放大查看或弃置。');
    }catch(e){render();notice(e.message,true);}
  }
  function modal(content,title){$('lootModalTitle').textContent=title;$('lootModalContent').innerHTML=content;$('lootModal').showModal();}
  function exportAll(){
    const url=URL.createObjectURL(new Blob([JSON.stringify(store,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='kdm-loot-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  async function encounter(hunt){
    await ready;if(!data){show('loot');return;}
    const {boss,level}=E.huntSelection(data,hunt)||{};
    if(!boss||!level){show('loot');notice('未找到这次狩猎对应的战利品等级，请手动选择；没有替换为其他等级。',true);return;}
    if(!hunt.battleId)hunt.battleId=uid();
    const id=hunt.battleId;
    if(!store.sessions[id]){
      if(hunt.lootBattle?.id===id){try{E.validate(data,hunt.lootBattle);store.sessions[id]=hunt.lootBattle;}catch(_){notice('关联战利品存档损坏，已保留原存档，请导出检查。',true);return;}}
      else store.sessions[id]=E.create(data,boss.id,level.id,id,'hunt');
    }
    store.active=id;selectedBoss=boss.id;selectedLevel=level.id;selectedGroup='全部';$('lootGroup').value='全部';$('lootSearch').value='';selectedDeck='';
    try{localStorage.setItem('kdm-current',JSON.stringify(hunt));}catch(_){}
    show('loot');if(save())notice('已按狩猎预选 Boss 和等级。战斗中可补抽，获胜后再领取战后奖励。');
  }
  async function init(){
    try{
      const response=await fetch('data/loot.json');if(!response.ok)throw new Error('牌库文件载入失败');data=await response.json();
      const raw=localStorage.getItem(key);
      if(raw){
        const saved=JSON.parse(raw);if(saved.schemaVersion!==1||!saved.sessions)throw new Error('战利品存档格式无法识别');
        const validSessions={};let skipped=0; for(const s of Object.values(saved.sessions)){try{E.validate(data,s);validSessions[s.id]=s;}catch(_){skipped++;}} saved.sessions=validSessions; if(saved.active&&!validSessions[saved.active])saved.active=null; store=saved; if(skipped)loadError='已跳过 '+skipped+' 场使用旧版牌库的战斗记录；可重新开始战斗。';
      }
      $('lootGroup').innerHTML=['全部','基础','赌博','12扩','其他官方扩','粉丝扩'].map(g=>`<option>${g}</option>`).join('');
      selectedBoss=current()?.bossId||'white-lion';selectedLevel=current()?.levelId||'level-1';
      render();
      notice(loadError||'牌库已准备好。选择 Boss 和等级开始，或恢复已有战斗。');
      if(localStorage.getItem('kdm-page')==='loot')show('loot');
    }catch(e){loadError='战利品载入失败：'+e.message+'。原存档未修改。';data=null;notice(loadError,true);$('lootNew').disabled=true;}
  }
  $('goLoot').onclick=()=>show('loot');$('goHunt').onclick=()=>show('hunt');$('lootNew').onclick=startManual;
  $('lootGroup').onchange=e=>{selectedGroup=e.target.value;render();};$('lootSearch').oninput=render;
  $('lootBoss').onchange=e=>{selectedBoss=e.target.value;selectedLevel='';render();};$('lootLevel').onchange=e=>{selectedLevel=e.target.value;render();};
  $('lootSessions').onchange=e=>{if(!e.target.value)return;store.active=e.target.value;const s=current();selectedBoss=s.bossId;selectedLevel=s.levelId;selectedGroup='全部';$('lootGroup').value='全部';$('lootSearch').value='';selectedDeck='';render();save();notice('已恢复这场战斗。');};
  $('lootClaim').onclick=claim;$('lootUndo').onclick=()=>run(()=>E.undo(current()),'已撤销上次操作。');
  $('lootDeck').onchange=e=>{selectedDeck=e.target.value;renderDeck();};$('lootCardSearch').oninput=renderDeck;
  $('lootDraw').onclick=()=>run(()=>E.draw(data,current(),selectedDeck,Number($('lootCount').value)),'已补抽卡牌。');
  $('lootTake').onclick=()=>run(()=>E.take(data,current(),$('lootCard').value),'已获得指定卡牌。');$('lootExport').onclick=exportAll;
  $('lootPage').addEventListener('click',e=>{
    const discard=e.target.closest('[data-loot-discard]'),zoom=e.target.closest('[data-loot-zoom]'),rule=e.target.closest('[data-loot-rule]');
    if(discard)run(()=>E.discard(data,current(),discard.dataset.lootDiscard),'已弃置。本场不会再抽到这张卡，可撤销误操作。');
    if(zoom)modal(imageMarkup(zoom.dataset.lootZoom,true),data.cards[zoom.dataset.lootZoom].name);
    if(rule)modal(`<img class="loot-rule-full" src="${esc(rule.dataset.lootRule)}" alt="奖励规则原图">`,'奖励规则原图');
  });
  $('lootConditions').addEventListener('change',e=>{
    const s=current(),key=e.target.dataset.lootInput;if(!s||!key||s.claimed||s.pending)return;
    const input=E.context(data,s).level.reward.inputs.find(i=>i.key===key);s.draftInputs||={};
    if(e.target.value==='')delete s.draftInputs[key];else s.draftInputs[key]=input.type==='boolean'?e.target.value==='yes':input.type==='number'?Number(e.target.value):e.target.value;
    save();
  });
  $('lootModalClose').onclick=()=>$('lootModal').close();$('lootModal').addEventListener('click',e=>{if(e.target===$('lootModal'))$('lootModal').close();});
  $('lootQuality').onchange=e=>{const control=$('rulebookVersion');control.value=e.target.value;control.onchange({target:control});};
  $('lootSidebarToggle').onclick=()=>{const app=document.querySelector('.app'),collapsed=app.classList.toggle('sidebar-collapsed'),btn=$('lootSidebarToggle');btn.setAttribute('aria-expanded',String(!collapsed));btn.textContent=collapsed?'展开侧栏':'收起侧栏';};
  window.KDMLoot={encounter,show,refresh:render,snapshot(hunt){const s=store.sessions[hunt?.battleId];return s?JSON.parse(JSON.stringify(s)):null;},restore(hunt){if(hunt?.encountered){const page=localStorage.getItem('kdm-page')||'hunt';encounter(hunt).then(()=>show(page));}}};
  ready=init();
})();


