export type ManualTier = "I" | "II" | "III";

// XP required to move from the level number at each array index to the next.
// Example: index 0 is level 1 -> 2; index 58 is level 59 -> 60.
export const xpPerLevel = [
  100, 100, 200, 200, 300, 400, 400, 500, 600,
  600, 700, 800, 800, 900, 1000, 1100, 1200, 1300, 1400,
  1500, 2100, 2800, 3400, 4000, 4700, 5300, 5900, 6500, 7200,
  7900, 8100, 8300, 8500, 8700, 8900, 9100, 9300, 9500, 9700,
  10800, 12300, 13800, 15300, 16800, 18400, 19900, 21400, 22900, 24400,
  25900, 29000, 32200, 35300, 38400, 41600, 44700, 47800, 51000, 54100,
] as const;

export type PromotionCost = {
  atLevel: number;
  manualTier: ManualTier;
  manuals: number;
  credits: number;
};

export const promotions: PromotionCost[] = [
  { atLevel: 10, manualTier: "I", manuals: 8, credits: 30_000 },
  { atLevel: 20, manualTier: "II", manuals: 15, credits: 70_000 },
  { atLevel: 30, manualTier: "II", manuals: 32, credits: 150_000 },
  { atLevel: 40, manualTier: "III", manuals: 16, credits: 250_000 },
  { atLevel: 50, manualTier: "III", manuals: 36, credits: 500_000 },
];

// Current working assumption: 4-star and 5-star characters use this same curve.
export const rarityCostAssumption = "4-star and 5-star costs are assumed equal";

export const XP_PER_MANUAL = {
  gray: 100,
  blue: 500,
  gold: 2000,
} as const;

export const CREDITS_PER_XP = 0.3;
