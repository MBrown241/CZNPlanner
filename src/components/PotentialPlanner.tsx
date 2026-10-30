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
  const connections = profile.connections ?? [];
  const getProgressFor = (nodeId: string) => {
    const node = profile.nodes.find((item) => item.id === nodeId);
    return node
      ? getPotentialProgress(plan, node)
      : { currentLevel: 0, targetLevel: 0 };
  };
  const isNodeUnlocked = (
    nodeId: string,
    progressByNode: Record<string, PotentialProgress>,
    visited = new Set<string>(),
  ) => {
    if (visited.has(nodeId)) return false;
    const nextVisited = new Set(visited).add(nodeId);
    const parents = connections.filter(([, childId]) => childId === nodeId);
    return (
      parents.length === 0 ||
      parents.some(([parentId]) => {
        const parentProgress = progressByNode[parentId] ?? getProgressFor(parentId);
        return (
          (parentProgress.currentLevel > 0 || parentProgress.targetLevel > 0) &&
          isNodeUnlocked(parentId, progressByNode, nextVisited)
        );
      })
    );
  };
  const unlockedNodeIds = new Set(
    profile.nodes
      .filter((node) => isNodeUnlocked(node.id, draft))
      .map((node) => node.id),
  );

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
    const node = profile.nodes.find((item) => item.id === nodeId);
    if (!node || !isNodeUnlocked(nodeId, draft)) return;
    const progress = draft[nodeId] ?? getPotentialProgress(plan, node);
    const updated = { ...progress, [field]: value };
    if (updated.currentLevel > updated.targetLevel) updated.targetLevel = updated.currentLevel;
    if (updated.targetLevel < updated.currentLevel) updated.currentLevel = updated.targetLevel;
    const nextDraft = { ...draft, [nodeId]: updated };
    for (const connectedNode of profile.nodes) {
      if (!isNodeUnlocked(connectedNode.id, nextDraft)) {
        const connectedProgress = nextDraft[connectedNode.id] ?? getProgressFor(connectedNode.id);
        if (connectedProgress.targetLevel > connectedProgress.currentLevel) {
          nextDraft[connectedNode.id] = {
            ...connectedProgress,
            targetLevel: connectedProgress.currentLevel,
          };
        }
      }
    }
    setDraft(nextDraft);
    onUpdate(character.id, {
      potentialProgress: nextDraft,
      potentialTargets: undefined,
    });
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
            <span className="potential-dialog-close-icon" aria-hidden="true" />
          </button>
        </header>

        <main className="potential-game-layout">
          <div className="potential-map-scroll">
            <PotentialTreeMap
              nodes={profile.nodes}
              connections={connections}
              progress={draft}
              unlockedNodeIds={unlockedNodeIds}
              selectedNodeId={selectedNode.id}
              onSelect={setSelectedNodeId}
            />
          </div>
          <PotentialNodeDetails
            node={selectedNode}
            progress={draft[selectedNode.id] ?? { currentLevel: 0, targetLevel: 0 }}
            isUnlocked={unlockedNodeIds.has(selectedNode.id)}
            onChange={(field, value) => updateDraft(selectedNode.id, field, value)}
          />
        </main>

      </dialog>
    </section>
  );
}
