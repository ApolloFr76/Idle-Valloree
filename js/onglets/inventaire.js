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
/* Objets protégés : verrouillés à la main (inst.lk) ou rangés dans une tenue. Jamais vendus, ni un par un, ni en groupe. */
const inOutfit=u=>(S.outfits||[]).some(o=>o&&o.eq&&Object.values(o.eq).includes(u));
const isLk=i=>!!(i&&(i.lk||inOutfit(i.u)));
const lockBtn=inst=>`<button class="btn" data-a="lockItem" data-u="${inst.u}" title="Un objet verrouillé n'est jamais vendu">${inst.lk?"Déverrouiller":"Verrouiller"}</button>`;
const OUTFITS=3;
function outfitSave(i){S.outfits=S.outfits||[];const eq={};for(const k in S.equip)if(S.equip[k]!=null&&S.items.some(x=>x.u===S.equip[k]))eq[k]=S.equip[k];S.outfits[i]={eq};toast(`Tenue ${i+1} enregistrée (${Object.keys(eq).length} pièces)`,1)}
function outfitWear(i){const o=(S.outfits||[])[i];if(!o||!o.eq)return;let miss=0,low=0;const ne={};
  for(const k in o.eq){const inst=S.items.find(x=>x.u===o.eq[k]);if(!inst||!EQ[k]){miss++;continue}if(S.lvl<ITEMS[inst.id].lvl){low++;continue}ne[k]=inst.u}
  S.equip=ne;selInv=null;S.hp=Math.min(S.hp,stats().maxHp);potSig="";mbSig="";toast(`Tenue ${i+1} portée${miss?` · ${miss} pièce${miss>1?"s":""} introuvable${miss>1?"s":""}`:""}${low?` · ${low} pièce${low>1?"s":""} de trop haut niveau`:""}`,1)}
const outfitsHTML=()=>`<div class="outfits"><span class="small muted">Tenues</span>${Array.from({length:OUTFITS},(_,i)=>{const o=(S.outfits||[])[i],n=o&&o.eq?Object.keys(o.eq).length:0;
  return`<div class="ofit"><button class="btn${n?" pri":""}" data-a="ofWear" data-i="${i}" ${n?"":"disabled"} title="${n?"Porter cette tenue":"Tenue vide : enregistrez d'abord votre équipement"}">Tenue ${i+1}${n?` · ${n}`:""}</button><button class="btn" data-a="ofSave" data-i="${i}" title="Enregistrer l'équipement porté dans la tenue ${i+1}">Enregistrer</button></div>`}).join("")}</div>`;
function enchInfo(inst){const e=inst.e||0;return{e,cost:enchCost(inst),ch:Math.round(Math.max(.2,.9-.07*e)*100)}}
let selLast="slot",invP=0,invSub="all";
/* recherche par nom, filtre de rareté, vente groupée de ce qui est affiché (en deux clics : vendre puis confirmer) */
let invQ="",invRar=-1,invSellArm=false;
const invNorm=s=>String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
/* objets et ressources affichés dans le sac selon l'onglet, la catégorie, la rareté et la recherche */
function invView(eq){const q=invNorm(invQ.trim()),subOk=it=>invSub==="all"||(invF==="equip"?it.slot===invSub:invF==="fam"?it.kind===invSub:true);
  const items=invF==="res"?[]:S.items.filter(i=>!eq.has(i.u)&&ITEMS[i.id]&&(invF==="all"||invF===ikind(ITEMS[i.id]))&&subOk(ITEMS[i.id])&&(invRar<0||(i.r||0)===invRar)&&(!q||invNorm(ITEMS[i.id].name).includes(q)));
  const res=(invF==="all"||invF==="res")&&invRar<0?Object.keys(S.res).filter(k=>S.res[k]>0&&RES[k]&&(invSub==="all"||(invSub==="d"||invSub==="p"?RES[k].kind===invSub:RES[k].prof===invSub))&&(!q||invNorm(RES[k].name).includes(q))).sort((a,b)=>RES[a].kind.localeCompare(RES[b].kind)||RES[a].price-RES[b].price):[];
  return{items,res}}
/* ce que la vente groupée vend : tout l'affichage sauf les clés de boss, et les potions seulement dans la catégorie Potions */
function invSellList(items,res){const its=items.filter(i=>!isLk(i)),rs=res.filter(k=>RES[k].kind!=="k"&&(RES[k].kind!=="p"||invSub==="p"));
  let v=0;its.forEach(i=>{const it=ITEMS[i.id];v+=Math.round(it.price*(1+.2*(i.e||0))*sellMult()*rarOf(i).m)});rs.forEach(k=>v+=priceOf(k)*(S.res[k]||0));return{its,rs,v,n:its.length+rs.reduce((a,k)=>a+(S.res[k]||0),0)}}
function invSellDo(L){if(!L.n)return;let g=0;const set=new Set(L.its);S.items=S.items.filter(x=>!set.has(x));L.its.forEach(i=>{const it=ITEMS[i.id];g+=Math.round(it.price*(1+.2*(i.e||0))*sellMult()*rarOf(i).m)});g=L.its.length?gainEcus(g):0;
  L.rs.forEach(k=>{g+=sellRes(k,S.res[k]||0)});sfx("coin");selInv=null;invSellArm=false;toast(`${fmt(L.n)} objets et ressources vendus : +${fmt(g)} écus`);log(`Vente groupée : ${fmt(L.n)} objets et ressources vendus pour ${fmt(g)} écus.`,"g")}
const SUBS={all:[["all","Toutes catégories"]],equip:[["all","Toutes catégories"],...SLOTS.map(x=>[x.id,x.name])],fam:[["all","Toutes catégories"],["Familier","Familiers"],["Monture","Montures"]],tro:[["all","Toutes catégories"]],res:[["all","Toutes catégories"],["d","Butin de monstre"],["bucheron","Bois"],["mineur","Minerais"],["paysan","Céréales"],["herboriste","Herbes"],["p","Potions"]]};
function pInv(){
  const st=stats(),C=CLASSES[S.cls],need=xpNeed(S.lvl),eq=new Set(Object.values(S.equip));
  const slotBtn=k=>{const u=S.equip[k],inst=u&&S.items.find(i=>i.u===u),it=inst&&ITEMS[inst.id];
    return`<button class="eslot${it?" full":""}${selSlot===k&&selLast==="slot"?" on":""}" data-a="selSlot" data-s="${k}" title="${it?esc(it.name):EQ[k].n}" ${it?`style="--ic:${itCol(it)};${inst.r?`border-color:${rarOf(inst).c}`:""}"`:""}>${it?itIcon(it):glyph(EQ[k].t)}${it&&inst.e?`<span class="badge">+${inst.e}</span>`:""}${it?"":`<span class="lb">${EQ[k].n}</span>`}</button>`};
  /* fiche de l'objet sélectionné (emplacement ou sac) */
  let dl=`<span class="small muted" style="margin:auto">Sélectionnez un objet · double-clic pour équiper ou retirer</span>`;
  if(selLast==="slot"&&selSlot){const u=S.equip[selSlot],inst=u&&S.items.find(i=>i.u===u);
    if(inst){const it=ITEMS[inst.id],E=enchInfo(inst);
      dl=`<span class="small muted">${EQ[selSlot].n} · porté</span><span class="iname" style="color:${rarOf(inst).c}">${it.name}${E.e?` <em>+${E.e}</em>`:""} <span class="tag">${rarOf(inst).n}</span></span><span class="istats">${statsTxt(itemStats(inst))}</span><div class="row">${it.noEnch?"":E.e<10?`<button class="btn pri" data-a="ench" data-u="${u}" ${S.ecus<E.cost?"disabled":""}>Enchanter · ${fmt(E.cost)} écus · ${E.ch} %</button>`:`<span class="tag">Enchantement max</span>`}<button class="btn" data-a="unequip" data-s="${selSlot}">Retirer</button>${lockBtn(inst)}</div>`}
    else{const t=EQ[selSlot].t,n=S.items.filter(i=>!eq.has(i.u)&&ITEMS[i.id].slot===t).length;
      dl=`<span class="iname">${EQ[selSlot].n} · vide</span><span class="small muted">${n?`${n} objet${n>1?"s":""} compatible${n>1?"s":""} dans le sac.`:t==="trophee"?"Les trophées tombent rarement sur les monstres.":t==="familier"?"Fabriquez une monture ou un familier dans l'Atelier.":"Fabriquez cette pièce dans l'Atelier."}</span>`}}
  if(selLast==="inv"&&selInv&&selInv[0]==="u"){const inst=S.items.find(i=>i.u===+selInv.slice(2));if(inst&&!eq.has(inst.u)){const it=ITEMS[inst.id],sv=Math.round(it.price*(1+.2*(inst.e||0))*sellMult()*rarOf(inst).m),sk=stackKey(inst),nS=S.items.filter(x=>!eq.has(x.u)&&stackKey(x)===sk&&!isLk(x)).length,lk=isLk(inst);
    dl=`<span class="small muted">${it.kind||EQ[it.slot]?.n||""} · niveau ${it.lvl}</span><span class="iname" style="color:${rarOf(inst).c}">${it.name}${inst.e?` <em>+${inst.e}</em>`:""} <span class="tag">${rarOf(inst).n}</span>${nS>1?` <span class="muted num">×${nS}</span>`:""}</span><span class="istats">${statsTxt(itemStats(inst))}</span><div class="row"><button class="btn pri" data-a="equip" data-u="${inst.u}" ${S.lvl<it.lvl?"disabled":""}>Équiper</button>${lk?`<span class="tag" title="${inst.lk?"Verrouillé":"Rangé dans une tenue"}">Protégé</span>`:`<button class="btn" data-a="sellItem" data-u="${inst.u}">Vendre · ${fmt(sv)} écus</button>`}${lockBtn(inst)}${nS>1?`<button class="btn" data-a="sellStack" data-k="${sk}">Tout vendre (${nS}) · ${fmt(sv*nS)}</button>`:""}</div>`}}
  if(selLast==="inv"&&selInv&&selInv[0]==="r"){const k=selInv.slice(2),r=RES[k],q=S.res[k]||0;if(q>0)
    dl=`<span class="small muted">${kindLabel(r)}</span><span class="iname">${r.name} <span class="muted num">×${fmt(q)}</span></span><span class="istats">${r.txt?r.txt+" · ":""}${priceOf(k)} écus l'unité${r.kind!=="k"?` · cours ×${mkOf(k).toFixed(2)} ${trend(k)}`:""}</span><div class="row">${r.kind==="p"?`<button class="btn pri" data-a="drink" data-r="${k}">Boire</button>`:""}<button class="btn" data-a="sell" data-r="${k}" data-n="1">Vendre 1</button><button class="btn" data-a="sell" data-r="${k}" data-n="10" ${q<10?"disabled":""}>Vendre 10</button><button class="btn pri" data-a="sell" data-r="${k}" data-n="all">Tout vendre · ${fmt(q*priceOf(k))}</button></div>${r.kind!=="k"&&r.kind!=="p"?`<div class="row asell"><label class="autot" data-tip="up:vendeur"><input type="checkbox" data-sell="${k}" ${sellAuto(k)?"checked":""}> Vente auto${up("vendeur")?"":" (Colporteur)"}</label><label class="small">Garder toujours <input type="number" class="keepn" min="0" step="10" data-keep="${k}" value="${sellKeep(k)}"></label></div>`:""}`}
  const noSel=dl.startsWith(`<span class="small muted" style="margin:auto">`);
  const L=`<div class="invL">
    <div class="doll"><div class="dcol">${DOLL_L.map(slotBtn).join("")}</div>
      <div class="dmid">${heroSVG(S.cls,heroArm())}<label class="autot armtog"><input type="checkbox" data-opt="showArmor" ${S.opt.showArmor!==false?"checked":""}> Afficher l'armure</label><span class="nm">${esc(S.name)}</span><span class="small muted">${C.name} · niv. ${S.lvl}</span><span class="small muted num">${fmt(st.maxHp)} PV · ${fmt(st.dps)} dég./s</span></div>
      <div class="dcol">${DOLL_R.map(slotBtn).join("")}</div></div>
    <div class="trophies">${DOLL_B.map(slotBtn).join("")}</div>${outfitsHTML()}
    ${(sc=>Object.keys(sc).length?`<div class="setlist">${Object.keys(sc).map(z=>setBox(z,sc[z],true)).join("")}</div>`:`<div class="setb small">Portez plusieurs pièces d'une même panoplie : chaque pièce à partir de la 2e débloque un bonus.</div>`)(setCounts())}</div>`;
  /* sac */
  const {items,res}=invView(eq);
  const grp=new Map();items.forEach(i=>{const k=stackKey(i);if(!grp.has(k))grp.set(k,{i,n:0,us:[]});const g=grp.get(k);g.n++;g.us.push(i.u)});
  const selU=selInv&&selInv[0]==="u"?+selInv.slice(2):null;
  const all=[...[...grp.values()].map(g=>({t:"u",i:g.us.includes(selU)?S.items.find(x=>x.u===selU):g.i,n:g.n,us:g.us})),...res.map(k=>({t:"r",k}))],PER=36,pages=Math.max(1,Math.ceil(all.length/PER));
  invP=Math.min(invP,pages-1);
  const tiles=all.slice(invP*PER,invP*PER+PER).map(e=>{if(e.t==="u"){const i=e.i,it=ITEMS[i.id];return`<button class="tile${e.us.includes(selU)&&selLast==="inv"?" on":""}" data-a="selInv" data-v="u:${i.u}" title="${esc(it.name)}" style="--ic:${itCol(it)};${i.r?`border-color:${rarOf(i).c};box-shadow:inset 0 0 12px ${rarOf(i).c}44`:""}">${itIcon(it)}${i.e?`<span class="badge">+${i.e}</span>`:""}${isLk(i)?`<span class="lkb" title="Protégé"></span>`:""}${e.n>1?`<span class="q num">×${e.n}</span>`:""}</button>`}
    const r=RES[e.k];return`<button class="tile${selInv==="r:"+e.k&&selLast==="inv"?" on":""}" data-a="selInv" data-v="r:${e.k}" title="${esc(r.name)}" style="--ic:${resCol(r)}">${resIcon(r)}<span class="q num">${fmt(S.res[e.k])}</span></button>`}).join("");
  const F=[["all","Tout","all"],["equip","Équipements","arme"],["fam","Montures et familiers","familier"],["tro","Trophées","trophee"],["res","Ressources","drop"]];
  const w=bagWeight(),cap=bagCap();
  const R=`<div class="invR">
    <div class="itabs">${F.map(([k,n,g])=>`<button class="itab${invF===k?" on":""}" data-a="filt" data-f="${k}" title="${n}" aria-label="${n}">${glyph(g)}</button>`).join("")}</div>
    <select id="invSub" aria-label="Catégorie">${SUBS[invF].map(([k,n])=>`<option value="${k}" ${invSub===k?"selected":""}>${n}</option>`).join("")}</select>
    <div class="invtools"><input id="invSearch" type="text" placeholder="Rechercher par nom" value="${esc(invQ)}" autocomplete="off" spellcheck="false" aria-label="Rechercher dans le sac">${invF==="res"?"":`<select id="invRar" aria-label="Rareté"><option value="-1">Toutes raretés</option>${RAR.map((r,i)=>`<option value="${i}" ${invRar===i?"selected":""}>${r.n}</option>`).join("")}</select>`}</div>
    ${(L=>!L.n?"":invSellArm?`<div class="invsell arm"><span class="small">Vendre les <b>${fmt(L.n)}</b> objets et ressources affichés pour environ <b>${fmt(L.v)}</b> écus ?</span><button class="btn dng" data-a="invSellAll">Confirmer la vente</button><button class="btn" data-a="invSellNo">Annuler</button></div>`
      :`<div class="invsell"><button class="btn" data-a="invSellAll" title="Vend tout ce qui est affiché avec ces filtres, trophées compris (sauf l'équipement porté, les clés de boss, et les potions hors catégorie Potions)">Vendre tout l'affichage · ${fmt(L.n)} · ≈ ${fmt(L.v)} écus</button></div>`)(invSellList(items,res))}
    <div class="igrid">${tiles||`<p class="small muted empty">Rien dans cette catégorie.</p>`}</div>
    <div class="pager"><button class="btn" data-a="page" data-d="-1" ${invP<=0?"disabled":""} aria-label="Page précédente">◀</button><span class="num">${invP+1} / ${pages}</span><button class="btn" data-a="page" data-d="1" ${invP>=pages-1?"disabled":""} aria-label="Page suivante">▶</button></div>
    <div class="detail idock${noSel?" nosel":""}" aria-live="polite">${dl}</div>
    <div class="wallet">
      <div class="wrow"><span class="muted">Écus</span><b class="num">${fmt(S.ecus)} <span class="coin"></span></b></div>
      <div><div class="wrow"><span class="muted">Niveau ${S.lvl}</span><span class="num muted">${S.lvl>=lvlMax()?"max":`${fmt(S.xp)} / ${fmt(need)} XP`}</span></div><div class="bar xp" style="margin-top:4px"><i style="width:${S.lvl>=lvlMax()?100:S.xp/need*100}%"></i></div></div>
      <div><div class="wrow"><span class="muted">Poids du sac</span><span class="num ${w>=cap?"":"muted"}" ${w>=cap?'style="color:var(--hp)"':""}>${fmt(w)} / ${fmt(cap)}</span></div><div class="bar wt${w>=cap?" full":""}" style="margin-top:4px"><i style="width:${Math.min(100,w/cap*100)}%"></i></div></div>
    </div></div>`;
  return`<div class="invsplit">${L}${R}</div>`;
}
