/* Décor du monde « Prairie des Clochettes » : plans du paysage générés une fois (fonction BIOME.prairie, lue par js/monde.js). */
(()=>{
  const{Spr,prop,rng,rgb,mix,TH,DARK,LIGHT,INK,calm,R,TAU,css,wave,wset,wblit,wget,ellipse,deco,FARH,MIDH,WALLH,TM,GH,PY,mkClouds,BIOME}=MK;
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

  BIOME.prairie=prairie;
})();
