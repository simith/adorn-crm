import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const CUSTOMER_LIST_FILES: Record<string, string> = {
    customer_list_1: "campaign_create.json",
    customer_list_2: "campaign_create_visiting_last_7_days.json",
    customer_list_3: "campaign_create_bought_necklace_last_1_month.json",
    customer_list_4: "campaign_create_bought_more_than_1_lakh_last_6_months.json",
    ai_search_list: "ai_search_list.json",
};

export async function GET(
    request: Request,
    context: { params: Promise<{ listId: string }> }
) {
    const { listId } = await context.params;
    const filename = CUSTOMER_LIST_FILES[listId];

    if (!filename) {
        return NextResponse.json(
            { ok: false, error: `Unknown customer list id: ${listId}` },
            { status: 404 }
        );
    }

    const filePath = path.join(process.cwd(), "data", filename);
    const raw = await readFile(filePath, "utf-8");
    const data = JSON.parse(raw);
    const searchQuery = new URL(request.url).searchParams.get("q") || "";

    if (listId === "ai_search_list" && searchQuery.trim()) {
        data.query.placeholder = searchQuery.trim();
    }

    const response = NextResponse.json({ ok: true, listId, query: searchQuery, data });
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
}
