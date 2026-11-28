# Story Mode plan

Status (2026-11-28): step 1 done. The FPS prototype is playable at `story/fps.html` ("Story Mode: Preview" on the main menu). It's one test level, "The Freezer", where you rescue Scrub-Zero. The 16-bit helper sprites are in `art16/`. Endless mode is the live game in `index.html`.

## The loop

Repeat once per helper until all 10 are unlocked:

1. **Top-down stage.** Clear a top-down shooter stage, the same engine as Endless mode.
2. **Go inside.** Enter a building or an underground tunnel at the end of the stage.
3. **FPS stage, 16-bit.** Classic-Doom-style first-person corridors, fighting enemies. This stage alone switches to 16-bit graphics.
4. **Find or rescue the helper.** That helper is now unlocked for good.
5. **Back up top.** A top-down round again, with that chapter's boss at the end.

Other mechanics may get added to the FPS stages later.

## Each FPS level has a theme that matches its helper

Each theme parodies the helper's source, but is "intellectually different": no copied names, logos, maps or music. These themes are first ideas and still need Travis's approval.

| Helper | FPS level idea |
|---|---|
| Master Cheeks | Crashed space station shaped like a giant donut |
| Sirby | Squishy candy-cloud castle, floors that bounce |
| Drunky Plumbo | Flooded sewer pipes plus a wine cellar |
| Sweaty Sprintz | Steamy gym and sauna; speed boost pads |
| Burpo Man | Neon arcade maze; ghost-drones; beans as power pellets |
| Dookie Kong | Jungle banana-crate warehouse |
| Pimpachu | Nightclub on top of a power plant |
| Stinion | Mad scientist's underground lair |
| Ninja Shellby | Sewer dojo behind a pizza place |
| Scrub-Zero | Frozen temple / ice-cream factory freezer (frost-ninja helper; freezes drones into ice cubes) |

## Tech notes

- **FPS engine:** `story/fps.js` is a Wolfenstein/Doom-style raycaster on canvas, plain JS with no libraries.
  - Renders at 320x200 with code-generated textures, sliding doors, distance fog, and billboard sprites.
  - Two enemy types: drones and robot dogs. Health and ammo pickups.
  - Doom-style HUD with the bot's face, plus a Tab map.
  - The level is an ASCII `MAP` at the top of the file.
  - Headless-test gotcha: pointer lock makes headless Chromium crawl, so stub out `requestPointerLock` in tests.
- **Helper sprites:** Billboards from `art16/helpers16.js` (`HELPERS16.build(name)` returns a 128x128 canvas, drawn by `art16/engine16.js`). The gallery is `art16/gallery.html`.
- **Build order:**
  1. A raycaster prototype with one test level.
  2. The top-down to FPS transition, through a door or tunnel entrance.
  3. The rescue sequence.
  4. Content for each helper.
- **Separate saves:** Keep Story Mode progress apart from the Endless save, or the Endless reset button would wipe story progress.
