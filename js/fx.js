/* FX: loading screen, transisi halaman, reveal saat scroll, counter, ripple, hover/menu sound, grid kategori */
(function(){
  if (window.FX) return;
  const D=document, de=D.documentElement, R=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const S=n=>{ try{ window.Snd&&Snd[n]&&Snd[n](); }catch(e){} };        // butuh interaksi user
  const A=n=>{ try{ window.Snd&&Snd.auto&&Snd.auto(n); }catch(e){} };   // hanya jika audio sudah boleh jalan

  /* ---- loading screen (0–100%) ---- */
  let first=true; try{ first=!sessionStorage.getItem('fx_seen'); sessionStorage.setItem('fx_seen','1'); }catch(e){}
  const L=D.createElement('div'); L.id='fxLoader';
  L.innerHTML='<div class="fx-3d"><div class="fx-ring r1"></div><div class="fx-ring r2"></div><div class="fx-ring r3"></div><div class="fx-cube"><i class="f1">Y</i><i class="f2">Y</i><i class="f3">Y</i><i class="f4">Y</i><i class="f5">Y</i><i class="f6">Y</i><b class="fx-core"></b></div><div class="fx-shadow"></div></div><div class="fx-name">yanziiOffc</div><div class="fx-pct">0%</div><div class="fx-bar"><u></u></div><div class="fx-txt">Memuat<span>.</span><span>.</span><span>.</span></div>';
  de.appendChild(L);
  const bar=L.querySelector('u'), pct=L.querySelector('.fx-pct'), msg=L.querySelector('.fx-txt');
  let p=0, tgt=6, fin=false, done=false; const t0=performance.now(), min=first?1300:600;
  function out(){ L.classList.add('out'); A('whoosh'); setTimeout(()=>L.remove(),600); }
  function step(){
    if(done) return;
    if(!fin) tgt+=(90-tgt)*.025; p+=(tgt-p)*.13; if(fin&&p>99.4) p=100;
    pct.textContent=Math.round(p)+'%'; bar.style.width=p+'%';
    if(p>=100){ done=true; msg.textContent='Siap!'; setTimeout(out,220); return; }
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
  const finish=()=>{ fin=true; tgt=100; };
  function ready(){ setTimeout(finish,Math.max(0,min-(performance.now()-t0))); }
  D.readyState==='complete'?ready():addEventListener('load',ready);
  setTimeout(finish,4500);
  setTimeout(()=>{ if(!done){ done=true; out(); } },9000);   // pengaman terakhir

  /* ---- transisi saat pindah halaman ---- */
  const top=D.createElement('div'); top.id='fxTop';
  D.addEventListener('click',e=>{
    const a=e.target.closest&&e.target.closest('a[href]');
    if(!a||e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||a.target==='_blank'||a.hasAttribute('download')) return;
    const h=a.getAttribute('href'); if(!h||h[0]==='#'||/^(mailto:|tel:|javascript:)/i.test(h)) return;
    let u; try{ u=new URL(a.href,location.href); }catch(x){ return; }
    if(u.origin!==location.origin||(u.pathname===location.pathname&&u.hash)) return;
    e.preventDefault(); S('whoosh'); D.body.appendChild(top); requestAnimationFrame(()=>top.style.width='75%');
    D.body.classList.add('fx-leave'); setTimeout(()=>{ location.href=u.href; },230);
  });
  addEventListener('pageshow',e=>{ if(e.persisted){ D.body.classList.remove('fx-leave'); top.remove(); } });

  /* ---- reveal saat scroll ---- */
  const SEL='.panel,.stat,.pcard,.tool-card,.ord,.cat-card,.service-card,.skill-category,.content-card';
  function reveal(root){
    if(R||!('IntersectionObserver' in window)) return;
    const els=[...(root||D).querySelectorAll(SEL)].filter(el=>!el.closest('dialog')&&!el.dataset.fx); if(!els.length) return;
    const io=new IntersectionObserver(es=>es.forEach(en=>{ if(en.isIntersecting){ const el=en.target; el.classList.add('show'); io.unobserve(el); setTimeout(()=>el.classList.remove('fx-in','show'),1500); } }),{threshold:.06});
    els.forEach((el,i)=>{ el.dataset.fx=1; el.style.setProperty('--d',(i%6)*.06+'s'); el.classList.add('fx-in'); io.observe(el); });
    setTimeout(()=>els.forEach(el=>el.classList.add('show')),3000);   // cadangan
  }

  /* ---- counter naik ---- */
  function count(el,to,fmt){
    fmt=fmt||(v=>Math.round(v).toLocaleString('id-ID'));
    if(R||!to){ el.textContent=fmt(to); return; }
    const d=1100,t=performance.now();
    (function f(n){ const k=Math.min(1,(n-t)/d), e=1-Math.pow(1-k,3); el.textContent=fmt(to*e); if(k<1) requestAnimationFrame(f); })(t);
  }

  /* ---- ripple, hover sound, suara menu ---- */
  D.addEventListener('pointerdown',e=>{
    const b=e.target.closest&&e.target.closest('.nb-btn,.chip'); if(!b||R) return;
    const r=b.getBoundingClientRect(), s=Math.max(r.width,r.height)*2, i=D.createElement('span'); i.className='fx-rip';
    i.style.cssText='width:'+s+'px;height:'+s+'px;left:'+(e.clientX-r.left-s/2)+'px;top:'+(e.clientY-r.top-s/2)+'px'; b.appendChild(i); setTimeout(()=>i.remove(),650);
  },true);
  let lh=0;
  if(matchMedia('(hover:hover)').matches) D.addEventListener('mouseover',e=>{
    const t=e.target.closest&&e.target.closest('.pcard,.tool-card,.cat-card,.stat,.nav-menu a,.chip,.nb-btn'); if(!t||t.contains(e.relatedTarget)) return;
    const n=Date.now(); if(n-lh>90){ lh=n; S('hover'); } });
  D.addEventListener('click',e=>{ const b=e.target.closest&&e.target.closest('#navBtn'); if(b) S(b.getAttribute('aria-expanded')==='true'?'open':'close'); });

  /* ---- grid kategori (#catGrid) ---- */
  /* ikon kategori = 3 produk nyata di dalamnya */
  const REP={hosting:['Hosting Minecraft Standar','Hosting Website (cPanel)','Hosting SAMP'],vps:['VPS 2 Core / 4GB','Cloud Server','VPS 4 Core / 8GB'],panel:['Panel Bot 4GB','Reseller Panel','Admin Panel'],domain:['Domain .my.id','Domain .com','Subdomain + SSL'],prem:['Capcut Pro','Canva Pro','Netflix Premium'],dev:['Website Toko / Store','Buat Bot WhatsApp / Telegram','Fix Error Script / Website'],nokos:['Nokos WhatsApp','Nokos Telegram','Nokos Google / Gmail'],script:['Script Bot WA Multi Device','Script Bot Telegram','Script Bot AI'],sewabot:['Sewa Bot 1 Grup','Sewa Bot 5 Grup','Sewa Bot Unlimited'],smm:['Followers Instagram','Like TikTok','View TikTok'],game:['Diamond Mobile Legends','Diamond Free Fire','Robux Roblox']};
  function cats(){
    const g=D.getElementById('catGrid'); if(!g||!window.SHOP||!SHOP.cats) return;
    SHOP.cats.forEach(c=>{ const a=D.createElement('a'); a.className='cat-card'; a.href='produk.html#'+c.id; a.innerHTML='<span class="e"></span><b></b><small></small>';
      const rep=REP[c.id]; if(rep&&window.pIcon){ a.children[0].classList.add('stk'); rep.forEach(n=>a.children[0].appendChild(pIcon({name:n,cat:c.id}))); } else a.children[0].appendChild(window.pIcon?pIcon(c.id):D.createTextNode(c.icon)); a.children[1].textContent=c.name; a.children[2].textContent=c.desc; g.appendChild(a); });
  }
  /* ---- toast ---- */
  function toast(text,type,ms){
    let box=D.getElementById('fxToasts'); if(!box){ box=D.createElement('div'); box.id='fxToasts'; D.body.appendChild(box); }
    const t=D.createElement('div'); t.className='fx-toast '+(type||''); t.textContent=text; box.appendChild(t);
    setTimeout(()=>{ t.classList.add('out'); setTimeout(()=>t.remove(),320); },ms||2600);
    if(type==='ok') S('notify'); else if(type==='err') S('error');
  }
  /* ---- tombol melayang: WhatsApp admin + ke atas ---- */
  function fab(){
    if(!D.getElementById('siteNav')||D.querySelector('.chat-wrapper')||!window.SHOP) return;
    const w=D.createElement('div'); w.id='fxFab';
    w.innerHTML='<button type="button" aria-label="Ke atas" title="Ke atas">↑</button><a class="wa" target="_blank" rel="noopener" title="Chat admin" aria-label="Chat admin">💬</a>';
    w.querySelector('a').href='https://wa.me/'+SHOP.wa+'?text='+encodeURIComponent('Halo '+SHOP.brand+', saya mau tanya.');
    const up=w.querySelector('button'); up.onclick=()=>scrollTo({top:0,behavior:R?'auto':'smooth'});
    addEventListener('scroll',()=>up.classList.toggle('on',scrollY>400),{passive:true}); D.body.appendChild(w);
  }
  window.FX={count,reveal,toast};
  const init=()=>{ cats(); reveal(); fab(); };
  D.readyState==='loading'?D.addEventListener('DOMContentLoaded',init):init();
})();
