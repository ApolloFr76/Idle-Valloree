let allocN=100;   /* nombre de points ajoutés par le bouton « +N » (champ en bas de l'onglet) */
/* Onglet Personnage. */
function pPerso(){
  const st=stats(),C=CLASSES[S.cls],need=xpNeed(S.lvl);
  let h=`<div class="sheet"><div class="shead">${myBadge(56)}<div><h2>${esc(S.name)}</h2><div class="muted">${C.name}, niveau ${S.lvl}</div></div></div>
  <div class="ptabs"><button class="ptab${ptab==="resume"?" on":""}" data-a="ptab" data-t="resume">Résumé</button><button class="ptab${ptab==="details"?" on":""}" data-a="ptab" data-t="details">Détails</button><button class="ptab${ptab==="stats"?" on":""}" data-a="ptab" data-t="stats">Statistiques</button></div>`;
  if(ptab==="stats"){const T=S.st,t=Math.floor(T.time||0),hh=Math.floor(t/3600),mm=Math.floor(t%3600/60);
    const L=[["Temps de jeu",`${hh} h ${mm} min`],["Clics",fmt(T.clicks||0)],["Combo record",fmt(T.maxCombo||0)],["Dégâts infligés",fmt(T.dmg||0)],["Plus gros coup",fmt(T.maxHit||0)],["Dégâts des compagnons",fmt(T.allyDmg||0)],
      ["Monstres vaincus",fmt(S.kills)],["Boss vaincus",fmt(T.bosses||0)],["Donjons terminés",fmt(T.dungeons||0)],["Record de la tour",`Étage ${S.tower.best}`],["K.O. subis",fmt(T.deaths||0)],
      ["Écus gagnés",fmt(T.ecus||0)],["XP gagnée",fmt(T.xp||0)],["Objets fabriqués",fmt(T.crafts||0)],["Enchantements réussis",`${fmt(T.enchOk||0)} / ${fmt((T.enchOk||0)+(T.enchKo||0))}`],["Meilleur enchantement",`+${T.enchMax||0}`],["Objets cliquables attrapés",fmt(S.pkN||0)]];
    return h+`<div class="statgrid">${L.map(([a,b])=>`<div><span class="muted">${a}</span><b>${b}</b></div>`).join("")}</div>${histHTML()}</div>`}
  if(ptab==="resume"){
    const row=(k,n,v)=>`<div class="srow" data-tip="s:${k}">${sico(k)}<span>${n}</span><span class="v num" style="grid-column:3/5">${v}</span></div>`;
    h+=`<div class="slist">
      <div class="srow">${sico("xp")}<span>Expérience</span><div class="xpbar"><div class="bar xp" title="${fmt(S.xp)} / ${fmt(need)} XP"><i style="width:${S.lvl>=lvlMax()?100:S.xp/need*100}%"></i></div><div class="small muted num" style="text-align:right;margin-top:2px">${S.lvl>=lvlMax()?"Niveau maximum":`${fmt(S.xp)} / ${fmt(need)}`}</div></div></div>
      <div class="srow" data-tip="el:${st.el}"><span class="sico" style="--c:${ELEMS[st.el].c}"><svg viewBox="0 0 24 24" aria-hidden="true">${ELG[st.el]}</svg></span><span>Élément d'attaque</span><span class="v num" style="grid-column:3/5;text-decoration:underline ${ELEMS[st.el].c} 3px;text-underline-offset:3px">${ELEMS[st.el].n}${st.el==="neutre"?"":` · +${fmt(st.elPow)} %`}</span></div>
      ${row("hp","Points de vie",`${fmt(S.hp)} / ${fmt(st.maxHp)}`)}
      ${row("dmg","Dégâts par coup",fmt(st.hit))}
      ${row("agi","Vitesse d'attaque",`${(1/st.interval).toFixed(2)} coups/s`)}
      ${row("crit","Coups critiques",`${Math.round(st.critShow)} % (×${st.critM}${st.superC>0?` · super ×${+(st.critM*2).toFixed(2)}`:""})`)}
      ${row("dodge","Esquive",`${Math.round(st.dodge*100)} %`)}
      ${row("prospection","Prospection",fmt(st.prospection))}
      ${row("xp","Bonus d'expérience",`+${fmt(Math.round((st.xpM-1)*100))} %`)}
      ${row("dps","Dégâts par seconde",fmt(st.dps))}
      <div class="srow">${sico("dps")}<span>dont dégâts sur la durée</span><span class="v num" style="grid-column:3/5">${fmt(st.dotDps)}</span></div>
      ${Object.entries(DOTS).map(([k,D])=>`<div class="srow" title="${D.n} (${ELEMS[D.el].n}) : ${D.txt}. Stat ${D.n} : ${fmt(st[k]||0)}">${sico(k)}<span style="color:${D.c};font-weight:700">${D.n}</span><span class="v num small" style="grid-column:3/5">${Math.round(st.dotC[k]*100)} % par coup · ${fmt(st.dotPer[k])}/charge/s · ${D.max} max</span></div>`).join("")}
      <div class="sband">Caractéristiques</div>
      ${[["vit","Vitalité"],["sagesse","Sagesse"],["agi","Agilité"],["feu","Feu"],["eau","Eau"],["terre","Terre"],["air","Air"]].map(([k,n])=>`<div class="srow" data-tip="s:${k}">${sico(k)}<span>${n} <span class="small muted num">(${S.alloc[k]} investis)</span><br><span class="small" style="color:var(--xp)">${secTxt(k,st[k])}${secMax(k,st[k])?"":` <span class="muted">· prochain palier à ${(Math.floor((st[k]||0)/SEC_STEP)+1)*SEC_STEP}</span>`}</span></span><span class="v num">${fmt(st[k])}</span><div class="row" style="gap:4px;flex-wrap:nowrap"><button class="plus" data-a="alloc" data-k="${k}" data-n="1" ${S.pts<1||lockA(k,st)?"disabled":""} aria-label="Ajouter 1 point en ${n}">+</button><button class="btn" data-a="alloc" data-k="${k}" data-n="10" ${S.pts<1||lockA(k,st)?"disabled":""} style="padding:4px 6px">+10</button><button class="btn pri" data-a="alloc" data-k="${k}" data-n="custom" ${S.pts<1||lockA(k,st)?"disabled":""} style="padding:4px 6px" title="Ajouter le nombre de points choisi en bas">+${fmt(allocN)}</button></div></div>`).join("")}
    </div>
    <div class="sfoot"><button class="btn" data-a="respec">↺ Réinitialiser</button><label class="allocn">Points par clic <input id="allocN" type="number" min="1" step="1" value="${allocN}" inputmode="numeric"></label><span class="ptsbox">Points <b class="num${S.pts?" has":""}">${S.pts}</b></span></div>`;
  }else{
    const B=statBreak(),L={feu:"Feu",eau:"Eau",terre:"Terre",air:"Air",vit:"Vitalité",puissance:"Puissance (tous élém.)",agi:"Agilité",sagesse:"Sagesse",crit:"Critique (%)",prospection:"Prospection",dmg:"Dégâts fixes",poison:"Poison (Air)",brulure:"Brûlure (Feu)",gelure:"Gelure (Eau)",saignement:"Saignement (Terre)"};
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
/* Courbe de progression (Statistiques) : un relevé par heure dans S.hist, gardé 7 jours et conservé au passage Oméga. */
const HIST_STEP=3600e3,HIST_KEEP=7*24*3600e3;
const histNow=()=>({t:Date.now(),lvl:S.lvl,prest:S.prest||0,souls:S.soulsTotal||0,tour:(S.tower&&S.tower.best)||0,dps:Math.round(stats().dps||0)});
function histTick(){if(!S||!S.cls)return;const h=Array.isArray(S.hist)?S.hist:(S.hist=[]),now=Date.now();if(h.length&&now-h[h.length-1].t<HIST_STEP)return;h.push(histNow());while(h.length&&now-h[0].t>HIST_KEEP)h.shift()}
const HIST_C=[["lvl","Niveau",0],["souls","Éclats gagnés depuis le début",1],["tour","Record de la tour (partie en cours)",0],["dps","Dégâts par seconde",1]];
function histChart(P,k,name,lg){const W=300,H=92,pl=4,pr=4,pt=16,pb=16,f=v=>lg?Math.log10(1+Math.max(0,v)):v,vs=P.map(p=>f(p[k]||0));let lo=Math.min(...vs),hi=Math.max(...vs);if(hi-lo<1e-9){hi=lo+1;lo=Math.max(0,lo-1)}
  const t0=P[0].t,t1=P[P.length-1].t||t0+1,X=t=>pl+(W-pl-pr)*(t1>t0?(t-t0)/(t1-t0):1),Y=v=>pt+(H-pt-pb)*(1-(f(v)-lo)/(hi-lo)),pts=P.map(p=>[X(p.t),Y(p[k]||0)]);
  const d="M"+pts.map(q=>q[0].toFixed(1)+" "+q[1].toFixed(1)).join("L"),last=P[P.length-1],dt=t=>new Date(t).toLocaleString("fr-FR",{weekday:"short",hour:"2-digit",minute:"2-digit"});
  const hit=pts.map((q,i)=>{const x0=i?(pts[i-1][0]+q[0])/2:0,x1=i<pts.length-1?(q[0]+pts[i+1][0])/2:W;return`<g class="hp"><rect x="${x0.toFixed(1)}" y="0" width="${Math.max(1,x1-x0).toFixed(1)}" height="${H}" fill="transparent"></rect><line x1="${q[0].toFixed(1)}" x2="${q[0].toFixed(1)}" y1="${pt}" y2="${H-pb}"></line><circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="4"></circle><title>${i===pts.length-1?"Maintenant":dt(P[i].t)} : ${fmt(P[i][k]||0)}</title></g>`}).join("");
  return`<div class="hchart"><div class="hhead"><span class="muted">${name}</span><b class="num">${fmt(last[k]||0)}</b></div><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${name} : de ${fmt(P[0][k]||0)} à ${fmt(last[k]||0)}">
    <line class="hbase" x1="${pl}" x2="${W-pr}" y1="${H-pb}" y2="${H-pb}"></line><path d="${d}"></path>${hit}</svg><div class="hfoot small muted"><span>${P.length>1?dt(P[0].t):""}</span><span>maintenant</span></div></div>`}
function histHTML(){const P=(Array.isArray(S.hist)?S.hist:[]).filter(p=>Date.now()-p.t<=HIST_KEEP).concat([histNow()]);
  return`<div class="sec hist"><h3>Progression · 7 derniers jours</h3>${P.length<3?`<p class="small muted">La courbe se remplit au fil du jeu : un relevé par heure, gardé 7 jours.</p>`:""}<div class="hgrid">${HIST_C.map(([k,n,lg])=>histChart(P,k,n,lg)).join("")}</div><p class="small muted">Survolez une courbe pour voir les valeurs. Échelle logarithmique pour les éclats et les dégâts.</p></div>`}
