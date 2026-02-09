import { type Metadata } from "next";

import { PageTitle } from "@/components/PageTitle";

export const metadata: Metadata = {
    title: "Create Campaign",
};

const CreateCampaignPage = () => {
    return (
        <>
            <PageTitle
                title="Create Campaign"
                items={[{ label: "Campaign" }, { label: "Create", active: true }]}
            />
            <div className="mt-6">
                <div className="card card-border bg-base-100">
                    <div className="card-body">
                        <h2 className="card-title">
                            <span className="iconify lucide--plus-circle size-5" />
                            Create Campaign
                        </h2>
                        <p className="text-base-content/70">
                            Set up a new campaign and configure your targeting and creative.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CreateCampaignPage;
