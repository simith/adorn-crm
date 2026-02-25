"use client";

import { useEffect, useState } from "react";

import { useBranch } from "@/contexts/branch";

type NewJoinMember = {
    name: string;
    location?: string;
};

type BranchData = {
    newJoinMembers?: NewJoinMember[];
};

export const SocialAcquisitionCard = () => {
    const { branch } = useBranch();
    const [members, setMembers] = useState<NewJoinMember[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams({ name: branch });
        fetch(`/api/branch?${params}`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load");
                return res.json();
            })
            .then((body: { data?: BranchData }) => {
                setMembers(body.data?.newJoinMembers ?? []);
            })
            .catch(() => setMembers([]))
            .finally(() => setLoading(false));
    }, [branch]);

    return (
        <div className="card rounded-box border-base-200 bg-base-100 border shadow-sm">
            <div className="card-body p-4">
                <div className="flex items-center justify-between">
                    <h2 className="card-title text-base-content text-base font-bold">New Join Member</h2>
                    <button
                        type="button"
                        className="btn btn-ghost btn-circle btn-sm shrink-0"
                        aria-label="More options">
                        <span className="iconify lucide--more-horizontal text-base-content/70 size-5" />
                    </button>
                </div>
                {loading ? (
                    <ul className="mt-2 flex flex-col gap-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <li key={i} className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="skeleton mb-1 h-4 w-32" />
                                    <div className="skeleton h-3 w-24" />
                                </div>
                                <div className="skeleton h-8 w-12 rounded-lg" />
                            </li>
                        ))}
                    </ul>
                ) : members.length === 0 ? (
                    <p className="text-base-content/60 mt-2 text-sm">No new members.</p>
                ) : (
                    <ul className="divide-base-200 mt-2 flex flex-col divide-y">
                        {members.map((member, idx) => (
                            <li key={idx} className="flex items-center justify-between gap-3 py-3 first:pt-1">
                                <div className="min-w-0 flex-1">
                                    <p className="text-base-content font-bold">{member.name}</p>
                                    <p className="text-base-content/60 text-sm">
                                        {member.location || "Location unavailable"}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-ghost btn-sm bg-base-200 text-base-content rounded-lg">
                                    Add
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};
