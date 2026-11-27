/* Tools tambahan — semua jalan lokal di browser (tanpa server). Dimuat sebelum tools.js */
(function(){
const $=(s,c)=>(c||document).querySelector(s);
const el=h=>{const t=document.createElement('template');t.innerHTML=h.trim();return t.content.firstElementChild;};
const note=(b,t,k)=>{b.innerHTML='';const d=document.createElement('div');d.className='msg '+(k||'');d.textContent=t;b.appendChild(d);};
const save=(blob,n)=>{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=n;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);};
const copy=async(t,m)=>{try{await navigator.clipboard.writeText(t);window.FX&&FX.toast(m||'Disalin','ok');}catch(e){window.FX&&FX.toast('Gagal menyalin','err');}};
const rp=n=>'Rp'+Math.round(n).toLocaleString('id-ID');

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
 {id:'resize',ico:'📐',name:'Ubah Ukuran Gambar',desc:'Resize & ganti format PNG/JPG/WebP',fn:toolResize},
 {id:'wa',ico:'📲',name:'Link WhatsApp',desc:'Buat link chat wa.me + pesan otomatis',fn:toolWaLink},
 {id:'pass',ico:'🔐',name:'Password Generator',desc:'Password acak yang kuat',fn:toolPass},
 {id:'teks',ico:'📝',name:'Alat Teks',desc:'Hitung kata, ubah huruf, rapikan teks',fn:toolText},
 {id:'fancy',ico:'🔤',name:'Teks Keren',desc:'Font unik untuk bio & nama',fn:toolFancy},
 {id:'kalk',ico:'🧮',name:'Kalkulator Diskon',desc:'Hitung diskon & PPN',fn:toolCalc},
 {id:'kode',ico:'🧩',name:'Base64 & JSON',desc:'Encode/decode, rapikan JSON',fn:toolCode}
];
})();
