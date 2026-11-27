/* Onglet Options (réglages, aide). */
let confirmReset=false;
let otab="aide",bkArm=-1;
const BK_WHY={auto:"automatique",import:"avant un import",restore:"avant une restauration",reset:"avant une nouvelle partie",manuel:"manuelle"};
function bkHTML(){const L=bkList();return`<div class="sec"><h3>Sauvegardes de secours</h3><p class="small muted">Une copie de votre partie est gardée toutes les 15 minutes dans ce navigateur, ainsi qu'avant un import ou une nouvelle partie. Les ${BK_MAX} plus récentes sont conservées.</p>
  ${L.length?`<div class="olist">${L.map((b,i)=>`<div class="orow"><div class="ol"><b>${new Date(b.t).toLocaleString("fr-FR",{dateStyle:"short",timeStyle:"short"})}</b><span>${esc(b.name||"")} · ${CLASSES[b.cls]?CLASSES[b.cls].name:""} niveau ${b.lvl}${b.prest?" · Ω "+b.prest:""} · ${BK_WHY[b.why]||b.why}${bkArm===i?`<br><b>Remplacer la partie actuelle par cette copie ?</b>`:""}</span></div><div class="oc">${bkArm===i?`<button class="btn dng" data-a="bkLoad" data-i="${i}">Oui, restaurer</button>`:`<button class="btn" data-a="bkLoad" data-i="${i}">Restaurer</button>`}</div></div>`).join("")}</div>`:`<p class="small muted">Aucune copie pour l'instant.</p>`}
  <div class="row"><button class="btn" data-a="bkNow">Créer une copie maintenant</button></div></div>`}
function applyOpts(){if(!S||!S.opt)return;const O=S.opt,de=document.documentElement;document.body.classList.toggle("kcaps",!!(O.keys&&O.keyCaps)&&!matchMedia("(hover: none) and (pointer: coarse)").matches);de.classList.toggle("rm",!!O.reduceMotion);["sombre","contraste"].forEach(t=>de.classList.toggle("th-"+t,O.theme===t));const app=$("app");if(app)app.style.zoom=O.textSize/100;
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
    ${sw("autoFightBoss","Combat automatique des boss","Lance automatiquement le boss dès que l'amélioration est achetée et que les 10 victoires sont obtenues.")}
    ${sw("autoClick","Clic automatique","Améliorations Clic automatique I et II. Frappe le monstre toute seule.")}
    ${sw("autoTower","Tour automatique","Amélioration Grimpeur. Relance la tour tant que vous gagnez (depuis 80 % du record). Une défaite ou un abandon coupe l'automatisme.")}
    ${sw("autoZone","Monde suivant automatique","Amélioration Éclaireur. Passe au monde suivant dès que son boss est battu et que vous avez le niveau.")}
    ${sw("autoQuest","Quêtes automatiques","Amélioration Messager. Récupère tout seul la récompense des quêtes terminées.")}
    ${sw("autoFortune","Potion de fortune en donjon","Amélioration Flasque de fortune. Boit une potion de fortune au début de chaque donjon, s'il vous en reste.")}
    ${sw("autoDungeon","Donjon automatique","Entre automatiquement dans le donjon de la zone dès que l'amélioration Explorateur est achetée et que vous avez sa clé.")}
    ${sw("autoSellFull","Vente automatique du surplus","Amélioration Colporteur. Vend périodiquement le surplus des ressources cochées « Vente auto » (Inventaire, en cliquant une ressource) au-dessus de la quantité « Garder toujours ». Jamais les clés ni les potions.")}
    ${sw("confirmPrest","Confirmation avant un passage Oméga","")}
    ${sw("pauseHidden","Pause quand l'onglet est caché","Sinon le jeu continue en arrière-plan.")}
    ${sw("offline","Gains hors ligne","Chasse et récolte pendant que la page est fermée, sur la durée de votre stockage AFK.")}
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
    ${seg("theme","Thème des panneaux","",[["parchemin","Parchemin"],["sombre","Sombre"],["contraste","Contraste"]])}
    ${rng("textSize","Taille de l'interface","",80,130,5)}
    ${seg("fps","Images par seconde","30 : animations un peu moins fluides, mais moins de calcul (batterie du téléphone).",[[60,"60"],[30,"30"]])}
    ${seg("numFmt","Format des nombres","Exemple : "+({short:"1,5 M",full:"1 500 000",sci:"1.50e6"})[O.numFmt],[["short","Abrégé"],["full","Complet"],["sci","Scientifique"]])}
    ${seg("dmgNums","Chiffres de dégâts","",[["all","Tous"],["crit","Critiques et soins"],["none","Aucun"]])}
    ${seg("logLines","Journal de combat","",[[0,"Masqué"],[4,"4 lignes"],[8,"8"],[15,"15"]])}
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
  if(otab==="clavier"){const K=[["Espace|A","Frapper le monstre"],["1|2|3","Lancer les sorts"],["E","Attraper l'objet cliquable"],["S","Boire une potion de soin"],["B","Défier le boss"],["Échap","Quitter boss, donjon ou tour"],["P","Pause"],["C|I|V|G|U|Q","Personnage, Inventaire, Aventure, Compagnons, Boutique, Quêtes"],["M|R|L|F|T|K|O","Marché, Oméga, Collection, Atelier, Métiers, Classement, Options"]];
    h+=`<div class="sec"><h3>Clavier</h3><div class="olist">${sw("keys","Raccourcis clavier","À la forge, Espace frappe toujours.")}${sw("keyCaps","Afficher les touches sur les boutons","Une encoche à gauche des boutons rappelle leur touche (masquée sur écran tactile).")}</div><div class="keys">${K.map(([k,t])=>`<div><span>${k.split("|").map(x=>`<kbd>${x}</kbd>`).join(" ")}</span><span class="muted">${t}</span></div>`).join("")}</div></div>`}
  if(otab==="save"){let code="";try{code=encodeSave(S)}catch(e){}
    h+=`<div class="sec"><h3>Écran d'accueil</h3><p class="small muted">Revenir à l'écran de départ pour changer de compte ou commencer une nouvelle partie. La partie est enregistrée avant.</p><div class="row"><button class="btn" data-a="accHome">Écran d'accueil</button></div></div>`+COMPTE.html()+`<div class="sec"><h3>Sauvegarde automatique</h3><div class="olist">${seg("saveEvery","Fréquence","Enregistrée dans ce navigateur.",[[5,"5 s"],[10,"10 s"],[30,"30 s"],[60,"1 min"]])}<div class="orow"><div class="ol"><b>Enregistrer maintenant</b></div><div class="oc"><button class="btn pri" data-a="saveNow">Enregistrer</button></div></div></div></div>
    <div class="sec"><h3>Code cadeau</h3><p class="small muted">Entrez un code cadeau pour obtenir sa récompense.</p><div class="row"><input id="codeBox" type="text" placeholder="Votre code cadeau" autocomplete="off" spellcheck="false" style="flex:1;min-width:0"><button class="btn pri" data-a="code">Valider</button></div>${codeRes&&Date.now()-codeRes.at<20000?`<p class="codemsg ${codeRes.ok?"ok":"ko"}" id="codeMsg" role="status">${esc(codeRes.t)}</p>`:`<p class="codemsg" id="codeMsg" role="status" hidden></p>`}</div>
    <div class="sec"><h3>Exporter</h3><p class="small muted">Copiez ce code pour transférer votre partie ou la garder à l'abri.</p><textarea id="exportBox" readonly>${code}</textarea><div class="row"><button class="btn pri" data-a="copy">Copier le code</button></div></div>
    ${bkHTML()}<div class="sec"><h3>Importer</h3><textarea id="importBox" placeholder="Collez un code de sauvegarde ici"></textarea><div class="row"><button class="btn" data-a="import">Charger</button></div></div>
    <div class="sec"><h3>Réinitialiser</h3><div class="row"><button class="btn" data-a="optDefault">Réglages par défaut</button>${confirmReset?`<span class="small">Toute la progression sera effacée.</span><button class="btn dng" data-a="resetYes">Oui, tout effacer</button><button class="btn" data-a="resetNo">Annuler</button>`:`<button class="btn dng" data-a="reset">Nouvelle partie</button>`}</div></div>`}
  return h;
}

