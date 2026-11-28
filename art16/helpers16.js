/* Story Mode helpers, 16-bit fighting-game style, 128x128 (2026-11-28 v2). Drawn with SPRITE16 (engine16.js).
   All designs are original parodies: keep them "intellectually different" from what they riff on.
   Usage: HELPERS16.build("kong") -> 128x128 canvas. Scale up with imageSmoothingEnabled = false. */
(function () {
  const FUR = {tex: .5, fur: true};
  const DEF = {
    cheeks: {
      name: "Master Cheeks", blurb: "Space marine, fully armored... except the back. Sharpshooter, twerker, Spartan-laser finisher.",
      body: S => {   // side view, hunched forward, the legendary glossy cheeks out back (2026-11-28, after Travis's meme refs)
        const AR = "#5e8c38", AR2 = "#6e9e42", AD = "#4a7a2c", SU = "#262a34", BT = "#3a5226";
        S.RR(96, 98, 13, 18, 4, AR, {R: 5}); S.RR(92, 114, 24, 10, 3, BT, {R: 3});                          // back leg: shin + boot
        S.E(88, 90, 23, 24, SU, {R: 22});                                                                   // back cheek
        S.E(60, 92, 24, 25, "#2a2e39", {R: 23});                                                            // front cheek
        S.P([[44, 98], [34, 104], [28, 116], [40, 118], [48, 106]], AR, {R: 5}); S.RR(20, 114, 26, 10, 3, BT, {R: 3});   // front leg, knee bent forward
        S.P([[40, 66], [110, 62], [112, 72], [40, 76]], AD, {R: 4});                                         // belt plate across the top of the cheeks
        S.P([[36, 40], [100, 34], [108, 66], [40, 70]], AR, {R: 12});                                        // hunched torso armor
        S.RR(78, 26, 30, 28, 6, AR2, {R: 9});                                                                // backpack
        S.RR(50, 44, 26, 18, 5, AR2, {R: 7, soft: true});                                                    // chest plate
        S.E(50, 48, 14, 11, AR2, {R: 8});                                                                    // shoulder pad
        S.E(42, 64, 9, 14, AR, {rot: .5, R: 6}); S.RR(26, 72, 14, 24, 5, AR, {R: 6}); S.E(32, 98, 8, 7, SU, {R: 5});   // arm hanging forward, glove
        S.R(40, 34, 16, 10, SU);                                                                             // neck
        S.RR(16, 8, 42, 34, 13, AR, {R: 12});                                                                // helmet (facing left)
        S.P([[12, 14], [40, 6], [56, 12], [30, 18]], AR2, {R: 4});                                           // brow ridge
        S.RR(12, 20, 22, 14, 6, "#2fb8e8", {R: 6});                                                          // visor
      },
      detail: (D, DL, T) => {
        const gloss = (cx, cy, rx, ry, a0, a1, w) => { for (let a = a0; a <= a1; a += .02) { const x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry; D(x, y, w, w, "#ffffff"); } };
        gloss(60, 92, 21, 22, .05, 1.6, 2); gloss(88, 90, 20, 21, 0, 1.5, 2);                            // big white rim gloss, like the stickers
        gloss(60, 92, 16, 17, .5, 1.0, 1); gloss(88, 90, 15, 16, .45, .95, 1);                              // second thinner shine
        D(48, 78, 5, 3, "#ffffff"); D(46, 81, 2, 2, "#ffffff"); D(78, 76, 5, 3, "#ffffff"); D(76, 79, 2, 2, "#ffffff");   // top glints
        D(53, 74, 2, 2, "#c8d0e0"); D(84, 72, 2, 2, "#c8d0e0");
        D(15, 23, 8, 2, "#e8fbff"); D(15, 26, 3, 2, "#e8fbff"); D(26, 30, 5, 1, "#1a7aa8");                  // visor shine
        DL([[40, 22], [56, 20]], T("#5e8c38", 0)); DL([[44, 30], [56, 30]], T("#5e8c38", 0));               // helmet panel lines
        DL([[62, 40], [98, 37]], T("#5e8c38", 0)); DL([[70, 50], [72, 64]], T("#5e8c38", 0)); DL([[88, 46], [90, 64]], T("#5e8c38", 0));   // armor seams
        D(84, 32, 18, 2, T("#6e9e42", 0)); D(84, 37, 18, 2, T("#6e9e42", 0)); D(84, 42, 18, 2, T("#6e9e42", 0));   // backpack vents
        D(56, 48, 3, 3, "#ffe14a"); D(61, 48, 3, 3, "#5df2a4");
        [[112, 84], [20, 70], [114, 102]].forEach(([x, y]) => { D(x, y - 1, 1, 3, "#ffffff"); D(x - 1, y, 3, 1, "#ffffff"); });   // sparkles
      }
    },
    sirby: {
      name: "Sirby", blurb: "Round puffball with a sprout on top. Inhales a drone, then fires it back out as a homing turd.",
      body: S => {
        S.E(38, 114, 21, 10, "#8a4fd0", {R: 7}); S.E(90, 114, 21, 10, "#8048c8", {R: 7});                    // feet
        S.E(64, 70, 43, 41, "#c9a8ff", {R: 24});                                                   // body
        S.E(19, 78, 12, 10, "#bb98f5", {rot: -.4, R: 7}); S.E(110, 60, 12, 10, "#bb98f5", {rot: .5, R: 7}); // arms (one waving)
        S.L([[64, 32], [64, 16]], 4, "#3f8f3a", {R: 2}); S.E(77, 16, 12, 6, "#5fc04a", {rot: -.3, R: 4}); S.E(52, 21, 8, 4, "#5fc04a", {rot: .4, R: 3});   // sprout
      },
      detail: (D, DL) => {
        [[48, 50], [72, 50]].forEach(([x, y]) => { D(x + 1, y, 6, 20, "#1a0f1f"); D(x, y + 2, 8, 16, "#1a0f1f"); D(x + 1, y + 13, 6, 6, "#3b6bd6"); D(x + 2, y + 2, 3, 6, "#ffffff"); D(x + 5, y + 14, 1, 2, "#9ec2ff"); });
        D(32, 74, 12, 4, "#ff6f8f"); D(84, 74, 12, 4, "#ff6f8f"); D(34, 73, 8, 1, "#ff9ab0"); D(86, 73, 8, 1, "#ff9ab0");
        D(57, 80, 14, 2, "#7a2a1a"); D(59, 82, 10, 5, "#a8302a"); D(61, 84, 6, 3, "#ff8a8a"); D(56, 79, 2, 1, "#7a2a1a"); D(70, 79, 2, 1, "#7a2a1a");
        DL([[66, 18], [84, 13]], "#3f8f3a");
      }
    },
    plumbo: {
      name: "Drunky Plumbo", blurb: "A pipe guy who found the cooking sherry. Lobs bottles that splash anything nearby.",
      body: S => {
        const SK = "#ffd2b0", PU = "#8a4fd0";
        S.RR(34, 114, 26, 10, 5, "#6a3a1a", {R: 5}); S.RR(68, 114, 26, 10, 5, "#6a3a1a", {R: 5});           // shoes
        S.R(44, 98, 16, 18, "#7a3fc0", {R: 6}); S.R(68, 98, 16, 18, "#7a3fc0", {R: 6});                       // legs
        S.RR(32, 56, 64, 32, 12, "#ffd23a", {R: 10});                                                         // shirt
        S.E(26, 76, 12, 15, "#ffd23a", {R: 8}); S.E(102, 76, 12, 15, "#f5c832", {R: 8});                    // sleeves
        S.RR(36, 66, 56, 40, 14, PU, {R: 14, g: "ov"}); S.RR(46, 58, 36, 16, 4, PU, {g: "ov"});              // overalls
        S.E(64, 88, 22, 15, "#9058d8", {soft: true, R: 12});                                                  // the belly
        S.E(25, 93, 9, 9, SK, {R: 6}); S.E(103, 93, 9, 9, SK, {R: 6});                                        // hands
        S.RR(98, 68, 15, 30, 5, "#3fae5a", {R: 6}); S.R(102, 58, 7, 12, "#2f8a46", {R: 3}); S.R(102, 54, 7, 5, "#c89a5a", {R: 2});   // bottle
        S.R(100, 78, 11, 11, "#f4ead2", {flat: true});                                                       // label
        S.E(38, 46, 6, 8, SK, {R: 4}); S.E(90, 46, 6, 8, SK, {R: 4});                                         // ears
        S.E(64, 45, 26, 22, SK, {R: 14});                                                                     // face
        S.E(40, 38, 5, 9, "#4a2a12", {R: 4}); S.E(88, 38, 5, 9, "#4a2a12", {R: 4});                         // sideburns
        S.E(64, 23, 31, 16, "#ff8a2b", {R: 12}); S.RR(31, 29, 66, 9, 4, "#e86f1a", {R: 4}); S.E(64, 19, 8, 8, "#ffffff", {R: 4});   // cap + badge
        S.E(54, 61, 12, 6, "#4a2a12", {R: 4}); S.E(76, 61, 12, 6, "#4a2a12", {R: 4});                       // mustache
        S.E(65, 53, 9, 8, "#ff5a5a", {R: 6});                                                                 // rosy nose
      },
      detail: (D, DL) => {
        D(61, 16, 6, 7, "#8a4fd0"); D(63, 17, 2, 5, "#ffffff");
        D(47, 40, 11, 7, "#ffffff"); D(70, 40, 11, 7, "#ffffff"); D(51, 43, 4, 4, "#2a5ad8"); D(74, 43, 4, 4, "#2a5ad8"); D(52, 44, 2, 2, "#0a0a20"); D(75, 44, 2, 2, "#0a0a20");
        D(47, 40, 11, 3, "#e8a888"); D(70, 40, 11, 3, "#e8a888"); DL([[47, 43], [57, 43]], "#b8786a"); DL([[70, 43], [80, 43]], "#b8786a");
        DL([[46, 36], [57, 38]], "#4a2a12"); DL([[71, 38], [82, 36]], "#4a2a12");
        D(62, 51, 2, 1, "#ffc0c0"); D(67, 55, 1, 1, "#c83030"); D(69, 52, 1, 1, "#c83030"); D(44, 52, 6, 3, "#ff9a9a"); D(80, 52, 6, 3, "#ff9a9a");
        D(57, 66, 14, 3, "#7a2a1a"); D(59, 67, 8, 1, "#ff8a8a");
        D(48, 66, 5, 5, "#ffd23a"); D(75, 66, 5, 5, "#ffd23a"); D(49, 67, 2, 2, "#fff6b0"); D(76, 67, 2, 2, "#fff6b0");
        D(102, 81, 7, 1, "#8a4fd0"); D(102, 84, 5, 1, "#8a4fd0"); D(101, 70, 2, 20, "#bff0c8");
        D(112, 40, 5, 5, "#d8f4ff"); D(118, 30, 4, 4, "#d8f4ff"); D(121, 22, 3, 3, "#d8f4ff"); D(113, 41, 1, 1, "#ffffff");
      }
    },
    sprintz: {
      name: "Sweaty Sprintz", blurb: "The fastest thing alive, also the sweatiest. Dashes through a drone and leaves a puddle.",
      body: S => {
        const TE = "#3fd6c4", TD = "#2fbfae", BE = "#f5d6b0";
        [[[52, 18], [10, 22], [40, 36]], [[46, 34], [4, 46], [40, 54]], [[46, 52], [10, 72], [46, 68]], [[52, 66], [24, 92], [58, 80]]].forEach(p => S.P(p, TD, {R: 5}));   // spikes
        S.R(56, 98, 9, 16, TE); S.R(72, 98, 9, 16, TE);                                                       // legs
        S.R(53, 108, 14, 5, "#ffffff", {flat: true}); S.R(70, 108, 14, 5, "#ffffff", {flat: true});          // socks
        S.RR(38, 112, 30, 12, 6, "#ff7a2f", {R: 5}); S.RR(68, 112, 30, 12, 6, "#f06e26", {R: 5});            // sneakers
        S.E(48, 84, 7, 13, TE, {rot: .4, R: 5});                                                              // back arm
        S.E(66, 84, 21, 22, TE, {R: 13}); S.E(72, 86, 13, 16, BE, {R: 8});                                   // body + belly
        S.E(90, 76, 7, 13, TE, {rot: -.6, R: 5}); S.E(99, 66, 9, 8, "#ffffff", {R: 5});                     // front arm + glove
        S.P([[58, 22], [64, 4], [76, 22]], TE, {R: 5});                                                       // ear
        S.E(70, 42, 27, 24, TE, {R: 15}); S.E(85, 55, 15, 11, BE, {R: 8}); S.E(99, 50, 4, 3, "#1a1a1a", {R: 2});   // head, muzzle, nose
        S.R(42, 22, 58, 9, "#ff3b5c", {R: 4}); S.P([[44, 24], [16, 12], [24, 26], [12, 36], [44, 31]], "#e8304e", {R: 4});   // headband
        [[106, 26], [112, 40], [34, 44], [104, 96]].forEach(([x, y]) => S.E(x, y, 4, 6, "#7fd3ff", {R: 3}));   // sweat
      },
      detail: (D, DL) => {
        D(70, 34, 10, 14, "#ffffff"); D(82, 34, 10, 14, "#ffffff"); D(75, 38, 4, 9, "#14202a"); D(87, 38, 4, 9, "#14202a"); D(76, 39, 2, 2, "#ffffff"); D(88, 39, 2, 2, "#ffffff");
        DL([[69, 32], [79, 30]], "#1a5a52"); DL([[83, 30], [93, 32]], "#1a5a52");
        D(84, 60, 9, 5, "#7a2a2a"); D(86, 62, 5, 3, "#ff7a8a"); D(98, 49, 1, 1, "#ffffff");
        DL([[42, 116], [62, 116]], "#ffffff"); DL([[72, 116], [92, 116]], "#ffffff");
        [[106, 24], [112, 38], [34, 42], [104, 94]].forEach(([x, y]) => D(x - 1, y, 1, 2, "#ffffff"));
      }
    },
    burpo: {
      name: "Burpo Man", blurb: "Eats crates, stores the gas, then BUUURPs clouds that knock drones out of the air.",
      body: S => {
        S.R(44, 102, 9, 14, "#d8463a", {R: 4}); S.R(72, 102, 9, 14, "#d8463a", {R: 4});
        S.RR(34, 113, 26, 11, 5, "#a8302a", {R: 5}); S.RR(64, 113, 26, 11, 5, "#a8302a", {R: 5});
        S.E(62, 62, 48, 46, "#b6e04a", {R: 28});
        S.CUT([[64, 62], [128, 20], [128, 104]]);                                                            // open mouth: a real gap, you see what's behind him
        S.E(14, 70, 8, 11, "#a8d43f", {R: 5});
        S.E(116, 20, 6, 5, "#c8ff9a", {R: 3}); S.E(122, 8, 5, 4, "#c8ff9a", {R: 3}); S.E(110, 6, 3, 3, "#c8ff9a", {R: 2});
      },
      detail: (D, DL) => {
        D(58, 24, 12, 15, "#1a1a1a"); D(60, 26, 4, 5, "#ffffff"); D(66, 34, 2, 2, "#ffffff"); DL([[54, 20], [70, 18]], "#3a5a12"); DL([[54, 21], [70, 19]], "#3a5a12");
        D(40, 88, 2, 2, "#8aa83a"); D(50, 96, 2, 2, "#8aa83a"); D(30, 80, 2, 2, "#8aa83a");
      }
    },
    kong: {
      name: "Dookie Kong", blurb: "A big gorilla in a bow tie. Throws exactly what you think he throws.",
      body: S => {
        const BR = "#6e4220", BR2 = "#7a4a24", SK = "#8c7462", FA = "#9a7e66", LE = "#4a3a32";
        S.E(44, 104, 14, 15, BR, Object.assign({R: 10}, FUR)); S.E(84, 104, 14, 15, BR, Object.assign({R: 10}, FUR));   // legs
        S.E(41, 120, 15, 6, LE, {R: 4}); S.E(87, 120, 15, 6, LE, {R: 4});                                    // feet
        S.E(64, 76, 36, 31, BR, Object.assign({R: 15}, FUR));                                                // torso
        S.E(52, 64, 14, 10, SK, {soft: true, R: 8}); S.E(76, 64, 14, 10, SK, {soft: true, R: 8});            // pecs
        for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) S.RR(53 + c * 12, 76 + r * 9, 10, 8, 3, SK, {soft: true, R: 4});   // abs
        S.E(30, 60, 15, 13, BR2, Object.assign({R: 10}, FUR)); S.E(98, 60, 15, 13, BR2, Object.assign({R: 10}, FUR));   // shoulders
        S.E(22, 80, 11, 18, BR, Object.assign({R: 9, rot: .15}, FUR)); S.E(106, 80, 11, 18, BR, Object.assign({R: 9, rot: -.15}, FUR));   // upper arms
        S.E(19, 101, 12, 13, BR2, Object.assign({R: 9}, FUR)); S.E(109, 101, 12, 13, BR2, Object.assign({R: 9}, FUR));   // forearms
        S.E(19, 116, 11, 8, LE, {R: 6}); S.E(109, 116, 11, 8, LE, {R: 6});                                   // fists
        S.E(119, 122, 8, 4, "#5a3a14", {R: 3}); S.E(119, 117, 6, 4, "#6a4418", {R: 3}); S.E(119, 113, 3, 3, "#7a4c1c", {R: 2});   // the dookie
        S.E(42, 30, 6, 7, SK, {R: 4}); S.E(86, 30, 6, 7, SK, {R: 4});                                        // ears
        S.E(64, 32, 23, 21, BR, Object.assign({R: 12}, FUR));                                                // head
        S.E(64, 26, 19, 6, BR2, {R: 4, tex: .4});                                                            // brow ridge
        S.E(64, 36, 13, 7, FA, {soft: true, R: 5}); S.E(64, 44, 15, 11, FA, {R: 8});                        // face + muzzle
        S.P([[64, 57], [49, 50], [49, 64]], "#ffd23a", {R: 5}); S.P([[64, 57], [79, 50], [79, 64]], "#ffd23a", {R: 5}); S.E(64, 57, 4, 4, "#f0b820", {R: 3});   // bow tie
      },
      detail: (D, DL) => {
        D(54, 31, 8, 5, "#3a2a20"); D(66, 31, 8, 5, "#3a2a20"); D(56, 32, 4, 3, "#c0401a"); D(68, 32, 4, 3, "#c0401a"); D(57, 33, 2, 2, "#100800"); D(69, 33, 2, 2, "#100800"); D(56, 32, 1, 1, "#ffd0a0"); D(68, 32, 1, 1, "#ffd0a0");
        DL([[52, 29], [62, 31]], "#2a1608"); DL([[76, 29], [66, 31]], "#2a1608");
        D(59, 40, 3, 2, "#2a1608"); D(66, 40, 3, 2, "#2a1608");
        D(55, 47, 18, 5, "#2a1010"); D(56, 48, 16, 3, "#f4ead2"); [59, 62, 65, 68].forEach(x => D(x, 48, 1, 3, "#8a7a6a"));
        [[14, 113], [19, 113], [24, 113], [104, 113], [109, 113], [114, 113]].forEach(([x, y]) => DL([[x, y], [x, y + 5]], "#2a2018"));
        [[34, 120], [40, 121], [80, 121], [86, 120]].forEach(([x, y]) => D(x, y, 1, 3, "#2a2018"));
        D(55, 54, 3, 3, "#c89a10"); D(70, 54, 3, 3, "#c89a10");
        D(116, 112, 1, 1, "#ffffff"); D(121, 112, 1, 1, "#ffffff"); DL([[114, 104], [113, 100]], "#a8e05a"); DL([[120, 103], [121, 99]], "#a8e05a"); DL([[125, 106], [127, 102]], "#a8e05a");
      }
    },
    pimpachu: {
      name: "Pimpachu", blurb: "An electric rodent who made it big. Zaps a drone so hard it starts pole dancing.",
      body: S => {
        const YE = "#ffd400", BRN = "#a8641e";
        S.P([[80, 98], [104, 88], [96, 80], [122, 64], [108, 58], [126, 34], [94, 54], [102, 62], [82, 72], [88, 80], [74, 88]], YE, {R: 4});   // lightning-bolt tail
        S.P([[74, 88], [88, 80], [84, 92], [78, 98]], BRN, {R: 3});                                          // brown tail base
        S.E(50, 120, 11, 5, YE, {R: 4}); S.E(78, 120, 11, 5, YE, {R: 4});                                    // feet
        S.E(64, 93, 27, 27, YE, {R: 16});                                                                    // chubby body
        S.E(36, 94, 12, 25, "#f3eaff", {tex: .5, fur: true, R: 9}); S.E(92, 94, 12, 25, "#eadcff", {tex: .5, fur: true, R: 9});   // open fur coat
        S.R(98, 62, 4, 60, "#2a2030", {R: 2}); S.E(100, 60, 6, 6, "#ffc22a", {R: 4});                       // cane
        S.E(42, 82, 7, 9, YE, {rot: .5, R: 5}); S.E(94, 74, 7, 9, YE, {rot: -.4, R: 5});                    // stubby arms
        S.P([[38, 40], [22, -2], [30, -2], [54, 32]], YE, {R: 4}); S.P([[90, 40], [106, -2], [98, -2], [74, 32]], YE, {R: 4});   // long ears
        S.P([[22, -2], [30, -2], [31, 12], [26, 14]], "#1e1a24", {flat: true}); S.P([[106, -2], [98, -2], [97, 12], [102, 14]], "#1e1a24", {flat: true});   // black ear tips
        S.E(64, 54, 31, 26, YE, {R: 17});                                                                    // big round head
        S.E(40, 64, 8, 8, "#ff3a3a", {R: 5}); S.E(88, 64, 8, 8, "#ff3a3a", {R: 5});                         // red cheeks
        S.E(64, 32, 24, 5, "#7a3cc9", {rot: -.12, R: 4}); S.RR(50, 14, 28, 19, 5, "#8a4ad9", {R: 7}); S.R(50, 25, 28, 4, "#ffc22a", {flat: true});   // pimp hat, a little tilted
        S.P([[74, 18], [84, 6], [96, 4], [100, 10], [80, 22]], "#ff6fb5", {R: 3, tex: .4});                 // feather
        S.RR(51, 20, 11, 5, 2, "#14101a", {flat: true}); S.RR(65, 20, 11, 5, 2, "#14101a", {flat: true});    // shades parked on the hat
      },
      detail: (D, DL) => {
        [[50, 48], [71, 48]].forEach(([x, y]) => { D(x + 1, y, 6, 8, "#14101a"); D(x, y + 1, 8, 6, "#14101a"); D(x + 2, y + 1, 3, 3, "#ffffff"); D(x + 5, y + 5, 1, 1, "#ffffff"); });   // beady eyes
        D(63, 58, 2, 1, "#3a2010");                                                                          // nose
        DL([[57, 63], [60, 65], [63, 63]], "#3a2010"); DL([[63, 63], [66, 65], [70, 62]], "#3a2010"); D(65, 65, 2, 2, "#ffc22a");   // smirk + gold tooth
        D(37, 61, 3, 2, "#ff9a9a"); D(85, 61, 3, 2, "#ff9a9a");
        D(52, 21, 4, 1, "#8a8aff"); D(66, 21, 4, 1, "#8a8aff");
        [[46, 78], [49, 83], [53, 87], [58, 90], [63, 91], [68, 90], [73, 87], [77, 83], [80, 78]].forEach(([x, y]) => D(x, y, 3, 3, "#ffc22a"));   // gold chain
        D(58, 92, 11, 11, "#ffe680"); D(60, 94, 7, 7, "#ffc22a"); D(63, 95, 1, 5, "#fff6b0"); D(61, 96, 5, 1, "#fff6b0"); D(61, 98, 5, 1, "#fff6b0");   // medallion
        [[32, 80], [30, 94], [33, 108], [94, 82], [96, 96], [93, 110]].forEach(([x, y]) => D(x, y, 3, 3, "#b69cff"));
        D(98, 58, 2, 2, "#fff6b0");
      }
    },
    stinion: {
      name: "Stinion", blurb: "A tiny blue capsule henchman in red overalls. Runs up, turns around, and lets one rip.",
      body: S => {
        S.E(16, 94, 15, 11, "#9ad45a", {R: 7}); S.E(10, 80, 9, 7, "#b4e27a", {R: 5}); S.E(22, 72, 6, 5, "#b4e27a", {R: 3});   // fart cloud
        S.RR(44, 114, 18, 10, 4, "#1a1d24", {R: 4}); S.RR(68, 114, 18, 10, 4, "#1a1d24", {R: 4});           // shoes
        S.R(48, 98, 12, 18, "#d8403a", {R: 5}); S.R(68, 98, 12, 18, "#d8403a", {R: 5});                       // legs
        S.E(34, 74, 6, 16, "#58a8ff", {rot: .3, R: 4}); S.E(94, 74, 6, 16, "#58a8ff", {rot: -.3, R: 4});    // arms
        S.E(30, 90, 8, 6, "#1a1d24", {R: 4}); S.E(98, 90, 8, 6, "#1a1d24", {R: 4});                          // gloves
        S.RR(38, 14, 52, 90, 26, "#58a8ff", {R: 20});                                                         // capsule body
        S.R(38, 72, 52, 18, "#e0453a", {R: 8, g: "ov"}); S.RR(38, 80, 52, 24, 14, "#e0453a", {g: "ov"}); S.RR(48, 60, 32, 16, 4, "#e0453a", {g: "ov"});   // overalls
        S.R(56, 64, 16, 9, "#c83a30", {flat: true});                                                          // pocket
        S.R(38, 36, 52, 9, "#2b2f38", {R: 3});                                                                // goggle strap
        S.E(64, 42, 18, 18, "#c9d2e0", {R: 8}); S.E(64, 42, 12, 12, "#ffffff", {R: 7});                      // goggle + eye
      },
      detail: (D, DL) => {
        D(58, 36, 12, 12, "#7a4a22"); D(57, 38, 1, 8, "#7a4a22"); D(70, 38, 1, 8, "#7a4a22"); D(61, 39, 6, 6, "#100808"); D(59, 37, 3, 3, "#ffffff"); D(66, 44, 1, 1, "#ffffff");
        DL([[56, 57], [72, 56]], "#1a2a4a"); D(60, 57, 2, 2, "#ffffff"); D(66, 57, 2, 2, "#ffffff");
        D(51, 63, 4, 4, "#ffd23a"); D(73, 63, 4, 4, "#ffd23a"); D(52, 64, 2, 2, "#fff6b0"); D(74, 64, 2, 2, "#fff6b0");
        D(60, 66, 8, 5, "#8ad45a"); D(62, 65, 4, 1, "#b4e27a");
        DL([[56, 14], [53, 4]], "#1a1d24"); DL([[64, 13], [64, 1]], "#1a1d24"); DL([[72, 14], [76, 5]], "#1a1d24");
        [[12, 92], [20, 88], [8, 78]].forEach(([x, y]) => D(x, y, 2, 2, "#e8ffd0"));
      }
    },
    shellby: {
      name: "Ninja Shellby", blurb: "A chubby ninja tortoise with a pool-noodle sword. Tucks in and bowls through four drones.",
      body: S => {
        const GR = "#6cc04a";
        S.E(50, 76, 36, 38, "#9a5a26", {R: 20});                                                              // shell
        [[38, 58], [28, 80], [44, 98], [56, 76], [52, 52], [66, 98]].forEach(([x, y]) => S.P([[x - 9, y], [x - 4, y - 8], [x + 5, y - 8], [x + 9, y], [x + 5, y + 8], [x - 4, y + 8]], "#a8682e", {soft: true, R: 5}));   // plates
        S.E(66, 108, 9, 10, GR, {R: 6}); S.E(86, 108, 9, 10, GR, {R: 6});                                    // legs
        S.E(62, 119, 14, 6, "#5fae42", {R: 4}); S.E(88, 119, 14, 6, "#5fae42", {R: 4});                      // feet
        S.E(76, 82, 22, 28, GR, {R: 13}); S.E(79, 84, 15, 22, "#f0e08a", {R: 8});                            // body + belly plate
        S.L([[96, 94], [118, 14]], 12, "#ffe14a", {R: 6}); S.R(88, 88, 16, 8, "#3a3a4a", {R: 3});             // pool-noodle sword + hilt
        S.E(99, 84, 9, 10, "#62b844", {R: 6});                                                                // arm
        S.E(82, 40, 24, 21, GR, {R: 13});                                                                     // head
        S.R(58, 30, 50, 11, "#ff5fa2", {R: 5}); S.P([[60, 32], [32, 18], [42, 34], [28, 46], [60, 40]], "#e84f90", {R: 4});   // headband
      },
      detail: (D, DL) => {
        D(70, 32, 11, 7, "#ffffff"); D(89, 32, 11, 7, "#ffffff"); D(75, 33, 4, 5, "#14202a"); D(94, 33, 4, 5, "#14202a"); D(75, 33, 1, 1, "#ffffff"); D(94, 33, 1, 1, "#ffffff");
        DL([[74, 50], [92, 49]], "#2a5a1a"); DL([[92, 49], [95, 46]], "#2a5a1a"); D(80, 51, 4, 2, "#ffffff");
        [72, 80, 88, 96].forEach(y => DL([[70, y], [88, y]], "#c8b45a"));
        D(115, 14, 6, 3, "#c8a820"); D(116, 15, 4, 1, "#8a6a10"); DL([[112, 24], [99, 78]], "#fff6b0");
        D(30, 46, 3, 3, "#ffc2dc");
      }
    },
    scrubzero: {
      name: "Scrub-Zero", blurb: "A legendary frost ninja who is a total scrub at everything... except freezing drones solid into ice cubes.",
      body: S => {
        const BL = "#2f6fd0", BD = "#2458b0", SU = "#171d2a", ST = "#9aa6b8";
        S.P([[48, 82], [61, 82], [53, 117], [38, 117]], SU, {R: 6}); S.P([[67, 82], [80, 82], [92, 117], [77, 117]], SU, {R: 6});   // wide fighting stance
        S.P([[40, 102], [53, 102], [52, 116], [38, 116]], BL, {R: 4}); S.P([[77, 102], [90, 102], [92, 116], [78, 116]], BL, {R: 4});   // shin wraps
        S.RR(30, 115, 24, 9, 3, SU, {R: 3}); S.RR(76, 115, 24, 9, 3, SU, {R: 3});                            // tabi boots
        S.P([[38, 42], [90, 42], [82, 84], [46, 84]], SU, {R: 12});                                          // V-shaped torso
        S.E(54, 52, 11, 8, "#1f2738", {soft: true, R: 7}); S.E(74, 52, 11, 8, "#1f2738", {soft: true, R: 7});   // pecs under the suit
        for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) S.RR(57 + c * 8, 62 + r * 7, 7, 6, 2, "#1f2738", {soft: true, R: 3});   // abs
        S.P([[44, 42], [56, 42], [64, 60], [72, 42], [84, 42], [76, 72], [52, 72]], BL, {R: 7});             // blue vest with the black V
        S.P([[51, 76], [77, 76], [82, 106], [46, 106]], BL, {R: 7});                                         // tabard
        S.RR(44, 71, 40, 8, 2, BD, {R: 3}); S.RR(57, 69, 14, 12, 2, ST, {R: 4});                             // belt + steel plate
        S.E(36, 46, 12, 9, ST, {R: 6});                                                                      // steel shoulder guard
        S.E(30, 60, 8, 13, SU, {rot: .35, R: 6}); S.RR(30, 66, 19, 10, 4, BL, {R: 4}); S.E(51, 70, 7, 7, SU, {R: 5});   // guard arm, fist cocked
        S.E(94, 54, 13, 8, SU, {rot: -.25, R: 6}); S.RR(98, 54, 18, 10, 4, BL, {R: 4}); S.E(117, 60, 7, 6, SU, {R: 4});   // arm out, palm up
        S.RR(102, 30, 24, 24, 3, "#a8e8ff", {R: 5, tex: .25});                                               // ICE CUBE with a drone frozen inside
        S.E(64, 25, 17, 19, SU, {R: 11});                                                                    // black hood
        S.RR(52, 18, 24, 8, 3, "#d9a07a", {R: 3});                                                           // eye slot
        S.P([[49, 26], [79, 26], [76, 38], [64, 43], [52, 38]], BL, {R: 6});                                 // blue mask
      },
      detail: (D, DL) => {
        D(54, 20, 8, 4, "#f4fcff"); D(66, 20, 8, 4, "#f4fcff"); D(55, 21, 6, 2, "#bfeaff"); D(67, 21, 6, 2, "#bfeaff");   // glowing white ice eyes
        DL([[52, 18], [61, 21]], "#0a0e16"); DL([[76, 18], [67, 21]], "#0a0e16");
        DL([[56, 30], [64, 36], [72, 30]], "#5a9af0"); DL([[64, 36], [64, 41]], "#5a9af0");                // mask seams
        D(63, 71, 2, 8, "#e8f4ff"); D(60, 74, 8, 2, "#e8f4ff"); D(61, 72, 1, 1, "#e8f4ff"); D(66, 72, 1, 1, "#e8f4ff"); D(61, 77, 1, 1, "#e8f4ff"); D(66, 77, 1, 1, "#e8f4ff");   // snowflake on the belt plate
        D(108, 38, 12, 7, "#6a5a9a"); D(107, 37, 4, 1, "#8a9bbf"); D(117, 37, 4, 1, "#8a9bbf"); D(112, 40, 3, 2, "#ff4d6d");   // frozen drone
        DL([[104, 32], [104, 50]], "#ffffff"); DL([[105, 32], [118, 32]], "#ffffff"); D(121, 48, 2, 2, "#ffffff");
        [[98, 26], [126, 58], [96, 48], [112, 22], [124, 26]].forEach(([x, y]) => { D(x, y - 1, 1, 3, "#e8f8ff"); D(x - 1, y, 3, 1, "#e8f8ff"); });   // frost sparkles
        D(34, 43, 4, 2, "#e0e8f4"); D(59, 70, 3, 1, "#e0e8f4");
      }
    },
  };
  const cache = {};
  window.HELPERS16 = {
    list: Object.keys(DEF),
    info: k => ({name: DEF[k].name, blurb: DEF[k].blurb}),
    build: k => cache[k] || (cache[k] = SPRITE16.make(128, 128, DEF[k].body, DEF[k].detail))
  };
})();
