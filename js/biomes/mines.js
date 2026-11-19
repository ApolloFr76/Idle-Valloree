/* Décor du monde « Mines de Cuivrecœur » : plans du paysage générés une fois (fonction BIOME.mines, lue par js/monde.js). */
(()=>{
  const{Spr,prop,rng,rgb,mix,TH,DARK,LIGHT,INK,calm,R,TAU,css,wave,wset,wblit,wget,ellipse,deco,FARH,MIDH,WALLH,TM,GH,PY,mkClouds,BIOME}=MK; const{crowns}=MK;
  /* ================= Mines de Cuivrecœur ================= */
  /* sous terre : pas de ciel ni d'heure, une voûte de roche à stalactites, galeries étayées de bois,
     lanternes qui vacillent, cristaux qui luisent, voie de wagonnets pour chemin */
  const MIN={rock:"#5a5368",rockD:"#3e384c",rockL:"#7a7290",timber:"#7a5636",timberD:"#4e3622",rail:"#a8aebe",railD:"#5a5e6c",ballast:"#6a6070",copper:["#e08a4a","#c8703a","#f0b070"],cry:["#9b8ee0","#c0b4ff","#f0a35a"],lamp:"#ffc860"};
  Object.assign(deco,{
    /* grappe de cristaux (luit dans le noir) */
    cluster(r,c){const s=new Spr(13,12);s.part(c,q=>{q.poly([[1,11],[3,4],[5,11]]);q.poly([[4,11],[7,0],[9,11]]);q.poly([[8,11],[11,5],[12,11]])},{lt:.6,dk:.3});s.set(7,2,"#ffffff");s.set(3,6,mix(c,"#ffffff",.6));s.c=c;return s.outline(mix(c,INK,.7))},
    /* wagonnet chargé de minerai */
    cart(r){const s=new Spr(22,14);s.part("#6a6e7a",q=>q.poly([[1,3],[21,3],[18,11],[4,11]]),{lt:.3,dk:.4});s.part("#4a4e5a",q=>{q.rect(1,3,20,1);q.rect(6,5,1,5);q.rect(15,5,1,5)},{flat:1});
      s.part(MIN.copper[0],q=>{q.ell(7,2,4,2);q.ell(14,2,4,2.5)},{lt:.5});s.set(9,1,"#fff0c0");s.set(14,0,"#fff0c0");
      s.part("#2e2a34",q=>{q.ell(6,12,2,1.6);q.ell(16,12,2,1.6)},{flat:1});s.set(6,12,"#8a8e9a");s.set(16,12,"#8a8e9a");return s.outline("#1a1820")},
    crate(r){const s=new Spr(11,10);s.part("#8a6440",q=>q.rect(1,1,9,8));s.part("#5e4228",q=>{q.rect(1,1,9,1);q.rect(1,8,9,1);q.line(2,2,8,7)},{flat:1});return s.outline("#241810")},
    /* lanterne sur poteau, plantée au sol */
    lamppost(r){const s=prop.lantern(r);s.c=MIN.lamp;return s},
  });
  BIOME.mines=function(zid){
    const T=TH.mines,G=T.g.map(rgb),fl=T.fl,r=rng(zid.length*1013+zid.charCodeAt(0)*7),meta={mills:[],houses:[],ponds:[],glow:[],rays:[]};
    const deep="#1e1a2a",deep2="#2a2538";
    /* fond de la caverne : colonnes et stalagmites lointaines, éclats de cristal */
    const far=new Spr(480,FARH);{const W=480,c1=rgb(deep2),c2=mix(deep2,"#7a72a0",.18),h1=crowns(W,r,14,10,26,.85),h2=crowns(W,r,9,4,12,.95);
      for(let x=0;x<W;x++){const t1=Math.round(FARH-h1[x]);for(let y=Math.max(0,t1);y<FARH;y++)far.set(x,y,(x*7+y*3)%17===0?mix(c1,DARK,.2):c1);
        const t2=Math.round(FARH-h2[x]);for(let y=Math.max(0,t2);y<FARH;y++)far.set(x,y,y===t2?mix(c2,"#ffffff",.1):c2)}
      for(let i=0;i<30;i++){const x=r()*W|0,y=10+(r()*(FARH-12)|0);if(far.get(x,y)){const c=MIN.cry[r()*3|0];far.set(x,y,mix(c,deep2,.35));if(r()<.5)far.set(x,y-1,mix(c,deep2,.55))}}}
    /* galerie du fond : paroi, entrées de tunnels, échafaudages, filons de cuivre */
    const mid=new Spr(640,MIDH);{const W=640,c=mix(MIN.rock,deep,.68),cl=mix(c,"#ffffff",.08),cd=mix(c,DARK,.25),tm=mix(MIN.timber,deep,.4);
      for(let x=0;x<W;x++){const top=Math.round(10-wave(x,W,[[4,5,1],[9,3,2],[17,1.5,0]]));for(let y=Math.max(0,top);y<MIDH;y++)mid.set(x,y,y<=top+1?cl:((x*5+y*7)%19===0||(x+y*3)%23===0)?cd:c)}
      for(let k=0;k<4;k++){const tx=(k*W/4+r()*80)|0,tw=12,ty=MIDH-20;for(let y=ty;y<MIDH;y++)for(let i=0;i<tw;i++){const dx=(i-tw/2+.5)/(tw/2),arch=y-ty>=Math.round(5*(1-Math.sqrt(Math.max(0,1-dx*dx))));if(arch)wset(mid,tx+i,y,y<ty+3?"#1a1622":"#120f18")}
        for(let y=ty-1;y<MIDH;y++){wset(mid,tx-1,y,tm);wset(mid,tx+tw,y,tm)}for(let i=-2;i<tw+2;i++)wset(mid,tx+i,ty-1,tm);meta.glow.push({x:tx+tw/2,y:ty+5,c:MIN.lamp,ph:r()*6,f:.22,s:.5});wset(mid,tx+tw/2,ty+4,MIN.lamp)}
      for(let k=0;k<5;k++){const sx=r()*W|0,sw=14+(r()*12|0),sy=MIDH-14-(r()*8|0);for(let i=0;i<sw;i++){wset(mid,sx+i,sy,tm);if(i%6===0)for(let y=sy;y<MIDH;y++)wset(mid,sx+i,y,mix(tm,DARK,.15))}for(let y=sy;y<MIDH;y+=3)wset(mid,sx+sw-2,y,tm)}
      for(let i=0;i<22;i++){let x=r()*W,y=14+r()*(MIDH-18);const n=6+(r()*8|0),dx=r()-.5;for(let j=0;j<n;j++){x+=dx+(r()-.5);y+=(r()-.5)*.8;wset(mid,x,y|0,mix(MIN.copper[r()*3|0],deep,.35))}}}
    /* premier rang : piliers de roche, étais de bois, lanternes, cristaux */
    const WH=78,wall=new Spr(512,WH);{const W=512,rc=rgb(MIN.rock),rl=rgb(MIN.rockL),rd=rgb(MIN.rockD);
      const pil=[];for(let x=r()*20;x<W-40;x+=70+r()*60)pil.push({x:x|0,w:22+(r()*18|0)});
      /* piliers : roche brute qui monte jusqu'au plafond */
      pil.forEach(p=>{const s=new Spr(p.w+12,WH);s.part(MIN.rock,q=>{for(let y=0;y<WH;y++){const wv=Math.round(p.w/2+2*Math.sin(y/7+p.x)+(y>WH-14?(y-WH+14)*.5:0)+(y<10?(10-y)*.6:0));q.rect(p.w/2+6-wv,y,wv*2,1)}},{lt:.3,dk:.45});
        for(let i=0;i<p.w*4;i++){const x=r()*s.w|0,y=r()*WH|0;if(s.get(x,y)&&s.get(x+1,y)&&s.get(x,y+1))s.set(x,y,r()<.5?rd:rl)}
        for(let i=0;i<3;i++){let x=4+r()*(s.w-8),y=6+r()*(WH-20);for(let j=0;j<7;j++){x+=r()-.5;y+=1;if(s.get(x|0,y|0))s.set(x,y,MIN.copper[r()*3|0])}}
        s.outline("#16131e");wblit(wall,s,p.x-6,0);
        if(r()<.7){const cl=deco.cluster(r,MIN.cry[r()<.75?0:2]);const cx=p.x+(r()*p.w|0)-4,cy=WH-cl.h-(r()*30|0)-6;wblit(wall,cl,cx,cy);meta.glow.push({x:cx+6,y:cy+6,c:cl.c,ph:r()*6,f:.5})}});
      /* étais : deux poteaux et une poutre entre les piliers, lanterne accrochée */
      pil.forEach((p,i)=>{const n=pil[(i+1)%pil.length],nx=n.x<p.x?n.x+W:n.x,a=p.x+p.w-2,b=nx+2;if(b-a<20)return;const by=8+(r()*6|0),tm=rgb(MIN.timber),td=rgb(MIN.timberD),tl=mix(MIN.timber,"#fff2c2",.25);
        for(let x=a;x<b;x++)for(let y=by;y<by+4;y++)wset(wall,x,y,y===by?tl:y===by+3?td:tm);for(let x=a;x<b;x++)wset(wall,x,by+4,"#16131e");
        [a+2,b-6].forEach(px=>{for(let y=by+4;y<WH;y++)for(let k=0;k<4;k++)wset(wall,px+k,y,k===0?tl:k===3?td:tm);for(let y=by+4;y<WH;y++){wset(wall,px-1,y,"#16131e");wset(wall,px+4,y,"#16131e")}});
        const lx=((a+b)/2)|0;for(let y=by+5;y<by+9;y++)wset(wall,lx,y,"#3a3440");const L0=prop.lantern(r);wblit(wall,{w:7,h:7,p:L0.p.slice(0,7*7)},lx-3,by+8);meta.glow.push({x:lx,y:by+12,c:MIN.lamp,ph:r()*6,f:.5,s:1.6,fl:1})});
      for(let i=0;i<40;i++){const k=prop.rock(r,r()<.5?MIN.rock:MIN.rockL);wblit(wall,k,r()*W|0,WH-k.h+1)}}
    /* voûte de roche à stalactites (en haut de l'image) */
    const CW=600,CH=40,canopy=new Spr(CW,CH);{const c=rgb(MIN.rockD),cl=mix(MIN.rockD,"#ffffff",.08),cd=mix(MIN.rockD,DARK,.35);
      for(let x=0;x<CW;x++){const b=Math.round(9+wave(x,CW,[[6,2.5,1],[13,1.5,2]]));for(let y=0;y<b;y++)canopy.set(x,y,(x*3+y*7)%13===0?cd:c);canopy.set(x,b,cd)}
      for(let i=0;i<70;i++){const x=r()*CW|0,l=4+(r()*(i%5===0?24:12)|0),w=1+(r()*3|0);let y0=0;while(y0<CH&&wget(canopy,x,y0))y0++;for(let j=0;j<l&&y0+j<CH-2;j++){const ww=Math.max(0,Math.round(w*(1-j/l)));for(let q=-ww;q<=ww;q++)wset(canopy,x+q,y0+j-1,q===-ww?cl:q===ww?cd:c)}
        if(r()<.3&&y0+l<CH-2)wset(canopy,x,y0+l-1,"#8fc7e0")}
      for(let i=0;i<16;i++){const x=r()*CW|0,y=2+(r()*5|0);wset(canopy,x,y,MIN.cry[r()*3|0])}}
    /* sol : roche et gravier, voie de wagonnets */
    const W=768,ground=new Spr(W,TM+GH),ph=[r()*6,r()*6,r()*6];
    for(let y=TM;y<TM+GH;y++)for(let x=0;x<W;x++)ground.p[y*W+x]=G[0];
    for(let i=0;i<150;i++){const rx=6+r()*20,ry=2+r()*6,cx=r()*W,cy=TM+ry+1+r()*(GH-2*ry-2),c=G[1+(i%3)];ellipse(cx,cy,rx,ry,(x,y,d)=>{if(y>=TM&&(d<.7||(x+y)%2===0))wset(ground,x,y,c)})}
    for(let x=0;x<W;x++){wset(ground,x,TM,mix(G[3],DARK,.4));wset(ground,x,TM+1,mix(G[3],DARK,.2))}
    const isG=c=>c===G[0]||c===G[1]||c===G[2]||c===G[3];
    for(let i=0;i<1800;i++){const x=r()*W|0,y=TM+3+(r()*(GH-4)|0),c=r()<.4?G[2]:r()<.5?G[1]:mix(G[0],"#ffffff",.1);if(isG(ground.get(x,y))){wset(ground,x,y,c);if(r()<.3)wset(ground,x+1,y,mix(c,DARK,.3))}}
    /* fissures */
    for(let i=0;i<30;i++){let x=r()*W,y=TM+4+r()*(GH-8);const n=5+(r()*10|0);for(let j=0;j<n;j++){x+=1;y+=(r()-.5)*1.6;if(y>TM+2&&y<TM+GH-2)wset(ground,x,y|0,mix(G[3],DARK,.4))}}
    /* éclats de cuivre dans le sol */
    for(let i=0;i<70;i++){const x=r()*W|0,y=TM+4+(r()*(GH-6)|0);if(isG(ground.get(x,y)))wset(ground,x,y,MIN.copper[r()*3|0])}
    const pc=x=>PY-1+Math.round(wave(x,W,[[2,1.5,ph[0]],[3,.8,ph[1]]]));
    const bal=rgb(MIN.ballast),bl=mix(MIN.ballast,"#ffffff",.12),bd=mix(MIN.ballast,DARK,.3),sl=rgb(MIN.timber),sd=rgb(MIN.timberD),ra=rgb(MIN.rail),rd=rgb(MIN.railD);
    for(let x=0;x<W;x++){const c=pc(x);for(let y=c-7;y<=c+7;y++){const e=Math.abs(y-c);wset(ground,x,y,e===7?((x+y)%2?bd:G[3]):(x*7+y*13)%5===0?bl:(x*3+y*5)%7===0?bd:bal)}}
    for(let x=0;x<W;x+=6)for(let k=0;k<3;k++){const c=pc(x+k);for(let y=c-5;y<=c+5;y++)wset(ground,x+k,y,k===2||y===c+5?sd:sl)}
    for(let x=0;x<W;x++){const c=pc(x);[c-3,c+3].forEach(y=>{wset(ground,x,y-1,ra);wset(ground,x,y,rd);if(x%11===0)wset(ground,x,y-1,"#d8deec")})}
    /* accessoires derrière et devant */
    const items=[];const put=(cnt,mk,y0,y1)=>{for(let i=0;i<cnt;i++){const sp=mk(),x=r()*W|0,y=(y0+r()*(y1-y0))|0;items.push([sp,x,y-sp.h]);if(sp.c)meta.glow.push({x:x+(sp.w>>1),y:y-sp.h+(sp===sp&&sp.h>14?3:5),c:sp.c,ph:r()*6,f:1,s:sp.c===MIN.lamp?1.4:1,fl:sp.c===MIN.lamp?1:0})}};
    put(8,()=>prop.rock(r,MIN.rock),TM+8,PY-10);put(6,()=>deco.cluster(r,MIN.cry[r()<.7?0:r()<.5?1:2]),TM+10,PY-10);put(2,()=>deco.cart(r),TM+14,PY-10);put(3,()=>deco.crate(r),TM+10,PY-10);put(3,()=>deco.lamppost(r),TM+12,PY-10);
    put(6,()=>prop.rock(r,MIN.rock),PY+12,TM+GH-8);put(5,()=>deco.cluster(r,MIN.cry[r()<.7?0:2]),PY+12,TM+GH-8);put(2,()=>deco.crate(r),PY+14,TM+GH-8);put(2,()=>prop.bone(r),PY+12,TM+GH-8);
    const sc=mix(G[3],DARK,.5);
    items.sort((a,b)=>a[2]+a[0].h-b[2]-b[0].h).forEach(([sp,x,y])=>{for(let i=1;i<sp.w-1;i++){wset(ground,x+i,y+sp.h-1,sc);if(i>1&&i<sp.w-2)wset(ground,x+i,y+sp.h,sc)}wblit(ground,sp,x,y)});
    const low=minesLow(T,G,r,W);
    return{far:far.cvs(),mid:mid.cvs(),wall:wall.cvs(),ground:ground.cvs(),low,gW:W,meta,tufts:[],canopy:canopy.cvs(),clouds:[],G,fl,dark:1,cave:1,flyC:["#e8c890","#fff0c0"],motes:1};
  };
  function minesLow(T,G,r,W){const LH=200,s=new Spr(W,LH);for(let i=0;i<W*LH;i++)s.p[i]=G[0];const isG=c=>c===G[0]||c===G[1]||c===G[2]||c===G[3];
    for(let i=0;i<200;i++){const rx=6+r()*22,ry=2+r()*7,cx=r()*W,cy=ry+1+r()*(LH-2*ry-2),c=G[1+(i%3)];ellipse(cx,cy,rx,ry,(x,y,d)=>{if(d<.7||(x+y)%2===0)wset(s,x,y,c)})}
    for(let i=0;i<3200;i++){const x=r()*W|0,y=1+(r()*(LH-2)|0),c=r()<.4?G[2]:r()<.5?G[1]:mix(G[0],"#ffffff",.1);if(isG(s.get(x,y))){wset(s,x,y,c);if(r()<.3)wset(s,x+1,y,mix(c,DARK,.3))}}
    for(let i=0;i<50;i++){let x=r()*W,y=4+r()*(LH-8);const n=5+(r()*10|0);for(let j=0;j<n;j++){x+=1;y+=(r()-.5)*1.6;if(y>1&&y<LH-2)wset(s,x,y|0,mix(G[3],DARK,.4))}}
    for(let i=0;i<120;i++){const x=r()*W|0,y=2+(r()*(LH-4)|0);if(isG(s.get(x,y)))wset(s,x,y,MIN.copper[r()*3|0])}
    const items=[],put=(n,mk)=>{for(let i=0;i<n;i++){const sp=mk();items.push([sp,r()*W|0,2+(r()*(LH-sp.h-5)|0)])}};
    put(22,()=>prop.rock(r,MIN.rock));put(12,()=>deco.cluster(r,MIN.cry[r()<.7?0:2]));put(4,()=>deco.crate(r));put(3,()=>prop.bone(r));
    const sc=mix(G[3],DARK,.5);items.sort((a,b)=>a[2]+a[0].h-b[2]-b[0].h).forEach(([sp,x,y])=>{for(let i=1;i<sp.w-1;i++)wset(s,x+i,y+sp.h-1,sc);wblit(s,sp,x,y)});
    return s.cvs()}

})();
