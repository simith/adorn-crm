import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

type CampaignListPayload = {
    campaigns: Array<{
        id: string;
        name: string;
        description: string;
        status: string;
        audience: number;
        updatedAt: string;
    }>;
};

const CAMPAIGN_DETAIL_FILES: Record<string, string> = {
    campaign_1: "campaign_view.json",
    campaign_2: "campaign_view.json",
    campaign_3: "campaign_view.json",
};

export async function GET(
    _request: Request,
    context: { params: Promise<{ campaignId: string }> }
) {
    const { campaignId: rawId } = await context.params;
    const campaignId = decodeURIComponent(rawId ?? "");

    if (!campaignId) {
        return NextResponse.json({ ok: false, error: "Missing campaign id" }, { status: 400 });
    }

    const campaignsPath = path.join(process.cwd(), "data", "campaigns_list.json");
    const campaignsRaw = await readFile(campaignsPath, "utf-8");
    const campaignsPayload = JSON.parse(campaignsRaw) as CampaignListPayload;
    const campaign = campaignsPayload.campaigns.find((item) => item.id === campaignId);

    if (!campaign) {
        return NextResponse.json(
            { ok: false, error: `Unknown campaign id: ${campaignId}` },
            { status: 404 }
        );
    }

    const detailFilename = CAMPAIGN_DETAIL_FILES[campaignId] || "campaign_view.json";
    const detailPath = path.join(process.cwd(), "data", detailFilename);
    const detailRaw = await readFile(detailPath, "utf-8");
    const data = JSON.parse(detailRaw);

    const response = NextResponse.json({ ok: true, campaign, data });
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
}
