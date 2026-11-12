/* Succès et renaissance Oméga. */
/* ================= Succès et renaissance ================= */
function checkAch(){let n=0;ACH.forEach(a=>{if(!S.ach[a.id]&&a.get()>=a.v){S.ach[a.id]=1;n++;log(`Succès débloqué : <b>${a.n}</b> (${a.txt}).`,"g");if(fx){toast(`Succès : ${a.n} · +1 % dégâts et écus`);FX.ach(a.n)}}});if(n)dirty=true}
const clsCost=()=>5+5*(S.clsSwaps||0);
function doPrestige(){
  const g=soulsGain();if(g<=0)return;
  const keep={cls:S.cls,name:S.name,st:S.st,best:S.best,ach:S.ach,tower:{best:0,cur:1},souls:S.souls+g,soulsTotal:(S.soulsTotal||0)+g,prest:(S.prest||0)+1,tal:S.tal,unl:S.unl,tips:S.tips,tutoDone:S.tutoDone,pkN:S.pkN,kills:S.kills,uid:S.uid,log:[],tab:"prest",time:S.time,auto:S.auto,opt:S.opt,q:S.q,mk:S.mk,mkPrev:S.mkPrev,autoPot:S.autoPot};
  for(const k in keep)if(keep[k]===undefined)delete keep[k];
  S=Object.assign(fresh(),keep);S.st.bossesLife=0;S.ecus=Math.round(talV("t_depart"));
  const jl=Math.max(1,Math.round(talV("t_metier")));Object.values(S.jobs).forEach(j=>j.lvl=jl);
  S.hp=stats().maxHp;log(`Niveau Oméga ${S.prest} atteint : +${g} éclats Oméga. Une nouvelle vie commence.`,"g");toast(`Oméga ${S.prest} · +${g} éclats`);boot2();save();FX.omega(S.prest);
}

