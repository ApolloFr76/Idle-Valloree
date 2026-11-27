/* Moteur pixel art (objet PX) : outils de dessin communs (Spr, couleurs, PNG, images d'animation).
   Les dessins sont dans les fichiers chargés juste après, qui ajoutent leurs fonctions à PX :
   pixel-monstres.js, pixel-objets.js, pixel-heros.js. Ils partagent les outils internes par PX._ (cache, Spr, SPR, framesOf…). */
/* ================= Moteur pixel art (sprites et décors générés par le code) ================= */
const PX=(()=>{
  const cache={};
  /* couleur texte → [r,g,b], mémorisée : le décor pose des centaines de milliers de pixels avec les mêmes couleurs */
  const RGB=new Map();
  const rgb=c=>{if(Array.isArray(c))return c;let v=RGB.get(c);if(v)return[v[0],v[1],v[2]];   /* copie : du code compare les pixels par identité */
    if(c[0]==="#"){let h=c;if(h.length===4)h="#"+h[1]+h[1]+h[2]+h[2]+h[3]+h[3];const n=parseInt(h.slice(1),16);v=[n>>16,n>>8&255,n&255]}else v=c.match(/\d+/g).slice(0,3).map(Number);
    if(RGB.size>4096)RGB.clear();RGB.set(c,v);return[v[0],v[1],v[2]]};
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
      /* B : rectangle qui contient tous les pixels posés, pour ne pas parcourir tout le sprite ensuite */
      const B=[w,-1,h,-1],ox=this.ox,oy=this.oy,put=(x,y,v=1)=>{x=Math.round(x)+ox;y=Math.round(y)+oy;if(x>=0&&y>=0&&x<w&&y<h){M[y*w+x]=v;if(v){if(x<B[0])B[0]=x;if(x>B[1])B[1]=x;if(y<B[2])B[2]=y;if(y>B[3])B[3]=y}}};
      const m={px:put,
        rect:(x,y,rw,rh)=>{for(let j=0;j<rh;j++)for(let i=0;i<rw;i++)put(x+i,y+j)},
        ell:(cx,cy,rx,ry)=>{for(let y=Math.floor(cy-ry);y<=cy+ry;y++)for(let x=Math.floor(cx-rx);x<=cx+rx;x++){const dx=(x-cx)/(rx+.35),dy=(y-cy)/(ry+.35);if(dx*dx+dy*dy<=1)put(x,y)}},
        poly:pts=>{let y0=1e9,y1=-1e9;pts.forEach(q=>{y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1])});
          for(let y=Math.floor(y0);y<=y1;y++){const xs=[];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];if((a[1]<=y&&b[1]>y)||(b[1]<=y&&a[1]>y))xs.push(a[0]+(y-a[1])/(b[1]-a[1])*(b[0]-a[0]))}
            xs.sort((a,b)=>a-b);for(let i=0;i+1<xs.length;i+=2)for(let x=Math.round(xs[i]);x<=Math.round(xs[i+1]);x++)put(x,y)}
          pts.forEach(q=>put(q[0],q[1]))},
        line:(x0,y0,x1,y1,t=1)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))||1;for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n,y=y0+(y1-y0)*i/n;for(let a=0;a<t;a++)for(let b=0;b<t;b++)put(x+a,y+b)}},
        clear:(x,y,rw,rh)=>{for(let j=0;j<rh;j++)for(let i=0;i<rw;i++)put(x+i,y+j,0)}};
      fn(m);M.b=B;return M}
    /* part(couleur, m=>{…formes…}, {flat}) : dessine un masque puis l'ombre en 3 tons */
    part(col,fn,o={}){
      const w=this.w,h=this.h,M=this.msk(fn);
      let x0=w,x1=-1,y0=h,y1=-1;for(let y=M.b[2];y<=M.b[3];y++)for(let x=M.b[0];x<=M.b[1];x++)if(M[y*w+x]){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}
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
      const[X0,X1,Y0,Y1]=M.b;
      for(let y=Y0;y<=Y1;y++)for(let x=X0;x<=X1;x++){const i=y*w+x;if(M[i])D[i]=Math.min(at(x-1,y)+1,at(x,y-1)+1,at(x-1,y-1)+1.4,at(x+1,y-1)+1.4)}
      for(let y=Y1;y>=Y0;y--)for(let x=X1;x>=X0;x--){const i=y*w+x;if(M[i]){D[i]=Math.min(D[i],at(x+1,y)+1,at(x,y+1)+1,at(x+1,y+1)+1.4,at(x-1,y+1)+1.4);if(D[i]>mx)mx=D[i]}}
      if(!mx)return this;
      const R=Math.max(1.5,o.r??mx),Z=(x,y)=>{const t=Math.min(at(x,y),R)/R;return Math.sqrt(1-(1-t)*(1-t))*R};
      const b=rgb(col),T=[mix(b,"#1a0c2e",.6),mix(b,"#2b1842",.33),b,mix(b,"#fff0c0",.36),mix(b,"#ffffff",.66)];
      for(let y=Y0;y<=Y1;y++)for(let x=X0;x<=X1;x++){const i=y*w+x;if(!M[i])continue;const zx=(Z(x+1,y)-Z(x-1,y))/2,zy=(Z(x,y+1)-Z(x,y-1))/2,I=(zx*.56+zy*.72+.42)/Math.hypot(zx,zy,1);
        this.p[i]=T[I>.86&&o.sp!==0?4:I>.62?3:I>.2?2:I>-.25?1:0]}
      return this}
    shadow(cx,cy,rx,ry){this.sh.push([cx,cy,rx,ry]);return this}
    /* fit(n) : icône n×n tirée d'un sprite dessiné avec une marge (new Spr(n+6,n+6,3,3)). Le cadre est décalé juste assez
       pour que rien ne soit coupé (contour compris). Si le dessin est plus grand que n, le cadre se place là où il coupe
       le moins de pixels de couleur (un contour sombre coûte peu), à égalité à sa place d'origine. */
    fit(n){const w=this.w,h=this.h;
      /* dessin plus grand que n (contour compris) : on retire les colonnes / lignes intérieures les plus semblables à leur
         voisine (souvent identiques) jusqu'à ce qu'il tienne, au lieu de couper un bord */
      {let x0=w,x1=-1,y0=h,y1=-1;for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(this.p[y*w+x]){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
        if(x1>=0&&(x1-x0+1>n||y1-y0+1>n)){const K=q=>q?q[0]*65536+q[1]*256+q[2]+1:0;let G=[];for(let y=y0;y<=y1;y++){const r=[];for(let x=x0;x<=x1;x++)r.push(this.p[y*w+x]);G.push(r)}
          const X=[],Y=[];for(let x=x0;x<=x1;x++)X.push(x);for(let y=y0;y<=y1;y++)Y.push(y);
          const cut=(len,diff,del)=>{while(len()>n){const L=len();let best=1,bc=1e9;for(let c=1;c<L-2;c++){const d=diff(c)+Math.abs(c+.5-L/2)/(L*4);if(d<bc){bc=d;best=c}}del(best)}};
          cut(()=>G[0].length,c=>G.reduce((a,r)=>a+(K(r[c])!==K(r[c+1])?1:0),0),c=>{G.forEach(r=>r.splice(c,1));X.splice(c,1)});
          cut(()=>G.length,c=>G[c].reduce((a,q,i)=>a+(K(q)!==K(G[c+1][i])?1:0),0),c=>{G.splice(c,1);Y.splice(c,1)});
          const W=G[0].length,H=G.length,ox=(n-W)>>1,oy=(n-H)>>1,o=new Spr(n,n);
          for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(G[y][x])o.p[(y+oy)*n+x+ox]=G[y][x];
          const map=(A,v,off)=>{let i=0;while(i<A.length-1&&A[i]<v)i++;return i+off};
          o.sh=this.sh.map(([cx,cy,rx,ry])=>[map(X,cx,ox),map(Y,cy,oy),rx*W/(x1-x0+1),ry*H/(y1-y0+1)]);return o}}
      const cost=(a,b)=>{const L=.3*a[0]+.59*a[1]+.11*a[2];return L<70?.2:1},C=new Float32Array(w),R=new Float32Array(h);
      for(let y=0;y<h;y++)for(let x=0;x<w;x++){const q=this.p[y*w+x];if(q){const c=cost(q);C[x]+=c;R[y]+=c}}
      const pl=(A,len,st)=>{let lo=-1,hi=-1;for(let i=0;i<len;i++)if(A[i]){if(lo<0)lo=i;hi=i}if(lo<0)return st;if(hi-lo+1<=n)return lo<st?lo:hi>st+n-1?hi-n+1:st;
        let best=st,bc=1e9;for(let s=lo;s<=hi-n+1;s++){let c=0;for(let i=0;i<len;i++)if(i<s||i>=s+n)c+=A[i];if(c<bc-1e-6||(Math.abs(c-bc)<1e-6&&Math.abs(s-st)<Math.abs(best-st))){bc=c;best=s}}return best};
      const sx=pl(C,w,this.ox),sy=pl(R,h,this.oy),o=new Spr(n,n);
      for(let y=0;y<n;y++)for(let x=0;x<n;x++){const X=x+sx,Y=y+sy;if(X>=0&&Y>=0&&X<w&&Y<h)o.p[y*n+x]=this.p[Y*w+X]}
      o.sh=this.sh.map(([cx,cy,rx,ry])=>[cx-sx,cy-sy,rx,ry]);return o}
    outline(col=INK){const w=this.w,h=this.h,add=[];for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(!this.p[y*w+x]&&(this.get(x+1,y)||this.get(x-1,y)||this.get(x,y+1)||this.get(x,y-1)))add.push(y*w+x);const c=rgb(col);add.forEach(i=>this.p[i]=c);return this}
    blit(s,ox,oy){for(let y=0;y<s.h;y++)for(let x=0;x<s.w;x++){const c=s.p[y*s.w+x];if(c)this.set(ox+x,oy+y,c)}return this}
    cvs(){const c=document.createElement("canvas");c.width=this.w;c.height=this.h;const x=c.getContext("2d"),I=x.createImageData(this.w,this.h),D=I.data;
      this.sh.forEach(([cx,cy,rx,ry])=>{for(let y=Math.floor(cy-ry);y<=cy+ry;y++)for(let xx=Math.floor(cx-rx);xx<=cx+rx;xx++){const dx=(xx-cx)/(rx+.35),dy=(y-cy)/(ry+.35);if(dx*dx+dy*dy<=1&&xx>=0&&y>=0&&xx<this.w&&y<this.h){const i=(y*this.w+xx)*4;D[i]=30;D[i+1]=14;D[i+2]=40;D[i+3]=95}}});
      const P=this.p;for(let i=0,j=0,n=P.length;i<n;i++,j+=4){const q=P[i];if(q){D[j]=q[0];D[j+1]=q[1];D[j+2]=q[2];D[j+3]=255}}x.putImageData(I,0,0);return c}
    /* image du sprite pour <img src> : PNG à palette encodé ici (voir png()), servi par une URL blob */
    url(){const w=this.w,h=this.h,N=w*h,I=new Uint8Array(N),map=new Map(),pal=[0],al=[0];
      const idx=(c,a)=>{const k=c*256+a;let i=map.get(k);if(i===undefined){i=pal.length;map.set(k,i);pal.push(c);al.push(a)}return i};
      if(this.sh.length){const s=idx(0x1e0e28,95);this.sh.forEach(([cx,cy,rx,ry])=>{for(let y=Math.floor(cy-ry);y<=cy+ry;y++)for(let x=Math.floor(cx-rx);x<=cx+rx;x++){const dx=(x-cx)/(rx+.35),dy=(y-cy)/(ry+.35);if(dx*dx+dy*dy<=1&&x>=0&&y>=0&&x<w&&y<h)I[y*w+x]=s}})}
      for(let i=0;i<N;i++){const q=this.p[i];if(q)I[i]=idx(c8(q[0])<<16|c8(q[1])<<8|c8(q[2]),255)}
      if(pal.length>256)return this.cvs().toDataURL();
      return URL.createObjectURL(new Blob([png(w,h,I,pal,al)],{type:"image/png"}))}
  }
  /* PNG à palette sans compression : bien plus rapide que canvas.toDataURL() (pas de canvas, pas de zlib),
     et les sprites ont peu de couleurs, donc le fichier reste petit (1 octet par pixel). */
  const c8=v=>v<0?0:v>255?255:Math.round(v);
  const CRC=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;CRC[n]=c>>>0}
  function png(w,h,I,pal,al){const n=pal.length,row=w+1,raw=row*h,nb=Math.max(1,Math.ceil(raw/65535)),il=2+raw+nb*5+4;
    const o=new Uint8Array(8+25+12+3*n+12+n+12+il+12),v=new DataView(o.buffer);let p=8;o.set([137,80,78,71,13,10,26,10]);
    const chunk=(type,len,fill)=>{v.setUint32(p,len);p+=4;const s=p;for(let i=0;i<4;i++)o[p++]=type.charCodeAt(i);fill();let c=~0;for(let i=s;i<p;i++)c=CRC[(c^o[i])&255]^(c>>>8);v.setUint32(p,~c>>>0);p+=4};
    chunk("IHDR",13,()=>{v.setUint32(p,w);v.setUint32(p+4,h);o[p+8]=8;o[p+9]=3;p+=13});
    chunk("PLTE",3*n,()=>{for(const c of pal){o[p++]=c>>16;o[p++]=c>>8&255;o[p++]=c&255}});
    chunk("tRNS",n,()=>{for(const a of al)o[p++]=a});
    chunk("IDAT",il,()=>{o[p++]=0x78;o[p++]=1;let a1=1,a2=0,left=raw,k=0;
      for(let b=0;b<nb;b++){const len=Math.min(65535,left);left-=len;o[p++]=left?0:1;o[p++]=len&255;o[p++]=len>>8;o[p++]=~len&255;o[p++]=~len>>8&255;
        for(let j=0;j<len;j++,k++){const x=k%row,byte=x?I[(k-x)/row*w+x-1]:0;o[p++]=byte;a1+=byte;a2+=a1;if((k&4095)===4095){a1%=65521;a2%=65521}}}
      a1%=65521;a2%=65521;v.setUint32(p,(a2<<16|a1)>>>0);p+=4});
    chunk("IEND",0,()=>{});return o}

  const img=(u,cls="",w,h)=>`<img class="px ${cls}" src="${u}" alt="" draggable="false"${w?` width="${w}" height="${h}"`:""}>`;

  /* ================= Animation image par image (10 images par mouvement) ================= */
  const SPR={};                                   /* sprites bruts gardés pour fabriquer les images */
  /* Monstres et bêtes : 10 images obtenues en redessinant le sprite pixel par pixel (écrasement, étirement, inclinaison) */
  /* XP : marge transparente autour de l'image pour que l'élan, l'inclinaison et l'étirement ne soient jamais coupés
     (l'image est ensuite agrandie d'autant en CSS avec la propriété scale, voir SCENE) */
  const XP=20;
  function xf(src,{sx=1,sy=1,sh=0,dx=0,dy=0}){const w=src.w,h=src.h,W=w+2*XP,H=h+2*XP,o=new Spr(W,H),by=h-3-(src.pad||0),cx=w/2;o.sh=src.sh.map(([a,b,c,d])=>[a+XP,b+XP,c,d]);
    for(let Y=0;Y<H;Y++)for(let X=0;X<W;X++){const x=X-XP,y=Y-XP,v=Math.round(by-(by-y+dy)/sy),u=Math.round(cx+(x-cx-dx-sh*(by-y))/sx);const c=src.get(u,v);if(c)o.p[Y*W+X]=c}return o}
  const MA={
    idle:Array.from({length:10},(_,i)=>{const t=i/10,b=(1-Math.cos(2*Math.PI*t))/2;return{sy:1-.07*b,sx:1+.05*b,sh:.04*Math.sin(2*Math.PI*t)}}),
    atk:[{},{sh:.08,sy:1.04},{sh:.16,sy:1.08,sx:.96},{sh:.2,sy:1.1,sx:.94,dx:2},{sh:-.1,sy:.95,sx:1.06,dx:-4},{sh:-.28,sy:.9,sx:1.12,dx:-9},{sh:-.22,sy:.92,sx:1.1,dx:-7},{sh:-.1,sy:.96,sx:1.04,dx:-4},{sh:.04,sy:1.02,dx:-1},{}],
    hurt:[{sh:.12,dx:3,sy:.96},{sh:.18,dx:5,sy:.94,sx:1.04},{sh:.14,dx:4,sy:.96},{sh:.08,dx:2},{sh:.03,dx:1},{},{},{},{},{}]};
  function framesOf(key,spr,anim,mirror){const k="xf:"+key+anim+(mirror?"m":"");if(cache[k])return cache[k];const T=MA[anim]||MA.idle;
    cache[k]=T.map(p=>{const q=Object.assign({},p);if(mirror){q.sh=-(q.sh||0);q.dx=-(q.dx||0)}return xf(spr,q).url()});cache[k].sc=((spr.w+2*XP)/(spr.w-2*(spr.pad||0))).toFixed(3);return cache[k]}
  return{_:{cache,rgb,mix,rng,LIGHT,DARK,INK,Spr,SPR,framesOf},img};
})();

function monsterSVG(m){return PX.img(PX.monster(m),"mpx")}
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
function monRes(monEl,atk){if(atk==="neutre")return 0;if(BEATS[atk]===monEl)return RES_WEAK-(S?talV("t_elem"):0);if(atk===monEl)return RES_SELF;if(BEATS[monEl]===atk)return RES_STRONG;return 0}
const weakTo=e=>Object.keys(BEATS).find(k=>BEATS[k]===e);
function heroSVG(k,arm){return PX.img(PX.hero(k,CLASSES[k].col,"",arm),"herofig")}
const emb=(k,size=40)=>`<span class="emb" style="width:${size}px;height:${size}px;background:${shade(CLASSES[k].col,-.55)};color:${CLASSES[k].col}"><svg viewBox="0 0 24 24">${EMB[k]}</svg></span>`;

