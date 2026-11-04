import type { Page } from "../types";

type AppHeaderProps = {
  page: Page;
  onPageChange: (page: Page) => void;
};

export function AppHeader({ page, onPageChange }: AppHeaderProps) {
  return (
    <header className="topbar">
      <a className="brand" href="#planner" onClick={() => onPageChange("planner")}>
        <span className="brand-mark" aria-hidden="true">
          CZ
        </span>
        <span>
          <strong>CZN Planner</strong>
          <small>Upgrade planning workspace</small>
        </span>
      </a>
      <nav className="main-nav" aria-label="Main navigation">
        <button
          className={page === "planner" ? "nav-button active" : "nav-button"}
          type="button"
          onClick={() => onPageChange("planner")}
        >
          Planner
        </button>
        <button
          className={page === "inventory" ? "nav-button active" : "nav-button"}
          type="button"
          onClick={() => onPageChange("inventory")}
        >
          Inventory
        </button>
      </nav>
      <span className="data-badge">
        <span className="status-dot" /> Game data
      </span>
    </header>
  );
}
