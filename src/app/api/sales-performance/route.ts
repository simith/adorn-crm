import { NextResponse } from "next/server";

import { buildSalesPerformanceResponse } from "@/lib/sales-performance";

export const dynamic = "force-dynamic";

function withNoStoreHeaders(response: NextResponse) {
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const payload = buildSalesPerformanceResponse({
            dateFrom: searchParams.get("dateFrom") || undefined,
            dateTo: searchParams.get("dateTo") || undefined,
            salespeople: searchParams.getAll("salesperson"),
            region: searchParams.get("region") || undefined,
            category: searchParams.get("category") || undefined,
            campaign: searchParams.get("campaign") || undefined,
        });

        return withNoStoreHeaders(NextResponse.json(payload));
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return withNoStoreHeaders(
            NextResponse.json({ ok: false, error: `Unable to load sales performance data: ${message}` }, { status: 500 }),
        );
    }
}
