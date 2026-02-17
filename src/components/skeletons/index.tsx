"use client";

import React from "react";

// Base skeleton element with pulse animation
export const Skeleton = ({
    className = "",
    children,
}: {
    className?: string;
    children?: React.ReactNode;
}) => {
    return (
        <div
            className={`animate-pulse rounded bg-base-300 ${className}`}
            aria-hidden="true">
            {children}
        </div>
    );
};

// Dashboard Skeleton - Matches the dashboard layout with cards
export const DashboardSkeleton = () => {
    return (
        <div className="mt-6">
            {/* Top row - Branch stats + Goal status */}
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
                <div className="col-span-1 xl:col-span-3">
                    <Skeleton className="h-[200px] w-full" />
                </div>
                <div className="col-span-1">
                    <Skeleton className="h-[200px] w-full" />
                </div>
            </div>
            {/* Second row - Sales metric + Premium */}
            <div className="mt-5 grid grid-cols-12 gap-5">
                <div className="col-span-12 md:col-span-8 xl:col-span-9">
                    <Skeleton className="h-[300px] w-full" />
                </div>
                <div className="col-span-12 md:col-span-4 xl:col-span-3">
                    <Skeleton className="h-[300px] w-full" />
                </div>
            </div>
            {/* Third row - Social + Customer deals */}
            <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
                <div className="col-span-1">
                    <Skeleton className="h-[250px] w-full" />
                </div>
                <div className="col-span-1">
                    <Skeleton className="h-[250px] w-full" />
                </div>
            </div>
        </div>
    );
};

// Campaign List Skeleton - Table layout
export const CampaignListSkeleton = () => {
    return (
        <div className="mt-6 max-w-7xl">
            {/* Header */}
            <div className="mb-6">
                <Skeleton className="mb-2 h-10 w-64" />
                <Skeleton className="h-5 w-96" />
            </div>
            {/* Table */}
            <div className="card bg-base-100 shadow-sm">
                <div className="card-body p-0">
                    {/* Table header */}
                    <div className="grid grid-cols-6 gap-4 border-b border-base-200 p-4">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-28" />
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-20" />
                    </div>
                    {/* Table rows */}
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="grid grid-cols-6 items-center gap-4 border-b border-base-200 p-4 last:border-b-0">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-6 w-20 rounded-full" />
                            <Skeleton className="h-5 w-28" />
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-5 w-16" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Campaign Detail Skeleton - Preview + stats + pie chart + table
export const CampaignDetailSkeleton = () => {
    return (
        <div className="mt-6 max-w-7xl">
            {/* Header */}
            <div className="mb-6">
                <Skeleton className="mb-2 h-10 w-64" />
                <Skeleton className="h-5 w-96" />
            </div>

            {/* Main content card */}
            <div className="card bg-base-100 shadow-sm">
                <div className="card-body">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Left - Preview + Stats */}
                        <div className="space-y-4">
                            <Skeleton className="aspect-[4/3] w-full rounded-lg" />
                            <div className="grid grid-cols-2 gap-3">
                                <Skeleton className="h-20 w-full rounded-lg" />
                                <Skeleton className="h-20 w-full rounded-lg" />
                                <Skeleton className="h-20 w-full rounded-lg" />
                                <Skeleton className="h-20 w-full rounded-lg" />
                            </div>
                        </div>

                        {/* Middle - Campaign Message */}
                        <div>
                            <Skeleton className="mb-3 h-8 w-48" />
                            <Skeleton className="mb-2 h-4 w-full" />
                            <Skeleton className="mb-2 h-4 w-full" />
                            <Skeleton className="mb-2 h-4 w-3/4" />
                        </div>

                        {/* Right - Pie Chart */}
                        <div className="flex flex-col items-center justify-center">
                            <Skeleton className="size-52 rounded-full" />
                            <div className="mt-4 flex gap-4">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Customer Table */}
            <div className="card mt-6 bg-base-100 shadow-sm">
                <div className="card-body p-0">
                    <div className="grid grid-cols-4 gap-4 border-b border-base-200 p-4">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-28" />
                    </div>
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="grid grid-cols-4 items-center gap-4 border-b border-base-200 p-4 last:border-b-0">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-6 w-20 rounded-full" />
                            <Skeleton className="h-5 w-28" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Catalogue Skeleton - Product grid
export const CatalogueSkeleton = () => {
    return (
        <div className="mt-6 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <Skeleton className="mb-2 h-10 w-96" />
                <Skeleton className="h-5 w-[500px]" />
            </div>

            {/* Controls */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-24 rounded-full" />
                    <Skeleton className="h-10 w-40 rounded-full" />
                    <Skeleton className="h-10 w-28 rounded-full" />
                </div>
                <Skeleton className="h-10 w-48" />
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="card bg-base-100 shadow-sm">
                        <div className="card-body p-0">
                            <Skeleton className="mx-4 mt-4 h-5 w-20" />
                            <Skeleton className="relative mx-4 mt-3 aspect-[4/3] w-full rounded-lg" />
                            <div className="p-4">
                                <Skeleton className="mb-2 h-6 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="mt-1 h-4 w-2/3" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Analytics Skeleton - Charts and metrics
export const AnalyticsSkeleton = () => {
    return (
        <div className="mt-6 max-w-7xl">
            {/* Header */}
            <div className="mb-6">
                <Skeleton className="mb-2 h-10 w-48" />
                <Skeleton className="h-5 w-64" />
            </div>

            {/* KPI Cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-28 w-full rounded-lg" />
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Skeleton className="h-[350px] w-full rounded-lg" />
                <Skeleton className="h-[350px] w-full rounded-lg" />
            </div>
        </div>
    );
};

// Campaign Create Skeleton - Builder form
export const CampaignCreateSkeleton = () => {
    return (
        <div className="mt-6 max-w-7xl">
            {/* Header */}
            <div className="mb-6">
                <Skeleton className="mb-2 h-10 w-64" />
                <Skeleton className="h-5 w-96" />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Left - Form */}
                <div className="space-y-6">
                    {/* Model Selection */}
                    <div className="card bg-base-100 shadow-sm">
                        <div className="card-body">
                            <Skeleton className="mb-4 h-6 w-32" />
                            <div className="flex gap-4">
                                <Skeleton className="h-24 w-24 rounded-lg" />
                                <Skeleton className="h-24 w-24 rounded-lg" />
                                <Skeleton className="h-24 w-24 rounded-lg" />
                            </div>
                        </div>
                    </div>

                    {/* Jewellery Selection */}
                    <div className="card bg-base-100 shadow-sm">
                        <div className="card-body">
                            <Skeleton className="mb-4 h-6 w-40" />
                            <div className="flex gap-4">
                                <Skeleton className="h-24 w-24 rounded-lg" />
                                <Skeleton className="h-24 w-24 rounded-lg" />
                                <Skeleton className="h-24 w-24 rounded-lg" />
                            </div>
                        </div>
                    </div>

                    {/* Message Input */}
                    <div className="card bg-base-100 shadow-sm">
                        <div className="card-body">
                            <Skeleton className="mb-4 h-6 w-40" />
                            <Skeleton className="h-32 w-full rounded-lg" />
                        </div>
                    </div>
                </div>

                {/* Right - Preview */}
                <div>
                    <div className="card bg-base-100 shadow-sm">
                        <div className="card-body">
                            <Skeleton className="mb-4 h-6 w-48" />
                            <Skeleton className="aspect-[4/3] w-full rounded-lg" />
                            <div className="mt-4 space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
