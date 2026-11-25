// Cloudflare Worker — backend order yanziioffc (gratis di workers.dev)
// Fitur: buat order + kode unik, cek status (polling dari produk.html), stok, konfirmasi bayar
// (webhook gateway / tombol admin), kirim data otomatis ke buyer & admin lewat WhatsApp API.
//
// Binding & variabel (Settings → Variables):
//   KV  : ORDERS                      (KV Namespace)
//   ADMIN_KEY   (secret)  kunci rahasia untuk /admin/paid
//   HOOK_KEY    (secret)  kunci rahasia untuk /webhook
//   ADMIN_WA    nomor admin, awalan 62
//   TG_BOT_TOKEN (secret) + TG_CHAT_ID : notifikasi admin lewat Telegram (GRATIS, tanpa WA API) — bukti transfer ikut terkirim sebagai foto
//   WA_API_URL / WA_API_TOKEN (opsional) : kirim WhatsApp otomatis ke buyer, butuh penyedia WA API berbayar. Kosong = dilewati.
//   Tanpa WA API: data pesanan tetap tampil di halaman buyer (tombol "Lihat Data") begitu lunas.
//   ALLOW_ORIGIN  mis. https://yanziioffc.my.id  (kosong = *)
//   PRICES (opsional) JSON {"Capcut Pro":7000,...} → harga divalidasi server (anti-ubah harga di browser)
//
// Isi stok akun/voucher (opsional, tiap elemen = 1 unit yang dikirim ke buyer):
//   KV key  deliver:<pid>  → ["email1|pass1","email2|pass2"]   (pid = id produk, mis. prem24)
// Stok tampil: KV key  stock:<pid> → angka (default 99). Kalau ada deliver:<pid>, stok = jumlah isinya.

const J = (o, s, cors) => new Response(JSON.stringify(o), { status: s || 200, headers: { 'Content-Type': 'application/json', ...cors } });
const rupiah = n => 'Rp' + Number(n).toLocaleString('id-ID');
const rand = n => [...crypto.getRandomValues(new Uint8Array(n))].map(b => b.toString(16).padStart(2, '0')).join('');

async function sendWA(env, target, message) {
  if (!env.WA_API_URL || !env.WA_API_TOKEN || !target) return false;
  try {
    const r = await fetch(env.WA_API_URL, { method: 'POST', headers: { Authorization: env.WA_API_TOKEN, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ target: String(target), message }) });
    return r.ok;
  } catch (e) { return false; }
}

async function tg(env, text, photoDataUrl) {
  if (!env.TG_BOT_TOKEN || !env.TG_CHAT_ID) return false;
  const api = 'https://api.telegram.org/bot' + env.TG_BOT_TOKEN + '/';
  try {
    if (photoDataUrl) {
      const m = /^data:(image\/[a-z+]+);base64,(.+)$/.exec(photoDataUrl); if (m) {
        const bin = atob(m[2]), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
        const f = new FormData(); f.append('chat_id', env.TG_CHAT_ID); f.append('caption', text.slice(0, 1000)); f.append('photo', new Blob([u8], { type: m[1] }), 'bukti.jpg');
        return (await fetch(api + 'sendPhoto', { method: 'POST', body: f })).ok;
      }
    }
    return (await fetch(api + 'sendMessage', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: env.TG_CHAT_ID, text }) })).ok;
  } catch (e) { return false; }
}
const notifyAdmin = (env, text, photo) => Promise.all([tg(env, text, photo), sendWA(env, env.ADMIN_WA, text)]);

const getO = async (env, id) => { const v = await env.ORDERS.get('order:' + id); return v ? JSON.parse(v) : null; };
const putO = (env, o) => env.ORDERS.put('order:' + o.id, JSON.stringify(o), { expirationTtl: 60 * 60 * 24 * 30 });

// tandai lunas → kurangi stok → ambil data produk → kirim ke buyer & admin (idempoten: aman dipanggil 2x)
async function markPaid(env, o) {
  if (o.status === 'paid') return o;
  o.status = 'paid'; o.paidAt = Date.now();
  const key = 'deliver:' + o.pid, raw = await env.ORDERS.get(key);
  let items = raw ? JSON.parse(raw) : null, delivery = [];
  if (items && items.length) {
    delivery = items.splice(0, o.qty);
    await env.ORDERS.put(key, JSON.stringify(items));
  } else {
    const sk = 'stock:' + o.pid, cur = await env.ORDERS.get(sk);
    await env.ORDERS.put(sk, String(Math.max(0, (cur === null ? 99 : +cur) - o.qty)));
  }
  o.delivery = delivery;
  o.dstate = delivery.length >= o.qty ? 'delivered' : 'manual';
  await env.ORDERS.delete('pending:' + o.total);
  await putO(env, o);
  const head = `✅ *PEMBAYARAN DITERIMA*\nInvoice: ${o.id}\nProduk: ${o.item} x${o.qty}\nTotal: ${rupiah(o.total)}`;
  const buyerMsg = o.dstate === 'delivered'
    ? `${head}\n\n*Data pesananmu:*\n${delivery.join('\n')}\n\nTerima kasih sudah belanja di yanziioffc 🙏`
    : `${head}\n\nPesananmu sedang diproses admin, data dikirim secepatnya. Terima kasih 🙏`;
  await sendWA(env, o.phone, buyerMsg);
  await notifyAdmin(env, `${head}\nBuyer: ${o.name} (wa.me/${o.phone})\nStatus kirim: ${o.dstate}\n` + (o.extra || []).map(e => `${e[0]}: ${e[1]}`).join('\n'));
  return o;
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url), path = url.pathname.replace(/\/+$/, '') || '/';
    const cors = { 'Access-Control-Allow-Origin': env.ALLOW_ORIGIN || '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,x-admin-key' };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });

    // ---- stok: GET /stockinfo ----
    if (path === '/stockinfo') {
      const list = await env.ORDERS.list({ prefix: 'stock:' }), stock = {};
      for (const k of list.keys) stock[k.name.slice(6)] = +(await env.ORDERS.get(k.name));
      for (const k of (await env.ORDERS.list({ prefix: 'deliver:' })).keys) stock[k.name.slice(8)] = (JSON.parse(await env.ORDERS.get(k.name)) || []).length;
      return J({ stock }, 200, cors);
    }

    // ---- buat order: POST / ----
    if (req.method === 'POST' && path === '/') {
      let o; try { o = await req.json(); } catch (e) { return J({ error: 'Data tidak valid' }, 400, cors); }
      if (!o || !/^[A-Z0-9]{6,20}$/.test(o.id || '') || !/^62\d{8,13}$/.test(o.phone || '') || !(o.qty >= 1 && o.qty <= 99)) return J({ error: 'Data pesanan tidak valid' }, 400, cors);
      if (await getO(env, o.id)) return J({ error: 'Invoice sudah ada' }, 409, cors);
      let subtotal = Math.floor(+o.subtotal) || 0, disc = Math.max(0, Math.floor(+o.disc) || 0);
      if (env.PRICES) { const price = JSON.parse(env.PRICES)[o.item]; if (price === undefined) return J({ error: 'Produk tidak dikenal' }, 400, cors); if (price * o.qty !== subtotal) return J({ error: 'Harga tidak cocok' }, 400, cors); }
      if (subtotal < 1000 || disc > subtotal * 0.5) return J({ error: 'Nominal tidak valid' }, 400, cors);
      // stok
      const dk = await env.ORDERS.get('deliver:' + o.pid), sk = await env.ORDERS.get('stock:' + o.pid);
      const have = dk ? JSON.parse(dk).length : (sk === null ? 99 : +sk);
      if (have < o.qty) return J({ error: 'Stok tidak cukup (sisa ' + have + ')' }, 409, cors);
      // kode unik 1–99 yang belum dipakai order pending lain
      let unique = 0, total = 0;
      for (let i = 0; i < 99; i++) { unique = 1 + Math.floor(Math.random() * 99); total = subtotal - disc + unique; if (!(await env.ORDERS.get('pending:' + total))) break; }
      const expMin = Math.min(Math.max(+o.expMinutes || 30, 10), 120), expires = Date.now() + expMin * 60000, token = rand(12);
      const rec = { id: o.id, pid: o.pid, item: String(o.item).slice(0, 80), qty: o.qty, name: String(o.name || '').slice(0, 60), phone: o.phone, extra: (o.extra || []).slice(0, 8), note: String(o.note || '').slice(0, 300),
        subtotal, disc, unique, total, token, expires, status: 'pending', created: Date.now() };
      await putO(env, rec);
      await env.ORDERS.put('pending:' + total, rec.id, { expirationTtl: expMin * 60 + 60 });
      await notifyAdmin(env, `🛒 *PESANAN BARU*\nInvoice: ${rec.id}\nProduk: ${rec.item} x${rec.qty}\nTotal: ${rupiah(total)}\nBuyer: ${rec.name} (wa.me/${rec.phone})`);
      return J({ total, amount: subtotal - disc, token, expires }, 200, cors);      // tanpa qrUrl → halaman memakai gambar QRIS statis (img/qris.png)
    }

    // ---- cek status: GET /?id=&token= (dipolling produk.html tiap 3 detik) ----
    if (req.method === 'GET' && path === '/') {
      const o = await getO(env, url.searchParams.get('id') || '');
      if (!o || o.token !== url.searchParams.get('token')) return J({ status: 'unknown' }, 404, cors);
      if (o.status === 'paid') return J({ status: 'paid', dstate: o.dstate, delivery: o.delivery, message: o.dstate === 'manual' ? 'Admin segera memproses pesananmu.' : '' }, 200, cors);
      return J({ status: Date.now() > o.expires ? 'expired' : 'pending', proof: !!o.proof }, 200, cors);
    }

    // ---- upload bukti transfer: POST /proof {id, token, image(dataURL jpg/png)} ----
    if (req.method === 'POST' && path === '/proof') {
      const b = await req.json().catch(() => ({})), o = await getO(env, b.id || '');
      if (!o || o.token !== b.token) return J({ error: 'order tidak valid' }, 404, cors);
      if (!/^data:image\/(jpeg|png|webp);base64,/.test(b.image || '') || b.image.length > 2.5e6) return J({ error: 'Bukti harus gambar (maks ±1,8 MB)' }, 400, cors);
      await env.ORDERS.put('proof:' + o.id, b.image, { expirationTtl: 60 * 60 * 24 * 30 });
      o.proof = true; o.proofAt = Date.now(); await putO(env, o);
      await notifyAdmin(env, `💰 BUKTI TRANSFER MASUK\nInvoice: ${o.id}\nProduk: ${o.item} x${o.qty}\nTotal: ${rupiah(o.total)}\nBuyer: ${o.name} (wa.me/${o.phone})\n\nKonfirmasi: POST /admin/paid {"id":"${o.id}"}`, b.image);
      return J({ ok: true }, 200, cors);
    }

    // ---- lihat bukti (admin): GET /admin/proof?id=  header x-admin-key ----
    if (req.method === 'GET' && path === '/admin/proof') {
      if (!env.ADMIN_KEY || req.headers.get('x-admin-key') !== env.ADMIN_KEY) return J({ error: 'unauthorized' }, 401, cors);
      const img = await env.ORDERS.get('proof:' + (url.searchParams.get('id') || ''));
      return img ? J({ image: img }, 200, cors) : J({ error: 'belum ada bukti' }, 404, cors);
    }

    // ---- konfirmasi dari admin: POST /admin/paid  header x-admin-key, body {id} ----
    if (req.method === 'POST' && path === '/admin/paid') {
      if (!env.ADMIN_KEY || req.headers.get('x-admin-key') !== env.ADMIN_KEY) return J({ error: 'unauthorized' }, 401, cors);
      const { id } = await req.json().catch(() => ({})), o = await getO(env, id || '');
      if (!o) return J({ error: 'order tidak ada' }, 404, cors);
      if (!o.proof) return J({ error: 'Bukti transfer belum diupload buyer — pesanan tidak bisa diproses' }, 409, cors);   // bukti WAJIB
      await markPaid(env, o); return J({ ok: true, dstate: o.dstate }, 200, cors);
    }

    // ---- webhook penyedia pembayaran / pembaca mutasi: POST /webhook?key=HOOK_KEY  body {amount} atau {order_id} ----
    // ⚠ Sesuaikan pencocokan dengan format webhook penyedia yang kamu pakai, dan verifikasi tanda tangannya bila ada.
    if (req.method === 'POST' && path === '/webhook') {
      if (!env.HOOK_KEY || url.searchParams.get('key') !== env.HOOK_KEY) return J({ error: 'unauthorized' }, 401, cors);
      const b = await req.json().catch(() => ({}));
      const id = b.order_id || (b.amount ? await env.ORDERS.get('pending:' + Math.floor(+b.amount)) : null), o = id ? await getO(env, id) : null;
      if (!o || o.status === 'paid') return J({ ok: true, matched: false }, 200, cors);
      if (Date.now() > o.expires + 5 * 60000) return J({ ok: true, matched: false, reason: 'expired' }, 200, cors);
      await markPaid(env, o); return J({ ok: true, matched: true }, 200, cors);
    }
    return J({ error: 'not found' }, 404, cors);
  }
};
