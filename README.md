# Koi Zen Snake

> Un Snake contemplatif où une carpe koï glisse dans un jardin d’eau japonais, cueille des lotus et laisse derrière elle de douces vaguelettes.

<div align="center">

**Créé par Euloge · Open Source · MIT**

</div>

## L’expérience

Koi Zen Snake réinterprète le classique Snake comme une petite expérience arcade méditative. La règle reste immédiatement lisible : la carpe avance sur une grille, mange des fleurs, grandit, puis doit éviter les pierres du bassin et son propre corps. L’habillage transforme chaque partie en promenade nocturne : eau bleu-encre, bordures de pierres moussues, fleurs lumineuses et typographie inspirée d’un carnet de jardin.

Le jeu est conçu pour être agréable en quelques secondes, mais suffisamment précis pour récompenser l’anticipation. Le score est personnel, local et sans compte : on revient simplement tenter de dépasser son meilleur jardin.

## Fonctionnalités

| Fonctionnalité | Description |
|---|---|
| **Snake classique** | Déplacement cellule par cellule, croissance après collecte et collisions avec le bord ou le corps. |
| **Trois lotus** | Ivoire `+10`, rose `+20` et or `+35`, avec probabilités d’apparition pondérées. |
| **Ambiance sonore** | Musique originale de jardin zen, bouclée à volume doux, plus effets Web Audio pour les collectes, virages et collisions. |
| **Classement local** | Les cinq meilleurs scores sont conservés dans `localStorage` et les trois premiers apparaissent à la fin de la partie. |
| **Contrôles accessibles** | Flèches, WASD, boutons tactiles, pause, reprise et redémarrage. |
| **Mode démo** | `?demo` active un autopilote déterministe pour présenter immédiatement la boucle de jeu. |
| **Responsive** | Interface adaptée aux écrans desktop, tablette et mobile. |

## Jouer

### Clavier

- **Flèches** ou **WASD** : diriger la carpe.
- **Espace** ou **P** : mettre en pause ou reprendre.
- **R** : recommencer la partie.

### Tactile

Le pavé directionnel apparaît sous le bassin. Le bouton audio active ou coupe la musique et les effets. Comme les navigateurs bloquent la lecture automatique, la musique démarre après la première interaction avec la page.

### Mode démo

Ajoutez `?demo` à l’URL pour lancer l’autopilote déterministe :

```text
https://votre-instance/?demo
```

Ce mode est utile pour une démonstration rapide, une capture d’écran ou une vérification visuelle.

## Direction artistique

Le jeu mélange trois matières visuelles : la profondeur sombre d’une eau nocturne, le rose poussiéreux des accents floraux et le vert minéral des pierres. Les formes du bassin sont rendues avec Babylon.js et des meshes procéduraux : aucune texture externe lourde n’est nécessaire pour le décor.

La musique d’ambiance est un morceau instrumental original de 150 secondes, composé pour rester doux et relativement stable en boucle. Les effets de jeu sont générés à la volée avec l’API Web Audio afin de rester légers, immédiats et cohérents avec l’atmosphère.

## Architecture

```text
client/src/
├── components/
│   └── GameCanvas.tsx       # Pont React/Babylon et cycle de vie du canvas
├── game/
│   ├── audio.ts             # Musique, effets et contrôle du volume
│   ├── koiGame.ts           # Simulation grille, fleurs, score et collisions
│   └── scene.ts             # Bassin, koi, lotus, pierres et vaguelettes
├── pages/
│   └── Home.tsx             # HUD, états, classement et contrôles tactiles
└── index.css                # Système visuel, responsive et accessibilité
```

La simulation est séparée de React : `KoiGame` ne dépend pas de l’interface, tandis que `GameCanvas` orchestre le rendu et le cycle de vie Babylon. Cette séparation rend les règles faciles à tester et évite de faire porter à React l’état par image.

## Développement local

Le projet utilise React, TypeScript, Vite, Tailwind CSS et Babylon.js.

```bash
pnpm install
pnpm dev
```

Puis ouvrez l’URL indiquée par Vite. Les commandes de vérification sont :

```bash
pnpm check    # vérification TypeScript
pnpm build    # build de production
pnpm format   # formatage Prettier
```

## Données locales

Le classement utilise la clé `koi-zen-leaderboard`. Le meilleur score historique utilise `koi-zen-best`. Pour réinitialiser la progression dans le navigateur :

```js
localStorage.removeItem("koi-zen-leaderboard");
localStorage.removeItem("koi-zen-best");
```

Aucune donnée personnelle n’est envoyée à un serveur par le jeu.

## Crédits et licence

**Koi Zen Snake a été créé par Euloge.** Le code du projet est distribué sous licence **MIT**. Vous pouvez l’utiliser, l’étudier, le modifier et le redistribuer dans les conditions précisées dans [`LICENSE`](./LICENSE).

Les éléments audio et les choix artistiques originaux inclus dans ce projet sont référencés dans [`ASSETS.md`](./ASSETS.md). Les marques et noms de bibliothèques appartiennent à leurs détenteurs respectifs.

## Feuille de route

Les prochaines extensions naturelles sont un choix de nom avant l’enregistrement du score, des objectifs quotidiens, un réglage séparé de la musique et des effets, ainsi qu’un mode crépuscule avec une palette alternative. Le cœur du projet doit rester compact : une règle simple, un mouvement précis et une sensation de calme.

---

<div align="center">

**静けさ · mouvement · harmonie**

Fait avec soin par **Euloge**.

</div>
