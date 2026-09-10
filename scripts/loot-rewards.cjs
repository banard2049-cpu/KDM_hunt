// Transcribed from the local TTS rule images. Each generated level retains its
// source book/page in loot.json; special scenarios never inherit numeric-level
// rewards merely because they share a level number.
const draw=(deck,count)=>({op:'draw',deck,count});
const take=(name,count=1,deck)=>({op:'take',name,count,...(deck?{deck}:{})});
const note=text=>({op:'note',text});
const roll=(rows,bonus=0,sides=10,label='奖励骰')=>({op:'roll',sides,bonus,label,rows});
const row=(min,max,steps,label)=>({min,max,steps,label});
const yes=(key,yes,no=[])=>({op:'if',key,yes,no});
const bool=(key,label)=>({key,label,type:'boolean'});
const num=(key,label,min=0,max=99)=>({key,label,type:'number',min,max});
const input=key=>({input:key});
const fixed=(steps,inputs=[],description)=>({type:'automatic',steps,inputs,...(description?{description}:{})});
const common='首次击败、幸存者经验、武器熟练度、发明及传承效果请同时按规则原图结算。';
const R={};
function levels(id,counts,extras={}) {
  R[id]={};counts.forEach(([basic,monster],i)=>R[id]['level-'+(i+1)]=fixed([draw('basic',basic),...(monster?[draw('monster',monster)]:[]),...(extras[i+1]||[]),note(common)]));
}
levels('white-lion',[[4,4],[4,6],[4,8]],{3:[take('Elder Cat Teeth')]});
levels('screaming-antelope',[[4,4],[6,7],[6,8]],{3:[draw('kingdom-death-monster-archive--core-vermin',2),take('Black Lichen')]});
levels('phoenix',[[4,4],[5,7],[6,9]],{3:[take('Phoenix Crest'),take('Black Lichen')]});
levels('gorm',[[4,4],[4,6],[4,8]],{3:[take('Stomach Lining')]});
levels('flower-knight',[[4,4],[4,6],[4,8]],{3:[take('Vespertine Cello')]});
levels('dung-beetle-knight',[[6,4],[7,6],[8,8]],{1:[take('Preserved Caustic Dung',2)],2:[take('Preserved Caustic Dung',3),take('Scell')],3:[take('Preserved Caustic Dung',3),take('Scell'),take('Calcified Juggernaut Blade')]});
levels('spidicules',[[4,4],[4,6],[4,8]],{3:[take('Silken Nervous System')]});
levels('sunstalker',[[4,4],[4,6],[7,8]],{1:[take('Sunstones')],2:[take('1,000 Year Old Sunspot')],3:[take('3,000 Year Old Sunspot')]});
levels('dragon-king',[[4,4],[4,6],[4,8]],{2:[take('Pituitary Gland')],3:[take('Shining Liver')]});
levels('charrogg',[[4,4],[4,6],[4,8]],{2:[take('Firebrand Scale')],3:[take('Flamesoul Shard')]});
levels('gnasher',[[4,4],[4,6],[4,8]],{2:[take('Fury Tooth')],3:[note('另获 Ragesoul Shard 与 Black Lichen。模组 Gnasher 奇特资源牌实际标为 Sharpened Slapper，无法确认与 Ragesoul Shard 对应，请手动核对后拿取。'),take('Black Lichen')]});
levels('crimson-crocodile',[[4,5],[5,6],[5,8]],{2:[take('Irregular Optic Nerve')],3:[take('Black Lichen'),yes('bloodletting',[roll([row(1,4,[], '未获得额外血泪'),row(5,10,[take('Blood Diamond Tear')],'获得钻石血泪')])])]});
R['crimson-crocodile']['level-3'].inputs=[bool('bloodletting','营地是否已发明“放血”？')];
levels('smog-singers',[[4,4],[5,6],[6,8]],{3:[take('Black Lichen')]});
for(const reward of Object.values(R['smog-singers'])){reward.inputs=[bool('peace','本次是否以“和睦”结束？')];reward.steps=[yes('peace',[note('和睦：不获得资源奖励，获得和平曲发明（已有则无事发生）；照常获得经验和武器熟练度。')],reward.steps)];}
levels('king',[[4,5],[4,7],[4,10]],{3:[take('Black Lichen')]});
R['white-gigalion']={
  'level-2':fixed([draw('basic',5),draw('monster',7),take('Hooked Claw'),note(common)]),
  'level-3':fixed([draw('basic',6),draw('monster',9),take('Hooked Claw',2),take('Elder Cat Teeth'),take('Black Lichen'),note(common)])
};
R['drifter-knight']={};for(let n=1;n<=3;n++)R['drifter-knight']['level-'+n]=fixed([draw('basic',4),draw('monster',input('blood')),...(n===2?[take('Destroyed Barb')]:n===3?[take('Neurotoxin'),take('Black Lichen'),yes('bloodletting',[roll([row(1,2,[]),row(3,5,[take('Drifting Aegis')]),row(6,8,[take('Ghostly Sleeves')]),row(9,10,[take('Pearlescent Guards')])])])]:[]),note(common)],[num('blood','决战结束时血池上的标记数量',0,14),...(n===3?[bool('bloodletting','营地是否已发明盛宴（按本模组规则页）？')]:[])],'基础资源 4 张，怪物资源数量等于决战结束时血池标记数，另按等级获得指定奖励。');
R['butcher']={};for(let n=1;n<=3;n++)R.butcher['level-'+n]=fixed([
  roll([row(1,3,[], '屠夫消失，无卡牌奖励。'),row(4,6,[roll(Array.from({length:5},(_,i)=>row(i+1,i+1,[take('Broken Lantern',i+1,'basic')])),0,5,'资源数量骰')]),row(7,9,[take('Butcher Cleaver'),take('Broken Lantern',1,'basic')]),row(10,12,[take('Butcher Cleaver'),roll(Array.from({length:5},(_,i)=>row(i+1,i+1,[take('Broken Lantern',i+1,'basic')])),0,5,'破损提灯数量骰'),note('获得对应的屠夫故事事件／发明奖励，请查看原图。')]),row(13,null,[take('Forsaker Mask (CE)')])],'level'),note(common)
]);
R['slenderman']={};for(let n=1;n<=3;n++)R.slenderman['level-'+n]=fixed([roll([row(1,3,[], '没有资源奖励。'),row(4,6,[take('Dark Water')]),row(7,9,[take('Dark Water'),take('Iron')]),row(10,12,[take('Dark Water',2),take('Iron')]),row(13,null,[take('Black Lichen')])],'level'),note('若营地尚无黑水研究，获得该发明。其他传承效果见规则原图。')]);
R['king-s-man']={};for(let n=1;n<=3;n++)R['king-s-man']['level-'+n]=fixed([roll([row(1,3,[draw('king-s-coin-archive--king-s-coin-strange-resources',2),take('Monster Organ',1,'basic')]),row(4,8,[roll(Array.from({length:5},(_,i)=>row(i+1,i+1,[draw('king-s-coin-archive--king-s-coin-strange-resources',i+1)])),0,5,'王之硬币数量骰'),note('拥有王之步伐的回归幸存者获得 +1 移动，一生一次。')]),row(9,null,[draw('king-s-coin-archive--king-s-coin-strange-resources',5),take('Steel Sword'),note('使用王之步伐返回的幸存者获得 +1 移动，一生一次。')])],'level'),note('触发 King’s Curse；其他等级与发明附加效果见规则原图。')]);
R['the-hand']={};for(let n=1;n<=3;n++)R['the-hand']['level-'+n]=fixed([roll([row(1,4,[take('Broken Lantern',1,'basic'),take('Skull',1,'basic'),note('营地 -1 人口。')]),row(5,8,[take('Broken Lantern',1,'basic'),note('向营地库存加入 1 个废料；指定幸存者受到爆炸的严重伤。')]),row(9,null,[take('Perfect Crucible'),take('Skull',1,'basic'),draw('basic',5),note('营地 -1 人口。')])]),note(common)]);
R['killenium-butcher']={
  'killenium-butcher-2':fixed([take('Killenium Cleaver'),roll(Array.from({length:5},(_,i)=>row(i+1,i+1,[take('Broken Lantern',i+1,'basic')])),0,5,'破损提灯数量骰'),note('每名幸存者 +2 勇气；经验、砍肉刀熟练度按原图结算。')]),
  'killenium-butcher-3':fixed([take('Killenium Cleaver'),take('Forsaker Mask (CE)'),take('Broken Lantern',5,'basic'),take('Cold Living Flesh'),note('每名幸存者 +2 勇气；经验、砍肉刀熟练度按原图结算。')])
};
R['lion-god']={};for(let n=1;n<=3;n++)R['lion-god']['level-'+n]=fixed([draw('basic',[8,10,12][n-1]),draw('lion-god-archive--lion-god-strange-resources',n),take(["Necromancer's Eye",'Golden Plate','Lion God Statue'][n-1]),note('若未发明死灵法，结算“狮之神”事件；其他传承效果见原图。')]);
R['manhunter']={
  'level-1':fixed([take('Revebrating Lantern'),roll([row(1,1,[]),row(2,10,[note('造成致命一击的幸存者获得坚韧战斗技艺。')])]),note(common)]),
  'level-2':fixed([take("Manhunter's Hat"),roll([row(1,1,[]),row(2,10,[note('造成致命一击的幸存者获得深谋远虑战斗技艺。')])]),note(common)]),
  'level-3':fixed([note('结算故事事件“战争的工具”，按事件中的实际选择获得奖励；可在下方指定拿牌。')]),
  'level-4':fixed([take('Deathpact'),note('每名幸存者获得一个自选战斗技艺；其他传承效果见原图。')])
};
R['lonely-tree']={};['Jagged Marrow Fruit','Blistering Plasma Fruit','Drifting Dream Fruit'].forEach((name,i)=>R['lonely-tree']['level-'+(i+1)]=fixed([take(name),note('可额外获得板上每张草药的资源，按现场草药数量手动拿牌；果实与树相关效果见原图。')]));
levels('black-lion',[[4,4],[4,6],[4,8],[6,10]],{2:[take('Eye of Cat'),take('Phantom Brain')],3:[take('Eye of Cat'),take('Lion Intestines')],4:[take('Lion Intestines'),take('Eye of Cat'),take('Phantom Brain')]});
R['black-knight']={};for(let n=1;n<=3;n++)R['black-knight']['level-'+n]=fixed([yes('first',[take('Black Knight Badge')]),note('获得下一级挑战之钟发明；结算 Darkened Workshop。集体劳作等奖励见原图。')],[bool('first','是否第一次击败黑骑士？')]);
R.atnas={};for(let n=1;n<=3;n++)R.atnas['level-'+n]=fixed([roll([row(1,2,[take('Perfect Hide',1,'basic')]),row(3,6,[take('Iron',n+1)]),row(7,null,[note(`营地获得 ${n+1} 人口，他们获得新生儿的增益。`)])],'level'),note(common)]);
R['bone-eaters']={};for(let n=1;n<=4;n++)R['bone-eaters']['level-'+n]=fixed([
  {op:'repeat',count:input('kills'),steps:[roll([row(1,6,[]),row(7,9,[draw('basic',1)]),row(10,10,[draw('basic',1),yes('scalpelAvailable',[{...take('Royal Scalpel'),once:true}])])])]},
  take(['Perfect Bone','Shawl of Determination','Royal Decorations','Bone Charm'][n-1]),note(n===3?'获得皇家饰品的幸存者还获得“饥不择食”损伤。':'其他幸存者奖励和后续狩猎选择见原图。')
],[num('kills','本次实际击败的食骨者数量',0,5),bool('scalpelAvailable','本战役是否尚未通过此奖励获得皇家解剖刀？')]);
R.allison={};for(let n=1;n<=4;n++)R.allison['level-'+n]=fixed([draw('basic',n<3?3:2),draw(input('quarryDeck'),n),take('Copper',n<3?n:3),...(n>=3?[take('Lantern Nerve Bundle')]:[]),...(n===4?[take('Black Lichen')]:[]),...(n>=3?[yes('paint',[take("Allison's Legacy")])]:[]),note(common)],[{key:'quarryDeck',type:'deck',label:'奖励所选的怪物资源牌库'},...(n>=3?[bool('paint','营地是否拥有脸部彩绘？')]:[])]);
R['forsaker-sisters']={};for(let n=1;n<=3;n++)R['forsaker-sisters']['level-'+n]=fixed([yes('male',[roll([row(1,3,[note('随机幸存者获得悲伤失调。')]),row(4,7,[draw('basic',n),take('Enriched Love Juice')]),row(8,null,[take('Pig Iron Blade'),take('Pig Iron Polearm'),note('可提名一名已完成的幸存者获得婴儿遗弃者；按原图在营地中选择并手动拿牌。')])],'level')]),yes('understanding',[roll([row(1,3,[]),row(4,10,[take('Sweat'),take('Broken Manacle')])])]),note('随后立即结算 Initiation of Death；后续人口与故事事件请按原图处理。')],[bool('male','是否有返回的男性幸存者？'),bool('understanding','是否有幸存者认知达到 7+？')]);
R['lion-knight']={};for(let n=1;n<=3;n++)R['lion-knight']['level-'+n]=fixed([yes('first',[take('Lion Knight Badge')]),note(n===3?'结算“大结局”故事事件。':'结算“中场休息”故事事件。'),note(common)],[bool('first','是否第一次击败狮骑士？')]);
R['storm-knight']={};for(let n=1;n<=3;n++)R['storm-knight']['level-'+n]=fixed([...(n<3?[yes('first',[take('Metal Face')])]:[]),note('结算 Aftermath 故事事件；狩猎经验、武器熟练度和额外奋斗点见规则。')],n<3?[bool('first','是否第一次击败这个等级的风暴骑士？')]:[]);
R['storm-dancer']={'level-4':fixed([take('Iron',4),draw('monster',8),take('Bone Katana'),note('最多两名幸存者可获得漂流之舞或云端漫步秘密战斗技艺。')])};
R['the-tyrant']={
  'level-1':fixed([take('Dragon Vestments',input('chosen')),note('获得装备者获得对应的失调；其他选择见原图。')],[num('chosen','选择获得龙纹法衣的幸存者数量',0,2)]),
  'level-2':fixed([take('Celestial Spear'),note('每名获胜幸存者获得 1 个随机战斗技艺。')]),
  'level-3':fixed([note('每名获胜幸存者获得 +1 勇气、+1 认知。其他发明选择见原图。')])
};
R.watcher={'level-1':fixed([note('所有活着的幸存者获得永久 +1 力量，然后结算“灯火熄灭”。无固定资源卡奖励。')])};
R['allison-watcher']={'level-1':fixed([note('所有幸存者永久 +1 力量，然后结算 Blackout 与 Who Watches the Watcher。无固定资源卡奖励。')])};
R['gold-smoke-knight']={'level-1':fixed([note('结算“游戏结束”故事事件，无固定资源卡奖励。')])};
R.gambler={'level-4':fixed([note('归档护梦者营地地点并获得游戏舞台营地地点。无固定资源卡奖励。')])};
R.godhand={'level-4':fixed([note('结算“尾声 · 胜利”故事事件，无固定资源卡奖励。')])};
const quarry={key:'quarryDeck',type:'deck',label:'选择本次奖励的怪物资源牌库'};
const choose=(key,label,deck)=>({key,type:'card',label,deck});
const chosen=key=>({op:'chosen',key});
R['white-lion'].prologue=fixed([draw('basic',4),draw('monster',4),note('每名幸存者记录第一次狩猎经验。随后创建营地。')]);
R['crimson-crocodile']['prologue-crimson-crocodile']=fixed([draw('basic',4),draw('monster',4),note('获得猩红玻璃工坊；每名幸存者 +1 狩猎经验。随后创建营地。')]);
R['white-lion']['beast-of-sorrow']=fixed([...R['white-lion']['level-3'].steps,take('Iron'),note('致命一击者获得一个随机战斗技艺。')]);
R['white-lion']['great-golden-cat']=fixed([...R['white-lion']['level-3'].steps,take('Iron'),take('Black Lichen'),note('致命一击者永久 +2 力量，获得永恒之眼与连击大师战斗技艺。')]);
R['screaming-antelope']['mad-steed']=fixed([...R['screaming-antelope']['level-3'].steps,chosen('resource'),note('致命一击者获得断臂严重伤、赤拳秘密战斗技艺、+9 勇气、开拓之剑；详见原图。')],[choose('resource','选择额外的 1 张尖叫羚羊资源','monster')]);
R.phoenix['golden-eyed-king-of-1000-years']=fixed([...R.phoenix['level-3'].steps,note('致命一击者获得 +1,000 狂意及千战之王秘密战斗技艺。')]);
R['dragon-king']['death-of-the-dragon-king']=fixed([note('结算龙王之死结局。此特殊决战没有普通龙王资源奖励。')]);
R.sunstalker['the-great-devourer']=fixed([note('结算大吞噬者的结局与游戏结束，没有普通逐日者资源奖励。')]);
R['harvester-worm']={
 'level-1':fixed([note('若本次战斗由故事事件触发，按该事件指定的结局结算。否则不获得固定资源奖励；所有幸存者受到大脑创伤，致命一击者获得随机失调，其他结果见原图。')]),
 'level-2':fixed([draw('basic',5),take('Solvent Node',2),note('所有幸存者受到大脑创伤；致命一击者获得随机失调与永久 +1 力量。获得后头酿酒厂（若没有），将收割者蠕虫等级 3 加入猎物列表。')]),
 'level-3':fixed([draw('basic',5),draw(input('quarryDeck'),5),take('Solvent Node',2),take('Infinite Ganglion Cord'),take('Black Lichen'),note('结算原图的永久移除事件、血祭、人口与吞食者标记等结果。')],[quarry]),
 'blood-worm':fixed([draw('basic',8),take('Solvent Node'),take('Infinite Ganglion Cord'),take('Black Lichen'),note('指定 4 名幸存者永久 +1 速度与移动，并获得逃脱者称号；详见原图。')]),
 'dung-worm':fixed([draw('basic',12),take('Solvent Node',2),take('Infinite Ganglion Cord'),take('Black Lichen'),...['strange1','strange2','strange3'].map(chosen),note('归档 Rolling Visitors；额外力量及帝王蠕虫解锁见原图。')],['strange1','strange2','strange3'].map((k,i)=>choose(k,`选择奇特资源 ${i+1}`,'strange'))),
 'regal-worm':fixed([draw('basic',10),take('Solvent Node',2),take('Infinite Ganglion Cord'),take('Black Lichen'),draw(input('quarryDeck'),10),note('获得 Painted Cavern；从猎物列表移除帝王蠕虫。结算原图的力量、移动与新资源奖励。')],[quarry]),
 'homecoming':fixed([note('按归家结局结算：胜利将营地转为 Settlement Caravan 并结束游戏；逃脱使用逃脱分支。没有固定战利品卡奖励。')])
};
R['gardener-worm']={};for(const n of [2,3])R['gardener-worm']['level-'+n]=fixed([draw('basic',6),take('Solvent Node',2),take('Infinite Ganglion Cord'),note(common)]);
R.scourgelord={prologue:fixed([draw('basic',4),draw(input('quarryDeck'),4),note('选择本战役节点 1 的怪物资源；随后按 Moths to the Flame 创建营地。')],[quarry])};
for(let n=1;n<=3;n++)R.scourgelord['level-'+n]=fixed([take('Vermin Cage'),roll([row(1,5,[draw('kingdom-death-monster-archive--core-vermin',1)]),row(6,10,[draw('kingdom-death-monster-archive--core-vermin',1),take('Embalming Saliva')]),row(11,11,[note('来源规则的奖励表缺失总点数 11（只列出 1–5、6–10、12+）。请核对实体规则后手动结算本次骰表奖励。')]),row(12,null,[take('Lantern Lute'),note('规则页 Lantern Lure 对应模组卡牌 Lantern Lute。')])],'level'),note('若有幸存者死亡，首次获得 Corpse Exchange 死亡原则；鼓发明与后续事件见原图。')]);
// The GCE Core Rules object actually contains the King's Coin replacement page.
R['king-s-man-kc']=JSON.parse(JSON.stringify(R['king-s-man']));
for(const rule of Object.values(R['king-s-man']))rule.description='按 GCE 模组内的王之硬币变体奖励表结算。高清基础规则书使用另一套奖励表，详情见规则来源说明。';
R['king-s-man-curse']={};
for(const id of ['an-unexpected-return','a-noble-return','altering-fate'])R['king-s-man-curse'][id]=fixed([
 roll([row(1,4,[take('Broken Lantern',2,'basic'),take('Monster Organ',1,'basic')]),row(5,8,[note('每名幸存者获得一个随机战斗技艺。')]),row(9,10,[take('Steel Sword'),draw('basic',1)])]),
 ...(id==='a-noble-return'?[draw(input('quarryDeck'),3)]:[]),
 note(id==='a-noble-return'?'结算王之诅咒；奖励怪物资源应尽可能与死去怪物的搜刮资源来自同一牌库。':'结算王之诅咒；Altering Fate 中女孩的孩子免疫该诅咒。'),
 note(id==='a-noble-return'?'若有 Memento Mori，每名回归者掷 d10，8+ 获得处刑者的一项战斗技艺。':'若有 Memento Mori，每名回归者掷 d10，6+ 获得 +3 勇气。')
],id==='a-noble-return'?[quarry]:[]);
// The GCE Curse rulebook prints a BERSERK KING'S MAN page that the mod never
// models as a level. It is played with the same reward table as An Unexpected
// Return (confirmed with the project owner), so clone that entry rather than
// falling through to the generic "manual settlement" placeholder.
R['king-s-man-curse']['berserk-king-s-man']=JSON.parse(JSON.stringify(R['king-s-man-curse']['an-unexpected-return']));
R['dung-beetle-knight']['the-old-master']={type:'manual',note:'年老大师的胜利文字在模组图片中被水印遮挡，无法可靠核对奖励。请查实体规则并在下方手动拿牌，不套用普通等级 3 的奖励。'};
R['white-lion-whitebox']={'young-lion':{type:'manual',note:'模组未提供 Young Lion 的专用胜利规则页。请按实体规则手动拿牌，不套用普通白狮等级 1 的奖励。'}};
R.butcher['level-3'].inputs=[bool('maskAvailable','本战役是否尚未通过等级 3 的额外判定获得弃者面具？')];
R.butcher['level-3'].steps.push(yes('maskAvailable',[roll([row(1,1,[]),row(2,10,[{...take('Forsaker Mask (CE)'),once:true},note('指定幸存者获得面具；每战役仅可通过此额外判定获得一次。')])],0,10,'等级 3 额外面具骰')]));
module.exports=R;
