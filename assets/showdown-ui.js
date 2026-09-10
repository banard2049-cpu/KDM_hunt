(function(){
 'use strict';const $=id=>document.getElementById(id),E=window.ShowdownEngine,V=window.ShowdownView,key='kdm-showdown-v1';let data,share=null,blocked=false,store={schemaVersion:1,active:null,sessions:{}},publishing=Promise.resolve(),poolSel=new Set();
 // The board opens at 170% of its resting size and the cards at 150%; the readouts,
 // the snapshot base and 「重置大小」 all follow the engine's two numbers.
 const pct=v=>Math.round(v*100)+'%',num=(v,fallback)=>{const n=Number(v);return Number.isFinite(n)&&n>0?Math.max(.5,Math.min(2,n)):fallback;},DEFAULT_BOARD=num(E?.defaultBoardScale,1.7),DEFAULT_CARD=num(E?.defaultCardScale,1.5);
 // 「对齐方式」 is the third view switch beside 交换 and 旋转: one button that cycles
 // 居中 → 靠上 → 靠下 and lines the board and the card column up together on the
 // second screen. Remembered like the others, and it rests on 靠下.
 const ALIGN_MODES=['center','top','bottom'],ALIGN_LABELS={center:'居中',top:'靠上',bottom:'靠下'},ALIGN_DEFAULT='bottom',ALIGN_NOTICES={center:'一起垂直居中',top:'一起贴向顶部',bottom:'一起贴向底部，卡牌仍然从下往上排'};
 const align=()=>ALIGN_MODES.includes(store.align)?store.align:ALIGN_DEFAULT;
 const alignLabel=mode=>ALIGN_LABELS[mode||align()];
 const nextAlign=()=>ALIGN_MODES[(ALIGN_MODES.indexOf(align())+1)%ALIGN_MODES.length];
 // 「显示决战版图」 / 「显示Boss规则书」 is the fourth view switch in the same row, and the
 // widest one: it trades the board panel between the showdown map (the default) and
 // the level's own rulebook pages. Remembered like 交换／旋转／对齐.
 const showRulebook=()=>store.showRulebook===true;
 // The four view switches are drawn as icons and sit in one row, which is what fits the
 // narrow second-screen column: each drawing carries its own state (the rulebook switch
 // shows the map or the open book, 对齐方式 shows where the content bar sits, 旋转 turns
 // its own arrow), and the words move to title/aria-label so nothing is lost.
 const ICON=(()=>{
  const svg=body=>`<svg class="sd-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
  // 居中／靠上／靠下: the same panel with its content bar moved, so the icon reads as
  // the alignment it is at rather than as an abstract symbol.
  const alignBar=y=>svg(`<rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/><rect x="7" y="${y}" width="10" height="3.5" rx="1.5" fill="currentColor" stroke="none"/>`);
  return {
   board:svg('<rect x="2.5" y="4.5" width="19" height="15" rx="2"/><path d="M9 4.5v15M15 4.5v15M2.5 12h19"/>'),
   rulebook:svg('<path d="M12 6.6C10.4 5.2 8.4 4.5 6 4.4H3.5v13.2H6c2.4.1 4.4.8 6 2.1 1.6-1.3 3.6-2 6-2.1h2.5V4.4H18c-2.4.1-4.4.8-6 2.2z"/><path d="M12 6.6v13.1"/>'),
   swap:svg('<path d="M4 8.5h14M14.5 5 18 8.5 14.5 12"/><path d="M20 15.5H6M9.5 12 6 15.5 9.5 19"/>'),
   rotate:svg('<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4.5V9h-4.5"/>'),
   align:{center:alignBar(10.25),top:alignBar(6),bottom:alignBar(14.5)},
  };
 })();
 // Two hosts: the second-screen controls close out the left sidebar, the terrain
 // deck controls live inside the battle module at the top of the right column.
 const page=document.createElement('section');page.id='showdownControls';page.className='sd-host-controls';page.innerHTML=`<h3>第二屏幕控制</h3><p id="sdBattleLabel">开始战斗后，可在这里控制第二屏幕。</p><div class="sd-controls"><button id="sdStop" hidden>停止第二屏幕</button><fieldset><legend>版图大小</legend><button data-sd-size="boardScale" data-delta="-0.1" aria-label="缩小副屏版图">−</button><output id="sdBoardSize">${pct(DEFAULT_BOARD)}</output><button data-sd-size="boardScale" data-delta="0.1" aria-label="放大副屏版图">＋</button></fieldset><fieldset><legend>卡牌大小</legend><button data-sd-size="cardScale" data-delta="-0.1" aria-label="缩小副屏卡牌">−</button><output id="sdCardSize">${pct(DEFAULT_CARD)}</output><button data-sd-size="cardScale" data-delta="0.1" aria-label="放大副屏卡牌">＋</button></fieldset><button data-sd-size="reset">重置大小</button><div class="sd-view-switches" role="group" aria-label="第二屏幕显示方式"><button id="sdRulebook" type="button" aria-pressed="false" data-icon="board" title="显示决战版图 · 点按换成 Boss 规则书" aria-label="第二屏幕当前显示决战版图，点按切换到Boss 规则书">${ICON.board}</button><button id="sdSwap" type="button" aria-pressed="false" data-icon="swap" title="交换版图与卡牌" aria-label="交换版图与卡牌：把卡牌展示区换到左列">${ICON.swap}</button><button id="sdRotate" type="button" data-angle="0" data-icon="rotate" title="旋转卡牌区" aria-label="旋转卡牌区：把卡牌逆时针转 90°">${ICON.rotate}</button><button id="sdAlign" type="button" data-align="${ALIGN_DEFAULT}" data-icon="align-${ALIGN_DEFAULT}" title="对齐方式 · ${alignLabel()}" aria-label="对齐方式：当前${alignLabel()}，点按切换到${alignLabel(nextAlign())}">${ICON.align[ALIGN_DEFAULT]}</button></div></div>`;
 $('lootSidebar').append(page);
 const terrain=document.createElement('section');terrain.id='sdTerrainPanel';terrain.className='sd-host-controls sd-terrain-panel';terrain.innerHTML=`<h3>随机地形</h3><div class="sd-controls"><button id="sdStartToggle" type="button" aria-pressed="true">显示初始位置</button><button id="sdTerrain">选择地形</button><button id="sdReroll">重抽地形</button><span id="sdFanHint" class="sd-fan-hint"></span></div><div id="sdTerrainEditor" hidden><p>固定与指定地形按规则保留；选择要替换的随机地形。</p><div id="sdTerrainSlots" class="sd-controls"></div><button id="sdApplyTerrain">应用地形</button><button id="sdCancelTerrain">取消</button></div><details id="sdPoolEditor"><summary>随机地形池 · 已选 <b id="sdPoolCount">0</b> 张<span id="sdExpSummary" class="muted"></span></summary><div class="sd-pool-bar"><input id="sdPoolSearch" placeholder="搜索地形名（英文）"><button id="sdPoolCore" type="button">只留基础</button><button id="sdPoolAll" type="button">全选</button><button id="sdPoolNone" type="button">全不选</button></div><p id="sdPoolHint" class="sd-pool-hint"></p><div id="sdPoolGroups"></div></details><div id="sdNotice" class="sd-warning" role="status"></div>`;
 // Inside the reward module; the column itself is the fallback if that module
 // ever moves or is renamed.
 (document.querySelector('#lootBattle .panel.loot-reward')||$('lootPage')).append(terrain);
 const notice=m=>$('sdNotice').textContent=m,current=()=>store.sessions[store.active];
 // Starting positions (blue legal start squares, the monster's footprint and the
 // terrain the setup rules pin down) are shown by default; the button in the
 // terrain row turns the highlight off. Fan packs are the opposite: opt-in. Both
 // preferences are remembered across battles.
 const showFan=()=>store.showFan===true;
 const showStart=()=>store.showStart!==false;
 // 交换 keeps the board and the card column apart or trades their places; 旋转
 // turns the card panel a quarter turn at a time (0/90/180/270, counter-clockwise)
 // for a screen lying on its side. Both are view settings: remembered, and carried
 // to the second screen in the snapshot like the two scale factors.
 const swapped=()=>store.swapped===true;
 const cardRotation=()=>{const n=Number(store.cardRotation)||0;return ((Math.round(n/90)*90)%360+360)%360;};
 // Both displays travel in the snapshot, and the second screen only redraws when
 // the revision changes — so flipping one bumps the battle it belongs to.
 function setDisplay(patch){
  if(data&&store.active&&store.sessions[store.active]){const s=store.sessions[store.active];s.display={boardScale:DEFAULT_BOARD,cardScale:DEFAULT_CARD,...s.display,...patch};s.revision=(s.revision||0)+1;}
  save();render();publish();
 }
 function setShowStart(on){store.showStart=on===true;setDisplay({showStart:showStart()});}
 function setSwapped(on){store.swapped=on===true;setDisplay({swapped:swapped()});}
 function setCardRotation(next){store.cardRotation=next;setDisplay({cardRotation:cardRotation()});}
 function setAlign(next){store.align=ALIGN_MODES.includes(next)?next:ALIGN_DEFAULT;setDisplay({align:align()});}
 function setShowRulebook(on){store.showRulebook=on===true;setDisplay({showRulebook:showRulebook()});}
 // ---- card thumbnails: crop one cell out of its TTS spritesheet, exactly the
 // way the second screen does it. Cell aspect needs the sheet's pixel size.
 const sheetSizes=new Map();
 const sheetSize=file=>{if(!sheetSizes.has(file))sheetSizes.set(file,new Promise(resolve=>{const img=new Image();img.onload=()=>resolve({w:img.naturalWidth,h:img.naturalHeight,url:img.src});img.onerror=()=>resolve(null);img.src=file;}));return sheetSizes.get(file);};
 async function paintThumbs(root){
  const files=[...new Set([...root.querySelectorAll('[data-sheet]')].map(n=>n.dataset.sheet))];
  await Promise.all(files.map(sheetSize));
  for(const el of root.querySelectorAll('[data-sheet]')){
    const size=await sheetSize(el.dataset.sheet);if(!size)continue;
    const w=+el.dataset.w||1,h=+el.dataset.h||1,col=+el.dataset.col||0,row=+el.dataset.row||0;
    el.style.aspectRatio=`${size.w/w} / ${size.h/h}`;
    el.style.backgroundImage=`url('${size.url}')`;
    el.style.backgroundSize=`${w*100}% ${h*100}%`;
    el.style.backgroundPosition=`${w>1?col*100/(w-1):0}% ${h>1?row*100/(h-1):0}%`;
  }
 }
 const rankOf=e=>e.id==='Core'?0:(e.fan?2:1);
 const groupOrder=source=>[...source.expansions].sort((a,b)=>rankOf(a)-rankOf(b));
 function requiredNames(){const s=current();if(!s)return new Set();return new Set(E.requiredCounts(E.context(data,s).level).keys());}
 // ---- the pool editor ------------------------------------------------------
 function syncCount(){
  $('sdPoolCount').textContent=String(poolSel.size);
  $('sdExpSummary').textContent=showFan()?'':' · 粉丝扩已折叠';
  $('sdPoolHint').textContent=poolSel.size?`重抽时从这 ${poolSel.size} 张里抽；本等级固定／指定地形会自动保留。${showFan()?'':'粉丝扩默认折叠，勾选左侧栏「显示粉丝扩地形」才会出现在下面。'}`:'牌池是空的，勾几张再重抽。';
 }
 function groupMarkup(e){
  const need=requiredNames(),q=$('sdPoolSearch').value.trim().toLowerCase();
  const cards=e.cards.filter(c=>!q||c.name.toLowerCase().includes(q));
  if(!cards.length)return '';
  const rows=cards.map(c=>{
    const card=c.card||{},checked=poolSel.has(c.id);
    return `<label class="sd-pool-card${checked?' on':''}"><input type="checkbox" data-pool-card="${V.esc(c.id)}" ${checked?'checked':''}><span class="sd-pool-thumb" data-sheet="${V.esc(card.file||'')}" data-w="${card.w||1}" data-h="${card.h||1}" data-col="${card.col||0}" data-row="${card.row||0}"></span><small>${V.esc(c.name)}</small>${need.has(c.name)?'<em class="req">本关需要</em>':''}</label>`;
  }).join('');
  const picked=cards.filter(c=>poolSel.has(c.id)).length;
  return `<div class="sd-pool-group${e.fan?' fan':''}" data-exp="${V.esc(e.id)}"><header><label><input type="checkbox" data-pool-group="${V.esc(e.id)}" ${picked===cards.length?'checked':''}><b>${V.esc(e.name)}</b></label><span class="tag">${e.fan?'粉丝扩':e.group?'官方·'+V.esc(e.group)+'波':'官方'}</span><span class="cnt">已选 ${picked}/${cards.length}</span></header><div class="sd-pool-grid">${rows}</div></div>`;
 }
 function poolUI(s){
  if(!data)return;
  // The fan terrain checkbox lives in the loot sidebar's optional-switch list.
  if($('sdFanToggle'))$('sdFanToggle').checked=showFan();
  if(!s){
   $('sdPoolGroups').innerHTML='<p class="muted">还没有战斗。开始一场战斗后，这里会列出所有地形卡，可以逐张勾选。</p>';
   $('sdPoolCount').textContent='0';$('sdExpSummary').textContent='';$('sdPoolHint').textContent='';
   $('sdFanHint').textContent='开始战斗后可以逐张挑选随机地形。';
   return;
  }
  // Keep the battle's own snapshot flags in step with the persisted preferences.
  if(s.display?.showStart!==showStart()||s.display?.swapped!==swapped()||(Number(s.display?.cardRotation)||0)!==cardRotation()||s.display?.align!==align()||s.display?.showRulebook!==showRulebook()){s.display={boardScale:DEFAULT_BOARD,cardScale:DEFAULT_CARD,...s.display,showStart:showStart(),swapped:swapped(),cardRotation:cardRotation(),align:align(),showRulebook:showRulebook()};s.revision=(s.revision||0)+1;publish();}
  poolSel=new Set(s.pool||E.poolIds(data,s));
  const list=E.visibleExpansions(data,s,showFan());
  $('sdPoolGroups').innerHTML=list.length?groupOrder(data).filter(e=>list.some(v=>v.id===e.id)).map(e=>groupMarkup(e)).join('')||'<p class="muted">没有匹配的地形卡。</p>':'<p class="muted">没有可用的地形卡。</p>';
  paintThumbs($('sdPoolGroups'));
  syncCount();
  const need=requiredNames(),forced=[...need].filter(n=>list.some(e=>e.cards.some(c=>c.name===n)&&e.fan));
  $('sdFanHint').textContent=showFan()?`粉丝扩已展开，勾选单张卡即可加入随机地形池。${forced.length?`本关规则需要：${forced.join('、')}。`:''}`:`粉丝扩默认折叠；不需要时也不会进入牌池。勾选左侧栏「显示粉丝扩地形」可逐张加入。${forced.length?`本关规则需要 ${forced.length} 张粉丝扩地形，已自动保留。`:''}`;
 }
 function commitPool(silent){
  const s=current();if(!s||!data)return;
  s.pool=[...poolSel];s.expansions=E.groupsOf(data,s.pool);
  save();syncCount();publish();
  page.querySelectorAll('[data-pool-group]').forEach(g=>{const cards=[...g.closest('.sd-pool-group').querySelectorAll('input[data-pool-card]')];g.checked=cards.length>0&&cards.every(c=>c.checked);});
  if(!silent)notice(`随机地形池已更新为 ${s.pool.length} 张（点「重抽地形」生效）。`);
 }
 function save(){try{localStorage.setItem(key,JSON.stringify(store));return true;}catch(e){notice('保存失败，请释放设备存储空间后重试，当前结果仍保留在内存中。');return false;}}
 function render(){const s=current();for(const root of [page,terrain])root.querySelectorAll('button').forEach(b=>{b.disabled=!s||blocked});$('sdStop').hidden=!share;$('sdOpenTop').disabled=blocked||(!s&&!share);$('sdStop').disabled=blocked;$('sdTerrainEditor').hidden=true;
  // The start-position button stays usable before a battle too (the loot page
  // shows the same module), so it only follows the data/second-screen state.
  const startButton=$('sdStartToggle');
  startButton.disabled=blocked||!data;
  startButton.textContent=showStart()?'隐藏初始位置':'显示初始位置';
  startButton.setAttribute('aria-pressed',String(showStart()));
  // The four view switches are icon buttons in one row, so each one draws the state it
  // is at and carries its words in title／aria-label: 显示决战版图 shows the map or the
  // open rulebook, 交换 shows the trade, 旋转 turns its own arrow with the cards, and
  // 对齐方式 moves the content bar inside its panel.
  const swapButton=$('sdSwap');
  swapButton.disabled=blocked||!data;
  swapButton.innerHTML=ICON.swap;
  swapButton.setAttribute('data-icon','swap');
  swapButton.setAttribute('title',swapped()?'恢复版图位置':'交换版图与卡牌');
  swapButton.setAttribute('aria-pressed',String(swapped()));
  swapButton.setAttribute('aria-label',swapped()?'已交换：卡牌展示区在左，决战版图在右。点按恢复原来位置':'交换版图与卡牌：把卡牌展示区换到左列');
  const rotateButton=$('sdRotate');
  rotateButton.disabled=blocked||!data;
  rotateButton.innerHTML=ICON.rotate;
  rotateButton.setAttribute('data-icon','rotate');
  rotateButton.setAttribute('data-angle',String(cardRotation()));
  rotateButton.setAttribute('title',cardRotation()?`旋转卡牌区 · 已逆时针旋转 ${cardRotation()}°`:'旋转卡牌区');
  rotateButton.setAttribute('aria-label',cardRotation()?`旋转卡牌区：当前已逆时针旋转 ${cardRotation()}°，点按再转 90°`:'旋转卡牌区：把卡牌逆时针转 90°');
  // 对齐方式 cycles 居中 → 靠上 → 靠下, so its icon shows where the content bar sits
  // and its label names the one the next press switches to.
  const alignButton=$('sdAlign');
  alignButton.disabled=blocked||!data;
  alignButton.innerHTML=ICON.align[align()];
  alignButton.setAttribute('data-icon','align-'+align());
  alignButton.setAttribute('data-align',align());
  alignButton.setAttribute('title',`对齐方式 · ${alignLabel()}`);
  alignButton.setAttribute('aria-label',`对齐方式：当前${alignLabel()}，点按切换到${alignLabel(nextAlign())}`);
  // 显示决战版图／显示Boss规则书 draws the panel it is showing — the map or the
  // rulebook — until the host asks for the other one.
  const rulebookButton=$('sdRulebook');
  rulebookButton.disabled=blocked||!data;
  rulebookButton.innerHTML=ICON[showRulebook()?'rulebook':'board'];
  rulebookButton.setAttribute('data-icon',showRulebook()?'rulebook':'board');
  rulebookButton.setAttribute('title',showRulebook()?'显示Boss规则书 · 点按切回决战版图':'显示决战版图 · 点按换成 Boss 规则书');
  rulebookButton.setAttribute('aria-pressed',String(showRulebook()));
  rulebookButton.setAttribute('aria-label',`第二屏幕当前显示${showRulebook()?'Boss 规则书':'决战版图'}，点按切换到${showRulebook()?'决战版图':'Boss 规则书'}`);
  poolUI(s);
  if(!s){$('sdBattleLabel').textContent='开始战斗后，可在这里控制第二屏幕。';$('sdBoardSize').value=pct(DEFAULT_BOARD);$('sdCardSize').value=pct(DEFAULT_CARD);return;}
  const {boss,level}=E.context(data,s);$('sdBattleLabel').textContent=`${boss.displayName||boss.name} · ${level.name} · 随机地形 ${s.random.length} 张`;
  $('sdBoardSize').value=pct(Number(s.display?.boardScale)||DEFAULT_BOARD);$('sdCardSize').value=pct(Number(s.display?.cardScale)||DEFAULT_CARD);
 }
 const native=()=>window.Capacitor?.isNativePlatform?.()?window.Capacitor.registerPlugin('ShowdownHost'):null;
 async function command(action,payload={}){const n=native();if(n)return n[action](payload);const r=await fetch('/api/showdown/'+action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});if(!r.ok)throw Error(r.status===403?'请在电脑本机地址打开主控。':'无法连接电脑服务，请用 start.bat 启动项目。');return r.json();}
 function publish(){if(!share||!current())return;const snapshot=E.snapshot(data,current());publishing=publishing.then(()=>command('publish',{snapshot})).catch(e=>notice('副屏同步失败：'+e.message));}
 function update(s){E.validate(data,s);store.sessions[s.id]=s;store.active=s.id;save();render();publish();}

 $('sdReroll').onclick=()=>{try{update(E.draw(data,current()));notice('已按当前随机地形池重抽，并同步到第二屏幕。');}catch(e){notice(e.message);}};
 page.querySelectorAll('[data-sd-size]').forEach(b=>b.onclick=()=>update(E.resize(current(),b.dataset.sdSize,Number(b.dataset.delta)||0)));
 // 交换决战版图与卡牌展示区，以及把卡牌展示区转 90°（逆时针，循环 0／90／180／270）。
 $('sdSwap').onclick=()=>{setSwapped(!swapped());notice(swapped()?'已交换：卡牌展示区在左，决战版图在右。':'已恢复：决战版图在左，卡牌展示区在右。');};
 $('sdRotate').onclick=()=>{setCardRotation(cardRotation()+90);notice(cardRotation()?`卡牌展示区已逆时针旋转 ${cardRotation()}°（屏幕竖放时可正常阅读）。`:'卡牌展示区已恢复正向。');};
 // 居中／靠上／靠下: one press each, cycling down ALIGN_MODES, moving the board and
 // the card column together on the second screen.
 $('sdAlign').onclick=()=>{const next=nextAlign();setAlign(next);notice(`对齐方式已切换为「${alignLabel()}」：决战版图与卡牌区${ALIGN_NOTICES[next]}。`);};
 // 第二屏幕在「决战版图」和「Boss 规则书」之间来回切换：默认显示决战版图，按一下换成
 // 该等级的规则书原图（含规则书里印的章节页），再按一下回到版图。
 $('sdRulebook').onclick=()=>{setShowRulebook(!showRulebook());notice(showRulebook()?'第二屏幕已切换到 Boss 规则书：显示该等级的规则书原图。':'第二屏幕已切回决战版图。');};
  // Called by the checkbox in the loot sidebar (see KDMShowdown.terrain) with the
  // state it just switched to, or by a direct click on the box.
  function setFan(on){
   if(on===undefined)on=showFan();
   store.showFan=on;
   if(!showFan()&&data){ // drop fan cards the current level does not force onto the board
    const visible=new Set(E.visibleExpansions(data,current(),false).map(e=>e.id));
    for(const id of [...poolSel])if(!visible.has(E.ownerOf(data,id)))poolSel.delete(id);
   }
   commitPool(true);render();
   if(save())notice(showFan()?'粉丝扩已展开：可以单独勾选粉丝扩地形卡。':'粉丝扩已折叠：牌池里的粉丝扩地形已移除（本关规则需要的除外）。');
  }
  $('sdFanToggle').onchange=()=>setFan($('sdFanToggle').checked===true);
 // Toggles the whole initial-position highlight: the blue start squares, the
 // monster's starting footprint, and the terrain the setup rules place.
 $('sdStartToggle').onclick=()=>{setShowStart(!showStart());notice(showStart()?'已显示初始位置：蓝色起始格、怪物起始占地与固定地形高亮都会显示在第二屏幕。':'已隐藏初始位置：第二屏幕不再高亮起始格、怪物起始占地与固定地形。');};
 $('sdPoolSearch').oninput=()=>poolUI(current());
 $('sdPoolCore').onclick=()=>{poolSel=new Set(E.cardsOf(data,'Core').map(c=>c.id));commitPool();render();};
 $('sdPoolAll').onclick=()=>{for(const n of $('sdPoolGroups').querySelectorAll('input[data-pool-card]'))poolSel.add(n.value);commitPool();poolUI(current());};
 $('sdPoolNone').onclick=()=>{poolSel.clear();commitPool();poolUI(current());};
 $('sdPoolGroups').addEventListener('change',e=>{
  const card=e.target.closest('[data-pool-card]'),group=e.target.closest('[data-pool-group]');
  if(card){if(card.checked)poolSel.add(card.value);else poolSel.delete(card.value);card.closest('.sd-pool-card').classList.toggle('on',card.checked);commitPool();}
  else if(group){const box=group.closest('.sd-pool-group');for(const n of box.querySelectorAll('input[data-pool-card]')){if(group.checked)poolSel.add(n.value);else poolSel.delete(n.value);n.checked=group.checked;n.closest('.sd-pool-card').classList.toggle('on',group.checked);}commitPool();}
 });
 $('sdTerrain').onclick=()=>{const s=current(),taken=new Set((s.taken||[]).map(c=>c.id)),pool=E.poolCards(data,s).filter(c=>!taken.has(c.id));
  $('sdTerrainSlots').innerHTML=s.random.map((c,i)=>`<label>随机地形 ${i+1}<select data-sd-terrain>${pool.map((t,n)=>`<option value="${V.esc(t.id)}" ${t.id===c.id?'selected':''}>${V.esc(t.name)} · 实例 ${n+1}</option>`).join('')}</select></label>`).join('')||'此等级不需要随机地形。';$('sdTerrainEditor').hidden=false;
 };
 $('sdCancelTerrain').onclick=()=>$('sdTerrainEditor').hidden=true;
 $('sdApplyTerrain').onclick=()=>{try{update(E.choose(data,current(),[...terrain.querySelectorAll('[data-sd-terrain]')].map(n=>n.value)));notice('所选地形已保存并同步。');}catch(e){notice(e.message);}};
 // ---- second screen: the header button opens (and re-opens) a separate window.
 // Opening is the whole story: the first window is aimed at the fixed short link
 // itself, so the panel shows no address, no hint and no QR code to copy.
 let popup=null;
 const SECOND_NAME='kdm-second-screen';
 // On the host machine prefer the loopback address: same origin as the app, so
 // the window can be re-pointed later and no LAN round-trip is involved.
 function screenUrl(){
  if(!share)return '';
  // Fixed short link `:8799/d/`, built from the loopback origin so the window
  // stays same-origin with the app and can be re-pointed later.
  const first=share.urls?.[0]||'',port=first.match(/:(\d+)\D/)?.[1];
  if(port&&String(location.port)===port&&/^https?:$/.test(location.protocol))return `${location.protocol}//${location.hostname}:${port}/d/`;
  return first;
 }
 function openSecondScreen(url){
  if(!url)return false;
  if(popup&&!popup.closed){
   try{popup.location.replace(url);}catch(_){popup.location.href=url;}   // cross-origin handles allow the navigation, not the method
   try{popup.focus();}catch(_){}
   return true;
  }
  popup=window.open(url,SECOND_NAME);
  if(!popup)return false;
  try{popup.focus();}catch(_){}
  return true;
 }
 async function startShare(window_){
  share=await command('start');
  if(!share.urls?.length){await command('stop');share=null;throw Error('未找到局域网地址，请连接 Wi-Fi 或开启热点。');}
  popup=window_||popup;
  render();
  const url=screenUrl();
  if(popup&&!popup.closed)popup.location.href=url;
  if(!popup||popup.closed){popup=null;if(!openSecondScreen(url))notice('浏览器拦截了新窗口，请允许本站弹出窗口后重试。');}
  else{try{popup.focus();}catch(_){}}
  publish();
 }
 $('sdOpenTop').onclick=async()=>{
  try{
   if(share){if(!openSecondScreen(screenUrl()))notice('浏览器拦截了新窗口，请允许本站弹出窗口后重试。');else notice('第二屏幕已在新窗口打开。');return;}
   // The popup must be created in the click itself, before any await, or the
   // browser treats it as not user-initiated and blocks it.
   const win=window.open('about:blank',SECOND_NAME);
   await startShare(win);
   notice('第二屏幕已在新窗口打开。');
  }catch(e){if(popup&&!popup.closed&&!share){popup.close();popup=null;}notice(e.message);}
 };
 $('sdStop').onclick=async()=>{
  try{await publishing;await command('stop');share=null;if(popup&&!popup.closed){popup.close();popup=null;}notice('第二屏幕已停止。');render();}catch(e){notice(e.message);}
 };
 const ready=(async()=>{try{const r=await fetch('data/showdown.json');if(!r.ok)throw Error('决战数据载入失败');data=await r.json();const raw=localStorage.getItem(key);if(raw){const saved=JSON.parse(raw);if(saved.schemaVersion!==1||!saved.sessions)throw Error('决战存档格式无法识别');Object.values(saved.sessions).forEach(s=>E.validate(data,s));store=saved;}store.showFan=store.showFan===true;store.showStart=store.showStart!==false;store.swapped=store.swapped===true;store.cardRotation=((Math.round((Number(store.cardRotation)||0)/90)*90)%360+360)%360;store.align=ALIGN_MODES.includes(store.align)?store.align:ALIGN_DEFAULT;store.showRulebook=store.showRulebook===true;store.active=null;
  try{const existing=await command('status');if(existing.active)share=existing;}catch(_){}
 }catch(e){blocked=true;notice(e.message+'，原存档保留。');}render();})();
 async function battle(s){await ready;if(!data||blocked)return;try{if(!s){store.active=null;render();return;}if(store.active===s.id&&current())return;update(store.sessions[s.id]||E.create(data,s.bossId,s.levelId,s.id));notice('副屏跟随当前战斗，布场结果已保存。');}catch(e){notice(e.message);}}
 window.KDMShowdown={battle,async encounter(hunt){await ready;if(!data||blocked)return;const b=data.bosses.find(b=>b.huntMonsterId===hunt.monster.id),l=b?.levels.find(l=>l.name===hunt.levelName);if(b&&l){if(hunt.showdownBattle&&!store.sessions[hunt.battleId]){try{E.validate(data,hunt.showdownBattle);store.sessions[hunt.battleId]=hunt.showdownBattle;}catch(_){}}await battle({id:hunt.battleId,bossId:b.id,levelId:l.id});}},snapshot(hunt){return store.sessions[hunt?.battleId]?JSON.parse(JSON.stringify(store.sessions[hunt.battleId])):null;},async terrain(on){await ready;if(!data||blocked)return;setFan(on);},async startPos(on){await ready;if(!data||blocked)return;setShowStart(on);},async layout(on){await ready;if(!data||blocked)return;if(on&&typeof on==='object'){if(on.swapped!==undefined)setSwapped(on.swapped);if(on.cardRotation!==undefined)setCardRotation(on.cardRotation);if(on.align!==undefined)setAlign(on.align);}else setSwapped(on);},show(){window.KDMLoot.show('loot');}};
 ready.then(async()=>{await battle(await window.KDMLoot.currentBattle());if(localStorage.getItem('kdm-page')==='showdown')window.KDMLoot.show('loot');});
})();
