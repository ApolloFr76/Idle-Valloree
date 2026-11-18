/* Écrans : création du personnage, retour hors ligne. */
/* --- Écrans --- */
let pick="guerrier";
function showCreate(){
  const o=$("ov");o.hidden=false;
  o.innerHTML=`<div class="ovc"><div><h2>Les Terres de Vallorée</h2><p class="muted">Choisissez votre classe. Votre élément (Feu, Eau, Terre, Air) dépendra des points que vous y investirez.</p></div>
  <div class="classes">${Object.entries(CLASSES).map(([k,c])=>`<button class="cls${k===pick?" on":""}" data-a="pick" data-k="${k}">${heroSVG(k)}<h3>${c.name}</h3><span class="small muted">${c.desc}</span><ul>${c.spells.map(s=>`<li>${s.name} (niv. ${s.lvl}) : ${s.txt}</li>`).join("")}</ul></button>`).join("")}</div>
  <div class="row"><input type="text" id="heroName" maxlength="20" value="${esc(S.name||"Aventurier")}" aria-label="Nom du personnage"><button class="btn pri" data-a="start" style="padding:9px 16px;font-size:14px">Commencer l'aventure</button></div></div>`;
}
function showOffline(s){
  const h=Math.floor(s.sec/3600),m=Math.floor(s.sec%3600/60),res=Object.entries(s.res);
  const o=$("ov");o.hidden=false;
  o.innerHTML=`<div class="ovc" style="max-width:460px"><h2>Pendant votre absence</h2><p class="muted">${h?h+" h ":""}${m} min écoulées${s.sec>=8*3600?" (maximum 8 h)":""}.</p>
  ${s.kills?`<p><b class="num">${fmt(s.kills)}</b> monstres vaincus · <span style="color:var(--xp)">+${fmt(s.xp)} XP</span> · <span style="color:var(--gold)">+${fmt(s.ecus)} écus</span></p>`:s.danger?`<p class="small muted">La zone choisie était trop dangereuse pour chasser seul.</p>`:""}
  ${res.length?`<p class="small">${res.map(([n,q])=>`${fmt(q)}× ${n}`).join(" · ")}</p>`:""}
  <div class="row"><button class="btn pri" data-a="closeOv">Continuer</button></div></div>`;
}

