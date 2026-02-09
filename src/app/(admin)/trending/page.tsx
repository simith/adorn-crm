import { type Metadata } from "next";

import { PageTitle } from "@/components/PageTitle";

export const metadata: Metadata = {
    title: "Trending",
};

const TrendingPage = () => {
    return (
        <>
            <PageTitle title="Trending" items={[{ label: "Trending", active: true }]} />
            <div className="mt-6">
                <div className="card card-border bg-base-100">
                    <div className="card-body">
                        <h2 className="card-title">
                            <span className="iconify lucide--trending-up size-5" />
                            Trending
                        </h2>
                        <p className="text-base-content/70">
                            Discover what is trending and popular across your campaigns and content.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TrendingPage;
