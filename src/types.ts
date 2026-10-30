export type Character = {
  id: string;
  name: string;
  rarity?: 4 | 5;
  combatClass?: string;
  attribute?: GrowthAttribute;
  portraitUrl?: string;
  potentialProfileId?: string;
};

export type GrowthAttribute = "Passion" | "Instinct" | "Order" | "Justice" | "Void";

export type CharacterPlan = {
  characterId: string;
  active: boolean;
  currentLevel: number;
  targetLevel: number;
  potentialProgress?: Record<string, PotentialProgress>;
  /** Legacy full-node selections, retained for plans saved before rank planning. */
  potentialTargets?: string[];
};

export type PotentialProgress = {
  currentLevel: number;
  targetLevel: number;
};

export type PotentialResourceCost = {
  id: string;
  name: string;
  amount: number;
};

export type PotentialNode = {
  id: string;
  name: string;
  costs: PotentialResourceCost[];
  mapPosition?: { x: number; y: number };
  rankCap?: number;
  /** null/omitted means unknown; [] means the rank has no cost. */
  knownRankCosts?: (PotentialResourceCost[] | null)[];
  rankCostsComplete?: boolean[];
  pathType?: "branch" | "main";
};

export type PotentialProfile = {
  characterId: string;
  attribute: GrowthAttribute;
  sourceUrl: string;
  nodes: PotentialNode[];
  connections?: [string, string][];
};

export type InventoryItem = {
  materialId: string;
  name: string;
  owned: number;
};

export type MaterialRequirement = {
  id: string;
  name: string;
  required: number;
  owned: number;
  remaining: number;
  inventoryTracked: boolean;
};

export type Page = "planner" | "inventory";
