/* Classement des joueurs qui ont un compte : table Supabase « classement » (une ligne par compte, lisible par les joueurs connectés).
   Chaque envoi de la partie (compte.js, push) met aussi à jour la ligne du joueur. Affiché dans l'onglet Classement et sur l'écran d'accueil.
   Les catégories marquées v2 (écus, monstres, succès, métiers, temps, semaine, palmarès, records) demandent le script
   supabase/classement-lot6.sql : tant qu'il n'est pas lancé, elles restent masquées et l'ancien classement s'affiche. */
const RANG_CRIT=[
  /* [clé, libellé, tri PostgREST, texte de la valeur, valeur numérique, unité de l'écart, semaine ?, demande le lot 6 ?] */
  ["niv","Niveau","lvl.desc,prest.desc",r=>`niveau ${fmt(r.lvl)}${r.prest?" · Ω "+fmt(r.prest):""}`,r=>r.lvl,n=>`${fmt(n)} niveau${n>1?"x":""}`,0,0],
  ["ecl","Éclats Oméga","souls_total.desc",r=>`${fmt(r.souls_total)} éclats`,r=>r.souls_total,n=>`${fmt(n)} éclat${n>1?"s":""}`,0,0],
  ["tour","Tour","tour.desc",r=>`étage ${fmt(r.tour)}`,r=>r.tour,n=>`${fmt(n)} étage${n>1?"s":""}`,0,0],
  ["deg","Puissance","degats.desc",r=>`${fmt(r.degats)} dégâts/s`,r=>r.degats,n=>`${fmt(n)} dégâts/s`,0,0],
  ["ecus","Écus gagnés","ecus_total.desc",r=>`${fmt(r.ecus_total)} écus`,r=>r.ecus_total,n=>`${fmt(n)} écus`,0,1],
  ["kills","Monstres","kills.desc",r=>`${fmt(r.kills)} vaincus`,r=>r.kills,n=>`${fmt(n)} monstre${n>1?"s":""}`,0,1],
  ["succ","Succès","succes.desc,updated_at.asc",r=>`${fmt(r.succes)} succès`,r=>r.succes,n=>`${fmt(n)} succès`,0,1],
  ["met","Métiers","metiers.desc",r=>`${fmt(r.metiers)} niveaux`,r=>r.metiers,n=>`${fmt(n)} niveau${n>1?"x":""} de métier`,0,1],
  ["temps","Temps de jeu","temps.desc",r=>dur(r.temps||0),r=>r.temps,n=>dur(n),0,1],
  ["wlvl","Niveaux","sem_lvl.desc,updated_at.asc",r=>`+${fmt(r.sem_lvl)} niveau${r.sem_lvl>1?"x":""}`,r=>r.sem_lvl,n=>`${fmt(n)} niveau${n>1?"x":""}`,1,1],
  ["wtour","Étages","sem_tour.desc,updated_at.asc",r=>`+${fmt(r.sem_tour)} étage${r.sem_tour>1?"s":""}`,r=>r.sem_tour,n=>`${fmt(n)} étage${n>1?"s":""}`,1,1],
  ["wkills","Monstres","sem_kills.desc,updated_at.asc",r=>`+${fmt(r.sem_kills)} vaincus`,r=>r.sem_kills,n=>`${fmt(n)} monstre${n>1?"s":""}`,1,1]];
const RANG_N=50,RANG_AGE=60,RANG_POS_KEY="vallore-rang-pos-v1";
/* plafond des dégâts envoyés (entier exact en JavaScript, sous la borne du serveur) */
const RANG_DEG_MAX=9e15;
/* critères du palmarès hebdomadaire (classement_palmares.critere) */
const RANG_PAL={lvl:["wlvl","niveaux gagnés"],tour:["wtour","étages gagnés"],kills:["wkills","monstres vaincus"]};
/* lundi 0 h UTC de la semaine en cours (même calcul que date_trunc('week') côté serveur) */
const rangWeek=(t=Date.now())=>{const d=new Date(t),k=(d.getUTCDay()+6)%7;return new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()-k)).toISOString().slice(0,10)};
const RANG=(()=>{
  const C={};let crit="niv",view="gen",clsF="",open=null,inBoard=false,sentAt=0,noProf=false,sendErr="",v2=null,pal={rows:null,rec:null,at:0,busy:false};
  /* v2 : null = pas encore testé, false = colonnes du lot 6 absentes sur le serveur. noProf : colonnes cadre/embleme absentes. */
  const PREV={};   /* place au début de la session, par critère : sert aux flèches ▲ ▼ */
  const posStore=()=>{try{return JSON.parse(localStorage.getItem(RANG_POS_KEY)||"{}")||{}}catch(e){return{}}};
  const posSave=o=>{try{localStorage.setItem(RANG_POS_KEY,JSON.stringify(o))}catch(e){}};
  const crits=()=>RANG_CRIT.filter(c=>v2!==false||!c[7]);
  const critOf=k=>RANG_CRIT.find(x=>x[0]===k)||RANG_CRIT[0];
  const mine=()=>({pseudo:COMPTE.pseudo(),cls:S.cls,lvl:S.lvl||1,prest:S.prest||0,souls_total:S.soulsTotal||0,tour:(S.tower&&S.tower.best)||0,
    degats:(()=>{const h=stats().dps;return isFinite(h)?Math.max(0,Math.min(RANG_DEG_MAX,Math.round(h))):0})(),
    ecus_total:(S.st&&S.st.ecus)||0,kills:S.kills||0,succes:achN(),metiers:Object.values(S.jobs||{}).reduce((a,j)=>a+(j.lvl||0),0),temps:Math.round(S.time||0)});
  const errTxt=e=>/classement|PGRST205|42P01|does not exist|schema cache/i.test(JSON.stringify(e||""))?"Le classement n'est pas encore activé sur le serveur.":"Impossible de charger le classement. Vérifiez votre connexion.";
  const colErr=e=>/42703|PGRST204|column|ecus_total|sem_|succes|metiers|temps/i.test(JSON.stringify(e||""));
  const redraw=()=>{if(typeof ACC_OPEN!=="undefined"&&ACC_OPEN)ACCUEIL.render();else if(S&&S.cls&&S.tab==="rank")renderPanel(true)};
  /* envoie la ligne du joueur (appelé après chaque sauvegarde en ligne) :
     passe par la fonction RPC sécurisée sync_classement si elle existe, sinon écrit directement la ligne
     (le serveur relit alors les valeurs dans la sauvegarde en ligne, voir supabase/classement-lot6.sql) */
  async function send(){try{await send0();sendErr=""}catch(e){sendErr=String((e&&(e.message||e.msg))||JSON.stringify(e||"")).slice(0,160);throw e}}
  async function send0(){if(!COMPTE.logged()||!S||!S.cls)return;const m=mine(),p=typeof profS==="function"?profS():null;
    const r=Object.assign({user_id:COMPTE.uid()},{pseudo:m.pseudo,cls:m.cls,lvl:m.lvl,prest:m.prest,souls_total:m.souls_total,tour:m.tour,degats:m.degats});
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
  const F0="user_id,pseudo,cls,lvl,prest,souls_total,tour,degats,updated_at",F2=",ecus_total,kills,succes,metiers,temps,sem_debut,sem_lvl,sem_tour,sem_kills";
  /* lecture d'une liste du classement, avec repli si les colonnes du lot 6 ou cadre/embleme manquent */
  async function fetchRows(q){
    for(;;){const F=F0+(v2===false?"":F2)+(noProf?"":",cadre,embleme");
      try{const r=await COMPTE.call(`/rest/v1/classement?select=${F}&${q}`)||[];if(v2===null)v2=true;return r}
      catch(e){const s=JSON.stringify(e||"");if(!noProf&&/cadre|embleme/i.test(s)){noProf=true;continue}if(v2!==false&&colErr(e)){v2=false;return null}throw e}}}
  const keyOf=(k,cf=clsF)=>k+"|"+cf;
  async function load(k){const cf=clsF,K=keyOf(k,cf),c=C[K]=C[K]||{rows:null,at:0,err:"",busy:false};if(c.busy)return;c.busy=true;
    try{if(S&&S.cls&&Date.now()-sentAt>RANG_AGE*1000)await send().catch(()=>{});
      let o=critOf(k);const filt=()=>(o[6]?`&sem_debut=eq.${rangWeek()}`:"")+(cf?`&cls=eq.${encodeURIComponent(cf)}`:"");
      let rows=await fetchRows(`order=${o[2]}&limit=${RANG_N}${filt()}`);
      if(rows===null){/* lot 6 absent : retour aux catégories de base */if(o[7]){crit="niv";view="gen";o=critOf("niv")}rows=await fetchRows(`order=${o[2]}&limit=${RANG_N}${filt()}`)||[]}
      c.rows=rows;c.err="";
      /* hors du top : place exacte en lisant seulement l'ordre des comptes */
      c.me=null;const uid=COMPTE.uid();let pos=c.rows.findIndex(r=>r.user_id===uid)+1;
      if(uid&&!pos){const all=await COMPTE.call(`/rest/v1/classement?select=user_id&order=${o[2]}&limit=100000${filt()}`)||[];const i=all.findIndex(r=>r.user_id===uid);c.me=i>=0?{pos:i+1,tot:all.length}:{pos:0,tot:all.length};pos=i+1}
      /* flèche : comparée à la place enregistrée lors de la session précédente */
      if(pos){const st=posStore(),kk=keyOf(o[0],cf);if(!(kk in PREV))PREV[kk]=st[kk]||0;st[kk]=pos;posSave(st)}
      if(v2&&!pal.rows&&!pal.busy)loadPal()}
    catch(e){c.err=errTxt(e)}c.at=Date.now();c.busy=false;redraw()}
  /* palmarès des semaines et records du serveur (lot 6) */
  async function loadPal(){if(pal.busy)return;pal.busy=true;
    try{pal.rows=await COMPTE.call("/rest/v1/classement_palmares?select=semaine,critere,rang,user_id,pseudo,cls,valeur&order=semaine.desc,critere.asc,rang.asc&limit=120")||[];
      pal.rec=await COMPTE.call("/rest/v1/classement_records?select=cle,libelle,ordre,user_id,pseudo,cls,at&order=ordre.asc")||[];pal.err="";
      /* cadre Laurier : le joueur a déjà fini dans un top 3 de la semaine (le serveur le vérifie aussi) */
      const uid=COMPTE.uid(),n=pal.rows.filter(r=>r.user_id===uid).length;if(S&&S.cls&&n!==(S.champ|0)){S.champ=n;if(n&&typeof toast==="function")toast("Cadre Laurier débloqué : top 3 de la semaine !")}}
    catch(e){pal.err=errTxt(e);pal.rows=pal.rows||[];pal.rec=pal.rec||[]}pal.at=Date.now();pal.busy=false;redraw()}
  /* données du critère k (rechargées si plus vieilles que RANG_AGE secondes) */
  function get(k){const c=C[keyOf(k)];if(COMPTE.logged()&&(!c||!c.busy&&Date.now()-c.at>RANG_AGE*1000))load(k);return C[keyOf(k)]||{rows:null,err:"",busy:true}}
  const champN=uid=>pal.rows?pal.rows.filter(r=>r.user_id===uid).length:0;
  const ago=t=>{if(!t)return"jamais";const s=(Date.now()-Date.parse(t))/1000;return s<120?"à l'instant":s<3600?`il y a ${Math.floor(s/60)} min`:s<86400?`il y a ${Math.floor(s/3600)} h`:`il y a ${Math.floor(s/86400)} j`};
  const actCls=t=>{const s=(Date.now()-Date.parse(t||0))/1000;return s<86400?"rka-on":s<7*86400?"rka-mid":"rka-off"};
  const star=`<svg viewBox="0 0 7 7" aria-hidden="true"><path d="M3 0h1v2h3v1H5v1h1v3H5V6H2v1H1V4h1V3H0V2h3z"/></svg>`;
  const row=(r,i,o,me,arrow)=>{const n=champN(r.user_id);
    return`<tr class="${inBoard?"":"rkrow"}${me?" rkme":""}${!inBoard&&open===r.user_id?" rkopen":""}"${inBoard?"":` data-a="rkCard" data-u="${esc(r.user_id)}" title="Voir la fiche de ${esc(r.pseudo||"?")}"`}><td class="num rkpos">${i<3?`<span class="rkm rk${i+1}">${i+1}</span>`:i+1}${arrow||""}</td>
      <td class="rkn"><span class="rka ${actCls(r.updated_at)}" title="Actif ${ago(r.updated_at)}"></span>${typeof profBadge==="function"?profBadge(r.cadre||"bois",r.embleme||"cls",r.cls,22):""}${esc(r.pseudo||"?")}${n?`<span class="rkchamp" title="${n} place${n>1?"s":""} dans un top 3 de la semaine">${star}${n}</span>`:""}${me?" <span class=\"small\">(vous)</span>":""}</td>
      <td class="small muted rkcl">${(CLASSES[r.cls]||{}).name||""}</td><td class="r num">${o[3](r)}</td></tr>${!inBoard&&open===r.user_id?card(r):""}`};
  /* fiche d'un joueur (ligne dépliée sous son nom) */
  function card(r){const n=champN(r.user_id),rec=(pal.rec||[]).filter(x=>x.user_id===r.user_id),wk=r.sem_debut===rangWeek();
    const it=(l,v)=>`<div><span class="small muted">${l}</span><b class="num">${v}</b></div>`;
    return`<tr class="rkcardrow"><td colspan="4"><div class="rkcard">${typeof profBadge==="function"?profBadge(r.cadre||"bois",r.embleme||"cls",r.cls,48):""}
      <div class="rkch"><b>${esc(r.pseudo||"?")}</b><span class="small muted">${(CLASSES[r.cls]||{}).name||""} · actif ${ago(r.updated_at)}${n?` · ${n} place${n>1?"s":""} dans un top 3`:""}</span></div>
      <div class="rkgrid">${it("Niveau",fmt(r.lvl))}${it("Oméga",fmt(r.prest||0))}${it("Éclats",fmt(r.souls_total||0))}${it("Tour",`étage ${fmt(r.tour||0)}`)}${it("Puissance",`${fmt(r.degats||0)}/s`)}
      ${v2?it("Écus gagnés",fmt(r.ecus_total||0))+it("Monstres",fmt(r.kills||0))+it("Succès",fmt(r.succes||0))+it("Métiers",`${fmt(r.metiers||0)} niv.`)+it("Temps de jeu",dur(r.temps||0))+it("Cette semaine",wk?`+${fmt(r.sem_lvl)} niv. · +${fmt(r.sem_tour)} ét.`:"pas encore joué"):""}</div>
      ${rec.length?`<div class="rkrec small">${rec.map(x=>`<span>${star}${esc(x.libelle)}</span>`).join("")}</div>`:""}</div></td></tr>`}
  function table(k,n){const o=critOf(k),c=get(k),uid=COMPTE.uid();
    if(c.err)return`<p class="small muted">${c.err}</p>`;if(!c.rows)return`<p class="small muted">Chargement du classement…</p>`;
    if(!c.rows.length)return`<p class="small muted">${o[6]?"Personne n'a encore progressé cette semaine : à vous de jouer !":clsF?"Aucun joueur de cette classe pour l'instant.":"Personne n'est encore classé : soyez le premier !"}</p>`;
    const L=c.rows.slice(0,n),i=c.rows.findIndex(r=>r.user_id===uid),pos=i>=0?i+1:(c.me&&c.me.pos)||0,prev=PREV[keyOf(o[0])]||0;
    const arrow=prev&&pos&&prev!==pos?`<span class="rkar ${prev>pos?"up":"dn"}" title="Place à votre dernière visite : ${prev}">${prev>pos?"▲":"▼"}${Math.abs(prev-pos)}</span>`:"";
    let h=`<div class="tw"><table class="rktab"><tbody>${L.map((r,j)=>row(r,j,o,r.user_id===uid,r.user_id===uid?arrow:"")).join("")}</tbody></table></div>`;
    if(i>=n)h+=`<p class="small rkyou">Vous êtes <b>${i+1}<sup>e</sup></b>${arrow} · ${o[3](c.rows[i])}</p>`;
    else if(i<0&&S&&S.cls&&!o[6])h+=`<p class="small rkyou">${c.me&&c.me.pos?`Vous êtes <b>${c.me.pos}<sup>e</sup></b>${arrow} sur ${fmt(c.me.tot)}`:`Vous : hors du top ${RANG_N}`} · ${o[3](mine())}</p>`;
    /* écart avec le joueur juste au-dessus */
    if(i>0){const up=c.rows[i-1],d=Math.max(0,(+o[4](up)||0)-(+o[4](c.rows[i])||0))+1;h+=`<p class="small rkgap">Encore <b>${o[5](d)}</b> pour dépasser <b>${esc(up.pseudo||"?")}</b>.</p>`}
    else if(i===0&&c.rows[1]){const d=(+o[4](c.rows[0])||0)-(+o[4](c.rows[1])||0);h+=`<p class="small rkgap">Vous êtes en tête avec <b>${o[5](d)}</b> d'avance sur <b>${esc(c.rows[1].pseudo||"?")}</b>.</p>`}
    return h}
  /* palmarès (top 3 des semaines passées) et records du serveur */
  function palHTML(){if(!pal.rows){if(!pal.busy)loadPal();return`<p class="small muted">Chargement du palmarès…</p>`}
    if(pal.err)return`<p class="small muted">${pal.err}</p>`;
    const wks=[...new Set(pal.rows.map(r=>r.semaine))].slice(0,8),uid=COMPTE.uid();
    const who=r=>`${typeof profBadge==="function"?profBadge("bois","cls",r.cls,18):""}${esc(r.pseudo||"?")}${r.user_id===uid?" <span class=\"small\">(vous)</span>":""}`;
    const wTxt=s=>{const d=new Date(s+"T00:00:00Z");return`Semaine du ${d.toLocaleDateString("fr-FR",{day:"numeric",month:"long",timeZone:"UTC"})}`};
    return`<h4 class="rkh">Records du serveur</h4>${pal.rec.length?`<div class="tw"><table class="rktab rkrecs"><tbody>${pal.rec.map(x=>`<tr${x.user_id===uid?" class=\"rkme\"":""}><td>${star} ${esc(x.libelle)}</td><td class="rkn">${who(x)}</td><td class="r small muted">${new Date(x.at).toLocaleDateString("fr-FR")}</td></tr>`).join("")}</tbody></table></div>`:`<p class="small muted">Aucun record pour l'instant : le premier joueur à atteindre le niveau 100, l'étage 25 ou un passage Oméga y entrera.</p>`}
      <h4 class="rkh">Palmarès des semaines</h4><p class="small muted">Chaque lundi, le top 3 de la semaine écoulée (niveaux, étages, monstres) entre au palmarès et débloque le cadre <b>Laurier</b>.</p>
      ${wks.length?wks.map(w=>`<div class="rkweek"><b>${wTxt(w)}</b>${Object.entries(RANG_PAL).map(([k,[ck,l]])=>{const L=pal.rows.filter(r=>r.semaine===w&&r.critere===k);return L.length?`<div class="rkpal"><span class="small muted">${critOf(ck)[1]}</span>${L.map(r=>`<span class="rkpw${r.user_id===uid?" rkme":""}"><span class="rkm rk${r.rang}">${r.rang}</span>${who(r)} <span class="small muted num">${fmt(r.valeur)}</span></span>`).join("")}</div>`:""}).join("")}</div>`).join(""):`<p class="small muted">La première semaine n'est pas encore terminée.</p>`}`}
  const clsSel=()=>`<label class="rkfilt small"><span class="muted">Classe</span><select id="rkCls"><option value="">Toutes</option>${Object.entries(CLASSES).map(([k,c])=>`<option value="${k}"${clsF===k?" selected":""}>${c.name}</option>`).join("")}</select></label>`;
  return{send,get,table,
    get crit(){return crit},set crit(k){crit=k},
    /* onglet Classement */
    html(){if(!COMPTE.on()||!COMPTE.logged())return`<div class="sec"><h3>Classement</h3><p class="small muted">Le classement est réservé aux joueurs qui ont un compte. Créez un compte ou connectez-vous : votre partie actuelle est gardée et vous apparaîtrez dans le classement.</p>${COMPTE.formHtml(false)}</div>`;
      if(v2===false&&view!=="gen")view="gen";
      const views=[["gen","Général"],["sem","Cette semaine"],["pal","Palmarès et records"]].filter(v=>v[0]==="gen"||v2!==false);
      const L=crits().filter(c=>view==="sem"?c[6]:!c[6]);if(view!=="pal"&&!L.some(c=>c[0]===crit))crit=L[0][0];
      const c=C[keyOf(crit)]||{};
      const reset=view==="sem"?`<p class="small muted rksem">Ce qui a été gagné depuis lundi (remise à zéro chaque lundi à 0 h UTC, soit 1 h ou 2 h à Paris). Le top 3 entre au palmarès.</p>`:"";
      return`<div class="sec">${sendErr?`<p class="small rkyou">Votre ligne n'a pas pu être mise à jour (${esc(sendErr)}). Elle sera renvoyée à la prochaine sauvegarde en ligne.</p>`:""}
        ${views.length>1?`<div class="osub rkviews">${views.map(([k,n])=>`<button class="${view===k?"on":""}" data-a="rkView" data-t="${k}">${n}</button>`).join("")}</div>`:""}
        ${view==="pal"?palHTML():`<div class="rkbar"><div class="osub">${L.map(([k,n])=>`<button class="${crit===k?"on":""}" data-a="rkTab" data-t="${k}">${n}</button>`).join("")}</div>${clsSel()}</div>${reset}${table(crit,RANG_N)}`}
        <div class="row" style="justify-content:space-between;align-items:center;margin-top:8px"><span class="small muted">Comptes uniquement · cliquez sur un joueur pour voir sa fiche · point vert : actif ces dernières 24 h${c.at?" · actualisé "+(Date.now()-c.at<5000?"à l'instant":`il y a ${Math.floor((Date.now()-c.at)/1000)} s`):""}</span><button class="btn" data-a="rkRefresh">Actualiser</button></div></div>`},
    /* encadré de l'écran d'accueil (connecté seulement) : quelques catégories, sans filtre */
    board(){if(!COMPTE.on()||!COMPTE.logged())return"";const B=["niv","wlvl","tour","deg"].filter(k=>crits().some(c=>c[0]===k));if(!B.includes(crit))crit="niv";const keep=clsF;clsF="";inBoard=true;
      const h=`<div class="accrank"><h3 class="acctitle">Classement</h3><div class="acctabs rktabs" role="tablist">${B.map(k=>`<button role="tab" aria-selected="${crit===k}" class="${crit===k?"on":""}" data-a="rkTab" data-t="${k}">${k==="wlvl"?"Semaine":critOf(k)[1]}</button>`).join("")}</div>${table(crit,10)}</div>`;clsF=keep;inBoard=false;return h},
    act(a,b){if(a==="rkTab"){crit=b.dataset.t;open=null;redraw()}
      else if(a==="rkView"){view=b.dataset.t;open=null;if(view!=="pal"){const L=crits().filter(c=>view==="sem"?c[6]:!c[6]);if(!L.some(c=>c[0]===crit))crit=L[0][0]}redraw()}
      else if(a==="rkCard"){const u=b.dataset.u;open=open===u?null:u;redraw()}
      else if(a==="rkRefresh"){const c=C[keyOf(crit)];if(c)c.at=0;pal.rows=null;get(crit);if(view==="pal")loadPal();redraw()}},
    setCls(v){clsF=CLASSES[v]?v:"";open=null;redraw()}};
})();
