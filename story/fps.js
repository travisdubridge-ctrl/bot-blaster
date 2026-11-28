/* Story Mode FPS prototype (2026-11-28): a Wolfenstein/Doom-style raycaster at 320x200 for the 16-bit look.
   One test level ("The Freezer"): fight drones and robot dogs, find Scrub-Zero in a cage, press E to free him.
   Everything (textures, sprites, sounds) is generated in code. Helper sprites come from ../art16/. */
(function () {
  "use strict";
  const W = 320, H = 200, VH = 168, HUD = H - VH, TEX = 64;
  const screen = document.getElementById("screen"), sctx = screen.getContext("2d");
  const frame = document.createElement("canvas"); frame.width = W; frame.height = H; const fctx = frame.getContext("2d");
  const img = fctx.createImageData(W, VH), buf = new Uint32Array(img.data.buffer), zbuf = new Float32Array(W);
  const $ = id => document.getElementById(id);

  /* ---------------- the level ----------------
     # brick   M metal panel   I ice wall   D door   . floor   P start   e drone   g robot dog   h health   a ammo   C caged helper */
  const MAP = [
    "#########################",
    "#P....#.......#.....h...#",
    "#.....#...e...#.........#",
    "#.....D.......D....g....#",
    "#..a..#...e...#.........#",
    "#.....#.......#....a....#",
    "###D###MMMMMMMM##D#######",
    "#.....M...e...M.........#",
    "#.e...M.M...M.M....e....#",
    "#.....D.......D.........#",
    "#..h..M.M...M.M..g......#",
    "#.....M...a...M.........#",
    "###D###MMMDMMMM#####D####",
    "I.....I.......I.........I",
    "I..e..I...g...I....e....I",
    "I.....D.......D.........I",
    "I..h..I.......IIIIDIIIIII",
    "I.....I...a...I...C.....I",
    "IIIIIIIIIIIIIIIIIIIIIIIII"
  ];
  const MW = MAP[0].length, MH = MAP.length;

  /* ---------------- textures (64x64, drawn in code, read into pixel arrays) ---------------- */
  const rnd = (() => { let s = 12345; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  function texture(draw, grit) {
    const c = document.createElement("canvas"); c.width = c.height = TEX; const g = c.getContext("2d"); draw(g);
    const d = g.getImageData(0, 0, TEX, TEX), p = d.data;
    for (let i = 0; i < p.length; i += 4) { const n = (rnd() - .5) * (grit || 18); p[i] = Math.max(0, Math.min(255, p[i] + n)); p[i + 1] = Math.max(0, Math.min(255, p[i + 1] + n)); p[i + 2] = Math.max(0, Math.min(255, p[i + 2] + n)); }
    return new Uint32Array(d.data.buffer.slice(0));
  }
  const R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  const T = {
    brick: texture(g => { R(g, 0, 0, 64, 64, "#3a2a22"); for (let row = 0; row < 8; row++) for (let col = -1; col < 4; col++) { const x = col * 16 + (row % 2 ? 8 : 0), y = row * 8, v = Math.floor(rnd() * 30);
      R(g, x + 1, y + 1, 14, 6, `rgb(${130 + v},${52 + v / 2},${36})`); R(g, x + 1, y + 1, 14, 1, `rgb(${165 + v},${80 + v / 2},${58})`); R(g, x + 1, y + 6, 14, 1, `rgb(${90 + v},${34},${26})`); } }),
    metal: texture(g => { R(g, 0, 0, 64, 64, "#4a505e"); R(g, 2, 2, 60, 60, "#5c6372"); R(g, 2, 2, 60, 2, "#7a8394"); R(g, 2, 60, 60, 2, "#3a3f4a"); R(g, 31, 2, 2, 60, "#3a3f4a");
      [[6, 6], [56, 6], [6, 56], [56, 56], [26, 6], [36, 56]].forEach(([x, y]) => { R(g, x - 1, y - 1, 3, 3, "#2a2e36"); R(g, x - 1, y - 1, 2, 2, "#9aa3b4"); });
      R(g, 10, 28, 18, 6, "#1a2a33"); R(g, 11, 29, 16, 4, "#5df2ff"); R(g, 38, 20, 18, 3, "#2a2e36"); R(g, 38, 26, 18, 3, "#2a2e36"); R(g, 38, 32, 18, 3, "#2a2e36"); }),
    ice: texture(g => { const gr = g.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, "#b8e6f8"); gr.addColorStop(1, "#7fbfe0"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
      g.strokeStyle = "#e8f8ff"; g.lineWidth = 1; for (let k = 0; k < 5; k++) { g.beginPath(); let x = rnd() * 64, y = rnd() * 64; g.moveTo(x, y); for (let s = 0; s < 4; s++) { x += (rnd() - .5) * 24; y += (rnd() - .5) * 24; g.lineTo(x, y); } g.stroke(); }
      g.strokeStyle = "#5f9fc8"; for (let k = 0; k < 4; k++) { g.beginPath(); let x = rnd() * 64, y = rnd() * 64; g.moveTo(x, y); for (let s = 0; s < 3; s++) { x += (rnd() - .5) * 20; y += (rnd() - .5) * 20; g.lineTo(x, y); } g.stroke(); } }, 12),
    door: texture(g => { R(g, 0, 0, 64, 64, "#5a606c"); R(g, 2, 2, 60, 60, "#6e7482"); for (let k = 0; k < 8; k++) R(g, k * 8, 28, 4, 8, "#ffc22a"), R(g, k * 8 + 4, 28, 4, 8, "#1a1a1a");
      R(g, 31, 2, 2, 24, "#3a3f4a"); R(g, 31, 38, 2, 24, "#3a3f4a"); R(g, 8, 8, 16, 14, "#4a505e"); R(g, 40, 8, 16, 14, "#4a505e"); R(g, 8, 42, 16, 14, "#4a505e"); R(g, 40, 42, 16, 14, "#4a505e"); R(g, 2, 2, 60, 1, "#9aa3b4"); }),
    floor: texture(g => { R(g, 0, 0, 64, 64, "#3a3f4a"); R(g, 0, 0, 64, 1, "#262a32"); R(g, 0, 32, 64, 1, "#262a32"); R(g, 0, 0, 1, 64, "#262a32"); R(g, 32, 0, 1, 64, "#262a32");
      R(g, 1, 1, 31, 1, "#4a505c"); R(g, 33, 33, 31, 1, "#4a505c"); R(g, 33, 1, 31, 1, "#4a505c"); R(g, 1, 33, 31, 1, "#4a505c"); }, 14),
    icefloor: texture(g => { R(g, 0, 0, 64, 64, "#6fa6c4"); g.strokeStyle = "#9fd0e8"; for (let k = 0; k < 6; k++) { g.beginPath(); g.moveTo(rnd() * 64, rnd() * 64); g.lineTo(rnd() * 64, rnd() * 64); g.stroke(); } }, 10),
    ceil: texture(g => { R(g, 0, 0, 64, 64, "#22252c"); R(g, 0, 0, 64, 2, "#16181d"); R(g, 0, 0, 2, 64, "#16181d"); R(g, 22, 22, 20, 20, "#3a3f4a"); R(g, 24, 24, 16, 16, "#d8e4ff"); R(g, 24, 24, 16, 3, "#ffffff"); }, 10)
  };
  const WALLTEX = {"#": T.brick, M: T.metal, I: T.ice, D: T.door};

  /* ---------------- sprites ---------------- */
  const pix = cv => { const d = cv.getContext("2d").getImageData(0, 0, cv.width, cv.height); return {w: cv.width, h: cv.height, p: new Uint32Array(d.data.buffer.slice(0)), cv}; };
  const mk = (w, h, body, det) => pix(SPRITE16.make(w, h, body, det));
  const SP = {
    drone: mk(64, 64, S => { S.R(6, 13, 52, 3, "#3d1a80", {flat: true}); S.E(10, 12, 9, 2, "#cfd6e6", {flat: true}); S.E(54, 12, 9, 2, "#cfd6e6", {flat: true}); S.R(30, 14, 4, 8, "#3d1a80");
      S.R(19, 42, 4, 10, "#3d1a80"); S.R(41, 42, 4, 10, "#3d1a80"); S.RR(12, 20, 40, 26, 9, "#7a3cff", {R: 9}); S.RR(15, 20, 34, 6, 3, "#b69cff", {R: 3}); S.E(32, 34, 10, 8, "#1a0b33", {R: 5}); S.RR(27, 44, 10, 12, 2, "#2b2f38", {R: 3}); },
      D => { D(28, 31, 8, 6, "#ff4d6d"); D(30, 32, 4, 4, "#ffb3c0"); D(29, 31, 2, 1, "#ffffff"); D(31, 54, 2, 2, "#ff4d6d"); }),
    dog: mk(64, 64, S => { const Y = "#f2c230", K = "#3a3f4a"; [[16, 6], [24, -6], [40, -6], [48, 6]].forEach(([x, o]) => { S.L([[x, 34], [x + o * .4, 46], [x, 58]], 4, K, {R: 2}); });
      S.RR(8, 22, 46, 16, 6, Y, {R: 7}); S.R(8, 31, 46, 5, "#2b2f38", {flat: true}); S.RR(44, 12, 18, 14, 4, Y, {R: 5}); S.RR(20, 14, 20, 7, 2, "#2b2f38", {R: 3}); S.R(38, 15, 16, 3, "#2b2f38"); },
      D => { D(55, 16, 6, 6, "#1a1d24"); D(57, 17, 3, 3, "#ff4d6d"); D(56, 17, 1, 1, "#ffffff"); }),
    health: mk(32, 32, S => { S.RR(4, 10, 24, 18, 3, "#eaf2ff", {R: 5}); S.R(12, 7, 8, 4, "#c9d2e0"); }, D => { D(14, 13, 4, 12, "#e8304e"); D(10, 17, 12, 4, "#e8304e"); D(14, 13, 4, 1, "#ff8a9a"); }),
    ammo: mk(32, 32, S => { S.RR(9, 7, 14, 22, 3, "#5df2a4", {R: 4}); S.R(13, 4, 6, 4, "#c9d2e0"); }, D => { D(15, 11, 3, 5, "#1a3a2a"); D(13, 15, 5, 2, "#1a3a2a"); D(14, 17, 3, 5, "#1a3a2a"); D(11, 9, 1, 16, "#c8ffe0"); }),
    gun: SPRITE16.make(96, 72, S => { S.RR(40, 2, 16, 30, 5, "#2b3446", {R: 5}); S.RR(30, 20, 36, 40, 8, "#4a5470", {R: 10}); S.R(34, 26, 4, 22, "#5c6888", {flat: true}); S.R(58, 26, 4, 22, "#5c6888", {flat: true});
      S.E(48, 32, 7, 9, "#ffc857", {R: 5}); S.RR(22, 44, 52, 30, 12, "#ffc857", {R: 12}); S.RR(28, 50, 40, 6, 3, "#e0a83a", {soft: true}); },
      D => { D(45, 4, 6, 3, "#5df2ff"); D(46, 28, 3, 4, "#fff6b0"); D(30, 58, 36, 1, "#b8862b"); D(30, 64, 36, 1, "#b8862b"); })
  };
  SP.drone.r = .32; SP.dog.r = .34;
  const glow = (size, inner, outer) => { const c = document.createElement("canvas"); c.width = c.height = size; const g = c.getContext("2d"), gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(.35, inner); gr.addColorStop(1, outer); g.fillStyle = gr; g.beginPath(); g.arc(size / 2, size / 2, size / 2 - 1, 0, 7); g.fill();
    const d = g.getImageData(0, 0, size, size); for (let i = 3; i < d.data.length; i += 4) d.data[i] = d.data[i] > 90 ? 255 : 0; g.putImageData(d, 0, 0); return pix(c); };
  SP.shot = glow(16, "#ff6b3d", "rgba(255,40,60,.6)"); SP.laser = glow(12, "#5df2ff", "rgba(40,180,255,.6)");
  SP.boom = [0, 1, 2, 3].map(k => { const c = document.createElement("canvas"); c.width = c.height = 48; const g = c.getContext("2d");
    for (let i = 0; i < 10; i++) { const a = rnd() * 6.28, d = rnd() * 6 * (k + 1), r = 6 + k * 3 + rnd() * 6; g.fillStyle = k > 2 ? "#4a4a52" : ["#fff6b0", "#ffc857", "#ff6b3d"][Math.floor(rnd() * 3)]; g.beginPath(); g.arc(24 + Math.cos(a) * d, 24 + Math.sin(a) * d, r, 0, 7); g.fill(); }
    return pix(c); });
  const flashCv = (() => { const c = document.createElement("canvas"); c.width = c.height = 40; const g = c.getContext("2d"); g.fillStyle = "#fff6b0"; g.beginPath();
    for (let k = 0; k < 16; k++) { const a = k / 16 * 6.283, r = k % 2 ? 8 : 19; g.lineTo(20 + Math.cos(a) * r, 20 + Math.sin(a) * r); } g.fill(); g.fillStyle = "#ffffff"; g.beginPath(); g.arc(20, 20, 6, 0, 7); g.fill(); return c; })();
  const helperSp = pix(HELPERS16.build("scrubzero"));
  const cageSp = (() => { const c = document.createElement("canvas"); c.width = c.height = 128; const g = c.getContext("2d");
    R(g, 8, 0, 112, 8, "#5c6372"); R(g, 8, 0, 112, 2, "#9aa3b4"); R(g, 8, 120, 112, 8, "#5c6372");
    for (let x = 12; x < 120; x += 13) { R(g, x, 6, 4, 116, "#6e7482"); R(g, x, 6, 1, 116, "#b8c0d0"); R(g, x + 3, 6, 1, 116, "#3a3f4a"); }
    R(g, 54, 58, 20, 16, "#c9a24a"); R(g, 56, 60, 16, 12, "#ffd25a"); R(g, 62, 63, 4, 6, "#3a2a10"); return pix(c); })();

  /* ---------------- sound (generated) ---------------- */
  const SFX = (() => { let ac = null, on = true; try { on = localStorage.getItem("bot-blaster-sfx") !== "off"; } catch (e) {}
    const ctx = () => { if (!ac) try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } if (ac.state === "suspended") ac.resume(); return ac; };
    const tone = (a, f0, f1, d, type, v, dl) => { const t = a.currentTime + (dl || 0), o = a.createOscillator(), gn = a.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + d); gn.gain.setValueAtTime(v, t); gn.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(gn); gn.connect(a.destination); o.start(t); o.stop(t + d + .02); };
    const noise = (a, d, v, f, k, dl) => { const t = a.currentTime + (dl || 0), n = Math.floor(a.sampleRate * d), b = a.createBuffer(1, n, a.sampleRate), x = b.getChannelData(0); for (let i = 0; i < n; i++) x[i] = Math.random() * 2 - 1;
      const s = a.createBufferSource(), fl = a.createBiquadFilter(), gn = a.createGain(); s.buffer = b; fl.type = k || "lowpass"; fl.frequency.value = f; gn.gain.setValueAtTime(v, t); gn.gain.exponentialRampToValueAtTime(.001, t + d); s.connect(fl); fl.connect(gn); gn.connect(a.destination); s.start(t); };
    const DEF = { shoot: a => { tone(a, 700, 160, .12, "square", .08); noise(a, .08, .08, 2500); }, hit: a => tone(a, 300, 120, .06, "square", .07), boom: a => { noise(a, .45, .25, 900); tone(a, 140, 40, .4, "sine", .2); },
      eshot: a => tone(a, 520, 220, .12, "triangle", .06), laser: a => tone(a, 1600, 600, .1, "sawtooth", .04), hurt: a => { tone(a, 380, 70, .3, "sawtooth", .15); noise(a, .15, .1, 600); },
      pick: a => { tone(a, 880, 880, .07, "square", .06); tone(a, 1320, 1320, .1, "square", .06, .07); }, door: a => { noise(a, .5, .08, 300); tone(a, 90, 60, .5, "sawtooth", .05); },
      click: a => tone(a, 200, 180, .03, "square", .05), win: a => { [523, 659, 784, 1047].forEach((f, i) => tone(a, f, f, .18, "square", .08, i * .14)); },
      ice: a => { noise(a, .4, .15, 4000, "highpass"); tone(a, 2400, 800, .3, "triangle", .06); } };
    return { play(n) { if (!on) return; const a = ctx(); if (a && DEF[n]) try { DEF[n](a); } catch (e) {} }, toggle() { on = !on; try { localStorage.setItem("bot-blaster-sfx", on ? "on" : "off"); } catch (e) {} return on; } }; })();

  /* ---------------- game state ---------------- */
  let G;
  function reset() {
    G = {px: 1.5, py: 1.5, ang: 0, hp: 100, ammo: 60, kills: 0, total: 0, t: 0, cool: 0, flash: 0, hurt: 0, bob: 0, msg: "", msgT: 0, map: false, freed: false, freeT: 0, over: false,
      doors: {}, enemies: [], items: [], shots: [], booms: [], cage: null};
    MAP.forEach((row, y) => [...row].forEach((ch, x) => {
      if (ch === "P") { G.px = x + .5; G.py = y + .5; }
      if (ch === "D") G.doors[x + "," + y] = {open: 0, t: 0};
      if (ch === "e" || ch === "g") { G.enemies.push({x: x + .5, y: y + .5, type: ch === "e" ? "drone" : "dog", hp: ch === "e" ? 3 : 5, awake: false, cool: 1 + Math.random() * 2, strafe: Math.random() < .5 ? 1 : -1, st: 0, flash: 0, bob: Math.random() * 6 }); G.total++; }
      if (ch === "h" || ch === "a") G.items.push({x: x + .5, y: y + .5, type: ch === "h" ? "health" : "ammo"});
      if (ch === "C") G.cage = {x: x + .5, y: y + .5};
    }));
    // face down the first corridor
    G.ang = 0;
    say("Find Scrub-Zero. He's locked up somewhere in the freezer.", 4);
  }
  const say = (m, s) => { G.msg = m; G.msgT = s || 2; };
  const cell = (x, y) => (x < 0 || y < 0 || x >= MW || y >= MH) ? "#" : MAP[y][x];
  const solid = (x, y) => { const c = cell(Math.floor(x), Math.floor(y)); if (c === "D") return G.doors[Math.floor(x) + "," + Math.floor(y)].open < .9; return c === "#" || c === "M" || c === "I" || c === "C"; };
  const free = (x, y, r) => !solid(x - r, y - r) && !solid(x + r, y - r) && !solid(x - r, y + r) && !solid(x + r, y + r);
  function sight(x0, y0, x1, y1) { const d = Math.hypot(x1 - x0, y1 - y0), n = Math.ceil(d / .1); for (let i = 1; i < n; i++) { const t = i / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t; const c = cell(Math.floor(x), Math.floor(y)); if (c === "#" || c === "M" || c === "I" || (c === "D" && G.doors[Math.floor(x) + "," + Math.floor(y)].open < .5)) return false; } return true; }

  /* ---------------- input ---------------- */
  const keys = {}; let mouseDown = false, locked = false, started = false;
  addEventListener("keydown", e => { const k = e.key.toLowerCase(); keys[k] = true; if (k === "tab") { e.preventDefault(); G.map = !G.map; } if (k === " ") e.preventDefault(); if (k === "e") use(); if (k === "n") say(SFX.toggle() ? "Sound on" : "Sound off"); });
  addEventListener("keyup", e => { keys[e.key.toLowerCase()] = false; });
  screen.addEventListener("mousedown", e => { if (!started || G.over) return; if (!locked) { screen.requestPointerLock && screen.requestPointerLock(); } mouseDown = true; });
  addEventListener("mouseup", () => { mouseDown = false; });
  document.addEventListener("pointerlockchange", () => { locked = document.pointerLockElement === screen; });
  addEventListener("mousemove", e => { if (locked && !G.over) G.ang += e.movementX * .0028; });
  function fit() { const s = Math.max(1, Math.min(innerWidth / W, innerHeight / H)); screen.style.width = W * s + "px"; screen.style.height = H * s + "px"; }
  addEventListener("resize", fit); fit();

  function use() {
    if (!started || G.over) return;
    const fx = G.px + Math.cos(G.ang) * 1.1, fy = G.py + Math.sin(G.ang) * 1.1, cx = Math.floor(fx), cy = Math.floor(fy);
    if (cell(cx, cy) === "D") { const d = G.doors[cx + "," + cy]; if (d.open < .1) SFX.play("door"); d.t = 5; return; }
    if (G.cage && !G.freed && Math.hypot(G.cage.x - G.px, G.cage.y - G.py) < 1.6) {
      G.freed = true; G.freeT = 0; SFX.play("ice"); setTimeout(() => SFX.play("win"), 400); say("SCRUB-ZERO: \"About time, scrub.\"", 3);
    }
  }

  /* ---------------- update ---------------- */
  function update(dt) {
    G.t += dt; G.msgT -= dt; G.flash = Math.max(0, G.flash - dt); G.hurt = Math.max(0, G.hurt - dt); G.cool -= dt;
    if (keys.arrowleft) G.ang -= 2.6 * dt; if (keys.arrowright) G.ang += 2.6 * dt;
    const sp = (keys.shift ? 4.6 : 3) * dt, ca = Math.cos(G.ang), sa = Math.sin(G.ang);
    let mx = 0, my = 0; if (keys.w || keys.arrowup) { mx += ca; my += sa; } if (keys.s || keys.arrowdown) { mx -= ca; my -= sa; } if (keys.a) { mx += sa; my -= ca; } if (keys.d) { mx -= sa; my += ca; }
    const ml = Math.hypot(mx, my); if (ml) { mx = mx / ml * sp; my = my / ml * sp; if (free(G.px + mx, G.py, .22)) G.px += mx; if (free(G.px, G.py + my, .22)) G.py += my; G.bob += dt * (keys.shift ? 12 : 9); }
    // doors: open when you walk up (or press E), close a few seconds after you leave
    for (const k in G.doors) { const d = G.doors[k], [x, y] = k.split(",").map(Number), near = Math.hypot(x + .5 - G.px, y + .5 - G.py) < 1.5;
      if (near && d.open < .05 && d.t <= 0) SFX.play("door"); if (near) d.t = Math.max(d.t, 3); d.t -= dt;
      const inside = Math.floor(G.px) === x && Math.floor(G.py) === y || G.enemies.some(e => Math.floor(e.x) === x && Math.floor(e.y) === y);
      d.open = Math.max(0, Math.min(1, d.open + (d.t > 0 || inside ? 1.6 : -1.2) * dt)); }
    if ((mouseDown || keys[" "]) && G.cool <= 0) fire();
    // enemies
    for (const e of G.enemies) {
      e.flash = Math.max(0, e.flash - dt); e.bob += dt; const dx = G.px - e.x, dy = G.py - e.y, d = Math.hypot(dx, dy), see = d < 13 && sight(e.x, e.y, G.px, G.py);
      if (!e.awake && see) e.awake = true; if (!e.awake) continue;
      e.st -= dt; if (e.st <= 0) { e.st = 1.2 + Math.random() * 1.5; e.strafe = -e.strafe; }
      const spd = (e.type === "dog" ? 2.3 : 1.4) * dt, want = d > 4.5 ? 1 : d < 2.6 ? -1 : 0, ux = dx / d, uy = dy / d;
      const vx = (ux * want + -uy * e.strafe * .7) * spd, vy = (uy * want + ux * e.strafe * .7) * spd;
      if (free(e.x + vx, e.y, SP[e.type].r)) e.x += vx; else e.strafe = -e.strafe; if (free(e.x, e.y + vy, SP[e.type].r)) e.y += vy; else e.strafe = -e.strafe;
      e.cool -= dt;
      if (see && e.cool <= 0) {
        const a = Math.atan2(dy, dx);
        if (e.type === "drone") { e.cool = 1.6 + Math.random() * 1.1; G.shots.push({x: e.x, y: e.y, vx: Math.cos(a) * 4.2, vy: Math.sin(a) * 4.2, dmg: 10, sp: SP.shot, z: .45}); SFX.play("eshot"); }
        else { e.cool = 1.3 + Math.random() * .7; for (let k = 0; k < 2; k++) setTimeout(() => { if (G.enemies.includes(e)) G.shots.push({x: e.x, y: e.y, vx: Math.cos(a) * 8, vy: Math.sin(a) * 8, dmg: 7, sp: SP.laser, z: .3}); SFX.play("laser"); }, k * 140); }
      }
    }
    for (let i = G.shots.length - 1; i >= 0; i--) { const s = G.shots[i]; s.x += s.vx * dt; s.y += s.vy * dt;
      if (solid(s.x, s.y)) { G.shots.splice(i, 1); continue; }
      if (Math.hypot(s.x - G.px, s.y - G.py) < .3) { G.shots.splice(i, 1); hurt(s.dmg); } }
    for (let i = G.booms.length - 1; i >= 0; i--) { G.booms[i].t += dt; if (G.booms[i].t > .45) G.booms.splice(i, 1); }
    for (let i = G.items.length - 1; i >= 0; i--) { const it = G.items[i]; if (Math.hypot(it.x - G.px, it.y - G.py) > .5) continue;
      if (it.type === "health") { if (G.hp >= 100) continue; G.hp = Math.min(100, G.hp + 25); say("+25 health"); } else { G.ammo += 20; say("+20 ammo"); }
      G.items.splice(i, 1); SFX.play("pick"); }
    if (G.cage && !G.freed && Math.hypot(G.cage.x - G.px, G.cage.y - G.py) < 1.8 && G.msgT < .2) say("Press E to free Scrub-Zero", .3);
    if (G.freed) { G.freeT += dt; if (G.freeT > 2.6 && !G.over) finish(true); }
  }
  function hurt(n) { if (G.over) return; G.hp -= n; G.hurt = .35; SFX.play("hurt"); if (G.hp <= 0) { G.hp = 0; finish(false); } }
  function fire() {
    if (G.ammo <= 0) { G.cool = .3; SFX.play("click"); say("Out of ammo! Find a battery."); return; }
    G.ammo--; G.cool = .26; G.flash = .07; SFX.play("shoot");
    const ca = Math.cos(G.ang), sa = Math.sin(G.ang); let best = null, bd = zbuf[W >> 1] || 99;
    for (const e of G.enemies) { const rx = e.x - G.px, ry = e.y - G.py, depth = rx * ca + ry * sa, side = -rx * sa + ry * ca; if (depth > 0 && depth < bd && Math.abs(side) < SP[e.type].r + .05) { bd = depth; best = e; } }
    G.enemies.forEach(e => { if (Math.hypot(e.x - G.px, e.y - G.py) < 9) e.awake = true; });   // the noise wakes up anything nearby
    if (best) { best.hp--; best.flash = .12; SFX.play("hit");
      if (best.hp <= 0) { G.enemies.splice(G.enemies.indexOf(best), 1); G.kills++; G.booms.push({x: best.x, y: best.y, t: 0}); SFX.play("boom"); if (Math.random() < .35) G.items.push({x: best.x, y: best.y, type: "ammo"}); } }
  }
  function finish(won) {
    G.over = true; mouseDown = false; if (document.exitPointerLock) document.exitPointerLock();
    const st = `Kills ${G.kills} / ${G.total} &middot; Time ${Math.floor(G.t / 60)}:${String(Math.floor(G.t % 60)).padStart(2, "0")} &middot; Health ${G.hp}%`;
    if (won) { $("won-stats").innerHTML = st; $("won").hidden = false; } else { $("dead-stats").innerHTML = st; $("dead").hidden = false; }
  }

  /* ---------------- render ---------------- */
  const shade = (c, f) => { const r = (c & 255) * f, g = ((c >> 8) & 255) * f, b = ((c >> 16) & 255) * f; return 0xff000000 | (b << 16) | (g << 8) | r; };
  const fog = d => Math.max(.18, Math.min(1, 1.15 - d / 11));
  function render() {
    const dirX = Math.cos(G.ang), dirY = Math.sin(G.ang), plX = -dirY * .66, plY = dirX * .66, half = VH / 2;
    // floor + ceiling
    for (let y = half + 1; y < VH; y++) {
      const rowD = half / (y - half), f = fog(rowD), rx0 = dirX - plX, ry0 = dirY - plY, stx = rowD * 2 * plX / W, sty = rowD * 2 * plY / W;
      let fx = G.px + rowD * rx0, fy = G.py + rowD * ry0; const yo = y * W, yc = (VH - 1 - y) * W;
      for (let x = 0; x < W; x++, fx += stx, fy += sty) {
        const cx = fx | 0, cy = fy | 0, tx = ((fx - cx) * TEX) & 63, ty = ((fy - cy) * TEX) & 63, ti = ty * TEX + tx;
        buf[yo + x] = shade((cy >= 13 ? T.icefloor : T.floor)[ti], f); buf[yc + x] = shade(T.ceil[ti], f * .9);
      }
    }
    // walls (DDA), with sliding doors drawn in the middle of their cell
    for (let x = 0; x < W; x++) {
      const camX = 2 * x / W - 1, rdx = dirX + plX * camX, rdy = dirY + plY * camX;
      let mx = Math.floor(G.px), my = Math.floor(G.py); const ddx = Math.abs(1 / rdx), ddy = Math.abs(1 / rdy), sx = rdx < 0 ? -1 : 1, sy = rdy < 0 ? -1 : 1;
      let sdx = (rdx < 0 ? G.px - mx : mx + 1 - G.px) * ddx, sdy = (rdy < 0 ? G.py - my : my + 1 - G.py) * ddy, side = 0, dist = 30, tex = T.brick, u = 0;
      for (let step = 0; step < 64; step++) {
        if (sdx < sdy) { sdx += ddx; mx += sx; side = 0; } else { sdy += ddy; my += sy; side = 1; }
        const c = cell(mx, my); if (c === "." || c === "P" || c === "e" || c === "g" || c === "h" || c === "a" || c === "C") continue;
        if (c === "D") {
          const dr = G.doors[mx + "," + my]; let t, hit;
          if (side === 0) { t = (mx + .5 - G.px) / rdx; hit = G.py + t * rdy; if (Math.floor(hit) !== my) continue; }
          else { t = (my + .5 - G.py) / rdy; hit = G.px + t * rdx; if (Math.floor(hit) !== mx) continue; }
          const fr = hit - Math.floor(hit); if (fr < dr.open) continue;
          dist = t; tex = T.door; u = fr - dr.open; break;
        }
        dist = side === 0 ? sdx - ddx : sdy - ddy; tex = WALLTEX[c] || T.brick;
        u = side === 0 ? G.py + dist * rdy : G.px + dist * rdx; u -= Math.floor(u);
        if ((side === 0 && rdx > 0) || (side === 1 && rdy < 0)) u = 1 - u;
        break;
      }
      zbuf[x] = dist;
      const lh = VH / dist, top = Math.floor(half - lh / 2), bot = Math.floor(half + lh / 2), tx = Math.min(63, (u * TEX) | 0), f = fog(dist) * (side ? .78 : 1);
      for (let y = Math.max(0, top); y < Math.min(VH, bot); y++) { const ty = Math.min(63, (((y - top) / lh) * TEX) | 0); buf[y * W + x] = shade(tex[ty * TEX + tx], f); }
    }
    // sprites, far to near
    const invDet = 1 / (plX * dirY - dirX * plY), list = [];
    G.items.forEach(it => list.push({x: it.x, y: it.y, sp: SP[it.type], s: .32, z: 0}));
    G.enemies.forEach(e => list.push({x: e.x, y: e.y, sp: SP[e.type], s: e.type === "drone" ? .62 : .58, z: e.type === "drone" ? .28 + Math.sin(e.bob * 3) * .05 : 0, flash: e.flash > 0}));
    G.shots.forEach(s => list.push({x: s.x, y: s.y, sp: s.sp, s: .18, z: s.z}));
    G.booms.forEach(b => list.push({x: b.x, y: b.y, sp: SP.boom[Math.min(3, Math.floor(b.t / .12))], s: .7, z: .15}));
    if (G.cage) { list.push({x: G.cage.x, y: G.cage.y, sp: helperSp, s: .9, z: 0});
      if (!G.freed || G.freeT < 1) list.push({x: G.cage.x - Math.cos(G.ang) * .02, y: G.cage.y - Math.sin(G.ang) * .02, sp: cageSp, s: 1, z: G.freed ? G.freeT * 1.2 : 0}); }
    list.forEach(o => { const rx = o.x - G.px, ry = o.y - G.py; o.tx = invDet * (dirY * rx - dirX * ry); o.ty = invDet * (-plY * rx + plX * ry); });
    list.sort((a, b) => b.ty - a.ty);
    for (const o of list) {
      if (o.ty <= .1) continue;
      const sp = o.sp, scr = (W / 2) * (1 + o.tx / o.ty), unit = VH / o.ty, sh = unit * o.s, sw = sh * sp.w / sp.h;
      const bottom = half + unit / 2 - o.z * unit, topY = bottom - sh, left = scr - sw / 2, f = fog(o.ty);
      const x0 = Math.max(0, Math.floor(left)), x1 = Math.min(W, Math.ceil(left + sw)), y0 = Math.max(0, Math.floor(topY)), y1 = Math.min(VH, Math.ceil(bottom));
      for (let x = x0; x < x1; x++) { if (o.ty >= zbuf[x]) continue; const tx = Math.min(sp.w - 1, ((x - left) / sw * sp.w) | 0);
        for (let y = y0; y < y1; y++) { const ty = Math.min(sp.h - 1, ((y - topY) / sh * sp.h) | 0), c = sp.p[ty * sp.w + tx]; if ((c >>> 24) < 128) continue; buf[y * W + x] = o.flash ? 0xffffffff : shade(c, f); } }
    }
    fctx.putImageData(img, 0, 0);
    // the gun, with bob and recoil
    const bx = Math.cos(G.bob) * 4, by = Math.abs(Math.sin(G.bob)) * 4 + (G.flash > 0 ? 5 : 0);
    if (G.flash > 0) fctx.drawImage(flashCv, W / 2 - 20 + bx, VH - 92 + by);
    fctx.drawImage(SP.gun, W / 2 - 48 + bx, VH - 66 + by);
    // crosshair
    fctx.fillStyle = "rgba(255,255,255,.75)"; fctx.fillRect(W / 2 - 1, half - 5, 2, 3); fctx.fillRect(W / 2 - 1, half + 3, 2, 3); fctx.fillRect(W / 2 - 5, half - 1, 3, 2); fctx.fillRect(W / 2 + 3, half - 1, 3, 2);
    if (G.hurt > 0) { fctx.fillStyle = `rgba(255,30,40,${G.hurt * .9})`; fctx.fillRect(0, 0, W, VH); }
    if (G.freed && G.freeT < .6) { fctx.fillStyle = `rgba(200,240,255,${.6 - G.freeT})`; fctx.fillRect(0, 0, W, VH); }
    hud(); if (G.map) minimap();
    if (G.msgT > 0) { fctx.font = "bold 9px monospace"; fctx.textAlign = "center"; fctx.fillStyle = "#000"; fctx.fillText(G.msg, W / 2 + 1, 15); fctx.fillStyle = "#ffe680"; fctx.fillText(G.msg, W / 2, 14); }
    sctx.imageSmoothingEnabled = false; sctx.drawImage(frame, 0, 0);
  }
  function hud() {
    const y = VH; fctx.fillStyle = "#2a2e38"; fctx.fillRect(0, y, W, HUD); fctx.fillStyle = "#4a505e"; fctx.fillRect(0, y, W, 2); fctx.fillStyle = "#16181d"; fctx.fillRect(0, H - 2, W, 2);
    const box = (x, w, label, val, col) => { fctx.fillStyle = "#1a1d24"; fctx.fillRect(x, y + 4, w, HUD - 8); fctx.fillStyle = "#8a93a6"; fctx.font = "bold 7px monospace"; fctx.textAlign = "center"; fctx.fillText(label, x + w / 2, y + 26);
      fctx.font = "bold 14px monospace"; fctx.fillStyle = col; fctx.fillText(val, x + w / 2, y + 18); };
    box(6, 62, "HEALTH", G.hp + "%", G.hp > 30 ? "#ff5a6a" : "#ff2030"); box(72, 56, "AMMO", String(G.ammo), "#ffc857"); box(W - 128, 56, "KILLS", G.kills + "/" + G.total, "#5df2a4");
    fctx.fillStyle = "#1a1d24"; fctx.fillRect(W - 68, y + 4, 62, HUD - 8); fctx.fillStyle = "#8a93a6"; fctx.font = "bold 7px monospace"; fctx.fillText("RESCUE", W - 37, y + 26);
    fctx.drawImage(helperSp.cv, W - 52, y + 3, 20, 20); if (G.freed) { fctx.fillStyle = "#5df2a4"; fctx.fillText("FREED", W - 37, y + 14); }
    // your bot's face: yellow head, visor eyes; red and gritted when hurt
    const fx = W / 2 - 14, fy = y + 3, hurtLook = G.hurt > 0 || G.hp < 30; fctx.fillStyle = "#1a1d24"; fctx.fillRect(fx - 3, fy - 1, 34, 28);
    fctx.fillStyle = hurtLook ? "#e0a83a" : "#ffc857"; fctx.fillRect(fx, fy + 2, 28, 22); fctx.fillStyle = "#b8862b"; fctx.fillRect(fx, fy + 20, 28, 4); fctx.fillStyle = "#3a3f48"; fctx.fillRect(fx + 12, fy - 1, 4, 4);
    fctx.fillStyle = "#14161c"; fctx.fillRect(fx + 3, fy + 7, 22, 8); const look = Math.sin(G.t * .7) > .6 ? 1 : Math.sin(G.t * .7) < -.6 ? -1 : 0;
    fctx.fillStyle = hurtLook ? "#ff4d6d" : "#eaf2ff"; fctx.fillRect(fx + 6 + look * 2, fy + 9, 4, 4); fctx.fillRect(fx + 18 + look * 2, fy + 9, 4, 4);
    fctx.fillStyle = "#3a2a10"; if (G.hp < 30) { fctx.fillRect(fx + 8, fy + 18, 12, 2); } else fctx.fillRect(fx + 10, fy + 18, 8, 1);
  }
  function minimap() {
    const s = 6, ox = (W - MW * s) / 2, oy = (VH - MH * s) / 2; fctx.fillStyle = "rgba(5,7,13,.8)"; fctx.fillRect(ox - 4, oy - 4, MW * s + 8, MH * s + 8);
    MAP.forEach((row, y) => [...row].forEach((ch, x) => { const col = {"#": "#8a3a26", M: "#6e7482", I: "#9fd8f0", D: "#ffc22a"}[ch]; if (col) { fctx.fillStyle = col; fctx.fillRect(ox + x * s, oy + y * s, s - 1, s - 1); } }));
    if (G.cage) { fctx.fillStyle = G.freed ? "#5df2a4" : "#5ab8ff"; fctx.fillRect(ox + G.cage.x * s - 2, oy + G.cage.y * s - 2, 4, 4); }
    G.enemies.filter(e => e.awake).forEach(e => { fctx.fillStyle = "#ff4d6d"; fctx.fillRect(ox + e.x * s - 1, oy + e.y * s - 1, 2, 2); });
    fctx.fillStyle = "#ffe680"; fctx.fillRect(ox + G.px * s - 2, oy + G.py * s - 2, 4, 4); fctx.strokeStyle = "#ffe680"; fctx.beginPath(); fctx.moveTo(ox + G.px * s, oy + G.py * s); fctx.lineTo(ox + (G.px + Math.cos(G.ang) * 1.5) * s, oy + (G.py + Math.sin(G.ang) * 1.5) * s); fctx.stroke();
  }

  /* ---------------- loop ---------------- */
  let last = 0;
  function loop(now) { const dt = Math.min(.05, (now - last) / 1000 || 0); last = now; if (started && !G.over) update(dt); render(); requestAnimationFrame(loop); }
  function begin() { $("title").hidden = true; $("dead").hidden = true; $("won").hidden = true; reset(); started = true; SFX.play("pick"); if (screen.requestPointerLock) screen.requestPointerLock(); }
  $("start").addEventListener("click", begin); $("retry").addEventListener("click", begin); $("again").addEventListener("click", begin);
  reset(); requestAnimationFrame(loop);
  window.__fps = {get G() { return G; }, keys, begin};   // for automated tests
})();
