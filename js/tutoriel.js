/* Onboarding : visite guidée et explications de déblocage. */
/* ================= Onboarding ================= */
const TUTO=[
  {sel:null,t:"Bienvenue dans les Terres de Vallorée !",d:"Un jeu de grind où votre héros combat tout seul, même quand vous ne faites rien. Votre but : devenir de plus en plus fort, découvrir toutes les zones, fabriquer les meilleures panoplies et vaincre les boss. Cette visite vous présente l'écran en quelques étapes."},
  {sel:"#arena",t:"L'arène",d:"Votre héros affronte un monstre à la fois. Quand il est vaincu, vous gagnez de l'XP, des écus et parfois du butin, puis un autre arrive."},
  {sel:"#monBtn",t:"Cliquez pour frapper",d:"Cliquez sur le monstre (ou appuyez sur Espace) pour ajouter vos coups à ceux de votre héros. Cliquer vite fait monter un combo qui augmente vos dégâts. Passez la souris sur le monstre pour voir ses PV, son élément et son butin."},
  {sel:".bars",t:"Les points de vie",d:"La barre orange est celle du monstre, la rouge la vôtre. Si vous tombez à 0, vous êtes K.O. 5 secondes. Vos PV remontent tout seuls entre les coups."},
  {sel:"#buffs",t:"Votre élément",d:"Feu, Eau, Terre ou Air : chaque monstre est faible à un élément et en résiste à d'autres. Le badge vous dit si votre élément est efficace contre le monstre actuel."},
  {sel:"#spells",t:"Vos sorts",d:"Lancez-les d'un clic ou avec les touches 1, 2 et 3. Cochez « Lancer automatiquement » pour qu'ils partent seuls. Deux autres sorts se débloquent aux niveaux 10 et 25."},
  {sel:"#goals",t:"Prochains objectifs",d:"Ce panneau, toujours visible, montre ce qui vous attend : prochain onglet, prochain sort, prochaine zone, achats et fabrications. Ce qui est faisable tout de suite passe en tête, en doré."},
  {sel:"#zones",t:"Les zones",d:"Chaque zone a ses monstres, son butin, son boss et sa panoplie. Les suivantes se débloquent avec votre niveau. Le décor et l'ambiance changent avec le biome."},
  {sel:".xpbox",t:"Niveau et expérience",d:"Chaque niveau donne 5 points de caractéristiques et débloque peu à peu de nouveaux onglets."},
  {sel:'.tab.locked',t:"Des onglets à débloquer",d:"Les onglets avec un cadenas et des chaînes sont encore verrouillés. Ils s'ouvrent en montant de niveau, et une explication vous présentera chacun au moment où il se déverrouille."},
  {sel:'[data-a="tab"][data-t="perso"]',tab:"perso",t:"Votre personnage",d:"Répartissez ici vos points : en Feu, Eau, Terre ou Air pour choisir votre élément, ou en Vitalité, Sagesse et Agilité. Tous les 5 points, une caractéristique donne en plus un bonus secondaire."},
  {sel:'[data-a="tab"][data-t="inv"]',tab:"inv",t:"L'inventaire",d:"À gauche votre équipement, à droite votre sac. Glissez un objet sur un emplacement ou double-cliquez dessus pour l'équiper. Passez la souris sur un objet pour voir son détail et la comparaison avec ce que vous portez."},
  {sel:"#pauseBtn",t:"Pause",d:"Mettez le jeu en pause à tout moment (touche P). Sinon, le combat et la récolte continuent, même jeu fermé, jusqu'à 8 h."},
  {sel:'[data-a="tab"][data-t="opts"]',tab:"opts",t:"Options et aide",d:"Son, affichage, raccourcis clavier, sauvegarde… L'onglet « Aide » des options permet de revoir cette visite et l'explication de chaque onglet. Bonne aventure !"},
];
const TIPS=[
  {id:"pts",c:()=>S.pts>0&&S.lvl>=2,t:"Points de caractéristiques",d:"Vous avez des points à répartir. Choisissez un élément pour faire plus de dégâts aux monstres qui y sont faibles.",tab:"perso"},
  {id:"pickup",c:()=>!!S.pk,t:"Un objet brillant !",d:"Un objet cliquable vient d'apparaître dans l'arène. Attrapez-le vite (touche E) : écus, XP ou bonus temporaire."},
  {id:"craft",c:()=>Object.values(ITEMS).some(i=>i.set&&canCraft(i)),t:"Première fabrication possible",d:"Vous avez assez de butin pour fabriquer une pièce d'équipement. Le « ! » vous indique laquelle.",tab:"atelier"},
  {id:"allies",c:()=>S.ecus>=50,t:"Compagnons",d:"Vous pouvez recruter votre premier compagnon. Il frappe tout seul, même quand vous n'êtes pas là.",tab:"allies"},
  {id:"quests",c:()=>S.lvl>=3,t:"Quêtes du jour",d:"Trois quêtes chaque jour, avec écus et XP à la clé. Terminez les trois pour gagner un éclat d'âme.",tab:"quests"},
  {id:"herbo",c:()=>S.lvl>=5,t:"Alchimie",d:"Le métier d'Herboriste permet de cueillir des herbes pour préparer des potions de soin et de bonus à l'Atelier.",tab:"metiers"},
  {id:"boss",c:()=>(S.zk[S.zone]||0)>=BOSS_KILLS,t:"Un boss vous attend",d:"Vous avez battu assez de monstres : défiez le boss de la zone avant la fin du chrono (touche B). Il lâche la clé du donjon.",tab:"aventure"},
  {id:"shop",c:()=>S.ecus>=300,t:"Boutique",d:"Vos premiers achats définitifs sont abordables : gants renforcés, clic automatique, sac agrandi…",tab:"shop"},
  {id:"combo",c:()=>S.combo>=10,t:"Combo !",d:"Cliquer vite fait monter le combo, qui augmente vos dégâts. Il retombe si vous arrêtez de cliquer."},
  {id:"market",c:()=>Object.keys(S.res).filter(k=>S.res[k]>0).length>=4,t:"Le marché",d:"Les prix changent chaque minute, entre ×0,5 et ×2. Vendez quand le cours est haut !",tab:"market"},
  {id:"spell2",c:()=>S.lvl>=10,t:"Nouveau sort",d:"Votre deuxième sort est débloqué. Passez la souris dessus pour voir ses effets."},
  {id:"zone2",c:()=>S.lvl>=ZONES[1].lvl[0],t:"Nouvelle zone",d:"Une nouvelle zone est accessible, avec d'autres monstres, d'autres éléments et de meilleures panoplies."},
  {id:"key",c:()=>Object.keys(S.res).some(k=>k.startsWith("cle_")&&S.res[k]>0),t:"Donjon débloqué",d:"Vous avez une clé ! Le donjon enchaîne 4 vagues puis le boss, avec un gros coffre à la fin. Attention : un K.O. fait perdre la clé.",tab:"aventure"},
  {id:"rare",c:()=>Object.values(LOOT).some(L=>L.some(l=>l.p<.06&&!l.item&&seen(l.id))),t:"Butin rare",d:"Vous avez trouvé un objet rare ! Les objets jamais obtenus apparaissent en « ??? » avec leur taux de drop dans le bestiaire.",tab:"coll"},
  {id:"ach",c:()=>achN()>=1,t:"Succès",d:"Chaque succès donne +1 % de dégâts et d'écus pour toujours. Consultez-les dans la Collection.",tab:"coll"},
  {id:"event",c:()=>!!S.ev,t:"Événement météo",d:"Pendant 2 minutes, un événement change les règles : bonus d'élément, écus doublés, butin doublé…"},
  {id:"bag",c:()=>bagWeight()>bagCap()*.8,t:"Sac presque plein",d:"Vendez des ressources à l'Inventaire ou au Marché, sinon vous ne ramasserez plus rien. Une option permet la vente automatique.",tab:"inv"},
  {id:"tower",c:()=>S.lvl>=15,t:"La tour infinie",d:"Chaque étage record donne des dégâts jusqu'au prochain Oméga. Les monstres prennent environ 2 niveaux par étage : montez le plus haut possible !",tab:"aventure"},
  {id:"prest",c:()=>S.lvl>=PREST_LVL,t:"Oméga : la renaissance",d:"Vous pouvez renaître contre des éclats d'âme, qui débloquent des talents permanents. Vous repartez au niveau 1, mais bien plus fort.",tab:"prest"},
];
let tutoI=-1,tipQ=[],tipShown=null,TSTEPS=TUTO,tutoKind="main",unlQ=[];
function tutoRun(steps,kind){TSTEPS=steps;tutoKind=kind;tutoI=0;paused=true;$("tuto").hidden=false;tutoDraw()}
function tutoStart(){tutoRun(TUTO,"main")}
function tutoEnd(){const k=tutoKind;tutoI=-1;$("tuto").hidden=true;paused=false;if(k==="main"){S.tutoDone=1;S.tab="perso"}renderPanel();save();setTimeout(checkTips,500)}
function tutoDraw(){const TU=TSTEPS,st=TU[tutoI];if(!st){tutoEnd();return}if(st.tab&&S.tab!==st.tab){S.tab=st.tab;renderPanel()}
  const el=st.sel?document.querySelector(st.sel):null;if(el)el.scrollIntoView({block:"center",behavior:"instant"});
  requestAnimationFrame(()=>{const r=el?el.getBoundingClientRect():{left:innerWidth/2,top:innerHeight/2,right:innerWidth/2,bottom:innerHeight/2,width:0,height:0},sp=$("tspot"),b=$("tbub"),pad=el?6:0;b.classList.toggle("center",!el);sp.classList.toggle("none",!el);
    sp.style.left=(r.left-pad)+"px";sp.style.top=(r.top-pad)+"px";sp.style.width=(r.width+pad*2)+"px";sp.style.height=(r.height+pad*2)+"px";
    b.innerHTML=`<div class="tdots">${TU.map((_,i)=>`<i class="${i<tutoI?"done":i===tutoI?"on":""}"></i>`).join("")}</div><span class="tstep">${tutoKind==="main"?"Visite guidée":"Nouveauté"} · ${tutoI+1} / ${TU.length}</span><h3>${st.t}</h3><p>${st.d}</p><div class="row"><button class="btn" data-a="tutoSkip">${tutoKind==="main"?"Passer la visite":"Fermer"}</button><span class="row" style="gap:6px">${tutoI?`<button class="btn" data-a="tutoPrev">Retour</button>`:""}<button class="btn pri" data-a="tutoNext">${tutoI<TU.length-1?"Suivant":tutoKind==="main"?"C'est parti !":"Compris !"}</button></span></div>`;
    const bh=b.offsetHeight,bw=b.offsetWidth;let top=el?r.bottom+14:(innerHeight-bh)/2;if(top+bh>innerHeight-10)top=r.top-bh-14;if(top<10)top=Math.max(10,innerHeight-bh-10);
    let left=el?Math.min(Math.max(10,r.left+r.width/2-bw/2),innerWidth-bw-10):(innerWidth-bw)/2;b.style.top=top+"px";b.style.left=left+"px";const n=b.querySelector('[data-a="tutoNext"]');if(n)n.focus()})}
addEventListener("resize",()=>{if(tutoI>=0)tutoDraw()});
function checkTips(){if(!S||!S.cls||!S.opt.tips||tutoI>=0)return;S.tips=S.tips||{};
  if(unlQ.length&&$("ov").hidden&&!forge&&!DRAG.on){if(tipShown){tipShown=null;$("tipcard").hidden=true}tutoRun(unlTour(unlQ.shift()),"unl");return}
  TIPS.forEach(t=>{if(t.tab&&!tabOpen(t.tab))return;if(!S.tips[t.id]&&!tipQ.includes(t)&&tipShown!==t&&t.c()){tipQ.push(t)}});
  if(!tipShown&&tipQ.length&&$("ov").hidden)showTip(tipQ.shift())}
function showTip(t){tipShown=t;S.tips[t.id]=1;const c=$("tipcard");c.innerHTML=`<span class="nb">Nouveau !</span><h4>${t.t}</h4><p>${t.d}</p><div class="row" style="justify-content:flex-end;gap:6px">${t.tab?`<button class="btn" data-a="tipGo">Voir</button>`:""}<button class="btn pri" data-a="tipOk">Compris</button></div>${tipQ.length?`<span class="tq">${tipQ.length} autre${tipQ.length>1?"s":""} conseil${tipQ.length>1?"s":""} à suivre</span>`:""}`;c.hidden=false;c.style.animation="none";void c.offsetWidth;c.style.animation=""}
function closeTip(){tipShown=null;$("tipcard").hidden=true;setTimeout(checkTips,600)}

