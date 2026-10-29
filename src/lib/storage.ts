import type { CharacterPlan, InventoryItem } from "../types";

const STORAGE_KEYS = {
  plans: "czn-planner:plans:v1",
  inventory: "czn-planner:inventory:v1",
};

function readStoredArray<T>(key: string): T[] {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export function readPlans(): CharacterPlan[] {
  return readStoredArray<CharacterPlan>(STORAGE_KEYS.plans);
}

export function readInventory(): InventoryItem[] {
  return readStoredArray<InventoryItem>(STORAGE_KEYS.inventory);
}

export function canAccessStorage(): boolean {
  try {
    window.localStorage.getItem(STORAGE_KEYS.plans);
    return true;
  } catch {
    return false;
  }
}

export function writePlans(plans: CharacterPlan[]): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEYS.plans, JSON.stringify(plans));
    return true;
  } catch {
    return false;
  }
}

export function writeInventory(inventory: InventoryItem[]): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEYS.inventory, JSON.stringify(inventory));
    return true;
  } catch {
    return false;
  }
}
