import type { CharacterPlan, PotentialNode, PotentialProgress, PotentialResourceCost } from "../types";

export function getPotentialProgress(
  plan: CharacterPlan,
  node: PotentialNode,
): PotentialProgress {
  const saved = plan.potentialProgress?.[node.id];
  const cap = node.rankCap ?? 1;
  if (saved) {
    const currentLevel = Math.max(0, Math.min(cap, Math.floor(saved.currentLevel)));
    const targetLevel = Math.max(currentLevel, Math.min(cap, Math.floor(saved.targetLevel)));
    return { currentLevel, targetLevel };
  }

  const wasSelected = plan.potentialTargets?.includes(node.id) ?? false;
  return { currentLevel: 0, targetLevel: wasSelected ? cap : 0 };
}

export function calculatePotentialCost(
  node: PotentialNode,
  currentLevel: number,
  targetLevel: number,
): { costs: PotentialResourceCost[]; complete: boolean } {
  const cap = node.rankCap;
  if (!cap) {
    return targetLevel > currentLevel
      ? { costs: node.costs, complete: true }
      : { costs: [], complete: true };
  }

  const current = Math.max(0, Math.min(cap, Math.floor(currentLevel)));
  const target = Math.max(current, Math.min(cap, Math.floor(targetLevel)));
  if (target <= current) return { costs: [], complete: true };

  // Full-node totals can fill in a complete plan when the 0 -> 1 cost is recorded.
  // Otherwise keep the rank-by-rank result partial until that missing entry is supplied.
  if (current === 0 && target === cap && node.levelZeroCosts != null) {
    return { costs: node.costs, complete: true };
  }

  const totals = new Map<string, PotentialResourceCost>();
  let complete = true;
  for (let level = current + 1; level <= target; level += 1) {
    // Level 0 is its own entry (0 -> 1); later entries are recorded from rank 1 upward.
    const rankCosts = level === 1
      ? node.levelZeroCosts
      : node.knownRankCosts?.[level - 2];
    if (rankCosts == null) {
      complete = false;
      continue;
    }
    if (level > 1 && !node.rankCostsComplete?.[level - 2]) complete = false;
    for (const cost of rankCosts) {
      const existing = totals.get(cost.id);
      totals.set(cost.id, {
        ...cost,
        amount: (existing?.amount ?? 0) + cost.amount,
      });
    }
  }

  return { costs: [...totals.values()], complete };
}
