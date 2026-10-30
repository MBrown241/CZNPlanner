import { potentialProfiles } from "../data/potentials";
import { materialCatalogById } from "../data/materials";
import { calculatePotentialCost, getPotentialProgress } from "../lib/potentialCosts";
import type { Character, CharacterPlan, PotentialResourceCost } from "../types";

type PotentialCostSummaryProps = {
  character: Character;
  plan: CharacterPlan;
  onOpenInventoryItem: (materialId: string) => void;
  completedMaterialIds: ReadonlySet<string>;
};

const numberFormat = new Intl.NumberFormat();

const materialIconFiles: Record<string, string> = {
  credits: "credits.png",
  "growth-common-justice": "growth-common-justice.png",
  "growth-great-justice": "growth-great-justice.png",
  "growth-premium-justice": "growth-premium-justice.png",
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
}: {
  item: PotentialResourceCost;
  onOpenInventoryItem?: () => void;
  isComplete: boolean;
}) {
  const imageFile = materialIconFiles[item.id];
  const art = (
    <span className={`plan-cost-art${imageFile ? "" : " is-placeholder"}${isComplete ? " is-complete" : ""}`}>
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
    </div>
  );
}

export function PotentialCostSummary({
  character,
  plan,
  onOpenInventoryItem,
  completedMaterialIds,
}: PotentialCostSummaryProps) {
  const profile = character.potentialProfileId
    ? potentialProfiles[character.potentialProfileId]
    : undefined;
  if (!profile) return null;

  const totals = new Map<string, PotentialResourceCost>();
  let hasPlannedLevels = false;
  let hasPartialCosts = false;

  for (const node of profile.nodes) {
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

  if (!hasPlannedLevels) return null;

  const items = [...totals.values()];
  return (
    <section className="plan-cost-summary potential-cost-summary" aria-label="Potential materials needed">
      <div className="plan-cost-heading">
        <span className="pending-label">Potential costs</span>
        {hasPartialCosts && <span className="potential-cost-partial">Partial data</span>}
      </div>
      {items.length > 0 ? (
        <div className="plan-cost-items">
          {items.map((item) => (
            <PotentialMaterialTile
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
      ) : (
        <p className="no-upgrade-cost">Cost data not recorded yet</p>
      )}
    </section>
  );
}
