# Les Terres de Vallorée

Jeu idle / clicker en pixel art, jouable directement dans le navigateur, sur ordinateur comme sur téléphone.

**Jouer en ligne : https://apollofr76.github.io/Idle-Valloree/**

Votre héros combat tout seul, même quand vous n'êtes pas là. Cliquez sur le monstre pour frapper plus fort, lancez vos sorts, forgez votre équipement, recrutez des compagnons, puis passez Oméga (renaissance) pour repartir plus fort et aller toujours plus loin.

## Le jeu en bref

| | |
|---|---|
| **Classes** | 8 : Guerrier, Archer, Mage, Gardien, Druide, Chronomancien, Berserker, Invocateur |
| **Éléments** | 4 : Feu, Eau, Terre, Air, avec faiblesses, résistances et dégâts sur la durée (Brûlure, Gelure, Saignement, Poison) |
| **Mondes** | 12, de la Prairie des Clochettes à l'Abîme de Nuitombre, chacun avec son décor animé |
| **Créatures** | 96 monstres et 12 boss, plus des donjons et une tour sans fin |
| **Équipement** | 108 panoplies et 945 objets |
| **Métiers** | 5 : Bûcheron, Mineur, Paysan, Herboriste, Pêcheur |
| **Succès** | 76 |

## Contenu

### Combat et progression
- Le héros attaque seul ; vos clics, vos 3 sorts et vos potions font la différence.
- **Compagnons** : 10 alliés à recruter (écuyer, chasseuse, golem, dragonnet, phénix…). Ils frappent même pendant les donjons et la tour, et certains posent des dégâts sur la durée.
- **Boss, donjons et tour** : chaque monde a son boss, qui demande une clé à fabriquer ; la tour monte sans fin.
- Créatures brillantes, météo et événements, objets à ramasser dans l'arène.

### Équipement
- **Panoplies de classe** : chaque monde propose 8 panoplies de classe (8 pièces, avec un bonus signature à 4 pièces pour votre classe) et 1 panoplie de boss pour toutes les classes (4 pièces). Combiner 4 pièces de votre classe et 4 pièces du boss donne le meilleur équipement de la zone.
- **Forge** à mini-jeu (de Commun à Légendaire), enchantement, trophées.
- **Garde-robe** : votre héros porte en direct les pièces équipées. Chaque pièce obtenue débloque son apparence pour toujours, même après Oméga.
- **Familiers et montures** : 21 à fabriquer à l'Atelier.

### Métiers et économie
- 5 métiers, chacun avec son mini-jeu et 12 ressources, soit 60 ressources avec leur propre scène de récolte animée.
- **Ouvriers** : des personnages qui récoltent pour vous, avec un outil qui s'améliore avec vos ressources débloquées.
- Alchimie (potions), marché aux prix qui bougent, quêtes du jour, boutique d'améliorations.
- **Poissonnédia** : 29 poissons à pêcher, du commun au mythique.

### Passage Oméga
- **Renaissance** : vous repartez de zéro en gardant des éclats Oméga.
- **Arbre Oméga** : un tronc commun puis 4 voies (Guerrier, Marchand, Artisan, Boutique permanente). Le Pacte des voies en ouvre une de plus à chaque niveau, et le Cœur puis l'Écho d'Oméga attendent au sommet. L'arbre s'affiche en entier ; un menu permet de voir une voie en grand, et un double-clic sur une case l'achète.

### Collection et classement
- Bestiaire, succès, Poissonnédia.
- **Classement** des joueurs avec un compte : niveau, éclats Oméga, tour et puissance.

## Sauvegarde

- **Automatique** : la partie est enregistrée dans le navigateur. Pendant votre absence, le héros continue de gagner pendant la durée de votre stockage AFK, qui grandit avec votre niveau, vos métiers maîtrisés, les sacs de la boutique et l'arbre Oméga. Au retour, un écran résume ces gains.
- **Copies de secours** : le jeu garde les 3 dernières copies de votre partie (Options › Sauvegarde).
- **Exporter / importer** : copiez le code de sauvegarde signé (`V2.<signature>.<base64>`, compatible avec l'ancien format) depuis Options › Sauvegarde pour changer de navigateur ou garder une copie.
- **Compte en ligne** (facultatif) : un pseudo et un mot de passe suffisent pour retrouver votre partie sur n'importe quel appareil et apparaître au classement. Un **code de secours** (`VAL-XXXX-XXXX-XXXX`) est donné à la création du compte (et dans Options › Sauvegarde) pour réinitialiser votre mot de passe sans e-mail. Le voyant en haut de l'écran indique si la partie est bien envoyée.

## Raccourcis clavier

| Touche | Action |
|---|---|
| Espace ou A | Frapper |
| 1, 2, 3 | Sorts |
| S | Boire une potion de soin |
| E | Ramasser l'objet qui apparaît |
| B | Défier le boss de la zone |
| C, I, V, F, O | Personnage, Inventaire, Aventure, Atelier, Options |
| P | Pause |
| Échap | Fermer le panneau ou la fenêtre |

Chaque bouton qui a un raccourci l'affiche dans une petite encoche à gauche (Espace sous le monstre, E sous l'objet à ramasser). Dans la barre d'onglets, les flèches passent d'un onglet à l'autre. Les raccourcis, et leur affichage sur les boutons, se règlent dans Options › Clavier.

## Confort et accessibilité

Options › Affichage : thèmes Parchemin, Sombre et Contraste élevé, taille de l'interface, format des nombres, chiffres de dégâts, animations réduites (activées d'office si votre système le demande) et 30 images par seconde pour économiser la batterie.

## Pour les développeurs

Le jeu est écrit en HTML, CSS et JavaScript, sans dépendance ni étape de construction. Tous les dessins sont générés par le code.

### Lancer
Ouvrez `index.html` dans un navigateur. Le jeu fonctionne aussi en `file://`.

### Organisation
- `index.html` : squelette de la page et liste des scripts, chargés dans cet ordre.
- `js/` : scripts classiques qui partagent la même portée globale (pas de modules). Un nouveau fichier doit être ajouté dans `index.html` au bon endroit. `js/controle.js` signale dans la console un script qui utilise un nom pas encore défini ou déjà déclaré ailleurs.
  - Données : `donnees.js`, `donnees-objets.js`, `donnees-progression.js`, `donnees-divers.js`.
  - Pixel art : `pixel.js` (moteur `PX`, classe `Spr`), `pixel-monstres.js`, `pixel-heros.js` (héros, compagnons, ouvriers, outils), `pixel-objets.js` (objets, ressources, poissons, décor).
  - Décors des mondes : `biomes/` (un fichier par monde) et `monde.js`. Le guide est dans `DECORS.md`.
  - Onglets : `onglets/` (un fichier par onglet).
  - Notes de mise à jour affichées en jeu : `updates.js` (voir `AGENTS.md`).
- `style/` : `style.css` (thème et écrans), `disposition.css` (mise en page, tiroir), `monde.css` (bandeau de combat).

### Règles utiles
- **Pixel art** : un sprite doit tenir dans son image, contour compris. Les monstres sont dessinés sur un repère de 40 × 40 avec une marge de 3 px ; les icônes de 16 × 16 sont dessinées avec une marge puis recadrées par `Spr.fit(16)`.
- **Sauvegarde** : `localStorage`, clé `vallore-save-v1`. Pour changer la structure de la partie, ajoutez une migration dans `MIG` (`js/etat.js`) : le numéro de version suit tout seul.
- **Notes de mise à jour** : tout changement visible par le joueur va dans `UPDATE_LOGS` (`js/updates.js`), en français et sans jargon (consignes dans `AGENTS.md`).
- **Contenu original uniquement** : aucun nom, image ou personnage d'un jeu existant.

### Tests
Suite rapide sans dépendance (Node 18 ou plus) :
```
node tests/run.js
```
Elle vérifie la syntaxe, l'ordre de chargement (`CHARGE.err`), les courbes de statistiques et de compagnons, le stockage AFK, les ouvriers, la signature et le nettoyage des sauvegardes, le code de secours, le générateur de biomes et le rendu du pixel art.

Tests dans un vrai navigateur (Chromium) :
```
npm install
npx playwright install chromium
npm test
```
Ils ouvrent le jeu, créent un héros, le laissent combattre et vérifient la sauvegarde, les migrations, l'import, l'affichage téléphone et le clavier. Aucune erreur ne doit apparaître dans la console.

### Publication
Le site est publié par GitHub Pages directement depuis la branche `main`, sans assemblage. `npm run assembler` (ou `node outils/assembler.js`) peut regrouper tous les scripts et feuilles de style dans `_site/` (un seul `jeu.js` et un seul `jeu.css`) pour une publication assemblée.

### Comptes et classement
Supabase : règles de sécurité dans `supabase/securite.sql`, fonction de réinitialisation du mot de passe dans `supabase/functions/reset-password/index.ts`, guide dans `supabase/README.md`.

---

Tout le contenu (noms, dessins, personnages) est original.
