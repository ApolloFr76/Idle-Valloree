/* Écrans : création du personnage, retour hors ligne. */
/* --- Écrans --- */
let pick="guerrier";
function showCreate(){
  const o=$("ov");o.hidden=false;
  o.innerHTML=`<div class="ovc"><div><h2>Les Terres de Vallorée</h2><p class="muted">Choisissez votre classe. Votre élément (Feu, Eau, Terre, Air) dépendra des points que vous y investirez.</p></div>
  <div class="classes">${Object.entries(CLASSES).map(([k,c])=>`<button class="cls${k===pick?" on":""}" data-a="pick" data-k="${k}">${heroSVG(k)}<h3>${c.name}</h3><span class="small muted">${c.desc}</span><ul>${c.spells.map(s=>`<li>${s.name} (niv. ${s.lvl}) : ${s.txt}</li>`).join("")}</ul></button>`).join("")}</div>
  <div class="row"><input type="text" id="heroName" maxlength="20" value="${esc(S.name||"Aventurier")}" aria-label="Nom du personnage"><button class="btn pri" data-a="start" style="padding:9px 16px;font-size:14px">Commencer l'aventure</button></div></div>`;
}
/* Lignes en plus du résumé d'absence : niveaux, métiers, quêtes, ventes automatiques. */
function offExtra(s){const L=[];if(s.lvl&&s.lvl[1]>s.lvl[0])L.push(`Niveau <b class="num">${s.lvl[0]}</b> → <b class="num">${s.lvl[1]}</b>`);
  (s.jobs||[]).forEach(([k,a,b])=>L.push(`${PROFS[k]?PROFS[k].name:k} : niveau ${a} → ${b}`));
  if(s.qNew>0)L.push(`${s.qNew} quête${s.qNew>1?"s":""} du jour terminée${s.qNew>1?"s":""} (récompense dans l'onglet Quêtes)`);
  if(s.sold&&s.sold.n)L.push(`Vente automatique : ${fmt(s.sold.n)} ressources, <span style="color:var(--gold)">+${fmt(s.sold.g)} écus</span>`);
  return L.length?`<ul class="offx small">${L.map(x=>`<li>${x}</li>`).join("")}</ul>`:""}
/* ---------- Récapitulatif de session ----------
   Une session = le jeu ouvert sans absence de plus de SESS_GAP secondes. S.sess garde l'état au début de la session ;
   au retour, sessRecap() compare avec l'état au moment du départ (avant les gains hors ligne). */
const SESS_GAP=300;
function sessSnap(){const T=S.st||{};return{t0:Date.now(),play:T.time||0,lvl:S.lvl,prest:S.prest||0,kills:S.kills||0,xp:T.xp||0,ecus:T.ecus||0,dmg:T.dmg||0,
  bosses:T.bosses||0,dungeons:T.dungeons||0,quests:T.quests||0,crafts:T.crafts||0,fish:T.fish||0,shinies:T.shinies||0,maxHit:T.maxHit||0,maxCombo:T.maxCombo||0,tower:S.tower&&S.tower.best||0,ach:Object.keys(S.ach||{}).length}}
function sessStart(){if(S&&S.cls)S.sess=sessSnap()}
/* bilan de la session qui vient de se terminer (null si elle a duré moins d'une minute de jeu) */
function sessRecap(){const a=S.sess;if(!a||!S.cls)return null;const b=sessSnap(),play=b.play-a.play;if(play<60)return null;
  const d=k=>Math.max(0,(b[k]||0)-(a[k]||0)),rec=[];
  if(b.maxHit>a.maxHit&&a.maxHit>0)rec.push(`plus gros coup ${fmt(b.maxHit)}`);if(b.maxCombo>a.maxCombo&&a.maxCombo>0)rec.push(`combo de ${fmt(b.maxCombo)}`);
  if(b.tower>a.tower)rec.push(`étage ${fmt(b.tower)} de la tour`);
  return{play,lvl:[a.lvl,b.lvl],prest:d("prest"),kills:d("kills"),xp:d("xp"),ecus:d("ecus"),dmg:d("dmg"),bosses:d("bosses"),dungeons:d("dungeons"),quests:d("quests"),crafts:d("crafts"),fish:d("fish"),shinies:d("shinies"),ach:d("ach"),rec}}
const sessDur=t=>{t=Math.round(t);const h=Math.floor(t/3600),m=Math.floor(t%3600/60);return h?`${h} h ${m} min`:m?`${m} min`:`${t} s`};
function sessHTML(r){if(!r)return"";
  const L=[["Temps de jeu",sessDur(r.play)],r.prest?["Passages Oméga","+"+r.prest]:r.lvl[1]>r.lvl[0]?["Niveau",`${r.lvl[0]} → ${r.lvl[1]}`]:null,["Monstres vaincus",fmt(r.kills)],["XP gagnée",fmt(r.xp)],["Écus gagnés",fmt(r.ecus)],["Dégâts infligés",fmt(r.dmg)],
    r.bosses?["Boss vaincus",fmt(r.bosses)]:null,r.dungeons?["Donjons terminés",fmt(r.dungeons)]:null,r.quests?["Quêtes terminées",fmt(r.quests)]:null,r.crafts?["Objets fabriqués",fmt(r.crafts)]:null,
    r.fish?["Poissons pêchés",fmt(r.fish)]:null,r.shinies?["Monstres brillants",fmt(r.shinies)]:null,r.ach?["Succès débloqués",fmt(r.ach)]:null].filter(Boolean);
  return`<div class="sessrec"><h3>Votre dernière session</h3><div class="statgrid">${L.map(([a,b])=>`<div><span class="muted">${a}</span><b>${b}</b></div>`).join("")}</div>
    ${r.rec.length?`<p class="small sessbest"><b>Nouveaux records :</b> ${r.rec.join(" · ")}</p>`:""}</div>`}
function showOffline(s){
  const h=Math.floor(s.sec/3600),m=Math.floor(s.sec%3600/60),sec=Math.round(s.sec%60),res=Object.entries(s.res);
  const o=$("ov");o.hidden=false;
  o.innerHTML=`<div class="ovc" style="max-width:${s.rec?520:460}px"><h2>${s.none?"Bon retour !":"Pendant votre absence"}</h2><p class="muted">${h?h+" h ":""}${m||h?m+" min ":sec+" s "}de farm AFK${s.capped&&!s.none?` (limite AFK : ${dur(s.cap)})`:""}${s.doubled?" · Maître du temps ×2":""}.</p>
  ${s.kills?`<p><b class="num">${fmt(s.kills)}</b> monstres vaincus · <span style="color:var(--xp)">+${fmt(s.xp)} XP</span> · <span style="color:var(--gold)">+${fmt(s.ecus)} écus</span></p>`:s.danger?`<p class="small muted">La zone choisie était trop dangereuse pour chasser seul.</p>`:""}
  ${res.length?`<p class="small">${res.map(([n,q])=>`${fmt(q)}× ${n}`).join(" · ")}</p>`:""}${offExtra(s)}${sessHTML(s.rec)}
  <div class="row"><button class="btn pri" data-a="closeOv">Continuer</button></div></div>`;
}

