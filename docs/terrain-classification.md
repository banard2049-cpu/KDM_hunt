# 决战地形分类表

由 `node scripts/terrain-table.cjs` 依据 `data/showdown.json` 生成。

- 地形牌库 **12** 个｜地形牌 **41** 张｜去重后 **31** 种地形｜等级 **92** 个
- 归属判定依据是**卡面左上角印的扩展纹章**，不是 TTS 素材档案路径（见 `scripts/refile-terrain.cjs`）
- `官方·X波`：该波（`group`）的 Boss 会自带这一包地形

## 一、地形牌库（扩展）

| # | 牌库 | 标记 | 张数 | 地形牌 |
|---|---|---|---|---|
| 1 | Black Knight `BlackKnight` | 官方 | 4 | Rubble、Noble Urns、Bell Altar、Elastomer Statue |
| 2 | Core `Core` | 官方 | 21 | 2 Acanthus Plants ×4、2 Tall Grass ×2、Toppled Pillar ×2、Ore Vein ×2、Giant Stone Face ×2、Debris ×2、Bug Patch、3 Stone Columns ×2、Dead Monster、Survivor Corpse ×2、Nightmare Tree |
| 3 | Dragon King `DragonKing` | 官方 | 1 | Obsidian Tower |
| 4 | Dung Beetle Knight `DungBeetleKnight` | 官方 | 1 | Resin Dung Ball |
| 5 | Flower Knight `FlowerKnight` | 官方 | 1 | Flower Patches |
| 6 | Lion God `LionGod` | 官方 | 2 | Sinkhole、Lion Statue |
| 7 | Lonely Tree `LonelyTree` | 官方 | 1 | The Lonely Tree |
| 8 | Spidicules `Spidicules` | 官方 | 2 | Silk Nest、Egg Sacs |
| 9 | Sunstalker `Sunstalker` | 官方 | 1 | 2 Salt Sculptures |
| 10 | White Lion `WhiteLion` | 官方 | 1 | Corpse Lily |
| 11 | Killenium Butcher `KilleniumButcher` | 官方 | 1 | Timeworn Statue |
| 12 | 赌博扩 · 纹章地形 `GamblerChest` | 官方·赌博波 | 5 | Beheaded Corpse、Smog Incense、Blood Pool、Fallen Lantern (Terrain)、Glowing Waypoint |

## 二、逐张地形

| 地形（牌库名） | 图块 | 块数 | 尺寸 | 归属 | 被等级引用 |
|---|---|---|---|---|---|
| Rubble | Rubble | 0 | 1×1 | Black Knight | 黑骑士 · Black Knight·Level 1（指定）；黑骑士 · Black Knight·Level 2（指定）；黑骑士 · Black Knight·Level 3（指定） |
| Noble Urns | Noble Urns | 0 | 1×1 | Black Knight | 黑骑士 · Black Knight·Level 1（固定）；黑骑士 · Black Knight·Level 2（固定）；黑骑士 · Black Knight·Level 3（固定） |
| Bell Altar | Bell Altar | 0 | 1×1 | Black Knight | 黑骑士 · Black Knight·Level 1（固定）；黑骑士 · Black Knight·Level 2（固定）；黑骑士 · Black Knight·Level 3（固定） |
| Elastomer Statue | Elastomer Statue | 0 | 2×2 | Black Knight | 黑骑士 · Black Knight·Level 1（固定）；黑骑士 · Black Knight·Level 2（固定）；黑骑士 · Black Knight·Level 3（固定） |
| 2 Acanthus Plants | Acanthus | 2 | 1×1 | Core | 尖叫羚羊 · Screaming Antelope·Level 1（固定）；尖叫羚羊 · Screaming Antelope·Level 1（固定） 等 12 处 |
| 2 Tall Grass | Tall Grass | 2 | 2×2 | Core | 格姆 · Gorm·Level 1（固定）；格姆 · Gorm·Level 2（固定） 等 14 处 |
| Toppled Pillar | Toppled Pillar | 1 | 1×4 | Core | 食骨者 · Bone Eaters·Level 3（固定）；龙王 · Dragon King·Level 1（固定） 等 8 处 |
| Ore Vein | Ore Vein | 1 | 1×1 | Core | 凤凰 · Phoenix·Golden Eyed King of 1000 Years（指定） |
| Giant Stone Face | Giant Stone Face | 1 | 2×3 | Core | 赌徒 · Gambler·Level 4（指定）；狮之神 · Lion God·Level 1（固定） 等 7 处 |
| Debris | Debris | 1 | 1×1 | Core | —（纯随机池） |
| Bug Patch | Bug Patch | 1 | 1×1 | Core | 蜣螂骑士 · Dung Beetle Knight·Level 1（固定）；蜣螂骑士 · Dung Beetle Knight·Level 2（固定） 等 12 处 |
| 3 Stone Columns | Stone Column | 3 | 1×2 | Core | 甥啖老人 · Atnas·Level 1（固定）；甥啖老人 · Atnas·Level 1（固定） 等 53 处 |
| Dead Monster | Dead Monster | 1 | 2×2 | Core | —（纯随机池） |
| Survivor Corpse | Survivor Corpse | 1 | 1×1 | Core | 猩红鳄鱼 · Crimson Crocodile·Prologue Crimson Crocodile（指定）；猩红鳄鱼 · Crimson Crocodile·Level 1（指定） 等 4 处 |
| Nightmare Tree | Nightmare Tree | 0 | 3×3 | Core | 凤凰 · Phoenix·Level 1（固定）；凤凰 · Phoenix·Level 2（固定） 等 4 处 |
| Obsidian Tower | Obsidian Tower | 1 | 2×2 | Dragon King | —（纯随机池） |
| Resin Dung Ball | Resin Dung Ball | 1 | 2×2 | Dung Beetle Knight | 蜣螂骑士 · Dung Beetle Knight·Level 1（固定）；蜣螂骑士 · Dung Beetle Knight·Level 2（固定） 等 4 处 |
| Flower Patches | Flower Patch | 按等级 | 1×1 | Flower Knight | 花骑士 · Flower Knight·Level 1（指定）；花骑士 · Flower Knight·Level 2（指定）；花骑士 · Flower Knight·Level 3（指定） |
| Sinkhole | Sinkhole | 1 | 3×3 | Lion God | —（纯随机池） |
| Lion Statue | Lion Statue | 1 | 2×2 | Lion God | 狮之神 · Lion God·Level 1（固定）；狮之神 · Lion God·Level 2（固定）；狮之神 · Lion God·Level 3（固定） |
| The Lonely Tree | The Lonely Tree | 1 | 3×3 | Lonely Tree | —（纯随机池） |
| Silk Nest | Silk Nest | 1 | 2×2 | Spidicules | 针突蜘蛛 · Spidicules·Level 1（固定）；针突蜘蛛 · Spidicules·Level 2（固定）；针突蜘蛛 · Spidicules·Level 3（固定） |
| Egg Sacs | Egg Sac | 按等级 | 1×1 | Spidicules | 针突蜘蛛 · Spidicules·Level 1（固定）；针突蜘蛛 · Spidicules·Level 2（固定）；针突蜘蛛 · Spidicules·Level 3（固定） |
| 2 Salt Sculptures | Salt Sculpture | 2 | 1×2 | Sunstalker | 逐日者 · Sunstalker·Level 1（固定）；逐日者 · Sunstalker·Level 2（固定）；逐日者 · Sunstalker·Level 3（固定） |
| Corpse Lily | Corpse Lily | 1 | — | White Lion | —（纯随机池） |
| Timeworn Statue | Timeworn Statue | 1 | 1×1 | Killenium Butcher | —（纯随机池） |
| Beheaded Corpse | Beheaded Corpse | 1 | 1×1 | 赌博扩 · 纹章地形 | —（纯随机池） |
| Smog Incense | Smog Incense | 1 | 2×2 | 赌博扩 · 纹章地形 | 烟雾歌者 · Smog Singers·Level 1（固定）；烟雾歌者 · Smog Singers·Level 2（固定）；烟雾歌者 · Smog Singers·Level 3（固定） |
| Blood Pool | Blood Pool | 1 | 3×3 | 赌博扩 · 纹章地形 | 猩红鳄鱼 · Crimson Crocodile·Prologue Crimson Crocodile（固定）；猩红鳄鱼 · Crimson Crocodile·Level 1（固定） 等 4 处 |
| Fallen Lantern (Terrain) | Fallen Lantern (Terrain) | — | — | 赌博扩 · 纹章地形 | —（纯随机池） |
| Glowing Waypoint | Glowing Waypoint | 1 | 1×1 | 赌博扩 · 纹章地形 | 王 · King·Level 1（固定）；王 · King·Level 2（固定）；王 · King·Level 3（固定） |

## 三、每个等级需要的地形

| Boss · 等级 | 固定 | 指定 | 特殊 | 随机 |
|---|---|---|---|---|
| 甥啖老人 · Atnas·Level 1 | 3 Stone Columns、3 Stone Columns | — | — | 0 |
| 甥啖老人 · Atnas·Level 2 | 3 Stone Columns、3 Stone Columns | — | — | 0 |
| 甥啖老人 · Atnas·Level 3 | 3 Stone Columns、3 Stone Columns | — | — | 0 |
| 黑骑士 · Black Knight·Level 1 | Bell Altar、Elastomer Statue、Noble Urns | Rubble | — | 0 |
| 黑骑士 · Black Knight·Level 2 | Bell Altar、Elastomer Statue、Noble Urns | Rubble | — | 0 |
| 黑骑士 · Black Knight·Level 3 | Bell Altar、Elastomer Statue、Noble Urns | Rubble | — | 0 |
| 食骨者 · Bone Eaters·Level 1 | 3 Stone Columns | — | — | 0 |
| 食骨者 · Bone Eaters·Level 2 | — | — | — | 0 |
| 食骨者 · Bone Eaters·Level 3 | Toppled Pillar、3 Stone Columns | — | — | 0 |
| 食骨者 · Bone Eaters·Level 4 | 3 Stone Columns、3 Stone Columns | — | — | 0 |
| 屠夫 · Butcher·Level 1 | 3 Stone Columns | — | — | 1 |
| 屠夫 · Butcher·Level 2 | 3 Stone Columns | — | — | 1 |
| 屠夫 · Butcher·Level 3 | 3 Stone Columns | — | — | 1 |
| 猩红鳄鱼 · Crimson Crocodile·Prologue Crimson Crocodile | Blood Pool | Survivor Corpse | — | 0 |
| 猩红鳄鱼 · Crimson Crocodile·Level 1 | Blood Pool | Survivor Corpse | — | 1 |
| 猩红鳄鱼 · Crimson Crocodile·Level 2 | Blood Pool | Survivor Corpse | — | 1 |
| 猩红鳄鱼 · Crimson Crocodile·Level 3 | Blood Pool | Survivor Corpse | — | 1 |
| 龙王 · Dragon King·Level 1 | Toppled Pillar、3 Stone Columns | — | — | 0 |
| 龙王 · Dragon King·Level 2 | Toppled Pillar、3 Stone Columns | — | — | 0 |
| 龙王 · Dragon King·Level 3 | Toppled Pillar、3 Stone Columns | — | — | 0 |
| 龙王 · Dragon King·Death of the Dragon King | Toppled Pillar、3 Stone Columns | — | — | 0 |
| 蜣螂骑士 · Dung Beetle Knight·Level 1 | Resin Dung Ball、3 Stone Columns、Bug Patch | — | — | 0 |
| 蜣螂骑士 · Dung Beetle Knight·Level 2 | Resin Dung Ball、3 Stone Columns、Bug Patch | — | — | 0 |
| 蜣螂骑士 · Dung Beetle Knight·Level 3 | Resin Dung Ball、3 Stone Columns、Bug Patch | — | — | 0 |
| 蜣螂骑士 · Dung Beetle Knight·The Old Master | Resin Dung Ball、3 Stone Columns、Bug Patch | — | — | 0 |
| 花骑士 · Flower Knight·Level 1 | — | Flower Patches | Fairy Ring | 1 |
| 花骑士 · Flower Knight·Level 2 | — | Flower Patches | Fairy Ring | 1 |
| 花骑士 · Flower Knight·Level 3 | — | Flower Patches | Fairy Ring | 1 |
| 赌徒 · Gambler·Level 4 | 3 Stone Columns、3 Stone Columns | Giant Stone Face | — | 0 |
| 神之手 · Godhand·Level 4 | — | — | — | 0 |
| 金烟骑士 · Gold Smoke Knight·Level 1 | — | — | — | 3 |
| 格姆 · Gorm·Level 1 | 2 Tall Grass | — | — | 2 |
| 格姆 · Gorm·Level 2 | 2 Tall Grass | — | — | 2 |
| 格姆 · Gorm·Level 3 | 2 Tall Grass | — | — | 2 |
| 王 · King·Level 1 | Glowing Waypoint | — | — | 0 |
| 王 · King·Level 2 | Glowing Waypoint | — | — | 0 |
| 王 · King·Level 3 | Glowing Waypoint | — | — | 0 |
| 王之禁卫 · King's Man·Level 1 | 3 Stone Columns | — | — | 2 |
| 王之禁卫 · King's Man·Level 2 | 3 Stone Columns | — | — | 2 |
| 王之禁卫 · King's Man·Level 3 | 3 Stone Columns | — | — | 2 |
| 千宰屠夫 · Killenium Butcher·Killenium Butcher 2 | 3 Stone Columns | — | — | 1 |
| 千宰屠夫 · Killenium Butcher·Killenium Butcher 3 | 3 Stone Columns | — | — | 1 |
| 狮骑士 · Lion Knight·Level 1 | — | — | — | 0 |
| 狮骑士 · Lion Knight·Level 2 | — | — | Balcony (Terrain)、Horn (Terrain)、Stage (Terrain)、Throne (Terrain) | 0 |
| 狮骑士 · Lion Knight·Level 3 | — | — | Balcony (Terrain)、Horn (Terrain)、Stage (Terrain)、Throne (Terrain) | 0 |
| 狮之神 · Lion God·Level 1 | 3 Stone Columns、Toppled Pillar、Giant Stone Face、Lion Statue | — | — | 0 |
| 狮之神 · Lion God·Level 2 | 3 Stone Columns、Toppled Pillar、Giant Stone Face、Lion Statue | — | — | 0 |
| 狮之神 · Lion God·Level 3 | 3 Stone Columns、Toppled Pillar、Giant Stone Face、Lion Statue | — | — | 0 |
| 孤独之树 · Lonely Tree·Level 1 | 2 Tall Grass | — | — | 0 |
| 孤独之树 · Lonely Tree·Level 2 | 2 Tall Grass | — | — | 0 |
| 孤独之树 · Lonely Tree·Level 3 | 2 Tall Grass | — | — | 0 |
| 猎人者 · Manhunter·Level 1 | 3 Stone Columns、3 Stone Columns | — | — | 1 |
| 猎人者 · Manhunter·Level 2 | 3 Stone Columns、3 Stone Columns | — | — | 1 |
| 猎人者 · Manhunter·Level 3 | 3 Stone Columns、3 Stone Columns | — | — | 1 |
| 猎人者 · Manhunter·Level 4 | 3 Stone Columns、3 Stone Columns | — | — | 1 |
| 凤凰 · Phoenix·Level 1 | Nightmare Tree | — | — | 2 |
| 凤凰 · Phoenix·Level 2 | Nightmare Tree | — | — | 2 |
| 凤凰 · Phoenix·Level 3 | Nightmare Tree | — | — | 2 |
| 凤凰 · Phoenix·Golden Eyed King of 1000 Years | Nightmare Tree | Ore Vein、Bug Patch | — | 2 |
| 尖叫羚羊 · Screaming Antelope·Level 1 | 2 Acanthus Plants、2 Acanthus Plants、2 Acanthus Plants、Bug Patch | — | — | 2 |
| 尖叫羚羊 · Screaming Antelope·Level 2 | 2 Acanthus Plants、2 Acanthus Plants、2 Acanthus Plants、Bug Patch | — | — | 2 |
| 尖叫羚羊 · Screaming Antelope·Level 3 | 2 Acanthus Plants、2 Acanthus Plants、2 Acanthus Plants、Bug Patch | — | — | 2 |
| 尖叫羚羊 · Screaming Antelope·Mad Steed | 2 Acanthus Plants、2 Acanthus Plants、2 Acanthus Plants、Bug Patch | — | — | 4 |
| 瘦长人 · Slenderman·Level 1 | 3 Stone Columns、Bug Patch | — | — | 1 |
| 瘦长人 · Slenderman·Level 2 | 3 Stone Columns、Bug Patch | — | — | 1 |
| 瘦长人 · Slenderman·Level 3 | 3 Stone Columns、Bug Patch | — | — | 1 |
| 烟雾歌者 · Smog Singers·Level 1 | Smog Incense | — | — | 1 |
| 烟雾歌者 · Smog Singers·Level 2 | Smog Incense | — | — | 1 |
| 烟雾歌者 · Smog Singers·Level 3 | Smog Incense | — | — | 1 |
| 针突蜘蛛 · Spidicules·Level 1 | Silk Nest、Egg Sacs | — | — | 2 |
| 针突蜘蛛 · Spidicules·Level 2 | Silk Nest、Egg Sacs | — | — | 2 |
| 针突蜘蛛 · Spidicules·Level 3 | Silk Nest、Egg Sacs | — | — | 2 |
| 逐日者 · Sunstalker·Level 1 | 3 Stone Columns、3 Stone Columns、2 Salt Sculptures | — | Sun Dial | 0 |
| 逐日者 · Sunstalker·Level 2 | 3 Stone Columns、3 Stone Columns、2 Salt Sculptures | — | Sun Dial | 0 |
| 逐日者 · Sunstalker·Level 3 | 3 Stone Columns、3 Stone Columns、2 Salt Sculptures | — | Sun Dial | 0 |
| 逐日者 · Sunstalker·The Great Devourer | 3 Stone Columns、3 Stone Columns | — | Sun Dial | 0 |
| 掌控者 · The Hand·Level 1 | Giant Stone Face | 3 Stone Columns | — | 1 |
| 掌控者 · The Hand·Level 2 | Giant Stone Face | 3 Stone Columns | — | 1 |
| 掌控者 · The Hand·Level 3 | Giant Stone Face | 3 Stone Columns | — | 1 |
| The Tyrant·Level 1 | — | — | Gate | 1 |
| The Tyrant·Level 2 | — | — | Gate | 1 |
| The Tyrant·Level 3 | — | — | Gate | 1 |
| 守望者 · Watcher·Level 1 | — | — | — | 0 |
| White Lion · WhiteBox·Young Lion | 2 Tall Grass | — | — | 2 |
| 白色巨狮 · White Gigalion·Level 2 | — | 2 Tall Grass | — | 2 |
| 白色巨狮 · White Gigalion·Level 3 | — | 2 Tall Grass | — | 2 |
| 白狮 · White Lion·Prologue | — | — | — | 0 |
| 白狮 · White Lion·Level 1 | 2 Tall Grass | — | — | 2 |
| 白狮 · White Lion·Level 2 | 2 Tall Grass | — | — | 2 |
| 白狮 · White Lion·Level 3 | 2 Tall Grass | — | — | 2 |
| 白狮 · White Lion·Beast of Sorrow | 2 Tall Grass | — | — | 2 |
| 白狮 · White Lion·Great Golden Cat | 2 Tall Grass | — | — | 2 |

## 四、有地形规则卡但没有归入任何牌库

无。规则表里的每一条都能在某个牌库里找到对应卡牌。

## 五、牌库卡名与规则表名字不一致（正常，仅供检索）



## 六、只有图块尺寸、没有地形规则卡（App 里用不到）
