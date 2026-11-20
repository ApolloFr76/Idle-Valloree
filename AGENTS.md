# Consignes pour les agents (AGENTS.md)

## Notes de mise à jour (`js/updates.js`)

- **Toujours documenter les changements notables dans `UPDATE_LOGS` (`js/updates.js`)** : dès qu'une modification a un minimum d'importance pour le joueur, ajoutez-la ou mettez à jour l'entrée en tête de `UPDATE_LOGS` dans `js/updates.js`.
- **Priorité au gameplay et à l'expérience joueur** :
  - **À inclure** : équilibrage (statistiques, coûts, dégâts, courbes, compagnons, métiers, arbre Oméga), nouvelles mécaniques ou fonctionnalités, changements de fonctionnement des automatismes, améliorations notables d'interface ou de confort en jeu, et corrections de bugs visibles par le joueur.
  - **À exclure** : les modifications purement internes de code (refactoring, découpage de fichiers, nettoyage de code mort, outillage de test ou d'assemblage) qui ne changent rien pour le joueur.
- **Style** : rédigez en français clair, concis et tourné vers le joueur (sans jargon technique ni noms de variables internes).
