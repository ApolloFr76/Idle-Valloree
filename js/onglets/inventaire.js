/* Onglet Inventaire (équipement, sac, trophées). */
let selSlot=null,selInv=null,invF="all";
const ikind=it=>it.slot==="familier"?"fam":it.slot==="trophee"?"tro":"equip";
function freeSlot(it){const ks=Object.keys(EQ).filter(k=>EQ[k].t===it.slot);return ks.find(k=>!S.equip[k])}
function equipItem(u,target){
  const inst=S.items.find(x=>x.u===u);if(!inst)return;const it=ITEMS[inst.id];
  if(S.lvl<it.lvl){toast(`Niveau ${it.lvl} requis`);return}
  if(it.slot==="trophee"&&Object.entries(S.equip).some(([k,v])=>v!==u&&k.startsWith("trophee")&&S.items.find(x=>x.u===v)?.id===it.id)){toast("Ce trophée est déjà équipé");return}
  const ks=Object.keys(EQ).filter(k=>EQ[k].t===it.slot);
  const okT=target&&ks.includes(target),k=(okT&&!S.equip[target])?target:(ks.find(k=>!S.equip[k])||(okT?target:ks[0]));
  for(const kk in S.equip)if(S.equip[kk]===u)delete S.equip[kk];
  S.equip[k]=u;selSlot=k;selInv=null;selLast="slot";S.hp=Math.min(S.hp,stats().maxHp);
}
function enchInfo(inst){const it=ITEMS[inst.id],e=inst.e||0;return{e,cost:Math.round(25*(it.z+1)*Math.pow(e+1,2)),ch:Math.round(Math.max(.2,.9-.07*e)*100)}}
let selLast="slot",invP=0,invSub="all";
const SUBS={all:[["all","Toutes catégories"]],equip:[["all","Toutes catégories"],...SLOTS.map(x=>[x.id,x.name])],fam:[["all","Toutes catégories"],["Familier","Familiers"],["Monture","Montures"]],tro:[["all","Toutes catégories"]],res:[["all","Toutes catégories"],["d","Butin de monstre"],["bucheron","Bois"],["mineur","Minerais"],["paysan","Céréales"],["herboriste","Herbes"],["p","Potions"]]};
function pInv(){
  const st=stats(),C=CLASSES[S.cls],need=xpNeed(S.lvl),eq=new Set(Object.values(S.equip));
  const slotBtn=k=>{const u=S.equip[k],inst=u&&S.items.find(i=>i.u===u),it=inst&&ITEMS[inst.id];
    return`<button class="eslot${it?" full":""}${selSlot===k&&selLast==="slot"?" on":""}" data-a="selSlot" data-s="${k}" title="${it?esc(it.name):EQ[k].n}" ${it?`style="--ic:${itCol(it)};${inst.r?`border-color:${rarOf(inst).c}`:""}"`:""}>${it?itIcon(it):glyph(EQ[k].t)}${it&&inst.e?`<span class="badge">+${inst.e}</span>`:""}${it?"":`<span class="lb">${EQ[k].n}</span>`}</button>`};
  /* fiche de l'objet sélectionné (emplacement ou sac) */
  let dl=`<span class="small muted" style="margin:auto">Sélectionnez un objet · double-clic pour équiper ou retirer</span>`;
  if(selLast==="slot"&&selSlot){const u=S.equip[selSlot],inst=u&&S.items.find(i=>i.u===u);
    if(inst){const it=ITEMS[inst.id],E=enchInfo(inst);
      dl=`<span class="small muted">${EQ[selSlot].n} · porté</span><span class="iname" style="color:${rarOf(inst).c}">${it.name}${E.e?` <em>+${E.e}</em>`:""} <span class="tag">${rarOf(inst).n}</span></span><span class="istats">${statsTxt(itemStats(inst))}</span><div class="row">${it.noEnch?"":E.e<10?`<button class="btn pri" data-a="ench" data-u="${u}" ${S.ecus<E.cost?"disabled":""}>Enchanter · ${fmt(E.cost)} écus · ${E.ch} %</button>`:`<span class="tag">Enchantement max</span>`}<button class="btn" data-a="unequip" data-s="${selSlot}">Retirer</button></div>`}
    else{const t=EQ[selSlot].t,n=S.items.filter(i=>!eq.has(i.u)&&ITEMS[i.id].slot===t).length;
      dl=`<span class="iname">${EQ[selSlot].n} · vide</span><span class="small muted">${n?`${n} objet${n>1?"s":""} compatible${n>1?"s":""} dans le sac.`:t==="trophee"?"Les trophées tombent rarement sur les monstres.":t==="familier"?"Fabriquez une monture ou un familier dans l'Atelier.":"Fabriquez cette pièce dans l'Atelier."}</span>`}}
  if(selLast==="inv"&&selInv&&selInv[0]==="u"){const inst=S.items.find(i=>i.u===+selInv.slice(2));if(inst&&!eq.has(inst.u)){const it=ITEMS[inst.id],sv=Math.round(it.price*(1+.2*(inst.e||0))*sellMult()*rarOf(inst).m),sk=stackKey(inst),nS=S.items.filter(x=>!eq.has(x.u)&&stackKey(x)===sk).length;
    dl=`<span class="small muted">${it.kind||EQ[it.slot]?.n||""} · niveau ${it.lvl}</span><span class="iname" style="color:${rarOf(inst).c}">${it.name}${inst.e?` <em>+${inst.e}</em>`:""} <span class="tag">${rarOf(inst).n}</span>${nS>1?` <span class="muted num">×${nS}</span>`:""}</span><span class="istats">${statsTxt(itemStats(inst))}</span><div class="row"><button class="btn pri" data-a="equip" data-u="${inst.u}" ${S.lvl<it.lvl?"disabled":""}>Équiper</button><button class="btn" data-a="sellItem" data-u="${inst.u}">Vendre · ${fmt(sv)} écus</button>${nS>1?`<button class="btn" data-a="sellStack" data-k="${sk}">Tout vendre (${nS}) · ${fmt(sv*nS)}</button>`:""}</div>`}}
  if(selLast==="inv"&&selInv&&selInv[0]==="r"){const k=selInv.slice(2),r=RES[k],q=S.res[k]||0;if(q>0)
    dl=`<span class="small muted">${kindLabel(r)}</span><span class="iname">${r.name} <span class="muted num">×${fmt(q)}</span></span><span class="istats">${r.txt?r.txt+" · ":""}${priceOf(k)} écus l'unité${r.kind!=="k"?` · cours ×${mkOf(k).toFixed(2)} ${trend(k)}`:""}</span><div class="row">${r.kind==="p"?`<button class="btn pri" data-a="drink" data-r="${k}">Boire</button>`:""}<button class="btn" data-a="sell" data-r="${k}" data-n="1">Vendre 1</button><button class="btn" data-a="sell" data-r="${k}" data-n="10" ${q<10?"disabled":""}>Vendre 10</button><button class="btn pri" data-a="sell" data-r="${k}" data-n="all">Tout vendre · ${fmt(q*priceOf(k))}</button></div>`}
  const L=`<div class="invL">
    <div class="doll"><div class="dcol">${DOLL_L.map(slotBtn).join("")}</div>
      <div class="dmid">${heroSVG(S.cls)}<span class="nm">${esc(S.name)}</span><span class="small muted">${C.name} · niv. ${S.lvl}</span><span class="small muted num">${fmt(st.maxHp)} PV · ${fmt(st.dps)} dég./s</span></div>
      <div class="dcol">${DOLL_R.map(slotBtn).join("")}</div></div>
    <div class="trophies">${DOLL_B.map(slotBtn).join("")}</div>
    ${(sc=>Object.keys(sc).length?`<div class="setlist">${Object.keys(sc).map(z=>setBox(z,sc[z],true)).join("")}</div>`:`<div class="setb small">Portez plusieurs pièces d'une même panoplie : chaque pièce à partir de la 2e débloque un bonus.</div>`)(setCounts())}
    <div class="detail" style="min-height:120px">${dl}</div></div>`;
  /* sac */
  const subOk=(it)=>invSub==="all"||(invF==="equip"?it.slot===invSub:invF==="fam"?it.kind===invSub:true);
  const items=invF==="res"?[]:S.items.filter(i=>!eq.has(i.u)&&(invF==="all"||invF===ikind(ITEMS[i.id]))&&subOk(ITEMS[i.id]));
  const res=(invF==="all"||invF==="res")?Object.keys(S.res).filter(k=>S.res[k]>0&&(invSub==="all"||(invSub==="d"||invSub==="p"?RES[k].kind===invSub:RES[k].prof===invSub))).sort((a,b)=>RES[a].kind.localeCompare(RES[b].kind)||RES[a].price-RES[b].price):[];
  const grp=new Map();items.forEach(i=>{const k=stackKey(i);if(!grp.has(k))grp.set(k,{i,n:0,us:[]});const g=grp.get(k);g.n++;g.us.push(i.u)});
  const selU=selInv&&selInv[0]==="u"?+selInv.slice(2):null;
  const all=[...[...grp.values()].map(g=>({t:"u",i:g.us.includes(selU)?S.items.find(x=>x.u===selU):g.i,n:g.n,us:g.us})),...res.map(k=>({t:"r",k}))],PER=36,pages=Math.max(1,Math.ceil(all.length/PER));
  invP=Math.min(invP,pages-1);
  const tiles=all.slice(invP*PER,invP*PER+PER).map(e=>{if(e.t==="u"){const i=e.i,it=ITEMS[i.id];return`<button class="tile${e.us.includes(selU)&&selLast==="inv"?" on":""}" data-a="selInv" data-v="u:${i.u}" title="${esc(it.name)}" style="--ic:${itCol(it)};${i.r?`border-color:${rarOf(i).c};box-shadow:inset 0 0 12px ${rarOf(i).c}44`:""}">${itIcon(it)}${i.e?`<span class="badge">+${i.e}</span>`:""}${e.n>1?`<span class="q num">×${e.n}</span>`:""}</button>`}
    const r=RES[e.k];return`<button class="tile${selInv==="r:"+e.k&&selLast==="inv"?" on":""}" data-a="selInv" data-v="r:${e.k}" title="${esc(r.name)}" style="--ic:${resCol(r)}">${resIcon(r)}<span class="q num">${fmt(S.res[e.k])}</span></button>`}).join("");
  const F=[["all","Tout","all"],["equip","Équipements","arme"],["fam","Montures et familiers","familier"],["tro","Trophées","trophee"],["res","Ressources","drop"]];
  const w=bagWeight(),cap=bagCap();
  const R=`<div class="invR">
    <div class="itabs">${F.map(([k,n,g])=>`<button class="itab${invF===k?" on":""}" data-a="filt" data-f="${k}" title="${n}" aria-label="${n}">${glyph(g)}</button>`).join("")}</div>
    <select id="invSub" aria-label="Catégorie">${SUBS[invF].map(([k,n])=>`<option value="${k}" ${invSub===k?"selected":""}>${n}</option>`).join("")}</select>
    <div class="igrid">${tiles||`<p class="small muted empty">Rien dans cette catégorie.</p>`}</div>
    <div class="pager"><button class="btn" data-a="page" data-d="-1" ${invP<=0?"disabled":""} aria-label="Page précédente">◀</button><span class="num">${invP+1} / ${pages}</span><button class="btn" data-a="page" data-d="1" ${invP>=pages-1?"disabled":""} aria-label="Page suivante">▶</button></div>
    <div class="wallet">
      <div class="wrow"><span class="muted">Écus</span><b class="num">${fmt(S.ecus)} <span class="coin"></span></b></div>
      <div><div class="wrow"><span class="muted">Niveau ${S.lvl}</span><span class="num muted">${S.lvl>=LVL_MAX?"max":`${fmt(S.xp)} / ${fmt(need)} XP`}</span></div><div class="bar xp" style="margin-top:4px"><i style="width:${S.lvl>=LVL_MAX?100:S.xp/need*100}%"></i></div></div>
      <div><div class="wrow"><span class="muted">Poids</span><span class="num ${w>=cap?"":"muted"}" ${w>=cap?'style="color:var(--hp)"':""}>${fmt(w)} / ${fmt(cap)}</span></div><div class="bar wt${w>=cap?" full":""}" style="margin-top:4px"><i style="width:${Math.min(100,w/cap*100)}%"></i></div></div>
    </div></div>`;
  return`<div class="invsplit">${L}${R}</div>`;
}
