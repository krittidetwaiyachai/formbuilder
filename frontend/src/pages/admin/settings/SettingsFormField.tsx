interface SettingsFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}

export function SettingsField({ label, value, onChange, type = "text", placeholder }: SettingsFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-gray-50/50 focus:bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-100 outline-none transition-all"
      />
    </div>
  );
}

interface SettingsCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export function SettingsCheckbox({ checked, onChange, label }: SettingsCheckboxProps) {
  return (
    <label className="inline-flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-200"
      />
      {label}
    </label>
  );
}

interface ActionButtonProps {
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
  loadingLabel: string;
  label: string;
  variant?: "primary" | "secondary";
}

export function ActionButton({ onClick, disabled, loading, loadingLabel, label, variant = "primary" }: ActionButtonProps) {
  const baseClass = "px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all";
  const variantClass = variant === "primary"
    ? "bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98]"
    : "border border-gray-200 text-gray-700 hover:bg-gray-50";

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseClass} ${variantClass}`}>
      {loading ? loadingLabel : label}
    </button>
  );
}
