"use client";

import type { ApexOptions } from "apexcharts";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type {
    CategoryModeKey,
    LeaderboardMetricKey,
    SalesPerformanceApiFilters,
    SalesPerformanceResponse,
    SalesRepRow,
    TrendGranularityKey,
} from "@/lib/sales-performance";
import { getDefaultSalesPerformanceFilters } from "@/lib/sales-performance";

import { ApexChart } from "./ApexChart";
import { SalesChartCard } from "./SalesChartCard";
import { SalesKpiCard } from "./SalesKpiCard";
import { SalesPerformanceSkeleton } from "./SalesPerformanceSkeleton";

const defaultFilters: SalesPerformanceApiFilters = getDefaultSalesPerformanceFilters();

const metricLabels: Record<LeaderboardMetricKey, string> = {
    unitsSold: "Units",
    ordersClosed: "Orders",
    conversionRate: "Conversion",
    tryOnsAssisted: "Try-Ons",
};

const tableColumns: Array<{ key: keyof SalesRepRow; label: string }> = [
    { key: "unitsSold", label: "Units Sold" },
    { key: "ordersClosed", label: "Orders Closed" },
    { key: "conversionRate", label: "Conversion Rate" },
    { key: "tryOnsAssisted", label: "Try-Ons Assisted" },
    { key: "avgItemsPerOrder", label: "Avg Items / Order" },
];

function buildQueryString(filters: SalesPerformanceApiFilters) {
    const params = new URLSearchParams();
    params.set("startDate", filters.startDate);
    params.set("endDate", filters.endDate);
    if (filters.salespeople.length > 0) params.set("salespeople", filters.salespeople.join(","));
    if (filters.region && filters.region !== "All Branches") params.set("region", filters.region);
    if (filters.category && filters.category !== "All Categories") params.set("category", filters.category);
    if (filters.campaign && filters.campaign !== "All Campaigns") params.set("campaign", filters.campaign);
    return params.toString();
}

function formatMetricValue(metric: LeaderboardMetricKey, row: SalesRepRow) {
    if (metric === "conversionRate") return `${row.conversionRate.toFixed(1)}%`;
    return `${row[metric]}`;
}

function formatTableCell(key: keyof SalesRepRow, row: SalesRepRow) {
    const value = row[key];
    if (typeof value !== "number") return String(value);
    if (key === "conversionRate") return `${value.toFixed(1)}%`;
    if (key === "avgItemsPerOrder" || key === "customerRating") return value.toFixed(1);
    return `${value}`;
}

function getHeatmapTone(values: number[], value: number) {
    if (values.length === 0) return "bg-base-200 text-base-content";
    const sorted = [...values].sort((left, right) => left - right);
    const low = sorted[Math.floor((sorted.length - 1) * 0.33)] ?? sorted[0];
    const high = sorted[Math.floor((sorted.length - 1) * 0.66)] ?? sorted[sorted.length - 1];
    if (value >= high) return "bg-emerald-100 text-emerald-800";
    if (value >= low) return "bg-amber-100 text-amber-800";
    return "bg-rose-100 text-rose-800";
}

function buildLeaderboardChart(rows: SalesRepRow[], metric: LeaderboardMetricKey) {
    const sortedRows = [...rows].sort((left, right) => Number(right[metric]) - Number(left[metric]));
    const series: NonNullable<ApexOptions["series"]> = [
        {
            name: metricLabels[metric],
            data: sortedRows.map((row) => ({ x: row.name, y: Number(row[metric]) })),
        },
    ];

    const options: ApexOptions = {
        chart: {
            type: "bar",
            toolbar: { show: false },
            background: "transparent",
            foreColor: "#6b7280",
        },
        colors: ["#b68a3c"],
        plotOptions: {
            bar: {
                horizontal: true,
                barHeight: "68%",
                borderRadius: 8,
            },
        },
        dataLabels: { enabled: false },
        xaxis: {
            labels: {
                formatter: (value) => (metric === "conversionRate" ? `${Number(value).toFixed(0)}%` : `${value}`),
            },
        },
        yaxis: {
            labels: {
                style: { fontSize: "12px" },
            },
        },
        grid: {
            borderColor: "rgba(148, 163, 184, 0.18)",
            strokeDashArray: 4,
        },
        tooltip: {
            theme: "light",
            y: {
                formatter: (value) => (metric === "conversionRate" ? `${value.toFixed(1)}%` : `${value}`),
            },
        },
        legend: { show: false },
    };

    return { options, series };
}

function buildCategoryChart(items: SalesPerformanceResponse["categories"]["items"], mode: CategoryModeKey) {
    const valueKey = mode === "mostTried" ? "tryOns" : mode === "highestConversion" ? "conversionRate" : "unitsSold";
    const sortedItems = [...items].sort((left, right) => Number(right[valueKey]) - Number(left[valueKey]));
    const series: NonNullable<ApexOptions["series"]> = [
        {
            name: mode === "mostTried" ? "Try-Ons" : mode === "highestConversion" ? "Conversion Rate" : "Units Sold",
            data: sortedItems.map((item) => Number(item[valueKey])),
        },
    ];

    const options: ApexOptions = {
        chart: {
            type: "bar",
            toolbar: { show: false },
            background: "transparent",
        },
        colors: ["#0f766e"],
        plotOptions: {
            bar: {
                borderRadius: 10,
                columnWidth: "48%",
            },
        },
        xaxis: {
            categories: sortedItems.map((item) => item.category),
            labels: {
                style: { fontSize: "12px" },
            },
        },
        yaxis: {
            labels: {
                formatter: (value) => (valueKey === "conversionRate" ? `${value.toFixed(0)}%` : `${value}`),
            },
        },
        dataLabels: { enabled: false },
        tooltip: {
            y: {
                formatter: (value) => (valueKey === "conversionRate" ? `${value.toFixed(1)}%` : `${value}`),
            },
        },
        grid: {
            borderColor: "rgba(148, 163, 184, 0.18)",
            strokeDashArray: 4,
        },
        legend: { show: false },
    };

    return { options, series };
}

function buildTrendChart(points: SalesPerformanceResponse["trends"][TrendGranularityKey]) {
    const series: NonNullable<ApexOptions["series"]> = [
        {
            name: "Units Sold",
            type: "column",
            data: points.map((point) => point.unitsSold),
        },
        {
            name: "Conversion Rate",
            type: "line",
            data: points.map((point) => point.conversionRate),
        },
    ];

    const options: ApexOptions = {
        chart: {
            type: "line",
            toolbar: { show: false },
            background: "transparent",
        },
        stroke: {
            width: [0, 3],
            curve: "smooth",
        },
        colors: ["#d4a646", "#1d4ed8"],
        xaxis: {
            categories: points.map((point) => point.label),
            labels: { style: { fontSize: "12px" } },
        },
        yaxis: [
            {
                title: { text: "Units Sold" },
                labels: { formatter: (value) => `${Math.round(value)}` },
            },
            {
                opposite: true,
                title: { text: "Conversion Rate" },
                labels: { formatter: (value) => `${value.toFixed(0)}%` },
            },
        ],
        plotOptions: {
            bar: {
                borderRadius: 8,
                columnWidth: "46%",
            },
        },
        dataLabels: { enabled: false },
        grid: {
            borderColor: "rgba(148, 163, 184, 0.18)",
            strokeDashArray: 4,
        },
        tooltip: {
            shared: true,
            intersect: false,
            y: [{ formatter: (value) => `${value}` }, { formatter: (value) => `${value.toFixed(1)}%` }],
        },
    };

    return { options, series };
}

function buildComparisonBarChart(rows: SalesRepRow[]) {
    const candidates = [...rows].sort((left, right) => right.ordersClosed - left.ordersClosed).slice(0, 5);

    const series: NonNullable<ApexOptions["series"]> = [
        {
            name: "Assisted Sales",
            data: candidates.map((row) => ({ x: row.name, y: row.ordersClosed })),
        },
    ];

    const options: ApexOptions = {
        chart: {
            type: "bar",
            toolbar: { show: false },
            background: "transparent",
        },
        colors: ["#0f766e"],
        plotOptions: {
            bar: {
                horizontal: true,
                barHeight: "62%",
                borderRadius: 8,
            },
        },
        dataLabels: { enabled: false },
        xaxis: {
            labels: {
                formatter: (value) => `${Math.round(Number(value))}`,
            },
        },
        yaxis: {
            labels: { style: { fontSize: "12px" } },
        },
        grid: {
            borderColor: "rgba(148, 163, 184, 0.18)",
            strokeDashArray: 4,
        },
        tooltip: {
            shared: false,
            intersect: true,
            y: {
                formatter: (value) => `${Math.round(value)} sales`,
            },
        },
        legend: {
            show: false,
        },
    };

    return { options, series };
}

function ToggleGroup<T extends string>({ value, options, onChange }: { value: T; options: Array<{ key: T; label: string }>; onChange: (value: T) => void }) {
    return (
        <div className="flex flex-wrap gap-2">
            {options.map((option) => {
                const active = option.key === value;
                return (
                    <button
                        key={option.key}
                        type="button"
                        onClick={() => onChange(option.key)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                            active ? "bg-base-content text-base-100" : "border border-base-300 bg-base-100 text-base-content/70 hover:bg-base-200"
                        }`}>
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}

function FunnelVisualization({ stages }: { stages: SalesPerformanceResponse["funnel"]["stages"] }) {
    const baseline = stages[0]?.count || 1;

    return (
        <div className="space-y-3">
            {stages.map((stage, index) => {
                const width = `${Math.max(28, Math.round((stage.count / baseline) * 100))}%`;
                return (
                    <div key={stage.label} className="space-y-2">
                        <div className="flex items-center justify-between text-sm text-base-content/65">
                            <span className="font-medium text-base-content">
                                {index + 1}. {stage.label}
                            </span>
                            <span>
                                {stage.count} · Drop-off {stage.dropOffPct.toFixed(1)}%
                            </span>
                        </div>
                        <div className="h-11 rounded-xl bg-base-200 p-1">
                            <div
                                className="flex h-full items-center justify-between rounded-lg bg-base-content px-3 text-sm font-medium text-base-100"
                                style={{ width }}>
                                <span>{stage.label}</span>
                                <span>{stage.count}</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export const SalesPerformanceDashboard = () => {
    const [filters, setFilters] = useState<SalesPerformanceApiFilters>(defaultFilters);
    const [data, setData] = useState<SalesPerformanceResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [leaderboardMetric, setLeaderboardMetric] = useState<LeaderboardMetricKey>("unitsSold");
    const [categoryMode, setCategoryMode] = useState<CategoryModeKey>("mostSold");
    const [trendGranularity, setTrendGranularity] = useState<TrendGranularityKey>("weekly");
    const [sortKey, setSortKey] = useState<keyof SalesRepRow>("unitsSold");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const requestRef = useRef(0);

    const fetchDashboard = useCallback(async (nextFilters: SalesPerformanceApiFilters, showLoader: boolean) => {
        const requestId = requestRef.current + 1;
        requestRef.current = requestId;

        if (showLoader) setLoading(true);
        setError(null);

        try {
            const query = buildQueryString(nextFilters);
            const response = await fetch(`/api/sales-performance${query ? `?${query}` : ""}`, { cache: "no-store" });
            if (!response.ok) throw new Error("Could not load sales performance dashboard.");

            const payload = (await response.json()) as SalesPerformanceResponse;
            if (requestRef.current !== requestId) return;
            setFilters(payload.filters.applied);
            setData(payload);
        } catch (fetchError) {
            if (requestRef.current !== requestId) return;
            setError(fetchError instanceof Error ? fetchError.message : "Could not load sales performance dashboard.");
        } finally {
            if (requestRef.current === requestId) setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchDashboard(defaultFilters, false);
    }, [fetchDashboard]);

    const leaderboardRows = useMemo(() => {
        if (!data) return [];
        return [...data.leaderboard.rows].sort((left, right) => Number(right[leaderboardMetric]) - Number(left[leaderboardMetric]));
    }, [data, leaderboardMetric]);

    const sortedHeatmapRows = useMemo(() => {
        if (!data) return [];
        return [...data.heatmap.rows].sort((left, right) => {
            const leftValue = left[sortKey];
            const rightValue = right[sortKey];
            if (typeof leftValue === "number" && typeof rightValue === "number") {
                return sortDirection === "asc" ? leftValue - rightValue : rightValue - leftValue;
            }
            return sortDirection === "asc"
                ? String(leftValue).localeCompare(String(rightValue))
                : String(rightValue).localeCompare(String(leftValue));
        });
    }, [data, sortDirection, sortKey]);

    const leaderboardChart = useMemo(() => buildLeaderboardChart(leaderboardRows, leaderboardMetric), [leaderboardRows, leaderboardMetric]);
    const categoryChart = useMemo(() => (data ? buildCategoryChart(data.categories.items, categoryMode) : null), [data, categoryMode]);
    const trendChart = useMemo(() => (data ? buildTrendChart(data.trends[trendGranularity]) : null), [data, trendGranularity]);
    const comparisonChart = useMemo(() => (data ? buildComparisonBarChart(data.radar.reps) : null), [data]);
    const topPerformer = leaderboardRows[0];

    const exportCsv = useCallback(() => {
        // Export the current sorted, filter-scoped table so sales managers can reuse
        // the same comparison view in reviews and coaching sessions.
        if (sortedHeatmapRows.length === 0) return;

        const header = ["Salesperson", "Branch", "Units Sold", "Orders Closed", "Conversion Rate", "Try-Ons Assisted", "Avg Items / Order", "Customer Rating"];
        const lines = sortedHeatmapRows.map((row) => [
            row.name,
            row.region,
            row.unitsSold,
            row.ordersClosed,
            row.conversionRate.toFixed(1),
            row.tryOnsAssisted,
            row.avgItemsPerOrder.toFixed(1),
            row.customerRating.toFixed(1),
        ]);
        const csv = [header, ...lines]
            .map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
            .join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `sales-performance-${filters.startDate}-to-${filters.endDate}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }, [filters.endDate, filters.startDate, sortedHeatmapRows]);

    if (loading && !data) return <SalesPerformanceSkeleton />;

    if (error && !data) {
        return (
            <div className="mt-6 rounded-[28px] border border-rose-200 bg-rose-50 p-6 text-rose-700">
                <p className="text-xs font-semibold uppercase tracking-[0.24em]">Sales Performance</p>
                <h1 className="mt-2 text-2xl font-semibold">Dashboard unavailable</h1>
                <p className="mt-2 text-sm">{error}</p>
                <button type="button" className="btn btn-sm mt-4 rounded-full border-0 bg-rose-600 text-white" onClick={() => void fetchDashboard(filters, true)}>
                    Retry
                </button>
            </div>
        );
    }

    if (!data) return null;

    const tableMetricValues = tableColumns.reduce<Record<string, number[]>>((acc, column) => {
        acc[column.key] = sortedHeatmapRows.map((row) => Number(row[column.key]));
        return acc;
    }, {});

    return (
        <div className="mt-6 space-y-6 pb-8">
            <section className="space-y-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-sm uppercase tracking-wide text-base-content/50">Sales Performance</p>
                        <h1 className="mt-1 text-2xl font-semibold text-base-content md:text-3xl">Virtual Try-On sales dashboard</h1>
                        <p className="mt-2 max-w-2xl text-sm text-base-content/65">
                            Monitor units sold, conversion, category demand, and salesperson performance in one place.
                        </p>
                        <p className="mt-2 text-sm text-base-content/50">
                            Reporting window: {filters.startDate} to {filters.endDate}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        {topPerformer ? (
                            <div className="rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-sm text-base-content shadow-sm">
                                <span className="font-semibold">Top performer:</span> {topPerformer.name} · {formatMetricValue(leaderboardMetric, topPerformer)}
                            </div>
                        ) : null}
                        <button type="button" className="btn btn-sm rounded-lg border border-base-300 bg-base-100 text-base-content hover:bg-base-200" onClick={exportCsv}>
                            <span className="iconify lucide--download size-4" />
                            Export CSV
                        </button>
                    </div>
                </div>
            </section>

            {loading && data ? (
                <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Refreshing dashboard.</div>
            ) : null}
            {error && data ? <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

            {data.heatmap.rows.length === 0 ? (
                <section className="rounded-[28px] border border-base-200 bg-base-100 p-10 text-center shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/45">No data</p>
                    <h2 className="mt-3 text-2xl font-semibold text-base-content">No sales activity in the current reporting window</h2>
                    <p className="mt-2 text-sm text-base-content/65">Try again later or update the default reporting range in the dashboard configuration.</p>
                </section>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {data.kpis.map((metric) => (
                            <SalesKpiCard key={metric.key} metric={metric} />
                        ))}
                    </div>

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                        <SalesChartCard
                            title="Sales leaderboard"
                            description="Compare team performance by units, orders, conversion, or assisted try-ons."
                            action={<ToggleGroup value={leaderboardMetric} options={data.leaderboard.metrics} onChange={setLeaderboardMetric} />}
                            className="xl:col-span-7">
                            <ApexChart type="bar" height={340} options={leaderboardChart.options} series={leaderboardChart.series} />
                        </SalesChartCard>

                        <SalesChartCard title="Virtual try-on conversion funnel" description="Track where customer intent drops from try-on start to completed purchase." className="xl:col-span-5">
                            <FunnelVisualization stages={data.funnel.stages} />
                        </SalesChartCard>

                        <SalesChartCard
                            title="Jewellery category performance"
                            description="See which categories are tried most, convert best, and move the highest unit volume."
                            action={<ToggleGroup value={categoryMode} options={data.categories.modes} onChange={setCategoryMode} />}
                            className="xl:col-span-6">
                            {categoryChart ? <ApexChart type="bar" height={320} options={categoryChart.options} series={categoryChart.series} /> : null}
                        </SalesChartCard>

                        <SalesChartCard
                            title="Sales trend over time"
                            description="Switch between daily, weekly, and monthly views to spot momentum changes."
                            action={
                                <ToggleGroup
                                    value={trendGranularity}
                                    options={[
                                        { key: "daily", label: "Daily" },
                                        { key: "weekly", label: "Weekly" },
                                        { key: "monthly", label: "Monthly" },
                                    ]}
                                    onChange={setTrendGranularity}
                                />
                            }
                            className="xl:col-span-6">
                            {trendChart ? <ApexChart type="line" height={320} options={trendChart.options} series={trendChart.series} /> : null}
                        </SalesChartCard>

                        <SalesChartCard title="Top salesperson comparison" description="See how many virtual try-on assisted sales each leading salesperson closed." className="xl:col-span-5">
                            {comparisonChart ? <ApexChart type="bar" height={330} options={comparisonChart.options} series={comparisonChart.series} /> : null}
                        </SalesChartCard>

                        <SalesChartCard title="Top performers" description="Quick summary of the current leaders." className="xl:col-span-7">
                            <div className="overflow-hidden rounded-xl border border-base-300">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Salesperson</th>
                                            <th>Branch</th>
                                            <th>Units Sold</th>
                                            <th>Orders</th>
                                            <th>Conversion</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leaderboardRows.slice(0, 5).map((row) => (
                                            <tr key={row.id}>
                                                <td className="font-medium text-base-content">{row.name}</td>
                                                <td>{row.region}</td>
                                                <td>{row.unitsSold}</td>
                                                <td>{row.ordersClosed}</td>
                                                <td>{row.conversionRate.toFixed(1)}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </SalesChartCard>

                        <SalesChartCard
                            title="Performance heatmap table"
                            description="Sort any metric to identify coaching needs, strong closers, and consistent try-on support."
                            action={<button type="button" className="btn btn-sm rounded-lg border border-base-300 bg-base-100" onClick={exportCsv}><span className="iconify lucide--file-down size-4" />CSV</button>}
                            className="xl:col-span-12">
                            <div className="overflow-x-auto">
                                <table className="table table-zebra min-w-[920px]">
                                    <thead>
                                        <tr>
                                            <th>
                                                <button
                                                    type="button"
                                                    className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.2em] text-base-content/55"
                                                    onClick={() => {
                                                        setSortKey("name");
                                                        setSortDirection((current) => (sortKey === "name" && current === "desc" ? "asc" : "desc"));
                                                    }}>
                                                    Salesperson
                                                    <span className="iconify lucide--arrow-up-down size-3.5" />
                                                </button>
                                            </th>
                                            <th className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/55">Branch</th>
                                            {tableColumns.map((column) => (
                                                <th key={column.key}>
                                                    <button
                                                        type="button"
                                                        className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.2em] text-base-content/55"
                                                        onClick={() => {
                                                            setSortKey(column.key);
                                                            setSortDirection((current) => (sortKey === column.key && current === "desc" ? "asc" : "desc"));
                                                        }}>
                                                        {column.label}
                                                        <span className="iconify lucide--arrow-up-down size-3.5" />
                                                    </button>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedHeatmapRows.map((row) => (
                                            <tr key={row.id}>
                                                <td>
                                                    <div>
                                                        <p className="font-semibold text-base-content">{row.name}</p>
                                                        <p className="text-xs text-base-content/55">{row.totalCustomers} customers engaged</p>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="rounded-full bg-base-200 px-3 py-1 text-xs font-semibold text-base-content/70">{row.region}</span>
                                                </td>
                                                {tableColumns.map((column) => (
                                                    <td key={column.key}>
                                                        <span className={`inline-flex min-w-24 justify-center rounded-full px-3 py-1.5 text-sm font-semibold ${getHeatmapTone(tableMetricValues[column.key], Number(row[column.key]))}`}>
                                                            {formatTableCell(column.key, row)}
                                                        </span>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </SalesChartCard>
                    </div>
                </>
            )}
        </div>
    );
};
