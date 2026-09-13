import { Engine } from "@babylonjs/core/Engines/engine";
import { useEffect, useImperativeHandle, useRef, forwardRef } from "react";
import { createGameScene } from "../game/scene";
import { Direction, KoiGame, KoiSnapshot } from "../game/koiGame";

export interface GameCanvasHandle {
  move(direction: Direction): void;
  pause(): void;
  restart(): void;
  start(): void;
}

interface Props {
  demo?: boolean;
  onStateChange: (snapshot: KoiSnapshot) => void;
}

const GameCanvas = forwardRef<GameCanvasHandle, Props>(({ demo = false, onStateChange }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<KoiGame | null>(null);
  const stateRef = useRef<KoiSnapshot | null>(null);

  useImperativeHandle(ref, () => ({
    move: (direction) => gameRef.current?.setDirection(direction),
    pause: () => gameRef.current?.togglePause(),
    restart: () => gameRef.current?.restart(),
    start: () => gameRef.current?.start(),
  }), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true }, true);
    engine.setHardwareScalingLevel(Math.min(1.5, window.devicePixelRatio || 1));
    const game = new KoiGame(demo);
    gameRef.current = game;
    let disposed = false;
    let elapsed = 0;

    const boot = async () => {
      const handle = await createGameScene(engine, canvas);
      if (disposed) {
        handle.dispose();
        engine.dispose();
        return;
      }
      const emit = () => {
        const snapshot = game.getSnapshot();
        stateRef.current = snapshot;
        onStateChange(snapshot);
        handle.sync(snapshot);
      };
      emit();
      if (demo) game.start();
      const keydown = (event: KeyboardEvent) => {
        const keyMap: Record<string, Direction> = { ArrowUp: "up", w: "up", W: "up", ArrowDown: "down", s: "down", S: "down", ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right" };
        const direction = keyMap[event.key];
        if (direction) {
          event.preventDefault();
          game.setDirection(direction);
        } else if (event.key === " " || event.key.toLowerCase() === "p") {
          event.preventDefault();
          game.togglePause();
          emit();
        } else if (event.key.toLowerCase() === "r") {
          event.preventDefault();
          game.restart();
          emit();
        }
      };
      window.addEventListener("keydown", keydown, { passive: false });
      const resize = () => engine.resize();
      window.addEventListener("resize", resize);

      engine.runRenderLoop(() => {
        if (disposed) return;
        const dt = engine.getDeltaTime();
        elapsed += dt;
        const snapshot = game.getSnapshot();
        if (snapshot.status === "playing" && elapsed >= snapshot.speedMs) {
          elapsed = 0;
          game.step();
          emit();
          if (game.getSnapshot().lastEaten || game.getSnapshot().lastCollision) elapsed = 0;
        }
        handle.scene.render();
      });

      return () => {
        window.removeEventListener("keydown", keydown);
        window.removeEventListener("resize", resize);
        handle.dispose();
        engine.stopRenderLoop();
        engine.dispose();
      };
    };

    let cleanup: (() => void) | undefined;
    void boot().then((result) => { cleanup = result; });
    return () => {
      disposed = true;
      cleanup?.();
      gameRef.current = null;
    };
  }, [demo, onStateChange]);

  return <canvas ref={canvasRef} className="game-canvas" aria-label="Bassin zen interactif du jeu Koi Zen Snake" />;
});

GameCanvas.displayName = "GameCanvas";
export default GameCanvas;
