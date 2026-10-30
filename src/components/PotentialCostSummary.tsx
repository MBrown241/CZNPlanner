import { potentialProfiles } from "../data/potentials";
import { calculatePotentialCost, getPotentialProgress } from "../lib/potentialCosts";
import type { Character, CharacterPlan, PotentialResourceCost } from "../types";

type PotentialCostSummaryProps = {
  character: Character;
  plan: CharacterPlan;
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

const shortNames: Record<string, string> = {
  credits: "Credits",
  "growth-common-justice": "Common Justice",
  "growth-great-justice": "Great Justice",
  "growth-premium-justice": "Premium Justice",
  "growth-common-void": "Common Void",
  "growth-great-void": "Great Void",
  "growth-premium-void": "Premium Void",
  "eye-of-wailing-prodigal": "Wailing Eye",
  "shards-of-condemnation": "Judas Shards",
  "undetermined-ego-crystal": "Ego Crystal",
};

function PotentialMaterialTile({ item }: { item: PotentialResourceCost }) {
  const imageFile = materialIconFiles[item.id];

  return (
    <div
      className="plan-cost-tile"
      role="group"
      aria-label={`${numberFormat.format(item.amount)} ${item.name}`}
      title={item.name}
    >
      <span className={`plan-cost-art${imageFile ? "" : " is-placeholder"}`}>
        {imageFile ? (
          <img src={`/images/materials/${imageFile}`} alt="" loading="lazy" />
        ) : (
          <span aria-hidden="true">?</span>
        )}
      </span>
      <strong>{numberFormat.format(item.amount)}</strong>
      <span className="plan-cost-tile-name">{shortNames[item.id] ?? item.name}</span>
    </div>
  );
}

export function PotentialCostSummary({ character, plan }: PotentialCostSummaryProps) {
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
          {items.map((item) => <PotentialMaterialTile key={item.id} item={item} />)}
        </div>
      ) : (
        <p className="no-upgrade-cost">Cost data not recorded yet</p>
      )}
    </section>
  );
}
