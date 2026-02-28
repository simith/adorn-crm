"use client";

import { useState } from "react";

import { dashboardSalesStats } from "./virtualTryOnData";
import { IStatItem, StatItem } from "./StatItem";

export const StatList = () => {
    const [selected, setSelected] = useState<IStatItem | undefined>(dashboardSalesStats[0]);

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-1">
            {dashboardSalesStats.map((state, index) => (
                <div className="cursor-pointer" onClick={() => setSelected(state)} key={index}>
                    <StatItem {...state} selected={selected == state} />
                </div>
            ))}
        </div>
    );
};
