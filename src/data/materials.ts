import type { GrowthAttribute } from "../types";
import type { ManualTier } from "./progression";

export type MaterialCatalogItem = {
  id: string;
  name: string;
  category: "Battle Memories" | "Class Manuals" | "Potential Materials";
  image?: string;
};

export const combatClasses = [
  "Striker",
  "Psionic",
  "Vanguard",
  "Ranger",
  "Hunter",
  "Controller",
] as const;

const manualTierNames: Record<ManualTier, string> = {
  I: "Common",
  II: "Advanced",
  III: "Premium",
};

const manualTierIds: Record<ManualTier, string> = {
  I: "i",
  II: "ii",
  III: "iii",
};

export const manualTierFallbackImages: Record<ManualTier, string> = {
  I: "class-manual-i-hunter.png",
  II: "class-manual-ii-hunter.png",
  III: "class-manual-iii-hunter.png",
};

const availableImageIds = new Set([
  "xp-gray",
  "xp-blue",
  "xp-gold",
  "credits",
  "class-manual-i-hunter",
  "class-manual-ii-hunter",
  "class-manual-iii-hunter",
  "class-manual-i-controller",
  "class-manual-ii-controller",
  "growth-common-justice",
  "growth-great-justice",
  "growth-premium-justice",
  "growth-common-void",
  "growth-great-void",
  "growth-premium-void",
  "eye-of-wailing-prodigal",
  "shards-of-condemnation",
  "undetermined-ego-crystal",
]);

export function materialImageSource(image?: string) {
  if (!image) return undefined;
  return image.startsWith("https://") ? image : `/images/materials/${image}`;
}

export function getClassManualId(tier: ManualTier, combatClass?: string) {
  const matchedClass = combatClasses.find(
    (name) => name.toLowerCase() === combatClass?.toLowerCase(),
  );
  return matchedClass
    ? `class-manual-${manualTierIds[tier]}-${matchedClass.toLowerCase()}`
    : `class-manual-${manualTierIds[tier]}`;
}

export const materialCatalog: MaterialCatalogItem[] = [
  {
    id: "xp-gray",
    name: "Basic Battle Memory",
    category: "Battle Memories",
    image: "xp-gray.png",
  },
  {
    id: "xp-blue",
    name: "Advanced Battle Memory",
    category: "Battle Memories",
    image: "xp-blue.png",
  },
  {
    id: "xp-gold",
    name: "Premium Battle Memory",
    category: "Battle Memories",
    image: "xp-gold.png",
  },
  { id: "credits", name: "Units", category: "Potential Materials", image: "credits.png" },
  ...combatClasses.flatMap((combatClass) =>
    (["I", "II", "III"] as const).map((tier) => {
      const id = getClassManualId(tier, combatClass);
      return {
        id,
        name: `${manualTierNames[tier]} ${combatClass} Manual`,
        category: "Class Manuals" as const,
        image: availableImageIds.has(id) ? `${id}.png` : manualTierFallbackImages[tier],
      };
    }),
  ),
  ...(["Passion", "Instinct", "Order", "Justice", "Void"] as GrowthAttribute[]).flatMap(
    (attribute) =>
      (["Common", "Great", "Premium"] as const).map((tier) => {
        const id = `growth-${tier.toLowerCase()}-${attribute.toLowerCase()}`;
        const attributeName = attribute === "Void" ? "the Void" : attribute;
        return {
          id,
          name: `${tier} Growth Stone of ${attributeName}`,
          category: "Potential Materials" as const,
          image: availableImageIds.has(id) ? `${id}.png` : `${id}.webp`,
        };
      }),
  ),
  {
    id: "eye-of-wailing-prodigal",
    name: "Eye of Wailing Prodigal",
    category: "Potential Materials",
    image: "eye-of-wailing-prodigal.png",
  },
  {
    id: "shards-of-condemnation",
    name: "Shards of Condemnation",
    category: "Potential Materials",
    image: "shards-of-condemnation.png",
  },
  {
    id: "undetermined-ego-crystal",
    name: "Undetermined Ego Crystal",
    category: "Potential Materials",
    image: "undetermined-ego-crystal.png",
  },
];

export const materialCatalogById = new Map(
  materialCatalog.map((material) => [material.id, material] as const),
);

export const manualCatalogItems = materialCatalog.filter(
  (material) => material.category === "Class Manuals",
);

export const otherCatalogItems = materialCatalog.filter(
  (material) => material.category !== "Class Manuals",
);
