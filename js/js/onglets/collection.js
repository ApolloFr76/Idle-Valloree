/* Onglet Collection (succès, bestiaire). */
function pColl(){
  let h=`<div class="ptabs" style="grid-template-columns:1fr 1fr 1fr;margin-bottom:10px"><button class="ptab${ctab==="ach"?" on":""}" data-a="ctab" data-t="ach">Succès</button><button class="ptab${ctab==="best"?" on":""}" data-a="ctab" data-t="best">Bestiaire</button><button class="ptab${ctab==="fish"?" on":""}" data-a="ctab" data-t="fish">Poissonnédia</button></div>`;
  if(ctab==="fish")return h+fishDexHTML();
  if(ctab==="ach"){const n=achN();
    h+=`<div class="sec"><div class="row" style="justify-content:space-between"><h3>Succès · ${n} / ${ACH.length}</h3><span class="small">Bonus : <b>+${n} %</b> de dégâts et d'écus</span></div><div class="ach">`+ACH.map(a=>{const d=!!S.ach[a.id],v=Math.min(a.v,a.get());return`<div class="ac${d?" done":""}" data-tip="ach:${a.id}"><span class="md">${achIcon(achKey(a))}</span><div style="min-width:0"><b>${a.n}</b><div class="small muted">${a.txt}${d?"":` · <span class="num">${fmt(v)} / ${fmt(a.v)}</span>`}</div></div></div>`}).join("")+`</div></div>`}
  else{h+=`<div class="sec"><h3>Bestiaire</h3><p class="small muted">Paliers à ${BEST_T.map(fmt).join(", ")} victoires. Chaque palier donne +5 % de dégâts et +10 % de butin contre la créature.</p><div class="best">`+
    Object.values(MON).map(m=>{const k=S.best[m.id]||0,t=bestTier(m.id),nx=BEST_T[t],pv=t?BEST_T[t-1]:0,known=k>0;
      return`<div class="bc${known?"":" unk"}" data-tip="m:${m.id}">${monsterSVG(m)}<b class="small">${known?m.name:"???"}</b>${known?elChip(m.el):""}<span class="small muted">${ZONES[m.zone].name}${m.boss?" · boss":""}</span><span class="tierst">${"★".repeat(t)}${"☆".repeat(4-t)}</span><div class="bar xp"><i style="width:${nx?Math.min(100,(k-pv)/(nx-pv)*100):100}%"></i></div><span class="small num muted">${fmt(k)}${nx?" / "+fmt(nx):""}</span><div class="bloot">${(LOOT[m.id]||[]).filter(l=>!l.item).map(l=>`<span class="${seen(l.id)?"":"unk"}${l.p<.06?" lr":""}">${seen(l.id)?l.n:"???"} · ${Math.round(l.p*100)||l.p*100} %</span>`).join("")}</div></div>`}).join("")+`</div></div>`}
  return h;
}
