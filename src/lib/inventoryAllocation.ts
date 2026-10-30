import { getClassManualId, materialCatalogById } from "../data/materials";
import { potentialProfiles } from "../data/potentials";
import { calculatePlanCost } from "./calculator";
import { calculatePotentialCost, getPotentialProgress } from "./potentialCosts";
import type { Character, CharacterPlan, InventoryItem } from "../types";

/** Allocates shared inventory to active plans in their displayed order. */
export function allocateInventoryByPlan(
  plans: CharacterPlan[],
  inventory: InventoryItem[],
  characters: Character[],
) {
  const remainingByMaterial = new Map<string, number>();
  for (const item of inventory) {
    remainingByMaterial.set(
      item.materialId,
      (remainingByMaterial.get(item.materialId) ?? 0) + item.owned,
    );
  }

  const completionByCharacter = new Map<string, Set<string>>();

  for (const plan of plans) {
    if (!plan.active) {
      completionByCharacter.set(plan.characterId, new Set());
      continue;
    }
    const character = characters.find((item) => item.id === plan.characterId);
    const requiredByMaterial = new Map<string, number>();
    const addRequirement = (materialId: string, amount: number) => {
      if (amount <= 0) return;
      requiredByMaterial.set(
        materialId,
        (requiredByMaterial.get(materialId) ?? 0) + amount,
      );
    };

    const levelCost = calculatePlanCost(plan.currentLevel, plan.targetLevel);
    addRequirement("xp-gold", levelCost.xpManuals.gold);
    addRequirement("xp-blue", levelCost.xpManuals.blue);
    addRequirement("xp-gray", levelCost.xpManuals.gray);
    addRequirement("credits", levelCost.levelCredits + levelCost.promotionCredits);
    for (const [tier, amount] of Object.entries(levelCost.manuals) as ["I" | "II" | "III", number][]) {
      addRequirement(getClassManualId(tier, character?.combatClass), amount);
    }

    const profileId = character?.potentialProfileId ?? plan.characterId;
    const profile = potentialProfiles[profileId];
    for (const node of profile?.nodes ?? []) {
      const progress = getPotentialProgress(plan, node);
      if (progress.targetLevel <= progress.currentLevel) continue;
      const { costs } = calculatePotentialCost(node, progress.currentLevel, progress.targetLevel);
      for (const cost of costs) addRequirement(cost.id, cost.amount);
    }

    const completed = new Set<string>();
    for (const [materialId, required] of requiredByMaterial) {
      if (!materialCatalogById.has(materialId)) continue;
      const remaining = remainingByMaterial.get(materialId) ?? 0;
      if (remaining >= required) completed.add(materialId);
      remainingByMaterial.set(materialId, Math.max(0, remaining - required));
    }
    completionByCharacter.set(plan.characterId, completed);
  }

  return completionByCharacter;
}
