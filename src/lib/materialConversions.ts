import type { InventoryItem } from "../types";

export type ConvertibleMaterial = {
  familyId: string;
  baseUnits: number;
  rank: number;
};

const tierRanks: Record<string, number> = {
  common: 0,
  great: 1,
  premium: 2,
  i: 0,
  ii: 1,
  iii: 2,
};

/** Returns the conversion family and lowest-tier value for growth stones/manuals. */
export function getConvertibleMaterial(materialId: string): ConvertibleMaterial | undefined {
  const growthStone = materialId.match(/^growth-(common|great|premium)-(.+)$/);
  if (growthStone) {
    const [, tier, attribute] = growthStone;
    const rank = tierRanks[tier];
    return { familyId: `growth-${attribute}`, baseUnits: 3 ** rank, rank };
  }

  const classManual = materialId.match(/^class-manual-(i|ii|iii)-([a-z-]+)$/);
  if (classManual) {
    const [, tier, combatClass] = classManual;
    const rank = tierRanks[tier];
    return { familyId: `manual-${combatClass}`, baseUnits: 3 ** rank, rank };
  }

  return undefined;
}

export function getInventoryBaseUnits(inventory: InventoryItem[]) {
  const totals = new Map<string, number>();
  for (const item of inventory) {
    const conversion = getConvertibleMaterial(item.materialId);
    if (!conversion) continue;
    totals.set(
      conversion.familyId,
      (totals.get(conversion.familyId) ?? 0) + item.owned * conversion.baseUnits,
    );
  }
  return totals;
}

/** Calculates possible 3:1 coverage for display without changing owned counts. */
export function getConvertibleCoverage(
  requirements: { id: string; required: number; owned: number }[],
  inventory: InventoryItem[],
) {
  const availableByFamily = getInventoryBaseUnits(inventory);
  const grouped = new Map<string, typeof requirements>();

  for (const requirement of requirements) {
    const conversion = getConvertibleMaterial(requirement.id);
    if (!conversion) continue;

    const exactOwnedUsed = Math.min(requirement.required, requirement.owned);
    availableByFamily.set(
      conversion.familyId,
      Math.max(0, (availableByFamily.get(conversion.familyId) ?? 0) - exactOwnedUsed * conversion.baseUnits),
    );
    const family = grouped.get(conversion.familyId) ?? [];
    family.push(requirement);
    grouped.set(conversion.familyId, family);
  }

  const coverageByMaterial = new Map<string, number>();
  for (const [familyId, familyRequirements] of grouped) {
    let available = availableByFamily.get(familyId) ?? 0;
    const highestTierFirst = [...familyRequirements].sort(
      (a, b) => (getConvertibleMaterial(b.id)?.rank ?? 0) - (getConvertibleMaterial(a.id)?.rank ?? 0),
    );
    for (const requirement of highestTierFirst) {
      const conversion = getConvertibleMaterial(requirement.id);
      if (!conversion) continue;
      const remaining = Math.max(0, requirement.required - requirement.owned);
      const convertible = Math.min(remaining, Math.floor(available / conversion.baseUnits));
      available -= convertible * conversion.baseUnits;
      coverageByMaterial.set(requirement.id, convertible);
    }
  }

  return coverageByMaterial;
}
