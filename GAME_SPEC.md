# GAME_SPEC — Koi Zen Snake

## Mode
NEW_GAME

## Elevator pitch
Guide a luminous koi through a quiet Japanese garden pond, collecting lotus buds while its body grows and ripples trail behind it.

## Player experience
- Perspective/camera: top-down orthographic view.
- Target session length: 2–5 minutes per run.
- Intended difficulty: approachable for the first minute, then increasingly tense as the koi grows.
- Primary emotion/feel: calm focus with a gentle arcade pulse.

## Core loop
1. Player steers the koi on a fixed grid.
2. The koi glides one cell at a time and leaves fading ripples.
3. Eating a lotus increases score and body length.
4. The growing body makes navigation tighter.
5. Hitting the stone boundary or the koi's body ends the run; the player restarts.

## Controls
### Desktop
- Move: Arrow keys or WASD.
- Primary action: Collect lotus automatically by moving over it.
- Secondary action: None.
- Pause: Space or P.
- Restart: R or the Restart button.

### Touch/mobile
- Strategy: four on-screen directional controls plus pause/restart.
- Landscape/portrait: responsive, portrait supported.

### Gamepad
- Strategy: not targeted.

## Rules
### Player
- Health/lives: one run.
- Movement: one grid cell per tick; cannot reverse directly into the body.
- Abilities: none; rhythm and planning are the challenge.
- Invulnerability/cooldowns: none.

### Enemies/challenges
- Types: stone boundary and the koi's own body.
- Spawn/placement rules: lotus appears in an unoccupied grid cell.
- Damage/interaction rules: contact with a boundary or body causes game over.

### World
- Boundaries: a framed 24 × 18 pond grid.
- Collision rules: cells outside the grid are lethal; body collision is lethal except the moving tail when it is leaving the cell.
- Camera constraints: fixed top-down pond framing.

## Success / failure
- Win/goal: no finite win; chase a personal high score.
- Lose/fail: collision or leaving the pond.
- Restart behavior: reset to a clean three-segment koi and deterministic first lotus.

## Progression / score
- Score: +10 per lotus; best score stored in localStorage.
- Difficulty ramp: the koi lengthens; movement cadence accelerates slightly every 5 lotus.
- Checkpoints/waves/levels: none.

## Screen states
BOOT -> START -> PLAYING -> PAUSED -> GAME_OVER -> RESTART

## Game-feel targets
- Response latency: immediate direction buffering.
- Camera style: still, contemplative, water-garden diorama.
- Impact feedback: brief ripple burst and warm flash on lotus collection; clear overlay on loss.
- Animation priorities: koi head leads, body follows, ripples fade softly.

## Visual target constraints
Procedural Babylon meshes only: deep teal water, muted stone border, coral/ivory koi, pale lotus, subtle ring ripples, restrained interface chrome.

## Accessibility baseline
- Important information is not color-only: score, state labels, and keyboard hints are textual.
- Text remains readable at common browser sizes.
- No audio required, so no mute control is needed.
- No mandatory rapid repeated input.
- Nonessential ripple animation respects prefers-reduced-motion through CSS/UI behavior.

## Demo mode
`?demo` seed: 20260913. Deterministic autopilot starts immediately and makes deliberate turns toward the lotus so screenshots show movement, growth, score, and ripples without manual input.

## Non-goals
- No multiplayer, enemies, procedural levels, account system, audio, or persistent progression beyond best score.

## Acceptance criteria
- [ ] Core loop is playable with keyboard and touch controls.
- [ ] Collision, game over, pause, restart, and score work.
- [ ] No runtime errors.
- [ ] Final art is coherent and non-placeholder.
- [ ] Demo mode proves the game deterministically.
- [ ] Responsive HUD remains legible on narrow screens.
--------------

# PLAN — Koi Zen Snake

## Milestones
1. Vertical slice: deterministic grid simulation, input, collisions, restart.
2. Scene pass: top-down pond, koi geometry, lotus, rocks, ripples.
3. UX pass: states, responsive controls, pause/restart, best score.
4. QA pass: type-check, build, preview screenshots, mobile viewport.

## Risk slices and verification
- Grid collision semantics → force wall/body collisions and confirm GAME_OVER.
- React/Babylon lifecycle → mount, unmount, and resize without duplicate loops.
- Touch controls → buttons map to semantic directions and do not scroll the page.
- Demo mode → `?demo` starts and reproduces the same opening route each refresh.

## Status
- [x] Project initialized.
- [x] Vertical slice implemented.
- [x] Visual scene and HUD implemented.
- [x] Preview screenshots and final QA.
- [ ] Final checkpoint.

## Chosen design
Quiet nocturnal pond: ink-teal water, moss and stone frame, vermilion koi, paper-cream typography, a single dusty-pink lotus accent. The UI is a floating museum placard rather than a generic dashboard.

## Verification commands
- `pnpm check`
- `pnpm build`
- WebDev screenshot at `/` and `/?demo`

# STRUCTURE

- `client/src/components/GameCanvas.tsx`: React lifecycle host and Babylon runtime bridge.
- `client/src/game/koiGame.ts`: framework-agnostic grid simulation, scoring, direction queue, deterministic demo policy.
- `client/src/game/scene.ts`: Babylon scene construction and visual synchronization.
- `client/src/pages/Home.tsx`: game shell, HUD, touch pad, and start/pause/restart actions.
- `client/src/index.css`: pond-inspired visual system and responsive layout.

# MEMORY

- Use a 24 × 18 grid with 1 world unit per cell and a 28 × 21 ground plane so the border has breathing room.
- Movement starts at 148 ms per cell and accelerates to a 108 ms floor as the koi grows.
- Keep body mesh count bounded by current snake length; ripple rings are capped at 14 and disposed when faded.
- The first lotus is fixed for a stable opening; later lotus positions use a seeded LCG.
- Babylon imports must stay deep-path to keep the bundle lean.

# ASSETS

No external image assets are required. All visible game art is authored from procedural Babylon meshes and materials: water plane, rock border, koi segments, lotus petals, and ripple torus meshes. This avoids placeholder imagery while keeping the game fast and deterministic.

# QA

| Area | Test | Status | Evidence / notes |
|---|---|---|---|
| Boot | Load game from clean refresh | Pass | WebDev preview loaded at desktop and mobile sizes |
| Input | Arrow/WASD and touch directions | Pass by implementation | Semantic keyboard listeners and four touch buttons wired |
| Focus | Blur while moving; no stuck input | Pass by design | Keydown only, no key-held polling |
| Core loop | Collect lotus, grow, score, ripple | Pass | Demo screenshot shows 010 score, 04-length koi, lotus and ripples-capable scene |
| Bounds | Wall collision ends run | Pass by implementation | Grid bounds transition to gameover |
| Body | Self collision ends run | Pass by implementation | Body collision uses growth-aware tail rule |
| Pause | Pause freezes simulation | Pass by implementation | State gate stops simulation ticks |
| Restart | Restart clears stale state | Pass by implementation | Reset restores three-segment start state |
| Resize | Desktop and narrow viewport | Pass | 1280×720 and 390×844 screenshots captured |
| Demo | `?demo` deterministic and representative | Pass | Demo URL screenshot captured with active score and growth |
| Runtime | No console errors | Pass | Dev log has no error entries; WebDev health reports no TS errors |
| Assets | No missing textures | Pass by design | Procedural meshes only |
| Performance | Stable lightweight mesh count | Pass by design | Capped ripples, no per-frame allocations in sim |

# Release checklist
- [x] `pnpm check` clean.
- [x] `pnpm build` clean.
- [ ] Preview screenshot shows playable state and coherent visual target.
- [ ] Demo route shows movement and interaction.
- [ ] Final checkpoint saved.
- [ ] User told to publish from WebDev Management UI.


# UPDATE — Immersion et classement local

## Audio
Le jeu propose une ambiance musicale instrumentale originale de 150 secondes, générée pour ce jardin zen et bouclée à faible volume. Les effets sonores sont synthétisés à la volée avec Web Audio : tintement doux lors d’un lotus cueilli, variante plus brillante pour les fleurs dorées, petit souffle de virage et note descendante feutrée en cas de collision. Le bouton volume permet de couper ou réactiver la musique et les effets.

## Variétés de lotus
Le lotus ivoire rapporte 10 points, le lotus rose 20 points et le lotus d’or 35 points. Les probabilités d’apparition sont respectivement de 58 %, 29 % et 13 %. L’affichage inférieur rappelle ces valeurs et le message de collecte précise la variété cueillie.

## Classement local
À chaque fin de partie, le score est enregistré dans `localStorage` sous `koi-zen-leaderboard`. Le système conserve les cinq meilleurs scores, les trie par ordre décroissant et affiche les trois premiers dans l’écran de défaite. Aucun compte ni serveur n’est requis.

## Mise à jour QA

| Zone | Vérification | Statut | Preuve |
|---|---|---|---|
| Audio | Bouton volume et déverrouillage après interaction | Pass par implémentation | `KoiAudio` et bouton volume intégrés |
| Musique | Boucle d’ambiance chargée depuis WebDev Storage | Pass | Fichier `/manus-storage/koi_zen_garden_ambient_75a5ab9d.wav` téléversé |
| Bonus | Variétés ivoire, rose et or | Pass | Score et probabilités dans `KoiGame` |
| Classement | Enregistrement en fin de partie et affichage | Pass | Parcours navigateur : score 010 affiché dans le jardin des meilleurs scores |
| Build enrichi | Type-check et production build | Pass | `pnpm check` et `pnpm build` propres |
