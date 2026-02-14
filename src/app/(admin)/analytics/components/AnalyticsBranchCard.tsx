"use client";

import { useEffect, useState } from "react";

import { useBranch } from "@/contexts/branch";

export const AnalyticsBranchCard = () => {
    const { branch } = useBranch();
    const [data, setData] = useState<{ branch: string } | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams({ name: branch });
        fetch(`/api/analytics?${params}`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load");
                return res.json();
            })
            .then((body) => setData({ branch: body.branch }))
            .catch(() => setError(true));
    }, [branch]);

    return (
        <div className="card card-border bg-base-100">
            <div className="card-body">
                <h2 className="card-title">
                    <span className="iconify lucide--bar-chart-3 size-5" />
                    Analytics
                </h2>
                <p className="text-base-content/70">
                    {error
                        ? "Could not load analytics for this branch. Ensure analytics data files exist."
                        : data
                          ? `Viewing analytics for branch: ${data.branch}. Data, metrics, and performance insights.`
                          : "View and analyze your data, metrics, and performance insights here."}
                </p>
                {data && (
                    <p className="text-primary mt-2 text-sm font-medium">
                        Branch: {data.branch} (selected in header)
                    </p>
                )}
            </div>
        </div>
    );
};
