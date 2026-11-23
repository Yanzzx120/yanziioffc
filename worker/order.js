// Cloudflare Worker — PEMBAYARAN OTOMATIS (QRIS dinamis + deteksi lunas) memakai Pakasir (pakasir.com).
// Alur: website → POST worker → Pakasir buat QRIS bernominal pas → website cek ?id=…&amount=… tiap 3 detik → status "paid" → pesanan SELESAI otomatis.
// Setup:
//  1. Daftar di pakasir.com, buat Proyek → catat "slug" proyek & API key.
//  2. Deploy file ini di Cloudflare Workers. Settings → Variables and Secrets:
//       PAKASIR_SLUG (text)   PAKASIR_KEY (secret)
//       ALLOW   (opsional, mis. https://domainmu.com — hanya situsmu yang boleh memakai)
//       PRICES  (disarankan)  jalankan `node worker/make-prices.js` → salin hasil "PRICES" & "VOUCHERS" ke variabel (JSON).
//               Dengan PRICES, nominal dihitung ulang di server sehingga pembeli tidak bisa mengubah harga lewat browser.
//  3. Isi di js/config.js:  gatewayUrl: "https://nama-worker.xxx.workers.dev"
// Catatan: endpoint Pakasir mengikuti dokumentasi publiknya (transactioncreate / transactiondetail). Uji dulu dengan nominal kecil.
const API = 'https://app.pakasir.com';

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    const okOrigin = !env.ALLOW || origin === env.ALLOW;
    const cors = { 'Access-Control-Allow-Origin': okOrigin ? (env.ALLOW || '*') : 'null', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Vary': 'Origin' };
    const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json', ...cors } });
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (!okOrigin) return json({ error: 'forbidden' }, 403);
    if (!env.PAKASIR_SLUG || !env.PAKASIR_KEY) return json({ error: 'Worker belum dikonfigurasi (PAKASIR_SLUG / PAKASIR_KEY).' }, 500);
    const url = new URL(req.url), parse = (v) => { try { return JSON.parse(v || '{}'); } catch { return {}; } };

    // ---- cek status: GET ?id=ORDERID&amount=NOMINAL ----
    if (req.method === 'GET') {
      const id = url.searchParams.get('id') || '', amount = parseInt(url.searchParams.get('amount') || '0', 10);
      if (!/^[A-Z0-9]{6,30}$/.test(id) || !(amount >= 1)) return json({ error: 'id/amount tidak valid' }, 400);
      const q = new URLSearchParams({ project: env.PAKASIR_SLUG, amount: String(amount), order_id: id, api_key: env.PAKASIR_KEY });
      try {
        const r = await fetch(API + '/api/transactiondetail?' + q);
        const d = await r.json().catch(() => ({}));
        const st = String((d.transaction && d.transaction.status) || '').toLowerCase();
        return json({ status: st === 'completed' ? 'paid' : (st || 'pending') });
      } catch (e) { return json({ status: 'pending' }); }
    }

    // ---- buat transaksi: POST body = objek order dari website ----
    if (req.method !== 'POST') return json({ error: 'method' }, 405);
    let o; try { o = await req.json(); } catch { return json({ error: 'bad json' }, 400); }
    const id = String(o.id || ''), qty = Math.floor(Number(o.qty));
    if (!/^[A-Z0-9]{6,30}$/.test(id)) return json({ error: 'id tidak valid' }, 400);
    if (!(qty >= 1 && qty <= 99)) return json({ error: 'qty tidak valid' }, 400);

    let amount;
    const PRICES = parse(env.PRICES), VOUCHERS = parse(env.VOUCHERS);
    if (Object.keys(PRICES).length) {            // hitung ulang di server
      const price = PRICES[o.pid];
      if (!price) return json({ error: 'produk tidak dikenal' }, 400);
      const sub = price * qty, v = o.voucher && VOUCHERS[String(o.voucher).toUpperCase()];
      const disc = !v ? 0 : v.type === 'pct' ? Math.floor(sub * v.v / 100) : Math.min(v.v, Math.max(0, sub - 1000));
      amount = sub - disc;
    } else {                                      // tanpa PRICES: percaya nominal dari browser (kurang aman)
      amount = Math.floor(Number(o.subtotal) - Number(o.disc || 0));
    }
    if (!(amount >= 1000 && amount <= 20_000_000)) return json({ error: 'nominal tidak valid' }, 400);

    try {
      const r = await fetch(API + '/api/transactioncreate/qris', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: env.PAKASIR_SLUG, order_id: id, amount, api_key: env.PAKASIR_KEY }) });
      const d = await r.json().catch(() => ({})), p = d.payment;
      if (!r.ok || !p || !p.payment_number) return json({ error: 'Pakasir menolak: ' + (d.message || d.error || r.status) }, 502);
      return json({
        amount, total: p.total_payment || amount, expires: p.expired_at || null,
        qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=480x480&margin=12&data=' + encodeURIComponent(p.payment_number),
        payUrl: API + '/pay/' + encodeURIComponent(env.PAKASIR_SLUG) + '/' + amount + '?order_id=' + encodeURIComponent(id) + '&qris_only=1'
      });
    } catch (e) { return json({ error: 'Gagal menghubungi Pakasir' }, 502); }
  }
};
