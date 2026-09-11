// Strip community terrain from source archives, then group official chest cards.
const excluded=require('./excluded-content.json');
const CHEST_PACK={id:'GamblerChest',name:'赌博扩 · 纹章地形',group:'赌博',cards:['Beheaded Corpse','Smog Incense','Blood Pool','Fallen Lantern (Terrain)','Glowing Waypoint']};
module.exports=function(data){
 const core=data.expansions.find(e=>e.id==='Core');if(!core)return data;
 core.cards=core.cards.filter(c=>!excluded.terrain.includes(c.name));
 let chest=data.expansions.find(e=>e.id===CHEST_PACK.id);
 if(!chest){chest={...CHEST_PACK,cards:[]};data.expansions.push(chest);}
 for(const name of CHEST_PACK.cards){const i=core.cards.findIndex(c=>c.name===name);if(i>=0)chest.cards.push(core.cards.splice(i,1)[0]);}
 return data;
};
