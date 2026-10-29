import type { Character } from "../types";

// Placeholder records plus two sourced characters used to develop the Potential planner.
export const characters: Character[] = [
  { id: "demo-character-1", name: "Sample Character A" },
  { id: "demo-character-2", name: "Sample Character B" },
  { id: "demo-character-3", name: "Sample Character C" },
  {
    id: "mika",
    name: "Mika",
    rarity: 4,
    combatClass: "Controller",
    attribute: "Justice",
    potentialProfileId: "mika",
  },
  {
    id: "renoa",
    name: "Renoa",
    rarity: 5,
    combatClass: "Hunter",
    attribute: "Void",
    potentialProfileId: "renoa",
  },
];
