"use client";

import type { ApexOptions } from "apexcharts";
import { useEffect, useState } from "react";

import { PageTitle } from "@/components/PageTitle";
import {
    DEFAULT_SALES_PERFORMANCE_FILTERS,
    type SalesPerformanceCategoryRow,
    type SalesPerformanceFilters,
    type SalesPerformanceRadarRow,
    type SalesPerformanceResponse,
} from "@/lib/sales-performance";

import { ApexChart } from "./components/ApexChart";
import { ChartCard } from "./components/ChartCard";
import { FiltersBar } from "./components/FiltersBar";
import { HeatmapTable } from "./components/HeatmapTable";
import { KpiCard } from "./components/KpiCard";

type LeaderboardMetricKey = "unitsSold" | "ordersClosed" | "conversionRate" | "tryOnsAssisted";
type CategoryMode = "sold" | "tried" | "conversion";
type TrendGranularity = "daily" | "weekly" | "monthly";

const leaderboardMetricMeta: Record<LeaderboardMetricKey, { label: string; color: string; formatter(value: number): string }> = {
    unitsSold: {
        label: "Units Sold",
        color: "#214f3c",
        formatter: (value) => value.toLocaleString("en-IN"),
    },
    ordersClosed: {
        label: "Orders Closed",
        color: "#9c6b1f",
        formatter: (value) => value.toLocaleString("en-IN"),
    },
    conversionRate: {
        label: "Conversion Rate",
        color: "#0f766e",
        formatter: (value) => `${value.toFixed(1)}%`,
    },
    tryOnsAssisted: {
        label: "Try-Ons Assisted",
        color: "#8a5a44",
        formatter: (value) => value.toLocaleString("en-IN"),
    },
};

function chartBaseOptions(): ApexOptions {
    return {
        chart: {
            fontFamily: "inherit",
            toolbar: { show: false },
            animations: { easing: "easeinout", speed: 550 },
        },
        legend: {
            position: "top",
            horizontalAlign: "left",
            labels: { colors: "#665a45" },
        },
        dataLabels: { enabled: false },
        grid: {
            borderColor: "#efe5d7",
            strokeDashArray: 4,
        },
        tooltip: {
            theme: "light",
        },
    };
}

function formatCompactNumber(value: number) {
    return new Intl.NumberFormat("en-IN", {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(value);
}

function normalizeFiltersForQuery(filters: SalesPerformanceFilters) {
    const params = new URLSearchParams();
    params.set("dateFrom", filters.dateFrom);
    params.set("dateTo", filters.dateTo);

    if (filters.region !== "all") {
        params.set("region", filters.region);
    }

    if (filters.category !== "all") {
        params.set("category", filters.category);
    }

    if (filters.campaign !== "all") {
        params.set("campaign", filters.campaign);
    }

    filters.salespeople.forEach((salesperson) => params.append("salesperson", salesperson));
    return params.toString();
}

function normalizeRadarRows(rows: SalesPerformanceRadarRow[]) {
    // Radar axes need a common scale, so each metric is normalized against the current top value.
    const maxUnits = Math.max(...rows.map((row) => row.unitsSold), 1);
    const maxConversion = Math.max(...rows.map((row) => row.conversionRate), 1);
    const maxItems = Math.max(...rows.map((row) => row.avgItemsPerOrder), 1);
    const maxTryOns = Math.max(...rows.map((row) => row.tryOnsAssisted), 1);
    const maxRating = Math.max(...rows.map((row) => row.customerRating), 1);

    return rows.map((row) => ({
        name: row.salespersonName,
        data: [
            Math.round((row.unitsSold / maxUnits) * 100),
            Math.round((row.conversionRate / maxConversion) * 100),
            Math.round((row.avgItemsPerOrder / maxItems) * 100),
            Math.round((row.tryOnsAssisted / maxTryOns) * 100),
            Math.round((row.customerRating / maxRating) * 100),
        ],
    }));
}

function sortCategoryRows(rows: SalesPerformanceCategoryRow[], mode: CategoryMode) {
    const sorted = [...rows];
    sorted.sort((left, right) => {
        if (mode === "tried") {
            return right.tryOnsCompleted - left.tryOnsCompleted;
        }

        if (mode === "conversion") {
            return right.conversionRate - left.conversionRate;
        }

        return right.unitsSold - left.unitsSold;
    });
    return sorted;
}

export const SalesPerformanceDashboard = () => {
    const [filters, setFilters] = useState<SalesPerformanceFilters>(DEFAULT_SALES_PERFORMANCE_FILTERS);
    const [data, setData] = useState<SalesPerformanceResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadTick, setReloadTick] = useState(0);
    const [leaderboardMetric, setLeaderboardMetric] = useState<LeaderboardMetricKey>("unitsSold");
    const [categoryMode, setCategoryMode] = useState<CategoryMode>("sold");
    const [trendGranularity, setTrendGranularity] = useState<TrendGranularity>("weekly");

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError(null);

        fetch(`/api/sales-performance?${normalizeFiltersForQuery(filters)}`, {
            signal: controller.signal,
        })
            .then(async (response) => {
                if (!response.ok) {
                    const body = (await response.json().catch(() => null)) as { error?: string } | null;
                    throw new Error(body?.error || "Failed to load sales performance data.");
                }
                return response.json() as Promise<SalesPerformanceResponse>;
            })
            .then((payload) => {
                setData(payload);
            })
            .catch((fetchError: Error) => {
                if (fetchError.name === "AbortError") {
                    return;
                }
                setError(fetchError.message);
                setData(null);
            })
            .finally(() => setLoading(false));

        return () => controller.abort();
    }, [filters, reloadTick]);

    const exportCsv = () => {
        if (!data) {
            return;
        }

        const headers = [
            "Salesperson",
            "Region",
            "Units Sold",
            "Orders Closed",
            "Conversion Rate",
            "Try-Ons Assisted",
            "Avg Items Per Order",
            "Customer Rating",
        ];

        const rows = data.performanceTable.rows.map((row) => [
            row.salespersonName,
            row.region,
            row.unitsSold,
            row.ordersClosed,
            `${row.conversionRate.toFixed(1)}%`,
            row.tryOnsAssisted,
            row.avgItemsPerOrder.toFixed(1),
            row.customerRating.toFixed(1),
        ]);

        const csv = [headers, ...rows]
            .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
            .join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `sales-performance-${filters.dateFrom}-to-${filters.dateTo}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const leaderboardRows = data ? [...data.leaderboard.rows].sort((left, right) => right[leaderboardMetric] - left[leaderboardMetric]) : [];
    const categoryRows = data ? sortCategoryRows(data.categoryPerformance.rows, categoryMode) : [];
    const trendSeries = data ? data.trends[trendGranularity] : [];
    const radarSeries = data ? normalizeRadarRows(data.radarComparison.rows) : [];

    const leaderboardOptions: ApexOptions = {
        ...chartBaseOptions(),
        chart: {
            ...chartBaseOptions().chart,
            type: "bar",
        },
        colors: [leaderboardMetricMeta[leaderboardMetric].color],
        plotOptions: {
            bar: {
                horizontal: true,
                barHeight: "62%",
                borderRadius: 6,
            },
        },
        xaxis: {
            categories: leaderboardRows.map((row) => row.salespersonName),
            labels: {
                style: { colors: "#75664e" },
                formatter: (value) => leaderboardMetricMeta[leaderboardMetric].formatter(Number(value)),
            },
        },
        yaxis: {
            labels: {
                style: { colors: "#463924" },
            },
        },
        tooltip: {
            y: {
                formatter: leaderboardMetricMeta[leaderboardMetric].formatter,
            },
        },
    };

    const funnelOptions: ApexOptions = {
        ...chartBaseOptions(),
        chart: {
            ...chartBaseOptions().chart,
            type: "bar",
        },
        colors: ["#c29d52", "#b48a49", "#9f7640", "#7b5c33", "#214f3c"],
        plotOptions: {
            bar: {
                horizontal: true,
                isFunnel: true,
                distributed: true,
                barHeight: "88%",
            },
        },
        xaxis: {
            labels: {
                style: { colors: "#75664e" },
                formatter: (value) => formatCompactNumber(Number(value)),
            },
        },
        yaxis: {
            labels: {
                style: { colors: "#463924" },
            },
        },
        tooltip: {
            custom: ({ dataPointIndex }) => {
                const stage = data?.funnel.stages[dataPointIndex];
                if (!stage) {
                    return "";
                }

                return `
                    <div class="rounded-xl border border-[#eadfcd] bg-white px-3 py-2 text-sm shadow-lg">
                        <div class="font-semibold text-[#2f2618]">${stage.stage}</div>
                        <div class="mt-1 text-[#6e5d44]">Count: ${stage.count.toLocaleString("en-IN")}</div>
                        <div class="text-[#6e5d44]">Drop-off: ${stage.dropOffPct.toFixed(1)}%</div>
                    </div>
                `;
            },
        },
    };

    const categoryLabel =
        categoryMode === "sold" ? "Units Sold" : categoryMode === "tried" ? "Try-Ons Completed" : "Conversion Rate";

    const categoryOptions: ApexOptions = {
        ...chartBaseOptions(),
        chart: {
            ...chartBaseOptions().chart,
            type: "bar",
        },
        plotOptions: {
            bar: {
                borderRadius: 8,
                columnWidth: "48%",
                distributed: true,
            },
        },
        xaxis: {
            categories: categoryRows.map((row) => row.category),
            labels: {
                style: { colors: "#75664e" },
            },
        },
        colors: ["#214f3c", "#c29d52", "#e08b2f", "#4d7c63", "#8a6d91"],
        tooltip: {
            y: {
                formatter: (value) =>
                    categoryMode === "conversion" ? `${Number(value).toFixed(1)}%` : Number(value).toLocaleString("en-IN"),
            },
        },
    };

    const trendOptions: ApexOptions = {
        ...chartBaseOptions(),
        chart: {
            ...chartBaseOptions().chart,
            type: "line",
        },
        stroke: {
            curve: "smooth",
            width: [3, 3],
        },
        markers: {
            size: 3,
            strokeWidth: 0,
        },
        colors: ["#214f3c", "#c29d52"],
        xaxis: {
            categories: trendSeries.map((point) => point.label),
            labels: {
                style: { colors: "#75664e" },
            },
        },
        yaxis: [
            {
                title: { text: "Units Sold", style: { color: "#214f3c" } },
                labels: {
                    style: { colors: "#214f3c" },
                },
            },
            {
                opposite: true,
                title: { text: "Conversion Rate", style: { color: "#9c6b1f" } },
                labels: {
                    style: { colors: "#9c6b1f" },
                    formatter: (value) => `${Number(value).toFixed(0)}%`,
                },
            },
        ],
        tooltip: {
            shared: true,
        },
    };

    const radarOptions: ApexOptions = {
        ...chartBaseOptions(),
        chart: {
            ...chartBaseOptions().chart,
            type: "radar",
        },
        colors: ["#214f3c", "#b8872f", "#0f766e", "#8a5a44", "#5b3b87"],
        xaxis: {
            categories: ["Units Sold", "Conversion Rate", "Avg Items / Order", "Try-Ons Assisted", "Customer Rating"],
            labels: {
                style: {
                    colors: ["#5f513e", "#5f513e", "#5f513e", "#5f513e", "#5f513e"],
                },
            },
        },
        yaxis: {
            max: 100,
            tickAmount: 5,
            labels: {
                formatter: (value) => `${Number(value).toFixed(0)}%`,
                style: { colors: "#8b7b63" },
            },
        },
        stroke: {
            width: 2.5,
        },
        fill: {
            opacity: 0.15,
        },
        markers: {
            size: 3,
        },
    };

    const loadingView = (
        <div className="mt-6 space-y-5">
            <div className="h-52 animate-pulse rounded-[30px] bg-base-200/60" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
                {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="h-36 animate-pulse rounded-[24px] bg-base-200/60" />
                ))}
            </div>
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <div className="h-96 animate-pulse rounded-[28px] bg-base-200/60" />
                <div className="h-96 animate-pulse rounded-[28px] bg-base-200/60" />
            </div>
            <div className="h-[28rem] animate-pulse rounded-[28px] bg-base-200/60" />
        </div>
    );

    return (
        <div className="mt-6">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <PageTitle title="Sales Performance" />
                <button
                    type="button"
                    className="btn h-11 rounded-2xl border-0 bg-[#214f3c] px-5 text-white shadow-none hover:bg-[#17392b]"
                    onClick={exportCsv}
                    disabled={!data}>
                    <span className="iconify lucide--download size-4" />
                    Export CSV
                </button>
            </div>

            {loading && !data ? loadingView : null}

            {!loading && error ? (
                <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-6 text-rose-900">
                    <h2 className="text-lg font-semibold">Could not load sales performance data</h2>
                    <p className="mt-2 text-sm">{error}</p>
                    <button
                        type="button"
                        className="btn mt-4 rounded-2xl border-0 bg-rose-700 px-5 text-white shadow-none hover:bg-rose-800"
                        onClick={() => setReloadTick((value) => value + 1)}>
                        Retry
                    </button>
                </div>
            ) : null}

            {data ? (
                <div className="space-y-5">
                    <FiltersBar
                        filters={filters}
                        salespeople={data.filters.options.salespeople}
                        regions={data.filters.options.regions}
                        categories={data.filters.options.categories}
                        campaigns={data.filters.options.campaigns}
                        onChange={setFilters}
                        onReset={() => setFilters(DEFAULT_SALES_PERFORMANCE_FILTERS)}
                    />

                    {data.empty ? (
                        <div className="rounded-[28px] border border-[#eadfcd] bg-white p-8 text-center shadow-[0_14px_36px_rgba(64,46,16,0.08)]">
                            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#f7f1e4] text-[#214f3c]">
                                <span className="iconify lucide--search-x size-8" />
                            </div>
                            <h2 className="mt-4 text-xl font-semibold text-[#2f2618]">No matching performance data</h2>
                            <p className="mt-2 text-sm text-[#7b6a50]">
                                Adjust the date range or reset the salesperson, region, category, and campaign filters.
                            </p>
                            <button
                                type="button"
                                className="btn mt-5 rounded-2xl border-0 bg-[#214f3c] px-5 text-white shadow-none hover:bg-[#17392b]"
                                onClick={() => setFilters(DEFAULT_SALES_PERFORMANCE_FILTERS)}>
                                Reset Filters
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
                                {data.summary.kpis.map((item) => (
                                    <KpiCard key={item.key} item={item} />
                                ))}
                            </div>

                            <div className="grid grid-cols-1 gap-5 2xl:grid-cols-5">
                                <div className="2xl:col-span-3">
                                    <ChartCard
                                        title="Sales Leaderboard"
                                        subtitle="Top performers ranked by units, orders, conversion, or assisted try-ons."
                                        action={
                                            <div className="flex flex-wrap gap-2">
                                                {data.leaderboard.metricOptions.map((option) => (
                                                    <button
                                                        key={option.value}
                                                        type="button"
                                                        className={`btn h-10 rounded-2xl border px-4 text-sm shadow-none ${
                                                            leaderboardMetric === option.value
                                                                ? "border-[#214f3c] bg-[#214f3c] text-white"
                                                                : "border-[#e5dac8] bg-[#fffaf1] text-[#5e503a] hover:bg-[#f7f0e2]"
                                                        }`}
                                                        onClick={() => setLeaderboardMetric(option.value as LeaderboardMetricKey)}>
                                                        {option.label}
                                                    </button>
                                                ))}
                                            </div>
                                        }>
                                        <ApexChart
                                            type="bar"
                                            height={380}
                                            options={leaderboardOptions}
                                            series={[
                                                {
                                                    name: leaderboardMetricMeta[leaderboardMetric].label,
                                                    data: leaderboardRows.map((row) => row[leaderboardMetric]),
                                                },
                                            ]}
                                        />
                                    </ChartCard>
                                </div>
                                <div className="2xl:col-span-2">
                                    <ChartCard
                                        title="Virtual Try-On Conversion Funnel"
                                        subtitle="Stage counts and drop-off percentages from app visit through purchase.">
                                        <ApexChart
                                            type="bar"
                                            height={380}
                                            options={funnelOptions}
                                            series={[
                                                {
                                                    name: "Funnel Count",
                                                    data: data.funnel.stages.map((stage) => ({
                                                        x: stage.stage,
                                                        y: stage.count,
                                                    })),
                                                },
                                            ]}
                                        />
                                        <div className="mt-4 grid grid-cols-2 gap-3">
                                            {data.funnel.stages.slice(0, -1).map((stage) => (
                                                <div key={stage.stage} className="rounded-2xl bg-[#fff8ed] px-3 py-3">
                                                    <p className="text-xs uppercase tracking-[0.14em] text-[#8c7a60]">{stage.stage}</p>
                                                    <p className="mt-1 text-sm font-semibold text-[#2f2618]">
                                                        {stage.dropOffPct.toFixed(1)}% drop-off
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </ChartCard>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                                <ChartCard
                                    title="Jewellery Category Performance"
                                    subtitle="Sort category leaders by units sold, virtual try-ons, or conversion."
                                    action={
                                        <div className="flex flex-wrap gap-2">
                                            {data.categoryPerformance.modeOptions.map((option) => (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    className={`btn h-10 rounded-2xl border px-4 text-sm shadow-none ${
                                                        categoryMode === option.value
                                                            ? "border-[#214f3c] bg-[#214f3c] text-white"
                                                            : "border-[#e5dac8] bg-[#fffaf1] text-[#5e503a] hover:bg-[#f7f0e2]"
                                                    }`}
                                                    onClick={() => setCategoryMode(option.value as CategoryMode)}>
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    }>
                                    <ApexChart
                                        type="bar"
                                        height={360}
                                        options={categoryOptions}
                                        series={[
                                            {
                                                name: categoryLabel,
                                                data: categoryRows.map((row) =>
                                                    categoryMode === "sold"
                                                        ? row.unitsSold
                                                        : categoryMode === "tried"
                                                          ? row.tryOnsCompleted
                                                          : row.conversionRate,
                                                ),
                                            },
                                        ]}
                                    />
                                </ChartCard>

                                <ChartCard
                                    title="Sales Trend Over Time"
                                    subtitle="Track units sold and try-on to purchase conversion across time."
                                    action={
                                        <div className="flex flex-wrap gap-2">
                                            {data.trends.granularities.map((option) => (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    className={`btn h-10 rounded-2xl border px-4 text-sm shadow-none ${
                                                        trendGranularity === option.value
                                                            ? "border-[#214f3c] bg-[#214f3c] text-white"
                                                            : "border-[#e5dac8] bg-[#fffaf1] text-[#5e503a] hover:bg-[#f7f0e2]"
                                                    }`}
                                                    onClick={() => setTrendGranularity(option.value as TrendGranularity)}>
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    }>
                                    <ApexChart
                                        type="line"
                                        height={360}
                                        options={trendOptions}
                                        series={[
                                            {
                                                name: "Units Sold",
                                                type: "line",
                                                data: trendSeries.map((point) => point.unitsSold),
                                            },
                                            {
                                                name: "Conversion Rate",
                                                type: "line",
                                                data: trendSeries.map((point) => point.conversionRate),
                                            },
                                        ]}
                                    />
                                </ChartCard>
                            </div>

                            <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
                                <div className="xl:col-span-2">
                                    <ChartCard
                                        title="Individual Salesperson Comparison"
                                        subtitle="Normalized radar view of the strongest reps across core performance signals.">
                                        <ApexChart type="radar" height={400} options={radarOptions} series={radarSeries} />
                                    </ChartCard>
                                </div>

                                <div className="xl:col-span-3">
                                    <ChartCard
                                        title="Performance Heatmap Table"
                                        subtitle="Sort any metric column and spot top, middle, and low-performing reps at a glance.">
                                        <HeatmapTable rows={data.performanceTable.rows} />
                                    </ChartCard>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            ) : null}
        </div>
    );
};
