/* Classement des joueurs qui ont un compte : table Supabase « classement » (une ligne par compte, lisible par les joueurs connectés).
   Chaque envoi de la partie (compte.js, push) met aussi à jour la ligne du joueur. Affiché dans l'onglet Classement et sur l'écran d'accueil. */
const RANG_CRIT=[["niv","Niveau","lvl.desc,prest.desc",r=>`niveau ${fmt(r.lvl)}${r.prest?" · Ω "+fmt(r.prest):""}`],
  ["ecl","Éclats Oméga","souls_total.desc",r=>`${fmt(r.souls_total)} éclats`],["tour","Tour","tour.desc",r=>`étage ${fmt(r.tour)}`],["deg","Puissance","degats.desc",r=>`${fmt(r.degats)} dégâts`]];
const RANG_N=50,RANG_AGE=60;
const RANG=(()=>{
  const C={};let crit="niv",sentAt=0,noProf=false;   /* noProf : colonnes cadre/embleme absentes sur le serveur */
  const mine=()=>({pseudo:COMPTE.pseudo(),cls:S.cls,lvl:S.lvl||1,prest:S.prest||0,souls_total:S.soulsTotal||0,tour:(S.tower&&S.tower.best)||0,degats:(()=>{const h=stats().hit;return isFinite(h)?Math.round(h):0})()});
  const errTxt=e=>/classement|PGRST205|42P01|does not exist|schema cache/i.test(JSON.stringify(e||""))?"Le classement n'est pas encore activé sur le serveur.":"Impossible de charger le classement. Vérifiez votre connexion.";
  const redraw=()=>{if(typeof ACC_OPEN!=="undefined"&&ACC_OPEN)ACCUEIL.render();else if(S&&S.cls&&S.tab==="rank")renderPanel(true)};
  /* envoie la ligne du joueur (appelé après chaque sauvegarde en ligne) :
     passe par la fonction RPC sécurisée sync_classement (qui lit saves côté serveur) avec repli sur /rest/v1/classement si la migration SQL n'est pas encore appliquée */
  async function send(){if(!COMPTE.logged()||!S||!S.cls)return;const m=mine(),r=Object.assign({user_id:COMPTE.uid()},m),p=typeof profS==="function"?profS():null;
    const post=b=>COMPTE.call("/rest/v1/classement?on_conflict=user_id",{method:"POST",headers:{Prefer:"resolution=merge-duplicates"},body:JSON.stringify(b)});
    try{
      await COMPTE.call("/rest/v1/rpc/sync_classement",{method:"POST",body:JSON.stringify({p_degats:m.degats})});
      if(p&&!noProf){try{await post(Object.assign({cadre:p.c,embleme:p.e},r))}catch(e){if(/cadre|embleme|PGRST204|42703/i.test(JSON.stringify(e||"")))noProf=true}}
      sentAt=Date.now();return;
    }catch(e){
      if(!/PGRST202|sync_classement|42883/i.test(JSON.stringify(e||"")))throw e;
    }
    if(p&&!noProf){try{await post(Object.assign({cadre:p.c,embleme:p.e},r));sentAt=Date.now();return}catch(e){if(!/cadre|embleme|PGRST204|42703/i.test(JSON.stringify(e||"")))throw e;noProf=true}}
    await post(r);sentAt=Date.now()}
  async function load(k){const c=C[k]=C[k]||{rows:null,at:0,err:"",busy:false};if(c.busy)return;c.busy=true;
    try{if(S&&S.cls&&Date.now()-sentAt>RANG_AGE*1000)await send().catch(()=>{});
      const o=RANG_CRIT.find(x=>x[0]===k),q=`order=${o[2]}&limit=${RANG_N}`,F="user_id,pseudo,cls,lvl,prest,souls_total,tour,degats";
      c.rows=await COMPTE.call(`/rest/v1/classement?select=${F}${noProf?"":",cadre,embleme"}&${q}`).catch(e=>{if(noProf||!/cadre|embleme|42703/i.test(JSON.stringify(e||"")))throw e;noProf=true;return COMPTE.call(`/rest/v1/classement?select=${F}&${q}`)})||[];c.err="";
      /* hors du top : place exacte en lisant seulement l'ordre des comptes */
      c.me=null;const uid=COMPTE.uid();if(uid&&!c.rows.some(r=>r.user_id===uid)){const all=await COMPTE.call(`/rest/v1/classement?select=user_id&order=${o[2]}&limit=100000`)||[];const i=all.findIndex(r=>r.user_id===uid);c.me=i>=0?{pos:i+1,tot:all.length}:{pos:0,tot:all.length}}}
    catch(e){c.err=errTxt(e)}c.at=Date.now();c.busy=false;redraw()}
  /* données du critère k (rechargées si plus vieilles que RANG_AGE secondes) */
  function get(k){const c=C[k];if(COMPTE.logged()&&(!c||!c.busy&&Date.now()-c.at>RANG_AGE*1000))load(k);return C[k]||{rows:null,err:"",busy:true}}
  const row=(r,i,o,me)=>`<tr class="${me?"rkme":""}"><td class="num rkpos">${i<3?`<span class="rkm rk${i+1}">${i+1}</span>`:i+1}</td><td class="rkn">${typeof profBadge==="function"?profBadge(r.cadre||"bois",r.embleme||"cls",r.cls,22):""}${esc(r.pseudo||"?")}${me?" <span class=\"small\">(vous)</span>":""}</td><td class="small muted">${(CLASSES[r.cls]||{}).name||""}</td><td class="r num">${o[3](r)}</td></tr>`;
  function table(k,n){const o=RANG_CRIT.find(x=>x[0]===k),c=get(k),uid=COMPTE.uid();
    if(c.err)return`<p class="small muted">${c.err}</p>`;if(!c.rows)return`<p class="small muted">Chargement du classement…</p>`;
    if(!c.rows.length)return`<p class="small muted">Personne n'est encore classé : soyez le premier !</p>`;
    const L=c.rows.slice(0,n),i=c.rows.findIndex(r=>r.user_id===uid);
    let h=`<div class="tw"><table class="rktab"><tbody>${L.map((r,j)=>row(r,j,o,r.user_id===uid)).join("")}</tbody></table></div>`;
    if(i>=n)h+=`<p class="small rkyou">Vous êtes <b>${i+1}<sup>e</sup></b> · ${o[3](c.rows[i])}</p>`;
    else if(i<0&&S&&S.cls)h+=`<p class="small rkyou">${c.me&&c.me.pos?`Vous êtes <b>${c.me.pos}<sup>e</sup></b> sur ${fmt(c.me.tot)}`:`Vous : hors du top ${RANG_N}`} · ${o[3](mine())}</p>`;return h}
  return{send,get,table,
    get crit(){return crit},set crit(k){crit=k},
    /* onglet Classement */
    html(){if(!COMPTE.on()||!COMPTE.logged())return`<div class="sec"><h3>Classement</h3><p class="small muted">Le classement est réservé aux joueurs qui ont un compte. Créez un compte ou connectez-vous : votre partie actuelle est gardée et vous apparaîtrez dans le classement.</p>${COMPTE.formHtml(false)}</div>`;
      const c=C[crit]||{};return`<div class="sec"><div class="osub">${RANG_CRIT.map(([k,n])=>`<button class="${crit===k?"on":""}" data-a="rkTab" data-t="${k}">${n}</button>`).join("")}</div>
        ${table(crit,RANG_N)}<div class="row" style="justify-content:space-between;align-items:center;margin-top:8px"><span class="small muted">Comptes uniquement · mis à jour à chaque sauvegarde en ligne${c.at?" · actualisé "+(Date.now()-c.at<5000?"à l'instant":`il y a ${Math.floor((Date.now()-c.at)/1000)} s`):""}</span><button class="btn" data-a="rkRefresh">Actualiser</button></div></div>`},
    /* encadré de l'écran d'accueil (connecté seulement) */
    board(){if(!COMPTE.on()||!COMPTE.logged())return"";
      return`<div class="accrank"><h3 class="acctitle">Classement</h3><div class="acctabs rktabs" role="tablist">${RANG_CRIT.map(([k,n])=>`<button role="tab" aria-selected="${crit===k}" class="${crit===k?"on":""}" data-a="rkTab" data-t="${k}">${n}</button>`).join("")}</div>${table(crit,10)}</div>`},
    act(a,b){if(a==="rkTab"){crit=b.dataset.t;redraw()}else if(a==="rkRefresh"){if(C[crit])C[crit].at=0;get(crit);redraw()}}};
})();
