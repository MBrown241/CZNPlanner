import type { MaterialRequirement } from "../types";

type MaterialsSummaryProps = {
  activePlanCount: number;
  requirements: MaterialRequirement[];
  onManageInventory: () => void;
};

const numberFormat = new Intl.NumberFormat();

export function MaterialsSummary({
  activePlanCount,
  requirements,
  onManageInventory,
}: MaterialsSummaryProps) {
  return (
    <aside className="panel materials-panel" aria-labelledby="materials-heading">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">SHARED REQUIREMENTS</p>
          <h2 id="materials-heading">Materials needed</h2>
        </div>
        <span className="material-symbol" aria-hidden="true">
          ◈
        </span>
      </div>

      {requirements.length === 0 ? (
        <div className="requirements-empty">
          <div className="requirements-art" aria-hidden="true">
            ◇
          </div>
          <h3>{activePlanCount === 0 ? "No active plans" : "No upgrades planned"}</h3>
          <p>
            {activePlanCount === 0
              ? "Turn on a character plan to include it in these totals."
              : "Set a target level above the current level to calculate costs."}
          </p>
        </div>
      ) : (
        <>
          <div className="requirements-list">
            {requirements.map((item) => (
              <div className="requirement-row" key={item.id}>
                <div className="requirement-name">
                  <strong>{item.name}</strong>
                  {!item.inventoryTracked && (
                    <span>Class-specific; inventory not matched yet</span>
                  )}
                </div>
                <div className="requirement-amounts">
                  {item.inventoryTracked ? (
                    <>
                      <span>{numberFormat.format(item.required)} total</span>
                      <span>{numberFormat.format(item.owned)} owned</span>
                      <strong className="requirement-remaining">
                        {numberFormat.format(item.remaining)} needed
                      </strong>
                    </>
                  ) : (
                    <>
                      <span>{numberFormat.format(item.required)} total</span>
                      <strong className="requirement-remaining">
                        {numberFormat.format(item.required)} needed
                      </strong>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="requirements-note">
            XP manuals use the fewest manuals possible. Class Manual I, II, and III totals
            are combined across the demo roster; class matching is pending.
          </p>
        </>
      )}

      <div className="requirements-footnote">
        <span className="status-dot amber-dot" />
        {activePlanCount} active {activePlanCount === 1 ? "plan" : "plans"} included
      </div>
      <button
        className="text-button inventory-link"
        type="button"
        onClick={onManageInventory}
      >
        Manage shared inventory <span aria-hidden="true">→</span>
      </button>
    </aside>
  );
}
