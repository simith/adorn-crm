"use client";

import { useEffect, useState } from "react";

import { useBranch } from "@/contexts/branch";

type BranchKpi = {
    id: string;
    title: string;
    value: number;
    currency?: string;
    changePercent: number;
    comparison: string;
};

/** Animated counter that counts up from 0 to target value */
const AnimatedNumber = ({ target, duration = 800 }: { target: number; duration?: number }) => {
    const [value, setValue] = useState(0);

    useEffect(() => {
        let startTime: number;
        let animationId: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setValue(Math.floor(easeOut * target));

            if (progress < 1) {
                animationId = requestAnimationFrame(animate);
            }
        };

        animationId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationId);
    }, [target, duration]);

    return <span>{value.toLocaleString("en-IN")}</span>;
};

const formatCurrencySymbol = (currency?: string) => {
    return currency === "INR" ? "₹" : currency || "";
};

export const BranchStatList = () => {
    const { branch } = useBranch();
    const [kpis, setKpis] = useState<BranchKpi[]>([]);
    const [animationKey, setAnimationKey] = useState(0);

    useEffect(() => {
        const params = new URLSearchParams({ name: branch });
        fetch(`/api/branch?${params}`)
            .then((res) => res.json())
            .then((body) => {
                if (body.data?.kpis) {
                    setKpis(body.data.kpis);
                    setAnimationKey((prev) => prev + 1); // Trigger re-animation
                }
            })
            .catch(() => setKpis([]));
    }, [branch]);

    if (kpis.length === 0) {
        return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="card bg-base-100 shadow-sm">
                    <div className="card-body gap-2 p-4">
                        <p className="text-base-content/60 text-sm">Loading branch data…</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {kpis.map((kpi) => (
                <div className="card bg-base-100 shadow-sm" key={kpi.id}>
                    <div className="card-body gap-4 p-5">
                        <p className="text-base-content/80 text-sm font-medium">{kpi.title}</p>
                        <p className="text-3xl font-bold">
                            {formatCurrencySymbol(kpi.currency)}
                            <AnimatedNumber key={`${kpi.id}-${animationKey}`} target={kpi.value} />
                        </p>
                        <div className="mt-2">
                            {kpi.changePercent > 0 ? (
                                <span className="text-success text-sm font-medium">+{kpi.changePercent}%</span>
                            ) : (
                                <span className="text-error text-sm font-medium">{kpi.changePercent}%</span>
                            )}
                        </div>
                        <p className="text-base-content/60 text-xs">{kpi.comparison}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};
