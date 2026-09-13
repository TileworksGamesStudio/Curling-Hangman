/**
 * Daily Hangman Engine — Canadian Curling Championship Edition
 * Master Visual Update Bible Compliant
 * Complete preservation of gameplay logic, scoring, timing, storage, CSV handling
 */
(function () {
  'use strict';

  // Config with Home URL Placeholder (Bible §6)
  const CONFIG = {
    csvPath: './puzzles.csv',
    maxStrikes: 6,
    storageKey: 'universal_hangman_v1',
    homeUrl: 'https://tileworksgamesstudio.github.io/Curling-Menu/' // Replace with supplied main-page URL
  };

  // Safe fallback puzzle records for offline, local, or error recovery (Bible §37, §47)
  const FALLBACK_PUZZLES = [
    {
      date: getTodayString(),
      category: 'CURLING',
      clue: 'The circular scoring area at the end of the curling sheet.',
      answer: 'THE HOUSE',
      note: 'Composed of 12-foot, 8-foot, and 4-foot rings centered on the tee.'
    },
    {
      date: '2025-01-01',
      category: 'CHAMPIONS',
      clue: 'Canadian team captain who directs strategy and throws final stones.',
      answer: 'THE SKIP',
      note: 'The skip holds the broom in the house to indicate the target line.'
    }
  ];

  function getTodayString() {
    try {
      return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(new Date());
    } catch (e) {
      return new Date().toISOString().slice(0, 10);
    }
  }

  // Robust CSV parser supporting quotes & CRLF
  function parseCSV(text) {
    let p = '', row = [''], ret = [row], i = 0, r = 0, s = true;
    for (let l of text) {
      if ('"' === l) {
        if (s && l === p) row[i] += l;
        s = !s;
      } else if (',' === l && s) {
        l = row[++i] = '';
      } else if ('\n' === l && s) {
        if ('\r' === p) row[i] = row[i].slice(0, -1);
        row = ret[++r] = [l = ''];
        i = 0;
      } else {
        row[i] += l;
      }
      p = l;
    }
    if (ret[ret.length - 1].length === 1 && ret[ret.length - 1][0] === '') ret.pop();
    return ret;
  }

  // Graceful State Recovery & Minimal Persistence (Bible §28, §29, §30)
  class Storage {
    static load() {
      try {
        const raw = localStorage.getItem(CONFIG.storageKey);
        if (!raw) return this.defaultData();
        const data = JSON.parse(raw);
        if (!data.stats || !data.history) return this.defaultData();
        return data;
      } catch (e) {
        return this.defaultData();
      }
    }

    static save(data) {
      try {
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(data));
      } catch (e) {}
    }

    static defaultData() {
      return {
        stats: { played: 0, won: 0, currentStreak: 0, maxStreak: 0, distribution: [0, 0, 0, 0, 0, 0, 0] },
        history: {}
      };
    }
  }

  /* ==========================================================================
     PRESENTATIONAL AUDIO & AMBIENT VISUAL SYSTEMS (§29-§32, §62, §10-§14)
     User-gesture safe Web Audio synthesiser and curling icon background spawner
     ========================================================================== */

  class CurlingSoundSystem {
    constructor() {
      this.ctx = null;
      this.isMuted = false;
      this.initOnGesture();
    }

    initOnGesture() {
      const unlock = () => {
        if (!this.ctx) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (AudioContext) {
            this.ctx = new AudioContext();
          }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
        window.removeEventListener('click', unlock);
        window.removeEventListener('touchstart', unlock);
        window.removeEventListener('keydown', unlock);
      };
      window.addEventListener('click', unlock, { once: true, passive: true });
      window.addEventListener('touchstart', unlock, { once: true, passive: true });
      window.addEventListener('keydown', unlock, { once: true, passive: true });
    }

    play(type) {
      if (this.isMuted || !this.ctx || this.ctx.state !== 'running') return;
      try {
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        if (type === 'stone-tap') {
          // Crisp, resonant stone contact
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(320, t);
          osc.frequency.exponentialRampToValueAtTime(140, t + 0.08);
          gain.gain.setValueAtTime(0.12, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
          osc.start(t);
          osc.stop(t + 0.09);
        } else if (type === 'correct') {
          // Uplifting clean chime
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, t); // D5
          osc.frequency.setValueAtTime(880, t + 0.06); // A5
          gain.gain.setValueAtTime(0.14, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
          osc.start(t);
          osc.stop(t + 0.22);
        } else if (type === 'burnt-stone') {
          // Soft muted low tone
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(160, t);
          osc.frequency.linearRampToValueAtTime(90, t + 0.14);
          gain.gain.setValueAtTime(0.10, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
          osc.start(t);
          osc.stop(t + 0.15);
        } else if (type === 'victory') {
          // Three-note championship fanfare
          [523.25, 659.25, 783.99].forEach((freq, idx) => {
            const o = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            o.connect(g);
            g.connect(this.ctx.destination);
            o.type = 'triangle';
            o.frequency.setValueAtTime(freq, t + idx * 0.09);
            g.gain.setValueAtTime(0.12, t + idx * 0.09);
            g.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.09 + 0.3);
            o.start(t + idx * 0.09);
            o.stop(t + idx * 0.09 + 0.3);
          });
        }
      } catch (err) {
        // Fail silently as specified in §62
      }
    }
  }

  class CurlingAmbientBackground {
    constructor() {
      this.container = document.getElementById('curling-icons-layer');
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      // Exactly 12 curling icon types + Canadian Maple Leaf (§10, §65.6)
      this.iconList = [
        'icon-curling-stone',
        'icon-curling-house',
        'icon-curling-broom',
        'icon-brush-head',
        'icon-hack',
        'icon-stone-handle',
        'icon-hog-line',
        'icon-back-line',
        'icon-centre-line',
        'icon-pebble-motif',
        'icon-scoreboard-end',
        'icon-skip-silhouette',
        'symbol-maple-leaf' // Mandatory supplied asset
      ];
      this.activeItems = 0;
      this.maxItems = window.innerWidth < 600 ? 10 : 16;
      this.init();
    }

    init() {
      if (this.reducedMotion || !this.container) return;
      // Pre-populate initial calm background
      for (let i = 0; i < 7; i++) {
        setTimeout(() => this.spawnItem(true), i * 400);
      }
      setInterval(() => this.spawnItem(false), 2400);
    }

    spawnItem(isInitial) {
      if (this.activeItems >= this.maxItems || !this.container) return;
      this.activeItems++;

      const iconId = this.iconList[Math.floor(Math.random() * this.iconList.length)];
      const el = document.createElement('div');
      el.className = 'floating-curling-item';

      // 3 Depth Levels: Distant, Middle, Near (§14)
      const depthTier = Math.random();
      let size, duration, opacity, blur;
      if (depthTier < 0.45) {
        // Distant
        size = 28 + Math.floor(Math.random() * 14);
        duration = 24 + Math.random() * 12;
        opacity = 0.12 + Math.random() * 0.12;
        blur = '1.2px';
      } else if (depthTier < 0.8) {
        // Middle
        size = 44 + Math.floor(Math.random() * 16);
        duration = 17 + Math.random() * 8;
        opacity = 0.22 + Math.random() * 0.12;
        blur = '0.5px';
      } else {
        // Near
        size = 62 + Math.floor(Math.random() * 20);
        duration = 12 + Math.random() * 6;
        opacity = 0.32 + Math.random() * 0.15;
        blur = '0px';
      }

      const posX = Math.random() * 92;
      const driftX = (Math.random() - 0.5) * 70;
      const spinRot = (Math.random() - 0.5) * 80;

      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.left = `${posX}%`;
      el.style.setProperty('--item-opacity', opacity);
      el.style.setProperty('--drift-x', `${driftX}px`);
      el.style.setProperty('--spin-rot', `${spinRot}deg`);
      el.style.animationDuration = `${duration}s`;
      el.style.filter = blur !== '0px' ? `blur(${blur})` : 'none';

      if (isInitial) {
        const randomStart = Math.random() * (duration * 0.7);
        el.style.animationDelay = `-${randomStart}s`;
      }

      if (iconId === 'symbol-maple-leaf') {
        el.innerHTML = `<svg viewBox="0 0 298.72 341.12"><use href="#${iconId}"></use></svg>`;
      } else {
        el.innerHTML = `<svg viewBox="0 0 100 100"><use href="#${iconId}"></use></svg>`;
      }

      this.container.appendChild(el);

      setTimeout(() => {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
          this.activeItems = Math.max(0, this.activeItems - 1);
        }
      }, duration * 1000);
    }
  }

  /* ==========================================================================
     CORE HANGMAN ENGINE (§2, §3, §27)
     ========================================================================== */

  class HangmanGame {
    constructor() {
      this.store = Storage.load();
      this.today = getTodayString();
      this.puzzles = [];
      this.todayPuzzle = null;
      this.archivePuzzles = [];
      this.activePuzzle = null;
      this.guessedLetters = new Set();
      this.strikes = 0;
      this.isGameOver = false;

      this.sound = new CurlingSoundSystem();
      this.bg = new CurlingAmbientBackground();

      this.cacheDom();
      this.initEvents();
    }

    cacheDom() {
      this.dom = {
        // Screens
        menuScreen: document.getElementById('menu-screen'),
        vaultScreen: document.getElementById('vault-screen'),
        gameScreen: document.getElementById('game-screen'),

        // Menu Elements
        dailyStatusTag: document.getElementById('daily-status-tag'),
        dailyCardClue: document.getElementById('daily-card-clue'),
        dailyCardMeta: document.getElementById('daily-card-meta'),
        menuPlayBtn: document.getElementById('menu-play-btn'),
        menuVaultBtn: document.getElementById('menu-vault-btn'),
        menuHomeBtn: document.getElementById('menu-home-btn'),
        vaultCountBadge: document.getElementById('vault-count-badge'),
        menuStatsBtn: document.getElementById('menu-stats-btn'),
        menuRulesBtn: document.getElementById('menu-rules-btn'),

        // Vault Elements
        vaultBackBtn: document.getElementById('vault-back-btn'),
        vaultList: document.getElementById('vault-list'),

        // Gameplay Elements
        gameBackBtn: document.getElementById('game-back-btn'),
        puzzleTitle: document.getElementById('puzzle-title'),
        strikeCountText: document.getElementById('strike-count-text'),
        strikePips: document.getElementById('strike-pips'),
        wordBoard: document.getElementById('word-board'),
        gameCategoryTag: document.getElementById('game-category-tag'),
        gameClueText: document.getElementById('game-clue-text'),
        keyboard: document.getElementById('keyboard'),

        // Modals & Announcements
        statsModal: document.getElementById('stats-modal'),
        rulesModal: document.getElementById('rules-modal'),
        resultModal: document.getElementById('result-modal'),
        statPlayed: document.getElementById('stat-played'),
        statWinRate: document.getElementById('stat-win-rate'),
        statStreak: document.getElementById('stat-streak'),
        statMaxStreak: document.getElementById('stat-max-streak'),
        strikeDistributionBars: document.getElementById('strike-distribution-bars'),
        resultStatusBadge: document.getElementById('result-status-badge'),
        resultAnswer: document.getElementById('result-answer'),
        resultNote: document.getElementById('result-note'),
        resultShareBtn: document.getElementById('result-share-btn'),
        resultMenuBtn: document.getElementById('result-menu-btn'),
        shareToast: document.getElementById('share-toast'),
        announcer: document.getElementById('screen-reader-feed')
      };

      // Set placeholder home link
      this.dom.menuHomeBtn.setAttribute('href', CONFIG.homeUrl);
      this.dom.menuHomeBtn.onclick = (e) => {
        if (CONFIG.homeUrl === '#') {
          e.preventDefault();
          this.announce('Home button activated (URL placeholder ready).');
        }
      };
    }

    async init() {
      try {
        const res = await fetch(CONFIG.csvPath);
        if (!res.ok) throw new Error('CSV network issue');
        const csvText = await res.text();
        this.processPuzzles(csvText);
      } catch (err) {
        // Fallback gracefully without breaking (Bible §37, §49)
        this.puzzles = FALLBACK_PUZZLES;
        this.partitionPuzzles();
        this.renderMenu();
      }
    }

    processPuzzles(csvText) {
      const rows = parseCSV(csvText);
      if (rows.length < 2) {
        this.puzzles = FALLBACK_PUZZLES;
      } else {
        const headers = rows[0].map(h => h.trim().toLowerCase());
        this.puzzles = [];

        for (let i = 1; i < rows.length; i++) {
          if (rows[i].length !== headers.length) continue;
          const item = {};
          headers.forEach((h, idx) => item[h] = rows[i][idx].trim());
          if (item.date && /^\d{4}-\d{2}-\d{2}$/.test(item.date) && item.answer) {
            this.puzzles.push(item);
          }
        }
      }

      if (this.puzzles.length === 0) this.puzzles = FALLBACK_PUZZLES;
      this.partitionPuzzles();
      this.renderMenu();
    }

    partitionPuzzles() {
      this.todayPuzzle = this.puzzles.find(p => p.date === this.today) || null;
      // Vault contains all past puzzles, never duplicating today's active puzzle (Bible §5)
      this.archivePuzzles = this.puzzles
        .filter(p => p.date < this.today)
        .sort((a, b) => b.date.localeCompare(a.date));

      this.dom.vaultCountBadge.textContent = `${this.archivePuzzles.length} Available`;
    }

    showScreen(target) {
      [this.dom.menuScreen, this.dom.vaultScreen, this.dom.gameScreen].forEach(s => {
        s.classList.remove('screen-active');
      });
      target.classList.add('screen-active');
      window.scrollTo(0, 0);
    }

    renderMenu() {
      this.showScreen(this.dom.menuScreen);

      if (!this.todayPuzzle) {
        this.dom.dailyStatusTag.textContent = 'Unavailable';
        this.dom.dailyStatusTag.className = 'status-badge';
        this.dom.dailyCardClue.textContent = 'No daily puzzle scheduled for today. Check the Vault for previous challenges.';
        this.dom.dailyCardMeta.textContent = '';
        this.dom.menuPlayBtn.disabled = true;
        this.dom.menuPlayBtn.textContent = 'Unavailable';
        return;
      }

      const p = this.todayPuzzle;
      const rec = this.store.history[p.date];
      this.dom.dailyCardClue.textContent = p.clue;
      this.dom.dailyCardMeta.textContent = `Category: ${p.category}`;
      this.dom.menuPlayBtn.disabled = false;

      if (rec && rec.completed) {
        this.dom.dailyStatusTag.textContent = rec.won ? '✓ Solved' : '✕ Failed';
        this.dom.dailyStatusTag.className = `status-badge ${rec.won ? 'badge-ready' : 'badge-done'}`;
        this.dom.menuPlayBtn.textContent = 'Review Puzzle';
      } else if (rec && rec.guesses && rec.guesses.length > 0) {
        this.dom.dailyStatusTag.textContent = '● In Progress';
        this.dom.dailyStatusTag.className = 'status-badge badge-progress';
        this.dom.menuPlayBtn.textContent = 'Resume Puzzle';
      } else {
        this.dom.dailyStatusTag.textContent = 'Ready';
        this.dom.dailyStatusTag.className = 'status-badge badge-ready';
        this.dom.menuPlayBtn.textContent = 'Play Daily';
      }
    }

    loadPuzzle(puzzle) {
      this.activePuzzle = puzzle;
      this.guessedLetters.clear();
      this.strikes = 0;
      this.isGameOver = false;

      // Set header to puzzle date/title only (Bible §7)
      const isDaily = puzzle.date === this.today;
      this.dom.puzzleTitle.textContent = isDaily ? `Daily: ${puzzle.date}` : `Vault: ${puzzle.date}`;
      this.dom.gameCategoryTag.textContent = puzzle.category || 'Category';
      this.dom.gameClueText.textContent = puzzle.clue || '';

      const rec = this.store.history[puzzle.date];
      if (rec) {
        (rec.guesses || []).forEach(l => this.guessedLetters.add(l));
        this.strikes = rec.strikes || 0;
        this.isGameOver = rec.completed || false;
      }

      this.renderApparatus();
      this.renderBoard();
      this.renderKeyboard();

      this.showScreen(this.dom.gameScreen);

      if (this.isGameOver) {
        setTimeout(() => this.showResult(rec.won), 350);
      }
    }

    renderApparatus() {
      // SVG strikes
      for (let i = 1; i <= CONFIG.maxStrikes; i++) {
        const part = document.getElementById(`strike-${i}`);
        if (part) part.classList.toggle('active', i <= this.strikes);
      }
      this.dom.strikeCountText.textContent = `${this.strikes} / ${CONFIG.maxStrikes}`;

      // Tactile Pips
      this.dom.strikePips.innerHTML = '';
      for (let i = 1; i <= CONFIG.maxStrikes; i++) {
        const pip = document.createElement('div');
        pip.className = `strike-pip ${i <= this.strikes ? 'pip-struck' : ''}`;
        this.dom.strikePips.appendChild(pip);
      }
    }

    renderBoard() {
      this.dom.wordBoard.innerHTML = '';
      const phrase = (this.activePuzzle.answer || '').toUpperCase();
      const words = phrase.split(' ');

      words.forEach(word => {
        const group = document.createElement('div');
        group.className = 'word-group';

        for (const char of word) {
          const slot = document.createElement('div');
          slot.className = 'letter-slot';

          if (/[A-Z0-9]/.test(char)) {
            const isGuessed = this.guessedLetters.has(char);
            const showMissed = this.isGameOver && !isGuessed;

            if (isGuessed || showMissed) {
              slot.textContent = char;
              slot.classList.add('revealed');
              if (showMissed) slot.classList.add('missed');
            } else {
              slot.textContent = '';
            }
          } else {
            slot.textContent = char;
            slot.classList.add('punctuation');
          }
          group.appendChild(slot);
        }
        this.dom.wordBoard.appendChild(group);
      });
    }

    renderKeyboard() {
      this.dom.keyboard.innerHTML = '';
      const rows = [
        ['Q','W','E','R','T','Y','U','I','O','P'],
        ['A','S','D','F','G','H','J','K','L'],
        ['Z','X','C','V','B','N','M']
      ];
      const answer = (this.activePuzzle.answer || '').toUpperCase();

      rows.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'keyboard-row';

        row.forEach(letter => {
          const btn = document.createElement('button');
          btn.className = 'key-btn';
          btn.textContent = letter;
          btn.setAttribute('data-key', letter);
          btn.setAttribute('aria-label', `Letter ${letter}`);

          if (this.guessedLetters.has(letter)) {
            btn.disabled = true;
            btn.classList.add(answer.includes(letter) ? 'key-correct' : 'key-wrong');
          }

          btn.onclick = () => this.handleGuess(letter);
          rowDiv.appendChild(btn);
        });

        this.dom.keyboard.appendChild(rowDiv);
      });
    }

    handleGuess(letter) {
      if (this.isGameOver || this.guessedLetters.has(letter)) return;
      this.guessedLetters.add(letter);

      const answer = (this.activePuzzle.answer || '').toUpperCase();
      const isCorrect = answer.includes(letter);

      if (!isCorrect) {
        this.strikes++;
        this.sound.play('burnt-stone');
        this.announce(`Incorrect guess. Letter ${letter} is not in the word.`);
      } else {
        this.sound.play('correct');
        this.announce(`Correct guess! Letter ${letter} revealed.`);
      }

      this.renderApparatus();
      this.renderBoard();

      const btn = this.dom.keyboard.querySelector(`button[data-key="${letter}"]`);
      if (btn) {
        btn.disabled = true;
        btn.classList.add(isCorrect ? 'key-correct' : 'key-wrong');
      }

      this.checkGameState();
      this.saveProgress();
    }

    checkGameState() {
      const clean = (this.activePuzzle.answer || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      const won = clean.split('').every(l => this.guessedLetters.has(l));

      if (won) {
        this.endGame(true);
      } else if (this.strikes >= CONFIG.maxStrikes) {
        this.endGame(false);
      }
    }

    endGame(won) {
      this.isGameOver = true;
      this.saveProgress(true, won);

      const s = this.store.stats;
      s.played++;
      if (won) {
        s.won++;
        s.currentStreak++;
        s.maxStreak = Math.max(s.maxStreak, s.currentStreak);
        if (s.distribution[this.strikes] !== undefined) {
          s.distribution[this.strikes]++;
        }
        this.sound.play('victory');
      } else {
        s.currentStreak = 0;
        if (s.distribution[CONFIG.maxStrikes] !== undefined) {
          s.distribution[CONFIG.maxStrikes]++;
        }
      }
      Storage.save(this.store);

      this.renderBoard();
      setTimeout(() => this.showResult(won), 450);
    }

    saveProgress(completed = false, won = false) {
      const dateKey = this.activePuzzle.date;
      const prev = this.store.history[dateKey] || {};
      this.store.history[dateKey] = {
        completed: completed || prev.completed || false,
        won: completed ? won : (prev.won || false),
        strikes: this.strikes,
        guesses: Array.from(this.guessedLetters)
      };
      Storage.save(this.store);
    }

    showResult(won) {
      this.dom.resultStatusBadge.textContent = won ? '✓ Solved' : '✕ Puzzle Over';
      this.dom.resultStatusBadge.className = `result-banner ${won ? 'banner-win' : 'banner-loss'}`;
      this.dom.resultAnswer.textContent = (this.activePuzzle.answer || '').toUpperCase();
      this.dom.resultNote.textContent = this.activePuzzle.note || '';
      this.openDialog(this.dom.resultModal);
    }

    renderVault() {
      this.dom.vaultList.innerHTML = '';

      if (this.archivePuzzles.length === 0) {
        this.dom.vaultList.innerHTML = '<p class="empty-state">No past puzzles available yet.</p>';
      } else {
        this.archivePuzzles.forEach(p => {
          const rec = this.store.history[p.date];
          const item = document.createElement('div');
          item.className = 'vault-item';

          let statusTag = 'Unplayed';
          let tagClass = 'status-badge';
          if (rec && rec.completed) {
            statusTag = rec.won ? '✓ Solved' : '✕ Failed';
            tagClass = `status-badge ${rec.won ? 'badge-ready' : 'badge-done'}`;
          } else if (rec && rec.guesses && rec.guesses.length > 0) {
            statusTag = '● In Progress';
            tagClass = 'status-badge badge-progress';
          }

          item.innerHTML = `
            <div class="vault-meta">
              <span class="vault-date">${p.date}</span>
              <span class="vault-category">${p.category}</span>
            </div>
            <div class="vault-actions">
              <span class="${tagClass}">${statusTag}</span>
              <button class="btn btn-secondary btn-icon-back" aria-label="Open puzzle from ${p.date}">
                ${rec?.completed ? 'Review' : 'Play'}
              </button>
            </div>
          `;

          item.querySelector('button').onclick = () => {
            this.sound.play('stone-tap');
            this.loadPuzzle(p);
          };
          this.dom.vaultList.appendChild(item);
        });
      }

      this.showScreen(this.dom.vaultScreen);
    }

    openStats() {
      const s = this.store.stats;
      this.dom.statPlayed.textContent = s.played;
      this.dom.statWinRate.textContent = `${s.played ? Math.round((s.won / s.played) * 100) : 0}%`;
      this.dom.statStreak.textContent = s.currentStreak;
      this.dom.statMaxStreak.textContent = s.maxStreak;

      this.dom.strikeDistributionBars.innerHTML = '';
      const maxVal = Math.max(...s.distribution, 1);
      for (let i = 0; i <= CONFIG.maxStrikes; i++) {
        const row = document.createElement('div');
        row.className = 'dist-bar-row';
        const val = s.distribution[i] || 0;
        const pct = Math.round((val / maxVal) * 100);
        const label = i === CONFIG.maxStrikes ? '✕' : `${i}`;

        row.innerHTML = `
          <span style="width: 14px; text-align: center;">${label}</span>
          <div class="dist-bar-track">
            <div class="dist-bar-fill" style="width: ${pct}%;"></div>
          </div>
          <span style="width: 20px; text-align: right;">${val}</span>
        `;
        this.dom.strikeDistributionBars.appendChild(row);
      }

      this.openDialog(this.dom.statsModal);
    }

    shareResult() {
      this.sound.play('stone-tap');
      const rec = this.store.history[this.activePuzzle.date];
      const outcome = rec?.won ? `Solved (${this.strikes}/${CONFIG.maxStrikes})` : `Failed (${CONFIG.maxStrikes}/${CONFIG.maxStrikes})`;
      const shareText = `Hangman • ${this.activePuzzle.date}\n${outcome}\n` +
        Array.from({ length: CONFIG.maxStrikes })
          .map((_, i) => (i < this.strikes ? '🟥' : '🟨'))
          .join('') +
        `\n${window.location.href}`;

      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(shareText).then(() => {
          this.dom.shareToast.classList.add('show');
          setTimeout(() => this.dom.shareToast.classList.remove('show'), 2200);
        }).catch(() => prompt('Copy result:', shareText));
      } else {
        prompt('Copy result:', shareText);
      }
    }

    announce(msg) {
      if (this.dom.announcer) {
        this.dom.announcer.textContent = msg;
      }
    }

    openDialog(dialog) {
      this.sound.play('stone-tap');
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', 'true');
      }
    }

    closeDialog(dialog) {
      this.sound.play('stone-tap');
      if (typeof dialog.close === 'function') {
        dialog.close();
      } else {
        dialog.removeAttribute('open');
      }
    }

    initEvents() {
      // Primary Menu Controls
      this.dom.menuPlayBtn.onclick = () => {
        this.sound.play('stone-tap');
        if (this.todayPuzzle) this.loadPuzzle(this.todayPuzzle);
      };
      this.dom.menuVaultBtn.onclick = () => {
        this.sound.play('stone-tap');
        this.renderVault();
      };
      this.dom.vaultBackBtn.onclick = () => {
        this.sound.play('stone-tap');
        this.renderMenu();
      };
      this.dom.gameBackBtn.onclick = () => {
        this.sound.play('stone-tap');
        this.renderMenu(); // Game -> Back -> Game Menu (Bible §7)
      };

      // Utility Modals
      this.dom.menuStatsBtn.onclick = () => this.openStats();
      this.dom.menuRulesBtn.onclick = () => this.openDialog(this.dom.rulesModal);
      this.dom.resultMenuBtn.onclick = () => {
        this.closeDialog(this.dom.resultModal);
        this.renderMenu();
      };
      this.dom.resultShareBtn.onclick = () => this.shareResult();

      // Generic Dialog Close Triggers
      document.querySelectorAll('[data-close]').forEach(btn => {
        btn.onclick = (e) => this.closeDialog(e.target.closest('dialog'));
      });

      document.querySelectorAll('dialog').forEach(d => {
        d.onclick = (e) => {
          if (e.target === d) this.closeDialog(d);
        };
      });

      // Physical Keyboard Guesses
      window.addEventListener('keydown', e => {
        if (document.querySelector('dialog[open]')) return;
        if (!this.dom.gameScreen.classList.contains('screen-active')) return;
        const key = e.key.toUpperCase();
        if (/^[A-Z]$/.test(key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
          this.handleGuess(key);
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    new HangmanGame().init();
  });
})();