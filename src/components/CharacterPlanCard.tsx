import { useRef, useState } from "react";
import type { Character, CharacterPlan } from "../types";
import { PlanCostSummary } from "./PlanCostSummary";
import { PotentialCostSummary } from "./PotentialCostSummary";
import { PotentialPlanner } from "./PotentialPlanner";

type CharacterPlanCardProps = {
  character: Character;
  plan: CharacterPlan;
  onUpdate: (characterId: string, updates: Partial<CharacterPlan>) => void;
  onRemove: (characterId: string) => void;
  onReorder: (draggedId: string, targetId: string) => void;
  onOpenInventoryItem: (materialId: string) => void;
  completedMaterialIds: ReadonlySet<string>;
  convertibleByMaterial: ReadonlyMap<string, number>;
};

export function CharacterPlanCard({
  character,
  plan,
  onUpdate,
  onRemove,
  onReorder,
  onOpenInventoryItem,
  completedMaterialIds,
  convertibleByMaterial,
}: CharacterPlanCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragGesture = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    holdTimer: number;
    isActive: boolean;
  } | null>(null);
  function clearDragGesture() {
    const gesture = dragGesture.current;
    if (!gesture) return;

    window.clearTimeout(gesture.holdTimer);
    document
      .querySelectorAll(".plan-card.is-drop-target")
      .forEach((card) => card.classList.remove("is-drop-target"));
    document.body.classList.remove("is-plan-reordering");
    dragGesture.current = null;
    setIsDragging(false);
  }

  return (
    <article
      className={`plan-card${isDragging ? " is-dragging" : ""}`}
      data-plan-id={plan.characterId}
    >
      {character.portraitUrl && (
        <div className="plan-card-background-art" aria-hidden="true">
          <img
            src={character.portraitUrl}
            alt=""
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}
      <div
        className="plan-card-top"
        onPointerDown={(event) => {
          if (!event.isPrimary || event.button !== 0) return;
          if (
            (event.target as HTMLElement).closest(
              "button, input, select, textarea, label, a, [contenteditable='true']",
            )
          ) {
            return;
          }

          const header = event.currentTarget;
          header.setPointerCapture(event.pointerId);
          const gesture = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            holdTimer: 0,
            isActive: false,
          };
          gesture.holdTimer = window.setTimeout(() => {
            if (dragGesture.current !== gesture) return;
            gesture.isActive = true;
            setIsDragging(true);
            document.body.classList.add("is-plan-reordering");
          }, 220);
          dragGesture.current = gesture;
        }}
        onPointerMove={(event) => {
          const gesture = dragGesture.current;
          if (!gesture || gesture.pointerId !== event.pointerId) return;

          if (!gesture.isActive) {
            const moved =
              Math.hypot(event.clientX - gesture.startX, event.clientY - gesture.startY) > 8;
            if (moved) clearDragGesture();
            return;
          }

          document
            .querySelectorAll(".plan-card.is-drop-target")
            .forEach((card) => card.classList.remove("is-drop-target"));
          const target = document
            .elementFromPoint(event.clientX, event.clientY)
            ?.closest<HTMLElement>(".plan-card[data-plan-id]");
          if (target && target.dataset.planId !== plan.characterId) {
            target.classList.add("is-drop-target");
          }
        }}
        onPointerUp={(event) => {
          const gesture = dragGesture.current;
          if (!gesture || gesture.pointerId !== event.pointerId) return;

          const target = gesture.isActive
            ? document
                .elementFromPoint(event.clientX, event.clientY)
                ?.closest<HTMLElement>(".plan-card[data-plan-id]")
            : null;
          clearDragGesture();
          if (target?.dataset.planId) {
            onReorder(plan.characterId, target.dataset.planId);
          }
        }}
        onPointerCancel={clearDragGesture}
        onLostPointerCapture={clearDragGesture}
      >
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

      <PlanCostSummary
        character={character}
        plan={plan}
        onOpenInventoryItem={onOpenInventoryItem}
        completedMaterialIds={completedMaterialIds}
        convertibleByMaterial={convertibleByMaterial}
      />
      <PotentialCostSummary
        character={character}
        plan={plan}
        onOpenInventoryItem={onOpenInventoryItem}
        completedMaterialIds={completedMaterialIds}
        convertibleByMaterial={convertibleByMaterial}
      />

      <p className="promotion-status">
        <span className="status-dot green-dot" /> Promotions included
      </p>

      <PotentialPlanner
        character={character}
        plan={plan}
        onUpdate={onUpdate}
      />

      <div className="plan-card-footer">
        <span className="demo-note">Game data · verify in game</span>
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
