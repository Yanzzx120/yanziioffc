/* Efek ketik aman (tidak error jika elemen tidak ada) */
(function(){
  const el=document.querySelector('.typewriter-text'); if(!el) return;
  const words=['DEVELOPER','PROGRAMER','CREATOR']; let w=0,c=0,del=false;
  (function tick(){
    const t=words[w];
    if(!del){ c++; el.textContent=t.slice(0,c); if(c===t.length){ del=true; return setTimeout(tick,1100); } }
    else { c--; el.textContent=t.slice(0,c); if(c===0){ del=false; w=(w+1)%words.length; } }
    setTimeout(tick,del?50:100);
  })();
})();
