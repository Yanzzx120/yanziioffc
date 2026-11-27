// Cloudflare Worker — proxy CORS pribadi untuk TikTok & Catbox (gratis di workers.dev)
// Deploy: dash.cloudflare.com → Workers → Create → paste file ini → Deploy.
// Lalu isi SHOP.proxy di js/config.js: "https://nama-worker.xxx.workers.dev/?url="
const ALLOW = ['www.tikwm.com','tikwm.com','catbox.moe','files.catbox.moe'];   // domain tujuan yang diizinkan
export default {
  async fetch(req) {
    const cors = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'*'};
    if (req.method === 'OPTIONS') return new Response(null, {headers: cors});
    const target = new URL(req.url).searchParams.get('url');
    let u; try { u = new URL(target); } catch { return new Response('url?', {status:400, headers:cors}); }
    if (!ALLOW.includes(u.hostname)) return new Response('domain tidak diizinkan', {status:403, headers:cors});
    const r = await fetch(u.toString(), {method: req.method, body: ['GET','HEAD'].includes(req.method) ? undefined : req.body,
      headers: {'User-Agent':'Mozilla/5.0', 'Content-Type': req.headers.get('Content-Type') || ''}});
    const h = new Headers(r.headers); Object.entries(cors).forEach(([k,v]) => h.set(k,v));
    return new Response(r.body, {status:r.status, headers:h});
  }
};
