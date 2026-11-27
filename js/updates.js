/* Notes de mise à jour accessibles depuis le bouton parchemin. */
const UPDATE_LOGS=[
  {date:"27 novembre 2026",title:"Icônes complètes et outils au juste prix",items:[
    "Icônes : les objets, ressources, plantes, poissons et clés qui dépassaient encore de leur case sont maintenant entiers, contour compris (haches, boucliers, coiffes, capes, fleurs, grands poissons…).",
    "Ouvriers pêcheurs : le flotteur de la canne ne sort plus du cadre quand l'ouvrier lance sa ligne.",
    "Outils des ouvriers : le prix en écus suit maintenant vos gains. Il vaut ce que rapportent environ 15 monstres de votre niveau pour le premier outil, et environ 1 200 pour le dernier. Les outils ne sont donc plus hors de prix en début de partie, ni gratuits en fin de partie.",
    "Le coût en ressources (la ressource que l'ouvrier récolte déjà) ne change pas ; après un passage Oméga, les outils redeviennent moins chers avec votre niveau."]},
  {date:"27 novembre 2026",title:"Classement enrichi",items:[
    "Nouvelles catégories : écus gagnés, monstres vaincus, succès, niveaux de métiers et temps de jeu. La Puissance compte maintenant vos dégâts par seconde (critiques, doubles coups et effets compris) au lieu du coup de base. Un menu permet de n'afficher qu'une classe.",
    "Onglet « Cette semaine » : niveaux, étages de tour et monstres gagnés depuis lundi. Chaque lundi, le top 3 de chaque catégorie entre au palmarès et débloque le cadre Laurier ; une étoile à côté du pseudo compte ces places.",
    "Onglet « Palmarès et records » : les gagnants des semaines passées et les records du serveur, qui gardent le nom du premier joueur à atteindre le niveau 100, l'étage 50, un passage Oméga…",
    "Cliquez sur un joueur pour ouvrir sa fiche (toutes ses valeurs, ses records, sa dernière activité). Un point vert signale les joueurs actifs ces dernières 24 h, une flèche montre si vous avez gagné ou perdu des places depuis votre dernière visite, et l'écart avec le joueur juste au-dessus est indiqué."]},
  {date:"27 novembre 2026",title:"Outils des ouvriers à acheter",items:[
    "Chaque ouvrier a désormais son propre outil, à améliorer depuis sa fiche dans l'onglet Métiers : l'outil suivant coûte des écus et des unités de la ressource que l'ouvrier sait déjà récolter (par exemple du Frêne pour la Hache de Châtaignier). Il faut aussi avoir débloqué la ressource suivante dans le métier.",
    "L'outil décide où l'ouvrier peut travailler : il ne récolte que les ressources jusqu'au palier de son outil. Les ressources trop rares apparaissent grisées avec la mention « outil requis ».",
    "Chaque palier d'outil rend l'ouvrier 10 % plus rapide ; le gain est indiqué à côté de son temps de récolte.",
    "Classement : votre ligne ne se mettait plus à jour (niveau, éclats, tour et puissance figés) quand vos dégâts devenaient trop grands. Elle se met de nouveau à jour à chaque sauvegarde en ligne ; la Puissance affichée est plafonnée à 1 000 000 milliards. En cas d'échec, un message l'indique maintenant dans l'onglet.",
    "Les ouvriers déjà embauchés gardent un outil du palier de la ressource qu'ils récoltaient : rien ne s'arrête. Les nouveaux ouvriers commencent avec l'outil de base."]},
  {date:"24 novembre 2026",title:"Touches affichées sur les boutons, affichage plus net",items:[
    "Un raccourci pour chaque onglet : Compagnons G, Boutique U, Quêtes Q, Marché M, Oméga R, Collection L, Métiers T et Classement K, en plus de Personnage C, Inventaire I, Aventure V, Atelier F et Options O. Chaque touche est rappelée dans l'encoche de son onglet ; la liste complète est dans Options › Clavier.",
    "Raccourcis clavier visibles : les boutons qui ont une touche (sorts 1, 2, 3, potion S, Défier le boss B, Pause P, onglets C, I, V, F, O, Échap pour fermer ou abandonner) l'affichent dans une encoche sombre à gauche, qui s'enfonce quand on appuie. La touche Espace s'affiche sous le monstre et E sous l'objet à ramasser. Réglage dans Options › Clavier ; masqué sur écran tactile ou si les raccourcis sont désactivés.",
    "Icônes : les objets, ressources, outils, poissons, plantes et coffres ne sont plus coupés au bord de leur case (queues de poisson, manches d'armes, cornes, fleurs…).",
    "Compagnons : les boutons Recruter, +10 et Max passent sous le nom, qui reste lisible sur une seule ligne avec ses dégâts et son effet (Poison, Gelure…).",
    "Options : les intitulés comme « Thème des panneaux » ou « Format des nombres » ne passent plus sous les boutons ; ils se placent au-dessus quand la place manque.",
    "Collection : les monstres du bestiaire ne recouvrent plus leur nom.",
    "Métiers et Inventaire : les noms des métiers et les cases de trophées tiennent dans leur bouton, même sur petit écran."]},
  {date:"20 novembre 2026",title:"Panoplies de classe, pixel art évolutif et garde-robe",items:[
    "Refonte des panoplies dans les 12 zones : chaque monde propose désormais 8 panoplies de classe complètes (8 pièces) et 1 panoplie de boss universelle (4 pièces). Combiner 4 pièces de votre classe et 4 pièces du boss forme le meilleur équipement de la zone.",
    "Bonus de classe à 4 pièces : toutes les panoplies restent équipables par n'importe quelle classe, mais leur bonus signature de 4 pièces ne s'active que si vous jouez la classe correspondante.",
    "Recettes de zone repensées : chaque monstre de la zone fournit le matériau principal d'une classe, complété par de petites quantités d'autres créatures et ressources de métiers. Les anciens équipements des sauvegardes existantes sont automatiquement convertis.",
    "Pixel art unique et évolutif : chaque classe et chaque boss possède son propre style d'armes, coiffes, capes, boucliers et accessoires (hache viking et casque à cornes du Berserker, robe à capuche et bâton d'âme de l'Invocateur, etc.), de plus en plus imposants jusqu'aux auras animées du Néant au niveau 1000.",
    "Apparence dynamique et Garde-robe : votre personnage affiche désormais en direct les 6 pièces visibles équipées (coiffe, cape, arme, bouclier, ceinture, bottes). Chaque pièce obtenue débloque définitivement son apparence (conservée après Oméga) pour personnaliser votre style depuis l'Inventaire.",
    "Apparence de départ modeste : sans équipement, chaque classe commence désormais avec une tenue usée et des armes de fortune (cuir abîmé pour l'Invocateur, tuniques rapiécées, tête nue, hache en pierre pour le Berserker, épée rouillée, bouclier en planches…) afin de mettre pleinement en valeur vos armures forgées.",
    "Correction : l'achat d'un Sort automatique (ou d'une amélioration de recharge) en boutique remplace désormais immédiatement le texte « Auto : boutique » par la case Auto, sans avoir besoin de rafraîchir la page.",
    "Retour AFK moins intrusif : la fenêtre « Pendant votre absence » ne s'affiche désormais qu'après au moins 5 minutes d'absence (les gains d'un changement d'onglet plus court restent crédités silencieusement).",
    "Métiers et matériaux repensés : chacune des 60 ressources de métier dispose désormais de sa propre scène de récolte pixel art animée en accord avec sa zone (sable, glace, volcan, récif, ruines, abîme… avec aperçu au survol et présence de votre héros), ainsi que d'une icône pixel art à la silhouette unique.",
    "Refonte des icônes de butins : les 144 butins de monstres et de boss arborent désormais chacun un dessin pixel art soigné, distinct et fidèle à leur nom (rouage, sablier figé, pince nacrée, trèfle, champignon, fiole de venin, rune gravée, cœur de braise, flammèche, glaçon, éclat stellaire, etc.) au lieu de formes génériques répétées.",
    "PNJ ouvriers et outils de métier évolutifs : 10 apparences d'artisans uniques pour vos ouvriers (bonnet de bûcheron, chapeau de paille, bandana à lunettes, couronne de feuilles, béret, salopette, toque fourrée, ciré marin, casquette, capuche ; cliquables pour changer de style) équipés d'un outil propre à leur métier (hache, pioche, faux, faucille, canne à pêche) qui change automatiquement selon leur affectation et évolue visuellement avec la dernière ressource débloquée."
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
