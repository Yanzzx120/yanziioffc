/* ====== KONFIGURASI TOKO (ubah di sini saja) ====== */
window.SHOP = {
  brand: "yanziiOffc — Digital Store",
  wa: "6285842176747",                 // nomor WhatsApp admin (awalan 62)
  qrisImage: "img/qris.png",
  ewallets: [{name:"DANA",no:"085842176747"},{name:"GoPay",no:"085842176747"},{name:"SeaBank",no:"085842176747"}],
  orderExpireMinutes: 30,

  /* false = semua halaman wajib login akun. true = tombol "Lanjut tanpa akun" aktif di login */
  allowGuest: true,

  /* Video animasi login (opsional): isi path mp4/webm, mis. "img/login.mp4". Kosong = animasi canvas bawaan */
  loginVideo: "img/login.mp4",
  sounds: {click:"sound/klik.mp3", success:"sound/ok.mp3", error:"sound/error.mp3", hover:"sound/hover.mp3", key:"sound/key.mp3", pop:"sound/pop.mp3", open:"sound/open.mp3", close:"sound/close.mp3", notify:"sound/notify.mp3", coin:"sound/coin.mp3", whoosh:"sound/whoosh.mp3"},  // tema "In Another Life" (nada A-minor, dreamy)
  soundVolume: 0.5,
  music: "sound/musik.mp3",   // musik latar (tombol 🎵). Ganti file ini kalau punya lagu sendiri
  musicVolume: 1.0,

  /* Proxy CORS milik sendiri (opsional tapi disarankan, lihat worker/proxy.js).
     Contoh: "https://proxy-kamu.workers.dev/?url=" */
  proxy: "",

  /* Pembayaran memakai QRIS sendiri (a.n. yannLytr) — bayar lalu tekan "Saya Sudah Bayar", admin cek & proses.
     Ganti gambar QRIS lewat qrisImage di atas (link gambar atau file lokal, mis. "img/qris.jpg"). */
  qrisName: "YANNLYTR , DIGITAL & KREATIF",
  cs: "",   // nomor WhatsApp CS (awalan 62), opsional — memunculkan tombol "Kirim ke CS" di halaman bayar

  /* Sisa stok yang tampil di toko (isi manual, ubah angkanya tiap stok berubah). Kunci = nama produk persis.
     Contoh: stock: {"Netflix Premium": 5, "Capcut Pro": 12}. 0 = "Stok habis" (tombol beli nonaktif). Produk yang tidak ditulis = tanpa label stok. */
  stock: {},

  gatewayUrl: "https://yanzii-order.yannlytr.workers.dev",   // backend order (Cloudflare Worker yanzii-order)

  /* AI (yanzii-AI) — dicoba berurutan, yang gagal otomatis pindah ke berikutnya:
     url    = Cloudflare Worker milik sendiri (paling stabil & aman, lihat worker/ai.js — bisa Gemini atau Workers AI gratis)
     key    = API key Gemini langsung (TERLIHAT publik, tidak disarankan)
     openai = {url,key,model} untuk API kompatibel OpenAI (Groq/OpenRouter/dll), contoh: {url:"https://api.groq.com/openai/v1/chat/completions", key:"gsk_...", model:"llama-3.3-70b-versatile"}
     Semua kosong = layanan gratis tanpa key (cadangan terakhir, bisa sibuk). */
  ai: { url: "", key: "", model: "gemini-2.5-flash", openai: null },

  /* Notifikasi ke owner: kosong = tombol "Saya Sudah Bayar" membuka WhatsApp admin dengan detail pesanan (tinggal kirim); CS lewat tombol "Kirim ke CS".
     notifyUrl = endpoint sendiri (POST {target, message}) bila ingin notif otomatis tanpa klik. */
  notifyUrl: "",

  /* Kode voucher (contoh — ubah sesuai kebutuhan). type: pct = persen, flat = potongan rupiah */
  vouchers: { "MN-10RXY25": {type:"pct", v:10, desc:"Diskon 10%"}, "HEMAT10K": {type:"flat", v:10000, desc:"Potongan Rp10.000"} },

  /* Kategori: id, nama, ikon, warna kartu, deskripsi singkat */
  cats: [
    {id:"hosting",name:"Hosting",icon:"🌐",c1:"#0284c7",c2:"#22d3ee",desc:"Minecraft, SAMP, web & cloud"},
    {id:"vps",name:"VPS",icon:"🖥️",c1:"#4f46e5",c2:"#06b6d4",desc:"Root access, NVMe, 1–8 Core"},
    {id:"panel",name:"Panel",icon:"🎛️",c1:"#9333ea",c2:"#ec4899",desc:"Panel bot WhatsApp & reseller"},
    {id:"domain",name:"Domain",icon:"🔗",c1:"#0ea5e9",c2:"#6366f1",desc:".my.id, .web.id, .com, dll"},
    {id:"prem",name:"Apps Prem",icon:"💎",c1:"#2563eb",c2:"#f43f5e",desc:"Capcut, Canva, Netflix, dll"},
    {id:"dev",name:"Jasa Developer",icon:"👨‍💻",c1:"#0369a1",c2:"#3b82f6",desc:"Website, bot, fix error, install"},
    {id:"nokos",name:"Nokos",icon:"📱",c1:"#059669",c2:"#22d3ee",desc:"Nomor virtual untuk OTP"},
    {id:"script",name:"Script Bot",icon:"🤖",c1:"#0284c7",c2:"#f472b6",desc:"Script bot WhatsApp & Telegram"},
    {id:"sewabot",name:"Sewa Bot",icon:"🛰️",c1:"#2563eb",c2:"#a855f7",desc:"Bot siap pakai per grup"},
    {id:"smm",name:"Sosmed",icon:"📈",c1:"#f97316",c2:"#2563eb",desc:"Followers, like & view"},
    {id:"game",name:"Top Up Game",icon:"🎮",c1:"#e11d48",c2:"#0284c7",desc:"Diamond & voucher game"},
    {id:"ppob",name:"Pulsa & PPOB",icon:"💳",c1:"#16a34a",c2:"#facc15",desc:"Pulsa, data, token PLN & saldo e-wallet"}
  ],

  /* Form order per kategori: qty=[label,satuan,min,max] (max 1 = jumlah tetap), exp=menit batas bayar,
     f=[kunci,label,placeholder,wajib,tipe]  tipe: ''|email|area|select:A|B|regex(^...) */
  forms: {
    hosting:{qty:["Durasi (bulan)","bulan",1,12],exp:30,f:[["user","Username panel","contoh: yanzii01",1,"^[a-z0-9_]{3,20}$"],["email","Email aktif","email@contoh.com",1,"email"],["srv","Nama server / domain","opsional",0,""]]},
    vps:{qty:["Durasi (bulan)","bulan",1,12],exp:30,f:[["os","Sistem operasi","",1,"select:Ubuntu 22.04|Ubuntu 20.04|Debian 12|CentOS 7"],["host","Hostname","opsional",0,""],["email","Email aktif","email@contoh.com",1,"email"]]},
    panel:{qty:["Durasi (bulan)","bulan",1,12],exp:30,f:[["user","Username panel","huruf kecil/angka, 3-20",1,"^[a-z0-9]{3,20}$"],["email","Email aktif","email@contoh.com",1,"email"]]},
    domain:{qty:["Lama sewa (tahun)","tahun",1,5],exp:30,f:[["dom","Nama domain yang diinginkan","contoh: tokokamu",1,"^[a-z0-9\\-]{2,40}$"],["email","Email pemilik domain","email@contoh.com",1,"email"]]},
    prem:{qty:["Durasi (bulan)","bulan",1,12],exp:20,f:[["email","Email / ID akun","untuk invite/aktivasi",1,""]]},
    dev:{qty:["Jumlah","project",1,1],exp:60,f:[["need","Detail kebutuhan","jelaskan yang kamu mau",1,"area"],["ref","Link referensi / deadline","opsional",0,""]]},
    nokos:{qty:["Jumlah OTP","OTP",1,10],exp:15,f:[["app","Negara","",1,"select:Indonesia|Malaysia|Amerika|Lainnya"]]},
    script:{qty:["Jumlah","script",1,1],exp:30,f:[["kontak","Username Telegram / WA penerima file","contoh: @username",1,""]]},
    sewabot:{qty:["Durasi (bulan)","bulan",1,12],exp:20,f:[["grup","Link grup WhatsApp","https://chat.whatsapp.com/…",1,"^https?://"]]},
    smm:{qty:["Jumlah paket","paket",1,20],exp:15,f:[["target","Link / username target","akun harus tidak di-private",1,""]]},
    ppob:{qty:["Jumlah","pcs",1,5],exp:15,f:[["nomor","Nomor tujuan / ID pelanggan","contoh: 08123456789",1,"^\\d{6,20}$"]]},
    game:{qty:["Jumlah top up","top up",1,10],exp:15,f:[["gid","ID Game","contoh: 12345678",1,"^\\d{4,20}$"],["zone","Server / Zone ID","opsional (mis. ML)",0,""]]}
  },

  /* Produk: P(kategori, nama, deskripsi, harga, satuan, label)  — HARGA CONTOH, silakan ubah */
  /* Ikon produk & kategori digambar per produk di bagian "IKON PRODUK" di bawah file ini */
  productIcon: "img/product-icon.png",

  /* Produk: P(kategori, nama, deskripsi, harga, satuan, label)  — HARGA CONTOH, silakan ubah */
  products: (function(){ const L=[]; const P=(cat,name,desc,price,u,badge)=>L.push({id:cat+(L.length+1),cat,name,desc,price,u,badge}); 
    P("hosting","Hosting Minecraft Basic","2GB RAM • 1 vCore • Anti-DDoS",10000,"bulan");
    P("hosting","Hosting Minecraft Standar","4GB RAM • 2 vCore • NVMe",20000,"bulan","POPULER");
    P("hosting","Hosting Minecraft High","8GB RAM • 4 vCore • support plugin",40000,"bulan");
    P("hosting","Hosting SAMP","1GB RAM • slot 50–100 • Anti-DDoS",15000,"bulan");
    P("hosting","Hosting Website (cPanel)","1GB SSD • SSL gratis • bandwidth lega",10000,"bulan");
    P("hosting","Cloud Server","Resource dedicated • mudah di-upgrade",50000,"bulan");
    P("vps","VPS 1 Core / 1GB","20GB SSD • akses root • IPv4",25000,"bulan");
    P("vps","VPS 2 Core / 2GB","40GB NVMe • akses root",45000,"bulan");
    P("vps","VPS 2 Core / 4GB","60GB NVMe • cocok untuk bot & web",75000,"bulan","POPULER");
    P("vps","VPS 4 Core / 8GB","100GB NVMe • performa tinggi",140000,"bulan");
    P("panel","Panel Bot 1GB","1 server • 1GB RAM • 1 vCore",2000,"bulan");
    P("panel","Panel Bot 2GB","1 server • 2GB RAM • 1 vCore",3000,"bulan","POPULER");
    P("panel","Panel Bot 4GB","1 server • 4GB RAM • 2 vCore",5000,"bulan");
    P("panel","Panel Unlimited","RAM & CPU unlimited",12000,"bulan");
    P("panel","Reseller Panel","Buat & jual panel sendiri",15000,"bulan");
    P("panel","Admin Panel","Akses admin penuh + server sendiri",20000,"bulan");
    P("domain","Domain .my.id","Registrasi 1 tahun",15000,"tahun");
    P("domain","Domain .web.id","Registrasi 1 tahun",20000,"tahun");
    P("domain","Domain .xyz","Registrasi 1 tahun",25000,"tahun");
    P("domain","Domain .com","Registrasi 1 tahun",160000,"tahun","POPULER");
    P("domain","Subdomain + SSL","Subdomain pribadi + SSL aktif",5000,"sekali");
    P("prem","Alight Motion Premium","Akun premium Alight Motion",3000,"tahun");
    P("prem","Capcut Pro","Tanpa watermark • semua fitur Pro",7000,"bulan","POPULER");
    P("prem","Canva Pro","Template & fitur Pro tanpa batas",5000,"bulan");
    P("prem","Viu Premium","Nonton tanpa iklan",5000,"bulan");
    P("prem","Netflix Premium","Sharing profile • UHD",25000,"bulan");
    P("prem","YouTube Premium","Tanpa iklan • background play",10000,"bulan");
    P("prem","Spotify Premium","Dengar offline • tanpa iklan",15000,"bulan");
    P("dev","Website Toko / Store","Katalog + order WhatsApp • responsif",70000,"project");
    P("dev","Website Portofolio","Desain modern • siap hosting",40000,"project");
    P("dev","Landing Page","1 halaman • cepat & ringan",25000,"project");
    P("dev","Buat Bot WhatsApp / Telegram","Fitur sesuai request",30000,"project","POPULER");
    P("dev","Fix Error Script / Website","Debug sampai berjalan normal",15000,"kasus");
    P("dev","Install Hosting / NodeJS / VPS","Setup server sampai siap pakai",10000,"kasus");
    P("nokos","Nokos WhatsApp","Nomor virtual Indonesia • OTP masuk di web",5000,"OTP","POPULER");
    P("nokos","Nokos Telegram","Nomor virtual • OTP masuk di web",3000,"OTP");
    P("nokos","Nokos Google / Gmail","Nomor virtual • OTP masuk di web",4000,"OTP");
    P("nokos","Nokos Instagram","Nomor virtual • OTP masuk di web",3000,"OTP");
    P("nokos","Nokos TikTok","Nomor virtual • OTP masuk di web",3000,"OTP");
    P("script","Script Bot WA Multi Device","Fitur lengkap • mudah dipasang",25000,"script","POPULER");
    P("script","Script Pushkontak","Kirim pesan massal ke kontak/grup",20000,"script");
    P("script","Script Bot Store","Katalog, order & pembayaran otomatis",35000,"script");
    P("script","Script JPM & Broadcast","Share promosi ke banyak grup",15000,"script");
    P("script","Script Bot Telegram","Bot Telegram siap pakai",15000,"script");
    P("script","Script Bot AI","Chat AI + fitur downloader",25000,"script");
    P("sewabot","Sewa Bot 1 Grup","Bot aktif di 1 grup",5000,"bulan");
    P("sewabot","Sewa Bot 5 Grup","Bot aktif di 5 grup",15000,"bulan","HEMAT");
    P("sewabot","Sewa Bot Unlimited","Grup tanpa batas",30000,"bulan");
    P("smm","Followers Instagram","1.000 followers",15000,"paket");
    P("smm","Like TikTok","1.000 likes",10000,"paket");
    P("smm","View TikTok","10.000 views",1000,"paket");
    P("game","Diamond Mobile Legends","86 Diamond • via ID",22000,"top up");
    P("game","Diamond Free Fire","70 Diamond • via ID",10000,"top up");
    P("game","Robux Roblox","80 Robux",15000,"top up");
    P("hosting","Hosting Discord Bot","512MB RAM • NodeJS/Python • online 24/7",8000,"bulan");
    P("hosting","Hosting NodeJS Pro","2GB RAM • PM2 • SSL gratis",18000,"bulan");
    P("hosting","Hosting WordPress","LiteSpeed • 1-klik install WP • SSL",15000,"bulan");
    P("vps","VPS 4 Core / 16GB","200GB NVMe • performa maksimal",260000,"bulan");
    P("vps","VPS Windows RDP 4GB","Windows Server • akses RDP • 2 Core",90000,"bulan");
    P("panel","Panel Bot 6GB","1 server • 6GB RAM • 2 vCore",7000,"bulan");
    P("panel","Panel Bot 8GB","1 server • 8GB RAM • 3 vCore",9000,"bulan");
    P("panel","Partner Panel","Jadi partner • harga khusus + support",30000,"bulan");
    P("domain","Domain .biz.id","Registrasi 1 tahun",15000,"tahun");
    P("domain","Domain .site","Registrasi 1 tahun",20000,"tahun");
    P("domain","Domain .store","Registrasi 1 tahun",30000,"tahun");
    P("domain","Domain .net","Registrasi 1 tahun",170000,"tahun");
    P("prem","ChatGPT Plus","Akses model terbaru • lebih cepat",45000,"bulan","POPULER");
    P("prem","Disney+ Hotstar","Film, serial & olahraga • full HD",12000,"bulan");
    P("prem","Vidio Platinum","Nonton tanpa iklan • bola & drama",10000,"bulan");
    P("prem","WeTV VIP","Drama Asia tanpa iklan",8000,"bulan");
    P("prem","Prime Video","Film & serial Amazon • UHD",10000,"bulan");
    P("prem","Zoom Pro","Meeting tanpa batas waktu",20000,"bulan");
    P("prem","Microsoft 365","Word, Excel, PowerPoint + 1TB",15000,"bulan");
    P("prem","Picsart Gold","Semua tool & aset premium",6000,"bulan");
    P("dev","Website Company Profile","Multi halaman • SEO dasar • responsif",90000,"project");
    P("dev","Desain Logo","3 konsep • revisi 2x • file PNG/SVG",20000,"project");
    P("dev","Edit Video","Reels/TikTok/YouTube • sampai 3 menit",25000,"project");
    P("dev","Aplikasi Android (WebView)","Ubah website jadi APK siap pakai",120000,"project");
    P("dev","Custom / Rename Script Bot","Ganti nama, menu & fitur sesuai mau",10000,"kasus");
    P("dev","Konsultasi IT","Diskusi 1 jam • solusi teknis",10000,"sesi");
    P("nokos","Nokos Facebook","Nomor virtual • OTP masuk di web",3000,"OTP");
    P("nokos","Nokos Discord","Nomor virtual • OTP masuk di web",4000,"OTP");
    P("nokos","Nokos X (Twitter)","Nomor virtual • OTP masuk di web",4000,"OTP");
    P("nokos","Nokos Shopee","Nomor virtual • OTP masuk di web",5000,"OTP");
    P("script","Script Downloader Bot","TikTok, IG, YouTube, FB dalam satu bot",2000,"script");
    P("script","Script Website Store","Template toko online + panel admin",20000,"script");
    P("script","Script Bot Discord","Bot Discord siap pakai • slash command",10000,"script");
    P("script","Script Auto Order","Order & pembayaran otomatis (QRIS)",25000,"script","POPULER");
    P("sewabot","Sewa Bot Musik","Putar lagu di grup • semua fitur",3000,"bulan");
    P("sewabot","Sewa Bot AI","Chat AI & downloader di grup",5000,"bulan");
    P("smm","Subscribers YouTube","100 subscribers",45000,"paket");
    P("smm","Followers TikTok","1.000 followers",20000,"paket");
    P("smm","Like Instagram","1.000 likes",38000,"paket");
    P("smm","Views Instagram Reels","10.000 views",7000,"paket");
    P("smm","Followers Facebook","1.000 followers",25000,"paket");
    P("game","Diamond Mobile Legends 172","172 Diamond • via ID",42000,"top up","POPULER");
    P("game","Weekly Diamond Pass","Mobile Legends • 80 Diamond + bonus harian",28000,"top up");
    P("game","Diamond Free Fire 140","140 Diamond • via ID",19000,"top up");
    P("game","Genesis Crystal Genshin","60 Genesis Crystal • via UID",16000,"top up");
    P("game","UC PUBG Mobile","60 UC • via ID",15000,"top up");
    P("game","Valorant Points","475 VP • via Riot ID",50000,"top up");
    P("game","Voucher Google Play 50K","Kode voucher Google Play • instan",53000,"voucher");
    P("ppob","Pulsa Telkomsel 10K","Masuk langsung ke nomor tujuan",11500,"pulsa","POPULER");
    P("ppob","Pulsa XL / Axis 10K","Masuk langsung ke nomor tujuan",11500,"pulsa");
    P("ppob","Pulsa Indosat 10K","Masuk langsung ke nomor tujuan",11500,"pulsa");
    P("ppob","Paket Data 10GB","Semua operator • aktif 30 hari",45000,"paket");
    P("ppob","Token PLN 20K","Token listrik prabayar",22500,"token");
    P("ppob","Saldo DANA 50K","Top up saldo DANA",52000,"saldo");
    P("ppob","Saldo GoPay 50K","Top up saldo GoPay",52000,"saldo");
    P("ppob","Saldo OVO 50K","Top up saldo OVO",52000,"saldo");
    P("ppob","Saldo ShopeePay 50K","Top up saldo ShopeePay",52000,"saldo");
    /* ===== SUNTIK SOSMED (ALL PLATFORM) — harga pasaran Nov 2026 + 40% ===== */
    P("smm","Followers Instagram 5K","5.000 followers • non-drop",98000,"paket","HEMAT");
    P("smm","Followers Instagram 10K","10.000 followers • non-drop",182000,"paket");
    P("smm","Like Instagram 5K","5.000 likes • instan",70000,"paket");
    P("smm","Story View Instagram","1.000 story views",2000,"paket");
    P("smm","Komentar Instagram","10 komentar random",11000,"paket");
    P("smm","Views Instagram Reels 1K","1.000 views • cepat",5000,"paket","HEMAT");
    P("smm","Followers TikTok 5K","5.000 followers • non-drop",50000,"paket","POPULER");
    P("smm","Like TikTok 5K","5.000 likes • instan",30000,"paket");
    P("smm","View TikTok 100K","100.000 views • cepat",18000,"paket","HEMAT");
    P("smm","Share TikTok","1.000 shares",2000,"paket");
    P("smm","Save/Favorit TikTok","1.000 saves",1000,"paket");
    P("smm","Komentar TikTok","10 komentar random",8000,"paket");
    P("smm","Live View TikTok","100 penonton live • 30 menit",25000,"paket");
    P("smm","View YouTube 1K","1.000 views • aman",30000,"paket");
    P("smm","Watchtime YouTube","4.000 jam tayang",367500,"paket");
    P("smm","Like YouTube","1.000 likes",8000,"paket");
    P("smm","Komentar YouTube","10 komentar random",17000,"paket");
    P("smm","Views YouTube Shorts","10.000 views",21000,"paket");
    P("smm","Like Facebook","1.000 likes postingan",30000,"paket");
    P("smm","Followers Fanspage Facebook","1.000 followers fanspage",25000,"paket");
    P("smm","View Video Facebook","10.000 views",11000,"paket");
    P("smm","Followers Twitter / X","1.000 followers",39000,"paket");
    P("smm","Like Twitter / X","1.000 likes",30000,"paket");
    P("smm","Retweet Twitter / X","500 retweets",14000,"paket");
    P("smm","Member Channel Telegram","1.000 members",21000,"paket");
    P("smm","View Post Telegram","10.000 views",7000,"paket");
    P("smm","Reaksi Telegram","1.000 reaksi",5000,"paket");
    P("smm","Followers Threads","1.000 followers",31000,"paket");
    P("smm","Followers Saluran WhatsApp","1.000 followers channel",10000,"paket");
    P("smm","Followers Spotify","1.000 followers",39000,"paket");
    P("smm","Play Spotify","10.000 plays",42000,"paket");
    P("smm","Followers Twitch","1.000 followers",42000,"paket");
    P("smm","Member Discord","1.000 members server",55000,"paket");
    P("smm","Followers Shopee","1.000 followers toko",28000,"paket");
    P("smm","Followers Pinterest","1.000 followers",28000,"paket");
    P("smm","Followers LinkedIn","500 followers",42000,"paket");
    P("smm","Paket Hemat All Sosmed","TikTok: 1K followers, 1K like, 10K view",45000,"paket","HEMAT");
    return L; })()
};
/* stok awal produk suntik sosmed (acak). Ubah angkanya tiap stok berubah; 0 = habis */
(function(){ var st=window.SHOP.stock=window.SHOP.stock||{}; var X={"smm112":57,"smm113":45,"smm114":19,"smm115":65,"smm116":59,"smm117":93,"smm118":51,"smm119":65,"smm120":62,"smm121":76,"smm122":8,"smm123":68,"smm124":67,"smm125":46,"smm126":38,"smm127":80,"smm128":24,"smm129":28,"smm130":31,"smm131":11,"smm132":90,"smm133":72,"smm134":48,"smm135":74,"smm136":9,"smm137":91,"smm138":79,"smm139":80,"smm140":43,"smm141":86,"smm142":22,"smm143":66,"smm144":19,"smm145":49,"smm146":89,"smm147":82,"smm148":58}; for(var k in X) if(st[k]===undefined) st[k]=X[k]; })();
/* sisa stok tiap produk: angka acak 5-99 (diacak sekali, tetap sama tiap dibuka). Ubah per produk: SHOP.stock["id-produk"] = angka. 0 = habis. */
(function(){ var R={"hosting1":39,"hosting2":45,"hosting3":29,"hosting4":80,"hosting5":95,"hosting6":11,"vps7":82,"vps8":73,"vps9":15,"vps10":16,"panel11":88,"panel12":36,"panel13":62,"panel14":6,"panel15":78,"panel16":79,"domain17":62,"domain18":56,"domain19":35,"domain20":45,"domain21":9,"prem22":52,"prem23":18,"prem24":88,"prem25":69,"prem26":48,"prem27":72,"prem28":49,"dev29":61,"dev30":21,"dev31":11,"dev32":17,"dev33":57,"dev34":58,"nokos35":11,"nokos36":39,"nokos37":57,"nokos38":68,"nokos39":88,"script40":41,"script41":7,"script42":58,"script43":38,"script44":53,"script45":92,"sewabot46":6,"sewabot47":95,"sewabot48":14,"smm49":89,"smm50":66,"smm51":54,"game52":73,"game53":45,"game54":6,"hosting55":26,"hosting56":9,"hosting57":12,"vps58":84,"vps59":73,"panel60":19,"panel61":43,"panel62":9,"domain63":57,"domain64":72,"domain65":66,"domain66":62,"prem67":39,"prem68":68,"prem69":81,"prem70":20,"prem71":41,"prem72":71,"prem73":61,"prem74":34,"dev75":81,"dev76":54,"dev77":79,"dev78":28,"dev79":39,"dev80":10,"nokos81":49,"nokos82":81,"nokos83":19,"nokos84":53,"script85":39,"script86":66,"script87":5,"script88":12,"sewabot89":19,"sewabot90":91,"smm91":22,"smm92":51,"smm93":8,"smm94":96,"smm95":5,"game96":72,"game97":32,"game98":61,"game99":80,"game100":35,"game101":73,"game102":10,"ppob103":10,"ppob104":86,"ppob105":60,"ppob106":48,"ppob107":97,"ppob108":54,"ppob109":30,"ppob110":93,"ppob111":43};
  var st=window.SHOP.stock; window.SHOP.products.forEach(function(p){ if(st[p.id]!==undefined||st[p.name]!==undefined) return;
    if(R[p.id]!==undefined){ st[p.id]=R[p.id]; return; }
    var h=0,k=String(p.id); for(var i=0;i<k.length;i++) h=(h*31+k.charCodeAt(i))>>>0; st[p.id]=5+h%95; }); })();
/* ===== IKON PRODUK (SVG vektor, digambar per produk) ===== */
(function(){
  var uid=0,W='#fff';
  var G={
    mc:function(){return '<path d="M50 20 78 34 50 48 22 34Z" fill="#6cc24a"/><path d="M22 34 50 48 50 80 22 66Z" fill="#8b5a2b"/><path d="M78 34 50 48 50 80 78 66Z" fill="#6e4520"/><path d="M22 34 50 48 50 54 22 40Z" fill="#4f9a34"/><path d="M78 34 50 48 50 54 78 40Z" fill="#3f7d2a"/><g fill="#b88655"><rect x="30" y="54" width="5" height="5"/><rect x="38" y="64" width="5" height="5"/></g><g fill="#a07040"><rect x="60" y="58" width="5" height="5"/><rect x="66" y="66" width="5" height="5"/></g>';},
    car:function(a){return '<path d="M16 62v-8l8-3 8-14c1-2 3-3 5-3h26c2 0 4 1 5 3l9 14 7 3v8Z" fill="#fff"/><path d="M36 38h12v13H30ZM52 38h10l7 13H52Z" fill="'+a+'" opacity=".55"/><circle cx="32" cy="64" r="8" fill="#1f2937"/><circle cx="68" cy="64" r="8" fill="#1f2937"/><circle cx="32" cy="64" r="3" fill="#cbd5e1"/><circle cx="68" cy="64" r="3" fill="#cbd5e1"/><path d="M80 20c4 3 6 8 4 13M76 26c-6-8-12-4-8 2" stroke="#4ade80" stroke-width="3" fill="none" stroke-linecap="round"/>';},
    web:function(a){return '<rect x="16" y="22" width="68" height="54" rx="8" fill="#fff"/><path d="M16 30a8 8 0 0 1 8-8h52a8 8 0 0 1 8 8v7H16Z" fill="'+a+'"/><circle cx="25" cy="29.5" r="2.2" fill="#fff"/><circle cx="32" cy="29.5" r="2.2" fill="#fff"/><rect x="24" y="45" width="28" height="6" rx="3" fill="'+a+'" opacity=".35"/><rect x="24" y="56" width="50" height="4" rx="2" fill="#cbd5e1"/><rect x="24" y="64" width="38" height="4" rx="2" fill="#cbd5e1"/>';},
    cloud:function(a){return '<circle cx="36" cy="54" r="13" fill="#fff"/><circle cx="54" cy="42" r="17" fill="#fff"/><circle cx="70" cy="56" r="12" fill="#fff"/><rect x="30" y="54" width="40" height="15" fill="#fff"/><g fill="'+a+'"><rect x="34" y="50" width="32" height="6" rx="3"/><rect x="34" y="60" width="32" height="6" rx="3"/></g><circle cx="61" cy="53" r="1.8" fill="#fff"/><circle cx="61" cy="63" r="1.8" fill="#fff"/>';},
    vps:function(a,b){return '<rect x="28" y="16" width="44" height="68" rx="7" fill="#fff"/><g fill="'+a+'"><rect x="35" y="24" width="30" height="7" rx="3"/><rect x="35" y="35" width="30" height="7" rx="3"/></g><circle cx="58" cy="27.5" r="1.8" fill="#fff"/><circle cx="58" cy="38.5" r="1.8" fill="#fff"/><g fill="'+b+'"><rect x="36" y="49" width="11" height="11" rx="2"/><rect x="53" y="49" width="11" height="11" rx="2"/><rect x="36" y="64" width="11" height="11" rx="2" opacity=".5"/><rect x="53" y="64" width="11" height="11" rx="2" opacity=".5"/></g>';},
    panel:function(a,b){return '<rect x="16" y="22" width="68" height="56" rx="9" fill="#fff"/><path d="M16 31a9 9 0 0 1 9-9h9v56h-9a9 9 0 0 1-9-9Z" fill="'+a+'"/><g stroke="#cbd5e1" stroke-width="4" stroke-linecap="round"><path d="M44 36h32M44 50h32M44 64h32"/></g><g fill="'+b+'"><circle cx="58" cy="36" r="5"/><circle cx="70" cy="50" r="5"/><circle cx="52" cy="64" r="5"/></g>';},
    inf:function(){return '<path d="M50 50C42 38 36 34 30 34a16 16 0 0 0 0 32c6 0 12-4 20-16s14-16 20-16a16 16 0 0 1 0 32c-6 0-12-4-20-16Z" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>';},
    dom:function(a,b,x){var s=x.length>5?11:14;return '<rect x="12" y="36" width="76" height="28" rx="14" fill="#fff"/><circle cx="27" cy="50" r="8" fill="'+a+'"/><path d="M27 43c-4 4-4 10 0 14M27 43c4 4 4 10 0 14M20 50h14" stroke="#fff" stroke-width="1.4" fill="none"/><text x="60" y="'+(50+s*.36)+'" font-size="'+s+'" font-weight="800" font-family="Arial,sans-serif" text-anchor="middle" fill="'+a+'">'+x+'</text>';},
    lock:function(a){return '<path d="M36 46V37a14 14 0 0 1 28 0v9" stroke="#fff" stroke-width="6" fill="none"/><rect x="26" y="44" width="48" height="36" rx="8" fill="#fff"/><circle cx="50" cy="59" r="5" fill="'+a+'"/><rect x="48" y="60" width="4" height="11" rx="2" fill="'+a+'"/>';},
    gem:function(a,b){return '<path d="M30 26h40l15 19-35 40-35-40Z" fill="'+a+'"/><path d="M30 26 40 45h20L70 26Z" fill="#fff" opacity=".45"/><path d="M15 45h70M40 45l10 40 10-40" stroke="#fff" stroke-width="2" fill="none" opacity=".75"/><path d="M50 85 40 45h20Z" fill="'+b+'" opacity=".55"/>';},
    cut:function(){return '<circle cx="50" cy="50" r="33" fill="#0b0b0f"/><path d="M40 52 63 24M60 52 37 24" stroke="#fff" stroke-width="5" stroke-linecap="round"/><circle cx="37" cy="64" r="7.5" fill="none" stroke="#fff" stroke-width="4.5"/><circle cx="63" cy="64" r="7.5" fill="none" stroke="#fff" stroke-width="4.5"/>';},
    kf:function(a,b){return '<rect x="14" y="28" width="72" height="44" rx="9" fill="#fff"/><path d="M22 60C36 60 38 40 50 40S64 60 78 60" stroke="'+a+'" stroke-width="4" fill="none" stroke-linecap="round"/><g fill="'+b+'"><path d="M22 54l6 6-6 6-6-6Z"/><path d="M50 34l6 6-6 6-6-6Z"/><path d="M78 54l6 6-6 6-6-6Z"/></g>';},
    pal:function(a){return '<circle cx="50" cy="50" r="33" fill="#fff"/><path d="M66 63c-7 8-25 9-31-3s-3-27 10-31c10-3 23 1 25 11" stroke="'+a+'" stroke-width="10" fill="none" stroke-linecap="round"/><circle cx="55" cy="49" r="5" fill="#a855f7"/>';},
    tv:function(a){return '<rect x="14" y="24" width="72" height="46" rx="9" fill="#fff"/><rect x="20" y="30" width="60" height="34" rx="5" fill="'+a+'"/><path d="M44 38l17 9-17 9Z" fill="#111"/><path d="M36 79h28" stroke="#fff" stroke-width="5" stroke-linecap="round"/>';},
    nf:function(){return '<path d="M33 18h12v64H33Z" fill="#a30610"/><path d="M55 18h12v64H55Z" fill="#a30610"/><path d="M33 18h12l22 64H55Z" fill="#e50914"/>';},
    yt:function(a){return '<rect x="12" y="27" width="76" height="46" rx="14" fill="#fff"/><path d="M43 38l18 12-18 12Z" fill="'+a+'"/>';},
    sp:function(){return '<circle cx="50" cy="50" r="33" fill="#1db954"/><path d="M30 41c14-5 29-3 41 4M32 51c11-3 23-2 33 3M34 60c9-2 18-1 26 3" stroke="#0b0f0c" stroke-width="5" fill="none" stroke-linecap="round"/>';},
    store:function(a,b){return '<path d="M18 40 24 22h52l6 18Z" fill="'+a+'"/><g fill="#fff" opacity=".55"><path d="M34 22h8l-2 18h-8Z"/><path d="M54 22h8l2 18h-8Z"/></g><rect x="22" y="40" width="56" height="38" fill="#fff"/><rect x="42" y="54" width="16" height="24" rx="2" fill="'+b+'"/><rect x="27" y="46" width="12" height="12" rx="2" fill="'+a+'" opacity=".4"/><rect x="62" y="46" width="11" height="12" rx="2" fill="'+a+'" opacity=".4"/>';},
    folio:function(a,b){return '<rect x="14" y="20" width="72" height="60" rx="9" fill="#fff"/><circle cx="33" cy="40" r="8" fill="'+a+'"/><path d="M20 62a13 13 0 0 1 26 0Z" fill="'+a+'"/><g fill="'+b+'"><rect x="54" y="30" width="26" height="15" rx="3"/><rect x="54" y="50" width="12" height="22" rx="3" opacity=".6"/><rect x="69" y="50" width="11" height="22" rx="3"/></g>';},
    rocket:function(a){return '<path d="M50 14c14 11 16 28 9 46H41c-7-18-5-35 9-46Z" fill="#fff"/><circle cx="50" cy="36" r="6.5" fill="'+a+'"/><path d="M41 52 29 66l1 10 11-7ZM59 52l12 14-1 10-11-7Z" fill="'+a+'"/><path d="M44 62h12l-6 20Z" fill="#fbbf24"/>';},
    bot:function(a,b){return '<path d="M50 20v10" stroke="#fff" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="18" r="4.5" fill="'+b+'"/><rect x="22" y="30" width="56" height="44" rx="13" fill="#fff"/><circle cx="37" cy="51" r="7" fill="'+a+'"/><circle cx="63" cy="51" r="7" fill="'+a+'"/><circle cx="39" cy="49" r="2.3" fill="#fff"/><circle cx="65" cy="49" r="2.3" fill="#fff"/><rect x="40" y="63" width="20" height="4" rx="2" fill="'+b+'"/><rect x="14" y="44" width="6" height="14" rx="3" fill="#fff"/><rect x="80" y="44" width="6" height="14" rx="3" fill="#fff"/>';},
    fix:function(a){return '<ellipse cx="40" cy="56" rx="16" ry="20" fill="#fff"/><path d="M40 36v40M24 48 14 42M24 58H12M24 68l-10 6M56 48l10-6M56 58h12" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/><circle cx="40" cy="32" r="8" fill="#fff"/><path d="M34 26 30 18M46 26l4-8" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M40 44v24" stroke="'+a+'" stroke-width="3"/><path d="M82 30a12 12 0 0 1-16 11L48 59l7 7 18-18a12 12 0 0 0 11-16l-8 8-7-2-2-7Z" fill="#fde047"/>';},
    node:function(a){return '<path d="M50 14 80 31v34L50 82 20 65V31Z" fill="'+a+'"/><path d="M50 14 80 31 50 48 20 31Z" fill="#fff" opacity=".28"/><text x="50" y="58" font-size="20" font-weight="900" font-family="Arial,sans-serif" text-anchor="middle" fill="#fff">JS</text>';},
    wa:function(a){return '<path d="M50 16a33 33 0 0 0-28 50l-4 17 17-4A33 33 0 1 0 50 16Z" fill="#fff"/><path d="M39 36c-2 4 0 11 7 17s13 9 17 7l2-5-7-4-3 3c-4-1-9-6-10-10l3-3-4-7Z" fill="'+a+'"/>';},
    tg:function(a){return '<circle cx="50" cy="50" r="33" fill="#fff"/><path d="M26 49 74 31 66 71 50 59 43 67 42 56Z" fill="'+a+'"/><path d="M42 56 66 38 47 57Z" fill="#fff" opacity=".6"/>';},
    goog:function(){return '<g fill="none" stroke-width="10"><circle cx="50" cy="50" r="24" stroke="#ea4335" stroke-dasharray="38 113" transform="rotate(-150 50 50)"/><circle cx="50" cy="50" r="24" stroke="#fbbc05" stroke-dasharray="38 113" transform="rotate(-205 50 50)"/><circle cx="50" cy="50" r="24" stroke="#34a853" stroke-dasharray="38 113" transform="rotate(-300 50 50)"/><circle cx="50" cy="50" r="24" stroke="#4285f4" stroke-dasharray="40 113" transform="rotate(-20 50 50)"/></g><path d="M50 50h26" stroke="#4285f4" stroke-width="10"/>';},
    ig:function(){return '<rect x="20" y="20" width="60" height="60" rx="18" fill="none" stroke="#fff" stroke-width="6"/><circle cx="50" cy="50" r="14" fill="none" stroke="#fff" stroke-width="6"/><circle cx="68" cy="32" r="4.5" fill="#fff"/>';},
    tt:function(){var p='<path d="M54 18v42a13 13 0 1 1-12-13M54 18c2 9 8 14 17 15" fill="none" stroke-width="8" stroke-linecap="round"';return p.replace('<path','<path transform="translate(-3 -2)" stroke="#25f4ee"')+'/>'+p.replace('<path','<path transform="translate(3 2)" stroke="#fe2c55"')+'/>'+p.replace('<path','<path stroke="#fff"')+'/>';},
    phone:function(a){return '<rect x="30" y="14" width="40" height="72" rx="9" fill="#fff"/><rect x="35" y="22" width="30" height="50" rx="3" fill="'+a+'" opacity=".25"/><circle cx="50" cy="79" r="3" fill="'+a+'"/><rect x="58" y="26" width="30" height="20" rx="10" fill="'+a+'"/><path d="M63 46v7l7-7Z" fill="'+a+'"/><text x="73" y="40.5" font-size="11" font-weight="800" font-family="Arial,sans-serif" text-anchor="middle" fill="#fff">OTP</text>';},
    dev:function(a){return '<rect x="22" y="24" width="56" height="38" rx="6" fill="#fff"/><rect x="27" y="29" width="46" height="28" rx="3" fill="#0f172a"/><path d="M42 36 35 43l7 7M58 36l7 7-7 7M53 33l-6 20" stroke="'+a+'" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 70h76l-5 8H17Z" fill="#fff"/>';},
    contact:function(a){return '<rect x="14" y="26" width="52" height="44" rx="8" fill="#fff"/><circle cx="32" cy="44" r="7" fill="'+a+'"/><path d="M20 62a12 12 0 0 1 24 0Z" fill="'+a+'"/><rect x="48" y="40" width="12" height="4" rx="2" fill="#cbd5e1"/><rect x="48" y="49" width="12" height="4" rx="2" fill="#cbd5e1"/><path d="M62 82 90 66 62 50v11l17 5-17 5Z" fill="#fff"/>';},
    cart:function(a){return '<path d="M16 24h11l8 38h38l7-28H32" stroke="#fff" stroke-width="6" fill="none" stroke-linejoin="round" stroke-linecap="round"/><circle cx="41" cy="74" r="5.5" fill="#fff"/><circle cx="68" cy="74" r="5.5" fill="#fff"/><rect x="42" y="40" width="26" height="14" rx="3" fill="'+a+'"/><circle cx="55" cy="47" r="3.2" fill="#fff"/>';},
    mega:function(){return '<path d="M20 42h16l30-17v50L36 58H20Z" fill="#fff"/><rect x="28" y="58" width="11" height="18" rx="3" fill="#fff"/><path d="M72 40c6 4 6 16 0 20M79 32c10 8 10 28 0 36" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>';},
    chip:function(a){return '<g stroke="#fff" stroke-width="4" stroke-linecap="round"><path d="M38 18v10M50 18v10M62 18v10M38 72v10M50 72v10M62 72v10M18 38h10M18 50h10M18 62h10M72 38h10M72 50h10M72 62h10"/></g><rect x="28" y="28" width="44" height="44" rx="9" fill="#fff"/><path d="M50 36l4.5 10.5L65 51l-10.500 4.500L50 66l-4.500-10.500L35 51l10.500-4.500Z" fill="'+a+'"/>';},
    heart:function(a){return '<path d="M50 80C22 61 19 38 34 30c8-4 14 0 16 7 2-7 8-11 16-7 15 8 12 31-16 50Z" fill="'+a+'"/><path d="M33 40c2-5 7-6 11-3" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".7"/>';},
    eye:function(a){return '<path d="M14 50C27 29 73 29 86 50 73 71 27 71 14 50Z" fill="#fff"/><circle cx="50" cy="50" r="13" fill="'+a+'"/><circle cx="50" cy="50" r="5.500" fill="#111"/><circle cx="54" cy="46" r="2.5" fill="#fff"/>';},
    fol:function(a){return '<circle cx="41" cy="38" r="12" fill="#fff"/><path d="M18 76a23 21 0 0 1 46 0Z" fill="#fff"/><circle cx="72" cy="66" r="13" fill="'+a+'" stroke="#fff" stroke-width="3"/><path d="M72 59v14M65 66h14" stroke="#fff" stroke-width="4" stroke-linecap="round"/>';},
    ff:function(){return '<path d="M30 40h40l14 18-34 28-34-28Z" fill="#ffb300"/><path d="M30 40 40 58h20L70 40Z" fill="#fff" opacity=".45"/><path d="M50 36c-10-6-4-14-2-20 8 4 16 12 10 22-2 3-6 2-8-2Z" fill="#ff5722"/>';},
    rbx:function(){return '<path d="M50 14 80 32v36L50 86 20 68V32Z" fill="#f5c542"/><path d="M50 14 80 32 50 50 20 32Z" fill="#fff" opacity=".35"/><path d="M50 34 65 43v18L50 70 35 61V43Z" fill="none" stroke="#b7791f" stroke-width="6" stroke-linejoin="round"/>';},
    pad:function(a,b){return '<path d="M26 34h48c9 0 15 9 16 22l2 14c1 9-9 11-15 4l-8-10H31l-8 10c-6 7-16 5-15-4l2-14c1-13 7-22 16-22Z" fill="#fff"/><path d="M33 45v12M27 51h12" stroke="'+a+'" stroke-width="4.5" stroke-linecap="round"/><circle cx="66" cy="45" r="4" fill="'+b+'"/><circle cx="74" cy="53" r="4" fill="'+a+'"/><circle cx="58" cy="53" r="4" fill="'+a+'"/><circle cx="66" cy="61" r="4" fill="'+b+'"/>';},
    chart:function(a,b){return '<g fill="#fff"><rect x="18" y="56" width="14" height="24" rx="3"/><rect x="40" y="42" width="14" height="38" rx="3"/><rect x="62" y="28" width="14" height="52" rx="3"/></g><path d="M20 40 42 26l12 8 26-18" stroke="'+b+'" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M70 14h14v14Z" fill="'+b+'"/>';}
  };
  /* nama produk -> [glyph, warna1, warna2, label kecil, teks, latar1, latar2] */
  var I={
    "c:ppob":["wallet","#16a34a","#facc15","","","#15803d","#eab308"],
    "Hosting Discord Bot":["dc","#5865f2","","DC","","#3730a3","#5865f2"],"Hosting NodeJS Pro":["node","#3c873a","","2GB","","#14532d","#0284c7"],"Hosting WordPress":["web","#21759b","","WP","","#0e4a6b","#21759b"],"VPS 4 Core / 16GB":["vps","#be185d","#22d3ee","16GB","","#831843","#4f46e5"],"VPS Windows RDP 4GB":["win","#0ea5e9","","RDP","","#0c4a6e","#0ea5e9"],"Panel Bot 6GB":["panel","#9333ea","#ec4899","6GB","","#701a75","#a855f7"],"Panel Bot 8GB":["panel","#9333ea","#ec4899","8GB","","#581c87","#c026d3"],"Partner Panel":["cart","#9333ea","","","","#6b21a8","#f43f5e"],"Domain .biz.id":["dom","#0284c7","","","biz.id","#0ea5e9","#22d3ee"],"Domain .site":["dom","#4f46e5","","","site","#4f46e5","#0ea5e9"],"Domain .store":["dom","#0891b2","","","store","#0e7490","#6366f1"],"Domain .net":["dom","#2563eb","","","net","#1d4ed8","#0ea5e9"],"ChatGPT Plus":["chip","#10a37f","","PLUS","","#064e3b","#10a37f"],"Disney+ Hotstar":["tv","#1e3a8a","","HD","","#0b1e5b","#2563eb"],"Vidio Platinum":["tv","#ef4444","","PLAT","","#7f1d1d","#ef4444"],"WeTV VIP":["tv","#22c55e","","VIP","","#14532d","#22c55e"],"Prime Video":["tv","#0ea5e9","","UHD","","#0c4a6e","#0ea5e9"],"Zoom Pro":["zoom","#2d8cff","","PRO","","#1e40af","#2d8cff"],"Microsoft 365":["ms","#f25022","","365","","#7c2d12","#ea580c"],"Picsart Gold":["pal","#a855f7","","GOLD","","#6b21a8","#ec4899"],"Website Company Profile":["store","#0284c7","","","","#0369a1","#3b82f6"],"Desain Logo":["img","#f97316","","","","#c2410c","#f59e0b"],"Edit Video":["kf","#6d28d9","#f43f5e","","","#1e1b4b","#6d28d9"],"Aplikasi Android (WebView)":["android","#3ddc84","","APK","","#14532d","#3ddc84"],"Custom / Rename Script Bot":["code","#0284c7","","","","#0369a1","#22c55e"],"Konsultasi IT":["chip","#7c3aed","","","","#4c1d95","#2563eb"],"Nokos Facebook":["fb","#1877f2","","OTP","","#1e40af","#1877f2"],"Nokos Discord":["dc","#5865f2","","OTP","","#3730a3","#5865f2"],"Nokos X (Twitter)":["xx","","","OTP","","#0a0a0a","#27272a"],"Nokos Shopee":["shop","#ee4d2d","","OTP","","#9a3412","#ee4d2d"],"Script Downloader Bot":["wa","#25d366","","DL","","#075e54","#25d366"],"Script Website Store":["store","#0284c7","","","","#0369a1","#3b82f6"],"Script Bot Discord":["dc","#5865f2","","BOT","","#3730a3","#5865f2"],"Script Auto Order":["cart","#0284c7","","AUTO","","#0f766e","#0284c7"],"Sewa Bot Musik":["music","#7c3aed","#22d3ee","","","#4338ca","#c026d3"],"Sewa Bot AI":["chip","#7c3aed","","AI","","#4c1d95","#2563eb"],"Subscribers YouTube":["yt","#ff0000","","100","","#7f1d1d","#ef4444"],"Followers TikTok":["fol","#fe2c55","","1K","","#0a0a0a","#25f4ee"],"Like Instagram":["heart","#e1306c","","1K","","#f58529","#8134af"],"Views Instagram Reels":["eye","#e1306c","","10K","","#f58529","#8134af"],"Followers Facebook":["fb","#1877f2","","1K","","#1e40af","#1877f2"],"Diamond Mobile Legends 172":["gem","#5aa9ff","#7c3aed","172","","#1e1b4b","#2563eb"],"Weekly Diamond Pass":["gem","#fde047","#7c3aed","WDP","","#312e81","#7c3aed"],"Diamond Free Fire 140":["ff","","","140","","#7c2d12","#f97316"],"Genesis Crystal Genshin":["gem","#a78bfa","#38bdf8","60","","#312e81","#6366f1"],"UC PUBG Mobile":["pad","#f59e0b","","60","","#78350f","#f59e0b"],"Valorant Points":["pad","#ff4655","","475","","#7f1d1d","#ff4655"],"Voucher Google Play 50K":["goog","","","50K","","#14532d","#16a34a"],"Pulsa Telkomsel 10K":["sim","#ef4444","","10K","","#7f1d1d","#ef4444"],"Pulsa XL / Axis 10K":["sim","#2563eb","","10K","","#1e3a8a","#2563eb"],"Pulsa Indosat 10K":["sim","#facc15","","10K","","#713f12","#eab308"],"Paket Data 10GB":["phone","#059669","","10GB","","#047857","#22d3ee"],"Token PLN 20K":["bolt","#facc15","","20K","","#1e3a8a","#eab308"],"Saldo DANA 50K":["wallet","#118eea","","50K","","#0c4a6e","#118eea"],"Saldo GoPay 50K":["wallet","#00aa13","","50K","","#14532d","#00aa13"],"Saldo OVO 50K":["wallet","#4c3494","","50K","","#312e81","#4c3494"],"Saldo ShopeePay 50K":["wallet","#ee4d2d","","50K","","#9a3412","#ee4d2d"],
    "c:hosting":["web","#0284c7","#22d3ee","","","#0369a1","#22d3ee"],"c:vps":["vps","#4f46e5","#06b6d4","","","#312e81","#4f46e5"],"c:panel":["panel","#9333ea","#ec4899","","","#6b21a8","#ec4899"],
    "c:domain":["dom","#0284c7","","","www","#0ea5e9","#6366f1"],"c:prem":["gem","#60a5fa","#f43f5e","","","#2563eb","#f43f5e"],"c:dev":["dev","#38bdf8","","","","#0369a1","#3b82f6"],
    "c:nokos":["phone","#059669","","","","#047857","#22d3ee"],"c:script":["bot","#0284c7","#f472b6","","","#0284c7","#f472b6"],"c:sewabot":["bot","#7c3aed","#22d3ee","","","#2563eb","#a855f7"],
    "c:smm":["chart","#f97316","#fde047","","","#ea580c","#2563eb"],"c:game":["pad","#e11d48","#0284c7","","","#be123c","#0284c7"],
    "Hosting Minecraft Basic":["mc","","","2GB","","#14532d","#0f766e"],"Hosting Minecraft Standar":["mc","","","4GB","","#166534","#0284c7"],"Hosting Minecraft High":["mc","","","8GB","","#15803d","#7c3aed"],
    "Hosting SAMP":["car","#f97316","","50+","","#1e3a8a","#f97316"],"Hosting Website (cPanel)":["web","#ff6c2c","","SSL","","#ea580c","#fb923c"],"Cloud Server":["cloud","#0284c7","","","","#0284c7","#67e8f9"],
    "VPS 1 Core / 1GB":["vps","#4f46e5","#06b6d4","1GB","","#312e81","#4f46e5"],"VPS 2 Core / 2GB":["vps","#4f46e5","#06b6d4","2GB","","#3730a3","#0891b2"],"VPS 2 Core / 4GB":["vps","#6d28d9","#22d3ee","4GB","","#4c1d95","#0e7490"],"VPS 4 Core / 8GB":["vps","#be185d","#22d3ee","8GB","","#831843","#4f46e5"],
    "Panel Bot 1GB":["panel","#9333ea","#ec4899","1GB","","#6b21a8","#a855f7"],"Panel Bot 2GB":["panel","#9333ea","#ec4899","2GB","","#7e22ce","#c026d3"],"Panel Bot 4GB":["panel","#9333ea","#ec4899","4GB","","#86198f","#ec4899"],
    "Panel Unlimited":["inf","","","","","#6d28d9","#ec4899"],"Reseller Panel":["cart","#9333ea","","","","#7e22ce","#f43f5e"],"Admin Panel":["panel","#be123c","#fde047","ADMIN","","#701a75","#be123c"],
    "Domain .my.id":["dom","#0284c7","","","my.id","#0ea5e9","#6366f1"],"Domain .web.id":["dom","#4f46e5","","","web.id","#6366f1","#0ea5e9"],"Domain .xyz":["dom","#0891b2","","","xyz","#0e7490","#6366f1"],"Domain .com":["dom","#2563eb","","","com","#1d4ed8","#0ea5e9"],"Subdomain + SSL":["lock","#16a34a","","SSL","","#15803d","#0ea5e9"],
    "Alight Motion Premium":["kf","#6d28d9","#f43f5e","PRO","","#1e1b4b","#6d28d9"],"Capcut Pro":["cut","","","PRO","","#111827","#06b6d4"],"Canva Pro":["pal","#00c4cc","","PRO","","#00c4cc","#7d2ae8"],"Viu Premium":["tv","#f5c518","","PREM","","#1f2937","#f5c518"],"Netflix Premium":["nf","","","UHD","","#141414","#3b0a0d"],"YouTube Premium":["yt","#ff0000","","PREM","","#7f1d1d","#ef4444"],"Spotify Premium":["sp","","","PREM","","#0b1f14","#1db954"],
    "Website Toko / Store":["store","#0284c7","#f97316","","","#0369a1","#3b82f6"],"Website Portofolio":["folio","#4f46e5","#22d3ee","","","#1e3a8a","#6366f1"],"Landing Page":["rocket","#2563eb","","","","#1e40af","#38bdf8"],"Buat Bot WhatsApp / Telegram":["bot","#0284c7","#22c55e","WA/TG","","#0369a1","#22c55e"],"Fix Error Script / Website":["fix","#dc2626","","FIX","","#7f1d1d","#ef4444"],"Install Hosting / NodeJS / VPS":["node","#3c873a","","SETUP","","#14532d","#0284c7"],
    "Nokos WhatsApp":["wa","#25d366","","OTP","","#128c7e","#25d366"],"Nokos Telegram":["tg","#229ed9","","OTP","","#1d7fb3","#38bdf8"],"Nokos Google / Gmail":["goog","","","OTP","","#374151","#6b7280"],"Nokos Instagram":["ig","","","OTP","","#f58529","#8134af"],"Nokos TikTok":["tt","","","OTP","","#0a0a0a","#27272a"],
    "Script Bot WA Multi Device":["wa","#25d366","","MD","","#075e54","#25d366"],"Script Pushkontak":["contact","#0284c7","","","","#0369a1","#22c55e"],"Script Bot Store":["cart","#0284c7","","BOT","","#0f766e","#0284c7"],"Script JPM & Broadcast":["mega","","","JPM","","#c2410c","#f59e0b"],"Script Bot Telegram":["tg","#229ed9","","BOT","","#1d7fb3","#7dd3fc"],"Script Bot AI":["chip","#7c3aed","","AI","","#4c1d95","#2563eb"],
    "Sewa Bot 1 Grup":["bot","#7c3aed","#22d3ee","1 Grup","","#2563eb","#a855f7"],"Sewa Bot 5 Grup":["bot","#7c3aed","#22d3ee","5 Grup","","#4338ca","#c026d3"],"Sewa Bot Unlimited":["bot","#7c3aed","#fde047","∞","","#312e81","#a855f7"],
    "Followers Instagram":["fol","#e1306c","","1K","","#f58529","#8134af"],"Like TikTok":["heart","#fe2c55","","1K","","#0a0a0a","#25f4ee"],"View TikTok":["eye","#fe2c55","","10K","","#0a0a0a","#fe2c55"],
    "Diamond Mobile Legends":["gem","#5aa9ff","#7c3aed","86","","#1e1b4b","#2563eb"],"Diamond Free Fire":["ff","","","70","","#7c2d12","#f97316"],"Robux Roblox":["rbx","","","80","","#1f2937","#e11d48"]
  };
  var RI={phone:'smartphone',bot:'robot-2',chart:'bar-chart-2',pad:'gamepad',mc:'cube',car:'car',web:'global',cloud:'cloud',vps:'server',panel:'dashboard',inf:'flashlight',cart:'shopping-cart-2',dom:'links',lock:'lock',kf:'movie-2',cut:'scissors-2',pal:'palette',tv:'tv-2',nf:'netflix',yt:'youtube',sp:'spotify',store:'store-2',folio:'briefcase-4',rocket:'rocket-2',fix:'tools',node:'terminal-box',wa:'whatsapp',tg:'telegram',goog:'google',ig:'instagram',tt:'tiktok',contact:'contacts-book',mega:'megaphone',chip:'cpu',fol:'user-add',heart:'heart-3',eye:'eye',gem:'vip-diamond',ff:'fire',rbx:'coin',dc:'discord',win:'windows',fb:'facebook',xx:'twitter-x',shop:'shopping-bag-3',wallet:'wallet-3',bolt:'flashlight',sim:'sim-card-2',ms:'microsoft',zoom:'vidicon',music:'music-2',code:'code-box',img:'image-2',android:'android'};
  window.pIcon=function(x){
    var k=typeof x==='string'?'c:'+x:(I[x&&x.name]?x.name:'c:'+(x&&x.cat)), s=I[k]||I['c:prem'],
      d=document.createElement('div'), tile=s[5]||'#1e293b';
    d.className='pic flat'; d.style.setProperty('--tile',tile); d.setAttribute('aria-hidden','true');
    d.innerHTML='<i class="ri-'+(RI[s[0]]||'vip-crown')+'-fill"></i>'+(s[3]?'<small></small>':'');
    if(s[3]) d.querySelector('small').textContent=s[3];
    return d;
  };
})();

window.rupiah = n => "Rp" + Number(n).toLocaleString("id-ID");

/* ---- info buyer -> admin ---- */
window.buyer = function(){ try{ return JSON.parse(sessionStorage.getItem('loggedUser')||'null')||{}; }catch(e){ return {}; } };
window.device = function(){ const u=navigator.userAgent, os=/Android/i.test(u)?'Android':/iPhone|iPad/i.test(u)?'iOS':/Windows/i.test(u)?'Windows':/Mac/i.test(u)?'macOS':/Linux/i.test(u)?'Linux':'?',
  br=/Edg\//.test(u)?'Edge':/OPR\//.test(u)?'Opera':/Chrome\//.test(u)?'Chrome':/Firefox\//.test(u)?'Firefox':/Safari\//.test(u)?'Safari':'Browser'; return os+' • '+br; };
window.buyerText = function(title, b){ b=b||buyer(); return '*'+title+'*\n\nNama: '+(b.nama||'-')+'\nEmail: '+(b.email||'-')+'\nWhatsApp: '+(b.wa?'wa.me/'+b.wa:'-')+'\nPerangkat: '+device()+'\nWaktu: '+new Date().toLocaleString('id-ID'); };
window.waLink = t => 'https://wa.me/'+SHOP.wa+'?text='+encodeURIComponent(t);
window.notifyAdmin = async function(text){
  const own = SHOP.notifyUrl, u = own || (SHOP.gatewayUrl ? SHOP.gatewayUrl.replace(/\/+$/,'') + '/notify' : ''); if(!u) return false;
  try{ const r=await fetch(u,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(own?{target:SHOP.wa,message:text}:{message:text})}); return r.ok; }catch(e){ return false; } };

/* ===== Ikon produk: tiap produk punya logo/ilustrasi sendiri ala ikon aplikasinya ===== */
(function(){
  var flat=window.pIcon, u=0;
  function T(bg,inner,lab,dir){
    var id='ig'+(++u), d='', f=bg;
    if(Array.isArray(bg)){ var n=bg.length-1; d='<linearGradient id="'+id+'" '+(dir||'x1="0" y1="0" x2="1" y2="1"')+'>'+bg.map(function(c,i){return '<stop offset="'+(i/n)+'" stop-color="'+c+'"/>';}).join('')+'</linearGradient>'; f='url(#'+id+')'; }
    var lb=lab?'<g class="lb"><rect x="'+(94-lab.length*6.4-12)+'" y="76" width="'+(lab.length*6.4+12)+'" height="16" rx="8" fill="#000" opacity=".6"/><text x="'+(94-(lab.length*6.4+12)/2)+'" y="87.5" font-size="10" font-weight="800" font-family="Arial,sans-serif" text-anchor="middle" fill="#fff">'+lab+'</text></g>':'';
    var s=document.createElement('span');
    s.innerHTML='<svg class="pic" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>'+d+'</defs><rect width="100" height="100" rx="22" fill="'+f+'"/>'+inner+'<rect x=".5" y=".5" width="99" height="99" rx="21.5" fill="none" stroke="#fff" stroke-opacity=".14"/>'+lb+'</svg>';
    return s.firstChild;
  }
  var W='#fff';
  var B={
    nf:function(){return T('#000','<path d="M34 18h11v64H34z" fill="#a30610"/><path d="M55 18h11v64H55z" fill="#a30610"/><path d="M34 18h12l20 64H54z" fill="#e50914"/>');},
    yt:function(l){return T(W,'<rect x="11" y="27" width="78" height="46" rx="14" fill="#f00"/><path d="M42 38l20 12-20 12z" fill="#fff"/>',l);},
    sp:function(l){return T('#121212','<circle cx="50" cy="50" r="35" fill="#1ed760"/><path d="M28 39c15-5 31-3 44 5" stroke="#121212" stroke-width="5.5" fill="none" stroke-linecap="round"/><path d="M30 50c12-3 26-2 37 4" stroke="#121212" stroke-width="4.5" fill="none" stroke-linecap="round"/><path d="M32 60c10-2 19-1 28 3" stroke="#121212" stroke-width="3.5" fill="none" stroke-linecap="round"/>',l);},
    wa:function(l){return T(['#61e07a','#1fa855'],'<path d="M50 19a31 31 0 0 0-26.500 47L20 81l15-4A31 31 0 1 0 50 19z" fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round"/><path d="M40 36c-2.500 3-1.500 9 5 16s12 10 17.500 8l2-5-6.500-3-3 2.500c-3.500-1-7.500-5-9.500-9l2.500-3-3-6.500z" fill="#fff"/>',l);},
    tg:function(l){return T(['#3bb4ea','#1c93c9'],'<path d="M21 49 77 27c3-1 5 1 4 5L71 73c-1 3-3 4-6 2L51 64l-7 7c-1 1-3 1-3-1l-1-12-17-6c-3-1-3-4-2-3z" fill="#fff"/><path d="M43 59 71 37 48 62z" fill="#c8dcea"/>',l);},
    gm:function(l){return T(W,'<rect x="16" y="27" width="68" height="46" rx="5" fill="#f1f3f4"/><path d="M16 32a5 5 0 0 1 5-5h2v47h-2a5 5 0 0 1-5-5z" fill="#4285f4"/><path d="M84 32a5 5 0 0 0-5-5h-2v47h2a5 5 0 0 0 5-5z" fill="#34a853"/><path d="M77 27h2a5 5 0 0 1 5 5v5l-7 5z" fill="#fbbc04"/><path d="M16 32a5 5 0 0 1 5-5h2l27 20 27-20h2a5 5 0 0 1 5 5v5L50 62 16 37z" fill="#ea4335"/>',l);},
    ig:function(l,x){return T(['#fdc468','#e1306c','#5b51d8'],'<rect x="22" y="22" width="56" height="56" rx="17" fill="none" stroke="#fff" stroke-width="6"/><circle cx="50" cy="50" r="13" fill="none" stroke="#fff" stroke-width="6"/><circle cx="66" cy="34" r="4" fill="#fff"/>'+(x||''),l,'x1="0" y1="1" x2="1" y2="0"');},
    tt:function(l,mid){var p=mid||'M54 20v38a12 12 0 1 1-11-12M54 20c2 9 8 14 17 15';return T('#000','<g fill="none" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"><path d="'+p+'" stroke="#25f4ee" transform="translate(-3 -2)"/><path d="'+p+'" stroke="#fe2c55" transform="translate(3 2)"/><path d="'+p+'" stroke="#fff"/></g>',l);},
    canva:function(){return T(['#00c4cc','#7d2ae8'],'<text x="50" y="58" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-weight="700" font-size="26" fill="#fff">Canva</text>');},
    cap:function(l){return T('#000','<path d="M74 31H40a11 11 0 0 0-11 11v16a11 11 0 0 0 11 11h34" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><path d="M46 62 74 34" stroke="#fff" stroke-width="8" stroke-linecap="round"/>',l);},
    am:function(l){return T(['#7b5cff','#2a2f9e'],'<path d="M29 76 50 24l21 52" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="M50 49l9 9-9 9-9-9z" fill="#ff4d7a" stroke="#2a2f9e" stroke-width="3"/>',l);},
    viu:function(l){return T('#f9c80e','<text x="50" y="62" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="38" fill="#1a1a1a">viu</text>',l);},
    rbx:function(l){return T('#1c1c1e','<g transform="rotate(-14 50 50)"><rect x="24" y="24" width="52" height="52" rx="7" fill="#fff"/><rect x="42" y="42" width="16" height="16" fill="#1c1c1e"/></g>',l);},
    ff:function(l){return T(['#ffb400','#ff5a00'],'<path d="M50 12c5 11 20 19 20 38a20 20 0 0 1-40 0c0-9 4-14 9-19 0 7 3 10 7 11-3-11 0-21 4-30z" fill="#fff"/><text x="50" y="62" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-style="italic" font-weight="900" font-size="22" fill="#ff5a00">FF</text>',l);},
    ml:function(l){return T(['#1b2a8f','#3f51d8'],'<path d="M32 26h36l11 17-29 38-29-38z" fill="#5bb8ff"/><path d="M21 43h58L50 81z" fill="#2f86ea"/><path d="M32 26h36l11 17H21z" fill="#a6e0ff"/><path d="M41 43l9-17 9 17M41 43l9 38 9-38" stroke="#fff" stroke-opacity=".7" stroke-width="2" fill="none"/>',l);},
    mc:function(l){return T(['#5aa0e8','#a6d4ff'],'<path d="M20 34 50 48V82L20 68z" fill="#7a5230"/><path d="M80 34 50 48V82L80 68z" fill="#5a3b20"/><path d="M20 34 50 48V57L20 43z" fill="#5fae38"/><path d="M80 34 50 48V57L80 43z" fill="#478a2b"/><path d="M50 18 80 34 50 48 20 34z" fill="#78c94a"/><g fill="#000" opacity=".18"><rect x="30" y="38" width="6" height="6"/><rect x="58" y="28" width="6" height="5"/><rect x="40" y="60" width="6" height="6"/><rect x="62" y="62" width="6" height="6"/></g>',l);},
    samp:function(l){return T(['#f59e0b','#b45309'],'<text x="50" y="47" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="24" fill="#fff">SA</text><text x="50" y="68" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="20" fill="#1f1300">:MP</text>',l);},
    cp:function(l){return T('#ff6c2c','<rect x="17" y="30" width="66" height="40" rx="20" fill="#fff"/><text x="50" y="59" text-anchor="middle" font-family="Arial,sans-serif" font-weight="800" font-size="28" fill="#ff6c2c">cP</text>',l);},
    node:function(l){return T('#202124','<path d="M50 13 80 30v34L50 81 20 64V30z" fill="#3c873a"/><path d="M50 13 80 30 50 47 20 30z" fill="#fff" opacity=".16"/><text x="50" y="60" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="22" fill="#fff">JS</text>',l);},
    cloud:function(l){return T(['#3aa4ff','#1759b8'],'<path d="M29 70a15 15 0 0 1-2-30 20 20 0 0 1 38-4 17 17 0 0 1 4 34z" fill="#fff"/><rect x="39" y="47" width="22" height="6" rx="3" fill="#1759b8"/><rect x="39" y="58" width="22" height="6" rx="3" fill="#1759b8"/>',l);},
    vps:function(l,c){return T(c,'<rect x="18" y="20" width="64" height="27" rx="6" fill="#e0e7ff"/><rect x="18" y="52" width="64" height="27" rx="6" fill="#c7d2fe"/><circle cx="29" cy="33.500" r="3.500" fill="#22c55e"/><circle cx="29" cy="65.500" r="3.500" fill="#22c55e"/><rect x="40" y="30" width="34" height="7" rx="3.500" fill="#6366f1"/><rect x="40" y="62" width="34" height="7" rx="3.500" fill="#6366f1"/>',l);},
    term:function(l,c){return T(c,'<rect x="15" y="23" width="70" height="54" rx="8" fill="#0f172a"/><path d="M15 31a8 8 0 0 1 8-8h54a8 8 0 0 1 8 8v4H15z" fill="#334155"/><circle cx="24" cy="29" r="2.200" fill="#f87171"/><circle cx="31" cy="29" r="2.200" fill="#fbbf24"/><circle cx="38" cy="29" r="2.200" fill="#4ade80"/><path d="M26 49l9 7-9 7" stroke="#4ade80" stroke-width="4.500" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect x="41" y="62" width="18" height="4.500" rx="2" fill="#4ade80"/>',l);},
    admin:function(l){return T(['#d61f4f','#4c0519'],'<path d="M50 15 79 26v22c0 18-12 30-29 37C33 78 21 66 21 48V26z" fill="#fff"/><path d="M50 34l4.500 10 11 1-8.500 7 3 11-10-6-10 6 3-11-8.500-7 11-1z" fill="#d61f4f"/>',l);},
    cart:function(c,coin,l){return T(c,'<path d="M17 27h11l7 34h34l7-27H31" stroke="#fff" stroke-width="6" fill="none" stroke-linejoin="round" stroke-linecap="round"/><circle cx="41" cy="73" r="5.500" fill="#fff"/><circle cx="66" cy="73" r="5.500" fill="#fff"/>'+(coin?'<circle cx="68" cy="30" r="13" fill="#fbbf24"/><text x="68" y="36" font-size="16" font-weight="800" font-family="Arial,sans-serif" text-anchor="middle" fill="#92400e">$</text>':''),l);},
    dom:function(t,c){return T(c,'<rect x="13" y="23" width="74" height="54" rx="8" fill="#fff"/><path d="M13 31a8 8 0 0 1 8-8h58a8 8 0 0 1 8 8v6H13z" fill="#cbd5e1"/><circle cx="22" cy="30" r="2.200" fill="#f87171"/><circle cx="29" cy="30" r="2.200" fill="#fbbf24"/><circle cx="36" cy="30" r="2.200" fill="#4ade80"/><rect x="20" y="42" width="60" height="16" rx="8" fill="#e2e8f0"/><text x="50" y="53.500" text-anchor="middle" font-size="11" font-weight="800" font-family="ui-monospace,Menlo,monospace" fill="#1e3a8a">'+t+'</text><rect x="22" y="64" width="40" height="5" rx="2.500" fill="#cbd5e1"/>');},
    ssl:function(l){return T(['#1fb35a','#0f5f33'],'<path d="M36 46V35a14 14 0 0 1 28 0v11" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round"/><rect x="26" y="44" width="48" height="36" rx="8" fill="#fff"/><circle cx="50" cy="59" r="5.500" fill="#1fb35a"/><rect x="47.500" y="61" width="5" height="11" rx="2" fill="#1fb35a"/>',l);},
    shop:function(){return T(['#1ea0f5','#1a47c4'],'<path d="M17 41 23 21h54l6 20z" fill="#f97316"/><path d="M33 21h9l-2 20h-9zM58 21h9l2 20h-9z" fill="#fff" opacity=".85"/><rect x="21" y="41" width="58" height="38" fill="#fff"/><rect x="41" y="55" width="18" height="24" rx="2" fill="#1ea0f5"/>');},
    folio:function(){return T(['#5b5bf0','#1e2a8a'],'<rect x="14" y="21" width="72" height="58" rx="8" fill="#fff"/><circle cx="34" cy="41" r="8" fill="#5b5bf0"/><path d="M21 63a13 13 0 0 1 26 0z" fill="#5b5bf0"/><rect x="54" y="31" width="25" height="14" rx="3" fill="#22d3ee"/><rect x="54" y="50" width="25" height="5" rx="2.500" fill="#cbd5e1"/><rect x="54" y="60" width="18" height="5" rx="2.500" fill="#cbd5e1"/>');},
    land:function(){return T(['#2f6bff','#12379b'],'<rect x="14" y="21" width="72" height="58" rx="8" fill="#fff"/><rect x="21" y="29" width="58" height="26" rx="4" fill="#dbe7ff"/><path d="M52 34c6 4 7 11 4 18h-8c-3-7-2-14 4-18z" fill="#2f6bff"/><circle cx="52" cy="42" r="2.800" fill="#fff"/><rect x="21" y="61" width="26" height="9" rx="4.500" fill="#2f6bff"/><rect x="52" y="63" width="27" height="5" rx="2.500" fill="#cbd5e1"/>');},
    bot:function(c,l){return T(c,'<path d="M50 17v11" stroke="#fff" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="15" r="4.500" fill="#fde047"/><rect x="21" y="28" width="58" height="46" rx="14" fill="#fff"/><circle cx="37" cy="50" r="7.500" fill="#0f172a"/><circle cx="63" cy="50" r="7.500" fill="#0f172a"/><circle cx="39" cy="48" r="2.500" fill="#fff"/><circle cx="65" cy="48" r="2.500" fill="#fff"/><rect x="42" y="62" width="16" height="4" rx="2" fill="#94a3b8"/><rect x="12" y="43" width="7" height="14" rx="3.500" fill="#fff"/><rect x="81" y="43" width="7" height="14" rx="3.500" fill="#fff"/>',l);},
    fix:function(){return T(['#e53935','#7f1414'],'<ellipse cx="42" cy="57" rx="16" ry="20" fill="#fff"/><circle cx="42" cy="33" r="8" fill="#fff"/><path d="M42 38v38M26 48l-11-6M26 58H13M26 68l-11 6M58 48l11-6M58 58h13" stroke="#fff" stroke-width="3.500" stroke-linecap="round"/><path d="M62 78l17-17" stroke="#fde047" stroke-width="7" stroke-linecap="round"/><circle cx="80" cy="60" r="8" fill="none" stroke="#fde047" stroke-width="5"/>');},
    book:function(l){return T(['#25d366','#0b7a5c'],'<rect x="22" y="20" width="50" height="60" rx="7" fill="#fff"/><circle cx="47" cy="42" r="9" fill="#128c7e"/><path d="M30 66a17 17 0 0 1 34 0z" fill="#128c7e"/><rect x="72" y="30" width="8" height="10" rx="2" fill="#fff"/><rect x="72" y="46" width="8" height="10" rx="2" fill="#fff"/><rect x="72" y="62" width="8" height="10" rx="2" fill="#fff"/>',l);},
    mega:function(l){return T(['#ff8a1f','#c2410c'],'<path d="M20 41h16l30-17v52L36 59H20z" fill="#fff"/><rect x="25" y="59" width="12" height="20" rx="4" fill="#fff"/><path d="M73 38c6 7 6 17 0 24M80 30c10 12 10 28 0 40" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/>',l);},
    chip:function(l){return T(['#7c3aed','#2447c8'],'<g stroke="#fff" stroke-width="5" stroke-linecap="round"><path d="M38 20v12M50 20v12M62 20v12M38 68v12M50 68v12M62 68v12M20 38h12M20 50h12M20 62h12M68 38h12M68 50h12M68 62h12"/></g><rect x="30" y="30" width="40" height="40" rx="8" fill="#fff"/><text x="50" y="58" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="20" fill="#5b2fd6">AI</text>',l);},
    eye:function(l){return T('#000','<g transform="translate(-2.500 -1.500)"><path d="M12 50c10-17 24-25 38-25s28 8 38 25c-10 17-24 25-38 25S22 67 12 50z" fill="#25f4ee"/></g><g transform="translate(2.500 1.500)"><path d="M12 50c10-17 24-25 38-25s28 8 38 25c-10 17-24 25-38 25S22 67 12 50z" fill="#fe2c55"/></g><path d="M12 50c10-17 24-25 38-25s28 8 38 25c-10 17-24 25-38 25S22 67 12 50z" fill="#fff"/><circle cx="50" cy="50" r="13" fill="#111"/><circle cx="54" cy="46" r="4" fill="#fff"/>',l);}
  };
  var heart='M50 77C25 58 23 38 36 32c8-3 14 2 14 8 0-6 6-11 14-8 13 6 11 26-14 45z';
  var M={
    'Netflix Premium':function(){return B.nf();},'YouTube Premium':function(){return B.yt('PREM');},'Spotify Premium':function(){return B.sp('PREM');},
    'Nokos WhatsApp':function(){return B.wa('OTP');},'Nokos Telegram':function(){return B.tg('OTP');},'Nokos Google / Gmail':function(){return B.gm('OTP');},'Nokos Instagram':function(){return B.ig('OTP');},'Nokos TikTok':function(){return B.tt('OTP');},
    'Canva Pro':function(){return B.canva();},'Capcut Pro':function(){return B.cap('PRO');},'Alight Motion Premium':function(){return B.am('PRO');},'Viu Premium':function(){return B.viu('PREM');},
    'Robux Roblox':function(){return B.rbx('80');},'Diamond Free Fire':function(){return B.ff('70');},'Diamond Mobile Legends':function(){return B.ml('86');},
    'Hosting Minecraft Basic':function(){return B.mc('2GB');},'Hosting Minecraft Standar':function(){return B.mc('4GB');},'Hosting Minecraft High':function(){return B.mc('8GB');},'Hosting SAMP':function(){return B.samp('50+');},
    'Hosting Website (cPanel)':function(){return B.cp('SSL');},'Cloud Server':function(){return B.cloud();},
    'VPS 1 Core / 1GB':function(){return B.vps('1GB',['#4338ca','#1e1b4b']);},'VPS 2 Core / 2GB':function(){return B.vps('2GB',['#4f46e5','#1e1b4b']);},'VPS 2 Core / 4GB':function(){return B.vps('4GB',['#7c3aed','#2e1065']);},'VPS 4 Core / 8GB':function(){return B.vps('8GB',['#be185d','#3b0764']);},
    'Panel Bot 1GB':function(){return B.term('1GB',['#7c3aed','#312e81']);},'Panel Bot 2GB':function(){return B.term('2GB',['#8b3cf0','#3b1d8f']);},'Panel Bot 4GB':function(){return B.term('4GB',['#a23be0','#4a1a85']);},'Panel Unlimited':function(){return B.term('∞',['#c026d3','#4a1a85']);},
    'Reseller Panel':function(){return B.cart(['#9333ea','#581c87'],true);},'Admin Panel':function(){return B.admin('ADMIN');},
    'Domain .my.id':function(){return B.dom('.my.id',['#0ea5e9','#1d4ed8']);},'Domain .web.id':function(){return B.dom('.web.id',['#6366f1','#312e81']);},'Domain .xyz':function(){return B.dom('.xyz',['#06b6d4','#0e4f66']);},'Domain .com':function(){return B.dom('.com',['#2563eb','#172554']);},'Subdomain + SSL':function(){return B.ssl('SSL');},
    'Website Toko / Store':function(){return B.shop();},'Website Portofolio':function(){return B.folio();},'Landing Page':function(){return B.land();},
    'Buat Bot WhatsApp / Telegram':function(){return B.bot(['#0ea5e9','#0f766e'],'WA/TG');},'Fix Error Script / Website':function(){return B.fix();},'Install Hosting / NodeJS / VPS':function(){return B.node('SETUP');},
    'Script Bot WA Multi Device':function(){return B.wa('MD');},'Script Pushkontak':function(){return B.book();},'Script Bot Store':function(){return B.cart(['#128c7e','#25d366'],false,'BOT');},'Script JPM & Broadcast':function(){return B.mega('JPM');},'Script Bot Telegram':function(){return B.tg('BOT');},'Script Bot AI':function(){return B.chip();},
    'Sewa Bot 1 Grup':function(){return B.bot(['#7c3aed','#2447c8'],'1 Grup');},'Sewa Bot 5 Grup':function(){return B.bot(['#6d3be0','#3a2aa8'],'5 Grup');},'Sewa Bot Unlimited':function(){return B.bot(['#5b21b6','#2a1a6e'],'∞');},
    'Followers Instagram':function(){return B.ig('1K','<circle cx="72" cy="68" r="13" fill="#fff"/><path d="M72 61v14M65 68h14" stroke="#e1306c" stroke-width="4" stroke-linecap="round"/>');},
    'Like TikTok':function(){return T('#000','<path d="'+heart+'" fill="#25f4ee" transform="translate(-3 -2)"/><path d="'+heart+'" fill="#fe2c55" transform="translate(3 2)"/><path d="'+heart+'" fill="#fff"/>','1K');},'View TikTok':function(){return B.eye('10K');}
  };
  window.pIcon=function(x){ var f=x&&typeof x==='object'&&M[x.name]; if(f){ try{ return f(); }catch(e){} } return flat(x); };
  window.PRODUCT_ICON_NAMES=Object.keys(M);
})();
