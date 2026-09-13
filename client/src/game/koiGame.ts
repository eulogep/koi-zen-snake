export type Direction = "up" | "down" | "left" | "right";
export type GameStatus = "start" | "playing" | "paused" | "gameover";
export type FlowerType = "white" | "pink" | "gold";

export interface Cell { x: number; y: number; }
export interface Flower { x: number; y: number; type: FlowerType; points: number; }
export interface KoiSnapshot {
  status: GameStatus;
  snake: Cell[];
  food: Flower;
  score: number;
  best: number;
  speedMs: number;
  lastEaten: boolean;
  lastPoints: number;
  lastFlower: FlowerType;
  lastCollision: boolean;
}

const OPPOSITE: Record<Direction, Direction> = { up: "down", down: "up", left: "right", right: "left" };
const DELTA: Record<Direction, Cell> = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
const FLOWERS: Record<FlowerType, { points: number; chance: number }> = {
  white: { points: 10, chance: 0.58 },
  pink: { points: 20, chance: 0.29 },
  gold: { points: 35, chance: 0.13 },
};
const sameCell = (a: Cell, b: Cell) => a.x === b.x && a.y === b.y;

export class KoiGame {
  readonly cols = 24;
  readonly rows = 18;
  readonly demo: boolean;
  private snake: Cell[] = [];
  private direction: Direction = "right";
  private queuedDirection: Direction = "right";
  private food: Flower = { x: 16, y: 9, type: "white", points: 10 };
  private score = 0;
  private best = 0;
  private status: GameStatus = "start";
  private rng = 20260913;
  private lastEaten = false;
  private lastPoints = 0;
  private lastFlower: FlowerType = "white";
  private lastCollision = false;

  constructor(demo = false) {
    this.demo = demo;
    this.best = Number(window.localStorage.getItem("koi-zen-best") || 0);
    this.reset();
  }

  reset() {
    this.snake = [{ x: 8, y: 9 }, { x: 7, y: 9 }, { x: 6, y: 9 }];
    this.direction = "right";
    this.queuedDirection = "right";
    this.food = { x: 16, y: 9, type: "white", points: 10 };
    this.score = 0;
    this.status = "start";
    this.lastEaten = false;
    this.lastPoints = 0;
    this.lastFlower = "white";
    this.lastCollision = false;
  }

  start() { if (this.status === "start") this.status = "playing"; }
  togglePause() { if (this.status === "playing") this.status = "paused"; else if (this.status === "paused") this.status = "playing"; }
  setDirection(next: Direction) {
    if (this.status === "start") this.start();
    if (this.status === "playing" && next !== OPPOSITE[this.direction]) this.queuedDirection = next;
  }
  restart() { this.reset(); this.start(); }

  getSnapshot(): KoiSnapshot {
    return {
      status: this.status, snake: this.snake.map((cell) => ({ ...cell })), food: { ...this.food }, score: this.score,
      best: this.best, speedMs: Math.max(108, 148 - Math.floor(this.score / 50) * 8), lastEaten: this.lastEaten,
      lastPoints: this.lastPoints, lastFlower: this.lastFlower, lastCollision: this.lastCollision,
    };
  }

  step() {
    this.lastEaten = false;
    this.lastPoints = 0;
    this.lastCollision = false;
    if (this.status !== "playing") return;
    if (this.demo) this.autoPilot();
    this.direction = this.queuedDirection;
    const head = this.snake[0];
    const delta = DELTA[this.direction];
    const nextHead = { x: head.x + delta.x, y: head.y + delta.y };
    const eating = sameCell(nextHead, this.food);
    const collisionBody = this.snake.some((cell, index) => index < (eating ? this.snake.length : this.snake.length - 1) && sameCell(cell, nextHead));
    if (nextHead.x < 0 || nextHead.x >= this.cols || nextHead.y < 0 || nextHead.y >= this.rows || collisionBody) {
      this.status = "gameover";
      this.lastCollision = true;
      return;
    }
    this.snake.unshift(nextHead);
    if (eating) {
      this.lastPoints = this.food.points;
      this.lastFlower = this.food.type;
      this.score += this.food.points;
      this.lastEaten = true;
      if (this.score > this.best) {
        this.best = this.score;
        window.localStorage.setItem("koi-zen-best", String(this.best));
      }
      this.placeFood();
    } else this.snake.pop();
  }

  private placeFood() {
    for (let tries = 0; tries < 500; tries += 1) {
      const candidate = { x: this.randomInt(this.cols), y: this.randomInt(this.rows) };
      if (!this.snake.some((cell) => sameCell(cell, candidate))) {
        const roll = this.rng / 4294967296;
        const type: FlowerType = roll < FLOWERS.gold.chance ? "gold" : roll < FLOWERS.gold.chance + FLOWERS.pink.chance ? "pink" : "white";
        this.food = { ...candidate, type, points: FLOWERS[type].points };
        return;
      }
    }
    this.food = { x: 16, y: 3, type: "white", points: 10 };
  }

  private randomInt(max: number) { this.rng = (this.rng * 1664525 + 1013904223) >>> 0; return Math.floor((this.rng / 4294967296) * max); }
  private autoPilot() {
    const options: Direction[] = ["up", "right", "down", "left"];
    options.sort((a, b) => this.distanceAfter(a) - this.distanceAfter(b));
    const safe = options.find((option) => this.isSafe(option));
    if (safe) this.queuedDirection = safe;
  }
  private distanceAfter(direction: Direction) { const delta = DELTA[direction]; return Math.abs(this.food.x - (this.snake[0].x + delta.x)) + Math.abs(this.food.y - (this.snake[0].y + delta.y)); }
  private isSafe(direction: Direction) {
    const delta = DELTA[direction];
    const next = { x: this.snake[0].x + delta.x, y: this.snake[0].y + delta.y };
    return next.x >= 0 && next.x < this.cols && next.y >= 0 && next.y < this.rows && !this.snake.slice(0, -1).some((cell) => sameCell(cell, next));
  }
}
