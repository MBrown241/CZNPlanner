import { calculatePlanCost } from "../lib/calculator";
import { getClassManualId, materialCatalogById } from "../data/materials";
import type { Character, CharacterPlan } from "../types";

type PlanCostSummaryProps = {
  character: Character;
  plan: CharacterPlan;
  onOpenInventoryItem: (materialId: string) => void;
  completedMaterialIds: ReadonlySet<string>;
};

type CostItem = {
  id: string;
  name: string;
  count: number;
  image?: string;
  fallback?: string;
};

const numberFormat = new Intl.NumberFormat();

const xpManuals = [
  { id: "xp-gold", label: "Premium Battle Memory", image: "xp-gold.png", tier: "gold" as const },
  { id: "xp-blue", label: "Advanced Battle Memory", image: "xp-blue.png", tier: "blue" as const },
  { id: "xp-gray", label: "Basic Battle Memory", image: "xp-gray.png", tier: "gray" as const },
];

const manualTierNames: Record<"I" | "II" | "III", string> = {
  I: "Common",
  II: "Advanced",
  III: "Premium",
};

function CostTile({
  item,
  onOpenInventoryItem,
  isComplete,
}: {
  item: CostItem;
  onOpenInventoryItem?: () => void;
  isComplete: boolean;
}) {
  const art = (
    <span className={`plan-cost-art${item.image ? "" : " is-placeholder"}${isComplete ? " is-complete" : ""}`}>
      {item.image ? (
        <img src={`/images/materials/${item.image}`} alt="" loading="lazy" />
      ) : (
        <span aria-hidden="true">{item.fallback}</span>
      )}
      {isComplete && (
        <span className="material-complete-check" role="img" aria-label="Enough in inventory">
          ✓
        </span>
      )}
    </span>
  );

  return (
    <div className="plan-cost-tile" role="group" aria-label={`${item.count} ${item.name}`} title={item.name}>
      {onOpenInventoryItem ? (
        <button
          className="plan-cost-icon-button"
          type="button"
          onClick={onOpenInventoryItem}
          aria-label={`Edit ${item.name} in inventory`}
          title={`Edit ${item.name} in inventory`}
        >
          {art}
        </button>
      ) : art}
      <strong>{numberFormat.format(item.count)}</strong>
    </div>
  );
}

export function PlanCostSummary({
  character,
  plan,
  onOpenInventoryItem,
  completedMaterialIds,
}: PlanCostSummaryProps) {
  const cost = calculatePlanCost(plan.currentLevel, plan.targetLevel);
  const items: CostItem[] = xpManuals
    .map((manual) => ({
      id: manual.id,
      name: manual.label,
      count: cost.xpManuals[manual.tier],
      image: manual.image,
    }))
    .filter((item) => item.count > 0);

  const credits = cost.levelCredits + cost.promotionCredits;
  if (credits > 0) {
    items.push({
      id: "credits",
      name: "Units",
      count: credits,
      image: "credits.png",
    });
  }

  (Object.entries(cost.manuals) as ["I" | "II" | "III", number][]).forEach(([tier, count]) => {
    if (count === 0) return;
    const tierNumber = tier === "I" ? 1 : tier === "II" ? 2 : 3;
    const id = getClassManualId(tier, character.combatClass);
    const material = materialCatalogById.get(id);
    items.push({
      id,
      name: material?.name ?? `${manualTierNames[tier]} Class Manual`,
      count,
      image: material?.image,
      fallback: String(tierNumber),
    });
  });

  return (
    <section className="plan-cost-summary" aria-label="Upgrade cost estimate">
      <div className="plan-cost-heading">
        <span className="pending-label">Upgrade costs</span>
        <strong>{numberFormat.format(cost.xp)} XP</strong>
      </div>
      {cost.xp === 0 ? (
        <p className="no-upgrade-cost">At target level</p>
      ) : (
        <div className="plan-cost-items">
          {items.map((item) => (
            <CostTile
              key={item.id}
              item={item}
              isComplete={completedMaterialIds.has(item.id)}
              onOpenInventoryItem={
                materialCatalogById.has(item.id)
                  ? () => onOpenInventoryItem(item.id)
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
