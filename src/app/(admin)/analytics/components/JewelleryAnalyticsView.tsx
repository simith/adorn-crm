"use client";

import { AnalyticsSkeleton } from "@/components/skeletons";
import { useEffect, useState } from "react";

import { useBranch } from "@/contexts/branch";

import { BestSellerCard, type BestSellerData } from "./BestSellerCard";
import { DailyTrendingPieces, type TrendingItem } from "./DailyTrendingPieces";
import { LoyalCustomersCard, type LoyalCustomersData } from "./LoyalCustomersCard";
import { MostFavoritePieces, type FavoriteItem } from "./MostFavoritePieces";
import { SalesSummaryCard, type SalesSummaryData } from "./SalesSummaryCard";

type AnalyticsData = {
    favorites: { items: FavoriteItem[] };
    dailyTrendingMenus: { items: TrendingItem[] };
    salesSummary?: SalesSummaryData;
    loyalCustomers?: LoyalCustomersData;
    bestSeller?: BestSellerData;
};

export const JewelleryAnalyticsView = () => {
    const { branch } = useBranch();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        setLoading(true);
        setError(false);
        const params = new URLSearchParams({ name: branch });
        fetch(`/api/analytics?${params}`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load");
                return res.json();
            })
            .then((body) => {
                const d = body.data as AnalyticsData;
                if (d?.favorites?.items && d?.dailyTrendingMenus?.items) setData(d);
                else setError(true);
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, [branch]);

    if (loading) {
        return <AnalyticsSkeleton />;
    }

    if (error || !data) {
        return (
            <div className="mt-6">
                <p className="text-sm uppercase tracking-wide text-base-content/50">Insights</p>
                <h1 className="mt-1 text-2xl font-bold text-base-content md:text-3xl">Jewellery Analytics</h1>
                <div className="mt-6 rounded-box border border-base-300 bg-base-200/40 p-6 text-center text-base-content/70">
                    Could not load analytics. Ensure branch data is available.
                </div>
            </div>
        );
    }

    const favorites = data.favorites?.items ?? [];
    const trending = data.dailyTrendingMenus?.items ?? [];
    const salesSummary = data.salesSummary;
    const loyalCustomers = data.loyalCustomers;
    const bestSeller = data.bestSeller;

    return (
        <div className="mt-6">
            <p className="text-sm uppercase tracking-wide text-base-content/50">Insights</p>
            <h1 className="mt-1 text-2xl font-bold text-base-content md:text-3xl">Jewellery Analytics</h1>
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="lg:col-span-7">
                    <MostFavoritePieces items={favorites} />
                </div>
                <div className="lg:col-span-5">
                    <DailyTrendingPieces items={trending} />
                </div>
            </div>
            {salesSummary?.metrics?.length ? (
                <div className="mt-6">
                    <SalesSummaryCard data={salesSummary} />
                </div>
            ) : null}
            {(loyalCustomers?.customers?.length || bestSeller?.item) ? (
                <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
                    {loyalCustomers?.customers?.length ? (
                        <LoyalCustomersCard data={loyalCustomers} />
                    ) : null}
                    {bestSeller?.item ? (
                        <BestSellerCard data={bestSeller} />
                    ) : null}
                </div>
            ) : null}
        </div>
    );
};
