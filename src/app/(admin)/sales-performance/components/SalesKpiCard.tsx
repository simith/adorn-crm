import { KpiMetric } from "@/lib/sales-performance";

type SalesKpiCardProps = {
    metric: KpiMetric;
};

export const SalesKpiCard = ({ metric }: SalesKpiCardProps) => {
    const isPositive = metric.trend === "up";
    const tone = isPositive
        ? "bg-emerald-50 text-emerald-700"
        : "bg-rose-50 text-rose-700";
    const icon = isPositive ? "ri--arrow-up-line" : "ri--arrow-down-line";

    return (
        <article className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="text-sm font-medium text-base-content/72">{metric.label}</h3>
                    <p className="mt-3 text-3xl font-semibold tracking-tight text-base-content">{metric.formattedValue}</p>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>
                    <span className={`iconify ${icon} size-3.5`} />
                    {Math.abs(metric.changePct).toFixed(1)}%
                </span>
            </div>
            <p className="mt-2 text-sm text-base-content/60">{metric.helperText}</p>
        </article>
    );
};
