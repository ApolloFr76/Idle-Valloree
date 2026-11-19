/* Décor du monde « Pics de Givrecrin » : plans du paysage générés une fois (fonction BIOME.givre, lue par js/monde.js). */
(()=>{
  const{Spr,prop,rng,rgb,mix,TH,DARK,LIGHT,INK,calm,R,TAU,css,wave,wset,wblit,wget,ellipse,deco,FARH,MIDH,WALLH,TM,GH,PY,mkClouds,BIOME}=MK;
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

})();
