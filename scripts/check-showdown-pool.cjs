const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),data=require('../data/showdown.json'),E=require('../assets/showdown-engine.js');
const core=E.cardsOf(data,'Core');
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
const saved = () => JSON.parse(memory.get('kdm-showdown-official-v1'));
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
  assert.equal(el('sdExpSummary').textContent,'');
  assert.equal((expNode._html.match(/data-pool-group=/g)||[]).length,data.expansions.length);
  const card=E.cardsOf(data,'WhiteLion')[0].id;
  clickCard(card,true);
  assert.ok(saved().sessions.b1.pool.includes(card));
  clickCard(card,false);
  assert.ok(!saved().sessions.b1.pool.includes(card));
  el('sdPoolNone').onclick();
  assert.equal(el('sdPoolCount').textContent, '0');
  assert.equal(saved().sessions.b1.pool.length, 0);
  el('sdPoolCore').onclick();
  assert.equal(el('sdPoolCount').textContent, String(core.length), '「只留基础」restores the default deck');

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

  // Android must start the native host without invoking WebView popup navigation.
  let starts=0,stops=0,shown=0,scrolled=0,startError=null;
  const published=[];
  const panel=el('lootSidebar')._appended[0],status=panel._appended[0];
  panel.scrollIntoView=()=>scrolled++;
  window.KDMLoot.show=mode=>{assert.equal(mode,'loot');shown++;};
  window.open=()=>{throw Error('Android must never open a popup');};
  // Android injects Plugins directly; registerPlugin is absent without the web bundle.
  window.Capacitor={isNativePlatform:()=>true,Plugins:{ShowdownHost:{
      async start(){starts++;await settle();if(startError)throw Error(startError);return {urls:['http://192.168.1.30:43210/d/']};},
      async publish({snapshot}){published.push(snapshot);},
      async stop(){stops++;}
  }}};
  const opening=el('sdOpenTop').onclick();
  assert.match(status.textContent,/正在开启/);
  await el('sdOpenTop').onclick();
  await opening;await settle();
  assert.equal(starts,1,'rapid taps must not restart the native server');
  assert.equal(el('sdShareInfo').hidden,false);
  assert.equal(el('sdShareUrl').innerHTML,'<code>http://192.168.1.30:43210/d/</code>');
  assert.ok(shown>0&&scrolled>0,'show the address panel even when opening from the hunt page');
  assert.equal(published.at(-1).battleId,'b1','publish the current battle to the native host');
  assert.equal(status.textContent,'');
  assert.equal(status.hidden,true,'successful sharing only displays the address');
  await el('sdOpenTop').onclick();
  assert.equal(starts,1,'opening again retains the existing native address');
  await el('sdStop').onclick();
  assert.equal(stops,1);
  assert.equal(el('sdShareInfo').hidden,true);
  startError='未找到局域网地址，请连接 Wi-Fi 或开启热点。';
  await el('sdOpenTop').onclick();
  assert.equal(status.hidden,false);
  assert.equal(status.textContent,startError,'native failure is visible beside the address controls');
  assert.equal(el('sdShareInfo').hidden,true);
  startError=null;
  await el('sdOpenTop').onclick();
  assert.equal(el('sdShareInfo').hidden,false,'a failed start can be retried');
  await el('sdStop').onclick();

  console.log('Passed: random terrain pool defaults to 基础, is editable one card at a time, and the header button opens the second screen itself.');
})().catch(e => { console.error(e); process.exit(1); });
