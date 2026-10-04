/**
 * Kozminski Escape: Polowanie na ECTS
 * Serce gry (js/game.js)
 * Akademia Leona Koźmińskiego (ALK) w Warszawie
 */

(function () {
  'use strict';

  // --- Elementy DOM ---
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');

  // Pasek HUD
  const ectsCounterEl = document.getElementById('ects-counter');
  const ectsProgressBarEl = document.getElementById('ects-progress-bar');
  const staminaBarEl = document.getElementById('stamina-bar');
  const staminaPercentEl = document.getElementById('stamina-percent');
  const staminaStatusEl = document.getElementById('stamina-status');
  const campusZoneNameEl = document.getElementById('campus-zone-name');
  const professorDistanceStatusEl = document.getElementById('professor-distance-status');

  // Dymek profesora
  const professorBubbleEl = document.getElementById('professor-bubble');
  const professorSpeechTextEl = document.getElementById('professor-speech-text');

  // Ekrany modalne
  const startModalEl = document.getElementById('start-modal');
  const gameoverModalEl = document.getElementById('gameover-modal');
  const victoryModalEl = document.getElementById('victory-modal');
  const pauseModalEl = document.getElementById('pause-modal');

  // Metryki na ekranach końcowych
  const finalEctsLostEl = document.getElementById('final-ects-lost');
  const survivalTimeLostEl = document.getElementById('survival-time-lost');
  const defeatQuoteTextEl = document.getElementById('defeat-quote-text');
  const victoryTimeEl = document.getElementById('victory-time');
  const victoryGradeEl = document.getElementById('victory-grade');

  // Przyciski interfejsu
  const btnStartGame = document.getElementById('btn-start-game');
  const btnRetryGame = document.getElementById('btn-retry-game');
  const btnRestartVictory = document.getElementById('btn-restart-victory');
  const btnResumeGame = document.getElementById('btn-resume-game');
  const btnSoundToggle = document.getElementById('btn-sound-toggle');
  const soundIconEl = document.getElementById('sound-icon');
  const btnPauseToggle = document.getElementById('btn-pause-toggle');
  const btnRulesToggle = document.getElementById('btn-rules-toggle');
  const btnArtillery = document.getElementById('btn-artillery');

  // Wirtualne przyciski dotykowe (Mobile)
  const touchUp = document.getElementById('touch-up');
  const touchDown = document.getElementById('touch-down');
  const touchLeft = document.getElementById('touch-left');
  const touchRight = document.getElementById('touch-right');
  const touchSprint = document.getElementById('touch-sprint');
  const touchInteract = document.getElementById('touch-interact');

  // --- Stałe gry ---
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 540;
  const TARGET_ECTS = 30;

  // Cytaty akademickie profesora
  const PROFESSOR_QUOTES = [
    '„A gdzie przypis harwardzki?!”',
    '„Ten bilans się nie zamyka!”',
    '„Widzę Pana we wrześniu!”',
    '„USOS właśnie zamknął protokół!”',
    '„Czy ten esej pisał Pan, czy ChatGPT?!”',
    '„Proszę natychmiast podejść z indeksem do katedry!”',
    '„Krzywa popytu nie ma takiego nachylenia!”'
  ];

  // 1. UKŁAD KAMPUSU ALK NA CANVASIE:
  // Aule z podpisami: „Aula A”, „Biblioteka”, „Dziekanat”, „Lab Komputerowy”, centrum: „Patio ALK 🌿”
  const CAMPUS_ZONES = [
    { id: 'patio', name: 'Patio ALK 🌿', x: 270, y: 150, w: 260, h: 240, color: 'rgba(16, 185, 129, 0.12)' },
    { id: 'aula_a', name: 'Aula A', x: 30, y: 30, w: 220, h: 180, color: 'rgba(0, 75, 135, 0.1)' },
    { id: 'biblioteka', name: 'Biblioteka', x: 550, y: 30, w: 220, h: 180, color: 'rgba(242, 169, 0, 0.08)' },
    { id: 'dziekanat', name: 'Dziekanat', x: 30, y: 330, w: 220, h: 180, color: 'rgba(0, 34, 68, 0.25)' },
    { id: 'lab', name: 'Lab Komputerowy', x: 550, y: 330, w: 220, h: 180, color: 'rgba(37, 99, 235, 0.1)' }
  ];

  // Ściany budynków i przegrody korytarzy z zachowaniem przejść (drzwi)
  const WALLS = [
    // Zewnętrzne granice kampusu
    { x: 10, y: 10, w: 780, h: 12 },
    { x: 10, y: 518, w: 780, h: 12 },
    { x: 10, y: 10, w: 12, h: 520 },
    { x: 778, y: 10, w: 12, h: 520 },

    // Ściany Auli A (Góra-Lewo) - wejście od dołu i od prawej
    { x: 250, y: 10, w: 12, h: 130 },
    { x: 10, y: 210, w: 160, h: 12 },

    // Ściany Biblioteki (Góra-Prawo) - wejście od dołu i od lewej
    { x: 538, y: 10, w: 12, h: 130 },
    { x: 630, y: 210, w: 160, h: 12 },

    // Ściany Dziekanatu (Dół-Lewo) - wejście od góry i od prawej
    { x: 10, y: 318, w: 160, h: 12 },
    { x: 250, y: 400, w: 12, h: 130 },

    // Ściany Labu Komputerowego (Dół-Prawo) - wejście od góry i od lewej
    { x: 630, y: 318, w: 160, h: 12 },
    { x: 538, y: 400, w: 12, h: 130 },

    // Pergole i murki wokół Patio ALK 🌿 (z czterema szerokimi przejściami)
    { x: 270, y: 150, w: 80, h: 10 },
    { x: 450, y: 150, w: 80, h: 10 },
    { x: 270, y: 380, w: 80, h: 10 },
    { x: 450, y: 380, w: 80, h: 10 },
    { x: 270, y: 150, w: 10, h: 70 },
    { x: 270, y: 320, w: 10, h: 70 },
    { x: 520, y: 150, w: 10, h: 70 },
    { x: 520, y: 320, w: 10, h: 70 }
  ];

  // --- Stan gry ---
  let gameState = 'START'; // 'START' | 'PLAYING' | 'PAUSED' | 'DEFEAT' | 'VICTORY'
  let ects = 0;
  let stamina = 100;
  let isSprinting = false;
  let coffeeBoostTimer = 0;       // 5s turbo-szybkości
  let professorFreezeTimer = 0;   // 3.5s cyber-freeze Gemini AI
  let hasShield = false;          // Tarcza z Legitymacji ALK
  let invulnerableTimer = 0;      // Chwilowa nietykalność po uderzeniu w tarczę
  let artilleryCooldown = 0;      // Cooldown artylerii ratunkowej (900 klatek = 15s)
  let statusText = '';            // Dynamiczny tekst statusu (np. Artyleria)
  let statusTextTimer = 0;        // Czas wyświetlania statusText
  let gameStartTime = 0;
  let elapsedTime = 0;
  let quoteTimer = 0;
  let currentQuoteIndex = 0;

  // Cząsteczki wizualne i teksty popup
  let particles = [];
  let floatingTexts = [];

  // Przedmioty na mapie (ECTS, Kawa, Gemini AI, Legitymacja ALK)
  let items = [];

  // Gracz (Student)
  const player = {
    x: 400,
    y: 270,
    radius: 14,
    baseSpeed: 3.1,
    sprintSpeed: 5.4,
    angle: 0,
    moving: false,
    frame: 0
  };

  // Przeciwnik (Egzaminator)
  const professor = {
    x: 80,
    y: 80,
    radius: 16,
    baseSpeed: 1.85,
    speed: 1.85,
    angle: 0,
    shakeEffect: 0
  };

  // Stan klawiatury
  const keys = {
    up: false,
    down: false,
    left: false,
    right: false,
    sprint: false
  };

  // --- Audio Helper bezpiecznie integrujący SoundSystem ---
  function playSound(type) {
    if (window.SoundSystem && typeof window.SoundSystem.play === 'function') {
      window.SoundSystem.play(type);
    }
  }

  // --- Kolizje ze ścianami ---
  function isCollidingWithWalls(x, y, radius) {
    for (let i = 0; i < WALLS.length; i++) {
      const w = WALLS[i];
      const closestX = Math.max(w.x, Math.min(x, w.x + w.w));
      const closestY = Math.max(w.y, Math.min(y, w.y + w.h));
      const distX = x - closestX;
      const distY = y - closestY;
      if ((distX * distX + distY * distY) < (radius * radius)) {
        return true;
      }
    }
    return false;
  }

  // Losowanie bezpiecznej pozycji poza ścianami
  function getValidSpawnPosition(margin = 25) {
    let attempts = 0;
    while (attempts < 200) {
      attempts++;
      const rx = margin + Math.random() * (CANVAS_WIDTH - 2 * margin);
      const ry = margin + Math.random() * (CANVAS_HEIGHT - 2 * margin);

      if (!isCollidingWithWalls(rx, ry, margin)) {
        return { x: rx, y: ry };
      }
    }
    // Bezpieczna pozycja domyślna w korytarzu
    return { x: 400, y: 100 };
  }

  // --- Spawn przedmiotów (losowy poza ścianami) ---
  function spawnInitialItems() {
    items = [];

    // 1. Zwoje ECTS (📜) - 8 początkowych zwojów na mapie
    for (let i = 0; i < 8; i++) {
      spawnItem('ects');
    }

    // 2. Kawa z Patio ALK (☕) - 3 kawy
    for (let i = 0; i < 3; i++) {
      spawnItem('coffee');
    }

    // 3. Gemini AI (💻) - 2 laptopy
    for (let i = 0; i < 2; i++) {
      spawnItem('gemini');
    }

    // 4. Legitymacja ALK (🪪) - 2 tarcze ochronne
    for (let i = 0; i < 2; i++) {
      spawnItem('shield');
    }
  }

  function spawnItem(type) {
    let pos;
    // Kawa preferuje pojawianie się na Patio ALK lub w korytarzu
    if (type === 'coffee' && Math.random() < 0.6) {
      pos = {
        x: 320 + Math.random() * 160,
        y: 200 + Math.random() * 140
      };
      if (isCollidingWithWalls(pos.x, pos.y, 20)) {
        pos = getValidSpawnPosition();
      }
    } else {
      pos = getValidSpawnPosition();
    }

    items.push({
      type: type, // 'ects' | 'coffee' | 'gemini' | 'shield'
      x: pos.x,
      y: pos.y,
      radius: 12,
      bounceOffset: Math.random() * Math.PI * 2
    });
  }

  // --- Resetowanie gry ---
  function resetGame() {
    ects = 0;
    stamina = 100;
    coffeeBoostTimer = 0;
    professorFreezeTimer = 0;
    hasShield = false;
    invulnerableTimer = 0;
    artilleryCooldown = 0;
    statusText = '';
    statusTextTimer = 0;
    if (btnArtillery) {
      btnArtillery.disabled = false;
      btnArtillery.textContent = '💣 Wprowadź Artylerię (R)';
    }
    gameStartTime = Date.now();
    elapsedTime = 0;
    quoteTimer = 0;

    particles = [];
    floatingTexts = [];

    // Pozycja startowa studenta: w centrum Patio
    player.x = 400;
    player.y = 270;
    player.angle = 0;
    player.moving = false;

    // Pozycja startowa profesora: w Auli A
    professor.x = 80;
    professor.y = 80;
    professor.speed = professor.baseSpeed;

    spawnInitialItems();
    updateHUD();
    setSpeechQuote('„A gdzie przypis harwardzki?!”');
  }

  // --- Formatowanie czasu MM:SS ---
  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  // --- Dymek profesora ---
  function setSpeechQuote(quote) {
    if (professorSpeechTextEl) {
      professorSpeechTextEl.textContent = quote;
    }
    if (professorBubbleEl) {
      professorBubbleEl.classList.remove('hidden');
      // Ponowne uruchomienie animacji wyskakiwania
      professorBubbleEl.style.animation = 'none';
      void professorBubbleEl.offsetWidth;
      professorBubbleEl.style.animation = 'bubblePop 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
    }
  }

  // --- Obsługa klawiatury (WASD / Strzałki / Shift / Spacja / P) ---
  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyW' || e.code === 'ArrowUp') { keys.up = true; e.preventDefault(); }
    if (e.code === 'KeyS' || e.code === 'ArrowDown') { keys.down = true; e.preventDefault(); }
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') { keys.left = true; e.preventDefault(); }
    if (e.code === 'KeyD' || e.code === 'ArrowRight') { keys.right = true; e.preventDefault(); }

    // Wymaganie 2: Sprint pod Spacją LUB Shiftem
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'Space') {
      keys.sprint = true;
      e.preventDefault();
    }

    // Klawisz R: Wprowadź Artylerię
    if (e.code === 'KeyR') {
      fireArtillery();
      e.preventDefault();
    }

    if (e.code === 'KeyP') { togglePause(); }
  });

  window.addEventListener('keyup', (e) => {
    if (e.code === 'KeyW' || e.code === 'ArrowUp') { keys.up = false; }
    if (e.code === 'KeyS' || e.code === 'ArrowDown') { keys.down = false; }
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') { keys.left = false; }
    if (e.code === 'KeyD' || e.code === 'ArrowRight') { keys.right = false; }

    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'Space') {
      keys.sprint = false;
    }
  });

  // --- Wirtualne przyciski dotykowe (Mobile) ---
  function bindTouch(btn, onStart, onEnd) {
    if (!btn) return;
    const startHandler = (e) => {
      e.preventDefault();
      window.SoundSystem?.init();
      onStart();
    };
    const endHandler = (e) => {
      e.preventDefault();
      onEnd();
    };
    btn.addEventListener('touchstart', startHandler, { passive: false });
    btn.addEventListener('touchend', endHandler, { passive: false });
    btn.addEventListener('mousedown', startHandler);
    btn.addEventListener('mouseup', endHandler);
    btn.addEventListener('mouseleave', endHandler);
  }

  bindTouch(touchUp, () => { keys.up = true; }, () => { keys.up = false; });
  bindTouch(touchDown, () => { keys.down = true; }, () => { keys.down = false; });
  bindTouch(touchLeft, () => { keys.left = true; }, () => { keys.left = false; });
  bindTouch(touchRight, () => { keys.right = true; }, () => { keys.right = false; });
  bindTouch(touchSprint, () => { keys.sprint = true; }, () => { keys.sprint = false; });
  bindTouch(touchInteract, () => { keys.sprint = true; }, () => { keys.sprint = false; });

  // --- Kontrola UI i Modali ---
  btnSoundToggle?.addEventListener('click', () => {
    window.SoundSystem?.init();
    const isMuted = window.SoundSystem ? window.SoundSystem.toggleMute() : false;
    if (soundIconEl) soundIconEl.textContent = isMuted ? '🔇' : '🔊';
  });

  function togglePause() {
    if (gameState === 'PLAYING') {
      gameState = 'PAUSED';
      pauseModalEl?.classList.remove('hidden');
    } else if (gameState === 'PAUSED') {
      gameState = 'PLAYING';
      pauseModalEl?.classList.add('hidden');
    }
  }

  btnPauseToggle?.addEventListener('click', togglePause);
  btnResumeGame?.addEventListener('click', togglePause);

  btnRulesToggle?.addEventListener('click', () => {
    if (gameState === 'PLAYING') gameState = 'PAUSED';
    startModalEl?.classList.remove('hidden');
  });

  btnStartGame?.addEventListener('click', () => {
    window.SoundSystem?.init();
    startModalEl?.classList.add('hidden');
    resetGame();
    gameState = 'PLAYING';
  });

  btnRetryGame?.addEventListener('click', () => {
    window.SoundSystem?.init();
    gameoverModalEl?.classList.add('hidden');
    resetGame();
    gameState = 'PLAYING';
  });

  btnRestartVictory?.addEventListener('click', () => {
    window.SoundSystem?.init();
    victoryModalEl?.classList.add('hidden');
    resetGame();
    gameState = 'PLAYING';
  });

  // Obsługa kliknięcia przycisku artylerii
  btnArtillery?.addEventListener('click', (e) => {
    e.preventDefault();
    fireArtillery();
  });

  // --------------------------------------------------------------------------
  // ARTYLERIA DZIEKAŃSKA (Przycisk ratunkowy / Klawisz R):
  // - Odrzuca profesora do kąta mapy (x: 60, y: 60)
  // - Ogłusza profesora na 3 sekundy (freezeTimer = 180)
  // - Dźwięk wybuchu 'explosion', dymek z cytatem i statusText
  // - Cooldown 900 klatek (15s) z odliczaniem na przycisku
  // --------------------------------------------------------------------------
  function fireArtillery() {
    // Jeśli gra nie trwa lub cooldown > 0 -> nic nie rób
    if (gameState !== 'PLAYING' || artilleryCooldown > 0) return;

    // Uruchom dźwięk SoundSystem.play('explosion')
    if (typeof SoundSystem !== 'undefined' && typeof SoundSystem.play === 'function') {
      SoundSystem.play('explosion');
    } else {
      playSound('explosion');
    }

    // Natychmiast cofnij profesora do kąta mapy (x: 60, y: 60)
    professor.x = 60;
    professor.y = 60;

    // Ogłusz profesora na 3 sekundy (freezeTimer = 180)
    professorFreezeTimer = 180;
    const freezeTimer = 180;
    professor.freezeTimer = 180;

    // Wyświetl nad nim dymek: 'Moje arkusze ocen! Odrzuciło mnie do kąta!'
    setSpeechQuote('Moje arkusze ocen! Odrzuciło mnie do kąta!');
    quoteTimer = 0;

    // Zmień statusText na '💥 ARTYLERIA DZIEKAŃSKA TRAFIŁA!' w kolorze czerwonym
    statusText = '💥 ARTYLERIA DZIEKAŃSKA TRAFIŁA!';
    statusTextTimer = 180; // 3 sekundy przy 60 FPS
    if (professorDistanceStatusEl) {
      professorDistanceStatusEl.textContent = statusText;
      professorDistanceStatusEl.style.color = '#ef4444';
      professorDistanceStatusEl.className = 'radar-status';
    }

    // Dodaj efektowne cząsteczki eksplozji i pływający tekst
    addFloatingText(60, 40, statusText, '#ef4444');
    for (let i = 0; i < 30; i++) {
      const pAngle = Math.random() * Math.PI * 2;
      const pSpeed = 2 + Math.random() * 5.5;
      particles.push({
        x: 60,
        y: 60,
        vx: Math.cos(pAngle) * pSpeed,
        vy: Math.sin(pAngle) * pSpeed,
        color: ['#ef4444', '#f59e0b', '#fbbf24', '#dc2626'][Math.floor(Math.random() * 4)],
        radius: 3 + Math.random() * 4,
        life: 40 + Math.random() * 20
      });
    }

    // Ustaw artilleryCooldown = 900 (15 sekund przy 60 FPS)
    artilleryCooldown = 900;
    if (btnArtillery) {
      btnArtillery.disabled = true;
      btnArtillery.textContent = '💣 Odnawianie... 15s';
    }
  }

  function updateArtillery() {
    if (artilleryCooldown > 0) {
      artilleryCooldown--;
      const secondsLeft = Math.ceil(artilleryCooldown / 60);
      if (btnArtillery) {
        btnArtillery.disabled = true;
        btnArtillery.textContent = `💣 Odnawianie... ${secondsLeft}s`;
      }
    } else {
      if (btnArtillery && btnArtillery.disabled) {
        btnArtillery.disabled = false;
        btnArtillery.textContent = '💣 Wprowadź Artylerię (R)';
      }
    }
  }

  // --------------------------------------------------------------------------
  // 2. LOGIKA GRACZA (STUDENT):
  // - Ruch wektorowy (WASD / Strzałki / Dotyk)
  // - Sprint pod Spacją / Shiftem zużywający energię (staminę)
  // --------------------------------------------------------------------------
  function updatePlayer() {
    let dirX = 0;
    let dirY = 0;

    if (keys.up) dirY -= 1;
    if (keys.down) dirY += 1;
    if (keys.left) dirX -= 1;
    if (keys.right) dirX += 1;

    player.moving = (dirX !== 0 || dirY !== 0);

    // Normalizacja wektora ruchu (aby ruch na ukos nie był szybszy)
    if (dirX !== 0 && dirY !== 0) {
      const len = Math.hypot(dirX, dirY);
      dirX /= len;
      dirY /= len;
    }

    // Sprint & Stamina pod Spacją/Shiftem
    if (keys.sprint && player.moving && stamina > 0) {
      isSprinting = true;
      stamina = Math.max(0, stamina - 0.45);
      if (Math.random() < 0.3) {
        addDustParticle(player.x, player.y + 8);
      }
    } else {
      isSprinting = false;
      stamina = Math.min(100, stamina + (player.moving ? 0.16 : 0.38));
    }

    // Wyznaczenie aktualnej prędkości (z uwzględnieniem Turbo-Kawy z Patio)
    let speed = isSprinting ? player.sprintSpeed : player.baseSpeed;
    if (coffeeBoostTimer > 0) {
      speed *= 1.35; // 5s turbo-szybkości
      coffeeBoostTimer--;
      if (Math.random() < 0.4) {
        addCoffeeSparkle(player.x, player.y);
      }
    }

    if (invulnerableTimer > 0) {
      invulnerableTimer--;
    }

    const nextX = player.x + dirX * speed;
    const nextY = player.y + dirY * speed;

    if (player.moving) {
      player.angle = Math.atan2(dirY, dirX);
      player.frame += 0.2;
    }

    // Kolizje wektorowe ze ścianami na osi X i Y
    if (!isCollidingWithWalls(nextX, player.y, player.radius)) {
      player.x = nextX;
    }
    if (!isCollidingWithWalls(player.x, nextY, player.radius)) {
      player.y = nextY;
    }

    // Ochrona przed wyjściem poza granice ekranu
    player.x = Math.max(player.radius + 14, Math.min(CANVAS_WIDTH - player.radius - 14, player.x));
    player.y = Math.max(player.radius + 14, Math.min(CANVAS_HEIGHT - player.radius - 14, player.y));
  }

  // --------------------------------------------------------------------------
  // 3. PRZECIWNIK (EGZAMINATOR):
  // - Algorytm śledzenia studenta
  // - Przyspiesza z każdym zdobytym ECTS!
  // - Dymki komiksowe z tekstami akademickimi
  // --------------------------------------------------------------------------
  function updateProfessor() {
    // Cyber-freeze z Gemini AI (paraliżuje profesora na 3.5s)
    if (professorFreezeTimer > 0) {
      professorFreezeTimer--;
      professor.shakeEffect = Math.sin(Date.now() * 0.05) * 2;
      return;
    }
    professor.shakeEffect = 0;

    // Przyspieszenie z każdym zdobytym ECTS! (Wymaganie 3)
    // 0 ECTS: 1.85, 15 ECTS: 2.9, 29 ECTS: 3.88
    professor.speed = professor.baseSpeed + (ects * 0.07);

    // Wektor pościgu za studentem
    const dx = player.x - professor.x;
    const dy = player.y - professor.y;
    const distToPlayer = Math.hypot(dx, dy);

    if (distToPlayer > 1) {
      const dirX = dx / distToPlayer;
      const dirY = dy / distToPlayer;
      professor.angle = Math.atan2(dy, dx);

      const nextX = professor.x + dirX * professor.speed;
      const nextY = professor.y + dirY * professor.speed;

      // Ślizganie się po ścianach przy omijaniu przeszkód
      let moved = false;
      if (!isCollidingWithWalls(nextX, nextY, professor.radius)) {
        professor.x = nextX;
        professor.y = nextY;
        moved = true;
      } else {
        if (!isCollidingWithWalls(nextX, professor.y, professor.radius)) {
          professor.x = nextX;
          moved = true;
        }
        if (!isCollidingWithWalls(professor.x, nextY, professor.radius)) {
          professor.y = nextY;
          moved = true;
        }
      }

      // Prosta korekta nawigacji jeśli profesor utknie na narożniku
      if (!moved) {
        const perpX = -dirY * professor.speed;
        const perpY = dirX * professor.speed;
        if (!isCollidingWithWalls(professor.x + perpX, professor.y + perpY, professor.radius)) {
          professor.x += perpX;
          professor.y += perpY;
        }
      }
    }

    // Kolizja Profesora ze Studentem
    if (distToPlayer < (player.radius + professor.radius)) {
      if (invulnerableTimer <= 0) {
        if (hasShield) {
          // Legitymacja ALK absorbuje 1 uderzenie! (Wymaganie 4)
          hasShield = false;
          invulnerableTimer = 90; // 1.5s nietykalności
          playSound('hit');

          // Odrzut studenta i profesora w bezpieczne strony
          const pushAngle = Math.atan2(player.y - professor.y, player.x - professor.x);
          player.x += Math.cos(pushAngle) * 50;
          player.y += Math.sin(pushAngle) * 50;
          professor.x -= Math.cos(pushAngle) * 40;
          professor.y -= Math.sin(pushAngle) * 40;

          addFloatingText(player.x, player.y - 20, '🪪 TARCZA POCHŁONĘŁA CIOS!', '#38bdf8');
          setSpeechQuote('„Legitymacja ważna, ale niech Pan uważa!”');
        } else {
          // Porażka - student złapany!
          playSound('hit');
          handleGameOver();
        }
      }
    }
  }

  // --------------------------------------------------------------------------
  // 4. PRZEDMIOTY (LOSOWY SPAWN POZA ŚCIANAMI):
  // - 📜 ECTS (zbierz 30 = wygrana)
  // - ☕ Kawa z Patio ALK (5s turbo-szybkości)
  // - 💻 Gemini AI (paraliżuje profesora na 3.5s)
  // - 🪪 Legitymacja ALK (tarcza absorbująca 1 uderzenie)
  // --------------------------------------------------------------------------
  function updateItems() {
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      it.bounceOffset += 0.06;

      const dist = Math.hypot(player.x - it.x, player.y - it.y);
      if (dist < (player.radius + it.radius + 6)) {

        // 1. Zbiórka 📜 ECTS
        if (it.type === 'ects') {
          ects++;
          playSound('ects');
          addFloatingText(it.x, it.y, '+1 ECTS 📜', '#f2a900');
          addSparkleParticles(it.x, it.y, '#ffc740');
          items.splice(i, 1);

          // Losowy respawn kolejnego ECTS poza ścianami
          if (ects < TARGET_ECTS) {
            spawnItem('ects');
          }

          // Sprawdzenie wygranej (30 ECTS)
          if (ects >= TARGET_ECTS) {
            handleVictory();
            return;
          }
        }

        // 2. Zbiórka ☕ Kawy z Patio ALK
        else if (it.type === 'coffee') {
          coffeeBoostTimer = 300; // 5 sekund przy 60 FPS
          stamina = 100;          // Natychmiastowa regeneracja staminy
          playSound('coffee');
          addFloatingText(it.x, it.y, '☕ TURBO KAWA (5s)!', '#f59e0b');
          addSparkleParticles(it.x, it.y, '#f59e0b');
          items.splice(i, 1);

          // Respawn kawy po pewnym czasie
          setTimeout(() => {
            if (gameState === 'PLAYING') spawnItem('coffee');
          }, 14000);
        }

        // 3. Zbiórka 💻 Gemini AI
        else if (it.type === 'gemini') {
          professorFreezeTimer = 210; // 3.5 sekundy paraliżu (210 klatek)
          playSound('freeze');
          setSpeechQuote('„Czy ten esej pisał Pan, czy ChatGPT?!”');
          addFloatingText(professor.x, professor.y - 25, '💻 CYBER-FREEZE 3.5s!', '#38bdf8');
          addSparkleParticles(it.x, it.y, '#38bdf8');
          items.splice(i, 1);

          // Respawn Gemini AI po 18s
          setTimeout(() => {
            if (gameState === 'PLAYING') spawnItem('gemini');
          }, 18000);
        }

        // 4. Zbiórka 🪪 Legitymacji ALK (Tarcza)
        else if (it.type === 'shield') {
          hasShield = true;
          playSound('shield');
          addFloatingText(it.x, it.y, '🪪 TARCZA AKTYWNA!', '#60a5fa');
          addSparkleParticles(it.x, it.y, '#60a5fa');
          items.splice(i, 1);

          // Respawn Legitymacji po 20s
          setTimeout(() => {
            if (gameState === 'PLAYING') spawnItem('shield');
          }, 20000);
        }
      }
    }
  }

  // --- Cząsteczki wizualne ---
  function addDustParticle(x, y) {
    particles.push({
      x: x + (Math.random() - 0.5) * 6,
      y: y + (Math.random() - 0.5) * 4,
      vx: (Math.random() - 0.5) * 1.2,
      vy: Math.random() * 0.5 + 0.6,
      radius: Math.random() * 2.5 + 1.5,
      color: 'rgba(255, 255, 255, 0.4)',
      life: 18
    });
  }

  function addCoffeeSparkle(x, y) {
    particles.push({
      x: x + (Math.random() - 0.5) * 16,
      y: y + (Math.random() - 0.5) * 16,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      radius: Math.random() * 2 + 1,
      color: '#f59e0b',
      life: 22
    });
  }

  function addSparkleParticles(x, y, color) {
    for (let i = 0; i < 9; i++) {
      const angle = (Math.PI * 2 / 9) * i;
      const spd = Math.random() * 2.5 + 1.2;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        radius: Math.random() * 2.5 + 1.5,
        color: color,
        life: 26
      });
    }
  }

  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      if (p.life <= 0) particles.splice(i, 1);
    }

    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      ft.y -= 0.85;
      ft.life--;
      if (ft.life <= 0) floatingTexts.splice(i, 1);
    }
  }

  function addFloatingText(x, y, text, color) {
    floatingTexts.push({
      x: x,
      y: y - 10,
      text: text,
      color: color,
      life: 50
    });
  }

  // --- Aktualizacja Paska HUD ---
  function updateHUD() {
    if (ectsCounterEl) ectsCounterEl.textContent = ects;
    if (ectsProgressBarEl) {
      const pct = Math.min(100, (ects / TARGET_ECTS) * 100);
      ectsProgressBarEl.style.width = `${pct}%`;
    }

    if (staminaBarEl) {
      staminaBarEl.style.width = `${stamina}%`;
      if (stamina < 20) {
        staminaBarEl.classList.add('exhausted');
      } else {
        staminaBarEl.classList.remove('exhausted');
      }
    }
    if (staminaPercentEl) {
      staminaPercentEl.textContent = `${Math.round(stamina)}%`;
    }

    if (staminaStatusEl) {
      if (hasShield && coffeeBoostTimer > 0) {
        staminaStatusEl.textContent = '☕ TURBO KAWA + 🪪 TARCZA!';
      } else if (hasShield) {
        staminaStatusEl.textContent = '🪪 Legitymacja ALK chroni przed 1 ciosem';
      } else if (coffeeBoostTimer > 0) {
        staminaStatusEl.textContent = `☕ Turbo-szybkość (${Math.ceil(coffeeBoostTimer / 60)}s)`;
      } else if (isSprinting) {
        staminaStatusEl.textContent = 'Sprint aktywny (zużycie energii)';
      } else {
        staminaStatusEl.textContent = 'Regeneracja w marszu';
      }
    }

    // Wykrywanie aktualnej strefy pobytu studenta
    let currentZone = 'Korytarz Kampusu ALK';
    for (const z of CAMPUS_ZONES) {
      if (player.x >= z.x && player.x <= z.x + z.w &&
          player.y >= z.y && player.y <= z.y + z.h) {
        currentZone = z.name;
        break;
      }
    }
    if (campusZoneNameEl) campusZoneNameEl.textContent = currentZone;

    // Dystans i status zagrożenia
    const dist = Math.hypot(player.x - professor.x, player.y - professor.y);
    if (professorDistanceStatusEl) {
      if (statusTextTimer > 0) {
        statusTextTimer--;
        professorDistanceStatusEl.textContent = statusText;
        professorDistanceStatusEl.style.color = '#ef4444';
        professorDistanceStatusEl.className = 'radar-status';
      } else {
        professorDistanceStatusEl.style.color = '';
        if (professorFreezeTimer > 0) {
          professorDistanceStatusEl.textContent = '❄️ Sparaliżowany!';
          professorDistanceStatusEl.className = 'radar-status status-calm';
        } else if (dist < 120) {
          professorDistanceStatusEl.textContent = 'Tuż za Tobą!';
          professorDistanceStatusEl.className = 'radar-status status-danger';
        } else if (dist < 260) {
          professorDistanceStatusEl.textContent = 'Goni Cię!';
          professorDistanceStatusEl.className = 'radar-status status-alert';
        } else {
          professorDistanceStatusEl.textContent = 'Węszy na kampusie';
          professorDistanceStatusEl.className = 'radar-status status-calm';
        }
      }
    }
  }

  // --- Zakończenie rozgrywki ---
  function handleGameOver() {
    gameState = 'DEFEAT';
    if (finalEctsLostEl) finalEctsLostEl.textContent = `${ects} / ${TARGET_ECTS}`;
    if (survivalTimeLostEl) survivalTimeLostEl.textContent = formatTime(elapsedTime);
    if (defeatQuoteTextEl) {
      defeatQuoteTextEl.textContent = PROFESSOR_QUOTES[Math.floor(Math.random() * PROFESSOR_QUOTES.length)];
    }
    gameoverModalEl?.classList.remove('hidden');
  }

  function handleVictory() {
    gameState = 'VICTORY';
    playSound('win');

    const timeStr = formatTime(elapsedTime);
    if (victoryTimeEl) victoryTimeEl.textContent = timeStr;

    let grade = '5.0 (Bardzo dobry)';
    if (elapsedTime > 80) grade = '4.5 (Dobry plus)';
    if (elapsedTime > 140) grade = '4.0 (Dobry)';
    if (elapsedTime > 200) grade = '3.5 (Dostateczny plus)';
    if (elapsedTime > 260) grade = '3.0 (Dostateczny)';

    if (victoryGradeEl) victoryGradeEl.textContent = grade;
    victoryModalEl?.classList.remove('hidden');
  }

  // --------------------------------------------------------------------------
  // RYSOWANIE KAMPUSU (Canvas 800x540)
  // --------------------------------------------------------------------------
  function render() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 1. Posadzka korytarzy ALK
    ctx.fillStyle = '#0a1128';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Subtelna retro siatka podłogi
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < CANVAS_WIDTH; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // 2. Aule i Strefy (Aula A, Biblioteka, Dziekanat, Lab Komputerowy, Patio ALK 🌿)
    CAMPUS_ZONES.forEach(z => {
      ctx.fillStyle = z.color;
      ctx.fillRect(z.x, z.y, z.w, z.h);

      ctx.strokeStyle = 'rgba(242, 169, 0, 0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(z.x, z.y, z.w, z.h);

      // Etykiety tekstowe sal
      ctx.font = '700 13px Outfit, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.textAlign = 'center';
      ctx.fillText(z.name.toUpperCase(), z.x + z.w / 2, z.y + 24);
    });

    // 3. Detale Patio ALK 🌿 (trawniki, alejka, krzewy)
    ctx.fillStyle = '#0f382c';
    ctx.fillRect(280, 160, 240, 220);

    // Pasy trawnika
    ctx.fillStyle = '#134e3e';
    for (let py = 170; py < 370; py += 32) {
      ctx.fillRect(285, py, 230, 16);
    }

    // Alejki spacerowe na Patio
    ctx.fillStyle = '#1b2d4b';
    ctx.fillRect(388, 160, 24, 220); // Pionowa
    ctx.fillRect(280, 258, 240, 24); // Pozioma

    // Centralna fontanna / emblem Patio ALK
    ctx.beginPath();
    ctx.arc(400, 270, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#002244';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#f2a900';
    ctx.stroke();

    ctx.fillStyle = '#ffc740';
    ctx.font = '10px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ALK', 400, 274);

    // Rośliny / fikusy w donicach na Patio
    const bushes = [
      { x: 305, y: 185 }, { x: 495, y: 185 },
      { x: 305, y: 355 }, { x: 495, y: 355 }
    ];
    bushes.forEach(b => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#15803d';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(b.x - 3, b.y - 3, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#22c55e';
      ctx.fill();
    });

    // 4. Ściany i przegrody korytarzy
    ctx.fillStyle = '#002244';
    ctx.strokeStyle = '#f2a900';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < WALLS.length; i++) {
      const w = WALLS[i];
      ctx.fillRect(w.x, w.y, w.w, w.h);
      ctx.strokeRect(w.x, w.y, w.w, w.h);
    }

    // 5. Przedmioty (ECTS, Kawa, Gemini AI, Legitymacja ALK)
    items.forEach(it => {
      const bounce = Math.sin(it.bounceOffset) * 3;
      ctx.save();
      ctx.translate(it.x, it.y + bounce);

      if (it.type === 'ects') {
        // 📜 ECTS
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(242, 169, 0, 0.2)';
        ctx.fill();

        ctx.font = '18px serif';
        ctx.textAlign = 'center';
        ctx.fillText('📜', 0, 6);
      } else if (it.type === 'coffee') {
        // ☕ Kawa z Patio ALK
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
        ctx.fill();

        ctx.font = '18px serif';
        ctx.textAlign = 'center';
        ctx.fillText('☕', 0, 6);
      } else if (it.type === 'gemini') {
        // 💻 Gemini AI
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.fill();

        ctx.font = '18px serif';
        ctx.textAlign = 'center';
        ctx.fillText('💻', 0, 6);
      } else if (it.type === 'shield') {
        // 🪪 Legitymacja ALK
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(96, 165, 250, 0.3)';
        ctx.fill();

        ctx.font = '18px serif';
        ctx.textAlign = 'center';
        ctx.fillText('🪪', 0, 6);
      }
      ctx.restore();
    });

    // 6. Cząsteczki kurzu i iskier
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    });

    // 7. Rysowanie Egzaminatora (Profesor)
    ctx.save();
    ctx.translate(professor.x + professor.shakeEffect, professor.y);

    // Poświata wskaźnika zagrożenia lub cyber-freeze
    ctx.beginPath();
    ctx.arc(0, 0, professor.radius + 14, 0, Math.PI * 2);
    if (professorFreezeTimer > 0) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.35)'; // Zamrożony błękit
    } else {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.18)'; // Czerwona strefa pościgu
    }
    ctx.fill();

    // Ciało profesora
    ctx.beginPath();
    ctx.arc(0, 0, professor.radius, 0, Math.PI * 2);
    ctx.fillStyle = professorFreezeTimer > 0 ? '#0284c7' : '#1e1b4b';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = professorFreezeTimer > 0 ? '#38bdf8' : '#ef4444';
    ctx.stroke();

    // Krawat i teczka z egzaminami
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-2, -4, 4, 10);

    // Głowa i biret
    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.arc(0, -5, 6, 0, Math.PI * 2);
    ctx.fill();

    // Biret akademicki
    ctx.fillStyle = '#0a1128';
    ctx.beginPath();
    ctx.moveTo(0, -15);
    ctx.lineTo(9, -9);
    ctx.lineTo(0, -6);
    ctx.lineTo(-9, -9);
    ctx.closePath();
    ctx.fill();

    // Status nad głową profesora: ❄️ przy freeze lub ⚠️ przy pościgu
    ctx.textAlign = 'center';
    if (professorFreezeTimer > 0) {
      ctx.font = '14px sans-serif';
      ctx.fillText('❄️', 0, -22);
    } else {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('!', 0, -20);
    }
    ctx.restore();

    // 8. Rysowanie Gracza (Student)
    ctx.save();
    ctx.translate(player.x, player.y);

    // Efekt tarczy Legitymacji ALK (pulsująca niebiesko-złota orbita)
    if (hasShield) {
      const shieldGlow = Math.sin(Date.now() * 0.008) * 3;
      ctx.beginPath();
      ctx.arc(0, 0, player.radius + 10 + shieldGlow, 0, Math.PI * 2);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.fill();
    }

    // Efekt turbo-szybkości z kawy (złocista poświata)
    if (coffeeBoostTimer > 0) {
      ctx.beginPath();
      ctx.arc(0, 0, player.radius + 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.35)';
      ctx.fill();
    }

    // Miganie przy nietykalności
    if (invulnerableTimer > 0 && Math.floor(invulnerableTimer / 4) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    // Ciało studenta (bluza z kapturem ALK)
    ctx.beginPath();
    ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#004b87'; // Granatowa bluza ALK
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#f2a900'; // Złoty zarys ALK
    ctx.stroke();

    // Plecak studenta z tyłu
    const backAngle = player.angle + Math.PI;
    const backpackX = Math.cos(backAngle) * 8;
    const backpackY = Math.sin(backAngle) * 8;
    ctx.beginPath();
    ctx.arc(backpackX, backpackY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#d97706';
    ctx.fill();

    // Głowa studenta
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // 9. Pływające teksty popup
    floatingTexts.forEach(ft => {
      ctx.font = 'bold 13px Outfit, sans-serif';
      ctx.fillStyle = ft.color;
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
    });
  }

  // --- Główna pętla gry (60 FPS) ---
  function gameLoop() {
    if (gameState === 'PLAYING') {
      elapsedTime = (Date.now() - gameStartTime) / 1000;

      // Zmiana tekstu akademickiego w dymku profesora co ~8 sekund
      quoteTimer++;
      if (quoteTimer > 480) {
        quoteTimer = 0;
        currentQuoteIndex = (currentQuoteIndex + 1) % PROFESSOR_QUOTES.length;
        setSpeechQuote(PROFESSOR_QUOTES[currentQuoteIndex]);
      }

      updateArtillery();
      updatePlayer();
      updateProfessor();
      updateItems();
      updateParticles();
      updateHUD();
    }

    render();
    requestAnimationFrame(gameLoop);
  }

  // Automatyczna inicjalizacja mapy i pętli
  resetGame();
  requestAnimationFrame(gameLoop);

})();
