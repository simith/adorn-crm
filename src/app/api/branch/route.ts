import { NextResponse } from "next/server";

import { ALL_BRANCH_ID, DEFAULT_BRANCH_ID, isBranchId } from "@/lib/branch-config";
import { getAllBranchDashboardData, getBranchDashboardData } from "@/lib/branch-mock-data";

export const dynamic = "force-dynamic";

function aggregateAllBranchData(allData: any[]) {
    const base = allData[0];
    const branchCount = Math.max(allData.length, 1);

    return {
        kpis: base.kpis.map((kpi: any, index: number) => ({
            ...kpi,
            value: allData.reduce((sum, item) => sum + (item.kpis[index]?.value || 0), 0),
            changePercent: Number(
                (
                    allData.reduce((sum, item) => sum + (item.kpis[index]?.changePercent || 0), 0) / branchCount
                ).toFixed(1)
            ),
        })),
        monthlyTarget: {
            ...base.monthlyTarget,
            percent: Math.round(allData.reduce((sum, item) => sum + (item.monthlyTarget?.percent || 0), 0) / branchCount),
        },
        activeMembers: {
            count: allData.reduce((sum, item) => sum + (item.activeMembers?.count || 0), 0),
            changePercent: Number(
                (
                    allData.reduce((sum, item) => sum + (item.activeMembers?.changePercent || 0), 0) / branchCount
                ).toFixed(1)
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
    const requestedBranch = searchParams.get("name") || DEFAULT_BRANCH_ID;
    const branch = isBranchId(requestedBranch) ? requestedBranch : DEFAULT_BRANCH_ID;
    let data;

    if (branch === ALL_BRANCH_ID) {
        const allData = await getAllBranchDashboardData();
        data = aggregateAllBranchData(allData);
    } else {
        data = await getBranchDashboardData(branch);
    }

    const response = NextResponse.json({ branch, data });
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
}
