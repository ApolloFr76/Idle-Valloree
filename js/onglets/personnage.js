/* Onglet Personnage. */
function pPerso(){
  const st=stats(),C=CLASSES[S.cls],need=xpNeed(S.lvl);
  let h=`<div class="sheet"><div class="shead">${emb(S.cls,56)}<div><h2>${esc(S.name)}</h2><div class="muted">${C.name}, niveau ${S.lvl}</div></div></div>
  <div class="ptabs"><button class="ptab${ptab==="resume"?" on":""}" data-a="ptab" data-t="resume">Résumé</button><button class="ptab${ptab==="details"?" on":""}" data-a="ptab" data-t="details">Détails</button><button class="ptab${ptab==="stats"?" on":""}" data-a="ptab" data-t="stats">Statistiques</button></div>`;
  if(ptab==="stats"){const T=S.st,t=Math.floor(T.time||0),hh=Math.floor(t/3600),mm=Math.floor(t%3600/60);
    const L=[["Temps de jeu",`${hh} h ${mm} min`],["Clics",fmt(T.clicks||0)],["Combo record",fmt(T.maxCombo||0)],["Dégâts infligés",fmt(T.dmg||0)],["Plus gros coup",fmt(T.maxHit||0)],["Dégâts des compagnons",fmt(T.allyDmg||0)],
      ["Monstres vaincus",fmt(S.kills)],["Boss vaincus",fmt(T.bosses||0)],["Donjons terminés",fmt(T.dungeons||0)],["Record de la tour",`Étage ${S.tower.best}`],["K.O. subis",fmt(T.deaths||0)],
      ["Écus gagnés",fmt(T.ecus||0)],["XP gagnée",fmt(T.xp||0)],["Objets fabriqués",fmt(T.crafts||0)],["Enchantements réussis",`${fmt(T.enchOk||0)} / ${fmt((T.enchOk||0)+(T.enchKo||0))}`],["Meilleur enchantement",`+${T.enchMax||0}`],["Objets cliquables attrapés",fmt(S.pkN||0)]];
    return h+`<div class="statgrid">${L.map(([a,b])=>`<div><span class="muted">${a}</span><b>${b}</b></div>`).join("")}</div></div>`}
  if(ptab==="resume"){
    const row=(k,n,v)=>`<div class="srow" data-tip="s:${k}">${sico(k)}<span>${n}</span><span class="v num" style="grid-column:3/5">${v}</span></div>`;
    h+=`<div class="slist">
      <div class="srow">${sico("xp")}<span>Expérience</span><div class="xpbar"><div class="bar xp" title="${fmt(S.xp)} / ${fmt(need)} XP"><i style="width:${S.lvl>=lvlMax()?100:S.xp/need*100}%"></i></div><div class="small muted num" style="text-align:right;margin-top:2px">${S.lvl>=lvlMax()?"Niveau maximum":`${fmt(S.xp)} / ${fmt(need)}`}</div></div></div>
      <div class="srow" data-tip="el:${st.el}"><span class="sico" style="--c:${ELEMS[st.el].c}"><svg viewBox="0 0 24 24" aria-hidden="true">${ELG[st.el]}</svg></span><span>Élément d'attaque</span><span class="v num" style="grid-column:3/5;text-decoration:underline ${ELEMS[st.el].c} 3px;text-underline-offset:3px">${ELEMS[st.el].n}${st.el==="neutre"?"":` · +${fmt(st.elPow)} %`}</span></div>
      ${row("hp","Points de vie",`${fmt(S.hp)} / ${fmt(st.maxHp)}`)}
      ${row("dmg","Dégâts par coup",fmt(st.hit))}
      ${row("agi","Vitesse d'attaque",`${(1/st.interval).toFixed(2)} coups/s`)}
      ${row("crit","Coups critiques",`${st.critC} % (×${st.critM})`)}
      ${row("dodge","Esquive",`${Math.round(st.dodge*100)} %`)}
      ${row("prospection","Prospection",fmt(st.prospection))}
      ${row("xp","Bonus d'expérience",`+${st.sagesse} %`)}
      ${row("dps","Dégâts par seconde",fmt(st.dps))}
      <div class="sband">Caractéristiques</div>
      ${[["vit","Vitalité"],["sagesse","Sagesse"],["agi","Agilité"],["feu","Feu"],["eau","Eau"],["terre","Terre"],["air","Air"]].map(([k,n])=>`<div class="srow" data-tip="s:${k}">${sico(k)}<span>${n} <span class="small muted num">(${S.alloc[k]} investis)</span><br><span class="small" style="color:var(--xp)">${secTxt(k,st[k])}${secMax(k,st[k])?"":` <span class="muted">· prochain palier à ${(Math.floor((st[k]||0)/SEC_STEP)+1)*SEC_STEP}</span>`}</span></span><span class="v num">${fmt(st[k])}</span><div class="row" style="gap:4px;flex-wrap:nowrap"><button class="plus" data-a="alloc" data-k="${k}" data-n="1" ${S.pts<1||lockA(k,st)?"disabled":""} aria-label="Ajouter 1 point en ${n}">+</button><button class="btn" data-a="alloc" data-k="${k}" data-n="10" ${S.pts<1||lockA(k,st)?"disabled":""} style="padding:4px 6px">+10</button></div></div>`).join("")}
    </div>
    <div class="sfoot"><button class="btn" data-a="respec">↺ Réinitialiser</button><span class="ptsbox">Points <b class="num${S.pts?" has":""}">${S.pts}</b></span></div>`;
  }else{
    const B=statBreak(),L={feu:"Feu",eau:"Eau",terre:"Terre",air:"Air",vit:"Vitalité",puissance:"Puissance (tous élém.)",agi:"Agilité",sagesse:"Sagesse",crit:"Critique (%)",prospection:"Prospection",dmg:"Dégâts fixes"};
    h+=`<div class="tw"><table class="dtab"><thead><tr><th>Caractéristique</th><th class="r">Classe</th><th class="r">Points</th><th class="r">Équip.</th><th class="r">Panoplie</th><th class="r">Total</th></tr></thead><tbody>`+
      Object.keys(L).map(k=>{const b=B[k],t=b.base+b.pts+b.eq+b.set;return`<tr><td><span class="row" style="gap:6px;flex-wrap:nowrap">${sico(k)}${L[k]}</span></td><td class="r num">${fmt(b.base)}</td><td class="r num">${fmt(b.pts)}</td><td class="r num">${fmt(b.eq)}</td><td class="r num">${fmt(b.set)}</td><td class="r num t">${fmt(t)}</td></tr>`}).join("")+`</tbody></table></div>`;
    const sc=setCounts(),sets=Object.keys(sc);
    {const st2=stats(),LB={vit:"Vitalité",sagesse:"Sagesse",agi:"Agilité",feu:"Feu",eau:"Eau",terre:"Terre",air:"Air"};h+=`<h3 style="font-size:15px;color:var(--gold)">Bonus secondaires</h3><div class="setb">Chaque caractéristique donne un bonus en plus tous les ${SEC_STEP} points (équipement et panoplies compris).<div class="tsep" style="border-top:2px dashed var(--line);margin:6px 0"></div>${Object.keys(SEC).map(k=>`<div class="secrow" data-tip="s:${k}">${sico(k)}<b>${LB[k]}</b><span class="muted num">${fmt(st2[k])}</span><span style="margin-left:auto;color:var(--xp);text-align:right">${secTxt(k,st2[k])}</span></div>`).join("")}</div>`}
    h+=`<h3 style="font-size:15px;color:var(--gold)">Faiblesses et résistances</h3><div class="setb">Votre élément d'attaque est celui où votre caractéristique est la plus haute.<br><span class="row" style="gap:4px;margin:6px 0">${elChip("eau")} › ${elChip("feu")} › ${elChip("air")} › ${elChip("terre")} › ${elChip("eau")}</span>Contre un monstre : ${-RES_WEAK} % de dégâts en plus s'il est faible à votre élément, ${RES_SELF} % en moins s'il est du même élément, ${RES_STRONG} % en moins si son élément bat le vôtre.</div>`;
    h+=`<h3 style="font-size:15px;color:var(--gold)">Bonus de panoplie</h3>`+(sets.length?sets.map(z=>setBox(z,sc[z])).join(""):`<p class="small muted">Portez plusieurs pièces d'une même panoplie pour obtenir des bonus.</p>`);
    h+=`<div class="slist"><div class="srow">${sico("crit")}<span>Objets attrapés</span><span class="v num" style="grid-column:3/5">${fmt(S.pkN||0)}</span></div><div class="srow">${sico("kills")}<span>Monstres vaincus</span><span class="v num" style="grid-column:3/5">${fmt(S.kills)}</span></div>
      <div class="srow">${sico("puissance")}<span>Bonus de classe</span><span class="v small" style="grid-column:3/5;font-weight:600">${C.desc}</span></div></div>`;
  }
  return h+`</div>`;
}
