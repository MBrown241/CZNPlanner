import type { Character } from "../types";

type CharacterRecord = Omit<Character, "portraitUrl">;

// Playable Combatants only. Roster metadata checked against the current roster references:
// https://www.bluestacks.com/blog/game-guides/chaos-zero-nightmare/cznm-characters-guide-en.html
// https://www.prydwen.gg/chaos-zero-nightmare/characters
// Portraits use Prydwen's public character artwork, with initials as fallback.
const roster: CharacterRecord[] = [
  { id: "adelheid", name: "Adelheid", rarity: 5, combatClass: "Vanguard", attribute: "Void" },
  { id: "amir", name: "Amir", rarity: 4, combatClass: "Vanguard", attribute: "Order" },
  { id: "anika", name: "Anika", rarity: 4, combatClass: "Striker", attribute: "Order" },
  { id: "arabella", name: "Arabella", rarity: 5, combatClass: "Striker", attribute: "Instinct" },
  { id: "beryl", name: "Beryl", rarity: 4, combatClass: "Ranger", attribute: "Justice" },
  { id: "cassius", name: "Cassius", rarity: 4, combatClass: "Controller", attribute: "Instinct" },
  { id: "chizuru", name: "Chizuru", rarity: 5, combatClass: "Psionic", attribute: "Void" },
  { id: "diana", name: "Diana", rarity: 5, combatClass: "Hunter", attribute: "Passion" },
  { id: "fei", name: "Fei", rarity: 5, combatClass: "Ranger", attribute: "Void" },
  { id: "haru", name: "Haru", rarity: 5, combatClass: "Striker", attribute: "Justice" },
  { id: "heidemarie", name: "Heidemarie", rarity: 5, combatClass: "Ranger", attribute: "Passion" },
  { id: "hilde", name: "Hilde", rarity: 5, combatClass: "Ranger", attribute: "Instinct" },
  { id: "hugo", name: "Hugo", rarity: 5, combatClass: "Ranger", attribute: "Order" },
  { id: "kayron", name: "Kayron", rarity: 5, combatClass: "Psionic", attribute: "Void" },
  { id: "khalipe", name: "Khalipe", rarity: 5, combatClass: "Vanguard", attribute: "Instinct" },
  { id: "lucas", name: "Lucas", rarity: 4, combatClass: "Hunter", attribute: "Passion" },
  { id: "luke", name: "Luke", rarity: 5, combatClass: "Hunter", attribute: "Order" },
  { id: "magna", name: "Magna", rarity: 5, combatClass: "Vanguard", attribute: "Justice" },
  { id: "maribell", name: "Maribell", rarity: 4, combatClass: "Vanguard", attribute: "Passion" },
  { id: "mei-lin", name: "Mei Lin", rarity: 5, combatClass: "Striker", attribute: "Passion" },
  { id: "mika", name: "Mika", rarity: 4, combatClass: "Controller", attribute: "Justice", potentialProfileId: "mika" },
  { id: "narja", name: "Narja", rarity: 5, combatClass: "Controller", attribute: "Instinct" },
  { id: "nia", name: "Nia", rarity: 4, combatClass: "Controller", attribute: "Instinct" },
  { id: "nine", name: "Nine", rarity: 5, combatClass: "Vanguard", attribute: "Order" },
  { id: "olga", name: "Olga", rarity: 5, combatClass: "Psionic", attribute: "Instinct" },
  { id: "orlea", name: "Orlea", rarity: 5, combatClass: "Controller", attribute: "Instinct" },
  { id: "owen", name: "Owen", rarity: 4, combatClass: "Striker", attribute: "Passion" },
  { id: "rei", name: "Rei", rarity: 4, combatClass: "Controller", attribute: "Void" },
  { id: "renoa", name: "Renoa", rarity: 5, combatClass: "Hunter", attribute: "Void", potentialProfileId: "renoa" },
  { id: "rin", name: "Rin", rarity: 5, combatClass: "Striker", attribute: "Void" },
  { id: "rita", name: "Rita", rarity: 5, combatClass: "Psionic", attribute: "Justice" },
  { id: "rossweisse", name: "Rossweisse", rarity: 5, combatClass: "Striker", attribute: "Justice" },
  { id: "selena", name: "Selena", rarity: 4, combatClass: "Ranger", attribute: "Passion" },
  { id: "sereniel", name: "Sereniel", rarity: 5, combatClass: "Hunter", attribute: "Instinct" },
  { id: "tenebria", name: "Tenebria", rarity: 5, combatClass: "Psionic", attribute: "Passion" },
  { id: "tiphera", name: "Tiphera", rarity: 5, combatClass: "Controller", attribute: "Order" },
  { id: "tressa", name: "Tressa", rarity: 4, combatClass: "Psionic", attribute: "Void" },
  { id: "veronica", name: "Veronica", rarity: 5, combatClass: "Ranger", attribute: "Passion" },
  { id: "yuki", name: "Yuki", rarity: 5, combatClass: "Striker", attribute: "Order" },
];

function portraitUrl(characterId: string) {
  if (characterId === "anika") return "/images/characters/anika.webp";
  return `https://cdn.prydwen.gg/images/chaos/characters/${characterId}_full.webp`;
}

export const characters: Character[] = roster.map((character) => ({
  ...character,
  portraitUrl: portraitUrl(character.id),
}));

