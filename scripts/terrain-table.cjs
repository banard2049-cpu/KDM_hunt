// Generates docs/terrain-classification.md from the shipped showdown data, so
// the terrain table always matches what the app actually uses.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/showdown.json'), 'utf8'));

const owner = new Map();
for (const e of data.expansions) for (const c of e.cards) if (!owner.has(c.name)) owner.set(c.name, e);
// Some deck names differ from the terrain rule-card key by a suffix.
const ruleKey = name => [name, name + 's', name.replace(/ \(Terrain\)$/, ''), name.replace(/ \(Terrain\)$/, '') + 's'].find(k => data.terrain[k]) || null;
const rule = name => { const k = ruleKey(name); return k ? data.terrain[k] : null; };
const tile = name => rule(name)?.terrainTile || name;
const size = name => { const s = data.sizes[tile(name)]; return s ? `${s.x}×${s.y}` : '—'; };
const count = name => { const c = rule(name)?.count; return c === '*' ? '按等级' : c === undefined ? '—' : String(c); };
const archive = name => (data.expansions.flatMap(e => e.cards).find(x => x.name === name)?.card?.source?.path || '—').split('/')[0];

const requiredBy = new Map();
for (const b of data.bosses) for (const l of b.levels)
  for (const [kind, list] of [['固定', l.fixed], ['指定', l.unfixed], ['特殊', l.special]])
    for (const t of list) {
      if (!requiredBy.has(t.name)) requiredBy.set(t.name, []);
      requiredBy.get(t.name).push(`${b.displayName || b.name}·${l.name}（${kind}）`);
    }
const refs = name => requiredBy.get(name) || [];
const brief = list => !list.length ? '—（纯随机池）' : list.length <= 3 ? list.join('；') : `${list.slice(0, 2).join('；')} 等 ${list.length} 处`;
const deckCards = e => {
  const count = new Map();
  for (const c of e.cards) count.set(c.name, (count.get(c.name) || 0) + 1);
  return [...count].map(([n, k]) => k > 1 ? `${n} ×${k}` : n).join('、');
};
const tag = e => e.group ? `官方·${e.group}波` : '官方';

const out = [];
out.push('# 决战地形分类表', '');
out.push(`由 \`node scripts/terrain-table.cjs\` 依据 \`data/showdown.json\` 生成。`, '');
out.push(`- 地形牌库 **${data.expansions.length}** 个｜地形牌 **${data.expansions.reduce((n, e) => n + e.cards.length, 0)}** 张｜去重后 **${owner.size}** 种地形｜等级 **${data.bosses.reduce((n, b) => n + b.levels.length, 0)}** 个`);
out.push('- 归属判定依据是**卡面左上角印的扩展纹章**，不是 TTS 素材档案路径（见 `scripts/refile-terrain.cjs`）');
out.push('- `官方·X波`：该波（`group`）的 Boss 会自带这一包地形');
out.push('');
out.push('## 一、地形牌库（扩展）', '');
out.push('| # | 牌库 | 标记 | 张数 | 地形牌 |');
out.push('|---|---|---|---|---|');
data.expansions.forEach((e, i) => out.push(`| ${i + 1} | ${e.name} \`${e.id}\` | ${tag(e)} | ${e.cards.length} | ${deckCards(e) || '—'} |`));

out.push('', '## 二、逐张地形', '');
out.push('| 地形（牌库名） | 图块 | 块数 | 尺寸 | 归属 | 被等级引用 |');
out.push('|---|---|---|---|---|---|');
for (const [name, e] of owner) out.push(`| ${name} | ${tile(name)} | ${count(name)} | ${size(name)} | ${e.name} | ${brief(refs(name))} |`);

out.push('', '## 三、每个等级需要的地形', '');
out.push('| Boss · 等级 | 固定 | 指定 | 特殊 | 随机 |');
out.push('|---|---|---|---|---|');
for (const b of data.bosses) for (const l of b.levels)
  out.push(`| ${b.displayName || b.name}·${l.name} | ${l.fixed.map(t => t.name).join('、') || '—'} | ${l.unfixed.map(t => t.name).join('、') || '—'} | ${l.special.map(t => t.name).join('、') || '—'} | ${l.randomTerrain} |`);

const orphan = Object.keys(data.terrain).filter(k => ![...owner.keys()].some(n => ruleKey(n) === k));
out.push('', '## 四、有地形规则卡但没有归入任何牌库', '');
out.push(orphan.length ? orphan.map(n => `- ${n}`).join('\n') : '无。规则表里的每一条都能在某个牌库里找到对应卡牌。');
const aliased = [...owner.keys()].filter(n => ruleKey(n) && ruleKey(n) !== n);
out.push('', '## 五、牌库卡名与规则表名字不一致（正常，仅供检索）', '');
out.push(aliased.map(n => `- 牌库名 \`${n}\` → 规则表 \`${ruleKey(n)}\``).join('\n'));
const sized = Object.keys(data.sizes).filter(t => !Object.keys(data.terrain).some(n => tile(n) === t));
out.push('', '## 六、只有图块尺寸、没有地形规则卡（App 里用不到）', '');
for (const t of sized) out.push(`- ${t} — ${data.sizes[t].x}×${data.sizes[t].y}`);

fs.writeFileSync(path.join(root, 'docs/terrain-classification.md'), out.join('\n').trimEnd() + '\n');
console.log('wrote docs/terrain-classification.md');

// ---------------------------------------------------------------- HTML 版（带卡图）
// Card art is cropped out of the TTS spritesheet exactly the way the app does it.
function imageSize(file) {
  const b = fs.readFileSync(file);
  if (b.subarray(0, 8).toString('hex') === '89504e470d0a1a0a') return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  for (let i = 2; i < b.length - 9;) {
    if (b[i] !== 0xff) { i++; continue; }
    const m = b[i + 1];
    if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return { w: b.readUInt16BE(i + 7), h: b.readUInt16BE(i + 5) };
    i += 2 + b.readUInt16BE(i + 2);
  }
  return null;
}
const sizeCache = new Map();
const sheetSize = file => { if (!sizeCache.has(file)) sizeCache.set(file, imageSize(path.join(root, file)) || { w: 1, h: 1 }); return sizeCache.get(file); };
const cardByName = new Map();
for (const c of data.expansions.flatMap(e => e.cards)) if (!cardByName.has(c.name)) cardByName.set(c.name, c.card);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function thumb(card) {
  if (!card?.file) return { style: 'background:#241f29', ratio: '1' };
  const sh = sheetSize(card.file), w = card.w || 1, h = card.h || 1;
  const cw = sh.w / w, ch = sh.h / h;
  const bx = w > 1 ? (card.col * 100) / (w - 1) : 0;
  const by = h > 1 ? (card.row * 100) / (h - 1) : 0;
  return { style: `background-image:url('../${card.file}');background-size:${w * 100}% ${h * 100}%;background-position:${bx}% ${by}%`, ratio: `${cw} / ${ch}` };
}

const kindOf = e => e.group ? 'chest' : 'official';
const labelOf = e => e.group ? `官方 · ${e.group}波` : '官方';
const order = [...data.expansions].sort((a, b) => ({ fan: 0, chest: 1, official: 2 })[kindOf(a)] - ({ fan: 0, chest: 1, official: 2 })[kindOf(b)]);

const sections = order.map(e => {
  const cards = e.cards.map((c, i) => {
    const { style, ratio } = thumb(c.card);
    const used = refs(c.name);
    const sameName = e.cards.slice(0, i).filter(x => x.name === c.name).length;
    return `<figure class="card"${used.length ? '' : ' data-idle="1"'}>
      <div class="thumb" style="aspect-ratio:${ratio};${style}"></div>
      <figcaption>
        <b>${esc(c.name)}${sameName ? ' <em>副本 ' + (sameName + 1) + '</em>' : ''}</b>
        <span class="spec">图块 ${esc(tile(c.name))} · ${esc(size(c.name))} · ${esc(count(c.name))} 块</span>
        <span class="refs">${used.length ? '布场用到：' + esc(brief(used)) : '只进随机池，没有等级写死它'}</span>
        <span class="src">TTS 档案：${esc(archive(c.name))}</span>
      </figcaption></figure>`;
  }).join('');
  return `<section class="pack ${kindOf(e)}">
    <h2><span class="badge">${labelOf(e)}</span> ${esc(e.name)} <code>${esc(e.id)}</code><span class="cnt">${e.cards.length} 张</span></h2>
    <div class="grid">${cards}</div></section>`;
}).join('\n');

const summary = data.expansions.map((e, i) =>
  `<tr class="${kindOf(e)}"><td>${i + 1}</td><td>${esc(e.name)}</td><td><span class="badge">${labelOf(e)}</span></td><td>${e.cards.length}</td><td>${esc(deckCards(e)) || '—'}</td></tr>`).join('');

const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">
<title>决战地形分类表 · 带图</title><style>
body{margin:0;padding:22px 26px 80px;background:#17151a;color:#eee;font:14px system-ui,"Microsoft YaHei",sans-serif;line-height:1.55}
h1{font-size:22px;margin:0 0 8px}
code{background:#302936;border-radius:4px;padding:1px 5px;font-size:12px;color:#d5c08a}
.lead{background:#211c24;border:1px solid #493c4d;border-radius:8px;padding:14px 16px;margin:12px 0 18px}
.lead b{color:#ffb083}
.badge{font-size:11px;padding:2px 8px;border-radius:10px;background:#264a2e;color:#a5f7b8;white-space:nowrap}
.pack.chest .badge{background:#3a2f52;color:#cbb2ff}
h2{font-size:17px;margin:30px 0 10px;border-top:1px solid #493c4d;padding-top:16px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
h2 .cnt{font-size:12px;color:#a899ad;font-weight:400}
section.pack.chest{border-left:3px solid #8b6cd9;padding-left:14px;margin-left:-17px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:14px}
figure.card{margin:0;background:#2b252f;border:1px solid #514457;border-radius:10px;padding:8px;display:flex;flex-direction:column}
figure.card[data-idle]{border-color:#3d3644}
.thumb{width:100%;background-repeat:no-repeat;background-color:#0d0b10;border-radius:6px;background-size:cover}
figcaption{display:grid;gap:2px;margin-top:8px;font-size:12px;overflow-wrap:anywhere}
figcaption b{font-size:13px}
figcaption em{font-style:normal;color:#a899ad;font-size:11px}
figcaption span{color:#a899ad;font-size:11px}
figcaption .refs{color:#d5c08a}
figcaption .src{color:#6f6474}
table{border-collapse:collapse;width:100%;font-size:13px;margin:8px 0 4px}
th,td{border:1px solid #493c4d;padding:6px 9px;text-align:left;vertical-align:top}
th{background:#241f29;color:#c6b7c9}
tr.chest td{background:#241f2e}
.tip{color:#a899ad;font-size:12px;margin:10px 0 0}
details{margin-top:26px}summary{cursor:pointer;color:#d5c08a;font-weight:600}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.chip{background:#241f29;border:1px solid #493c4d;border-radius:12px;padding:3px 10px;font-size:12px;color:#c6b7c9}
</style></head><body>
<h1>决战地形分类表 · 带图</h1>
<div class="lead">
依据 <code>data/showdown.json</code> 生成，卡图就是 App 里实际用的那张（按 TTS 图集裁切）。<br>
<b>归属判据 = 卡面左上角印的扩展纹章</b>，不是素材档案路径。<br>
共 ${data.expansions.length} 个地形牌库、${data.expansions.reduce((n, e) => n + e.cards.length, 0)} 张地形牌、去重 ${owner.size} 种地形、${data.bosses.reduce((n, b) => n + b.levels.length, 0)} 个等级。<br>
</div>
<table><thead><tr><th>#</th><th>牌库</th><th>标记</th><th>张数</th><th>地形牌</th></tr></thead><tbody>${summary}</tbody></table>
<p class="tip">下面按「赌博扩 → 官方」排列，每张牌下面写了图块名、尺寸、需要块数、有没有被布场规则写死。</p>
${sections}
<details open><summary>只有图块尺寸、没有地形规则卡（App 里用不到，${sized.length} 个）</summary>
<div class="chips">${sized.map(t => `<span class="chip">${esc(t)} ${data.sizes[t].x}×${data.sizes[t].y}</span>`).join('')}</div>
<p class="tip">这些在 TTS 图集里有尺寸定义，但没有地形介绍卡，也没有任何等级引用。你上次问的 Royal Causeway、Gabel Tree、Hidden Face 都在这里；另有 14 个 BK_*、6 个手指图块等。</p></details>
<details><summary>牌库卡名与规则表名字不一致（写法差异，仅供检索）</summary>
<div class="chips">${aliased.map(n => `<span class="chip">${esc(n)} → ${esc(ruleKey(n))}</span>`).join('')}</div></details>
</body></html>`;

fs.writeFileSync(path.join(root, 'docs/terrain-classification.html'), html);
console.log('wrote docs/terrain-classification.html');
console.log(`牌库 ${data.expansions.length}｜地形牌 ${data.expansions.reduce((n, e) => n + e.cards.length, 0)} 张｜去重 ${owner.size} 种｜等级 ${data.bosses.reduce((n, b) => n + b.levels.length, 0)} 个｜孤儿规则卡 ${orphan.length}｜只有尺寸 ${sized.length}`);
