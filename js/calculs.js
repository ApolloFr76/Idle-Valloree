/* Calculs : statistiques du héros, résistances, dégâts, temps de récolte, sac. */
/* ================= Calculs ================= */
function itemStats(inst){const it=ITEMS[inst.id],m=(it.slot==="trophee"?1+.25*dimR(inst.e||0):1+.1*(inst.e||0))*rarOf(inst).m,o={};for(const k in it.stats)o[k]=Math.round(it.stats[k]*m);if(it.fx)for(const k in it.fx)o[k]=(o[k]||0)+it.fx[k];return o}
function enchCost(inst){
  const it=ITEMS[inst.id],e=inst.e||0,lvl=Math.max(1,it.lvl||1);
  const levelCost=lvlBudget(lvl)*Math.pow(lvl/(lvl+20),2);
  const weaponScale=it.slot==="arme"?1.5:1;
  return Math.round(1000*levelCost*weaponScale*Math.pow(e+1,2));
}
function equipped(){return Object.values(S.equip).map(u=>S.items.find(i=>i.u===u)).filter(Boolean)}
function setCounts(eq=equipped()){const c={};eq.forEach(i=>{const it=ITEMS[i.id];if(it.noSet||!it.set)return;[it.set,...(it.also||[])].forEach(k=>c[k]=(c[k]||0)+1)});return c}
function stats(){
  const C=CLASSES[S.cls],s={vit:0,puissance:0,agi:0,sagesse:0,crit:5,prospection:100,dmg:0,feu:0,eau:0,terre:0,air:0,pctXp:0,pctEcus:0,pctDmg:0,pctSpd:0,pctSpell:0,pctDot:0,pctAlly:0,pctCdr:0,pctDef:0,pctLeech:0,pctHp:0,poison:0,brulure:0,gelure:0,saignement:0};
  const add=o=>{for(const k in o)s[k]=(s[k]||0)+o[k]};
  const eq=equipped();add(C.base);add(S.alloc);eq.forEach(i=>add(itemStats(i)));
  const sc=setCounts(eq);for(const z in sc)add(setTotal(z,sc[z],S.cls));
  s.prospection+=2*secN("eau",s.eau);s.crit+=secN("air",s.air)/2;s.critBonus=.02*secN("feu",s.feu);s.cdRed=Math.min(.85,secN("sagesse",s.sagesse)/100+s.pctCdr/100);s.dbl=secN("agi",s.agi)/100;s.resPct=secN("terre",s.terre)/100;
  let bd=1,bdef=1,bspd=1,bcrit=0,bpros=1,bxp=1,bdot=1;S.buffs.forEach(b=>{if(b.k==="dot")bdot*=b.v;if(b.k==="pros")bpros*=b.v;if(b.k==="xp")bxp*=b.v;if(b.k==="dmg")bd*=b.v;if(b.k==="def")bdef*=b.v;if(b.k==="spd")bspd*=b.v;if(b.k==="crit")bcrit+=b.v});
  s.crit+=talV("t_prec");s.prospection+=Math.round(talV("t_pros"));
  s.maxHp=Math.round((50+8*S.lvl+2*s.vit)*C.hpMult*(1+talV("t_vie")/100)*arbHpMult()*(1+secN("vit",s.vit)/100)*(1+s.pctHp/100));
  s.el="neutre";let best=0;["feu","eau","terre","air"].forEach(e=>{if(s[e]>best){best=s[e];s.el=e}});
  s.elPow=(s.el==="neutre"?0:s[s.el])+s.puissance;
  if(C.rage&&s.maxHp>0)bd*=1+C.rage*Math.max(0,Math.min(1,1-S.hp/s.maxHp));   /* Berserker : ×(1 + 2 × PV perdus) */
  s.hit=(5+S.lvl*1.5+s.dmg)*(1+s.elPow/100)*bd*C.dmgMult*(1+s.pctDmg/100)*(1+towerPct(S.tower?.best||0)/100)*(1+talV("t_force")/100)*arbDmgMult(s)*(1+soulBonus()/100)*(1+.01*achN())*(S.ev&&EVENTS.find(e=>e.id===S.ev.id)?.el===s.el?1.3:1);
  s.spellMult=(C.spellMult||1)*(1+s.pctSpell/100);
  s.leech=(C.leech||0)+s.pctLeech/100;
  /* DoT : chance d'en poser à chaque coup (stat / (stat + 400), 50 % max) et dégâts par charge et par seconde */
  s.dotC={};s.dotPer={};for(const k in DOTS){const v=s[k]||0;s.dotC[k]=Math.min(.5,v/(v+400));if(C.autoDot===k)s.dotC[k]=1;
    s.dotPer[k]=(s.hit*.15*(1+Math.sqrt(v)/20)*(C.dotMult||1)*(1+s.pctDot/100)+allyDps()*.02)*DOTS[k].k*bdot}   /* racine : la stat compte sans exploser à haut niveau */
  s.critC=Math.min(100,s.crit+bcrit);
  /* Super critique : la chance de critique au-delà de 100 % (jusqu'à 200 %) devient la chance qu'un critique soit « super » (dégâts critiques ×2) */
  s.superC=Math.max(0,Math.min(100,s.crit+bcrit-100));s.critShow=Math.min(200,s.crit+bcrit);   /* affichage : de 0 à 200 % */s.critM=+(C.critMult+s.critBonus+(arb("g3")?.2:0)).toFixed(2);
  s.interval=Math.max(.3,1.3/(1+s.agi/150)/Math.max(.2,1+s.pctSpd/100))/bspd;
  s.dodge=Math.min(.6,s.agi/(s.agi+400)*C.dodgeMult);
  s.pctXp+=fishN();s.prospection=Math.round(s.prospection*bpros);s.def=C.def*bdef*(1-s.resPct)*Math.max(.2,1-s.pctDef/100);s.regen=C.regen;s.xpM=(1+s.sagesse/100)*(1+s.pctXp/100)*(1+.1*omegaN())*arbXpMult()*bxp*(evOn("nuit")?1.5:1)*(1+.1*profMaxN());s.pros=s.prospection/100;s.pctEcus+=10*omegaN();
  s.dps=s.hit*(1+s.critC/100*(s.critM*(1+s.superC/100)-1))*(1+s.dbl)/s.interval;
  /* estimation des DoT en continu (charges moyennes entretenues par les coups) ajoutée aux dégâts/s */
  {const hps=(1+s.dbl)/s.interval;s.dotDps=0;for(const k in DOTS){const n=Math.min(DOTS[k].max,s.dotC[k]*hps*DOTS[k].d);s.dotDps+=n*s.dotPer[k]}s.dps+=s.dotDps}
  return s;
}
function roll(mult,st){if(S.mon)mult*=1+.05*bestTier(S.mon.id);const r=S.mon?monRes(MON[S.mon.id].el,st.el):0;let v=st.hit*mult*(1-r/100)*(.9+Math.random()*.2),crit=Math.random()*100<st.critC,sup=crit&&Math.random()*100<(st.superC||0);if(crit)v*=st.critM*(sup?2:1);return{v:Math.max(1,Math.round(v)),crit,sup,r}}
const spCd=(sp,st=stats())=>sp.cd*(CLASSES[S.cls].cdMult||1)*(1-st.cdRed)*(up("cdr1")?.9:1)*(up("cdr2")?.9:1)*(arb("g6")?.8:1)*S.buffs.filter(b=>b.k==="cdr").reduce((a,b)=>a*b.v,1);
/* Puissance des monstres : courbe de base, puis un multiplicateur qui grimpe de façon exponentielle au-delà du
   niveau 25 (×2,7 au niv. 50, ×19 au niv. 100, ×140 au niv. 150, ×1000 au niv. 200) pour suivre la puissance du joueur
   en fin de jeu (dégâts des monstres ×8 au niv. 200). Les gains suivent cette difficulté pour que les combats plus longs restent rentables. */
/* La croissance reste exponentielle après 200, avec une composante polynomiale pour
   garder une progression forte sans rendre les valeurs inutilisables trop tôt. */
const monPow=lvl=>Math.exp(.0395*(Math.min(200,Math.max(25,lvl))-25))*(lvl>200?Math.pow(lvl/200,3)*Math.pow(1.004,lvl-200):1);
const MON_BOOST=1.15;   /* tous les monstres +15 % de PV et de dégâts */
function monsterStats(lvl){const m=monPow(lvl),goldScale=Math.pow(Math.max(1,lvl/25),.35);return{hp:Math.round((14+7*Math.pow(lvl,1.45))*m*MON_BOOST),atk:Math.round((2+1.5*Math.pow(lvl,1.2))*Math.pow(m,.3)*MON_BOOST),xp:Math.round((6+5*Math.pow(lvl,1.3))*Math.pow(m,.4)),ecus:Math.round((2+lvl*1.1)*Math.pow(m,.65)*goldScale)}}
function makeMon(d,lvl,hpM=1,atkM=1,xpM=1,ecM=1){const ms=monsterStats(lvl),hp=Math.round(ms.hp*hpM);S.mon={id:d.id,lvl,hp,max:hp,atk:Math.round(ms.atk*atkM),xp:Math.round(ms.xp*xpM),ecus:Math.round(ms.ecus*ecM)};S.dots=[];S.mdot={};S.monT=0;makeShiny();drawMonster();if(fx){FX.spawn(!!d.boss);VIE.monSpawn(!!d.boss);SCENE.drawQueue();if(S.mode==="zone"&&!d.boss){SCENE.walkIn();SCENE.advance()}}}
/* Dernière zone : au-delà du niveau 1000, les monstres suivent le héros avec 50 niveaux de moins. */
const ZONE_LAG=50;
const zoneTop=z=>z.i===ZONES.length-1?Math.max(z.lvl[1],S.lvl-ZONE_LAG):z.lvl[1];
function spawn(){const z=ZONES[S.zone],d=SCENE.nextWave(z),top=zoneTop(z),progress=Math.max(z.lvl[0],Math.min(top,S.lvl)),lo=Math.max(z.lvl[0],progress-2),hi=Math.max(lo,Math.min(top,progress+2));makeMon(d,rnd(lo,hi))}
const towerLvl=f=>Math.round(f*2+Math.pow(f,1.35)*.25),towerRec=f=>Math.round(6*f+.4*f*f),towerPct=b=>.5*dimR(b/2)*2;
/* Étage de départ de la tour : 80 % du record, mais jamais un étage où le monstre tiendrait plus de 10 s
   face aux dégâts actuels (héros + compagnons). */
function towerStart(){const ef=Math.max(1,stats().dps+allyDps());let f=Math.max(1,Math.floor(S.tower.best*.8));
  while(f>1&&monsterStats(towerLvl(f)).hp*(f%10?2.5:8)/ef>10)f=f>60?Math.floor(f*.97):f-1;return f}
const bossTime=()=>BOSS_TIME+(up("sablier")?10:0),towerTime=()=>TOWER_TIME+(up("sablier")?10:0);
function nextMon(){
  if(S.mode==="boss")makeMon(MON["boss_"+S.zone],ZONES[S.zone].lvl[1],12,1.3,10,15);
  else if(S.mode==="tour"){const f=S.tower.cur,zi=Math.min(5,Math.floor((f-1)/14)),z=ZONES[zi],bossF=f%10===0;makeMon(bossF?MON["boss_"+zi]:pickMon(z),towerLvl(f),bossF?8:2.5,bossF?1.3:1.15,.3,.4)}
  else if(S.mode==="donjon"){const z=ZONES[S.dg.z],L=z.lvl[1]+2;if(S.dg.wave<DG_WAVES)makeMon(pickMon(z),L,2,1.1,2,2);else makeMon(MON["boss_"+S.dg.z],L,8,1.4,8,10)}
  else spawn();
}
function startMode(m,zi){
  if(S.ko>0){toast("Attendez d'être remis sur pied");return}
  if(m==="boss"){if(zi!=null)S.zone=zi;if((S.zk[S.zone]||0)<BOSS_KILLS)return;if(!bkeyN(S.zone)){toast(`Il faut une clé de boss : ${MON["boss_"+S.zone].name}`,1);return}S.res["bkey_"+S.zone]--;S.mode="boss";S.timer=bossTime();log(`Le combat contre ${MON["boss_"+S.zone].name} commence : ${bossTime()} s !`,"g")}
  if(m==="donjon"){const z=ZONES[zi],k="cle_"+zi;if(S.lvl<z.lvl[0]||(S.res[k]||0)<1){toast("Il vous faut la clé de ce donjon");return}S.res[k]--;S.zone=zi;S.dg={z:zi,wave:1};S.mode="donjon";S.timer=0;if(up("fortauto")&&S.opt.autoFortune&&(S.res.p_fortune||0)>0)drink("p_fortune",true);log(`Vous entrez dans le donjon ${DUNGEONS[zi]}.`,"g")}
  if(m==="tour"){S.mode="tour";S.tower.cur=towerStart();S.timer=towerTime();log(`Vous entrez dans la tour à l'étage ${S.tower.cur}.`,"g")}
  S.mon=null;S.spawnT=.3;S.dots=[];drawZones();drawMonster();dirty=true;
}
function endMode(win,why){
  if(S.mode==="zone")return;
  if(!win){sfx("fail");if(S.mode==="boss")S.bossAutoT=S.time+30;if(S.mode==="donjon")S.dgAutoT=S.time+30;if(S.mode==="boss")log(`${MON["boss_"+S.zone].name} vous a échappé (${why}). Retentez quand vous voulez.`,"r");
    if(S.mode==="tour"){S.towerAgainT=0;const wasAuto=!!(S.opt&&S.opt.autoTower);if(S.opt)S.opt.autoTower=false;mbSig="";log(`Tour : vous vous arrêtez à l'étage ${S.tower.cur} (${why}). Record : ${S.tower.best}.${wasAuto?" Tour automatique désactivée.":""}`,"r");if(wasAuto)toast("Tour automatique désactivée",1)}
    if(S.mode==="donjon")log(`Donjon raté (${why}). La clé est perdue.`,"r")}
  S.mode="zone";S.dg=null;S.timer=0;S.mon=null;S.spawnT=.6;S.dots=[];drawZones();dirty=true;
}
function gatherRaw(pid,t){const L=S.jobs[pid].lvl;return profGatherTime(L,t)*(up("outils1")?.8:1)*(up("outils2")?.8:1)*(1-talV("t_mains")/100)/arbGatherDiv()}
function gatherTime(pid,t){return Math.max(.1,gatherRaw(pid,t))}/* jamais moins de 0,1 s (évite un temps négatif qui bloque le jeu) */

