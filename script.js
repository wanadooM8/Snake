// Snake Mignon - JavaScript Game
(() => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  let W = canvas.width, H = canvas.height;

  // DOM Elements
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const startBtn = document.getElementById('startBtn');
  const restartBtn = document.getElementById('restartBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const difficulty = document.getElementById('difficulty');
  const gridRange = document.getElementById('gridRange');
  const gridVal = document.getElementById('gridVal');
  const speedLabel = document.getElementById('speedLabel');
  const gameOverOverlay = document.getElementById('gameOverOverlay');
  const finalScoreEl = document.getElementById('finalScore');
  const restartGameBtn = document.getElementById('restartGameBtn');

  // Touch controls
  const upBtn = document.getElementById('up');
  const downBtn = document.getElementById('down');
  const leftBtn = document.getElementById('left');
  const rightBtn = document.getElementById('right');

  // Game Constants & State
  let gridSize = 20; // pixels per cell
  let cols = Math.floor(W / gridSize);
  let rows = Math.floor(H / gridSize);

  const STORAGE_KEY = 'snake_best_score';
  let best = Number(localStorage.getItem(STORAGE_KEY) || 0);
  bestEl.textContent = best;

  let snake = [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }];
  let dir = { x: 1, y: 0 };
  let nextDir = { x: 1, y: 0 };
  let food = null;
  let obstacles = []; // Buissons/obstacles
  let score = 0;
  let running = false;
  let paused = false;

  let lastTime = 0;
  let accum = 0;
  let baseTick = 100; // ms per game tick
  let speedFactor = Number(difficulty.value);

  // Update speed label
  function updateSpeedLabel() {
    const map = { '0.9': '🐢 Facile', '1.0': '🐇 Normal', '1.12': '⚡ Rapide', '1.25': '🔥 Furie' };
    speedLabel.textContent = map[String(speedFactor)] || 'Custom';
  }
  updateSpeedLabel();

  // Grid range change
  gridRange.addEventListener('input', () => {
    gridSize = Number(gridRange.value);
    gridVal.textContent = gridSize;
    cols = Math.floor(W / gridSize);
    rows = Math.floor(H / gridSize);
    reset();
  });

  // Difficulty change
  difficulty.addEventListener('change', () => {
    speedFactor = Number(difficulty.value);
    updateSpeedLabel();
  });

  // Generate obstacles (bushes)
  function generateObstacles() {
    obstacles = [];
    const numObstacles = Math.floor((cols * rows) * 0.08); // 8% du terrain
    
    for (let i = 0; i < numObstacles; i++) {
      let x, y, valid;
      let attempts = 0;
      
      do {
        x = Math.floor(Math.random() * cols);
        y = Math.floor(Math.random() * rows);
        
        // Vérifier que ce n'est pas au centre (position de départ du serpent)
        const centerX = Math.floor(cols / 2);
        const centerY = Math.floor(rows / 2);
        const distFromCenter = Math.abs(x - centerX) + Math.abs(y - centerY);
        
        valid = distFromCenter > 3 && 
                !obstacles.some(o => o.x === x && o.y === y);
        attempts++;
      } while (!valid && attempts < 50);
      
      if (valid) {
        obstacles.push({ x, y });
      }
    }
  }

  // Spawn food at random location
  function spawnFood() {
    while (true) {
      const x = Math.floor(Math.random() * cols);
      const y = Math.floor(Math.random() * rows);
      if (!snake.some(s => s.x === x && s.y === y) && 
          !obstacles.some(o => o.x === x && o.y === y)) {
        food = { x, y };
        break;
      }
    }
  }

  // Reset game
  function reset() {
    snake = [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    food = null;
    generateObstacles(); // Générer les obstacles
    spawnFood();
    score = 0;
    scoreEl.textContent = score;
    running = false;
    paused = false;
    accum = 0;
    lastTime = 0;
    gameOverOverlay.style.display = 'none';
    draw();
  }

  // Start game
  function start() {
    if (running) return;
    running = true;
    paused = false;
    lastTime = performance.now();
    startBtn.textContent = '⏸ En cours';
    requestAnimationFrame(loop);
  }

  // Toggle pause
  function togglePause() {
    if (!running) return;
    paused = !paused;
    pauseBtn.textContent = paused ? '▶ Reprendre' : '⏸ Pause';
    if (!paused) {
      lastTime = performance.now();
      requestAnimationFrame(loop);
    }
  }

  // Set direction with 180 check
  function setDir(x, y) {
    if (x === -dir.x && y === -dir.y) return; // prevent 180 turn
    nextDir = { x, y };
    if (!running) start();
  }

  // Keyboard controls
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') setDir(0, -1);
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') setDir(0, 1);
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') setDir(-1, 0);
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') setDir(1, 0);
    if (e.key === ' ') togglePause();
  });

  // Touch controls
  upBtn?.addEventListener('click', () => setDir(0, -1));
  downBtn?.addEventListener('click', () => setDir(0, 1));
  leftBtn?.addEventListener('click', () => setDir(-1, 0));
  rightBtn?.addEventListener('click', () => setDir(1, 0));

  // Mobile swipe
  let touchStart = null;
  canvas.addEventListener('touchstart', (e) => {
    const t = e.changedTouches[0];
    touchStart = { x: t.clientX, y: t.clientY };
  });
  canvas.addEventListener('touchend', (e) => {
    if (!touchStart) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.x;
    const dy = t.clientY - touchStart.y;
    if (Math.abs(dx) > Math.abs(dy)) setDir(Math.sign(dx), 0);
    else setDir(0, Math.sign(dy));
    touchStart = null;
  });

  // Button controls
  startBtn.addEventListener('click', () => {
    if (!running) {
      reset();
      start();
    }
  });
  restartBtn.addEventListener('click', () => {
    reset();
    start();
    startBtn.textContent = '▶ Démarrer';
  });
  restartGameBtn.addEventListener('click', () => {
    reset();
    start();
  });
  pauseBtn.addEventListener('click', togglePause);

  // Game loop
  function loop(t) {
    if (!running) return;
    if (paused) {
      lastTime = t;
      requestAnimationFrame(loop);
      return;
    }

    const tick = baseTick / speedFactor;
    const elapsed = t - lastTime;
    lastTime = t;
    accum += elapsed;

    while (accum >= tick) {
      accum -= tick;
      update();
    }

    draw();
    requestAnimationFrame(loop);
  }

  // Game update
  function update() {
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    // Check collision with borders
    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
      gameOver();
      return;
    }

    // Check collision with self
    if (snake.some(s => s.x === head.x && s.y === head.y)) {
      gameOver();
      return;
    }

    snake.unshift(head);

    // Check if food eaten
    if (head.x === food.x && head.y === food.y) {
      score += Math.floor(10 * speedFactor);
      scoreEl.textContent = score;
      spawnFood();
    } else {
      snake.pop();
    }
  }

  // Game over
  function gameOver() {
    running = false;
    startBtn.textContent = '▶ Démarrer';
    pauseBtn.textContent = '⏸ Pause';

    if (score > best) {
      best = score;
      localStorage.setItem(STORAGE_KEY, best);
      bestEl.textContent = best;
    }

    // Afficher le message Game Over
    finalScoreEl.textContent = score;
    gameOverOverlay.style.display = 'flex';
  }

  // Drawing
  function draw() {
    // Clear canvas
    ctx.fillStyle = '#fffaf0';
    ctx.fillRect(0, 0, W, H);

    // Draw grid (subtle)
    ctx.strokeStyle = 'rgba(255, 192, 225, 0.1)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= cols; i++) {
      const x = i * gridSize;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let i = 0; i <= rows; i++) {
      const y = i * gridSize;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Draw obstacles (buissons)
    ctx.fillStyle = '#b8e6b8'; // Vert pastel
    obstacles.forEach(obs => {
      const ox = obs.x * gridSize;
      const oy = obs.y * gridSize;
      const cx = ox + gridSize / 2;
      const cy = oy + gridSize / 2;
      const radius = gridSize * 0.4;

      // Dessiner 3 cercles pour faire un buisson
      ctx.beginPath();
      ctx.arc(cx - radius * 0.4, cy, radius * 0.7, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(cx + radius * 0.4, cy, radius * 0.7, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(cx, cy - radius * 0.3, radius * 0.8, 0, Math.PI * 2);
      ctx.fill();

      // Ombre plus foncée pour le détail
      ctx.fillStyle = '#a0d4a0';
      ctx.beginPath();
      ctx.arc(cx, cy + radius * 0.2, radius * 0.4, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#b8e6b8'; // Restaurer la couleur
    });

    // Draw food (pomme pastel)
    if (food) {
      const fx = food.x * gridSize;
      const fy = food.y * gridSize;
      const cx = fx + gridSize / 2;
      const cy = fy + gridSize / 2;

      // Main apple
      ctx.fillStyle = '#ff4444';
      roundRect(ctx, fx + 2, fy + 2, gridSize - 4, gridSize - 4, 6);
      ctx.fill();

      // Stem
      ctx.fillStyle = '#b8e6b8';
      ctx.fillRect(cx - 1, fy + 2, 2, gridSize / 4);

      // Shine
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(fx + gridSize * 0.3, fy + gridSize * 0.3, gridSize * 0.15, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw snake
    for (let i = 0; i < snake.length; i++) {
      const seg = snake[i];
      const sx = seg.x * gridSize;
      const sy = seg.y * gridSize;

      if (i === 0) {
        // Head
        ctx.fillStyle = '#5a9fff';
        ctx.shadowColor = 'rgba(90, 159, 255, 0.5)';
        ctx.shadowBlur = 8;
        roundRect(ctx, sx + 1, sy + 1, gridSize - 2, gridSize - 2, 5);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Eyes
        ctx.fillStyle = '#5a5a5a';
        const eyeSize = gridSize * 0.12;
        const eyeOffset = gridSize * 0.25;
        ctx.beginPath();
        ctx.arc(sx + eyeOffset, sy + eyeOffset, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(sx + gridSize - eyeOffset, sy + eyeOffset, eyeSize, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Body - gradient from head color to tail
        const t = i / snake.length;
        const alpha = Math.max(0.3, 1 - t * 0.5);
        ctx.fillStyle = `rgba(90, 159, 255, ${alpha})`;
        roundRect(ctx, sx + 1, sy + 1, gridSize - 2, gridSize - 2, 4);
        ctx.fill();
      }
    }
  }

  // Helper: rounded rectangle
  function roundRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // Initial draw
  reset();
})();

  // responsive canvas
  function resize() {
    const rect = canvas.getBoundingClientRect();
    // keep internal resolution higher for crispness
    canvas.width = Math.floor(rect.width * devicePixelRatio);
    canvas.height = Math.floor(rect.height * devicePixelRatio);
    W = canvas.width; H = canvas.height;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    draw();
  }
  window.addEventListener('resize', debounce(resize, 120));

  gridVal.textContent = gridSize;
  gridRange.addEventListener('input', () => {
    gridSize = Number(gridRange.value);
    gridVal.textContent = gridSize;
    reset();
  });

  const STORAGE_KEY = 'snake_stylise_best';
  let best = Number(localStorage.getItem(STORAGE_KEY) || 0);
  bestEl.textContent = best;

  let lastTime = 0;
  let accum = 0;
  let baseTick = 100; // ms per game tick at base speed
  let speedFactor = Number(difficulty.value);

  difficulty.addEventListener('change', () => {
    speedFactor = Number(difficulty.value);
    updateSpeedLabel();
  });
  updateSpeedLabel();

  function updateSpeedLabel() {
    const val = Number(difficulty.value);
    const map = { '0.9': 'Facile', '1.0': 'Normal', '1.12': 'Rapide', '1.25': 'Furie' };
    speedLabel.textContent = map[String(val)] || 'Custom';
  }

  // snake
  let snake, dir, nextDir, food, running = false, paused = false;

  function reset() {
    // grid in cells
    const cols = Math.floor((canvas.width / devicePixelRatio) / gridSize);
    const rows = Math.floor((canvas.height / devicePixelRatio) / gridSize);
    snake = [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }];
    dir = { x: 1, y: 0 };
    nextDir = { ...dir };
    food = null;
    spawnFood();
    score = 0;
    scoreEl.textContent = score;
    running = false;
    paused = false;
    accum = 0;
    lastTime = 0;
    draw();
  }

  function start() {
    running = true;
    paused = false;
    lastTime = performance.now();
    requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
  }

  function togglePause() {
    paused = !paused;
    pauseBtn.textContent = paused ? 'Reprendre' : 'Pause';
    if (!paused && running) {
      lastTime = performance.now();
      requestAnimationFrame(loop);
    }
  }

  function spawnFood() {
    const cols = Math.floor((canvas.width / devicePixelRatio) / gridSize);
    const rows = Math.floor((canvas.height / devicePixelRatio) / gridSize);
    while (true) {
      const x = Math.floor(Math.random() * cols);
      const y = Math.floor(Math.random() * rows);
      if (!snake.some(s => s.x === x && s.y === y)) {
        food = { x, y };
        break;
      }
    }
  }

  // controls
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') setDir(0, -1);
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') setDir(0, 1);
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') setDir(-1, 0);
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') setDir(1, 0);
    if (e.key === ' ') { togglePause(); }
  });

  upBtn?.addEventListener('click', () => setDir(0, -1));
  downBtn?.addEventListener('click', () => setDir(0, 1));
  leftBtn?.addEventListener('click', () => setDir(-1, 0));
  rightBtn?.addEventListener('click', () => setDir(1, 0));

  // simple swipe for mobile
  let touchStart = null;
  canvas.addEventListener('touchstart', (e) => {
    const t = e.changedTouches[0];
    touchStart = { x: t.clientX, y: t.clientY };
  });
  canvas.addEventListener('touchend', (e) => {
    if (!touchStart) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.x, dy = t.clientY - touchStart.y;
    if (Math.abs(dx) > Math.abs(dy)) setDir(Math.sign(dx), 0);
    else setDir(0, Math.sign(dy));
    touchStart = null;
  });

  function setDir(x, y) {
    // prevent 180 turn
    if (x === -dir.x && y === -dir.y) return;
    nextDir = { x, y };
    if (!running) { start(); }
  }

  // game loop
  let score = 0;
  function loop(t) {
    if (!running) return;
    if (paused) {
      lastTime = t;
      requestAnimationFrame(loop);
      return;
    }
    const tick = baseTick / speedFactor;
    const elapsed = t - lastTime;
    lastTime = t;
    accum += elapsed;
    // run zero or more ticks depending on accum
    while (accum >= tick) {
      accum -= tick;
      tickUpdate();
    }
    draw();
    requestAnimationFrame(loop);
  }

  function tickUpdate() {
    // apply queued direction
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    const cols = Math.floor((canvas.width / devicePixelRatio) / gridSize);
    const rows = Math.floor((canvas.height / devicePixelRatio) / gridSize);

    // COLLISION WITH BORDERS - NO WRAP-AROUND, GAME OVER
    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
      // game over
      running = false;
      if (score > best) {
        best = score;
        localStorage.setItem(STORAGE_KEY, best);
        bestEl.textContent = best;
      }
      createGameOverParticles(head.x, head.y);
      return;
    }

    // collision with self
    if (snake.some(s => s.x === head.x && s.y === head.y)) {
      // game over
      running = false;
      if (score > best) {
        best = score;
        localStorage.setItem(STORAGE_KEY, best);
        bestEl.textContent = best;
      }
      createGameOverParticles(head.x, head.y);
      return;
    }

    snake.unshift(head);

    // ate food?
    if (head.x === food.x && head.y === food.y) {
      score += Math.floor(10 * speedFactor);
      scoreEl.textContent = score;
      spawnFood();
      createEatFlash(head.x, head.y);
    } else {
      snake.pop();
    }
  }

  // rendering
  let particles = [];
  function draw() {
    // clear with slight vignette
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // background glow
    const grd = ctx.createLinearGradient(0, 0, W, H);
    grd.addColorStop(0, 'rgba(124,92,255,0.06)');
    grd.addColorStop(1, 'rgba(0,245,160,0.02)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    // draw grid subtle
    const cols = Math.floor((canvas.width / devicePixelRatio) / gridSize);
    const rows = Math.floor((canvas.height / devicePixelRatio) / gridSize);

    // Draw grid lines (optional subtle grid)
    ctx.strokeStyle = 'rgba(255,255,255,0.02)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= cols; i++) {
      const x = i * gridSize;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height / devicePixelRatio);
      ctx.stroke();
    }
    for (let i = 0; i <= rows; i++) {
      const y = i * gridSize;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width / devicePixelRatio, y);
      ctx.stroke();
    }

    // draw food (pomme stylisée)
    if (food) {
      drawCell(food.x, food.y, (x, y) => {
        // pomme avec gradient radial
        const cx = x + gridSize / 2, cy = y + gridSize / 2;
        const r = gridSize * 0.45;
        const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, r);
        g.addColorStop(0, '#ff4444');
        g.addColorStop(0.5, '#dd0000');
        g.addColorStop(1, 'rgba(200,0,0,0.3)');
        ctx.fillStyle = g;
        roundRect(ctx, x + 2, y + 2, gridSize - 4, gridSize - 4, 8);
        ctx.fill();

        // queue de la pomme (tige)
        ctx.fillStyle = '#22aa22';
        ctx.fillRect(cx - 1, cy - gridSize / 2, 2, gridSize / 2 - 2);

        // shine
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.arc(cx - gridSize / 6, cy - gridSize / 6, gridSize / 8, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // draw snake with gradient along body
    for (let i = snake.length - 1; i >= 0; i--) {
      const p = snake[i];
      drawCell(p.x, p.y, (x, y) => {
        const t = i / Math.max(1, snake.length - 1);

        if (i === 0) {
          // HEAD - plus gros et brillant
          ctx.fillStyle = '#00f5a0';
          ctx.shadowColor = 'rgba(0,245,160,0.4)';
          ctx.shadowBlur = 20;
          roundRect(ctx, x + 0.5, y + 0.5, gridSize - 1, gridSize - 1, 7);
          ctx.fill();
          ctx.shadowBlur = 0;

          // eyes
          const eyeSize = gridSize * 0.15;
          const eyeOffset = gridSize * 0.2;
          ctx.fillStyle = '#000';
          ctx.beginPath();
          ctx.arc(x + eyeOffset, y + eyeOffset, eyeSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(x + gridSize - eyeOffset, y + eyeOffset, eyeSize, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // BODY - dégradé du vert au bleu
          const c1 = mix('#00f5a0', '#7c5cff', t);
          const glow = `rgba(124,92,255,${0.08 + t * 0.18})`;

          ctx.fillStyle = c1;
          ctx.shadowColor = glow;
          ctx.shadowBlur = 14 * (0.6 + t);

          roundRect(ctx, x + 1, y + 1, gridSize - 2, gridSize - 2, 6);
          ctx.fill();

          // highlight
          ctx.fillStyle = 'rgba(255,255,255,0.15)';
          roundRect(ctx, x + gridSize * 0.15, y + gridSize * 0.12, gridSize * 0.56, gridSize * 0.28, 4);
          ctx.fill();

          ctx.shadowBlur = 0;
        }
      });
    }

    // particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const par = particles[i];
      par.life -= 1;
      par.x += par.vx;
      par.y += par.vy;
      ctx.globalAlpha = Math.max(0, par.life / par.maxLife);
      ctx.fillStyle = par.color;
      ctx.beginPath();
      ctx.arc(par.x, par.y, par.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
      ctx.globalAlpha = 1;
      if (par.life <= 0) particles.splice(i, 1);
    }
  }

  // helper to map cell to pixels and draw
  function drawCell(cx, cy, cb) {
    const x = cx * gridSize;
    const y = cy * gridSize;
    cb(x, y);
  }

  // rounded rect helper
  function roundRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // mix two hex colors
  function mix(a, b, t) {
    const A = hexToRgb(a);
    const B = hexToRgb(b);
    const r = Math.round(A.r + (B.r - A.r) * t);
    const g = Math.round(A.g + (B.g - A.g) * t);
    const bl = Math.round(A.b + (B.b - A.b) * t);
    return `rgb(${r},${g},${bl})`;
  }

  function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const num = parseInt(hex, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }

  // particle effects
  function createEatFlash(cellX, cellY) {
    const cx = cellX * gridSize + gridSize / 2;
    const cy = cellY * gridSize + gridSize / 2;
    for (let i = 0; i < 20; i++) {
      particles.push({
        x: cx,
        y: cy,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.7) * 4,
        r: 2 + Math.random() * 3,
        color: ['#ffcf6b', '#ff6b6b', '#fff'][Math.floor(Math.random() * 3)],
        life: 30 + Math.random() * 30,
        maxLife: 60
      });
    }
  }

  function createGameOverParticles(cellX, cellY) {
    const cx = cellX * gridSize + gridSize / 2;
    const cy = cellY * gridSize + gridSize / 2;
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: cx,
        y: cy,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        r: 1 + Math.random() * 4,
        color: ['#7c5cff', '#00f5a0', '#ff0000', '#fff'][Math.floor(Math.random() * 4)],
        life: 40 + Math.random() * 80,
        maxLife: 120
      });
    }
  }

  // debounce helper
  function debounce(fn, wait) {
    let t;
    return (...a) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...a), wait);
    };
  }

  // UI wiring
  startBtn.addEventListener('click', () => {
    reset();
    start();
  });
  restartBtn.addEventListener('click', () => {
    reset();
    start();
  });
  pauseBtn.addEventListener('click', () => {
    togglePause();
  });

  // initial reset
  resize();
  reset();

  // expose some helpers to console for tweaking
  window._snake = () => ({ snake, food, gridSize, score, best });