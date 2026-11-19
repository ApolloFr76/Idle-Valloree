/* Décor du monde « Marais Glouglou » : plans du paysage générés une fois (fonction BIOME.marais, lue par js/monde.js). */
(()=>{
  const{Spr,prop,rng,rgb,mix,TH,DARK,LIGHT,INK,calm,R,TAU,css,wave,wset,wblit,wget,ellipse,deco,FARH,MIDH,WALLH,TM,GH,PY,mkClouds,BIOME}=MK; const{crowns}=MK;
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

})();
