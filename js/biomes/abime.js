/* Décor du monde « Abîme de Nuitombre » : plans du paysage générés une fois (fonction BIOME.abime, lue par js/monde.js). */
(()=>{
  const{Spr,prop,rng,rgb,mix,TH,DARK,LIGHT,INK,calm,R,TAU,css,wave,wset,wblit,wget,ellipse,deco,FARH,MIDH,WALLH,TM,GH,PY,mkClouds,BIOME}=MK; const{crowns}=MK;
  /* ================= Abîme de Nuitombre ================= */
  /* au bord du gouffre : ciel de néant aux nébuleuses violettes, faille lumineuse déchirée dans le ciel,
     falaises noires liserées de violet, flèches torses à pointe de cristal, grands cristaux, racines
     tordues et chaînes brisées ; des yeux qui clignent dans le noir, brume violette, débris qui montent */
  const ABY={rock:"#2a2040",rockL:"#4a3a6a",rim:"#9a6aff",cry:["#c06aff","#ff6ab0","#7ae0d0"],void:"#b83ad0",voidL:"#ff9af0",voidD:"#5a1a7a",root:"#1e1630",chain:"#5a5470",bone:"#cfc6e0",haze:"#3a2a5a"};
  Object.assign(deco,{
    /* grande grappe de cristaux du néant */
    vcluster(r,h){const c=ABY.cry[r()<.6?0:r()<.5?1:2];h=h||14+(r()*14|0);const w=Math.round(h*.9),s=new Spr(w,h);s.part(c,q=>{q.poly([[w*.1,h-1],[w*.25,h*.35],[w*.38,h-1]]);q.poly([[w*.3,h-1],[w*.5,0],[w*.66,h-1]]);q.poly([[w*.6,h-1],[w*.8,h*.45],[w*.92,h-1]])},{lt:.6,dk:.3});
      s.set(Math.round(w*.5),2,"#ffffff");s.set(Math.round(w*.25),Math.round(h*.4),mix(c,"#ffffff",.6));s.c=c;return s.outline(mix(c,INK,.75))},
    /* racine tordue qui sort du sol, comme un tentacule */
    tendril(r){const h=18+(r()*16|0),s=new Spr(14,h),ph=r()*6;s.part(ABY.root,q=>{for(let y=0;y<h;y++){const x=6+Math.sin(y/5+ph)*3*(1-y/h),w=Math.max(1,Math.round(1+(y/h)*3));q.rect(Math.round(x),y,w,1)}},{flat:1});
      for(let y=2;y<h;y+=4){const x=Math.round(6+Math.sin(y/5+ph)*3*(1-y/h));s.set(x,y,ABY.rockL)}return s.outline("#0c0814")},
    /* chaîne brisée qui pend */
    chain(r){const l=8+(r()*14|0),s=new Spr(4,l);for(let y=0;y<l;y++){const k=y%3;if(k===0){s.set(1,y,ABY.chain);s.set(2,y,ABY.chain)}else{s.set(k===1?0:3,y,ABY.chain);s.set(k===1?3:0,y,mix(ABY.chain,DARK,.4))}}return s},
    /* pierre runique */
    runestone(r){const s=new Spr(9,13);s.part(ABY.rockL,q=>q.poly([[1,12],[1,3],[4,0],[8,3],[8,12]]),{lt:.3,dk:.4});[[4,4],[3,5],[5,5],[4,6],[4,8],[3,9],[5,9]].forEach(([x,y])=>s.set(x,y,ABY.voidL));s.c=ABY.void;return s.outline("#0c0814")},
    vbone(r){const s=prop.bone(r);for(let i=0;i<s.p.length;i++)if(s.p[i]&&s.p[i][0]>200)s.p[i]=rgb(ABY.bone);return s},
  });
  BIOME.abime=function(zid){
    const T=TH.abime,G=T.g.map(rgb),fl=T.fl,r=rng(zid.length*1013+zid.charCodeAt(0)*7),meta={mills:[],houses:[],ponds:[],glow:[],rays:[],lava:[],eyes:[]},hz=ABY.haze;
    /* falaises noires du gouffre, liserées de violet */
    const far=new Spr(480,FARH);{const W=480,c=mix(ABY.rock,hz,.3),rim=mix(ABY.rim,hz,.35),h=crowns(W,r,9,10,24,.8);
      for(let x=0;x<W;x++){const top=Math.round(FARH-h[x]);for(let y=Math.max(0,top);y<FARH;y++)far.set(x,y,y===top?rim:(y===top+1&&x%2)?rim:c)}
      for(let i=0;i<8;i++){const x=r()*W|0,y=10+(r()*30|0);if(far.get(x,y)){far.set(x,y,mix(ABY.cry[r()*3|0],hz,.2))}}}
    /* flèches torses à pointe de cristal, mare de néant */
    const mid=new Spr(640,MIDH);{const W=640,c=mix(ABY.rock,hz,.15),cl=mix(ABY.rim,hz,.3);
      for(let x=0;x<W;x++){const top=MIDH-10+Math.round(wave(x,W,[[7,2,1],[13,1.2,2]]));for(let y=top;y<MIDH;y++)mid.set(x,y,y===top?cl:c)}
      for(let i=0;i<14;i++){const x0=r()*W|0,h=16+(r()*26|0),ph=r()*6,bend=(r()-.5)*8;for(let y=0;y<h;y++){const f=y/h,x=Math.round(x0+Math.sin(f*3+ph)*2+bend*f),w=Math.max(1,Math.round((1-f)*4));for(let q=0;q<w;q++)wset(mid,x+q,MIDH-9-y,q===0?cl:c)}
        const tx=Math.round(x0+Math.sin(3+ph)*2+bend),ty=MIDH-9-h,cc=ABY.cry[r()*3|0];wset(mid,tx,ty,cc);wset(mid,tx,ty-1,cc);wset(mid,tx,ty-2,mix(cc,"#ffffff",.5));meta.glow.push({x:tx,y:ty,c:cc,ph:r()*6,f:.22})}
      const px=r()*W|0;ellipse(px,MIDH-5,22,2.5,(x,y)=>wset(mid,x,y,y<MIDH-5?ABY.voidL:ABY.void));meta.glow.push({x:px,y:MIDH-5,c:ABY.void,ph:0,f:.22,s:1.6})}
    /* premier rang : grands cristaux, racines tordues, chaînes, rochers ; des yeux dans l'ombre */
    const WH=64,wall=new Spr(512,WH);{const W=512,rc=rgb(ABY.rock),rl=rgb(ABY.rockL),rim=rgb(ABY.rim);
      const h=x=>WH-14-wave(x,W,[[4,5,.7],[9,3,1.9],[17,1.5,0]]);
      /* masses rocheuses sombres au fond, avec des creux où brillent des yeux */
      for(let x=0;x<W;x++){const top=Math.round(h(x)-14-wave(x,W,[[6,6,1],[3,6,2]]));for(let y=Math.max(0,top);y<WH;y++)wset(wall,x,y,y===top?mix(rim,rc,.5):mix(rc,DARK,.25))}
      for(let i=0;i<9;i++)meta.eyes.push({x:r()*W|0,y:WH-34+(r()*14|0),ph:r(),per:4+r()*6,c:r()<.5?"255,220,90":"255,110,200",f:.5});
      const items=[];for(let x=r()*20;x<W-10;x+=18+r()*30){const k=r();items.push([k<.45?deco.vcluster(r,22+(r()*16|0)):k<.75?deco.tendril(r):deco.runestone(r),x|0])}
      items.forEach(([sp,x])=>{const y=Math.round(h(x+sp.w/2))+4-sp.h;wblit(wall,sp,x,y);if(sp.c)meta.glow.push({x:x+(sp.w>>1),y:y+(sp.h>>2)+2,c:sp.c,ph:r()*6,f:.5})});
      for(let x=0;x<W;x++){const top=Math.round(h(x));for(let y=top;y<WH;y++)wset(wall,x,y,y===top?rim:y===top+1&&x%2?mix(rim,rc,.5):(x*3+y*7)%11===0?rl:rc)}
      for(let i=0;i<10;i++){const ch=deco.chain(r),x=r()*W|0;let y=0;while(y<WH-1&&!wget(wall,x+1,y))y++;wblit(wall,ch,x,Math.max(0,y-ch.h-((r()*6)|0)))}}
    /* sol : roche violette, veines qui luisent, mares de néant, allée runique */
    const W=768,ground=new Spr(W,TM+GH),ph=[r()*6,r()*6,r()*6];
    for(let y=TM;y<TM+GH;y++)for(let x=0;x<W;x++)ground.p[y*W+x]=G[0];
    for(let i=0;i<140;i++){const rx=6+r()*20,ry=2+r()*6,cx=r()*W,cy=TM+ry+1+r()*(GH-2*ry-2),c=G[1+(i%3)];ellipse(cx,cy,rx,ry,(x,y,d)=>{if(y>=TM&&(d<.7||(x+y)%2===0))wset(ground,x,y,c)})}
    for(let x=0;x<W;x++){wset(ground,x,TM,mix(ABY.rim,G[0],.4));wset(ground,x,TM+1,mix(G[3],DARK,.15))}
    for(let i=0;i<900;i++){const x=r()*W|0,y=TM+3+(r()*(GH-4)|0);wset(ground,x,y,r()<.5?G[2]:mix(G[1],"#ffffff",.06))}
    const cracks=[];for(let i=0;i<30;i++){let x=r()*W,y=TM+5+r()*(GH-10);const n=6+(r()*14|0);for(let j=0;j<n;j++){x+=1;y+=(r()-.5)*1.6;if(y>TM+2&&y<TM+GH-2){wset(ground,x,y|0,j%4===0?ABY.voidL:ABY.voidD);cracks.push([((x|0)%W+W)%W,y|0])}}}
    const vv=rgb(ABY.void),vl=rgb(ABY.voidL),vd=rgb(ABY.voidD),cr=rgb("#1a1028");
    for(let k=0;k<2;k++){const cx=(k*W/2+80+r()*200)|0,cy=TM+19,rx=18+(r()*8|0),ry=5;meta.lava.push({x:cx,y:cy,rx,ry});meta.glow.push({x:cx,y:cy,c:ABY.void,ph:r()*6,s:1.8});
      ellipse(cx,cy,rx+2.5,ry+2,(x,y)=>wset(ground,x,y,cr));ellipse(cx,cy,rx,ry,(x,y,d)=>{let c=vv;if(d>.7&&(x+y)%2)c=vd;else if(d<.25||((x*5+y*3)%13===0))c=vl;wset(ground,x,y,c)})}
    const P0=rgb(T.path),pl=mix(P0,"#ffffff",.12),pd=mix(P0,DARK,.25),ed=mix(G[3],DARK,.3);
    const pc=x=>PY-1+Math.round(wave(x,W,[[2,2,ph[0]],[5,1,ph[1]]])),phw=x=>6+Math.round(wave(x,W,[[3,1.2,ph[2]]]));
    for(let x=0;x<W;x++){const c=pc(x),h=phw(x);for(let y=c-h-1;y<=c+h+1;y++){const e=Math.abs(y-c);if(e>h){if((x+y)%2===0)wset(ground,x,y,ed)}else if(e===h){if((x+y)%2===0)wset(ground,x,y,P0)}else wset(ground,x,y,P0)}}
    for(let i=0;i<400;i++){const x=r()*W|0,c=pc(x),h=phw(x)-1,y=c-h+(r()*h*2|0);wset(ground,x,y,r()<.4?pl:pd)}
    const runes=[];for(let x=8;x<W;x+=24){const c=pc(x),k=(x/24|0)%4;const pts=[[[0,-1],[0,0],[0,1],[-1,-1],[1,1]],[[-1,0],[0,0],[1,0],[0,-1]],[[-1,-1],[0,0],[1,1],[1,-1],[-1,1]],[[0,-1],[-1,0],[1,0],[0,1]]][k];pts.forEach(([dx,dy])=>{wset(ground,x+dx,c+dy,ABY.voidL);runes.push([x+dx,c+dy])})}
    const items=[];const put=(cnt,mk,y0,y1)=>{for(let i=0;i<cnt;i++){const sp=mk();let x,y,t=0;do{x=r()*W|0;y=(y0+r()*(y1-y0))|0;t++}while(t<30&&meta.lava.some(p=>Math.abs(x+sp.w/2-p.x)<p.rx+sp.w/2+4&&y>p.y-p.ry-4&&y-sp.h<p.y+p.ry+2));items.push([sp,x,y-sp.h]);if(sp.c)meta.glow.push({x:x+(sp.w>>1),y:y-sp.h+5,c:sp.c,ph:r()*6})}};
    put(6,()=>deco.vcluster(r),TM+12,PY-9);put(4,()=>deco.tendril(r),TM+22,PY-9);put(3,()=>deco.runestone(r),TM+14,PY-9);put(6,()=>prop.rock(r,ABY.rockL),TM+8,PY-9);put(3,()=>deco.vbone(r),TM+8,PY-9);
    put(4,()=>deco.vcluster(r),PY+14,TM+GH-6);put(2,()=>deco.tendril(r),PY+24,TM+GH-6);put(5,()=>prop.rock(r,ABY.rockL),PY+12,TM+GH-6);put(3,()=>deco.vbone(r),PY+12,TM+GH-6);put(1,()=>deco.runestone(r),PY+16,TM+GH-6);
    const sc=mix(G[3],DARK,.4);
    items.sort((a,b)=>a[2]+a[0].h-b[2]-b[0].h).forEach(([sp,x,y])=>{for(let i=1;i<sp.w-1;i++){wset(ground,x+i,y+sp.h-1,sc);if(i>1&&i<sp.w-2)wset(ground,x+i,y+sp.h,sc)}wblit(ground,sp,x,y)});
    /* nébuleuse (ciel), dessinée en transparence */
    const NW=420,NH=70,neb=new Spr(NW,NH);for(let i=0;i<26;i++){const cx=r()*NW,cy=10+r()*(NH-20),rx=14+r()*30,ry=5+r()*10,c=["#6a2a9a","#2a4a9a","#9a2a7a"][i%3];ellipse(cx,cy,rx,ry,(x,y,d)=>{if(y>=0&&y<NH&&(d<.35||(d<.75&&(x+y)%2===0)||(x*3+y)%5===0&&d<1))wset(neb,x,y,c)})}
    const low=abimeLow(T,G,r,W);
    return{far:far.cvs(),mid:mid.cvs(),wall:wall.cvs(),ground:ground.cvs(),low,gW:W,meta,tufts:[],cracks,runes,neb:neb.cvs(),clouds:[],G,fl,abyss:1,dark:1,mist:1,mistC:"150,90,220",flyC:["#c9b8ff","#ff8ad0","#8ad0ff"],motes:1,dayFlies:8,nightFlies:12,nightC:"122,224,208",
      sky:{day:["#160c2a","#40285e"],dawn:["#1a0c2a","#5a2a5a"],dusk:["#120a24","#3a1a4e"],night:["#08040f","#22143a"]},tint:{day:null,dawn:null,dusk:"rgba(40,10,60,.15)",night:"rgba(10,4,24,.35)"}};
  };
  function abimeLow(T,G,r,W){const LH=200,s=new Spr(W,LH);for(let i=0;i<W*LH;i++)s.p[i]=G[0];
    for(let i=0;i<200;i++){const rx=6+r()*22,ry=2+r()*7,cx=r()*W,cy=ry+1+r()*(LH-2*ry-2),c=G[1+(i%3)];ellipse(cx,cy,rx,ry,(x,y,d)=>{if(d<.7||(x+y)%2===0)wset(s,x,y,c)})}
    for(let i=0;i<1600;i++){const x=r()*W|0,y=1+(r()*(LH-2)|0);wset(s,x,y,r()<.5?G[2]:mix(G[1],"#ffffff",.06))}
    for(let i=0;i<46;i++){let x=r()*W,y=4+r()*(LH-8);const n=6+(r()*14|0);for(let j=0;j<n;j++){x+=1;y+=(r()-.5)*1.6;if(y>1&&y<LH-2)wset(s,x,y|0,j%4===0?ABY.voidL:ABY.voidD)}}
    const items=[],put=(n,mk)=>{for(let i=0;i<n;i++){const sp=mk();items.push([sp,r()*W|0,2+(r()*(LH-sp.h-5)|0)])}};
    put(12,()=>deco.vcluster(r));put(6,()=>deco.tendril(r));put(5,()=>deco.runestone(r));put(14,()=>prop.rock(r,ABY.rockL));put(8,()=>deco.vbone(r));
    const sc=mix(G[3],DARK,.4);items.sort((a,b)=>a[2]+a[0].h-b[2]-b[0].h).forEach(([sp,x,y])=>{for(let i=1;i<sp.w-1;i++)wset(s,x+i,y+sp.h-1,sc);wblit(s,sp,x,y)});
    return s.cvs()}

})();
