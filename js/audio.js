/**
 * Kozminski Escape: Polowanie na ECTS
 * Moduł dźwiękowy (js/audio.js)
 * Czysty Web Audio API (brak zewnętrznych plików audio .mp3/.wav!)
 * 8-bitowe syntezowane efekty retro arcade
 */

class SoundSystem {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.initialized = false;
  }

  // Inicjalizacja AudioContext (wywoływana przy pierwszej interakcji)
  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.initialized = true;
      }
    } catch (e) {
      console.warn('Web Audio API niedostępne w tej przeglądarce:', e);
    }
  }

  // Upewnienie się, że kontekst jest aktywny po kliknięciu użytkownika
  ensureContext() {
    if (!this.initialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Wyciszanie / odciszanie dźwięku
  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  // Główna metoda odtwarzania efektów retro
  play(type) {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    switch (type) {
      case 'ects':
        this._playEcts();
        break;
      case 'coffee':
        this._playCoffee();
        break;
      case 'shield':
        this._playShield();
        break;
      case 'freeze':
        this._playFreeze();
        break;
      case 'hit':
        this._playHit();
        break;
      case 'win':
        this._playWin();
        break;
      default:
        console.warn(`SoundSystem: Nieznany typ dźwięku "${type}"`);
    }
  }

  // 1. 'ects': melodyjny dwuton monety (fala trójkątna)
  _playEcts() {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    // Pierwszy ton (B5: 987.77 Hz), po 0.07s przeskok na wysoki ton (E6: 1318.51 Hz)
    osc.frequency.setValueAtTime(987.77, now);
    osc.frequency.setValueAtTime(1318.51, now + 0.07);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.setValueAtTime(0.25, now + 0.07);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.29);
  }

  // 2. 'coffee': dźwięk przyspieszenia (rosnąca częstotliwość fali piłokształtnej)
  _playCoffee() {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    // Płynny sweep od 180 Hz do 950 Hz symulujący zryw turbo
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(950, now + 0.32);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  // 3. 'shield': aktywacja legitymacji studenckiej (akord sinusoidalny)
  _playShield() {
    const now = this.ctx.currentTime;
    // Harmonijny akord durowy C-dur (C5, E5, G5, C6) z miękką falą sinusoidalną
    const chordFrequencies = [523.25, 659.25, 783.99, 1046.50];

    chordFrequencies.forEach(freq => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.05); // Miękki atak tarczy
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.46);
    });
  }

  // 4. 'freeze': cyber-freeze AI po zadanym pytaniu (fala prostokątna)
  _playFreeze() {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    // Cybernetyczne, schodkowe zmiany częstotliwości w stylu 8-bit chiptune
    const stepDuration = 0.05;
    const freqs = [1400, 950, 1600, 700, 1200, 500];

    freqs.forEach((f, idx) => {
      osc.frequency.setValueAtTime(f, now + idx * stepDuration);
    });

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + freqs.length * stepDuration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + freqs.length * stepDuration + 0.02);
  }

  // 5. 'hit': złapanie przez egzaminatora (dramatycznie opadający bas)
  _playHit() {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    // Dramatyczny zjazd basu od 260 Hz w dół do 35 Hz
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.45);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.49);
  }

  // 6. 'win': krótka, 4-tonowa fanfara sukcesu
  _playWin() {
    const now = this.ctx.currentTime;
    // 4-tonowa fanfara: C5 -> E5 -> G5 -> C6 (z dłuższą wybrzmiewającą końcówką)
    const fanfare = [
      { f: 523.25, t: 0.0, d: 0.12 },
      { f: 659.25, t: 0.12, d: 0.12 },
      { f: 783.99, t: 0.24, d: 0.14 },
      { f: 1046.50, t: 0.38, d: 0.45 }
    ];

    fanfare.forEach(note => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, now + note.t);

      gain.gain.setValueAtTime(0.24, now + note.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + note.t);
      osc.stop(now + note.t + note.d + 0.02);
    });
  }
}

// Globalny obiekt SoundSystem zgodny z wymaganiami gry
window.SoundSystem = new SoundSystem();
window.gameAudio = window.SoundSystem; // Zachowanie wstecznej kompatybilności
