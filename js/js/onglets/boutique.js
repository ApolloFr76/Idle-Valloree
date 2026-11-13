/* Onglet Boutique. */
function pShop(){
  return`<div class="sec"><h3>Boutique d'améliorations</h3><p class="small muted">Des achats définitifs, payés en écus.${UPGS.some(u=>up(u[0]))?` ${UPGS.filter(u=>up(u[0])).length} / ${UPGS.length} déjà achetées.`:""}</p><div class="shop">`+(UPGS.every(u=>up(u[0]))?`<p class="small">Tout est acheté !</p>`:"")+UPGS.filter(u=>!up(u[0])).sort((a,b)=>a[3]-b[3]).map(([id,n,t,c])=>{const own=up(id);return`<div class="upg${own?" own":""}" data-tip="up:${id}"><b>${n}</b><span class="small muted">${t}</span><div class="row">${own?`<span class="tag">Acheté</span>`:`<button class="btn pri" data-a="buy" data-u="${id}" ${S.ecus<c?"disabled":""}>Acheter · ${fmt(c)} écus</button>`}</div></div>`}).join("")+`</div></div>`;
}
