/* Onglet Compagnons. */
function pAllies(){
  const tot=allyDps();
  return`<div class="sec"><div class="row" style="justify-content:space-between"><h3>Compagnons</h3><span class="small">Total : <b class="num">${fmt(tot)}</b> dégâts/s</span></div><p class="small muted">Ils frappent tout seuls, même pendant les donjons et la tour. Leurs dégâts augmentent de 50 % tous les 25 niveaux.</p><div class="alist">`+
  ALLIES.map(([id,n,base,cost,col],i)=>{const l=S.allies[id]||0,vis=l>0||i===0||(S.allies[ALLIES[i-1][0]]||0)>0||S.ecus>=cost*.5,c=allyCost(i,l);
    if(!vis)return`<div class="ally lock"><div class="av" style="background:#3a4656;color:var(--muted)">?</div><div class="small muted">Compagnon inconnu · ${fmt(cost)} écus</div><span></span></div>`;
    return`<div class="ally" data-tip="al:${i}"><div class="av" style="background:${col}">${n[0]}</div><div style="min-width:0"><b>${n}</b> <span class="small muted num">niv. ${l}</span><div class="small muted num">${fmt(allyDpsOf(i,l))} dégâts/s · prochain niveau +${fmt(allyDpsOf(i,l+1)-allyDpsOf(i,l))}</div></div><div class="btns"><button class="btn pri" data-a="ally" data-i="${i}" data-n="1" ${S.ecus<c?"disabled":""}>${l?"Niveau +1":"Recruter"} · ${fmt(c)}</button><button class="btn" data-a="ally" data-i="${i}" data-n="10" ${S.ecus<c?"disabled":""}>+10</button><button class="btn" data-a="ally" data-i="${i}" data-n="max" ${S.ecus<c?"disabled":""}>Max</button></div></div>`}).join("")+`</div></div>`;
}
