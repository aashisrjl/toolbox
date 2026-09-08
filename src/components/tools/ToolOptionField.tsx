export type OptionField =
  | {
      kind: "select";
      name: string;
      label: string;
      options: { value: string; label: string }[];
    }
  | {
      kind: "number";
      name: string;
      label: string;
      min?: number;
      max?: number;
      placeholder?: string;
    }
  | {
      kind: "range";
      name: string;
      label: string;
      min: number;
      max: number;
      step?: number;
      suffix?: string;
    }
  | { kind: "toggle"; name: string; label: string };

interface Props {
  field: OptionField;
  value: string;
  onChange: (value: string) => void;
}

const inputClass =
  "w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary";

export function ToolOptionField({ field, value, onChange }: Props) {
  if (field.kind === "toggle") {
    return (
      <label className="flex cursor-pointer items-center gap-2.5 text-sm">
        <input
          type="checkbox"
          checked={value === "true"}
          onChange={(e) => onChange(String(e.target.checked))}
          className="h-4 w-4 accent-[var(--primary)]"
        />
        <span>{field.label}</span>
      </label>
    );
  }

  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {field.label}
        {field.kind === "range" && ` — ${value}${field.suffix ?? ""}`}
      </span>

      {field.kind === "select" && (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        >
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}

      {field.kind === "number" && (
        <input
          type="number"
          value={value}
          min={field.min}
          max={field.max}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      )}

      {field.kind === "range" && (
        <input
          type="range"
          value={value}
          min={field.min}
          max={field.max}
          step={field.step ?? 1}
          onChange={(e) => onChange(e.target.value)}
          className="w-full accent-[var(--primary)]"
        />
      )}
    </label>
  );
}
