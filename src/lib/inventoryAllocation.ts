import { getClassManualId, materialCatalogById } from "../data/materials";
import { potentialProfiles } from "../data/potentials";
import { calculatePlanCost } from "./calculator";
import { getConvertibleMaterial, getInventoryBaseUnits } from "./materialConversions";
import { calculatePotentialCost, getPotentialProgress } from "./potentialCosts";
import type { Character, CharacterPlan, InventoryItem } from "../types";

export type PlanInventoryAllocation = {
  completedByCharacter: Map<string, Set<string>>;
  /** Hypothetical tier conversions, kept separate from owned counts and completion. */
  convertibleByCharacter: Map<string, Map<string, number>>;
};

/** Allocates exact inventory to active plans in displayed order; conversion hints are informational. */
export function allocateInventoryByPlan(
  plans: CharacterPlan[],
  inventory: InventoryItem[],
  characters: Character[],
): PlanInventoryAllocation {
  const remainingByMaterial = new Map<string, number>();
  for (const item of inventory) {
    remainingByMaterial.set(
      item.materialId,
      (remainingByMaterial.get(item.materialId) ?? 0) + item.owned,
    );
  }
  // This is only a separate display budget for hypothetical conversions. It never changes inventory.
  const remainingConvertibleUnits = getInventoryBaseUnits(inventory);
  const completedByCharacter = new Map<string, Set<string>>();
  const convertibleByCharacter = new Map<string, Map<string, number>>();

  for (const plan of plans) {
    if (!plan.active) {
      completedByCharacter.set(plan.characterId, new Set());
      convertibleByCharacter.set(plan.characterId, new Map());
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
    const conversionDemands: { materialId: string; remaining: number; baseUnits: number; rank: number; familyId: string }[] = [];
    for (const [materialId, required] of requiredByMaterial) {
      if (!materialCatalogById.has(materialId)) continue;
      const remaining = remainingByMaterial.get(materialId) ?? 0;
      if (remaining >= required) completed.add(materialId);
      const used = Math.min(remaining, required);
      remainingByMaterial.set(materialId, remaining - used);

      const conversion = getConvertibleMaterial(materialId);
      if (conversion) {
        remainingConvertibleUnits.set(
          conversion.familyId,
          Math.max(0, (remainingConvertibleUnits.get(conversion.familyId) ?? 0) - used * conversion.baseUnits),
        );
        if (used < required) {
          conversionDemands.push({
            materialId,
            remaining: required - used,
            ...conversion,
          });
        }
      }
    }

    const convertible = new Map<string, number>();
    conversionDemands.sort((a, b) => b.rank - a.rank);
    for (const demand of conversionDemands) {
      const available = remainingConvertibleUnits.get(demand.familyId) ?? 0;
      const canConvert = Math.min(demand.remaining, Math.floor(available / demand.baseUnits));
      if (canConvert > 0) {
        convertible.set(demand.materialId, canConvert);
        remainingConvertibleUnits.set(demand.familyId, available - canConvert * demand.baseUnits);
      }
    }

    completedByCharacter.set(plan.characterId, completed);
    convertibleByCharacter.set(plan.characterId, convertible);
  }

  return { completedByCharacter, convertibleByCharacter };
}
