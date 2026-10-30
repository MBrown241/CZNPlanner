import { calculatePlanCost } from "../lib/calculator";
import type { Character, CharacterPlan } from "../types";

type PlanCostSummaryProps = {
  character: Character;
  plan: CharacterPlan;
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
  { id: "xp-gold", label: "Gold XP", image: "xp-gold.png", tier: "gold" as const },
  { id: "xp-blue", label: "Blue XP", image: "xp-blue.png", tier: "blue" as const },
  { id: "xp-gray", label: "Gray XP", image: "xp-gray.png", tier: "gray" as const },
];

const manualClassSlugs: Record<string, string> = {
  Hunter: "hunter",
  Controller: "controller",
};

function CostTile({ item }: { item: CostItem }) {
  return (
    <div className="plan-cost-tile" role="group" aria-label={`${item.count} ${item.name}`} title={item.name}>
      <span className={`plan-cost-art${item.image ? "" : " is-placeholder"}`}>
        {item.image ? (
          <img src={`/images/materials/${item.image}`} alt="" loading="lazy" />
        ) : (
          <span aria-hidden="true">{item.fallback}</span>
        )}
      </span>
      <strong>{numberFormat.format(item.count)}</strong>
      <span className="plan-cost-tile-name">{item.name}</span>
    </div>
  );
}

export function PlanCostSummary({ character, plan }: PlanCostSummaryProps) {
  const cost = calculatePlanCost(plan.currentLevel, plan.targetLevel);
  const classSlug = character.combatClass ? manualClassSlugs[character.combatClass] : undefined;
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
      name: "Credits",
      count: credits,
      image: "credits.png",
    });
  }

  (Object.entries(cost.manuals) as ["I" | "II" | "III", number][]).forEach(([tier, count]) => {
    if (count === 0) return;
    const tierNumber = tier === "I" ? 1 : tier === "II" ? 2 : 3;
    const image = classSlug && !(classSlug === "controller" && tier === "III")
      ? `class-manual-${tier.toLowerCase()}-${classSlug}.png`
      : undefined;
    items.push({
      id: `class-manual-${tier.toLowerCase()}`,
      name: `Manual ${tier}`,
      count,
      image,
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
          {items.map((item) => <CostTile key={item.id} item={item} />)}
        </div>
      )}
    </section>
  );
}
