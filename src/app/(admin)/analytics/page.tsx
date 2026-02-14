import { type Metadata } from "next";

import { PageTitle } from "@/components/PageTitle";

export const metadata: Metadata = {
    title: "Analytics",
};

const AnalyticsPage = () => {
    return (
        <>
            <PageTitle title="Analytics" />
            <div className="mt-6">
                <div className="card card-border bg-base-100">
                    <div className="card-body">
                        <h2 className="card-title">
                            <span className="iconify lucide--bar-chart-3 size-5" />
                            Analytics
                        </h2>
                        <p className="text-base-content/70">
                            View and analyze your data, metrics, and performance insights here.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AnalyticsPage;
