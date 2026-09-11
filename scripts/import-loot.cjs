/* Compile the supplied TTS archives without executing their Lua scripts.
 * Usage: node scripts/import-loot.cjs <Mods directory>
 * Reward transcription lives separately in scripts/loot-rewards.cjs. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const mods = process.argv[2];
if (!mods) throw new Error('Pass the TTS Mods directory.');
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
// Read literal table fields only. Unknown expressions are skipped, never evaluated.
function literalTable(src) {
  const tokens = src.match(/--\[\[[\s\S]*?\]\]|--[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\[\[[\s\S]*?\]\]|-?\d+(?:\.\d+)?|[A-Za-z_]\w*|[^\s]/g).filter(t => !t.startsWith('--'));
  let i = 0;
  function value() {
    const t = tokens[i++];
    if (t === '{') {
      const obj = {}; let index = 1;
      while (i < tokens.length && tokens[i] !== '}') {
        if (tokens[i] === ',' || tokens[i] === ';') { i++; continue; }
        let key;
        if (tokens[i] === '[') { i++; key = value(); if (tokens[i] === ']') i++; if (tokens[i] === '=') i++; }
        else if (tokens[i + 1] === '=') { key = tokens[i]; i += 2; }
        else key = index++;
        obj[key] = value();
        // Skip the remainder of a non-literal expression.
        let depth = 0;
        while (i < tokens.length && (depth || ![',', ';', '}'].includes(tokens[i]))) {
          if (['(', '[', '{'].includes(tokens[i])) depth++;
          if ([')', ']', '}'].includes(tokens[i])) depth--;
          i++;
        }
      }
      i++; return obj;
    }
    if (/^["']/.test(t || '')) return t.slice(1, -1).replace(/\\([\\"'])/g, '$1').replace(/\\n/g, '\n');
    if (/^-?\d/.test(t || '')) return Number(t);
    if (t === 'false') return false;
    if (t === 'true') return true;
    return null;
  }
  return value();
}
function tableField(src, field) {
  const m = new RegExp('\\b' + field + '\\s*=\\s*\\{').exec(src);
  return m ? literalTable(src.slice(m.index + m[0].length - 1)) : {};
}
const values = t => Object.keys(t || {}).filter(k => /^\d+$/.test(k)).map(k => t[k]);
const docs = ['(Don)KDM_GCE.json', '(Don)KDM 千宰屠夫专用.json'].map(file => ({file, data: JSON.parse(fs.readFileSync(path.join(mods, 'Workshop', file), 'utf8'))}));
const objects = [];
function walk(o, ancestors, source) {
  if (!o || typeof o !== 'object') return;
  if (o.Name) objects.push({o, ancestors, source});
  for (const c of o.ObjectStates || []) walk(c, ancestors, source);
  for (const c of o.ContainedObjects || []) walk(c, [...ancestors, o.Nickname || ''], source);
  // States are resolved through their parent, not treated as duplicate decks.
}
docs.forEach(d => walk(d.data, [], d.file));
const imageFiles = fs.readdirSync(path.join(mods, 'Images'));
const cacheIndex = new Map(imageFiles.map(f => [f.slice(0, f.lastIndexOf('.')).toLowerCase(), f]));
const outDir = path.join(root, 'assets', 'loot'); fs.mkdirSync(outDir, {recursive:true});
const warnings = [];
const imageCache = new Map();
const pdfRequests = [];
function copyImage(url) {
  if (!url) return null;
  if (imageCache.has(url)) return imageCache.get(url);
  const key = url.replace(/[^a-z0-9]/gi, '').toLowerCase();
  let f = cacheIndex.get(key);
  if (!f) { const ugc = url.match(/ugc\/(\d+)\/([a-f0-9]+)/i); if (ugc) f = imageFiles.find(f => f.toLowerCase().includes((ugc[1] + ugc[2]).toLowerCase())); }
  if (!f) { warnings.push('Missing image: ' + url); imageCache.set(url,null); return null; }
  const dest = crypto.createHash('sha256').update(url).digest('hex').slice(0,20) + path.extname(f).toLowerCase();
  fs.copyFileSync(path.join(mods, 'Images', f), path.join(outDir, dest));
  const result = 'assets/loot/' + dest; imageCache.set(url,result); return result;
}
const hunt = JSON.parse(fs.readFileSync(path.join(root, 'data', 'monsters.json')));
const modules = docs[0].data.LuaScript.split('__bundle_register(').filter(s => s.startsWith('"Kdm/Expansion/'));
const groups = new Map(hunt.map(m => [m.expansion, m.expansionGroup]));
const core = new Set(['WhiteLion','ScreamingAntelope','Phoenix','Butcher','KingsMan','Hand','Watcher','GoldSmokeKnight']);
const gamble = new Set(['CrimsonCrocodile','SmogSingers','King','Atnas','Gambler','Godhand']);
const official12 = new Set(['Gorm','Spidicules','FlowerKnight','DungBeetleKnight','LionGod','LionKnight','Manhunter','Slenderman','DragonKing','Sunstalker','LonelyTree','Tyrant']);
function group(mod) { return groups.get(mod) || (core.has(mod)||mod==='TheHand' ? '基础' : gamble.has(mod)||['BoneEater','BoneEaters'].includes(mod) ? '赌博' : official12.has(mod)||mod==='TheTyrant' ? '12扩' : ['KilleniumButcher','WhiteGigalion','YoungLion','WhiteBox','BlackKnight'].includes(mod) ? '其他官方扩' : '粉丝扩'); }
const decks = {}, cards = {}, sheets = {}, bosses = [];
function pick(name, expansion, source) {
  return objects.filter(x => x.o.Nickname === name).sort((a,b) => score(b)-score(a))[0];
  function score(x) { return (x.source === source ? 30 : 0) + (x.ancestors.some(p => slug(p.replace(/ Archive$/, '')) === slug(expansion)) ? 100 : 0) + (x.ancestors.some(p => /Archive$/.test(p)) ? 10 : -100) - (x.ancestors.some(p => /Primal Tactics|Tracks Of Death/.test(p)) ? 50 : 0); }
}
function addDeck(entry, kind) {
  const {o, ancestors, source} = entry;
  const id = slug(ancestors[0] || 'loose') + '--' + slug(o.Nickname || o.GUID);
  if (decks[id]) return id;
  const contents = o.ContainedObjects || [o];
  const instances = [];
  contents.forEach((c, n) => {
    if (c.CardID == null) return;
    const map = {...o.CustomDeck, ...c.CustomDeck};
    const sh = map[Math.floor(c.CardID / 100)] || (Object.keys(c.CustomDeck || {}).length === 1 ? Object.values(c.CustomDeck)[0] : null);
    if (!sh) { warnings.push('Missing CustomDeck: '+o.Nickname+'/'+c.CardID); return; }
    const file = copyImage(sh.FaceURL); const si = file || sh.FaceURL;
    sheets[si] = {file, w:sh.NumWidth || 1, h:sh.NumHeight || 1};
    const cell = c.CardID % 100;
    if (cell >= sheets[si].w * sheets[si].h) {warnings.push('Invalid cell: '+o.Nickname+'/'+c.CardID);return;}
    const cid = id + ':' + n;
    cards[cid] = {id:cid, name:c.Nickname || '未命名卡牌', deck:id, sheet:si, col:cell % sheets[si].w, row:Math.floor(cell / sheets[si].w), sourceCardId:c.CardID};
    instances.push(cid);
  });
  decks[id] = {id, name:o.Nickname || '奖励装备', kind, cards:instances, source:{file:source, path:ancestors.join('/'), guid:o.GUID}};
  return id;
}
// Resource archives retain physical multiplicities. Auxiliary resource archives
// remain separately selectable, rather than silently mixing campaign variants.
for (const entry of objects) {
  const kb=entry.ancestors.some(p=>p==='Killenium Butcher Archive');
  if (entry.source !== (kb?docs[1].file:docs[0].file) || !entry.ancestors.some(p=>/Archive$/.test(p))) continue;
  if (/(?:Resources|Ressources|Rare Gear)$|^(?:Core |CCG )?Vermin$/.test(entry.o.Nickname || '') && /^(Deck|Card)/.test(entry.o.Name)) addDeck(entry, /Rare Gear/.test(entry.o.Nickname) ? 'gear' : /Strange/.test(entry.o.Nickname) ? 'strange' : /Basic/.test(entry.o.Nickname) ? 'basic' : /Vermin/.test(entry.o.Nickname) ? 'vermin' : 'monster');
}
function rulePage(rule, expansion, source) {
  if (!rule || !rule[1]) return null;
  const entry = pick(rule[1], expansion, source);
  if (!entry) {warnings.push('Missing rule object: '+rule[1]);return null;}
  const state = Number(rule[2] || 1);
  if (entry.o.CustomPDF) {
    const pdf = entry.o.CustomPDF.PDFUrl;
    const key = pdf.replace(/[^a-z0-9]/gi,'').toLowerCase();
    const cached = fs.readdirSync(path.join(mods,'PDF')).find(f=>f.slice(0,f.lastIndexOf('.')).toLowerCase()===key);
    if (!cached) {warnings.push('Missing PDF: '+pdf);return null;}
    const hash=crypto.createHash('sha256').update(pdf).digest('hex').slice(0,12);
    // TTS book.setPage uses zero-based PDF pages. PDFPageOffset changes the
    // displayed label, not the document page selected by the Lua script.
    const files=[state,state+1].map(p=>'assets/loot/'+hash+'-p'+p+'.jpg');
    pdfRequests.push({pdf:path.join(mods,'PDF',cached),pages:[state,state+1],files});
    return {book:rule[1],state,title:rule[1],file:files[0],files,source};
  }
  const page = state === 1 ? entry.o : entry.o.States?.[state];
  const url = page?.CustomImage?.ImageURL || page?.CustomPDF?.PDFUrl;
  const file = page?.CustomImage ? copyImage(url) : null;
  return {book:rule[1], state, title:page?.Nickname || rule[1], file, source};
}
for (let modSrc of modules) {
  const mod = modSrc.match(/^"Kdm\/Expansion\/([^"/]+)"/)?.[1]; if (!mod) continue;
  const source = mod === 'KilleniumButcher' ? docs[1].file : docs[0].file;
  if (mod === 'KilleniumButcher') modSrc = docs[1].data.LuaScript.split('__bundle_register(').find(s=>s.startsWith('"Kdm/Expansion/KilleniumButcher"'));
  const monsters = values(tableField(modSrc, 'monsters'));
  const expansion = modSrc.match(/\bname\s*=\s*"([^"]+)"/)?.[1] || mod;
  for (const m of monsters) {
    if (!m?.name || !m.levels) continue;
    const special = !!m.IsAddedToCore;
    const name = mod === 'KilleniumButcher' ? 'Killenium Butcher' : special ? m.name + ' · ' + expansion : m.name;
    const id = slug(name);
    const resourceName = m.resourcesDeck === false ? null : m.resourcesDeck || m.name + ' Resources';
    const resource = resourceName && pick(resourceName, ['WhiteLion','ScreamingAntelope','Phoenix'].includes(mod)?'Kingdom Death: Monster':expansion, source);
    const basic = pick('Core Basic Resources', 'Kingdom Death: Monster', docs[0].file);
    const components = tableField(modSrc, 'components');
    const defaultDecks = [basic && addDeck(basic,'basic'), resource && addDeck(resource,'monster')].filter(Boolean);
    for (const [key,val] of Object.entries(components)) {
      if (/Strange Resources|Rare Gear/.test(key) && typeof val === 'string') {const e=pick(val, expansion, source);if(e && /^(Deck|Card)/.test(e.o.Name)) defaultDecks.push(addDeck(e,key==='Rare Gear'?'gear':'strange'));}
    }
    const lv = values(m.levels).map(l => {
      let rule=l.showdown?.rules || m.rules;
      // Verified against the local PDFs: these Lua links point at unrelated
      // story pages, so retain the corrected source page explicitly.
      if(mod==='KilleniumButcher') rule={1:'KB Rules',2:10};
      if(mod==='Atnas') rule={1:'Only Rules',2:148};
      if(mod==='Scourgelord') rule={1:'Scourgelord Rules',2:l.name==='Prologue'?8:16};
      if(mod==='WhiteLion'&&l.name==='Prologue') rule={1:'Core Rules',2:16};
      const page=rulePage(rule, expansion, source);
      if(mod==='HarvesterWorm'&&['Level 1','Level 2'].includes(l.name)&&page){const extra=rulePage({1:'Harvester Worm Rules',2:10},expansion,source);page.files=[page.file,extra.file];}
      return {id:slug(l.name), name:l.name, level:l.level, hunt:l.monsterHuntPosition != null, rule:page};
    });
    // Some supplementary modules inherit the original monster rule page.
    bosses.push({id,name,aliases:hunt.find(h=>h.id===slug(m.name))?.aliases || [m.name], expansion:mod, expansionName:expansion, group:group(mod), huntMonsterId:special?null:slug(m.name), resourceDeck:resource?addDeck(resource,'monster'):null, basicDeck:basic?addDeck(basic,'basic'):null, defaultDecks:[...new Set(defaultDecks)], levels:lv, source});
  }
}
const rewards=require('./loot-rewards.cjs');
// The GCE Curse rulebook prints a BERSERK KING'S MAN page (PDF document page 35,
// hashed file <stem>-p34.jpg) that the mod never links: the Curse module only
// references states 31/32/33 for A Noble Return / Altering Fate / An Unexpected
// Return. Surface it as a selectable level so its rule page is reachable.
// Its file is already produced by the An Unexpected Return render job, which
// requests pages [33, 34] -> files [<stem>-p33.jpg, <stem>-p34.jpg].
{
  const curse=bosses.find(b=>b.id==='king-s-man-curse');
  const ref=curse&&curse.levels.find(l=>l.id==='an-unexpected-return')&&curse.levels.find(l=>l.id==='an-unexpected-return').rule;
  if(curse&&ref&&ref.file){
    const stem=path.basename(ref.file).replace(/-p\d+\.[a-z]+$/i,'');
    const file='assets/loot/'+stem+'-p34.jpg';
    curse.levels.push({id:'berserk-king-s-man',name:"BERSERK KING'S MAN",level:2,hunt:false,rule:{book:ref.book,state:34,title:ref.title,file,files:[file],source:ref.source}});
  }
}
// Remove non-hunt levels appended from unrelated Lua modules by the previous
// extractor. Keep actual monster levels, names, and hunt positions unchanged.
for(const m of hunt){const b=bosses.find(b=>b.huntMonsterId===m.id);if(b)m.levels=m.levels.filter(l=>b.levels.some(x=>x.name===l.name));}
fs.writeFileSync(path.join(root,'data','monsters.json'),JSON.stringify(hunt,null,2));
for(const b of bosses) for(const l of b.levels) l.reward=rewards[b.id]?.[l.id] || {type:'manual',note:'该等级的奖励尚无可核对的结构化规则，请查看规则原图并手动拿牌。'};
// Finite reserve copies for explicit multi-card grants whose TTS archive only
// contains a display template. Original random decks keep their exact counts.
// All grants consume original copies first, then this shared finite reserve.
const engine=require('../assets/loot-engine.js'),catalog={bosses,decks,cards};
function inspect(steps,b,l){for(const s of steps||[]){
  if(s.op==='take'&&typeof s.name==='string'){
    const count=typeof s.count==='object'?(l.reward.inputs||[]).find(i=>i.key===s.count.input)?.max||0:s.count||1;
    const deck=engine.namedDeck(catalog,{bossId:b.id,levelId:l.id},s.name,s.deck);
    if(!deck){warnings.push('Missing reward card: '+b.id+' / '+s.name);continue;}
    const originals=decks[deck].cards.filter(cid=>cards[cid].name===s.name);
    if(count>originals.length){
      const id=deck+'--reward-reserve';
      decks[id]||={id,name:decks[deck].name+' · 指定奖励备牌',kind:'reserve',reserveFor:deck,cards:[],source:{...decks[deck].source,policy:'仅按规则最大指定奖励数量补足模板，不改变原随机牌库'}};
      for(let n=originals.length;n<count;n++){const cid=id+':'+slug(s.name)+':'+n;if(!cards[cid]){cards[cid]={...cards[originals[0]],id:cid,deck:id,template:originals[0]};decks[id].cards.push(cid);}}
      if(!b.defaultDecks.includes(id))b.defaultDecks.push(id);
    }
  }
  inspect(s.yes,b,l);inspect(s.no,b,l);inspect(s.steps,b,l);for(const r of s.rows||[])inspect(r.steps,b,l);
}}
for(const b of bosses)for(const l of b.levels)inspect(l.reward.steps,b,l);
const result={schemaVersion:1,bosses,decks,cards,sheets,warnings:[...new Set(warnings)]};
require('./normalize-loot-vermin.cjs')(result);
if(pdfRequests.length){
  fs.mkdirSync(path.join(root,'.research-scratch'),{recursive:true});
  fs.writeFileSync(path.join(root,'.research-scratch','loot-pdf-jobs.json'),JSON.stringify({root,requests:pdfRequests}));
}
fs.writeFileSync(path.join(root,'data','loot.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify({bosses:bosses.map(b=>[b.id,b.levels.map(l=>l.name),b.levels[0]?.rule]),decks:Object.keys(decks).length,cards:Object.keys(cards).length,images:imageCache.size,warnings:result.warnings},null,2));
