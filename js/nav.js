/* Header neo bersama untuk semua halaman (brand + menu). Dipasang di <div id="siteNav"></div> */
(function(){
  const LINKS=[['index.html','Home'],['produk.html','Toko'],['tools.html','Tools'],['dasboard.html','Dashboard'],['portofolio.html','Portofolio'],['about.html','About'],['skill.html','Skills'],['service.html','Service'],['contact.html','Contact'],['payment.html','Payment'],['yanzii-AI.html','yanzii-AI'],["Alqur'an.html","Al-Qur'an"]];
  const cur=(location.pathname.split('/').pop()||'index.html');
  const host=document.getElementById('siteNav')||document.body.insertBefore(Object.assign(document.createElement('div'),{id:'siteNav'}),document.body.firstChild);
  const brand=(window.SHOP&&SHOP.brand)||'Yanzii';
  host.classList.add('nb-top','site-top');
  if(!host.hasAttribute('data-keep')){
    host.innerHTML='<button class="logo logo-btn" type="button" id="navBtn" aria-label="Buka menu" aria-expanded="false" aria-controls="navMenu"><i></i></button><a class="brand brand-name" href="index.html"></a><div class="row" style="flex:0 0 auto;gap:8px;margin-left:auto"></div>';
    host.querySelector('.brand-name').textContent=brand;
  }
  const menu=document.createElement('div'); menu.id='navMenu'; menu.className='nav-menu'; menu.hidden=true;
  LINKS.forEach(([h,t])=>{ const a=document.createElement('a'); a.href=h; a.textContent=t; if(h===cur) a.className='on'; menu.appendChild(a); });
  const so=document.createElement('a'); so.href='login.html'; so.textContent='Keluar'; so.className='out-link';
  so.onclick=()=>{ try{ sessionStorage.removeItem('isLoggedIn'); sessionStorage.removeItem('loggedUser'); localStorage.removeItem('session_v1'); }catch(e){} };
  menu.appendChild(so); host.after(menu);
  const btn=host.querySelector('#navBtn');
  function set(o){ menu.hidden=!o; btn.setAttribute('aria-expanded',o); btn.classList.toggle('open',o); btn.setAttribute('aria-label',o?'Tutup menu':'Buka menu'); }
  btn.onclick=()=>set(menu.hidden);
  document.addEventListener('keydown',e=>{ if(e.key==='Escape') set(false); });
  document.addEventListener('click',e=>{ if(!menu.hidden && !menu.contains(e.target) && !host.contains(e.target)) set(false); });
})();
