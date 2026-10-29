export type Character = {
  id: string;
  name: string;
};

export type CharacterPlan = {
  characterId: string;
  active: boolean;
  currentLevel: number;
  targetLevel: number;
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
