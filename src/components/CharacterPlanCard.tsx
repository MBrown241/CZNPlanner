import type { Character, CharacterPlan } from "../types";
import { PlanCostSummary } from "./PlanCostSummary";
import { PotentialPlanner } from "./PotentialPlanner";

type CharacterPlanCardProps = {
  character: Character;
  plan: CharacterPlan;
  onUpdate: (characterId: string, updates: Partial<CharacterPlan>) => void;
  onRemove: (characterId: string) => void;
};

export function CharacterPlanCard({
  character,
  plan,
  onUpdate,
  onRemove,
}: CharacterPlanCardProps) {
  return (
    <article className="plan-card">
      <div className="plan-card-top">
        <div className="character-avatar" aria-hidden="true">
          {character.name.slice(-1)}
        </div>
        <div className="character-info">
          <h3>{character.name}</h3>
          <span className="character-meta">
            {character.rarity
              ? `${character.rarity}-star · ${character.combatClass} · ${character.attribute}`
              : "Demo character"}
          </span>
        </div>
        <label className="toggle-control">
          <span>{plan.active ? "Active" : "Paused"}</span>
          <input
            type="checkbox"
            checked={plan.active}
            onChange={(event) =>
              onUpdate(plan.characterId, { active: event.target.checked })
            }
            aria-label={"Include " + character.name + " in active plans"}
          />
        </label>
      </div>

      <div className="level-editor">
        <label>
          <span>Current level</span>
          <input
            type="number"
            min="1"
            max={Math.min(plan.targetLevel, 60)}
            value={plan.currentLevel}
            onChange={(event) => {
              const value = Number(event.target.value);
              if (Number.isInteger(value) && value >= 1 && value <= 60) {
                onUpdate(plan.characterId, {
                  currentLevel: Math.min(value, plan.targetLevel),
                });
              }
            }}
          />
        </label>
        <span className="level-arrow" aria-hidden="true">
          →
        </span>
        <label>
          <span>Target level</span>
          <input
            type="number"
            min={plan.currentLevel}
            max="60"
            value={plan.targetLevel}
            onChange={(event) => {
              const value = Number(event.target.value);
              if (
                Number.isInteger(value) &&
                value >= plan.currentLevel &&
                value <= 60
              ) {
                onUpdate(plan.characterId, { targetLevel: value });
              }
            }}
          />
        </label>
      </div>

      <PlanCostSummary plan={plan} />

      <div className="pending-data-grid">
        <div>
          <span className="pending-label">Promotions</span>
          <strong className="data-included">Tier costs included</strong>
        </div>
      </div>

      <PotentialPlanner
        character={character}
        plan={plan}
        onUpdate={onUpdate}
      />

      <div className="plan-card-footer">
        <span className="demo-note">Unverified demo record</span>
        <button
          className="text-button danger-text"
          type="button"
          onClick={() => onRemove(plan.characterId)}
        >
          Remove plan
        </button>
      </div>
    </article>
  );
}
