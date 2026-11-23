/* Klien AI untuk yanzii-AI — mencoba beberapa penyedia berurutan sampai ada yang berhasil:
   1) SHOP.ai.url     → Cloudflare Worker milik sendiri (worker/ai.js)  [paling aman & stabil]
   2) SHOP.ai.key     → Gemini langsung (key terlihat publik)
   3) SHOP.ai.openai  → API kompatibel OpenAI (Groq, OpenRouter, dll): {url,key,model}
   4) Pollinations    → layanan gratis tanpa key (cadangan terakhir; kadang sibuk)
   Format riwayat = format Gemini: [{role:'user'|'model', parts:[{text}|{inline_data:{mime_type,data}}]}] */
(function(){
  var CFG = function(){ return (window.SHOP && window.SHOP.ai) || {}; };
  var sleep = function(ms){ return new Promise(function(r){ setTimeout(r, ms); }); };

  function E(msg, code, fatal){ var e = new Error(msg); e.code = code; e.fatal = !!fatal; return e; }

  /* Gemini menolak riwayat yang tidak diawali 'user', kosong, atau tidak selang-seling → rapikan */
  function clean(history){
    var out = [];
    (history || []).forEach(function(h){
      var role = h.role === 'model' ? 'model' : 'user', parts = (h.parts || []).filter(function(p){ return (p.text && String(p.text).trim()) || p.inline_data; });
      if (!parts.length) return;
      var last = out[out.length - 1];
      if (last && last.role === role) last.parts = last.parts.concat(parts); else out.push({role: role, parts: parts.slice()});
    });
    while (out.length && out[0].role !== 'user') out.shift();
    return out;
  }

  function system(){
    var S = window.SHOP || {}, cats = {}; (S.cats || []).forEach(function(c){ cats[c.id] = c.name; });
    var cat = (S.products || []).map(function(p){ return (cats[p.cat] || p.cat) + ': ' + p.name + ' Rp' + p.price + '/' + (p.u || 'item'); }).join('; ');
    return 'Kamu adalah yanzii-AI, asisten ramah untuk toko digital ' + (S.brand || 'Yanzii') + '. Jawab dalam bahasa yang sama dengan pengguna, ringkas dan jelas. ' +
      'Gunakan markdown seperlunya, terutama blok kode. Jika ditanya soal produk/harga toko, jawab berdasarkan katalog ini (harga rupiah) dan arahkan membeli lewat halaman Toko; ' +
      'jangan mengarang produk di luar katalog. Admin WhatsApp: ' + (S.wa || '-') + '. Katalog — ' + cat;
  }

  async function post(url, body, headers, ms){
    var c = new AbortController(), t = setTimeout(function(){ c.abort(); }, ms || 40000);
    try { return await fetch(url, {method: 'POST', headers: Object.assign({'Content-Type': 'application/json'}, headers || {}), body: JSON.stringify(body), signal: c.signal}); }
    catch (e) { throw E(e.name === 'AbortError' ? 'AI terlalu lama merespons.' : 'Tidak bisa terhubung ke layanan AI (periksa koneksi internet).', 'net'); }
    finally { clearTimeout(t); }
  }
  /* satu kali coba ulang untuk error sementara (jaringan, 429, 5xx) */
  async function retry(fn){
    try { return await fn(); }
    catch (e) { if (e.fatal || !(e.code === 'net' || e.code === 429 || e.code >= 500)) throw e; await sleep(1300); return fn(); }
  }
  async function errFrom(res){
    var j = await res.json().catch(function(){ return {}; }), m = (j.error && (j.error.message || j.error)) || j.message || ('HTTP ' + res.status);
    if (typeof m !== 'string') m = JSON.stringify(m);
    return E(m, res.status, res.status === 400 && /api key/i.test(m) || res.status === 401 || res.status === 403 || res.status === 404);
  }

  /* ---- Gemini (langsung atau lewat Worker; bentuk body & respons sama) ---- */
  async function gemini(history, sys, url, key, model){
    var body = {systemInstruction: {parts: [{text: sys}]}, contents: history, generationConfig: {maxOutputTokens: 2048}};
    var res = await post(url || ('https://generativelanguage.googleapis.com/v1beta/models/' + (model || 'gemini-2.5-flash') + ':generateContent'), body, key ? {'x-goog-api-key': key} : null, 50000);
    if (!res.ok){ var e = await errFrom(res); if (res.status === 429) e.message = 'Terlalu banyak permintaan (rate limit). Coba lagi sebentar.'; throw e; }
    var d = await res.json().catch(function(){ return {}; }), c = d.candidates && d.candidates[0];
    if (!c){ if (d.promptFeedback && d.promptFeedback.blockReason) throw E('Diblokir filter keamanan: ' + d.promptFeedback.blockReason, 'blocked', true); throw E('Tidak ada respons dari AI.', 502); }
    var t = ((c.content && c.content.parts) || []).map(function(p){ return p.text || ''; }).join('').trim();
    if (!t) throw E('Respons kosong dari AI.', 502); return t;
  }

  /* ---- bentuk OpenAI: dipakai penyedia OpenAI-compatible & Pollinations ---- */
  function toOpenAI(history, sys, vision){
    var msgs = [{role: 'system', content: sys}];
    history.forEach(function(h){
      var role = h.role === 'model' ? 'assistant' : 'user', txt = [], imgs = [];
      h.parts.forEach(function(p){
        if (p.text) txt.push(p.text);
        else if (p.inline_data){ if (vision && /^image\//.test(p.inline_data.mime_type)) imgs.push('data:' + p.inline_data.mime_type + ';base64,' + p.inline_data.data); else txt.push('[lampiran ' + (/pdf/.test(p.inline_data.mime_type) ? 'PDF' : 'gambar') + ' tidak bisa dibaca oleh mode AI ini — pasang Worker/Gemini untuk itu]'); }
      });
      msgs.push({role: role, content: imgs.length ? [{type: 'text', text: txt.join('\n') || 'Jelaskan gambar ini.'}].concat(imgs.map(function(u){ return {type: 'image_url', image_url: {url: u}}; })) : txt.join('\n')});
    });
    return msgs;
  }
  async function readOpenAI(res){
    var raw = await res.text(), j = null; try { j = JSON.parse(raw); } catch (e) {}
    var t = j ? (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) : raw;
    if (Array.isArray(t)) t = t.map(function(x){ return x.text || ''; }).join('');
    t = String(t || '').trim(); if (!t) throw E('Respons kosong dari AI.', 502); return t;
  }
  async function openaiCompat(history, sys, c){
    var res = await post(c.url, {model: c.model, messages: toOpenAI(history, sys, true), max_tokens: 2048}, {Authorization: 'Bearer ' + (c.key || '')}, 50000);
    if (!res.ok) throw await errFrom(res); return readOpenAI(res);
  }
  async function pollinations(history, sys){
    var hasImg = history.some(function(h){ return h.parts.some(function(p){ return p.inline_data && /^image\//.test(p.inline_data.mime_type); }); }), last = '', e0;
    var models = hasImg ? ['openai'] : ['openai', 'openai-fast', 'mistral', 'llama'];
    for (var i = 0; i < models.length; i++){
      try { var m = models[i], res = await post('https://text.pollinations.ai/openai', {model: m, messages: toOpenAI(history.slice(-16), sys, true), private: true}, null, 40000);
        if (!res.ok) throw await errFrom(res); return await readOpenAI(res); }
      catch (e) { e0 = e; }
    }
    // cadangan terakhir: GET teks biasa (hanya pesan terakhir)
    try {
      history.slice().reverse().some(function(h){ if (h.role === 'user'){ last = h.parts.map(function(p){ return p.text || ''; }).join(' ').trim(); return !!last; } });
      if (last){ var u = 'https://text.pollinations.ai/' + encodeURIComponent(last.slice(0, 1500)) + '?model=openai&system=' + encodeURIComponent(sys.slice(0, 1500)),
          c = new AbortController(), t = setTimeout(function(){ c.abort(); }, 40000);
        try { var r = await fetch(u, {signal: c.signal}); if (r.ok){ var tx = (await r.text()).trim(); if (tx) return tx; } } finally { clearTimeout(t); } }
    } catch (e) {}
    throw E((e0 && e0.code === 'net') ? e0.message : 'Layanan AI gratis sedang sibuk. Coba lagi beberapa saat, atau pasang Worker/API key di js/config.js (lihat README).', (e0 && e0.code) || 503);
  }

  function friendly(e, label){
    var c = e.code, m = e.message || '';
    if (c === 400 && /api key/i.test(m)) return label + ': API key tidak valid.';
    if (c === 401 || c === 403 || /leaked/i.test(m)) return label + ': API key ditolak/diblokir. Buat key baru lalu perbarui pengaturan AI.';
    if (c === 404) return label + ': model/alamat tidak ditemukan. Periksa pengaturan AI di js/config.js.';
    return m;
  }

  async function ask(history, opts){
    var h = clean(history).slice(-20); while (h.length && h[0].role !== 'user') h.shift();
    if (!h.length) throw E('Tidak ada pesan untuk dikirim.', 'empty', true);
    var A = CFG(), sys = (opts && opts.system) || system(), chain = [], errs = [];
    if (A.url) chain.push(['Worker AI', function(){ return gemini(h, sys, A.url); }]);
    if (A.key) chain.push(['Gemini', function(){ return gemini(h, sys, null, A.key, A.model); }]);
    if (A.openai && A.openai.url) chain.push(['API AI', function(){ return openaiCompat(h, sys, A.openai); }]);
    chain.push(['AI gratis', function(){ return pollinations(h, sys); }]);
    for (var i = 0; i < chain.length; i++){
      try { return await retry(chain[i][1]); }
      catch (e) { if (e.code === 'blocked') throw e; errs.push(friendly(e, chain[i][0])); }
    }
    throw new Error(errs[errs.length - 1] || 'AI tidak tersedia.');
  }
  window.AIClient = {ask: ask, clean: clean, system: system};
})();
