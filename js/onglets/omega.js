/* Onglet Oméga (renaissance, classe, talents). */
let prestConfirm=false,ctab="ach",otabP="ren";
function pPrest(){
  const g=soulsGain(),can=g>0,P=S.upPerm||{},nP=UPGS.filter(u=>P[u[0]]).length,nT=Object.keys(TAL).filter(id=>tal(id)>0).length,nB=Object.keys(S.bossLife||{}).length;
  /* en-tête compact, toujours visible : éclats, niveau Oméga, bonus et bouton de renaissance */
  let h=`<div class="ohead"><div class="osoul"><span class="soul"></span><b class="num">${fmt(S.souls)}</b><span class="small">éclats</span></div>
    <div class="oinfo"><b>Ω ${S.prest||0}</b><span class="tag">+${10*omegaN()} % XP</span><span class="tag">+${10*omegaN()} % écus</span><span class="tag" title="+0,1 % par éclat gagné depuis le début, même dépensé">+${fmt(soulBonus())} % dégâts (éclats gagnés)</span></div>
    <div class="oact">${can?(prestConfirm?`<button class="btn pri" data-a="prestYes">Confirmer · +${g}</button><button class="btn" data-a="prestNo">Annuler</button>`:`<button class="btn pri" data-a="prestAsk">Passer Oméga · +${g} <span class="soul"></span></button>`):`<span class="small">Oméga au niveau ${PREST_LVL}</span>`}</div></div>`;
  const T=[["ren","Renaissance",`${nB}/${BOSSES.length} boss`],["tal","Talents",`${nT}/${Object.keys(TAL).length}`],["perm","Boutique permanente",`${nP}/${UPGS.length}`],["cls","Classe",CLASSES[S.cls].name]];
  h+=`<div class="osub">${T.map(([k,n,x])=>`<button class="${otabP===k?"on":""}" data-a="otabP" data-t="${k}">${n} <span class="num">${x}</span></button>`).join("")}</div>`;
  if(otabP==="ren"){
    h+=`<div class="sec"><p class="small" style="margin:0">Passer Oméga vous ramène au niveau 1 : vous perdez niveau, écus, équipement, ressources, compagnons, achats de boutique (sauf permanents) et niveaux de métier. Vous gardez éclats, talents, succès, bestiaire et statistiques. Chaque Oméga donne +10 % d'XP et +10 % d'écus.</p>
      <div class="small" style="margin-top:8px">Boss vaincus dans cette vie : <b>${nB} / ${BOSSES.length}</b> · <b>+${fmt(bossSouls())}</b> <span class="soul"></span> au prochain Oméga (une fois par boss et par vie).</div>
      <div class="obosses">${BOSSES.map((b,i)=>{const d=S.bossLife&&S.bossLife[i];return`<span class="${d?"on":""}">${d?"✓ ":""}${b[0]}<b class="num">${fmt(BOSS_SOULS[i])}</b></span>`}).join("")}</div>
      <p class="small muted" style="margin:8px 0 0">Chaque éclat gagné donne +0,1 % de dégâts pour toujours, même une fois dépensé : achetez des talents sans hésiter (${fmt(S.soulsTotal||0)} éclats gagnés au total).</p></div>`}
  if(otabP==="tal"){
    h+=`<div class="sec"><div class="row" style="justify-content:space-between;align-items:center"><span class="small muted">Chaque talent demande un rang dans celui du dessus. Survolez un talent pour son détail.</span><button class="btn" data-a="talReset">Rendre les éclats</button></div><div class="ttree otree">`+
    Object.entries(TALENTS).map(([br,l])=>`<div class="tbr"><h4>${br}</h4>`+l.map(t=>{const TT=TAL[t[0]],r=tal(TT.id),lock=TT.prev&&!tal(TT.prev),c=talCost(TT.id);
      return`<div class="otal${r?" has":""}${lock?" lock":""}" data-tip="tal:${TT.id}"><span><b>${TT.n}</b><span class="small num">rang ${r}</span></span>${talIsMax(TT.id)?`<span class="tag">MAX</span>`:`<button class="btn ${S.souls>=c&&!lock?"pri":""}" data-a="talent" data-t="${TT.id}" ${S.souls<c||lock?"disabled":""}>+${fmt(c)} <span class="soul"></span></button>`}</div>`}).join("")+`</div>`).join("")+`</div></div>`}
  if(otabP==="perm"){
    h+=`<div class="sec"><p class="small muted" style="margin:0 0 8px">Une amélioration permanente est active tout de suite et reste après chaque Oméga. Survolez pour son effet.</p><div class="operm">`+
    UPGS.slice().sort((a,b)=>a[3]-b[3]).map(([id,nm])=>{const c=upPermCost(id),own=P[id];return`<div class="${own?"own":""}" data-tip="up:${id}"><span>${nm}</span>${own?`<span class="tag">Permanente</span>`:`<button class="btn ${S.souls>=c?"pri":""}" data-a="upPerm" data-u="${id}" ${S.souls<c?"disabled":""}>${c} <span class="soul"></span></button>`}</div>`}).join("")+`</div></div>`}
  if(otabP==="cls"){const cc=clsCost();
    h+=`<div class="sec"><p class="small muted" style="margin:0 0 8px">Vous gardez votre niveau, vos objets et vos points répartis. Coût : <b>${cc}</b> <span class="soul"></span>, +5 à chaque changement.</p><div class="row" style="flex-wrap:wrap;gap:6px">${Object.entries(CLASSES).map(([k,c])=>k===S.cls?`<span class="tag">${c.name} (actuelle)</span>`:`<button class="btn" data-a="clsSwap" data-k="${k}" data-tip="cl:${k}" ${S.souls<cc?"disabled":""}>${c.name}</button>`).join("")}</div></div>`}
  return h;
}
