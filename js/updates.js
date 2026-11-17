/* Notes de mise à jour accessibles depuis le bouton parchemin. */
const UPDATE_LOGS=[
  {date:"17 novembre 2026",title:"Nouvelle interface",items:[
    "Le monde occupe tout l'écran : les onglets sont à droite et s'ouvrent dans un panneau.",
    "Inventaire : la fiche de l'objet et le bouton « Équiper » s'affichent juste sous le sac.",
    "Journal et objectifs repliables ; dans Métiers, la récolte passe avant le chantier.",
    "Quêtes : récompenses et XP calées sur environ 50 monstres de leur zone.",
    "L’or des monstres suit désormais davantage leur difficulté et leur niveau.",
    "Le poids du sac ne limite plus que les gains hors ligne ; les ouvriers donnent de l'XP de métier.",
    "Clics manuels limités à 20 par seconde."
  ]},
  {date:"16 novembre 2026",title:"Rééquilibrage",items:[
    "Les zones s'étendent jusqu'au niveau 1000 et le niveau maximum est supprimé.",
    "Battez le boss d'une zone pour débloquer la suivante.",
    "Les monstres apparaissent autour de votre niveau ; l'XP de récolte est revue."
  ]},
  {date:"14 novembre 2026",title:"Tous les mondes",items:[
    "Les 12 mondes ont maintenant leur propre décor.",
    "Nouveau style pour le héros."
  ]},
  {date:"13 novembre 2026",title:"Grande mise à jour",items:[
    "3 nouvelles classes : Chronomancien, Berserker et Invocateur (le Médecin de la peste devient Druide).",
    "5 nouveaux monstres par zone, avec leurs panoplies de 2 à 6 pièces.",
    "Le combat se joue dans le paysage, avec la météo sur tout le décor.",
    "Super critiques au-delà de 100 % de critique ; grands nombres abrégés (k, M, B…).",
    "Familiers et montures visibles en combat ; élément et faiblesses des ennemis au survol."
  ]},
  {date:"12 novembre 2026",title:"Lancement",items:[
    "Première version de Vallorée.",
    "Métiers bien plus rapides à monter, forge plus fluide."
  ]}
];

/* pastille « non lu » : la dernière note lue est retenue dans le navigateur */
const UPD_KEY="vallore-maj-lue",updId=u=>u.date+"|"+u.title;
function updSync(){let seen=null;try{seen=localStorage.getItem(UPD_KEY)}catch(e){}const d=$("updatesDot");if(d)d.hidden=seen===updId(UPDATE_LOGS[0])}
function showUpdates(){
  try{localStorage.setItem(UPD_KEY,updId(UPDATE_LOGS[0]))}catch(e){}updSync();
  const o=$("ov");o.hidden=false;
  o.innerHTML=`<div class="ovc updatesPanel" role="dialog" aria-labelledby="updatesTitle">
    <div class="updatesHead"><div><h2 id="updatesTitle">Notes de mise à jour</h2><p class="muted">Les dernières évolutions de Vallorée.</p></div><button class="btn" data-a="closeOv" aria-label="Fermer">✕</button></div>
    <div class="updatesList">${UPDATE_LOGS.map(u=>`<article class="updateEntry"><div class="updateMeta"><b>${u.title}</b><span class="small muted">${u.date}</span></div><ul>${u.items.map(item=>`<li>${item}</li>`).join("")}</ul></article>`).join("")}</div>
  </div>`;
}

$("updatesIcon").innerHTML=glyph("parchemin");updSync();
