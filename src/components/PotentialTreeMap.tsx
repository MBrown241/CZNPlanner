import type { PotentialNode, PotentialProgress } from "../types";

type PotentialTreeMapProps = {
  nodes: PotentialNode[];
  connections: [string, string][];
  progress: Record<string, PotentialProgress>;
  unlockedNodeIds: Set<string>;
  selectedNodeId: string;
  onSelect: (nodeId: string) => void;
};

export function PotentialTreeMap({
  nodes,
  connections,
  progress,
  unlockedNodeIds,
  selectedNodeId,
  onSelect,
}: PotentialTreeMapProps) {
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  const getMapPosition = (nodeId: string) => {
    const position = nodesById.get(nodeId)?.mapPosition;
    if (!position) return undefined;
    return {
      x: Math.min(91, position.x + 6),
      y: position.y * 0.8 + 20,
    };
  };

  return (
    <div className="potential-tree-map" role="group" aria-label="Potential node tree">
      <svg
        className="potential-tree-lines"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {connections.map(([fromId, toId]) => {
          const from = getMapPosition(fromId);
          const to = getMapPosition(toId);
          if (!from || !to) return null;
          const active = (progress[fromId]?.currentLevel ?? 0) > 0
            || (progress[fromId]?.targetLevel ?? 0) > 0;
          return (
            <line
              className={active ? "is-active" : ""}
              key={`${fromId}-${toId}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
            />
          );
        })}
      </svg>

      {nodes.map((node) => {
        const position = getMapPosition(node.id);
        if (!position) return null;
        const cap = node.rankCap ?? 1;
        const nodeProgress = progress[node.id] ?? { currentLevel: 0, targetLevel: 0 };
        const selected = node.id === selectedNodeId;
        const completed = nodeProgress.currentLevel > 0;
        const planned = nodeProgress.targetLevel > nodeProgress.currentLevel;
        const unlocked = unlockedNodeIds.has(node.id);
        const levelText = node.rankCap
          ? `${nodeProgress.targetLevel}/${cap}`
          : nodeProgress.targetLevel > 0
            ? "Planned"
            : completed
              ? "Unlocked"
              : "";

        return (
          <button
            className={`potential-map-node${levelText ? " has-level" : ""}${selected ? " is-selected" : ""}${completed ? " is-complete" : ""}${planned ? " is-planned" : ""}${unlocked ? "" : " is-locked"}`}
            key={node.id}
            type="button"
            aria-pressed={selected}
            aria-label={`${node.name}, ${unlocked ? "unlocked" : "locked"}, ${node.rankCap ? `desired level ${nodeProgress.targetLevel} of ${cap}, current level ${nodeProgress.currentLevel}` : nodeProgress.targetLevel > 0 ? "planned" : completed ? "unlocked" : "not unlocked"}`}
            style={{ left: `${position.x}%`, top: `${position.y}%` }}
            onClick={() => onSelect(node.id)}
          >
            <span className="potential-map-node-circle">
              <span aria-hidden="true">&#9671;</span>
            </span>
            {levelText && <span className="potential-map-node-level">{levelText}</span>}
            <span className="potential-map-node-name">{node.name}</span>
          </button>
        );
      })}
    </div>
  );
}
