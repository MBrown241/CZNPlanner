import { calculatePotentialCost } from "../lib/potentialCosts";
import type { PotentialNode, PotentialProgress } from "../types";
import { PotentialLevelStepper } from "./PotentialLevelStepper";

type PotentialNodeDetailsProps = {
  node: PotentialNode;
  progress: PotentialProgress;
  isUnlocked: boolean;
  onChange: (field: keyof PotentialProgress, value: number) => void;
};

function shortName(name: string) {
  if (name === "Credits / Units") return "Units";
  return name;
}

export function PotentialNodeDetails({ node, progress, isUnlocked, onChange }: PotentialNodeDetailsProps) {
  const cap = node.rankCap ?? 1;
  const plannedCost = calculatePotentialCost(node, progress.currentLevel, progress.targetLevel);

  return (
    <section className="potential-node-details" aria-labelledby="potential-selected-name">
      <div className="potential-detail-kicker">
        {node.pathType === "branch" ? "BRANCH NODE" : node.pathType === "main" ? "MAIN PATH" : "POTENTIAL"}
      </div>
      <h3 id="potential-selected-name">{node.name}</h3>
      <div className="potential-detail-levels">
        <PotentialLevelStepper
          label="Current"
          value={progress.currentLevel}
          maximum={cap}
          disabled={!isUnlocked}
          onChange={(value) => onChange("currentLevel", value)}
        />
        <PotentialLevelStepper
          label="Desired"
          value={progress.targetLevel}
          minimum={progress.currentLevel}
          maximum={cap}
          disabled={!isUnlocked}
          onChange={(value) => onChange("targetLevel", value)}
        />
      </div>

      <div className="potential-detail-cost">
        <span>Required for this upgrade</span>
        {!isUnlocked ? (
          <strong>Unlock a connected node first</strong>
        ) : progress.targetLevel <= progress.currentLevel ? (
          <strong>Already at desired level</strong>
        ) : plannedCost.costs.length > 0 ? (
          <ul>
            {plannedCost.costs.map((cost) => (
              <li key={cost.id}>
                <strong>{cost.amount.toLocaleString()}</strong> {shortName(cost.name)}
              </li>
            ))}
          </ul>
        ) : (
          <strong>Cost not recorded</strong>
        )}
        {isUnlocked && !plannedCost.complete && progress.targetLevel > progress.currentLevel && (
          <small>Partial total; some rank costs are not recorded.</small>
        )}
      </div>
    </section>
  );
}
