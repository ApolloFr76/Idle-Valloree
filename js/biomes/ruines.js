/* Décor du monde « Ruines d'Astrelune » : plans du paysage générés une fois (fonction BIOME.ruines, lue par js/monde.js). */
(()=>{
  const{Spr,prop,rng,rgb,mix,TH,DARK,LIGHT,INK,calm,R,TAU,css,wave,wset,wblit,wget,ellipse,deco,FARH,MIDH,WALLH,TM,GH,PY,mkClouds,BIOME}=MK;
  /* ================= Ruines d'Astrelune ================= */
  /* temple céleste au-dessus des nuages : ciel violet étoilé, grand croissant de lune, mer de nuages
     et flèches lointaines, colonnade et observatoire en ruine, colonnes brisées, sol de mosaïque
     étoilée ; îles flottantes qui tanguent, éclats de cristal en suspens, constellations, étoiles filantes */
  const AST={stone:"#d8d2e8",stoneL:"#f0ecf8",stoneD:"#9a92b8",moss:"#6a9a8a",gold:"#ffe27a",cry:"#8ad0ff",cryL:"#d8f4ff",flame:"#7ad8ff",haze:"#b8a8e0",cloud:"#e8e0f8"};
  Object.assign(deco,{
    /* colonne brisée haute (premier rang) */
    tcol(r,h){const s=new Spr(14,h+3),c=AST.stone;s.part(c,q=>{q.rect(3,5,8,h-4);q.rect(1,h,12,3);q.rect(2,3,10,2)},{lt:.35,dk:.35});for(let y=6;y<h;y++){s.set(5,y,AST.stoneD);s.set(8,y,AST.stoneD)}
      s.part(AST.stoneL,q=>q.poly([[2,3],[5,0],[7,2],[10,0],[12,3]]),{flat:1});for(let i=0;i<8;i++){const y=6+(r()*(h-8)|0);if(r()<.6){s.set(3,y,AST.moss);s.set(4,y+1,AST.moss)}}return s.outline("#4a426a")},
    /* tronçon de colonne couché */
    drum(r){const s=new Spr(16,9),c=AST.stone;s.part(c,q=>{q.rect(1,2,12,6)},{lt:.35,dk:.35});s.part(AST.stoneL,q=>q.ell(13,5,2.4,3.4),{flat:1});s.set(13,5,AST.stoneD);for(let x=2;x<12;x+=3)s.set(x,4,AST.stoneD);return s.outline("#4a426a")},
    /* tête de statue tombée */
    head(r){const s=new Spr(11,10),c=AST.stone;s.part(c,q=>{q.ell(5.5,5,4,4);q.rect(3,8,5,2)},{lt:.35,dk:.35});s.set(4,4,"#7a729a");s.set(7,4,"#7a729a");s.set(5,7,"#7a729a");s.set(6,7,"#7a729a");s.part(AST.gold,q=>{q.px(3,1);q.px(5,0);q.px(7,1)},{flat:1});return s.outline("#4a426a")},
    /* brasero à flamme bleue (luit, vacille) */
    brazier(r){const s=new Spr(9,14);s.part("#8a82a8",q=>{q.rect(4,6,1,7);q.rect(2,12,5,2);q.poly([[0,4],[8,4],[6,7],[2,7]])},{lt:.3});s.part(AST.flame,q=>{q.poly([[2,4],[4,0],[6,4]])},{flat:1});s.set(4,2,"#ffffff");s.c=AST.flame;s.fl=1;return s.outline("#3a3256")},
    /* cristal astral */
    astcry(r){const s=prop.crystal(r,AST.cry);s.c=AST.cry;return s},
    /* île flottante avec un bout de ruine */
    isle(r){const w=22+(r()*20|0),h=Math.round(w*.75),s=new Spr(w,h),c=mix(AST.stoneD,AST.haze,.2);
      s.part(c,q=>{q.poly([[0,6],[w,6],[w*.62,h-1],[w*.4,h-3]])},{lt:.25,dk:.35});s.part("#7aaa8a",q=>{q.rect(0,4,w,3)},{flat:1});for(let x=0;x<w;x+=2)s.set(x,3,"#9aca9a");
      for(let k=0;k<3;k++){const x=4+(r()*(w-8)|0);for(let y=7;y<7+(r()*8|0);y++)s.set(x,y,"#5a7a5a")}
      if(r()<.7){const x=3+(r()*(w-10)|0);for(let y=-0;y<4;y++)for(let i=0;i<2;i++)s.set(x+i,y,AST.stone);s.set(x+5,0,AST.stone);s.set(x+5,1,AST.stone);s.set(x+5,2,AST.stone);s.set(x+5,3,AST.stone);for(let i=0;i<7;i++)s.set(x+i,0,AST.stoneL)}
      return s.outline("#4a426a")},
  });
  BIOME.ruines=function(zid){
    const T=TH.ruines,G=T.g.map(rgb),fl=T.fl,r=rng(zid.length*1013+zid.charCodeAt(0)*7),meta={mills:[],houses:[],ponds:[],glow:[],rays:[],shards:[]},hz=AST.haze;
    /* mer de nuages et flèches lointaines */
    const far=new Spr(480,FARH);{const W=480,cl=rgb(mix(AST.cloud,hz,.2)),cs=mix(AST.cloud,hz,.5),sp=mix(AST.stoneD,hz,.55);
      for(let i=0;i<8;i++){const x=r()*W|0,h=18+(r()*22|0),w=3+(r()*3|0);for(let y=FARH-h;y<FARH;y++)for(let q=0;q<w;q++)wset(far,x+q,y,q===w-1?mix(sp,DARK,.1):sp);for(let k=1;k<5;k++)wset(far,x+(w>>1),FARH-h-k,sp);wset(far,x+(w>>1),FARH-h-5,mix(AST.gold,hz,.3))}
      for(let x=0;x<W;x++){const top=Math.round(FARH-12-wave(x,W,[[11,2.5,1],[23,1.5,2],[5,1.5,0]]));for(let y=Math.max(0,top);y<FARH;y++)far.set(x,y,y<=top+1?cl:(y-top)%5===0&&(x+y)%3?cs:cl)}}
    /* colonnade et observatoire en ruine */
    const mid=new Spr(640,MIDH);{const W=640,c=mix(AST.stone,hz,.35),cd=mix(AST.stoneD,hz,.3),cl=mix(AST.stoneL,hz,.3),cb=mix(AST.cloud,hz,.15);
      for(let x=0;x<W;x++){const top=MIDH-8+Math.round(wave(x,W,[[9,1.5,2],[17,1,1]]));for(let y=top;y<MIDH;y++)mid.set(x,y,y===top?cl:c)}
      for(let x0=r()*30|0;x0<W-30;x0+=60+(r()*80|0)){const n=3+(r()*4|0),h=16+(r()*10|0),bk=r()*n|0;for(let i=0;i<n;i++){const x=x0+i*9,hh=i===bk?h*.5|0:h;for(let y=MIDH-8-hh;y<MIDH-7;y++){wset(mid,x,y,cl);wset(mid,x+1,y,c);wset(mid,x+2,y,c);wset(mid,x+3,y,cd)}}
        for(let i=0;i<n*9-5;i++)if(i<bk*9-1||i>bk*9+8){wset(mid,x0+i,MIDH-8-h-1,cl);wset(mid,x0+i,MIDH-8-h,c);wset(mid,x0+i,MIDH-8-h+1,cd)}}
      /* observatoire : dôme fendu */
      const ox=r()*W|0;ellipse(ox+14,MIDH-24,13,12,(x,y)=>{if(y<MIDH-24&&!(x>ox+15&&x<ox+19))wset(mid,x,y,y<MIDH-33?cl:c)});for(let y=MIDH-24;y<MIDH-7;y++)for(let x=ox+2;x<ox+27;x++)wset(mid,x,y,(x-ox)%6===0?cd:c);
      for(let y=MIDH-20;y<MIDH-7;y++)for(let x=ox+11;x<ox+17;x++)wset(mid,x,y,y<MIDH-18&&(x===ox+11||x===ox+16)?c:"#3a3260");wset(mid,ox+17,MIDH-36,mix(AST.gold,hz,.2))}
    /* premier rang : grandes colonnes brisées, arches, lierre, éclats flottants */
    const WH=74,wall=new Spr(512,WH);{const W=512,c=rgb(AST.stone),cd=rgb(AST.stoneD);
      const h=x=>WH-6-wave(x,W,[[5,1.5,.3],[13,1,1]]);
      for(let x0=r()*30|0;x0<W-40;x0+=70+(r()*60|0)){const kind=r();
        if(kind<.45){/* arche */const aw=26+(r()*10|0),ah=40+(r()*16|0),by=Math.round(h(x0+aw/2))+3,s=new Spr(aw+8,ah);s.part(AST.stone,q=>{q.rect(0,8,6,ah-8);q.rect(aw+2,8+(r()<.4?14:0),6,ah-8);for(let i=0;i<=aw+8;i++){const dx=(i-(aw+8)/2)/((aw+8)/2),yy=Math.round(10*(1-Math.sqrt(Math.max(0,1-dx*dx))));if(i<aw*.7||r()<.3)q.rect(i,yy,1,6)}},{lt:.3,dk:.35});
          for(let y=10;y<ah;y+=5)for(let x=0;x<s.w;x++)if(s.get(x,y))s.set(x,y,AST.stoneD);for(let i=0;i<30;i++){const x=r()*s.w|0,y=r()*ah|0;if(s.get(x,y)&&!s.get(x-1,y))s.set(x,y,AST.moss)}s.outline("#4a426a");wblit(wall,s,x0,by-ah)}
        else{const n=1+(r()*3|0);for(let k=0;k<n;k++){const hh=30+(r()*36|0),col=deco.tcol(r,hh),x=x0+k*18;wblit(wall,col,x,Math.round(h(x+7))+3-col.h)}}
        /* éclats de cristal en suspens au-dessus des ruines */
        if(r()<.8)meta.shards.push({x:x0+10+(r()*30|0),y:12+(r()*22|0),ph:r()*6,s:r()<.5?1:2})}
      for(let x=0;x<W;x++){const top=Math.round(h(x));for(let y=top;y<WH;y++)wset(wall,x,y,y===top?AST.stoneL:(x*3+y*7)%11===0?cd:c)}
      for(let i=0;i<16;i++){const b=prop.bush(r,AST.moss),x=r()*W|0;wblit(wall,b,x,Math.round(h(x+7))+3-b.h)}
      /* lierre qui retombe des ruines */
      for(let i=0;i<40;i++){const x=r()*W|0;let y=0;while(y<WH-8&&!wget(wall,x,y))y++;if(y>4&&y<WH-20){const l=4+(r()*12|0);for(let j=0;j<l;j++){wset(wall,x,y+j,j%3?"#5a8a6a":"#7aaa8a");if(j%4===1)wset(wall,x+1,y+j,"#7aaa8a")}}}
      meta.shards.forEach(s=>meta.glow.push({x:s.x,y:s.y,c:AST.cry,ph:s.ph,f:.5}))}
    /* sol : dallage en mosaïque étoilée, joints moussus, allée incrustée d'or */
    const W=768,ground=new Spr(W,TM+GH),ph=[r()*6,r()*6,r()*6];
    for(let y=TM;y<TM+GH;y++)for(let x=0;x<W;x++)ground.p[y*W+x]=G[0];
    /* dalles irrégulières */
    for(let y=TM+2;y<TM+GH-2;y+=6){const off=((y/6|0)%2)*5;for(let x=-off;x<W;){const w=8+(r()*7|0),c=G[(r()*3|0)];for(let j=0;j<5;j++)for(let i=0;i<w-1;i++)wset(ground,x+i,y+j,j===0&&i%3?mix(c,"#ffffff",.06):(i===w-2&&j%2)||(j===4&&i%2)?mix(c,DARK,.07):c);x+=w}}
    for(let x=0;x<W;x++){wset(ground,x,TM,mix(G[3],DARK,.25));wset(ground,x,TM+1,mix(G[3],DARK,.1))}
    /* mousse dans les joints, dalles fendues */
    const jn=c=>{const k=c&&c[0]+c[1]+c[2];return k&&k<rgb(G[3]).reduce((a,b)=>a+b,0)};
    for(let i=0;i<1600;i++){const x=r()*W|0,y=TM+3+(r()*(GH-4)|0);const c=ground.get(x,y);if(c&&jn(c))wset(ground,x,y,r()<.5?AST.moss:"#7aaa8a")}
    for(let i=0;i<28;i++){const rx=5+r()*12,ry=1.5+r()*3,cx=r()*W,cy=TM+ry+3+r()*(GH-2*ry-6);ellipse(cx,cy,rx,ry,(x,y,d)=>{if(d<.5||(x+y)%2===0)wset(ground,x,y,(x+y)%3?"#7aa890":AST.moss)})}
    for(let i=0;i<30;i++){let x=r()*W,y=TM+4+r()*(GH-8);for(let j=0;j<6;j++){x+=1;y+=(r()-.5)*1.4;if(y>TM+2&&y<TM+GH-2)wset(ground,x,y|0,mix(G[3],DARK,.3))}}
    /* rosaces d'étoiles incrustées */
    for(let i=0;i<10;i++){const cx=r()*W|0,cy=TM+6+(r()*(GH-12)|0);for(let k=0;k<8;k++){const a=k*Math.PI/4,l=k%2?2:4;for(let j=1;j<=l;j++)wset(ground,cx+Math.round(Math.cos(a)*j),cy+Math.round(Math.sin(a)*j*.6),mix(AST.gold,G[0],.3))}wset(ground,cx,cy,AST.gold)}
    /* allée : dalles claires bordées d'or, étoiles incrustées */
    const P0=rgb(T.path),pl=mix(P0,"#ffffff",.3),pd=mix(P0,DARK,.12),gd=mix(AST.gold,P0,.25);
    const pc=x=>PY-1+Math.round(wave(x,W,[[2,1.5,ph[0]],[5,.8,ph[1]]]));
    for(let x=0;x<W;x++){const c=pc(x);for(let y=c-6;y<=c+6;y++){const e=Math.abs(y-c);wset(ground,x,y,e===6?gd:e===5?pd:((x%10===0)?pd:(y===c-4?pl:P0)))}}
    for(let x=5;x<W;x+=20){const c=pc(x);[[0,0],[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>wset(ground,x+dx,c+dy,AST.gold))}
    const items=[];const put=(cnt,mk,y0,y1)=>{for(let i=0;i<cnt;i++){const sp=mk(),x=r()*W|0,y=(y0+r()*(y1-y0))|0;items.push([sp,x,y-sp.h]);if(sp.c)meta.glow.push({x:x+(sp.w>>1),y:y-sp.h+(sp.fl?2:6),c:sp.c,ph:r()*6,fl:sp.fl,s:sp.fl?1.3:1})}};
    put(4,()=>deco.drum(r),TM+10,PY-9);put(2,()=>deco.head(r),TM+10,PY-9);put(3,()=>deco.brazier(r),TM+16,PY-9);put(5,()=>deco.astcry(r),TM+10,PY-9);put(5,()=>prop.rock(r,"#9a92b4"),TM+8,PY-9);put(5,()=>prop.bush(r,AST.moss),TM+6,PY-9);put(3,()=>prop.pillar(r,AST.stone),TM+14,PY-9);
    put(3,()=>deco.drum(r),PY+14,TM+GH-6);put(1,()=>deco.head(r),PY+14,TM+GH-6);put(2,()=>deco.brazier(r),PY+16,TM+GH-6);put(3,()=>deco.astcry(r),PY+14,TM+GH-6);put(4,()=>prop.rock(r,"#9a92b4"),PY+12,TM+GH-6);put(4,()=>prop.bush(r,AST.moss),PY+12,TM+GH-6);
    const sc=mix(G[3],DARK,.3);
    items.sort((a,b)=>a[2]+a[0].h-b[2]-b[0].h).forEach(([sp,x,y])=>{for(let i=1;i<sp.w-1;i++){wset(ground,x+i,y+sp.h-1,sc);if(i>1&&i<sp.w-2)wset(ground,x+i,y+sp.h,sc)}wblit(ground,sp,x,y)});
    /* îles flottantes (dans le ciel, défilement 0,12) */
    const isles=[];for(let i=0;i<5;i++){const s=deco.isle(r);isles.push({cv:s.cvs(),x:(i*180+r()*120)|0,yf:r(),ph:r()*6,w:s.w})}
    const low=ruinesLow(T,G,r,W);
    return{far:far.cvs(),mid:mid.cvs(),wall:wall.cvs(),ground:ground.cvs(),low,gW:W,meta,tufts:[],isles,clouds:mkClouds("#f0e8ff").slice(0,3),G,fl,astral:1,dark:1,flyC:["#c8b8f0","#9a7af0","#ffe27a"],motes:1,dayFlies:7,nightFlies:10,nightC:"200,180,255",
      sky:{day:["#5a5ab8","#e0c8f0"],dawn:["#4a3a90","#f0b8c8"],dusk:["#2a1a6a","#c888c8"],night:["#0c0828","#2a1a5a"]},tint:{night:"rgba(20,14,60,.42)"}};
  };
  function ruinesLow(T,G,r,W){const LH=200,s=new Spr(W,LH);for(let i=0;i<W*LH;i++)s.p[i]=G[0];
    for(let y=0;y<LH;y+=5){const off=((y/5|0)%2)*5;for(let x=-off;x<W;){const w=8+(r()*7|0),c=G[(r()*3|0)];for(let j=0;j<5;j++)for(let i=0;i<w-1;i++)wset(s,x+i,y+j,j===0&&i%3?mix(c,"#ffffff",.06):(i===w-2&&j%2)||(j===4&&i%2)?mix(c,DARK,.07):c);x+=w}}
    const jn=c=>{const k=c&&c[0]+c[1]+c[2];return k&&k<rgb(G[3]).reduce((a,b)=>a+b,0)};
    for(let i=0;i<2600;i++){const x=r()*W|0,y=1+(r()*(LH-2)|0);const c=s.get(x,y);if(c&&jn(c))wset(s,x,y,r()<.5?AST.moss:"#7aaa8a")}
    for(let i=0;i<16;i++){const cx=r()*W|0,cy=6+(r()*(LH-12)|0);for(let k=0;k<8;k++){const a=k*Math.PI/4,l=k%2?2:4;for(let j=1;j<=l;j++)wset(s,cx+Math.round(Math.cos(a)*j),cy+Math.round(Math.sin(a)*j*.6),mix(AST.gold,G[0],.3))}wset(s,cx,cy,AST.gold)}
    const items=[],put=(n,mk)=>{for(let i=0;i<n;i++){const sp=mk();items.push([sp,r()*W|0,2+(r()*(LH-sp.h-5)|0)])}};
    put(10,()=>deco.drum(r));put(4,()=>deco.head(r));put(10,()=>deco.astcry(r));put(12,()=>prop.rock(r,"#9a92b4"));put(14,()=>prop.bush(r,AST.moss));put(6,()=>prop.pillar(r,AST.stone));
    const sc=mix(G[3],DARK,.3);items.sort((a,b)=>a[2]+a[0].h-b[2]-b[0].h).forEach(([sp,x,y])=>{for(let i=1;i<sp.w-1;i++)wset(s,x+i,y+sp.h-1,sc);wblit(s,sp,x,y)});
    return s.cvs()}

  Object.assign(MK,{AST});   /* aussi utilisé par js/monde.js ou par d'autres biomes */
})();
