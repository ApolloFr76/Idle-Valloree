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
function boot2(){placeSide();VIE.init();if(!sceneOn){sceneOn=true;SCENE.init();MONDE.init()}fuseTrophies();if(!S.optV2){S.optV2=1;S.opt.forgeQte=true}mbSig="";potSig="";drawWeather();drawPk();drawHero();drawZones();if(!S.mon)spawn();else drawMonster();drawSpells();renderLog();dirty=true;renderPanel();live()}
function loop(){
  const now=performance.now();let dt=(now-lastT)/1000;lastT=now;
  if(S&&S.cls){
    if(paused||(S.opt.pauseHidden&&document.hidden))dt=0;
    if(dt>120){if(S.opt.offline){const s=offline(dt);boot2();if(s&&(s.kills||Object.keys(s.res).length))showOffline(s)}}
    else if(dt>0){fx=!document.hidden&&dt<1;const steps=Math.min(600,Math.ceil(dt/.2));for(let i=0;i<steps;i++)tick(dt/steps);fx=true}
    live();if(now-lastAch>1000){lastAch=now;checkAch();ensureQuests();checkTips();liveStats()}
    if(dirty&&now-lastPanel>600){lastPanel=now;renderPanel()}
  }
}
function start(data){
  if(started)return;started=true;
  S=(data&&data.S)||load()||fresh();
  if(S.cls&&OLD_CLS[S.cls]){S.cls=OLD_CLS[S.cls];let r=0;for(const k in S.alloc)r+=S.alloc[k]||0;S.pts+=r;S.alloc=fresh().alloc;S.cds={};S.auto={};S.buffs=[];S.dots=[];
    setTimeout(()=>{log("Nouveau système d'éléments : votre classe a été convertie et vos points vous ont été rendus.","g");toast("Vos points de caractéristiques vous ont été rendus")},300)}
  ALLOC.forEach(k=>{if(S.alloc[k]==null)S.alloc[k]=0});
  Object.keys(PROFS).forEach(pid=>{if(!S.jobs[pid])S.jobs[pid]={lvl:1,xp:0}});if(!Array.isArray(S.workers))S.workers=[];
  if(!S.seen){S.seen={};Object.keys(S.res||{}).forEach(k=>{if(S.res[k]>0)S.seen[k]=1});(S.items||[]).forEach(i=>S.seen[i.id]=1)}
  S.opt=fixOpts(S.opt);applyOpts();checkUnlocks(true);
  if(!S.cls){showCreate();}
  else{const away=(Date.now()-(S.last||Date.now()))/1000;let sum=null;if(away>60&&S.opt.offline)sum=offline(away);boot2();if(sum&&(sum.kills||Object.keys(sum.res).length))showOffline(sum)}
  lastT=performance.now();setInterval(loop,100);setInterval(()=>{if(Date.now()-lastSave>=(S.opt?.saveEvery||10)*1000){lastSave=Date.now();save()}},1000);
}
window.claude?.hot?.snapshot?.(()=>({S}));
window.claude?.hot?.ready ? window.claude.hot.ready(start) : start(window.claude?.hot?.data ?? {});
