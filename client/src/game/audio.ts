const MUSIC_URL = "/manus-storage/koi_zen_garden_ambient_75a5ab9d.wav";

export class KoiAudio {
  private context: AudioContext | null = null;
  private music: HTMLAudioElement | null = null;
  private enabled = true;
  private ready = false;

  async unlock() {
    if (!this.enabled) return;
    if (!this.context) this.context = new AudioContext();
    if (this.context.state === "suspended") await this.context.resume();
    if (!this.music) {
      this.music = new Audio(MUSIC_URL);
      this.music.loop = true;
      this.music.volume = 0.17;
      this.music.preload = "auto";
    }
    if (this.music.paused) void this.music.play().catch(() => undefined);
    this.ready = true;
  }

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) this.music?.pause();
    else void this.unlock();
    return this.enabled;
  }

  isEnabled() { return this.enabled; }

  playEat(points = 10) {
    if (!this.ready || !this.context || !this.enabled) return;
    const now = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = points >= 35 ? "sine" : "triangle";
    osc.frequency.setValueAtTime(points >= 35 ? 520 : 440, now);
    osc.frequency.exponentialRampToValueAtTime(points >= 35 ? 880 : 660, now + 0.28);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(points >= 35 ? 0.1 : 0.065, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
    osc.connect(gain).connect(this.context.destination);
    osc.start(now);
    osc.stop(now + 0.44);
  }

  playTurn() {
    if (!this.ready || !this.context || !this.enabled) return;
    const now = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = "sine";
    osc.frequency.value = 185;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.018, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    osc.connect(gain).connect(this.context.destination);
    osc.start(now);
    osc.stop(now + 0.14);
  }

  playPause() {
    if (!this.ready || !this.context || !this.enabled) return;
    const now = this.context.currentTime;
    [261.63, 392, 523.25].forEach((frequency, index) => {
      const osc = this.context!.createOscillator();
      const gain = this.context!.createGain();
      osc.type = "sine";
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, now + index * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.035, now + index * 0.08 + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 0.62);
      osc.connect(gain).connect(this.context!.destination);
      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.66);
    });
  }

  playCollision() {
    if (!this.ready || !this.context || !this.enabled) return;
    const now = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.34);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.06, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
    osc.connect(gain).connect(this.context.destination);
    osc.start(now);
    osc.stop(now + 0.44);
  }

  dispose() { this.music?.pause(); this.music = null; void this.context?.close(); this.context = null; }
}
