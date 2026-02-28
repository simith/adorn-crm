import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const BRANCH_FILES: Record<string, string> = {
    Bangalore: "analytics_bangalore.json",
    Mangaluru: "analytics_mangalore.json",
    Udupi: "analytics_mangalore.json",
    Shivamogga: "analytics_bangalore.json",
    Karkala: "analytics_mangalore.json",
    Kundapur: "analytics_mangalore.json",
    Hebri: "analytics_mangalore.json",
    Byndoor: "analytics_mangalore.json",
    Brahmavar: "analytics_mangalore.json",
    Chikmagalur: "analytics_bangalore.json",
    Padubidri: "analytics_mangalore.json",
    Kumta: "analytics_mangalore.json",
    Belthangady: "analytics_mangalore.json",
    Sagara: "analytics_bangalore.json",
    Thirthahalli: "analytics_bangalore.json",
    Panaji: "analytics_mangalore.json",
};

const BRANCH_ORDER = ["Bangalore", "Mangaluru", "Udupi"] as const;

async function readAnalyticsFile(filename: string) {
    const filePath = path.join(process.cwd(), "data", filename);
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw);
}

function aggregateAllAnalyticsData(allData: any[]) {
    const base = allData[0];

    return {
        favorites: {
            ...base.favorites,
            items: base.favorites.items.map((item: any, index: number) => ({
                ...item,
                reviews: allData.reduce((sum, data) => sum + (data.favorites?.items?.[index]?.reviews || 0), 0),
                likes: allData.reduce((sum, data) => sum + (data.favorites?.items?.[index]?.likes || 0), 0),
                interestPercent: allData.reduce(
                    (sum, data) => sum + (data.favorites?.items?.[index]?.interestPercent || 0),
                    0
                ),
                totalSales: allData.reduce(
                    (sum, data) => sum + (data.favorites?.items?.[index]?.totalSales || 0),
                    0
                ),
                goalPercent: allData.reduce(
                    (sum, data) => sum + (data.favorites?.items?.[index]?.goalPercent || 0),
                    0
                ),
            })),
        },
        dailyTrendingMenus: {
            ...base.dailyTrendingMenus,
            items: base.dailyTrendingMenus.items.map((item: any, index: number) => ({
                ...item,
                price: allData.reduce(
                    (sum, data) => sum + (data.dailyTrendingMenus?.items?.[index]?.price || 0),
                    0
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
                price: allData.reduce((sum, data) => sum + (data.bestSeller?.item?.price || 0), 0),
                likes: allData.reduce((sum, data) => sum + (data.bestSeller?.item?.likes || 0), 0),
                sales: allData.reduce((sum, data) => sum + (data.bestSeller?.item?.sales || 0), 0),
            },
        },
        updatedAt: new Date().toISOString(),
    };
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const branch = searchParams.get("name") || "Bangalore";
    let data;

    if (branch === "All") {
        const allData = await Promise.all(
            BRANCH_ORDER.map((name) => readAnalyticsFile(BRANCH_FILES[name]))
        );
        data = aggregateAllAnalyticsData(allData);
    } else {
        const filename = BRANCH_FILES[branch] || BRANCH_FILES.Bangalore;
        data = await readAnalyticsFile(filename);
    }

    const response = NextResponse.json({ branch, data });
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
}
