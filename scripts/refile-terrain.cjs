// The TTS mod's "Core" terrain deck also holds cards that were printed with
// OTHER content's emblem. The emblem printed in the top-left corner of the card
// art is the authoritative marker, so this module re-files the misplaced cards
// out of Core:
//
//   青色纹章        → fan-made terrain pack      (hidden unless the player opts in)
//   橙色纹章        → fan-made terrain pack      (hidden unless the player opts in)
//   黑底「JD SPECIAL」→ fan-made terrain pack      (hidden unless the player opts in)
//   棕色纹章 / 白玫瑰 → 赌博扩 (Gambler's Chest, official) terrain
//   粉色纹章        → Harvester Worm terrain
//   无色蓝缎带      → Charrogg's own terrain
//
// Card objects keep their original ids so existing saved battles stay valid.
const FAN_PACKS = [
  { id: 'FanTerrainTeal', name: '粉丝扩 · 青色纹章地形', cards: ['Diseased Corpse', 'Crystal Corpse', 'Stone Stair', 'Boulders', 'Lantern Pedestals'] },
  { id: 'FanTerrainOrange', name: '粉丝扩 · 橙色纹章地形', cards: ['Hovel', '2 Cowering Survivors'] },
  { id: 'FanTerrainJd', name: '粉丝扩 · JD SPECIAL 纹章地形', cards: ['Vomit Pools'] },
];
// Official Gambler's Chest terrain. `group` ties the pack to the bosses of the
// same wave, so its deck travels with them instead of with every Core hunt.
const CHEST_PACK = { id: 'GamblerChest', name: '赌博扩 · 纹章地形', group: '赌博', cards: ['Beheaded Corpse', 'Smog Incense', 'Blood Pool', 'Fallen Lantern (Terrain)', 'Glowing Waypoint'] };
// Charrogg's own board terrain; only its levels can be set up with it.
const BOSS_PACKS = [{ id: 'CharroggTerrain', name: 'Charrogg · 专属地形', cards: ['Lava Pool'] }];
const REHOME = { 'Glowing Corpse': 'HarvesterWorm' };

function refileTerrain(data) {
  const core = (data.expansions || []).find(e => e.id === 'Core');
  if (!core) return data;
  const take = name => { const i = core.cards.findIndex(c => c.name === name); return i >= 0 ? core.cards.splice(i, 1)[0] : null; };
  const pack = spec => {
    let expansion = data.expansions.find(e => e.id === spec.id);
    if (!expansion) {
      expansion = { id: spec.id, name: spec.name, cards: [] };
      if (spec.group) expansion.group = spec.group;
      if (spec.fan) expansion.fan = true;
      data.expansions.push(expansion);
    }
    for (const name of spec.cards) { const card = take(name); if (card) expansion.cards.push(card); }
  };
  for (const spec of [...FAN_PACKS.map(p => ({ ...p, fan: true })), CHEST_PACK, ...BOSS_PACKS]) pack(spec);
  for (const [name, id] of Object.entries(REHOME)) {
    const expansion = data.expansions.find(e => e.id === id);
    if (!expansion) continue;
    const card = take(name); if (card) expansion.cards.push(card);
  }
  return data;
}

module.exports = refileTerrain;
module.exports.FAN_PACKS = FAN_PACKS;
module.exports.CHEST_PACK = CHEST_PACK;
module.exports.BOSS_PACKS = BOSS_PACKS;
module.exports.REHOME = REHOME;

if (require.main === module) {
  const fs = require('node:fs'), path = require('node:path');
  const file = path.join(path.resolve(__dirname, '..'), 'data/showdown.json');
  const data = refileTerrain(JSON.parse(fs.readFileSync(file, 'utf8')));
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  console.log('Core now holds ' + data.expansions.find(e => e.id === 'Core').cards.length + ' terrain cards.');
  for (const e of data.expansions) if (e.fan || e.group) console.log((e.fan ? 'fan  ' : 'group') + ' ' + e.id + ': ' + e.cards.map(c => c.name).join(', '));
}
