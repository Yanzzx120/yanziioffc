/* Tools tambahan (bagian 3) — semua jalan lokal di browser, tanpa server. Dimuat setelah tools2.js, sebelum tools.js */
(function(){
const $=(s,c)=>(c||document).querySelector(s);
const el=h=>{const t=document.createElement('template');t.innerHTML=h.trim();return t.content.firstElementChild;};
const note=(b,t,k)=>{b.innerHTML='';const d=document.createElement('div');d.className='msg '+(k||'');d.textContent=t;b.appendChild(d);};
const save=(blob,n)=>{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=n;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);};
const copy=async(t,m)=>{try{await navigator.clipboard.writeText(t);window.FX&&FX.toast(m||'Disalin','ok');}catch(e){window.FX&&FX.toast('Gagal menyalin','err');}};
const rp=n=>'Rp'+Math.round(n).toLocaleString('id-ID');
const rows=(o,a)=>{o.innerHTML='';a.forEach(([k,v])=>{const d=el('<div class="pay-line" style="margin-top:6px;gap:10px"><span></span><b style="word-break:break-all;text-align:right"></b></div>');d.children[0].textContent=k;d.children[1].textContent=v;o.appendChild(d);});};
const num=(box,id)=>parseFloat(String($('#'+id,box).value).replace(',','.'));

/* ---------- HASH ---------- */
function toolHash(box){
  box.innerHTML=`<textarea class="inp" id="t" rows="4" placeholder="ketik / tempel teks"></textarea><div class="row" style="margin-top:12px"><button class="nb-btn yel" id="go">Hitung hash</button></div><div class="out" id="o"></div>`;
  $('#go',box).onclick=async()=>{const o=$('#o',box);o.innerHTML='';
    if(!window.crypto||!crypto.subtle)return note(o,'Browser butuh HTTPS untuk fitur ini.','err');
    const d=new TextEncoder().encode($('#t',box).value);
    for(const a of ['SHA-1','SHA-256','SHA-512']){const h=[...new Uint8Array(await crypto.subtle.digest(a,d))].map(b=>b.toString(16).padStart(2,'0')).join('');
      const r=el('<div style="margin-top:10px"><div class="lbl"></div><div style="word-break:break-all;font:12px monospace"></div><button class="nb-btn" style="padding:5px 10px;margin-top:5px">Salin</button></div>');
      r.children[0].textContent=a;r.children[1].textContent=h;r.children[2].onclick=()=>copy(h);o.appendChild(r);}};
}

/* ---------- WARNA ---------- */
function toolColor(box){
  box.innerHTML=`<div class="row"><div><label class="lbl">Pilih warna</label><input type="color" id="c" value="#0ea5e9" style="width:100%;height:48px;border:0;background:none"></div><div><label class="lbl">HEX</label><input class="inp" id="h" value="#0ea5e9" maxlength="7"></div></div><div id="sw" style="height:70px;border:3px solid var(--bd);border-radius:14px;margin-top:12px"></div><div class="out" id="o"></div>`;
  const o=$('#o',box);
  function run(v){v=v.trim().replace('#','');if(!/^[0-9a-f]{6}$/i.test(v))return note(o,'HEX harus 6 digit, mis. #0ea5e9','err');
    const r=parseInt(v.slice(0,2),16),g=parseInt(v.slice(2,4),16),b=parseInt(v.slice(4,6),16),R=r/255,G=g/255,B=b/255,mx=Math.max(R,G,B),mn=Math.min(R,G,B),d=mx-mn;
    let h=0;if(d){h=mx===R?((G-B)/d)%6:mx===G?(B-R)/d+2:(R-G)/d+4;h=Math.round(h*60);if(h<0)h+=360;}
    const l=(mx+mn)/2,s=d?d/(1-Math.abs(2*l-1)):0,lum=(0.2126*r+0.7152*g+0.0722*b)/255;
    $('#sw',box).style.background='#'+v;
    rows(o,[['HEX','#'+v.toUpperCase()],['RGB',`rgb(${r}, ${g}, ${b})`],['HSL',`hsl(${h}, ${Math.round(s*100)}%, ${Math.round(l*100)}%)`],['Teks yang cocok',lum>0.55?'Hitam':'Putih']]);}
  $('#c',box).oninput=e=>{$('#h',box).value=e.target.value;run(e.target.value);};
  $('#h',box).oninput=e=>{run(e.target.value);if(/^#?[0-9a-f]{6}$/i.test(e.target.value))$('#c',box).value='#'+e.target.value.replace('#','');};
  run('#0ea5e9');
}

/* ---------- HARGA JUAL & MARGIN ---------- */
function toolMargin(box){
  box.innerHTML=`<div class="row"><div><label class="lbl">Modal (Rp)</label><input class="inp" id="m" type="number" min="0" value="10000"></div><div><label class="lbl">Target untung (% dari harga jual)</label><input class="inp" id="g" type="number" min="0" max="95" value="30"></div></div>
  <div class="row"><div><label class="lbl">Biaya admin / fee (%)</label><input class="inp" id="f" type="number" min="0" max="50" value="0"></div><div><label class="lbl">Jumlah terjual</label><input class="inp" id="q" type="number" min="1" value="1"></div></div>
  <div class="out" id="o"></div>`;
  const o=$('#o',box),run=()=>{const m=num(box,'m')||0,g=num(box,'g')||0,f=num(box,'f')||0,q=Math.max(1,num(box,'q')||1);
    if(g+f>=100)return note(o,'Untung + fee harus di bawah 100%.','err');
    const p=Math.ceil(m/(1-(g+f)/100)),fee=p*f/100,profit=p-m-fee;
    rows(o,[['Harga jual disarankan',rp(p)],['Fee / biaya admin',rp(fee)],['Untung bersih / item',rp(profit)],['Untung × '+q,rp(profit*q)],['Total omzet × '+q,rp(p*q)]]);};
  box.querySelectorAll('input').forEach(i=>i.oninput=run);run();
}

/* ---------- NOTA / INVOICE ---------- */
function toolNota(box){
  box.innerHTML=`<div class="row"><div><label class="lbl">Nama toko</label><input class="inp" id="s" value="yanziioffc"></div><div><label class="lbl">Nama pembeli</label><input class="inp" id="b" placeholder="nama pembeli"></div></div>
  <label class="lbl">Item (satu per baris: nama | jumlah | harga)</label><textarea class="inp" id="i" rows="5">Capcut Pro | 1 | 7000
Panel Bot 2GB | 2 | 5000</textarea>
  <div class="row" style="margin-top:14px"><button class="nb-btn yel" id="go">Buat nota</button></div><div class="out" id="o"></div>`;
  $('#go',box).onclick=()=>{const o=$('#o',box),L=$('#i',box).value.split('\n').map(x=>x.split('|').map(s=>s.trim())).filter(x=>x[0]);
    const it=L.map(x=>({n:x[0],q:Math.max(1,parseInt(x[1])||1),p:parseFloat(x[2])||0}));if(!it.length)return note(o,'Isi minimal 1 item.','err');
    const W=600,H=260+it.length*34,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
    x.fillStyle='#fff';x.fillRect(0,0,W,H);x.fillStyle='#0b1424';x.fillRect(0,0,W,86);
    x.fillStyle='#fff';x.font='800 28px Arial';x.fillText($('#s',box).value||'Toko',24,52);x.font='14px Arial';x.fillText('NOTA PEMBELIAN',W-160,52);
    x.fillStyle='#111';x.font='14px Arial';x.fillText('Tanggal : '+new Date().toLocaleString('id-ID'),24,118);x.fillText('Pembeli : '+($('#b',box).value||'-'),24,140);
    x.font='700 14px Arial';x.fillText('Item',24,176);x.fillText('Qty',330,176);x.fillText('Harga',410,176);x.fillText('Subtotal',500,176);x.fillRect(24,184,W-48,2);
    let t=0,y=212;x.font='14px Arial';it.forEach(a=>{const s=a.q*a.p;t+=s;x.fillText(a.n.slice(0,34),24,y);x.fillText(String(a.q),336,y);x.fillText(rp(a.p),410,y);x.fillText(rp(s),500,y);y+=34;});
    x.fillRect(24,y-14,W-48,2);x.font='800 20px Arial';x.fillText('TOTAL',24,y+20);x.fillText(rp(t),W-24-x.measureText(rp(t)).width,y+20);
    x.font='12px Arial';x.fillStyle='#555';x.fillText('Terima kasih sudah berbelanja 🙏',24,H-20);
    o.innerHTML='';c.style.cssText='width:100%;max-width:420px;border:3px solid var(--bd);border-radius:12px';o.appendChild(c);
    const r=el('<div class="row" style="margin-top:12px"><button class="nb-btn yel">Unduh PNG</button></div>');r.firstChild.onclick=()=>c.toBlob(b=>save(b,'nota-'+Date.now()+'.png'));o.appendChild(r);};
}

/* ---------- ACAK / UNDI ---------- */
function toolRandom(box){
  box.innerHTML=`<label class="lbl">Daftar (satu per baris)</label><textarea class="inp" id="l" rows="6" placeholder="Andi&#10;Budi&#10;Citra"></textarea><div class="row"><div><label class="lbl">Jumlah pemenang</label><input class="inp" id="n" type="number" min="1" value="1"></div></div>
  <div class="row" style="margin-top:12px"><button class="nb-btn yel" id="go">🎲 Undi</button><button class="nb-btn" id="sh">🔀 Acak urutan</button></div><div class="out" id="o"></div>`;
  const rnd=n=>{const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]%n;};
  const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;};
  const list=()=>$('#l',box).value.split('\n').map(s=>s.trim()).filter(Boolean),o=$('#o',box);
  $('#go',box).onclick=()=>{const l=list();if(!l.length)return note(o,'Isi daftar dulu.','err');const w=shuffle(l).slice(0,Math.max(1,Math.min(l.length,+$('#n',box).value||1)));rows(o,w.map((v,i)=>['🏆 #'+(i+1),v]));};
  $('#sh',box).onclick=()=>{const l=list();if(!l.length)return note(o,'Isi daftar dulu.','err');rows(o,shuffle(l).map((v,i)=>[String(i+1),v]));};
}

/* ---------- KONVERTER UNIT ---------- */
function toolUnit(box){
  const U={Panjang:{mm:.001,cm:.01,m:1,km:1000,inci:.0254,kaki:.3048,mil:1609.344},Berat:{g:.001,kg:1,ons:.1,pon:.45359237,ton:1000},Data:{B:1,KB:1024,MB:1048576,GB:1073741824,TB:1099511627776},Suhu:{'°C':0,'°F':0,K:0}};
  box.innerHTML=`<label class="lbl">Kategori</label><select class="inp" id="k">${Object.keys(U).map(k=>`<option>${k}</option>`).join('')}</select><div class="row"><div><label class="lbl">Nilai</label><input class="inp" id="v" type="number" value="1"></div><div><label class="lbl">Dari</label><select class="inp" id="a"></select></div><div><label class="lbl">Ke</label><select class="inp" id="b"></select></div></div><div class="out" id="o"></div>`;
  const fill=()=>{const ks=Object.keys(U[$('#k',box).value]);['a','b'].forEach((i,n)=>{$('#'+i,box).innerHTML=ks.map(u=>`<option>${u}</option>`).join('');$('#'+i,box).selectedIndex=Math.min(n,ks.length-1);});run();};
  function run(){const k=$('#k',box).value,v=num(box,'v'),a=$('#a',box).value,b=$('#b',box).value,o=$('#o',box);if(isNaN(v))return note(o,'Isi nilai angka.','err');let r;
    if(k==='Suhu'){const c=a==='°C'?v:a==='°F'?(v-32)*5/9:v-273.15;r=b==='°C'?c:b==='°F'?c*9/5+32:c+273.15;}else r=v*U[k][a]/U[k][b];
    rows(o,[[v+' '+a,(+r.toPrecision(10)).toLocaleString('id-ID',{maximumFractionDigits:8})+' '+b]]);}
  $('#k',box).onchange=fill;['v','a','b'].forEach(i=>$('#'+i,box).oninput=run);['a','b'].forEach(i=>$('#'+i,box).onchange=run);fill();
}

/* ---------- SELISIH TANGGAL / UMUR ---------- */
function toolDate(box){
  const today=new Date().toISOString().slice(0,10);
  box.innerHTML=`<div class="row"><div><label class="lbl">Tanggal awal / lahir</label><input class="inp" id="a" type="date"></div><div><label class="lbl">Tanggal akhir</label><input class="inp" id="b" type="date" value="${today}"></div></div><div class="out" id="o"></div>`;
  const run=()=>{const o=$('#o',box),A=$('#a',box).value,B=$('#b',box).value;if(!A||!B)return note(o,'Pilih kedua tanggal.','err');
    let d1=new Date(A),d2=new Date(B);let neg=d2<d1;if(neg)[d1,d2]=[d2,d1];
    let y=d2.getFullYear()-d1.getFullYear(),m=d2.getMonth()-d1.getMonth(),d=d2.getDate()-d1.getDate();
    if(d<0){m--;d+=new Date(d2.getFullYear(),d2.getMonth(),0).getDate();}if(m<0){y--;m+=12;}
    const days=Math.round((d2-d1)/864e5);
    rows(o,[['Selisih',`${y} tahun ${m} bulan ${d} hari`],['Total hari',days.toLocaleString('id-ID')],['Total minggu',(days/7).toFixed(1)],['Total bulan (≈)',(y*12+m)]].concat(neg?[['Catatan','tanggal akhir lebih awal dari tanggal awal']]:[]));};
  ['a','b'].forEach(i=>$('#'+i,box).oninput=run);
}

/* ---------- UNIX TIMESTAMP ---------- */
function toolUnix(box){
  box.innerHTML=`<label class="lbl">Timestamp (detik atau milidetik)</label><input class="inp" id="t" placeholder="1700000000"><div class="row" style="margin-top:10px"><button class="nb-btn yel" id="now">Sekarang</button></div><label class="lbl" style="margin-top:14px">…atau pilih tanggal & jam</label><input class="inp" id="d" type="datetime-local"><div class="out" id="o"></div>`;
  const o=$('#o',box),show=ms=>{const d=new Date(ms);if(isNaN(d))return note(o,'Nilai tidak valid.','err');rows(o,[['Detik',Math.floor(ms/1000)],['Milidetik',ms],['Waktu lokal',d.toLocaleString('id-ID',{dateStyle:'full',timeStyle:'medium'})],['ISO (UTC)',d.toISOString()]]);};
  $('#t',box).oninput=e=>{let v=+e.target.value;if(!v)return;show(v<1e11?v*1000:v);};
  $('#d',box).oninput=e=>{if(e.target.value)show(new Date(e.target.value).getTime());};
  $('#now',box).onclick=()=>{$('#t',box).value=Math.floor(Date.now()/1000);show(Date.now());};
}

/* ---------- TERBILANG ---------- */
function toolTerbilang(box){
  const sat=['nol','satu','dua','tiga','empat','lima','enam','tujuh','delapan','sembilan','sepuluh','sebelas'];
  const tb=n=>n<12?sat[n]:n<20?tb(n-10)+' belas':n<100?tb(Math.floor(n/10))+' puluh'+(n%10?' '+tb(n%10):''):n<200?'seratus'+(n>100?' '+tb(n-100):''):n<1e3?tb(Math.floor(n/100))+' ratus'+(n%100?' '+tb(n%100):''):n<2e3?'seribu'+(n>1e3?' '+tb(n-1e3):''):n<1e6?tb(Math.floor(n/1e3))+' ribu'+(n%1e3?' '+tb(n%1e3):''):n<1e9?tb(Math.floor(n/1e6))+' juta'+(n%1e6?' '+tb(n%1e6):''):n<1e12?tb(Math.floor(n/1e9))+' miliar'+(n%1e9?' '+tb(n%1e9):''):tb(Math.floor(n/1e12))+' triliun'+(n%1e12?' '+tb(n%1e12):'');
  box.innerHTML=`<label class="lbl">Angka (Rp)</label><input class="inp" id="n" type="number" min="0" placeholder="125000"><div class="out" id="o"></div><div class="row" style="margin-top:12px"><button class="nb-btn yel" id="c">Salin</button></div>`;
  let txt='';$('#n',box).oninput=e=>{const n=Math.floor(+e.target.value),o=$('#o',box);if(!(n>=0)||n>=1e15){txt='';return note(o,'Masukkan angka 0 – 999 triliun.','err');}txt=tb(n).replace(/^./,c=>c.toUpperCase())+' rupiah';rows(o,[['Terbilang',txt],['Format',rp(n)]]);};
  $('#c',box).onclick=()=>txt&&copy(txt);
}

/* ---------- GAMBAR ↔ BASE64 ---------- */
function toolImgB64(box){
  box.innerHTML=`<label class="lbl">Gambar → Base64</label><input type="file" id="f" accept="image/*" class="inp"><label class="lbl" style="margin-top:14px">Base64 / data URL → Gambar</label><textarea class="inp" id="t" rows="5" placeholder="tempel base64 atau data:image/png;base64,…"></textarea>
  <div class="row" style="margin-top:12px"><button class="nb-btn" id="pv">Tampilkan gambar</button><button class="nb-btn yel" id="cp">Salin teks</button></div><div class="out" id="o"></div>`;
  const t=$('#t',box),o=$('#o',box);
  $('#f',box).onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{t.value=r.result;note(o,'Selesai: '+Math.round(r.result.length/1024)+' KB teks.','ok');};r.readAsDataURL(f);};
  $('#pv',box).onclick=()=>{let v=t.value.trim();if(!v)return note(o,'Tempel base64 dulu.','err');if(!v.startsWith('data:'))v='data:image/png;base64,'+v;const i=new Image();i.style.cssText='max-width:100%;border:3px solid var(--bd);border-radius:12px';i.onload=()=>{o.innerHTML='';o.appendChild(i);const b=el('<div class="row" style="margin-top:10px"><button class="nb-btn yel">Unduh gambar</button></div>');b.firstChild.onclick=()=>fetch(v).then(r=>r.blob()).then(bl=>save(bl,'gambar-'+Date.now()+'.png'));o.appendChild(b);};i.onerror=()=>note(o,'Base64 tidak valid.','err');i.src=v;};
  $('#cp',box).onclick=()=>t.value&&copy(t.value);
}

/* ---------- TEKS KE SUARA ---------- */
function toolTTS(box){
  box.innerHTML=`<textarea class="inp" id="t" rows="5" placeholder="ketik teks yang mau dibacakan">Halo, selamat datang di toko yanziioffc.</textarea><div class="row"><div><label class="lbl">Suara</label><select class="inp" id="v"></select></div><div><label class="lbl">Kecepatan <span id="rv">1</span>x</label><input type="range" id="r" min="0.5" max="2" step="0.1" value="1" style="width:100%"></div></div><div class="row" style="margin-top:12px"><button class="nb-btn yel" id="go">▶ Putar</button><button class="nb-btn" id="st">■ Stop</button></div><div class="out" id="o"></div>`;
  const S=window.speechSynthesis,o=$('#o',box);if(!S)return note(o,'Browser tidak mendukung teks ke suara.','err');
  const fill=()=>{const vs=S.getVoices(),id=vs.filter(v=>/^id/i.test(v.lang)),use=id.length?id.concat(vs.filter(v=>!/^id/i.test(v.lang))):vs;$('#v',box).innerHTML=use.map(v=>`<option value="${v.name}">${v.name} (${v.lang})</option>`).join('');};
  fill();S.onvoiceschanged=fill;$('#r',box).oninput=e=>$('#rv',box).textContent=e.target.value;
  $('#go',box).onclick=()=>{S.cancel();const u=new SpeechSynthesisUtterance($('#t',box).value);const v=S.getVoices().find(x=>x.name===$('#v',box).value);if(v){u.voice=v;u.lang=v.lang;}else u.lang='id-ID';u.rate=+$('#r',box).value;S.speak(u);};
  $('#st',box).onclick=()=>S.cancel();
}

/* ---------- WATERMARK FOTO ---------- */
function toolWatermark(box){
  box.innerHTML=`<input type="file" id="f" accept="image/*" class="inp"><div class="row"><div><label class="lbl">Teks watermark</label><input class="inp" id="t" value="© yanziioffc"></div><div><label class="lbl">Posisi</label><select class="inp" id="p"><option value="br">Pojok kanan bawah</option><option value="c">Tengah</option><option value="tile">Berulang (diagonal)</option></select></div></div><div class="row"><div><label class="lbl">Ukuran <span id="sv">5</span>%</label><input type="range" id="s" min="2" max="20" value="5" style="width:100%"></div><div><label class="lbl">Transparansi <span id="ov">50</span>%</label><input type="range" id="a" min="10" max="100" value="50" style="width:100%"></div></div><div class="row" style="margin-top:12px"><button class="nb-btn yel" id="go">Pasang watermark</button></div><div class="out" id="o"></div>`;
  $('#s',box).oninput=e=>$('#sv',box).textContent=e.target.value;$('#a',box).oninput=e=>$('#ov',box).textContent=e.target.value;
  $('#go',box).onclick=async()=>{const f=$('#f',box).files[0],o=$('#o',box);if(!f)return note(o,'Pilih gambar dulu.','err');
    try{const bmp=await createImageBitmap(f),c=document.createElement('canvas');c.width=bmp.width;c.height=bmp.height;const x=c.getContext('2d');x.drawImage(bmp,0,0);
      const fs=Math.max(12,Math.round(bmp.width*$('#s',box).value/100)),txt=$('#t',box).value||'©';x.font='800 '+fs+'px Arial';x.globalAlpha=$('#a',box).value/100;x.fillStyle='#fff';x.strokeStyle='rgba(0,0,0,.55)';x.lineWidth=Math.max(1,fs/14);x.textBaseline='middle';
      const draw=(px,py)=>{x.strokeText(txt,px,py);x.fillText(txt,px,py);},w=x.measureText(txt).width,pos=$('#p',box).value;
      if(pos==='br'){x.textAlign='right';draw(bmp.width-fs*.6,bmp.height-fs);}else if(pos==='c'){x.textAlign='center';draw(bmp.width/2,bmp.height/2);}
      else{x.textAlign='center';x.save();x.rotate(-Math.PI/6);const st=w*1.6;for(let yy=-bmp.height;yy<bmp.height*2;yy+=fs*3.2)for(let xx=-bmp.width;xx<bmp.width*2;xx+=st)draw(xx,yy);x.restore();}
      const b=await new Promise(r=>c.toBlob(r,'image/png'));o.innerHTML='';const i=new Image();i.src=URL.createObjectURL(b);i.style.cssText='max-width:100%;border:3px solid var(--bd);border-radius:12px';o.appendChild(i);
      const r=el('<div class="row" style="margin-top:10px"><button class="nb-btn yel">Unduh</button></div>');r.firstChild.onclick=()=>save(b,'watermark-'+Date.now()+'.png');o.appendChild(r);
    }catch(e){note(o,'Gagal memproses gambar: '+e.message,'err');}};
}

/* ---------- STOPWATCH & TIMER ---------- */
function toolClock(box){
  box.innerHTML=`<div class="seg" style="grid-template-columns:1fr 1fr"><button type="button" class="on" data-m="sw">⏱ Stopwatch</button><button type="button" data-m="tm">⏳ Timer</button></div><div id="disp" style="text-align:center;font:800 46px/1.3 monospace;margin:14px 0">00:00.0</div>
  <div id="tmIn" class="row hide"><div><label class="lbl">Menit</label><input class="inp" id="mm" type="number" min="0" value="5"></div><div><label class="lbl">Detik</label><input class="inp" id="ss" type="number" min="0" max="59" value="0"></div></div>
  <div class="row" style="margin-top:10px"><button class="nb-btn yel" id="go">Mulai</button><button class="nb-btn" id="lap">Lap</button><button class="nb-btn" id="rs">Reset</button></div><div class="out" id="o"></div>`;
  let mode='sw',run=false,t0=0,acc=0,iv=null,laps=0;const d=$('#disp',box),fmt=ms=>{ms=Math.max(0,ms);const m=Math.floor(ms/6e4),s=Math.floor(ms%6e4/1000),t=Math.floor(ms%1000/100);return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')+'.'+t;};
  const total=()=>(+$('#mm',box).value||0)*60000+(+$('#ss',box).value||0)*1000,cur=()=>mode==='sw'?acc+(run?Date.now()-t0:0):total()-(acc+(run?Date.now()-t0:0));
  const stop=()=>{clearInterval(iv);iv=null;run=false;$('#go',box).textContent='Mulai';};
  const tick=()=>{if(!box.isConnected){clearInterval(iv);return;}const v=cur();d.textContent=fmt(v);if(mode==='tm'&&v<=0){stop();acc=0;d.textContent='00:00.0';window.FX&&FX.toast('⏰ Waktu habis!','ok');if(window.Snd&&Snd.notify)try{Snd.notify();}catch(e){}}};
  $('#go',box).onclick=()=>{if(run){acc+=Date.now()-t0;stop();}else{if(mode==='tm'&&cur()<=0)return;t0=Date.now();run=true;$('#go',box).textContent='Jeda';iv=setInterval(tick,100);}};
  $('#rs',box).onclick=()=>{stop();acc=0;laps=0;$('#o',box).innerHTML='';d.textContent=mode==='sw'?'00:00.0':fmt(total());};
  $('#lap',box).onclick=()=>{if(mode!=='sw'||!run)return;const o=$('#o',box),r=el('<div class="pay-line" style="margin-top:6px"><span></span><b></b></div>');r.children[0].textContent='Lap '+(++laps);r.children[1].textContent=fmt(cur());o.prepend(r);};
  box.querySelectorAll('.seg button').forEach(b=>b.onclick=()=>{stop();acc=0;mode=b.dataset.m;box.querySelectorAll('.seg button').forEach(x=>x.classList.toggle('on',x===b));$('#tmIn',box).classList.toggle('hide',mode!=='tm');$('#lap',box).style.display=mode==='sw'?'':'none';$('#o',box).innerHTML='';d.textContent=mode==='sw'?'00:00.0':fmt(total());});
  ['mm','ss'].forEach(i=>$('#'+i,box).oninput=()=>{if(mode==='tm'&&!run)d.textContent=fmt(total());});
}

(window.EXTRA_TOOLS=window.EXTRA_TOOLS||[]).push(
 {id:'hash',ico:'#️⃣',name:'Hash Generator',desc:'SHA-1, SHA-256, SHA-512 dari teks',fn:toolHash},
 {id:'warna',ico:'🎨',name:'Konverter Warna',desc:'HEX ⇄ RGB ⇄ HSL + pilih warna',fn:toolColor},
 {id:'margin',ico:'💹',name:'Harga Jual & Untung',desc:'Hitung harga jual dari modal, margin & fee',fn:toolMargin},
 {id:'nota',ico:'🧾',name:'Pembuat Nota',desc:'Buat nota/invoice jadi gambar PNG',fn:toolNota},
 {id:'acak',ico:'🎲',name:'Undian & Acak',desc:'Pilih pemenang acak dari daftar',fn:toolRandom},
 {id:'unit',ico:'📏',name:'Konverter Unit',desc:'Panjang, berat, suhu & ukuran data',fn:toolUnit},
 {id:'tanggal',ico:'📅',name:'Selisih Tanggal & Umur',desc:'Hitung umur & jarak antar tanggal',fn:toolDate},
 {id:'unix',ico:'🕒',name:'Unix Timestamp',desc:'Ubah timestamp ⇄ tanggal',fn:toolUnix},
 {id:'terbilang',ico:'🔢',name:'Terbilang Rupiah',desc:'Angka jadi tulisan, untuk kwitansi',fn:toolTerbilang},
 {id:'b64img',ico:'🖼️',name:'Gambar ⇄ Base64',desc:'Ubah gambar jadi teks & sebaliknya',fn:toolImgB64},
 {id:'tts',ico:'🔊',name:'Teks ke Suara',desc:'Bacakan teks dengan suara perangkat',fn:toolTTS},
 {id:'watermark',ico:'💧',name:'Watermark Foto',desc:'Tempel teks watermark ke gambar',fn:toolWatermark},
 {id:'jam',ico:'⏱️',name:'Stopwatch & Timer',desc:'Hitung waktu maju & mundur',fn:toolClock}
);
})();
