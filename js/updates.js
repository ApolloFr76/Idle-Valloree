/* Notes de mise à jour accessibles depuis le bouton parchemin. */
const UPDATE_LOGS=[
  {date:"20 novembre 2026",title:"Panoplies de classe, pixel art évolutif et garde-robe",items:[
    "Refonte des panoplies dans les 12 zones : chaque monde propose désormais 8 panoplies de classe complètes (8 pièces) et 1 panoplie de boss universelle (4 pièces). Combiner 4 pièces de votre classe et 4 pièces du boss forme le meilleur équipement de la zone.",
    "Bonus de classe à 4 pièces : toutes les panoplies restent équipables par n'importe quelle classe, mais leur bonus signature de 4 pièces ne s'active que si vous jouez la classe correspondante.",
    "Recettes de zone repensées : chaque monstre de la zone fournit le matériau principal d'une classe, complété par de petites quantités d'autres créatures et ressources de métiers. Les anciens équipements des sauvegardes existantes sont automatiquement convertis.",
    "Pixel art unique et évolutif : chaque classe et chaque boss possède son propre style d'armes, coiffes, capes, boucliers et accessoires (hache viking et casque à cornes du Berserker, robe à capuche et bâton d'âme de l'Invocateur, etc.), de plus en plus imposants jusqu'aux auras animées du Néant au niveau 1000.",
    "Apparence dynamique et Garde-robe : votre personnage affiche désormais en direct les 6 pièces visibles équipées (coiffe, cape, arme, bouclier, ceinture, bottes). Chaque pièce obtenue débloque définitivement son apparence (conservée après Oméga) pour personnaliser votre style depuis l'Inventaire.",
    "Apparence de départ modeste : sans équipement, chaque classe commence désormais avec une tenue usée et des armes de fortune (cuir abîmé pour l'Invocateur, tuniques rapiécées, tête nue, hache en pierre pour le Berserker, épée rouillée, bouclier en planches…) afin de mettre pleinement en valeur vos armures forgées."
  ]},
  {date:"19 novembre 2026",title:"Stockage AFK, équilibrage et sécurité",items:[
    "Stockage illimité en ligne : la capacité de stockage correspond désormais au nombre maximal de secondes où le jeu farm en AFK.",
    "Caractéristiques secondaires (Sagesse, Agilité, Terre) : retrait du plafond fixe, remplacé par une courbe à rendement décroissant asymptotique vers 90 % (60 % atteint à 8 000 points).",
    "Compagnons : croissance du coût réduite (×1,10 par niveau au lieu de ×1,15), dégâts doublés tous les 25 niveaux et triplés tous les multiples de 100.",
    "Arbre Oméga : le nœud « Double récolte » (+50 %) s'applique aussi aux ouvriers (en ligne et hors ligne) ; « Grand atelier » affiche directement les quantités réduites dans l'Atelier et les info-bulles.",
    "Tour automatique (Grimpeur) : se désactive automatiquement en cas de défaite ou d'abandon ; Colporteur vend périodiquement le surplus au-dessus du seuil gardé.",
    "Comptes et sauvegardes : code de secours à noter pour réinitialiser son mot de passe, signature d'intégrité des exports (V2) et protection serveur du classement.",
    "Création de personnage : le paysage animé de la Prairie s'affiche désormais en arrière-plan dès le choix de votre classe."
  ]},
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
