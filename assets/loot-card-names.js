// Auxiliary Chinese translations for card selection; English names remain the
// source identifiers. Keep spelling variants from imported decks as exact keys.
(function(root){
  'use strict';
  const names=Object.fromEntries(`
1,000 Year Old Sunspot|千年太阳黑子
3,000 Year Old Sunspot|三千年太阳黑子
???|未知之物
Acid Gland|酸腺
Active Thyroid|活性甲状腺
Adventure Sword|冒险之剑
Afterdeath Brew|死后佳酿
Allison's Blue Lantern|艾莉森的蓝色提灯
Allison's Legacy|艾莉森的遗产
Allison's Twilight Sword|艾莉森的暮光剑
Ancient Blade|远古之刃
Ancient Lion's Claws|远古狮爪
Antique Bangle|古老手镯
Arachnid Heart|蛛形之心
Arondight|阿隆戴特
Awakened Twilight Cloak|觉醒暮光斗篷
Baby Forsaker|幼年遗弃者
Beast Hunter Helm|猎兽者头盔
Beast Steak|野兽肉排
Beetle Horn|甲虫角
Beetle Thorax|甲虫胸节
Belching Bagpipe|嗳气风笛
Big Bite Costume|巨口装束
Bile Duct|胆管
Bile Lamprey|胆汁七鳃鳗
Bioluminescent Fly|发光蝇
Bird Beak|鸟喙
Black Claw|黑爪
Black Gauntlet|黑色护手
Black Ghost Dagger|黑幽灵匕首
Black Knight Badge|黑骑士徽章
Black Lens|黑色透镜
Black Lichen|黑色地衣
Black Skull|黑色头骨
Bladder|膀胱
Bleeding Corpse Lily|泣血尸百合
Blistering Plasma Fruit|起疱血浆果
Blood Bat|血蝙蝠
Blood Diamond Tear|血钻之泪
Blood Stool|血便
Blue Affinity Stone|蓝色亲和石
Blue Potion|蓝色药剂
Bone Charm|骨制护符
Bone Katana|骨制太刀
Bone Witch Mehndi|骨巫指甲花纹身
Book of Dreadful Darkness|恐怖黑暗之书
Brain Root|脑根
Brave Dirndl|勇者连衣裙
Brave's Light|勇者之光
Brazen Bat|黄铜蝙蝠
Broken Halberd|断戟
Broken Lantern|破损提灯
Broken Manacle|破损镣铐
Bugfish|虫鱼
Bulbous Gaster|膨大腹节
Burned Gillhide|烧焦鳃皮
Butcher Cleaver|屠夫砍刀
Butcher's Blood|屠夫之血
Buzzind MadFlies|嗡鸣狂蝇
CCG Centipede Claw|CCG 蜈蚣爪
Cabled Vein|缆状血管
Calcified Juggernaut Blade|钙化巨兽之刃
Caliburn|石中剑
Camping Bag|露营袋
Cancer Pigeon|癌鸽
Canopic Jar|脏器罐
Carmine Cochineal|胭脂虫
Carnwennan|卡文南匕首
Celestial Spear|天界长矛
Centileech|百足蛭
Centipede Claw|蜈蚣爪
Century Fingernails|百年指甲
Century Shell|百年甲壳
Chaos Elf Hat|混沌精灵帽
Charrrogg Scale|查罗格鳞片
Child of Destiny|命运之子
Chitin|甲壳质
Chosen vestments|天选者法衣
Clasping Shield|紧握之盾
Cleaner Bird|清洁鸟
Cloud Pendant|云之吊坠
Cocoon Membrane|茧膜
Coffin Bone|棺骨
Cold Living Flesh|冰冷活肉
Compound Eye|复眼
Copper|铜
Crab Chucks|蟹钳双节棍
Crab Spider|蟹蛛
Crimson Bone|猩红骨
Crimson Fin|猩红鳍
Crimson Vial|猩红小瓶
Crystal Ember|水晶余烬
Crystal Sword Mold|水晶剑模
Curious Hand|奇异之手
Cursed Hidden Crimson Jewel|诅咒隐秘猩红宝石
Cycloid Scales|圆鳞
Cyclops Fly|独眼蝇
Dark Tower's Ledger|黑暗之塔账簿
Dark Water|黑水
Dark Water Vial|黑水小瓶
Death Crown|死亡王冠
Death Mehndi|死亡指甲花纹身
Deathmetal|死亡金属
Deathpact|死亡契约
Delicate Hand|纤细的手
Dense Bone|致密骨
Destroyed Barb|断裂倒刺
Dhinga Ling|丁加铃
Discord Cricket|不和谐蟋蟀
Dragon Iron|龙铁
Dragon Vestments|龙之法衣
Drifting Aegis|漂流之盾
Drifting Dream Fruit|漂流梦果
Durendal|杜兰达尔
Dying Lantern|将熄的提灯
Ecdysteroid Rich Exuviae|富含蜕皮激素的蜕壳
Elder Cat Teeth|古老猫牙
Elytra|鞘翅
Embalming Saliva|防腐唾液
Enriched Love Juice|浓缩爱之汁
Everburn|永燃
Excalibur|誓约胜利之剑
Exoskeleton|外骨骼
Exquisite Fabric|精美织物
Eye Patch|眼罩
Eye of Cat|猫眼
Eye of Immortal|不朽者之眼
Eye of Mad Apotos|疯狂阿波托斯之眼
Eyeballs|眼球
Fatty Snail|肥蜗牛
Fellbrandt|费尔布兰特
Fertility Tentacle|繁育触手
Firebrand Scale|火印鳞片
Flamesoul Shard|焰魂碎片
Flat Vein|扁平血管
Fleshy Armor|血肉护甲
Flower Costume|鲜花装束
Flower Knight Badge|花骑士徽章
Flower Knight Helm|花骑士头盔
Fluted Bone|凹槽骨
Fluted Severed Head|沟纹断首
Forgot's Light|遗忘者之光
Forsaker Mask|遗弃者面具
Forsaker Mask (CE)|遗弃者面具（CE）
Forsaker Veil|遗弃者面纱
Founder's Eye|创始者之眼
Fresh Acanthus|新鲜莨苕
Fresh Kill|新鲜猎物
Fulgurite Stone|雷击石
Furious Lantern|狂怒提灯
Furious Mind|狂怒心智
Fury Tooth|狂怒之牙
Galatine|加拉廷
Gasesous Belly|充气腹囊
Ghost Pepper|幽灵椒
Ghostly Sleeves|幽魂衣袖
Gibbering Haremite|胡言乱语的后宫虫
Gloom Bracelets|幽暗手镯
Gloom Cream|幽暗软膏
Gloom Hammer|幽暗战锤
Gloom Katana|幽暗太刀
Gloom Mehndi|幽暗指甲花纹身
Gloom Sheath|幽暗刀鞘
Gloom-Coated Arrow|幽暗涂层箭
Glyph of Solitude|孤独符文
Gnasher Skull|啮齿兽头骨
Gnasher fur|啮齿兽毛皮
Gnastakes|啮齿兽肉排
God's String|神之弦
Gold Cat Costume|金猫装束
Gold-Bug|金虫
Golden Plate|金色甲片
Golden Whiskers|金色胡须
Gore Silk|血污丝
Gorm Brain|格姆脑
Gormite|格姆石
Gravity Rat|重力鼠
Great Cat Bones|巨猫骨
Great Rat Bones|巨鼠骨
Green Affinity Stone|绿色亲和石
Green Potion|绿色药剂
Grinning Visage|咧嘴笑脸
Groomed Nails|修整指甲
Hagfish|盲鳗
Hand|手
Hand of Mad Apotos|疯狂阿波托斯之手
Handed Skull|长手头骨
Hardened Ribs|硬化肋骨
Hazmat Shield|防化盾
Heathalum|希萨铝
Heavy Chain|沉重锁链
Hidden Crimson Jewel|隐秘猩红宝石
Hideous Disguise|骇人伪装
High Heel Boots|高跟靴
Hissing Cockroach|嘶鸣蟑螂
Hollow Crown|空心王冠
Hollow Stone|空心石
Hollow Wing Bones|中空翼骨
Hollow's Light|空洞者之光
Hooked Claw|钩爪
Hope Stealer|希望窃贼
Horn Fragment|角碎片
Hostox the Gloaming|暮色霍斯托克斯
Huge Sunteeth|巨型日牙
Hunter's Heart|猎人之心
Husk|躯壳
Husk of Destiny|命运之壳
Hyper Cube|超立方体
Immortal Tongue|不朽之舌
Inazuma|稻妻
Infinite Ganglion Cord|无尽神经节索
Inner Shadow Skin|内层暗影皮
Iron|铁
Irregular Optic Nerve|不规则视神经
Jagged Marrow Fruit|锯齿骨髓果
Jiggling Lard|颤动脂肪
Jowls|颊肉
Joy of Gaming|游戏之乐
Killenium Cleaver|千宰砍刀
King's Carapace|王之甲壳
King's Claws|王之爪
King's Cloth|王之布
King's Coin|王之币
King's Coin I|王之币 I
King's Coin II|王之币 II
King's Coin III|王之币 III
King's Coin IV|王之币 IV
King's Coin V|王之币 V
King's Coin VI|王之币 VI
King's Collar|王之颈圈
King's Man Cleaver|王之禁卫砍刀
King's Tongue|王之舌
Lagomorph Kanobo|兔形金棒
Lagomorph Lantern|兔形提灯
Lantern Bloom|提灯花
Lantern Brassiere|提灯胸衣
Lantern Bud|提灯花蕾
Lantern Centipede|提灯蜈蚣
Lantern Festival Horn|提灯节号角
Lantern Festival Mask|提灯节面具
Lantern Festival Midi|提灯节半身裙
Lantern Festival Top|提灯节上衣
Lantern Halberd|提灯长戟
Lantern Lute|提灯鲁特琴
Lantern Mantle|提灯披风
Lantern Mehndi|提灯指甲花纹身
Lantern Nerve Bundle|提灯神经束
Lantern Nerve Whip|提灯神经鞭
Lantern Tube|提灯管
Large Appendage|大型附肢
Large Flat Tooth|大型扁齿
Large Ragetooth|大型怒齿
Leather|皮革
Leather Bodysuit|皮革连体衣
Legendary Horns|传奇之角
Life String|生命之弦
Lightning Rod|引雷针
Lion Claw|狮爪
Lion God Statue|狮之神雕像
Lion Intestines|狮肠
Lion Knight Badge|狮骑士徽章
Lion Knight's Left Claw|狮骑士左爪
Lion Knight's Right Claw|狮骑士右爪
Lion Ovaries|狮卵巢
Lion Tail|狮尾
Lion Testes|狮睾丸
Lonely Ant|孤独蚁
Lonely Fruit|孤独之果
Lordsruin|领主之殇
Love Juice|爱之汁
Lovelorn Rock|失恋之石
Lucky Dice|幸运骰子
Lump of Atnas|甥啖老人肉块
Lustrous Tooth|光泽牙齿
Mage Armor|法师护甲
Magnum Knives|巨型双刀
Majestic Arm|威严之臂
Mammoth Hand|猛犸之手
Manacles|镣铐
Mandible Cesti|颚骨拳套
Manhunter's Hat|猎人者之帽
Master Key|万能钥匙
Meaty Rib|带肉肋骨
Mechanical Heart|机械之心
Metal Face|金属面孔
Milky Eye|乳白眼球
Mirror Dagger|镜面匕首
Mist Raven Obi|雾鸦腰带
Monster Blood Paint|怪物血颜料
Monster Bone|怪物骨
Monster Hide|怪物皮
Monster Organ|怪物器官
Muculent Droppings|黏液粪便
Muramasa|村正
Muramasa (CE)|村正（CE）
Muscly Gums|肌肉牙龈
Neckchopper|断颈刀
Necromancer's Eye|死灵法师之眼
Needle Sword|针剑
Nerve Cuirass|神经胸甲
Neurotoxin|神经毒素
Newborn|新生儿
Nightmare Leg|梦魇之腿
Nightmare Tick|梦魇蜱虫
Ocherous Eye|赭色眼球
Old Blue Box|旧蓝盒
Ornate Bone Blade|华丽骨刃
Ornate Rapier|华丽刺剑
Ossesous Bloom|骨质花
Oxidized Regal Faulds|氧化王者裙甲
Oxidized Regal Gauntlet|氧化王者护手
Oxidized Regal Greaves|氧化王者护胫
Oxidized Regal Helm|氧化王者头盔
Oxidized Regal Plackart|氧化王者胸甲
Packed Infant|包裹婴儿
Pale Fingers|苍白手指
Pale Flesh|苍白血肉
Pallium|披肩
Pearlescent Guards|珠光护具
Pelt|毛皮
Perfect Bone|完美骨
Perfect Crucible|完美坩埚
Perfect Hide|完美皮
Perfect Organ|完美器官
Petrified Plate|石化甲片
Phantom Brain|幻影脑
Phase Gland|相位腺
Phoenix Crest|凤凰冠
Phoenix Eye|凤凰眼
Phoenix Finger|凤凰手指
Phoenix Whisker|凤凰须
Phophetic Jawbone|预言颚骨
Piercing Claws|穿刺利爪
Pig Iron Blade|生铁剑
Pig Iron Polearm|生铁长柄武器
Pink Flesh|粉红血肉
Pituitary Gland|脑垂体
Plated Shield|覆甲盾
Porous Flesh Fruit|多孔血肉果
Portable Waterphone|便携水琴
Power Cube|能量立方体
Preserved Caustic Dung|保存的腐蚀粪便
Pridwen|普里德温之盾
Prismatic Gills|棱彩鳃
Pseudopenis|伪阴茎
Psycho Mantis|疯狂螳螂
Pure Bulb|纯净球茎
Pustules|脓疱
Pylorix|派洛里克斯
Radiant Heart|光辉之心
Radioactive Dung|放射性粪便
Radioactive Webbing|放射性蛛网
Rage Pawn|狂怒之卒
Rage Whiskers|狂怒胡须
Ragescale|怒鳞
Rainbow Droppings|彩虹粪便
Raptor-Worm Collar|猛禽蠕虫颈圈
Rawhide Corset|生皮束腰
Reaping Hook Arrow|收割钩箭
Red Affinity Stone|红色亲和石
Red Potion|红色药剂
Red Vial|红色小瓶
Red's Light|红衣者之光
Regal Edge|王者之刃
Regal Faulds|王者裙甲
Regal Faulds (CE)|王者裙甲（CE）
Regal Faulds (KC)|王者裙甲（KC）
Regal Gauntlet|王者护手
Regal Gauntlet (CE)|王者护手（CE）
Regal Gauntlets (KC)|王者护手（KC）
Regal Greaves|王者护胫
Regal Greaves (CE)|王者护胫（CE）
Regal Greaves (KC)|王者护胫（KC）
Regal Helm|王者头盔
Regal Helm (CE)|王者头盔（CE）
Regal Helm (KC)|王者头盔（KC）
Regal Plackart|王者胸甲
Regal Plackart (CE)|王者胸甲（CE）
Regal Plackart (KC)|王者胸甲（KC）
Regal Signet Ring|王者印戒
Regenerating Blade|再生之刃
Relic Hood|遗物兜帽
Replica Flower Sword|仿制花剑
Revebrating Lantern|回响提灯
Rhongomiant|伦戈米安特
Ridill|里迪尔
Robes of Dedheim|德德海姆长袍
RockHide|岩皮
Rockworm Larva|岩虫幼虫
Rockworm Lava|岩虫幼虫
Royal Decorations|皇家饰品
Royal Scalpel|皇家手术刀
Salt|盐
Sarcophagus|石棺
Satchel|挎包
Scarab Shell|圣甲虫壳
Scarab Wing|圣甲虫翅
Scell|斯凯尔
Scoopy Club|勺形棍棒
Screaming Brain|尖叫脑
Screaming Oni Mask|尖叫鬼面
Screaming Tanto|尖叫短刀
Scribe's Ink Well|抄写员墨水瓶
Second Heart|第二颗心脏
Sensory Blindfold|感知眼罩
Serrated Fangs|锯齿獠牙
Shadow Fur|暗影毛皮
Shadow Ink Gland|暗影墨腺
Shadow Tentacles|暗影触手
Shank Bone|胫骨
Shark Tongue|鲨鱼舌
Sharp Mandible|锋利下颚
Sharpened Slapper|磨利拍板
Shawl of Determination|决心披肩
Shimmering Halo|微光光环
Shimmering Mane|微光鬃毛
Shining Liver|闪亮肝脏
Shinplate|胫甲
Shrieking Bow|尖啸弓
Sighting Bloom|瞭望花
Silk Sutures|丝线缝合物
Silken Nervous System|丝状神经系统
Silken Skin|丝滑皮肤
Silver Urn|银瓮
Silver Whiskers|银色胡须
Sinew|筋腱
Singing Tongue|歌唱之舌
Skeletal Shards|骸骨碎片
Skull|头骨
Sleeping Virus Flower|沉睡病毒花
Slender Ovule|细长胚珠
Small Appendages|小型附肢
Small Feathers|小羽毛
Small Hand Parasites|小手寄生虫
Small Rageteeth|小型怒齿
Small Sunteeth|小型日牙
Smoldering Horn|阴燃之角
Smoldering Tailspike|阴燃尾刺
Solvent Node|溶剂结节
Spatial Cube|空间立方体
Spiderling|幼蛛
Spinnerets|吐丝器
Spiral Horn|螺旋角
Spiral Pauldron|螺旋肩甲
Splitting Salamander|分裂蝾螈
Sprinter Helm|疾跑者头盔
Stampede Glaive|奔踏长刀
Statue Guts|雕像内脏
Steel Shield|钢盾
Steel Sword|钢剑
Stinging Tendrils|刺痛卷须
Stink Lung|恶臭肺
Stomach|胃
Stomach Lining|胃内膜
Stone Infant|石婴
Stone Ring of Jordan|乔丹之石戒指
Storm Helmet|风暴头盔
Storm Knight Brooch|风暴骑士胸针
Storm Mantle|风暴披风
Storm Sheath|风暴刀鞘
Stout Heart|强健心脏
Stout Hide|厚实皮革
Stout Kidney|强健肾脏
Stout Vertebrae|粗壮脊椎
Sunshark Blubber|日鲨脂肪
Sunshark Bone|日鲨骨
Sunshark Fin|日鲨鳍
Sunstones|太阳石
Sweat|汗液
Sword Beetle|剑甲虫
Sword of Lass|少女之剑
Sword of Silence|沉默之剑
Tail Fat|尾脂
Tail Feathers|尾羽
Teeth Bikini|牙齿比基尼
Teltric Eye Tac|泰尔特里克眼钉
Tempered Axe|淬火斧
Tempered Dagger|淬火匕首
Tempered Spear|淬火长矛
The Weaver|编织者
Thick Web Silk|粗蛛丝
Thunder Maul (CE)|雷霆重锤（CE）
Thundermaul|雷霆重锤
Tiny Ear|小耳朵
Tome of the Twilight|暮光典籍
Tool Belt|工具腰带
Trash Crown|垃圾王冠
Traveller's Wrappings|旅人裹布
Triptych|三联画
Twilight Sword|暮光剑
Unclean Endroot|不洁终根
Underplate Fungus|甲下真菌
Undying Heart|不死之心
Unlaid Eggs|未产之卵
Vault Key Earrings|宝库钥匙耳环
Veined Glass|脉纹玻璃
Veined Wing|脉络之翼
Venom Sac|毒囊
Vermicast|虫粪
Vermin Cage|虫笼
Vespertine Arrow|暮色箭
Vespertine Bow|暮色弓
Vespertine Cello|暮色大提琴
Vespertine Foil|暮色花剑
Vestigial Clitellum|退化环带
Vibrant Lantern|鲜亮提灯
Visionary's Circlet|先知头环
Visionary's Shield|先知之盾
Visionary's Sword|先知之剑
Vivid Bian Pao|鲜艳鞭炮
Vixen Tail|雌狐尾
Vocal Chords|声带
Void Fabric|虚空织物
Warbling Bloom|啼啭之花
Watcher Jelly|守望者胶质
Web Silk|蛛丝
Whispering Whetstone|低语磨刀石
Whistle Tooth|哨牙
White Charcoal|白炭
White Fur|白色毛皮
Wishbone|叉骨
Wrath|愤怒
`.trim().split('\n').map(line=>line.split('|')));
  function label(name){return Object.hasOwn(names,name)?names[name]+' · '+name:name;}
  function matches(name,query){return label(name).toLowerCase().includes(query.trim().toLowerCase());}
  const api={names:Object.freeze(names),label,matches};
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.LootCardNames=api;
})(typeof window==='object'?window:this);
