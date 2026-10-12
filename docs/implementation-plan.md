# Solana Events — plan d’implémentation hackathon

> Statut : spécification de travail pour agent de code. Ce document décrit quoi construire et comment le vérifier ; il ne demande pas d’implémenter chaque option avant validation.

## 1. Objectif et contrainte de livraison

Construire une application Android mobile-first permettant de découvrir des événements Solana, consulter leur détail, les sauvegarder, puis ouvrir leur page officielle d’inscription.

Date limite communiquée par formulaire : **8 octobre 2026, 23:59 UTC**. En France métropolitaine (CEST, UTC+2), cela correspond au **9 octobre 2026, 01:59**. Cible interne : soumettre le **7 octobre avant 18:00 CEST**. Ne jamais planifier une tâche critique le 8 octobre.

Livrables obligatoires confirmés : APK Android fonctionnel, dépôt GitHub, vidéo démo, pitch deck ou courte présentation. L’annonce officielle indique aussi que le projet doit être mobile-first pour Seeker. Sources :

- [CLOCK IN — annonce officielle](https://solanamobile.com/blog/clock-in-the-solana-mobile-hackathon)
- [Solana Mobile — créer un projet React Native](https://docs.solanamobile.com/get-started/react-native/create-solana-mobile-app)
- [Solana Mobile — setup Android et MWA](https://docs.solanamobile.com/get-started/development-setup)

## 2. Décision produit

### Promesse

**Discover Solana events that match your interests, communities, and location.**

Version hackathon : catalogue local, curaté et vérifié. Pas de promesse d’agrégation exhaustive ni de données en temps réel.

### Parcours démontrable

1. Ouvrir Discover et voir événements à venir.
2. Rechercher ou filtrer un événement.
3. Ouvrir détail et vérifier date, lieu, topics, source officielle.
4. Enregistrer événement.
5. Retrouver événement dans Saved après redémarrage.
6. Ouvrir page officielle d’inscription.
7. Ouvrir Profile, connecter wallet via Mobile Wallet Adapter, voir adresse publique et état de connexion.

### Scope verrouillé

| Priorité | Fonctionnalité | Décision |
| --- | --- | --- |
| P0 | Catalogue de 5 événements réels vérifiés | Obligatoire |
| P0 | Discover, détail, recherche, filtres | Obligatoire |
| P0 | Favoris persistants | Obligatoire |
| P0 | Liens source et registration officiels | Obligatoire |
| P0 | Préférences topics et communautés manuelles | Obligatoire |
| P0 | Connexion wallet MWA, affichage adresse, déconnexion, erreurs | Obligatoire |
| P0 | APK release installable sans serveur | Obligatoire |
| P1 | Ajouter au calendrier | Seulement après P0 vérifié |
| P1 | Classement léger selon intérêts | Seulement après P0 vérifié |
| P2 | Détection NFT/collections et suggestion communautés | Hors MVP, sauf spike déjà concluant |
| Non | Backend, auth, base de données, scraping, smart contract, tokens, paiement | Ne pas construire |

### Solana : position honnête

Intégration Solana MVP = connexion native d’un wallet compatible MWA, avec consentement utilisateur et affichage de son adresse publique. Cette intégration est utile sur Seeker, mais ne donne pas encore une recommandation on-chain.

Ne pas prétendre que l’app détecte des NFT. Décrire dans deck/README : « Future work: opt-in collection-based community suggestions using verified collection IDs. »

## 3. Stack et règles techniques

### Choix

- React Native, Expo, TypeScript strict.
- Initialiser depuis `create-solana-dapp`, sélectionner framework **Solana Mobile / Expo** et modèle incluant MWA. Garder navigation et configuration natives du starter tant que possible.
- Développement sur **custom development build**, jamais Expo Go pour MWA. Documentation officielle le demande.
- Expo Router seulement si starter l’utilise. Ne pas ajouter une deuxième solution de navigation.
- Stockage local asynchrone pour favoris et préférences. Pas de serveur.
- EAS Build pour APK release ; configurer un profil qui produit explicitement un `.apk`, pas seulement un `.aab`.

### Dépendances

GLM doit d’abord lire versions du starter généré et docs officielles actuelles. Ne pas fixer arbitrairement numéros de version dans ce plan.

Autorisées si nécessaires et compatibles avec SDK Expo du starter :

- paquet MWA déjà fourni/recommandé par starter Solana Mobile ;
- stockage local recommandé par Expo ;
- ouverture URL fournie par React Native/Expo ;
- paquet calendrier Expo uniquement si P0 fini ;
- icônes déjà disponibles dans starter.

Refuser dépendance si elle duplique une capacité existante ou ajoute backend/clé API.

### Contraintes sécurité

- Ne jamais demander, afficher, stocker ou transmettre seed phrase, private key ou signature inutile.
- Wallet connect doit demander uniquement autorisation MWA standard.
- Stocker seulement adresse publique, label wallet éventuel et état de préférence ; ne jamais considérer stockage local comme secret.
- Ouvrir uniquement URLs `https` provenant du dataset vérifié.
- Aucun RPC ou service NFT payant dans MVP.

## 4. Architecture de dossiers

Adapter noms aux conventions starter, sans restructuration inutile.

```text
app/                         # routes Expo Router, si starter utilise Expo Router
  (tabs)/discover.tsx
  (tabs)/saved.tsx
  (tabs)/profile.tsx
  event/[id].tsx
  interests.tsx
src/
  components/
    EventCard.tsx
    FilterSheet.tsx
    FilterChip.tsx
    EventMetaRow.tsx
    EmptyState.tsx
    SectionHeader.tsx
    WalletStatusCard.tsx
  data/
    events.json
    communities.ts
    eventCatalog.ts
  domain/
    event.ts
    filters.ts
    community.ts
  hooks/
    useEventFilters.ts
    useFavorites.ts
    useInterests.ts
    useWallet.ts
  services/
    storage.ts
    wallet.ts
    calendar.ts              # uniquement lorsque P1 démarre
    externalLinks.ts
  theme/
    colors.ts
    spacing.ts
    typography.ts
  utils/
    dates.ts
    eventStatus.ts
    ranking.ts
assets/
docs/
```

Responsabilités :

- Routes : composition écran et navigation, aucune logique métier longue.
- `domain` : types, validation légère, fonctions pures.
- `data` : données curatées et accès au catalogue.
- `services/storage` : lecture/écriture JSON local avec migrations simples par clé/version.
- `services/wallet` : adaptation unique vers API MWA starter. Écrans ne doivent pas appeler MWA directement.
- `components` : UI réutilisable, sans accès direct au stockage.

## 5. Modèle de données

Utiliser ISO 8601 avec offset explicite. Exemple : `2026-10-12T18:00:00-04:00`. Ne jamais utiliser une date locale ambiguë comme `10/12/2026` dans données.

```ts
type AttendanceMode = 'online' | 'in_person' | 'hybrid';
type EventFormat = 'hackathon' | 'conference' | 'meetup' | 'workshop' | 'community_event';
type Topic = 'defi' | 'nfts' | 'developers' | 'gaming' | 'consumer' | 'mobile' | 'dao';

interface Event {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  organizer: string;
  topics: Topic[];
  format: EventFormat;
  communityIds: string[];
  startAt: string;
  endAt: string;
  timezoneLabel: string;
  registrationDeadline?: string;
  attendanceMode: AttendanceMode;
  city?: string;
  country?: string;
  venue?: string;
  officialSourceUrl: string;
  registrationUrl?: string;
  lastVerifiedAt: string;
  image?: string;
}

interface Community {
  id: string;
  name: string;
  description: string;
}
```

Règles dataset :

- Minimum cinq événements futurs au moment de préparation démo.
- Chaque événement réel doit posséder source officielle consultée manuellement et `lastVerifiedAt`.
- Si registration URL inconnue, omettre champ : bouton devient « View official source ».
- Aucun organisateur, date ou lien inventé. Fixtures éventuelles doivent avoir préfixe `fixture-`, être hors catalogue production et ne jamais apparaître dans vidéo.
- Événement passé : ne pas afficher par défaut dans Discover. Si déjà favori, garder visible dans Saved avec badge `Ended`.
- Deadline d’inscription est distincte de date début. Afficher `Registration closed` si dépassée sans masquer événement.

## 6. Navigation et écrans

Navigation principale : trois tabs : **Discover**, **Saved**, **Profile**. `Event Details` et `My Interests` sont routes secondaires.

### Discover

But : comprendre catalogue en moins de cinq secondes.

- Header : nom temporaire `Solana Events`, sous-titre `Your ecosystem calendar`.
- Champ recherche : filtre titre et organisateur, insensible à casse, sans requête réseau.
- Bouton `Filters` ouvre bottom sheet.
- Chips actifs affichés sous recherche ; chaque chip peut être supprimé.
- Section `For you` : événements triés par score intérêts, sinon date croissante.
- Section `All upcoming` : événements futurs date croissante.
- Carte : date compacte à gauche, title deux lignes max, format, mode, city ou `Online`, bouton save accessible.
- Toucher carte ouvre détail. Toucher save ne doit pas ouvrir carte.
- États : skeleton local très court seulement si chargement stockage ; `No events match these filters` avec bouton `Clear filters` ; erreur dataset explicite sans crash.

### Filter sheet

Sections séparées :

- Topics : multi-select.
- Format : multi-select.
- Attendance : `Any`, `Online`, `In person`, `Hybrid`.
- Location : `Any location`, `Online only`, `Near me` **non disponible**. Ne pas implémenter géolocalisation. À la place, filtre pays/ville seulement si dataset le justifie ; sinon retirer section.
- Actions : `Reset` et `Show results`.

Logique : catégories différentes = AND. Plusieurs valeurs même catégorie = OR. Exemple : `DeFi` + `Workshop` retourne workshop ayant topic DeFi.

### Event Details

- Hero simple avec gradient discret ou couleur thème ; image seulement si locale/licenciée ou URL fiable.
- Title, organizer, badge format et mode.
- Bloc date : début, fin, timezone label.
- Bloc registration deadline uniquement si présent.
- Bloc location : venue/city/country ou `Online`.
- Description complète.
- Topics et communautés sous forme chips non interactifs.
- `Saved` / `Save event` comme action principale persistante.
- `Register` si `registrationUrl`, sinon `View official source`.
- Lien secondaire `Official source` toujours présent.
- P1 : `Add to calendar`.
- Liens externes demandent confirmation seulement si plateforme le fait nativement ; ne jamais afficher URL brute longue dans UI.

### Saved

- Événements favoris triés date croissante ; événement terminé après événements à venir.
- Empty state : `No saved events yet` + CTA `Explore events` vers Discover.
- Suppression possible depuis carte et détail ; changement immédiat, persistance après redémarrage.

### Profile

- Bloc wallet en haut : déconnecté / connexion / connecté / erreur.
- Déconnecté : explication courte et bouton `Connect wallet`.
- Connecté : adresse tronquée (`Abcd…Wxyz`), bouton copy, `Disconnect`.
- Après connexion réussie : section `Communities` et lien `Manage interests`.
- Copier adresse est confort, non critique. Aucun solde, transaction ou signature.
- Petit texte : `Your wallet is only used to connect. This app never asks for your recovery phrase.`

### My Interests

- Sélecteurs multi-select pour topics et communautés.
- Pré-sélection : aucune. Afficher recommandation claire mais jamais bloquer utilisateur.
- Bouton `Save preferences` ou sauvegarde instantanée avec feedback ; choisir une seule approche, de préférence bouton explicite pour junior-friendly UX.
- `Reset preferences` avec confirmation légère.

## 7. Design system précis

Identité : éditoriale, utile, mobile-first. Pas de cyberpunk, néons, verre dépoli, crypto clichés ni gradients lourds.

### Palette dark par défaut

| Token | Valeur | Usage |
| --- | --- | --- |
| `background` | `#0B1020` | fond global |
| `surface` | `#151C31` | cartes et sheet |
| `surfaceElevated` | `#1C2540` | cartes actives |
| `textPrimary` | `#F6F7FB` | titres |
| `textSecondary` | `#AAB4CD` | métadonnées |
| `border` | `#2A3554` | contours subtils |
| `accent` | `#8B7CFF` | CTA, sélection |
| `accentStrong` | `#6C5CE7` | pressé |
| `success` | `#4ED6A1` | saved/connecté |
| `warning` | `#F6BE6A` | deadline proche |
| `danger` | `#FF748D` | erreur destructive |

Prévoir tokens, pas couleurs hardcodées dans composants. Mode sombre seulement pour MVP afin de livrer finition cohérente.

### Typographie et espacement

- Police système, sans téléchargement externe.
- Page title : 28 px, poids 700, line-height 34.
- Section title : 20 px, poids 700, line-height 26.
- Card title : 17 px, poids 600, line-height 23.
- Body : 15–16 px, poids 400, line-height 22–24.
- Meta/chips : 12–13 px, poids 600.
- Échelle espace : 4, 8, 12, 16, 20, 24, 32 px.
- Rayon : 12 px pour contrôles ; 16 px pour cartes ; éviter capsules partout.
- Zone tactile minimale : 44 × 44 px.

### Comportement visuel

- Cartes avec bordure `border`, pas ombre lourde.
- Date block accenté : mois court et jour grand, lisible au premier regard.
- Chips : texte contrasté, état sélection avec fond accent opaque et bordure accent.
- CTA principal pleine largeur dans détail ; boutons secondaires outline.
- Safe areas haut/bas, contenu scrollable, clavier ne masque pas recherche.
- Tester contraste texte/fond et tailles sur téléphone Android réel et Seeker.

## 8. Wallet MWA : contrat fonctionnel

### Flux

1. Utilisateur presse `Connect wallet`.
2. App appelle couche `services/wallet` du starter MWA.
3. Wallet compatible s’ouvre ; utilisateur accepte ou annule.
4. Succès : afficher adresse publique et persister uniquement état UI minimal si nécessaire.
5. Annulation : revenir état déconnecté, message non alarmant.
6. Erreur/absence wallet : expliquer action possible, ne jamais bloquer catalogue.
7. `Disconnect` efface session/autorisation locale via API recommandée par starter et retourne état déconnecté.

### Cas obligatoires à tester

- Seed Vault Wallet sur Seeker : succès, annulation, déconnexion.
- Téléphone Android standard avec wallet MWA compatible ou Mock MWA Wallet : succès et erreur simulée.
- Aucun wallet compatible : état explicite.
- Wallet déjà autorisé puis app redémarrée : comportement conforme à API starter, sans fausse promesse de reconnexion automatique.
- Catalogue, favoris et liens restent utilisables si wallet échoue ou est absent.

Interdit : demander signature de message sans besoin, envoi transaction, analyse automatique NFT, transfert SOL.

## 9. Persistance et règles métier

Clés local storage versionnées :

```text
solana-events:favorites:v1       # string[] d’event IDs
solana-events:interests:v1       # { topics: Topic[]; communityIds: string[] }
solana-events:wallet-ui:v1       # seulement donnée non sensible permise par MWA
```

- Lire stockage au lancement avec état `hydrated` pour éviter flash d’un Saved vide.
- Écriture atomique logique : modifier mémoire, persister, afficher erreur si persistance échoue.
- Si ID favori absent du dataset : ignorer proprement, ne pas crasher.
- Dédupliquer IDs.
- Ranking léger : +2 si topic correspond, +1 si communauté correspond ; égalité départagée par `startAt`. Rendre cette logique pure et testable.

## 10. Plan d’exécution pour GLM

GLM doit faire une étape à la fois, lancer vérification, puis rapporter résultat réel. Ne pas coder P1/P2 avant validation P0.

### Milestone 0 — Bootstrap et preuve Android

**But :** base Solana Mobile fonctionne sur téléphone Android et Seeker.

1. Initialiser dépôt GitHub et cloner localement.
2. Générer app avec `npm create solana-dapp@latest`, framework Solana Mobile, template Expo/MWA.
3. Documenter versions Node, npm, Expo SDK, Android Studio, Java utilisées.
4. Installer dépendances sans mise à jour globale non nécessaire.
5. Créer custom development build et lancer sur Android standard.
6. Lancer même build sur Seeker.
7. Tester connexion MWA exemple starter au moins une fois sur Seeker.
8. Ajouter config EAS et lancer premier build APK tôt, même avec app starter.

**Done quand :** app démarre sur les deux appareils, MWA starter affiche flux réel sur Seeker, APK installable connu ou build EAS en cours avec logs propres.

### Milestone 1 — Foundation produit et données

**But :** app a structure, thème, données vérifiées.

1. Définir routes et tabs sans casser starter wallet.
2. Ajouter types `Event`, `Community`, catalogue access layer.
3. Rechercher cinq événements officiels futurs et enregistrer sources/dates vérifiées.
4. Implémenter utilitaires date/timezone et statut expiré.
5. Créer thème et composants base.

**Checks :** TypeScript, données parseables, rendu titres/dates correct sur Android, aucune date fictive.

### Milestone 2 — Discover et détail

**But :** parcours découverte → détail → lien fonctionne offline sauf page externe.

1. Construire liste Discover et cartes.
2. Construire recherche locale et filter sheet.
3. Construire détail avec CTA externe sûr.
4. Gérer dataset vide, filtre vide, événements passés et champs optionnels.

**Checks :** tester toutes combinaisons de filtres, recherche insensible à casse, chaque lien officiel ouvert manuellement.

### Milestone 3 — Saved et Interests

**But :** personnalisation locale durable.

1. Ajouter service stockage et hooks.
2. Ajouter save/unsave depuis carte et détail.
3. Construire Saved + empty state.
4. Construire Interests manuel ; appliquer ranking léger dans `For you`.
5. Redémarrer app et confirmer persistance.

**Checks :** save/unsave, tri, données corrompues/ID manquant, reset intérêts.

### Milestone 4 — Wallet intégré proprement

**But :** wallet réel ajoute valeur mobile sans casser app.

1. Extraire exemple MWA starter dans `services/wallet`/`useWallet`.
2. Construire états Profile.
3. Tester succès, cancellation, erreur, déconnexion sur Seeker et Android standard.
4. Écrire limitation NFT dans README.

**Checks :** jamais de phrase secrète, aucun catalogue bloqué, logs développement ne contiennent pas données sensibles.

### Milestone 5 — Polish et P1 conditionnel

**But :** rendre démo claire et stable.

1. Corriger spacing, overflow, touch targets, safe areas, contraste.
2. Ajouter calendrier seulement si P0 passe entièrement. Préférer un événement avec timezone correcte, gestion permission refusée et fallback clair.
3. Ne commencer aucune détection NFT sans preuve de collection IDs, source indexer et délai restant supérieur à une demi-journée.

### Milestone 6 — Release et soumission

**But :** livrable autonome et présentable.

1. Définir nom/package Android, icône, splash, version release.
2. Produire APK EAS release/preview selon exigence du formulaire.
3. Installer APK via fichier sur Android standard puis Seeker ; lancer sans Metro ni ordinateur.
4. Filmer démo depuis appareil réel.
5. Finaliser README, deck, checklist, liens GitHub.
6. Soumettre le 7 octobre et capturer confirmation.

## 11. Matrice de tests manuels

| Parcours | Android standard | Seeker | Résultat attendu |
| --- | --- | --- | --- |
| Démarrage APK hors réseau | Oui | Oui | catalogue local visible |
| Discover → détail | Oui | Oui | informations correctes |
| Recherche et filtres | Oui | Oui | résultats cohérents et état vide |
| Save puis redémarrage | Oui | Oui | favori conservé |
| Lien registration | Oui | Oui | URL officielle s’ouvre |
| Timezone/date | Oui | Oui | date lisible et correcte |
| Wallet connect | Secondaire | Obligatoire | adresse publique affichée |
| Wallet cancel/error/disconnect | Secondaire | Obligatoire | app reste utilisable |
| APK standalone | Oui | Oui | démarre sans serveur |

Ne pas dire « testé » si seulement TypeScript compile. Rapport final doit distinguer : compilé, testé émulateur, testé téléphone, testé Seeker.

## 12. README et démo

README doit inclure :

- problème, solution, screenshots ;
- fonctionnalités P0 et limites connues ;
- architecture courte ;
- setup développement et build APK ;
- sources des événements et date de vérification ;
- sécurité wallet ;
- test matrix réelle ;
- future work : API catalogue, calendrier amélioré, NFT collection mapping opt-in.

Vidéo 60–90 secondes :

1. Problème en une phrase.
2. Discover et filtre.
3. Détail puis registration link.
4. Save et persistance après relance.
5. Wallet connect sur Seeker.
6. Limite honnête : recommandations NFT à venir, non simulées.

Pitch deck : problème, utilisateur, démo flux, pourquoi mobile/Seeker, MWA integration, architecture sans backend, roadmap, ask/judging fit.

## 13. Instructions de qualité à donner à GLM

- Commencer par inspecter starter avant éditer.
- Préserver fichiers/versions générés par starter sauf besoin démontré.
- Faire commits petits et descriptifs après chaque milestone validé.
- Après chaque changement : typecheck/lint disponible, puis test sur appareil concerné.
- Ne pas fabriquer données, résultats de test, liens, captures ou compatibilité.
- Arrêter et signaler blocage concret plutôt que contourner sécurité wallet ou inventer API.
- Demander validation avant ajouter backend, service payant, clé secrète, NFT indexer ou transaction Solana.

## 14. Décisions encore à prendre avant code UI

1. Nom final et package Android. Nom temporaire recommandé : `Solana Events` ; package exemple : `com.<github-handle>.solanaevents`.
2. Cinq événements officiels à utiliser, avec URLs et date de vérification.
3. Type exact de build attendu par formulaire : APK universel ou APK architecture spécifique.
4. Accès à wallet MWA compatible sur téléphone Android standard ; Seeker reste appareil de validation principale.

Une fois ces quatre points résolus, GLM peut démarrer Milestone 0 sans autre décision d’architecture.
