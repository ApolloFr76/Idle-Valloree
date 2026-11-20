# Les Terres de Vallorée

Jeu idle / clicker en pixel art, jouable directement dans le navigateur, sur ordinateur comme sur téléphone.

**Jouer en ligne : https://apollofr76.github.io/Idle-Valloree/**

Le héros combat tout seul, même quand vous n'êtes pas là. Cliquez sur le monstre pour frapper plus fort, lancez vos sorts, équipez-vous, puis renaissez (passage Oméga) pour aller encore plus loin.

## Contenu

- **8 classes** : Guerrier, Archer, Mage, Gardien, Druide, Chronomancien, Berserker, Invocateur.
- **4 éléments** (Feu, Eau, Terre, Air) avec faiblesses et résistances, et leurs dégâts sur la durée : Brûlure, Gelure, Saignement, Poison.
- **12 mondes**, de la Prairie des Clochettes à l'Abîme de Nuitombre : 96 créatures, 12 boss, des donjons et une tour sans fin.
- **108 panoplies** et près de 600 objets, une forge à mini-jeu (de Commun à Légendaire), l'enchantement, des familiers et des trophées.
- **5 métiers** (Bûcheron, Mineur, Paysan, Herboriste, Pêcheur), chacun avec son mini-jeu, et des ouvriers qui récoltent pour vous.
- Alchimie, marché aux prix qui bougent, quêtes du jour, compagnons, boutique d'améliorations.
- **Passage Oméga** (renaissance) et l'arbre Oméga : quatre voies de talents.
- **76 succès**, bestiaire, Poissonnédia, météo et événements, sons et musique.

## Sauvegarde

- La partie est enregistrée automatiquement dans le navigateur. En ligne, le stockage est illimité ; pendant votre absence, le héros continue de gagner sur la durée de votre stockage AFK (qui grandit avec votre niveau, vos métiers maîtrisés, les sacs de la boutique et l'arbre Oméga) ; au retour, un écran résume ces gains et votre dernière session.
- **Copies de secours** : le jeu garde les 3 dernières copies de votre partie (Options › Sauvegarde).
- **Exporter / importer** : copiez le code de sauvegarde signé (`V2.<signature>.<base64>`, rétrocompatible avec l'ancien format) dans Options › Sauvegarde pour changer de navigateur ou garder une copie.
- **Compte en ligne** (facultatif) : un pseudo et un mot de passe suffisent pour retrouver la partie sur n'importe quel appareil et apparaître au classement. À la création du compte (et depuis Options › Sauvegarde), un **code de secours** (`VAL-XXXX-XXXX-XXXX`) est généré pour pouvoir réinitialiser votre mot de passe sans e-mail. Le petit voyant en haut de l'écran indique si la partie est bien envoyée.

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

Dans la barre d'onglets, les flèches passent d'un onglet à l'autre. Les raccourcis se désactivent dans Options › Clavier.

## Confort et accessibilité

Options › Affichage : thèmes Parchemin, Sombre et Contraste élevé, taille de l'interface, animations réduites (activées d'office si votre système le demande), 30 images par seconde pour économiser la batterie.

## Pour les développeurs

Le jeu est en HTML, CSS et JavaScript, sans dépendance ni étape de construction.

- **Lancer** : ouvrir `index.html` dans un navigateur (fonctionne aussi en `file://`).
- **Code** : `js/` contient des scripts classiques qui partagent la même portée globale ; leur ordre de chargement est celui de `index.html`. `js/controle.js` signale dans la console un script qui utilise un nom pas encore défini ou déjà déclaré ailleurs.
- **Tests** (Node 18 ou plus) :
  ```
  node tests/run.js
  ```
  Suite rapide sans dépendance (vérifie la syntaxe, l'ordre de chargement `CHARGE.err`, les courbes de statistiques et compagnons, le stockage AFK, les ouvriers, la signature et l'assainissement des sauvegardes, le code de secours et le générateur de biomes). Pour les tests navigateur avec Chromium :
  ```
  npm install
  npx playwright install chromium
  npm test
  ```
  Les tests ouvrent le jeu dans Chromium, créent un héros, le laissent combattre et vérifient la sauvegarde, les migrations, l'import, l'affichage téléphone et le clavier. Aucune erreur ne doit apparaître dans la console.
- **Publication** : `npm run assembler` (ou `node outils/assembler.js`) regroupe tous les scripts et feuilles de style dans `_site/` (un seul `jeu.js` et un seul `jeu.css`). Le workflow `.github/workflows/publier.yml` le fait à chaque envoi sur `main` et publie le résultat sur GitHub Pages, une fois la source Pages réglée sur « GitHub Actions ».
- **Sauvegarde** : `localStorage`, clé `vallore-save-v1`. Pour changer la structure de la partie, ajouter une migration dans `MIG` (`js/etat.js`) : le numéro de version suit tout seul.
- **Comptes et classement** : Supabase (`supabase/securite.sql`, Edge Function `supabase/functions/reset-password/index.ts`, guide dans `supabase/README.md`).

Tout le contenu (noms, dessins, personnages) est original.
