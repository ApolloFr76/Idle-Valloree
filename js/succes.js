/* Succès et renaissance Oméga. */
/* ================= Succès et renaissance ================= */
function checkAch(){let n=0;ACH.forEach(a=>{if(!S.ach[a.id]&&a.get()>=a.v){S.ach[a.id]=1;n++;log(`Succès débloqué : <b>${a.n}</b> (${a.txt}).`,"g");if(fx){toast(`Succès : ${a.n} · +1 % dégâts et écus`);FX.ach(a.n)}}});if(n)dirty=true}
const clsCost=()=>5+5*(S.clsSwaps||0);
function doPrestige(){
  const g=soulsGain();if(g<=0)return;const oldE=S.ecus||0,oldAl=S.allies||{},oldTw=S.tower||{best:0};
  const keep={cls:S.cls,name:S.name,st:S.st,sess:S.sess,born:S.born,best:S.best,fdex:S.fdex,ach:S.ach,tower:{best:0,cur:1},souls:S.souls+g,soulsTotal:(S.soulsTotal||0)+g,prest:(S.prest||0)+1,tal:S.tal,arb:S.arb,unl:S.unl,tips:S.tips,tutoDone:S.tutoDone,pkN:S.pkN,kills:S.kills,uid:S.uid,log:[],tab:"prest",time:S.time,auto:S.auto,opt:S.opt,q:S.q,mk:S.mk,mkPrev:S.mkPrev,autoPot:S.autoPot,autoBuff:S.autoBuff||{},upPerm:S.upPerm||{},sellCfg:S.sellCfg||{},hist:S.hist||[],prof:S.prof};
  for(const k in keep)if(keep[k]===undefined)delete keep[k];
  S=Object.assign(fresh(),keep);S.st.bossesLife=0;S.ecus=arb("m8")?Math.floor(oldE*.01):0;
  /* arbre Oméga : départ rapide, vétéran, mémoire de la tour */
  if(arb("t6")){S.lvl=50;S.pts=49*PTS_PER_LVL}if(arb("t1"))for(const k in oldAl)S.allies[k]=Math.floor(oldAl[k]*.1);if(arb("t2")){const b=Math.floor((oldTw.best||0)*.5);S.tower={best:b,cur:b+1}}
  const jl=Math.min(PROF_MAX,Math.max(1,Math.round(talV("t_metier"))));Object.values(S.jobs).forEach(j=>j.lvl=jl);
  S.hp=stats().maxHp;log(`Niveau Oméga ${S.prest} atteint : +${g} éclats Oméga. Une nouvelle vie commence.`,"g");toast(`Oméga ${S.prest} · +${g} éclats`);boot2();save();FX.omega(S.prest);
}

/* Profil : cadre (débloqué par paliers de succès, ou par un passage Oméga) et emblème (classe ou élément), état dans S.prof.
   Affichés sur la fiche du personnage, l'écran d'accueil et dans le classement (colonnes cadre et embleme). */
const CADRES=[["bois","Bois",0,["#5c3620","#c08348","#8f5a32"]],["cuivre","Cuivre",5,["#7a3a1a","#e89a5a","#b8693a"]],["argent","Argent",15,["#5a6676","#eef3f8","#a8b4c4"]],
  ["or","Or",30,["#7a4a06","#ffe27a","#d9941c"]],["givre","Givre",45,["#2a6a9a","#e6f8ff","#6ab8e8"]],["braise","Braise",60,["#6a1408","#ffc04a","#e2502c"]],
  ["omega","Oméga",-1,["#3a1a6a","#d8c0ff","#8a5ac8"]],["astral","Astral",76,["#0e0820","#fff2a8","#5a3aa0"]]];
const CADRE_ID=Object.fromEntries(CADRES.map(c=>[c[0],c]));
const cadreNeed=c=>c[2]<0?"Un passage Oméga":c[2]>=ACH.length?"Tous les succès":`${c[2]} succès`;
const cadreOk=(c,n=achN(),pr=S.prest||0)=>!!c&&(c[2]<0?pr>0:n>=Math.min(c[2],ACH.length));
const profS=()=>{const p=S.prof&&typeof S.prof==="object"?S.prof:(S.prof={c:"bois",e:"cls"});if(!cadreOk(CADRE_ID[p.c]))p.c="bois";if(!(p.e==="cls"||ELG[p.e]&&p.e!=="neutre"))p.e="cls";return p};
/* pastille de profil : cadre en pixels + emblème de classe ou d'élément */
function profBadge(c,e,cls,size=40){const C=(CADRE_ID[c]||CADRES[0])[3],k=CLASSES[cls]?cls:"guerrier",el=e&&e!=="cls"&&ELG[e]?e:null,col=el?ELEMS[el].c:CLASSES[k].col;
  return`<span class="pbadge pb-${c||"bois"}" style="--s:${size}px;--c1:${C[0]};--c2:${C[1]};--c3:${C[2]};--bg:${shade(col,-.55)};color:${col}" title="Cadre ${(CADRE_ID[c]||CADRES[0])[1]}"><svg viewBox="0 0 24 24" aria-hidden="true">${el?ELG[el]:EMB[k]}</svg></span>`}
const myBadge=(size)=>{const p=profS();return profBadge(p.c,p.e,S.cls,size)};
function profHTML(){const p=profS(),n=achN();
  return`<div class="sec"><h3>Cadre et emblème</h3><p class="small muted">Visibles sur votre fiche, sur l'écran d'accueil et dans le classement. De nouveaux cadres se débloquent avec les succès.</p>
  <div class="pframes">${CADRES.map(c=>{const ok=cadreOk(c,n);return`<button class="pfr${p.c===c[0]?" on":""}" data-a="pfC" data-k="${c[0]}" ${ok?"":"disabled"} title="${ok?"Choisir ce cadre":"Demande : "+cadreNeed(c)}">${profBadge(c[0],p.e,S.cls,44)}<b>${c[1]}</b><span class="small muted">${ok?(p.c===c[0]?"Choisi":"Disponible"):cadreNeed(c)}</span></button>`}).join("")}</div>
  <div class="pembs"><span class="small muted">Emblème</span>${[["cls",CLASSES[S.cls].name],["feu","Feu"],["eau","Eau"],["terre","Terre"],["air","Air"]].map(([k,t])=>`<button class="btn${p.e===k?" pri":""}" data-a="pfE" data-k="${k}">${t}</button>`).join("")}</div></div>`}
