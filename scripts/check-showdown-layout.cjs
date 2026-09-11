// The second-screen controls gained two view switches: 交换版图与卡牌 (trade the two
// columns) and 旋转卡牌区 (turn every card a quarter turn at a time, counter-clockwise,
// keeping the card the size it has upright). Both are remembered, travel in the
// snapshot, and republish so the second screen — which only redraws on a revision
// change — follows immediately.
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

// ---- markup + CSS: the view switches share one icon row inside 第二屏幕控制, beside
// 重置大小, and only 重置大小 and 停止第二屏幕 keep a text label of their own.
assert.match(uiSource, /<button data-sd-size="reset">重置大小<\/button><div class="sd-view-switches" role="group" aria-label="第二屏幕显示方式"><button id="sdRulebook" type="button" aria-pressed="false" data-icon="board"[^>]*>.*?<button id="sdSwap" type="button" aria-pressed="false" data-icon="swap"[^>]*>.*?<button id="sdRotate" type="button" data-angle="0" data-icon="rotate"[^>]*>.*?<button id="sdAlign" type="button" data-align="\$\{ALIGN_DEFAULT\}" data-icon="align-\$\{ALIGN_DEFAULT\}"/, 'the four view switches belong to the second-screen control row, side by side in one icon group');
assert.match(sheet, /\.sd-view-switches\{display:grid;grid-template-columns:repeat\(4,minmax\(0,1fr\)\);gap:8px\}/, 'and they sit in a single row of four');
assert.match(sheet, /\.sd-view-switches \.sd-icon\{[^}]*width:62%/, 'each button draws an icon instead of a label');
assert.match(sheet, /#sdRotate\[data-angle="90"\] \.sd-icon\{transform:rotate\(90deg\)\}/, '旋转 turns its own icon with the card run');
assert.match(sheet, /\.sd-swapped \.sd-card-sidebar\{order:-1\}/, '交换 must move the card column to the left column');
// 旋转 turns the card itself: the angle lands on each card image, no panel, wrapper or
// column is turned, and — because a turned card must be the same card lying on its
// side, never a smaller one — the track and the card box take the turned shape, which
// is the upright card's height across and its width down. That is what keeps the area
// the same on both sides of the turn.
assert.match(sheet, /\.sd-card-rotated \.sd-card \.sd-face\{[^}]*transform:rotate\(var\(--sd-card-angle,90deg\)\)/, '旋转 must turn each card image by the angle the host asked for');
assert.match(sheet, /\.sd-card-sideways \.sd-cards\{[^}]*grid-template-columns:repeat\(auto-fill,minmax\(0,calc\(var\(--sd-card-width,220px\) \/ \.714\)\)\)/, 'a quarter turn must widen the card track to the turned card');
assert.match(sheet, /\.sd-card-sideways \.sd-card\{width:calc\(var\(--sd-card-width,220px\) \/ \.714\)\}/, 'and the turned card with it');
assert.match(sheet, /\.sd-card-sideways \.sd-card button\{[^}]*aspect-ratio:calc\(1 \/ \.714\)/, 'a quarter turn must give the card box the shape of the turned art');
assert.match(sheet, /\.sd-card-sideways \.sd-card \.sd-face\{[^}]*transform:translate\(-50%,-50%\) rotate\(var\(--sd-card-angle,90deg\)\)/, 'the turned art must fill that box, centred');
// The turned box is the upright box with its sides swapped, so turning a card is a
// rotation and nothing else: no scaling, no clipping, the same area either way.
const CARD_W = 220, RATIO = .714;
const upright = { w: CARD_W, h: CARD_W / RATIO }, turned = { w: CARD_W / RATIO, h: CARD_W };
const near = (a, b) => Math.abs(a - b) < .5;
assert.equal(turned.w, upright.h, 'the turned card is as wide as the upright card is tall');
assert.equal(turned.h, upright.w, 'and as tall as the upright card is wide');
assert.ok(near(turned.w * turned.h, upright.w * upright.h), 'so the card keeps its area across the turn');
// The art inside the turned box is the upright art (0.714 of the box) filling it after
// the turn, which is the same pixel size it has upright.
assert.ok(near(turned.w * RATIO, upright.w), 'the turned art is the width of the upright card');
assert.ok(near((turned.w * RATIO) / RATIO, upright.h), 'and the height of the upright card');
assert.equal(/\.sd-card-sideways \.sd-card button\{[^}]*width:/.test(sheet), false, 'the turned card must never be narrowed back to the upright width');
assert.equal(/\.sd-card-rotated \.sd-(sidebar-content|card-sidebar)/.test(sheet), false, 'the card panel and its content box must stay upright');
assert.equal(sheet.includes('--sd-run-angle'), false, 'the counter-turned card run must be gone');
assert.equal(sheet.includes('--sd-cards-columns'), false, '旋转 must not re-set the card run per panel');
assert.equal(sheet.includes('--sd-sidebar-content-'), false, 'nothing may size a turned content box');
assert.match(viewSource, /target\.classList\.toggle\('sd-swapped',swappedView\(s\)\)/, 'the viewer must apply 交换 from the snapshot');
assert.match(viewSource, /target\.classList\.toggle\('sd-card-rotated',angle!==0\)/, 'the viewer must apply 旋转 from the snapshot');
assert.match(viewSource, /target\.classList\.toggle\('sd-card-sideways',angle===90\|\|angle===270\)/, 'only a quarter turn asks for the sideways card box');
assert.match(viewSource, /setProperty\('--sd-card-angle',`\$\{angle\}deg`\)/, 'the turn angle must reach the stylesheet');
assert.equal(viewSource.includes('--sd-run-angle'), false, 'the viewer must not counter-turn any run');
assert.equal(viewSource.includes('--sd-cards-columns'), false, 'the viewer must not publish a per-card arrangement');
assert.equal(viewSource.includes('--sd-sidebar-content'), false, 'the viewer must not size a turned content box');

// ---- 旋转 must not touch the geometry: it keeps the board width the scale asks
// for, the board column it already had and the card run the upright display had, so
// the terrain cards land in the same places turned or upright. 交换 is the only
// switch that re-arranges the two columns. Both are asserted on the code path that
// decides them, because the numbers themselves need a laid-out page to measure.
const layoutBody = viewSource.slice(viewSource.indexOf('function layout(target)'), viewSource.indexOf('window.ShowdownView={render,layout,esc}'));
assert.equal(layoutBody.includes('rotated'), false, '旋转 must not enter the board geometry at all');
assert.equal(layoutBody.includes('cardTracks'), false, 'the card run must never be re-set for a turned panel');
assert.match(layoutBody, /const width=Math\.max\(MIN_BOARD,/, 'the board width comes from the scale alone');
assert.match(layoutBody, /const columns=panel=>swapped\?`\$\{panel\}px \$\{width\}px`:`\$\{width\}px minmax\(0,\$\{panel\}px\)`/, 'the two columns are pinned explicitly, in either order');
assert.match(layoutBody, /if\(swapped\)set\('--sd-grid-columns',columns\(panel\)\);/, '交换 is what pins the two columns');
assert.match(layoutBody, /else target\.style\.removeProperty\('--sd-grid-columns'\);/, 'an untraded layout leaves the two columns to the stylesheet default');

// ---- engine defaults reach older battles too
const battle = E.create(data, 'white-lion', 'level-2', 'layout-a');
assert.equal(E.snapshot(data, battle).display.swapped, false, 'the board keeps the left column by default');
assert.equal(E.snapshot(data, battle).display.cardRotation, 0, 'the card panel starts upright');
const older = E.snapshot(data, { ...battle, display: { boardScale: 1, cardScale: 1 } });
assert.equal(older.display.swapped, false, 'battles saved before the switches default to unswapped');
assert.equal(older.display.cardRotation, 0, 'and upright cards');
assert.equal(E.resize(battle, 'boardScale', .1).display.swapped, undefined, 'resizing does not invent the new keys');

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
const plain = viewTarget('plain');
viewWindow.ShowdownView.render(plain, E.snapshot(data, battle));
assert.match(plain.innerHTML, /<div class="sd-layout"><div class="sd-board-wrap">/, 'the board keeps the first markup slot by default');
assert.match(plain.innerHTML, /<aside class="sd-card-sidebar" aria-label="决战卡牌"><div class="sd-sidebar-content">/, 'the card panel wraps its reading order in its own content box');
assert.equal(plain.toggles['sd-card-rotated'], false, 'an upright display turns no card');
assert.equal(plain.props['--sd-card-angle'], '0deg', 'and asks the stylesheet for no turn');

// ---- host module: buttons flip the state, the snapshot and the publish follow
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
  location: { protocol: 'http:', hostname: '127.0.0.1', port: '8799', origin: 'http://127.0.0.1:8799' } }));
const settle = async () => { for (let i = 0; i < 4; i++) await new Promise(resolve => setImmediate(resolve)); };

(async () => {
  await settle();
  const swapButton = el('sdSwap'), rotateButton = el('sdRotate');
  await window.KDMShowdown.battle({ id: 'sb1', bossId: 'white-lion', levelId: 'level-2' });
  await settle();
  const saved = () => JSON.parse(memory.get('kdm-showdown-official-v1'));
  const snap = () => window.KDMShowdown.snapshot({ battleId: 'sb1' });
  assert.equal(swapButton.disabled, false, '交换 unlocks with a battle');
  assert.equal(rotateButton.disabled, false, '旋转 unlocks with a battle');
  assert.equal(swapButton.getAttribute('title'), '交换版图与卡牌', 'the swap button names the layout it will switch to');
  assert.equal(swapButton.getAttribute('aria-pressed'), 'false');
  assert.equal(swapButton.getAttribute('data-icon'), 'swap', 'and draws itself');
  assert.equal(rotateButton.getAttribute('data-angle'), '0', 'the rotate button starts at no angle');
  assert.equal(rotateButton.getAttribute('title'), '旋转卡牌区');
  assert.equal(snap().display.swapped, false);
  assert.equal(snap().display.cardRotation, 0);
  published.length = 0;

  const before = snap().revision;
  swapButton.onclick();
  await settle();
  assert.equal(saved().swapped, true, '交换 is remembered');
  assert.equal(snap().display.swapped, true, 'the battle carries the swap');
  assert.ok(snap().revision > before, 'the revision moves so the second screen redraws');
  assert.equal(published.at(-1)?.display.swapped, true, 'and the host publishes it');
  assert.equal(swapButton.getAttribute('title'), '恢复版图位置', 'the pressed button offers to restore the columns');
  assert.equal(swapButton.getAttribute('aria-pressed'), 'true');

  const afterSwap = snap().revision;
  rotateButton.onclick();
  await settle();
  assert.equal(saved().cardRotation, 90, '旋转 is remembered, a quarter turn at a time');
  assert.equal(snap().display.cardRotation, 90, 'the battle carries the angle');
  assert.ok(snap().revision > afterSwap, 'each press pushes a revision');
  assert.equal(published.at(-1)?.display.cardRotation, 90, 'and publishes the angle');
  assert.equal(rotateButton.getAttribute('data-angle'), '90', 'the button reports the angle it is at, and turns its own arrow with it');
  assert.match(rotateButton.getAttribute('title'), /90°/, 'and says the angle in words as well');

  for (const expect of [180, 270, 0]) {
    rotateButton.onclick();
    await settle();
    assert.equal(snap().display.cardRotation, expect, 'the angle cycles 0/90/180/270, got ' + expect);
  }
  assert.equal(rotateButton.getAttribute('data-angle'), '0', 'a full turn clears the angle readout');
  assert.equal(rotateButton.getAttribute('title'), '旋转卡牌区');

  swapButton.onclick();
  await settle();
  assert.equal(snap().display.swapped, false, '交换 presses back to the default layout');

  // The published snapshot is what the second screen draws from.
  const finalSnapshot = published.at(-1);
  const viewer = viewTarget('viewer');
  viewWindow.ShowdownView.render(viewer, { ...finalSnapshot, display: { ...finalSnapshot.display, swapped: true, cardRotation: 270 } });
  assert.equal(viewer.className, '', 'class toggling is delegated to the element classList');
  assert.match(viewer.innerHTML, /<aside class="sd-card-sidebar"/, 'the card panel is still the aside');
  assert.equal(viewer.toggles['sd-swapped'], true, '交换 still trades the two columns');
  assert.equal(viewer.toggles['sd-card-rotated'], true, 'a quarter turn marks the card art as turned');
  assert.equal(viewer.toggles['sd-card-sideways'], true, 'and asks for the sideways card box');
  assert.equal(viewer.props['--sd-card-angle'], '270deg', 'the angle reaches the stylesheet');

  // Only the art moves: a half turn still turns it, but needs no sideways box, and
  // an upright display turns nothing at all.
  const half = viewTarget('half');
  viewWindow.ShowdownView.render(half, { ...finalSnapshot, display: { ...finalSnapshot.display, cardRotation: 180 } });
  assert.equal(half.toggles['sd-card-rotated'], true, 'a half turn still turns the art');
  assert.equal(half.toggles['sd-card-sideways'], false, 'but the art keeps the box it had');
  assert.equal(half.props['--sd-card-angle'], '180deg', 'and the half angle reaches the stylesheet');
  const upright = viewTarget('upright');
  viewWindow.ShowdownView.render(upright, { ...finalSnapshot, display: { ...finalSnapshot.display, cardRotation: 0 } });
  assert.equal(upright.toggles['sd-card-rotated'], false, 'an upright display turns nothing');
  assert.equal(upright.props['--sd-card-angle'], '0deg', 'and leaves the art at 0°');
  console.log('Passed: 交换版图与卡牌 and 旋转卡牌区 sit with the second-screen controls, persist, publish on every press, reach the snapshot the second screen draws, and 旋转 turns each card into the same card lying on its side — its own area, neither shrunk nor stretched.');
})().catch(e => { console.error(e); process.exit(1); });
