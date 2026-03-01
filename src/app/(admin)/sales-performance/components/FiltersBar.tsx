"use client";

import type { SalesPerformanceFilters, SalesPerformanceOption, SalesPerformanceSalesperson } from "@/lib/sales-performance";

type FiltersBarProps = {
    filters: SalesPerformanceFilters;
    salespeople: SalesPerformanceSalesperson[];
    regions: SalesPerformanceOption[];
    categories: SalesPerformanceOption[];
    campaigns: SalesPerformanceOption[];
    onChange(next: SalesPerformanceFilters): void;
    onReset(): void;
};

type FilterSelectProps = {
    label: string;
    value: string;
    options: SalesPerformanceOption[];
    onChange(value: string): void;
};

const FilterSelect = ({ label, value, options, onChange }: FilterSelectProps) => {
    return (
        <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#877863]">{label}</span>
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="select h-12 rounded-2xl border border-[#e8e0d1] bg-[#fffdf8] text-sm text-[#2f2618] shadow-none outline-none focus:border-[#bea36e]">
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </label>
    );
};

export const FiltersBar = ({
    filters,
    salespeople,
    regions,
    categories,
    campaigns,
    onChange,
    onReset,
}: FiltersBarProps) => {
    const selectedCount = filters.salespeople.length;

    return (
        <section className="rounded-[30px] border border-[#eadfcd] bg-gradient-to-r from-[#fffaf1] via-white to-[#f6f8ef] p-5 shadow-[0_20px_45px_rgba(61,44,18,0.08)]">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8b7b63]">Sales Performance</p>
                    <h1 className="mt-2 text-2xl font-semibold text-[#2f2618] md:text-3xl">Virtual try-on sales dashboard</h1>
                    <p className="mt-2 max-w-3xl text-sm text-[#73654f]">
                        Monitor units sold, conversion, category performance, and funnel drop-offs across regions and sales reps.
                    </p>
                </div>
                <button
                    type="button"
                    className="btn h-11 rounded-2xl border-0 bg-[#214f3c] px-5 text-white shadow-none hover:bg-[#17392b]"
                    onClick={onReset}>
                    Reset Filters
                </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
                <label className="flex flex-col gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#877863]">Date From</span>
                    <input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(event) => onChange({ ...filters, dateFrom: event.target.value })}
                        className="input h-12 rounded-2xl border border-[#e8e0d1] bg-[#fffdf8] text-sm text-[#2f2618] shadow-none outline-none focus:border-[#bea36e]"
                    />
                </label>

                <label className="flex flex-col gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#877863]">Date To</span>
                    <input
                        type="date"
                        value={filters.dateTo}
                        onChange={(event) => onChange({ ...filters, dateTo: event.target.value })}
                        className="input h-12 rounded-2xl border border-[#e8e0d1] bg-[#fffdf8] text-sm text-[#2f2618] shadow-none outline-none focus:border-[#bea36e]"
                    />
                </label>

                <label className="flex flex-col gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#877863]">Salesperson</span>
                    <details className="dropdown">
                        <summary className="flex h-12 cursor-pointer list-none items-center justify-between rounded-2xl border border-[#e8e0d1] bg-[#fffdf8] px-4 text-sm text-[#2f2618]">
                            <span>{selectedCount > 0 ? `${selectedCount} selected` : "All salespeople"}</span>
                            <span className="iconify lucide--chevrons-up-down size-4 text-[#8c7a60]" />
                        </summary>
                        <div className="dropdown-content z-20 mt-2 w-full min-w-[16rem] rounded-2xl border border-[#eadfcd] bg-white p-3 shadow-xl">
                            <div className="max-h-64 space-y-2 overflow-auto pr-1">
                                {salespeople.map((salesperson) => {
                                    const checked = filters.salespeople.includes(salesperson.id);
                                    return (
                                        <label
                                            key={salesperson.id}
                                            className="flex items-center justify-between gap-3 rounded-2xl bg-[#fffaf1] px-3 py-2 text-sm text-[#2f2618]">
                                            <div>
                                                <p className="font-medium">{salesperson.name}</p>
                                                <p className="text-xs text-[#86775e]">{salesperson.region}</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="checkbox checkbox-sm border-[#cab389] [--chkbg:#214f3c] [--chkfg:white]"
                                                checked={checked}
                                                onChange={() => {
                                                    const nextSalespeople = checked
                                                        ? filters.salespeople.filter((value) => value !== salesperson.id)
                                                        : [...filters.salespeople, salesperson.id];
                                                    onChange({ ...filters, salespeople: nextSalespeople });
                                                }}
                                            />
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </details>
                </label>

                <FilterSelect
                    label="Region"
                    value={filters.region}
                    options={regions}
                    onChange={(value) => onChange({ ...filters, region: value })}
                />

                <FilterSelect
                    label="Jewellery Category"
                    value={filters.category}
                    options={categories}
                    onChange={(value) => onChange({ ...filters, category: value })}
                />

                <FilterSelect
                    label="Campaign"
                    value={filters.campaign}
                    options={campaigns}
                    onChange={(value) => onChange({ ...filters, campaign: value })}
                />
            </div>
        </section>
    );
};
