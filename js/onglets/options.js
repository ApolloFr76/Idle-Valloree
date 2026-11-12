/* Onglet Options (réglages, aide). */
let confirmReset=false;
let otab="aide";
function applyOpts(){if(!S||!S.opt)return;const O=S.opt;document.documentElement.classList.toggle("rm",!!O.reduceMotion);const app=$("app");if(app)app.style.zoom=O.textSize/100;
  const h=$("hint");if(h)h.hidden=!O.showHint;setVol();if(AC)musicSync();if($("weather"))drawWeather();if($("log")&&S.log)renderLog();potSig=""}
const optFmt=(k,v)=>(v=Number.isFinite(+v)?v:OPT_DEF[k],0)||k.startsWith("vol")?Math.round(v*100)+" %":k==="textSize"||k==="potThreshold"?v+" %":k==="forgeSpeed"?"×"+v:v;
function pOpts(){
  const O=S.opt;
  const sw=(k,t,d)=>`<div class="orow"><div class="ol"><b>${t}</b>${d?`<span>${d}</span>`:""}</div><div class="oc"><label class="sw"><input type="checkbox" data-opt="${k}" id="opt_${k}" ${O[k]?"checked":""} aria-label="${t}"><i></i></label></div></div>`;
  const seg=(k,t,d,ch)=>`<div class="orow"><div class="ol"><b>${t}</b>${d?`<span>${d}</span>`:""}</div><div class="oc"><div class="seg" role="group" aria-label="${t}">${ch.map(([v,n])=>`<button class="${String(O[k])===String(v)?"on":""}" data-a="optSet" data-k="${k}" data-v="${v}">${n}</button>`).join("")}</div></div></div>`;
  const rng=(k,t,d,mn,mxv,st)=>`<div class="orow"><div class="ol"><b>${t}</b>${d?`<span>${d}</span>`:""}</div><div class="oc"><input type="range" data-opt="${k}" id="opt_${k}" min="${mn}" max="${mxv}" step="${st}" value="${O[k]}" aria-label="${t}"><span class="oval" id="ov_${k}">${optFmt(k,O[k])}</span></div></div>`;
  const T=[["aide","Aide"],["jeu","Jeu"],["aff","Affichage"],["son","Son"],["notif","Notifications"],["clavier","Clavier"],["save","Sauvegarde"]];
  let h=`<div class="otabs">${T.map(([k,n])=>`<button class="otab${otab===k?" on":""}" data-a="otab" data-t="${k}">${n}</button>`).join("")}</div>`;
  if(otab==="jeu")h+=`<div class="sec"><h3>Forge</h3><div class="olist">
    ${sw("forgeQte","Mini-jeu de forge","Désactivé : fabrication immédiate avec les chances de base (75 % commun, 20 % rare, 5 % épique, jamais légendaire).")}
    ${seg("forgeSpeed","Vitesse du curseur","",[[.7,"Lente"],[1,"Normale"],[1.3,"Rapide"]])}
  </div></div><div class="sec"><h3>Combat et automatismes</h3><div class="olist">
    ${rng("potThreshold","Seuil des potions automatiques","Boire une potion de soin sous ce seuil de PV (si l'option est cochée sous les sorts).",10,70,5)}
    ${sw("koRetreat","Reculer d'une zone après un K.O.","Évite d'enchaîner les K.O. pendant votre absence.")}
    ${sw("autoSellFull","Vente automatique quand le sac est plein","Vend la plus grosse pile de ressources, jamais les clés ni les potions.")}
    ${sw("confirmPrest","Confirmation avant un passage Oméga","")}
    ${sw("pauseHidden","Pause quand l'onglet est caché","Sinon le jeu continue en arrière-plan.")}
    ${sw("offline","Gains hors ligne","Chasse et récolte pendant que la page est fermée, jusqu'à 8 h.")}
  </div></div>`;
  if(otab==="aide")h+=`<div class="sec"><h3>Aide</h3><div class="olist">
    <div class="orow"><div class="ol"><b>Visite guidée</b><span>Présentation de tout l'écran en ${TUTO.length} étapes.</span></div><div class="oc"><button class="btn pri" data-a="tutoReplay">Revoir la visite</button></div></div>
    ${sw("goals","Panneau « Prochains objectifs »","Toujours visible sous les sorts : prochains déblocages, achats et fabrications.")}
    ${seg("goalsN","Nombre d'objectifs affichés","",[[3,"3"],[4,"4"],[6,"6"]])}
    ${sw("tips","Conseils « Nouveau ! »","Une petite carte explique chaque fonction au moment où elle se débloque.")}
    <div class="orow"><div class="ol"><b>Revoir tous les conseils</b><span>Les conseils déjà vus réapparaîtront.</span></div><div class="oc"><button class="btn" data-a="tipsReset">Réinitialiser</button></div></div>
  </div></div>
  <div class="sec"><h3>Explication des onglets</h3><div class="olist">${Object.keys(TAB_LOCK).map(t=>`<div class="orow"><div class="ol"><b>${tabOpen(t)?tabName(t):"Onglet verrouillé"}</b><span>${tabOpen(t)?UNL_TXT[t]:`Se débloque au niveau ${TAB_LOCK[t]}.`}</span></div><div class="oc"><button class="btn" data-a="unlReplay" data-t="${t}" ${tabOpen(t)?"":"disabled"}>Revoir</button></div></div>`).join("")}</div></div>`;
  if(otab==="aff")h+=`<div class="sec"><h3>Affichage</h3><div class="olist">
    ${rng("textSize","Taille de l'interface","",80,130,5)}
    ${seg("numFmt","Format des nombres","Exemple : "+({short:"1,5 M",full:"1 500 000",sci:"1.50e6"})[O.numFmt],[["short","Abrégé"],["full","Complet"],["sci","Scientifique"]])}
    ${seg("dmgNums","Chiffres de dégâts","",[["all","Tous"],["crit","Critiques et soins"],["none","Aucun"]])}
    ${seg("logLines","Journal de combat","",[[0,"Masqué"],[4,"4 lignes"],[8,"8"],[15,"15"]])}
    ${sw("ambiance","Ambiance animée","Particules du biome derrière l'interface : feuilles, neige, braises, bulles…")}
    ${sw("weatherFx","Effets de météo","L'événement reste actif même sans l'effet visuel.")}
    ${sw("shake","Secousses de l'arène","")}
    ${sw("reduceMotion","Réduire les animations","Coupe toutes les animations et transitions.")}
    ${sw("showHint","Aide sous l'arène","")}
  </div></div>`;
  if(otab==="son")h+=`<div class="sec"><h3>Son</h3><div class="olist">
    ${rng("vol","Volume général","",0,1,.05)}
    ${sw("sfx","Effets sonores","")}${rng("volSfx","Volume des effets","",0,1,.05)}
    ${sw("hitSfx","Son de chaque coup","Coupez-le si les clics rapides deviennent fatigants.")}
    ${sw("music","Musique d'ambiance","")}${rng("volMusic","Volume de la musique","",0,1,.05)}
  </div><p class="small muted">Les sons démarrent au premier clic dans le jeu.</p></div>`;
  if(otab==="notif")h+=`<div class="sec"><h3>Notifications</h3><div class="olist">
    ${seg("toasts","Bulles en bas de l'écran","Importantes : niveaux, succès, boss, quêtes, trophées, événements, objets épiques.",[["all","Toutes"],["important","Importantes"],["none","Aucune"]])}
    ${sw("logKills","Victoires dans le journal","")}
    ${sw("logLoot","Victoires avec butin","Désactivé : le journal ne garde que les victoires sans butin.")}
    ${sw("logQuests","Quêtes terminées dans le journal","")}
  </div></div>
  <div class="sec"><h3>Événements</h3><p class="small muted">Toutes les 4 à 8 minutes, pendant 2 minutes :</p>${EVENTS.map(e=>`<div class="small"><b style="color:${e.c}">${e.n}</b> · ${e.txt}</div>`).join("")}</div>`;
  if(otab==="clavier"){const K=[["Espace|A","Frapper le monstre"],["1|2|3","Lancer les sorts"],["E","Attraper l'objet cliquable"],["S","Boire une potion de soin"],["B","Défier le boss"],["Échap","Quitter boss, donjon ou tour"],["P","Pause"],["C|I|V|F|O","Personnage, Inventaire, Aventure, Forge, Options"]];
    h+=`<div class="sec"><h3>Clavier</h3><div class="olist">${sw("keys","Raccourcis clavier","À la forge, Espace frappe toujours.")}</div><div class="keys">${K.map(([k,t])=>`<div><span>${k.split("|").map(x=>`<kbd>${x}</kbd>`).join(" ")}</span><span class="muted">${t}</span></div>`).join("")}</div></div>`}
  if(otab==="save"){let code="";try{code=btoa(unescape(encodeURIComponent(JSON.stringify(S))))}catch(e){}
    h+=`<div class="sec"><h3>Sauvegarde automatique</h3><div class="olist">${seg("saveEvery","Fréquence","Enregistrée dans ce navigateur.",[[5,"5 s"],[10,"10 s"],[30,"30 s"],[60,"1 min"]])}<div class="orow"><div class="ol"><b>Enregistrer maintenant</b></div><div class="oc"><button class="btn pri" data-a="saveNow">Enregistrer</button></div></div></div></div>
    <div class="sec"><h3>Exporter</h3><p class="small muted">Copiez ce code pour transférer votre partie ou la garder à l'abri.</p><textarea id="exportBox" readonly>${code}</textarea><div class="row"><button class="btn pri" data-a="copy">Copier le code</button></div></div>
    <div class="sec"><h3>Importer</h3><textarea id="importBox" placeholder="Collez un code de sauvegarde ici"></textarea><div class="row"><button class="btn" data-a="import">Charger</button></div></div>
    <div class="sec"><h3>Réinitialiser</h3><div class="row"><button class="btn" data-a="optDefault">Réglages par défaut</button>${confirmReset?`<span class="small">Toute la progression sera effacée.</span><button class="btn dng" data-a="resetYes">Oui, tout effacer</button><button class="btn" data-a="resetNo">Annuler</button>`:`<button class="btn dng" data-a="reset">Nouvelle partie</button>`}</div></div>`}
  return h;
}

