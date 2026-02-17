"use client";

import { CampaignDetailSkeleton } from "@/components/skeletons";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface Customer {
    customer: string;
    email: string;
    status: "Read" | "Unread" | "Responded";
    responseDate: string;
}

interface CampaignDetail {
    title: string;
    subtitle: string;
    campaignMessage: {
        title: string;
        body: string;
    };
    summary: Array<{
        label: string;
        value: number;
        unit?: string;
    }>;
    pie: {
        segments: Array<{
            label: string;
            value: number;
            percent: number;
        }>;
    };
    table: {
        columns: string[];
        rows: Customer[];
    };
    pagination: {
        label: string;
        currentPage: number;
        totalPages: number;
        actions: string[];
    };
    actions: string[];
}

const statusStyles: Record<string, string> = {
    Read: "bg-blue-100 text-blue-700",
    Unread: "bg-gray-100 text-gray-600",
    Responded: "bg-green-100 text-green-700",
};

const CampaignDetailPage = () => {
    const params = useParams();
    const campaignId = params.campaignId as string;
    const [data, setData] = useState<CampaignDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCampaignDetail = async () => {
            try {
                const response = await fetch(`/api/campaign/${campaignId}`);
                const result = await response.json();
                setData(result.data);
            } catch (error) {
                console.error("Failed to fetch campaign detail:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (campaignId) {
            fetchCampaignDetail();
        }
    }, [campaignId]);

    const formatNumber = (num: number) => {
        return num.toLocaleString("en-US");
    };

    // Calculate pie chart segments
    const getPieChartStyle = () => {
        if (!data?.pie?.segments) return {};
        
        const segments = data.pie.segments;
        const read = segments.find(s => s.label === "Read");
        const unread = segments.find(s => s.label === "Unread");
        const responded = segments.find(s => s.label === "Responded");
        
        // Use values to calculate proper percentages (total should be 100%)
        const readValue = read?.value || 0;
        const unreadValue = unread?.value || 0;
        const respondedValue = responded?.value || 0;
        const total = readValue + unreadValue + respondedValue;
        
        if (total === 0) return {};
        
        const readPercent = (readValue / total) * 100;
        const unreadPercent = (unreadValue / total) * 100;
        const respondedPercent = (respondedValue / total) * 100;
        
        return {
            background: `conic-gradient(
                #3b82f6 0deg ${readPercent * 3.6}deg,
                #ef4444 ${readPercent * 3.6}deg ${(readPercent + unreadPercent) * 3.6}deg,
                #22c55e ${(readPercent + unreadPercent) * 3.6}deg 360deg
            )`,
        };
    };

    // Get summary values
    const getSummaryValue = (label: string) => {
        const item = data?.summary?.find(s => s.label === label);
        if (!item) return "0";
        if (item.unit === "percent") return `${item.value}%`;
        return formatNumber(item.value);
    };

    if (isLoading) {
        return <CampaignDetailSkeleton />;
    }

    if (!data) {
        return (
            <div className="mt-6">
                <p className="text-center text-base-content/60">Campaign not found</p>
            </div>
        );
    }

    return (
        <div className="mt-6 max-w-7xl">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-base-content">{data.title || "Campaign Results"}</h1>
                <p className="mt-2 text-base-content/60">{data.subtitle || ""}</p>
            </div>

            {/* Campaign Overview Card */}
            <div className="card bg-base-100 shadow-sm">
                <div className="card-body">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Left Column - Preview Card + Stats */}
                        <div className="space-y-4">
                            {/* Campaign Preview */}
                            <div className="card bg-linear-to-br from-green-500 to-green-700 shadow-lg">
                                <div className="card-body p-4">
                                    <h3 className="mb-2 text-sm font-bold text-white">Generated Campaign Preview</h3>
                                    <div className="rounded-lg bg-white/10 p-3 backdrop-blur">
                                        <div className="flex items-start gap-3">
                                            <div className="size-12 rounded-full bg-white/20" />
                                            <div className="flex-1">
                                                <p className="text-xs font-semibold text-white">Model 1</p>
                                                <p className="text-xs text-white/80">Jewellery 1</p>
                                                <p className="mt-1 text-[10px] text-white/60">
                                                    Endpoint: /images/row_1_1_row_2_1
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-2">
                                            <p className="text-sm italic text-white/90">Elegance that Dazzles</p>
                                        </div>
                                        <p className="mt-2 text-[10px] text-white/60">Sample Watermark</p>
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-lg border border-base-200 p-3">
                                    <p className="text-2xl font-bold text-base-content">{getSummaryValue("Campaign Views")}</p>
                                    <p className="text-xs text-base-content/60">Campaign Views</p>
                                </div>
                                <div className="rounded-lg border border-base-200 p-3">
                                    <p className="text-2xl font-bold text-base-content">{getSummaryValue("Responded Customers")}</p>
                                    <p className="text-xs text-base-content/60">Responded Customers</p>
                                </div>
                                <div className="rounded-lg border border-base-200 p-3">
                                    <p className="text-2xl font-bold text-base-content">{getSummaryValue("Response Rate")}</p>
                                    <p className="text-xs text-base-content/60">Response Rate</p>
                                </div>
                                <div className="rounded-lg border border-base-200 p-3">
                                    <p className="text-2xl font-bold text-base-content">{getSummaryValue("Unread Messages")}</p>
                                    <p className="text-xs text-base-content/60">Unread Messages</p>
                                </div>
                            </div>
                        </div>

                        {/* Middle Column - Campaign Message */}
                        <div>
                            <h3 className="mb-3 text-xl font-semibold text-base-content">{data.campaignMessage?.title || "Campaign Message"}</h3>
                            <p className="text-lg leading-relaxed text-base-content/80">
                                {data.campaignMessage?.body || "Elegance that Dazzles. Shine Bright with Our Exclusive Jewellery."}
                            </p>
                        </div>

                        {/* Right Column - Pie Chart */}
                        <div className="flex flex-col items-center justify-center">
                            <div
                                className="size-52 rounded-full"
                                style={getPieChartStyle()}
                            />
                            <div className="mt-4 flex flex-wrap justify-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="size-3 rounded-full bg-blue-500" />
                                    <span className="text-sm text-base-content">Read</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="size-3 rounded-full bg-red-500" />
                                    <span className="text-sm text-base-content">Unread</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="size-3 rounded-full bg-green-500" />
                                    <span className="text-sm text-base-content">Responded</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Customer Responses Table */}
            <div className="card mt-6 bg-base-100 shadow-sm">
                <div className="card-body p-0">
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr className="border-b border-base-200">
                                    <th className="text-sm font-semibold text-base-content/70">Customer</th>
                                    <th className="text-sm font-semibold text-base-content/70">Email</th>
                                    <th className="text-sm font-semibold text-base-content/70">Status</th>
                                    <th className="text-sm font-semibold text-base-content/70">Response Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(data.table?.rows || []).map((customer: Customer, index: number) => (
                                    <tr key={index} className="border-b border-base-100 last:border-b-0">
                                        <td className="py-4">
                                            <span className="text-base font-medium text-base-content">{customer.customer}</span>
                                        </td>
                                        <td className="py-4">
                                            <span className="text-base text-base-content/70">{customer.email}</span>
                                        </td>
                                        <td className="py-4">
                                            <span className={`inline-block rounded-md px-3 py-1.5 text-sm font-medium ${statusStyles[customer.status] || "bg-gray-100 text-gray-600"}`}>
                                                {customer.status}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <span className="text-base text-base-content/70">{customer.responseDate}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between border-t border-base-200 p-4">
                        <p className="text-sm text-base-content/60">
                            {data.pagination?.label || "Showing 1 to 8 of 7,153"}
                        </p>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <button
                                    className="btn btn-outline btn-sm"
                                    disabled={(data.pagination?.currentPage || 1) === 1}>
                                    Previous
                                </button>
                                {[1, 2, 3].map((page) => (
                                    <button
                                        key={page}
                                        className={`btn btn-sm ${page === (data.pagination?.currentPage || 1) ? "btn-primary" : "btn-ghost"}`}>
                                        {page}
                                    </button>
                                ))}
                                <button
                                    className="btn btn-outline btn-sm"
                                    disabled={(data.pagination?.currentPage || 1) === (data.pagination?.totalPages || 1)}>
                                    Next
                                </button>
                            </div>
                            <button className="btn btn-outline btn-sm">Download CSV</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CampaignDetailPage;
