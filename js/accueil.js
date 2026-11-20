/* Écran d'accueil (avant d'arriver dans le jeu) : panneau de bois sur le décor de la Prairie, héros à droite.
   Connecté : Reprendre, Nouvelle partie (avec confirmation), Se déconnecter. Pas connecté : onglets Invité / Connexion / Créer un compte.
   Le jeu ne démarre (boucles, temps hors ligne) qu'en quittant cet écran : demarrage.js appelle ACCUEIL.open(suite). */
let ACC_OPEN=false;
/* heure de la dernière sauvegarde, lue avant que le démarrage ne réenregistre la partie */
const ACC_LAST=(()=>{try{return(JSON.parse(localStorage.getItem(SAVE_KEY))||{}).last||0}catch(e){return 0}})();
const ACCUEIL=(()=>{
  let el=null,go=null,tab="inv",confirmNew=false,showPw=false,online=null,pinging=false;
  const ago=t=>{if(!t)return"";const s=(Date.now()-t)/1000;return s<60?"à l'instant":s<3600?`il y a ${Math.floor(s/60)} min`:s<86400?`il y a ${Math.floor(s/3600)} h`:`le ${new Date(t).toLocaleDateString("fr-FR")}`};
  const hasHero=()=>!!(S&&S.cls&&CLASSES[S.cls]);
  function saveBox(where){if(!hasHero())return`<div class="accsave"><div><b>Aucun héros pour l'instant</b><span>Choisissez une classe pour commencer.</span></div></div>`;
    return`<div class="accsave">${heroSVG(S.cls,typeof heroArm==="function"?heroArm():null)}<div><b>${esc(S.name||"Aventurier")} · ${CLASSES[S.cls].name} niveau ${fmt(S.lvl)}${S.prest?" · Ω "+S.prest:""}</b><span>${where} ${ago(ACC_LAST||S.last)}</span></div></div>`}
  const pw=(cls,ph,ac)=>`<div class="accin"><input class="${cls}" type="${showPw?"text":"password"}" placeholder="${ph}" autocomplete="${ac}"><button type="button" class="acceye" data-a="accEye">${showPw?"Cacher":"Afficher"}</button></div>`;
  const newBlock=()=>confirmNew?`<div class="accconf">Une nouvelle partie remplace ${COMPTE.logged()?"celle du compte":"celle de ce navigateur"} (${CLASSES[S.cls].name} niveau ${fmt(S.lvl)}). Une copie de secours est gardée dans ce navigateur.
      <div class="accrow"><button class="accsec" data-a="accNewYes">Oui, recommencer</button><button class="accsec" data-a="accNewNo">Annuler</button></div></div>`
    :`<div class="accrow"><button class="accsec" data-a="accNew">Nouvelle partie</button>${COMPTE.logged()&&online===false?`<button class="accsec" data-a="accRetry">Réessayer</button>`:""}</div>`;
  function migBlock(){
    let info=null,old=null;try{info=JSON.parse(localStorage.getItem(MIG_RZ2_NOTICE_KEY)||"null");old=localStorage.getItem(OLD_TREE_BACKUP)}catch(e){}
    if(!info)return"";
    return`<div class="accwarn" style="margin-bottom:8px"><b>Mise à jour de l'Arbre Oméga :</b> votre ancienne partie (${esc(info.name||"Aventurier")}, niveau ${fmt(info.lvl||1)}) a été archivée dans ce navigateur avant la remise à zéro.
      <div class="accrow" style="margin-top:6px">${old?`<button class="accsec" data-a="accExportOld">Exporter l'ancienne sauvegarde</button>`:""}<button class="accsec" data-a="accDismissMig">Compris</button></div></div>`;
  }
  function logged(){const off=online===false;let h=migBlock()+saveBox(off?"dernière sauvegarde":"sauvegardée");
    if(off)h+=`<div class="accwarn">Le serveur ne répond pas. Vous pouvez jouer hors ligne : la partie sera envoyée dès qu'il reviendra.</div>`;
    h+=`<button class="accgo full" data-a="accGo">${hasHero()?(off?"Jouer hors ligne":"Reprendre"):"Créer mon héros"}</button>`;if(hasHero())h+=newBlock();
    h+=`<div class="accrow accme"><span>Connecté : <b>${esc(COMPTE.pseudo())}</b></span><button class="acclink" data-a="accLogout">Se déconnecter</button></div>${COMPTE.msgHtml()}
      <div class="accdot${off?" off":online===null?" wait":""}"><i></i>${off?"Serveur injoignable":online===null?"Connexion au serveur…":"Synchronisé"}</div>`;return h}
  function guest(){const T=COMPTE.on()?[["inv","Invité"],["con","Connexion"],["cre","Créer un compte"],["rec","Secours"]]:[["inv","Invité"]];if(!T.some(t=>t[0]===tab))tab="inv";
    let h=migBlock()+(T.length>1?`<div class="acctabs" role="tablist">${T.map(([k,n])=>`<button role="tab" aria-selected="${tab===k}" class="${tab===k?"on":""}" data-a="accTab" data-t="${k}">${n}</button>`).join("")}</div>`:"");
    h+=`<div class="accbox">`;
    if(tab==="inv"){if(hasHero())h+=`<span class="acclbl">Votre partie d'invité</span>${saveBox("sauvegardée dans ce navigateur")}<button class="accgo full" data-a="accGo">Reprendre</button>${newBlock()}${COMPTE.on()?`<div class="accwarn">Cette partie n'existe que dans ce navigateur. Créez un compte pour la garder : elle y sera envoyée telle quelle.</div>`:""}`;
      else h+=`<label class="acclbl" for="accName">Nom de votre héros</label><div class="accfield"><div class="accin"><input id="accName" maxlength="20" value="${esc(S&&S.name||"Aventurier")}" autocomplete="off" spellcheck="false"></div><button class="accgo" data-a="accGo">Jouer</button></div><div class="acchint">Sans compte, la partie reste dans ce navigateur. Vous pourrez créer un compte plus tard sans rien perdre.</div>`}
    if(tab==="con")h+=`<label class="acclbl">Pseudo</label><div class="accin"><input class="accP" placeholder="Votre pseudo" autocomplete="username" spellcheck="false" maxlength="20"></div><label class="acclbl">Mot de passe</label>${pw("accW","••••••","current-password")}<button class="accgo full" data-a="accLogin">Se connecter</button><div class="accrow" style="justify-content:center;margin-top:4px"><button type="button" class="acclink" data-a="accTab" data-t="rec">Mot de passe oublié ? Utiliser mon code de secours</button></div>`;
    if(tab==="cre")h+=`<label class="acclbl">Pseudo</label><div class="accin"><input class="accP" placeholder="3 à 20 caractères" autocomplete="username" spellcheck="false" maxlength="20"></div><label class="acclbl">Mot de passe</label>${pw("accW","6 caractères minimum","new-password")}<label class="acclbl">Confirmer le mot de passe</label>${pw("accW2","Encore une fois","new-password")}<button class="accgo full" data-a="accCreate">Créer mon compte</button><div class="acchint">Un <b>code de secours</b> vous sera affiché à la création pour pouvoir réinitialiser votre mot de passe.</div>${hasHero()?`<div class="acchint">Votre partie actuelle (${CLASSES[S.cls].name} niveau ${fmt(S.lvl)}) sera gardée et envoyée sur le compte.</div>`:""}`;
    if(tab==="rec")h+=`<label class="acclbl">Pseudo</label><div class="accin"><input class="accP" placeholder="Votre pseudo" autocomplete="username" spellcheck="false" maxlength="20"></div><label class="acclbl">Code de secours</label><div class="accin"><input class="accRec" placeholder="VAL-XXXX-XXXX-XXXX" autocomplete="off" spellcheck="false" maxlength="24"></div><label class="acclbl">Nouveau mot de passe</label>${pw("accW","6 caractères minimum","new-password")}<label class="acclbl">Confirmer le mot de passe</label>${pw("accW2","Encore une fois","new-password")}<button class="accgo full" data-a="accRecover">Changer le mot de passe</button>`;
    h+=(tab==="inv"?"":COMPTE.msgHtml())+`</div>`;
    if(COMPTE.on())h+=`<div class="accdot"><i></i>Sauvegarde en ligne disponible</div>`;return h}
  function render(){if(!el)return;const keep={};el.querySelectorAll("input").forEach(i=>{keep[i.className||i.id]=i.value});const foc=document.activeElement&&el.contains(document.activeElement)?document.activeElement.className||document.activeElement.id:null;
    const L=COMPTE.logged(),k=hasHero()?S.cls:"guerrier";if(!L)online=null;else if(online===null&&!pinging)check();
    el.innerHTML=`<div class="accrib">Les Terres de Vallorée</div><div class="acchero">${heroSVG(k,hasHero()&&typeof heroArm==="function"?heroArm():null)}</div><div class="accbub">${L||hasHero()?(hasHero()?(L?"On y retourne ?":"On garde ma partie ?"):"Prêt pour l'aventure ?"):"Prêt pour l'aventure ?"}</div>
      <div class="accboard"><h2 class="acctitle">${L?`${S&&S.cls?myBadge(34):""}Bon retour, <span class="acchl">${esc(COMPTE.pseudo())}</span>`:`Rejoignez <span class="acchl">Vallorée</span>`}</h2>${L?logged():guest()}</div>${L?RANG.board():""}`;
    el.querySelectorAll("input").forEach(i=>{const v=keep[i.className||i.id];if(v!=null&&i.id!=="accName")i.value=v;else if(v!=null)i.value=v});
    if(foc){const f=el.querySelector("."+foc.split(" ")[0])||el.querySelector("#"+foc);if(f&&f.focus)f.focus()}}
  function check(){if(!COMPTE.on()||!COMPTE.logged()||pinging)return;online=null;pinging=true;COMPTE.ping().then(v=>{online=v;pinging=false;render()})}
  function close(){ACC_OPEN=false;if(el){el.remove();el=null}const f=go;go=null;if(f)f()}
  document.addEventListener("keydown",e=>{if(!ACC_OPEN||e.key!=="Enter"||!e.target.closest||!e.target.closest("#accueil input"))return;e.preventDefault();const b=e.target.closest(".accboard").querySelector(".accgo");if(b)b.click()});
  return{
    open(cb){go=cb;ACC_OPEN=true;tab="inv";confirmNew=false;el=document.createElement("div");el.id="accueil";el.className="accueil";document.body.appendChild(el);render()},
    render,get on(){return ACC_OPEN},
    act(a,b){
      if(a==="accTab"){tab=b.dataset.t;COMPTE.clearMsg();render();return}
      if(a==="accEye"){showPw=!showPw;render();return}
      if(a==="accNew"){confirmNew=true;render();return}if(a==="accNewNo"){confirmNew=false;render();return}
      if(a==="accRetry"){online=null;render();return}
      if(a==="accDismissMig"){try{localStorage.removeItem(MIG_RZ2_NOTICE_KEY)}catch(e){}render();return}
      if(a==="accExportOld"){try{const raw=localStorage.getItem(OLD_TREE_BACKUP);if(raw){const code=encodeSave(JSON.parse(raw));navigator.clipboard.writeText(code).then(()=>toast("Ancienne sauvegarde copiée dans le presse-papiers",1)).catch(()=>prompt("Copiez votre ancienne sauvegarde :",code))}}catch(e){}return}
      if(a==="accNewYes"){resetRun({keepOpts:true,keepName:true,backupKey:ACC_BACKUP});confirmNew=false;close();return}
      if(a==="accGo"){if(!hasHero()){const n=$("accName");if(n)S.name=(n.value||"Aventurier").trim().slice(0,20)||"Aventurier"}close();return}
      if(a==="accHome"){save();location.reload()}}};
})();
