import { NextResponse } from "next/server";

import { ALL_BRANCH_ID, DEFAULT_BRANCH_ID, isBranchId } from "@/lib/branch-config";
import { getAllAnalyticsData, getAnalyticsData } from "@/lib/branch-mock-data";

export const dynamic = "force-dynamic";

function aggregateAllAnalyticsData(allData: any[]) {
    const base = allData[0];
    const branchCount = Math.max(allData.length, 1);

    return {
        favorites: {
            ...base.favorites,
            items: base.favorites.items.map((item: any, index: number) => ({
                ...item,
                reviews: allData.reduce((sum, data) => sum + (data.favorites?.items?.[index]?.reviews || 0), 0),
                likes: allData.reduce((sum, data) => sum + (data.favorites?.items?.[index]?.likes || 0), 0),
                interestPercent: Math.round(
                    allData.reduce((sum, data) => sum + (data.favorites?.items?.[index]?.interestPercent || 0), 0) /
                        branchCount
                ),
                totalSales: allData.reduce(
                    (sum, data) => sum + (data.favorites?.items?.[index]?.totalSales || 0),
                    0
                ),
                goalPercent: Math.round(
                    allData.reduce((sum, data) => sum + (data.favorites?.items?.[index]?.goalPercent || 0), 0) /
                        branchCount
                ),
            })),
        },
        dailyTrendingMenus: {
            ...base.dailyTrendingMenus,
            items: base.dailyTrendingMenus.items.map((item: any, index: number) => ({
                ...item,
                price: Math.round(
                    allData.reduce((sum, data) => sum + (data.dailyTrendingMenus?.items?.[index]?.price || 0), 0) /
                        branchCount
                ),
                orders: allData.reduce(
                    (sum, data) => sum + (data.dailyTrendingMenus?.items?.[index]?.orders || 0),
                    0
                ),
            })),
        },
        salesSummary: {
            ...base.salesSummary,
            metrics: base.salesSummary.metrics.map((metric: any, index: number) => ({
                ...metric,
                value: allData.reduce(
                    (sum, data) => sum + (data.salesSummary?.metrics?.[index]?.value || 0),
                    0
                ),
            })),
        },
        loyalCustomers: {
            ...base.loyalCustomers,
            customers: base.loyalCustomers.customers.map((customer: any, index: number) => ({
                ...customer,
                orders: allData.reduce(
                    (sum, data) => sum + (data.loyalCustomers?.customers?.[index]?.orders || 0),
                    0
                ),
            })),
        },
        bestSeller: {
            ...base.bestSeller,
            item: {
                ...base.bestSeller.item,
                price: Math.round(
                    allData.reduce((sum, data) => sum + (data.bestSeller?.item?.price || 0), 0) / branchCount
                ),
                likes: allData.reduce((sum, data) => sum + (data.bestSeller?.item?.likes || 0), 0),
                sales: allData.reduce((sum, data) => sum + (data.bestSeller?.item?.sales || 0), 0),
            },
        },
        updatedAt: new Date().toISOString(),
    };
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const requestedBranch = searchParams.get("name") || DEFAULT_BRANCH_ID;
    const branch = isBranchId(requestedBranch) ? requestedBranch : DEFAULT_BRANCH_ID;
    let data;

    if (branch === ALL_BRANCH_ID) {
        const allData = await getAllAnalyticsData();
        data = aggregateAllAnalyticsData(allData);
    } else {
        data = await getAnalyticsData(branch);
    }

    const response = NextResponse.json({ branch, data });
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
}
