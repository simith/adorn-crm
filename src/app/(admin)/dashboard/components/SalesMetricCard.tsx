"use client";

import { useEffect, useState } from "react";

import { useBranch } from "@/contexts/branch";

import { UniqueVisitorsChart } from "./UniqueVisitorsChart";

type UniqueVisitorsData = {
    series: { name: string; values: number[] }[];
    labels: string[];
};

export const SalesMetricCard = () => {
    const { branch } = useBranch();
    const [data, setData] = useState<UniqueVisitorsData | null>(null);

    useEffect(() => {
        const params = new URLSearchParams({ name: branch });
        fetch(`/api/branch?${params}`)
            .then((res) => res.json())
            .then((body) => {
                if (body.data?.uniqueVisitors) setData(body.data.uniqueVisitors);
            })
            .catch(() => setData(null));
    }, [branch]);

    return (
        <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
                <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">Unique Visitors</span>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-blue-500" />
                            <span className="text-base-content/60 text-sm">Session Duration</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-emerald-400" />
                            <span className="text-base-content/60 text-sm">Page Views</span>
                        </div>
                    </div>
                </div>
                <div className="mt-4">
                    {data ? <UniqueVisitorsChart data={data} /> : <div className="h-64 animate-pulse rounded-box bg-base-200/60" />}
                </div>
            </div>
        </div>
    );
};
