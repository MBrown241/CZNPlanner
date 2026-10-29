import { useRef, useState } from "react";
import { potentialProfiles } from "../data/potentials";
import { getPotentialProgress } from "../lib/potentialCosts";
import type { Character, CharacterPlan, PotentialProgress } from "../types";
import { PotentialNodeDetails } from "./PotentialNodeDetails";
import { PotentialTreeMap } from "./PotentialTreeMap";

type PotentialPlannerProps = {
  character: Character;
  plan: CharacterPlan;
  onUpdate: (characterId: string, updates: Partial<CharacterPlan>) => void;
};

export function PotentialPlanner({ character, plan, onUpdate }: PotentialPlannerProps) {
  const profile = character.potentialProfileId
    ? potentialProfiles[character.potentialProfileId]
    : undefined;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<Record<string, PotentialProgress>>({});
  const [selectedNodeId, setSelectedNodeId] = useState("");

  if (!profile) {
    return (
      <section className="potential-planner potential-unavailable">
        <h4>Potentials</h4>
        <p>Potential data not added for this character yet.</p>
      </section>
    );
  }

  const firstNode = profile.nodes[0];
  if (!firstNode) return null;

  const plannedCount = profile.nodes.filter((node) => {
    const progress = getPotentialProgress(plan, node);
    return progress.targetLevel > progress.currentLevel;
  }).length;
  const selectedNode = profile.nodes.find((node) => node.id === selectedNodeId) ?? firstNode;

  function openPlanner() {
    const initialProgress = Object.fromEntries(
      profile.nodes.map((node) => [node.id, getPotentialProgress(plan, node)]),
    );
    const initialSelection = profile.nodes.find((node) => {
      const progress = getPotentialProgress(plan, node);
      return progress.targetLevel > progress.currentLevel;
    }) ?? firstNode;
    setDraft(initialProgress);
    setSelectedNodeId(initialSelection.id);
    dialogRef.current?.showModal();
  }

  function updateDraft(nodeId: string, field: keyof PotentialProgress, value: number) {
    setDraft((current) => {
      const progress = current[nodeId] ?? { currentLevel: 0, targetLevel: 0 };
      const updated = { ...progress, [field]: value };
      if (updated.currentLevel > updated.targetLevel) updated.targetLevel = updated.currentLevel;
      if (updated.targetLevel < updated.currentLevel) updated.currentLevel = updated.targetLevel;
      return { ...current, [nodeId]: updated };
    });
  }

  function savePlanner() {
    onUpdate(character.id, {
      potentialProgress: draft,
      potentialTargets: undefined,
    });
    dialogRef.current?.close();
  }

  return (
    <section className="potential-planner">
      <button className="potential-open-button" type="button" onClick={openPlanner}>
        <span>Plan potentials</span>
        <span className="potential-count">{plannedCount} planned</span>
      </button>

      <dialog className="potential-dialog" ref={dialogRef}>
        <header className="potential-dialog-header">
          <div>
            <h3>{character.name}</h3>
            <p>Potential tree · {profile.attribute}</p>
          </div>
          <button
            className="potential-dialog-close"
            type="button"
            aria-label="Close potential planner"
            onClick={() => dialogRef.current?.close()}
          >
            &times;
          </button>
        </header>

        <main className="potential-game-layout">
          <div className="potential-map-scroll">
            <PotentialTreeMap
              nodes={profile.nodes}
              connections={profile.connections ?? []}
              progress={draft}
              selectedNodeId={selectedNode.id}
              onSelect={setSelectedNodeId}
            />
          </div>
          <PotentialNodeDetails
            node={selectedNode}
            progress={draft[selectedNode.id] ?? { currentLevel: 0, targetLevel: 0 }}
            onChange={(field, value) => updateDraft(selectedNode.id, field, value)}
          />
        </main>

        <footer className="potential-dialog-footer">
          <button
            className="potential-cancel-button"
            type="button"
            aria-label="Cancel without saving"
            title="Cancel"
            onClick={() => dialogRef.current?.close()}
          >
            &times;
          </button>
          <button
            className="potential-save-button"
            type="button"
            aria-label="Save potential plan"
            title="Save"
            onClick={savePlanner}
          >
            &#10003;
          </button>
        </footer>
      </dialog>
    </section>
  );
}
