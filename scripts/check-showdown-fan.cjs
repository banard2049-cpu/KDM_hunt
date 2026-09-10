// The random terrain deck is an explicit card list. It must default to 基础
// only, never leak fan terrain, and be editable card by card in the host UI.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/showdown.json'), 'utf8'));
const E = require('../assets/showdown-engine.js');

const TEAL = ['Diseased Corpse', 'Crystal Corpse', 'Stone Stair', 'Boulders', 'Lantern Pedestals'];
const ORANGE = ['Hovel', '2 Cowering Survivors'];
const JD = ['Vomit Pools'];
const CHEST = ['Beheaded Corpse', 'Smog Incense', 'Blood Pool', 'Fallen Lantern (Terrain)', 'Glowing Waypoint'];
const CHARROGG = ['Lava Pool'];
const FAN = ['FanTerrainTeal', 'FanTerrainOrange', 'FanTerrainJd'];
const names = id => data.expansions.find(e => e.id === id).cards.map(c => c.name);
const index = E.cardIndex(data);
const nameOf = id => index.get(id).name;

assert.deepEqual(E.fanExpansions(data), FAN, 'the three emblem-identified fan terrain packs must be the only fan content');
for (const id of FAN) assert.equal(E.isFanExpansion(data, id), true);
for (const id of ['Core', 'WhiteLion', 'DragonKing', 'BlackKnight', 'KilleniumButcher', 'HarvesterWorm', 'DrifterKnight', 'AllisonTheTwilightKnight', 'StormKnight', 'KingsCoin', 'GamblerChest', 'CharroggTerrain'])
  assert.equal(E.isFanExpansion(data, id), false, id + ' must not be treated as fan content');
assert.deepEqual(names('FanTerrainTeal'), TEAL);
assert.deepEqual(names('FanTerrainOrange'), ORANGE);
assert.deepEqual(names('FanTerrainJd'), JD);
assert.deepEqual(names('GamblerChest'), CHEST);
assert.deepEqual(names('CharroggTerrain'), CHARROGG);
assert.equal(data.expansions.find(e => e.id === 'GamblerChest').group, '赌博', "Gambler's Chest terrain belongs to the 赌博 wave");
const core = names('Core');
for (const name of [...TEAL, ...ORANGE, ...JD, ...CHEST, ...CHARROGG, 'Glowing Corpse']) assert.ok(!core.includes(name), name + ' must no longer sit in the Core deck');

// ---- default deck = 基础 only, plus the copies a level's rules force on board
const fanIds = new Set(data.expansions.filter(e => FAN.includes(e.id)).flatMap(e => e.cards.map(c => c.id)));
const lion = E.create(data, 'white-lion', 'level-2', 'fan-a');
assert.deepEqual(lion.expansions, ['Core'], 'the default pool must be 基础 only');
assert.equal(lion.pool.length, core.length);
for (const boss of data.bosses) for (const level of boss.levels) {
  const probe = E.create(data, boss.id, level.id, 'probe'), need = E.requiredCounts(level);
  const fanInPool = probe.pool.filter(id => fanIds.has(id)), counts = new Map();
  for (const id of fanInPool) {
    assert.ok(need.has(nameOf(id)), 'only terrain this level forces may be fan: ' + boss.id + '/' + level.id);
    counts.set(nameOf(id), (counts.get(nameOf(id)) || 0) + 1);
  }
  for (const [name, n] of counts) assert.ok(n <= need.get(name), 'no fan copies beyond the forced ones: ' + name);
  assert.deepEqual(probe.drawWarnings, [], 'default pool must still cover the level rules: ' + boss.id + '/' + level.id);
}
// Forced terrain from a fan pack is the only fan content that shows up.
const sisters = E.create(data, 'forsaker-sisters', 'level-1', 'fan-sis');
assert.deepEqual([...new Set(sisters.pool.map(nameOf))].filter(n => ORANGE.includes(n)), ORANGE);
assert.ok(sisters.pool.every(id => !TEAL.includes(nameOf(id)) && !JD.includes(nameOf(id))));
// Official wave / boss terrain likewise comes along only when required.
assert.deepEqual([...new Set(E.create(data, 'king', 'level-1', 'k').pool.map(nameOf))].filter(n => CHEST.includes(n)), ['Glowing Waypoint']);
assert.deepEqual([...new Set(E.create(data, 'charrogg', 'level-1', 'c').pool.map(nameOf))].filter(n => CHARROGG.includes(n)), CHARROGG);
assert.equal(E.create(data, 'white-lion', 'level-2', 'w').pool.some(id => CHEST.includes(nameOf(id)) || CHARROGG.includes(nameOf(id))), false);

// ---- single cards can be added to (or dropped from) the pool
const lily = data.expansions.find(e => e.id === 'WhiteLion').cards[0].id;
const withLily = E.draw(data, { ...lion, pool: [...lion.pool, lily], expansions: E.groupsOf(data, [...lion.pool, lily]) }, () => 0.5);
assert.deepEqual(withLily.expansions, ['Core', 'WhiteLion']);
assert.ok(withLily.pool.includes(lily));
const fanCard = data.expansions.find(e => e.id === 'FanTerrainTeal').cards[0].id;
let hit = false;
for (let i = 0; i < 400 && !hit; i++) {
  const s = E.draw(data, { ...lion, pool: [...lion.pool, fanCard], expansions: E.groupsOf(data, [...lion.pool, fanCard]) });
  if (s.random.some(c => c.id === fanCard)) hit = true;
}
assert.ok(hit, 'a single fan card must be drawable once explicitly added');
assert.throws(() => E.draw(data, { ...lion, pool: [] }), /不足/);
// Saved battles from before the pool existed keep validating and drawing.
const legacy = { ...lion };
delete legacy.pool;
legacy.expansions = ['Core', 'WhiteLion'];
E.validate(data, legacy);
assert.equal(E.draw(data, legacy, () => 0.5).id, 'fan-a');
assert.throws(() => E.validate(data, { ...lion, pool: ['nope'] }), /损坏/);

// --- minimal DOM so the host panel can be exercised the way a browser runs it
function stub(id){return {id,style:{},hidden:false,disabled:false,checked:false,value:'',textContent:'',_html:'',_listeners:{},_appended:[],
  prepend(n){this._appended.push(n)},
  append(n){this._appended.push(n)},
  setAttribute(k,v){this[k]=v},
  addEventListener(t,fn){this._listeners[t]=fn},
  querySelectorAll(){return []}}}
const nodes = new Map();
const el = id => { if (!nodes.has(id)) nodes.set(id, stub(id)); return nodes.get(id); };
const expNode = el('sdPoolGroups');
Object.defineProperty(expNode, 'innerHTML', {
  get(){ return this._html; },
  set(v){ this._html = String(v);
    this._boxes = [...this._html.matchAll(/<input type="checkbox" data-pool-card="([^"]+)"( checked)?/g)].map(m => ({ value: m[1], checked: !!m[2] })); },
});
expNode.querySelectorAll = sel => sel.includes('data-pool-card') ? expNode._boxes.slice() : [];
const document = { getElementById: el, createElement: () => stub('page'), querySelector: sel => el(sel.includes('loot-reward') ? 'lootRewardModule' : 'fallbackHost') };
const memory = new Map();
const localStorage = { getItem: k => memory.has(k) ? memory.get(k) : null, setItem: (k, v) => memory.set(k, String(v)), removeItem: k => memory.delete(k) };
const fetch = async url => {
  const u = String(url);
  if (u.includes('showdown.json')) return { ok: true, json: async () => data };
  if (u.endsWith('/start')) return { ok: true, json: async () => ({ active: true, urls: ['http://192.168.1.20:8799/d/'] }) };
  return { ok: true, json: async () => ({ active: false }) };
};
// Stand-in for the browser's popup machinery.
const opened = [];
const window = {
  ShowdownEngine: E,
  ShowdownView: { esc: s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])) },
  KDMLoot: { currentBattle: async () => null, show(){} },
  localStorage,
  open(url, name){
    const reused = opened.find(w => !w.closed && w.name === name);
    if (reused) { if (url && url !== 'about:blank') reused.location.href = url; return reused; }
    const w = { name, closed: false, location: { href: url }, focus(){ w.focused = true; }, close(){ w.closed = true; } };
    opened.push(w);
    return w;
  },
};
// The editor loads spritesheet sizes through Image(); report a usable size.
class FakeImage { set src(v){ this.naturalWidth = 1000; this.naturalHeight = 1400; this._src = v; } get src(){ return this._src; } }
vm.runInContext(fs.readFileSync(path.join(root, 'assets/showdown-ui.js'), 'utf8'), vm.createContext({ window, document, localStorage, fetch, console, Image: FakeImage,
  location: { protocol: 'http:', hostname: '127.0.0.1', port: '8799', origin: 'http://127.0.0.1:8799' } }));
const saved = () => JSON.parse(memory.get('kdm-showdown-v1'));
const settle = () => new Promise(resolve => setImmediate(resolve));
// Fire the delegated change event the way a click on one card would.
const clickCard = (value, checked) => {
  const card = { value, checked, classList: { toggle(){} }, closest: () => card };
  expNode._listeners.change({ target: card });
};

(async () => {
  // The two hosts: second-screen controls at the bottom of the left sidebar,
  // the terrain module nested inside the battle module of the right column.
  assert.equal(el('lootSidebar')._appended.map(n => n.id).join(), 'showdownControls');
  assert.equal(el('lootRewardModule')._appended.map(n => n.id).join(), 'sdTerrainPanel', 'the terrain module belongs inside the reward module');
  assert.equal(el('lootPage')._appended.length, 0, 'nothing is appended to the column itself');
  assert.match(el('lootSidebar')._appended[0].innerHTML, /第二屏幕控制/);
  assert.match(el('lootRewardModule')._appended[0].innerHTML, /重抽地形/);
  assert.equal(el('lootSidebar')._appended[0].innerHTML.includes('sdReroll'), false, 'reroll must not live in the sidebar');
  assert.equal(el('lootRewardModule')._appended[0].innerHTML.includes('sdStop'), false, 'the second-screen stop button must not live in the terrain module');
  assert.equal(el('lootRewardModule')._appended[0].className, 'sd-host-controls sd-terrain-panel', 'nested module must not draw a second card');
  await settle(); await settle();
  await window.KDMShowdown.battle({ id: 'b1', bossId: 'white-lion', levelId: 'level-2' });
  assert.equal(el('sdPoolCount').textContent, String(core.length), 'the editor opens on the 基础 deck');
  assert.equal(el('sdExpSummary').textContent, ' · 粉丝扩已折叠');
  assert.equal(expNode._html.includes('Diseased Corpse'), false, 'fan cards must be folded away by default');
  assert.ok(expNode._html.includes('2 Tall Grass'), 'core cards must be listed');
  assert.equal((expNode._html.match(/data-pool-group=/g) || []).length, data.expansions.length - FAN.length, 'every non-fan pack is listed, but nothing but 基础 is ticked');
  assert.equal(expNode._html.includes('White Lion'), true, 'other packs stay visible so single cards can be added');
  assert.equal(saved().sessions.b1.pool.length, core.length);

  // The fan packs are opted into from the checkbox in the loot sidebar, which
  // drives the terrain module through KDMShowdown.terrain.
  const fanBox = el('sdFanToggle');
  const fanMarkup = el('lootRewardModule')._appended[0].innerHTML;
  assert.equal(fanMarkup.includes('sdFanToggle'), false, 'the checkbox must no longer sit in the terrain row');
  assert.equal(fanBox.checked, false, 'fan terrain stays off by default');

  await window.KDMShowdown.terrain(true);
  assert.equal(fanBox.checked, true, 'the checkbox follows the terrain module');
  assert.ok(expNode._html.includes('Diseased Corpse'), 'the checkbox must reveal fan cards');
  assert.match(el('sdFanHint').textContent, /勾选单张卡即可加入/);
  assert.equal((expNode._html.match(/data-pool-group=/g) || []).length, data.expansions.length, 'every pack is listed once fan is on');

  // Adding one single fan card must add just that card, not its whole pack.
  clickCard(fanCard, true);
  const afterAdd = saved().sessions.b1;
  assert.ok(afterAdd.pool.includes(fanCard), 'the ticked card joins the pool');
  assert.deepEqual(afterAdd.expansions, ['Core', 'FanTerrainTeal']);
  assert.equal(afterAdd.pool.filter(id => E.ownerOf(data, id) === 'FanTerrainTeal').length, 1);
  assert.equal(el('sdPoolCount').textContent, String(core.length + 1));

  clickCard(fanCard, false);
  assert.equal(saved().sessions.b1.pool.includes(fanCard), false, 'unticking removes it again');

  clickCard(fanCard, true);
  await window.KDMShowdown.terrain(false);
  assert.equal(fanBox.checked, false, 'unticking folds the fan terrain away again');
  assert.equal(saved().sessions.b1.pool.includes(fanCard), false, 'folding fan content drops unrequired fan cards');
  assert.equal(expNode._html.includes('Diseased Corpse'), false);

  el('sdPoolNone').onclick();
  assert.equal(el('sdPoolCount').textContent, '0');
  assert.equal(saved().sessions.b1.pool.length, 0);
  el('sdPoolCore').onclick();
  assert.equal(el('sdPoolCount').textContent, String(core.length), '「只留基础」restores the default deck');

  // A fan level keeps the forced copies and says so.
  await window.KDMShowdown.battle({ id: 'b2', bossId: 'forsaker-sisters', levelId: 'level-1' });
  assert.ok(expNode._html.includes('Hovel'), 'the terrain a fan level needs must stay listed');
  assert.ok(expNode._html.includes('本关需要'));
  assert.match(el('sdFanHint').textContent, /本关规则需要/);
  assert.equal(saved().sessions.b2.pool.filter(id => ORANGE.includes(nameOf(id))).length, 2);

  // The header button opens the second screen in its own window by itself.
  assert.equal(el('sdOpenTop').disabled, false, 'the second screen button unlocks once a battle is running');
  assert.equal(el('sdShareInfo').hidden, true, 'a closed second screen prints no address');
  el('sdOpenTop').onclick();
  await settle(); await settle();
  assert.equal(opened.length, 1, 'clicking must open one new window');
  assert.equal(opened[0].location.href, 'http://127.0.0.1:8799/d/', 'the new window must land on the fixed short link');
  assert.ok(opened[0].location.href.length <= 30, 'the link must stay short: ' + opened[0].location.href);
  assert.equal(el('sdStop').hidden, false, 'the stop control appears in the sidebar panel');
  // The open second screen prints the address other devices type, under the panel
  // in the left sidebar: the LAN link itself, never the host's loopback window.
  const uiSource = fs.readFileSync(path.join(root, 'assets/showdown-ui.js'), 'utf8');
  assert.match(uiSource, /<p id="sdBattleLabel">[^<]*<\/p><p id="sdShareInfo" class="sd-share-address" hidden aria-label="第二屏幕地址"><span id="sdShareUrl"><\/span><\/p>/, 'the address row sits directly under the battle line, prints nothing but the link, and starts hidden');
  assert.match(uiSource, /function shareUrls\(\)\{return \(share\?\.urls\|\|\[\]\)\.filter\(Boolean\);\}/, 'the printed addresses are the LAN links the host handed out');
  assert.equal(/sdQR|qrcode/.test(uiSource), false, 'the panel prints the address, it still draws no QR code');
  assert.equal(el('sdShareInfo').hidden, false, 'the address shows once the second screen is open');
  assert.equal(el('sdShareUrl').innerHTML, '<code>http://192.168.1.20:8799/d/</code>', 'and it is the address another device opens, escaped and laid out one per line');
  el('sdOpenTop').onclick();
  await settle(); await settle();
  assert.equal(opened.length, 1, 'clicking again reuses the existing window');
  el('sdStop').onclick();
  await settle(); await settle();
  assert.equal(el('sdStop').hidden, true);
  assert.equal(el('sdShareInfo').hidden, true, 'stopping takes the address away again');
  assert.equal(opened[0].closed, true, 'stopping must close the second screen window');

  console.log('Passed: random terrain pool defaults to 基础, never leaks fan terrain, is editable one card at a time, and the header button opens the second screen itself.');
})().catch(e => { console.error(e); process.exit(1); });
