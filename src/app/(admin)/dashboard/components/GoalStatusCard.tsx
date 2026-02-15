"use client";

import { useEffect, useState } from "react";

import { useBranch } from "@/contexts/branch";

type MonthlyTarget = {
    percent: number;
    cta: string;
    note: string;
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

    return <span>{value}%</span>;
};

export const GoalStatusCard = () => {
    const { branch } = useBranch();
    const [target, setTarget] = useState<MonthlyTarget | null>(null);
    const [animatedPercent, setAnimatedPercent] = useState(0);

    useEffect(() => {
        const params = new URLSearchParams({ name: branch });
        fetch(`/api/branch?${params}`)
            .then((res) => res.json())
            .then((body) => {
                if (body.data?.monthlyTarget) {
                    setTarget(body.data.monthlyTarget);
                    // Trigger animation after data loads
                    requestAnimationFrame(() => {
                        setAnimatedPercent(body.data.monthlyTarget.percent);
                    });
                }
            })
            .catch(() => setTarget(null));
    }, [branch]);

    if (!target) {
        return (
            <div className="card bg-base-100 shadow-sm">
                <div className="card-body gap-2 p-4">
                    <p className="text-base-content/60 text-sm">Loading target data…</p>
                </div>
            </div>
        );
    }

    const circumference = 2 * Math.PI * 40;
    const strokeDashoffset = circumference - (animatedPercent / 100) * circumference;

    return (
        <div className="card bg-base-100 shadow-sm">
            <div className="card-body gap-4 p-5">
                <p className="text-base-content text-lg font-bold">Monthly Target</p>
                <div className="flex justify-center py-2">
                    <div className="relative flex items-center justify-center">
                        <svg className="h-32 w-32 -rotate-90" viewBox="0 0 100 100">
                            <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="8"
                                className="text-base-200"
                            />
                            <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                className="text-primary transition-all duration-700 ease-out"
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-2xl font-bold">
                                <AnimatedNumber target={target.percent} />
                            </span>
                        </div>
                    </div>
                </div>
                <p className="text-base-content/60 text-sm text-left mb-2">{target.note}</p>
                <button className="btn btn-primary btn-soft w-full">{target.cta}</button>
            </div>
        </div>
    );
};
