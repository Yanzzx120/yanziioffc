/* ===== Tools: semua lokal di browser, kecuali TikTok & upload (butuh jaringan, ada fallback) ===== */
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

/* ---------- TikTok downloader ---------- */
async function getJSON(url){
  const tries=[u=>u]; if(SHOP.proxy) tries.unshift(u=>SHOP.proxy+encodeURIComponent(u));
  tries.push(u=>'https://api.allorigins.win/raw?url='+encodeURIComponent(u), u=>'https://corsproxy.io/?'+encodeURIComponent(u));
  let last; for(const f of tries){ try{ const r=await timedFetch(f(url),{},15000); if(!r.ok) throw new Error('HTTP '+r.status); return await r.json(); }catch(e){ last=e; } }
  throw last||new Error('gagal');
}
function toolTikTok(box){
  box.innerHTML=`<label class="lbl">Link TikTok</label><input class="inp" id="u" placeholder="https://vt.tiktok.com/... atau https://www.tiktok.com/@user/video/..." inputmode="url">
  <div class="row" style="margin-top:14px"><button class="nb-btn yel" id="go">Ambil Video</button></div><div class="out" id="out"></div>`;
  const out=$('#out',box);
  $('#go',box).onclick=async()=>{
    const link=$('#u',box).value.trim(); if(!/^https?:\/\/(www\.|vt\.|vm\.|m\.)?tiktok\.com\//i.test(link)) return note(out,'Masukkan link TikTok yang valid.','err');
    busy(out,'Mengambil data…'); $('#go',box).disabled=true;
    try{
      const j=await getJSON('https://www.tikwm.com/api/?hd=1&url='+encodeURIComponent(link));
      if(j.code!==0||!j.data) throw new Error(j.msg||'Video tidak ditemukan / privat');
      const d=j.data, abs=u=>u&&u.startsWith('/')?'https://www.tikwm.com'+u:u; out.innerHTML='';
      const cap=document.createElement('p'); cap.className='sub'; cap.style.margin='10px 0'; cap.textContent=((d.author&&d.author.nickname)?d.author.nickname+' — ':'')+(d.title||''); 
      if(d.images&&d.images.length){ out.appendChild(cap); const g=el('<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(130px,1fr))"></div>');
        d.images.forEach((im,i)=>{ const a=el('<button class="nb-btn" style="flex-direction:column;padding:8px"><img style="width:100%;border-radius:8px"><span>Foto '+(i+1)+'</span></button>'); a.querySelector('img').src=im; a.onclick=()=>download(im,'tiktok-'+(i+1)+'.jpg',out); g.appendChild(a); }); out.appendChild(g); }
      else { const v=document.createElement('video'); v.src=abs(d.play); v.controls=true; v.playsInline=true; v.poster=d.cover||''; v.style.width='min(100%,320px)'; out.appendChild(v); out.appendChild(cap); }
      const row=el('<div class="row"></div>');
      [['Video tanpa watermark',abs(d.hdplay||d.play),'tiktok.mp4'],['Dengan watermark',abs(d.wmplay),'tiktok-wm.mp4'],['Audio (MP3)',abs(d.music),'tiktok.mp3']].forEach(([t,u,n])=>{ if(!u||(d.images&&d.images.length&&n.endsWith('mp4'))) return; const b=el('<button class="nb-btn yel"></button>'); b.textContent=t; b.onclick=()=>download(u,n,out); row.appendChild(b); });
      out.appendChild(row);
    }catch(e){ note(out,'Gagal: '+(e.message||e)+'. Pastikan link publik, atau isi SHOP.proxy di js/config.js (lihat worker/proxy.js).','err'); }
    $('#go',box).disabled=false;
  };
}

/* ---------- Uploader (Catbox + fallback) ---------- */
async function upCatbox(f){ const eps=[]; const api='https://catbox.moe/user/api.php'; if(SHOP.proxy) eps.push(SHOP.proxy+encodeURIComponent(api)); eps.push(api);
  for(const ep of eps){ try{ const fd=new FormData(); fd.append('reqtype','fileupload'); fd.append('fileToUpload',f); const r=await timedFetch(ep,{method:'POST',body:fd},120000); const t=(await r.text()).trim(); if(/^https?:\/\//.test(t)) return t; }catch(e){} } throw 0; }
async function upUguu(f){ const fd=new FormData(); fd.append('files[]',f); const r=await timedFetch('https://uguu.se/upload',{method:'POST',body:fd},120000); const j=await r.json(); if(j.files&&j.files[0]) return j.files[0].url; throw 0; }
async function upTmp(f){ const fd=new FormData(); fd.append('file',f); const r=await timedFetch('https://tmpfiles.org/api/v1/upload',{method:'POST',body:fd},120000); const j=await r.json(); if(j.data&&j.data.url) return j.data.url.replace('tmpfiles.org/','tmpfiles.org/dl/').replace('http://','https://'); throw 0; }
function toolUpload(box){
  box.innerHTML=`<label class="lbl">Pilih file (maks 100 MB)</label><input class="inp" id="f" type="file">
  <div class="row" style="margin-top:14px"><button class="nb-btn yel" id="go">Upload</button></div><div class="out" id="out"></div>`;
  const out=$('#out',box);
  $('#go',box).onclick=async()=>{
    const f=$('#f',box).files[0]; if(!f) return note(out,'Pilih file dulu.','err'); if(f.size>100*1048576) return note(out,'File lebih dari 100 MB.','err');
    $('#go',box).disabled=true; let url='', via='';
    for(const [n,fn] of [['Catbox',upCatbox],['Uguu',upUguu],['TmpFiles',upTmp]]){ busy(out,'Mengunggah ke '+n+'…'); try{ url=await fn(f); via=n; break; }catch(e){} }
    $('#go',box).disabled=false;
    if(!url) return note(out,'Semua server upload gagal / diblokir jaringan. Isi SHOP.proxy di js/config.js agar Catbox bisa dipakai.','err');
    out.innerHTML=''; const m=el('<div class="msg ok"></div>'); m.textContent='Berhasil via '+via+(via==='Catbox'?'':' (server cadangan, file bersifat sementara)'); out.appendChild(m);
    const i=el('<input class="inp" readonly style="margin-top:12px">'); i.value=url; out.appendChild(i);
    const r=el('<div class="row" style="margin-top:12px"><button class="nb-btn yel">Salin link</button><a class="nb-btn" target="_blank" rel="noopener">Buka</a></div>'); r.querySelector('a').href=url;
    r.querySelector('button').onclick=async e=>{ try{ await navigator.clipboard.writeText(url); }catch(_){ i.select(); document.execCommand('copy'); } e.target.textContent='Tersalin ✓'; }; out.appendChild(r);
  };
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

/* ---------- registry & router ---------- */
const TOOLS=[
 {id:'brat',ico:'🟩',name:'Brat',desc:'Generator gambar teks gaya brat',fn:toolBrat},
 {id:'bratvideo',ico:'🎬',name:'Brat Video',desc:'Teks muncul kata per kata jadi video',fn:toolBratVideo},
 {id:'iqc',ico:'💬',name:'IQC',desc:'Quote chat ala iPhone / WhatsApp',fn:toolIQC},
 {id:'tiktok',ico:'🎵',name:'TikTok Downloader',desc:'Unduh video tanpa watermark & MP3',fn:toolTikTok},
 {id:'catbox',ico:'📦',name:'Catbox Upload',desc:'Upload file jadi link (fallback otomatis)',fn:toolUpload},
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
