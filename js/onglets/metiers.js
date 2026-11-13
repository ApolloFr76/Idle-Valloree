/* Onglet Métiers. */
let mtab=null;
function pMetiers(){
  if(!mtab||!PROFS[mtab])mtab=S.job?RES[S.job.r].prof:"bucheron";
  const p=PROFS[mtab],J=S.jobs[mtab],cur=S.job?RES[S.job.r]:null;
  const tiers=pid=>Math.max(0,UNLOCK.filter(u=>u<=S.jobs[pid].lvl).length-1);
  return`<div class="sec"><p class="small muted">Un seul métier à la fois. La récolte continue pendant les combats et quand la page est fermée (8 h max).</p>
  <div class="mprofs">${Object.entries(PROFS).map(([pid,q])=>{const j=S.jobs[pid],act=cur&&cur.prof===pid;
    return`<button class="mprof${pid===mtab?" on":""}${act?" act":""}" data-a="mtab" data-p="${pid}">${PX.img(PX.res(pid,tiers(pid)),"mpi")}<span class="mpn"><b>${q.name}</b><span class="num">Niv. ${j.lvl}${j.lvl>=PROF_MAX?" · max":""}</span></span><span class="bar gp"><i style="width:${j.lvl<PROF_MAX?j.xp/pxNeed(j.lvl)*100:100}%"></i></span>${act?`<span class="mact">en cours</span>`:""}</button>`}).join("")}</div>
  <div class="mcur">${cur?`${PX.img(PX.res(cur.prof,cur.tier),"mci")}<div style="min-width:0;flex:1"><b>${PROFS[cur.prof].verb} : ${cur.name}</b><div class="small muted num">${gatherTime(cur.prof,cur.tier).toFixed(1)} s par récolte · stock ${fmt(S.res[cur.id]||0)}</div></div><button class="btn dng" data-a="job" data-r="${cur.id}">Arrêter</button>`:`<span class="small muted">Aucune récolte en cours. Choisissez une ressource ci-dessous.</span>`}</div>
  <div class="prof"><div class="ph"><h3>${p.name}</h3>${(()=>{const cd=mgCdLeft(mtab);return`<button class="btn pri mgbtn" data-a="mgStart" data-p="${mtab}" ${cd?"disabled":""}>Mini-jeu : ${MG_INFO[mtab].n}${cd?` · ${cd} s`:""}</button>`})()}${mtab==="pecheur"?`<button class="btn" data-a="fishDex">Poissonnédia · ${fishN()}/${FISH.length}</button>`:""}<span class="small muted num">Niv. ${J.lvl}${J.lvl<PROF_MAX?` · ${fmt(J.xp)}/${fmt(pxNeed(J.lvl))} XP`:" · max"}</span></div><div class="bar gp"><i style="width:${J.lvl<PROF_MAX?J.xp/pxNeed(J.lvl)*100:100}%"></i></div>
  <div class="mres">`+p.res.map(([rid,name],t)=>{const lock=J.lvl<UNLOCK[t],on=S.job&&S.job.r===rid;
      return`<button class="mr${on?" on":""}${lock?" lck":""}" data-a="job" data-r="${rid}" data-tip="r:${rid}" ${lock?"disabled":""}>${PX.img(PX.res(mtab,t),"mri")}<b>${name}</b><span class="small num">${lock?`Niveau ${UNLOCK[t]}`:`${gatherTime(mtab,t).toFixed(1)} s`}</span>${lock?"":`<span class="mq num">${fmt(S.res[rid]||0)}</span>`}${on?`<span class="bar gp"><i id="gp-${rid}" style="width:${S.job&&S.job.r===rid?Math.min(100,S.job.t/gatherTime(RES[rid].prof,RES[rid].tier)*100):0}%"></i></span>`:""}</button>`}).join("")+`</div>
  <div class="small muted">Cliquez sur une ressource pour ${p.verb.toLowerCase()} ; recliquez pour arrêter. Le nombre en haut à droite est votre stock.</div></div></div>`;
}
