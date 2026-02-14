import { type Metadata } from "next";

import { LEADS_STATS, LEADS_TABLE_DATA } from "./leads-data";
import { LeadsTable } from "./LeadsTable";

export const metadata: Metadata = {
    title: "Leads",
};

const LeadsPage = () => {
    return (
        <div className="mt-6">
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Leads</h1>
                <p className="text-base-content/70 mt-2 text-lg">
                    Track customer onboarding, engagement, and total spend across stores.
                </p>

                <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="card card-border bg-base-100 shadow-sm">
                        <div className="card-body">
                            <p className="text-base-content/70 text-sm font-medium">Total Leads</p>
                            <p className="text-3xl font-bold md:text-4xl">{LEADS_STATS.totalLeads}</p>
                        </div>
                    </div>
                    <div className="card card-border bg-base-100 shadow-sm">
                        <div className="card-body">
                            <p className="text-base-content/70 text-sm font-medium">Total Spend</p>
                            <p className="text-3xl font-bold md:text-4xl">{LEADS_STATS.totalSpend}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <div className="bg-base-100 card card-border overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <LeadsTable data={LEADS_TABLE_DATA} />
                        </div>
                    </div>
                </div>
        </div>
    );
};

export default LeadsPage;
