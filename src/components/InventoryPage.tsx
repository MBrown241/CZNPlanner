import { useEffect, useState } from "react";
import { materialCatalog, materialCatalogById, materialImageSource } from "../data/materials";
import type { InventoryItem } from "../types";
import { InventoryAmountDialog } from "./InventoryAmountDialog";

type InventoryPageProps = {
  inventory: InventoryItem[];
  onAddItem: (item: InventoryItem) => boolean;
  onUpdateQuantity: (materialId: string, quantity: number) => void;
  onRemoveItem: (materialId: string) => void;
  onClearInventory: () => void;
};

const numberFormat = new Intl.NumberFormat();
const catalogGroups = ["Battle Memories", "Class Manuals", "Potential Materials"] as const;

function InventoryMaterialTile({
  materialId,
  name,
  image,
  owned,
  onClick,
}: {
  materialId: string;
  name: string;
  image?: string;
  owned: number;
  onClick: () => void;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const showImage = Boolean(image) && !imageFailed;

  return (
    <button
      className={`inventory-material-tile${owned > 0 ? " has-amount" : ""}`}
      type="button"
      onClick={onClick}
      aria-label={`${name}: ${numberFormat.format(owned)} owned. Edit amount.`}
      title={`Edit ${name}`}
    >
      <span className={`inventory-material-image${!showImage ? " is-placeholder" : !imageLoaded ? " is-loading" : ""}`}>
        {showImage && (
          <img
            src={materialImageSource(image)}
            alt=""
            loading={image?.startsWith("https://") ? "lazy" : "eager"}
            decoding="async"
            className={imageLoaded ? "is-loaded" : ""}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageFailed(true)}
          />
        )}
        {(!showImage || !imageLoaded) && (
          <span aria-hidden="true">◇</span>
        )}
      </span>
      <strong className="inventory-material-name">{name}</strong>
      <span className="inventory-material-owned">{numberFormat.format(owned)} owned</span>
      <span className="visually-hidden">Material ID: {materialId}</span>
    </button>
  );
}

export function InventoryPage({
  inventory,
  onAddItem,
  onUpdateQuantity,
  onRemoveItem,
  onClearInventory,
}: InventoryPageProps) {
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const ownedById = new Map(inventory.map((item) => [item.materialId, item.owned]));

  useEffect(() => {
    if (!confirmClear) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setConfirmClear(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [confirmClear]);

  function openEditor(materialId: string) {
    setEditingMaterialId(materialId);
  }

  return (
    <main className="page-content">
      <div className="page-heading">
        <div>
          <h1>Material inventory</h1>
          <p className="page-description">
            Click a material to enter how many you own. Totals update across active plans.
          </p>
        </div>
        <span className="data-badge inventory-badge">
          <span className="status-dot" /> Saved in this browser
        </span>
      </div>

      <section className="panel inventory-panel" aria-labelledby="inventory-heading">
        <div className="panel-heading inventory-panel-heading">
          <div>
            <h2 id="inventory-heading">Shared inventory</h2>
          </div>
          <div className="inventory-panel-actions">
            <button
              className="button button-danger"
              type="button"
              disabled={inventory.length === 0}
              onClick={() => setConfirmClear(true)}
            >
              Clear inventory
            </button>
          </div>
        </div>

        {inventory.length === 0 && (
          <p className="inventory-empty-hint">No amounts entered yet. Select any material to get started.</p>
        )}

        <div className="inventory-material-groups">
          {catalogGroups.map((category) => {
            const materials = materialCatalog.filter((material) => material.category === category);
            const headingId = `inventory-${category.toLowerCase().replaceAll(" ", "-")}`;
            return (
              <section className="inventory-material-group" key={category} aria-labelledby={headingId}>
                <h3 id={headingId}>{category}</h3>
                <div className="inventory-material-grid">
                  {materials.map((material) => (
                    <InventoryMaterialTile
                      key={material.id}
                      materialId={material.id}
                      name={material.name}
                      image={material.image}
                      owned={ownedById.get(material.id) ?? 0}
                      onClick={() => openEditor(material.id)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {inventory.some((item) => !materialCatalogById.has(item.materialId)) && (
          <section className="inventory-material-group" aria-labelledby="inventory-other-heading">
            <h3 id="inventory-other-heading">Other saved materials</h3>
            <div className="inventory-material-grid">
              {inventory
                .filter((item) => !materialCatalogById.has(item.materialId))
                .map((item) => (
                  <InventoryMaterialTile
                    key={item.materialId}
                    materialId={item.materialId}
                    name={item.name}
                    owned={item.owned}
                    onClick={() => openEditor(item.materialId)}
                  />
                ))}
            </div>
          </section>
        )}
      </section>

      {editingMaterialId && (
        <InventoryAmountDialog
          materialId={editingMaterialId}
          inventory={inventory}
          onAddItem={onAddItem}
          onUpdateQuantity={onUpdateQuantity}
          onRemoveItem={onRemoveItem}
          onClose={() => setEditingMaterialId(null)}
        />
      )}

      {confirmClear && (
        <div
          className="inventory-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setConfirmClear(false);
          }}
        >
          <section
            className="inventory-amount-dialog inventory-clear-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="clear-inventory-title"
            aria-describedby="clear-inventory-description"
          >
            <header className="inventory-amount-header">
              <h2 id="clear-inventory-title">Clear all inventory?</h2>
              <button
                className="icon-button inventory-dialog-close"
                type="button"
                onClick={() => setConfirmClear(false)}
                aria-label="Close confirmation"
              >
                ×
              </button>
            </header>
            <p id="clear-inventory-description" className="inventory-clear-description">
              This will delete all {inventory.length} saved material amounts. This cannot be undone.
            </p>
            <footer className="inventory-amount-actions">
              <span className="inventory-amount-spacer" />
              <button className="button button-secondary" type="button" onClick={() => setConfirmClear(false)}>
                Cancel
              </button>
              <button
                className="button button-danger"
                type="button"
                onClick={() => {
                  onClearInventory();
                  setConfirmClear(false);
                }}
              >
                Yes, clear inventory
              </button>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}
