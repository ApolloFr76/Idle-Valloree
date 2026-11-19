/* Outils communs des décors de monde (objet MK) : utilitaires de dessin, petits éléments de décor, hauteurs des plans
   et table BIOME (une fonction par monde, remplie par les fichiers js/biomes/*.js, lue par js/monde.js).
   Chargé avant les biomes et avant monde.js. */
const MK=(()=>{
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
  return{Spr,prop,rng,rgb,mix,TH,DARK,LIGHT,INK,calm,R,TAU,css,wave,wset,wblit,wget,ellipse,deco,FARH,MIDH,WALLH,TM,GH,PY,mkClouds,BIOME};
})();
