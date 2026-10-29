import {
  CREDITS_PER_XP,
  promotions,
  XP_PER_MANUAL,
  xpPerLevel,
} from "../data/progression";
import type { ManualTier } from "../data/progression";
import type { CharacterPlan, InventoryItem, MaterialRequirement } from "../types";

export type PlanCost = {
  xp: number;
  levelCredits: number;
  promotionCredits: number;
  manuals: Record<ManualTier, number>;
  xpManuals: Record<"gray" | "blue" | "gold", number>;
};

export function calculatePlanCost(currentLevel: number, targetLevel: number): PlanCost {
  const start = Math.max(1, Math.min(60, Math.floor(currentLevel)));
  const end = Math.max(start, Math.min(60, Math.floor(targetLevel)));
  let xp = 0;

  for (let level = start; level < end; level += 1) {
    xp += xpPerLevel[level - 1] ?? 0;
  }

  const includedPromotions = promotions.filter(
    ({ atLevel }) => start <= atLevel && end > atLevel,
  );
  const manuals: Record<ManualTier, number> = { I: 0, II: 0, III: 0 };
  for (const promotion of includedPromotions) {
    manuals[promotion.manualTier] += promotion.manuals;
  }

  let remainingXp = xp;
  const xpManuals = { gold: 0, blue: 0, gray: 0 };
  xpManuals.gold = Math.floor(remainingXp / XP_PER_MANUAL.gold);
  remainingXp %= XP_PER_MANUAL.gold;
  xpManuals.blue = Math.floor(remainingXp / XP_PER_MANUAL.blue);
  remainingXp %= XP_PER_MANUAL.blue;
  xpManuals.gray = Math.floor(remainingXp / XP_PER_MANUAL.gray);

  return {
    xp,
    levelCredits: Math.round(xp * CREDITS_PER_XP),
    promotionCredits: includedPromotions.reduce((total, item) => total + item.credits, 0),
    manuals,
    xpManuals,
  };
}

const XP_RESOURCE_INFO = [
  { id: "xp-gray", name: "Gray XP manual (100 XP)", key: "gray" as const },
  { id: "xp-blue", name: "Blue XP manual (500 XP)", key: "blue" as const },
  { id: "xp-gold", name: "Gold XP manual (2,000 XP)", key: "gold" as const },
];

const CLASS_RESOURCE_INFO = [
  { id: "class-manual-i", name: "Class Manual I", tier: "I" as const },
  { id: "class-manual-ii", name: "Class Manual II", tier: "II" as const },
  { id: "class-manual-iii", name: "Class Manual III", tier: "III" as const },
];

export function calculateRequirements(
  plans: CharacterPlan[],
  inventory: InventoryItem[],
): MaterialRequirement[] {
  const totals: Record<string, number> = {};
  const activePlans = plans.filter((plan) => plan.active);

  for (const plan of activePlans) {
    const cost = calculatePlanCost(plan.currentLevel, plan.targetLevel);
    for (const resource of XP_RESOURCE_INFO) {
      totals[resource.id] = (totals[resource.id] ?? 0) + cost.xpManuals[resource.key];
    }
    totals.credits = (totals.credits ?? 0) + cost.levelCredits + cost.promotionCredits;
    for (const resource of CLASS_RESOURCE_INFO) {
      totals[resource.id] = (totals[resource.id] ?? 0) + cost.manuals[resource.tier];
    }
  }

  const inventoryTotals = inventory.reduce<Record<string, number>>((result, item) => {
    result[item.materialId] = (result[item.materialId] ?? 0) + item.owned;
    return result;
  }, {});

  const resourceInfo = [
    ...XP_RESOURCE_INFO.map(({ id, name }) => ({ id, name, inventoryTracked: true })),
    ...CLASS_RESOURCE_INFO.map(({ id, name }) => ({ id, name, inventoryTracked: false })),
    { id: "credits", name: "Credits", inventoryTracked: true },
  ];

  return resourceInfo
    .filter(({ id }) => (totals[id] ?? 0) > 0)
    .map(({ id, name, inventoryTracked }) => {
      const required = totals[id] ?? 0;
      const owned = inventoryTracked ? inventoryTotals[id] ?? 0 : 0;
      return {
        id,
        name,
        required,
        owned,
        remaining: Math.max(0, required - owned),
        inventoryTracked,
      };
    });
}
