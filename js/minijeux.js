/* Mini-jeux des métiers (objet MG, fenêtre #ov comme la forge).
   pêche : attendre la touche, ferrer, puis garder le poisson dans la zone verte (maintenir clic / Espace)
   bûcheron : coupe en rythme (3 coups sur l'entaille)   mineur : fissures brillantes (12 s)
   paysan : moisson (15 s, épis dorés seulement)         herboriste : mémoire des plantes (6 paires)
   Récompense : ressources du métier (+ XP de métier) selon le score. Pause de 15 s entre deux parties. */
const MG_CD=15;
const MG_INFO={
  pecheur:{n:"Pêche",d:"Attendez que ça morde, cliquez vite pour ferrer. Ensuite, gardez le curseur vert sur le poisson pendant 3 secondes : maintenez le clic (ou Espace) pour aller à droite, relâchez pour revenir à gauche. 15 s maximum."},
  bucheron:{n:"Coupe en rythme",d:"Cliquez (ou Espace) quand le curseur passe sur l'entaille. Trois coups de hache : au centre, c'est parfait."},
  mineur:{n:"Fissures brillantes",d:"Des fissures s'allument sur la paroi : cliquez-les avant qu'elles s'éteignent. Un coup dans le vide fait perdre un point."},
  paysan:{n:"Moisson",d:"Fauchez les épis dorés (mûrs). Les verts ne sont pas prêts, les bruns sont trop mûrs : ne cliquez pas dessus."},
  herboriste:{n:"Mémoire des plantes",d:"Retournez les cartes deux par deux pour retrouver les 6 paires, avec le moins d'essais possible."}};
let mg=null;
const mgCdLeft=pid=>Math.max(0,Math.ceil(((S.mgCd||{})[pid]||0)-S.time));
const mgNow=()=>performance.now()/1000;

function mgStart(pid){if(!MG_INFO[pid]||mg||mgCdLeft(pid)>0)return;
  mg={pid,t0:mgNow(),done:false};
  if(pid==="pecheur")Object.assign(mg,{st:"wait",bite:mgNow()+1.5+Math.random()*2.5,fish:null,z:.4,v:0,fy:.5,ft:.5,fnext:0,on:0,hold:false});
  if(pid==="bucheron")Object.assign(mg,{pts:[],speed:.7,zone:rnd(18,82),tt:mgNow()});
  if(pid==="mineur")Object.assign(mg,{cells:Array(12).fill(0),hits:0,miss:0,spawned:0,next:mgNow()+.6,end:mgNow()+12});
  if(pid==="paysan")Object.assign(mg,{pl:Array.from({length:15},()=>({t:mgNow()-Math.random()*3,g:2+Math.random()*2})),good:0,bad:0,end:mgNow()+15});
  if(pid==="herboriste"){const n=6,ids=[...Array(n).keys(),...Array(n).keys()].sort(()=>Math.random()-.5);Object.assign(mg,{cards:ids.map(i=>({i,up:false,ok:false})),sel:[],moves:0,pairs:0,lock:0})}
  mgDraw();requestAnimationFrame(mgLoop)}

/* ---------- Affichage ---------- */
function mgDraw(){const o=$("ov");o.hidden=false;const I=MG_INFO[mg.pid];
  o.innerHTML=`<div class="ovc mg mg-${mg.pid}"><div class="row" style="justify-content:space-between"><h2>${I.n}</h2><span class="small muted">${PROFS[mg.pid].name} · niv. ${S.jobs[mg.pid].lvl}</span></div>
  <p class="small muted" style="margin:0">${I.d}</p><div class="mgbody" id="mgbody">${mgBody()}</div>
  <div class="row"><button class="btn" data-a="mgQuit">Abandonner</button></div></div>`}
function mgBody(){const p=mg.pid;
  if(p==="pecheur")return`<div class="fishw"><div class="pond"><div class="bob" id="mgBob"></div><div class="mgmsg" id="mgMsg">Attendez que ça morde…</div></div>
    <div class="reel" id="mgReel" data-a="mgHold"><div class="rzone" id="mgZone"></div><img class="px rfish" id="mgFish" alt=""></div>
    <div class="rprog"><i id="mgProg"></i></div><div class="mgtop"><span>Sur le poisson : <b id="mgHits">0,0</b> / 3 s</span><span>Temps : <b id="mgTime">15</b> s</span></div></div>`;
  if(p==="bucheron")return`<div class="strikes">${[0,1,2].map(i=>`<span class="stk ${mg.pts[i]==null?"":mg.pts[i]===2?"pf":mg.pts[i]===1?"gd":"ms"}">${mg.pts[i]==null?"":mg.pts[i]===2?"Parfait":mg.pts[i]===1?"Bien":"Raté"}</span>`).join("")}</div>
    <div class="fbar log" data-a="mgHit"><div class="fgood" style="left:${mg.zone-11}%;width:22%"></div><div class="fperf" style="left:${mg.zone-3.5}%;width:7%"></div><div class="ftrack" id="mgTrack"><div class="fcur"></div></div></div>
    <button class="btn pri" data-a="mgHit" style="padding:10px 22px;font-size:15px">Couper <kbd>Espace</kbd></button>`;
  if(p==="mineur")return`<div class="mgtop"><span>Coups : <b id="mgHits">0</b></span><span>Temps : <b id="mgTime">12</b> s</span></div><div class="rock">${mg.cells.map((c,i)=>`<button class="crack" data-a="mgCell" data-i="${i}" id="mgc${i}"></button>`).join("")}</div>`;
  if(p==="paysan")return`<div class="mgtop"><span>Récolte : <b id="mgHits">0</b></span><span>Temps : <b id="mgTime">15</b> s</span></div><div class="field">${mg.pl.map((c,i)=>`<button class="ear" data-a="mgCell" data-i="${i}" id="mgc${i}"></button>`).join("")}</div>`;
  if(p==="herboriste")return`<div class="mgtop"><span>Paires : <b id="mgHits">${mg.pairs}</b> / 6</span><span>Essais : <b>${mg.moves}</b></span></div><div class="memo">${mg.cards.map((c,i)=>`<button class="card2${c.up||c.ok?" up":""}${c.ok?" ok":""}" data-a="mgCell" data-i="${i}">${c.up||c.ok?`<img class="px" src="${PX.plant(c.i)}" alt="">`:""}</button>`).join("")}</div>`;
  return""}

/* ---------- Boucle d'animation ---------- */
function mgLoop(){if(!mg||mg.done)return;const t=mgNow(),p=mg.pid;
  if(p==="pecheur")fishTick(t);
  if(p==="bucheron"){const e=$("mgTrack");if(e)e.style.transform=`translateX(${logPos()}%)`}
  if(p==="mineur"){if(t>=mg.end){mgEnd(Math.max(0,mg.hits-mg.miss*.5)/Math.max(6,mg.spawned*.8));return}
    if(t>=mg.next){const free=mg.cells.map((c,i)=>c<t?i:-1).filter(i=>i>=0);if(free.length){const i=free[rnd(0,free.length-1)],k=(t-mg.t0)/12;mg.cells[i]=t+1-.35*k;mg.spawned++}mg.next=t+.75-.3*(t-mg.t0)/12}
    mg.cells.forEach((c,i)=>{const e=$("mgc"+i);if(e)e.classList.toggle("lit",c>t)});const tm=$("mgTime");if(tm)tm.textContent=Math.ceil(mg.end-t)}
  if(p==="paysan"){if(t>=mg.end){mgEnd(Math.max(0,mg.good-mg.bad)/14);return}
    mg.pl.forEach((c,i)=>{const e=$("mgc"+i);if(e)e.dataset.s=earState(c,t)});const tm=$("mgTime");if(tm)tm.textContent=Math.ceil(mg.end-t)}
  requestAnimationFrame(mgLoop)}

/* Bûcheron : même curseur que la forge */
const logPos=()=>{const ph=((mgNow()-mg.tt)*mg.speed*100)%200;return ph<=100?ph:200-ph};
function logHit(){if(!mg||mg.done||mg.pid!=="bucheron")return;const d=Math.abs(logPos()-mg.zone),pt=d<=3.5?2:d<=11?1:0;mg.pts.push(pt);sfx(pt?"anvil":"anvilBad");
  if(mg.pts.length>=3){mgEnd(mg.pts.reduce((a,b)=>a+b,0)/6);return}mg.speed*=1.3;mg.zone=rnd(15,85);$("mgbody").innerHTML=mgBody()}

/* Paysan : vert (pousse) → doré (mûr, 1,4 s) → brun (trop mûr, 1 s) → repousse */
function earState(c,t){const a=t-c.t;if(a<c.g)return"g";if(a<c.g+1.4)return"r";if(a<c.g+2.4)return"b";c.t=t;c.g=2+Math.random()*2;return"g"}

function mgCell(i){if(!mg||mg.done)return;const t=mgNow(),p=mg.pid;
  if(p==="mineur"){if(mg.cells[i]>t){mg.cells[i]=0;mg.hits++;sfx("hit");const e=$("mgc"+i);if(e)replayCls(e,"pop")}else{mg.miss++;sfx("anvilBad")}const h=$("mgHits");if(h)h.textContent=mg.hits}
  if(p==="paysan"){const c=mg.pl[i],s=earState(c,t);if(s==="r"){mg.good++;sfx("coin")}else if(s==="g"){mg.bad++;sfx("anvilBad")}c.t=t;c.g=2+Math.random()*2;const h=$("mgHits");if(h)h.textContent=mg.good}
  if(p==="herboriste"){if(mg.lock>t)return;const c=mg.cards[i];if(c.up||c.ok)return;c.up=true;mg.sel.push(i);
    if(mg.sel.length===2){mg.moves++;const[a,b]=mg.sel.map(k=>mg.cards[k]);if(a.i===b.i){a.ok=b.ok=true;mg.pairs++;sfx("coin");mg.sel=[]}
      else{mg.lock=t+.75;const s=mg.sel;mg.sel=[];setTimeout(()=>{if(!mg||mg.pid!=="herboriste")return;s.forEach(k=>mg.cards[k].up=false);$("mgbody").innerHTML=mgBody()},750)}}
    $("mgbody").innerHTML=mgBody();if(mg.pairs===6)mgEnd(Math.max(.1,Math.min(1,1-(mg.moves-6)/12)))}}

/* ---------- Pêche ---------- */
function fishPick(){const L=S.jobs.pecheur.lvl,tier=Math.max(0,UNLOCK.filter(u=>u<=L).length-1),t=rnd(Math.max(0,tier-2),tier);
  const leg=FISH.filter(f=>f.rk===2&&f.t<=tier),r=Math.random(),pl=.03+L/4000,pr=.18+L/1000,pm=.003+L/60000;
  if(Math.random()<pm)return FISHBY.pm_prisma;
  if(leg.length&&r<pl)return leg[rnd(0,leg.length-1)];if(r<pl+pr)return FISH.find(f=>f.rk===1&&f.t===t);return FISH.find(f=>f.rk===0&&f.t===t)}
function fishTick(t){const m=mg;
  if(m.st==="wait"&&t>=m.bite){m.st="bite";m.biteEnd=t+.75;const b=$("mgBob");if(b)b.classList.add("bite");const g=$("mgMsg");if(g)g.textContent="Ça mord ! Cliquez !";sfx("hit")}
  else if(m.st==="bite"&&t>=m.biteEnd){mgEnd(0,"Le poisson s'est échappé : il fallait ferrer plus vite.");return}
  else if(m.st==="reel"){const dt=Math.min(.05,t-(m.last||t));m.last=t;const f=m.fish,sp=[.35,.5,.65,.8][f.rk]*(1+f.t/30),zw=[.2,.16,.13,.11][f.rk];
    if(t>=m.end){mgEnd(0,`${RES[f.id].name} s'est décroché : temps écoulé.`);return}
    /* curseur : maintenir = vers la droite, relâcher = vers la gauche */
    m.v+=(m.hold?3:-3)*dt;m.v=Math.max(-1.4,Math.min(1.4,m.v));m.z+=m.v*dt;if(m.z<0){m.z=0;m.v=Math.max(0,-m.v*.3)}if(m.z>1-zw){m.z=1-zw;m.v=Math.min(0,-m.v*.3)}
    /* le poisson change de cap régulièrement */
    if(t>=m.fnext){m.ft=.04+Math.random()*.92;m.fnext=t+(.6+Math.random()*(1.3-Math.min(2,f.rk)*.35))}m.fy+=Math.sign(m.ft-m.fy)*Math.min(Math.abs(m.ft-m.fy),sp*dt);
    const inZ=m.fy>=m.z&&m.fy<=m.z+zw;m.on=Math.max(0,m.on+(inZ?dt:-dt*.35));
    const Z=$("mgZone"),F=$("mgFish"),P=$("mgProg"),H=$("mgHits"),T=$("mgTime");
    if(Z){Z.style.left=m.z*100+"%";Z.style.width=zw*100+"%";Z.classList.toggle("in",inZ)}if(F){F.style.left=`calc(${m.fy*100}% - 16px)`;F.classList.toggle("flip",m.ft<m.fy)}
    if(P)P.style.width=Math.min(1,m.on/3)*100+"%";if(H)H.textContent=Math.min(3,m.on).toFixed(1).replace(".",",");if(T)T.textContent=Math.ceil(m.end-t);
    if(m.on>=3){mgEnd(1);return}}}
function fishHook(){const m=mg;if(!m||m.pid!=="pecheur"||m.done)return;
  if(m.st==="wait"){mgEnd(0,"Trop tôt ! Le poisson a eu peur.");return}
  if(m.st==="bite"){m.st="reel";m.fish=fishPick();m.last=mgNow();m.end=mgNow()+15;m.on=0;m.z=.4;m.fy=.5;const F=$("mgFish");if(F)F.src=PX.fish(m.fish.col,m.fish.rk,m.fish.t);const g=$("mgMsg");if(g)g.textContent=m.fish.rk===3?"✦ UN POISSON MYTHIQUE ✦":m.fish.rk===2?"Un poisson légendaire !":m.fish.rk===1?"Un poisson rare !":"Ferré !";
    const b=$("mgBob");if(b)b.classList.remove("bite");$("mgReel").classList.add("on")}}
function fishHold(on){if(mg&&mg.pid==="pecheur")mg.hold=on}

/* ---------- Fin de partie et récompense ---------- */
function mgEnd(score,why){const m=mg;if(!m||m.done)return;m.done=true;score=Math.max(0,Math.min(1,score));S.mgCd=S.mgCd||{};S.mgCd[m.pid]=S.time+MG_CD;inc("minigames");
  const pid=m.pid,J=S.jobs[pid];let html="",col="var(--gold)";
  if(pid==="pecheur"){if(score>=1&&m.fish){const f=m.fish,r=RES[f.id],cm=Math.round(f.cm*(.7+Math.random()*.6)),d=fdex(),e=d[f.id]||(d[f.id]={n:0,cm:0}),first=!e.n;e.n++;e.cm=Math.max(e.cm,cm);
      const n=addRes(f.id,1);gainProfXp(pid,[30,90,300,1500][f.rk]*Math.pow(f.t+1,1.4));if(f.rk)inc("fishRare");inc("fish");
      col=["var(--gold)","#8ad4ff","#ffd84a","#ff8ab0"][f.rk];log(`Pêche : ${r.name} (${cm} cm)${first?" · nouvelle espèce au Poissonnédia !":""}`,"g");if(f.rk===3){sfx("level");FX.flash("#ff8ab0");setTimeout(()=>FX.flash("#8ad4ff"),250);setTimeout(()=>FX.flash("#ffd84a"),500);toast("Poisson MYTHIQUE pêché : "+r.name+" !",1);inc("fishMyth")}else if(f.rk===2){sfx("level");FX.flash("#ffd84a")}else sfx("coin");
      html=`<img class="px mgres" src="${PX.fish(f.col,f.rk,f.t)}" alt=""><h2 style="color:${col}">${r.name}</h2><span class="small">${["Commun","Rare","Légendaire","✦ Mythique ✦"][f.rk]} · ${cm} cm${first?" · <b>nouvelle espèce !</b>":""}</span><span class="small muted">Se mange pour ${f.txt} pendant ${Math.round(f.d/60)} min.${n?"":" Sac plein : poisson relâché."}</span>`}
    else html=`<h2>Raté</h2><span class="small muted">${why||"Le poisson s'est échappé."}</span>`}
  else{const L=J.lvl,tier=Math.max(0,UNLOCK.filter(u=>u<=L).length-1),rid=S.job&&RES[S.job.r].prof===pid?S.job.r:PROFS[pid].res[tier][0];let n=Math.round(2+10*score);if(score>=.95)n=Math.round(n*1.5);
    let got=0;for(let i=0;i<n;i++)got+=gainGather(pid,rid,true);sfx(score>=.6?"coin":"anvilBad");log(`${MG_INFO[pid].n} : ${got}× ${RES[rid].name} (score ${Math.round(score*100)} %).`,"g");
    html=`<img class="px mgres" src="${PX.res(pid,RES[rid].tier)}" alt=""><h2 style="color:${col}">${score>=.95?"Parfait !":score>=.6?"Bien joué":score>=.3?"Pas mal":"Raté"}</h2><span class="small">Score ${Math.round(score*100)} % · <b>${got}× ${RES[rid].name}</b>${score>=.95?" (bonus ×1,5)":""}</span>`}
  $("ov").innerHTML=`<div class="ovc mg" style="text-align:center;align-items:center">${html}<div class="row" style="justify-content:center"><button class="btn pri" data-a="mgAgain" data-p="${pid}">Rejouer (${MG_CD} s)</button>${pid==="pecheur"?`<button class="btn" data-a="fishDex">Poissonnédia</button>`:""}<button class="btn" data-a="mgClose">Fermer</button></div></div>`;
  dirty=true}
function gainProfXp(pid,x){const p=S.jobs[pid];if(p.lvl>=PROF_MAX)return;p.xp+=Math.round(x);while(p.lvl<PROF_MAX&&p.xp>=pxNeed(p.lvl)){p.xp-=pxNeed(p.lvl);p.lvl++;log(`${PROFS[pid].name} niveau ${p.lvl} !`,"g");const nu=UNLOCK.indexOf(p.lvl);if(nu>=0)log(`Nouvelle ressource : ${PROFS[pid].res[nu][1]}.`,"g")}}
function mgClose(){mg=null;$("ov").hidden=true;renderPanel()}

/* Manger un poisson : boost temporaire */
function eatFish(id){const f=FISHBY[id];if(!f||!(S.res[id]>0))return;S.res[id]--;
  if(f.all){f.all.forEach(b=>pkBuff(b.k,b.v,f.d,RES[id].name+" · "+b.k));if(fx)FX.flash("#ff8ab0")}else pkBuff(f.k,f.v,f.d,RES[id].name);log(`Vous mangez : ${RES[id].name} (${f.txt}, ${Math.round(f.d/60)} min).`,"w");sfx("coin");dirty=true;renderPanel()}

/* Poissonnédia (onglet Collection) */
function fishDexHTML(){const d=fdex(),n=fishN();
  return`<div class="sec"><div class="row" style="justify-content:space-between"><h3>Poissonnédia · ${n} / ${FISH.length}</h3><span class="small">Bonus : <b>+${n} %</b> d'XP</span></div>
  <p class="small muted">Chaque espèce attrapée au mini-jeu de pêche donne +1 % d'XP. Les poissons rares et légendaires ne se pêchent qu'au mini-jeu. Mangez un poisson pour un boost temporaire.</p><div class="best fdex">`+
  FISH.map(f=>{const r=RES[f.id],e=d[f.id],k=!!e,q=S.res[f.id]||0;return`<div class="bc${k?"":" unk"} rk${f.rk}" data-tip="r:${f.id}"><img class="px" src="${PX.fish(f.col,f.rk,f.t)}" alt="" style="${k?"":"filter:brightness(0) opacity(.35)"}">
    <b class="small">${k?r.name:"???"}</b><span class="small muted">${f.rk===3?"N'importe quel monde":ZONES[f.t].name} · ${["commun","rare","légendaire","mythique"][f.rk]}</span><span class="small">${f.txt} · ${Math.round(f.d/60)} min</span>
    <span class="small muted">${k?`${e.n} pêché${e.n>1?"s":""} · record ${e.cm} cm`:"Jamais pêché"}</span>${q>0?`<button class="btn pri" data-a="eatFish" data-r="${f.id}">Manger (${fmt(q)})</button>`:""}</div>`}).join("")+`</div></div>`}
