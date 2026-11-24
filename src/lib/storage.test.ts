import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readInventory, readPlans, writePlans } from "./storage";

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  };
}

describe("storage", () => {
  beforeEach(() => {
    const storage = memoryStorage();
    vi.stubGlobal("localStorage", storage);
    vi.stubGlobal("window", { localStorage: storage });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("round-trips saved plans", () => {
    const plans = [{ characterId: "amir", active: true, currentLevel: 1, targetLevel: 60 }];
    expect(writePlans(plans)).toBe(true);
    expect(readPlans()).toEqual(plans);
  });

  it("returns an empty list for missing, corrupt or non-array data", () => {
    expect(readInventory()).toEqual([]);
    localStorage.setItem("czn-planner:plans:v1", "{not json");
    expect(readPlans()).toEqual([]);
    localStorage.setItem("czn-planner:plans:v1", '{"a":1}');
    expect(readPlans()).toEqual([]);
  });

  it("reports failure instead of crashing when storage is full or blocked", () => {
    const blocked = {
      getItem: () => null,
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    };
    vi.stubGlobal("window", { localStorage: blocked });
    expect(writePlans([])).toBe(false);
  });
});
