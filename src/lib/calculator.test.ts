import { describe, expect, it } from "vitest";
import { promotions, xpPerLevel } from "../data/progression";
import { calculatePlanCost, calculateRequirements } from "./calculator";
import type { Character, CharacterPlan } from "../types";

describe("calculatePlanCost", () => {
  it("costs one gray Battle Memory and 30 Units for level 1 -> 2", () => {
    const cost = calculatePlanCost(1, 2);
    expect(cost.xp).toBe(100);
    expect(cost.xpManuals).toEqual({ gold: 0, blue: 0, gray: 1 });
    expect(cost.levelCredits).toBe(30);
    expect(cost.promotionCredits).toBe(0);
  });

  it("includes the level-10 promotion only when the plan goes past level 10", () => {
    const toTen = calculatePlanCost(1, 10);
    expect(toTen.manuals).toEqual({ I: 0, II: 0, III: 0 });
    expect(toTen.promotionCredits).toBe(0);

    const toEleven = calculatePlanCost(1, 11);
    expect(toEleven.xp).toBe(3_400);
    expect(toEleven.manuals).toEqual({ I: 8, II: 0, III: 0 });
    expect(toEleven.promotionCredits).toBe(30_000);
  });

  it("breaks XP into the fewest Battle Memories, largest first", () => {
    // 3,400 XP = 1 gold (2,000) + 2 blue (1,000) + 4 gray (400)
    expect(calculatePlanCost(1, 11).xpManuals).toEqual({ gold: 1, blue: 2, gray: 4 });
  });

  it("totals every level and promotion for a full 1 -> 60 plan", () => {
    const cost = calculatePlanCost(1, 60);
    const totalXp = xpPerLevel.reduce((sum, xp) => sum + xp, 0);
    expect(cost.xp).toBe(totalXp);
    expect(cost.promotionCredits).toBe(
      promotions.reduce((sum, promotion) => sum + promotion.credits, 0),
    );
    expect(cost.manuals).toEqual({ I: 8, II: 47, III: 52 });
  });

  it("clamps levels to 1-60 and never returns negative costs", () => {
    expect(calculatePlanCost(0, 99)).toEqual(calculatePlanCost(1, 60));
    expect(calculatePlanCost(40, 20).xp).toBe(0);
    expect(calculatePlanCost(12.9, 13.9)).toEqual(calculatePlanCost(12, 13));
  });

  it("is additive: 1 -> 30 plus 30 -> 60 equals 1 -> 60", () => {
    const whole = calculatePlanCost(1, 60);
    const first = calculatePlanCost(1, 30);
    const second = calculatePlanCost(30, 60);
    expect(first.xp + second.xp).toBe(whole.xp);
    expect(first.promotionCredits + second.promotionCredits).toBe(whole.promotionCredits);
  });
});

describe("calculateRequirements", () => {
  const characters: Character[] = [
    { id: "adelheid", name: "Adelheid", combatClass: "Vanguard", attribute: "Void" },
  ];
  const levelPlan = (overrides: Partial<CharacterPlan> = {}): CharacterPlan => ({
    characterId: "adelheid",
    active: true,
    currentLevel: 1,
    targetLevel: 2,
    ...overrides,
  });

  it("lists only the materials the active plans need", () => {
    const requirements = calculateRequirements([levelPlan()], [], characters);
    expect(requirements.map((item) => item.id).sort()).toEqual(["credits", "xp-gray"]);
  });

  it("subtracts owned inventory and never reports negative remaining", () => {
    const requirements = calculateRequirements(
      [levelPlan()],
      [{ materialId: "credits", name: "Units", owned: 1_000 }],
      characters,
    );
    const credits = requirements.find((item) => item.id === "credits");
    expect(credits).toMatchObject({ required: 30, owned: 1_000, remaining: 0 });
  });

  it("ignores paused (inactive) plans", () => {
    expect(calculateRequirements([levelPlan({ active: false })], [], characters)).toEqual([]);
  });

  it("uses the character's combat class for promotion manuals", () => {
    const requirements = calculateRequirements(
      [levelPlan({ currentLevel: 9, targetLevel: 11 })],
      [],
      characters,
    );
    expect(requirements.find((item) => item.id === "class-manual-i-vanguard")?.required).toBe(8);
  });
});
