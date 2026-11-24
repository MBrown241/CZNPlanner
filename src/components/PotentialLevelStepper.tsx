import { useState } from "react";

type PotentialLevelStepperProps = {
  label: string;
  value: number;
  minimum?: number;
  maximum: number;
  disabled?: boolean;
  onChange: (nextValue: number) => void;
};

export function PotentialLevelStepper({
  label,
  value,
  minimum = 0,
  maximum,
  disabled = false,
  onChange,
}: PotentialLevelStepperProps) {
  const [inputValue, setInputValue] = useState(String(value));

  // Re-sync the text box when the level changes from outside (e.g. the +/- buttons).
  // Done during render instead of in an effect, per React's "adjusting state when a prop changes" pattern.
  const [syncedValue, setSyncedValue] = useState(value);
  if (value !== syncedValue) {
    setSyncedValue(value);
    setInputValue(String(value));
  }

  function updateFromInput(rawValue: string) {
    setInputValue(rawValue);
    if (rawValue === "") return;

    const parsedValue = Number(rawValue);
    if (!Number.isInteger(parsedValue)) return;

    const nextValue = Math.min(maximum, Math.max(minimum, parsedValue));
    onChange(nextValue);
    if (nextValue !== parsedValue) setInputValue(String(nextValue));
  }

  function restoreValidValue() {
    const parsedValue = Number(inputValue);
    if (inputValue === "" || !Number.isInteger(parsedValue)) {
      setInputValue(String(value));
      return;
    }

    const nextValue = Math.min(maximum, Math.max(minimum, parsedValue));
    setInputValue(String(nextValue));
    if (nextValue !== value) onChange(nextValue);
  }

  return (
    <div className="potential-stepper">
      <span>{label}</span>
      <div className="potential-stepper-controls">
        <button
          type="button"
          aria-label={`Decrease ${label.toLowerCase()} level`}
          disabled={disabled || value <= minimum}
          onClick={() => onChange(Math.max(minimum, value - 1))}
        >
          &minus;
        </button>
        <input
          type="number"
          min={minimum}
          max={maximum}
          step="1"
          value={inputValue}
          disabled={disabled}
          aria-label={`${label} level`}
          onChange={(event) => updateFromInput(event.currentTarget.value)}
          onBlur={restoreValidValue}
        />
        <button
          type="button"
          aria-label={`Increase ${label.toLowerCase()} level`}
          disabled={disabled || value >= maximum}
          onClick={() => onChange(Math.min(maximum, value + 1))}
        >
          +
        </button>
      </div>
    </div>
  );
}
