/* Démarrage : chargement de la sauvegarde, grand écran, lancement des boucles. */
/* ================= Démarrage ================= */
let lastT=performance.now(),lastPanel=0,lastAch=0,lastSave=Date.now(),paused=false,started=false;

/* Colonne de droite : objectifs et journal, plus les statistiques en direct sur grand écran.
   Les potions restent dans la barre d'action du monde (index.html). */
const WIDE=matchMedia("(min-width:1500px) and (min-height:650px)");
function placeSide(){const side=$("sideCard"),w=WIDE.matches;
  if(!$("lstats")){const d=document.createElement("div");d.id="lstats";d.className="lstats";side.insertBefore(d,$("log"))}$("lstats").hidden=!w;
  if(S&&S.log)renderLog()}
WIDE.addEventListener?WIDE.addEventListener("change",placeSide):WIDE.addListener(placeSide);
placeSide();
let sceneOn=false;
function boot2(){if(!S.sess)sessStart();placeSide();VIE.init();if(!sceneOn){sceneOn=true;SCENE.init();MONDE.init()}fuseTrophies();mbSig="";potSig="";drawWeather();drawPk();drawHero();drawZones();if(!S.mon)spawn();else drawMonster();drawSpells();renderLog();dirty=true;renderPanel();live()}
/* Retour après une absence de sec secondes : bilan de la session terminée (absence d'au moins 5 min), gains hors ligne,
   puis nouvelle session. Renvoie le résumé à montrer (showOffline) ou null. */
const AFK_POPUP_MIN=300;
function comeBack(sec){const end=sec>=SESS_GAP,rec=end?sessRecap():null,sum=S.opt.offline&&sec>0?offline(sec):null;if(end)sessStart();
  if(!sum&&!rec)return null;const s=sum||{sec,rawSec:sec,kills:0,res:{},none:1};s.rec=rec;return s}
const comeShow=s=>!!s&&(s.rawSec??s.sec)>=AFK_POPUP_MIN&&(s.kills>0||Object.keys(s.res).length>0||!!s.rec);
function settleAfk(){
  if(!S||!S.cls||!S.afkSince)return null;
  const sec=Math.max(0,(Date.now()-S.afkSince)/1000);
  const sum=comeBack(sec);
  S.afkSince=0;
  lastT=performance.now();
  save();
  return sum;
}
function beginAfk(){if(S&&S.cls&&!S.afkSince&&!(S.opt&&S.opt.pauseHidden))S.afkSince=Date.now()}
function loop(){
  const now=performance.now();
  if(!S||!S.cls||document.hidden){lastT=now;return}
  let dt=(now-lastT)/1000;lastT=now;
  if(paused)dt=0;
  if(dt>120){const s=comeBack(dt);if(s){boot2();if(comeShow(s))showOffline(s)}}
  else if(dt>0){fx=dt<1;const steps=Math.min(600,Math.ceil(dt/.2));for(let i=0;i<steps;i++)tick(dt/steps);fx=true}
  live();if(now-lastAch>1000){lastAch=now;checkAch();ensureQuests();checkTips();liveStats();histTick()}
  if(dirty&&now-lastPanel>600){lastPanel=now;renderPanel()}
}
function start(data){
  if(started)return;started=true;
  S=(data&&data.S)||load()||fresh();
  /* Nouvel arbre Oméga : les anciennes parties avant l'arbre repartent de zéro, avec une copie conservée et un avertissement explicite */
  {let raw={};try{raw=JSON.parse(localStorage.getItem(SAVE_KEY)||"{}")||{}}catch(e){}
   if(raw.cls&&raw.rz!==2){try{localStorage.setItem(OLD_TREE_BACKUP,localStorage.getItem(SAVE_KEY));localStorage.setItem(MIG_RZ2_NOTICE_KEY,JSON.stringify({name:raw.name||"Aventurier",lvl:raw.lvl||1,cls:raw.cls,at:Date.now()}))}catch(e){}
     resetRun({keepOpts:true,keepName:true});
     setTimeout(()=>log("Nouvel arbre Oméga : votre ancienne sauvegarde a été archivée et une nouvelle aventure commence.","g"),600)}}
  S.zoneBosses=S.zoneBosses||{};for(let i=0;i<S.zone;i++)S.zoneBosses[i]=1;
  if(S.cls&&OLD_CLS[S.cls]){S.cls=OLD_CLS[S.cls];let r=0;for(const k in S.alloc)r+=S.alloc[k]||0;S.pts+=r;S.alloc=fresh().alloc;S.cds={};S.auto={};S.buffs=[];S.dots=[];
    setTimeout(()=>{log("Nouveau système d'éléments : votre classe a été convertie et vos points vous ont été rendus.","g");toast("Vos points de caractéristiques vous ont été rendus")},300)}
  /* migrations de la sauvegarde (MIG dans etat.js) : sorts et ventes automatiques devenus payants, etc. */
  migrate(S);
  Object.values(S.jobs||{}).forEach(j=>{if(j.lvl>PROF_MAX){j.lvl=PROF_MAX;j.xp=0}});
  ALLOC.forEach(k=>{if(S.alloc[k]==null)S.alloc[k]=0});
  Object.keys(PROFS).forEach(pid=>{if(!S.jobs[pid])S.jobs[pid]={lvl:1,xp:0}});if(!Array.isArray(S.workers))S.workers=[];
  if(!S.seen){S.seen={};Object.keys(S.res||{}).forEach(k=>{if(S.res[k]>0)S.seen[k]=1});(S.items||[]).forEach(i=>S.seen[i.id]=1)}
  /* premier lancement : on suit le réglage « réduire les animations » du système (le joueur peut le changer dans Options) */
  if(S.opt.reduceMotion==null&&matchMedia("(prefers-reduced-motion: reduce)").matches){S.opt.reduceMotion=true;S.opt.shake=false}
  S.opt=fixOpts(S.opt);applyOpts();checkUnlocks(true);
  /* écran d'accueil d'abord : le jeu (temps hors ligne, boucles) ne démarre qu'en le quittant */
  ACCUEIL.open(()=>{
  if(!S.cls){if(!sceneOn){sceneOn=true;SCENE.init();MONDE.init()}MONDE.zone(ZONES[S.zone||0].id);showCreate();}
  else{const away=Math.max(0,(Date.now()-(S.afkSince||S.last||Date.now()))/1000),sum=comeBack(away);S.afkSince=0;boot2();save();if(comeShow(sum))showOffline(sum)}
  lastT=performance.now();setInterval(loop,100);setInterval(()=>{if(Date.now()-lastSave>=(S.opt?.saveEvery||10)*1000){lastSave=Date.now();save()}},1000);
  });
}
start();
