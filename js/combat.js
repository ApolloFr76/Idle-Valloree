/* Combat : XP, coups, mort des monstres, butin, attaques du héros et effets visuels (FX). */
/* ================= Actions de jeu ================= */
function gainXp(x){
  S.xp+=x;inc("xp",x);let up=false;
  while(S.lvl<LVL_MAX&&S.xp>=xpNeed(S.lvl)){S.xp-=xpNeed(S.lvl);S.lvl++;S.pts+=PTS_PER_LVL;up=true;checkUnlocks(!fx);
    const sp=CLASSES[S.cls].spells.find(s=>s.lvl===S.lvl);log(`Niveau ${S.lvl} ! +${PTS_PER_LVL} points de caractéristiques.`,"g");if(sp)log(`Nouveau sort : ${sp.name}.`,"g")}
  if(S.lvl>=LVL_MAX)S.xp=0;
  mx("maxLvl",S.lvl);
  if(up){sfx("level");if(fx)FX.lvl(S.lvl);S.hp=stats().maxHp;dirty=true;drawSpells();drawZones();if(fx)toast(`Niveau ${S.lvl} !`)}
}
const bagCap=()=>1000+100*S.lvl+(up("sac1")?2000:0)+(up("sac2")?8000:0)+Math.round(talV("t_sac"));
function bagWeight(){const eq=new Set(Object.values(S.equip));let w=0;for(const k in S.res)w+=S.res[k]||0;S.items.forEach(i=>{if(!eq.has(i.u))w+=10});return w}
let fullWarn=0;
function addRes(id,n){let room=Math.max(0,bagCap()-bagWeight());
  if(room<n&&S.opt.autoSellFull){const big=Object.keys(S.res).filter(k=>S.res[k]>0&&RES[k].kind!=="k"&&RES[k].kind!=="p").sort((a,b)=>S.res[b]-S.res[a])[0];if(big){const q=S.res[big],g=sellRes(big,q);log(`Sac plein : ${fmt(q)}× ${RES[big].name} vendus automatiquement (+${fmt(g)} écus).`,"g");room=Math.max(0,bagCap()-bagWeight())}}
  n=Math.min(n,room);
  if(n<=0){if(S.time-fullWarn>30){fullWarn=S.time;log("Sac plein : vendez des ressources dans l'Inventaire pour continuer à ramasser.","r");if(fx)toast("Sac plein")}return 0}
  S.res[id]=(S.res[id]||0)+n;if(S.seen)S.seen[id]=1;dirty=true;return n}
function hitMon(r,kind){
  if(!S.mon||S.ko>0)return;if(fx&&(kind==="click"||kind==="spell"||kind==="auto"))heroAtk(kind==="spell");S.mon.hp-=r.v;inc("dmg",r.v);mx("maxHit",r.v);if(kind==="click"||kind==="spell")sfx(r.crit?"crit":"hit");
  if(fx){floatNum(fmt(r.v)+(r.crit?" !":""),(r.crit?"crit ":"")+(kind==="dot"?"dot ":"")+(r.r<0?"eff":r.r>0?"resi":""));replayCls($("mon"),"hit");if(r.crit&&(kind==="click"||kind==="spell")&&performance.now()-(hitMon.ct||0)>250){hitMon.ct=performance.now();FX.crit()}}
  if(S.mon.hp<=0)kill();
}
/* Attaque du héros : projectile pour le mage (orbe) et l'archer (flèche), coup au corps à corps sinon */
let atkT=0;
function heroAtk(big){const now=performance.now();if(!big&&now-atkT<110)return;atkT=now;const h=$("ahero"),m=$("monBtn"),box=$("mon");if(!h||h.hidden||!m)return;
  const ranged=S.cls==="mage"||S.cls==="archer";h.classList.remove("atk","cast");void h.offsetWidth;h.classList.add(ranged?"cast":"atk");
  if(!ranged){const sl=document.createElement("i");sl.className="slash"+(big?" big":"");sl.style.left=(m.offsetLeft+m.offsetWidth*.3)+"px";sl.style.top=(m.offsetTop+m.offsetHeight*.25)+"px";box.appendChild(sl);setTimeout(()=>sl.remove(),260);return}
  const p=document.createElement("i");p.className=(S.cls==="mage"?"orb":"arrow")+(big?" big":"");const x0=h.offsetLeft+h.offsetWidth*.75,y0=h.offsetTop+h.offsetHeight*.42,x1=m.offsetLeft+m.offsetWidth*.42,y1=m.offsetTop+m.offsetHeight*.5;
  p.style.left=x0+"px";p.style.top=y0+"px";box.appendChild(p);const d=S.cls==="mage"?240:170;
  p.animate([{transform:"translate(0,0) scale(.6)"},{transform:`translate(${(x1-x0)/2}px,${(y1-y0)/2-(S.cls==="archer"?14:6)}px) scale(1)`},{transform:`translate(${x1-x0}px,${y1-y0}px) scale(1)`}],{duration:d,easing:"linear"}).onfinish=()=>{p.remove();
    if(S.cls==="mage"){const b=document.createElement("i");b.className="burst"+(big?" big":"");b.style.left=x1+"px";b.style.top=y1+"px";box.appendChild(b);setTimeout(()=>b.remove(),300)}}}

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
    crit(){if(!fx)return;const m=monBox();if(!m)return;add("critburst",m.x+m.w/2,m.y+m.h/2,380);parts(m.x+m.w/2,m.y+m.h/2,10,["#fff","#ffd36a","#ff8a3c"],70,500);shake(false)},
    monAtk(){if(!fx)return;const b=$("monBtn");if(b)replayCls(b,"matk");
      const h=$("ahero");if(h)replayCls(h,"hurt");const hb=heroBox();if(hb){add("claw",hb.x+hb.w*.55,hb.y+hb.h*.3,300);parts(hb.x+hb.w*.6,hb.y+hb.h*.45,5,["#ff5a4a","#ffb0a0"],34,400,3)}},
    dodge(){if(!fx)return;const h=$("ahero");if(h)replayCls(h,"dodge")},
    heal(){if(!fx)return;const hb=heroBox();if(!hb)return;for(let i=0;i<8;i++){const e=add("plus",hb.x+hb.w*(.2+Math.random()*.6),hb.y+hb.h*(.3+Math.random()*.5),900,"+");e.style.animationDelay=(i*50)+"ms"}},
    spawn(boss){if(!fx)return;const mb=$("mon");mb.classList.remove("spawn","bspawn");void mb.offsetWidth;mb.classList.add(boss?"bspawn":"spawn");const m=monBox();if(m)add("puff",m.x+m.w/2,m.y+m.h*.85,420);
      if(boss){const d=MON[S.mon.id];banner("Boss !",d.name,"boss",1700);replayCls(A(),"bossflash");shake(true);sfx("event")}},
    death(boss){if(!fx)return;const b=$("monBtn"),m=monBox();if(!b||!m||!b.firstElementChild)return;const g=add("ghost",m.x,m.y,520,b.innerHTML);g.style.width=m.w+"px";g.style.height=m.h+"px";
      const cx=m.x+m.w/2,cy=m.y+m.h/2;parts(cx,cy,boss?26:12,boss?["#ffd36a","#fff","#ff8a3c","#c9a8ff"]:["#fff6d8","#c4a878","#ffffff"],boss?120:70,boss?900:550,boss?5:4);add("poof",cx,cy,500);
      for(let i=0;i<(boss?8:3);i++){const c=add("coin",cx,cy,800);const dx=(Math.random()-.5)*90,dy=-40-Math.random()*40;c.animate([{transform:"translate(-50%,-50%)"},{transform:`translate(calc(-50% + ${dx/2}px),calc(-50% + ${dy}px))`,offset:.45},{transform:`translate(calc(-50% + ${dx}px),calc(-50% + 30px))`,opacity:0}],{duration:780,easing:"ease-out",fill:"forwards"})}
      if(boss){shake(true);banner("Victoire !","","win",1300)}},
    loot(icon,rare){if(!fx)return;const m=monBox();if(!m)return;const e=add("loot"+(rare?" rare":""),m.x+m.w*(.25+Math.random()*.5),m.y+m.h*.45,rare?1500:1000,icon);if(rare){parts(m.x+m.w/2,m.y+m.h/2,14,["#ffd36a","#fff","#b98cff"],80,800);shake(false)}},
    ko(){if(!fx)return;replayCls(A(),"kofx");banner("K.O.","","ko",2000);const hb=heroBox();if(hb)parts(hb.x+hb.w/2,hb.y+hb.h/2,14,["#ff5a4a","#6a2030","#fff"],70,800);shake(true)},
    lvl(n){if(!fx)return;const hb=heroBox();if(hb){add("pillar",hb.x+hb.w/2,0,1100);parts(hb.x+hb.w/2,hb.y+hb.h*.6,20,["#ffd36a","#fff6d8","#9be07a"],90,1000)}banner("Niveau "+n+" !","+"+PTS_PER_LVL+" points","lvl",1500)},
    flash(col){if(!fx)return;const e=add("flash",0,0,500);e.style.background=col},
    omega(n){const o=document.createElement("div");o.className="omegafx";o.innerHTML=`<div class="om">Ω</div><b>Oméga ${n}</b><span>Une nouvelle vie commence</span>`;document.body.appendChild(o);for(let i=0;i<24;i++){const r=document.createElement("i");r.style.setProperty("--a",(i*15)+"deg");o.appendChild(r)}setTimeout(()=>o.remove(),2600)},
    ach(name){if(!fx)return;banner("Succès !",name,"ach",1500)}
  }})();
function kill(){
  if(fx)FX.death(MON[S.mon.id].boss);
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
  sp.fx.forEach(f=>{
    if(f.t==="hit")hitMon(roll(f.m*C.spellMult,st),"spell");
    if(f.t==="dot")S.dots.push({m:f.m*C.spellMult,until:S.time+f.d,acc:0});
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

