/* Onglets verrouillés, piles du sac et panneau « Prochains objectifs ». */
/* ================= Onglets verrouillés ================= */
const TAB_LOCK={atelier:3,metiers:4,aventure:6,allies:8,shop:10,quests:12,market:15,coll:18,prest:PREST_LVL};
const UNL_TXT={atelier:"Fabriquez les pièces de panoplie avec le butin des monstres, et tentez la forge pour une meilleure rareté.",metiers:"Bûcheron, Mineur, Paysan et Herboriste récoltent pendant que vous combattez, et même quand le jeu est fermé.",
  aventure:"Boss de zone avec chrono, donjons et tour infinie. La barre au-dessus de l'arène affiche aussi votre progression vers le boss.",allies:"Recrutez des compagnons qui frappent tout seuls. Leurs dégâts augmentent de 50 % tous les 25 niveaux.",
  shop:"Des améliorations définitives payées en écus : clic plus fort, clic automatique, sac agrandi, outils…",quests:"Trois quêtes par jour, avec écus et XP. Terminez les trois pour un éclat d'âme.",
  market:"Les prix des ressources changent chaque minute. Vendez au bon moment !",coll:"Vos succès (chacun +1 % de dégâts et d'écus) et le bestiaire, avec les taux de drop à découvrir.",
  prest:"Oméga : renaissez contre des éclats d'âme et débloquez des talents permanents."};
const UNL_DETAIL={
  atelier:"Chaque monstre a sa panoplie. Ouvrez une panoplie pour voir ses pièces et leur recette. Le « ! » signale ce que vous pouvez fabriquer. À la forge, frappez trois fois au bon moment : plus votre score est haut, plus la rareté est belle (jusqu'à Légendaire, +60 % de statistiques).",
  metiers:"Choisissez une ressource à récolter : la récolte tourne pendant les combats et même jeu fermé. Chaque métier monte en niveau et débloque de nouvelles ressources, indispensables aux recettes de l'atelier.",
  aventure:"Battez 10 monstres d'une zone pour défier son boss avant la fin du chrono. Le boss lâche une clé de donjon : 4 vagues puis le boss, avec un gros coffre. La tour infinie donne +0,5 % de dégâts pour toujours à chaque étage record.",
  allies:"Les compagnons frappent tout seuls, même pendant les boss et les donjons. Chaque niveau coûte un peu plus cher, et leurs dégâts augmentent de 50 % tous les 25 niveaux. Le bouton « Max » achète autant de niveaux que possible.",
  shop:"Des achats définitifs : clic plus fort, clic automatique, sac plus grand, outils plus rapides, compagnons renforcés… Ils sont perdus à la renaissance Oméga, mais les premiers sont vite rentabilisés.",
  quests:"Trois quêtes par jour, renouvelées chaque matin. Récupérez la récompense quand une quête est terminée. Les trois quêtes réussies donnent en plus un éclat d'âme. Vous pouvez changer une quête par jour.",
  market:"Chaque ressource a un cours qui varie toutes les minutes entre ×0,5 et ×2. Vendez quand le cours est haut (en vert). Vendre beaucoup d'un coup fait baisser le cours de cette ressource.",
  coll:"Les succès donnent chacun +1 % de dégâts et d'écus pour toujours. Le bestiaire liste toutes les créatures, leurs paliers de victoires (bonus de dégâts et de butin) et leurs taux de drop, en « ??? » tant que vous n'avez pas obtenu l'objet.",
  prest:"Oméga vous fait renaître au niveau 1 contre des éclats d'âme. Vous perdez votre niveau, vos objets et vos écus, mais gardez talents, succès et bestiaire. La tour repart de zéro. Les éclats s'investissent dans l'arbre de talents. Une fois tous les talents au rang 5, chaque éclat non dépensé donne +0,5 % de dégâts. Chaque Oméga donne aussi +10 % d'XP, +10 % d'écus et relève le niveau maximum."};
const unlTour=t=>[{sel:`[data-a="tab"][data-t="${t}"]`,t:`Nouvel onglet : ${tabName(t)}`,d:UNL_TXT[t]},{tab:t,sel:"#panel",t:tabName(t),d:UNL_DETAIL[t]}];
const tabOpen=t=>!TAB_LOCK[t]||!!(S&&S.unl&&S.unl[t]);
const tabName=t=>(TABS.find(x=>x[0]===t)||[t,t])[1];
function checkUnlocks(silent){if(!S||!S.cls)return;S.unl=S.unl||{};for(const t in TAB_LOCK){if(!S.unl[t]&&(S.lvl>=TAB_LOCK[t]||t==="prest"&&S.prest>0)){S.unl[t]=1;dirty=true;
  if(!silent){log(`Nouvel onglet débloqué : <b>${tabName(t)}</b> !`,"g");sfx("level");if(S.opt.tips){unlQ.push(t)}else toast(`Nouvel onglet : ${tabName(t)}`,1)}}}
  if(!tabOpen(S.tab))S.tab="perso"}
const LOCK_SVG=`<svg class="lksvg" viewBox="0 0 64 24" shape-rendering="crispEdges" aria-hidden="true"><g fill="none" stroke="#2a1712" stroke-width="3"><path d="M0 2h6v4H0zM9 6h6v4H9zM18 10h6v4h-6zM40 10h6v4h-6zM49 6h6v4h-6zM58 2h6v4h-6zM0 22h6v-4H0zM9 18h6v-4H9zM49 18h6v-4h-6zM58 22h6v-4h-6z"/></g><g fill="none" stroke="#a8a8b0" stroke-width="1.5"><path d="M0 2h6v4H0zM9 6h6v4H9zM18 10h6v4h-6zM40 10h6v4h-6zM49 6h6v4h-6zM58 2h6v4h-6zM0 22h6v-4H0zM9 18h6v-4H9zM49 18h6v-4h-6zM58 22h6v-4h-6z"/></g><path d="M27 3h10v2h2v6h-3V6h-8v5h-3V5h2z" fill="#2a1712"/><path d="M28 4h8v1h1v6h-1V5h-8v6h-1V5h1z" fill="#c9c9d1"/><path d="M24 10h16v13H24z" fill="#2a1712"/><path d="M25 11h14v11H25z" fill="#f0b22c"/><path d="M25 11h14v2H25z" fill="#ffe08a"/><path d="M31 14h2v5h-2z" fill="#2a1712"/></svg>`;

let ptrDown=false,lastSel={v:null,t:0};
document.addEventListener("pointerdown",()=>{ptrDown=true},true);
addEventListener("pointerup",()=>{setTimeout(()=>{ptrDown=false},0)},true);
addEventListener("pointercancel",()=>{ptrDown=false},true);
/* Les objets identiques (même objet, même rareté, même enchantement) s'empilent dans le sac */
const stackKey=i=>i.id+"|"+(i.e||0)+"|"+(i.r||0);
function nextInStack(key){const eq=new Set(Object.values(S.equip)),n=S.items.find(x=>!eq.has(x.u)&&stackKey(x)===key);selInv=n?"u:"+n.u:null}
/* ================= Prochains objectifs (panneau toujours visible) ================= */
function nextGoals(){const G=[],lp=n=>Math.min(1,(S.lvl-1+S.xp/xpNeed(S.lvl))/Math.max(1,n-1)),C=CLASSES[S.cls];
  const lt=Object.keys(TAB_LOCK).filter(t=>!tabOpen(t)).sort((a,b)=>TAB_LOCK[a]-TAB_LOCK[b])[0];
  if(lt)G.push({ic:"lock",t:`Onglet ${tabName(lt)}`,s:`niveau ${TAB_LOCK[lt]}`,p:lp(TAB_LOCK[lt]),tip:"lk:"+lt});
  const sp=C.spells.find(x=>x.lvl>S.lvl);if(sp)G.push({ic:"sp",t:`Sort : ${sp.name}`,s:`niveau ${sp.lvl}`,p:lp(sp.lvl)});
  const z=ZONES.find(x=>x.lvl[0]>S.lvl);if(z)G.push({ic:"zone",t:z.name,s:`niveau ${z.lvl[0]}`,p:lp(z.lvl[0]),tip:"z:"+z.i});
  if(tabOpen("aventure")&&S.mode==="zone"){const k=S.zk[S.zone]||0;G.push({ic:"boss",act:k>=BOSS_KILLS?`data-a="mode" data-m="boss">Défier`:"",t:k>=BOSS_KILLS?`Boss prêt : ${MON["boss_"+S.zone].name}`:`Boss : ${MON["boss_"+S.zone].name}`,s:k>=BOSS_KILLS?"touche B":`${k}/${BOSS_KILLS} monstres`,p:k/BOSS_KILLS,ready:k>=BOSS_KILLS,tip:"b:"+S.zone})}
  if(tabOpen("shop")){const u=UPGS.filter(x=>!up(x[0])).sort((a,b)=>a[3]-b[3])[0];if(u)G.push({ic:"shop",act:`data-a="buy" data-u="${u[0]}">Acheter`,t:u[1],s:S.ecus>=u[3]?"à acheter !":`${fmt(u[3]-S.ecus)} écus`,p:S.ecus/u[3],ready:S.ecus>=u[3],tip:"up:"+u[0]})}
  if(tabOpen("allies")){let bi=-1,bc=Infinity;ALLIES.forEach((a,i)=>{const l=S.allies[a[0]]||0;if(i>0&&!(S.allies[ALLIES[i-1][0]]>0)&&!l)return;const c=allyCost(i,l);if(c<bc){bc=c;bi=i}});
    if(bi>=0)G.push({ic:"ally",act:`data-a="ally" data-i="${bi}" data-n="1">Recruter`,t:`${ALLIES[bi][1]} niv. ${(S.allies[ALLIES[bi][0]]||0)+1}`,s:S.ecus>=bc?"à recruter !":`${fmt(bc-S.ecus)} écus`,p:S.ecus/bc,ready:S.ecus>=bc,tip:"al:"+bi})}
  if(S.pts>0)G.push({ic:"pts",act:`data-a="tab" data-t="perso">Répartir`,t:`${S.pts} point${S.pts>1?"s":""} à répartir`,s:"Personnage",p:1,ready:true});
  if(tabOpen("atelier")){const it=Object.values(ITEMS).filter(i=>i.set&&S.lvl>=i.lvl&&!S.items.some(x=>x.id===i.id)).map(i=>({i,r:i.recipe.reduce((a,[x,q])=>a+Math.min(1,(S.res[x]||0)/q),0)/i.recipe.length})).sort((a,b)=>b.r-a.r)[0];
    if(it)G.push({ic:"craft",act:`data-a="craft" data-i="${it.i.id}">Forger`,t:it.i.name,s:it.r>=1?"à fabriquer !":`${Math.floor(it.r*100)} % des ressources`,p:it.r,ready:it.r>=1,tip:"i:"+it.i.id})}
  {const a=ACH.filter(a=>!S.ach[a.id]).map(a=>({a,p:Math.min(1,a.get()/a.v)})).sort((x,y)=>y.p-x.p)[0];if(a)G.push({ic:"ach",svg:achIcon(achKey(a.a)),t:`Succès : ${a.a.n}`,s:`${fmt(Math.min(a.a.v,a.a.get()))} / ${fmt(a.a.v)}`,p:a.p*.98,tip:"ach:"+a.a.id})}
  if(soulsGain()>0&&tabOpen("prest"))G.push({ic:"omega",act:`data-a="tab" data-t="prest">Ouvrir`,t:"Oméga disponible",s:`+${soulsGain()} éclats`,p:1,ready:true});
  else if(S.lvl<PREST_LVL&&S.lvl>=20)G.push({ic:"omega",t:"Oméga (renaissance)",s:`niveau ${PREST_LVL}`,p:lp(PREST_LVL)});
  return G.sort((a,b)=>(b.ready?2:0)+b.p-((a.ready?2:0)+a.p)).slice(0,S.opt.goalsN||4)}
const GIC={lock:"🔒",sp:"✦",zone:"⛰",boss:"♛",shop:"⚒",ally:"⚑",pts:"+",craft:"⚙",omega:"Ω"};
let goalSig="";
function drawGoals(){const g=$("goals");if(!g)return;if(!S.opt.goals){if(goalSig!=="off"){goalSig="off";g.innerHTML=""}return}
  const L=nextGoals(),sig=(S.opt.goalsOpen?1:0)+L.map(x=>x.t+x.s+(x.ready?1:0)).join("|");
  if(sig!==goalSig){goalSig=sig;g.innerHTML=`<button class="ghead" data-a="goalsToggle" aria-expanded="${!!S.opt.goalsOpen}"><b>Prochains objectifs</b><span class="pchev">${S.opt.goalsOpen?"▲":"▼"}</span></button>${S.opt.goalsOpen?L.map((x,i)=>`<div class="grow${x.ready?" rdy":""}"${x.tip?` data-tip="${x.tip}"`:""}><span class="gic">${x.svg||GIC[x.ic]}</span><div class="gtx"><b>${x.t}</b><span>${x.s}</span><div class="bar"><i id="gb${i}"></i></div></div>${x.ready&&x.act?`<button class="btn pri gact" ${x.act}</button>`:""}</div>`).join("")||`<div class="small muted">Rien en vue pour l'instant.</div>`:""}`}
  if(S.opt.goalsOpen)L.forEach((x,i)=>{const b=$("gb"+i);if(b)b.style.width=Math.min(100,x.p*100)+"%"})}

