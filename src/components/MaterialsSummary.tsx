import { useState } from "react";
import type { MaterialRequirement } from "../types";

type MaterialsSummaryProps = {
  activePlanCount: number;
  requirements: MaterialRequirement[];
  onManageInventory: () => void;
};

const numberFormat = new Intl.NumberFormat();

const materialIconFiles: Record<string, string> = {
  "xp-gray": "xp-gray.png",
  "xp-blue": "xp-blue.png",
  "xp-gold": "xp-gold.png",
  credits: "credits.png",
  "growth-common-justice": "growth-common-justice.png",
  "growth-great-justice": "growth-great-justice.png",
  "growth-premium-justice": "growth-premium-justice.png",
  "growth-common-void": "growth-common-void.png",
  "growth-great-void": "growth-great-void.png",
  "growth-premium-void": "growth-premium-void.png",
  "eye-of-wailing-prodigal": "eye-of-wailing-prodigal.png",
  "shards-of-condemnation": "shards-of-condemnation.png",
  "undetermined-ego-crystal": "undetermined-ego-crystal.png",
};

function shortMaterialName(id: string, name: string) {
  const shortNames: Record<string, string> = {
    "xp-gray": "Gray XP",
    "xp-blue": "Blue XP",
    "xp-gold": "Gold XP",
    "class-manual-i": "Class Manual I",
    "class-manual-ii": "Class Manual II",
    "class-manual-iii": "Class Manual III",
    credits: "Units",
    "eye-of-wailing-prodigal": "Wailing Eye",
    "shards-of-condemnation": "Judas Shards",
    "undetermined-ego-crystal": "Ego Crystal",
  };
  if (shortNames[id]) return shortNames[id];

  const growthStone = name.match(/^(Common|Great|Premium) Growth Stone of (?:the )?(.+)$/);
  if (growthStone) return `${growthStone[1]} ${growthStone[2]} Stone`;
  return name;
}

function MaterialIcon({ id, name }: { id: string; name: string }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageFile = materialIconFiles[id];
  const classTier = id === "class-manual-i" ? "I" : id === "class-manual-ii" ? "II" : "III";

  return (
    <span className={`material-art${!imageFile || imageFailed ? " is-placeholder" : ""}`}>
      {imageFile && !imageFailed ? (
        <img
          src={`/images/materials/${imageFile}`}
          alt=""
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span aria-hidden="true">{id.startsWith("class-manual-") ? classTier : "?"}</span>
      )}
      <span className="sr-only">{name}</span>
    </span>
  );
}

function MaterialTile({ item }: { item: MaterialRequirement }) {
  const shortName = shortMaterialName(item.id, item.name);
  const countDescription = item.inventoryTracked
    ? `${numberFormat.format(item.remaining)} needed; ${numberFormat.format(item.owned)} owned of ${numberFormat.format(item.required)} total`
    : `${numberFormat.format(item.required)} needed; class-specific inventory not matched`;

  return (
    <article className="requirement-tile" role="group" aria-label={`${item.name}. ${countDescription}`} title={item.name}>
      <MaterialIcon id={item.id} name={item.name} />
      <strong className="requirement-tile-name">{shortName}</strong>
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
  onManageInventory,
}: MaterialsSummaryProps) {
  return (
    <aside className="panel materials-panel" aria-labelledby="materials-heading">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">SHARED REQUIREMENTS</p>
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
        <>
          <div className="requirements-grid">
            {requirements.map((item) => (
              <MaterialTile key={item.id} item={item} />
            ))}
          </div>
          <p className="requirements-note">
            XP manuals use the fewest manuals possible. Class Manual I, II, and III totals
            are combined across the demo roster; class matching is pending.
          </p>
        </>
      )}

      <div className="requirements-footnote">
        <span className="status-dot amber-dot" />
        {activePlanCount} active {activePlanCount === 1 ? "plan" : "plans"} included
      </div>
      <button
        className="text-button inventory-link"
        type="button"
        onClick={onManageInventory}
      >
        Manage shared inventory <span aria-hidden="true">&#8594;</span>
      </button>
    </aside>
  );
}
