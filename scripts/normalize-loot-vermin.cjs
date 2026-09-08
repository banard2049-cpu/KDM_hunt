// Keep the original card IDs for saved battles; new battles use the corrected CCG pool.
module.exports=function normalizeVermin(data){
  const deck=data.decks['ccg-homebrew-archive--ccg-vermin'];
  const template=Object.values(data.cards).find(c=>c.deck==='kingdom-death-monster-archive--core-vermin'&&c.name==='Centileech');
  if(!deck||!template)throw new Error('Missing CCG Vermin or Centileech template.');
  deck.legacyCards ||= deck.cards.slice();
  const id=deck.id+':centileech';
  data.cards[id]={...template,id,deck:deck.id};
  deck.cards=deck.cards.filter(cid=>!['Gibbering Haremite','Centileech'].includes(data.cards[cid].name));
  deck.cards.push(id);
};
