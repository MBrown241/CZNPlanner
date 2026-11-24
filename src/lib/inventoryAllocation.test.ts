import { describe, expect, it } from "vitest";
import { allocateInventoryByPlan } from "./inventoryAllocation";
import type { Character, CharacterPlan } from "../types";

const characters: Character[] = [
  { id: "adelheid", name: "Adelheid", combatClass: "Vanguard", attribute: "Void" },
  { id: "amir", name: "Amir", combatClass: "Vanguard", attribute: "Order" },
];

const plan = (characterId: string, overrides: Partial<CharacterPlan> = {}): CharacterPlan => ({
  characterId,
  active: true,
  currentLevel: 1,
  targetLevel: 2, // costs 1 gray Battle Memory + 30 Units
  ...overrides,
});

describe("allocateInventoryByPlan", () => {
  it("gives inventory to plans in priority order", () => {
    const { completedByCharacter } = allocateInventoryByPlan(
      [plan("adelheid"), plan("amir")],
      [{ materialId: "credits", name: "Units", owned: 40 }],
      characters,
    );
    expect(completedByCharacter.get("adelheid")?.has("credits")).toBe(true);
    expect(completedByCharacter.get("amir")?.has("credits")).toBe(false); // only 10 left
  });

  it("changes the winner when the user reorders plans", () => {
    const { completedByCharacter } = allocateInventoryByPlan(
      [plan("amir"), plan("adelheid")],
      [{ materialId: "credits", name: "Units", owned: 40 }],
      characters,
    );
    expect(completedByCharacter.get("amir")?.has("credits")).toBe(true);
    expect(completedByCharacter.get("adelheid")?.has("credits")).toBe(false);
  });

  it("skips paused plans so they do not consume inventory", () => {
    const { completedByCharacter } = allocateInventoryByPlan(
      [plan("adelheid", { active: false }), plan("amir")],
      [{ materialId: "credits", name: "Units", owned: 30 }],
      characters,
    );
    expect(completedByCharacter.get("adelheid")?.size).toBe(0);
    expect(completedByCharacter.get("amir")?.has("credits")).toBe(true);
  });

  it("reports possible tier conversions without marking the goal complete", () => {
    const { completedByCharacter, convertibleByCharacter } = allocateInventoryByPlan(
      [plan("adelheid", { currentLevel: 19, targetLevel: 21 })], // needs 15 Advanced Vanguard Manuals
      [{ materialId: "class-manual-i-vanguard", name: "", owned: 45 }], // 45 Common = 15 Advanced at 3:1
      characters,
    );
    expect(completedByCharacter.get("adelheid")?.has("class-manual-ii-vanguard")).toBe(false);
    expect(convertibleByCharacter.get("adelheid")?.get("class-manual-ii-vanguard")).toBe(15);
  });
});
