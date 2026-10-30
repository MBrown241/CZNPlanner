import { useState } from "react";
import {
  manualCatalogItems,
  materialCatalogById,
  materialImageSource,
} from "../data/materials";
import type { MaterialRequirement } from "../types";

type MaterialsSummaryProps = {
  activePlanCount: number;
  requirements: MaterialRequirement[];
  onOpenInventoryItem: (materialId: string) => void;
};

const numberFormat = new Intl.NumberFormat();
type ManualTierId = "i" | "ii" | "iii";

function MaterialIcon({
  id,
  name,
  onOpenInventoryItem,
  onChooseClassManual,
  isComplete,
}: {
  id: string;
  name: string;
  onOpenInventoryItem?: () => void;
  onChooseClassManual?: () => void;
  isComplete: boolean;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const manualTier = id.match(/^class-manual-(i|ii|iii)(?:-|$)/)?.[1];
  const imageFile = materialCatalogById.get(id)?.image ??
    (manualTier ? `class-manual-${manualTier}-hunter.png` : undefined);
  const classTier = manualTier?.toUpperCase();

  const art = (
    <span className={`material-art${!imageFile || imageFailed ? " is-placeholder" : ""}${isComplete ? " is-complete" : ""}`}>
      {imageFile && !imageFailed ? (
        <img
          src={materialImageSource(imageFile)}
          alt=""
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span aria-hidden="true">{classTier ?? "?"}</span>
      )}
      {isComplete && (
        <span className="material-complete-check" role="img" aria-label="Enough in inventory">
          ✓
        </span>
      )}
      <span className="sr-only">{name}</span>
    </span>
  );

  const openAction = onOpenInventoryItem ?? onChooseClassManual;

  return openAction ? (
    <button
      className="requirement-tile-icon-button"
      type="button"
      onClick={openAction}
      aria-label={onChooseClassManual ? `Choose class for ${name}` : `Edit ${name} in inventory`}
      title={onChooseClassManual ? `Choose class for ${name}` : `Edit ${name} in inventory`}
    >
      {art}
    </button>
  ) : art;
}

function MaterialTile({
  item,
  onOpenInventoryItem,
  onChooseClassManual,
}: {
  item: MaterialRequirement;
  onOpenInventoryItem: (materialId: string) => void;
  onChooseClassManual: (tier: ManualTierId) => void;
}) {
  const manualTier = item.id.match(/^class-manual-(i|ii|iii)$/)?.[1] as ManualTierId | undefined;
  const countDescription = item.inventoryTracked
    ? `${numberFormat.format(item.remaining)} needed; ${numberFormat.format(item.owned)} owned of ${numberFormat.format(item.required)} total`
    : `${numberFormat.format(item.required)} needed; class-specific inventory not matched`;

  return (
    <article className="requirement-tile" role="group" aria-label={`${item.name}. ${countDescription}`} title={item.name}>
      <MaterialIcon
        id={item.id}
        name={item.name}
        onOpenInventoryItem={
          item.inventoryTracked && materialCatalogById.has(item.id)
            ? () => onOpenInventoryItem(item.id)
            : undefined
        }
        onChooseClassManual={manualTier ? () => onChooseClassManual(manualTier) : undefined}
        isComplete={item.inventoryTracked && item.remaining === 0}
      />
      <span className={`requirement-tile-needed${item.remaining === 0 ? " is-covered" : ""}`}>
        {item.inventoryTracked
          ? `${numberFormat.format(item.remaining)} needed`
          : `${numberFormat.format(item.required)} needed`}
      </span>
      <span className="requirement-tile-owned">
        {item.inventoryTracked
          ? `${numberFormat.format(item.owned)} owned / ${numberFormat.format(item.required)} total`
          : "Class match pending"}
      </span>
    </article>
  );
}

export function MaterialsSummary({
  activePlanCount,
  requirements,
  onOpenInventoryItem,
}: MaterialsSummaryProps) {
  const [manualTierToChoose, setManualTierToChoose] = useState<ManualTierId | null>(null);
  const manualTierNames: Record<ManualTierId, string> = {
    i: "Common",
    ii: "Advanced",
    iii: "Premium",
  };

  return (
    <>
    <aside className="panel materials-panel" aria-labelledby="materials-heading">
      <div className="panel-heading">
        <div>
          <h2 id="materials-heading">Materials needed</h2>
        </div>
        <span className="material-symbol" aria-hidden="true">
          &#9671;
        </span>
      </div>

      {requirements.length === 0 ? (
        <div className="requirements-empty">
          <div className="requirements-art" aria-hidden="true">
            &#9671;
          </div>
          <h3>{activePlanCount === 0 ? "No active plans" : "No upgrades planned"}</h3>
          <p>
            {activePlanCount === 0
              ? "Turn on a character plan to include it in these totals."
              : "Set a target level above the current level to calculate costs."}
          </p>
        </div>
      ) : (
        <div className="requirements-grid">
          {requirements.map((item) => (
            <MaterialTile
              key={item.id}
              item={item}
              onOpenInventoryItem={onOpenInventoryItem}
              onChooseClassManual={setManualTierToChoose}
            />
          ))}
        </div>
      )}
    </aside>
    {manualTierToChoose && (
      <div
        className="inventory-modal-backdrop"
        role="presentation"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) setManualTierToChoose(null);
        }}
      >
        <section
          className="inventory-amount-dialog inventory-manual-picker-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="manual-picker-title"
        >
          <header className="inventory-amount-header">
            <h2 id="manual-picker-title">Choose a class for the {manualTierNames[manualTierToChoose]} Manual</h2>
            <button
              className="icon-button inventory-dialog-close"
              type="button"
              onClick={() => setManualTierToChoose(null)}
              aria-label="Close class picker"
            >
              ×
            </button>
          </header>
          <div className="inventory-manual-picker-grid">
            {manualCatalogItems
              .filter((material) => material.id.startsWith(`class-manual-${manualTierToChoose}-`))
              .map((material) => (
                <button
                  className="inventory-material-tile"
                  key={material.id}
                  type="button"
                  onClick={() => {
                    setManualTierToChoose(null);
                    onOpenInventoryItem(material.id);
                  }}
                >
                  <span className="inventory-material-image">
                    {material.image && <img src={materialImageSource(material.image)} alt="" />}
                  </span>
                  <strong className="inventory-material-name">{material.name}</strong>
                </button>
              ))}
          </div>
        </section>
      </div>
    )}
    </>
  );
}
