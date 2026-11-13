/* Rendu commun : arène, barres, sorts, journal, liste des onglets, glisser-déposer, renderPanel. */
/* ================= Rendu ================= */
function floatNum(txt,cls){const dn=S.opt&&S.opt.dmgNums;if(dn==="none"||dn==="crit"&&!/crit|heal/.test(cls))return;const e=document.createElement("div");e.className="float "+cls;e.textContent=txt;e.style.left=(cls==="hurt"?22+Math.random()*10:50+Math.random()*22)+"%";$("arena").appendChild(e);setTimeout(()=>e.remove(),950)}
function drawHero(){const C=CLASSES[S.cls];{const a=$("ahero");a.hidden=!C;if(C)a.src=PX.hero(S.cls,C.col)}$("heroBox").innerHTML=C?`${emb(S.cls)}<div><div class="nm">${esc(S.name)}</div><div class="sub">${C.name}</div></div>`:""}
/* Choix du monde : une liste déroulante (les mondes débloqués + le prochain, grisé) pour ne pas faire défiler la colonne */
function drawZones(){const opts=ZONES.map((z,i)=>i>1&&S.lvl<ZONES[i-1].lvl[0]?"":`<option value="${i}"${i===S.zone?" selected":""}${S.lvl<z.lvl[0]?" disabled":""}>${z.name} · Niv. ${z.lvl[0]}–${z.lvl[1]}${S.lvl<z.lvl[0]?" · verrouillée":""}</option>`).join("");
  $("zones").innerHTML=`<label class="zsel"><span>Monde</span><select id="zoneSel" data-tip="z:${S.zone}" aria-label="Choisir le monde">${opts}</select></label>`;
  const z=ZONES[S.zone];const A=$("arena");A.style.backgroundImage=`url(${PX.scene(z.id)})`;A.style.backgroundColor=PX.ground(z.id);setBiome(z.id);VIE.deco(z.id);SCENE.layers(z.id)}
function drawMonster(){const b=$("monBtn");if(!S.mon){b.innerHTML="";$("mName").textContent="…";$("mLvl").textContent="";$("mEl").innerHTML="";return}const d=MON[S.mon.id];b.innerHTML=monsterSVG(d);$("mName").textContent=(S.mon.shiny?"✦ ":"")+d.name;$("mon").classList.toggle("shiny",!!S.mon.shiny);$("mLvl").textContent="Niv. "+S.mon.lvl;$("mEl").innerHTML=elChip(d.el)+`<span class="small">Faible : ${ELEMS[weakTo(d.el)].n} · Résiste : ${ELEMS[d.el].n}, ${ELEMS[BEATS[d.el]].n}</span>`}
function drawSpells(){if(!S.cls)return;$("spells").innerHTML=CLASSES[S.cls].spells.map(sp=>{const lock=S.lvl<sp.lvl;return`<div class="spellwrap"><button class="spell${lock?" lock":""}" data-a="cast" data-tip="sp:${sp.id}" id="sp-${sp.id}" data-sp="${sp.id}" ${lock?"disabled":""}><b>${sp.name}</b><small>${lock?"Débloqué au niveau "+sp.lvl:sp.txt+" · "+(+spCd(sp).toFixed(1))+" s"}</small><span class="cd" id="cd-${sp.id}"></span></button>${lock?"":`<label class="autot"><input type="checkbox" id="auto-${sp.id}" data-a="auto" data-s="${sp.id}" ${S.auto[sp.id]?"checked":""}> Lancer automatiquement</label>`}</div>`}).join("")}
let mbSig="";
function drawModeBar(){
  if(!tabOpen("aventure")){if(mbSig!=="lock"){mbSig="lock";$("modeBar").innerHTML=`<span class="info">Boss, donjons et tour : niveau ${TAB_LOCK.aventure}</span>`}return}
  const m=S.mode,z=S.zone,k=S.zk[z]||0,keys=S.res["cle_"+z]||0;
  const sig=[m,z,k,keys,S.tower.best,S.tower.cur,S.dg&&S.dg.wave,S.ko>0].join("|");
  if(sig!==mbSig){mbSig=sig;let h="";
    if(m==="zone")h=`<span class="info">Boss : <b class="num">${k}/${BOSS_KILLS}</b></span>${k>=BOSS_KILLS?`<button class="btn pri" data-a="mode" data-m="boss">Défier ${MON["boss_"+z].name}</button>`:""}${keys?`<button class="btn" data-a="mode" data-m="donjon" data-z="${z}">Donjon (${keys} clé${keys>1?"s":""})</button>`:""}<button class="btn" data-a="mode" data-m="tour" style="margin-left:auto">Tour · record ${S.tower.best}</button>`;
    else{let lbl;if(m==="boss")lbl=`Boss : ${MON["boss_"+z].name}`;else if(m==="tour")lbl=`Tour · étage ${S.tower.cur}`;else lbl=`${DUNGEONS[S.dg.z]} · vague ${Math.min(S.dg.wave,DG_WAVES)}/${DG_WAVES}`;
      h=`<span class="info"><b style="color:var(--gold)">${lbl}</b></span>${m!=="donjon"?`<div class="mtimer"><div class="bar" id="mtBar"><i id="mtFill"></i></div></div><span class="info num" id="mtTxt"></span>`:`<span style="flex:1"></span>`}<button class="btn dng" data-a="quit">Abandonner</button>`}
    $("modeBar").innerHTML=h;$("arena").classList.toggle("special",m!=="zone")}
  if(m==="boss"||m==="tour"){const tot=m==="boss"?bossTime():towerTime(),f=$("mtFill");if(f){f.style.width=Math.max(0,S.timer/tot*100)+"%";$("mtBar").classList.toggle("low",S.timer<8);$("mtTxt").textContent=Math.max(0,Math.ceil(S.timer))+" s"}}
}
function renderLog(){const L=S.opt?S.opt.logLines:8,now=Date.now();$("log").hidden=L===0;$("log").innerHTML=S.log.slice(0,L).map(l=>`<div class="${l.c}${l.t&&now-l.t<700?" new":""}">${logIcon(l)}<span>${l.h}</span></div>`).join("")}
/* Compagnons : voir SCENE.drawPals() dans js/scene.js (équipe en formation) */
function live(){
  if(!S.cls)return;const st=stats(),need=xpNeed(S.lvl),maxed=S.lvl>=lvlMax();SCENE.drawPals();
  $("lvlTxt").textContent="Niveau "+S.lvl+(S.prest?" · Ω "+S.prest:"");$("xpTxt").textContent=maxed?"Niveau maximum":`${fmt(S.xp)} / ${fmt(need)} XP`;$("xpBar").style.width=(maxed?100:S.xp/need*100)+"%";
  $("ecusTxt").textContent=fmt(VIE.ecus());
  $("pHpTxt").textContent=`${fmt(S.hp)} / ${fmt(st.maxHp)}`;$("pHpBar").style.width=(S.hp/st.maxHp*100)+"%";SCENE.lag("pHpLag",S.hp/st.maxHp*100);
  if(S.mon){$("mHpTxt").textContent=`${fmt(Math.max(0,S.mon.hp))} / ${fmt(S.mon.max)}`;$("mHpBar").style.width=Math.max(0,S.mon.hp/S.mon.max*100)+"%";SCENE.lag("mHpLag",Math.max(0,S.mon.hp/S.mon.max*100))}else{$("mHpTxt").textContent="";$("mHpBar").style.width="0%";SCENE.lag("mHpLag",0)}
  {const pk=$("pk");if(pk)pk.classList.toggle("fade",S.pk&&S.pk.until-S.time<3)}
  drawModeBar();drawPots();drawGoals();
  {const c=$("combo");c.hidden=S.combo<1;if(S.combo>=1){$("comboN").textContent="Combo "+Math.floor(S.combo);$("comboBar").style.width=(S.combo/comboMax()*100)+"%"}}
  const ad=allyDps(),buffs=$("buffs");if(ad>0)buffs.dataset.ally=fmt(ad);
  $("ko").hidden=!(S.ko>0);if(S.ko>0)$("koT").textContent=Math.ceil(S.ko);$("mon").classList.toggle("ko",S.ko>0);
  const r=S.mon?monRes(MON[S.mon.id].el,st.el):0,elTxt=elChip(st.el,`Vous : ${ELEMS[st.el].n}${S.mon&&st.el!=="neutre"?(r<0?" · efficace":r>0?` · résisté ${r} %`:""):""}`);
  buffs.innerHTML=elTxt+(S.ev?(e=>`<span class="chip evchip" style="color:${e.c};border-color:${e.c}" title="${e.txt}">${e.n} · ${Math.ceil(S.ev.until-S.time)} s</span>`)(EVENTS.find(e=>e.id===S.ev.id)):"")+(ad>0?`<span class="chip">Compagnons · ${fmt(ad)}/s</span>`:"")+S.buffs.map(b=>`<span class="chip">${b.n} · ${Math.ceil(b.until-S.time)} s</span>`).join("")+(S.dots.length?`<span class="chip">Brûlure · ${Math.ceil(Math.max(...S.dots.map(d=>d.until))-S.time)} s</span>`:"")+(S.job?`<span class="chip">${PROFS[RES[S.job.r].prof].name} : ${RES[S.job.r].name}</span>`:"")+(bagWeight()>=bagCap()?`<span class="chip" style="color:var(--hp)">Sac plein</span>`:"");
  CLASSES[S.cls].spells.forEach(sp=>{const b=$("sp-"+sp.id),c=$("cd-"+sp.id);if(!b||!c)return;const rem=Math.max(0,(S.cds[sp.id]||0)-S.time);c.style.width=(rem/spCd(sp,st)*100)+"%";b.classList.toggle("wait",rem>0)});
  if(S.job){const r=RES[S.job.r],e=$("gp-"+r.id);if(e)e.style.width=(S.job.t/gatherTime(r.prof,r.tier)*100)+"%"}
}

/* --- Onglets --- */
const TABS=[["perso","Personnage"],["inv","Inventaire"],["aventure","Aventure"],["allies","Compagnons"],["shop","Boutique"],["quests","Quêtes"],["market","Marché"],["prest","Oméga"],["coll","Collection"],["atelier","Atelier"],["metiers","Métiers"],["opts","Options"]];
function canCraft(it){return S.lvl>=it.lvl&&it.recipe.every(([r,q])=>(S.res[r]||0)>=q)}
/* ================= Glisser-déposer des objets vers les emplacements ================= */
const DRAG={on:false,p:null,skip:0};
function dropEquip(u,k,from){const inst=S.items.find(x=>x.u===u);if(!inst)return;const it=ITEMS[inst.id];
  if(EQ[k].t!==it.slot){toast(`${it.name} ne va pas dans l'emplacement ${EQ[k].n}`);return}
  if(S.lvl<it.lvl){toast(`Niveau ${it.lvl} requis`);return}
  if(it.slot==="trophee"&&Object.entries(S.equip).some(([kk,v])=>v!==u&&kk!==k&&kk.startsWith("trophee")&&S.items.find(x=>x.u===v)?.id===it.id)){toast("Ce trophée est déjà équipé");return}
  const before=S.equip[k];for(const kk in S.equip)if(S.equip[kk]===u)delete S.equip[kk];
  S.equip[k]=u;if(from&&before&&before!==u)S.equip[from]=before;
  selSlot=k;selInv=null;selLast="slot";S.hp=Math.min(S.hp,stats().maxHp)}
document.addEventListener("pointerdown",e=>{if(e.button||!S)return;const el=e.target.closest('.tile[data-v^="u:"],.eslot.full');if(!el||!el.closest("#panel"))return;
  const u=el.dataset.v?+el.dataset.v.slice(2):S.equip[el.dataset.s];if(!u)return;DRAG.p={u,from:el.dataset.s||null,x:e.clientX,y:e.clientY,el,id:e.pointerId}});
document.addEventListener("pointermove",e=>{const p=DRAG.p;if(!p||e.pointerId!==p.id)return;
  if(!DRAG.on){if(Math.hypot(e.clientX-p.x,e.clientY-p.y)<7)return;const inst=S.items.find(i=>i.u===p.u);if(!inst){DRAG.p=null;return}
    DRAG.on=true;p.it=ITEMS[inst.id];const g=document.createElement("div");g.className="dragghost";g.innerHTML=itIcon(p.it);document.body.appendChild(g);p.g=g;
    p.el.classList.add("dragsrc");document.body.classList.add("dragging");
    document.querySelectorAll("#panel .eslot").forEach(sl=>{if(EQ[sl.dataset.s]&&EQ[sl.dataset.s].t===p.it.slot&&sl.dataset.s!==p.from)sl.classList.add("dropok")});
    if(p.from)document.querySelector("#panel .igrid")?.classList.add("dropok")}
  p.g.style.transform=`translate(${e.clientX-28}px,${e.clientY-28}px)`;
  const t=document.elementFromPoint(e.clientX,e.clientY)?.closest(".dropok");document.querySelectorAll(".dropover").forEach(x=>{if(x!==t)x.classList.remove("dropover")});if(t)t.classList.add("dropover")});
function dragEnd(e){const p=DRAG.p;if(!p||e.pointerId!==p.id)return;DRAG.p=null;if(!DRAG.on)return;DRAG.on=false;p.g.remove();document.body.classList.remove("dragging");
  const t=e.type==="pointerup"?document.elementFromPoint(e.clientX,e.clientY):null,sl=t&&t.closest("#panel .eslot"),gr=t&&t.closest("#panel .igrid");
  if(sl&&EQ[sl.dataset.s]){if(sl.dataset.s!==p.from)dropEquip(p.u,sl.dataset.s,p.from)}
  else if(gr&&p.from){delete S.equip[p.from];selSlot=null;S.hp=Math.min(S.hp,stats().maxHp)}
  DRAG.skip=Date.now();dirty=true;ptrDown=false;renderPanel(true)}
document.addEventListener("pointerup",dragEnd);document.addEventListener("pointercancel",dragEnd);
document.addEventListener("click",e=>{if(Date.now()-DRAG.skip<350){e.stopPropagation();e.preventDefault()}},true);
document.addEventListener("dragstart",e=>{if(e.target.closest&&e.target.closest("#panel"))e.preventDefault()});
let lastTabAnim="";
/* setHTML : met à jour un bloc sans tout recréer. Seuls les nœuds qui changent sont modifiés, donc les images
   déjà affichées ne sont pas rechargées (évite le clignotement blanc et les sauts du panneau central). */
const morphTpl=document.createElement("template");
function morph(a,b){
  if(a.nodeType!==b.nodeType||a.nodeName!==b.nodeName){a.replaceWith(b);return}
  if(a.nodeType===3||a.nodeType===8){if(a.nodeValue!==b.nodeValue)a.nodeValue=b.nodeValue;return}
  for(const at of [...a.attributes])if(!b.hasAttribute(at.name))a.removeAttribute(at.name);
  for(const at of b.attributes)if(a.getAttribute(at.name)!==at.value)a.setAttribute(at.name,at.value);
  if(a.nodeName==="INPUT"){if(a.value!==b.value)a.value=b.value;if(a.checked!==b.checked)a.checked=b.checked}
  morphKids(a,b);if(a.nodeName==="SELECT"&&a.value!==b.value)a.value=b.value}
function morphKids(a,b){const A=[...a.childNodes],B=[...b.childNodes];
  for(let i=0;i<B.length;i++){if(i<A.length)morph(A[i],B[i]);else a.appendChild(B[i])}
  for(let i=B.length;i<A.length;i++)A[i].remove()}
function setHTML(el,html){if(el._html===html)return;el._html=html;morphTpl.innerHTML=html;morphKids(el,morphTpl.content)}
function renderPanel(force){if(DRAG.on){dirty=true;return}
  if(!S.cls)return;if(ptrDown&&!force){dirty=true;return}dirty=false;
  const anyCraft=Object.values(ITEMS).some(canCraft);
  if(!tabOpen(S.tab))S.tab="perso";
  setHTML($("tabs"),TABS.map(([k,n])=>!tabOpen(k)?`<button class="tab locked" data-a="tabLocked" data-t="${k}" data-tip="lk:${k}" aria-label="Onglet verrouillé, niveau ${TAB_LOCK[k]}">${LOCK_SVG}</button>`:`<button class="tab${S.tab===k?" on":""}" data-a="tab" data-t="${k}">${n}${k==="perso"&&S.pts>0||k==="atelier"&&anyCraft||k==="aventure"&&(S.zk[S.zone]||0)>=BOSS_KILLS||k==="prest"&&soulsGain()>0&&!S.prest||k==="quests"&&S.q&&S.q.list.some(q=>q.done&&!q.claimed)?'<span class="dot"></span>':""}</button>`).join(""));
  const sy=$("panel").scrollTop, open=[...document.querySelectorAll("details.set[open]")].map(d=>d.dataset.z);
  $("panel").dataset.tab=S.tab;$("panel").dataset.sub=S.tab==="perso"?ptab:S.tab==="coll"?ctab:"";setHTML($("panel"),(({perso:pPerso,inv:pInv,aventure:pAdv,allies:pAllies,shop:pShop,prest:pPrest,coll:pColl,quests:pQuests,market:pMarket,atelier:pAtelier,metiers:pMetiers,opts:pOpts})[S.tab]||pPerso)());if(S.tab!==lastTabAnim){if(lastTabAnim)replayCls($("panel"),"tabin");lastTabAnim=S.tab}
  open.forEach(z=>{const d=document.querySelector(`details.set[data-z="${z}"]`);if(d)d.open=true});
  $("panel").scrollTop=sy;
}
function statsTxt(o){return Object.entries(o).map(([k,v])=>k==="crit"?`+${v} % critique`:`+${fmt(v)} ${STAT_LBL[k]}`).join(" · ")}
let ptab="resume";
const SI={vit:'<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M4 3h8v1h-8zM3 4h10v1h-10zM3 5h2v1h-2zM7 5h2v1h-2zM11 5h2v1h-2zM2 6h2v1h-2zM12 6h2v1h-2zM2 7h2v1h-2zM12 7h2v1h-2zM3 8h2v1h-2zM11 8h2v1h-2zM3 9h2v1h-2zM11 9h2v1h-2zM4 10h2v1h-2zM10 10h2v1h-2zM4 11h3v1h-3zM9 11h3v1h-3zM5 12h6v1h-6zM7 13h2v1h-2z"/>',
  puissance:'<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M8 1h2v1h-2zM8 2h2v1h-2zM7 3h3v1h-3zM6 4h4v1h-4zM5 5h5v1h-5zM4 6h3v1h-3zM8 6h6v1h-6zM4 7h2v1h-2zM8 7h5v1h-5zM3 8h5v1h-5zM10 8h2v1h-2zM2 9h6v1h-6zM9 9h3v1h-3zM6 10h5v1h-5zM6 11h4v1h-4zM6 12h3v1h-3zM6 13h2v1h-2zM6 14h2v1h-2z"/>',
  agi:'<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M9 3h1v1h-1zM2 4h9v1h-9zM2 5h6v1h-6zM9 5h3v1h-3zM10 6h3v1h-3zM2 7h8v1h-8zM11 7h3v1h-3zM2 8h8v1h-8zM11 8h3v1h-3zM10 9h3v1h-3zM2 10h6v1h-6zM9 10h3v1h-3zM2 11h9v1h-9zM9 12h1v1h-1z"/>',
  sagesse:'<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M5 3h6v1h-6zM4 4h8v1h-8zM2 5h4v1h-4zM7 5h2v1h-2zM10 5h4v1h-4zM1 6h3v1h-3zM6 6h4v1h-4zM12 6h3v1h-3zM1 7h2v1h-2zM5 7h6v1h-6zM13 7h2v1h-2zM1 8h2v1h-2zM5 8h6v1h-6zM13 8h2v1h-2zM1 9h3v1h-3zM6 9h4v1h-4zM12 9h3v1h-3zM2 10h4v1h-4zM7 10h2v1h-2zM10 10h4v1h-4zM4 11h8v1h-8zM5 12h6v1h-6z"/>',
  crit:'<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M7 1h2v1h-2zM6 2h4v1h-4zM6 3h4v1h-4zM6 4h4v1h-4zM1 5h6v1h-6zM9 5h6v1h-6zM1 6h6v1h-6zM9 6h6v1h-6zM2 7h3v1h-3zM11 7h3v1h-3zM3 8h3v1h-3zM10 8h3v1h-3zM4 9h2v1h-2zM10 9h2v1h-2zM4 10h2v1h-2zM10 10h2v1h-2zM4 11h8v1h-8zM4 12h8v1h-8zM3 13h4v1h-4zM9 13h4v1h-4zM4 14h1v1h-1zM11 14h1v1h-1z"/>',
  prospection:'<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M4 2h5v1h-5zM3 3h8v1h-8zM2 4h3v1h-3zM9 4h2v1h-2zM2 5h2v1h-2zM9 5h3v1h-3zM2 6h2v1h-2zM10 6h2v1h-2zM2 7h2v1h-2zM10 7h2v1h-2zM2 8h2v1h-2zM9 8h2v1h-2zM3 9h3v1h-3zM8 9h3v1h-3zM3 10h9v1h-9zM5 11h3v1h-3zM10 11h3v1h-3zM11 12h3v1h-3zM12 13h3v1h-3zM13 14h2v1h-2z"/>',
  dmg:'<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M8 2h3v1h-3zM9 3h3v1h-3zM10 4h3v1h-3zM9 5h5v1h-5zM8 6h3v1h-3zM12 6h2v1h-2zM7 7h3v1h-3zM13 7h1v1h-1zM6 8h3v1h-3zM5 9h3v1h-3zM3 10h4v1h-4zM2 11h4v1h-4zM2 12h4v1h-4zM2 13h3v1h-3z"/>',
  hp:'<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M4 3h8v1h-8zM3 4h10v1h-10zM3 5h2v1h-2zM7 5h2v1h-2zM11 5h2v1h-2zM2 6h2v1h-2zM12 6h2v1h-2zM2 7h2v1h-2zM12 7h2v1h-2zM3 8h2v1h-2zM11 8h2v1h-2zM3 9h2v1h-2zM11 9h2v1h-2zM4 10h2v1h-2zM10 10h2v1h-2zM4 11h3v1h-3zM9 11h3v1h-3zM5 12h6v1h-6zM7 13h2v1h-2z"/>',
  xp:'<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M7 1h2v1h-2zM6 2h4v1h-4zM5 3h6v1h-6zM4 4h8v1h-8zM3 5h3v1h-3zM7 5h2v1h-2zM10 5h3v1h-3zM2 6h3v1h-3zM7 6h2v1h-2zM11 6h3v1h-3zM3 7h1v1h-1zM7 7h2v1h-2zM12 7h1v1h-1zM7 8h2v1h-2zM7 9h2v1h-2zM7 10h2v1h-2zM7 11h2v1h-2zM7 12h2v1h-2zM7 13h2v1h-2zM7 14h2v1h-2z"/>',
  dodge:'<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M9 3h5v1h-5zM8 4h6v1h-6zM7 5h4v1h-4zM12 5h2v1h-2zM6 6h3v1h-3zM12 6h2v1h-2zM6 7h2v1h-2zM12 7h2v1h-2zM5 8h2v1h-2zM13 8h1v1h-1zM4 9h3v1h-3zM3 10h3v1h-3zM2 11h3v1h-3zM2 12h2v1h-2z"/>',
  dps:'<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M10 2h3v1h-3zM9 3h5v1h-5zM10 4h4v1h-4zM10 5h4v1h-4zM5 6h1v1h-1zM9 6h4v1h-4zM4 7h3v1h-3zM8 7h3v1h-3zM3 8h7v1h-7zM2 9h3v1h-3zM7 9h2v1h-2zM1 10h3v1h-3zM1 11h2v1h-2z"/>',
  kills:'<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M6 1h4v1h-4zM4 2h8v1h-8zM3 3h3v1h-3zM10 3h3v1h-3zM3 4h2v1h-2zM11 4h2v1h-2zM3 5h2v1h-2zM11 5h2v1h-2zM2 6h2v1h-2zM6 6h1v1h-1zM9 6h1v1h-1zM12 6h2v1h-2zM2 7h2v1h-2zM5 7h2v1h-2zM9 7h5v1h-5zM3 8h2v1h-2zM11 8h2v1h-2zM3 9h3v1h-3zM10 9h3v1h-3zM4 10h2v1h-2zM10 10h2v1h-2zM4 11h3v1h-3zM9 11h3v1h-3zM4 12h8v1h-8zM5 13h6v1h-6zM5 14h6v1h-6z"/>'};
const SC={vit:"#e8675a",hp:"#e8675a",puissance:"#f0a35a",dmg:"#f0a35a",agi:"#8fd16a",dodge:"#8fd16a",sagesse:"#a99ee0",xp:"#a99ee0",crit:"#f0c35a",prospection:"#6bb8e8",dps:"#ef7d4a",kills:"#9fb0c3"};
const sico=k=>ELG[k]?`<span class="sico" style="--c:${ELEMS[k].c}"><svg viewBox="0 0 24 24" aria-hidden="true">${ELG[k]}</svg></span>`:`<span class="sico" style="--c:${SC[k]}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SI[k]}</svg></span>`;
function statBreak(){
  const C=CLASSES[S.cls],K=["vit","puissance","agi","sagesse","crit","prospection","dmg","feu","eau","terre","air","pctXp","pctEcus","pctDmg"],o={};K.forEach(k=>o[k]={base:0,pts:0,eq:0,set:0});
  o.crit.base=5;o.prospection.base=100;for(const k in C.base)o[k].base+=C.base[k];for(const k in S.alloc)o[k].pts=S.alloc[k];
  equipped().forEach(i=>{const st=itemStats(i);for(const k in st)o[k].eq+=st[k]});
  const sc=setCounts();for(const z in sc){const b=SETB(z);setSteps(z).forEach(n=>{if(sc[z]>=n)for(const k in b[n])if(o[k])o[k].set+=b[n][k]})}
  return o;
}
