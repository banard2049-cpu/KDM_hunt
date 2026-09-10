(function(){
 'use strict';const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const labels={movement:'移动',toughness:'坚韧',speed:'速度加值',damage:'伤害加值',accuracy:'命中加值',evasion:'闪避加值',luck:'幸运加值'};
 // The second screen's card column rests at twice the classic card width; the
 // host's 「卡牌大小」 control scales this base by 50%–200%.
 const CARD_BASE=220;
 // The board opens at 170% of its resting size — the default the engine writes
 // into a battle (see DEFAULT_BOARD_SCALE in showdown-engine.js) and what the
 // host's 「版图大小」 readout shows before anyone touches ＋／−.
 const DEFAULT_BOARD_SCALE=1.7;
 // Cards open at 150% of CARD_BASE, the same default the engine writes into a
 // battle and the one 「重置大小」 comes back to.
 const DEFAULT_CARD_SCALE=1.5;
 // 「显示初始位置」 covers the whole setup highlight — the blue legal start squares,
 // the monster's footprint and the terrain the setup rules place. It is on unless
 // a battle saved by a newer 隐藏初始位置 press says otherwise.
 const showZones=s=>s?.display?.showStart!==false;
 // 「交换版图与卡牌」 flips the two columns; 「旋转卡牌区」 turns every card's art a
 // quarter turn at a time (0/90/180/270, counter-clockwise) so a screen lying on
 // its side can still be read. Both ride in the snapshot with the rest of display.
 const swappedView=s=>s?.display?.swapped===true;
 const cardRotation=s=>{const r=Math.round(Number(s?.display?.cardRotation)||0);return ((r%360)+360)%360;};
 // 「对齐方式」 is the one cycling button the host puts next to 交换／旋转: 居中, 靠上
 // and 靠下. Both halves of the display move together — the board inside its panel
 // and the whole card column (legend, run, boss line, stats) inside its own — and
 // the stylesheet does all of it, so 旋转's promise that the geometry is untouched
 // still holds. 靠下 is the resting state: it is what an untouched display, and a
 // battle saved before the switch existed, keeps.
 const ALIGN_MODES=['center','top','bottom'];
 const alignOf=s=>{const v=s?.display?.align;return ALIGN_MODES.includes(v)?v:'bottom';};
 // 「显示决战版图」 / 「显示Boss规则书」 is the one switch that trades the whole view: the
 // showdown board (what an untouched display and an older battle show) or the
 // boss/level rulebook pages the level itself ships. The flag rides in the snapshot
 // with the rest of display, so one press on the host redraws this screen.
 const showRulebook=s=>s?.display?.showRulebook===true;
 // The rule pages follow the app's 清晰度 preference — the same localStorage key the
 // loot page writes — so 高 shows the level's HD scans when it has them and 低 the
 // shipped ones. Multi-page levels (38 of them carry a second page) stack in order.
 function rulePages(level){
  const r=level?.rule||{};
  let hd=false;try{hd=localStorage.getItem('kdm-rulebook-version')==='hd';}catch(_){}
  return [...((hd&&r.hdFiles)||r.files||[r.file].filter(Boolean))];
 }
 function face(c){return c?.file?`<span class="sd-face" role="img" aria-label="${esc(c.name)}" style="background-image:url('${esc(c.file)}');background-size:${(c.w||1)*100}% ${(c.h||1)*100}%;background-position:${c.w>1?c.col*100/(c.w-1):0}% ${c.h>1?c.row*100/(c.h-1):0}%"></span>`:`<div class="sd-missing">${esc(c?.name)}<br>卡图资料缺失</div>`;}
 // The viewport is cropped to the 22x16 cell field itself, so the artwork sits
 // flush in its panel with no coordinate gutter and no row/column numbers.
 function board(s){const l=s.level,map=l.map?.image||l.mapImage||'assets/board/showdown-board.jpg';
 // The whole setup highlight — start squares, monster footprint and pinned
 // terrain — rides on one flag the 「显示初始位置」 button writes into the snapshot.
 const showStart=showZones(s);
 let svg=`<svg class="sd-board" viewBox="40 40 880 640" role="img" aria-label="${showStart?'决战版图、怪物位置、蓝色合法起始区域及固定地形高亮':'决战版图、怪物位置及固定地形高亮（初始位置已隐藏）'}"><defs><clipPath id="sdBoardClip"><rect x="40" y="40" width="880" height="640"/></clipPath><pattern id="sdGrid" x="40" y="40" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#f4ece2" stroke-opacity=".14" stroke-width="1"/></pattern></defs><g clip-path="url(#sdBoardClip)"><image x="40" y="40" width="880" height="640" preserveAspectRatio="none" xlink:href="${esc(map)}" href="${esc(map)}"/><rect x="40" y="40" width="880" height="640" fill="url(#sdGrid)"/></g>`;
 if(showStart)for(const z of l.zones||[])for(const [x,y]of z.cells)svg+=`<rect x="${x*40+1}" y="${y*40+1}" width="38" height="38" fill="#459cff" fill-opacity=".58" stroke="#91c5ff"><title>${esc(z.name)} · ${x}, ${y}</title></rect>`;
 function piece(p,size,rotation,color,name){if(!p||!size)return;const side=Math.round((rotation||0)/90)%2,w=(side?size.y:size.x)*40,h=(side?size.x:size.y)*40,cx=(p[0]+.5)*40,cy=(p[1]+.5)*40;svg+=`<g class="sd-monster-piece"><title>${esc(name)} · ${p.join(', ')} · ${rotation||0}°</title><rect x="${cx-w/2}" y="${cy-h/2}" width="${w}" height="${h}" rx="4" fill="${color}" fill-opacity=".65" stroke="${color}" stroke-width="3"/><text x="${cx}" y="${cy+5}" fill="white" font-size="${w<65?13:17}" text-anchor="middle">${esc(name.length>17?name.slice(0,15)+'…':name)}</text><path d="M-6 5L0 -6L6 5" fill="none" stroke="white" stroke-width="2" transform="translate(${cx},${cy-h/2+12}) rotate(${rotation||0})"/></g>`;}

 for(const t of showStart?[...l.fixed,...l.special]:[])for(let i=0;i<(t.positions||[]).length;i++){
 const p=t.positions[i],size=t.size;if(!p||!size)continue;
 const rotation=t.rotations?.[i]||0,side=Math.round(rotation/90)%2,w=(side?size.y:size.x)*40,h=(side?size.x:size.y)*40,cx=(p[0]+.5)*40,cy=(p[1]+.5)*40;
 // Keep terrain as a named highlight: card art belongs exclusively in the sidebar.
 const name=t.name||'地形',limit=Math.max(4,Math.floor((w-8)/7)),lines=[];
 for(const word of name.split(/\s+/)){if(lines.length && lines[lines.length-1].length+word.length+1<=limit)lines[lines.length-1]+=' '+word;else for(let j=0;j<word.length;j+=limit)lines.push(word.slice(j,j+limit));}
 const font=Math.min(14,(h-8)/Math.max(1,lines.length));
 svg+=`<g class="sd-terrain-highlight"><title>${esc(name)} · ${p.join(', ')} · ${rotation}°</title><rect x="${cx-w/2}" y="${cy-h/2}" width="${w}" height="${h}" fill="#dea94b" fill-opacity=".4" stroke="#ffd27c" stroke-width="2"/><text class="sd-terrain-name" x="${cx}" y="${cy-(lines.length-1)*font*.6}" text-anchor="middle" dominant-baseline="middle" font-size="${font}" font-weight="700" fill="#fff3cc" stroke="#30200d" stroke-width="3" paint-order="stroke">${lines.map((line,n)=>`<tspan x="${cx}" dy="${n?font*1.2:0}">${esc(line)}</tspan>`).join('')}</text></g>`;
 }
 if(showStart)for(const f of l.figures||[])piece(f.position,f.size,f.rotation,'#e46563',f.name);
 return svg+'</svg>';
 }
 // The rulebook view replaces the board panel and nothing else: the level's own rule
 // pages take the map's place while the card column — heading, stats, terrain cards
 // and starting cards — stays exactly where it is, so the table can be played with the
 // rules on screen. It is the map that is traded, never the display.
 function ruleStage(s){
  const l=s.level||{},pages=rulePages(l),title=l.rule?.title||`${s.boss?.name||''} · ${l.name||''}`;
  if(!pages.length)return '<div class="sd-rulebook"><p class="sd-rule-note">该等级没有提供规则书原图，请按实体规则书结算。</p></div>';
  return `<div class="sd-rulebook"><div class="sd-rule-pages">${pages.map((file,i)=>`<button class="sd-rule-page" data-sd-rule="${i}" aria-label="放大 ${esc(title)} 规则页 ${i+1}"><img src="${esc(file)}" alt="${esc(title)} 规则页 ${i+1}"></button>`).join('')}</div></div>`;
 }
 function ruleMissing(){const p=document.createElement('p');p.className='sd-rule-note';p.textContent='这一页的规则原图不在本机资源里，请翻看其他页面或实体规则书。';return p;}
 function render(target,s){if(!s){target.textContent='选择 Boss 和等级后展示决战布场。';return;}const l=s.level,zoom=[];target.style.setProperty('--sd-board-scale',Math.max(.5,Math.min(2,Number(s.display?.boardScale)||DEFAULT_BOARD_SCALE)));target.style.setProperty('--sd-card-width',Math.round(CARD_BASE*Math.max(.5,Math.min(2,Number(s.display?.cardScale)||DEFAULT_CARD_SCALE)))+'px');
 // 旋转卡牌区 turns each card a quarter turn at a time without changing the card:
 // the same card, the same area, only lying on its side — a turned card is as wide as
 // the upright card is tall. The turn lives on the art inside each card box and the
 // box itself comes from the stylesheet, so a half turn only flips the art, and a
 // quarter turn is the only angle that reshapes it.
 const angle=cardRotation(s),align=alignOf(s);
 if(target.classList){target.classList.toggle('sd-swapped',swappedView(s));target.classList.toggle('sd-card-rotated',angle!==0);target.classList.toggle('sd-card-sideways',angle===90||angle===270);for(const mode of ALIGN_MODES)target.classList.toggle('sd-align-'+mode,align===mode);}
 target.style.setProperty('--sd-card-angle',`${angle}deg`);
 // Cards are read from their art alone: no visible caption, the name stays in
 // the accessible label (and in the enlarged view's heading).
 function cards(list){return `<div class="sd-cards">${list.filter(Boolean).map(c=>{const i=zoom.push(c)-1;return `<article class="sd-card"><button data-sd-zoom="${i}" aria-label="放大 ${esc(c.name)}">${face(c)}</button></article>`;}).join('')}</div>`;}
 const introduction=t=>{
  const catalog=window.ShowdownTerrain,original=t.card||{},c=catalog?.byId[original.id]||catalog?.byName[t.name||original.name];
  return c||{name:t.name||original.name||'地形介绍卡',missing:true};
 };
 // Fixed, assigned, special and random terrain all share one flat card run, so
 // the origin on the board is the only thing that distinguishes them. Same-name
 // terrain (a tile placed twice, or drawn again) is shown once.
 const seenName=new Set();
 const terrain=[...l.fixed,...l.unfixed,...l.special.filter(t=>t.card),...s.random].map(introduction).filter(c=>!c.name||(seenName.has(c.name)?false:(seenName.add(c.name),true)));
 const warning=[...(l.warnings||[]),...(s.drawWarnings||[])].join('\n').trim();
 // Warnings are the only thing left under the board, and only when there are any:
 // the map panel stays a clean map, the legend lives with the cards.
 const notes=warning?`<div class="sd-board-notes"><div class="sd-warning">${esc(warning)}</div></div>`:'';
 const legend=`<div class="sd-legend">${showZones(s)?'<span style="--color:#459cff">全部合法狩猎者起始格</span>':''}<span style="--color:#e46563">怪物起始占地</span><span style="--color:#dea94b">固定地形高亮</span></div>`;
 // One ungrouped sequence, in reading order: basic action, monster info,
 // starting traits, every terrain introduction card, terrain-borne starting cards.
 const everyCard=[l.basicAction,l.info,...(l.starting||[]),...terrain,...(s.terrainStart||[])].filter(Boolean);
 // 「显示Boss规则书」 only trades the map for the rule pages: the panel keeps its place,
 // its size and its warnings, and the card column beside it is drawn exactly as it is
 // while the board is up.
 const inRules=showRulebook(s),pages=inRules?rulePages(l):[];
 target.innerHTML=`<div class="sd-layout"><div class="sd-board-wrap"><div class="sd-board-stage">${inRules?ruleStage(s):board(s)}</div>${notes}</div><aside class="sd-card-sidebar" aria-label="决战卡牌"><div class="sd-sidebar-content"><div class="sd-heading"><h2>${esc(s.boss.name)} · ${esc(l.name)}</h2><span>${inRules?'Boss 规则书':'决战布场'}</span></div>${legend}<div class="sd-stats">${Object.entries(l.stats||{}).map(([k,v])=>`<div class="sd-stat">${labels[k]||esc(k)}<b>${esc(v)}</b></div>`).join('')}</div>${cards(everyCard)}</div></aside></div>`;
 target.querySelectorAll('[data-sd-zoom]').forEach(el=>el.onclick=()=>modal(face(zoom[+el.dataset.sdZoom]),zoom[+el.dataset.sdZoom].name));
 target.querySelectorAll('[data-sd-rule]').forEach(el=>el.onclick=()=>{const file=pages[+el.dataset.sdRule];if(file)modal(`<img src="${esc(file)}" alt="${esc(l.rule?.title||'Boss 规则书')}">`,l.rule?.title||'Boss 规则书');});
 // A rule page the bundle does not carry is dropped instead of left as a broken frame.
 target.querySelectorAll('.sd-rule-page').forEach(frame=>{const img=frame.querySelector('img');if(img)img.onerror=()=>frame.replaceWith(ruleMissing());});
 }
 function modal(html,title){let d=document.getElementById('sdModal');if(!d){d=document.createElement('dialog');d.id='sdModal';d.className='sd-modal';document.body.append(d);}d.innerHTML=`<button aria-label="关闭">关闭</button><h3>${esc(title)}</h3>${html}`;d.querySelector('button').onclick=()=>d.close();d.showModal();}
 /* Board geometry. The board keeps its own aspect ratio, is centred in its panel,
    and never grows past the screen: 100% is the resting size that leaves the card
    panel its usual share, the default is 170% (DEFAULT_BOARD_SCALE above), and the
    top of the range is exactly the size that fills the display. The card panel is
    what absorbs the difference. 旋转 takes no part in any of this: a turned card is
    the same card lying on its side, and that box is the stylesheet's business (see
    showdown.css), so only 交换 — which does trade the columns — changes what is
    measured here. */
 const BASE_SHARE=.6,SIDEBAR_MIN=260,MIN_BOARD=120,STACKED='(orientation:portrait)';
 function layout(target){
  if(!target||typeof target.getBoundingClientRect!=='function'||!target.querySelector)return;
  const svg=target.querySelector('.sd-board'),grid=target.querySelector('.sd-layout');
  if(!grid)return;
  // 「显示Boss规则书」 fills the board panel with the rule pages, so the panel is
  // measured from the page's own shape the way it is measured from the board's
  // viewBox: the card column keeps the width it has while the board is up, and the
  // portrait panel takes the shape of the page it is showing.
  const page=svg?null:target.querySelector('.sd-rule-page img');
  if(!svg&&!page)return;
  const box=svg?.viewBox?.baseVal;
  const ratio=box&&box.height>0?box.width/box.height:page?.naturalWidth>0?page.naturalWidth/page.naturalHeight:4/3;
  const set=(name,value)=>{if(target.style.getPropertyValue(name)!==value)target.style.setProperty(name,value);};
  set('--sd-board-ratio',(box&&box.height>0?`${box.width}/${box.height}`:page?.naturalWidth>0?`${page.naturalWidth}/${page.naturalHeight}`:'4/3'));
  // Opening the rule-image panel is gone; warnings are static per snapshot.
  const scale=Math.max(.5,Math.min(2,parseFloat(target.style.getPropertyValue('--sd-board-scale'))||DEFAULT_BOARD_SCALE));
  const swapped=target.classList?.contains('sd-swapped')===true;
  if(window.matchMedia?.(STACKED).matches){
   // Stacked, the display is one column already: the board gets the whole width and
   // the card run below it, in whatever arrangement 旋转 turns the art.
   set('--sd-board-w',`calc(100% * ${scale})`);set('--sd-board-h',`calc(100% * ${scale})`);
   target.style.removeProperty('--sd-grid-columns');
   return;
  }
  const notes=target.querySelector('.sd-board-notes');
  const gap=parseFloat(getComputedStyle(grid).columnGap)||0,room=grid.clientWidth-gap;
  const noteHeight=notes?notes.getBoundingClientRect().height:0;
  const stage=Math.max(MIN_BOARD,grid.clientHeight-noteHeight-1);
  const rest=Math.min(room*BASE_SHARE,stage*ratio),full=Math.max(rest,Math.min(room-SIDEBAR_MIN,stage*ratio));
  const width=Math.max(MIN_BOARD,Math.round(scale<1?rest*scale:rest+(full-rest)*(scale-1)));
  // 交换 gives the board the column it is drawn at anyway and the card panel what is
  // left, so trading sides never resizes either of them. Both columns are pinned,
  // because with an explicit board width the fractional grid would size the board's
  // column to it and hand the panel the rest, which is a different split.
  const columns=panel=>swapped?`${panel}px ${width}px`:`${width}px minmax(0,${panel}px)`;
  const panel=Math.max(MIN_BOARD,room-width);
  if(swapped)set('--sd-grid-columns',columns(panel));
  else target.style.removeProperty('--sd-grid-columns');
  set('--sd-board-w',width+'px');set('--sd-board-h',Math.round(width/ratio)+'px');
 }
 window.ShowdownView={render,layout,esc};
})();
