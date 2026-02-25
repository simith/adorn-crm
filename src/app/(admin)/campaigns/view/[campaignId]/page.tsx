"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { CampaignDetailSkeleton } from "@/components/skeletons";

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

const pieSegmentColors: Record<string, string> = {
    Read: "#3b82f6",
    Unread: "#ef4444",
    Responded: "#22c55e",
};

const fallbackPieColors = ["#8b5cf6", "#06b6d4", "#f59e0b", "#10b981"];
const donutRadius = 88;
const donutCircumference = 2 * Math.PI * donutRadius;

const infusedPreviewByCampaign: Record<string, string> = {
    campaign_1: "/images/campaign/model_2_jewellery_1.png",
    campaign_2: "/images/campaign/model_2_jewellery_2.png",
};

const CampaignDetailPage = () => {
    const params = useParams();
    const campaignId = params.campaignId as string;
    const [data, setData] = useState<CampaignDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
    const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

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

    const previewImageSrc = infusedPreviewByCampaign[campaignId] || "/api/images/row_1_1_row_2_1";

    const normalizedPieSegments = useMemo(() => {
        const segments = data?.pie?.segments || [];
        const validSegments = segments.filter((segment) => segment.value > 0);
        const total = validSegments.reduce((sum, segment) => sum + segment.value, 0);

        if (total === 0) {
            return [];
        }

        let cumulativeLength = 0;
        return validSegments.map((segment, index) => {
            const percent = (segment.value / total) * 100;
            const arcLength = (percent / 100) * donutCircumference;
            const segmentData = {
                ...segment,
                normalizedPercent: percent,
                color: pieSegmentColors[segment.label] || fallbackPieColors[index % fallbackPieColors.length],
                dashArray: `${arcLength} ${donutCircumference - arcLength}`,
                dashOffset: -cumulativeLength,
            };
            cumulativeLength += arcLength;
            return segmentData;
        });
    }, [data?.pie?.segments]);

    const totalPieValue = useMemo(
        () => normalizedPieSegments.reduce((sum, segment) => sum + segment.value, 0),
        [normalizedPieSegments],
    );

    const focusedSegmentLabel = selectedSegment || hoveredSegment;
    const focusedSegment = normalizedPieSegments.find((segment) => segment.label === focusedSegmentLabel) || null;
    const hasFocusedSegment = Boolean(focusedSegmentLabel);

    // Get summary values
    const getSummaryValue = (label: string) => {
        const item = data?.summary?.find((s) => s.label === label);
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
                <p className="text-base-content/60 text-center">Campaign not found</p>
            </div>
        );
    }

    return (
        <div className="mt-6 max-w-7xl">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-base-content text-3xl font-bold">{data.title || "Campaign Results"}</h1>
                <p className="text-base-content/60 mt-2">{data.subtitle || ""}</p>
            </div>

            {/* Campaign Overview Card */}
            <div className="card bg-base-100 shadow-sm">
                <div className="card-body">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Left Column - Preview Card + Stats */}
                        <div className="space-y-4">
                            {/* Campaign Preview */}
                            <div className="card border border-slate-200 bg-slate-100 shadow-lg">
                                <div className="card-body p-4">
                                    <h3 className="mb-2 text-sm font-bold text-slate-800">
                                        Generated Campaign Preview
                                    </h3>
                                    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                                        <img
                                            src={previewImageSrc}
                                            alt="Generated campaign preview"
                                            className="h-[500px] w-full object-cover object-center"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="border-base-200 rounded-lg border p-3">
                                    <p className="text-base-content text-2xl font-bold">
                                        {getSummaryValue("Campaign Views")}
                                    </p>
                                    <p className="text-base-content/60 text-xs">Campaign Views</p>
                                </div>
                                <div className="border-base-200 rounded-lg border p-3">
                                    <p className="text-base-content text-2xl font-bold">
                                        {getSummaryValue("Responded Customers")}
                                    </p>
                                    <p className="text-base-content/60 text-xs">Responded Customers</p>
                                </div>
                                <div className="border-base-200 rounded-lg border p-3">
                                    <p className="text-base-content text-2xl font-bold">
                                        {getSummaryValue("Response Rate")}
                                    </p>
                                    <p className="text-base-content/60 text-xs">Response Rate</p>
                                </div>
                                <div className="border-base-200 rounded-lg border p-3">
                                    <p className="text-base-content text-2xl font-bold">
                                        {getSummaryValue("Unread Messages")}
                                    </p>
                                    <p className="text-base-content/60 text-xs">Unread Messages</p>
                                </div>
                            </div>
                        </div>

                        {/* Middle Column - Campaign Message */}
                        <div>
                            <h3 className="text-base-content mb-3 text-xl font-semibold">
                                {data.campaignMessage?.title || "Campaign Message"}
                            </h3>
                            <p className="text-base-content/80 text-lg leading-relaxed">
                                {data.campaignMessage?.body ||
                                    "Elegance that Dazzles. Shine Bright with Our Exclusive Jewellery."}
                            </p>
                        </div>

                        {/* Right Column - Pie Chart */}
                        <div className="flex flex-col items-center justify-center">
                            <div className="relative flex size-64 items-center justify-center rounded-full bg-gradient-to-br from-slate-50 via-white to-slate-100 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.3),0_18px_40px_-24px_rgba(15,23,42,0.45)]">
                                <svg
                                    viewBox="0 0 220 220"
                                    className="size-56 -rotate-90"
                                    role="img"
                                    aria-label="Interactive campaign response chart">
                                    <circle
                                        cx="110"
                                        cy="110"
                                        r={donutRadius}
                                        stroke="#e2e8f0"
                                        strokeWidth="24"
                                        fill="none"
                                    />
                                    {normalizedPieSegments.map((segment) => {
                                        const isFocused = focusedSegmentLabel === segment.label;
                                        const isDimmed = hasFocusedSegment && !isFocused;
                                        return (
                                            <circle
                                                key={segment.label}
                                                cx="110"
                                                cy="110"
                                                r={donutRadius}
                                                fill="none"
                                                stroke={segment.color}
                                                strokeDasharray={segment.dashArray}
                                                strokeDashoffset={segment.dashOffset}
                                                strokeLinecap="round"
                                                strokeWidth={isFocused ? 30 : 24}
                                                className="cursor-pointer transition-all duration-300 ease-out"
                                                style={{ opacity: isDimmed ? 0.35 : 1 }}
                                                onMouseEnter={() => setHoveredSegment(segment.label)}
                                                onMouseLeave={() => setHoveredSegment(null)}
                                                onClick={() =>
                                                    setSelectedSegment((current) =>
                                                        current === segment.label ? null : segment.label,
                                                    )
                                                }
                                            />
                                        );
                                    })}
                                </svg>
                                <div className="absolute flex size-36 flex-col items-center justify-center rounded-full bg-white text-center shadow-[inset_0_0_0_1px_rgba(148,163,184,0.25)]">
                                    <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                                        {focusedSegment ? focusedSegment.label : "Total Audience"}
                                    </p>
                                    <p className="mt-1 text-2xl font-bold text-slate-800">
                                        {formatNumber(focusedSegment ? focusedSegment.value : totalPieValue)}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {focusedSegment ? `${focusedSegment.normalizedPercent.toFixed(1)}%` : "100%"}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-5 grid w-full max-w-sm grid-cols-1 gap-2">
                                {normalizedPieSegments.map((segment) => {
                                    const isFocused = focusedSegmentLabel === segment.label;
                                    return (
                                        <button
                                            key={segment.label}
                                            type="button"
                                            onMouseEnter={() => setHoveredSegment(segment.label)}
                                            onMouseLeave={() => setHoveredSegment(null)}
                                            onClick={() =>
                                                setSelectedSegment((current) =>
                                                    current === segment.label ? null : segment.label,
                                                )
                                            }
                                            className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left transition-all ${
                                                isFocused
                                                    ? "border-slate-400 bg-slate-100 shadow-sm"
                                                    : "border-slate-200 bg-white hover:border-slate-300"
                                            }`}>
                                            <span className="flex items-center gap-2">
                                                <span
                                                    className="size-3 rounded-full"
                                                    style={{ backgroundColor: segment.color }}
                                                />
                                                <span className="text-sm font-medium text-slate-700">
                                                    {segment.label}
                                                </span>
                                            </span>
                                            <span className="text-xs font-semibold text-slate-600">
                                                {segment.normalizedPercent.toFixed(1)}%
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Customer Responses Table */}
            <div className="card bg-base-100 mt-6 shadow-sm">
                <div className="card-body p-0">
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr className="border-base-200 border-b">
                                    <th className="text-base-content/70 text-sm font-semibold">Customer</th>
                                    <th className="text-base-content/70 text-sm font-semibold">Email</th>
                                    <th className="text-base-content/70 text-sm font-semibold">Status</th>
                                    <th className="text-base-content/70 text-sm font-semibold">Response Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(data.table?.rows || []).map((customer: Customer, index: number) => (
                                    <tr key={index} className="border-base-100 border-b last:border-b-0">
                                        <td className="py-4">
                                            <span className="text-base-content text-base font-medium">
                                                {customer.customer}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <span className="text-base-content/70 text-base">{customer.email}</span>
                                        </td>
                                        <td className="py-4">
                                            <span
                                                className={`inline-block rounded-md px-3 py-1.5 text-sm font-medium ${statusStyles[customer.status] || "bg-gray-100 text-gray-600"}`}>
                                                {customer.status}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <span className="text-base-content/70 text-base">
                                                {customer.responseDate}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="border-base-200 flex items-center justify-between border-t p-4">
                        <p className="text-base-content/60 text-sm">
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
                                    disabled={
                                        (data.pagination?.currentPage || 1) === (data.pagination?.totalPages || 1)
                                    }>
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
