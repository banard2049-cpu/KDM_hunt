// 「显示初始位置」 is a button on the left of the terrain row, ticked on by default:
// it drives the whole setup highlight — the blue legal start squares, the monster's
// footprint and the pinned terrain — on the host board and the second screen alike.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const uiSource = fs.readFileSync(path.join(root, 'assets/showdown-ui.js'), 'utf8');
const lootSource = fs.readFileSync(path.join(root, 'assets/loot-ui.js'), 'utf8');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/showdown.json'), 'utf8'));
const E = require('../assets/showdown-engine.js');

// ---- the button lives in the terrain row, left of 选择地形
assert.equal(html.includes('sdStartToggle'), false, 'the switch must no longer sit in the loot sidebar');
assert.equal(lootSource.includes('sdStartToggle'), false, 'the loot page must not wire a control it does not host');
const terrainMarkup = (uiSource.match(/terrain\.innerHTML=`([\s\S]*?)`;/) || [])[1] || '';
assert.match(terrainMarkup, /<button id="sdStartToggle" type="button" aria-pressed="true">显示初始位置<\/button><button id="sdTerrain">选择地形<\/button>/, 'the button leads the terrain row and starts pressed');
assert.ok(terrainMarkup.indexOf('sdStartToggle') < terrainMarkup.indexOf('id="sdTerrain"'), 'the button must sit to the left of 选择地形');

// ---- the snapshot the second screen reads
const battle = E.create(data, 'white-lion', 'level-2', 'start-a');
assert.equal(E.snapshot(data, battle).display.showStart, true, 'the highlight is on by default');
assert.equal(E.snapshot(data, { ...battle, display: { ...battle.display, showStart: false } }).display.showStart, false, 'hiding it travels in the snapshot');
const { level } = E.context(data, battle);
assert.ok((level.zones || []).reduce((n, z) => n + z.cells.length, 0) > 0, 'the level must actually have legal start cells');
assert.ok((level.figures || []).length > 0, 'the level must actually place a monster');
assert.ok([...level.fixed, ...level.special].some(t => (t.positions || []).length), 'the level must actually pin terrain down');

// ---- the board renderer behind both screens
const viewWindow = { ShowdownTerrain: { version: 'test', byId: {}, byName: {} } };
viewWindow.window = viewWindow;
vm.runInContext(fs.readFileSync(path.join(root, 'assets/showdown-view.js'), 'utf8'), vm.createContext(viewWindow));
const viewTarget = id => ({ id, innerHTML: '', querySelectorAll: () => [], style: { setProperty(){}, getPropertyValue(){ return ''; } } });
const shown = viewTarget('shown');
const hidden = viewTarget('hidden');
viewWindow.ShowdownView.render(shown, E.snapshot(data, battle));
viewWindow.ShowdownView.render(hidden, E.snapshot(data, { ...battle, display: { ...battle.display, showStart: false } }));
const marks = {
  zones: 'fill="#459cff"',                 // blue legal start squares
  monster: 'class="sd-monster-piece"',     // monster footprint pieces
  terrain: 'class="sd-terrain-highlight"', // fixed / special terrain the rules place
  legend: '全部合法狩猎者起始格',
};
for (const [name, mark] of Object.entries(marks)) assert.ok(shown.innerHTML.includes(mark), 'the default board must show the ' + name);
for (const [name, mark] of Object.entries(marks)) assert.equal(hidden.innerHTML.includes(mark), false, 'hiding must drop the ' + name);
assert.match(hidden.innerHTML, /初始位置已隐藏/, 'the hidden board keeps an honest accessible label');
assert.match(shown.innerHTML, /蓝色合法起始区域/, 'the shown board describes what it draws');

// ---- host module: default on, button flips, snapshot + publish follow
function stub(id){return {id,style:{},hidden:false,disabled:false,checked:false,value:'',textContent:'',_html:'',_listeners:{},_appended:[],_attrs:{},
  prepend(n){this._appended.push(n)},
  append(n){this._appended.push(n)},
  setAttribute(k,v){this._attrs[k]=String(v)},
  getAttribute(k){return this._attrs[k]},
  addEventListener(t,fn){this._listeners[t]=fn},
  querySelectorAll(){return []},
  set innerHTML(v){this._html=String(v)},
  get innerHTML(){return this._html}}}
const nodes = new Map();
const el = id => { if (!nodes.has(id)) nodes.set(id, stub(id)); return nodes.get(id); };
const published = [];
const document = {
  getElementById: el,
  createElement: () => stub('created'),
  querySelector: sel => el(sel.includes('loot-reward') ? 'lootRewardModule' : 'fallbackHost'),
  body: { classList: { toggle(){}, remove(){} } },
};
const memory = new Map();
const localStorage = { getItem: k => memory.has(k) ? memory.get(k) : null, setItem: (k, v) => memory.set(k, String(v)), removeItem: k => memory.delete(k) };
const fetch = async (url, options) => {
  const u = String(url);
  if (u.includes('showdown.json')) return { ok: true, json: async () => data };
  if (u.endsWith('/start') || u.endsWith('/status')) return { ok: true, json: async () => ({ active: true, urls: ['http://192.168.1.20:8799/d/'] }) };
  if (u.endsWith('/publish')) { published.push(JSON.parse(options.body).snapshot); return { ok: true, json: async () => ({ ok: true }) }; }
  return { ok: true, json: async () => ({ active: false }) };
};
const window = {
  ShowdownEngine: E,
  ShowdownView: { esc: s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])), render(){}, layout(){} },
  KDMLoot: { currentBattle: async () => null, show(){} },
  localStorage,
};
class FakeImage { set src(v){ this.naturalWidth = 1000; this.naturalHeight = 1400; this._src = v; } get src(){ return this._src; } }
vm.runInContext(uiSource, vm.createContext({ window, document, localStorage, fetch, console, Image: FakeImage,
  location: { protocol: 'http:', hostname: '127.0.0.1', port: '8799', origin: 'http://127.0.0.1:8799' } }));
const settle = async () => { for (let i = 0; i < 4; i++) await new Promise(resolve => setImmediate(resolve)); };
const terrainPanel = () => el('lootRewardModule')._appended[0];
assert.equal(el('lootRewardModule')._appended.map(n => n.id).join(), 'sdTerrainPanel', 'the terrain module still lands in the reward module');
assert.match(terrainPanel().innerHTML, /sdStartToggle/, 'the button is part of the terrain module, not the sidebar');

(async () => {
  await settle();
  const button = el('sdStartToggle');
  const saved = () => JSON.parse(memory.get('kdm-showdown-official-v1'));

  await window.KDMShowdown.battle({ id: 'sb1', bossId: 'white-lion', levelId: 'level-2' });
  await settle();
  const before = window.KDMShowdown.snapshot({ battleId: 'sb1' });
  assert.equal(before.display.showStart, true, 'a fresh battle shows the initial positions');
  assert.equal(button.getAttribute('aria-pressed'), 'true', 'the button starts pressed: the highlight is on');
  assert.equal(button.textContent, '隐藏初始位置', 'the pressed button offers to hide the highlight');
  assert.equal(button.disabled, false, 'the button is usable once a battle is running');
  assert.notEqual(saved().showStart, false, 'hiding is not the remembered default');
  published.length = 0;

  button.onclick();
  await settle();
  const off = window.KDMShowdown.snapshot({ battleId: 'sb1' });
  assert.equal(saved().showStart, false, 'hiding the highlight is remembered');
  assert.equal(off.display.showStart, false, 'the battle carries the flag');
  assert.ok(off.revision > before.revision, 'the revision moves so the second screen redraws');
  assert.equal(published.at(-1)?.display.showStart, false, 'the host publishes the hidden board to the second screen');
  assert.equal(button.textContent, '显示初始位置', 'the button now offers to bring it back');
  assert.equal(button.getAttribute('aria-pressed'), 'false');

  button.onclick();
  await settle();
  const on = window.KDMShowdown.snapshot({ battleId: 'sb1' });
  assert.equal(on.display.showStart, true, 'pressing again shows them');
  assert.ok(on.revision > off.revision, 'and pushes another revision');
  assert.equal(published.at(-1)?.display.showStart, true, 'publishing the highlight again');
  assert.equal(saved().showStart, true, 'the preference follows the button');

  // A battle saved before the button existed keeps the highlight on.
  const legacy = E.create(data, 'white-lion', 'level-2', 'legacy-a');
  delete legacy.display;
  assert.equal(E.snapshot(data, legacy).display.showStart, true, 'older battles default to showing the initial positions');
  const legacyBoard = viewTarget('legacy');
  viewWindow.ShowdownView.render(legacyBoard, E.snapshot(data, legacy));
  assert.ok(legacyBoard.innerHTML.includes('fill="#459cff"'), 'and their boards keep the start squares');

  console.log('Passed: 显示初始位置 is a default-on button left of 选择地形, drives start squares + monster footprint + terrain on both screens, and republishes on every press.');
})().catch(e => { console.error(e); process.exit(1); });
