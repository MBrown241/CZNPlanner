import { describe, expect, it } from "vitest";
import { potentialProfiles } from "../data/potentials";
import { calculatePotentialCost, getPotentialProgress } from "./potentialCosts";
import type { CharacterPlan, PotentialNode, PotentialResourceCost } from "../types";

const units = (amount: number): PotentialResourceCost => ({ id: "credits", name: "Units", amount });

const rankedNode: PotentialNode = {
  id: "test-node",
  name: "Test Node",
  rankCap: 3,
  levelZeroCosts: [units(100)],
  knownRankCosts: [[units(200)], [units(300)]], // 1 -> 2, 2 -> 3
  rankCostsComplete: [true, true],
  costs: [units(600)],
};

const totalUnits = (costs: PotentialResourceCost[]) =>
  costs.filter((cost) => cost.id === "credits").reduce((sum, cost) => sum + cost.amount, 0);

describe("calculatePotentialCost", () => {
  it("charges a single-rank node's full cost once", () => {
    const node: PotentialNode = { id: "n", name: "N", costs: [units(500)] };
    expect(calculatePotentialCost(node, 0, 1).costs).toEqual([units(500)]);
    expect(calculatePotentialCost(node, 1, 1).costs).toEqual([]);
  });

  it("sums only the ranks between current and target", () => {
    expect(totalUnits(calculatePotentialCost(rankedNode, 1, 3).costs)).toBe(500);
    expect(totalUnits(calculatePotentialCost(rankedNode, 0, 2).costs)).toBe(300);
  });

  it("marks the result incomplete when a rank's cost is unknown", () => {
    const node = { ...rankedNode, knownRankCosts: [[units(200)], null] };
    const result = calculatePotentialCost(node, 1, 3);
    expect(result.complete).toBe(false);
    expect(totalUnits(result.costs)).toBe(200);
  });

  it("clamps targets above the rank cap", () => {
    expect(calculatePotentialCost(rankedNode, 1, 99)).toEqual(calculatePotentialCost(rankedNode, 1, 3));
  });
});

describe("getPotentialProgress", () => {
  const basePlan: CharacterPlan = { characterId: "x", active: true, currentLevel: 1, targetLevel: 60 };

  it("defaults to no planned ranks", () => {
    expect(getPotentialProgress(basePlan, rankedNode)).toEqual({ currentLevel: 0, targetLevel: 0 });
  });

  it("upgrades legacy full-node selections to a max-rank target", () => {
    const plan = { ...basePlan, potentialTargets: ["test-node"] };
    expect(getPotentialProgress(plan, rankedNode)).toEqual({ currentLevel: 0, targetLevel: 3 });
  });
});

describe("skill-tree data integrity", () => {
  // Planning 0 -> max in one step should cost the same as 0 -> 1 then 1 -> max.
  // Known issue: some nodes have one more knownRankCosts entry than their rank cap allows,
  // so the two paths disagree. Once the data is corrected against the game, change
  // `it.fails` to `it` below; the test will then guard against the bug coming back.
  const rankedNodes = potentialProfiles.adelheid.nodes.filter((node) => node.rankCap);

  it("has at most rankCap - 1 knownRankCosts entries per node (signature-cards)", () => {
    const node = rankedNodes.find((item) => item.id === "signature-cards")!;
    expect(node.knownRankCosts?.length ?? 0).toBeLessThanOrEqual(node.rankCap! - 1);
  });

  it.fails("costs the same whether a node is planned in one step or two", () => {
    for (const node of rankedNodes) {
      const oneStep = calculatePotentialCost(node, 0, node.rankCap!).costs;
      const twoSteps = [
        ...calculatePotentialCost(node, 0, 1).costs,
        ...calculatePotentialCost(node, 1, node.rankCap!).costs,
      ];
      expect(totalUnits(twoSteps), node.id).toBe(totalUnits(oneStep));
    }
  });
});
