/* Décor du monde « Jungle d'Émeraude-Lys » : plans du paysage générés une fois (fonction BIOME.jungle, lue par js/monde.js). */
(()=>{
  const{Spr,prop,rng,rgb,mix,TH,DARK,LIGHT,INK,calm,R,TAU,css,wave,wset,wblit,wget,ellipse,deco,FARH,MIDH,WALLH,TM,GH,PY,mkClouds,BIOME}=MK; const{crowns}=MK;
  /* ================= Jungle d'Émeraude-Lys ================= */
  /* forêt tropicale : pitons calcaires dans la brume, canopée dense, cascade qui coule dans son bassin,
     pyramide à degrés envahie, arbres géants à contreforts, lianes, feuilles géantes, lys géants ;
     perroquets, papillons, embruns de la cascade, lys qui luisent la nuit */
  const JUN={leaf:["#2f9a4a","#3fae52","#268a40"],leafD:"#1f6a34",bark:"#6a4a2c",barkD:"#4a321e",moss:"#6fc04e",stone:"#8a9a82",stoneD:"#66766a",water:"#3fa8a0",waterL:"#9ae8dc",lys:["#ff7a3c","#ff6fa8","#ffd84a"],haze:"#a8d8c0"};
  Object.assign(deco,{
    /* lys géant : pétales recourbés, cœur moucheté */
    lys(r){const c=JUN.lys[r()*3|0],s=new Spr(13,16);s.part("#3f8a3a",q=>{q.rect(6,6,1,10);q.line(6,13,2,10);q.line(7,14,11,11)},{flat:1});
      s.part(c,q=>{q.poly([[6,6],[1,1],[3,6]]);q.poly([[7,6],[12,1],[10,6]]);q.poly([[6,6],[5,0],[8,0],[7,6]]);q.ell(6.5,6,3,1.6)},{lt:.4,dk:.3});s.set(6,4,"#7a2a1a");s.set(7,3,"#7a2a1a");s.set(5,5,"#7a2a1a");s.set(6,1,mix(c,"#ffffff",.5));s.c=c;return s.outline(mix(c,INK,.7))},
    /* feuille en cœur sur sa tige (oreille d'éléphant) */
    bigleaf(r){const c=JUN.leaf[r()*3|0],w=12+(r()*6|0),s=new Spr(w,w+4);s.part("#3f8a3a",q=>q.rect(w/2|0,w*.6,1,w*.45),{flat:1});
      s.part(c,q=>{q.ell(w*.3,w*.32,w*.27,w*.25);q.ell(w*.7,w*.32,w*.27,w*.25);q.poly([[1,w*.4],[w/2,w*.75],[w-1,w*.4]])},{lt:.35,dk:.4});for(let y=2;y<w*.7;y++)s.set(w/2|0,y,mix(c,"#fff2c2",.3));return s.outline(mix(c,INK,.8))},
    /* broméliacée : rosette pointue au cœur rouge */
    brom(r){const s=new Spr(13,9);s.part("#4fb058",q=>{[[0,2],[3,0],[6,0],[9,0],[12,2]].forEach(([x,y])=>q.line(6,8,x,y))},{flat:1});s.part("#e84a5a",q=>{q.rect(5,3,3,3);q.px(6,2)},{lt:.4});return s.outline("#1f4a2a")},
    /* feuille en éventail (palmier nain) */
    fan(r){const s=new Spr(19,14),c=JUN.leaf[r()*3|0];s.part("#3f8a3a",q=>q.rect(9,8,1,6),{flat:1});s.part(c,q=>{for(let a=-5;a<=5;a++){const an=-Math.PI/2+a*.28;q.line(9,9,9+Math.cos(an)*9,9+Math.sin(an)*8)}},{flat:1});
      for(let a=-5;a<=5;a+=2){const an=-Math.PI/2+a*.28;s.set(Math.round(9+Math.cos(an)*8),Math.round(9+Math.sin(an)*7),mix(c,"#fff2c2",.3))}return s.outline(mix(c,INK,.8))},
    /* pyramide à degrés envahie (lointaine) */
    ziggurat(){const s=new Spr(40,22),c=JUN.stone,d=JUN.stoneD;for(let k=0;k<5;k++){const y0=22-(k+1)*4,hw=19-k*3.4;for(let y=y0;y<y0+4;y++)for(let x=Math.round(20-hw);x<Math.round(20+hw);x++)s.set(x,y,y===y0?mix(c,"#ffffff",.15):x>20+hw-3?d:c)}
      for(let y=4;y<22;y++){s.set(19,y,d);s.set(20,y,mix(c,"#ffffff",.1))}s.part(c,q=>q.rect(16,0,8,3),{flat:1});s.set(19,1,"#2a3a2a");s.set(20,1,"#2a3a2a");
      for(let i=0;i<60;i++){const x=(Math.sin(i*12.9)*0.5+.5)*40|0,y=(Math.sin(i*78.2)*.5+.5)*22|0;if(s.get(x,y))s.set(x,y,i%3?"#4fa050":"#3f8a40")}return s},
  });
  BIOME.jungle=function(zid){
    const T=TH.jungle,G=T.g.map(rgb),fl=T.fl,r=rng(zid.length*1013+zid.charCodeAt(0)*7),meta={mills:[],houses:[],ponds:[],glow:[],rays:[],falls:[]},hz=JUN.haze;
    /* pitons calcaires couverts de verdure, dans la brume */
    const far=new Spr(480,FARH);{const W=480,c=mix(JUN.leaf[2],hz,.62),cl=mix(c,"#ffffff",.15),rk=mix(JUN.stone,hz,.55),tw=[];for(let x=r()*30;x<W;x+=34+r()*40)tw.push({x,w:7+r()*8,h:24+r()*22});
      const base=crowns(W,r,7,6,8,0);for(let x=0;x<W;x++){let m=base[x]+4,on=0;tw.forEach(o=>{let d=Math.abs(x-o.x);d=Math.min(d,W-d);if(d<o.w){const v=o.h-(d/o.w)**3*o.h*.4+(d>o.w*.7?-3:0);if(v>m){m=v;on=1}}});
        const top=Math.round(FARH-m);for(let y=Math.max(0,top);y<FARH;y++){const e=y-top;far.set(x,y,e===0?cl:on&&e>3&&(x*5+y*3)%7<2?rk:c)}}}
    /* canopée, cascade et bassin, pyramide envahie */
    const mid=new Spr(640,MIDH);{const W=640,cc=mix(JUN.leaf[0],hz,.35),cl=mix(cc,"#ffffff",.15),cd=mix(JUN.leafD,hz,.3),h=crowns(W,r,8,12,12,0);
      const fx=r()*W|0,fw=10,top=x=>Math.round(MIDH-14-h[((x%W)+W)%W]);
      for(let x=0;x<W;x++){const t=top(x);for(let y=Math.max(0,t);y<MIDH;y++){const e=y-t;mid.set(x,y,e===0?cl:(e<3&&(x+y)%2)?cl:(x*7+y*5)%9===0?cd:cc)}}
      /* falaise de la cascade */
      const cr=mix(JUN.stone,hz,.3),crd=mix(JUN.stoneD,hz,.3);for(let x=fx-14;x<fx+fw+14;x++)for(let y=6;y<MIDH;y++){const edge=Math.abs(x-(fx+fw/2))>fw/2+10-Math.round((y-6)*.1);if(!edge)wset(mid,x,y,(x+y*3)%11===0?crd:cr)}
      for(let x=fx-14;x<fx+fw+14;x++){wset(mid,x,6,mix(JUN.leaf[0],hz,.25));wset(mid,x,7,mix(JUN.leaf[1],hz,.25))}
      const wv=mix(JUN.water,hz,.15),wl=mix(JUN.waterL,hz,.1);for(let x=fx;x<fx+fw;x++)for(let y=7;y<MIDH-5;y++)wset(mid,x,y,(x-fx)%3===1?wl:wv);
      ellipse(fx+fw/2,MIDH-3,fw+8,3,(x,y)=>wset(mid,x,y,y<MIDH-3?wl:wv));meta.falls.push({x:fx,y:7,w:fw,h:MIDH-12});
      const zx=(fx+180+r()*200|0)%W,zg=deco.ziggurat(),sm=new Spr(zg.w,zg.h);for(let i=0;i<zg.p.length;i++)if(zg.p[i])sm.p[i]=mix(zg.p[i],hz,.3);wblit(mid,sm,zx,top(zx+20)+10-sm.h)}
    /* premier rang : arbres géants à contreforts, lianes, feuilles géantes */
    const WH=86,wall=new Spr(512,WH);{const W=512,trees=[];for(let x=r()*30;x<W-30;x+=56+r()*50)trees.push({x:x|0,tw:7+(r()*5|0)});
      /* rideaux de lianes fleuries au fond (pas de troncs droits : c'est la marque du Bois) */
      for(let x=r()*6|0;x<W;x+=3+(r()*5|0)){const l=20+(r()*(WH-34)|0),c=r()<.5?"#2f6a34":"#3a7a3a",sw=r()*6;for(let j=8;j<8+l;j++){const xx=x+Math.round(Math.sin(j/11+sw)*1.5);wset(wall,xx,j,c);if(j%5===0)wset(wall,xx+1,j,mix(c,"#ffffff",.12))}
        if(r()<.35){const fy=8+l-(r()*8|0),fc=fl[r()*fl.length|0];wset(wall,x,fy,fc);wset(wall,x+1,fy,fc);wset(wall,x,fy+1,mix(fc,DARK,.3))}}
      for(let x=0;x<W;x+=6){const c=mix(JUN.leaf[(x/6|0)%3],DARK,.28);ellipse(x,5+r()*6,10+r()*6,8+r()*5,(xx,yy)=>{if(yy>=0)wset(wall,xx,yy,(xx+yy)%5===0?mix(c,DARK,.15):c)})}
      trees.forEach(t=>{const h=WH-12,s=new Spr(t.tw+20,h);s.part(JUN.bark,q=>{q.rect(10,0,t.tw,h-2);q.poly([[1,h-1],[10,h-22],[10,h-1]]);q.poly([[10+t.tw,h-22],[t.tw+19,h-1],[10+t.tw,h-1]]);q.poly([[5,h-1],[10,h-12],[11,h-1]])},{lt:.25,dk:.45});
        for(let k=0;k<t.tw*3;k++){const x=11+(r()*(t.tw-2)|0),y=r()*(h-6)|0;for(let j=0;j<4;j++)if(s.get(x,y+j))s.set(x,y+j,JUN.barkD)}
        for(let y=0;y<h;y++)for(let x=0;x<s.w;x++)if(s.get(x,y)&&!s.get(x-1,y)&&r()<.5)s.set(x,y,JUN.moss);
        s.outline("#1a140e");wblit(wall,s,t.x-10,WH-h-2)});
      trees.forEach(t=>{const c=JUN.leaf[r()*3|0],cw=50+(r()*20|0),s=new Spr(cw,30);s.part(c,q=>{q.ell(cw/2,13,cw/2-3,10);q.ell(cw*.2,18,cw*.18,7);q.ell(cw*.8,18,cw*.18,7);q.ell(cw/2,6,cw*.3,6)},{lt:.3,dk:.42});
        const l=mix(c,LIGHT,.4),d=mix(c,DARK,.5);for(let i=0;i<cw*1.4;i++){const x=3+(r()*(cw-6)|0),y=2+(r()*22|0);if(s.get(x,y)&&s.get(x+1,y)&&s.get(x,y+2)){const k=r()<.5+(12-y)*.04?l:d;s.set(x,y,k);s.set(x+1,y,k)}}
        for(let i=0;i<8;i++){const x=4+(r()*(cw-8)|0),y=4+(r()*18|0);if(s.get(x,y)&&s.get(x+1,y)){const fc=fl[r()*fl.length|0];s.set(x,y,fc);s.set(x+1,y,fc);s.set(x,y-1,mix(fc,"#ffffff",.4))}}
        s.outline(mix(c,INK,.8));const ox=t.x+t.tw/2-cw/2|0,oy=-2+(r()*5|0);wblit(wall,s,ox,oy);
        for(let e=0;e<3;e++){const b=deco.brom(r);wblit(wall,b,t.x-4+(r()*(t.tw-2)|0),26+(r()*(WH-56)|0))}
        /* lianes avec feuilles, certaines en boucle */
        for(let v=0;v<4;v++){const vx=ox+5+(r()*(cw-10)|0),vl=16+(r()*(WH-36)|0);let y0=oy+24;while(y0>oy&&!wget(wall,vx,y0))y0--;const sway=r()*6;for(let j=1;j<vl;j++){const xx=vx+Math.round(Math.sin(j/9+sway)*2);wset(wall,xx,y0+j,"#3f7a30");if(j%4===0){wset(wall,xx+1,y0+j,JUN.leaf[1]);wset(wall,xx+2,y0+j-1,JUN.leaf[1])}if(j%6===2)wset(wall,xx-1,y0+j,JUN.leaf[0])}}});
      for(let i=0;i<30;i++){const f=r()<.4?deco.fan(r):r()<.6?deco.bigleaf(r):deco.fern(r,JUN.leaf[r()*3|0]);wblit(wall,f,r()*W|0,WH-f.h)}}
    /* canopée qui pend en haut de l'image */
    const CW=600,CH=44,canopy=new Spr(CW,CH);{const cs=["#1f6a34","#247a3a","#2a8a40"],ph0=r()*6;
      for(let x=0;x<CW;x++){const b=Math.round(6+wave(x,CW,[[6,2,ph0],[13,1.5,ph0*2]]));for(let y=0;y<b;y++)canopy.set(x,y,cs[0])}
      for(let i=0;i<50;i++){const cx=r()*CW,rx=6+r()*12,ry=3+r()*(i%4===0?8:5),cy=3+r()*7,c=cs[i%3];ellipse(cx,cy,rx,ry,(x,y,d)=>{if(y>=0&&y<CH-1)wset(canopy,x,y,y>cy+ry*.5&&d>.5?mix(c,DARK,.25):c)})}
      for(let i=0;i<600;i++){const x=r()*CW|0,y=r()*CH|0;if(wget(canopy,x,y)&&wget(canopy,x+1,y)&&wget(canopy,x,y+2)){const k=r()<.4?"#4fb058":mix(cs[0],DARK,.3);wset(canopy,x,y,k);wset(canopy,x+1,y,k)}}
      for(let x=0;x<CW;x++){let y=CH-2;while(y>0&&!wget(canopy,x,y))y--;if(y>0&&y<CH-2)wset(canopy,x,y+1,mix(cs[0],DARK,.5))}
      for(let v=0;v<30;v++){const vx=r()*CW|0,vl=6+(r()*24|0);let y0=CH-3;while(y0>0&&!wget(canopy,vx,y0))y0--;for(let j=1;j<vl&&y0+j<CH-1;j++){wset(canopy,vx,y0+j,"#3f7a30");if(j%4===0)wset(canopy,vx+1,y0+j,"#4fb058")}}
      for(let i=0;i<10;i++){const x=r()*CW|0;let y=CH-3;while(y>0&&!wget(canopy,x,y))y--;if(y>2&&y<CH-3){const c=fl[r()*fl.length|0];wset(canopy,x,y+1,c);wset(canopy,x+1,y+1,c);wset(canopy,x,y+2,mix(c,DARK,.3))}}}
    /* sol : humus, mousse, sentier de boue, flaques */
    const W=768,ground=new Spr(W,TM+GH),ph=[r()*6,r()*6,r()*6];
    for(let y=TM;y<TM+GH;y++)for(let x=0;x<W;x++)ground.p[y*W+x]=G[0];
    for(let i=0;i<140;i++){const rx=6+r()*20,ry=2+r()*6,cx=r()*W,cy=TM+ry+1+r()*(GH-2*ry-2),c=G[1+(i%3)];ellipse(cx,cy,rx,ry,(x,y,d)=>{if(y>=TM&&(d<.7||(x+y)%2===0))wset(ground,x,y,c)})}
    for(let x=0;x<W;x++){wset(ground,x,TM,mix(G[3],DARK,.35));if((x*5)%3)wset(ground,x,TM+1,mix(G[3],DARK,.18))}
    const isG=c=>c===G[0]||c===G[1]||c===G[2]||c===G[3];
    for(let i=0;i<1800;i++){const x=r()*W|0,y=TM+3+(r()*(GH-3)|0),c=r()<.5?G[2]:G[1];if(isG(ground.get(x,y))){wset(ground,x,y,c);wset(ground,x+1,y,c);if(r()<.4)wset(ground,x,y-1,c)}}
    for(let i=0;i<260;i++){const x=r()*W|0,y=TM+4+(r()*(GH-6)|0),c=fl[r()*fl.length|0];if(isG(ground.get(x,y)))wset(ground,x,y,c)}
    /* flaques (derrière le sentier) */
    const wc=rgb(JUN.water),wl=mix(JUN.water,"#ffffff",.4),wd=mix(JUN.water,DARK,.3),sh=mix(G[3],DARK,.35);
    for(let k=0;k<2;k++){const cx=(k*W/2+60+r()*200)|0,cy=TM+19,rx=18+(r()*8|0),ry=5;meta.ponds.push({x:cx,y:cy,rx,ry});ellipse(cx,cy,rx+2,ry+1.6,(x,y)=>wset(ground,x,y,sh));
      ellipse(cx,cy,rx,ry,(x,y,d)=>{let c=wc;if(y<cy-ry*.4&&d>.45)c=wd;else if((x*5+y*3)%17===0)c=wl;wset(ground,x,y,c)});for(let j=0;j<2;j++){const lp=deco.lily(r);wblit(ground,lp,cx-rx/2+j*rx*.7,cy-1)}}
    const P0=rgb(T.path),pl=mix(P0,"#fff2c2",.2),pd=mix(P0,DARK,.25),ed=mix(G[3],DARK,.3);
    const pc=x=>PY-1+Math.round(wave(x,W,[[2,2,ph[0]],[5,1,ph[1]]])),phw=x=>6+Math.round(wave(x,W,[[3,1.2,ph[2]]]));
    for(let x=0;x<W;x++){const c=pc(x),h=phw(x);for(let y=c-h-1;y<=c+h+1;y++){const e=Math.abs(y-c);if(e>h){if((x+y)%2===0)wset(ground,x,y,ed)}else if(e===h){if((x+y)%2===0)wset(ground,x,y,P0)}else wset(ground,x,y,P0)}}
    for(let i=0;i<500;i++){const x=r()*W|0,c=pc(x),h=phw(x)-1,y=c-h+(r()*h*2|0),k=r()<.4?pl:pd;wset(ground,x,y,k);if(r()<.5)wset(ground,x+1,y,k)}
    for(let i=0;i<16;i++){const x0=r()*W|0,top=r()<.5,len=10+(r()*16|0),rc=JUN.barkD,rl=mix(JUN.bark,"#fff2c2",.2);for(let j=0;j<len;j++){const x=x0+j,c=pc(x),h=phw(x),y=top?c-h-2+Math.round(Math.sin(j/len*Math.PI)*3):c+h+2-Math.round(Math.sin(j/len*Math.PI)*3);wset(ground,x,y,rc);wset(ground,x,y-1,rl)}}
    const items=[];const put=(cnt,mk,y0,y1)=>{for(let i=0;i<cnt;i++){const sp=mk();let x,y,t=0;do{x=r()*W|0;y=(y0+r()*(y1-y0))|0;t++}while(t<30&&meta.ponds.some(p=>Math.abs(x+sp.w/2-p.x)<p.rx+sp.w/2+4&&y>p.y-p.ry-4&&y-sp.h<p.y+p.ry+2));items.push([sp,x,y-sp.h]);if(sp.c)meta.glow.push({x:x+6,y:y-sp.h+4,c:sp.c,ph:r()*6})}};
    put(10,()=>deco.bigleaf(r),TM+10,PY-9);put(8,()=>deco.fan(r),TM+10,PY-9);put(7,()=>deco.lys(r),TM+14,PY-9);put(6,()=>deco.brom(r),TM+8,PY-9);put(6,()=>prop.bush(r,"#3fae52"),TM+6,PY-9);put(3,()=>prop.mushroom(r,"#f0a03c"),TM+8,PY-9);put(3,()=>deco.mrock(r,JUN.stone),TM+8,PY-9);
    put(7,()=>deco.bigleaf(r),PY+14,TM+GH-6);put(5,()=>deco.lys(r),PY+16,TM+GH-6);put(5,()=>deco.fan(r),PY+14,TM+GH-6);put(4,()=>deco.brom(r),PY+12,TM+GH-6);put(4,()=>deco.fern(r,JUN.leaf[0]),PY+12,TM+GH-6);put(2,()=>deco.mrock(r,JUN.stone),PY+14,TM+GH-6);
    const sc=mix(G[3],DARK,.45);
    items.sort((a,b)=>a[2]+a[0].h-b[2]-b[0].h).forEach(([sp,x,y])=>{for(let i=1;i<sp.w-1;i++){wset(ground,x+i,y+sp.h-1,sc);if(i>1&&i<sp.w-2)wset(ground,x+i,y+sp.h,sc)}wblit(ground,sp,x,y)});
    const bare=(x,y)=>isG(ground.get(x,y));
    const tufts=[];for(let k=0;tufts.length<80&&k<5000;k++){const x=r()*(W-2)|0,y=PY+12+(r()*16|0),h=5+(r()*9|0),w=r()<.3?2:1;let ok=true;for(let j=-1;j<=h+1&&ok;j++)for(let q=-1;q<=w;q++)if(!bare(x+q,y-j)){ok=false;break}
      if(ok)tufts.push({x,y,h,c:G[1+(k%3)],ph:r()*6,w,f:r()<.15?fl[r()*fl.length|0]:null})}
    const low=jungleLow(T,G,fl,r,W);
    return{far:far.cvs(),mid:mid.cvs(),wall:wall.cvs(),ground:ground.cvs(),low,gW:W,meta,tufts,canopy:canopy.cvs(),clouds:mkClouds(),G,fl,dark:1,birdC:["#e84a3a","#3a8ae8","#f0c83a","#3ac06a"],flyC:["#ff8ab0","#5fd0e0","#ffd36a","#b48aff"]};
  };
  function jungleLow(T,G,fl,r,W){const LH=200,s=new Spr(W,LH);for(let i=0;i<W*LH;i++)s.p[i]=G[0];const isG=c=>c===G[0]||c===G[1]||c===G[2]||c===G[3];
    for(let i=0;i<200;i++){const rx=6+r()*22,ry=2+r()*7,cx=r()*W,cy=ry+1+r()*(LH-2*ry-2),c=G[1+(i%3)];ellipse(cx,cy,rx,ry,(x,y,d)=>{if(d<.7||(x+y)%2===0)wset(s,x,y,c)})}
    for(let i=0;i<3600;i++){const x=r()*W|0,y=1+(r()*(LH-2)|0),c=r()<.5?G[2]:G[1];if(isG(s.get(x,y))){wset(s,x,y,c);wset(s,x+1,y,c);if(r()<.4)wset(s,x,y-1,c)}}
    for(let i=0;i<400;i++){const x=r()*W|0,y=2+(r()*(LH-4)|0);if(isG(s.get(x,y)))wset(s,x,y,fl[r()*fl.length|0])}
    const items=[],put=(n,mk)=>{for(let i=0;i<n;i++){const sp=mk();items.push([sp,r()*W|0,2+(r()*(LH-sp.h-5)|0)])}};
    put(22,()=>deco.bigleaf(r));put(16,()=>deco.fan(r));put(12,()=>deco.lys(r));put(12,()=>deco.brom(r));put(16,()=>deco.fern(r,JUN.leaf[r()*3|0]));put(8,()=>deco.mrock(r,JUN.stone));put(6,()=>prop.mushroom(r,"#f0a03c"));
    const sc=mix(G[3],DARK,.45);items.sort((a,b)=>a[2]+a[0].h-b[2]-b[0].h).forEach(([sp,x,y])=>{for(let i=1;i<sp.w-1;i++)wset(s,x+i,y+sp.h-1,sc);wblit(s,sp,x,y)});
    return s.cvs()}

})();
