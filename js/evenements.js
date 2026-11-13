/* Événements : clics (data-a), clavier, souris. */
/* ================= Événements ================= */
document.addEventListener("pointerdown",e=>{if(forge&&!forge.done&&e.button===0&&e.target.closest('[data-a="forgeHit"]')){e.preventDefault();forgeStrike()}
  /* mini-jeux : bûcheron (coup), pêche (ferrer puis maintenir) */
  if(mg&&!mg.done&&e.button===0){if(mg.pid==="bucheron"&&e.target.closest('[data-a="mgHit"]')){e.preventDefault();logHit()}
    if(mg.pid==="pecheur"&&e.target.closest(".fishw")){e.preventDefault();if(mg.st==="reel")fishHold(true);else fishHook()}}},true);
document.addEventListener("pointerup",()=>fishHold(false));document.addEventListener("pointercancel",()=>fishHold(false));
document.addEventListener("keyup",e=>{if(e.key===" ")fishHold(false)});
document.addEventListener("click",e=>{ptrDown=false;
  const b=e.target.closest("[data-a]");if(!b)return;const a=b.dataset.a;
  if(a==="auto")return;
  switch(a){
    case"pick":pick=b.dataset.k;S.name=$("heroName").value;showCreate();break;
    case"start":{S.cls=pick;S.name=($("heroName").value||"Aventurier").trim().slice(0,20)||"Aventurier";S.hp=stats().maxHp;$("ov").hidden=true;log(`Bienvenue, ${esc(S.name)}. La Prairie des Clochettes vous attend.`,"g");boot2();save();if(!S.tutoDone)setTimeout(tutoStart,400);break}
    case"closeOv":$("ov").hidden=true;break;
    case"pickup":takePk();break;
    case"mode":startMode(b.dataset.m,b.dataset.z!=null?+b.dataset.z:null);renderPanel();break;
    case"quit":endMode(false,"abandon");break;
    case"prestAsk":if(!S.opt.confirmPrest){doPrestige();break}prestConfirm=true;renderPanel();break;
    case"prestNo":prestConfirm=false;renderPanel();break;
    case"prestYes":prestConfirm=false;doPrestige();break;
    case"talent":{const id=b.dataset.t,T=TAL[id];if(T.prev&&!tal(T.prev))break;const c=talCost(id);if(S.souls<c)break;S.souls-=c;S.tal[id]=tal(id)+1;S.hp=Math.min(S.hp,stats().maxHp);renderPanel();break}
    case"talReset":{let r=0;for(const id in S.tal)if(TAL[id])r+=talSpent(id);S.souls+=r;S.tal={};toast(`${r} éclats rendus`);renderPanel();break}
    case"ctab":ctab=b.dataset.t;renderPanel();break;
    case"clsSwap":{const k=b.dataset.k,c=clsCost();if(!CLASSES[k]||k===S.cls||S.souls<c)break;S.souls-=c;S.clsSwaps=(S.clsSwaps||0)+1;S.cls=k;S.cds={};S.buffs=[];S.hp=Math.min(S.hp,stats().maxHp);drawHero();drawSpells();mbSig="";log(`Vous devenez ${CLASSES[k].name}.`,"g");toast(`Nouvelle classe : ${CLASSES[k].name}`);renderPanel(true);break}
    case"goalsToggle":S.opt.goalsOpen=!S.opt.goalsOpen;goalSig="";drawGoals();break;
    case"tutoNext":tutoI++;tutoDraw();break;
    case"tutoPrev":tutoI=Math.max(0,tutoI-1);tutoDraw();break;
    case"tutoSkip":tutoEnd();break;
    case"tutoReplay":tutoStart();break;
    case"unlReplay":if(tabOpen(b.dataset.t))tutoRun(unlTour(b.dataset.t),"unl");break;
    case"help":S.tab="opts";otab="aide";renderPanel();break;
    case"tipOk":closeTip();break;
    case"tipGo":{const t=tipShown;if(t&&t.tab){S.tab=t.tab;renderPanel()}closeTip();break}
    case"tipsReset":S.tips={};tipQ=[];toast("Les conseils réapparaîtront au fil du jeu",1);break;
    case"otab":otab=b.dataset.t;renderPanel();break;
    case"optSet":{const k=b.dataset.k,v=b.dataset.v;S.opt[k]=isNaN(+v)?v:+v;applyOpts();renderPanel();break}
    case"optDefault":S.opt=Object.assign({},OPT_DEF);applyOpts();toast("Réglages par défaut rétablis",1);renderPanel();break;
    case"code":{const i=$("codeBox");useCode(i&&i.value);if(i)i.value="";break}
    case"saveNow":save();lastSave=Date.now();toast("Partie enregistrée",1);break;
    case"pause":setPause(!paused);break;
    case"forgeHit":break; /* géré au pointerdown, plus précis */
    case"mgStart":case"mgAgain":if(mg&&mg.done)mg=null;mgStart(b.dataset.p);if(!mg){$("ov").hidden=true;toast(`Encore ${mgCdLeft(b.dataset.p)} s avant de rejouer`,1);renderPanel()}break;
    case"mgClose":mgClose();break;
    case"mgQuit":mgClose();break;
    case"mgCell":mgCell(+b.dataset.i);break;
    case"mgHit":case"mgHold":break; /* gérés au pointerdown */
    case"fishDex":mg=null;$("ov").hidden=true;S.tab="coll";ctab="fish";renderPanel();break;
    case"eatFish":eatFish(b.dataset.r);break;
    case"forgeSkip":forgeFinish(true);break;
    case"forgeClose":$("ov").hidden=true;forge=null;renderPanel();break;
    case"drink":drink(b.dataset.r,false);renderPanel();break;
    case"brew":brew(b.dataset.r,b.dataset.n==="max"?999:+b.dataset.n);renderPanel();break;
    case"qClaim":{const q=S.q.list[+b.dataset.i];if(!q||!q.done||q.claimed)break;q.claimed=true;gainEcus(q.ecus);if(q.xp)gainXp(q.xp);inc("quests");log(`Récompense de quête : <span class="g">+${fmt(q.ecus)} écus</span>${q.xp?`, <span class="x">+${fmt(q.xp)} XP</span>`:""}`,"g");
      if(S.q.list.every(x=>x.claimed)&&!S.q.bonus){S.q.bonus=true;S.souls++;S.soulsTotal=(S.soulsTotal||0)+1;log("Toutes les quêtes du jour sont terminées : +1 éclat d'âme !","g");toast("+1 éclat d'âme")}renderPanel();break}
    case"qReroll":{if(!S.q||S.q.reroll<1)break;const i=+b.dataset.i;if(S.q.list[i].done)break;S.q.list[i]=makeQuest();S.q.reroll--;renderPanel();break}
    case"mkSell":{const k=b.dataset.r,g=sellRes(k,b.dataset.n==="all"?S.res[k]:+b.dataset.n);if(g)toast(`+${fmt(g)} écus`);renderPanel();break}
    case"ally":{const i=+b.dataset.i,id=ALLIES[i][0];let n=b.dataset.n==="max"?1e9:+b.dataset.n,bought=0;while(n-->0){const c=allyCost(i,S.allies[id]||0);if(S.ecus<c)break;S.ecus-=c;S.allies[id]=(S.allies[id]||0)+1;bought++}
      if(bought){const l=S.allies[id];if(Math.floor(l/25)>Math.floor((l-bought)/25))toast(`${ALLIES[i][1]} : dégâts doublés !`);if(l===bought)log(`${ALLIES[i][1]} rejoint votre groupe.`,"g")}else toast("Pas assez d'écus");renderPanel();break}
    case"buy":{const u=UPGS.find(x=>x[0]===b.dataset.u);if(!u||up(u[0])||S.ecus<u[3])break;S.ecus-=u[3];S.up[u[0]]=true;sfx("coin");log(`Amélioration achetée : ${u[1]}.`,"g");toast(`${u[1]} : ${u[2]}`);renderPanel();break}
    case"zone":goZone(+b.dataset.i);break;
    case"cast":cast(CLASSES[S.cls].spells.find(s=>s.id===b.dataset.sp),false);break;
    case"ptab":ptab=b.dataset.t;renderPanel();break;
    case"tabLocked":toast(`Onglet verrouillé : il se débloque au niveau ${TAB_LOCK[b.dataset.t]}`,1);break;
    case"tab":if(!tabOpen(b.dataset.t))break;S.tab=b.dataset.t;confirmReset=false;dirty=true;renderPanel();break;
    case"alloc":{const k=b.dataset.k;let n=Math.min(S.pts,+b.dataset.n);if(SEC[k]?.cap&&!PRIM_OK[k]){const room=SEC[k].cap*SEC_STEP-(stats()[k]||0);n=Math.min(n,room);if(n<=0){toast("Bonus secondaire déjà au maximum");break}}S.alloc[b.dataset.k]+=n;S.pts-=n;dirty=true;renderPanel();break}
    case"respec":ALLOC.forEach(k=>{S.pts+=S.alloc[k];S.alloc[k]=0});S.hp=Math.min(S.hp,stats().maxHp);renderPanel();break;
    case"sell":{const k=b.dataset.r,n=b.dataset.n==="all"?S.res[k]:Math.min(+b.dataset.n,S.res[k]);if(n>0){const g=sellRes(k,n);if(n>1)toast(`${fmt(n)}× ${RES[k].name} vendus : +${fmt(g)} écus`)}renderPanel();break}
    case"mtab":mtab=b.dataset.p;renderPanel();break;
    case"atZone":atZone=+b.dataset.i;atSel=null;atOpen=null;renderPanel();break;
    case"atOpen":atOpen=atOpen===b.dataset.k?null:b.dataset.k;renderPanel();if(atOpen){const el=document.querySelector(".pset.open");if(el)el.scrollIntoView({block:"nearest"})}break;
    case"atClose":atSel=null;renderPanel(true);break;
    case"noop":break;
    case"atSel":atSel=atSel===b.dataset.i?null:b.dataset.i;renderPanel();break;
    case"craft":{const it=ITEMS[b.dataset.i];if(!canCraft(it))break;if(atSel){atSel=null;renderPanel(true)}it.recipe.forEach(([r,q])=>S.res[r]-=q);startForge(it);break}
    case"equip":equipItem(+b.dataset.u,selSlot);renderPanel();break;
    case"selSlot":{const now=performance.now(),dbl=lastSel.v==="s:"+b.dataset.s&&now-lastSel.t<450;lastSel={v:"s:"+b.dataset.s,t:now};selSlot=b.dataset.s;selLast="slot";if(dbl&&S.equip[selSlot]){delete S.equip[selSlot];S.hp=Math.min(S.hp,stats().maxHp);toast("Objet retiré",1);lastSel={v:null,t:0}}renderPanel();break}
    case"selInv":{const v=b.dataset.v,now=performance.now(),dbl=lastSel.v===v&&now-lastSel.t<450;lastSel={v,t:now};selInv=v;selLast="inv";
      if(dbl){lastSel={v:null,t:0};if(v[0]==="u"){const inst=S.items.find(i=>i.u===+v.slice(2));if(inst){const it=ITEMS[inst.id];if(S.lvl<it.lvl)toast(`Niveau ${it.lvl} requis`,1);else{equipItem(inst.u,null);toast(`${it.name} équipé`,1)}}}else if(RES[v.slice(2)]?.kind==="p")drink(v.slice(2),false)}
      renderPanel();break}
    case"filt":invF=b.dataset.f;invSub="all";invP=0;renderPanel();break;
    case"page":invP=Math.max(0,invP+ +b.dataset.d);renderPanel();break;
    case"unequip":delete S.equip[b.dataset.s];S.hp=Math.min(S.hp,stats().maxHp);renderPanel();break;
    case"sellStack":{const k=b.dataset.k,eq=new Set(Object.values(S.equip)),L=S.items.filter(x=>!eq.has(x.u)&&stackKey(x)===k);if(!L.length)break;const it=ITEMS[L[0].id],v=Math.round(it.price*(1+.2*(L[0].e||0))*sellMult()*rarOf(L[0]).m)*L.length;S.items=S.items.filter(x=>!L.includes(x));gainEcus(v);sfx("coin");selInv=null;toast(`${L.length}× ${it.name} vendus : +${fmt(v)} écus`);renderPanel();break}
    case"sellItem":{const u=+b.dataset.u,i=S.items.find(x=>x.u===u),it=ITEMS[i.id],v=Math.round(it.price*(1+.2*(i.e||0))*sellMult()*rarOf(i).m);S.items=S.items.filter(x=>x.u!==u);gainEcus(v);nextInStack(stackKey(i));toast(`${it.name} vendu : +${fmt(v)} écus`);renderPanel();break}
    case"ench":{const u=+b.dataset.u,i=S.items.find(x=>x.u===u),it=ITEMS[i.id],e=i.e||0,cost=Math.round(25*(it.z+1)*Math.pow(e+1,2));if(S.ecus<cost||e>=10)break;S.ecus-=cost;
      if(Math.random()<Math.max(.2,.9-.07*e)){i.e=e+1;inc("enchOk");mx("enchMax",i.e);toast(`Réussite ! ${it.name} +${i.e}`);log(`Enchantement réussi : ${it.name} +${i.e}.`,"g")}else{toast("L'enchantement a échoué. Les écus sont perdus.");inc("enchKo")}renderPanel();break}
    case"job":{const r=b.dataset.r;S.job=S.job&&S.job.r===r?null:{r,t:0};renderPanel();break}
    case"copy":{const t=$("exportBox");const done=()=>toast("Code copié");try{navigator.clipboard.writeText(t.value).then(done,()=>{t.select();toast("Sélectionné : copiez avec Ctrl+C")})}catch(err){t.select();toast("Sélectionné : copiez avec Ctrl+C")}break}
    case"import":{try{const d=JSON.parse(decodeURIComponent(escape(atob($("importBox").value.trim()))));if(!d||!d.cls)throw 0;S=Object.assign(fresh(),d);save();boot2();toast("Partie chargée")}catch(err){toast("Ce code de sauvegarde n'est pas valide. Vérifiez qu'il est complet.")}break}
    case"reset":confirmReset=true;renderPanel();break;
    case"resetNo":confirmReset=false;renderPanel();break;
    case"resetYes":confirmReset=false;S=fresh();try{localStorage.removeItem(SAVE_KEY)}catch(err){}showCreate();break;
  }
});
document.addEventListener("input",e=>{const k=e.target.dataset&&e.target.dataset.opt;if(k&&e.target.type==="range"){const v=+e.target.value;S.opt[k]=Number.isFinite(v)?v:OPT_DEF[k];const o=$("ov_"+k);if(o)o.textContent=optFmt(k,S.opt[k]);applyOpts()}});
document.addEventListener("change",e=>{const k=e.target.dataset&&e.target.dataset.opt;if(k&&e.target.type==="checkbox"){S.opt[k]=e.target.checked;applyOpts();if(k==="music"){audioInit();musicSync()}}});
document.addEventListener("keydown",e=>{const k=e.key.toLowerCase();if(k==="escape"&&atSel&&!forge){atSel=null;renderPanel(true);return}
  if(tutoI>=0){if(k==="escape"){tutoEnd()}else if(k==="arrowright"||k==="enter"){e.preventDefault();tutoI++;tutoDraw()}else if(k==="arrowleft"){tutoI=Math.max(0,tutoI-1);tutoDraw()}if(k!=="tab")e.preventDefault();return}
  if((k==="enter"||k===" ")&&e.target.dataset&&e.target.dataset.a==="atOpen"){e.preventDefault();e.target.click();return}
  if(forge&&!forge.done&&(k===" "||k==="enter")){e.preventDefault();if(!e.repeat)forgeStrike();return}
  if(k==="enter"&&e.target.id==="codeBox"){e.preventDefault();useCode(e.target.value);e.target.value="";return}
  if(mg&&!mg.done&&k===" "){e.preventDefault();if(mg.pid==="bucheron"&&!e.repeat)logHit();if(mg.pid==="pecheur"){if(mg.st==="reel")fishHold(true);else if(!e.repeat)fishHook()}return}
  if(mg&&k==="escape"){mgClose();return}
  if(!S||!S.cls||!S.opt.keys||e.ctrlKey||e.metaKey||e.altKey||forge||mg)return;if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;
  if(k==="p"){setPause(!paused);e.preventDefault();return}if(paused)return;
  if(k===" "||k==="a"){e.preventDefault();doClick(false);return}
  if(["1","2","3"].includes(k)){const sp=CLASSES[S.cls].spells[+k-1];if(sp)cast(sp,false);return}
  if(k==="b"){if(tabOpen("aventure"))startMode("boss");return}if(k==="e"){if(S.pk)takePk();return}
  if(k==="s"){const p=["p_gsoin","p_soin"].find(id=>S.res[id]>0);if(p)drink(p,false);return}
  if(k==="escape"&&S.mode!=="zone"){endMode(false,"abandon");return}
  const tk={c:"perso",i:"inv",v:"aventure",f:"atelier",o:"opts"}[k];if(tk&&tabOpen(tk)){S.tab=tk;renderPanel()}});
function setPause(v){paused=v;$("pauseBtn").textContent=v?"Reprendre":"Pause";$("pauseBtn").classList.toggle("pri",v);$("pauseOv").hidden=!v;if(v)save()}
function goZone(i){if(!ZONES[i]||S.lvl<ZONES[i].lvl[0])return;if(S.mode!=="zone")endMode(false,"abandon");S.zone=i;S.mon=null;S.spawnT=.2;S.dots=[];drawZones();drawMonster();dirty=true}
document.addEventListener("change",e=>{if(e.target.id==="zoneSel"){goZone(+e.target.value);e.target.blur();return}if(e.target.id==="autoPot"){S.autoPot=e.target.checked;potSig="";return}if(e.target.id==="invSub"){invSub=e.target.value;invP=0;renderPanel();return}const b=e.target.closest('[data-a="auto"]');if(b){S.auto[b.dataset.s]=b.checked}});
$("monBtn").addEventListener("pointerdown",e=>{if(!S.cls||!S.mon||S.ko>0)return;e.preventDefault();FX.pt(e);doClick(false)});
document.addEventListener("visibilitychange",()=>{if(document.hidden)save()});
window.addEventListener("pagehide",save);

