/* Ouvriers : on les embauche avec des écus et on les place sur une ressource déjà débloquée d'un
   métier. Ils récoltent seuls, deux fois moins vite que vous et sans XP de métier, pendant les
   combats et hors ligne (8 h max), tant que le sac a de la place. On les voit travailler dans le
   chantier de l'onglet Métiers (SITE, js/monde.js). Objet OUV, état dans S.workers. */
const OUV_MAX=6,OUV_SLOW=2,OUV_BASE=300,OUV_GROWTH=5;
const OUV_NAMES=["Gaston","Margot","Baptiste","Lison","Firmin","Rosalie","Anselme","Perrine","Hector","Jeanne","Éloi","Mahaut"];
/* apparence : [silhouette de classe, couleur de tenue] */
const OUV_LOOK=[["gardien","#c9a86a"],["guerrier","#8a9a5a"],["archer","#b07a46"],["mage","#7a8ab8"],["gardien","#a86a4a"],["archer","#6a9a7a"]];
const OUV=(()=>{
  const L=()=>S.workers||(S.workers=[]);
  const cost=()=>Math.round(OUV_BASE*Math.pow(OUV_GROWTH,L().length));
  const open=rid=>{const r=RES[rid];return!!(r&&r.prof&&!r.rare&&S.jobs[r.prof].lvl>=UNLOCK[r.tier])};
  const time=w=>{const r=RES[w.r];return gatherTime(r.prof,r.tier)*OUV_SLOW};
  const best=pid=>{const J=S.jobs[pid];let t=0;UNLOCK.forEach((u,i)=>{if(J.lvl>=u)t=i});return PROFS[pid].res[t][0]};
  return{
    MAX:OUV_MAX,cost,open,time,
    list:L,
    at:pid=>L().filter(w=>RES[w.r]&&RES[w.r].prof===pid),
    /* récolte pendant le jeu */
    tick(dt){L().forEach((w,i)=>{if(!w.r||!RES[w.r])return;const gt=time(w);w.t+=dt;while(w.t>=gt){const n=addRes(w.r,1);if(!n){w.t=gt;w.full=1;return}w.t-=gt;w.full=0;w.n=(w.n||0)+n;qProg("gather",w.r,n);if(fx)SITE.pop(i,"+"+n)}})},
    /* récolte pendant l'absence (même plafond que le reste : 8 h, voir offline()) */
    offline(sec,sum){L().forEach(w=>{if(!w.r||!RES[w.r])return;const gt=time(w),tot=sec+w.t,want=Math.floor(tot/gt);w.t=tot-want*gt;const n=want>0?addRes(w.r,want):0;w.n=(w.n||0)+n;if(n){qProg("gather",w.r,n);sum.res[RES[w.r].name]=(sum.res[RES[w.r].name]||0)+n}})},
    hire(pid){if(L().length>=OUV_MAX)return;const c=cost();if(S.ecus<c){toast(`Il faut ${fmt(c)} écus`);return}S.ecus-=c;
      const used=new Set(L().map(w=>w.name)),name=OUV_NAMES.find(n=>!used.has(n))||"Ouvrier";const w={name,look:L().length%OUV_LOOK.length,r:best(pid),t:0,n:0};L().push(w);
      sfx("coin");log(`${name} rejoint vos ouvriers (${PROFS[pid].name} : ${RES[w.r].name}).`,"g");toast(`${name} embauché`)},
    assign(i,rid){const w=L()[i];if(!w||!open(rid))return;if(w.r!==rid){w.r=rid;w.t=0;w.full=0}},
    fire(i){const w=L()[i];if(!w)return;L().splice(i,1);log(`${w.name} quitte vos ouvriers.`,"w")},
    /* image de l'ouvrier : il frappe juste avant chaque récolte, sinon il souffle */
    frame(w,t){const[cls,c]=OUV_LOOK[w.look%OUV_LOOK.length];if(!w.r||!RES[w.r]||w.full)return PX.heroFrames(cls,c,"idle")[Math.floor(t/170)%10];
      const gt=time(w),p=w.t/gt,k=Math.min(9,Math.floor((p-.75)/.25*10));return p>=.75?PX.heroFrames(cls,c,"atk")[k]:PX.heroFrames(cls,c,"idle")[Math.floor((t+w.look*400)/170)%10]},
    portrait(w){const[cls,c]=OUV_LOOK[w.look%OUV_LOOK.length];return PX.heroFrames(cls,c,"idle")[0]}};
})();
