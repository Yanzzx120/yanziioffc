/* Sound untuk seluruh website (WebAudio, tanpa file audio).
   - Efek: klik, sukses, error, ketik   - Musik latar (default hidup & otomatis, tombol 🎵 untuk mematikan)  - Tombol 🔊 untuk mute efek */
(function(){
  if (window.Snd) return;
  const LS = { get(k,d){ try{ const v=localStorage.getItem(k); return v===null?d:v; }catch(e){ return d; } }, set(k,v){ try{ localStorage.setItem(k,v); }catch(e){} } };
  let ctx=null, master=null, sfxOn = LS.get('snd_sfx','1')==='1', musicOn = LS.get('snd_music_v2','1')==='1', musicTimer=null, step=0, nextT=0;

  function ensure(){
    if (!ctx){ const AC = window.AudioContext||window.webkitAudioContext; if(!AC) return null;
      ctx = new AC(); master = ctx.createGain(); master.gain.value = .9; master.connect(ctx.destination); }
    if (ctx.state==='suspended') ctx.resume();
    return ctx;
  }
  function tone(f, t, d, type, vol, dest){
    const o=ctx.createOscillator(), g=ctx.createGain(); o.type=type||'sine'; o.frequency.setValueAtTime(f,t);
    g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+.01); g.gain.exponentialRampToValueAtTime(0.0001,t+d);
    o.connect(g); g.connect(dest||master); o.start(t); o.stop(t+d+.02);
  }
  const Snd = {
    click(){ if(!sfxOn||!ensure()) return; const t=ctx.currentTime; tone(520,t,.07,'square',.06); tone(780,t+.03,.06,'square',.04); },
    key(){ if(!sfxOn||!ensure()) return; const t=ctx.currentTime; tone(1200+Math.random()*200,t,.03,'triangle',.025); },
    success(){ if(!sfxOn||!ensure()) return; const t=ctx.currentTime; [523,659,784,1047].forEach((f,i)=>tone(f,t+i*.08,.18,'triangle',.12)); },
    error(){ if(!sfxOn||!ensure()) return; const t=ctx.currentTime; tone(220,t,.16,'sawtooth',.09); tone(165,t+.13,.22,'sawtooth',.09); },
    pop(){ if(!sfxOn||!ensure()) return; const t=ctx.currentTime; const o=ctx.createOscillator(), g=ctx.createGain(); o.frequency.setValueAtTime(300,t); o.frequency.exponentialRampToValueAtTime(900,t+.09);
      g.gain.setValueAtTime(.1,t); g.gain.exponentialRampToValueAtTime(.0001,t+.12); o.connect(g); g.connect(master); o.start(t); o.stop(t+.14); },
    hover(){ if(!sfxOn||!ensure()) return; tone(900,ctx.currentTime,.035,'sine',.016); },
    whoosh(){ if(!sfxOn||!ensure()) return; const t=ctx.currentTime,o=ctx.createOscillator(),g=ctx.createGain(),f=ctx.createBiquadFilter();
      o.type='sawtooth'; o.frequency.value=140; f.type='bandpass'; f.frequency.setValueAtTime(300,t); f.frequency.exponentialRampToValueAtTime(3200,t+.3);
      g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.08,t+.1); g.gain.exponentialRampToValueAtTime(.0001,t+.36); o.connect(f); f.connect(g); g.connect(master); o.start(t); o.stop(t+.4); },
    open(){ if(!sfxOn||!ensure()) return; const t=ctx.currentTime; tone(392,t,.08,'triangle',.07); tone(587,t+.06,.12,'triangle',.07); },
    close(){ if(!sfxOn||!ensure()) return; const t=ctx.currentTime; tone(587,t,.08,'triangle',.06); tone(392,t+.06,.12,'triangle',.06); },
    coin(){ if(!sfxOn||!ensure()) return; const t=ctx.currentTime; tone(988,t,.08,'square',.06); tone(1319,t+.08,.35,'square',.06); },
    notify(){ if(!sfxOn||!ensure()) return; const t=ctx.currentTime; tone(880,t,.12,'sine',.1); tone(1175,t+.12,.25,'sine',.1); },
    auto(n){ if(!sfxOn) return; ensure(); if(ctx&&ctx.state==='running'&&this[n]) this[n](); },
    setSfx(v){ sfxOn=v; LS.set('snd_sfx',v?'1':'0'); ui(); if(v) this.pop(); },
    setMusic(v){ musicOn=v; LS.set('snd_music_v2',v?'1':'0'); ui(); v?startMusic():stopMusic(); },
    get sfx(){ return sfxOn; }, get music(){ return musicOn; }
  };

  /* musik latar: arpeggio pentatonik santai */
  const NOTES=[261.6,329.6,392,440,523.3,440,392,329.6], BASS=[130.8,130.8,98,98,110,110,98,98];
  function sched(){
    while (nextT < ctx.currentTime + .6){
      const i = step % 8, bar = Math.floor(step/8)%4;
      const shift = [1,1,1.122,.9][bar]; // variasi akor sederhana
      tone(NOTES[i]*shift, nextT, .35, 'triangle', .045);
      if (i%2===0) tone(BASS[i]*shift, nextT, .5, 'sine', .07);
      nextT += .3; step++;
    }
  }
  var mAud=null;
  /* musik latar file: lanjut dari posisi terakhir antar halaman (sessionStorage), otomatis diputar, tidak berhenti saat tab disembunyikan */
  const POS='snd_pos';
  function savePos(){ try{ if(mAud&&!mAud.paused) sessionStorage.setItem(POS,JSON.stringify({t:mAud.currentTime,at:Date.now()})); }catch(e){} }
  function resumePos(){ try{ const o=JSON.parse(sessionStorage.getItem(POS)||'null'); if(o&&mAud.duration){ mAud.currentTime=(o.t+(Date.now()-o.at)/1000)%mAud.duration; } }catch(e){} }
  function startMusic(){ if(window.SHOP&&SHOP.music){
      if(!mAud){ mAud=new Audio(SHOP.music); mAud.loop=true; mAud.preload='auto'; mAud.volume=SHOP.musicVolume||.35;
        mAud.addEventListener('loadedmetadata',resumePos); setInterval(savePos,500);
        addEventListener('pagehide',savePos); addEventListener('beforeunload',savePos); }
      const p=mAud.play(); if(p&&p.catch) p.catch(function(){ armGesture(); }); return; }
    if(!ensure()||musicTimer) return; nextT=ctx.currentTime+.1; sched(); musicTimer=setInterval(sched,200); }
  /* jika browser memblokir autoplay: mulai pada interaksi pertama apa pun */
  let armed=false;
  function armGesture(){ if(armed) return; armed=true; const ev=['pointerdown','touchstart','keydown','click','wheel','scroll'];
    const go=()=>{ if(!musicOn){ return; } if(mAud&&!mAud.paused){ done(); return; } const p=mAud?mAud.play():null; if(p&&p.then) p.then(done).catch(()=>{}); };
    const done=()=>{ ev.forEach(e=>removeEventListener(e,go,true)); armed=false; ui(); };
    ev.forEach(e=>addEventListener(e,go,true)); }
  function stopMusic(){ if(mAud) mAud.pause(); clearInterval(musicTimer); musicTimer=null; }
  document.addEventListener('visibilitychange',()=>{ if(!document.hidden && musicOn && mAud && mAud.paused) startMusic(); });

  /* tombol floating */
  let bS, bM;
  function ui(){ if(!bS) return; bS.textContent = sfxOn?'🔊':'🔇'; bM.textContent = '🎵'; bM.style.opacity = musicOn?1:.45; const ON='linear-gradient(135deg,#0284c7,#2563eb)', OFF='rgba(255,255,255,.08)'; bM.style.background = musicOn?ON:OFF; bS.style.background = sfxOn?ON:OFF; }
  function mk(title){ const b=document.createElement('button'); b.type='button'; b.title=title; b.setAttribute('aria-label',title);
    b.style.cssText='width:44px;height:44px;border:2px solid rgba(56,189,248,.6);color:#d5e1ee;border-radius:12px;box-shadow:0 2px 16px rgba(14,165,233,.45);font-size:20px;cursor:pointer;display:grid;place-items:center;padding:0'; return b; }
  function build(){
    bS=mk('Efek suara'); bM=mk('Musik latar');
    const slot=document.querySelector('.nb-top .row');
    if(slot){ [bM,bS].forEach(b=>{ b.style.width='40px'; b.style.height='40px'; b.style.fontSize='17px'; b.style.flex='0 0 40px'; b.style.minWidth='40px'; slot.appendChild(b); }); }
    else { const w=document.createElement('div'); w.style.cssText='position:fixed;right:14px;bottom:14px;z-index:9999;display:flex;gap:8px;flex-direction:column'; w.append(bM,bS); document.body.appendChild(w); }
    bS.onclick=()=>Snd.setSfx(!sfxOn); bM.onclick=()=>Snd.setMusic(!musicOn); ui();
  }

  /* otomatis: klik pada tombol/link, ketik di input, dan pesan sukses/error */
  document.addEventListener('pointerdown', e=>{
    ensure(); if (musicOn && !musicTimer) startMusic();
    const t = e.target.closest && e.target.closest('button,a,.tool-card,.nb-btn,select');
    if (t && !t.closest('[data-nosound]')) Snd.click();
  }, true);
  let lastKey=0; document.addEventListener('input', e=>{ if(e.target.matches&&e.target.matches('input[type=text],input[type=email],input[type=password],input[type=tel],textarea')){ const n=Date.now(); if(n-lastKey>70){ lastKey=n; Snd.key(); } } }, true);

  let lastMsg=0;
  function watch(){
    new MutationObserver(ms=>{
      for (const m of ms){
        const nodes = m.type==='attributes' ? [m.target] : Array.from(m.addedNodes).filter(n=>n.nodeType===1);
        for (const n of nodes){
          const el = n.matches && n.matches('.msg') ? n : (n.querySelector && n.querySelector('.msg'));
          if (!el || el.classList.contains('hide') || Date.now()-lastMsg<400) continue;
          if (el.classList.contains('err')){ lastMsg=Date.now(); Snd.error(); }
          else if (el.classList.contains('ok')){ lastMsg=Date.now(); Snd.success(); }
        }
      }
    }).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  }
  /* file audio sendiri: isi SHOP.sounds di js/config.js, contoh {click:'sound/klik.mp3', success:'sound/ok.mp3'} */
  Object.keys(Snd).forEach(n=>{ const f=Snd[n]; if(typeof f!=='function'||/^(auto|setSfx|setMusic)$/.test(n)) return;
    Snd[n]=function(){ const u=window.SHOP&&SHOP.sounds&&SHOP.sounds[n]; if(u&&sfxOn){ try{ const a=new Audio(u); a.volume=(SHOP.soundVolume||.6); a.play().catch(()=>{}); }catch(e){} return; } return f.apply(this,arguments); }; });
  window.Snd = Snd;
  const init=()=>{ build(); watch(); };
  document.readyState==='loading' ? document.addEventListener('DOMContentLoaded',init) : init();
  /* putar otomatis saat halaman dibuka (termasuk login) */
  if(musicOn) startMusic();
})();
