type PotentialLevelStepperProps = {
  label: string;
  value: number;
  minimum?: number;
  maximum: number;
  valueText?: string;
  onChange: (nextValue: number) => void;
};

export function PotentialLevelStepper({
  label,
  value,
  minimum = 0,
  maximum,
  valueText,
  onChange,
}: PotentialLevelStepperProps) {
  return (
    <div className="potential-stepper">
      <span>{label}</span>
      <div className="potential-stepper-controls">
        <button
          type="button"
          aria-label={`Decrease ${label.toLowerCase()} level`}
          disabled={value <= minimum}
          onClick={() => onChange(Math.max(minimum, value - 1))}
        >
          &minus;
        </button>
        <output aria-live="polite">{valueText ?? value}</output>
        <button
          type="button"
          aria-label={`Increase ${label.toLowerCase()} level`}
          disabled={value >= maximum}
          onClick={() => onChange(Math.min(maximum, value + 1))}
        >
          +
        </button>
      </div>
    </div>
  );
}
