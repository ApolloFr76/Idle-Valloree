/* Calculs : statistiques du héros, résistances, dégâts, temps de récolte, sac. */
/* ================= Calculs ================= */
function itemStats(inst){const it=ITEMS[inst.id],m=(it.slot==="trophee"?1+.25*dimR(inst.e||0):1+.1*(inst.e||0))*rarOf(inst).m,o={};for(const k in it.stats)o[k]=Math.round(it.stats[k]*m);return o}
function equipped(){return Object.values(S.equip).map(u=>S.items.find(i=>i.u===u)).filter(Boolean)}
function setCounts(eq=equipped()){const c={};eq.forEach(i=>{const it=ITEMS[i.id];if(it.noSet||!it.set)return;c[it.set]=(c[it.set]||0)+1});return c}
function stats(){
  const C=CLASSES[S.cls],s={vit:0,puissance:0,agi:0,sagesse:0,crit:5,prospection:100,dmg:0,feu:0,eau:0,terre:0,air:0,pctXp:0,pctEcus:0,pctDmg:0};
  const add=o=>{for(const k in o)s[k]+=o[k]};
  const eq=equipped();add(C.base);add(S.alloc);eq.forEach(i=>add(itemStats(i)));
  const sc=setCounts(eq);for(const z in sc){const b=SETB(z);setSteps(z).forEach(n=>{if(sc[z]>=n)add(b[n])})}
  s.prospection+=2*secN("eau",s.eau);s.crit+=secN("air",s.air)/2;s.critBonus=.02*secN("feu",s.feu);s.cdRed=secN("sagesse",s.sagesse)/100;s.dbl=secN("agi",s.agi)/100;s.resPct=secN("terre",s.terre)/100;
  let bd=1,bdef=1,bspd=1,bcrit=0,bpros=1,bxp=1;S.buffs.forEach(b=>{if(b.k==="pros")bpros*=b.v;if(b.k==="xp")bxp*=b.v;if(b.k==="dmg")bd*=b.v;if(b.k==="def")bdef*=b.v;if(b.k==="spd")bspd*=b.v;if(b.k==="crit")bcrit+=b.v});
  s.crit+=talV("t_prec");s.prospection+=Math.round(talV("t_pros"));
  s.maxHp=Math.round((50+8*S.lvl+2*s.vit)*C.hpMult*(1+talV("t_vie")/100)*(1+secN("vit",s.vit)/100));
  s.el="neutre";let best=0;["feu","eau","terre","air"].forEach(e=>{if(s[e]>best){best=s[e];s.el=e}});
  s.elPow=(s.el==="neutre"?0:s[s.el])+s.puissance;
  s.hit=(5+S.lvl*1.5+s.dmg)*(1+s.elPow/100)*bd*C.dmgMult*(1+s.pctDmg/100)*(1+towerPct(S.tower?.best||0)/100)*(1+talV("t_force")/100)*(1+.02*(S.souls||0))*(1+.01*achN())*(S.ev&&EVENTS.find(e=>e.id===S.ev.id)?.el===s.el?1.3:1);
  s.critC=Math.min(100,s.crit+bcrit);s.critM=+(C.critMult+s.critBonus).toFixed(2);
  s.interval=Math.max(.3,1.3/(1+s.agi/150))/bspd;
  s.dodge=Math.min(.6,s.agi/(s.agi+400)*C.dodgeMult);
  s.prospection=Math.round(s.prospection*bpros);s.def=C.def*bdef*(1-s.resPct);s.regen=C.regen;s.xpM=(1+s.sagesse/100)*(1+s.pctXp/100)*bxp*(evOn("nuit")?1.5:1);s.pros=s.prospection/100;
  s.dps=s.hit*(1+s.critC/100*(s.critM-1))*(1+s.dbl)/s.interval;
  return s;
}
function roll(mult,st){if(S.mon)mult*=1+.05*bestTier(S.mon.id);const r=S.mon?monRes(MON[S.mon.id].el,st.el):0;let v=st.hit*mult*(1-r/100)*(.9+Math.random()*.2),crit=Math.random()*100<st.critC;if(crit)v*=st.critM;return{v:Math.max(1,Math.round(v)),crit,r}}
const spCd=(sp,st=stats())=>sp.cd*(CLASSES[S.cls].cdMult||1)*(1-st.cdRed);
function monsterStats(lvl){return{hp:Math.round(14+7*Math.pow(lvl,1.45)),atk:Math.round(2+1.5*Math.pow(lvl,1.2)),xp:Math.round(6+5*Math.pow(lvl,1.3)),ecus:Math.round(2+lvl*1.1)}}
function makeMon(d,lvl,hpM=1,atkM=1,xpM=1,ecM=1){const ms=monsterStats(lvl),hp=Math.round(ms.hp*hpM);S.mon={id:d.id,lvl,hp,max:hp,atk:Math.round(ms.atk*atkM),xp:Math.round(ms.xp*xpM),ecus:Math.round(ms.ecus*ecM)};S.dots=[];S.monT=0;makeShiny();drawMonster();if(fx){FX.spawn(!!d.boss);VIE.monSpawn(!!d.boss);SCENE.drawQueue();if(S.mode==="zone"&&!d.boss){SCENE.walkIn();SCENE.advance()}}}
function spawn(){const z=ZONES[S.zone],d=SCENE.nextWave(z),lvl=rnd(z.lvl[0],Math.min(z.lvl[1],Math.max(z.lvl[0],S.lvl+2)));makeMon(d,lvl)}
const towerLvl=f=>Math.round(f*2+Math.pow(f,1.35)*.25),towerRec=f=>Math.round(6*f+.4*f*f),towerPct=b=>.5*dimR(b/2)*2;
const bossTime=()=>BOSS_TIME+(up("sablier")?10:0),towerTime=()=>TOWER_TIME+(up("sablier")?10:0);
function nextMon(){
  if(S.mode==="boss")makeMon(MON["boss_"+S.zone],ZONES[S.zone].lvl[1],12,1.3,10,15);
  else if(S.mode==="tour"){const f=S.tower.cur,zi=Math.min(5,Math.floor((f-1)/14)),z=ZONES[zi],bossF=f%10===0;makeMon(bossF?MON["boss_"+zi]:z.mons[rnd(0,2)],towerLvl(f),bossF?8:2.5,bossF?1.3:1.15,.3,.4)}
  else if(S.mode==="donjon"){const z=ZONES[S.dg.z],L=z.lvl[1]+2;if(S.dg.wave<DG_WAVES)makeMon(z.mons[rnd(0,2)],L,2,1.1,2,2);else makeMon(MON["boss_"+S.dg.z],L,8,1.4,8,10)}
  else spawn();
}
function startMode(m,zi){
  if(S.ko>0){toast("Attendez d'être remis sur pied");return}
  if(m==="boss"){if(zi!=null)S.zone=zi;if((S.zk[S.zone]||0)<BOSS_KILLS)return;S.mode="boss";S.timer=bossTime();log(`Le combat contre ${MON["boss_"+S.zone].name} commence : ${bossTime()} s !`,"g")}
  if(m==="donjon"){const z=ZONES[zi],k="cle_"+zi;if(S.lvl<z.lvl[0]||(S.res[k]||0)<1){toast("Il vous faut la clé de ce donjon");return}S.res[k]--;S.zone=zi;S.dg={z:zi,wave:1};S.mode="donjon";S.timer=0;log(`Vous entrez dans le donjon ${DUNGEONS[zi]}.`,"g")}
  if(m==="tour"){S.mode="tour";S.tower.cur=Math.max(1,Math.floor(S.tower.best*.8));S.timer=towerTime();log(`Vous entrez dans la tour à l'étage ${S.tower.cur}.`,"g")}
  S.mon=null;S.spawnT=.3;S.dots=[];drawZones();drawMonster();dirty=true;
}
function endMode(win,why){
  if(S.mode==="zone")return;
  if(!win){sfx("fail");if(S.mode==="boss")log(`${MON["boss_"+S.zone].name} vous a échappé (${why}). Retentez quand vous voulez.`,"r");
    if(S.mode==="tour")log(`Tour : vous vous arrêtez à l'étage ${S.tower.cur} (${why}). Record : ${S.tower.best}.`,"r");
    if(S.mode==="donjon")log(`Donjon raté (${why}). La clé est perdue.`,"r")}
  S.mode="zone";S.dg=null;S.timer=0;S.mon=null;S.spawnT=.6;S.dots=[];drawZones();dirty=true;
}
function gatherTime(pid,t){const L=S.jobs[pid].lvl;return(3+t*1.2)*(1-Math.min(.4,(L-UNLOCK[t])*.01))*(up("outils1")?.8:1)*(up("outils2")?.8:1)*(1-talV("t_mains")/100)}

