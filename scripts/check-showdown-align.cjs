// The second-screen controls gained a third view switch: one 「对齐方式」 button that
// cycles 居中 → 靠上 → 靠下 and lines the battle board and the card column up together
// on the second screen. It is remembered, travels in the snapshot, republishes on
// every press, and is CSS only — the board keeps the width the geometry gave it and
// only changes where it sits, so the card run lands in the same places it always did.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/showdown.json'), 'utf8'));
const uiSource = fs.readFileSync(path.join(root, 'assets/showdown-ui.js'), 'utf8');
const viewSource = fs.readFileSync(path.join(root, 'assets/showdown-view.js'), 'utf8');
const sheet = fs.readFileSync(path.join(root, 'assets/showdown.css'), 'utf8');
const E = require('../assets/showdown-engine.js');

// ---- markup + CSS: the button closes the second-screen control row, and it is one
// cycling button that reports the alignment it is at, like 旋转 reports its angle.
assert.match(uiSource, /<button id="sdRotate" type="button" data-angle="0" data-icon="rotate"[^>]*>.*?<button id="sdAlign" type="button" data-align="\$\{ALIGN_DEFAULT\}" data-icon="align-\$\{ALIGN_DEFAULT\}" title="对齐方式 · \$\{alignLabel\(\)\}"/, '对齐方式 closes the second-screen icon row, after 旋转卡牌区');
assert.match(uiSource, /const alignBar=y=>svg\(/, '对齐方式 draws the content bar where it sits, one icon per alignment');
assert.match(uiSource, /ALIGN_MODES=\['center','top','bottom'\]/, 'the cycle runs 居中 → 靠上 → 靠下');
assert.match(uiSource, /ALIGN_DEFAULT='bottom'/, '靠下 is the resting alignment');
assert.match(uiSource, /const nextAlign=\(\)=>ALIGN_MODES\[\(ALIGN_MODES\.indexOf\(align\(\)\)\+1\)%ALIGN_MODES\.length\]/, 'one press moves to the next alignment and wraps around');
// Every mode moves both halves of the display, and every one of them is written with
// auto margins: auto margins only take positive free space, so an over-long card
// column still starts at its own top and stays scrollable, where justify-content
// would centre it out of the scroll range.
assert.match(sheet, /\.sd-viewer \.sd-sidebar-content\{flex:1 1 auto\}/, 'the card column\u2019s content box fills the panel, so the run can be pushed up from the bottom');
assert.match(sheet, /\.sd-viewer \.sd-align-center \.sd-board\{margin:auto\}/, '居中 centres the board in its own panel');
assert.match(sheet, /\.sd-viewer \.sd-align-top \.sd-board\{margin:0 auto\}/, '靠上 pins the board to the top of its panel');
assert.match(sheet, /\.sd-viewer \.sd-align-bottom \.sd-board\{margin:auto auto 0\}/, '靠下 pins the board to the bottom of its panel');
assert.match(sheet, /\.sd-viewer \.sd-align-center \.sd-sidebar-content>\.sd-legend\{margin-top:auto\}/, '居中 centres the reading order from its legend');
assert.match(sheet, /\.sd-viewer \.sd-align-center \.sd-sidebar-content>\.sd-stats\{margin-bottom:auto\}/, '居中 closes it with the stat chips');
assert.match(sheet, /\.sd-viewer \.sd-align-center \.sd-sidebar-content>\.sd-cards\{margin-top:0\}/, '居中 must not let the run steal the free space it is centring');
assert.match(sheet, /\.sd-viewer \.sd-align-top \.sd-sidebar-content>\.sd-cards\{margin-top:0\}/, '靠上 packs the run under the legend');
assert.match(sheet, /\.sd-viewer \.sd-align-bottom \.sd-sidebar-content>\.sd-cards\{margin-top:auto\}/, '靠下 pushes the run to the bottom and grows it upwards');
assert.equal(/sd-align-\w+[^{}]*\{[^}]*justify-content/.test(sheet), false, '对齐 must never centre with justify-content');
assert.equal(/^\.sd-align-/m.test(sheet), false, 'every alignment rule is scoped to the second screen, so the in-app page is untouched');

// ---- the viewer reads the alignment from the snapshot and puts it on the display
assert.match(viewSource, /const ALIGN_MODES=\['center','top','bottom'\]/, 'the viewer knows the same three modes');
assert.match(viewSource, /const alignOf=s=>\{const v=s\?\.display\?\.align;return ALIGN_MODES\.includes\(v\)\?v:'bottom';\}/, 'an unknown or missing alignment falls back to 靠下');
assert.match(viewSource, /for\(const mode of ALIGN_MODES\)target\.classList\.toggle\('sd-align-'\+mode,align===mode\)/, 'the viewer applies 对齐方式 from the snapshot');
// Alignment is presentation only: it must not enter the board geometry, which keeps
// measuring the board width from the scale and the two columns from 交换.
const layoutBody = viewSource.slice(viewSource.indexOf('function layout(target)'), viewSource.indexOf('window.ShowdownView={render,layout,esc}'));
assert.equal(layoutBody.includes('align'), false, '对齐方式 must not enter the board geometry at all');

// ---- engine defaults reach older battles too
const battle = E.create(data, 'white-lion', 'level-2', 'align-a');
assert.equal(E.snapshot(data, battle).display.align, 'bottom', 'a fresh battle rests on 靠下');
const older = E.snapshot(data, { ...battle, display: { boardScale: 1, cardScale: 1 } });
assert.equal(older.display.align, 'bottom', 'battles saved before the switch existed get 靠下');
assert.equal(E.resize(battle, 'boardScale', .1).display.align, undefined, 'resizing does not invent the new key');

// ---- the viewer markup, and the classes the display is drawn with
const viewWindow = { ShowdownTerrain: { version: 'test', byId: {}, byName: {} } };
viewWindow.window = viewWindow;
vm.runInContext(viewSource, vm.createContext(viewWindow));
const viewTarget = id => {
  const el = { id, innerHTML: '', className: '', toggles: {}, props: {},
    querySelectorAll: () => [],
    style: { setProperty(name, value){ el.props[name] = String(value); }, getPropertyValue(name){ return el.props[name] ?? ''; }, removeProperty(name){ delete el.props[name]; } } };
  el.classList = { toggle(name, on){ el.toggles[name] = on === true; }, contains(name){ return el.toggles[name] === true; } };
  return el;
};
const snapshot = E.snapshot(data, battle);
const drawn = (display) => { const t = viewTarget('viewer'); viewWindow.ShowdownView.render(t, { ...snapshot, display: { ...snapshot.display, ...display } }); return t; };
const resting = drawn({});
assert.equal(resting.toggles['sd-align-bottom'], true, 'an untouched display is drawn 靠下');
assert.equal(resting.toggles['sd-align-center'], false, 'and carries no other alignment');
assert.equal(resting.toggles['sd-align-top'], false, 'and carries no other alignment');
const centred = drawn({ align: 'center' });
assert.equal(centred.toggles['sd-align-center'], true, '居中 reaches the display');
assert.equal(centred.toggles['sd-align-bottom'], false, '居中 replaces the resting alignment');
const topped = drawn({ align: 'top' });
assert.equal(topped.toggles['sd-align-top'], true, '靠上 reaches the display');
assert.equal(topped.toggles['sd-align-bottom'], false, '靠上 replaces the resting alignment');
const unknown = drawn({ align: 'sideways' });
assert.equal(unknown.toggles['sd-align-bottom'], true, 'an alignment the display does not know is drawn as 靠下');
assert.equal(unknown.toggles['sd-align-center'], false, 'and never as a made-up mode');

// ---- host module: the button cycles the state, the snapshot and the publish follow
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
const document = { getElementById: el, createElement: () => stub('created'), querySelector: sel => el(sel.includes('loot-reward') ? 'lootRewardModule' : 'fallbackHost'), body: { classList: { toggle(){}, remove(){} } } };
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
  location: { protocol: 'http', hostname: '127.0.0.1', port: '8799', origin: 'http://127.0.0.1:8799' } }));
const settle = async () => { for (let i = 0; i < 4; i++) await new Promise(resolve => setImmediate(resolve)); };

(async () => {
  await settle();
  const alignButton = el('sdAlign');
  await window.KDMShowdown.battle({ id: 'sb1', bossId: 'white-lion', levelId: 'level-2' });
  await settle();
  const saved = () => JSON.parse(memory.get('kdm-showdown-official-v1'));
  const snap = () => window.KDMShowdown.snapshot({ battleId: 'sb1' });
  assert.equal(alignButton.disabled, false, '对齐方式 unlocks with a battle');
  assert.equal(alignButton.getAttribute('title'), '对齐方式 · 靠下', 'the button opens on the resting alignment');
  assert.equal(alignButton.getAttribute('data-icon'), 'align-bottom', 'and draws it');
  assert.equal(alignButton.getAttribute('data-align'), 'bottom', 'and says so in its own attribute');
  assert.match(alignButton.getAttribute('aria-label'), /当前靠下，点按切换到居中/, 'the label names the alignment the next press switches to');
  assert.equal(snap().display.align, 'bottom', 'the battle starts 靠下');
  published.length = 0;

  // One press each, in the order the button promises: 靠下 → 居中 → 靠上 → 靠下.
  const steps = [
    ['center', '对齐方式 · 居中', /当前居中，点按切换到靠上/],
    ['top', '对齐方式 · 靠上', /当前靠上，点按切换到靠下/],
    ['bottom', '对齐方式 · 靠下', /当前靠下，点按切换到居中/],
    ['center', '对齐方式 · 居中', /当前居中，点按切换到靠上/],
  ];
  for (const [expect, label, aria] of steps) {
    const before = snap().revision;
    alignButton.onclick();
    await settle();
    assert.equal(saved().align, expect, '对齐方式 is remembered, got ' + expect);
    assert.equal(snap().display.align, expect, 'the battle carries the alignment');
    assert.ok(snap().revision > before, 'each press moves the revision so the second screen redraws');
    assert.equal(published.at(-1)?.display.align, expect, 'and the host publishes it');
    assert.equal(alignButton.getAttribute('title'), label, 'the button reports the alignment it is at');
    assert.equal(alignButton.getAttribute('data-icon'), 'align-' + expect, 'and draws the same alignment');
    assert.match(alignButton.getAttribute('aria-label'), aria, 'and offers the next one');
  }

  // The public hook the loot page and the host plugin use carries the alignment too.
  await window.KDMShowdown.layout({ align: 'top', swapped: false, cardRotation: 0 });
  await settle();
  assert.equal(snap().display.align, 'top', 'layout({align}) sets the alignment');
  assert.equal(saved().align, 'top', 'and remembers it');
  await window.KDMShowdown.layout({ align: 'nonsense' });
  await settle();
  assert.equal(snap().display.align, 'bottom', 'an alignment the host does not know falls back to 靠下');

  // The published snapshot is what the second screen draws from.
  const finalSnapshot = published.at(-1);
  const viewer = viewTarget('viewer');
  viewWindow.ShowdownView.render(viewer, { ...finalSnapshot, display: { ...finalSnapshot.display, align: 'center' } });
  assert.equal(viewer.toggles['sd-align-center'], true, 'the published alignment reaches the second screen');
  console.log('Passed: 对齐方式 sits with the second-screen controls as one cycling button (居中 → 靠上 → 靠下), is remembered, published on every press, reaches the snapshot the display draws from, and moves the board and the card column with CSS alone.');
})().catch(e => { console.error(e); process.exit(1); });
