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
    /* msk(m=>{…formes…}) : masque des pixels couverts par les formes (rect, ell, poly, line, px, clear) */
    msk(fn){
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
      fn(m);return M}
    /* part(couleur, m=>{…formes…}, {flat}) : dessine un masque puis l'ombre en 3 tons */
    part(col,fn,o={}){
      const w=this.w,h=this.h,M=this.msk(fn);
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
    /* vol(couleur, m=>{…formes…}, {r,sp}) : comme part(), mais ombré en volume (5 tons) d'après la distance au bord,
       lumière en haut à gauche. r = rayon du bombé (par défaut la demi-épaisseur de la forme), sp:0 = sans reflet. */
    vol(col,fn,o={}){
      const w=this.w,h=this.h,M=this.msk(fn),D=new Float32Array(w*h),at=(x,y)=>x>=0&&y>=0&&x<w&&y<h?D[y*w+x]:0;let mx=0;
      for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if(M[i])D[i]=Math.min(at(x-1,y)+1,at(x,y-1)+1,at(x-1,y-1)+1.4,at(x+1,y-1)+1.4)}
      for(let y=h-1;y>=0;y--)for(let x=w-1;x>=0;x--){const i=y*w+x;if(M[i]){D[i]=Math.min(D[i],at(x+1,y)+1,at(x,y+1)+1,at(x+1,y+1)+1.4,at(x-1,y+1)+1.4);if(D[i]>mx)mx=D[i]}}
      if(!mx)return this;
      const R=Math.max(1.5,o.r??mx),Z=(x,y)=>{const t=Math.min(at(x,y),R)/R;return Math.sqrt(1-(1-t)*(1-t))*R};
      const b=rgb(col),T=[mix(b,"#1a0c2e",.6),mix(b,"#2b1842",.33),b,mix(b,"#fff0c0",.36),mix(b,"#ffffff",.66)];
      for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if(!M[i])continue;const zx=(Z(x+1,y)-Z(x-1,y))/2,zy=(Z(x,y+1)-Z(x,y-1))/2,I=(zx*.56+zy*.72+.42)/Math.hypot(zx,zy,1);
        this.p[i]=T[I>.86&&o.sp!==0?4:I>.62?3:I>.2?2:I>-.25?1:0]}
      return this}
    shadow(cx,cy,rx,ry){this.sh.push([cx,cy,rx,ry]);return this}
    outline(col=INK){const w=this.w,h=this.h,add=[];for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(!this.p[y*w+x]&&(this.get(x+1,y)||this.get(x-1,y)||this.get(x,y+1)||this.get(x,y-1)))add.push(y*w+x);const c=rgb(col);add.forEach(i=>this.p[i]=c);return this}
    blit(s,ox,oy){for(let y=0;y<s.h;y++)for(let x=0;x<s.w;x++){const c=s.p[y*s.w+x];if(c)this.set(ox+x,oy+y,c)}return this}
    cvs(){const c=document.createElement("canvas");c.width=this.w;c.height=this.h;const x=c.getContext("2d"),I=x.createImageData(this.w,this.h),D=I.data;
      this.sh.forEach(([cx,cy,rx,ry])=>{for(let y=Math.floor(cy-ry);y<=cy+ry;y++)for(let xx=Math.floor(cx-rx);xx<=cx+rx;xx++){const dx=(xx-cx)/(rx+.35),dy=(y-cy)/(ry+.35);if(dx*dx+dy*dy<=1&&xx>=0&&y>=0&&xx<this.w&&y<this.h){const i=(y*this.w+xx)*4;D[i]=30;D[i+1]=14;D[i+2]=40;D[i+3]=95}}});
      this.p.forEach((q,i)=>{if(q){D[i*4]=q[0];D[i*4+1]=q[1];D[i*4+2]=q[2];D[i*4+3]=255}});x.putImageData(I,0,0);return c}
    url(){return this.cvs().toDataURL()}
  }

  /* ---------- Monstres (40×40, tournés vers le héros à gauche) ---------- */
  /* Chaque monstre garde sa forme (shape), son attribut (ft) et sa couleur ; MLOOK ajoute une variante de dessin (k)
     pour que la bête ressemble à son nom : mouton, renard, crapaud, scarabée, hibou, abeille, cactus, tortue, etc.
     Les volumes sont ombrés par Spr.vol() (lumière en haut à gauche), les détails posés par-dessus. */
  const MLOOK={pompon:"wool",boss_0:"wool",renardine:"fox",fennecil:"fox",taupineur:"mole",glandouille:"nut",crapoteux:"frog",grenouflon:"frog",dendrobulle:"frog",boss_2:"frog",
    lucioleux:"bug",scaraboule:"bug",boss_4:"bug",etincelot:"fire",braisillon:"fire",baudrillon:"maw",limaconne:"snail",phoquin:"seal",magmoule:"lava",
    hiboulet:"owl",pingouflet:"penguin",coquelor:"rooster",perroflor:"parrot",blizzaron:"fly",albatrombe:"fly",mirageon:"fly",
    cactoche:"cactus",anemonix:"anemone",trefloche:"clover",bourdonnet:"bee",libellune:"dragonfly",grimoireau:"book",boss_6:"eagle",
    tigrelin:"tiger",dromadou:"camel",loupivre:"wolf",macaquin:"monkey",mulotin:"mouse",gargouillon:"wings",sphinxou:"wings",chevrock:"goat",
    ecorcin:"treant",boss_1:"treant",vasard:"mud",rouillard:"robot",boss_3:"robot",sablin:"sand",bambouin:"bamboo",hippocampin:"seahorse",
    herissoc:"hedgehog",oursinet:"urchin",tortecaille:"turtle",scorillon:"magma",boss_9:"magma",charbonnet:"magma",obsidien:"magma",
    nuageon:"cloud",brumelin:"cloud",fumerol:"cloud",grisouille:"cloud",tourbillard:"whirl",feuxfollet:"wisp",
    sangsuel:"worm",vrillon:"worm",salamandrin:"lizard",murenard:"eel",scorpiaf:"scorpion",videgueule:"maw",
    poulpinet:"octopus",ombrelin:"dark",abyssal:"dark",boss_11:"dark",lanternix:"lantern"};
  /* couleur plus franche et un peu plus sombre que la couleur de base du monstre */
  const rich=c=>{const[r,g,b]=rgb(c),y=.3*r+.59*g+.11*b;return[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round((y+(v-y)*1.3)*.94))))};
  function monster(m){
    const k="m:"+m.id+m.c+(m.crown?1:0);if(cache[k])return cache[k];
    const s=new Spr(40,40),K=MLOOK[m.id]||"",c=rich(m.c),ink=mix(c,INK,.86),F={flat:1},TAU=Math.PI*2;
    const V=(col,fn,o)=>s.vol(col,fn,o),P=(col,fn,o)=>s.part(col,fn,o),px=(x,y,col)=>s.set(Math.round(x),Math.round(y),col);
    const d1=mix(c,"#2b1842",.3),d2=mix(c,"#1a0c2e",.58),l1=mix(c,"#fff0c0",.42),bel=mix(c,"#fff4dc",.55),W="#ffffff",B="#1c1020",BONE="#f1e4bf",MAW="#2a0c1c",OR="#f2a02c";
    const E={feu:"#ffb22e",eau:"#8feaff",terre:"#ffe14a",air:"#f4f4ff"}[m.el]||"#ffe14a";      /* lueur des yeux selon l'élément */
    let top=14,hx=20,ft=m.ft;                                                                 /* sommet et centre de la tête : attributs et couronne s'y accrochent */
    s.shadow(20,37,12,2);
    /* yeux : 0 = œil blanc à pupille et sourcil froncé (d = côté où le sourcil descend), 1 = lueur dans une orbite sombre, 2 = simple lueur */
    const eye=(x,y,t=0,d=1)=>{
      if(t===0){P(W,q=>q.rect(x,y,3,3),F);px(x,y+1,B);px(x+1,y+1,B);px(x,y+2,B);px(x+1,y+2,B);for(let i=0;i<3;i++)px(x+i,y-1,ink);px(d>0?x+2:x,y,ink)}
      else if(t===1){P(B,q=>q.rect(x,y,4,3),F);px(x+1,y+1,W);px(x+2,y+1,E);px(x+1,y+2,E);px(x+2,y+2,E)}
      else{px(x,y,W);px(x+1,y,E);px(x,y+1,E);px(x+1,y+1,E)}};
    /* gueule sombre garnie de dents */
    const maw=(x,y,w,h=3)=>{P(MAW,q=>q.rect(x,y,w,h),F);for(let i=1;i<w-1;i+=2)px(x+i,y,W);if(h>2)for(let i=2;i<w-1;i+=2)px(x+i,y+h-1,W)};
    /* teinte (rayures, taches) posée sur ce qui est déjà dessiné, limitée à une forme */
    const tint=(col,a,fa,fb)=>{const A=s.msk(fa),C=fb?s.msk(fb):null;for(let i=0;i<A.length;i++)if(A[i]&&(!C||C[i])&&s.p[i])s.p[i]=mix(s.p[i],col,a)};
    const mir=pts=>pts.map(([x,y])=>[40-x,y]);
    const fire=(c1,c2)=>{V(c1,q=>{q.poly([[8,30],[10,20],[13,24],[15,12],[19,18],[21,5],[25,16],[28,11],[30,22],[32,18],[33,30]]);q.ell(20.5,29,12.5,7)},{r:6});
      V(c2,q=>{q.poly([[13,31],[15,22],[18,25],[21,14],[24,24],[27,21],[28,31]]);q.ell(20.5,31,7.5,4.5)},{r:4,sp:0});P("#fff6c8",q=>q.ell(20.5,32.5,4.5,2.5),F);
      P(B,q=>{q.rect(14,26,3,3);q.rect(23,26,3,3);q.rect(18,31,5,2)},F);px(16,26,c2);px(23,26,c2);px(14,27,E);px(23,27,E)};
    /* attributs : oreilles, cornes, antennes, flamme, cristaux (derrière le corps) ; feuilles (devant) */
    const back=()=>{const T0=top;
      if(ft==="ears"){top=Math.max(T0,7);V(c,q=>{q.poly([[hx-9,top+6],[hx-8,top-6],[hx-2,top+2]]);q.poly([[hx+9,top+6],[hx+8,top-6],[hx+2,top+2]])},{r:3});P("#f08a8a",q=>{q.poly([[hx-7,top+3],[hx-7,top-2],[hx-4,top+2]]);q.poly([[hx+7,top+3],[hx+7,top-2],[hx+4,top+2]])},F)}
      if(ft==="horns"){top=Math.max(T0,9);V(BONE,q=>{q.poly([[hx-8,top+5],[hx-12,top-1],[hx-11,top-8],[hx-8,top-3],[hx-3,top+2]]);q.poly([[hx+8,top+5],[hx+12,top-1],[hx+11,top-8],[hx+8,top-3],[hx+3,top+2]])},{r:2})}
      if(ft==="antenna"){top=Math.max(T0,9);P(d2,q=>{q.line(hx-3,top+2,hx-7,top-5);q.line(hx+3,top+2,hx+7,top-5)},F);V("#fff39a",q=>{q.ell(hx-7.5,top-6.5,1.7,1.7);q.ell(hx+7.5,top-6.5,1.7,1.7)},{r:2})}
      if(ft==="flame"){top=Math.max(T0,10);V("#ff6a1c",q=>q.poly([[hx-5,top+4],[hx-4,top-3],[hx-1,top],[hx+1,top-9],[hx+4,top-1],[hx+5,top+4]]),{r:3});P("#ffd84a",q=>q.poly([[hx-2,top+4],[hx,top-3],[hx+2,top+4]]),F)}
      if(ft==="crystal"){top=Math.max(T0,12);V(mix(c,"#d8f6ff",.6),q=>{q.poly([[hx-8,top+4],[hx-6,top-8],[hx-2,top+4]]);q.poly([[hx-1,top+3],[hx+3,top-11],[hx+7,top+3]])},{r:1.6})}top=T0};
    const front=()=>{if(ft==="leaf"){top=Math.max(top,8);P("#3f7d33",q=>q.line(hx,top+1,hx,top-3),F);V("#74c95c",q=>{q.ell(hx-4,top-5,4,2);q.ell(hx+4,top-6,4,2)},{r:2})}};

    if(m.shape==="blob"){
      if(K==="frog"){top=16;ft=ft==="horns"?"":ft;
        V(d1,q=>{q.ell(8,31,4.5,5);q.ell(32,31,4.5,5)});V(c,q=>{q.ell(20,28,13,8.5);q.ell(13,19,4.2,4.2);q.ell(27,19,4.2,4.2)},{r:7});
        V(bel,q=>q.ell(20,32.5,9,3.6),{r:3,sp:0});P(d2,q=>{q.line(9,28,31,28);q.px(8,27);q.px(32,27)},F);
        V(c,q=>{q.ell(9,35.5,4,1.7);q.ell(31,35.5,4,1.7)},{r:2});[6,9,12,28,31,34].forEach(x=>px(x,36,d2));
        if(m.id!=="crapoteux")[[16,24],[23,23],[20,21],[28,25],[11,25]].forEach(([x,y])=>P(m.id==="dendrobulle"?"#1c1020":d2,q=>q.ell(x,y,1.2,.9),F));
        eye(12,18,0,1);eye(26,18,0,-1);if(m.crown)V(BONE,q=>{q.poly([[7,20],[4,12],[9,17]]);q.poly([[33,20],[36,12],[31,17]])},{r:2})}
      else if(K==="bug"){top=15;hx=23;ft=ft==="horns"?"":ft;
        P(d2,q=>{[[14,31,9,36],[20,33,18,37],[27,33,30,37],[32,30,36,36]].forEach(a=>q.line(a[0],a[1],a[2],a[3],2))},F);
        if(m.id==="lucioleux")V("#fff07a",q=>q.ell(32,28,5,5.5),{r:4});
        V(c,q=>{q.ell(23,26,12,10);q.clear(0,34,40,6)},{r:9});P(d2,q=>q.line(22,16,24,33),F);P(mix(c,W,.7),q=>{q.ell(16,20,2.4,1.4);q.px(28,19)},F);
        V(d2,q=>q.ell(10,29,5,4.5),{r:4});V(m.id==="lucioleux"?d2:BONE,q=>q.poly([[8,26],[2,17],[5,16],[11,25]]),{r:2});P(BONE,q=>{q.line(6,31,2,32);q.line(6,33,3,35)},F);eye(8,28,2)}
      else if(K==="fire"){top=8;ft="";fire(c,"#ffd84a")}
      else if(K==="maw"){top=15;hx=23;
        V(d1,q=>{q.poly([[30,24],[38,17],[37,26],[38,34],[30,30]]);q.poly([[18,18],[23,9],[29,18]])},{r:3});back();ft="";V(c,q=>q.ell(20,26,13,10.5),{r:9});V(bel,q=>q.ell(22,33,8,3),{r:2,sp:0});
        V(d1,q=>q.ell(27,29,3.5,2.2),{r:2});maw(5,26,16,5);[6,10,14,18].forEach(x=>px(x,27,W));eye(10,19,1)}
      else if(K==="wool"){top=11;
        P(d2,q=>{q.rect(13,32,3,5);q.rect(24,32,3,5)},F);back();ft="";
        [[20,25,10],[12,19,5],[20,15,5.5],[28,18,5],[32,25,4.5],[28,31,5],[20,32,5],[10,26,4.5]].forEach(([x,y,r],i)=>V(c,q=>q.ell(x,y,r,i?r*.9:8),{r:i?3:6}));
        V("#54424e",q=>{q.ell(13,28,5.5,4.5);q.ell(7,24,2.2,1.4);q.ell(19,23.5,2.2,1.4)},{r:4});px(9,29,"#f0a0a8");px(10,29,"#f0a0a8");eye(10,25,2);eye(15,25,2)}
      else if(K==="fox"){top=13;hx=16;
        V(c,q=>q.poly([[28,33],[35,19],[39,23],[38,33],[32,37]]),{r:4});V("#fff4e0",q=>q.poly([[34,20],[36,17],[39,22],[37,25]]),{r:2});
        V(c,q=>q.ell(23,29,9,7.5),{r:6});V("#fff4e0",q=>q.ell(18,31,4.5,4.5),{r:3,sp:0});V(d2,q=>{q.ell(15,35.5,3.2,1.7);q.ell(25,35.5,3.2,1.7)},{r:2});
        if(m.id==="fennecil"){V(c,q=>{q.poly([[7,19],[3,2],[13,12]]);q.poly([[25,19],[30,2],[19,12]])},{r:3});P("#f08a8a",q=>{q.poly([[7,15],[5,6],[11,13]]);q.poly([[25,15],[28,6],[21,13]])},F);ft=""}
        back();ft="";V(c,q=>{q.ell(16,20,8,6.5);q.poly([[10,19],[3,24],[10,26]])},{r:5});V("#fff4e0",q=>q.poly([[9,23],[3,24.5],[9,27],[15,26]]),{r:2,sp:0});
        px(3,24,B);px(4,24,B);eye(10,17,0,1);eye(17,17,0,-1)}
      else if(K==="mole"){top=17;
        back();ft="";V(c,q=>q.ell(22,27,12.5,9.5),{r:8});V(bel,q=>q.ell(19,32,6,3.5),{r:2,sp:0});V("#f0a0a8",q=>q.poly([[11,23],[3,27],[11,31]]),{r:2});px(3,27,"#c8607a");px(4,27,"#c8607a");
        P(BONE,q=>{[[9,32],[12,33],[15,34],[29,34],[32,33]].forEach(([x,y])=>q.line(x,y,x-2,y+3))},F);P(W,q=>{q.line(8,25,4,23);q.line(8,29,4,31)},F);eye(12,21,2);eye(18,20,2)}
      else if(K==="nut"){top=9;
        V(d1,q=>{q.ell(15,36,3.5,1.5);q.ell(25,36,3.5,1.5)});V(c,q=>{q.ell(20,26,10,10);q.poly([[14,33],[20,37],[26,33]])},{r:8});
        V(mix(c,"#3a2416",.55),q=>{q.ell(20,17,12,7.5);q.clear(0,20,40,20);q.rect(8,19,25,2)},{r:5});P(d2,q=>q.rect(19,6,2,4),F);
        [[12,15],[16,13],[20,12],[24,13],[28,15],[14,17],[18,16],[22,16],[26,17]].forEach(([x,y])=>px(x,y,l1));ft="";eye(13,23,0,1);eye(23,23,0,-1);maw(15,29,10,3)}
      else{top=13;
        V(d1,q=>{q.ell(13,35.5,4.2,1.8);q.ell(27,35.5,4.2,1.8)});back();
        V(c,q=>{q.ell(20,26,12.5,10.5);q.poly([[9,20],[6,14],[13,17]]);q.poly([[14,17],[15,10],[19,15]]);q.poly([[21,15],[25,10],[26,16]]);q.poly([[27,17],[33,13],[31,20]]);q.poly([[8,25],[3,28],[8,30]]);q.poly([[32,25],[37,28],[32,30]])},{r:9});
        V(bel,q=>q.ell(20,32,6.5,3.6),{r:3,sp:0});V(c,q=>{q.ell(6,31,3,3.5);q.ell(34,31,3,3.5)},{r:2});[[4,34],[6,35],[34,35],[36,34]].forEach(([x,y])=>px(x,y,BONE));
        eye(12,21,0,1);eye(22,21,0,-1);maw(13,27,11,3)}}
    else if(m.shape==="slime"){
      if(K==="snail"){top=19;hx=9;const sh=mix(c,"#9a4a2a",.55);
        V(sh,q=>q.ell(25,21,10,10),{r:8});for(let a=0;a<TAU*2.2;a+=.22){const r=8.5-a*.56;px(25+Math.cos(a)*r,21+Math.sin(a)*r,mix(sh,INK,.6))}
        V(c,q=>{q.poly([[3,36],[5,31],[10,28],[34,31],[38,36]]);q.ell(9,25,3.6,6)},{r:4});px(7,28,B);px(8,29,B);px(9,29,B);P(mix(c,W,.6),q=>q.rect(14,33,16,1),F)}
      else if(K==="seal"){top=15;hx=10;ft="";
        V(d1,q=>{q.poly([[31,30],[39,25],[38,31],[39,36],[32,34]])},{r:2});V(c,q=>q.poly([[5,35],[3,24],[7,17],[14,16],[18,21],[28,26],[35,29],[34,35],[12,37]]),{r:7});
        V(bel,q=>q.ell(10,31,5,4),{r:3,sp:0});V(d1,q=>q.poly([[17,30],[25,36],[16,36]]),{r:2});px(4,22,B);px(5,22,B);P(W,q=>{q.line(6,24,2,25);q.line(6,25,3,28)},F);eye(8,19,0,1)}
      else{top=15;back();
        V(c,q=>{q.ell(20,27,14,9.5);q.rect(7,30,27,5);q.rect(9,35,3,2);q.rect(15,35,2,1);q.rect(22,35,4,2);q.rect(30,35,2,1)},{r:9});
        P(mix(c,W,.78),q=>{q.ell(12.5,22,2.8,1.6);q.px(17,19);q.px(18,19);q.px(27,21)},F);P(d1,q=>{q.ell(27,31,2,1.4);q.ell(14,32,1.4,1)},F);
        if(K==="lava"){P("#3a2030",q=>{q.ell(25,23,5,2.4);q.ell(13,28,3,1.6);q.ell(29,30,3,1.8)},F);P("#ffe27a",q=>{q.line(9,31,13,33);q.line(13,33,18,31);q.line(22,33,27,34);q.line(19,24,21,27)},F)}
        P(B,q=>{q.rect(13,25,3,3);q.rect(22,25,3,3)},F);px(13,25,W);px(22,25,W);px(15,24,ink);px(22,24,ink);P(d2,q=>{q.rect(16,31,7,1);q.px(15,30);q.px(23,30)},F)}}
    else if(m.shape==="bird"){
      if(K==="owl"){top=9;
        P(OR,q=>{q.rect(14,35,5,2);q.rect(22,35,5,2)},F);V(d1,q=>{q.ell(9,25,4,9);q.ell(31,25,4,9)},{r:3});back();V(c,q=>q.ell(20,25,10.5,11),{r:8});
        V(bel,q=>q.ell(20,29,6.5,6.5),{r:4,sp:0});[[17,27],[23,27],[20,30],[16,32],[24,32]].forEach(([x,y])=>{px(x,y,d1);px(x+1,y+1,d1);px(x-1,y+1,d1)});
        V(c,q=>q.ell(20,15,10,7.5),{r:6});V(l1,q=>{q.ell(15,15,4.2,4.2);q.ell(25,15,4.2,4.2)},{r:3,sp:0});
        [13,23].forEach(x=>{P(E,q=>q.rect(x+1,14,3,3),F);px(x+2,15,B);px(x+2,16,B);px(x+1,14,W)});P(d2,q=>{q.line(11,11,18,13);q.line(29,11,22,13)},F);V(OR,q=>q.poly([[19,17],[22,17],[20.5,21]]),{r:2})}
      else if(K==="penguin"){top=7;hx=19;
        P(OR,q=>{q.rect(13,35,6,2);q.rect(21,35,6,2)},F);V(d1,q=>{q.poly([[10,18],[4,29],[8,31],[12,24]]);q.poly([[30,18],[36,29],[32,31],[28,24]])},{r:2});
        V(c,q=>{q.ell(20,24,10,12.5);q.ell(19,13,7.5,6.5)},{r:8});V("#f4f6fa",q=>q.ell(19,26,6.5,9),{r:5,sp:0});V("#f4f6fa",q=>q.ell(16,14,4.2,3.2),{r:3,sp:0});
        V(OR,q=>q.poly([[13,14],[6,16.5],[13,19]]),{r:2});px(15,12,B);px(16,12,B);px(15,13,B);px(14,11,ink);px(15,11,ink);px(16,11,ink);px(17,12,ink)}
      else{top=10;hx=13;const fly=K==="fly",roo=K==="rooster",par=K==="parrot";
        if(fly){V(d2,q=>q.poly([[15,19],[18,4],[25,8],[22,21]]),{r:2});V(d1,q=>q.poly([[20,21],[29,5],[38,9],[34,14],[38,17],[32,20],[34,24],[25,26]]),{r:3});P(d2,q=>{q.line(24,19,31,9);q.line(27,21,35,13)},F)}
        if(roo)[[30,27,37,9],[31,27,39,15],[31,28,39,23]].forEach(([a,b,x,y],i)=>V(i%2?d1:mix(c,"#2a4a3a",.6),q=>{q.line(a,b,(a+x)/2+2,(b+y)/2-3,3);q.line((a+x)/2+2,(b+y)/2-3,x,y,2)},{r:2}));
        else V(d1,q=>q.poly(par?[[29,25],[39,27],[39,36],[34,35],[30,31]]:[[29,24],[38,19],[39,24],[37,28],[30,31]]),{r:3});
        P(OR,q=>{q.rect(18,33,2,3);q.rect(24,33,2,3);q.rect(16,36,5,1);q.rect(22,36,5,1)},F);
        V(c,q=>q.ell(22,26,10,8.5),{r:7});V(bel,q=>q.ell(18,30,5.5,4),{r:3,sp:0});back();V(c,q=>q.ell(13,17,6.5,6.5),{r:5});
        if(!fly){V(d1,q=>q.poly([[19,22],[30,21],[34,27],[27,31],[20,29]]),{r:3});P(d2,q=>{q.line(22,25,31,25);q.line(22,27,29,28)},F)}
        if(par)V("#f2c84a",q=>q.poly([[9,14],[3,15],[1,20],[4,23],[9,21]]),{r:2});else V(OR,q=>q.poly([[8,15],[1,18.5],[8,21]]),{r:2});
        if(roo){V("#e83a3a",q=>{q.ell(10,10,2,2.6);q.ell(13.5,8.5,2.2,3.2);q.ell(17,10,2,2.6)},{r:2});V("#e83a3a",q=>q.ell(9,24,1.7,2.6),{r:1.5})}
        if(par||fly)V(K==="fly"?l1:"#f2c84a",q=>{q.poly([[12,11],[14,4],[17,11]]);q.poly([[15,12],[20,6],[19,13]])},{r:2});
        eye(9,14,0,1)}}
    else if(m.shape==="cap"){top=5;const st="#eadfc6";
      V(mix(st,"#2b1842",.25),q=>{q.ell(15,36,3.5,1.5);q.ell(25,36,3.5,1.5)});V(st,q=>{q.ell(8,28,2.6,3.6);q.ell(32,28,2.6,3.6)},{r:2});
      V(st,q=>q.poly([[14,20],[26,20],[29,32],[26,36],[14,36],[11,32]]),{r:7});P(mix(c,"#1a0c2e",.62),q=>q.rect(5,21,31,2),F);for(let x=6;x<35;x+=3)px(x,22,mix(c,W,.25));
      V(c,q=>{q.ell(20,17,17,12);q.clear(0,21,40,20)},{r:10});V("#fff1d8",q=>{q.ell(11,14,2.7,2);q.ell(21,9,3.1,2.3);q.ell(29,15,2.5,1.8);q.ell(16,18.5,1.5,1)},{r:2,sp:0});
      eye(13,25,0,1);eye(23,25,0,-1);maw(16,31,8,3)}
    else if(m.shape==="plant"){const G="#3f8f3a",G2="#5fb548";
      if(K==="cactus"){top=7;
        V(c,q=>{q.rect(5,18,6,4);q.rect(5,10,4,10);q.ell(7,10,2,2);q.rect(29,21,6,4);q.rect(31,13,4,10);q.ell(33,13,2,2)},{r:2.2});
        V(c,q=>{q.rect(13,12,14,25);q.ell(20,12,7,5)},{r:6});P(d1,q=>{q.line(17,10,17,36);q.line(23,10,23,36)},F);
        [[12,15],[12,22],[12,30],[27,17],[27,25],[27,33],[4,13],[9,12],[30,15],[35,16],[20,13],[20,21],[20,34]].forEach(([x,y])=>px(x,y,W));
        V("#ff7aa8",q=>q.ell(20,6,3.6,2.6),{r:2});px(20,6,"#ffe14a");eye(14,17,0,1);eye(22,17,0,-1);maw(15,24,10,3)}
      else if(K==="anemone"){top=5;
        for(let i=0;i<7;i++){const x0=10+i*3.3,x1=x0+Math.sin(i*1.9)*3+(i-3)*1.3,y1=6+(i%2)*3;V(i%2?c:l1,q=>{q.line(x0,24,(x0+x1)/2+(i%2?1.5:-1.5),15,3);q.line((x0+x1)/2+(i%2?1.5:-1.5),15,x1,y1,3)},{r:2});P(W,q=>q.ell(x1+1,y1+.5,1.2,1.2),F)}
        V(mix(c,"#2b1842",.28),q=>q.poly([[11,23],[29,23],[32,36],[8,36]]),{r:7});eye(14,27,0,1);eye(23,27,0,-1);maw(15,32,10,3)}
      else{top=4;hx=17;const clo=K==="clover",pc=clo?c:mix(c,"#fff0f4",.38);
        V(G2,q=>{q.poly([[20,35],[8,28],[2,31],[9,36]]);q.poly([[21,35],[33,28],[38,31],[32,36]])},{r:3});
        P(G,q=>{q.line(15,34,8,26);q.line(8,26,5,21);q.line(5,21,7,18);q.line(26,33,33,24);q.line(33,24,36,19);q.line(36,19,34,16)},F);[[6,24],[9,29],[35,22],[31,28]].forEach(([x,y])=>px(x,y,G2));
        V(G,q=>{q.line(20,36,21,29,3);q.line(21,29,18,22,3)},{r:2});
        if(clo)V(c,q=>{q.ell(9,12,6.5,6.5);q.ell(25,12,6.5,6.5);q.ell(17,5,6,4.5);q.ell(17,20,6.5,5)},{r:5});
        else{[[6,8],[17,2.5],[28,8],[29,18],[23,24],[7,20]].forEach(([x,y],i)=>V(i%2?pc:mix(pc,"#2b1842",.18),q=>q.ell(x,y,4.6,4),{r:3}));V(c,q=>q.ell(17,14,10,9),{r:8})}
        if(clo){V(mix(c,"#2b1842",.25),q=>q.ell(17,13,5.5,5),{r:4});eye(12,10,0,1);eye(19,10,0,-1);maw(13,15,9,3);ft=""}
        else{P(MAW,q=>q.poly([[4,13],[20,11],[23,16],[20,21],[5,20]]),F);[6,9,12,15,18].forEach(x=>{px(x,12.6,W);px(x,13.6,W)});[7,10,13,16,19].forEach(x=>{px(x,19.4,W);px(x,18.4,W)});P("#e8506a",q=>q.ell(14,16.5,4,1.2),F);eye(11,6,2);eye(19,5,2)}}}
    else if(m.shape==="bat"){
      if(K==="bee"){top=19;hx=8;
        V("#dff4ff",q=>{q.ell(19,12,6,4.6);q.ell(27,11.5,6.5,5)},{r:3,sp:0});P("#9ac8e0",q=>{q.line(15,13,23,11);q.line(23,13,32,10)},F);P(d2,q=>q.poly([[33,26],[39,29],[33,31]]),F);
        P(d2,q=>{q.line(13,27,11,33);q.line(17,28,17,34);q.line(22,31,24,35)},F);V(c,q=>q.ell(26,26,9,7),{r:6});tint(B,.85,q=>{q.rect(21,18,2,16);q.rect(26,18,2,16);q.rect(31,18,2,16)},q=>q.ell(26,26,9,7));
        V(mix(c,"#3a2a1a",.5),q=>q.ell(15,23,6,5.5),{r:4});back();ft="";V("#2a1c24",q=>q.ell(8.5,25,4.6,4.6),{r:4});eye(6,23,2);px(5,27,BONE);px(4,28,BONE)}
      else if(K==="dragonfly"){top=17;hx=9;
        V("#dff4ff",q=>{q.poly([[15,19],[20,3],[26,4],[21,20]]);q.poly([[19,20],[31,6],[37,9],[25,21]]);q.poly([[18,24],[30,31],[35,29],[23,22]])},{r:2,sp:0});P("#9ac8e0",q=>{q.line(18,17,22,6);q.line(22,19,33,9);q.line(21,24,32,29)},F);
        V(c,q=>q.line(18,22,37,27,3),{r:2});tint(B,.6,q=>{for(let x=22;x<38;x+=4)q.rect(x,20,1,10)});P(d2,q=>{q.line(13,24,10,30);q.line(16,25,16,31)},F);
        V(c,q=>q.ell(15,21.5,5,4.6),{r:4});back();ft="";V(d1,q=>q.ell(8.5,21.5,4.6,4.6),{r:4});V(E,q=>q.ell(6.5,19.5,2.6,2.6),{r:2});px(6,20,B)}
      else if(K==="book"){top=9;
        V(d1,q=>{q.poly([[9,17],[1,9],[2,20],[5,19],[8,24]]);q.poly(mir([[9,17],[1,9],[2,20],[5,19],[8,24]]))},{r:2});back();ft="";
        V(c,q=>q.poly([[8,13],[32,11],[33,32],[9,35]]),{r:3});P("#f4ead0",q=>q.poly([[10,30],[32,28],[33,32],[9,35]]),F);P("#b8a880",q=>{q.line(10,32,32,30);q.line(10,33,32,31)},F);
        P("#f2c14e",q=>{q.poly([[8,13],[13,13],[8,18]]);q.poly([[32,11],[27,11],[32,16]]);q.rect(19,12,2,17)},F);
        V("#f6f0e6",q=>q.ell(20,19,5,4),{r:3,sp:0});P(E,q=>q.ell(20,19,2.2,2.6),F);P(B,q=>q.rect(20,17,1,5),F);P(ink,q=>q.line(14,15,26,14),F);maw(12,25,17,3)}
      else{top=12;const eag=K==="eagle",wg=[[15,20],[8,9],[1,7],[2,15],[1,24],[5,21],[8,28],[11,24],[14,29]];
        V(eag?c:d1,q=>{q.poly(wg);q.poly(mir(wg))},{r:eag?4:3});
        if(eag){tint("#1a0c2e",.45,q=>{[[2,12,7,26],[5,10,10,27],[9,11,13,27]].forEach(a=>{q.line(a[0],a[1],a[2],a[3]);q.line(40-a[0],a[1],40-a[2],a[3])})});P(BONE,q=>{[[1,24],[5,21],[8,28],[11,24]].forEach(([x,y])=>{q.px(x,y);q.px(40-x,y)})},F)}
        else P(c,q=>{[[15,20,8,9],[8,9,1,7],[9,10,5,21],[10,12,11,24]].forEach(a=>{q.line(a[0],a[1],a[2],a[3]);q.line(40-a[0],a[1],40-a[2],a[3])})},F);
        if(ft!=="antenna"&&ft!=="horns"){V(c,q=>{q.poly([[14,17],[12,6],[18,13]]);q.poly([[26,17],[28,6],[22,13]])},{r:2});P("#f08a8a",q=>{q.poly([[14,14],[13,9],[16,13]]);q.poly([[26,14],[27,9],[24,13]])},F)}
        if(ft==="ears")ft="";back();
        V(c,q=>{q.ell(20,26,6.5,7.5);q.ell(20,18,7,6.5)},{r:6});V(mix(c,W,.25),q=>q.ell(20,27,3.5,4),{r:2,sp:0});P(eag?OR:d2,q=>{q.rect(16,33,3,3);q.rect(22,33,3,3)},F);
        eye(15,15,0,1);eye(22,15,0,-1);if(eag)V(OR,q=>q.poly([[18,19],[23,19],[20.5,24]]),{r:2});else{P(MAW,q=>q.rect(17,21,7,2),F);px(18,22,W);px(22,22,W);px(20,20,ink)}}}
    else if(m.shape==="quad"){top=11;hx=11;const pred=K==="wolf"||K==="tiger";
      if(K==="mouse")P("#e8a0a8",q=>{q.line(33,27,38,23);q.line(38,23,37,17);q.line(37,17,34,15)},F);
      else if(K==="monkey"||K==="tiger")V(c,q=>{q.line(33,24,37,18,2);q.line(37,18,36,11,2);if(K==="monkey")q.line(36,11,32,12,2)},{r:2});
      else if(K==="camel"||K==="goat")V(c,q=>q.line(33,23,36,27,2),{r:2});
      else V(c,q=>q.poly([[32,23],[38,14],[39,20],[36,27]]),{r:3});
      V(d2,q=>{q.rect(17,29,3,8);q.rect(29,29,3,8)},{r:2});
      if(K==="wings"){V(d1,q=>q.poly([[21,20],[19,5],[26,9],[30,4],[33,12],[37,10],[33,22]]),{r:3});P(c,q=>{q.line(21,20,19,5);q.line(22,19,30,4);q.line(24,19,37,10)},F)}
      if(K==="camel")V(c,q=>q.ell(25,18,5.5,5),{r:4});
      V(c,q=>q.ell(23,25,11,6.5),{r:6});V(bel,q=>q.ell(22,29.5,7,2),{r:2,sp:0});
      V(c,q=>{q.rect(13,28,4,9);q.rect(27,28,4,9)},{r:2});P(d2,q=>{q.rect(13,35,4,2);q.rect(27,35,4,2)},F);if(pred)[12,14,16,26,28,30].forEach(x=>px(x,36,BONE));
      if(K==="wolf")V(d1,q=>{q.poly([[15,20],[17,13],[20,19]]);q.poly([[20,20],[23,14],[26,20]]);q.poly([[26,20],[30,15],[31,21]])},{r:2});
      back();V(c,q=>{q.ell(11,18,6.5,6);q.poly([[6,16],[1,19.5],[2,23],[9,24]])},{r:5});
      if(K==="tiger"){tint(B,.8,q=>{[[17,19,16,30],[21,18,20,31],[25,18,25,31],[29,19,30,30],[35,19,38,17],[36,14,38,14]].forEach(a=>q.line(a[0],a[1],a[2],a[3]));q.line(10,12,12,15);q.line(14,12,14,15)});V("#fff4e0",q=>q.poly([[5,21],[2,23],[9,24]]),{r:1.5,sp:0})}
      if(K==="monkey")V(bel,q=>q.ell(8,19.5,4.2,4),{r:3,sp:0});
      if(K==="goat")P(BONE,q=>q.poly([[4,23],[5,29],[8,24]]),F);
      px(1,19,B);px(2,19,B);px(1,20,B);P(d2,q=>q.line(3,22,8,23),F);if(pred){px(4,23,W);px(6,24,W)}
      eye(K==="monkey"?7:8,15,0,1)}
    else if(m.shape==="tall"){
      if(K==="seahorse"){top=5;hx=18;
        V(c,q=>{q.line(22,27,24,32,4);q.ell(20,33,4.6,3.6);q.clear(19,32,3,2)},{r:2});V(mix(c,W,.4),q=>q.poly([[26,15],[34,18],[33,25],[26,27]]),{r:2});P(d1,q=>{q.line(27,18,33,20);q.line(27,22,33,23)},F);
        V(c,q=>q.ell(21,21,6.5,8.5),{r:5});V(bel,q=>q.ell(18.5,22,3,6.5),{r:2,sp:0});[17,20,23,26].forEach(y=>P(d1,q=>q.rect(16,y,5,1),F));
        back();V(c,q=>{q.ell(18,10,5.6,5.2);q.poly([[14,8.5],[4,12],[4,14.5],[14,13.5]])},{r:4});px(4,13,d2);eye(14,8,0,1)}
      else if(K==="robot"){top=4;hx=18;const me="#5a5468";
        V(d1,q=>{q.rect(12,30,6,7);q.rect(22,30,6,7)},{r:2});V(me,q=>{q.rect(11,35,8,2);q.rect(21,35,8,2)},{r:1.5});V(d1,q=>{q.rect(29,17,5,11);q.rect(30,28,4,5)},{r:2});
        V(c,q=>{q.rect(10,16,19,15);q.clear(10,16,1,1);q.clear(28,16,1,1)},{r:4});V(me,q=>q.rect(13,20,9,7),{r:2});px(15,22,E);px(16,22,E);px(19,22,"#e8483c");P(d2,q=>{q.line(14,25,20,25)},F);
        back();V(c,q=>{q.rect(11,5,14,10);q.clear(11,5,1,1);q.clear(24,5,1,1)},{r:3});P(B,q=>q.rect(12,8,11,3),F);px(14,9,E);px(15,9,E);px(14,8,W);px(19,9,E);px(20,9,E);P(me,q=>{q.rect(14,13,7,1);q.rect(17,2,1,3)},F);px(17,1,"#e8483c");
        V(c,q=>{q.rect(4,17,6,10)},{r:2.5});V(me,q=>{q.rect(5,27,4,4);q.poly([[3,31],[6,31],[4,36]]);q.poly([[7,31],[10,31],[9,36]])},{r:1.5});
        [[11,17],[27,17],[11,29],[27,29],[5,18],[23,6]].forEach(([x,y])=>px(x,y,l1));tint("#7a3a1a",.5,q=>{q.ell(25,27,3,2.5);q.ell(13,14,2,1.5);q.ell(7,24,2,2)})}
      else if(K==="bamboo"){top=5;
        P("#5fb548",q=>{q.line(13,20,5,14);q.line(27,24,35,18)},F);V("#74c95c",q=>{q.ell(4,13,3.2,1.6);q.ell(7,17,2.6,1.4);q.ell(36,17,3.2,1.6);q.ell(33,21,2.6,1.4)},{r:1.5});
        V(mix(c,"#2b1842",.3),q=>{q.rect(11,34,8,3);q.rect(21,34,8,3)},{r:1.5});V(c,q=>{q.rect(13,7,14,29);q.clear(13,7,1,1);q.clear(26,7,1,1)},{r:6});
        [15,24,31].forEach(y=>{P(d2,q=>q.rect(13,y,14,1),F);P(l1,q=>q.rect(14,y-1,12,1),F)});eye(15,17,0,1);eye(22,17,0,-1);maw(15,27,10,3)}
      else if(K==="mud"||K==="sand"){top=7;hx=19;const mu=K==="mud";
        V(d1,q=>q.ell(31,24,3.6,7.5),{r:3});back();
        V(c,q=>q.poly(mu?[[3,37],[6,31],[10,27],[11,14],[14,8],[19,5],[24,8],[27,14],[29,27],[33,31],[37,37]]:[[11,25],[11,14],[14,8],[19,5],[24,8],[27,14],[28,25],[25,30],[28,33],[21,37],[16,34],[19,30]]),{r:8});
        V(c,q=>q.ell(8,24,3.8,7.5),{r:3});if(mu){[[6,32],[8,34],[10,31],[30,33],[32,31]].forEach(([x,y])=>{px(x,y,d2)});P(mix(c,W,.5),q=>{q.ell(13,11,2,1.2);q.px(8,19)},F)}
        else{tint(d2,.4,q=>{q.line(12,27,26,25);q.line(18,31,26,31);q.line(17,35,22,35)});[[4,30],[33,29],[8,35],[31,35],[36,33]].forEach(([x,y])=>px(x,y,l1))}
        eye(12,12,1);eye(20,12,1);P(MAW,q=>{q.rect(14,18,9,mu?4:2);q.px(13,17);q.px(23,17)},F);if(mu){px(15,22,d2);px(19,22,d2);px(19,23,d2)}}
      else{top=6;hx=18;const tr=K==="treant";
        if(tr)V(d1,q=>{q.poly([[13,30],[7,37],[13,37],[18,32]]);q.poly([[26,30],[33,37],[26,37],[21,32]]);q.rect(17,31,6,6)},{r:2});
        else{V(d1,q=>{q.rect(13,30,5,7);q.rect(22,30,5,7)},{r:2});V(d2,q=>{q.ell(14,36,4,1.5);q.ell(24,36,4,1.5)},{r:1.5})}
        V(d1,q=>{q.ell(30,23,3.6,8)},{r:3});if(tr)P(d1,q=>{q.line(32,29,36,33);q.line(32,29,34,35);q.line(31,17,36,11)},F);
        V(c,q=>q.ell(20,23,9.5,9.5),{r:7});back();V(c,q=>q.ell(18,12,7,6.5),{r:5});
        V(c,q=>{q.ell(9,23,3.8,8.5);q.ell(8,32,3.6,3)},{r:3});if(tr)P(c,q=>{q.line(6,33,2,36);q.line(8,34,7,37);q.line(7,16,3,10);q.line(5,13,1,13)},F);else[5,7,9].forEach(x=>px(x,35,BONE));
        if(tr){tint(d2,.55,q=>{[[15,18,15,24],[19,20,19,28],[23,17,24,23],[25,26,25,30],[13,27,14,31],[9,20,9,27]].forEach(a=>q.line(a[0],a[1],a[2],a[3]))});eye(12,10,1);eye(19,10,1);P(MAW,q=>{q.poly([[13,15],[23,15],[20,18],[17,16],[15,18]])},F);
          if(m.crown)V("#4f9a3c",q=>{q.ell(11,6,4,3);q.ell(18,3,4.5,3);q.ell(25,6,4,3)},{r:2})}
        else{V(l1,q=>q.ell(19,25,5,5.5),{r:3,sp:0});eye(12,10,0,1);eye(20,10,0,-1);maw(13,15,10,3)}}}
    else if(m.shape==="spiky"){
      if(K==="hedgehog"){top=22;hx=13;ft="";
        V(d1,q=>{for(let i=0;i<11;i++){const a=-Math.PI*(.98-i*.1);q.poly([[23+Math.cos(a-.2)*9,27+Math.sin(a-.2)*7],[23+Math.cos(a)*16,27+Math.sin(a)*14],[23+Math.cos(a+.2)*9,27+Math.sin(a+.2)*7]])}},{r:2});
        V(d1,q=>q.ell(23,27,11,8),{r:6});for(let i=0;i<9;i++){const a=-Math.PI*(.9-i*.1);px(23+Math.cos(a)*14.5,27+Math.sin(a)*12.5,BONE);px(23+Math.cos(a+.15)*7,27+Math.sin(a+.15)*5,BONE)}
        V(bel,q=>{q.ell(12,29,6,5.2);q.poly([[8,27],[2,30.5],[8,33]])},{r:4});V(bel,q=>q.ell(14,23,2,2.2),{r:1.5});px(2,30,B);px(3,30,B);V(d2,q=>{q.ell(13,36,3,1.3);q.ell(27,36,3,1.3)},{r:1.5});eye(8,26,0,1)}
      else if(K==="urchin"){top=12;
        P(d1,q=>{for(let i=0;i<18;i++){const a=TAU*i/18+.1,y=26+Math.sin(a)*15;q.line(20,26,20+Math.cos(a)*17,Math.min(36,y))}},F);for(let i=0;i<18;i++){const a=TAU*i/18+.1,y=26+Math.sin(a)*15;if(y<36)px(20+Math.cos(a)*17,y,l1)}
        V(c,q=>q.ell(20,27,8.5,8),{r:7});eye(14,24,2);eye(22,24,2);P(MAW,q=>q.rect(17,30,6,2),F);px(18,30,W);px(21,30,W)}
      else{top=11;const cry=ft==="crystal",sc=cry?mix(c,"#e4faff",.6):mix(c,"#fff0c0",.3);
        for(let i=0;i<11;i++){const an=-Math.PI*1.12+i*Math.PI*1.24/10;V(i%2?sc:mix(sc,"#2b1842",.2),q=>q.poly([[20+Math.cos(an-.27)*8,26+Math.sin(an-.27)*8],[20+Math.cos(an)*(i%2?17:14.5),26+Math.sin(an)*(i%2?15:12.5)],[20+Math.cos(an+.27)*8,26+Math.sin(an+.27)*8]]),{r:cry?1.4:2})}
        if(cry)ft="";back();V(d1,q=>{q.ell(13,35.5,3.5,1.6);q.ell(27,35.5,3.5,1.6)});V(c,q=>q.ell(20,27,10.5,9.5),{r:8});
        if(ft==="leaf")V("#4f9a3c",q=>q.ell(20,35,15,2.2),{r:1.5});eye(13,23,0,1);eye(23,23,0,-1);maw(14,29,11,3)}}
    else if(m.shape==="golem"){
      if(K==="turtle"){top=13;hx=20;ft="";const sk=mix(c,"#e0e8a0",.5);
        V(mix(sk,"#2b1842",.25),q=>{q.rect(11,31,6,6);q.rect(26,31,6,6)},{r:2});P(sk,q=>q.poly([[34,28],[39,31],[34,32]]),F);
        V(sk,q=>q.ell(7,27,5.2,4.6),{r:4});V(c,q=>{q.ell(22,24,13.5,10.5);q.clear(0,30,40,10)},{r:9});V(mix(c,BONE,.55),q=>q.rect(9,29,27,3),{r:1.5});
        tint(d2,.6,q=>{q.line(15,17,15,28);q.line(22,14,22,28);q.line(29,17,29,28);q.line(11,22,34,22)});eye(4,24,0,1);P(d2,q=>q.line(2,29,6,30),F)}
      else{top=6;hx=18;const mg=K==="magma",gl=mg?(m.id==="charbonnet"?"#ff7a2c":m.id==="obsidien"?"#b48aff":"#ffc23a"):d2;
        V(d1,q=>{q.rect(12,29,7,8);q.rect(22,29,7,8)},{r:2.5});V(d1,q=>{q.ell(33,22,4,7);q.ell(34,31,4.5,4)},{r:3});back();
        V(c,q=>q.poly([[9,14],[14,10],[27,10],[32,15],[30,30],[11,30]]),{r:6});V(mix(c,W,.14),q=>q.poly([[13,5],[23,4],[26,9],[24,14],[14,14],[11,9]]),{r:3});
        V(c,q=>q.ell(6.5,21,4.2,7.5),{r:3.5});V(c,q=>q.poly([[2,27],[10,26],[12,33],[8,36],[2,35]]),{r:3});
        P(gl,q=>{q.line(14,17,17,20);q.line(17,20,16,24);q.line(16,24,19,27);q.line(24,15,26,19);q.line(26,19,24,22);q.line(22,27,25,29);q.line(5,18,7,22);q.line(4,30,8,32)},F);
        if(mg){P(m.id==="obsidien"?"#e9dcff":"#fff2a0",q=>{q.px(17,20);q.px(26,19);q.px(16,24)},F);P(gl,q=>{q.line(14,33,16,35);q.line(24,32,26,35)},F)}
        P(B,q=>q.rect(13,8,11,3),F);px(15,9,E);px(16,9,E);px(15,8,W);px(20,9,E);px(21,9,E);P(MAW,q=>q.rect(15,12,7,1),F)}}
    else if(m.shape==="ghost"){
      if(K==="wisp"){top=8;ft="";fire(c,mix(c,W,.6))}
      else if(K==="cloud"){top=11;back();
        if(m.id==="nuageon")P("#ffe14a",q=>q.poly([[21,31],[17,35],[20,35],[18,39],[24,33],[21,33],[23,31]]),F);else[[12,34],[18,36],[25,35],[30,33]].forEach(([x,y])=>{px(x,y,l1);px(x,y+1,l1)});
        [[11,25,6],[18,19,7.5],[27,21,6.5],[32,27,5],[13,29,5],[22,28,8.5]].forEach(([x,y,r])=>V(c,q=>q.ell(x,y,r,r*.85),{r:r*.8}));eye(13,22,0,1);eye(22,22,0,-1);maw(15,27,9,3)}
      else if(K==="whirl"){top=5;back();
        [[20,9,14,3.6],[21,14,12,3.6],[19,19,9.5,3.4],[21,24,7.5,3.2],[19,28,5.2,2.8],[21,32,3.3,2.3],[20,35.3,1.7,1.5]].forEach(([x,y,a,b],i)=>V(i%2?l1:c,q=>q.ell(x,y,a,b),{r:3}));
        [[4,22],[35,17],[32,30],[7,31],[37,25]].forEach(([x,y])=>px(x,y,d1));eye(13,11,1);eye(21,11,1);P(MAW,q=>q.rect(16,16,6,2),F)}
      else{top=5;hx=18;
        V(d1,q=>q.poly([[26,19],[36,13],[39,16],[30,25]]),{r:2});[[36,12],[38,13],[39,15]].forEach(([x,y])=>px(x,y,BONE));back();
        V(c,q=>q.poly([[9,15],[11,9],[18,5],[25,8],[28,15],[30,25],[37,31],[31,31],[33,36],[26,32],[23,37],[19,31],[14,36],[13,29],[8,31],[10,23]]),{r:8});
        V(c,q=>q.poly([[11,19],[2,16],[1,20],[9,26]]),{r:2.5});[[1,15],[0,18],[1,21]].forEach(([x,y])=>px(x,y,BONE));
        P(mix(c,"#12081e",.82),q=>q.ell(16,14,6.2,5.6),F);eye(12,12,2);eye(18,12,2);px(13,17,E);px(15,18,E);px(17,17,E);px(19,18,E)}}
    else if(m.shape==="snake"){
      if(K==="worm"){top=7;hx=12;const dr=ft==="crystal";
        [[33,33,4.5],[28,30,5],[23,26,5.5],[18,21,5.5],[14,16,5.6]].forEach(([x,y,r])=>V(c,q=>q.ell(x,y,r,r),{r:4}));V(c,q=>q.ell(11,13,6,6),{r:5});
        if(dr){V("#c9ced6",q=>q.poly([[7,9],[0,13],[7,18]]),{r:2});P("#8790a4",q=>{q.line(2,12,6,15);q.line(4,10,7,13)},F);eye(10,8,2);ft=""}
        else{P(MAW,q=>q.ell(8,13.5,3.6,4),F);[[6,10],[9,10],[5,13],[6,17],[9,17],[11,13]].forEach(([x,y])=>px(x,y,W));P("#e83a4a",q=>q.rect(7,13,2,2),F)}
        V(bel,q=>q.ell(21,25,2,1.6),{r:1.5,sp:0})}
      else if(K==="lizard"){top=17;hx=22;
        V(c,q=>{q.line(31,29,37,25,3);q.line(37,25,36,17,2);q.line(36,17,32,15,2)},{r:2});V(d1,q=>{q.rect(15,31,3,5);q.rect(28,31,3,5)},{r:1.5});back();
        V(c,q=>q.ell(22,28,11.5,5.5),{r:5});V(bel,q=>q.ell(21,31.5,8,1.6),{r:1.5,sp:0});V(c,q=>{q.rect(11,31,4,5);q.rect(24,31,4,5)},{r:2});[10,12,14,23,25,27].forEach(x=>px(x,36,BONE));
        V(c,q=>{q.ell(9,25,6,4.8);q.poly([[5,23],[0,26],[5,28]])},{r:4});[[18,25],[23,24],[28,26],[21,28]].forEach(([x,y])=>P("#ffe14a",q=>q.ell(x,y,1.3,1),F));eye(7,22,0,1);P(d2,q=>q.line(1,27,6,28),F)}
      else{top=4;hx=12;
        V(c,q=>q.poly([[31,31],[38,25],[39,28],[34,36]]),{r:2});V(d1,q=>q.ell(22,28,10.5,4.6),{r:4});V(c,q=>q.ell(21,32.5,13,4.5),{r:4});
        if(K==="eel")V(mix(c,W,.35),q=>q.poly([[22,27],[26,13],[21,6],[17,9],[21,16]]),{r:2});
        V(c,q=>q.poly([[15,29],[25,28],[23,18],[18,10],[10,10],[13,18]]),{r:5});P(bel,q=>{[[11,13],[12,16],[13,19],[14,22],[15,25]].forEach(([x,y])=>q.rect(x,y,4,1))},F);
        back();V(c,q=>{q.ell(12,9,6.5,5.2);q.poly([[7,7],[1,10.5],[7,13]])},{r:4});
        P(d2,q=>{[[13,32],[20,33],[27,32]].forEach(([x,y])=>q.poly([[x-2,y],[x,y-1.5],[x+2,y],[x,y+1.5]]))},F);if(K==="eel")[[19,20],[21,24],[17,14]].forEach(([x,y])=>P("#ffe14a",q=>q.ell(x,y,1.2,1),F));
        P(E,q=>q.rect(9,6,3,2),F);px(10,6,B);px(10,7,B);px(9,5,ink);px(10,5,ink);px(11,5,ink);px(12,6,ink);P("#e83a4a",q=>{q.line(2,12,0,14);q.px(0,12)},F);px(4,12,W);px(6,13,W)}}
    else if(m.shape==="crab"){top=17;const sco=K==="scorpion";
      V(d1,q=>{[[10,30,4,33],[4,33,3,37],[11,32,7,35],[7,35,7,37]].forEach(a=>{q.line(a[0],a[1],a[2],a[3],2);q.line(39-a[0],a[1],39-a[2],a[3],2)})},{r:1.5});
      if(sco){[[31,24,3.2],[35,19,3.2],[35,13,3.1],[31,8,2.9],[26,6,2.6]].forEach(([x,y,r])=>V(c,q=>q.ell(x,y,r,r),{r:2.5}));V(BONE,q=>q.poly([[25,5],[20,8],[19,13],[23,9]]),{r:1.5});ft=ft==="horns"?"":ft}
      V(c,q=>{q.line(10,26,6,21,3);q.line(30,26,34,21,3)},{r:2});
      [[6,15],[34,15]].forEach(([x,y],i)=>{V(c,q=>q.ell(x,y,5,5.6),{r:4});P(ink,q=>q.poly(i?[[35,10],[33,16],[34,10]]:[[5,10],[7,16],[6,10]]),F);px(i?34:6,10,BONE)});
      back();V(c,q=>q.ell(20,28,12.5,7.5),{r:6});[[14,25],[20,23],[26,25],[17,29],[24,30]].forEach(([x,y])=>px(x,y,l1));
      P(c,q=>{q.rect(15,19,2,4);q.rect(23,19,2,4)},F);[14,22].forEach(x=>{P(W,q=>q.rect(x,17,3,3),F);px(x,18,B);px(x+1,18,B);px(x,19,B);px(x+1,19,B)});
      if(K==="maw"){maw(11,28,18,4);[13,17,21,25].forEach(x=>px(x,29,W))}else{P(MAW,q=>q.rect(17,30,6,2),F);px(18,31,BONE);px(21,31,BONE);px(11,29,mix(c,"#ff9aa8",.6));px(28,29,mix(c,"#ff9aa8",.6))}}
    else if(m.shape==="jelly"){
      if(K==="octopus"){top=4;
        [[[12,23],[6,28],[3,34],[7,36]],[[15,25],[11,31],[13,36]],[[19,26],[18,32],[21,36]]].forEach((p,i)=>{[p,mir(p).map(([x,y])=>[x+1,y])].forEach(t=>V(i%2?d1:c,q=>{for(let j=0;j+1<t.length;j++)q.line(t[j][0],t[j][1],t[j+1][0],t[j+1][1],3)},{r:2}))});
        [[5,31],[4,34],[12,32],[35,31],[36,34],[28,32],[19,33],[22,33]].forEach(([x,y])=>px(x,y,bel));back();V(c,q=>q.ell(20,15,11.5,11),{r:9});
        [[13,8],[25,7],[28,13],[11,13]].forEach(([x,y])=>P(l1,q=>q.ell(x,y,1.4,1),F));[13,22].forEach((x,i)=>{P(E,q=>q.rect(x,17,4,3),F);P(B,q=>q.rect(x,18,4,1),F);for(let j=0;j<4;j++)px(x+j,16,ink);px(i?x:x+3,17,ink)});P(d2,q=>q.rect(17,23,5,1),F)}
      else{top=5;const dk=K==="dark";
        [9,13,17,22,26,30].forEach((x,i)=>V(i%2?c:d1,q=>{const n=i%2?1:-1;q.line(x,22,x+n,27,2);q.line(x+n,27,x-n,31,2);q.line(x-n,31,x,33+(i%3)*(dk?2:1),2)},{r:1.5}));
        V(l1,q=>{q.line(17,22,16,30,2);q.line(23,22,24,31,2)},{r:1.5});back();
        V(c,q=>{q.ell(20,16,13,11);q.clear(0,23,40,17);[8,13,18,23,28,33].forEach(x=>q.ell(x-.5,22.5,2.6,2))},{r:9});
        P(mix(c,W,.7),q=>{q.ell(13,10,3,1.6);q.px(18,7);q.px(19,7)},F);V(l1,q=>q.ell(20,18,5.5,2.6),{r:2,sp:0});
        if(dk){eye(11,14,1);eye(24,14,1);[[18,11],[20,20],[15,20],[27,19]].forEach(([x,y])=>{px(x,y,E);px(x+1,y,W)})}else{eye(13,14,0,1);eye(23,14,0,-1);P(d2,q=>q.rect(18,19,4,1),F)}}}
    else if(m.shape==="eye"){
      if(K==="lantern"){top=6;const me="#5a5468";ft="";
        P(me,q=>{q.rect(18,2,5,1);q.rect(18,3,1,3);q.rect(22,3,1,3)},F);V(mix(c,W,.3),q=>q.rect(12,11,17,21),{r:5,sp:0});
        V("#ff8a1c",q=>q.poly([[15,30],[16,21],[19,24],[21,14],[24,23],[26,30]]),{r:3});P("#ffe27a",q=>q.poly([[18,30],[20.5,21],[23,30]]),F);P(B,q=>q.rect(19,25,3,3),F);px(19,25,W);
        P(me,q=>{q.rect(12,11,1,21);q.rect(28,11,1,21)},F);V(me,q=>q.poly([[11,11],[15,6],[25,6],[29,11]]),{r:2});V(me,q=>q.poly([[11,31],[29,31],[31,35],[9,35]]),{r:2})}
      else{top=8;
        V(d1,q=>{[13,18,23,27].forEach((x,i)=>q.line(x,31,x+(i%2?1:-1),35+(i%2),2))},{r:1.5});
        if(ft==="none"||!ft){P(d1,q=>{q.line(12,12,8,5);q.line(20,9,20,2);q.line(28,12,32,5)},F);[[8,4],[20,1.5],[32,4]].forEach(([x,y])=>{V("#f6f0e6",q=>q.ell(x,y,2,2),{r:2,sp:0});px(x-1,y,B)})}
        back();V(c,q=>q.ell(20,21,12.5,12),{r:10});V("#f6f0e6",q=>q.ell(18,21.5,8,7),{r:6,sp:0});[[23,18],[24,19],[25,24],[12,26],[13,27]].forEach(([x,y])=>px(x,y,"#e8607a"));
        V(mix(E,c,.25),q=>q.ell(15.5,22,4.2,4.4),{r:3});P(B,q=>q.ell(15,22,1.1,3.2),F);px(17,19,W);px(17,20,W);
        tint(d2,.75,q=>q.poly([[6,10],[34,10],[34,15],[20,17],[8,19]]),q=>q.ell(20,21,12.5,12));P(ink,q=>q.line(9,18,26,15),F)}}
    front();
    if(m.crown){top=Math.max(top,8);V("#f7c948",q=>{q.rect(hx-6,top-3,13,3);q.rect(hx-6,top-6,2,3);q.rect(hx-1,top-7,3,4);q.rect(hx+5,top-6,2,3)},{r:2});px(hx,top-2,"#e8483c");px(hx-4,top-2,"#5ad0e0");px(hx+4,top-2,"#5ad0e0")}
    s.outline(ink);SPR[k]=s;return cache[k]=s.url()}

  /* Héros : voir plus bas (heroSpr, hero, heroF), après les tables d'animation. */

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
  function fam(id,look){const k="fa:"+id;if(cache[k])return cache[k];const L=look||(ITEMS[id]&&ITEMS[id].look)||{t:"quad",c:"#f08aa8"},s=new Spr(28,28,2,2),c=L.c,c2=L.c2||mix(c,"#ffffff",.5),ink=mix(c,INK,.78),B="#1c1020",dk=mix(c,DARK,.3);
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
  function famFrames(id,anim,look){const k="fa:"+id;if(!SPR[k])fam(id,look);return framesOf(k,SPR[k],anim,true)}

  /* Plantes du mini-jeu de mémoire : 6 formes ET 6 couleurs bien différentes pour ne pas les confondre */
  function plant(i){const k="pl:"+i;if(cache[k])return cache[k];const s=new Spr(16,16),G="#3f8a3a",L="#5fb04a";
    const stem=()=>{s.part(G,q=>q.line(8,15,8,8),{flat:1});s.part(L,q=>{q.ell(5,12,2.6,1.4);q.ell(11,11,2.6,1.4)})};
    if(i===0){stem();s.part("#e8323c",q=>{[[8,3],[5,5],[11,5],[6,8],[10,8]].forEach(([x,y])=>q.ell(x,y,2.2,2.2))});s.part("#ffe04a",q=>q.ell(8,6,1.4,1.4),{flat:1})}          /* coquelicot rouge, 5 pétales */
    if(i===1){stem();s.part("#2f6ae0",q=>q.poly([[4,2],[8,6],[12,2],[12,8],[8,10],[4,8]]))}                                                                                   /* tulipe bleue */
    if(i===2){stem();s.part("#ffd21e",q=>{for(let a=0;a<8;a++){const r=a*Math.PI/4;q.ell(8+Math.cos(r)*4,6+Math.sin(r)*4,1.4,1.4)}});s.part("#8a4a1a",q=>q.ell(8,6,2,2),{flat:1})} /* tournesol jaune */
    if(i===3){stem();s.part("#a040e0",q=>{for(let y=1;y<9;y+=2)q.ell(8,y,2.4-y*.15,1.2)})}                                                                                    /* lavande violette en épi */
    if(i===4){s.part("#f4f4f4",q=>{q.ell(8,6,6,3.6);q.rect(6,6,4,8)});s.part("#e04848",q=>{q.px(5,5);q.px(10,4);q.px(8,7);q.px(11,7)},{flat:1})}                          /* champignon blanc à points rouges */
    if(i===5){s.part("#2a9a3a",q=>{q.poly([[8,1],[13,6],[11,12],[8,15],[5,12],[3,6]])});s.part("#a8f08a",q=>q.line(8,3,8,14),{flat:1})}                                    /* feuille vert vif */
    s.outline();return cache[k]=s.url()}
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
  const ATK={guerrier:"atk",gardien:"bash",archer:"shoot",mage:"staff",peste:"staff",chrono:"staff",invoc:"staff",berserk:"atk"};
  /* ================= Héros : 8 classes, chacune avec sa silhouette, sa tenue et son arme =================
     Dessin dans un repère de 32 px de large (centre du corps x = 15,5 ; sol y = 30), la tête monte jusqu'à y = -12.
     Rendu dans un cadre de 64 px (marge HP de 16 px) : l'arme et le chapeau ne sortent jamais du cadre.
     Le personnage est monté en calques (arrière-plan, corps, tête, bras avant et arme), chacun cerné d'un trait
     sombre : les contours intérieurs détachent le bras du buste, le menton du col, l'arme du corps.
     col = couleur d'étoffe (classe, compagnon, ouvrier) ; métal, cuir et cheveux sont propres à la classe.
     tight = cadre 32 px resserré sur le buste (portraits des compagnons). */
  const HP=16;
  const HAIRS=["#6b3a22","#e8c25a","#b5532c","#3a2a3c","#ece6d6","#9a5a2e","#d98a4a","#54406e"];
  const HCLS={guerrier:0,archer:1,mage:4,gardien:5,peste:5,chrono:4,berserk:2,invoc:3};
  function heroSpr(cls,col,anim,f,blink){
    const T=HA[anim]||HA.idle,s=new Spr(32+2*HP,32+2*HP,HP,HP),F={flat:1},SK={dk:.17,lt:.3},ink=mix(col,INK,.84);
    let g=s;const P=(c,fn,o)=>g.part(c,fn,o),px=(x,y,c)=>g.set(Math.round(x),Math.round(y),c);
    const own=typeof CLASSES!=="undefined"&&CLASSES[cls]&&CLASSES[cls].col===col;let hh=0;for(let i=0;i<col.length;i++)hh=(hh*31+col.charCodeAt(i))>>>0;
    const hair=HAIRS[own?HCLS[cls]||0:hh%HAIRS.length];
    const cc=rgb(col),EM=Math.abs(cc[0]-242)+Math.abs(cc[1]-193)+Math.abs(cc[2]-78)<110?"#fff8e0":"#f2c14e",dk=mix(col,DARK,.42),lt=mix(col,"#ffffff",.45),skin="#f6cfa6",skD="#d99a7a",B="#1c1020",W="#ffffff";
    const ST="#c3cad6",STD="#8790a4",GO="#f2c14e",LE="#8a5a34",LED="#5c3a22",BONE="#f1e4bf",FUR="#8a6a45",RUNE="#d9c6ff",RED="#e8483c";
    const robe=cls==="mage"||cls==="chrono"||cls==="invoc",caster=robe||cls==="peste";
    const u=Math.max(0,T.dy[f]),up=()=>{g.oy=HP+u},dn=()=>{g.oy=HP};                 /* le buste respire, les pieds restent au sol */
    /* un calque : dessiné à part, cerné, puis posé sur le personnage */
    const lay=fn=>{g=new Spr(s.w,s.h,HP,HP);fn();g.outline(ink);const p=g.p;for(let i=0;i<p.length;i++)if(p[i])s.p[i]=p[i];g=s};
    const sw=anim==="idle"?[0,0,0,1,1,1,1,0,0,0][f]:T.dx[f]>0?1:0;                   /* étoffes et cheveux qui suivent le mouvement */
    const R=Math.PI/180,idle=anim==="idle",rest=idle?(caster?44:cls==="gardien"?36:cls==="archer"?30:22):0;
    const aa=(T.arm[f]-rest)*R,sx=21.5,sy=14,AL=6,hx=sx+Math.cos(aa)*AL,hy=sy+Math.sin(aa)*AL;
    const wa=((T.w[f]??-90)+(idle&&(cls==="guerrier"||cls==="berserk")?13:0))*R,ux=Math.cos(wa),uy=Math.sin(wa),vx=-uy,vy=ux;
    const la=T.left?(180-T.arm[f])*R:(102+(T.arm[f]-90)*-.15)*R,lsx=9.5,lsy=14,lhx=lsx+Math.cos(la)*AL,lhy=lsy+Math.sin(la)*AL;
    const SL={guerrier:STD,archer:col,mage:col,gardien:ST,peste:"#9a7448",chrono:col,berserk:skin,invoc:col}[cls]||col;
    const GL={guerrier:STD,gardien:STD,archer:LE,berserk:LE}[cls]||skin;
    const pull=cls==="archer"?((T.pull||[])[f]||0)*1.5:0;
    const hand=(x,y,c)=>{x=Math.round(x);y=Math.round(y);P(c,q=>q.rect(x-1,y-1,2,2),F);px(x,y,mix(c,DARK,.22))};
    const W2=(a,b)=>[hx+ux*a+vx*b,hy+uy*a+vy*b],ln=(q,p0,p1,t)=>q.line(p0[0],p0[1],p1[0],p1[1],t);   /* repère de l'arme : a le long, b en travers */
    const lim=L=>ux>.15?Math.min(L,(45.5-T.dx[f]-hx)/ux):L;                          /* portée de l'arme : raccourcie quand elle pointe droit devant, pour rester dans le cadre */
    /* bâtons des lanceurs de sorts : hampe + tête propre à la classe. Au repos la main tient le bas du bâton, en action le milieu. */
    const grip=idle?0:[2,5,8,8,8,8,8,8,anim==="cast"?8:5,anim==="cast"?8:2][f];
    const staff=()=>{const wood={mage:"#9a6a3c",peste:"#7a5232",chrono:"#5a6ab0",invoc:"#8a7ab8"}[cls],n=Math.min(19-grip,lim(27)-8),L=(a,b)=>W2(n+a,b),o=L(3.5,0);
      P(wood,q=>ln(q,L(-28,0),L(0,0)),F);
      if(cls==="mage"){P(GO,q=>{ln(q,L(0,-2),L(0,2));ln(q,L(0,-3),L(2,-3));ln(q,L(0,3),L(2,3))},F);P(lt,q=>q.ell(o[0],o[1],2.7,2.7),{lt:.75});px(o[0]-1,o[1]-1,W)}
      if(cls==="peste"){P(wood,q=>{ln(q,L(0,0),L(3,-2));ln(q,L(3,-2),L(6,0));ln(q,L(6,0),L(6,3));ln(q,L(6,3),L(4,4));ln(q,L(4,4),L(2,3))},F);const e=L(3.5,1.5);
        P("#8fe05a",q=>q.ell(e[0],e[1],1.5,1.5),{lt:.75});px(e[0],e[1]-1,W);P("#5fae4a",q=>[L(-2,2),L(-4,-2),L(-3,2)].forEach(a=>q.px(a[0],a[1])),F)}
      if(cls==="chrono"){const e=L(4,0),cx=Math.round(e[0]),cy=Math.round(e[1]);P(GO,q=>{q.ell(cx,cy,3.4,3.4);q.clear(cx-1,cy-1,3,3)});px(cx,cy,GO);px(cx,cy-1,W);px(cx+1,cy,W)}
      if(cls==="invoc"){P(wood,q=>{ln(q,L(0,-3),L(0,3));ln(q,L(0,-3),L(4,-4));ln(q,L(0,3),L(4,4))},F);
        P("#b48aff",q=>{q.ell(o[0],o[1],2,2);[L(6.5,0),L(7.5,.8)].forEach(a=>q.px(a[0],a[1]))},{lt:.75});px(o[0],o[1],W)}};

    /* ----- calque arrière : capes, carquois, crinières, bâton au repos, esprit de l'invocateur ----- */
    lay(()=>{up();
      if(cls==="gardien")P(col,q=>q.poly([[8,11],[15,11],[13,26],[4-sw,27],[5,17]]));
      if(cls==="guerrier")P(col,q=>{q.poly([[8,11],[15,11],[13,22],[4-sw,24+sw],[5,16]]);q.clear(6-sw,24+sw,1,1);q.clear(9-sw,23+sw,1,1)});
      if(cls==="peste")P(dk,q=>{q.poly([[7,10],[15,10],[13,24],[5-sw,25],[5,16]]);q.clear(7-sw,25,1,1);q.clear(10-sw,25,1,1)});
      if(cls==="invoc")P(mix(col,DARK,.6),q=>{q.poly([[7,10],[15,10],[13,26],[3-sw,27],[5,16]]);q.clear(5-sw,27,1,1);q.clear(8-sw,27,2,1)});
      if(cls==="archer"){P(hair,q=>q.poly([[8,4],[11,5],[9,13],[5-sw,15],[6-sw,11]]));P(LE,q=>q.poly([[5,11],[8,10],[11,19],[8,20]]));P(BONE,q=>{q.line(5,10,4,7);q.line(7,9,7,6)},F);px(4,6,RED);px(3,7,RED);px(7,5,RED);px(8,6,RED)}
      if(cls==="mage")P(hair,q=>q.poly([[8,2],[12,2],[11,14],[5-sw,16],[6,8]]));
      if(cls==="berserk")P(hair,q=>q.poly([[8,0],[12,0],[12,13],[8-sw,15],[4-sw,16],[5-sw,11],[5,7]]));
      if(cls==="chrono")P(dk,q=>q.poly([[9,-3],[12,0],[9,10],[4-sw,13],[6,5]]));
      if(caster&&anim!=="staff"&&anim!=="cast")staff();
      if(cls==="invoc"){const wb=idle?[0,0,-1,-1,-1,0,0,1,1,1][f]:-1;dn();P("#c9a8ff",q=>{q.ell(1.5,5+wb,2,2);q.px(0,8+wb);q.px(1,9+wb)},{lt:.6});px(1,5+wb,B);px(3,5+wb,B)}});

    /* ----- calque du corps : bras arrière, jambes et bottes (ou bas de robe), buste ----- */
    lay(()=>{up();
      if(!(pull>0)){P(SL===skin?skD:mix(SL,DARK,.2),q=>q.line(lsx-.5,lsy,lhx-.5,lhy,2),SL===skin?F:undefined);hand(lhx,lhy+.5,GL===skin?skin:mix(GL,DARK,.2))}
      dn();const step=anim==="atk"||anim==="bash"?(f>=4&&f<=7?1:0):0;
      if(robe){P(col,q=>{q.poly([[9,18],[21,18],[23,28],[7,28]]);if(cls==="invoc"){q.clear(8,28,1,1);q.clear(12,28,2,1);q.clear(18,28,1,1);q.clear(22,28,1,1)}});
        if(cls==="mage"){P(GO,q=>q.rect(7,27,17,1),F);P(lt,q=>q.rect(15,20,1,7),F)}
        if(cls==="chrono"){P(GO,q=>q.rect(7,27,17,1),F);P(dk,q=>q.rect(8,25,15,1),F)}
        if(cls==="invoc")[9,13,17,21].forEach((x,i)=>px(x,25+i%2,RUNE));
        P(cls==="chrono"?GO:"#4a3550",q=>{q.rect(10+step,29,4,1);q.rect(17+step,29,4,1)},F)}
      else{const LG={guerrier:"#6a5a52",archer:"#8a6442",gardien:STD,peste:"#7a5636",berserk:skin}[cls]||"#6a5a52",BT={guerrier:ST,archer:LED,gardien:ST,peste:"#5c4028",berserk:FUR}[cls]||LED;
        P(LG,q=>{q.rect(10,21,5,5);q.rect(16+step,21,5,5)},LG===skin?SK:undefined);
        P(BT,q=>{q.rect(9,26,6,4);q.rect(16+step,26,6,4);q.px(22+step,28);q.px(22+step,29)});
        if(cls==="archer")P(LE,q=>{q.rect(9,25,6,1);q.rect(16+step,25,6,1)},F);
        if(cls==="guerrier"||cls==="gardien")P(col,q=>{q.rect(10,25,5,1);q.rect(16+step,25,5,1)},F);
        if(cls==="berserk")P(BONE,q=>{q.rect(9,26,6,1);q.rect(16+step,26,6,1)},F)}
      up();const chest=c=>P(c,q=>{q.rect(9,11,13,9);q.clear(9,11,1,1);q.clear(21,11,1,1)},c===skin?SK:undefined),belt=c=>P(c,q=>q.rect(9,19,13,1),F),skirt=(c,h,cut)=>P(c,q=>{q.rect(9,20,13,h);cut.forEach(x=>q.clear(x,19+h,1,1))});
      if(cls==="guerrier"){chest(ST);P(STD,q=>{q.rect(10,16,11,1);q.rect(15,12,1,4)},F);skirt(col,3,[15]);belt(LED);px(15,19,GO);px(16,19,GO);P(col,q=>q.rect(11,11,9,3),{dk:.2});P(ST,q=>q.ell(9.5,12.5,2.3,2.1));px(9,12,GO)}
      if(cls==="archer"){chest(col);P(LE,q=>q.line(10,12,20,18),F);skirt(col,3,[9,12,15,18,21]);belt(LED);px(14,19,GO);P(dk,q=>q.poly([[8,10],[23,10],[22,13],[9,13]]));px(15,11,GO);px(16,11,GO)}
      if(cls==="mage"){chest(col);P(lt,q=>q.rect(15,13,1,6),F);belt(GO);P(dk,q=>q.poly([[7,10],[24,10],[22,14],[9,14]]));px(15,12,GO);px(16,12,GO)}
      if(cls==="gardien"){chest(ST);P(col,q=>q.rect(13,12,5,11));P(EM,q=>{q.rect(15,13,1,5);q.rect(14,14,3,1)},F);P(ST,q=>{q.rect(9,20,4,3);q.rect(18,20,4,3)});P(LED,q=>{q.rect(9,19,4,1);q.rect(18,19,4,1)},F);P(ST,q=>q.ell(9,12.5,2.7,2.5))}
      if(cls==="peste"){chest("#9a7448");skirt(col,3,[10,13,16,19]);belt("#4a7a3a");px(12,19,"#c94a5a");px(18,19,"#c94a5a");P(col,q=>q.poly([[7,10],[24,10],[23,13],[21,15],[18.5,13],[15.5,16],[12.5,13],[10,15],[8,13]]))}
      if(cls==="chrono"){chest(col);belt(dk);P(GO,q=>q.poly([[8,10],[23,10],[15.5,15]]),F);P(col,q=>q.poly([[10,10],[21,10],[15.5,13]]),F);P(GO,q=>q.ell(15.5,16.5,1.6,1.6));px(15,16,B);px(16,17,B)}
      if(cls==="berserk"){chest(skin);[[15,12],[15,13],[15,14],[11,15],[12,15],[13,15],[14,15],[16,15],[17,15],[18,15],[19,15],[15,17]].forEach(([x,y])=>px(x,y,skD));[[10,13],[11,14],[12,13]].forEach(([x,y])=>px(x,y,"#c8302a"));
        P(LE,q=>q.line(10,11,20,18),F);skirt(col,4,[9,15,21]);belt(LED);px(15,19,BONE);px(16,19,BONE)}
      if(cls==="invoc"){chest(col);belt(BONE);P(mix(col,DARK,.5),q=>q.poly([[7,10],[24,10],[23,14],[15.5,17],[8,14]]));[[15,12],[16,13],[15,14],[14,13]].forEach(([x,y])=>px(x,y,RUNE))}
      /* archer : la main arrière tire la corde */
      if(pull>0){const n=W2(0,-3-pull);P(col,q=>q.line(10,14,n[0]-1,n[1],2));hand(n[0],n[1],GL)}});

    /* ----- calque du bras avant et de l'arme (posé derrière la tête quand le bras part en arrière) ----- */
    const am=((T.arm[f]%360)+360)%360,behind=am>150&&am<300;
    const frontArm=()=>lay(()=>{up();
      if(cls==="guerrier"){P(LED,q=>ln(q,W2(-3,0),W2(1,0),2),F);px(...W2(-4,0),GO);
        const e=lim(19.5);P("#e4e9f0",q=>q.poly([W2(3,-2),W2(e-3.5,-2),W2(e,0),W2(e-3.5,2),W2(3,2)]),{dk:.32});P(W,q=>ln(q,W2(5,-.6),W2(e-4.5,-.6)),F);P(GO,q=>ln(q,W2(2.5,-4),W2(2.5,4),2))}
      if(cls==="berserk"){const e=lim(19.5)-19.5;P("#7a4e2e",q=>ln(q,W2(-5,0),W2(17+e,0)),F);
        P("#d5dae2",q=>q.poly([W2(11+e,0),W2(6.5+e,5),W2(9+e,8.5),W2(17+e,8.5),W2(19.5+e,5),W2(15+e,0)]),{dk:.32});P(W,q=>ln(q,W2(10+e,7.6),W2(16+e,7.6)),F);P(STD,q=>q.poly([W2(11.5+e,0),W2(13+e,-4),W2(14.5+e,0)]))}
      if(caster&&(anim==="staff"||anim==="cast"))staff();
      if(cls==="archer"){   /* arc : au repos il penche vers l'avant, pour tirer il est vertical */
        const ba=(idle?-70:-90)*R,ax=Math.cos(ba),ay=Math.sin(ba),bx=-ay,by=ax,Bw=(a,b)=>[hx+ax*a+bx*b,hy+ay*a+by*b];
        P("#9a6a3c",q=>{ln(q,Bw(10,-3),Bw(7,0));ln(q,Bw(7,0),Bw(3,1));ln(q,Bw(3,1),Bw(-3,1));ln(q,Bw(-3,1),Bw(-7,0));ln(q,Bw(-7,0),Bw(-10,-3));ln(q,Bw(2,2),Bw(-2,2))},F);
        P(BONE,q=>{ln(q,Bw(10,-3),Bw(0,-3-pull));ln(q,Bw(0,-3-pull),Bw(-10,-3))},F);
        if(pull>0){P("#e8dcc0",q=>ln(q,Bw(0,-3-pull),Bw(0,7)),F);px(...Bw(0,8),ST);px(...Bw(0,9),ST);px(...Bw(1,-3-pull),RED);px(...Bw(-1,-3-pull),RED)}}
      P(SL,q=>q.line(sx-.5,sy,hx-.5,hy,2),SL===skin?SK:undefined);
      if(cls==="gardien"){const cx=hx+3,cy=hy+1;P(ST,q=>q.poly([[cx-5,cy-8],[cx+5,cy-8],[cx+5,cy+2],[cx,cy+9],[cx-5,cy+2]]));P(col,q=>q.poly([[cx-3.5,cy-6.5],[cx+3.5,cy-6.5],[cx+3.5,cy+1.5],[cx,cy+7],[cx-3.5,cy+1.5]]));
        P(EM,q=>{q.rect(cx-.5,cy-5,1,8);q.rect(cx-2.5,cy-3,5,1)},F);P(ST,q=>q.ell(sx+.5,sy-1.5,3,2.6));px(sx,sy-2,GO)}
      else hand(hx,hy,GL);
      if(cls==="guerrier"){P(ST,q=>q.ell(sx,sy-1.5,2.5,2.3));px(sx+1,sy-2,GO)}
      if(cls==="berserk"){P(FUR,q=>q.ell(sx,sy-2,2.4,1.6),{lt:.5});px(sx+1,sy-4,BONE)}});
    if(behind)frontArm();

    /* ----- calque de la tête : visage, coiffure ou couvre-chef ----- */
    lay(()=>{up();
      const face=(c=skin,cx=15.5,cy=4.5,rx=6.6,ry=5.6)=>P(c,q=>q.ell(cx,cy,rx,ry),SK);
      const cap=(c,ry=4.8)=>P(c,q=>{q.ell(15.5,1.2,7.3,ry);q.clear(11,3,12,9);q.rect(8,3,3,5)});
      let mouth=1,blush=1,EY=B;
      if(cls==="guerrier"){face();P(hair,q=>{q.ell(15.5,1.2,7.3,4.8);q.clear(11,3,12,9);q.rect(8,3,3,5);q.poly([[8,2],[4,-3],[10,-2]]);q.poly([[9,-1],[8,-8],[14,-3]]);q.poly([[13,-3],[15,-8],[18,-3]]);q.poly([[17,-3],[21,-6],[22,-1]]);q.poly([[20,-1],[25,1],[22,3]]);q.px(12,3);q.px(16,3);q.px(17,3);q.px(21,3);q.px(22,3)});
        P(col,q=>q.rect(9,1,14,2));P(col,q=>q.poly([[9,1],[9,3],[5-sw,6+sw],[4-sw,4+sw]]))}
      if(cls==="archer"){face();cap(hair,4.4);P(hair,q=>{q.px(11,3);q.px(12,3);q.px(13,3);q.px(21,3);q.px(22,3);q.px(22,4)},F);
        P(col,q=>{q.poly([[8,0],[10,-6],[17,-7],[22,-1]]);q.poly([[6,2],[8,-1],[23,-1],[27,2],[23,2]])});P(dk,q=>q.rect(9,0,14,1),F);P(RED,q=>q.poly([[11,-5],[6,-11],[9,-11],[14,-6]]))}
      if(cls==="mage"){face();P(hair,q=>{q.rect(8,2,3,9);q.rect(21,3,2,7);q.px(11,3);q.px(12,3);q.px(20,3)});
        P(col,q=>{q.poly([[9,0],[11,-6],[8,-11],[14,-9],[19,-5],[22,0]]);q.ell(15.5,1,10.5,1.4)});P(GO,q=>q.rect(10,-1,12,1),F);px(15,-4,GO);px(14,-3,GO);px(16,-3,GO);px(15,-3,W);px(15,-2,GO)}
      if(cls==="gardien"){face();P(ST,q=>{q.ell(15.5,1.2,7.6,5.4);q.clear(11,3,11,9);q.rect(8,3,3,6);q.rect(21,2,2,6)});P(GO,q=>q.rect(8,2,15,1),F);P(STD,q=>q.rect(16,3,1,3),F);
        P(col,q=>q.poly([[11,-4],[15,-9],[20,-7],[15,-4],[9-sw,-2],[6-sw,3],[4-sw,0],[7-sw,-4]]))}
      if(cls==="peste"){face();cap(hair,4.6);P(hair,q=>{q.rect(8,3,3,9);q.rect(21,3,2,8);q.px(11,3);q.px(12,3);q.px(20,3)});px(21,10,"#8fe05a");px(22,10,"#8fe05a");
        P(BONE,q=>{q.line(11,-2,8,-7);q.line(8,-7,8,-10);q.line(9,-5,5,-8);q.line(20,-2,23,-7);q.line(23,-7,23,-10);q.line(22,-5,26,-8)},F);
        P("#6fbf4a",q=>{q.ell(9.5,.5,1.6,1.3);q.ell(15.5,-.5,1.7,1.6);q.ell(21.5,.5,1.6,1.3)});P("#b8e86a",q=>{q.ell(12.5,0,1.4,1.2);q.ell(18.5,0,1.4,1.2)});px(15,1,"#c94a5a")}
      if(cls==="chrono"){P(col,q=>q.ell(15.5,2.5,8,7.6));P(GO,q=>q.ell(16,5.3,5.9,5.3),F);face(skin,16,5.5,5,4.4);
        P("#ece6d6",q=>{q.rect(12,8,8,2);q.rect(13,10,6,2);q.rect(15,12,2,1)});px(15,8,skin);px(16,8,skin);mouth=0;P(GO,q=>{q.rect(14,-4,3,1);q.rect(15,-3,1,1);q.rect(14,-2,3,1)},F)}
      if(cls==="berserk"){face();P(hair,q=>{q.rect(8,3,3,7);q.rect(21,3,2,6);q.rect(11,8,10,2);q.rect(12,10,8,1);q.px(13,11);q.px(16,11);q.px(18,11);q.clear(15,8,3,1)});
        P(STD,q=>{q.ell(15.5,.8,7.4,4.6);q.clear(8,3,16,9)});P(LE,q=>q.rect(8,1,15,2));px(15,1,BONE);px(16,1,BONE);
        P(BONE,q=>{q.poly([[10,0],[6,-2],[4,-9],[6,-9],[8,-4],[12,-2]]);q.poly([[21,0],[25,-2],[27,-9],[25,-9],[23,-4],[19,-2]])});
        [[12,3],[13,3],[14,4],[20,3],[19,3],[18,4]].forEach(([x,y])=>px(x,y,B));[[11,7],[12,8],[21,7],[20,8]].forEach(([x,y])=>px(x,y,"#c8302a"));blush=0;mouth=0}
      if(cls==="invoc"){P(mix(col,DARK,.5),q=>{q.ell(15.5,2.5,8.2,7.8);q.poly([[10,-3],[7,-10],[13,-5]]);q.poly([[21,-3],[24,-10],[18,-5]])});P(col,q=>q.ell(16,5.3,5.9,5.3),F);P("#2a1a3e",q=>q.ell(16,5.5,5,4.4),F);
        px(15,-2,RUNE);px(16,-3,RUNE);px(8,4,RUNE);px(23,4,RUNE);mouth=0;blush=0;EY=RUNE}
      [13,18].forEach(x=>{if(blink){px(x,6,EY);px(x+1,6,EY)}else{for(let y=4;y<7;y++){px(x,y,EY);px(x+1,y,EY)}px(x,4,W)}});
      if(blush){px(11,7,"#f29a8e");px(12,7,"#f29a8e");px(20,7,"#f29a8e");px(21,7,"#f29a8e")}
      if(mouth){px(16,8,"#c07a62");px(17,8,"#c07a62")}});
    if(!behind)frontArm();
    return s}
  /* image fixe du héros (40×44) : création du personnage, inventaire, visiteurs. pose : "" ou "blink" ("atk" et "up" renvoient une image d'animation) */
  function hero(cls,col,pose=""){
    const k="h:"+cls+col+pose;if(cache[k])return cache[k];
    if(pose==="atk"||pose==="up")return cache[k]=heroF(cls,col,pose==="up"?"cast":"atk",pose==="up"?7:6);   /* poses d'action : cadre large de 64 px */
    const s=heroSpr(cls,col,"idle",0,pose==="blink");
    const o=new Spr(40,44),W=s.w;o.shadow(19.5,42,9,1.7);for(let y=0;y<44;y++)for(let x=0;x<40;x++){const c=s.p[(y+HP-12)*W+x+HP-4];if(c)o.p[y*40+x]=c}
    return cache[k]=o.url()}
  function heroF(cls,col,anim,f,blink,tight){
    if(anim==="atk")anim=ATK[cls]||"atk";
    const k="hf:"+cls+col+anim+f+(blink?"b":"")+(tight?"t":"");if(cache[k])return cache[k];const T=HA[anim]||HA.idle,s=heroSpr(cls,col,anim,f,blink);
    /* décalage du corps ; en portrait, on descend le cadre sur le buste */
    const W=s.w,P=tight?0:HP,N=32+2*P,o=new Spr(N,N),ox=T.dx[f]-HP+P,oy=Math.min(0,T.dy[f])-HP+P+(tight?11:0);if(!tight)o.shadow(15.5+P,30+P,9,1.7);
    for(let y=0;y<W;y++)for(let x=0;x<W;x++){const c=s.p[y*W+x];if(c){const X=x+ox,Y=y+oy;if(X>=0&&Y>=0&&X<N&&Y<N)o.p[Y*N+X]=c}}
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
  /* outils de dessin pour le monde en bandeau (js/monde.js) */
  const kit={Spr,prop,rng,rgb,mix,TH,LIGHT,DARK,INK};
  return{kit,plant,fish,monster,hero,heroF,heroFrames,beastF,beastFrames,monFrames,petFrames,fam,famFrames,strip,pickup,scene,tile,img,item,res,drop,key,potion,pet,ground:id=>(TH[id]||TH.prairie).g[0]};
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
EMB.chrono='<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M3 1h10v2h-10zM4 3h8v1h-8zM5 4h6v2h-6zM6 6h4v1h-4zM7 7h2v2h-2zM6 9h4v1h-4zM5 10h6v2h-6zM4 12h8v1h-8zM3 13h10v2h-10z"/>';
EMB.berserk='<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M7 1h2v14h-2zM3 2h4v1h-4zM2 3h5v5h-5zM3 8h4v1h-4zM9 2h4v1h-4zM9 3h5v5h-5zM9 8h4v1h-4z"/>';
EMB.invoc='<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M5 1h6v1h-6zM3 2h2v1h-2zM11 2h2v1h-2zM2 3h1v2h-1zM13 3h1v2h-1zM1 5h1v6h-1zM14 5h1v6h-1zM2 11h1v2h-1zM13 11h1v2h-1zM3 13h2v1h-2zM11 13h2v1h-2zM5 14h6v1h-6zM7 4h2v3h-2zM5 7h6v2h-6zM7 9h2v3h-2z"/>';
EMB.peste='<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M6 1h4v1h-4zM7 2h2v3h-2zM5 5h6v1h-6zM4 6h8v1h-8zM3 7h10v6h-10zM4 13h8v1h-8zM5 14h6v1h-6z"/>';
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

