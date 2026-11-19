/* Décor du monde « Dunes Ambrées » : plans du paysage générés une fois (fonction BIOME.dunes, lue par js/monde.js). */
(()=>{
  const{Spr,prop,rng,rgb,mix,TH,DARK,LIGHT,INK,calm,R,TAU,css,wave,wset,wblit,wget,ellipse,deco,FARH,MIDH,WALLH,TM,GH,PY,mkClouds,BIOME}=MK;
  /* ================= Dunes Ambrées ================= */
  /* désert chaud : mesas qui tremblent dans la chaleur, dunes aux crêtes nettes, oasis et temple en
     ruine, colonnes à moitié ensablées, cactus, ossements ; boules d'herbe qui roulent et sable soufflé */
  const DUN={sand:"#e0b46a",crest:"#f6dc9c",shade:"#c08e4e",ruin:"#d8a868",ruinL:"#f0c888",ruinD:"#a87444",palm:"#5a9a4e",palmD:"#3f7a3e",trunk:"#8a6440",mesa:"#d88a5a",bone:"#efe6cf"};
  Object.assign(deco,{
    /* grand cactus à bras */
    saguaro(r,c){const h=22+(r()*10|0),s=new Spr(16,h);s.part(c,q=>{q.rect(6,2,4,h-2);q.ell(8,2.5,2,2);q.rect(1,h-16,3,7);q.rect(1,h-11,6,3);q.ell(2.5,h-16,1.5,1.5);if(h>26){q.rect(12,h-21,3,8);q.rect(9,h-15,6,3);q.ell(13.5,h-21,1.5,1.5)}},{lt:.35,dk:.4});
      for(let y=4;y<h-1;y+=3)s.set(8,y,mix(c,DARK,.3));if(r()<.5){s.set(8,0,"#ff8ab0");s.set(7,0,"#ffc0d0")}return s.outline(mix(c,INK,.75))},
    /* palmier */
    palm(r){const h=26+(r()*10|0),s=new Spr(30,h),lean=(r()-.5)*6;s.part(DUN.trunk,q=>{for(let y=8;y<h;y++){const x=15+lean*(1-(y-8)/(h-8));q.rect(Math.round(x)-1,y,3,1)}},{flat:1});
      for(let y=9;y<h;y+=2){const x=Math.round(15+lean*(1-(y-8)/(h-8)));s.set(x-1,y,mix(DUN.trunk,DARK,.3));s.set(x+1,y,mix(DUN.trunk,"#fff2c2",.2))}
      const tx=Math.round(15+lean);s.part(DUN.palm,q=>{[[-13,5],[-9,9],[-4,10],[4,10],[9,9],[13,5],[-7,1],[7,1]].forEach(([dx,dy])=>{q.line(tx,7,tx+dx,7+dy-4,1);q.line(tx,8,tx+dx*.7,7+dy-3,1)})},{lt:.3,dk:.3});
      s.set(tx-1,8,"#6a4a2c");s.set(tx+1,8,"#6a4a2c");s.set(tx,9,"#5a3a22");return s.outline(mix(DUN.palmD,INK,.6))},
    /* colonne brisée, à moitié dans le sable */
    column(r){const h=10+(r()*14|0),s=new Spr(11,h+3);s.part(DUN.ruin,q=>{q.rect(2,3,7,h);q.rect(1,h+1,9,2)},{lt:.35,dk:.35});for(let y=4;y<h;y++)s.set(5,y,DUN.ruinD);
      s.part(DUN.ruinL,q=>{q.poly([[2,3],[4,1],[6,2],[8,0],[9,3]])},{flat:1});return s.outline("#5a3a22")},
    /* jarre (parfois cassée) */
    jar(r){const s=new Spr(9,10),c="#c8703a";s.part(c,q=>{q.ell(4.5,6,3.4,3.4);q.rect(3,1,3,3)},{lt:.35,dk:.4});s.part("#8a4a26",q=>q.rect(2,1,5,1),{flat:1});if(r()<.4){s.p[3*9+5]=null;s.p[4*9+6]=null;s.p[3*9+6]=null}return s.outline("#3a2414")},
    /* crâne de bête */
    skull(r){const s=new Spr(13,7);s.part(DUN.bone,q=>{q.ell(6,4,3,2.4);q.line(3,2,0,0);q.line(9,2,12,0)},{flat:1});s.set(5,4,"#5a4630");s.set(7,4,"#5a4630");s.set(6,6,"#cfc6af");return s.outline("#5a4630")},
    /* touffe d'herbe sèche */
    dry(r){const s=new Spr(10,7);s.part("#b8a050",q=>{q.line(5,6,1,1);q.line(5,6,4,0);q.line(5,6,7,1);q.line(5,6,9,3);q.line(5,6,2,3)},{flat:1});return s.outline("#6a5a2a")},
  });
  /* boule d'herbe sèche : 4 images de rotation */
  const tumbleF=(()=>{let f=null;return()=>f||(f=[0,1,2,3].map(k=>{const s=new Spr(11,11),a0=k*Math.PI/8;s.part("#a88850",q=>{for(let i=0;i<14;i++){const a=a0+i*Math.PI*2/14;q.px(5+Math.cos(a)*4.4,5+Math.sin(a)*4.4)}
    for(let i=0;i<4;i++){const a=a0+i*Math.PI/4;q.line(5+Math.cos(a)*4,5+Math.sin(a)*4,5-Math.cos(a)*4,5-Math.sin(a)*4)}},{flat:1});s.part("#7a6034",q=>{for(let i=0;i<7;i++){const a=a0*2+i*.9;q.px(5+Math.cos(a)*2.4,5+Math.sin(a)*2.4)}},{flat:1});return s.cvs()}))})();
  BIOME.dunes=function(zid){
    const T=TH.dunes,G=T.g.map(rgb),fl=T.fl,r=rng(zid.length*1013+zid.charCodeAt(0)*7),meta={mills:[],houses:[],ponds:[],glow:[],rays:[]},hz="#f4d8c0";
    /* mesas lointaines (plateaux à sommet plat) */
    const far=new Spr(480,FARH);{const W=480,c1=mix(DUN.mesa,hz,.55),c2=mix(DUN.mesa,hz,.35),c1l=mix(c1,"#ffffff",.15),st=mix(c1,DARK,.08);
      const mesas=[];for(let x=r()*40;x<W;x+=50+r()*70)mesas.push({x,w:14+r()*30,h:14+r()*18});
      const hmap=new Float32Array(W);for(let x=0;x<W;x++){let m=4+wave(x,W,[[3,2,1],[7,1,2]]);mesas.forEach(o=>{let d=Math.abs(x-o.x);d=Math.min(d,W-d);const v=d<o.w?o.h:d<o.w+6?o.h*(1-(d-o.w)/6)*.8:0;if(v>m)m=v});hmap[x]=m}
      for(let x=0;x<W;x++){const top=Math.round(FARH-8-hmap[x]);for(let y=Math.max(0,top);y<FARH;y++)far.set(x,y,y===top?c1l:(y-top)%5===2&&(x%7)<5?st:c1);
        const t2=Math.round(FARH-8+wave(x,W,[[5,2,1],[11,1,0]]));for(let y=t2;y<FARH;y++)far.set(x,y,y===t2?mix(c2,"#ffffff",.15):c2)}}
    /* dunes moyennes : crêtes nettes, face au soleil claire, face à l'ombre foncée ; oasis et temple */
    const mid=new Spr(640,MIDH);{const W=640,base=mix(DUN.sand,hz,.3),lit=mix(DUN.crest,hz,.25),sh=mix(DUN.shade,hz,.3);
      const h=x=>MIDH-22-wave(x,W,[[4,7,1.3],[9,3,.4],[2,3,2]]);
      for(let x=0;x<W;x++){const top=Math.round(h(x)),sl=h(x+1)-h(x-1),dep=Math.min(14,3+sl*14);for(let y=Math.max(0,top);y<MIDH;y++){const e=y-top;let c=sl>0&&(e<dep-1||(e<dep+1&&(x+y)%2===0))?sh:base;if(y===top)c=lit;else if(sl<-.3&&y<top+4)c=lit;if(y>MIDH-8)c=mix(base,DUN.shade,.25);mid.set(x,y,(x+y)%2===0&&y===top+1?lit:c)}}
      /* temple en ruine */
      const tx=r()*W|0,ty=Math.round(h(tx+20))-2,tc=mix(DUN.ruin,hz,.25),td=mix(DUN.ruinD,hz,.25);
      for(let i=0;i<40;i++)for(let y=ty-12;y<ty+4;y++){const inArch=(i===10||i===11||i===28||i===29)&&y>ty-6;if(!inArch&&!(i>14&&i<26&&y<ty-6))wset(mid,tx+i,y,y===ty-12?mix(tc,"#ffffff",.15):(i%9===0?td:tc))}
      ellipse(tx+20,ty-7,6,5,(x,y)=>{if(y<=ty-6)wset(mid,x,y,y<ty-10?mix(tc,"#ffffff",.15):tc)});for(let y=ty-14;y<ty-11;y++)wset(mid,tx+20,y,td);
      [3,7,33,37].forEach(c=>{for(let y=ty-17+(c%2)*3;y<ty-12;y++)wset(mid,tx+c,y,tc)});
      /* oasis */
      const ox=(tx+200+r()*200|0)%W,oy=Math.round(h(ox))+6;ellipse(ox,oy,18,2.5,(x,y)=>wset(mid,x,y,y<oy?mix("#3fa8c0",hz,.3):mix("#5fc0d0",hz,.3)));
      for(let k=0;k<4;k++){const p=deco.palm(r),px=ox-22+k*12+(r()*4|0),sm=new Spr(p.w>>1,p.h>>1);for(let y=0;y<sm.h;y++)for(let x=0;x<sm.w;x++){const c=p.p[(y*2)*p.w+x*2];if(c)sm.p[y*sm.w+x]=mix(c,hz,.3)}wblit(mid,sm,px,oy-sm.h+1)}}
    /* premier rang : crête de dune, ruines ensablées, palmiers, grands cactus */
    const WH=58,wall=new Spr(512,WH);{const W=512,base=rgb(DUN.sand),lit=rgb(DUN.crest),sh=rgb(DUN.shade);
      const h=x=>WH-12-wave(x,W,[[3,5,.6],[7,2.5,1.9],[13,1,0]]);
      const items=[];for(let x=r()*30;x<W-20;x+=40+r()*50){const k=r();items.push([k<.3?deco.palm(r):k<.55?deco.saguaro(r,"#5a9a4e"):k<.8?deco.column(r):null,x|0])}
      /* murs en ruine à moitié enfouis, derrière la crête */
      for(let k=0;k<3;k++){const x0=(k*W/3+r()*80)|0,ww=30+(r()*24|0),hh=10+(r()*10|0),yb=Math.round(h(x0+ww/2))+4;for(let i=0;i<ww;i++){const top=yb-hh+Math.round(Math.abs(Math.sin(i*.37+k))*5)+(i>ww*.6?Math.round((i-ww*.6)*.6):0);
        for(let y=top;y<yb;y++){const row=(y-top)%4===0,joint=((i+((y>>2)%2)*3)%7)===0;wset(wall,x0+i,y,y===top?DUN.ruinL:row||joint?DUN.ruinD:DUN.ruin)}}
        const ax=x0+(ww>>1)-3;for(let y=yb-7;y<yb;y++)for(let i=0;i<6;i++){const dx=(i-2.5)/3;if(y-(yb-7)>=Math.round(2*(1-Math.sqrt(Math.max(0,1-dx*dx)))))wset(wall,ax+i,y,"#6a4a2c")}}
      items.forEach(([sp,x])=>{if(sp)wblit(wall,sp,x,Math.round(h(x+sp.w/2))+3-sp.h)});
      for(let x=0;x<W;x++){const top=Math.round(h(x)),sl=h(x+1)-h(x-1),dep=Math.min(12,3+sl*12);for(let y=top;y<WH;y++){const e=y-top;let c=sl>0&&(e<dep-1||(e<dep+1&&(x+y)%2===0))?sh:base;if(y===top)c=lit;else if(sl<-.25&&e<5)c=(x+y)%2?lit:base;wset(wall,x,y,c)}}
      for(let i=0;i<14;i++){const d=deco.dry(r),x=r()*W|0;wblit(wall,d,x,Math.round(h(x+5))-d.h+3)}}
    /* sol : sable ridé par le vent, piste damée, accessoires */
    const W=768,ground=new Spr(W,TM+GH),ph=[r()*6,r()*6,r()*6];
    for(let y=TM;y<TM+GH;y++)for(let x=0;x<W;x++)ground.p[y*W+x]=G[0];
    for(let i=0;i<120;i++){const rx=8+r()*24,ry=2+r()*5,cx=r()*W,cy=TM+ry+1+r()*(GH-2*ry-2),c=G[1+(i%3)];ellipse(cx,cy,rx,ry,(x,y,d)=>{if(y>=TM&&(d<.6||(x+y)%2===0))wset(ground,x,y,c)})}
    /* rides du vent : lignes ondulées, claires dessus, foncées dessous */
    const rl=mix(G[1],"#fff2c2",.28),rd=mix(G[0],G[3],.6);
    for(let y=TM+5;y<TM+GH-3;y+=6+(y%4)){const p0=r()*6,k=2+(r()*3|0);for(let x=0;x<W;x++){const yy=y+Math.round(wave(x,W,[[48,1.2,p0],[k*8,.8,p0*2]]));if(((x+y*7)%61)<46){wset(ground,x,yy,rl);if((x%3)!==0)wset(ground,x,yy+1,rd)}}}
    for(let x=0;x<W;x++){wset(ground,x,TM,mix(G[3],DARK,.12));if((x*5)%3)wset(ground,x,TM+1,mix(G[3],DARK,.05))}
    for(let i=0;i<900;i++){const x=r()*W|0,y=TM+3+(r()*(GH-4)|0);wset(ground,x,y,r()<.5?mix(G[3],DARK,.15):mix(G[1],"#ffffff",.25))}
    /* piste damée avec traces de pas et de roues */
    const P0=rgb(T.path),pl=mix(P0,"#ffffff",.25),pd=mix(P0,DARK,.15),ed=mix(G[3],DARK,.22);
    const pc=x=>PY-1+Math.round(wave(x,W,[[2,2,ph[0]],[5,1,ph[1]]])),phw=x=>6+Math.round(wave(x,W,[[3,1.2,ph[2]]]));
    for(let x=0;x<W;x++){const c=pc(x),h=phw(x);for(let y=c-h-1;y<=c+h+1;y++){const e=Math.abs(y-c);if(e>h){if((x+y)%2===0)wset(ground,x,y,ed)}else if(e===h){if((x+y)%2===0)wset(ground,x,y,P0)}else wset(ground,x,y,P0)}
      wset(ground,x,c-3,(x%9)<6?pd:P0);wset(ground,x,c+3,(x%9)<6?pd:P0)}
    for(let x=0;x<W;x+=7){const c=pc(x)+((x/7|0)%2?-1:1);wset(ground,x,c,pd);wset(ground,x+1,c,pd);wset(ground,x,c-1,pl)}
    for(let i=0;i<300;i++){const x=r()*W|0,c=pc(x),h=phw(x)-1,y=c-h+(r()*h*2|0);wset(ground,x,y,r()<.5?pl:pd)}
    const items=[];const put=(cnt,mk,y0,y1)=>{for(let i=0;i<cnt;i++){const sp=mk(),x=r()*W|0,y=(y0+r()*(y1-y0))|0;items.push([sp,x,y-sp.h])}};
    put(4,()=>deco.saguaro(r,"#5a9a4e"),TM+30,PY-9);put(6,()=>prop.cactus(r,"#5a9a4e"),TM+8,PY-9);put(6,()=>prop.rock(r,"#c08a5a"),TM+8,PY-9);put(3,()=>deco.column(r),TM+14,PY-9);put(3,()=>deco.jar(r),TM+10,PY-9);put(3,()=>prop.bone(r),TM+8,PY-9);put(8,()=>deco.dry(r),TM+6,PY-9);put(1,()=>deco.skull(r),TM+10,PY-9);
    put(4,()=>prop.cactus(r,"#5a9a4e"),PY+14,TM+GH-6);put(5,()=>prop.rock(r,"#c08a5a"),PY+12,TM+GH-6);put(2,()=>deco.jar(r),PY+14,TM+GH-6);put(2,()=>prop.bone(r),PY+12,TM+GH-6);put(8,()=>deco.dry(r),PY+12,TM+GH-6);put(1,()=>deco.skull(r),PY+14,TM+GH-6);put(1,()=>deco.column(r),PY+30,TM+GH-6);
    const sc=mix(G[3],DARK,.15);
    items.sort((a,b)=>a[2]+a[0].h-b[2]-b[0].h).forEach(([sp,x,y])=>{for(let i=1;i<sp.w;i++){wset(ground,x+i+1,y+sp.h-1,sc);if(i>1)wset(ground,x+i+2,y+sp.h,sc)}wblit(ground,sp,x,y)});
    const isS=c=>c===G[0]||c===G[1]||c===G[2]||c===G[3]||c===rl||c===rd;
    const tufts=[];for(let k=0;tufts.length<24&&k<4000;k++){const x=r()*(W-2)|0,y=PY+12+(r()*16|0),h=3+(r()*4|0);let ok=true;for(let j=-1;j<=h+1&&ok;j++)for(let q=-1;q<=1;q++)if(!isS(ground.get(x+q,y-j))){ok=false;break}
      if(ok)tufts.push({x,y,h,c:rgb(r()<.5?"#b8a050":"#9a8a40"),ph:r()*6,w:1,f:null})}
    const low=dunesLow(T,G,r,W);
    return{far:far.cvs(),mid:mid.cvs(),wall:wall.cvs(),ground:ground.cvs(),low,gW:W,meta,tufts,clouds:mkClouds().slice(0,2),G,fl,heat:1,tumble:1,wind:1,flyC:["#fff0c0","#f6dca0"],motes:1,nightFlies:3};
  };
  function dunesLow(T,G,r,W){const LH=200,s=new Spr(W,LH);for(let i=0;i<W*LH;i++)s.p[i]=G[0];
    for(let i=0;i<180;i++){const rx=8+r()*26,ry=2+r()*6,cx=r()*W,cy=ry+1+r()*(LH-2*ry-2),c=G[1+(i%3)];ellipse(cx,cy,rx,ry,(x,y,d)=>{if(d<.6||(x+y)%2===0)wset(s,x,y,c)})}
    const rl=mix(G[1],"#fff2c2",.28),rd=mix(G[0],G[3],.6);
    for(let y=3;y<LH-3;y+=6+(y%4)){const p0=r()*6,k=2+(r()*3|0);for(let x=0;x<W;x++){const yy=y+Math.round(wave(x,W,[[48,1.2,p0],[k*8,.8,p0*2]]));if(yy>0&&yy<LH-1&&((x+y*7)%61)<46){wset(s,x,yy,rl);if((x%3)!==0)wset(s,x,yy+1,rd)}}}
    for(let i=0;i<1600;i++){const x=r()*W|0,y=1+(r()*(LH-2)|0);wset(s,x,y,r()<.5?mix(G[3],DARK,.15):mix(G[1],"#ffffff",.25))}
    const items=[],put=(n,mk)=>{for(let i=0;i<n;i++){const sp=mk();items.push([sp,r()*W|0,2+(r()*(LH-sp.h-5)|0)])}};
    put(10,()=>prop.cactus(r,"#5a9a4e"));put(3,()=>deco.saguaro(r,"#5a9a4e"));put(12,()=>prop.rock(r,"#c08a5a"));put(4,()=>deco.jar(r));put(6,()=>prop.bone(r));put(18,()=>deco.dry(r));put(2,()=>deco.skull(r));put(3,()=>deco.column(r));
    const sc=mix(G[3],DARK,.15);items.sort((a,b)=>a[2]+a[0].h-b[2]-b[0].h).forEach(([sp,x,y])=>{for(let i=1;i<sp.w;i++)wset(s,x+i+1,y+sp.h-1,sc);wblit(s,sp,x,y)});
    return s.cvs()}

  Object.assign(MK,{tumbleF});   /* aussi utilisé par js/monde.js ou par d'autres biomes */
})();
