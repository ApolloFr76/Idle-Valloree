/* Monde en bandeau : le combat se joue dans un paysage qui défile, sans cadre autour.
   Le décor est peint en pixels logiques sur un <canvas> (×4, ×3 sur petit écran), en plans qui
   défilent à des vitesses différentes : ciel, montagnes, collines et village, lisière et muret,
   prairie avec le chemin où l'on se bat, herbes du premier plan. Sous le bandeau, la prairie continue derrière les menus
   (second <canvas> en fond de page) et défile avec lui. Les acteurs (héros, monstre,
   compagnons) restent des <img> posées par-dessus (js/scene.js).
   Aussi : vie du décor (nuages et leurs ombres, papillons, oiseaux, moulins, fumées, lucioles la
   nuit, reflets sur l'eau), butin au sol ramassé en marchant, mise en scène des boss, et les
   chantiers des ouvriers (onglet Métiers, js/ouvriers.js). Objet MONDE. */
const MONDE=(()=>{
  const{Spr,prop,rng,rgb,mix,TH,DARK,LIGHT,INK}=PX.kit;
  const calm=()=>!!(S&&S.opt&&S.opt.reduceMotion);
  const R=(a,b)=>a+Math.random()*(b-a);
  const TAU=Math.PI*2;
  const css=(c,a)=>{c=rgb(c);return a==null?`rgb(${c[0]},${c[1]},${c[2]})`:`rgba(${c[0]},${c[1]},${c[2]},${a})`};
  /* bruit périodique (sinus à nombre de périodes entier) : les bandes se raccordent bout à bout */
  const wave=(x,W,terms)=>terms.reduce((a,[k,amp,ph])=>a+amp*Math.sin(TAU*k*x/W+ph),0);
  const wset=(s,x,y,c)=>s.set(((Math.round(x)%s.w)+s.w)%s.w,y,c);
  const wblit=(s,sp,ox,oy)=>{for(let y=0;y<sp.h;y++)for(let x=0;x<sp.w;x++){const c=sp.p[y*sp.w+x];if(c)wset(s,ox+x,oy+y,c)}};
  const wget=(s,x,y)=>s.get(((Math.round(x)%s.w)+s.w)%s.w,y);
  const ellipse=(cx,cy,rx,ry,fn)=>{for(let y=Math.floor(cy-ry);y<=cy+ry;y++)for(let x=Math.floor(cx-rx);x<=cx+rx;x++){const d=((x-cx)/rx)**2+((y-cy)/ry)**2;if(d<1)fn(x,y,d)}};

  /* ---------- Petits éléments de décor propres au monde ---------- */
  const deco={
    /* clochettes : fleurs en cloche qui donnent son nom à la Prairie */
    bells(r){const s=new Spr(9,9),c=r()<.5?"#8aa8ff":"#b48aff";for(let i=0;i<3;i++){const x=1+i*3,h=4+(r()*4|0);s.part("#4c8040",q=>q.rect(x,9-h,1,h),{flat:1});s.part(c,q=>{q.rect(x-1,9-h,2,2)},{flat:1});s.set(x-1,9-h+1,mix(c,DARK,.3))}return s},
    sign(r){const s=new Spr(12,14);s.part("#7a5232",q=>q.rect(5,4,2,10),{flat:1});s.part("#b07a46",q=>q.rect(1,2,10,5));s.part("#5a3a22",q=>{q.rect(3,4,6,1)},{flat:1});return s.outline("#2e1c12")},
    house(r){const s=new Spr(9,8),roof=r()<.5?"#c8553a":"#a8452e";s.part("#efe0c0",q=>q.rect(1,4,7,4),{flat:1});s.part(roof,q=>q.poly([[0,4],[4,0],[8,4]]),{flat:1});s.set(4,6,"#5a3a22");s.set(4,7,"#5a3a22");s.set(2,5,"#7ab0e0");s.set(6,5,"#7ab0e0");return s},
    mill(){const s=new Spr(7,12);s.part("#e8dcc0",q=>{q.rect(2,3,3,9);q.rect(1,9,5,3)},{flat:1});s.part("#a8452e",q=>q.poly([[1,3],[3,0],[5,3]]),{flat:1});s.set(3,10,"#5a3a22");s.set(3,11,"#5a3a22");return s},
    castle(){const s=new Spr(30,22),c="#9aa4c8",d="#8290b8";s.part(c,q=>{q.rect(4,10,22,12);q.rect(2,4,6,18);q.rect(22,4,6,18);q.rect(12,2,6,20)},{flat:1});
      s.part(d,q=>{q.rect(2,4,1,18);q.rect(12,2,1,20);q.rect(22,4,1,18)},{flat:1});
      [[2,3],[4,3],[6,3],[22,3],[24,3],[26,3],[12,1],[14,1],[16,1]].forEach(([x,y])=>s.set(x,y,c));
      s.part("#7480a8",q=>{q.rect(14,16,3,6);q.rect(4,8,1,2);q.rect(24,8,1,2);q.rect(14,6,1,2)},{flat:1});s.set(15,0,"#c8553a");s.set(16,0,"#e86a4a");s.set(15,1,"#7480a8");return s},
  };

  /* ---------- Plans du paysage (générés une fois par zone) ---------- */
  const FARH=52,MIDH=48,WALLH=46,TM=42,GH=120,PY=TM+40;   /* PY : ligne des pieds dans la bande « sol » */
  /* nuages (communs à tous les biomes en plein air) */
  const mkClouds=(col="#ffffff")=>[0,1,2,3].map(k=>{const w=22+k*6,h=8+(k%2)*3,s=new Spr(w,h);s.part(col,q=>{q.ell(w*.3,h*.62,w*.24,h*.36);q.ell(w*.55,h*.45,w*.26,h*.44);q.ell(w*.78,h*.65,w*.2,h*.3);q.rect(w*.12,h*.66,w*.76,h*.3)},{lt:.1,dk:.18});return s.cvs()});
  /* aiguillage par biome : chaque biome a sa fonction ; la Prairie sert de modèle et de repli */
  const BIOME={};
  function makeLayers(zid){return(BIOME[zid]||prairie)(zid)}
  function prairie(zid){
    const T=TH[zid]||TH.prairie,G=T.g.map(rgb),fl=T.fl||["#ffd84a","#fff"],r=rng(zid.length*1013+zid.charCodeAt(0)*7);
    const haze="#a9bde0",meta={mills:[],houses:[],ponds:[],glow:[],rays:[]};
    /* montagnes lointaines */
    const far=new Spr(480,FARH);{const W=480,c1=rgb("#aebfe2"),c2=rgb("#93a9d4"),sn=rgb("#f2f6ff"),ph=[r()*6,r()*6,r()*6];
      for(let x=0;x<W;x++){const h1=Math.round(20+16*Math.abs(Math.sin(Math.PI*5*x/W+ph[0]))+wave(x,W,[[11,2,ph[1]]])),h2=Math.round(12+7*Math.abs(Math.sin(Math.PI*8*x/W+ph[2]))+wave(x,W,[[3,3,ph[0]]]));
        for(let y=FARH-h1;y<FARH;y++)far.set(x,y,h1>31&&y<FARH-h1+3+((x*7)%3===0?1:0)?sn:c1);
        for(let y=FARH-h2;y<FARH;y++)far.set(x,y,y===FARH-h2?mix(c2,"#ffffff",.15):c2)}}
    /* collines, village, moulins, château */
    const mid=new Spr(640,MIDH);{const W=640,h1=mix(G[1],haze,.42),h2=mix(G[0],haze,.24),tr=mix(G[3],haze,.3),ph=[r()*6,r()*6,r()*6];
      const top2=x=>Math.round(MIDH-16-wave(x,W,[[3,5,ph[1]],[7,2,ph[2]]]));
      for(let x=0;x<W;x++){const t1=Math.round(MIDH-28-wave(x,W,[[2,6,ph[0]],[5,3,ph[1]]]));for(let y=t1;y<MIDH;y++)mid.set(x,y,(y===t1)?mix(h1,"#ffffff",.12):h1);
        const t2=top2(x);for(let y=t2;y<MIDH;y++)mid.set(x,y,y===t2?mix(h2,"#ffffff",.12):((x+y)%2===0&&y<t2+2)?h1:h2)}
      for(let i=0;i<70;i++){const x=r()*W|0,y=top2(x)+1+(r()*12|0),c=r()<.5?tr:mix(tr,DARK,.2);ellipse(x,y,2+r()*1.5,1.6+r(),(xx,yy)=>wset(mid,xx,yy,c))}
      const castleX=(r()*W)|0;wblit(mid,deco.castle(),castleX,MIDH-16-wave(castleX+15,W,[[3,5,ph[1]],[7,2,ph[2]]])-21);
      for(let v=0;v<3;v++){const vx=(castleX+120+v*170+(r()*40|0))%W;for(let k=0;k<3+(r()*3|0);k++){const x=vx+k*10+(r()*4|0),y=top2(x+4)+2+(r()*4|0);wblit(mid,deco.house(r),x,y-6);meta.houses.push({x:x+6,y:y-5})}}
      for(let m=0;m<2;m++){const x=(castleX+260+m*230)%W,y=top2(x+3)-9;wblit(mid,deco.mill(),x,y);meta.mills.push({x:x+3,y:y+3})}}
    /* lisière : arbres derrière un muret de pierres sèches */
    const wall=new Spr(512,WALLH);{const W=512,wc=rgb(T.wc),lt=mix(wc,"#fff2c2",.35),dk=mix(wc,DARK,.4),WY=WALLH-10;
      const trees=[];for(let cx=r()*20;cx<W-20;cx+=70+r()*60){const n=1+(r()*4|0);for(let k=0;k<n;k++)trees.push([(cx+k*(12+r()*10))|0,(r()*6)|0,r()<.3?"#4f9a48":r()<.5?"#3f8a44":"#2f7a40"])}
      trees.sort((a,b)=>a[1]-b[1]).forEach(([x,dy,c])=>wblit(wall,prop.tree(r,c,"#7a5232"),x,WALLH-42-dy));
      let x=0;const gaps=[];for(let g=0;g<3;g++)gaps.push([(g*170+r()*90)|0,14+(r()*16|0)]);
      const inGap=x=>gaps.some(([g,w])=>x>=g&&x<g+w);
      for(let row=0;row<3;row++){x=-(row%2)*5;while(x<W){const bw=8+(r()*6|0),y0=WY+1+row*3,c=r()<.3?mix(wc,DARK,.15):r()<.3?mix(wc,"#fff2c2",.12):wc;
          if(!inGap(x+bw/2))for(let j=0;j<3;j++)for(let i=0;i<bw-1;i++){if((i===0||i===bw-2)&&j===0)continue;wset(wall,x+i,y0+j,j===0?lt:(i===bw-2||j===2?mix(c,DARK,.25):c))}x+=bw}}
      for(let x=0;x<W;x++)if(!inGap(x)){wset(wall,x,WY,mix(wc,DARK,.55));if(r()<.25)wset(wall,x,WY-1,G[2])}
      for(let i=0;i<26;i++){const b=prop.bush(r,r()<.5?"#4f9a48":"#5aa84e");wblit(wall,b,r()*W|0,WALLH-b.h)}}
    /* sol : prairie, mare, chemin, accessoires */
    const W=768,ground=new Spr(W,TM+GH),P0=rgb(T.path),ph=[r()*6,r()*6,r()*6];
    for(let y=TM;y<TM+GH;y++)for(let x=0;x<W;x++)ground.p[y*W+x]=G[0];
    for(let i=0;i<120;i++){const rx=6+r()*20,ry=2+r()*6,cx=r()*W,cy=TM+ry+1+r()*(GH-2*ry-2),c=G[1+(i%3)];ellipse(cx,cy,rx,ry,(x,y,d)=>{if(y>=TM&&(d<.7||(x+y)%2===0))wset(ground,x,y,c)})}
    for(let x=0;x<W;x++){wset(ground,x,TM,mix(G[3],DARK,.25));if((x*5)%3)wset(ground,x,TM+1,mix(G[3],DARK,.12))}
    /* mares (derrière le chemin) */
    if(T.water){const wc=rgb(T.water),wl=mix(wc,"#ffffff",.45),wd=mix(wc,DARK,.3),sh=mix(G[3],DARK,.35);
      for(let k=0;k<2;k++){const cx=(k*W/2+60+r()*200)|0,cy=TM+19,rx=20+(r()*8|0),ry=6;meta.ponds.push({x:cx,y:cy,rx,ry});
        ellipse(cx,cy,rx+2.5,ry+2,(x,y,d)=>wset(ground,x,y,sh));
        ellipse(cx,cy,rx,ry,(x,y,d)=>{let c=wc;if(y<cy-ry*.4&&d>.45)c=wd;else if((x*5+y*3)%17===0)c=wl;wset(ground,x,y,c)});
        for(let j=0;j<5;j++){const rd=prop.reed(r,"#7fa24e");wblit(ground,rd,cx+(j<3?-rx-4+j*3:rx-6+j*2),cy-rd.h+ry-2+(j%2)*2)}}}
    /* brins et fleurs */
    for(let i=0;i<1700;i++){const x=r()*W|0,y=TM+3+(r()*(GH-3)|0),c=r()<.5?G[2]:G[1],cur=ground.get(x,y);if(cur===G[0]||cur===G[1]||cur===G[2]){wset(ground,x,y,c);wset(ground,x+1,y,c);if(r()<.4)wset(ground,x,y-1,c)}}
    for(let i=0;i<300;i++){const x=r()*W|0,y=TM+4+(r()*(GH-6)|0),c=fl[r()*fl.length|0],cur=ground.get(x,y);if(cur&&cur[2]>cur[1])continue;wset(ground,x,y,c);if(r()<.5){wset(ground,x+1,y,c);wset(ground,x,y+1,mix(c,DARK,.3))}}
    /* le chemin */
    const pl=mix(P0,"#fff2c2",.3),pd=mix(P0,DARK,.22),ed=mix(G[3],DARK,.22);
    const pc=x=>PY-1+Math.round(wave(x,W,[[2,2,ph[0]],[5,1,ph[1]]])),phw=x=>6+Math.round(wave(x,W,[[3,1.2,ph[2]]]));
    for(let x=0;x<W;x++){const c=pc(x),h=phw(x);for(let y=c-h-1;y<=c+h+1;y++){const e=Math.abs(y-c);if(e>h){if((x+y)%2===0)wset(ground,x,y,ed)}else if(e===h){if((x+y)%2===0)wset(ground,x,y,P0)}else wset(ground,x,y,P0)}}
    for(let i=0;i<520;i++){const x=r()*W|0,c=pc(x),h=phw(x)-1,y=c-h+(r()*h*2|0),k=r()<.5?pl:pd;wset(ground,x,y,k);if(r()<.5)wset(ground,x+1,y,k)}
    for(let i=0;i<40;i++){const x=r()*W|0,y=pc(x)+(r()*8|0)-4;wset(ground,x,y,"#c8bca8");wset(ground,x+1,y,mix("#c8bca8",DARK,.3))}
    /* accessoires triés par profondeur : derrière le chemin, puis devant */
    const items=[];const back=(n,cnt,mk,y0,y1)=>{for(let i=0;i<cnt;i++){const sp=mk();let x,y,t=0;do{x=r()*W|0;y=(y0+r()*(y1-y0))|0;t++}while(t<30&&meta.ponds.some(p=>Math.abs(x+sp.w/2-p.x)<p.rx+sp.w/2+4&&y>p.y-p.ry-4&&y-sp.h<p.y+p.ry+2));items.push([sp,x,y-sp.h,n])}};
    const tc=T.props.find(p=>p[0]==="tree"),bc=T.props.find(p=>p[0]==="bush"),rc=T.props.find(p=>p[0]==="rock");
    if(tc)back("tree",7,()=>prop.tree(r,r()<.5?tc[2]:mix(tc[2],"#ffffff",.08),tc[3]),TM+6,TM+20);
    if(bc)back("bush",14,()=>prop.bush(r,bc[2]),TM+6,PY-9);
    if(rc)back("rock",8,()=>prop.rock(r,rc[2]),TM+8,PY-9);
    back("bells",22,()=>deco.bells(r),TM+6,PY-8);back("mushroom",4,()=>prop.mushroom(r,"#d9574f"),TM+10,PY-9);back("stump",2,()=>prop.stump(r,"#7a5a3a"),TM+8,PY-10);
    back("sign",2,()=>deco.sign(r),PY-8,PY-7);
    if(rc)back("rock",6,()=>prop.rock(r,rc[2]),PY+12,PY+38);if(bc)back("bush",8,()=>prop.bush(r,bc[2]),PY+14,PY+40);back("bells",14,()=>deco.bells(r),PY+10,PY+40);
    const sc=mix(G[3],DARK,.4);
    items.sort((a,b)=>a[2]+a[0].h-b[2]-b[0].h).forEach(([sp,x,y])=>{for(let i=1;i<sp.w-1;i++){wset(ground,x+i,y+sp.h-1,sc);if(i>1&&i<sp.w-2)wset(ground,x+i,y+sp.h,sc)}wblit(ground,sp,x,y)});
    /* hautes herbes qui ondulent (dessinées à chaque image) : plantées dans la bande du sol, sous le
       chemin, seulement là où il n'y a que de l'herbe (pas sur un caillou, une fleur ou un buisson) */
    const bare=(x,y)=>{const c=ground.get(x,y);return c===G[0]||c===G[1]||c===G[2]||c===G[3]};
    const tufts=[];for(let i=0,k=0;tufts.length<90&&k<4000;k++){const x=r()*(W-2)|0,y=PY+10+(r()*17|0),h=4+(r()*8|0),w=r()<.3?2:1;let ok=true;
      for(let j=-1;j<=h+1&&ok;j++)for(let q=-1;q<=w;q++)if(!bare(x+q,y-j)){ok=false;break}
      if(ok)tufts.push({x,y,h,c:G[1+(i++%3)],ph:r()*6,w,f:r()<.12?fl[r()*fl.length|0]:null})}
    const low=lowland(T,G,fl,r,W);
    const clouds=mkClouds();
    return{far:far.cvs(),mid:mid.cvs(),wall:wall.cvs(),ground:ground.cvs(),low,gW:W,meta,tufts,clouds,G,fl};
  }
  /* prairie sous le bandeau, derrière les menus : se répète en largeur et en hauteur, sans forme coupée aux bords */
  function lowland(T,G,fl,r,W){const LH=200,s=new Spr(W,LH);for(let i=0;i<W*LH;i++)s.p[i]=G[0];
    for(let i=0;i<190;i++){const rx=6+r()*22,ry=2+r()*7,cx=r()*W,cy=ry+1+r()*(LH-2*ry-2),c=G[1+(i%3)];ellipse(cx,cy,rx,ry,(x,y,d)=>{if(d<.7||(x+y)%2===0)wset(s,x,y,c)})}
    for(let i=0;i<3600;i++){const x=r()*W|0,y=1+(r()*(LH-2)|0),c=r()<.5?G[2]:G[1];wset(s,x,y,c);wset(s,x+1,y,c);if(r()<.4)wset(s,x,y-1,c)}
    for(let k=0;k<26;k++){const cx=r()*W,cy=6+r()*(LH-12),c=fl[r()*fl.length|0];for(let i=0;i<9;i++){const x=cx+(r()-.5)*14,y=cy+(r()-.5)*7;wset(s,x,y|0,c);wset(s,x+1,y|0,mix(c,DARK,.3))}}
    for(let i=0;i<260;i++){const x=r()*W|0,y=2+(r()*(LH-4)|0),c=fl[r()*fl.length|0];wset(s,x,y,c)}
    const tc=T.props.find(p=>p[0]==="tree"),bc=T.props.find(p=>p[0]==="bush"),rc=T.props.find(p=>p[0]==="rock"),items=[];
    const put=(n,mk)=>{for(let i=0;i<n;i++){const sp=mk();items.push([sp,r()*W|0,2+(r()*(LH-sp.h-5)|0)])}};
    if(tc)put(5,()=>prop.tree(r,r()<.5?tc[2]:mix(tc[2],"#ffffff",.08),tc[3]));if(bc)put(20,()=>prop.bush(r,bc[2]));if(rc)put(14,()=>prop.rock(r,rc[2]));
    put(46,()=>deco.bells(r));put(6,()=>prop.mushroom(r,"#d9574f"));put(3,()=>prop.stump(r,"#7a5a3a"));
    const sc=mix(G[3],DARK,.4);items.sort((a,b)=>a[2]+a[0].h-b[2]-b[0].h).forEach(([sp,x,y])=>{for(let i=1;i<sp.w-1;i++){wset(s,x+i,y+sp.h-1,sc);if(i>1&&i<sp.w-2)wset(s,x+i,y+sp.h,sc)}wblit(s,sp,x,y)});
    return s.cvs()}

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


  /* ================= Marais Glouglou ================= */
  /* eau stagnante sous la brume : saules pleureurs, arbres morts, quenouilles, nénuphars,
     ponton de planches pour chemin, bulles qui éclatent à la surface et libellules le jour */
  const MAR={mud:"#4a4232",mudD:"#3a3428",plank:"#7a5c3c",plankD:"#4e3a28",post:"#4a3626",lily:"#5f9a48",lilyD:"#3f7038",flow:["#f0a8c8","#fff0f6","#f8d0e0"],haze:"#b4c6bc",cat:"#6a4428"};
  Object.assign(deco,{
    /* quenouilles : tiges fines et épis bruns */
    cattail(r){const s=new Spr(11,18);for(let i=0;i<3;i++){const x=2+i*3+(r()*2|0),h=10+(r()*7|0);s.part("#6f9a48",q=>q.rect(x,18-h,1,h),{flat:1});s.part(MAR.cat,q=>q.rect(x-(i===1?0:0),18-h+1,2,4),{flat:1});s.set(x,18-h,"#a8c070")}
      s.part("#7fa24e",q=>{q.line(1,17,0,10);q.line(9,17,10,9)},{flat:1});return s.outline("#26301e")},
    /* nénuphar, parfois en fleur */
    lily(r){const s=new Spr(9,5);s.part(MAR.lily,q=>q.ell(4,2.2,3.6,1.8),{flat:1});[[4,1],[5,1],[4,0]].forEach(([x,y])=>s.p[y*9+x]=null);s.set(2,3,MAR.lilyD);s.set(3,3,MAR.lilyD);s.set(6,3,MAR.lilyD);
      if(r()<.45){const c=MAR.flow[r()*3|0];s.set(3,1,c);s.set(4,1,c);s.set(3,0,mix(c,"#ffffff",.4));s.set(5,1,mix(c,DARK,.2));s.set(4,2,"#ffd84a")}return s},
    /* cabane sur pilotis (lointaine) */
    stilt(){const s=new Spr(16,16);s.part("#6a5a42",q=>q.rect(3,4,10,6),{flat:1});for(let y=5;y<10;y+=2)for(let x=3;x<13;x++)s.set(x,y,"#57492f");
      s.part("#5a6a4a",q=>q.poly([[1,5],[8,0],[15,5]]),{flat:1});[4,8,12].forEach(x=>{for(let y=10;y<16;y++)s.set(x,y,"#3e3428")});s.part("#7a6a50",q=>q.rect(2,10,12,1),{flat:1});
      s.set(6,6,"#ffd86a");s.set(6,7,"#e8a83a");s.set(10,6,"#2e241a");s.set(10,7,"#2e241a");s.set(10,8,"#2e241a");return s},
  });
  BIOME.marais=function(zid){
    const T=TH.marais,G=T.g.map(rgb),fl=T.fl,r=rng(zid.length*1013+zid.charCodeAt(0)*7),meta={mills:[],houses:[],ponds:[],glow:[],rays:[]},hz=MAR.haze;
    const wc=rgb(T.water),wl=mix(wc,"#ffffff",.32),wd=mix(wc,DARK,.28);
    /* lisière lointaine noyée de brume */
    const far=new Spr(480,FARH);{const W=480,c1=mix(G[1],hz,.72),c2=mix(G[2],hz,.58),h1=crowns(W,r,8,6,9,.15),h2=crowns(W,r,6,3,7,.1);
      for(let x=0;x<W;x++){const t1=Math.round(FARH-12-h1[x]);for(let y=Math.max(0,t1);y<FARH;y++)far.set(x,y,y===t1?mix(c1,"#ffffff",.15):c1);
        const t2=Math.round(FARH-6-h2[x]);for(let y=Math.max(0,t2);y<FARH;y++)far.set(x,y,y===t2?mix(c2,"#ffffff",.12):c2)}
      for(let i=0;i<6;i++){const x=r()*W|0,h=14+(r()*10|0),c=mix("#4a4a3e",hz,.6);for(let y=FARH-h;y<FARH-4;y++)wset(far,x,y,c);for(let b=0;b<3;b++){const by=FARH-h+3+b*3,d=b%2?1:-1;for(let k=1;k<4;k++)wset(far,x+d*k,by-(k>>1),c)}}}
    /* saules, arbres noyés et cabane sur pilotis, eau plate au pied */
    const mid=new Spr(640,MIDH);{const W=640,cc=mix(G[3],hz,.42),cl=mix(cc,"#ffffff",.12),tk=mix("#3e3428",hz,.4),ww=mix(wc,hz,.45),wwl=mix(ww,"#ffffff",.25);
      const tr=[];for(let x=r()*20;x<W-10;x+=26+r()*40)tr.push({x:x|0,w:7+r()*6,h:12+r()*8,dead:r()<.25});
      for(let x=0;x<W;x++)for(let y=MIDH-6;y<MIDH;y++)mid.set(x,y,y===MIDH-6?wwl:((x*3+y*7)%13===0?wwl:ww));
      tr.forEach(t=>{const by=MIDH-6;if(t.dead){for(let y=by-t.h-4;y<by;y++)wset(mid,t.x,y,tk);for(let b=0;b<3;b++){const yy=by-t.h+b*4,d=b%2?1:-1;for(let k=1;k<4+b;k++)wset(mid,t.x+d*k,yy-(k>>1),tk)}}
        else{for(let y=by-t.h+4;y<by;y++){wset(mid,t.x,y,tk);wset(mid,t.x+1,y,tk)}ellipse(t.x+1,by-t.h,t.w,4.5,(x,y,d)=>wset(mid,x,y,d<.35&&y<by-t.h?cl:cc));
          for(let x=Math.round(t.x+1-t.w+1);x<t.x+1+t.w;x+=2){const l=3+((x*7)%5);for(let j=0;j<l;j++)wset(mid,x,by-t.h+3+j,cc)}}
        for(let k=-2;k<4;k++)wset(mid,t.x+k,by,mix(tk,ww,.5))});
      const hx=r()*W|0,hut=deco.stilt();wblit(mid,hut,hx,MIDH-6-hut.h+3);meta.houses.push({x:hx+12,y:MIDH-6-hut.h+3})}
    /* premier rang : saules pleureurs, arbres morts, quenouilles */
    const WH=70,wall=new Spr(512,WH);{const W=512,wil=["#5a7e44","#4f7440","#668a4a"],bark="#4a3a2c";
      /* rideau de roseaux lointains au pied */
      for(let x=0;x<W;x++){const h=6+Math.round(3+wave(x,W,[[17,2,1],[7,1.5,2]]));for(let y=WH-h;y<WH;y++)if((x+y)%3||y>WH-4)wset(wall,x,y,y<WH-h+2?"#8aa858":"#5f8040")}
      let x=r()*30;while(x<W-30){const dead=r()<.3,sx=x|0;
        if(dead){const h=40+(r()*16|0),s=new Spr(30,h);s.part("#5a4e44",q=>{q.rect(13,6,4,h-6);q.line(15,h-24,4,h-36,2);q.line(16,h-30,26,h-42,2);q.line(5,h-35,1,h-40);q.line(14,6,10,0,2);q.poly([[10,h-1],[13,h-6],[13,h-1]]);q.poly([[17,h-6],[21,h-1],[17,h-1]])},{lt:.2,dk:.4});
          for(let k=0;k<6;k++){const mx=4+(r()*22|0);let my=0;while(my<h&&!s.get(mx,my))my++;if(my<h-10)for(let j=1;j<4+(r()*6|0);j++)s.set(mx,my+j,j%2?"#7a9a5a":"#5f7e48")}
          s.outline("#1e1a16");wblit(wall,s,sx,WH-h)}
        else{const cw=40+(r()*16|0),c=wil[r()*3|0],s=new Spr(cw,WH);s.part(bark,q=>{q.rect(cw/2-3,20,6,WH-24);q.poly([[cw/2-7,WH-1],[cw/2-3,WH-8],[cw/2-3,WH-1]]);q.poly([[cw/2+3,WH-8],[cw/2+7,WH-1],[cw/2+3,WH-1]])},{lt:.2,dk:.45});
          s.part(c,q=>{q.ell(cw/2,16,cw/2-3,9);q.ell(cw/2,10,cw*.3,6)},{lt:.3,dk:.35});
          /* rameaux qui tombent jusqu'à l'eau */
          const lt=mix(c,"#fff2c2",.3),dk=mix(c,DARK,.35);for(let k=3;k<cw-3;k+=2){let y0=16;while(y0<30&&s.get(k,y0+1))y0++;const l=12+(r()*(WH-y0-22)|0);for(let j=1;j<l;j++){const xx=k+(j>l*.6&&k%4===1?1:0);if(!s.get(xx,y0+j)||j<3)s.set(xx,y0+j,j%5===0?lt:(k%4===3?dk:c))}}
          s.outline(mix(c,INK,.8));wblit(wall,s,sx,0)}
        x+=34+r()*44}
      for(let i=0;i<20;i++){const f=r()<.6?deco.cattail(r):prop.reed(r,"#7fa24e");wblit(wall,f,r()*W|0,WH-f.h)}}
    /* sol : herbe de marais, mares, ponton */
    const W=768,ground=new Spr(W,TM+GH),ph=[r()*6,r()*6,r()*6];
    for(let y=TM;y<TM+GH;y++)for(let x=0;x<W;x++)ground.p[y*W+x]=G[0];
    for(let i=0;i<130;i++){const rx=6+r()*20,ry=2+r()*6,cx=r()*W,cy=TM+ry+1+r()*(GH-2*ry-2),c=G[1+(i%3)];ellipse(cx,cy,rx,ry,(x,y,d)=>{if(y>=TM&&(d<.7||(x+y)%2===0))wset(ground,x,y,c)})}
    for(let i=0;i<70;i++){const rx=4+r()*14,ry=1.5+r()*3.5,cx=r()*W,cy=TM+ry+2+r()*(GH-2*ry-4);ellipse(cx,cy,rx,ry,(x,y,d)=>{if(d<.6||(x+y)%2===0)wset(ground,x,y,(x+y)%3?MAR.mud:MAR.mudD)})}
    for(let x=0;x<W;x++){wset(ground,x,TM,mix(G[3],DARK,.3));if((x*5)%3)wset(ground,x,TM+1,mix(G[3],DARK,.15))}
    const isG=c=>c===G[0]||c===G[1]||c===G[2]||c===G[3];
    for(let i=0;i<1500;i++){const x=r()*W|0,y=TM+3+(r()*(GH-3)|0),c=r()<.5?G[2]:G[1];if(isG(ground.get(x,y))){wset(ground,x,y,c);wset(ground,x+1,y,c);if(r()<.5)wset(ground,x,y-1,c)}}
    /* mares : plusieurs ellipses fondues, berge de vase, reflets en traits horizontaux */
    const pc=x=>PY-1+Math.round(wave(x,W,[[2,2,ph[0]],[5,1,ph[1]]]));
    const M=new Uint8Array(W*(TM+GH)),inW=(x,y)=>M[y*W+(((x%W)+W)%W)];
    const pool=(cx,cy,rx,ry)=>{const n=2+(r()*2|0);for(let k=0;k<n;k++){const ex=cx+(k-n/2)*rx*.6+(r()-.5)*6,erx=rx*(.5+r()*.35),ery=ry*(.6+r()*.4);meta.ponds.push({x:((ex%W)+W)%W,y:cy,rx:erx*.8,ry:ery*.7});
      ellipse(ex,cy+(r()-.5)*2,erx,ery,(x,y)=>{if(y>TM+3&&y<TM+GH-3)M[y*W+(((x%W)+W)%W)]=1})}};
    for(let k=0;k<4;k++)pool((k*W/4+20+r()*90)|0,TM+18,34+r()*16,8);
    for(let k=0;k<3;k++)pool((k*W/3+150+r()*100)|0,PY+28,30+r()*16,8);
    /* le ponton passe par-dessus tout : on retire l'eau sous lui */
    for(let x=0;x<W;x++){const c=pc(x);for(let y=c-9;y<=c+9;y++)if(y>=0&&y<TM+GH)M[y*W+x]=0}
    for(let y=TM;y<TM+GH;y++)for(let x=0;x<W;x++){if(inW(x,y)){const top=!inW(x,y-1)||!inW(x,y-2);ground.p[y*W+x]=top?wd:((x*3+y*11)%23===0||((x+y*5)%37<3&&y%3===0))?wl:wc}
      else if(inW(x,y+1)||inW(x,y+2)||inW(x-1,y)||inW(x+1,y)||inW(x,y-1)){ground.p[y*W+x]=rgb((x+y)%2?MAR.mud:MAR.mudD)}}
    /* nénuphars sur l'eau */
    for(let i=0,k=0;i<26&&k<3000;k++){const sp=deco.lily(r),x=r()*W|0,y=TM+6+(r()*(GH-12)|0);let ok=true;for(let q=0;q<sp.w&&ok;q++)if(!inW(x+q,y-1)||!inW(x+q,y+sp.h))ok=false;if(ok){wblit(ground,sp,x,y);i++}}
    /* ponton de planches */
    const P0=rgb(MAR.plank),pd=rgb(MAR.plankD),pl=mix(P0,"#fff2c2",.2),hw=4;
    for(let x=0;x<W;x++){const c=pc(x),k=((x%5)+5)%5;for(let y=c-hw;y<=c+hw;y++){let col=k===4?pd:(y===c-hw?pl:y===c+hw?pd:P0);if(k!==4&&(x*7+y*3)%19===0)col=mix(P0,DARK,.15);wset(ground,x,y,col)}
      wset(ground,x,c-hw-1,mix(pd,DARK,.3));wset(ground,x,c+hw+1,mix(pd,DARK,.45));if(x%24<2){wset(ground,x,c+hw+2,MAR.post);wset(ground,x,c+hw+3,MAR.post);wset(ground,x,c+hw+4,MAR.post);wset(ground,x,c+hw+5,mix(MAR.post,DARK,.3))}
      if(x%5===2&&(x*13)%7===0){wset(ground,x,c-hw+1,"#3a2a1e");wset(ground,x,c+hw-1,"#3a2a1e")}}
    /* accessoires : quenouilles et roseaux au bord de l'eau, rochers, champignons */
    const items=[],nearW=(x,y)=>inW(x-3,y)||inW(x+3,y)||inW(x,y+2);
    const put=(cnt,mk,y0,y1,need)=>{for(let i=0,k=0;i<cnt&&k<400;k++){const sp=mk(),x=r()*W|0,y=(y0+r()*(y1-y0))|0,bx=x+(sp.w>>1);if(inW(bx,y-1)||inW(bx,y))continue;if(need&&!nearW(bx,y))continue;items.push([sp,x,y-sp.h]);i++}};
    put(14,()=>deco.cattail(r),TM+6,PY-10,1);put(10,()=>prop.reed(r,"#7fa24e"),TM+6,PY-10,1);put(4,()=>prop.rock(r,"#6f7a6a"),TM+8,PY-10);put(3,()=>prop.mushroom(r,"#8a6fd0"),TM+8,PY-10);put(6,()=>prop.bush(r,"#4f7a44"),TM+6,PY-10);
    put(12,()=>deco.cattail(r),PY+14,TM+GH-6,1);put(8,()=>prop.reed(r,"#7fa24e"),PY+14,TM+GH-6,1);put(3,()=>prop.rock(r,"#6f7a6a"),PY+14,TM+GH-6);put(2,()=>prop.stump(r,"#5a4a3a"),PY+14,TM+GH-6);
    const sc=mix(G[3],DARK,.4);
    items.sort((a,b)=>a[2]+a[0].h-b[2]-b[0].h).forEach(([sp,x,y])=>{for(let i=1;i<sp.w-1;i++){if(!inW(x+i,y+sp.h-1))wset(ground,x+i,y+sp.h-1,sc)}wblit(ground,sp,x,y)});
    const bare=(x,y)=>isG(ground.get(x,y));
    const tufts=[];for(let k=0;tufts.length<70&&k<5000;k++){const x=r()*(W-2)|0,y=PY+12+(r()*16|0),h=5+(r()*8|0),w=1;let ok=true;
      for(let j=-1;j<=h+1&&ok;j++)for(let q=-1;q<=w;q++)if(!bare(x+q,y-j)){ok=false;break}
      if(ok)tufts.push({x,y,h,c:r()<.5?rgb("#7fa24e"):G[1+(k%3)],ph:r()*6,w,f:r()<.15?MAR.cat:null})}
    const low=maraisLow(T,G,r,W);
    return{far:far.cvs(),mid:mid.cvs(),wall:wall.cvs(),ground:ground.cvs(),low,gW:W,meta,tufts,clouds:mkClouds(),G,fl,mist:1,bubbles:1,flyC:["#5fd0e0","#7ab0ff","#9ae08a"],drag:1};
  };
  /* marais sous le bandeau : mares entières (rien de coupé en haut ni en bas), roseaux, nénuphars */
  function maraisLow(T,G,r,W){const LH=200,s=new Spr(W,LH);for(let i=0;i<W*LH;i++)s.p[i]=G[0];const isG=c=>c===G[0]||c===G[1]||c===G[2]||c===G[3];
    const wc=rgb(T.water),wl=mix(wc,"#ffffff",.32),wd=mix(wc,DARK,.28);
    for(let i=0;i<190;i++){const rx=6+r()*22,ry=2+r()*7,cx=r()*W,cy=ry+1+r()*(LH-2*ry-2),c=G[1+(i%3)];ellipse(cx,cy,rx,ry,(x,y,d)=>{if(d<.7||(x+y)%2===0)wset(s,x,y,c)})}
    for(let i=0;i<3000;i++){const x=r()*W|0,y=1+(r()*(LH-2)|0),c=r()<.5?G[2]:G[1];if(isG(s.get(x,y))){wset(s,x,y,c);wset(s,x+1,y,c)}}
    const M=new Uint8Array(W*LH),inW=(x,y)=>y>=0&&y<LH&&M[y*W+(((x%W)+W)%W)];
    for(let k=0;k<9;k++){const cx=r()*W,cy=14+r()*(LH-28),n=2+(r()*2|0);for(let j=0;j<n;j++)ellipse(cx+(j-n/2)*14+(r()-.5)*6,cy+(r()-.5)*3,14+r()*10,5+r()*3,(x,y)=>{if(y>3&&y<LH-4)M[y*W+(((x%W)+W)%W)]=1})}
    for(let y=0;y<LH;y++)for(let x=0;x<W;x++){if(inW(x,y)){const top=!inW(x,y-1)||!inW(x,y-2);s.p[y*W+x]=top?wd:((x*3+y*11)%23===0||((x+y*5)%37<3&&y%3===0))?wl:wc}
      else if(inW(x,y+1)||inW(x,y+2)||inW(x-1,y)||inW(x+1,y)||inW(x,y-1))s.p[y*W+x]=rgb((x+y)%2?MAR.mud:MAR.mudD)}
    for(let i=0,k=0;i<40&&k<4000;k++){const sp=deco.lily(r),x=r()*W|0,y=4+(r()*(LH-10)|0);let ok=true;for(let q=0;q<sp.w&&ok;q++)if(!inW(x+q,y-1)||!inW(x+q,y+sp.h))ok=false;if(ok){wblit(s,sp,x,y);i++}}
    const items=[];const put=(n,mk,need)=>{for(let i=0,k=0;i<n&&k<500;k++){const sp=mk(),x=r()*W|0,y=2+(r()*(LH-sp.h-6)|0),by=y+sp.h,bx=x+(sp.w>>1);if(inW(bx,by)||inW(bx,by-1))continue;if(need&&!(inW(bx-3,by)||inW(bx+3,by)||inW(bx,by+2)))continue;items.push([sp,x,y]);i++}};
    put(30,()=>deco.cattail(r),1);put(20,()=>prop.reed(r,"#7fa24e"),1);put(10,()=>prop.bush(r,"#4f7a44"));put(8,()=>prop.rock(r,"#6f7a6a"));put(4,()=>prop.mushroom(r,"#8a6fd0"));
    items.sort((a,b)=>a[2]+a[0].h-b[2]-b[0].h).forEach(([sp,x,y])=>wblit(s,sp,x,y));
    return s.cvs()}

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

  /* ================= Pics de Givrecrin ================= */
  /* haute montagne enneigée : pics acérés, contreforts aux sapins, chalet qui fume, grands sapins
     chargés de neige, étang gelé ; flocons sur deux profondeurs, éclats sur la neige, aurore la nuit */
  const GIV={snow:"#eef6fc",snowL:"#ffffff",snowS:"#c6ddef",snowD:"#a8c4dc",ice:"#9ccbec",iceL:"#d8f0ff",iceD:"#6a9cc8",pine:"#3f7a6a",pineD:"#2c5c50",rock:"#7a8aa0",wood:"#7a5636"};
  Object.assign(deco,{
    /* rocher coiffé de neige */
    srock(r){const s=prop.rock(r,GIV.rock);for(let x=1;x<s.w-1;x++){let y=0;while(y<s.h&&!s.get(x,y))y++;if(y<s.h-3){s.set(x,y,GIV.snowL);s.set(x,y+1,GIV.snow);if(r()<.5)s.set(x,y+2,GIV.snow)}}return s},
    /* congère : bosse de neige */
    drift(r){const w=12+(r()*14|0),s=new Spr(w+2,7);s.part(GIV.snow,q=>q.ell(w/2+1,5,w/2,3.6),{lt:.5,dk:.12});return s.outline(GIV.snowD)},
    /* piquet de clôture qui dépasse de la neige */
    post(r){const s=new Spr(5,10);s.part(GIV.wood,q=>q.rect(1,1,3,9),{flat:1});s.set(3,2,mix(GIV.wood,DARK,.3));s.part(GIV.snowL,q=>{q.rect(1,0,3,1);q.rect(0,9,5,1)},{flat:1});return s.outline("#2e2234")},
    /* grand sapin enneigé, dessiné à sa taille (pas d'agrandissement) */
    bigpine(r,h){const w=Math.round(h*.62),s=new Spr(w+2,h),c=r()<.5?GIV.pine:"#356e60",cx=w/2+1,tiers=4+(h>40?1:0);s.part("#5a4030",q=>q.rect(cx-2,h-6,4,6),{flat:1});
      s.part(c,q=>{for(let i=0;i<tiers;i++){const y0=Math.round(i*(h-8)/tiers*.92),y1=Math.round((i+1)*(h-8)/tiers+2),hw=(w/2)*(.35+.65*(i+1)/tiers);q.poly([[cx,y0],[cx-hw,y1],[cx+hw,y1]])}},{dk:.45,lt:.25});
      for(let i=0;i<tiers;i++){const y1=Math.round((i+1)*(h-8)/tiers+2),hw=(w/2)*(.35+.65*(i+1)/tiers);for(let x=Math.round(cx-hw);x<=cx+hw;x++){if(s.get(x,y1)&&(x+i)%5!==0){s.set(x,y1-1,GIV.snowL);if((x+i)%3)s.set(x,y1-2,GIV.snow)}}}
      s.set(Math.round(cx),0,GIV.snowL);s.set(Math.round(cx),1,GIV.snowL);return s.outline(mix(c,INK,.8))},
    /* bonhomme de neige */
    snowman(r){const s=new Spr(12,17);s.part(GIV.snow,q=>{q.ell(6,12.5,4.4,4);q.ell(6,6.5,3.2,3)},{lt:.5,dk:.18});s.set(5,6,"#1c1020");s.set(7,6,"#1c1020");s.set(6,7,"#f08a3c");s.set(7,7,"#f08a3c");
      s.part("#3a3446",q=>{q.rect(3,2,6,1);q.rect(4,0,4,2)},{flat:1});s.part("#d84a4a",q=>q.rect(3,9,6,1),{flat:1});s.set(6,11,"#1c1020");s.set(6,13,"#1c1020");return s.outline("#5a6a8a")},
    /* chalet (lointain) */
    chalet(){const s=new Spr(16,13);s.part("#8a5a36",q=>q.rect(2,6,12,7),{flat:1});for(let y=7;y<13;y+=2)for(let x=2;x<14;x++)s.set(x,y,"#6e4428");
      s.part(GIV.snowL,q=>q.poly([[0,7],[8,0],[15,7]]),{flat:1});s.part(GIV.snowS,q=>q.rect(1,7,14,1),{flat:1});s.set(12,1,"#5a4a42");s.set(12,2,"#5a4a42");s.set(12,3,"#5a4a42");
      s.set(5,9,"#ffd86a");s.set(6,9,"#ffd86a");s.set(5,10,"#e8a83a");s.set(6,10,"#e8a83a");s.set(10,10,"#3a2414");s.set(10,11,"#3a2414");s.set(10,12,"#3a2414");s.set(11,10,"#3a2414");s.set(11,11,"#3a2414");s.set(11,12,"#3a2414");return s},
  });
  BIOME.givre=function(zid){
    const T=TH.givre,G=T.g.map(rgb),fl=T.fl,r=rng(zid.length*1013+zid.charCodeAt(0)*7),meta={mills:[],houses:[],ponds:[],glow:[],rays:[]},hz="#cfe0f4";
    /* pics acérés : face éclairée à gauche, face à l'ombre à droite, neige en haut */
    const far=new Spr(480,FARH);{const W=480,lit=mix("#e8f2ff",hz,.3),sh=mix("#8aa6cc",hz,.35),rk=mix("#6a7e9e",hz,.4),pk=[];for(let x=r()*30;x<W;x+=34+r()*44)pk.push({x,h:26+r()*24,s:1.1+r()*.6});
      const hm=new Float32Array(W),side=new Int8Array(W);for(let x=0;x<W;x++){let m=8+wave(x,W,[[6,2,1]]),sd=0;pk.forEach(p=>{let d=x-p.x;if(d>W/2)d-=W;if(d<-W/2)d+=W;const v=p.h-Math.abs(d)*p.s+wave(x,W,[[37,1.2,p.x]]);if(v>m){m=v;sd=d<0?-1:1}});hm[x]=m;side[x]=sd}
      for(let x=0;x<W;x++){const top=Math.round(FARH-hm[x]);for(let y=Math.max(0,top);y<FARH;y++){const e=y-top,snowy=e<8+((x*7)%5)||hm[x]-e>36;let c=side[x]>0?sh:lit;if(!snowy)c=side[x]>0?mix(rk,DARK,.15):rk;if((x*3+y*5)%11===0&&!snowy)c=mix(c,"#ffffff",.15);far.set(x,y,c)}}}
    /* contreforts : collines de neige, forêt de sapins, chalet */
    const mid=new Spr(640,MIDH);{const W=640,c=mix(GIV.snow,hz,.3),cs=mix(GIV.snowS,hz,.3),pc=mix(GIV.pine,hz,.45),pd=mix(GIV.pineD,hz,.4),top2=x=>Math.round(MIDH-20-wave(x,W,[[3,6,1.4],[7,2.5,.3]]));
      for(let x=0;x<W;x++){const t=top2(x),sl=top2(x+1)-top2(x-1);for(let y=Math.max(0,t);y<MIDH;y++)mid.set(x,y,y===t?mix(c,"#ffffff",.4):sl<0&&y<t+5&&(x+y)%2?cs:c)}
      for(let i=0;i<120;i++){const x=r()*W|0,b=top2(x)+3+(r()*14|0),h=5+(r()*5|0);for(let j=0;j<h;j++){const hw=Math.floor(j*.45);for(let q=-hw;q<=hw;q++)wset(mid,x+q,b-h+j,q>0?pd:(j%3===0&&q<0?mix(c,pc,.4):pc))}wset(mid,x,b-h,mix(c,"#ffffff",.3));wset(mid,x,b,mix(GIV.wood,hz,.5))}
      const cx=r()*W|0,ch=deco.chalet();wblit(mid,ch,cx,top2(cx+8)+8-ch.h);meta.houses.push({x:cx+12,y:top2(cx+8)+8-ch.h})}
    /* premier rang : grands sapins enneigés et congères */
    const WH=60,wall=new Spr(512,WH);{const W=512,base=rgb(GIV.snow),bl=rgb(GIV.snowL),bs=rgb(GIV.snowS);
      const h=x=>WH-10-wave(x,W,[[4,3,.8],[9,1.5,2.1]]);
      const trees=[];for(let x=r()*20;x<W-10;x+=50+r()*70){const n=1+(r()*3|0);for(let k=0;k<n;k++)trees.push([(x+k*(10+r()*8))|0,r()*6|0,k===0&&r()<.6?38+(r()*12|0):22+(r()*12|0)])}
      trees.sort((a,b)=>b[2]-a[2]).forEach(([x,dy,th])=>{const p=deco.bigpine(r,th);wblit(wall,p,x-(p.w>>1),Math.round(h(x))+4-p.h-dy)});
      for(let x=0;x<W;x++){const top=Math.round(h(x)),sl=h(x+1)-h(x-1);for(let y=top;y<WH;y++)wset(wall,x,y,y===top?bl:(sl>.2&&y<top+4&&(x+y)%2)?bs:base)}
      for(let i=0;i<12;i++){const k=deco.srock(r),x=r()*W|0;wblit(wall,k,x,Math.round(h(x+5))-k.h+4)}}
    /* sol : neige aux ombres bleues, étang gelé, sentier tassé */
    const W=768,ground=new Spr(W,TM+GH),ph=[r()*6,r()*6,r()*6];
    for(let y=TM;y<TM+GH;y++)for(let x=0;x<W;x++)ground.p[y*W+x]=G[0];
    for(let i=0;i<110;i++){const rx=8+r()*24,ry=2+r()*5,cx=r()*W,cy=TM+ry+1+r()*(GH-2*ry-2),c=i%3===0?G[2]:G[1];ellipse(cx,cy,rx,ry,(x,y,d)=>{if(y>=TM&&(d<.6||(x+y)%2===0))wset(ground,x,y,c)})}
    /* ombres douces au pied des bosses */
    for(let i=0;i<40;i++){const rx=10+r()*20,ry=2+r()*2,cx=r()*W,cy=TM+ry+3+r()*(GH-2*ry-6);ellipse(cx,cy,rx,ry,(x,y,d)=>{if(d>.35&&y>cy&&(x+y)%2===0)wset(ground,x,y,G[3])})}
    for(let x=0;x<W;x++){wset(ground,x,TM,G[3]);if((x*5)%3)wset(ground,x,TM+1,G[2])}
    /* étangs gelés (derrière le sentier) */
    const ice=rgb(GIV.ice),iL=rgb(GIV.iceL),iD=rgb(GIV.iceD);
    for(let k=0;k<2;k++){const cx=(k*W/2+80+r()*200)|0,cy=TM+19,rx=26+(r()*10|0),ry=6;meta.ponds.push({x:cx,y:cy,rx,ry});
      ellipse(cx,cy,rx+2,ry+1.6,(x,y)=>wset(ground,x,y,G[3]));ellipse(cx,cy,rx,ry,(x,y,d)=>{let c=ice;if(y<cy-ry*.4&&d>.5)c=iD;else if(((x-cx)+(y-cy)*3)%13===0&&d<.7)c=iL;wset(ground,x,y,c)});
      for(let n=0;n<3;n++){let x=cx+(r()-.5)*rx,y=cy+(r()-.5)*ry;for(let j=0;j<8;j++){x+=r()<.5?1:-1;y+=(r()-.5)*1.2;if(((x-cx)/rx)**2+((y-cy)/ry)**2<.8)wset(ground,x,y|0,mix(ice,"#ffffff",.6))}}}
    const P0=mix(T.path,"#8aa6c8",.4),pl=mix(P0,"#ffffff",.3),pd=mix(P0,DARK,.15),ed=G[3];
    const pc=x=>PY-1+Math.round(wave(x,W,[[2,2,ph[0]],[5,1,ph[1]]])),phw=x=>5+Math.round(wave(x,W,[[3,1.2,ph[2]]]));
    for(let x=0;x<W;x++){const c=pc(x),h=phw(x);for(let y=c-h-1;y<=c+h+1;y++){const e=Math.abs(y-c);if(e>h){wset(ground,x,y,y<c?GIV.snowL:ed)}else if(e===h){if((x+y)%2===0)wset(ground,x,y,P0)}else wset(ground,x,y,P0)}}
    for(let x=0;x<W;x+=5){const c=pc(x)+((x/5|0)%2?-2:2);wset(ground,x,c,pd);wset(ground,x+1,c,pd);wset(ground,x,c+1,pd)}
    for(let i=0;i<200;i++){const x=r()*W|0,c=pc(x),h=phw(x)-1,y=c-h+(r()*h*2|0);wset(ground,x,y,r()<.6?pl:pd)}
    const items=[];const put=(cnt,mk,y0,y1)=>{for(let i=0;i<cnt;i++){const sp=mk();let x,y,t=0;do{x=r()*W|0;y=(y0+r()*(y1-y0))|0;t++}while(t<30&&meta.ponds.some(p=>Math.abs(x+sp.w/2-p.x)<p.rx+sp.w/2+4&&y>p.y-p.ry-4&&y-sp.h<p.y+p.ry+2));items.push([sp,x,y-sp.h])}};
    put(3,()=>prop.pine(r,GIV.pine,"#5a4030",1),TM+10,TM+24);put(5,()=>deco.srock(r),TM+8,PY-9);put(5,()=>prop.crystal(r,"#a6dcff"),TM+8,PY-9);put(6,()=>deco.drift(r),TM+8,PY-9);put(1,()=>deco.snowman(r),TM+18,PY-9);
    put(5,()=>deco.post(r),PY-8,PY-7);
    put(4,()=>deco.srock(r),PY+12,TM+GH-6);put(4,()=>prop.crystal(r,"#a6dcff"),PY+12,TM+GH-6);put(8,()=>deco.drift(r),PY+12,TM+GH-6);put(2,()=>prop.pine(r,GIV.pine,"#5a4030",1),PY+40,TM+GH-6);
    const sc=G[3];
    items.sort((a,b)=>a[2]+a[0].h-b[2]-b[0].h).forEach(([sp,x,y])=>{for(let i=1;i<sp.w-1;i++){wset(ground,x+i+1,y+sp.h-1,sc);if(i>1&&i<sp.w-2)wset(ground,x+i+2,y+sp.h,sc)}wblit(ground,sp,x,y)});
    /* éclats qui scintillent sur la neige (positions fixes, posées sur le sol) */
    const isS=c=>c===G[0]||c===G[1]||c===G[2];const sparks=[];for(let k=0;sparks.length<70&&k<3000;k++){const x=r()*W|0,y=TM+4+(r()*(GH-6)|0);if(isS(ground.get(x,y)))sparks.push({x,y,ph:r()*TAU,sp:.6+r()*1.2})}
    const low=givreLow(T,G,r,W);
    return{far:far.cvs(),mid:mid.cvs(),wall:wall.cvs(),ground:ground.cvs(),low,gW:W,meta,tufts:[],clouds:mkClouds(),G,fl,snow:1,sparks,aurora:1,dayFlies:0,nightFlies:0};
  };
  function givreLow(T,G,r,W){const LH=200,s=new Spr(W,LH);for(let i=0;i<W*LH;i++)s.p[i]=G[0];
    for(let i=0;i<180;i++){const rx=8+r()*26,ry=2+r()*6,cx=r()*W,cy=ry+1+r()*(LH-2*ry-2),c=i%3===0?G[2]:G[1];ellipse(cx,cy,rx,ry,(x,y,d)=>{if(d<.6||(x+y)%2===0)wset(s,x,y,c)})}
    for(let i=0;i<70;i++){const rx=10+r()*20,ry=2+r()*2,cx=r()*W,cy=ry+3+r()*(LH-2*ry-6);ellipse(cx,cy,rx,ry,(x,y,d)=>{if(d>.35&&y>cy&&(x+y)%2===0)wset(s,x,y,G[3])})}
    const items=[],put=(n,mk)=>{for(let i=0;i<n;i++){const sp=mk();items.push([sp,r()*W|0,2+(r()*(LH-sp.h-5)|0)])}};
    put(6,()=>prop.pine(r,GIV.pine,"#5a4030",1));put(12,()=>deco.srock(r));put(10,()=>prop.crystal(r,"#a6dcff"));put(18,()=>deco.drift(r));put(6,()=>deco.post(r));
    items.sort((a,b)=>a[2]+a[0].h-b[2]-b[0].h).forEach(([sp,x,y])=>{for(let i=1;i<sp.w-1;i++)wset(s,x+i+1,y+sp.h-1,G[3]);wblit(s,sp,x,y)});
    return s.cvs()}

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

  /* ================= Récifs de Corail-Chant ================= */
  /* sous la mer : la surface qui scintille en haut, rayons de lumière, récifs lointains et épave,
     grands coraux, varech qui ondule, sable ridé, coquillages ; bancs de poissons, méduses,
     colonnes de bulles, plancton qui luit la nuit */
  const REC={sea:"#2f8ab0",coral:["#ff7a8a","#b98aff","#ffb05a","#ff9ac8"],fan:"#e85a6a",sponge:"#9a6ad8",kelp:"#5a8a3a",kelpL:"#7aaa4a",sand:"#f0dca0",rock:"#b0a890",star:"#ff8a4a",urchin:"#4a3a6a",shell:"#fff0e0",haze:"#3a8ab8"};
  Object.assign(deco,{
    /* corail branchu */
    bcoral(r,c,h){h=h||14+(r()*12|0);const s=new Spr(h,h);s.part(c,q=>{const br=(x,y,a,l,d)=>{const x2=x+Math.cos(a)*l,y2=y+Math.sin(a)*l;q.line(x,y,x2,y2,d>1?2:1);if(d>0){br(x2,y2,a-.5,l*.7,d-1);br(x2,y2,a+.45,l*.7,d-1)}};br(h/2,h-1,-Math.PI/2,h*.38,3)},{lt:.4,dk:.3});
      for(let i=0;i<h;i++){const x=r()*h|0,y=r()*h|0;if(s.get(x,y)&&!s.get(x,y-1))s.set(x,y,mix(c,"#ffffff",.5))}return s.outline(mix(c,INK,.7))},
    /* corail cerveau */
    brain(r,c){const w=10+(r()*8|0),s=new Spr(w+2,Math.round(w*.6)+2);s.part(c,q=>q.ell(w/2+1,w*.6,w/2,w*.55),{lt:.35,dk:.35});for(let y=2;y<s.h;y+=2)for(let x=1;x<s.w;x++)if(s.get(x,y)&&Math.sin(x*.9+y*1.7)>.2)s.set(x,y,mix(c,DARK,.25));return s.outline(mix(c,INK,.7))},
    /* éponges en tubes */
    sponge(r){const s=new Spr(12,18),c=REC.sponge;s.part(c,q=>{q.rect(1,6,3,12);q.rect(5,1,3,17);q.rect(9,8,2,10)},{lt:.35,dk:.35});[[2,6],[6,1],[9,8]].forEach(([x,y])=>{s.set(x,y,mix(c,DARK,.5));s.set(x+(x===9?0:1),y,mix(c,DARK,.5))});return s.outline(mix(c,INK,.7))},
    /* gorgone : éventail en résille */
    seafan(r){const s=new Spr(17,16),c=REC.fan;s.part(c,q=>{for(let a=-4;a<=4;a++){const an=-Math.PI/2+a*.3;q.line(8,15,8+Math.cos(an)*8,15+Math.sin(an)*14)}for(let k=4;k<14;k+=3){for(let a=-4;a<=4;a++){const an=-Math.PI/2+a*.3;q.px(8+Math.cos(an)*k*.58,15+Math.sin(an)*k)}}},{flat:1});return s.outline(mix(c,INK,.7))},
    starfish(r){const s=new Spr(9,9),c=r()<.6?REC.star:"#e85a8a";s.part(c,q=>{for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5;q.line(4,4,4+Math.cos(a)*4,4+Math.sin(a)*4)}q.px(4,4)},{flat:1});s.set(4,4,mix(c,"#ffffff",.4));return s.outline(mix(c,INK,.6))},
    urchin(r){const s=new Spr(9,8);s.part(REC.urchin,q=>{q.ell(4,5,2.6,2);for(let i=0;i<7;i++){const a=-Math.PI+i*Math.PI/6;q.line(4,5,4+Math.cos(a)*4,5+Math.sin(a)*4)}},{flat:1});return s},
    shell(r){const s=new Spr(7,5),c=r()<.5?REC.shell:"#ffc8b0";s.part(c,q=>{q.poly([[0,4],[3,0],[6,4]])},{flat:1});s.set(2,3,mix(c,DARK,.2));s.set(4,3,mix(c,DARK,.2));s.set(3,2,mix(c,DARK,.2));return s.outline(mix(c,INK,.6))},
    /* anémone : tentacules qui partent d'un pied */
    anemone(r){const c=r()<.5?"#ff8ab0":"#8ae0d0",s=new Spr(11,9);s.part("#e8d0b0",q=>q.rect(3,6,5,3),{flat:1});s.part(c,q=>{for(let i=0;i<7;i++){const x=1+i*1.4;q.line(5.5,6,x,1+(i%2))}},{flat:1});return s.outline(mix(c,INK,.7))},
    /* palourde avec perle (luit la nuit) */
    clam(r){const s=new Spr(10,7);s.part("#8a7aa8",q=>{q.ell(5,5,4.4,1.8);q.ell(5,2.5,4,1.8)},{lt:.3,dk:.3});s.set(5,4,"#fffaf0");s.set(4,4,"#e8e0f8");s.part("#1c1428",q=>q.rect(2,3,6,1),{flat:1});s.set(5,3,"#fffaf0");s.c="#e8f0ff";return s.outline("#2a2040")},
    /* épave (lointaine) */
    wreck(){const s=new Spr(46,26),c="#4a5a6a";s.part(c,q=>{q.poly([[0,18],[44,12],[40,24],[6,26]]);q.rect(20,0,2,15);q.line(21,3,32,8);q.line(21,3,10,9);q.rect(14,4,14,1)},{flat:1});for(let x=6;x<40;x+=5)s.set(x,20,"#2a3440");return s},
  });
  BIOME.recifs=function(zid){
    const T=TH.recifs,G=T.g.map(rgb),fl=T.fl,r=rng(zid.length*1013+zid.charCodeAt(0)*7),meta={mills:[],houses:[],ponds:[],glow:[],rays:[],vents:[]},hz=REC.haze;
    /* récifs lointains, arche de roche */
    const far=new Spr(480,FARH);{const W=480,c=mix("#2a6a98",hz,.4),cl=mix(c,"#ffffff",.08),h=crowns(W,r,10,8,14,0);
      for(let x=0;x<W;x++){const top=Math.round(FARH-6-h[x]);for(let y=Math.max(0,top);y<FARH;y++)far.set(x,y,y===top?cl:c)}
      const ax=r()*W|0;for(let x=ax;x<ax+30;x++){const dx=(x-ax-15)/15,inner=Math.round(16*Math.sqrt(Math.max(0,1-dx*dx)));for(let y=FARH-30;y<FARH;y++){const e=FARH-y;if(Math.abs(dx)<.75&&e<inner)continue;wset(far,x,y,e>27?cl:c)}}}
    /* récif moyen : massifs de coraux, gorgones, épave */
    const mid=new Spr(640,MIDH);{const W=640,c=mix("#3a7aa0",hz,.25),h=crowns(W,r,7,10,12,0);
      for(let x=0;x<W;x++){const top=Math.round(MIDH-12-h[x]);for(let y=Math.max(0,top);y<MIDH;y++)mid.set(x,y,y===top?mix(c,"#ffffff",.12):(x*5+y*3)%13===0?mix(c,DARK,.15):c)}
      for(let i=0;i<40;i++){const x=r()*W|0,cc=mix(REC.coral[r()*4|0],hz,.55);let top=0;while(top<MIDH&&!mid.get(((x%W)+W)%W,top))top++;const sp=r()<.5?deco.bcoral(r,cc,8+(r()*6|0)):deco.brain(r,cc);const sm=new Spr(sp.w,sp.h);for(let k=0;k<sp.p.length;k++)if(sp.p[k])sm.p[k]=mix(sp.p[k],hz,.35);wblit(mid,sm,x,top+3-sm.h)}
      const wx=r()*W|0,wr=deco.wreck(),ws=new Spr(wr.w,wr.h);for(let k=0;k<wr.p.length;k++)if(wr.p[k])ws.p[k]=mix(wr.p[k],hz,.35);wblit(mid,ws,wx,MIDH-ws.h-2)}
    /* premier rang : grands coraux sur des rochers ; le varech est dessiné à chaque image */
    const WH=60,wall=new Spr(512,WH);{const W=512,rc=rgb(REC.rock),rd=mix(REC.rock,DARK,.3);
      const h=x=>WH-10-wave(x,W,[[5,3,.4],[11,1.5,1.2]]);
      const items=[];for(let x=r()*20;x<W-10;x+=12+r()*22){const k=r();items.push([k<.4?deco.bcoral(r,REC.coral[r()*4|0],18+(r()*14|0)):k<.6?deco.brain(r,REC.coral[r()*4|0]):k<.8?deco.sponge(r):deco.seafan(r),x|0])}
      for(let x=0;x<W;x++){const top=Math.round(h(x));for(let y=top;y<WH;y++)wset(wall,x,y,y===top?mix(rc,"#ffffff",.15):(x*3+y*7)%11===0?rd:rc)}
      items.forEach(([sp,x])=>wblit(wall,sp,x,Math.round(h(x+sp.w/2))+3-sp.h));
      const kelp=[];for(let x=r()*30;x<W;x+=26+r()*40){const n=1+(r()*3|0);for(let k=0;k<n;k++){const kx=(x+k*3)|0;kelp.push({x:kx,y:Math.round(h(kx))+2,h:30+(r()*30|0),ph:r()*6})}}
      meta.kelp=kelp;
      /* rayons de surface entre les massifs */
      for(let i=0;i<5;i++)meta.rays.push({x:(i*W/5+r()*60)|0,w:6+(r()*8|0),ph:r()*6})}
    /* fond de sable ridé, sentier de sable clair */
    const W=768,ground=new Spr(W,TM+GH),ph=[r()*6,r()*6,r()*6];
    for(let y=TM;y<TM+GH;y++)for(let x=0;x<W;x++)ground.p[y*W+x]=G[0];
    for(let i=0;i<120;i++){const rx=8+r()*24,ry=2+r()*5,cx=r()*W,cy=TM+ry+1+r()*(GH-2*ry-2),c=G[1+(i%3)];ellipse(cx,cy,rx,ry,(x,y,d)=>{if(y>=TM&&(d<.6||(x+y)%2===0))wset(ground,x,y,c)})}
    const rl=mix(G[1],"#ffffff",.3),rd=mix(G[0],G[3],.6);
    for(let y=TM+5;y<TM+GH-3;y+=6+(y%4)){const p0=r()*6;for(let x=0;x<W;x++){const yy=y+Math.round(wave(x,W,[[48,1.2,p0],[24,.8,p0*2]]));if(((x+y*7)%61)<46){wset(ground,x,yy,rl);if((x%3)!==0)wset(ground,x,yy+1,rd)}}}
    for(let x=0;x<W;x++){wset(ground,x,TM,mix(G[3],DARK,.15));if((x*5)%3)wset(ground,x,TM+1,mix(G[3],DARK,.06))}
    const P0=rgb(T.path),pl=mix(P0,"#ffffff",.3),pd=mix(P0,DARK,.1),ed=mix(G[3],DARK,.3),pb=mix(G[3],DARK,.12);
    const pc=x=>PY-1+Math.round(wave(x,W,[[2,2,ph[0]],[5,1,ph[1]]])),phw=x=>6+Math.round(wave(x,W,[[3,1.2,ph[2]]]));
    for(let x=0;x<W;x++){const c=pc(x),h=phw(x);for(let y=c-h-2;y<=c+h+2;y++){const e=Math.abs(y-c);if(e>h+1){if((x+y)%2===0)wset(ground,x,y,pb)}else if(e>h){wset(ground,x,y,ed)}else if(e===h){if((x+y)%2===0)wset(ground,x,y,P0)}else wset(ground,x,y,P0)}}
    for(let i=0;i<300;i++){const x=r()*W|0,c=pc(x),h=phw(x)-1,y=c-h+(r()*h*2|0);wset(ground,x,y,r()<.5?pl:pd)}
    for(let x=0;x<W;x+=9){const c=pc(x)-2+((x/9|0)%5);wset(ground,x,c,pb);wset(ground,x+1,c,pb)}
    const items=[];const put=(cnt,mk,y0,y1)=>{for(let i=0;i<cnt;i++){const sp=mk(),x=r()*W|0,y=(y0+r()*(y1-y0))|0;items.push([sp,x,y-sp.h]);if(sp.c)meta.glow.push({x:x+5,y:y-sp.h+3,c:sp.c,ph:r()*6})}};
    put(6,()=>deco.bcoral(r,REC.coral[r()*4|0]),TM+14,PY-9);put(5,()=>deco.brain(r,REC.coral[r()*4|0]),TM+8,PY-9);put(3,()=>deco.seafan(r),TM+14,PY-9);put(3,()=>deco.sponge(r),TM+16,PY-9);put(5,()=>deco.anemone(r),TM+8,PY-9);put(4,()=>prop.rock(r,REC.rock),TM+8,PY-9);put(3,()=>deco.clam(r),TM+8,PY-9);
    put(5,()=>deco.starfish(r),PY+12,TM+GH-6);put(6,()=>deco.shell(r),PY+12,TM+GH-6);put(3,()=>deco.urchin(r),PY+12,TM+GH-6);put(4,()=>deco.bcoral(r,REC.coral[r()*4|0]),PY+20,TM+GH-6);put(3,()=>deco.anemone(r),PY+12,TM+GH-6);put(2,()=>deco.clam(r),PY+14,TM+GH-6);put(3,()=>prop.rock(r,REC.rock),PY+12,TM+GH-6);
    const sc=mix(G[3],DARK,.15);
    items.sort((a,b)=>a[2]+a[0].h-b[2]-b[0].h).forEach(([sp,x,y])=>{for(let i=1;i<sp.w-1;i++){wset(ground,x+i,y+sp.h-1,sc);if(i>1&&i<sp.w-2)wset(ground,x+i,y+sp.h,sc)}wblit(ground,sp,x,y)});
    /* sources de bulles posées sur le sable */
    for(let i=0;i<5;i++)meta.vents.push({x:r()*W|0,y:TM+8+(r()*(PY-TM-18)|0),ph:r()});
    const isS=c=>c===G[0]||c===G[1]||c===G[2]||c===G[3]||c===rl||c===rd;
    const tufts=[];for(let k=0;tufts.length<60&&k<5000;k++){const x=r()*(W-2)|0,y=PY+12+(r()*16|0),h=6+(r()*9|0),w=r()<.3?2:1;let ok=true;for(let j=-1;j<=h+1&&ok;j++)for(let q=-1;q<=w;q++)if(!isS(ground.get(x+q,y-j))){ok=false;break}
      if(ok)tufts.push({x,y,h,c:rgb(r()<.5?"#3fa880":"#5ab878"),ph:r()*6,w,f:null})}
    const low=recifsLow(T,G,r,W);
    return{far:far.cvs(),mid:mid.cvs(),wall:wall.cvs(),ground:ground.cvs(),low,gW:W,meta,tufts,clouds:[],G,fl,under:1,dark:1,rayC:"200,240,255",fish:1,flyC:["#d8f8ff","#b8f0e8"],motes:1,dayFlies:6,nightFlies:14,nightC:"120,240,255"};
  };
  function recifsLow(T,G,r,W){const LH=200,s=new Spr(W,LH);for(let i=0;i<W*LH;i++)s.p[i]=G[0];
    for(let i=0;i<180;i++){const rx=8+r()*26,ry=2+r()*6,cx=r()*W,cy=ry+1+r()*(LH-2*ry-2),c=G[1+(i%3)];ellipse(cx,cy,rx,ry,(x,y,d)=>{if(d<.6||(x+y)%2===0)wset(s,x,y,c)})}
    const rl=mix(G[1],"#ffffff",.3),rd=mix(G[0],G[3],.6);
    for(let y=3;y<LH-3;y+=6+(y%4)){const p0=r()*6;for(let x=0;x<W;x++){const yy=y+Math.round(wave(x,W,[[48,1.2,p0],[24,.8,p0*2]]));if(yy>0&&yy<LH-1&&((x+y*7)%61)<46){wset(s,x,yy,rl);if((x%3)!==0)wset(s,x,yy+1,rd)}}}
    const items=[],put=(n,mk)=>{for(let i=0;i<n;i++){const sp=mk();items.push([sp,r()*W|0,2+(r()*(LH-sp.h-5)|0)])}};
    put(12,()=>deco.bcoral(r,REC.coral[r()*4|0]));put(10,()=>deco.brain(r,REC.coral[r()*4|0]));put(6,()=>deco.seafan(r));put(5,()=>deco.sponge(r));put(10,()=>deco.starfish(r));put(14,()=>deco.shell(r));put(6,()=>deco.urchin(r));put(10,()=>deco.anemone(r));put(8,()=>prop.rock(r,REC.rock));
    const sc=mix(G[3],DARK,.15);items.sort((a,b)=>a[2]+a[0].h-b[2]-b[0].h).forEach(([sp,x,y])=>{for(let i=1;i<sp.w-1;i++)wset(s,x+i,y+sp.h-1,sc);wblit(s,sp,x,y)});
    return s.cvs()}

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

  /* ---------- État ---------- */
  let cv=null,ctx=null,wc=null,wx=null,P=4,W=0,H=0,FY=0,GT=0,CT=0,zid=null,L=null,ro=null,lastT=0,skyKey="",skyCv=null;
  let cam=0,camFrom=0,camTo=0,walkT0=0,walkMs=0;
  let birds=[],flies=[],shadows=[],puffs=[],tumbles=[],gusts=[],flakes=[],gulls=[],bolt=null,schools=[],jellies=[],plume=[],bombs=[],erupt=4,bossOn=false,lbT=0;
  let lc=null,lx=null,lw=null,lwx=null,LT=0,LHt=0,lowSh=[];   /* prairie du dessous : canvas, contexte, hauteur en pixels logiques */
  const drops=[];

  function resize(){const a=$("arena");if(!a||!cv)return;const w=a.clientWidth,h=a.clientHeight;if(!w||!h)return;
    P=w<640?3:4;W=Math.ceil(w/P);H=Math.ceil(h/P);cv.width=W;cv.height=H;cv.style.width=W*P+"px";cv.style.height=H*P+"px";wc.width=W;wc.height=H;
    const feet=P===4?Math.min(104,Math.round(h*.21)):78;FY=H-Math.round(feet/P);GT=FY-(PY-TM);a.style.setProperty("--feet",(H-FY)*P+"px");a.style.setProperty("--px",P);skyKey="";
    /* CT : bas de l'en-tête quand il recouvre le bandeau (la voûte du bois commence juste dessous) */
    const hd=document.querySelector("header.top");CT=hd?Math.max(0,Math.round((hd.getBoundingClientRect().bottom-a.getBoundingClientRect().top)/P)):0}

  /* ---------- Ciel selon l'heure réelle (mêmes plages que VIE.sky) ---------- */
  const SKY={day:["#5aa8ec","#cfeefc"],dawn:["#6a78c8","#ffc9a0"],dusk:["#3c3a88","#ff9e78"],night:["#0b0f2e","#283070"],cave:["#100e18","#2a2538"]};
  const TINT={day:null,dawn:"rgba(255,150,90,.14)",dusk:"rgba(120,50,100,.24)",night:"rgba(16,22,70,.52)",cave:null};
  function phase(){const d=new Date(),h=d.getHours()+d.getMinutes()/60;return h>=21||h<5.5?"night":h<8?"dawn":h>=18?"dusk":"day"}
  function skyCanvas(ph){const k=ph+W+"x"+H+(bossOn?"b":"")+(L&&L.storm?"s":"")+(L&&L.under?"u":"")+(L&&L.sky?"v":"");if(k===skyKey)return skyCv;skyKey=k;const c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");
    let[t,b]=SKY[ph];if(L&&L.sky&&L.sky[ph])[t,b]=L.sky[ph];if(L&&L.under){[t,b]=ph==="night"?["#0c3456","#061a30"]:ph==="day"?["#6ad0ee","#1a5a98"]:["#4a9ac8","#123e6e"]}if(L&&L.storm){t=mix(t,"#4a5268",.55);b=mix(b,"#9aa6b8",.5)}if(bossOn){t=mix(t,"#3a0a28",.55);b=mix(b,"#8a3048",.5)}const n=14,hz=Math.max(8,GT-8);
    for(let i=0;i<n;i++){const y0=Math.round(hz*i/n),y1=Math.round(hz*(i+1)/n),c0=css(mix(t,b,i/(n-1))),c1=css(mix(t,b,Math.min(1,(i+1)/(n-1))));x.fillStyle=c0;x.fillRect(0,y0,W,y1-y0);
      x.fillStyle=c1;for(let xx=0;xx<W;xx+=2)x.fillRect(xx+(y1%2),y1-1,1,1)}
    x.fillStyle=css(b);x.fillRect(0,hz,W,H-hz);return skyCv=c}

  /* ---------- Plans qui défilent ---------- */
  function band(g,img,f,y){if(!img)return;const w=img.width,o=((Math.round(cam*f)%w)+w)%w;for(let x=-o;x<W;x+=w)g.drawImage(img,x,y)}
  /* plan qui tremble dans la chaleur : chaque ligne décalée d'un pixel au plus */
  function heatBand(g,img,f,y,t){const w=img.width,h=img.height,o=((Math.round(cam*f)%w)+w)%w;for(let j=0;j<h;j++){const dx=Math.round(Math.sin(t/260+j*.9)*Math.sin(t/1700+j*.15)*1.2);for(let x=-o-w;x<W+w;x+=w)g.drawImage(img,0,j,w,1,x+dx,y+j,w,1)}}
  function px(g,x,y,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),1,1)}

  /* ---------- Vie du décor ---------- */
  function spawnBird(x){const bc=L&&L.birdC;birds.push({x,y:FY-R(10,30),st:"sol",t:R(0,3000),vx:0,vy:0,c:bc?bc[Math.random()*bc.length|0]:Math.random()<.5?"#7a5a40":"#5a6a7a"})}
  function updLife(dt,t,ph){
    /* oiseaux posés devant ; ils s'envolent quand l'équipe approche */
    const stageR=(W*P/2+80)/P;while(!L.cave&&!L.under&&!L.volcano&&!L.astral&&birds.filter(b=>b.st==="sol").length<3)spawnBird(cam+W+R(20,260));
    birds.forEach(b=>{const sx=b.x-cam;if(b.st==="sol"&&(sx<stageR||bossOn)){b.st="vol";b.vx=R(-14,30);b.vy=R(-34,-22)}if(b.st==="vol"){b.x+=b.vx*dt;b.y+=b.vy*dt;b.vy-=6*dt}});
    birds=birds.filter(b=>b.y>-10&&b.x-cam>-20);
    /* papillons le jour, lucioles la nuit */
    const want=ph==="night"?(L&&L.nightFlies!=null?L.nightFlies:12):bossOn?0:(L&&L.dayFlies!=null?L.dayFlies:5);while(flies.length<want)flies.push({x:R(0,W),y:R(GT+2,FY+14),vx:R(-6,6),vy:R(-3,3),t:R(0,9),c:ph==="night"?"#e8ff8a":(L&&L.flyC||["#ffd36a","#ff9ac8","#bfe3ff","#fff6d8"])[Math.random()*(L&&L.flyC?L.flyC.length:4)|0],n:ph==="night"});
    if(flies.length>want)flies.length=want;flies.forEach(f=>{if(f.n!==(ph==="night")){f.n=ph==="night";f.c=f.n?"#e8ff8a":(L&&L.flyC?L.flyC[0]:"#ffd36a")}f.t+=dt;f.vx+=R(-14,14)*dt;f.vy+=R(-10,10)*dt;f.vx=Math.max(-9,Math.min(9,f.vx));f.vy=Math.max(-6,Math.min(6,f.vy));
      f.x+=f.vx*dt;f.y+=f.vy*dt;if(f.y<GT-6)f.vy+=4*dt;if(f.y>FY+16)f.vy-=4*dt;if(f.x<-4)f.x+=W+8;if(f.x>W+4)f.x-=W+8});
    /* ombres des nuages sur la prairie */
    while(shadows.length<3)shadows.push({x:R(0,1000),y:R(GT+10,H-10),rx:R(26,46),ry:R(4,6),v:R(2,4)});
    shadows.forEach(s=>s.x-=s.v*dt);
    /* fumée des cheminées du village */
    if(L&&Math.random()<dt*1.4){const h=L.meta.houses[Math.random()*L.meta.houses.length|0];if(h)puffs.push({h,t:0})}
    puffs.forEach(p=>p.t+=dt);puffs=puffs.filter(p=>p.t<2.6);
    /* boules d'herbe sèche poussées par le vent (posées sur le sol : elles défilent avec lui) */
    if(L&&L.tumble){if(tumbles.length<2&&Math.random()<dt*.25){const front=Math.random()<.5;tumbles.push({x:cam-14,y:front?PY+16+R(0,14):PY-12-R(0,10),vx:R(22,38),d:0})}
      tumbles.forEach(b=>{b.x+=b.vx*dt;b.d+=b.vx*dt});tumbles=tumbles.filter(b=>b.x-cam<W+20)}
    /* flocons sur deux profondeurs (k : vitesse de défilement et de chute) */
    if(L&&L.snow){while(flakes.length<70){const k=Math.random()<.6?.45:1;flakes.push({x:R(0,W+40),y:flakes.length<70&&!flakes.ready?R(-10,H):-4,k,ph:R(0,TAU),v:R(8,13)*k})}flakes.ready=1;
      flakes.forEach(f=>{f.y+=f.v*dt;f.ph+=dt*1.3;if(f.y>FY+24){f.y=-4;f.x=R(0,W+40)}})}
    /* mouettes qui planent contre le vent */
    if(L&&L.gulls){if(gulls.length<3&&Math.random()<dt*.3)gulls.push({x:W+10,y:R(CT+10,Math.max(CT+14,GT-22)),v:R(9,16),ph:R(0,TAU)});gulls.forEach(b=>{b.x-=b.v*dt;b.ph+=dt});gulls=gulls.filter(b=>b.x>-12)}
    /* éclairs au loin */
    if(L&&L.storm){if(!bolt&&Math.random()<dt/9){const x0=R(W*.1,W*.9),pts=[[x0,CT+4]];let x=x0,y=CT+4;const yb=GT-L.mid.height+2+L.mid.height-16;while(y<yb){y+=R(3,7);x+=R(-5,5);pts.push([x,Math.min(y,yb)])}bolt={t:0,pts,br:pts.length>4?[pts[2|0],R(-1,1)]:null}}
      if(bolt){bolt.t+=dt;if(bolt.t>.5)bolt=null}}
    /* bancs de poissons et méduses (pleine eau, défilement 0,6) */
    if(L&&L.fish){if(schools.length<3&&Math.random()<dt*.35){const d=Math.random()<.5?1:-1,n=4+(Math.random()*7|0),pal=[["#ffd84a","#f0a020"],["#ff8a5a","#ffffff"],["#8ae0ff","#3a8ab8"],["#ff8ac8","#b84a8a"]][Math.random()*4|0];
        schools.push({x:cam*.6+(d>0?-30:W+30),y:R(CT+14,GT+10),d,v:R(10,20),n,pal,ph:R(0,TAU),f:Array.from({length:n},()=>[R(-10,10),R(-5,5)])})}
      schools.forEach(s=>{s.x+=s.d*s.v*dt;s.ph+=dt});schools=schools.filter(s=>{const sx=s.x-cam*.6;return sx>-60&&sx<W+60});
      if(jellies.length<2&&Math.random()<dt*.08)jellies.push({x:cam*.6+R(0,W),y:FY+10,v:R(3,6),ph:R(0,TAU),c:Math.random()<.5?"255,170,220":"190,170,255"});jellies.forEach(j=>{j.ph+=dt;j.y-=j.v*dt*(.5+.5*Math.max(0,Math.sin(j.ph*2)))});jellies=jellies.filter(j=>j.y>CT-10)}
    /* panache du volcan et éruptions (coordonnées du plan lointain) */
    if(L&&L.volcano&&L.meta.crater){if(Math.random()<dt*6)plume.push({dx:R(-2,2),dy:0,vx:R(.5,2.5),vy:-R(3,6),t:0,life:R(6,10)});plume.forEach(p=>{p.t+=dt;p.dx+=p.vx*dt;p.dy+=p.vy*dt;p.vy*=.995});plume=plume.filter(p=>p.t<p.life);
      erupt-=dt;if(erupt<=0){erupt=R(9,15);for(let i=0;i<14;i++)bombs.push({dx:0,dy:0,vx:R(-14,14),vy:-R(16,30),t:0});for(let i=0;i<10;i++)plume.push({dx:R(-3,3),dy:0,vx:R(-1,3),vy:-R(8,14),t:0,life:R(4,7),big:1})}
      bombs.forEach(b=>{b.t+=dt;b.dx+=b.vx*dt;b.dy+=b.vy*dt;b.vy+=22*dt});bombs=bombs.filter(b=>b.dy<20)}
    /* rafales : traînées de sable au ras du sol */
    if(L&&L.wind){if(gusts.length<(L.storm?9:6)&&Math.random()<dt*2)gusts.push({x:R(-40,W),y:L.storm&&Math.random()<.5?R(CT+8,GT-10):R(GT+4,FY+16),l:R(6,18),v:R(60,110),t:0});gusts.forEach(s=>{s.x+=s.v*dt;s.t+=dt});gusts=gusts.filter(s=>s.t<1.4&&s.x<W+30)}}
  function drawLife(g,t,ph){
    /* ombres des nuages : sur le sol, elles suivent le défilement */
    if(ph!=="night"&&!L.dark)shadows.forEach(s=>{const o=((s.x-cam)%1000+1000)%1000-120;g.fillStyle="rgba(20,40,30,.13)";for(let y=-s.ry;y<=s.ry;y++){const w=Math.round(s.rx*Math.sqrt(1-(y/s.ry)**2));g.fillRect(Math.round(o-w),Math.round(s.y+y),w*2,1)}});
    /* reflets sur les mares */
    const gy=GT-TM;L.meta.ponds.forEach(p=>{const w=L.gW,o=((Math.round(cam)%w)+w)%w;for(let k=-1;k<=Math.ceil(W/w);k++){const cx=p.x+k*w-o;if(cx<-40||cx>W+40)continue;
      for(let i=0;i<4;i++){const s=Math.floor(t/520)+i*13,a=Math.sin(s*12.9898+p.x)*43758.5,fr=a-Math.floor(a),b=Math.sin(s*78.233+p.y)*12345.6,fy=b-Math.floor(b);
        g.fillStyle="rgba(230,245,255,.8)";g.fillRect(Math.round(cx+(fr-.5)*p.rx*1.3),Math.round(gy+p.y+(fy-.5)*p.ry*1.1),2+(i%2),1)}}});
    /* bulles qui montent et éclatent à la surface (glouglou) */
    if(L.bubbles)L.meta.ponds.forEach((p,i)=>{const w=L.gW,o=((Math.round(cam)%w)+w)%w,per=1700+(i%5)*430,cy=Math.floor(t/per),k=(t%per)/per;if(k>.42)return;
      const a=Math.sin(cy*12.9898+i*7.1)*43758.5,fr=a-Math.floor(a),b=Math.sin(cy*78.233+i*3.3)*12345.6,fy=b-Math.floor(b);
      for(let m=-1;m<=Math.ceil(W/w);m++){const x=Math.round(p.x+m*w-o+(fr-.5)*p.rx*1.2),y=Math.round(gy+p.y+(fy-.5)*p.ry);if(x<-4||x>W+4)continue;
        g.fillStyle="rgba(220,245,235,.85)";if(k<.3){const s=k<.1?1:2;g.fillRect(x,y-s+1,s,s);if(s>1){g.fillStyle="rgba(255,255,255,.9)";g.fillRect(x,y-1,1,1)}}else{g.fillRect(x-2,y,1,1);g.fillRect(x+2,y,1,1);g.fillRect(x,y-1,1,1);g.fillRect(x,y+1,1,1)}}});
    /* boules d'herbe qui roulent et rebondissent */
    if(L.tumble){const F=tumbleF();tumbles.forEach(b=>{const x=Math.round(b.x-cam)-5,y=Math.round(gy+b.y-10-Math.abs(Math.sin(b.d/7))*4);g.fillStyle="rgba(120,80,30,.22)";g.fillRect(x+2,Math.round(gy+b.y-1),7,1);g.drawImage(F[Math.floor(b.d/3)%4],x,y)})}
    if(L.wind)gusts.forEach(s=>{const a=Math.sin(s.t/1.4*Math.PI)*.55;g.fillStyle=`rgba(${L.windC||"255,240,200"},${a.toFixed(3)})`;g.fillRect(Math.round(s.x),Math.round(s.y),Math.round(s.l),1);g.fillRect(Math.round(s.x+s.l*.6),Math.round(s.y)-1,Math.round(s.l*.4),1)});
    /* oiseaux */
    birds.forEach(b=>{const x=Math.round(b.x-cam),y=Math.round(b.y);if(b.st==="sol"){const peck=Math.floor((t+b.t)/420)%5===0;g.fillStyle=b.c;g.fillRect(x,y,3,2);g.fillRect(x+(peck?3:2),y-(peck?0:1),2,peck?1:2);g.fillStyle="#f0a03c";g.fillRect(x+(peck?5:4),y+(peck?1:0),1,1);g.fillStyle="#1c1020";g.fillRect(x+3,y-1+(peck?1:0),1,1)}
      else{const up=Math.floor(t/90)%2;g.fillStyle=b.c;g.fillRect(x,y,3,2);g.fillRect(x-1,y-(up?2:0),2,1);g.fillRect(x+2,y-(up?2:0),2,1)}});
    /* papillons et lucioles */
    flies.forEach(f=>{const x=Math.round(f.x),y=Math.round(f.y);if(f.n){const a=.4+.6*Math.abs(Math.sin(f.t*2.2)),nc=L.nightC||"232,255,138";g.fillStyle=`rgba(${nc},${a*.35})`;g.fillRect(x-1,y-1,3,3);g.fillStyle=`rgba(${L.nightC||"250,255,200"},${a})`;g.fillRect(x,y,1,1)}
      else if(L.drag){const fl=Math.floor(f.t*14)%2;g.fillStyle=f.c;g.fillRect(x-2,y,4,1);g.fillStyle="#1c3040";g.fillRect(x+2,y,1,1);g.fillStyle=`rgba(230,245,255,${fl?.75:.4})`;g.fillRect(x-1,y-1-fl,1,1);g.fillRect(x+1,y-1-fl,1,1);g.fillRect(x-1,y+1+fl,1,1);g.fillRect(x+1,y+1+fl,1,1)}
      else if(L.motes){const a=.35+.45*Math.abs(Math.sin(f.t*1.3));g.fillStyle=`rgba(255,250,210,${a*.3})`;g.fillRect(x-1,y,3,1);g.fillRect(x,y-1,1,3);g.fillStyle=f.c;g.globalAlpha=a;g.fillRect(x,y,1,1);g.globalAlpha=1}
      else{const open=Math.floor(f.t*7)%2;g.fillStyle=f.c;if(open){g.fillRect(x-2,y-1,2,2);g.fillRect(x+1,y-1,2,2)}else{g.fillRect(x-1,y-1,1,2);g.fillRect(x+1,y-1,1,2)}g.fillStyle="#3a2a22";g.fillRect(x,y-1,1,2)}})}

  /* aurore boréale : rideaux verts et violets qui ondulent, colonne par colonne */
  function aurora(g,t,moving){const tt=moving?t:0,top=Math.max(CT+14,GT-60);for(let x=0;x<W;x+=1){const u=(x+cam*.03)/W;
      const y0=top-8+Math.round(9*Math.sin(u*7+tt/2600)+5*Math.sin(u*17-tt/1900)),len=18+Math.round(10*Math.sin(u*5+tt/3100)),a=.24+.12*Math.sin(u*23+tt/700);if(a<=0)continue;
      for(let j=0;j<len;j++){const f=j/len,c=f<.35?"150,120,255":"110,255,170";g.fillStyle=`rgba(${c},${(a*(f<.15?f/.15:1-f*.8)).toFixed(3)})`;g.fillRect(x,y0+j,1,1)}}}
  /* éclair : ligne brisée jaune et blanche, du haut du ciel jusqu'à l'horizon */
  function drawBolt(g){const p=bolt.pts;for(let i=1;i<p.length;i++){const[a,b]=[p[i-1],p[i]],n=Math.max(1,Math.round(Math.abs(b[1]-a[1])));for(let k=0;k<=n;k++){const x=Math.round(a[0]+(b[0]-a[0])*k/n),y=Math.round(a[1]+(b[1]-a[1])*k/n);g.fillStyle="rgba(255,226,122,.45)";g.fillRect(x-1,y,3,1);g.fillStyle="#fffbe8";g.fillRect(x,y,1,1)}}}
  /* faisceau du phare : il balaie la mer la nuit et par temps sombre */
  function beam(g,t,ph,MY){const w=L.mid.width,o=((Math.round(cam*.22)%w)+w)%w,a0=ph==="night"?.22:ph==="day"?.06:.14,ang=(calm()?0:t/1400)%TAU,c=Math.cos(ang),side=c>0?1:-1,len=Math.round(70*Math.abs(c))+6;
    for(let k=-1;k<=Math.ceil(W/w);k++){const x=L.meta.lh.x+k*w-o,y=MY+L.meta.lh.y;if(x<-90||x>W+90)continue;g.fillStyle="rgba(255,240,170,.9)";g.fillRect(x-1,y-1,3,2);
      for(let i=2;i<len;i++){const hw=Math.round(i*.12),a=a0*(1-i/len);g.fillStyle=`rgba(255,240,170,${a.toFixed(3)})`;g.fillRect(x+side*i,y-hw,1,hw*2+1)}}}
  /* cascade : traits clairs qui descendent, écume au pied (attachée au plan moyen) */
  function falls(g,t,MY){const w=L.mid.width,o=((Math.round(cam*.22)%w)+w)%w,tt=calm()?0:t;L.meta.falls.forEach(f=>{for(let k=-1;k<=Math.ceil(W/w);k++){const x0=f.x+k*w-o;if(x0<-20||x0>W+20)continue;
      for(let i=0;i<f.w;i++){const sp=.045+(i%3)*.012,off=Math.floor(tt*sp+i*7)%9;for(let y=off;y<f.h;y+=9){g.fillStyle="rgba(240,255,250,.75)";g.fillRect(x0+i,MY+f.y+y,1,3)}}
      for(let i=-4;i<f.w+4;i++){const b=Math.sin(tt/180+i*1.7)>.2;if(b){g.fillStyle="rgba(255,255,255,.7)";g.fillRect(x0+i,MY+f.y+f.h+1-(i%2),1,1)}}}})}
  /* surface vue d'en dessous : deux lignes de lumière qui ondulent */
  function surface(g,t,ph,moving){const tt=moving?t:0,y0=CT+1,a=ph==="night"?.25:.55;for(let x=0;x<W;x++){const u=x+cam*.7,y1=y0+Math.round(Math.sin(u/9+tt/600)*1.4+Math.sin(u/23-tt/900)),y2=y0+4+Math.round(Math.sin(u/13-tt/700)*1.2);
      g.fillStyle=`rgba(220,250,255,${a})`;g.fillRect(x,y1,1,1);if((x+Math.floor(tt/200))%3)g.fillRect(x,y2,1,1);if(Math.sin(u/5+tt/400)>.85){g.fillStyle=`rgba(255,255,255,${a})`;g.fillRect(x,y1-1,1,1)}}}
  /* varech : longues lanières ancrées sur les rochers du premier rang, qui ondulent */
  function kelp(g,t,moving){const w=L.wall.width,o=((Math.round(cam*.5)%w)+w)%w,y0=GT-L.wall.height+3,tt=moving?t:0;L.meta.kelp.forEach(k=>{for(let m=-1;m<=Math.ceil(W/w);m++){const bx=k.x+m*w-o;if(bx<-20||bx>W+20)continue;
      for(let j=0;j<k.h;j++){const x=Math.round(bx+Math.sin(tt/900+j*.12+k.ph)*j*.09),y=y0+k.y-j;g.fillStyle=j%7===3?REC.kelpL:REC.kelp;g.fillRect(x,y,2,1);if(j%6===2){g.fillStyle=REC.kelpL;g.fillRect(x+2,y,2,1);g.fillRect(x+3,y-1,1,1)}if(j%6===5){g.fillStyle=REC.kelp;g.fillRect(x-2,y,2,1)}}}})}
  /* vie marine : bulles des sources, bancs de poissons, méduses */
  function seaLife(g,t,moving){const gw=L.gW,o=((Math.round(cam)%gw)+gw)%gw,gy=GT-TM,tt=moving?t:0;
    L.meta.vents.forEach(v=>{for(let m=-1;m<=Math.ceil(W/gw);m++){const vx=v.x+m*gw-o;if(vx<-6||vx>W+6)continue;for(let k=0;k<6;k++){const p=((tt/2600+k/6+v.ph)%1+1)%1,y=Math.round(gy+v.y-p*(gy+v.y-CT-6)),x=Math.round(vx+Math.sin(p*14+k)*2),s=p>.6?2:1;
        g.fillStyle="rgba(220,250,255,.7)";g.fillRect(x,y,s,s);if(s>1){g.fillStyle="rgba(255,255,255,.9)";g.fillRect(x,y,1,1)}}}});
    schools.forEach(s=>{const sx=s.x-cam*.6;s.f.forEach(([fx,fy],i)=>{const x=Math.round(sx+fx),y=Math.round(s.y+fy+Math.sin(s.ph*2+i)*1.2);g.fillStyle=s.pal[0];g.fillRect(x,y,3,2);g.fillStyle=s.pal[1];g.fillRect(x-s.d,y+(Math.floor(s.ph*8+i)%2),1,1);g.fillStyle="#1c1020";g.fillRect(x+(s.d>0?2:0),y,1,1)})});
    jellies.forEach(j=>{const x=Math.round(j.x-cam*.6),y=Math.round(j.y),p=Math.sin(j.ph*2)>0?1:0;g.fillStyle=`rgba(${j.c},.75)`;g.fillRect(x-2-p,y,5+p*2,2);g.fillRect(x-1,y-1,3,1);g.fillStyle=`rgba(${j.c},.45)`;for(let k=-2;k<=2;k+=2)for(let q=0;q<4+p;q++)g.fillRect(x+k+((q+Math.floor(j.ph*3))%2),y+2+q,1,1)})}
  /* panache de fumée et bombes de lave au-dessus du cratère */
  function volcano(g,t){const w=L.far.width,o=((Math.round(cam*.08)%w)+w)%w,c=L.meta.crater,y0=GT-L.far.height-4+c.y;for(let k=-1;k<=Math.ceil(W/w);k++){const x0=c.x+k*w-o;if(x0<-80||x0>W+80)continue;
      plume.forEach(p=>{const f=p.t/p.life,rr=Math.round(1+f*(p.big?7:5)),a=(1-f)*(p.big?.5:.35),x=Math.round(x0+p.dx),y=Math.round(y0+p.dy),gr=Math.round(70+f*60);g.fillStyle=`rgba(${gr},${gr-10},${gr-12},${a.toFixed(3)})`;
        for(let dy=-rr;dy<=rr;dy++){const hw=Math.round(Math.sqrt(rr*rr-dy*dy));g.fillRect(x-hw,y+dy,hw*2+1,1)}});
      bombs.forEach(b=>{const x=Math.round(x0+b.dx),y=Math.round(y0+b.dy);g.fillStyle="#ffd84a";g.fillRect(x,y,1,1);g.fillStyle="rgba(255,122,44,.8)";g.fillRect(x-1,y,1,1);g.fillRect(x,y+1,1,1)})}}
  /* lave vivante : fissures qui pulsent, bulles qui crèvent dans les mares, fumée des fumerolles */
  function lavaLife(g,t,moving){const gw=L.gW,o=((Math.round(cam)%gw)+gw)%gw,gy=GT-TM,tt=moving?t:0;
    for(let i=0;i<L.cracks.length;i+=2){const[cx,cy]=L.cracks[i],a=.25+.25*Math.sin(tt/500+cx*.05);for(let m=-1;m<=Math.ceil(W/gw);m++){const x=cx+m*gw-o;if(x<-2||x>W+2)continue;g.fillStyle=`rgba(255,180,60,${a.toFixed(3)})`;g.fillRect(x,gy+cy,1,1)}}
    L.meta.lava.forEach((p,i)=>{const per=900+(i%3)*300,cy=Math.floor(tt/per),k=(tt%per)/per,a=Math.sin(cy*12.9898+i*7.1)*43758.5,fr=a-Math.floor(a),b=Math.sin(cy*78.233+i)*12345.6,fy=b-Math.floor(b);
      for(let m=-1;m<=Math.ceil(W/gw);m++){const x=Math.round(p.x+m*gw-o+(fr-.5)*p.rx*1.2),y=Math.round(gy+p.y+(fy-.5)*p.ry);if(x<-4||x>W+4)continue;if(k<.5){const s=k<.2?1:2;g.fillStyle="#ffe88a";g.fillRect(x,y-s+1,s,s)}else if(k<.65){g.fillStyle="rgba(255,200,80,.8)";g.fillRect(x-2,y,1,1);g.fillRect(x+2,y,1,1);g.fillRect(x,y-2,1,1)}}});
    L.meta.fum.forEach(f=>{for(let m=-1;m<=Math.ceil(W/gw);m++){const fx=f.x+m*gw-o;if(fx<-10||fx>W+10)continue;for(let k=0;k<5;k++){const p=((tt/3000+k/5+f.ph)%1+1)%1,y=Math.round(gy+f.y-2-p*26),x=Math.round(fx+Math.sin(p*6+k)*2+p*4),rr=1+Math.round(p*2);g.fillStyle=`rgba(200,190,180,${(.4*(1-p)).toFixed(3)})`;g.fillRect(x-rr,y,rr*2+1,rr)}}})}
  /* ciel astral : étoiles visibles même le jour, croissant de lune, constellations la nuit, étoiles filantes */
  const CONST=[[[.12,.3],[.16,.22],[.21,.26],[.25,.18],[.3,.24]],[[.55,.15],[.6,.28],[.66,.2],[.62,.1],[.55,.15]],[[.78,.35],[.84,.25],[.9,.3],[.86,.42]]];
  function starsky(g,t,ph,moving){const top=CT+2,hz=Math.max(top+10,GT-24),a0=ph==="night"?1:ph==="day"?.35:.65,rs=rng(11);
    for(let i=0;i<70;i++){const x=rs()*W|0,y=top+(rs()*(hz-top)|0),tw=.5+.5*Math.sin(t/(500+i*13)+i);g.fillStyle=`rgba(255,250,240,${(a0*(.3+.6*tw)).toFixed(3)})`;g.fillRect(x,y,1,1)}
    if(ph!=="day")CONST.forEach((c,k)=>{const pts=c.map(([u,v])=>[Math.round(u*W),Math.round(top+v*(hz-top))]),pulse=.25+.2*Math.sin(t/1500+k);for(let i=1;i<pts.length;i++){const[a,b]=[pts[i-1],pts[i]],n=Math.max(Math.abs(b[0]-a[0]),Math.abs(b[1]-a[1]));for(let j=0;j<=n;j+=2){g.fillStyle=`rgba(200,190,255,${(pulse*a0).toFixed(3)})`;g.fillRect(Math.round(a[0]+(b[0]-a[0])*j/n),Math.round(a[1]+(b[1]-a[1])*j/n),1,1)}}
      pts.forEach(([x,y])=>{g.fillStyle=`rgba(255,240,200,${a0})`;g.fillRect(x,y,1,1);g.fillStyle=`rgba(255,240,200,${(a0*.4).toFixed(3)})`;g.fillRect(x-1,y,3,1);g.fillRect(x,y-1,1,3)})});
    /* croissant de lune */
    const mx=Math.round(W*.82),my=top+16,R2=9;for(let dy=-R2;dy<=R2;dy++)for(let dx=-R2;dx<=R2;dx++){const d1=dx*dx+dy*dy,d2=(dx-4)**2+(dy+2)**2;if(d1<=R2*R2&&d2>(R2-1)**2){g.fillStyle=d1>(R2-1.5)**2?"#e8dcb8":"#fff6d8";g.fillRect(mx+dx,my+dy,1,1)}}
    g.fillStyle="rgba(255,246,216,.12)";g.fillRect(mx-12,my-10,16,21);
    /* étoile filante */
    if(moving){const per=7000,k=(t%per)/per;if(k<.08){const s0=Math.floor(t/per),u=(Math.sin(s0*12.9)*.5+.5),x=Math.round(W*(.2+u*.6)-k*900),y=Math.round(top+8+k*300);for(let j=0;j<10;j++){g.fillStyle=`rgba(255,255,255,${(.9-j*.09).toFixed(2)})`;g.fillRect(x+j,y-Math.round(j/3),1,1)}}}}
  /* îles flottantes qui tanguent doucement */
  function isles(g,t,moving){const per=900,top=CT+8,bot=Math.max(top+12,GT-34);L.isles.forEach(i=>{const x=((Math.round(i.x-cam*.12)%per)+per)%per-60,y=Math.round(top+i.yf*(bot-top)+(moving?Math.sin(t/2200+i.ph)*2:0));if(x>-i.w&&x<W+10)g.drawImage(i.cv,x,y)})}
  /* éclats de cristal en suspens au-dessus des ruines du premier rang */
  function shards(g,t,moving){const w=L.wall.width,o=((Math.round(cam*.5)%w)+w)%w,y0=GT-L.wall.height+3;L.meta.shards.forEach(s=>{for(let m=-1;m<=Math.ceil(W/w);m++){const x=s.x+m*w-o;if(x<-6||x>W+6)continue;const y=y0+s.y+Math.round(moving?Math.sin(t/900+s.ph)*2:0);
      g.fillStyle=AST.cry;g.fillRect(x,y-2,1,5);g.fillRect(x-1,y-1,3,3);g.fillStyle=AST.cryL;g.fillRect(x,y-1,1,2);if(s.s>1){g.fillStyle=AST.cry;g.fillRect(x+3,y+2,1,3);g.fillStyle=AST.cryL;g.fillRect(x+3,y+2,1,1)}}})}
  /* brume du marais : bandes douces au ras de l'eau, qui dérivent lentement (pas de flou : des lignes de pixels) */
  const MIST=[[0,.55,.2,40],[1,.8,.15,30],[2,1,.12,44],[3,1.1,.1,34]];
  function mist(g,t,ph,moving){const col=ph==="night"?"170,190,230":ph==="day"?"235,245,240":"240,220,215",dr=moving?t*.004:0;
    MIST.forEach(([i,f,a0,len])=>{const y=Math.round(GT-6+i*9+(i>1?(FY-GT-24)*(i-1)*.5:0)),per=260+i*70,off=((cam*f+dr*(1+i*.3))%per+per)%per;
      for(let x0=-off;x0<W;x0+=per)for(let b=0;b<3;b++){const bx=Math.round(x0+b*per/3+i*31),bl=len*W/320+b*10;for(let j=-3;j<=3;j++){const wv=Math.round(bl*(1-Math.abs(j)*.2)),a=a0*(1-Math.abs(j)*.25);g.fillStyle=`rgba(${col},${a.toFixed(3)})`;g.fillRect(bx-wv,y+j,wv*2,1)}}})}
  /* rayons de lumière entre les arbres : ils défilent avec le premier rang (vitesse 0,5) */
  function rays(g,t,ph,moving){const w=L.wall.width,o=((Math.round(cam*.5)%w)+w)%w,y0=GT-L.wall.height+20,y1=FY+18,col=L.rayC||(ph==="day"?"255,244,190":"255,190,130"),k0=ph==="day"?1:.8;
    L.meta.rays.forEach(rv=>{for(let k=-1;k<=Math.ceil(W/w)+1;k++){const x0=rv.x+k*w-o;if(x0<-80||x0>W+20)continue;const a=k0*(.075+.03*Math.sin(t/2600+rv.ph)*(moving?1:0));
      for(let y=Math.max(0,y0);y<y1;y++){const f=(y-y0)/(y1-y0),x=Math.round(x0+(y-y0)*.42),ww=Math.round(rv.w*(.7+f*.9)),fade=f<.12?f/.12:f>.85?(1-f)/.15:1;g.fillStyle=`rgba(${col},${(a*fade).toFixed(3)})`;g.fillRect(x,y,ww,1);g.fillStyle=`rgba(${col},${(a*fade*.6).toFixed(3)})`;g.fillRect(x+2,y,ww-4,1)}}})}

  /* champignons de lune : halo qui respire, par-dessus la teinte de l'heure pour luire la nuit */
  function glow(g,t,ph){const k0=ph==="night"?1.6:ph==="cave"?1.1:ph==="day"?.25:.7;L.meta.glow.forEach(m=>{const f=m.f||1,img=f===1?L.ground:f===.5?L.wall:f===.08?L.far:L.mid,w=f===1?L.gW:img.width,o=((Math.round(cam*f)%w)+w)%w,gy=f===1?GT-TM:f===.5?GT-L.wall.height+3:f===.08?GT-L.far.height-4:GT-L.mid.height+2,sz=m.s||1;
    for(let k=-1;k<=Math.ceil(W/w);k++){const x=Math.round(m.x+k*w-o),y=gy+m.y;if(x<-12||x>W+12)continue;
      const a=k0*(m.fl?.8+.2*Math.sin(t/90+m.ph)*Math.sin(t/37+m.ph*2):.55+.45*Math.sin(t/900+m.ph));if(!m.cs)m.cs=css(m.c,1).replace(",1)","");
      if(sz>1)for(const[rr,al]of[[9*sz,.07],[6*sz,.09]]){g.fillStyle=m.cs+","+(a*al).toFixed(3)+")";const R2=Math.round(rr);for(let dy=-R2;dy<=R2;dy++){const hw=Math.round(Math.sqrt(R2*R2-dy*dy));g.fillRect(x-hw,y+dy,hw*2+1,1)}}
      g.fillStyle=m.cs+","+(a*.16).toFixed(3)+")";g.fillRect(x-4,y-2,9,5);g.fillRect(x-3,y-3,7,7);g.fillStyle=m.cs+","+(a*.28).toFixed(3)+")";g.fillRect(x-2,y-1,5,3)}})}

  /* ---------- Image ---------- */
  function draw(t,dt){if(!ctx||!L||!W)return;const ph=L.cave?"cave":phase(),moving=!calm();
    if(moving&&walkMs){const k=Math.min(1,(t-walkT0)/walkMs),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;cam=camFrom+(camTo-camFrom)*e;if(k>=1){walkMs=0;$("arena").classList.remove("walking")}}
    if(moving)updLife(dt,t,ph);
    ctx.drawImage(skyCanvas(ph),0,0);
    /* soleil ou lune et étoiles (rien sous terre) */
    if(L.cave){}
    else if(L.under)surface(ctx,t,ph,moving);
    else if(L.volcano){}
    else if(L.astral)starsky(ctx,t,ph,moving);
    else if(ph==="night"){const r=rng(5);for(let i=0;i<46;i++){const x=r()*W|0,y=r()*Math.max(10,GT-30)|0,tw=Math.sin(t/600+i*1.7)>.6;ctx.fillStyle=tw?"#ffffff":"rgba(210,225,255,.7)";ctx.fillRect(x,y,1,1)}
      const mx=Math.round(W*.8),my=24;ctx.fillStyle="#f6f0d6";ctx.fillRect(mx-3,my-4,7,9);ctx.fillRect(mx-4,my-3,9,7);ctx.fillStyle="#d8d0b0";ctx.fillRect(mx-1,my-1,2,2);ctx.fillRect(mx+2,my+1,1,1)}
    else{const sx=Math.round(W*(ph==="dawn"?.14:ph==="dusk"?.86:.8)),sy=ph==="day"?24:Math.max(24,GT-44);ctx.fillStyle="rgba(255,240,170,.25)";ctx.fillRect(sx-7,sy-5,15,11);ctx.fillRect(sx-5,sy-7,11,15);
      ctx.fillStyle=ph==="day"?"#fff4b0":"#ffcf8a";ctx.fillRect(sx-4,sy-3,9,7);ctx.fillRect(sx-3,sy-4,7,9)}
    if(L.aurora&&ph==="night")aurora(ctx,t,moving);
    /* nuages */
    ctx.globalAlpha=ph==="night"?.35:bossOn?.6:.95;L.clouds.forEach((c,i)=>{const per=W+140,x=(((i*per/4+t*(.0016+i*.0005)*(moving?1:0)+cam*.05)%per)+per)%per;ctx.drawImage(c,Math.round(W+40-x),18+((i*11)%Math.max(8,GT-70)))});ctx.globalAlpha=1;
    /* le paysage, teinté selon l'heure */
    const g=wx;g.clearRect(0,0,W,H);
    const MY=GT-L.mid.height+2;const ZAP=L.storm&&bolt&&!calm()&&(bolt.t<.08||(bolt.t>.16&&bolt.t<.24));if(L.heat&&ph==="day"&&moving)heatBand(g,L.far,.08,GT-L.far.height-4,t);else band(g,L.far,.08,GT-L.far.height-4);if(ZAP)drawBolt(g);if(L.volcano)volcano(g,t);if(L.isles)isles(g,t,moving);band(g,L.mid,.22,MY);if(L.meta.lh)beam(g,t,ph,MY);if(L.meta.falls)falls(g,t,MY);
    /* ailes des moulins */
    {const w=L.mid.width,o=((Math.round(cam*.22)%w)+w)%w,a=t*.0012*(moving?1:0);L.meta.mills.forEach(m=>{for(let k=-1;k<=Math.ceil(W/w);k++){const x=m.x+k*w-o,y=MY+m.y;if(x<-10||x>W+10)continue;
      for(let b=0;b<4;b++){const an=a+b*TAU/4;for(let r=1;r<=6;r++)px(g,x+Math.cos(an)*r,y+Math.sin(an)*r,r>2?"#f4ecd8":"#8a6a48")}}})}
    /* fumées */
    {const w=L.mid.width,o=((Math.round(cam*.22)%w)+w)%w;puffs.forEach(p=>{const x=p.h.x-o+(p.h.x-o<-10?w:0)+p.t*1.5,y=MY+p.h.y-p.t*4;if(x<0||x>W)return;g.fillStyle=`rgba(235,235,240,${.55*(1-p.t/2.6)})`;g.fillRect(Math.round(x),Math.round(y),1+(p.t>1?1:0),1+(p.t>1.4?1:0))})}
    if(L.gulls)gulls.forEach(b=>{const x=Math.round(b.x),y=Math.round(b.y+Math.sin(b.ph*1.6)*2),up=Math.sin(b.ph*5)>0;g.fillStyle="#f4f6fa";g.fillRect(x,y,1,1);g.fillRect(x-2,y-(up?1:0),2,1);g.fillRect(x+1,y-(up?1:0),2,1);g.fillStyle="#8a94a8";g.fillRect(x-3,y-(up?2:-1),1,1);g.fillRect(x+3,y-(up?2:-1),1,1)});
    band(g,L.wall,.5,GT-L.wall.height+3);if(L.meta.kelp)kelp(g,t,moving);if(L.meta.shards)shards(g,t,moving);
    band(g,L.ground,1,GT-TM);
    drawLife(g,t,ph);
    /* hautes herbes qui ondulent : elles défilent exactement avec le sol où elles sont plantées */
    {const gw=L.gW,off=((Math.round(cam)%gw)+gw)%gw,y0=GT-TM,base=tf=>y0+tf.y;L.tufts.forEach(tf=>{const b=base(tf);if(b>H-1)return;   /* entière dans le bandeau, jamais coupée par son bord */if(!tf.cs){tf.cs=css(tf.c);tf.ct=css(mix(tf.c,"#fff2c2",.25))}
      /* le pied reste fixe, seul le haut se balance */
      for(let x=tf.x-off;x<W+4;x+=gw){if(x<-4)continue;for(let j=0;j<tf.h;j++){const sw=moving?Math.round((Math.sin(t/700+tf.ph)*1.6+(L.lean?L.lean*(1+.6*Math.sin(t/1300+tf.ph*.3)):0))*j/tf.h):0;g.fillStyle=j===tf.h-1?tf.ct:tf.cs;g.fillRect(Math.round(x+sw),b-j,tf.w,1)}
        if(tf.f){const sw=moving?Math.round(Math.sin(t/700+tf.ph)*1.6+(L.lean?L.lean*(1+.6*Math.sin(t/1300+tf.ph*.3)):0)):0;g.fillStyle=tf.f;g.fillRect(Math.round(x+sw),b-tf.h,2,1)}}})}
    if(L.meta.rays.length&&ph!=="night")rays(g,t,ph,moving);
    if(L.mist)mist(g,t,ph,moving);
    if(L.fish)seaLife(g,t,moving);
    if(L.sparks)L.sparks.forEach(s=>{const v=Math.sin(t/700*s.sp+s.ph);if(v<.86)return;const w=L.gW,o=((Math.round(cam)%w)+w)%w,y=GT-TM+s.y;for(let x=s.x-o;x<W+2;x+=w){if(x<-2)continue;g.fillStyle="#ffffff";g.fillRect(x,y,1,1);if(v>.96){g.fillStyle="rgba(255,255,255,.7)";g.fillRect(x-1,y,3,1);g.fillRect(x,y-1,1,3)}}});
    if(L.snow)flakes.forEach(f=>{const per=W+40,x=((Math.round(f.x+Math.sin(f.ph)*2-cam*f.k*.6)%per)+per)%per-20,y=Math.round(f.y);g.fillStyle=L.flakeC?L.flakeC[f.k<1?0:1]:f.k<1?"rgba(240,248,255,.75)":"#ffffff";g.fillRect(x,y,1,1);if(f.k===1&&(Math.round(f.ph)%3===0))g.fillRect(x+1,y,1,1)});
    if(L.canopy)band(g,L.canopy,.7,CT-9);
    const TN=L.tint&&L.tint[ph]!==undefined?L.tint[ph]:TINT[ph];if(TN||bossOn||L.under){g.globalCompositeOperation="source-atop";if(L.under){g.fillStyle="rgba(30,110,180,.2)";g.fillRect(0,0,W,H)}if(TN){g.fillStyle=TN;g.fillRect(0,0,W,H)}if(bossOn){g.fillStyle="rgba(70,0,30,.28)";g.fillRect(0,0,W,H)}g.globalCompositeOperation="source-over"}
    if(L.meta.glow.length)glow(g,t,ph);
    if(L.volcano)lavaLife(g,t,moving);
    ctx.drawImage(wc,0,0);
    if(ZAP){ctx.fillStyle="rgba(235,240,255,.16)";ctx.fillRect(0,0,W,H)}
    drawLow(t,ph,moving,dt);
    if(ph==="night")flies.forEach(f=>{if(!f.n)return;const a=.4+.6*Math.abs(Math.sin(f.t*2.2));ctx.fillStyle=`rgba(${L.nightC||"250,255,200"},${a})`;ctx.fillRect(Math.round(f.x),Math.round(f.y),1,1)})}

  /* ---------- Prairie sous le bandeau ---------- */
  function lowResize(){if(!lc||!W)return;const ar=$("arena"),wr=$("app");if(!ar||!wr)return;const hb=Math.floor(ar.clientHeight/P);
    const top=ar.getBoundingClientRect().top+scrollY+hb*P,bottom=Math.max(wr.getBoundingClientRect().bottom+scrollY,innerHeight),h=Math.max(P,Math.ceil((bottom-top)/P));
    LT=hb;LHt=h;if(lc.width!==W||lc.height!==h){lc.width=W;lc.height=h;lw.width=W;lw.height=h}lc.style.top=top+"px";lc.style.width=W*P+"px";lc.style.height=h*P+"px"}
  function drawLow(t,ph,moving,dt){if(!lc||!L||!LHt)return;const g=lwx,ox=((Math.round(cam)%L.gW)+L.gW)%L.gW;g.clearRect(0,0,W,LHt);
    /* d'abord la fin de la bande du sol (sous le bord du bandeau), puis la prairie qui se répète */
    const y0=GT-TM-LT,gh=L.ground.height;for(let x=-ox;x<W;x+=L.gW)g.drawImage(L.ground,x,y0);
    for(let y=y0+gh;y<LHt;y+=L.low.height)for(let x=-ox;x<W;x+=L.gW)g.drawImage(L.low,x,y);
    /* ombres des nuages qui glissent aussi sur le bas */
    if(ph!=="night"&&!L.dark){while(lowSh.length<Math.ceil(LHt/90))lowSh.push({x:R(0,1000),y:R(4,LHt),rx:R(30,56),ry:R(5,8),v:R(2,4)});if(moving)lowSh.forEach(s=>s.x-=s.v*dt);
      g.fillStyle="rgba(20,40,30,.12)";lowSh.forEach(s=>{const o=((s.x-cam)%1000+1000)%1000-120;for(let y=-s.ry;y<=s.ry;y++){const w=Math.round(s.rx*Math.sqrt(1-(y/s.ry)**2));g.fillRect(Math.round(o-w),Math.round(s.y+y),w*2,1)}})}
    const TN=L.tint&&L.tint[ph]!==undefined?L.tint[ph]:TINT[ph];if(TN||bossOn||L.under){g.globalCompositeOperation="source-atop";if(L.under){g.fillStyle="rgba(30,110,180,.2)";g.fillRect(0,0,W,LHt)}if(TN){g.fillStyle=TN;g.fillRect(0,0,W,LHt)}if(bossOn){g.fillStyle="rgba(70,0,30,.28)";g.fillRect(0,0,W,LHt)}g.globalCompositeOperation="source-over"}
    lx.clearRect(0,0,W,LHt);lx.drawImage(lw,0,0)}

  /* ---------- Butin au sol ---------- */
  const A=()=>$("arena");
  function dropBox(){let b=$("gdrops");if(!b){b=document.createElement("div");b.id="gdrops";b.className="gdrops";A().insertBefore(b,$("mon"))}return b}
  function addDrop(html,kind,rare){if(!fx||calm()||!cv||!W)return false;const m=$("monBtn"),a=A();if(!m||!a)return false;const ar=a.getBoundingClientRect(),mr=m.getBoundingClientRect();
    if(drops.length>40)collect(drops[0]);
    const sx=(mr.left-ar.left+mr.width*R(.3,.7))/P,sy=(mr.top-ar.top+mr.height*R(.3,.6))/P,x=cam+sx+R(-10,24),y=FY+R(-3,5);
    const e=document.createElement("div");e.className="gdrop "+kind+(rare?" rare":"");e.innerHTML=kind==="coin"?'<span class="coin"></span>':html;dropBox().appendChild(e);
    const d={e,x,y,kind,t0:performance.now(),up:false};drops.push(d);place(d);
    const dx=(sx+cam-x)*P,dy=(sy-y)*P;e.firstElementChild&&e.firstElementChild.animate([{transform:`translate(${dx}px,${dy}px)`},{transform:`translate(${dx*.45}px,${dy-40-(rare?30:0)}px)`,offset:.45},{transform:"translate(0,0)",offset:.8},{transform:"translate(0,-6px)",offset:.9},{transform:"translate(0,0)"}],{duration:rare?760:560,easing:"ease-out"});
    return true}
  function place(d){d.e.style.left=Math.round((d.x-cam)*P)+"px";d.e.style.top=Math.round(d.y*P)+"px"}
  function collect(d){const i=drops.indexOf(d);if(i<0)return;drops.splice(i,1);const tgt=d.kind==="coin"?$("ecusTxt"):(document.querySelector('[data-a="tab"][data-t="inv"]')||$("ecusTxt"));
    const r=(d.e.firstElementChild||d.e).getBoundingClientRect(),b=tgt&&tgt.getBoundingClientRect();if(!b||!r.width){d.e.remove();return}
    const f=document.createElement("div");f.className="gdrop fly "+d.e.className.replace("gdrop","");f.innerHTML=d.e.innerHTML;f.style.left=r.left+"px";f.style.top=r.top+"px";document.body.appendChild(f);d.e.remove();
    const dx=b.left+b.width/2-r.left-r.width/2,dy=b.top+b.height/2-r.top-r.height/2;
    f.animate([{transform:"translate(0,0) scale(1)"},{transform:`translate(${dx*.3}px,${dy*.3-50}px) scale(1.15)`,offset:.35},{transform:`translate(${dx}px,${dy}px) scale(.55)`,opacity:.7}],{duration:620,easing:"ease-in"}).onfinish=()=>{f.remove();const p=d.kind==="coin"?tgt.parentElement:tgt;if(p)replayCls(p,"bump")}}
  function updDrops(now){if(!drops.length)return;const h=$("ahero"),a=A();const hr=h&&!h.hidden?h.getBoundingClientRect():null,ar=a.getBoundingClientRect();const lim=hr?(hr.right-ar.left)/P+4:W*.4;
    [...drops].forEach(d=>{place(d);const age=now-d.t0;if(age>700&&(d.x-cam<lim||age>6000))collect(d)})}

  /* ---------- Boss : mise en scène ---------- */
  function bossCheck(){const b=!!(S&&S.mon&&MON[S.mon.id]&&MON[S.mon.id].boss);const a=A();if(!a)return;
    if(b!==bossOn){bossOn=b;skyKey="";a.classList.toggle("bossmode",b);$("bossBar").hidden=!b;
      if(b){$("bbName").textContent=MON[S.mon.id].name;if(fx&&!calm()){const l=$("letterbox");l.classList.remove("on");void l.offsetWidth;l.classList.add("on");clearTimeout(lbT);lbT=setTimeout(()=>l.classList.remove("on"),2600)}birds.forEach(x=>{if(x.st==="sol"){x.st="vol";x.vx=R(-20,30);x.vy=R(-40,-26)}})}}
    if(b){const p=Math.max(0,S.mon.hp/S.mon.max*100);$("bbFill").style.width=p+"%";SCENE.lag("bbLag",p);$("bbTxt").textContent=`${fmt(Math.max(0,S.mon.hp))} / ${fmt(S.mon.max)}`;$("bbName").textContent=(S.mon.shiny?"✦ ":"")+MON[S.mon.id].name}}

  /* ---------- Boucle ---------- */
  function loop(t){requestAnimationFrame(loop);if(!S||!S.cls)return;const dt=Math.min(.1,(t-(lastT||t))/1000);lastT=t;
    if(cv&&(cv.width!==W||!W))resize();if(lc&&(t-(lowResize.t||0))>500){lowResize.t=t;lowResize()}draw(t,dt);updDrops(t);bossCheck();SITE.draw(t,dt)}

  return{
    init(){cv=$("wcv");if(!cv)return;ctx=cv.getContext("2d");wc=document.createElement("canvas");wx=wc.getContext("2d");
      lc=$("wbg");if(lc){lx=lc.getContext("2d");lw=document.createElement("canvas");lwx=lw.getContext("2d")}
      const rs=()=>{resize();lowResize()};
      if(window.ResizeObserver){ro=new ResizeObserver(rs);ro.observe($("arena"));ro.observe($("app"))}addEventListener("resize",rs);rs();requestAnimationFrame(loop)},
    /* changement de zone : nouveaux plans ; la prairie du dessous remplace le motif de fond de page */
    zone(id){if(id===zid&&L)return;zid=id;L=makeLayers(id);birds=[];shadows=[];puffs=[];tumbles=[];gusts=[];flies=[];flakes=[];gulls=[];bolt=null;schools=[];jellies=[];plume=[];bombs=[];erupt=4;lowSh=[];drops.splice(0).forEach(d=>d.e.remove());
      const c=css(L.G[0]);document.body.style.backgroundImage="none";document.body.style.backgroundColor=c;document.documentElement.style.backgroundColor=c;lowResize()},
    /* l'équipe avance jusqu'à l'endroit où se tenait le monstre */
    walk(){const h=$("ahero"),m=$("monBtn");let step=60;if(h&&m&&!h.hidden){const a=h.getBoundingClientRect(),b=m.getBoundingClientRect();if(a.width&&b.width)step=Math.max(30,(b.left+b.width/2-a.left-a.width/2)/P)}
      if(calm()){cam+=step;return}camFrom=cam;camTo=(walkMs?camTo:cam)+step;walkT0=performance.now();walkMs=750;$("arena").classList.add("walking")},
    coins(n){let ok=false;for(let i=0;i<n;i++)ok=addDrop("","coin",false)||ok;return ok},
    drop(icon,rare){return addDrop(`<span>${icon}</span>`,"item",rare)},
    get scale(){return P}};
})();

/* ---------- Chantiers des ouvriers (onglet Métiers) ----------
   Un petit bout de la Prairie, propre à chaque métier, où l'on voit travailler les ouvriers
   embauchés (js/ouvriers.js) pendant que le héros se bat. Le <canvas id="siteCv"> est dans le
   panneau (taille fixe, pour que la mise à jour du panneau ne l'efface pas). */
const SITE=(()=>{
  const{Spr,prop,rng,rgb,mix,TH,DARK}=PX.kit;
  const W=256,H=84,FEET=70;
  const css=c=>{c=rgb(c);return`rgb(${c[0]},${c[1]},${c[2]})`};
  const cache={};
  /* poste de travail de chaque métier : où se tiennent les ouvriers et ce qu'ils travaillent */
  function scene(pid){if(cache[pid])return cache[pid];const T=TH.prairie,G=T.g.map(rgb),r=rng(pid.length*97+pid.charCodeAt(0)),s=new Spr(W,H);
    const sky=["#5aa8ec","#cfeefc"];for(let y=0;y<H;y++)for(let x=0;x<W;x++)s.p[y*W+x]=y<26?mix(sky[0],sky[1],y/26):G[0];
    for(let x=0;x<W;x++){const h=Math.round(8+5*Math.abs(Math.sin(Math.PI*3*x/W+1))+2*Math.sin(x/9));for(let y=26-h;y<26;y++)s.set(x,y,mix("#93a9d4",G[1],.2*(y-(26-h))/h))}
    for(let i=0;i<300;i++){const x=r()*W|0,y=27+(r()*(H-27)|0),c=G[1+(i%3)];s.set(x,y,c);s.set(x+1,y,c)}
    for(let x=0;x<W;x++){s.set(x,26,mix(G[3],DARK,.25))}
    const spots=[];const P=T.path;
    if(pid==="bucheron"){for(let x=-6;x<W;x+=22+(r()*10|0))s.blit(prop.tree(r,r()<.5?"#3f8a44":"#2f7a40","#7a5232"),x,FEET-48-(r()*6|0));for(let i=0;i<4;i++){const x=30+i*56;s.blit(prop.tree(r,"#3f8a44","#7a5232"),x-4,FEET-40);spots.push(x+6)}
      for(let i=0;i<5;i++){const x=12+i*50+(r()*10|0);s.blit(prop.stump(r,"#7a5a3a"),x,FEET-4)}}
    else if(pid==="mineur"){for(let i=0;i<5;i++){const x=10+i*52,c="#9a92ae";ellipseFill(s,x+18,FEET-10,22,16,(xx,yy,d)=>s.set(xx,yy,d<.6?mix(c,"#fff2c2",.12):c));
        for(let k=0;k<6;k++){const vx=x+6+(r()*24|0),vy=FEET-20+(r()*14|0);s.set(vx,vy,"#e0b060");s.set(vx+1,vy,"#c88a3a")}if(i<4)spots.push(x+34)}
      for(let x=0;x<W;x+=1)if(r()<.3)s.set(x,FEET+1,"#8a8296")}
    else if(pid==="paysan"){for(let y=34;y<FEET+6;y+=4)for(let x=0;x<W;x++){const c=(x+y)%7<5?"#e8c860":"#c8a040";if(r()<.8){s.set(x,y,c);s.set(x,y-1,mix(c,"#fff2c2",.3))}}
      for(let x=0;x<W;x+=60)spots.push(x+30)}
    else if(pid==="herboriste"){for(let i=0;i<4;i++){const x=12+i*62;for(let yy=FEET-14;yy<FEET+4;yy++)for(let xx=x;xx<x+40;xx++)s.set(xx,yy,(xx+yy)%3?"#7a573a":"#6b4a2e");
        for(let k=0;k<14;k++){const px=x+2+(k%7)*5,py=FEET-12+(k>6?9:0);s.set(px,py,"#4c8040");s.set(px,py-1,"#5aa84e");s.set(px+1,py-1,["#b48aff","#ffd84a","#ff8ab0","#fff"][(i+k)%4])}spots.push(x+20)}}
    else{/* pêcheur : grande mare et ponton */const wc=rgb(T.water);ellipseFill(s,W/2,FEET-6,W*.48,22,(x,y,d)=>s.set(x,y,d>.85?mix(G[3],DARK,.3):(x*5+y*3)%19===0?mix(wc,"#ffffff",.45):wc));
      for(let x=40;x<W-40;x++)for(let y=FEET-3;y<FEET+1;y++)s.set(x,y,(x%6===0)?"#5a3a22":"#9a6a3c");for(let i=0;i<4;i++)spots.push(60+i*44)}
    /* chemin de service */
    for(let x=0;x<W;x++){const c=FEET+6+Math.round(Math.sin(x/23)*1.5);for(let y=c;y<c+5;y++)s.set(x,y,P)}
    return cache[pid]={cv:s.cvs(),spots}}
  function ellipseFill(s,cx,cy,rx,ry,fn){for(let y=Math.floor(cy-ry);y<=cy+ry;y++)for(let x=Math.floor(cx-rx);x<=cx+rx;x++){const d=((x-cx)/rx)**2+((y-cy)/ry)**2;if(d<1)fn(x,y,d)}}
  const imgs={};function img(u){let i=imgs[u];if(!i){i=new Image();i.src=u;imgs[u]=i}return i}
  let pops=[];
  return{
    W,H,
    /* une récolte vient d'aboutir : petit « +1 » au-dessus de l'ouvrier */
    pop(wi,txt){pops.push({wi,txt})},
    draw(t,dt){const c=$("siteCv");if(!c||c.offsetParent===null)return;const pid=c.dataset.p;if(!PROFS[pid])return;const g=c.getContext("2d"),sc=scene(pid);g.imageSmoothingEnabled=false;g.drawImage(sc.cv,0,0);
      /* nuages qui passent */
      g.fillStyle="rgba(255,255,255,.8)";for(let i=0;i<3;i++){const x=((t*.004*(1+i*.3)+i*97)%(W+60))-30;g.fillRect(Math.round(W-x),6+i*5,14+i*4,3);g.fillRect(Math.round(W-x)+3,4+i*5,8,2)}
      const list=OUV.at(pid);list.forEach((w,k)=>{const x=sc.spots[k%sc.spots.length]+(k>=sc.spots.length?10:0),f=OUV.frame(w,t),im=img(f);if(im.complete&&im.width)g.drawImage(im,Math.round(x-im.width/2),FEET-Math.round(im.height*.75))});
      if(pops.length){const box=c.parentElement;pops.forEach(p=>{const k=list.indexOf(OUV.list()[p.wi]);if(k<0||!box)return;const x=sc.spots[k%sc.spots.length]+(k>=sc.spots.length?10:0),e=document.createElement("b");
        e.className="sitepop";e.textContent=p.txt;e.style.left=(x/W*100)+"%";e.style.top=((FEET-34)/H*100)+"%";box.appendChild(e);setTimeout(()=>e.remove(),1100)});pops=[]}}};
})();
