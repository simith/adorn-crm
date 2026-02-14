import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const BRANCH_FILES: Record<string, string> = {
    Bangalore: "branch_bangalore.json",
    Mangalore: "branch_mangalore.json",
    Chennai: "branch_chennai.json",
};

const BRANCH_ORDER = ["Bangalore", "Mangalore", "Chennai"] as const;

async function readBranchFile(filename: string) {
    const filePath = path.join(process.cwd(), "data", filename);
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw);
}

function aggregateAllBranchData(allData: any[]) {
    const base = allData[0];

    return {
        kpis: base.kpis.map((kpi: any, index: number) => ({
            ...kpi,
            value: allData.reduce((sum, item) => sum + (item.kpis[index]?.value || 0), 0),
            changePercent: Number(
                allData.reduce((sum, item) => sum + (item.kpis[index]?.changePercent || 0), 0).toFixed(1)
            ),
        })),
        monthlyTarget: {
            ...base.monthlyTarget,
            percent: allData.reduce((sum, item) => sum + (item.monthlyTarget?.percent || 0), 0),
        },
        activeMembers: {
            count: allData.reduce((sum, item) => sum + (item.activeMembers?.count || 0), 0),
            changePercent: Number(
                allData.reduce((sum, item) => sum + (item.activeMembers?.changePercent || 0), 0).toFixed(1)
            ),
        },
        uniqueVisitors: {
            labels: base.uniqueVisitors.labels,
            series: base.uniqueVisitors.series.map((series: any, seriesIndex: number) => ({
                ...series,
                values: series.values.map((_: number, valueIndex: number) =>
                    allData.reduce(
                        (sum, item) =>
                            sum + (item.uniqueVisitors?.series?.[seriesIndex]?.values?.[valueIndex] || 0),
                        0
                    )
                ),
            })),
        },
        newJoinMembers: base.newJoinMembers,
        latestTransactions: base.latestTransactions.map((transaction: any, index: number) => ({
            ...transaction,
            amount: Number(
                allData
                    .reduce((sum, item) => sum + (item.latestTransactions?.[index]?.amount || 0), 0)
                    .toFixed(1)
            ),
        })),
        updatedAt: new Date().toISOString(),
    };
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const branch = searchParams.get("name") || "Bangalore";
    let data;

    if (branch === "All") {
        const allData = await Promise.all(
            BRANCH_ORDER.map((name) => readBranchFile(BRANCH_FILES[name]))
        );
        data = aggregateAllBranchData(allData);
    } else {
        const filename = BRANCH_FILES[branch] || BRANCH_FILES.Bangalore;
        data = await readBranchFile(filename);
    }

    const response = NextResponse.json({ branch, data });
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
}
