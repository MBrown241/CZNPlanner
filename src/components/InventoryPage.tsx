import { useState } from "react";
import type { FormEvent } from "react";
import type { InventoryItem } from "../types";

type InventoryPageProps = {
  inventory: InventoryItem[];
  onAddItem: (item: InventoryItem) => boolean;
  onUpdateQuantity: (materialId: string, quantity: number) => void;
  onRemoveItem: (materialId: string) => void;
};

export function InventoryPage({
  inventory,
  onAddItem,
  onUpdateQuantity,
  onRemoveItem,
}: InventoryPageProps) {
  const [materialName, setMaterialName] = useState("");
  const [materialId, setMaterialId] = useState("");
  const [materialQuantity, setMaterialQuantity] = useState("0");
  const [inventoryError, setInventoryError] = useState("");

  function addInventoryItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = materialName.trim();
    const cleanId = materialId.trim();
    const quantity = Number(materialQuantity);

    if (!cleanName || !cleanId || !Number.isFinite(quantity) || quantity < 0) {
      setInventoryError("Enter a name, ID, and valid quantity.");
      return;
    }

    const added = onAddItem({
      materialId: cleanId,
      name: cleanName,
      owned: Math.floor(quantity),
    });
    if (!added) {
      setInventoryError("That material ID is already in your inventory.");
      return;
    }

    setMaterialName("");
    setMaterialId("");
    setMaterialQuantity("0");
    setInventoryError("");
  }

  return (
    <main className="page-content">
      <div className="page-heading">
        <div>
          <h1>Material inventory</h1>
          <p className="page-description">
            Track owned quantities in one place for all your character plans.
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
          <span className="count-pill">{inventory.length} items</span>
        </div>

        <div className="notice-box">
          <span className="notice-icon" aria-hidden="true">
            i
          </span>
          <p>
            Use IDs <code>credits</code>, <code>xp-gray</code>, <code>xp-blue</code>, or{" "}
            <code>xp-gold</code> for automatic totals. Potential IDs follow{" "}
            <code>growth-[common|great|premium]-[passion|instinct|order|justice|void]</code>,
            plus <code>eye-of-wailing-prodigal</code>, <code>shards-of-condemnation</code>,
            and <code>undetermined-ego-crystal</code>.
          </p>
        </div>

        <form className="inventory-form" onSubmit={addInventoryItem}>
          <label>
            <span>Material name</span>
            <input
              value={materialName}
              onChange={(event) => setMaterialName(event.target.value)}
              placeholder="e.g. Sample material"
              required
            />
          </label>
          <label>
            <span>Material ID</span>
            <input
              value={materialId}
              onChange={(event) => setMaterialId(event.target.value)}
              placeholder="e.g. sample-material-1"
              required
            />
          </label>
          <label className="quantity-input">
            <span>Owned</span>
            <input
              type="number"
              min="0"
              step="1"
              value={materialQuantity}
              onChange={(event) => setMaterialQuantity(event.target.value)}
              required
            />
          </label>
          <button className="button button-primary inventory-add-button" type="submit">
            Add material
          </button>
        </form>

        {inventoryError && (
          <p className="form-error" role="alert">
            {inventoryError}
          </p>
        )}

        {inventory.length === 0 ? (
          <div className="inventory-empty">
            <span className="empty-icon" aria-hidden="true">
              ◈
            </span>
            <h3>No inventory items</h3>
            <p>Add a material and the quantity you currently own.</p>
          </div>
        ) : (
          <div className="inventory-table-wrap">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th scope="col">Material</th>
                  <th scope="col">ID</th>
                  <th scope="col">Owned</th>
                  <th scope="col">
                    <span className="visually-hidden">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.materialId}>
                    <th scope="row">{item.name}</th>
                    <td>
                      <code>{item.materialId}</code>
                    </td>
                    <td>
                      <label
                        className="visually-hidden"
                        htmlFor={"owned-" + item.materialId}
                      >
                        Owned quantity for {item.name}
                      </label>
                      <input
                        id={"owned-" + item.materialId}
                        className="owned-input"
                        type="number"
                        min="0"
                        step="1"
                        value={item.owned}
                        onChange={(event) =>
                          onUpdateQuantity(item.materialId, Number(event.target.value))
                        }
                      />
                    </td>
                    <td className="table-action-cell">
                      <button
                        className="text-button danger-text"
                        type="button"
                        onClick={() => onRemoveItem(item.materialId)}
                        aria-label={"Remove " + item.name}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
