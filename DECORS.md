# Faire les décors des autres biomes

Seule la Prairie (zone 0) est réglée. Les autres zones passent par le même générateur avec leurs couleurs, mais ressemblent encore à une prairie. But : un décor propre à chaque biome, de même qualité.

## Où ça se passe

- `js/monde.js`
  - `makeLayers(zid)` génère les plans d'une zone, une seule fois par zone.
  - `lowland()` génère la prairie sous les menus.
  - `draw()` dessine chaque image ; la vie du décor est dans `updLife()` et `drawLife()`.
- `js/pixel.js` : `TH[zid]` contient le thème de chaque biome (couleurs `g`, `path`, `wall`, `wc`, `water`, `props`, `fl`). Les accessoires `prop.*` (tree, pine, rock, bush, crystal, cactus, reed, coral, pillar…) sont exposés par `PX.kit`.
- `style/monde.css` : mise en page du bandeau, sans rien de propre aux biomes.

## Les plans (pixels logiques ×4, le monstre fait 40 px)

| Plan | Taille | Vitesse de défilement | Contenu dans la Prairie |
|---|---|---|---|
| `far` | 480×52 | 0,08 | montagnes |
| `mid` | 640×48 | 0,22 | collines, village, château, moulins (`meta.mills` / `houses`) |
| `wall` | 512×46 | 0,5 | bosquets et muret |
| `ground` | 768×(TM+GH) | 1 | prairie, mares (`meta.ponds`), chemin à la ligne `PY` où se tiennent les acteurs |
| `low` | 768×200 | 1 | suite du sol sous les menus |

Le ciel et la teinte de l'heure (`SKY`, `TINT`) sont communs à tous les biomes.

## Règles à respecter

- **Raccord en largeur :** chaque plan se répète bout à bout. Utiliser `wave()` (sinus à nombre de périodes entier), et `wset` / `wblit` qui bouclent en x.
- **Raccord en hauteur :** pas de forme coupée aux bords haut et bas de `ground` et de `low`, sinon une ligne apparaît sous le bandeau.
- **Chemin :** il reste dégagé autour de `PY` (environ ±8 lignes). Les accessoires vont derrière (`TM+6` à `PY-9`) ou devant (`PY+12` et au-delà).
- **Éléments animés :** ils sont attachés au sol (vitesse 1, même boucle `gW`), sinon ils glissent. Voir les hautes herbes (`tufts`) : elles sont plantées seulement sur de l'herbe nue, vérifiée avec `bare()`.
- **Tirage au hasard :** toujours `rng(seed)` à graine fixe, pour que le décor soit stable d'une session à l'autre.
- **Style :** pixel art avec contour (`outline`), ombres en trois tons (`part`), palette du biome. Rien de flou : pas de texte dessiné dans un canvas agrandi.

## Méthode conseillée

1. Ajouter dans `makeLayers` un aiguillage par `zid`, avec une fonction par biome, et garder la Prairie comme modèle. Idées par biome :

   | Biome | Idées |
   |---|---|
   | bois | sous-bois sombre, troncs, rayons de lumière |
   | marais | eau stagnante, roseaux, brume |
   | mines | parois de roche, rails, lanternes |
   | dunes | sable, cactus, ruines |
   | givre | neige, sapins, flocons |
   | volcan | lave qui luit, cendres |
   | récifs | sous l'eau : bulles, coraux |
   | ruines, abîme | piliers, cristaux |

2. Adapter `lowland` et la vie du décor : réutiliser `DECO` de `js/vie.js` (lucioles, braises, neige, bulles…).
3. Vérifier par des captures en 1920×1080, 1280×720 et 390×844, de jour, de nuit et pendant un boss, et contrôler la console (0 erreur). Avec Edge sans fenêtre et le protocole CDP, injecter la sauvegarde avec `Page.addScriptToEvaluateOnNewDocument` (clé `vallore-save-v1`), sinon la sauvegarde automatique l'écrase. Changer de zone avec `goZone(i)`.
