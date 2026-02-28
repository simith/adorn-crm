"use client";

import { useEffect, useState } from "react";

import { tryOnConversion } from "./virtualTryOnData";

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
    const [animatedPercent, setAnimatedPercent] = useState(0);

    useEffect(() => {
        requestAnimationFrame(() => {
            setAnimatedPercent(tryOnConversion.percent);
        });
    }, []);

    const circumference = 2 * Math.PI * 40;
    const strokeDashoffset = circumference - (animatedPercent / 100) * circumference;

    return (
        <div className="card bg-base-100 shadow-sm">
            <div className="card-body gap-4 p-5">
                <p className="text-base-content text-lg font-bold">Try-On Conversion</p>
                <div className="flex justify-center py-2">
                    <div className="relative flex items-center justify-center">
                        <svg className="h-32 w-32 -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-base-200" />
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
                                <AnimatedNumber target={tryOnConversion.percent} />
                            </span>
                        </div>
                    </div>
                </div>
                <p className="mb-2 text-left text-sm text-base-content/60">{tryOnConversion.note}</p>
                <button className="btn btn-primary btn-soft w-full">{tryOnConversion.cta}</button>
            </div>
        </div>
    );
};
