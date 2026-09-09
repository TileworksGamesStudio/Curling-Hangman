/**
 * CURLING PUZZLES — HANGMAN ENGINE + PLATFORM SHELL
 * Features:
 * 1. 2D Interactive Background Curling Stone Physics Simulation with Fixed Timestep Elastic Collisions & Retina DPI
 * 2. Deterministic Calendar Scheduling Baseline (8 September 2026 = Day 0)
 * 3. Future Puzzle Privacy & Strict Boundary Guard
 * 4. Web Audio API Tactile Granite Thump & Ice Chime Synthesizer
 * 5. Versioned LocalStorage Continuity & Statistics Tracking
 * 6. Responsive Viewport-First Mobile Scaling & Overflow Safeguards
 */

(function () {
  "use strict";

  /* ==========================================================================
     0. CONSTANTS & DATE SCHEDULING BASELINE
     ========================================================================== */
  // Baseline Day 0: 8 September 2026 (Local Midnight)
  const BASELINE_YEAR = 2026;
  const BASELINE_MONTH = 8; // 0-indexed: 8 = September
  const BASELINE_DAY = 8;
  const MAX_MISTAKES = 6; // 6 regulation curling stones in hand

  const STORAGE_KEY = "curling_hangman_save_v1";

  /* ==========================================================================
     1. TACTILE WEB AUDIO SYNTHESIZER
     ========================================================================== */
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.enabled = true;
    }

    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
        }
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
    }

    playRockCollision(intensity = 0.4) {
      if (!this.enabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(105, now);
        osc.frequency.exponentialRampToValueAtTime(38, now + 0.14);

        const vol = Math.min(0.22, Math.max(0.04, intensity * 0.18));
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.16);
      } catch (e) {}
    }

    playKeyTap() {
      if (!this.enabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(420, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.06);
      } catch (e) {}
    }

    playLetterHit() {
      if (!this.enabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
      } catch (e) {}
    }

    playLetterMiss() {
      if (!this.enabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(130, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.18);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
      } catch (e) {}
    }

    playWin() {
      if (!this.enabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const notes = [440, 554.37, 659.25, 880]; // A major chime
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.12, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.38);
        });
      } catch (e) {}
    }

    playLoss() {
      if (!this.enabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const notes = [220, 196, 174.61]; // Descending resolution
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);
          gain.gain.setValueAtTime(0.09, now + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.3);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.32);
        });
      } catch (e) {}
    }
  }

  const sound = new SoundEngine();

  /* ==========================================================================
     2. BACKGROUND CURLING ROCK SIMULATION & RETINA CANVAS ENGINE
     ========================================================================== */
  class BackgroundRinkSimulation {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.rocks = [];
      this.animId = null;
      this.lastTime = 0;
      this.accumulator = 0;
      this.width = 0;
      this.height = 0;
      this.dpr = 1;
      this.isQuietMode = false;
      this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Aggressive takeout event timer
      this.nextTakeoutTimer = 35000 + Math.random() * 20000;

      this.resize = this.resize.bind(this);
      this.loop = this.loop.bind(this);
      this.handleVisibility = this.handleVisibility.bind(this);

      window.addEventListener("resize", this.resize);
      document.addEventListener("visibilitychange", this.handleVisibility);

      this.resize();
      this.initRocks();

      if (!this.reducedMotion) {
        this.start();
      } else {
        this.draw();
      }
    }

    resize() {
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.width = window.innerWidth;
      this.height = window.innerHeight;

      this.canvas.width = Math.round(this.width * this.dpr);
      this.canvas.height = Math.round(this.height * this.dpr);
      this.canvas.style.width = this.width + "px";
      this.canvas.style.height = this.height + "px";

      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }

    setQuietMode(quiet) {
      this.isQuietMode = quiet;
    }

    initRocks() {
      const count = this.width < 600 ? 4 : 6;
      this.rocks = [];
      const baseRadius = this.width < 600 ? 22 : 28;

      for (let i = 0; i < count; i++) {
        let attempts = 0;
        let x, y, overlapping;
        do {
          overlapping = false;
          x = baseRadius * 2 + Math.random() * (this.width - baseRadius * 4);
          y = baseRadius * 2 + Math.random() * (this.height - baseRadius * 4);
          for (let j = 0; j < this.rocks.length; j++) {
            const dx = x - this.rocks[j].x;
            const dy = y - this.rocks[j].y;
            if (Math.hypot(dx, dy) < baseRadius * 2.8) {
              overlapping = true;
              break;
            }
          }
          attempts++;
        } while (overlapping && attempts < 50);

        const angle = Math.random() * Math.PI * 2;
        const speed = 0.2 + Math.random() * 0.3;

        this.rocks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: baseRadius,
          mass: 1,
          team: i % 2 === 0 ? "red" : "yellow",
          rotation: Math.random() * Math.PI * 2,
          angularVel: (Math.random() - 0.5) * 0.006,
          isTakeout: false,
          speckleOffset: i * 17
        });
      }
    }

    triggerTakeoutRock() {
      const baseRadius = this.width < 600 ? 22 : 28;
      const x = Math.random() * (this.width - baseRadius * 2) + baseRadius;
      const y = -baseRadius * 1.5;
      const targetX = this.width * 0.5 + (Math.random() - 0.5) * this.width * 0.6;
      const targetY = this.height * 0.6 + (Math.random() - 0.5) * this.height * 0.3;
      const angle = Math.atan2(targetY - y, targetX - x);
      const speed = 2.4 + Math.random() * 0.8;

      this.rocks.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: baseRadius,
        mass: 1.1,
        team: Math.random() > 0.5 ? "red" : "yellow",
        rotation: 0,
        angularVel: 0.015,
        isTakeout: true,
        speckleOffset: 99
      });
    }

    updatePhysics(stepMs) {
      const rocks = this.rocks;
      const restitution = 0.78; // Regulation granite rebound elasticity
      const damping = 0.9994;   // Pebbled ice glide damping
      const targetMaxSpeed = this.isQuietMode ? 0.32 : 1.8;

      // 1. Position & Motion Update
      for (let i = rocks.length - 1; i >= 0; i--) {
        const r = rocks[i];

        r.x += r.vx;
        r.y += r.vy;
        r.rotation += r.angularVel;

        r.vx *= damping;
        r.vy *= damping;
        r.angularVel *= damping;

        // Gentle curling drift deflects trajectory slightly based on spin
        r.vx += -Math.sin(r.rotation) * r.angularVel * 0.05;
        r.vy += Math.cos(r.rotation) * r.angularVel * 0.05;

        // Quiet mode speed clamp
        if (this.isQuietMode && !r.isTakeout) {
          const curSpeed = Math.hypot(r.vx, r.vy);
          if (curSpeed > targetMaxSpeed) {
            r.vx = (r.vx / curSpeed) * targetMaxSpeed;
            r.vy = (r.vy / curSpeed) * targetMaxSpeed;
          }
        }

        // Maintain gentle glide
        const speed = Math.hypot(r.vx, r.vy);
        if (speed < 0.16 && !r.isTakeout) {
          const restoreAngle = r.rotation;
          r.vx = Math.cos(restoreAngle) * 0.2;
          r.vy = Math.sin(restoreAngle) * 0.2;
        }

        // Boundary containment
        if (r.x - r.radius < 0) {
          r.x = r.radius;
          r.vx = Math.abs(r.vx) * restitution;
        } else if (r.x + r.radius > this.width) {
          r.x = this.width - r.radius;
          r.vx = -Math.abs(r.vx) * restitution;
        }

        if (r.y - r.radius < 0 && !r.isTakeout) {
          r.y = r.radius;
          r.vy = Math.abs(r.vy) * restitution;
        } else if (r.y - r.radius > this.height) {
          if (r.isTakeout) {
            rocks.splice(i, 1);
            continue;
          } else {
            r.y = this.height - r.radius;
            r.vy = -Math.abs(r.vy) * restitution;
          }
        }
      }

      // 2. Pairwise Stone Collisions
      for (let i = 0; i < rocks.length; i++) {
        for (let j = i + 1; j < rocks.length; j++) {
          const r1 = rocks[i];
          const r2 = rocks[j];
          const dx = r2.x - r1.x;
          const dy = r2.y - r1.y;
          const dist = Math.hypot(dx, dy);
          const minDist = r1.radius + r2.radius;

          if (dist < minDist && dist > 0) {
            // Positional overlap resolution (anti-sticking)
            const overlap = (minDist - dist) * 0.5;
            const nx = dx / dist;
            const ny = dy / dist;

            r1.x -= nx * overlap;
            r1.y -= ny * overlap;
            r2.x += nx * overlap;
            r2.y += ny * overlap;

            // Momentum transfer
            const dvx = r2.vx - r1.vx;
            const dvy = r2.vy - r1.vy;
            const velAlongNormal = dvx * nx + dvy * ny;

            if (velAlongNormal < 0) {
              const impulse = -(1 + restitution) * velAlongNormal * 0.5;
              r1.vx -= impulse * nx;
              r1.vy -= impulse * ny;
              r2.vx += impulse * nx;
              r2.vy += impulse * ny;

              r1.angularVel += (Math.random() - 0.5) * 0.008;
              r2.angularVel += (Math.random() - 0.5) * 0.008;

              if (Math.abs(impulse) > 0.12) {
                sound.playRockCollision(Math.abs(impulse));
              }
            }
          }
        }
      }

      // Takeout Timer
      this.nextTakeoutTimer -= stepMs;
      if (this.nextTakeoutTimer <= 0) {
        this.nextTakeoutTimer = 35000 + Math.random() * 25000;
        if (!this.isQuietMode && rocks.length <= 7) {
          this.triggerTakeoutRock();
        }
      }
    }

    draw() {
      this.ctx.clearRect(0, 0, this.width, this.height);

      // 1. Subtle Sheet Rink Geometry
      this.ctx.save();
      this.ctx.strokeStyle = "rgba(21, 59, 93, 0.05)";
      this.ctx.lineWidth = 1.5;

      // Centre line
      this.ctx.beginPath();
      this.ctx.moveTo(this.width * 0.5, 0);
      this.ctx.lineTo(this.width * 0.5, this.height);
      this.ctx.stroke();

      // House Rings Watermark
      const cx = this.width * 0.5;
      const cy = this.height * 0.32;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, 140, 0, Math.PI * 2);
      this.ctx.strokeStyle = "rgba(21, 59, 93, 0.035)";
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.arc(cx, cy, 95, 0, Math.PI * 2);
      this.ctx.strokeStyle = "rgba(214, 59, 59, 0.03)";
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.arc(cx, cy, 48, 0, Math.PI * 2);
      this.ctx.strokeStyle = "rgba(21, 59, 93, 0.035)";
      this.ctx.stroke();
      this.ctx.restore();

      // 2. Realistic Granite Stones
      for (let i = 0; i < this.rocks.length; i++) {
        const r = this.rocks[i];
        this.ctx.save();
        this.ctx.translate(r.x, r.y);
        this.ctx.rotate(r.rotation);

        // Grounding contact shadow on ice
        this.ctx.beginPath();
        this.ctx.ellipse(0, r.radius * 0.22, r.radius * 0.98, r.radius * 0.85, 0, 0, Math.PI * 2);
        this.ctx.fillStyle = "rgba(21, 59, 93, 0.16)";
        this.ctx.fill();

        // Outer granite stone body
        this.ctx.beginPath();
        this.ctx.arc(0, 0, r.radius, 0, Math.PI * 2);
        const grad = this.ctx.createRadialGradient(
          -r.radius * 0.35, -r.radius * 0.35, r.radius * 0.08,
          0, 0, r.radius
        );
        grad.addColorStop(0, "#718096");
        grad.addColorStop(0.5, "#4a5568");
        grad.addColorStop(0.85, "#2d3748");
        grad.addColorStop(1, "#1a202c");
        this.ctx.fillStyle = grad;
        this.ctx.fill();

        // Subtle granite speckles
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
        for (let s = 0; s < 4; s++) {
          const spX = Math.cos(r.speckleOffset + s * 1.5) * (r.radius * 0.45);
          const spY = Math.sin(r.speckleOffset + s * 1.5) * (r.radius * 0.45);
          this.ctx.fillRect(spX, spY, 1.2, 1.2);
        }

        // Granite upper bevel highlight
        this.ctx.lineWidth = 1.8;
        this.ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
        this.ctx.stroke();

        // Striking band contact equator
        this.ctx.beginPath();
        this.ctx.arc(0, 0, r.radius * 0.76, 0, Math.PI * 2);
        this.ctx.fillStyle = "#334155";
        this.ctx.fill();
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = "rgba(15, 23, 42, 0.4)";
        this.ctx.stroke();

        // Inner dish top crown
        this.ctx.beginPath();
        this.ctx.arc(0, 0, r.radius * 0.55, 0, Math.PI * 2);
        this.ctx.fillStyle = "#475569";
        this.ctx.fill();

        // Handle mount & Goose-neck equipment handle
        const handleCol = r.team === "red" ? "#d63b3b" : "#d99b16";
        const handleStroke = r.team === "red" ? "#b92e34" : "#b88210";

        this.ctx.beginPath();
        this.ctx.roundRect(-r.radius * 0.52, -4.5, r.radius * 1.04, 9, 4.5);
        this.ctx.fillStyle = handleCol;
        this.ctx.fill();
        this.ctx.lineWidth = 1.2;
        this.ctx.strokeStyle = handleStroke;
        this.ctx.stroke();

        // Upper handle shine highlight
        this.ctx.beginPath();
        this.ctx.roundRect(-r.radius * 0.45, -3, r.radius * 0.9, 2.8, 1.4);
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
        this.ctx.fill();

        // Center brass handle bolt
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
        this.ctx.fillStyle = "#facc15";
        this.ctx.fill();
        this.ctx.strokeStyle = "#854d0e";
        this.ctx.lineWidth = 0.8;
        this.ctx.stroke();

        this.ctx.restore();
      }
    }

    loop(timestamp) {
      if (!this.lastTime) this.lastTime = timestamp;
      let frameTime = timestamp - this.lastTime;
      this.lastTime = timestamp;

      if (frameTime > 250) frameTime = 250;

      this.accumulator += frameTime;
      const FIXED_STEP = 1000 / 60;

      while (this.accumulator >= FIXED_STEP) {
        this.updatePhysics(FIXED_STEP);
        this.accumulator -= FIXED_STEP;
      }

      this.draw();
      this.animId = requestAnimationFrame(this.loop);
    }

    start() {
      if (!this.animId) {
        this.lastTime = performance.now();
        this.animId = requestAnimationFrame(this.loop);
      }
    }

    stop() {
      if (this.animId) {
        cancelAnimationFrame(this.animId);
        this.animId = null;
      }
    }

    handleVisibility() {
      if (document.hidden) {
        this.stop();
      } else if (!this.reducedMotion) {
        this.lastTime = performance.now();
        this.start();
      }
    }
  }

  /* ==========================================================================
     3. DETERMINISTIC DAILY SCHEDULING ENGINE
     ========================================================================== */
  function computeDayIndex(date = new Date()) {
    const localMidnightUTC = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    const baseUTC = Date.UTC(BASELINE_YEAR, BASELINE_MONTH, BASELINE_DAY);
    const diffDays = Math.floor((localMidnightUTC - baseUTC) / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  function getPuzzleForDay(dayIndex) {
    const puzzles = window.CURLING_HANGMAN_PUZZLES || [];
    if (!puzzles.length) return null;
    const puzzleIdx = dayIndex % puzzles.length;
    return puzzles[puzzleIdx];
  }

  /* ==========================================================================
     4. PERSISTENT PLAYER STATE & STORAGE
     ========================================================================== */
  function loadStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.version === 1) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Curling Puzzles: storage recovered");
    }
    return {
      version: 1,
      soundEnabled: true,
      stats: {
        played: 0,
        won: 0,
        currentStreak: 0,
        maxStreak: 0,
        lastPlayedDay: null
      },
      puzzleStates: {}
    };
  }

  function saveStorage(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("Curling Puzzles: storage quota exceeded");
    }
  }

  /* ==========================================================================
     5. MAIN APP CONTROLLER
     ========================================================================== */
  class HangmanApp {
    constructor() {
      this.state = loadStorage();
      this.currentDay = computeDayIndex(new Date());
      this.activePuzzle = null;
      this.activeDayIndex = this.currentDay;
      this.activeGuessed = new Set();
      this.activeAttempts = MAX_MISTAKES;
      this.activeStatus = "playing"; // "playing" | "won" | "lost"

      this.bgSim = null;

      // DOM Cache
      this.dom = {
        menuScreen: document.getElementById("menu-screen"),
        gameScreen: document.getElementById("game-screen"),
        vaultScreen: document.getElementById("vault-screen"),
        soundBtn: document.getElementById("sound-toggle-btn"),
        soundLabel: document.getElementById("sound-label-text"),

        todayHeading: document.getElementById("today-heading"),
        todayCurriculum: document.getElementById("today-curriculum-text"),
        todayDayChip: document.getElementById("today-day-chip"),
        todayStatusChip: document.getElementById("today-status-chip"),
        todayDiffChip: document.getElementById("today-difficulty-chip"),
        todayCatChip: document.getElementById("today-category-chip"),
        todayPlayBtn: document.getElementById("today-play-btn"),
        todayBtnText: document.getElementById("today-btn-text"),
        menuVaultBtn: document.getElementById("menu-vault-btn"),
        vaultCountSubtitle: document.getElementById("vault-count-subtitle"),

        miniStatPlayed: document.getElementById("mini-stat-played"),
        miniStatWinrate: document.getElementById("mini-stat-winrate"),
        miniStatStreak: document.getElementById("mini-stat-streak"),

        gameBackBtn: document.getElementById("game-back-to-menu-btn"),
        gameHelpBtn: document.getElementById("game-help-btn"),
        gameDayTitle: document.getElementById("game-puzzle-day-title"),
        gamePuzzleMeta: document.getElementById("game-puzzle-meta"),
        stonesCountDisplay: document.getElementById("stones-count-display"),
        stonesRack: document.getElementById("stones-rack"),
        gameCategoryChip: document.getElementById("game-category-chip"),
        gameDifficultyChip: document.getElementById("game-difficulty-chip"),
        gameClueText: document.getElementById("game-clue-text"),
        wordSlotsContainer: document.getElementById("word-slots-container"),
        kbRow1: document.getElementById("kb-row-1"),
        kbRow2: document.getElementById("kb-row-2"),
        kbRow3: document.getElementById("kb-row-3"),
        srAnnounce: document.getElementById("sr-announcement"),

        vaultBackBtn: document.getElementById("vault-back-to-menu-btn"),
        vaultList: document.getElementById("vault-puzzles-list"),
        vaultEmpty: document.getElementById("vault-empty-message"),

        resultModal: document.getElementById("result-modal"),
        modalTitle: document.getElementById("modal-result-title"),
        modalSubtitle: document.getElementById("modal-result-subtitle"),
        modalBadgeGraphic: document.getElementById("modal-badge-graphic"),
        modalWordText: document.getElementById("modal-word-text"),
        modalContextText: document.getElementById("modal-context-text"),
        modalStatPlayed: document.getElementById("modal-stat-played"),
        modalStatWinrate: document.getElementById("modal-stat-winrate"),
        modalStatStreak: document.getElementById("modal-stat-streak"),
        modalStatMaxStreak: document.getElementById("modal-stat-maxstreak"),
        modalShareBtn: document.getElementById("modal-share-btn"),
        modalShareLabel: document.getElementById("modal-share-label"),
        modalCloseBtn: document.getElementById("modal-close-btn"),

        helpModal: document.getElementById("help-modal"),
        helpCloseBtn: document.getElementById("help-modal-close-btn")
      };

      this.init();
    }

    init() {
      sound.enabled = !!this.state.soundEnabled;
      this.updateSoundButtonUI();

      const bgCanvas = document.getElementById("bg-canvas");
      if (bgCanvas) {
        this.bgSim = new BackgroundRinkSimulation(bgCanvas);
      }

      this.bindEvents();
      this.renderMenu();
      this.buildKeyboard();
    }

    bindEvents() {
      // Sound Toggle
      this.dom.soundBtn.addEventListener("click", () => {
        sound.init();
        sound.enabled = !sound.enabled;
        this.state.soundEnabled = sound.enabled;
        saveStorage(this.state);
        this.updateSoundButtonUI();
        if (sound.enabled) sound.playKeyTap();
      });

      // Menu -> Game (Today)
      this.dom.todayPlayBtn.addEventListener("click", () => {
        sound.init();
        sound.playKeyTap();
        this.loadPuzzle(this.currentDay);
        this.showScreen(this.dom.gameScreen);
      });

      // Menu -> Vault
      this.dom.menuVaultBtn.addEventListener("click", () => {
        sound.init();
        sound.playKeyTap();
        this.renderVault();
        this.showScreen(this.dom.vaultScreen);
      });

      // Game -> Menu
      this.dom.gameBackBtn.addEventListener("click", () => {
        sound.playKeyTap();
        this.renderMenu();
        this.showScreen(this.dom.menuScreen);
      });

      // Vault -> Menu
      this.dom.vaultBackBtn.addEventListener("click", () => {
        sound.playKeyTap();
        this.renderMenu();
        this.showScreen(this.dom.menuScreen);
      });

      // Help Modal
      this.dom.gameHelpBtn.addEventListener("click", () => {
        sound.playKeyTap();
        this.dom.helpModal.classList.remove("hidden");
      });
      this.dom.helpCloseBtn.addEventListener("click", () => {
        sound.playKeyTap();
        this.dom.helpModal.classList.add("hidden");
      });

      // Result Modal
      this.dom.modalCloseBtn.addEventListener("click", () => {
        sound.playKeyTap();
        this.dom.resultModal.classList.add("hidden");
        this.renderMenu();
        this.showScreen(this.dom.menuScreen);
      });

      this.dom.modalShareBtn.addEventListener("click", () => {
        this.shareResult();
      });

      // Physical Keyboard Guess Listener
      window.addEventListener("keydown", (e) => {
        if (!this.dom.gameScreen.classList.contains("active-screen")) return;
        if (!this.dom.resultModal.classList.contains("hidden")) return;
        if (!this.dom.helpModal.classList.contains("hidden")) return;

        const key = e.key.toUpperCase();
        if (/^[A-Z]$/.test(key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
          this.handleLetterGuess(key);
        }
      });
    }

    updateSoundButtonUI() {
      this.dom.soundBtn.setAttribute("aria-pressed", sound.enabled ? "true" : "false");
      this.dom.soundBtn.setAttribute("aria-label", `Toggle Sound: ${sound.enabled ? "ON" : "OFF"}`);
    }

    showScreen(screenEl) {
      [this.dom.menuScreen, this.dom.gameScreen, this.dom.vaultScreen].forEach((s) => {
        s.classList.remove("active-screen");
        s.setAttribute("aria-hidden", "true");
      });
      screenEl.classList.add("active-screen");
      screenEl.setAttribute("aria-hidden", "false");
      screenEl.scrollTop = 0;

      // Adjust background physics intensity (quiet during gameplay)
      if (this.bgSim) {
        this.bgSim.setQuietMode(screenEl === this.dom.gameScreen);
      }
    }

    /* ==========================================================================
       6. MENU & STATS RENDERING
       ========================================================================== */
    renderMenu() {
      const todayPuzzle = getPuzzleForDay(this.currentDay);
      if (!todayPuzzle) return;

      const savedState = this.state.puzzleStates[todayPuzzle.id];

      this.dom.todayDayChip.textContent = `Day ${this.currentDay}`;
      this.dom.todayHeading.textContent = `Daily End: ${todayPuzzle.category}`;
      this.dom.todayCurriculum.textContent = todayPuzzle.curriculumLevel;
      this.dom.todayDiffChip.textContent = todayPuzzle.difficulty;
      this.dom.todayCatChip.textContent = todayPuzzle.category;

      if (savedState) {
        if (savedState.status === "won") {
          this.dom.todayStatusChip.textContent = "Solved";
          this.dom.todayStatusChip.className = "today-status-chip solved";
          this.dom.todayBtnText.textContent = "View Results";
        } else if (savedState.status === "lost") {
          this.dom.todayStatusChip.textContent = "Missed";
          this.dom.todayStatusChip.className = "today-status-chip missed";
          this.dom.todayBtnText.textContent = "View Results";
        } else {
          this.dom.todayStatusChip.textContent = "In Progress";
          this.dom.todayStatusChip.className = "today-status-chip";
          this.dom.todayBtnText.textContent = "Continue";
        }
      } else {
        this.dom.todayStatusChip.textContent = "Unplayed";
        this.dom.todayStatusChip.className = "today-status-chip";
        this.dom.todayBtnText.textContent = "Play Today";
      }

      // Strictly previously released puzzles count (Day < currentDay)
      const releasedCount = Math.max(0, this.currentDay);
      this.dom.vaultCountSubtitle.textContent =
        releasedCount === 0
          ? "No past puzzles yet"
          : `${releasedCount} released puzzle${releasedCount === 1 ? "" : "s"}`;

      // Stats summary
      const stats = this.state.stats;
      this.dom.miniStatPlayed.textContent = stats.played;
      const winrate = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
      this.dom.miniStatWinrate.textContent = `${winrate}%`;
      this.dom.miniStatStreak.textContent = stats.currentStreak;
    }

    /* ==========================================================================
       7. VAULT ARCHIVE RENDERING (STRICTLY PAST RELEASED ONLY)
       ========================================================================== */
    renderVault() {
      this.dom.vaultList.innerHTML = "";

      // Strictly past released days: (currentDay - 1) down to 0
      const releasedDays = [];
      for (let d = this.currentDay - 1; d >= 0; d--) {
        releasedDays.push(d);
      }

      if (releasedDays.length === 0) {
        this.dom.vaultEmpty.classList.remove("hidden");
        return;
      }

      this.dom.vaultEmpty.classList.add("hidden");

      releasedDays.forEach((dayNum) => {
        const puzzle = getPuzzleForDay(dayNum);
        if (!puzzle) return;

        const saved = this.state.puzzleStates[puzzle.id];
        let statusClass = "unplayed";
        let statusText = "Unplayed";

        if (saved) {
          if (saved.status === "won") {
            statusClass = "solved";
            statusText = "Solved";
          } else if (saved.status === "lost") {
            statusClass = "missed";
            statusText = "Missed";
          }
        }

        const card = document.createElement("div");
        card.className = "vault-item-card";
        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");
        card.innerHTML = `
          <div class="vault-item-info">
            <span class="vault-item-day">Day ${dayNum} — ${puzzle.category}</span>
            <span class="vault-item-meta">${puzzle.difficulty} • ${puzzle.curriculumLevel}</span>
          </div>
          <span class="vault-item-status-badge ${statusClass}">${statusText}</span>
        `;

        const openVaultPuzzle = () => {
          sound.playKeyTap();
          this.loadPuzzle(dayNum);
          this.showScreen(this.dom.gameScreen);
        };

        card.addEventListener("click", openVaultPuzzle);
        card.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openVaultPuzzle();
          }
        });

        this.dom.vaultList.appendChild(card);
      });
    }

    /* ==========================================================================
       8. ACTIVE GAMEPLAY & PUZZLE CONTROLS
       ========================================================================== */
    loadPuzzle(dayIndex) {
      if (dayIndex > this.currentDay) {
        console.warn("Curling Puzzles: Access to unreleased puzzle denied.");
        return;
      }

      const puzzle = getPuzzleForDay(dayIndex);
      if (!puzzle) return;

      this.activeDayIndex = dayIndex;
      this.activePuzzle = puzzle;

      const saved = this.state.puzzleStates[puzzle.id];
      if (saved) {
        this.activeGuessed = new Set(saved.guessedLetters);
        this.activeAttempts = saved.remainingAttempts;
        this.activeStatus = saved.status;
      } else {
        this.activeGuessed = new Set();
        this.activeAttempts = MAX_MISTAKES;
        this.activeStatus = "playing";
      }

      // Top bar info
      this.dom.gameDayTitle.textContent = `Day ${dayIndex}`;
      this.dom.gamePuzzleMeta.textContent = puzzle.category;
      this.dom.gameCategoryChip.textContent = puzzle.category;
      this.dom.gameDifficultyChip.textContent = puzzle.difficulty;
      this.dom.gameClueText.textContent = `Clue: ${puzzle.clue}`;

      this.renderStonesRack();
      this.renderWordTiles();
      this.updateKeyboardStates();

      if (this.activeStatus === "won" || this.activeStatus === "lost") {
        setTimeout(() => this.showResultModal(), 350);
      }
    }

    renderStonesRack() {
      this.dom.stonesRack.innerHTML = "";
      this.dom.stonesCountDisplay.textContent = `${this.activeAttempts} of ${MAX_MISTAKES}`;
      this.dom.stonesRack.setAttribute("aria-label", `${this.activeAttempts} of ${MAX_MISTAKES} stones remaining`);

      for (let i = 0; i < MAX_MISTAKES; i++) {
        const stoneDiv = document.createElement("div");
        const isBurned = i >= this.activeAttempts;
        stoneDiv.className = `stone-item ${isBurned ? "burned" : ""}`;
        stoneDiv.setAttribute("aria-label", isBurned ? "Burned Stone" : "Active Stone");

        const handleCol = i % 2 === 0 ? "#d63b3b" : "#d99b16";
        stoneDiv.innerHTML = `
          <svg viewBox="0 0 40 32" aria-hidden="true">
            <ellipse cx="20" cy="22" rx="16" ry="8" fill="#475569" stroke="#153b5d" stroke-width="1.5"/>
            <ellipse cx="20" cy="18" rx="15" ry="6" fill="#64748b"/>
            <path d="M12 16 C12 8, 28 8, 28 16" fill="none" stroke="${handleCol}" stroke-width="3" stroke-linecap="round"/>
            <circle cx="20" cy="10" r="2.2" fill="#facc15"/>
          </svg>
        `;
        this.dom.stonesRack.appendChild(stoneDiv);
      }
    }

    renderWordTiles() {
      this.dom.wordSlotsContainer.innerHTML = "";
      const word = this.activePuzzle.word.toUpperCase();

      for (let i = 0; i < word.length; i++) {
        const char = word[i];
        const tile = document.createElement("div");
        tile.className = "word-tile";

        if (this.activeGuessed.has(char)) {
          tile.textContent = char;
          tile.classList.add("revealed");
        } else if (this.activeStatus === "lost") {
          tile.textContent = char;
          tile.classList.add("failed-reveal");
        } else {
          tile.textContent = "";
        }
        this.dom.wordSlotsContainer.appendChild(tile);
      }
    }

    buildKeyboard() {
      const rows = [
        ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
        ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
        ["Z", "X", "C", "V", "B", "N", "M"]
      ];

      const containers = [this.dom.kbRow1, this.dom.kbRow2, this.dom.kbRow3];

      rows.forEach((row, rIdx) => {
        const container = containers[rIdx];
        container.innerHTML = "";
        row.forEach((letter) => {
          const btn = document.createElement("button");
          btn.className = "key-btn";
          btn.type = "button";
          btn.textContent = letter;
          btn.dataset.key = letter;
          btn.setAttribute("aria-label", `Letter ${letter}`);

          btn.addEventListener("click", () => {
            sound.init();
            this.handleLetterGuess(letter);
          });
          container.appendChild(btn);
        });
      });
    }

    updateKeyboardStates() {
      if (!this.activePuzzle) return;
      const word = this.activePuzzle.word.toUpperCase();
      const allKeys = document.querySelectorAll(".key-btn");

      allKeys.forEach((btn) => {
        const letter = btn.dataset.key;
        btn.className = "key-btn";
        btn.disabled = false;

        if (this.activeGuessed.has(letter)) {
          btn.disabled = true;
          if (word.includes(letter)) {
            btn.classList.add("key-hit");
          } else {
            btn.classList.add("key-miss");
          }
        }

        if (this.activeStatus !== "playing") {
          btn.disabled = true;
        }
      });
    }

    handleLetterGuess(letter) {
      if (this.activeStatus !== "playing" || !this.activePuzzle) return;
      if (this.activeGuessed.has(letter)) return;

      this.activeGuessed.add(letter);
      const word = this.activePuzzle.word.toUpperCase();

      if (word.includes(letter)) {
        sound.playLetterHit();
        this.announceToScreenReader(`Correct letter ${letter}`);

        const allSolved = word.split("").every((c) => this.activeGuessed.has(c));
        if (allSolved) {
          this.handleGameWin();
        }
      } else {
        this.activeAttempts = Math.max(0, this.activeAttempts - 1);
        sound.playLetterMiss();
        this.announceToScreenReader(`Incorrect letter ${letter}. ${this.activeAttempts} stones remaining.`);

        if (this.activeAttempts <= 0) {
          this.handleGameLoss();
        }
      }

      this.saveActiveGameState();
      this.renderStonesRack();
      this.renderWordTiles();
      this.updateKeyboardStates();
    }

    announceToScreenReader(msg) {
      if (this.dom.srAnnounce) {
        this.dom.srAnnounce.textContent = msg;
      }
    }

    saveActiveGameState() {
      if (!this.activePuzzle) return;
      this.state.puzzleStates[this.activePuzzle.id] = {
        guessedLetters: Array.from(this.activeGuessed),
        remainingAttempts: this.activeAttempts,
        status: this.activeStatus,
        dayIndex: this.activeDayIndex,
        completedAt: this.activeStatus !== "playing" ? new Date().toISOString() : null
      };
      saveStorage(this.state);
    }

    /* ==========================================================================
       9. GAME OUTCOMES & OUTCOME MODAL
       ========================================================================== */
    handleGameWin() {
      this.activeStatus = "won";
      sound.playWin();

      this.recordCompletionStats(true);
      setTimeout(() => this.showResultModal(), 650);
    }

    handleGameLoss() {
      this.activeStatus = "lost";
      sound.playLoss();

      this.recordCompletionStats(false);
      setTimeout(() => this.showResultModal(), 650);
    }

    recordCompletionStats(won) {
      const stats = this.state.stats;
      stats.played++;
      if (won) {
        stats.won++;
        if (this.activeDayIndex === this.currentDay) {
          if (stats.lastPlayedDay === this.currentDay - 1) {
            stats.currentStreak++;
          } else if (stats.lastPlayedDay !== this.currentDay) {
            stats.currentStreak = 1;
          }
        } else {
          stats.currentStreak++;
        }
        if (stats.currentStreak > stats.maxStreak) {
          stats.maxStreak = stats.currentStreak;
        }
      } else {
        if (this.activeDayIndex === this.currentDay) {
          stats.currentStreak = 0;
        }
      }
      stats.lastPlayedDay = this.activeDayIndex;
      saveStorage(this.state);
    }

    showResultModal() {
      const puzzle = this.activePuzzle;
      if (!puzzle) return;

      const won = this.activeStatus === "won";
      this.dom.modalTitle.textContent = won ? "End Cleared!" : "Out of Stones";
      this.dom.modalSubtitle.textContent = won
        ? `You preserved ${this.activeAttempts} stone${this.activeAttempts === 1 ? "" : "s"}!`
        : "The opposition takes the end.";

      this.dom.modalWordText.textContent = puzzle.word;
      this.dom.modalContextText.textContent = puzzle.context || puzzle.clue;

      this.dom.modalBadgeGraphic.innerHTML = won
        ? `<svg viewBox="0 0 36 28" aria-hidden="true">
             <ellipse cx="18" cy="18" rx="15" ry="8" fill="#475569" stroke="#153b5d" stroke-width="1.5"/>
             <ellipse cx="18" cy="16" rx="14" ry="6" fill="#64748b"/>
             <path d="M11 14 C11 7, 25 7, 25 14" fill="none" stroke="#16a34a" stroke-width="3.2" stroke-linecap="round"/>
             <circle cx="18" cy="8" r="2.2" fill="#facc15"/>
           </svg>`
        : `<svg viewBox="0 0 36 28" aria-hidden="true">
             <ellipse cx="18" cy="18" rx="15" ry="8" fill="#475569" stroke="#153b5d" stroke-width="1.5"/>
             <ellipse cx="18" cy="16" rx="14" ry="6" fill="#64748b"/>
             <path d="M11 14 C11 7, 25 7, 25 14" fill="none" stroke="#d63b3b" stroke-width="3.2" stroke-linecap="round"/>
             <circle cx="18" cy="8" r="2.2" fill="#94a3b8"/>
           </svg>`;

      const stats = this.state.stats;
      this.dom.modalStatPlayed.textContent = stats.played;
      const winrate = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
      this.dom.modalStatWinrate.textContent = `${winrate}%`;
      this.dom.modalStatStreak.textContent = stats.currentStreak;
      this.dom.modalStatMaxStreak.textContent = stats.maxStreak;

      this.dom.modalShareLabel.textContent = "Share Result";
      this.dom.resultModal.classList.remove("hidden");
    }

    shareResult() {
      const won = this.activeStatus === "won";
      const stonesLeft = this.activeAttempts;
      const dayNum = this.activeDayIndex;

      let gridStr = "";
      for (let i = 0; i < MAX_MISTAKES; i++) {
        if (i < stonesLeft) {
          gridStr += i % 2 === 0 ? "🔴" : "🟡";
        } else {
          gridStr += "⚪";
        }
      }

      const shareText = `Curling Puzzles: Hangman Day ${dayNum}\nResult: ${won ? "Cleared" : "Burned"} (${stonesLeft}/${MAX_MISTAKES} stones)\n${gridStr}\nhttps://tileworksgamesstudio.github.io/Curling-Menu/`;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareText).then(() => {
          this.dom.modalShareLabel.textContent = "Copied to Clipboard!";
          setTimeout(() => {
            this.dom.modalShareLabel.textContent = "Share Result";
          }, 2000);
        }).catch(() => {
          this.dom.modalShareLabel.textContent = "Share Unavailable";
        });
      }
    }
  }

  // Initialize on DOM Ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => new HangmanApp());
  } else {
    new HangmanApp();
  }
})();