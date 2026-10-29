import { useMemo, useState } from "react";
import { CharacterPlanCard } from "./CharacterPlanCard";
import { MaterialsSummary } from "./MaterialsSummary";
import { calculateRequirements } from "../lib/calculator";
import type { Character, CharacterPlan, InventoryItem } from "../types";

type PlannerPageProps = {
  characters: Character[];
  plans: CharacterPlan[];
  inventory: InventoryItem[];
  onAddCharacter: (characterId: string) => void;
  onUpdatePlan: (characterId: string, updates: Partial<CharacterPlan>) => void;
  onRemovePlan: (characterId: string) => void;
  onManageInventory: () => void;
};

export function PlannerPage({
  characters,
  plans,
  inventory,
  onAddCharacter,
  onUpdatePlan,
  onRemovePlan,
  onManageInventory,
}: PlannerPageProps) {
  const [isAddingCharacter, setIsAddingCharacter] = useState(false);
  const [selectedCharacterId, setSelectedCharacterId] = useState(
    characters[0]?.id ?? "",
  );
  const plannedCharacterIds = useMemo(
    () => new Set(plans.map((plan) => plan.characterId)),
    [plans],
  );
  const availableCharacters = characters.filter(
    (character) => !plannedCharacterIds.has(character.id),
  );
  const activePlanCount = plans.filter((plan) => plan.active).length;
  const requirements = useMemo(
    () => calculateRequirements(plans, inventory),
    [plans, inventory],
  );

  function addSelectedCharacter() {
    if (!availableCharacters.some((item) => item.id === selectedCharacterId)) {
      return;
    }

    onAddCharacter(selectedCharacterId);
    setSelectedCharacterId(
      availableCharacters.find((item) => item.id !== selectedCharacterId)?.id ?? "",
    );
    setIsAddingCharacter(false);
  }

  function showAddCharacterPanel() {
    if (availableCharacters[0]) {
      setSelectedCharacterId(availableCharacters[0].id);
      setIsAddingCharacter(true);
    }
  }

  return (
    <main className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">YOUR UPGRADE WORKSPACE</p>
          <h1>Character planner</h1>
          <p className="page-description">
            Plan level upgrades using the shared 4-star and 5-star cost assumption.
          </p>
        </div>
        <button
          className="button button-primary"
          type="button"
          onClick={() =>
            isAddingCharacter ? setIsAddingCharacter(false) : showAddCharacterPanel()
          }
          disabled={availableCharacters.length === 0}
        >
          <span aria-hidden="true">＋</span> Add character
        </button>
      </div>

      <div className="summary-grid" aria-label="Planner summary">
        <div className="summary-card">
          <span className="summary-icon purple" aria-hidden="true">
            ✦
          </span>
          <div>
            <span className="summary-label">Character plans</span>
            <strong>{plans.length}</strong>
          </div>
        </div>
        <div className="summary-card">
          <span className="summary-icon green" aria-hidden="true">
            ●
          </span>
          <div>
            <span className="summary-label">Active plans</span>
            <strong>{activePlanCount}</strong>
          </div>
        </div>
        <div className="summary-card summary-card-wide">
          <span className="summary-icon amber" aria-hidden="true">
            ◈
          </span>
          <div>
            <span className="summary-label">Game data status</span>
            <strong className="summary-status">Entered · verify in game</strong>
          </div>
        </div>
      </div>

      {isAddingCharacter && availableCharacters.length > 0 && (
        <section className="add-panel" aria-labelledby="add-character-title">
          <div>
            <h2 id="add-character-title">Add a character plan</h2>
            <p>Demo roster only. Character data is unverified.</p>
          </div>
          <div className="add-controls">
            <label className="visually-hidden" htmlFor="character-select">
              Select a character
            </label>
            <select
              id="character-select"
              value={selectedCharacterId}
              onChange={(event) => setSelectedCharacterId(event.target.value)}
            >
              {availableCharacters.map((character) => (
                <option key={character.id} value={character.id}>
                  {character.name}
                </option>
              ))}
            </select>
            <button
              className="button button-primary"
              type="button"
              onClick={addSelectedCharacter}
            >
              Add plan
            </button>
            <button
              className="button button-quiet"
              type="button"
              onClick={() => setIsAddingCharacter(false)}
            >
              Cancel
            </button>
          </div>
        </section>
      )}

      <div className="dashboard-grid">
        <section className="panel plans-panel" aria-labelledby="plans-heading">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">YOUR ROSTER</p>
              <h2 id="plans-heading">Character plans</h2>
            </div>
            <span className="count-pill">{plans.length} total</span>
          </div>

          {plans.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon" aria-hidden="true">
                ✦
              </span>
              <h3>No plans yet</h3>
              <p>Add a demo character to start setting upgrade goals.</p>
              <button
                className="button button-secondary"
                type="button"
                onClick={showAddCharacterPanel}
              >
                Add your first character
              </button>
            </div>
          ) : (
            <div className="plan-list">
              {plans.map((plan) => {
                const character = characters.find(
                  (item) => item.id === plan.characterId,
                );
                if (!character) return null;

                return (
                  <CharacterPlanCard
                    key={plan.characterId}
                    character={character}
                    plan={plan}
                    onUpdate={onUpdatePlan}
                    onRemove={onRemovePlan}
                  />
                );
              })}
            </div>
          )}
        </section>

        <MaterialsSummary
          activePlanCount={activePlanCount}
          requirements={requirements}
          onManageInventory={onManageInventory}
        />
      </div>
    </main>
  );
}
