/* Ouvriers : on les embauche avec des écus et on les place sur une ressource déjà débloquée d'un
   métier. Ils récoltent seuls, deux fois moins vite que vous, pendant les combats et hors ligne
   (sur la durée de stockage AFK), avec 50 % de l'XP de métier et le bonus « Double récolte » (r5).
   On les voit travailler dans le chantier de l'onglet Métiers (SITE, js/chantier.js). Objet OUV, état dans S.workers. */
const OUV_MAX=6,OUV_SLOW=2,OUV_BASE=300,OUV_GROWTH=5;
/* Outils des ouvriers : chaque ouvrier a son propre outil (w.tl = palier 0..11). Il ne récolte que les ressources
   jusqu'à ce palier, et chaque palier le rend 10 % plus rapide. L'outil suivant s'achète en écus + ressource du palier actuel. */
const OUV_TOOL_SPD=.1,OUV_TOOL_EC=250,OUV_TOOL_GROW=3.5;
const OUV_NAMES=["Gaston","Margot","Baptiste","Lison","Firmin","Rosalie","Anselme","Perrine","Hector","Jeanne","Éloi","Mahaut"];
/* 10 designs de PNJ ouvriers uniques (indices 0..9 rendus par PX.workerFrames / PX.workerPortrait) */
const OUV_LOOK=[
  {id:0,style:"Bonnet & flanelle"},
  {id:1,style:"Chapeau de paille & tablier"},
  {id:2,style:"Bandana & lunettes"},
  {id:3,style:"Couronne de feuilles"},
  {id:4,style:"Béret & moustache"},
  {id:5,style:"Foulard & salopette"},
  {id:6,style:"Toque fourrée"},
  {id:7,style:"Bob & ciré marin"},
  {id:8,style:"Casquette & gilet"},
  {id:9,style:"Capuche & besace"}
];
const OUV_FISH_TIERS=["des Prés","Moussue","des Marais","des Galeries","Ambrée","de Givre","d'Orage","Émeraude","Corail","de Braise","Astrale","Abyssale"];
const OUV=(()=>{
  const L=()=>S.workers||(S.workers=[]);
  const cost=()=>Math.round(OUV_BASE*Math.pow(OUV_GROWTH,L().length));
  const open=rid=>{const r=RES[rid];return!!(r&&r.prof&&!r.rare&&S.jobs[r.prof].lvl>=UNLOCK[r.tier])};
  const tl=w=>Math.max(0,Math.min(11,w&&w.tl|0));
  const time=w=>{const r=RES[w.r];return Math.max(.1,gatherRaw(r.prof,r.tier)*OUV_SLOW/(1+OUV_TOOL_SPD*tl(w)))};
  /* prix de l'outil suivant : des écus et la ressource du palier actuel de l'outil (que l'ouvrier sait déjà récolter) ;
     il faut aussi avoir débloqué la ressource du palier suivant dans le métier */
  const toolCost=w=>{const r=RES[w.r],n=tl(w)+1;if(!r||n>11)return null;const pid=r.prof,[rid,rname]=PROFS[pid].res[n-1],nname=PROFS[pid].res[n][1];
    return{pid,n,rid,rname,nname,ec:Math.round(OUV_TOOL_EC*Math.pow(OUV_TOOL_GROW,n)),q:20+10*n,lvl:UNLOCK[n],name:toolName(pid,n)}};
  /* palier (0..11) de la dernière ressource débloquée d'un métier */
  const toolTier=pid=>{const J=S&&S.jobs&&S.jobs[pid];if(!J)return 0;let t=0;UNLOCK.forEach((u,i)=>{if(J.lvl>=u)t=i});return t};
  const best=pid=>PROFS[pid].res[0][0];
  const de=s=>/^[aeiouyhàâéèêîôùœ]/i.test(s)?"d'"+s:"de "+s;
  const toolName=(pid,t)=>{
    const tier=Math.max(0,Math.min(11,t==null?toolTier(pid):t|0));
    const res=PROFS[pid]&&PROFS[pid].res[tier]?PROFS[pid].res[tier][1]:"";
    if(pid==="bucheron")return`Hache ${de(res)}`;
    if(pid==="mineur")return`Pioche en ${res}`;
    if(pid==="paysan")return`Faux ${de(res)}`;
    if(pid==="herboriste")return`Faucille ${de(res)}`;
    return`Canne ${OUV_FISH_TIERS[tier]||"de Pêche"}`;
  };
  const normLook=v=>((v|0)%OUV_LOOK.length+OUV_LOOK.length)%OUV_LOOK.length;
  return{
    get MAX(){return ouvMax()},cost,open,time,toolTier,toolName,tl,toolCost,
    /* l'ouvrier i peut-il récolter cette ressource avec son outil ? */
    fits:(w,rid)=>!!(RES[rid]&&RES[rid].tier<=tl(w)),
    upTool(i){const w=L()[i],c=w&&toolCost(w);if(!c)return;
      if(S.jobs[c.pid].lvl<c.lvl){toast(`Débloquez d'abord ${c.nname} (${PROFS[c.pid].name} niveau ${c.lvl})`);return}
      if(S.ecus<c.ec||(S.res[c.rid]||0)<c.q){toast(`Il faut ${fmt(c.ec)} écus et ${fmt(c.q)} ${c.rname}`);return}
      S.ecus-=c.ec;S.res[c.rid]-=c.q;w.tl=c.n;sfx("coin");log(`${w.name} reçoit l'outil ${c.name}.`,"g");toast(`${w.name} : ${c.name}`)},
    list:L,
    at:pid=>L().filter(w=>RES[w.r]&&RES[w.r].prof===pid),
    /* récolte pendant le jeu */
    tick(dt){const dbl=talV("t_double")/100;L().forEach((w,i)=>{if(!w.r||!RES[w.r]||RES[w.r].tier>tl(w))return;const gt=time(w);w.t+=dt;while(w.t>=gt){const q=1+(Math.random()<dbl?1:0),n=addRes(w.r,q);w.t-=gt;w.n=(w.n||0)+n;qProg("gather",w.r,n);gainGatherXp(RES[w.r].prof,w.r,.5,true);if(fx)SITE.pop(i,"+"+n)}})},
    /* récolte pendant l'absence (sur la durée AFK) */
    offline(sec,sum){const dbl=Math.min(1,talV("t_double")/100);L().forEach(w=>{if(!w.r||!RES[w.r]||RES[w.r].tier>tl(w))return;const gt=time(w),tot=sec+w.t,want=Math.floor(tot/gt);w.t=tot-want*gt;const n=want>0?addRes(w.r,want+Math.round(want*dbl)):0;w.n=(w.n||0)+n;if(n){qProg("gather",w.r,n);const ch=Math.min(20,want);for(let i=0;i<ch;i++)gainGatherXp(RES[w.r].prof,w.r,.5*want/ch,true);sum.res[RES[w.r].name]=(sum.res[RES[w.r].name]||0)+n}})},
    hire(pid){if(L().length>=ouvMax())return;const c=cost();if(S.ecus<c){toast(`Il faut ${fmt(c)} écus`);return}S.ecus-=c;
      const usedN=new Set(L().map(w=>w.name)),name=OUV_NAMES.find(n=>!usedN.has(n))||"Ouvrier";
      const usedL=new Set(L().map(w=>normLook(w.look)));
      let look=L().length%OUV_LOOK.length;
      for(let i=0;i<OUV_LOOK.length;i++){if(!usedL.has(i)){look=i;break}}
      const w={name,look,r:best(pid),t:0,n:0,tl:0};L().push(w);
      sfx("coin");log(`${name} rejoint vos ouvriers (${PROFS[pid].name} : ${RES[w.r].name}).`,"g");toast(`${name} embauché`)},
    assign(i,rid){const w=L()[i];if(!w||!open(rid))return;if(RES[rid].tier>tl(w)){toast(`${w.name} a besoin d'un meilleur outil pour ${RES[rid].name}`);return}if(w.r!==rid){w.r=rid;w.t=0}},
    cycleLook(i){const w=L()[i];if(!w)return;w.look=(normLook(w.look)+1)%OUV_LOOK.length;save()},
    fire(i){const w=L()[i];if(!w)return;L().splice(i,1);log(`${w.name} quitte vos ouvriers.`,"w")},
    /* image de l'ouvrier : son outil change selon le métier attribué et son palier d'outil (w.tl) */
    frame(w,t){
      const lk=normLook(w.look),r=w.r&&RES[w.r],pid=r?r.prof:null,tt=tl(w);
      if(!r)return PX.workerFrames(lk,null,0,"idle")[Math.floor(t/170)%10];
      const gt=time(w),p=w.t/gt,k=Math.min(9,Math.floor((p-.75)/.25*10));
      return p>=.75?PX.workerFrames(lk,pid,tt,"atk")[k]:PX.workerFrames(lk,pid,tt,"idle")[Math.floor((t+lk*400)/170)%10];
    },
    portrait(w){
      const lk=normLook(w.look),r=w.r&&RES[w.r],pid=r?r.prof:null,tt=tl(w);
      return PX.workerPortrait(lk,pid,tt);
    }
  };
})();
