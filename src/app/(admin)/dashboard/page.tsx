"use client";

import { DashboardSkeleton } from "@/components/skeletons";
import { useEffect, useState } from "react";

import { BranchStatList } from "./components/BranchStatList";
import { CustomerDealsCard } from "./components/CustomerDealsCard";
import { GoalStatusCard } from "./components/GoalStatusCard";
import { PremiumCard } from "./components/PremiumCard";
import { SalesMetricCard } from "./components/SalesMetricCard";
import { SocialAcquisitionCard } from "./components/SocialAcquisitionCard";

const DashboardPage = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Give components time to mount and start fetching
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="mt-6">
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
                <div className="col-span-1 xl:col-span-3">
                    <BranchStatList />
                </div>
                <div className="col-span-1">
                    <GoalStatusCard />
                </div>
            </div>
            <div className="mt-5 grid grid-cols-12 gap-5">
                <div className="col-span-12 md:col-span-8 xl:col-span-9">
                    <SalesMetricCard />
                </div>
                <div className="col-span-12 md:col-span-4 xl:col-span-3">
                    <PremiumCard />
                </div>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
                <div className="col-span-1">
                    <SocialAcquisitionCard />
                </div>
                <div className="col-span-1">
                    <CustomerDealsCard />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
