/* 16-bit helper sprites for Story Mode (2026-11-28).
   Each helper is drawn as flat shapes on a small canvas, then "pixelized" into a 16-bit look:
     1. snap every pixel to the sprite's own palette (no blurry edges)
     2. rim shading per color region: 1px highlight on top-left edges, 2px two-tone shadow on bottom-right edges
     3. selective dark outline around the whole sprite
   Then pixel-exact details (eyes, shines, mouths) are drawn on top.
   Usage: HELPERS16.build("cheeks") -> a 64x64 canvas. Scale it up with imageSmoothingEnabled = false.
   All designs are original parodies; keep them "intellectually different" from what they riff on. */
(function () {
  const W = 64, H = 64;
  const hex = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  const light = c => mix(mix(c, [255, 250, 225], .38), c, 0), dark = (c, k) => mix(c, [24, 14, 48], k);   // shadows lean purple, highlights lean warm (SNES style)

  function make(body, detail) {
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H; const g = cv.getContext("2d");
    const pal = [];
    const col = c => { if (!pal.includes(c)) pal.push(c); return c; };
    const S = {
      E: (x, y, rx, ry, c, rot) => { g.fillStyle = col(c); g.beginPath(); g.ellipse(x, y, rx, ry, rot || 0, 0, Math.PI * 2); g.fill(); },
      R: (x, y, w, h, c) => { g.fillStyle = col(c); g.fillRect(x, y, w, h); },
      RR: (x, y, w, h, r, c) => { g.fillStyle = col(c); g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); },
      P: (pts, c) => { g.fillStyle = col(c); g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill(); },
      L: (pts, w, c) => { g.strokeStyle = col(c); g.lineWidth = w; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); },
      CUT: pts => { g.save(); g.globalCompositeOperation = "destination-out"; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill(); g.restore(); }
    };
    body(S);
    const P = pal.map(hex), src = g.getImageData(0, 0, W, H).data, reg = new Int16Array(W * H).fill(-1);
    for (let i = 0; i < W * H; i++) {                                         // 1. snap to palette
      if (src[i * 4 + 3] < 110) continue;
      let best = 0, bd = 1e9; P.forEach((p, k) => { const d = (p[0] - src[i * 4]) ** 2 + (p[1] - src[i * 4 + 1]) ** 2 + (p[2] - src[i * 4 + 2]) ** 2; if (d < bd) { bd = d; best = k; } });
      reg[i] = best;
    }
    const at = (x, y) => x < 0 || y < 0 || x >= W || y >= H ? -1 : reg[y * W + x];
    const out = g.createImageData(W, H), o = out.data;
    const put = (x, y, c) => { const i = (y * W + x) * 4; o[i] = c[0]; o[i + 1] = c[1]; o[i + 2] = c[2]; o[i + 3] = 255; };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {                  // 2. rim shading
      const k = at(x, y); if (k < 0) continue; const c = P[k];
      if (at(x + 1, y + 1) !== k || at(x, y + 1) !== k) put(x, y, dark(c, .42));
      else if (at(x + 2, y + 2) !== k || at(x + 2, y) !== k && at(x, y + 2) !== k) put(x, y, dark(c, .22));
      else if (at(x - 1, y - 1) !== k || at(x, y - 1) !== k) put(x, y, light(c));
      else put(x, y, c);
    }
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {                  // 3. selective outline
      if (at(x, y) >= 0) continue;
      const n = [at(x - 1, y), at(x + 1, y), at(x, y - 1), at(x, y + 1)].find(k => k >= 0);
      if (n !== undefined) put(x, y, dark(P[n], .78));
    }
    g.clearRect(0, 0, W, H); g.putImageData(out, 0, 0);
    if (detail) detail((x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w || 1, h || 1); }, g);
    return cv;
  }

  const DEF = {
    cheeks: {
      name: "Master Cheeks", blurb: "Space marine, full armor... except the back. Sharpshooter, twerker, Spartan-laser finisher.",
      body: S => {
        S.R(23, 49, 8, 10, "#4f7a30"); S.R(33, 49, 8, 10, "#5b8a3a");                          // legs
        S.RR(20, 57, 12, 6, 2, "#2f3f22"); S.RR(32, 57, 12, 6, 2, "#33452a");                 // boots
        S.E(17, 46, 7, 8, "#ffb3a7"); S.E(23, 48, 7, 8, "#f6a497");                            // the cheeks
        S.RR(20, 26, 27, 19, 6, "#5b8a3a"); S.RR(24, 28, 16, 10, 3, "#6a9a44");                // torso + chest plate
        S.R(20, 43, 27, 5, "#3a5226");                                                         // belt
        S.R(28, 22, 12, 6, "#3f4d36");                                                         // neck seal
        S.RR(22, 3, 25, 22, 8, "#5d8d3b");                                                     // helmet
        S.RR(31, 9, 17, 10, 4, "#33d6ff");                                                     // visor
        S.E(44, 29, 7, 6, "#6fa048");                                                          // shoulder pad
        S.R(34, 33, 28, 5, "#2b3446"); S.R(52, 31, 6, 2, "#2b3446"); S.R(40, 38, 5, 5, "#2b3446");  // rifle
        S.E(41, 37, 5, 5, "#5b8a3a");                                                          // arm
      },
      detail: (D) => { D(33, 10, 6, 2, "#e8fbff"); D(33, 12, 2, 2, "#e8fbff"); D(26, 31, 2, 2, "#ffe14a"); D(30, 31, 2, 2, "#ff6b3d");
        D(19, 44, 1, 7, "#c8706a"); D(16, 43, 2, 1, "#fff0ec"); D(61, 34, 2, 2, "#8fd14f"); D(23, 44, 3, 3, "#c9a24a"); }
    },
    curby: {
      name: "Curby", blurb: "Round puffball with a sprout on top. Inhales a drone, then fires it back out as a homing turd.",
      body: S => {
        S.E(20, 57, 10, 5, "#ff6b4a"); S.E(44, 57, 10, 5, "#f2603f");                          // feet
        S.E(32, 36, 22, 20, "#ffa96b");                                                        // body
        S.E(10, 39, 6, 5, "#ff9f5e", -.4); S.E(55, 33, 6, 5, "#ff9f5e", .5);                  // arms
        S.L([[32, 17], [32, 9]], 2.5, "#3f8f3a"); S.E(38, 9, 6, 3, "#5fc04a", -.3); S.E(27, 11, 4, 2, "#5fc04a", .4);   // sprout
      },
      detail: (D) => { [[24, 28], [37, 28]].forEach(([x, y]) => { D(x, y, 4, 9, "#1a0f1f"); D(x + 1, y + 1, 2, 3, "#ffffff"); D(x, y + 6, 4, 2, "#3b6bd6"); });
        D(17, 39, 6, 3, "#ff6f8f"); D(42, 39, 6, 3, "#ff6f8f"); D(29, 41, 7, 1, "#7a2a1a"); D(30, 42, 5, 2, "#d8463a"); D(31, 42, 3, 1, "#ff9a9a"); }
    },
    plumbo: {
      name: "Drunky Plumbo", blurb: "A pipe guy who found the cooking sherry. Lobs bottles that splash anything nearby.",
      body: S => {
        S.RR(20, 56, 11, 6, 3, "#6a3a1a"); S.RR(34, 56, 11, 6, 3, "#6a3a1a");                 // shoes
        S.R(22, 48, 8, 10, "#7a3fc0"); S.R(35, 48, 8, 10, "#7a3fc0");                          // legs
        S.E(14, 38, 6, 7, "#ffd23a"); S.E(51, 38, 6, 7, "#f5c832");                            // sleeves
        S.RR(18, 31, 29, 21, 7, "#8a4fd0");                                                    // overalls
        S.E(13, 46, 4, 4, "#ffd2b0"); S.E(52, 46, 4, 4, "#ffd2b0");                            // hands
        S.RR(50, 38, 7, 14, 2, "#3fae5a"); S.R(52, 33, 3, 6, "#2f8a46");                      // bottle
        S.E(32, 23, 13, 11, "#ffd2b0");                                                        // face
        S.E(32, 12, 15, 8, "#ff8a2b"); S.RR(17, 14, 31, 5, 2, "#e86f1a");                      // cap
        S.E(33, 26, 4, 3, "#ff5a5a");                                                          // nose (rosy)
      },
      detail: (D) => { D(29, 8, 6, 5, "#ffffff"); D(31, 9, 2, 3, "#8a4fd0"); D(24, 19, 6, 4, "#ffffff"); D(35, 19, 6, 4, "#ffffff"); D(26, 21, 2, 2, "#2a5ad8"); D(37, 21, 2, 2, "#2a5ad8"); D(24, 19, 6, 2, "#e8a888"); D(35, 19, 6, 2, "#e8a888");   // droopy drunk eyes
        D(23, 29, 9, 2, "#4a2a12"); D(34, 29, 9, 2, "#4a2a12"); D(23, 31, 3, 1, "#4a2a12"); D(40, 31, 3, 1, "#4a2a12"); D(32, 25, 2, 1, "#ffb3b3");
        D(22, 26, 3, 2, "#ff8a8a"); D(41, 26, 3, 2, "#ff8a8a"); D(23, 36, 3, 3, "#ffd23a"); D(39, 36, 3, 3, "#ffd23a"); D(51, 41, 2, 6, "#bff0c8");
        D(57, 22, 3, 3, "#d8f4ff"); D(60, 17, 2, 2, "#d8f4ff"); }
    },
    sprintz: {
      name: "Sweaty Sprintz", blurb: "The fastest thing alive, also the sweatiest. Dashes through a drone and leaves a puddle.",
      body: S => {
        S.P([[24, 10], [6, 14], [18, 20], [2, 28], [18, 30], [4, 42], [22, 40], [12, 50], [28, 44]], "#2fbfae");   // spikes
        S.R(27, 50, 4, 7, "#3fd6c4"); S.R(36, 50, 4, 7, "#3fd6c4");                            // legs
        S.RR(20, 55, 13, 7, 3, "#ff7a2f"); S.RR(34, 55, 13, 7, 3, "#f06e26");                 // sneakers
        S.E(33, 42, 11, 12, "#3fd6c4"); S.E(36, 43, 7, 8, "#f5d6b0");                         // body + belly
        S.E(24, 42, 4, 6, "#3ccbb9", .3); S.E(46, 40, 4, 6, "#3ccbb9", -.4);                  // arms
        S.E(34, 21, 14, 13, "#3fd6c4"); S.E(41, 27, 8, 6, "#f5d6b0");                         // head + muzzle
        S.R(20, 12, 28, 5, "#ff3b5c"); S.P([[20, 13], [8, 8], [11, 15], [20, 17]], "#e8304e"); // headband + tails
      },
      detail: (D) => { D(33, 18, 5, 7, "#ffffff"); D(39, 18, 5, 7, "#ffffff"); D(35, 20, 2, 4, "#14202a"); D(41, 20, 2, 4, "#14202a"); D(35, 20, 1, 1, "#ffffff"); D(41, 20, 1, 1, "#ffffff");
        D(46, 26, 3, 2, "#1a1a1a"); D(38, 30, 7, 1, "#7a3a2a"); D(21, 58, 10, 1, "#ffffff"); D(35, 58, 10, 1, "#ffffff");
        [[49, 12], [52, 20], [18, 24]].forEach(([x, y]) => { D(x, y, 2, 2, "#bfeaff"); D(x, y + 2, 3, 3, "#7fd3ff"); D(x, y + 2, 1, 1, "#ffffff"); }); }
    },
    burpo: {
      name: "Burpo Man", blurb: "Eats crates, stores the gas, then BUUURPs clouds that knock drones out of the air.",
      body: S => {
        S.R(23, 53, 4, 6, "#d8463a"); S.R(37, 53, 4, 6, "#d8463a");                            // legs
        S.RR(18, 57, 12, 5, 2, "#a8302a"); S.RR(34, 57, 12, 5, 2, "#a8302a");                 // shoes
        S.E(31, 32, 24, 24, "#b6e04a");                                                        // body
        S.CUT([[33, 31], [64, 14], [64, 48]]);                                                 // the mouth wedge
        S.P([[34, 31], [55, 22], [55, 40]], "#3a1a2a");                                        // inside of mouth
        S.E(10, 36, 4, 5, "#a8d43f");                                                          // little arm
      },
      detail: (D) => { D(30, 14, 5, 6, "#1a1a1a"); D(31, 15, 2, 2, "#ffffff"); D(27, 11, 8, 2, "#3a5a12"); D(48, 30, 5, 3, "#ff6f8f"); D(46, 29, 3, 1, "#ffffff"); D(46, 33, 3, 1, "#ffffff");
        D(56, 10, 4, 4, "#c8ff9a"); D(60, 5, 3, 3, "#c8ff9a"); D(58, 6, 1, 1, "#ffffff"); }
    },
    kong: {
      name: "Dookie Kong", blurb: "A big gorilla in a bow tie. Throws exactly what you think he throws.",
      body: S => {
        S.E(22, 59, 7, 4, "#3e2410"); S.E(42, 59, 7, 4, "#3e2410");                            // feet
        S.E(32, 41, 20, 17, "#7a4a22");                                                        // body
        S.E(32, 43, 11, 11, "#d9a877");                                                        // belly
        S.E(11, 40, 6, 13, "#8f5a2c", .15); S.E(53, 40, 6, 13, "#8f5a2c", -.15);                // long arms
        S.E(9, 53, 5, 4, "#c08a5a"); S.E(55, 53, 5, 4, "#c08a5a");                              // knuckles
        S.E(20, 14, 4, 4, "#7a4a22"); S.E(44, 14, 4, 4, "#7a4a22");                            // ears
        S.E(32, 17, 13, 12, "#7d4c24"); S.E(32, 22, 11, 8, "#d9a877");                        // head + face
        S.P([[24, 29], [32, 32], [40, 29], [40, 36], [32, 33], [24, 36]], "#ffd23a");          // bow tie
        S.E(56, 49, 5, 4, "#6a4012"); S.E(56, 45, 3, 3, "#7a4c18");                            // the dookie
      },
      detail: (D) => { D(26, 17, 4, 3, "#ffffff"); D(34, 17, 4, 3, "#ffffff"); D(27, 18, 2, 2, "#1a0f08"); D(35, 18, 2, 2, "#1a0f08"); D(24, 14, 6, 2, "#3a200c"); D(34, 14, 6, 2, "#3a200c");
        D(29, 23, 2, 2, "#3a200c"); D(33, 23, 2, 2, "#3a200c"); D(27, 27, 10, 1, "#7a3a1a"); D(31, 31, 2, 2, "#e8a812");
        D(54, 39, 1, 2, "#a8e05a"); D(58, 38, 1, 2, "#a8e05a"); D(56, 37, 1, 1, "#a8e05a"); D(54, 46, 2, 1, "#9a6a2a"); }
    },
    pimpachu: {
      name: "Pimpachu", blurb: "An electric rodent who made it big. Zaps a drone so hard it starts pole dancing.",
      body: S => {
        S.P([[22, 50], [10, 46], [16, 42], [6, 36], [14, 34], [8, 26], [20, 34], [16, 38], [24, 42]], "#ffd400");   // lightning tail
        S.RR(24, 56, 7, 5, 2, "#ffffff"); S.RR(34, 56, 7, 5, 2, "#ffffff");                   // white spats
        S.E(32, 44, 12, 13, "#ffd400");                                                        // body
        S.E(21, 44, 8, 15, "#f3eaff"); S.E(43, 44, 8, 15, "#eadcff");                          // fur coat
        S.P([[23, 10], [19, 0], [27, 12]], "#ffd400"); S.P([[41, 10], [45, 0], [37, 12]], "#ffd400");   // ears
        S.E(32, 24, 12, 11, "#ffd400");                                                        // head
        S.R(50, 30, 3, 31, "#2a2030"); S.E(51, 29, 4, 4, "#ffc22a");                          // cane
        S.E(32, 13, 20, 4, "#7a3cc9"); S.RR(22, 2, 20, 12, 3, "#8a4ad9");                      // hat
        S.R(22, 10, 20, 3, "#ffc22a");                                                         // hat band
        S.P([[40, 4], [46, -2], [52, 0], [44, 6]], "#ff6fb5");                                 // feather
      },
      detail: (D) => { D(19, 1, 2, 3, "#2a2030"); D(44, 1, 2, 3, "#2a2030"); D(23, 21, 8, 4, "#14101a"); D(33, 21, 8, 4, "#14101a"); D(31, 22, 2, 1, "#14101a"); D(24, 21, 3, 1, "#7f7fff");
        D(34, 21, 3, 1, "#7f7fff"); D(21, 27, 4, 3, "#ff4a4a"); D(39, 27, 4, 3, "#ff4a4a"); D(29, 29, 6, 1, "#7a3a1a"); D(32, 30, 2, 1, "#ffffff");
        [[26, 37], [28, 40], [30, 42], [32, 43], [34, 42], [36, 40], [38, 37]].forEach(([x, y]) => D(x, y, 2, 2, "#ffc22a")); D(31, 43, 4, 4, "#ffe680"); D(32, 44, 2, 2, "#ffc22a");
        [[18, 36], [17, 42], [18, 48], [45, 36], [46, 42], [45, 48]].forEach(([x, y]) => D(x, y, 2, 2, "#b69cff")); }
    },
    stinion: {
      name: "Stinion", blurb: "A tiny blue capsule henchman in red overalls. Runs up, turns around, and lets one rip.",
      body: S => {
        S.E(8, 46, 7, 5, "#9ad45a"); S.E(5, 40, 4, 3, "#b4e27a");                             // the fart cloud
        S.RR(23, 56, 8, 5, 2, "#1a1d24"); S.RR(34, 56, 8, 5, 2, "#1a1d24");                   // shoes
        S.R(25, 49, 6, 8, "#d8403a"); S.R(34, 49, 6, 8, "#d8403a");                            // legs
        S.E(17, 37, 3, 8, "#58a8ff", .3); S.E(47, 37, 3, 8, "#58a8ff", -.3);                  // arms
        S.E(15, 45, 4, 3, "#1a1d24"); S.E(49, 45, 4, 3, "#1a1d24");                            // gloves
        S.RR(19, 8, 26, 44, 13, "#58a8ff");                                                    // capsule body
        S.R(19, 36, 26, 15, "#e0453a"); S.RR(24, 30, 16, 8, 2, "#e0453a");                     // overalls
        S.R(19, 19, 26, 5, "#2b2f38");                                                         // goggle strap
        S.E(32, 21, 9, 9, "#c9d2e0");                                                          // goggle
      },
      detail: (D) => { D(26, 16, 12, 11, "#ffffff"); D(25, 18, 1, 7, "#ffffff"); D(38, 18, 1, 7, "#ffffff"); D(29, 18, 6, 6, "#7a4a22"); D(31, 20, 2, 2, "#100808"); D(29, 18, 2, 2, "#ffffff");
        D(27, 32, 2, 2, "#ffd23a"); D(35, 32, 2, 2, "#ffd23a"); D(30, 33, 4, 3, "#a8302a"); D(28, 30, 8, 1, "#ffffff"); D(28, 28, 8, 1, "#1a2a4a");
        D(27, 4, 1, 4, "#1a1d24"); D(31, 2, 1, 6, "#1a1d24"); D(35, 4, 1, 4, "#1a1d24"); D(26, 3, 1, 1, "#1a1d24"); D(36, 3, 1, 1, "#1a1d24"); }
    },
    shellby: {
      name: "Ninja Shellby", blurb: "A chubby ninja tortoise with a pool-noodle sword. Tucks in and bowls through four drones.",
      body: S => {
        S.E(26, 38, 18, 19, "#9a5a26");                                                        // shell
        S.E(31, 58, 7, 4, "#5fae42"); S.E(43, 58, 7, 4, "#5fae42");                            // feet
        S.E(38, 41, 11, 14, "#6cc04a"); S.E(39, 42, 8, 11, "#f0e08a");                         // body + belly plate
        S.L([[47, 46], [58, 8]], 6, "#ffe14a");                                                 // pool-noodle sword
        S.R(44, 44, 8, 4, "#3a3a4a");                                                          // hilt
        S.E(49, 41, 5, 5, "#62b844");                                                          // arm
        S.E(41, 20, 12, 11, "#6cc04a");                                                        // head
        S.R(29, 15, 25, 6, "#ff5fa2"); S.P([[30, 16], [18, 10], [22, 17], [16, 22], [30, 21]], "#e84f90");   // headband + tails
      },
      detail: (D) => { D(36, 16, 5, 4, "#ffffff"); D(45, 16, 5, 4, "#ffffff"); D(38, 17, 2, 3, "#14202a"); D(47, 17, 2, 3, "#14202a"); D(38, 17, 1, 1, "#ffffff"); D(47, 17, 1, 1, "#ffffff");
        D(39, 25, 7, 1, "#2a5a1a"); D(45, 24, 2, 1, "#2a5a1a"); D(37, 38, 5, 1, "#c8b45a"); D(36, 43, 6, 1, "#c8b45a"); D(37, 48, 5, 1, "#c8b45a");
        [[16, 30], [22, 24], [14, 40], [20, 46], [26, 34]].forEach(([x, y]) => { D(x, y, 5, 1, "#c88a4a"); D(x, y, 1, 4, "#c88a4a"); });
        D(54, 14, 2, 10, "#fff6b0"); D(50, 30, 1, 8, "#fff6b0"); }
    }
  };

  const cache = {};
  window.HELPERS16 = {
    list: Object.keys(DEF),
    info: k => ({name: DEF[k].name, blurb: DEF[k].blurb}),
    build: k => cache[k] || (cache[k] = make(DEF[k].body, DEF[k].detail))
  };
})();
