import { type Metadata } from "next";

import { AnalyticsBranchCard } from "./components/AnalyticsBranchCard";

export const metadata: Metadata = {
    title: "Analytics",
};

const AnalyticsPage = () => {
    return (
        <div className="mt-6">
            <AnalyticsBranchCard />
        </div>
    );
};

export default AnalyticsPage;
