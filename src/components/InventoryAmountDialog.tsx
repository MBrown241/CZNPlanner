import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { materialCatalogById, materialImageSource } from "../data/materials";
import type { InventoryItem } from "../types";

type InventoryAmountDialogProps = {
  materialId: string;
  inventory: InventoryItem[];
  onAddItem: (item: InventoryItem) => boolean;
  onUpdateQuantity: (materialId: string, quantity: number) => void;
  onRemoveItem: (materialId: string) => void;
  onClose: () => void;
};

export function InventoryAmountDialog({
  materialId,
  inventory,
  onAddItem,
  onUpdateQuantity,
  onRemoveItem,
  onClose,
}: InventoryAmountDialogProps) {
  const [materialQuantity, setMaterialQuantity] = useState(() =>
    String(inventory.find((item) => item.materialId === materialId)?.owned ?? 0),
  );
  const [inventoryError, setInventoryError] = useState("");
  const quantityInputRef = useRef<HTMLInputElement>(null);
  const selectedCatalogItem = materialCatalogById.get(materialId);
  const selectedInventoryItem = inventory.find((item) => item.materialId === materialId);
  const selectedName = selectedCatalogItem?.name ?? selectedInventoryItem?.name ?? "Material";

  useEffect(() => {
    quantityInputRef.current?.focus();
    quantityInputRef.current?.select();
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function saveInventoryItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const quantity = Number(materialQuantity);

    if (!Number.isSafeInteger(quantity) || quantity < 0) {
      setInventoryError("Enter a whole number of 0 or more.");
      return;
    }

    if (selectedInventoryItem) {
      onUpdateQuantity(materialId, quantity);
    } else if (selectedCatalogItem) {
      const added = onAddItem({
        materialId: selectedCatalogItem.id,
        name: selectedCatalogItem.name,
        owned: quantity,
      });
      if (!added) {
        setInventoryError("This material is already recorded. Close and reopen it to edit the amount.");
        return;
      }
    }

    onClose();
  }

  return (
    <div
      className="inventory-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="inventory-amount-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="inventory-dialog-title"
      >
        <header className="inventory-amount-header">
          <h2 id="inventory-dialog-title">{selectedName}</h2>
          <button
            className="icon-button inventory-dialog-close"
            type="button"
            onClick={onClose}
            aria-label="Close material editor"
          >
            ×
          </button>
        </header>
        <form onSubmit={saveInventoryItem}>
          <div className="inventory-amount-body">
            <span className="inventory-amount-art">
              {selectedCatalogItem?.image ? (
                <img src={materialImageSource(selectedCatalogItem.image)} alt="" />
              ) : (
                <span aria-hidden="true">◇</span>
              )}
            </span>
            <label className="inventory-amount-field">
              <span>Amount owned</span>
              <input
                ref={quantityInputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={materialQuantity}
                onChange={(event) => setMaterialQuantity(event.target.value)}
                onFocus={(event) => event.currentTarget.select()}
                aria-describedby={inventoryError ? "inventory-amount-error" : undefined}
              />
            </label>
          </div>
          {inventoryError && <p id="inventory-amount-error" className="form-error" role="alert">{inventoryError}</p>}
          <footer className="inventory-amount-actions">
            {selectedInventoryItem && (
              <button
                className="text-button danger-text"
                type="button"
                onClick={() => {
                  onRemoveItem(materialId);
                  onClose();
                }}
              >
                Remove from inventory
              </button>
            )}
            <span className="inventory-amount-spacer" />
            <button className="button button-secondary" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="button button-primary" type="submit">Save amount</button>
          </footer>
        </form>
      </section>
    </div>
  );
}
