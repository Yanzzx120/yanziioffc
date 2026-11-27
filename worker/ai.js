// Cloudflare Worker — backend AI untuk yanzii-AI (API key aman, tidak terlihat di website).
// Deploy: dash.cloudflare.com → Workers & Pages → Create → paste file ini → Deploy.
// Pilih SALAH SATU sumber AI:
//   A) Gemini  : Settings → Variables and Secrets → tambah secret GEMINI_KEY   (mendukung gambar & PDF)
//   B) Workers AI (gratis, tanpa key luar): Settings → Bindings → Add → Workers AI, nama variabel: AI   (teks saja)
// Opsional: MODEL (nama model Gemini), ALLOW (mis. https://domainmu.com — hanya situsmu yang boleh memakai).
// Lalu isi di js/config.js:  ai: { url: "https://nama-worker.xxx.workers.dev" }
// Respons selalu berbentuk Gemini { candidates:[{content:{parts:[{text}]}}] } agar website tidak perlu diubah.
const WA_MODEL = '@cf/meta/llama-3.1-8b-instruct';
const out = (text) => ({ candidates: [{ content: { role: 'model', parts: [{ text }] } }] });

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    const okOrigin = !env.ALLOW || origin === env.ALLOW;
    const cors = {
      'Access-Control-Allow-Origin': okOrigin ? (env.ALLOW || '*') : 'null',
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin'
    };
    const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json', ...cors } });
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (req.method !== 'POST' || !okOrigin) return json({ error: { message: 'forbidden' } }, 403);

    let body; try { body = await req.json(); } catch { return json({ error: { message: 'bad json' } }, 400); }
    if (!Array.isArray(body.contents) || !body.contents.length) return json({ error: { message: 'contents kosong' } }, 400);
    if (JSON.stringify(body).length > 12_000_000) return json({ error: { message: 'payload terlalu besar' } }, 413);

    // A) Gemini
    if (env.GEMINI_KEY) {
      const model = env.MODEL || 'gemini-2.5-flash';
      const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_KEY },
        body: JSON.stringify({ systemInstruction: body.systemInstruction, contents: body.contents, generationConfig: { maxOutputTokens: 2048 } })
      });
      return new Response(r.body, { status: r.status, headers: { 'Content-Type': 'application/json', ...cors } });
    }

    // B) Workers AI (gratis)
    if (env.AI) {
      const sys = body.systemInstruction && body.systemInstruction.parts ? body.systemInstruction.parts.map(p => p.text || '').join('\n') : '';
      const messages = [];
      if (sys) messages.push({ role: 'system', content: sys });
      for (const c of body.contents.slice(-20)) {
        const text = (c.parts || []).map(p => p.text || (p.inline_data ? '[lampiran tidak didukung di mode ini]' : '')).join('\n').trim();
        if (text) messages.push({ role: c.role === 'model' ? 'assistant' : 'user', content: text });
      }
      try {
        const r = await env.AI.run(env.WA_MODEL || WA_MODEL, { messages, max_tokens: 1024 });
        const text = (r && (r.response || (r.result && r.result.response))) || '';
        if (!String(text).trim()) return json({ error: { message: 'respons kosong' } }, 502);
        return json(out(String(text).trim()));
      } catch (e) { return json({ error: { message: 'Workers AI gagal: ' + (e && e.message || e) } }, 502); }
    }
    return json({ error: { message: 'Worker belum dikonfigurasi: isi secret GEMINI_KEY atau pasang binding Workers AI (AI).' } }, 500);
  }
};
