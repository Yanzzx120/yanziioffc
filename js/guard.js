/* Wajib login/daftar: pasang di semua halaman kecuali login.html (setelah config.js).
   Sesi dianggap valid hanya jika akunnya benar-benar terdaftar di perangkat ini. */
(function(){
  try{ localStorage.removeItem('session_v1'); }catch(e){}   /* sesi lama 7 hari dihapus: login hanya berlaku selama tab/browser terbuka */
  var de=document.documentElement; de.style.visibility='hidden';
  function clear(){ try{ sessionStorage.removeItem('isLoggedIn'); sessionStorage.removeItem('loggedUser'); localStorage.removeItem('session_v1'); }catch(e){} }
  function ok(){
    try{
      if(sessionStorage.getItem('isLoggedIn')!=='true') return false;
      var u=JSON.parse(sessionStorage.getItem('loggedUser')||'null'); if(!u) return false;
      if(u.guest) return !!(window.SHOP&&SHOP.allowGuest);
      if(!u.email||!localStorage.getItem('user_'+String(u.email).toLowerCase())){ clear(); return false; }
      return true;
    }catch(e){ return false; }
  }
  function go(){ de.style.visibility='hidden'; location.replace('login.html?need=1&next='+encodeURIComponent((location.pathname.split('/').pop()||'index.html')+location.hash)); }
  if(ok()) de.style.visibility=''; else go();
  window.addEventListener('pageshow',function(e){ if(e.persisted&&!ok()) go(); });
  document.addEventListener('visibilitychange',function(){ if(!document.hidden&&!ok()) go(); });
  window.addEventListener('storage',function(){ if(!ok()) go(); });
})();
