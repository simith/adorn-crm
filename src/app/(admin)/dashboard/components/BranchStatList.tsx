"use client";

import { dashboardSalesStats } from "./virtualTryOnData";
import { StatItem } from "./StatItem";

export const BranchStatList = () => {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {dashboardSalesStats.map((state, index) => (
                <StatItem key={index} {...state} />
            ))}
        </div>
    );
};
