import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Pause, Play, RotateCcw, Sparkles } from "lucide-react";
import GameCanvas, { GameCanvasHandle } from "../components/GameCanvas";
import { Direction, KoiSnapshot } from "../game/koiGame";

const directions: { direction: Direction; label: string; icon: typeof ArrowUp }[] = [
  { direction: "up", label: "Monter", icon: ArrowUp },
  { direction: "left", label: "Gauche", icon: ArrowLeft },
  { direction: "down", label: "Descendre", icon: ArrowDown },
  { direction: "right", label: "Droite", icon: ArrowRight },
];

export default function Home() {
  const gameRef = useRef<GameCanvasHandle>(null);
  const [snapshot, setSnapshot] = useState<KoiSnapshot>({ status: "start", snake: [], food: { x: 16, y: 9 }, score: 0, best: 0, speedMs: 148, lastEaten: false, lastCollision: false });
  const demo = new URLSearchParams(window.location.search).has("demo");
  const onStateChange = useCallback((next: KoiSnapshot) => setSnapshot(next), []);

  useEffect(() => {
    const timer = window.setInterval(() => setSnapshot((current) => ({ ...current, lastEaten: false, lastCollision: false })), 500);
    return () => window.clearInterval(timer);
  }, []);

  const statusLabel = snapshot.status === "playing" ? "Le bassin est calme" : snapshot.status === "paused" ? "Pause méditative" : snapshot.status === "gameover" ? "Le koi s’est échoué" : "Prêt à glisser";
  const statusTone = snapshot.status === "gameover" ? "is-danger" : snapshot.status === "paused" ? "is-paused" : "";

  return (
    <main className="zen-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark"><span>鯉</span></div>
          <div>
            <p className="eyebrow">JARDIN D’EAU · 01</p>
            <h1>Koi <em>Zen</em> Snake</h1>
          </div>
        </div>
        <div className="top-actions">
          <span className={`status-pill ${statusTone}`}><span className="status-dot" />{statusLabel}</span>
          <button className="icon-button" aria-label={snapshot.status === "paused" ? "Reprendre" : "Mettre en pause"} onClick={() => gameRef.current?.pause()}>
            {snapshot.status === "paused" ? <Play size={16} /> : <Pause size={16} />}
          </button>
          <button className="icon-button" aria-label="Recommencer" onClick={() => gameRef.current?.restart()}><RotateCcw size={16} /></button>
        </div>
      </header>

      <section className="game-layout">
        <aside className="intro-column">
          <div className="vertical-rule" />
          <p className="section-kicker">Une respiration entre deux vagues</p>
          <h2>Glissez.<br /><span>Grandissez.</span><br />Restez calme.</h2>
          <p className="intro-copy">Guidez votre carpe koï entre les pierres. Chaque lotus la fait grandir — et rétrécit doucement l’espace disponible.</p>
          <div className="legend-card">
            <div className="legend-icon"><Sparkles size={16} /></div>
            <div><strong>Le geste du jour</strong><span>Anticipez le prochain virage.</span></div>
          </div>
          <div className="controls-note"><span className="keycap">WASD</span><span>ou les flèches pour nager</span></div>
        </aside>

        <div className="pond-wrap">
          <div className="pond-frame">
            <GameCanvas ref={gameRef} demo={demo} onStateChange={onStateChange} />
            {snapshot.status === "start" && !demo && <div className="state-overlay start-overlay"><span className="overlay-japanese">静けさ</span><h3>Le bassin vous attend</h3><p>Un mouvement pour commencer votre dérive.</p><button className="primary-button" onClick={() => gameRef.current?.start()}><Play size={15} fill="currentColor" /> Commencer la partie</button></div>}
            {snapshot.status === "paused" && <div className="state-overlay"><span className="overlay-japanese">間</span><h3>Un instant de silence</h3><p>La carpe flotte immobile sous la lune.</p><button className="primary-button" onClick={() => gameRef.current?.pause()}><Play size={15} fill="currentColor" /> Reprendre</button></div>}
            {snapshot.status === "gameover" && <div className="state-overlay gameover-overlay"><span className="overlay-japanese">波紋</span><h3>La vague s’est refermée</h3><p>Votre koi a parcouru {snapshot.score} points de sérénité.</p><button className="primary-button" onClick={() => gameRef.current?.restart()}><RotateCcw size={15} /> Recommencer</button></div>}
            {snapshot.lastEaten && <div className="eat-flash" aria-live="polite">+10 · lotus cueilli</div>}
          </div>
          <div className="pond-caption"><span>EAU CALME · CELLULES {snapshot.snake.length ? `${snapshot.snake.length.toString().padStart(2, "0")} / 24 × 18` : "24 × 18"}</span><span>SAISON · SHŌWA</span></div>
        </div>

        <aside className="score-column">
          <div className="score-block"><span className="score-label">HARMONIE</span><strong>{snapshot.score.toString().padStart(3, "0")}</strong><span className="score-sub">points de sérénité</span></div>
          <div className="score-divider" />
          <div className="mini-stat"><span>MEILLEUR JARDIN</span><strong>{snapshot.best.toString().padStart(3, "0")}</strong></div>
          <div className="mini-stat"><span>LONGUEUR DU KOI</span><strong>{snapshot.snake.length.toString().padStart(2, "0")} <small>écailles</small></strong></div>
          <div className="score-quote">« Le calme est la forme la plus haute de la maîtrise. »</div>
        </aside>
      </section>

      <section className="bottom-bar">
        <div className="touch-pad" aria-label="Contrôles directionnels">
          <span className="touch-spacer" />
          <button onClick={() => gameRef.current?.move("up")} aria-label="Monter"><ArrowUp size={17} /></button>
          <span className="touch-spacer" />
          <button onClick={() => gameRef.current?.move("left")} aria-label="Aller à gauche"><ArrowLeft size={17} /></button>
          <button onClick={() => gameRef.current?.move("down")} aria-label="Descendre"><ArrowDown size={17} /></button>
          <button onClick={() => gameRef.current?.move("right")} aria-label="Aller à droite"><ArrowRight size={17} /></button>
        </div>
        <div className="bottom-tip"><span className="tip-dot" />Collectez les lotus <span className="tip-separator">·</span> évitez les pierres et votre propre sillage</div>
        <div className="demo-note">{demo ? "MODE DÉMO · AUTOPILOTE" : "ESPACE · PAUSE"}</div>
      </section>
    </main>
  );
}
