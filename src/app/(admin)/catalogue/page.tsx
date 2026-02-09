import { type Metadata } from "next";

import { PageTitle } from "@/components/PageTitle";

export const metadata: Metadata = {
    title: "Catalogue",
};

const CataloguePage = () => {
    return (
        <>
            <PageTitle title="Catalogue" items={[{ label: "Catalogue", active: true }]} />
            <div className="mt-6">
                <div className="card card-border bg-base-100">
                    <div className="card-body">
                        <h2 className="card-title">
                            <span className="iconify lucide--library size-5" />
                            Catalogue
                        </h2>
                        <p className="text-base-content/70">
                            Browse and manage your product catalogue, categories, and listings.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CataloguePage;
