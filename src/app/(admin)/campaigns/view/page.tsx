import { type Metadata } from "next";

export const metadata: Metadata = {
    title: "View Campaigns",
};

const ViewCampaignPage = () => {
    return (
        <div className="mt-6">
                <div className="card card-border bg-base-100">
                    <div className="card-body">
                        <h2 className="card-title">
                            <span className="iconify lucide--list size-5" />
                            View Campaigns
                        </h2>
                        <p className="text-base-content/70">
                            Browse and manage your existing campaigns.
                        </p>
                    </div>
                </div>
            </div>
    );
};

export default ViewCampaignPage;
