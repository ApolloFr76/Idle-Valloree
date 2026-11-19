/* Décor du monde « Bois de Mousselune » : plans du paysage générés une fois (fonction BIOME.bois, lue par js/monde.js). */
(()=>{
  const{Spr,prop,rng,rgb,mix,TH,DARK,LIGHT,INK,calm,R,TAU,css,wave,wset,wblit,wget,ellipse,deco,FARH,MIDH,WALLH,TM,GH,PY,mkClouds,BIOME}=MK;
  /* ================= Bois de Mousselune ================= */
  /* sous-bois sombre : forêt bleutée au loin, troncs et couronnes au premier rang, rayons de lumière
     qui tombent entre les arbres, mousse, fougères, feuilles mortes et champignons qui luisent la nuit */
  const BOIS={bark:"#5a4030",barkD:"#3e2c22",moss:"#5f9a48",mossL:"#86c25a",litter:["#a8743a","#c9a23a","#8a5a30","#b8862e"],glow:["#7ad8ff","#a89aff"],haze:"#9ec4cc"};
  Object.assign(deco,{
    /* fougère : palmes en éventail */
    fern(r,c){const s=new Spr(15,10),cx=7;s.part(c,q=>{[[0,4],[2,1],[5,0],[9,0],[12,1],[14,4]].forEach(([x,y])=>q.line(cx,9,x,y));q.line(cx,9,cx,1)},{flat:1});
      for(let i=0;i<14;i++){const x=2+(r()*11|0),y=1+(r()*7|0);if(s.get(x,y))s.set(x,y-1,mix(c,"#fff2c2",.28))}return s.outline(mix(c,INK,.8))},
    /* tronc couché et moussu, bout coupé vers la droite */
    log(r){const s=new Spr(28,11);s.part(BOIS.bark,q=>{q.rect(1,3,23,7);q.ell(2,6,1.5,3.4)});s.part("#c8a070",q=>q.ell(24,6,3,3.6),{flat:1});s.set(24,6,"#8a6440");s.set(24,5,"#a8804e");s.set(25,7,"#a8804e");
      for(let i=0;i<5;i++)s.set(4+i*4+(r()*2|0),6+(r()*3|0),BOIS.barkD);s.part(BOIS.moss,q=>{for(let x=2;x<22;x++)if(r()<.7)q.rect(x,2+(r()<.3?1:0),1,2)},{flat:1});
      for(let x=3;x<21;x+=2)if(r()<.5)s.set(x,2,BOIS.mossL);return s.outline("#241810")},
    /* champignon de lune : il luit la nuit (halo dessiné dans drawLife) */
    glowshroom(r){const c=BOIS.glow[r()*2|0],s=new Spr(9,9);s.part("#e8e4d0",q=>q.rect(3,5,2,4),{flat:1});s.part(c,q=>{q.ell(4,4,3.4,1.8);q.rect(2,4,5,1)},{lt:.5});s.set(3,3,"#ffffff");s.set(5,4,mix(c,"#ffffff",.6));
      if(r()<.6){s.part(c,q=>q.ell(7.5,6.5,1.2,.8),{flat:1});s.set(7,8,"#e8e4d0")}s.c=c;return s.outline("#1c2430")},
    /* rocher moussu */
    mrock(r,c){const s=prop.rock(r,c);for(let x=1;x<s.w-1;x++){let y=0;while(y<s.h&&!s.get(x,y))y++;if(y<s.h-2&&r()<.75){s.set(x,y,BOIS.moss);if(r()<.5)s.set(x,y+1,BOIS.moss)}}return s},
    /* cabane du bûcheron (lointaine) */
    cabin(){const s=new Spr(15,12);s.part("#6a4a32",q=>q.rect(2,5,11,7),{flat:1});for(let y=6;y<12;y+=2)for(let x=2;x<13;x++)s.set(x,y,"#57391f");
      s.part("#3e4a3a",q=>q.poly([[0,6],[7,0],[14,6]]),{flat:1});s.part("#5f8a48",q=>{q.rect(3,4,3,1);q.rect(8,3,4,1)},{flat:1});s.set(10,0,"#4a3a32");s.set(10,1,"#4a3a32");s.set(10,2,"#4a3a32");
      s.set(4,8,"#ffd86a");s.set(5,8,"#ffd86a");s.set(4,9,"#e8a83a");s.set(5,9,"#e8a83a");s.set(9,9,"#2e1c12");s.set(9,10,"#2e1c12");s.set(9,11,"#2e1c12");s.set(10,9,"#2e1c12");s.set(10,10,"#2e1c12");s.set(10,11,"#2e1c12");return s},
  });
  /* profil de cimes qui se raccorde (distance prise en boucle sur la largeur) */
  function crowns(W,r,step,base,var1,pineP){const t=[];for(let x=r()*step;x<W;x+=step*(.6+r()*.8))t.push({x,h:base+r()*var1,w:3+r()*5,pine:r()<pineP});
    const h=new Float32Array(W);for(let x=0;x<W;x++){let m=0;t.forEach(c=>{let d=Math.abs(x-c.x);d=Math.min(d,W-d);const v=c.pine?c.h-d*1.7:(d<c.w?c.h*Math.sqrt(1-(d/c.w)**2)+c.w*.4:0);if(v>m)m=v});h[x]=m}return h}
  BIOME.bois=function(zid){
    const T=TH.bois,G=T.g.map(rgb),fl=T.fl,r=rng(zid.length*1013+zid.charCodeAt(0)*7),meta={mills:[],houses:[],ponds:[],glow:[],rays:[]};
    const hz=BOIS.haze;
    /* forêt lointaine : deux rangées de cimes bleutées */
    const far=new Spr(480,FARH);{const W=480,rows=[[mix(G[1],hz,.68),crowns(W,r,7,12,16,.55),18],[mix(G[2],hz,.5),crowns(W,r,6,8,12,.45),8]];
      rows.forEach(([c,h,b])=>{const lt=mix(c,"#ffffff",.12),dk=mix(c,DARK,.1);for(let x=0;x<W;x++){const top=Math.round(FARH-b-h[x]);for(let y=Math.max(0,top);y<FARH;y++)far.set(x,y,y===top?lt:(y>top+2&&(x*3+y*5)%11===0)?dk:c)}})}
    /* forêt moyenne : couronnes, troncs dans la pénombre, cabane du bûcheron */
    const mid=new Spr(640,MIDH);{const W=640,cc=mix(G[3],hz,.36),cl=mix(cc,"#ffffff",.12),cd=mix(cc,DARK,.18),und=mix(G[3],DARK,.25),tk=mix("#4a3a32",hz,.3),h=crowns(W,r,9,10,12,.25),cbx=r()*W|0;
      for(let x=0;x<W;x++){const top=Math.round(MIDH-24-h[x]),cb=MIDH-13+Math.round(wave(x,W,[[9,1.5,1],[4,1.2,2]]));
        for(let y=Math.max(0,top);y<MIDH;y++){let c=y<cb?(y===top?cl:((x+y)%2===0&&y<top+3)?cl:(y>cb-3&&(x+y)%2===0)?cd:cc):und;mid.set(x,y,c)}}
      for(let x=r()*8|0;x<W;x+=7+(r()*9|0)){const w=1+(r()<.5?1:0);for(let y=MIDH-16;y<MIDH-3;y++)for(let i=0;i<w;i++)wset(mid,x+i,y,i===0?tk:mix(tk,DARK,.25))}
      for(let x=0;x<W;x++){const b=MIDH-3-Math.round(1.5+wave(x,W,[[13,1.2,0],[5,1,1]]));for(let y=b;y<MIDH;y++)wset(mid,x,y,y===b?mix(cc,"#ffffff",.06):cc)}
      const cab=deco.cabin();for(let i=-1;i<cab.w+1;i++)for(let y=MIDH-5;y<MIDH;y++)wset(mid,cbx+i,y,mix(G[2],hz,.25));wblit(mid,cab,cbx,MIDH-5-cab.h+1);meta.houses.push({x:cbx+10,y:MIDH-5-cab.h})}
    /* premier rang : grands troncs moussus sous leurs couronnes */
    const WH=84,wall=new Spr(512,WH);{const W=512,trees=[];for(let x=r()*30;x<W-30;x+=44+r()*46)trees.push({x:x|0,tw:6+(r()*6|0),dy:r()*8|0});
      /* troncs du fond, plus fins et dans l'ombre */
      for(let x=r()*10|0;x<W;x+=13+(r()*14|0)){const c=mix(BOIS.barkD,G[3],.45),w=2+(r()*2|0);for(let y=10;y<WH-4;y++)for(let i=0;i<w;i++)wset(wall,x+i,y,i===w-1?mix(c,DARK,.2):c)}
      const ccol=["#2f6a46","#2a6040","#336f4a"];
      /* couronnes du fond (continues en haut) */
      for(let x=0;x<W;x+=6){const c=mix(ccol[(x/6|0)%3],DARK,.25);ellipse(x,4+r()*6,10+r()*6,8+r()*5,(xx,yy)=>{if(yy>=0)wset(wall,xx,yy,(xx+yy)%5===0?mix(c,DARK,.15):c)})}
      trees.forEach(t=>{const h=WH-14-t.dy,s=new Spr(t.tw+12,h);s.part(BOIS.bark,q=>{q.rect(6,0,t.tw,h-2);q.poly([[1,h-1],[6,h-9],[6,h-1]]);q.poly([[6+t.tw,h-9],[t.tw+11,h-1],[6+t.tw,h-1]])},{lt:.25,dk:.45});
        for(let k=0;k<t.tw*3;k++){const x=7+(r()*(t.tw-2)|0),y=r()*(h-6)|0;for(let j=0;j<3+(r()*5|0);j++)if(s.get(x,y+j))s.set(x,y+j,BOIS.barkD)}
        for(let y=h-26;y<h-1;y++)for(let x=0;x<s.w;x++)if(s.get(x,y)&&(!s.get(x-1,y)||x<8)&&r()<.75-(h-y<4?0:.2)){s.set(x,y,BOIS.moss);if(r()<.4)s.set(x+1,y,BOIS.mossL)}
        s.outline("#1e1612");wblit(wall,s,t.x-6,WH-h-2+t.dy*0)});
      /* couronnes du premier rang, avec des lianes qui pendent */
      trees.forEach(t=>{const c=ccol[r()*3|0],cw=46+(r()*18|0),s=new Spr(cw,30);s.part(c,q=>{q.ell(cw/2,13,cw/2-3,10);q.ell(cw*.22,18,cw*.2,7);q.ell(cw*.78,18,cw*.2,7);q.ell(cw/2,6,cw*.28,6)},{lt:.28,dk:.42});
        const l=mix(c,LIGHT,.4),d=mix(c,DARK,.5);for(let i=0;i<cw*1.4;i++){const x=3+(r()*(cw-6)|0),y=2+(r()*22|0);if(s.get(x,y)&&s.get(x+1,y)&&s.get(x,y+2)){const k=r()<.5+(12-y)*.04?l:d;s.set(x,y,k);s.set(x+1,y,k)}}
        s.outline(mix(c,INK,.8));const ox=t.x+t.tw/2-cw/2|0,oy=-2+(r()*5|0);wblit(wall,s,ox,oy);
        for(let v=0;v<3;v++){const vx=ox+6+(r()*(cw-12)|0),vl=8+(r()*24|0);let y0=oy+24;while(y0>oy&&!wget(wall,vx,y0))y0--;for(let j=1;j<vl;j++){wset(wall,vx,y0+j,j%4===0?BOIS.mossL:"#3f7a40");if(j%5===2)wset(wall,vx+1,y0+j,"#4f8a48")}}});
      /* rayons : dans les trouées entre les couronnes */
      trees.forEach((t,i)=>{const n=trees[(i+1)%trees.length],nx=n.x<t.x?n.x+W:n.x;if(nx-t.x>62&&r()<.8)meta.rays.push({x:((t.x+nx)/2|0)%W,w:7+(r()*8|0),ph:r()*6})});
      /* pied des arbres : fougères et buissons */
      for(let i=0;i<34;i++){const f=r()<.6?deco.fern(r,r()<.5?"#3f8a4a":"#4a9a52"):prop.bush(r,"#2f7a4a");wblit(wall,f,r()*W|0,WH-f.h)}}
    /* sol : mousse, feuilles mortes, chemin de terre, accessoires */
    const W=768,ground=new Spr(W,TM+GH),P0=rgb(T.path),ph=[r()*6,r()*6,r()*6];
    for(let y=TM;y<TM+GH;y++)for(let x=0;x<W;x++)ground.p[y*W+x]=G[0];
    for(let i=0;i<130;i++){const rx=6+r()*20,ry=2+r()*6,cx=r()*W,cy=TM+ry+1+r()*(GH-2*ry-2),c=G[1+(i%3)];ellipse(cx,cy,rx,ry,(x,y,d)=>{if(y>=TM&&(d<.7||(x+y)%2===0))wset(ground,x,y,c)})}
    for(let i=0;i<34;i++){const rx=4+r()*9,ry=1.5+r()*3,cx=r()*W,cy=TM+ry+2+r()*(GH-2*ry-4);ellipse(cx,cy,rx,ry,(x,y,d)=>{if(d<.55||(x+y)%2===0)wset(ground,x,y,d<.3&&(x+y)%3===0?BOIS.mossL:BOIS.moss)})}
    for(let x=0;x<W;x++){wset(ground,x,TM,mix(G[3],DARK,.35));if((x*5)%3)wset(ground,x,TM+1,mix(G[3],DARK,.18))}
    const isG=c=>c===G[0]||c===G[1]||c===G[2]||c===G[3];
    for(let i=0;i<1300;i++){const x=r()*W|0,y=TM+3+(r()*(GH-3)|0),c=r()<.5?G[2]:G[1];if(isG(ground.get(x,y))){wset(ground,x,y,c);if(r()<.4)wset(ground,x,y-1,c)}}
    for(let i=0;i<700;i++){const x=r()*W|0,y=TM+3+(r()*(GH-4)|0),c=BOIS.litter[r()*4|0];if(isG(ground.get(x,y))){wset(ground,x,y,c);if(r()<.5)wset(ground,x+1,y,mix(c,DARK,.25))}}
    /* chemin de terre battue, bords grignotés par la mousse, racines qui le traversent sur les bords */
    const pl=mix(P0,"#fff2c2",.22),pd=mix(P0,DARK,.25),ed=mix(G[3],DARK,.3);
    const pc=x=>PY-1+Math.round(wave(x,W,[[2,2,ph[0]],[5,1,ph[1]]])),phw=x=>6+Math.round(wave(x,W,[[3,1.2,ph[2]]]));
    for(let x=0;x<W;x++){const c=pc(x),h=phw(x);for(let y=c-h-1;y<=c+h+1;y++){const e=Math.abs(y-c);if(e>h){if((x+y)%2===0)wset(ground,x,y,ed)}else if(e===h){if((x+y)%2===0)wset(ground,x,y,P0)}else wset(ground,x,y,P0)}}
    for(let i=0;i<480;i++){const x=r()*W|0,c=pc(x),h=phw(x)-1,y=c-h+(r()*h*2|0),k=r()<.4?pl:pd;wset(ground,x,y,k);if(r()<.5)wset(ground,x+1,y,k)}
    for(let i=0;i<120;i++){const x=r()*W|0,y=pc(x)+(r()*10|0)-5,c=BOIS.litter[r()*4|0];wset(ground,x,y,c)}
    for(let i=0;i<14;i++){const x0=r()*W|0,top=r()<.5,len=10+(r()*16|0),rc=mix(BOIS.bark,DARK,.1),rl=mix(BOIS.bark,"#fff2c2",.18);
      for(let j=0;j<len;j++){const x=x0+j,c=pc(x),h=phw(x),y=top?c-h-2+Math.round(Math.sin(j/len*Math.PI)*3):c+h+2-Math.round(Math.sin(j/len*Math.PI)*3);wset(ground,x,y,rc);wset(ground,x,y-1,rl)}}
    /* accessoires triés par profondeur : derrière le chemin, puis devant */
    const items=[];const back=(cnt,mk,y0,y1,g)=>{for(let i=0;i<cnt;i++){const sp=mk(),x=r()*W|0,y=(y0+r()*(y1-y0))|0;items.push([sp,x,y-sp.h]);if(g&&sp.c)meta.glow.push({x:x+4,y:y-sp.h+4,c:sp.c,ph:r()*6})}};
    const fc=()=>r()<.5?"#3f8a4a":"#4a9a52",rk=T.props.find(p=>p[0]==="bush")?"#6e7a6a":"#6e7a6a";
    back(16,()=>deco.fern(r,fc()),TM+6,PY-9);back(8,()=>prop.bush(r,"#2f7a4a"),TM+6,PY-9);back(5,()=>deco.mrock(r,rk),TM+8,PY-9);
    back(6,()=>prop.mushroom(r,"#d9574f"),TM+10,PY-9);back(9,()=>deco.glowshroom(r),TM+10,PY-9,1);back(3,()=>prop.stump(r,"#7a5a3a"),TM+8,PY-10);back(2,()=>deco.log(r),TM+12,PY-10);
    back(12,()=>deco.fern(r,fc()),PY+12,PY+40);back(4,()=>deco.mrock(r,rk),PY+12,PY+38);back(5,()=>deco.glowshroom(r),PY+12,PY+40,1);back(3,()=>prop.mushroom(r,"#d9574f"),PY+12,PY+40);
    back(4,()=>prop.bush(r,"#2f7a4a"),PY+14,PY+40);back(1,()=>deco.log(r),PY+18,PY+38);
    const sc=mix(G[3],DARK,.45);
    items.sort((a,b)=>a[2]+a[0].h-b[2]-b[0].h).forEach(([sp,x,y])=>{for(let i=1;i<sp.w-1;i++){wset(ground,x+i,y+sp.h-1,sc);if(i>1&&i<sp.w-2)wset(ground,x+i,y+sp.h,sc)}wblit(ground,sp,x,y)});
    /* hautes herbes de sous-bois (foncées), seulement sur la mousse nue */
    const bare=(x,y)=>isG(ground.get(x,y));
    const tufts=[];for(let k=0;tufts.length<60&&k<4000;k++){const x=r()*(W-2)|0,y=PY+10+(r()*17|0),h=4+(r()*7|0),w=r()<.3?2:1;let ok=true;
      for(let j=-1;j<=h+1&&ok;j++)for(let q=-1;q<=w;q++)if(!bare(x+q,y-j)){ok=false;break}
      if(ok)tufts.push({x,y,h,c:G[1+(k%3)],ph:r()*6,w,f:null})}
    /* voûte de feuillage en haut de l'image (vitesse 0,7) : lobes entiers, rien de coupé en bas */
    const CW=600,CH=40,canopy=new Spr(CW,CH);{const cs=["#1f4a36","#245440","#2a5c44"],hi="#3f7a52";
      for(let x=0;x<CW;x++){const b=Math.round(7+wave(x,CW,[[5,2,ph[0]],[11,1.5,ph[1]]]));for(let y=0;y<b;y++)canopy.set(x,y,cs[0])}
      for(let i=0;i<46;i++){const cx=r()*CW,rx=7+r()*12,ry=4+r()*(i%4===0?9:5),cy=4+r()*8,c=cs[i%3];ellipse(cx,cy,rx,ry,(x,y,d)=>{if(y>=0&&y<CH-1)wset(canopy,x,y,y>cy+ry*.55&&d>.5?mix(c,DARK,.25):c)})}
      for(let i=0;i<520;i++){const x=r()*CW|0,y=r()*CH|0;if(wget(canopy,x,y)&&wget(canopy,x+1,y)&&wget(canopy,x,y+2)){const k=r()<.35?hi:mix(cs[0],DARK,.3);wset(canopy,x,y,k);wset(canopy,x+1,y,k)}}
      for(let x=0;x<CW;x++){let y=CH-2;while(y>0&&!wget(canopy,x,y))y--;if(y>0&&y<CH-2)wset(canopy,x,y+1,mix(cs[0],DARK,.5))}
      for(let v=0;v<26;v++){const vx=r()*CW|0,vl=4+(r()*14|0);let y0=CH-3;while(y0>0&&!wget(canopy,vx,y0))y0--;for(let j=1;j<vl&&y0+j<CH-1;j++){wset(canopy,vx,y0+j,j%4===0?BOIS.mossL:"#3f7a40");if(j%5===2)wset(canopy,vx+1,y0+j,"#4f8a48")}}}
    const low=boisLow(T,G,r,W);
    return{far:far.cvs(),mid:mid.cvs(),wall:wall.cvs(),ground:ground.cvs(),low,gW:W,meta,tufts,canopy:canopy.cvs(),clouds:mkClouds(),G,fl,dark:1,flyC:["#f4f0c0","#d8f0a0"],motes:1};
  };
  /* sous-bois sous le bandeau, derrière les menus : se répète en largeur et en hauteur */
  function boisLow(T,G,r,W){const LH=200,s=new Spr(W,LH);for(let i=0;i<W*LH;i++)s.p[i]=G[0];const isG=c=>c===G[0]||c===G[1]||c===G[2]||c===G[3];
    for(let i=0;i<200;i++){const rx=6+r()*22,ry=2+r()*7,cx=r()*W,cy=ry+1+r()*(LH-2*ry-2),c=G[1+(i%3)];ellipse(cx,cy,rx,ry,(x,y,d)=>{if(d<.7||(x+y)%2===0)wset(s,x,y,c)})}
    for(let i=0;i<50;i++){const rx=4+r()*9,ry=1.5+r()*3,cx=r()*W,cy=ry+2+r()*(LH-2*ry-4);ellipse(cx,cy,rx,ry,(x,y,d)=>{if(d<.55||(x+y)%2===0)wset(s,x,y,d<.3&&(x+y)%3===0?BOIS.mossL:BOIS.moss)})}
    for(let i=0;i<2600;i++){const x=r()*W|0,y=1+(r()*(LH-2)|0),c=r()<.5?G[2]:G[1];if(isG(s.get(x,y))){wset(s,x,y,c);if(r()<.4)wset(s,x,y-1,c)}}
    for(let i=0;i<1300;i++){const x=r()*W|0,y=1+(r()*(LH-2)|0),c=BOIS.litter[r()*4|0];if(isG(s.get(x,y))){wset(s,x,y,c);if(r()<.5)wset(s,x+1,y,mix(c,DARK,.25))}}
    const items=[],put=(n,mk)=>{for(let i=0;i<n;i++){const sp=mk();items.push([sp,r()*W|0,2+(r()*(LH-sp.h-5)|0)])}};
    put(40,()=>deco.fern(r,r()<.5?"#3f8a4a":"#4a9a52"));put(14,()=>prop.bush(r,"#2f7a4a"));put(10,()=>deco.mrock(r,"#6e7a6a"));
    put(10,()=>prop.mushroom(r,"#d9574f"));put(12,()=>deco.glowshroom(r));put(4,()=>prop.stump(r,"#7a5a3a"));put(4,()=>deco.log(r));
    const sc=mix(G[3],DARK,.45);items.sort((a,b)=>a[2]+a[0].h-b[2]-b[0].h).forEach(([sp,x,y])=>{for(let i=1;i<sp.w-1;i++){wset(s,x+i,y+sp.h-1,sc);if(i>1&&i<sp.w-2)wset(s,x+i,y+sp.h,sc)}wblit(s,sp,x,y)});
    return s.cvs()}


  Object.assign(MK,{crowns});   /* aussi utilisé par js/monde.js ou par d'autres biomes */
})();
