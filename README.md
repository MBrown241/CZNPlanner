# CZN Upgrade Planner

![CI](https://github.com/MBrown241/CZNPlanner/actions/workflows/ci.yml/badge.svg)

A resource planner for **Chaos Zero Nightmare**. Pick the characters you want to build, set level and skill-tree goals, log what's in your inventory, and see exactly what you still need to farm.

**Live demo:** _add your Vercel/Netlify link here_

<!-- Add a screenshot: save one as docs/screenshot.png and uncomment the line below -->
<!-- ![CZN Planner screenshot](docs/screenshot.png) -->

## Features

- **Upgrade planning for the whole roster.** 40 combatants, each with level 1–60 goals and a 10-node skill tree (Potentials) with per-rank targets.
- **Priority-based inventory allocation.** Drag plans into the order you care about. Owned materials go to the top plan first, and each card shows which goals are already covered.
- **Crafting "what-ifs".** Growth Stones and Class Manuals convert 3:1 into the next tier. The planner shows how many missing items you could craft from spare lower-tier stock, without touching your real counts.
- **Handles incomplete game data.** Rank costs the community hasn't confirmed yet are typed as unknown, and totals that depend on them are flagged as partial instead of showing a wrong number.
- **Saves automatically.** Plans and inventory persist in the browser (versioned keys), with a warning if storage is blocked.

## Tech stack

React 19 · TypeScript · Vite · Vitest · ESLint · GitHub Actions

## How it works

```
src/
  data/        Static game data: roster, XP curve, promotions, materials, skill trees
  lib/         Pure calculation logic (no React) - unit tested
    calculator.ts           Level/promotion costs and total requirements
    inventoryAllocation.ts  Splits inventory across plans in priority order
    materialConversions.ts  3:1 tier conversion math
    potentialCosts.ts       Skill-tree rank costs, including partial data
    storage.ts              localStorage persistence with safe fallbacks
  components/  UI only: reads results from lib/, renders them
```

All game math lives in `lib/` as pure functions. Components never compute costs themselves, so the logic can be tested without a browser.

## Running locally

```bash
npm install
npm run dev     # start the dev server
npm test        # run the unit tests
npm run build   # type-check and build for production
```

## Testing

`npm test` runs 31 Vitest tests covering level costs, inventory allocation order, tier conversions, skill-tree rank costs and storage failure handling. CI runs lint, tests and a production build on every push.

### Known issue

For some skill-tree nodes, planning 0 → max rank in one step gives a different total than planning 0 → 1 and then 1 → max. These nodes have one more per-rank cost entry than their rank cap allows. The test `costs the same whether a node is planned in one step or two` is marked `it.fails` to track this until the data is checked against the game.

## Data sources

Roster and cost data are compiled from community references such as [Prydwen](https://www.prydwen.gg/chaos-zero-nightmare/characters) and [gacha.gg](https://www.gacha.gg/chaos-zero-nightmare). This is a fan project and is not affiliated with the game's developer or publisher.
