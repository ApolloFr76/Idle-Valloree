/* Décor du monde « Récifs de Corail-Chant » : plans du paysage générés une fois (fonction BIOME.recifs, lue par js/monde.js). */
(()=>{
  const{Spr,prop,rng,rgb,mix,TH,DARK,LIGHT,INK,calm,R,TAU,css,wave,wset,wblit,wget,ellipse,deco,FARH,MIDH,WALLH,TM,GH,PY,mkClouds,BIOME}=MK; const{crowns}=MK;
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

  Object.assign(MK,{REC});   /* aussi utilisé par js/monde.js ou par d'autres biomes */
})();
