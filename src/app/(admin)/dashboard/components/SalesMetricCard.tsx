"use client";

import { dailyVirtualTryOnSales } from "./virtualTryOnData";
import { UniqueVisitorsChart } from "./UniqueVisitorsChart";

export const SalesMetricCard = () => {
    return (
        <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
                <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">Daily Jewellery Sales via Virtual Try-On</span>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-blue-500" />
                            <span className="text-base-content/60 text-sm">Jewellery Sold</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-emerald-400" />
                            <span className="text-base-content/60 text-sm">Orders Closed</span>
                        </div>
                    </div>
                </div>
                <div className="mt-4">
                    <UniqueVisitorsChart data={dailyVirtualTryOnSales} />
                </div>
            </div>
        </div>
    );
};
