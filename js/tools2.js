/* Tools tambahan — semua jalan lokal di browser (tanpa server). Dimuat sebelum tools.js */
(function(){
const $=(s,c)=>(c||document).querySelector(s);
const el=h=>{const t=document.createElement('template');t.innerHTML=h.trim();return t.content.firstElementChild;};
const note=(b,t,k)=>{b.innerHTML='';const d=document.createElement('div');d.className='msg '+(k||'');d.textContent=t;b.appendChild(d);};
const save=(blob,n)=>{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=n;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);};
const copy=async(t,m)=>{try{await navigator.clipboard.writeText(t);window.FX&&FX.toast(m||'Disalin','ok');}catch(e){window.FX&&FX.toast('Gagal menyalin','err');}};
const rp=n=>'Rp'+Math.round(n).toLocaleString('id-ID');

/* ---------- FOTO LIVE (kamera + upload + editor foto/video) ---------- */
function toolLive(box){
  box.innerHTML=`<style>
.fl-hero{display:flex;align-items:center;gap:10px;margin-bottom:12px}.fl-hero .t{font-weight:800;font-size:18px}.fl-hero .s{font-size:12.5px;color:var(--mut)}
.fl-rec{display:inline-flex;align-items:center;gap:6px;background:#ef4444;color:#fff;font:800 11px system-ui;letter-spacing:.6px;padding:4px 10px;border-radius:99px}.fl-rec::before{content:"";width:7px;height:7px;border-radius:50%;background:#fff;animation:flb 1.2s infinite}@keyframes flb{50%{opacity:.25}}
.fl-frame{position:relative;width:min(100%,460px);margin:0 auto;border-radius:26px;padding:6px;background:linear-gradient(135deg,var(--acc),#a855f7,#22d3ee);box-shadow:0 6px 44px var(--glow)}
.fl-frame .stage{border-radius:21px;overflow:hidden;background:#000;aspect-ratio:3/4;display:grid;place-items:center}
.fl-frame video{width:100%!important;height:100%;min-height:0!important;object-fit:cover}
.fl-grid{position:absolute;inset:6px;border-radius:21px;pointer-events:none;background:linear-gradient(transparent 33%,rgba(255,255,255,.18) 33%,rgba(255,255,255,.18) calc(33% + 1px),transparent calc(33% + 1px),transparent 66%,rgba(255,255,255,.18) 66%,rgba(255,255,255,.18) calc(66% + 1px),transparent calc(66% + 1px)),linear-gradient(90deg,transparent 33%,rgba(255,255,255,.18) 33%,rgba(255,255,255,.18) calc(33% + 1px),transparent calc(33% + 1px),transparent 66%,rgba(255,255,255,.18) 66%,rgba(255,255,255,.18) calc(66% + 1px),transparent calc(66% + 1px))}
.fl-badge{position:absolute;top:18px;left:18px;z-index:2}
.fl-bar{display:flex;align-items:center;justify-content:center;gap:22px;margin:16px 0 4px}
.fl-shut{width:74px;height:74px;border-radius:50%;border:5px solid #fff;background:radial-gradient(circle,#fff 0 58%,var(--acc) 60%);box-shadow:0 0 0 4px rgba(255,255,255,.2),0 4px 24px var(--glow);cursor:pointer;transition:transform .12s}.fl-shut:active{transform:scale(.9)}
.fl-side{width:52px;height:52px;border-radius:50%;border:2px solid var(--bd2);background:var(--card);color:var(--tx);font-size:22px;display:grid;place-items:center;cursor:pointer;box-shadow:0 2px 18px var(--glow)}
.fl-opts{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px}.fl-opts label{font-size:11.5px;color:var(--mut)}
.fl-seg{display:grid;grid-template-columns:1fr 1fr;gap:6px;width:min(100%,460px);margin:14px auto 0;padding:5px;border:2px solid var(--bd2);border-radius:99px;background:var(--inp)}.fl-seg button{border:0;border-radius:99px;padding:9px;font:700 13px inherit;font-family:inherit;color:var(--tx);background:transparent;cursor:pointer}.fl-seg button.on{background:var(--acc);color:#fff;box-shadow:0 2px 14px var(--glow)}
@media(max-width:420px){.fl-shut{width:66px;height:66px}}
</style>
  <div class="fl-hero"><span style="font-size:30px">📸</span><div><div class="t">Foto Live</div><div class="s">Kamera, upload &amp; edit foto/video — semua diproses di perangkatmu.</div></div></div>
  <div id="cam"><div class="fl-frame"><div class="stage" style="position:relative"><video id="v" autoplay playsinline muted></video><div id="cd" style="position:absolute;inset:0;display:none;place-items:center;font:800 96px system-ui;color:#fff;text-shadow:0 2px 14px #000"></div></div><div class="fl-grid"></div><span class="fl-rec fl-badge" id="flb" style="display:none">LIVE</span></div>
  <div class="fl-seg" id="flseg"><button type="button" data-v="foto" class="on">📷 Foto</button><button type="button" data-v="live">◉ Live Photo</button></div>
  <select id="md" hidden><option value="foto">Foto</option><option value="live">Live Photo (seperti iPhone)</option></select>
  <div class="fl-bar"><label class="fl-side" title="Upload foto / video" style="cursor:pointer">📁<input type="file" id="up" accept="image/*,video/*" hidden></label><button type="button" class="fl-shut" id="sn" aria-label="Ambil"></button><button type="button" class="fl-side" id="flip" title="Balik kamera">🔄</button></div>
  <p class="sub" style="text-align:center;font-size:12px;margin-top:6px" id="flhint">Mode Foto: ketuk tombol bulat untuk jepret.</p>
  <div class="fl-opts"><div><label class="lbl">Kamera</label><select class="inp" id="fc"><option value="user">Depan</option><option value="environment">Belakang</option></select></div>
  <div><label class="lbl">Timer</label><select class="inp" id="tm"><option value="0">Langsung</option><option value="3">3 detik</option><option value="5">5 detik</option></select></div></div></div>
  <div id="ed" class="hide"><div class="out"><canvas id="cv" style="width:min(100%,420px);max-height:70vh;background:#000"></canvas></div>
  <div class="row"><div><label class="lbl">Filter</label><select class="inp" id="pf"><option value="">Normal</option><option value="grayscale(1)">Hitam putih</option><option value="sepia(.8)">Sepia</option><option value="hue-rotate(-25deg) saturate(1.3)">Hangat</option><option value="hue-rotate(25deg) saturate(1.1)">Dingin</option><option value="contrast(1.3) saturate(1.5)">Vivid</option><option value="contrast(1.1) brightness(.9) saturate(.7)">Film</option><option value="blur(2px)">Blur</option></select></div>
  <div><label class="lbl">Teks</label><input class="inp" id="tx" maxlength="60" placeholder="caption (opsional)"></div></div>
  <div class="row"><div><label class="lbl">Cerah <span id="bv">100</span>%</label><input type="range" id="br" min="50" max="160" value="100" style="width:100%"></div><div><label class="lbl">Kontras <span id="cv2">100</span>%</label><input type="range" id="ct" min="50" max="160" value="100" style="width:100%"></div><div><label class="lbl">Warna <span id="sv">100</span>%</label><input type="range" id="sa" min="0" max="200" value="100" style="width:100%"></div></div>
  <div class="row" style="margin-top:12px"><button class="nb-btn" id="ro">↻ Putar</button><button class="nb-btn" id="fp">⇋ Balik</button><button class="nb-btn" id="back">📷 Kamera</button></div>
  <div class="row" style="margin-top:12px" id="acts"></div></div>
  <div class="out" id="res"></div>`;
  const v=$('#v',box),res=$('#res',box),cam=$('#cam',box),ed=$('#ed',box),cv=$('#cv',box),cx=cv.getContext('2d');
  let stream=null,busy=false,S=null,raf=0,AC=null,ADEST=null;
  const stop=()=>{if(stream)stream.getTracks().forEach(t=>t.stop());stream=null;};
  async function start(){
    stop();
    if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia) return note(res,'Browser tidak mendukung kamera (butuh HTTPS). Kamu tetap bisa upload foto/video.','err');
    const face=$('#fc',box).value;
    try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:face,width:{ideal:1280},height:{ideal:720}},audio:false});v.srcObject=stream;v.style.transform=face==='user'?'scaleX(-1)':'none';res.innerHTML='';}
    catch(e){note(res,'Kamera tidak bisa dibuka (izinkan akses kamera). Kamu tetap bisa upload foto/video.','err');}
  }
  $('#fc',box).onchange=start;
  const flb=$('#flb',box),flh=$('#flhint',box);
  const setMd=m=>{$('#md',box).value=m;$('#flseg',box).querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.v===m));flb.style.display=m==='live'?'':'none';flh.textContent=m==='live'?'Mode Live Photo: ketuk lalu tahan kamera 1,5 detik (merekam sebelum & sesudah jepretan).':'Mode Foto: ketuk tombol bulat untuk jepret.';};
  $('#flseg',box).onclick=e=>{const b=e.target.closest('button');if(b)setMd(b.dataset.v);};
  $('#flip',box).onclick=()=>{const f=$('#fc',box);f.value=f.value==='user'?'environment':'user';start();};
  const mime=()=>['video/webm;codecs=vp9,opus','video/webm','video/mp4'].find(t=>window.MediaRecorder&&MediaRecorder.isTypeSupported(t))||'';
  /* --- kamera --- */
  function frame(){const c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;const x=c.getContext('2d');
    if($('#fc',box).value==='user'){x.translate(c.width,0);x.scale(-1,1);} x.drawImage(v,0,0);return c;}
  async function shot(){
    const png=await new Promise(r=>frame().toBlob(r,'image/png')),url=URL.createObjectURL(png);
    const d=el('<div><img style="width:min(100%,360px);border:3px solid var(--bd);border-radius:14px"><div class="row" style="margin-top:10px"><button class="nb-btn yel">Unduh foto</button><button class="nb-btn">✏️ Edit</button></div></div>');
    d.querySelector('img').src=url;const [b1,b2]=d.querySelectorAll('button');b1.onclick=()=>save(png,'foto-'+Date.now()+'.png');b2.onclick=()=>openEd(new File([png],'foto.png',{type:'image/png'}));
    res.innerHTML='';res.appendChild(d);return d;
  }
  $('#sn',box).onclick=async()=>{
    if(busy||!stream||!v.videoWidth) return note(res,'Kamera belum siap.','err'); busy=true;
    const cd=$('#cd',box),n=+$('#tm',box).value;
    for(let i=n;i>0;i--){cd.style.display='grid';cd.textContent=i;await new Promise(r=>setTimeout(r,1000));} cd.style.display='none';
    try{
      if($('#md',box).value==='live'){
        note(res,'🔴 Live Photo… tahan kamera 1,5 detik','');
        freeze=true;post=[];const pre=ring.splice(0),still=await new Promise(r=>frame().toBlob(r,'image/png'));
        await new Promise(r=>setTimeout(r,1500));freeze=false;const fr=pre.concat(post.splice(0));
        if(fr.length<3)throw new Error('kamera belum siap, coba lagi');
        res.innerHTML='';res.appendChild(liveResult({still,frames:fr,key:Math.max(0,pre.length-1),fps:FPS,name:'live-'+Date.now()}));
      } else await shot();
      if(window.Snd&&Snd.pop) try{Snd.pop();}catch(e){}
    }catch(e){note(res,'Gagal mengambil foto: '+e.message,'err');}
    busy=false;
  };
  /* --- Live Photo ala iPhone: buffer 1,5 dtk sebelum jepretan + 1,5 dtk sesudahnya --- */
  const FPS=15,PRE=22,MAXD=720;let ring=[],post=[],freeze=false,lastT=0,ringRaf=0;
  function grab(){
    const sc=Math.min(1,MAXD/Math.max(v.videoWidth,v.videoHeight)),w=Math.round(v.videoWidth*sc),h=Math.round(v.videoHeight*sc);
    const c=(!freeze&&ring.length>=PRE&&ring.shift())||document.createElement('canvas');c.width=w;c.height=h;
    const x=c.getContext('2d');if($('#fc',box).value==='user'){x.translate(w,0);x.scale(-1,1);}x.drawImage(v,0,0,w,h);return c;}
  function ringLoop(now){ringRaf=requestAnimationFrame(ringLoop);
    if(!stream||!v.videoWidth||$('#md',box).value!=='live'||now-lastT<1000/FPS)return;lastT=now;(freeze?post:ring).push(grab());}
  ringRaf=requestAnimationFrame(ringLoop);
  $('#md',box).onchange=()=>{ring=[];};
  function liveResult(o){
    const F=o.frames,W=F[0].width,H=F[0].height,fps=o.fps||FPS;
    const w=el('<div><div style="position:relative;width:min(100%,360px);touch-action:none;user-select:none;-webkit-user-select:none;cursor:pointer"><canvas style="width:100%;display:block;border:3px solid var(--bd);border-radius:14px"></canvas><span style="position:absolute;left:10px;top:10px;background:rgba(30,30,30,.72);color:#fff;font:800 11px system-ui;padding:4px 9px 4px 7px;border-radius:99px;display:flex;gap:5px;align-items:center"><i style="width:10px;height:10px;border-radius:50%;border:2px solid #fff"></i><b class="lt">LIVE</b></span></div><p class="sub" style="margin-top:8px">Tekan &amp; tahan foto untuk memutar (di komputer: arahkan kursor).</p><div class="row"><div><label class="lbl">Efek</label><select class="inp ef"><option>Live</option><option>Loop</option><option>Bounce</option><option>Long Exposure</option></select></div></div><div class="row" style="margin-top:10px"><button class="nb-btn yel dv">Unduh video</button><button class="nb-btn df">Unduh foto</button></div><p class="small" style="margin-top:8px">Catatan: Live Photo asli iPhone berformat HEIC+MOV yang tidak bisa dibuat browser. Hasil di sini = foto + video, dan bisa diputar di viewer ini.</p></div>');
    const cvs=w.querySelector('canvas'),c=cvs.getContext('2d'),ef=w.querySelector('.ef'),lt=w.querySelector('.lt');cvs.width=W;cvs.height=H;
    let playing=false,raf=0,longImg=null;
    const longExp=()=>{const t=document.createElement('canvas');t.width=W;t.height=H;const x=t.getContext('2d');F.forEach((f,i)=>{x.globalAlpha=1/(i+1);x.drawImage(f,0,0);});return t;};
    const drawStill=()=>{if(ef.value==='Long Exposure'){longImg=longImg||longExp();c.drawImage(longImg,0,0);}else c.drawImage(F[o.key],0,0);};
    const seq=()=>{const a=[...Array(F.length).keys()];return ef.value==='Bounce'?a.concat(a.slice(1,-1).reverse()):a;};
    function stopPlay(){playing=false;cancelAnimationFrame(raf);drawStill();}
    function startPlay(){if(playing||ef.value==='Long Exposure')return;const s=seq(),loop=ef.value!=='Live';let t0=performance.now();playing=true;
      const step=now=>{if(!playing)return;let k=Math.floor((now-t0)/(1000/fps));if(k>=s.length){if(!loop){stopPlay();return;}t0=now;k=0;}c.drawImage(F[s[k]],0,0);raf=requestAnimationFrame(step);};raf=requestAnimationFrame(step);}
    const hold=w.firstElementChild;
    hold.onpointerdown=startPlay;hold.onpointerup=hold.onpointercancel=hold.onpointerleave=stopPlay;hold.onpointerenter=e=>{if(e.pointerType==='mouse')startPlay();};hold.oncontextmenu=e=>e.preventDefault();
    ef.onchange=()=>{stopPlay();lt.textContent=ef.value==='Long Exposure'?'LONG':ef.value.toUpperCase();};
    w.querySelector('.df').onclick=async()=>{const b=ef.value==='Long Exposure'?await new Promise(r=>(longImg=longImg||longExp()).toBlob(r,'image/png')):o.still;save(b,o.name+(ef.value==='Long Exposure'?'-long':'')+'.png');};
    w.querySelector('.dv').onclick=async()=>{
      if(ef.value==='Long Exposure')return window.FX&&FX.toast('Long Exposure hanya berupa foto','err');
      if(!window.MediaRecorder||!cvs.captureStream)return window.FX&&FX.toast('Browser belum mendukung ekspor video','err');
      stopPlay();const t=document.createElement('canvas');t.width=W;t.height=H;const x=t.getContext('2d'),rec=new MediaRecorder(t.captureStream(fps),mime()?{mimeType:mime()}:{}),parts=[];
      rec.ondataavailable=e=>e.data.size&&parts.push(e.data);const done=new Promise(r=>rec.onstop=r),list=[];for(let r=0;r<(ef.value==='Live'?1:3);r++)list.push(...seq());
      rec.start(200);for(const i of list){x.drawImage(F[i],0,0);await new Promise(r=>setTimeout(r,1000/fps));}rec.stop();await done;
      const vb=new Blob(parts,{type:rec.mimeType||'video/webm'});save(vb,o.name+ext(vb));};
    drawStill();return w;
  }
  /* --- editor --- */
  const P=()=>({f:$('#pf',box).value,b:$('#br',box).value,c:$('#ct',box).value,s:$('#sa',box).value,t:$('#tx',box).value.trim()});
  function draw(){
    if(!S) return; const p=P(),m=S.m,mw=S.w,mh=S.h,sw=S.rot%2===1,sc=Math.min(1,1280/Math.max(mw,mh)),W=Math.round((sw?mh:mw)*sc),H=Math.round((sw?mw:mh)*sc);
    if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;}
    cx.fillStyle='#000';cx.fillRect(0,0,W,H);cx.save();
    cx.filter=((p.f?p.f+' ':'')+'brightness('+p.b+'%) contrast('+p.c+'%) saturate('+p.s+'%)');
    cx.translate(W/2,H/2);cx.rotate(S.rot*Math.PI/2);if(S.flip)cx.scale(-1,1);cx.scale(S.z,S.z);cx.drawImage(m,-mw*sc/2,-mh*sc/2,mw*sc,mh*sc);cx.restore();
    if(p.t){cx.filter='none';cx.font='800 '+Math.round(W/13)+'px system-ui,Arial';cx.textAlign='center';cx.lineWidth=Math.round(W/90);cx.strokeStyle='rgba(0,0,0,.75)';cx.fillStyle='#fff';cx.strokeText(p.t,W/2,H-W/14,W*.92);cx.fillText(p.t,W/2,H-W/14,W*.92);}
  }
  const loop=()=>{draw();raf=requestAnimationFrame(loop);};
  function closeEd(){cancelAnimationFrame(raf);raf=0;if(S&&S.vid){S.m.pause();}S=null;ed.classList.add('hide');}
  function openEd(f){
    if(!f||!/^(image|video)\//.test(f.type)) return note(res,'Pilih file foto atau video.','err');
    stop();res.innerHTML='';const url=URL.createObjectURL(f),isV=f.type.startsWith('video/');
    const m=isV?document.createElement('video'):new Image();
    const ready=()=>{closeEd();S={m,vid:isV,w:isV?m.videoWidth:m.naturalWidth,h:isV?m.videoHeight:m.naturalHeight,rot:0,flip:false,z:1,name:f.name.replace(/\.[^.]+$/,'')};
      if(!S.w) return note(res,'File tidak bisa dibaca.','err');
      cam.classList.add('hide');ed.classList.remove('hide');buildActs();if(isV){m.loop=true;m.play().catch(()=>{});}loop();};
    if(isV){m.muted=true;m.playsInline=true;m.preload='auto';m.onloadedmetadata=ready;m.onerror=()=>note(res,'Video tidak bisa dibuka di browser ini.','err');m.src=url;}
    else{m.onload=ready;m.onerror=()=>note(res,'Gambar tidak bisa dibuka.','err');m.src=url;}
  }
  function buildActs(){
    const a=$('#acts',box);a.innerHTML='';
    const add=(t,cls,fn)=>{const b=el('<button class="nb-btn '+cls+'"></button>');b.textContent=t;b.onclick=fn;a.appendChild(b);return b;};
    if(!S.vid){
      add('⬇ Unduh foto','yel',async()=>{draw();save(await new Promise(r=>cv.toBlob(r,'image/png')),S.name+'-edit.png');});
      add('✨ Jadikan Live Photo','',()=>exportLive());
    } else {
      add('🎞 Ekspor video (edit)','yel',()=>exportVideo());
      add('📸 Ambil frame jadi foto','',async()=>{draw();save(await new Promise(r=>cv.toBlob(r,'image/png')),S.name+'-frame.png');});
    }
  }
  async function record(ms,onTick,useAudio){
    if(!window.MediaRecorder||!cv.captureStream) throw new Error('Browser belum mendukung perekaman. Coba Chrome/Safari terbaru.');
    const st=cv.captureStream(30);
    if(useAudio){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();
      if(!S.m._node){S.m._node=AC.createMediaElementSource(S.m);ADEST=AC.createMediaStreamDestination();S.m._node.connect(ADEST);}
      ADEST.stream.getAudioTracks().forEach(t=>st.addTrack(t));if(AC.state==='suspended')await AC.resume();}catch(e){}}
    const rec=new MediaRecorder(st,mime()?{mimeType:mime()}:{}),parts=[];rec.ondataavailable=e=>e.data.size&&parts.push(e.data);
    const stopped=new Promise(r=>rec.onstop=r);rec.start(200);
    await onTick();rec.stop();await stopped;return new Blob(parts,{type:rec.mimeType||'video/webm'});
  }
  const ext=b=>b.type.includes('mp4')?'.mp4':'.webm';
  async function exportLive(){
    if(busy)return;busy=true;note(res,'Membuat Live Photo…','');
    try{
      S.z=1;draw();const still=await new Promise(r=>cv.toBlob(r,'image/png'));
      const sc=Math.min(1,MAXD/Math.max(cv.width,cv.height)),w=Math.round(cv.width*sc),h=Math.round(cv.height*sc),N=36,fr=[];
      for(let i=0;i<N;i++){S.z=1+.12*Math.sin(i/(N-1)*Math.PI);draw();const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(cv,0,0,w,h);fr.push(c);}
      S.z=1;res.innerHTML='';res.appendChild(liveResult({still,frames:fr,key:0,fps:18,name:S.name+'-live'}));
    }catch(e){S&&(S.z=1);note(res,'Gagal: '+e.message,'err');}
    busy=false;
  }
  async function exportVideo(){
    if(busy)return;const m=S.m;if(m.duration>120)return note(res,'Video maksimal 2 menit untuk diedit.','err');busy=true;
    try{
      const prog=el('<div class="msg">Merekam…</div>');res.innerHTML='';res.appendChild(prog);
      m.loop=false;m.pause();m.currentTime=0;await new Promise(r=>{m.onseeked=r;setTimeout(r,500);});
      const vb=await record(0,()=>new Promise(r=>{m.onended=r;m.muted=false;m.play().catch(()=>{m.muted=true;m.play();});const iv=setInterval(()=>{prog.textContent='🔴 Merekam… '+Math.round(m.currentTime/m.duration*100)+'% (jangan tutup halaman)';if(m.ended||!S){clearInterval(iv);r();}},300);}),true);
      m.muted=true;m.loop=true;m.play().catch(()=>{});
      const d=el('<div><div class="msg ok">Video hasil edit siap.</div></div>'),vid=document.createElement('video');vid.src=URL.createObjectURL(vb);vid.controls=true;vid.playsInline=true;vid.style.cssText='width:min(100%,360px);margin-top:10px;border-radius:14px;border:3px solid var(--bd)';
      d.appendChild(vid);const b=el('<button class="nb-btn yel" style="margin-top:10px">Unduh video</button>');b.onclick=()=>save(vb,S.name+'-edit'+ext(vb));d.appendChild(b);res.innerHTML='';res.appendChild(d);
    }catch(e){note(res,'Gagal: '+e.message,'err');}
    busy=false;
  }
  $('#up',box).onchange=e=>{const f=e.target.files[0];e.target.value='';if(f)openEd(f);};
  $('#ro',box).onclick=()=>{if(S)S.rot=(S.rot+1)%4;};
  $('#fp',box).onclick=()=>{if(S)S.flip=!S.flip;};
  $('#back',box).onclick=()=>{closeEd();res.innerHTML='';cam.classList.remove('hide');start();};
  [['br','bv'],['ct','cv2'],['sa','sv']].forEach(([a,b])=>$('#'+a,box).addEventListener('input',e=>$('#'+b,box).textContent=e.target.value));
  window.addEventListener('hashchange',()=>{stop();cancelAnimationFrame(raf);cancelAnimationFrame(ringRaf);},{once:true}); start();
}

/* ---------- PASSWORD GENERATOR ---------- */
function toolPass(box){
  box.innerHTML=`<label class="lbl">Panjang: <span id="ln">16</span></label><input type="range" id="r" min="8" max="48" value="16" style="width:100%">
  <div class="row" style="margin-top:10px"><label><input type="checkbox" id="u" checked> A-Z</label><label><input type="checkbox" id="l" checked> a-z</label><label><input type="checkbox" id="n" checked> 0-9</label><label><input type="checkbox" id="s" checked> Simbol</label></div>
  <input class="inp" id="o" readonly style="margin-top:14px;font-family:ui-monospace,monospace"><div class="small" id="st" style="margin-top:6px"></div>
  <div class="row" style="margin-top:14px"><button class="nb-btn" id="g">Acak lagi</button><button class="nb-btn yel" id="c">Salin</button></div>`;
  const gen=()=>{let set='';const m={u:'ABCDEFGHJKLMNPQRSTUVWXYZ',l:'abcdefghijkmnopqrstuvwxyz',n:'23456789',s:'!@#$%^&*-_=+?'};
    for(const k in m) if($('#'+k,box).checked) set+=m[k]; if(!set){set=m.l;$('#l',box).checked=true;}
    const n=+$('#r',box).value,a=new Uint32Array(n);crypto.getRandomValues(a);$('#o',box).value=[...a].map(x=>set[x%set.length]).join('');
    $('#ln',box).textContent=n;const bits=n*Math.log2(set.length);$('#st',box).textContent='Kekuatan ≈ '+Math.round(bits)+' bit — '+(bits<60?'lemah':bits<90?'cukup':'kuat');};
  box.addEventListener('input',gen);$('#g',box).onclick=gen;$('#c',box).onclick=()=>copy($('#o',box).value,'Password disalin');gen();
}

/* ---------- ALAT TEKS ---------- */
function toolText(box){
  box.innerHTML=`<textarea class="inp" id="t" rows="6" placeholder="tempel teks di sini"></textarea><div class="small" id="info" style="margin-top:8px"></div>
  <div class="row" style="margin-top:12px"><button class="nb-btn" data-a="up">HURUF BESAR</button><button class="nb-btn" data-a="lo">huruf kecil</button><button class="nb-btn" data-a="ti">Awal Kapital</button><button class="nb-btn" data-a="sp">Rapikan spasi</button><button class="nb-btn" data-a="rv">Balik teks</button><button class="nb-btn" data-a="sl">Jadi slug</button></div>
  <div class="row" style="margin-top:12px"><button class="nb-btn yel" id="c">Salin hasil</button></div>`;
  const t=$('#t',box),info=()=>{const v=t.value,w=(v.trim().match(/\S+/g)||[]).length;$('#info',box).textContent=v.length+' karakter • '+w+' kata • '+(v?v.split(/\n/).length:0)+' baris • ±'+Math.max(w&&1,Math.ceil(w/200))+' menit baca';};
  const F={up:s=>s.toUpperCase(),lo:s=>s.toLowerCase(),ti:s=>s.toLowerCase().replace(/(^|\s)\S/g,m=>m.toUpperCase()),sp:s=>s.replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').trim(),rv:s=>[...s].reverse().join(''),sl:s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')};
  box.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{t.value=F[b.dataset.a](t.value);info();});
  t.oninput=info;$('#c',box).onclick=()=>copy(t.value,'Teks disalin');info();
}

/* ---------- LINK WHATSAPP ---------- */
function toolWaLink(box){
  box.innerHTML=`<label class="lbl">Nomor (08xx / 62xx)</label><input class="inp" id="n" inputmode="tel" placeholder="0812xxxxxxx"><label class="lbl">Pesan (opsional)</label><textarea class="inp" id="m" rows="3" placeholder="Halo, saya mau tanya…"></textarea>
  <input class="inp" id="o" readonly style="margin-top:14px"><div class="row" style="margin-top:12px"><button class="nb-btn" id="c">Salin link</button><button class="nb-btn yel" id="go">Buka WhatsApp</button></div>`;
  const mk=()=>{let n=$('#n',box).value.replace(/\D/g,'');if(n.startsWith('0'))n='62'+n.slice(1);const m=$('#m',box).value.trim();return n?'https://wa.me/'+n+(m?'?text='+encodeURIComponent(m):''):'';};
  box.addEventListener('input',()=>$('#o',box).value=mk());
  $('#c',box).onclick=()=>{const u=mk();u?copy(u,'Link disalin'):window.FX&&FX.toast('Isi nomor dulu','err');};
  $('#go',box).onclick=()=>{const u=mk();u?window.open(u,'_blank','noopener'):window.FX&&FX.toast('Isi nomor dulu','err');};
}

/* ---------- KALKULATOR DISKON & PPN ---------- */
function toolCalc(box){
  box.innerHTML=`<div class="row"><div><label class="lbl">Harga (Rp)</label><input class="inp" id="h" type="number" min="0" placeholder="150000"></div><div><label class="lbl">Diskon (%)</label><input class="inp" id="d" type="number" min="0" max="100" value="0"></div><div><label class="lbl">PPN (%)</label><input class="inp" id="p" type="number" min="0" value="0"></div></div>
  <div id="o" style="margin-top:14px"></div>`;
  const run=()=>{const h=+$('#h',box).value||0,d=+$('#d',box).value||0,p=+$('#p',box).value||0,pot=h*d/100,sub=h-pot,ppn=sub*p/100;
    $('#o',box).innerHTML='';[['Harga awal',rp(h)],['Potongan diskon','−'+rp(pot)],['Setelah diskon',rp(sub)],['PPN',rp(ppn)],['Total bayar',rp(sub+ppn)]].forEach(([a,b],i,r)=>{const x=el('<div class="pay-line" style="display:flex;justify-content:space-between;border:2px solid var(--bd);border-radius:12px;padding:10px 12px;margin-top:6px;font-weight:700"><span></span><b></b></div>');x.children[0].textContent=a;x.children[1].textContent=b;if(i===r.length-1)x.style.background='var(--acc)';$('#o',box).appendChild(x);});};
  box.addEventListener('input',run);run();
}

/* ---------- TEKS KEREN (font unicode) ---------- */
function toolFancy(box){
  box.innerHTML=`<label class="lbl">Teks</label><input class="inp" id="t" maxlength="60" placeholder="ketik nama / bio" value="Yanzii"><div id="o" style="margin-top:12px"></div>`;
  const mk=(U,L,N)=>s=>[...s].map(c=>{const i=c.charCodeAt(0);if(i>=65&&i<=90&&U)return String.fromCodePoint(U+i-65);if(i>=97&&i<=122&&L)return String.fromCodePoint(L+i-97);if(i>=48&&i<=57&&N)return String.fromCodePoint(N+i-48);return c;}).join('');
  const S=[['Tebal',mk(0x1D400,0x1D41A,0x1D7CE)],['Miring',mk(0x1D434,0x1D44E,0)],['Tebal miring',mk(0x1D468,0x1D482,0)],['Script',mk(0x1D4D0,0x1D4EA,0)],['Fraktur',mk(0x1D56C,0x1D586,0)],['Double',mk(0x1D538,0x1D552,0x1D7D8)],['Monospace',mk(0x1D670,0x1D68A,0x1D7F6)],['Bulat',mk(0x24B6,0x24D0,0)],['Kotak',mk(0x1F130,0x1F130,0)]];
  const run=()=>{const v=$('#t',box).value,o=$('#o',box);o.innerHTML='';S.forEach(([n,f])=>{const r=el('<div style="display:flex;gap:8px;align-items:center;margin-top:8px"><div style="flex:1;min-width:0;word-break:break-all;border:2px solid var(--bd);border-radius:12px;padding:10px 12px"></div><button class="nb-btn" style="padding:8px 12px">Salin</button></div>');const x=f(v);r.firstChild.textContent=x;r.lastChild.onclick=()=>copy(x,n+' disalin');o.appendChild(r);});};
  $('#t',box).oninput=run;run();
}

/* ---------- BASE64 & JSON ---------- */
function toolCode(box){
  box.innerHTML=`<textarea class="inp" id="t" rows="7" placeholder="tempel teks / JSON"></textarea>
  <div class="row" style="margin-top:12px"><button class="nb-btn" data-a="be">Base64 encode</button><button class="nb-btn" data-a="bd">Base64 decode</button><button class="nb-btn" data-a="ue">URL encode</button><button class="nb-btn" data-a="ud">URL decode</button><button class="nb-btn" data-a="jf">Rapikan JSON</button><button class="nb-btn" data-a="jm">Kecilkan JSON</button></div>
  <div id="o"></div><div class="row" style="margin-top:12px"><button class="nb-btn yel" id="c">Salin</button></div>`;
  const u8=s=>btoa(String.fromCharCode(...new TextEncoder().encode(s))),d8=s=>new TextDecoder().decode(Uint8Array.from(atob(s.trim()),c=>c.charCodeAt(0)));
  const F={be:u8,bd:d8,ue:encodeURIComponent,ud:decodeURIComponent,jf:s=>JSON.stringify(JSON.parse(s),null,2),jm:s=>JSON.stringify(JSON.parse(s))};
  const t=$('#t',box);box.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{try{t.value=F[b.dataset.a](t.value);$('#o',box).innerHTML='';}catch(e){note($('#o',box),'Input tidak valid untuk operasi ini.','err');}});
  $('#c',box).onclick=()=>copy(t.value);
}

/* ---------- UBAH UKURAN & FORMAT GAMBAR ---------- */
function toolResize(box){
  box.innerHTML=`<input type="file" id="f" accept="image/*" class="inp"><div class="row"><div><label class="lbl">Lebar (px)</label><input class="inp" id="w" type="number" min="16" placeholder="otomatis"></div><div><label class="lbl">Format</label><select class="inp" id="fm"><option value="image/png">PNG</option><option value="image/jpeg">JPG</option><option value="image/webp">WebP</option></select></div></div>
  <div class="row" style="margin-top:14px"><button class="nb-btn yel" id="go">Proses</button></div><div class="out" id="o"></div>`;
  const o=$('#o',box);
  $('#go',box).onclick=async()=>{const f=$('#f',box).files[0];if(!f)return note(o,'Pilih gambar dulu.','err');
    try{const bmp=await createImageBitmap(f),w=+$('#w',box).value||bmp.width,h=Math.round(bmp.height*w/bmp.width),c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d'),t=$('#fm',box).value;
      if(t==='image/jpeg'){x.fillStyle='#fff';x.fillRect(0,0,w,h);} x.drawImage(bmp,0,0,w,h);
      const b=await new Promise(r=>c.toBlob(r,t,.92));if(!b)throw new Error('format tidak didukung');const ext={'image/png':'png','image/jpeg':'jpg','image/webp':'webp'}[b.type]||'png';
      o.innerHTML='';const im=new Image();im.src=URL.createObjectURL(b);im.style.width='min(100%,360px)';o.appendChild(im);o.appendChild(el('<div class="msg ok">'+w+'×'+h+' px • '+Math.max(1,Math.round(b.size/1024))+' KB</div>'));
      const r=el('<div class="row" style="margin-top:12px"><button class="nb-btn yel">Unduh</button></div>');r.firstChild.onclick=()=>save(b,'gambar.'+ext);o.appendChild(r);
    }catch(e){note(o,'Gagal: '+(e.message||'file tidak valid'),'err');}};
}

window.EXTRA_TOOLS=[
 {id:'fotolive',ico:'📸',name:'Foto Live',desc:'Kamera, upload & edit foto/video, Live Photo',fn:toolLive},
 {id:'resize',ico:'📐',name:'Ubah Ukuran Gambar',desc:'Resize & ganti format PNG/JPG/WebP',fn:toolResize},
 {id:'wa',ico:'📲',name:'Link WhatsApp',desc:'Buat link chat wa.me + pesan otomatis',fn:toolWaLink},
 {id:'pass',ico:'🔐',name:'Password Generator',desc:'Password acak yang kuat',fn:toolPass},
 {id:'teks',ico:'📝',name:'Alat Teks',desc:'Hitung kata, ubah huruf, rapikan teks',fn:toolText},
 {id:'fancy',ico:'🔤',name:'Teks Keren',desc:'Font unik untuk bio & nama',fn:toolFancy},
 {id:'kalk',ico:'🧮',name:'Kalkulator Diskon',desc:'Hitung diskon & PPN',fn:toolCalc},
 {id:'kode',ico:'🧩',name:'Base64 & JSON',desc:'Encode/decode, rapikan JSON',fn:toolCode}
];
})();
