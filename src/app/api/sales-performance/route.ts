import { NextResponse } from "next/server";

import { buildSalesPerformanceResponse } from "@/lib/sales-performance";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const response = buildSalesPerformanceResponse({
        startDate: searchParams.get("startDate") ?? undefined,
        endDate: searchParams.get("endDate") ?? undefined,
        salespeople: searchParams
            .get("salespeople")
            ?.split(",")
            .map((value) => value.trim())
            .filter(Boolean),
        region: searchParams.get("region") ?? undefined,
        category: searchParams.get("category") ?? undefined,
        campaign: searchParams.get("campaign") ?? undefined,
    });

    return NextResponse.json(response, {
        headers: {
            "Cache-Control": "no-store, max-age=0",
        },
    });
}
