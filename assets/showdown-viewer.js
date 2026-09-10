// Read-only display: polls the host snapshot and re-fits the board panel on any
// size change (window, rotation of the screen, or a longer connection notice).
(function(){
 'use strict';
 const status=document.getElementById('sdConnection'),display=document.getElementById('sdDisplay');
 let key='',busy=false,shown=false,pending=0;
 // Fit synchronously (measuring forces layout) and again next frame, so late text
 // wrapping cannot leave the board at a stale size.
 function fit(){if(shown)window.ShowdownView.layout(display);}
 function refit(){if(pending)return;pending=requestAnimationFrame(()=>{pending=0;fit();});}
 async function poll(){
  if(busy)return;busy=true;
  try{
   const r=await fetch('state',{cache:'no-store',signal:AbortSignal.timeout(5000)});
   if(!r.ok)throw Error(r.status===403||r.status===404?'分享已停止，请重新扫描主控二维码':'连接中断');
   const s=await r.json();
   if(s){
    const next=(window.ShowdownTerrain?.version||'missing')+':'+s.dataVersion+':'+s.battleId+':'+s.revision;
    // 交换 and 旋转 both land on a new revision, so redrawing here is enough: the
    // panel's own box follows the board column, and that is only known once the
    // redrawn layout has been measured.
    if(next!==key){window.ShowdownView.render(display,s);shown=true;key=next;fit();refit();}
   }
   // Connected: keep the viewer clean, no status line.
   status.hidden=true;status.textContent='';
  }catch(e){
   status.hidden=false;
   status.textContent=(e.message.includes('分享已停止')?e.message:'主控连接中断，保留当前布场，正在重连…');
  }finally{busy=false;}
 }
 window.addEventListener('resize',refit);
 window.addEventListener('orientationchange',refit);
 if(window.ResizeObserver)new ResizeObserver(refit).observe(display);
 poll();setInterval(poll,1000);
})();
