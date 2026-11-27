# Backend order (worker/order.js)

## Pasang (±10 menit)
1. Akun Cloudflare → `npm i -g wrangler` → `wrangler login`
2. `cd worker && npx wrangler kv namespace create ORDERS` → salin `id` ke `wrangler.toml`
3. Telegram (gratis, pengganti WA API): chat @BotFather → `/newbot` → dapat token. Kirim 1 pesan ke botmu, buka
   `https://api.telegram.org/bot<TOKEN>/getUpdates` → ambil `chat.id` → isi `TG_CHAT_ID` di `wrangler.toml`.
4. Rahasia: `npx wrangler secret put ADMIN_KEY` · `HOOK_KEY` · `TG_BOT_TOKEN`
5. `npx wrangler deploy` → URL `https://yanzii-order.<akun>.workers.dev`
6. `js/config.js` → `gatewayUrl: "URL-itu"` → upload ulang situs.

## Alur
buyer buat order → bayar QRIS → **upload bukti (wajib)** → bukti masuk ke Telegram admin + tersimpan di server →
admin cek mutasi → `POST /admin/paid {"id":"INVOICE"}` (header `x-admin-key`) → data pesanan muncul otomatis di halaman buyer.
Tanpa bukti, `/admin/paid` ditolak (409).

Contoh konfirmasi: `curl -X POST URL/admin/paid -H "x-admin-key: KUNCI" -d '{"id":"YZxxxx"}'`

## Data otomatis ke buyer
Isi stok akun/voucher di KV `deliver:<id produk>` = JSON array, mis. `["email|pass","email2|pass2"]`
(`npx wrangler kv key put --binding ORDERS "deliver:prem24" '["a|1","b|2"]'`). Kosong = admin kirim manual.

## Opsional
- WhatsApp otomatis ke buyer: isi `WA_API_URL` + secret `WA_API_TOKEN` (butuh penyedia WA API berbayar).
- Pembayaran otomatis: arahkan webhook penyedia pembayaran/mutasi ke `URL/webhook?key=HOOK_KEY`.
- `PRICES` (JSON nama produk → harga) agar harga divalidasi server.
