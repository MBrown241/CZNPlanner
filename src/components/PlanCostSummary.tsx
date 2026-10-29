import { calculatePlanCost } from "../lib/calculator";
import type { CharacterPlan } from "../types";

type PlanCostSummaryProps = {
  plan: CharacterPlan;
};

const numberFormat = new Intl.NumberFormat();

export function PlanCostSummary({ plan }: PlanCostSummaryProps) {
  const cost = calculatePlanCost(plan.currentLevel, plan.targetLevel);
  const classManualCount = Object.values(cost.manuals).reduce(
    (total, count) => total + count,
    0,
  );

  return (
    <section className="plan-cost-summary" aria-label="Upgrade cost estimate">
      <div className="plan-cost-heading">
        <span className="pending-label">Estimated upgrade cost</span>
        <strong>{numberFormat.format(cost.xp)} XP</strong>
      </div>
      {cost.xp === 0 ? (
        <p className="no-upgrade-cost">Already at target level.</p>
      ) : (
        <>
          <div className="plan-cost-details">
            <span>
              XP manuals: {cost.xpManuals.gold} gold · {cost.xpManuals.blue} blue ·{" "}
              {cost.xpManuals.gray} gray
            </span>
            <span>
              Credits: {numberFormat.format(cost.levelCredits + cost.promotionCredits)}
            </span>
          </div>
          {classManualCount > 0 && (
            <div className="plan-promotion-cost">
              Class manuals: {cost.manuals.I} × I · {cost.manuals.II} × II ·{" "}
              {cost.manuals.III} × III
            </div>
          )}
        </>
      )}
    </section>
  );
}
