/* QRIS dinamis: ubah QRIS statis (SHOP.qrisPayload) jadi QRIS dengan nominal otomatis.
   Dipakai di produk.html -> QRIS.url(total) mengembalikan gambar QR (data URL), atau '' bila gagal
   (maka halaman memakai gambar QRIS statis SHOP.qrisImage). */
(function(){
  function crc16(s){
    var c = 0xFFFF;
    for (var i = 0; i < s.length; i++){
      c ^= s.charCodeAt(i) << 8;
      for (var j = 0; j < 8; j++) c = (c & 0x8000) ? ((c << 1) ^ 0x1021) & 0xFFFF : (c << 1) & 0xFFFF;
    }
    return ('0000' + c.toString(16).toUpperCase()).slice(-4);
  }
  function payload(amount){
    var st = (window.SHOP && SHOP.qrisPayload) || '';
    amount = Math.floor(+amount);
    if (!/^000201/.test(st) || !(amount > 0)) return '';
    if (crc16(st.slice(0, -4)) !== st.slice(-4).toUpperCase()) return '';   // QRIS statis rusak
    var body = st.slice(0, -8).replace('010211', '010212');                // statis -> dinamis
    var a = String(amount), t54 = '54' + ('0' + a.length).slice(-2) + a;
    if (body.indexOf('5802ID') < 0) return '';
    body = body.replace('5802ID', t54 + '5802ID') + '6304';
    return body + crc16(body);
  }
  function url(amount){
    try{
      var p = payload(amount); if (!p || typeof qrcode !== 'function') return '';
      var q = qrcode(0, 'M'); q.addData(p); q.make();
      var n = q.getModuleCount(), cell = 8, quiet = 4, size = (n + quiet * 2) * cell;
      var cv = document.createElement('canvas'); cv.width = cv.height = size;
      var x = cv.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, size, size); x.fillStyle = '#000';
      for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (q.isDark(r, c)) x.fillRect((c + quiet) * cell, (r + quiet) * cell, cell, cell);
      return cv.toDataURL('image/png');
    }catch(e){ return ''; }
  }
  window.QRIS = { payload: payload, url: url };
})();
