# Configuration Supabase (classement sécurisé & codes de secours)

Le client fonctionne déjà en repli avec l'ancienne configuration tant que ce déploiement n'est pas appliqué, mais **les protections côté serveur ne sont actives qu'après ces 3 étapes**.

## 1. Appliquer les règles RLS et fonctions SQL

1. Ouvrir le tableau de bord Supabase → **SQL Editor**.
2. Copier-coller le contenu de [`securite.sql`](securite.sql) et cliquer sur **Run**.

Ce script :
- Ajoute une validation sur `public.saves` (propriétaire `auth.uid()`, JSON valide, taille ≤ 500 Ko, pseudo valide) ;
- Retire les droits d'écriture directs (`INSERT` / `UPDATE` / `DELETE`) sur `public.classement` pour les utilisateurs et crée la fonction `public.sync_classement(p_degats)` qui lit `saves.data` côté serveur et contrôle les valeurs et sauts anormaux ;
- Crée la table privée `public.recovery_codes` (hachage bcrypt via `pgcrypto`, blocage 15 min après 5 échecs) et les fonctions `set_recovery_code`, `verify_recovery_code`, `rotate_recovery_code`.

## 1 bis. Classement enrichi (`classement-lot6.sql`)

Copier-coller [`classement-lot6.sql`](classement-lot6.sql) dans le **SQL Editor** puis **Run** (peut être relancé sans danger). Il reprend la vérification du classement (valeurs relues dans la sauvegarde en ligne, comptes signalés gelés) et ajoute :
- les colonnes `ecus_total`, `kills`, `succes`, `metiers`, `temps` (lues dans la sauvegarde) et celles de la semaine (`sem_debut`, `sem_lvl`, `sem_tour`, `sem_kills`, remises à zéro chaque lundi 0 h UTC) ;
- la table `classement_palmares` : le top 3 de chaque semaine y est archivé à la première écriture de la semaine suivante (il débloque le cadre `laurier`) ;
- la table `classement_records` : le premier compte à atteindre chaque palier.

Tant que ce script n'est pas lancé, le jeu affiche l'ancien classement (niveau, éclats, tour, puissance) et masque les nouveautés.

## 2. Déployer la Edge Function `reset-password`

```bash
supabase functions deploy reset-password --no-verify-jwt
```

> `--no-verify-jwt` est indispensable car le joueur qui a oublié son mot de passe n'a pas de session active au moment d'appeler la fonction.

Les variables d'environnement `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` sont fournies automatiquement par l'environnement Supabase Edge Functions.

## 3. Contrôle rapide

- Dans **Authentication → Policies**, vérifier que `classement` n'a qu'une politique `SELECT` (`classement_read_auth`) et que `recovery_codes` n'expose aucune politique publique.
- Créer un compte test dans le jeu : une modale affiche immédiatement un code `VAL-XXXX-XXXX-XXXX`, puis l'écran *Mot de passe oublié ?* permet de réinitialiser le mot de passe et régénère un nouveau code à usage unique.
