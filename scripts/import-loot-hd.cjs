// Copy verified full-resolution base rule pages without recompression.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),source=process.argv[2];
if(!source)throw new Error('Pass the high-resolution rulebook directory.');
const dataPath=path.join(root,'data','loot.json'),data=JSON.parse(fs.readFileSync(dataPath,'utf8'));
const pages={'butcher':169,'the-hand':171,'king-s-man':173,'phoenix':175,'screaming-antelope':177,'white-lion':179,'watcher':189,'gold-smoke-knight':193};
const dest=path.join(root,'assets','loot','hd');fs.mkdirSync(dest,{recursive:true});
const verified={};
function copy(page){
 const name=page+'.jpg',from=path.join(source,name),to=path.join(dest,name);
 fs.copyFileSync(from,to);verified[name]={source:name,sha256:crypto.createHash('sha256').update(fs.readFileSync(from)).digest('hex')};return 'assets/loot/hd/'+name;
}
for(const b of data.bosses){
 if(!pages[b.id])continue;
 for(const l of b.levels){
  if(!l.rule||l.id==='prologue')continue;
  l.rule.hdFiles=[copy(pages[b.id])];
  if(['beast-of-sorrow','great-golden-cat','mad-steed','golden-eyed-king-of-1000-years'].includes(l.id))l.rule.hdFiles.push(copy(143));
  l.rule.hdSource='用户提供的高清基础规则书';
  const difference={
   'king-s-man':'GCE 的这页采用王之硬币变体：1–3 为 2 张王之硬币＋怪物器官，4–8 为 d5 王之硬币，9+ 为 5 张王之硬币＋钢剑；高清基础书为 1–4 破损提灯 2＋怪物器官、5–8 战斗技艺、9+ 钢剑＋基础资源 1。',
   'screaming-antelope':'模组等级 2 为基础 6＋怪物 7；等级 3 为基础 6＋怪物 8＋虫资源 2＋黑色地衣。高清基础书分别为 4＋6、5＋7＋黑色地衣。传奇疯狂战马沿用对应版本的等级 3 奖励。',
   'butcher':'模组等级 3 的额外面具判定为原始 d10 点数 2+；高清基础书为 4+。其他文字与能力也可能有版本调整。'
  }[b.id];
  if(difference)l.rule.hdDifference=difference;
 }
}
data.hdRulebook={source:'规则书',files:verified};
fs.writeFileSync(dataPath,JSON.stringify(data,null,2));
console.log(`Imported ${Object.keys(verified).length} original HD pages for ${Object.keys(pages).length} bosses.`);
