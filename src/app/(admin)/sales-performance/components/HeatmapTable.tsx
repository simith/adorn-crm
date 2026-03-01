"use client";

import { useState } from "react";

import type { SalesPerformanceTableRow } from "@/lib/sales-performance";

type SortKey = "salespersonName" | "region" | "unitsSold" | "ordersClosed" | "conversionRate" | "tryOnsAssisted" | "avgItemsPerOrder";

type HeatmapTableProps = {
    rows: SalesPerformanceTableRow[];
};

function formatMetric(key: SortKey, value: string | number) {
    if (typeof value === "string") {
        return value;
    }

    if (key === "conversionRate") {
        return `${value.toFixed(1)}%`;
    }

    if (key === "avgItemsPerOrder") {
        return value.toFixed(1);
    }

    return value.toLocaleString("en-IN");
}

function heatColor(scale: number) {
    const safeScale = Math.min(1, Math.max(0, scale));
    const hue = safeScale * 120;
    return `hsl(${hue}, 66%, 86%)`;
}

export const HeatmapTable = ({ rows }: HeatmapTableProps) => {
    const [sortKey, setSortKey] = useState<SortKey>("unitsSold");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

    const metricKeys: SortKey[] = ["unitsSold", "ordersClosed", "conversionRate", "tryOnsAssisted", "avgItemsPerOrder"];

    const sortedRows = [...rows].sort((left, right) => {
        const leftValue = left[sortKey];
        const rightValue = right[sortKey];

        if (typeof leftValue === "string" && typeof rightValue === "string") {
            return sortDirection === "asc" ? leftValue.localeCompare(rightValue) : rightValue.localeCompare(leftValue);
        }

        const normalizedLeft = Number(leftValue);
        const normalizedRight = Number(rightValue);
        return sortDirection === "asc" ? normalizedLeft - normalizedRight : normalizedRight - normalizedLeft;
    });

    const ranges = metricKeys.reduce<Record<SortKey, { min: number; max: number }>>(
        (accumulator, key) => {
            const values = rows.map((row) => Number(row[key]));
            accumulator[key] = {
                min: Math.min(...values),
                max: Math.max(...values),
            };
            return accumulator;
        },
        {
            salespersonName: { min: 0, max: 0 },
            region: { min: 0, max: 0 },
            unitsSold: { min: 0, max: 0 },
            ordersClosed: { min: 0, max: 0 },
            conversionRate: { min: 0, max: 0 },
            tryOnsAssisted: { min: 0, max: 0 },
            avgItemsPerOrder: { min: 0, max: 0 },
        },
    );

    const columns: Array<{ key: SortKey; label: string }> = [
        { key: "salespersonName", label: "Salesperson" },
        { key: "region", label: "Region" },
        { key: "unitsSold", label: "Units Sold" },
        { key: "ordersClosed", label: "Orders Closed" },
        { key: "conversionRate", label: "Conversion Rate" },
        { key: "tryOnsAssisted", label: "Try-Ons Assisted" },
        { key: "avgItemsPerOrder", label: "Avg Items / Order" },
    ];

    return (
        <div className="overflow-hidden rounded-[22px] border border-[#eee4d6]">
            <div className="overflow-x-auto">
                <table className="table table-pin-rows">
                    <thead className="bg-[#fff8ed] text-[#6f614b]">
                        <tr>
                            {columns.map((column) => {
                                const isActive = column.key === sortKey;
                                const icon =
                                    !isActive ? "lucide--arrow-up-down" : sortDirection === "desc" ? "lucide--arrow-down" : "lucide--arrow-up";

                                return (
                                    <th key={column.key}>
                                        <button
                                            type="button"
                                            className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] ${
                                                isActive ? "text-[#1f4f3b]" : "text-[#7b6a50]"
                                            }`}
                                            onClick={() => {
                                                if (isActive) {
                                                    setSortDirection(sortDirection === "desc" ? "asc" : "desc");
                                                    return;
                                                }
                                                setSortKey(column.key);
                                                setSortDirection(column.key === "salespersonName" || column.key === "region" ? "asc" : "desc");
                                            }}>
                                            {column.label}
                                            <span className={`iconify ${icon} size-3.5`} />
                                        </button>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedRows.map((row) => (
                            <tr key={row.salespersonId} className="hover">
                                <td className="min-w-48">
                                    <div>
                                        <p className="font-medium text-[#2f2618]">{row.salespersonName}</p>
                                        <p className="text-xs text-[#86775e]">{row.customerRating.toFixed(1)} rating</p>
                                    </div>
                                </td>
                                <td className="text-[#645640]">{row.region}</td>
                                {metricKeys.map((key) => {
                                    const range = ranges[key];
                                    const value = Number(row[key]);
                                    const scale =
                                        range.max === range.min
                                            ? 1
                                            : (value - range.min) / Math.max(1, range.max - range.min);

                                    return (
                                        <td key={key}>
                                            <div
                                                className="rounded-2xl px-3 py-2 text-right font-medium text-[#2f2618]"
                                                style={{ backgroundColor: heatColor(scale) }}>
                                                {formatMetric(key, value)}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
