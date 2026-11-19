/* Onglet Oméga (renaissance, classe, talents). */
let prestConfirm=false,ctab="ach",otabP="ren";
function pPrest(){
  const g=soulsGain(),can=g>0,nA=Object.keys(arbS().own).filter(k=>k!=="echo").length,nB=Object.keys(S.bossLife||{}).length;if(otabP==="tal"||otabP==="perm")otabP="arbre";
  /* en-tête compact, toujours visible : éclats, niveau Oméga, bonus et bouton de renaissance */
  let h=`<div class="ohead"><div class="osoul"><span class="soul"></span><b class="num">${fmt(S.souls)}</b><span class="small">éclats</span></div>
    <div class="oinfo"><b>Ω ${S.prest||0}</b><span class="tag">+${10*omegaN()} % XP</span><span class="tag">+${10*omegaN()} % écus</span>${arb("coeur")?`<span class="tag" title="+12,5 % chaque fois que vos éclats gagnés depuis le début sont multipliés par 10">+${fmt(soulBonus())} % dégâts (éclats gagnés)</span>`:""}${arbS().echo?`<span class="tag">Écho ×${arbEcho().toFixed(2)}</span>`:""}</div>
    <div class="oact">${can?(prestConfirm?`<button class="btn pri" data-a="prestYes">Confirmer · +${g}</button><button class="btn" data-a="prestNo">Annuler</button>`:`<button class="btn pri" data-a="prestAsk">Passer Oméga · +${g} <span class="soul"></span></button>`):`<span class="small">Oméga au niveau ${PREST_LVL}</span>`}</div></div>`;
  const T=[["ren","Renaissance",`${nB}/${BOSSES.length} boss`],["arbre","Arbre",`${nA}/${ARB.length-1}`],["cls","Classe",CLASSES[S.cls].name]];
  h+=`<div class="osub">${T.map(([k,n,x])=>`<button class="${otabP===k?"on":""}" data-a="otabP" data-t="${k}">${n} <span class="num">${x}</span></button>`).join("")}</div>`;
  if(otabP==="ren"){
    h+=`<div class="sec"><p class="small" style="margin:0">Passer Oméga vous ramène au niveau 1 : vous perdez niveau, écus, équipement, ressources, compagnons, achats de boutique (sauf ceux gardés par l'arbre) et niveaux de métier. Vous gardez éclats, arbre Oméga, succès, bestiaire et statistiques. Chaque Oméga donne +10 % d'XP et +10 % d'écus.</p>
      <div class="small" style="margin-top:8px">Boss vaincus dans cette vie : <b>${nB} / ${BOSSES.length}</b> · <b>+${fmt(bossSouls())}</b> <span class="soul"></span> au prochain Oméga (une fois par boss et par vie).</div>
      <div class="obosses">${BOSSES.map((b,i)=>{const d=S.bossLife&&S.bossLife[i];return`<span class="${d?"on":""}">${d?"✓ ":""}${b[0]}<b class="num">${fmt(BOSS_SOULS[i])}</b></span>`}).join("")}</div>
      <p class="small muted" style="margin:8px 0 0">Dépensez vos éclats dans l'onglet Arbre. Le Cœur d'Oméga, au bout des 4 voies, ajoute +12,5 % de dégâts chaque fois que vos éclats gagnés (${fmt(S.soulsTotal||0)} au total) sont multipliés par 10.</p></div>`}
  if(otabP==="arbre")h+=pArbre();
  if(otabP==="cls"){const cc=clsCost();
    h+=`<div class="sec"><p class="small muted" style="margin:0 0 8px">Vous gardez votre niveau, vos objets et vos points répartis. Coût : <b>${cc}</b> <span class="soul"></span>, +5 à chaque changement.</p><div class="row" style="flex-wrap:wrap;gap:6px">${Object.entries(CLASSES).map(([k,c])=>k===S.cls?`<span class="tag">${c.name} (actuelle)</span>`:`<button class="btn" data-a="clsSwap" data-k="${k}" data-tip="cl:${k}" ${S.souls<cc?"disabled":""}>${c.name}</button>`).join("")}</div></div>`}
  return h;
}
