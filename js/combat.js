/* Combat : XP, coups, mort des monstres, butin, attaques du héros et effets visuels (FX). */
/* ================= Actions de jeu ================= */
function gainXp(x){
  S.xp+=x;inc("xp",x);let up=false;
  while(S.lvl<lvlMax()&&S.xp>=xpNeed(S.lvl)){S.xp-=xpNeed(S.lvl);S.lvl++;S.pts+=PTS_PER_LVL;up=true;checkUnlocks(!fx);
    const sp=CLASSES[S.cls].spells.find(s=>s.lvl===S.lvl);log(`Niveau ${S.lvl} ! +${PTS_PER_LVL} points de caractéristiques.`,"g");if(sp)log(`Nouveau sort : ${sp.name}.`,"g")}
  if(S.lvl>=lvlMax())S.xp=0;
  mx("maxLvl",S.lvl);
  if(up){sfx("level");if(fx){FX.lvl(S.lvl);VIE.cheer()}S.hp=stats().maxHp;dirty=true;drawSpells();drawZones();if(fx)toast(`Niveau ${S.lvl} !`)}
}
const bagCap=()=>1000+100*S.lvl+(up("sac1")?2000:0)+(up("sac2")?8000:0)+Math.round(talV("t_sac"));
function bagWeight(){const eq=new Set(Object.values(S.equip));let w=0;for(const k in S.res)w+=S.res[k]||0;S.items.forEach(i=>{if(!eq.has(i.u))w+=10});return w}
let fullWarn=0;
function addRes(id,n){let room=Math.max(0,bagCap()-bagWeight());
  if(room<n&&S.opt.autoSellFull){const big=Object.keys(S.res).filter(k=>S.res[k]>0&&RES[k].kind!=="k"&&RES[k].kind!=="p").sort((a,b)=>S.res[b]-S.res[a])[0];if(big){const q=S.res[big],g=sellRes(big,q);log(`Sac plein : ${fmt(q)}× ${RES[big].name} vendus automatiquement (+${fmt(g)} écus).`,"g");room=Math.max(0,bagCap()-bagWeight())}}
  n=Math.min(n,room);
  if(n<=0){if(S.time-fullWarn>30){fullWarn=S.time;log("Sac plein : vendez des ressources dans l'Inventaire pour continuer à ramasser.","r");if(fx)toast("Sac plein")}return 0}
  S.res[id]=(S.res[id]||0)+n;if(S.seen)S.seen[id]=1;dirty=true;return n}
/* ---------- DoT élémentaires (poison, brûlure, gelure, saignement) : S.mdot[type] = {n charges, until} ---------- */
function addDot(k,n){if(!S.mon||!DOTS[k]||n<=0)return;S.mdot=S.mdot||{};const D=DOTS[k],e=S.mdot[k]||(S.mdot[k]={n:0,until:0,acc:0});e.n=Math.min(D.max,e.n+n);e.until=S.time+D.d;inc("dotStacks",n)}
function dotProcs(r,kind){if(kind!=="click"&&kind!=="auto"&&kind!=="spell")return;const t=performance.now();if(!dotProcs.st||t-dotProcs.t>250){dotProcs.t=t;dotProcs.st=stats()}const st=dotProcs.st;
  for(const k in st.dotC){const c=st.dotC[k];if(c>0&&Math.random()<c)addDot(k,1+(k==="saignement"&&r.crit?1:0))}}
function dotTick(dt,st){if(!S.mon||!S.mdot)return;let tot=0;
  for(const k in S.mdot){const e=S.mdot[k];if(e.until<=S.time||e.n<=0){delete S.mdot[k];continue}e.acc+=dt;while(e.acc>=1){e.acc-=1;tot+=e.n*st.dotPer[k]}}
  if(tot>0)hitMon({v:Math.max(1,Math.round(tot)),crit:false,r:0},"dot")}
/* Purge : toutes les charges explosent (dégâts restants × m) */
function purgeDots(m){if(!S.mon||!S.mdot)return 0;const st=stats();let v=0;for(const k in S.mdot){const e=S.mdot[k];v+=e.n*st.dotPer[k]*Math.max(1,e.until-S.time)*m}S.mdot={};
  if(v>0)hitMon({v:Math.round(v),crit:false,r:0},"spell");return v}
function hitMon(r,kind){
  if(!S.mon||S.ko>0)return;dotProcs(r,kind);if(fx&&(kind==="click"||kind==="auto"))heroAtk();S.mon.hp-=r.v;inc("dmg",r.v);mx("maxHit",r.v);if(kind==="click"||kind==="spell")sfx(r.crit?"crit":"hit");
  if(fx){floatNum((r.sup?"SUPER ":"")+fmt(r.v)+(r.crit?" !":""),(r.sup?"crit super ":r.crit?"crit ":"")+(kind==="dot"?"dot ":"")+(r.r<0?"eff":r.r>0?"resi":""));replayCls($("mon"),"hit");if((r.crit||r.v>S.mon.max*.2)&&kind!=="dot")VIE.ouch();if(r.crit&&(kind==="click"||kind==="spell")&&performance.now()-(hitMon.ct||0)>250){hitMon.ct=performance.now();FX.crit()}}
  if(S.mon.hp<=0)kill();
}
/* Attaque de base du héros : animation propre à chaque classe (voir js/anim.js) */
let atkT=0;
function heroAtk(){const now=performance.now();if(now-atkT<(S.cls==="archer"?150:120))return;atkT=now;ANIM.basic()}

/* ================= Effets visuels (FX) ================= */
const FX=(()=>{
  const calm=()=>S&&S.opt&&S.opt.reduceMotion;
  const A=()=>$("arena");
  const rel=el=>{const a=A().getBoundingClientRect(),r=el.getBoundingClientRect();return{x:r.left-a.left,y:r.top-a.top,w:r.width,h:r.height}};
  const add=(cls,x,y,ms,html)=>{const e=document.createElement("div");e.className="fx "+cls;e.style.left=x+"px";e.style.top=y+"px";if(html)e.innerHTML=html;A().appendChild(e);setTimeout(()=>e.remove(),ms);return e};
  const shake=(big)=>{if(!S.opt.shake||calm())return;const a=A();a.classList.remove("shake","shake2");void a.offsetWidth;a.classList.add(big?"shake2":"shake")};
  const parts=(x,y,n,cols,spread=60,ms=600,sz=4)=>{if(calm())n=Math.ceil(n/3);for(let i=0;i<n;i++){const e=add("pt",x,y,ms);const c=cols[i%cols.length],ang=Math.random()*Math.PI*2,d=spread*(.4+Math.random()*.6),s=sz+(Math.random()*3|0);
    e.style.width=e.style.height=s+"px";e.style.background=c;e.animate([{transform:"translate(-50%,-50%)",opacity:1},{transform:`translate(calc(-50% + ${Math.cos(ang)*d}px),calc(-50% + ${Math.sin(ang)*d+20}px))`,opacity:0}],{duration:ms*(.7+Math.random()*.3),easing:"cubic-bezier(.2,.7,.4,1)",fill:"forwards"})}};
  const monBox=()=>{const b=$("monBtn");return b?rel(b):null},heroBox=()=>{const h=$("ahero");return h&&!h.hidden?rel(h):null};
  const banner=(txt,sub,cls,ms=1600)=>{A().querySelectorAll(".fx.banner").forEach(x=>x.remove());const e=add("banner "+cls,0,0,ms,`<b>${txt}</b>${sub?`<span>${sub}</span>`:""}`);e.style.setProperty("--d",ms+"ms");return e};
  let lastPt=null;
  return{
    pt(e){const a=A().getBoundingClientRect();lastPt={x:e.clientX-a.left,y:e.clientY-a.top}},
    click(){if(!fx)return;const m=monBox();if(!m)return;const p=lastPt&&lastPt.x>m.x-20&&lastPt.x<m.x+m.w+20?lastPt:{x:m.x+m.w*(.3+Math.random()*.4),y:m.y+m.h*(.3+Math.random()*.4)};lastPt=null;
      add("ripple",p.x,p.y,350);parts(p.x,p.y,4,["#fff6d8","#ffd36a"],26,320,3)},
    crit(){if(!fx)return;const m=monBox();if(!m)return;add("critburst",m.x+m.w/2,m.y+m.h/2,380);if(ANIM.lynx())add("critburst gold",m.x+m.w/2,m.y+m.h/2,520);parts(m.x+m.w/2,m.y+m.h/2,10,["#fff","#ffd36a","#ff8a3c"],70,500);shake(false)},
    monAtk(){if(!fx)return;if(ANIM.wall()){ANIM.ting();return}VIE.monAtkFx();
      const h=$("ahero");if(h)replayCls(h,"hurt");const hb=heroBox();if(hb){add("claw",hb.x+hb.w*.55,hb.y+hb.h*.3,300);parts(hb.x+hb.w*.6,hb.y+hb.h*.45,5,["#ff5a4a","#ffb0a0"],34,400,3)}},
    dodge(){if(!fx)return;const h=$("ahero");if(h)replayCls(h,"dodge")},
    heal(){if(!fx)return;const hb=heroBox();if(!hb)return;for(let i=0;i<9;i++){const e=add(i%3?"healorb":"healstar",hb.x+hb.w*(.15+Math.random()*.7),hb.y+hb.h*(.35+Math.random()*.55),1200);e.style.animationDelay=(i*70)+"ms"}},
    spawn(boss){if(!fx)return;const mb=$("mon");mb.classList.remove("spawn","bspawn");void mb.offsetWidth;if(boss||S.mode!=="zone")mb.classList.add(boss?"bspawn":"spawn");const m=monBox();if(m)add("puff",m.x+m.w/2,m.y+m.h*.85,420);
      if(boss){const d=MON[S.mon.id];banner("Boss !",d.name,"boss",1700);replayCls(A(),"bossflash");shake(true);sfx("event")}},
    death(boss){if(!fx)return;const b=$("monBtn"),m=monBox();if(!b||!m||!b.firstElementChild)return;const g=add("ghost",m.x,m.y,520,b.innerHTML);g.style.width=m.w+"px";g.style.height=m.h+"px";
      const cx=m.x+m.w/2,cy=m.y+m.h/2;parts(cx,cy,boss?26:12,boss?["#ffd36a","#fff","#ff8a3c","#c9a8ff"]:["#fff6d8","#c4a878","#ffffff"],boss?120:70,boss?900:550,boss?5:4);add("poof",cx,cy,500);
      for(let i=0;i<(boss?8:3);i++){const c=add("coin",cx,cy,800);const dx=(Math.random()-.5)*90,dy=-40-Math.random()*40;c.animate([{transform:"translate(-50%,-50%)"},{transform:`translate(calc(-50% + ${dx/2}px),calc(-50% + ${dy}px))`,offset:.45},{transform:`translate(calc(-50% + ${dx}px),calc(-50% + 30px))`,opacity:0}],{duration:780,easing:"ease-out",fill:"forwards"})}
      if(boss){shake(true);banner("Victoire !","","win",1300)}},
    loot(icon,rare){if(!fx)return;const m=monBox();if(!m)return;const e=add("loot"+(rare?" rare":""),m.x+m.w*(.25+Math.random()*.5),m.y+m.h*.45,rare?1500:1000,icon);if(rare){parts(m.x+m.w/2,m.y+m.h/2,14,["#ffd36a","#fff","#b98cff"],80,800);shake(false)}},
    ko(){if(!fx)return;replayCls(A(),"kofx");banner("K.O.","","ko",2000);const hb=heroBox();if(hb)parts(hb.x+hb.w/2,hb.y+hb.h/2,14,["#ff5a4a","#6a2030","#fff"],70,800);shake(true)},
    lvl(n){if(!fx)return;const hb=heroBox();if(hb){add("pillar",hb.x+hb.w/2,0,1100);parts(hb.x+hb.w/2,hb.y+hb.h*.6,20,["#ffd36a","#fff6d8","#ffb03c"],90,1000)}banner("Niveau "+n+" !","+"+PTS_PER_LVL+" points","lvl",1500)},
    flash(col){if(!fx)return;const e=add("flash",0,0,500);e.style.background=col},
    omega(n){const o=document.createElement("div");o.className="omegafx";o.innerHTML=`<div class="om">Ω</div><b>Oméga ${n}</b><span>Une nouvelle vie commence</span>`;document.body.appendChild(o);for(let i=0;i<24;i++){const r=document.createElement("i");r.style.setProperty("--a",(i*15)+"deg");o.appendChild(r)}setTimeout(()=>o.remove(),2600)},
    ach(name){if(!fx)return;banner("Succès !",name,"ach",1500)},
    /* Un compagnon au hasard bondit vers le monstre quand les dégâts des compagnons s'affichent */
    palAtk(){return;const L=[...document.querySelectorAll("#pals .pal")];if(!L.length)return;const p=L[Math.random()*L.length|0];replayCls(p,"patk");
      const m=monBox(),b=rel(p);if(m)setTimeout(()=>parts(m.x+m.w*.3,m.y+m.h*.55,4,["#bfe3ff","#fff"],24,300,3),140)}
  }})();
function kill(){
  if(fx){FX.death(MON[S.mon.id].boss);VIE.coinFly();if(MON[S.mon.id].boss)VIE.cheer()}
  if(S.mon.shiny){inc("shinies");log(`Monstre brillant vaincu : ${MON[S.mon.id].name} !`,"g")}
  const m=S.mon,d=MON[m.id],st=stats(),mode=S.mode,xp=Math.round(m.xp*st.xpM),ec=gainEcus(m.ecus*(1+st.pctEcus/100)*(.8+Math.random()*.4)*(1+(st.pros-1)/2)*(evOn("heure")?2:1));
  S.kills++;S.best[m.id]=(S.best[m.id]||0)+1;dirty=true;let dropTxt="";qProg("kill",m.id);qProg("killEl",d.el);
  if(d.boss&&mode!=="tour"){const n=addRes(d.drop[0],1+(Math.random()<(st.pros-1)/4?1:0));if(n)dropTxt=`, ${n>1?n+"× ":""}${d.drop[1]}`;
    {const nb=addRes(d.bres[0],(mode==="donjon"?2:1)+(Math.random()<Math.min(.9,(st.pros-1)/3)?1:0));if(nb)dropTxt+=`, ${nb>1?nb+"× ":""}${d.bres[1]}`}
    if(Math.random()<.25){S.seen["tb_"+d.zone]=1;giveTrophy("tb_"+d.zone);if(fx)FX.loot(itIcon(ITEMS["tb_"+d.zone]),1);log(`Butin rare : ${ITEMS["tb_"+d.zone].name} !`,"g");if(fx)toast(`Trophée de boss obtenu !`)}}
  else if(!d.boss){(LOOT[d.id]||[]).forEach(l=>{const ch=lootChance(d.id,l.p);let n=Math.floor(ch)+(Math.random()<ch%1?1:0);if(n<=0)return;
      if(l.item){S.seen[l.id]=1;giveTrophy(l.id);if(fx)FX.loot(itIcon(ITEMS[l.id]),1);log(`Butin rare : ${ITEMS[l.id].name} !`,"g");if(fx)toast(`Trophée obtenu : ${d.name}`);return}
      const first=!seen(l.id);n=addRes(l.id,n);if(!n)return;if(fx)FX.loot(resIcon(RES[l.id]),l.p<.06);dropTxt+=`, ${n>1?n+"× ":""}${l.p<.06?`<b style="color:var(--gold)">${l.n}</b>`:l.n}`;
      if(l.p<.06){log(`Butin ${rareLbl(l.p).toLowerCase()} : <b>${l.n}</b> (${Math.round(l.p*1000)/10} %)${first?" · première fois !":""}`,"g");if(fx)toast(`${first?"Découverte":"Butin rare"} : ${l.n}`)}
      else if(first&&fx)toast(`Nouveau butin découvert : ${l.n}`)})}
  if(S.opt.logKills&&(S.opt.logLoot||!dropTxt))log(`${d.name} vaincu : <span class="x">+${fmt(xp)} XP</span>, <span class="g">+${fmt(ec)} écus</span>${dropTxt}`);
  S.mon=null;S.spawnT=.5;S.dots=[];sfx(d.boss?"boss":"kill");gainXp(xp);
  if(mode==="zone")S.zk[S.zone]=Math.min(BOSS_KILLS,(S.zk[S.zone]||0)+1);
  if(mode==="boss"){inc("bosses");inc("bossesLife");qProg("boss");S.zk[S.zone]=0;if(fx)toast(`${d.name} est vaincu !`);endMode(true)}
  if(mode==="tour"){const f=S.tower.cur;if(f>S.tower.best){S.tower.best=f;const g=gainEcus(towerRec(f));log(`Tour : nouveau record, étage ${f} ! <span class="g">+${fmt(g)} écus</span>`,"g")}mx("tower",S.tower.best);S.tower.cur++;S.timer=towerTime();S.spawnT=.3}
  if(mode==="donjon"){S.dg.wave++;if(S.dg.wave>DG_WAVES){const zi=S.dg.z,z=ZONES[zi],g=gainEcus(farmGold(600)),got=[];
      z.mons.forEach(mm=>{const n=addRes(mm.drop[0],rnd(5,10));if(n)got.push(`${n}× ${mm.drop[1]}`)});
      if(Math.random()<.4){giveTrophy("tb_"+zi);got.push(ITEMS["tb_"+zi].name)}
      inc("dungeons");log(`Coffre du donjon ${DUNGEONS[zi]} : <span class="g">+${fmt(g)} écus</span>${got.length?", "+got.join(", "):""}`,"g");if(fx)toast(`Donjon terminé : +${fmt(g)} écus`);endMode(true)}}
}
function cast(sp,auto){
  if(S.ko>0||!S.mon||S.lvl<sp.lvl||(S.cds[sp.id]||0)>S.time)return;
  const st=stats(),C=CLASSES[S.cls];S.cds[sp.id]=S.time+spCd(sp,st);
  if(fx)ANIM.spell(sp.id);const dl=ANIM.delay(sp.id);
  sp.fx.forEach(f=>{
    if(f.t==="hit"){const r=roll(f.m*C.spellMult,st);if(dl)setTimeout(()=>{if(S.mon&&S.ko<=0)hitMon(r,"spell")},dl);else hitMon(r,"spell")}
    if(f.t==="dot"&&f.k){const n=f.n;if(dl)setTimeout(()=>addDot(f.k,n),dl);else addDot(f.k,n)}
    else if(f.t==="dot")S.dots.push({m:f.m*C.spellMult,until:S.time+f.d,acc:0});
    if(f.t==="purge"){const go=()=>{const v=purgeDots(f.m);if(fx&&v>0)floatNum("Purge !","crit")};if(dl)setTimeout(go,dl);else go()}
    if(f.t==="heal"){const h=Math.round(st.maxHp*f.p);S.hp=Math.min(st.maxHp,S.hp+h);if(fx){floatNum("+"+fmt(h),"heal");FX.heal()}}
    if(f.t==="buff")pkBuff(f.k,f.v,f.d,sp.name);
  });
  if(!auto&&fx)log(`Vous lancez ${sp.name}.`,"w");
}
function gainGather(pid,rid,quiet){
  const p=S.jobs[pid],r=RES[rid];let n=1+(Math.random()<Math.min(.5,p.lvl/120)+talV("t_double")/100?1:0);
  n=addRes(rid,n);if(n)qProg("gather",rid,n);if(p.lvl<PROF_MAX){p.xp+=Math.round(14*Math.pow(r.tier+1,1.6)); /* l'XP compte même sac plein */
    while(p.lvl<PROF_MAX&&p.xp>=pxNeed(p.lvl)){p.xp-=pxNeed(p.lvl);p.lvl++;if(!quiet){log(`${PROFS[pid].name} niveau ${p.lvl} !`,"g");const nu=UNLOCK.indexOf(p.lvl);if(nu>=0)log(`Nouvelle ressource : ${PROFS[pid].res[nu][1]}.`,"g")}}}
  return n;
}

