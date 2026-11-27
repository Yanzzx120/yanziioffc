/* Jam & tanggal live di semua halaman: hari, tanggal, bulan, tahun, waktu (zona waktu perangkat).
   Dipasang otomatis di bawah header situs; halaman tanpa header (login, admin) dapat bar di paling atas.
   Dashboard juga memakai tampilan ini (tidak ada jam terpisah lagi). */
(function(){
  function init(){
    if(document.getElementById('siteClock')) return;
    var old=document.getElementById('clock'); if(old) old.style.display='none'; /* jam lama (badge) disembunyikan agar tidak dobel */
    if(!document.getElementById('siteClockCss')){
      var st=document.createElement('style'); st.id='siteClockCss';
      st.textContent='#siteClock{display:flex;justify-content:center;padding:0 12px;margin:10px 0 0;position:relative;z-index:2}'
        +'#siteClock .sc{display:inline-flex;align-items:center;flex-wrap:wrap;justify-content:center;gap:4px 10px;max-width:100%;padding:7px 16px;border:2px solid var(--bd2,rgba(56,189,248,.28));border-radius:99px;background:var(--card,rgba(10,20,38,.72));color:var(--tx,#c3d1e2);font:700 13px/1.35 "Plus Jakarta Sans",system-ui,sans-serif;box-shadow:0 2px 18px var(--glow,rgba(14,165,233,.3));backdrop-filter:blur(6px);text-align:center}'
        +'#siteClock .dot{width:8px;height:8px;border-radius:50%;background:#22c55e;box-shadow:0 0 8px #22c55e;animation:scb 1.6s infinite}@keyframes scb{50%{opacity:.35}}'
        +'#siteClock .tm{font-variant-numeric:tabular-nums;letter-spacing:.4px;color:var(--acc2,#38bdf8)}'
        +'@media(max-width:480px){#siteClock .sc{font-size:12px;padding:6px 12px}}';
      document.head.appendChild(st);
    }
    var box=document.createElement('div'); box.id='siteClock'; box.setAttribute('role','timer'); box.setAttribute('aria-label','Tanggal dan waktu sekarang');
    box.innerHTML='<span class="sc"><span class="dot"></span><span class="dt"></span><span class="tm"></span></span>';
    var host=document.getElementById('siteNav'), anchor=document.getElementById('navMenu')||host;
    if(anchor) anchor.insertAdjacentElement('afterend',box); else document.body.insertBefore(box,document.body.firstChild);
    var dt=box.querySelector('.dt'), tm=box.querySelector('.tm');
    var fD,fT;
    try{
      fD=new Intl.DateTimeFormat('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
      fT=new Intl.DateTimeFormat('id-ID',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false,timeZoneName:'short'});
    }catch(e){ fD=null; }
    function pad(n){ return (n<10?'0':'')+n; }
    function tick(){
      if(document.hidden) return;
      var d=new Date(), t, s;
      if(fD){
        t=fD.format(d);
        var p=fT.formatToParts(d), g={}; p.forEach(function(x){ g[x.type]=x.value; });
        s=g.hour+':'+g.minute+':'+g.second+(g.timeZoneName?' '+g.timeZoneName:'');
      }else{
        var H=['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'],B=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
        t=H[d.getDay()]+', '+d.getDate()+' '+B[d.getMonth()]+' '+d.getFullYear(); s=pad(d.getHours())+':'+pad(d.getMinutes())+':'+pad(d.getSeconds());
      }
      if(dt.textContent!==t) dt.textContent=t; tm.textContent=s;
    }
    tick(); setInterval(tick,1000); document.addEventListener('visibilitychange',tick);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
