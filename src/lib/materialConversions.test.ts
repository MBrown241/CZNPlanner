import { describe, expect, it } from "vitest";
import {
  getConvertibleCoverage,
  getConvertibleMaterial,
  getInventoryBaseUnits,
} from "./materialConversions";

describe("getConvertibleMaterial", () => {
  it("values each tier at 3x the tier below it", () => {
    expect(getConvertibleMaterial("growth-common-void")).toEqual({ familyId: "growth-void", baseUnits: 1, rank: 0 });
    expect(getConvertibleMaterial("growth-great-void")).toEqual({ familyId: "growth-void", baseUnits: 3, rank: 1 });
    expect(getConvertibleMaterial("growth-premium-void")).toEqual({ familyId: "growth-void", baseUnits: 9, rank: 2 });
    expect(getConvertibleMaterial("class-manual-iii-hunter")).toEqual({ familyId: "manual-hunter", baseUnits: 9, rank: 2 });
  });

  it("returns undefined for materials that cannot be converted", () => {
    expect(getConvertibleMaterial("credits")).toBeUndefined();
    expect(getConvertibleMaterial("xp-gold")).toBeUndefined();
  });
});

describe("getInventoryBaseUnits", () => {
  it("sums each family in lowest-tier units and keeps families separate", () => {
    const totals = getInventoryBaseUnits([
      { materialId: "growth-common-void", name: "", owned: 5 },
      { materialId: "growth-great-void", name: "", owned: 2 },
      { materialId: "growth-common-justice", name: "", owned: 4 },
    ]);
    expect(totals.get("growth-void")).toBe(11);
    expect(totals.get("growth-justice")).toBe(4);
  });
});

describe("getConvertibleCoverage", () => {
  it("shows how many missing higher-tier items could be crafted from lower tiers", () => {
    const coverage = getConvertibleCoverage(
      [{ id: "growth-great-void", required: 3, owned: 0 }],
      [{ materialId: "growth-common-void", name: "", owned: 10 }],
    );
    expect(coverage.get("growth-great-void")).toBe(3); // 10 commons -> 3 greats (1 left over)
  });

  it("fills the highest tier first, then spends what is left on lower tiers", () => {
    const coverage = getConvertibleCoverage(
      [
        { id: "growth-great-void", required: 2, owned: 0 },
        { id: "growth-premium-void", required: 1, owned: 0 },
      ],
      [{ materialId: "growth-common-void", name: "", owned: 12 }],
    );
    expect(coverage.get("growth-premium-void")).toBe(1); // uses 9
    expect(coverage.get("growth-great-void")).toBe(1); // 3 left -> 1 great
  });

  it("does not convert items already reserved for their own requirement", () => {
    const coverage = getConvertibleCoverage(
      [
        { id: "growth-common-void", required: 4, owned: 10 },
        { id: "growth-great-void", required: 3, owned: 0 },
      ],
      [{ materialId: "growth-common-void", name: "", owned: 10 }],
    );
    expect(coverage.get("growth-great-void")).toBe(2); // only 6 spare commons
  });
});
