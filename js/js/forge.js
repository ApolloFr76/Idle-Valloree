/* Forge : mini-jeu de rareté (QTE). */
/* ================= Forge : mini-jeu de rareté ================= */
let forge=null;
function pickW(w){let r=Math.random()*w.reduce((a,b)=>a+b,0);for(let i=0;i<w.length;i++){if((r-=w[i])<0)return i}return 0}
function startForge(it){forge={it,pts:[],pos:0,speed:.75*S.opt.forgeSpeed,zone:rnd(15,85),t0:performance.now(),done:false};
  if(!S.opt.forgeQte){forgeFinish(true);return}drawForge();requestAnimationFrame(forgeAnim)}
/* Le curseur suit l'heure réelle : même si une image saute, il est toujours au bon endroit */
function forgeAnim(){const f=forge;if(!f||f.done)return;const t=$("ftrack");if(t)t.style.transform=`translateX(${forgePos(f)}%)`;requestAnimationFrame(forgeAnim)}
function drawForge(){const f=forge,o=$("ov");o.hidden=false;const sc=f.pts.reduce((a,b)=>a+b,0);
  o.innerHTML=`<div class="ovc forge"><div class="row" style="justify-content:space-between"><h2>Forge</h2><span class="small muted">${f.it.name}</span></div>
  <p class="small muted" style="margin:0">Frappez quand le curseur passe dans la zone dorée. Trois coups de marteau. Zone blanche : 2 points, zone dorée : 1 point.</p>
  <div class="strikes">${[0,1,2].map(i=>`<span class="stk ${f.pts[i]==null?"":f.pts[i]===2?"pf":f.pts[i]===1?"gd":"ms"}">${f.pts[i]==null?"":f.pts[i]===2?"Parfait":f.pts[i]===1?"Bien":"Raté"}</span>`).join("")}</div>
  <div class="fbar" data-a="forgeHit"><div class="fgood" style="left:${f.zone-11}%;width:22%"></div><div class="fperf" style="left:${f.zone-3.5}%;width:7%"></div><div class="ftrack" id="ftrack" style="transform:translateX(${forgePos(f)}%)"><div class="fcur"></div></div></div>
  <div class="odds">${RAR.map((r,i)=>`<span style="color:${r.c}">${r.n} <b class="num">${FORGE_W[Math.min(6,sc+2*(3-f.pts.length))][i]} %</b></span>`).join("")}<span class="small muted">au mieux</span></div>
  <div class="row"><button class="btn pri" data-a="forgeHit" style="padding:10px 22px;font-size:15px">Frapper <kbd>Espace</kbd></button><button class="btn" data-a="forgeSkip">Passer (chances de base)</button></div></div>`}
const forgePos=f=>{const ph=((performance.now()-f.t0)/1000*f.speed*100)%200;return ph<=100?ph:200-ph};
function forgeStrike(){const f=forge;if(!f||f.done)return;f.pos=forgePos(f);const d=Math.abs(f.pos-f.zone),p=d<=3.5?2:d<=11?1:0;f.pts.push(p);sfx(p?"anvil":"anvilBad");
  if(f.pts.length>=3){forgeFinish(false);return}{const p=forgePos(f);f.speed*=1.3;const T=2/f.speed,ph=p/100*T/2;f.t0=performance.now()-ph*1000}f.zone=rnd(12,88);drawForge()}
function forgeFinish(skip){const f=forge;if(!f||f.done)return;f.done=true;const sc=f.pts.reduce((a,b)=>a+b,0),r=pickW(skip?FORGE_SKIP:FORGE_W[sc]),it=f.it;
  const u=S.uid++,inst={u,id:it.id,e:0,r};S.items.push(inst);inc("crafts");qProg("craft");if(r===3)inc("legend");mx("bestRar",r);
  const fs=freeSlot(it),cur=S.equip[fs];if(fs)S.equip[fs]=u;
  log(`Vous fabriquez : <span style="color:${RAR[r].c}">${it.name} (${RAR[r].n})</span>${skip?"":` · score ${sc}/6`}.`,"g");if(r>=2){sfx("level");FX.flash(RAR[r].c)}else sfx("coin");
  if(!S.opt.forgeQte){toast(`${it.name} ${RAR[r].n.toLowerCase()}${fs?" fabriqué et équipé":" fabriqué"}`);forge=null;renderPanel();return}
  $("ov").innerHTML=`<div class="ovc forge" style="text-align:center;align-items:center"><span class="small muted">${skip?"Forgé sans mini-jeu":`Score : ${sc} / 6`}</span><h2 style="color:${RAR[r].c}">${RAR[r].n}</h2><div class="iname" style="color:${RAR[r].c};font-size:17px">${it.name}</div><div class="istats">${statsTxt(itemStats(inst))}</div><span class="small muted">${fs?"Équipé automatiquement.":"Rangé dans l'Inventaire."}</span><button class="btn pri" data-a="forgeClose" style="padding:9px 20px">Continuer</button></div>`;
  $("ov").hidden=false}

