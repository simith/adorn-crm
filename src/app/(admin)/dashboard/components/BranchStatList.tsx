"use client";

import { useEffect, useState } from "react";

import { useBranch } from "@/contexts/branch";

import { StatItem } from "./StatItem";

const KPI_ICONS: Record<string, string> = {
    revenue: "lucide--dollar-sign",
    sales: "lucide--trending-up",
    costs: "lucide--wallet",
};

type BranchKpi = {
    id: string;
    title: string;
    value: number;
    currency?: string;
    changePercent: number;
};

export const BranchStatList = () => {
    const { branch } = useBranch();
    const [kpis, setKpis] = useState<BranchKpi[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(1);

    useEffect(() => {
        const params = new URLSearchParams({ name: branch });
        fetch(`/api/branch?${params}`)
            .then((res) => res.json())
            .then((body) => {
                if (body.data?.kpis) setKpis(body.data.kpis);
            })
            .catch(() => setKpis([]));
    }, [branch]);

    if (kpis.length === 0) {
        return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-1">
                <div className="card bg-base-100 shadow-sm">
                    <div className="card-body gap-2 p-4">
                        <p className="text-base-content/60 text-sm">Loading branch data…</p>
                    </div>
                </div>
            </div>
        );
    }

    const items = kpis.map((kpi, index) => ({
        title: kpi.title,
        amount: `${kpi.currency ?? ""} ${kpi.value.toLocaleString()}`.trim(),
        percent: kpi.changePercent,
        icon: KPI_ICONS[kpi.id] ?? "lucide--bar-chart-2",
    }));

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-1">
            {items.map((item, index) => (
                <div
                    className="cursor-pointer"
                    onClick={() => setSelectedIndex(index)}
                    key={item.title}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && setSelectedIndex(index)}>
                    <StatItem {...item} selected={selectedIndex === index} />
                </div>
            ))}
        </div>
    );
};
