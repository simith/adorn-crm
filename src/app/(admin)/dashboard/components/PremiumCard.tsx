"use client";

import { topCategory } from "./virtualTryOnData";

export const PremiumCard = () => {
    return (
        <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
                <p className="text-lg font-bold">{topCategory.title}</p>
                <div className="mt-4">
                    <p className="text-base-content/60 text-sm">{topCategory.name}</p>
                    <p className="text-4xl font-bold">{topCategory.units} units</p>
                    <div className="mt-2">
                        <span className="text-success text-sm font-medium">+{topCategory.changePercent}%</span>
                    </div>
                </div>
                <div className="mt-6">
                    <svg className="h-16 w-full" viewBox="0 0 200 60" preserveAspectRatio="none">
                        <polyline fill="none" stroke="#34d399" strokeWidth="2" points={topCategory.sparklinePoints} className="opacity-80" />
                    </svg>
                </div>
            </div>
        </div>
    );
};
