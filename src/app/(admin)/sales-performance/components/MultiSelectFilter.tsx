"use client";

type MultiSelectFilterProps = {
    label: string;
    options: string[];
    value: string[];
    onChange: (value: string[]) => void;
};

export const MultiSelectFilter = ({ label, options, value, onChange }: MultiSelectFilterProps) => {
    const summary = value.length === 0 ? "All salespeople" : `${value.length} selected`;

    return (
        <details className="dropdown w-full">
            <summary className="flex min-h-[72px] cursor-pointer list-none items-center justify-between rounded-xl border border-base-300 bg-base-100 px-4 py-3 text-sm font-medium text-base-content">
                <div>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-base-content/45">{label}</p>
                    <p className="mt-1 text-sm text-base-content">{summary}</p>
                </div>
                <span className="iconify lucide--chevrons-up-down size-4 text-base-content/45" />
            </summary>
            <div className="dropdown-content z-[1] rounded-xl border border-base-300 bg-base-100 p-2 shadow-lg">
                <div className="max-h-64 w-72 overflow-auto p-1">
                    {options.map((option) => {
                        const checked = value.includes(option);
                        return (
                            <label key={option} className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 hover:bg-base-200/60">
                                <span className="text-sm text-base-content">{option}</span>
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-sm checkbox-warning"
                                    checked={checked}
                                    onChange={(event) => {
                                        if (event.target.checked) {
                                            onChange([...value, option]);
                                            return;
                                        }

                                        onChange(value.filter((entry) => entry !== option));
                                    }}
                                />
                            </label>
                        );
                    })}
                </div>
            </div>
        </details>
    );
};
