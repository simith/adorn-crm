"use client";

import { CampaignListSkeleton } from "@/components/skeletons";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Campaign {
    id: string;
    name: string;
    description: string;
    status: "Active" | "Completed" | "Draft";
    audience: number;
    updatedAt: string;
}

const statusStyles: Record<string, string> = {
    Active: "bg-blue-100 text-blue-700",
    Completed: "bg-green-100 text-green-700",
    Draft: "bg-gray-100 text-gray-600",
};

const ViewCampaignPage = () => {
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const handleRowClick = (campaignId: string) => {
        router.push(`/campaigns/view/${campaignId}`);
    };

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const response = await fetch("/api/campaigns");
                const data = await response.json();
                setCampaigns(data.campaigns || []);
            } catch (error) {
                console.error("Failed to fetch campaigns:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCampaigns();
    }, []);

    const formatNumber = (num: number) => {
        return num.toLocaleString("en-US");
    };

    return (
        <div className="mt-6 max-w-6xl">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-base-content">Campaigns</h1>
                <p className="mt-2 text-base-content/60">
                    View all campaigns and open detailed campaign results.
                </p>
            </div>

            {/* Campaigns Table */}
            <div className="card bg-base-100 shadow-sm">
                <div className="card-body p-0">
                    {isLoading ? (
                        <CampaignListSkeleton />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr className="border-b border-base-200">
                                        <th className="text-sm font-semibold text-base-content/70">Campaign</th>
                                        <th className="text-sm font-semibold text-base-content/70">Status</th>
                                        <th className="text-sm font-semibold text-base-content/70">Audience</th>
                                        <th className="text-sm font-semibold text-base-content/70">Updated</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {campaigns.map((campaign) => (
                                        <tr
                                            key={campaign.id}
                                            onClick={() => handleRowClick(campaign.id)}
                                            className="cursor-pointer border-b border-base-100 transition-colors hover:bg-base-200/50 last:border-b-0">
                                            <td className="py-4">
                                                <div>
                                                    <p className="text-lg font-semibold text-base-content">{campaign.name}</p>
                                                    <p className="text-sm text-base-content/60">{campaign.description}</p>
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                <span className={`inline-block rounded-md px-3 py-1.5 text-sm font-medium ${statusStyles[campaign.status]}`}>
                                                    {campaign.status}
                                                </span>
                                            </td>
                                            <td className="py-4">
                                                <span className="text-base font-medium text-base-content">
                                                    {formatNumber(campaign.audience)}
                                                </span>
                                            </td>
                                            <td className="py-4">
                                                <span className="text-base text-base-content/70">
                                                    {campaign.updatedAt}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewCampaignPage;
