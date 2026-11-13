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
  const{Spr,prop,rng,rgb,mix,TH,DARK}=PX.kit;
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
  function makeLayers(zid){
    const T=TH[zid]||TH.prairie,G=T.g.map(rgb),fl=T.fl||["#ffd84a","#fff"],r=rng(zid.length*1013+zid.charCodeAt(0)*7);
    const haze="#a9bde0",meta={mills:[],houses:[],ponds:[]};
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
    /* nuages */
    const clouds=[0,1,2,3].map(k=>{const w=22+k*6,h=8+(k%2)*3,s=new Spr(w,h);s.part("#ffffff",q=>{q.ell(w*.3,h*.62,w*.24,h*.36);q.ell(w*.55,h*.45,w*.26,h*.44);q.ell(w*.78,h*.65,w*.2,h*.3);q.rect(w*.12,h*.66,w*.76,h*.3)},{lt:.1,dk:.18});return s.cvs()});
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

  /* ---------- État ---------- */
  let cv=null,ctx=null,wc=null,wx=null,P=4,W=0,H=0,FY=0,GT=0,zid=null,L=null,ro=null,lastT=0,skyKey="",skyCv=null;
  let cam=0,camFrom=0,camTo=0,walkT0=0,walkMs=0;
  let birds=[],flies=[],shadows=[],puffs=[],bossOn=false,lbT=0;
  let lc=null,lx=null,lw=null,lwx=null,LT=0,LHt=0,lowSh=[];   /* prairie du dessous : canvas, contexte, hauteur en pixels logiques */
  const drops=[];

  function resize(){const a=$("arena");if(!a||!cv)return;const w=a.clientWidth,h=a.clientHeight;if(!w||!h)return;
    P=w<640?3:4;W=Math.ceil(w/P);H=Math.ceil(h/P);cv.width=W;cv.height=H;cv.style.width=W*P+"px";cv.style.height=H*P+"px";wc.width=W;wc.height=H;
    const feet=P===4?Math.min(104,Math.round(h*.21)):78;FY=H-Math.round(feet/P);GT=FY-(PY-TM);a.style.setProperty("--feet",(H-FY)*P+"px");a.style.setProperty("--px",P);skyKey=""}

  /* ---------- Ciel selon l'heure réelle (mêmes plages que VIE.sky) ---------- */
  const SKY={day:["#5aa8ec","#cfeefc"],dawn:["#6a78c8","#ffc9a0"],dusk:["#3c3a88","#ff9e78"],night:["#0b0f2e","#283070"]};
  const TINT={day:null,dawn:"rgba(255,150,90,.14)",dusk:"rgba(120,50,100,.24)",night:"rgba(16,22,70,.52)"};
  function phase(){const d=new Date(),h=d.getHours()+d.getMinutes()/60;return h>=21||h<5.5?"night":h<8?"dawn":h>=18?"dusk":"day"}
  function skyCanvas(ph){const k=ph+W+"x"+H+(bossOn?"b":"");if(k===skyKey)return skyCv;skyKey=k;const c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");
    let[t,b]=SKY[ph];if(bossOn){t=mix(t,"#3a0a28",.55);b=mix(b,"#8a3048",.5)}const n=14,hz=Math.max(8,GT-8);
    for(let i=0;i<n;i++){const y0=Math.round(hz*i/n),y1=Math.round(hz*(i+1)/n),c0=css(mix(t,b,i/(n-1))),c1=css(mix(t,b,Math.min(1,(i+1)/(n-1))));x.fillStyle=c0;x.fillRect(0,y0,W,y1-y0);
      x.fillStyle=c1;for(let xx=0;xx<W;xx+=2)x.fillRect(xx+(y1%2),y1-1,1,1)}
    x.fillStyle=css(b);x.fillRect(0,hz,W,H-hz);return skyCv=c}

  /* ---------- Plans qui défilent ---------- */
  function band(g,img,f,y){if(!img)return;const w=img.width,o=((Math.round(cam*f)%w)+w)%w;for(let x=-o;x<W;x+=w)g.drawImage(img,x,y)}
  function px(g,x,y,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),1,1)}

  /* ---------- Vie du décor ---------- */
  function spawnBird(x){birds.push({x,y:FY-R(10,30),st:"sol",t:R(0,3000),vx:0,vy:0,c:Math.random()<.5?"#7a5a40":"#5a6a7a"})}
  function updLife(dt,t,ph){
    /* oiseaux posés devant ; ils s'envolent quand l'équipe approche */
    const stageR=(W*P/2+80)/P;while(birds.filter(b=>b.st==="sol").length<3)spawnBird(cam+W+R(20,260));
    birds.forEach(b=>{const sx=b.x-cam;if(b.st==="sol"&&(sx<stageR||bossOn)){b.st="vol";b.vx=R(-14,30);b.vy=R(-34,-22)}if(b.st==="vol"){b.x+=b.vx*dt;b.y+=b.vy*dt;b.vy-=6*dt}});
    birds=birds.filter(b=>b.y>-10&&b.x-cam>-20);
    /* papillons le jour, lucioles la nuit */
    const want=ph==="night"?12:bossOn?0:5;while(flies.length<want)flies.push({x:R(0,W),y:R(GT+2,FY+14),vx:R(-6,6),vy:R(-3,3),t:R(0,9),c:ph==="night"?"#e8ff8a":["#ffd36a","#ff9ac8","#bfe3ff","#fff6d8"][Math.random()*4|0],n:ph==="night"});
    if(flies.length>want)flies.length=want;flies.forEach(f=>{if(f.n!==(ph==="night")){f.n=ph==="night";f.c=f.n?"#e8ff8a":"#ffd36a"}f.t+=dt;f.vx+=R(-14,14)*dt;f.vy+=R(-10,10)*dt;f.vx=Math.max(-9,Math.min(9,f.vx));f.vy=Math.max(-6,Math.min(6,f.vy));
      f.x+=f.vx*dt;f.y+=f.vy*dt;if(f.y<GT-6)f.vy+=4*dt;if(f.y>FY+16)f.vy-=4*dt;if(f.x<-4)f.x+=W+8;if(f.x>W+4)f.x-=W+8});
    /* ombres des nuages sur la prairie */
    while(shadows.length<3)shadows.push({x:R(0,1000),y:R(GT+10,H-10),rx:R(26,46),ry:R(4,6),v:R(2,4)});
    shadows.forEach(s=>s.x-=s.v*dt);
    /* fumée des cheminées du village */
    if(L&&Math.random()<dt*1.4){const h=L.meta.houses[Math.random()*L.meta.houses.length|0];if(h)puffs.push({h,t:0})}
    puffs.forEach(p=>p.t+=dt);puffs=puffs.filter(p=>p.t<2.6)}
  function drawLife(g,t,ph){
    /* ombres des nuages : sur le sol, elles suivent le défilement */
    if(ph!=="night")shadows.forEach(s=>{const o=((s.x-cam)%1000+1000)%1000-120;g.fillStyle="rgba(20,40,30,.13)";for(let y=-s.ry;y<=s.ry;y++){const w=Math.round(s.rx*Math.sqrt(1-(y/s.ry)**2));g.fillRect(Math.round(o-w),Math.round(s.y+y),w*2,1)}});
    /* reflets sur les mares */
    const gy=GT-TM;L.meta.ponds.forEach(p=>{const w=L.gW,o=((Math.round(cam)%w)+w)%w;for(let k=-1;k<=Math.ceil(W/w);k++){const cx=p.x+k*w-o;if(cx<-40||cx>W+40)continue;
      for(let i=0;i<4;i++){const s=Math.floor(t/520)+i*13,a=Math.sin(s*12.9898+p.x)*43758.5,fr=a-Math.floor(a),b=Math.sin(s*78.233+p.y)*12345.6,fy=b-Math.floor(b);
        g.fillStyle="rgba(230,245,255,.8)";g.fillRect(Math.round(cx+(fr-.5)*p.rx*1.3),Math.round(gy+p.y+(fy-.5)*p.ry*1.1),2+(i%2),1)}}});
    /* oiseaux */
    birds.forEach(b=>{const x=Math.round(b.x-cam),y=Math.round(b.y);if(b.st==="sol"){const peck=Math.floor((t+b.t)/420)%5===0;g.fillStyle=b.c;g.fillRect(x,y,3,2);g.fillRect(x+(peck?3:2),y-(peck?0:1),2,peck?1:2);g.fillStyle="#f0a03c";g.fillRect(x+(peck?5:4),y+(peck?1:0),1,1);g.fillStyle="#1c1020";g.fillRect(x+3,y-1+(peck?1:0),1,1)}
      else{const up=Math.floor(t/90)%2;g.fillStyle=b.c;g.fillRect(x,y,3,2);g.fillRect(x-1,y-(up?2:0),2,1);g.fillRect(x+2,y-(up?2:0),2,1)}});
    /* papillons et lucioles */
    flies.forEach(f=>{const x=Math.round(f.x),y=Math.round(f.y);if(f.n){const a=.4+.6*Math.abs(Math.sin(f.t*2.2));g.fillStyle=`rgba(232,255,138,${a*.35})`;g.fillRect(x-1,y-1,3,3);g.fillStyle=`rgba(250,255,200,${a})`;g.fillRect(x,y,1,1)}
      else{const open=Math.floor(f.t*7)%2;g.fillStyle=f.c;if(open){g.fillRect(x-2,y-1,2,2);g.fillRect(x+1,y-1,2,2)}else{g.fillRect(x-1,y-1,1,2);g.fillRect(x+1,y-1,1,2)}g.fillStyle="#3a2a22";g.fillRect(x,y-1,1,2)}})}

  /* ---------- Image ---------- */
  function draw(t,dt){if(!ctx||!L||!W)return;const ph=phase(),moving=!calm();
    if(moving&&walkMs){const k=Math.min(1,(t-walkT0)/walkMs),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;cam=camFrom+(camTo-camFrom)*e;if(k>=1){walkMs=0;$("arena").classList.remove("walking")}}
    if(moving)updLife(dt,t,ph);
    ctx.drawImage(skyCanvas(ph),0,0);
    /* soleil ou lune et étoiles */
    if(ph==="night"){const r=rng(5);for(let i=0;i<46;i++){const x=r()*W|0,y=r()*Math.max(10,GT-30)|0,tw=Math.sin(t/600+i*1.7)>.6;ctx.fillStyle=tw?"#ffffff":"rgba(210,225,255,.7)";ctx.fillRect(x,y,1,1)}
      const mx=Math.round(W*.8),my=24;ctx.fillStyle="#f6f0d6";ctx.fillRect(mx-3,my-4,7,9);ctx.fillRect(mx-4,my-3,9,7);ctx.fillStyle="#d8d0b0";ctx.fillRect(mx-1,my-1,2,2);ctx.fillRect(mx+2,my+1,1,1)}
    else{const sx=Math.round(W*(ph==="dawn"?.14:ph==="dusk"?.86:.8)),sy=ph==="day"?24:Math.max(24,GT-44);ctx.fillStyle="rgba(255,240,170,.25)";ctx.fillRect(sx-7,sy-5,15,11);ctx.fillRect(sx-5,sy-7,11,15);
      ctx.fillStyle=ph==="day"?"#fff4b0":"#ffcf8a";ctx.fillRect(sx-4,sy-3,9,7);ctx.fillRect(sx-3,sy-4,7,9)}
    /* nuages */
    ctx.globalAlpha=ph==="night"?.35:bossOn?.6:.95;L.clouds.forEach((c,i)=>{const per=W+140,x=(((i*per/4+t*(.0016+i*.0005)*(moving?1:0)+cam*.05)%per)+per)%per;ctx.drawImage(c,Math.round(W+40-x),18+((i*11)%Math.max(8,GT-70)))});ctx.globalAlpha=1;
    /* le paysage, teinté selon l'heure */
    const g=wx;g.clearRect(0,0,W,H);
    band(g,L.far,.08,GT-FARH-4);band(g,L.mid,.22,GT-MIDH+2);
    /* ailes des moulins */
    {const w=L.mid.width,o=((Math.round(cam*.22)%w)+w)%w,a=t*.0012*(moving?1:0);L.meta.mills.forEach(m=>{for(let k=-1;k<=Math.ceil(W/w);k++){const x=m.x+k*w-o,y=GT-MIDH+2+m.y;if(x<-10||x>W+10)continue;
      for(let b=0;b<4;b++){const an=a+b*TAU/4;for(let r=1;r<=6;r++)px(g,x+Math.cos(an)*r,y+Math.sin(an)*r,r>2?"#f4ecd8":"#8a6a48")}}})}
    /* fumées */
    {const w=L.mid.width,o=((Math.round(cam*.22)%w)+w)%w;puffs.forEach(p=>{const x=p.h.x-o+(p.h.x-o<-10?w:0)+p.t*1.5,y=GT-MIDH+2+p.h.y-p.t*4;if(x<0||x>W)return;g.fillStyle=`rgba(235,235,240,${.55*(1-p.t/2.6)})`;g.fillRect(Math.round(x),Math.round(y),1+(p.t>1?1:0),1+(p.t>1.4?1:0))})}
    band(g,L.wall,.5,GT-WALLH+3);
    band(g,L.ground,1,GT-TM);
    drawLife(g,t,ph);
    /* hautes herbes qui ondulent : elles défilent exactement avec le sol où elles sont plantées */
    {const gw=L.gW,off=((Math.round(cam)%gw)+gw)%gw,y0=GT-TM,base=tf=>y0+tf.y;L.tufts.forEach(tf=>{const b=base(tf);if(b>H-1)return;   /* entière dans le bandeau, jamais coupée par son bord */if(!tf.cs){tf.cs=css(tf.c);tf.ct=css(mix(tf.c,"#fff2c2",.25))}
      /* le pied reste fixe, seul le haut se balance */
      for(let x=tf.x-off;x<W+4;x+=gw){if(x<-4)continue;for(let j=0;j<tf.h;j++){const sw=moving?Math.round(Math.sin(t/700+tf.ph)*j/tf.h*1.6):0;g.fillStyle=j===tf.h-1?tf.ct:tf.cs;g.fillRect(Math.round(x+sw),b-j,tf.w,1)}
        if(tf.f){const sw=moving?Math.round(Math.sin(t/700+tf.ph)*1.6):0;g.fillStyle=tf.f;g.fillRect(Math.round(x+sw),b-tf.h,2,1)}}})}
    if(TINT[ph]||bossOn){g.globalCompositeOperation="source-atop";if(TINT[ph]){g.fillStyle=TINT[ph];g.fillRect(0,0,W,H)}if(bossOn){g.fillStyle="rgba(70,0,30,.28)";g.fillRect(0,0,W,H)}g.globalCompositeOperation="source-over"}
    ctx.drawImage(wc,0,0);
    drawLow(t,ph,moving,dt);
    if(ph==="night")flies.forEach(f=>{if(!f.n)return;const a=.4+.6*Math.abs(Math.sin(f.t*2.2));ctx.fillStyle=`rgba(250,255,200,${a})`;ctx.fillRect(Math.round(f.x),Math.round(f.y),1,1)})}

  /* ---------- Prairie sous le bandeau ---------- */
  function lowResize(){if(!lc||!W)return;const ar=$("arena"),wr=$("app");if(!ar||!wr)return;const hb=Math.floor(ar.clientHeight/P);
    const top=ar.getBoundingClientRect().top+scrollY+hb*P,bottom=Math.max(wr.getBoundingClientRect().bottom+scrollY,innerHeight),h=Math.max(P,Math.ceil((bottom-top)/P));
    LT=hb;LHt=h;if(lc.width!==W||lc.height!==h){lc.width=W;lc.height=h;lw.width=W;lw.height=h}lc.style.top=top+"px";lc.style.width=W*P+"px";lc.style.height=h*P+"px"}
  function drawLow(t,ph,moving,dt){if(!lc||!L||!LHt)return;const g=lwx,ox=((Math.round(cam)%L.gW)+L.gW)%L.gW;g.clearRect(0,0,W,LHt);
    /* d'abord la fin de la bande du sol (sous le bord du bandeau), puis la prairie qui se répète */
    const y0=GT-TM-LT,gh=L.ground.height;for(let x=-ox;x<W;x+=L.gW)g.drawImage(L.ground,x,y0);
    for(let y=y0+gh;y<LHt;y+=L.low.height)for(let x=-ox;x<W;x+=L.gW)g.drawImage(L.low,x,y);
    /* ombres des nuages qui glissent aussi sur le bas */
    if(ph!=="night"){while(lowSh.length<Math.ceil(LHt/90))lowSh.push({x:R(0,1000),y:R(4,LHt),rx:R(30,56),ry:R(5,8),v:R(2,4)});if(moving)lowSh.forEach(s=>s.x-=s.v*dt);
      g.fillStyle="rgba(20,40,30,.12)";lowSh.forEach(s=>{const o=((s.x-cam)%1000+1000)%1000-120;for(let y=-s.ry;y<=s.ry;y++){const w=Math.round(s.rx*Math.sqrt(1-(y/s.ry)**2));g.fillRect(Math.round(o-w),Math.round(s.y+y),w*2,1)}})}
    if(TINT[ph]||bossOn){g.globalCompositeOperation="source-atop";if(TINT[ph]){g.fillStyle=TINT[ph];g.fillRect(0,0,W,LHt)}if(bossOn){g.fillStyle="rgba(70,0,30,.28)";g.fillRect(0,0,W,LHt)}g.globalCompositeOperation="source-over"}
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
    zone(id){if(id===zid&&L)return;zid=id;L=makeLayers(id);birds=[];shadows=[];puffs=[];lowSh=[];drops.splice(0).forEach(d=>d.e.remove());
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
