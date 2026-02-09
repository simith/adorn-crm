import { type Metadata } from "next";

import { PageTitle } from "@/components/PageTitle";

export const metadata: Metadata = {
    title: "Campaign Results",
};

const CampaignResultsPage = () => {
    return (
        <>
            <PageTitle
                title="Campaign Results"
                items={[{ label: "Campaign" }, { label: "Results", active: true }]}
            />
            <div className="mt-6">
                <div className="card card-border bg-base-100">
                    <div className="card-body">
                        <h2 className="card-title">
                            <span className="iconify lucide--chart-bar size-5" />
                            Campaign Results
                        </h2>
                        <p className="text-base-content/70">
                            View performance metrics and results for your campaigns.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CampaignResultsPage;
