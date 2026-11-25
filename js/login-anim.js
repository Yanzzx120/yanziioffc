/* Banner login: adegan 3D (bintang + bumi berputar). Jika SHOP.loginVideo diisi, video itu yang dipakai. */
(function(){
  var box=document.getElementById('heroAnim'); if(!box) return;
  function scene(){ var cv=document.createElement('canvas'); cv.style.cssText='width:100%;height:100%;display:block'; box.appendChild(cv); if(window.Scene3D) Scene3D(cv,{box:box,count:8,fov:.9,title:(window.SHOP&&SHOP.brand)||'Yanzii'}); else setTimeout(scene,100); }
  if(window.SHOP&&SHOP.loginVideo){ var v=document.createElement('video'); v.src=SHOP.loginVideo; v.autoplay=v.loop=v.muted=v.playsInline=true; v.setAttribute('playsinline',''); v.style.cssText='width:100%;height:100%;object-fit:cover;display:block'; v.onerror=function(){ v.remove(); scene(); }; box.appendChild(v); v.play().catch(function(){}); return; }
  scene();
})();
