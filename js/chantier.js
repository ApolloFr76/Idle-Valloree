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
