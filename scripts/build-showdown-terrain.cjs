// Explicit, reviewed terrain rule-card catalog for viewers, including old snapshots.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
function build(root,data){
 const all=[...data.expansions.flatMap(e=>e.cards.map(t=>t.card)),...data.bosses.flatMap(b=>b.levels.flatMap(l=>[...l.fixed,...l.unfixed,...l.special].map(t=>t.card)))].filter(Boolean);
 const byId={},byName={};
 for(const c of all){
  if(!c.file)continue;
  if(!/^Card/.test(c.source?.objectType)||!['Terrain',''].includes(c.source?.gmNotes)||c.source.path.includes('Terrain Tiles'))throw Error('Not a terrain introduction card: '+c.name);
  byId[c.id]=c;byName[c.name]??=c;
 }
 const version=crypto.createHash('sha256').update(JSON.stringify(byId)).digest('hex').slice(0,16);
 fs.writeFileSync(path.join(root,'assets/showdown-terrain.js'),'window.ShowdownTerrain='+JSON.stringify({version,byId,byName})+';\n');
}
module.exports=build;
if(require.main===module){const root=path.resolve(__dirname,'..');build(root,JSON.parse(fs.readFileSync(path.join(root,'data/showdown.json'),'utf8')));}
