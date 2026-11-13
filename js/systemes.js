/* Objets cliquables, quêtes du jour, marché, potions et événements météo. */
/* ================= Objets cliquables ================= */
const PICKUPS=[
  {id:"coffre",name:"Coffre égaré",w:30,g:"#f0c35a",txt:"2 minutes d'écus"},
  {id:"etoile",name:"Étoile filante",w:24,g:"#ffe27a",txt:"6 % d'un niveau en XP"},
  {id:"orbe",name:"Orbe de frénésie",w:15,g:"#ff7a3c",txt:"Dégâts ×3 pendant 15 s"},
  {id:"trefle",name:"Trèfle à quatre feuilles",w:13,g:"#8fe07a",txt:"Prospection ×3 pendant 30 s"},
  {id:"baluchon",name:"Baluchon",w:10,g:"#e8d6a0",txt:"Un tas de ressources"},
  {id:"parchemin",name:"Parchemin de sagesse",w:6,g:"#a99ee0",txt:"XP ×2 pendant 60 s"},
  {id:"oeuf",name:"Œuf de fortune",w:2,g:"#ff8ab0",txt:"Jackpot : écus ×8 et tous les bonus"},
];
const PK_LIFE=13,PK_MIN=45,PK_MAX=120;
function farmGold(sec){const st=stats(),z=ZONES[S.zone],ms=monsterStats(Math.round((z.lvl[0]+Math.min(zoneTop(z),Math.max(z.lvl[0],S.lvl+2)))/2));const bd=S.buffs.filter(b=>b.k==="dmg").reduce((a,b)=>a*b.v,1);return Math.round(ms.ecus/(ms.hp/(st.dps/bd)+.5)*sec)+10+S.lvl*3}
function spawnPk(){let r=Math.random()*PICKUPS.reduce((a,p)=>a+p.w,0),p=PICKUPS[0];for(const q of PICKUPS){if((r-=q.w)<0){p=q;break}}
  S.pk={id:p.id,until:S.time+PK_LIFE,x:12+Math.random()*76,y:18+Math.random()*55};drawPk()}
function drawPk(){const old=$("pk");if(old)old.remove();if(!S.pk)return;const p=PICKUPS.find(q=>q.id===S.pk.id);
  const b=document.createElement("button");b.id="pk";b.className="pickup";b.dataset.a="pickup";b.title=p.name;b.setAttribute("aria-label","Attraper : "+p.name);
  b.style.left=S.pk.x+"%";b.style.top=S.pk.y+"%";b.style.setProperty("--g",p.g);b.innerHTML=PX.img(PX.pickup(p.id));$("arena").appendChild(b)}
function pkBuff(k,v,d,n){S.buffs=S.buffs.filter(b=>b.n!==n);S.buffs.push({k,v,until:S.time+d,n})}
function takePk(){
  if(!S.pk)return;sfx("pickup");const p=PICKUPS.find(q=>q.id===S.pk.id);S.pk=null;drawPk();S.pkN++;S.pkNext=S.time+(PK_MIN+Math.random()*(PK_MAX-PK_MIN))*(up("aimant")?.7:1)*(1-talV("t_trefle")/100)*(evOn("nuit")?.5:1);inc("pickups");qProg("pickup");
  let msg="";
  const gold=m=>{const g=gainEcus(farmGold(120)*m);return`+${fmt(g)} écus`};
  const xp=()=>{if(S.lvl>=lvlMax())return gold(1);const x=Math.max(5,Math.round(xpNeed(S.lvl)*.06));gainXp(x);return`+${fmt(x)} XP`};
  if(p.id==="coffre")msg=gold(1);
  if(p.id==="etoile")msg=xp();
  if(p.id==="orbe"){pkBuff("dmg",3,15,"Frénésie");msg="Dégâts ×3 pendant 15 s"}
  if(p.id==="trefle"){pkBuff("pros",3,30,"Chance");msg="Prospection ×3 pendant 30 s"}
  if(p.id==="parchemin"){pkBuff("xp",2,60,"Inspiration");msg="XP ×2 pendant 60 s"}
  if(p.id==="baluchon"){const z=ZONES[S.zone],got=[];
    z.mons.forEach(m=>{const n=addRes(m.drop[0],rnd(2,5));if(n)got.push(`${n}× ${m.drop[1]}`)});
    const pr=Object.keys(PROFS)[rnd(0,2)],J=S.jobs[pr],t=UNLOCK.filter(u=>u<=J.lvl).length-1,rr=PROFS[pr].res[t],n=addRes(rr[0],rnd(5,12));if(n)got.push(`${n}× ${rr[1]}`);
    msg=got.join(", ")||"Sac plein, rien ramassé"}
  if(p.id==="oeuf"){msg=gold(8)+" · tous les bonus";pkBuff("dmg",3,20,"Frénésie");pkBuff("pros",3,20,"Chance");pkBuff("xp",2,20,"Inspiration")}
  log(`${p.name} : <span class="g">${msg}</span>`);if(fx){toast(`${p.name} : ${msg.replace(/<[^>]+>/g,"")}`);floatNum("✦","crit")}
  dirty=true;
}

/* ================= Quêtes, marché, potions ================= */
const today=()=>new Date().toLocaleDateString("fr-CA");
function makeQuest(){
  const open=ZONES.filter(z=>S.lvl>=z.lvl[0]),z=open[rnd(0,open.length-1)],t=Q_TYPES[rnd(0,Q_TYPES.length-1)],m=pickMon(z);
  const q={type:t,have:0,done:false,claimed:false};
  if(t==="kill"){q.key=m.id;q.need=rnd(15,40);q.txt=`Vaincre ${q.need} ${m.name}`}
  if(t==="killEl"){q.key=["feu","eau","terre","air"][rnd(0,3)];q.need=rnd(30,60);q.txt=`Vaincre ${q.need} monstres ${ELEMS[q.key].n}`}
  if(t==="gather"){const pid=Object.keys(PROFS)[rnd(0,3)],J=S.jobs[pid],tier=Math.max(0,UNLOCK.filter(u=>u<=J.lvl).length-1),r=PROFS[pid].res[tier];q.key=r[0];q.need=rnd(20,45);q.txt=`Récolter ${q.need} ${r[1]} (${PROFS[pid].name})`}
  if(t==="boss"){q.need=rnd(1,2);q.txt=`Vaincre ${q.need} boss de zone`}
  if(t==="pickup"){q.need=rnd(3,5);q.txt=`Attraper ${q.need} objets cliquables`}
  if(t==="craft"){q.need=rnd(2,4);q.txt=`Fabriquer ${q.need} objets ou potions`}
  if(t==="sell"){q.need=Math.max(200,Math.round(farmGold(180)/50)*50);q.txt=`Gagner ${fmt(q.need)} écus en vendant`}
  q.ecus=Math.round(farmGold(300));q.xp=S.lvl>=lvlMax()?0:Math.round(xpNeed(S.lvl)*.15);return q;
}
function ensureQuests(){const d=today();if(!S.q||S.q.day!==d){S.q={day:d,list:[0,1,2].map(makeQuest),reroll:1,bonus:false};dirty=true}}
function qProg(type,key,n=1){if(!S.q)return;S.q.list.forEach(q=>{if(q.done||q.type!==type)return;if(q.key!=null&&q.key!==key)return;q.have=Math.min(q.need,q.have+n);if(q.have>=q.need){q.done=true;if(S.opt.logQuests)log(`Quête terminée : ${q.txt}. Récupérez la récompense dans l'onglet Quêtes.`,"g");if(fx)toast("Quête terminée !")}dirty=true})}
function marketTick(){S.mkPrev={...S.mk};Object.values(RES).forEach(r=>{if(r.kind==="k")return;const m=S.mk[r.id]||1;S.mk[r.id]=+Math.min(MK_MAX,Math.max(MK_MIN,m+(Math.random()-.5)*.25+(1-m)*.08)).toFixed(3)})}
function trend(k){const a=mkOf(k),b=(S.mkPrev&&S.mkPrev[k])||1;return a>b+.005?"▲":a<b-.005?"▼":"="}
function sellRes(k,n){n=Math.min(n,S.res[k]||0);if(n<=0)return 0;sfx("coin");let g=0;for(let i=0;i<n;i++){g+=priceOf(k);if(RES[k].kind!=="k")S.mk[k]=Math.max(MK_MIN,mkOf(k)-MK_SELL)}S.res[k]-=n;g=gainEcus(g);qProg("sell",null,g);return g}
function brew(id,n){const r=RES[id];let made=0;while(n-->0){if(S.jobs.herboriste.lvl<r.plvl||!r.recipe.every(([x,q])=>(S.res[x]||0)>=q))break;r.recipe.forEach(([x,q])=>S.res[x]-=q);S.res[id]=(S.res[id]||0)+1;made++;inc("brews");inc("crafts");qProg("craft");
    const J=S.jobs.herboriste;if(J.lvl<PROF_MAX){J.xp+=Math.round(20*Math.pow(r.tier+1,1.6));while(J.lvl<PROF_MAX&&J.xp>=pxNeed(J.lvl)){J.xp-=pxNeed(J.lvl);J.lvl++;log(`Herboriste niveau ${J.lvl} !`,"g")}}}
  if(made)toast(`${made}× ${r.name} préparée${made>1?"s":""}`);dirty=true;return made}
function drink(id,auto){const r=RES[id];if(!r||r.kind!=="p"||!(S.res[id]>0)||S.ko>0)return;const st=stats();S.res[id]--;inc("potions");
  if(r.fx.heal){const h=Math.round(st.maxHp*r.fx.heal);S.hp=Math.min(st.maxHp,S.hp+h);if(fx){floatNum("+"+fmt(h),"heal");FX.heal()}}
  else pkBuff(r.fx.k,r.fx.v,r.fx.d,r.name);
  if(!auto)log(`Vous buvez : ${r.name}.`,"w");dirty=true;drawPots()}
let potSig="";
function drawPots(){const ids=POTIONS.map(p=>p[0]).filter(id=>S.res[id]>0),sig=ids.map(id=>id+S.res[id]).join()+S.autoPot;if(sig===potSig)return;potSig=sig;
  $("pots").innerHTML=ids.length||S.autoPot?ids.map(id=>`<button class="btn" data-a="drink" data-r="${id}" data-tip="r:${id}" style="--ic:${RES[id].col}" title="${RES[id].txt}"><span style="color:${RES[id].col}">${glyph("potion").replace("<svg",'<svg style="width:14px;height:14px;vertical-align:-2px"')}</span> ${RES[id].name} <span class="num muted">×${S.res[id]}</span></button>`).join("")+`<label class="autot" style="margin:0"><input type="checkbox" id="autoPot" ${S.autoPot?"checked":""}> Boire une potion de soin sous ${S.opt.potThreshold} % de PV</label>`:""}

/* ================= Événements ================= */
function startEvent(){const e=EVENTS[rnd(0,EVENTS.length-1)];S.ev={id:e.id,until:S.time+EV_DUR};log(`Événement : <b style="color:${e.c}">${e.n}</b> pendant 2 minutes. ${e.txt}.`,"g");if(fx){toast(`${e.n} : ${e.txt}`);sfx("event")}drawWeather();dirty=true}
function drawWeather(){const w=$("weather");w.className="weather"+(S.ev&&(!S.opt||S.opt.weatherFx)?" on w-"+S.ev.id:"");VIE.weather()}

