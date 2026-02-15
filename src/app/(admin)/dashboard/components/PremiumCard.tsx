"use client";

import { useEffect, useState } from "react";

import { useBranch } from "@/contexts/branch";

type ActiveMembersData = {
    count: number;
    changePercent: number;
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

export const PremiumCard = () => {
    const { branch } = useBranch();
    const [data, setData] = useState<ActiveMembersData | null>(null);
    const [animationKey, setAnimationKey] = useState(0);

    useEffect(() => {
        const params = new URLSearchParams({ name: branch });
        fetch(`/api/branch?${params}`)
            .then((res) => res.json())
            .then((body) => {
                if (body.data?.activeMembers) {
                    setData(body.data.activeMembers);
                    setAnimationKey((prev) => prev + 1);
                }
            })
            .catch(() => setData(null));
    }, [branch]);

    if (!data) {
        return (
            <div className="card bg-base-100 shadow-sm">
                <div className="card-body gap-2 p-4">
                    <p className="text-base-content/60 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
                <p className="text-lg font-bold">Active Members</p>
                <div className="mt-4">
                    <p className="text-4xl font-bold">
                        <AnimatedNumber key={animationKey} target={data.count} />
                    </p>
                    <div className="mt-2">
                        {data.changePercent > 0 ? (
                            <span className="text-success text-sm font-medium">+{data.changePercent}%</span>
                        ) : (
                            <span className="text-error text-sm font-medium">{data.changePercent}%</span>
                        )}
                    </div>
                </div>
                <div className="mt-6">
                    {/* Mini sparkline chart */}
                    <svg className="w-full h-16" viewBox="0 0 200 60" preserveAspectRatio="none">
                        <polyline
                            fill="none"
                            stroke="#34d399"
                            strokeWidth="2"
                            points="0,45 25,50 50,35 75,40 100,25 125,30 150,20 175,25 200,15"
                            className="opacity-80"
                        />
                    </svg>
                </div>
            </div>
        </div>
    );
};
