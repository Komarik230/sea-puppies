# SEA PUPPIES

**A pocket pager for one sea lion pup.** Turn it on, take care of eight needs, and find out how much a sea lion really is a "sea puppy". Every need is a true behavior: you watch it, play it, then read one or two sentences about it. The piece ends with a goodbye, a power-off and a homepage from 2004.

Made by Liza & Ulyana for the [Pudding Cup 2026](https://pudding.cool/pudding-cup/). EN / RU.

**Live:** https://komarik230.github.io/sea-puppies/

## What happens inside

| # | need | what you do | what it shows | puppy check |
|---|------|-------------|---------------|-------------|
| 1 | food | send him fishing | small fish go down whole; big prey gets shaken apart at the surface | ✔ |
| 2 | sleep | dim the lights | a puppy pile on land; his cousin the fur seal sleeps at sea with half its brain | ✔ |
| 3 | play | throw the ball | he runs off until he is one pixel; play as practice | ✔ |
| 4 | talk | press B ×3 | bark → roll call (fill the screen with 12,288 sea lions, then find your pup by the *shape* of its voice) → nose to nose | ✔ |
| 5 | grooming | let him scratch | claws on the three middle toes of the hind flipper | ✔ |
| 6 | rescue | cut the loop (3 snips) | **data twist:** packing straps 54%, rubber bands 30%, nets only 7% → *Lose the Loop* | ✘ |
| 7 | heat & cold | sun, then wind | a flipper is a radiator and a solar panel | ✘ |
| 8 | accessories | pick a hat | real sea lions get tags, not hats — the only orange pixels in the piece | ✔ |

Then: puppy score 6/8 (Caniformia, but closest to bears or weasels), the pup swims away, you turn the pager off. Secret level in the credits: `ronan_beat.exe`, a tap-to-the-beat test against Ronan the sea lion (~15 ms).

## Design rules we kept

- The LCD shows only pictures and numbers. All words live in the dialog box, so the piece can be translated and read by screen readers.
- One accent colour: **rescue orange** appears only for real-world things (the flipper tag, "cut every plastic loop").
- Every fact is an action first, a sentence second.
- Sounds are synthesized pager beeps, never animal recordings pretending to be real.

## Run locally

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

No build step, no dependencies. Plain HTML, CSS and JavaScript (classic scripts, so it even opens from `file://`).

Controls: **A** (or ←) choose · **B** (space / Enter / ↓) OK · **C** (→ / Esc) back · **P** power.

Handy URLs while editing: `?ch=talk` jumps to a chapter (`food sleep play talk care heal thermo decor`), `?end` jumps to the finale, `?credits` opens the homepage, `?fast` speeds everything up.

## Files

```
index.html          page + credits homepage + bonus window
css/style.css       everything visual outside the canvases
js/sprites.gen.js   all pixel art as editable text grids ('.' clear · 0 paper · 1 light · 2 mid · 3 ink · o orange)
js/i18n.js          every sentence, EN + RU
js/audio.js         WebAudio synth (beeps, barks, calls)
js/engine.js        the pager: shell drawing, LCD renderer, buttons, dialog box, hints, night-sea background
js/story.js         the eight chapters, menu, finale
js/credits.js       homepage, sources list, ronan_beat.exe
tools/spritelab.py  generates sprites.gen.js from shapes and renders a preview sheet
fonts/              Pixelify Sans (SIL Open Font License), Latin + Cyrillic
```

### Redrawing the art

The pixel art is a placeholder drawn in code. To make it yours, either edit the grids in `js/sprites.gen.js` by hand (each character is one LCD pixel), or change the shapes in `tools/spritelab.py` and run:

```bash
python3 tools/spritelab.py preview.png js/sprites.gen.js
```

## Sources

Every fact links to its source on the final homepage (`sources.txt`). Key ones:

- Raum-Suryan, Jemison & Pitcher (2009), *Marine Pollution Bulletin* — what entangles Steller sea lions' necks (packing bands 54%, rubber bands 30%, net 7%, rope 7%, monofilament 2%); "Lose the loop".
- Raum-Suryan & Suryan (2022), *Oceans* — Oregon: 60% of entangled Steller sea lions were juveniles.
- Pitcher, Harcourt & Charrier (2010), *PLOS ONE* — Australian sea lion mothers recognize their pup's call by 48 hours.
- Charrier & Harcourt (2006), *Journal of Mammalogy* — individual vocal signatures (frequency modulation, spectrum).
- National Park Service — ~80,000 California sea lions breed on San Miguel Island.
- Lyamin et al. (2018), *Current Biology* — fur seals sleep with one hemisphere at a time in water.
- Llamazares-Martín & Palagi (2021) — play in otariids.
- NOAA Fisheries, The Marine Mammal Center, SeaWorld, Smithsonian's National Zoo, Aquarium of the Pacific — behavior, thermoregulation, tags.
- Cook et al. (2025), *Scientific Reports*; UC Santa Cruz news — Ronan keeps a beat within ~15 ms at 120 bpm.

The voice shapes in the mom game are illustrations of the idea (identity is coded in pitch, rhythm and frequency modulation), not measured calls.
