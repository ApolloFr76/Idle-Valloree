/* Boucle de jeu (tick) : combat automatique, récolte, temps. */
/* ================= Boucle ================= */
let allyAcc=0,allyFT=0,clickAcc=0;
function doClick(auto){if(!S.cls||!S.mon||S.ko>0)return;if(!auto){if(fx)FX.click();S.combo=Math.min(comboMax(),S.combo+1);S.comboT=1.5;inc("clicks");mx("maxCombo",Math.floor(S.combo))}let m=.6*clickMult()*(1+S.combo/50);if(Math.random()<talV("t_dore")/100){m*=10;if(fx)floatNum("Frappe dorée !","crit")}hitMon(roll(m,stats()),"click")}
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
      {const ad=allyDps();if(ad>0&&S.mon){const v=ad*dt;S.mon.hp-=v;inc("dmg",v);inc("allyDmg",v);allyAcc+=v;allyFT+=dt;if(allyFT>=1){if(fx&&allyAcc>=1){floatNum(fmt(allyAcc),"ally");FX.palAtk()}allyAcc=0;allyFT=0}if(S.mon.hp<=0)kill()}}
      {const rate=(up("auto1")?2:0)+(up("auto2")?4:0);if(rate&&S.mon){clickAcc+=dt*rate;while(clickAcc>=1&&S.mon){clickAcc-=1;doClick(true)}}}
      S.dots=S.dots.filter(d=>d.until>S.time);S.dots.forEach(d=>{d.acc+=dt;while(d.acc>=1&&S.mon){d.acc-=1;hitMon(roll(d.m,st),"dot")}});
      /* compagnons empoisonneurs, puis dégâts des DoT élémentaires */
      if(S.mon){S.allyDotAcc=S.allyDotAcc||{};for(const id in ALLY_DOT){const l=S.allies[id]||0;if(!l)continue;const[k,r]=ALLY_DOT[id];S.allyDotAcc[k]=(S.allyDotAcc[k]||0)+r*dt;const n=Math.floor(S.allyDotAcc[k]);if(n>0){S.allyDotAcc[k]-=n;addDot(k,n)}}}
      dotTick(dt,st);
      /* esprits invoqués (Invocateur) : un coup par seconde chacun */
      if(S.summ&&S.summ.length&&S.mon){S.summ=S.summ.filter(x=>x.until>S.time);S.summAcc=(S.summAcc||0)+dt;if(S.summAcc>=1){S.summAcc-=1;const v=S.summ.reduce((a,x)=>a+x.m,0)*st.hit;if(v>0)hitMon({v:Math.round(v),crit:false,r:0},"summon")}}
      if(S.mon){S.monT+=dt;const mA=2*(1+(S.mdot&&S.mdot.gelure?S.mdot.gelure.n*DOTS.gelure.slow:0));if(S.monT>=mA){S.monT-=mA;
        if(Math.random()<st.dodge){if(fx){floatNum("Esquive","heal hurt");FX.dodge()}}
        else{const dmg=Math.max(1,Math.round(S.mon.atk*st.def*(.85+Math.random()*.3)));S.hp-=dmg;if(fx){floatNum("-"+fmt(dmg),"hurt");FX.monAtk()}
          if(S.hp<=0){S.hp=0;S.ko=5;S.buffs=[];S.dots=[];inc("deaths");if(fx)FX.ko();if(S.mode!=="zone"){endMode(false,"K.O.")}else{log(`${MON[S.mon.id].name} vous a mis K.O. Essayez une zone plus facile ou améliorez votre équipement.`,"r");S.mon.hp=S.mon.max;if(S.opt.koRetreat&&S.zone>0){S.zone--;S.mon=null;drawZones();log(`Retour automatique : ${ZONES[S.zone].name}.`,"w")}}}}}}
      CLASSES[S.cls].spells.forEach(sp=>{if(S.auto[sp.id])cast(sp,true)});
    }
  }
  S.buffs=S.buffs.filter(b=>b.until>S.time);
  if(S.ev){if(S.time>S.ev.until){log(`Fin de l'événement : ${EVENTS.find(e=>e.id===S.ev.id).n}.`);S.ev=null;S.evNext=S.time+EV_MIN+Math.random()*(EV_MAX-EV_MIN);drawWeather();dirty=true}
    else if(S.ev.id==="seisme"&&fx&&S.opt.shake&&!S.opt.reduceMotion&&Math.random()<dt/6){replayCls($("arena"),"shake")}}
  else if(S.time>=(S.evNext??90)&&!document.hidden)startEvent();
  S.mkT=(S.mkT||0)+dt;if(S.mkT>=MK_STEP){S.mkT=0;marketTick();if(S.tab==="market")dirty=true}
  if(S.potCd>0)S.potCd-=dt;else if(S.autoPot&&S.ko<=0&&S.hp<st.maxHp*S.opt.potThreshold/100){const id=S.res.p_gsoin>0&&S.hp<st.maxHp*.15?"p_gsoin":S.res.p_soin>0?"p_soin":S.res.p_gsoin>0?"p_gsoin":null;if(id){drink(id,true);S.potCd=3}}
  if(S.pk){if(S.time>S.pk.until){S.pk=null;drawPk();S.pkNext=S.time+(PK_MIN*.6+Math.random()*(PK_MAX-PK_MIN))*(up("aimant")?.7:1)*(1-talV("t_trefle")/100)}}
  else if(S.time>=(S.pkNext??20)&&S.ko<=0&&!document.hidden)spawnPk();
  if(S.job){const r=RES[S.job.r],gt=gatherTime(r.prof,r.tier);S.job.t+=dt;while(S.job.t>=gt){S.job.t-=gt;gainGather(r.prof,r.id)}}
}
function offline(sec){
  if(!S.cls)return null;
  if(S.mode!=="zone"){S.mode="zone";S.dg=null;S.timer=0;S.mon=null}
  sec=Math.min(sec,8*3600);const sum={sec,xp:0,ecus:0,kills:0,res:{}},st=stats(),z=ZONES[S.zone];
  const lvl=Math.round((z.lvl[0]+Math.min(zoneTop(z),S.lvl+4))/2),ms=monsterStats(Math.max(z.lvl[0],lvl));
  const ef=z.mons.reduce((a,m)=>a+(1-monRes(m.el,st.el)/100),0)/3,tk=ms.hp/(st.dps*ef+allyDps())+1.5,danger=ms.atk*st.def/2*tk>st.maxHp*1.5;
  const kills=danger?0:Math.floor(sec/tk*.5);
  if(kills>0){sum.kills=kills;sum.xp=Math.round(kills*ms.xp*st.xpM);sum.ecus=gainEcus(kills*ms.ecus*(1+(st.pros-1)/2));S.kills+=kills;
    const dr=Math.floor(kills*.35*st.pros);z.mons.forEach((m,i)=>{const n=Math.floor(dr/3)+(i<dr%3?1:0);if(n>0){addRes(m.drop[0],n);sum.res[m.drop[1]]=(sum.res[m.drop[1]]||0)+n}});
    fx=false;gainXp(sum.xp);fx=true}
  if(S.job){const r=RES[S.job.r];let t=sec+S.job.t,tot=0,guard=0;while(guard++<20000){const gt=gatherTime(r.prof,r.tier);if(t<gt)break;t-=gt;tot+=gainGather(r.prof,r.id,true)}S.job.t=t;if(tot)sum.res[r.name]=(sum.res[r.name]||0)+tot}
  sum.danger=danger;return sum;
}

