"use client";

function formatMetricValue(metric: { value: number; currency?: string }) {
    if (metric.currency === "INR") {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(metric.value);
    }
    return metric.value.toLocaleString("en-IN");
}

export type SalesSummaryMetric = {
    label: string;
    value: number;
    currency?: string;
};

export type SalesSummaryData = {
    title: string;
    subtitle?: string;
    metrics: SalesSummaryMetric[];
};

export const SalesSummaryCard = ({ data }: { data: SalesSummaryData }) => {
    const subtitle = data.subtitle && !data.subtitle.startsWith("Lorem") ? data.subtitle : "Monthly snapshot";
    const metrics = data.metrics ?? [];

    return (
        <div className="card card-border bg-base-100 shadow-sm">
            <div className="card-body">
                <h2 className="card-title text-xl font-bold text-base-content">{data.title}</h2>
                <p className="text-sm text-base-content/60">{subtitle}</p>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {metrics.map((metric, idx) => (
                        <div
                            key={idx}
                            className="rounded-xl bg-base-200/60 px-4 py-4"
                        >
                            <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
                                {metric.label}
                            </p>
                            <p className="mt-1 text-xl font-bold text-base-content md:text-2xl">
                                {formatMetricValue(metric)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
