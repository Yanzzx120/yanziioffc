/* ===== Tools: semua jalan lokal di browser ===== */
(function(){
const $ = (s, c=document) => c.querySelector(s);


/* ---------- util ---------- */
function el(html){ const t=document.createElement('template'); t.innerHTML=html.trim(); return t.content.firstElementChild; }
function note(box, text, type){ box.innerHTML=''; const d=document.createElement('div'); d.className='msg '+(type||''); d.textContent=text; box.appendChild(d); }
function busy(box, text){ box.innerHTML='<div class="msg"><span class="spin"></span> '+text+'</div>'; }
function saveBlob(blob, name){ const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),4000); }
function fmtSize(b){ return b>1048576 ? (b/1048576).toFixed(2)+' MB' : Math.max(1,Math.round(b/1024))+' KB'; }
async function timedFetch(url, opt, ms){ const c=new AbortController(); const t=setTimeout(()=>c.abort(), ms||15000); try{ return await fetch(url, Object.assign({signal:c.signal}, opt||{})); } finally{ clearTimeout(t); } }
function toBlob(canvas, type, q){ return new Promise(r=>canvas.toBlob(r, type, q)); }
async function download(url, name, box){
  try{ const r=await timedFetch(url,{},30000); if(!r.ok) throw 0; saveBlob(await r.blob(), name); }
  catch(e){ window.open(url,'_blank','noopener'); if(box) note(box,'Browser memblokir unduh langsung, file dibuka di tab baru — tekan lama / simpan dari sana.',''); }
}

/* ---------- BRAT (canvas) ---------- */
const BRAT_THEME = { green:{bg:'#8ace00',fg:'#000'}, white:{bg:'#ffffff',fg:'#000'}, black:{bg:'#000000',fg:'#fff'} };
function bratLayout(ctx, text, S){
  const pad = S*0.06, maxW = S-2*pad, maxH = S-2*pad, words = text.split(/\s+/).filter(Boolean);
  for(let fs=Math.floor(S*0.5); fs>=8; fs-=2){
    ctx.font = fs+'px Arial, "Helvetica Neue", sans-serif';
    const sp = ctx.measureText(' ').width, lines=[]; let cur=[], w=0, tooWide=false;
    for(const wd of words){
      const ww = ctx.measureText(wd).width; if(ww>maxW){ tooWide=true; break; }
      if(cur.length && w+sp+ww>maxW){ lines.push(cur); cur=[wd]; w=ww; } else { w += (cur.length?sp:0)+ww; cur.push(wd); }
    }
    if(tooWide) continue; if(cur.length) lines.push(cur);
    if(lines.length*fs*1.08 <= maxH || fs<=8) return {fs, lines, pad, maxW};
  }
  return {fs:8, lines:[words], pad, maxW};
}
function drawBrat(canvas, text, theme, S, upto){
  const c = canvas, ctx = c.getContext('2d'); c.width=c.height=S;
  const th = BRAT_THEME[theme] || BRAT_THEME.green;
  ctx.fillStyle = th.bg; ctx.fillRect(0,0,S,S);
  let words = text.trim().split(/\s+/).filter(Boolean); if(upto) words = words.slice(0, upto);
  if(!words.length) return;
  const L = bratLayout(ctx, words.join(' '), S);
  try{ ctx.letterSpacing = (-L.fs*0.03)+'px'; }catch(e){}
  ctx.font = L.fs+'px Arial, "Helvetica Neue", sans-serif'; ctx.fillStyle = th.fg; ctx.textBaseline='alphabetic';
  const blur = Math.max(1, S/300);
  if('filter' in ctx) ctx.filter = 'blur('+blur+'px)'; else { ctx.shadowColor=th.fg; ctx.shadowBlur=blur*2; }
  const lh = L.fs*1.08;
  L.lines.forEach((ln, i) => {
    const y = L.pad + i*lh + L.fs*0.85; const widths = ln.map(w=>ctx.measureText(w).width);
    const total = widths.reduce((a,b)=>a+b,0), last = i===L.lines.length-1;
    const gap = (ln.length>1 && !last) ? (L.maxW-total)/(ln.length-1) : ctx.measureText(' ').width;
    let x = L.pad; ln.forEach((w,k)=>{ ctx.fillText(w, x, y); x += widths[k]+gap; });
  });
  if('filter' in ctx) ctx.filter='none';
}
function toolBrat(box){
  box.innerHTML = `<label class="lbl">Teks</label><textarea class="inp" id="t" rows="3" maxlength="300" placeholder="ketik teks brat kamu">hai semua</textarea>
  <div class="row"><div><label class="lbl">Warna</label><select class="inp" id="th"><option value="green">Hijau (brat)</option><option value="white">Putih</option><option value="black">Hitam</option></select></div>
  <div><label class="lbl">Ukuran</label><select class="inp" id="sz"><option value="512">512 px</option><option value="1024">1024 px</option></select></div></div>
  <div class="out"><canvas id="cv" style="width:min(100%,380px)"></canvas></div>
  <div class="row" style="margin-top:14px"><button class="nb-btn yel" id="dl">Unduh PNG</button></div>`;
  const draw=()=>drawBrat($('#cv',box), $('#t',box).value||' ', $('#th',box).value, +$('#sz',box).value);
  ['input','change'].forEach(e=>box.addEventListener(e,draw)); draw();
  $('#dl',box).onclick=async()=>saveBlob(await toBlob($('#cv',box),'image/png'),'brat.png');
}

/* ---------- BRAT VIDEO (canvas + MediaRecorder) ---------- */
function toolBratVideo(box){
  const ok = window.MediaRecorder && HTMLCanvasElement.prototype.captureStream;
  box.innerHTML = `<label class="lbl">Teks</label><textarea class="inp" id="t" rows="3" maxlength="200" placeholder="ketik teks, tiap kata muncul bergantian">aku suka bikin video brat</textarea>
  <div class="row"><div><label class="lbl">Warna</label><select class="inp" id="th"><option value="green">Hijau (brat)</option><option value="white">Putih</option><option value="black">Hitam</option></select></div>
  <div><label class="lbl">Kecepatan</label><select class="inp" id="sp"><option value="600">Santai</option><option value="420" selected>Normal</option><option value="250">Cepat</option></select></div></div>
  <div class="row" style="margin-top:14px"><button class="nb-btn yel" id="go">Buat Video</button></div>
  <div class="out" id="out"></div>`;
  const out=$('#out',box); if(!ok){ note(out,'Browser ini belum mendukung perekaman video canvas. Coba Chrome / Safari terbaru.','err'); $('#go',box).disabled=true; return; }
  $('#go',box).onclick=()=>{
    const text=$('#t',box).value.trim(); if(!text) return note(out,'Isi teks dulu.','err');
    const words=text.split(/\s+/), per=+$('#sp',box).value, hold=1200, total=words.length*per+hold, th=$('#th',box).value;
    const cv=document.createElement('canvas'); drawBrat(cv,words[0],th,512);
    const types=['video/mp4;codecs=avc1','video/mp4','video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'];
    const mt=types.find(t=>MediaRecorder.isTypeSupported(t))||'';
    let rec; try{ rec=new MediaRecorder(cv.captureStream(30), mt?{mimeType:mt, videoBitsPerSecond:4e6}:undefined); }catch(e){ return note(out,'Gagal memulai perekaman: '+e.message,'err'); }
    const chunks=[]; rec.ondataavailable=e=>{ if(e.data.size) chunks.push(e.data); };
    busy(out,'Merender video…'); $('#go',box).disabled=true;
    rec.onstop=()=>{
      const type=(rec.mimeType||mt||'video/webm').split(';')[0], ext=type.includes('mp4')?'mp4':'webm';
      const blob=new Blob(chunks,{type}); const url=URL.createObjectURL(blob);
      out.innerHTML=''; const v=document.createElement('video'); v.src=url; v.controls=true; v.loop=true; v.autoplay=true; v.muted=true; v.playsInline=true; v.style.width='min(100%,380px)'; out.appendChild(v);
      const b=el('<div class="row" style="margin-top:14px"><button class="nb-btn yel">Unduh '+ext.toUpperCase()+'</button></div>'); b.firstChild.onclick=()=>saveBlob(blob,'bratvideo.'+ext); out.appendChild(b);
      $('#go',box).disabled=false;
    };
    rec.start(); const t0=performance.now(); let last=0;
    const tick=setInterval(()=>{
      const n=Math.min(words.length, Math.floor((performance.now()-t0)/per)+1);
      if(n!==last){ drawBrat(cv,text,th,512,n); last=n; } else { const x=cv.getContext('2d'); x.fillStyle='rgba(0,0,0,0)'; x.fillRect(0,0,1,1); }
      if(performance.now()-t0>=total){ clearInterval(tick); rec.stop(); }
    },33);
  };
}

/* ---------- IQC (iPhone quote chat, canvas) ---------- */
function rrect(c,x,y,w,h,r){ c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath(); }
function wrapText(c,t,maxW){ const out=[]; t.split('\n').forEach(par=>{ let line=''; par.split(' ').forEach(w=>{ const test=line?line+' '+w:w; if(c.measureText(test).width>maxW && line){ out.push(line); line=w; } else line=test; }); out.push(line); }); return out; }
function drawIQC(cv,o){
  const W=700,H=1400; cv.width=W; cv.height=H; const c=cv.getContext('2d'), dk=o.theme==='dark';
  const col={bg:dk?'#0b141a':'#e8dfd3', bar:dk?'#1f2c34':'#f6f6f6', fg:dk?'#e9edef':'#111', sub:dk?'#8696a0':'#667781', inB:dk?'#202c33':'#ffffff', outB:dk?'#005c4b':'#d9fdd3'};
  c.fillStyle=col.bg; c.fillRect(0,0,W,H);
  c.fillStyle=col.bar; c.fillRect(0,0,W,200);
  const F='-apple-system,"SF Pro Text","Helvetica Neue",Arial,sans-serif';
  // status bar
  c.fillStyle=col.fg; c.font='700 30px '+F; c.textAlign='left'; c.fillText(o.time,48,56);
  for(let i=0;i<4;i++){ c.fillRect(470+i*12,60-(10+i*5),8,10+i*5); }
  c.font='600 24px '+F; c.textAlign='right'; c.fillText(o.carrier,455,52);
  c.lineWidth=4; c.strokeStyle=col.fg; c.lineCap='round';
  for(let r=1;r<=3;r++){ c.beginPath(); c.arc(548,56,r*7,Math.PI*1.25,Math.PI*1.75); c.stroke(); }
  c.fillStyle=col.fg; c.beginPath(); c.arc(548,52,3,0,7); c.fill();
  rrect(c,580,32,70,32,9); c.globalAlpha=.4; c.stroke(); c.globalAlpha=1;
  const pct=Math.max(1,Math.min(100,o.battery)); c.fillStyle=pct<=20?'#ef4444':col.fg; rrect(c,584,36,62*pct/100,24,6); c.fill();
  c.fillStyle=col.fg; c.fillRect(653,43,4,10);
  // header
  c.strokeStyle=col.fg; c.lineWidth=5; c.beginPath(); c.moveTo(52,130); c.lineTo(32,150); c.lineTo(52,170); c.stroke();
  c.fillStyle='#9aa7b0'; c.beginPath(); c.arc(112,150,34,0,7); c.fill();
  c.fillStyle='#fff'; c.font='700 34px '+F; c.textAlign='center'; c.fillText((o.name[0]||'?').toUpperCase(),112,162);
  c.textAlign='left'; c.fillStyle=col.fg; c.font='700 32px '+F; c.fillText(o.name.slice(0,22),166,146);
  c.fillStyle=col.sub; c.font='400 22px '+F; c.fillText('online',166,178);
  // bubbles
  let y=260; const maxW=W*0.68, fs=30;
  function bubble(text,mine,tm){
    c.font='400 '+fs+'px '+F; const lines=wrapText(c,text,maxW-40);
    let w=Math.max(...lines.map(l=>c.measureText(l).width))+40; w=Math.max(w, 150+ (mine?40:0));
    const h=lines.length*(fs*1.35)+60, x=mine?W-w-34:34;
    c.fillStyle=mine?col.outB:col.inB; rrect(c,x,y,w,h,22); c.fill();
    c.beginPath(); if(mine){ c.moveTo(x+w-22,y+h-30); c.lineTo(x+w+12,y+h); c.lineTo(x+w-30,y+h-4); } else { c.moveTo(x+22,y+h-30); c.lineTo(x-12,y+h); c.lineTo(x+30,y+h-4); } c.fill();
    c.fillStyle=col.fg; c.font='400 '+fs+'px '+F; c.textAlign='left'; lines.forEach((l,i)=>c.fillText(l,x+20,y+20+fs+i*fs*1.35-6));
    c.fillStyle=col.sub; c.font='400 20px '+F; c.textAlign='right'; c.fillText(tm+(mine?'  ✓✓':''),x+w-16,y+h-14); c.textAlign='left';
    y+=h+22;
  }
  bubble(o.msg,false,o.time);
  if(o.reply) bubble(o.reply,true,o.time);
  // input bar
  c.fillStyle=col.bar; c.fillRect(0,H-130,W,130);
  c.fillStyle=dk?'#2a3942':'#fff'; rrect(c,90,H-112,500,66,33); c.fill();
  c.fillStyle=col.sub; c.font='400 26px '+F; c.fillText('Message',120,H-70);
  c.font='600 42px '+F; c.fillText('+',34,H-68);
  c.fillStyle='#25d366'; c.beginPath(); c.arc(645,H-79,33,0,7); c.fill();
  c.fillStyle='#fff'; rrect(c,636,H-102,18,32,9); c.fill();
}
function toolIQC(box){
  const now=new Date(), hh=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
  box.innerHTML = `<div class="row"><div><label class="lbl">Nama kontak</label><input class="inp" id="nm" value="Yanzii" maxlength="22"></div>
  <div><label class="lbl">Jam</label><input class="inp" id="tm" value="${hh}" maxlength="5"></div></div>
  <label class="lbl">Pesan masuk</label><textarea class="inp" id="msg" rows="3" maxlength="400">Halo, ini contoh quote chat iPhone</textarea>
  <label class="lbl">Balasan (opsional)</label><textarea class="inp" id="rp" rows="2" maxlength="300"></textarea>
  <div class="row"><div><label class="lbl">Provider</label><input class="inp" id="cr" value="Telkomsel" maxlength="12"></div>
  <div><label class="lbl">Baterai %</label><input class="inp" id="bt" type="number" min="1" max="100" value="87"></div>
  <div><label class="lbl">Tema</label><select class="inp" id="th"><option value="light">Terang</option><option value="dark">Gelap</option></select></div></div>
  <div class="out"><canvas id="cv" style="width:min(100%,340px)"></canvas></div>
  <div class="row" style="margin-top:14px"><button class="nb-btn yel" id="dl">Unduh PNG</button></div>`;
  const draw=()=>drawIQC($('#cv',box),{name:$('#nm',box).value||'Kontak',time:$('#tm',box).value||hh,msg:$('#msg',box).value||' ',reply:$('#rp',box).value.trim(),carrier:$('#cr',box).value,battery:+$('#bt',box).value||50,theme:$('#th',box).value});
  ['input','change'].forEach(e=>box.addEventListener(e,draw)); draw();
  $('#dl',box).onclick=async()=>saveBlob(await toBlob($('#cv',box),'image/png'),'iqc.png');
}

/* ---------- QR generator ---------- */
function toolQR(box){
  box.innerHTML=`<label class="lbl">Teks / link</label><textarea class="inp" id="t" rows="2" maxlength="500" placeholder="https://...">https://</textarea>
  <div class="row" style="margin-top:14px"><button class="nb-btn yel" id="go">Buat QR</button></div><div class="out" id="out"></div>`;
  const out=$('#out',box);
  $('#go',box).onclick=()=>{ const t=$('#t',box).value.trim(); if(!t) return note(out,'Isi teks dulu.','err');
    const u='https://api.qrserver.com/v1/create-qr-code/?size=500x500&margin=10&data='+encodeURIComponent(t);
    out.innerHTML=''; const im=new Image(); im.alt='QR'; im.style.width='min(100%,320px)'; im.onerror=()=>note(out,'Gagal memuat QR (cek koneksi).','err'); im.src=u; out.appendChild(im);
    const b=el('<div class="row" style="margin-top:14px"><button class="nb-btn yel">Unduh PNG</button></div>'); b.firstChild.onclick=()=>download(u,'qr.png',out); out.appendChild(b); };
}

/* ---------- Kompres gambar ---------- */
function toolCompress(box){
  box.innerHTML=`<label class="lbl">Gambar</label><input class="inp" id="f" type="file" accept="image/*">
  <div class="row"><div><label class="lbl">Kualitas <b id="qv">70</b>%</label><input id="q" type="range" min="10" max="95" value="70" style="width:100%"></div>
  <div><label class="lbl">Lebar maks (px)</label><input class="inp" id="w" type="number" value="1280" min="100"></div>
  <div><label class="lbl">Format</label><select class="inp" id="fm"><option value="image/jpeg">JPG</option><option value="image/webp">WebP</option></select></div></div>
  <div class="row" style="margin-top:14px"><button class="nb-btn yel" id="go">Kompres</button></div><div class="out" id="out"></div>`;
  const out=$('#out',box); $('#q',box).oninput=e=>$('#qv',box).textContent=e.target.value;
  $('#go',box).onclick=async()=>{
    const f=$('#f',box).files[0]; if(!f) return note(out,'Pilih gambar dulu.','err');
    busy(out,'Memproses…');
    try{
      const bmp=await (window.createImageBitmap?createImageBitmap(f):new Promise((ok,no)=>{ const i=new Image(); i.onload=()=>ok(i); i.onerror=no; i.src=URL.createObjectURL(f); }));
      const mw=Math.max(100,+$('#w',box).value||1280), s=Math.min(1,mw/bmp.width), cv=document.createElement('canvas'); cv.width=Math.round(bmp.width*s); cv.height=Math.round(bmp.height*s);
      const x=cv.getContext('2d'); x.fillStyle='#fff'; x.fillRect(0,0,cv.width,cv.height); x.drawImage(bmp,0,0,cv.width,cv.height);
      const type=$('#fm',box).value, b=await toBlob(cv,type,$('#q',box).value/100); if(!b) throw new Error('format tidak didukung');
      const ext=b.type==='image/webp'?'webp':'jpg'; out.innerHTML=''; const im=new Image(); im.src=URL.createObjectURL(b); im.style.width='min(100%,360px)'; out.appendChild(im);
      const m=el('<div class="msg ok"></div>'); m.textContent=fmtSize(f.size)+' → '+fmtSize(b.size)+' ('+cv.width+'×'+cv.height+')'; out.appendChild(m);
      const r=el('<div class="row" style="margin-top:12px"><button class="nb-btn yel">Unduh</button></div>'); r.firstChild.onclick=()=>saveBlob(b,'compressed.'+ext); out.appendChild(r);
    }catch(e){ note(out,'Gagal memproses gambar: '+(e.message||'file tidak valid'),'err'); }
  };
}

/* ---------- BRAT AUDIO (brat video + suara, direkam di browser) ---------- */
function toolBratAudio(box){
  const ok = window.MediaRecorder && HTMLCanvasElement.prototype.captureStream && (window.AudioContext||window.webkitAudioContext);
  box.innerHTML = `<label class="lbl">Teks</label><textarea class="inp" id="t" rows="3" maxlength="200" placeholder="ketik teks, tiap kata muncul sesuai suara">aku suka bikin video brat</textarea>
  <div class="row"><div><label class="lbl">Warna</label><select class="inp" id="th"><option value="green">Hijau (brat)</option><option value="white">Putih</option><option value="black">Hitam</option></select></div>
  <div><label class="lbl">Suara</label><select class="inp" id="src"><option value="beat">Beat otomatis</option><option value="klik">Klik tiap kata</option><option value="file">Upload audio (MP3/WAV)</option></select></div></div>
  <div class="row" id="rowBeat"><div><label class="lbl">Tempo (BPM)</label><select class="inp" id="bpm"><option value="90">90 — santai</option><option value="110">110</option><option value="128" selected>128 — dance</option><option value="140">140 — cepat</option></select></div></div>
  <div class="row" id="rowKlik" style="display:none"><div><label class="lbl">Kecepatan</label><select class="inp" id="sp"><option value="600">Santai</option><option value="420" selected>Normal</option><option value="250">Cepat</option></select></div></div>
  <div id="rowFile" style="display:none"><label class="lbl">File audio (maks. 30 detik dipakai)</label><input class="inp" type="file" id="af" accept="audio/*"></div>
  <div class="row" style="margin-top:14px"><button class="nb-btn yel" id="go">Buat Video + Suara</button></div>
  <div class="out" id="out"></div>`;
  const out=$('#out',box);
  const sync=()=>{ const s=$('#src',box).value; $('#rowBeat',box).style.display=s==='beat'?'':'none'; $('#rowKlik',box).style.display=s==='klik'?'':'none'; $('#rowFile',box).style.display=s==='file'?'':'none'; };
  $('#src',box).onchange=sync; sync();
  if(!ok){ note(out,'Browser ini belum mendukung perekaman video + audio. Coba Chrome terbaru (Android/PC).','err'); $('#go',box).disabled=true; return; }
  $('#go',box).onclick=async()=>{
    const text=$('#t',box).value.trim(); if(!text) return note(out,'Isi teks dulu.','err');
    const words=text.split(/\s+/), th=$('#th',box).value, srcType=$('#src',box).value, hold=1200;
    const AC=window.AudioContext||window.webkitAudioContext; const ac=new AC(); const dest=ac.createMediaStreamDestination();
    const master=ac.createGain(); master.gain.value=0.9; master.connect(dest);
    let times=[], total=0;                                   // times[i] = ms kata ke-i muncul
    try{ await ac.resume(); }catch(e){}
    const t0=ac.currentTime+0.15;
    const blip=(t,f,d,type,g)=>{ const o=ac.createOscillator(), a=ac.createGain(); o.type=type; o.frequency.setValueAtTime(f,t); a.gain.setValueAtTime(g,t); a.gain.exponentialRampToValueAtTime(0.001,t+d); o.connect(a); a.connect(master); o.start(t); o.stop(t+d+0.02); };
    const kick=t=>{ const o=ac.createOscillator(), a=ac.createGain(); o.frequency.setValueAtTime(160,t); o.frequency.exponentialRampToValueAtTime(42,t+0.16); a.gain.setValueAtTime(1,t); a.gain.exponentialRampToValueAtTime(0.001,t+0.28); o.connect(a); a.connect(master); o.start(t); o.stop(t+0.3); };
    const hat=t=>{ const n=ac.sampleRate*0.05, b=ac.createBuffer(1,n,ac.sampleRate), d=b.getChannelData(0); for(let i=0;i<n;i++) d[i]=(Math.random()*2-1)*(1-i/n); const s=ac.createBufferSource(), f=ac.createBiquadFilter(), a=ac.createGain(); f.type='highpass'; f.frequency.value=7000; a.gain.value=0.35; s.buffer=b; s.connect(f); f.connect(a); a.connect(master); s.start(t); };
    try{
      if(srcType==='file'){
        const f=$('#af',box).files[0]; if(!f) { ac.close(); return note(out,'Pilih file audio dulu.','err'); }
        busy(out,'Membaca audio…'); const buf=await ac.decodeAudioData(await f.arrayBuffer());
        const dur=Math.min(buf.duration,30), per=Math.max(150,dur*1000/words.length);
        times=words.map((_,i)=>i*per); total=Math.max(dur*1000, words.length*per)+hold;
        const s=ac.createBufferSource(); s.buffer=buf; s.connect(master); s.start(t0,0,dur);
      } else if(srcType==='beat'){
        const bi=60/(+$('#bpm',box).value); times=words.map((_,i)=>i*bi*1000); total=words.length*bi*1000+hold;
        for(let i=0;i<words.length+Math.ceil(hold/(bi*1000));i++){ kick(t0+i*bi); hat(t0+(i+0.5)*bi); if(i%4===3) blip(t0+i*bi,220,0.12,'triangle',0.25); }
      } else {
        const per=+$('#sp',box).value; times=words.map((_,i)=>i*per); total=words.length*per+hold;
        words.forEach((_,i)=>blip(t0+i*per/1000,880+(i%4)*110,0.07,'square',0.3));
      }
    }catch(e){ try{ac.close();}catch(_){} return note(out,'Gagal menyiapkan suara: '+(e.message||'file audio tidak valid'),'err'); }
    const cv=document.createElement('canvas'); drawBrat(cv,words[0],th,512);
    const vs=cv.captureStream(30); const stream=new MediaStream([...vs.getVideoTracks(),...dest.stream.getAudioTracks()]);
    const types=['video/mp4;codecs=avc1,mp4a.40.2','video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];
    const mt=types.find(t=>MediaRecorder.isTypeSupported(t))||'';
    let rec; try{ rec=new MediaRecorder(stream, mt?{mimeType:mt, videoBitsPerSecond:4e6, audioBitsPerSecond:128000}:undefined); }catch(e){ try{ac.close();}catch(_){} return note(out,'Gagal memulai perekaman: '+e.message,'err'); }
    const chunks=[]; rec.ondataavailable=e=>{ if(e.data.size) chunks.push(e.data); };
    busy(out,'Merender video + suara… ('+Math.ceil(total/1000)+' detik)'); $('#go',box).disabled=true;
    rec.onstop=()=>{
      try{ ac.close(); }catch(e){}
      const type=(rec.mimeType||mt||'video/webm').split(';')[0], ext=type.includes('mp4')?'mp4':'webm';
      const blob=new Blob(chunks,{type}); const url=URL.createObjectURL(blob);
      out.innerHTML=''; const v=document.createElement('video'); v.src=url; v.controls=true; v.loop=true; v.playsInline=true; v.style.width='min(100%,380px)'; out.appendChild(v);
      const b=el('<div class="row" style="margin-top:14px"><button class="nb-btn yel">Unduh '+ext.toUpperCase()+'</button></div>'); b.firstChild.onclick=()=>saveBlob(blob,'brataudio.'+ext); out.appendChild(b);
      $('#go',box).disabled=false;
    };
    rec.start(); let last=-1;
    const tick=setInterval(()=>{
      const ms=(ac.currentTime-t0)*1000; let n=0; while(n<times.length && times[n]<=ms) n++;
      if(n<1) n=1;
      if(n!==last){ drawBrat(cv,text,th,512,n); last=n; } else { const x=cv.getContext('2d'); x.fillStyle='rgba(0,0,0,0)'; x.fillRect(0,0,1,1); }
      if(ms>=total){ clearInterval(tick); rec.stop(); }
    },33);
  };
}

/* ---------- registry & router ---------- */
const TOOLS=[
 {id:'brat',ico:'🟩',name:'Brat',desc:'Generator gambar teks gaya brat',fn:toolBrat},
 {id:'bratvideo',ico:'🎬',name:'Brat Video',desc:'Teks muncul kata per kata jadi video',fn:toolBratVideo},
 {id:'brataudio',ico:'🔊',name:'Brat Audio',desc:'Video brat dengan suara beat / audio',fn:toolBratAudio},
 {id:'iqc',ico:'💬',name:'IQC',desc:'Quote chat ala iPhone / WhatsApp',fn:toolIQC},
 {id:'qr',ico:'🔳',name:'QR Generator',desc:'Buat QR dari teks atau link',fn:toolQR},
 {id:'compress',ico:'🗜️',name:'Kompres Gambar',desc:'Perkecil ukuran foto, offline',fn:toolCompress}
];
(window.EXTRA_TOOLS||[]).forEach(t=>TOOLS.push(t));
const grid=$('#grid'), view=$('#view');
TOOLS.forEach(t=>{ const b=el('<button class="tool-card"><div class="ico"></div><b></b><span></span></button>'); b.querySelector('.ico').textContent=t.ico; b.querySelector('b').textContent=t.name; b.querySelector('span').textContent=t.desc; b.onclick=()=>{ location.hash=t.id; }; grid.appendChild(b); });
function route(){
  const t=TOOLS.find(x=>x.id===location.hash.slice(1)); view.innerHTML='';
  if(!t) return;
  const p=el('<div class="panel"><h2></h2><div class="tbody"></div></div>'); p.querySelector('h2').textContent=t.ico+' '+t.name; view.appendChild(p);
  try{ t.fn(p.querySelector('.tbody')); }catch(e){ note(p.querySelector('.tbody'),'Tool gagal dimuat: '+e.message,'err'); }
  p.scrollIntoView({behavior:'smooth',block:'start'});
}
window.addEventListener('hashchange',route); route();
})();
