/* ═══════════════════════════════════════════
   BALL BATTLE – Physics arena game
   2 balls fight in an arena with gravity,
   bouncing, power-ups, HP bars
   ═══════════════════════════════════════════ */

function startBallBattle() {
  const W = canvas.width, H = canvas.height;

  // ── CONFIG ───────────────────────────────
  const GRAVITY    = 0.3;
  const FRICTION   = 0.988;
  const BOUNCE     = 0.72;
  const BALL_R     = W * 0.058;
  const DASH_FORCE = 14;
  const MAX_HP     = 5;
  const ARENA_PAD  = 10;

  // Floor / walls
  const FLOOR = H - 50;
  const CEIL  = 50;
  const LWALL = ARENA_PAD;
  const RWALL = W - ARENA_PAD;

  // Platforms
  const platforms = [
    { x: W * 0.1,  y: FLOOR - H * 0.22, w: W * 0.22, h: 10 },
    { x: W * 0.68, y: FLOOR - H * 0.22, w: W * 0.22, h: 10 },
    { x: W * 0.35, y: FLOOR - H * 0.42, w: W * 0.3,  h: 10 },
  ];

  // ── BALLS ────────────────────────────────
  const BALL_DEFS = [
    { color: C.pink,  shadow: C.pink,  keys: { left:'ArrowLeft', right:'ArrowRight', jump:'ArrowUp',  dash:'ArrowDown' }, label:'P1', startX: W*0.25 },
    { color: C.cyan,  shadow: C.cyan,  keys: { left:'a',         right:'d',          jump:'w',         dash:'s'          }, label:'P2', startX: W*0.75 },
  ];

  function makeBall(def) {
    return {
      x: def.startX, y: FLOOR - BALL_R - 5,
      vx: 0, vy: 0,
      r: BALL_R,
      color: def.color,
      shadow: def.shadow,
      label: def.label,
      keys: def.keys,
      hp: MAX_HP,
      maxHp: MAX_HP,
      onGround: false,
      dashCd: 0,      // cooldown frames
      invincible: 0,  // frames of invincibility after hit
      angle: 0,       // rotation for visual
      trail: [],
      isBot: false,
      botTimer: 0,
    };
  }

  const balls = [makeBall(BALL_DEFS[0]), makeBall(BALL_DEFS[1])];

  // Bot mode: second ball is AI
  const isBotMode = true; // always bot for single player
  if (isBotMode) balls[1].isBot = true;

  // ── INPUT ────────────────────────────────
  const keys = {};
  function onKeyDown(e) { keys[e.key] = true; }
  function onKeyUp(e)   { keys[e.key] = false; }
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup',   onKeyUp);

  // ── POWER-UPS ────────────────────────────
  const POWERUP_TYPES = ['speed', 'shield', 'big', 'heal'];
  const POWERUP_COLORS = { speed: C.yellow, shield: C.cyan, big: C.orange, heal: C.green };
  const POWERUP_ICONS  = { speed: '⚡', shield: '🛡', big: '💪', heal: '❤️' };
  let powerups = [];
  let puTimer  = 0;

  function spawnPowerup() {
    const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
    const px = Math.random() * (RWALL - LWALL - 40) + LWALL + 20;
    const py = CEIL + Math.random() * (FLOOR - CEIL - 100);
    powerups.push({ x: px, y: py, type, r: 14, alive: true, bob: Math.random() * Math.PI * 2 });
  }

  // Active effects
  function applyPowerup(ball, type) {
    if (type === 'speed') { ball.speedBoost = 90; }
    if (type === 'shield') { ball.shieldFrames = 180; }
    if (type === 'big')   { ball.bigFrames = 180; }
    if (type === 'heal')  { ball.hp = Math.min(ball.maxHp, ball.hp + 2); }
  }

  // ── PARTICLES ────────────────────────────
  let particles = [];
  function spawnParticles(x, y, color, n = 12) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = Math.random() * 5 + 2;
      particles.push({ x, y, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp, r: Math.random()*4+2, color, life: 1 });
    }
  }

  // ── BOT AI ───────────────────────────────
  function botThink(bot, target) {
    bot.botTimer--;
    if (bot.botTimer > 0) return;
    bot.botTimer = 8 + Math.floor(Math.random() * 12);

    const dx = target.x - bot.x;
    const dy = target.y - bot.y;
    const dist = Math.hypot(dx, dy);

    // Collect nearby powerup
    const nearPu = powerups.find(p => p.alive && Math.hypot(p.x - bot.x, p.y - bot.y) < W * 0.35);
    const moveTarget = nearPu && Math.hypot(nearPu.x - bot.x, nearPu.y - bot.y) < dist ? nearPu : target;

    const mdx = moveTarget.x - bot.x;

    // Move toward target
    if (Math.abs(mdx) > 20) {
      keys[bot.keys.left]  = mdx < 0;
      keys[bot.keys.right] = mdx > 0;
    } else {
      keys[bot.keys.left]  = false;
      keys[bot.keys.right] = false;
    }

    // Jump if target is above or need to reach platform
    if (bot.onGround && (dy < -30 || Math.abs(dy) > H * 0.25)) {
      keys[bot.keys.jump] = true;
      setTimeout(() => { keys[bot.keys.jump] = false; }, 80);
    }

    // Dash when close
    if (dist < BALL_R * 5 && bot.dashCd === 0) {
      keys[bot.keys.dash] = true;
      setTimeout(() => { keys[bot.keys.dash] = false; }, 60);
    }
  }

  // ── PHYSICS ─────────────────────────────
  function onPlatform(b) {
    for (const p of platforms) {
      if (b.x + b.r > p.x && b.x - b.r < p.x + p.w &&
          b.y + b.r >= p.y && b.y + b.r <= p.y + p.h + 8 && b.vy >= 0) {
        return p;
      }
    }
    return null;
  }

  function updateBall(b, other) {
    const speed = b.speedBoost > 0 ? 1.6 : 1;
    const R = b.bigFrames > 0 ? b.r * 1.5 : b.r;

    // Input
    if (keys[b.keys.left])  b.vx -= 0.8 * speed;
    if (keys[b.keys.right]) b.vx += 0.8 * speed;

    // Jump
    if (keys[b.keys.jump] && b.onGround) {
      b.vy = -10; b.onGround = false;
    }

    // Dash
    if (keys[b.keys.dash] && b.dashCd === 0 && !b.onGround) {
      const dx = other.x - b.x, dy = other.y - b.y;
      const len = Math.hypot(dx, dy) || 1;
      b.vx += (dx/len) * DASH_FORCE;
      b.vy += (dy/len) * DASH_FORCE * 0.5;
      b.dashCd = 50;
      spawnParticles(b.x, b.y, b.color, 8);
    }

    // Gravity
    b.vy += GRAVITY;

    // Apply velocity
    b.x += b.vx;
    b.y += b.vy;

    // Friction
    b.vx *= FRICTION;

    // Walls
    if (b.x - R < LWALL) { b.x = LWALL + R; b.vx *= -BOUNCE; }
    if (b.x + R > RWALL) { b.x = RWALL - R; b.vx *= -BOUNCE; }

    // Ceiling
    if (b.y - R < CEIL) { b.y = CEIL + R; b.vy *= -BOUNCE; }

    // Floor
    b.onGround = false;
    if (b.y + R >= FLOOR) { b.y = FLOOR - R; b.vy *= -BOUNCE * 0.5; b.vx *= 0.85; b.onGround = true; }

    // Platforms
    const plat = onPlatform(b);
    if (plat) { b.y = plat.y - R; b.vy = Math.min(b.vy, 0) * -BOUNCE * 0.4; b.onGround = true; }

    // Clamp speed
    const maxSpd = 12 * speed;
    b.vx = Math.max(-maxSpd, Math.min(maxSpd, b.vx));
    b.vy = Math.max(-15, Math.min(15, b.vy));

    // Rotation
    b.angle += b.vx * 0.04;

    // Cooldowns
    if (b.dashCd > 0) b.dashCd--;
    if (b.invincible > 0) b.invincible--;
    if (b.speedBoost > 0) b.speedBoost--;
    if (b.shieldFrames > 0) b.shieldFrames--;
    if (b.bigFrames > 0) b.bigFrames--;

    // Trail
    b.trail.push({ x: b.x, y: b.y, r: R });
    if (b.trail.length > 10) b.trail.shift();

    // Ball-ball collision
    const OR = other.bigFrames > 0 ? other.r * 1.5 : other.r;
    const dx = other.x - b.x, dy = other.y - b.y;
    const dist = Math.hypot(dx, dy);
    const minDist = R + OR;

    if (dist < minDist && dist > 0) {
      // Push apart
      const nx = dx/dist, ny = dy/dist;
      const overlap = minDist - dist;
      b.x -= nx * overlap * 0.5;
      b.y -= ny * overlap * 0.5;

      // Damage on high-speed collision
      const relV = Math.hypot(b.vx - other.vx, b.vy - other.vy);
      if (relV > 5 && b.invincible === 0) {
        const dmg = Math.floor(relV / 3);
        if (!b.shieldFrames) {
          b.hp -= dmg;
          b.invincible = 30;
          spawnParticles(b.x, b.y, b.color, dmg * 3);
        }
      }

      // Bounce
      const dot = b.vx * nx + b.vy * ny;
      b.vx -= 1.5 * dot * nx;
      b.vy -= 1.5 * dot * ny;
    }
  }

  // ── DRAW ────────────────────────────────
  function drawArena() {
    // Background
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);

    // Arena border glow
    ctx.save();
    ctx.strokeStyle = C.accent + '44';
    ctx.lineWidth = 2;
    ctx.strokeRect(LWALL, CEIL, RWALL - LWALL, FLOOR - CEIL);
    ctx.restore();

    // Floor
    ctx.fillStyle = C.bg3;
    ctx.fillRect(LWALL, FLOOR, RWALL - LWALL, H - FLOOR);
    ctx.fillStyle = C.accent + '88';
    ctx.fillRect(LWALL, FLOOR, RWALL - LWALL, 3);

    // Platforms
    for (const p of platforms) {
      ctx.save();
      ctx.fillStyle = C.bg3;
      ctx.strokeStyle = C.border;
      ctx.lineWidth = 1.5;
      roundRect(ctx, p.x, p.y, p.w, p.h, 4);
      ctx.fill(); ctx.stroke();
      // Highlight
      ctx.fillStyle = 'rgba(255,255,255,.08)';
      ctx.fillRect(p.x + 4, p.y + 2, p.w - 8, 3);
      ctx.restore();
    }
  }

  function drawBall(b) {
    const R = b.bigFrames > 0 ? b.r * 1.5 : b.r;

    // Trail
    b.trail.forEach((t, i) => {
      ctx.globalAlpha = (i / b.trail.length) * 0.3;
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.r * (i / b.trail.length), 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.angle);

    // Invincibility flicker
    if (b.invincible > 0 && Math.floor(b.invincible / 4) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    // Shadow
    ctx.save();
    ctx.shadowColor = b.color;
    ctx.shadowBlur = b.invincible === 0 ? 15 : 25;

    // Body gradient
    const grd = ctx.createRadialGradient(-R*.3, -R*.3, R*.1, 0, 0, R);
    grd.addColorStop(0, 'rgba(255,255,255,.5)');
    grd.addColorStop(0.4, b.color + 'ee');
    grd.addColorStop(1, b.color + '55');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Shield ring
    if (b.shieldFrames > 0) {
      ctx.strokeStyle = C.cyan;
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.7 + Math.sin(Date.now() * 0.01) * 0.3;
      ctx.beginPath();
      ctx.arc(0, 0, R + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Speed lines
    if (b.speedBoost > 0) {
      ctx.strokeStyle = C.yellow + '88';
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const a = b.angle + i * 2.1;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * R * 0.6, Math.sin(a) * R * 0.6);
        ctx.lineTo(Math.cos(a) * R * 1.4, Math.sin(a) * R * 1.4);
        ctx.stroke();
      }
    }

    // Dash cooldown arc
    if (b.dashCd > 0) {
      ctx.strokeStyle = C.sub;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, R + 3, -Math.PI/2, -Math.PI/2 + (1 - b.dashCd/50) * Math.PI*2);
      ctx.stroke();
    }

    ctx.restore();

    // Label above ball
    ctx.fillStyle = b.color;
    ctx.font = `bold ${W*.028}px ${C.font}`;
    ctx.textAlign = 'center';
    ctx.fillText(b.label, b.x, b.y - R - 6);
  }

  function drawHUD() {
    // HP bars
    balls.forEach((b, i) => {
      const barW = W * 0.35, barH = 10;
      const bx = i === 0 ? W * 0.05 : W - barW - W * 0.05;
      const by = 18;
      const hpRatio = Math.max(0, b.hp / b.maxHp);
      const hpColor = hpRatio > 0.6 ? C.green : hpRatio > 0.3 ? C.yellow : C.pink;

      // Bar bg
      roundRect(ctx, bx, by, barW, barH, 4);
      ctx.fillStyle = C.bg3;
      ctx.fill();
      // Bar fill
      roundRect(ctx, bx, by, barW * hpRatio, barH, 4);
      ctx.fillStyle = hpColor;
      ctx.fill();
      // Border
      roundRect(ctx, bx, by, barW, barH, 4);
      ctx.strokeStyle = C.border;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Name
      ctx.fillStyle = b.color;
      ctx.font = `bold ${W*.025}px var(--font-hd, monospace)`;
      ctx.textAlign = i === 0 ? 'left' : 'right';
      ctx.fillText(b.label, i === 0 ? bx : bx + barW, by - 3);
    });

    // Score / round info
    ctx.fillStyle = C.sub;
    ctx.font = `${W*.022}px var(--font-hd, monospace)`;
    ctx.textAlign = 'center';
    ctx.fillText('BALL BATTLE', W/2, 28);
  }

  function drawPowerups(t) {
    for (const p of powerups) {
      if (!p.alive) continue;
      p.bob += 0.05;
      const py = p.y + Math.sin(p.bob) * 5;
      const col = POWERUP_COLORS[p.type];

      ctx.save();
      ctx.shadowColor = col;
      ctx.shadowBlur = 12;
      ctx.fillStyle = col + '33';
      ctx.strokeStyle = col;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, py, p.r, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.restore();

      ctx.font = `${p.r * 1.2}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(POWERUP_ICONS[p.type], p.x, py);
      ctx.textBaseline = 'alphabetic';
    }
  }

  function drawParticles() {
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life -= 0.04;
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    particles = particles.filter(p => p.life > 0);
  }

  // ── MAIN LOOP ───────────────────────────
  arcadeGame = {
    cleanup() {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      // Clear all keys
      Object.keys(keys).forEach(k => delete keys[k]);
    }
  };

  let frame = 0;

  function loop() {
    frame++;

    // Bot AI
    if (balls[1].isBot) botThink(balls[1], balls[0]);

    // Update balls
    updateBall(balls[0], balls[1]);
    updateBall(balls[1], balls[0]);

    // Powerup spawn
    puTimer++;
    if (puTimer % 300 === 0 && powerups.filter(p => p.alive).length < 3) spawnPowerup();

    // Powerup collection
    for (const b of balls) {
      const R = b.bigFrames > 0 ? b.r * 1.5 : b.r;
      for (const p of powerups) {
        if (!p.alive) continue;
        if (Math.hypot(b.x - p.x, b.y - p.y) < R + p.r) {
          p.alive = false;
          applyPowerup(b, p.type);
          spawnParticles(p.x, p.y, POWERUP_COLORS[p.type], 10);
        }
      }
    }

    // Draw
    drawArena();
    drawPowerups(frame);
    drawParticles();
    balls.forEach(b => drawBall(b));
    drawHUD();

    // Score = frames survived per ball (updated externally)
    arcadeScore = frame;
    // Avoid spamming DOM update every frame
    if (frame % 60 === 0) updateArcadeScore();

    // Check death
    for (const b of balls) {
      if (b.hp <= 0) {
        const winner = balls.find(x => x !== b);
        spawnParticles(b.x, b.y, b.color, 30);
        drawArena();
        drawParticles();
        balls.forEach(x => x !== b && drawBall(x));
        drawHUD();
        arcadeScore = Math.floor(frame / 60);
        gameOver(b === balls[0] ? '🤖' : '🏆', b === balls[0] ? '' : '');
        return;
      }
      // Fell off screen?
      if (b.y > H + 50) { b.hp = 0; }
    }

    arcadeRAF = requestAnimationFrame(loop);
  }

  // Spawn initial powerup
  setTimeout(spawnPowerup, 2000);

  arcadeRAF = requestAnimationFrame(loop);
}
