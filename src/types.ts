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
  /** Cost to upgrade from rank 0 to rank 1; null means not recorded yet. */
  levelZeroCosts?: PotentialResourceCost[] | null;
  /** Costs from rank 1 onward, in order; null/omitted means unknown, [] means free. */
  knownRankCosts?: (PotentialResourceCost[] | null)[];
  /** Completeness flags matching knownRankCosts. */
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
  /** Number of remaining units that could be made by tier conversion; informational only. */
  convertible?: number;
  inventoryTracked: boolean;
};

export type Page = "planner" | "inventory";
