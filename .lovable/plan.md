# Crystal Realms Landing Page

A single immersive landing page styled like a fantasy MMORPG launcher, using the exact palette you provided. Dark cosmic backgrounds, glowing crystal accents, glassmorphism HUD panels, floating shards, and animated mist.

## Design system (src/styles.css)

Replace the default tokens with the Crystal Realms palette as semantic tokens (oklch, used via `bg-abyss`, `text-crystal`, etc.):

- Backgrounds: `abyss` #050816, `deep-space` #0B1023, `realm-purple` #1B1235, `midnight` #111827
- Glow: `crystal` #00E5FF, `aqua` #4FFBFF, `neon-blue` #3B82F6, `arcane` #60A5FA
- Accents: `crystal-purple` #7C3AED, `mystic` #8B5CF6, `shard` #EC4899, `loot` #FACC15
- UI: `frost` #E2E8F0, `mist` #94A3B8

Plus utilities and keyframes:

- `.glass-panel`, `.crystal-border`, `.btn-crystal` (cyan→blue→violet animated gradient, glow), `.btn-ghost-crystal`, `.gradient-text-crystal`, `.text-glow-crystal`
- Keyframes: `float-shard`, `pulse-glow`, `particle-rise`, `mist-drift`, `border-pulse`, `gradient-shift`
- Fonts: Cinzel (display headings), Press Start 2P (pixel-fantasy accents like the Crystal Realms reference), Inter (body)

## Page structure (single route: `src/routes/index.tsx`)

Replaces the placeholder. Sections in order:

1. **Fixed Nav** — pixel-style logo mark, links (Home, Realms, Classes, Guilds, News), animated cyan "Join Our Discord" button.
2. **Hero** — fullscreen cosmic background image (already generated: `hero-bg.jpg`) with parallax layers, drifting mist, floating crystal shards, rising particles. Eyebrow chip "The Sovereign Service Guild" style, headline "Enter the Realm of Legends" with gradient-text, subtext, two CTAs (Play Now = crystal gradient, Explore Realms = ghost). Scroll indicator.
3. **Featured Realms** — 3 large cards using `realm-crystal.jpg`, `realm-skye.jpg`, `realm-abyss.jpg` as backgrounds with glow borders, realm name, lore line, "Enter" hover state.
4. **Character Classes** — 4 portrait cards (Warrior, Mage, Rogue, Ranger) with stat bars, glowing class icons, glass HUD frames. Uses the generated portrait images.
5. **Game Features** — 6 HUD/inventory-style panels (Crystal Magic System, Open World, Real-time Combat, Crafting, Mounts & Pets, Cross-Platform) with lucide icons and glow borders.
6. **Guild & PvP** — split section with `guild-war.jpg`, stat counters (active guilds, weekly battles, world bosses), and a call to "Forge Your Guild".
7. **Trailer** — wide cinematic card using `trailer-thumb.jpg` with a large glowing play button overlay.
8. **News / Events** — 3 patch/event cards with date pills, glow accent line.
9. **Download CTA** — full-bleed gradient band, big "Download Client" button, platform tags (PC, Mac, Mobile), file size.
10. **Footer** — fantasy launcher style: logo, link columns, social, version line.

## Technical notes

- Stays on `/` only — no extra routes needed for this brief.
- All imagery imported as ES6 from `src/assets/` (already generated).
- Animations are pure CSS keyframes; no extra library required (lightweight, no Framer Motion install needed unless you want it).
- Fully responsive: hero stacks on mobile, realm cards collapse to 1 column, class grid to 2 columns.
- Updates `__root.tsx` head meta to "Crystal Realms — Enter the Realm of Legends" with matching og text and the hero image as og:image.

## Files touched

```text
src/styles.css                 (replace — new palette + utilities + keyframes)
src/routes/index.tsx           (replace placeholder with full landing)
src/routes/__root.tsx          (update head meta only)
src/assets/hero-bg.jpg         (already generated)
src/assets/realm-crystal.jpg   (already generated)
src/assets/realm-skye.jpg      (already generated)
src/assets/realm-abyss.jpg     (already generated)
src/assets/class-warrior.jpg   (already generated)
src/assets/class-mage.jpg      (already generated)
src/assets/class-rogue.jpg     (already generated)
src/assets/class-ranger.jpg    (already generated)
src/assets/guild-war.jpg       (already generated)
src/assets/trailer-thumb.jpg   (already generated)
```

Approve and I'll build it.
