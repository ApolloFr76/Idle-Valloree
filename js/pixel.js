/* Moteur pixel art : sprites des monstres, du héros, des objets et décors, tous générés par le code. */
/* ================= Moteur pixel art (sprites et décors générés par le code) ================= */
const PX=(()=>{
  const cache={};
  const rgb=c=>{if(Array.isArray(c))return c;if(c[0]==="#"){if(c.length===4)c="#"+c[1]+c[1]+c[2]+c[2]+c[3]+c[3];const n=parseInt(c.slice(1),16);return[n>>16,n>>8&255,n&255]}return c.match(/\d+/g).slice(0,3).map(Number)};
  const mix=(a,b,p)=>{a=rgb(a);b=rgb(b);return[0,1,2].map(i=>Math.round(a[i]+(b[i]-a[i])*p))};
  const LIGHT="#fff2c2",DARK="#2b1842",INK="#1c1020";
  function rng(seed){let s=seed>>>0||1;return()=>{s^=s<<13;s>>>=0;s^=s>>17;s^=s<<5;s>>>=0;return s/4294967296}}
  class Spr{
    constructor(w,h,ox=0,oy=0){this.w=w;this.h=h;this.ox=ox;this.oy=oy;this.p=new Array(w*h).fill(null);this.sh=[]}
    set(x,y,c){x=(x|0)+this.ox;y=(y|0)+this.oy;if(x>=0&&y>=0&&x<this.w&&y<this.h)this.p[y*this.w+x]=rgb(c)}
    get(x,y){return x>=0&&y>=0&&x<this.w&&y<this.h?this.p[y*this.w+x]:null}
    /* part(couleur, m=>{…formes…}, {flat}) : dessine un masque puis l'ombre en 3 tons */
    part(col,fn,o={}){
      const w=this.w,h=this.h,M=new Uint8Array(w*h);
      const ox=this.ox,oy=this.oy,put=(x,y,v=1)=>{x=Math.round(x)+ox;y=Math.round(y)+oy;if(x>=0&&y>=0&&x<w&&y<h)M[y*w+x]=v};
      const m={px:put,
        rect:(x,y,rw,rh)=>{for(let j=0;j<rh;j++)for(let i=0;i<rw;i++)put(x+i,y+j)},
        ell:(cx,cy,rx,ry)=>{for(let y=Math.floor(cy-ry);y<=cy+ry;y++)for(let x=Math.floor(cx-rx);x<=cx+rx;x++){const dx=(x-cx)/(rx+.35),dy=(y-cy)/(ry+.35);if(dx*dx+dy*dy<=1)put(x,y)}},
        poly:pts=>{let y0=1e9,y1=-1e9;pts.forEach(q=>{y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1])});
          for(let y=Math.floor(y0);y<=y1;y++){const xs=[];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];if((a[1]<=y&&b[1]>y)||(b[1]<=y&&a[1]>y))xs.push(a[0]+(y-a[1])/(b[1]-a[1])*(b[0]-a[0]))}
            xs.sort((a,b)=>a-b);for(let i=0;i+1<xs.length;i+=2)for(let x=Math.round(xs[i]);x<=Math.round(xs[i+1]);x++)put(x,y)}
          pts.forEach(q=>put(q[0],q[1]))},
        line:(x0,y0,x1,y1,t=1)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))||1;for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n,y=y0+(y1-y0)*i/n;for(let a=0;a<t;a++)for(let b=0;b<t;b++)put(x+a,y+b)}},
        clear:(x,y,rw,rh)=>{for(let j=0;j<rh;j++)for(let i=0;i<rw;i++)put(x+i,y+j,0)}};
      fn(m);
      let x0=w,x1=-1,y0=h,y1=-1;for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(M[y*w+x]){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}
      if(x1<0)return this;
      const base=rgb(col),lt=mix(base,LIGHT,o.lt??.38),dk=mix(base,DARK,o.dk??.36),bw=x1-x0+1,bh=y1-y0+1,cx=(x0+x1)/2,cy=(y0+y1)/2;
      const g=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&M[y*w+x];
      for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){if(!M[y*w+x])continue;let c=base;
        if(!o.flat){const l=-(x-cx)/(bw/2+.5)*.55-(y-cy)/(bh/2+.5)*.8;
          if(bw>4&&bh>4){if(l>.5)c=lt;else if(l<-.5)c=dk;else if(l>.38&&(x+y)%2===0)c=lt;else if(l<-.38&&(x+y)%2===0)c=dk}
          if(!g(x,y+1)||!g(x+1,y))c=dk;else if((!g(x,y-1)||!g(x-1,y))&&bw>2&&bh>2)c=lt}
        this.p[y*w+x]=c}
      return this}
    shadow(cx,cy,rx,ry){this.sh.push([cx,cy,rx,ry]);return this}
    outline(col=INK){const w=this.w,h=this.h,add=[];for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(!this.p[y*w+x]&&(this.get(x+1,y)||this.get(x-1,y)||this.get(x,y+1)||this.get(x,y-1)))add.push(y*w+x);const c=rgb(col);add.forEach(i=>this.p[i]=c);return this}
    blit(s,ox,oy){for(let y=0;y<s.h;y++)for(let x=0;x<s.w;x++){const c=s.p[y*s.w+x];if(c)this.set(ox+x,oy+y,c)}return this}
    url(){const c=document.createElement("canvas");c.width=this.w;c.height=this.h;const x=c.getContext("2d"),I=x.createImageData(this.w,this.h),D=I.data;
      this.sh.forEach(([cx,cy,rx,ry])=>{for(let y=Math.floor(cy-ry);y<=cy+ry;y++)for(let xx=Math.floor(cx-rx);xx<=cx+rx;xx++){const dx=(xx-cx)/(rx+.35),dy=(y-cy)/(ry+.35);if(dx*dx+dy*dy<=1&&xx>=0&&y>=0&&xx<this.w&&y<this.h){const i=(y*this.w+xx)*4;D[i]=30;D[i+1]=14;D[i+2]=40;D[i+3]=95}}});
      this.p.forEach((q,i)=>{if(q){D[i*4]=q[0];D[i*4+1]=q[1];D[i*4+2]=q[2];D[i*4+3]=255}});x.putImageData(I,0,0);return c.toDataURL()}
  }

  /* ---------- Monstres (40×40) ---------- */
  function monster(m){
    const k="m:"+m.id+m.c+(m.crown?1:0);if(cache[k])return cache[k];
    const s=new Spr(40,40),c=m.c,ink=mix(c,INK,.78);let eyeY=24,top=16,ex=4,fx=20,face=1,mouth=1,blush=1,fang=0,tongue=0;
    s.shadow(20,37,12,2);
    const back=()=>{
      if(m.ft==="ears"){s.part(c,q=>{q.poly([[9,top+6],[11,top-5],[18,top+2]]);q.poly([[31,top+6],[29,top-5],[22,top+2]])});s.part("#f4a6a0",q=>{q.poly([[11,top+3],[12,top-2],[15,top+2]]);q.poly([[29,top+3],[28,top-2],[25,top+2]])},{flat:1})}
      if(m.ft==="horns")s.part("#f1e4bf",q=>{q.poly([[11,top+4],[7,top-3],[9,top-7],[16,top+1]]);q.poly([[29,top+4],[33,top-3],[31,top-7],[24,top+1]])});
      if(m.ft==="antenna"){s.part(mix(c,INK,.45),q=>{q.line(17,top+2,13,top-5);q.line(23,top+2,27,top-5)},{flat:1});s.part("#fff39a",q=>{q.rect(11,top-8,3,3);q.rect(26,top-8,3,3)})}
      if(m.ft==="flame"){s.part("#ff7a2c",q=>q.poly([[15,top+4],[16,top-3],[19,top],[21,top-8],[24,top-1],[25,top+4]]));s.part("#ffd84a",q=>q.poly([[18,top+4],[20,top-2],[22,top+4]]),{flat:1})}
      if(m.ft==="crystal")s.part(mix(c,"#ffffff",.45),q=>{q.poly([[13,top+3],[16,top-8],[19,top+3]]);q.poly([[20,top+2],[24,top-11],[27,top+2]])});
    };
    if(m.shape==="blob"){eyeY=25;top=16;back();s.part(c,q=>{q.ell(20,27,13,9);q.rect(8,30,25,6);q.clear(8,36,2,1);q.clear(31,36,2,1)})}
    else if(m.shape==="tall"){eyeY=19;top=7;back();s.part(c,q=>{q.ell(20,15,9,8);q.rect(11,15,19,21);q.clear(11,36,1,1);q.clear(29,36,1,1)});s.part(mix(c,DARK,.3),q=>{q.rect(13,36,5,1);q.rect(23,36,5,1)},{flat:1})}
    else if(m.shape==="spiky"){eyeY=25;top=13;back();s.part(c,q=>{for(let i=0;i<10;i++){const a=Math.PI*2*i/10-Math.PI/2;q.poly([[20+Math.cos(a-.3)*8,26+Math.sin(a-.3)*8],[20+Math.cos(a)*16,26+Math.sin(a)*13.5],[20+Math.cos(a+.3)*8,26+Math.sin(a+.3)*8]])}q.ell(20,26,10,9)})}
    else if(m.shape==="bird"){eyeY=22;top=14;back();
      s.part(mix(c,DARK,.3),q=>{q.poly([[10,22],[3,18],[4,30],[10,30]]);q.poly([[30,22],[37,18],[36,30],[30,30]])});
      s.part("#f0a33c",q=>{q.rect(15,35,3,2);q.rect(22,35,3,2)},{flat:1});
      s.part(c,q=>{q.ell(20,25,11,10);q.line(19,top,17,top-4);q.line(20,top,21,top-5);q.line(21,top,24,top-3)});
      s.part(mix(c,"#ffffff",.55),q=>q.ell(20,30,6,4),{flat:1});
      s.part("#f6a83a",q=>q.poly([[17,26],[23,26],[20,30]]))}
    else if(m.shape==="cap"){eyeY=29;top=9;
      s.part("#f6ecd6",q=>{q.ell(20,30,6,6);q.rect(14,30,13,6)});
      s.part(c,q=>{q.ell(20,22,16,13);q.clear(0,24,40,16);q.rect(5,22,31,2);q.clear(4,23,2,1);q.clear(35,23,2,1)});
      s.part("#fff7e6",q=>{q.rect(11,15,3,3);q.rect(20,11,4,3);q.rect(28,17,3,2);q.rect(15,20,2,2);q.rect(25,21,2,1)},{flat:1})}
    else if(m.shape==="bat"){eyeY=22;top=15;fang=1;
      s.part(mix(c,DARK,.32),q=>{q.poly([[13,19],[3,11],[1,23],[5,21],[8,27],[13,26]]);q.poly([[27,19],[37,11],[39,23],[35,21],[32,27],[27,26]])});
      s.part(c,q=>{q.poly([[13,18],[13,9],[18,15]]);q.poly([[27,18],[27,9],[22,15]])});back();
      s.part(c,q=>q.ell(20,23,8,8));s.part(mix(c,DARK,.4),q=>{q.rect(16,31,2,2);q.rect(22,31,2,2)},{flat:1})}
    else if(m.shape==="golem"){eyeY=14;top=9;back();
      s.part(mix(c,DARK,.28),q=>{q.rect(12,30,6,7);q.rect(22,30,6,7)});
      s.part(c,q=>{q.ell(6.5,25,3.5,7);q.ell(33.5,25,3.5,7)});
      s.part(c,q=>{q.rect(10,16,20,16);q.clear(10,31,1,1);q.clear(29,31,1,1)});
      s.part(mix(c,LIGHT,.18),q=>{q.rect(13,9,14,10);q.clear(13,9,1,1);q.clear(26,9,1,1)});
      const cr=mix(c,INK,.5);[[14,24],[15,25],[16,25],[17,26],[24,22],[25,23],[25,24],[22,28],[23,29]].forEach(([x,y])=>s.set(x,y,cr))}
    else if(m.shape==="ghost"){eyeY=20;top=10;mouth=2;back();
      s.part(c,q=>{q.ell(20,19,11,10);q.rect(9,19,23,14);q.clear(12,31,3,2);q.clear(19,31,3,2);q.clear(26,31,3,2);q.clear(9,32,1,1);q.clear(31,32,1,1);q.ell(6,24,2,2);q.ell(34,24,2,2)},{lt:.5})}
    else if(m.shape==="snake"){eyeY=12;top=6;ex=3;tongue=1;
      s.part(c,q=>{q.ell(20,31,13,5.5);q.poly([[30,30],[37,25],[36,31]])});
      s.part(mix(c,DARK,.14),q=>q.ell(20,27,9,4.5));
      s.part(c,q=>q.rect(16,14,8,14));back();
      s.part(c,q=>q.ell(20,12,7,6));
      s.part(mix(c,LIGHT,.5),q=>{q.rect(18,20,4,1);q.rect(18,23,4,1);q.rect(18,26,4,1)},{flat:1})}
    else if(m.shape==="crab"){eyeY=19;top=17;mouth=0;blush=0;
      s.part(mix(c,DARK,.3),q=>{q.line(8,30,3,34);q.line(9,32,5,36);q.line(32,30,37,34);q.line(31,32,35,36)},{flat:1});
      s.part(c,q=>{q.line(10,27,7,23,2);q.line(29,27,32,23,2)});
      s.part(c,q=>{q.ell(6,19,4,4);q.clear(5,15,2,4);q.ell(34,19,4,4);q.clear(34,15,2,4)});
      s.part(c,q=>{q.rect(15,21,2,4);q.rect(24,21,2,4)},{flat:1});
      s.part(c,q=>q.ell(20,29,12,7));
      {const mo=mix(c,INK,.75);[18,19,20,21].forEach(x=>s.set(x,31,mo));s.set(17,30,mo);s.set(22,30,mo);const bl=mix(c,"#ff9aa8",.6);s.set(12,29,bl);s.set(13,29,bl);s.set(27,29,bl);s.set(28,29,bl)}}
    else if(m.shape==="quad"){eyeY=19;top=12;fx=12;ex=2;
      s.part(mix(c,DARK,.3),q=>{q.rect(18,30,3,7);q.rect(27,30,3,7)});
      s.part(c,q=>q.line(32,23,36,16,2));
      s.part(c,q=>{q.ell(23,25,11,6.5);q.rect(14,29,3,8);q.rect(30,29,3,8)});
      s.part(c,q=>{q.poly([[6,15],[7,8],[11,13]]);q.poly([[18,15],[17,8],[13,13]])});
      s.part(c,q=>q.ell(12,19,7,6.5));
      s.part(mix(c,LIGHT,.5),q=>q.ell(12,23,3.4,2),{flat:1})}
    else if(m.shape==="jelly"){eyeY=17;top=7;mouth=2;back();
      s.part(mix(c,DARK,.2),q=>{[11,15,19,23,27].forEach((x,i)=>{q.rect(x,22,2,7+(i%2)*4);q.px(x+(i%2?2:-1),28+(i%2)*4)})});
      s.part(c,q=>{q.ell(20,17,12,10);q.clear(0,23,40,10);q.rect(8,20,25,3)},{lt:.5});
      s.part(mix(c,LIGHT,.6),q=>{q.rect(12,11,3,2);q.rect(25,13,2,2)},{flat:1})}
    else if(m.shape==="eye"){eyeY=21;top=9;face=0;back();
      s.part(mix(c,DARK,.25),q=>{[12,17,22,27].forEach((x,i)=>q.rect(x,31,2,4+(i%2)*2))});
      s.part(c,q=>q.ell(20,21,12,12));
      s.part("#ffffff",q=>q.ell(20,21,8,7),{dk:.12});
      s.part(mix(c,"#3fd0e0",.75),q=>q.ell(21,22,4,4));
      s.part("#1c1020",q=>q.rect(20,21,3,3),{flat:1});s.set(19,19,"#ffffff");s.set(20,19,"#ffffff");s.set(19,20,"#ffffff")}
    else if(m.shape==="plant"){eyeY=11;top=4;mouth=0;blush=0;
      s.part("#3f8a3a",q=>q.rect(19,24,3,13));
      s.part("#5fb04a",q=>{q.ell(13,32,5,2.6);q.ell(27,32,5,2.6)});
      s.part(mix(c,DARK,.25),q=>{[[9,9],[31,9],[8,19],[32,19],[20,3]].forEach(([x,y])=>q.ell(x,y,3,3))});
      s.part(c,q=>q.ell(20,15,11,10));
      s.part("#3a1020",q=>{q.rect(13,17,15,5);q.clear(13,17,1,1);q.clear(27,17,1,1);q.clear(13,21,1,1);q.clear(27,21,1,1)},{flat:1});
      [14,17,20,23,26].forEach(x=>{s.set(x,17,"#ffffff");s.set(x,18,"#ffffff")});[15,18,21,24].forEach(x=>s.set(x+1,21,"#ffffff"))}
    else if(m.shape==="slime"){eyeY=27;top=12;back();
      s.part(c,q=>{q.poly([[12,24],[20,7],[28,24]]);q.ell(20,28,12,8);q.rect(9,30,23,6);q.clear(9,36,1,1);q.clear(31,36,1,1)},{lt:.5});
      s.part("#ffffff",q=>{q.rect(15,17,2,3);q.px(17,15)},{flat:1})}
    if(m.ft==="leaf"){s.part("#3f7d33",q=>q.line(20,top+1,20,top-3),{flat:1});s.part("#74c95c",q=>{q.ell(16,top-5,4,2);q.ell(24,top-6,4,2)})}
    /* visage */
    const W="#ffffff",B="#1c1020";
    if(face){[fx-ex-2,fx+ex].forEach(x=>{s.part(W,q=>q.rect(x,eyeY-2,3,4),{flat:1});s.set(x+1,eyeY,B);s.set(x+2,eyeY,B);s.set(x+1,eyeY+1,B);s.set(x+2,eyeY+1,B);s.set(x+2,eyeY-1,B)});
      if(blush){const bl=mix(c,"#ff6f7d",.6),bo=ex>=4?5:3;s.set(fx-ex-bo,eyeY+4,bl);s.set(fx-ex-bo+1,eyeY+4,bl);s.set(fx+ex+bo-1,eyeY+4,bl);s.set(fx+ex+bo,eyeY+4,bl)}
      const mo=mix(c,INK,.75);
      if(mouth===1&&m.shape!=="bird"){s.set(fx-2,eyeY+4,mo);s.set(fx-1,eyeY+5,mo);s.set(fx,eyeY+5,mo);s.set(fx+1,eyeY+4,mo)}
      if(mouth===2){s.set(fx-1,eyeY+4,mo);s.set(fx,eyeY+4,mo);s.set(fx-1,eyeY+5,mo);s.set(fx,eyeY+5,mo)}
      if(fang){s.set(fx-2,eyeY+5,W);s.set(fx+1,eyeY+5,W)}
      if(tongue){s.set(fx-1,eyeY+6,"#e8483c");s.set(fx-1,eyeY+7,"#e8483c");s.set(fx-2,eyeY+8,"#e8483c");s.set(fx,eyeY+8,"#e8483c")}}
    if(m.crown){s.part("#f7c948",q=>{q.rect(14,top-3,13,3);q.rect(14,top-6,2,3);q.rect(19,top-7,3,4);q.rect(25,top-6,2,3)});s.set(20,top-2,"#e8483c");s.set(16,top-2,"#5ad0e0");s.set(24,top-2,"#5ad0e0")}
    s.outline(ink);SPR[k]=s;return cache[k]=s.url()}

  /* ---------- Héros (24×32) ---------- */
  function hero(cls,col,pose=""){
    const k="h:"+cls+col+pose;const A=pose==="atk",U=pose==="up";if(cache[k])return cache[k];
    const s=new Spr(24,32),dk=mix(col,DARK,.45),lt=mix(col,"#ffffff",.4),skin="#f6cfa6",ink=mix(col,INK,.82);
    s.shadow(11,30,8,1.6);
    if(cls==="mage"){if(U){s.part("#8a5a34",q=>q.rect(17,3,1,22),{flat:1});s.part(lt,q=>q.ell(17.5,2,2.2,2.2))}else if(A){s.part("#8a5a34",q=>q.line(17,22,22,5),{flat:1});s.part(lt,q=>q.ell(22,4,2,2))}else{s.part("#8a5a34",q=>q.rect(20,6,1,24),{flat:1});s.part(lt,q=>q.ell(20.5,4,2,2))}}
    s.part(dk,q=>{q.rect(5,14,12,13);q.clear(5,26,1,1);q.clear(16,26,1,1)});                           /* cape */
    s.part("#4a342c",q=>{q.rect(7,23,3,5);q.rect(12,23,3,5)},{flat:1});                                 /* jambes */
    s.part("#7a4e2e",q=>{q.rect(6,27,4,3);q.rect(12,27,4,3)});                                          /* bottes */
    s.part(col,q=>{q.rect(6,15,10,9);q.clear(6,15,1,1);q.clear(15,15,1,1)});                            /* tunique */
    s.part("#6b432a",q=>q.rect(6,21,10,1),{flat:1});s.set(10,21,"#f7c948");s.set(11,21,"#f7c948");
    if(U){s.part(col,q=>{q.rect(4,11,2,5);q.rect(16,11,2,5)});s.set(4,10,skin);s.set(5,10,skin);s.set(16,10,skin);s.set(17,10,skin)}   /* bras levés */
    else if(A){s.part(col,q=>{q.rect(4,16,2,5);q.rect(16,15,4,2)});s.set(4,21,skin);s.set(5,21,skin);s.set(20,15,skin);s.set(20,16,skin)}   /* bras tendu */
    else{s.part(col,q=>{q.rect(4,16,2,5);q.rect(16,16,2,5)});s.set(4,21,skin);s.set(5,21,skin);s.set(16,21,skin);s.set(17,21,skin)}
    s.part(skin,q=>q.ell(11,9,6,5.4));
    s.part(col,q=>{q.ell(11,7,7,5.6);q.clear(0,9,24,8);q.rect(4,9,2,3);q.rect(17,9,2,3);q.rect(6,9,2,1);q.rect(14,9,3,1)});  /* coiffe */
    if(cls==="mage")s.part(col,q=>q.poly([[6,3],[11,-3],[16,3]]));
    if(cls==="archer"){s.part("#e24a3a",q=>q.line(15,1,17,-1),{flat:1});s.part(lt,q=>q.rect(4,7,15,1),{flat:1})}
    if(cls==="guerrier")s.part("#c9ced6",q=>{q.rect(4,6,15,2);q.rect(10,4,3,2)});
    if(cls==="gardien")s.part("#c9ced6",q=>{q.rect(4,5,15,3);q.rect(11,8,1,2)});
    const B="#1c1020";s.set(8,10,B);s.set(8,11,B);s.set(13,10,B);s.set(13,11,B);s.set(9,10,"#fff");s.set(14,10,"#fff");
    if(pose==="blink"){[8,9,13,14].forEach(x=>{s.set(x,10,skin);s.set(x,11,B)})}   /* yeux fermés */
    s.set(6,12,"#f29a8e");s.set(7,12,"#f29a8e");s.set(15,12,"#f29a8e");s.set(16,12,"#f29a8e");s.set(10,13,"#b06a55");s.set(11,13,"#b06a55");
    if(cls==="guerrier"&&U){s.part("#dfe5ec",q=>q.rect(16,0,2,10));s.part("#f7c948",q=>q.rect(14,10,6,1),{flat:1})}   /* épée levée */
    else if(cls==="guerrier"&&A){s.part("#dfe5ec",q=>{q.rect(14,13,9,2)});s.part("#f7c948",q=>q.rect(20,12,1,4),{flat:1})}   /* épée pointée */
    else if(cls==="guerrier"){s.part("#dfe5ec",q=>{q.rect(20,7,2,12);q.px(20,6);});s.part("#f7c948",q=>q.rect(18,19,6,1),{flat:1});s.part("#6b432a",q=>q.rect(20,20,2,3),{flat:1})}
    if(cls==="archer"&&A){s.part("#9a6a3c",q=>{q.line(20,8,22,11);q.line(22,11,22,19);q.line(22,19,20,22)},{flat:1});s.part("#f1e4bf",q=>{q.line(20,8,17,15);q.line(17,15,20,22)},{flat:1})}   /* corde tirée */
    else if(cls==="archer"){s.part("#9a6a3c",q=>{q.line(19,9,21,12);q.line(21,12,21,20);q.line(21,20,19,23)},{flat:1});s.part("#f1e4bf",q=>q.line(19,9,19,23),{flat:1})}
    if(cls==="gardien"&&U){s.part(lt,q=>{q.rect(15,3,7,7);q.poly([[15,10],[18.5,13],[21,10]])});s.part("#f7c948",q=>q.rect(18,5,2,3),{flat:1})}   /* bouclier levé */
    else if(cls==="gardien"&&A){s.part(lt,q=>{q.rect(17,12,7,8);q.poly([[17,20],[20.5,24],[23,20]])});s.part("#f7c948",q=>q.rect(20,15,2,3),{flat:1})}   /* bouclier en avant */
    else if(cls==="gardien"){s.part(lt,q=>{q.rect(16,14,7,7);q.poly([[16,21],[19.5,25],[22,21]])});s.part("#f7c948",q=>q.rect(19,17,2,3),{flat:1})}
    s.outline(ink);return cache[k]=s.url()}

  /* ---------- Objets à ramasser (16×16) ---------- */
  function pickup(id){
    const k="p:"+id;if(cache[k])return cache[k];const s=new Spr(16,16);
    if(id==="coffre"){s.part("#9a5f2e",q=>q.rect(2,7,12,7));s.part("#c07e40",q=>{q.rect(2,4,12,3);q.rect(3,3,10,1)});s.part("#f7c948",q=>{q.rect(2,7,12,1);q.rect(7,7,2,3)},{flat:1});s.set(7,9,"#6b432a");s.set(8,9,"#6b432a")}
    if(id==="etoile"){s.part("#ffe27a",q=>{q.poly([[8,1],[10,6],[15,6],[11,9],[13,14],[8,11],[3,14],[5,9],[1,6],[6,6]])});s.set(6,7,"#6b4a10");s.set(9,7,"#6b4a10");s.set(7,9,"#6b4a10");s.set(8,9,"#6b4a10")}
    if(id==="trefle"){s.part("#3f7d33",q=>q.line(8,9,11,14),{flat:1});s.part("#74d05e",q=>{q.ell(4.5,4.5,2.2,2.2);q.ell(10.5,4.5,2.2,2.2);q.ell(4.5,10.5,2.2,2.2);q.ell(10.5,10.5,2.2,2.2);q.rect(6,6,3,3)});s.set(7,7,"#d6ffc2");s.set(4,4,"#d6ffc2");s.set(10,4,"#d6ffc2");s.set(4,10,"#d6ffc2");s.set(10,10,"#d6ffc2")}
    if(id==="orbe"){s.part("#ff7a3c",q=>q.ell(8,9,5,5),{dk:.5});s.part("#ffd27a",q=>{q.rect(6,6,2,2);q.px(8,2);q.rect(7,3,2,1);q.px(9,1)},{flat:1})}
    if(id==="baluchon"){s.part("#e0c68e",q=>{q.ell(8,10,6,4.5);q.rect(4,5,8,4)});s.part("#c9483a",q=>{q.rect(5,4,6,1);q.px(4,3);q.px(11,3);q.px(3,2);q.px(12,2)},{flat:1});s.part("#b89a5a",q=>q.rect(6,1,4,3))}
    if(id==="parchemin"){s.part("#f6e7c2",q=>q.rect(3,3,10,10));s.part("#d8bf88",q=>{q.rect(2,1,12,2);q.rect(2,13,12,2)});s.part("#8a6fd0",q=>{q.rect(5,5,6,1);q.rect(5,7,6,1);q.rect(5,9,4,1)},{flat:1})}
    if(id==="oeuf"){s.part("#ffd45a",q=>{q.ell(8,9,5,6);q.ell(8,6,3.6,4)});s.part("#ff8ab0",q=>q.rect(5,7,2,2),{flat:1});s.part("#5ab4e8",q=>q.rect(9,10,2,2),{flat:1});s.part("#7fd35e",q=>q.rect(9,5,1,2),{flat:1});s.part("#ef7d4a",q=>q.rect(6,12,2,1),{flat:1})}
    s.outline();return cache[k]=s.url()}

  /* ---------- Équipement (16×16), teinté à la couleur du monstre ---------- */
  function item(slot,col){
    const k="i:"+slot+col;if(cache[k])return cache[k];const s=new Spr(16,16),G="#f7c948",M="#dfe5ec",dk=mix(col,DARK,.4);
    if(slot==="coiffe"){s.part(col,q=>{q.ell(8,8,5,5);q.clear(0,10,16,6)});s.part(dk,q=>q.rect(2,10,12,2));s.part(G,q=>q.rect(7,5,2,3),{flat:1});s.set(8,2,"#e8483c");s.set(8,1,"#e8483c")}
    if(slot==="cape"){s.part(col,q=>q.poly([[5,2],[10,2],[13,14],[2,14]]));s.part(dk,q=>{q.line(6,5,5,13);q.line(9,5,10,13)},{flat:1});s.part(G,q=>q.rect(5,2,6,1),{flat:1})}
    if(slot==="amulette"){s.part("#c9962a",q=>{q.px(3,1);q.px(4,3);q.px(5,5);q.px(6,7);q.px(12,1);q.px(11,3);q.px(10,5);q.px(9,7);q.px(3,2);q.px(12,2);q.px(4,4);q.px(11,4);q.px(5,6);q.px(10,6)},{flat:1});s.part(G,q=>q.ell(7.5,11,3.4,3.4));s.part(col,q=>q.rect(6,10,3,3))}
    if(slot==="anneau"){s.part(G,q=>{q.ell(7.5,10,4.4,4.4);q.clear(6,8,4,4)});s.part(col,q=>{q.rect(6,2,4,4);q.clear(6,2,1,1);q.clear(9,2,1,1)},{lt:.6})}
    if(slot==="bottes"){s.part(col,q=>{q.rect(4,3,5,9);q.rect(4,10,9,3);q.clear(12,10,1,1)});s.part(mix(col,LIGHT,.5),q=>q.rect(4,2,5,2),{flat:1});s.part("#4a342c",q=>q.rect(4,13,10,1),{flat:1})}
    if(slot==="arme"){s.part(M,q=>q.line(12,2,6,8,2));s.part(col,q=>q.line(3,6,8,11,2));s.part("#7a4e2e",q=>q.line(4,10,2,12,2),{flat:1});s.set(2,14,G);s.set(1,14,G);s.set(2,13,G)}
    if(slot==="ceinture"){s.part(col,q=>q.rect(1,6,14,4));s.part(G,q=>{q.rect(6,5,4,6);q.clear(7,7,2,2)});s.set(2,8,dk);s.set(12,8,dk)}
    if(slot==="bouclier"){s.part(col,q=>q.poly([[3,2],[12,2],[12,8],[7.5,14],[3,8]]));s.part(G,q=>{q.rect(7,4,2,7);q.rect(5,6,6,2)},{flat:1})}
    s.outline();return cache[k]=s.url()}

  /* ---------- Ressources de métier (16×16), une teinte par palier ---------- */
  const RC={pecheur:["#c8b08a","#8fb06a","#6fa35a","#b0643a","#e2b66a","#8fc7e0","#f2d94a","#5fae4a","#e8684a","#f0622c","#a8e8e0","#5a4fa8"],bucheron:["#c9a36a","#a8743e","#8a5a34","#b8864a","#d0703a","#7a8a4a","#e8dcc0","#b8503a","#9a7a5a","#c8b08a","#4a3a3a","#a84a2e"],
    mineur:["#b8bcc6","#e08a4a","#d0d6dc","#eef2f6","#ffd24a","#3f6fd0","#9ab0b8","#b06a8a","#d87a5a","#e8f0ff","#7ae0d0","#5a3f8a"],
    paysan:["#f0d060","#e0c070","#f0e0a0","#b8d060","#c8a060","#a0b8e0","#ffd24a","#e8c890","#fff4e0","#b08a6a","#d8b070","#f0a0a0"],
    herboriste:["#5fae4a","#8ab89a","#4fd08a","#a8e06a","#f4f8ff","#b06ad0","#b08af0","#7fc04e","#7a4fb0","#e0c080","#ff8ad0","#ff9ac8"]};
  function res(prof,t){
    const k="r:"+prof+t;if(cache[k])return cache[k];const s=new Spr(16,16),c=(RC[prof]||RC.bucheron)[t%12];
    if(prof==="bucheron"){s.part(c,q=>{q.rect(2,6,11,6);q.clear(2,6,1,1);q.clear(2,11,1,1)});s.part(mix(c,LIGHT,.55),q=>q.ell(12.5,8.5,1.6,2.6),{flat:1});s.set(12,8,mix(c,DARK,.3));s.set(13,9,mix(c,DARK,.3));
      const d=mix(c,DARK,.4);[[4,8],[5,8],[8,9],[9,9],[6,10]].forEach(([x,y])=>s.set(x,y,d));s.part("#5fae4a",q=>{q.px(5,4);q.px(6,5);q.px(4,5)},{flat:1})}
    if(prof==="mineur"){s.part("#8a8494",q=>q.poly([[2,13],[3,7],[7,3],[12,5],[14,10],[12,13]]));s.part(c,q=>{q.rect(4,6,4,4);q.rect(9,7,4,4);q.rect(6,10,3,2)},{lt:.6});s.set(4,6,"#ffffff");s.set(9,7,"#ffffff")}
    if(prof==="paysan"){s.part("#b8904a",q=>{q.line(8,15,8,7);q.line(8,13,5,9);q.line(8,13,11,9)},{flat:1});s.part(c,q=>{[[8,2],[7,4],[9,4],[7,6],[9,6],[4,6],[5,8],[12,6],[11,8]].forEach(([x,y])=>q.rect(x,y,2,2))});s.part("#c8483a",q=>q.rect(7,12,3,1),{flat:1})}
    if(prof==="pecheur")return cache[k]=fish(c,0,t);
    if(prof==="herboriste"){s.part("#3f8a3a",q=>q.line(8,15,8,6),{flat:1});s.part("#5fb04a",q=>{q.ell(5,11,2.6,1.6);q.ell(11,9,2.6,1.6)});s.part(c,q=>{q.ell(8,4.5,3.4,3.4)},{lt:.5});s.set(8,4,"#fff2a8");s.set(8,5,"#fff2a8")}
    s.outline();return cache[k]=s.url()}

  /* ---------- Butins, clés, potions, familiers (16×16) ---------- */
  function drop(kind,col,rare){
    const k="d:"+kind+col+(rare?1:0);if(cache[k])return cache[k];const s=new Spr(16,16),lt=mix(col,"#ffffff",.6),dk=mix(col,DARK,.45);
    if(kind==="feather"){s.part(col,q=>q.poly([[12,1],[14,4],[8,12],[4,12],[4,8]]));s.part("#f6ecd6",q=>q.line(3,14,12,3),{flat:1})}
    else if(kind==="fluff")s.part(col,q=>{q.ell(5.5,9,3.2,3.2);q.ell(10.5,9,3.2,3.2);q.ell(8,5.5,3.4,3.2);q.ell(8,11,3.4,2.8)},{lt:.5});
    else if(kind==="fang"){s.part(lt,q=>q.poly([[4,3],[10,3],[11,7],[9,11],[6,14],[7,9],[5,6]]));s.part(col,q=>q.rect(4,2,7,2))}
    else if(kind==="leaf"){s.part(col,q=>q.poly([[8,1],[12,5],[12,10],[8,14],[4,10],[4,5]]));s.part(dk,q=>{q.line(8,4,8,13);q.px(6,7);q.px(10,7);q.px(6,10);q.px(10,10)},{flat:1})}
    else if(kind==="dust"){s.part(col,q=>q.poly([[2,13],[5,9],[8,7],[11,9],[14,13]]));s.set(5,5,lt);s.set(10,4,lt);s.set(8,2,lt);s.set(12,7,lt);s.set(3,8,lt)}
    else if(kind==="drop"){s.part(col,q=>{q.poly([[8,2],[11,8],[5,8]]);q.ell(8,10,4,3.6)},{lt:.5});s.set(6,9,"#ffffff");s.set(6,10,"#ffffff")}
    else if(kind==="egg"){s.part(col,q=>{q.ell(8,9.5,4.4,5);q.ell(8,6,3,3.4)},{lt:.5});s.set(6,8,dk);s.set(10,10,dk);s.set(8,12,dk)}
    else{s.part(col,q=>q.poly([[3,6],[6,2],[10,2],[13,6],[8,14]]),{lt:.6});s.part(lt,q=>{q.rect(6,3,4,1);q.line(4,6,12,6)},{flat:1})}
    if(rare){["#ffffff","#fff2a8"].forEach((c,i)=>{const x=i?13:2,y=i?12:2;s.set(x,y,c);s.set(x-1,y,c);s.set(x+1,y,c);s.set(x,y-1,c);s.set(x,y+1,c)})}
    s.outline(rare?"#8a4a08":INK);return cache[k]=s.url()}
  function key(){if(cache.key)return cache.key;const s=new Spr(16,16),G="#f7c948";s.part(G,q=>{q.ell(5,5,3.4,3.4);q.clear(4,4,2,2);q.line(7,7,12,12,2);q.rect(11,10,3,1);q.rect(9,12,1,2)});s.outline();return cache.key=s.url()}
  function potion(col){const k="po:"+col;if(cache[k])return cache[k];const s=new Spr(16,16);s.part("#dfeef5",q=>{q.rect(7,3,3,4);q.ell(8.5,10,4.6,4.4)},{lt:.6});s.part(col,q=>{q.ell(8.5,10.5,3.6,3.4);q.clear(0,0,16,9)});s.part(col,q=>q.rect(5,9,7,1),{flat:1});s.part("#8a5a34",q=>q.rect(6,1,5,2));s.set(6,8,"#ffffff");s.set(6,9,"#ffffff");s.outline();return cache[k]=s.url()}
  function pet(col){const k="pe:"+col;if(cache[k])return cache[k];const s=new Spr(16,16);s.part(col,q=>{q.poly([[3,7],[4,2],[7,5]]);q.poly([[13,7],[12,2],[9,5]])});s.part(col,q=>{q.ell(8,9,5.4,4.6);q.rect(4,11,9,3)},{lt:.5});s.set(6,8,"#1c1020");s.set(10,8,"#1c1020");s.set(6,9,"#1c1020");s.set(10,9,"#1c1020");s.set(8,11,"#1c1020");s.set(4,11,"#ff8a9a");s.set(12,11,"#ff8a9a");s.outline();SPR[k]=s;return cache[k]=s.url()}

  /* ---------- Familiers et montures (dessin 24×24 dans un cadre 28×28, tournés vers la droite) : apparence décrite dans ITEMS[id].look ---------- */
  function fam(id){const k="fa:"+id;if(cache[k])return cache[k];const L=(ITEMS[id]&&ITEMS[id].look)||{t:"quad",c:"#f08aa8"},s=new Spr(28,28,2,2),c=L.c,c2=L.c2||mix(c,"#ffffff",.5),ink=mix(c,INK,.78),B="#1c1020",dk=mix(c,DARK,.3);
    const eye=(x,y)=>{s.set(x,y,B);s.set(x,y-1,B)};
    if(!L.vol)s.shadow(14,24,8,1.4);
    if(L.t==="quad"){const low=L.x==="bas",by=low?16:15,m=L.m;
      /* queue */
      if(L.q==="touffe")s.part(c,q=>{q.ell(4,by-3,3,2.6);q.ell(3,by-6,2,2)},{lt:.5});
      if(L.q==="fine")s.part(dk,q=>{q.line(5,by,2,by-4,2);q.line(2,by-4,3,by-8)},{flat:1});
      if(L.q==="flamme"){s.part("#ff7a2c",q=>q.poly([[6,by],[1,by-6],[3,by-2],[0,by-9],[5,by-3]]));s.part("#ffd84a",q=>q.poly([[5,by-1],[2,by-5],[4,by-3]]),{flat:1})}
      /* ailes repliées (arrière) */
      if(L.x==="ailes")s.part(mix(c2,DARK,.15),q=>q.poly([[9,by-1],[4,by-9],[7,by-10],[14,by-3]]));
      /* pattes */
      const lh=low?2:4;s.part(dk,q=>{[6,9,14,17].forEach(x=>q.rect(x,by+3,2,lh))});
      /* corps */
      s.part(c,q=>{q.ell(11.5,by,m?8:7,low?3:4.5)});
      if(L.x==="laine")s.part(c,q=>{for(let i=0;i<5;i++)q.ell(6+i*2.6,by-3+(i%2),2.4,2.2)},{lt:.6});
      if(L.x==="taches")[[8,by-1],[12,by+1],[15,by-2],[10,by+2]].forEach(([x,y])=>s.set(x,y,c2));
      if(L.x==="carapace"){s.part(c2,q=>q.ell(11,by-2,7,4.5));s.part(mix(c2,DARK,.35),q=>{q.line(8,by-5,8,by);q.line(13,by-6,13,by);q.line(5,by-2,17,by-2)},{flat:1})}
      /* tête */
      const hx=low?19:18,hy=low?by-2:by-5;s.part(c,q=>{q.ell(hx,hy,4,3.4);q.rect(hx+2,hy,3,2)});
      s.part(c2,q=>q.ell(hx+3,hy+2,1.6,1),{flat:1});
      /* oreilles / cornes */
      if(L.o==="longue")s.part(c,q=>{q.rect(hx-2,hy-9,2,7);q.rect(hx+1,hy-10,2,8)});
      if(L.o==="pointe")s.part(c,q=>{q.poly([[hx-3,hy-2],[hx-2,hy-7],[hx,hy-3]]);q.poly([[hx,hy-3],[hx+2,hy-8],[hx+3,hy-2]])});
      if(L.o==="rond")s.part(c,q=>{q.ell(hx-2,hy-3,1.6,1.6);q.ell(hx+2,hy-4,1.6,1.6)});
      if(L.o==="cornes")s.part(c2,q=>{q.ell(hx-2,hy-3,2.4,2.2);q.line(hx-4,hy-1,hx-5,hy+1,2)});
      if(L.o==="longue"||L.o==="pointe")s.part(c2,q=>{q.line(hx+2,hy-6,hx+2,hy-3)},{flat:1});
      if(L.x==="griffes")s.part("#f4ead8",q=>{q.px(hx+5,hy+3);q.px(20,by+6);q.px(17,by+6)},{flat:1});
      if(L.x==="ailes")s.part(c2,q=>q.poly([[10,by-2],[6,by-11],[9,by-12],[11,by-8],[15,by-4]]));
      s.outline(ink);eye(hx+1,hy);s.set(hx+5,hy+1,B)}
    else if(L.t==="crapaud"){s.part(c,q=>{q.ell(12,15,9,5.5);q.ell(8,10,3,2.6);q.ell(16,10,3,2.6)});s.part(c2,q=>q.ell(13,17,6,2.5),{flat:1});
      s.part(dk,q=>{q.rect(3,18,4,3);q.rect(17,18,4,3)});s.outline(ink);eye(9,10);eye(17,10);s.part(ink,q=>q.line(9,14,17,14),{flat:1})}
    else if(L.t==="scarabee"){s.part(dk,q=>{[5,10,15].forEach(x=>{q.line(x,17,x-2,21);q.line(x+3,17,x+5,21)})},{flat:1});
      s.part(c,q=>q.ell(11,13,9,6));s.part(mix(c,DARK,.45),q=>q.line(11,7,11,18),{flat:1});s.part(c2,q=>q.ell(20,14,3,2.6));
      s.part(mix(c,"#ffffff",.5),q=>{q.px(7,10);q.px(14,10);q.px(8,11)},{flat:1});s.part(ink,q=>{q.line(21,11,23,8)},{flat:1});s.outline(ink);eye(21,13)}
    else if(L.t==="insecte"){s.part(mix(c2,"#ffffff",.6),q=>{q.ell(9,8,4,3);q.ell(13,7,3.4,2.6)},{lt:.7});s.part(c,q=>{q.ell(11,13,4.5,3.2);q.ell(16,12,2.8,2.6)});
      s.part(c2,q=>q.ell(6,14,3.2,3),{lt:.7});s.outline(ink);s.part(ink,q=>{q.line(17,10,19,6);q.line(18,10,21,8)},{flat:1});eye(17,12)}
    else if(L.t==="oiseau"){s.part(dk,q=>q.poly([[6,14],[1,18],[3,19],[8,16]]));s.part(c,q=>{q.ell(11,13,5.5,5);q.ell(15,8,4,3.6)});
      s.part(c2,q=>q.ell(12,15,3,3),{lt:.6});s.part(c2,q=>q.poly([[18,8],[21,9],[18,10]]),{flat:1});
      s.part(mix(c,DARK,.2),q=>q.poly([[8,10],[4,16],[11,17],[13,12]]));s.part("#f0a33c",q=>{q.rect(10,18,1,3);q.rect(13,18,1,3)},{flat:1});
      s.outline(ink);s.part("#fff6c8",q=>{q.ell(14,7,1.6,1.4);q.ell(17,7,1.6,1.4)},{flat:1});s.set(14,7,B);s.set(17,7,B)}
    else if(L.t==="hippocampe"){s.part(c,q=>{q.ell(13,6,3,2.6);q.rect(15,6,4,2);q.ell(12,12,3.4,4.6);q.ell(10,18,2.6,2.4)});s.part(dk,q=>q.ell(11,18,1,1),{flat:1});
      s.part(c2,q=>{q.poly([[9,8],[6,10],[9,13]])},{lt:.6});s.part(c2,q=>q.ell(13,13,1.6,3),{flat:1});s.outline(ink);eye(13,6)}
    else if(L.t==="raie"){s.part(c,q=>q.poly([[2,12],[12,5],[22,12],[12,17]]));s.part(c2,q=>q.ell(12,12,3,2.2),{lt:.6});s.part(dk,q=>q.line(2,12,0,18),{flat:1});
      s.outline(ink);eye(15,10);eye(9,10)}
    else if(L.t==="follet"){s.part(c,q=>q.poly([[12,2],[17,9],[18,14],[15,19],[9,19],[6,14],[7,9],[10,10]]),{lt:.6});s.part(c2,q=>q.ell(12,14,3.4,3.6),{flat:1});
      s.outline(mix(c,INK,.5));eye(11,13);eye(14,13)}
    else if(L.t==="golem"){s.part(dk,q=>{q.rect(5,17,4,4);q.rect(15,17,4,4)});s.part(c,q=>{q.rect(4,7,16,11);q.rect(13,2,7,6)});s.part(mix(c,DARK,.4),q=>{q.rect(2,9,3,7);q.rect(19,9,3,7)});
      s.part(c2,q=>{q.line(8,10,11,13);q.line(11,13,8,15);q.px(14,11)},{flat:1});s.outline(ink);s.set(17,4,c2);s.set(18,4,c2)}
    return cache[k]=s.url(),SPR[k]=s,cache[k]}
  function famFrames(id,anim){const k="fa:"+id;if(!SPR[k])fam(id);return framesOf(k,SPR[k],anim,true)}

  /* Poisson vu de côté (16×16). rk : 0 commun, 1 rare (rayures, éclat), 2 légendaire (plus grand, contour doré) */
  function fish(col,rk=0,t=0){const k="fi:"+col+rk+t;if(cache[k])return cache[k];const s=new Spr(16,16),dk=mix(col,DARK,.35),lt=mix(col,"#ffffff",.55),big=rk===2;
    const tl=t%3;/* trois silhouettes selon le palier */
    s.part(dk,q=>q.poly(tl===1?[[0,4],[4,8],[0,12]]:[[0,5],[4,8],[0,11],[2,8]]));
    s.part(col,q=>{if(tl===2){q.ell(8,8,6,2.6)}else q.ell(8.5,8,big?6:5.5,big?4:3.4)});
    s.part(dk,q=>{q.poly([[6,big?4:5],[9,big?1:2],[11,big?4:5]]);q.poly([[7,big?11:10],[9,big?14:13],[10,big?11:10]])});
    s.part(lt,q=>q.ell(9,10,3,1),{flat:1});
    if(rk>=1)s.part(mix(col,DARK,.5),q=>{q.line(6,6,6,10);q.line(9,5,9,11)},{flat:1});
    s.outline(rk===2?"#8a5a08":INK);s.set(12,7,"#ffffff");s.set(12,8,"#1c1020");
    if(rk>=1){const g=rk===2?"#ffd84a":"#ffffff";s.set(14,2,g);s.set(13,2,g);s.set(15,2,g);s.set(14,1,g);s.set(14,3,g)}
    if(rk===2)["#ffd84a","#fff2a8","#ffd84a"].forEach((c,i)=>s.set(6+i*2,0,c));
    if(rk===3){/* mythique : écailles arc-en-ciel, nageoires dorées, étincelles */const RB=["#ff5a5a","#ffa04a","#ffe04a","#6ad86a","#5ab0ff","#a87aff"];
      for(let y=0;y<16;y++)for(let x=0;x<16;x++){const c=s.p[y*16+x];if(c&&x>=3&&x<=13&&y>=4&&y<=12&&!(x===12&&(y===7||y===8)))s.p[y*16+x]=rgb(RB[Math.min(5,Math.max(0,Math.floor((x-3)/1.9)))])}
      s.outline("#8a3a6a");s.set(12,7,"#ffffff");s.set(12,8,"#1c1020");[[1,1],[14,1],[15,13],[0,14],[8,0]].forEach(([x,y])=>s.set(x,y,"#fff8e6"))}
    return cache[k]=s.url()}

  /* ---------- Accessoires de décor ---------- */
  const prop={
    tree(r,cc,tc){const s=new Spr(34,40);s.part(tc,q=>{q.rect(14,24,6,15);q.rect(12,37,10,2);q.px(11,38)});
      s.part(cc,q=>{q.ell(17,15,13,10);q.ell(8,19,6,6);q.ell(26,19,6,6);q.ell(17,8,8,6)},{lt:.3,dk:.42});
      const l=mix(cc,LIGHT,.45),d=mix(cc,DARK,.5);for(let i=0;i<46;i++){const x=4+(r()*26|0),y=3+(r()*22|0);if(s.get(x,y)&&s.get(x+1,y)&&s.get(x,y+2)){const c=r()<.5+(12-y)*.04?l:d;s.set(x,y,c);s.set(x+1,y,c)}}
      return s.outline(mix(cc,INK,.8))},
    pine(r,cc,tc,snow){const s=new Spr(22,34);s.part(tc,q=>q.rect(9,27,4,6));s.part(cc,q=>{q.poly([[11,1],[4,11],[18,11]]);q.poly([[11,7],[2,19],[20,19]]);q.poly([[11,14],[0,28],[22,28]])},{dk:.45});
      if(snow)s.part("#f4fbff",q=>{q.poly([[11,1],[8,5],[14,5]]);q.rect(5,10,4,1);q.rect(13,10,5,1);q.rect(3,18,5,1);q.rect(13,18,6,1);q.rect(2,27,6,1);q.rect(14,27,6,1)},{flat:1});return s.outline(mix(cc,INK,.8))},
    rock(r,c){const w=8+(r()*6|0),s=new Spr(w+2,10);s.part(c,q=>{q.ell(w/2+.5,6,w/2,3.4);q.rect(2,6,w-2,3)});return s.outline(mix(c,INK,.7))},
    bush(r,c){const s=new Spr(14,10);s.part(c,q=>{q.ell(4,6,3,3);q.ell(9,6,3,3);q.ell(7,4,3,3)},{dk:.42});return s.outline(mix(c,INK,.78))},
    mushroom(r,c){const s=new Spr(9,9);s.part("#f6ecd6",q=>q.rect(3,5,3,3));s.part(c,q=>{q.rect(1,3,7,2);q.rect(2,2,5,1)});s.set(3,3,"#fff");s.set(6,4,"#fff");return s.outline()},
    crystal(r,c){const s=new Spr(12,14);s.part(c,q=>{q.poly([[2,12],[4,3],[6,12]]);q.poly([[5,12],[8,0],[10,12]])},{lt:.6});return s.outline(mix(c,INK,.7))},
    cactus(r,c){const s=new Spr(12,16);s.part(c,q=>{q.rect(5,2,3,13);q.rect(1,6,2,4);q.rect(1,9,4,2);q.rect(9,4,2,5);q.rect(8,8,3,2)});s.set(6,1,"#ff8ab0");return s.outline(mix(c,INK,.75))},
    reed(r,c){const s=new Spr(9,14);s.part(c,q=>{q.rect(2,4,1,9);q.rect(5,2,1,11);q.rect(7,6,1,7)},{flat:1});s.part("#7a4a2a",q=>{q.rect(2,2,1,3);q.rect(5,0,1,3)},{flat:1});return s.outline(mix(c,INK,.75))},
    bone(r){const s=new Spr(10,6);s.part("#efe6cf",q=>{q.rect(2,2,6,1);q.rect(1,1,2,3);q.rect(7,1,2,3)},{flat:1});return s.outline("#5a4630")},
    lantern(r){const s=new Spr(7,18);s.part("#5a4030",q=>q.rect(3,6,1,11),{flat:1});s.part("#ffd86a",q=>q.rect(2,2,3,4),{flat:1});s.part("#3a2a22",q=>{q.rect(1,1,5,1);q.rect(1,6,5,1)},{flat:1});return s.outline()},
    coral(r,c){const s=new Spr(13,13);s.part(c,q=>{q.rect(6,4,2,8);q.rect(2,6,2,5);q.rect(2,9,5,2);q.rect(10,3,2,6);q.rect(7,7,4,2);q.px(6,3);q.px(2,5);q.px(10,2)});return s.outline(mix(c,INK,.7))},
    pillar(r,c){const h=12+(r()*8|0),s=new Spr(11,h+2);s.part(c,q=>{q.rect(3,2,5,h-2);q.rect(1,h-1,9,2);q.rect(2,1,7,2)});s.part(mix(c,DARK,.3),q=>q.rect(5,4,1,h-6),{flat:1});return s.outline(mix(c,INK,.7))},
    stump(r,c){const s=new Spr(10,8);s.part(c,q=>q.rect(1,2,7,5));s.part(mix(c,LIGHT,.5),q=>q.rect(2,1,5,2),{flat:1});return s.outline(mix(c,INK,.75))},
  };

  /* ---------- Décors de zone (240×130) ---------- */
  const TH={
    prairie:{g:["#6aa84a","#7cbc54","#5a9442","#4c8040"],path:"#b79a62",wall:"stone",wc:"#8f86a6",water:"#5a86d8",
      props:[["tree",3,"#3f8a44","#7a5232"],["bush",4,"#4f9a48"],["rock",3,"#9a92ae"]],fl:["#ffd84a","#ffe98a","#fff"]},
    bois:{g:["#3f7a52","#4a8a5a","#33684a","#2a5840"],path:"#7a6a4a",wall:"trees",wc:"#24503c",water:null,
      props:[["tree",5,"#2f7050","#5a4030"],["mushroom",5,"#d9574f"],["bush",4,"#2f7a4a"],["stump",2,"#7a5a3a"]],fl:["#c6e86b","#b9a6ff"]},
    marais:{g:["#587a48","#66884e","#4a6a40","#3c5a3a"],path:"#6e6a48",wall:"reeds",wc:"#3a5a4a",water:"#3f7a78",
      props:[["reed",9,"#7fa24e"],["tree",2,"#4a6e3e","#4a3a2c"],["rock",3,"#6f7a6a"],["mushroom",2,"#8a6fd0"]],fl:["#f0a8c8","#e8f0a0"]},
    mines:{g:["#5a5368","#665e76","#4c465a","#403a4e"],path:"#7a6a5a",wall:"rock",wc:"#3a3446",water:null,
      props:[["crystal",5,"#9b8ee0"],["rock",7,"#6e667e"],["lantern",3],["crystal",2,"#f0a35a"]],fl:["#c9b8ff","#ffd86a"]},
    dunes:{g:["#e0b46a","#ecc47a","#d2a25c","#c08e4e"],path:"#f2d494",wall:"cliff",wc:"#c0763e",water:null,
      props:[["cactus",5,"#5a9a4e"],["rock",5,"#c08a5a"],["bone",3]],fl:["#fff0b8","#f08a5a"]},
    falaises:{g:["#7f9a8a","#8faa98","#6e8a7c","#5c786c"],path:"#a89a84",wall:"cliff",wc:"#6a7088",water:"#5f8fd0",
      props:[["rock",8,"#8a8fa6"],["pine",4,"#4a7a6a","#5a4030"],["crystal",3,"#ffe27a"],["bush",3,"#6a9a7a"]],fl:["#fff7b0","#ffffff"]},
    jungle:{g:["#3f9a4a","#4fb058","#33843e","#286e34"],path:"#8a7a4a",wall:"trees",wc:"#1f5a34",water:"#3fa8a0",
      props:[["tree",6,"#2f9a4a","#6a4a2c"],["bush",6,"#3fae52"],["mushroom",3,"#f0a03c"],["reed",4,"#6fc04e"]],fl:["#ff6fa8","#ffd84a","#ff9a3c"]},
    recifs:{g:["#f0dca0","#f8e8b8","#e2c888","#d0b474"],path:"#fff0c8",wall:"reeds",wc:"#2f8ab0",water:"#3fb8d8",
      props:[["coral",7,"#ff7a8a"],["coral",4,"#b98aff"],["rock",5,"#b0a890"],["reed",3,"#3fa880"]],fl:["#ffffff","#ffb0c8","#8ae0f0"]},
    volcan:{nw:1,g:["#4a3a3e","#584448","#3e3034","#32262a"],path:"#6a5248",wall:"rock",wc:"#3a2a2c",water:"#ff7a2c",
      props:[["rock",8,"#5a4a4e"],["crystal",5,"#ff9a3c"],["stump",2,"#2e2224"],["bone",2]],fl:["#ff9a3c","#ffd84a","#ff5a2c"]},
    ruines:{g:["#b0a8c8","#beb6d6","#9e96b8","#8c84a6"],path:"#d0c8e0",wall:"stone",wc:"#7a72a0",water:null,
      props:[["pillar",6,"#d8d2e8"],["crystal",4,"#8ad0ff"],["rock",4,"#9a92b4"],["bush",3,"#6a9a8a"]],fl:["#ffffff","#ffe27a","#8ad0ff"]},
    abime:{nw:1,g:["#3a2e5a","#463868","#30264c","#261e40"],path:"#55467a",wall:"ice",wc:"#5a3f96",water:"#b83ad0",
      props:[["crystal",7,"#c06aff"],["crystal",3,"#ff6ab0"],["rock",5,"#4a3f6a"],["bone",3]],fl:["#c9b8ff","#ff8ad0","#8ad0ff"]},
    givre:{nw:1,g:["#dfeef8","#f2f9ff","#c6ddef","#aecbe4"],path:"#c2d8ea",wall:"ice",wc:"#8fb8dc",water:"#7ab4e8",
      props:[["pine",5,"#3f7a6a","#5a4030",1],["crystal",5,"#a6dcff"],["rock",4,"#9ab0c8"]],fl:["#ffffff","#bfe3ff"]},
  };
  function scene(id){
    const k="s:"+id;if(cache[k])return cache[k];const T=TH[id]||TH.prairie,W=240,H=130,s=new Spr(W,H),r=rng(id.length*7919+id.charCodeAt(0)*131+id.charCodeAt(1));
    const G=T.g.map(rgb),P=rgb(T.path),WY=24;
    for(let y=0;y<H;y++)for(let x=0;x<W;x++)s.p[y*W+x]=G[0];
    /* plaques de teinte */
    for(let i=0;i<34;i++){const cx=r()*W,cy=WY+r()*(H-WY),rx=6+r()*16,ry=3+r()*7,c=G[1+(i%3)];
      for(let y=Math.floor(cy-ry);y<=cy+ry;y++)for(let x=Math.floor(cx-rx);x<=cx+rx;x++){const d=((x-cx)/rx)**2+((y-cy)/ry)**2;if(d<1&&(d<.7||(x+y)%2===0))s.set(x,y,c)}}
    /* clairière au centre, là où l'on se bat */
    for(let y=30;y<92;y++)for(let x=60;x<180;x++){const d=((x-120)/56)**2+((y-62)/24)**2;if(d<.72||(d<1&&(x+y)%2===0))s.set(x,y,P)}
    {const pl=mix(P,LIGHT,.35),pd=mix(P,DARK,.22);for(let i=0;i<90;i++){const x=70+(r()*100|0),y=42+(r()*40|0);if(((x-120)/50)**2+((y-62)/20)**2<1){const c=r()<.5?pl:pd;s.set(x,y,c);s.set(x+1,y,c)}}}
    /* eau */
    if(T.water){const wc=rgb(T.water),wl=mix(wc,"#ffffff",.45),wd=mix(wc,DARK,.3),sh=mix(G[3],DARK,.35);
      [[30,96,30,13],[214,44,22,9]].forEach(([cx,cy,rx,ry])=>{for(let y=Math.floor(cy-ry-2);y<=cy+ry+2;y++)for(let x=Math.floor(cx-rx-2);x<=cx+rx+2;x++){const d=((x-cx)/rx)**2+((y-cy)/ry)**2;
        if(d<1){let c=wc;if(y<cy-ry*.45&&d>.5)c=wd;else if((x+y*3)%13===0||((x*5+y*2)%17===0&&x%2))c=wl;s.set(x,y,c)}else if(d<1.25)s.set(x,y,sh)}})}
    /* brins, fleurs, cailloux */
    for(let i=0;i<420;i++){const x=r()*W|0,y=WY+2+(r()*(H-WY-3)|0),c=r()<.5?G[2]:G[1];if(s.get(x,y)===G[0]||s.get(x,y)===G[1]||s.get(x,y)===G[2]){s.set(x,y,c);s.set(x+1,y,c);if(r()<.4)s.set(x,y-1,c)}}
    for(let i=0;i<70;i++){const x=4+(r()*(W-8)|0),y=WY+4+(r()*(H-WY-8)|0),c=T.fl[r()*T.fl.length|0];if(T.water&&s.get(x,y)&&s.get(x,y)[2]>s.get(x,y)[1]&&!T.nw)continue;s.set(x,y,c);if(r()<.5){s.set(x+1,y,c);s.set(x,y+1,mix(c,DARK,.3))}}
    /* fond : mur, lisière, falaise… */
    const wc=rgb(T.wc);
    if(T.wall==="stone"||T.wall==="rock"||T.wall==="cliff"||T.wall==="ice"){
      const lt=mix(wc,LIGHT,.35),dk=mix(wc,DARK,.4),ink=mix(wc,INK,.7),bh=T.wall==="stone"?6:8;
      for(let y=0;y<WY;y++)for(let x=0;x<W;x++)s.set(x,y,dk);
      for(let row=0;row*bh<WY;row++){let x=-(row%2)*5-(r()*4|0);while(x<W){const bw=T.wall==="stone"?9+(r()*5|0):12+(r()*12|0),y0=row*bh,c=r()<.3?mix(wc,DARK,.15):r()<.3?mix(wc,LIGHT,.12):wc;
        for(let j=0;j<bh-1;j++)for(let i=0;i<bw-1;i++){const e=(i===0&&j===0)||(i===bw-2&&j===0)||(i===0&&j===bh-2)||(i===bw-2&&j===bh-2);if(e)continue;s.set(x+i,y0+j,j===0||i===0?lt:(j===bh-2||i===bw-2?mix(c,DARK,.25):c))}x+=bw}}
      for(let x=0;x<W;x++){s.set(x,WY,ink);s.set(x,WY+1,mix(G[3],DARK,.35));if((x*7)%3)s.set(x,WY+2,mix(G[3],DARK,.2))}
      if(T.wall==="stone")for(let i=0;i<26;i++){const x=r()*W|0,y=r()*8|0;s.set(x,y,G[2]);s.set(x+1,y,G[1]);s.set(x,y+1,G[2])}
      if(T.wall==="ice")for(let x=0;x<W;x++){const hgt=1+((x*13)%5===0?3:(x*7)%3);for(let j=0;j<hgt;j++)s.set(x,j,"#f8fdff")}
      if(T.wall==="rock")for(let x=20;x<W;x+=66){for(let y=0;y<WY;y++){s.set(x,y,"#7a5232");s.set(x+1,y,"#9a6a3c");s.set(x+2,y,"#5a3a22")}for(let i=-6;i<9;i++){s.set(x+i,2,"#9a6a3c");s.set(x+i,3,"#5a3a22")}}
    }else{
      const dk=mix(wc,DARK,.45);for(let y=0;y<WY;y++)for(let x=0;x<W;x++)s.set(x,y,(x+y)%2&&y>WY-4?mix(G[3],DARK,.25):dk);
      if(T.wall==="trees"){for(let x=6;x<W;x+=14+(r()*8|0)){const tw=4+(r()*3|0);for(let y=6;y<WY+2;y++)for(let i=0;i<tw;i++)s.set(x+i,y,i===0?"#7a5a40":i===tw-1?"#2e2018":"#5a4030")}
        for(let i=0;i<60;i++){const cx=r()*W,cy=r()*9,rr=4+r()*5,c=r()<.5?mix(wc,LIGHT,.18):mix(wc,DARK,.1);for(let y=Math.floor(cy-rr);y<=cy+rr;y++)for(let x=Math.floor(cx-rr);x<=cx+rr;x++)if((x-cx)**2+(y-cy)**2<rr*rr)s.set(x,y,c)}}
      if(T.wall==="reeds"){const w2=rgb(T.water),wl=mix(w2,"#fff",.4);for(let y=0;y<WY-3;y++)for(let x=0;x<W;x++)s.set(x,y,(x+y*5)%19===0?wl:w2);
        for(let x=1;x<W;x+=3+(r()*4|0)){const hgt=6+(r()*9|0);for(let j=0;j<hgt;j++)s.set(x,WY+1-j,j>hgt-3?"#7a4a2a":r()<.5?"#7fa24e":"#5c8040")}}
    }
    /* accessoires, triés par profondeur, en dehors de la clairière */
    const items=[];T.props.forEach(([n,cnt,...a])=>{for(let i=0;i<cnt;i++){const sp=prop[n](r,...a);let x,y,t=0;do{x=r()*(W-sp.w)|0;y=(n==="tree"||n==="pine"?WY-22:WY+2)+(r()*(H-WY-sp.h+ (n==="tree"||n==="pine"?16:0))|0);t++}while(t<30&&((x+sp.w>62&&x<178&&y+sp.h>34&&y+sp.h<100)||(T.water&&s.get(x+sp.w/2|0,y+sp.h-1)&&s.get(x+sp.w/2|0,y+sp.h-1)[2]>170&&!T.nw)));
      items.push([sp,x,y])}});
    items.sort((a,b)=>a[2]+a[0].h-b[2]-b[0].h).forEach(([sp,x,y])=>{const sc=mix(G[3],DARK,.4);for(let i=1;i<sp.w-1;i++){s.set(x+i,y+sp.h-1,sc);if(i>1&&i<sp.w-2)s.set(x+i,y+sp.h,sc)}s.blit(sp,x,y)});
    return cache[k]=s.url()}

  /* ---------- Motif de fond de page ---------- */
  /* Fond de page : herbe (ou sol) du biome, un peu plus sombre que l'arène */
  function tile(id="prairie"){const k="t:"+id;if(cache[k])return cache[k];const T=TH[id]||TH.prairie,s=new Spr(32,32),r=rng(4242+id.length*31),g=T.g.map(c=>mix(c,DARK,.18));for(let i=0;i<1024;i++)s.p[i]=g[0];
    for(let i=0;i<70;i++){const x=r()*32|0,y=r()*32|0,c=g[1+(r()*3|0)];s.set(x,y,c);s.set((x+1)%32,y,c);if(r()<.4)s.set(x,(y+31)%32,c)}
    const fl=T.fl||["#ffd84a","#fff"];[[5,7],[21,19],[14,27],[27,4]].forEach(([x,y],i)=>{const c=fl[i%fl.length];s.set(x,y,c);s.set(x+1,y,mix(c,DARK,.25))});return cache[k]=s.url()}

  const img=(u,cls="",w,h)=>`<img class="px ${cls}" src="${u}" alt="" draggable="false"${w?` width="${w}" height="${h}"`:""}>`;

  /* ================= Animation image par image (10 images par mouvement) ================= */
  const SPR={};                                   /* sprites bruts gardés pour fabriquer les images */
  /* Héros et compagnons humains : bras et arme dessinés selon un angle, 32×32 pour laisser la place à l'arme.
     Tables : angle du bras droit (degrés, 0 = vers l'avant, 90 = vers le bas), arme, décalage du corps. */
  const HA={
    idle:{arm:[88,86,84,84,86,88,90,92,92,90],dx:[0,0,0,0,0,0,0,0,0,0],dy:[0,0,0,1,1,1,1,0,0,0],w:[-88,-87,-86,-86,-87,-88,-89,-90,-90,-89]},
    atk:{arm:[90,150,205,230,280,330,10,25,55,80],dx:[0,-1,-1,-1,0,1,2,2,1,0],dy:[0,0,1,1,0,0,0,0,0,0],w:[-80,-100,-135,-155,-115,-50,0,15,-30,-70]},
    bash:{arm:[90,115,135,125,45,0,-5,10,50,80],dx:[0,-1,-2,-2,0,2,3,2,1,0],dy:[0,0,1,1,0,0,0,0,0,0],w:[0,0,0,0,0,0,0,0,0,0]},
    shoot:{arm:[85,60,30,10,0,0,0,0,30,70],dx:[0,0,-1,-1,-1,-1,0,0,0,0],dy:[0,0,0,0,0,0,0,0,0,0],pull:[0,1,2,3,4,4,0,0,0,0],w:[0,0,0,0,0,0,0,0,0,0]},
    staff:{arm:[90,120,150,130,60,10,-10,0,40,80],dx:[0,-1,-1,-1,0,1,2,1,0,0],dy:[0,0,1,1,0,0,0,0,0,0],w:[-95,-110,-125,-115,-70,-30,-15,-25,-60,-90]},
    cast:{arm:[90,50,10,-30,-60,-80,-88,-90,-90,-90],dx:[0,0,0,0,0,0,0,0,0,0],dy:[0,0,1,0,-1,-1,-1,-1,-1,-1],w:[-90,-70,-60,-75,-85,-90,-90,-90,-90,-90],left:1}};
  /* animation d'attaque propre à chaque classe */
  const ATK={guerrier:"atk",gardien:"bash",archer:"shoot",mage:"staff"};
  /* Héros (32 px de dessin) rendu dans un cadre de 64 px (marge de 16 px) : l'arme ne sort plus du cadre.
     tight = cadre 32 px d'origine (portraits). */
  const HP=16;
  function heroF(cls,col,anim,f,blink,tight){
    if(anim==="atk")anim=ATK[cls]||"atk";
    const k="hf:"+cls+col+anim+f+(blink?"b":"")+(tight?"t":"");if(cache[k])return cache[k];const T=HA[anim]||HA.idle;
    const s=new Spr(32+2*HP,32+2*HP,HP,HP),dk=mix(col,DARK,.45),lt=mix(col,"#ffffff",.4),skin="#f6cfa6",ink=mix(col,INK,.82),B="#1c1020";
    const R=Math.PI/180,a=T.arm[f]*R,sx=16.5,sy=15.5,hx=sx+Math.cos(a)*5,hy=sy+Math.sin(a)*5,wa=(T.w[f]??-90)*R;
    const la=T.left?(180-T.arm[f])*R:(92+(T.arm[f]-90)*-.15)*R,lsx=4.5,lsy=15.5,lhx=lsx+Math.cos(la)*5,lhy=lsy+Math.sin(la)*5;
    /* arme tenue derrière le corps (bâton du mage au repos) */
    const staffFn=()=>{const ux=Math.cos(wa),uy=Math.sin(wa);s.part("#8a5a34",q=>q.line(hx-ux*7,hy-uy*7,hx+ux*15,hy+uy*15),{flat:1});s.part(lt,q=>q.ell(hx+ux*16,hy+uy*16,2.1,2.1))};
    if(cls==="mage"&&anim!=="staff"&&anim!=="cast")staffFn();
    s.part(dk,q=>{q.rect(5,14,12,13);q.clear(5,26,1,1);q.clear(16,26,1,1)});
    const step=anim==="atk"||anim==="bash"?(f>=4&&f<=7?1:0):0;
    s.part("#4a342c",q=>{q.rect(7,23,3,5);q.rect(12+step,23,3,5)},{flat:1});
    s.part("#7a4e2e",q=>{q.rect(6,27,4,3);q.rect(12+step,27,4,3)});
    s.part(col,q=>{q.rect(6,15,10,9);q.clear(6,15,1,1);q.clear(15,15,1,1)});
    s.part("#6b432a",q=>q.rect(6,21,10,1),{flat:1});s.set(10,21,"#f7c948");s.set(11,21,"#f7c948");
    s.part(col,q=>q.line(lsx,lsy,lhx,lhy,2));s.set(Math.round(lhx),Math.round(lhy),skin);s.set(Math.round(lhx)+1,Math.round(lhy),skin);   /* bras gauche */
    /* bras droit et arme : dessinés derrière la tête quand le bras passe en arrière */
    const am=((T.arm[f]%360)+360)%360,behind=am>150&&am<300;
    const rightArm=()=>{
    s.part(col,q=>q.line(sx,sy,hx,hy,2));
    if(cls==="guerrier"){const ux=Math.cos(wa),uy=Math.sin(wa),px=-uy,py=ux;s.part("#6b432a",q=>q.line(hx-ux*2,hy-uy*2,hx,hy,2),{flat:1});
      s.part("#dfe5ec",q=>q.line(hx+ux*2,hy+uy*2,hx+ux*12,hy+uy*12,2));s.part("#f7c948",q=>q.line(hx+ux*1.5-px*3,hy+uy*1.5-py*3,hx+ux*1.5+px*3,hy+uy*1.5+py*3),{flat:1})}
    if(cls==="mage"&&(anim==="staff"||anim==="cast"))staffFn();
    if(cls==="archer"){const p=(T.pull||[])[f]||0,bx=hx+2,by=hy;s.part("#9a6a3c",q=>{q.line(bx,by-8,bx+2,by-5);q.line(bx+2,by-5,bx+2,by+5);q.line(bx+2,by+5,bx,by+8)},{flat:1});
      s.part("#f1e4bf",q=>{q.line(bx,by-8,bx-p,by);q.line(bx-p,by,bx,by+8)},{flat:1});if(p)s.part("#e8dcc0",q=>q.line(bx-p,by,bx+6,by),{flat:1})}
    if(cls==="gardien"){s.part(lt,q=>{q.rect(hx-1,hy-5,7,8);q.poly([[hx-1,hy+3],[hx+2.5,hy+7],[hx+6,hy+3]])});s.part("#f7c948",q=>q.rect(hx+2,hy-2,2,3),{flat:1})}
    s.set(Math.round(hx),Math.round(hy),skin);s.set(Math.round(hx)+1,Math.round(hy),skin);
    };
    if(behind)rightArm();
    s.part(skin,q=>q.ell(11,9,6,5.4));
    s.part(col,q=>{q.ell(11,7,7,5.6);q.clear(0,9,32,8);q.rect(4,9,2,3);q.rect(17,9,2,3);q.rect(6,9,2,1);q.rect(14,9,3,1)});
    if(cls==="mage")s.part(col,q=>q.poly([[6,3],[11,-3],[16,3]]));
    if(cls==="archer"){s.part("#e24a3a",q=>q.line(15,1,17,-1),{flat:1});s.part(lt,q=>q.rect(4,7,15,1),{flat:1})}
    if(cls==="guerrier")s.part("#c9ced6",q=>{q.rect(4,6,15,2);q.rect(10,4,3,2)});
    if(cls==="gardien")s.part("#c9ced6",q=>{q.rect(4,5,15,3);q.rect(11,8,1,2)});
    s.set(8,10,B);s.set(8,11,B);s.set(13,10,B);s.set(13,11,B);s.set(9,10,"#fff");s.set(14,10,"#fff");
    if(blink)[8,9,13,14].forEach(x=>{s.set(x,10,skin);s.set(x,11,B)});
    s.set(6,12,"#f29a8e");s.set(7,12,"#f29a8e");s.set(15,12,"#f29a8e");s.set(16,12,"#f29a8e");s.set(10,13,"#b06a55");s.set(11,13,"#b06a55");
    if(!behind)rightArm();
    s.outline(ink);
    /* décalage du corps (+4 pour centrer dans le cadre 32 px) */
    const W=s.w,P=tight?0:HP,N=32+2*P,o=new Spr(N,N),ox=4+T.dx[f]-HP+P,oy=T.dy[f]-HP+P;o.shadow(15+P,30+P,8,1.6);for(let y=0;y<W;y++)for(let x=0;x<W;x++){const c=s.p[y*W+x];if(c){const X=x+ox,Y=y+oy;if(X>=0&&Y>=0&&X<N&&Y<N)o.p[Y*N+X]=c}}
    return cache[k]=o.url()}
  const heroFrames=(cls,col,anim,blink)=>{const k="hfs:"+cls+col+anim+(blink?1:0);return cache[k]||(cache[k]=Array.from({length:10},(_,f)=>heroF(cls,col,anim,f,blink&&f===5)),cache[k].sc=((32+2*HP)/32).toFixed(3),cache[k])};

  /* Monstres et bêtes : 10 images obtenues en redessinant le sprite pixel par pixel (écrasement, étirement, inclinaison) */
  /* XP : marge transparente autour de l'image pour que l'élan, l'inclinaison et l'étirement ne soient jamais coupés
     (l'image est ensuite agrandie d'autant en CSS avec la propriété scale, voir SCENE) */
  const XP=20;
  function xf(src,{sx=1,sy=1,sh=0,dx=0,dy=0}){const w=src.w,h=src.h,W=w+2*XP,H=h+2*XP,o=new Spr(W,H),by=h-3,cx=w/2;o.sh=src.sh.map(([a,b,c,d])=>[a+XP,b+XP,c,d]);
    for(let Y=0;Y<H;Y++)for(let X=0;X<W;X++){const x=X-XP,y=Y-XP,v=Math.round(by-(by-y+dy)/sy),u=Math.round(cx+(x-cx-dx-sh*(by-y))/sx);const c=src.get(u,v);if(c)o.p[Y*W+X]=c}return o}
  const MA={
    idle:Array.from({length:10},(_,i)=>{const t=i/10,b=(1-Math.cos(2*Math.PI*t))/2;return{sy:1-.07*b,sx:1+.05*b,sh:.04*Math.sin(2*Math.PI*t)}}),
    atk:[{},{sh:.08,sy:1.04},{sh:.16,sy:1.08,sx:.96},{sh:.2,sy:1.1,sx:.94,dx:2},{sh:-.1,sy:.95,sx:1.06,dx:-4},{sh:-.28,sy:.9,sx:1.12,dx:-9},{sh:-.22,sy:.92,sx:1.1,dx:-7},{sh:-.1,sy:.96,sx:1.04,dx:-4},{sh:.04,sy:1.02,dx:-1},{}],
    hurt:[{sh:.12,dx:3,sy:.96},{sh:.18,dx:5,sy:.94,sx:1.04},{sh:.14,dx:4,sy:.96},{sh:.08,dx:2},{sh:.03,dx:1},{},{},{},{},{}]};
  function framesOf(key,spr,anim,mirror){const k="xf:"+key+anim+(mirror?"m":"");if(cache[k])return cache[k];const T=MA[anim]||MA.idle;
    cache[k]=T.map(p=>{const q=Object.assign({},p);if(mirror){q.sh=-(q.sh||0);q.dx=-(q.dx||0)}return xf(spr,q).url()});cache[k].sc=((spr.w+2*XP)/spr.w).toFixed(3);return cache[k]}
  function monFrames(m,anim){const k="m:"+m.id+m.c+(m.crown?1:0);if(!SPR[k])monster(m);return framesOf(k,SPR[k],anim,false)}
  function petFrames(col,anim){pet(col);const k="pe:"+col;return framesOf(k,SPR[k],anim,true)}

  /* ---------- Couches de décor qui défilent (bandes raccordables) ---------- */
  function strip(id,kind){const k="st:"+id+kind;if(cache[k])return cache[k];const T=TH[id]||TH.prairie,W=256,H=kind==="front"?26:46,s=new Spr(W,H),r=rng(id.length*331+(kind==="front"?7:3));
    const put=(x,y,c)=>s.set(((x%W)+W)%W,y,c);
    if(kind==="front"){const G=T.g.map(rgb);
      for(let i=0;i<46;i++){const x=r()*W|0,hgt=5+(r()*9|0),c=G[i%3+1],cd=mix(G[3],DARK,.35);for(let j=0;j<hgt;j++){const sw=j>hgt*.6?(i%2?1:-1):0;put(x+sw,H-1-j,j===hgt-1?mix(c,LIGHT,.3):c);put(x+1+sw,H-1-j,cd)}}
      for(let i=0;i<9;i++){const x=r()*W|0,rw=5+(r()*6|0),rh=3+(r()*3|0),c=rgb((T.props.find(p=>p[0]==="rock")||[0,0,"#9a92ae"])[2]||"#9a92ae");for(let y=0;y<rh;y++)for(let xx=0;xx<rw;xx++){const e=(xx===0||xx===rw-1)&&y===0;if(!e)put(x+xx,H-rh+y,y===0?mix(c,LIGHT,.3):xx===rw-1?mix(c,DARK,.35):c)}}
      for(let i=0;i<14;i++){const x=r()*W|0,c=T.fl[i%T.fl.length];put(x,H-8-(r()*6|0),c)}}
    else{const c=mix(T.wc,LIGHT,.55);for(let i=0;i<7;i++){const cx=r()*W,cy=8+r()*22,rx=14+r()*22,ry=3+r()*4;for(let y=Math.floor(cy-ry);y<=cy+ry;y++)for(let x=Math.floor(cx-rx);x<=cx+rx;x++){const d=((x-cx)/rx)**2+((y-cy)/ry)**2;if(d<1&&(d<.6||(x+y)%2===0))put(x,y,c)}}}
    return cache[k]=s.url()}

  /* ---------- Compagnons-créatures : golem, dragonnet, phénix (24×24, 10 images par mouvement) ---------- */
  const BA={
    /* idle : battement d'ailes + petit vol de haut en bas (phénix, dragonnet), balancement lourd (golem) */
    idle:Array.from({length:10},(_,f)=>({w:Math.sin(2*Math.PI*f/10),bob:Math.round(-Math.sin(2*Math.PI*f/10+Math.PI)*1.8),fx:0,arm:Math.sin(2*Math.PI*f/10),open:0})),
    /* atk : élan en arrière puis coup vers l'avant (piqué, souffle, coup de poing) */
    atk:[{w:-.2,bob:0,fx:0,arm:0,open:0},{w:-.6,bob:-1,fx:-1,arm:-.5,open:0},{w:-1,bob:-2,fx:-2,arm:-1,open:0},{w:-1,bob:-2,fx:-2,arm:-1,open:0},{w:.3,bob:0,fx:1,arm:.2,open:1},{w:1,bob:1,fx:3,arm:1,open:1},{w:1,bob:1,fx:3,arm:1,open:1},{w:.6,bob:0,fx:2,arm:.6,open:1},{w:.1,bob:0,fx:1,arm:.2,open:0},{w:0,bob:0,fx:0,arm:0,open:0}]};
  function beastF(id,col,anim,f){const k="bf:"+id+col+anim+f;if(cache[k])return cache[k];const P=(BA[anim]||BA.idle)[f],s=new Spr(24,24),B="#1c1020";
    if(id==="phenix"){const y=P.bob,x=P.fx,fl=["#ffd36a","#ff8a3c","#ff5a3c"];
      /* queue de flammes qui ondule */
      s.part(fl[1],q=>q.poly([[7+x,14+y],[1+x,17+y+Math.round(P.w)],[3+x,20+y],[8+x,17+y]]));s.part(fl[0],q=>q.poly([[7+x,15+y],[2+x,22+y-Math.round(P.w)],[6+x,21+y],[9+x,17+y]]),{flat:1});
      /* aile arrière */
      const wy=Math.round(P.w*6);s.part(mix(col,DARK,.25),q=>q.poly([[10+x,12+y],[4+x,10+y-wy],[7+x,14+y]]));
      s.part(col,q=>{q.ell(11+x,14+y,5,4);q.ell(16+x,9+y,3.2,3.2)});                                  /* corps et tête */
      s.part("#fff2c2",q=>q.ell(12+x,16+y,3,2),{flat:1});
      s.part(fl[0],q=>{q.poly([[15+x,6+y],[14+x,2+y],[17+x,5+y]]);q.poly([[17+x,6+y],[18+x,2+y],[19+x,6+y]])});   /* crête */
      s.part("#ffd36a",q=>q.poly([[19+x,9+y],[22+x,10+y],[19+x,11+y]]),{flat:1});                          /* bec */
      s.set(17+x,8+y,B);
      /* aile avant : monte et descend */
      const ty=Math.round(P.w*8);s.part(mix(col,"#ffffff",.25),q=>q.poly([[10+x,12+y],[2+x,5+y-ty],[5+x,9+y-Math.round(ty/2)],[8+x,12+y-Math.round(ty/3)],[14+x,14+y]]));
      s.part(fl[0],q=>{q.line(2+x,5+y-ty,5+x,8+y-Math.round(ty/2))},{flat:1});s.part(fl[1],q=>q.px(3+x,6+y-ty),{flat:1});
      s.part("#ffd36a",q=>{q.rect(10+x,19+y,1,2);q.rect(13+x,19+y,1,2)},{flat:1})}
    else if(id==="dragonnet"){const y=P.bob>0?1:0,x=P.fx,dk=mix(col,DARK,.35),bl="#ffe3b0";
      s.part(col,q=>{q.poly([[6+x,16+y],[2+x,14+y-Math.round(P.w)],[1+x,10+y-Math.round(P.w*2)],[3+x,12+y],[7+x,14+y]])});   /* queue */
      const wy=Math.round(P.w*4);s.part(dk,q=>q.poly([[10+x,11+y],[5+x,5+y-wy],[8+x,10+y],[12+x,12+y]]));                       /* aile */
      s.part(col,q=>{q.ell(11+x,15+y,5,4.5);q.ell(16+x,9+y,3.6,3.2);q.rect(17+x,9+y,4+(P.open?1:0),2)});                          /* corps, tête, museau */
      s.part(bl,q=>q.ell(11+x,17+y,3,2.2),{flat:1});
      s.part("#f7e4b8",q=>{q.poly([[14+x,6+y],[13+x,3+y],[15+x,5+y]]);q.poly([[17+x,6+y],[18+x,3+y],[18+x,6+y]])});                 /* cornes */
      s.set(17+x,8+y,B);if(P.open){s.set(21+x,11+y,"#e8483c");s.set(20+x,11+y,"#e8483c")}
      s.part(dk,q=>{q.rect(8+x,19+y,2,3);q.rect(13+x,19+y,2,3)});
      s.part(mix(col,"#ffffff",.25),q=>q.poly([[11+x,12+y],[7+x,6+y-wy],[10+x,11+y]]))}
    else{/* golem */const y=P.bob>0?1:0,x=P.fx,dk=mix(col,DARK,.35),gl="#7ae0ff",a=Math.round(P.arm*3);
      s.part(dk,q=>{q.rect(4,13+y+a,3,7);q.rect(17+x,12+y-a,3,7+(P.open?1:0))});                     /* bras */
      s.part(col,q=>{q.rect(7,9+y,10,10);q.clear(7,9+y,1,1);q.clear(16,9+y,1,1)});                  /* corps */
      s.part(col,q=>{q.rect(8,3+y,8,6)});                                                            /* tête */
      s.part(dk,q=>{q.rect(8,19+y,3,3);q.rect(13,19+y,3,3)});                                        /* jambes */
      s.part(mix(col,DARK,.5),q=>{q.line(9,12+y,12,15+y);q.line(14,10+y,13,13+y)},{flat:1});         /* fissures */
      s.set(10,6+y,gl);s.set(11,6+y,gl);s.set(13,6+y,gl);s.set(14,6+y,gl);
      if(P.open)s.part(gl,q=>q.px(18+x,20+y-a),{flat:1})}
    s.outline();s.shadow(12,22,6,1.2);return cache[k]=s.url()}
  const beastFrames=(id,col,anim)=>{const k="bfs:"+id+col+anim;return cache[k]||(cache[k]=Array.from({length:10},(_,f)=>beastF(id,col,anim,f)))};
  return{fish,monster,hero,heroF,heroFrames,beastF,beastFrames,monFrames,petFrames,fam,famFrames,strip,pickup,scene,tile,img,item,res,drop,key,potion,pet,ground:id=>(TH[id]||TH.prairie).g[0]};
})();

document.body.style.backgroundImage=`url(${PX.tile()})`;
let biomeId=null;
function setBiome(id){if(id===biomeId)return;biomeId=id;const b=document.body,c=mix2(PX.ground(id));b.style.backgroundImage=`url(${PX.tile(id)})`;b.style.backgroundColor=c;document.documentElement.style.backgroundColor=c;ambReset()}
function mix2(hex){const n=parseInt(hex.slice(1),16),f=v=>Math.round(v*.82);return`rgb(${f(n>>16)},${f(n>>8&255)},${f(n&255)})`}
function monsterSVG(m){return PX.img(PX.monster(m))}
const EMB={guerrier:'<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M9 1h6v1h-6zM8 2h7v1h-7zM8 3h2v1h-2zM13 3h2v1h-2zM7 4h2v1h-2zM13 4h2v1h-2zM7 5h2v1h-2zM13 5h2v1h-2zM6 6h2v1h-2zM13 6h2v1h-2zM6 7h2v1h-2zM12 7h3v1h-3zM3 8h1v1h-1zM5 8h2v1h-2zM11 8h3v1h-3zM2 9h5v1h-5zM10 9h3v1h-3zM3 10h3v1h-3zM9 10h3v1h-3zM3 11h4v1h-4zM8 11h3v1h-3zM2 12h8v1h-8zM1 13h3v1h-3zM5 13h4v1h-4zM1 14h2v1h-2zM6 14h2v1h-2z"/>',
  archer:'<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M3 1h2v1h-2zM3 2h4v1h-4zM10 2h4v1h-4zM3 3h6v1h-6zM11 3h3v1h-3zM4 4h10v1h-10zM5 5h7v1h-7zM13 5h1v1h-1zM6 6h6v1h-6zM3 7h10v1h-10zM1 8h6v1h-6zM8 8h5v1h-5zM2 9h1v1h-1zM7 9h7v1h-7zM7 10h2v1h-2zM10 10h4v1h-4zM7 11h2v1h-2zM11 11h4v1h-4zM7 12h2v1h-2zM12 12h3v1h-3zM6 13h2v1h-2zM7 14h1v1h-1z"/>',
  mage:'<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M7 2h2v1h-2zM7 3h2v1h-2zM7 4h2v1h-2zM4 5h8v1h-8zM3 6h10v1h-10zM4 7h8v1h-8zM5 8h6v1h-6zM5 9h6v1h-6zM5 10h6v1h-6zM5 11h2v1h-2zM9 11h2v1h-2z"/>',
  gardien:'<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M7 1h2v1h-2zM5 2h6v1h-6zM2 3h12v1h-12zM2 4h12v1h-12zM2 5h12v1h-12zM2 6h12v1h-12zM2 7h12v1h-12zM2 8h12v1h-12zM2 9h12v1h-12zM2 10h12v1h-12zM3 11h10v1h-10zM4 12h8v1h-8zM5 13h6v1h-6zM7 14h2v1h-2z"/>'};
const ELG={feu:'<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M7 2h2v1h-2zM7 3h2v1h-2zM7 4h3v1h-3zM7 5h3v1h-3zM5 6h1v1h-1zM7 6h4v1h-4zM5 7h6v1h-6zM5 8h6v1h-6zM5 9h6v1h-6zM5 10h6v1h-6zM6 11h4v1h-4z"/>',
  eau:'<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M7 2h2v1h-2zM6 3h4v1h-4zM6 4h4v1h-4zM5 5h6v1h-6zM4 6h8v1h-8zM4 7h8v1h-8zM4 8h8v1h-8zM3 9h10v1h-10zM3 10h10v1h-10zM4 11h8v1h-8zM4 12h8v1h-8zM5 13h6v1h-6zM7 14h2v1h-2z"/>',
  terre:'<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M5 5h2v1h-2zM5 6h2v1h-2zM10 6h1v1h-1zM4 7h4v1h-4zM9 7h3v1h-3zM4 8h8v1h-8zM3 9h10v1h-10zM3 10h10v1h-10zM2 11h12v1h-12zM2 12h12v1h-12z"/>',
  air:'<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M8 0h2v1h-2zM7 1h5v1h-5zM6 2h3v1h-3zM10 2h2v1h-2zM6 3h2v1h-2zM10 3h2v1h-2zM2 4h10v1h-10zM1 5h10v1h-10zM1 8h13v1h-13zM2 9h13v1h-13zM9 10h2v1h-2zM13 10h2v1h-2zM1 11h6v1h-6zM9 11h6v1h-6zM1 12h6v1h-6zM10 12h4v1h-4zM11 13h2v1h-2z"/>',
  neutre:'<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M7 2h2v1h-2zM5 3h6v1h-6zM4 4h3v1h-3zM9 4h3v1h-3zM3 5h2v1h-2zM11 5h2v1h-2zM3 6h2v1h-2zM11 6h2v1h-2zM2 7h2v1h-2zM12 7h2v1h-2zM2 8h2v1h-2zM12 8h2v1h-2zM3 9h2v1h-2zM11 9h2v1h-2zM3 10h2v1h-2zM11 10h2v1h-2zM4 11h3v1h-3zM9 11h3v1h-3zM5 12h6v1h-6zM7 13h2v1h-2z"/>'};
const elChip=(e,txt)=>`<span class="elc" data-tip="el:${e}" style="--c:${ELEMS[e].c}"><svg viewBox="0 0 24 24" aria-hidden="true">${ELG[e]}</svg>${txt??ELEMS[e].n}</span>`;
function monRes(monEl,atk){if(atk==="neutre")return 0;if(BEATS[atk]===monEl)return RES_WEAK-(S&&S.tal?talV("t_elem"):0);if(atk===monEl)return RES_SELF;if(BEATS[monEl]===atk)return RES_STRONG;return 0}
const weakTo=e=>Object.keys(BEATS).find(k=>BEATS[k]===e);
function heroSVG(k){return PX.img(PX.hero(k,CLASSES[k].col),"herofig")}
const emb=(k,size=40)=>`<span class="emb" style="width:${size}px;height:${size}px;background:${shade(CLASSES[k].col,-.55)};color:${CLASSES[k].col}"><svg viewBox="0 0 24 24">${EMB[k]}</svg></span>`;

