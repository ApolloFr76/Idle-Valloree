# Analyse d'Idle Vallorée : icônes, incohérences et limites de l'incrémental

Analyse faite le 13/11/2026 sur le commit `6e982fa`, puis revue sur `f7950be` (même jour), sans rien modifier au jeu.

## Ce que change la mise à jour `f7950be`

- **Nouvelle classe, le Médecin de la peste** : il empoisonne à chaque coup, avec des dégâts directs faibles (×0,75) et
  des dégâts sur la durée (DoT) ×1,6. Ses sorts sont Fiole toxique, Miasme et Purge.
- **Quatre DoT élémentaires** : poison (Air), brûlure (Feu), gelure (Eau) et saignement (Terre). Les pièces de
  panoplie donnent la stat de DoT de leur élément.
- **Trois nouveaux compagnons**, soit 10 au total : Rat pestilent, Apothicaire Mortimer et Serpent d'émeraude. Sept
  compagnons posent aussi des charges de DoT (`ALLY_DOT`).
- **Mini-jeu de l'Herboriste** : il utilise maintenant 6 plantes de formes et de couleurs bien distinctes (`PX.plant`).
  Les cartes ne se confondent plus.
- **Personnage** : un champ « Points par clic » permet de répartir plusieurs points d'un coup.
- **Codes cadeaux** : le code source ne contient plus que leurs empreintes, et un nouveau code équipe un jeu complet
  légendaire +10 avec des trophées +100.

**Aucun des problèmes relevés ci-dessous n'est corrigé.** Les icônes d'objets, de butins et de clés n'ont pas
changé : 8 groupes identiques, comme avant. Les courbes de monstres, d'écus, d'Oméga et de boutique sont les mêmes.

Les icônes sont dessinées par le code (`js/pixel.js`), sans aucune image. Pour les comparer, les 464 icônes d'objets et de
ressources ont été générées dans node avec les fonctions du jeu, puis comparées pixel par pixel. Les chiffres de la
partie 3 sortent des formules de `js/donnees.js`, `js/calculs.js` et `js/combat.js`.

## 1. Icônes identiques ou presque

### 1.1 Identiques au pixel près (8 groupes)

| Icônes identiques | Pourquoi |
|---|---|
| Les 12 clés de donjon (`cle_0` à `cle_11`) | `PX.key()` ne prend aucun paramètre : même clé dorée partout |
| Touffe de laine = Pompon doux | Même monstre (même couleur), même forme « fluff » |
| Spore luisante = Chapeau tacheté | Même couleur, forme « feuille » |
| Pétale d'eau = Racine d'eau | Même couleur, forme « feuille » |
| Griffe usée = Museau rose | Même couleur, forme « croc » |
| Écaille rouillée = Boulon tordu | Même couleur, forme « gemme » par défaut |
| Sable chantant = Grain chantant | Même couleur, forme « poussière » |
| Cœur de givre = Pointe de glace | Même couleur, forme « gemme » par défaut |

La couleur d'un butin est celle du monstre qui le lâche (`dropCol`), et sa forme dépend de mots-clés dans son nom
(`dropKind`). Quand le butin principal (70 %) et le butin secondaire d'un même monstre tombent dans la même forme, leurs
icônes sont identiques : dans l'animation de butin, on ne voit pas lequel des deux on vient de ramasser.

### 1.2 Quasi identiques (même forme, couleurs presque égales)

- **Toutes les amulettes et tous les anneaux.** Dans `PX.item`, seul un carré de 3×3 à 4×4 pixels prend la couleur
  du monstre ; le reste est doré. Les 24 amulettes et les 24 anneaux se ressemblent tous, toutes zones confondues :
  plus de 300 paires à moins de 2 % d'écart de couleur.
- **Rocailleux et Gargouillon** (`#8f8a9c` contre `#8a8a9e`) : coiffe, cape, bottes et ceinture indiscernables.
- **Panoplies de boss proches de celle du monstre de base** : Pompon laineux / Roi Pompon, Yétinou / Yéti Ancien,
  Rouillard / Golem de Cuivre. Leurs armes, amulettes, anneaux et boucliers se confondent.
- **Écorcin / Vasard, Picoreau / Foudrillon, Rouillard / Macaquin** : toutes les pièces sont très proches.
- **Ressources de métier** : Argent / Platine, Orchidée / Lotus, Orge / Épeautre, Cuivre / Bauxite, Fer / Zinc,
  Blé / Maïs.
- **Galet d'orage / Pierre de lune** : deux gemmes grises.

### 1.3 La forme « gemme » sert de forme par défaut

`dropKind` classe en « gemme » tout butin dont le nom ne contient aucun mot-clé connu, ce qui fait 30 butins sur 84.
La même silhouette sert donc à des objets qui n'ont rien à voir :

Éclat de géode, Écaille rouillée, Élytre irisé, Cœur de givre, Galet d'orage, Scorie brûlante, Pierre de lune,
Écaille du néant, Cœur de nuage, Lanterne vivante, Perle de marais, Fossile visqueux, Pépite brute, Géode parfaite,
Boulon tordu, Rouage antique, Scarabée d'or, Sablier figé, Reflet captif, Cristal d'avalanche, Pointe de glace,
Cœur polaire, Œil de tempête, Perle de la Reine, Rouage de cuivre, Carapace solaire, Nacre royale, Cœur de braise,
Éclat stellaire, Fragment du vide.

D'autres classements sont discutables : « Rune ardente » et « Langue collante » sont dessinées comme des crocs,
« Voile spectral » et « Flocon de nuée » comme de la laine.

### 1.4 Autres problèmes d'icônes

- **Succès « Poissonnédia » sans icône** : la clé `peche` manque dans `AICO` (`js/donnees.js`), donc il affiche la
  tête de mort du succès « Chasseur ».
- **Icônes du journal mal choisies** (`logIcon` dans `js/vie.js`) : une montée de niveau affiche une amulette, un gain
  d'écus un anneau, un K.O. un bouclier, une victoire une arme.
- **Couleur manquante pour la Pêche** : `PCOL` n'a pas d'entrée `pecheur`, donc `resCol` renvoie `undefined` et les
  poissons s'affichent avec `--ic:undefined` dans l'Inventaire et au Marché.
- **Emplacement d'arme nommé « Bâton » pour toutes les classes** (`EQ.arme`), y compris le Guerrier et l'Archer.
- **Emojis dans le pixel art** : les objectifs (`GIC` dans `js/progression.js`) utilisent 🔒 ⛰ ♛ ⚒ ⚑ ⚙ au milieu
  d'icônes pixelisées.
- **Une seule icône pour toutes les potions** dans la barre de potions (`glyph("potion")`, seule la teinte change).
- **Stats de DoT sans icône propre** (depuis `f7950be`) : `sico` réutilise l'icône de l'élément, recolorée. Le
  Poison a l'icône de l'Air, la Brûlure celle du Feu, etc.

## 2. Autres problèmes de contenu et de cohérence

- **Les zones 7 à 12 n'ont aucun butin secondaire ni rare.** `LOOT_X` s'arrête au Blizzaron (zone 6) : 18 monstres
  sur 36 n'ont que leur butin principal et leur trophée, et la moitié du bestiaire est vide de ce côté.
- **La Pêche est oubliée à plusieurs endroits** :
  - le texte de déblocage de l'onglet Métiers cite « Bûcheron, Mineur, Paysan et Herboriste » ;
  - les quêtes de récolte tirent le métier avec `rnd(0,3)`, donc jamais le Pêcheur ;
  - le Baluchon tire avec `rnd(0,2)`, donc jamais l'Herboriste ni le Pêcheur.
- **La boutique se contredit.** L'onglet présente « des achats définitifs », alors que le texte de déblocage et l'écran
  Oméga disent qu'ils sont perdus à la renaissance.
- **L'aide de la tour est fausse.** Elle annonce « +0,5 % de dégâts pour toujours à chaque étage record », mais :
  - le bonus passe par `dimR` et diminue après l'étage 20 ;
  - la tour repart de zéro à chaque Oméga.

  | Record | Annoncé | Réel |
  |---|---|---|
  | 20 | +10 % | +10 % |
  | 50 | +25 % | +19,9 % |
  | 100 | +50 % | +27,9 % |
  | 500 | +250 % | +47,6 % |

- **README pas à jour** : il annonce « 4 classes » alors qu'il y en a 5 depuis le Médecin de la peste.

## 3. Pourquoi c'est un mauvais incrémental

### 3.1 Un mur de puissance exponentiel face à une progression polynomiale

| Niveau | PV d'un monstre | Écus par monstre | Budget de stats d'un objet | Monstres par niveau |
|---|---|---|---|---|
| 25 | 759 | 30 | 105 | 38 |
| 50 | 5 501 | 85 | 249 | 34 |
| 100 | 107 842 | 366 | 645 | 20 |
| 150 | 1 397 547 | 1 204 | 1 168 | 11 |
| 199 | 14 579 544 | 3 453 | 1 789 | 6 |

Entre les niveaux 25 et 199, les PV des monstres sont multipliés par 19 000 (`monPow` est exponentiel), alors que le
budget d'un objet ne l'est que par 17 et les écus par 115. Aucun multiplicateur du joueur ne suit cette courbe : le
blocage est inévitable. Les niveaux passent vite en fin de partie (6 monstres par niveau), mais chaque monstre est de
plus en plus long à tuer.

Les DoT ajoutés par `f7950be` n'y changent rien. Les dégâts d'une charge suivent le coup du héros
(`hit × 0,15 × (1 + √stat / 20)`) et 2 % des dégâts des compagnons. Avec toutes les charges au maximum, c'est au mieux
un facteur constant de plus, alors que les PV des monstres restent exponentiels.

### 3.2 Les compagnons ne servent plus à rien en fin de partie

Le coût d'un niveau augmente de 15 % (`allyCost`), soit ×33 tous les 25 niveaux, pour seulement ×1,5 de dégâts.

| Phénix | Coût | Dégâts/s |
|---|---|---|
| Niveau 10 | 6,1·10⁷ | 80 000 |
| Niveau 50 | 1,6·10¹⁰ | 900 000 |
| Niveau 100 | 1,8·10¹³ | 4 050 000 |

Face à des monstres à 14 M de PV qui rapportent 3 500 écus, c'est sans espoir. Les dégâts automatiques sont le cœur
d'un idle, et ils deviennent inutiles après la mi-partie.

Depuis `f7950be`, il y a 10 compagnons, mais les trois nouveaux s'insèrent entre les anciens en coût et en dégâts
(le Serpent coûte 5·10⁶) : le plafond reste le Phénix, et les chiffres ci-dessus sont inchangés. Les charges de DoT
des compagnons (`ALLY_DOT`) sont fixes, quel que soit le niveau. Un Rat pestilent niveau 1, recruté pour 1 500 écus,
pose autant de poison (1 charge/s) qu'un Rat niveau 200, donc monter ces compagnons n'améliore pas leurs DoT.

### 3.3 Tout est plafonné

- Niveau maximum 200, puis +50 par Oméga (+100 après le sixième).
- 15 améliorations de boutique à achat unique, environ 21 M d'écus au total, puis plus rien.
- 76 succès (+1 % chacun), 29 poissons (+1 % d'XP chacun), 12 zones, 16 talents.
- Plafonds des stats secondaires : Sagesse 30, Agilité 40, Terre 40 ; esquive 60 % ; intervalle d'attaque 0,3 s minimum.

### 3.4 L'Oméga rapporte peu et coûte tout

- **Gain** : +10 % d'XP et +10 % d'écus par passage, en additif (Ω10 = ×2 seulement), plus des éclats :

  | Oméga au niveau | Éclats |
  |---|---|
  | 30 | 6 |
  | 50 | 27 |
  | 100 | 99 |
  | 200 | 284 |

- **Perte** : niveau, écus, équipement, ressources, compagnons, boutique, niveaux de métier et tour.
- **Talents** : ceux sans plafond passent à un rendement logarithmique après le rang 10 (`dimR`), et leur coût
  augmente à chaque rang. Force brute donne +100 % pour 75 éclats cumulés, mais seulement +363 % pour 95 000 éclats.
- Le bonus des éclats non dépensés ne s'active qu'une fois les 16 talents au rang 5.

### 3.5 L'idle est bridé

- **Hors ligne** : 8 h maximum, 50 % d'efficacité, butin principal seulement, et zéro victoire si la zone est jugée
  dangereuse (`offline` dans `js/boucle.js`).
- **Sac à poids limité** : 1 000 + 100 × niveau, et chaque ressource pèse 1. Une fois plein, plus aucun butin ni
  récolte, sauf avec l'option de vente automatique.
- **Un seul métier à la fois.**
- **Contenu suspendu onglet caché** : les objets cliquables et les événements ne démarrent pas quand l'onglet est
  caché, et un objet cliquable ne reste que 13 s. Il faut rester devant l'écran.

### 3.6 Les boucles actives sont pénibles

- 10 victoires pour pouvoir défier un boss, compteur remis à zéro après chaque boss ; chrono de 30 s.
- Clé de donjon perdue en cas d'échec.
- 3 quêtes par jour.
- Échec d'enchantement : écus perdus, réussite qui descend jusqu'à 20 %, coût qui augmente au carré.
- Trophées à 1 % de chance.

### 3.7 Les écus n'ont presque plus d'utilité

Une fois la boutique vidée, il ne reste que les compagnons (inefficaces, voir 3.2) et l'enchantement. Le joueur
accumule une monnaie qui ne fait plus progresser.

## 4. Pistes, par ordre d'impact

1. **Compagnons** : coût en ×1,07 par niveau et multiplicateurs à paliers (×2 ou ×4 tous les 25 niveaux), plus des
   compagnons supplémentaires en fin de partie. Faire monter les charges de DoT des compagnons avec leur niveau.
2. **Oméga multiplicatif** (×1,5 ou plus par passage) qui garde une partie des métiers et de la boutique.
3. **Améliorations de boutique répétables** pour donner un usage durable aux écus.
4. **Sac** : supprimer le poids des ressources, ou le rendre très large.
5. **Hors ligne à 100 %**, avec tout le butin.
6. **Talents et tour** : remplacer `dimR` par des coûts exponentiels, sans rendement décroissant.
7. **Butins des zones 7 à 12** : compléter `LOOT_X`.
8. **Icônes** :
   - une forme propre à chaque butin plutôt que la « gemme » par défaut ;
   - des clés colorées par zone ;
   - une pierre plus grande sur les amulettes et anneaux ;
   - des couleurs plus écartées entre monstres proches ;
   - l'icône du Poissonnédia.
