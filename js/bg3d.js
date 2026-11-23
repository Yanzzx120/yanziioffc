/* Latar 3D beranimasi: bintang 3D (terbang + berkelip + bintang jatuh) dan planet Bumi berputar
   lengkap dengan awan, atmosfer, lampu kota sisi malam, dan bulan yang mengorbit.
   Semua digambar di canvas 2D tanpa library & tanpa file gambar (peta bumi dibuat prosedural). */
(function(){
  var R=matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- tekstur Bumi prosedural (dibuat sekali, dibagi ke semua scene) ---------- */
  var TW=1024,TH=512,TEX=null;
  function ih(x,y,s){ var h=Math.imul(x,374761393)+Math.imul(y,668265263)+Math.imul(s,1274126177); h=Math.imul(h^(h>>>13),1274126177); h^=h>>>16; return (h>>>0)/4294967296; }
  function vn(u,v,fx,fy,s){ var x=u*fx,y=v*fy,ix=Math.floor(x),iy=Math.floor(y),a=x-ix,b=y-iy; a=a*a*(3-2*a); b=b*b*(3-2*b);
    var x0=((ix%fx)+fx)%fx,x1=(x0+1)%fx,p=ih(x0,iy,s),q=ih(x1,iy,s),r=ih(x0,iy+1,s),t=ih(x1,iy+1,s); return (p+(q-p)*a)+((r+(t-r)*a)-(p+(q-p)*a))*b; }
  function fbm(u,v,oct,f0,s){ var sum=0,amp=1,tot=0; for(var o=0;o<oct;o++){ var fx=f0*(1<<o); sum+=amp*vn(u,v,fx,fx,s+o*17); tot+=amp; amp*=.5; } return sum/tot; }
  function mix(a,b,t){ return a+(b-a)*t; }
  function sstep(a,b,x){ x=Math.max(0,Math.min(1,(x-a)/(b-a))); return x*x*(3-2*x); }
  function makeTex(){
    var SD=window.EARTH_SEED||40,N=TW*TH,H=new Float32Array(N),col=new Uint8Array(N*3),oc=new Uint8Array(N),cl=new Uint8Array(N),li=new Uint8Array(N),x,y,i;
    for(y=0;y<TH;y++){ var v=y/TH; for(x=0;x<TW;x++){ var u=x/TW,w=fbm(u,v,3,4,91+SD); i=y*TW+x;
      H[i]=fbm((u+(w-.5)*.16+1)%1,Math.max(0,Math.min(.999,v+(w-.5)*.1)),7,5,7+SD); } }
    var sm=[];for(i=0;i<N;i+=7)sm.push(H[i]); sm.sort(function(a,b){return a-b;}); var thr=sm[Math.floor(sm.length*.69)];
    for(y=0;y<TH;y++){ var v2=y/TH,lat=Math.abs(v2-.5)*180; for(x=0;x<TW;x++){ var u2=x/TW; i=y*TW+x; var h=H[i],r,g,b,o=i*3;
      var cloud=sstep(.56,.8,fbm(u2,v2,6,4,401+SD))*(0.5+.5*sstep(.2,.6,fbm(u2,v2,3,4,555)))*.8; cl[i]=Math.min(255,cloud*255);
      if(h<thr){ var d=Math.min(1,(thr-h)/(thr*.45)); r=mix(36,6,d); g=mix(132,34,d); b=mix(176,92,d); oc[i]=1; if(lat>72){ var ice=sstep(72,80,lat+(fbm(u2,v2,4,6,31)-.5)*14); r=mix(r,232,ice); g=mix(g,240,ice); b=mix(b,250,ice); } }
      else { var e=(h-thr)/(1-thr),m=fbm(u2,v2,4,4,222),des=m<.45?sstep(.45,.35,m)*sstep(48,34,lat):0;
        r=mix(38,98,e*1.6); g=mix(112,128,e*1.2); b=mix(52,62,e*1.2);
        if(des>0){ r=mix(r,206,des); g=mix(g,172,des); b=mix(b,112,des); }
        if(e>.55){ var mt=sstep(.55,.8,e); r=mix(r,128,mt); g=mix(g,112,mt); b=mix(b,96,mt); }
        var sn=Math.max(sstep(66,78,lat+(fbm(u2,v2,4,6,31)-.5)*14),sstep(.8,.95,e)); r=mix(r,240,sn); g=mix(g,245,sn); b=mix(b,250,sn);
        if(lat<62&&e<.55&&fbm(u2,v2,7,6,808)>.6&&m>.4) li[i]=Math.min(255,200+Math.random()*55); }
      col[o]=r;col[o+1]=g;col[o+2]=b; } }
    return {col:col,oc:oc,cl:cl,li:li};
  }

  /* ---------- Scene ---------- */
  function Scene3D(cv,o){
    o=o||{}; var c=cv.getContext('2d'),W=0,H=0,D=1,d=1,mx=0,my=0,tx=0,ty=0,t0=performance.now(),run=true,fr=0,rot=0,crot=0,moonA=1.2,
      stars=[],shoot=null,E=null,off=document.createElement('canvas'),octx=off.getContext('2d'),img=null,u32=null,pre=null,small=!!o.box;
    var COLS=['255,255,255','200,220,255','170,200,255','255,236,205','255,214,180'];
    function newStar(s,first){ var z=first?.15+Math.random()*1.45:1.6; s.z=z; s.x=(Math.random()*2-1)*(W/D)*z; s.y=(Math.random()*2-1)*(H/D)*z; s.s=.5+Math.random()*1.1; s.c=COLS[(Math.random()*COLS.length)|0]; s.p=Math.random()*6.28; s.f=1+Math.random()*2.5; return s; }
    function layout(){
      var portrait=W<H*.9;
      if(small){ E={r:Math.min(W,H)*.36,x:W*.5,y:H*.58}; }
      else if(portrait){ var r=Math.min(W*.46,H*.3); E={r:r,x:W*.64,y:H-r*.72}; }
      else { var r2=Math.min(H*.3,W*.24); E={r:r2,x:W*.78,y:H*.7}; }
      var Sz=Math.max(80,Math.min(small?340:(W<700?300:440),Math.ceil(E.r*2*d)));
      off.width=off.height=Sz; img=octx.createImageData(Sz,Sz); u32=new Uint32Array(img.data.buffer); pre=null; E.sz=Sz;
    }
    function size(){ var r=(o.box||cv).getBoundingClientRect(); d=Math.min(devicePixelRatio||1,2); W=r.width||innerWidth; H=r.height||innerHeight; D=Math.max(W,H); cv.width=W*d; cv.height=H*d; c.setTransform(d,0,0,d,0,0);
      var n=Math.min(small?150:520,Math.round(W*H/(W<700?3200:2600))); while(stars.length<n) stars.push(newStar({},true)); stars.length=n; layout(); }
    size(); addEventListener('resize',size);
    setTimeout(function(){ TEX=TEX||makeTex(); pre=null; if(R) frame(performance.now()); },30);

    /* pra-hitung per piksel (cahaya, lintang/bujur) — hanya sekali per ukuran */
    function prep(){
      var Sz=E.sz,n=Sz*Sz,tilt=-.41,pitch=.34,ct=Math.cos(tilt),st=Math.sin(tilt),cp=Math.cos(pitch),sp=Math.sin(pitch),L=[-.62,.34,.71],ll=Math.hypot(L[0],L[1],L[2]);L[0]/=ll;L[1]/=ll;L[2]/=ll;
      var Hh=[L[0],L[1],L[2]+1],hl=Math.hypot(Hh[0],Hh[1],Hh[2]);Hh[0]/=hl;Hh[1]/=hl;Hh[2]/=hl;
      pre={k:new Int32Array(n),row:new Int32Array(n),lon:new Float32Array(n),day:new Float32Array(n),spec:new Float32Array(n),fres:new Float32Array(n),al:new Float32Array(n),cnt:0};
      var cnt=0;
      for(var j=0;j<Sz;j++)for(var i=0;i<Sz;i++){
        var px=(i+.5)/Sz*2-1,py=1-(j+.5)/Sz*2,rr=px*px+py*py; if(rr>=1) continue;
        var nz=Math.sqrt(1-rr),nx=px,ny=py,
            x1=nx*ct-ny*st,y1=nx*st+ny*ct,z1=nz,           // miringkan sumbu (roll)
            y2=y1*cp+z1*sp,z2=-y1*sp+z1*cp,x2=x1;          // condongkan ke kamera (pitch)
        var lat=Math.asin(Math.max(-1,Math.min(1,y2))),lon=Math.atan2(x2,z2);
        var dif=nx*L[0]+ny*L[1]+nz*L[2],hd=Math.max(0,nx*Hh[0]+ny*Hh[1]+nz*Hh[2]);
        var q=cnt++; pre.k[q]=j*Sz+i; pre.row[q]=Math.min(TH-1,Math.max(0,Math.floor((.5-lat/Math.PI)*TH)))*TW; pre.lon[q]=lon/(Math.PI*2)+.5;
        pre.day[q]=sstep(-.12,.38,dif); pre.spec[q]=Math.pow(hd,140)*.7; pre.fres[q]=Math.pow(1-nz,2.6); pre.al[q]=Math.max(0,Math.min(1,(1-Math.sqrt(rr))*E.sz*.5));
      }
      pre.cnt=cnt;
    }
    function drawEarth(){
      if(!TEX) return; if(!pre) prep();
      var T=TEX,col=T.col,oc=T.oc,cl=T.cl,li=T.li,P=pre,n=P.cnt,out=u32,ro=((rot%1)+1)%1,cr=((crot%1)+1)%1;
      for(var q=0;q<n;q++){
        var ti=P.row[q]+(((P.lon[q]+ro)%1)*TW|0),ci=P.row[q]+(((P.lon[q]+cr)%1)*TW|0),o3=ti*3,day=P.day[q],cloud=cl[ci]/255*.9,
            r=col[o3],g=col[o3+1],b=col[o3+2];
        r+=(246-r)*cloud;g+=(248-g)*cloud;b+=(252-b)*cloud;
        var sh=.05+.95*day,R2=r*sh+9*(1-day),G2=g*sh+16*(1-day),B2=b*sh+44*(1-day),nl=1-day;
        if(li[ti]&&nl>.55){ var k=(nl-.55)/.45*(1-cloud)*(li[ti]/255); R2+=255*k;G2+=190*k;B2+=95*k; }
        if(oc[ti]){ var sp2=P.spec[q]*day*(1-cloud)*.9; R2+=255*sp2;G2+=250*sp2;B2+=235*sp2; }
        var f=P.fres[q],fa=f*(.3+1.1*day); R2+=60*fa;G2+=130*fa;B2+=255*fa;
        R2=R2>255?255:R2;G2=G2>255?255:G2;B2=B2>255?255:B2;
        out[P.k[q]]=((P.al[q]*255)<<24)|(B2<<16)|(G2<<8)|R2;
      }
      octx.putImageData(img,0,0);
    }

    function drawMoon(front,cx,cy,er,t){
      var a=moonA,mx2=cx+Math.cos(a)*er*2.3,my2=cy-er*1.25+Math.sin(a)*er*.32,z=Math.sin(a+1.57); // z>0 di depan bumi
      if((z>0)!==front) return; var mr=er*.15*(1+z*.12);
      var g=c.createRadialGradient(mx2-mr*.4,my2-mr*.4,mr*.1,mx2,my2,mr); g.addColorStop(0,'#f4f1ea'); g.addColorStop(.6,'#b9b4aa'); g.addColorStop(1,'#4c4a50');
      c.fillStyle=g; c.beginPath(); c.arc(mx2,my2,mr,0,6.2832); c.fill();
      c.fillStyle='rgba(60,58,64,.35)'; [[-.3,-.1,.2],[.25,.2,.14],[.05,-.35,.1],[-.1,.3,.09]].forEach(function(k){ c.beginPath(); c.arc(mx2+k[0]*mr,my2+k[1]*mr,k[2]*mr,0,6.2832); c.fill(); });
    }

    function frame(now){
      if(!run) return; var t=(now-t0)/1000; fr++; mx+=(tx-mx)*.05; my+=(ty-my)*.05;
      if(!R){ rot+=.00045; crot+=.00062; moonA+=.0028; }
      // langit
      var g=c.createLinearGradient(0,0,0,H); g.addColorStop(0,'#01030a'); g.addColorStop(1,'#060a1e'); c.fillStyle=g; c.fillRect(0,0,W,H);
      var nb=[[.2,.25,.6,'90,60,210',.17],[.82,.18,.5,'14,165,233',.11],[.35,.85,.55,'236,72,153',.07]];
      nb.forEach(function(q,i){ var ox=Math.sin(t*.05+i*2)*W*.03,oy=Math.cos(t*.04+i)*H*.03,rr=Math.max(W,H)*q[2],gg=c.createRadialGradient(W*q[0]+ox,H*q[1]+oy,0,W*q[0]+ox,H*q[1]+oy,rr); gg.addColorStop(0,'rgba('+q[3]+','+q[4]+')'); gg.addColorStop(1,'rgba('+q[3]+',0)'); c.fillStyle=gg; c.fillRect(0,0,W,H); });
      // bintang 3D
      c.save(); c.translate(W/2+mx*10,H/2+my*8); c.rotate(R?0:t*.0035);
      for(var i=0;i<stars.length;i++){ var s=stars[i]; if(!R){ s.z-=.0011; } var inv=1/s.z,sx=s.x*inv*D/2+mx*14*inv*.5,sy=s.y*inv*D/2+my*10*inv*.5;
        if(s.z<.08||Math.abs(sx)>W*.75||Math.abs(sy)>H*.75){ newStar(s,false); continue; }
        var tw=R?1:.65+.35*Math.sin(t*s.f+s.p),a=Math.min(1,(1.7-s.z)*1.4)*tw,sz=s.s*(.7+.55*inv);
        c.globalAlpha=Math.max(0,a); c.fillStyle='rgb('+s.c+')';
        if(s.z<.2&&!R){ var inv2=1/(s.z+.018); c.strokeStyle='rgba('+s.c+',.4)'; c.lineWidth=sz*.7; c.beginPath(); c.moveTo(sx,sy); c.lineTo(s.x*inv2*D/2,s.y*inv2*D/2); c.stroke(); }
        if(sz>1.5){ c.beginPath(); c.arc(sx,sy,sz*.6,0,6.2832); c.fill(); } else c.fillRect(sx-sz/2,sy-sz/2,sz,sz); }
      c.restore(); c.globalAlpha=1;
      // bintang jatuh
      if(!R){ if(!shoot&&Math.random()<.004){ var ang=.5+Math.random()*.3; shoot={x:Math.random()*W*.8,y:Math.random()*H*.35,vx:Math.cos(ang)*9,vy:Math.sin(ang)*9,l:0}; }
        if(shoot){ shoot.x+=shoot.vx; shoot.y+=shoot.vy; shoot.l++; var al=Math.max(0,1-shoot.l/55),gs=c.createLinearGradient(shoot.x,shoot.y,shoot.x-shoot.vx*9,shoot.y-shoot.vy*9); gs.addColorStop(0,'rgba(255,255,255,'+al+')'); gs.addColorStop(1,'rgba(255,255,255,0)'); c.strokeStyle=gs; c.lineWidth=1.8; c.beginPath(); c.moveTo(shoot.x,shoot.y); c.lineTo(shoot.x-shoot.vx*9,shoot.y-shoot.vy*9); c.stroke(); if(shoot.l>55) shoot=null; } }
      // bumi
      var ex=E.x+mx*16,ey=E.y+my*12,er=E.r;
      drawMoon(false,ex,ey,er,t);
      var ag=c.createRadialGradient(ex,ey,er*.92,ex,ey,er*1.32); ag.addColorStop(0,'rgba(90,160,255,.5)'); ag.addColorStop(.35,'rgba(60,120,255,.18)'); ag.addColorStop(1,'rgba(40,90,255,0)'); c.fillStyle=ag; c.beginPath(); c.arc(ex,ey,er*1.32,0,6.2832); c.fill();
      if(TEX&&(!R||fr<3)&&(fr%2===0||!pre||R)) drawEarth();
      if(TEX){ c.imageSmoothingEnabled=true; c.imageSmoothingQuality='high'; c.drawImage(off,ex-er,ey-er,er*2,er*2); }
      else { var pg=c.createRadialGradient(ex-er*.3,ey-er*.3,er*.1,ex,ey,er); pg.addColorStop(0,'#2b7bd6'); pg.addColorStop(1,'#06163a'); c.fillStyle=pg; c.beginPath(); c.arc(ex,ey,er,0,6.2832); c.fill(); }
      drawMoon(true,ex,ey,er,t);
      if(o.title){ var fs=Math.min(54,W/6); c.font='800 '+fs+'px "Plus Jakarta Sans",Arial,sans-serif'; c.textAlign='center'; c.textBaseline='middle'; var by=R?0:Math.sin(t*1.8)*5;
        for(var k=6;k>0;k--){ c.fillStyle='rgb('+(2+k*8)+','+(40+k*20)+','+(70+k*20)+')'; c.fillText(o.title,W/2+k*.6,H*.32+by+k*1.2); } c.fillStyle='#d5e1ee'; c.fillText(o.title,W/2,H*.32+by); }
      if(!R) requestAnimationFrame(frame);
    }
    addEventListener('pointermove',function(e){ tx=e.clientX/innerWidth-.5; ty=e.clientY/innerHeight-.5; },{passive:true});
    document.addEventListener('visibilitychange',function(){ if(document.hidden) run=false; else if(!run){ run=true; requestAnimationFrame(frame); } });
    requestAnimationFrame(frame);
  }
  Scene3D.tex=function(){return TEX;};
  window.Scene3D=Scene3D;
  function boot(){
    if(!document.getElementById('bg3d')){ var cv=document.createElement('canvas'); cv.id='bg3d'; cv.setAttribute('aria-hidden','true'); document.body.insertBefore(cv,document.body.firstChild); Scene3D(cv,{}); }
    if(R||!matchMedia('(hover:hover)').matches) return;
    var SEL='.card,.panel,.pcard,.tool-card,.stat,.cat-card,.service-card,.skill-category,.content-card';
    document.addEventListener('pointermove',function(e){ var el=e.target.closest&&e.target.closest(SEL); if(!el||el.closest('dialog')||el.querySelector('textarea,input')) return; var r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5; el.style.setProperty('--ry',(x*8)+'deg'); el.style.setProperty('--rx',(-y*8)+'deg'); },{passive:true});
    document.addEventListener('pointerout',function(e){ var el=e.target.closest&&e.target.closest(SEL); if(el&&!el.contains(e.relatedTarget)){ el.style.setProperty('--rx','0deg'); el.style.setProperty('--ry','0deg'); } });
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot):boot();
})();
