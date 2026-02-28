"use client";

import { topJewellerySold } from "./virtualTryOnData";

function StatusBadge({ status }: { status: string }) {
    const s = status.toLowerCase();
    if (s === "high seller") return <span className="badge badge-soft badge-success badge-sm">{status}</span>;
    if (s === "steady") return <span className="badge badge-soft badge-info badge-sm">{status}</span>;
    return <span className="badge badge-soft badge-warning badge-sm">{status}</span>;
}

export const CustomerDealsCard = () => {
    return (
        <div className="card rounded-box border border-base-200 bg-base-100 shadow-sm">
            <div className="card-body p-4">
                <div className="flex items-center justify-between">
                    <h2 className="card-title text-base font-bold text-base-content">Top Jewellery Sold</h2>
                    <button type="button" className="btn btn-ghost btn-circle btn-sm shrink-0" aria-label="More options">
                        <span className="iconify lucide--more-horizontal size-5 text-base-content/70" />
                    </button>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3">
                    {topJewellerySold.map((item, idx) => (
                        <div key={idx} className="rounded-xl border border-base-200 bg-base-50 p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <p className="font-medium text-base-content">{item.customer}</p>
                                    <p className="mt-1 text-sm text-base-content/65">{item.date}</p>
                                </div>
                                <StatusBadge status={item.status} />
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <div className="rounded-lg border border-base-200 bg-base-100 px-3 py-2">
                                    <p className="text-xs uppercase tracking-wide text-base-content/45">Units Sold</p>
                                    <p className="mt-1 font-semibold text-base-content">{item.units}</p>
                                </div>
                                <div className="rounded-lg border border-base-200 bg-base-100 px-3 py-2">
                                    <p className="text-xs uppercase tracking-wide text-base-content/45">Category</p>
                                    <p className="mt-1 font-semibold text-base-content">{item.date}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
