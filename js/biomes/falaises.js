/* Décor du monde « Falaises d'Orageline » : plans du paysage générés une fois (fonction BIOME.falaises, lue par js/monde.js). */
(()=>{
  const{Spr,prop,rng,rgb,mix,TH,DARK,LIGHT,INK,calm,R,TAU,css,wave,wset,wblit,wget,ellipse,deco,FARH,MIDH,WALLH,TM,GH,PY,mkClouds,BIOME}=MK;
  /* ================= Falaises d'Orageline ================= */
  /* plateau battu par l'orage au-dessus de la mer : promontoires et aiguilles de roche au large,
     phare sur son îlot, pins couchés par le vent, menhirs, cristaux chargés d'éclairs, dalles de pierre ;
     éclairs au loin, mouettes, rafales, herbes couchées, faisceau du phare la nuit */
  const FAL={sea:"#4a78b8",seaL:"#8ab4e8",seaD:"#2f5a94",cliff:"#7a8098",cliffD:"#5a6078",stone:"#9a98a8",stoneD:"#6e6c80",bolt:"#ffe27a",pine:"#4a7a6a",grass:"#6e8a7c"};
  Object.assign(deco,{
    /* pin couché par le vent (le vent vient de la gauche) */
    bentpine(r,h){const w=Math.round(h*1.7),s=new Spr(w,h),bx=3,top=Math.round(h*.38),ex=Math.round(w*.42),tx=y=>{const f=(h-1-y)/(h-1-top);return bx+f*f*(ex-bx)};
      const pads=[[ex,top-1,w*.2,3.4],[Math.min(w-w*.16-2,ex+w*.3),top-4,w*.16,2.8],[ex-w*.16,top+4,w*.13,2.4]];
      s.part("#5a4030",q=>{for(let y=h-1;y>=top;y--)q.rect(Math.round(tx(y)),y,y>h*.75?3:2,1);q.line(ex,top,pads[1][0]-4,pads[1][1]+1);q.line(ex-1,top+2,pads[2][0]+2,pads[2][1]+1)},{flat:1});
      pads.forEach(([cx,cy,rx,ry])=>s.part(FAL.pine,q=>{q.ell(cx,cy+.5,rx,ry*.7);for(let k=-2;k<=2;k++)q.ell(cx+k*rx*.38,cy-ry*.35,rx*.3,ry*.55)},{lt:.35,dk:.45}));
      const l=mix(FAL.pine,LIGHT,.45);for(let x=1;x<w-1;x++){let y=0;while(y<h&&!s.get(x,y))y++;if(y<top+6&&(x%3))s.set(x,y,l)}return s.outline(mix(FAL.pine,INK,.8))},
    /* menhir gravé */
    menhir(r){const h=14+(r()*10|0),s=new Spr(10,h+1);s.part(FAL.stone,q=>{q.poly([[2,h],[1,4],[4,0],[7,1],[8,h]])},{lt:.35,dk:.42});for(let y=4;y<h-2;y+=3)s.set(4+(y%2),y,FAL.stoneD);
      if(r()<.5)for(let y=2;y<h-3;y+=2)s.set(1+((y/2)%2|0),y+1,"#7fa060");return s.outline("#2e2c3a")},
    /* cairn : pierres empilées */
    cairn(r){const s=new Spr(10,11);[[5,9,4,1.8],[5,6,3.2,1.5],[5,3.6,2.4,1.2],[5,1.6,1.4,1]].forEach(([x,y,a,b],i)=>s.part(i%2?FAL.stone:mix(FAL.stone,"#ffffff",.1),q=>q.ell(x,y,a,b),{lt:.3}));return s.outline("#2e2c3a")},
    /* cristal chargé (luit pendant l'orage) */
    stormcry(r){const s=prop.crystal(r,FAL.bolt);s.c=FAL.bolt;return s},
    /* phare (lointain) */
    lighthouse(){const s=new Spr(9,30);for(let y=6;y<30;y++){const hw=Math.round(2+(y-6)/24*1.5);for(let x=4-hw;x<=4+hw;x++)s.set(x,y,((y-6)>>2)%2?"#d84a4a":"#f0ece0")}
      s.part("#3a3446",q=>{q.rect(2,4,5,1);q.rect(3,0,3,1)},{flat:1});s.set(3,1,"#ffe27a");s.set(4,1,"#fff6c0");s.set(5,1,"#ffe27a");s.set(3,2,"#ffe27a");s.set(4,2,"#ffe27a");s.set(5,2,"#ffe27a");s.set(3,3,"#3a3446");s.set(5,3,"#3a3446");return s},
  });
  BIOME.falaises=function(zid){
    const T=TH.falaises,G=T.g.map(rgb),fl=T.fl,r=rng(zid.length*1013+zid.charCodeAt(0)*7),meta={mills:[],houses:[],ponds:[],glow:[],rays:[]},hz="#a8b4c8";
    const sea=rgb(FAL.sea),seaL=rgb(FAL.seaL),seaD=rgb(FAL.seaD);
    /* au large : promontoires, aiguilles de roche, mer jusqu'à l'horizon */
    const far=new Spr(480,FARH);{const W=480,HZ=FARH-16,c=mix(FAL.cliff,hz,.55),cl=mix(c,"#ffffff",.15),sw=mix(FAL.sea,hz,.5),sl=mix(FAL.seaL,hz,.4);
      for(let x=0;x<W;x++)for(let y=HZ;y<FARH;y++)far.set(x,y,y===HZ?sl:((x*7+y*13)%29<2?sl:sw));
      const heads=[];for(let x=r()*60;x<W;x+=90+r()*90)heads.push({x,w:20+r()*40,h:8+r()*12});
      for(let x=0;x<W;x++){let m=0;heads.forEach(o=>{let d=x-o.x;if(d>W/2)d-=W;if(d<-W/2)d+=W;const v=d<0?(d>-6?o.h*(1+d/6):0):d<o.w?o.h-(d/o.w)*o.h*.35:d<o.w+3?o.h*.65*(1-(d-o.w)/3):0;if(v>m)m=v});
        if(m>0){const top=Math.round(HZ-m);for(let y=top;y<HZ+1;y++)far.set(x,y,y===top?cl:c)}}
      for(let i=0;i<5;i++){const x=r()*W|0,h=6+(r()*8|0);for(let y=HZ-h;y<HZ+1;y++){wset(far,x,y,c);wset(far,x+1,y,c);if(y>HZ-h+2)wset(far,x+2,y,mix(c,DARK,.1))}wset(far,x,HZ-h,cl)}}
    /* mer proche : houle, aiguilles, îlot et phare */
    const mid=new Spr(640,MIDH);{const W=640,SY=MIDH-16;
      for(let x=0;x<W;x++)for(let y=SY;y<MIDH;y++){const k=y-SY,wv=Math.round(wave(x,W,[[40,1,y*.7],[23,.8,y*1.3]]));let c=mix(sea,hz,.25*(1-k/16));if((x+wv*3+y*5)%(9+k)===0)c=mix(seaL,hz,.2);if(k===0)c=mix(seaL,hz,.3);mid.set(x,y,c)}
      const rk=mix(FAL.cliff,hz,.25),rkd=mix(FAL.cliffD,hz,.25),foam=mix("#ffffff",hz,.15);
      for(let i=0;i<4;i++){const x=r()*W|0,h=8+(r()*12|0),w=3+(r()*4|0);for(let y=SY-h;y<SY+3;y++)for(let q=0;q<w;q++)wset(mid,x+q,y,q===w-1?rkd:q===0?mix(rk,"#ffffff",.12):rk);for(let q=-1;q<=w;q++)wset(mid,x+q,SY+3,foam)}
      const lx=r()*W|0;ellipse(lx+4,SY+2,10,4,(x,y)=>wset(mid,x,y,y<SY+1?mix(rk,"#ffffff",.1):rk));for(let q=-11;q<=11;q++)if(q%3)wset(mid,lx+4+q,SY+5,foam);
      const L0=deco.lighthouse(),sm=new Spr(L0.w,L0.h);for(let i=0;i<L0.p.length;i++)if(L0.p[i])sm.p[i]=mix(L0.p[i],hz,.15);wblit(mid,sm,lx,SY-L0.h+1);meta.lh={x:lx+4,y:SY-L0.h+3};meta.glow.push({x:lx+4,y:SY-L0.h+3,c:"#ffe27a",ph:0,f:.22,s:1.2,fl:1})}
    /* bord de la falaise : herbe rase, pins couchés, menhirs */
    const WH=42,wall=new Spr(512,WH);{const W=512,g0=G[2],gl=mix(G[1],"#ffffff",.1),gd=G[3];
      const h=x=>WH-7-wave(x,W,[[5,1.5,.3],[11,1,1.7]]);
      const things=[];for(let x=r()*30;x<W-20;x+=36+r()*50){const k=r();things.push([k<.55?deco.bentpine(r,18+(r()*14|0)):k<.8?deco.menhir(r):deco.cairn(r),x|0])}
      things.forEach(([sp,x])=>wblit(wall,sp,x,Math.round(h(x+sp.w/2))+3-sp.h));
      for(let x=0;x<W;x++){const top=Math.round(h(x));for(let y=top;y<WH;y++)wset(wall,x,y,y===top?gl:(y===top+1&&(x%3))?gl:((x+y)%5===0?gd:g0))}
      /* herbes couchées sur la crête */
      for(let x=0;x<W;x+=2){const top=Math.round(h(x));if((x*7)%5<3){wset(wall,x,top-1,gl);wset(wall,x+1,top-2,gl)}}}
    /* sol : lande rase couchée par le vent, dalles de pierre */
    const W=768,ground=new Spr(W,TM+GH),ph=[r()*6,r()*6,r()*6];
    for(let y=TM;y<TM+GH;y++)for(let x=0;x<W;x++)ground.p[y*W+x]=G[0];
    for(let i=0;i<130;i++){const rx=8+r()*22,ry=2+r()*5,cx=r()*W,cy=TM+ry+1+r()*(GH-2*ry-2),c=G[1+(i%3)];ellipse(cx,cy,rx,ry,(x,y,d)=>{if(y>=TM&&(d<.7||(x+y)%2===0))wset(ground,x,y,c)})}
    for(let x=0;x<W;x++){wset(ground,x,TM,mix(G[3],DARK,.25));if((x*5)%3)wset(ground,x,TM+1,mix(G[3],DARK,.12))}
    const isG=c=>c===G[0]||c===G[1]||c===G[2]||c===G[3];
    /* brins couchés vers la droite */
    for(let i=0;i<1700;i++){const x=r()*W|0,y=TM+3+(r()*(GH-3)|0),c=r()<.5?G[2]:G[1];if(isG(ground.get(x,y))){wset(ground,x,y,c);wset(ground,x+1,y,c);wset(ground,x+2,y-1,c)}}
    for(let i=0;i<220;i++){const x=r()*W|0,y=TM+4+(r()*(GH-6)|0),c=fl[r()*fl.length|0];if(isG(ground.get(x,y)))wset(ground,x,y,c)}
    /* chemin de dalles irrégulières */
    const pc=x=>PY-1+Math.round(wave(x,W,[[2,2,ph[0]],[5,1,ph[1]]])),st=rgb(FAL.stone),sl=mix(FAL.stone,"#ffffff",.2),sd=rgb(FAL.stoneD),jn=mix(G[3],DARK,.3);
    for(let x=0;x<W;x++){const c=pc(x);for(let y=c-7;y<=c+7;y++)if(Math.abs(y-c)===7&&(x+y)%2)wset(ground,x,y,jn);else if(Math.abs(y-c)<7)wset(ground,x,y,jn)}
    for(let x=0;x<W;){const w=7+(r()*7|0);for(let row=0;row<2;row++){const off=row?((w/2)|0):0;for(let i=1;i<w-1;i++){const xx=x+i+off,c=pc(xx),y0=row?c:c-6,y1=row?c+6:c-1;for(let y=y0;y<y1;y++){const e=y===y0?sl:(y===y1-1||i===w-2)?sd:st;wset(ground,xx,y,(xx*5+y*3)%17===0?sd:e)}}}x+=w}
    const items=[];const put=(cnt,mk,y0,y1,g)=>{for(let i=0;i<cnt;i++){const sp=mk(),x=r()*W|0,y=(y0+r()*(y1-y0))|0;items.push([sp,x,y-sp.h]);if(sp.c)meta.glow.push({x:x+6,y:y-sp.h+6,c:sp.c,ph:r()*6})}};
    put(4,()=>deco.bentpine(r,16+(r()*8|0)),TM+16,PY-10);put(6,()=>prop.rock(r,"#8a8fa6"),TM+8,PY-10);put(3,()=>deco.menhir(r),TM+14,PY-10);put(4,()=>deco.stormcry(r),TM+10,PY-10);put(5,()=>prop.bush(r,"#6a9a7a"),TM+6,PY-10);put(2,()=>deco.cairn(r),TM+10,PY-10);
    put(5,()=>prop.rock(r,"#8a8fa6"),PY+14,TM+GH-6);put(3,()=>deco.stormcry(r),PY+14,TM+GH-6);put(4,()=>prop.bush(r,"#6a9a7a"),PY+14,TM+GH-6);put(2,()=>deco.cairn(r),PY+14,TM+GH-6);put(1,()=>deco.menhir(r),PY+30,TM+GH-6);
    const sc=mix(G[3],DARK,.35);
    items.sort((a,b)=>a[2]+a[0].h-b[2]-b[0].h).forEach(([sp,x,y])=>{for(let i=1;i<sp.w-1;i++){wset(ground,x+i,y+sp.h-1,sc);if(i>1&&i<sp.w-2)wset(ground,x+i,y+sp.h,sc)}wblit(ground,sp,x,y)});
    const bare=(x,y)=>isG(ground.get(x,y));
    const tufts=[];for(let k=0;tufts.length<90&&k<5000;k++){const x=r()*(W-2)|0,y=PY+12+(r()*16|0),h=4+(r()*8|0),w=r()<.3?2:1;let ok=true;
      for(let j=-1;j<=h+1&&ok;j++)for(let q=-1;q<=w+2;q++)if(!bare(x+q,y-j)){ok=false;break}
      if(ok)tufts.push({x,y,h,c:G[1+(k%3)],ph:r()*6,w,f:r()<.1?fl[r()*fl.length|0]:null})}
    const low=falaisesLow(T,G,fl,r,W);
    return{far:far.cvs(),mid:mid.cvs(),wall:wall.cvs(),ground:ground.cvs(),low,gW:W,meta,tufts,clouds:mkClouds("#8a94a8"),G,fl,storm:1,lean:1.4,gulls:1,wind:1,windC:"235,242,255",dayFlies:0,nightFlies:2};
  };
  function falaisesLow(T,G,fl,r,W){const LH=200,s=new Spr(W,LH);for(let i=0;i<W*LH;i++)s.p[i]=G[0];const isG=c=>c===G[0]||c===G[1]||c===G[2]||c===G[3];
    for(let i=0;i<190;i++){const rx=8+r()*22,ry=2+r()*6,cx=r()*W,cy=ry+1+r()*(LH-2*ry-2),c=G[1+(i%3)];ellipse(cx,cy,rx,ry,(x,y,d)=>{if(d<.7||(x+y)%2===0)wset(s,x,y,c)})}
    for(let i=0;i<3400;i++){const x=r()*W|0,y=2+(r()*(LH-3)|0),c=r()<.5?G[2]:G[1];if(isG(s.get(x,y))){wset(s,x,y,c);wset(s,x+1,y,c);wset(s,x+2,y-1,c)}}
    for(let i=0;i<300;i++){const x=r()*W|0,y=2+(r()*(LH-4)|0);if(isG(s.get(x,y)))wset(s,x,y,fl[r()*fl.length|0])}
    const items=[],put=(n,mk)=>{for(let i=0;i<n;i++){const sp=mk();items.push([sp,r()*W|0,2+(r()*(LH-sp.h-5)|0)])}};
    put(16,()=>prop.rock(r,"#8a8fa6"));put(14,()=>prop.bush(r,"#6a9a7a"));put(4,()=>deco.bentpine(r,16+(r()*8|0)));put(4,()=>deco.menhir(r));put(5,()=>deco.cairn(r));put(6,()=>deco.stormcry(r));
    const sc=mix(G[3],DARK,.35);items.sort((a,b)=>a[2]+a[0].h-b[2]-b[0].h).forEach(([sp,x,y])=>{for(let i=1;i<sp.w-1;i++)wset(s,x+i,y+sp.h-1,sc);wblit(s,sp,x,y)});
    return s.cvs()}

})();
