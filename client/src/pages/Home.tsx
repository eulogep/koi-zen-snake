import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Pause, Play, RotateCcw, Sparkles, Volume2, VolumeX } from "lucide-react";
import GameCanvas, { GameCanvasHandle } from "../components/GameCanvas";
import { FlowerType, KoiSnapshot } from "../game/koiGame";
import { KoiAudio } from "../game/audio";

interface LeaderboardEntry { score: number; date: string; }
const directions = [
  { direction: "up" as const, label: "Monter", icon: ArrowUp },
  { direction: "left" as const, label: "Gauche", icon: ArrowLeft },
  { direction: "down" as const, label: "Descendre", icon: ArrowDown },
  { direction: "right" as const, label: "Droite", icon: ArrowRight },
];
const flowerNames: Record<FlowerType, string> = { white: "lotus ivoire", pink: "lotus rose", gold: "lotus d’or" };
const defaultSnapshot: KoiSnapshot = { status: "start", snake: [], food: { x: 16, y: 9, type: "white", points: 10 }, score: 0, best: 0, speedMs: 148, lastEaten: false, lastPoints: 0, lastFlower: "white", lastCollision: false };

function readLeaderboard(): LeaderboardEntry[] {
  try { return JSON.parse(window.localStorage.getItem("koi-zen-leaderboard") || "[]") as LeaderboardEntry[]; } catch { return []; }
}
function saveLeaderboard(score: number) {
  const next = [...readLeaderboard(), { score, date: new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }) }].sort((a, b) => b.score - a.score).slice(0, 5);
  window.localStorage.setItem("koi-zen-leaderboard", JSON.stringify(next));
  return next;
}

export default function Home() {
  const gameRef = useRef<GameCanvasHandle>(null);
  const audioRef = useRef(new KoiAudio());
  const submittedScoreRef = useRef<number | null>(null);
  const [snapshot, setSnapshot] = useState<KoiSnapshot>(defaultSnapshot);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => readLeaderboard());
  const [soundOn, setSoundOn] = useState(true);
  const [toast, setToast] = useState("");
  const demo = new URLSearchParams(window.location.search).has("demo");

  const onStateChange = useCallback((next: KoiSnapshot) => {
    setSnapshot(next);
    if (next.lastEaten) {
      audioRef.current.playEat(next.lastPoints);
      setToast(`+${next.lastPoints} · ${flowerNames[next.lastFlower]} cueilli`);
      window.setTimeout(() => setToast(""), 900);
    }
    if (next.lastCollision) {
      audioRef.current.playCollision();
      if (submittedScoreRef.current !== next.score) {
        submittedScoreRef.current = next.score;
        setLeaderboard(saveLeaderboard(next.score));
      }
    }
  }, []);

  useEffect(() => {
    const unlock = () => { void audioRef.current.unlock(); };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => { window.removeEventListener("pointerdown", unlock); window.removeEventListener("keydown", unlock); audioRef.current.dispose(); };
  }, []);

  const begin = () => { void audioRef.current.unlock(); gameRef.current?.start(); };
  const restart = () => { submittedScoreRef.current = null; void audioRef.current.unlock(); gameRef.current?.restart(); };
  const toggleSound = () => setSoundOn(audioRef.current.toggle());
  const statusLabel = snapshot.status === "playing" ? "Le bassin est calme" : snapshot.status === "paused" ? "Pause méditative" : snapshot.status === "gameover" ? "Le koi s’est échoué" : "Prêt à glisser";
  const statusTone = snapshot.status === "gameover" ? "is-danger" : snapshot.status === "paused" ? "is-paused" : "";

  return (
    <main className="zen-shell">
      <header className="topbar">
        <div className="brand-lockup"><div className="brand-mark"><span>鯉</span></div><div><p className="eyebrow">JARDIN D’EAU · 01</p><h1>Koi <em>Zen</em> Snake</h1></div></div>
        <div className="top-actions"><span className={`status-pill ${statusTone}`}><span className="status-dot" />{statusLabel}</span><button className="icon-button" aria-label={soundOn ? "Couper le son" : "Activer le son"} onClick={toggleSound}>{soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}</button><button className="icon-button" aria-label={snapshot.status === "paused" ? "Reprendre" : "Mettre en pause"} onClick={() => gameRef.current?.pause()}>{snapshot.status === "paused" ? <Play size={16} /> : <Pause size={16} />}</button><button className="icon-button" aria-label="Recommencer" onClick={restart}><RotateCcw size={16} /></button></div>
      </header>

      <section className="game-layout">
        <aside className="intro-column"><div className="vertical-rule" /><p className="section-kicker">Une respiration entre deux vagues</p><h2>Glissez.<br /><span>Grandissez.</span><br />Restez calme.</h2><p className="intro-copy">Guidez votre carpe koï entre les pierres. Chaque lotus la fait grandir — les fleurs roses et dorées offrent des points bonus.</p><div className="legend-card"><div className="legend-icon"><Sparkles size={16} /></div><div><strong>Le geste du jour</strong><span>Anticipez le prochain virage.</span></div></div><div className="controls-note"><span className="keycap">WASD</span><span>ou les flèches pour nager</span></div></aside>

        <div className="pond-wrap"><div className="pond-frame"><GameCanvas ref={gameRef} demo={demo} onStateChange={onStateChange} />{snapshot.status === "start" && !demo && <div className="state-overlay start-overlay"><span className="overlay-japanese">静けさ</span><h3>Le bassin vous attend</h3><p>Un mouvement pour commencer votre dérive.</p><button className="primary-button" onClick={begin}><Play size={15} fill="currentColor" /> Commencer la partie</button></div>}{snapshot.status === "paused" && <div className="state-overlay"><span className="overlay-japanese">間</span><h3>Un instant de silence</h3><p>La carpe flotte immobile sous la lune.</p><button className="primary-button" onClick={() => gameRef.current?.pause()}><Play size={15} fill="currentColor" /> Reprendre</button></div>}{snapshot.status === "gameover" && <div className="state-overlay gameover-overlay"><span className="overlay-japanese">波紋</span><h3>La vague s’est refermée</h3><p>Votre koi a parcouru {snapshot.score} points de sérénité.</p><div className="leaderboard"><div className="leaderboard-title">JARDIN DES MEILLEURS SCORES</div>{leaderboard.slice(0, 3).map((entry, index) => <div className="leader-row" key={`${entry.date}-${index}`}><span>0{index + 1}</span><strong>{entry.score.toString().padStart(3, "0")}</strong><small>{entry.date}</small></div>)}</div><button className="primary-button" onClick={restart}><RotateCcw size={15} /> Recommencer</button></div>}{toast && <div className="eat-flash" aria-live="polite">{toast}</div>}</div><div className="pond-caption"><span>EAU CALME · CELLULES {snapshot.snake.length ? `${snapshot.snake.length.toString().padStart(2, "0")} / 24 × 18` : "24 × 18"}</span><span>SAISON · SHŌWA</span></div></div>

        <aside className="score-column"><div className="score-block"><span className="score-label">HARMONIE</span><strong>{snapshot.score.toString().padStart(3, "0")}</strong><span className="score-sub">points de sérénité</span></div><div className="score-divider" /><div className="mini-stat"><span>MEILLEUR JARDIN</span><strong>{snapshot.best.toString().padStart(3, "0")}</strong></div><div className="mini-stat"><span>LONGUEUR DU KOI</span><strong>{snapshot.snake.length.toString().padStart(2, "0")} <small>écailles</small></strong></div><div className="score-quote">« Le calme est la forme la plus haute de la maîtrise. »</div></aside>
      </section>

      <section className="bottom-bar"><div className="touch-pad" aria-label="Contrôles directionnels"><span className="touch-spacer" />{directions.slice(0, 1).map(({ direction, label, icon: Icon }) => <button key={direction} onClick={() => gameRef.current?.move(direction)} aria-label={label}><Icon size={17} /></button>)}<span className="touch-spacer" />{directions.slice(1).map(({ direction, label, icon: Icon }) => <button key={direction} onClick={() => gameRef.current?.move(direction)} aria-label={label}><Icon size={17} /></button>)}</div><div className="bottom-tip"><span className="tip-dot" />Lotus ivoire +10 <span className="tip-separator">·</span> rose +20 <span className="tip-separator">·</span> or +35</div><div className="credits"><span>CRÉÉ PAR EULOGE</span><span>{demo ? "MODE DÉMO · AUTOPILOTE" : "ESPACE · PAUSE"}</span></div></section>
    </main>
  );
}
