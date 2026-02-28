"use client";

import { categoryBreakdown } from "./virtualTryOnData";

export const SocialAcquisitionCard = () => {
    return (
        <div className="card rounded-box border border-base-200 bg-base-100 shadow-sm">
            <div className="card-body p-4">
                <div className="flex items-center justify-between">
                    <h2 className="card-title text-base-content text-base font-bold">Jewellery Sold by Category</h2>
                    <button type="button" className="btn btn-ghost btn-circle btn-sm shrink-0" aria-label="More options">
                        <span className="iconify lucide--more-horizontal text-base-content/70 size-5" />
                    </button>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {categoryBreakdown.map((category, idx) => (
                        <div key={idx} className="rounded-xl border border-base-200 bg-base-50 p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <p className="text-base-content font-bold">{category.name}</p>
                                    <p className="mt-1 text-sm text-base-content/60">{category.location}</p>
                                </div>
                                <span className="badge badge-soft badge-primary badge-sm">Sold</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
