// The second-screen controls gained one more view switch: 「显示决战版图」 — the second
// screen opens on the showdown board and the button trades the board panel for the
// level's own Boss rulebook pages, and back again, while the card column beside it
// keeps showing the battle. It is remembered like 交换／旋转／对齐, travels in the
// snapshot, republishes on every press, and the viewer draws either panel from that
// one snapshot flag.
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

// ---- markup: the switch is part of the second-screen icon row and opens on the board
const controlRow = (uiSource.match(/page\.innerHTML=`([\s\S]*?)`;/) || [])[1] || '';
assert.match(controlRow, /<div class="sd-view-switches" role="group" aria-label="第二屏幕显示方式"><button id="sdRulebook" type="button" aria-pressed="false" data-icon="board" title="显示决战版图 · 点按换成 Boss 规则书"[^>]*>.*?<button id="sdSwap"/, 'the switch leads the second-screen icon row, named for the panel it starts on');
assert.match(uiSource, /const showRulebook=\(\)=>store\.showRulebook===true;/, '决战版图 is the resting view: the rulebook is opt-in');
assert.match(uiSource, /rulebookButton\.innerHTML=ICON\[showRulebook\(\)\?'rulebook':'board'\]/, 'the button draws the panel the second screen is showing');
assert.match(uiSource, /rulebookButton\.setAttribute\('data-icon',showRulebook\(\)\?'rulebook':'board'\)/, 'and names it for the stylesheet and the tests');

// ---- the viewer knows the flag, the rule pages, and how to draw them
assert.match(viewSource, /const showRulebook=s=>s\?\.display\?\.showRulebook===true;/, 'the viewer reads the flag from the snapshot, and only a real true leaves the board');
assert.match(viewSource, /function rulePages\(level\)/, 'the rule pages come from the level itself');
assert.match(viewSource, /\(\(hd&&r\.hdFiles\)\|\|r\.files\|\|\[r\.file\]\.filter\(Boolean\)\)/, 'the pages follow the app 清晰度 preference, exactly like the loot page');
assert.match(viewSource, /<div class="sd-board-stage">\$\{inRules\?ruleStage\(s\):board\(s\)\}<\/div>/, 'the rule pages take the board panel, and only the board panel');
assert.match(viewSource, /<span>\$\{inRules\?'Boss 规则书':'决战布场'\}<\/span>/, 'and the panel says which of the two it is showing');
assert.match(viewSource, /const page=svg\?null:target\.querySelector\('\.sd-rule-page img'\);/, 'the panel is measured from the rule page just as it is measured from the board');
assert.match(sheet, /\.sd-viewer \.sd-rulebook\{/, 'and the rule pages are styled for the board panel');
assert.match(sheet, /@media\(orientation:portrait\)\{\s*\/\* Stacked, the pages are read down the page/, 'a portrait display reads the pages full width, like the card run');
// A page the bundle does not carry must not stay on screen as a broken frame.
assert.match(viewSource, /img\.onerror=\(\)=>frame\.replaceWith\(ruleMissing\(\)\)/, 'an unavailable rule page is dropped from the view');

// ---- engine defaults, including battles saved before the switch existed
const battle = E.create(data, 'white-lion', 'level-2', 'rule-a');
const snapshot = E.snapshot(data, battle);
assert.equal(snapshot.display.showRulebook, false, 'a fresh battle opens on the showdown board');
const older = E.snapshot(data, { ...battle, display: { boardScale: 1, cardScale: 1 } });
assert.equal(older.display.showRulebook, false, 'battles saved before the button existed open on the board too');
assert.equal(E.resize(battle, 'boardScale', .1).display.showRulebook, undefined, 'resizing does not invent the new key');
const { level } = E.context(data, battle);
assert.ok(level.rule?.file, 'the level must actually ship a rulebook page');
assert.ok(level.rule?.hdFiles?.length, 'and an HD scan, so the 清晰度 preference has something to choose');

// ---- the two views, drawn from the same snapshot
function viewTarget(id){
  const el = { id, innerHTML: '', props: {},
    querySelectorAll: () => [],
    style: { setProperty(name, value){ el.props[name] = String(value); }, getPropertyValue(name){ return el.props[name] ?? ''; }, removeProperty(name){ delete el.props[name]; } } };
  el.classList = { toggle(){}, contains(){ return false; } };
  return el;
}
function viewer(hd){
  const ctx = { ShowdownTerrain: { version: 'test', byId: {}, byName: {} } };
  ctx.window = ctx;
  if (hd !== undefined) ctx.localStorage = { getItem: k => (k === 'kdm-rulebook-version' ? (hd ? 'hd' : 'standard') : null) };
  vm.runInContext(viewSource, vm.createContext(ctx));
  return ctx;
}
const standard = viewer(false), high = viewer(true), bare = viewer();
const draw = (context, source, display) => {
  const t = viewTarget('viewer');
  context.ShowdownView.render(t, { ...source, display: { ...source.display, ...display } });
  return t;
};
const board = draw(standard, snapshot, {});
assert.ok(board.innerHTML.includes('class="sd-board"'), 'the default snapshot is drawn as the showdown board');
assert.equal(board.innerHTML.includes('sd-rule-pages'), false, 'and carries no rulebook pages');
const rules = draw(standard, snapshot, { showRulebook: true });
assert.equal(rules.innerHTML.includes('class="sd-board"'), false, 'the rule pages take the board off the panel');
assert.ok(rules.innerHTML.includes(`src="${level.rule.file}"`), 'and show the level\'s own rulebook page');
assert.match(rules.innerHTML, /Boss 规则书/, 'and say which panel is showing');
assert.ok(rules.innerHTML.includes(`>${snapshot.boss.name} · ${level.name}</h2>`), 'while still naming the battle it belongs to');
// The battle keeps playing beside it: the layout, the card column, its heading and
// every card are drawn exactly as they are while the board is up.
assert.match(rules.innerHTML, /<div class="sd-layout"><div class="sd-board-wrap">/, 'the board panel keeps its place in the layout');
assert.ok(rules.innerHTML.includes('sd-card-sidebar') && rules.innerHTML.includes('sd-cards'), 'and the card column stays on screen');
assert.ok(rules.innerHTML.includes('sd-stats'), 'with the battle stats it always shows');
assert.equal(rules.innerHTML.includes('class="sd-face"'), true, 'and the cards themselves, not just their frames');
assert.ok(draw(high, snapshot, { showRulebook: true }).innerHTML.includes(`src="${level.rule.hdFiles[0]}"`), '清晰度 高 shows the level\'s HD scan');
assert.ok(draw(bare, snapshot, { showRulebook: true }).innerHTML.includes(`src="${level.rule.file}"`), 'a display without the preference falls back to the shipped page');
assert.ok(draw(standard, snapshot, { showRulebook: 'yes' }).innerHTML.includes('class="sd-board"'), 'only a real true leaves the board, so an odd flag cannot blank the panel');

// Multi-page levels stack every page, in order.
const multi = (() => { for (const b of data.bosses) for (const l of b.levels) if ((l.rule?.files || []).length > 1) return { boss: b, level: l }; })();
assert.ok(multi, 'the data still has a level with more than one rule page');
const multiSnap = E.snapshot(data, E.create(data, multi.boss.id, multi.level.id, 'rule-b'));
const stacked = draw(standard, multiSnap, { showRulebook: true });
let at = -1;
for (const file of multi.level.rule.files) {
  const next = stacked.innerHTML.indexOf(`src="${file}"`);
  assert.ok(next > at, 'every rule page is drawn, in the order the level lists them: ' + file);
  at = next;
}

// A level with no rulebook at all says so instead of showing an empty frame.
const blank = (() => { for (const b of data.bosses) for (const l of b.levels) if (!(l.rule || {}).file) return { boss: b, level: l }; })();
if (blank) {
  let blankSnap = null;
  try { blankSnap = E.snapshot(data, E.create(data, blank.boss.id, blank.level.id, 'rule-c')); } catch (_) {}
  if (blankSnap) {
    const t = draw(standard, blankSnap, { showRulebook: true });
    assert.match(t.innerHTML, /没有提供规则书原图/, 'a level without a rulebook says so');
    assert.equal(t.innerHTML.includes('class="sd-rule-page"'), false, 'and draws no page');
    assert.ok(t.innerHTML.includes('sd-cards'), 'while the card column is still drawn');
  }
}

// ---- host module: the button flips the view, the snapshot and the publish follow
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
  const button = el('sdRulebook');
  const snap = () => window.KDMShowdown.snapshot({ battleId: 'sb1' });
  const saved = () => JSON.parse(memory.get('kdm-showdown-v1'));

  await window.KDMShowdown.battle({ id: 'sb1', bossId: 'white-lion', levelId: 'level-2' });
  await settle();
  assert.equal(button.disabled, false, 'the switch unlocks with a battle');
  assert.equal(button.getAttribute('data-icon'), 'board', 'it opens on the showdown board');
  assert.equal(button.getAttribute('title'), '显示决战版图 · 点按换成 Boss 规则书', 'and says so on hover');
  assert.equal(button.getAttribute('aria-pressed'), 'false', 'the rulebook is not showing yet');
  assert.match(button.getAttribute('aria-label'), /当前显示决战版图，点按切换到Boss 规则书/, 'and the label promises the rulebook next');
  assert.equal(snap().display.showRulebook, false, 'a fresh battle starts on the board');
  assert.notEqual(saved().showRulebook, true, 'the rulebook is not the remembered default');
  published.length = 0;

  const before = snap().revision;
  button.onclick();
  await settle();
  assert.equal(saved().showRulebook, true, 'asking for the rulebook is remembered');
  assert.equal(snap().display.showRulebook, true, 'the battle carries the flag');
  assert.ok(snap().revision > before, 'the revision moves so the second screen redraws');
  assert.equal(published.at(-1)?.display.showRulebook, true, 'and the host publishes the rulebook to the second screen');
  assert.equal(button.getAttribute('data-icon'), 'rulebook', 'the button now draws the rulebook');
  assert.equal(button.getAttribute('title'), '显示Boss规则书 · 点按切回决战版图');
  assert.equal(button.getAttribute('aria-pressed'), 'true');
  assert.match(button.getAttribute('aria-label'), /当前显示Boss 规则书，点按切换到决战版图/, 'and offers the board back');

  // What the host published is what the display draws.
  const live = draw(standard, published.at(-1), {});
  assert.ok(live.innerHTML.includes('sd-rule-pages'), 'the published snapshot puts the rulebook on the second screen');
  assert.equal(live.innerHTML.includes('class="sd-board"'), false, 'taking the map off the panel');
  assert.ok(live.innerHTML.includes('sd-cards'), 'and leaving the card column exactly where it is');

  button.onclick();
  await settle();
  assert.equal(snap().display.showRulebook, false, 'pressing again brings the board back');
  assert.equal(published.at(-1)?.display.showRulebook, false, 'and publishes it');
  assert.equal(button.getAttribute('data-icon'), 'board', 'the button draws the board again');
  assert.equal(button.getAttribute('title'), '显示决战版图 · 点按换成 Boss 规则书');
  assert.equal(saved().showRulebook, false, 'and the preference follows it');

  // A battle that was never touched still opens on the board.
  const untouched = E.create(data, 'white-lion', 'level-2', 'rule-d');
  delete untouched.display;
  const untouchedView = viewTarget('viewer');
  standard.ShowdownView.render(untouchedView, E.snapshot(data, untouched));
  assert.ok(untouchedView.innerHTML.includes('class="sd-board"'), 'a battle saved before the button existed still draws the board');

  console.log('Passed: 显示决战版图 is the second-screen switch that trades the board panel for the level\'s Boss rulebook (board by default, remembered, published on every press) while the card column keeps showing the battle, and the viewer draws either panel from that one snapshot flag.');
})().catch(e => { console.error(e); process.exit(1); });
