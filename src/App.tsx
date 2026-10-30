import { useState } from "react";
import { AppHeader } from "./components/AppHeader";
import { InventoryPage } from "./components/InventoryPage";
import { PlannerPage } from "./components/PlannerPage";
import { characters } from "./data/characters";
import {
  canAccessStorage,
  readInventory,
  readPlans,
  writeInventory,
  writePlans,
} from "./lib/storage";
import type { CharacterPlan, InventoryItem, Page } from "./types";
import "./App.css";

function App() {
  const [page, setPage] = useState<Page>("planner");
  const [plans, setPlans] = useState<CharacterPlan[]>(readPlans);
  const [inventory, setInventory] = useState<InventoryItem[]>(readInventory);
  const [storageWarning, setStorageWarning] = useState(() => !canAccessStorage());

  function persistPlans(nextPlans: CharacterPlan[]) {
    setPlans(nextPlans);
    setStorageWarning(!writePlans(nextPlans));
  }

  function persistInventory(nextInventory: InventoryItem[]) {
    setInventory(nextInventory);
    setStorageWarning(!writeInventory(nextInventory));
  }

  function addCharacter(characterId: string) {
    const characterExists = characters.some(
      (character) => character.id === characterId,
    );
    const alreadyPlanned = plans.some(
      (plan) => plan.characterId === characterId,
    );

    if (!characterExists || alreadyPlanned) return;

    persistPlans([
      ...plans,
      {
        characterId,
        active: true,
        currentLevel: 1,
        targetLevel: 60,
      },
    ]);
  }

  function updatePlan(characterId: string, updates: Partial<CharacterPlan>) {
    persistPlans(
      plans.map((plan) =>
        plan.characterId === characterId ? { ...plan, ...updates } : plan,
      ),
    );
  }

  function reorderPlans(draggedId: string, targetId: string) {
    const draggedIndex = plans.findIndex((plan) => plan.characterId === draggedId);
    const targetIndex = plans.findIndex((plan) => plan.characterId === targetId);
    if (draggedIndex < 0 || targetIndex < 0 || draggedIndex === targetIndex) return;

    const nextPlans = [...plans];
    const [draggedPlan] = nextPlans.splice(draggedIndex, 1);
    if (!draggedPlan) return;
    nextPlans.splice(targetIndex, 0, draggedPlan);
    persistPlans(nextPlans);
  }

  function removePlan(characterId: string) {
    persistPlans(plans.filter((plan) => plan.characterId !== characterId));
  }

  function addInventoryItem(item: InventoryItem): boolean {
    if (inventory.some((existing) => existing.materialId === item.materialId)) {
      return false;
    }

    persistInventory([...inventory, item]);
    return true;
  }

  function updateOwnedQuantity(materialId: string, quantity: number) {
    if (!Number.isFinite(quantity) || quantity < 0) return;

    persistInventory(
      inventory.map((item) =>
        item.materialId === materialId
          ? { ...item, owned: Math.floor(quantity) }
          : item,
      ),
    );
  }

  function removeInventoryItem(materialId: string) {
    persistInventory(inventory.filter((item) => item.materialId !== materialId));
  }

  return (
    <div className="app-shell">
      <AppHeader page={page} onPageChange={setPage} />

      {storageWarning && (
        <div className="storage-notice" role="status">
          Browser storage is unavailable. Changes may not persist after refresh.
        </div>
      )}

      {page === "planner" ? (
        <PlannerPage
          characters={characters}
          plans={plans}
          inventory={inventory}
          onAddCharacter={addCharacter}
          onUpdatePlan={updatePlan}
          onRemovePlan={removePlan}
          onReorderPlans={reorderPlans}
        />
      ) : (
        <InventoryPage
          inventory={inventory}
          onAddItem={addInventoryItem}
          onUpdateQuantity={updateOwnedQuantity}
          onRemoveItem={removeInventoryItem}
        />
      )}

      <footer className="app-footer">
        <span>CZN Upgrade Planner</span>
        <span>Demo roster · shared 4/5-star cost assumption</span>
      </footer>
    </div>
  );
}

export default App;
