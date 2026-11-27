# Perubahan

- `login.html` — tampilan baru (neo-brutalist: kartu border tebal, badge kuning, tab Masuk/Daftar, "Lanjut tanpa akun"). Password kini disimpan sebagai hash SHA-256; akun lama tetap bisa login dan otomatis dimigrasi.
- `tools.html` + `js/tools.js` — Brat, Brat Video, IQC, TikTok Downloader, Catbox Upload, QR Generator, Kompres Gambar.
- `produk.html` — order otomatis: invoice + kode unik + QRIS/e-wallet + countdown 30 menit + status pesanan + pesan WA otomatis ke admin.
- `js/config.js` — semua pengaturan toko (nomor WA, QRIS, produk, harga) di satu tempat.
- `css/neo.css` — tema bersama.
- `payment.html` — perbaikan bug: `genInvoice()` kehilangan tanda kutip sehingga seluruh script halaman mati.
- `worker/proxy.js` — proxy CORS Cloudflare Worker (opsional).

## Yang jalan pasti (100% di browser)
Brat, Brat Video, IQC, QR (butuh internet untuk gambar QR), Kompres Gambar.

## Yang bergantung layanan luar
- TikTok: memakai API tikwm.com. Jika diblokir CORS, otomatis coba proxy publik, lalu proxy milik sendiri.
- Upload: Catbox tidak mengizinkan upload langsung dari browser (CORS). Otomatis fallback ke Uguu lalu TmpFiles (file sementara). Agar Catbox pasti jalan, deploy `worker/proxy.js` dan isi `SHOP.proxy`.

## Order otomatis penuh (opsional)
Situs ini statis, jadi verifikasi pembayaran otomatis butuh backend/payment gateway. Isi `SHOP.gatewayUrl` dengan endpoint kamu:
- `POST gatewayUrl` body = objek order → balas `{ "total": 5004, "qrUrl": "...", "payUrl": "..." }`
- `GET gatewayUrl?id=ORDERID` → balas `{ "status": "paid" }` saat lunas (status pesanan otomatis jadi SELESAI).
Tanpa gateway, mode manual: user kirim bukti via WA.

## Sound & animasi login
- `js/sound.js` dipasang di semua halaman: efek klik, ketik, sukses, error (otomatis saat pesan muncul), plus musik latar. Dibuat dengan WebAudio, jadi tanpa file audio. Tombol 🔊 (efek) dan 🎵 (musik) ada di pojok kanan bawah; pilihan tersimpan. Musik default mati karena browser memblokir suara otomatis.
- `js/login-anim.js` — banner animasi di kartu login (canvas). Untuk memakai video sungguhan, taruh file di `img/login.mp4` lalu isi `loginVideo: "img/login.mp4"` di `js/config.js`.

## Tampilan seragam (neo-brutalist) di semua halaman
- Header + menu bersama: `js/nav.js` (tombol ☰ Menu berisi semua halaman). Tombol 🎵/🔊 kini ada di header.
- `dasboard.html` — dibuat ulang: statistik pesanan nyata (dari data order), akses cepat ke tools, pesanan terbaru, akun & keluar. Wajib masuk (akun atau tamu).
- `index.html`, `portofolio.html`, `about.html`, `skill.html`, `service.html`, `contact.html` memakai `css/neo.css` + `css/neo-site.css`.
- `payment.html` (`css/neo-pay.css`), `yanzii-AI.html` (`css/neo-ai.css`), `Alqur'an.html` (`css/neo-quran.css`) — hanya tampilan yang diganti, logika tidak diubah.
- Perbaikan bug: library AOS dihapus (jika gagal dimuat, elemen halaman bisa tak terlihat / script error); `js/script.js` lama (error di halaman tanpa elemen ketik) diganti `js/typewriter.js`; form kontak yang `action`-nya bukan URL valid kini mengirim ke WhatsApp admin; tautan TikTok & "Download CV" yang rusak diperbaiki; Al-Qur'an kini menampilkan pesan jika API tidak terjangkau (sebelumnya error tak tertangani); tema gelap Al-Qur'an memakai kelas `dark`.

## Logo = tombol menu
Logo kuning di kiri atas sekarang adalah tombol menu di semua halaman (termasuk login). Ketuk untuk membuka daftar semua halaman; berubah jadi ✕ saat terbuka. Tutup dengan ketuk logo lagi, ketuk di luar menu, atau tekan Esc. Teks brand di sebelahnya tetap link ke Home.

## Wajib login
- `js/guard.js` dipasang di semua halaman kecuali `login.html`: tanpa login, halaman langsung dialihkan ke login lalu kembali ke halaman tujuan setelah masuk.
- Sesi disimpan 7 hari di browser (tab baru tidak perlu login ulang); "Keluar" menghapusnya.
- Tombol "Lanjut tanpa akun" disembunyikan. Untuk mengaktifkan lagi: `allowGuest: true` di `js/config.js`.
- Tombol Toko & Tools di kanan atas header dihapus; navigasi lewat logo (menu). Menu & tombol "Kembali ke Toko" tidak ditampilkan di halaman login.
- Catatan keamanan: situs ini statis, jadi login hanya membatasi akses di sisi browser — bukan pengamanan sungguhan (file bisa dibuka langsung lewat URL-nya). Untuk proteksi nyata dibutuhkan backend.

## Tema 3D
- Latar luar angkasa: gradasi ungu–magenta–cyan + bintang berkelip (otomatis diam jika perangkat memakai "kurangi animasi").
- Kartu kaca gelap dengan glow ungu, tombol gradasi violet–magenta, teks judul bergradasi.
- `css/nebula.css` dimuat terakhir di semua halaman; warna dasar ada di `:root` pada `css/neo.css` (`--bg0`, `--acc`, `--glow`, dst.) — ubah di sana untuk menyesuaikan warna.
- Banner login berganti menjadi animasi nebula (orb bercahaya + bintang).
- Gambar hasil tools (Brat, IQC) tetap memakai warna aslinya.

## Update: sound, loading, animasi dashboard, katalog lengkap
- `css/fx.css` + `js/fx.js` (dipasang di semua halaman): layar loading (cincin berputar + progress bar), transisi antar halaman, animasi muncul saat scroll, efek ripple pada tombol, grid kategori otomatis (`<div id="catGrid">`).
- `js/sound.js`: efek baru — hover, whoosh (loading/pindah halaman), buka/tutup menu, coin (saat pesanan dibuat), notify. Tetap bisa dimatikan lewat tombol 🔊.
- `dasboard.html`: angka statistik naik (count-up), kilau pada kartu, jam live, grafik batang pesanan 7 hari, panel kategori produk.
- `produk.html`: filter kategori (chip), kolom cari, badge POPULER/HEMAT; link langsung per kategori: `produk.html#vps`, `#hosting`, `#panel`, dst.
- `js/config.js`: 11 kategori (Hosting, VPS, Panel, Domain, Apps Prem, Jasa Developer, Nokos, Script Bot, Sewa Bot, Sosmed, Top Up Game) dan 54 produk. **Semua harga adalah contoh — ubah di `products` pada config.js** (format: `P(kategori, nama, deskripsi, harga, satuan, label)`).

## Update: wajib login + order sesuai produk
- `js/guard.js`: semua halaman (kecuali login) hanya terbuka jika sudah masuk/daftar dan akunnya terdaftar di perangkat ini; dicek ulang saat tab kembali aktif atau logout di tab lain. Halaman login menampilkan pesan "masuk atau daftar dulu".
- `produk.html`: form order menyesuaikan produk (kolom isian, label jumlah/durasi, batas jumlah, batas waktu bayar) dan ringkasan pesanan tampil di halaman bayar + pesan WA. Atur per kategori di `SHOP.forms` pada `js/config.js`.
- Pesanan kini tersimpan per akun (dashboard & toko hanya menampilkan pesanan akun yang sedang masuk).

## Update: login jadi halaman utama, info buyer, AI, persen loading
- **Halaman utama = login.** `index.html` sekarang halaman Masuk/Daftar; setelah masuk langsung ke Dashboard (atau halaman yang dituju). Beranda lama dipindah ke `home.html` (menu "Home"). Semua halaman lain tetap wajib login.
- **Persen loading 0–100%** pada layar loading (`js/fx.js`).
- **Info buyer ke admin via WhatsApp:** pendaftaran kini meminta nomor WA; setelah daftar muncul tombol "Kirim info ke Admin". Pesanan baru & "Saya sudah bayar" juga membawa data buyer (nama, email, WA, perangkat, waktu). Dashboard punya tombol "Kirim info akun ke Admin". Pengiriman **otomatis tanpa klik** butuh endpoint sendiri: isi `SHOP.notifyUrl` (POST `{target, message}`).
- **yanzii-AI diperbaiki:** API key yang tertanam di file lama dihapus (key itu terlihat publik — **cabut/ganti di aistudio.google.com/apikey**). Pengaturan di `SHOP.ai` (`js/config.js`): `url` = Cloudflare Worker (`worker/ai.js`, paling aman), atau `key` Gemini langsung, atau kosong = layanan gratis cadangan. Juga: PDF/teks/gambar benar-benar dikirim ke AI, riwayat chat tersimpan per akun, tombol Hapus, markdown lebih rapi, pesan error jelas.
- **Fitur baru:** kode voucher (`SHOP.vouchers`), favorit ❤ di Toko, urutkan harga/nama, notifikasi toast, tombol melayang WhatsApp admin & ke atas.
- **Bug diperbaiki:** tombol ❤ sempat memicu form order; guard login memeriksa akun terdaftar; nomor WA terisi otomatis di form order.

## Update: tema 3D animasi + login sebagai gerbang
- `login.html` = halaman Masuk/Daftar (gerbang). `index.html` = beranda (dulu `home.html`, kini hanya mengalihkan ke index). Semua halaman, termasuk index & dashboard, wajib login/daftar dulu (`js/guard.js` → `login.html`).
- Tema: palet biru baja/cyan (bukan ungu ala AI), tombol & kartu bertekstur tebal 3D, kartu miring mengikuti kursor, judul bertumpuk 3D.
- `js/bg3d.js`: latar kanvas 3D (kubus wireframe melayang + lantai grid perspektif, parallax kursor). Otomatis diam jika "kurangi animasi" aktif.
- Loading: kubus kaca 3D berputar + cincin orbit (`css/fx.css`, `js/fx.js`).

## Update: login per-sesi, loading bulat, teks lembut, sound
- Login kini hanya berlaku selama tab/browser terbuka (sessionStorage). Menutup tab/browser = harus login/daftar lagi.
- Loading: lingkaran berputar. Teks memakai warna lembut (`--tx` di `css/neo.css`).
- Sound: lihat `js/sound.js`; file audio sendiri lewat `SHOP.sounds` di `js/config.js`.
- Logo produk: tiap produk punya ikon sendiri lewat SHOP.icons di js/config.js (kata kunci nama -> ikon RemixIcon + warna).


## Update: AI diperbaiki, Beli Otomatis, ikon foto, latar bintang & Bumi 3D
- **Latar baru** (`js/bg3d.js`): bintang 3D terbang + berkelip + bintang jatuh, nebula, dan planet **Bumi 3D berputar** (awan, atmosfer, lampu kota sisi malam, bulan mengorbit). Peta bumi dibuat prosedural di canvas — tanpa library & tanpa file gambar. Otomatis diam jika "kurangi animasi" aktif. Ganti peta lewat `window.EARTH_SEED=angka` sebelum memuat `bg3d.js`.
- **Ikon produk** = foto `img/product-icon.png` (dari 508196.png) di semua kartu produk, tile kategori, dan chip kategori. Ganti file itu untuk mengubah ikon (`SHOP.productIcon` di `js/config.js`).
- **Beli Otomatis** (`produk.html`): tombol ⚡ di tiap produk — nama, WA, dan email diisi dari akun, data terakhir per kategori diingat, lalu invoice + QRIS langsung dibuat. Jika ada data wajib yang belum ada (mis. username panel), dialog terbuka dengan tombol "⚡ Bayar Otomatis".
  - **Pembayaran terdeteksi otomatis**: deploy `worker/order.js` (gateway Pakasir) lalu isi `gatewayUrl`. Kontrak: `POST gatewayUrl` body = order → `{amount,total,qrUrl,payUrl}`; `GET gatewayUrl?id=ORDERID&amount=NOMINAL` → `{status:"paid"}` saat lunas. Cek tiap 3 detik; saat lunas layar "Pembayaran Diterima" muncul, status jadi SELESAI, admin diberi tahu (butuh `notifyUrl` untuk push otomatis ke WA).
  - Jalankan `node worker/make-prices.js` dan salin `PRICES`/`VOUCHERS` ke variabel Worker agar nominal dihitung ulang di server (pembeli tak bisa mengubah harga lewat browser).
  - Tanpa `gatewayUrl`: tetap mode manual (QRIS statis + kode unik + konfirmasi WA) — verifikasi pembayaran otomatis memang mustahil tanpa backend/gateway.
- **yanzii-AI diperbaiki**: logika dipindah ke `js/ai-client.js`. Urutan penyedia otomatis (Worker → Gemini → API OpenAI-compatible → layanan gratis) dengan retry, timeout, pesan error jelas, riwayat dirapikan (Gemini menolak riwayat yang diawali "model"), pesan gagal dikembalikan ke kolom ketik, dan AI kini tahu katalog toko. `worker/ai.js` (sebelumnya kosong) ditulis ulang: bisa memakai Gemini **atau Workers AI gratis** (binding `AI`, tanpa API key luar).
