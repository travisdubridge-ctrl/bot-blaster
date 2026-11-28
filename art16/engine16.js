/* 16-bit sprite engine for Story Mode (2026-11-28, v2: 128px, sculpted shading).
   A sprite is a list of shapes. Every shape becomes its own "region" and gets:
     - pillow/volume shading: a height field from the distance to the region's edge, lit from the top-left,
       turned into a 5-tone ramp (deep shadow, shadow, base, light, highlight) with Bayer dithering
     - optional texture (fur / scales / cloth grain) as noise on the shading
     - a dark inner outline where it overlaps shapes behind it (skip with soft:true, e.g. muscles)
   then a selective dark outline around the silhouette, then pixel-exact details on top.
   Shape options: {g: "group" (merge with the earlier shape of the same group), soft, flat (rim shading only),
                   tex: 0-1 noise amount, fur: true (streaky noise), R: bulge radius in px (default 9), rot}
   Detail drawing: D(x,y,w,h,color), DL([[x,y],...], color) 1px lines, T(color, tone 0-4) ramp colors. */
(function () {
  const hex = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  const rampOf = c => [mix(c, [26, 12, 46], .62), mix(c, [40, 22, 70], .36), c, mix(c, [255, 246, 214], .26), mix(c, [255, 252, 236], .55)];
  const toHex = a => "#" + a.map(v => v.toString(16).padStart(2, "0")).join("");
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + .5) / 16);
  const hash = (x, y) => { let h = x * 374761393 + y * 668265263; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };

  function make(W, H, body, detail) {
    const sc = document.createElement("canvas"); sc.width = W; sc.height = H; const sg = sc.getContext("2d");
    const ids = new Int16Array(W * H).fill(-1), regs = [], groups = {};
    function shape(path, c, o, stroke) {
      o = o || {}; sg.clearRect(0, 0, W, H); sg.fillStyle = sg.strokeStyle = "#fff"; sg.beginPath(); path(sg);
      if (stroke) { sg.lineWidth = stroke; sg.lineCap = "round"; sg.lineJoin = "round"; sg.stroke(); } else sg.fill();
      const d = sg.getImageData(0, 0, W, H).data;
      let id = -1;
      if (!o.cut) { if (o.g && groups[o.g] !== undefined) id = groups[o.g]; else { id = regs.length; regs.push({c: hex(c), o}); if (o.g) groups[o.g] = id; } }
      for (let i = 0; i < W * H; i++) if (d[i * 4 + 3] >= 120) ids[i] = id;
    }
    const pts = (g, p) => p.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y));
    const S = {
      E: (x, y, rx, ry, c, o) => shape(g => g.ellipse(x, y, rx, ry, (o && o.rot) || 0, 0, Math.PI * 2), c, o),
      R: (x, y, w, h, c, o) => shape(g => g.rect(x, y, w, h), c, o),
      RR: (x, y, w, h, r, c, o) => shape(g => g.roundRect(x, y, w, h, r), c, o),
      P: (p, c, o) => shape(g => { pts(g, p); g.closePath(); }, c, o),
      L: (p, w, c, o) => shape(g => pts(g, p), c, o, w),
      CUT: p => shape(g => { pts(g, p); g.closePath(); }, "#000000", {cut: true})
    };
    body(S);
    // distance to the region edge (two-pass chamfer, only through the same region)
    const at = (x, y) => x < 0 || y < 0 || x >= W || y >= H ? -1 : ids[y * W + x];
    const dist = new Float32Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const k = ids[y * W + x]; dist[y * W + x] = k < 0 ? 0 : (at(x - 1, y) !== k || at(x + 1, y) !== k || at(x, y - 1) !== k || at(x, y + 1) !== k) ? 1 : 1e9; }
    const pass = (x, y, nb) => { const i = y * W + x, k = ids[i]; if (k < 0) return; nb.forEach(([dx, dy, w]) => { if (at(x + dx, y + dy) === k) dist[i] = Math.min(dist[i], dist[(y + dy) * W + x + dx] + w); }); };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) pass(x, y, [[-1, 0, 1], [0, -1, 1], [-1, -1, 1.414], [1, -1, 1.414]]);
    for (let y = H - 1; y >= 0; y--) for (let x = W - 1; x >= 0; x--) pass(x, y, [[1, 0, 1], [0, 1, 1], [1, 1, 1.414], [-1, 1, 1.414]]);
    const hgt = new Float32Array(W * H);
    for (let i = 0; i < W * H; i++) { const k = ids[i]; if (k < 0) continue; const R = regs[k].o.R || 9, t = Math.min(dist[i], R) / R; hgt[i] = R * Math.sqrt(1 - (1 - t) * (1 - t)); }
    for (let it = 0; it < 3; it++) {                                           // smooth the height field so big round shapes don't show facets
      const tmp = Float32Array.from(hgt);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x, k = ids[i]; if (k < 0) continue; let sum = 0, n = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (at(x + dx, y + dy) === k) { sum += tmp[(y + dy) * W + x + dx]; n++; } hgt[i] = sum / n; }
    }
    const L = [-.5, -.7, .85], ln = Math.hypot(...L), Lx = L[0] / ln, Ly = L[1] / ln, Lz = L[2] / ln;
    const out = sg.createImageData(W, H), o = out.data;
    const put = (i, c) => { o[i * 4] = c[0]; o[i * 4 + 1] = c[1]; o[i * 4 + 2] = c[2]; o[i * 4 + 3] = 255; };
    const ramps = regs.map(r => rampOf(r.c));
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, k = ids[i]; if (k < 0) continue; const r = regs[k], ramp = ramps[k];
      const hh = (xx, yy) => at(xx, yy) === k ? hgt[yy * W + xx] : hgt[i] * .25;
      let t;
      if (r.o.flat) {
        t = (at(x + 1, y + 1) !== k || at(x, y + 1) !== k) ? 0.6 : (at(x - 1, y - 1) !== k || at(x, y - 1) !== k) ? 3.4 : 2.2;
      } else {
        let nx = hh(x - 1, y) - hh(x + 1, y), ny = hh(x, y - 1) - hh(x, y + 1), nz = 1.6; const nl = Math.hypot(nx, ny, nz); nx /= nl; ny /= nl; nz /= nl;
        const I = nx * Lx + ny * Ly + nz * Lz;
        t = 2 + (I - Lz) * 5.2;                                                // flat areas sit exactly on the base tone, so they stay clean
        if (r.o.tex) t += (hash(x, r.o.fur ? (y >> 1) + (x & 1) * 7 : y) - .5) * 2.2 * r.o.tex;
        t += (BAYER[(y & 3) * 4 + (x & 3)] - .5) * .8;                         // dither only where the light changes
      }
      let ti = Math.max(0, Math.min(4, Math.round(t)));
      if (!r.o.soft) { for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { const n = at(x + dx, y + dy); if (n >= 0 && n !== k && n < k && !regs[n].o.soft) { ti = 0; break; } } }   // ink line where this part overlaps something behind it
      put(i, ramp[ti]);
    }
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {                // silhouette outline: darkest tone of the neighbor
      if (at(x, y) >= 0) continue; const n = [at(x - 1, y), at(x + 1, y), at(x, y - 1), at(x, y + 1)].find(k => k >= 0);
      if (n !== undefined) put(y * W + x, mix(ramps[n][0], [12, 6, 22], .55));
    }
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H; const g = cv.getContext("2d"); g.putImageData(out, 0, 0);
    if (detail) {
      const D = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w || 1, h || 1); };
      const DL = (p, c) => { for (let s = 0; s < p.length - 1; s++) { let [x0, y0] = p[s].map(Math.round); const [x1, y1] = p[s + 1].map(Math.round), dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy;
        for (;;) { D(x0, y0, 1, 1, c); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } } } };
      const T = (c, n) => toHex(rampOf(hex(c))[n]);
      detail(D, DL, T);
    }
    return cv;
  }
  window.SPRITE16 = {make};
})();
