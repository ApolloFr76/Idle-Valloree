/* Décor du monde « Volcan de Brasemont » : plans du paysage générés une fois (fonction BIOME.volcan, lue par js/monde.js). */
(()=>{
  const{Spr,prop,rng,rgb,mix,TH,DARK,LIGHT,INK,calm,R,TAU,css,wave,wset,wblit,wget,ellipse,deco,FARH,MIDH,WALLH,TM,GH,PY,mkClouds,BIOME}=MK; const{crowns}=MK;
  /* ================= Volcan de Brasemont ================= */
  /* terre de feu : ciel rouge et enfumé, volcan qui fume et entre en éruption, orgues de basalte,
     lac de lave, flèches d'obsidienne, arbres calcinés, roche noire aux fissures luisantes,
     mares de lave qui bouillonnent, fumerolles ; braises qui montent et cendres qui tombent */
  const VOL={rock:"#3e3034",rockL:"#5a464a",rockD:"#2a1e22",lava:"#ff7a2c",lavaL:"#ffd84a",lavaD:"#c8381a",crust:"#4a2a22",obs:"#2a2238",obsL:"#5a4a7a",basalt:"#4a4048",char:"#2a1e1a",haze:"#8a4a3a"};
  Object.assign(deco,{
    /* flèche d'obsidienne */
    obsidian(r){const h=10+(r()*12|0),s=new Spr(9,h+1);s.part(VOL.obs,q=>{q.poly([[1,h],[4,0],[5,3],[8,h]])},{lt:.5,dk:.3});s.set(4,2,"#b8a8e8");s.set(3,5,VOL.obsL);return s.outline("#120c18")},
    /* arbre calciné */
    charred(r){const h=16+(r()*10|0),s=new Spr(16,h);s.part(VOL.char,q=>{q.rect(7,4,2,h-4);q.line(8,h*.45,2,h*.2);q.line(8,h*.35,14,h*.1);q.line(3,h*.25,1,h*.1);q.line(8,4,10,0);q.poly([[5,h-1],[7,h-4],[7,h-1]]);q.poly([[9,h-4],[11,h-1],[9,h-1]])},{flat:1});
      for(let y=6;y<h-2;y+=3)s.set(8,y,"#ff7a2c");return s.outline("#120a08")},
    /* cristal de feu (luit) */
    firecry(r){const s=prop.crystal(r,"#ff9a3c");s.c="#ffb05a";return s},
    /* rocher fendu de lave */
    lrock(r){const s=prop.rock(r,VOL.rockL);for(let y=2;y<s.h-1;y++){const x=(s.w>>1)+((y*3)%3)-1;if(s.get(x,y))s.set(x,y,y%2?VOL.lava:VOL.lavaL)}s.c=VOL.lava;return s},
  });
  BIOME.volcan=function(zid){
    const T=TH.volcan,G=T.g.map(rgb),fl=T.fl,r=rng(zid.length*1013+zid.charCodeAt(0)*7),meta={mills:[],houses:[],ponds:[],glow:[],rays:[],lava:[],fum:[]},hz=VOL.haze;
    /* le volcan : grand cône, cratère, coulées de lave sur les flancs */
    const far=new Spr(480,FARH);{const W=480,c=mix(VOL.rock,hz,.35),cl=mix(c,"#ffb070",.2),cd=mix(c,DARK,.2),vx=r()*W|0,vw=70,vh=FARH-2;
      const base=crowns(W,r,12,4,8,.6);for(let x=0;x<W;x++){let d=Math.abs(x-vx);d=Math.min(d,W-d);let h=base[x]+3;if(d<vw){const v=vh*(1-(d/vw)**1.3);if(d<7)h=Math.max(h,vh-3+((x%2)));else if(v>h)h=v}
        const top=Math.round(FARH-h),left=((x-vx+W)%W)>W/2;for(let y=Math.max(0,top);y<FARH;y++)far.set(x,y,y===top?cl:(d<vw&&!left&&y>top+2&&(x+y)%2)?cd:c)}
      /* coulées : lignes qui descendent du cratère */
      for(let k=0;k<4;k++){let x=vx+(k-1.5)*3,y=FARH-vh+3;const dx=(k-1.5)*.55;while(y<FARH-2){wset(far,x,y,y%3?VOL.lava:VOL.lavaL);if(r()<.4)wset(far,x+1,y,VOL.lavaD);x+=dx+(r()-.5)*.8;y+=1}}
      for(let i=-5;i<=5;i++)wset(far,vx+i,FARH-vh+2,VOL.lavaL);meta.crater={x:vx,y:FARH-vh+1};meta.glow.push({x:vx,y:FARH-vh+3,c:"#ff8a3c",ph:0,f:.08,s:1.6,fl:1})}
    /* orgues de basalte et lac de lave */
    const mid=new Spr(640,MIDH);{const W=640,bc=mix(VOL.basalt,hz,.25),bl=mix(bc,"#ffb070",.18),bd=mix(bc,DARK,.25);
      for(let x=0;x<W;x++)for(let y=MIDH-6;y<MIDH;y++)mid.set(x,y,y===MIDH-6?VOL.lavaL:(x*3+y*7)%9<2?VOL.lavaL:(x+y)%3?VOL.lava:VOL.lavaD);
      for(let x0=r()*20|0;x0<W;x0+=40+(r()*60|0)){const n=4+(r()*6|0);for(let i=0;i<n;i++){const cx=x0+i*4,h=12+(r()*24|0)+(i>n/2?(n-i)*2:i*2);for(let y=MIDH-6-h;y<MIDH-5;y++)for(let q=0;q<4;q++)wset(mid,cx+q,y,y===MIDH-6-h?bl:q===0?bl:q===3?bd:bc);for(let y=MIDH-6-h+4;y<MIDH-6;y+=5+(i%3))for(let q=0;q<4;q++)wset(mid,cx+q,y,bd)}}}
    /* premier rang : crête noire, flèches d'obsidienne, arbres calcinés, fissures de lave */
    const WH=52,wall=new Spr(512,WH);{const W=512,rc=rgb(VOL.rock),rl=rgb(VOL.rockL),rd=rgb(VOL.rockD);
      const h=x=>WH-14-wave(x,W,[[4,4,.2],[9,2.5,1.4],[19,1.2,0]]);
      const items=[];for(let x=r()*20;x<W-10;x+=20+r()*34){const k=r();items.push([k<.45?deco.obsidian(r):k<.75?deco.charred(r):deco.firecry(r),x|0])}
      items.forEach(([sp,x])=>{const y=Math.round(h(x+sp.w/2))+4-sp.h;wblit(wall,sp,x,y);if(sp.c)meta.glow.push({x:x+6,y:y+6,c:sp.c,ph:r()*6,f:.5})});
      for(let x=0;x<W;x++){const top=Math.round(h(x));for(let y=top;y<WH;y++)wset(wall,x,y,y===top?rl:(x*3+y*7)%11===0?rd:rc)}
      for(let i=0;i<14;i++){let x=r()*W,y=h(x|0)+3;for(let j=0;j<10;j++){x+=r()-.4;y+=1;if(y<WH)wset(wall,x,y|0,j%3?VOL.lava:VOL.lavaL)}meta.glow.push({x:x|0,y:(y|0)-4,c:"#ff6a2c",ph:r()*6,f:.5})}}
    /* sol : roche noire, lave refroidie cordée, fissures, mares de lave */
    const W=768,ground=new Spr(W,TM+GH),ph=[r()*6,r()*6,r()*6];
    for(let y=TM;y<TM+GH;y++)for(let x=0;x<W;x++)ground.p[y*W+x]=G[0];
    for(let i=0;i<130;i++){const rx=6+r()*20,ry=2+r()*6,cx=r()*W,cy=TM+ry+1+r()*(GH-2*ry-2),c=G[1+(i%3)];ellipse(cx,cy,rx,ry,(x,y,d)=>{if(y>=TM&&(d<.7||(x+y)%2===0))wset(ground,x,y,c)})}
    /* lave cordée : arcs empilés */
    for(let i=0;i<40;i++){const cx=r()*W,cy=TM+6+r()*(GH-12),rx=6+r()*10;for(let k=0;k<4;k++)for(let a=-1;a<=1;a+=.08){const x=cx+Math.sin(a)*rx*(1-k*.18),y=cy+k*2-Math.cos(a)*2;if(y>TM+2&&y<TM+GH-2)wset(ground,x,y|0,k%2?G[2]:mix(G[1],"#ffffff",.08))}}
    for(let x=0;x<W;x++){wset(ground,x,TM,mix(G[3],DARK,.3));wset(ground,x,TM+1,mix(G[3],DARK,.15))}
    /* fissures luisantes */
    const cracks=[];for(let i=0;i<26;i++){let x=r()*W,y=TM+5+r()*(GH-10);const n=6+(r()*12|0);for(let j=0;j<n;j++){x+=1;y+=(r()-.5)*1.6;if(y>TM+2&&y<TM+GH-2){wset(ground,x,y|0,j%4===0?VOL.lavaL:VOL.lavaD);cracks.push([((x|0)%W+W)%W,y|0])}}}
    /* mares de lave (derrière le sentier) */
    const lv=rgb(VOL.lava),ll=rgb(VOL.lavaL),ld=rgb(VOL.lavaD),cr=rgb(VOL.crust);
    for(let k=0;k<2;k++){const cx=(k*W/2+80+r()*200)|0,cy=TM+19,rx=18+(r()*8|0),ry=5;meta.lava.push({x:cx,y:cy,rx,ry});meta.glow.push({x:cx,y:cy,c:"#ff7a2c",ph:r()*6,s:2});
      ellipse(cx,cy,rx+2.5,ry+2,(x,y)=>wset(ground,x,y,cr));ellipse(cx,cy,rx,ry,(x,y,d)=>{let c=lv;if(d>.7&&(x+y)%2)c=ld;else if(d<.3||((x*5+y*3)%11===0))c=ll;wset(ground,x,y,c)});
      for(let n=0;n<4;n++){const px=cx+(r()-.5)*rx*1.2,py=cy+(r()-.5)*ry;ellipse(px,py,2+r()*2,1,(x,y)=>wset(ground,x,y,cr))}}
    const P0=rgb(T.path),pl=mix(P0,"#ffb070",.15),pd=mix(P0,DARK,.25),ed=mix(G[3],DARK,.3);
    const pc=x=>PY-1+Math.round(wave(x,W,[[2,2,ph[0]],[5,1,ph[1]]])),phw=x=>6+Math.round(wave(x,W,[[3,1.2,ph[2]]]));
    for(let x=0;x<W;x++){const c=pc(x),h=phw(x);for(let y=c-h-1;y<=c+h+1;y++){const e=Math.abs(y-c);if(e>h){if((x+y)%2===0)wset(ground,x,y,ed)}else if(e===h){if((x+y)%2===0)wset(ground,x,y,P0)}else wset(ground,x,y,P0)}}
    for(let i=0;i<400;i++){const x=r()*W|0,c=pc(x),h=phw(x)-1,y=c-h+(r()*h*2|0);wset(ground,x,y,r()<.4?pl:pd)}
    const items=[];const put=(cnt,mk,y0,y1)=>{for(let i=0;i<cnt;i++){const sp=mk();let x,y,t=0;do{x=r()*W|0;y=(y0+r()*(y1-y0))|0;t++}while(t<30&&meta.lava.some(p=>Math.abs(x+sp.w/2-p.x)<p.rx+sp.w/2+4&&y>p.y-p.ry-4&&y-sp.h<p.y+p.ry+2));items.push([sp,x,y-sp.h]);if(sp.c)meta.glow.push({x:x+(sp.w>>1),y:y-sp.h+5,c:sp.c,ph:r()*6})}};
    put(6,()=>prop.rock(r,VOL.rockL),TM+8,PY-9);put(4,()=>deco.lrock(r),TM+8,PY-9);put(5,()=>deco.firecry(r),TM+10,PY-9);put(4,()=>deco.obsidian(r),TM+12,PY-9);put(3,()=>deco.charred(r),TM+20,PY-9);put(2,()=>prop.bone(r),TM+8,PY-9);
    put(5,()=>prop.rock(r,VOL.rockL),PY+12,TM+GH-6);put(3,()=>deco.lrock(r),PY+12,TM+GH-6);put(3,()=>deco.firecry(r),PY+14,TM+GH-6);put(3,()=>deco.obsidian(r),PY+14,TM+GH-6);put(2,()=>prop.bone(r),PY+12,TM+GH-6);put(1,()=>deco.charred(r),PY+30,TM+GH-6);
    const sc=mix(G[3],DARK,.4);
    items.sort((a,b)=>a[2]+a[0].h-b[2]-b[0].h).forEach(([sp,x,y])=>{for(let i=1;i<sp.w-1;i++){wset(ground,x+i,y+sp.h-1,sc);if(i>1&&i<sp.w-2)wset(ground,x+i,y+sp.h,sc)}wblit(ground,sp,x,y)});
    /* fumerolles : petites bouches d'où sort de la fumée */
    for(let i=0;i<4;i++){const x=r()*W|0,y=TM+8+(r()*(PY-TM-18)|0);ellipse(x,y,2.5,1,(xx,yy)=>wset(ground,xx,yy,"#1a1214"));wset(ground,x,y-1,"#d8c048");meta.fum.push({x,y,ph:r()})}
    const low=volcanLow(T,G,r,W);
    return{far:far.cvs(),mid:mid.cvs(),wall:wall.cvs(),ground:ground.cvs(),low,gW:W,meta,tufts:[],cracks,clouds:mkClouds("#5a4446"),G,fl,volcano:1,dark:1,snow:1,flakeC:["rgba(170,160,160,.7)","#c8bcb8"],flyC:["#ffb03c","#ff7a2c"],motes:1,dayFlies:8,nightFlies:10,nightC:"255,150,60",tint:{dawn:"rgba(255,120,60,.12)",dusk:"rgba(90,20,30,.22)",night:"rgba(40,8,16,.5)"},sky:{day:["#7a3a2a","#d8784a"],dawn:["#5a2a3a","#e8885a"],dusk:["#3a1a2a","#c8583a"],night:["#1a0c14","#4a1a1a"]}};
  };
  function volcanLow(T,G,r,W){const LH=200,s=new Spr(W,LH);for(let i=0;i<W*LH;i++)s.p[i]=G[0];
    for(let i=0;i<200;i++){const rx=6+r()*22,ry=2+r()*7,cx=r()*W,cy=ry+1+r()*(LH-2*ry-2),c=G[1+(i%3)];ellipse(cx,cy,rx,ry,(x,y,d)=>{if(d<.7||(x+y)%2===0)wset(s,x,y,c)})}
    for(let i=0;i<60;i++){const cx=r()*W,cy=6+r()*(LH-14),rx=6+r()*10;for(let k=0;k<4;k++)for(let a=-1;a<=1;a+=.08){const x=cx+Math.sin(a)*rx*(1-k*.18),y=cy+k*2-Math.cos(a)*2;if(y>1&&y<LH-2)wset(s,x,y|0,k%2?G[2]:mix(G[1],"#ffffff",.08))}}
    for(let i=0;i<40;i++){let x=r()*W,y=4+r()*(LH-8);const n=6+(r()*12|0);for(let j=0;j<n;j++){x+=1;y+=(r()-.5)*1.6;if(y>1&&y<LH-2)wset(s,x,y|0,j%4===0?VOL.lavaL:VOL.lavaD)}}
    const items=[],put=(n,mk)=>{for(let i=0;i<n;i++){const sp=mk();items.push([sp,r()*W|0,2+(r()*(LH-sp.h-5)|0)])}};
    put(18,()=>prop.rock(r,VOL.rockL));put(8,()=>deco.lrock(r));put(8,()=>deco.firecry(r));put(8,()=>deco.obsidian(r));put(4,()=>deco.charred(r));put(5,()=>prop.bone(r));
    const sc=mix(G[3],DARK,.4);items.sort((a,b)=>a[2]+a[0].h-b[2]-b[0].h).forEach(([sp,x,y])=>{for(let i=1;i<sp.w-1;i++)wset(s,x+i,y+sp.h-1,sc);wblit(s,sp,x,y)});
    return s.cvs()}

})();
