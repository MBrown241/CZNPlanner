import { potentialProfiles } from "../data/potentials";
import { materialCatalogById } from "../data/materials";
import { calculatePotentialCost, getPotentialProgress } from "../lib/potentialCosts";
import type { Character, CharacterPlan, PotentialResourceCost } from "../types";

type PotentialCostSummaryProps = {
  character: Character;
  plan: CharacterPlan;
  onOpenInventoryItem: (materialId: string) => void;
  completedMaterialIds: ReadonlySet<string>;
  convertibleByMaterial: ReadonlyMap<string, number>;
};

const numberFormat = new Intl.NumberFormat();

const materialIconFiles: Record<string, string> = {
  credits: "credits.png",
  "growth-common-justice": "growth-common-justice.png",
  "growth-great-justice": "growth-great-justice.png",
  "growth-premium-justice": "growth-premium-justice.png",
  "growth-common-passion": "growth-common-passion.webp",
  "growth-great-passion": "growth-great-passion.webp",
  "growth-premium-passion": "growth-premium-passion.webp",
  "growth-common-instinct": "growth-common-instinct.webp",
  "growth-great-instinct": "growth-great-instinct.webp",
  "growth-premium-instinct": "growth-premium-instinct.webp",
  "growth-common-order": "growth-common-order.webp",
  "growth-great-order": "growth-great-order.webp",
  "growth-premium-order": "growth-premium-order.webp",
  "growth-common-void": "growth-common-void.png",
  "growth-great-void": "growth-great-void.png",
  "growth-premium-void": "growth-premium-void.png",
  "eye-of-wailing-prodigal": "eye-of-wailing-prodigal.png",
  "shards-of-condemnation": "shards-of-condemnation.png",
  "undetermined-ego-crystal": "undetermined-ego-crystal.png",
};

function PotentialMaterialTile({
  item,
  onOpenInventoryItem,
  isComplete,
  convertible,
}: {
  item: PotentialResourceCost;
  onOpenInventoryItem?: () => void;
  isComplete: boolean;
  convertible: number;
}) {
  const imageFile = materialIconFiles[item.id];
  const growthTierClass = item.id.startsWith("growth-common-")
    ? " growth-art-common"
    : item.id.startsWith("growth-great-")
      ? " growth-art-great"
      : item.id.startsWith("growth-premium-")
        ? " growth-art-premium"
        : "";
  const art = (
    <span className={`plan-cost-art${growthTierClass}${imageFile ? "" : " is-placeholder"}${isComplete ? " is-complete" : ""}`}>
      {imageFile ? (
        <img src={`/images/materials/${imageFile}`} alt="" loading="lazy" />
      ) : (
        <span aria-hidden="true">?</span>
      )}
      {isComplete && (
        <span className="material-complete-check" role="img" aria-label="Enough in inventory">
          ✓
        </span>
      )}
    </span>
  );

  return (
    <div
      className="plan-cost-tile"
      role="group"
      aria-label={`${numberFormat.format(item.amount)} ${item.name}`}
      title={item.name}
    >
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
      <strong>{numberFormat.format(item.amount)}</strong>
      {convertible > 0 && (
        <span className="conversion-hint" title={`${convertible} can be made by converting other tiers at 3:1. Inventory counts are unchanged.`}>
          +{numberFormat.format(convertible)} via 3:1
        </span>
      )}
    </div>
  );
}

export function PotentialCostSummary({
  character,
  plan,
  onOpenInventoryItem,
  completedMaterialIds,
  convertibleByMaterial,
}: PotentialCostSummaryProps) {
  const profile = potentialProfiles[character.potentialProfileId ?? character.id];

  const totals = new Map<string, PotentialResourceCost>();
  let hasPlannedLevels = false;
  let hasPartialCosts = false;

  for (const node of profile?.nodes ?? []) {
    const progress = getPotentialProgress(plan, node);
    if (progress.targetLevel <= progress.currentLevel) continue;

    hasPlannedLevels = true;
    const estimate = calculatePotentialCost(node, progress.currentLevel, progress.targetLevel);
    if (!estimate.complete) hasPartialCosts = true;

    for (const cost of estimate.costs) {
      const existing = totals.get(cost.id);
      totals.set(cost.id, {
        ...cost,
        amount: (existing?.amount ?? 0) + cost.amount,
      });
    }
  }

  const items = [...totals.values()];
  return (
    <section
      className={`plan-cost-summary potential-cost-summary${hasPlannedLevels ? "" : " is-empty"}`}
      aria-label="Potential materials needed"
    >
      <div className="plan-cost-heading">
        <span className="pending-label">Potential costs</span>
        {hasPartialCosts && <span className="potential-cost-partial">Partial data</span>}
      </div>
      {hasPlannedLevels && items.length > 0 ? (
        <div className="plan-cost-items">
          {items.map((item) => (
            <PotentialMaterialTile
              key={item.id}
              item={item}
              isComplete={completedMaterialIds.has(item.id)}
              convertible={convertibleByMaterial.get(item.id) ?? 0}
              onOpenInventoryItem={
                materialCatalogById.has(item.id)
                  ? () => onOpenInventoryItem(item.id)
                  : undefined
              }
            />
          ))}
        </div>
      ) : hasPlannedLevels ? (
        <p className="no-upgrade-cost">Cost data not recorded yet</p>
      ) : (
        <div className="potential-cost-empty-space" aria-hidden="true" />
      )}
    </section>
  );
}
