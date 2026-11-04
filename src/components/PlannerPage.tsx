import { useMemo, useRef } from "react";
import { CharacterPlanCard } from "./CharacterPlanCard";
import { MaterialsSummary } from "./MaterialsSummary";
import { calculateRequirements } from "../lib/calculator";
import { allocateInventoryByPlan } from "../lib/inventoryAllocation";
import type { Character, CharacterPlan, InventoryItem } from "../types";

type PlannerPageProps = {
  characters: Character[];
  plans: CharacterPlan[];
  inventory: InventoryItem[];
  onOpenInventoryItem: (materialId: string) => void;
  onAddCharacter: (characterId: string) => void;
  onUpdatePlan: (characterId: string, updates: Partial<CharacterPlan>) => void;
  onRemovePlan: (characterId: string) => void;
  onReorderPlans: (draggedId: string, targetId: string) => void;
};

export function PlannerPage({
  characters,
  plans,
  inventory,
  onOpenInventoryItem,
  onAddCharacter,
  onUpdatePlan,
  onRemovePlan,
  onReorderPlans,
}: PlannerPageProps) {
  const characterPickerRef = useRef<HTMLDialogElement>(null);
  const plannedCharacterIds = useMemo(
    () => new Set(plans.map((plan) => plan.characterId)),
    [plans],
  );
  const availableCharacters = characters.filter(
    (character) => !plannedCharacterIds.has(character.id),
  );
  const activePlanCount = plans.filter((plan) => plan.active).length;
  const requirements = useMemo(
    () => calculateRequirements(plans, inventory, characters),
    [plans, inventory, characters],
  );
  const inventoryCompletion = useMemo(
    () => allocateInventoryByPlan(plans, inventory, characters),
    [plans, inventory, characters],
  );

  function addCharacter(characterId: string) {
    if (!availableCharacters.some((item) => item.id === characterId)) return;

    onAddCharacter(characterId);
    characterPickerRef.current?.close();
  }

  function showAddCharacterPanel() {
    if (availableCharacters.length > 0) characterPickerRef.current?.showModal();
  }

  return (
    <main className="page-content planner-page">
      <div className="page-heading">
        <div>
          <h1>Character planner</h1>
          <p className="page-description">
            Plan level upgrades using the shared 4-star and 5-star cost assumption.
          </p>
        </div>
        <button
          className="button button-primary"
          type="button"
          onClick={showAddCharacterPanel}
          disabled={availableCharacters.length === 0}
        >
          <span aria-hidden="true">＋</span> Add character
        </button>
      </div>

      <MaterialsSummary
        activePlanCount={activePlanCount}
        requirements={requirements}
        onOpenInventoryItem={onOpenInventoryItem}
      />

      <dialog
        className="potential-dialog character-picker-dialog"
        ref={characterPickerRef}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            characterPickerRef.current?.close();
          }
        }}
      >
        <header className="potential-dialog-header">
          <div>
            <h3>Add a character plan</h3>
            <p>Choose a character to add</p>
          </div>
          <button
            className="potential-dialog-close"
            type="button"
            aria-label="Close character picker"
            onClick={() => characterPickerRef.current?.close()}
          >
            <span className="potential-dialog-close-icon" aria-hidden="true" />
          </button>
        </header>
        <div className="character-picker-list">
          {availableCharacters.map((character) => (
            <button
              className="character-picker-card"
              key={character.id}
              type="button"
              onClick={() => addCharacter(character.id)}
            >
              <span className="character-picker-icon" aria-hidden="true">
                <span>{character.name.slice(0, 1).toUpperCase()}</span>
                {character.portraitUrl && (
                  <img
                    src={character.portraitUrl}
                    alt=""
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                )}
              </span>
              <span className="character-picker-name">{character.name}</span>
              {(character.rarity || character.combatClass || character.attribute) && (
                <span className="character-picker-meta">
                  {[character.rarity && `${character.rarity}-star`, character.combatClass, character.attribute]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              )}
            </button>
          ))}
        </div>
      </dialog>

      <section className="panel plans-panel" aria-labelledby="plans-heading">
          <div className="panel-heading">
            <div>
              <h2 id="plans-heading">Character plans</h2>
            </div>
          </div>

          {plans.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon" aria-hidden="true">
                ✦
              </span>
              <h3>No plans yet</h3>
              <p>Add a character to start setting level and Potential goals.</p>
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
                    onReorder={onReorderPlans}
                    onOpenInventoryItem={onOpenInventoryItem}
                    completedMaterialIds={inventoryCompletion.completedByCharacter.get(plan.characterId) ?? new Set<string>()}
                    convertibleByMaterial={inventoryCompletion.convertibleByCharacter.get(plan.characterId) ?? new Map<string, number>()}
                  />
                );
              })}
            </div>
          )}
      </section>
    </main>
  );
}
