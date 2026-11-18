/* Compte en ligne (pseudo + mot de passe) : sauvegarde dans le navigateur ET en ligne, via Supabase.
   Le site reste 100 % statique (GitHub Pages) : le jeu parle directement à l'API Supabase avec fetch, sans bibliothèque.
   Le mot de passe n'est jamais stocké par le jeu : Supabase le chiffre ; le jeu garde seulement un jeton de session.
   Tant que SUPA.url / SUPA.key sont vides, les comptes sont masqués et le jeu marche comme avant. */
const SUPA={url:"https://rnhpijbqenpnxnulfgyu.supabase.co",key:"sb_publishable_ObErez9O4g8TiGqsClH8vw_5phhmuAK"};  /* clé publique : sans danger, les règles de la table protègent les sauvegardes */
const ACC_KEY="vallore-compte-v1",ACC_BACKUP="vallore-save-avant-compte",ACC_EVERY=30;
const COMPTE=(()=>{
  let acc=null,busy=false,msg="",msgOk=false,lastPush=0,choice=null;
  try{acc=JSON.parse(localStorage.getItem(ACC_KEY)||"null")}catch(e){acc=null}
  const on=()=>!!(SUPA.url&&SUPA.key),logged=()=>!!(acc&&acc.at&&acc.uid);
  const keep=()=>{try{acc?localStorage.setItem(ACC_KEY,JSON.stringify(acc)):localStorage.removeItem(ACC_KEY)}catch(e){}};
  const say=(t,ok)=>{msg=t;msgOk=!!ok;const L=document.querySelectorAll(".accMsg");L.forEach(m=>{m.textContent=t;m.className="small accMsg "+(ok?"accok":"accko")});if(!L.length&&t)toast(t,1)};
  const rp=()=>{if(typeof ACC_OPEN!=="undefined"&&ACC_OPEN)ACCUEIL.render();else if(S&&S.cls&&S.tab==="opts")renderPanel(true)};
  const mail=p=>p.toLowerCase()+"@joueurs.idle-valloree.app";
  const okPseudo=p=>/^[A-Za-z0-9_-]{3,20}$/.test(p);
  const errTxt=j=>{const m=((j&&(j.msg||j.error_description||j.message||j.error))||"")+"";
    if(/already|registered|exists/i.test(m))return"Ce pseudo est déjà pris.";if(/invalid login|credentials/i.test(m))return"Pseudo ou mot de passe incorrect.";
    if(/password/i.test(m))return"Mot de passe trop faible (6 caractères minimum).";if(/rate|too many/i.test(m))return"Trop d'essais, réessayez dans quelques minutes.";
    return m?"Erreur du serveur : "+m:"Impossible de joindre le serveur. Vérifiez votre connexion."};
  async function api(path,opt={},auth){const h=Object.assign({apikey:SUPA.key,"Content-Type":"application/json"},opt.headers||{});
    if(auth){await fresh_();if(!logged())throw{msg:"Session expirée, reconnectez-vous."};h.Authorization="Bearer "+acc.at}
    const r=await fetch(SUPA.url.replace(/\/$/,"")+path,Object.assign({},opt,{headers:h}));const t=await r.text();let j=null;try{j=t?JSON.parse(t):null}catch(e){}
    if(!r.ok)throw j||{msg:"HTTP "+r.status};return j}
  function setSession(j,pseudo){acc={pseudo:pseudo||(acc&&acc.pseudo)||"",uid:j.user.id,at:j.access_token,rt:j.refresh_token,exp:Date.now()+((j.expires_in||3600)-120)*1000,syncAt:acc&&acc.uid===j.user.id?acc.syncAt:null};keep()}
  async function fresh_(){if(!acc||!acc.rt||Date.now()<acc.exp)return;
    try{const j=await api("/auth/v1/token?grant_type=refresh_token",{method:"POST",body:JSON.stringify({refresh_token:acc.rt})});setSession(j)}
    catch(e){acc=null;keep();say("Session expirée, reconnectez-vous.");rp();throw e}}
  /* sauvegarde en ligne : une ligne par compte dans la table « saves » */
  async function remote(){const r=await api(`/rest/v1/saves?user_id=eq.${acc.uid}&select=data,updated_at`,{},true);return r&&r[0]||null}
  async function push(force){if(!logged()||!S||!S.cls)return false;
    if(!force){const r=await api(`/rest/v1/saves?user_id=eq.${acc.uid}&select=updated_at`,{},true);const u=r&&r[0]&&r[0].updated_at;
      if(u&&acc.syncAt&&new Date(u)>new Date(acc.syncAt)){const full=await remote();if(full&&!mine(full)){ask(full);return false}}}  /* une autre machine a sauvegardé entre-temps */
    save();acc.myLast=S.last;const r=await api("/rest/v1/saves?on_conflict=user_id",{method:"POST",headers:{Prefer:"resolution=merge-duplicates,return=representation"},body:JSON.stringify({user_id:acc.uid,pseudo:acc.pseudo,data:JSON.stringify(S)})},true);
    acc.syncAt=(r&&r[0]&&r[0].updated_at)||new Date().toISOString();keep();lastPush=Date.now();return true}
  /* partie envoyée par ce navigateur (repérée par l'heure de sauvegarde S.last) */
  const mine=row=>{try{return JSON.parse(row.data).last===acc.myLast}catch(e){return false}};
  const sum=d=>{try{const o=JSON.parse(d);return o&&o.cls?`${(CLASSES[o.cls]||{}).name||o.cls} niveau ${fmt(o.lvl||1)}${o.prest?" · Ω "+o.prest:""}`:"aucun personnage"}catch(e){return"?"}};
  const when=t=>{if(!t)return"jamais";const s=(Date.now()-new Date(t))/1000;return s<60?"à l'instant":s<3600?`il y a ${Math.floor(s/60)} min`:s<86400?`il y a ${Math.floor(s/3600)} h`:new Date(t).toLocaleDateString("fr-FR")};
  /* choix quand la partie du compte et celle du navigateur diffèrent */
  function ask(row){choice=row;const o=$("ov");o.hidden=false;
    o.innerHTML=`<div class="ovc" style="max-width:520px"><h2>Quelle partie garder ?</h2><p class="muted">Votre compte <b>${esc(acc.pseudo)}</b> a une partie différente de celle de ce navigateur.</p>
    <div class="accchoix"><button class="btn pri" data-a="accUseRemote"><b>Partie du compte</b><span class="small">${sum(row.data)}<br>sauvegardée ${when(row.updated_at)}</span></button>
    <button class="btn" data-a="accUseLocal"><b>Partie de ce navigateur</b><span class="small">${S&&S.cls?sum(JSON.stringify({cls:S.cls,lvl:S.lvl,prest:S.prest})):"aucun personnage"}<br>elle remplacera celle du compte</span></button></div>
    <p class="small muted">L'autre partie est gardée de côté dans ce navigateur (copie de secours).</p></div>`}
  function useData(d,at){try{const cur=localStorage.getItem(SAVE_KEY);if(cur)localStorage.setItem(ACC_BACKUP,cur);localStorage.setItem(SAVE_KEY,d)}catch(e){say("Impossible d'écrire la sauvegarde dans ce navigateur.");return}
    acc.syncAt=at;keep();S=null;location.reload()}
  /* après connexion : pas de partie en ligne → on envoie celle-ci ; sinon on charge ou on demande */
  async function afterLogin(){const r=await remote();
    if(!r){if(S&&S.cls){await push(true);say("Connecté. Votre partie actuelle est maintenant sauvegardée en ligne.",1)}else say("Connecté. Créez votre personnage : il sera sauvegardé en ligne.",1);return}
    if(!S||!S.cls){useData(r.data,r.updated_at);return}
    if(mine(r)){acc.syncAt=r.updated_at;keep();return}
    ask(r)}
  async function auth(kind,box){if(busy)return;const ip=box&&box.querySelector(".accP"),iw=box&&box.querySelector(".accW"),p=((ip||{}).value||"").trim(),pw=(iw||{}).value||"";
    if(!okPseudo(p)){say("Pseudo : 3 à 20 caractères, lettres sans accent, chiffres, - ou _.");return}if(pw.length<6){say("Mot de passe : 6 caractères minimum.");return}
    const iw2=box&&box.querySelector(".accW2");if(kind==="create"&&iw2&&iw2.value!==pw){say("Les deux mots de passe ne sont pas identiques.");return}
    busy=true;say(kind==="create"?"Création du compte…":"Connexion…",1);
    try{const j=kind==="create"?await api("/auth/v1/signup",{method:"POST",body:JSON.stringify({email:mail(p),password:pw,data:{pseudo:p}})})
                               :await api("/auth/v1/token?grant_type=password",{method:"POST",body:JSON.stringify({email:mail(p),password:pw})});
      if(!j||!j.access_token){say("Compte créé mais la connexion est refusée : la confirmation par e-mail doit être désactivée dans Supabase.");return}
      acc=null;setSession(j,p);if(kind==="create"){await push(true);say(`Compte « ${p} » créé. Votre partie actuelle y est sauvegardée.`,1)}else await afterLogin();
      if(iw)iw.value="";}
    catch(e){if(kind==="create"&&acc){say("Compte créé, mais l'envoi de la partie a échoué : "+errTxt(e),0)}else{acc=null;keep();say(errTxt(e))}}
    finally{busy=false;rp()}}
  function formHtml(start){if(!on())return"";
    if(logged())return`<div class="accbox" id="accCreateBox"><span class="small">Connecté : <b>${esc(acc.pseudo)}</b></span></div>`;
    return`<div class="accbox" id="${start?"accCreateBox":"accBox"}"><div class="row accform"><input class="accP" type="text" maxlength="20" placeholder="Pseudo" autocomplete="username" spellcheck="false"><input class="accW" type="password" placeholder="Mot de passe" autocomplete="current-password">
      ${start?"":`<button class="btn pri" data-a="accCreate">Créer un compte</button>`}<button class="btn${start?" pri":""}" data-a="accLogin">Se connecter</button></div><div class="small accMsg ${msgOk?"accok":"accko"}">${esc(msg)}</div></div>`}
  return{on,logged,formHtml,pseudo:()=>acc&&acc.pseudo||"",clearMsg:()=>{msg=""},
    msgHtml:()=>`<div class="small accMsg ${msgOk?"accok":"accko"}" role="status">${esc(msg)}</div>`,
    /* le serveur répond-il ? (5 s maximum) */
    async ping(){try{const c=new AbortController();setTimeout(()=>c.abort(),5000);const r=await fetch(SUPA.url.replace(/\/$/,"")+"/auth/v1/health",{headers:{apikey:SUPA.key},signal:c.signal});return r.ok}catch(e){return false}},
    /* section de l'onglet Options > Sauvegarde */
    html(){if(!on())return`<div class="sec"><h3>Compte en ligne</h3><p class="small muted">Les comptes en ligne ne sont pas encore activés.</p></div>`;
      if(!logged())return`<div class="sec"><h3>Compte en ligne</h3><p class="small muted">Créez un compte pour retrouver votre partie sur n'importe quel ordinateur. Votre partie actuelle est gardée et envoyée sur le compte.</p>${formHtml(false)}</div>`;
      return`<div class="sec"><h3>Compte en ligne</h3><p class="small">Connecté : <b>${esc(acc.pseudo)}</b> · envoi automatique toutes les ${ACC_EVERY} s · dernier envoi : ${when(acc.syncAt)}</p>
        <div class="row"><button class="btn pri" data-a="accPush">Envoyer maintenant</button><button class="btn" data-a="accLogout">Se déconnecter</button></div><div class="small accMsg ${msgOk?"accok":"accko"}">${esc(msg)}</div></div>`},
    async act(a,btn){try{const box=btn&&btn.closest&&btn.closest(".accbox");
      if(a==="accCreate")await auth("create",box);else if(a==="accLogin")await auth("login",box);
      else if(a==="accLogout"){try{if(logged())await push(false)}catch(e){}acc=null;keep();say("Déconnecté. Votre partie reste dans ce navigateur.",1);rp()}
      else if(a==="accPush"){say("Envoi…",1);if(await push(false))say("Partie envoyée.",1);renderPanel(true)}
      else if(a==="accUseRemote"&&choice)useData(choice.data,choice.updated_at);
      else if(a==="accUseLocal"&&choice){try{localStorage.setItem(ACC_BACKUP,choice.data)}catch(e){}choice=null;$("ov").hidden=true;await push(true);say("Partie de ce navigateur envoyée sur le compte.",1);if(S.tab==="opts")renderPanel(true)}
    }catch(e){say(errTxt(e))}},
    /* au démarrage : si une autre machine a sauvegardé plus récemment, on propose de la charger ; puis envoi régulier */
    async init(){if(!on())return;
      setInterval(()=>{if(logged()&&!busy&&!choice&&Date.now()-lastPush>=ACC_EVERY*1000){lastPush=Date.now();push(false).catch(()=>{})}},5000);
      window.addEventListener("pagehide",()=>{if(!logged()||!S||!S.cls||choice||Date.now()>=acc.exp)return;acc.myLast=S.last;keep();
        try{fetch(SUPA.url.replace(/\/$/,"")+"/rest/v1/saves?on_conflict=user_id",{method:"POST",keepalive:true,headers:{apikey:SUPA.key,Authorization:"Bearer "+acc.at,"Content-Type":"application/json",Prefer:"resolution=merge-duplicates"},body:JSON.stringify({user_id:acc.uid,pseudo:acc.pseudo,data:JSON.stringify(S)})})}catch(e){}});
      if(!logged())return;lastPush=Date.now();
      try{const r=await remote();if(!r){await push(true);return}
        if(acc.syncAt&&new Date(r.updated_at)<=new Date(acc.syncAt))return;
        if(!S||!S.cls){useData(r.data,r.updated_at);return}
        if(mine(r)){acc.syncAt=r.updated_at;keep();return}
        ask(r)}catch(e){}}}
})();
window.addEventListener("load",()=>COMPTE.init());
