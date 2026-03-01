import type { SalesPerformanceKpi } from "@/lib/sales-performance";

type KpiCardProps = {
    item: SalesPerformanceKpi;
};

function formatValue(item: SalesPerformanceKpi) {
    if (item.format === "percentage") {
        return `${item.value.toFixed(1)}%`;
    }

    if (item.format === "decimal") {
        return item.value.toFixed(1);
    }

    return item.value.toLocaleString("en-IN");
}

export const KpiCard = ({ item }: KpiCardProps) => {
    const trendClass =
        item.trend === "up" ? "text-emerald-700 bg-emerald-50" : item.trend === "down" ? "text-rose-700 bg-rose-50" : "text-amber-700 bg-amber-50";
    const trendIcon =
        item.trend === "up"
            ? "lucide--trending-up"
            : item.trend === "down"
              ? "lucide--trending-down"
              : "lucide--minus";

    return (
        <article className="rounded-[24px] border border-[#e8e0d1] bg-gradient-to-br from-white via-[#fffcf6] to-[#f7f1e4] p-4 shadow-[0_14px_36px_rgba(64,46,16,0.08)]">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-[#7b6a50]">{item.label}</p>
                    <p className="mt-3 text-3xl font-semibold tracking-tight text-[#2f2618]">{formatValue(item)}</p>
                </div>
                <span className={`inline-flex size-10 items-center justify-center rounded-2xl ${trendClass}`}>
                    <span className={`iconify ${trendIcon} size-5`} />
                </span>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
                <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${trendClass}`}>
                    <span className={`iconify ${trendIcon} size-3.5`} />
                    {item.changePct > 0 ? "+" : ""}
                    {item.changePct.toFixed(1)}%
                </span>
                <span className="text-xs text-[#8d7e65]">vs previous period</span>
            </div>
        </article>
    );
};
