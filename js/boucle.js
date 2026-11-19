/* Boucle de jeu (tick) : combat automatique, récolte, temps. */
/* ================= Boucle ================= */
let allyAcc=0,allyFT=0,clickAcc=0,autoSellT=0,ssMon=null;
const PLAYER_CPS_LIMIT=20,playerClickTimes=[];
function playerClickAllowed(){
  const now=performance.now();
  while(playerClickTimes.length&&now-playerClickTimes[0]>=1000)playerClickTimes.shift();
  if(playerClickTimes.length>=PLAYER_CPS_LIMIT)return false;
  playerClickTimes.push(now);
  return true;
}
function doClick(auto){if(!S.cls||!S.mon||S.ko>0)return;if(!auto){if(!playerClickAllowed())return;if(fx)FX.click();S.combo=Math.min(comboMax(),S.combo+1);S.comboT=1.5;inc("clicks");mx("maxCombo",Math.floor(S.combo))}let m=.6*clickMult()*(1+S.combo/50);if(Math.random()<talV("t_dore")/100){m*=10;if(fx)floatNum("Frappe dorée !","crit")}hitMon(roll(m,stats()),"click")}
function tick(dt){VIE.tick(dt);
  S.time+=dt;if(!S.cls)return;inc("time",dt);
  const st=stats();
  if(S.comboT>0)S.comboT-=dt;else if(S.combo>0)S.combo=Math.max(0,S.combo-dt*20*(1-talV("t_combo")/100));
  if(S.ko>0){S.ko-=dt;if(S.ko<=0){S.ko=0;S.hp=st.maxHp;nextMon()}}
  else{
    S.hp=Math.min(st.maxHp,S.hp+st.maxHp*st.regen*dt);
    if(S.mode==="boss"||S.mode==="tour"){S.timer-=dt;if(S.timer<=0){endMode(false,"temps écoulé")}}
    if(!S.mon){S.spawnT-=dt;if(S.spawnT<=0)nextMon()}
    else{
      S.atkT+=dt;while(S.mon&&S.atkT>=st.interval){S.atkT-=st.interval;hitMon(roll(1+S.combo/200,st),"auto");if(S.mon&&Math.random()<st.dbl)hitMon(roll(1+S.combo/200,st),"auto")}
      {const ad=allyDps();if(ad>0&&S.mon){const v=ad*dt;S.mon.hp-=v;inc("dmg",v);inc("allyDmg",v);allyAcc+=v;allyFT+=dt;if(allyFT>=1){if(fx&&allyAcc>=1){floatNum(fmt(allyAcc),"ally");FX.palAtk()}allyAcc=0;allyFT=0;if(up("allyel")&&EL_DOT[st.el])addDot(EL_DOT[st.el],1)}if(S.mon.hp<=0)kill()}}
      {const rate=S.opt.autoClick===false?0:(up("auto1")?2:0)+(up("auto2")?4:0);if(rate&&S.mon){clickAcc+=dt*rate;while(clickAcc>=1&&S.mon){clickAcc-=1;doClick(true)}}}
      S.dots=S.dots.filter(d=>d.until>S.time);S.dots.forEach(d=>{d.acc+=dt;while(d.acc>=1&&S.mon){d.acc-=1;hitMon(roll(d.m,st),"dot")}});
      /* compagnons empoisonneurs, puis dégâts des DoT élémentaires */
      if(S.mon){S.allyDotAcc=S.allyDotAcc||{};for(const id in ALLY_DOT){const l=S.allies[id]||0;if(!l)continue;const[k,r]=ALLY_DOT[id];S.allyDotAcc[k]=(S.allyDotAcc[k]||0)+r*dt;const n=Math.floor(S.allyDotAcc[k]);if(n>0){S.allyDotAcc[k]-=n;addDot(k,n)}}}
      dotTick(dt,st);
      /* esprits invoqués (Invocateur) : un coup par seconde chacun */
      if(S.summ&&S.summ.length&&S.mon){S.summ=S.summ.filter(x=>x.until>S.time);S.summAcc=(S.summAcc||0)+dt;if(S.summAcc>=1){S.summAcc-=1;const v=S.summ.reduce((a,x)=>a+x.m,0)*st.hit;if(v>0)hitMon({v:Math.round(v),crit:false,r:0},"summon")}}
      if(S.mon){S.monT+=dt;const mA=2*(1+(S.mdot&&S.mdot.gelure?S.mdot.gelure.n*DOTS.gelure.slow:0));if(S.monT>=mA){S.monT-=mA;
        if(Math.random()<st.dodge){if(fx){floatNum("Esquive","heal hurt");FX.dodge()}}
        else{const dmg=Math.max(1,Math.round(S.mon.atk*st.def*(arb("g1")?.9:1)*(.85+Math.random()*.3)));S.hp-=dmg;if(S.hp<=0&&arb("g7")&&ssMon!==S.mon){ssMon=S.mon;S.hp=1;log("Second souffle : vous tenez bon à 1 PV !","g")}if(fx){floatNum("-"+fmt(dmg),"hurt");FX.monAtk()}
          if(S.hp<=0){S.hp=0;S.ko=5;S.buffs=[];S.dots=[];inc("deaths");if(fx)FX.ko();if(S.mode!=="zone"){endMode(false,"K.O.")}else{log(`${MON[S.mon.id].name} vous a mis K.O. Essayez une zone plus facile ou améliorez votre équipement.`,"r");S.mon.hp=S.mon.max;if(S.opt.koRetreat&&S.zone>0){S.zone--;S.mon=null;drawZones();log(`Retour automatique : ${ZONES[S.zone].name}.`,"w")}}}}}}
      CLASSES[S.cls].spells.forEach((sp,i)=>{if(S.auto[sp.id]&&up("sp"+(i+1)))cast(sp,true)});
      /* Défi automatique (boutique) : boss lancé dès les 10 victoires ; 30 s d'attente après un échec */
      if(S.opt.autoFightBoss&&up("bossauto")&&S.mode==="zone"&&S.ko<=0&&bossReady(S.zone)&&S.time>=(S.bossAutoT||0))startMode("boss");
      /* Donjon automatique (boutique) : entre dans le donjon de la zone dès qu'on a sa clé ; le boss passe avant ; 30 s d'attente après un échec */
      /* Grimpeur : relance la tour 3 s après la fin ; Éclaireur : monde suivant dès que son boss est battu ; Messager : quêtes récupérées */
      if(up("tourauto")&&S.opt.autoTower&&S.mode==="zone"&&S.ko<=0&&S.towerAgainT&&S.time>=S.towerAgainT){S.towerAgainT=0;startMode("tour")}
      if(up("zoneauto")&&S.opt.autoZone&&S.mode==="zone"&&S.ko<=0&&S.time>=(S.zoneAutoT||0)){const n=S.zone+1;if(ZONES[n]&&(S.zoneBosses||{})[S.zone]&&S.lvl>=ZONES[n].lvl[0]){S.zoneAutoT=S.time+5;goZone(n);log(`Éclaireur : en route pour ${ZONES[n].name}.`,"g")}}
      if(up("qauto")&&S.opt.autoQuest&&S.q&&S.q.list)S.q.list.forEach((q,i)=>{if(q.done&&!q.claimed)claimQuest(i)});
      if(S.opt.autoDungeon&&up("dgauto")&&S.mode==="zone"&&S.ko<=0&&(S.res["cle_"+S.zone]||0)>0&&S.lvl>=ZONES[S.zone].lvl[0]&&S.time>=(S.dgAutoT||0)&&!(S.opt.autoFightBoss&&up("bossauto")&&bossReady(S.zone)))startMode("donjon",S.zone);
    }
  }
  S.buffs=S.buffs.filter(b=>b.until>S.time);
  if(S.ev){if(S.time>S.ev.until){log(`Fin de l'événement : ${EVENTS.find(e=>e.id===S.ev.id).n}.`);S.ev=null;S.evNext=S.time+EV_MIN+Math.random()*(EV_MAX-EV_MIN);drawWeather();dirty=true}
    else if(S.ev.id==="seisme"&&fx&&S.opt.shake&&!S.opt.reduceMotion&&Math.random()<dt/6){replayCls($("arena"),"shake")}}
  else if(S.time>=(S.evNext??90)&&!document.hidden)startEvent();
  S.mkT=(S.mkT||0)+dt;if(S.mkT>=MK_STEP){S.mkT=0;marketTick();if(S.tab==="market")dirty=true}
  if(S.potCd>0)S.potCd-=dt;else if(S.autoPot&&up("potauto")&&S.ko<=0&&S.hp<st.maxHp*S.opt.potThreshold/100){const id=S.res.p_gsoin>0&&S.hp<st.maxHp*.15?"p_gsoin":S.res.p_soin>0?"p_soin":S.res.p_gsoin>0?"p_gsoin":null;if(id){drink(id,true);S.potCd=3}}
  /* potions à effet cochées « Auto » : la suivante est bue dès que l'effet de la précédente se termine */
  if(up("potauto")&&S.ko<=0&&S.autoBuff)for(const id in S.autoBuff){const r=RES[id];if(S.autoBuff[id]&&r&&r.fx&&r.fx.k&&S.res[id]>0&&!S.buffs.some(b=>b.n===r.name))drink(id,true)}
  if(S.pk){if(S.time>S.pk.until){S.pk=null;drawPk();S.pkNext=S.time+(PK_MIN*.6+Math.random()*(PK_MAX-PK_MIN))*(up("aimant")?.7:1)*(1-talV("t_trefle")/100)}}
  else if(S.time>=(S.pkNext??20)&&S.ko<=0&&!document.hidden)spawnPk();
  if(S.job&&RES[S.job.r]){const r=RES[S.job.r],gt=gatherTime(r.prof,r.tier);S.job.t=Math.min(60,(+S.job.t||0)+dt);   /* plafond : une vieille sauvegarde avec un temps énorme ne fige plus le jeu */
    const k=Math.floor(S.job.t/gt);if(k>0){S.job.t-=k*gt;gainGatherN(r.prof,r.id,k)}}
  OUV.tick(dt);
  autoSellT+=dt;if(autoSellT>=1){autoSellT=0;autoSellFull()}
}
function offline(sec){
  if(!S.cls)return null;
  if(arb("t7"))sec*=2;   /* Maître du temps : le temps hors ligne compte double */
  const room=Math.max(0,bagCap()-bagWeight());
  sec=Math.min(Math.max(0,sec),room);
  S.afkWeight=sec;
  if(S.mode!=="zone"){S.mode="zone";S.dg=null;S.timer=0;S.mon=null}
  const sum={sec,xp:0,ecus:0,kills:0,res:{}},st=stats(),z=ZONES[S.zone];
  const lvl=Math.round((z.lvl[0]+Math.min(zoneTop(z),S.lvl+4))/2),ms=monsterStats(Math.max(z.lvl[0],lvl));
  const ef=z.mons.reduce((a,m)=>a+(1-monRes(m.el,st.el)/100),0)/z.mons.length,tk=ms.hp/(st.dps*ef+allyDps())+1.5,danger=ms.atk*st.def/2*tk>st.maxHp*1.5;
  const kills=danger?0:Math.floor(sec/tk*.5);
  if(kills>0){sum.kills=kills;sum.xp=Math.round(kills*ms.xp*st.xpM);sum.ecus=gainEcus(kills*ms.ecus*(1+(st.pros-1)/2));S.kills+=kills;
    const dr=Math.floor(kills*.35*st.pros);z.mons.filter(m=>!m.extra).forEach((m,i)=>{const n=Math.floor(dr/3)+(i<dr%3?1:0);if(n>0){const got=addRes(m.drop[0],n,true);if(got)sum.res[m.drop[1]]=(sum.res[m.drop[1]]||0)+got}});
    fx=false;gainXp(sum.xp);fx=true}
  if(S.job&&RES[S.job.r]){const r=RES[S.job.r],gt=gatherTime(r.prof,r.tier),t=sec+(+S.job.t||0),k=Math.min(20000,Math.floor(t/gt));   /* 20 000 récoltes max pendant l'absence, comme avant */
    S.job.t=Math.min(gt,t-k*gt);const tot=gainGatherN(r.prof,r.id,k,true);if(tot)sum.res[r.name]=(sum.res[r.name]||0)+tot}
  OUV.offline(sec*(arb("r4")?2:1),sum);
  if(arb("m10")){const g=Math.floor(S.ecus*.01*Math.min(24,sec/3600));if(g>0){S.ecus+=g;sum.ecus=(sum.ecus||0)+g}}   /* Intérêts */
  sum.danger=danger;return sum;
}

